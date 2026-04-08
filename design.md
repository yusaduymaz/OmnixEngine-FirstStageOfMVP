# design.md — İçerik Fabrikası (ContentForge TR)

> **Ürün:** Trendyol & Hepsiburada satıcıları için AI destekli Türkçe içerik üreteci  
> **Hedef:** MVP → 1–2 ay | Tam ürün → 4–6 ay  
> **Son güncelleme:** Nisan 2026

---

## 1. Ürün Vizyonu & Tasarım Felsefesi

### Problem Özeti
Türkiye'deki 300.000+ aktif marketplace satıcısı, ürün başlığı, açıklama ve reklam metni üretmek için ya İngilizce araçları tercüme ettiriyor ya da elle yazıyor. Bu; hem Türkçe SEO'yu hem de Trendyol/Hepsiburada algoritmalarının beklentilerini karşılamıyor.

### Tasarım Prensipleri
1. **Hız önce gelir.** Satıcı, ürünü tanımladıktan en fazla 8 saniye içinde içeriği görmelidir.
2. **Güven görünür olmalı.** AI çıktısı, "neden bu kelimeyi seçti?" sorusunu yanıtlamalı (SEO skoru, anahtar kelime rozeti vb.).
3. **Karmaşıklığı gizle.** Claude API, Trendyol kategorileri, SEO mantığı — bunların hepsi arka planda çalışır; kullanıcı sadece bir metin kutusu ve bir buton görür.
4. **Türkçe karakteri koru.** Dil, üslup ve UX metinleri Türkçe iş dünyasının tonuna uygun olmalı — ne çok resmi ne çok samimi.

---

## 2. Kullanıcı Personaları

### Persona A — "Hızlı Murat" (Birincil)
- **Kim:** 3–50 ürünlük kataloğu olan küçük ölçekli Trendyol satıcısı
- **Teknik seviye:** Orta-düşük. Akıllı telefon merkezli.
- **Acı noktası:** "İyi başlık yazmak için saatler harcıyorum, yine de sıralamaya giremiyorum."
- **Ne ister:** Ürün adını yazayım, butonа bassam, kopyalayayım, bitsin.

### Persona B — "Ajans Ayşe" (İkincil)
- **Kim:** 10–200 satıcıya hizmet veren küçük e-ticaret ajansı
- **Teknik seviye:** Yüksek. Masa üstü odaklı.
- **Acı noktası:** "Her müşteri için ayrı ton, ayrı kategori — ölçeklenemiyorum."
- **Ne ister:** Toplu yükleme, marka ses tonu profili, müşteri bazlı workspace.

### Persona C — "Kurumsal Kerem" (Uzun vadeli)
- **Kim:** 1000+ SKU'lu orta ölçekli marka
- **Teknik seviye:** Teknik ekibi var.
- **Acı noktası:** "PIM'imizle entegre çalışacak bir şey yok."
- **Ne ister:** API erişimi, webhook, ERP entegrasyonu.

---

## 3. Kullanıcı Akışları

### Ana Akış — Tekil İçerik Üretimi
```
[Giriş Yap]
    ↓
[Dashboard — Son içerikler + Kredi durumu]
    ↓
[+ Yeni İçerik]
    ↓
[Ürün Bilgisi Formu]
  • Ürün adı / GTIN (opsiyonel)
  • Kategori seçici (Trendyol ağacından)
  • Platform: Trendyol | Hepsiburada | İkisi de
  • İçerik tipi: Başlık | Açıklama | Reklam metni | Hepsi
  • Ton: Profesyonel | Samimi | Lüks | İndirimli
    ↓
[Üret — 8 sn içinde]
    ↓
[Sonuç Ekranı]
  • 3 başlık varyantı (A/B test için)
  • Uzun açıklama + kısa açıklama
  • Meta reklam metni (headline + body)
  • SEO skoru (0–100) + kullanılan anahtar kelimeler
  • Karakter sayısı / platform limiti göstergesi
    ↓
[Düzenle | Kopyala | Kaydet | Yeniden Üret]
    ↓
[Geçmiş / Kütüphane]
```

### İkincil Akış — Toplu Yükleme (Persona B)
```
[CSV / Excel yükle]
    ↓
[Alan eşleştir — "hangi sütun ürün adı?"]
    ↓
[Toplu iş kuyruğu — arka planda]
    ↓
[E-posta bildirimi → Sonuçları indir]
```

---

## 4. Ekran Haritası (Site Map)

