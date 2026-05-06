import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

export async function GET() {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value, description, updated_at')
    .order('key')

  if (error) {
    return NextResponse.json({ hata: 'Yüklenemedi', detay: error.message }, { status: 500 })
  }
  return NextResponse.json({ settings: data ?? [] })
}

const UpsertSchema = z.object({
  key: z.string().min(1).max(120),
  value: z.unknown(),
  description: z.string().max(500).optional(),
})

export async function PUT(request: Request) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const body = await request.json().catch(() => null)
  const parsed = UpsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ hata: 'Geçersiz veri' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('site_settings').upsert(
    {
      key: parsed.data.key,
      value: parsed.data.value as object,
      description: parsed.data.description,
      updated_by: guard.user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  )

  if (error) {
    return NextResponse.json({ hata: 'Kaydedilemedi', detay: error.message }, { status: 500 })
  }
  return NextResponse.json({ basari: true })
}
