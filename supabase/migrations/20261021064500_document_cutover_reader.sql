-- #2067 addendum 4: restricted read path for the document-cutover gate.
--
-- The gate connects as document_cutover_reader (a dedicated Postgres role, not
-- a PostgREST key) and reads only through the counts-only SECURITY DEFINER
-- functions below. The schema is private: it is NOT listed in
-- supabase/config.toml [api] schemas, so PostgREST never exposes it.
--
-- Every function is owned by postgres, sets search_path = '' and
-- row_security = off, and only reads. postgres has BYPASSRLS on Supabase (and
-- is a superuser on plain Postgres), so the functions see every row; if a read
-- would still be filtered by row-level security, row_security = off makes it
-- raise, so the gate stops instead of recording a clean proof from filtered
-- reads.
--
-- The role is created NOLOGIN with no password. Enabling it is the one-time
-- deploy prerequisite (ALTER ROLE ... WITH LOGIN PASSWORD '<generated>' in the
-- SQL editor); no password lives in this repository.
--
-- Function names, arguments and result columns follow
-- packages/api/src/document-cutover/database-contract.ts.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'document_cutover_reader'
  ) THEN
    CREATE ROLE document_cutover_reader NOLOGIN;
  END IF;
END
$$;

CREATE SCHEMA IF NOT EXISTS document_cutover;
ALTER SCHEMA document_cutover OWNER TO postgres;

REVOKE ALL ON SCHEMA document_cutover FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA document_cutover TO document_cutover_reader;

-- Objects created in this schema later are not granted to the API roles by
-- default (Supabase "Securing your API" hardening).
ALTER DEFAULT PRIVILEGES IN SCHEMA document_cutover
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA document_cutover
  REVOKE ALL ON TABLES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA document_cutover
  REVOKE ALL ON SEQUENCES FROM anon, authenticated, service_role;

-- Applied schema version: the latest migration version only (never the
-- statements column).
CREATE OR REPLACE FUNCTION document_cutover.schema_version()
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
BEGIN
  RETURN (
    SELECT max(m.version)::bigint
    FROM supabase_migrations.schema_migrations AS m
  );
END;
$$;
ALTER FUNCTION document_cutover.schema_version() OWNER TO postgres;
REVOKE ALL ON FUNCTION document_cutover.schema_version() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION document_cutover.schema_version() TO document_cutover_reader;

CREATE OR REPLACE FUNCTION document_cutover.auth_user_count()
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
BEGIN
  RETURN (SELECT count(*) FROM auth.users AS u);
END;
$$;
ALTER FUNCTION document_cutover.auth_user_count() OWNER TO postgres;
REVOKE ALL ON FUNCTION document_cutover.auth_user_count() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION document_cutover.auth_user_count() TO document_cutover_reader;

-- Row and distinct-tenant counts for one prototype detector table. The table
-- name is checked against the fixed prototype list before it is used.
CREATE OR REPLACE FUNCTION document_cutover.table_census(p_table text)
RETURNS TABLE (row_count bigint, tenant_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
BEGIN
  IF p_table IS NULL OR p_table NOT IN (
    'pdf_templates',
    'pdf_template_versions',
    'pdf_template_renders',
    'pdf_template_artifacts',
    'pdf_template_audit_events',
    'pdf_template_batches',
    'pdf_template_batch_jobs',
    'contribution_receipt_snapshots',
    'gift_receipt_records'
  ) THEN
    RAISE EXCEPTION 'document_cutover.table_census: % is not a prototype detector table', p_table
      USING ERRCODE = '22023';
  END IF;

  RETURN QUERY EXECUTE format(
    'SELECT count(*)::bigint, count(DISTINCT t.tenant_id)::bigint FROM public.%I AS t',
    p_table
  );
END;
$$;
ALTER FUNCTION document_cutover.table_census(text) OWNER TO postgres;
REVOKE ALL ON FUNCTION document_cutover.table_census(text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION document_cutover.table_census(text) TO document_cutover_reader;

-- Artifact rows that reference Storage, and Storage objects in every bucket
-- those rows reference or whose name looks prototype-owned.
CREATE OR REPLACE FUNCTION document_cutover.artifact_storage_census()
RETURNS TABLE (referenced_rows bigint, bucket_objects bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (
      SELECT count(*)
      FROM public.pdf_template_artifacts AS a
      WHERE a.storage_path IS NOT NULL
    )::bigint,
    (
      SELECT count(*)
      FROM storage.objects AS o
      WHERE o.bucket_id IN (
        SELECT a.storage_bucket
        FROM public.pdf_template_artifacts AS a
        WHERE a.storage_bucket IS NOT NULL
      )
      OR o.bucket_id IN (
        SELECT b.id
        FROM storage.buckets AS b
        WHERE b.name ~* '(pdf|template|artifact|receipt)'
      )
    )::bigint;
END;
$$;
ALTER FUNCTION document_cutover.artifact_storage_census() OWNER TO postgres;
REVOKE ALL ON FUNCTION document_cutover.artifact_storage_census() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION document_cutover.artifact_storage_census() TO document_cutover_reader;

CREATE OR REPLACE FUNCTION document_cutover.external_reference_count()
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
BEGIN
  RETURN (
    SELECT count(*)
    FROM public.pdf_template_artifacts AS a
    WHERE a.url IS NOT NULL
  );
END;
$$;
ALTER FUNCTION document_cutover.external_reference_count() OWNER TO postgres;
REVOKE ALL ON FUNCTION document_cutover.external_reference_count() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION document_cutover.external_reference_count() TO document_cutover_reader;

CREATE OR REPLACE FUNCTION document_cutover.batch_job_count()
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
BEGIN
  RETURN (SELECT count(*) FROM public.pdf_template_batch_jobs AS j);
END;
$$;
ALTER FUNCTION document_cutover.batch_job_count() OWNER TO postgres;
REVOKE ALL ON FUNCTION document_cutover.batch_job_count() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION document_cutover.batch_job_count() TO document_cutover_reader;

CREATE OR REPLACE FUNCTION document_cutover.migration_report_count()
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
BEGIN
  RETURN (
    SELECT count(*)
    FROM public.pdf_templates AS t
    WHERE t.migration_report IS NOT NULL
      AND t.migration_report <> '{}'::jsonb
  );
END;
$$;
ALTER FUNCTION document_cutover.migration_report_count() OWNER TO postgres;
REVOKE ALL ON FUNCTION document_cutover.migration_report_count() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION document_cutover.migration_report_count() TO document_cutover_reader;

CREATE OR REPLACE FUNCTION document_cutover.renderer_integration_count()
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
BEGIN
  RETURN (
    SELECT count(*)
    FROM public.pdf_template_renders AS r
    WHERE r.renderer = 'docraptor'
  );
END;
$$;
ALTER FUNCTION document_cutover.renderer_integration_count() OWNER TO postgres;
REVOKE ALL ON FUNCTION document_cutover.renderer_integration_count() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION document_cutover.renderer_integration_count() TO document_cutover_reader;
