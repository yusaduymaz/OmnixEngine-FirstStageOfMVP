import { auth } from '@clerk/nextjs/server'
import { pricingSkill } from '@/agents/pricing/skills/competitor.skill'
import { PricingSkillInput } from '@/agents/pricing/types'
import { requireFeature } from '@/lib/billing/feature-gates'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    await requireFeature(userId, 'pricingAgent')

    const body = await req.json()
    
    // Basit validasyon
    if (!body.productName || !body.basePrice) {
      return Response.json({ error: 'Ürün adı ve fiyat gereklidir.' }, { status: 400 })
    }

    const input: PricingSkillInput = {
      userId,
      productName: body.productName,
      sourceUrl: body.sourceUrl,
      basePrice: Number(body.basePrice),
      currency: body.currency || 'TRY',
      targetPlatforms: body.targetPlatforms || ['trendyol'],
      costs: body.costs
    }

    const result = await pricingSkill(input)

    return Response.json(result)
  } catch (error: any) {
    console.error('[Pricing API] Hata:', error)
    return Response.json(
      { error: error.message || 'Fiyat analizi sırasında bir hata oluştu.' },
      { status: error.statusCode || 500 }
    )
  }
}
