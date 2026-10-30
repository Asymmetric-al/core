-- #2254 (#506 slice a): the canonical identity email normalizer and the two
-- donors identity keys. Contract: docs/security/identity-email-normalization.md.
--
-- Statement order (Samson's rulings, Oct 24, 2026):
--   1. UTF8 assertion (NFKC normalization needs a UTF8 database).
--   2. Duplicate pre-check, before any DDL. It inlines the normalization
--      expression, because the function does not exist yet. On any duplicate
--      group it raises one exception that lists ids only (key_kind, tenant_id,
--      donor_ids) and no email text. Nothing is merged or rewritten. The
--      migration verifier applies files without --single-transaction, so the
--      check must run first for a failure to leave the schema unchanged.
--   3. public.normalize_email, then a parity assertion that the inlined
--      expression and the function agree (fixture and every existing row).
--   4. donors.email_normalized (generated), donors.email_verified_at, the
--      (tenant_id, profile_id) key, the partial email key and the reviewed
--      field_policies rows (docs/security/field-policies/
--      repository-supplement-v2-donor-identity.json).
--
-- email_verified_at has no default and no trigger; only the verified
-- possession claim path (#509, via #508) may set it. The email key counts
-- merged donors too (Q7); merge execution (#512) owns that case.

DO $$
BEGIN
  IF (
    SELECT pg_catalog.pg_encoding_to_char(encoding)
    FROM pg_catalog.pg_database
    WHERE datname = current_database()
  ) IS DISTINCT FROM 'UTF8' THEN
    RAISE EXCEPTION '#2254: the identity email normalizer requires a UTF8 database'
      USING ERRCODE = 'feature_not_supported';
  END IF;
END
$$;

DO $$
DECLARE
  v_group_count bigint;
  v_report text;
BEGIN
  WITH duplicate_groups AS (
    SELECT 'email_normalized'::text AS key_kind,
           n.tenant_id,
           array_agg(n.id ORDER BY n.id) AS donor_ids
    FROM (
      SELECT d.id,
             d.tenant_id,
             NULLIF(btrim(lower(normalize(d.email, NFKC)), E' \t\r\n'), '') AS email_key
      FROM public.donors d
      WHERE d.tenant_id IS NOT NULL
    ) n
    WHERE n.email_key IS NOT NULL
    GROUP BY n.tenant_id, n.email_key
    HAVING count(*) > 1
    UNION ALL
    SELECT 'profile_id'::text,
           d.tenant_id,
           array_agg(d.id ORDER BY d.id)
    FROM public.donors d
    WHERE d.tenant_id IS NOT NULL
      AND d.profile_id IS NOT NULL
    GROUP BY d.tenant_id, d.profile_id
    HAVING count(*) > 1
  ),
  ranked AS (
    SELECT g.*,
           row_number() OVER (ORDER BY g.key_kind, g.tenant_id, g.donor_ids) AS rn
    FROM duplicate_groups g
  )
  SELECT count(*),
         string_agg(
           format('(%s, %s, %s)', r.key_kind, r.tenant_id, r.donor_ids),
           '; ' ORDER BY r.rn
         ) FILTER (WHERE r.rn <= 50)
  INTO v_group_count, v_report
  FROM ranked r;

  IF v_group_count > 0 THEN
    RAISE EXCEPTION '#2254 pre-check: % duplicate donor group(s) block the donors identity keys; no rows or schema were changed. First 50 groups (key_kind, tenant_id, donor_ids): %',
      v_group_count, v_report
      USING ERRCODE = 'unique_violation',
            HINT = 'Run the read-only preflight in docs/security/identity-email-normalization.md, resolve each group by hand, then apply the migrations again.';
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.normalize_email(raw text)
RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT NULLIF(btrim(lower(normalize(raw, NFKC)), E' \t\r\n'), '')
$$;

COMMENT ON FUNCTION public.normalize_email(text) IS
  'The only producer of normalized identity emails: NFKC, then lowercase, then trim; blank is NULL. No plus-tag or dot folding. #2254.';

DO $$
DECLARE
  v_fixture_mismatches text;
  v_row_mismatches bigint;
BEGIN
  SELECT string_agg(f.ord::text, ', ' ORDER BY f.ord)
  INTO v_fixture_mismatches
  FROM (
    VALUES
      (1, ' Foo@Bar.COM ', 'foo@bar.com'),
      (2, 'ＦＯＯ@ＢＡＲ.ＣＯＭ', 'foo@bar.com'),
      (3, U&'\00A0a@x.com\3000', 'a@x.com'),
      (4, U&'jos\00E9@x.com', U&'jos\00E9@x.com'),
      (5, U&'jose\0301@x.com', U&'jos\00E9@x.com'),
      (6, 'ﬁ@x.com', 'fi@x.com'),
      (7, 'A+Tag@X.com', 'a+tag@x.com'),
      (8, 'A.B@Gmail.com', 'a.b@gmail.com'),
      (9, '   ', NULL),
      (10, NULL, NULL)
  ) AS f(ord, raw, expected)
  WHERE NULLIF(btrim(lower(normalize(f.raw, NFKC)), E' \t\r\n'), '')
          IS DISTINCT FROM public.normalize_email(f.raw)
     OR public.normalize_email(f.raw) IS DISTINCT FROM f.expected;

  SELECT count(*)
  INTO v_row_mismatches
  FROM public.donors d
  WHERE NULLIF(btrim(lower(normalize(d.email, NFKC)), E' \t\r\n'), '')
          IS DISTINCT FROM public.normalize_email(d.email);

  IF v_fixture_mismatches IS NOT NULL OR v_row_mismatches > 0 THEN
    RAISE EXCEPTION '#2254 parity: the pre-check expression and public.normalize_email disagree (fixture cases: %; donor rows: %)',
      coalesce(v_fixture_mismatches, 'none'), v_row_mismatches;
  END IF;
END
$$;

-- One table rewrite for both columns.
ALTER TABLE public.donors
  ADD COLUMN IF NOT EXISTS email_normalized text GENERATED ALWAYS AS (public.normalize_email(email)) STORED,
  ADD COLUMN IF NOT EXISTS email_verified_at timestamptz NULL;

COMMENT ON COLUMN public.donors.email_normalized IS
  'Generated: always public.normalize_email(email); never written directly. #2254.';
COMMENT ON COLUMN public.donors.email_verified_at IS
  'NULL until the verified-possession claim path (#509) records proof; no default or trigger. #2254.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.donors'::regclass
      AND conname = 'donors_tenant_id_profile_id_key'
  ) THEN
    ALTER TABLE public.donors
      ADD CONSTRAINT donors_tenant_id_profile_id_key UNIQUE (tenant_id, profile_id);
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS donors_tenant_email_normalized_uidx
  ON public.donors (tenant_id, email_normalized)
  WHERE email_normalized IS NOT NULL;

-- Reviewed supplement v2 (Q11): both columns are contact; never editable or
-- exportable; visibility mirrors donors.email, with email_verified_at hidden
-- from missionaries.
INSERT INTO public.field_policies
(record_type,field_key,surface,tenant_id,visible,editable,exportable,sensitivity_category) VALUES
  ('donors','email_normalized','mission_control',NULL,true,false,false,'contact'),
  ('donors','email_normalized','donor',NULL,true,false,false,'contact'),
  ('donors','email_normalized','missionary',NULL,true,false,false,'contact'),
  ('donors','email_normalized','public',NULL,false,false,false,'contact'),
  ('donors','email_normalized','export',NULL,false,false,false,'contact'),
  ('donors','email_verified_at','mission_control',NULL,true,false,false,'contact'),
  ('donors','email_verified_at','donor',NULL,true,false,false,'contact'),
  ('donors','email_verified_at','missionary',NULL,false,false,false,'contact'),
  ('donors','email_verified_at','public',NULL,false,false,false,'contact'),
  ('donors','email_verified_at','export',NULL,false,false,false,'contact')
ON CONFLICT ON CONSTRAINT field_policies_lookup_key DO NOTHING;
