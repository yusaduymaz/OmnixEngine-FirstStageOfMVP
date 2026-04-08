import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import LibraryClient from './LibraryClient'

export const metadata: Metadata = {
  title: 'Kütüphane — ContentForge TR',
  description: 'Geçmişte ürettiğiniz tüm içeriklere buradan ulaşın.',
}

export interface GenerationRow {
  id: string
  product_name: string
  category_path: string | null
  platform: string[]
  tone: string
  seo_score: number | null
  tokens_used: number | null
  generation_ms: number | null
  status: string
  created_at: string
  results: {
    titles?: { text: string; platform: string; char_count?: number }[]
    description_short?: string
    description_long?: string
    ad_copy?: { headline: string; body: string; platform?: string }
    ad_copies?: { headline: string; body: string; platform?: string }[]
    keywords_used?: string[]
    seo_score?: number
    seo_compliance_notes?: string
  } | null
}

export default async function LibraryPage() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = getSupabaseAdmin()

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  let generations: GenerationRow[] = []

  if (userData?.id) {
    const { data, error } = await supabase
      .from('generations')
      .select(
        'id, product_name, category_path, platform, tone, seo_score, tokens_used, generation_ms, status, created_at, results'
      )
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[Library] Sorgu hatası:', error)
    } else {
      generations = (data ?? []) as GenerationRow[]
    }
  }

  return <LibraryClient initialGenerations={generations} />
}
