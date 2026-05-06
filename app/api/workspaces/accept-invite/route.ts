import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { apiError, withErrorHandler } from '@/lib/api/error-handler'

const Schema = z.object({ token: z.string().min(10) })

export const POST = withErrorHandler(async (req) => {
  const { userId } = await auth()
  if (!userId) throw apiError.unauthorized()

  const body = await req.json().catch(() => null)
  const { token } = Schema.parse(body)

  const supabase = getSupabaseAdmin()

  // Davete bağlanan kullanıcının DB karşılığını bul/oluştur
  let { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('clerk_id', userId)
    .single()

  if (!user) {
    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? ''
    const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ')
    const ins = await supabase
      .from('users')
      .insert({ clerk_id: userId, email, full_name: fullName || email, plan: 'trial' })
      .select('id, email')
      .single()
    if (ins.error || !ins.data) throw apiError.internal('Kullanıcı oluşturulamadı.')
    user = ins.data
  }

  const { data: workspaceId, error } = await supabase
    .rpc('accept_team_invitation', { invite_token: token, accepting_user: user.id })

  if (error) {
    throw apiError.badRequest(error.message ?? 'Davet kabul edilemedi.')
  }

  return NextResponse.json({ workspaceId })
})
