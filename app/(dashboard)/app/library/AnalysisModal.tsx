'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Trash2,
  Loader2,
  BarChart3,
  Lightbulb,
} from 'lucide-react'

// ── Tipler ────────────────────────────────────────────────────
interface CriterionScore {
  score: number
  status: 'pass' | 'warn' | 'fail'
  feedback: string
}

interface Suggestion {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

export interface AnalysisModalProps {
  id: string
  sourceUrl: string
  sourcePlatform?: string
  targetPlatforms: string[]
  overallScore: number
  criteriaScores: Record<string, CriterionScore>
  suggestions?: Suggestion[]
  onDeleted?: (id: string) => void
}

// ── Sabitler ──────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  trendyol: '#FF6B35',
  hepsiburada: '#FF6000',
  amazon_tr: '#FF9900',
  ciceksepeti: '#E91E63',
  etsy: '#F1641E',
  shopify: '#96bf48',
  woocommerce: '#96588a',
  amazon_us: '#FF9900',
}

const PLATFORM_LABELS: Record<string, string> = {
  trendyol: 'Trendyol',
  hepsiburada: 'Hepsiburada',
  amazon_tr: 'Amazon TR',
  ciceksepeti: 'Çiçeksepeti',
  etsy: 'Etsy',
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  amazon_us: 'Amazon US',
}

const CRITERIA_LABELS: Record<string, string> = {
  titleQuality: 'Başlık Kalitesi',
  descriptionDepth: 'Açıklama Derinliği',
  keywordDensity: 'Anahtar Kelime Yoğunluğu',
  platformRules: 'Platform Kuralları',
  legalCompliance: 'Yasal Uyumluluk',
}

// ── Portal Modal ───────────────────────────────────────────────
function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

