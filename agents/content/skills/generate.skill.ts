/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║       Content Agent — Generate Skill (İçerik Üretim Yeteneği)       ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  Sorumluluk:                                                        ║
 * ║  1. Supabase users tablosundan kredi kontrolü                       ║
 * ║  2. Sistem + kullanıcı promptlarının oluşturulması                  ║
 * ║  3. Anthropic (Plan A) → Gemini (Plan B) streaming çağrıları        ║
 * ║  4. JSON parsing (extractFirstJSON) stratejileri                    ║
 * ║  5. Supabase generations tablosuna kayıt + kredi düşümü             ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  BU DOSYA API KATMANIYLA İLGİLENMEZ:                                ║
 * ║  Auth, HTTP parse, Zod validation → route.ts tarafında yapılır.     ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import { currentUser } from '@clerk/nextjs/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import Groq from 'groq-sdk'
import { buildSystemPrompt, buildUserMessage, type Tone, type PlatformId } from '@/prompts/system'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { chargeCredits } from '@/lib/billing/charge'
import { moduleCostOperations } from '@/lib/billing/credits'
import type { GenerateSkillInput, SupabaseUserRow, ParsedTitle, ExtractedJSON } from '../types/generate.types'

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 1: JSON ÇIKARMA STRATEJİLERİ
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AI çıktısından JSON'ı güvenli şekilde çeker.
 *
 * Strateji (sırayla denenir):
 *  1. indexOf/lastIndexOf ile { } bloğunu kes — en güvenilir yöntem
 *  2. Markdown temizle (```json ... ```) ve tekrar dene
 *  3. Trailing comma düzelt ve son kez dene
 */
function extractFirstJSON(rawText: string): ExtractedJSON {
  // ── Katman 1: indexOf + lastIndexOf (en güvenilir yöntem) ──
  const attempt = (text: string): ExtractedJSON => {
    const startIndex = text.indexOf('{')
    const endIndex = text.lastIndexOf('}')

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      return null
    }

    const jsonString = text.substring(startIndex, endIndex + 1)

    try {
      const parsed = JSON.parse(jsonString)
      if (typeof parsed === 'object' && parsed !== null) {
        console.log('[ExtractJSON] Başarılı parse, uzunluk:', jsonString.length)
        return parsed as Record<string, unknown>
      }
      return null
    } catch {
      return null
    }
  }

  // ── Katman 2: Trailing comma temizle ──
  const attemptWithClean = (text: string): ExtractedJSON => {
    const startIndex = text.indexOf('{')
    const endIndex = text.lastIndexOf('}')
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return null

    const jsonString = text
      .substring(startIndex, endIndex + 1)
      .replace(/,\s*([}\]])/g, '$1')   // trailing comma
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // unquoted key'leri düzelt

    try {
      const parsed = JSON.parse(jsonString)
      if (typeof parsed === 'object' && parsed !== null) {
        console.log('[ExtractJSON] Temizleme sonrası parse başarılı')
        return parsed as Record<string, unknown>
      }
      return null
    } catch {
      return null
    }
  }

  // Dene 1: Ham metin üzerinde direkt
  const r1 = attempt(rawText)
  if (r1) return r1

  // Dene 2: Markdown temizle, sonra dene
  const cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()
  const r2 = attempt(cleaned)
  if (r2) return r2

  // Dene 3: Temizlenmiş + trailing comma fix
  const r3 = attemptWithClean(cleaned)
  if (r3) return r3

  console.error('[ExtractJSON] Tüm stratejiler başarısız. Ham metin (ilk 500):', rawText.slice(0, 500))
  return null
}

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 2: KULLANICI & KREDİ YÖNETİMİ
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Kullanıcıyı Supabase'den çeker; bulunamazsa lazy upsert ile oluşturur.
 * @throws {GenerateSkillError} Kullanıcı oluşturulamazsa veya kredi tükenmişse
 */
