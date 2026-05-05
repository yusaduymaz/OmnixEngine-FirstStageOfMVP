import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { processImageSkill, ImageProcessError } from '@/agents/image/skills/process.skill'
import type { ImageAction } from '@/agents/image/types/process.types'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ImageRequestSchema = z.object({
  imageUrl: z.string().url('Geçerli bir görsel URL\'si veya Base64 giriniz').or(z.string().startsWith('data:image/')),
  action: z.enum(['remove-background', 'replace-background', 'resize']),
  settings: z.object({
    prompt: z.string().optional(),
    preset: z.string().optional(),
  }).optional()
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ hata: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ hata: 'Geçersiz JSON formatı.' }, { status: 400 })
  }

  const parsed = ImageRequestSchema.safeParse(body)
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'Geçersiz istek parametreleri.'
    return NextResponse.json({ hata: errorMsg }, { status: 400 })
  }

  try {
    const result = await processImageSkill({
      userId,
      imageUrl: parsed.data.imageUrl,
      action: parsed.data.action as ImageAction,
      settings: parsed.data.settings
    })

    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof ImageProcessError) {
      return NextResponse.json({ hata: err.message }, { status: err.statusCode })
    }

    console.error('[API/image] Beklenmeyen hata:', err)
    return NextResponse.json(
      { hata: 'Görsel işleme sırasında beklenmeyen bir hata oluştu.' },
      { status: 500 }
    )
  }
}
