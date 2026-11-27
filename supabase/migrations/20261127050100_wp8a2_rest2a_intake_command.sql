-- AL-2681 (WP8a part 2 rest, PR 2a; plan lines 426, 464, 1141, 1152, 1158,
-- 1171, 1175 and 1178; rulings W8-R20 and 3): the intake command's part
-- inside the organization. Nothing live calls it: the wrapper that learns
-- the organization and the route that mounts it come later.
--
-- 1. public.donations gains the gift's frozen attribution: site_id (the
--    organization's Site, keyed to it), entry_surface ('website' or
--    'donor_account'), source_code_id (an active code of the organization's
--    list) or unlisted_source_code (a well-formed code off the list, kept
--    apart for triage, never both). A legacy row holds none of them; on a
--    line-based row the pair (entry_surface, site_id) is both NULL, a
--    website gift with its Site, or an account-area gift with or without
--    the Site it was handed off from (plan line 179, amended 27 November).
--    Foreign keys and the check are NOT VALID, then validated (W8-R27).
-- 2. private.donations_intake_generation() replaced: as 20261127030000 left
--    it, and a line-based intake also keeps its four attribution columns.
-- 3. public.field_policies: the four columns, visible on Mission Control
--    only, as for the intake's other columns (intake_format, livemode);
--    site_id public like site_domains.site_id (one name, one category), the
--    other three internal. The whole-table grant to authenticated still
--    reads them; its narrowing is WP8b's contract.
-- 4. tenant_guard gains what the command writes and reads: INSERT of the
--    named columns of donations, donation_intake_lines and
--    donation_intake_contacts; SELECT of five columns of funds behind a new
--    tenant_guard_isolation policy (SELECT only); SELECT of
--    missionaries.legal_entity_id.
-- 5. public.donation_intake_requests: one row per (organization, client
--    key), the key and the request as SHA-256 digests only, the intake it
--    made; written by tenant_guard alone, never updated, deleted or
--    truncated (23514); row security forced, nothing for PUBLIC, anon,
--    authenticated or service_role.
-- 6. tenant_guard.begin_line_gift(tenant, host, entry surface, client key,
--    lines, fee cover, payment method, anonymity, source code, contact,
--    actor): a guard-owned definer, EXECUTE for service_role, that enters
--    the tenant first and refuses any isolation level but READ COMMITTED
--    (25001). It locks the organization FOR SHARE (private.share_lock_tenant)
--    without judging it yet, normalises the host as resolve_verified_host
--    does, and admits it again under locks (ruling W8-R41): for 'website'
--    the claimed name (private.share_lock_site_domain) active, serving
--    'website', with its Site locked FOR SHARE and active, and no source
--    Site (22023 source_site_not_admitted). An actor there is refused 22023
--    actor_not_admitted while private.site_checkout_serves_guests() answers
--    true: the plan's "A Site's checkout serves guests" (line 179), under the
--    owner's review of 27 November (outcome 3), so it is one named check.
--    Without it, an actor is admitted only where the Site's name is also the
--    organization's home record, with the account area's own checks (the
--    home record FOR SHARE, the name serving 'donor_account', the verified
--    actor), and the Site stays frozen from the host; for 'donor_account' the organization's home
--    record (donor_portal_hosts FOR SHARE), then the claimed name active
--    and serving 'donor_account', and the verified actor (22023
--    actor_required). A signed-in gift handed off from a Site's checkout
--    names that Site (the last argument): it is kept, locked FOR SHARE, only
--    when it is a current (active) Site of this organization; otherwise the
--    gift carries no Site, with no error and nothing in the answer saying
--    why; the entry surface is the donor portal's either way (amendment of
--    27 November to W8-R41; plan lines 179, 1152, 1179). Any other surface
--    or failed admission is 42501
--    host_not_admitted, raised before the organization's status is judged
--    (55000 organization_inactive), so no answer tells a caller whether
--    another organization's name exists. Then it answers a replay of a
--    known key with its first intake and refuses the key with another
--    request (23505 idempotency_key_reused); checks the payment method is
--    card or wallet (never ach) and the contact has an address to write
--    to; takes the entity from the lines (one entity, no donor line on the
--    reserved fund), the binding from the entity's active test-mode binding
--    (FOR SHARE, before the intake: the documented order), the fee line
--    from the caller's fee cover on the entity's reserved fund; writes the
--    key, the intake, its lines, its contact row, one audit row and,
--    through money_enqueue_payment_request, one queued create_payment
--    request with no donor. Each refusal changes nothing.
-- 7. private.site_checkout_serves_guests(): the one named check above, a
--    postgres-owned IMMUTABLE function answering true, EXECUTE for
--    tenant_guard only; replacing it to answer false lets a signed-in giver
--    give in place on a home domain that serves a Site.
-- 8. public.begin_line_gift(host, ..., source Site): the wrapper takes the
--    host (and, for a hand-off, the source Site) and no organization. It reads the organization from the reviewed single-host
--    lookup public.resolve_verified_host(p_host) (state active), refuses
--    42501 host_not_admitted when there is none, and hands both to the
--    guard command. A postgres-owned invoker, EXECUTE for service_role
--    only; scripts/verify/command-entry-boundaries.mjs admits that one
--    lookup as a wrapper's anchor read (WORKER_WRAPPER_ANCHOR_LOOKUPS).
--
-- Locks, all held to COMMIT, taken first: ACCESS EXCLUSIVE on donations
-- (its new columns and constraints), SHARE ROW EXCLUSIVE on sites and
-- giving_source_codes (the new foreign keys). No running command takes
-- either of the latter two while locking donations. lock_timeout stops a
-- run rather than queue it behind live traffic.
--
-- Recovery. Nothing here is written to run twice: a run lost between its
-- COMMIT and its ledger row stops on the next run at the first ADD COLUMN
-- (42701, column "site_id" of relation "donations" already exists). This
-- file has committed when this read-only check is true:
--   SELECT to_regclass('public.donation_intake_requests') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127050100.
--
-- Down, an operator's last resort, in one transaction, for a database with
-- no line-based intake:
--   SET LOCAL lock_timeout = '5s';
--   DROP FUNCTION public.begin_line_gift(text, text, text, jsonb, bigint, text, boolean, text, jsonb, jsonb, uuid);
--   DROP FUNCTION private.site_checkout_serves_guests();
--   DROP FUNCTION tenant_guard.begin_line_gift(uuid, text, text, text, jsonb, bigint, text, boolean, text, jsonb, jsonb, uuid);
--   DROP TABLE public.donation_intake_requests;
--   DROP FUNCTION private.donation_intake_requests_sealed();
--   REVOKE INSERT ON TABLE public.donations, public.donation_intake_lines, public.donation_intake_contacts FROM tenant_guard;
--   REVOKE SELECT ON TABLE public.funds FROM tenant_guard; DROP POLICY tenant_guard_isolation ON public.funds;
--   REVOKE SELECT (legal_entity_id) ON TABLE public.missionaries FROM tenant_guard;
--   DELETE FROM public.field_policies WHERE record_type = 'donations'
--     AND field_key IN ('site_id', 'entry_surface', 'source_code_id', 'unlisted_source_code');
--   re-run, verbatim, the CREATE OR REPLACE of private.donations_intake_generation() from 20261127030000;
--   ALTER TABLE public.donations DROP COLUMN site_id, DROP COLUMN entry_surface,
--     DROP COLUMN source_code_id, DROP COLUMN unlisted_source_code;

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.donations IN ACCESS EXCLUSIVE MODE;
LOCK TABLE public.sites, public.giving_source_codes IN SHARE ROW EXCLUSIVE MODE;

