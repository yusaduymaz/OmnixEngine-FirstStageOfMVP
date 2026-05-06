import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getStripe } from '@/lib/stripe/client'
import { PLANS, type PlanId } from '@/lib/stripe/plans'
import { getSupabaseAdmin } from '@/lib/supabase/server'

const CheckoutSchema = z.object({
  planId: z.enum(['starter', 'growth', 'agency']),
})

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ hata: 'Oturum açmanız gerekiyor' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = CheckoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ hata: 'Geçersiz plan seçimi' }, { status: 400 })
  }

  const { planId } = parsed.data
  const plan = PLANS[planId as PlanId]

  if (!plan.priceId) {
    return NextResponse.json({ hata: 'Ödeme sistemi yapılandırılmamış' }, { status: 503 })
  }

  const supabase = getSupabaseAdmin()
  const { data: user } = await supabase
    .from('users')
    .select('id, email, stripe_customer_id')
    .eq('clerk_id', userId)
    .single()

  if (!user) {
    return NextResponse.json({ hata: 'Kullanıcı bulunamadı' }, { status: 404 })
  }

  const stripe = getStripe()

  let customerId = user.stripe_customer_id as string | undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email as string,
      metadata: { userId: user.id as string, clerkId: userId },
    })
    customerId = customer.id

    await supabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: plan.priceId, quantity: 1 }],
    metadata: { userId: user.id as string, planId },
    success_url: `${appUrl}/app/settings/billing?success=1`,
    cancel_url: `${appUrl}/app/settings/billing?canceled=1`,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  })

  return NextResponse.json({ url: session.url })
}
