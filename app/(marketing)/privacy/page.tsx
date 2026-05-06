import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası — OmniX Engine',
  description: 'OmniX Engine gizlilik politikası, kişisel veri işleme ve KVKK uyumluluk bilgileri.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4]">
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
          Gizlilik Politikası
        </h1>
        <p className="text-[#6B6B7B] text-sm mb-10">Son güncelleme: Mayıs 2026</p>

        <div className="prose prose-sm max-w-none text-[#1A1A2E] space-y-8">

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">1. Topladığımız Veriler</h2>
            <p className="text-[#6B6B7B] leading-relaxed mb-3">OmniX Engine aşağıdaki verileri toplar:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B7B]">
              <li><strong>Hesap bilgileri:</strong> Ad, e-posta adresi (Clerk üzerinden)</li>
              <li><strong>Kullanım verileri:</strong> Üretilen içerikler, kredi kullanımı, oturum bilgileri</li>
              <li><strong>Ödeme bilgileri:</strong> Fatura adresi (Stripe tarafından güvenle saklanır — kart numaranıza erişimimiz yoktur)</li>
              <li><strong>Teknik veriler:</strong> IP adresi, tarayıcı türü, hata logları</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">2. Verileri Nasıl Kullanıyoruz</h2>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B7B]">
              <li>Hizmeti sağlamak ve iyileştirmek</li>
              <li>Abonelik ve ödeme işlemlerini yönetmek</li>
              <li>Teknik destek ve güvenlik bildirimleri göndermek</li>
              <li>Yasal yükümlülükleri yerine getirmek</li>
            </ul>
            <p className="text-[#6B6B7B] leading-relaxed mt-3">
              Kişisel verilerinizi üçüncü taraflarla ticari amaçla paylaşmıyoruz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">3. Üçüncü Taraf Hizmetler</h2>
            <p className="text-[#6B6B7B] leading-relaxed mb-3">Hizmetimiz aşağıdaki üçüncü taraf sağlayıcıları kullanmaktadır:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B7B]">
              <li><strong>Clerk:</strong> Kimlik doğrulama ve hesap yönetimi</li>
              <li><strong>Supabase:</strong> Veri depolama (EU-West bölgesi)</li>
              <li><strong>Stripe:</strong> Ödeme işlemleri (PCI DSS uyumlu)</li>
              <li><strong>Anthropic / Groq:</strong> Yapay zeka metin üretimi</li>
              <li><strong>fal.ai / Replicate:</strong> Görsel işleme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">4. Veri Güvenliği</h2>
            <p className="text-[#6B6B7B] leading-relaxed">
              Tüm veriler HTTPS üzerinden şifrelenmiş olarak iletilir. Veritabanı erişimleri Row Level Security (RLS)
              politikalarıyla korunmaktadır — her kullanıcı yalnızca kendi verilerine erişebilir. Ödeme verileri
              doğrudan Stripe&apos;ta saklanır; OmniX Engine kart numaranıza erişmez.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">5. Çerezler</h2>
            <p className="text-[#6B6B7B] leading-relaxed">
              Oturum yönetimi için zorunlu çerezler kullanılmaktadır. Analitik çerezler için açık onayınız alınır.
              Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu bazı özelliklerin çalışmamasına
              neden olabilir.
            </p>
          </section>

          <section id="kvkk">
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">6. KVKK — Kişisel Verilerin Korunması</h2>
            <p className="text-[#6B6B7B] leading-relaxed mb-3">
              6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#6B6B7B]">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verilerinize erişim talep etme</li>
              <li>Kişisel verilerinizin düzeltilmesini isteme</li>
              <li>Kişisel verilerinizin silinmesini talep etme</li>
              <li>Kişisel verilerinizin işlenmesine itiraz etme</li>
            </ul>
            <p className="text-[#6B6B7B] leading-relaxed mt-3">
              Bu haklarınızı kullanmak için{' '}
              <a href="/iletisim" className="text-[#FF6B35] hover:underline">iletişim formumuzu</a>{' '}
              kullanabilirsiniz. Talepleriniz 30 gün içinde yanıtlanır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">7. Veri Saklama Süreleri</h2>
            <p className="text-[#6B6B7B] leading-relaxed">
              Hesap verileriniz, hesabınız aktif olduğu sürece saklanır. Hesap silme talebinde bulunduğunuzda tüm kişisel
              verileriniz 30 gün içinde kalıcı olarak silinir. Yasal zorunluluk nedeniyle belirli ödeme kayıtları
              daha uzun süre saklanabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">8. İletişim</h2>
            <p className="text-[#6B6B7B] leading-relaxed">
              Gizlilik ile ilgili sorularınız için:{' '}
              <a href="/iletisim" className="text-[#FF6B35] hover:underline">İletişim formu</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E8E4DC] flex gap-4 text-sm">
          <Link href="/terms" className="text-[#FF6B35] hover:underline">Kullanım Koşulları</Link>
          <Link href="/" className="text-[#6B6B7B] hover:text-[#1A1A2E]">Ana Sayfa</Link>
        </div>
      </main>
    </div>
  )
}
