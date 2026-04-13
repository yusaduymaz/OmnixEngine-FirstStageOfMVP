import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OmniX Engine — Global Pazaryerleri için AI İçerik Üreteci',
  description:
    'Global pazaryerleri ve e-ticaret altyapıları (Shopify, Amazon, Etsy) için çok kanallı AI motoru. Saniyeler içinde SEO uyumlu metinler yazın, stüdyo kalitesinde ürün görselleri üretin ve listelemelerinizi analiz edin.',
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
            OmniX Engine
          </span>
        </Link>

        {/* Menü */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          <Link href="/" className="text-[#FF6B35] border-b-2 border-[#FF6B35] pb-0.5">Anasayfa</Link>
          <Link href="/hakkimizda" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Hakkımızda</Link>
          <Link href="/hizmetlerimiz" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Hizmetlerimiz</Link>
          <Link href="/entegrasyonlar" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Entegrasyonlar</Link>
          <Link href="/iletisim" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">İletişim</Link>
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
              YENİ NESİL {' '}
              <span className="text-[#FF6B35]">OMNICHANNEL</span>
              <br />
              {' '}AI MOTORU
            </h1>

            <p className="text-lg md:text-xl text-[#6B6B7B] max-w-xl leading-relaxed">
              Shopify, Amazon, Etsy ve yerel pazaryerleri... Tek bir
              tıkla her platformun algoritmasına özel, yüksek dönüşümlü <strong className="text-[#1A1A2E]">ürün
                listelemeleri</strong> ve <strong className="text-[#1A1A2E]">görselleri</strong> oluşturun.
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
              <Link
                href="/hizmetlerimiz"
                className="inline-flex items-center gap-2 bg-white text-[#1A1A2E] border border-[#E8E4DC] px-8 py-4 rounded-xl font-bold text-base hover:border-[#FF6B35]/40 hover:bg-[#F8F7F4] transition-all"
              >
                Nasıl Çalışır?
              </Link>
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
      title: 'AI İçerik Üretici',
      desc: 'Sıfırdan platform uyumlu SEO içerik üretimi. 30+ platformun karakter limitleri, başlık kuralları ve algoritma gereksinimleri otomatik uygulanır.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      iconBg: 'bg-blue-50',
      title: 'İçerik Dönüştürücü',
      desc: 'Bir platformdaki ürün URL\'sini yapıştırın, hedef platform seçin. AI içeriği çekip hedef formata yeniden yazar. Orijinal ↔ dönüşmüş karşılaştırma anında.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      iconBg: 'bg-green-50',
      title: 'İçerik Analizörü',
      desc: 'Canlıdaki listelemenizin SEO denetimini yapın. 0–100 arası genel skor, 5 kriter bazlı rapor ve "AI ile Düzelt" butonuyla tek tıkla iyileştirme.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      iconBg: 'bg-purple-50',
      title: 'Görsel Stüdyo',
      desc: 'Ham ürün fotoğrafını yükleyin, AI arka planı kaldırsın. Beyaz/gradient stüdyo arka planı, gölge efektleri ve platform preset boyutları.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-emerald-50',
      title: 'Anlık SEO Skoru',
      desc: 'Her üretimde 0–100 arası animasyonlu SEO skoru. Kullanılan anahtar kelimeler, karakter sayacı ve platform uyumluluk değerlendirmesi.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-indigo-50',
      title: 'Omnichannel Destek',
      desc: 'Tek içerikten tüm platformlara. Trendyol başlığı + Amazon bullet points + Shopify meta — aynı anda, farklı formatlarda çıktı alın.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      iconBg: 'bg-slate-50',
      title: 'Güvenlik & KVKK',
      desc: 'Row-Level Security izolasyonu, prompt injection koruması ve KVKK uyumlu veri saklama. Verileriniz her zaman güvende.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      iconBg: 'bg-amber-50',
      title: 'Toplu İşlem & API',
      desc: 'CSV ile yüzlerce ürünü toplu yükleyin, REST API ile kendi sistemlerinize entegre edin. Growth ve üzeri planlarda kullanılabilir.',
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
            OmniX Engine ile Neler Yapabilirsiniz?
          </h2>
          <p className="text-[#6B6B7B] text-lg leading-relaxed">
            İçerik üretin, dönüştürün, analiz edin ve görsellerinizi profesyonel seviyeye taşıyın — tek bir platformtan, 30+ kanala.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="group bg-[#F8F7F4] hover:bg-white border border-transparent hover:border-[#E8E4DC] rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3
                className="text-base font-bold text-[#1A1A2E] mb-2"
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

function ImageStudioSection() {
  const steps = [
    {
      n: '1',
      title: 'Fotoğrafı Yükle',
      desc: 'Ham ürün görselinizi sürükle-bırak ile yükleyin. JPG, PNG, WebP formatları desteklenir.',
    },
    {
      n: '2',
      title: 'Stüdyo Ayarını Seç',
      desc: 'Beyaz arka plan, gölgelendirme veya gradient seçin. Platform presetleri (1080×1080, 1500×1500) hazır.',
    },
    {
      n: '3',
      title: 'AI İşlesin',
      desc: 'Arka plan kaldırma, ışık düzeltme ve profesyonel render otomatik uygulanır. Saniyeler içinde hazır.',
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Sol — adımlar */}
          <div className="lg:w-1/2 space-y-10">
            <div>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3">Görsel Stüdyo</p>
              <h2
                className="text-4xl font-bold text-[#1A1A2E] tracking-tight mb-4"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Ham Fotoğraftan Profesyonel Görsele
              </h2>
              <p className="text-[#6B6B7B] text-lg">
                AI destekli görsel stüdyo ile ürün fotoğraflarınızı stüdyo kalitesine yükseltin.
              </p>
            </div>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-5">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-purple-600/30">
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
              className="inline-flex items-center gap-2 text-purple-600 font-bold text-sm hover:gap-3 transition-all"
            >
              Görsel Stüdyo&apos;yu deneyin — ücretsiz
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Sağ — Before/After mockup kart */}
          <div className="lg:w-1/2 relative">
            <div className="absolute -top-8 -left-8 w-56 h-56 bg-purple-600/8 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -right-8 w-56 h-56 bg-[#FF6B35]/5 rounded-full blur-3xl" />

            <div className="relative bg-white rounded-3xl border border-[#E8E4DC] shadow-xl p-6 space-y-4">
              {/* Başlık */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <div className="text-xs text-purple-600 font-semibold bg-purple-50 px-3 py-1 rounded-full">
                  📸 Görsel Stüdyo
                </div>
              </div>

              {/* Before / After karşılaştırma */}
              <div className="grid grid-cols-2 gap-3">
                {/* Öncesi */}
                <div className="relative rounded-xl overflow-hidden border border-[#E8E4DC]">
                  <div className="aspect-square bg-gradient-to-br from-[#d4c8b8] via-[#c9bda9] to-[#b8a994] flex items-center justify-center relative">
                    {/* Dağınık arka plan simülasyonu */}
                    <div className="absolute top-3 left-3 w-8 h-5 bg-[#a89880]/40 rounded-sm rotate-12" />
                    <div className="absolute bottom-6 right-4 w-10 h-3 bg-[#a89880]/30 rounded-sm -rotate-6" />
                    <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-[#a89880]/20 rounded-full" />
                    {/* Ürün placeholder */}
                    <div className="w-24 h-28 bg-white/90 rounded-lg shadow-sm flex flex-col items-center justify-center">
                      <div className="w-14 h-16 bg-[#FF6B35]/15 rounded-md mb-1" />
                      <div className="w-10 h-1 bg-[#E8E4DC] rounded-full" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-red-500/90 text-white text-[10px] font-bold text-center py-1">
                    ÖNCESİ
                  </div>
                </div>

                {/* Sonrası */}
                <div className="relative rounded-xl overflow-hidden border border-purple-200">
                  <div className="aspect-square bg-white flex items-center justify-center relative">
                    {/* Temiz stüdyo arka plan */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white via-[#fafafa] to-[#f0f0f0]" />
                    {/* Ürün placeholder — gölgeli */}
                    <div className="relative w-24 h-28 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center border border-[#f0f0f0]">
                      <div className="w-14 h-16 bg-[#FF6B35]/20 rounded-md mb-1" />
                      <div className="w-10 h-1 bg-[#E8E4DC] rounded-full" />
                    </div>
                    {/* Yansıma efekti */}
                    <div className="absolute bottom-2 w-20 h-3 bg-black/5 rounded-full blur-sm" />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-green-500/90 text-white text-[10px] font-bold text-center py-1">
                    SONRASI
                  </div>
                </div>
              </div>

              {/* Slider göstergesi */}
              <div className="flex items-center justify-center gap-3">
                <div className="h-0.5 flex-1 bg-red-200 rounded-full" />
                <div className="w-8 h-8 rounded-full bg-[#1A1A2E] flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
                <div className="h-0.5 flex-1 bg-green-200 rounded-full" />
              </div>

              {/* İşlem badge'leri */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-semibold border border-green-200">
                  ✓ Arka Plan Kaldırıldı
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                  ✓ Stüdyo Işığı Eklendi
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  📐 1080×1080 px
                </span>
              </div>

              {/* Alt bilgi */}
              <p className="text-center text-[11px] text-[#9E9EA8]">⚡ 3.1 saniyede işlendi — fal.ai tarafından</p>
            </div>
          </div>
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
      desc: 'OmniX Engine, platform kurallarını ve SEO mantığını uygulayarak içeriği saniyeler içinde üretir.',
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
  const categories = [
    {
      flag: '🇹🇷',
      label: 'Yerli Pazaryerleri',
      platforms: ['Trendyol', 'Hepsiburada', 'N11', 'Çiçeksepeti'],
    },
    {
      flag: '🌍',
      label: 'Global Pazaryerleri',
      platforms: ['Amazon', 'Etsy', 'eBay', 'Allegro', 'Bol.com'],
    },
    {
      flag: '⚙️',
      label: 'E-ticaret Altyapıları',
      platforms: ['Shopify', 'WooCommerce', 'Magento', 'Wix'],
    },
  ]

  return (
    <section id="entegrasyon" className="py-24 bg-white border-y border-[#E8E4DC]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Sol — kategori listesi */}
          <div className="lg:w-1/2">
            <div className="mb-10">
              <p className="text-xs font-bold text-[#9E9EA8] uppercase tracking-[0.2em] mb-3">
                Tam Entegre Ekosistem
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold text-[#1A1A2E] tracking-tight mb-3"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                30+ Platform, Tek Motor
              </h2>
              <p className="text-[#6B6B7B] text-base">Yerelden globale, her platformun algoritma kuralları motorumuza gömülü.</p>
            </div>

            <div className="space-y-8">
              {categories.map((cat) => (
                <div key={cat.label}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{cat.flag}</span>
                    <p className="text-sm font-bold text-[#1A1A2E] uppercase tracking-widest">{cat.label}</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {cat.platforms.map((p) => (
                      <div
                        key={p}
                        className="bg-[#F8F7F4] hover:bg-white border border-[#E8E4DC] rounded-xl px-5 py-2.5 text-sm font-bold text-[#1A1A2E] hover:text-[#FF6B35] hover:border-[#FF6B35]/30 hover:shadow-sm transition-all duration-200 cursor-default"
                        style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/entegrasyonlar"
                className="inline-flex items-center gap-2 text-[#FF6B35] font-bold text-sm hover:gap-3 transition-all"
              >
                ve 20+ platform daha — tümünü gör
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Sağ — platform akışı mockup kartı */}
          <div className="lg:w-1/2 relative">
            <div className="absolute -top-8 -right-8 w-56 h-56 bg-[#FF6B35]/8 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-[#1A1A2E]/5 rounded-full blur-3xl" />

            <div className="relative bg-white rounded-3xl border border-[#E8E4DC] shadow-xl p-6 space-y-5">
              {/* Kart başlık */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <div className="text-xs text-[#9E9EA8] font-mono bg-[#F8F7F4] px-3 py-1 rounded-full">
                  🔄 İçerik Dönüşümü
                </div>
              </div>

              {/* Kaynak → Hedef akışı */}
              <div className="bg-[#F8F7F4] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  {/* Kaynak */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FF6B35] flex items-center justify-center text-white text-xs font-bold">TR</div>
                    <div>
                      <p className="text-[10px] text-[#9E9EA8]">Kaynak</p>
                      <p className="text-sm font-bold text-[#1A1A2E]">Trendyol</p>
                    </div>
                  </div>
                  {/* Ok */}
                  <div className="flex items-center gap-1.5 px-3">
                    <div className="w-6 h-[2px] bg-[#FF6B35] rounded-full" />
                    <svg className="w-4 h-4 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  {/* Hedef */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1A1A2E] flex items-center justify-center text-white text-xs font-bold">US</div>
                    <div>
                      <p className="text-[10px] text-[#9E9EA8]">Hedef</p>
                      <p className="text-sm font-bold text-[#1A1A2E]">Amazon US</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform grid — bağlı durumda */}
              <div>
                <p className="text-xs font-semibold text-[#6B6B7B] mb-3">Bağlı Platformlar</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: 'Trendyol', color: 'bg-[#FF6B35]', active: true },
                    { name: 'HB', color: 'bg-purple-600', active: true },
                    { name: 'Amazon', color: 'bg-[#1A1A2E]', active: true },
                    { name: 'Shopify', color: 'bg-green-600', active: true },
                    { name: 'Etsy', color: 'bg-amber-600', active: true },
                    { name: 'N11', color: 'bg-red-500', active: true },
                    { name: 'eBay', color: 'bg-blue-600', active: false },
                    { name: '+20', color: 'bg-[#E8E4DC]', active: false },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className={`rounded-lg py-2 text-center text-[10px] font-bold transition-all ${
                        p.active
                          ? `${p.color} text-white shadow-sm`
                          : 'bg-[#F8F7F4] text-[#9E9EA8] border border-dashed border-[#E8E4DC]'
                      }`}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Durum göstergeleri */}
              <div className="space-y-2.5">
                {[
                  { label: 'Başlık kuralları', status: 'Uyumlu', color: 'text-green-600 bg-green-50' },
                  { label: 'SEO gereksinimleri', status: 'Uyumlu', color: 'text-green-600 bg-green-50' },
                  { label: 'Karakter limiti', status: '67/80', color: 'text-blue-600 bg-blue-50' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-[#6B6B7B]">{item.label}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${item.color}`}>
                      ✓ {item.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Alt bilgi */}
              <div className="flex items-center justify-center gap-2 bg-[#FF6B35]/5 border border-[#FF6B35]/15 rounded-xl py-2.5">
                <svg className="w-4 h-4 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-bold text-[#FF6B35]">Tek içerik → tüm platformlara</span>
              </div>
            </div>
          </div>
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
              className={`relative rounded-2xl p-6 border transition-all ${plan.highlight
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
                className={`block w-full py-3 rounded-xl text-center text-sm font-bold transition-all ${plan.highlight
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
            Yüzlerce e-ticaret satıcısı OmniX Engine ile zaman kazanıyor ve dönüşüm
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
  const productLinks = [
    { label: 'Hizmetlerimiz', href: '/hizmetlerimiz' },
    { label: 'Entegrasyonlar', href: '/entegrasyonlar' },
    { label: 'Hakkımızda', href: '/hakkimizda' },
    { label: 'İletişim', href: '/iletisim' },
  ]

  const legalLinks = [
    { label: 'Gizlilik Politikası', href: '#' },
    { label: 'Kullanım Koşulları', href: '#' },
    { label: 'KVKK', href: '#' },
  ]

  return (
    <footer className="bg-white border-t border-[#E8E4DC] py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Marka */}
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[#FF6B35] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-white">
                <path d="M8 1L10.5 6H14L11 9.5L12.5 15L8 12L3.5 15L5 9.5L2 6H5.5L8 1Z" fill="currentColor" />
              </svg>
            </div>
            <span
              className="text-lg font-bold text-[#1A1A2E]"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              OmniX Engine
            </span>
          </div>
          <p className="text-[#6B6B7B] text-sm leading-relaxed max-w-xs mb-6">
            Global pazaryerleri ve e-ticaret altyapıları için çok kanallı AI içerik, analiz ve görsel motoru.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#9E9EA8]">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Sistem Durumu: Normal
          </div>
        </div>

        {/* Sayfa Linkleri */}
        <div className="space-y-4">
          <p className="font-bold text-[#1A1A2E] text-sm">Ürün</p>
          <ul className="space-y-3">
            {productLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-[#6B6B7B] hover:text-[#FF6B35] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Yasal */}
        <div className="space-y-4">
          <p className="font-bold text-[#1A1A2E] text-sm">Yasal</p>
          <ul className="space-y-3">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-sm text-[#6B6B7B] hover:text-[#FF6B35] transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 mt-12 pt-8 border-t border-[#E8E4DC] flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-[#9E9EA8]">© 2026 OmniX Engine. Tüm hakları saklıdır.</p>
        <p className="text-xs text-[#9E9EA8]">Global e-ticaret satıcıları için yapıldı 🌍</p>
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
      <ImageStudioSection />
      <HowItWorksSection />
      <MarketplaceSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </>
  )
}
