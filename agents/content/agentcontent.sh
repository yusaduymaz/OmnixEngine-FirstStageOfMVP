#!/usr/bin/env bash
# =============================================================================
# agentcontent.sh — Content Agent Full Source Viewer
# =============================================================================
# Usage:
#   bash agentcontent.sh                  → Print all files
#   bash agentcontent.sh generate.skill   → Print only matching files
#   bash agentcontent.sh types            → Print only type definition files
#   bash agentcontent.sh scrape           → Print only the scrape utility
# =============================================================================

FILTER="${1:-}"

# ── ANSI Colors ──────────────────────────────────────────────────────────────
BOLD="\033[1m"
CYAN="\033[36m"
YELLOW="\033[33m"
GREEN="\033[32m"
RESET="\033[0m"

print_header() {
  echo ""
  echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${BOLD}${CYAN}║         Content Agent — Full Source Viewer                  ║${RESET}"
  echo -e "${BOLD}${CYAN}║         OmniX Engine · agents/content/                      ║${RESET}"
  echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
}

print_section() {
  local label="$1"
  local path="$2"
  local content="$3"

  # Apply filter if provided
  if [[ -n "$FILTER" ]] && [[ "$path" != *"$FILTER"* ]] && [[ "$label" != *"$FILTER"* ]]; then
    return
  fi

  echo -e "${BOLD}${YELLOW}┌──────────────────────────────────────────────────────────────┐${RESET}"
  echo -e "${BOLD}${YELLOW}│  FILE: ${GREEN}${path}${RESET}"
  echo -e "${BOLD}${YELLOW}└──────────────────────────────────────────────────────────────┘${RESET}"
  echo "$content"
  echo ""
}

# =============================================================================
# FILE CONTENTS — Embedded at generation time
# =============================================================================

read -r -d '' TYPES_GENERATE_TYPES << 'ENDOFFILE'
import type { PlatformId, Tone } from '@/prompts/system'

export interface GenerateSkillInput {
  userId: string
  productName: string
  category?: string
  language?: 'tr' | 'en'
  country?: 'TR' | 'US' | 'UK' | 'DE' | 'FR' | 'IT' | 'ES'
  platforms: PlatformId[]
  tone: Tone
  extraKeywords?: string
}

export interface SupabaseUserRow {
  id: string
  credits_used: number
  credits_limit: number
  plan: string
}

export interface ParsedTitle {
  text: string
  platform: string
  char_count: number
  variant?: string
  seo_keywords_used?: string[]
}

export type ExtractedJSON = Record<string, unknown> | null
ENDOFFILE

read -r -d '' TYPES_ANALYZE_TYPES << 'ENDOFFILE'
import type { PlatformId } from '@/prompts/system'

export interface AnalyzeSkillInput {
  userId: string
  url: string
  platforms: PlatformId[]
}

export type CriteriaStatus = 'pass' | 'warn' | 'fail'

export interface CriteriaScore {
  score: number
  status: CriteriaStatus
  message: string
  suggestion?: string
  currentValue?: string
}

export interface AnalysisResult {
  overallScore: number
  criteriaScores: {
    titleQuality: CriteriaScore
    descriptionDepth: CriteriaScore
    keywordDensity: CriteriaScore
    platformRules: CriteriaScore
  }
  scrapedData?: {
    title: string
    description: string
    content: string
  }
}
ENDOFFILE

read -r -d '' TYPES_CONVERT_TYPES << 'ENDOFFILE'
import type { PlatformId } from '@/prompts/system'

export interface ConvertSkillInput {
  userId: string
  sourceUrl?: string
  sourceText?: string
  sourcePlatform?: PlatformId | string
  targetPlatforms: PlatformId[]
}

export interface ConvertedPlatformResult {
  platform: PlatformId
  title: string
  description: string
}

export interface ConvertResult {
  results: ConvertedPlatformResult[]
  scrapedData?: {
    title: string
    description: string
    content: string
  }
}
ENDOFFILE

