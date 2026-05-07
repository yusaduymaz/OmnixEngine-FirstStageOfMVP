import { getSupabaseAdmin } from '@/lib/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'

async function getAdminData() {
  const supabase = getSupabaseAdmin()

  const [
    { data: users },
    { count: totalUsers },
    { data: creditSum },
    { data: recentTransactions },
    { data: siteSettings },
    { data: supportTickets },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('id, clerk_id, email, full_name, role, plan, title, credits_used, credits_limit, suspended, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('users').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('users').select('credits_used').is('deleted_at', null),
    supabase
      .from('credit_transactions')
      .select('id, user_id, amount, type, module, reference, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('site_settings').select('key, value, description, updated_at').order('key'),
    supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { count: newThisMonth } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo)
    .is('deleted_at', null)

  const planCounts: Record<string, number> = {}
  for (const u of users ?? []) {
    planCounts[u.plan as string] = (planCounts[u.plan as string] ?? 0) + 1
  }

  const totalCreditsUsed = creditSum?.reduce((acc, u) => acc + (u.credits_used ?? 0), 0) ?? 0

  // Ticket'lar için kullanıcı bilgilerini ekle
  const userIds = [...new Set(supportTickets?.map((t) => t.user_id) ?? [])]
  let ticketsWithUsers = supportTickets ?? []
  if (userIds.length > 0) {
    const { data: ticketUsers } = await supabase
      .from('users')
      .select('id, email, full_name, plan')
      .in('id', userIds)
    const usersMap = ticketUsers?.reduce((acc, u) => ({ ...acc, [u.id]: u }), {} as Record<string, { id: string; email: string; full_name: string | null; plan: string }>) ?? {}
    ticketsWithUsers = supportTickets?.map((t) => ({ ...t, user: usersMap[t.user_id] ?? null })) ?? []
  }

  return {
    users: users ?? [],
    stats: {
      totalUsers: totalUsers ?? 0,
      totalCreditsUsed,
      newThisMonth: newThisMonth ?? 0,
      planCounts,
    },
    recentTransactions: recentTransactions ?? [],
    siteSettings: siteSettings ?? [],
    supportTickets: ticketsWithUsers,
  }
}

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const data = await getAdminData()
  return <AdminDashboardClient {...data} />
}
