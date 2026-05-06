/**
 * Plan-bazlı özellik erişim kontrolü.
 * Skill ve API route'larında requireFeature() ile guard kullanılır.
 */

import { getSupabaseAdmin } from '@/lib/supabase/server'
import { getPlan, type PlanId, type PlanFeatures } from '@/lib/stripe/plans'
import { ApiError } from '@/lib/api/error-handler'

export type FeatureKey = keyof PlanFeatures

export async function getUserPlan(clerkOrUserId: string, lookup: 'clerk' | 'id' = 'clerk'): Promise<PlanId> {
  const supabase = getSupabaseAdmin()
  const column = lookup === 'clerk' ? 'clerk_id' : 'id'
  const { data } = await supabase
    .from('users')
    .select('plan')
    .eq(column, clerkOrUserId)
    .maybeSingle()
  return ((data?.plan as PlanId) ?? 'trial') as PlanId
}

export function hasFeature(plan: PlanId, feature: FeatureKey): boolean {
  const f = getPlan(plan).features
  const v = f[feature]
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v > 0
  return Boolean(v)
}

export async function requireFeature(
  clerkUserId: string,
  feature: FeatureKey,
  customMessage?: string,
): Promise<void> {
  const plan = await getUserPlan(clerkUserId, 'clerk')
  if (hasFeature(plan, feature)) return

  throw new ApiError(
    403,
    'FEATURE_LOCKED',
    customMessage ??
      `Bu özellik (${feature}) mevcut planınızda yer almıyor. Plan yükseltmeniz gerekiyor.`,
    { feature, currentPlan: plan },
  )
}

/**
 * Sayısal limitler için (workspaces, concurrentRequests).
 */
export function featureLimit(plan: PlanId, feature: FeatureKey): number {
  const v = getPlan(plan).features[feature]
  if (typeof v === 'number') return v
  return v ? 1 : 0
}

/**
 * API Rate Limiting — dakika başı maksimum istek sayısı
 */
export const RATE_LIMITS: Record<PlanId, { maxRequests: number; windowSeconds: number }> = {
  trial:      { maxRequests: 2,  windowSeconds: 60 },
  starter:    { maxRequests: 5,  windowSeconds: 60 },
  growth:     { maxRequests: 10, windowSeconds: 60 },
  agency:     { maxRequests: 20, windowSeconds: 60 },
  enterprise: { maxRequests: 50, windowSeconds: 60 },
}
