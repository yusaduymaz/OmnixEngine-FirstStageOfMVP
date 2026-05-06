-- Denetim Raporları Tablosu (Full Audit Geçmişi)
CREATE TABLE IF NOT EXISTS audits (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Ürün Temel Bilgileri
  product_name      VARCHAR(500) NOT NULL,
  product_price     DECIMAL(10,2),
  product_url       TEXT,
  currency          VARCHAR(10) DEFAULT 'TRY',
  
  -- İlişkili Analizlerin ID'leri (Hangi analizden türetildi?)
  analysis_id       UUID REFERENCES analyses(id) ON DELETE SET NULL,
  pricing_id        UUID REFERENCES pricing_analyses(id) ON DELETE SET NULL,
  inventory_id      UUID REFERENCES inventory_reports(id) ON DELETE SET NULL,
  
  -- Özet Veriler (Hızlı listeleme için)
  seo_score         SMALLINT,
  pricing_score     SMALLINT,
  inventory_status  VARCHAR(50),
  
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Ayarları
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_audits" ON audits
  FOR ALL USING (user_id = auth.uid());

-- Indexler
CREATE INDEX idx_audits_user_id ON audits(user_id);
CREATE INDEX idx_audits_created_at ON audits(created_at);
