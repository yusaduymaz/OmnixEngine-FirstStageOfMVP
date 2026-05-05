// OmniX Engine — Orchestrator Tipleri

import type { AgentType, AgentPriority } from '@/types/global'

// ═══════════════════════════════════════════════════════
// İstek / Yanıt Tipleri
// ═══════════════════════════════════════════════════════

export type OrchestratorRequestType =
  | 'full_audit'
  | 'content'
  | 'image'
  | 'pricing'
  | 'inventory'

export interface OrchestratorRequest {
  type: OrchestratorRequestType
  productId: string
  options?: Record<string, unknown>
  userId: string
}

export interface OrchestratorResponse {
  jobId: string
  status: 'processing' | 'completed' | 'failed'
  results?: Record<AgentType, unknown>
  errors?: Record<AgentType, string>
}

// ═══════════════════════════════════════════════════════
// Agent Yönlendirme Tipleri
// ═══════════════════════════════════════════════════════

export interface AgentRoute {
  agent: AgentType
  skills: string[]
  priority: AgentPriority
}

// ═══════════════════════════════════════════════════════
// Paylaşılan Context
// ═══════════════════════════════════════════════════════

export interface SharedContext {
  productId: string
  userId: string
  productData?: Record<string, unknown>
  scraped?: Record<string, unknown>
  imageUrls?: string[]
}
