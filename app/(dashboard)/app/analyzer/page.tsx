'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Search, AlertCircle, CheckCircle2, AlertTriangle, XCircle, Link as LinkIcon } from 'lucide-react'
import { useSettingsStore } from '@/hooks/useSettingsStore'
import { COUNTRY_PLATFORMS_MAPPING, PLATFORM_LABELS, type PlatformId } from '@/prompts/system'
import type { AnalysisResult, CriteriaScore } from '@/agents/content/types/analyze.types'

const FormSchema = z.object({
  url: z.string().url('Lütfen geçerli bir URL girin (http:// veya https:// ile başlamalı)'),
})

type FormData = z.infer<typeof FormSchema>

const PLATFORM_COLORS: Record<string, string> = {
  trendyol: '#FF6B35',
  hepsiburada: '#FF6000',
  amazon_tr: '#FF9900',
  ciceksepeti: '#E91E63',
  etsy: '#F1641E',
  amazon_us: '#FF9900',
  ebay_us: '#E53238',
  walmart: '#0071CE',
  amazon_uk: '#FF9900',
  etsy_uk: '#F1641E',
  amazon_de: '#FF9900',
  otto: '#CC0000',
  zalando: '#FF6900',
  amazon_fr: '#FF9900',
  cdiscount: '#00499C',
  amazon_it: '#FF9900',
  ebay_it: '#E53238',
  amazon_es: '#FF9900',
  aliexpress_es: '#FF4747',
  n11: '#660099',
  pttavm: '#E1B12C',
  pazarama: '#F8B133',
  dolap: '#48C9B0',
  gittigidiyor: '#F05822',
}

const PLATFORM_EMOJIS: Record<string, string> = {
  trendyol: '🧡', hepsiburada: '🟠', amazon_tr: '📦', ciceksepeti: '🌸', etsy: '🎨', 
  n11: '🐞', pttavm: '📮', pazarama: '🛒', dolap: '👗', gittigidiyor: '🔄',
  amazon_us: '🇺🇸', ebay_us: '🛒', walmart: '🏪',
  amazon_uk: '🇬🇧', etsy_uk: '🎨',
  amazon_de: '🇩🇪', otto: '🛒', zalando: '👠',
  amazon_fr: '🇫🇷', cdiscount: '🛒',
  amazon_it: '🇮🇹', ebay_it: '🛒',
  amazon_es: '🇪🇸', aliexpress_es: '🌐'
}

function SEOScoreRing({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0)
  const radius = 35
  const circumference = 2 * Math.PI * radius
  const progress = (displayScore / 100) * circumference
  const color = displayScore >= 80 ? '#22C55E' : displayScore >= 50 ? '#F59E0B' : '#EF4444'

  useEffect(() => {
    let start = 0
    const step = score / 40
    const timer = setInterval(() => {
      start += step
      if (start >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(start))
      }
    }, 15)
    return () => clearInterval(timer)
  }, [score])

  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={radius} fill="none" stroke="#E8E4DC" strokeWidth="8" />
        <circle
          cx="45"
          cy="45"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#1A1A2E]" style={{ lineHeight: 1 }}>{displayScore}</span>
        <span className="text-xs text-[#6B6B7B] mt-1">SEO</span>
      </div>
    </div>
  )
}

