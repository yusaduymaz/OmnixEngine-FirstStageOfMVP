import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { apiError, withErrorHandler } from '@/lib/api/error-handler'

export const GET = withErrorHandler<{ params: Promise<{ id: string }> }>(async (_req, ctx) => {
  const { userId: clerkId } = await auth()
  if (!clerkId) throw apiError.unauthorized()

  const { id: workspaceId } = await ctx.params
  const supabase = getSupabaseAdmin()

  // Sadece workspace üyeleri listeleyebilir
  const { data: actor } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single()
  if (!actor) throw apiError.unauthorized()

  const { data: ownMembership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', actor.id)
    .maybeSingle()

  if (!ownMembership) throw apiError.forbidden()

  const { data: rows } = await supabase
    .from('workspace_members')
    .select('user_id, role, users(email, full_name)')
    .eq('workspace_id', workspaceId)

  interface MemberRow {
    user_id: string
    role: string
    users: { email: string; full_name: string | null } | null
  }

  const members = ((rows as unknown as MemberRow[]) ?? []).map((r) => ({
    user_id: r.user_id,
    role: r.role,
    email: r.users?.email,
    full_name: r.users?.full_name,
  }))

  return NextResponse.json({ members })
})
