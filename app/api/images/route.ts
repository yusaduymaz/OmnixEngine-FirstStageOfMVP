// OmniX Engine — Görsel Yükleme API Route
// Supabase Storage'a ham görsel yükle

import { NextResponse } from 'next/server'

// TODO: Sprint 3'te implement edilecek
// multipart/form-data → Supabase Storage upload

export async function POST() {
  return NextResponse.json(
    { error: 'Görsel yükleme henüz aktif değil — Sprint 3\'te tamamlanacak' },
    { status: 501 }
  )
}
