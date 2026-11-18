-- The default privileges and schema grants hosted Supabase gives `postgres`
-- in `public` before any migration runs (Supabase, "Securing your API",
-- default privileges). Every table, sequence and function a migration creates
-- there takes them, so a replay of the chain without them never has the access
-- lists of a hosted database, and the release job's fingerprint gate stopped
-- the first hosted run (docs/audits/core-crm-cms-database-proofs/
-- wp16-hosted-proofs.md, section 5).
--
-- The one copy in the repository. Read by:
--   - scripts/verify/supabase-migrations.mjs --hosted-defaults, the replay of
--     the release job, of the preview-database job and of a direct run;
--   - tests/unit/acceptance/issue-2674/privileges-harness.ts, the real-stack
--     replay "as on a hosted project".
-- The Local Supabase Stack workflow compares a replay made with this file
-- against Supabase's own image, so a change of the platform's defaults fails
-- CI rather than a release.
--
-- Applied after scripts/sql/supabase-compat-bootstrap.sql, which creates the
-- API roles, and before the first migration.
alter default privileges for role postgres in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges for role postgres in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges for role postgres in schema public grant all on functions to anon, authenticated, service_role;
grant usage on schema public to postgres, anon, authenticated, service_role;