read -r -d '' UTILS_SCRAPE << 'ENDOFFILE'
import * as cheerio from 'cheerio'

export async function scrapeUrl(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    $('script, style, noscript, iframe, svg, img, video, audio').remove()

    const title = $('title').text().trim() || $('h1').first().text().trim()
    const description = $('meta[name="description"]').attr('content')?.trim() || ''

    const content = $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000)

    return { title, description, content }
  } catch (err) {
    console.error('[Scrape] Scraping error:', err)
    throw new Error('URL content could not be retrieved. Please enter a valid and accessible page link.')
  }
}
ENDOFFILE

read -r -d '' SKILLS_GENERATE_SKILL << 'ENDOFFILE'
/**
 * Content Agent — Generate Skill
 *
 * Responsibilities:
 *  1. Credit check against Supabase users table
 *  2. Building system + user prompts
 *  3. OpenRouter (Plan A) → Groq (Plan B) streaming calls
 *  4. JSON parsing via extractFirstJSON strategies
 *  5. Saving to Supabase generations table + credit deduction
 *
 * This file does NOT handle API concerns:
 *  Auth, HTTP parsing, Zod validation → handled in route.ts
 */

import { currentUser } from '@clerk/nextjs/server'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import Groq from 'groq-sdk'
import { buildSystemPrompt, buildUserMessage, type Tone, type PlatformId } from '@/prompts/system'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import type { GenerateSkillInput, SupabaseUserRow, ParsedTitle, ExtractedJSON } from '../types/generate.types'

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: JSON EXTRACTION STRATEGIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely extracts JSON from AI output.
 *
 * Strategy (tried in order):
 *  1. indexOf/lastIndexOf to slice the { } block — most reliable
 *  2. Strip markdown (```json ... ```) and retry
 *  3. Fix trailing commas and try one last time
 */
function extractFirstJSON(rawText: string): ExtractedJSON {
  const attempt = (text: string): ExtractedJSON => {
    const startIndex = text.indexOf('{')
    const endIndex = text.lastIndexOf('}')
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return null
    const jsonString = text.substring(startIndex, endIndex + 1)
    try {
      const parsed = JSON.parse(jsonString)
      if (typeof parsed === 'object' && parsed !== null) return parsed as Record<string, unknown>
      return null
    } catch { return null }
  }

  const attemptWithClean = (text: string): ExtractedJSON => {
    const startIndex = text.indexOf('{')
    const endIndex = text.lastIndexOf('}')
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return null
    const jsonString = text
      .substring(startIndex, endIndex + 1)
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
    try {
      const parsed = JSON.parse(jsonString)
      if (typeof parsed === 'object' && parsed !== null) return parsed as Record<string, unknown>
      return null
    } catch { return null }
  }

  const r1 = attempt(rawText)
  if (r1) return r1

  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const r2 = attempt(cleaned)
  if (r2) return r2

  return attemptWithClean(cleaned)
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: USER & CREDIT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

async function resolveUser(userId: string, supabase: ReturnType<typeof getSupabaseAdmin>): Promise<SupabaseUserRow> {
  const { data: user } = await supabase
    .from('users')
    .select('id, credits_used, credits_limit, plan')
    .eq('clerk_id', userId)
    .single()

  if (user) return user as SupabaseUserRow

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? ''
  const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ')

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ clerk_id: userId, email, full_name: fullName || email, plan: 'free', credits_limit: 50, credits_used: 0 })
    .select('id, credits_used, credits_limit, plan')
    .single()

  if (error || !newUser) throw new GenerateSkillError('Account could not be created.', 500)
  return newUser as SupabaseUserRow
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: AI MODEL CALLS (Streaming)
// ─────────────────────────────────────────────────────────────────────────────

