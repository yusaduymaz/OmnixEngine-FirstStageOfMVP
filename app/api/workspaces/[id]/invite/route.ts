import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { apiError, withErrorHandler } from '@/lib/api/error-handler'
import { requireFeature } from '@/lib/billing/feature-gates'

const InviteSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin.'),
  role: z.enum(['admin', 'editor', 'viewer']).default('editor'),
})

const INVITE_TTL_DAYS = 7

import { SupabaseClient } from '@supabase/supabase-js'

async function ensureWorkspaceManager(supabase: SupabaseClient, userClerkId: string, workspaceId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userClerkId)
    .single()
  if (!user) throw apiError.unauthorized()

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    throw apiError.forbidden('Bu workspace üzerinde davet gönderme yetkiniz yok.')
  }
  return user
}

export const POST = withErrorHandler<{ params: Promise<{ id: string }> }>(async (req, ctx) => {
  const { userId } = await auth()
  if (!userId) throw apiError.unauthorized()

  // Sadece teams özelliği açık planlar
  await requireFeature(userId, 'teams')

  const { id: workspaceId } = await ctx.params
  const body = await req.json().catch(() => null)
  const input = InviteSchema.parse(body)

  const supabase = getSupabaseAdmin()
  const inviter = await ensureWorkspaceManager(supabase, userId, workspaceId)

  const token = crypto.randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000)

  const { data: invite, error } = await supabase
    .from('team_invitations')
    .insert({
      workspace_id: workspaceId,
      invited_by: inviter.id,
      email: input.email.toLowerCase(),
      role: input.role,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select('id, email, role, expires_at, created_at')
    .single()

  if (error || !invite) {
    throw apiError.internal('Davet kaydedilemedi.', error?.message)
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const inviteUrl = `${baseUrl}/app/accept-invite?token=${token}`

  // TODO: Resend ile e-posta gönder. Şimdilik URL döner.
  return NextResponse.json({
    invite: { ...invite, inviteUrl },
  })
})

export const GET = withErrorHandler<{ params: Promise<{ id: string }> }>(async (_req, ctx) => {
  const { userId } = await auth()
  if (!userId) throw apiError.unauthorized()

  const { id: workspaceId } = await ctx.params
  const supabase = getSupabaseAdmin()
  await ensureWorkspaceManager(supabase, userId, workspaceId)

  const { data: invites } = await supabase
    .from('team_invitations')
    .select('id, email, role, expires_at, accepted_at, revoked_at, created_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ invites: invites ?? [] })
})

export const DELETE = withErrorHandler<{ params: Promise<{ id: string }> }>(async (req, ctx) => {
  const { userId } = await auth()
  if (!userId) throw apiError.unauthorized()

  const { id: workspaceId } = await ctx.params
  const url = new URL(req.url)
  const inviteId = url.searchParams.get('inviteId')
  if (!inviteId) throw apiError.badRequest('inviteId gerekli.')

  const supabase = getSupabaseAdmin()
  await ensureWorkspaceManager(supabase, userId, workspaceId)

  await supabase
    .from('team_invitations')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', inviteId)
    .eq('workspace_id', workspaceId)

  return NextResponse.json({ ok: true })
})
