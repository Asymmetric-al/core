# Platform System Boundaries

## Purpose

State durable **architectural and trust boundaries** for the core monorepo so
agents and contributors do not re-derive them from scattered files.

Detailed rules, enforcement scripts, and exception tables live in git docs and
code; this spec names the contracts and points to authoritative detail.

## Requirements

### Requirement: Monorepo And Application Split

The repository SHALL remain a Bun + Turborepo monorepo with three Next.js App
Router applications (`@asym/admin`, `@asym/donor`, `@asym/missionary-app`) and
shared internal packages under `packages/*`.

#### Scenario: New code is added

- WHEN adding features or integrations
- THEN app-specific routing and UI stay under `apps/*`
- AND cross-app reuse migrates toward `packages/*` with clear boundaries

### Requirement: Canonical Data Access Boundary

Business database logic for app-facing HTTP boundaries SHALL live in
`packages/api` as described in `docs/guides/architecture/data-access-boundary.md`.

#### Scenario: A route handler under `apps/*/app/api/`

- WHEN implementing or reviewing API routes
- THEN handlers remain thin re-exports delegating to `@asym/api`
- AND direct imports of `@asym/database/supabase/*` in those handlers are
  avoided except for documented approved exceptions

### Requirement: Database Package Placement

The `@asym/database` package SHALL hold Supabase clients, generated types,
collections, and low-level data access used by the API layer and approved paths.

#### Scenario: An app feature needs a new query

- WHEN new persistence logic is required
- THEN it is implemented behind `packages/api` (or existing approved patterns)
- AND not duplicated ad hoc across apps in ways that bypass RLS or auditing

### Requirement: Tenant Isolation

Multi-tenant data SHALL be isolated with PostgreSQL Row Level Security and
tenant-scoped access patterns as described in architecture documentation (for
example `tenant_id` claims and policies).

#### Scenario: New tables or policies

- WHEN schema or policies change
- THEN tenant isolation is preserved or strengthened
- AND `supabase/AGENTS.md` guidance is followed for migrations and RLS posture

### Requirement: Authentication And Sessions

Authentication SHALL use the shared Supabase-backed sign-in foundation across
admin, missionary, and donor apps. Public self-registration and role assignment
policies MUST follow least-privilege rules documented in `docs/auth/sign-in.md`
and related auth docs.

#### Scenario: Auth callback or session edge cases

- WHEN touching auth callbacks, demo login, or role metadata
- THEN changes align with `docs/auth/sign-in.md` and `docs/auth/hardening-handoff.md`
- AND cross-app session behavior stays coherent

### Requirement: Payments

Payment processing SHALL use Stripe for charge flows; card data and secrets
SHALL stay server-side and outside application logs.

#### Scenario: New monetization or refund flows

- WHEN extending giving or subscription behavior
- THEN Stripe and webhook handling follow existing platform patterns and env
  contracts in `packages/env`

### Requirement: Next.js Runtime And Caching Posture

All three apps enable Cache Components (`cacheComponents: true`). Agents SHALL
not treat legacy segment config exports (`runtime`, `revalidate`, `dynamic`) as
the default escape hatch; follow `docs/ai/rules/backend.md` and architecture
runtime guidance.

#### Scenario: Performance or caching questions

- WHEN debugging caching, PPR, or server/client boundaries
- THEN local Next.js docs (or `.next-docs/`) and repo rulebooks are consulted
  before changing global patterns
