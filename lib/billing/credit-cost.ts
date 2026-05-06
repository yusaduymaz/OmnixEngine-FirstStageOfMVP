/**
 * Token-bazlı kredi muhasebesi.
 *
 * Mikro-kredi modeli: 1 USD ≈ 200 mikro-kredi (1 mikro-kredi = $0.005).
 * Bu sayede çağrı başına kullandığımız token miktarına göre gerçek
 * maliyeti yansıtan, ölçeklenebilir bir muhasebe yapısı kurarız.
 *
 * MARGIN: Brüt API maliyetinin 4 katı (altyapı + destek + kâr için).
 */

const USD_TO_MICRO_CREDITS = 200 // 1$ = 200 mikro-kredi
const MARGIN_MULTIPLIER = 4

// Anthropic resmi liste fiyatları (USD per 1M token)
// Env override: ANTHROPIC_INPUT_USD_PER_M, ANTHROPIC_OUTPUT_USD_PER_M
const TOKEN_PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4': { input: 3.0, output: 15.0 },
  'claude-haiku-4-5': { input: 0.8, output: 4.0 },
  'claude-3-5-sonnet': { input: 3.0, output: 15.0 },
  'claude-3-5-haiku': { input: 0.8, output: 4.0 },
}

function pricingFor(model: string): { input: number; output: number } {
  // exact match
  if (TOKEN_PRICING[model]) return TOKEN_PRICING[model]
  // fallback: prefix match (claude-sonnet-4-XXXX)
  if (model.includes('haiku')) return TOKEN_PRICING['claude-haiku-4-5']
  return TOKEN_PRICING['claude-sonnet-4']
}

/**
 * Verilen token kullanımını ham USD maliyete çevirir.
 */
export function tokensToUsd(model: string, inputTokens: number, outputTokens: number): number {
  const p = pricingFor(model)
  return ((inputTokens * p.input) + (outputTokens * p.output)) / 1_000_000
}

/**
 * Verilen token kullanımını mikro-kredi cinsinden ücrete çevirir (margin dahil).
 * Minimum 1 mikro-kredi (free çağrı olmasın).
 */
export function tokensToCredits(model: string, inputTokens: number, outputTokens: number): number {
  const usd = tokensToUsd(model, inputTokens, outputTokens) * MARGIN_MULTIPLIER
  const credits = Math.ceil(usd * USD_TO_MICRO_CREDITS)
  return Math.max(1, credits)
}

/**
 * Görsel işleme: sağlayıcılara göre sabit mikro-kredi maliyeti.
 * fal.ai bg-removal ortalama $0.05, Replicate stable-diffusion $0.10.
 */
export function imageCredits(provider: 'fal' | 'replicate' | 'fal_studio'): number {
  const usdMap = {
    fal: 0.05,
    fal_studio: 0.08,
    replicate: 0.1,
  }
  return Math.ceil(usdMap[provider] * MARGIN_MULTIPLIER * USD_TO_MICRO_CREDITS)
}

/**
 * Scraping (URL çekme) — sabit mikro-kredi.
 * Hem proxy maliyeti hem de queue/lambda saniye süresini içerir.
 */
export function scrapeCredits(): number {
  // ~$0.001 raw → ~$0.004 with margin → 0.8 mikro-kredi → 1 mikro-kredi minimum
  return 1
}

/**
 * Pre-flight tahmin: input prompt token sayısı + max_output_tokens üzerinden
 * üst sınır maliyeti hesaplar. Kullanıcının kalan kredisi yeterli mi kontrol et.
 */
export function estimateMaxCredits(
  model: string,
  inputTokens: number,
  maxOutputTokens: number,
): number {
  return tokensToCredits(model, inputTokens, maxOutputTokens)
}

export const CREDIT_COST_META = {
  USD_TO_MICRO_CREDITS,
  MARGIN_MULTIPLIER,
  PRICING: TOKEN_PRICING,
}
