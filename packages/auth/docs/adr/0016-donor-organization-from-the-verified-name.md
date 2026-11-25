# 0016. The donor app takes its organization from the verified name

**Status:** Recorded on 2026-11-25 with WP3b part 1 of the Core CRM, CMS and
database foundation program (AL-2676); decision 7 added with WP3b part 2
(AL-2676, the ruling under D-16 on part 2, Q1-Q6). It describes the code as it is and
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

7. **A Site name sends four account roots to its organization's home (WP3b part 2).**
   - **Which requests.** With the switch on, after the one lookup of
     decision 2 and before the class decision of decision 4, the proxy
     redirects only when all hold: `website` is admitted; `donor_account` is
     refused `not_home`; `resolved.transport === "none"`; the method is
     exactly `GET` or `HEAD`; and `resolved.pathname` is or lies under
     `/register`, `/forgot-password`, `/auth/callback` or `/donor-dashboard`
     (`DONOR_HOME_REDIRECT_ROOTS` and `isHomeRedirectPath` beside
     `matchesRoot` in `apps/donor/lib/route-policy.ts`). Every other request
     keeps decision 4's answer with no home read: `/login`, `/checkout`,
     `/no-access` and `/api/**` stay `404` on a name that is not home
     (`/checkout` until WP8a), as do `POST`, `PUT` and `OPTIONS`; a home, a
     `ready` name, a name without `website` and an unknown name never
     redirect.
   - **No request header decides, and why.** Unless `skipProxyUrlNormalize`
     is set, which `apps/donor/next.config.ts` does not do, Next.js's adapter
     deletes the flight headers (`rsc`, `next-router-state-tree`,
     `next-router-prefetch`, `next-hmr-refresh`,
     `next-router-segment-prefetch`) and strips `_rsc` before `proxy()` runs
     (`next/dist/server/web/adapter.js:147-163` in 16.4.5), so the proxy
     cannot tell a client navigation or prefetch from a document request. A
     plain `GET` of a redirected path therefore gets the same `307` however
     it was sent. The router's fetch follows it to home, which sends no CORS
     headers, so the fetch fails; the client logs "Failed to fetch RSC
     payload … Falling back to browser navigation" and loads the URL as a
     document (`client/components/router-reducer/fetch-server-response.js:216-232`),
     which gets the `307` and lands on home. That fetch sends cookies to its
     own origin only (`:503`).
   - **Transport forms.** In a direct `proxy()` call a `.rsc` or
     `.segments/` path keeps `404`. On a server Next.js first removes one
     trailing `.rsc` (`adapter.js:113`), so `/register.rsc` arrives as
     `/register` and gets the same `307` to home's `/register`; only a
     `.rsc.rsc` or `.segments/` form arrives with `transport` `rsc` or
     `segment` and keeps `404`.
   - **The read.** One `lookUpHomeName(host)`
     (`packages/auth/home-name.ts`, `@asym/auth/home-name`) with decision 4's
     trimmed `host`: one `rpc("resolve_home_host", { p_host: host })` on a
     public client made inside the call, a three-second abort, no session,
     service key, header read or cache. `unavailable` (no client, a throw,
     an error, a timeout, a non-array, two rows, or a `primary_domain` that
     is not a stored host of at most 253 bytes) gives
     `verifiedNameUnavailable()` (`503`); `none` gives `frontNotFound()`;
     `home` gives the redirect. `public.resolve_home_host(text)` is a
     `postgres`-owned STABLE STRICT definer with an empty search path,
     EXECUTE for `anon`, `authenticated` and `service_role`
     (`docs/security/anon-definer-allowlist.json`). It normalises the asked
     host with `resolve_verified_host`'s expression, copied verbatim and held
     equal by `tests/unit/auth/home-name-contract.test.ts`, and re-checks
     the asked name itself in one statement: it returns the home record's
     `primary_domain` only when the asked name is `active` and serves
     `website`, the same organization's home record names a host other than
     the asked one, and that host is `active` and serves `donor_account`.
     The home record's composite foreign key keeps the answer in the asked
     name's organization. It reads no status (ruling Q6), so a suspended
     organization's Site name and an `inactive` Site still redirect; a home
     that is not active, not designated or without `donor_account` gives
     `404`, never another name.
   - **Location** (`apps/donor/lib/home-redirect.ts`). Scheme and port come
     from the stored name only (ruling Q2): a home ending with the bytes
     `.localhost` gets `http:` and `:` plus `request.nextUrl.port` when that
     is not empty (under `next start` Next.js builds the proxy's URL from its
     own listener, `next/dist/server/next-server.js:1157-1166,1302-1305`);
     any other home gets `https:` and no port, since `active` needs the
     HTTPS proof. Never `request.nextUrl.protocol` (it follows
     `x-forwarded-proto`, `resolve-routes.js:116-119`), `x-forwarded-*`,
     `Referer`, a query value, or any other part of `host` or `request.url`.
     A listener port that is not `1` to `65535` gives `404`. The path is
     `resolved.pathname` only when it matches
     `^/[A-Za-z0-9._~!$&'()*+,;=:@/-]*$` and lies under one of the four
     roots, else `/donor-dashboard` (ruling 1 Q6); it never passes through a
     URL parser or setter, because the WHATWG parser deletes tab, CR and LF
     before it resolves dot segments (`/register/..%0a/login` would land on
     `/login`). The query keeps one `next` only when there is exactly one
     `next` key, its value matches `^/[A-Za-z0-9._~!$&()*+,;=:@/?-]*$` (no
     `'`, which the parser percent-encodes in an http(s) query; no `%`,
     `\`, `#`, whitespace of any kind including U+00A0, U+2028 and U+FEFF,
     control character or non-ASCII), it holds no `//`, no `.` or `..`
     segment before its first `?`, and `safeNextParam(value) === value`;
     otherwise it is dropped silently and the redirect still happens. Every
     other key is dropped, `code` included (ruling Q3). No fragment is built
     (ruling Q5: none is needed). `Location` is the string
     `${scheme}//${home}${port}${path}`, then `?next=` and
     `encodeURIComponent(next)` when kept; inside `try`, `new URL(location)`
     must give exactly that scheme, hostname, port and path, no user, an
     empty hash, and no query or the one `next`, and its `href` must equal
     `location`, else `404`.
   - **The response.** `307`, an empty body, `cache-control: no-store` and
     `referrer-policy: no-referrer` (ruling Q5), built before `authProxy`:
     no session read and no `Set-Cookie`. Next.js relativises a proxy's
     `Location` only when its host equals the request URL's
     (`adapter.js:416-431`; `resolve-routes.js:487-500`), so a `Location` on
     home's host leaves as written.
   - **Ruling Q4.** The auth options are written once, typed
     `AuthMiddlewareOptions`: the off instance is created from them
     unchanged, the on instance from them with only `unauthorizedRedirectTo`
     replaced by `/no-access`, and every on-branch call uses the on
     instance. A signed-in donor with no row in the name's organization is
     therefore sent to `/no-access` on a protected path
     (`middleware.ts:744-751`) and on `/login` or `/register`
     (`middleware.ts:538-559`); off still sends such a person to `/`.
     `tests/unit/front/donor-admission/no-access.test.ts` holds each list to
     one copy. The page's "Go to home" link (`app/no-access/page.tsx:25`) is
     a `404` on an account-only home; WP5's claim page replaces the page.
   - **Cost.** A request that does not redirect makes one lookup (decision
     2); a redirected `GET` or `HEAD`, or a prefetch of a redirected path
     from a Site page, makes two indexed reads, never cached; exempt paths
     and off make none. N6 measures the request count.
   - **Not observed locally** (for N3 part 3's preview runbook): on an
     adapter build such as Vercel, the form in which a client navigation or
     prefetch to a redirected path reaches `proxy()` (plain, `.rsc` or
     `.segments/`), whether the platform strips one `.rsc` as `next start`
     does, the order in which the proxy's `cache-control: no-store` and
     `referrer-policy: no-referrer` meet `apps/donor/next.config.ts`'s
     headers (locally `next start` applies the proxy's last), and the footer
     click across two HTTPS origins.

## Owned elsewhere

- **N3 part 3:** the first switched-on preview's observations, decision 7's
  "Not observed locally" items included. **N3 part 4:** lifting the
  production refusal once parts 1 and 2 have merged (`ruling-wp3b-part1.md`
  Q9).
- **WP3b parts 3–5:** Mission Control Sites and account-brand settings (part 3),
  removing demo-organization constants and dead staff branches (part 4), and
  deleting the off-mode single-organization fallback after N3 part 4 (part 5).
- **WP7:** tenant and Site status checks on anonymous website paths (account
  paths already enforce organization and membership status through live
  membership reads), moving `apps/donor/next.config.ts` redirects and headers
  behind admission, narrowing the proxy matcher, and admitting the staff-class
  media route on `ready` homes.
- **Other owners:** N3 part 4 (front lookup for dashboards), N5 (designating
  a home), N2 parts 2–4 (generation; the callback, where a query key N2 adds
  must be listed in decision 7 by whichever of the two merges second; page
  identity/cache keys; out-of-request URLs including Stripe Billing Portal
  `return_url`), WP6 part 2a (retiring public CMS routes), N4 (auth links),
  WP5 (sign-up organization), WP8a (Site guest checkout).
