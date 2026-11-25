# 0016. The donor app takes its organization from the verified name

**Status:** Recorded on 2026-11-25 with WP3b part 1 of the Core CRM, CMS and
database foundation program (AL-2676). It describes the code as it is and
ratifies no product intent. Accepted platform intent is in
[`docs/adr/`](../../../../docs/adr/README.md) and in the OpenSpec change
`adopt-tenant-owned-domains`.

## Context

With `CORE_SERVE_UNDER_PATHS=1`, the donor app (`apps/donor`) is both the front
that rewrites `/admin/*` and `/missionary/*` to the dashboards
([0015](0015-organization-from-the-verified-name.md)) and the host for each
organization's public website and donor account portal. Before this record,
non-dashboard requests passed straight through `apps/donor/proxy.ts` with no
verified-name lookup, `isNameTenantRefused` allowed an absent
`x-asym-name-tenant` when `CORE_APP_BASE_PATH` was empty, and
`selectAssignment` refused any donor holding live memberships in two
organizations (the interim single-organization fallback until WP3).

## Decisions

1. **Two donor rows in `SURFACE_ADMISSION`, both `active` only.**
   `VerifiedNameSurface` and `SURFACE_ADMISSION` in `packages/auth/verified-name.ts`
   add `donor_account` (`states: ["active"], home: true`) and `website`
   (`states: ["active"], home: false`) beside the unchanged `staff` and
   `missionary` rows. The proxy admits nothing on a `ready` or claimed name
   (`openspec/contracts/multi-site-management.md`, "MUST remain unavailable until
   exactly one current designated verified home domain … is active";
   `ruling-n2.md` Q2); configuration redirects in `apps/donor/next.config.ts` and
   paths excluded by the proxy matcher still answer on any name and are owned by
   WP7. Refusal priority remains `not_ready`, `not_home`, `not_for_surface`, and
   `unknown` for no row.

2. **One uncached lookup answers both donor surfaces.**
   `lookUpVerifiedNameSurfaces` in `packages/auth/verified-name.ts` makes one
   `rpc("resolve_verified_host", { p_host: host })` call through the shared
   public-client helper with the three-second abort timeout and no cross-request
   cache, returning either `unavailable` or each requested surface's decision.
   `lookUpVerifiedName` keeps its signature and answers by delegating to it.

