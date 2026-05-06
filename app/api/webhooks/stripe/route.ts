import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/client'
import { PLAN_CREDITS, PLANS } from '@/lib/stripe/plans'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET eksik')
    return NextResponse.json({ hata: 'Webhook yapılandırması eksik' }, { status: 500 })
  }

  const body = await request.text()
  const headerPayload = await headers()
  const sig = headerPayload.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ hata: 'Stripe imzası eksik' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[Stripe Webhook] İmza doğrulama başarısız:', err)
    return NextResponse.json({ hata: 'Geçersiz webhook imzası' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId

        if (!userId || !planId) {
          console.error('[Stripe Webhook] checkout.session.completed: metadata eksik', session.id)
          break
        }

        const credits = PLAN_CREDITS[planId as keyof typeof PLAN_CREDITS] ?? PLAN_CREDITS.trial

        await supabase
          .from('users')
          .update({
            plan: planId,
            credits_limit: credits,
            credits_used: 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        await supabase.from('credit_transactions').insert({
          user_id: userId,
          amount: credits,
          type: 'subscription',
          module: null,
          reference: session.id,
        })

        console.info('[Stripe Webhook] Abonelik aktif edildi:', { userId, planId, credits })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        const { data: user } = await supabase
          .from('users')
          .select('id, plan')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!user) {
          console.warn('[Stripe Webhook] subscription.updated: kullanıcı bulunamadı', customerId)
          break
        }

        const priceId = sub.items.data[0]?.price?.id
        if (!priceId) break

        const matchedPlan = Object.values(PLANS).find((p) => p.priceId === priceId)
        if (!matchedPlan) {
          console.warn('[Stripe Webhook] subscription.updated: plan eşleşmedi', priceId)
          break
        }

        if (user.plan !== matchedPlan.id) {
          await supabase
            .from('users')
            .update({
              plan: matchedPlan.id,
              credits_limit: matchedPlan.microCredits,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

          console.info('[Stripe Webhook] Plan güncellendi:', { userId: user.id, plan: matchedPlan.id })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!user) {
          console.warn('[Stripe Webhook] subscription.deleted: kullanıcı bulunamadı', customerId)
          break
        }

        await supabase
          .from('users')
          .update({
            plan: 'trial',
            credits_limit: PLAN_CREDITS.trial,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        await supabase.from('credit_transactions').insert({
          user_id: user.id,
          amount: -1,
          type: 'refund',
          module: null,
          reference: sub.id,
        })

        console.info('[Stripe Webhook] Abonelik iptal edildi:', user.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.warn('[Stripe Webhook] Ödeme başarısız:', {
          customer: invoice.customer,
          amount: invoice.amount_due,
        })
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('[Stripe Webhook] Event işleme hatası:', event.type, err)
    return NextResponse.json({ hata: 'Event işlenemedi' }, { status: 500 })
  }

  return NextResponse.json({ alındı: true })
}
