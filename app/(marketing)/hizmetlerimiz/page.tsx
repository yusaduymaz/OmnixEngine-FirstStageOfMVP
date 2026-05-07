import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hizmetlerimiz — OmniX Engine',
  description:
    'OmniX Engine\'in 4 temel modülünü keşfedin: İçerik Üreteci, İçerik Dönüştürücü, İçerik Analizörü ve Akıllı Görsel Stüdyosu. Global pazaryerleri için AI destekli çözümler.',
}

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
          <Link href="/hizmetlerimiz" className="text-[#FF6B35] border-b-2 border-[#FF6B35] pb-0.5">Hizmetlerimiz</Link>
          <Link href="/entegrasyonlar" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Entegrasyonlar</Link>
          <Link href="/iletisim" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">İletişim</Link>
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

// ─── Ana Sayfa ──────────────────────────────────────────────────────────────

export default function HizmetlerimizPage() {
  const modules = [
    {
      emoji: '✍️',
      title: 'İçerik Üreteci',
      subtitle: 'Sıfırdan SEO uyumlu içerik',
      color: 'border-orange-200 bg-orange-50/50',
      iconBg: 'bg-orange-100',
      steps: [
        { n: '1', text: 'Ürün adını, kategorisini ve hedef platform(lar)ını seçin.' },
        { n: '2', text: 'Yazı tonu ve ekstra anahtar kelimeleri belirleyin.' },
        { n: '3', text: 'AI, her platformun algoritma kurallarına özel SEO\'lu içerikler oluşturur.' },
        { n: '4', text: 'A/B test varyantları, reklam metni ve SEO skoru ile birlikte sonuçlara ulaşın.' },
      ],
      features: [
        'Her platform için 2+ başlık varyantı',
        'Uzun ve kısa açıklama',
        'Meta reklam metni (headline + body)',
        'Amazon bullet points (Amazon seçildiğinde)',
        'SEO skoru (0–100) ve yasal uyumluluk notu',
      ],
    },
    {
      emoji: '🔄',
      title: 'İçerik Dönüştürücü',
      subtitle: 'Var olan içeriği platforma taşı',
      color: 'border-blue-200 bg-blue-50/50',
      iconBg: 'bg-blue-100',
      steps: [
        { n: '1', text: 'Dönüştürmek istediğiniz ürün URL\'sini yapıştırın veya metin girin.' },
        { n: '2', text: 'Hedef platformu (Shopify → Amazon, Trendyol → Etsy vb.) seçin.' },
        { n: '3', text: 'Sistem kanyak içeriği otomatik çeker ve hedef formatına yeniden yazar.' },
        { n: '4', text: 'Orijinal ↔ dönüştürülmüş karşılaştırma ile sonuçları inceleyin.' },
      ],
      features: [
        'URL\'den otomatik platform algılama',
        'Orijinal ↔ dönüştürülmüş karşılaştırma',
        'Çoklu hedef platform desteği',
        'Kaynak ton korunabilir veya değiştirilebilir',
        'SEO skoru ve karakter limiti uyum kontrolü',
      ],
    },
    {
      emoji: '🔍',
      title: 'İçerik Analizörü',
      subtitle: 'Canlıdaki içeriğinin SEO denetimi',
      color: 'border-green-200 bg-green-50/50',
      iconBg: 'bg-green-100',
      steps: [
        { n: '1', text: 'Analiz etmek istediğiniz ürünün URL\'sini yapıştırın.' },
        { n: '2', text: 'Hangi platformun kurallarına göre analiz edileceğini seçin.' },
        { n: '3', text: 'AI, başlık kalitesi, açıklama derinliği, anahtar kelime yoğunluğu ve yasal uyumluluk kriterlerini denetler.' },
        { n: '4', text: 'Genel skor (0–100), kriter bazlı değerlendirme ve "AI ile düzelt" seçeneği alın.' },
      ],
      features: [
        'Genel SEO skoru (0–100)',
        '5 kriter bazlı detaylı puanlama',
        'Her kriter için iyileştirme önerisi',
        '"AI ile Düzelt" — tek tıkla yeniden yazma',
        'Yasal uyumluluk kontrolü (hayvansal menşei, sağlık iddiası vb.)',
      ],
    },
    {
      emoji: '📸',
      title: 'Akıllı Görsel Stüdyosu',
      subtitle: 'Ham fotoğraftan profesyonel görsele',
      color: 'border-purple-200 bg-purple-50/50',
      iconBg: 'bg-purple-100',
      steps: [
        { n: '1', text: 'Ham ürün fotoğrafınızı sürükle-bırak ile yükleyin.' },
        { n: '2', text: 'Arka plan, boyut ve efekt ayarlarını seçin (öne tanımlı presetler mevcut).' },
        { n: '3', text: 'AI arka planı temizler, stüdyo kalitesinde ışık ve gölge ekler.' },
        { n: '4', text: 'Öncesi / sonrası slider ile karşılaştırın, istediğiniz formatta indirin.' },
      ],
      features: [
        'AI ile arka plan kaldırma',
        'Beyaz, gri, gradient arka plan seçenekleri',
        'Platform presetleri (Trendyol 1080×1080, Amazon 1500×1500)',
        'Gölge, yansıma ve ışık düzeltme efektleri',
        'WebP / PNG / JPEG çıktı formatı',
      ],
    },
  ]

  const platforms = [
    { name: 'Trendyol', flag: '🇹🇷' },
    { name: 'Hepsiburada', flag: '🇹🇷' },
    { name: 'Amazon TR', flag: '🇹🇷' },
    { name: 'Amazon US', flag: '🇺🇸' },
    { name: 'Amazon UK', flag: '🇬🇧' },
    { name: 'Amazon DE', flag: '🇩🇪' },
    { name: 'Shopify', flag: '🌐' },
    { name: 'WooCommerce', flag: '🌐' },
    { name: 'Etsy', flag: '🌐' },
    { name: 'N11', flag: '🇹🇷' },
    { name: 'Çiçeksepeti', flag: '🇹🇷' },
    { name: 'eBay', flag: '🌐' },
  ]

  return (
    <>
      <NavBar />

      {/* Hero */}
      <header className="relative pt-32 pb-16 md:pt-44 md:pb-24 bg-[#F8F7F4] overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"
          style={{ background: 'radial-gradient(circle, #1A1A2E 0%, transparent 70%)' }}
        />
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
            4 Güçlü Modül
          </div>
          <h1
            className="text-4xl md:text-6xl font-extrabold tracking-tighter text-[#1A1A2E] leading-tight"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            E-Ticarette İhtiyacınız Olan <span className="text-[#FF6B35]">Her Şey</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B6B7B] max-w-2xl mx-auto leading-relaxed">
            İçerik üretin, dönüştürün, analiz edin ve ürün görsellerinizi profesyonel seviyeye taşıyın — hepsi tek bir platformda.
          </p>
        </div>
      </header>

      {/* 4 Modül Detay */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-8 space-y-20">
          {modules.map((mod) => (
            <div key={mod.title} className={`rounded-3xl border-2 ${mod.color} p-8 md:p-12`}>
              {/* Modül Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-14 h-14 rounded-2xl ${mod.iconBg} flex items-center justify-center text-3xl`}>
                  {mod.emoji}
                </div>
                <div>
                  <h2
                    className="text-2xl md:text-3xl font-bold text-[#1A1A2E] tracking-tight"
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {mod.title}
                  </h2>
                  <p className="text-[#6B6B7B] text-sm">{mod.subtitle}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                {/* Nasıl Çalışır */}
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-widest mb-5">Nasıl Çalışır?</h3>
                  <div className="space-y-4">
                    {mod.steps.map((step) => (
                      <div key={step.n} className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-[#FF6B35] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          {step.n}
                        </div>
                        <p className="text-sm text-[#6B6B7B] leading-relaxed pt-1">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Özellikler */}
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-widest mb-5">Öne Çıkan Özellikler</h3>
                  <ul className="space-y-3">
                    {mod.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-[#6B6B7B]">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Desteklenen Platformlar */}
      <section className="py-20 bg-[#F8F7F4]">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-widest mb-3">Platform Desteği</p>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#1A1A2E] tracking-tight"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              30+ Platformla Uyumlu
            </h2>
            <p className="text-[#6B6B7B] text-lg mt-3">
              Yerel pazaryerlerinden global altyapılara, her platformun algoritma kuralları motorumuza gömülü.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {platforms.map((p) => (
              <div
                key={p.name}
                className="bg-white rounded-xl border border-[#E8E4DC] p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="text-2xl mb-1">{p.flag}</div>
                <p className="text-sm font-semibold text-[#1A1A2E]">{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-8">
        <div
          className="max-w-4xl mx-auto rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #2d2d4e 100%)' }}
        >
          <div className="absolute top-0 right-0 w-60 h-60 bg-[#FF6B35]/15 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2
              className="text-3xl md:text-5xl font-extrabold text-white tracking-tighter"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Hizmetlerimizi Deneyin
            </h2>
            <p className="text-slate-300 text-lg">
              50 ücretsiz kredi ile 4 modülü keşfedin. Kurulum yok, kredi kartı yok.
            </p>
            <Link
              href="/sign-up"
              className="inline-block bg-[#FF6B35] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#e85d2a] hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Ücretsiz Başla — 50 Kredi
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
