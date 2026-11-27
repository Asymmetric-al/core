-- AL-2681 (WP8a part 2 rest, PR 2a; plan lines 1125 and 1148; rulings
-- W8-R18 and the coordinator's rate-limit and schedule rulings of
-- 27 November): three reads and one counter the guest path calls. Nothing
-- live calls them yet.
--
-- 1. private.intake_rate_windows and public.take_intake_rate_token(address):
--    a fixed ten-minute window per client address, kept as the address's
--    SHA-256 digest, never the address. The token passes while the window
--    holds ten hits or fewer; the eleventh and later are refused. Each call
--    first removes up to 200 rows of windows that have ended (SKIP LOCKED,
--    so concurrent calls never wait on each other's trimming), so the table
--    holds the current window's addresses and a remainder that every call
--    shrinks. A postgres-owned definer with EXECUTE for service_role only;
--    the table has row security forced, no policy and no grant. A blank
--    address is refused (22023).
-- 2. public.checkout_giving_config(host, targets): the anonymous config
--    read. For an active claimed name serving 'website' with an active
--    Site, or the home record serving 'donor_account', of an active
--    organization, and 1 to 99 targets (funds that are active and not the
--    reserved fee-cover fund, or workers) that all resolve in that
--    organization to one legal entity with an active test-mode binding, it
--    returns one row, the binding's connected account; otherwise nothing,
--    the same nothing for every reason. A postgres-owned STABLE definer
--    with an empty search path and an explicit projection, EXECUTE for anon
--    and authenticated, listed in docs/security/anon-definer-allowlist.json;
--    anon and authenticated keep no grant on any table beneath it.
-- 3. public.money_due_work(limit): what the money schedule finds, up to
--    the limit of each kind: provider requests queued for two minutes (the
--    intake's route sends the first at once), waiting to retry and due, or
--    sending with an expired lease ('operation', the request kind);
--    line-based intakes pending or failed for seven days ('unpaid', D-08);
--    stored payment events received two minutes ago and unfinished, failed
--    and due, or processing with an expired lease ('payment_event', the
--    type), and connected-account events in the same states
--    ('account_event', the type and the account); each mapped test-mode
--    account whose binding is pending, active or restricted ('account',
--    its account), the least recently reconciled first. An invoker that
--    reads with clock_timestamp(); EXECUTE for
--    service_role only, which already reads those tables.
--
-- 4. public.payment_provider_accounts.reconciled_at: when the schedule last
--    handed the account's provider reading, or a failed read, to
--    tenant_guard.reconcile_payment_account (20261127050300), which stamps
--    it; the due work orders accounts by it, never read first, so every
--    account is read again within ceil(N / limit) ticks and a read that
--    keeps failing goes to the back. Visible on Mission Control only, like
--    the account's other times.
--
-- Locks, taken first and held to COMMIT: ACCESS EXCLUSIVE on
-- payment_provider_accounts for the new nullable column (no rewrite).
-- lock_timeout stops a run rather than queue it behind live traffic.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the
-- next run at ADD COLUMN reconciled_at (42701). This file
-- has committed when this read-only check is true:
--   SELECT to_regclass('private.intake_rate_windows') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127050200.
--
-- Down, in one transaction:
--   SET LOCAL lock_timeout = '5s';
--   DROP FUNCTION public.money_due_work(integer);
--   DROP FUNCTION public.checkout_giving_config(text, jsonb);
--   DROP FUNCTION public.take_intake_rate_token(text);
--   DROP TABLE private.intake_rate_windows;
--   DELETE FROM public.field_policies WHERE record_type = 'payment_provider_accounts'
--     AND field_key = 'reconciled_at';
--   ALTER TABLE public.payment_provider_accounts DROP COLUMN reconciled_at;

BEGIN;
SET LOCAL lock_timeout = '5s';

LOCK TABLE public.payment_provider_accounts IN ACCESS EXCLUSIVE MODE;

ALTER TABLE public.payment_provider_accounts ADD COLUMN reconciled_at TIMESTAMPTZ;

INSERT INTO public.field_policies (
  record_type, field_key, surface, visible, editable, exportable, sensitivity_category
)
SELECT 'payment_provider_accounts', 'reconciled_at', s.surface, s.surface = 'mission_control',
       false, false, 'internal'::public.field_sensitivity_category
  FROM unnest(ARRAY['mission_control', 'donor', 'missionary', 'public', 'export']) AS s(surface);

CREATE TABLE private.intake_rate_windows (
  address_digest TEXT NOT NULL
    CONSTRAINT intake_rate_windows_digest_check CHECK (address_digest ~ '^[0-9a-f]{64}$'),
  window_start TIMESTAMPTZ NOT NULL,
  hits INTEGER NOT NULL
    CONSTRAINT intake_rate_windows_hits_check CHECK (hits >= 1),
  CONSTRAINT intake_rate_windows_pkey PRIMARY KEY (address_digest, window_start)
);

CREATE INDEX intake_rate_windows_window_idx ON private.intake_rate_windows (window_start);

ALTER TABLE private.intake_rate_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.intake_rate_windows FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.intake_rate_windows FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION public.take_intake_rate_token(p_address TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_address TEXT;
  v_digest TEXT;
  v_window TIMESTAMPTZ;
  v_hits INTEGER;
BEGIN
  v_address := pg_catalog.btrim(p_address);
  IF (v_address <> '' AND pg_catalog.char_length(v_address) <= 100) IS NOT TRUE THEN
    RAISE EXCEPTION 'rate_limit_address_required'
      USING ERRCODE = '22023',
            DETAIL = 'The rate limit counts by the client address the host platform sets.';
  END IF;

  v_digest := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_address, 'UTF8')), 'hex');
  v_window := pg_catalog.date_bin(
    INTERVAL '10 minutes',
    pg_catalog.now(),
    TIMESTAMPTZ '2000-01-01 00:00:00+00'
  );

  DELETE FROM private.intake_rate_windows AS w
   WHERE (w.address_digest, w.window_start) IN (
           SELECT o.address_digest, o.window_start
             FROM private.intake_rate_windows AS o
            WHERE o.window_start < v_window
            LIMIT 200
              FOR UPDATE SKIP LOCKED
         );

  INSERT INTO private.intake_rate_windows AS w (address_digest, window_start, hits)
  VALUES (v_digest, v_window, 1)
  ON CONFLICT (address_digest, window_start) DO UPDATE
    SET hits = w.hits + 1
  RETURNING w.hits INTO v_hits;

  RETURN v_hits <= 10;
