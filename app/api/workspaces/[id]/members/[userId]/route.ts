import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { apiError, withErrorHandler } from '@/lib/api/error-handler'

const RoleSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer']),
})

import { SupabaseClient } from '@supabase/supabase-js'

async function ensureManager(supabase: SupabaseClient, clerkId: string, workspaceId: string) {
  const { data: actor } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single()
  if (!actor) throw apiError.unauthorized()

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', actor.id)
    .maybeSingle()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    throw apiError.forbidden('Üye yönetme yetkiniz yok.')
  }
  return actor
}

export const PATCH = withErrorHandler<{ params: Promise<{ id: string; userId: string }> }>(
  async (req, ctx) => {
    const { userId: clerkId } = await auth()
    if (!clerkId) throw apiError.unauthorized()

    const { id: workspaceId, userId: targetUserId } = await ctx.params
    const supabase = getSupabaseAdmin()
    await ensureManager(supabase, clerkId, workspaceId)

    const body = await req.json().catch(() => null)
    const { role } = RoleSchema.parse(body)

    const { error } = await supabase
      .from('workspace_members')
      .update({ role })
      .eq('workspace_id', workspaceId)
      .eq('user_id', targetUserId)
      .neq('role', 'owner') // owner rolü PATCH ile değişmez

    if (error) throw apiError.internal('Rol güncellenemedi.', error.message)
    return NextResponse.json({ ok: true })
  },
)

export const DELETE = withErrorHandler<{ params: Promise<{ id: string; userId: string }> }>(
  async (_req, ctx) => {
    const { userId: clerkId } = await auth()
    if (!clerkId) throw apiError.unauthorized()

    const { id: workspaceId, userId: targetUserId } = await ctx.params
    const supabase = getSupabaseAdmin()
    await ensureManager(supabase, clerkId, workspaceId)

    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', targetUserId)
      .neq('role', 'owner')

    if (error) throw apiError.internal('Üye çıkarılamadı.', error.message)
    return NextResponse.json({ ok: true })
  },
)
