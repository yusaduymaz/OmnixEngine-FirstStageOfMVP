# architecture.md — İçerik Fabrikası (ContentForge TR)

> **Versiyon:** 1.0 — MVP  
> **Son güncelleme:** Nisan 2026  
> **Hedef ortam:** Production-ready, ölçeklenebilir, maliyet-optimize

---

## 1. Sistem Genel Görünümü

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│          Next.js 14 (App Router) — Vercel Edge              │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS / REST + SSE
┌──────────────────────▼──────────────────────────────────────┐
│                        API LAYER                            │
│              Next.js API Routes / Edge Functions            │
│         Auth (Clerk) │ Rate Limiting │ Input Validation      │
└───────┬──────────────┬──────────────────────────────────────┘
        │              │
┌───────▼──────┐ ┌─────▼──────────────────────────────────────┐
│  CLAUDE API  │ │              BACKGROUND JOBS               │
│  (Anthropic) │ │   Trigger.dev — Bulk content queues        │
│  claude-     │ └─────┬──────────────────────────────────────┘
│  sonnet-4    │       │
└──────────────┘ ┌─────▼──────────────────────────────────────┐
                 │              DATA LAYER                     │
                 │  PostgreSQL (Supabase) │ Redis (Upstash)    │
                 │  S3-compat (Supabase Storage)               │
                 └─────────────────────────────────────────────┘
                                │
                 ┌──────────────▼──────────────────────────────┐
                 │          EXTERNAL SERVICES                  │
                 │  Stripe │ Resend (email) │ PostHog (analytics)│
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
| File Storage | **Supabase Storage** | CSV upload, sonuç indirme |

### 2.3 AI Katmanı
| Bileşen | Seçim | Gerekçe |
|---|---|---|
| Model | **claude-sonnet-4** | Hız / kalite dengesi, maliyet kontrolü |
| SDK | **Anthropic SDK + Vercel AI SDK** | Streaming, tool use, structured output |
| Prompt Yönetimi | **Langfuse** | Prompt versiyonlama, A/B test, maliyet takibi |
| Fallback | Rate limit aşımında **claude-haiku-4-5** | Maliyet spike önleme |

### 2.4 Altyapı
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

-- İçerik üretimleri
CREATE TABLE generations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id),
  
  -- Input
  product_name    VARCHAR(500) NOT NULL,
  product_gtin    VARCHAR(50),
  category_path   VARCHAR(500),               -- "Giyim > Kadın > Elbise"
  platform        VARCHAR(50)[],              -- ['trendyol', 'hepsiburada']
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
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- JSONB results şeması (ör):
-- {
--   "titles": [
--     {"text": "...", "char_count": 72, "platform": "trendyol"},
--     {"text": "...", "char_count": 68, "platform": "trendyol"},
--     {"text": "...", "char_count": 75, "platform": "hepsiburada"}
--   ],
--   "description_long": "...",
--   "description_short": "...",
--   "ad_copies": [
--     {"headline": "...", "body": "...", "type": "meta"}
--   ],
--   "keywords_used": ["deri çanta", "kadın omuz çantası", ...]
-- }

-- Toplu iş takibi
CREATE TABLE bulk_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id),
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
  reference   VARCHAR(255),                   -- stripe payment intent id veya generation id
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- API anahtarları (Kurumsal plan)
CREATE TABLE api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255),
  key_hash    VARCHAR(255) UNIQUE NOT NULL,   -- SHA-256 hash
  prefix      VARCHAR(20),                    -- "cf_live_xxxx" — görüntüleme için
  last_used   TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT TRUE,
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
  platform      VARCHAR(50),                  -- 'trendyol' | 'hepsiburada'
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
```

---

## 4. API Tasarımı

### 4.1 Endpoint Listesi

```
POST   /api/generate          → Tekil içerik üretimi (streaming)
POST   /api/generate/bulk     → Toplu iş başlat
GET    /api/generate/bulk/:id → Toplu iş durumu
GET    /api/generations       → Geçmiş listesi (sayfalı)
GET    /api/generations/:id   → Tekil kayıt
DELETE /api/generations/:id   → Sil

GET    /api/categories        → Trendyol kategori ağacı
GET    /api/categories/search → Kategori arama

GET    /api/workspaces        → Workspace listesi
POST   /api/workspaces        → Yeni workspace
PATCH  /api/workspaces/:id    → Güncelle

GET    /api/user/credits      → Kredi durumu
GET    /api/user/transactions → İşlem geçmişi

POST   /api/billing/checkout  → Stripe checkout session
POST   /api/billing/portal    → Stripe customer portal
POST   /api/webhooks/stripe   → Stripe webhook handler

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
  "platforms": ["trendyol", "hepsiburada"],
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

### 4.3 Rate Limiting

| Plan | Tekil / dakika | Toplu / gün |
|---|---|---|
| Trial | 5 | 0 |
| Starter | 20 | 100 |
| Growth | 60 | 1.000 |
| Agency | 120 | 10.000 |
| Enterprise | Özel | Özel |

Uygulama: **Upstash Redis** sliding window algoritması

---

## 5. Claude API Entegrasyonu

### 5.1 Prompt Mimarisi

```
System Prompt (sabit + dinamik)
  ├── Rol tanımı (Türkçe e-ticaret içerik uzmanı)
  ├── Platform kuralları (Trendyol başlık: maks 100 karakter vb.)
  ├── SEO kuralları (kategori bazlı anahtar kelimeler inject)
  ├── Ton kılavuzu (dinamik — seçilen tona göre)
  └── Output formatı (JSON Schema)

User Message
  ├── Ürün bilgileri
  ├── Ekstra anahtar kelimeler
  └── Workspace brand voice (varsa)
```

