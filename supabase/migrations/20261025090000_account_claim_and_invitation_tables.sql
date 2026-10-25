-- #2255 (#506 slice b): account_claim_requests and legacy_account_invitations.
-- Contract: docs/security/identity-claim-tables.md.
-- PROTECTED AREA (tenant / donor PII). Schema only: no app code reads or
-- writes these tables yet; the claim (#509) and invitation (#510) flows will
-- write them server-side through service_role.
--
-- Rulings (Samson, Oct 24, 2026):
--   Q9   email_normalized is generated from public.normalize_email (#2254), so
--        it can't be written directly or drift. A blank email is rejected.
--   Q15  requested_by is the requester's auth.users id, auth.uid().
--   Q16  an invitation stores only a SHA-256 of the link token plus that
--        token's expiry, never the raw link, OTP or token.
--   OQ1/OQ2  authenticated is read-only: staff of the tenant read both tables,
--        a requester reads their own claim requests. No anon or PUBLIC access.
--
-- Requires 20261024140000 (#2254) for public.normalize_email. Roll this
-- migration back before #2254's: its generated columns depend on that
-- function. Rollback: rollback_20261025090000_account_claim_and_invitation_tables.sql.
--
-- Both tables are new and empty, so constraints are inline and indexes are
-- plain CREATE INDEX. Re-running the file changes nothing.

BEGIN;

-- 1. Claim requests: one request to claim a donor record.
CREATE TABLE IF NOT EXISTS public.account_claim_requests (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  donor_id UUID,
  email TEXT NOT NULL,
  email_normalized TEXT GENERATED ALWAYS AS (public.normalize_email(email)) STORED,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  match_type TEXT,
  match_confidence TEXT,
  reason TEXT,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT account_claim_requests_pkey PRIMARY KEY (tenant_id, id),
  CONSTRAINT account_claim_requests_donor_same_tenant_fk
    FOREIGN KEY (tenant_id, donor_id) REFERENCES public.donors (tenant_id, id),
  CONSTRAINT account_claim_requests_email_normalized_check
    CHECK (email_normalized IS NOT NULL),
  CONSTRAINT account_claim_requests_status_check
    CHECK (status IN ('pending', 'verified', 'approved', 'denied', 'expired'))
);

CREATE INDEX IF NOT EXISTS account_claim_requests_tenant_status_idx
  ON public.account_claim_requests (tenant_id, status);
CREATE INDEX IF NOT EXISTS account_claim_requests_tenant_email_normalized_idx
  ON public.account_claim_requests (tenant_id, email_normalized);
CREATE INDEX IF NOT EXISTS account_claim_requests_requested_by_idx
  ON public.account_claim_requests (requested_by)
  WHERE requested_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS account_claim_requests_tenant_donor_idx
  ON public.account_claim_requests (tenant_id, donor_id)
  WHERE donor_id IS NOT NULL;

COMMENT ON TABLE public.account_claim_requests IS
  'A request to claim a donor record. Tenant staff read their tenant''s rows; a requester reads rows where requested_by = auth.uid(). Writes are server-side only (#509). #2255.';
COMMENT ON COLUMN public.account_claim_requests.email_normalized IS
  'Generated: always public.normalize_email(email); never written directly. #2255.';
COMMENT ON COLUMN public.account_claim_requests.requested_by IS
  'The requester''s auth.users id, auth.uid() (Q15). #2255.';

-- 2. Legacy invitations: single-use, revocable, expiring, bound to one donor.
CREATE TABLE IF NOT EXISTS public.legacy_account_invitations (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL,
  email TEXT NOT NULL,
  email_normalized TEXT GENERATED ALWAYS AS (public.normalize_email(email)) STORED,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  link_token_sha256 BYTEA,
  link_token_expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'sent',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  revoked_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT legacy_account_invitations_pkey PRIMARY KEY (tenant_id, id),
  CONSTRAINT legacy_account_invitations_donor_same_tenant_fk
    FOREIGN KEY (tenant_id, donor_id) REFERENCES public.donors (tenant_id, id),
  CONSTRAINT legacy_account_invitations_email_normalized_check
    CHECK (email_normalized IS NOT NULL),
  CONSTRAINT legacy_account_invitations_status_check
    CHECK (status IN ('sent', 'accepted', 'expired', 'revoked')),
  -- A SHA-256 digest is exactly 32 bytes, so a raw link, OTP, hex token or
  -- Supabase hashed_token (28 bytes decoded) can't be stored here.
  CONSTRAINT legacy_account_invitations_link_token_sha256_length_check
    CHECK (octet_length(link_token_sha256) = 32),
  CONSTRAINT legacy_account_invitations_link_token_pair_check
    CHECK ((link_token_sha256 IS NULL) = (link_token_expires_at IS NULL))
);

CREATE INDEX IF NOT EXISTS legacy_account_invitations_tenant_status_idx
  ON public.legacy_account_invitations (tenant_id, status);
CREATE INDEX IF NOT EXISTS legacy_account_invitations_tenant_email_normalized_idx
  ON public.legacy_account_invitations (tenant_id, email_normalized);
CREATE INDEX IF NOT EXISTS legacy_account_invitations_tenant_donor_idx
  ON public.legacy_account_invitations (tenant_id, donor_id);
CREATE UNIQUE INDEX IF NOT EXISTS legacy_account_invitations_link_token_sha256_uidx
  ON public.legacy_account_invitations (link_token_sha256)
  WHERE link_token_sha256 IS NOT NULL;

COMMENT ON TABLE public.legacy_account_invitations IS
  'A single-use, revocable, expiring invitation for a legacy donor. Only tenant staff read it. Writes are server-side only (#510). #2255.';
COMMENT ON COLUMN public.legacy_account_invitations.email_normalized IS
  'Generated: always public.normalize_email(email); never written directly. #2255.';
COMMENT ON COLUMN public.legacy_account_invitations.link_token_sha256 IS
  'SHA-256 (32 bytes) of the exact link token the redemption endpoint receives. Never store the raw link, OTP, token or Supabase hashed_token here (Q16). #2255.';
COMMENT ON COLUMN public.legacy_account_invitations.link_token_expires_at IS
  'Expiry of the hashed link token; set if and only if link_token_sha256 is set. #2255.';

-- 3. Row level security: ENABLE + FORCE, SELECT-only policies.
ALTER TABLE public.account_claim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_claim_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_account_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_account_invitations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS account_claim_requests_staff_select ON public.account_claim_requests;
CREATE POLICY account_claim_requests_staff_select ON public.account_claim_requests
  FOR SELECT TO authenticated
  USING (authz.has_staff_membership(tenant_id, NULL));

DROP POLICY IF EXISTS account_claim_requests_requester_select ON public.account_claim_requests;
CREATE POLICY account_claim_requests_requester_select ON public.account_claim_requests
  FOR SELECT TO authenticated
  USING (requested_by = (SELECT auth.uid()));

DROP POLICY IF EXISTS legacy_account_invitations_staff_select ON public.legacy_account_invitations;
CREATE POLICY legacy_account_invitations_staff_select ON public.legacy_account_invitations
  FOR SELECT TO authenticated
  USING (authz.has_staff_membership(tenant_id, NULL));

-- 4. Grants. Revoke first: hosted Supabase gives new public tables default
-- grants to anon and authenticated.
REVOKE ALL ON TABLE public.account_claim_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.account_claim_requests TO authenticated;
GRANT ALL ON TABLE public.account_claim_requests TO service_role;

REVOKE ALL ON TABLE public.legacy_account_invitations FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.legacy_account_invitations TO authenticated;
GRANT ALL ON TABLE public.legacy_account_invitations TO service_role;

COMMIT;
