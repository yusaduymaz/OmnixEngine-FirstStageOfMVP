'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Clock, BarChart2, BookOpen, RefreshCw, Search, ExternalLink } from 'lucide-react'
import GenerationModal from './GenerationModal'
import type { GenerationRow, AnalysisRow } from './page'

type Tab = 'all' | 'generate' | 'convert' | 'analyze'

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
  shopify: 'bg-green-500',
  woocommerce: 'bg-purple-500',
}

const PLATFORM_BADGES: Record<string, string> = {
  trendyol: 'TY',
  hepsiburada: 'HB',
  amazon_tr: 'AMZ',
  amazon_us: 'AMZ',
  ciceksepeti: 'ÇS',
  etsy: 'ETSY',
  shopify: 'SHO',
  woocommerce: 'WOO',
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

function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url)
    return hostname.replace(/^www\./, '')
  } catch {
    return url.slice(0, 40)
  }
}

export default function LibraryClient({
  initialGenerations,
  initialAnalyses,
}: {
  initialGenerations: GenerationRow[]
  initialAnalyses: AnalysisRow[]
}) {
  const [generations, setGenerations] = useState<GenerationRow[]>(initialGenerations)
  const [analyses] = useState<AnalysisRow[]>(initialAnalyses)
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const handleDeleted = (id: string) => {
    setGenerations((prev) => prev.filter((g) => g.id !== id))
  }

  const generates = generations.filter(
    (g) => !g.content_types?.includes('converter') && g.source_type !== 'convert'
  )
  const converts = generations.filter(
    (g) => g.content_types?.includes('converter') || g.source_type === 'convert'
  )

  const totalCount = generates.length + converts.length + analyses.length

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'all', label: 'Tümü', count: totalCount },
    { id: 'generate', label: 'Üretimler', count: generates.length },
    { id: 'convert', label: 'Dönüştürmeler', count: converts.length },
    { id: 'analyze', label: 'Analizler', count: analyses.length },
  ]

  const visibleGenerations =
    activeTab === 'all'
      ? generations
      : activeTab === 'generate'
      ? generates
      : activeTab === 'convert'
      ? converts
      : []

  const visibleAnalyses = activeTab === 'all' || activeTab === 'analyze' ? analyses : []

  const isEmpty = visibleGenerations.length === 0 && visibleAnalyses.length === 0

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
              {totalCount} kayıt
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

      {/* Sekmeler */}
      <div className="border-b border-[#E8E4DC] bg-white px-6">
        <div className="max-w-6xl mx-auto flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#FF6B35] text-[#FF6B35]'
                  : 'border-transparent text-[#6B6B7B] hover:text-[#1A1A2E]'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                      : 'bg-[#F8F7F4] text-[#9E9EA8]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#E8E4DC] flex items-center justify-center mb-4 shadow-sm">
              <BookOpen className="w-7 h-7 text-[#9E9EA8]" />
            </div>
            <p className="text-[#1A1A2E] font-semibold mb-1">
              {activeTab === 'analyze'
                ? 'Henüz analiz yapmadınız'
                : activeTab === 'convert'
                ? 'Henüz dönüştürme yapmadınız'
                : 'Henüz içerik üretmediniz'}
            </p>
            <p className="text-[#9E9EA8] text-sm mb-6">
              {activeTab === 'analyze'
                ? 'Analizör ile bir ürün URL analizleyin.'
                : activeTab === 'convert'
                ? 'Dönüştürücü ile mevcut bir ürünü başka platforma taşıyın.'
                : 'İçerik ürettikçe buraya kaydedilecek.'}
            </p>
            <Link
              href={activeTab === 'analyze' ? '/app/analyzer' : activeTab === 'convert' ? '/app/converter' : '/app/generate'}
              className="px-5 py-2.5 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#e85d2a] transition-colors"
            >
              {activeTab === 'analyze' ? 'Analiz Yap' : activeTab === 'convert' ? 'Dönüştür' : 'İlk İçeriği Üret'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Üretim & Dönüştürme Kartları */}
            {visibleGenerations.map((gen) => {
              const isConverter =
                gen.content_types?.includes('converter') || gen.source_type === 'convert'

              const firstTitle = isConverter
                ? gen.results?.results?.[0]?.title
                : gen.results?.titles?.[0]?.text

              const shortDesc = isConverter
                ? gen.results?.results?.[0]?.description
                : gen.results?.description_short

              const keywords = isConverter
                ? []
                : (gen.results?.keywords_used?.slice(0, 3) ?? [])

              const date = new Date(gen.created_at)

              return (
                <div
                  key={gen.id}
                  className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
                >
                  {/* Üst bant */}
                  <div className="px-4 pt-4 pb-3 border-b border-[#F8F7F4] flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                            isConverter
                              ? 'text-blue-600 border-blue-200 bg-blue-50'
                              : 'text-gray-500 border-gray-200 bg-gray-50'
                          }`}
                        >
                          {isConverter ? '🔄 Dönüştürme' : '✍️ Üretim'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#1A1A2E] truncate">
                        {gen.product_name}
                      </p>
                      {gen.category_path && (
                        <p className="text-xs text-[#9E9EA8] mt-0.5">{gen.category_path}</p>
                      )}
                    </div>
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
                      {date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
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

            {/* Analiz Kartları */}
            {visibleAnalyses.map((analysis) => {
              const date = new Date(analysis.created_at)
              const domain = extractDomain(analysis.source_url)
              const criteriaCount = analysis.criteria_scores
                ? Object.keys(analysis.criteria_scores).length
                : 0
              const passCount = analysis.criteria_scores
                ? Object.values(analysis.criteria_scores).filter((c) => c.status === 'pass').length
                : 0

              return (
                <div
                  key={analysis.id}
                  className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
                >
                  {/* Üst bant */}
                  <div className="px-4 pt-4 pb-3 border-b border-[#F8F7F4] flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium text-purple-600 border-purple-200 bg-purple-50">
                          🔍 Analiz
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#1A1A2E] truncate flex items-center gap-1">
                        {domain}
                        <ExternalLink className="w-3 h-3 text-[#9E9EA8] shrink-0" />
                      </p>
                      {analysis.source_platform && (
                        <p className="text-xs text-[#9E9EA8] mt-0.5 capitalize">
                          {analysis.source_platform}
                        </p>
                      )}
                    </div>
                    {/* Skor */}
                    <div
                      className={`shrink-0 px-2 py-0.5 rounded-lg border text-xs font-bold ${seoBg(analysis.overall_score)} ${seoColor(analysis.overall_score)}`}
                    >
                      {analysis.overall_score ?? '—'}/100
                    </div>
                  </div>

                  {/* Kriter özeti */}
                  <div className="px-4 py-3 flex-1">
                    {criteriaCount > 0 ? (
                      <div className="space-y-1.5">
                        <p className="text-xs text-[#6B6B7B]">
                          {passCount}/{criteriaCount} kriter geçti
                        </p>
                        <div className="w-full bg-[#F8F7F4] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              passCount / criteriaCount >= 0.7
                                ? 'bg-green-500'
                                : passCount / criteriaCount >= 0.4
                                ? 'bg-amber-400'
                                : 'bg-red-400'
                            }`}
                            style={{ width: `${(passCount / criteriaCount) * 100}%` }}
                          />
                        </div>
                        {analysis.criteria_scores && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(analysis.criteria_scores).map(([key, val]) => (
                              <span
                                key={key}
                                className={`text-[10px] px-1.5 py-0.5 rounded-md border ${
                                  val.status === 'pass'
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : val.status === 'warn'
                                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                                    : 'bg-red-50 border-red-200 text-red-700'
                                }`}
                              >
                                {val.status === 'pass' ? '✓' : val.status === 'warn' ? '!' : '✗'}{' '}
                                {key === 'titleQuality'
                                  ? 'Başlık'
                                  : key === 'descriptionDepth'
                                  ? 'Açıklama'
                                  : key === 'keywordDensity'
                                  ? 'Anahtar Kelime'
                                  : key === 'platformRules'
                                  ? 'Platform'
                                  : key === 'legalCompliance'
                                  ? 'Yasal'
                                  : key}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-[#9E9EA8]">Kriter verisi yok</p>
                    )}
                  </div>

                  {/* Hedef platformlar */}
                  <div className="px-4 py-3 border-t border-[#F8F7F4] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(analysis.target_platform ?? []).map((p) => (
                        <span
                          key={p}
                          className={`text-[10px] px-2 py-0.5 rounded-full text-white font-medium ${PLATFORM_COLORS[p] ?? 'bg-gray-500'}`}
                        >
                          {PLATFORM_BADGES[p] ?? p.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#9E9EA8]">
                      <Clock className="w-3 h-3" />
                      {date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                      {analysis.analysis_ms && (
                        <span className="ml-1 flex items-center gap-0.5">
                          <BarChart2 className="w-3 h-3" />
                          {(analysis.analysis_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI ile Düzelt CTA */}
                  <div className="px-4 pb-4">
                    <Link
                      href={`/app/analyzer`}
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl border border-[#E8E4DC] text-xs font-medium text-[#6B6B7B] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" />
                      Yeniden Analiz Et
                    </Link>
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
