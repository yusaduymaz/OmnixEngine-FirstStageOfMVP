// OmniX Engine — Destek Sistemi Tip Tanımları

// ═══════════════════════════════════════════════════════
// Temel Tipler
// ═══════════════════════════════════════════════════════

export type TicketCategory =
  | 'technical'
  | 'billing'
  | 'feature'
  | 'bug'
  | 'account'
  | 'other'

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed'

export type TicketPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'

// ═══════════════════════════════════════════════════════
// Kategori Bilgileri
// ═══════════════════════════════════════════════════════

export const TICKET_CATEGORIES: Record<TicketCategory, { label: string; description: string }> = {
  technical: {
    label: 'Teknik Sorun',
    description: 'Uygulama hataları, performans sorunları'
  },
  billing: {
    label: 'Fatura & Ödeme',
    description: 'Abonelik, kredi, ödeme sorunları'
  },
  feature: {
    label: 'Özellik Talebi',
    description: 'Yeni özellik önerileri'
  },
  bug: {
    label: 'Hata Bildirimi',
    description: 'Yazılım hataları ve buglar'
  },
  account: {
    label: 'Hesap',
    description: 'Hesap ayarları, güvenlik'
  },
  other: {
    label: 'Diğer',
    description: 'Diğer konular'
  }
}

export const TICKET_STATUSES: Record<TicketStatus, { label: string; color: string }> = {
  open: { label: 'Açık', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'İşlemde', color: 'bg-yellow-100 text-yellow-700' },
  resolved: { label: 'Çözüldü', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Kapalı', color: 'bg-gray-100 text-gray-700' }
}

export const TICKET_PRIORITIES: Record<TicketPriority, { label: string; color: string }> = {
  low: { label: 'Düşük', color: 'bg-gray-100 text-gray-700' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Yüksek', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Acil', color: 'bg-red-100 text-red-700' }
}

// ═══════════════════════════════════════════════════════
// Veritabanı Modeli
// ═══════════════════════════════════════════════════════

export interface SupportTicket {
  id: string
  user_id: string
  workspace_id: string | null

  // Ticket bilgileri
  category: TicketCategory
  subject: string
  message: string

  // Dosya eki
  attachment_path: string | null
  attachment_name: string | null
  attachment_size: number | null
  attachment_type: string | null

  // Ek bilgiler
  page_url: string | null
  browser_info: BrowserInfo | null

  // Durum
  status: TicketStatus
  priority: TicketPriority
  is_read: boolean

  // Admin yanıtı
  admin_response: string | null
  responded_by: string | null
  responded_at: string | null

  // Bildirimler
  admin_notified: boolean
  user_notified: boolean

  created_at: string
  updated_at: string
}

export interface BrowserInfo {
  userAgent?: string
  language?: string
  platform?: string
  screenWidth?: number
  screenHeight?: number
}

// ═══════════════════════════════════════════════════════
// API Request/Response Tipleri
// ═══════════════════════════════════════════════════════

// Yeni ticket oluşturma
export interface CreateTicketRequest {
  category: TicketCategory
  subject: string
  message: string
  attachment_path?: string
  attachment_name?: string
  attachment_size?: number
  attachment_type?: string
  page_url?: string
  browser_info?: BrowserInfo
}

// Ticket güncelleme (admin)
export interface UpdateTicketRequest {
  status?: TicketStatus
  priority?: TicketPriority
  is_read?: boolean
  admin_response?: string
}

// Ticket listesi filtresi
export interface TicketListFilter {
  status?: TicketStatus | 'all'
  category?: TicketCategory | 'all'
  is_read?: boolean | 'all'
  page?: number
  limit?: number
}

// Ticket ile kullanıcı bilgisi (admin için)
export interface TicketWithUser extends SupportTicket {
  user?: {
    id: string
    email: string
    full_name: string | null
    plan: string
  }
}

// ═══════════════════════════════════════════════════════
// Dosya Yükleme
// ═══════════════════════════════════════════════════════

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf'
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export interface UploadResult {
  path: string
  name: string
  size: number
  type: string
}

// ═══════════════════════════════════════════════════════
// Email Bildirimleri
// ═══════════════════════════════════════════════════════

export interface AdminNotificationData {
  ticketId: string
  userName: string
  userEmail: string
  category: TicketCategory
  subject: string
  message: string
  ticketUrl: string
}

export interface UserNotificationData {
  ticketId: string
  userName: string
  userEmail: string
  subject: string
  adminResponse: string
  ticketUrl: string
}
