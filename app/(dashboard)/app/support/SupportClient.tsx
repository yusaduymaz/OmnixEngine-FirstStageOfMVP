'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  MessageSquare,
  Send,
  Paperclip,
  X,
  Loader2,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { notify } from '@/lib/toast'
import { createTicketSchema, type CreateTicketInput, validateFile, formatFileSize } from '@/lib/validations/support'
import type { SupportTicket } from '@/types/support'
import { TICKET_CATEGORIES, TICKET_STATUSES } from '@/types/support'
import TicketCard from '@/components/support/TicketCard'

export default function SupportClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedTicketId = searchParams.get('ticket')

  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [attachedFile, setAttachedFile] = useState<{
    path: string
    name: string
    size: number
    type: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      category: 'technical',
      subject: '',
      message: '',
    },
  })

  const message = watch('message')

  // Ticket'ları yükle
  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/support')
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets ?? [])
      }
    } catch {
      // Sessiz hata
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Seçili ticket'ı yükle
  useEffect(() => {
    if (selectedTicketId) {
      const ticket = tickets.find((t) => t.id === selectedTicketId)
      setSelectedTicket(ticket ?? null)
    } else {
      setSelectedTicket(null)
    }
  }, [selectedTicketId, tickets])

  // Dosya yükleme
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateFile(file)
    if (!validation.valid) {
      notify.error(validation.error ?? 'Dosya yüklenemedi')
      return
    }

    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/support/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        notify.error(data.hata ?? 'Dosya yüklenemedi')
        return
      }

      setAttachedFile({
        path: data.path,
        name: data.name,
        size: data.size,
        type: data.type,
      })
      notify.success('Dosya yüklendi')
    } catch {
      notify.error('Dosya yüklenirken bir hata oluştu')
    } finally {
      setUploadingFile(false)
      e.target.value = ''
    }
  }

  // Form gönderimi
  const onSubmit = async (data: CreateTicketInput) => {
    setSubmitting(true)
    try {
      const payload: CreateTicketInput & {
        browser_info?: { userAgent: string; language: string; platform: string }
        page_url?: string
      } = {
        ...data,
        browser_info: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
        },
        page_url: window.location.href,
      }

      if (attachedFile) {
        payload.attachment_path = attachedFile.path
        payload.attachment_name = attachedFile.name
        payload.attachment_size = attachedFile.size
        payload.attachment_type = attachedFile.type
      }

      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()
      if (!res.ok) {
        notify.error(result.hata ?? 'Ticket oluşturulamadı')
        return
      }

      notify.success('Destek talebiniz oluşturuldu')
      reset()
      setAttachedFile(null)
      fetchTickets()
    } catch {
      notify.error('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSelectTicket = (ticketId: string) => {
    router.push(`/app/support?ticket=${ticketId}`)
  }

  const handleBackToList = () => {
    router.push('/app/support')
  }

  return (
    <div className="flex-1 min-h-screen bg-white p-6 pb-20 md:p-8">
      {/* Header */}
      <div className="space-y-1 mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-[#1A1A2E]" style={{ fontFamily: 'var(--font-bricolage)' }}>
          Destek
        </h2>
        <p className="text-sm text-[#6B6B7B]">
          Sorularınız veya sorunlarınız için destek talebi oluşturun.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Panel: Ticket Listesi */}
        <div className={`lg:col-span-4 space-y-4 ${selectedTicket ? 'hidden lg:block' : ''}`}>
          <div className="rounded-2xl border border-[#E8E4DC] bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E8E4DC] bg-[#FAFAFD]">
              <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
                <MessageSquare size={16} className="text-[#FF6B35]" />
                Taleplerim
                {tickets.length > 0 && (
                  <span className="text-xs bg-[#FF6B35] text-white px-1.5 py-0.5 rounded-full">
                    {tickets.length}
                  </span>
                )}
              </h3>
            </div>

            <div className="p-3 max-h-[500px] overflow-y-auto space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF6B35]" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-10 h-10 text-[#E8E4DC] mx-auto mb-2" />
                  <p className="text-sm text-[#6B6B7B]">Henüz destek talebiniz yok</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    isSelected={ticket.id === selectedTicketId}
                    onClick={() => handleSelectTicket(ticket.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sağ Panel: Form veya Ticket Detayı */}
        <div className="lg:col-span-8">
          {selectedTicket ? (
            // Ticket Detayı
            <div className="rounded-2xl border border-[#E8E4DC] bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-[#E8E4DC] bg-[#FAFAFD] flex items-center gap-3">
                <button
                  onClick={handleBackToList}
                  className="lg:hidden p-2 rounded-lg hover:bg-[#E8E4DC] transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#1A1A2E]">{selectedTicket.subject}</h3>
                  <p className="text-xs text-[#6B6B7B] mt-0.5">
                    {TICKET_CATEGORIES[selectedTicket.category]?.label} •{' '}
                    {format(new Date(selectedTicket.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TICKET_STATUSES[selectedTicket.status]?.color}`}>
                  {TICKET_STATUSES[selectedTicket.status]?.label}
                </span>
              </div>

              {/* İçerik */}
              <div className="p-6 space-y-6">
                {/* Orijinal Mesaj */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#9E9EA8] font-bold mb-2">Mesajınız</p>
                  <div className="bg-[#F8F7F4] rounded-xl p-4">
                    <p className="text-sm text-[#1A1A2E] whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>
                </div>

                {/* Dosya Eki */}
                {selectedTicket.attachment_path && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#9E9EA8] font-bold mb-2">Dosya Eki</p>
                    <div className="flex items-center gap-3 bg-[#FAFAFD] border border-[#E8E4DC] rounded-xl p-3">
                      {selectedTicket.attachment_type?.startsWith('image/') ? (
                        <ImageIcon size={20} className="text-[#FF6B35]" />
                      ) : (
                        <FileText size={20} className="text-[#FF6B35]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A2E] truncate">
                          {selectedTicket.attachment_name}
                        </p>
                        <p className="text-xs text-[#6B6B7B]">
                          {selectedTicket.attachment_size ? formatFileSize(selectedTicket.attachment_size) : ''}
                        </p>
                      </div>
                      <a
                        href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/support-attachments/${selectedTicket.attachment_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-[#E8E4DC] transition-colors"
                      >
                        <Download size={16} className="text-[#6B6B7B]" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Admin Yanıtı */}
                {selectedTicket.admin_response ? (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#9E9EA8] font-bold mb-2 flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-green-500" />
                      Destek Yanıtı
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-sm text-[#1A1A2E] whitespace-pre-wrap">{selectedTicket.admin_response}</p>
                      {selectedTicket.responded_at && (
                        <p className="text-xs text-[#6B6B7B] mt-3 flex items-center gap-1">
                          <Clock size={11} />
                          {formatDistanceToNow(new Date(selectedTicket.responded_at), { addSuffix: true, locale: tr })}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FFF2EC] border border-[#FF6B35]/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-[#FF6B35] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">Yanıt bekleniyor</p>
                      <p className="text-xs text-[#6B6B7B] mt-0.5">
                        Destek ekibimiz en kısa sürede yanıt verecektir.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Yeni Ticket Formu
            <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-[#E8E4DC] bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#E8E4DC] bg-[#FAFAFD]">
                <h3 className="text-base font-bold text-[#1A1A2E]">Yeni Destek Talebi</h3>
                <p className="text-xs text-[#6B6B7B] mt-0.5">
                  Sorununuzu veya sorunuzu detaylı bir şekilde açıklayın.
                </p>
              </div>

              <div className="p-6 space-y-5">
                {/* Kategori */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1A1A2E]">Kategori</label>
                  <select
                    {...register('category')}
                    className="w-full h-11 rounded-xl border border-[#E8E4DC] bg-white px-3 text-sm text-[#1A1A2E] outline-none transition-colors focus:border-[#FF6B35]/60"
                  >
                    {Object.entries(TICKET_CATEGORIES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label} — {value.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Konu */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1A1A2E]">Konu</label>
                  <input
                    {...register('subject')}
                    placeholder="Sorununuzu kısaca özetleyin"
                    className="w-full h-11 rounded-xl border border-[#E8E4DC] bg-white px-3 text-sm text-[#1A1A2E] placeholder:text-[#9E9EA8] outline-none transition-colors focus:border-[#FF6B35]/60"
                  />
                  {errors.subject && (
                    <p className="text-xs text-red-500">{errors.subject.message}</p>
                  )}
                </div>

                {/* Mesaj */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1A1A2E]">Mesaj</label>
                  <textarea
                    {...register('message')}
                    rows={6}
                    placeholder="Sorununuzu detaylı bir şekilde açıklayın. Hata mesajları, ekran görüntüleri veya adımları paylaşabilirsiniz."
                    className="w-full rounded-xl border border-[#E8E4DC] bg-white px-3 py-3 text-sm text-[#1A1A2E] placeholder:text-[#9E9EA8] outline-none transition-colors focus:border-[#FF6B35]/60 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    {errors.message ? (
                      <p className="text-xs text-red-500">{errors.message.message}</p>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-[#9E9EA8]">{message?.length ?? 0}/5000</span>
                  </div>
                </div>

                {/* Dosya Eki */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1A1A2E]">Dosya Eki (Opsiyonel)</label>

                  {attachedFile ? (
                    <div className="flex items-center gap-3 bg-[#FAFAFD] border border-[#E8E4DC] rounded-xl p-3">
                      {attachedFile.type.startsWith('image/') ? (
                        <ImageIcon size={20} className="text-[#FF6B35]" />
                      ) : (
                        <FileText size={20} className="text-[#FF6B35]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A2E] truncate">{attachedFile.name}</p>
                        <p className="text-xs text-[#6B6B7B]">{formatFileSize(attachedFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="p-1.5 rounded-lg hover:bg-[#E8E4DC] transition-colors"
                      >
                        <X size={16} className="text-[#6B6B7B]" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 h-20 border-2 border-dashed border-[#E8E4DC] rounded-xl cursor-pointer hover:border-[#FF6B35]/40 hover:bg-[#FFF2EC]/50 transition-colors">
                      {uploadingFile ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#FF6B35]" />
                      ) : (
                        <>
                          <Paperclip size={18} className="text-[#9E9EA8]" />
                          <span className="text-sm text-[#6B6B7B]">
                            Dosya ekle (Görsel veya PDF, max 10MB)
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                      />
                    </label>
                  )}
                </div>

                {/* Gönder */}
                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#ff5c22] disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Gönder
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
