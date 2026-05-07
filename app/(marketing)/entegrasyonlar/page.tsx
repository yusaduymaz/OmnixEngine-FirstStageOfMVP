import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Entegrasyonlar — OmniX Engine',
  description:
    'OmniX Engine, 30+ pazaryeri ve e-ticaret altyapısıyla uyumlu çalışır. Trendyol, Hepsiburada, Amazon, Shopify, Etsy ve çok daha fazlası.',
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
          <Link href="/hizmetlerimiz" className="text-[#6B6B7B] hover:text-[#1A1A2E] transition-colors">Hizmetlerimiz</Link>
          <Link href="/entegrasyonlar" className="text-[#FF6B35] border-b-2 border-[#FF6B35] pb-0.5">Entegrasyonlar</Link>
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

// ─── Platform Kartı Bileşeni ────────────────────────────────────────────────

function PlatformCard({ name, flag, desc }: { name: string; flag: string; desc?: string }) {
  return (
    <div className="group bg-white rounded-2xl border border-[#E8E4DC] p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{flag}</span>
        <h3
          className="text-base font-bold text-[#1A1A2E] group-hover:text-[#FF6B35] transition-colors"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          {name}
        </h3>
      </div>
      {desc && <p className="text-xs text-[#9E9EA8] leading-relaxed">{desc}</p>}
    </div>
  )
}

// ─── Ana Sayfa ──────────────────────────────────────────────────────────────

