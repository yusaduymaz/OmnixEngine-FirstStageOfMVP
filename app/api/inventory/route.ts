import { auth } from '@clerk/nextjs/server'
import { inventorySkill } from '@/agents/inventory/skills/forecast.skill'
import { InventorySkillInput } from '@/agents/inventory/types'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    const body = await req.json()

    if (!body.productName || body.currentStock === undefined) {
      return Response.json({ error: 'Ürün adı ve mevcut stok gereklidir.' }, { status: 400 })
    }

    const input: InventorySkillInput = {
      userId,
      productName: body.productName,
      sku: body.sku,
      currentStock: Number(body.currentStock),
      minStockLevel: body.minStockLevel ? Number(body.minStockLevel) : 10,
      last7DaysSales: body.last7DaysSales ? Number(body.last7DaysSales) : 0
    }

    const result = await inventorySkill(input)

    return Response.json(result)
  } catch (error: any) {
    console.error('[Inventory API] Hata:', error)
    return Response.json(
      { error: error.message || 'Stok analizi sırasında bir hata oluştu.' },
      { status: error.statusCode || 500 }
    )
  }
}
