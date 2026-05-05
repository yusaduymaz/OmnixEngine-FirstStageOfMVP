// OmniX Engine — İçerik Analizörü API Route
// URL girdisi → skor + kriter değerlendirmesi + öneriler

import { NextResponse } from 'next/server'

// TODO: Sprint 1-2'de implement edilecek
// Scraping + Claude analiz akışı

export async function POST() {
  return NextResponse.json(
    { error: 'İçerik analizörü henüz aktif değil' },
    { status: 501 }
  )
}
