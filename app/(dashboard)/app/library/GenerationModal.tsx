'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Zap,
  FileText,
  Megaphone,
  Copy,
  Check,
  Eye,
  Trash2,
  Loader2,
  RefreshCw,
} from 'lucide-react'

// ── Tipler ────────────────────────────────────────────────────
interface AdCopyItem {
  headline: string
  body: string
  platform?: string
}

interface GenerationContent {
  // Generate formatı
  titles?: { text: string; platform: string; char_count?: number }[]
  description_short?: string
  description_long?: string
  ad_copy?: AdCopyItem
  ad_copies?: AdCopyItem[]
  keywords_used?: string[]
  seo_score?: number
  seo_compliance_notes?: string
  
  // Convert formatı (Dönüştürme çıktıları)
  results?: {
    platform: string
    title: string
    description: string
  }[]
  scrapedData?: {
    title: string
    description: string
    content: string
  }
}

export interface GenerationModalProps {
  id: string
  productName: string
  results: GenerationContent | null
  platform: string[]
  tone: string
  onDeleted?: (id: string) => void
}

// ── Sabitler ──────────────────────────────────────────────────
const TONE_LABELS: Record<string, string> = {
  professional: 'Profesyonel',
  friendly: 'Samimi',
  luxury: 'Lüks',
  discount: 'Kampanyalı',
}

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

// ── Kopyala Butonu ────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
      }}
      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-[#E8E4DC] hover:border-[#FF6B35] hover:text-[#FF6B35] text-[#6B6B7B] transition-all shrink-0 bg-white"
    >
      {copied ? (
        <Check className="w-3 h-3 text-green-500" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      {copied ? 'Kopyalandı' : 'Kopyala'}
    </button>
  )
}

// ── Portal Modal ───────────────────────────────────────────────
function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof window === 'undefined') return null
  return createPortal(children, document.body)
}

