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
--   - scripts/release/release-database.mjs, whose two rebuilds put these
--     defaults back before the reset: a hosted reset keeps public, and with it
--     the default privileges the chain left there, so without them a rebuild
--     of a rebuilt project would not start where a fresh one starts (the
--     second rebuild of the preview project, same report);
--   - tests/unit/acceptance/issue-2674/privileges-harness.ts, the real-stack
--     replay "as on a hosted project".
-- On a hosted project every statement runs as `postgres`, the chain's own
-- role: the three defaults are its own, and it owns the database, so it may
-- grant on public (owned by pg_database_owner).
-- The platform names `postgres` itself among the grantees: on the preview
-- project, read on 18 November 2026, each of its rows starts `postgres=`.
-- That changes no object's access list (an owner holds those privileges
-- anyway), but since review H1 the schema fingerprint reads these rows, so
-- this file names `postgres` too.
-- When a pull request changes this file, the chain or the replay, the Local
-- Supabase Stack workflow compares a replay made with this file against the
-- image the pinned CLI starts. That is not a required check, and it is not
-- hosted: a change of the defaults on hosted is caught by the release's gates.
--
-- Applied after scripts/sql/supabase-compat-bootstrap.sql, which creates the
-- API roles, and before the first migration.
alter default privileges for role postgres in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges for role postgres in schema public grant all on sequences to postgres, anon, authenticated, service_role;
alter default privileges for role postgres in schema public grant all on functions to postgres, anon, authenticated, service_role;
grant usage on schema public to postgres, anon, authenticated, service_role;
