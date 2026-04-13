import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hakkımızda — OmniX Engine',
  description:
    'OmniX Engine, global pazaryerleri ve e-ticaret altyapıları için çok kanallı AI içerik, analiz ve görsel motoru. Vizyonumuzu, misyonumuzu ve ekibimizi tanıyın.',
}

// ─── Navbar (Tüm marketing sayfaları için tutarlı) ──────────────────────────

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
          <span
            className="text-xl font-bold text-[#1A1A2E] tracking-tight"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            OmniX Engine
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          <Link href="/" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Anasayfa</Link>
          <Link href="/hakkimizda" className="text-[#FF6B35] border-b-2 border-[#FF6B35] pb-0.5">Hakkımızda</Link>
          <Link href="/hizmetlerimiz" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Hizmetlerimiz</Link>
          <Link href="/entegrasyonlar" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Entegrasyonlar</Link>
          <Link href="/iletisim" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">İletişim</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-[#6B6B7B] font-semibold text-sm px-4 py-2 hover:text-[#1A1A2E] transition-colors">
            Giriş Yap
          </Link>
          <Link href="/register" className="bg-[#FF6B35] hover:bg-[#e85d2a] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all">
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

// ─── Ana Sayfa ──────────────────────────────────────────────────────────────

export default function HakkimizdaPage() {
  const personas = [
    {
      emoji: '🛍️',
      title: 'Hızlı Murat — Küçük Ölçekli Satıcı',
      desc: '3–50 ürünlük kataloğuyla Trendyol ve Hepsiburada\'da satış yapan, iyi başlık yazmak için saatler harcayan satıcılar için.',
      color: 'bg-orange-50 border-orange-200',
    },
    {
      emoji: '🌍',
      title: 'Global Ayşe — Cross-Platform Girişimci',
      desc: 'Shopify tabanlı D2C markası olup aynı zamanda Etsy ve Amazon EU\'da da satan, her platform için farklı format isteyen girişimciler için.',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      emoji: '🏢',
      title: 'Kurumsal Kerem — Ajans & Marka',
      desc: '1000+ SKU\'lu markalar veya 10–200 satıcıya hizmet veren e-ticaret ajansları; API erişimi, toplu analiz ve workspace ihtiyacı olanlar için.',
      color: 'bg-purple-50 border-purple-200',
    },
  ]

  const values = [
    { icon: '⚡', title: 'Hız', desc: 'Ürün bilgisinden içeriğe 8 saniyede. Elle yazmanın 10 katı hızlı.' },
    { icon: '🎯', title: 'Hassasiyet', desc: 'Her platformun algoritma kurallarına, karakter limitine ve SEO gereksinimlerine tam uyumlu çıktı.' },
    { icon: '🔒', title: 'Güvenlik', desc: 'Veriniz bizde güvende. KVKK uyumlu, RLS izolasyonlu, prompt injection korumalı altyapı.' },
    { icon: '🌐', title: 'Evrensellik', desc: '30+ platform desteği: Türkiye, Avrupa, ABD, global. Tek motordan tüm kanallara.' },
  ]

  return (
    <>
      <NavBar />

      {/* Hero */}
      <header className="relative pt-32 pb-20 md:pt-44 md:pb-28 bg-[#F8F7F4] overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] opacity-15 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"
          style={{ background: 'radial-gradient(circle, #FF6B35 0%, transparent 70%)' }}
        />
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
            OmniX Engine Hakkında
          </div>
          <h1
            className="text-4xl md:text-6xl font-extrabold tracking-tighter text-[#1A1A2E] leading-tight"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            E-Ticarette <span className="text-[#FF6B35]">İçerik Devrimini</span> Başlatıyoruz
          </h1>
          <p className="text-lg md:text-xl text-[#6B6B7B] max-w-2xl mx-auto leading-relaxed">
            OmniX Engine, global pazaryerleri ve e-ticaret altyapıları için tasarlanmış çok kanallı bir AI içerik, analiz ve görsel motorudur.
          </p>
        </div>
      </header>

      {/* Problem → Çözüm */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Problem */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Problem
              </div>
              <h2
                className="text-2xl font-bold text-[#1A1A2E] tracking-tight"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                İçerik Üretimi Satıcıların Kabusu
              </h2>
              <p className="text-[#6B6B7B] leading-relaxed">
                300.000+ aktif marketplace satıcısı aynı ürünü farklı platformların kurallarına
                göre (Trendyol kısa başlık, Amazon bullet point, Shopify HTML blog) manuel uyarlıyor.
                Mevcut içerikleri analiz edemiyorlar, ürün görselleri amatör kalıyor.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Saatlerce elle yazım', 'Platform kuralları kabusu', 'Amatör görseller', 'SEO tahmin işi'].map((t) => (
                  <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-600 font-medium border border-red-100">{t}</span>
                ))}
              </div>
            </div>

            {/* Çözüm */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-green-600 text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Çözüm
              </div>
              <h2
                className="text-2xl font-bold text-[#1A1A2E] tracking-tight"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                OmniX Engine, 4 Modüllü Omnichannel Motor
              </h2>
              <p className="text-[#6B6B7B] leading-relaxed">
                Sıfırdan içerik üretin, var olan ürün linklerini anında dönüştürün,
                canlıdaki listelemelerinizin SEO denetimini yapın ve ham fotoğraflarınızı
                stüdyo kalitesine yükseltin — hepsi tek platformdan.
              </p>
              <div className="flex flex-wrap gap-2">
                {['✍️ İçerik Üreteci', '🔄 Dönüştürücü', '🔍 Analizör', '📸 Görsel Stüdyo'].map((t) => (
                  <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 font-medium border border-green-100">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kimler için */}
      <section className="py-20 bg-[#F8F7F4]">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-widest mb-3">Kullanıcı Profilleri</p>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#1A1A2E] tracking-tight"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Kimler İçin Tasarlandı?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {personas.map((p) => (
              <div key={p.title} className={`rounded-2xl p-6 border ${p.color} transition-all hover:shadow-md hover:-translate-y-0.5`}>
                <div className="text-4xl mb-4">{p.emoji}</div>
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  {p.title}
                </h3>
                <p className="text-sm text-[#6B6B7B] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Değerlerimiz */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-widest mb-3">Misyonumuz</p>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#1A1A2E] tracking-tight"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Neden OmniX Engine?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-[#F8F7F4] rounded-2xl p-6 hover:bg-white hover:shadow-md hover:border-[#E8E4DC] border border-transparent transition-all">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="text-base font-bold text-[#1A1A2E] mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{v.title}</h3>
                <p className="text-sm text-[#6B6B7B] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-8">
        <div
          className="max-w-4xl mx-auto rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #c44d1a 100%)' }}
        >
          <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2
              className="text-3xl md:text-5xl font-extrabold text-white tracking-tighter"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Hemen Başlayın
            </h2>
            <p className="text-orange-100 text-lg">
              50 ücretsiz kredi ile OmniX Engine&apos;i keşfedin. Kredi kartı gerekmez.
            </p>
            <Link
              href="/register"
              className="inline-block bg-white text-[#FF6B35] px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Ücretsiz Kayıt Ol
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