async function resolveUser(
  userId: string,
  supabase: ReturnType<typeof getSupabaseAdmin>
): Promise<SupabaseUserRow> {
  // Mevcut kullanıcıyı çek
  const { data: user } = await supabase
    .from('users')
    .select('id, credits_used, credits_limit, plan')
    .eq('clerk_id', userId)
    .single()

  if (user) return user as SupabaseUserRow

  // Kullanıcı yoksa lazy upsert ile oluştur
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
    throw new GenerateSkillError('Hesap oluşturulamadı.', 500)
  }

  console.log('[Generate] Kullanıcı lazy upsert ile oluşturuldu:', userId)
  return newUser as SupabaseUserRow
}

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 3: AI MODEL ÇAĞRILARI (Streaming)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Plan A: OpenRouter ile streaming içerik üretimi.
 */
async function tryOpenRouterStream(
  systemPrompt: string,
  userMessage: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  startTime: number,
): Promise<{ fullText: string; inputTokens: number; outputTokens: number; modelUsed: string } | null> {
  const openrouterKey = process.env.OPENROUTER_API_KEY
  if (!openrouterKey) return null

  try {
    console.log('[Generate] Plan A: OpenRouter deneniyor...')
    const openrouterProvider = createOpenAI({
      apiKey: openrouterKey,
      baseURL: 'https://openrouter.ai/api/v1',
    })

    let fullText = ''
    const openrouterResult = streamText({
      model: openrouterProvider('openrouter/free'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      temperature: 0.7,
    })

    for await (const chunk of openrouterResult.textStream) {
      fullText += chunk
      controller.enqueue(encoder.encode('.'))
    }

    const usage = await openrouterResult.usage
    const inputTokens = (usage as any)?.promptTokens ?? (usage as any)?.inputTokens ?? 0
    const outputTokens = (usage as any)?.completionTokens ?? (usage as any)?.outputTokens ?? 0
    const modelUsed = 'openrouter/free (OpenRouter)'

    console.log('[Generate] OpenRouter başarılı:', {
      inputTokens,
      outputTokens,
      textLen: fullText.length,
      ms: Date.now() - startTime,
    })

    return { fullText, inputTokens, outputTokens, modelUsed }
  } catch (err) {
    console.warn(
      '[Generate] OpenRouter başarısız, Groq\'a geçiliyor:',
      err instanceof Error ? err.message : err
    )
    return null
  }
}

/**
 * Plan D: Groq ile streaming içerik üretimi (ücretsiz alternatif)
 * @returns { fullText, inputTokens, outputTokens, modelUsed } — başarılıysa
 * @throws {Error} Groq başarısızsa
 */
async function tryGroqStream(
  systemPrompt: string,
  userMessage: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  startTime: number,
): Promise<{ fullText: string; inputTokens: number; outputTokens: number; modelUsed: string }> {
  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) {
    throw new Error('Groq API anahtarı eksik.')
  }

  console.log('[Generate] Plan D: Groq deneniyor...')
  const groq = new Groq({ apiKey: groqKey })

  let fullText = ''
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 22000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      stream: true,
    })

    // Stream'den chunk'ları oku
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        fullText += content
        // Canlı progress
        controller.enqueue(encoder.encode('.'))
      }
    }

    const inputTokens = 0  // Groq SDK streaming modu tokenları döndürmüyor, estimate yap
    const outputTokens = Math.ceil(fullText.length / 4)

    console.log('[Generate] Groq başarılı:', {
      textLen: fullText.length,
      ms: Date.now() - startTime,
    })

    return { fullText, inputTokens, outputTokens, modelUsed: 'llama-3.3-70b-versatile (Groq)' }
  } catch (groqErr) {
    console.warn(
      '[Generate] Groq başarısız:',
      groqErr instanceof Error ? groqErr.message : groqErr
    )
    throw groqErr
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 4: VERİTABANI KAYIT İŞLEMLERİ
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Üretim sonucunu Supabase generations tablosuna kaydeder ve kullanıcı kredisini düşer.
 * Stream kapandıktan sonra çağrılır — response'u geciktirmez.
 */
async function saveGenerationAndDeductCredit(params: {
  supabase: ReturnType<typeof getSupabaseAdmin>
  user: SupabaseUserRow
  input: GenerateSkillInput
  parsedResult: ExtractedJSON
  inputTokens: number
  outputTokens: number
  modelUsed: string
  startTime: number
}): Promise<void> {
  const { supabase, user, input, parsedResult, inputTokens, outputTokens, modelUsed, startTime } = params

  const seoScore =
    typeof parsedResult?.seo_score === 'number' ? parsedResult.seo_score : null

  // Üretim kaydı
  const { data: savedGen, error: dbError } = await supabase.from('generations').insert({
    user_id: user.id,
    product_name: input.productName,
    category_path: input.category ?? null,
    platform: input.platforms,
    content_types: ['title', 'description', 'ad_copy'],
    tone: input.tone,
    extra_keywords: input.extraKeywords
      ? input.extraKeywords.split(',').map((k) => k.trim())
      : [],
    results: parsedResult ?? null,
    seo_score: seoScore,
    tokens_used: inputTokens + outputTokens,
    model_used: modelUsed,
    generation_ms: Date.now() - startTime,
    status: parsedResult ? 'completed' : 'failed',
  }).select('id').single()

  if (dbError) {
    console.error('[Generate] DB kayıt hatası:', dbError.message)
    return
  }

  // Atomik kredi düşümü (chargeCredits)
  try {
    await chargeCredits(input.userId, 'generate', savedGen?.id)
  } catch (err) {
    console.error('[Generate] Kredi düşümü hatası:', err)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 5: HATA SINIFI
// ═══════════════════════════════════════════════════════════════════════════════

/** Skill katmanından route katmanına iletilen yapısal hata */
export class GenerateSkillError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    this.name = 'GenerateSkillError'
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 6: ANA SKILL FONKSİYONU
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * İçerik üretim skill'i — Content Agent'ın ana yeteneği.
 *
 * Bu fonksiyon route.ts tarafından çağrılır. Dönen ReadableStream doğrudan
 * HTTP response olarak istemciye aktarılır.
 *
 * @param input - Doğrulanmış üretim parametreleri (auth + Zod tamamlanmış)
 * @returns ReadableStream — frontend tarafından nokta (".") ve "__RESULT__:" protokolü ile okunur
 * @throws {GenerateSkillError} Kredi yetersiz veya hesap oluşturulamaz durumlarında
 */
export async function generateSkill(input: GenerateSkillInput): Promise<ReadableStream> {
  const startTime = Date.now()
  const supabase = getSupabaseAdmin()

  // ── 1. Kullanıcı çek / oluştur ──
  const user = await resolveUser(input.userId, supabase)

  // ── 2. Kredi kontrolü (Pre-flight) ──
  const cost = moduleCostOperations('generate') * 5000
  const remaining = (user.credits_limit || 0) - (user.credits_used || 0)
  if (remaining < cost) {
    throw new GenerateSkillError(`Yetersiz bakiye. Bu işlem için ${moduleCostOperations('generate')} işlem hakkı gerekiyor.`, 403)
  }

  // ── 3. Prompt'ları hazırla ──
  const systemPrompt = buildSystemPrompt({
    platforms: input.platforms,
    tone: input.tone as Tone,
    category: input.category,
    language: input.language,
    country: input.country,
    extraRules: input.extraKeywords,
  })

  const userMessage = buildUserMessage({
    productName: input.productName,
    category: input.category,
    platforms: input.platforms,
    tone: input.tone as Tone,
    language: input.language,
    country: input.country,
    extraKeywords: input.extraKeywords,
  })

  console.log('[Generate] Başlıyor:', {
    product_name: input.productName,
    platforms: input.platforms,
    tone: input.tone,
  })

  // ── 4. Streaming ReadableStream oluştur ──
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = ''
      let modelUsed = 'gemini'
      let inputTokens = 0
      let outputTokens = 0

      // ══════════════════════════════════════════════════════
      // PLAN A: OpenRouter
      // ══════════════════════════════════════════════════════
      let openrouterResult = null
      try {
        console.log('[Generate] Plan A: OpenRouter deneniyor...')
        openrouterResult = await tryOpenRouterStream(
          systemPrompt,
          userMessage,
          controller,
          encoder,
          startTime,
        )
        if (openrouterResult) {
          fullText = openrouterResult.fullText
          inputTokens = openrouterResult.inputTokens
          outputTokens = openrouterResult.outputTokens
          modelUsed = openrouterResult.modelUsed
        }
      } catch (err) {
        console.warn('[Generate] OpenRouter başarısız:', err instanceof Error ? err.message : err)
      }

      // ══════════════════════════════════════════════════════
      // PLAN B: Groq (OpenRouter başarısızsa)
      // ══════════════════════════════════════════════════════
      let groqResult = null
      if (!openrouterResult) {
        try {
          groqResult = await tryGroqStream(
            systemPrompt,
            userMessage,
            controller,
            encoder,
            startTime,
          )
          if (groqResult) {
            fullText = groqResult.fullText
            inputTokens = groqResult.inputTokens
            outputTokens = groqResult.outputTokens
            modelUsed = groqResult.modelUsed
          }
        } catch (groqErr) {
          console.warn('[Generate] Groq başarısız:', groqErr instanceof Error ? groqErr.message : groqErr)
        }
      }

      // ══════════════════════════════════════════════════════
      // Hata Kontrolü — Tüm model başarısızsa
      // ══════════════════════════════════════════════════════
      if (!fullText) {
        const openrouterKey = process.env.OPENROUTER_API_KEY
        if (!openrouterKey && !process.env.GROQ_API_KEY) {
          console.error('[Generate] Tüm model anahtarları eksik!')
          controller.enqueue(
            encoder.encode('__ERROR__:İçerik üretim servisi şu an kullanılamıyor.')
          )
          controller.close()
          return
        }

        console.error(
          '[Generate] Tüm model denemeleri başarısız'
        )
        controller.enqueue(
          encoder.encode('__ERROR__:İki model de yanıt veremiyor. Lütfen tekrar deneyin.')
        )
        controller.close()
        return
      }

      // ══════════════════════════════════════════════════════
      // JSON Parse & Sanitize — Stream bitti, şimdi işle
      // ══════════════════════════════════════════════════════
      const parsedResult = extractFirstJSON(fullText)

      if (parsedResult) {
        // char_count hesapla (prompt'ta 0 dönüyor bazen)
        if (Array.isArray(parsedResult.titles)) {
          parsedResult.titles = (parsedResult.titles as ParsedTitle[])
            .map((t) => ({ ...t, char_count: t.text?.length ?? 0 }))
        }

        // Frontend'e parse edilmiş JSON'ı özel prefix ile gönder
        // Frontend bunu yakalayarak direkt kullanacak — format hatası olmaz
        const resultChunk = '\n__RESULT__:' + JSON.stringify(parsedResult)
        controller.enqueue(encoder.encode(resultChunk))
        console.log('[Generate] __RESULT__ chunk gönderildi, seo_score:', parsedResult.seo_score)
      } else {
        console.error('[Generate] JSON parse başarısız. Ham metin (ilk 400):', fullText.slice(0, 400))
        controller.enqueue(encoder.encode('\n__ERROR__:İçerik üretildi ancak format okunamadı. Lütfen tekrar deneyin.'))
      }

      // ══════════════════════════════════════════════════════
      // DB Kayıt (async)
      // ══════════════════════════════════════════════════════
      await saveGenerationAndDeductCredit({
        supabase,
        user,
        input,
        parsedResult,
        inputTokens,
        outputTokens,
        modelUsed,
        startTime,
      })

      console.log('[Generate] Tamamlandı:', {
        model: modelUsed,
        seoScore: typeof parsedResult?.seo_score === 'number' ? parsedResult.seo_score : null,
        ms: Date.now() - startTime,
      })

      controller.close()
    },
  })

  return stream
}
