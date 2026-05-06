/**
 * Content Agent — Analyze Skill
 */
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import Groq from 'groq-sdk'
import { z } from 'zod'
import * as cheerio from 'cheerio'
import type { AnalyzeSkillInput, AnalysisResult } from '../types/analyze.types'
import { buildSystemPrompt, Tone } from '@/prompts/system'

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
      plan: 'free',
      credits_limit: 50,
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

  // 1. Kullanıcı ve Kredi Kontrolü
  const user = await resolveUser(input.userId, supabase)
  if (user.credits_limit - user.credits_used <= 0) {
    throw new AnalyzeSkillError('Krediniz tükendi.', 403)
  }

  // 2. Scraping
  console.log(`[Analyze] URL kazınıyor: ${input.url}`)
  const scrapedData = await safeScrapeUrl(input.url)

  if (!scrapedData.title && !scrapedData.description && !scrapedData.content) {
    throw new AnalyzeSkillError('Sayfadan içerik çıkarılamadı. Boş sayfa olabilir.', 400)
  }

  // 3. Prompt Hazırlığı
  const systemPrompt = buildSystemPrompt({
    platforms: input.platforms,
    tone: 'professional' as Tone, // Analiz için nötr/profesyonel kullanıyoruz
  })

  const prompt = `
Aşağıda verilen e-ticaret ürün sayfası içeriğini analiz et. Hedef platformların (${input.platforms.join(', ')}) kurallarına göre değerlendir.

Ürün Sayfası Verileri:
- Başlık/H1: ${scrapedData.title}
- Meta Description: ${scrapedData.description}
- Sayfa İçeriği (özet): ${scrapedData.content.slice(0, 3000)}

Lütfen bu içeriği aşağıdaki kriterlere göre incele ve her biri için puan (0-100), durum (pass, warn, fail), mesaj ve iyileştirme önerisi sun.
1. Başlık Kalitesi (Uzunluk, anahtar kelime, netlik)
2. Açıklama Derinliği (Bilgi zenginliği, fayda odaklılık, eksiklikler)
3. Anahtar Kelime Yoğunluğu (SEO açısından yeterli mi?)
4. Platform Kurallarına Uygunluk (Seçilen platformların yasaklı kelimeleri, uzunluk sınırları vb.)

Ayrıca genel bir SEO skoru (0-100) hesapla.

YANIT FORMATI (Sadece JSON):
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

  // 4. AI Çağrısı (Zod schema ile structure generation)
  const openrouterKey = process.env.OPENROUTER_API_KEY
  const groqKey = process.env.GROQ_API_KEY

  if (!openrouterKey && !groqKey) {
    throw new AnalyzeSkillError('AI servisi yapılandırılamadı (Key eksik).', 500)
  }

  let resultObject: any = null
  let tokensUsed = 0
  let modelUsed = 'openrouter/free'

  const schema = z.object({
    overallScore: z.number().min(0).max(100),
    criteriaScores: z.object({
      titleQuality: z.object({
        score: z.number().min(0).max(100),
        status: z.enum(['pass', 'warn', 'fail']),
        message: z.string(),
        suggestion: z.string().optional(),
        currentValue: z.string().optional()
      }),
      descriptionDepth: z.object({
        score: z.number().min(0).max(100),
        status: z.enum(['pass', 'warn', 'fail']),
        message: z.string(),
        suggestion: z.string().optional(),
        currentValue: z.string().optional()
      }),
      keywordDensity: z.object({
        score: z.number().min(0).max(100),
        status: z.enum(['pass', 'warn', 'fail']),
        message: z.string(),
        suggestion: z.string().optional()
      }),
      platformRules: z.object({
        score: z.number().min(0).max(100),
        status: z.enum(['pass', 'warn', 'fail']),
        message: z.string(),
        suggestion: z.string().optional()
      })
    })
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
    tokensUsed = ((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) + ((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0)
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
      tokensUsed = response.usage?.total_tokens ?? 0
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

  // 5. Veritabanı Kayıt ve Kredi Düşümü (Asenkron)
  const finalResult: AnalysisResult = {
    ...resultObject,
    scrapedData
  }

  Promise.all([
    supabase.from('analyses').insert({
      user_id: user.id,
      source_url: input.url,
      target_platform: input.platforms,
      scraped_data: scrapedData as unknown as Record<string, unknown>,
      overall_score: finalResult.overallScore,
      criteria_scores: finalResult.criteriaScores as unknown as Record<string, unknown>,
      suggestions: (finalResult as any).suggestions || null,
      analysis_ms: Date.now() - startTime,
      credits_charged: 1
    }),
    supabase.from('users').update({ credits_used: user.credits_used + 1 }).eq('id', user.id)
  ]).catch(err => {
    console.error('[Analyze] DB kayıt/kredi düşümü hatası:', err)
  })

  return finalResult
}
