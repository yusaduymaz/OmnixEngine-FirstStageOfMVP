# design.md — OmniX Engine

> **Ürün:** Tüm global pazaryerleri ve e-ticaret altyapıları (Trendyol, Hepsiburada, Shopify, WooCommerce, Amazon, Etsy vb.) için Omnichannel İçerik, Analiz ve Görsel Motoru.
> **Hedef:** MVP → 1–2 ay | Tam ürün → 4–6 ay  
> **Son güncelleme:** Nisan 2026

---

## 1. Ürün Vizyonu & Tasarım Felsefesi

### Problem Özeti
Türkiye'deki 300.000+ aktif marketplace satıcısı ve global e-ticaret girişimcileri, ürün başlığı, açıklama ve reklam metni üretmek için ya İngilizce araçları tercüme ettiriyor ya da elle yazıyor. Satıcıların tek bir ürünü farklı platformların kurallarına göre (örn: Trendyol için kısa başlık, Amazon için bullet point, Shopify için HTML blog tarzı) manuel uyarlaması, mevcut içeriklerini analiz etmesi ve ürün görsellerini platforma uygun hale getirmesi saatler sürüyor.

### Çözüm — OmniX Engine
OmniX Engine, 4 temel modülden oluşan omnichannel bir e-ticaret içerik ve varlık (asset) motorudur:

1. **✍️ İçerik Üreteci (Generator):** Sıfırdan, global ve yerel platformlara özel SEO'lu içerikler oluşturur.
2. **🔄 İçerik Dönüştürücü (Converter):** Var olan bir ürün linkini veya metnini otomatik çekip (scrape) hedef platformun kurallarına göre yeniden yazar.
3. **🔍 İçerik Analizörü (Analyzer):** Mevcut içerikleri platformun kurallarına (SEO, limitler, yasal uyumluluk) göre analiz edip skor ve iyileştirme önerileri sunar.
4. **📸 Akıllı Görsel Stüdyosu (Image Studio):** Ham ürün fotoğraflarının arka planını AI ile temizleyip profesyonel e-ticaret standartlarına (ışık, gölge, 1080x1080) uygun görsel üretir.

### Tasarım Prensipleri
1. **Hız önce gelir.** Satıcı, ürünü tanımladıktan en fazla 8 saniye içinde içeriği görmelidir.
2. **Güven görünür olmalı.** AI çıktısı, "neden bu kelimeyi seçti?" sorusunu yanıtlamalı (SEO skoru, anahtar kelime rozeti vb.).
3. **Omnichannel esnekliği.** Kullanıcı her modülde hedef platformunu (Amazon, Shopify, Trendyol vb.) açıkça seçebilmeli; aynı ürünü birden fazla platforma aynı anda hedefleyebilmeli.
4. **Karmaşıklığı gizle.** Claude API, kategori eşlemeleri, SEO mantığı, scraping, görsel AI — bunların hepsi arka planda çalışır; kullanıcı sadece bir metin kutusu, bir URL alanı veya bir dosya sürükleme alanı görür.
5. **Türkçe karakteri koru.** Dil, üslup ve UX metinleri Türkçe iş dünyasının tonuna uygun olmalı — ne çok resmi ne çok samimi.

---

## 2. Kullanıcı Personaları

### Persona A — "Hızlı Murat" (Birincil)
- **Kim:** 3–50 ürünlük kataloğu olan küçük ölçekli Trendyol/Hepsiburada satıcısı
- **Teknik seviye:** Orta-düşük. Akıllı telefon merkezli.
- **Acı noktası:** "İyi başlık yazmak için saatler harcıyorum, yine de sıralamaya giremiyorum. Çektiğim fotoğraflar amatör duruyor."
- **Ne ister:** Ürün adını yazayım, butonа bassam, kopyalayayım, bitsin. Ham fotoğrafımı stüdyo çekimi gibi göstersin.

