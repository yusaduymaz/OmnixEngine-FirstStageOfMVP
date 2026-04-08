/**
 * ContentForge TR — Platform Kuralları Motoru
 *
 * Her platform için kesin, algoritmik olarak doğrulanmış SEO
 * ve içerik kurallarını barındırır. AI modeline enjekte edilerek
 * platforma özgü, kurallara tam uyumlu çıktı üretilmesini sağlar.
 *
 * Yeni platform eklemek için:
 *  1. PLATFORM_CONFIGS objesine yeni anahtar ekle
 *  2. PLATFORM_IDS dizisine ekle
 *  3. route.ts Zod şemasına ekle
 *  4. generate/page.tsx UI'ına ekle
 */

// ════════════════════════════════════════════════════════════
// Platform Kimlik Tanımları
// ════════════════════════════════════════════════════════════
export const PLATFORM_IDS = [
  'trendyol',
  'hepsiburada',
  'amazon_tr',
  'ciceksepeti',
  'etsy',
] as const

export type PlatformId = (typeof PLATFORM_IDS)[number]

// ════════════════════════════════════════════════════════════
// Platform Yapılandırma Tipi
// ════════════════════════════════════════════════════════════
export interface PlatformConfig {
  /** UI'da gösterilecek platform adı */
  label: string
  /** UI butonundaki kısa ad (rozet) */
  badge: string
  /** UI butonundaki renk (hex) */
  color: string
  /** UI ikonundaki emoji */
  emoji: string
  /** Platform açıklaması */
  description: string
  /** AI'a enjekte edilecek kesin kurallar metni */
  rules: string
}

