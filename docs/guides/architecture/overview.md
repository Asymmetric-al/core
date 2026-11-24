# Architecture Guide

Core is a Bun and Turborepo monorepo with three Next.js App Router product
applications. The public website is a surface within the donor application.
This guide maps the current source layout; adopted product contracts
separately define the behavior still to implement and qualify.

## Project Overview

| Application          | Source                    | Current route examples                                                                                   | Responsibility                             |
| -------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Mission Control      | `apps/admin`              | `/<tenant>`, `/<tenant>/crm`, `/<tenant>/contributions`, `/<tenant>/support`, `/web-studio`              | Staff operations and tenant administration |
| Donor experience     | `apps/donor`              | `/donor-dashboard` and its `history`, `pledges` (recurring gifts), `wallet`, `feed` and `settings` pages | Authenticated donor self-service           |
| Missionary workspace | `apps/missionary`         | `/<tenant>`, `/<tenant>/donors`, `/<tenant>/feed`, `/<tenant>/tasks`                                     | Role-scoped missionary work                |
| Public website       | `apps/donor/app/(public)` | `/`, `/workers`, `/checkout`, CMS catch-all                                                              | Existing public content and giving paths   |

API routes are listed in [`runtime-map.md`](./runtime-map.md). The public route examples include prototype and partial implementations. Their
existence does not establish the adopted Phase 22–26 privacy, publication,
financial or owner-qualification contracts. “Give Hope” in fixtures and default
screens is a demo tenant, not the platform's organization or authoritative data.

Mission Control's ordinary routes live under `apps/admin/app/(app)`; its
Payload engine routes live under `apps/admin/app/(payload)`. The donor portal
lives under `apps/donor/app/(dashboard)/donor-dashboard` and the public site
under `apps/donor/app/(public)`.

Under the owner's decision of 21 November 2026 (OpenSpec change `adopt-tenant-owned-domains`) this changes: packages N2 and N3 serve every surface on the organization's own home domain, Mission Control under `/admin` and the missionary workspace under `/missionary`, and take the organization from the domain. Until they merge, the following describes current behaviour.

Signed-in pages of Mission Control and the missionary workspace are served under the tenant in the page address, `/<tenant>[~<sub-role>]` (plan 5.2;
AL-2675): each app's proxy decides the person's membership in that tenant
before the page shell and rewrites the address onto the page files above. A
bare address such as `/crm` is sent to the person's one organization or to
the organization chooser (`/choose-organization`). Sign-in, the chooser and the
API routes stay outside every segment. Web Studio's pages are outside the
tenant segment but a segment of their own: their organization comes from a
signed cookie, and Web Studio's own chooser is not one of them. Crossing the
boundary of either segment loads a new document. A link the client router prefetched before
the person's membership was revoked can show at most its route's App Shell,
which holds no tenant data, before the navigation's own request is refused
and ends on `/no-access` (established on a production build in
`tests/e2e/admin-tenant-address.spec.ts`). An App Shell may read session data and carries
cached content such as Home's figures, but the pages' session read,
`getAuthContext()` with no request, stops it: it waits for `connection()`
after reading the cookies, and on a production build with that wait
removed the shell still stopped there, at the read's own `Date.now()`. The
same spec shows a prefetched link to Home carries none of its figures. The rules for page code are in
[`docs/ai/rules/frontend.md`](../../ai/rules/frontend.md) § The tenant in the
page address.

`apps/factory-console` is the private operator console for the software
factory (`scripts/archon-factory`). It runs only on the factory VM and is not
a product surface.

### Serving Dashboards Under Paths (`CORE_SERVE_UNDER_PATHS`)

When built with `CORE_SERVE_UNDER_PATHS=1` (resolved by
`scripts/release/serve-under-paths.mjs`), `apps/admin` runs under
`basePath: "/admin"`, `apps/missionary` runs under `basePath: "/missionary"`,
and `apps/donor` (the front) rewrites exact `/admin` and `/missionary` path
prefixes to those dashboards for hosts listed in `FRONT_NAMES`. Any value
other than unset, `0`, or `1` fails the build, and `CORE_SERVE_UNDER_PATHS=1`
fails the build when `VERCEL_TARGET_ENV` or `VERCEL_ENV` is `production`
(case-insensitive).

