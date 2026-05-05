# OmniX Engine — AI Omnichannel İçerik & Analiz Motoru

![OmniX Engine](https://img.shields.io/badge/Status-Active-success) ![Version](https://img.shields.io/badge/Version-2.0-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase) ![Claude AI](https://img.shields.io/badge/AI-Claude_Sonnet_4-D97757?logo=anthropic)

## 🚀 Proje Hakkında

**OmniX Engine**, tüm global pazaryerleri ve e-ticaret altyapıları (Trendyol, Hepsiburada, Shopify, WooCommerce, Amazon, Etsy vb.) için geliştirilmiş, Türkçe/çok dilli SEO odaklı gelişmiş bir yapay zeka içerik ve analiz motorudur. 

Türkiye'deki ve dünyadaki e-ticaret satıcılarının en büyük problemlerinden biri olan "aynı ürünü farklı platformların kurallarına (kısa başlık, Amazon bullet point, Shopify HTML vb.) göre manuel uyarlama" sorununu ortadan kaldırır. Satıcıların içerik üretme, dönüştürme ve analiz etme süreçlerini saatlerden saniyelere indirir.

## ✨ Temel Modüller

OmniX Engine 4 temel modülden oluşmaktadır:

1. **✍️ İçerik Üreteci (Generator):** Sıfırdan, global ve yerel platformlara özel SEO uyumlu başlık, açıklama ve meta reklam metinleri oluşturur.
2. **🔄 İçerik Dönüştürücü (Converter):** Var olan bir ürün linkini (URL) veya metnini otomatik web scraping (Cheerio/Puppeteer) ile çekip, hedef platformun spesifik kurallarına göre yeniden yazar.
3. **🔍 İçerik Analizörü (Analyzer):** Mevcut içerikleri hedef platformun kurallarına (SEO skorları, kelime limitleri, yasal uyumluluk vb.) göre analiz edip detaylı bir denetim (audit) raporu ve iyileştirme önerileri sunar.
4. **📸 Akıllı Görsel Stüdyosu (Image Studio):** Ham ürün fotoğraflarının arka planını yapay zeka ile temizleyip profesyonel e-ticaret standartlarına (doğru ışık, gölge, platformun istediği spesifik boyutlar) uygun yepyeni görseller üretir.

## 🛠️ Tech Stack (Kullanılan Teknolojiler)

Proje, modern ve ölçeklenebilir B2B SaaS mimarisine uygun olarak geliştirilmiştir.

### Frontend
* **Framework:** Next.js 14 (App Router, TypeScript)
* **Styling:** Tailwind CSS + shadcn/ui
* **State Management:** Zustand (Global State), TanStack Query (Data Fetching)
* **Form & Validasyon:** React Hook Form + Zod
* **Animasyonlar:** Framer Motion

### Backend & Veritabanı
* **Runtime:** Next.js API Routes / Edge Functions
* **Veritabanı:** Supabase (PostgreSQL + Row Level Security)
* **Kimlik Doğrulama:** Clerk (B2B auth, MFA, vb.)
* **Cache & Rate Limiting:** Upstash Redis
* **Arka Plan İşlemleri (Jobs):** Trigger.dev
* **Dosya Depolama:** Supabase Storage (Medya ve CSV yönetimi)

### Yapay Zeka (AI) & Scraping Katmanı
* **Metin AI:** Claude API (claude-sonnet-4) + Vercel AI SDK (Streaming desteği)
* **Görsel AI:** fal.ai / Replicate (Background removal & studio render)
* **Prompt Yönetimi:** Langfuse
* **Web Scraping:** Cheerio (Lightweight HTML) / Puppeteer Core (JS-Rendered sayfalar)

### Servisler
* **Ödeme & Abonelik:** Stripe
* **E-posta İletişimi:** Resend
* **Analitik:** PostHog

## 🎯 Hedef Personalar

- **Hızlı Satıcılar (Yerel):** Trendyol, Hepsiburada gibi platformlarda satıcılık yapan ve hızlı içerik/görsel isteyen işletmeler.
- **Global Girişimciler:** Shopify, Amazon, Etsy gibi farklı platformlarda aynı anda D2C veya global satış yapan markalar.
- **Kurumsal / Ajanslar:** Yüzlerce ürünü olan, toplu yükleme (CSV) ve çoklu müşteri (workspace) yönetimine ihtiyaç duyan ajanslar.

## 📁 Klasör Mimarisi

```text
├── app/
│   ├── (marketing)/         # Landing page ve pazarlama sayfaları
│   ├── (auth)/              # Clerk login/register sayfaları
│   ├── (dashboard)/app/     # Ana Uygulama Paneli
│   │   ├── generate/        # İçerik Üreteci
│   │   ├── converter/       # İçerik Dönüştürücü
│   │   ├── analyzer/        # İçerik Analizörü
│   │   └── image-studio/    # Akıllı Görsel Stüdyosu
│   └── api/                 # Backend Route'ları (AI, webhooks, auth)
├── lib/
│   ├── claude/              # Prompt ve Vercel AI SDK yardımcıları
│   └── supabase/            # DB client
├── prompts/                 # Sistem promptları ve platform kuralları (system.ts)
├── types/                   # Global TypeScript tip tanımları
└── components/              # Yeniden kullanılabilir UI (shadcn)
```

## 🔒 Güvenlik ve Altyapı Kuralları

- Sistemdeki tüm metinler, hata mesajları ve yorumlar Türkçe iş dünyası diline uygundur.
- Tüm API Route'ları **Zod** kullanılarak sıkı bir validasyon katmanından geçer.
- Kullanıcı veri güvenliği için Supabase üzerinde **RLS (Row Level Security)** aktif edilmiştir.
- Claude AI çağrıları kullanıcı deneyimi için **Streaming (Vercel AI SDK)** kullanılarak eşzamanlı aktarılır.
- Rate limiting işlemleri Upstash Redis ile korunmaktadır.

---
*Bu doküman `architecture.md` ve `design.md` baz alınarak OmniX Engine projesi için hazırlanmıştır.*
