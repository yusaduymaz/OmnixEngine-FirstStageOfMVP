-- Kredi işlem geçmişi
CREATE TABLE credit_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,               -- pozitif = ekleme, negatif = kullanım
  type        VARCHAR(50) NOT NULL,           -- subscription | purchase | usage | refund
  module      VARCHAR(50),                    -- generate | convert | analyze | image | admin
  reference   VARCHAR(255),                  -- stripe payment intent id veya generation id
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Kullanıcı yalnızca kendi kayıtlarını görebilir
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_credit_transactions" ON credit_transactions
  FOR ALL USING (user_id = (
    SELECT id FROM users WHERE clerk_id = auth.uid()::text
  ));

-- Admin için service role bypass (RLS dışı)
-- Service role key ile oluşturulan client RLS'i otomatik bypass eder

-- İndeks: Kullanıcı bazlı hızlı sorgular için
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
