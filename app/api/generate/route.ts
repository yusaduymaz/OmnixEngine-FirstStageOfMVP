/**
 * POST /api/generate — İçerik Üretim API Endpoint'i
 *
 * Bu dosya SADECE API katmanı sorumluluklarını üstlenir:
 *  1. Clerk üzerinden kimlik doğrulama (auth)
 *  2. HTTP isteğinin JSON parse işlemi
 *  3. Zod ile request body validasyonu
 *  4. Platform ID doğrulaması
 *  5. Doğrulanmış parametreleri generateSkill'e iletme
 *  6. Dönen stream'i HTTP response olarak dönme
 *
 * İş mantığı (kredi, prompt, AI çağrı, DB kayıt):
 *  → agents/content/skills/generate.skill.ts
 */

import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { validatePlatformIds, type PlatformId } from '@/prompts/system'
import { generateSkill, GenerateSkillError } from '@/agents/content/skills/generate.skill'
import { checkRateLimit } from '@/lib/redis'
import { getUserPlan, RATE_LIMITS } from '@/lib/billing/feature-gates'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════════════
// İstek Validasyon Şeması
// ═══════════════════════════════════════════════════════════════════

const RequestSchema = z.object({
  product_name: z.string().min(2).max(500),
  category: z.string().optional(),
  language: z.enum(['tr', 'en']).optional(),
  country: z.enum(['TR', 'US', 'UK', 'DE', 'FR', 'IT', 'ES']).optional(),
  platforms: z.array(z.string()).min(1),
  tone: z.enum(['professional', 'friendly', 'luxury', 'discount']),
  extra_keywords: z.string().max(200).optional(),
})

// ═══════════════════════════════════════════════════════════════════
// POST Handler
// ═══════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  // ── 1. Kimlik doğrulama ──
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ hata: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  // ── 1b. Rate limiting ──
  try {
    const plan = await getUserPlan(userId)
    const { allowed } = await checkRateLimit(userId, RATE_LIMITS[plan].maxRequests, 60)
    if (!allowed) {
      return Response.json(
        { hata: 'Çok fazla istek gönderdiniz. Lütfen bir dakika bekleyin.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }
  } catch (rateLimitErr) {
    console.error('[API/generate] Rate limit kontrolü hatası:', rateLimitErr)
  }

  // ── 2. İstek parse ──
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ hata: 'Geçersiz JSON.' }, { status: 400 })
  }

  // ── 3. Zod validasyon ──
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ hata: 'Geçersiz istek.' }, { status: 400 })
  }

  const { product_name, category, language, country, platforms: rawPlatforms, tone, extra_keywords } = parsed.data

  // ── 4. Platform doğrulama ──
  if (!validatePlatformIds(rawPlatforms)) {
    return Response.json({ hata: 'Geçersiz platform listesi.' }, { status: 400 })
  }
  const platforms = rawPlatforms as PlatformId[]

  // ── 5. Skill çağrısı ──
  try {
    const stream = await generateSkill({
      userId,
      productName: product_name,
      category,
      language,
      country,
      platforms,
      tone,
      extraKeywords: extra_keywords,
    })

    // ── 6. Stream'i HTTP response olarak dön ──
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    // GenerateSkillError → uygun HTTP status ile JSON hata dön
    if (err instanceof GenerateSkillError) {
      return Response.json({ hata: err.message }, { status: err.statusCode })
    }

    // Beklenmeyen hatalar
    console.error('[API/generate] Beklenmeyen hata:', err)
    return Response.json(
      { hata: 'İçerik üretim sırasında beklenmeyen bir hata oluştu.' },
      { status: 500 }
    )
  }
}