/**
 * Content Agent — Analyze Skill
 */
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
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
`

  // 4. AI Çağrısı (Zod schema ile structure generation)
  const geminiKey = process.env.GOOGLE_GENERATION_AI_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const nvidiaKey = process.env.NVIDIA_API_KEY
  
  if (!geminiKey && !anthropicKey && !nvidiaKey) {
    throw new AnalyzeSkillError('AI servisi yapılandırılamadı (Key eksik).', 500)
  }
  
  let resultObject: any = null
  let tokensUsed = 0
  let modelUsed = 'abacusai/dracarys-llama-3.1-70b-instruct'
  
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
    if (!nvidiaKey) throw new Error('Nvidia key missing, skip to Gemini')

    console.log('[Analyze] Nvidia API çağrılıyor...')
    const nvidia = createOpenAI({ apiKey: nvidiaKey, baseURL: 'https://integrate.api.nvidia.com/v1' })

    const { object, usage } = await generateObject({
      model: nvidia('abacusai/dracarys-llama-3.1-70b-instruct'),
      schema: schema,
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.3
    })
    resultObject = object
    tokensUsed = ((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) + ((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0)
    console.log('[Analyze] Analiz tamamlandı (Nvidia), skor:', resultObject.overallScore)
  } catch (nvidiaErr: any) {
    console.warn('[Analyze] Nvidia error, trying Gemini 2.5 Flash...', nvidiaErr?.message || nvidiaErr)
    
    try {
      if (!geminiKey) throw new Error('Gemini key missing, skip to fallback')
      
      console.log('[Analyze] Gemini 2.5 Flash API çağrılıyor...')
    const google = createGoogleGenerativeAI({ apiKey: geminiKey })
    
    try {
      const { object, usage } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: schema,
        system: systemPrompt,
        prompt: prompt,
        temperature: 0.3
      })
      resultObject = object
      tokensUsed = ((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) + ((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0)
      console.log('[Analyze] Analiz tamamlandı (Gemini 2.5 Flash), skor:', resultObject.overallScore)
    } catch (geminiFlashErr: any) {
      console.warn('[Analyze] Gemini 2.5 Flash error, trying Gemini 2.0 Flash...', geminiFlashErr?.message || geminiFlashErr)
      
      const { object, usage } = await generateObject({
        model: google('gemini-2.0-flash'),
        schema: schema,
        system: systemPrompt,
        prompt: prompt,
        temperature: 0.3
      })
      resultObject = object
      tokensUsed = ((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) + ((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0)
      modelUsed = 'gemini-2.0-flash'
      console.log('[Analyze] Analiz tamamlandı (Gemini 2.0 Flash), skor:', resultObject.overallScore)
    }
  } catch (err: any) {
    console.warn('[Analyze] Nvidia and Gemini models failed, falling back to Claude:', err?.message || err)
    
    // Fallback to Claude
    try {
      if (!anthropicKey) throw new Error('Anthropic key missing for fallback')
      
      console.log('[Analyze] Claude 3.5 Sonnet API çağrılıyor (Fallback)...')
      const anthropic = require('@ai-sdk/anthropic').createAnthropic({ apiKey: anthropicKey })
      
      try {
        const { object, usage } = await generateObject({
          model: anthropic('claude-3-5-sonnet-latest'),
          schema: schema,
          system: systemPrompt,
          prompt: prompt,
          temperature: 0.3
        })
        resultObject = object
        tokensUsed = ((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) + ((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0)
        modelUsed = 'claude-3-5-sonnet-latest'
        console.log('[Analyze] Analiz tamamlandı (Claude 3.5 Sonnet), skor:', resultObject.overallScore)
      } catch (claudeSonnetErr: any) {
        console.warn('[Analyze] Claude 3.5 Sonnet error, trying Haiku...', claudeSonnetErr?.message || claudeSonnetErr)
        
        const { object, usage } = await generateObject({
          model: anthropic('claude-3-haiku-20240307'),
          schema: schema,
          system: systemPrompt,
          prompt: prompt,
          temperature: 0.3
        })
        resultObject = object
        tokensUsed = ((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) + ((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0)
        modelUsed = 'claude-3-haiku-20240307'
        console.log('[Analyze] Analiz tamamlandı (Claude Haiku), skor:', resultObject.overallScore)
      }
    } catch (fallbackErr: any) {
      console.error('[Analyze] Fallback AI generation error:', fallbackErr)
      const errString = fallbackErr?.message || String(fallbackErr)
      if (errString.includes('credit balance is too low') || errString.includes('quota')) {
         throw new AnalyzeSkillError('Yapay zeka API krediniz yetersiz veya kotalarınız dolmuş. Lütfen API anahtarlarınızın limitlerini kontrol edin.', 402)
      }
      throw new AnalyzeSkillError('İçerik analizi sırasında tüm AI servisleri (Nvidia, Gemini ve Claude) yanıt vermedi.', 500)
    }
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