async function tryOpenRouterStream(
  systemPrompt: string, userMessage: string,
  controller: ReadableStreamDefaultController, encoder: TextEncoder, startTime: number,
): Promise<{ fullText: string; inputTokens: number; outputTokens: number; modelUsed: string } | null> {
  const openrouterKey = process.env.OPENROUTER_API_KEY
  if (!openrouterKey) return null
  try {
    const openrouterProvider = createOpenAI({ apiKey: openrouterKey, baseURL: 'https://openrouter.ai/api/v1' })
    let fullText = ''
    const result = streamText({ model: openrouterProvider('openrouter/free'), system: systemPrompt, messages: [{ role: 'user', content: userMessage }], temperature: 0.7 })
    for await (const chunk of result.textStream) { fullText += chunk; controller.enqueue(encoder.encode('.')) }
    const usage = await result.usage
    const inputTokens = (usage as any)?.promptTokens ?? 0
    const outputTokens = (usage as any)?.completionTokens ?? 0
    return { fullText, inputTokens, outputTokens, modelUsed: 'openrouter/free (OpenRouter)' }
  } catch { return null }
}

async function tryGroqStream(
  systemPrompt: string, userMessage: string,
  controller: ReadableStreamDefaultController, encoder: TextEncoder, startTime: number,
): Promise<{ fullText: string; inputTokens: number; outputTokens: number; modelUsed: string }> {
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) throw new Error('Groq API key missing.')
  const groq = new Groq({ apiKey: groqKey })
  let fullText = ''
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile', max_tokens: 22000,
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
    temperature: 0.7, stream: true,
  })
  for await (const chunk of response) {
    const content = chunk.choices[0]?.delta?.content
    if (content) { fullText += content; controller.enqueue(encoder.encode('.')) }
  }
  return { fullText, inputTokens: 0, outputTokens: Math.ceil(fullText.length / 4), modelUsed: 'llama-3.3-70b-versatile (Groq)' }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: DATABASE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

async function saveGenerationAndDeductCredit(params: {
  supabase: ReturnType<typeof getSupabaseAdmin>; user: SupabaseUserRow; input: GenerateSkillInput
  parsedResult: ExtractedJSON; inputTokens: number; outputTokens: number; modelUsed: string; startTime: number
}): Promise<void> {
  const { supabase, user, input, parsedResult, inputTokens, outputTokens, modelUsed, startTime } = params
  const seoScore = typeof parsedResult?.seo_score === 'number' ? parsedResult.seo_score : null
  await supabase.from('generations').insert({
    user_id: user.id, product_name: input.productName, category_path: input.category ?? null,
    platform: input.platforms, content_types: ['title', 'description', 'ad_copy'], tone: input.tone,
    extra_keywords: input.extraKeywords ? input.extraKeywords.split(',').map((k) => k.trim()) : [],
    results: parsedResult ?? null, seo_score: seoScore, tokens_used: inputTokens + outputTokens,
    model_used: modelUsed, generation_ms: Date.now() - startTime, status: parsedResult ? 'completed' : 'failed',
  })
  await supabase.from('users').update({ credits_used: user.credits_used + 1 }).eq('id', user.id)
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: ERROR CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class GenerateSkillError extends Error {
  constructor(message: string, public readonly statusCode: number = 500) {
    super(message)
    this.name = 'GenerateSkillError'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: MAIN SKILL FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Content generation skill — the core capability of the Content Agent.
 *
 * Called by route.ts. The returned ReadableStream is piped directly as HTTP response.
 * Stream protocol: "." = progress, "__RESULT__:" = final JSON, "__ERROR__:" = error
 */
export async function generateSkill(input: GenerateSkillInput): Promise<ReadableStream> {
  const startTime = Date.now()
  const supabase = getSupabaseAdmin()
  const user = await resolveUser(input.userId, supabase)

  if (user.credits_limit - user.credits_used <= 0) throw new GenerateSkillError('Credits exhausted.', 403)

  const systemPrompt = buildSystemPrompt({ platforms: input.platforms, tone: input.tone as Tone, category: input.category, language: input.language, country: input.country, extraRules: input.extraKeywords })
  const userMessage = buildUserMessage({ productName: input.productName, category: input.category, platforms: input.platforms, tone: input.tone as Tone, language: input.language, country: input.country, extraKeywords: input.extraKeywords })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = ''
      let modelUsed = 'unknown'
      let inputTokens = 0
      let outputTokens = 0

      // Plan A: OpenRouter
      const openrouterResult = await tryOpenRouterStream(systemPrompt, userMessage, controller, encoder, startTime)
      if (openrouterResult) {
        fullText = openrouterResult.fullText; inputTokens = openrouterResult.inputTokens
        outputTokens = openrouterResult.outputTokens; modelUsed = openrouterResult.modelUsed
      }

      // Plan B: Groq
      if (!openrouterResult) {
        try {
          const groqResult = await tryGroqStream(systemPrompt, userMessage, controller, encoder, startTime)
          fullText = groqResult.fullText; inputTokens = groqResult.inputTokens
          outputTokens = groqResult.outputTokens; modelUsed = groqResult.modelUsed
        } catch {
          controller.enqueue(encoder.encode('__ERROR__:All AI services failed. Please try again.'))
          controller.close()
          return
        }
      }

      if (!fullText) {
        controller.enqueue(encoder.encode('__ERROR__:Content service is currently unavailable.'))
        controller.close()
        return
      }

      const parsedResult = extractFirstJSON(fullText)
      if (parsedResult) {
        if (Array.isArray(parsedResult.titles)) {
          parsedResult.titles = (parsedResult.titles as ParsedTitle[]).map((t) => ({ ...t, char_count: t.text?.length ?? 0 }))
        }
        controller.enqueue(encoder.encode('\n__RESULT__:' + JSON.stringify(parsedResult)))
      } else {
        controller.enqueue(encoder.encode('\n__ERROR__:Content generated but format could not be parsed. Please try again.'))
      }

      controller.close()

      await saveGenerationAndDeductCredit({ supabase, user, input, parsedResult, inputTokens, outputTokens, modelUsed, startTime })
    },
  })

  return stream
}
ENDOFFILE

