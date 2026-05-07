-- Support tickets tablosu
-- Kullanıcıların destek taleplerini yönetmek için

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,

  -- Ticket bilgileri
  category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'billing', 'feature', 'bug', 'account', 'other')),
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,

  -- Dosya eki (Supabase Storage)
  attachment_path VARCHAR(500),
  attachment_name VARCHAR(255),
  attachment_size INTEGER,
  attachment_type VARCHAR(100),

  -- Ek bilgiler
  page_url VARCHAR(500),
  browser_info JSONB,

  -- Durum
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,

  -- Admin yanıtı
  admin_response TEXT,
  responded_by UUID REFERENCES users(id),
  responded_at TIMESTAMPTZ,

  -- Email bildirimi gönderildi mi?
  admin_notified BOOLEAN DEFAULT FALSE,
  user_notified BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi ticketlarını görebilir
CREATE POLICY "users_own_tickets" ON support_tickets
  FOR SELECT USING (user_id = auth.uid());

-- Kullanıcılar yeni ticket oluşturabilir
CREATE POLICY "users_create_tickets" ON support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Adminler tüm ticketları görebilir ve güncelleyebilir
CREATE POLICY "admins_all_tickets" ON support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Indexler
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_is_read ON support_tickets(is_read);
CREATE INDEX idx_support_tickets_created ON support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();

-- Yorum: Supabase Storage için 'support-attachments' bucket'ı manuel oluşturulmalı
-- Bucket ayarları:
--   - Public: false
--   - Max file size: 10MB
--   - Allowed MIME types: image/*, application/pdf
--   - Path pattern: {user_id}/{ticket_id}/{filename}
