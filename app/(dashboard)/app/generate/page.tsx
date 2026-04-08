'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Loader2,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  Zap,
  FileText,
  Megaphone,
  Tag,
} from 'lucide-react'
import { useSettingsStore } from '@/hooks/useSettingsStore'
import { COUNTRY_PLATFORMS_MAPPING, PLATFORM_LABELS, type PlatformId } from '@/prompts/system'

// ---------- Şema ----------
const FormSchema = z.object({
  product_name: z.string().min(2, 'En az 2 karakter girin').max(500),
  category: z.string().optional(),
  extra_keywords: z.string().optional(),
  tone: z.enum(['professional', 'friendly', 'luxury', 'discount']),
})

type FormData = z.infer<typeof FormSchema>

// ---------- Sabitler ----------
const CATEGORIES = [
  'Kadın Giyim',
  'Erkek Giyim',
  'Çanta',
  'Ayakkabı',
  'Elektronik',
  'Ev & Yaşam',
  'Kozmetik',
  'Spor',
]

const TONES = [
  { value: 'professional', label: 'Profesyonel', emoji: '💼', desc: 'Net, güven verici, B2B' },
  { value: 'friendly', label: 'Samimi', emoji: '😊', desc: 'Sıcak, yakın, arkadaşça' },
  { value: 'luxury', label: 'Lüks', emoji: '✨', desc: 'Sofistike, prestijli, özel' },
  { value: 'discount', label: 'Kampanyalı', emoji: '🏷️', desc: 'Fırsat odaklı, aciliyetli' },
]

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

interface AdCopy {
  headline: string
  body: string
  platform?: string
}

interface GenerationResult {
  titles: { text: string; platform: string; char_count: number }[]
  description_long: string
  description_short: string
  ad_copies: AdCopy[]
  keywords_used: string[]
  seo_score: number
  seo_compliance_notes?: string
}

// ---------- SEO Halka Komponenti ----------
function SEOScoreRing({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0)
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const progress = (displayScore / 100) * circumference
  const color = displayScore >= 71 ? '#22C55E' : displayScore >= 41 ? '#F59E0B' : '#EF4444'

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
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#E8E4DC" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-[#1A1A2E]" style={{ lineHeight: 1 }}>{displayScore}</span>
        <span className="text-[10px] text-[#6B6B7B]">SEO</span>
      </div>
    </div>
  )
}

