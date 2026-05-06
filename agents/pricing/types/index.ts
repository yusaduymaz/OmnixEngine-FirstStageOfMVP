import { PlatformId } from '@/types/global'

export interface CompetitorData {
  platform: PlatformId | string
  price: number
  seller: string
  url: string
  in_stock: boolean
  is_buybox?: boolean
}

export interface MarginAnalysis {
  commission_rate: number
  commission_amount: number
  shipping_cost: number
  tax_rate: number
  tax_amount: number
  other_costs: number
  net_profit: number
  margin_rate: number
}

export interface PricingSkillInput {
  userId: string
  productName: string
  sourceUrl?: string
  basePrice: number
  currency: string
  targetPlatforms: string[]
  costs?: {
    shipping?: number
    other?: number
    taxRate?: number
  }
}

export interface PricingResult {
  id?: string
  overallScore: number // Pazar rekabet skoru (0-100)
  competitors: CompetitorData[]
  marginAnalysis: MarginAnalysis
  suggestedPrice: number
  marketPosition: 'cheaper' | 'average' | 'expensive'
  aiFeedback: string
  analysisMs: number
}
