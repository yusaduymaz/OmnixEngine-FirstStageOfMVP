import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { PLANS } from '@/lib/stripe/plans'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ hata: 'Oturum açmanız gerekiyor' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, plan, credits_used, credits_limit')
    .eq('clerk_id', userId)
    .maybeSingle()

  let user = userData

  if (userError) {
    return NextResponse.json({ hata: 'Kullanıcı sorgulanırken hata oluştu' }, { status: 500 })
  }

  // Kullanıcı yoksa lazy upsert
  if (!user) {
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
      .select('id, plan, credits_used, credits_limit')
      .single()

    if (insertError || !newUser) {
      return NextResponse.json({ hata: 'Hesap oluşturulamadı' }, { status: 500 })
    }

    user = newUser
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