ALTER TABLE public.donations
  ADD COLUMN site_id UUID,
  ADD COLUMN entry_surface TEXT,
  ADD COLUMN source_code_id UUID,
  ADD COLUMN unlisted_source_code TEXT;

ALTER TABLE public.donations
  ADD CONSTRAINT donations_site_fk
    FOREIGN KEY (tenant_id, site_id) REFERENCES public.sites (tenant_id, id)
    ON DELETE RESTRICT NOT VALID,
  ADD CONSTRAINT donations_source_code_fk
    FOREIGN KEY (tenant_id, source_code_id) REFERENCES public.giving_source_codes (tenant_id, id)
    ON DELETE RESTRICT NOT VALID,
  ADD CONSTRAINT donations_attribution_check
    CHECK (
      ((intake_format <> 'legacy_header')
        OR ((site_id IS NULL
             AND entry_surface IS NULL
             AND source_code_id IS NULL
             AND unlisted_source_code IS NULL) IS TRUE))
      AND ((intake_format <> 'line_based')
        OR ((((entry_surface IS NULL AND site_id IS NULL)
              OR (entry_surface = 'website' AND site_id IS NOT NULL)
              OR entry_surface = 'donor_account')
             AND (source_code_id IS NULL OR unlisted_source_code IS NULL)
             AND (unlisted_source_code IS NULL
                  OR unlisted_source_code ~ '^[a-z0-9][a-z0-9_-]{0,63}$')) IS TRUE))
    ) NOT VALID;

ALTER TABLE public.donations VALIDATE CONSTRAINT donations_site_fk;
ALTER TABLE public.donations VALIDATE CONSTRAINT donations_source_code_fk;
ALTER TABLE public.donations VALIDATE CONSTRAINT donations_attribution_check;

