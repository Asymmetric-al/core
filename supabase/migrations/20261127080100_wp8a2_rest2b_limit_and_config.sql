-- AL-2681 (WP8a part 2 rest, PR 2b, item zero 5 and 6): the limit of gift
-- attempts in two buckets, and the config read told which surface asks.
-- GUEST_GIVING_ENABLED is never turned on in a deployment whose build is
-- older than this pull request: the build before it calls the dropped
-- public.checkout_giving_config(text, jsonb) behind that switch.
--
-- 1. private.intake_rate_attempts: one row a bucket and client key. A
--    bucket is the SHA-256 of 'guest:' || Site || ':' || address for a
--    website gift, of 'account:' || organization || ':' || address for an
--    account-area gift, and of 'person:' || user id for a signed-in gift; no
--    address and no key is stored, only their digests, and no API role holds
--    a grant on it. A row older than ten minutes is gone within one tick of
--    the money schedule (public.purge_intake_attempts), whether or not its
--    bucket is called again; its tenant key restricts deletion, so the
--    organization's rows are gone first.
-- 2. public.take_intake_attempt(host, surface, address, client key, user):
--    resolves the host as resolve_verified_host does (an unknown or inactive
--    host, or a surface it does not serve, is 42501 host_not_admitted and
--    writes nothing), serializes on each bucket's advisory lock in order, and
--    admits an attempt while the address bucket holds fewer than 30 unpaid
--    and fewer than 250 attempts in the rolling ten minutes and, for a
--    signed-in gift, the person bucket fewer than 6 unpaid and fewer than 15.
--    Paid means the key's intake is completed. A key that already began an
--    intake of the organization, or was already admitted in the bucket, is
--    free. A refusal answers retry_after_seconds (1 to 600), when the oldest
--    attempt that holds the bucket full leaves the window, and which bucket
--    refused ('address' or 'person', the one that holds longer).
-- 3. public.checkout_giving_config(host, targets, surface, source Site):
--    replaces checkout_giving_config(host, targets). 'website' needs a name
--    serving website with an active Site; 'donor_account' needs the
--    organization's home record serving donor_account. It answers the
--    connected account and, given a source Site, that Site's primary domain
--    when it is an active Site of the host's organization with an active
--    name serving website, else nothing (way_back_host).
-- 4. public.take_intake_rate_token(text) and private.intake_rate_windows are
--    dropped: no released build calls them (the build on develop calls the
--    token from an unmounted handler).
--
-- Recovery. Nothing here is written to run twice: a run lost between its
-- COMMIT and its ledger row stops on the next run at its CREATE TABLE
-- (42P07, relation "intake_rate_attempts" already exists). This file has
-- committed when this read-only check is true:
--   SELECT to_regclass('private.intake_rate_attempts') IS NOT NULL
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127080100.
--
-- Down, an operator's last resort, in one transaction:
--   SET LOCAL lock_timeout = '5s';
--   DROP FUNCTION public.checkout_giving_config(text, jsonb, text, uuid);
--   DROP FUNCTION public.purge_intake_attempts();
--   DROP FUNCTION public.take_intake_attempt(text, text, text, text, uuid);
--   DROP TABLE private.intake_rate_attempts;
--   re-run, verbatim, from 20261127050200: the CREATE TABLE of
--     private.intake_rate_windows with its index, row security and REVOKE,
--     the CREATE FUNCTION of public.take_intake_rate_token with its ALTER,
--     REVOKE and GRANT, and the CREATE FUNCTION of
--     public.checkout_giving_config with its ALTER, REVOKE and GRANT;
--   and restore the allowlist entry public.checkout_giving_config(p_host text, p_targets jsonb).

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE private.intake_rate_attempts (
  bucket_digest TEXT NOT NULL
    CONSTRAINT intake_rate_attempts_bucket_check CHECK (bucket_digest ~ '^[0-9a-f]{64}$'),
  key_digest TEXT NOT NULL
    CONSTRAINT intake_rate_attempts_key_check CHECK (key_digest ~ '^[0-9a-f]{64}$'),
  tenant_id UUID NOT NULL
    CONSTRAINT intake_rate_attempts_tenant_id_fkey REFERENCES public.tenants (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  CONSTRAINT intake_rate_attempts_pkey PRIMARY KEY (bucket_digest, key_digest)
);

CREATE INDEX intake_rate_attempts_created_idx ON private.intake_rate_attempts (created_at);
CREATE INDEX intake_rate_attempts_tenant_idx ON private.intake_rate_attempts (tenant_id);

ALTER TABLE private.intake_rate_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.intake_rate_attempts FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.intake_rate_attempts FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION public.take_intake_attempt(
  p_host TEXT,
  p_surface TEXT,
  p_address TEXT,
  p_client_key TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_tenant UUID;
  v_site UUID;
  v_address TEXT;
  v_key TEXT;
  v_since TIMESTAMPTZ;
  v_buckets TEXT[];
  v_limits INTEGER[];
  v_bucket TEXT;
  v_index INTEGER;
  v_unpaid BIGINT;
  v_total BIGINT;
  v_oldest_unpaid TIMESTAMPTZ;
  v_oldest TIMESTAMPTZ;
  v_until TIMESTAMPTZ;
  v_refused_until TIMESTAMPTZ;
  v_refused_bucket TEXT;
BEGIN
  v_address := pg_catalog.btrim(p_address);
  IF (v_address <> '' AND pg_catalog.char_length(v_address) <= 100) IS NOT TRUE THEN
    RAISE EXCEPTION 'rate_limit_address_required'
      USING ERRCODE = '22023',
            DETAIL = 'The limit counts by the client address the host platform sets.';
  END IF;
  IF (p_client_key IS NOT NULL
      AND pg_catalog.char_length(p_client_key) BETWEEN 1 AND 200
      AND p_client_key !~ '[[:cntrl:]]') IS NOT TRUE THEN
    RAISE EXCEPTION 'client_key_invalid'
      USING ERRCODE = '22023',
            DETAIL = 'A client key is 1 to 200 characters with no control character.';
  END IF;

  SELECT h.tenant_id, h.site_id
    INTO v_tenant, v_site
    FROM public.resolve_verified_host(p_host) AS h
   WHERE h.state = 'active'
     AND p_surface IN ('website', 'donor_account')
     AND p_surface = ANY (h.surfaces)
     AND (p_surface <> 'website' OR h.site_id IS NOT NULL)
     AND (p_surface <> 'donor_account' OR h.is_home);
  IF v_tenant IS NULL THEN
    RAISE EXCEPTION 'host_not_admitted'
      USING ERRCODE = '42501',
            DETAIL = 'The host is not an active name serving this surface.';
  END IF;

  v_key := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_client_key, 'UTF8')), 'hex');
  v_buckets := ARRAY[
    pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      CASE WHEN p_surface = 'website'
           THEN 'guest:' || v_site::TEXT
           ELSE 'account:' || v_tenant::TEXT END
      || ':' || v_address, 'UTF8')), 'hex')
  ];
  v_limits := ARRAY[30, 250];
  IF p_user_id IS NOT NULL THEN
    v_buckets := v_buckets || pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      'person:' || p_user_id::TEXT, 'UTF8')), 'hex');
    v_limits := v_limits || ARRAY[6, 15];
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('intake_attempt:' || b.digest, 0))
     FROM pg_catalog.unnest(v_buckets) AS b(digest)
    ORDER BY b.digest;

  v_since := pg_catalog.clock_timestamp() - INTERVAL '10 minutes';

  DELETE FROM private.intake_rate_attempts AS a
   WHERE (a.bucket_digest, a.key_digest) IN (
           SELECT o.bucket_digest, o.key_digest
             FROM private.intake_rate_attempts AS o
            WHERE o.created_at < v_since
            LIMIT 200
              FOR UPDATE SKIP LOCKED
         );

  IF EXISTS (
       SELECT 1
         FROM public.donation_intake_requests AS r
        WHERE r.tenant_id = v_tenant
          AND r.key_digest = v_key
     )
     OR EXISTS (
       SELECT 1
         FROM private.intake_rate_attempts AS a
        WHERE a.bucket_digest = v_buckets[1]
          AND a.key_digest = v_key
          AND a.created_at >= v_since
     ) THEN
    RETURN pg_catalog.jsonb_build_object('admitted', true, 'retry_after_seconds', NULL);
  END IF;

  FOR v_index IN 1 .. pg_catalog.array_length(v_buckets, 1) LOOP
    v_bucket := v_buckets[v_index];
    SELECT pg_catalog.count(*) FILTER (WHERE NOT x.paid),
           pg_catalog.count(*),
           pg_catalog.min(x.created_at) FILTER (WHERE NOT x.paid),
           pg_catalog.min(x.created_at)
      INTO v_unpaid, v_total, v_oldest_unpaid, v_oldest
      FROM (
        SELECT a.created_at,
               EXISTS (
                 SELECT 1
                   FROM public.donation_intake_requests AS r
                   JOIN public.donations AS d
                     ON d.tenant_id = r.tenant_id
                    AND d.id = r.donation_id
                  WHERE r.tenant_id = a.tenant_id
                    AND r.key_digest = a.key_digest
                    AND d.status = 'completed'
               ) AS paid
          FROM private.intake_rate_attempts AS a
         WHERE a.bucket_digest = v_bucket
           AND a.created_at >= v_since
      ) AS x;

    v_until := NULL;
    IF v_unpaid >= v_limits[v_index * 2 - 1] THEN
      v_until := v_oldest_unpaid + INTERVAL '10 minutes';
    END IF;
    IF v_total >= v_limits[v_index * 2] THEN
      v_until := GREATEST(v_until, v_oldest + INTERVAL '10 minutes');
    END IF;
    IF v_until IS NOT NULL AND (v_refused_until IS NULL OR v_until > v_refused_until) THEN
      v_refused_until := v_until;
      v_refused_bucket := CASE WHEN v_index = 1 THEN 'address' ELSE 'person' END;
    END IF;
  END LOOP;

  IF v_refused_until IS NOT NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'admitted', false,
      'retry_after_seconds', LEAST(600, GREATEST(1, pg_catalog.ceil(
        EXTRACT(EPOCH FROM v_refused_until - pg_catalog.clock_timestamp()))::INTEGER)),
      'bucket', v_refused_bucket
    );
  END IF;

  INSERT INTO private.intake_rate_attempts (bucket_digest, key_digest, tenant_id)
  SELECT b.digest, v_key, v_tenant
    FROM pg_catalog.unnest(v_buckets) AS b(digest)
  ON CONFLICT (bucket_digest, key_digest) DO UPDATE
    SET created_at = EXCLUDED.created_at,
        tenant_id = EXCLUDED.tenant_id;

  RETURN pg_catalog.jsonb_build_object('admitted', true, 'retry_after_seconds', NULL);
