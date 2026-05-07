'use client'

import Link from 'next/link'
import { useState } from 'react'

// ─── Navbar ─────────────────────────────────────────────────────────────────

function NavBar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/75 backdrop-blur-xl border-b border-[#E8E4DC]/60 shadow-[0_4px_24px_rgba(26,26,46,0.06)]">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-8 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
              <path d="M8 1L10.5 6H14L11 9.5L12.5 15L8 12L3.5 15L5 9.5L2 6H5.5L8 1Z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            OmniX Engine
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          <Link href="/" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Anasayfa</Link>
          <Link href="/hakkimizda" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Hakkımızda</Link>
          <Link href="/hizmetlerimiz" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Hizmetlerimiz</Link>
          <Link href="/entegrasyonlar" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Entegrasyonlar</Link>
          <Link href="/iletisim" className="text-[#FF6B35] border-b-2 border-[#FF6B35] pb-0.5">İletişim</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="hidden sm:block text-[#6B6B7B] font-semibold text-sm px-4 py-2 hover:text-[#1A1A2E] transition-colors">
            Giriş Yap
          </Link>
          <Link href="/sign-up" className="bg-[#FF6B35] hover:bg-[#e85d2a] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all">
            Ücretsiz Başla
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Footer ─────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-white border-t border-[#E8E4DC] py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#FF6B35] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-white">
              <path d="M8 1L10.5 6H14L11 9.5L12.5 15L8 12L3.5 15L5 9.5L2 6H5.5L8 1Z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-sm font-bold text-[#1A1A2E]" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            OmniX Engine
          </span>
        </div>
        <p className="text-sm text-[#9E9EA8]">© 2026 OmniX Engine. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  )
}

// ─── İletişim Formu Bileşeni ────────────────────────────────────────────────

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Bir hata oluştu.')
      }

      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu.')
    }
  }

  const inputClass = 'w-full bg-[#F8F7F4] border border-[#E8E4DC] rounded-xl px-4 py-3 text-sm text-[#1A1A2E] placeholder-[#9E9EA8] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">
            Ad Soyad
          </label>
          <input
            id="contact-name"
            type="text"
            required
            placeholder="Adınız Soyadınız"
            className={inputClass}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">
            E-posta
          </label>
          <input
            id="contact-email"
            type="email"
            required
            placeholder="ornek@email.com"
            className={inputClass}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">
          Konu
        </label>
        <select
          id="contact-subject"
          required
          className={inputClass}
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        >
          <option value="">Konu seçin...</option>
          <option value="genel">Genel Bilgi</option>
          <option value="teknik">Teknik Destek</option>
          <option value="enterprise">Kurumsal Plan</option>
          <option value="ortaklik">İş Ortaklığı</option>
          <option value="geri-bildirim">Geri Bildirim</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">
          Mesajınız
        </label>
        <textarea
          id="contact-message"
          rows={5}
          required
          placeholder="Mesajınızı buraya yazın..."
          className={`${inputClass} resize-none`}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
      </div>

      {/* Durum mesajları */}
      {status === 'success' && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-[#FF6B35] hover:bg-[#e85d2a] text-white py-3.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Gönderiliyor...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Mesaj Gönder
          </>
        )}
      </button>
    </form>
  )
}

// ─── Ana Sayfa ──────────────────────────────────────────────────────────────

export default function IletisimPage() {
  const channels = [
    {
      icon: (
        <svg className="w-6 h-6 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'E-posta',
      desc: 'Genel sorular ve iş birlikleri için',
      value: 'destek@omnixengine.com',
      href: 'mailto:destek@omnixengine.com',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: 'Teknik Destek',
      desc: 'Mevcut müşteriler için',
      value: 'teknik@omnixengine.com',
      href: 'mailto:teknik@omnixengine.com',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      title: 'Canlı Destek',
      desc: 'Hafta içi 09:00 – 18:00',
      value: 'Yakında...',
      href: '#',
    },
  ]

  return (
    <>
      <NavBar />

      {/* Hero */}
      <header className="relative pt-32 pb-12 md:pt-44 md:pb-20 bg-[#F8F7F4] overflow-hidden">
        <div
          className="absolute top-0 left-0 w-[400px] h-[400px] opacity-10 rounded-full blur-3xl -translate-y-1/3 -translate-x-1/3"
          style={{ background: 'radial-gradient(circle, #FF6B35 0%, transparent 70%)' }}
        />
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
            İletişim
          </div>
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#1A1A2E] leading-tight"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Sizinle <span className="text-[#FF6B35]">İletişime</span> Geçelim
          </h1>
          <p className="text-lg text-[#6B6B7B] max-w-xl mx-auto">
            Sorularınız, önerileriniz veya iş birliği talepleriniz için bize ulaşın.
          </p>
        </div>
      </header>

      {/* Form + Kanallar */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Sol — Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm p-8">
                <h2
                  className="text-xl font-bold text-[#1A1A2E] mb-1"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  Bize Mesaj Gönderin
                </h2>
                <p className="text-sm text-[#6B6B7B] mb-6">
                  En kısa sürede size dönüş yapacağız.
                </p>
                <ContactForm />
              </div>
            </div>

            {/* Sağ — Kanallar */}
            <div className="lg:col-span-2 space-y-5">
              <h2
                className="text-xl font-bold text-[#1A1A2E] mb-1"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Diğer Kanallar
              </h2>
              <p className="text-sm text-[#6B6B7B] mb-4">
                İhtiyacınıza en uygun kanaldan bize ulaşın.
              </p>

              {channels.map((ch) => (
                <a
                  key={ch.title}
                  href={ch.href}
                  className="block bg-[#F8F7F4] hover:bg-white rounded-2xl border border-transparent hover:border-[#E8E4DC] p-5 transition-all hover:shadow-md group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#E8E4DC] flex items-center justify-center group-hover:shadow-sm transition-all">
                      {ch.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A1A2E]" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        {ch.title}
                      </h3>
                      <p className="text-xs text-[#9E9EA8] mb-1">{ch.desc}</p>
                      <p className="text-sm font-semibold text-[#FF6B35]">{ch.value}</p>
                    </div>
                  </div>
                </a>
              ))}

              {/* SSS kısa not */}
              <div className="bg-[#1A1A2E] rounded-2xl p-6 text-white mt-6">
                <h3 className="text-base font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  Sık Sorulan Sorular
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  OmniX Engine hakkında merak edilenler:
                </p>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6B35]">•</span>
                    Ücretsiz deneme süresi var mı? — Evet, 50 kredi ücretsiz.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6B35]">•</span>
                    Hangi platformlar destekleniyor? — 30+ platform (Trendyol, Amazon, Shopify, Etsy vb.)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF6B35]">•</span>
                    API erişimi var mı? — Growth ve üzeri planlarda mevcut.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
