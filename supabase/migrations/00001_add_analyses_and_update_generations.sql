-- Migration: 00001_add_analyses_and_update_generations.sql
-- Description: Adds missing columns to generations and creates the analyses table.

-- 1. generations tablosuna eksik kolonları ekleyelim
ALTER TABLE generations ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'generate';
ALTER TABLE generations ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS source_platform VARCHAR(50);
ALTER TABLE generations ADD COLUMN IF NOT EXISTS content_types VARCHAR(50)[];
ALTER TABLE generations ADD COLUMN IF NOT EXISTS credits_charged INTEGER DEFAULT 1;

-- 2. analyses tablosunu oluşturalım
CREATE TABLE IF NOT EXISTS analyses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  workspace_id      UUID REFERENCES workspaces(id),
  
  -- Input
  source_url        TEXT NOT NULL,
  source_platform   VARCHAR(50),
  target_platform   VARCHAR(50)[],
  
  -- Scrape edilen ham veri
  scraped_data      JSONB,
  
  -- Analiz sonuçları
  overall_score     SMALLINT CHECK(overall_score >= 0 AND overall_score <= 100),
  criteria_scores   JSONB NOT NULL,
  suggestions       JSONB,
  
  -- Meta
  credits_charged   INTEGER DEFAULT 1,
  analysis_ms       INTEGER,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS (Row Level Security)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar yalnızca kendi analizlerini görebilir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analyses' AND policyname = 'users_own_analyses'
  ) THEN
    CREATE POLICY "users_own_analyses" ON analyses FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;
