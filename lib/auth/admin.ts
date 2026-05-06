import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'

const ENV_ADMIN_IDS = (process.env.ADMIN_USER_IDS ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)

export interface CurrentUser {
  id: string
  clerk_id: string
  email: string
  full_name: string | null
  role: 'admin' | 'member'
  plan: string
  credits_used: number
  credits_limit: number
  title: string | null
  phone: string | null
  company: string | null
  website: string | null
  about: string | null
  notify_product: boolean
  notify_campaign: boolean
  notify_security: boolean
  suspended: boolean
}

const USER_SELECT =
  'id, clerk_id, email, full_name, role, plan, credits_used, credits_limit, title, phone, company, website, about, notify_product, notify_campaign, notify_security, suspended'

/**
 * Geçerli kullanıcının Supabase satırını döndürür. Yoksa null.
 * Clerk ile sync olduğu varsayılır (webhook üzerinden eklenir).
 */
export async function getCurrentUserWithRole(): Promise<CurrentUser | null> {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('users')
    .select(USER_SELECT)
    .eq('clerk_id', userId)
    .maybeSingle()

  if (!data) return null

  // Env tabanlı admin override (DB henüz güncellenmemişse fallback)
  const envAdmin = ENV_ADMIN_IDS.includes(userId)
  return {
    ...(data as CurrentUser),
    role: envAdmin ? 'admin' : (data.role as 'admin' | 'member'),
  }
}

/**
 * Admin kontrolü — DB'deki role kolonu otorite. Env fallback olarak çalışır.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUserWithRole()
  return user?.role === 'admin'
}

/**
 * API route guard. Admin değilse 403 döner.
 * Kullanım:
 *   const guard = await requireAdmin()
 *   if (guard.error) return guard.error
 *   const { user } = guard
 */
export async function requireAdmin(): Promise<
  | { error: NextResponse; user?: never }
  | { error?: never; user: CurrentUser }
> {
  const user = await getCurrentUserWithRole()
  if (!user || user.role !== 'admin') {
    return { error: NextResponse.json({ hata: 'Yetkisiz erişim' }, { status: 403 }) }
  }
  return { user }
}

/**
 * Oturum açmış kullanıcıyı zorunlu kılar.
 */
export async function requireUser(): Promise<
  | { error: NextResponse; user?: never }
  | { error?: never; user: CurrentUser }
> {
  const user = await getCurrentUserWithRole()
  if (!user) {
    return { error: NextResponse.json({ hata: 'Oturum açmanız gerekiyor' }, { status: 401 }) }
  }
  return { user }
}

/**
 * Clerk profilinden minimum bilgi döner (ad, email).
 * Veritabanında kullanıcı yoksa Clerk'ten doldurmak için kullanılır.
 */
export async function getClerkBasics() {
  const cu = await currentUser()
  if (!cu) return null
  return {
    clerk_id: cu.id,
    email: cu.primaryEmailAddress?.emailAddress ?? '',
    full_name: [cu.firstName, cu.lastName].filter(Boolean).join(' ') || cu.username || null,
  }
}
