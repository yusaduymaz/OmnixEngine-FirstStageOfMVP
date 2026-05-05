/**
 * Content Agent — Convert Skill
 */
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { scrapeUrl } from '../utils/scrape'
import type { ConvertSkillInput, ConvertResult } from '../types/convert.types'
import { buildSystemPrompt, Tone, PLATFORM_LABELS, type PlatformId } from '@/prompts/system'

// Error sınıfı
export class ConvertSkillError extends Error {
  constructor(message: string, public readonly statusCode: number = 500) {
    super(message)
    this.name = 'ConvertSkillError'
  }
}

async function safeScrapeUrl(url: string) {
  try {
    return await scrapeUrl(url)
  } catch (err: any) {
    throw new ConvertSkillError(err.message, 400)
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
    throw new ConvertSkillError('Hesap bilgileri alınamadı.', 500)
  }

  return newUser
}

export async function convertSkill(input: ConvertSkillInput): Promise<ConvertResult> {
  const startTime = Date.now()
  const supabase = getSupabaseAdmin()

  // 1. Kullanıcı ve Kredi Kontrolü
  const user = await resolveUser(input.userId, supabase)
  // Converter için 1 kredi düşünülebilir, her platform için 1 kredi mi? Şimdilik genel 1 kredi yapalım.
  if (user.credits_limit - user.credits_used <= 0) {
    throw new ConvertSkillError('Krediniz tükendi.', 403)
  }

  // 2. Veri Hazırlığı
  let sourceContentToProcess = ''
  let scrapedData: { title: string, description: string, content: string } | undefined

  if (input.sourceUrl) {
    console.log(`[Convert] URL kazınıyor: ${input.sourceUrl}`)
    scrapedData = await safeScrapeUrl(input.sourceUrl)
    sourceContentToProcess = `Başlık: ${scrapedData.title}\nAçıklama: ${scrapedData.description}\nİçerik: ${scrapedData.content}`
  } else if (input.sourceText) {
    sourceContentToProcess = input.sourceText
  } else {
    throw new ConvertSkillError('Kaynak URL veya Metin sağlanmalıdır.', 400)
  }

  // 3. Prompt Hazırlığı
  const targetPlatformLabels = input.targetPlatforms.map(p => PLATFORM_LABELS[p] || p).join(', ')
  const sourceLabel = input.sourcePlatform ? (PLATFORM_LABELS[input.sourcePlatform as PlatformId] || input.sourcePlatform) : 'Bilinmeyen'

  const systemPrompt = buildSystemPrompt({
    platforms: input.targetPlatforms,
    tone: 'professional' as Tone,
  })

  const prompt = `
Aşağıda verilen ürün içeriğini kaynak platformdan (${sourceLabel}) alıp, şu hedef platformların (${targetPlatformLabels}) SEO ve içerik kurallarına uygun olarak DÖNÜŞTÜR (REWRITE).

Orijinal İçerik:
---
${sourceContentToProcess.slice(0, 4000)}
---

Görev:
Her bir hedef platform için;
- Kurallara (karakter sınırları, yasaklı kelimeler, bullet point zorunlulukları vb.) tam uyumlu,
- Yeni bir Başlık (title) ve Açıklama (description) yaz.
(HTML tagleri KULLANMA, metin ve madde imi (-) kullan.)
`

  // 4. AI Çağrısı (Fallback Zinciri)
  const geminiKey = process.env.GOOGLE_GENERATION_AI_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const nvidiaKey = process.env.NVIDIA_API_KEY
  
  if (!geminiKey && !anthropicKey && !nvidiaKey) {
    throw new ConvertSkillError('AI servisi yapılandırılamadı (Key eksik).', 500)
  }
  
  let resultObject: any = null
  let tokensUsed = 0
  let modelUsed = 'abacusai/dracarys-llama-3.1-70b-instruct'
  
  const schema = z.object({
    results: z.array(z.object({
      platform: z.enum(input.targetPlatforms as [string, ...string[]]),
      title: z.string(),
      description: z.string()
    }))
  })

  try {
    if (!nvidiaKey) throw new Error('Nvidia key missing, skip to Gemini')
    
    console.log('[Convert] Nvidia API çağrılıyor...')
    const nvidia = createOpenAI({ apiKey: nvidiaKey, baseURL: 'https://integrate.api.nvidia.com/v1' })
    
    const { object, usage } = await generateObject({
      model: nvidia('abacusai/dracarys-llama-3.1-70b-instruct'),
      schema: schema,
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.6
    })
    resultObject = object
    tokensUsed = ((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) + ((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0)
    console.log('[Convert] Dönüştürme tamamlandı (Nvidia)')
  } catch (nvidiaErr: any) {
    console.warn('[Convert] Nvidia error, trying Gemini 2.5 Flash...', nvidiaErr?.message || nvidiaErr)
    
    try {
      if (!geminiKey) throw new Error('Gemini key missing, skip to fallback')
      
      console.log('[Convert] Gemini 2.5 Flash API çağrılıyor...')
      const google = createGoogleGenerativeAI({ apiKey: geminiKey })
    
    try {
      const { object, usage } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: schema,
        system: systemPrompt,
        prompt: prompt,
        temperature: 0.6
      })
      resultObject = object
      tokensUsed = ((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) + ((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0)
      console.log('[Convert] Analiz tamamlandı (Gemini 2.5 Flash)')
    } catch (geminiFlashErr: any) {
      console.warn('[Convert] Gemini 2.5 Flash error, trying Gemini 2.0 Flash...', geminiFlashErr?.message || geminiFlashErr)
      
      const { object, usage } = await generateObject({
        model: google('gemini-2.0-flash'),
        schema: schema,
        system: systemPrompt,
        prompt: prompt,
        temperature: 0.6
      })
      resultObject = object
      tokensUsed = ((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) + ((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0)
      modelUsed = 'gemini-2.0-flash'
      console.log('[Convert] Analiz tamamlandı (Gemini 2.0 Flash)')
    }
  } catch (err: any) {
    console.warn('[Convert] Nvidia and Gemini models failed, falling back to Claude:', err?.message || err)
    
    try {
      if (!anthropicKey) throw new Error('Anthropic key missing for fallback')
      
      console.log('[Convert] Claude 3.5 Sonnet API çağrılıyor (Fallback)...')
      const anthropic = createAnthropic({ apiKey: anthropicKey })
      
      try {
        const { object, usage } = await generateObject({
          model: anthropic('claude-3-5-sonnet-latest'),
          schema: schema,
          system: systemPrompt,
          prompt: prompt,
          temperature: 0.6
        })
        resultObject = object
        tokensUsed = ((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) + ((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0)
        modelUsed = 'claude-3-5-sonnet-latest'
        console.log('[Convert] Analiz tamamlandı (Claude 3.5 Sonnet)')
      } catch (claudeSonnetErr: any) {
        console.warn('[Convert] Claude 3.5 Sonnet error, trying Haiku...', claudeSonnetErr?.message || claudeSonnetErr)
        
        const { object, usage } = await generateObject({
          model: anthropic('claude-3-haiku-20240307'),
          schema: schema,
          system: systemPrompt,
          prompt: prompt,
          temperature: 0.6
        })
        resultObject = object
        tokensUsed = ((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) + ((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0)
        modelUsed = 'claude-3-haiku-20240307'
        console.log('[Convert] Analiz tamamlandı (Claude Haiku)')
      }
    } catch (fallbackErr: any) {
      console.error('[Convert] Fallback AI generation error:', fallbackErr)
      const errString = fallbackErr?.message || String(fallbackErr)
      if (errString.includes('credit balance is too low') || errString.includes('quota')) {
         throw new ConvertSkillError('Yapay zeka API krediniz yetersiz veya kotalarınız dolmuş. Lütfen API anahtarlarınızın limitlerini kontrol edin.', 402)
      }
      throw new ConvertSkillError('İçerik dönüştürme sırasında tüm AI servisleri (Nvidia, Gemini ve Claude) yanıt vermedi.', 500)
    }
  }
}

  // 5. Veritabanı Kayıt ve Kredi Düşümü (Asenkron)
  const finalResult: ConvertResult = {
    results: resultObject.results,
    scrapedData
  }

  Promise.all([
    supabase.from('generations').insert({
      user_id: user.id,
      product_name: scrapedData?.title || 'Converter - Belirsiz Ürün',
      platform: input.targetPlatforms,
      content_types: ['converter'],
      tone: 'professional',
      results: finalResult as unknown as Record<string, unknown>,
      tokens_used: tokensUsed,
      model_used: modelUsed,
      generation_ms: Date.now() - startTime,
      status: 'completed',
    }),
    supabase.from('users').update({ credits_used: user.credits_used + 1 }).eq('id', user.id)
  ]).catch(err => {
    console.error('[Convert] DB kayıt/kredi düşümü hatası:', err)
  })

  return finalResult
}