### 5.2 Trendyol Platform Kuralları (Prompt'a Inject Edilir)

```typescript
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

### 5.3 Structured Output Şeması

```typescript
const GenerationSchema = z.object({
  titles: z.array(z.object({
    text: z.string().max(100),
    platform: z.enum(['trendyol', 'hepsiburada', 'both']),
    seo_keywords_used: z.array(z.string())
  })).min(2).max(3),
  
  description_long: z.string().min(200).max(3000),
  description_short: z.string().min(50).max(300),
  
  ad_copies: z.array(z.object({
    headline: z.string().max(40),
    body: z.string().max(125),
    type: z.enum(['meta', 'google'])
  })).optional(),
  
  all_keywords_used: z.array(z.string()),
  seo_score: z.number().min(0).max(100)
});
```

### 5.4 Maliyet Tahmini & Optimizasyon

| Plan | Aylık üretim | Tahmini Claude maliyeti |
|---|---|---|
| Trial (50 kullanıcı) | 2.500 | ~$3 |
| Starter | 600/kullanıcı | ~$0.36/kullanıcı |
| Growth | 2.000/kullanıcı | ~$1.20/kullanıcı |
| Agency | 20.000/kullanıcı | ~$12/kullanıcı |

**Optimizasyon taktikleri:**
- Haiku'ya düş: basit başlık-only üretimler için
- Prompt caching: System prompt sabit kısmı cache (Anthropic %90 indirim)
- Output token sınırı: 800 token (yeterli, israf yok)
- Rate limit aşımında graceful downgrade (haiku fallback)

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
- API anahtarları: SHA-256 hash, prefix görüntüleme (`cf_live_xxxx`)

### 7.2 Input Güvenliği
```typescript
// Her üretim isteğinde:
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

### 7.4 Veri Gizliliği
- Kullanıcı ürün verileri başka kullanıcıların prompt'larına asla karışmaz
- Anthropic'in API kullanım koşullarına uygun (veri eğitim için kullanılmaz)
- KVKK uyumu: Veri silme talebi → kullanıcı + tüm generations silinebilir

---

## 8. Abonelik & Kredi Sistemi

### 8.1 Plan Yapısı

| Plan | Aylık Ücret | Kredi | Özellikler |
|---|---|---|---|
| Trial | Ücretsiz | 50 (tek seferlik) | Tekil üretim, 1 platform |
| Starter | ₺299 | 500/ay | 2 platform, kütüphane |
| Growth | ₺799 | 2.000/ay | Toplu yükleme, API erişimi |
| Agency | ₺2.499 | 10.000/ay | Workspace, öncelikli destek |
| Enterprise | Özel | Özel | SLA, özel entegrasyon |

Ek kredi paketi: 100 kredi = ₺49 (tek seferlik)

### 8.2 Stripe Entegrasyon Akışı

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
    category: request.category_id
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
main          → production (vercel.com)
staging       → staging (staging.contentforge.tr)
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

# App
NEXT_PUBLIC_APP_URL=
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
    }
  },
  "regions": ["fra1"]
}
```

> Frankfurt seçildi: Türkiye'ye en yakın Vercel bölgesi, düşük gecikme süresi.

---

## 12. MVP Geliştirme Takvimi

### Phase 1 — MVP (6 Hafta)

| Hafta | Kapsam |
|---|---|
| 1 | Proje kurulumu, auth (Clerk), temel DB şeması, Supabase setup |
| 2 | Kategori tablosu doldurma, prompt mühendisliği, Claude API entegrasyonu |
| 3 | Tekil üretim UI + streaming response |
| 4 | Kütüphane, geçmiş, SEO skoru hesaplama |
| 5 | Stripe entegrasyonu, kredi sistemi, billing sayfası |
| 6 | Landing page, bug fix, staging → production |

### Phase 2 — Growth (4 Hafta Sonra)

- Toplu yükleme (Trigger.dev)
- Workspace / Ajans planı
- Langfuse A/B test altyapısı
- Hepsiburada'ya özgü kural seti
- Mobile PWA optimizasyonu

### Phase 3 — Enterprise (3 Ay Sonra)

- Public API (rate limited, API key auth)
- Trendyol satıcı OAuth → otomatik ürün import
- PIM webhook entegrasyonu
- Özel model fine-tuning (kategoriye özgü Türkçe SEO)

---

## 13. İzleme & Alarm Eşikleri

| Metrik | Uyarı | Kritik |
|---|---|---|
| API hata oranı | > %2 | > %5 |
| P95 üretim süresi | > 10 sn | > 20 sn |
| Claude API timeout | > %1 | > %3 |
| Kredi fraud anomali | 10x normal kullanım | — |
| DB bağlantı havuzu | > %70 | > %90 |

**Araçlar:** Sentry (hata alertleri) + Vercel Analytics + Langfuse dashboard

---

## 14. Gelecekteki Ölçeklenme Notları

- Kullanıcı tabanı 10.000+ olduğunda: Supabase → dedicated Postgres (Neon veya RDS)
- Claude maliyeti kritik olduğunda: Fine-tuned Türkçe model (Mistral veya Llama tabanlı)
- Kurumsal kanalda büyüme olursa: Trendyol Entegre Çözüm Ortağı programı başvurusu
- Global genişleme: Etsy / Amazon.de için Almanca modül (prompt + kural seti modüler tasarlandı)