read -r -d '' SKILLS_ANALYZE_SKILL << 'ENDOFFILE'
/**
 * Content Agent — Analyze Skill
 */
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import Groq from 'groq-sdk'
import { z } from 'zod'
import type { AnalyzeSkillInput, AnalysisResult } from '../types/analyze.types'
import { buildSystemPrompt, Tone } from '@/prompts/system'
import { scrapeUrl } from '../utils/scrape'

export class AnalyzeSkillError extends Error {
  constructor(message: string, public readonly statusCode: number = 500) {
    super(message)
    this.name = 'AnalyzeSkillError'
  }
}

async function safeScrapeUrl(url: string) {
  try { return await scrapeUrl(url) }
  catch (err: any) { throw new AnalyzeSkillError(err.message, 400) }
}

async function resolveUser(userId: string, supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data: user } = await supabase
    .from('users').select('id, credits_used, credits_limit, plan').eq('clerk_id', userId).single()
  if (user) return user

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? ''
  const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ')

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ clerk_id: userId, email, full_name: fullName || email, plan: 'free', credits_limit: 50, credits_used: 0 })
    .select('id, credits_used, credits_limit, plan').single()

  if (error || !newUser) throw new AnalyzeSkillError('Account information could not be retrieved.', 500)
  return newUser
}