CREATE OR REPLACE FUNCTION private.donations_intake_generation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
  v_format TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_format := CASE WHEN current_user = 'tenant_guard' THEN 'line_based' ELSE 'legacy_header' END;
    IF NEW.intake_format IS NULL THEN
      NEW.intake_format := v_format;
    END IF;
    IF (NEW.intake_format = v_format) IS NOT TRUE THEN
      RAISE EXCEPTION 'donation_intake_format_mismatch'
        USING ERRCODE = '42501',
              DETAIL = pg_catalog.format('%s may insert only %s intakes', current_user, v_format);
    END IF;
    IF NEW.intake_format = 'line_based' THEN
      IF (NEW.currency ~ '^[a-z]{3}$') IS NOT TRUE THEN
        RAISE EXCEPTION 'donation_line_intake_invalid'
          USING ERRCODE = '23514',
                DETAIL = 'A line-based intake names its currency as three lower-case letters.';
      END IF;
      IF (NEW.donor_id IS NULL
          AND NEW.stripe_payment_intent_id IS NULL
          AND NEW.stripe_charge_id IS NULL
          AND NEW.abandoned_by IS NULL) IS NOT TRUE THEN
        RAISE EXCEPTION 'donation_line_intake_invalid'
          USING ERRCODE = '23514',
                DETAIL = 'A line-based intake is created with no donor, payment reference, charge or abandonment.';
      END IF;
      IF NEW.is_anonymous IS NULL THEN
        NEW.is_anonymous := false;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF (OLD.intake_format <> 'line_based') IS NOT TRUE THEN
      RAISE EXCEPTION 'donation_line_intake_sealed'
        USING ERRCODE = '23514',
              DETAIL = 'A line-based intake is never deleted.';
    END IF;
    RETURN OLD;
  END IF;

  IF (NEW.intake_format = OLD.intake_format) IS NOT TRUE THEN
    RAISE EXCEPTION 'donation_intake_format_frozen'
      USING ERRCODE = '23514',
            DETAIL = 'An intake keeps the format it was created with.';
  END IF;

  IF OLD.tenant_id IS NOT NULL AND (NEW.tenant_id IS NOT DISTINCT FROM OLD.tenant_id) IS NOT TRUE THEN
    RAISE EXCEPTION 'donation_tenant_frozen'
      USING ERRCODE = '23514',
            DETAIL = 'An intake keeps the organization it was recorded in.';
  END IF;

  IF OLD.intake_format = 'line_based' THEN
    IF (NEW.tenant_id IS NOT DISTINCT FROM OLD.tenant_id
        AND NEW.amount IS NOT DISTINCT FROM OLD.amount
        AND NEW.currency IS NOT DISTINCT FROM OLD.currency
        AND NEW.fund_id IS NOT DISTINCT FROM OLD.fund_id
        AND NEW.missionary_id IS NOT DISTINCT FROM OLD.missionary_id
        AND NEW.legal_entity_id IS NOT DISTINCT FROM OLD.legal_entity_id
        AND NEW.payment_account_binding_id IS NOT DISTINCT FROM OLD.payment_account_binding_id
        AND NEW.provider_account_ref IS NOT DISTINCT FROM OLD.provider_account_ref
        AND NEW.livemode IS NOT DISTINCT FROM OLD.livemode
        AND NEW.is_anonymous IS NOT DISTINCT FROM OLD.is_anonymous
        AND NEW.site_id IS NOT DISTINCT FROM OLD.site_id
        AND NEW.entry_surface IS NOT DISTINCT FROM OLD.entry_surface
        AND NEW.source_code_id IS NOT DISTINCT FROM OLD.source_code_id
        AND NEW.unlisted_source_code IS NOT DISTINCT FROM OLD.unlisted_source_code) IS NOT TRUE THEN
      RAISE EXCEPTION 'donation_line_intake_sealed'
        USING ERRCODE = '23514',
              DETAIL = 'A line-based intake keeps its tenant, amount, currency, target, entity, binding, account, mode, anonymity and attribution.';
    END IF;
    IF (OLD.stripe_payment_intent_id IS NULL
        OR NEW.stripe_payment_intent_id IS NOT DISTINCT FROM OLD.stripe_payment_intent_id) IS NOT TRUE THEN
      RAISE EXCEPTION 'donation_payment_reference_fixed'
        USING ERRCODE = '23514',
              DETAIL = 'A recorded payment reference never changes.';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

INSERT INTO public.field_policies (
  record_type,
  field_key,
  surface,
  visible,
  editable,
  exportable,
  sensitivity_category
)
SELECT
  'donations',
  v.field_key,
  s.surface,
  s.surface = 'mission_control',
  false,
  false,
  v.category::public.field_sensitivity_category
FROM (
  VALUES
    ('site_id', 'public'),
    ('entry_surface', 'internal'),
    ('source_code_id', 'internal'),
    ('unlisted_source_code', 'internal')
) AS v(field_key, category)
CROSS JOIN unnest(
  ARRAY['mission_control', 'donor', 'missionary', 'public', 'export']
) AS s(surface);

GRANT INSERT (
  id, tenant_id, legal_entity_id, payment_account_binding_id, provider_account_ref, livemode,
  amount, currency, payment_method, is_anonymous, site_id, entry_surface, source_code_id,
  unlisted_source_code
) ON TABLE public.donations TO tenant_guard;

