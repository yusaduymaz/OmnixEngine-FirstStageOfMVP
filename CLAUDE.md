# CLAUDE.md — OmniX Engine AI Context

> Bu dosyayı her zaman oku. OmniX Engine projesinin genel rehberi.

## Proje Nedir?

OmniX Engine, tüm global pazaryerleri ve e-ticaret altyapıları (Trendyol, Hepsiburada, Shopify, WooCommerce, Amazon, Etsy vb.) için Türkçe/çok dilli SEO odaklı **multi-agent AI otomasyon platformu**dur.

### Temel Yetenekler (4 Agent)
1. **Content Agent** — ürün açıklaması üretme, analiz, dönüştürme, platform optimizasyonu
2. **Image Agent** — background removal, studio render, optimize etme, toplu işleme
3. **Pricing Agent** — rakip fiyat analizi, fiyat önerileri, margin analizi, sezonsal fiyatlama
4. **Inventory Agent** — stok tahmini, yeniden sipariş, anomali tespiti, sezonsal planlama

### Mimari Özeti
```
Client Layer (Next.js 14 App Router)
    ↓
Orchestrator (API Routes + Zod validation + Parallel execution)
    ↓
Agents: Content | Image | Pricing | Inventory
    ↓
AI Providers: Claude API | fal.ai + Replicate | Scraping Layer | Trigger.dev
    ↓
Data: Supabase | Upstash Redis | Langfuse
```

---

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 14 (App Router, TypeScript strict) |
| UI | Tailwind CSS + shadcn/ui |
| AI - Text | Anthropic Claude (sonnet-4, haiku fallback) |
| AI - Image | fal.ai + Replicate |
| Auth | Clerk (kullanıcı yönetimi) |
| Scraping | Cheerio + Puppeteer Core |
| Queue/BG | Trigger.dev |
| DB | Supabase (PostgreSQL + Storage + RLS) |
| Cache | Upstash Redis |
| Monitoring | Langfuse (prompt versioning + A/B + cost) |
| Ödeme | Stripe |
| State | Zustand + TanStack Query |
| Validation | Zod + React Hook Form |

---

## Klasör Yapısı

> **Not:** Proje `src/` prefix kullanmaz. Tüm dosyalar kök dizindedir.

