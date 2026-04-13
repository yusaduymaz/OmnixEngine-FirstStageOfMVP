# architecture.md — OmniX Engine

> **Versiyon:** 2.0 — Omnichannel Global  
> **Son güncelleme:** Nisan 2026  
> **Hedef ortam:** Production-ready, ölçeklenebilir, maliyet-optimize

---

## 1. Sistem Genel Görünümü

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│           Next.js 14 (App Router) — Vercel Edge                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS / REST + SSE
┌──────────────────────▼──────────────────────────────────────────┐
│                         API LAYER                               │
│              Next.js API Routes / Edge Functions                │
│         Auth (Clerk) │ Rate Limiting │ Input Validation          │
└───────┬──────────────┬──────────────┬───────────────────────────┘
        │              │              │
┌───────▼──────┐ ┌─────▼──────┐ ┌────▼──────────────────────────┐
│  TEXT AI     │ │ VISUAL AI  │ │   SCRAPING & URL EXTRACTION   │
│  Claude API  │ │ fal.ai /   │ │   Cheerio │ Puppeteer Core    │
│  (Anthropic) │ │ Replicate  │ │   Apify (ölçekli alternatif)  │
│  claude-     │ │ Background │ │   SSRF korumalı proxy         │
│  sonnet-4    │ │ Removal +  │ │                               │
│              │ │ Studio Ren.│ │                               │
└──────────────┘ └────────────┘ └────┬──────────────────────────┘
                                     │
                 ┌───────────────────▼──────────────────────────┐
                 │              BACKGROUND JOBS                 │
                 │   Trigger.dev — Bulk queues, image pipeline  │
                 └───────────────────┬──────────────────────────┘
                                     │
                 ┌───────────────────▼──────────────────────────┐
                 │              DATA LAYER                      │
                 │  PostgreSQL (Supabase) │ Redis (Upstash)     │
                 │  S3-compat (Supabase Storage) — görseller    │
                 └───────────────────┬──────────────────────────┘
                                     │
                 ┌───────────────────▼──────────────────────────┐
                 │          EXTERNAL SERVICES                   │
                 │  Stripe │ Resend │ PostHog │ Langfuse        │
                 └─────────────────────────────────────────────┘
```

---

## 2. Tech Stack Kararları

### 2.1 Frontend
| Teknoloji | Seçim | Gerekçe |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR/SSG esnekliği, Edge Functions, Vercel synergisi |
| UI Library | **shadcn/ui** + Tailwind CSS | Özelleştirilebilir, bundle bloat yok |
| State | **Zustand** | Sade, context hell olmadan global state |
| Data Fetching | **TanStack Query** | Cache, optimistic updates, infinite scroll |
| Forms | **React Hook Form** + Zod | Type-safe validasyon |
| Streaming | **Vercel AI SDK** | Claude streaming response'ları UI'a seamless aktarır |
| Animations | **Framer Motion** | Mikro-etkileşimler, sayfa geçişleri |

### 2.2 Backend
| Teknoloji | Seçim | Gerekçe |
|---|---|---|
| Runtime | **Next.js API Routes** + Edge | Monorepo avantajı, cold start minimum |
| Auth | **Clerk** | Türk telefon numarası doğrulama, sosyal login, MFA hazır |
| Database | **Supabase (PostgreSQL)** | Gerçek zamanlı, RLS, Türkiye yakın EU-West region |
| Cache / Queue | **Upstash Redis** | Serverless uyumlu, rate limiting, job queue |
| Background Jobs | **Trigger.dev** | Toplu üretim kuyruğu, retry logic, observable |
| Email | **Resend** | Transactional email, Türkçe şablon desteği |
| File Storage | **Supabase Storage** | CSV upload, görsel depolama, sonuç indirme |

### 2.3 AI Katmanı — Metin
| Bileşen | Seçim | Gerekçe |
|---|---|---|
| Model | **claude-sonnet-4** | Hız / kalite dengesi, maliyet kontrolü |
| SDK | **Anthropic SDK + Vercel AI SDK** | Streaming, tool use, structured output |
| Prompt Yönetimi | **Langfuse** | Prompt versiyonlama, A/B test, maliyet takibi |
| Fallback | Rate limit aşımında **claude-haiku-4-5** | Maliyet spike önleme |

### 2.4 AI Katmanı — Görsel ✨ YENİ
| Bileşen | Seçim | Gerekçe |
|---|---|---|
| Background Removal | **fal.ai** (`fal-ai/birefnet`) | API tabanlı, düşük gecikmeli, serverless uyumlu |
| Stüdyo Render | **Replicate** (`stability-ai/stable-diffusion-img2img`) | Arka plan oluşturma, gölge/ışık ekleme |
| Görsel Optimizasyon | **sharp** (Node.js) | Resize, format dönüşümü (WebP), sıkıştırma |
| Fallback | fal.ai down ise → **Replicate** background removal modeli | Yedeklilik |

### 2.5 Web Scraping & URL Ayrıştırma ✨ YENİ
| Bileşen | Seçim | Gerekçe |
|---|---|---|
| Lightweight HTML Parse | **Cheerio** | Sunucu taraflı DOM parsing, hızlı, hafif |
| JS-Rendered Sayfalar | **Puppeteer Core** (Chromium headless) | SPA/React tabanlı e-ticaret sitelerini render eder |
| Ölçeklenebilir Alternatif | **Apify** (Phase 3) | Rate limit/ban yönetimi, proxy havuzu |
| HTML → Clean Text | **Turndown** + custom sanitizers | Ham HTML'i yapılandırılmış temiz metne dönüştürme |
| SSRF Koruması | URL whitelist + private IP bloklama | Güvenli scraping proxy katmanı |

### 2.6 Altyapı
| Bileşen | Seçim |
|---|---|
| Hosting | **Vercel** (Pro) |
| CI/CD | **GitHub Actions** → Vercel auto-deploy |
| Monitoring | **Sentry** (hata) + **PostHog** (product analytics) |
| Billing | **Stripe** (ödeme) + Stripe Billing (abonelik) |
| DNS / CDN | Vercel Edge Network |

---

## 3. Veritabanı Şeması

### 3.1 Core Tablolar

```sql
-- Kullanıcılar (Clerk ile sync)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id      VARCHAR(255) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  full_name     VARCHAR(255),
  plan          VARCHAR(50) DEFAULT 'trial',  -- trial | starter | growth | agency | enterprise
  credits_used  INTEGER DEFAULT 0,
  credits_limit INTEGER DEFAULT 50,           -- trial: 50 üretim
  stripe_customer_id VARCHAR(255),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace (Ajans planı için çoklu müşteri)
