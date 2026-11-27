-- AL-2681 (WP8a part 2 rest, PR 1, M2; plan lines 275, 431, 1156 and 1170;
-- rulings W8-R13, W8-R19, W8-R23, F4 and the brief's ruling 4; working rule
-- 13): the holds on a paid line-based gift, the large-gift threshold, and
-- the two human commands that set the threshold and clear a hold. The apply
-- that sets holds is M4's; nothing live stages a line-based gift.
--
-- 1. Predicate helpers, postgres-owned invokers with an empty search path,
--    EXECUTE for tenant_guard only:
--    - private.money_norm(text): "same" is JavaScript's trim() then
--      lower(): pg_catalog.btrim with exactly ECMAScript's WhiteSpace and
--      LineTerminator set (TAB, LF, VT, FF, CR, SPACE, NBSP, U+1680,
--      U+2000-U+200A, U+2028, U+2029, U+202F, U+205F, U+3000, U+FEFF, the
--      set payment_repair_cases' reason check trims), then pg_catalog.lower
--      under the database collation; inner spaces are kept; NULL is ''.
--    - private.money_entered_name(first, last): the two parts so normalized
--      and joined by one space, outer spaces dropped.
--    - private.money_duplicate_donors(tenant, first, last, address, exclude):
--      donor-matching.ts's possible duplicate with no household branch
--      (W8-R23): both parts non-blank and equal to the donor's name so
--      normalized, a non-blank equal street, and an equal non-blank zip or
--      an equal non-blank city; ordered ids.
--    - private.money_large_gift_hold(amount, currency, threshold): NULL with
--      no threshold; 'threshold_currency_unknown' for any currency but usd;
--      'large_gift' at or above it.
-- 2. public.staged_gift_holds: one row per reason a paid line-based gift
--    waits (name_mismatch, possible_duplicate, restricted_worker,
--    large_gift, threshold_currency_unknown), keyed to its gift and intake
--    with their entity; one open hold per gift and reason; a resolution all
--    set or all NULL with a reason of 3 to 500 characters after that trim.
--    Rules trigger: only tenant_guard inserts (42501), and only open holds
--    (23514); a hold is never deleted (23514); only tenant_guard, inside
--    tenant_guard.resolve_gift_hold (its transaction-local marker), resolves
--    one (42501), its anchors never change and a resolved hold never changes
--    (23514); TRUNCATE is refused (23514, origin mode). Row security forced;
--    tenant_guard SELECT, INSERT and UPDATE of named columns behind
--    tenant_guard_isolation; service_role SELECT (Mission Control's read);
--    nothing for PUBLIC, anon or authenticated.
-- 3. staged_gifts_hold_guard (BEFORE UPDATE, line-based gifts): while a
--    hold is open, a move into ready_to_post or posted and any change of
--    posted_at or posted_by_profile_id is refused (23514 staged_gift_held),
--    whoever writes; refunded, failed and voided stay open. Its function is
--    a postgres-owned definer, so it reads the holds whatever the writer's
--    grants.
-- 4. contribution_approval_policies.large_gift_threshold_cents: nullable,
--    positive (NOT VALID then validated), no default, no backfill.
-- 5. tenant_guard.set_large_gift_threshold(tenant, cents, reason)
--    (contributions.manage_settings) and tenant_guard.resolve_gift_hold(
--    tenant, hold, reason) (contributions.apply_corrections): guard-owned
--    definers whose first statement is tenant_guard.begin_human_command (so
--    x-asym-tenant must name the tenant), with invoker wrappers in public for
--    authenticated. Both re-read the caller's assignment FOR SHARE and its
--    capability, refuse a NULL or blank reason after the trim above or one
--    outside 3 to 500 characters (22023), and write an audit row. The
--    threshold command refuses zero or less (22023), and NULL clears; it
--    writes the tenant's first policy row with the table's defaults when
--    there is none (an insert that does nothing when the row exists), then
--    locks the row and audits the value it replaced, so of two first
--    writes the second records the first's (F9). The resolution command
--    locks the gift, then the hold;
--    refuses another organization's hold or a resolved one; for an
--    attribution hold it re-runs the predicate on the current rows and
--    records the answer; it never posts.
-- 6. tenant_guard grants: SELECT, INSERT and UPDATE of named columns of
--    contribution_approval_policies behind tenant_guard_isolation; staged_gifts
--    INSERT of donor_id and UPDATE of updated_at (the lock the resolution
--    command takes).
--
-- Locks, all held to COMMIT, taken first and in the order the running
-- commands take theirs (F8): SHARE ROW EXCLUSIVE on tenants (the holds' key
-- to it) and on donations (the holds' key), ACCESS EXCLUSIVE on
-- staged_gifts (its trigger and grants), ACCESS EXCLUSIVE on
-- contribution_approval_policies (its new column). lock_timeout stops a run
-- rather than queue it behind live traffic.
--
-- Recovery. Nothing here is written to run twice: a run lost between its
-- COMMIT and its ledger row stops on the next run at its first CREATE
-- FUNCTION (42723, private.money_norm already exists). This file has
-- committed when this read-only check is true:
--   SELECT to_regclass('public.staged_gift_holds') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127030100. It has no preflight or post-assert of its own.
--
-- Down, an operator's last resort, after the Down of 20261127030300 and
-- 20261127030400, in one transaction; it refuses while a hold exists:
--   SET LOCAL lock_timeout = '5s';
--   LOCK TABLE public.staged_gifts IN ACCESS EXCLUSIVE MODE;
--   DO $$ BEGIN IF to_regclass('public.staged_gift_holds') IS NOT NULL
--     AND EXISTS (SELECT 1 FROM public.staged_gift_holds) THEN
--     RAISE EXCEPTION 'Down refused: a gift hold exists' USING ERRCODE = '55000'; END IF; END $$;
--   DROP FUNCTION public.resolve_gift_hold(uuid, uuid, text), public.set_large_gift_threshold(uuid, bigint, text);
--   SET LOCAL ROLE tenant_guard;
--   DROP FUNCTION tenant_guard.resolve_gift_hold(uuid, uuid, text), tenant_guard.set_large_gift_threshold(uuid, bigint, text);
--   RESET ROLE;
--   DROP TRIGGER staged_gifts_hold_guard ON public.staged_gifts;
--   DROP FUNCTION private.staged_gifts_hold_guard();
--   DROP TABLE public.staged_gift_holds;
--   DROP FUNCTION private.staged_gift_holds_rules();
--   DROP FUNCTION private.staged_gift_holds_no_truncate();
--   DROP FUNCTION private.money_large_gift_hold(bigint, text, bigint),
--     private.money_duplicate_donors(uuid, text, text, jsonb, uuid),
--     private.money_entered_name(text, text), private.money_norm(text);
--   DROP POLICY tenant_guard_isolation ON public.contribution_approval_policies;
--   REVOKE ALL ON TABLE public.contribution_approval_policies FROM tenant_guard;
--   REVOKE INSERT (donor_id), UPDATE (updated_at) ON TABLE public.staged_gifts FROM tenant_guard;
--   ALTER TABLE public.contribution_approval_policies
--     DROP CONSTRAINT contribution_approval_policies_large_gift_threshold_check,
--     DROP COLUMN large_gift_threshold_cents;

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.tenants IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.donations IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE public.staged_gifts IN ACCESS EXCLUSIVE MODE;
LOCK TABLE public.contribution_approval_policies IN ACCESS EXCLUSIVE MODE;

CREATE FUNCTION private.money_norm(p_value TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = ''
AS $fn$
  SELECT pg_catalog.lower(pg_catalog.btrim(
    COALESCE(p_value, ''),
    E' \t\n\r\u000B\f                 　﻿'
  ));
$fn$;

CREATE FUNCTION private.money_entered_name(p_first TEXT, p_last TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = ''
AS $fn$
  SELECT pg_catalog.btrim(private.money_norm(p_first) || ' ' || private.money_norm(p_last), ' ');
$fn$;

CREATE FUNCTION private.money_duplicate_donors(
  p_tenant_id UUID,
  p_first TEXT,
  p_last TEXT,
  p_address JSONB,
  p_exclude UUID
)
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $fn$
  SELECT COALESCE(pg_catalog.array_agg(d.id ORDER BY d.id), ARRAY[]::UUID[])
    FROM public.donors AS d
   WHERE d.tenant_id = p_tenant_id
     AND d.id IS DISTINCT FROM p_exclude
     AND private.money_norm(p_first) <> ''
     AND private.money_norm(p_last) <> ''
     AND private.money_norm(d.name) = private.money_norm(p_first) || ' ' || private.money_norm(p_last)
     AND pg_catalog.jsonb_typeof(d.address) = 'object'
     AND pg_catalog.jsonb_typeof(p_address) = 'object'
     AND private.money_norm(p_address ->> 'street') <> ''
     AND private.money_norm(d.address ->> 'street') = private.money_norm(p_address ->> 'street')
     AND (
       (private.money_norm(p_address ->> 'zip') <> ''
         AND private.money_norm(d.address ->> 'zip') = private.money_norm(p_address ->> 'zip'))
       OR (private.money_norm(p_address ->> 'city') <> ''
         AND private.money_norm(d.address ->> 'city') = private.money_norm(p_address ->> 'city'))
     );
$fn$;

CREATE FUNCTION private.money_large_gift_hold(p_amount BIGINT, p_currency TEXT, p_threshold BIGINT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = ''
AS $fn$
  SELECT CASE
           WHEN p_threshold IS NULL THEN NULL
           WHEN p_currency IS DISTINCT FROM 'usd' THEN 'threshold_currency_unknown'
           WHEN p_amount >= p_threshold THEN 'large_gift'
         END;
$fn$;

ALTER FUNCTION private.money_norm(TEXT) OWNER TO postgres;
ALTER FUNCTION private.money_entered_name(TEXT, TEXT) OWNER TO postgres;
ALTER FUNCTION private.money_duplicate_donors(UUID, TEXT, TEXT, JSONB, UUID) OWNER TO postgres;
ALTER FUNCTION private.money_large_gift_hold(BIGINT, TEXT, BIGINT) OWNER TO postgres;
REVOKE ALL ON FUNCTION
  private.money_norm(TEXT),
  private.money_entered_name(TEXT, TEXT),
  private.money_duplicate_donors(UUID, TEXT, TEXT, JSONB, UUID),
  private.money_large_gift_hold(BIGINT, TEXT, BIGINT)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION
  private.money_norm(TEXT),
  private.money_entered_name(TEXT, TEXT),
  private.money_duplicate_donors(UUID, TEXT, TEXT, JSONB, UUID),
  private.money_large_gift_hold(BIGINT, TEXT, BIGINT)
  TO tenant_guard;

CREATE TABLE public.staged_gift_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
  staged_gift_id UUID NOT NULL,
  donation_id UUID NOT NULL,
  legal_entity_id UUID NOT NULL,
  reason TEXT NOT NULL
    CONSTRAINT staged_gift_holds_reason_check
      CHECK (reason IN ('name_mismatch', 'possible_duplicate', 'restricted_worker',
                        'large_gift', 'threshold_currency_unknown')),
  details JSONB NOT NULL DEFAULT '{}'::JSONB
    CONSTRAINT staged_gift_holds_details_check CHECK (pg_catalog.jsonb_typeof(details) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolved_assignment_id UUID,
  resolution_reason TEXT,
  resolution_details JSONB,
  CONSTRAINT staged_gift_holds_gift_fk
    FOREIGN KEY (tenant_id, staged_gift_id, legal_entity_id)
    REFERENCES public.staged_gifts (tenant_id, id, legal_entity_id)
    ON DELETE RESTRICT,
  CONSTRAINT staged_gift_holds_intake_fk
    FOREIGN KEY (tenant_id, donation_id, legal_entity_id)
    REFERENCES public.donations (tenant_id, id, legal_entity_id)
    ON DELETE RESTRICT,
  CONSTRAINT staged_gift_holds_resolution_complete_check
    CHECK (
      (resolved_at IS NULL
        AND resolved_by IS NULL
        AND resolved_assignment_id IS NULL
        AND resolution_reason IS NULL
        AND resolution_details IS NULL)
      OR (resolved_at IS NOT NULL
        AND resolved_by IS NOT NULL
        AND resolved_assignment_id IS NOT NULL
        AND resolution_reason IS NOT NULL
        AND resolution_details IS NOT NULL
        AND pg_catalog.jsonb_typeof(resolution_details) = 'object')
    ),
  CONSTRAINT staged_gift_holds_resolution_reason_check
    CHECK (
      resolution_reason IS NULL
      OR (
        pg_catalog.char_length(pg_catalog.btrim(resolution_reason,
          E' \t\n\r\u000B\f                 　﻿'))
          BETWEEN 3 AND 500
      ) IS TRUE
    )
);

CREATE UNIQUE INDEX staged_gift_holds_one_open_per_reason
  ON public.staged_gift_holds (tenant_id, staged_gift_id, reason)
  WHERE resolved_at IS NULL;

CREATE INDEX staged_gift_holds_intake_idx
  ON public.staged_gift_holds (tenant_id, donation_id);

CREATE FUNCTION private.staged_gift_holds_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'gift_hold_sealed'
      USING ERRCODE = '23514',
            DETAIL = 'A gift hold is evidence and is never deleted.';
  END IF;

  IF (current_user = 'tenant_guard') IS NOT TRUE THEN
    RAISE EXCEPTION 'gift_hold_guard_only'
      USING ERRCODE = '42501',
            DETAIL = 'Only the guard role sets or resolves a gift hold.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF (NEW.resolved_at IS NULL) IS NOT TRUE THEN
      RAISE EXCEPTION 'gift_hold_created_open'
        USING ERRCODE = '23514',
              DETAIL = 'A gift hold is created open.';
    END IF;
    RETURN NEW;
  END IF;

  IF (NEW.id IS NOT DISTINCT FROM OLD.id
      AND NEW.tenant_id IS NOT DISTINCT FROM OLD.tenant_id
      AND NEW.staged_gift_id IS NOT DISTINCT FROM OLD.staged_gift_id
      AND NEW.donation_id IS NOT DISTINCT FROM OLD.donation_id
      AND NEW.legal_entity_id IS NOT DISTINCT FROM OLD.legal_entity_id
      AND NEW.reason IS NOT DISTINCT FROM OLD.reason
      AND NEW.details::TEXT IS NOT DISTINCT FROM OLD.details::TEXT
      AND NEW.created_at IS NOT DISTINCT FROM OLD.created_at) IS NOT TRUE THEN
    RAISE EXCEPTION 'gift_hold_anchor_fixed'
      USING ERRCODE = '23514',
            DETAIL = 'A gift hold keeps its gift, intake, entity, reason, details and creation time.';
  END IF;

  IF OLD.resolved_at IS NOT NULL THEN
    RAISE EXCEPTION 'gift_hold_resolved'
      USING ERRCODE = '23514',
            DETAIL = 'A resolved gift hold never changes.';
  END IF;

  IF (NEW.resolved_at IS NOT NULL) IS NOT TRUE THEN
    RAISE EXCEPTION 'gift_hold_bad_move'
      USING ERRCODE = '23514',
            DETAIL = 'An open gift hold changes only by being resolved.';
  END IF;

  IF (pg_catalog.current_setting('app.gift_hold_resolution', true) = OLD.id::TEXT) IS NOT TRUE THEN
    RAISE EXCEPTION 'gift_hold_command_only'
      USING ERRCODE = '42501',
            DETAIL = 'A gift hold is resolved only by tenant_guard.resolve_gift_hold.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE FUNCTION private.staged_gift_holds_no_truncate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'gift_hold_sealed'
    USING ERRCODE = '23514',
          DETAIL = 'Gift holds are evidence and are never truncated.';
END;
$$;

REVOKE ALL ON FUNCTION private.staged_gift_holds_rules(), private.staged_gift_holds_no_truncate()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER staged_gift_holds_rules
  BEFORE INSERT OR UPDATE OR DELETE ON public.staged_gift_holds
  FOR EACH ROW
  EXECUTE FUNCTION private.staged_gift_holds_rules();

CREATE TRIGGER staged_gift_holds_no_truncate
  BEFORE TRUNCATE ON public.staged_gift_holds
  FOR EACH STATEMENT
  EXECUTE FUNCTION private.staged_gift_holds_no_truncate();

ALTER TABLE public.staged_gift_holds
  ENABLE ROW LEVEL SECURITY,
  FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.staged_gift_holds
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.staged_gift_holds TO service_role;
GRANT SELECT ON TABLE public.staged_gift_holds TO tenant_guard;
GRANT INSERT (tenant_id, staged_gift_id, donation_id, legal_entity_id, reason, details)
  ON TABLE public.staged_gift_holds TO tenant_guard;
GRANT UPDATE (resolved_at, resolved_by, resolved_assignment_id, resolution_reason, resolution_details)
  ON TABLE public.staged_gift_holds TO tenant_guard;

CREATE POLICY tenant_guard_isolation
  ON public.staged_gift_holds
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

CREATE FUNCTION private.staged_gifts_hold_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF ((NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('ready_to_post', 'posted'))
      OR NEW.posted_at IS DISTINCT FROM OLD.posted_at
      OR NEW.posted_by_profile_id IS DISTINCT FROM OLD.posted_by_profile_id)
     AND EXISTS (
       SELECT 1
         FROM public.staged_gift_holds AS h
        WHERE h.tenant_id = OLD.tenant_id
          AND h.staged_gift_id = OLD.id
          AND h.resolved_at IS NULL
     ) THEN
    RAISE EXCEPTION 'staged_gift_held'
      USING ERRCODE = '23514',
            DETAIL = 'A gift with an open hold does not move toward posting.';
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION private.staged_gifts_hold_guard() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.staged_gifts_hold_guard()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER staged_gifts_hold_guard
  BEFORE UPDATE ON public.staged_gifts
  FOR EACH ROW
  WHEN (OLD.intake_format = 'line_based')
  EXECUTE FUNCTION private.staged_gifts_hold_guard();

ALTER TABLE public.contribution_approval_policies
  ADD COLUMN large_gift_threshold_cents BIGINT;

ALTER TABLE public.contribution_approval_policies
  ADD CONSTRAINT contribution_approval_policies_large_gift_threshold_check
    CHECK (large_gift_threshold_cents IS NULL OR large_gift_threshold_cents > 0) NOT VALID;

ALTER TABLE public.contribution_approval_policies
  VALIDATE CONSTRAINT contribution_approval_policies_large_gift_threshold_check;

GRANT SELECT (tenant_id, large_gift_threshold_cents, updated_by, updated_at)
  ON TABLE public.contribution_approval_policies TO tenant_guard;
GRANT INSERT (tenant_id, large_gift_threshold_cents, updated_by)
  ON TABLE public.contribution_approval_policies TO tenant_guard;
GRANT UPDATE (large_gift_threshold_cents, updated_by, updated_at)
  ON TABLE public.contribution_approval_policies TO tenant_guard;

DROP POLICY IF EXISTS tenant_guard_isolation ON public.contribution_approval_policies;
CREATE POLICY tenant_guard_isolation
  ON public.contribution_approval_policies
  FOR ALL
  TO tenant_guard
  USING (tenant_id = (SELECT tenant_guard.current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT tenant_guard.current_tenant_id()));

GRANT INSERT (donor_id) ON TABLE public.staged_gifts TO tenant_guard;
GRANT UPDATE (updated_at) ON TABLE public.staged_gifts TO tenant_guard;

CREATE FUNCTION tenant_guard.set_large_gift_threshold(
  p_tenant_id UUID,
  p_threshold_cents BIGINT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_tenant_status TEXT;
  v_assignment RECORD;
  v_assignment_found BOOLEAN;
  v_capability_held BOOLEAN;
  v_reason TEXT;
  v_before BIGINT;
  v_after BIGINT;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'contributions.manage_settings');

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);

  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_assignment
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR SHARE;
  v_assignment_found := FOUND;

  v_capability_held := 'contributions.manage_settings' = ANY (authz.assignment_capabilities(v_ctx.assignment_id));

  IF (v_tenant_status = 'active') IS NOT TRUE
     OR (
       v_assignment_found
       AND v_assignment.user_id = v_ctx.actor_id
       AND v_assignment.tenant_id = v_ctx.tenant_id
       AND v_assignment.is_active
       AND v_assignment.revoked_at IS NULL
     ) IS NOT TRUE
     OR v_capability_held IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: the caller no longer holds the authority this command requires'
      USING ERRCODE = '42501';
  END IF;

  v_reason := pg_catalog.btrim(COALESCE(p_reason, ''),
    E' \t\n\r\u000B\f                 　﻿');
  IF (pg_catalog.char_length(v_reason) BETWEEN 3 AND 500) IS NOT TRUE THEN
    RAISE EXCEPTION 'large_gift_threshold_reason_invalid'
      USING ERRCODE = '22023',
            DETAIL = 'A reason of 3 to 500 characters is required.';
  END IF;

  IF p_threshold_cents IS NOT NULL AND p_threshold_cents <= 0 THEN
    RAISE EXCEPTION 'large_gift_threshold_invalid'
      USING ERRCODE = '22023',
            DETAIL = 'The large-gift threshold is a positive number of cents, or NULL for none.';
  END IF;

  INSERT INTO public.contribution_approval_policies (tenant_id, updated_by)
  VALUES (v_ctx.tenant_id, v_ctx.actor_id)
  ON CONFLICT (tenant_id) DO NOTHING;

  SELECT p.large_gift_threshold_cents
    INTO v_before
    FROM public.contribution_approval_policies AS p
   WHERE p.tenant_id = v_ctx.tenant_id
     FOR UPDATE;

  UPDATE public.contribution_approval_policies AS p
     SET large_gift_threshold_cents = p_threshold_cents,
         updated_by = v_ctx.actor_id,
         updated_at = pg_catalog.clock_timestamp()
   WHERE p.tenant_id = v_ctx.tenant_id
  RETURNING p.large_gift_threshold_cents INTO v_after;

  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details
  )
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'large_gift_threshold_set',
    'contribution_approval_policy',
    v_ctx.tenant_id::TEXT,
    pg_catalog.jsonb_build_object(
      'reason', v_reason,
      'assignment_id', v_ctx.assignment_id,
      'before', v_before,
      'after', v_after
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'tenant_id', tenant_guard.current_tenant_id(),
    'large_gift_threshold_cents', v_after
  );
END;
$$;

CREATE FUNCTION tenant_guard.resolve_gift_hold(
  p_tenant_id UUID,
  p_hold_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_tenant_status TEXT;
  v_assignment RECORD;
  v_assignment_found BOOLEAN;
  v_capability_held BOOLEAN;
  v_reason TEXT;
  v_hold RECORD;
  v_found BOOLEAN;
  v_gift RECORD;
  v_contact RECORD;
  v_donor RECORD;
  v_recheck JSONB;
  v_open BIGINT;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'contributions.apply_corrections');

  v_tenant_status := private.share_lock_tenant(v_ctx.tenant_id);

  SELECT m.user_id, m.tenant_id, m.is_active, m.revoked_at
    INTO v_assignment
    FROM authz.memberships AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.id = v_ctx.assignment_id
     FOR SHARE;
  v_assignment_found := FOUND;

  v_capability_held := 'contributions.apply_corrections' = ANY (authz.assignment_capabilities(v_ctx.assignment_id));

  IF (v_tenant_status = 'active') IS NOT TRUE
     OR (
       v_assignment_found
       AND v_assignment.user_id = v_ctx.actor_id
       AND v_assignment.tenant_id = v_ctx.tenant_id
       AND v_assignment.is_active
       AND v_assignment.revoked_at IS NULL
     ) IS NOT TRUE
     OR v_capability_held IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: the caller no longer holds the authority this command requires'
      USING ERRCODE = '42501';
  END IF;

  v_reason := pg_catalog.btrim(COALESCE(p_reason, ''),
    E' \t\n\r\u000B\f                 　﻿');
  IF (pg_catalog.char_length(v_reason) BETWEEN 3 AND 500) IS NOT TRUE THEN
    RAISE EXCEPTION 'gift_hold_reason_invalid'
      USING ERRCODE = '22023',
            DETAIL = 'A reason of 3 to 500 characters is required.';
  END IF;

  SELECT h.id, h.staged_gift_id, h.donation_id, h.reason, h.details, h.resolved_at
    INTO v_hold
    FROM public.staged_gift_holds AS h
   WHERE h.tenant_id = v_ctx.tenant_id
     AND h.id = p_hold_id;
  v_found := FOUND;

  IF NOT v_found THEN
    RAISE EXCEPTION 'not_found'
      USING ERRCODE = '42501',
            DETAIL = 'No gift hold with this id in the entered organization.';
  END IF;

  SELECT g.id, g.status
    INTO v_gift
    FROM public.staged_gifts AS g
   WHERE g.tenant_id = v_ctx.tenant_id
     AND g.id = v_hold.staged_gift_id
     FOR NO KEY UPDATE;

  SELECT h.id, h.staged_gift_id, h.donation_id, h.reason, h.details, h.resolved_at
    INTO v_hold
    FROM public.staged_gift_holds AS h
   WHERE h.tenant_id = v_ctx.tenant_id
     AND h.id = p_hold_id
     FOR UPDATE;

  IF v_hold.resolved_at IS NOT NULL THEN
    RAISE EXCEPTION 'gift_hold_already_resolved'
      USING ERRCODE = '55000',
            DETAIL = 'This gift hold is resolved.';
  END IF;

  v_recheck := pg_catalog.jsonb_build_object('rechecked', false);

  IF v_hold.reason IN ('name_mismatch', 'possible_duplicate') THEN
    SELECT c.first_name, c.last_name, c.address
      INTO v_contact
      FROM public.donation_intake_contacts AS c
     WHERE c.tenant_id = v_ctx.tenant_id
       AND c.donation_id = v_hold.donation_id;

    IF v_hold.reason = 'name_mismatch' THEN
      SELECT d.id, d.name
        INTO v_donor
        FROM public.donors AS d
       WHERE d.tenant_id = v_ctx.tenant_id
         AND d.id = (v_hold.details ->> 'donor_id')::UUID;
      v_recheck := pg_catalog.jsonb_build_object(
        'rechecked', true,
        'holds', private.money_entered_name(v_contact.first_name, v_contact.last_name)
                   IS DISTINCT FROM private.money_norm(v_donor.name)
      );
    ELSE
      v_recheck := pg_catalog.jsonb_build_object(
        'rechecked', true,
        'candidates', pg_catalog.to_jsonb(private.money_duplicate_donors(
          v_ctx.tenant_id, v_contact.first_name, v_contact.last_name, v_contact.address,
          (v_hold.details ->> 'donor_id')::UUID))
      );
      v_recheck := v_recheck || pg_catalog.jsonb_build_object(
        'holds', pg_catalog.jsonb_array_length(v_recheck -> 'candidates') > 0);
    END IF;
  END IF;

  PERFORM pg_catalog.set_config('app.gift_hold_resolution', v_hold.id::TEXT, true);

  UPDATE public.staged_gift_holds
     SET resolved_at = pg_catalog.clock_timestamp(),
         resolved_by = v_ctx.actor_id,
         resolved_assignment_id = v_ctx.assignment_id,
         resolution_reason = v_reason,
         resolution_details = v_recheck
   WHERE tenant_id = v_ctx.tenant_id
     AND id = v_hold.id;

  PERFORM pg_catalog.set_config('app.gift_hold_resolution', '', true);

  SELECT pg_catalog.count(*)
    INTO v_open
    FROM public.staged_gift_holds AS h
   WHERE h.tenant_id = v_ctx.tenant_id
     AND h.staged_gift_id = v_hold.staged_gift_id
     AND h.resolved_at IS NULL;

  INSERT INTO public.audit_logs (
    tenant_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details
  )
  VALUES (
    v_ctx.tenant_id,
    v_ctx.actor_id,
    'gift_hold_resolved',
    'staged_gift',
    v_hold.staged_gift_id::TEXT,
    pg_catalog.jsonb_build_object(
      'hold_id', v_hold.id,
      'hold_reason', v_hold.reason,
      'reason', v_reason,
      'assignment_id', v_ctx.assignment_id,
      'recheck', v_recheck,
      'open_holds', v_open
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'tenant_id', tenant_guard.current_tenant_id(),
    'hold_id', v_hold.id,
    'staged_gift_id', v_hold.staged_gift_id,
    'hold_reason', v_hold.reason,
    'recheck', v_recheck,
    'open_holds', v_open
  );
END;
$$;

REVOKE ALL ON FUNCTION
  tenant_guard.set_large_gift_threshold(UUID, BIGINT, TEXT),
  tenant_guard.resolve_gift_hold(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION
  tenant_guard.set_large_gift_threshold(UUID, BIGINT, TEXT),
  tenant_guard.resolve_gift_hold(UUID, UUID, TEXT)
  TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.set_large_gift_threshold(UUID, BIGINT, TEXT) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.resolve_gift_hold(UUID, UUID, TEXT) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION public.set_large_gift_threshold(
  p_tenant_id UUID,
  p_threshold_cents BIGINT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.set_large_gift_threshold(p_tenant_id, p_threshold_cents, p_reason);
$$;

CREATE FUNCTION public.resolve_gift_hold(
  p_tenant_id UUID,
  p_hold_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.resolve_gift_hold(p_tenant_id, p_hold_id, p_reason);
$$;

REVOKE ALL ON FUNCTION
  public.set_large_gift_threshold(UUID, BIGINT, TEXT),
  public.resolve_gift_hold(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION
  public.set_large_gift_threshold(UUID, BIGINT, TEXT),
  public.resolve_gift_hold(UUID, UUID, TEXT)
  TO authenticated;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