export async function analyzeSkill(input: AnalyzeSkillInput): Promise<AnalysisResult> {
  const startTime = Date.now()
  const supabase = getSupabaseAdmin()
  const user = await resolveUser(input.userId, supabase)

  if (user.credits_limit - user.credits_used <= 0) throw new AnalyzeSkillError('Credits exhausted.', 403)

  const scrapedData = await safeScrapeUrl(input.url)
  if (!scrapedData.title && !scrapedData.description && !scrapedData.content) {
    throw new AnalyzeSkillError('No content could be extracted from the page. It may be empty.', 400)
  }

  const systemPrompt = buildSystemPrompt({ platforms: input.platforms, tone: 'professional' as Tone })

  const prompt = `
Analyze the following e-commerce product page content. Evaluate it according to the rules of the target platforms (${input.platforms.join(', ')}).

Product Page Data:
- Title/H1: ${scrapedData.title}
- Meta Description: ${scrapedData.description}
- Page Content (summary): ${scrapedData.content.slice(0, 3000)}

Please examine this content according to the following criteria and provide a score (0-100), status (pass, warn, fail), message, and improvement suggestion for each:
1. Title Quality (Length, keyword usage, clarity)
2. Description Depth (Information richness, benefit focus, gaps)
3. Keyword Density (Sufficient for SEO?)
4. Platform Rule Compliance (Forbidden words, length limits, etc. for selected platforms)

Also calculate an overall SEO score (0-100).

RESPONSE FORMAT (JSON only):
{
  "overallScore": 85,
  "criteriaScores": {
    "titleQuality": { "score": 90, "status": "pass", "message": "...", "suggestion": "...", "currentValue": "..." },
    "descriptionDepth": { "score": 70, "status": "warn", "message": "...", "suggestion": "...", "currentValue": "..." },
    "keywordDensity": { "score": 80, "status": "pass", "message": "...", "suggestion": "..." },
    "platformRules": { "score": 95, "status": "pass", "message": "...", "suggestion": "..." }
  }
}
`

  const openrouterKey = process.env.OPENROUTER_API_KEY
  const groqKey = process.env.GROQ_API_KEY
  if (!openrouterKey && !groqKey) throw new AnalyzeSkillError('AI service not configured (missing keys).', 500)

  let resultObject: any = null
  let tokensUsed = 0
  let modelUsed = 'openrouter/free'

  const schema = z.object({
    overallScore: z.number().min(0).max(100),
    criteriaScores: z.object({
      titleQuality: z.object({ score: z.number().min(0).max(100), status: z.enum(['pass', 'warn', 'fail']), message: z.string(), suggestion: z.string().optional(), currentValue: z.string().optional() }),
      descriptionDepth: z.object({ score: z.number().min(0).max(100), status: z.enum(['pass', 'warn', 'fail']), message: z.string(), suggestion: z.string().optional(), currentValue: z.string().optional() }),
      keywordDensity: z.object({ score: z.number().min(0).max(100), status: z.enum(['pass', 'warn', 'fail']), message: z.string(), suggestion: z.string().optional() }),
      platformRules: z.object({ score: z.number().min(0).max(100), status: z.enum(['pass', 'warn', 'fail']), message: z.string(), suggestion: z.string().optional() })
    })
  })

  try {
    if (!openrouterKey) throw new Error('OpenRouter key missing, skip to Groq')
    const openrouter = createOpenAI({ apiKey: openrouterKey, baseURL: 'https://openrouter.ai/api/v1' })
    const { object, usage } = await generateObject({ model: openrouter('openrouter/free'), schema, system: systemPrompt, prompt, temperature: 0.3 })
    resultObject = object
    tokensUsed = ((usage as any).promptTokens ?? 0) + ((usage as any).completionTokens ?? 0)
  } catch (openrouterErr: any) {
    try {
      if (!groqKey) throw new AnalyzeSkillError('Groq API key not configured.', 500)
      const groq = new Groq({ apiKey: groqKey })
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', max_tokens: 1500,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
        temperature: 0.3,
      })
      const responseContent = response.choices[0]?.message?.content
      if (!responseContent) throw new Error('Groq response was empty.')
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in Groq response.')
      resultObject = JSON.parse(jsonMatch[0])
      tokensUsed = response.usage?.total_tokens ?? 0
      modelUsed = 'llama-3.3-70b-versatile (Groq)'
    } catch (groqErr: any) {
      const errString = groqErr?.message || String(groqErr)
      if (errString.includes('credit balance is too low') || errString.includes('quota')) {
        throw new AnalyzeSkillError('AI API credits insufficient or quota exceeded.', 402)
      }
      throw new AnalyzeSkillError('All AI services (OpenRouter and Groq) failed during content analysis.', 500)
    }
  }

  const finalResult: AnalysisResult = { ...resultObject, scrapedData }

  Promise.all([
    supabase.from('analyses').insert({
      user_id: user.id, source_url: input.url, target_platform: input.platforms,
      scraped_data: scrapedData as unknown as Record<string, unknown>,
      overall_score: finalResult.overallScore, criteria_scores: finalResult.criteriaScores as unknown as Record<string, unknown>,
      suggestions: null, analysis_ms: Date.now() - startTime, credits_charged: 1
    }),
    supabase.from('users').update({ credits_used: user.credits_used + 1 }).eq('id', user.id)
  ]).catch(err => console.error('[Analyze] DB save/credit deduction error:', err))

  return finalResult
}
ENDOFFILE

