import type { AdminNotificationData, UserNotificationData, TicketCategory } from '@/types/support'
import { TICKET_CATEGORIES } from '@/types/support'

// Resend API anahtarı
const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'OmniX Engine <noreply@omnixengine.com>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'support@omnixengine.com'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY tanımlı değil, email gönderilemiyor.')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Email gönderme hatası:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Email gönderme hatası:', error)
    return false
  }
}

// Admin'e yeni ticket bildirimi
export async function sendAdminNotification(data: AdminNotificationData): Promise<boolean> {
  const categoryLabel = TICKET_CATEGORIES[data.category as TicketCategory]?.label ?? data.category

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8F7F4; padding: 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(26,26,46,0.08);">

        <!-- Header -->
        <div style="background: #1A1A2E; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">
            Yeni Destek Talebi
          </h1>
        </div>

        <!-- Content -->
        <div style="padding: 24px;">
          <div style="background: #FFF2EC; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 14px; color: #1A1A2E;">
              <strong>${data.userName}</strong> (<a href="mailto:${data.userEmail}" style="color: #FF6B35;">${data.userEmail}</a>) yeni bir destek talebi oluşturdu.
            </p>
          </div>

          <!-- Ticket Info -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #E8E4DC; color: #6B6B7B; font-size: 13px;">Kategori</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #E8E4DC; color: #1A1A2E; font-size: 13px; font-weight: 600;">${categoryLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #E8E4DC; color: #6B6B7B; font-size: 13px;">Konu</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #E8E4DC; color: #1A1A2E; font-size: 13px; font-weight: 600;">${data.subject}</td>
            </tr>
          </table>

          <!-- Message -->
          <div style="background: #FAFAFD; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B6B7B; text-transform: uppercase; letter-spacing: 0.5px;">Mesaj</p>
            <p style="margin: 0; font-size: 14px; color: #1A1A2E; line-height: 1.6; white-space: pre-wrap;">${data.message.slice(0, 500)}${data.message.length > 500 ? '...' : ''}</p>
          </div>

          <!-- CTA -->
          <a href="${data.ticketUrl}" style="display: block; background: #FF6B35; color: white; text-align: center; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Ticket'ı Görüntüle
          </a>
        </div>

        <!-- Footer -->
        <div style="padding: 16px 24px; background: #FAFAFD; border-top: 1px solid #E8E4DC; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #9E9EA8;">
            Bu email OmniX Engine destek sistemi tarafından gönderilmiştir.
          </p>
        </div>

      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Yeni Ticket] ${data.subject} - ${categoryLabel}`,
    html,
  })
}

// Kullanıcıya admin yanıtı bildirimi
export async function sendUserNotification(data: UserNotificationData): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8F7F4; padding: 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(26,26,46,0.08);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #FF6B35 0%, #ff5c22 100%); padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">
            Destek Talebiniz Yanıtlandı
          </h1>
        </div>

        <!-- Content -->
        <div style="padding: 24px;">
          <p style="margin: 0 0 16px 0; font-size: 15px; color: #1A1A2E;">
            Merhaba <strong>${data.userName}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #6B6B7B; line-height: 1.6;">
            "<strong>${data.subject}</strong>" konulu destek talebiniz yanıtlandı.
          </p>

          <!-- Admin Response -->
          <div style="background: #FAFAFD; border-left: 4px solid #FF6B35; border-radius: 0 12px 12px 0; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B6B7B; text-transform: uppercase; letter-spacing: 0.5px;">Yanıt</p>
            <p style="margin: 0; font-size: 14px; color: #1A1A2E; line-height: 1.6; white-space: pre-wrap;">${data.adminResponse}</p>
          </div>

          <!-- CTA -->
          <a href="${data.ticketUrl}" style="display: block; background: #FF6B35; color: white; text-align: center; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Detayları Görüntüle
          </a>

          <p style="margin: 20px 0 0 0; font-size: 13px; color: #9E9EA8; text-align: center;">
            Sorunuz devam ediyorsa aynı ticket üzerinden yanıt verebilirsiniz.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 16px 24px; background: #FAFAFD; border-top: 1px solid #E8E4DC; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #9E9EA8;">
            OmniX Engine - E-Ticaret İçerik Motoru
          </p>
        </div>

      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: data.userEmail,
    subject: `[Yanıtlandı] ${data.subject} - OmniX Engine Destek`,
    html,
  })
}
