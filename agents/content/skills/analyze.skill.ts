/**
 * Content Agent — Analyze Skill
 */
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { chargeCredits } from '@/lib/billing/charge'
import { moduleCostOperations } from '@/lib/billing/credits'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import Groq from 'groq-sdk'
import { z } from 'zod'
import * as cheerio from 'cheerio'
import type { AnalyzeSkillInput, AnalysisResult } from '../types/analyze.types'
import { buildSystemPrompt, Tone } from '@/prompts/system'
import { buildAnalyzePrompt } from '../prompts/analyze.prompt'

import { scrapeUrl } from '../utils/scrape'

// Error sınıfı
export class AnalyzeSkillError extends Error {
  constructor(message: string, public readonly statusCode: number = 500) {
    super(message)
    this.name = 'AnalyzeSkillError'
  }
}

async function safeScrapeUrl(url: string) {
  try {
    return await scrapeUrl(url)
  } catch (err: any) {
    throw new AnalyzeSkillError(err.message, 400)
  }
}

async function resolveUser(userId: string, supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data: user } = await supabase
    .from('users')
    .select('id, credits_used, credits_limit, plan')
    .eq('clerk_id', userId)
    .single()

  if (user) return user

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? ''
  const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ')

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      clerk_id: userId,
      email,
      full_name: fullName || email,
      plan: 'trial',
      credits_limit: 250_000,
      credits_used: 0,
    })
    .select('id, credits_used, credits_limit, plan')
    .single()

  if (error || !newUser) {
    throw new AnalyzeSkillError('Hesap bilgileri alınamadı.', 500)
  }

  return newUser
}

