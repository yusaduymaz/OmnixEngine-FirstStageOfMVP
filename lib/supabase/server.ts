import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client — Service Role Key ile çalışır.
 * RLS'i bypass eder. YALNIZCA sunucu tarafında (API route, webhook) kullan.
 * Hiçbir zaman istemci bileşenine import etme.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase ortam değişkenleri eksik: NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}

/**
 * Supabase Anon Client — Anon Key ile çalışır.
 * RLS politikaları etkin. Sunucu taraflı veri okuma için kullan.
 */
export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase ortam değişkenleri eksik: NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  })
}
