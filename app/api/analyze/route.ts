import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validatePlatformIds, type PlatformId } from '@/prompts/system'
import { analyzeSkill, AnalyzeSkillError } from '@/agents/content/skills/analyze.skill'
import { checkRateLimit } from '@/lib/redis'
import { getUserPlan, RATE_LIMITS } from '@/lib/billing/feature-gates'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const RequestSchema = z.object({
  url: z.string().url('Geçerli bir URL giriniz'),
  platforms: z.array(z.string()).min(1, 'En az bir platform seçmelisiniz'),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ hata: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  try {
    const plan = await getUserPlan(userId)
    const { allowed } = await checkRateLimit(userId, RATE_LIMITS[plan].maxRequests, 60)
    if (!allowed) {
      return NextResponse.json(
        { hata: 'Çok fazla istek gönderdiniz. Lütfen bir dakika bekleyin.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }
  } catch (rateLimitErr) {
    console.error('[API/analyze] Rate limit kontrolü hatası:', rateLimitErr)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ hata: 'Geçersiz JSON.' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'Geçersiz istek.'
    return NextResponse.json({ hata: errorMsg }, { status: 400 })
  }

  const { url, platforms: rawPlatforms } = parsed.data

  if (!validatePlatformIds(rawPlatforms)) {
    return NextResponse.json({ hata: 'Geçersiz platform listesi.' }, { status: 400 })
  }
  const platforms = rawPlatforms as PlatformId[]

  try {
    const result = await analyzeSkill({
      userId,
      url,
      platforms,
    })

    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof AnalyzeSkillError) {
      return NextResponse.json({ hata: err.message }, { status: err.statusCode })
    }

    console.error('[API/analyze] Beklenmeyen hata:', err)
    return NextResponse.json(
      { hata: 'Analiz sırasında beklenmeyen bir hata oluştu.' },
      { status: 500 }
    )
  }
}
