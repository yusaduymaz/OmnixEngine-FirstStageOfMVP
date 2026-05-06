import { getSupabaseAdmin } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { PricingSkillInput, PricingResult, CompetitorData, MarginAnalysis } from '../types'
import { scrapeUrl } from '@/agents/content/utils/scrape'

export class PricingSkillError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message)
    this.name = 'PricingSkillError'
  }
}

async function resolveUser(clerkId: string, supabase: any) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, credits_used, credits_limit')
    .eq('clerk_id', clerkId)
    .single()

  if (error || !user) {
    throw new PricingSkillError('Kullanıcı hesabı bulunamadı.', 404)
  }
  return user
}

export async function pricingSkill(input: PricingSkillInput): Promise<PricingResult> {
  const startTime = Date.now()
  const supabase = getSupabaseAdmin()

  // 1. Kullanıcı ve Kredi Kontrolü
  const user = await resolveUser(input.userId, supabase)
  if (user.credits_limit - user.credits_used <= 0) {
    throw new PricingSkillError('Krediniz tükendi.', 403)
  }

  // 2. Sayfa Analizi (Opsiyonel)
  let scrapedInfo = ''
  if (input.sourceUrl) {
    try {
      const data = await scrapeUrl(input.sourceUrl)
      scrapedInfo = `Ürün Sayfası Özeti: ${data.title} - ${data.description}`
    } catch (e) {
      console.warn('[Pricing] Scraping başarısız, sadece giriş verileriyle devam ediliyor.')
    }
  }

  // 3. AI ile Pazar Analizi ve Fiyat Hesaplama
  const openrouterKey = process.env.OPENROUTER_API_KEY
  if (!openrouterKey) throw new PricingSkillError('AI servisi yapılandırılamadı.', 500)

  const openrouter = createOpenAI({ apiKey: openrouterKey, baseURL: 'https://openrouter.ai/api/v1' })

  const { object: result } = await generateObject({
    model: openrouter('openrouter/free'),
    schema: z.object({
      marketScore: z.number().min(0).max(100),
      competitors: z.array(z.object({
        platform: z.string(),
        price: z.number(),
        seller: z.string(),
        url: z.string(),
        in_stock: z.boolean(),
        is_buybox: z.boolean()
      })),
      marketPosition: z.enum(['cheaper', 'average', 'expensive']),
      suggestedPrice: z.number(),
      aiFeedback: z.string(),
      estimatedCommissionRate: z.number().describe('Kategori bazlı tahmini komisyon oranı (örn: 0.15)')
    }),
    system: 'Sen uzman bir e-ticaret fiyatlandırma ve pazar analiz asistanısın. Ürün verilerini analiz edip pazar rekabetini ve optimal fiyatlandırmayı hesaplarsın.',
    prompt: `
      Ürün: ${input.productName}
      Mevcut Fiyat: ${input.basePrice} ${input.currency}
      Hedef Platformlar: ${input.targetPlatforms.join(', ')}
      ${scrapedInfo}

      Görevin:
      1. Bu ürün için pazar araştırması yap (simüle et) ve en az 3 gerçekçi rakip fiyatı üret.
      2. Ürünün piyasadaki konumunu (ucuz mu, ortalama mı?) belirle.
      3. Kar marjını optimize edecek "Önerilen Satış Fiyatı" belirle.
      4. Kategori bazlı tahmini bir komisyon oranı ver.
      5. Türkçe detaylı bir feedback yaz.
    `
  })

  // 4. Marj Hesaplamaları
  const shipping = input.costs?.shipping || 45.00
  const otherCosts = input.costs?.other || 0
  const taxRate = input.costs?.taxRate || 0.20
  
  const commissionAmount = input.basePrice * result.estimatedCommissionRate
  const taxAmount = (input.basePrice - (input.basePrice / (1 + taxRate)))
  const netProfit = input.basePrice - commissionAmount - shipping - otherCosts - taxAmount
  const marginRate = netProfit / input.basePrice

  const marginAnalysis: MarginAnalysis = {
    commission_rate: result.estimatedCommissionRate,
    commission_amount: Number(commissionAmount.toFixed(2)),
    shipping_cost: shipping,
    tax_rate: taxRate,
    tax_amount: Number(taxAmount.toFixed(2)),
    other_costs: otherCosts,
    net_profit: Number(netProfit.toFixed(2)),
    margin_rate: Number(marginRate.toFixed(4))
  }

  const finalResult: PricingResult = {
    overallScore: result.marketScore,
    competitors: result.competitors as CompetitorData[],
    marginAnalysis,
    suggestedPrice: result.suggestedPrice,
    marketPosition: result.marketPosition as any,
    aiFeedback: result.aiFeedback,
    analysisMs: Date.now() - startTime
  }

  // 5. Veritabanına Kayıt
  try {
    const [pricingSave] = await Promise.all([
      supabase.from('pricing_analyses').insert({
        user_id: user.id,
        product_name: input.productName,
        source_url: input.sourceUrl || null,
        base_price: input.basePrice,
        currency: input.currency,
        competitors: finalResult.competitors,
        margin_analysis: finalResult.marginAnalysis,
        suggested_price: finalResult.suggestedPrice,
        market_position: finalResult.marketPosition,
        ai_feedback: finalResult.aiFeedback,
        analysis_ms: finalResult.analysisMs,
        credits_charged: 1
      }).select('id').single(),
      supabase.rpc('increment_credits', { user_uuid: user.id })
    ])

    if (pricingSave.data) {
      finalResult.id = pricingSave.data.id
    }
  } catch (err) {
    console.error('[Pricing] DB kaydı sırasında hata:', err)
  }

  return finalResult
}
