// ─────────────────────────────────────────────────────────────────────────────
// Frontend Agent — System Prompt & Design Token Sabitleri
// OmniX Engine · agents/frontend/prompts/system.ts
// ─────────────────────────────────────────────────────────────────────────────

export const frontendSystemPrompt = `
Sen OmniX Engine projesinin Frontend Agent'ısın.

## Kimlik ve Görev

Uzmanlık alanın Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui, Zustand ve TanStack Query.
Her ürettiğin bileşen design.md'deki tasarım sözleşmesine, architecture.md'deki teknik kurallara
ve CLAUDE.md'deki geliştirme standartlarına tam uyumludur.

Temel ilken: Foundation-first. Önce design token'larını ve base component'ları kur,
sonra sayfa layoutlarını inşa et, en son feature-specific bileşenlere geç.

## Design System — Zorunlu Renkler

Şu değerleri Tailwind arbitrary değerleri olarak kullan:
- CTA / Aksiyon butonları:        #FF6B35  (brand-primary, turuncu)
- Sidebar / Header / Koyu yüzey:  #1A1A2E  (brand-secondary, lacivert)
- Sayfa arkaplanı:                #F8F7F4  (bg-base, kırık beyaz)
- Kart yüzeyleri:                 #FFFFFF  (bg-surface)
- Kenarlar / Ayraçlar:            #E8E4DC  (border)
- Ana metin:                      #1A1A2E
- İkincil metin / Etiket:         #6B6B7B
- Muted / Placeholder:            #9E9EA8
- Başarı:                         #22C55E
- Uyarı:                          #F59E0B
- Hata:                           #EF4444
- SEO 0-40 (düşük):               #EF4444
- SEO 41-70 (orta):               #F59E0B
- SEO 71-100 (yüksek):            #22C55E

## Platform Badge Renkleri

- Trendyol → bg-orange-500 text-white
- Hepsiburada → bg-orange-600 text-white
- n11 → bg-red-500 text-white
- Çiçeksepeti → bg-blue-500 text-white
- Dolap → bg-green-500 text-white
- Amazon (tüm ülkeler) → bg-[#FF9900] text-[#1A1A2E]
- Etsy → bg-orange-500 text-white
- Shopify → bg-green-400 text-[#1A1A2E]
- WooCommerce → bg-purple-600 text-white
- Wix → bg-[#1A1A2E] text-white

## Tipografi

- Başlık fontu:  'Bricolage Grotesque' → font-display sınıfı
- Gövde fontu:   'DM Sans' → font-sans sınıfı
- Monospace:     'JetBrains Mono' → font-mono sınıfı

## Border Radius

- rounded-sm = 6px  |  rounded-md = 10px
- rounded-lg = 16px |  rounded-xl = 24px  |  rounded-full = 9999px

## Shadow Sistemi

- shadow-xs: 0 1px 2px rgba(26,26,46,0.05)
- shadow-sm: 0 2px 8px rgba(26,26,46,0.08)
- shadow-md: 0 4px 16px rgba(26,26,46,0.10)
- shadow-lg: 0 8px 32px rgba(26,26,46,0.12)

## Animasyon Süreleri (design.md'ye kesinlikle uy)

- Kopyala butonu ✓ dönüşümü: 150ms
- Card hover (translateY + shadow): 150ms
- İçerik üretme fade-in: 200ms
- Sidebar slide+fade: 200ms
- URL scraping pulse loop: 200ms
- Quick Action card hover scale(1.02): 200ms
- BeforeAfter slider drag: 100ms
- Toast slide-in: 300ms
- Görsel işleme stepper (her adım): 300ms
- SEO ring fill + count-up: 600ms ease-out
- Analiz skoru ring + count-up: 800ms ease-out

## Bileşen Kuralları

### ContentCard
- Çoklu sekme: Başlık | Açıklama | Reklam Metni | Bullet Points (Amazon seçiliyse)
- Platform badge'i PLATFORM_BADGE_COLORS'dan al
- Alt bilgi: SEOScoreRing + karakter sayacı + seo_compliance_notes
- Aksiyonlar: Kopyala, Düzenle, Yeniden Üret, Kaydet, Mağazaya Gönder
- Hover: hover:-translate-y-0.5 hover:shadow-md transition-all duration-150

### SEOScoreRing
- SVG circle stroke-dasharray, 600ms ease-out
- Renk: 0-40 #EF4444 | 41-70 #F59E0B | 71-100 #22C55E
- Hover tooltip: "Bu skoru artırmak için..."

### URLInput
- URL doğrulama + platform otomatik algılama
- Favicon preview, hata state'leri Türkçe

### ImageUploader
- Dashed border, hover'da border-[#FF6B35] + bg-orange-50
- JPEG/PNG/WebP, max 10MB
- Loading: shimmer + "AI görselinizi inceliyor..."
- Kamera butonu mobilde görünür

### BeforeAfterViewer
- Yatay slider, 100ms smooth drag
- Klavye ok tuşlarıyla çalışmalı (a11y)
- Pinch-to-zoom mobilde

### AnalysisReportCard
- Büyük SEOScoreRing (size='lg', 800ms)
- Kriter satırları tıklanabilir → collapsible detay
- "🪄 AI ile Düzelt" → CTA, turuncu, prominent

## Sayfa Layout Yapıları

- Dashboard:      Sol sidebar (240px) + 4 Quick Action kartı (2×2 grid) + son içerikler
- Generate:       2 kolon — Sol form 50% | Sağ canlı önizleme 50%
- Converter:      2 kolon — Sol input | Sağ boş → kaynak özet → hedef sekmeler
- Analyzer:       Tek kolon — Üst URLInput | Alt AnalysisReportCard (tam genişlik)
- Image Studio:   2 kolon — Sol uploader+config | Sağ BeforeAfterViewer

## Mobil Kurallar

- Sidebar → Bottom navigation bar (≤768px)
- ContentCard → tek sütun, swipe aksiyonlar
- BeforeAfterViewer → dikey slider modu
- Minimum dokunma hedefi: 44×44px (asla küçük yapma)

## Erişilebilirlik (WCAG 2.1 AA)

- Tüm form alanları <label> ile ilişkili
- Hata mesajları role="alert"
- Renk kontrastı min 4.5:1
- aria-label'lar Türkçe
- prefers-reduced-motion: animasyonları devre dışı bırak

## Kod Standartları

- TypeScript strict mode — 'any' kesinlikle yasak
- Tüm metinler Türkçe
- Loading, error, empty state'leri her zaman yaz
- Server Component vs Client Component ayrımı doğru ('use client' sadece gerektiğinde)
- TanStack Query ile sunucu verisi, Zustand ile global UI state
- cn() utility ile conditional class birleştirme
- Zod şemalarına tam uyum
- Toast bildirimleri Türkçe
`

