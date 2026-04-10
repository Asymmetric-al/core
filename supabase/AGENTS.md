# Supabase Workflow Rules

**Name:** `supabase-workflow-rules`
**Purpose:** Guardrails for schema migrations, demo seed data, and read-only demo posture in this repo.

## Agent skills (Supabase)

When changing schema, RLS, Auth-related SQL, Storage policies, or Supabase CLI/MCP behavior, load **`docs/ai/skills/supabase/SKILL.md`** (platform-wide Supabase guidance). For Postgres performance and RLS cost, use **`docs/ai/skills/supabase-postgres-best-practices/SKILL.md`**. For Next.js App Router + Supabase Auth only, use **`docs/ai/skills/nextjs-supabase-auth/SKILL.md`**.

To refresh the vendored Supabase skills from [supabase/agent-skills](https://skills.sh/supabase/agent-skills): `npx skills add supabase/agent-skills -y`, then `bun run skills:refresh-upstream`, then `bun run skills:sync` and `bun run skills:verify`.

## Triggers

Use this doc when a task touches:

- `supabase/migrations/*.sql`
- `supabase/seed.sql`
- local/hosted Supabase apply or seed flows
- demo RLS/policy changes

## Workflow Steps

1. Confirm schema source-of-truth from `supabase/migrations/*.sql`.
2. Keep `supabase/seed.sql` deterministic and idempotent.
3. Ensure seed data satisfies relational constraints and required columns.
4. Keep secrets out of SQL and docs (env vars only).
5. For demo public access, enforce read-only policies via migration SQL.
6. Run migration + seed + count checks before finalizing.

## Demo Dataset Notes (2026-02-16)

- Seed file: `supabase/seed.sql`
  - Resets and reseeds public app tables deterministically.
  - Creates exactly one profile identity tied to one auth user.
  - Seeds all public app-facing tables, including `campaigns`, `notification_queue`, and `pledge_charge_attempts`.
- Read-only demo migration:
  - `supabase/migrations/20260216153000_demo_readonly_rls.sql`
  - Public `SELECT` only on demo-visible tables.
  - Revokes anon/authenticated write access.
  - Locks down internal/admin tables (including backup tables).

## Commands

- Local migrations + seed:
  - `supabase db reset --local`
  - `bash ./scripts/seed-demo.sh local`
- Hosted migrations (explicit DB URL):
  - `supabase db push --db-url "$SUPABASE_DB_URL"`
- Hosted seed:
  - `bash ./scripts/seed-demo.sh hosted`
- Row-count verification:
  - `bash ./scripts/seed-demo.sh verify`

## Checklist

- [ ] `supabase/seed.sql` is deterministic and idempotent
- [ ] Seed inserts exactly one row in `public.profiles`
- [ ] FK graph is valid (no orphaned references)
- [ ] Demo-visible tables are read-only for `anon`/`authenticated`
- [ ] Internal tables are not exposed
- [ ] No secrets are committed in SQL/docs/scripts