export default function EntegrasyonlarPage() {
  const yerliPazaryerleri = [
    { name: 'Trendyol', flag: '🟠', desc: 'Türkiye\'nin en büyük pazaryeri. Kategori bazlı başlık kuralları ve karakter limitleri.' },
    { name: 'Hepsiburada', flag: '🟣', desc: 'Geniş kategori yelpazesi. Açıklama odaklı sıralama algoritması.' },
    { name: 'N11', flag: '🔴', desc: 'Rekabetçi fiyat odaklı pazar. SEO ağırlıklı başlık formülleri.' },
    { name: 'Çiçeksepeti', flag: '🔵', desc: 'Hediye ve yaşam ürünleri odaklı. Duygusal ton ağırlıklı içerik.' },
    { name: 'PTT AVM', flag: '📦', desc: 'Devlet destekli pazar. Basit ve güvenilir ton ile ürün sunumu.' },
    { name: 'GittiGidiyor', flag: '🟡', desc: 'İkinci el ve yeni ürün platformu. Ürün koşulu belirtme zorunluluğu.' },
    { name: 'Pazarama', flag: '🟢', desc: 'Turkcell altyapılı pazar. Mobil kullanıcı odaklı optimizasyon.' },
    { name: 'Dolap', flag: '👗', desc: 'İkinci el moda platformu. Dürüst koşul açıklaması gerektiren kurallar.' },
  ]

  const globalPazaryerleri = [
    { name: 'Amazon US', flag: '🇺🇸', desc: 'ABD pazarı. 5 bullet point formatı, Backend Keywords ve A+ Content desteği.' },
    { name: 'Amazon DE', flag: '🇩🇪', desc: 'Almanya pazarı. Almanca SEO ve AB yasal uyumluluk kuralları.' },
    { name: 'Amazon UK', flag: '🇬🇧', desc: 'İngiltere pazarı. İngiliz İngilizcesi ve yerel e-ticaret jargonu.' },
    { name: 'Amazon FR', flag: '🇫🇷', desc: 'Fransa pazarı. Fransızca SEO optimizasyonu ve yerel düzenlemeler.' },
    { name: 'Etsy', flag: '🧶', desc: 'El yapımı ve vintage odaklı. Hikaye anlatıcı ton, 13 etiket sistemi.' },
    { name: 'eBay', flag: '🏷️', desc: 'Açık artırma ve sabit fiyat. Global erişim, çok dilli destek.' },
    { name: 'Allegro', flag: '🇵🇱', desc: 'Polonya\'nın en büyük pazaryeri. Yerel SEO ve Lehçe içerik.' },
    { name: 'Kaufland', flag: '🇩🇪', desc: 'Almanya perakende devi. Ürün veri sayfası odaklı format.' },
    { name: 'Otto', flag: '🔴', desc: 'Almanya\'nın ikinci büyük online perakendecisi. Premium ton.' },
    { name: 'Cdiscount', flag: '🇫🇷', desc: 'Fransa\'nın lider indirim platformu. Kampanya odaklı içerik.' },
    { name: 'Bol.com', flag: '🇳🇱', desc: 'Hollanda ve Belçika pazaryeri. Felemenkçe ve Fransızca destek.' },
  ]

  const eticaretAltyapilari = [
    { name: 'Shopify', flag: '🟢', desc: 'Google SEO odaklı meta title/description. Blog + koleksiyon sayfası içerikleri.' },
    { name: 'WooCommerce', flag: '🟣', desc: 'WordPress tabanlı. Yoast SEO uyumlu, schema markup desteği.' },
    { name: 'Magento', flag: '🔶', desc: 'Kurumsal ölçekli e-ticaret. Ürün attribute bazlı detaylı içerik.' },
    { name: 'PrestaShop', flag: '🔵', desc: 'Avrupa odaklı açık kaynak. Çok dilli mağaza yapısı desteği.' },
    { name: 'OpenCart', flag: '🔷', desc: 'Hafif ve esnek altyapı. Basit ürün açıklama formatı.' },
    { name: 'BigCommerce', flag: '⬛', desc: 'Büyüyen markalar için. SEO araçları entegre, çok kanallı satış.' },
    { name: 'Wix eCommerce', flag: '⚫', desc: 'Sürükle-bırak mağaza oluşturucu. SEO Wiz entegrasyonu.' },
    { name: 'Squarespace', flag: '⬜', desc: 'Tasarım odaklı mağazalar. Görsel-ağırlıklı ürün sayfaları.' },
  ]

  const stats = [
    { value: '30+', label: 'Platform Desteği' },
    { value: '15+', label: 'Ülke Kapsamı' },
    { value: '8', label: 'Dil Desteği' },
    { value: '∞', label: 'Kategori Kuralı' },
  ]

  return (
    <>
      <NavBar />

      {/* Hero */}
      <header className="relative pt-32 pb-16 md:pt-44 md:pb-24 bg-[#F8F7F4] overflow-hidden">
        {/* Dekor */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] opacity-15 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4"
          style={{ background: 'radial-gradient(circle, #FF6B35 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-8 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"
          style={{ background: 'radial-gradient(circle, #1A1A2E 0%, transparent 70%)' }}
        />

        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
            Omnichannel Entegrasyon
          </div>

          <h1
            className="text-4xl md:text-6xl font-extrabold tracking-tighter text-[#1A1A2E] leading-tight"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Bir içerik, <span className="text-[#FF6B35]">tüm platformlar.</span>
          </h1>

          <p className="text-lg md:text-xl text-[#6B6B7B] max-w-2xl mx-auto leading-relaxed">
            Dünyanın önde gelen pazaryerleriyle entegre — yerelden globale tek motorla yönet.
          </p>

          <p className="text-sm text-[#9E9EA8] max-w-xl mx-auto leading-relaxed">
            OmniX Engine, her platformun benzersiz algoritma kurallarını, karakter limitlerini, SEO gereksinimlerini
            ve yasal uyumluluk standartlarını <strong className="text-[#6B6B7B]">sistem promptlarına gömülü</strong> olarak taşır.
            Siz sadece ürününüzü tanımlayın — gerisini AI halleder.
          </p>
        </div>
      </header>

      {/* İstatistik Bandı */}
      <section className="bg-[#1A1A2E] py-8">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p
                  className="text-3xl md:text-4xl font-extrabold text-[#FF6B35] mb-1"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {s.value}
                </p>
                <p className="text-sm text-slate-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Yerli Pazaryerleri ───────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🇹🇷</span>
            <h2
              className="text-2xl md:text-3xl font-bold text-[#1A1A2E] tracking-tight"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Yerli Pazaryerleri
            </h2>
          </div>
          <p className="text-[#6B6B7B] mb-8 max-w-2xl">
            Türkiye&apos;nin en büyük e-ticaret platformlarının algoritma kuralları, karakter limitleri
            ve SEO gereksinimleri motorumuza gömülüdür.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {yerliPazaryerleri.map((p) => (
              <PlatformCard key={p.name} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Global Pazaryerleri ──────────────────────────────────────────── */}
      <section className="py-20 bg-[#F8F7F4]">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🌍</span>
            <h2
              className="text-2xl md:text-3xl font-bold text-[#1A1A2E] tracking-tight"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Global Pazaryerleri
            </h2>
          </div>
          <p className="text-[#6B6B7B] mb-8 max-w-2xl">
            Amazon&apos;un farklı ülke pazarlarından Etsy&apos;nin hikaye odaklı formatına kadar,
            her global platformun kurallarına tam uyumlu içerik üretin.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {globalPazaryerleri.map((p) => (
              <PlatformCard key={p.name} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── E-ticaret Altyapıları ───────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⚙️</span>
            <h2
              className="text-2xl md:text-3xl font-bold text-[#1A1A2E] tracking-tight"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              E-ticaret Altyapıları
            </h2>
          </div>
          <p className="text-[#6B6B7B] mb-8 max-w-2xl">
            Kendi mağazanızı yönetiyorsanız, altyapınıza özel SEO kuralları ve içerik formatlarıyla
            arama motorlarında üst sıralarda yer alın.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {eticaretAltyapilari.map((p) => (
              <PlatformCard key={p.name} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Nasıl Çalışır Açıklaması ────────────────────────────────────── */}
      <section className="py-20 bg-[#F8F7F4]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-widest mb-3">Merak Edilenler</p>
          <h2
            className="text-2xl md:text-3xl font-bold text-[#1A1A2E] tracking-tight mb-8"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Platform Kuralları Nasıl Uygulanır?
          </h2>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg mb-4">1️⃣</div>
              <h3 className="text-base font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Platform Seçimi
              </h3>
              <p className="text-sm text-[#6B6B7B] leading-relaxed">
                Üretici, Dönüştürücü veya Analizör modülünde hedef platformunuzu seçin.
                Birden fazla platform aynı anda seçilebilir.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg mb-4">2️⃣</div>
              <h3 className="text-base font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Kurallar Otomatik Yüklenir
              </h3>
              <p className="text-sm text-[#6B6B7B] leading-relaxed">
                AI motorumuz, seçilen platformun karakter limitleri, başlık formatı, yasak kelimeler
                ve SEO ağırlıklandırma kurallarını otomatik uygular.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-lg mb-4">3️⃣</div>
              <h3 className="text-base font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Uyumlu Sonuç
              </h3>
              <p className="text-sm text-[#6B6B7B] leading-relaxed">
                Çıktı, seçilen platformun algoritmasına uygun, SEO skorlu ve yasal uyumlu olarak
                teslim edilir. Kopyala → yapıştır → yayınla.
              </p>
            </div>
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
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2
              className="text-3xl md:text-5xl font-extrabold text-white tracking-tighter"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Tüm Platformlara Tek Motordan
            </h2>
            <p className="text-orange-100 text-lg">
              50 ücretsiz kredi ile 30+ platformun kurallarına uygun içerik üretin.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/sign-up"
                className="bg-white text-[#FF6B35] px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Ücretsiz Başla — 50 Kredi
              </Link>
              <Link
                href="/hizmetlerimiz"
                className="bg-transparent border-2 border-white/40 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                Hizmetleri İncele
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