GRANT INSERT (
  tenant_id, donation_id, legal_entity_id, line_number, fund_id, missionary_id, is_fee_cover, amount
) ON TABLE public.donation_intake_lines TO tenant_guard;

GRANT INSERT (
  tenant_id, donation_id, legal_entity_id, email, first_name, last_name, address,
  actor_user_id, actor_email, actor_email_confirmed
) ON TABLE public.donation_intake_contacts TO tenant_guard;

CREATE POLICY tenant_guard_isolation ON public.funds
  FOR SELECT
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()));

GRANT SELECT (id, tenant_id, legal_entity_id, is_active, is_reserved_fee_cover)
  ON TABLE public.funds TO tenant_guard;

GRANT SELECT (legal_entity_id) ON TABLE public.missionaries TO tenant_guard;

CREATE TABLE public.donation_intake_requests (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  key_digest TEXT NOT NULL
    CONSTRAINT donation_intake_requests_key_digest_check CHECK (key_digest ~ '^[0-9a-f]{64}$'),
  request_digest TEXT NOT NULL
    CONSTRAINT donation_intake_requests_request_digest_check CHECK (request_digest ~ '^[0-9a-f]{64}$'),
  donation_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT donation_intake_requests_pkey PRIMARY KEY (tenant_id, key_digest),
  CONSTRAINT donation_intake_requests_donation_key UNIQUE (donation_id),
  CONSTRAINT donation_intake_requests_intake_fk
    FOREIGN KEY (donation_id) REFERENCES public.donations (id)
    ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED
);

CREATE FUNCTION private.donation_intake_requests_sealed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'donation_intake_request_sealed'
    USING ERRCODE = '23514',
          DETAIL = 'An intake request key is kept as written: never changed, deleted or truncated.';
END;
$$;

REVOKE ALL ON FUNCTION private.donation_intake_requests_sealed() FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER donation_intake_requests_sealed
  BEFORE UPDATE OR DELETE ON public.donation_intake_requests
  FOR EACH ROW EXECUTE FUNCTION private.donation_intake_requests_sealed();

CREATE TRIGGER donation_intake_requests_no_truncate
  BEFORE TRUNCATE ON public.donation_intake_requests
  FOR EACH STATEMENT EXECUTE FUNCTION private.donation_intake_requests_sealed();

ALTER TABLE public.donation_intake_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_intake_requests FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.donation_intake_requests FROM PUBLIC, anon, authenticated, service_role;

CREATE POLICY tenant_guard_isolation ON public.donation_intake_requests
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()));

GRANT SELECT (tenant_id, key_digest, request_digest, donation_id, created_at),
      INSERT (tenant_id, key_digest, request_digest, donation_id)
  ON TABLE public.donation_intake_requests TO tenant_guard;

CREATE FUNCTION private.site_checkout_serves_guests()
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT true;
$$;

ALTER FUNCTION private.site_checkout_serves_guests() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.site_checkout_serves_guests() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.site_checkout_serves_guests() TO tenant_guard;

