-- AL-2671 (N4, pull request 1; brief stage5/n4.md, PR 1 invariants 2 to 4
-- and 10; tasks 6.2): Core's sign-in limits, per account and per address.
--
-- private.sign_in_windows counts refused passwords in fixed fifteen-minute
-- windows, twice: once against the account (kind 'account') and once against
-- the client address the attempt came from (kind 'address'). Both keys are
-- stored only as SHA-256 digests. The account key is the login's address in
-- the provider's own normalisation (Core's adapter applies it, pinned by a
-- test against the installed provider); the client address is the one the
-- host platform sets and overwrites. A password the provider accepts counts
-- nothing.
--
-- public.take_sign_in_attempt(account, address) trims ended windows and
-- answers whether an attempt may go to the provider: false once the address
-- has 30 refused passwords in the window, across any accounts, or the account
-- has 10, from any addresses. public.record_sign_in_failure(account, address)
-- counts one refused password against both. A limit ends with its window, so
-- neither can hold a person out for longer than fifteen minutes at a time;
-- recovery never consults either.
--
-- Both functions are SECURITY DEFINER, owned by postgres, with an empty search
-- path; they name nothing in `auth` and take no organization. EXECUTE goes to
-- service_role alone; none to PUBLIC, anon or authenticated. The table is in
-- private with row security forced and no privilege for any API role.
--
-- Locks: none on an existing object. lock_timeout stops a run rather than
-- queue it.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops on the next
-- run at its first CREATE (private.sign_in_windows, 42P07), rolling back. This
-- file has committed when this read-only check is true: SELECT
-- to_regprocedure('public.record_sign_in_failure(text, text)') IS NOT NULL.
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127100000.
--
-- Down (only after the build that calls them is rolled back; in one
-- transaction): DROP FUNCTION public.record_sign_in_failure(text, text),
-- public.take_sign_in_attempt(text, text); DROP TABLE private.sign_in_windows;
-- then NOTIFY pgrst, 'reload schema';

BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE private.sign_in_windows (
  kind TEXT NOT NULL
    CONSTRAINT sign_in_windows_kind_check CHECK (kind IN ('account', 'address')),
  key_digest TEXT NOT NULL
    CONSTRAINT sign_in_windows_digest_check CHECK (key_digest ~ '^[0-9a-f]{64}$'),
  window_start TIMESTAMPTZ NOT NULL,
  hits INTEGER NOT NULL
    CONSTRAINT sign_in_windows_hits_check CHECK (hits >= 1),
  CONSTRAINT sign_in_windows_pkey PRIMARY KEY (kind, key_digest, window_start)
);

CREATE INDEX sign_in_windows_window_idx ON private.sign_in_windows (window_start);

ALTER TABLE private.sign_in_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.sign_in_windows FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.sign_in_windows FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION public.take_sign_in_attempt(p_account TEXT, p_address TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_account TEXT;
  v_address TEXT;
  v_window TIMESTAMPTZ;
  v_address_failures INTEGER;
  v_account_failures INTEGER;
BEGIN
  v_account := pg_catalog.btrim(p_account);
  IF (v_account <> '' AND pg_catalog.char_length(v_account) <= 320) IS NOT TRUE THEN
    RAISE EXCEPTION 'sign_in_account_required'
      USING ERRCODE = '22023',
            DETAIL = 'The limit counts by the account address in the provider''s normalisation.';
  END IF;
  v_address := pg_catalog.btrim(p_address);
  IF (v_address <> '' AND pg_catalog.char_length(v_address) <= 100) IS NOT TRUE THEN
    RAISE EXCEPTION 'sign_in_address_required'
      USING ERRCODE = '22023',
            DETAIL = 'The limit counts by the client address the host platform sets.';
  END IF;

  v_window := pg_catalog.date_bin(
    INTERVAL '15 minutes',
    pg_catalog.now(),
    TIMESTAMPTZ '2000-01-01 00:00:00+00'
  );

  DELETE FROM private.sign_in_windows AS w
   WHERE (w.kind, w.key_digest, w.window_start) IN (
           SELECT o.kind, o.key_digest, o.window_start
             FROM private.sign_in_windows AS o
            WHERE o.window_start < v_window
            LIMIT 200
              FOR UPDATE SKIP LOCKED
         );

  SELECT w.hits
    INTO v_address_failures
    FROM private.sign_in_windows AS w
   WHERE w.kind = 'address'
     AND w.key_digest = pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_address, 'UTF8')), 'hex')
     AND w.window_start = v_window;

  SELECT w.hits
    INTO v_account_failures
    FROM private.sign_in_windows AS w
   WHERE w.kind = 'account'
     AND w.key_digest = pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_account, 'UTF8')), 'hex')
     AND w.window_start = v_window;

  RETURN COALESCE(v_address_failures, 0) < 30 AND COALESCE(v_account_failures, 0) < 10;
END;
$$;

COMMENT ON FUNCTION public.take_sign_in_attempt(TEXT, TEXT) IS
  'Core''s sign-in limits (AL-2671 N4 PR 1): answers whether a password attempt '
  'may go to the provider: not at 30 refused passwords from the client address, '
  'nor at 10 for the account, in a fifteen-minute window. Trims ended windows.';

ALTER FUNCTION public.take_sign_in_attempt(TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.take_sign_in_attempt(TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.take_sign_in_attempt(TEXT, TEXT) TO service_role;

CREATE FUNCTION public.record_sign_in_failure(p_account TEXT, p_address TEXT)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_account TEXT;
  v_address TEXT;
  v_window TIMESTAMPTZ;
BEGIN
  v_account := pg_catalog.btrim(p_account);
  IF (v_account <> '' AND pg_catalog.char_length(v_account) <= 320) IS NOT TRUE THEN
    RAISE EXCEPTION 'sign_in_account_required'
      USING ERRCODE = '22023',
            DETAIL = 'The limit counts by the account address in the provider''s normalisation.';
  END IF;
  v_address := pg_catalog.btrim(p_address);
  IF (v_address <> '' AND pg_catalog.char_length(v_address) <= 100) IS NOT TRUE THEN
    RAISE EXCEPTION 'sign_in_address_required'
      USING ERRCODE = '22023',
            DETAIL = 'The limit counts by the client address the host platform sets.';
  END IF;

  v_window := pg_catalog.date_bin(
    INTERVAL '15 minutes',
    pg_catalog.now(),
    TIMESTAMPTZ '2000-01-01 00:00:00+00'
  );

  INSERT INTO private.sign_in_windows AS w (kind, key_digest, window_start, hits)
  VALUES
    (
      'account',
      pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_account, 'UTF8')), 'hex'),
      v_window,
      1
    ),
    (
      'address',
      pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_address, 'UTF8')), 'hex'),
      v_window,
      1
    )
  ON CONFLICT (kind, key_digest, window_start) DO UPDATE
    SET hits = w.hits + 1;
END;
$$;

COMMENT ON FUNCTION public.record_sign_in_failure(TEXT, TEXT) IS
  'Core''s sign-in limits (AL-2671 N4 PR 1): counts one refused password against '
  'the account and the client address in the current fifteen-minute window. '
  'Digests only.';

ALTER FUNCTION public.record_sign_in_failure(TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.record_sign_in_failure(TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_sign_in_failure(TEXT, TEXT) TO service_role;

COMMIT;
