import { getSupabaseAdmin } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { tokensToCredits, tokensToUsd } from '@/lib/billing/credit-cost'
import { InventorySkillInput, InventoryResult, StockHealth, InventoryRecommendation } from '../types'

export class InventorySkillError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message)
    this.name = 'InventorySkillError'
  }
}

async function resolveUser(clerkId: string, supabase: any) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, credits_used, credits_limit')
    .eq('clerk_id', clerkId)
    .single()

  if (error || !user) {
    throw new InventorySkillError('Kullanıcı hesabı bulunamadı.', 404)
  }
  return user
}

export async function inventorySkill(input: InventorySkillInput): Promise<InventoryResult> {
  const startTime = Date.now()
  const supabase = getSupabaseAdmin()

  // 1. Kullanıcı ve Kredi Kontrolü
  const user = await resolveUser(input.userId, supabase)
  if (user.credits_limit - user.credits_used <= 0) {
    throw new InventorySkillError('Krediniz tükendi.', 403)
  }

  // 2. AI ile Tahminleme
  const openrouterKey = process.env.OPENROUTER_API_KEY
  if (!openrouterKey) throw new InventorySkillError('AI servisi yapılandırılamadı.', 500)

  const openrouter = createOpenAI({ apiKey: openrouterKey, baseURL: 'https://openrouter.ai/api/v1' })
  const modelId = 'anthropic/claude-3-5-sonnet'

  const { object: result, usage } = await generateObject({
    model: openrouter(modelId),
    schema: z.object({
      dailySalesAvg: z.number(),
      daysToStockout: z.number().nullable(),
      stockHealth: z.enum(['healthy', 'warning', 'critical', 'out_of_stock']),
      recommendation: z.object({
        restockAmount: z.number(),
        restockDate: z.string(),
        priority: z.enum(['high', 'medium', 'low']),
        reason: z.string()
      }),
      aiInsights: z.string()
    }),
    system: 'Sen uzman bir e-ticaret stok yönetim ve envanter strateji asistanısın. Satış verilerini analiz edip stok tükenme tarihlerini tahmin eder ve ikmal önerileri sunarsın.',
    prompt: `
      Ürün: ${input.productName}
      Mevcut Stok: ${input.currentStock}
      Son 7 Günlük Satış: ${input.last7DaysSales || 0}
      Kritik Stok Eşiği: ${input.minStockLevel || 10}

      Görevin:
      1. Mevcut satış hızıyla stokların kaç günde tükeneceğini hesapla.
      2. Stok sağlığını belirle.
      3. Ne zaman ve ne kadar yeni sipariş verilmesi gerektiğini (restock) belirle.
      4. Türkçe stratejik bir analiz (aiInsights) yaz.
    `
  })

  const inputTokens = (usage as any).promptTokens ?? (usage as any).inputTokens ?? 0
  const outputTokens = (usage as any).completionTokens ?? (usage as any).outputTokens ?? 0
  const credits = tokensToCredits(modelId, inputTokens, outputTokens)
  const costUsd = tokensToUsd(modelId, inputTokens, outputTokens)

  const finalResult: InventoryResult = {
    currentStock: input.currentStock,
    dailySalesAvg: result.dailySalesAvg,
    daysToStockout: result.daysToStockout,
    stockHealth: result.stockHealth as StockHealth,
    recommendation: result.recommendation as InventoryRecommendation,
    aiInsights: result.aiInsights,
    analysisMs: Date.now() - startTime
  }

  // 3. Veritabanı kayıt + token-bazlı kredi düşümü
  try {
    const [invSave] = await Promise.all([
      supabase.from('inventory_reports').insert({
        user_id: user.id,
        product_name: input.productName,
        sku: input.sku || null,
        current_stock: input.currentStock,
        min_stock_level: input.minStockLevel || 10,
        daily_sales_avg: finalResult.dailySalesAvg,
        days_to_stockout: finalResult.daysToStockout,
        stock_health: finalResult.stockHealth,
        recommendation: finalResult.recommendation,
        ai_insights: finalResult.aiInsights,
        analysis_ms: finalResult.analysisMs,
        credits_charged: credits
      }).select('id').single(),
      supabase.rpc('increment_credits', { user_uuid: user.id, amount: credits })
    ])

    if (invSave.data) {
      finalResult.id = invSave.data.id
    }

    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: -credits,
      type: 'usage',
      module: 'inventory',
      reference: invSave.data?.id ?? null,
      tokens_input: inputTokens,
      tokens_output: outputTokens,
      model: modelId,
      cost_usd: costUsd,
    })
  } catch (err) {
    console.error('[Inventory] DB kaydı hatası:', err)
  }

  return finalResult
}
