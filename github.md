# OmniX Engine — AI Omnichannel İçerik & Analiz Motoru

![OmniX Engine](https://img.shields.io/badge/Status-Sprint_3_Complete-success) ![Version](https://img.shields.io/badge/Version-2.5-blue) ![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase) ![Claude AI](https://img.shields.io/badge/AI-Claude_3.5_Sonnet-D97757?logo=anthropic)

## 🚀 Proje Hakkında

**OmniX Engine**, global pazaryerleri ve e-ticaret altyapıları (Trendyol, Hepsiburada, Shopify, WooCommerce, Amazon, Etsy vb.) için geliştirilmiş, **multi-agent mimarisine sahip** gelişmiş bir yapay zeka içerik ve analiz motorudur. 

Türkiye'deki ve dünyadaki e-ticaret satıcılarının en büyük problemlerinden biri olan "aynı ürünü farklı platformların kurallarına (kısa başlık, Amazon bullet point, Shopify HTML vb.) göre manuel uyarlama" sorununu ortadan kaldırır. Satıcıların içerik üretme, dönüştürme ve analiz etme süreçlerini saatlerden saniyelere indirir.

> [!NOTE]
> Bu proje, e-ticaret operasyonlarını tamamen yapay zeka ajanlarına devreden bir **SaaS platformu** olarak tasarlanmıştır ve Vercel üzerinde ölçeklenebilir şekilde deploy edilmiştir. Co-founder vizyonuyla, e-ticareti otonom hale getirmek için geliştirilmektedir.

## ✨ Temel Modüller (AI Agents)

OmniX Engine, birbirleriyle orkestrasyon içinde çalışan uzman ajanlardan oluşur:

1. **✍️ Content Agent (Üreteci & Analizör):** Sıfırdan, global ve yerel platformlara özel SEO uyumlu başlık, açıklama ve meta reklam metinleri oluşturur. Mevcut içerikleri platform kurallarına göre analiz edip iyileştirme önerileri sunar.
2. **🔄 Content Converter (Dönüştürücü):** Var olan bir ürün linkini (URL) veya metnini otomatik web scraping ile çekip, hedef platformun spesifik kurallarına göre yeniden yazar.
3. **📸 Image Agent (Görsel Stüdyosu):** Ham ürün fotoğraflarının arka planını yapay zeka ile temizleyip profesyonel e-ticaret standartlarına (doğru ışık, gölge, spesifik boyutlar) uygun yepyeni görseller üretir.
4. **📊 Pricing & Inventory Agents (Geliştirme Aşamasında):** Rakip fiyat analizi, dinamik fiyatlama önerileri ve stok tahmini ile operasyonu uçtan uca yönetir.

## 🛠️ Teknik Altyapı (Tech Stack)

Proje, kurumsal seviyede güvenlik ve hız standartlarına (Vercel, Supabase, Clerk) göre inşa edilmiştir.

### Frontend
* **Framework:** Next.js 14 (App Router, TypeScript)
* **Styling:** Tailwind CSS + shadcn/ui
* **State Management:** Zustand (Global State), TanStack Query (Data Fetching)
* **Form & Validasyon:** React Hook Form + Zod
* **Animasyonlar:** Framer Motion

### Backend & Veritabanı
* **Runtime:** Next.js API Routes / Edge Functions
* **Veritabanı:** Supabase (PostgreSQL + Row Level Security)
* **Kimlik Doğrulama:** Clerk (B2B auth, Workspaces, MFA)
* **Cache & Rate Limiting:** Upstash Redis
* **Arka Plan İşlemleri:** Trigger.dev
* **Ödeme & Abonelik:** Stripe (Atomik Kredi Sistemi)

### Yapay Zeka (AI) & Scraping Katmanı
* **Metin AI:** Anthropic Claude 3.5 Sonnet + Vercel AI SDK (Streaming desteği)
* **Görsel AI:** fal.ai / Replicate (Background removal & studio render)
* **Prompt Yönetimi:** Langfuse (AI Observability)
* **Web Scraping:** Cheerio (Lightweight) / Puppeteer Core (JS-Rendered)

## 🎯 Hedef Personalar

- **Hızlı Satıcılar (Yerel):** Trendyol, Hepsiburada gibi platformlarda satıcılık yapan ve hızlı içerik/görsel isteyen işletmeler.
- **Global Girişimciler:** Shopify, Amazon, Etsy gibi farklı platformlarda aynı anda D2C veya global satış yapan markalar.
- **Kurumsal / Ajanslar:** Yüzlerce ürünü olan, toplu yükleme (CSV) ve çoklu müşteri (workspace) yönetimine ihtiyaç duyan ajanslar.

## 📁 Mimari Yapı

```text
├── agents/              # Uzman AI Ajanları (Content, Image, Pricing, Inventory)
├── orchestrator/        # Ajanlar arası paralel yönetim ve veri paylaşımı
├── app/                 # Next.js 14 App Router (Marketing, Auth, Dashboard)
├── components/          # Yeniden kullanılabilir UI bileşenleri (shadcn/ui)
├── lib/                 # Servis entegrasyonları (Claude, Supabase, Redis, Stripe)
├── prompts/             # 30+ platform için özelleştirilmiş sistem promptları
├── types/               # Global TypeScript tip tanımları
└── supabase/migrations/ # Veritabanı şeması ve atomik kredi sistemi
```

## 🔒 Güvenlik ve Altyapı Kuralları

- **Sıkı Validasyon:** Tüm API Route'ları Zod kullanılarak sıkı bir validasyon katmanından geçer.
- **Veri Güvenliği:** Kullanıcı veri güvenliği için Supabase üzerinde RLS (Row Level Security) aktif edilmiştir.
- **Performans:** Claude AI çağrıları kullanıcı deneyimi için Streaming kullanılarak eşzamanlı aktarılır.
- **Hata Yönetimi:** Tüm süreçlerde kapsamlı hata yakalama ve kullanıcıya Türkçe bilgilendirme mekanizması mevcuttur.

## 📈 Güncel Durum (Roadmap)

- [x] **Sprint 1-2:** Content Agent (Analyzer + Converter) - **TAMAMLANDI**
- [x] **Sprint 3:** Image Agent (Background Removal + Studio) - **TAMAMLANDI**
- [ ] **Sprint 4:** Pricing Agent (Competitor Analysis) - **DEVAM EDİYOR**
- [ ] **Sprint 5:** Inventory Agent & Full Product Audit - **PLANLANDI**

---
*OmniX Engine, e-ticaretin geleceğini yapay zeka ajanlarıyla inşa ediyor.*
