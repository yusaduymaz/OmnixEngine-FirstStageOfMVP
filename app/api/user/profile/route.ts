import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/admin'

export async function GET() {
  const guard = await requireUser()
  if (guard.error) return guard.error

  const { user } = guard
  return NextResponse.json({
    id: user.id,
    email: user.email,
    fullName: user.full_name ?? '',
    role: user.role,
    plan: user.plan,
    title: user.title ?? '',
    phone: user.phone ?? '',
    company: user.company ?? '',
    website: user.website ?? '',
    about: user.about ?? '',
    creditsUsed: user.credits_used,
    creditsLimit: user.credits_limit,
    notifyProduct: user.notify_product,
    notifyCampaign: user.notify_campaign,
    notifySecurity: user.notify_security,
  })
}

const ProfileSchema = z.object({
  fullName: z.string().trim().max(120).optional(),
  title: z.string().trim().max(120).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  company: z.string().trim().max(255).optional().nullable(),
  website: z.string().trim().max(255).optional().nullable(),
  about: z.string().trim().max(2000).optional().nullable(),
  notifyProduct: z.boolean().optional(),
  notifyCampaign: z.boolean().optional(),
  notifySecurity: z.boolean().optional(),
})

export async function PATCH(request: Request) {
  const guard = await requireUser()
  if (guard.error) return guard.error

  const body = await request.json().catch(() => null)
  const parsed = ProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ hata: 'Geçersiz profil verisi', detay: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const updates: Record<string, unknown> = {}
  const map: Record<string, string> = {
    fullName: 'full_name',
    title: 'title',
    phone: 'phone',
    company: 'company',
    website: 'website',
    about: 'about',
    notifyProduct: 'notify_product',
    notifyCampaign: 'notify_campaign',
    notifySecurity: 'notify_security',
  }
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) updates[map[k]] = v === '' ? null : v
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ basari: true, guncellenen: 0 })
  }

  const { error } = await supabase.from('users').update(updates).eq('id', guard.user.id)
  if (error) {
    return NextResponse.json({ hata: 'Güncelleme başarısız', detay: error.message }, { status: 500 })
  }

  return NextResponse.json({ basari: true, guncellenen: Object.keys(updates).length })
}