### Persona B — "Global Ayşe" (İkincil)
- **Kim:** Shopify tabanlı kendi D2C markası olan, aynı zamanda Etsy ve Amazon EU'da satan girişimci
- **Teknik seviye:** Orta-yüksek. Masa üstü odaklı.
- **Acı noktası:** "Aynı ürünü her platform için farklı yazmak zorundayım. Amazon bullet point istiyor, Etsy hikaye odaklı açıklama, Shopify SEO title…"
- **Ne ister:** Trendyol'daki ürün linkimi yapıştırayım, Amazon'a dönüştürsün. Analizör ile mevcut listelerimde neler eksik görsün.

### Persona C — "Kurumsal Kerem" (Uzun vadeli)
- **Kim:** 1000+ SKU'lu orta ölçekli marka veya 10–200 satıcıya hizmet veren e-ticaret ajansı
- **Teknik seviye:** Teknik ekibi var.
- **Acı noktası:** "Shopify mağazamıza doğrudan içerik basacak ve Avrupa pazarına açılmamızı sağlayacak bir motor arıyorum. Toplu yükleme, marka ses tonu profili, müşteri bazlı workspace lazım."
- **Ne ister:** API erişimi, webhook, ERP entegrasyonu, toplu analiz ve dönüştürme.

---

## 3. Kullanıcı Akışları

### Akış 1 — Sıfırdan Tekil İçerik Üretimi
```
[Giriş Yap]
    ↓
[Dashboard — Son içerikler + Kredi durumu]
    ↓
[+ Yeni İçerik]
    ↓
[Ürün Bilgisi Formu]
  • Ürün adı / GTIN (opsiyonel)
  • Kategori seçici (Evrensel kategori ağacından)
  • Platform: Trendyol | Amazon | Shopify | Etsy | Hepsi…
  • İçerik tipi: Başlık | Açıklama | Reklam metni | Hepsi
  • Ton: Profesyonel | Samimi | Lüks | İndirimli | Teknik | Hikaye
    ↓
[Üret — 8 sn içinde]
    ↓
[Sonuç Ekranı]
  • Platform bazlı sekmeler (Trendyol | Amazon | Shopify…)
  • Her platform için 2+ başlık varyantı (A/B test için)
  • Uzun açıklama + kısa açıklama
  • Amazon seçiliyse: 5 Bullet Point
  • Meta reklam metni (headline + body)
  • SEO skoru (0–100) + kullanılan anahtar kelimeler
  • Karakter sayısı / platform limiti göstergesi
  • Yasal uyumluluk notları
    ↓
[Düzenle | Kopyala | Kaydet | Yeniden Üret | Mağazaya Gönder]
    ↓
[Geçmiş / Kütüphane]
```

### Akış 2 — Toplu Yükleme (Persona C)
```
[CSV / Excel yükle]
    ↓
[Alan eşleştir — "hangi sütun ürün adı?"]
    ↓
[Toplu iş kuyruğu — arka planda]
    ↓
[E-posta bildirimi → Sonuçları indir]
```

### Akış 3 — İçerik Dönüştürücü (Content Converter) ✨ YENİ
```
[Dashboard] → [🔄 Dönüştürücü]
    ↓
[Girdi Formu]
  • Kaynak: E-ticaret ürün URL'si VEYA serbest metin yapıştır
  • Hedef platform(lar): Dropdown çoklu seçim (Örn: "Amazon US", "Shopify")
  • Ton seçimi (opsiyonel — varsayılan: kaynak tonu korunur)
    ↓
[Dönüştür Butonu]
  • Sistem arka planda:
    1. URL ise → Cheerio/Puppeteer ile scrape (başlık, açıklama, özellikler, görseller)
    2. Çekilen veriyi normalize et (ham HTML → temiz metin)
    3. system.ts kuralları çerçevesinde hedef platforma rewrite
    ↓
[Dönüştürülmüş Sonuç Ekranı]
  • Sol panel: Kaynak içeriğin özeti (orijinal metin, kaynak platform rozeti)
  • Sağ panel: Hedef platforma göre sekmeler (ContentCard ile)
  • Her sekme: Yeniden yazılmış başlıklar, açıklama, bullet points (varsa)
  • SEO skoru + karakter limiti uyum göstergesi
    ↓
[Kopyala | Kaydet | Düzenle | Tekrar Dönüştür]
```

