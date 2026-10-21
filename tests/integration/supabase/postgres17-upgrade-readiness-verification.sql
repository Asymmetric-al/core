\set ON_ERROR_STOP on
-- Run only in a disposable database. The probe and its metadata are rolled back.
BEGIN;
CREATE FUNCTION pg_temp.modernization_mixed_case_pgp_probe() RETURNS bytea
LANGUAGE sql AS $$ SELECT extensions.PGP_Sym_ENCRYPT('synthetic value', 'synthetic passphrase') $$;
CREATE FUNCTION pg_temp.modernization_sql_standard_pgp_probe() RETURNS bytea
LANGUAGE sql BEGIN ATOMIC
  SELECT extensions.PGP_Sym_ENCRYPT('synthetic value', 'synthetic passphrase');
END;
-- CORE_POSTGRES_UPGRADE_READINESS_QUERY
SELECT EXISTS (
  SELECT 1 FROM jsonb_array_elements_text(:'readiness_modernization_postgres_readiness'::jsonb->'storedPgpFunctionCandidates') AS candidate
  WHERE candidate LIKE '%.modernization_mixed_case_pgp_probe'
) AS mixed_case_detected \gset
\if :mixed_case_detected
\else
  \echo 'Postgres preflight missed mixed-case PGP source'
  DO $$ BEGIN RAISE EXCEPTION 'Postgres preflight missed mixed-case PGP source'; END $$;
\endif
SELECT EXISTS (
  SELECT 1 FROM jsonb_array_elements_text(:'readiness_modernization_postgres_readiness'::jsonb->'storedPgpFunctionCandidates') AS candidate
  WHERE candidate LIKE '%.modernization_sql_standard_pgp_probe'
) AS sql_standard_detected \gset
\if :sql_standard_detected
\else
  \echo 'Postgres preflight missed SQL-standard PGP source'
  DO $$ BEGIN RAISE EXCEPTION 'Postgres preflight missed SQL-standard PGP source'; END $$;
\endif
ROLLBACK;
