import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { ticketListFilterSchema } from '@/lib/validations/support'

// GET: Admin - Tüm ticketları listele (filtreleme ile)
export async function GET(request: Request) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { searchParams } = new URL(request.url)
  const filterResult = ticketListFilterSchema.safeParse({
    status: searchParams.get('status') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    is_read: searchParams.get('is_read') ?? undefined,
    page: searchParams.get('page') ?? 1,
    limit: searchParams.get('limit') ?? 20,
  })

  if (!filterResult.success) {
    return NextResponse.json(
      { hata: 'Geçersiz filtre parametreleri', detay: filterResult.error.flatten() },
      { status: 400 }
    )
  }

  const { page, limit, status, category, is_read } = filterResult.data
  const offset = (page - 1) * limit

  const supabase = getSupabaseAdmin()

  // Önce ticketları çek
  let query = supabase
    .from('support_tickets')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (is_read && is_read !== 'all') {
    query = query.eq('is_read', is_read === 'true')
  }

  const { data: tickets, error, count } = await query

  if (error) {
    return NextResponse.json({ hata: 'Ticketlar yüklenemedi', detay: error.message }, { status: 500 })
  }

  // Kullanıcı bilgilerini çek
  const userIds = [...new Set(tickets?.map((t) => t.user_id) ?? [])]
  let usersMap: Record<string, { id: string; email: string; full_name: string | null; plan: string }> = {}

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, email, full_name, plan')
      .in('id', userIds)

    if (users) {
      usersMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {})
    }
  }

  // Ticket'ları kullanıcı bilgileriyle birleştir
  const ticketsWithUsers = tickets?.map((ticket) => ({
    ...ticket,
    user: usersMap[ticket.user_id] ?? null,
  })) ?? []

  return NextResponse.json({
    tickets: ticketsWithUsers,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  })
}