// ── Ana Bileşen ────────────────────────────────────────────────
export default function GenerationModal({
  id,
  productName,
  results,
  platform,
  tone,
  onDeleted,
}: GenerationModalProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'titles' | 'description' | 'ad' | 'convert'>('titles')
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Eğer convert datası varsa varsayılan tabı ona çek
  useEffect(() => {
    if (results?.results && results.results.length > 0) {
      setActiveTab('convert')
    }
  }, [results])

  // Modal açıkken body scroll kilitle
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // ESC ile kapat
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setConfirmDelete(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const openModal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (results?.results && results.results.length > 0) {
      setActiveTab('convert')
    } else {
      setActiveTab('titles')
    }
    setConfirmDelete(false)
    setOpen(true)
  }, [results])

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
      const res = await fetch(`/api/generations/${id}`, { method: 'DELETE' })
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

  // Reklam metinlerini birleştir: yeni ad_copies > eski ad_copy > boş
  const resolvedAdCopies: AdCopyItem[] = (() => {
    if (results?.ad_copies && results.ad_copies.length > 0) return results.ad_copies
    if (results?.ad_copy?.headline) return [results.ad_copy]
    return []
  })()

  const hasContent =
    results &&
    ((results.titles && results.titles.length > 0) ||
      results.description_short ||
      results.description_long ||
      resolvedAdCopies.length > 0 ||
      (results.results && results.results.length > 0))

  return (
    <>
      {/* ─── İncele Butonu ─── */}
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#1A1A2E] text-white hover:bg-[#2d2d4a] active:scale-95 transition-all font-medium"
      >
        <Eye className="w-3.5 h-3.5" />
        İncele
      </button>

      {/* ─── Modal (Portal) ─── */}
      {open && (
        <ModalPortal>
          {/* Global animasyon */}
          <style>{`
            @keyframes cfModalIn {
              from { opacity: 0; transform: translateY(20px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

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
                borderRadius: '20px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
                width: '100%',
                maxWidth: '720px',
                maxHeight: '88vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'cfModalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* ── Başlık Barı ── */}
              <div
                style={{
                  padding: '18px 20px 16px',
                  borderBottom: '1px solid #E8E4DC',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  background: '#FAFAFA',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h2
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#1A1A2E',
                      margin: '0 0 6px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {productName}
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    {platform.map((p) => (
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
                    <span style={{ fontSize: '11px', color: '#9E9EA8' }}>
                      {TONE_LABELS[tone] ?? tone}
                    </span>
                  </div>
                </div>

                {/* Sil + Kapat */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {/* Sil butonu */}
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      border: confirmDelete ? 'none' : '1px solid #FEE2E2',
                      background: confirmDelete ? '#EF4444' : '#FFF5F5',
                      color: confirmDelete ? '#fff' : '#EF4444',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                      opacity: deleting ? 0.7 : 1,
                    }}
                  >
                    {deleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    {confirmDelete ? 'Evet, Sil' : 'Sil'}
                  </button>

                  {/* X Kapat */}
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#9E9EA8',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F3F4F6'
                      e.currentTarget.style.color = '#1A1A2E'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#9E9EA8'
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* ── İçerik Yok ── */}
              {!hasContent ? (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '56px 24px',
                    gap: '10px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '14px',
                      background: '#F8F7F4',
                      border: '1px solid #E8E4DC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <FileText size={22} color="#9E9EA8" />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '15px', color: '#1A1A2E', margin: 0 }}>
                    İçerik bulunamadı
                  </p>
                  <p style={{ fontSize: '13px', color: '#9E9EA8', margin: 0 }}>
                    Bu üretim için kayıt yok ya da üretim başarısız oldu.
                  </p>
                </div>
              ) : (
                <>
                  {/* ── Sekmeler ── */}
                  <div
                    style={{
                      display: 'flex',
                      borderBottom: '1px solid #E8E4DC',
                      background: '#fff',
                    }}
                  >
                    {[
                      ...(results.results && results.results.length > 0 ? [{ key: 'convert' as const, label: 'Dönüştürme', Icon: RefreshCw }] : []),
                      { key: 'titles' as const, label: 'Başlıklar', Icon: Zap },
                      { key: 'description' as const, label: 'Açıklama', Icon: FileText },
                      { key: 'ad' as const, label: 'Reklam Metni', Icon: Megaphone },
                    ].map(({ key, label, Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveTab(key) }}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '13px 0',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: 'none',
                          borderBottom: `2px solid ${activeTab === key ? '#FF6B35' : 'transparent'}`,
                          color: activeTab === key ? '#FF6B35' : '#6B6B7B',
                          background: 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <Icon size={13} />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* ── Sekme İçerikleri ── */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    {/* DÖNÜŞTÜRME (CONVERT) */}
                    {activeTab === 'convert' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {results.results?.map((res, i) => (
                          <div
                            key={i}
                            style={{
                              background: '#F8F7F4',
                              borderRadius: '16px',
                              padding: '20px',
                              border: '1px solid #E8E4DC',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  padding: '4px 12px',
                                  borderRadius: '999px',
                                  color: '#fff',
                                  fontWeight: 700,
                                  background: PLATFORM_COLORS[res.platform] ?? '#888',
                                }}
                              >
                                {PLATFORM_LABELS[res.platform] ?? res.platform}
                              </span>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <CopyBtn text={`${res.title}\n\n${res.description}`} />
                              </div>
                            </div>
                            
                            <div>
                              <p style={{ fontSize: '11px', fontWeight: 700, color: '#9E9EA8', textTransform: 'uppercase', marginBottom: '6px' }}>Başlık</p>
                              <p style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A2E', margin: 0 }}>{res.title}</p>
                            </div>
                            
                            <div style={{ borderTop: '1px solid #E8E4DC', paddingTop: '12px' }}>
                              <p style={{ fontSize: '11px', fontWeight: 700, color: '#9E9EA8', textTransform: 'uppercase', marginBottom: '6px' }}>Açıklama</p>
                              <p style={{ fontSize: '14px', color: '#6B6B7B', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>{res.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* BAŞLIKLAR */}
                    {activeTab === 'titles' &&
                      (results.titles && results.titles.length > 0 ? (
                        results.titles.map((title, i) => (
                          <div
                            key={i}
                            style={{
                              background: '#F8F7F4',
                              borderRadius: '14px',
                              padding: '14px 16px',
                              border: '1px solid #E8E4DC',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                              <p
                                style={{
                                  fontSize: '14px',
                                  color: '#1A1A2E',
                                  lineHeight: 1.55,
                                  flex: 1,
                                  margin: 0,
                                  fontWeight: 500,
                                }}
                              >
                                {title.text}
                              </p>
                              <CopyBtn text={title.text} />
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '10px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '10px',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  color: '#fff',
                                  fontWeight: 700,
                                  background: PLATFORM_COLORS[title.platform] ?? '#888',
                                }}
                              >
                                {PLATFORM_LABELS[title.platform] ?? title.platform}
                              </span>
                              <span style={{ fontSize: '11px', color: '#9E9EA8' }}>
                                {title.text.length} karakter
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ textAlign: 'center', color: '#9E9EA8', fontSize: '13px', padding: '32px 0' }}>
                          Başlık bulunamadı.
                        </p>
                      ))}

                    {/* AÇIKLAMA */}
                    {activeTab === 'description' && (
                      <>
                        {results.description_short && (
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '10px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: '#6B6B7B',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                }}
                              >
                                Kısa Açıklama
                              </span>
                              <CopyBtn text={results.description_short} />
                            </div>
                            <p
                              style={{
                                fontSize: '14px',
                                color: '#1A1A2E',
                                background: '#F8F7F4',
                                borderRadius: '14px',
                                padding: '16px',
                                lineHeight: 1.7,
                                margin: 0,
                                border: '1px solid #E8E4DC',
                              }}
                            >
                              {results.description_short}
                            </p>
                          </div>
                        )}
                        {results.description_long && (
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '10px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: '#6B6B7B',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                }}
                              >
                                Uzun Açıklama
                              </span>
                              <CopyBtn text={results.description_long} />
                            </div>
                            <p
                              style={{
                                fontSize: '14px',
                                color: '#1A1A2E',
                                background: '#F8F7F4',
                                borderRadius: '14px',
                                padding: '16px',
                                lineHeight: 1.75,
                                whiteSpace: 'pre-line',
                                margin: 0,
                                border: '1px solid #E8E4DC',
                              }}
                            >
                              {results.description_long}
                            </p>
                          </div>
                        )}
                        {!results.description_short && !results.description_long && (
                          <p style={{ textAlign: 'center', color: '#9E9EA8', fontSize: '13px', padding: '32px 0' }}>
                            Açıklama bulunamadı.
                          </p>
                        )}
                      </>
                    )}

                    {/* REKLAM METNİ */}
                    {activeTab === 'ad' &&
                      (resolvedAdCopies.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {resolvedAdCopies.map((ad, i) => {
                            const pLabel = ad.platform
                              ? PLATFORM_LABELS[ad.platform] ?? ad.platform
                              : 'Genel'
                            const pColor = ad.platform
                              ? PLATFORM_COLORS[ad.platform] ?? '#888'
                              : '#888'
                            const headlineLen = ad.headline?.length ?? 0
                            const bodyLen = (ad.body ?? '').length

                            return (
                              <div
                                key={i}
                                style={{
                                  background: '#F8F7F4',
                                  borderRadius: '14px',
                                  padding: '20px',
                                  border: '1px solid #E8E4DC',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '14px',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#6B6B7B',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        textTransform: 'uppercase' as const,
                                        letterSpacing: '0.05em',
                                      }}
                                    >
                                      <Megaphone size={12} />
                                      Meta / Google Reklam
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        color: '#fff',
                                        fontWeight: 700,
                                        background: pColor,
                                      }}
                                    >
                                      {pLabel}
                                    </span>
                                  </div>
                                  <CopyBtn text={`${ad.headline}\n${ad.body ?? ''}`} />
                                </div>
                                <p
                                  style={{
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: '#1A1A2E',
                                    margin: '0 0 10px 0',
                                  }}
                                >
                                  {ad.headline || <span style={{ color: '#9E9EA8', fontStyle: 'italic' }}>Başlık üretilmedi</span>}
                                </p>
                                <p
                                  style={{
                                    fontSize: '14px',
                                    color: '#6B6B7B',
                                    lineHeight: 1.65,
                                    margin: 0,
                                  }}
                                >
                                  {ad.body || <span style={{ color: '#9E9EA8', fontStyle: 'italic' }}>Metin üretilmedi</span>}
                                </p>
                                <div
                                  style={{
                                    marginTop: '14px',
                                    display: 'flex',
                                    gap: '16px',
                                    fontSize: '11px',
                                    color: '#9E9EA8',
                                    borderTop: '1px solid #E8E4DC',
                                    paddingTop: '12px',
                                  }}
                                >
                                  <span style={{ color: headlineLen > 40 ? '#EF4444' : undefined }}>
                                    Başlık: {headlineLen} / 40 karakter
                                  </span>
                                  <span style={{ color: bodyLen > 125 ? '#EF4444' : undefined }}>
                                    Metin: {bodyLen} / 125 karakter
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p style={{ textAlign: 'center', color: '#9E9EA8', fontSize: '13px', padding: '32px 0' }}>
                          Reklam metni bulunamadı.
                        </p>
                      ))}

                    {/* ANAHTAR KELİMELER */}
                    {results.keywords_used && results.keywords_used.length > 0 && (
                      <div
                        style={{
                          paddingTop: '14px',
                          borderTop: '1px solid #E8E4DC',
                        }}
                      >
                        <p
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#9E9EA8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '10px',
                          }}
                        >
                          Kullanılan Anahtar Kelimeler
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {results.keywords_used.map((kw, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '11px',
                                padding: '4px 10px',
                                borderRadius: '999px',
                                background: 'rgba(26,26,46,0.06)',
                                color: '#6B6B7B',
                                border: '1px solid rgba(26,26,46,0.08)',
                              }}
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  )
}
