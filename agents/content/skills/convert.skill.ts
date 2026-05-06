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
import { buildConvertPrompt } from '../prompts/convert.prompt'
import { CREDIT_COSTS } from '@/lib/billing/credit-display'

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
      plan: 'trial',
      credits_limit: 250_000,
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

  const prompt = buildConvertPrompt(sourceLabel, targetPlatformLabels, sourceContentToProcess)

  // 4. AI Çağrısı (Fallback Zinciri)
  const openrouterKey = process.env.OPENROUTER_API_KEY
  const groqKey = process.env.GROQ_API_KEY

  if (!openrouterKey && !groqKey) {
    throw new ConvertSkillError('AI servisi yapılandırılamadı (Key eksik).', 500)
  }

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

    console.log('[Convert] OpenRouter API çağrılıyor...')
    const openrouter = createOpenAI({ apiKey: openrouterKey, baseURL: 'https://openrouter.ai/api/v1' })

    const { object, usage } = await generateObject({
      model: openrouter('openrouter/free'),
      schema: schema,
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.6
    })
    resultObject = object
    tokensUsed = ((usage as any).promptTokens ?? (usage as any).inputTokens ?? 0) + ((usage as any).completionTokens ?? (usage as any).outputTokens ?? 0)
    console.log('[Convert] Dönüştürme tamamlandı (OpenRouter)')
  } catch (openrouterErr: any) {
    console.warn('[Convert] OpenRouter error, trying Groq fallback...', openrouterErr?.message || openrouterErr)

    try {
      if (!groqKey) {
        throw new ConvertSkillError('Groq API anahtarı yapılandırılmadı.', 500)
      }

      const groq = new Groq({ apiKey: groqKey })
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
      })

      const responseContent = response.choices[0]?.message?.content
      if (!responseContent) {
        throw new Error('Groq yanıttı boş.')
      }

      // JSON çıkarmayı dene
      const jsonMatch = responseContent.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
      if (!jsonMatch) {
        throw new Error('Groq yanıtında JSON bulunamadı.')
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Normalizasyon: Eğer direkt array geldiyse results içine koy
      if (Array.isArray(parsed)) {
        resultObject = { results: parsed }
      } else if (parsed && parsed.results) {
        resultObject = parsed
      } else {
        // Eğer results yoksa ama objeyse, belki direkt bir sonuç objesidir (tekli platform)
        resultObject = { results: [parsed] }
      }

      tokensUsed = response.usage?.total_tokens ?? 0
      modelUsed = 'llama-3.3-70b-versatile (Groq)'
      console.log('[Convert] Analiz tamamlandı (Groq Llama)')
    } catch (groqErr: any) {
      console.warn('[Convert] Groq fallback error:', groqErr?.message || groqErr)
      const errString = groqErr?.message || String(groqErr)
      if (errString.includes('credit balance is too low') || errString.includes('quota')) {
        throw new ConvertSkillError('Yapay zeka API krediniz yetersiz veya kotalarınız dolmuş. Lütfen API anahtarlarınızın limitlerini kontrol edin.', 402)
      }
      throw new ConvertSkillError('İçerik dönüştürme sırasında tüm AI servisleri (OpenRouter ve Groq) yanıt vermedi.', 500)
    }
  }

  // Son güvenlik kontrolü
  if (!resultObject || !resultObject.results || !Array.isArray(resultObject.results)) {
    console.warn('[Convert] resultObject.results geçerli bir dizi değil, boş diziye dönüştürülüyor.')
    resultObject = { results: [] }
  }

  // 5. Veritabanı Kayıt ve Kredi Düşümü (Awaited)
  const finalResult: ConvertResult = {
    results: resultObject.results,
    scrapedData
  }

  try {
    // Flat kredi maliyeti: URL var ise convert_url (6000), yoksa convert_text (4000)
    const totalCredits = input.sourceUrl
      ? CREDIT_COSTS.convert_url
      : CREDIT_COSTS.convert_text

    await Promise.all([
      supabase.from('generations').insert({
        user_id: user.id,
        source_type: 'convert',
        source_url: input.sourceUrl || null,
        source_platform: input.sourcePlatform || null,
        product_name: scrapedData?.title || 'Dönüştürülen Ürün',
        platform: input.targetPlatforms,
        content_types: ['converter'],
        tone: 'professional',
        results: finalResult as unknown as Record<string, unknown>,
        tokens_used: tokensUsed,
        model_used: modelUsed,
        generation_ms: Date.now() - startTime,
        status: 'completed',
      }),
      supabase.rpc('increment_credits', { user_uuid: user.id, amount: totalCredits }),
      supabase.from('credit_transactions').insert({
        user_id: user.id,
        amount: -totalCredits,
        type: 'usage',
        module: 'convert',
        reference: null,
        tokens_input: 0,
        tokens_output: tokensUsed,
        model: modelUsed,
        cost_usd: totalCredits / 200, // Reverse micro-credits to USD
      })
    ])
    console.log('[Convert] DB kayıt ve kredi düşümü başarılı.')
  } catch (err) {
    console.error('[Convert] DB kayıt/kredi düşümü hatası:', err)
  }

  return finalResult
}
