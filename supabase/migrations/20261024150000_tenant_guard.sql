-- #2250 (slice 1 of #505): tenant guard for no-JWT tenant-scoped work.
--
-- No-JWT server paths reach Postgres through PostgREST on the service-role key,
-- which bypasses RLS. Guarded work instead runs inside ONE SECURITY DEFINER
-- function owned by tenant_guard: a NOLOGIN, NOBYPASSRLS, non-table-owning role
-- with no credential. Every statement in that call runs as tenant_guard, so RLS
-- applies, and the guard policy keys on the transaction-local GUC
-- app.current_tenant_id that tenant_guard.enter() sets.
--
-- Contract and how to add a guarded function: docs/security/tenant-guard.md.
-- The first guarded path is the workflow work claim pair; the public RPC
-- names stay, as thin INVOKER wrappers callable by service_role only.
--
-- Hosted Supabase: postgres is not a superuser there, so moving function
-- ownership needs postgres to be able to SET ROLE tenant_guard and tenant_guard
-- to hold CREATE on the schema while the owner changes (granted, then revoked).
-- The migration is all-or-nothing; apply it to a preview database first.
--
-- Down: DROP FUNCTION public.release_workflow_work_claim(UUID, UUID, TEXT);
--   re-create acquire/release from 20260611181000_workflow_work_claims.sql;
--   DROP POLICY tenant_guard_isolation ON public.workflow_work_claims;
--   DROP SCHEMA tenant_guard CASCADE;
--   REVOKE ALL ON TABLE public.workflow_work_claims FROM tenant_guard;
--   REVOKE USAGE ON SCHEMA public FROM tenant_guard; DROP ROLE tenant_guard.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'tenant_guard'
  ) THEN
    CREATE ROLE tenant_guard
      NOLOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;
END
$$;

-- Lets postgres hand function ownership to tenant_guard without inheriting
-- its privileges.
GRANT tenant_guard TO postgres WITH INHERIT FALSE, SET TRUE;

CREATE SCHEMA IF NOT EXISTS tenant_guard;
ALTER SCHEMA tenant_guard OWNER TO postgres;

-- Private schema: not listed in supabase/config.toml [api] schemas.
REVOKE ALL ON SCHEMA tenant_guard FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA tenant_guard TO tenant_guard, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA tenant_guard REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA tenant_guard
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated, service_role;

GRANT USAGE ON SCHEMA public TO tenant_guard;
GRANT SELECT, INSERT, UPDATE ON TABLE public.workflow_work_claims TO tenant_guard;

-- The guard tenant, or NULL when unset ('' after a transaction ends).
CREATE OR REPLACE FUNCTION tenant_guard.current_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT NULLIF(pg_catalog.current_setting('app.current_tenant_id', true), '')::uuid;
$$;

