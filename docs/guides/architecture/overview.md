# Architecture Guide

Core is a Bun and Turborepo monorepo with three independent Next.js App Router
applications. The public website is a surface within the donor application.
This guide describes the current source layout inspected at `7abd2c11` on
2026-09-16; adopted product contracts separately define the behavior still to
implement and qualify.

## Project Overview

| Application          | Source                    | Current route examples                                                      | Responsibility                             |
| -------------------- | ------------------------- | --------------------------------------------------------------------------- | ------------------------------------------ |
| Mission Control      | `apps/admin`              | `/`, `/crm`, `/contributions`, `/email`, `/web-studio`                      | Staff operations and tenant administration |
| Donor experience     | `apps/donor`              | `/donor-dashboard`, `/donor-dashboard/history`, `/donor-dashboard/settings` | Authenticated donor self-service           |
| Missionary workspace | `apps/missionary`         | `/`, `/donors`, `/feed`, `/ministry-updates`, `/tasks`                      | Role-scoped missionary work                |
| Public website       | `apps/donor/app/(public)` | `/`, `/workers`, `/checkout`, CMS catch-all                                 | Existing public content and giving paths   |

The public route examples include prototype and partial implementations. Their
existence does not establish the adopted Phase 22–26 privacy, publication,
financial or owner-qualification contracts. “Give Hope” in fixtures and default
screens is a demo tenant, not the platform's organization or authoritative data.

Mission Control's ordinary routes live under `apps/admin/app/(app)`; its
Payload engine routes live under `apps/admin/app/(payload)`. The old single-app
`(admin)/mc` and `(donor)` topology is not the current repository layout.

## Directory Structure

| Path                                          | Purpose                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------- |
| `apps/admin`, `apps/donor`, `apps/missionary` | Separate app entrypoints, routing, composition and deployment configuration           |
| `packages/api`                                | Shared business commands, domain authorization, data access and provider boundaries   |
| `packages/auth`                               | Session/authentication helpers and shared auth middleware                             |
| `packages/database`                           | Supabase access utilities, approved collections, query keys and hooks                 |
| `packages/ui`                                 | Shared UI components and the exact base-maia/Base UI design system                    |
| `packages/env`                                | Typed environment configuration and environment-target helpers                        |
| `packages/lib`, `packages/email`              | Shared supporting utilities and email adapters; no independent domain authority       |
| `packages/eve-runtime`                        | Product Eve runtime integration, constrained by its own governance                    |
| `supabase/migrations`                         | Forward database schema changes                                                       |
| `openspec/specs`, `openspec/changes`          | Durable contracts and active implementation or reconciliation work                    |
| `docs/prds/sitestacker-parity`                | Adopted product planning, scoped owner amendments, acceptance and historical evidence |

Use the actual package manifests for package names, scripts and dependency
versions. `bun.lock` records resolved dependencies; a copied version table
cannot override either source.

## Module Organization

Application routes compose shared modules and adapt request/response shapes.
Business database logic and sensitive or multi-table effects belong in
`packages/api`; app route handlers stay thin. Do not duplicate commands across
Mission Control, donor, missionary or GraphQL surfaces.

Browser data access follows the approved `packages/database` collection/hook
boundary. A convenient component-level client is not permission to add direct
database access. Read the [data-access boundary](./data-access-boundary.md) and
nearest scoped `AGENTS.md` before modifying a module.

Asym Postgres owns CRM truth. Native notes and relationships are implemented in
`packages/api/src/admin/crm/notes` and `relationships`; the Twenty runtime was
removed through merged PR #1325 on 2026-08-19. Remaining provider cleanup proof
is recorded separately in the owning retirement change.

## Data Flow

1. An app resolves its authenticated or explicitly public request context.
2. The shared domain boundary checks the current tenant, actor, permission and
   owner-specific preconditions.
3. A source-owning command or authorized read produces the result.
4. The app renders a permitted projection; caches and optimistic UI remain
   representations of source state, not alternative write authority.

For current public CMS reads, the donor HTTP/cache adapter calls admin's
`/api/cms/public/*` routes. Public content passes through the provider-neutral
contract in `packages/api/src/cms/public` and the sole Payload adapter in
`apps/admin/src/cms/public/published-content-reader.ts`. That adapter requires
tenant context, published-only predicates and `overrideAccess: false` under
the public-read policy. Tenant lookup is an explicit non-content exception.

This current Tenant-only transport is not the completed Phase 22–24
Site/domain/locale serving architecture. The adopted specifications require
their exact owner admission, immutable generation and qualification rules.
Read the [CMS runtime guide](./cms-runtime.md) and
[Web Studio implementation guide](./web-studio-living-spec.md) for the
implementation-to-target boundary.

## Key Patterns

- **One source owner per fact.** Identity, CRM, financial records, publication,
  communication and document artifacts retain their separate contracts.
  Provider status and rendered UI do not silently establish another owner's
  outcome.
- **Server-owned sensitive effects.** Auth, tenant changes, financial actions,
  provider calls and multi-record commands use the shared server boundary.
- **Cache Components.** The apps use Next.js Cache Components and partial
  prefetching. Check current app configuration and installed Next.js
  documentation before selecting Stream, Cache or Block behavior. Cache tags
  invalidate entries; they do not establish tenant isolation or authorization.
- **Explicit implementation evidence.** Passing unit tests, shipping a
  placeholder UI, publishing a specification or creating issues proves only
  its own bounded result. Required database, provider, browser and operating
  evidence remain separate.

## Component Guidelines

Use `packages/ui`, exact base-maia styling, Base UI primitives and semantic
CSS variables. Keep domain commands out of presentation components. Follow
`packages/ui/AGENTS.md`, the nearest app instructions and the
[frontend rulebook](../../ai/rules/frontend.md) for concrete UI work.

The existing CMS engine uses Payload/Lexical fields. Future CMS authoring and
public presentation work must satisfy the adopted Phase 23 contracts; an
engine default does not replace Core product or permission decisions.

## Environment and Commands

The root `package.json` is the command authority. Current focused development
entrypoints are:

```sh
bun run dev:admin
bun run dev:donor
bun run dev:missionary
```

Use `bun run check` for standard code checks and `bun run ci:preflight` for
the full local gate. Exact checks depend on the modified domain and current
repository scripts.

Environment schemas live in `packages/env`. Existing `.env.local` and
credentials are opaque secure inputs; do not print, copy or overwrite them
during documentation or routine orientation work.

## Further Reading

- [Document authority](../../ai/document-authority.md)
- [Source-of-truth ownership matrix](../../prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md)
- [Program roadmap](../../prds/sitestacker-parity/roadmap.md)
- [Data-access boundary](./data-access-boundary.md)
- [Getting started](../development/getting-started.md)
- [TanStack integration](../development/tanstack-integration.md)
- [Current runtime map](./runtime-map.md)

The [former architecture guide](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/guides/architecture/overview.md)
remains available as immutable history. Its old route tree, commands, sample
modules and copied dependency values do not describe the current architecture.
