import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    // 1. Kullanıcının UUID'sini al
    console.log('[Audits API] Clerk ID aranıyor:', userId)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      console.error('[Audits API] Kullanıcı bulunamadı veya hata:', userError)
      return NextResponse.json({ error: 'Kullanıcı kaydı bulunamadı.' }, { status: 404 })
    }

    console.log('[Audits API] Bulunan User UUID:', user.id)

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
