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

## 📷 Ekran Görüntüleri

*(Buraya projenin önemli ekranlarının görsellerini ekleyebilirsiniz. Örneğin: Login Ekranı, Rol Yönetimi Sayfası, AI Analiz Sonucu vb.)*

<details>
<summary>📸 Ekran Görüntülerini Görüntüle</summary>
<br>

![image](/image/1.png)
![image](/image/2.png)
![image](/image/3.png)
![image](/image/4.png)
![image](/image/5.png)
![image](/image/6.png)
![image](/image/7.png)
![image](/image/8.png)
![image](/image/9.png)
![image](/image/10.png)
![image](/image/11.png)
![image](/image/12.png)
![image](/image/13.png)
![image](/image/14.png)
![image](/image/15.png)



</details>

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












This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