### Akış 4 — İçerik Analizörü (Content Analyzer) ✨ YENİ
```
[Dashboard] → [🔍 Analizör]
    ↓
[Girdi Formu]
  • Ürün URL'si (zorunlu)
  • Hedef platform: Hangi platformun kurallarına göre analiz edilecek?
    ↓
[Analiz Et Butonu]
  • Sistem arka planda:
    1. URL'den içerik scrape et
    2. system.ts'teki PLATFORM_ALGORITHM_RULES ile karşılaştır
    3. SEO, kelime limitleri, yasal uyumluluk kontrolü yap
    4. Skor ve kriter bazlı değerlendirme oluştur
    ↓
[Analiz Raporu Ekranı]
  • Genel Skor (0–100): Büyük animasyonlu ring
  • Kriter Bazlı Değerlendirme:
    ├── Başlık Kalitesi: ✅ 85/100 — "Uzunluk optimum"
    ├── Açıklama Derinliği: ⚠️ 45/100 — "300 kelime altında"
    ├── Anahtar Kelime Yoğunluğu: ❌ 20/100 — "Ana anahtar kelime eksik"
    ├── Yasal Uyumluluk: ✅ 100/100 — "Sorun yok"
    └── Platform Spesifik: ⚠️ 60/100 — "Bullet point eksik (Amazon)"
  • Her kriter için açıklama + iyileştirme önerisi
    ↓
[Aksiyon Butonları]
  • "🪄 AI ile Düzelt ve Yeniden Yaz" → İçerik Üreteci akışına yönlendir (pre-filled)
  • "📋 Raporu Kopyala" → Markdown formatında panoya kopyala
  • "💾 Kaydet" → analyses tablosuna kayıt
```

### Akış 5 — Akıllı Görsel Stüdyosu (Image Studio) ✨ YENİ
```
[Dashboard] → [📸 Görsel Stüdyosu]
    ↓
[Görsel Yükleme Alanı]
  • Sürükle-bırak veya dosya seç (max 10MB, JPEG/PNG/WebP)
  • Yükleme anında thumbnail önizleme
    ↓
[Konfigürasyon Paneli]
  • Arka plan: Saf Beyaz (#FFFFFF) | Stüdyo Gri | Gradient | Özel Renk
  • Boyut: 1080×1080 (Kare) | 1200×1500 (Pinterest) | 1600×1200 (Amazon)
  • Efektler: Gölge ✅ | Yansıma ✅ | Işık düzeltme ✅
    ↓
[İşle Butonu]
  • Sistem arka planda:
    1. Görseli Supabase Storage'a yükle
    2. fal.ai / Replicate API → background removal
    3. Yeni arka plan + gölge/ışık render
    4. sharp ile boyutlandırma ve optimize
    5. Sonucu Supabase Storage'a kaydet
    ↓
[Öncesi / Sonrası Ekranı]
  • <BeforeAfterViewer> — sürüklenebilir slider ile karşılaştırma
  • İşlenmiş görselin çözünürlük ve boyut bilgisi
    ↓
[İndir (WebP/PNG/JPEG) | Kütüphaneye Kaydet | Yeniden İşle]
```

---

## 4. Ekran Haritası (Site Map)

