-- OmniX Engine — Inventory Agent Schema Migration
-- Sprint 5: Akıllı Stok Yönetimi ve Tahminleme

CREATE TABLE IF NOT EXISTS inventory_reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  workspace_id      UUID REFERENCES workspaces(id),
  
  -- Ürün Kimliği
  product_name      TEXT NOT NULL,
  sku               VARCHAR(100),
  
  -- Stok Durumu
  current_stock     INTEGER NOT NULL DEFAULT 0,
  min_stock_level   INTEGER NOT NULL DEFAULT 10, -- Kritik eşik
  
  -- Tahminleme Verileri
  daily_sales_avg   NUMERIC(10, 2) DEFAULT 0,
  days_to_stockout  INTEGER, -- AI tarafından hesaplanan gün sayısı
  
  -- Sağlık Durumu
  -- 'healthy' (bol), 'warning' (azalıyor), 'critical' (tükenmek üzere), 'out_of_stock' (bitti)
  stock_health      VARCHAR(20) DEFAULT 'healthy',
  
  -- AI Önerileri (JSONB)
  -- Yapı: { "restock_amount": 100, "restock_date": "2024-05-20", "priority": "high", "reason": "..." }
  recommendation    JSONB DEFAULT '{}'::jsonb,
  ai_insights       TEXT,
  
  -- Meta Veriler
  credits_charged   INTEGER DEFAULT 1,
  analysis_ms       INTEGER,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Politikaları
ALTER TABLE inventory_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_inventory" ON inventory_reports 
  FOR ALL USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text LIMIT 1));

-- Admin erişimi
CREATE POLICY "service_role_manage_inventory" ON inventory_reports
  FOR ALL USING (true)
  WITH CHECK (true);

-- İndeksler
CREATE INDEX idx_inventory_user_id ON inventory_reports(user_id);
CREATE INDEX idx_inventory_health ON inventory_reports(stock_health);
CREATE INDEX idx_inventory_created_at ON inventory_reports(created_at DESC);