function CriteriaCard({ title, data }: { title: string, data: CriteriaScore }) {
  const Icon = data.status === 'pass' ? CheckCircle2 : data.status === 'warn' ? AlertTriangle : XCircle
  const colorClass = data.status === 'pass' ? 'text-green-500 bg-green-50 border-green-200' 
                   : data.status === 'warn' ? 'text-yellow-500 bg-yellow-50 border-yellow-200' 
                   : 'text-red-500 bg-red-50 border-red-200'

  return (
    <div className={`p-4 rounded-xl border ${colorClass} transition-all`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/50">{data.score}/100</span>
          </div>
          <p className="text-sm text-gray-700 leading-snug">{data.message}</p>
          
          {data.currentValue && (
            <div className="mt-2 text-xs bg-white/60 p-2 rounded-md text-gray-600 border border-black/5">
              <strong>Mevcut:</strong> {data.currentValue}
            </div>
          )}
          
          {data.suggestion && (
            <div className="mt-2 text-xs font-medium text-gray-800 bg-white/60 p-2 rounded-md border border-black/5">
              💡 <strong>Öneri:</strong> {data.suggestion}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AnalyzerPage() {
  const { country } = useSettingsStore()
  
  const availablePlatformsList = COUNTRY_PLATFORMS_MAPPING[country] || []
  const currentAvailablePlatforms = availablePlatformsList.map((p) => ({
    id: p,
    label: PLATFORM_LABELS[p as PlatformId],
    emoji: PLATFORM_EMOJIS[p] || '🛍️',
    desc: 'Platform Kuralları'
  }))

  const [platforms, setPlatforms] = useState<string[]>([])
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (availablePlatformsList.length > 0) {
      setPlatforms([availablePlatformsList[0]])
    } else {
      setPlatforms([])
    }
  }, [country])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.length > 1
          ? prev.filter((p) => p !== platform)
          : prev
        : [...prev, platform]
    )
  }

  const onSubmit = async (data: FormData) => {
    if (platforms.length === 0) return
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, platforms }),
      })

      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.hata || 'Analiz başarısız oldu')
      }

      setResult(resData)
      window.scrollTo({ top: 400, behavior: 'smooth' })
    } catch (err) {
      console.error('[Analyze] Hata:', err)
      alert(err instanceof Error ? err.message : 'Bir hata oluştu, tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white">
      <div className="border-b border-[#E8E4DC] bg-white px-6 py-5">
        <h1
          className="text-2xl font-bold text-[#1A1A2E]"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          İçerik Analizörü
        </h1>
        <p className="text-[#6B6B7B] text-sm mt-0.5">
          Ürün sayfanızın URL'sini girin — SEO skoru, platform kriter analizi ve iyileştirme önerileri alın.
        </p>
      </div>

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ===== SOL — FORM ===== */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8E4DC]">
              <h2 className="font-semibold text-[#1A1A2E] text-sm">Analiz Edilecek Ürün</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  Ürün Sayfası URL'si <span className="text-[#FF6B35]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-[#9E9EA8]" />
                  </div>
                  <input
                    {...register('url')}
                    placeholder="https://www.trendyol.com/marka/urun-adi-p-123456"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-[#1A1A2E] text-sm placeholder:text-[#9E9EA8] focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10 transition-all"
                  />
                </div>
                {errors.url && (
                  <p className="text-red-500 text-xs mt-1" role="alert">
                    {errors.url.message}
                  </p>
                )}
              </div>

              {/* Platform Seçimi */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                  Hedef Platform Kuralları <span className="text-[#FF6B35]">*</span>
                  <span className="text-[#9E9EA8] font-normal text-xs ml-1">(birden fazla seçebilirsiniz)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentAvailablePlatforms.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`relative flex flex-col items-center py-3 px-2 rounded-xl border text-sm font-medium transition-all ${
                        platforms.includes(p.id)
                          ? 'border-[#FF6B35] bg-[#FF6B35]/5 text-[#FF6B35] shadow-sm'
                          : 'border-[#E8E4DC] bg-white text-[#6B6B7B] hover:border-[#FF6B35]/50'
                      }`}
                    >
                      <span className="text-lg mb-0.5">{p.emoji}</span>
                      <span className="font-semibold text-xs">{p.label}</span>
                      <span className="text-[10px] text-[#9E9EA8] mt-0.5">{p.desc}</span>
                      {platforms.includes(p.id) && (
                        <span
                          className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]"
                          style={{ background: PLATFORM_COLORS[p.id] ?? '#FF6B35' }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Analiz Butonu */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#1A1A2E] hover:bg-[#2A2A3E] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sayfa Taranıyor ve Analiz Ediliyor...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Analizi Başlat
                  </>
                )}
              </button>
              <p className="text-center text-xs text-[#9E9EA8]">~3.000 kredi/işlem</p>
            </form>
          </div>

          {/* ===== SAĞ — SONUÇ ===== */}
          <div className="space-y-4">
            {isLoading && !result && (
              <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35] mb-4" />
                <p className="text-[#1A1A2E] font-medium text-sm mb-1">Analiz Ediliyor</p>
                <p className="text-[#9E9EA8] text-xs">Sayfa kazınıyor, AI içerik kalitesini ölçüyor...</p>
              </div>
            )}

            {!isLoading && !result && (
              <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F8F7F4] flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-[#9E9EA8]" />
                </div>
                <p className="text-[#1A1A2E] font-medium text-sm mb-1">Rapor Bekleniyor</p>
                <p className="text-[#9E9EA8] text-xs">Bağlantıyı girip analizi başlatarak sonuçları görün</p>
              </div>
            )}

            {result && (
              <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Üst Kısım: Skor ve Özet */}
                <div className="p-6 border-b border-[#E8E4DC] bg-[#F8F7F4] flex items-center gap-6">
                  <SEOScoreRing score={result.overallScore} />
                  <div>
                    <h3 className="text-xl font-bold text-[#1A1A2E] mb-1">
                      {result.overallScore >= 80 ? 'Mükemmel İş Çıkardınız! 🚀' : 
                       result.overallScore >= 50 ? 'Geliştirilmeye Açık 🔧' : 
                       'Acil Müdahale Gerekiyor ⚠️'}
                    </h3>
                    <p className="text-sm text-[#6B6B7B]">
                      {platforms.map(p => PLATFORM_LABELS[p as PlatformId]).join(', ')} standartlarına göre analiz edildi.
                    </p>
                    
                    {result.scrapedData?.title && (
                      <div className="mt-3 text-xs bg-white px-3 py-1.5 rounded-md border border-[#E8E4DC] inline-block max-w-full truncate text-[#1A1A2E]" title={result.scrapedData.title}>
                        <span className="text-[#9E9EA8] mr-1">Bulunan Başlık:</span> {result.scrapedData.title}
                      </div>
                    )}
                  </div>
                </div>

                {/* Kriter Kartları */}
                <div className="p-6 space-y-4">
                  <h4 className="font-semibold text-[#1A1A2E] text-sm mb-2">Detaylı Kriter Analizi</h4>
                  
                  <CriteriaCard title="1. Başlık Kalitesi" data={result.criteriaScores.titleQuality} />
                  <CriteriaCard title="2. Açıklama Derinliği" data={result.criteriaScores.descriptionDepth} />
                  <CriteriaCard title="3. Anahtar Kelime Yoğunluğu" data={result.criteriaScores.keywordDensity} />
                  <CriteriaCard title="4. Platform Kuralları" data={result.criteriaScores.platformRules} />
                </div>
                
                <div className="px-6 py-4 bg-[#F8F7F4] border-t border-[#E8E4DC] flex justify-between items-center">
                  <p className="text-xs text-[#9E9EA8]">
                    Analiz Claude/Gemini tarafından yapılmıştır.
                  </p>
                  <a href="/app/generate" className="text-sm font-medium text-[#FF6B35] hover:underline flex items-center gap-1">
                    İçeriği Yeniden Üret <AlertCircle className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
