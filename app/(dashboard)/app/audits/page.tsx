'use client'

import { useState, useEffect } from 'react'
import { 
  Zap, 
  Search, 
  Filter, 
  BarChart3, 
  Calendar, 
  ArrowRight, 
  ExternalLink,
  ChevronRight,
  Package,
  TrendingUp,
  SearchCode,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AuditReportModal from '@/components/dashboard/AuditReportModal'

export default function AuditsLibraryPage() {
  const [audits, setAudits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Modal State
  const [selectedAudit, setSelectedAudit] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchAudits()
  }, [])

  const fetchAudits = async () => {
    try {
      setErrorMessage(null)
      const res = await fetch('/api/audits', { cache: 'no-store' })
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        const message = errorData?.error || 'Denetim raporları yüklenemedi.'
        throw new Error(message)
      }
      const data = await res.json()
      setAudits(data.audits || [])
    } catch (err) {
      console.error('Denetimler yüklenirken hata:', err)
      const message = err instanceof Error ? err.message : 'Denetim raporları yüklenemedi.'
      setErrorMessage(message)
      setAudits([])
    } finally {
      setLoading(false)
    }
  }

  const filteredAudits = audits.filter(audit => 
    audit.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetails = (audit: any) => {
    // Audit verisini modalın beklediği formata dönüştür
    const formattedResult = {
      content: audit.analyses,
      pricing: audit.pricing,
      inventory: audit.inventory
    }
    setSelectedAudit({
      ...audit,
      formattedResult
    })
    setShowModal(true)
  }

  return (
    <div className="bg-white min-h-screen">
      {/* ── Header ── */}
      <div className="border-b border-[#E8E4DC] bg-white px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] font-bricolage">Denetim Kütüphanesi</h1>
          <p className="text-[#6B6B7B] text-sm mt-0.5">Geçmişte yaptığınız tüm 360° ürün denetimleri ve performans raporları.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9EA8]" />
            <input 
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-[#E8E4DC] rounded-xl text-sm focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/10 transition-all w-full md:w-64"
            />
          </div>
          <button className="p-2 bg-white border border-[#E8E4DC] rounded-xl text-[#6B6B7B] hover:bg-[#FAFAFD] hover:border-[#FF6B35]/40 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Denetim', value: audits.length, icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Ort. SEO Skoru', value: '%84', icon: SearchCode, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Kritik Stok', value: audits.filter(a => a.inventory_status === 'critical').length, icon: Package, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Pazar Uyumu', value: '%92', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Audit List */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-slate-500 font-medium">Denetimler yükleniyor...</p>
          </div>
        ) : errorMessage ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-slate-900 font-bold">Denetimler yüklenemedi.</p>
            <p className="text-sm text-slate-500">{errorMessage}</p>
          </div>
        ) : filteredAudits.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {filteredAudits.map((audit) => (
              <motion.div 
                key={audit.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                onClick={() => handleViewDetails(audit)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                      <BarChart3 size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{audit.product_name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Calendar size={12} /> {new Date(audit.created_at).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <ExternalLink size={12} /> {audit.product_url ? 'Pazar Yeri URL' : 'Manuel Giriş'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">SEO</p>
                        <p className={`text-sm font-bold ${audit.seo_score > 70 ? 'text-green-600' : 'text-orange-600'}`}>%{audit.seo_score}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fiyat</p>
                        <p className="text-sm font-bold text-blue-600">%{audit.pricing_score}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Stok</p>
                        <p className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          audit.inventory_status === 'healthy' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {audit.inventory_status === 'healthy' ? 'GÜVENLİ' : 'KRİTİK'}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all">
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Zap size={32} />
            </div>
            <div>
              <p className="text-slate-900 font-bold">Henüz denetim bulunamadı.</p>
              <p className="text-slate-500 text-sm">İlk ürün denetiminizi başlatarak kütüphanenizi oluşturun.</p>
            </div>
            <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">
              Denetim Başlat
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedAudit && (
        <AuditReportModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          productName={selectedAudit.product_name}
          price={Number(selectedAudit.product_price)}
          currencySymbol={selectedAudit.currency === 'TRY' ? '₺' : '$'}
          result={selectedAudit.formattedResult}
        />
      )}
    </div>
    </div>
  )
}
