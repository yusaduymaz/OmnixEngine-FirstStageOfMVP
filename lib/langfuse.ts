// OmniX Engine — Langfuse Observability İstemcisi
// Prompt versiyonlama, A/B test, maliyet takibi

import { Langfuse } from 'langfuse'

// ═══════════════════════════════════════════════════════
// İstemci Yapılandırması
// ═══════════════════════════════════════════════════════

export const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
  secretKey: process.env.LANGFUSE_SECRET_KEY!,
})

// ═══════════════════════════════════════════════════════
// Modül Sabitleri
// ═══════════════════════════════════════════════════════

export type ModuleType = 'generate' | 'convert' | 'analyze' | 'image' | 'pricing' | 'inventory'

// ═══════════════════════════════════════════════════════
// Trace Oluşturma
// ═══════════════════════════════════════════════════════

/**
 * Her AI çağrısı için Langfuse trace oluştur
 */
export function createTrace(params: {
  name: string
  userId: string
  module: ModuleType
  metadata?: Record<string, unknown>
}) {
  return langfuse.trace({
    name: params.name,
    userId: params.userId,
    metadata: {
      module: params.module,
      ...params.metadata,
    },
  })
}

/**
 * Claude API çağrısı için generation kaydı oluştur
 */
export function logGeneration(
  trace: ReturnType<typeof langfuse.trace>,
  params: {
    name: string
    model: string
    input: unknown
    output: unknown
    usage: {
      inputTokens: number
      outputTokens: number
    }
  }
) {
  return trace.generation({
    name: params.name,
    model: params.model,
    input: params.input as string,
    output: params.output as string,
    usage: {
      input: params.usage.inputTokens,
      output: params.usage.outputTokens,
    },
  })
}

export default langfuse