// ════════════════════════════════════════════════════════════
// Platform Yapılandırmaları
// ════════════════════════════════════════════════════════════
export const PLATFORM_CONFIGS: Record<PlatformId, PlatformConfig> = {
  // ──────────────────────────────────────────────────────────
  // TRENDYOL
  // ──────────────────────────────────────────────────────────
  trendyol: {
    label: 'Trendyol',
    badge: 'TY',
    color: '#FF6B35',
    emoji: '🧡',
    description: 'Türkiye\'nin en büyük pazaryeri',
    rules: `
══════════════════════ TRENDYOL KURALLARI ══════════════════════

BAŞLIK ZORUNLULUKLARI (İHLAL YASAK):
- Kesin limit: Maksimum 100 karakter (100. karakterden sonra Trendyol başlığı keser)
- İlk kelime hariç TÜM harfler küçük olmalı (BÜYÜK HARF YASAK)
- Ünlem (!) ve soru işareti (?) KULLANMA
- YASAK KELIMELER: "en ucuz", "bedava", "ücretsiz", "garantili", "en iyi", "indirimli"
  (Bu kelimeler Trendyol tarafından otomatik reddedilir)
- Format şablonu: [Marka] [Ürün Tipi] [Ana Özellik] [Renk/Beden] [Ek Detay]
- SEO pattern: Kategori anahtar kelimesini ilk 40 karaktere yerleştir

AÇIKLAMA ZORUNLULUKLARI:
- Alt sınır: 200 karakter | Üst sınır: 3000 karakter
- İlk 160 karakter = Google snippet + Trendyol arama önizleme → en kritik bölge
- Madde işaretleri (• veya -) ile ürün özelliklerini listele
- ZORUNLU bilgi blokları: Malzeme, Boyut/Beden, Renk Seçenekleri, Bakım Talimatı
- "Kelime doldurmacılığı" YAPMA — her cümle somut bilgi taşımalı
- Arama sıralama ipucu: "ürün + özellik + kullanım alanı" kombinasyonu kullan

SEO İPUÇLARI:
- Uzun kuyruk anahtar kelime kullan: "deri çanta" DEĞİL → "hakiki deri fermuarlı kadın omuz çantası"
- Sayısal değerler (ölçü, ağırlık, kapasite) sıralamayı yükseltir
- Eş anlamlı kelimeleri açıklamada DOĞAL şekilde dağıt
`,
  },

  // ──────────────────────────────────────────────────────────
  // HEPSİBURADA
  // ──────────────────────────────────────────────────────────
  hepsiburada: {
    label: 'Hepsiburada',
    badge: 'HB',
    color: '#FF6000',
    emoji: '🟠',
    description: 'Güvenilir alışveriş platformu',
    rules: `
══════════════════════ HEPSİBURADA KURALLARI ══════════════════════

BAŞLIK ZORUNLULUKLARI:
- Kesin limit: Maksimum 150 karakter
- Marka adı ve model numarasını BAŞA al
- Temel özellik ve teknik detayı başlıkta belirt
- Kategori ve ürün tipi açıkça yazılmalı
- Format: [Marka] [Model] [Ürün Tipi] [Teknik Özellik] [Renk/Beden]

AÇIKLAMA ZORUNLULUKLARI:
- Alt sınır: 200 karakter | Üst sınır: 2000 karakter
- Teknik özellikler TABLO formatına uygun olmalı (anahtar: değer şeklinde)
- Garanti bilgisi, servis ve iade koşullarını yazabiliyorsan ekle
- İlk paragraf: Ürünün değer önerisi (neden bu ürünü almalı?)
- İkinci paragraf: Teknik detaylar ve özellikler
- Üçüncü paragraf: Kullanım alanları ve ipuçları

SEO İPUÇLARI:
- Hepsiburada'da marka aramaları çok güçlü — marka adını 2 kez kullan (başlık + açıklama)
- Kategori ağacındaki anahtar kelimeleri açıklamada doğal olarak kullan
- "Hızlı kargo" veya "aynı gün kargo" ifadeleri satışı artırır (yalnızca doğruysa yaz)
`,
  },

  // ──────────────────────────────────────────────────────────
  // AMAZON TR
  // ──────────────────────────────────────────────────────────
  amazon_tr: {
    label: 'Amazon TR',
    badge: 'AMZ',
    color: '#FF9900',
    emoji: '📦',
    description: 'Amazon Türkiye pazaryeri',
    rules: `
══════════════════════ AMAZON TÜRKİYE KURALLARI ══════════════════════

BAŞLIK ZORUNLULUKLARI:
- Kesin limit: Maksimum 200 karakter
- TÜM önemli anahtar kelimeleri tire (-) ile ayır
- Format: [Marka] - [Ürün Tipi] - [Ana Özellik] - [Malzeme] - [Boyut/Renk]
- İlk 80 karakter mobil cihazda görünür → en kritik bilgileri öne al
- Büyük/küçük harf duyarlı: Her kelimenin ilk harfi büyük (Title Case)

AÇIKLAMA ZORUNLULUKLARI:
- Bullet Points (Madde İmli Özellikler) KEsinlikle ekle — Amazon standardı
- Her bullet point 1 cümle, net ve bilgilendirici olmalı
- En az 5 bullet point yaz:
  1. En önemli özellik / değer önerisi
  2. Malzeme ve kalite detayı
  3. Boyut / ölçüler / kapasite
  4. Kullanım alanı / kimler için ideal
  5. Bakım talimatı / garanti bilgisi
- Uzun açıklama (A+ Content formatı): 300-2000 karakter arası
- "Enhanced Brand Content" tabelası gibi yaz: detaylı, profesyonel

SEO İPUÇLARI:
- Amazon A9 algoritması arka plan anahtar kelimelerine bakar
- Backend keyword alanı için 5 ayrı anahtar kelime öner (keywords_used dizisine ekle)
- Rakip ürünlerden farklılaşan özellikleri vurgula
- "Amazon's Choice" ve "Best Seller" etiketlerine uygun dil kullan
`,
  },

  // ──────────────────────────────────────────────────────────
  // ÇİÇEKSEPETİ
  // ──────────────────────────────────────────────────────────
  ciceksepeti: {
    label: 'Çiçeksepeti',
    badge: 'ÇS',
    color: '#E91E63',
    emoji: '🌸',
    description: 'Hediye ve yaşam ürünleri',
    rules: `
══════════════════════ ÇİÇEKSEPETİ KURALLARI ══════════════════════

BAŞLIK ZORUNLULUKLARI:
- Kesin limit: Maksimum 120 karakter
- Hediye konseptini öne çıkar (varsa)
- Duygusal bağ kuran kelimeler kullan: "sevdiklerinize", "özel hediye", "anlamlı"
- Format: [Ürün Tipi] [Ana Özellik] [Duygusal Dokunuş] [Detay]
- Sezonsal ipuçları ekle: Sevgililer Günü, Anneler Günü, Yılbaşı vb.

AÇIKLAMA ZORUNLULUKLARI:
- Alt sınır: 150 karakter | Üst sınır: 2000 karakter
- İlk paragraf: Duygusal değer önerisi (bu ürünü almak ne hissettirir?)
- İkinci paragraf: Fiziksel özellikler ve teknik detay
- Çiçeksepeti kullanıcıları hediye arıyor → "hediye paketi" avantajını vurgula (doğruysa)
- "Hızlı teslimat" ve "güvenli paketleme" ifadeleri güçlü satış tetikleyicisi

SEO İPUÇLARI:
- Çiçeksepeti aramalarında duygusal kelimeler daha yüksek CTR sağlar
- "Hediye", "sürpriz", "özel gün" kelimelerini doğal şekilde yerleştir
- Mevsimsel anahtar kelime: "yaz", "kış", "sevgililer günü hediyesi" vb.
- Ürün etiketi/hashtag önerisi: keywords_used dizisine trend hashtagler ekle
`,
  },

  // ──────────────────────────────────────────────────────────
  // ETSY
  // ──────────────────────────────────────────────────────────
  etsy: {
    label: 'Etsy',
    badge: 'ETSY',
    color: '#F1641E',
    emoji: '🎨',
    description: 'El yapımı ve vintage ürünler',
    rules: `
══════════════════════ ETSY KURALLARI ══════════════════════

BAŞLIK ZORUNLULUKLARI:
- Kesin limit: Maksimum 140 karakter
- Anahtar kelimeleri başlıkta organik olarak birleştir (virgül veya tire ile AYIRMA)
- "El yapımı", "handmade", "özel tasarım", "kişiye özel" gibi Etsy'nin premium kelimelerini kullan
- Format: [Ana Anahtar Kelime] [Ürün Tipi] [Özellik] [Hediye İbaresi] [Kişiselleştirme]
- Örnek: "El yapımı deri cüzdan kişiye özel isim baskılı erkek hediye"
- BÜYÜK HARF YASAK (Etsy politikası — spam olarak işaretlenir)

AÇIKLAMA ZORUNLULUKLARI:
- Hikaye anlat: Bu ürün nasıl yapıldı? Arkasındaki motivasyon nedir?
- "Handmade story" paragrafı KEsinlikle olsun (Etsy alıcısı hikaye sever)
- Teknik detaylar: Malzeme, boyut, ağırlık, üretim süresi
- Kargo bilgisi: Tahmini teslimat süresi yazılabilir
- Kişiselleştirme varsa: "Sipariş notuna istediğiniz ismi/mesajı yazın" gibi talimat ekle
- Alt sınır: 200 karakter | Üst sınır: 2000 karakter

ETIKET/TAG KURALLARI (keywords_used dizisine ekle):
- Etsy'de 13 adet tag hakkı var — en az 8 tag öner
- Uzun kuyruk tag kullan: "erkek hediye" DEĞİL → "erkek arkadaşa doğum günü hediyesi"
- Hem Türkçe hem İngilizce tag ekle (Etsy global platform)
- Mevsimsel tagler: "yılbaşı hediyesi", "sevgililer günü", "anneler günü hediyesi"
- Malzeme tagleri: "hakiki deri", "925 ayar gümüş", "doğal ahşap"

SEO İPUÇLARI:
- Etsy arama algoritması başlıktaki ilk 3 kelimeye öncelik verir
- Açıklamadaki anahtar kelimeler DE arama sonuçlarını etkiler
- "Bestseller" ve "Star Seller" rozetleri için yüksek kalite açıklama şart
- Fiyat-değer algısını güçlendiren ifadeler kullan: "premium malzeme", "usta işçiliği"
`,
  },
}

// ════════════════════════════════════════════════════════════
// Yardımcı Fonksiyonlar
// ════════════════════════════════════════════════════════════

/**
 * Seçili platformlar için kural metinlerini birleştirir.
 * AI modeline enjekte edilmek üzere tek string döner.
 */
export function getPlatformRules(platformIds: PlatformId[]): string {
  return platformIds
    .map((id) => PLATFORM_CONFIGS[id]?.rules)
    .filter(Boolean)
    .join('\n')
}

/**
 * Seçili platformların etiketlerini döner.
 * Kullanıcı mesajında "Hedef Platform: Trendyol + Amazon TR" gibi gösterilir.
 */
export function getPlatformLabels(platformIds: PlatformId[]): string {
  return platformIds
    .map((id) => PLATFORM_CONFIGS[id]?.label ?? id)
    .join(' + ')
}

/**
 * Platform ID'sinin geçerli olup olmadığını kontrol eder.
 */
export function isValidPlatform(id: string): id is PlatformId {
  return PLATFORM_IDS.includes(id as PlatformId)
}
