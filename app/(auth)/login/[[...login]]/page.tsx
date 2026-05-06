import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import type { Metadata } from 'next'
import AuthRedirect from '@/components/auth/AuthRedirect'

export const metadata: Metadata = {
  title: 'Giriş Yap — Omnix Engine',
  description:
    'Omnix Engine hesabınıza giriş yapın. Trendyol ve Hepsiburada için SEO odaklı AI içerik üretmeye başlayın.',
}

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5 text-[#FF6B35]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    title: 'Akıllı Ürün Başlıkları',
    desc: 'Pazaryeri algoritmalarıyla uyumlu, yüksek dönüşüm sağlayan başlıklar üretin.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#FF6B35]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Zengin Ürün Açıklamaları',
    desc: 'Müşterilerinizi ikna edecek, SEO uyumlu ve profesyonel içerikler oluşturun.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#FF6B35]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Gelişmiş SEO Analizi',
    desc: 'Rakiplerinizin önünde yer almak için anahtar kelime optimizasyonu yapın.',
  },
]

export default function LoginPage() {

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Giriş yapmış kullanıcıyı otomatik dashboard'a yönlendir */}
      <AuthRedirect />

      {/* ── SOL: Koyu Marketing Paneli ─────────────────────────────────── */}
      <section className="hidden md:flex w-1/2 relative bg-[#1A1A2E] overflow-hidden items-center justify-center p-12">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(26,26,46,0.97) 0%, rgba(26,26,46,0.80) 60%, rgba(255,107,53,0.15) 100%)' }}
        />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FF6B35 0%, transparent 70%)' }} />
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FF6B35 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-lg">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF6B35]/15 text-[#FF6B35] text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
              AI Destekli Satış
            </span>
            <h2
              className="text-5xl font-extrabold text-white leading-tight tracking-tight mt-4"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Yapay Zeka ile <br />
              <span className="text-[#FF6B35]">Satışlarınızı Katlayın</span>
            </h2>
          </div>

          <ul className="space-y-6">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base mb-0.5"
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {f.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Sosyal kanıt */}
        <div className="absolute bottom-10 left-12 flex items-center gap-4">
          <div className="flex -space-x-2.5">
            {['FF6B35', 'E8E4DC', '22C55E', 'F59E0B'].map((c, i) => (
              <div key={i}
                className="w-9 h-9 rounded-full border-2 border-[#1A1A2E] flex items-center justify-center text-white text-xs font-bold"
                style={{ background: `#${c}` }}>
                {['M', 'A', 'S', 'K'][i]}
              </div>
            ))}
            <div className="w-9 h-9 rounded-full border-2 border-[#1A1A2E] bg-white/10 flex items-center justify-center text-white text-[10px] font-bold">
              +500
            </div>
          </div>
          <p className="text-xs font-medium text-white/50">
            500&apos;den fazla satıcı <br /> satışlarını artırdı
          </p>
        </div>
      </section>

      {/* ── SAĞ: Clerk SignIn ───────────────────────────────────────────── */}
      <section className="w-full md:w-1/2 flex items-center justify-center min-h-screen p-6 bg-[#F8F7F4]">
        <div className="flex w-full items-center justify-center">
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/register"
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
            Omnix Engine
          </span>
        </Link>
      </div>
    </main>
  )
}
