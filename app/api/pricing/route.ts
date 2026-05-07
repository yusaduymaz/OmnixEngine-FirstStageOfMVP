import { auth } from '@clerk/nextjs/server'
import { pricingSkill } from '@/agents/pricing/skills/competitor.skill'
import { PricingSkillInput } from '@/agents/pricing/types'
import { requireFeature } from '@/lib/billing/feature-gates'
import { z } from 'zod'

const PricingRequestSchema = z.object({
  productName: z.string().min(1, 'Ürün adı gereklidir.'),
  sourceUrl: z.string().optional(),
  basePrice: z.coerce.number(),
  currency: z.string().optional().default('TRY'),
  targetPlatforms: z.array(z.string()).optional().default(['trendyol']),
  costs: z.object({
    shipping: z.coerce.number().optional(),
    other: z.coerce.number().optional(),
    taxRate: z.coerce.number().optional(),
  }).optional(),
})

function getErrorResponse(error: unknown, fallback: string): { message: string; status: number } {
  if (error instanceof z.ZodError) {
    return {
      message: error.issues[0]?.message ?? fallback,
      status: 400,
    }
  }

  if (error instanceof Error) {
    const statusCode = (error as Error & { statusCode?: unknown }).statusCode
    return {
      message: error.message || fallback,
      status: typeof statusCode === 'number' ? statusCode : 500,
    }
  }

  return { message: fallback, status: 500 }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    await requireFeature(userId, 'pricingAgent')

    const parsedBody = PricingRequestSchema.parse(await req.json())

    const input: PricingSkillInput = {
      userId,
      productName: parsedBody.productName,
      sourceUrl: parsedBody.sourceUrl,
      basePrice: parsedBody.basePrice,
      currency: parsedBody.currency,
      targetPlatforms: parsedBody.targetPlatforms,
      costs: parsedBody.costs,
    }

    const result = await pricingSkill(input)

    return Response.json(result)
  } catch (err: unknown) {
    const { message, status } = getErrorResponse(err, 'Fiyat analizi sırasında bir hata oluştu.')
    console.error('[Pricing API] Hata:', err)
    return Response.json(
      { error: message },
      { status }
    )
  }
}
