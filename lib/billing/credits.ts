/**
 * Kredi Muhasebesi — Tek Doğruluk Kaynağı
 *
 * DB'de tek bir alan tutulur: `users.credits_used` ve `users.credits_limit`,
 * ikisi de **mikro-kredi** cinsinden (1 USD ≈ 200 mikro-kredi).
 *
 * UI'da kullanıcı asla mikro-kredi görmez — yalnızca "işlem" görür.
 * Çevirim sabiti tek yerde tanımlıdır:
 *   1 işlem = 5.000 mikro-kredi (~$0.025 brüt margin'li tipik bir generate maliyeti)
 *
 * Tüm skill'ler ve UI bu modülden okur. Manuel çevirim yapmak yasak.
 */

export const MICRO_PER_OPERATION = 5_000

/**
 * Modül başına sabit işlem maliyeti.
 * Token-bazlı dalgalanmadan kaçınmak için flat ücret kullanırız;
 * kullanıcı her zaman ne ödeyeceğini bilir.
 */
export const OPERATION_COSTS = {
  generate:     1,    // 1 işlem  = 5.000 mikro
  analyze:      1,    // 1 işlem
  convert_url:  2,    // 2 işlem (scraping + rewrite)
  convert_text: 1,    // 1 işlem
  image_bg:     1,    // 1 işlem (fal.ai bg-removal)
  image_studio: 2,    // 2 işlem (studio render)
  pricing:      2,    // 2 işlem (scraping + AI analiz)
  inventory:    1,    // 1 işlem
  full_audit:   3,    // 3 işlem (analyze + pricing + inventory paralel)
} as const

export type CreditModule = keyof typeof OPERATION_COSTS

/** Modülün mikro-kredi cinsinden maliyetini döner. */
export function moduleCostMicro(module: CreditModule): number {
  return OPERATION_COSTS[module] * MICRO_PER_OPERATION
}

/** Modülün işlem cinsinden maliyetini döner. */
export function moduleCostOperations(module: CreditModule): number {
  return OPERATION_COSTS[module]
}

/** Mikro-krediyi işleme çevirir (tavana yuvarlar — 4.999 mikro = 1 işlem değil, 0). */
export function microToOperations(micro: number): number {
  if (!micro || micro <= 0) return 0
  return Math.floor(micro / MICRO_PER_OPERATION)
}

/** İşlem sayısını mikro-krediye çevirir. */
export function operationsToMicro(ops: number): number {
  if (!ops || ops <= 0) return 0
  return ops * MICRO_PER_OPERATION
}

/**
 * UI'da gösterilecek kredi paketi — bir noktadan tüm bileşenlere aktarılır.
 *  - operationsRemaining: kullanıcının kalan işlem sayısı (görünen ana sayı)
 *  - operationsLimit: planın toplam işlem hakkı
 *  - microRemaining: ham mikro-kredi (tooltip / ileri detay için)
 */
export interface CreditDisplay {
  operationsUsed: number
  operationsLimit: number
  operationsRemaining: number
  microUsed: number
  microLimit: number
  microRemaining: number
  /** 0–100 arası tükenme yüzdesi */
  usagePercent: number
}

export function buildCreditDisplay(microUsed: number, microLimit: number): CreditDisplay {
  const used = Math.max(0, microUsed | 0)
  const limit = Math.max(0, microLimit | 0)
  const remaining = Math.max(0, limit - used)
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0

  return {
    operationsUsed: microToOperations(used),
    operationsLimit: microToOperations(limit),
    operationsRemaining: microToOperations(remaining),
    microUsed: used,
    microLimit: limit,
    microRemaining: remaining,
    usagePercent: percent,
  }
}

/** "12 / 500 işlem" formatında metin döner. */
export function formatOperations(used: number, limit: number): string {
  return `${used.toLocaleString('tr-TR')} / ${limit.toLocaleString('tr-TR')} işlem`
}

/** "5 işlem" gibi tek sayı formatında. */
export function formatOperationLabel(ops: number): string {
  return `${ops.toLocaleString('tr-TR')} işlem`
}
