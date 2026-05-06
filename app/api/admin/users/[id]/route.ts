import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

const PLANS = ['trial', 'starter', 'growth', 'agency', 'enterprise'] as const
const ROLES = ['admin', 'member'] as const

const UpdateSchema = z.object({
  plan: z.enum(PLANS).optional(),
  role: z.enum(ROLES).optional(),
  credits_limit: z.number().int().min(0).max(10_000_000).optional(),
  title: z.string().trim().max(120).nullable().optional(),
  suspended: z.boolean().optional(),
})

/**
 * Tek kullanıcı detayı: profil + son işlemler + kullanım istatistikleri.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { id } = await params
  const supabase = getSupabaseAdmin()

  const { data: user, error } = await supabase
    .from('users')
    .select(
      'id, clerk_id, email, full_name, role, plan, title, phone, company, website, about, credits_used, credits_limit, suspended, suspended_at, created_at, updated_at, stripe_customer_id',
    )
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  if (error || !user) {
    return NextResponse.json({ hata: 'Kullanıcı bulunamadı' }, { status: 404 })
  }

  const [{ count: generationCount }, { count: analysisCount }, { count: imageCount }, { data: transactions }] =
    await Promise.all([
      supabase.from('generations').select('*', { count: 'exact', head: true }).eq('user_id', id),
      supabase.from('analyses').select('*', { count: 'exact', head: true }).eq('user_id', id),
      supabase.from('images').select('*', { count: 'exact', head: true }).eq('user_id', id),
      supabase
        .from('credit_transactions')
        .select('id, amount, type, module, reference, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

  return NextResponse.json({
    user,
    stats: {
      generationCount: generationCount ?? 0,
      analysisCount: analysisCount ?? 0,
      imageCount: imageCount ?? 0,
    },
    transactions: transactions ?? [],
  })
}

/**
 * Plan / rol / kredi limiti / unvan / askıya alma güncellemesi.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ hata: 'Geçersiz istek', detay: parsed.error.flatten() }, { status: 400 })
  }

  if (id === guard.user.id && parsed.data.role === 'member') {
    return NextResponse.json(
      { hata: 'Kendi admin yetkinizi kaldıramazsınız' },
      { status: 400 },
    )
  }

  const supabase = getSupabaseAdmin()
  const updates: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.suspended !== undefined) {
    updates.suspended_at = parsed.data.suspended ? new Date().toISOString() : null
  }

  const { error } = await supabase.from('users').update(updates).eq('id', id)
  if (error) {
    return NextResponse.json({ hata: 'Güncelleme başarısız', detay: error.message }, { status: 500 })
  }

  return NextResponse.json({ basari: true })
}

/**
 * Yumuşak silme: deleted_at set + suspended=true.
 * Veriler korunur ama listelerde görünmez.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { id } = await params
  if (id === guard.user.id) {
    return NextResponse.json({ hata: 'Kendi hesabınızı silemezsiniz' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('users')
    .update({ deleted_at: new Date().toISOString(), suspended: true, suspended_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ hata: 'Silme başarısız', detay: error.message }, { status: 500 })
  }

  return NextResponse.json({ basari: true })
}
