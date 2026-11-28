-- AL-2671 (N4, pull request 1; brief stage5/n4.md, PR 1 invariants 2 to 4
-- and 10; tasks 6.2): Core's sign-in limits, per account and per address.
--
-- private.sign_in_windows counts, in fixed fifteen-minute windows, every
-- password attempt that is in flight or was refused, twice: once against the
-- account (kind 'account') and once against the client address it came from
-- (kind 'address'). Both keys are stored only as SHA-256 digests. The account
-- key is the login's address in the provider's own normalisation (Core's auth
-- handlers make it, pinned by a test against the installed provider); the
-- client address is the one the host platform sets and overwrites, an IPv6
-- address counted by its /64.
--
-- public.take_sign_in_attempt(account, address) reserves the attempt in both
-- counts in one statement, under the rows' own locks, and answers whether it
-- may go to the provider: not past 10 for the account nor past 30 for the
-- address in the window. A refused attempt takes no reservation. So a burst of
-- parallel attempts never sends more than the limit to the provider.
-- public.release_sign_in_attempt(account, address, cleared) gives a
-- reservation back when the provider accepted the password (cleared: the
-- account's count goes to zero) or failed itself (cleared false); a refused
-- password keeps its reservation, which is its count.
-- public.clear_sign_in_account(account) clears an account's count after a
-- password is saved through recovery. A limit ends with its window; recovery
-- never consults either count.
--
-- All three are SECURITY DEFINER, owned by postgres, with an empty search
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
-- to_regprocedure('public.clear_sign_in_account(text)') IS NOT NULL. Then
-- follow docs/ops/release-job.md, "If the migration committed but its ledger
-- row is missing", with this check and this file's version, 20261127100000.
--
-- Down (only after the build that calls them is rolled back; in one
-- transaction): DROP FUNCTION public.clear_sign_in_account(text),
-- public.release_sign_in_attempt(text, text, boolean),
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
    CONSTRAINT sign_in_windows_hits_check CHECK (hits >= 0),
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
  v_account_digest TEXT;
  v_address_digest TEXT;
  v_account_hits INTEGER;
  v_address_hits INTEGER;
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
  v_account_digest := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_account, 'UTF8')), 'hex');
  v_address_digest := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_address, 'UTF8')), 'hex');

  DELETE FROM private.sign_in_windows AS w
   WHERE (w.kind, w.key_digest, w.window_start) IN (
           SELECT o.kind, o.key_digest, o.window_start
             FROM private.sign_in_windows AS o
            WHERE o.window_start < v_window
            LIMIT 200
              FOR UPDATE SKIP LOCKED
         );

  WITH reserved AS (
    INSERT INTO private.sign_in_windows AS w (kind, key_digest, window_start, hits)
    VALUES
      ('account', v_account_digest, v_window, 1),
      ('address', v_address_digest, v_window, 1)
    ON CONFLICT (kind, key_digest, window_start) DO UPDATE
      SET hits = w.hits + 1
    RETURNING w.kind, w.hits
  )
  SELECT pg_catalog.max(r.hits) FILTER (WHERE r.kind = 'account'),
         pg_catalog.max(r.hits) FILTER (WHERE r.kind = 'address')
    INTO v_account_hits, v_address_hits
    FROM reserved AS r;

  IF v_account_hits <= 10 AND v_address_hits <= 30 THEN
    RETURN TRUE;
  END IF;

  UPDATE private.sign_in_windows AS w
     SET hits = w.hits - 1
   WHERE w.window_start = v_window
     AND ((w.kind = 'account' AND w.key_digest = v_account_digest)
       OR (w.kind = 'address' AND w.key_digest = v_address_digest));
  RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION public.take_sign_in_attempt(TEXT, TEXT) IS
  'Core''s sign-in limits (AL-2671 N4 PR 1): reserves one password attempt '
  'against the account and the client address under the rows'' locks and '
  'answers whether it may go to the provider: not past 10 for the account nor '
  '30 for the address in a fifteen-minute window. A refusal reserves nothing.';

ALTER FUNCTION public.take_sign_in_attempt(TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.take_sign_in_attempt(TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.take_sign_in_attempt(TEXT, TEXT) TO service_role;

CREATE FUNCTION public.release_sign_in_attempt(
  p_account TEXT,
  p_address TEXT,
  p_cleared BOOLEAN
)
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
  IF p_cleared IS NULL THEN
    RAISE EXCEPTION 'sign_in_release_outcome_required' USING ERRCODE = '22023';
  END IF;

  v_window := pg_catalog.date_bin(
    INTERVAL '15 minutes',
    pg_catalog.now(),
    TIMESTAMPTZ '2000-01-01 00:00:00+00'
  );

  UPDATE private.sign_in_windows AS w
     SET hits = CASE
                  WHEN w.kind = 'account' AND p_cleared THEN 0
                  ELSE GREATEST(w.hits - 1, 0)
                END
   WHERE w.window_start = v_window
     AND ((w.kind = 'account'
           AND w.key_digest = pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_account, 'UTF8')), 'hex'))
       OR (w.kind = 'address'
           AND w.key_digest = pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_address, 'UTF8')), 'hex')));
END;
$$;

COMMENT ON FUNCTION public.release_sign_in_attempt(TEXT, TEXT, BOOLEAN) IS
  'Core''s sign-in limits (AL-2671 N4 PR 1): gives back the reservation of an '
  'attempt the provider answered without refusing the password; cleared sets '
  'the account''s count to zero (the password was accepted). Digests only.';

ALTER FUNCTION public.release_sign_in_attempt(TEXT, TEXT, BOOLEAN) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.release_sign_in_attempt(TEXT, TEXT, BOOLEAN) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.release_sign_in_attempt(TEXT, TEXT, BOOLEAN) TO service_role;

CREATE FUNCTION public.clear_sign_in_account(p_account TEXT)
RETURNS VOID
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_account TEXT;
BEGIN
  v_account := pg_catalog.btrim(p_account);
  IF (v_account <> '' AND pg_catalog.char_length(v_account) <= 320) IS NOT TRUE THEN
    RAISE EXCEPTION 'sign_in_account_required'
      USING ERRCODE = '22023',
            DETAIL = 'The limit counts by the account address in the provider''s normalisation.';
  END IF;

  UPDATE private.sign_in_windows AS w
     SET hits = 0
   WHERE w.kind = 'account'
     AND w.key_digest = pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_account, 'UTF8')), 'hex')
     AND w.window_start = pg_catalog.date_bin(
           INTERVAL '15 minutes',
           pg_catalog.now(),
           TIMESTAMPTZ '2000-01-01 00:00:00+00'
         );
END;
$$;

COMMENT ON FUNCTION public.clear_sign_in_account(TEXT) IS
  'Core''s sign-in limits (AL-2671 N4 PR 1): sets an account''s count in the '
  'current window to zero after a password is saved through recovery.';

ALTER FUNCTION public.clear_sign_in_account(TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.clear_sign_in_account(TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.clear_sign_in_account(TEXT) TO service_role;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
