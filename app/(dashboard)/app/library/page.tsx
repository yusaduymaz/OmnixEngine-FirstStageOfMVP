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
  content_types: string[] | null
  source_type: string | null
  results: {
    // generate formatı
    titles?: { text: string; platform: string; char_count?: number }[]
    description_short?: string
    description_long?: string
    ad_copy?: { headline: string; body: string; platform?: string }
    ad_copies?: { headline: string; body: string; platform?: string }[]
    keywords_used?: string[]
    seo_score?: number
    seo_compliance_notes?: string
    // convert formatı
    results?: { platform: string; title: string; description: string }[]
  } | null
}

export interface AnalysisRow {
  id: string
  source_url: string
  source_platform: string | null
  target_platform: string[]
  overall_score: number | null
  criteria_scores: Record<string, { score: number; status: string; message: string }> | null
  analysis_ms: number | null
  created_at: string
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
  let analyses: AnalysisRow[] = []

  if (userData?.id) {
    const [genResult, analysisResult] = await Promise.all([
      supabase
        .from('generations')
        .select(
          'id, product_name, category_path, platform, tone, seo_score, tokens_used, generation_ms, status, created_at, content_types, source_type, results'
        )
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('analyses')
        .select(
          'id, source_url, source_platform, target_platform, overall_score, criteria_scores, suggestions, analysis_ms, created_at'
        )
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    if (genResult.error) {
      console.error('[Library] Generations sorgu hatası:', {
        message: genResult.error.message,
        code: genResult.error.code,
        details: genResult.error.details,
        hint: genResult.error.hint
      })
    } else {
      generations = (genResult.data ?? []) as GenerationRow[]
    }

    if (analysisResult.error) {
      console.error('[Library] Analyses sorgu hatası:', {
        message: analysisResult.error.message,
        code: analysisResult.error.code,
        details: analysisResult.error.details,
        hint: analysisResult.error.hint
      })
    } else {
      analyses = (analysisResult.data ?? []) as AnalysisRow[]
    }
  }

  return <LibraryClient initialGenerations={generations} initialAnalyses={analyses} />
}