When enabled, `packages/auth/front.ts` stamps proxied requests from the donor
front with HMAC-SHA256 (`x-asym-front-stamp`, `x-asym-front-origin`) using a
distinct >=32-byte key per dashboard (`FRONT_STAMP_KEY_ADMIN`,
`FRONT_STAMP_KEY_MISSIONARY` on the front; `FRONT_STAMP_KEY` and optional
verify-only `FRONT_STAMP_KEY_PREVIOUS` on each dashboard). Every proxy strips
client-sent `x-asym-front-*` headers on every path it runs in both modes. With
the switch on, each dashboard proxy refuses unstamped or mis-stamped requests
with `403` (`no-store`) except on its own explicit decoded path allowlist:

- Staff (`apps/admin`): `/api/health/migrations`, `/api/webhooks/stripe`,
  `/api/webhooks/stripe-connect`, `/api/email/webhooks/resend`, `/api/inngest`,
  `/eve/v1/github`, plus a read-only `GET`/`HEAD` exception under
  `/api/cms/public/` (refusing decoded `.` or `..` segments or `\`). Those five
  public CMS routes resolve the tenant from `x-forwarded-host` or `host` and
  return published content only, matching their existing public reach on the
  staff origin until WP6 part 2 removes them.
- Missionary (`apps/missionary`): `/api/health/migrations`,
  `/api/webhooks/stripe`.

Paths outside the dashboard proxy matchers still answer without a stamp while
the switch is on: `/_next/*` (including `/_next/image`, accepted by ruling Q2
until part 3), the static files the matchers skip (`/maplibre/*` on admin and
single root files with static extensions such as `/icon.svg`,
`/manifest.webmanifest`, and `/favicon.ico`), and the assistant's `/eve/v1/*`
routes (owned by part 3).

A stamped request is then looked up by its stamped host through
`public.resolve_verified_host` (`packages/auth/verified-name.ts`), once per
request and never cached. Mission Control and Web Studio admit a `ready` or
`active` home name; the missionary workspace admits an `active` home name only.
Any other name gets `404` (`no-store`) before a session is read, and a lookup
that fails gets `503` (`no-store`). The admitted name's organization travels to
the app as `x-asym-name-tenant`, set only by the proxy: an address segment, a
tenant header or option, the role check, the choosers and Web Studio's cookie
may only narrow to it (`packages/auth/docs/adr/0015-organization-from-the-verified-name.md`).
The assistant's `/eve/v1/*` routes never read it.

With the switch unset (today's default everywhere), no `basePath` is set, the
donor app proxies nothing to the dashboards, and the dashboards admit direct
requests as before. Reserved paths, the `(app)/admin/*` rename, assistant
proxying, provider-address cutover, release tooling, and real-domain host lists
remain off until later parts of N3 and N2/N6.

Build memory note (implementation record line 822): `apps/admin` builds on
Vercel's larger build machine in releases (`scripts/release/vercel-release.mjs:269`);
a standard-machine preview build ran out of memory with TypeScript checking on.
TypeScript checking stays on with no build-time switch to bypass it.

## Directory Structure

| Path                                          | Purpose                                                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `apps/admin`, `apps/donor`, `apps/missionary` | Separate app entrypoints, routing, composition and deployment configuration                                     |
| `packages/api`                                | Shared business commands, domain authorization, data access and provider boundaries                             |
| `packages/auth`                               | Session/authentication helpers and shared auth middleware                                                       |
| `packages/database`                           | Supabase access utilities, approved collections, query keys and hooks                                           |
| `packages/ui`                                 | Shared UI components and the exact base-maia/Base UI design system                                              |
| `packages/env`                                | Typed environment configuration and environment-target helpers                                                  |
| `packages/lib`, `packages/email`              | Shared supporting utilities and email adapters; no independent domain authority                                 |
| `packages/graphql`                            | GraphQL Yoga handler over shared records (see the data-access boundary exceptions)                              |
| `packages/missionary`                         | Missionary dashboard components and types used by `apps/missionary` (`apps/admin` only declares the dependency) |
| `packages/config`, `packages/mock-data`       | Shared configuration and demo/test fixture data                                                                 |
| `packages/eve-runtime`                        | Product Eve runtime integration, constrained by its own governance                                              |
| `supabase/migrations`                         | Forward database schema changes                                                                                 |
| `openspec/specs`, `openspec/changes`          | Durable contracts and active implementation or reconciliation work                                              |
| `docs/prds/sitestacker-parity`                | Adopted product planning, scoped owner amendments, acceptance and historical evidence                           |

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
