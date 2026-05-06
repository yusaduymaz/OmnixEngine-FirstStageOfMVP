import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

export async function GET(request: Request) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const url = new URL(request.url)
  const search = url.searchParams.get('q')?.trim() ?? ''
  const planFilter = url.searchParams.get('plan')?.trim() ?? ''
  const roleFilter = url.searchParams.get('role')?.trim() ?? ''

  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('users')
    .select(
      'id, clerk_id, email, full_name, role, plan, title, credits_used, credits_limit, suspended, created_at',
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  if (search) query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
  if (planFilter) query = query.eq('plan', planFilter)
  if (roleFilter) query = query.eq('role', roleFilter)

  const { data: users, error } = await query
  if (error) {
    return NextResponse.json({ hata: 'Kullanıcılar yüklenemedi', detay: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: users ?? [] })
}

const AddCreditSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().min(-100000).max(100000).refine((v) => v !== 0, 'Sıfır geçersiz'),
  note: z.string().trim().max(120).optional(),
})

/**
 * Manuel kredi ekleme/düşme. Negatif amount kredi düşer.
 */
export async function POST(request: Request) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const body = await request.json().catch(() => null)
  const parsed = AddCreditSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ hata: 'Geçersiz istek', detay: parsed.error.flatten() }, { status: 400 })
  }

  const { userId, amount, note } = parsed.data
  const supabase = getSupabaseAdmin()

  const { data: user } = await supabase
    .from('users')
    .select('credits_limit')
    .eq('id', userId)
    .single()

  if (!user) {
    return NextResponse.json({ hata: 'Kullanıcı bulunamadı' }, { status: 404 })
  }

  const newLimit = Math.max(0, (user.credits_limit as number) + amount)

  await supabase.from('users').update({ credits_limit: newLimit }).eq('id', userId)
  await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount,
    type: amount > 0 ? 'purchase' : 'refund',
    module: 'admin',
    reference: note ? `admin:${note}` : 'manuel-islem',
  })

  return NextResponse.json({ basari: true, eklenenKredi: amount, yeniLimit: newLimit })
}
