import { getSupabaseAdmin } from '@/lib/supabase/server'
import { PLANS, type PlanId } from './plans'

/**
 * Stripe'tan gelen abonelik güncellemelerini veri tabanına işler.
 */
export async function handleSubscriptionChange(
  customerId: string,
  planId: PlanId,
  status: string
) {
  const supabase = getSupabaseAdmin()
  const plan = PLANS[planId]

  console.log(`[StripeWebhook] Müşteri ${customerId} için plan güncelleniyor: ${planId} (${status})`)

  // 1. Kullanıcıyı bul
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, plan')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error(`[StripeWebhook] Müşteri bulunamadı: ${customerId}`)
    return
  }

  // 2. Plan ve limitleri güncelle
  // Eğer abonelik aktifse limitleri tanımla, iptal edildiyse trial'a çek (veya kısıtla)
  const isActive = status === 'active' || status === 'trialing'
  
  const updateData = {
    plan: isActive ? planId : 'trial',
    credits_limit: isActive ? plan.microCredits : 250000, // trial limitine çek veya 0 yap
    updated_at: new Date().toISOString()
  }

  const { error: updateError } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', user.id)

  if (updateError) {
    console.error(`[StripeWebhook] Kullanıcı güncelleme hatası:`, updateError)
    throw updateError
  }

  // 3. İşlem kaydı ekle (Opsiyonel: Abonelik değişimi logu)
  await supabase.from('credit_transactions').insert({
    user_id: user.id,
    amount: 0,
    type: 'subscription_change',
    module: 'billing',
    reference: `Stripe: ${planId} - ${status}`
  })

  console.log(`[StripeWebhook] Başarıyla güncellendi: ${user.id}`)
}
