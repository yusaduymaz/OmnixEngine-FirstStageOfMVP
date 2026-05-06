// OmniX Engine — Orchestrator Executor
// Agentları paralel çalıştırır ve sonuçları birleştirir

import type { AgentRoute, SharedContext } from './types'
import type { AgentType } from '@/types/global'

// Ajan Yetenekleri (Skills)
import { analyzeSkill } from '@/agents/content/skills/analyze.skill'
import { pricingSkill } from '@/agents/pricing/skills/competitor.skill'
import { inventorySkill } from '@/agents/inventory/skills/forecast.skill'
import { getSupabaseAdmin } from '@/lib/supabase/server'
// import { processImage } from '@/agents/image/skills/process.skill' // Geliştirme aşamasında

// ═══════════════════════════════════════════════════════
// Agent Çalıştırıcı
// ═══════════════════════════════════════════════════════

/**
 * Tek bir agentı skill'leriyle birlikte çalıştırır
 */
async function executeAgent(
  route: AgentRoute,
  context: SharedContext
): Promise<{ agent: AgentType; result: unknown }> {
  console.log(`[Orchestrator] ${route.agent} agentı başlatılıyor — skills: ${route.skills.join(', ')}`)

  const { productData, userId } = context
  if (!productData || !userId) {
    throw new Error('Geçersiz context: Ürün verisi veya kullanıcı ID eksik.')
  }

  try {
    switch (route.agent) {
      case 'content':
        // Content agent için analiz skill'ini çalıştır
        const contentResult = await analyzeSkill({
          userId: userId, // clerkId değil, userId (clerk_id)
          url: productData.url as string,
          productName: productData.name as string,
          platforms: ['trendyol', 'hepsiburada', 'amazon_tr'] // Hedef platformlar eklendi
        })
        return { agent: 'content', result: contentResult }

      case 'pricing':
        const pricingResult = await pricingSkill({
          userId: userId,
          productName: productData.name as string,
          basePrice: Number(productData.price),
          currency: (productData.currency as string) || 'TRY',
          targetPlatforms: ['trendyol', 'hepsiburada', 'amazon_tr'],
          sourceUrl: productData.url as string
        })
        return { agent: 'pricing', result: pricingResult }

      case 'inventory':
        const invResult = await inventorySkill({
          userId: userId,
          productName: productData.name as string,
          currentStock: Number(productData.stock || 0),
          last7DaysSales: Number(productData.weeklySales || 0)
        })
        return { agent: 'inventory', result: invResult }

      case 'image':
        // Image agent şu an placeholder döner (Daha sonra gerçek skill eklenecek)
        return {
          agent: 'image',
          result: { status: 'mocked', message: 'Görsel analizi yakında aktif edilecek.' }
        }

      default:
        throw new Error(`Bilinmeyen agent: ${route.agent}`)
    }

    return { agent: route.agent, result: { status: 'unsupported_skill' } }
  } catch (error: any) {
    console.error(`[Orchestrator] ${route.agent} hatası:`, error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════
// Paralel Çalıştırma
// ═══════════════════════════════════════════════════════

/**
 * Birden fazla agentı Promise.allSettled ile paralel çalıştırır
 */
export async function executeParallel(
  routes: AgentRoute[],
  context: SharedContext
): Promise<{
  results: Record<string, unknown>
  errors: Record<string, string>
}> {
  const settlements = await Promise.allSettled(
    routes.map((route) => executeAgent(route, context))
  )

  const results: Record<string, unknown> = {}
  const errors: Record<string, string> = {}

  settlements.forEach((settlement, index) => {
    const agent = routes[index].agent

    if (settlement.status === 'fulfilled') {
      results[agent] = settlement.value.result
    } else {
      errors[agent] = settlement.reason?.message || 'Bilinmeyen hata'
      console.error(`[Orchestrator] ${agent} agentı hata verdi:`, settlement.reason)
    }
  })

  // ═══════════════════════════════════════════════════════
  // 3. Denetim Raporunu Kütüphaneye Kaydet (Full Audit ise)
  // ═══════════════════════════════════════════════════════
  if (routes.some(r => r.agent === 'content') && routes.length > 1) {
    try {
      console.log('[Orchestrator] Audit raporu kaydediliyor...')
      const supabase = getSupabaseAdmin()
      const { productData, userId } = context

      // 1. Kullanıcıyı resolve et
      const { data: user, error: userErr } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single()

      if (userErr || !user) {
        console.error('[Orchestrator] Kullanıcı bulunamadı, kayıt iptal edildi:', userErr)
      } else {
        const auditRecord = {
          user_id: user.id,
          product_name: productData.name,
          product_price: Number(productData.price) || 0,
          product_url: productData.url || null,
          currency: productData.currency || 'TRY',
          analysis_id: (results.content as any)?.id || null,
          pricing_id: (results.pricing as any)?.id || null,
          inventory_id: (results.inventory as any)?.id || null,
          seo_score: Number((results.content as any)?.overallScore) || 0,
          pricing_score: Number((results.pricing as any)?.overallScore) || 0,
          inventory_status: (results.inventory as any)?.stockHealth || 'unknown'
        }

        console.log('[Orchestrator] DB Insert Denemesi:', auditRecord)

        const { error: insertErr, data: insertData } = await supabase
          .from('audits')
          .insert(auditRecord)
          .select()

        if (insertErr) {
          console.error('[Orchestrator] Audit tablosuna kayıt başarısız:', insertErr)
        } else {
          console.log('[Orchestrator] Audit raporu kütüphaneye başarıyla kaydedildi:', insertData?.[0]?.id)
        }
      }
    } catch (err) {
      console.error('[Orchestrator] Audit kaydı sırasında beklenmedik hata:', err)
    }
  }

  return { results, errors }
}