CREATE TABLE workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,           -- "Müşteri: Ayakkabı Dünyası"
  brand_voice JSONB,                           -- ton tercihleri, yasaklı kelimeler
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace üyelikleri
CREATE TABLE workspace_members (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  role         VARCHAR(50) DEFAULT 'editor',  -- owner | editor | viewer
  PRIMARY KEY (workspace_id, user_id)
);

-- İçerik üretimleri (generate + convert çıktıları)
CREATE TABLE generations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id),
  
  -- Kaynak tipi (üretim mi dönüştürme mi?)
  source_type     VARCHAR(50) DEFAULT 'generate',  -- 'generate' | 'convert'
  source_url      TEXT,                            -- convert modunda: kaynak URL
  source_platform VARCHAR(50),                     -- convert modunda: kaynak platform
  
  -- Input
  product_name    VARCHAR(500) NOT NULL,
  product_gtin    VARCHAR(50),
  category_path   VARCHAR(500),               -- "Giyim > Kadın > Elbise"
  platform        VARCHAR(50)[],              -- ['trendyol', 'hepsiburada', 'amazon_us']
  content_types   VARCHAR(50)[],              -- ['title', 'description', 'ad_copy']
  tone            VARCHAR(50) DEFAULT 'professional',
  extra_keywords  TEXT[],                     -- kullanıcının eklemek istediği kelimeler
  
  -- Output
  results         JSONB,                      -- yapılandırılmış çıktı (aşağıda)
  seo_score       SMALLINT,                   -- 0–100
  tokens_used     INTEGER,
  model_used      VARCHAR(100),
  generation_ms   INTEGER,                    -- üretim süresi (ms)
  
  -- Meta
  status          VARCHAR(50) DEFAULT 'completed', -- processing | completed | failed
  is_bulk         BOOLEAN DEFAULT FALSE,
  bulk_job_id     UUID,
  credits_charged INTEGER DEFAULT 1,          -- bu işlem için harcanan kredi
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- JSONB results şeması (ör):
-- {
--   "titles": [
--     {"text": "...", "char_count": 72, "platform": "trendyol", "variant": "A"},
--     {"text": "...", "char_count": 68, "platform": "trendyol", "variant": "B"},
--     {"text": "...", "char_count": 75, "platform": "amazon_us", "variant": "A"}
--   ],
--   "description_long": "...",
--   "description_short": "...",
--   "ad_copies": [
--     {"headline": "...", "body": "...", "platform": "trendyol"}
--   ],
--   "amazon_bullet_points": ["...", "..."],
--   "keywords_used": ["deri çanta", "kadın omuz çantası", ...],
--   "seo_compliance_notes": "..."
-- }

