import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ hata: 'Oturum açmanız gerekiyor' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  const { data: user } = await supabase
    .from('users')
    .select('id, plan, credits_used, credits_limit')
    .eq('clerk_id', userId)
    .single()

  if (!user) {
    return NextResponse.json({ hata: 'Kullanıcı bulunamadı' }, { status: 404 })
  }

  const { data: transactions } = await supabase
    .from('credit_transactions')
    .select('id, amount, type, module, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({
    plan: user.plan,
    creditsUsed: user.credits_used,
    creditsLimit: user.credits_limit,
    transactions: transactions ?? [],
  })
}
