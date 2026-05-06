'use client'

import { useState } from 'react'
import { 
  Zap, 
  Search, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  SearchCode,
  ShieldCheck,
  Package,
  TrendingUp,
  ExternalLink,
  ChevronDown,
  Info,
  X,
  Target
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettingsStore } from '@/hooks/useSettingsStore'

export default function AuditCenter() {
  const { country } = useSettingsStore()
  
  // Ülkeye göre para birimi ve simge belirle
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
  
  // Form State
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [url, setUrl] = useState('')
  const [stock, setStock] = useState('50')
  const [weeklySales, setWeeklySales] = useState('10')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // UI State
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [progress, setProgress] = useState<Record<string, 'pending' | 'loading' | 'completed' | 'failed'>>({
    content: 'pending',
    pricing: 'pending',
    inventory: 'pending'
  })

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productName || !price) return

    setLoading(true)
    setResult(null)
    setProgress({
      content: 'loading',
      pricing: 'loading',
      inventory: 'loading'
    })

    try {
      const res = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          price: Number(price),
          url,
          currency: currencyInfo.code,
          stock: Number(stock),
          weeklySales: Number(weeklySales)
        })
      })

      if (!res.ok) throw new Error('Denetim başlatılamadı.')
      
      const data = await res.json()
      
      // Simülasyon: Ajanların tamamlanma efektini ver
      await new Promise(r => setTimeout(r, 800))
      
      setResult(data.results)
      setProgress({
        content: data.results.content ? 'completed' : 'failed',
        pricing: data.results.pricing ? 'completed' : 'failed',
        inventory: data.results.inventory ? 'completed' : 'failed'
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Denetim Formu ── */}
      <div className="bg-white rounded-[32px] border border-orange-100 p-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <Zap size={240} className="text-orange-600 fill-orange-600" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                <Zap size={20} className="fill-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-bricolage">Full Product Audit</h3>
                <p className="text-xs text-slate-500">Tüm ajanları aynı anda çalıştırın ve 360° rapor alın.</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-slate-400 hover:text-orange-600 flex items-center gap-1 transition-colors"
            >
              <Target size={14} /> {showAdvanced ? 'Basit Mod' : 'Detaylı Veri Girişi'}
              <ChevronDown size={14} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <form onSubmit={handleAudit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ürün adı..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="md:col-span-2 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {currencyInfo.symbol}
                </span>
                <input 
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Fiyat"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-9 pr-4 text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none font-medium"
                />
              </div>
              <div className="md:col-span-3">
                <input 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="URL (Opsiyonel)"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <button 
                  type="submit"
                  disabled={loading || !productName || !price}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl py-4 px-6 text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-slate-200"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Başlat <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>

            {/* Gelişmiş Bilgiler - Stok ve Satış */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-50 mt-2">
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package size={18} className="text-slate-400" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mevcut Stok</p>
                          <p className="text-[11px] text-slate-500 leading-none">Deponuzdaki güncel adet</p>
                        </div>
                      </div>
                      <input 
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-20 bg-white border-none rounded-xl py-2 px-3 text-sm font-bold text-slate-900 text-center outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingUp size={18} className="text-slate-400" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Haftalık Satış</p>
                          <p className="text-[11px] text-slate-500 leading-none">Ortalama satış hızı</p>
                        </div>
                      </div>
                      <input 
                        type="number"
                        value={weeklySales}
                        onChange={(e) => setWeeklySales(e.target.value)}
                        className="w-20 bg-white border-none rounded-xl py-2 px-3 text-sm font-bold text-slate-900 text-center outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>

      {/* ── İlerleme ve Sonuç Kartları ── */}
      <AnimatePresence>
        {(loading || result) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              { id: 'content', label: 'İçerik Analizi', icon: SearchCode, data: result?.content },
              { id: 'pricing', label: 'Fiyat Rekabeti', icon: TrendingUp, data: result?.pricing },
              { id: 'inventory', label: 'Stok Sağlığı', icon: Package, data: result?.inventory }
            ].map((agent) => (
              <div key={agent.id} className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${
                    progress[agent.id] === 'completed' ? 'bg-green-50 text-green-600' :
                    progress[agent.id] === 'loading' ? 'bg-orange-50 text-orange-600 animate-pulse' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    <agent.icon size={22} />
                  </div>
                  {progress[agent.id] === 'completed' ? (
                    <div className="bg-green-500 rounded-full p-0.5"><CheckCircle2 size={12} className="text-white" /></div>
                  ) : progress[agent.id] === 'loading' ? (
                    <Loader2 size={16} className="text-orange-500 animate-spin" />
                  ) : null}
                </div>
                
                <h4 className="text-sm font-bold text-slate-900">{agent.label}</h4>
                
                <div className="mt-2">
                  {progress[agent.id] === 'loading' ? (
                    <div className="space-y-1.5">
                      <div className="h-3 w-3/4 bg-slate-50 rounded animate-pulse" />
                      <div className="h-2 w-1/2 bg-slate-50 rounded animate-pulse" />
                    </div>
                  ) : progress[agent.id] === 'completed' ? (
                    <div className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      {agent.id === 'content' && (
                        <>
                          <span className="text-orange-600 font-bold">SEO: {agent.data?.overallScore || 85}/100</span>
                          <br />{agent.data?.criteriaScores?.titleQuality?.status === 'pass' ? 'Başlık Optimize' : 'Başlık Geliştirilmeli'}
                        </>
                      )}
                      {agent.id === 'pricing' && (
                        <>
                          <span className={`${agent.data?.marketPosition === 'cheaper' ? 'text-green-600' : 'text-orange-600'} font-bold`}>
                            {agent.data?.marketPosition === 'cheaper' ? 'Avantajlı' : 'Pahalı'}
                          </span>
                          <br />Rakip: {agent.data?.competitors?.[0]?.price || '—'} {currencyInfo.symbol}
                        </>
                      )}
                      {agent.id === 'inventory' && (
                        <>
                          <span className="text-blue-600 font-bold">{agent.data?.stockHealth === 'healthy' ? 'Güvenli' : 'Kritik'}</span>
                          <br />{agent.data?.stockoutPrediction || '—'}
                        </>
                      )}
                      {agent.id === 'image' && <span className="text-slate-400">Görseller Optimize</span>}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-300">Bekleniyor...</span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Özet Rapor Kartı ── */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <BarChart3 size={160} />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold border border-white/10">
                <CheckCircle2 size={14} className="text-green-400" />
                Denetim Tamamlandı
              </div>
              <h2 className="text-3xl font-bold font-bricolage">Genel Sağlık Raporu</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                Yapay zeka denetimi tamamlandı. Ürününüzün pazar yeri performansı incelendi. 
                Analizlerimize göre {result.pricing?.marketPosition === 'expensive' ? 'fiyat rekabetinde geridesiniz' : 'fiyatınız pazarla uyumlu'}. 
                {result.inventory?.stockHealth === 'critical' ? ' Stok tükenme riski yüksek.' : ' Stok seviyeleriniz yeterli.'}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-100 transition-all active:scale-95"
                >
                  Raporun Tamamını Gör <ExternalLink size={16} />
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all border border-white/10">
                  Aksiyon Önerileri
                </button>
              </div>
            </div>
            
            <div className="lg:col-span-4 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
              <h5 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Analiz Skorları</h5>
              <div className="space-y-4">
                {[
                  { label: 'SEO Kalitesi', score: result.content?.overallScore || 85 },
                  { label: 'Fiyat Rekabeti', score: result.pricing?.overallScore || 92 },
                  { label: 'Stok Devri', score: 100 }
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-[11px] font-bold mb-1.5">
                      <span>{s.label}</span>
                      <span>%{s.score}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${s.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── DETAYLI RAPOR MODALI ── */}
      <AnimatePresence>
        {showModal && result && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 font-bricolage">{productName}</h2>
                  <p className="text-sm text-slate-500">360° Ürün Analiz Raporu — {new Date().toLocaleDateString('tr-TR')}</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* 1. Fiyat ve Rakip Bilgisi */}
                <section className="space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="text-orange-500" size={20} /> Pazar ve Fiyat Analizi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-orange-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Mevcut Fiyat</p>
                      <p className="text-2xl font-bold text-slate-900">{price} {currencyInfo.symbol}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Önerilen Fiyat</p>
                      <p className="text-2xl font-bold text-slate-900">{result.pricing?.suggestedPrice} {currencyInfo.symbol}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Pazar Konumu</p>
                      <p className="text-lg font-bold text-orange-600 capitalize">{result.pricing?.marketPosition === 'expensive' ? 'Pazarın Üzerinde' : 'Rekabetçi'}</p>
                    </div>
                  </div>
                  
                  {/* Rakip Tablosu */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 font-bold text-slate-500">Rakip / Platform</th>
                          <th className="px-4 py-3 font-bold text-slate-500">Fiyat</th>
                          <th className="px-4 py-3 font-bold text-slate-500">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.pricing?.competitors?.map((c: any, i: number) => (
                          <tr key={i}>
                            <td className="px-4 py-3 font-medium text-slate-800">{c.seller} ({c.platform})</td>
                            <td className="px-4 py-3 font-bold text-slate-900">{c.price} {currencyInfo.symbol}</td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-bold">Stokta</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 2. Stok ve Envanter Tahmini */}
                <section className="space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Package className="text-blue-500" size={20} /> Envanter Stratejisi
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-[24px] flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">Tahmini Stok Tükenme</p>
                      <p className="text-xl font-bold text-slate-900">{result.inventory?.stockoutPrediction}</p>
                      <p className="text-xs text-slate-500">{result.inventory?.restockSuggestion}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase">Satış Hızı</p>
                      <p className="text-2xl font-bold text-blue-600">%{result.inventory?.velocityScore || 85}</p>
                    </div>
                  </div>
                </section>

                {/* 3. AI Feedback */}
                <section className="space-y-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="text-yellow-500" size={20} /> AI Stratejik Öneri
                  </h3>
                  <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[24px] text-indigo-900 text-sm leading-relaxed italic">
                    "{result.pricing?.aiFeedback}"
                  </div>
                </section>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Kapat
                </button>
                <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">
                  Raporu PDF İndir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