```
/                          → Landing Page (pazarlama)
/auth/login                → Giriş
/auth/register             → Kayıt (14 gün trial)
/app/dashboard             → Ana Panel
/app/generate              → İçerik Üreteci (tekil)
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
--color-brand-primary:     #FF6B35;   /* Turuncu — Trendyol çağrışımı, aksiyon */
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

// SEO Skoru Gradyanı
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
| `Select` | Dropdown | searchable, Trendyol kategori ağacı için |
| `Badge` | Etiket, durum | platform (Trendyol/HB), SEO skoru, ton tipi |
| `Card` | İçerik kartı | shadow-sm, hover-lift animasyonu |
| `Toast` | Bildirim | success / error / info / warning |
| `Modal` | Dialog | sm / md / lg boyutları |
| `Skeleton` | Loading state | Text, card, tablo varyantları |

### 6.2 Ürüne Özgü Bileşenler

**`<ContentCard>`**
- 3 sekmeli yapı: Başlık | Açıklama | Reklam Metni
- Sağ üstte: Platform rozeti (Trendyol turuncu / Hepsiburada mor)
- Alt kısım: SEO skoru ring, anahtar kelime etiketleri, karakter sayacı
- Aksiyonlar: Kopyala, Düzenle, Yeniden Üret, Kaydet

**`<SEOScoreRing>`**
- Animasyonlu çember (0–100)
- Renk gradyanı (kırmızı → sarı → yeşil)
- Hover'da: "Bu skoru artırmak için..." tooltip

**`<CategoryPicker>`**
- Trendyol'un 3 seviyeli kategori ağacı
- Arama destekli
- Son kullanılanlar bölümü

**`<ToneSelector>`**
- 4 ton kartı: Profesyonel / Samimi / Lüks / İndirimli
- Hover'da örnek cümle önizlemesi

**`<BulkProgress>`**
- Gerçek zamanlı ilerleme çubuğu
- "23/100 ürün tamamlandı — tahminen 4 dk kaldı"

**`<CreditMeter>`**
- Header'da daima görünür
- Tükenmek üzereyken turuncu uyarı
- Tıklanabilir → Billing sayfasına yönlendirme

---

## 7. Kilit Ekranlar — Tanım & Tasarım Notları

### 7.1 Dashboard
- **Sol sidebar:** Nav menüsü + Kredi metre + Plan etiketi
- **Üst banner (ilk 14 gün):** Trial bitiş geri sayımı — sürdürücü ama agresif değil
- **Ana alan:** Son 5 içerik (ContentCard listesi) + "Yeni İçerik Üret" büyük CTA
- **Sağ panel (dar):** Hızlı istatistik — Bu ay üretilen, ortalama SEO skoru, en çok kullanılan kategori

### 7.2 İçerik Üreteci
- **2 kolon layout:** Sol → Form | Sağ → Canlı önizleme (mobilde tek kolon)
- Form alanları step-by-step değil, hepsi bir arada — B2B kullanıcılar wizard'dan hoşlanmıyor
- "Üret" butonu: Full-width, turuncu, loading state'de spinner + "Yapay zeka çalışıyor..." animasyonu
- Sonuç gelince sağ taraf smooth scroll ile aşağı kayar

### 7.3 Kütüphane
- Filtreler: Platform, içerik tipi, tarih aralığı, SEO skoru aralığı
- Grid veya liste görünümü toggle
- Arama: Ürün adına veya içerik içeriğine göre

### 7.4 Billing
- Plan karşılaştırma tablosu (Starter / Growth / Agency / Enterprise)
- Kredi geçmişi tablosu
- Stripe checkout entegrasyonu (yerleşik modal)

---

## 8. Mobil Tasarım Notları

- **Birincil hedef:** Tablet (1024px) ve masa üstü (1280px+)
- **Mobil:** Tam uyumlu olmalı — Persona A akıllı telefondan girebilir
- Sidebar → Bottom navigation bar (mobilde)
- ContentCard → Tek sütun, swipe ile aksiyonlar
- Minimum dokunma hedefi: 44×44px (Apple HIG)

---

## 9. Stitch Kullanım Rehberi

### Neden Stitch?
- Trendyol/Hepsiburada platform renklerini ve B2B SaaS komponentlerini hızla prototipleştirmek için ideal
- Design system prompt'larıyla tutarlı çıktı alınabiliyor
- Geliştirici el-off için Figma export desteği

### Stitch'te Üretilecek Ekranlar (Öncelik Sırası)
1. Dashboard (ana panel)
2. İçerik Üreteci — form + sonuç ekranı
3. ContentCard bileşeni (tüm state'leriyle)
4. Billing / Plan karşılaştırma
5. Landing page (hero section + pricing)

### Stitch Prompt Şablonu
```
B2B SaaS dashboard for Turkish e-commerce sellers.
Color palette: primary #FF6B35, background #F8F7F4, dark navy #1A1A2E.
Fonts: Bricolage Grotesque (headings), DM Sans (body).
Style: Clean, professional, minimal. No purple gradients. 
Left sidebar navigation, 2-column content layout.
Component: [BURAYA EKRAN ADI]
```

---

## 10. Erişilebilirlik (A11y)

- WCAG 2.1 AA uyumluluğu hedeflenir
- Tüm form alanları label'lı, hata mesajları role="alert" ile
- Klavye navigasyonu: Tab sırası mantıklı
- Renk kontrastı: Tüm metin kombinasyonları min 4.5:1
- Türkçe screen reader metinleri (aria-label'lar)

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

---

## 12. İlk MVP Kapsamı (Phase 1)

Tasarımda önceliklendirilecek ekranlar:

- [ ] Landing page (hero + features + pricing + footer)
- [ ] Auth (login + register)
- [ ] Dashboard
- [ ] İçerik üreteci (tekil)
- [ ] Kütüphane (listeleme)
- [ ] Billing (plan seçimi)
- [ ] Ayarlar (profil + API key)