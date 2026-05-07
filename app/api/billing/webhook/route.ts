import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { handleSubscriptionChange } from '@/lib/stripe/webhook-handlers'
import { PlanId } from '@/lib/stripe/plans'
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
  } catch (err: unknown) {
    const error = err as Error
    console.error(`[StripeWebhook] İmza doğrulama hatası: ${error.message}`)
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const planId = session.metadata?.planId as PlanId | undefined

        if (planId) {
          await handleSubscriptionChange(customerId, planId, 'active')
        }
        break
      }

      case 'customer.subscription.updated': {
        const session = event.data.object as Stripe.Subscription
        const status = session.status as string
        const customerId = session.customer as string
        const planId = session.metadata?.planId as PlanId | undefined

        if (planId) {
          await handleSubscriptionChange(customerId, planId, status)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const session = event.data.object as Stripe.Subscription
        const customerId = session.customer as string
        await handleSubscriptionChange(customerId, 'trial', 'canceled')
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    const error = err as Error
    console.error(`[StripeWebhook] İşlem hatası: ${error.message}`)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
