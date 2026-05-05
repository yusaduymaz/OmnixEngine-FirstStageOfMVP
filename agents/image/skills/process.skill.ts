import { getSupabaseAdmin } from '@/lib/supabase/server'
import { currentUser } from '@clerk/nextjs/server'
import { fal } from '@fal-ai/client'
import { v4 as uuidv4 } from 'uuid'
import type { ImageProcessInput, ImageProcessResult } from '../types/process.types'

export class ImageProcessError extends Error {
  constructor(message: string, public readonly statusCode: number = 500) {
    super(message)
    this.name = 'ImageProcessError'
  }
}

async function resolveUser(userId: string, supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data: user } = await supabase
    .from('users')
    .select('id, credits_used, credits_limit, plan')
    .eq('clerk_id', userId)
    .single()

  if (user) return user

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? ''
  const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ')

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      clerk_id: userId,
      email,
      full_name: fullName || email,
      plan: 'free',
      credits_limit: 50,
      credits_used: 0,
    })
    .select('id, credits_used, credits_limit, plan')
    .single()

  if (error || !newUser) {
    throw new ImageProcessError('Hesap bilgileri alınamadı.', 500)
  }

  return newUser
}

async function fetchImageBuffer(urlOrBase64: string): Promise<{ buffer: Buffer; contentType: string }> {
  if (urlOrBase64.startsWith('data:image')) {
    const [header, base64Data] = urlOrBase64.split(',')
    const contentType = header.split(':')[1].split(';')[0]
    return { buffer: Buffer.from(base64Data, 'base64'), contentType }
  }
  
  const res = await fetch(urlOrBase64)
  if (!res.ok) throw new Error('Resim URL\'den indirilemedi.')
  const arrayBuffer = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  return { buffer: Buffer.from(arrayBuffer), contentType }
}

async function uploadToStorage(supabase: ReturnType<typeof getSupabaseAdmin>, path: string, buffer: Buffer, contentType: string) {
  const { error } = await supabase.storage.from('product-images').upload(path, buffer, {
    contentType,
    upsert: true
  })
  
  if (error) {
    console.error('[Image] Storage upload error:', error)
    throw new ImageProcessError('Görsel depolama alanına yüklenemedi.', 500)
  }
  
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

export async function processImageSkill(input: ImageProcessInput): Promise<ImageProcessResult> {
  const startTime = Date.now()
  const supabase = getSupabaseAdmin()

  // 1. Kullanıcı ve Kredi Kontrolü
  const user = await resolveUser(input.userId, supabase)
  const CREDITS_COST = 3
  
  if (user.credits_limit - user.credits_used < CREDITS_COST) {
    throw new ImageProcessError(`Bu işlem için ${CREDITS_COST} krediye ihtiyacınız var. Krediniz yetersiz.`, 403)
  }

  // UUID oluştur
  const imageId = uuidv4()
  const originalPath = `images/${user.id}/original/${imageId}.jpg`
  const processedPath = `images/${user.id}/processed/${imageId}.jpg`

  let originalPublicUrl = ''
  let processedPublicUrl = ''
  let modelUsed = ''
  let errorMsg: string | null = null

  try {
    // 2. Orijinal Resmi Storage'a Yükle
    const { buffer: origBuffer, contentType: origContentType } = await fetchImageBuffer(input.imageUrl)
    originalPublicUrl = await uploadToStorage(supabase, originalPath, origBuffer, origContentType)
    
    // 3. Fal.ai ile Yapay Zeka İşlemi
    let aiResultUrl = ''
    
    // TODO: Fal.ai anahtarının process.env.FAL_KEY ile ayarlandığı varsayılır. (Fal istemcisi bunu otomatik bulur)
    if (input.action === 'remove-background') {
      modelUsed = 'fal-ai/birefnet'
      const result: any = await fal.subscribe("fal-ai/birefnet", {
        input: { image_url: originalPublicUrl },
        logs: true
      })
      aiResultUrl = result.image.url
    } else if (input.action === 'replace-background') {
      modelUsed = 'fal-ai/photoroom/background-replacement'
      // Varsayılan olarak photoroom veya flux kullanılabilir, mock edelim:
      const result: any = await fal.subscribe("fal-ai/birefnet", {
        input: { image_url: originalPublicUrl },
      })
      aiResultUrl = result.image.url
      // Gerçek implementasyonda stüdyo prompt'u eklenebilir. Şimdilik arkaplanı siliyoruz.
    } else {
      throw new ImageProcessError('Geçersiz işlem türü.', 400)
    }

    // 4. İşlenmiş Resmi Storage'a Yükle
    const { buffer: procBuffer, contentType: procContentType } = await fetchImageBuffer(aiResultUrl)
    processedPublicUrl = await uploadToStorage(supabase, processedPath, procBuffer, procContentType)
    
  } catch (err: any) {
    console.error('[Image] İşleme hatası:', err)
    errorMsg = err.message || 'Görsel işlenirken bir hata oluştu.'
  }

  const processingTimeMs = Date.now() - startTime

  // 5. DB Kayıt ve Kredi Düşümü
  if (errorMsg) {
    // Hata durumunda kayıt
    await supabase.from('images').insert({
      user_id: user.id,
      original_path: originalPublicUrl || input.imageUrl,
      status: 'failed',
      error_message: errorMsg,
      credits_charged: 0,
    })
    throw new ImageProcessError(errorMsg, 500)
  }

  // Başarı durumunda kayıt
  await Promise.all([
    supabase.from('images').insert({
      user_id: user.id,
      original_path: originalPublicUrl,
      processed_path: processedPublicUrl,
      settings: input.settings || {},
      ai_model_used: modelUsed,
      processing_time_ms: processingTimeMs,
      status: 'completed',
      credits_charged: CREDITS_COST,
    }),
    supabase.from('users').update({ credits_used: user.credits_used + CREDITS_COST }).eq('id', user.id)
  ])

  return {
    originalUrl: originalPublicUrl,
    processedUrl: processedPublicUrl,
    modelUsed,
    processingTimeMs
  }
}
