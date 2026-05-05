// OmniX Engine — Orchestrator Context
// Agentlar arası paylaşılan veri yönetimi

import type { SharedContext } from './types'

// ═══════════════════════════════════════════════════════
// Context Oluşturma
// ═══════════════════════════════════════════════════════

/**
 * Yeni bir paylaşılan context oluşturur
 */
export function createContext(params: {
  productId: string
  userId: string
  productData?: Record<string, unknown>
}): SharedContext {
  return {
    productId: params.productId,
    userId: params.userId,
    productData: params.productData || {},
    scraped: {},
    imageUrls: [],
  }
}

/**
 * Context'e scrape edilmiş veri ekler
 */
export function addScrapedData(
  context: SharedContext,
  data: Record<string, unknown>
): SharedContext {
  return {
    ...context,
    scraped: { ...context.scraped, ...data },
  }
}

/**
 * Context'e görsel URL'leri ekler
 */
export function addImageUrls(
  context: SharedContext,
  urls: string[]
): SharedContext {
  return {
    ...context,
    imageUrls: [...(context.imageUrls || []), ...urls],
  }
}
