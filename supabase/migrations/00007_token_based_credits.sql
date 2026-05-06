-- ─────────────────────────────────────────────────────────────────────────
-- 00007 — Token-bazlı (mikro-kredi) muhasebesi
--
-- Önceki modelde 1 AI çağrısı = 1 sabit kredi tüketiyordu. Bu, gerçek
-- token maliyetiyle uyumlu değildi. Yeni modelde users.credits_used /
-- credits_limit alanları MİKRO-KREDİ cinsinden ifade edilir
-- (1 USD ≈ 200 mikro-kredi).
--
-- Bu migration:
--   1. credit_transactions tablosuna token + maliyet sütunları ekler
--   2. mevcut users.credits_used / credits_limit değerlerini 1.000x ölçeklendirir
--      (mikro-krediye taşır)
--   3. increment_credits RPC'sini parametreli hale getirir (sabit 1 yerine
--      çağıran skill'in hesapladığı miktar)
-- ─────────────────────────────────────────────────────────────────────────

-- 1) credit_transactions: token + cost sütunları
ALTER TABLE credit_transactions
  ADD COLUMN IF NOT EXISTS tokens_input  INTEGER,
  ADD COLUMN IF NOT EXISTS tokens_output INTEGER,
  ADD COLUMN IF NOT EXISTS model         VARCHAR(80),
  ADD COLUMN IF NOT EXISTS cost_usd      NUMERIC(10, 6);

COMMENT ON COLUMN credit_transactions.tokens_input  IS 'AI çağrısında kullanılan input token sayısı';
COMMENT ON COLUMN credit_transactions.tokens_output IS 'AI çağrısında üretilen output token sayısı';
COMMENT ON COLUMN credit_transactions.model         IS 'Çağrı yapılan model (claude-sonnet-4 vb.)';
COMMENT ON COLUMN credit_transactions.cost_usd      IS 'Brüt USD maliyet (margin öncesi, audit için)';

-- 2) Mevcut bakiyeleri mikro-krediye taşı (sadece bir kere çalışmalı — guard ile)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'billing.micro_credits_migrated_at') THEN
    UPDATE users
       SET credits_used  = COALESCE(credits_used, 0)  * 5000,
           credits_limit = COALESCE(credits_limit, 50) * 5000;
    -- 50 → 250.000 (trial), 500 → 2.500.000 (starter), vb.
    -- Eski 1 kredi ≈ 1 generate ≈ ~5.000 mikro-kredi karşılığı (margin dahil
    -- tipik sonnet generate maliyeti).

    INSERT INTO site_settings (key, value)
    VALUES (
      'billing.micro_credits_migrated_at',
      to_jsonb(NOW()::text)
    );
  END IF;
END $$;

-- 3) Atomic mikro-kredi tüketim RPC'si — parametreli amount
DROP FUNCTION IF EXISTS increment_credits(UUID);
DROP FUNCTION IF EXISTS increment_credits(UUID, INTEGER);

CREATE OR REPLACE FUNCTION increment_credits(user_uuid UUID, amount INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_used INTEGER;
BEGIN
  IF amount IS NULL OR amount < 0 THEN
    RAISE EXCEPTION 'increment_credits: amount must be non-negative';
  END IF;

  UPDATE users
     SET credits_used = credits_used + amount,
         updated_at   = NOW()
   WHERE id = user_uuid
   RETURNING credits_used INTO new_used;

  RETURN new_used;
END $$;

COMMENT ON FUNCTION increment_credits(UUID, INTEGER) IS
  'Atomic mikro-kredi tüketimi. Skill seviyesinde token maliyetinden hesaplanan miktar geçirilir.';

-- 4) Yardımcı: kullanıcının kredi yeterliliğini kontrol et (pre-flight)
CREATE OR REPLACE FUNCTION has_sufficient_credits(user_uuid UUID, required INTEGER)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT (credits_limit - credits_used) >= required
    FROM users
   WHERE id = user_uuid;
$$;

COMMENT ON FUNCTION has_sufficient_credits IS
  'Pre-flight kontrol: kullanıcı bu işlem için yeterli mikro-krediye sahip mi?';
