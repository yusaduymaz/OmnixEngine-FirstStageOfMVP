import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/admin'
import { createTicketSchema, ticketListFilterSchema } from '@/lib/validations/support'
import { sendAdminNotification } from '@/lib/email/support-notifications'

// GET: Kullanıcının kendi ticketlarını listele
export async function GET(request: Request) {
  const guard = await requireUser()
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

  const { page, limit, status, category } = filterResult.data
  const offset = (page - 1) * limit

  const supabase = getSupabaseAdmin()
  let query = supabase
    .from('support_tickets')
    .select('*', { count: 'exact' })
    .eq('user_id', guard.user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ hata: 'Ticketlar yüklenemedi', detay: error.message }, { status: 500 })
  }

  return NextResponse.json({
    tickets: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  })
}

// POST: Yeni ticket oluştur
export async function POST(request: Request) {
  const guard = await requireUser()
  if (guard.error) return guard.error

  const body = await request.json().catch(() => null)
  const parsed = createTicketSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { hata: 'Geçersiz ticket verisi', detay: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdmin()
  const ticketData = {
    user_id: guard.user.id,
    category: parsed.data.category,
    subject: parsed.data.subject,
    message: parsed.data.message,
    attachment_path: parsed.data.attachment_path ?? null,
    attachment_name: parsed.data.attachment_name ?? null,
    attachment_size: parsed.data.attachment_size ?? null,
    attachment_type: parsed.data.attachment_type ?? null,
    page_url: parsed.data.page_url || null,
    browser_info: parsed.data.browser_info ?? null,
    status: 'open',
    priority: 'normal',
    is_read: false,
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .insert(ticketData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ hata: 'Ticket oluşturulamadı', detay: error.message }, { status: 500 })
  }

  // Admin'e email bildirimi gönder (arka planda)
  sendAdminNotification({
    ticketId: data.id,
    userName: guard.user.full_name ?? guard.user.email,
    userEmail: guard.user.email,
    category: parsed.data.category,
    subject: parsed.data.subject,
    message: parsed.data.message,
    ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin?tab=support&ticket=${data.id}`,
  }).catch((err) => {
    console.error('Admin bildirimi gönderilemedi:', err)
  })

  // Ticket'ı admin_notified olarak işaretle
  await supabase.from('support_tickets').update({ admin_notified: true }).eq('id', data.id)

  return NextResponse.json({
    basari: true,
    ticket: data,
  })
}
