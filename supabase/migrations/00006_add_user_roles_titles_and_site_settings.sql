-- ============================================================
-- 00006: Kullanıcı rolleri, unvanlar, genişletilmiş profil
--        ve admin tarafından yönetilen site içerikleri
-- ============================================================

-- Users tablosuna rol ve genişletilmiş profil alanları
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role            VARCHAR(20)  DEFAULT 'member',  -- 'admin' | 'member'
  ADD COLUMN IF NOT EXISTS title           VARCHAR(120),                   -- Kullanıcı unvanı (E-ticaret Yöneticisi vb.)
  ADD COLUMN IF NOT EXISTS phone           VARCHAR(40),
  ADD COLUMN IF NOT EXISTS company         VARCHAR(255),
  ADD COLUMN IF NOT EXISTS website         VARCHAR(255),
  ADD COLUMN IF NOT EXISTS about           TEXT,
  ADD COLUMN IF NOT EXISTS notify_product  BOOLEAN     DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_campaign BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS notify_security BOOLEAN     DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS suspended       BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS suspended_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at      TIMESTAMPTZ;

-- Role check
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'member'));

-- Plan check (mevcut planları zorlamak için)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE users
  ADD CONSTRAINT users_plan_check CHECK (plan IN ('trial', 'starter', 'growth', 'agency', 'enterprise'));

CREATE INDEX IF NOT EXISTS idx_users_role     ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_plan     ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_deleted  ON users(deleted_at);

-- ============================================================
-- Site içerik ayarları (landing page, marketing copy vb.)
-- Admin panelinden anahtar/değer şeklinde yönetilir
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key         VARCHAR(120) PRIMARY KEY,
  value       JSONB        NOT NULL,
  description TEXT,
  updated_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_public_read"  ON site_settings;
DROP POLICY IF EXISTS "site_settings_admin_write"  ON site_settings;

-- Herkes okuyabilir (landing page için)
CREATE POLICY "site_settings_public_read" ON site_settings
  FOR SELECT USING (true);

-- Sadece servis rolü (admin API) yazabilir — uygulama tarafında kontrol edilir
-- (RLS write izni yok; service_role bypass eder)

-- ============================================================
-- Varsayılan landing içerik tohumlaması
-- ============================================================
INSERT INTO site_settings (key, value, description) VALUES
  ('landing.hero', '{
    "title": "Tüm pazaryerleri için tek motor: OmniX Engine",
    "subtitle": "Trendyol, Hepsiburada, Amazon, Shopify, Etsy ve dahası — SEO odaklı içerik, akıllı analiz ve profesyonel görsel üretimini tek panelden yönetin.",
    "ctaPrimary": "Ücretsiz Dene",
    "ctaSecondary": "Demoyu Gör"
  }'::jsonb, 'Landing hero alanı'),
  ('landing.pricing', '{
    "headline": "Ölçeğinize uygun bir plan seçin",
    "subline": "İhtiyacınız büyüdükçe yükseltin, istediğiniz zaman iptal edin."
  }'::jsonb, 'Landing fiyatlandırma başlığı'),
  ('marketing.banner', '{"enabled": false, "message": "", "ctaHref": "", "ctaLabel": ""}'::jsonb, 'Üst banner mesajı')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION set_users_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_users_updated_at();

CREATE OR REPLACE FUNCTION set_site_settings_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_site_settings_updated_at();

-- ============================================================
-- Mevcut admin kullanıcısını yükselt (env'deki Clerk ID)
-- Bu satır .env.local'deki ADMIN_USER_IDS değerini referans alır
-- ============================================================
UPDATE users
SET
  role          = 'admin',
  plan          = 'enterprise',
  credits_limit = GREATEST(credits_limit, 999999),
  title         = COALESCE(title, 'Sistem Yöneticisi')
WHERE clerk_id = 'user_3BzXtmkpU4F7THi5I2rVDQ41lrZ';
