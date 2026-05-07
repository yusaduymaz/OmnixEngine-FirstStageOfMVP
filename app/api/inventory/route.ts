import { auth } from '@clerk/nextjs/server'
import { inventorySkill } from '@/agents/inventory/skills/forecast.skill'
import { InventorySkillInput } from '@/agents/inventory/types'
import { requireFeature } from '@/lib/billing/feature-gates'
import { z } from 'zod'

const InventoryRequestSchema = z.object({
  productName: z.string().min(1, 'Ürün adı gereklidir.'),
  sku: z.string().optional(),
  currentStock: z.coerce.number(),
  minStockLevel: z.coerce.number().optional().default(10),
  last7DaysSales: z.coerce.number().optional().default(0),
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

    await requireFeature(userId, 'inventoryAgent')

    const parsedBody = InventoryRequestSchema.parse(await req.json())

    const input: InventorySkillInput = {
      userId,
      productName: parsedBody.productName,
      sku: parsedBody.sku,
      currentStock: parsedBody.currentStock,
      minStockLevel: parsedBody.minStockLevel,
      last7DaysSales: parsedBody.last7DaysSales,
    }

    const result = await inventorySkill(input)

    return Response.json(result)
  } catch (err: unknown) {
    const { message, status } = getErrorResponse(err, 'Stok analizi sırasında bir hata oluştu.')
    console.error('[Inventory API] Hata:', err)
    return Response.json(
      { error: message },
      { status }
    )
  }
}