read -r -d '' SKILLS_CONVERT_SKILL << 'ENDOFFILE'
/**
 * Content Agent — Convert Skill
 */
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import Groq from 'groq-sdk'
import { z } from 'zod'
import { scrapeUrl } from '../utils/scrape'
import type { ConvertSkillInput, ConvertResult } from '../types/convert.types'
import { buildSystemPrompt, Tone, PLATFORM_LABELS, type PlatformId } from '@/prompts/system'

export class ConvertSkillError extends Error {
  constructor(message: string, public readonly statusCode: number = 500) {
    super(message)
    this.name = 'ConvertSkillError'
  }
}

async function safeScrapeUrl(url: string) {
  try { return await scrapeUrl(url) }
  catch (err: any) { throw new ConvertSkillError(err.message, 400) }
}

async function resolveUser(userId: string, supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data: user } = await supabase
    .from('users').select('id, credits_used, credits_limit, plan').eq('clerk_id', userId).single()
  if (user) return user

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? ''
  const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ')

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ clerk_id: userId, email, full_name: fullName || email, plan: 'free', credits_limit: 50, credits_used: 0 })
    .select('id, credits_used, credits_limit, plan').single()

  if (error || !newUser) throw new ConvertSkillError('Account information could not be retrieved.', 500)
  return newUser
}

