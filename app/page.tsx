import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ContentForge TR — Trendyol & Hepsiburada için AI İçerik Üreteci',
  description:
    'Yapay zeka ile Trendyol ve Hepsiburada için saniyeler içinde SEO uyumlu, satış odaklı ürün başlığı ve açıklaması üretin. 50 üretim kredisi ücretsiz.',
}

// ─── Alt Komponentler ────────────────────────────────────────────────────────

function NavBar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/75 backdrop-blur-xl border-b border-[#E8E4DC]/60 shadow-[0_4px_24px_rgba(26,26,46,0.06)]">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-8 py-4">
        {/* Logo */}
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
            ContentForge TR
          </span>
        </Link>

        {/* Menü */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          <a href="#ozellikler" className="text-[#FF6B35] border-b-2 border-[#FF6B35] pb-0.5">Platform</a>
          <a href="#nasil-calisir" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Nasıl Çalışır?</a>
          <a href="#entegrasyon" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Entegrasyonlar</a>
          <a href="#fiyat" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Fiyatlandırma</a>
        </div>

        {/* CTA'lar */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-[#6B6B7B] font-semibold text-sm px-4 py-2 hover:text-[#1A1A2E] transition-colors"
          >
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="bg-[#FF6B35] hover:bg-[#e85d2a] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all"
          >
            Ücretsiz Başla
          </Link>
        </div>
      </div>
    </nav>
  )
}

function HeroSection() {
  return (
    <header id="hero" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-[#F8F7F4]">
      {/* Arkaplan blob'ları */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"
        style={{ background: 'radial-gradient(circle, #FF6B35 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"
        style={{ background: 'radial-gradient(circle, #1A1A2E 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Sol — metin */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
              Yeni Nesil AI E-Ticaret Aracı
            </div>

            <h1
              className="text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tighter leading-[1.05] text-[#1A1A2E]"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Trendyol &amp;{' '}
              <span className="text-[#FF6B35]">Hepsiburada</span>{' '}
              için AI ile İçerik Üret
            </h1>

            <p className="text-lg md:text-xl text-[#6B6B7B] max-w-xl leading-relaxed">
              Platform kurallarına uygun, SEO&apos;ya göre optimize edilmiş ürün başlığı, açıklama ve
              reklam metinlerini <strong className="text-[#1A1A2E]">8 saniyede</strong> oluşturun.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#FF6B35] hover:bg-[#e85d2a] text-white px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-[#FF6B35]/25 hover:shadow-xl hover:shadow-[#FF6B35]/30 transition-all"
              >
                Hemen Başla — Ücretsiz
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href="#nasil-calisir"
                className="inline-flex items-center gap-2 bg-white text-[#1A1A2E] border border-[#E8E4DC] px-8 py-4 rounded-xl font-bold text-base hover:border-[#FF6B35]/40 hover:bg-[#F8F7F4] transition-all"
              >
                Nasıl Çalışır?
              </a>
            </div>

            {/* Sosyal kanıt */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {['FF6B35', '1A1A2E', '22C55E', 'F59E0B'].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: `#${c}` }}
                  >
                    {['M', 'A', 'S', 'K'][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#6B6B7B]">
                <strong className="text-[#1A1A2E]">500+</strong> satıcı bu ay kullandı
              </p>
            </div>
          </div>

          {/* Sağ — dashboard kartı */}
          <div className="relative">
            <div className="absolute -top-8 -right-8 w-56 h-56 bg-[#FF6B35]/8 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-[#1A1A2E]/5 rounded-full blur-3xl" />

            {/* Ana kart */}
            <div className="relative bg-white rounded-3xl border border-[#E8E4DC] shadow-2xl p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <div className="text-xs text-[#9E9EA8] font-mono bg-[#F8F7F4] px-3 py-1 rounded-full">
                  AI üretiyor...
                </div>
              </div>

              {/* Ürün bilgisi */}
              <div className="bg-[#F8F7F4] rounded-xl p-4">
                <p className="text-xs text-[#9E9EA8] mb-1">Ürün</p>
                <p className="text-sm font-semibold text-[#1A1A2E]">Hakiki Deri Kadın Omuz Çantası</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF6B35] text-white font-medium">Trendyol</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A2E] text-white font-medium">Hepsiburada</span>
                </div>
              </div>

              {/* AI çıktısı */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#6B6B7B]">Üretilen Başlık</p>
                <div className="bg-[#FF6B35]/5 border border-[#FF6B35]/20 rounded-xl p-3">
                  <p className="text-sm text-[#1A1A2E] font-medium leading-snug">
                    Hakiki deri kadın omuz çantası kahverengi fermuarlı çok bölmeli
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-green-600 font-semibold">✓ 68 karakter — limit uyumlu</span>
                    <button className="text-[10px] text-[#FF6B35] font-medium">Kopyala</button>
                  </div>
                </div>
              </div>

              {/* SEO Skoru */}
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">92</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-green-700">Güçlü SEO Skoru</p>
                    <p className="text-[10px] text-green-600">8 anahtar kelime kullanıldı</p>
                  </div>
                </div>
                <div className="w-20 h-2 bg-white rounded-full overflow-hidden">
                  <div className="h-full w-[92%] bg-green-500 rounded-full" />
                </div>
              </div>

              {/* Zaman */}
              <p className="text-center text-[11px] text-[#9E9EA8]">⚡ 4.2 saniyede üretildi</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      iconBg: 'bg-orange-50',
      title: 'Akıllı Başlık Üretimi',
      desc: 'Trendyol ve Hepsiburada\'nın karakter limitlerine ve arama algoritmalarına özel, tıklama odaklı ürün başlıkları. Platform kuralları otomatik uygulanır.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      iconBg: 'bg-blue-50',
      title: 'SEO Uyumlu Açıklamalar',
      desc: 'Türkçe arama davranışına göre optimize, anahtar kelimeleri doğal yerleştiren, hem Türk tüketiciye hem platfom robotuna hitap eden içerikler.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      iconBg: 'bg-purple-50',
      title: 'Meta & Google Reklam Metni',
      desc: 'Sosyal medya reklamlarınız için yüksek dönüşüm sağlayan, yaratıcı ve dikkat çekici kreatif metin alternatifleri. 40 + 125 karakter formatı hazır.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      iconBg: 'bg-green-50',
      title: 'Anlık SEO Skoru',
      desc: '0–100 arası animasyonlu skor, kullanılan anahtar kelimeler ve karakter sayacı. Her üretimde ne kadar güçlü olduğunu görün.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      iconBg: 'bg-amber-50',
      title: '4 Farklı Yazı Tonu',
      desc: 'Profesyonel, samimi, lüks veya kampanya tonu. Her ürün ve marka kimliği için uygun ses tonu ile içerik üretin.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#1A1A2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      iconBg: 'bg-slate-50',
      title: 'İçerik Kütüphanesi',
      desc: 'Tüm üretimleriniz kaydedilir. Geçmiş içerikleri filtreleyip, kopyalayıp yeniden kullanın. Üretim geçmişiniz her zaman elinizin altında.',
    },
  ]

  return (
    <section id="ozellikler" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-widest mb-3">Platform Özellikleri</p>
          <h2
            className="text-4xl font-bold text-[#1A1A2E] tracking-tight mb-4"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Akıllı İçerik Üretim Motoru
          </h2>
          <p className="text-[#6B6B7B] text-lg leading-relaxed">
            Her kanal için özelleştirilmiş, algoritmalara uyumlu ve ikna edici Türkçe metinler.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group bg-[#F8F7F4] hover:bg-white border border-transparent hover:border-[#E8E4DC] rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3
                className="text-lg font-bold text-[#1A1A2E] mb-2"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                {f.title}
              </h3>
              <p className="text-sm text-[#6B6B7B] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      n: '1',
      title: 'Ürün Bilgisini Gir',
      desc: 'Ürün adı, kategori ve platform seçin. Ekstra anahtar kelimeler ekleyebilirsiniz.',
    },
    {
      n: '2',
      title: 'AI Analizi Başlat',
      desc: 'ContentForge TR, platform kurallarını ve SEO mantığını uygulayarak içeriği saniyeler içinde üretir.',
    },
    {
      n: '3',
      title: 'Kopyala ve Yayınla',
      desc: 'Hazır metinleri tek tıkla kopyalayıp Trendyol veya Hepsiburada panelinize yapıştırın.',
    },
  ]

  return (
    <section id="nasil-calisir" className="py-24 bg-[#F8F7F4]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Sol — adımlar */}
          <div className="lg:w-1/2 space-y-10">
            <div>
              <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-widest mb-3">Kullanım Akışı</p>
              <h2
                className="text-4xl font-bold text-[#1A1A2E] tracking-tight mb-4"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Sadece 3 Adımda Satışlarınızı Artırın
              </h2>
              <p className="text-[#6B6B7B] text-lg">Karmaşık süreçleri yapay zekanın gücüyle basitleştirdik.</p>
            </div>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-5">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-[#FF6B35] text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-[#FF6B35]/30">
                    {step.n}
                  </div>
                  <div>
                    <h4
                      className="text-lg font-bold text-[#1A1A2E] mb-1"
                      style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      {step.title}
                    </h4>
                    <p className="text-[#6B6B7B] text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-[#FF6B35] font-bold text-sm hover:gap-3 transition-all"
            >
              Hemen deneyin — ücretsiz
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Sağ — görsel kart */}
          <div className="lg:w-1/2 relative">
            <div className="bg-white rounded-3xl border border-[#E8E4DC] shadow-xl p-8 space-y-5">
              {/* Adım göstergesi */}
              <div className="flex gap-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`h-1.5 flex-1 rounded-full ${n === 2 ? 'bg-[#FF6B35]' : 'bg-[#E8E4DC]'}`}
                  />
                ))}
              </div>

              {/* Form önizlemesi */}
              <div className="space-y-3">
                <div className="bg-[#F8F7F4] rounded-xl p-3.5">
                  <p className="text-xs text-[#9E9EA8] mb-1">Ürün Adı</p>
                  <p className="text-sm font-medium text-[#1A1A2E]">Pamuklu Oversize Erkek Tişört</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#F8F7F4] rounded-xl p-3.5">
                    <p className="text-xs text-[#9E9EA8] mb-1">Kategori</p>
                    <p className="text-sm font-medium text-[#1A1A2E]">Erkek Giyim</p>
                  </div>
                  <div className="flex-1 bg-[#FF6B35]/5 border border-[#FF6B35]/20 rounded-xl p-3.5">
                    <p className="text-xs text-[#FF6B35] mb-1">Platform</p>
                    <p className="text-sm font-medium text-[#FF6B35]">Trendyol ✓</p>
                  </div>
                </div>
              </div>

              {/* Üret butonu */}
              <div className="bg-[#FF6B35] text-white rounded-xl py-3 text-center text-sm font-bold flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                İçerik Üretiliyor...
              </div>

              {/* Süre badge */}
              <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl py-2.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-bold text-green-700">10x Daha Hızlı</span>
                <span className="text-xs text-green-600">elle yazmaktan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MarketplaceSection() {
  const platforms = ['trendyol', 'hepsiburada', 'amazon', 'shopify']

  return (
    <section id="entegrasyon" className="py-20 bg-white border-y border-[#E8E4DC]">
      <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
        <p className="text-xs font-bold text-[#9E9EA8] uppercase tracking-[0.2em] mb-10">
          Tam Entegre Ekosistem
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
          {platforms.map((p) => (
            <div
              key={p}
              className="text-2xl md:text-3xl font-black text-[#9E9EA8] tracking-tighter opacity-50 hover:opacity-100 hover:text-[#1A1A2E] transition-all duration-300 cursor-default"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  const plans = [
    {
      name: 'Ücretsiz Deneme',
      price: '₺0',
      period: 'tek seferlik',
      credits: '50 üretim',
      features: ['Tekil içerik üretimi', '1 platform', 'SEO skoru', 'İçerik kütüphanesi'],
      cta: 'Hemen Başla',
      href: '/register',
      highlight: false,
    },
    {
      name: 'Starter',
      price: '₺299',
      period: '/ ay',
      credits: '500 kredi / ay',
      features: ['2 platform (TY + HB)', 'İçerik kütüphanesi', 'Ekstra anahtar kelime', 'E-posta desteği'],
      cta: 'Starter\'a Başla',
      href: '/register',
      highlight: true,
    },
    {
      name: 'Growth',
      price: '₺799',
      period: '/ ay',
      credits: '2.000 kredi / ay',
      features: ['Toplu yükleme (CSV)', 'API erişimi', 'Öncelikli destek', 'Tüm Starter özellikleri'],
      cta: 'Growth\'a Geç',
      href: '/register',
      highlight: false,
    },
  ]

  return (
    <section id="fiyat" className="py-24 bg-[#F8F7F4]">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-widest mb-3">Fiyatlandırma</p>
          <h2
            className="text-4xl font-bold text-[#1A1A2E] tracking-tight mb-4"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Sadece İhtiyacınız Kadar Ödeyin
          </h2>
          <p className="text-[#6B6B7B] text-lg">Kredi kartı gerekmez. İstediğiniz zaman iptal edin.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-6 border transition-all ${
                plan.highlight
                  ? 'bg-[#1A1A2E] border-[#1A1A2E] shadow-xl shadow-[#1A1A2E]/20'
                  : 'bg-white border-[#E8E4DC] hover:shadow-md'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#FF6B35] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    En Popüler
                  </span>
                </div>
              )}

              <div className="mb-5">
                <p className={`text-sm font-semibold mb-2 ${plan.highlight ? 'text-white/70' : 'text-[#6B6B7B]'}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-[#1A1A2E]'}`}
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? 'text-white/50' : 'text-[#9E9EA8]'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm mt-1 font-medium ${plan.highlight ? 'text-[#FF6B35]' : 'text-[#FF6B35]'}`}>
                  {plan.credits}
                </p>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <svg
                      className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-[#FF6B35]' : 'text-green-500'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={`text-sm ${plan.highlight ? 'text-white/80' : 'text-[#6B6B7B]'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full py-3 rounded-xl text-center text-sm font-bold transition-all ${
                  plan.highlight
                    ? 'bg-[#FF6B35] text-white hover:bg-[#e85d2a] shadow-sm'
                    : 'border border-[#E8E4DC] text-[#1A1A2E] hover:border-[#FF6B35] hover:text-[#FF6B35]'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-24 px-6 md:px-8">
      <div
        className="max-w-6xl mx-auto rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #c44d1a 100%)' }}
      >
        {/* Dekor */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
          <h2
            className="text-4xl md:text-6xl font-extrabold text-white tracking-tighter leading-tight"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Satışlarınızı Katlamaya Hazır Mısınız?
          </h2>
          <p className="text-orange-100 text-xl font-medium leading-relaxed">
            Yüzlerce Türk e-ticaret satıcısı ContentForge TR ile zaman kazanıyor ve dönüşüm
            oranlarını artırıyor. Bugün aramıza katılın.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="bg-white text-[#FF6B35] px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Ücretsiz Kayıt Ol — 50 Kredi
            </Link>
            <Link
              href="/login"
              className="bg-transparent border-2 border-white/40 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              Giriş Yap
            </Link>
          </div>
          <p className="text-orange-200/80 text-sm">
            Kredi kartı gerekmez • 50 üretim ücretsiz • İstediğiniz zaman iptal
          </p>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const cols = [
    {
      title: 'Ürün',
      links: ['Özellikler', 'Entegrasyonlar', 'Fiyatlandırma', 'Yeni Gelenler'],
    },
    {
      title: 'Şirket',
      links: ['Hakkımızda', 'Kariyer', 'Blog', 'İletişim'],
    },
    {
      title: 'Yasal',
      links: ['Gizlilik Politikası', 'Kullanım Koşulları', 'KVKK', 'Güvenlik'],
    },
  ]

  return (
    <footer className="bg-white border-t border-[#E8E4DC] py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-2 md:grid-cols-5 gap-10">
        {/* Marka */}
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[#FF6B35] flex items-center justify-center">
              <span className="text-white font-bold text-xs">CF</span>
            </div>
            <span
              className="text-lg font-bold text-[#1A1A2E]"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              ContentForge TR
            </span>
          </div>
          <p className="text-[#6B6B7B] text-sm leading-relaxed max-w-xs mb-6">
            Türk e-ticaret satıcıları için yapay zeka destekli, platform kurallarına uyumlu SEO içerik üreteci.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#9E9EA8]">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Sistem Durumu: Normal
          </div>
        </div>

        {/* Nav kolonları */}
        {cols.map((col) => (
          <div key={col.title} className="space-y-4">
            <p className="font-bold text-[#1A1A2E] text-sm">{col.title}</p>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-[#6B6B7B] hover:text-[#FF6B35] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 mt-12 pt-8 border-t border-[#E8E4DC] flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-[#9E9EA8]">© 2025 ContentForge TR. Tüm hakları saklıdır.</p>
        <p className="text-xs text-[#9E9EA8]">Türkiye&apos;nin e-ticaret satıcıları için yapıldı 🇹🇷</p>
      </div>
    </footer>
  )
}

// ─── Ana Sayfa ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MarketplaceSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </>
  )
}
