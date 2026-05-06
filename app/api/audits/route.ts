import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { PLANS } from '@/lib/stripe/plans'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    // 1. Kullanıcının UUID'sini al (lazy upsert)
    console.log('[Audits API] Clerk ID aranıyor:', userId)
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .maybeSingle()

    if (userError) {
      console.error('[Audits API] Sorgu hatası:', userError)
      return NextResponse.json({ error: 'Kullanıcı sorgulanırken hata oluştu.' }, { status: 500 })
    }

    // Kullanıcı yoksa lazy upsert
    if (!user) {
      console.log('[Audits API] Kullanıcı DB\'de yok, lazy upsert başlatılıyor...')
      const clerkUser = await currentUser()
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? ''
      const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ')

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          clerk_id: userId,
          email,
          full_name: fullName || email,
          plan: 'trial',
          credits_limit: PLANS.trial.microCredits,
          credits_used: 0,
        })
        .select('id')
        .single()

      if (insertError || !newUser) {
        console.error('[Audits API] Kullanıcı oluşturulamadı:', insertError)
        return NextResponse.json({ error: 'Hesap oluşturulamadı.' }, { status: 500 })
      }

      user = newUser
      console.log('[Audits API] Kullanıcı lazy upsert ile oluşturuldu:', user.id)
    } else {
      console.log('[Audits API] Bulunan User UUID:', user.id)
    }

    // 2. Denetimleri çek
    const { data: audits, error: auditsError } = await supabase
      .from('audits')
      .select(`
        *,
        analyses:analysis_id (*),
        pricing:pricing_id (*),
        inventory:inventory_id (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (auditsError) {
      console.error('[Audits API] Sorgu hatası:', auditsError)
      throw auditsError
    }

    if (audits?.length === 0) {
      console.warn('[Audits API] Kullanıcı için denetim bulunamadı. DB genel kontrolü yapılıyor...')
      const { data: allAudits } = await supabase.from('audits').select('id, user_id, product_name').limit(5)
      console.log('[Audits API] DB deki son 5 kayıt ve user_id leri:', allAudits)
    }

    console.log(`[Audits API] ${audits?.length || 0} adet denetim bulundu.`)
    return NextResponse.json({ audits: audits || [] })
  } catch (error) {
    console.error('[Audits API] Error:', error)
    return NextResponse.json(
      { error: 'Denetim raporları alınırken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
