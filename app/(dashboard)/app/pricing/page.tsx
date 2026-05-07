'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  DollarSign, 
  Search, 
  Target, 
  BarChart3, 
  Percent, 
  Truck, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PricingResult } from '@/agents/pricing/types'

import { useSettingsStore } from '@/hooks/useSettingsStore'

export default function PricingPage() {
  const { country } = useSettingsStore()
  
  const getCurrencyInfo = () => {
    switch (country) {
      case 'TR': return { code: 'TRY', symbol: '₺' }
      case 'US': return { code: 'USD', symbol: '$' }
      case 'UK': return { code: 'GBP', symbol: '£' }
      case 'DE':
      case 'FR':
      case 'IT':
      case 'ES': return { code: 'EUR', symbol: '€' }
      default: return { code: 'TRY', symbol: '₺' }
    }
  }

  const currencyInfo = getCurrencyInfo()
  const [productName, setProductName] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PricingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productName || !basePrice) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          basePrice: Number(basePrice),
          sourceUrl,
          currency: currencyInfo.code,
          targetPlatforms: ['trendyol', 'hepsiburada', 'amazon_tr'],
          costs: {
            shipping: 45.00,
            taxRate: 0.20
          }
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Analiz başarısız oldu.')
      }

      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white">
      {/* ── Header ── */}
      <div className="border-b border-[#E8E4DC] bg-white px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] font-bricolage">Fiyat Stüdyosu</h1>
          <p className="text-[#6B6B7B] text-sm mt-0.5">Rakip fiyatlarını analiz edin, marjınızı koruyun ve optimal fiyatı bulun.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Sprint 4: Yayında</span>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">

      {/* ── Giriş Formu ── */}
      <section className="bg-white/70 backdrop-blur-xl border border-[#E8E4DC] rounded-[32px] p-8 shadow-sm">
        <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs font-bold text-[#9E9EA8] uppercase ml-1">Ürün Adı</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9EA8]" />
              <input 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Örn: Kablosuz Bluetooth Kulaklık v5.3"
                className="w-full bg-[#F8F7F4] border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#FF6B35] transition-all outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-[#9E9EA8] uppercase ml-1">Satış Fiyatınız</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9EA8] font-bold text-sm">
                {currencyInfo.symbol}
              </span>
              <input 
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#F8F7F4] border-none rounded-2xl py-4 pl-9 pr-4 text-sm focus:ring-2 focus:ring-[#FF6B35] transition-all outline-none font-medium"
              />
            </div>
          </div>

          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-bold text-[#9E9EA8] uppercase ml-1">Ürün Linki (Opsiyonel)</label>
            <input 
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://www.trendyol.com/..."
              className="w-full bg-[#F8F7F4] border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-[#FF6B35] transition-all outline-none"
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-1 justify-end">
            <button
              type="submit"
              disabled={loading || !productName || !basePrice}
              className="w-full bg-[#1A1A2E] hover:bg-[#2d2d4a] disabled:opacity-50 text-white rounded-2xl py-4 px-6 text-sm font-bold transition-all shadow-lg shadow-[#1a1a2e]/10 flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Analiz Et <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
            <p className="text-center text-xs text-[#9E9EA8]">2 işlem</p>
          </div>
        </form>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}
      </section>

      <AnimatePresence mode="wait">
        {!result && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border-2 border-dashed border-[#E8E4DC] p-20 text-center space-y-4"
          >
            <div className="w-16 h-16 bg-[#F8F7F4] rounded-full flex items-center justify-center mx-auto">
              <BarChart3 className="w-8 h-8 text-[#9E9EA8]" />
            </div>
            <div className="p-6 md:p-8 space-y-8">
              <h3 className="text-lg font-bold text-[#1A1A2E]">Analize Hazır</h3>
              <p className="text-sm text-[#6B6B7B]">
                Ürün bilgilerinizi yukarıdaki forma girerek pazar analizini başlatın. Rakip fiyatlarını ve karlılığınızı anında görün.
              </p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* ── Üst Kartlar ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Skor Kartı */}
              <div className="bg-white border border-[#E8E4DC] rounded-[32px] p-6 flex items-center gap-6 shadow-sm overflow-hidden relative group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B35]/5 rounded-full blur-2xl group-hover:bg-[#FF6B35]/10 transition-colors" />
                <div className="w-16 h-16 rounded-2xl bg-[#FF6B35]/10 flex flex-col items-center justify-center border border-[#FF6B35]/20">
                  <span className="text-2xl font-bold text-[#FF6B35] leading-none">{result.overallScore}</span>
                  <span className="text-[10px] font-bold text-[#FF6B35]/60 uppercase">Skor</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A1A2E]">Pazar Rekabeti</h4>
                  <p className="text-xs text-[#6B6B7B] mt-1">Sektör ortalamasına göre puanınız.</p>
                </div>
              </div>

              {/* Konum Kartı */}
              <div className="bg-white border border-[#E8E4DC] rounded-[32px] p-6 flex items-center gap-6 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <Target className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A1A2E]">Piyasa Konumu</h4>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    result.marketPosition === 'cheaper' ? 'bg-green-100 text-green-700' : 
                    result.marketPosition === 'average' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {result.marketPosition === 'cheaper' ? 'En Ucuzlar Arasında' : 
                     result.marketPosition === 'average' ? 'Ortalama Fiyat' : 'Yüksek Fiyat'}
                  </span>
                </div>
              </div>

              {/* Öneri Kartı */}
              <div className="bg-[#1A1A2E] rounded-[32px] p-6 flex items-center gap-6 shadow-xl shadow-indigo-900/10">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white/60">Önerilen Satış Fiyatı</h4>
                  <p className="text-2xl font-bold text-white">
                    {(result.suggestedPrice || (result as any).suggested_price || 0).toLocaleString('tr-TR')} 
                    <span className="text-sm opacity-60"> {currencyInfo.code}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* ── Ana İçerik ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Rakip Tablosu */}
              <div className="lg:col-span-8 bg-white border border-[#E8E4DC] rounded-[32px] overflow-hidden shadow-sm">
                <div className="p-6 border-bottom border-[#E8E4DC] flex items-center justify-between">
                  <h3 className="font-bold text-[#1A1A2E] flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#FF6B35]" /> Rakip Fiyatları
                  </h3>
                  <span className="text-xs text-[#9E9EA8]">{result.competitors.length} rakip bulundu</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8F7F4]">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-bold text-[#9E9EA8] uppercase tracking-wider">Platform</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-[#9E9EA8] uppercase tracking-wider">Satıcı</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-[#9E9EA8] uppercase tracking-wider text-right">Fiyat</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-[#9E9EA8] uppercase tracking-wider text-center">Stok</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E4DC]">
                      {result.competitors.map((comp, idx) => (
                        <tr key={idx} className="hover:bg-[#F8F7F4]/50 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-[#1A1A2E] capitalize">{comp.platform}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm text-[#1A1A2E] font-medium">{comp.seller}</span>
                              {comp.is_buybox && <span className="text-[10px] text-amber-600 font-bold">Buybox Sahibi</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-bold text-[#1A1A2E]">{(comp.price || 0).toLocaleString('tr-TR')} TRY</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${comp.in_stock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${comp.in_stock ? 'bg-green-500' : 'bg-red-500'}`} />
                              {comp.in_stock ? 'Mevcut' : 'Tükendi'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <a href={comp.url} target="_blank" className="p-2 bg-[#F8F7F4] rounded-lg inline-block hover:bg-[#1A1A2E] hover:text-white transition-all opacity-0 group-hover:opacity-100">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Marj ve Analiz */}
              <div className="lg:col-span-4 space-y-8">
                {/* Marj Detayları */}
                <div className="bg-white border border-[#E8E4DC] rounded-[32px] p-6 shadow-sm space-y-6">
                  <h3 className="font-bold text-[#1A1A2E] flex items-center gap-2">
                    <Percent className="w-4 h-4 text-[#FF6B35]" /> Marj Analizi
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6B6B7B] flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Komisyon ({(result.marginAnalysis.commission_rate * 100).toFixed(0)}%)</span>
                      <span className="font-bold text-red-500">-{result.marginAnalysis.commission_amount} TRY</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6B6B7B] flex items-center gap-2"><Truck className="w-3.5 h-3.5" /> Kargo</span>
                      <span className="font-bold text-red-500">-{result.marginAnalysis.shipping_cost} TRY</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6B6B7B] flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Vergi ({(result.marginAnalysis.tax_rate * 100).toFixed(0)}%)</span>
                      <span className="font-bold text-red-500">-{result.marginAnalysis.tax_amount} TRY</span>
                    </div>
                    
                    <div className="pt-4 border-t border-[#E8E4DC] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A1A2E]">Net Kâr</span>
                        <span className={`text-lg font-bold ${result.marginAnalysis.net_profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {result.marginAnalysis.net_profit} TRY
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6B6B7B]">Kar Marjı</span>
                        <span className={`font-bold ${(result.marginAnalysis.margin_rate * 100) > 10 ? 'text-green-600' : 'text-amber-600'}`}>
                          %{(result.marginAnalysis.margin_rate * 100).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Geri Bildirimi */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-[32px] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white fill-white" />
                    </div>
                    <h4 className="font-bold text-indigo-900 text-sm">Yapay Zeka Analizi</h4>
                  </div>
                  <p className="text-sm text-indigo-800/80 leading-relaxed italic">
                    "{result.aiFeedback}"
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  )
}
