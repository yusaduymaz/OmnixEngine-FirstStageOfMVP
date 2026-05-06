-- ─────────────────────────────────────────────────────────────────────────
-- 00008 — Enterprise Team & Davet Sistemi
--
-- workspaces + workspace_members zaten var (00000). Bu migration:
--   1. workspace_members.role enum kontrolü genişletir (admin eklenir)
--   2. workspaces tablosuna paylaşımlı kredi havuzu sütunları ekler
--   3. team_invitations tablosunu oluşturur (email + token + expires_at)
--   4. Davet token üretmek için kısa yardımcı RPC ekler
-- ─────────────────────────────────────────────────────────────────────────

-- 1) workspace_members.role: owner | admin | editor | viewer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
     WHERE constraint_name = 'workspace_members_role_check'
  ) THEN
    ALTER TABLE workspace_members
      ADD CONSTRAINT workspace_members_role_check
      CHECK (role IN ('owner', 'admin', 'editor', 'viewer'));
  END IF;
END $$;

-- 2) workspaces — paylaşımlı mikro-kredi havuzu (enterprise)
ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS plan_owner_id  UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS credits_used   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_limit  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN workspaces.plan_owner_id IS
  'Workspace kredi havuzunun ait olduğu kullanıcı (genelde owner). Skill''lerde fallback için.';
COMMENT ON COLUMN workspaces.credits_used  IS 'Workspace düzeyinde tüketilen mikro-kredi (enterprise paylaşımlı havuz).';
COMMENT ON COLUMN workspaces.credits_limit IS 'Workspace mikro-kredi limiti (0 ise users.credits_limit fallback uygulanır).';

-- 3) Davet tablosu
CREATE TABLE IF NOT EXISTS team_invitations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  invited_by    UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  email         VARCHAR(320) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'editor'
                CHECK (role IN ('admin', 'editor', 'viewer')),
  token         VARCHAR(80)  NOT NULL UNIQUE,
  expires_at    TIMESTAMPTZ  NOT NULL,
  accepted_at   TIMESTAMPTZ,
  accepted_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  revoked_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_invitations_workspace ON team_invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email     ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token     ON team_invitations(token)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

COMMENT ON TABLE team_invitations IS
  'Workspace düzeyinde rol bazlı kullanıcı davetleri. Token ile e-posta üzerinden kabul edilir.';

-- 4) RLS — owner/admin görür, kabul/iptal edebilir
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "team_invites_member_read" ON team_invitations;
CREATE POLICY "team_invites_member_read" ON team_invitations
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
       WHERE user_id = auth.uid()
         AND role IN ('owner', 'admin')
    )
  );

-- Insert/update policy'leri yalnızca service-role kullanır;
-- bu yüzden RLS açık ama public policy yok (admin client by-pass eder).

-- 5) Yardımcı RPC: davet kabul (atomic)
CREATE OR REPLACE FUNCTION accept_team_invitation(invite_token TEXT, accepting_user UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inv  team_invitations%ROWTYPE;
BEGIN
  SELECT * INTO inv
    FROM team_invitations
   WHERE token = invite_token
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Davet bulunamadı';
  END IF;

  IF inv.accepted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Davet zaten kullanılmış';
  END IF;

  IF inv.revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'Davet iptal edilmiş';
  END IF;

  IF inv.expires_at < NOW() THEN
    RAISE EXCEPTION 'Davet süresi dolmuş';
  END IF;

  -- Üyeliği oluştur (varsa rolü güncelle)
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (inv.workspace_id, accepting_user, inv.role)
  ON CONFLICT (workspace_id, user_id) DO UPDATE
    SET role = EXCLUDED.role;

  -- Daveti işaretle
  UPDATE team_invitations
     SET accepted_at = NOW(),
         accepted_by = accepting_user
   WHERE id = inv.id;

  RETURN inv.workspace_id;
END $$;

COMMENT ON FUNCTION accept_team_invitation IS
  'Token doğrulayıp workspace_members''a ekler. Süresi dolmuş veya kullanılmış davetlerde reddeder.';