```
contentforge-tr/
├── CLAUDE.md                        # Bu dosya — AI context rehberi
├── architecture.md                  # Detaylı mimari dokümantasyon
├── design.md                        # Tasarım sistemi, UI akışları
├── promptengineering.md             # Prompt mühendisliği referansı
│
├── app/                             # Next.js App Router
│   ├── (marketing)/                 # Landing + Hakkımızda + Hizmetler + İletişim + Entegrasyonlar
│   ├── (auth)/                      # login + register
│   ├── (dashboard)/app/             # Ana uygulama
│   │   ├── generate/                # ✅ İçerik üreteci
│   │   ├── converter/               # 🔄 İçerik dönüştürücü
│   │   ├── analyzer/                # 🔄 İçerik analizörü
│   │   ├── image-studio/            # 📋 Görsel stüdyosu
│   │   ├── pricing/                 # 📋 Fiyat analizi
│   │   ├── inventory/               # 📋 Stok yönetimi
│   │   ├── bulk/                    # Toplu yükleme
│   │   ├── library/                 # Kütüphane / geçmiş
│   │   ├── dashboard/               # Dashboard
│   │   ├── settings/                # Ayarlar
│   │   └── workspaces/              # Workspace yönetimi
│   ├── api/
│   │   ├── generate/                # ✅ Tekil içerik üretimi (streaming)
│   │   ├── generations/             # ✅ Geçmiş listesi
│   │   ├── convert/                 # 🔄 İçerik dönüştürme
│   │   ├── analyze/                 # 🔄 İçerik analizi
│   │   ├── images/                  # 📋 Görsel işleme
│   │   ├── orchestrator/            # 📋 Merkezi yönlendirici
│   │   ├── agents/                  # 📋 Agent internal endpoints
│   │   │   ├── content/
│   │   │   ├── image/
│   │   │   ├── pricing/
│   │   │   └── inventory/
│   │   ├── billing/                 # ✅ Stripe checkout/portal
│   │   ├── categories/              # ✅ Kategori arama
│   │   ├── contact/                 # ✅ İletişim formu
│   │   └── webhooks/                # ✅ Clerk + Stripe webhooks
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                     # Landing page
│
├── agents/                          # Agent implementasyonları
│   ├── content/
│   │   ├── skills/                  # generate, analyze, convert, bulk
│   │   ├── tools/
│   │   ├── prompts/
│   │   └── types/
│   ├── image/
│   │   ├── skills/                  # bg-remove, studio-render, optimize, batch
│   │   ├── tools/
│   │   ├── prompts/
│   │   └── types/
│   ├── pricing/
│   │   ├── skills/                  # competitor, price-rec, margin, seasonal
│   │   ├── tools/
│   │   ├── prompts/
│   │   └── types/
│   ├── inventory/
│   │   ├── skills/                  # forecast, reorder, anomaly, seasonal
│   │   ├── tools/
│   │   ├── prompts/
│   │   └── types/
│   ├── pm/                          # Project Manager Agent
│   │   └── prompts/system.ts
│   ├── frontend/                    # Frontend Agent
│   │   └── prompts/system.ts
│   ├── backend/                     # Backend Agent
│   │   └── prompts/system.ts
│   ├── qa/                          # Quality Assurance Agent
│   │   └── prompts/system.ts
│   └── security/                    # Security Agent
│       └── prompts/system.ts
│
├── orchestrator/                    # Merkezi yönetici
│   ├── router.ts                    # Agent seçim mantığı
│   ├── executor.ts                  # Promise.allSettled paralel çalıştırma
│   ├── context.ts                   # Agentlar arası veri paylaşımı
│   └── types.ts                     # OrchestratorRequest/Response
│
├── components/                      # UI bileşenleri
│   ├── content/                     # İçerik modülü bileşenleri
│   ├── layout/                      # Sidebar, header, navigation
│   └── shared/                      # Ortak bileşenler
│
├── lib/                             # Servis istemcileri
│   ├── anthropic.ts                 # Claude API (streaming + fallback)
│   ├── supabase/server.ts           # Supabase server client
│   ├── redis.ts                     # Upstash Redis (cache + rate limit)
│   ├── langfuse.ts                  # Langfuse observability
│   ├── trigger.ts                   # Trigger.dev background jobs
│   ├── claude/                      # Claude yardımcıları
│   ├── prompts/platforms.ts         # Platform kuralları
│   ├── stripe/                      # Stripe yardımcıları
│   └── validations/                 # Zod şemaları
│
├── prompts/                         # Sistem prompt dosyaları
│   └── system.ts                    # 30+ platform kuralı (75KB)
│
├── hooks/                           # React hooks
│   └── useSettingsStore.ts          # Zustand ayarlar store
│
├── types/                           # TypeScript tip tanımları
│   └── global.ts                    # Platform, Agent, API, Kullanıcı tipleri
│
├── middleware.ts                     # Auth middleware (Clerk)
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Agent Kuralları

1. **Her agent izole çalışır** — sadece Orchestrator üzerinden iletişim kurabilir
2. **Her agent kendi klasöründe** `skills/`, `tools/`, `prompts/`, `types/` bulundurur
3. **Skill = tek sorumlu fonksiyon** (SRP prensibine uyar)
4. **Full Product Audit** = Tüm agentlar paralel çalışır → Birleşik rapor üretir

---

## Geliştirme Kuralları

- TypeScript strict mode — `any` yasak
- Tüm metinler ve yorumlar Türkçe
- Her API route Zod ile validate edilmeli
- Claude çağrıları streaming kullanmalı (Vercel AI SDK)
- Hata mesajları kullanıcıya Türkçe gösterilmeli
- RLS tüm Supabase tablolarında aktif olmalı
- Her skill için unit test yaz
- Langfuse ile tüm AI çağrılarını izle
- Redis cache: TTL 1 saat (content), 15 dk (fiyat), 24 saat (stok)
- Hata yönetimi: try/catch + fallback (haiku → sonnet)

---

## Sprint Planı & İlerleme

| Sprint | Kapsam | Durum |
|--------|--------|-------|
| 1-2 | Content Agent (Analyzer + Converter) | ✅ Tamamlandı |
| 3 | Image Agent (Image Studio) | ✅ Tamamlandı |
| 4 | Pricing Agent | 🔄 Sıradaki |
| 5 | Inventory Agent | 📋 Plan |
| 6 | Orchestrator + Full Audit | 📋 Plan |

### Tamamlanan Özellikler
- [x] `generate.skill.ts` — ürün açıklaması üretimi
- [x] `analyze.skill.ts` — içerik analizi
- [ ] `convert.skill.ts` — platform dönüştürme (devam ediyor)
- [ ] `bulk.skill.ts` — toplu işleme

### Sonraki Adımlar
1. Image Agent skills implementasyonu
2. Pricing Agent skills implementasyonu
3. Inventory Agent skills implementasyonu
4. Orchestrator router ve parallel executor

---

## Dokümantasyon

- Tasarım sistemi, kullanıcı akışları, ekranlar: @design.md
- Teknik mimari, DB şeması, API tasarımı: @architecture.md
- Prompt mühendisliği referansı: @promptengineering.md

