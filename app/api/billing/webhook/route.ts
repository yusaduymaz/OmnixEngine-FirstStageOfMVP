import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { handleSubscriptionChange } from '@/lib/stripe/webhook-handlers'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature') as string

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`[StripeWebhook] İmza doğrulama hatası: ${err.message}`)
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
  }

  const session = event.data.object as any

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const subscriptionId = session.subscription as string
        const customerId = session.customer as string
        const planId = session.metadata?.planId as any

        if (planId) {
          await handleSubscriptionChange(customerId, planId, 'active')
        }
        break
      }

      case 'customer.subscription.updated': {
        const status = session.status
        const customerId = session.customer as string
        // Metadata abonelik nesnesinde olmayabilir, checkout'tan customer'a geçmiş olmalı
        // Veya fiyata göre planı bulabiliriz. Şimdilik metadata'ya güveniyoruz.
        const planId = session.metadata?.planId as any
        
        if (planId) {
          await handleSubscriptionChange(customerId, planId, status)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const customerId = session.customer as string
        await handleSubscriptionChange(customerId, 'trial', 'canceled')
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error(`[StripeWebhook] İşlem hatası: ${err.message}`)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
