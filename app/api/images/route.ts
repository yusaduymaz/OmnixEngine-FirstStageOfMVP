// OmniX Engine — Görsel Yükleme API Route
// Supabase Storage'a ham görsel yükle

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    // Clerk auth kontrolü
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Yapay zeka sunucunun yetkili olmadığı için görsel işlenemiyor. Lütfen oturum açınız.' },
        { status: 401 }
      )
    }

    // Form data parse et
    const formData = await request.formData()
    const file = formData.get('file') as File
    const imageUrl = formData.get('imageUrl') as string | null

    if (!file && !imageUrl) {
      return NextResponse.json(
        { error: 'Dosya veya görsel URL\'si gerekmektedir.' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Dosya yüklemesi
    if (file) {
      const buffer = await file.arrayBuffer()
      const fileName = `${uuidv4()}_${file.name}`
      const bucketName = 'product-images'

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(`user-uploads/${userId}/${fileName}`, Buffer.from(buffer), {
          contentType: file.type || 'image/jpeg',
        })

      if (error) {
        console.error('[Images API] Supabase storage error:', error)
        return NextResponse.json(
          { error: 'Görsel depolama alanına yüklenemedi. Lütfen tekrar deneyiniz.' },
          { status: 500 }
        )
      }

      const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(`user-uploads/${userId}/${fileName}`)

      return NextResponse.json({
        success: true,
        url: publicData.publicUrl,
        fileName: fileName
      })
    }

    // URL'den görsel yükleme
    if (imageUrl) {
      try {
        const response = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        })

        if (!response.ok) {
          return NextResponse.json(
            { error: 'Görsel URL\'sinden yüklenemedi. Lütfen geçerli bir URL sağlayınız.' },
            { status: 400 }
          )
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg'
        const buffer = await response.arrayBuffer()

        // Dosya boyutu kontrolü (max 10MB)
        if (buffer.byteLength > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'Görsel boyutu çok büyüktür (max 10MB).' },
            { status: 400 }
          )
        }

        const fileName = `${uuidv4()}_${Date.now()}.jpg`
        const bucketName = 'product-images'

        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(`user-uploads/${userId}/${fileName}`, Buffer.from(buffer), {
            contentType: contentType,
          })

        if (error) {
          console.error('[Images API] Supabase storage error (URL):', error)
          return NextResponse.json(
            { error: 'Görsel depolama alanına yüklenemedi. Lütfen tekrar deneyiniz.' },
            { status: 500 }
          )
        }

        const { data: publicData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(`user-uploads/${userId}/${fileName}`)

        return NextResponse.json({
          success: true,
          url: publicData.publicUrl,
          fileName: fileName,
          source: 'url'
        })
      } catch (urlErr: any) {
        console.error('[Images API] URL fetch error:', urlErr)
        return NextResponse.json(
          { error: 'Görsel URL\'sinden yüklenemedi. Lütfen geçerli bir URL sağlayınız.' },
          { status: 400 }
        )
      }
    }
  } catch (err: any) {
    console.error('[Images API] Error:', err)
    return NextResponse.json(
      { error: 'Görsel yükleme sırasında bir hata oluştu.' },
      { status: 500 }
    )
  }
}
