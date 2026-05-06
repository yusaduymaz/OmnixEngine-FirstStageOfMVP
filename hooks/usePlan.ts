'use client'

import { useQuery } from '@tanstack/react-query'
import { getPlan, type PlanId, type PlanFeatures } from '@/lib/stripe/plans'

export interface UserBillingData {
  plan: PlanId
  creditsUsed: number
  creditsLimit: number
  transactions: Array<{
    id: string
    amount: number
    type: string
    module: string | null
    created_at: string
  }>
}

async function fetchBilling(): Promise<UserBillingData> {
  const res = await fetch('/api/user/billing', { cache: 'no-store' })
  if (!res.ok) throw new Error('Plan bilgisi alınamadı')
  return res.json()
}

/**
 * Mevcut kullanıcının plan + kredi durumu + feature flag'lerini döner.
 * UI'da kilit ikonları, upgrade prompt'ları ve sayısal limit kontrolleri için kullanılır.
 */
export function usePlan() {
  const query = useQuery({
    queryKey: ['user', 'billing'],
    queryFn: fetchBilling,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const planId = (query.data?.plan ?? 'trial') as PlanId
  const planDef = getPlan(planId)
  const features = planDef.features
  const creditsRemaining = Math.max(0, (query.data?.creditsLimit ?? 0) - (query.data?.creditsUsed ?? 0))

  function has(feature: keyof PlanFeatures): boolean {
    const v = features[feature]
    if (typeof v === 'boolean') return v
    if (typeof v === 'number') return v > 0
    return Boolean(v)
  }

  function limit(feature: keyof PlanFeatures): number {
    const v = features[feature]
    return typeof v === 'number' ? v : v ? 1 : 0
  }

  return {
    isLoading: query.isLoading,
    error: query.error,
    plan: planDef,
    planId,
    features,
    creditsUsed: query.data?.creditsUsed ?? 0,
    creditsLimit: query.data?.creditsLimit ?? 0,
    creditsRemaining,
    transactions: query.data?.transactions ?? [],
    has,
    limit,
    refetch: query.refetch,
  }
}
