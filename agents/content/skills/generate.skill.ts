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
import { buildSystemPrompt, buildUserMessage, type Tone, type PlatformId } from '@/prompts/system'
import { getSupabaseAdmin } from '@/lib/supabase/server'
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
      plan: 'free',
      credits_limit: 50,
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
 * Plan A: Nvidia ile streaming içerik üretimi.
 */
async function tryNvidiaStream(
  systemPrompt: string,
  userMessage: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  startTime: number,
): Promise<{ fullText: string; inputTokens: number; outputTokens: number; modelUsed: string } | null> {
  const nvidiaKey = process.env.NVIDIA_API_KEY
  if (!nvidiaKey) return null

  try {
    console.log('[Generate] Plan A: Nvidia deneniyor...')
    const nvidiaProvider = createOpenAI({
      apiKey: nvidiaKey,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    })

    let fullText = ''
    const nvidiaResult = streamText({
      model: nvidiaProvider('abacusai/dracarys-llama-3.1-70b-instruct'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      temperature: 0.7,
    })

    for await (const chunk of nvidiaResult.textStream) {
      fullText += chunk
      controller.enqueue(encoder.encode('.'))
    }

    const usage = await nvidiaResult.usage
    const inputTokens = (usage as any)?.promptTokens ?? (usage as any)?.inputTokens ?? 0
    const outputTokens = (usage as any)?.completionTokens ?? (usage as any)?.outputTokens ?? 0
    const modelUsed = 'abacusai/dracarys-llama-3.1-70b-instruct (Nvidia)'

    console.log('[Generate] Nvidia başarılı:', {
      inputTokens,
      outputTokens,
      textLen: fullText.length,
      ms: Date.now() - startTime,
    })

    return { fullText, inputTokens, outputTokens, modelUsed }
  } catch (nvidiaErr) {
    console.warn(
      '[Generate] Nvidia başarısız, Claude/Gemini\'ye geçiliyor:',
      nvidiaErr instanceof Error ? nvidiaErr.message : nvidiaErr
    )
    return null
  }
}

/**
 * Plan A: Claude (Anthropic) ile streaming içerik üretimi.
 * @returns { fullText, inputTokens, outputTokens, modelUsed } — başarılıysa
 * @returns null — başarısızsa (Gemini'ye fallback tetiklenir)
 */
async function tryClaudeStream(
  systemPrompt: string,
  userMessage: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  startTime: number,
): Promise<{ fullText: string; inputTokens: number; outputTokens: number; modelUsed: string } | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null

  try {
    console.log('[Generate] Plan B: Claude deneniyor...')
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    let fullText = ''
    const anthropicStream = await client.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 22000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    for await (const chunk of anthropicStream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        fullText += chunk.delta.text
        // Canlı ilerleme: nokta ping (ham metin değil, kesilmiş JSON önle)
        controller.enqueue(encoder.encode('.'))
      }
    }

    const final = await anthropicStream.finalMessage()
    const inputTokens = final.usage.input_tokens
    const outputTokens = final.usage.output_tokens
    const modelUsed = 'claude-sonnet-4-5'

    console.log('[Generate] Claude başarılı:', {
      inputTokens,
      outputTokens,
      textLen: fullText.length,
      ms: Date.now() - startTime,
    })

    return { fullText, inputTokens, outputTokens, modelUsed }
  } catch (claudeErr) {
    console.warn(
      '[Generate] Claude başarısız, Gemini\'ye geçiliyor:',
      claudeErr instanceof Error ? claudeErr.message : claudeErr
    )
    return null
  }
}

/**
 * Plan B: Gemini ile streaming içerik üretimi.
 * Birden fazla model sırasıyla denenir (fallback chain).
 * @returns { fullText, inputTokens, outputTokens, modelUsed } — başarılıysa
 * @throws {Error} Tüm modeller başarısız olursa
 */
