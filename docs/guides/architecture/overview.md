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
  `/eve/v1/github` (`STAFF_READ_ONLY_EXEMPT_PREFIXES` is empty after WP6 part
  2a retired `/api/cms/public/*`).
- Missionary (`apps/missionary`): `/api/health/migrations`,
  `/api/webhooks/stripe`.

Paths outside the dashboard proxy matchers still answer without a stamp while
the switch is on: `/_next/*` (including `/_next/image`, ruling Q2; through the
front, `/admin/_next/*` and `/missionary/_next/*`, below), the static files the
matchers skip (`/maplibre/*` on admin and single root files with static
extensions such as `/icon.svg`, `/manifest.webmanifest`, and `/favicon.ico`),
and the assistant's `/eve/v1/*` routes, which on Vercel `withEve` mounts at the
root of the staff deployment ahead of the app, so the staff proxy never runs
there; the assistant's service judges those requests itself (below).

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

On the donor app itself (`apps/donor/proxy.ts`), with the switch on and after
`/admin` and `/missionary` handoff, every request that reaches the proxy strips
client `x-asym-front-*` and `x-forwarded-host`, refuses encoded slashes
(`%2F`/`%2f`), decodes and validates its path form before any lookup
(`apps/donor/lib/route-policy.ts`; malformed encodings, `\`, `.`/`..`, `//`,
double encoding, decoded dashboard prefixes, and malformed `.segments/` or
`.rsc` transport forms get `404` `no-store`), maps valid Next.js per-segment
prefetch (`.segments/<segment>.segment[.rsc]`) and leftover `.rsc` transport
paths back to their target page path (with `/index` mapped to `/`), skips lookup
only on the exact non-transport exempt paths (`/api/webhooks/stripe`,
`/api/health`, `/api/health/migrations`, `/api/playwright-ready`), and otherwise
performs one uncached `resolve_verified_host` lookup of the `host` header for
`donor_account` (`active`, home) and `website` (`active`). Two kinds of request
never reach the proxy and still answer on any name (owned by WP7): paths
excluded by `config.matcher` in `apps/donor/proxy.ts` (`/_next/*`,
`/admin/_next/*` and `/missionary/_next/*` without an empty, `.` or `..`
segment, `/maplibre/*`, and single root filenames ending in `.ico`, `.svg`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`,
`.webmanifest`, `.json`, `.txt`, or `.xml`) and the configuration redirects in
`apps/donor/next.config.ts` (answered before the proxy). Account, shared legal, and website paths admit only matching active
surfaces (`404` `no-store` when refused, `503` `no-store` when unavailable),
`x-asym-name-tenant` scopes the donor's membership and `readPortalDocumentScope`
to that organization, and the single-organization fallback ends while the switch
is on (`packages/auth/docs/adr/0016-donor-organization-from-the-verified-name.md`).

On an active website name that is not home (a Site name), a plain `GET` or
`HEAD` of `/register`, `/forgot-password`, `/auth/callback` or
`/donor-dashboard` (or a path under one) is not refused but redirected `307`
(`no-store`, `no-referrer`, no body, no cookie, no session read) to the same
path on the organization's home. The home name comes only from one more uncached
anonymous read, `public.resolve_home_host` (`packages/auth/home-name.ts`);
scheme and port come from that stored name (`http:` and the server's own
listener port for a `.localhost` home, otherwise `https:` and no port), never
from a request header; a path outside a strict character set becomes
`/donor-dashboard`; only one checked `next` survives in the query
(`apps/donor/lib/home-redirect.ts`). No home gives `404`, a failed read `503`.
Sign-in, checkout, `/no-access` and the API stay `404` there. A signed-in donor
with no row in the name's organization is sent to `/no-access` while the switch
is on (ADR 0016, decision 7).

The dashboards' static files go to the dashboards without the front's proxy.
The donor matcher skips `/admin/_next/*` and `/missionary/_next/*` in every
build without `.` or `..` segments (nor an empty one); with the switch on,
`serveUnderPathsDonorRewrites` (`scripts/release/serve-under-paths.mjs`) adds
two `beforeFiles` external rewrites with that pattern to `FRONT_ADMIN_ORIGIN`
and `FRONT_MISSIONARY_ORIGIN`, same path. Both use one segment rule,
`DASHBOARD_ASSET_SEGMENT` (a segment is not empty, `.` or `..`): the matcher
literal spells it out for each prefix, and the two rewrite sources are
`/<prefix>/_next/:path(<rule>)+`. A raw path holding such a segment, as
Vercel's router tests it before resolving dots, runs the donor proxy and is
never sent to a dashboard, where `..` could reach the assistant's `/eve/v1/*`
ahead of the staff proxy (ruling (c) on the 3c gate). Encoded dots
(`%2e%2e`) met Vercel's own `403`/`400` on the gate's previews. Such a request
carries no stamp, passes no
`FRONT_NAMES` check and keeps the client's headers; each dashboard serves its
`/<prefix>/_next/*` without its own proxy, as on its own address. Both origins
are read when the donor app is built: with the switch on, a missing or invalid
origin fails the donor build, naming the variable, and a changed origin needs a
donor rebuild (both names are in the donor's build hash, `apps/donor/turbo.json`).
`beforeFiles` sources match without regard to case while the matcher is
case-sensitive, so `/Admin/_next/*` runs the donor proxy and is then still
rewritten.

The front forwards exactly five assistant routes, case-sensitive, from
`/admin/eve/v1/` to `<FRONT_ADMIN_ORIGIN>/eve/v1/` with the query, the usual
header stripping and the `/admin` stamp (`routeToDashboard` in
`packages/auth/front.ts`): `GET health`, `POST session`, `POST session/<id>`,
`GET session/<id>/stream` and `POST session/<id>/cancel`, where `<id>` is one
non-empty segment and no trailing slash is allowed. Anything else under
`/admin/eve/v1/` (the `github` channel, the callback and connection routes,
`info`, other methods) and any such path holding `%`, `\`, `//` or a `.` or
`..` segment gets the front's `404` (`no-store`); `/admin/eve/v1` without the
slash, and other dashboard paths, keep today's destination under the base path.
The mapping follows Vercel's mount of the service at the root of the staff
deployment. A local `next dev` or `next start` of the staff app under the base
path mounts the service at `/admin/eve/v1/*` instead, so the front's rule does
not match a local server under the base path. The panel calls
`<base path>/eve/v1/…` (`host: appBasePath()` in
`apps/admin/app/eve/global-panel.tsx`).

Behind the front the service sees the staff address as `host` and the front's
name as `Origin`. For a cookie-carrying write, `adminEveRouteAuth`
(`packages/eve-runtime/src/admin-session-auth.ts`) verifies the front's `/admin`
stamp with the staff project's `FRONT_STAMP_KEY` or `FRONT_STAMP_KEY_PREVIOUS`
through `verifiedStampedOriginForRequest` (`packages/auth/front-stamp.ts`, which
imports nothing from Next.js and holds the one stamp implementation that
`front.ts` re-exports). The stamped origin's scheme must be the request's and
`x-forwarded-host` absent or, trimmed and lower-cased, the stamped host or the
request's own host; the same-origin rule is then judged against the stamped
host. Otherwise today's rule applies; the session, administrator and ownership
checks are unchanged. A cross-site page cannot forge a stamp, and a replayed
stamp (60 seconds at most) still meets the browser's own `Origin`. A caller
already holding an administrator's session can still call the staff address
directly with a forged `Origin`, the service still ignores the name, and
`/eve/v1/health` stays public (N6).

With the switch unset (today's default everywhere), no `basePath` is set, the
donor app proxies and rewrites nothing to the dashboards (its config reads
neither origin), the panel calls `/eve/v1/…`, no stamp key exists for the
service, and the dashboards admit direct requests as before. With the switch
unset, only the donor matcher changes: `/admin/_next/*` and
`/missionary/_next/*` without `.` or `..` skip the proxy and return the public
catch-all not-found without a session read (paths with `.` or `..` still run
it). A path other than `/` that ends in `/`, `/admin/_next/` included, meets
Next.js's built-in `308` to the same path without the slash before the proxy
and the rewrites (the donor sets neither `trailingSlash` nor
`skipTrailingSlashRedirect`). Reserved paths,
provider-address cutover, release tooling, and real-domain host lists remain off
until later parts of N3 and N2/N6.

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

The prototype admin `/api/cms/public/*` routes and public reader adapters were
retired in WP6 part 2a (AL-2679). `apps/donor/lib/cms/client.ts` is an empty
reader returning not-found / empty updates with no network call until WP7
implements the target public reader behind `packages/api/src/cms/public`.

The adopted Phase 22–24 Site/domain/locale serving specifications require their
exact owner admission, immutable generation and qualification rules. Read the
[CMS runtime guide](./cms-runtime.md) and
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
