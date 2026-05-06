'use client'

import { useState } from 'react'
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Calendar, 
  ArrowRight,
  Loader2,
  AlertCircle,
  Plus,
  BarChart2,
  History,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { InventoryResult, StockHealth } from '@/agents/inventory/types'

export default function InventoryPage() {
  const [productName, setProductName] = useState('')
  const [currentStock, setCurrentStock] = useState('')
  const [last7DaysSales, setLast7DaysSales] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<InventoryResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productName || currentStock === '') return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          currentStock: Number(currentStock),
          last7DaysSales: Number(last7DaysSales || 0),
          minStockLevel: 15
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

  const getHealthColor = (health: StockHealth) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-100'
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-100'
      case 'critical': return 'text-red-600 bg-red-50 border-red-100'
      case 'out_of_stock': return 'text-gray-600 bg-gray-50 border-gray-100'
      default: return 'text-blue-600 bg-blue-50 border-blue-100'
    }
  }

  const getHealthLabel = (health: StockHealth) => {
    switch (health) {
      case 'healthy': return 'Sağlıklı'
      case 'warning': return 'Stok Azalıyor'
      case 'critical': return 'Kritik Seviye'
      case 'out_of_stock': return 'Stok Tükendi'
      default: return health
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
      {/* ── Başlık Bölümü ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A2E] font-bricolage">Envanter Stratejisti</h1>
          <p className="text-[#6B6B7B] mt-1">AI destekli stok tahminleme ve akıllı ikmal yönetimi.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
          <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
          <span className="text-sm font-semibold text-indigo-700">Sprint 5: Aktif</span>
        </div>
      </div>

      {/* ── Giriş Formu ── */}
      <section className="bg-white/70 backdrop-blur-xl border border-[#E8E4DC] rounded-[32px] p-8 shadow-sm">
        <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs font-bold text-[#9E9EA8] uppercase ml-1">Ürün Adı</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9EA8]" />
              <input 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Analiz edilecek ürünü girin..."
                className="w-full bg-[#F8F7F4] border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#6366f1] transition-all outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-[#9E9EA8] uppercase ml-1">Mevcut Stok</label>
            <input 
              type="number"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              placeholder="0"
              className="w-full bg-[#F8F7F4] border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-[#6366f1] transition-all outline-none font-medium"
            />
          </div>

          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-bold text-[#9E9EA8] uppercase ml-1">Son 7 Günlük Satış</label>
            <input 
              type="number"
              value={last7DaysSales}
              onChange={(e) => setLast7DaysSales(e.target.value)}
              placeholder="Opsiyonel"
              className="w-full bg-[#F8F7F4] border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-[#6366f1] transition-all outline-none font-medium"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button 
              type="submit"
              disabled={loading || !productName || currentStock === ''}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white rounded-2xl py-4 px-6 text-sm font-bold transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Hesapla <BarChart2 className="w-4 h-4" /></>
              )}
            </button>
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[32px] border-2 border-dashed border-[#E8E4DC] p-24 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
              <History className="w-10 h-10 text-indigo-400" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-bold text-[#1A1A2E]">Envanter Analizi Bekleniyor</h3>
              <p className="text-sm text-[#6B6B7B]">
                Stok verilerinizi girerek AI destekli tahminleme motorunu çalıştırın. Satış hızınızı ve ikmal zamanlamanızı optimize edin.
              </p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* ── Özet Kartlar ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-[#E8E4DC] rounded-[32px] p-6 shadow-sm">
                <p className="text-[10px] font-bold text-[#9E9EA8] uppercase tracking-wider mb-2">Mevcut Stok</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-[#1A1A2E]">{result.currentStock}</span>
                  <span className="text-sm text-[#6B6B7B] mb-1.5 font-medium">Adet</span>
                </div>
              </div>

              <div className="bg-white border border-[#E8E4DC] rounded-[32px] p-6 shadow-sm">
                <p className="text-[10px] font-bold text-[#9E9EA8] uppercase tracking-wider mb-2">Günlük Satış Hızı</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-[#1A1A2E]">{result.dailySalesAvg.toFixed(1)}</span>
                  <span className="text-sm text-[#6B6B7B] mb-1.5 font-medium">Ürün/Gün</span>
                </div>
              </div>

              <div className="bg-white border border-[#E8E4DC] rounded-[32px] p-6 shadow-sm">
                <p className="text-[10px] font-bold text-[#9E9EA8] uppercase tracking-wider mb-2">Tahmini Tükenme</p>
                <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold ${result.daysToStockout && result.daysToStockout < 7 ? 'text-red-600' : 'text-[#1A1A2E]'}`}>
                    {result.daysToStockout ?? '∞'}
                  </span>
                  <span className="text-sm text-[#6B6B7B] mb-1.5 font-medium">Gün Sonra</span>
                </div>
              </div>

              <div className={`border rounded-[32px] p-6 shadow-sm flex flex-col justify-between ${getHealthColor(result.stockHealth)}`}>
                <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">Stok Sağlığı</p>
                <div className="flex items-center gap-2 mt-2">
                  {result.stockHealth === 'healthy' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                  <span className="text-lg font-bold">{getHealthLabel(result.stockHealth)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* ── İkmal Önerisi ── */}
              <div className="lg:col-span-7 bg-[#1A1A2E] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute right-0 top-0 p-12 opacity-10">
                  <TrendingDown size={200} className="rotate-12" />
                </div>
                
                <div className="relative z-10 space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold">Akıllı İkmal Önerisi</span>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Önerilen Miktar</p>
                      <p className="text-4xl font-bold">{result.recommendation.restockAmount} <span className="text-xl font-medium opacity-50">Adet</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Sipariş Tarihi</p>
                      <p className="text-2xl font-bold flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-indigo-400" />
                        {new Date(result.recommendation.restockDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10">
                    <p className="text-sm leading-relaxed text-white/80 italic font-medium">
                      "{result.recommendation.reason}"
                    </p>
                  </div>

                  <button className="flex items-center gap-2 bg-white text-[#1A1A2E] px-8 py-4 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all active:scale-95 shadow-xl">
                    <Plus className="w-5 h-5" /> Sipariş Oluştur
                  </button>
                </div>
              </div>

              {/* ── AI Insights ── */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-[#E8E4DC] rounded-[32px] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <AlertCircle size={20} />
                    </div>
                    <h3 className="font-bold text-[#1A1A2E]">Stratejik Analiz</h3>
                  </div>
                  <p className="text-sm text-[#6B6B7B] leading-loose">
                    {result.aiInsights}
                  </p>
                </div>

                <div className="bg-[#F8F7F4] border border-[#E8E4DC] rounded-[32px] p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[#1A1A2E]">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#9E9EA8] uppercase">Son Analiz</p>
                      <p className="text-sm font-bold text-[#1A1A2E]">Az Önce</p>
                    </div>
                  </div>
                  <button className="p-3 bg-white rounded-2xl text-[#1A1A2E] hover:text-[#6366f1] shadow-sm transition-colors">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
