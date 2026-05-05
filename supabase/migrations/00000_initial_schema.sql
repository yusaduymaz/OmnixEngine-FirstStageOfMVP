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
  results         JSONB,                      -- yapılandırılmış çıktı
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

-- İçerik Analiz Geçmişi ✨ YENİ
CREATE TABLE analyses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  workspace_id      UUID REFERENCES workspaces(id),
  
  -- Input
  source_url        TEXT NOT NULL,                  -- Analiz edilen ürünün URL'si
  source_platform   VARCHAR(50),                    -- URL'den algılanan platform
  target_platform   VARCHAR(50)[],                  -- Hangi platformların kurallarına göre analiz edildi
  
  -- Scrape edilen ham veri
  scraped_data      JSONB,                          -- {"title": "...", "description": "...", "content": "..."}
  
  -- Analiz sonuçları
  overall_score     SMALLINT CHECK(overall_score >= 0 AND overall_score <= 100),
  criteria_scores   JSONB NOT NULL,                 -- Kriter bazlı puanlar
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
