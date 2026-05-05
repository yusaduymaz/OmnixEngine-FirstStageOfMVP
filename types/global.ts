// OmniX Engine — Global Tip Tanımları

// ═══════════════════════════════════════════════════════
// Platform Tipleri
// ═══════════════════════════════════════════════════════

export type PlatformId =
  | 'trendyol'
  | 'hepsiburada'
  | 'amazon_tr'
  | 'amazon_us'
  | 'amazon_de'
  | 'amazon_uk'
  | 'shopify'
  | 'woocommerce'
  | 'etsy'
  | 'n11'
  | 'instagram'

export type ContentType = 'title' | 'description' | 'ad_copy' | 'bullet_points'

export type ToneType = 'professional' | 'casual' | 'luxury' | 'friendly' | 'technical'

export type PlanType = 'trial' | 'starter' | 'growth' | 'agency' | 'enterprise'

// ═══════════════════════════════════════════════════════
// Agent Tipleri
// ═══════════════════════════════════════════════════════

export type AgentType = 'content' | 'image' | 'pricing' | 'inventory'

export type AgentPriority = 'high' | 'normal' | 'low'

export interface AgentRoute {
  agent: AgentType
  skills: string[]
  priority: AgentPriority
}

// ═══════════════════════════════════════════════════════
// API Response Tipleri
// ═══════════════════════════════════════════════════════

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// ═══════════════════════════════════════════════════════
// Kullanıcı & Workspace Tipleri
// ═══════════════════════════════════════════════════════

export interface User {
  id: string
  clerkId: string
  email: string
  fullName: string | null
  plan: PlanType
  creditsUsed: number
  creditsLimit: number
  stripeCustomerId: string | null
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  id: string
  ownerId: string
  name: string
  brandVoice: Record<string, unknown> | null
  createdAt: string
}

// ═══════════════════════════════════════════════════════
// İçerik Üretim Tipleri
// ═══════════════════════════════════════════════════════

export interface GenerationInput {
  productName: string
  productGtin?: string
  categoryPath?: string
  platforms: PlatformId[]
  contentTypes: ContentType[]
  tone: ToneType
  extraKeywords?: string[]
  workspaceId?: string
}

export interface GenerationResult {
  titles: Array<{
    text: string
    charCount: number
    platform: PlatformId
    variant: 'A' | 'B'
    seoKeywordsUsed: string[]
  }>
  descriptionLong: string
  descriptionShort: string
  adCopies: Array<{
    headline: string
    body: string
    platform: PlatformId
  }>
  amazonBulletPoints?: string[]
  keywordsUsed: string[]
  seoScore: number
  seoComplianceNotes: string
}

// ═══════════════════════════════════════════════════════
// Analiz Tipleri
// ═══════════════════════════════════════════════════════

export type CriteriaStatus = 'pass' | 'warn' | 'fail'

export interface CriteriaScore {
  score: number
  status: CriteriaStatus
  message: string
  suggestion?: string | null
  currentValue?: string
}

export interface AnalysisResult {
  overallScore: number
  criteriaScores: {
    titleQuality: CriteriaScore
    descriptionDepth: CriteriaScore
    keywordDensity: CriteriaScore
    legalCompliance: CriteriaScore
    platformRules: CriteriaScore
  }
}

// ═══════════════════════════════════════════════════════
// Görsel İşleme Tipleri
// ═══════════════════════════════════════════════════════

export interface ImageSettings {
  background: string
  size: string
  shadow: boolean
  reflection: boolean
  lightCorrection: boolean
  preset?: PlatformId
}

// ═══════════════════════════════════════════════════════
// Fiyatlama Tipleri
// ═══════════════════════════════════════════════════════

export interface CompetitorPrice {
  seller: string
  price: number
  platform: PlatformId
  url?: string
  scrapedAt: string
}

export interface PriceRecommendation {
  optimalPrice: number
  minPrice: number
  maxPrice: number
  margin: number
  reasoning: string
}

// ═══════════════════════════════════════════════════════
// Stok Yönetimi Tipleri
// ═══════════════════════════════════════════════════════

export interface StockForecast {
  period: '30d' | '60d' | '90d'
  predictedDemand: number
  confidence: number
  seasonalFactor: number
}

export interface ReorderSuggestion {
  productId: string
  reorderDate: string
  suggestedQuantity: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
}
