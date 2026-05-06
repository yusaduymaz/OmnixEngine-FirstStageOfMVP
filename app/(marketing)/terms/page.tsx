import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Kullanım Koşulları — OmniX Engine',
  description: 'OmniX Engine hizmet kullanım koşulları, abonelik politikası ve sorumluluk sınırlamaları.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Minimal nav */}
      <nav className="bg-white border-b border-[#E8E4DC] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF6B35] flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L10.5 6H14L11 9.5L12.5 15L8 12L3.5 15L5 9.5L2 6H5.5L8 1Z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-[#1A1A2E] text-sm">OmniX Engine</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <h1
          className="text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-3"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Kullanım Koşulları
        </h1>
        <p className="text-[#6B6B7B] text-sm mb-10">Son güncelleme: Mayıs 2026</p>

        <div className="prose prose-sm max-w-none text-[#1A1A2E] space-y-8">

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">1. Hizmet Tanımı</h2>
            <p className="text-[#6B6B7B] leading-relaxed">
              OmniX Engine, e-ticaret satıcılarına yönelik yapay zeka destekli içerik üretimi, analizi ve görsel işleme
              hizmetleri sunan bir SaaS platformudur. Platform; içerik üreteci, içerik dönüştürücü, içerik analizörü ve
              görsel stüdyosu modüllerinden oluşmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">2. Hesap ve Kayıt</h2>
            <p className="text-[#6B6B7B] leading-relaxed">
              Hizmeti kullanmak için geçerli bir e-posta adresi ile kayıt olmanız gerekmektedir. Hesap bilgilerinizin
              doğruluğundan ve güvenliğinden siz sorumlusunuz. Hesabınızı başkalarıyla paylaşamazsınız. Şüpheli aktivite
              tespit edilmesi durumunda hesabınız askıya alınabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">3. Abonelik ve Ödeme</h2>
            <p className="text-[#6B6B7B] leading-relaxed mb-3">
              OmniX Engine aylık abonelik modeli ile çalışmaktadır. Ödeme işlemleri Stripe altyapısı üzerinden
              gerçekleştirilir. Abonelik her ay otomatik yenilenir.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B7B]">
              <li>Deneme planı: 50 ücretsiz kredi (tek seferlik)</li>
              <li>Starter: ₺299/ay — 500 kredi/ay</li>
              <li>Growth: ₺799/ay — 2.000 kredi/ay</li>
              <li>Agency: ₺2.499/ay — 10.000 kredi/ay</li>
            </ul>
            <p className="text-[#6B6B7B] leading-relaxed mt-3">
              İptal ettiğinizde mevcut dönem sonuna kadar hizmet kullanımınız devam eder, bir sonraki dönem için ücret
              alınmaz. Kullanılmayan krediler bir sonraki aya aktarılmaz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">4. Kredi Politikası</h2>
            <p className="text-[#6B6B7B] leading-relaxed">
              Her işlem belirli sayıda kredi harcar: tekil içerik üretimi 1 kredi, URL bazlı içerik dönüştürme 2 kredi,
              içerik analizi 1 kredi, görsel işleme 3 kredi. Krediler iade edilmez; ancak teknik arıza kaynaklı
              başarısız işlemlerde değerlendirme yapılabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">5. Kullanım Sınırlamaları</h2>
            <p className="text-[#6B6B7B] leading-relaxed mb-3">Aşağıdaki kullanımlar yasaktır:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B7B]">
              <li>Yanıltıcı, aldatıcı veya sahte içerik üretmek</li>
              <li>Platformun API veya altyapısını otomatik botlarla aşırı yüklemek</li>
              <li>Fikri mülkiyet haklarını ihlal eden içerik oluşturmak</li>
              <li>Hizmetin yeniden satışı veya kopyalanması</li>
              <li>Sistemin güvenliğini test etmek veya açık aramak</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">6. Üretilen İçeriklerin Sahipliği</h2>
            <p className="text-[#6B6B7B] leading-relaxed">
              OmniX Engine üzerinden üretilen içerikler size aittir. Platform, üretilen içerikleri reklam veya eğitim
              amaçlı kullanmaz. Ancak platform performansını iyileştirmek amacıyla anonim kullanım istatistikleri
              toplanabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">7. Sorumluluk Sınırlaması</h2>
            <p className="text-[#6B6B7B] leading-relaxed">
              OmniX Engine, üretilen içeriklerin her platformun güncel kurallarına uygunluğunu garanti etmez.
              Kullanıcı, nihai içeriğin doğruluğunu ve uygunluğunu kontrol etmekle yükümlüdür. Platform, olası veri
              kaybı, hizmet kesintisi veya üçüncü taraf platform değişikliklerinden kaynaklanan zararlardan sorumlu
              tutulamaz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">8. Değişiklikler</h2>
            <p className="text-[#6B6B7B] leading-relaxed">
              Bu koşullar önceden bildirimde bulunularak güncellenebilir. Önemli değişiklikler e-posta ile bildirilir.
              Hizmet kullanımına devam etmeniz, güncel koşulları kabul ettiğiniz anlamına gelir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">9. İletişim</h2>
            <p className="text-[#6B6B7B] leading-relaxed">
              Sorularınız için:{' '}
              <a href="/iletisim" className="text-[#FF6B35] hover:underline">İletişim formu</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E8E4DC] flex gap-4 text-sm">
          <Link href="/privacy" className="text-[#FF6B35] hover:underline">Gizlilik Politikası</Link>
          <Link href="/" className="text-[#6B6B7B] hover:text-[#1A1A2E]">Ana Sayfa</Link>
        </div>
      </main>
    </div>
  )
}
