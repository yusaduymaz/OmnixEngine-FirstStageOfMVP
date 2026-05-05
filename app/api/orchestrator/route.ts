// OmniX Engine — Orchestrator API Route
// Ana giriş noktası: full_audit, content, image, pricing, inventory

import { NextResponse } from 'next/server'

// TODO: Sprint 6'da implement edilecek
// import { routeRequest } from '@/orchestrator/router'
// import { executeParallel } from '@/orchestrator/executor'
// import { createContext } from '@/orchestrator/context'

export async function POST() {
  return NextResponse.json(
    { error: 'Orchestrator henüz aktif değil — Sprint 6\'da tamamlanacak' },
    { status: 501 }
  )
}
