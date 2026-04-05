---
name: supabase-postgres-best-practices
description: Postgres performance optimization and best practices from Supabase. Use this skill when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations.
metadata:
  owner: "skills-steward"
  last_updated: 2026-02-18
  status: "active"
  upstream:
    url: "https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices"
    repo: "supabase/agent-skills"
    path: "skills/supabase-postgres-best-practices/SKILL.md"
    license: "MIT"
license: MIT
---

# Supabase Postgres Best Practices

Comprehensive performance optimization guidance for Postgres, maintained by Supabase and adapted for this repo's AI workflow.

## When to Apply

Use this skill when:

- Writing SQL queries or designing schemas
- Implementing indexes or query optimization
- Reviewing database performance issues
- Configuring connection pooling or scaling
- Working with Row-Level Security (RLS)
- Reviewing migrations under `supabase/migrations/*.sql`

Do not use this skill when:

- The task is only UI/UX and has no data-path impact
- The task is only auth UX with no database/query work (use `nextjs-supabase-auth`)

## Rule Categories by Priority

| Priority | Category                 | Impact      | Prefix      |
| -------- | ------------------------ | ----------- | ----------- |
| 1        | Query Performance        | CRITICAL    | `query-`    |
| 2        | Connection Management    | CRITICAL    | `conn-`     |
| 3        | Security & RLS           | CRITICAL    | `security-` |
| 4        | Schema Design            | HIGH        | `schema-`   |
| 5        | Concurrency & Locking    | MEDIUM-HIGH | `lock-`     |
| 6        | Data Access Patterns     | MEDIUM      | `data-`     |
| 7        | Monitoring & Diagnostics | LOW-MEDIUM  | `monitor-`  |
| 8        | Advanced Features        | LOW         | `advanced-` |

## Workflow

1. Identify the hot path (query latency, lock contention, scan volume, or RLS overhead).
2. Inspect indexing and query-shape problems first (`query-*`, `schema-*`).
3. Validate RLS and policy cost for protected tables (`security-*`).
4. Prefer schema and access-pattern fixes before low-level micro-optimizations.
5. Verify with realistic query plans and app behavior.
6. If behavior changes, update relevant backend docs and migration notes.

## Checklist

- [ ] Query path reviewed for index/selectivity issues
- [ ] RLS policies reviewed for correctness and cost
- [ ] Schema/index changes are migration-safe
- [ ] No unsafe bypass patterns introduced
- [ ] Verification steps documented (query checks or app flow checks)

## References

- `references/upstream.md` for attribution and source mapping
