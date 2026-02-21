# Working Set

- Date: 2026-02-16
- Repo: Asymmetric-al/core
- Goal: Prepare deterministic Supabase demo seed data for a new hosted project with exactly one profile identity, full relational coverage across app tables, and optional public read-only demo RLS migration.
- Primary area: `supabase/seed.sql`, `supabase/migrations/*`, `scripts/*`, `AGENTS.md`
- Constraints:
  - No hardcoded secrets.
  - Seed must be idempotent + relationally valid.
  - Keep demo data realistic and varied.
  - Preserve Supabase migration-first workflow.
- Evidence sources used:
  - `supabase/schema.sql`
  - `supabase/migrations/20250101000000_init_schema.sql`
  - `supabase/migrations/20260214090000_foundation_1_schema.sql`
  - table usage search in `apps/*` and `packages/*`
- Tooling note:
  - Nia MCP may be intermittently unavailable (tool registration can drop); fallback is repo-scoped `rg` + direct file reads.
