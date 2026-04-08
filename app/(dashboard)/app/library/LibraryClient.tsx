'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Clock, BarChart2, BookOpen } from 'lucide-react'
import GenerationModal from './GenerationModal'
import type { GenerationRow } from './page'

const TONE_LABELS: Record<string, string> = {
  professional: 'Profesyonel',
  friendly: 'Samimi',
  luxury: 'Lüks',
  discount: 'Kampanyalı',
}

const PLATFORM_COLORS: Record<string, string> = {
  trendyol: 'bg-orange-500',
  hepsiburada: 'bg-orange-600',
  amazon_tr: 'bg-amber-500',
  ciceksepeti: 'bg-pink-500',
  etsy: 'bg-orange-500',
}

const PLATFORM_BADGES: Record<string, string> = {
  trendyol: 'TY',
  hepsiburada: 'HB',
  amazon_tr: 'AMZ',
  ciceksepeti: 'ÇS',
  etsy: 'ETSY',
}

function seoColor(score: number | null) {
  if (score === null) return 'text-gray-400'
  if (score >= 71) return 'text-green-600'
  if (score >= 41) return 'text-amber-500'
  return 'text-red-500'
}

function seoBg(score: number | null) {
  if (score === null) return 'bg-gray-100 border-gray-200'
  if (score >= 71) return 'bg-green-50 border-green-200'
  if (score >= 41) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

export default function LibraryClient({
  initialGenerations,
}: {
  initialGenerations: GenerationRow[]
}) {
  const [generations, setGenerations] = useState<GenerationRow[]>(initialGenerations)

  const handleDeleted = (id: string) => {
    setGenerations((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Sayfa başlığı */}
      <div className="border-b border-[#E8E4DC] bg-white px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold text-[#1A1A2E]"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Kütüphane
            </h1>
            <p className="text-[#6B6B7B] text-sm mt-0.5">
              Tüm üretimleriniz — {generations.length} kayıt
            </p>
          </div>
          <Link
            href="/app/generate"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#e85d2a] transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Yeni Üret
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {generations.length === 0 ? (
          /* Boş state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#E8E4DC] flex items-center justify-center mb-4 shadow-sm">
              <BookOpen className="w-7 h-7 text-[#9E9EA8]" />
            </div>
            <p className="text-[#1A1A2E] font-semibold mb-1">Henüz içerik üretmediniz</p>
            <p className="text-[#9E9EA8] text-sm mb-6">
              İçerik ürettikçe buraya kaydedilecek.
            </p>
            <Link
              href="/app/generate"
              className="px-5 py-2.5 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#e85d2a] transition-colors"
            >
              İlk İçeriği Üret
            </Link>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {generations.map((gen) => {
              const firstTitle = gen.results?.titles?.[0]?.text
              const shortDesc = gen.results?.description_short
              const keywords = gen.results?.keywords_used?.slice(0, 3) ?? []
              const date = new Date(gen.created_at)

              return (
                <div
                  key={gen.id}
                  className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
                >
                  {/* Üst bant */}
                  <div className="px-4 pt-4 pb-3 border-b border-[#F8F7F4] flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A2E] truncate">
                        {gen.product_name}
                      </p>
                      {gen.category_path && (
                        <p className="text-xs text-[#9E9EA8] mt-0.5">{gen.category_path}</p>
                      )}
                    </div>
                    {/* SEO Skoru */}
                    <div
                      className={`shrink-0 px-2 py-0.5 rounded-lg border text-xs font-bold ${seoBg(gen.seo_score)} ${seoColor(gen.seo_score)}`}
                    >
                      {gen.seo_score ?? '—'}/100
                    </div>
                  </div>

                  {/* İçerik önizlemesi */}
                  <div className="px-4 py-3 flex-1 space-y-2">
                    {firstTitle && (
                      <p className="text-xs text-[#1A1A2E] bg-[#F8F7F4] rounded-lg px-3 py-2 line-clamp-2 leading-snug">
                        {firstTitle}
                      </p>
                    )}
                    {shortDesc && !firstTitle && (
                      <p className="text-xs text-[#6B6B7B] line-clamp-3 leading-relaxed">
                        {shortDesc}
                      </p>
                    )}
                    {keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A2E]/5 text-[#6B6B7B]"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Alt meta bilgi */}
                  <div className="px-4 py-3 border-t border-[#F8F7F4] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(gen.platform ?? []).map((p) => (
                        <span
                          key={p}
                          className={`text-[10px] px-2 py-0.5 rounded-full text-white font-medium ${PLATFORM_COLORS[p] ?? 'bg-gray-500'}`}
                        >
                          {PLATFORM_BADGES[p] ?? p.toUpperCase()}
                        </span>
                      ))}
                      <span className="text-[10px] text-[#9E9EA8]">
                        {TONE_LABELS[gen.tone] ?? gen.tone}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#9E9EA8]">
                      <Clock className="w-3 h-3" />
                      {date.toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                      {gen.generation_ms && (
                        <span className="ml-1 flex items-center gap-0.5">
                          <BarChart2 className="w-3 h-3" />
                          {(gen.generation_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  </div>

                  {/* İncele + Sil */}
                  <div className="px-4 pb-4">
                    <GenerationModal
                      id={gen.id}
                      productName={gen.product_name}
                      results={gen.results}
                      platform={gen.platform ?? []}
                      tone={gen.tone}
                      onDeleted={handleDeleted}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