```
/                          → Landing Page (pazarlama)
/auth/login                → Giriş
/auth/register             → Kayıt (14 gün trial)

/app/dashboard             → Ana Panel (4 modül Quick Action kartları)
/app/generate              → İçerik Üreteci (sıfırdan — tekil)
/app/converter             → İçerik Dönüştürücü (URL/metin → hedef platform) ✨ YENİ
/app/analyzer              → İçerik Analizörü (URL → audit & skor) ✨ YENİ
/app/image-studio          → Akıllı Görsel Stüdyosu (fotoğraf → profesyonel görsel) ✨ YENİ
/app/bulk                  → Toplu Yükleme
/app/library               → Geçmiş & Kütüphane
/app/settings              
  /profile                 → Profil & Marka Sesi
  /billing                 → Abonelik & Kredi
  /api                     → API Anahtarları (Kurumsal)
/app/workspaces            → Çoklu müşteri (Ajans planı)
```

---

## 5. Design System

### 5.1 Renk Paleti

```
// Primary — Güven + Enerji
--color-brand-primary:     #FF6B35;   /* Turuncu — aksiyon, enerji */
--color-brand-secondary:   #1A1A2E;   /* Koyu lacivert — otorite, B2B ciddiyet */

// Nötr Aralığı
--color-bg-base:           #F8F7F4;   /* Kırık beyaz — ekran yorgunluğunu azaltır */
--color-bg-surface:        #FFFFFF;
--color-bg-elevated:       #FFFFFF;
--color-border:            #E8E4DC;
--color-text-primary:      #1A1A2E;
--color-text-secondary:    #6B6B7B;
--color-text-muted:        #9E9EA8;

// Semantik
--color-success:           #22C55E;
--color-warning:           #F59E0B;
--color-error:             #EF4444;
--color-info:              #3B82F6;

// SEO / Analiz Skoru Gradyanı
--color-seo-low:           #EF4444;   /* 0–40 */
--color-seo-mid:           #F59E0B;   /* 41–70 */
--color-seo-high:          #22C55E;   /* 71–100 */
```

### 5.2 Tipografi

```
Başlık Fontu:   "Bricolage Grotesque" (Google Fonts — Türkçe karakter desteği tam)
Gövde Fontu:    "DM Sans" (okunabilirlik odaklı, nötr)
Monospace:      "JetBrains Mono" (API anahtarları, kod blokları)

Ölçek:
--text-xs:    12px / 16px
--text-sm:    14px / 20px
--text-base:  16px / 24px
--text-lg:    18px / 28px
--text-xl:    20px / 30px
--text-2xl:   24px / 32px
--text-3xl:   30px / 38px
--text-4xl:   36px / 44px
```

### 5.3 Spacing & Border Radius

```
Spacing sistemi: 4px base grid (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96)

--radius-sm:   6px
--radius-md:   10px
--radius-lg:   16px
--radius-xl:   24px
--radius-full: 9999px
```

### 5.4 Shadow Sistemi

```
--shadow-xs:  0 1px 2px rgba(26,26,46,0.05);
--shadow-sm:  0 2px 8px rgba(26,26,46,0.08);
--shadow-md:  0 4px 16px rgba(26,26,46,0.10);
--shadow-lg:  0 8px 32px rgba(26,26,46,0.12);
```

---

## 6. Komponent Kütüphanesi

### 6.1 Temel Bileşenler

| Bileşen | Açıklama | Varyantlar |
|---|---|---|
| `Button` | CTA aksiyonları | primary / secondary / ghost / destructive / loading |
| `Input` | Form girişleri | default / error / disabled / with-icon |
| `Textarea` | Uzun metin | auto-resize, karakter sayacı |
| `Select` | Dropdown | searchable, kategori ağacı için |
| `Badge` | Etiket, durum | platform (Trendyol/Amazon/Shopify…), SEO skoru, ton tipi |
| `Card` | İçerik kartı | shadow-sm, hover-lift animasyonu |
| `Toast` | Bildirim | success / error / info / warning |
| `Modal` | Dialog | sm / md / lg boyutları |
| `Skeleton` | Loading state | Text, card, tablo varyantları |

### 6.2 Ürüne Özgü Bileşenler (Mevcut)