3. **Strict path form, transport mapping, and pre-lookup refusals in the donor proxy.**
   With the switch on, after `routeToDashboard` returns `null`,
   `apps/donor/proxy.ts` first strips client `x-asym-front-*` and
   `x-forwarded-host` (`withoutFrontHeaders(request, { stripForwardedHost: true })`)
   on every path, exempt ones included. Without `trailingSlash: true` or
   `skipTrailingSlashRedirect: true`, Next.js answers a literal trailing slash
   with a `308` redirect before the proxy runs, while direct or rewritten calls
   to `proxy()` can still carry one. On `request.nextUrl.pathname`,
   `resolveDonorPath` (and its string wrapper `normalizeDonorPath`) in
   `apps/donor/lib/route-policy.ts` runs these steps in order and refuses with
   `frontNotFound()` (`404`, `cache-control: no-store`, empty body) before any
   lookup whenever a check fails:
   - Refuse any percent-encoded slash (`%2F` or `%2f`) anywhere in the raw path
     before decoding.
   - Decode once with `decodeURIComponent`, refusing decode errors.
   - Refuse decoded `\`, `.`, or `..` segments (reusing `hasDotOrBackslashSegment`
     from `packages/auth/front.ts`), `//` anywhere, any `%` left after decoding
     (double encoding), or a decoded `/admin` or `/missionary` prefix.
   - Map Next.js App Router transport paths to their target page path (constants
     pinned against installed `next/dist/lib/constants.js` and `next/dist/`
     normalizer sources): a decoded path containing `.segments/` must match
     `<page>.segments/<segment>.segment` (after `server/web/adapter.js` strips
     `.rsc` via `normalizeRscURL`) or `<page>.segments/<segment>.segment.rsc`
     with a single `.segments/`, a non-empty `<page>` not ending in `/`, and a
     non-empty `<segment>` not starting or ending in `/` (any other decoded path
     containing `.segments/` is refused); a remaining decoded path ending in
     `.rsc` strips one `.rsc`, refusing `/.rsc`, `<page>/.rsc`, and double
     `.rsc.rsc`. On both transport forms, `/index` maps to `/` and `/index/<rest>`
     maps to `/<rest>` (matching Next.js's `denormalizePagePath`), and a mapped
     `/admin` or `/missionary` prefix is refused.
   - On non-transport paths, strip one trailing `/` (keeping `/`) to obtain
     `normalized`.

4. **Exact exempt paths and three path classes.**
   - **Exempt** (`DONOR_EXEMPT_PATHS`, exact equality on `normalized` when
     `transport === "none"`, never a prefix, `%2F` spelling, `.segments/` path,
     or leftover `.rsc` seen by the proxy; `ruling-wp3b-part1.md` Q3):
     `/api/webhooks/stripe`, `/api/health`, `/api/health/migrations`, and
     `/api/playwright-ready` (pinned to a constant `{ status: "ok" }` with no
     data read). Next.js's adapter emits no `.segments/` output for Route
     Handlers, so `.segments/` paths for exempt routes reach `proxy()` with
     `transport === "segment"` and are never exempt; a leftover `.rsc` still
     present when `proxy()` runs (such as raw `/api/health.rsc.rsc` after Next
     strips one `.rsc`) carries `transport === "rsc"` and is not exempt either.
     By contrast, `server/web/adapter.js` strips a single trailing `.rsc` before
     `proxy()` runs, so a raw `/api/health.rsc` reaches `proxy()` as
     `/api/health`, is exempt, and makes no lookup: on an adapter build Next.js
     answers it with the same Route Handler (`build-complete.js` emits
     `<route>.rsc` for `APP_ROUTE`), while on self-hosted `next start`
     (non-minimal mode) the router does not strip `.rsc` (`filesystem.js`) and
     `(public)/(solid)/[...cmsSlug]` answers with website content only on any
     name, which is WP7's (the matcher and the catch-all). Exempt requests make
     no lookup and enter `authProxy(cleaned)` with no `nameTenantId`, removing
     any client `x-asym-name-tenant`.
   - **Host:** `request.headers.get("host")?.trim()` (port kept, never
     `x-forwarded-host` or `request.url`). Absent or blank returns
     `frontNotFound()` with no lookup.
   - **Classes** (`classifyDonorPath`, matching each root or `<root>/…`;
     `ruling-wp3b-part1.md` Q1):
     - `account`: `/donor-dashboard`, `/login`, `/register`,
       `/forgot-password`, `/auth/callback`, `/checkout`, `/no-access`, `/api`
       (non-exempt); needs `donor_account` admitted.
     - `both`: `/privacy`, `/terms`, `/cookies`, `/help/about`; needs either
       `donor_account` or `website` admitted.
     - `website`: every other path, `/` included; needs `website` admitted.
   - A lookup failure returns `verifiedNameUnavailable()` (`503`, `no-store`,
     empty body) and never forwards. A refused surface returns `frontNotFound()`
     (`404`, `no-store`, empty body) with no session read and no `Set-Cookie`.
     Thus `/` on a home with no `website` surface is `404 no-store`, and every
     account path on a non-home name is `404 no-store`.

5. **Block in the proxy, Stream in the layout.**
   Verified-name admission runs as a **Block** in `apps/donor/proxy.ts` before
   any route renders or a prerendered shell is served; it is never cached.
   Request-time reading of `x-asym-name-tenant` in `getAuthContext` and
   `readPortalDocumentScope` runs as a **Stream** inside the existing
   `<Suspense>` boundary of
   `apps/donor/app/(dashboard)/donor-dashboard/layout.tsx`, with no new
   `use cache` and no `instant = false`.

6. **The single-organization fallback ends on-mode and stays intact off-mode.**
   - `ResolveAssignmentInput` (`packages/auth/principal/types.ts`) gains
     `nameTenantId?: string`. In `selectAssignment`
     (`packages/auth/principal/assignment.ts`), for class `donor` only when
     `nameTenantId` is provided: a non-canonical UUID returns `no_assignment`,
     an absent or differing `expectedTenantId` returns `tenant_mismatch`, and
     the donor row count is scoped to `a.tenantId === nameTenantId`. Without
     `nameTenantId`, today's multi-row refusal runs unchanged; `staff` and
     `missionary` never read `nameTenantId`.
   - `selection()` (`packages/auth/context.ts`) forwards `nameTenantId` only
     from a valid verified name (`narrowing.nameTenantId`, used by both live
     requests and the E2E bypass), never from `options.expectedTenantId` or
     `x-asym-tenant`. `resolveUserRoleFromDatabase`
     (`packages/auth/resolve-user-role.ts`) passes `nameTenantId` beside
     `expectedTenantId`.
   - `isNameTenantRefused` (`packages/auth/request-headers.ts`) now refuses
     `invalid || absent` in every app while the switch is on, ending the
     empty-base-path fallback in the donor app without changing the dashboards
     (which already set a non-empty base path on) or Eve (`nameTenant: "ignore"`).
   - `readPortalDocumentScope` (`packages/auth/tenant-server.ts`) is now
     `async`, awaits `readServerNameTenantState()`, and returns `null` if the
     name is refused or differs from the assignment's organization. With the
     switch off, it returns today's scope without calling `headers()`.
   - With `CORE_SERVE_UNDER_PATHS` unset or `"0"`, the donor proxy creates no
     lookup client, performs no lookup, and preserves off-mode behavior byte
     for byte.

## Owned elsewhere

- **WP3b part 2:** the anonymous home-host lookup migration and redirecting
  non-home account paths (`/register`, `/forgot-password`, `/auth/callback`,
  `/donor-dashboard`) to home with validated relative `next` and listed query
  keys (`/login` stays `404`; `/checkout` stays `404` until WP8a).
- **WP3b parts 3–5:** Mission Control Sites and account-brand settings (part 3),
  removing demo-organization constants and dead staff branches (part 4), and
  deleting the off-mode single-organization fallback after N3 part 4 (part 5).
- **WP7:** tenant and Site status checks on anonymous website paths (account
  paths already enforce organization and membership status through live
  membership reads), moving `apps/donor/next.config.ts` redirects and headers
  behind admission, narrowing the proxy matcher, and admitting the staff-class
  media route on `ready` homes.
- **Other owners:** N3 part 4 (front lookup for dashboards and lifting the
  production refusal after parts 1–2), N2 parts 2–4 (generation, callback,
  page identity/cache keys, out-of-request URLs including Stripe Billing Portal
  `return_url`), WP6 part 2a (retiring public CMS routes), N4 (auth links),
  WP5 (sign-up organization), WP8a (Site guest checkout).
