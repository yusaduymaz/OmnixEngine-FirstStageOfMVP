// OmniX Engine — Plan tanımları (Stripe + UI + feature gates için tek kaynak)

export type PlanId = 'trial' | 'starter' | 'growth' | 'agency' | 'enterprise'
export type PaidPlanId = Exclude<PlanId, 'trial' | 'enterprise'>

export interface PlanFeatures {
  /** Toplu yükleme erişimi */
  bulk: boolean
  /** API anahtarı / public REST erişimi */
  api: boolean
  /** Workspace üst limiti (ajans) */
  workspaces: number
  /** Görsel stüdyo erişimi */
  imageStudio: boolean
  /** İçerik analizörü */
  analyzer: boolean
  /** İçerik dönüştürücü */
  converter: boolean
  /** Pricing agent */
  pricingAgent: boolean
  /** Inventory agent */
  inventoryAgent: boolean
  /** Team / davet sistemi (enterprise) */
  teams: boolean
  /** SLA / öncelikli destek */
  sla: boolean
  /** Destek kanalı seviyesi */
  support: 'community' | 'email' | 'priority' | 'dedicated'
  /** Aynı anda paralel istek (rate limit hint) */
  concurrentRequests: number
}

export interface PlanDef {
  id: PlanId
  name: string
  price: string
  priceMonthly: number | null // TRY, null ise özel fiyat
  /**
   * Aylık mikro-kredi (1 USD ≈ 200 mikro-kredi). Token-bazlı muhasebe için.
   * Eski sabit-kredi modelinde 1 generate = 1 kredi idi; yeni modelde
   * tipik bir generate ~4-6 mikro-kredi tüketir, bu yüzden değerler ölçeklendirilmiştir.
   */
  microCredits: number
  /** Eski sabit-kredi karşılığı — UI'da "X içerik üretimi" göstermek için */
  approxGenerations: number
  /** Stripe price ID — trial/enterprise için yok */
  priceId: string | null
  /** Pazarlama özelliği listesi (UI) */
  highlights: string[]
  features: PlanFeatures
  recommended?: boolean
  cta: 'start_trial' | 'checkout' | 'contact_sales'
}

const env = (k: string) => process.env[k] ?? ''

export const PLANS: Record<PlanId, PlanDef> = {
  trial: {
    id: 'trial',
    name: 'Deneme',
    price: 'Ücretsiz',
    priceMonthly: 0,
    microCredits: 250_000, // ~50 generate
    approxGenerations: 50,
    priceId: null,
    highlights: [
      '50 içerik üretimi',
      'İçerik analizörü ve dönüştürücü',
      '2 platform desteği',
      'Topluluk desteği',
    ],
    features: {
      bulk: false,
      api: false,
      workspaces: 0,
      imageStudio: false,
      analyzer: true,
      converter: true,
      pricingAgent: false,
      inventoryAgent: false,
      teams: false,
      sla: false,
      support: 'community',
      concurrentRequests: 1,
    },
    cta: 'start_trial',
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: '₺299/ay',
    priceMonthly: 299,
    microCredits: 2_500_000, // ~500 generate
    approxGenerations: 500,
    priceId: env('STRIPE_STARTER_PRICE_ID') || null,
    highlights: [
      '500 içerik üretimi/ay',
      'Görsel stüdyo erişimi',
      '5 platform',
      'Kütüphane + geçmiş',
      'E-posta desteği',
    ],
    features: {
      bulk: false,
      api: false,
      workspaces: 1,
      imageStudio: true,
      analyzer: true,
      converter: true,
      pricingAgent: false,
      inventoryAgent: false,
      teams: false,
      sla: false,
      support: 'email',
      concurrentRequests: 2,
    },
    cta: 'checkout',
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: '₺799/ay',
    priceMonthly: 799,
    microCredits: 10_000_000, // ~2.000 generate
    approxGenerations: 2_000,
    priceId: env('STRIPE_GROWTH_PRICE_ID') || null,
    highlights: [
      '2.000 içerik üretimi/ay',
      'Toplu yükleme (CSV/Excel)',
      'REST API erişimi',
      'Pricing & inventory agent',
      'Öncelikli destek',
    ],
    features: {
      bulk: true,
      api: true,
      workspaces: 3,
      imageStudio: true,
      analyzer: true,
      converter: true,
      pricingAgent: true,
      inventoryAgent: true,
      teams: false,
      sla: false,
      support: 'priority',
      concurrentRequests: 4,
    },
    recommended: true,
    cta: 'checkout',
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    price: '₺2.499/ay',
    priceMonthly: 2499,
    microCredits: 50_000_000, // ~10.000 generate
    approxGenerations: 10_000,
    priceId: env('STRIPE_AGENCY_PRICE_ID') || null,
    highlights: [
      '10.000 içerik üretimi/ay',
      '10 ayrı workspace (ajans)',
      'Tüm agent erişimleri',
      'Webhook entegrasyonları',
      'Öncelikli + telefon desteği',
    ],
    features: {
      bulk: true,
      api: true,
      workspaces: 10,
      imageStudio: true,
      analyzer: true,
      converter: true,
      pricingAgent: true,
      inventoryAgent: true,
      teams: false,
      sla: false,
      support: 'priority',
      concurrentRequests: 8,
    },
    cta: 'checkout',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Özel fiyat',
    priceMonthly: null,
    microCredits: 500_000_000, // 100k+ generate, paylaşımlı havuz
    approxGenerations: 100_000,
    priceId: null,
    highlights: [
      'Sınırsız workspace',
      'Team + davet sistemi (rol tabanlı)',
      'Paylaşımlı kredi havuzu',
      'SLA + özel sözleşme',
      'Adanmış başarı yöneticisi',
      'Özel API rate limit',
    ],
    features: {
      bulk: true,
      api: true,
      workspaces: Number.MAX_SAFE_INTEGER,
      imageStudio: true,
      analyzer: true,
      converter: true,
      pricingAgent: true,
      inventoryAgent: true,
      teams: true,
      sla: true,
      support: 'dedicated',
      concurrentRequests: 32,
    },
    cta: 'contact_sales',
  },
}

/**
 * Ödenebilir planlar — checkout endpoint'inin kabul ettiği değerler.
 */
export const PAID_PLAN_IDS: PaidPlanId[] = ['starter', 'growth', 'agency']

export function isPaidPlan(id: string): id is PaidPlanId {
  return (PAID_PLAN_IDS as string[]).includes(id)
}

export function getPlan(id: string | null | undefined): PlanDef {
  if (!id) return PLANS.trial
  return (PLANS as Record<string, PlanDef>)[id] ?? PLANS.trial
}

/** Eski API uyumluluğu — webhook ve diğer yerler bu mapping'i kullanıyor */
export const PLAN_CREDITS: Record<PlanId, number> = {
  trial: PLANS.trial.microCredits,
  starter: PLANS.starter.microCredits,
  growth: PLANS.growth.microCredits,
  agency: PLANS.agency.microCredits,
  enterprise: PLANS.enterprise.microCredits,
}
