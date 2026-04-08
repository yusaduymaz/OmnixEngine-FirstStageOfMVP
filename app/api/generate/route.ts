import { auth, currentUser } from '@clerk/nextjs/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { buildSystemPrompt, buildUserMessage, validatePlatformIds, type Tone, type PlatformId } from '@/prompts/system'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const RequestSchema = z.object({
  product_name: z.string().min(2).max(500),
  category: z.string().optional(),
  language: z.enum(['tr', 'en']).optional(),
  country: z.enum(['TR', 'US', 'UK', 'DE', 'FR', 'IT', 'ES']).optional(),
  platforms: z.array(z.string()).min(1),
  tone: z.enum(['professional', 'friendly', 'luxury', 'discount']),
  extra_keywords: z.string().max(200).optional(),
})

/**
 * AI çıktısından JSON'ı güvenli şekilde çeker.
 *
 * Strateji (sırayla denenir):
 *  1. indexOf/lastIndexOf ile { } bloğunu kes — en güvenilir yöntem
 *  2. Markdown temizle (```json ... ```) ve tekrar dene
 *  3. Trailing comma düzelt ve son kez dene
 */
function extractFirstJSON(rawText: string): Record<string, unknown> | null {
  // ── Katman 1: indexOf + lastIndexOf (kullanıcının talep ettiği yöntem) ──
  const attempt = (text: string): Record<string, unknown> | null => {
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
  const attemptWithClean = (text: string): Record<string, unknown> | null => {
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

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  // Kimlik doğrulama
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ hata: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  // İstek parse + validasyon
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ hata: 'Geçersiz JSON.' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ hata: 'Geçersiz istek.' }, { status: 400 })
  }

  const { product_name, category, language, country, platforms: rawPlatforms, tone, extra_keywords } = parsed.data
  
  if (!validatePlatformIds(rawPlatforms)) {
    return Response.json({ hata: 'Geçersiz platform listesi.' }, { status: 400 })
  }
  const platforms = rawPlatforms as PlatformId[]

  const supabase = getSupabaseAdmin()

  // Kullanıcı çek / oluştur (Self-Healing Upsert)
  let { data: user } = await supabase
    .from('users')
    .select('id, credits_used, credits_limit, plan')
    .eq('clerk_id', userId)
    .single()

  if (!user) {
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
      return Response.json({ hata: 'Hesap oluşturulamadı.' }, { status: 500 })
    }
    user = newUser
    console.log('[Generate] Kullanıcı lazy upsert ile oluşturuldu:', userId)
  }

  if (user.credits_limit - user.credits_used <= 0) {
    return Response.json({ hata: 'Krediniz tükendi.' }, { status: 403 })
  }

  const systemPrompt = buildSystemPrompt({ platforms, tone: tone as Tone, category, language, country, extraRules: extra_keywords })
  const userMessage = buildUserMessage({
    productName: product_name,
    category,
    platforms,
    tone: tone as Tone,
    language,
    country,
    extraKeywords: extra_keywords,
  })

  console.log('[Generate] Başlıyor:', { product_name, platforms, tone })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = ''
      let modelUsed = 'gemini'
      let inputTokens = 0
      let outputTokens = 0

      // ══════════════════════════════════════════════════════
      // PLAN A: Claude (Anthropic)
      // ══════════════════════════════════════════════════════
      let claudeSuccess = false

      if (process.env.ANTHROPIC_API_KEY) {
        try {
          console.log('[Generate] Plan A: Claude deneniyor...')
          const Anthropic = (await import('@anthropic-ai/sdk')).default
          const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
          inputTokens = final.usage.input_tokens
          outputTokens = final.usage.output_tokens
          modelUsed = 'claude-sonnet-4-5'
          claudeSuccess = true

          console.log('[Generate] Claude başarılı:', {
            inputTokens,
            outputTokens,
            textLen: fullText.length,
            ms: Date.now() - startTime,
          })
        } catch (claudeErr) {
          console.warn(
            '[Generate] Claude başarısız, Gemini\'ye geçiliyor:',
            claudeErr instanceof Error ? claudeErr.message : claudeErr
          )
          fullText = ''
        }
      }

      // ══════════════════════════════════════════════════════
      // PLAN B: Gemini
      // ══════════════════════════════════════════════════════
      if (!claudeSuccess) {
        const geminiKey = process.env.GOOGLE_GENERATION_AI_API_KEY
        if (!geminiKey) {
          console.error('[Generate] Her iki model anahtarı da eksik!')
          controller.enqueue(
            encoder.encode('__ERROR__:İçerik üretim servisi şu an kullanılamıyor.')
          )
          controller.close()
          return
        }

        try {
          console.log('[Generate] Plan B: Gemini ile üretim başlıyor...')
          const geminiProvider = createGoogleGenerativeAI({ apiKey: geminiKey })

          // Bu API key'inde çalışan modeller (ListModels ile doğrulandı)
          const GEMINI_MODELS = [
            'gemini-2.5-flash',   // En iyi: hızlı + kaliteli
            'gemini-2.0-flash',   // Yedek 1
            'gemini-2.5-pro',     // Yedek 2 (daha yavaş ama güçlü)
          ]
          let geminiSuccess = false

          for (const modelName of GEMINI_MODELS) {
            if (geminiSuccess) break
            try {
              console.log(`[Generate] Gemini model deneniyor: ${modelName}`)

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
              inputTokens = usage?.inputTokens ?? 0
              outputTokens = usage?.outputTokens ?? 0
              modelUsed = modelName
              geminiSuccess = true

              console.log(`[Generate] ${modelName} başarılı:`, {
                inputTokens, outputTokens, textLen: fullText.length, ms: Date.now() - startTime,
              })
            } catch (modelErr) {
              console.warn(`[Generate] ${modelName} başarısız:`, modelErr instanceof Error ? modelErr.message : modelErr)
              fullText = '' // Bu modelin kısmi çıktısını sıfırla
            }
          }

          if (!geminiSuccess) {
            throw new Error('Tüm Gemini modelleri başarısız oldu.')
          }
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
          parsedResult.titles = (parsedResult.titles as Array<{ text: string; platform: string; char_count?: number }>)
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
      const seoScore =
        typeof parsedResult?.seo_score === 'number' ? parsedResult.seo_score : null

      const { error: dbError } = await supabase.from('generations').insert({
        user_id: user!.id,
        product_name,
        category_path: category ?? null,
        platform: platforms,
        content_types: ['title', 'description', 'ad_copy'],
        tone,
        extra_keywords: extra_keywords
          ? extra_keywords.split(',').map((k) => k.trim())
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

      await supabase
        .from('users')
        .update({ credits_used: user!.credits_used + 1 })
        .eq('id', user!.id)
        .then(({ error }) => {
          if (error) console.error('[Generate] Kredi düşümü hatası:', error)
        })

      console.log('[Generate] Tamamlandı:', {
        model: modelUsed,
        seoScore,
        ms: Date.now() - startTime,
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}