// ── Ana Bileşen ────────────────────────────────────────────────
export default function AnalysisModal({
  id,
  sourceUrl,
  sourcePlatform,
  targetPlatforms,
  overallScore,
  criteriaScores,
  suggestions = [],
  onDeleted,
}: AnalysisModalProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'scores' | 'suggestions'>('scores')
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Modal açıkken body scroll kilitle
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const openModal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setActiveTab('scores')
    setConfirmDelete(false)
    setOpen(true)
  }, [])

  const closeModal = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setOpen(false)
    setConfirmDelete(false)
  }, [])

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      const res = await fetch(`/api/analyses/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Silinemedi')
      setOpen(false)
      onDeleted?.(id)
    } catch {
      alert('Silme işlemi başarısız. Lütfen tekrar deneyin.')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-600'
    if (score >= 41) return 'text-amber-500'
    return 'text-red-500'
  }

  const getScoreBg = (score: number) => {
    if (score >= 71) return 'bg-green-50 border-green-200'
    if (score >= 41) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'warn': return <AlertCircle className="w-4 h-4 text-amber-500" />
      case 'fail': return <XCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const domain = new URL(sourceUrl).hostname.replace('www.', '')

  return (
    <>
      {/* ─── İncele Butonu ─── */}
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#1A1A2E] text-white hover:bg-[#2d2d4a] active:scale-95 transition-all font-medium"
      >
        <Search className="w-3.5 h-3.5" />
        Analizi Gör
      </button>

      {/* ─── Modal (Portal) ─── */}
      {open && (
        <ModalPortal>
          {/* Backdrop */}
          <div
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(e) }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              background: 'rgba(10, 10, 20, 0.65)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          >
            {/* Modal kutusu */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '24px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
                width: '100%',
                maxWidth: '720px',
                maxHeight: '88vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* ── Başlık Barı ── */}
              <div
                style={{
                  padding: '24px 24px 20px',
                  borderBottom: '1px solid #E8E4DC',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  background: '#FAFAFA',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', items: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 10px',
                        borderRadius: '999px',
                        color: '#6366f1',
                        fontWeight: 700,
                        background: '#eef2ff',
                        border: '1px solid #e0e7ff',
                        textTransform: 'uppercase',
                      }}
                    >
                      Analiz Raporu
                    </span>
                    {sourcePlatform && (
                      <span style={{ fontSize: '10px', color: '#9E9EA8', fontWeight: 600, textTransform: 'uppercase' }}>
                        {sourcePlatform}
                      </span>
                    )}
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1A1A2E',
                      margin: '0 0 6px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {domain}
                    <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 text-[#9E9EA8] hover:text-[#1A1A2E] transition-colors" />
                    </a>
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#6B6B7B' }}>Hedef:</span>
                    {(targetPlatforms ?? []).map((p) => (
                      <span
                        key={p}
                        style={{
                          fontSize: '11px',
                          padding: '2px 10px',
                          borderRadius: '999px',
                          color: '#fff',
                          fontWeight: 600,
                          background: PLATFORM_COLORS[p] ?? '#888',
                        }}
                      >
                        {PLATFORM_LABELS[p] ?? p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skor ve Kapat */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <div
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border ${getScoreBg(overallScore)}`}
                  >
                    <span className={`text-xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</span>
                    <span className="text-[9px] font-bold text-[#6B6B7B] uppercase">SKOR</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     <button
                      type="button"
                      onClick={closeModal}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: '#F3F4F6',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#1A1A2E',
                      }}
                    >
                      <X size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${confirmDelete ? 'bg-red-500 text-white' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                    >
                      {deleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Sekmeler ── */}
              <div style={{ display: 'flex', borderBottom: '1px solid #E8E4DC', background: '#fff' }}>
                {[
                  { key: 'scores' as const, label: 'Kriter Puanları', Icon: BarChart3 },
                  { key: 'suggestions' as const, label: 'İyileştirme Önerileri', Icon: Lightbulb },
                ].map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px 0',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      borderBottom: `2px solid ${activeTab === key ? '#6366f1' : 'transparent'}`,
                      color: activeTab === key ? '#6366f1' : '#6B6B7B',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>

              {/* ── İçerik ── */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#FAFAFA' }}>
                {activeTab === 'scores' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(criteriaScores ?? {}).map(([key, val]) => (
                      <div
                        key={key}
                        style={{
                          background: '#fff',
                          borderRadius: '16px',
                          padding: '16px',
                          border: '1px solid #E8E4DC',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getStatusIcon(val.status)}
                            <span style={{ fontWeight: 700, fontSize: '14px', color: '#1A1A2E' }}>
                              {CRITERIA_LABELS[key] ?? key}
                            </span>
                          </div>
                          <span className={`text-sm font-bold ${getScoreColor(val.score)}`}>
                            {val.score}/100
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#6B6B7B', lineHeight: 1.5, margin: 0 }}>
                          {val.feedback}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'suggestions' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {suggestions && suggestions.length > 0 ? (
                      suggestions.map((s, i) => (
                        <div
                          key={i}
                          style={{
                            background: '#fff',
                            borderRadius: '16px',
                            padding: '18px',
                            borderLeft: `4px solid ${s.priority === 'high' ? '#EF4444' : s.priority === 'medium' ? '#F59E0B' : '#10B981'}`,
                            borderTop: '1px solid #E8E4DC',
                            borderRight: '1px solid #E8E4DC',
                            borderBottom: '1px solid #E8E4DC',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '15px', color: '#1A1A2E' }}>{s.title}</span>
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: s.priority === 'high' ? '#EF4444' : s.priority === 'medium' ? '#B45309' : '#047857',
                                background: s.priority === 'high' ? '#FEF2F2' : s.priority === 'medium' ? '#FFFBEB' : '#ECFDF5',
                              }}
                            >
                              {s.priority === 'high' ? 'Kritik' : s.priority === 'medium' ? 'Önemli' : 'Düşük'}
                            </span>
                          </div>
                          <p style={{ fontSize: '13px', color: '#6B6B7B', lineHeight: 1.6, margin: 0 }}>
                            {s.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: '#9E9EA8' }}>
                        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p style={{ fontSize: '14px' }}>İyileştirme önerisi bulunamadı.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Alt Bilgi */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #E8E4DC', background: '#fff', display: 'flex', justifyContent: 'center' }}>
                <p style={{ fontSize: '11px', color: '#9E9EA8', margin: 0 }}>
                  Analiz sonuçları yapay zeka tarafından e-ticaret en iyi uygulamalarına göre oluşturulmuştur.
                </p>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  )
}