-- İçerik Analiz Geçmişi ✨ YENİ
CREATE TABLE analyses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  workspace_id      UUID REFERENCES workspaces(id),
  
  -- Input
  source_url        TEXT NOT NULL,                  -- Analiz edilen ürünün URL'si
  source_platform   VARCHAR(50),                    -- URL'den algılanan platform
  target_platform   VARCHAR(50) NOT NULL,           -- Hangi platformun kurallarına göre analiz edildi
  
  -- Scrape edilen ham veri
  scraped_data      JSONB,                          -- {"title": "...", "description": "...", "images": [...]}
  
  -- Analiz sonuçları
  overall_score     SMALLINT CHECK(overall_score >= 0 AND overall_score <= 100),
  criteria_scores   JSONB NOT NULL,                 -- Kriter bazlı puanlar
  -- {
  --   "title_quality":    {"score": 85, "status": "pass", "message": "Uzunluk optimum"},
  --   "description_depth": {"score": 45, "status": "warn", "message": "300 kelime altında"},
  --   "keyword_density":   {"score": 20, "status": "fail", "message": "Ana anahtar kelime eksik"},
  --   "legal_compliance":  {"score": 100, "status": "pass", "message": "Sorun tespit edilmedi"},
  --   "platform_specific": {"score": 60, "status": "warn", "message": "Bullet point eksik"}
  -- }
  suggestions       JSONB,                          -- AI tarafından oluşturulan iyileştirme önerileri dizisi
  
  -- Meta
  credits_charged   INTEGER DEFAULT 1,
  analysis_ms       INTEGER,                        -- analiz süresi (ms)
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Görsel Stüdyo Kayıtları ✨ YENİ
CREATE TABLE images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id),
  
  -- Dosya referansları (Supabase Storage yolları)
  original_path   TEXT NOT NULL,                    -- "images/{user_id}/original/{uuid}.jpg"
  processed_path  TEXT,                             -- "images/{user_id}/processed/{uuid}.webp"
  storage_bucket  VARCHAR(100) DEFAULT 'product-images',
  
  -- İşleme ayarları
  settings        JSONB NOT NULL DEFAULT '{}',
  -- {
  --   "background": "#FFFFFF",
  --   "size": "1080x1080",
  --   "shadow": true,
  --   "reflection": false,
  --   "light_correction": true,
  --   "preset": "trendyol"
  -- }
  
  -- Sonuç meta
  original_size_bytes   INTEGER,
  processed_size_bytes  INTEGER,
  processing_time_ms    INTEGER,
  ai_model_used         VARCHAR(100),               -- "fal-ai/birefnet" | "replicate/..."
  
  -- Meta
  status          VARCHAR(50) DEFAULT 'processing', -- uploading | processing | completed | failed
  error_message   TEXT,
  credits_charged INTEGER DEFAULT 3,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Toplu iş takibi
CREATE TABLE bulk_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id),
  job_type        VARCHAR(50) DEFAULT 'generate',  -- 'generate' | 'convert' | 'analyze' | 'image'
  file_path       VARCHAR(500),               -- Supabase Storage URL
  total_items     INTEGER,
  completed_items INTEGER DEFAULT 0,
  failed_items    INTEGER DEFAULT 0,
  status          VARCHAR(50) DEFAULT 'queued', -- queued | processing | completed | failed
  result_file_url VARCHAR(500),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

-- Kredi işlem geçmişi
CREATE TABLE credit_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,               -- pozitif = ekleme, negatif = kullanım
  type        VARCHAR(50),                    -- subscription | purchase | usage | refund
  module      VARCHAR(50),                    -- generate | convert | analyze | image
  reference   VARCHAR(255),                   -- stripe payment intent id veya generation/analysis/image id
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- API anahtarları (Kurumsal plan)
CREATE TABLE api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255),
  key_hash    VARCHAR(255) UNIQUE NOT NULL,   -- SHA-256 hash
  prefix      VARCHAR(20),                    -- "ox_live_xxxx" — görüntüleme için
  last_used   TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Evrensel Kategori Sistemi
CREATE TABLE universal_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  path        VARCHAR(1000),                  -- "Giyim > Kadın > Elbise"
  level       SMALLINT,                       -- 1 | 2 | 3
  is_leaf     BOOLEAN DEFAULT FALSE
);

