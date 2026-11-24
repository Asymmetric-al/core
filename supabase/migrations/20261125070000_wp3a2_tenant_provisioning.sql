-- AL-2676, WP3a part 2a (plan 12 WP3 lines 902, 911, 920, 922, 929; plan 8.1
-- line 443): provisioning, and the default Site, home record and brand every
-- organization owns.
--   private.ensure_tenant_home(uuid)   writes, only where missing, an
--     organization's default Site, home record and brand, in one call; it runs
--     only as postgres, inside the backfill migration that follows this one or
--     a platform definer;
--   platform.tenant_provisioning       the step record, one row per
--     provisioned organization, keyed by the operator's provisioning key; it
--     holds no email address;
--   platform.provision_tenant(text,text,text,text,text,text)   the platform
--     command: one organization, active at commit, with its legal entity,
--     fee-cover fund, approval-policy row, default Site, home record, brand,
--     first administrator's invitation, step record and audit row;
--   public.provision_tenant(text,text,text,text,text,text)     its Data API
--     wrapper.
-- It replaces nothing: no existing object is changed or dropped.
--
-- Locks: the new foreign keys take SHARE ROW EXCLUSIVE on public.tenants,
-- auth.users and public.membership_invitations until COMMIT; the new table
-- holds no rows to scan, so they are held for the length of this one
-- transaction only.
--
-- Down (in one transaction):
--   DROP FUNCTION public.provision_tenant(text,text,text,text,text,text),
--     platform.provision_tenant(text,text,text,text,text,text),
--     private.ensure_tenant_home(uuid);
--   DROP TABLE platform.tenant_provisioning;
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE FUNCTION private.ensure_tenant_home(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_name text;
  v_site uuid;
  v_home uuid;
  v_site_created boolean;
  v_home_created boolean;
  v_brand_created boolean;
BEGIN
  -- The organization row is held FOR SHARE, so its name cannot change and it
  -- cannot be removed while its three rows are written from that name.
  SELECT t.name
    INTO v_name
    FROM public.tenants AS t
   WHERE t.id = p_tenant_id
     FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'private: organization not found' USING ERRCODE = 'P0002';
  END IF;

  -- The Site and brand name check (20261125010000), tested before any write,
  -- so a name that cannot be copied writes nothing, not even a Site.
  IF (v_name !~ '^[[:space:]]|[[:space:]]$' AND pg_catalog.length(v_name) BETWEEN 1 AND 160) IS NOT TRUE THEN
    RAISE EXCEPTION 'private: the organization name cannot name a Site or brand' USING ERRCODE = '22023';
  END IF;

  -- Each row only where missing, on its own key: a re-run, or a concurrent
  -- Site command that wrote one first, neither fails nor is overwritten.
  INSERT INTO public.sites (tenant_id, name, is_default, status)
  VALUES (p_tenant_id, v_name, true, 'active')
  ON CONFLICT (tenant_id) WHERE is_default DO NOTHING
  RETURNING id INTO v_site;
  v_site_created := v_site IS NOT NULL;
  IF NOT v_site_created THEN
    SELECT s.id
      INTO STRICT v_site
      FROM public.sites AS s
     WHERE s.tenant_id = p_tenant_id
       AND s.is_default;
  END IF;

  INSERT INTO public.donor_portal_hosts (tenant_id)
  VALUES (p_tenant_id)
  ON CONFLICT (tenant_id) DO NOTHING
  RETURNING id INTO v_home;
  v_home_created := v_home IS NOT NULL;
  IF NOT v_home_created THEN
    SELECT h.id
      INTO STRICT v_home
      FROM public.donor_portal_hosts AS h
     WHERE h.tenant_id = p_tenant_id;
  END IF;

  INSERT INTO public.donor_account_brands (tenant_id, display_name)
  VALUES (p_tenant_id, v_name)
  ON CONFLICT (tenant_id) DO NOTHING;
  v_brand_created := FOUND;

  RETURN pg_catalog.jsonb_build_object(
    'site_id', v_site,
    'home_id', v_home,
    'site_created', v_site_created,
    'home_created', v_home_created,
    'brand_created', v_brand_created
  );
END;
$$;

ALTER FUNCTION private.ensure_tenant_home(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.ensure_tenant_home(uuid)
  FROM PUBLIC, anon, authenticated, service_role, tenant_guard;

CREATE TABLE platform.tenant_provisioning (
  -- The operator's key for one provisioning request: a re-run with it finds
  -- this row instead of creating a second organization.
  provisioning_key text PRIMARY KEY
    CHECK (provisioning_key !~ '^[[:space:]]|[[:space:]]$' AND pg_catalog.length(provisioning_key) BETWEEN 1 AND 200),
  tenant_id uuid NOT NULL UNIQUE REFERENCES public.tenants (id) ON DELETE RESTRICT,
  -- SHA-256 of the name, slug, normalized email and sub-role, so a re-run can
  -- be told from another request on the same key without storing the email.
  request_digest text NOT NULL CHECK (request_digest ~ '^[0-9a-f]{64}$'),
  requested_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  admin_invitation_id uuid NOT NULL,
  core_completed_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  FOREIGN KEY (tenant_id, admin_invitation_id)
    REFERENCES public.membership_invitations (tenant_id, id) ON DELETE RESTRICT
);

ALTER TABLE platform.tenant_provisioning OWNER TO postgres;
-- No client, service role or guard reads or writes the step record; only the
-- platform command, as its owner.
ALTER TABLE platform.tenant_provisioning ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.tenant_provisioning FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE platform.tenant_provisioning
  FROM PUBLIC, anon, authenticated, service_role, tenant_guard;

CREATE FUNCTION platform.provision_tenant(
  p_provisioning_key text,
  p_name text,
  p_slug text,
  p_admin_email text,
  p_staff_role text,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_operator uuid := platform.require_operator();
  v_reason text;
  v_email_norm text;
  v_staff_role text;
  v_digest text;
  v_step_tenant uuid;
  v_step_digest text;
  v_tenant uuid;
  v_entity uuid;
  v_fund uuid;
  v_home jsonb;
  v_invitation jsonb;
BEGIN
  -- Every input is checked before any table is read, so a refused request
  -- learns nothing about the organizations that exist.
  IF p_provisioning_key IS NULL
     OR p_provisioning_key ~ '^[[:space:]]|[[:space:]]$'
     OR pg_catalog.length(p_provisioning_key) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'platform: a provisioning key is required: not blank, no whitespace at either end, at most 200 characters'
      USING ERRCODE = '22023';
  END IF;

  -- The Site and brand name check, verbatim: the name is never trimmed.
  IF p_name IS NULL
     OR p_name ~ '^[[:space:]]|[[:space:]]$'
     OR pg_catalog.length(p_name) NOT BETWEEN 1 AND 160 THEN
    RAISE EXCEPTION 'platform: the organization name must have no whitespace at either end and 1 to 160 characters'
      USING ERRCODE = '22023';
  END IF;

  IF p_slug IS NULL OR p_slug !~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$' THEN
    RAISE EXCEPTION 'platform: the slug must be 1 to 63 lower-case letters, digits or inner hyphens'
      USING ERRCODE = '22023';
  END IF;

  v_reason := pg_catalog.regexp_replace(COALESCE(p_reason, ''), '^[[:space:]]+|[[:space:]]+$', '', 'g');
  IF p_reason IS NULL OR v_reason = '' THEN
    RAISE EXCEPTION 'platform: a reason is required' USING ERRCODE = '22023';
  END IF;

  -- The email and sub-role rules of platform.issue_admin_invitation
  -- (20261123040100), so the invitation step cannot refuse what passed here.
  v_email_norm := public.normalize_email(pg_catalog.btrim(COALESCE(p_admin_email, '')));
  IF p_admin_email IS NULL
     OR v_email_norm IS NULL
     OR v_email_norm !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'platform: a valid email address is required' USING ERRCODE = '22023';
  END IF;

  v_staff_role := COALESCE(NULLIF(pg_catalog.btrim(COALESCE(p_staff_role, '')), ''), 'development');
  IF v_staff_role NOT IN ('finance', 'mobilizer', 'development', 'hr', 'member_care') THEN
    RAISE EXCEPTION 'platform: the first administrator''s sub-role must be finance, mobilizer, development, hr or member_care'
      USING ERRCODE = '22023';
  END IF;

  -- The operator's list row is held FOR SHARE and the check repeated under it,
  -- so an operator removed while this call waited is refused.
  PERFORM 1
     FROM authz.platform_operators AS o
    WHERE o.user_id = v_operator
      FOR SHARE;
  PERFORM platform.require_operator();

  v_digest := pg_catalog.encode(
    pg_catalog.sha256(
      pg_catalog.convert_to(
        pg_catalog.jsonb_build_array(p_name, p_slug, v_email_norm, v_staff_role)::text,
        'UTF8'
      )
    ),
    'hex'
  );

  -- A second call with the same key waits here until the first commits, then
  -- finds its step record instead of meeting the slug's unique index.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('platform.provision_tenant:' || p_provisioning_key, 0)
  );

  SELECT p.tenant_id, p.request_digest
    INTO v_step_tenant, v_step_digest
    FROM platform.tenant_provisioning AS p
   WHERE p.provisioning_key = p_provisioning_key;
  IF FOUND THEN
    -- A re-run of the same request returns the organization and writes
    -- nothing; the one-time link is not returned again (an operator issues a
    -- fresh one with issue_admin_invitation).
    IF v_step_digest = v_digest THEN
      RETURN pg_catalog.jsonb_build_object('tenant_id', v_step_tenant, 'created', false);
    END IF;
    RAISE EXCEPTION 'platform: this provisioning key was used for a different request'
      USING ERRCODE = '23505';
  END IF;

  -- Every other column at its default: the organization is active at commit.
  -- One statement on the slug's unique key (tenants_slug_key): a call that
  -- meets another's uncommitted organization with the same slug waits for it,
  -- and either way a taken slug gets this command's own refusal.
  INSERT INTO public.tenants (name, slug)
  VALUES (p_name, p_slug)
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_tenant;
  IF v_tenant IS NULL THEN
    RAISE EXCEPTION 'platform: the slug is taken' USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.legal_entities (tenant_id, name, country_code, currency, legal_name)
  VALUES (v_tenant, p_name, 'US', 'usd', p_name)
  RETURNING id INTO v_entity;

  INSERT INTO public.funds (tenant_id, legal_entity_id, name, system_purpose)
  VALUES (v_tenant, v_entity, 'Fee cover', 'fee_cover')
  RETURNING id INTO v_fund;

  INSERT INTO public.contribution_approval_policies (tenant_id, ownership_mode)
  VALUES (v_tenant, 'no_approval_required');

  v_home := private.ensure_tenant_home(v_tenant);

  v_invitation := platform.issue_admin_invitation(v_tenant, p_admin_email, v_staff_role, p_reason);

  INSERT INTO platform.tenant_provisioning (
    provisioning_key, tenant_id, request_digest, requested_by, admin_invitation_id, core_completed_at
  )
  VALUES (
    p_provisioning_key,
    v_tenant,
    v_digest,
    v_operator,
    (v_invitation ->> 'invitation_id')::uuid,
    pg_catalog.clock_timestamp()
  );

  -- The audit row carries the key, the reason and the IDs created; never the
  -- one-time link's selector or verifier, nor an email address.
  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    v_tenant,
    v_operator,
    'tenant_provisioned',
    'tenant',
    v_tenant::text,
    pg_catalog.jsonb_build_object(
      'provisioning_key', p_provisioning_key,
      'reason', v_reason,
      'operator_id', v_operator,
      'tenant_id', v_tenant,
      'site_id', v_home ->> 'site_id',
      'home_id', v_home ->> 'home_id',
      'legal_entity_id', v_entity,
      'fund_id', v_fund,
      'invitation_id', v_invitation ->> 'invitation_id'
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'tenant_id', v_tenant,
    'site_id', v_home ->> 'site_id',
    'home_id', v_home ->> 'home_id',
    'legal_entity_id', v_entity,
    'fund_id', v_fund,
    'created', true,
    'invitation', v_invitation
  );
END;
$$;

COMMENT ON FUNCTION platform.provision_tenant(text, text, text, text, text, text) IS
  'Platform command (plan 8.1, 12 WP3 lines 902, 911, 922; AL-2676 WP3a part 2a): '
  'creates one active organization with its legal entity, fee-cover fund, approval-policy row, '
  'default Site, home record, brand and first administrator invitation, and records the step.';

ALTER FUNCTION platform.provision_tenant(text, text, text, text, text, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION platform.provision_tenant(text, text, text, text, text, text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION platform.provision_tenant(text, text, text, text, text, text) TO authenticated;

CREATE FUNCTION public.provision_tenant(
  p_provisioning_key text,
  p_name text,
  p_slug text,
  p_admin_email text,
  p_staff_role text,
  p_reason text
)
RETURNS jsonb
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT platform.provision_tenant(p_provisioning_key, p_name, p_slug, p_admin_email, p_staff_role, p_reason);
$$;

COMMENT ON FUNCTION public.provision_tenant(text, text, text, text, text, text) IS
  'Wrapper of platform.provision_tenant for the Data API (AL-2676 WP3a part 2a). '
  'Runs as the caller; EXECUTE for authenticated only.';

ALTER FUNCTION public.provision_tenant(text, text, text, text, text, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.provision_tenant(text, text, text, text, text, text)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.provision_tenant(text, text, text, text, text, text) TO authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
