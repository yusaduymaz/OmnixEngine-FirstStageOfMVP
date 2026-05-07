import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { updateTicketSchema } from '@/lib/validations/support'
import { sendUserNotification } from '@/lib/email/support-notifications'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET: Admin - Tekil ticket detayı
export async function GET(request: Request, { params }: RouteParams) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { id } = await params
  const supabase = getSupabaseAdmin()

  const { data: ticket, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !ticket) {
    return NextResponse.json({ hata: 'Ticket bulunamadı' }, { status: 404 })
  }

  // Kullanıcı bilgilerini çek
  const { data: user } = await supabase
    .from('users')
    .select('id, email, full_name, plan, company, phone')
    .eq('id', ticket.user_id)
    .single()

  return NextResponse.json({
    ...ticket,
    user: user ?? null,
  })
}

// PATCH: Admin - Ticket güncelle (status, is_read, admin_response)
export async function PATCH(request: Request, { params }: RouteParams) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const { id } = await params
  const body = await request.json().catch(() => null)
  const parsed = updateTicketSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { hata: 'Geçersiz güncelleme verisi', detay: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdmin()

  // Önce ticket'ı kontrol et
  const { data: existingTicket, error: fetchError } = await supabase
    .from('support_tickets')
    .select('*, user:users(id, email, full_name)')
    .eq('id', id)
    .single()

  if (fetchError || !existingTicket) {
    return NextResponse.json({ hata: 'Ticket bulunamadı' }, { status: 404 })
  }

  // Güncelleme verisini hazırla
  const updates: Record<string, unknown> = {}

  if (parsed.data.status !== undefined) {
    updates.status = parsed.data.status
  }

  if (parsed.data.priority !== undefined) {
    updates.priority = parsed.data.priority
  }

  if (parsed.data.is_read !== undefined) {
    updates.is_read = parsed.data.is_read
  }

  if (parsed.data.admin_response !== undefined) {
    updates.admin_response = parsed.data.admin_response
    updates.responded_by = guard.user.id
    updates.responded_at = new Date().toISOString()

    // Yanıt yazıldığında otomatik olarak işlemde veya çözüldü yap
    if (!updates.status) {
      updates.status = 'in_progress'
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ basari: true, guncellenen: 0 })
  }

  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ hata: 'Güncelleme başarısız', detay: error.message }, { status: 500 })
  }

  // Admin yanıtı varsa kullanıcıya email gönder
  if (parsed.data.admin_response && existingTicket.user) {
    const user = existingTicket.user as { id: string; email: string; full_name: string | null }
    sendUserNotification({
      ticketId: id,
      userName: user.full_name ?? user.email,
      userEmail: user.email,
      subject: existingTicket.subject,
      adminResponse: parsed.data.admin_response,
      ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app/support?ticket=${id}`,
    }).catch((err) => {
      console.error('Kullanıcı bildirimi gönderilemedi:', err)
    })

    // Ticket'ı user_notified olarak işaretle
    await supabase.from('support_tickets').update({ user_notified: true }).eq('id', id)
  }

  return NextResponse.json({
    basari: true,
    ticket: data,
  })
}
