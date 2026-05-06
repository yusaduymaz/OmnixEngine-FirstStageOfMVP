import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabaseAdmin()

    // 1. Kullanıcının UUID'sini al
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ audits: [] })
    }

    // 2. Denetimleri çek (İlişkili tablolarla birlikte)
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

    if (auditsError) throw auditsError

    return NextResponse.json({ audits })
  } catch (error) {
    console.error('[Audits API] Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
