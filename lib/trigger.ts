// OmniX Engine — Trigger.dev İstemcisi
// Toplu üretim, görsel pipeline ve zamanlanmış görevler

// @ts-ignore - TS2305: Module has no exported member 'TriggerClient' in SDK v4
import { TriggerClient } from '@trigger.dev/sdk'

// ═══════════════════════════════════════════════════════
// İstemci Yapılandırması
// ═══════════════════════════════════════════════════════

export const trigger = new TriggerClient({
  id: 'omnix-engine',
  apiKey: process.env.TRIGGER_API_KEY!,
})

// ═══════════════════════════════════════════════════════
// Job Sabitleri
// ═══════════════════════════════════════════════════════

export const JOBS = {
  BULK_GENERATE: 'bulk-generate',
  BULK_CONVERT: 'bulk-convert',
  IMAGE_PIPELINE: 'image-pipeline',
  FORECAST_DAILY: 'forecast-daily',
  REORDER_CHECK: 'reorder-check',
  ANOMALY_DETECT: 'anomaly-detect',
  SEASONAL_PLAN: 'seasonal-plan',
  CATEGORY_SYNC: 'category-sync',
} as const

export default trigger
