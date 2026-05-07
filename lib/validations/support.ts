import { z } from 'zod'

// ═══════════════════════════════════════════════════════
// Temel Enum Şemaları
// ═══════════════════════════════════════════════════════

export const ticketCategorySchema = z.enum([
  'technical',
  'billing',
  'feature',
  'bug',
  'account',
  'other'
])

export const ticketStatusSchema = z.enum([
  'open',
  'in_progress',
  'resolved',
  'closed'
])

export const ticketPrioritySchema = z.enum([
  'low',
  'normal',
  'high',
  'urgent'
])

// ═══════════════════════════════════════════════════════
// Browser Info Şeması
// ═══════════════════════════════════════════════════════

export const browserInfoSchema = z.object({
  userAgent: z.string().optional(),
  language: z.string().optional(),
  platform: z.string().optional(),
  screenWidth: z.number().optional(),
  screenHeight: z.number().optional()
}).optional()

// ═══════════════════════════════════════════════════════
// Ticket Oluşturma Şeması
// ═══════════════════════════════════════════════════════

export const createTicketSchema = z.object({
  category: ticketCategorySchema,
  subject: z
    .string()
    .min(5, 'Konu en az 5 karakter olmalıdır')
    .max(200, 'Konu en fazla 200 karakter olabilir'),
  message: z
    .string()
    .min(20, 'Mesaj en az 20 karakter olmalıdır')
    .max(5000, 'Mesaj en fazla 5000 karakter olabilir'),
  attachment_path: z.string().optional(),
  attachment_name: z.string().optional(),
  attachment_size: z.number().optional(),
  attachment_type: z.string().optional(),
  page_url: z.string().url().optional().or(z.literal('')),
  browser_info: browserInfoSchema
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>

// ═══════════════════════════════════════════════════════
// Ticket Güncelleme Şeması (Admin)
// ═══════════════════════════════════════════════════════

export const updateTicketSchema = z.object({
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  is_read: z.boolean().optional(),
  admin_response: z
    .string()
    .min(10, 'Yanıt en az 10 karakter olmalıdır')
    .max(5000, 'Yanıt en fazla 5000 karakter olabilir')
    .optional()
})

export type UpdateTicketInput = z.infer<typeof updateTicketSchema>

// ═══════════════════════════════════════════════════════
// Ticket Listesi Filtre Şeması
// ═══════════════════════════════════════════════════════

export const ticketListFilterSchema = z.object({
  status: ticketStatusSchema.or(z.literal('all')).optional(),
  category: ticketCategorySchema.or(z.literal('all')).optional(),
  is_read: z.enum(['true', 'false', 'all']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
})

export type TicketListFilterInput = z.infer<typeof ticketListFilterSchema>

// ═══════════════════════════════════════════════════════
// Dosya Yükleme Validasyonu
// ═══════════════════════════════════════════════════════

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf'
]

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Dosya boyutu kontrolü
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Dosya boyutu 10MB'dan büyük olamaz. Mevcut: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    }
  }

  // MIME type kontrolü
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Sadece görsel (JPEG, PNG, GIF, WebP) ve PDF dosyaları yüklenebilir'
    }
  }

  return { valid: true }
}

// ═══════════════════════════════════════════════════════
// Yardımcı Fonksiyonlar
// ═══════════════════════════════════════════════════════

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