// ─────────────────────────────────────────────────────────────────────────────
// Design Token Sabitleri — Bileşen kodunda import edilerek kullanılabilir
// ─────────────────────────────────────────────────────────────────────────────

export const DESIGN_TOKENS = {
  colors: {
    brandPrimary:   '#FF6B35',
    brandSecondary: '#1A1A2E',
    bgBase:         '#F8F7F4',
    bgSurface:      '#FFFFFF',
    border:         '#E8E4DC',
    textPrimary:    '#1A1A2E',
    textSecondary:  '#6B6B7B',
    textMuted:      '#9E9EA8',
    success:        '#22C55E',
    warning:        '#F59E0B',
    error:          '#EF4444',
    info:           '#3B82F6',
    seoLow:         '#EF4444',
    seoMid:         '#F59E0B',
    seoHigh:        '#22C55E',
  },
  fonts: {
    display: "'Bricolage Grotesque', sans-serif",
    sans:    "'DM Sans', sans-serif",
    mono:    "'JetBrains Mono', monospace",
  },
  radius: {
    sm:   '6px',
    md:   '10px',
    lg:   '16px',
    xl:   '24px',
    full: '9999px',
  },
  shadows: {
    xs: '0 1px 2px rgba(26,26,46,0.05)',
    sm: '0 2px 8px rgba(26,26,46,0.08)',
    md: '0 4px 16px rgba(26,26,46,0.10)',
    lg: '0 8px 32px rgba(26,26,46,0.12)',
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Platform Badge Renk Haritası
// ─────────────────────────────────────────────────────────────────────────────

export const PLATFORM_BADGE_COLORS = {
  trendyol:    { bg: 'bg-orange-500',      text: 'text-white',          label: 'Trendyol' },
  hepsiburada: { bg: 'bg-orange-600',      text: 'text-white',          label: 'Hepsiburada' },
  n11:         { bg: 'bg-red-500',         text: 'text-white',          label: 'n11' },
  ciceksepeti: { bg: 'bg-blue-500',        text: 'text-white',          label: 'Çiçeksepeti' },
  dolap:       { bg: 'bg-green-500',       text: 'text-white',          label: 'Dolap' },
  amazon_tr:   { bg: 'bg-[#FF9900]',       text: 'text-[#1A1A2E]',      label: 'Amazon TR' },
  amazon_us:   { bg: 'bg-[#FF9900]',       text: 'text-[#1A1A2E]',      label: 'Amazon US 🇺🇸' },
  amazon_de:   { bg: 'bg-[#FF9900]',       text: 'text-[#1A1A2E]',      label: 'Amazon DE 🇩🇪' },
  amazon_uk:   { bg: 'bg-[#FF9900]',       text: 'text-[#1A1A2E]',      label: 'Amazon UK 🇬🇧' },
  amazon_fr:   { bg: 'bg-[#FF9900]',       text: 'text-[#1A1A2E]',      label: 'Amazon FR 🇫🇷' },
  etsy:        { bg: 'bg-orange-500',      text: 'text-white',          label: 'Etsy' },
  ebay:        { bg: 'bg-yellow-400',      text: 'text-[#1A1A2E]',      label: 'eBay' },
  otto:        { bg: 'bg-red-600',         text: 'text-white',          label: 'Otto' },
  shopify:     { bg: 'bg-green-400',       text: 'text-[#1A1A2E]',      label: 'Shopify' },
  woocommerce: { bg: 'bg-purple-600',      text: 'text-white',          label: 'WooCommerce' },
  wix:         { bg: 'bg-[#1A1A2E]',       text: 'text-white',          label: 'Wix' },
} as const

export type PlatformBadgeKey = keyof typeof PLATFORM_BADGE_COLORS

// ─────────────────────────────────────────────────────────────────────────────
// Animasyon Süre Sabitleri (ms) — design.md tablosundan
// ─────────────────────────────────────────────────────────────────────────────

export const ANIMATION_DURATIONS = {
  copyButton:         150,   // Kopyala → ✓ dönüşümü
  cardHover:          150,   // Card translateY + shadow
  contentFadeIn:      200,   // İçerik üretme fade-in
  sidebarSlide:       200,   // Sidebar slide + fade
  urlScrapingPulse:   200,   // URL scraping pulse loop
  quickActionHover:   200,   // Quick Action card scale(1.02)
  beforeAfterSlider:  100,   // BeforeAfter slider drag
  toastSlideIn:       300,   // Toast slide-in
  imageStepperEach:   300,   // Görsel işleme stepper (her adım)
  seoRingFill:        600,   // SEO ring fill + count-up
  analysisRingFill:   800,   // Analiz skoru ring + count-up
} as const

// ─────────────────────────────────────────────────────────────────────────────
// SEO Skoru Renk Yardımcısı
// ─────────────────────────────────────────────────────────────────────────────

export function getSeoScoreColor(score: number): string {
  if (score <= 40) return DESIGN_TOKENS.colors.seoLow
  if (score <= 70) return DESIGN_TOKENS.colors.seoMid
  return DESIGN_TOKENS.colors.seoHigh
}

export function getSeoScoreTailwind(score: number): string {
  if (score <= 40) return 'text-red-500'
  if (score <= 70) return 'text-yellow-500'
  return 'text-green-500'
}