CREATE FUNCTION tenant_guard.begin_line_gift(
  p_tenant_id UUID,
  p_host TEXT,
  p_entry_surface TEXT,
  p_client_key TEXT,
  p_lines JSONB,
  p_fee_cover BIGINT,
  p_payment_method TEXT,
  p_is_anonymous BOOLEAN,
  p_source_code TEXT,
  p_contact JSONB,
  p_actor JSONB,
  p_site_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_status TEXT;
  v_host TEXT;
  v_state TEXT;
  v_site UUID;
  v_surfaces TEXT[];
  v_site_status TEXT;
  v_key_digest TEXT;
  v_code TEXT;
  v_email TEXT;
  v_first TEXT;
  v_last TEXT;
  v_address JSONB;
  v_actor_user UUID;
  v_actor_email TEXT;
  v_actor_confirmed BOOLEAN;
  v_request JSONB;
  v_request_digest TEXT;
  v_existing RECORD;
  v_line RECORD;
  v_target TEXT;
  v_line_entity UUID;
  v_reserved BOOLEAN;
  v_active BOOLEAN;
  v_entity UUID;
  v_sum BIGINT;
  v_binding RECORD;
  v_fee_fund UUID;
  v_currency TEXT;
  v_source UUID;
  v_unlisted TEXT;
  v_id UUID;
  v_number INTEGER;
  v_operation UUID;
  v_replay RECORD;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);

  IF pg_catalog.current_setting('transaction_isolation') <> 'read committed' THEN
    RAISE EXCEPTION 'read_committed_required'
      USING ERRCODE = '25001',
            DETAIL = 'The intake command runs only at READ COMMITTED.';
  END IF;

  v_status := private.share_lock_tenant(p_tenant_id);
  v_host := CASE
              WHEN pg_catalog.octet_length(p_host) <= 300
              THEN pg_catalog.lower(pg_catalog.regexp_replace(p_host COLLATE "C", '\.?(:[0-9]+)?$', ''))
            END;
  v_actor_email := NULLIF(pg_catalog.lower(pg_catalog.btrim(p_actor ->> 'email')), '');
  v_actor_confirmed := CASE WHEN pg_catalog.jsonb_typeof(p_actor -> 'email_confirmed') = 'boolean'
                            THEN (p_actor ->> 'email_confirmed')::BOOLEAN END;
  v_actor_user := CASE WHEN (p_actor ->> 'user_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                       THEN (p_actor ->> 'user_id')::UUID END;

  IF p_entry_surface = 'website' THEN
    SELECT l.state, l.surfaces
      INTO v_state, v_surfaces
      FROM private.share_lock_site_domain(p_tenant_id, v_host) AS l;
    IF FOUND THEN
      SELECT d.site_id
        INTO v_site
        FROM public.site_domains AS d
       WHERE d.tenant_id = p_tenant_id
         AND d.host = v_host;
    END IF;
    IF (v_state = 'active'
        AND 'website' = ANY (v_surfaces)
        AND v_site IS NOT NULL) IS NOT TRUE THEN
      RAISE EXCEPTION 'host_not_admitted'
        USING ERRCODE = '42501',
              DETAIL = 'A guest gives only on an active claimed name of a Site.';
    END IF;
    SELECT s.status
      INTO v_site_status
      FROM public.sites AS s
     WHERE s.tenant_id = p_tenant_id
       AND s.id = v_site
       FOR SHARE;
    IF (v_site_status = 'active') IS NOT TRUE THEN
      RAISE EXCEPTION 'host_not_admitted'
        USING ERRCODE = '42501',
              DETAIL = 'A guest gives only on an active Site.';
    END IF;
    IF p_actor IS NOT NULL THEN
      IF private.site_checkout_serves_guests() THEN
        RAISE EXCEPTION 'actor_not_admitted'
          USING ERRCODE = '22023',
                DETAIL = 'A Site''s checkout serves guests (plan line 179); a signed-in giver gives from the home domain.';
      END IF;
      PERFORM 1
         FROM public.donor_portal_hosts AS h
        WHERE h.tenant_id = p_tenant_id
          AND h.primary_domain = v_host
          FOR SHARE;
      IF (FOUND AND 'donor_account' = ANY (v_surfaces)) IS NOT TRUE THEN
        RAISE EXCEPTION 'actor_not_admitted'
          USING ERRCODE = '22023',
                DETAIL = 'A signed-in giver gives in place only where the Site''s name is also the organization''s home domain.';
      END IF;
      IF (v_actor_user IS NOT NULL AND v_actor_confirmed IS NOT NULL) IS NOT TRUE THEN
        RAISE EXCEPTION 'actor_required'
          USING ERRCODE = '22023',
                DETAIL = 'A signed-in gift names the verified signed-in giver.';
      END IF;
    END IF;
    IF p_site_id IS NOT NULL THEN
      RAISE EXCEPTION 'source_site_not_admitted'
        USING ERRCODE = '22023',
              DETAIL = 'A Site''s checkout takes its Site from its name; only a hand-off to the home domain names one.';
    END IF;
  ELSIF p_entry_surface = 'donor_account' THEN
    PERFORM 1
       FROM public.donor_portal_hosts AS h
      WHERE h.tenant_id = p_tenant_id
        AND h.primary_domain = v_host
        FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'host_not_admitted'
        USING ERRCODE = '42501',
              DETAIL = 'A signed-in gift comes only from the organization''s home name.';
    END IF;
    SELECT l.state, l.surfaces
      INTO v_state, v_surfaces
      FROM private.share_lock_site_domain(p_tenant_id, v_host) AS l;
    IF (v_state = 'active' AND 'donor_account' = ANY (v_surfaces)) IS NOT TRUE THEN
      RAISE EXCEPTION 'host_not_admitted'
        USING ERRCODE = '42501',
              DETAIL = 'The home name is not an active claimed name serving the account area.';
    END IF;
    IF (v_actor_user IS NOT NULL AND v_actor_confirmed IS NOT NULL) IS NOT TRUE THEN
      RAISE EXCEPTION 'actor_required'
        USING ERRCODE = '22023',
              DETAIL = 'An account-area gift names the verified signed-in giver.';
    END IF;
    v_site := NULL;
    IF p_site_id IS NOT NULL THEN
      SELECT s.id
        INTO v_site
        FROM public.sites AS s
       WHERE s.tenant_id = p_tenant_id
         AND s.id = p_site_id
         AND s.status = 'active'
         FOR SHARE;
    END IF;
  ELSE
    RAISE EXCEPTION 'host_not_admitted'
      USING ERRCODE = '42501',
            DETAIL = 'The entry surface is website or donor_account.';
  END IF;

  IF (v_status = 'active') IS NOT TRUE THEN
    RAISE EXCEPTION 'organization_inactive'
      USING ERRCODE = '55000',
            DETAIL = 'The organization is not active.';
  END IF;

  IF (p_client_key IS NOT NULL
      AND pg_catalog.char_length(p_client_key) BETWEEN 1 AND 200
      AND p_client_key !~ '[[:cntrl:]]') IS NOT TRUE THEN
    RAISE EXCEPTION 'client_key_invalid'
      USING ERRCODE = '22023',
            DETAIL = 'A client key is 1 to 200 characters with no control character.';
  END IF;

  v_key_digest := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_client_key, 'UTF8')), 'hex');
  v_code := NULLIF(pg_catalog.lower(pg_catalog.btrim(p_source_code)), '');
  v_email := NULLIF(pg_catalog.lower(pg_catalog.btrim(p_contact ->> 'email')), '');
  v_first := NULLIF(pg_catalog.btrim(p_contact ->> 'first_name'), '');
  v_last := NULLIF(pg_catalog.btrim(p_contact ->> 'last_name'), '');
  v_address := CASE WHEN pg_catalog.jsonb_typeof(p_contact -> 'address') = 'object'
                    THEN p_contact -> 'address' END;
  v_request := pg_catalog.jsonb_build_object(
    'host', v_host,
    'entry_surface', p_entry_surface,
    'lines', p_lines,
    'fee_cover', p_fee_cover,
    'payment_method', p_payment_method,
    'is_anonymous', p_is_anonymous,
    'source_code', v_code,
    'contact', pg_catalog.jsonb_build_object(
      'email', v_email, 'first_name', v_first, 'last_name', v_last, 'address', v_address
    ),
    'actor', pg_catalog.jsonb_build_object(
      'user_id', v_actor_user, 'email', v_actor_email, 'email_confirmed', v_actor_confirmed
    ),
    'source_site', p_site_id
  );
  v_request_digest := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_request::TEXT, 'UTF8')), 'hex');

  SELECT r.request_digest, r.donation_id
    INTO v_existing
    FROM public.donation_intake_requests AS r
   WHERE r.tenant_id = p_tenant_id
     AND r.key_digest = v_key_digest;

  IF NOT FOUND THEN
    IF (p_payment_method IN ('card', 'wallet')) IS NOT TRUE THEN
      RAISE EXCEPTION 'payment_method_refused'
        USING ERRCODE = '22023',
              DETAIL = 'A gift is paid by card or wallet.';
    END IF;

    IF p_is_anonymous IS NULL THEN
      RAISE EXCEPTION 'anonymity_required'
        USING ERRCODE = '22023',
              DETAIL = 'The giver chooses whether the gift is anonymous.';
    END IF;

    IF (pg_catalog.jsonb_typeof(p_contact) = 'object'
        AND v_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
        AND pg_catalog.char_length(v_email) <= 254
        AND pg_catalog.char_length(COALESCE(v_first, '')) <= 200
        AND pg_catalog.char_length(COALESCE(v_last, '')) <= 200) IS NOT TRUE THEN
      RAISE EXCEPTION 'contact_required'
        USING ERRCODE = '22023',
              DETAIL = 'A gift names an address to write to.';
    END IF;

    IF (pg_catalog.jsonb_typeof(p_lines) = 'array'
        AND pg_catalog.jsonb_array_length(p_lines) BETWEEN 1 AND 99
        AND p_fee_cover IS NOT NULL
        AND p_fee_cover >= 0
        AND p_fee_cover <= 1000000000000) IS NOT TRUE THEN
      RAISE EXCEPTION 'lines_invalid'
        USING ERRCODE = '22023',
              DETAIL = 'A gift has 1 to 99 donor lines and a fee cover of zero or more cents.';
    END IF;

    v_sum := 0;
    v_entity := NULL;
    FOR v_line IN
      SELECT l.value, l.ordinality
        FROM pg_catalog.jsonb_array_elements(p_lines) WITH ORDINALITY AS l(value, ordinality)
    LOOP
      IF (pg_catalog.jsonb_typeof(v_line.value) = 'object'
          AND pg_catalog.jsonb_typeof(v_line.value -> 'amount') = 'number'
          AND (v_line.value ->> 'amount') ~ '^[1-9][0-9]{0,11}$'
          AND ((v_line.value ? 'fund_id') <> (v_line.value ? 'missionary_id'))
          AND (SELECT pg_catalog.count(*) FROM pg_catalog.jsonb_object_keys(v_line.value)) = 2
          AND COALESCE(v_line.value ->> 'fund_id', v_line.value ->> 'missionary_id')
                ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') IS NOT TRUE THEN
        RAISE EXCEPTION 'lines_invalid'
          USING ERRCODE = '22023',
                DETAIL = pg_catalog.format('Line %s names one fund or worker and a whole number of cents above zero.', v_line.ordinality);
      END IF;

      v_target := COALESCE(v_line.value ->> 'fund_id', v_line.value ->> 'missionary_id');
      v_line_entity := NULL;
      v_reserved := false;
      v_active := true;
      IF v_line.value ? 'fund_id' THEN
        SELECT f.legal_entity_id, f.is_reserved_fee_cover, f.is_active
          INTO v_line_entity, v_reserved, v_active
          FROM public.funds AS f
         WHERE f.tenant_id = p_tenant_id
           AND f.id = v_target::UUID;
      ELSE
        SELECT m.legal_entity_id
          INTO v_line_entity
          FROM public.missionaries AS m
         WHERE m.tenant_id = p_tenant_id
           AND m.id = v_target::UUID;
      END IF;

      IF v_line_entity IS NULL OR v_active IS NOT TRUE THEN
        RAISE EXCEPTION 'target_not_found'
          USING ERRCODE = '22023',
                DETAIL = pg_catalog.format('Line %s names no active fund or worker of the organization.', v_line.ordinality);
      END IF;
      IF v_reserved THEN
        RAISE EXCEPTION 'reserved_fund_line'
          USING ERRCODE = '22023',
                DETAIL = pg_catalog.format('Line %s names the reserved fee-cover fund.', v_line.ordinality);
      END IF;
      IF v_entity IS NULL THEN
        v_entity := v_line_entity;
      ELSIF v_entity <> v_line_entity THEN
        RAISE EXCEPTION 'lines_span_entities'
          USING ERRCODE = '22023',
                DETAIL = 'A gift''s lines name targets of one legal entity.';
      END IF;
      v_sum := v_sum + (v_line.value ->> 'amount')::BIGINT;
    END LOOP;

    SELECT b.id, b.provider_account_ref, b.livemode, b.status
      INTO v_binding
      FROM public.payment_account_bindings AS b
     WHERE b.tenant_id = p_tenant_id
       AND b.legal_entity_id = v_entity
       AND b.livemode = false
       AND b.status IN ('pending', 'active', 'restricted')
       FOR SHARE;

    IF NOT FOUND OR (v_binding.status = 'active') IS NOT TRUE THEN
      RAISE EXCEPTION 'binding_unavailable'
        USING ERRCODE = '55000',
              DETAIL = 'The legal entity has no active test-mode payment account binding.';
    END IF;

    IF p_fee_cover > 0 THEN
      SELECT f.id
        INTO v_fee_fund
        FROM public.funds AS f
       WHERE f.tenant_id = p_tenant_id
         AND f.legal_entity_id = v_entity
         AND f.is_reserved_fee_cover;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'fee_fund_missing'
          USING ERRCODE = '55000',
                DETAIL = 'The legal entity has no reserved fee-cover fund.';
      END IF;
    END IF;

    SELECT e.currency
      INTO v_currency
      FROM public.legal_entities AS e
     WHERE e.tenant_id = p_tenant_id
       AND e.id = v_entity;

    IF v_code ~ '^[a-z0-9][a-z0-9_-]{0,63}$' THEN
      SELECT c.id
        INTO v_source
        FROM public.giving_source_codes AS c
       WHERE c.tenant_id = p_tenant_id
         AND c.code = v_code
         AND c.is_active;
      IF NOT FOUND THEN
        v_unlisted := v_code;
      END IF;
    END IF;

    v_id := pg_catalog.gen_random_uuid();

    INSERT INTO public.donation_intake_requests (tenant_id, key_digest, request_digest, donation_id)
    VALUES (p_tenant_id, v_key_digest, v_request_digest, v_id)
    ON CONFLICT (tenant_id, key_digest) DO NOTHING;

    IF FOUND THEN
      INSERT INTO public.donations (
        id, tenant_id, legal_entity_id, payment_account_binding_id, provider_account_ref, livemode,
        amount, currency, payment_method, is_anonymous, site_id, entry_surface, source_code_id,
        unlisted_source_code
      )
      VALUES (
        v_id, p_tenant_id, v_entity, v_binding.id, v_binding.provider_account_ref, false,
        v_sum + p_fee_cover, v_currency, p_payment_method, p_is_anonymous, v_site, p_entry_surface,
        v_source, v_unlisted
      );

      v_number := 0;
      FOR v_line IN
        SELECT l.value
          FROM pg_catalog.jsonb_array_elements(p_lines) WITH ORDINALITY AS l(value, ordinality)
         ORDER BY l.ordinality
      LOOP
        v_number := v_number + 1;
        INSERT INTO public.donation_intake_lines (
          tenant_id, donation_id, legal_entity_id, line_number, fund_id, missionary_id, is_fee_cover, amount
        )
        VALUES (
          p_tenant_id, v_id, v_entity, v_number,
          (v_line.value ->> 'fund_id')::UUID, (v_line.value ->> 'missionary_id')::UUID,
          false, (v_line.value ->> 'amount')::BIGINT
        );
      END LOOP;

      IF p_fee_cover > 0 THEN
        INSERT INTO public.donation_intake_lines (
          tenant_id, donation_id, legal_entity_id, line_number, fund_id, missionary_id, is_fee_cover, amount
        )
        VALUES (p_tenant_id, v_id, v_entity, v_number + 1, v_fee_fund, NULL, true, p_fee_cover);
      END IF;

      INSERT INTO public.donation_intake_contacts (
        tenant_id, donation_id, legal_entity_id, email, first_name, last_name, address,
        actor_user_id, actor_email, actor_email_confirmed
      )
      VALUES (
        p_tenant_id, v_id, v_entity, v_email, v_first, v_last, v_address,
        v_actor_user, v_actor_email, v_actor_confirmed
      );

      v_operation := tenant_guard.money_enqueue_payment_request(v_id);

      INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
      VALUES (
        p_tenant_id,
        v_actor_user,
        'gift_intake_begun',
        'donation',
        v_id::TEXT,
        pg_catalog.jsonb_build_object(
          'entry_surface', p_entry_surface,
          'site_id', v_site,
          'lines', pg_catalog.jsonb_array_length(p_lines),
          'fee_cover', p_fee_cover,
          'request_digest', v_request_digest,
          'operation_id', v_operation
        )
      );

      RETURN pg_catalog.jsonb_build_object(
        'outcome', 'created',
        'donation_id', v_id,
        'operation_id', v_operation,
        'tenant_id', tenant_guard.current_tenant_id(),
        'amount', v_sum + p_fee_cover,
        'currency', v_currency,
        'provider_account', v_binding.provider_account_ref,
        'payment_intent', NULL
      );
    END IF;

    SELECT r.request_digest, r.donation_id
      INTO v_existing
      FROM public.donation_intake_requests AS r
     WHERE r.tenant_id = p_tenant_id
       AND r.key_digest = v_key_digest;
  END IF;

  IF (v_existing.request_digest = v_request_digest) IS NOT TRUE THEN
    RAISE EXCEPTION 'idempotency_key_reused'
      USING ERRCODE = '23505',
            DETAIL = 'This key began another gift; a new gift needs a new key.';
  END IF;

  SELECT d.id, d.amount, d.currency, d.provider_account_ref, d.stripe_payment_intent_id
    INTO v_replay
    FROM public.donations AS d
   WHERE d.tenant_id = p_tenant_id
     AND d.id = v_existing.donation_id;

  SELECT o.id
    INTO v_operation
    FROM public.donation_saga_outbox AS o
   WHERE o.tenant_id = p_tenant_id
     AND o.donation_id = v_existing.donation_id
     AND o.request_kind = 'create_payment';

  RETURN pg_catalog.jsonb_build_object(
    'outcome', 'replayed',
    'donation_id', v_replay.id,
    'operation_id', v_operation,
    'tenant_id', tenant_guard.current_tenant_id(),
    'amount', v_replay.amount,
    'currency', v_replay.currency,
    'provider_account', v_replay.provider_account_ref,
    'payment_intent', v_replay.stripe_payment_intent_id
  );
END;
$$;

REVOKE ALL ON FUNCTION tenant_guard.begin_line_gift(UUID, TEXT, TEXT, TEXT, JSONB, BIGINT, TEXT, BOOLEAN, TEXT, JSONB, JSONB, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.begin_line_gift(UUID, TEXT, TEXT, TEXT, JSONB, BIGINT, TEXT, BOOLEAN, TEXT, JSONB, JSONB, UUID)
  TO service_role;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.begin_line_gift(UUID, TEXT, TEXT, TEXT, JSONB, BIGINT, TEXT, BOOLEAN, TEXT, JSONB, JSONB, UUID)
  OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION public.begin_line_gift(
  p_host TEXT,
  p_entry_surface TEXT,
  p_client_key TEXT,
  p_lines JSONB,
  p_fee_cover BIGINT,
  p_payment_method TEXT,
  p_is_anonymous BOOLEAN,
  p_source_code TEXT,
  p_contact JSONB,
  p_actor JSONB,
  p_site_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_tenant UUID;
BEGIN
  SELECT h.tenant_id INTO v_tenant FROM public.resolve_verified_host(p_host) AS h WHERE h.state = 'active';

  IF v_tenant IS NULL THEN
    RAISE EXCEPTION 'host_not_admitted'
      USING ERRCODE = '42501',
            DETAIL = 'The host is not an active claimed name.';
  END IF;

  RETURN tenant_guard.begin_line_gift(
    v_tenant, p_host, p_entry_surface, p_client_key, p_lines, p_fee_cover,
    p_payment_method, p_is_anonymous, p_source_code, p_contact, p_actor, p_site_id
  );
END;
$$;

ALTER FUNCTION public.begin_line_gift(TEXT, TEXT, TEXT, JSONB, BIGINT, TEXT, BOOLEAN, TEXT, JSONB, JSONB, UUID)
  OWNER TO postgres;
REVOKE ALL ON FUNCTION public.begin_line_gift(TEXT, TEXT, TEXT, JSONB, BIGINT, TEXT, BOOLEAN, TEXT, JSONB, JSONB, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.begin_line_gift(TEXT, TEXT, TEXT, JSONB, BIGINT, TEXT, BOOLEAN, TEXT, JSONB, JSONB, UUID)
  TO service_role;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