export async function analyzeSkill(input: AnalyzeSkillInput): Promise<AnalysisResult> {
  const startTime = Date.now()
  const supabase = getSupabaseAdmin()

  // 1. Kullanıcı Çek / Oluştur
  const user = await resolveUser(input.userId, supabase)
  
  // Pre-flight check
  const cost = moduleCostOperations('analyze') * 5000 
  const remaining = (user.credits_limit || 0) - (user.credits_used || 0)
  if (remaining < cost) {
    throw new AnalyzeSkillError(`Yetersiz bakiye. Bu işlem için ${moduleCostOperations('analyze')} işlem hakkı gerekiyor.`, 403)
  }

  // 2. Scraping
  let scrapedData = { title: '', description: '', content: '', images: [] as string[] }
  if (input.url && input.url.trim() !== '') {
    console.log(`[Analyze] URL kazınıyor: ${input.url}`)
    scrapedData = await safeScrapeUrl(input.url)
  } else {
    console.log('[Analyze] URL boş, manuel giriş olarak devam ediliyor.')
    scrapedData = {
      title: input.productName,
      description: 'Manuel giriş yapıldı, sayfa kazınamadı.',
      content: '',
      images: []
    }
  }

  if (!scrapedData.title && !scrapedData.description) {
    throw new AnalyzeSkillError('Analiz edilecek içerik bulunamadı.', 400)
  }

  // 3. Prompt Hazırlığı
  const systemPrompt = buildSystemPrompt({
    platforms: input.platforms,
    tone: 'professional' as Tone, // Analiz için nötr/profesyonel kullanıyoruz
  })

  const prompt = buildAnalyzePrompt(input.platforms, scrapedData)

  // 4. AI Çağrısı (Zod schema ile structure generation)
  const openrouterKey = process.env.OPENROUTER_API_KEY
  const groqKey = process.env.GROQ_API_KEY

  if (!openrouterKey && !groqKey) {
    throw new AnalyzeSkillError('AI servisi yapılandırılamadı (Key eksik).', 500)
  }

  let resultObject: any = null
  let inputTokens = 0
  let outputTokens = 0
  let modelUsed = 'openrouter/free'

  const schema = z.object({
    overallScore: z.number().min(0).max(100),
    criteriaScores: z.object({
      titleQuality: z.object({
        score: z.number().min(0).max(100),
        status: z.enum(['pass', 'warn', 'fail']),
        feedback: z.string().describe('Kriter puanının gerekçesi ve iyileştirme önerisi')
      }),
      descriptionDepth: z.object({
        score: z.number().min(0).max(100),
        status: z.enum(['pass', 'warn', 'fail']),
        feedback: z.string().describe('Açıklama derinliği hakkında detaylı geri bildirim')
      }),
      keywordDensity: z.object({
        score: z.number().min(0).max(100),
        status: z.enum(['pass', 'warn', 'fail']),
        feedback: z.string().describe('Anahtar kelime kullanımı hakkında geri bildirim')
      }),
      platformRules: z.object({
        score: z.number().min(0).max(100),
        status: z.enum(['pass', 'warn', 'fail']),
        feedback: z.string().describe('Hedef platform kurallarına uyum hakkında geri bildirim')
      }),
      legalCompliance: z.object({
        score: z.number().min(0).max(100),
        status: z.enum(['pass', 'warn', 'fail']),
        feedback: z.string().describe('Yasal zorunluluklar ve reklam kuralları hakkında geri bildirim')
      })
    }),
    suggestions: z.array(z.object({
      title: z.string().describe('Önerinin kısa başlığı'),
      description: z.string().describe('Önerinin detaylı açıklaması'),
      priority: z.enum(['high', 'medium', 'low'])
    })).min(1, 'En az bir iyileştirme önerisi üretilmelidir.')
  })

  try {
    if (!openrouterKey) throw new Error('OpenRouter key missing, skip to Groq')

    console.log('[Analyze] OpenRouter API çağrılıyor...')
    const openrouter = createOpenAI({ apiKey: openrouterKey, baseURL: 'https://openrouter.ai/api/v1' })

    const { object, usage } = await generateObject({
      model: openrouter('openrouter/free'),
      schema: schema,
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.3
    })
    resultObject = object
    inputTokens = (usage as any).promptTokens ?? (usage as any).inputTokens ?? 0
    outputTokens = (usage as any).completionTokens ?? (usage as any).outputTokens ?? 0
    console.log('[Analyze] Analiz tamamlandı (OpenRouter), skor:', resultObject.overallScore)
  } catch (openrouterErr: any) {
    console.warn('[Analyze] OpenRouter error, trying Groq fallback...', openrouterErr?.message || openrouterErr)

    try {
      if (!groqKey) {
        throw new AnalyzeSkillError('Groq API anahtarı yapılandırılmadı.', 500)
      }

      const groq = new Groq({ apiKey: groqKey })
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      })

      const responseContent = response.choices[0]?.message?.content
      if (!responseContent) {
        throw new Error('Groq yanıttı boş.')
      }

      // JSON çıkarmayı dene
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Groq yanıtında JSON bulunamadı.')
      }

      const parsed = JSON.parse(jsonMatch[0])
      resultObject = parsed
      inputTokens = response.usage?.prompt_tokens ?? 0
      outputTokens = response.usage?.completion_tokens ?? 0
      modelUsed = 'llama-3.3-70b-versatile (Groq)'
      console.log('[Analyze] Analiz tamamlandı (Groq Llama), skor:', resultObject.overallScore)
    } catch (groqErr: any) {
      console.warn('[Analyze] Groq fallback error:', groqErr?.message || groqErr)
      const errString = groqErr?.message || String(groqErr)
      if (errString.includes('credit balance is too low') || errString.includes('quota')) {
        throw new AnalyzeSkillError('Yapay zeka API krediniz yetersiz veya kotalarınız dolmuş. Lütfen API anahtarlarınızın limitlerini kontrol edin.', 402)
      }
      throw new AnalyzeSkillError('İçerik analizi sırasında tüm AI servisleri (OpenRouter ve Groq) yanıt vermedi.', 500)
    }
  }

  // 5. Veritabanı Kayıt ve Kredi Düşümü
  const finalResult: AnalysisResult = {
    ...resultObject,
    scrapedData
  }

  try {
    // 1. Analiz Kaydı
    const { data: savedAnalysis, error: saveError } = await supabase.from('analyses').insert({
      user_id: user.id,
      source_url: input.url,
      target_platform: input.platforms,
      scraped_data: scrapedData as unknown as Record<string, unknown>,
      overall_score: finalResult.overallScore,
      criteria_scores: finalResult.criteriaScores as unknown as Record<string, unknown>,
      suggestions: (finalResult as any).suggestions || null,
      analysis_ms: Date.now() - startTime,
      credits_charged: moduleCostOperations('analyze') * 5000
    }).select('id').single()

    if (saveError) throw saveError
    finalResult.id = savedAnalysis.id

    // 2. Kredi Düşümü (Atomik)
    await chargeCredits(input.userId, 'analyze', savedAnalysis.id)

    console.log('[Analyze] Analiz başarıyla kaydedildi ve bakiye düşüldü, ID:', finalResult.id)
  } catch (err) {
    console.error('[Analyze] DB kayıt/kredi düşümü sırasında kritik hata:', err)
  }

  return finalResult
}
