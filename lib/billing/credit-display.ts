export const CREDIT_COSTS = {
  generate:      5_000,
  analyze:       3_000,
  convert_url:   6_000,
  convert_text:  4_000,
  image_bg:         40,
  image_studio:     64,
  pricing:       8_000,
  inventory:     4_000,
  full_audit:   15_000, // analyze + pricing + inventory
} as const

export function formatCreditCost(cost: number): string {
  return `~${cost.toLocaleString('tr-TR')} kredi`
}