// ---------- Kopyala Butonu ----------
function CopyButton({ text, id }: { text: string; id: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-[#E8E4DC] hover:border-[#FF6B35] hover:text-[#FF6B35] text-[#6B6B7B] transition-all"
      title="Kopyala"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Kopyalandı' : 'Kopyala'}
    </button>
  )
}

// ---------- Ana Sayfa ----------
export default function GeneratePage() {
  const { language, country } = useSettingsStore()
  
  // Ülkeye göre platformları hesapla
  const availablePlatformsList = COUNTRY_PLATFORMS_MAPPING[country] || []
  const currentAvailablePlatforms = availablePlatformsList.map((p) => ({
    id: p,
    label: PLATFORM_LABELS[p as PlatformId],
    emoji: PLATFORM_EMOJIS[p] || '🛍️',
    desc: 'Bölgesel Platform'
  }))

  const [platforms, setPlatforms] = useState<string[]>([])
  // Ülke değiştiğinde platform seçimlerini sıfırla veya varsayılanı seç
  useEffect(() => {
    if (availablePlatformsList.length > 0) {
      setPlatforms([availablePlatformsList[0]])
    } else {
      setPlatforms([])
    }
  }, [country])

  const [result, setResult] = useState<GenerationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [activeTab, setActiveTab] = useState<'titles' | 'description' | 'ad'>('titles')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const categoryRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { tone: 'professional' },
  })

  const selectedTone = watch('tone')
  const selectedCategory = watch('category')

  // Kategori dropdown dışına tıklayınca kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
    setStreamText('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, platforms, language, country }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.hata || 'Üretim başarısız oldu')
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let pingCount = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        // API nokta ping gönderiyor — sayarak ilerleme göster
        pingCount += (chunk.match(/\./g) || []).length
        if (!fullText.includes('__RESULT__:') && !fullText.includes('__ERROR__:')) {
          const progressMsg = `İçerik üretiliyor${'.'.repeat((pingCount % 3) + 1)}`
          setStreamText(progressMsg)
        }
      }

      // ==================================================================
      // HATA KONTROLÜ — hem 'başta' hem 'ortada' __ERROR__: yakala
      // API newline'lı veya newline'sız gönderebilir, ikisini de destekle
      // ==================================================================
      const findError = (): string | null => {
        // Başta (Gemini/Claude direkt hata gönderdiyse)
        if (fullText.startsWith('__ERROR__:')) {
          return fullText.slice('__ERROR__:'.length).trim()
        }
        // Ortada newline ile (başarılı üretim sonrası hata)
        const idx = fullText.indexOf('\n__ERROR__:')
        if (idx !== -1) {
          return fullText.slice(idx + '\n__ERROR__:'.length).trim()
        }
        return null
      }

      const errorMsg = findError()
      if (errorMsg) {
        console.error('[Generate] API hata mesajı:', errorMsg)
        throw new Error(errorMsg)
      }

      if (!fullText.trim()) {
        throw new Error('API boş yanıt döndü. Lütfen tekrar deneyin.')
      }

      // ==================================================================
      // __RESULT__ protokolü — API başarılıysa son chunk parse edilmiş JSON
      // ==================================================================
      const resultMarker = '\n__RESULT__:'
      const resultIdx = fullText.indexOf(resultMarker)
      let parsed: GenerationResult | null = null

      if (resultIdx !== -1) {
        const jsonStr = fullText.slice(resultIdx + resultMarker.length).trim()
        try {
          parsed = JSON.parse(jsonStr) as GenerationResult
          console.info('[Generate] __RESULT__ protokolü ile parse edildi.')
        } catch (e) {
          console.warn('[Generate] __RESULT__ parse başarısız, fallback:', e)
        }
      }

      if (!parsed) {
        // Fallback: Ham metinden JSON çıkar
        console.warn('[Generate] Fallback JSON extraction...')
        const rawForParse = resultIdx !== -1 ? fullText.slice(0, resultIdx) : fullText
        const startIdx = rawForParse.indexOf('{')
        const endIdx = rawForParse.lastIndexOf('}')
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          try {
            parsed = JSON.parse(rawForParse.substring(startIdx, endIdx + 1)) as GenerationResult
            console.info('[Generate] Fallback parse başarılı.')
          } catch {
            // son çare: trailing comma temizle
            try {
              const cleaned = rawForParse
                .substring(startIdx, endIdx + 1)
                .replace(/,\s*([}\]])/g, '$1')
              parsed = JSON.parse(cleaned) as GenerationResult
              console.info('[Generate] Cleaned fallback parse başarılı.')
            } catch { /* tamamen başarısız */ }
          }
        }
      }

      if (!parsed) {
        console.error('[Generate] Tüm parse yöntemleri başarısız. fullText ilk 400:', fullText.slice(0, 400))
        throw new Error('İçerik üretimi başarısız oldu. Lütfen tekrar deneyin.')
      }

      // Güvenli normalize
      parsed.titles = (parsed.titles ?? []).map((t) => ({
        ...t,
        char_count: t.text?.length ?? 0,
      }))
      parsed.description_long = parsed.description_long ?? ''
      parsed.description_short = parsed.description_short ?? ''
      // API 'ad_copies' (dizi) döndürür — eski 'ad_copy' (tekil) ile de uyumlu ol
      const rawAny = parsed as unknown as Record<string, unknown>
      if (!parsed.ad_copies && rawAny.ad_copy) {
        // Eski tekil obje → diziye dönüştür
        parsed.ad_copies = [rawAny.ad_copy as AdCopy]
        delete rawAny.ad_copy
      }
      parsed.ad_copies = (parsed.ad_copies ?? []).map((ac) => ({
        headline: ac.headline ?? '',
        body: ac.body ?? '',
        platform: ac.platform,
      }))
      parsed.keywords_used = parsed.keywords_used ?? []
      parsed.seo_score = parsed.seo_score ?? 0

      setStreamText('')
      setResult(parsed)
      console.info('[Generate] Sonuç set edildi:', {
        titles: parsed.titles.length,
        seoScore: parsed.seo_score,
      })
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      console.error('[Generate] Hata:', err)
      alert(err instanceof Error ? err.message : 'Bir hata oluştu, tekrar deneyin.')
    } finally {
      setIsLoading(false)
      setStreamText('')
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Sayfa başlığı */}
      <div className="border-b border-[#E8E4DC] bg-white px-6 py-5">
        <h1
          className="text-2xl font-bold text-[#1A1A2E]"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          İçerik Üret
        </h1>
        <p className="text-[#6B6B7B] text-sm mt-0.5">
          Ürün bilgilerini gir, AI optimize edilmiş SEO içeriğini 8 saniyede oluştursun.
        </p>
      </div>

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ===== SOL — FORM ===== */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8E4DC]">
              <h2 className="font-semibold text-[#1A1A2E] text-sm">Ürün Bilgileri</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {/* Ürün Adı */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  Ürün Adı <span className="text-[#FF6B35]">*</span>
                </label>
                <input
                  {...register('product_name')}
                  placeholder="ör. Deri Omuz Çantası Kahverengi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-[#1A1A2E] text-sm placeholder:text-[#9E9EA8] focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10 transition-all"
                />
                {errors.product_name && (
                  <p className="text-red-500 text-xs mt-1" role="alert">
                    {errors.product_name.message}
                  </p>
                )}
              </div>

              {/* Kategori */}
              <div ref={categoryRef} className="relative">
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  Kategori <span className="text-[#9E9EA8] font-normal">(opsiyonel)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCategoryOpen((o) => !o)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-sm text-left flex items-center justify-between focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10 transition-all"
                >
                  <span className={selectedCategory ? 'text-[#1A1A2E]' : 'text-[#9E9EA8]'}>
                    {selectedCategory || 'Kategori seçin'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#9E9EA8] transition-transform ${categoryOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {categoryOpen && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#E8E4DC] rounded-xl shadow-lg overflow-hidden">
                    <div
                      className="px-4 py-2.5 text-sm text-[#9E9EA8] hover:bg-[#F8F7F4] cursor-pointer"
                      onClick={() => { setValue('category', ''); setCategoryOpen(false) }}
                    >
                      — Seçimi kaldır
                    </div>
                    {CATEGORIES.map((cat) => (
                      <div
                        key={cat}
                        className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#F8F7F4] transition-colors ${
                          selectedCategory === cat
                            ? 'text-[#FF6B35] font-medium bg-[#FF6B35]/5'
                            : 'text-[#1A1A2E]'
                        }`}
                        onClick={() => { setValue('category', cat); setCategoryOpen(false) }}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Platform Seçimi */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                  Platform <span className="text-[#FF6B35]">*</span>
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

              {/* Ton Seçimi */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                  İçerik Tonu
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setValue('tone', t.value as FormData['tone'])}
                      className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
                        selectedTone === t.value
                          ? 'border-[#1A1A2E] bg-[#1A1A2E] text-white'
                          : 'border-[#E8E4DC] bg-white text-[#1A1A2E] hover:border-[#1A1A2E]/30'
                      }`}
                    >
                      <div className="text-base mb-0.5">{t.emoji}</div>
                      <div className="text-sm font-medium">{t.label}</div>
                      <div className={`text-xs mt-0.5 ${selectedTone === t.value ? 'text-white/60' : 'text-[#9E9EA8]'}`}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ekstra Anahtar Kelimeler */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  Ekstra Anahtar Kelimeler{' '}
                  <span className="text-[#9E9EA8] font-normal">(opsiyonel)</span>
                </label>
                <input
                  {...register('extra_keywords')}
                  placeholder="ör. el yapımı, doğal deri, hediye"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DC] bg-white text-[#1A1A2E] text-sm placeholder:text-[#9E9EA8] focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10 transition-all"
                />
              </div>

              {/* Üret Butonu */}
              <button
                type="submit"
                disabled={isLoading}
                id="generate-btn"
                className="w-full h-12 rounded-xl bg-[#FF6B35] hover:bg-[#e85d2a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Yapay zeka çalışıyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    İçerik Üret
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ===== SAĞ — SONUÇ ===== */}
          <div ref={resultRef} className="space-y-4">
            {/* Streaming — canlı yazı */}
            {isLoading && !result && (
              <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-[#E8E4DC] flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B35]" />
                  <span className="text-sm text-[#6B6B7B] font-medium">AI içerik yazıyor...</span>
                  <span className="ml-auto flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  {/* Hareketli içerik satırları */}
                  {[80, 95, 60, 85, 45].map((w, i) => (
                    <div
                      key={i}
                      className="h-3 rounded-full bg-gradient-to-r from-[#F8F7F4] via-[#E8E4DC] to-[#F8F7F4] animate-pulse"
                      style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                  <div className="pt-2 text-xs text-[#9E9EA8] flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#FF6B35]" />
                    {streamText.length > 0
                      ? `${streamText.length} karakter oluşturuldu...`
                      : 'SEO optimizasyonu yapılıyor...'}
                  </div>
                </div>
              </div>
            )}

            {/* Boş state */}
            {!isLoading && !result && (
              <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F8F7F4] flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-[#9E9EA8]" />
                </div>
                <p className="text-[#1A1A2E] font-medium text-sm mb-1">Henüz içerik üretilmedi</p>
                <p className="text-[#9E9EA8] text-xs">Formu doldurup &quot;İçerik Üret&quot; butonuna bas</p>
              </div>
            )}

            {/* Sonuç kartları */}
            {result && (
              <>
                {/* SEO Skoru Özet */}
                <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm p-4 flex items-center gap-4">
                  <SEOScoreRing score={result.seo_score} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1A1A2E]">
                      {result.seo_score >= 71
                        ? '🟢 Güçlü SEO'
                        : result.seo_score >= 41
                        ? '🟡 Orta SEO'
                        : '🔴 Zayıf SEO'}
                    </p>
                    <p className="text-xs text-[#6B6B7B] mt-0.5">
                      İçerik üretildi — {platforms.map((p) => currentAvailablePlatforms.find((pl) => pl.id === p)?.label ?? p).join(' + ')} için optimize edildi
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {result.keywords_used.slice(0, 5).map((kw, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#F8F7F4] text-[#6B6B7B] border border-[#E8E4DC]"
                        >
                          {kw}
                        </span>
                      ))}
                      {result.keywords_used.length > 5 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F8F7F4] text-[#9E9EA8]">
                          +{result.keywords_used.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sekmeli İçerik Kartı */}
                <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden">
                  {/* Sekmeler */}
                  <div className="flex border-b border-[#E8E4DC]">
                    {[
                      { key: 'titles', label: 'Başlıklar', icon: Zap },
                      { key: 'description', label: 'Açıklama', icon: FileText },
                      { key: 'ad', label: 'Reklam', icon: Megaphone },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key as typeof activeTab)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all border-b-2 ${
                          activeTab === key
                            ? 'border-[#FF6B35] text-[#FF6B35]'
                            : 'border-transparent text-[#6B6B7B] hover:text-[#1A1A2E]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="p-5 space-y-3">
                    {/* Başlıklar Sekmesi */}
                    {activeTab === 'titles' &&
                      result.titles.map((title, i) => (
                        <div key={i} className="bg-[#F8F7F4] rounded-xl p-3.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-[#1A1A2E] leading-snug flex-1">{title.text}</p>
                            <CopyButton text={title.text} id={`title-${i}`} />
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium"
                              style={{ background: PLATFORM_COLORS[title.platform] || '#999' }}
                            >
                              {currentAvailablePlatforms.find((pl) => pl.id === title.platform)?.label ?? title.platform}
                            </span>
                            <span
                              className={`text-[10px] font-medium ${
                                title.char_count > (
                                  title.platform === 'trendyol' ? 100 :
                                  title.platform === 'hepsiburada' ? 150 :
                                  title.platform === 'amazon_tr' ? 200 :
                                  title.platform === 'ciceksepeti' ? 120 :
                                  title.platform === 'etsy' ? 140 : 150
                                )
                                  ? 'text-red-500'
                                  : 'text-[#22C55E]'
                              }`}
                            >
                              {title.char_count} / {
                                title.platform === 'trendyol' ? 100 :
                                title.platform === 'hepsiburada' ? 150 :
                                title.platform === 'amazon_tr' ? 200 :
                                title.platform === 'ciceksepeti' ? 120 :
                                title.platform === 'etsy' ? 140 : 150
                              } karakter
                            </span>
                          </div>
                        </div>
                      ))}

                    {/* Açıklama Sekmesi */}
                    {activeTab === 'description' && (
                      <>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-[#6B6B7B]">Kısa Açıklama</span>
                            <CopyButton text={result.description_short} id="desc-short" />
                          </div>
                          <p className="text-sm text-[#1A1A2E] bg-[#F8F7F4] rounded-xl p-3.5 leading-relaxed">
                            {result.description_short}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-[#6B6B7B]">Uzun Açıklama</span>
                            <CopyButton text={result.description_long} id="desc-long" />
                          </div>
                          <p className="text-sm text-[#1A1A2E] bg-[#F8F7F4] rounded-xl p-3.5 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto">
                            {result.description_long}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Reklam Metni Sekmesi */}
                    {activeTab === 'ad' && (
                      <div className="space-y-3">
                        {result.ad_copies.length === 0 && (
                          <div className="bg-[#F8F7F4] rounded-xl p-6 text-center">
                            <Megaphone className="w-5 h-5 text-[#9E9EA8] mx-auto mb-2" />
                            <p className="text-sm text-[#9E9EA8]">Reklam metni üretilmedi.</p>
                          </div>
                        )}
                        {result.ad_copies.map((ad, i) => {
                          const platformLabel = ad.platform
                            ? currentAvailablePlatforms.find((pl) => pl.id === ad.platform)?.label ?? ad.platform
                            : 'Genel'
                          const platformColor = ad.platform
                            ? PLATFORM_COLORS[ad.platform] ?? '#6B6B7B'
                            : '#6B6B7B'
                          const headlineLen = ad.headline?.length ?? 0
                          const bodyLen = ad.body?.length ?? 0

                          return (
                            <div key={i} className="bg-[#F8F7F4] rounded-xl p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Megaphone className="w-3.5 h-3.5 text-[#6B6B7B]" />
                                  <span className="text-xs font-medium text-[#6B6B7B]">Meta / Google Reklam</span>
                                  <span
                                    className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium"
                                    style={{ background: platformColor }}
                                  >
                                    {platformLabel}
                                  </span>
                                </div>
                                <CopyButton
                                  text={`${ad.headline}\n${ad.body}`}
                                  id={`ad-copy-${i}`}
                                />
                              </div>
                              <p className="text-sm font-semibold text-[#1A1A2E] mb-1.5">
                                {ad.headline || <span className="text-[#9E9EA8] italic">Başlık üretilmedi</span>}
                              </p>
                              <p className="text-sm text-[#6B6B7B] leading-relaxed">
                                {ad.body || <span className="text-[#9E9EA8] italic">Metin üretilmedi</span>}
                              </p>
                              <div className="mt-3 flex gap-3 text-[10px] text-[#9E9EA8]">
                                <span className={headlineLen > 40 ? 'text-red-400' : ''}>
                                  Başlık: {headlineLen} / 40 kr
                                </span>
                                <span className={bodyLen > 125 ? 'text-red-400' : ''}>
                                  Metin: {bodyLen} / 125 kr
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Anahtar Kelimeler */}
                <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Tag className="w-3.5 h-3.5 text-[#6B6B7B]" />
                    <span className="text-xs font-medium text-[#6B6B7B]">
                      Kullanılan Anahtar Kelimeler ({result.keywords_used.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywords_used.map((kw, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-full bg-[#1A1A2E]/5 text-[#1A1A2E] border border-[#1A1A2E]/10"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tekrar Üret */}
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl border border-[#FF6B35] text-[#FF6B35] text-sm font-medium hover:bg-[#FF6B35]/5 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Yeniden Üret
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}