-- Sets the guard tenant for the current transaction only. Raises on a NULL
-- tenant, on a different tenant already set in this transaction, and when the
-- setting does not read back as the requested tenant.
CREATE OR REPLACE FUNCTION tenant_guard.enter(p_tenant_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_current TEXT := NULLIF(pg_catalog.current_setting('app.current_tenant_id', true), '');
BEGIN
  IF p_tenant_id IS NULL THEN
    RAISE EXCEPTION 'tenant_guard: tenant id is required'
      USING ERRCODE = '22004';
  END IF;

  IF v_current IS NOT NULL AND v_current::uuid <> p_tenant_id THEN
    RAISE EXCEPTION 'tenant_guard: another tenant is already set in this transaction'
      USING ERRCODE = '42501';
  END IF;

  PERFORM pg_catalog.set_config('app.current_tenant_id', p_tenant_id::text, true);

  IF tenant_guard.current_tenant_id() IS DISTINCT FROM p_tenant_id THEN
    RAISE EXCEPTION 'tenant_guard: tenant setting did not read back'
      USING ERRCODE = '42501';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION tenant_guard.current_tenant_id() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.current_tenant_id() TO tenant_guard;
REVOKE ALL ON FUNCTION tenant_guard.enter(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.enter(UUID) TO tenant_guard;

DROP POLICY IF EXISTS tenant_guard_isolation ON public.workflow_work_claims;
CREATE POLICY tenant_guard_isolation ON public.workflow_work_claims
  FOR ALL
  TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id())
  WITH CHECK (tenant_id = tenant_guard.current_tenant_id());

-- Guarded claim acquire: same behavior as 20260611181000, run as tenant_guard
-- under RLS, echoing the guard tenant.
CREATE OR REPLACE FUNCTION tenant_guard.acquire_workflow_work_claim(
  p_tenant_id UUID,
  p_subject_type TEXT,
  p_subject_id TEXT,
  p_claimed_by TEXT,
  p_ttl_seconds INTEGER DEFAULT 300
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_claim public.workflow_work_claims;
  v_tenant_id UUID;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);
  v_tenant_id := tenant_guard.current_tenant_id();

  IF p_subject_type IS NULL OR p_subject_id IS NULL OR p_claimed_by IS NULL THEN
    RAISE EXCEPTION 'tenant, subject, and claimed_by are required';
  END IF;

  IF p_ttl_seconds IS NULL OR p_ttl_seconds < 1 OR p_ttl_seconds > 3600 THEN
    RAISE EXCEPTION 'p_ttl_seconds must be between 1 and 3600';
  END IF;

  -- Stale claim recovery: expire active claims whose TTL has passed.
  UPDATE public.workflow_work_claims
  SET status = 'expired', released_at = NOW()
  WHERE tenant_id = v_tenant_id
    AND subject_type = p_subject_type
    AND subject_id = p_subject_id
    AND status = 'active'
    AND expires_at < NOW();

  INSERT INTO public.workflow_work_claims (
    tenant_id, subject_type, subject_id, claimed_by, status, expires_at
  )
  VALUES (
    v_tenant_id, p_subject_type, p_subject_id, p_claimed_by, 'active',
    NOW() + make_interval(secs => p_ttl_seconds)
  )
  ON CONFLICT (tenant_id, subject_type, subject_id) WHERE status = 'active' DO NOTHING
  RETURNING * INTO v_claim;

  IF v_claim.id IS NULL THEN
    RETURN jsonb_build_object('acquired', false, 'tenant_id', v_tenant_id);
  END IF;

  RETURN jsonb_build_object(
    'acquired', true,
    'claim_id', v_claim.id,
    'expires_at', v_claim.expires_at,
    'tenant_id', v_tenant_id
  );
END;
$$;

-- Guarded claim release: a claim of another tenant is invisible under RLS, so
-- it reports released = false and stays untouched.
CREATE OR REPLACE FUNCTION tenant_guard.release_workflow_work_claim(
  p_tenant_id UUID,
  p_claim_id UUID,
  p_status TEXT DEFAULT 'released'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_released BOOLEAN;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  IF p_status IS NULL OR p_status NOT IN ('released', 'expired') THEN
    RAISE EXCEPTION 'p_status must be released or expired';
  END IF;

  UPDATE public.workflow_work_claims
  SET status = p_status, released_at = NOW()
  WHERE id = p_claim_id
    AND status = 'active';
  v_released := FOUND;

  RETURN jsonb_build_object(
    'released', v_released,
    'tenant_id', tenant_guard.current_tenant_id()
  );
END;
$$;

REVOKE ALL ON FUNCTION tenant_guard.acquire_workflow_work_claim(UUID, TEXT, TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.acquire_workflow_work_claim(UUID, TEXT, TEXT, TEXT, INTEGER) TO service_role;
REVOKE ALL ON FUNCTION tenant_guard.release_workflow_work_claim(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.release_workflow_work_claim(UUID, UUID, TEXT) TO service_role;

-- Hand ownership to tenant_guard (the grants above move with it). The new
-- owner needs CREATE on the schema only while the owner changes.
GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.acquire_workflow_work_claim(UUID, TEXT, TEXT, TEXT, INTEGER) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.release_workflow_work_claim(UUID, UUID, TEXT) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

-- Public RPCs: INVOKER wrappers, so the caller stays service_role and the
-- guarded function runs as tenant_guard. No compatibility overload of the old
-- release(UUID, TEXT) remains: it would be an unguarded path.
DROP FUNCTION IF EXISTS public.release_workflow_work_claim(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.acquire_workflow_work_claim(
  p_tenant_id UUID,
  p_subject_type TEXT,
  p_subject_id TEXT,
  p_claimed_by TEXT,
  p_ttl_seconds INTEGER DEFAULT 300
)
RETURNS JSONB
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.acquire_workflow_work_claim(
    p_tenant_id, p_subject_type, p_subject_id, p_claimed_by, p_ttl_seconds
  );
$$;

CREATE OR REPLACE FUNCTION public.release_workflow_work_claim(
  p_tenant_id UUID,
  p_claim_id UUID,
  p_status TEXT DEFAULT 'released'
)
RETURNS JSONB
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.release_workflow_work_claim(p_tenant_id, p_claim_id, p_status);
$$;

ALTER FUNCTION public.acquire_workflow_work_claim(UUID, TEXT, TEXT, TEXT, INTEGER) OWNER TO postgres;
ALTER FUNCTION public.release_workflow_work_claim(UUID, UUID, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.acquire_workflow_work_claim(UUID, TEXT, TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.acquire_workflow_work_claim(UUID, TEXT, TEXT, TEXT, INTEGER) TO service_role;
REVOKE ALL ON FUNCTION public.release_workflow_work_claim(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.release_workflow_work_claim(UUID, UUID, TEXT) TO service_role;
