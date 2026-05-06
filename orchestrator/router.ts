// OmniX Engine — Orchestrator Router
// Hangi agent(lar) çalışacak karar verir

import type { OrchestratorRequest, AgentRoute } from './types'

// ═══════════════════════════════════════════════════════
// Agent Yönlendirme Mantığı
// ═══════════════════════════════════════════════════════

/**
 * İstek tipine göre hangi agentların hangi skill'lerle çalışacağını belirler
 */
export function routeRequest(req: OrchestratorRequest): AgentRoute[] {
  switch (req.type) {
    // Full Product Audit → tüm agentlar paralel çalışır
    case 'full_audit':
      return [
        { agent: 'content', skills: ['analyze', 'generate'], priority: 'high' },
        { agent: 'pricing', skills: ['competitor', 'price-rec'], priority: 'high' },
        { agent: 'inventory', skills: ['forecast', 'anomaly'], priority: 'normal' },
      ]

    // Tekil agent istekleri
    case 'content':
      return [
        { agent: 'content', skills: ['generate'], priority: 'high' },
      ]

    case 'image':
      return [
        { agent: 'image', skills: ['bg-remove', 'studio-render'], priority: 'high' },
      ]

    case 'pricing':
      return [
        { agent: 'pricing', skills: ['competitor', 'price-rec'], priority: 'high' },
      ]

    case 'inventory':
      return [
        { agent: 'inventory', skills: ['forecast', 'reorder'], priority: 'normal' },
      ]

    default:
      throw new Error(`Bilinmeyen istek tipi: ${req.type}`)
  }
}