**`<ContentCard>`**
- **Çoklu Sekme (Omnichannel):** Üretilen içeriği hedef platforma göre ayırır (Başlık | Açıklama | Reklam Metni | Bullet Points). Örneğin Amazon TR seçiliyse "Bullet Points" (amazon_bullet_points) sekmesi görünür; Dolap seçiliyse "Ürün Koşul Notu" öne çıkar.
- **Dinamik Platform Rozetleri:** `system.ts` içindeki `PlatformId` ve ülke kodlarına (`COUNTRY_PLATFORMS_MAPPING`) göre dinamik renklenen rozet sistemi:
  - *Yerel:* Trendyol (Turuncu), Hepsiburada (Turuncu/Mor), N11 (Kırmızı), Çiçeksepeti (Mavi), Dolap (Yeşil)
  - *Global:* Amazon (Turuncu/Siyah), Etsy (Turuncu), eBay (Çok Renkli), Otto (Kırmızı)
  - *Altyapılar:* Shopify (Açık Yeşil), WooCommerce (Mor), Wix (Siyah)
  - *Ülke Bayrakları:* (Örn: Amazon UK rozetinin yanında 🇬🇧 ikonu)
- **Alt Bilgi Paneli:** SEO skoru (0-100 ring), `system.ts`'ten dönen `seo_compliance_notes` (Yasal Uyum Uyarıları - örn: "Hayvansal menşei belirtilmedi") ve karakter sayacı/limit göstergesi (ilgili platformun sınırlarına göre renklendirilir).
- **Aksiyonlar:** Kopyala, Düzenle, Yeniden Üret, Kaydet, "Mağazaya Gönder (Push to Store)".

**`<SEOScoreRing>`**
- Animasyonlu çember (0–100)
- Renk gradyanı (kırmızı → sarı → yeşil)
- Hover'da: "Bu skoru artırmak için..." tooltip

**`<UniversalCategoryPicker>` (Evrensel Kategori Eşleştirici)**
- **Makro Kategori Yaklaşımı:** Kullanıcıyı karmaşık platform alt-kategorilerine boğmaz. `system.ts`'teki `CATEGORY_SEO_HINTS` yapısına uygun makro kategorileri (Örn: "Kadın Giyim", "Ev & Yaşam", "Elektronik") listeler.
- **Dinamik Eşleştirme Sistemi:** Kullanıcı "Çanta" seçtiğinde sistem bunu arka planda otomatik olarak:
  - Trendyol için: `Giyim & Ayakkabı > Kadın Çanta`
  - Amazon için: `Clothing, Shoes & Jewelry > Women > Handbags`
  - Shopify için: `Tags: bag, women-bag, leather-bag` formatlarına çevirir.
- **Akıllı SEO İpuçları:** Seçilen kategoriye özel `system.ts` içindeki yasal notları (Örn: Bebek ürünlerinde CE belgesi uyarısı, kozmetikte INCI listesi uyarısı) formun hemen altında bir `<Alert>` componenti ile gösterir.

**`<ToneSelector>`**
- 6 ton kartı: Profesyonel / Samimi / Lüks / İndirimli / Teknik / Hikaye Anlatıcı
- Hover'da örnek cümle önizlemesi

**`<BulkProgress>`**
- Gerçek zamanlı ilerleme çubuğu
- "23/100 ürün tamamlandı — tahminen 4 dk kaldı"

**`<CreditMeter>`**
- Header'da daima görünür
- Tükenmek üzereyken turuncu uyarı
- İşlem tipine göre kredi harcama etiketi (📝 1 kredi | 🔄 2 kredi | 📸 3 kredi)
- Tıklanabilir → Billing sayfasına yönlendirme

### 6.3 Yeni Modül Bileşenleri ✨

**`<URLInput>` (Dönüştürücü + Analizör için)**
- URL doğrulama (geçerli e-ticaret linki mi?)
- Platform otomatik algılama: URL'den platform rozetini çıkarır (trendyol.com → 🟠 Trendyol, amazon.com.tr → ⬛ Amazon TR)
- Favicon preview: Girilen URL'nin site ikonu gösterilir
- Hata durumu: "Bu URL'ye erişilemedi" veya "Desteklenmeyen site" feedback'i
- Varyant: `with-paste-button` (yapıştır butonu)