export async function convertSkill(input: ConvertSkillInput): Promise<ConvertResult> {
  const startTime = Date.now()
  const supabase = getSupabaseAdmin()
  const user = await resolveUser(input.userId, supabase)

  if (user.credits_limit - user.credits_used <= 0) throw new ConvertSkillError('Credits exhausted.', 403)

  let sourceContentToProcess = ''
  let scrapedData: { title: string; description: string; content: string } | undefined

  if (input.sourceUrl) {
    scrapedData = await safeScrapeUrl(input.sourceUrl)
    sourceContentToProcess = `Title: ${scrapedData.title}\nDescription: ${scrapedData.description}\nContent: ${scrapedData.content}`
  } else if (input.sourceText) {
    sourceContentToProcess = input.sourceText
  } else {
    throw new ConvertSkillError('Source URL or text must be provided.', 400)
  }

  const targetPlatformLabels = input.targetPlatforms.map(p => PLATFORM_LABELS[p] || p).join(', ')
  const sourceLabel = input.sourcePlatform ? (PLATFORM_LABELS[input.sourcePlatform as PlatformId] || input.sourcePlatform) : 'Unknown'
  const systemPrompt = buildSystemPrompt({ platforms: input.targetPlatforms, tone: 'professional' as Tone })

  const prompt = `
Take the product content below from the source platform (${sourceLabel}) and CONVERT (REWRITE) it according to the SEO and content rules of these target platforms (${targetPlatformLabels}).

Original Content:
---
${sourceContentToProcess.slice(0, 4000)}
---

Task:
For each target platform:
- Fully comply with the rules (character limits, forbidden words, bullet point requirements, etc.)
- Write a new Title and Description.
(Do NOT use HTML tags, use plain text and bullet points (-).)

RESPONSE FORMAT (JSON only):
{
  "results": [
    {
      "platform": "platform_id",
      "title": "new title",
      "description": "new description"
    }
  ]
}
`

  const openrouterKey = process.env.OPENROUTER_API_KEY
  const groqKey = process.env.GROQ_API_KEY
  if (!openrouterKey && !groqKey) throw new ConvertSkillError('AI service not configured (missing keys).', 500)

  let resultObject: any = null
  let tokensUsed = 0
  let modelUsed = 'openrouter/free'

  const schema = z.object({
    results: z.array(z.object({
      platform: z.enum(input.targetPlatforms as [string, ...string[]]),
      title: z.string(),
      description: z.string()
    }))
  })

  try {
    if (!openrouterKey) throw new Error('OpenRouter key missing, skip to Groq')
    const openrouter = createOpenAI({ apiKey: openrouterKey, baseURL: 'https://openrouter.ai/api/v1' })
    const { object, usage } = await generateObject({ model: openrouter('openrouter/free'), schema, system: systemPrompt, prompt, temperature: 0.6 })
    resultObject = object
    tokensUsed = ((usage as any).promptTokens ?? 0) + ((usage as any).completionTokens ?? 0)
  } catch (openrouterErr: any) {
    try {
      if (!groqKey) throw new ConvertSkillError('Groq API key not configured.', 500)
      const groq = new Groq({ apiKey: groqKey })
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', max_tokens: 1500,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
        temperature: 0.6,
      })
      const responseContent = response.choices[0]?.message?.content
      if (!responseContent) throw new Error('Groq response was empty.')
      const jsonMatch = responseContent.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
      if (!jsonMatch) throw new Error('No JSON found in Groq response.')
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed)) resultObject = { results: parsed }
      else if (parsed && parsed.results) resultObject = parsed
      else resultObject = { results: [parsed] }
      tokensUsed = response.usage?.total_tokens ?? 0
      modelUsed = 'llama-3.3-70b-versatile (Groq)'
    } catch (groqErr: any) {
      const errString = groqErr?.message || String(groqErr)
      if (errString.includes('credit balance is too low') || errString.includes('quota')) {
        throw new ConvertSkillError('AI API credits insufficient or quota exceeded.', 402)
      }
      throw new ConvertSkillError('All AI services (OpenRouter and Groq) failed during content conversion.', 500)
    }
  }

  if (!resultObject || !resultObject.results || !Array.isArray(resultObject.results)) {
    resultObject = { results: [] }
  }

  const finalResult: ConvertResult = { results: resultObject.results, scrapedData }

  Promise.all([
    supabase.from('generations').insert({
      user_id: user.id, product_name: scrapedData?.title || 'Converter - Unknown Product',
      platform: input.targetPlatforms, content_types: ['converter'], tone: 'professional',
      results: finalResult as unknown as Record<string, unknown>, tokens_used: tokensUsed,
      model_used: modelUsed, generation_ms: Date.now() - startTime, status: 'completed',
    }),
    supabase.from('users').update({ credits_used: user.credits_used + 1 }).eq('id', user.id)
  ]).catch(err => console.error('[Convert] DB save/credit deduction error:', err))

  return finalResult
}
ENDOFFILE

# =============================================================================
# MAIN OUTPUT
# =============================================================================

print_header

print_section "generate.types" "agents/content/types/generate.types.ts" "$TYPES_GENERATE_TYPES"
print_section "analyze.types"  "agents/content/types/analyze.types.ts"  "$TYPES_ANALYZE_TYPES"
print_section "convert.types"  "agents/content/types/convert.types.ts"  "$TYPES_CONVERT_TYPES"
print_section "scrape"         "agents/content/utils/scrape.ts"          "$UTILS_SCRAPE"
print_section "generate.skill" "agents/content/skills/generate.skill.ts" "$SKILLS_GENERATE_SKILL"
print_section "analyze.skill"  "agents/content/skills/analyze.skill.ts"  "$SKILLS_ANALYZE_SKILL"
print_section "convert.skill"  "agents/content/skills/convert.skill.ts"  "$SKILLS_CONVERT_SKILL"

echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}${GREEN}  Content Agent — 7 files loaded${RESET}"
echo -e "${BOLD}${GREEN}  Types: 3 | Utils: 1 | Skills: 3${RESET}"
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${RESET}"