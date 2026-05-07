'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ArrowRightLeft, Link as LinkIcon, FileText, Copy, CheckCircle2 } from 'lucide-react'
import { useSettingsStore } from '@/hooks/useSettingsStore'
import { COUNTRY_PLATFORMS_MAPPING, PLATFORM_LABELS, type PlatformId } from '@/prompts/system'
import type { ConvertResult, ConvertedPlatformResult } from '@/agents/content/types/convert.types'

const FormSchema = z.object({
  sourceUrl: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  sourceText: z.string().optional(),
  sourcePlatform: z.string().optional(),
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

function ResultCard({ data }: { data: ConvertedPlatformResult }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    const text = `Başlık: ${data.title}\n\nAçıklama:\n${data.description}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const platformLabel = PLATFORM_LABELS[data.platform] || data.platform
  const platformColor = PLATFORM_COLORS[data.platform] || '#1A1A2E'

  return (
    <div className="bg-white p-5 rounded-xl border border-[#E8E4DC] shadow-sm relative group overflow-hidden">
      <div 
        className="absolute top-0 left-0 w-1 h-full" 
        style={{ backgroundColor: platformColor }} 
      />
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{PLATFORM_EMOJIS[data.platform]}</span>
          <h3 className="font-bold text-[#1A1A2E]">{platformLabel}</h3>
        </div>
        <button 
          onClick={copyToClipboard}
          className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Kopyalandı' : 'Kopyala'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-xs font-semibold text-[#9E9EA8] uppercase tracking-wider mb-1 block">YENİ BAŞLIK</span>
          <p className="text-sm font-medium text-[#1A1A2E]">{data.title}</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-[#9E9EA8] uppercase tracking-wider mb-1 block">YENİ AÇIKLAMA</span>
          <div className="text-sm text-[#4A4A5E] whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">
            {data.description}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConverterPage() {
  const { country } = useSettingsStore()
  
  const availablePlatformsList = COUNTRY_PLATFORMS_MAPPING[country] || []
  const currentAvailablePlatforms = availablePlatformsList.map((p) => ({
    id: p,
    label: PLATFORM_LABELS[p as PlatformId],
    emoji: PLATFORM_EMOJIS[p] || '🛍️',
  }))

  const [activeTab, setActiveTab] = useState<'url' | 'text'>('url')
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>([])
  const [result, setResult] = useState<ConvertResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (availablePlatformsList.length > 0) {
      setTargetPlatforms([availablePlatformsList[0]])
    } else {
      setTargetPlatforms([])
    }
  }, [country])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  })

  const togglePlatform = (platform: string) => {
    setTargetPlatforms((prev) =>
      prev.includes(platform)
        ? prev.length > 1
          ? prev.filter((p) => p !== platform)
          : prev
        : [...prev, platform]
    )
  }

  const onSubmit = async (data: FormData) => {
    setFormError(null)

    if (targetPlatforms.length === 0) {
      setFormError('Lütfen en az bir hedef platform seçin.')
      return
    }
    
    if (activeTab === 'url' && !data.sourceUrl) {
      setFormError('Lütfen dönüştürülecek kaynak ürünün URL\'sini girin.')
      return
    }
    
    if (activeTab === 'text' && !data.sourceText) {
      setFormError('Lütfen dönüştürülecek metni girin.')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sourceUrl: activeTab === 'url' ? data.sourceUrl : undefined,
          sourceText: activeTab === 'text' ? data.sourceText : undefined,
          sourcePlatform: data.sourcePlatform || undefined,
          targetPlatforms 
        }),
      })

      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.hata || 'Dönüştürme başarısız oldu')
      }

      setResult(resData)
      window.scrollTo({ top: 500, behavior: 'smooth' })
    } catch (err) {
      console.error('[Convert] Hata:', err)
      setFormError(err instanceof Error ? err.message : 'Bir hata oluştu, tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen pb-12">
      <div className="border-b border-[#E8E4DC] bg-white px-6 py-5">
        <h1
          className="text-2xl font-bold text-[#1A1A2E]"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          İçerik Dönüştürücü (Converter)
        </h1>
        <p className="text-[#6B6B7B] text-sm mt-0.5">
          Mevcut ürününüzün linkini veya açıklamasını girin, farklı platformların karakter ve SEO kurallarına göre saniyeler içinde yeniden yazılsın.
        </p>
      </div>

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ===== SOL — FORM ===== */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8E4DC] flex gap-4">
              <button 
                onClick={() => setActiveTab('url')}
                className={`text-sm font-semibold flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${activeTab === 'url' ? 'border-[#FF6B35] text-[#FF6B35]' : 'border-transparent text-[#9E9EA8] hover:text-[#1A1A2E]'}`}
              >
                <LinkIcon className="w-4 h-4" /> Link ile Dönüştür
              </button>
              <button 
                onClick={() => setActiveTab('text')}
                className={`text-sm font-semibold flex items-center gap-1.5 pb-2 border-b-2 transition-colors ${activeTab === 'text' ? 'border-[#FF6B35] text-[#FF6B35]' : 'border-transparent text-[#9E9EA8] hover:text-[#1A1A2E]'}`}
              >
                <FileText className="w-4 h-4" /> Metin ile Dönüştür
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              
              {formError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                  {formError}
                </div>
              )}
              
              {/* Dinamik Giriş Alanı */}
              {activeTab === 'url' ? (
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                    Kaynak Ürün URL'si <span className="text-[#FF6B35]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-[#9E9EA8]" />
                    </div>
                    <input
                      {...register('sourceUrl')}
                      placeholder="Örn: https://www.etsy.com/listing/123..."
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-[#1A1A2E] text-sm placeholder:text-[#9E9EA8] focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10"
                    />
                  </div>
                  {errors.sourceUrl && (
                    <p className="text-red-500 text-xs mt-1">{errors.sourceUrl.message}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                    Mevcut Ürün İçeriği <span className="text-[#FF6B35]">*</span>
                  </label>
                  <textarea
                    {...register('sourceText')}
                    placeholder="Mevcut başlığı ve açıklamayı buraya yapıştırın..."
                    rows={5}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-[#1A1A2E] text-sm placeholder:text-[#9E9EA8] focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10 resize-none"
                  />
                  {errors.sourceText && (
                    <p className="text-red-500 text-xs mt-1">{errors.sourceText.message}</p>
                  )}
                </div>
              )}

              {/* Kaynak Platform Opsiyonel */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  İçeriğin Alındığı Platform <span className="text-[#9E9EA8] font-normal text-xs">(İsteğe Bağlı)</span>
                </label>
                <select 
                  {...register('sourcePlatform')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-[#1A1A2E] text-sm focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10"
                >
                  <option value="">Belirtilmedi</option>
                  {currentAvailablePlatforms.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                  <option value="shopify">Shopify / Kendi Sitem</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>

              <div className="w-full h-px bg-[#E8E4DC]" />

              {/* Hedef Platform Seçimi */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                  Hedef Platformlar <span className="text-[#FF6B35]">*</span>
                  <span className="text-[#9E9EA8] font-normal text-xs ml-1">(birden fazla seçebilirsiniz)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentAvailablePlatforms.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`relative flex flex-col items-center py-2.5 px-2 rounded-xl border text-sm font-medium transition-all ${
                        targetPlatforms.includes(p.id)
                          ? 'border-[#FF6B35] bg-[#FF6B35]/5 text-[#FF6B35]'
                          : 'border-[#E8E4DC] bg-white text-[#6B6B7B] hover:border-[#FF6B35]/50'
                      }`}
                    >
                      <span className="text-base mb-0.5">{p.emoji}</span>
                      <span className="font-semibold text-xs text-center leading-tight">{p.label}</span>
                      {targetPlatforms.includes(p.id) && (
                        <span
                          className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[8px]"
                          style={{ background: PLATFORM_COLORS[p.id] ?? '#FF6B35' }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Butonu */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 rounded-xl bg-[#1A1A2E] hover:bg-[#2A2A3E] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    İçerikler Dönüştürülüyor...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4" />
                    Dönüştürmeyi Başlat
                  </>
                )}
              </button>
              <p className="text-center text-xs text-[#9E9EA8]">
                {activeTab === 'url' ? '2 işlem (URL + AI)' : '1 işlem (AI)'}
              </p>
            </form>
          </div>

          {/* ===== SAĞ — SONUÇ ===== */}
          <div className="lg:col-span-7 space-y-4">
            
            {isLoading && !result && (
              <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35] mb-4" />
                <p className="text-[#1A1A2E] font-medium text-sm mb-1">Yapay Zeka Çalışıyor</p>
                <p className="text-[#9E9EA8] text-xs">Hedef platformların özel kurallarına göre yeni içerikler üretiliyor...</p>
              </div>
            )}

            {!isLoading && !result && (
              <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F8F7F4] flex items-center justify-center mb-4">
                  <ArrowRightLeft className="w-6 h-6 text-[#9E9EA8]" />
                </div>
                <p className="text-[#1A1A2E] font-medium text-sm mb-1">Henüz Bir Çıktı Yok</p>
                <p className="text-[#9E9EA8] text-xs max-w-sm mx-auto">Sol taraftaki formu doldurup işlemi başlattığınızda, platformlara özel içerikler burada listelenecektir.</p>
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {result.scrapedData?.title && (
                   <div className="bg-white p-4 rounded-xl border border-[#E8E4DC] shadow-sm flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                       <CheckCircle2 className="w-5 h-5 text-green-600" />
                     </div>
                     <div>
                       <p className="text-xs text-[#9E9EA8] font-medium uppercase">Kaynak Kazındı</p>
                       <p className="text-sm font-semibold text-[#1A1A2E] truncate max-w-xl" title={result.scrapedData.title}>
                         {result.scrapedData.title}
                       </p>
                     </div>
                   </div>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                  {result.results.map((res, i) => (
                    <ResultCard key={i} data={res} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
