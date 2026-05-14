DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_link_entity_type') THEN
    CREATE TYPE public.crm_link_entity_type AS ENUM (
      'supabase_auth_user',
      'asym_profile',
      'tenant_membership',
      'crm_person',
      'donor_profile',
      'missionary_profile',
      'cms_public_entity',
      'stripe_customer',
      'fund_or_project',
      'pledge_or_relationship_commitment',
      'payment_record',
      'receipt_record',
      'refund_record',
      'statement_record',
      'reconciliation_record'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_link_status') THEN
    CREATE TYPE public.crm_link_status AS ENUM (
      'active',
      'suspected_duplicate',
      'merged',
      'archived',
      'rejected'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_duplicate_confidence') THEN
    CREATE TYPE public.crm_duplicate_confidence AS ENUM (
      'low',
      'medium',
      'high'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_merge_candidate_status') THEN
    CREATE TYPE public.crm_merge_candidate_status AS ENUM (
      'pending',
      'approved',
      'rejected',
      'merged',
      'superseded'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_projection_target_surface') THEN
    CREATE TYPE public.crm_projection_target_surface AS ENUM (
      'mission_control',
      'donor',
      'missionary',
      'public',
      'cms'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crm_projection_sync_status') THEN
    CREATE TYPE public.crm_projection_sync_status AS ENUM (
      'pending',
      'synced',
      'stale',
      'failed',
      'disabled'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.crm_record_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  crm_provider TEXT NOT NULL DEFAULT 'twenty' CHECK (crm_provider = 'twenty'),
  twenty_object_name TEXT NOT NULL,
  twenty_record_id TEXT NOT NULL,
  asym_entity_type public.crm_link_entity_type NOT NULL,
  asym_entity_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL DEFAULT 'represents',
  link_status public.crm_link_status NOT NULL DEFAULT 'active',
  confidence NUMERIC(5,4) NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
  verified_at TIMESTAMPTZ,
  verified_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_seen_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.crm_record_links IS
  'Tenant-scoped links between Asym identity concepts and Twenty CRM records. Supports repair, replay, and rollback without treating distinct identities as the same row.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_record_links_unique_entity
  ON public.crm_record_links (
    tenant_id,
    crm_provider,
    asym_entity_type,
    asym_entity_id,
    twenty_object_name
  )
  WHERE link_status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_record_links_unique_twenty_record
  ON public.crm_record_links (
    tenant_id,
    crm_provider,
    twenty_object_name,
    twenty_record_id,
    asym_entity_type,
    asym_entity_id
  );

CREATE INDEX IF NOT EXISTS idx_crm_record_links_twenty_record
  ON public.crm_record_links (
    tenant_id,
    crm_provider,
    twenty_object_name,
    twenty_record_id
  );

CREATE INDEX IF NOT EXISTS idx_crm_record_links_entity
  ON public.crm_record_links (tenant_id, asym_entity_type, asym_entity_id);

CREATE TABLE IF NOT EXISTS public.crm_merge_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  crm_provider TEXT NOT NULL DEFAULT 'twenty' CHECK (crm_provider = 'twenty'),
  source_entity_type public.crm_link_entity_type NOT NULL,
  source_entity_id TEXT NOT NULL,
  candidate_twenty_object_name TEXT NOT NULL,
  candidate_twenty_record_id TEXT NOT NULL,
  candidate_link_id UUID REFERENCES public.crm_record_links(id) ON DELETE SET NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  confidence public.crm_duplicate_confidence NOT NULL,
  match_reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  match_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  status public.crm_merge_candidate_status NOT NULL DEFAULT 'pending',
  reviewed_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.crm_merge_candidates IS
  'Review queue for possible duplicate CRM identities. Low-confidence matches stay here and are never merged automatically.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_merge_candidates_pending_unique
  ON public.crm_merge_candidates (
    tenant_id,
    crm_provider,
    source_entity_type,
    source_entity_id,
    candidate_twenty_object_name,
    candidate_twenty_record_id
  )
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_crm_merge_candidates_status
  ON public.crm_merge_candidates (tenant_id, status, confidence, score DESC);

CREATE TABLE IF NOT EXISTS public.crm_projection_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  projection_name TEXT NOT NULL,
  source_system TEXT NOT NULL DEFAULT 'asym',
  source_entity_type public.crm_link_entity_type NOT NULL,
  source_entity_id TEXT NOT NULL,
  target_surface public.crm_projection_target_surface NOT NULL,
  crm_record_link_id UUID REFERENCES public.crm_record_links(id) ON DELETE SET NULL,
  crm_provider TEXT NOT NULL DEFAULT 'twenty' CHECK (crm_provider = 'twenty'),
  twenty_object_name TEXT,
  twenty_record_id TEXT,
  sync_status public.crm_projection_sync_status NOT NULL DEFAULT 'pending',
  source_hash TEXT,
  projected_hash TEXT,
  last_projected_at TIMESTAMPTZ,
  last_error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.crm_projection_state IS
  'Per-surface CRM projection bookkeeping for later shadow mode, replay, drift checks, and rollback. Phase 02 creates the state table only; Phase 03+ owns sync execution.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_projection_state_unique_source
  ON public.crm_projection_state (
    tenant_id,
    projection_name,
    target_surface,
    source_entity_type,
    source_entity_id
  );

CREATE INDEX IF NOT EXISTS idx_crm_projection_state_status
  ON public.crm_projection_state (tenant_id, target_surface, sync_status);

ALTER TABLE public.crm_record_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_merge_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_projection_state ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_record_links TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_record_links TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_merge_candidates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_merge_candidates TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_projection_state TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_projection_state TO service_role;

DROP POLICY IF EXISTS "authz staff tenant select crm_record_links" ON public.crm_record_links;
CREATE POLICY "authz staff tenant select crm_record_links"
  ON public.crm_record_links
  FOR SELECT
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant insert crm_record_links" ON public.crm_record_links;
CREATE POLICY "authz staff tenant insert crm_record_links"
  ON public.crm_record_links
  FOR INSERT
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant update crm_record_links" ON public.crm_record_links;
CREATE POLICY "authz staff tenant update crm_record_links"
  ON public.crm_record_links
  FOR UPDATE
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  )
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant select crm_merge_candidates" ON public.crm_merge_candidates;
CREATE POLICY "authz staff tenant select crm_merge_candidates"
  ON public.crm_merge_candidates
  FOR SELECT
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant insert crm_merge_candidates" ON public.crm_merge_candidates;
CREATE POLICY "authz staff tenant insert crm_merge_candidates"
  ON public.crm_merge_candidates
  FOR INSERT
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant update crm_merge_candidates" ON public.crm_merge_candidates;
CREATE POLICY "authz staff tenant update crm_merge_candidates"
  ON public.crm_merge_candidates
  FOR UPDATE
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  )
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant select crm_projection_state" ON public.crm_projection_state;
CREATE POLICY "authz staff tenant select crm_projection_state"
  ON public.crm_projection_state
  FOR SELECT
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant insert crm_projection_state" ON public.crm_projection_state;
CREATE POLICY "authz staff tenant insert crm_projection_state"
  ON public.crm_projection_state
  FOR INSERT
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );

DROP POLICY IF EXISTS "authz staff tenant update crm_projection_state" ON public.crm_projection_state;
CREATE POLICY "authz staff tenant update crm_projection_state"
  ON public.crm_projection_state
  FOR UPDATE
  USING (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  )
  WITH CHECK (
    authz.is_super_admin()
    OR authz.has_staff_membership(tenant_id, NULL)
  );
