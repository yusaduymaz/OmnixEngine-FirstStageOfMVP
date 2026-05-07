import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { hasFeature } from '@/lib/billing/feature-gates'
import type { PlanId } from '@/lib/stripe/plans'
import TeamSettingsClient from './TeamSettingsClient'

export const dynamic = 'force-dynamic'

export default async function TeamSettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = getSupabaseAdmin()

  const { data: user } = await supabase
    .from('users')
    .select('id, plan')
    .eq('clerk_id', userId)
    .single()

  if (!user) redirect('/app')

  const plan = (user.plan as PlanId) ?? 'trial'
  if (!hasFeature(plan, 'teams')) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Takımlar</h1>
        <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-sm space-y-3">
          <p className="text-sm text-[#1A1A2E]">
            Takım davet sistemi <strong>Enterprise</strong> planına özeldir.
          </p>
          <p className="text-sm text-[#6B6B7B]">
            Mevcut planınız: <span className="font-semibold uppercase">{plan}</span>. Enterprise plana geçmek için
            satış ekibimizle iletişime geçin.
          </p>
          <a
            href="/iletisim?plan=enterprise"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] text-white px-4 py-2 text-sm font-bold hover:bg-[#e85d2a]"
          >
            Enterprise için iletişim
          </a>
        </div>
      </div>
    )
  }

  // Kullanıcının yöneticisi olduğu workspace'leri al
  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(id, name, owner_id)')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])

  interface MembershipResult {
    workspace_id: string
    role: string
    workspaces: { id: string; name: string; owner_id: string } | null
  }

  const workspaces = ((memberships as unknown as MembershipResult[]) ?? [])
    .map((m) => m.workspaces)
    .filter((w): w is NonNullable<typeof w> => !!w)

  return <TeamSettingsClient workspaces={workspaces} />
}
