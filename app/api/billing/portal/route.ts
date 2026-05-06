import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ hata: 'Oturum açmanız gerekiyor' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('clerk_id', userId)
    .single()

  if (!user?.stripe_customer_id) {
    return NextResponse.json({ hata: 'Aktif abonelik bulunamadı' }, { status: 404 })
  }

  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id as string,
    return_url: `${appUrl}/app/settings/billing`,
  })

  return NextResponse.json({ url: portalSession.url })
}