-- Platform kategori eşleştirmesi (universal_category_id -> platform_category_path)
CREATE TABLE platform_category_mapping (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id VARCHAR(50) NOT NULL,           -- "trendyol" | "hepsiburada" | "amazon_us" | ...
  universal_category_id UUID REFERENCES universal_categories(id) ON DELETE CASCADE,
  platform_category_path VARCHAR(1000) NOT NULL, -- platform'a özel kategori yolu
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trendyol Kategori Ağacı (statik, haftada bir sync) 
CREATE TABLE trendyol_categories (
  id          INTEGER PRIMARY KEY,
  parent_id   INTEGER REFERENCES trendyol_categories(id),
  name        VARCHAR(255) NOT NULL,
  path        VARCHAR(1000),                  -- "Giyim > Kadın > Elbise"
  level       SMALLINT,                       -- 1 | 2 | 3
  is_leaf     BOOLEAN DEFAULT FALSE
);

-- SEO Anahtar Kelime Veritabanı (kategori bazlı)
CREATE TABLE seo_keywords (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   INTEGER REFERENCES trendyol_categories(id),
  keyword       VARCHAR(500) NOT NULL,
  search_volume VARCHAR(50),                  -- "high" | "medium" | "low"
  platform      VARCHAR(50),                  -- 'trendyol' | 'hepsiburada' | 'amazon_tr'
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Row Level Security (RLS)

```sql
-- Kullanıcılar yalnızca kendi verilerini görebilir
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_generations" ON generations
  FOR ALL USING (user_id = auth.uid());

-- Workspace erişimi üyeliğe göre
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace_member_access" ON workspaces
  FOR ALL USING (
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- Analizler: Kullanıcı yalnızca kendi analizlerini görebilir ✨ YENİ
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_analyses" ON analyses
  FOR ALL USING (user_id = auth.uid());

-- Görseller: Kullanıcı yalnızca kendi görsellerini görebilir ✨ YENİ
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_images" ON images
  FOR ALL USING (user_id = auth.uid());

-- Supabase Storage bucket policy ✨ YENİ
-- product-images bucket: Kullanıcı yalnızca kendi klasörüne okuma/yazma yapabilir
-- Path: images/{user_id}/original/* ve images/{user_id}/processed/*
```

---

## 4. API Tasarımı

> Shopify/WooCommerce gibi sistemlerin webhook'larını dinleyebilecek (örn: "Shopify'da yeni ürün açıldı, başlığını AI ile doldur") bir endpoint vizyonu eklenmiştir.

### 4.1 Endpoint Listesi

```
═══════════════════════════════════════════════════════
İÇERİK ÜRETİMİ (Mevcut)
═══════════════════════════════════════════════════════
POST   /api/generate          → Tekil içerik üretimi (streaming)
POST   /api/generate/bulk     → Toplu iş başlat
GET    /api/generate/bulk/:id → Toplu iş durumu
GET    /api/generations       → Geçmiş listesi (sayfalı)
GET    /api/generations/:id   → Tekil kayıt
DELETE /api/generations/:id   → Sil

═══════════════════════════════════════════════════════
İÇERİK DÖNÜŞTÜRÜCÜ ✨ YENİ
═══════════════════════════════════════════════════════
POST   /api/convert           → URL/metin girdisi → hedef platformlara dönüştürülmüş içerik
                                 (scrape + AI rewrite, streaming response)

═══════════════════════════════════════════════════════
İÇERİK ANALİZÖRÜ ✨ YENİ
═══════════════════════════════════════════════════════
POST   /api/analyze           → URL girdisi → skor + kriter değerlendirmesi + öneriler
POST   /api/analyze/fix       → Analiz sonucunu AI ile düzelt → /api/generate akışına yönlendir
GET    /api/analyses          → Analiz geçmişi (sayfalı)
GET    /api/analyses/:id      → Tekil analiz detayı
DELETE /api/analyses/:id      → Analiz sil

═══════════════════════════════════════════════════════
GÖRSEL STÜDYOSU ✨ YENİ
═══════════════════════════════════════════════════════
POST   /api/images/upload     → Supabase Storage'a ham görsel yükle (signed URL döner)
POST   /api/images/process    → Yüklenen görseli AI ile işle (bg removal + render)
GET    /api/images            → Kullanıcının görsel geçmişi (sayfalı)
GET    /api/images/:id        → Tekil görsel detayı + download URL'leri
DELETE /api/images/:id        → Görsel ve Storage dosyalarını sil

═══════════════════════════════════════════════════════
KATEGORİ & DÖNÜŞÜM (Mevcut)
═══════════════════════════════════════════════════════
GET    /api/categories        → Evrensel kategori ağacı
GET    /api/categories/search → Kategori arama

═══════════════════════════════════════════════════════
WORKSPACE (Mevcut)
═══════════════════════════════════════════════════════
GET    /api/workspaces        → Workspace listesi
POST   /api/workspaces        → Yeni workspace
PATCH  /api/workspaces/:id    → Güncelle

═══════════════════════════════════════════════════════
KULLANICI & KREDİ (Mevcut)
═══════════════════════════════════════════════════════
GET    /api/user/credits      → Kredi durumu
GET    /api/user/transactions → İşlem geçmişi

═══════════════════════════════════════════════════════
BİLLİNG (Mevcut)
═══════════════════════════════════════════════════════
POST   /api/billing/checkout  → Stripe checkout session
POST   /api/billing/portal    → Stripe customer portal
POST   /api/webhooks/stripe   → Stripe webhook handler

═══════════════════════════════════════════════════════
PLATFORM WEBHOOK'LARI (Phase 3)
═══════════════════════════════════════════════════════
POST   /api/webhooks/shopify      → Shopify yeni ürün → otomatik içerik üret
POST   /api/webhooks/woocommerce  → WooCommerce yeni ürün → otomatik içerik üret

═══════════════════════════════════════════════════════
API ANAHTARLARI (Mevcut)
═══════════════════════════════════════════════════════
GET    /api/keys              → API anahtarları (Kurumsal)
POST   /api/keys              → Yeni anahtar oluştur
DELETE /api/keys/:id          → Anahtar sil
```

### 4.2 Tekil Üretim — Request/Response

**Request:**
```json
POST /api/generate
{
  "product_name": "Deri Omuz Çantası Kahverengi",
  "category_id": 1234,
  "platforms": ["trendyol", "amazon_us", "shopify"],
  "content_types": ["title", "description", "ad_copy"],
  "tone": "professional",
  "extra_keywords": ["el yapımı", "doğal deri"],
  "workspace_id": "uuid-optional"
}
```

**Response (SSE streaming):**
```
data: {"type":"start","generation_id":"uuid"}
data: {"type":"delta","field":"titles","content":"Deri Omuz..."}
data: {"type":"delta","field":"description_long","content":"..."}
data: {"type":"complete","seo_score":82,"tokens_used":1240,"generation_ms":3200}
```

### 4.3 İçerik Dönüştürücü — Request/Response ✨ YENİ

**Request:**
```json
POST /api/convert
{
  "source": "https://www.trendyol.com/x/y-p-123456",
  "source_type": "url",
  "target_platforms": ["amazon_us", "shopify"],
  "tone": "professional",
  "workspace_id": "uuid-optional"
}
```

**veya metin modunda:**
```json
POST /api/convert
{
  "source": "Kadın Deri Omuz Çantası, el yapımı, hakiki dana derisi...",
  "source_type": "text",
  "source_platform": "trendyol",
  "target_platforms": ["amazon_us"],
  "tone": "professional"
}
```

**Response (SSE streaming):**
```
data: {"type":"scraping","message":"İçerik çekiliyor..."}
data: {"type":"scraped","source_data":{"title":"...","description":"...","platform":"trendyol"}}
data: {"type":"start","generation_id":"uuid"}
data: {"type":"delta","field":"titles","content":"..."}
data: {"type":"complete","seo_score":78,"tokens_used":1800,"credits_charged":2}
```

### 4.4 İçerik Analizörü — Request/Response ✨ YENİ

**Request:**
```json
POST /api/analyze
{
  "url": "https://www.trendyol.com/x/y-p-123456",
  "target_platform": "trendyol"
}
```

**Response:**
```json
{
  "analysis_id": "uuid",
  "source_url": "https://...",
  "target_platform": "trendyol",
  "overall_score": 62,
  "criteria_scores": {
    "title_quality": {
      "score": 85,
      "status": "pass",
      "current_value": "Kadın Deri Omuz Çantası Kahverengi El Yapımı",
      "message": "Başlık uzunluğu optimum aralıkta (72 karakter).",
      "suggestion": null
    },
    "description_depth": {
      "score": 35,
      "status": "fail",
      "current_value": "210 kelime",
      "message": "Açıklama 400 kelime altında — Trendyol algoritması cezalandırır.",
      "suggestion": "Açıklamaya teknik özellikler tablosu ve kullanım senaryoları ekleyin."
    },
    "keyword_density": {
      "score": 50,
      "status": "warn",
      "message": "Ana anahtar kelime ('deri omuz çantası') açıklamada sadece 1 kez geçiyor.",
      "suggestion": "Morfolojik varyantlarla birlikte 3-5 kez doğal şekilde dağıtın."
    },
    "legal_compliance": {
      "score": 70,
      "status": "warn",
      "message": "Hayvansal menşeli malzeme belirtilmiş ama tür açıklanmamış.",
      "suggestion": "'Deri' yerine 'Hakiki Dana Derisi' veya 'PU Deri (Vegan)' gibi net ifade kullanın."
    },
    "platform_rules": {
      "score": 90,
      "status": "pass",
      "message": "Trendyol başlık limiti ve format kurallarına uygun.",
      "suggestion": null
    }
  },
  "credits_charged": 1,
  "analysis_ms": 4200
}
```

### 4.5 Görsel Stüdyosu — Request/Response ✨ YENİ

**Upload:**
```json
POST /api/images/upload
Content-Type: multipart/form-data

file: <binary>
```
```json
Response: {
  "image_id": "uuid",
  "original_path": "images/user123/original/uuid.jpg",
  "original_size_bytes": 4200000,
  "status": "uploaded"
}
```

**İşleme:**
```json
POST /api/images/process
{
  "image_id": "uuid",
  "settings": {
    "background": "#FFFFFF",
    "size": "1080x1080",
    "shadow": true,
    "reflection": false,
    "light_correction": true,
    "preset": "trendyol"
  }
}
```
```json
Response: {
  "image_id": "uuid",
  "status": "completed",
  "processed_path": "images/user123/processed/uuid.webp",
  "processed_size_bytes": 680000,
  "processing_time_ms": 8500,
  "download_url": "https://....supabase.co/storage/v1/object/sign/...",
  "credits_charged": 3
}
```

### 4.6 Rate Limiting

| Plan | Tekil / dakika | Toplu / gün | Görsel / gün |
|---|---|---|---|
| Trial | 5 | 0 | 3 |
| Starter | 20 | 100 | 20 |
| Growth | 60 | 1.000 | 100 |
| Agency | 120 | 10.000 | 500 |
| Enterprise | Özel | Özel | Özel |

Uygulama: **Upstash Redis** sliding window algoritması

---

## 5. Claude API Entegrasyonu

### 5.1 Prompt Mimarisi

```
System Prompt (sabit + dinamik)
  ├── Rol tanımı (Omnichannel e-ticaret içerik uzmanı)
  ├── Platform kuralları (system.ts — PLATFORM_ALGORITHM_RULES)
  ├── SEO kuralları (kategori bazlı anahtar kelimeler inject)
  ├── Ton kılavuzu (dinamik — seçilen tona göre)
  ├── Yasal uyumluluk modülü
  ├── Dönüşüm psikolojisi modülü
  ├── Güvenlik katmanı (prompt injection önleme)
  └── Output formatı (JSON Schema)

User Message
  ├── Ürün bilgileri (<product_data> XML bloğu)
  ├── Ekstra anahtar kelimeler
  └── Workspace brand voice (varsa)
```

### 5.2 Dönüştürücü Prompt Stratejisi ✨ YENİ

```
[Scrape edilen veri] 
    → Cheerio/Puppeteer ile çek
    → HTML arındır, JSON normalize et
    → <product_data> bloğuna yerleştir
    → Ek talimat: "Bu içerik {kaynak_platform} formatında yazılmış. 
       Bunu {hedef_platform} kurallarına göre yeniden yaz."
    → buildSystemPrompt() ile hedef platform kuralları inject
    → Claude API çağrısı (streaming)
```

### 5.3 Analizör Prompt Stratejisi ✨ YENİ

```
[Scrape edilen mevcut içerik]
    → JSON normalize et  
    → system.ts PLATFORM_ALGORITHM_RULES ile karşılaştır
    → Claude'a görev: "Bu içeriği analiz et ve şu JSON şemasında skor + öneri üret"
    → Skor hesaplama ağırlıkları:
        Başlık kalitesi:       20%
        Açıklama derinliği:    20%
        Anahtar kelime yoğ.:   20%
        Yasal uyumluluk:       15%
        Platform spesifik:     25%
```

### 5.4 Platform Kuralları (system.ts Referansı)

`system.ts` içinde tam olarak tanımlanmış 30+ platform kuralı mevcuttur:
```typescript
// system.ts'ten — Trendyol kuralları örneği
const TRENDYOL_RULES = {
  title: {
    maxLength: 100,
    forbidden: ['!', '?', 'En Ucuz', 'Bedava', 'ÜCRETSİZ'],
    required: ['marka/model/tip', 'ana özellik', 'renk/boyut'],
    seoPattern: '[Kategori Kelimesi] + [Özellik] + [Marka/Model]'
  },
  description: {
    minLength: 200,
    maxLength: 3000,
    structure: ['Ürün tanımı', 'Özellikler listesi', 'Kullanım alanı', 'Bakım talimatı']
  }
};
```

### 5.5 Structured Output Şeması

```typescript
const GenerationSchema = z.object({
  titles: z.array(z.object({
    text: z.string(),
    platform: z.string(),     // PlatformId
    char_count: z.number(),
    variant: z.enum(['A', 'B']),
    seo_keywords_used: z.array(z.string())
  })).min(2),
  
  description_long: z.string().min(200),
  description_short: z.string().min(50).max(300),
  
  ad_copies: z.array(z.object({
    headline: z.string().max(40),
    body: z.string().max(125),
    platform: z.string()
  })),

  amazon_bullet_points: z.array(z.string()).optional(),
  product_condition_note: z.string().optional(),
  
  keywords_used: z.array(z.string()),
  seo_score: z.number().min(0).max(100),
  seo_compliance_notes: z.string()
});
```

### 5.6 Maliyet Tahmini & Optimizasyon

| Plan | Aylık üretim | Tahmini Claude maliyeti |
|---|---|---|
| Trial (50 kullanıcı) | 2.500 | ~$3 |
| Starter | 600/kullanıcı | ~$0.36/kullanıcı |
| Growth | 2.000/kullanıcı | ~$1.20/kullanıcı |
| Agency | 20.000/kullanıcı | ~$12/kullanıcı |

> Not: Dönüştürücü ve Analizör, scraping + daha uzun prompt gerektirdiğinden tekil üretimden ~%50 daha fazla token harcar. Görsel Stüdyo Claude değil fal.ai/Replicate kullandığından ayrı maliyet kalemi.

**Optimizasyon taktikleri:**
- Haiku'ya düş: basit başlık-only üretimler için
- Prompt caching: System prompt sabit kısmı cache (Anthropic %90 indirim)
- Output token sınırı: 800 token (yeterli, israf yok)
- Rate limit aşımında graceful downgrade (haiku fallback)
- Analizör: Basit kural kontrolleri (karakter sayısı, pattern match) Claude çağırmadan önce yapılır — gereksiz API çağrısı önlenir

---

## 6. Toplu Yükleme Akışı

```
[Kullanıcı CSV yükler]
        ↓
[Supabase Storage'a kaydet]
        ↓
[bulk_jobs kaydı oluştur]
        ↓
[Trigger.dev job'ı tetikle]
        ↓
[Job: Her satır için]
  ├── Kredi kontrolü
  ├── Rate limit kontrolü  
  ├── Claude API çağrısı
  ├── Sonucu generations tablosuna kaydet
  ├── bulk_jobs.completed_items++
  └── Gerçek zamanlı Supabase Realtime güncelleme
        ↓
[Tüm satırlar bitince]
  ├── Sonuç CSV'si oluştur → Supabase Storage
  ├── bulk_jobs.status = 'completed'
  └── Resend ile e-posta bildirimi gönder
```

**Hata yönetimi:**
- Her satır 3 kez retry (exponential backoff)
- Kısmi başarı desteklenir (80/100 başarılı → indirme açılır)
- Başarısız satırlar ayrı CSV'de gösterilir

---

## 7. Güvenlik Mimarisi

### 7.1 Authentication & Authorization
- **Clerk** JWT → Her API isteğinde doğrulama
- **RLS** (Supabase) → Veritabanı seviyesinde izolasyon
- **RBAC:** owner / editor / viewer workspace rolleri
- API anahtarları: SHA-256 hash, prefix görüntüleme (`ox_live_xxxx`)

### 7.2 Input Güvenliği
```typescript
// Her üretim/dönüştürme/analiz isteğinde:
1. Zod validasyon (tip + uzunluk + enum)
2. Zararlı içerik filtresi (prompt injection önleme)
3. Kredi kontrolü (atomik Redis transaction)
4. Rate limit kontrolü (sliding window)
5. Sanitize (HTML encoding — XSS önleme)
```

### 7.3 Claude API Güvenliği
- API key yalnızca sunucu tarafında, env variable'da
- Kullanıcı girdisi direkt system prompt'a inject edilmez
- Prompt injection pattern'leri tespit ve reject edilir:
  ```
  Yasaklı patternler: "Ignore previous instructions", 
  "Act as", "DAN", "JAILBREAK" vb.
  ```

### 7.4 Scraping Güvenliği ✨ YENİ
- **SSRF Önleme:** Scraping endpointlerinde URL validation:
  - Private IP aralıkları bloklu (10.x, 172.16.x, 192.168.x, 127.x, ::1)
  - Localhost ve internal DNS isimleri bloklu
  - Sadece HTTP/HTTPS protokolü izinli
  - URL redirect zinciri max 3 adım
- **Rate limiting:** Aynı domain'e art arda fazla istek atılmasını önle (site ban riski)
- **User-Agent:** Tanımlı ve saygılı bot header'ı (`OmniXBot/1.0`)
- **robots.txt:** Opsiyonel kontrol (scraping öncesi robots.txt denetimi)

### 7.5 Görsel Güvenliği ✨ YENİ
- **Dosya tipi kontrolü:** Magic bytes doğrulama (sadece JPEG/PNG/WebP)
- **Dosya boyutu:** Max 10MB
- **Storage izolasyonu:** Supabase Storage bucket RLS — her kullanıcı kendi klasörüne erişir
- **NSFW filtreleme:** fal.ai safety check (gelecek: özel moderation webhook)
- **Geçici dosya temizliği:** İşlenmiş görsellerin orijinalleri 30 gün sonra otomatik silinir (isteğe bağlı)

### 7.6 Veri Gizliliği
- Kullanıcı ürün verileri başka kullanıcıların prompt'larına asla karışmaz
- Anthropic'in API kullanım koşullarına uygun (veri eğitim için kullanılmaz)
- KVKK uyumu: Veri silme talebi → kullanıcı + tüm generations/analyses/images silinebilir

---

## 8. Abonelik & Kredi Sistemi

### 8.1 Plan Yapısı

| Plan | Aylık Ücret | Kredi | Özellikler |
|---|---|---|---|
| Trial | Ücretsiz | 50 (tek seferlik) | Tekil üretim + analiz, 2 platform, 3 görsel |
| Starter | ₺299 | 500/ay | Tüm modüller, 5 platform, kütüphane |
| Growth | ₺799 | 2.000/ay | Toplu yükleme, API erişimi, sınırsız platform |
| Agency | ₺2.499 | 10.000/ay | Workspace, öncelikli destek |
| Enterprise | Özel | Özel | SLA, özel entegrasyon, webhook |

Ek kredi paketi: 100 kredi = ₺49 (tek seferlik)

### 8.2 Kredi Harcama Modeli ✨ YENİ

| İşlem | Kredi Harcaması | Gerekçe |
|---|---|---|
| Tekil içerik üretimi | **1 kredi** | Tek Claude çağrısı |
| İçerik dönüştürme (URL) | **2 kredi** | Scraping + Claude rewrite |
| İçerik dönüştürme (metin) | **1 kredi** | Sadece Claude rewrite |
| İçerik analizi | **1 kredi** | Scraping + hafif Claude analiz |
| Görsel işleme (AI bg removal) | **3 kredi** | fal.ai/Replicate API maliyeti yüksek |
| Toplu iş (her satır) | **1 kredi/satır** | Standart üretim maliyeti |

### 8.3 Stripe Entegrasyon Akışı

```
[Plan seç] → [Stripe Checkout Session aç]
          → [Stripe webhook: payment.succeeded]
          → [credit_transactions kaydı oluştur]
          → [users.credits_limit güncelle]
          → [Resend ile onay emaili]

[İptal] → [Stripe webhook: subscription.deleted]
        → [Plan → 'trial', limit düşür]
        → [Kullanıcıya bilgi emaili]
```

---

## 9. Langfuse — Prompt Yönetimi & Observability

```typescript
// Her Claude çağrısında:
const trace = langfuse.trace({
  name: "content-generation",
  userId: user.id,
  metadata: {
    plan: user.plan,
    platform: request.platforms,
    content_types: request.content_types,
    category: request.category_id,
    module: "generate" | "convert" | "analyze"  // ✨ Modül takibi
  }
});

const generation = trace.generation({
  name: "claude-generation",
  model: "claude-sonnet-4",
  input: messages,
  output: response,
  usage: { input: tokens_in, output: tokens_out }
});
```

**Langfuse ile izlenecekler:**
- Prompt versiyon A/B testleri (hangi prompt daha yüksek SEO skoru üretiyor?)
- Kategori bazlı kalite skoru dağılımı
- Token kullanım trendleri → maliyet optimizasyon
- Hata oranları (model failures, timeout vb.)
- **Modül bazlı metrikler:** Generate vs Convert vs Analyze performans karşılaştırması ✨

---

## 10. Trendyol Kategori Senkronizasyonu

```typescript
// Haftalık cron job (Trigger.dev)
async function syncTrendyolCategories() {
  // 1. Trendyol'un public kategori API'sinden çek
  // 2. Diff hesapla (yeni / değişen / silinen)
  // 3. PostgreSQL'i güncelle
  // 4. Redis cache'i invalidate et
  // 5. Langfuse'a log gönder
}
```

> **Not:** Trendyol'un resmi satıcı API'si mevcut (partner.trendyol.com). Kategori ağacı public endpoint üzerinden çekilebilir. Ürün verisi çekimi için satıcı OAuth entegrasyonu Phase 2'ye bırakılmıştır.

---

## 11. Deployment & Ortamlar

### 11.1 Branch Stratejisi
```
main          → production (omnixengine.com)
staging       → staging (staging.omnixengine.com)
feature/*     → preview deployments (otomatik)
```

### 11.2 Environment Variables

```bash
# Claude
ANTHROPIC_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Trigger.dev
TRIGGER_API_KEY=

# Langfuse
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=

# Resend
RESEND_API_KEY=

# Görsel AI ✨ YENİ
FAL_AI_API_KEY=
REPLICATE_API_TOKEN=

# App
NEXT_PUBLIC_APP_URL=https://omnixengine.com
```

### 11.3 Vercel Yapılandırması

```json
{
  "functions": {
    "app/api/generate/route.ts": {
      "maxDuration": 30
    },
    "app/api/generate/bulk/route.ts": {
      "maxDuration": 60
    },
    "app/api/convert/route.ts": {
      "maxDuration": 45
    },
    "app/api/analyze/route.ts": {
      "maxDuration": 45
    },
    "app/api/images/process/route.ts": {
      "maxDuration": 60
    }
  },
  "regions": ["fra1"]
}
```

> Frankfurt seçildi: Türkiye'ye en yakın Vercel bölgesi, düşük gecikme süresi.

---

## 12. MVP Geliştirme Takvimi

### Phase 1 — MVP Core (6 Hafta)

| Hafta | Kapsam |
|---|---|
| 1 | Proje kurulumu, auth (Clerk), temel DB şeması, Supabase setup |
| 2 | Kategori tablosu doldurma, prompt mühendisliği, Claude API entegrasyonu |
| 3 | Tekil üretim UI + streaming response |
| 4 | Kütüphane, geçmiş, SEO skoru hesaplama |
| 5 | Stripe entegrasyonu, kredi sistemi, billing sayfası |
| 6 | Landing page, bug fix, staging → production |

### Phase 2 — Omnichannel & Growth (Hafta 7–12)

| Hafta | Kapsam |
|---|---|
| 7 | İçerik Analizörü: Scraping katmanı (Cheerio + Puppeteer), URL parse, SSRF koruması |
| 8 | İçerik Analizörü: Claude entegrasyonu, skor hesaplama, AnalysisReportCard UI |
| 9 | İçerik Dönüştürücü: Scraping reuse + Claude rewrite akışı, PlatformConverterSelector UI |
| 10 | Toplu yükleme (Trigger.dev), bulk jobs UI |
| 11 | Workspace / Ajans planı, marka ses profili |
| 12 | Langfuse A/B test altyapısı, modül bazlı metrikler |

### Phase 3 — Görsel & Enterprise (3+ Ay Sonra)

- Akıllı Görsel Stüdyosu: fal.ai entegrasyonu, ImageUploader + BeforeAfterViewer UI
- Supabase Storage görsel pipeline (upload → process → serve)
- Public API (rate limited, API key auth)
- Trendyol satıcı OAuth → otomatik ürün import
- PIM webhook entegrasyonu (Shopify, WooCommerce)
- Shopify App Store Entegrasyonu (Uygulama olarak listelenme)
- WooCommerce Eklentisi
- Amazon Avrupa (DE, UK, FR) ve Etsy entegrasyonu (Çoklu dil)
- Özel model fine-tuning (kategoriye özgü Türkçe SEO)
- Mobile PWA optimizasyonu

---

## 13. İzleme & Alarm Eşikleri

| Metrik | Uyarı | Kritik |
|---|---|---|
| API hata oranı | > %2 | > %5 |
| P95 üretim süresi | > 10 sn | > 20 sn |
| Claude API timeout | > %1 | > %3 |
| Kredi fraud anomali | 10x normal kullanım | — |
| DB bağlantı havuzu | > %70 | > %90 |
| Scraping başarısızlık oranı | > %10 | > %25 |
| Görsel işleme süresi (P95) | > 15 sn | > 30 sn |
| fal.ai / Replicate uptime | < %99 | < %95 |
| Supabase Storage kullanımı | > %70 quota | > %90 quota |

**Araçlar:** Sentry (hata alertleri) + Vercel Analytics + Langfuse dashboard

---

## 14. Gelecekteki Ölçeklenme Notları

- Kullanıcı tabanı 10.000+ olduğunda: Supabase → dedicated Postgres (Neon veya RDS)
- Claude maliyeti kritik olduğunda: Fine-tuned Türkçe model (Mistral veya Llama tabanlı)
- Kurumsal kanalda büyüme olursa: Trendyol Entegre Çözüm Ortağı programı başvurusu
- Global genişleme: Etsy / Amazon.de için Almanca modül (prompt + kural seti modüler tasarlandı)
- Görsel trafiği artınca: Supabase Storage → Cloudflare R2 veya AWS S3 + CloudFront CDN
- Scraping ölçeği büyüyünce: Self-hosted Puppeteer → Apify veya Browserless.io managed service
- Görsel AI maliyeti düşünce: fal.ai → self-hosted ONNX modeller (Vercel Edge'de çalışması mümkün)
- Multi-region: fra1 + iad1 (US kullanıcıları için) dual-region deployment