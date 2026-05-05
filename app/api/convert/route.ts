// OmniX Engine — İçerik Dönüştürücü API Route
// URL/metin girdisi → hedef platformlara dönüştürülmüş içerik (streaming)

import { NextResponse } from 'next/server'

// TODO: Sprint 3'te implement edilecek
// Scraping + Claude rewrite akışı

export async function POST() {
  return NextResponse.json(
    { error: 'İçerik dönüştürücü henüz aktif değil — Sprint 3\'te tamamlanacak' },
    { status: 501 }
  )
}
