'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  TrendingUp, 
  Package, 
  Zap, 
  SearchCode
} from 'lucide-react'

import { AuditResult } from '@/types/global'

interface AuditReportModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  price: number
  currencySymbol: string
  result: AuditResult
}

export default function AuditReportModal({
  isOpen,
  onClose,
  productName,
  price,
  currencySymbol,
  result
}: AuditReportModalProps) {
  if (!isOpen || !result) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
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
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* 1. İçerik ve SEO Analizi */}
            <section className="space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <SearchCode className="text-blue-500" size={20} /> İçerik ve SEO Analizi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl md:col-span-1">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Genel Skor</p>
                  <p className="text-2xl font-bold text-slate-900">%{result.content?.overallScore || 0}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl md:col-span-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">SEO Kriterleri</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.content?.criteriaScores || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl">
                        <div className={`w-2 h-2 rounded-full ${value.status === 'pass' ? 'bg-green-500' : 'bg-orange-500'}`} />
                        <span className="text-[11px] font-medium text-slate-600">{value.feedback || value.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Pazar ve Fiyat Analizi */}
            <section className="space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-orange-500" size={20} /> Pazar ve Fiyat Analizi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Mevcut Fiyat</p>
                  <p className="text-2xl font-bold text-slate-900">{price} {currencySymbol}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Önerilen Fiyat</p>
                  <p className="text-2xl font-bold text-slate-900">{result.pricing?.suggestedPrice || result.pricing?.suggested_price} {currencySymbol}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Pazar Konumu</p>
                  <p className="text-lg font-bold text-orange-600 capitalize">
                    {result.pricing?.marketPosition === 'expensive' || result.pricing?.market_position === 'expensive' ? 'Pazarın Üzerinde' : 'Rekabetçi'}
                  </p>
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
                    {result.pricing?.competitors?.map((c, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium text-slate-800">{c.seller} ({c.platform})</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{c.price} {currencySymbol}</td>
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
                  <p className="text-xl font-bold text-slate-900">
                    {result.inventory?.daysToStockout ? `${result.inventory.daysToStockout} Gün` : result.inventory?.stockoutPrediction || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-500">{result.inventory?.recommendation?.reason || result.inventory?.restockSuggestion}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Stok Sağlığı</p>
                  <p className={`text-2xl font-bold uppercase ${result.inventory?.stockHealth === 'healthy' ? 'text-green-600' : 'text-orange-600'}`}>
                    {result.inventory?.stockHealth || 'N/A'}
                  </p>
                </div>
              </div>
            </section>

            {/* 3. AI Feedback */}
            <section className="space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Zap className="text-yellow-500" size={20} /> AI Stratejik Öneri
              </h3>
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[24px] text-indigo-900 text-sm leading-relaxed italic">
                &quot;{result.pricing?.aiFeedback || result.pricing?.ai_feedback || result.inventory?.aiInsights}&quot;
              </div>
            </section>
          </div>

          {/* Modal Footer */}
          <div className="p-8 border-t border-slate-100 flex justify-end gap-3">
            <button 
              onClick={onClose}
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
    </AnimatePresence>
  )
}
