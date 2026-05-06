import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'
import { PLANS } from '@/lib/stripe/plans'

// Supabase service role client (RLS'i bypass eder — yalnızca sunucu tarafında kullan)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase ortam değişkenleri eksik')
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}

// Clerk webhook event tipleri
interface ClerkEmailAddress {
  email_address: string
  id: string
}

interface ClerkUserCreatedData {
  id: string
  email_addresses: ClerkEmailAddress[]
  primary_email_address_id: string
  first_name: string | null
  last_name: string | null
}

interface ClerkWebhookEvent {
  type: string
  data: ClerkUserCreatedData
}

export async function POST(request: Request) {
  // 1. Webhook secret kontrolü
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[Clerk Webhook] CLERK_WEBHOOK_SECRET ortam değişkeni eksik')
    return NextResponse.json(
      { hata: 'Webhook yapılandırması eksik' },
      { status: 500 }
    )
  }

  // 2. Svix imza başlıklarını oku
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { hata: 'Webhook imza başlıkları eksik' },
      { status: 400 }
    )
  }

  // 3. Request body'i al
  const body = await request.text()

  // 4. Svix ile imzayı doğrula
  const wh = new Webhook(webhookSecret)
  let event: ClerkWebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch (err) {
    console.error('[Clerk Webhook] İmza doğrulama başarısız:', err)
    return NextResponse.json(
      { hata: 'Geçersiz webhook imzası' },
      { status: 401 }
    )
  }

  // 5. Yalnızca user.created eventini işle
  if (event.type !== 'user.created') {
    // Diğer event tipleri için 200 döndür (Clerk tekrar denemez)
    return NextResponse.json({ mesaj: `${event.type} event'i yoksayıldı` })
  }

  const { id: clerkId, email_addresses, primary_email_address_id, first_name, last_name } =
    event.data

  // Birincil e-posta adresini bul
  const primaryEmail = email_addresses.find(
    (e) => e.id === primary_email_address_id
  )

  if (!primaryEmail?.email_address) {
    console.error('[Clerk Webhook] Birincil e-posta adresi bulunamadı. clerk_id:', clerkId)
    return NextResponse.json(
      { hata: 'E-posta adresi bulunamadı' },
      { status: 400 }
    )
  }

  const email = primaryEmail.email_address
  const fullName =
    [first_name, last_name].filter(Boolean).join(' ').trim() || null

  // 6. Supabase users tablosuna kayıt ekle
  try {
    const supabase = getSupabaseAdmin()

    const { error } = await supabase.from('users').insert({
      clerk_id: clerkId,
      email,
      full_name: fullName,
      plan: 'trial',
      credits_used: 0,
      credits_limit: PLANS.trial.microCredits,
    })

    if (error) {
      // Tekrar kaydı önle: unique constraint ihlali → zaten mevcut, sorun yok
      if (error.code === '23505') {
        console.warn('[Clerk Webhook] Kullanıcı zaten mevcut. clerk_id:', clerkId)
        return NextResponse.json({ mesaj: 'Kullanıcı zaten kayıtlı' })
      }

      console.error('[Clerk Webhook] Supabase ekleme hatası:', error)
      return NextResponse.json(
        { hata: 'Veritabanı kaydı başarısız' },
        { status: 500 }
      )
    }

    console.info('[Clerk Webhook] Yeni kullanıcı oluşturuldu:', { clerkId, email })
    return NextResponse.json({ mesaj: 'Kullanıcı başarıyla oluşturuldu' })
  } catch (err) {
    console.error('[Clerk Webhook] Beklenmeyen hata:', err)
    return NextResponse.json(
      { hata: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
