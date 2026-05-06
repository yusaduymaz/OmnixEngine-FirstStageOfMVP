-- OmniX Engine — Pricing Agent Schema Migration
-- Sprint 4: Fiyat Analizi ve Marj Yönetimi

CREATE TABLE IF NOT EXISTS pricing_analyses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  workspace_id      UUID REFERENCES workspaces(id),
  
  -- Ürün Bilgileri
  product_name      TEXT NOT NULL,
  source_url        TEXT,
  base_price        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency          VARCHAR(3) DEFAULT 'TRY',
  
  -- Rakip Verileri (JSONB)
  -- Yapı: [{ "platform": "trendyol", "price": 299.90, "url": "...", "seller": "X", "in_stock": true }]
  competitors       JSONB DEFAULT '[]'::jsonb,
  
  -- Marj ve Komisyon Analizi (JSONB)
  -- Yapı: { "commission_rate": 0.15, "shipping_cost": 45.00, "tax_rate": 0.20, "net_profit": 50.00, "margin": 0.18 }
  margin_analysis   JSONB DEFAULT '{}'::jsonb,
  
  -- AI Önerileri
  suggested_price   NUMERIC(12, 2),
  market_position   VARCHAR(50), -- 'cheaper', 'average', 'expensive'
  ai_feedback       TEXT,
  
  -- Meta Veriler
  credits_charged   INTEGER DEFAULT 1,
  analysis_ms       INTEGER,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Politikaları
ALTER TABLE pricing_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_pricing" ON pricing_analyses 
  FOR ALL USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text LIMIT 1));

-- Admin erişimi (Analizleri okuyabilmesi için)
CREATE POLICY "service_role_manage_pricing" ON pricing_analyses
  FOR ALL USING (true)
  WITH CHECK (true);

-- İndeksler
CREATE INDEX idx_pricing_user_id ON pricing_analyses(user_id);
CREATE INDEX idx_pricing_created_at ON pricing_analyses(created_at DESC);
