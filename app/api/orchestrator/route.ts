import { auth } from '@clerk/nextjs/server'
import { routeRequest } from '@/orchestrator/router'
import { executeParallel } from '@/orchestrator/executor'
import { SharedContext, OrchestratorRequest } from '@/orchestrator/types'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
    }

    const body = await req.json()
    
    // Basit validasyon
    if (!body.name || !body.price) {
      return Response.json({ error: 'Ürün adı ve fiyat gereklidir.' }, { status: 400 })
    }

    // 1. Router ile rota belirle
    const orchestratorReq: OrchestratorRequest = {
      type: body.type || 'full_audit',
      productId: body.id || 'new_audit',
      userId: userId,
      options: body.options
    }
    const routes = routeRequest(orchestratorReq)

    // 2. Shared Context oluştur
    const context: SharedContext = {
      userId: userId,
      productId: orchestratorReq.productId,
      productData: {
        name: body.name,
        price: body.price,
        url: body.url,
        stock: body.stock,
        currency: body.currency || 'TRY',
        weeklySales: body.weeklySales
      }
    }

    // 3. Executor ile paralel çalıştır
    console.log(`[Orchestrator API] ${routes.length} agent paralel başlatılıyor...`)
    const { results, errors } = await executeParallel(routes, context)

    return Response.json({
      success: true,
      jobId: orchestratorReq.productId,
      results,
      errors: Object.keys(errors).length > 0 ? errors : undefined
    })

  } catch (error: unknown) {
    const err = error as Error
    console.error('[Orchestrator API] Genel Hata:', err)
    return Response.json(
      { error: err.message || 'Denetim sırasında bir hata oluştu.' },
      { status: 500 }
    )
  }
}
