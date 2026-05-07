import { getSupabaseAdmin } from '@/lib/supabase/server'
import { moduleCostMicro, type CreditModule } from './credits'

/**
 * OmniX Engine — Atomik Kredi Düşüm Yardımcısı
 * 
 * Tüm skill'ler kredi düşümü için bu fonksiyonu kullanmalıdır.
 * - Pre-flight bakiye kontrolü yapar.
 * - RPC (increment_credits) ile atomik güncelleme yapar.
 * - `credit_transactions` tablosuna iz kaydeder.
 * - Hata durumunda fallback update dener.
 */
export async function chargeCredits(clerkId: string, module: CreditModule, reference?: string) {
  const supabase = getSupabaseAdmin()
  const cost = moduleCostMicro(module)

  console.log(`[chargeCredits] ${clerkId} için ${module} maliyeti (${cost} mikro) düşülüyor...`)

  // 1. Kullanıcıyı ve bakiyesini kontrol et
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, credits_limit, credits_used')
    .eq('clerk_id', clerkId)
    .single()

  if (userError || !user) {
    console.error('[chargeCredits] Kullanıcı bulunamadı:', clerkId)
    throw new Error('Kullanıcı hesabı bulunamadı. Lütfen giriş yapın.')
  }

  const remaining = (user.credits_limit || 0) - (user.credits_used || 0)
  if (remaining < cost) {
    const errorMsg = `Yetersiz kredi. Bu işlem için ${cost / 5000} işlem hakkı (veya ${cost.toLocaleString()} mikro-kredi) gerekiyor. Mevcut bakiyeniz: ${Math.floor(remaining / 5000)} işlem.`
    console.warn('[chargeCredits] Yetersiz bakiye:', { clerkId, remaining, cost })
    throw new Error(errorMsg)
  }

  // 2. Atomik Kredi Artırımı (RPC)
  // users.credits_used alanını artırır (borç/tüketim mantığı)
  const { data: newUsed, error: rpcError } = await supabase.rpc('increment_credits', {
    user_uuid: user.id,
    amount: cost
  })

  if (rpcError) {
    console.error('[chargeCredits] RPC Hatası, fallback deneniyor:', rpcError)
    
    // Fallback: RPC başarısız olursa manuel update
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        credits_used: (user.credits_used || 0) + cost,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('[chargeCredits] Fallback update hatası:', updateError)
      throw new Error('Kredi güncelleme işlemi sırasında bir hata oluştu.')
    }
  }

  // 3. İşlem Kaydı (Audit Log)
  // Negatif değer = kullanım (00005 migration standardı)
  const { error: transError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: user.id,
      amount: -cost,
      type: 'usage',
      module: module,
      reference: reference || null
    })

  if (transError) {
    // İşlem kaydı başarısız olsa bile kredi düşüldüğü için devam ediyoruz 
    // ama logluyoruz.
    console.error('[chargeCredits] Transaction kaydı başarısız:', transError)
  }

  console.log(`[chargeCredits] Başarılı. Yeni tüketim: ${newUsed || (user.credits_used + cost)}`)

  return {
    success: true,
    cost,
    newUsed: newUsed || (user.credits_used + cost)
  }
}