async function tryGeminiStream(
  systemPrompt: string,
  userMessage: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  startTime: number,
): Promise<{ fullText: string; inputTokens: number; outputTokens: number; modelUsed: string }> {
  const geminiKey = process.env.GOOGLE_GENERATION_AI_API_KEY
  if (!geminiKey) {
    throw new Error('Gemini API anahtarı eksik.')
  }

  console.log('[Generate] Plan C: Gemini ile üretim başlıyor...')
  const geminiProvider = createGoogleGenerativeAI({ apiKey: geminiKey })

  // Bu API key'inde çalışan modeller (ListModels ile doğrulandı)
  const GEMINI_MODELS = [
    'gemini-2.5-flash',   // En iyi: hızlı + kaliteli
    'gemini-2.0-flash',   // Yedek 1
    'gemini-2.5-pro',     // Yedek 2 (daha yavaş ama güçlü)
  ]

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`[Generate] Gemini model deneniyor: ${modelName}`)

      let fullText = ''
      const geminiResult = streamText({
        model: geminiProvider(modelName),
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        maxOutputTokens: 25192,  // Türkçe içerik için yeterli alan
        temperature: 0.7,
      })

      // Ham chunk'ları topla — kesilmiş JSON'ı önlemek için
      // frontend'e sadece tamamlanınca __RESULT__ gönderiliyor
      for await (const chunk of geminiResult.textStream) {
        fullText += chunk
        // Canlı ilerleme: sadece progress ping gönder (içerik değil)
        controller.enqueue(encoder.encode('.'))
      }

      const usage = await geminiResult.usage
      const inputTokens = usage?.inputTokens ?? 0
      const outputTokens = usage?.outputTokens ?? 0

      console.log(`[Generate] ${modelName} başarılı:`, {
        inputTokens, outputTokens, textLen: fullText.length, ms: Date.now() - startTime,
      })

      return { fullText, inputTokens, outputTokens, modelUsed: modelName }
    } catch (modelErr) {
      console.warn(`[Generate] ${modelName} başarısız:`, modelErr instanceof Error ? modelErr.message : modelErr)
      // Bu modelin kısmi çıktısını sıfırla, sonraki modeli dene
    }
  }

  throw new Error('Tüm Gemini modelleri başarısız oldu.')
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
  const { error: dbError } = await supabase.from('generations').insert({
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
  })

  if (dbError) {
    console.error('[Generate] DB kayıt hatası:', {
      message: dbError.message,
      code: dbError.code,
      details: dbError.details,
      hint: dbError.hint,
    })
  } else {
    console.log('[Generate] DB kayıt başarılı. Status:', parsedResult ? 'completed' : 'failed')
  }

  // Kredi düşümü
  await supabase
    .from('users')
    .update({ credits_used: user.credits_used + 1 })
    .eq('id', user.id)
    .then(({ error }) => {
      if (error) console.error('[Generate] Kredi düşümü hatası:', error)
    })
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

  // ── 2. Kredi kontrolü ──
  if (user.credits_limit - user.credits_used <= 0) {
    throw new GenerateSkillError('Krediniz tükendi.', 403)
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
      // PLAN A: Nvidia
      // ══════════════════════════════════════════════════════
      const nvidiaResult = await tryNvidiaStream(
        systemPrompt,
        userMessage,
        controller,
        encoder,
        startTime,
      )

      if (nvidiaResult) {
        fullText = nvidiaResult.fullText
        inputTokens = nvidiaResult.inputTokens
        outputTokens = nvidiaResult.outputTokens
        modelUsed = nvidiaResult.modelUsed
      }

      // ══════════════════════════════════════════════════════
      // PLAN B: Claude (Anthropic)
      // ══════════════════════════════════════════════════════
      let claudeResult = null
      if (!nvidiaResult) {
        claudeResult = await tryClaudeStream(
          systemPrompt,
          userMessage,
          controller,
          encoder,
          startTime,
        )

        if (claudeResult) {
          fullText = claudeResult.fullText
          inputTokens = claudeResult.inputTokens
          outputTokens = claudeResult.outputTokens
          modelUsed = claudeResult.modelUsed
        }
      }

      // ══════════════════════════════════════════════════════
      // PLAN C: Gemini (Claude ve Nvidia başarısızsa)
      // ══════════════════════════════════════════════════════
      if (!nvidiaResult && !claudeResult) {
        const geminiKey = process.env.GOOGLE_GENERATION_AI_API_KEY
        if (!geminiKey && !process.env.ANTHROPIC_API_KEY && !process.env.NVIDIA_API_KEY) {
          console.error('[Generate] Tüm model anahtarları eksik!')
          controller.enqueue(
            encoder.encode('__ERROR__:İçerik üretim servisi şu an kullanılamıyor.')
          )
          controller.close()
          return
        }

        try {
          const geminiResult = await tryGeminiStream(
            systemPrompt,
            userMessage,
            controller,
            encoder,
            startTime,
          )
          fullText = geminiResult.fullText
          inputTokens = geminiResult.inputTokens
          outputTokens = geminiResult.outputTokens
          modelUsed = geminiResult.modelUsed
        } catch (geminiErr) {
          console.error(
            '[Generate] Gemini HATA:',
            geminiErr instanceof Error ? geminiErr.message : geminiErr
          )
          controller.enqueue(
            encoder.encode('__ERROR__:İki model de yanıt veremiyor. Lütfen tekrar deneyin.')
          )
          controller.close()
          return
        }
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

      controller.close()

      // ══════════════════════════════════════════════════════
      // DB Kayıt (async — response'u bekletmez)
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
    },
  })

  return stream
}