END;
$$;

ALTER FUNCTION public.take_intake_rate_token(TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.take_intake_rate_token(TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.take_intake_rate_token(TEXT) TO service_role;

CREATE FUNCTION public.checkout_giving_config(p_host TEXT, p_targets JSONB)
RETURNS TABLE (connected_account_id TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
  WITH host AS (
    SELECT d.tenant_id
      FROM public.site_domains AS d
      JOIN public.tenants AS t
        ON t.id = d.tenant_id
       AND t.status = 'active'
     WHERE d.host = CASE
             WHEN pg_catalog.octet_length(p_host) <= 300
             THEN pg_catalog.lower(pg_catalog.regexp_replace(p_host COLLATE "C", '\.?(:[0-9]+)?$', ''))
           END
       AND d.state = 'active'
       AND (
         ('website' = ANY (d.surfaces)
          AND EXISTS (
            SELECT 1
              FROM public.sites AS s
             WHERE s.tenant_id = d.tenant_id
               AND s.id = d.site_id
               AND s.status = 'active'
          ))
         OR ('donor_account' = ANY (d.surfaces)
          AND EXISTS (
            SELECT 1
              FROM public.donor_portal_hosts AS h
             WHERE h.tenant_id = d.tenant_id
               AND h.primary_domain = d.host
          ))
       )
  ),
  asked AS (
    SELECT e.value
      FROM pg_catalog.jsonb_array_elements(
             CASE
               WHEN pg_catalog.jsonb_typeof(p_targets) = 'array'
                    AND pg_catalog.jsonb_array_length(p_targets) BETWEEN 1 AND 99
               THEN p_targets
               ELSE '[]'::JSONB
             END
           ) AS e(value)
  ),
  resolved AS (
    SELECT f.legal_entity_id AS entity
      FROM asked AS a
      JOIN host ON true
      JOIN public.funds AS f
        ON f.tenant_id = host.tenant_id
       AND f.id::TEXT = pg_catalog.lower(a.value ->> 'fund_id')
       AND f.is_active
       AND NOT f.is_reserved_fee_cover
     WHERE NOT (a.value ? 'missionary_id')
    UNION ALL
    SELECT m.legal_entity_id
      FROM asked AS a
      JOIN host ON true
      JOIN public.missionaries AS m
        ON m.tenant_id = host.tenant_id
       AND m.id::TEXT = pg_catalog.lower(a.value ->> 'missionary_id')
     WHERE NOT (a.value ? 'fund_id')
  ),
  entity AS (
    SELECT pg_catalog.min(r.entity::TEXT)::UUID AS id
      FROM resolved AS r
    HAVING pg_catalog.count(*) > 0
       AND pg_catalog.count(*) = (SELECT pg_catalog.count(*) FROM asked)
       AND pg_catalog.count(DISTINCT r.entity) = 1
  )
  SELECT b.provider_account_ref
    FROM entity
    JOIN host ON true
    JOIN public.payment_account_bindings AS b
      ON b.tenant_id = host.tenant_id
     AND b.legal_entity_id = entity.id
     AND b.livemode = false
     AND b.status = 'active';
$fn$;

ALTER FUNCTION public.checkout_giving_config(TEXT, JSONB) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.checkout_giving_config(TEXT, JSONB) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.checkout_giving_config(TEXT, JSONB) TO anon, authenticated;

CREATE FUNCTION public.money_due_work(p_limit INTEGER)
RETURNS TABLE (kind TEXT, id UUID, tenant_id UUID, detail TEXT)
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $fn$
  (SELECT 'operation'::TEXT, o.id, o.tenant_id, o.request_kind
     FROM public.donation_saga_outbox AS o
    WHERE o.kind = 'provider_request'
      AND ((o.status = 'queued' AND o.next_attempt_at <= pg_catalog.clock_timestamp() - INTERVAL '2 minutes')
           OR (o.status = 'retry_wait' AND o.next_attempt_at <= pg_catalog.clock_timestamp())
           OR (o.status = 'sending' AND o.lease_expires_at < pg_catalog.clock_timestamp()))
    ORDER BY o.next_attempt_at, o.id
    LIMIT p_limit)
  UNION ALL
  (SELECT 'unpaid'::TEXT, d.id, d.tenant_id, NULL::TEXT
     FROM public.donations AS d
    WHERE d.intake_format = 'line_based'
      AND d.status IN ('pending', 'failed')
      AND d.created_at <= pg_catalog.clock_timestamp() - INTERVAL '7 days'
    ORDER BY d.created_at, d.id
    LIMIT p_limit)
  UNION ALL
  (SELECT CASE WHEN e.event_type LIKE 'v2.core.account%' THEN 'account_event' ELSE 'payment_event' END,
          e.id,
          e.tenant_id,
          CASE WHEN e.event_type LIKE 'v2.core.account%'
               THEN e.event_type || '|' || e.provider_account_id
               ELSE e.event_type END
     FROM public.stripe_connect_events AS e
    WHERE e.tenant_id IS NOT NULL
      AND ((e.processing_status = 'received' AND e.received_at <= pg_catalog.clock_timestamp() - INTERVAL '2 minutes')
           OR (e.processing_status = 'failed' AND e.next_attempt_at <= pg_catalog.clock_timestamp())
           OR (e.processing_status = 'processing' AND e.lease_expires_at < pg_catalog.clock_timestamp()))
    ORDER BY e.received_at, e.id
    LIMIT p_limit)
  UNION ALL
  (SELECT 'account'::TEXT, a.id, a.tenant_id, a.provider_account_id
     FROM public.payment_provider_accounts AS a
     JOIN public.payment_account_bindings AS b
       ON b.tenant_id = a.tenant_id
      AND b.legal_entity_id = a.legal_entity_id
      AND b.provider_account_ref = a.provider_account_id
      AND b.livemode = a.livemode
    WHERE a.livemode = false
      AND b.status IN ('pending', 'active', 'restricted')
    ORDER BY a.reconciled_at NULLS FIRST, a.id
    LIMIT p_limit);
$fn$;

REVOKE ALL ON FUNCTION public.money_due_work(INTEGER) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.money_due_work(INTEGER) TO service_role;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
