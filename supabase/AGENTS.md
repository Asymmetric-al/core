# Supabase Workflow Rules

**Name:** `supabase-workflow-rules`
**Purpose:** Guardrails for schema migrations, tenant RLS and grants, and demo seed data in this repo.

## Agent skills (Supabase)

When changing schema, RLS, Auth-related SQL, Storage policies, or Supabase CLI/MCP behavior, load **`docs/ai/skills/supabase/SKILL.md`** (platform-wide Supabase guidance). For Postgres performance and RLS cost, use **`docs/ai/skills/supabase-postgres-best-practices/SKILL.md`**. For Next.js App Router + Supabase Auth only, use **`docs/ai/skills/nextjs-supabase-auth/SKILL.md`**.

To refresh the vendored Supabase skills from [supabase/agent-skills](https://skills.sh/supabase/agent-skills), follow the reviewed procedure in `docs/ai/rules/agent-skill-routing.md`: a targeted import with the pinned Skills CLI from a reviewed checkout, then `bun run skills:refresh-upstream --only=supabase/agent-skills`, then `bun run skills:sync` and `bun run skills:verify`.

## Triggers

Use this doc when a task touches:

- `supabase/migrations/*.sql`
- `supabase/seed.sql`
- local/hosted Supabase apply or seed flows
- RLS, policy or grant changes

## Workflow Steps

1. Confirm schema source-of-truth from `supabase/migrations/*.sql`.
2. Keep `supabase/seed.sql` deterministic and idempotent.
3. Ensure seed data satisfies relational constraints and required columns.
4. Keep secrets out of SQL and docs (env vars only).
5. Tenant tables keep RLS enabled and forced, with tenant-scoped policies; `anon` and `PUBLIC` get no reads. Making any read public needs a new owner ruling (`docs/security/tenant-read-floor.md`). Every policy for signed-in users on a tenant table requires `tenant_id = (SELECT authz.current_tenant_id())` plus its role-class or own-row condition, each helper call a whole sub-select, such as `(SELECT authz.assignment_is('staff'))`, and no helper given a column of the row. `authz.current_tenant_id()` returns the tenant the request's `x-asym-tenant` header names only when the request's one assignment resolves there; it reads no token claim. Write a policy that has no tenant condition only as a reviewed entry in `docs/security/tenant-policy-exceptions.json`; the catalog gate enforces both (`docs/security/tenant-guard.md`, CI gates). No-JWT server work that must stay inside one tenant uses `withTenant` (`docs/security/tenant-guard.md`). Tenant commands, worker entry points, platform commands and their `public` wrappers follow "Command lane" in the same document.
6. New objects in `public` get no default grant: `postgres`'s default privileges there grant nothing to `anon` or `authenticated` (`20261117034926`). Each migration grants exactly what it needs, by name, and a table grant to either role needs a policy that admits it; the catalog gate fails one that none admits.
7. Run migration + seed + count checks before finalizing. CI (`.github/workflows/ci-integration.yml`) also runs `node scripts/verify/supabase-migrations.mjs` (`bun run verify:supabase-migrations`; needs `DATABASE_URL` for a disposable Postgres), which applies the migrations and runs the tenant RLS catalog gate: every public tenant table needs RLS enabled and forced plus a policy or a reviewed entry in `docs/security/rls-deny-by-default-exceptions.json`.

## Demo dataset

- Seed file: `supabase/seed.sql`
  - Resets and reseeds public app tables deterministically.
  - Creates two tenants: the demo organization, which holds the demo dataset, and a second organization (`00000000-0000-0000-0000-000000000002`) as a fixture with no business data, so every suite and the seeded application have two tenants (AL-2675).
  - Creates exactly four profile identities, each tied to one auth user: the demo owner, the second organization's administrator, one donor with a donor membership in both organizations, and the demo organization's Member Care worker (one `staff:member_care` row, not an administrator).
  - Owns every `authz.memberships` row. Memberships, not `profiles.role` or `profiles.tenant_id`, are the only authority; the profile columns keep their pre-WP2a values for comparison only. No staff row has the member-care sub-role unless a fixture needs it.
  - Seeds all public app-facing tables, including `campaigns`, `notification_queue`, and `pledge_charge_attempts`.
- Seed counts: `supabase/seed-expectations.json` lists the row counts the seed must produce. CI's `migrate` job checks them after seeding (`node scripts/verify/seed-counts.mjs`), which fails and reports the count it found. A change to the seed updates that file in the same change; the workflow does not change.
- Historical: `supabase/migrations/20260216153000_demo_readonly_rls.sql` (February 2026) granted public `SELECT` on demo-visible tables and revoked anon/authenticated writes. Later migrations superseded that posture: `20261025120800_close_public_reads_tenant_scope.sql` (#2312) removed the public reads, and some tables now accept authenticated own-row writes. Do not reintroduce public reads.

## Reset rule

A database records whether it is `disposable`, `shared` or `production` (plan 7.5, `platform.environment`). Every reset and reseed refuses a database not marked `disposable`, and a database with no marker counts as not disposable. `bun run supabase -- db reset` checks the target first (`--local`, the `--db-url` value, or the linked project, whose marker it reads through `db query --linked`) and has no override flag. Elsewhere, "repair" means forward migrations, never a reset.

The migration writes `disposable` only on a database whose profiles, donors and donations are empty, so a local stack that predates the marker, or that held data when the marker migration ran, has none and every reset refuses it. Recover it once by recreating it from source: `bun run supabase -- stop --no-backup` (this deletes that stack's data), then `bun run supabase -- start`. The one-off first rebuild of a hosted database is a named step of the release job, never a local command.

## Commands

- Local migrations + seed:
  - `bun run supabase -- db reset --local`
  - `bash ./scripts/seed-demo.sh local`
- Hosted migrations: only the release job migrates a hosted database
  (`.github/workflows/release.yml`; a push to `production`, or its dispatched
  `release` operation). See `docs/ops/release-job.md`. `bun run db:migrate:hosted`
  refuses, and no application environment holds a migration connection string.
- Always go through `bun run supabase --`: `scripts/supabase-cli.mjs` uses a global CLI only when its
  version equals the repository pin and otherwise runs the pinned version.
- Hosted seed: retired. `bash ./scripts/seed-demo.sh hosted` always refuses,
  because `supabase/seed.sql` deletes every organization's rows. A hosted
  database is seeded only by the release job's one-off first rebuild
  (`docs/ops/release-job.md`).
- Row-count verification:
  - `bash ./scripts/seed-demo.sh verify`

## Checklist

- [ ] `supabase/seed.sql` is deterministic and idempotent
- [ ] The seed owns every `authz.memberships` row
- [ ] FK graph is valid (no orphaned references)
- [ ] `supabase/seed-expectations.json` matches the seed's row counts
- [ ] No `anon`/`PUBLIC` reads on tenant tables; RLS enabled and forced, with a policy or a reviewed deny-by-default entry
- [ ] Internal tables are not exposed
- [ ] No secrets are committed in SQL/docs/scripts
