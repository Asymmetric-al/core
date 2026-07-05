---
name: supabase-postgres-best-practices
description: Postgres performance optimization and best practices from Supabase. Use this skill when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations.
license: MIT
metadata:
  owner: skills-steward
  last_updated: 2026-04-09
  status: active
  author: supabase
  version: "1.1.1"
  organization: Supabase
  date: January 2026
  abstract: Comprehensive Postgres performance optimization guide for developers using Supabase and Postgres. Contains performance rules across 8 categories, prioritized by impact from critical (query performance, connection management) to incremental (advanced features). Each rule includes detailed explanations, incorrect vs. correct SQL examples, query plan analysis, and specific performance metrics to guide automated optimization and code generation.
  upstream:
    url: https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices
    repo: supabase/agent-skills
    path: skills/supabase-postgres-best-practices/SKILL.md
---

# Supabase Postgres Best Practices

Comprehensive performance optimization guide for Postgres, maintained by Supabase. Contains rules across 8 categories, prioritized by impact to guide automated query optimization and schema design.

## This repository (Asymmetric-al/core)

- Auth flows in Next.js without heavy SQL work: `docs/ai/skills/nextjs-supabase-auth/SKILL.md`
- Broader Supabase product surface (CLI, MCP, Storage, etc.): `docs/ai/skills/supabase/SKILL.md`
- Migration and seed workflow: `supabase/AGENTS.md`

## When to Apply

Reference these guidelines when:

- Writing SQL queries or designing schemas
- Implementing indexes or query optimization
- Reviewing database performance issues
- Configuring connection pooling or scaling
- Optimizing for Postgres-specific features
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

## Workflow (this repo)

1. Identify the hot path (query latency, lock contention, scan volume, or RLS overhead).
2. Inspect indexing and query-shape problems first (`query-*`, `schema-*`).
3. Validate RLS and policy cost for protected tables (`security-*`).
4. Prefer schema and access-pattern fixes before low-level micro-optimizations.
5. Verify with realistic query plans and app behavior.
6. If behavior changes, update relevant backend docs and migration notes.

## How to Use

Read individual rule files for detailed explanations and SQL examples:

```
references/query-missing-indexes.md
references/query-partial-indexes.md
references/_sections.md
```

Each rule file contains:

- Brief explanation of why it matters
- Incorrect SQL example with explanation
- Correct SQL example with explanation
- Optional EXPLAIN output or metrics
- Additional context and references
- Supabase-specific notes (when applicable)

## Checklist

- [ ] Query path reviewed for index/selectivity issues
- [ ] RLS policies reviewed for correctness and cost
- [ ] Schema/index changes are migration-safe
- [ ] No unsafe bypass patterns introduced
- [ ] Verification steps documented (query checks or app flow checks)

## References

- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
- https://wiki.postgresql.org/wiki/Performance_Optimization
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/auth/row-level-security
- `references/upstream.md` for vendor refresh steps
