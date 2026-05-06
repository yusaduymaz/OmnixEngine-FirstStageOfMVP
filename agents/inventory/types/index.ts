export type StockHealth = 'healthy' | 'warning' | 'critical' | 'out_of_stock'

export interface InventoryRecommendation {
  restockAmount: number
  restockDate: string
  priority: 'high' | 'medium' | 'low'
  reason: string
}

export interface InventorySkillInput {
  userId: string
  productName: string
  sku?: string
  currentStock: number
  minStockLevel?: number
  pastSalesData?: {
    date: string
    quantity: number
  }[]
  last7DaysSales?: number
}

export interface InventoryResult {
  id?: string
  currentStock: number
  dailySalesAvg: number
  daysToStockout: number | null
  stockHealth: StockHealth
  recommendation: InventoryRecommendation
  aiInsights: string
  analysisMs: number
}
