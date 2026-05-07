'use client'

import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { MessageSquare, Paperclip, Clock, CheckCircle2 } from 'lucide-react'
import type { SupportTicket } from '@/types/support'
import { TICKET_CATEGORIES, TICKET_STATUSES, TICKET_PRIORITIES } from '@/types/support'

interface TicketCardProps {
  ticket: SupportTicket
  isSelected?: boolean
  onClick?: () => void
}

export default function TicketCard({ ticket, isSelected, onClick }: TicketCardProps) {
  const category = TICKET_CATEGORIES[ticket.category]
  const status = TICKET_STATUSES[ticket.status]
  const priority = TICKET_PRIORITIES[ticket.priority]
  const hasResponse = !!ticket.admin_response

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isSelected
          ? 'border-[#FF6B35] bg-[#FFF2EC]'
          : 'border-[#E8E4DC] bg-white hover:border-[#FF6B35]/40 hover:bg-[#FAFAFD]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Konu */}
          <h4 className="text-sm font-semibold text-[#1A1A2E] truncate">
            {ticket.subject}
          </h4>

          {/* Kategori + Tarih */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-[#6B6B7B] bg-[#F8F7F4] px-2 py-0.5 rounded-full">
              {category?.label ?? ticket.category}
            </span>
            <span className="text-xs text-[#9E9EA8] flex items-center gap-1">
              <Clock size={11} />
              {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: tr })}
            </span>
          </div>

          {/* Mesaj önizleme */}
          <p className="text-xs text-[#6B6B7B] mt-2 line-clamp-2">
            {ticket.message}
          </p>
        </div>

        {/* Sağ taraf: Status + Ek göstergeleri */}
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status?.color ?? 'bg-gray-100 text-gray-700'}`}>
            {status?.label ?? ticket.status}
          </span>

          {ticket.priority !== 'normal' && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${priority?.color ?? ''}`}>
              {priority?.label}
            </span>
          )}

          <div className="flex items-center gap-1.5">
            {ticket.attachment_path && (
              <Paperclip size={12} className="text-[#9E9EA8]" />
            )}
            {hasResponse && (
              <div className="flex items-center gap-0.5 text-green-600">
                <CheckCircle2 size={12} />
                <MessageSquare size={12} />
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
