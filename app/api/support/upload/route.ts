import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/admin'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/lib/validations/support'

// POST: Dosya yükleme
export async function POST(request: Request) {
  const guard = await requireUser()
  if (guard.error) return guard.error

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ hata: 'Dosya bulunamadı' }, { status: 400 })
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { hata: `Dosya boyutu 10MB'dan büyük olamaz. Mevcut: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      )
    }

    // MIME type kontrolü
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { hata: 'Sadece görsel (JPEG, PNG, GIF, WebP) ve PDF dosyaları yüklenebilir' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Dosya adını güvenli hale getir
    const timestamp = Date.now()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${guard.user.id}/${timestamp}_${safeFileName}`

    // ArrayBuffer'ı Uint8Array'e dönüştür
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    // Supabase Storage'a yükle
    const { data, error } = await supabase.storage
      .from('support-attachments')
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Dosya yükleme hatası:', error)
      return NextResponse.json(
        { hata: 'Dosya yüklenemedi', detay: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      basari: true,
      path: data.path,
      name: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (err) {
    console.error('Dosya yükleme hatası:', err)
    return NextResponse.json({ hata: 'Dosya işlenirken bir hata oluştu' }, { status: 500 })
  }
}
