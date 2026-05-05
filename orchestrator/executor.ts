// OmniX Engine — Orchestrator Executor
// Agentları paralel çalıştırır ve sonuçları birleştirir

import type { AgentRoute, SharedContext } from './types'
import type { AgentType } from '@/types/global'

// ═══════════════════════════════════════════════════════
// Agent Çalıştırıcı
// ═══════════════════════════════════════════════════════

/**
 * Tek bir agentı skill'leriyle birlikte çalıştırır
 * TODO: Sprint 6'da gerçek agent implementasyonlarıyla bağlanacak
 */
async function executeAgent(
  route: AgentRoute,
  context: SharedContext
): Promise<{ agent: AgentType; result: unknown }> {
  console.log(`[Orchestrator] ${route.agent} agentı başlatılıyor — skills: ${route.skills.join(', ')}`)

  // TODO: Gerçek agent implementasyonu
  // const agent = getAgent(route.agent)
  // return agent.execute(route.skills, context)

  return {
    agent: route.agent,
    result: { status: 'pending', skills: route.skills },
  }
}

// ═══════════════════════════════════════════════════════
// Paralel Çalıştırma
// ═══════════════════════════════════════════════════════

/**
 * Birden fazla agentı Promise.allSettled ile paralel çalıştırır
 * Bir agent hata verse bile diğerleri çalışmaya devam eder
 */
export async function executeParallel(
  routes: AgentRoute[],
  context: SharedContext
): Promise<{
  results: Record<string, unknown>
  errors: Record<string, string>
}> {
  const settlements = await Promise.allSettled(
    routes.map((route) => executeAgent(route, context))
  )

  const results: Record<string, unknown> = {}
  const errors: Record<string, string> = {}

  settlements.forEach((settlement, index) => {
    const agent = routes[index].agent

    if (settlement.status === 'fulfilled') {
      results[agent] = settlement.value.result
    } else {
      errors[agent] = settlement.reason?.message || 'Bilinmeyen hata'
      console.error(`[Orchestrator] ${agent} agentı hata verdi:`, settlement.reason)
    }
  })

  return { results, errors }
}
