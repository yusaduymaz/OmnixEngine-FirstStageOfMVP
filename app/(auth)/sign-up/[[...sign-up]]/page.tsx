import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import type { Metadata } from 'next'
import AuthRedirect from '@/components/auth/AuthRedirect'

export const metadata: Metadata = {
  title: 'Kayıt Ol — ContentForge TR',
  description: 'ContentForge TR\'ye ücretsiz kayıt olun. 50 üretim kredisiyle hemen başlayın.',
}

const BENEFITS = [
  {
    icon: (
      <svg className="w-5 h-5 text-[#FF6B35]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: '8 Saniyede İçerik',
    desc: 'Ürün bilgilerini gir, AI platforma özel başlık ve açıklamayı anında üretsin.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#FF6B35]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Platform Kurallarına Uygun',
    desc: 'Trendyol 100 karakter limiti, Hepsiburada formatı — hepsi otomatik uygulanır.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#FF6B35]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: '50 Üretim Tamamen Ücretsiz',
    desc: 'Kredi kartı gerekmez. Kayıt ol, 50 ücretsiz üretimle sistemi dene.',
  },
]

export default function RegisterPage() {

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Giriş yapmış kullanıcıyı otomatik dashboard'a yönlendir */}
      <AuthRedirect />

      {/* ── SOL: Koyu Marketing Paneli ─────────────────────────────────── */}
      <section className="hidden md:flex w-1/2 relative bg-[#1A1A2E] overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(26,26,46,0.97) 0%, rgba(26,26,46,0.80) 60%, rgba(255,107,53,0.12) 100%)' }} />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FF6B35 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-lg">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF6B35]/15 text-[#FF6B35] text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
              50 Kredi Ücretsiz
            </span>
            <h2 className="text-5xl font-extrabold text-white leading-tight tracking-tight mt-4"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Bugün Başla, <br />
              <span className="text-[#FF6B35]">Yarın Fark Gör</span>
            </h2>
          </div>

          <ul className="space-y-6">
            {BENEFITS.map((b, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {b.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base mb-0.5"
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {b.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            {['Kredi Kartı Gerekmez', 'İstediğin Zaman İptal', 'KVKK Uyumlu'].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">
                <svg className="w-3 h-3 text-[#FF6B35]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Sosyal kanıt */}
        <div className="absolute bottom-10 left-12 flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {['FF6B35', 'E8E4DC', '22C55E', 'F59E0B'].map((c, i) => (
              <div key={i}
                className="w-9 h-9 rounded-full border-2 border-[#1A1A2E] flex items-center justify-center text-white text-xs font-bold"
                style={{ background: `#${c}` }}>
                {['M', 'A', 'S', 'K'][i]}
              </div>
            ))}
          </div>
          <p className="text-xs font-medium text-white/50">
            500+ satıcı bu ay <br /> ContentForge TR kullandı
          </p>
        </div>
      </section>

      {/* ── SAĞ: Clerk SignUp ───────────────────────────────────────────── */}
      <section className="w-full md:w-1/2 flex items-center justify-center min-h-screen p-6 bg-[#F8F7F4]">
        <div className="flex w-full items-center justify-center">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/app"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-[#FF6B35] hover:bg-[#e55a2b] text-sm normal-case',
                card: 'shadow-none border border-[#E8E4DC] bg-[#F8F7F4]',
                headerTitle: 'font-heading text-[#1A1A2E]',
                headerSubtitle: 'text-[#6B6B7B]',
              },
            }}
          />
        </div>
      </section>

      {/* Sabit logo — yalnızca desktop */}
      <div className="fixed top-7 left-8 z-50 hidden md:flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FF6B35] flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs">CF</span>
          </div>
          <span className="text-base font-bold text-white"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            ContentForge TR
          </span>
        </Link>
      </div>
    </main>
  )
}
