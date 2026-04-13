import { NextResponse } from 'next/server'
import { z } from 'zod'

// ─── Zod Validasyon Şeması ──────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalı.').max(100),
  email: z.string().email('Geçerli bir e-posta adresi girin.'),
  subject: z.enum(['genel', 'teknik', 'enterprise', 'ortaklik', 'geri-bildirim'], {
    errorMap: () => ({ message: 'Lütfen bir konu seçin.' }),
  }),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalı.').max(5000),
})

// ─── Konu Etiketleri ────────────────────────────────────────────────────────

const SUBJECT_LABELS: Record<string, string> = {
  genel: 'Genel Bilgi',
  teknik: 'Teknik Destek',
  enterprise: 'Kurumsal Plan',
  ortaklik: 'İş Ortaklığı',
  'geri-bildirim': 'Geri Bildirim',
}

// ─── POST Handler ───────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Zod validasyon
    const result = contactSchema.safeParse(body)
    if (!result.success) {
      const firstError = result.error.errors[0]?.message || 'Geçersiz form verisi.'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { name, email, subject, message } = result.data
    const subjectLabel = SUBJECT_LABELS[subject] || subject

    // Resend ile e-posta gönderimi
    // Resend API key kontrol
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      // Resend yapılandırılmamışsa, sadece logla ve başarılı dön
      // (geliştirme ortamında normal davranış)
      console.log('─── İletişim Formu Gönderimi ───')
      console.log(`Ad: ${name}`)
      console.log(`E-posta: ${email}`)
      console.log(`Konu: ${subjectLabel}`)
      console.log(`Mesaj: ${message}`)
      console.log('────────────────────────────────')
      console.warn('⚠️ RESEND_API_KEY tanımlı değil. E-posta gönderilmedi, sadece loga yazıldı.')

      return NextResponse.json({
        success: true,
        message: 'Mesajınız alındı. En kısa sürede size dönüş yapacağız.',
      })
    }

    // Resend API çağrısı
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'OmniX Engine <noreply@omnixengine.com>',
        to: ['destek@omnixengine.com'],
        reply_to: email,
        subject: `[İletişim Formu] ${subjectLabel} — ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #FF6B35; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
              <h2 style="margin: 0; font-size: 18px;">OmniX Engine — Yeni İletişim Mesajı</h2>
            </div>
            <div style="background: #f8f7f4; padding: 24px; border: 1px solid #e8e4dc; border-top: none; border-radius: 0 0 12px 12px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6B6B7B; font-size: 14px; width: 100px;">Ad Soyad:</td>
                  <td style="padding: 8px 0; color: #1A1A2E; font-size: 14px; font-weight: bold;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B6B7B; font-size: 14px;">E-posta:</td>
                  <td style="padding: 8px 0; color: #1A1A2E; font-size: 14px;"><a href="mailto:${email}" style="color: #FF6B35;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B6B7B; font-size: 14px;">Konu:</td>
                  <td style="padding: 8px 0; color: #1A1A2E; font-size: 14px;">${subjectLabel}</td>
                </tr>
              </table>
              <hr style="border: none; border-top: 1px solid #e8e4dc; margin: 16px 0;" />
              <div style="color: #1A1A2E; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
            </div>
          </div>
        `,
      }),
    })

    if (!resendResponse.ok) {
      console.error('Resend API hatası:', await resendResponse.text())
      return NextResponse.json(
        { error: 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
    })
  } catch (error) {
    console.error('İletişim formu hatası:', error)
    return NextResponse.json(
      { error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