**`<ImageUploader>` (Görsel Stüdyosu için)**
- Geniş, kesik çizgili sürükle-bırak alanı (dashed border, hover'da renk değişimi)
- Dosya tipi kontrolü (JPEG/PNG/WebP — max 10MB)
- Yükleme anında thumbnail önizleme + dosya boyutu bilgisi
- Loading state: Shimmer/skeleton animasyonu + "AI görselinizi inceliyor..." metni
- Çoklu yükleme desteği (gelecek: toplu görsel işleme)

**`<BeforeAfterViewer>` (Görsel Stüdyosu sonuç ekranı)**
- Yatay sürüklenebilir ayırıcı çizgi (slider) ile orijinal ↔ işlenmiş görsel karşılaştırması
- Sol taraf: "Öncesi" etiketi + orijinal görsel
- Sağ taraf: "Sonrası" etiketi + AI-işlenmiş görsel
- Pinch-to-zoom desteği (mobilde)
- İndirme formatı seçici: WebP (önerilen) | PNG | JPEG
- Dosya boyutu karşılaştırması: "Orijinal: 4.2MB → İşlenmiş: 680KB"

**`<AnalysisReportCard>` (İçerik Analizörü sonuç ekranı)**
- Büyük dairesel genel skor (0–100): Animasyonlu ring, renk gradyanı
- Kriter bazlı satırlar: Her biri ikon + etiket + progress bar + skor formatında
  - ✅ Yeşil tik: Kriter karşılandı
  - ⚠️ Sarı ünlem: İyileştirme önerisi var
  - ❌ Kırmızı çarpı: Kritik sorun
- Her kriterin altında açılabilir (collapsible) detay — "Ne yapılmalı?" açıklaması
- Alt buton: "🪄 AI ile Düzelt" — tıklanınca `/app/generate` rotasına pre-filled verilerle yönlendir
- Paylaş / Kopyala / Kaydet aksiyonları

**`<PlatformConverterSelector>` (Dönüştürücü formu için)**
- İki dropdown yan yana: "Kaynak Platform" ← 🔁 → "Hedef Platform(lar)"
- Ortada animasyonlu ok ikonu (dönüşüm yönünü gösterir)
- Kaynak platform: Otomatik algılanır (URL'den) veya manuel seçilir
- Hedef platform: Çoklu seçim (badge'ler ile gösterilir)

**`<ImageFormatPicker>` (Görsel Stüdyosu konfigürasyon)**
- Görsel preset kartları grid'i:
  - 📦 Amazon (Beyaz arka plan, 1500×1500)
  - 🛍️ Shopify (Beyaz arka plan, 2048×2048)
  - 🟠 Trendyol (Beyaz arka plan, 1080×1080)
  - 📌 Pinterest (Beyaz arka plan, 1000×1500)
  - ⚙️ Özel (Kullanıcı tanımlı)
- Her preset seçildiğinde ayarlar otomatik dolar

---

## 7. Kilit Ekranlar — Tanım & Tasarım Notları

### 7.1 Dashboard (Güncellenmiş)
- **Sol sidebar:** Nav menüsü + Kredi metre + Plan etiketi
  - Nav grupları: **Oluştur** (Üretici, Dönüştürücü) | **Analiz** (Analizör) | **Medya** (Görsel Stüdyo) | **Yönet** (Kütüphane, Toplu Yükleme, Workspace)
- **Üst banner (ilk 14 gün):** Trial bitiş geri sayımı — sürdürücü ama agresif değil
- **Ana alan — 4 Hızlı Eylem (Quick Action) Kartları:**
  1. ✍️ **Sıfırdan Üret** — "Yeni ürün için SEO içerik oluştur" → `/app/generate`
  2. 🔄 **Linkten Dönüştür** — "Var olan ürün linkini başka platforma taşı" → `/app/converter`
  3. 🔍 **İçeriğini Analiz Et** — "Canlıdaki ürününün SEO denetimini yap" → `/app/analyzer`
  4. 📸 **Görsel Stüdyosu** — "Ham fotoğrafını profesyonel görsele çevir" → `/app/image-studio`
- **Son 5 içerik:** ContentCard listesi (tüm modüllerden karma)
- **Sağ panel (dar):** Hızlı istatistik — Bu ay üretilen, ortalama SEO skoru, en çok kullanılan kategori, kalan kredi

### 7.2 İçerik Üreteci
- **2 kolon layout:** Sol → Form | Sağ → Canlı önizleme (mobilde tek kolon)
- Form alanları step-by-step değil, hepsi bir arada — B2B kullanıcılar wizard'dan hoşlanmıyor
- "Üret" butonu: Full-width, turuncu, loading state'de spinner + "Yapay zeka çalışıyor..." animasyonu
- Sonuç gelince sağ taraf smooth scroll ile aşağı kayar

### 7.3 İçerik Dönüştürücü ✨ YENİ
- **2 kolon layout:** Sol → Girdi (URLInput + PlatformConverterSelector + ToneSelector) | Sağ → Boş state / Sonuç
- URL girildiğinde sağ panelde önce kaynak içeriğin özeti (scrape sonucu) gösterilir
- "Dönüştür" sonrası sağ panel hedef platform sekmelerine dönüşür
- Loading: Adım adım progress göstergesi ("📡 İçerik çekiliyor... → 🤖 AI dönüştürüyor... → ✅ Hazır!")

### 7.4 İçerik Analizörü ✨ YENİ
- **Tek kolon layout:** Üstte URLInput + platform seçim → Altta AnalysisReportCard
- Analiz sonucu sayfanın ana gövdesini kaplar — rapor deneyimi
- Her kriter satırı tıklanabilir — detay açıklama ve "nasıl düzeltilir" önerileri slide-down ile açılır
- CTA: "AI ile düzelt" butonu turuncu ve prominent

### 7.5 Görsel Stüdyosu ✨ YENİ
- **2 kolon layout:** Sol → ImageUploader + ImageFormatPicker | Sağ → BeforeAfterViewer
- İlk yüklemede sağ panel placeholder görsel ile ipucu verir ("Sonuç burada görünecek")
- İşleme tamamlandığında slider otomatik ortaya konumlanır
- Alt bar: İndirme formatı seçici + dosya boyutu bilgisi + "Kütüphaneye Kaydet" butonu

### 7.6 Kütüphane
- Filtreler: Platform, içerik tipi, **modül tipi (Üretim/Dönüştürme/Analiz/Görsel)**, tarih aralığı, SEO skoru aralığı
- Grid veya liste görünümü toggle
- Arama: Ürün adına veya içerik içeriğine göre
- Görseller için thumbnail grid görünümü

### 7.7 Billing
- Plan karşılaştırma tablosu (Starter / Growth / Agency / Enterprise)
- Kredi geçmişi tablosu — işlem tipi rozetleri (📝 üretim | 🔄 dönüşüm | 🔍 analiz | 📸 görsel)
- Stripe checkout entegrasyonu (yerleşik modal)

---

## 8. Mobil Tasarım Notları

- **Birincil hedef:** Tablet (1024px) ve masa üstü (1280px+)
- **Mobil:** Tam uyumlu olmalı — Persona A akıllı telefondan girebilir
- Sidebar → Bottom navigation bar (mobilde)
- ContentCard → Tek sütun, swipe ile aksiyonlar
- BeforeAfterViewer → Tek sütunda dikey slider moduna geçiş
- ImageUploader → Kamera erişimi butonu (mobilde)
- Minimum dokunma hedefi: 44×44px (Apple HIG)

---

## 9. Stitch Kullanım Rehberi

### Neden Stitch?
- Platform renklerini ve B2B SaaS komponentlerini hızla prototipleştirmek için ideal
- Design system prompt'larıyla tutarlı çıktı alınabiliyor
- Geliştirici el-off için Figma export desteği

### Stitch'te Üretilecek Ekranlar (Öncelik Sırası)
1. Dashboard (4 Quick Action kartlı ana panel)
2. İçerik Üreteci — form + sonuç ekranı
3. İçerik Dönüştürücü — URL girdi + sonuç ekranı ✨
4. İçerik Analizörü — URL girdi + rapor ekranı ✨
5. Görsel Stüdyosu — yükleme + öncesi/sonrası ekranı ✨
6. ContentCard bileşeni (tüm state'leriyle)
7. Billing / Plan karşılaştırma
8. Landing page (hero section + pricing)

### Stitch Prompt Şablonu
```
B2B SaaS dashboard for global e-commerce sellers. Product name: OmniX Engine.
Color palette: primary #FF6B35, background #F8F7F4, dark navy #1A1A2E.
Fonts: Bricolage Grotesque (headings), DM Sans (body).
Style: Clean, professional, minimal. No purple gradients. 
Left sidebar navigation with grouped sections, 2-column content layout.
Component: [BURAYA EKRAN ADI]
```

---

## 10. Erişilebilirlik (A11y)

- WCAG 2.1 AA uyumluluğu hedeflenir
- Tüm form alanları label'lı, hata mesajları role="alert" ile
- Klavye navigasyonu: Tab sırası mantıklı
- Renk kontrastı: Tüm metin kombinasyonları min 4.5:1
- Türkçe screen reader metinleri (aria-label'lar)
- BeforeAfterViewer: Klavye ile slider hareket ettirilebilir (arrow keys)
- ImageUploader: Drag-and-drop alternatifi olarak "Dosya Seç" butonu her zaman mevcut

---

## 11. Animasyon & Mikro-Etkileşimler

| Etkileşim | Animasyon | Süre |
|---|---|---|
| İçerik üretme | Dots pulsing + fade-in sonuç | 200ms |
| Kopyala butonu | ✓ ikonuna dönüşüm | 150ms |
| SEO ring | Sayı sayan animasyon | 600ms ease-out |
| Card hover | translateY(-2px) + shadow artışı | 150ms |
| Sidebar açıklama | Slide + fade | 200ms |
| Toast | Slide-in bottom-right | 300ms |
| BeforeAfter slider | Smooth drag, momentum deceleration | 100ms |
| Görsel işleme progress | 3 adım stepper animasyonu + shimmer | 300ms each |
| Analiz skoru | Ring fill + sayı count-up + renk geçişi | 800ms ease-out |
| URL scraping | Pulse dot + "Çekiliyor..." text fade loop | 200ms loop |
| Quick Action card hover | Scale(1.02) + shadow-md + border glow | 200ms |

---

## 12. İlk MVP & Fazları (Tasarım Önceliklendirmesi)

### Phase 1 — MVP (Tasarımda öncelikli ekranlar)
- [ ] Landing page (hero + features + pricing + footer)
- [ ] Auth (login + register)
- [ ] Dashboard (4 Quick Action kartlı)
- [ ] İçerik üreteci (tekil)
- [ ] Kütüphane (listeleme)
- [ ] Billing (plan seçimi)
- [ ] Ayarlar (profil + API key)

### Phase 2 — Omnichannel (Tasarımda ikinci dalga)
- [ ] İçerik Analizörü (URL audit + rapor)
- [ ] İçerik Dönüştürücü (URL/metin → hedef platform rewrite)
- [ ] Toplu Yükleme paneli

### Phase 3 — Görsel & Enterprise (Tasarımda üçüncü dalga)
- [ ] Akıllı Görsel Stüdyosu (upload + işleme + before/after)
- [ ] Workspace yönetimi (ajans)
- [ ] API dokümantasyonu sayfası