END;
$$;

ALTER FUNCTION public.take_intake_attempt(TEXT, TEXT, TEXT, TEXT, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.take_intake_attempt(TEXT, TEXT, TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.take_intake_attempt(TEXT, TEXT, TEXT, TEXT, UUID) TO service_role;

CREATE FUNCTION public.purge_intake_attempts()
RETURNS INTEGER
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_removed INTEGER;
BEGIN
  DELETE FROM private.intake_rate_attempts AS a
   WHERE a.created_at < pg_catalog.clock_timestamp() - INTERVAL '10 minutes';
  GET DIAGNOSTICS v_removed = ROW_COUNT;
  RETURN v_removed;
END;
$$;

ALTER FUNCTION public.purge_intake_attempts() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.purge_intake_attempts() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.purge_intake_attempts() TO service_role;

DROP FUNCTION public.checkout_giving_config(TEXT, JSONB);

CREATE FUNCTION public.checkout_giving_config(
  p_host TEXT,
  p_targets JSONB,
  p_surface TEXT,
  p_source_site UUID
)
RETURNS TABLE (connected_account_id TEXT, way_back_host TEXT)
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
         (p_surface = 'website'
          AND 'website' = ANY (d.surfaces)
          AND EXISTS (
            SELECT 1
              FROM public.sites AS s
             WHERE s.tenant_id = d.tenant_id
               AND s.id = d.site_id
               AND s.status = 'active'
          ))
         OR (p_surface = 'donor_account'
          AND 'donor_account' = ANY (d.surfaces)
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
  ),
  way_back AS (
    SELECT s.primary_domain
      FROM host
      JOIN public.sites AS s
        ON s.tenant_id = host.tenant_id
       AND s.id = p_source_site
       AND s.status = 'active'
      JOIN public.site_domains AS d
        ON d.tenant_id = s.tenant_id
       AND d.site_id = s.id
       AND d.host = s.primary_domain
       AND d.state = 'active'
       AND 'website' = ANY (d.surfaces)
  )
  SELECT b.provider_account_ref,
         (SELECT w.primary_domain FROM way_back AS w LIMIT 1)
    FROM entity
    JOIN host ON true
    JOIN public.payment_account_bindings AS b
      ON b.tenant_id = host.tenant_id
     AND b.legal_entity_id = entity.id
     AND b.livemode = false
     AND b.status = 'active';
$fn$;

ALTER FUNCTION public.checkout_giving_config(TEXT, JSONB, TEXT, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.checkout_giving_config(TEXT, JSONB, TEXT, UUID)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.checkout_giving_config(TEXT, JSONB, TEXT, UUID) TO anon, authenticated;

DROP FUNCTION public.take_intake_rate_token(TEXT);
DROP TABLE private.intake_rate_windows;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
