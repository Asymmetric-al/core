# TP5: the tenant in the page address

**Status:** thin proof, 17 November 2026. Issue [#2675](https://github.com/Asymmetric-al/core/issues/2675). It settles the row "The tenant in the page address" in section 15.2 of [the plan](../core-crm-cms-database-target-architecture.md) before WP2b is built. The prototype is on the throwaway branch `proof/AL-2675-tp5-tenant-in-address` and is not meant to merge. This report stands without it.

## 1. Verdict

**The proxy rewrite passes. WP2b should use it, not the fallback.**

On this repository's Next.js 16.4.2, with Cache Components and partial prefetching on, a rewrite in the proxy served the Care directory under `/<tenant>` and `/<tenant>~<sub-role>`, on the existing page files. In a production build, and in development wherever development can measure it:

- list to detail and back stayed soft navigations, with no document load;
- `useParams`, `router.push`, active navigation and a server redirect worked once the page code carried the prefix;
- every tenant got the same prerendered static shell, byte for byte, with the same prerender headers;
- `instant()` committed the detail page under the navigation lock;
- the proxy refused a foreign tenant, dropped or questioned a sub-role suffix, and kept the tenant through sign-in, all before the page shell.

The rewrite has one measured cost. The client router cannot learn a route pattern from a rewritten address, so it fetches one route tree per distinct link. On the list page that meant 10 route-tree prefetches for 10 detail links, against 4 without the prefix and 4 under the fallback. The whole page made 27 prefetch requests (11.1 KB) against 21 (8.9 KB) without the prefix. That is a bounded cost with known mitigations. The fallback would avoid it, but it needs the same link changes plus about 250 moved files and 148 test files with new import paths.

Two conditions come with the verdict, and both are findings of this proof:

1. **The rewrite must stay internal.** On a server bound to `127.0.0.1`, Next.js treats it as external. The proxy then runs a second time on the inner path and drops the tenant headers the first pass set (section 5.8).
2. **A guard must reload the document when the address and the document's scope disagree.** In production, a soft navigation from tenant A's list to tenant B's list returned 307 bytes and re-rendered nothing. Without the guard, tenant A's page would have stayed on screen under tenant B's address (section 5.6). The fallback needs the same guard.

## 2. What was built

The prototype serves one Mission Control section at the address that section 5.2 of the plan describes:

```
/<tenant-id>/care/directory                    one staff row
/<tenant-id>/care/directory/<person-id>
/<tenant-id>~member_care/care/directory        several staff rows, one chosen
```

**The section is the Care directory.** It has a list (`/care/directory`), a detail page (`/care/directory/[id]`), an overview and a settings page. It was chosen over Support tickets and Contributions for three reasons.

- It follows the page pattern most Mission Control pages use: a small server `page.tsx` renders a client page that loads its data from the app's own API. 23 of the 53 signed-in pages follow it; 9 await server data in the page itself.
- It exercises every client routing API the plan worries about: `<Link>` built by a helper (`careProfileHref`), `router.push` on a row click, `useParams` on the detail page, and the shell's active state from `usePathname`.
- It renders in demo mode. Support tickets need a service-role database client and fall into their error boundary without one. Contributions has no real detail page: `/contributions/[id]` only redirects into the list.

The canonical contribution link (`/contributions/[contributionId]`) was added for the one thing the Care section lacks: a server `redirect()`.

**What changed, by file.** The rewrite is generic: once the proxy knows the address shape, every page answers under the prefix. What is per section is the page code that builds addresses.

| File                                                                          | Change                                                                                                                                                                            |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/auth/tenant-address.ts` (new)                                       | The address grammar: parse `/<uuid>[~<sub-role>]`, strip it, prefix an href, read the scope headers, and the decision for a person's staff rows                                   |
| `packages/auth/middleware.ts`                                                 | An optional `tenantAddress` setting. With it the proxy parses the prefix, runs its existing checks on the inner path, decides membership, and answers with `NextResponse.rewrite` |
| `packages/auth/tenant-address-staff-rows.ts` (new)                            | The proxy's membership reader: `current_user_assignments()` for a real session, a fixed fixture for an E2E bypass identity                                                        |
| `packages/auth/tenant-scope.tsx` (new)                                        | The document scope provider, the guard that reloads on a mismatch, `useTenantHref` and `useRoutePathname`                                                                         |
| `packages/auth/tenant-redirect.ts` (new)                                      | `redirectInTenant`, a `redirect()` that keeps the prefix                                                                                                                          |
| `apps/admin/proxy.ts`                                                         | Turns the setting on                                                                                                                                                              |
| `apps/admin/app/(app)/layout.tsx`                                             | Reads the scope once, inside the existing request-time boundary, and wraps the shell in the provider                                                                              |
| `apps/admin/app/mc-shell.tsx`                                                 | Sidebar, breadcrumbs, search and profile menu links carry the prefix (10 sites); two active-state checks use the route pathname                                                   |
| Care pages, `care-personnel-grid.tsx`, `CareDashboard.tsx`                    | 10 link and push sites carry the prefix                                                                                                                                           |
| `apps/admin/app/(app)/contributions/[contributionId]/page.tsx`                | Uses `redirectInTenant`                                                                                                                                                           |
| `apps/admin/app/(auth)/choose-assignment/page.tsx` (new)                      | A minimal chooser outside the tenant segment                                                                                                                                      |
| `apps/admin/app/(app)/[tenant]/care/**` (new, measurement only)               | The same Care pages re-exported under a `[tenant]` segment, so the fallback could be measured on the same build. A prototype-only cookie tells the proxy not to rewrite           |
| `tests/unit/auth/tenant-address.test.ts`, `middleware-tenant-address.test.ts` | 28 unit tests, each written before the code it covers and seen failing first                                                                                                      |
| `tests/e2e/tp5/` (new)                                                        | The measurement spec, its own Playwright config, and a local stand-in for Supabase Auth used by the production runs                                                               |

**How a request flows.** The proxy reads the first segment. It is a tenant only when it is a canonical lower-case UUID, optionally followed by `~` and a lower-case name. The demo tenant `00000000-0000-0000-0000-000000000001` passes, because the version-digit check of NX-03 is not used. The proxy runs its existing checks on the inner path: public pages, sign-in and the role check. For a signed-in person it then reads their live staff rows in that tenant and decides.

| Staff rows in the tenant | Address names         | Proxy answers                                       |
| ------------------------ | --------------------- | --------------------------------------------------- |
| none                     | anything              | 307 to `/no-access`                                 |
| one                      | no sub-role           | rewrite onto the page, acting under that row        |
| one                      | any sub-role          | 307 to the same address without the suffix          |
| several                  | a sub-role they hold  | rewrite, acting under that row                      |
| several                  | none, or one not held | 307 to `/choose-assignment?tenant=…&next=…&roles=…` |

On a rewrite the proxy forwards four request headers to the render: `x-asym-tenant-id`, `x-asym-assignment-id` (the membership row), `x-asym-address-prefix` and `x-asym-route-pathname`. It deletes any of them the caller sent, on every page request. `x-asym-pathname` keeps the full address, so a sign-in redirect returns to the same tenant. An `/api` path under the prefix is a 404, and a public page under the prefix redirects to the bare page. The chooser's `roles` list is only a display hint: each choice goes back through the same decision, and each starts a new document.

**What the prototype does not do.** It does not build WP2a or the rest of WP2b. `getAuthContext` still takes the tenant from the profile, the browser data layer is still a singleton, and the app's own API calls still carry no tenant. So in the prototype the address decides the scope, the links and the proxy's decision, while the Care data still comes from the profile's tenant.

## 3. Method

**Environment.** Windows 11 laptop, Node 24.22, Bun, Next.js 16.4.2 (Turbopack), `cacheComponents` and `partialPrefetching` on. The admin app listened on port 3230. No Supabase stack, hosted project or container was used.

**Two ways to sign in.**

- _Development_ ran in the demo mode that `scripts/run-with-ci-env.mjs` sets up: placeholder Supabase and `E2E_AUTH_BYPASS=true`. Fixture identities read fixed staff rows: the demo admin holds one row in the demo tenant, `tp5-two-rows-user` holds finance and member care there, and `tp5-two-tenants-user` holds one row in the demo tenant and one in a second tenant.
- _Production_ cannot use demo mode: the E2E bypass is off whenever `NODE_ENV=production` (`packages/auth/e2e-auth.ts`), and `next start` always sets it. This is why the instant-navigation rig has no admin coverage today. The production build was therefore pointed at `tests/e2e/tp5/supabase-stub.mjs`, a 160-line HTTP server on `127.0.0.1:54998` that answers the five calls a signed-in staff page makes (`/auth/v1/user`, `profiles`, `current_user_memberships`, `current_user_assignments`, and an empty list for anything else) for the same three fixture users. It holds no data and verifies no token. This also exercised the real-session code path of the proxy's membership reader.

**Rig settings this machine needed.**

- `ASYM_E2E_AUTH_SURFACE=admin`, because the E2E cookie name is chosen by port and 3230 maps to no surface.
- `EVE_BASE_URL=http://127.0.0.1:9`. Unset, `next dev` waits up to 180 seconds for the Eve sidecar and then exits, and here it timed out. The setting only points the assistant's rewrites at a dead address.
- `--hostname localhost`, not `127.0.0.1` (section 5.8).
- `next dev` and `next build` stop every second run to print an upgrade notice from `experimental.agentUpgrade`. The start scripts retry once.

**Fixtures.** The Care hooks call `/api/admin/member-care/dashboard` and `/api/admin/member-care/directory/<id>`. The spec answers those two calls in the browser with 24 fixture people. The grid shows 10 rows per page. No product code reads the fixture.

**Variants.** Each measurement ran on the same server for up to three addresses: _unprefixed_ (today's behaviour, the baseline), _rewrite_ (prefixed, served by the rewrite) and, in production, _fallback_ (prefixed, served from the `[tenant]` copies of the Care pages).

**Production build.** `next build` with `VERCEL_ENV=preview EXPOSE_TESTING_API=1` (the switches the instant-navigation rig uses to expose the testing API) and `NEXT_PUBLIC_SUPABASE_URL` set to the stub, then `next start`. The build listed `/care/directory`, `/care/directory/[id]` and `/choose-assignment` as partial prerenders, and the four `[tenant]/care` copies the same way.

**How to repeat.** From the repository root, after `bun install`:

```sh
# Development
export EVE_BASE_URL=http://127.0.0.1:9 ASYM_E2E_AUTH_SURFACE=admin
node scripts/run-with-ci-env.mjs -- bun run --cwd apps/admin dev:playwright -- --port 3230 --hostname localhost
TP5_RIG=1 TP5_MODE=dev PLAYWRIGHT_REUSE_EXISTING_SERVER=0 \
  node scripts/run-with-ci-env.mjs -- node node_modules/@playwright/test/cli.js test --config tests/e2e/tp5/playwright.config.ts

# Production
node tests/e2e/tp5/supabase-stub.mjs &
export VERCEL_ENV=preview EXPOSE_TESTING_API=1 EVE_BASE_URL=http://127.0.0.1:9 ASYM_E2E_AUTH_SURFACE=admin \
  NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54998 NEXT_PUBLIC_SUPABASE_ANON_KEY=tp5-stub-anon-key
node scripts/run-with-ci-env.mjs -- bun run --cwd apps/admin build
node scripts/run-with-ci-env.mjs -- bun run --cwd apps/admin start -- --port 3230 --hostname localhost
TP5_RIG=1 TP5_MODE=prod TP5_AUTH=stub INSTANT_NAV_RIG=1 PLAYWRIGHT_REUSE_EXISTING_SERVER=0 \
  node scripts/run-with-ci-env.mjs -- node node_modules/@playwright/test/cli.js test --config tests/e2e/tp5/playwright.config.ts

# Unit tests
bunx vitest run tests/unit/auth/tenant-address.test.ts tests/unit/auth/middleware-tenant-address.test.ts
```

The spec writes every number below to `test-results/tp5/measurements-<mode>-<run>.json`. Its config starts no server, so it only measures the server at `TP5_BASE_URL` (default `http://localhost:3230`). It skips itself unless `TP5_RIG=1`, so the normal end-to-end suites never run it.

## 4. Results at a glance

| Question                                        | Development                            | Production                                                                     |
| ----------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| List to detail and back is a soft navigation    | Yes, both variants run                 | Yes, all three variants                                                        |
| Link prefetching happens with the prefix        | Not measurable in dev                  | Yes. 27 requests against 21 unprefixed; 10 tree fetches per 10 links against 4 |
| Same static shell under the prefix              | Not measurable in dev                  | Yes, byte for byte, same headers and first-byte time                           |
| `instant()` holds                               | Not measurable in dev                  | Yes, all three variants                                                        |
| Proxy refuses a foreign tenant before the shell | Yes                                    | Yes                                                                            |
| Sub-role suffix handled before the shell        | Yes                                    | Yes                                                                            |
| Cross-tenant soft navigation is caught          | Yes, by the guard                      | Yes, by the guard                                                              |
| Server redirect keeps the prefix                | Yes, with the helper                   | Yes, with the helper                                                           |
| End-to-end cases                                | 10 passed, 4 skipped (production only) | 17 passed                                                                      |

## 5. Measurements

### 5.1 List to detail stays a soft navigation

The spec opens the list, marks the window object, clicks the first person, waits for the detail heading, goes back through the sidebar's "Directory" link, then opens the second person by clicking a row cell, which calls `router.push`. It counts main-frame document requests and checks that the mark survives.

| Variant   | Document loads | Mark kept after link, back, row click | Person link `href`         | Active sidebar link   | Breadcrumb links                   |
| --------- | -------------: | ------------------------------------- | -------------------------- | --------------------- | ---------------------------------- |
| No prefix |              0 | yes                                   | `/care/directory/p-01`     | `/care/directory`     | `/care`, `/care/directory`         |
| Rewrite   |              0 | yes                                   | `/<t>/care/directory/p-01` | `/<t>/care/directory` | `/<t>/care`, `/<t>/care/directory` |
| Fallback  |              0 | yes                                   | `/<t>/care/directory/p-01` | `/<t>/care/directory` | `/<t>/care`, `/<t>/care/directory` |

`<t>` is the demo tenant's ID. The rows show production; development gave the same values for the first two variants.

The detail page found its person through `useParams`. Under the rewrite `useParams` returns the rendered route's parameters (`{ id }`) and no tenant; under the fallback it also returns `tenant`. `usePathname` returns the address in the browser, prefix included, on the server render as well as in the browser. That is why active-navigation checks need the route pathname, and why the guard can compare the address with the scope. Wall-clock navigation times were recorded but are single samples on a shared, loaded laptop, so they are not used as evidence; section 5.3 has comparable server timings.

### 5.2 Link prefetching

Production only, because `next dev` does not prefetch. The spec loads the list (10 detail links on the page and 16 links in the shell's sidebar), waits for the network to go quiet plus 3 seconds, and records every prefetch request by its headers.

| Variant   | Prefetch requests | Route-tree requests | Segment requests |  Bytes | Route-tree requests for the 10 detail links |
| --------- | ----------------: | ------------------: | ---------------: | -----: | ------------------------------------------: |
| No prefix |                21 |                  20 |                1 |  8,902 |                                           4 |
| Rewrite   |                27 |                  26 |                1 | 11,140 |                                          10 |
| Fallback  |                 8 |                   7 |                1 |  5,837 |                                           4 |

Prefetching ran in every variant. The client fetched a small route tree (`next-router-segment-prefetch: /_tree`) for each address it could not predict. Without a prefix it fetched trees for the first four detail links, then learned the route pattern `care/directory/[id]` and predicted the other six. Under the rewrite it fetched a tree for every detail link. The router source says why: when the address does not match the rendered route's shape, as when "a proxy injected a leading locale segment", it stores no pattern for it (`handleMismatchDueToRewrite` in `next/dist/client/components/segment-cache/optimistic-routes.js`). Under the fallback the address matches the route `[tenant]/care/directory/[id]`, so the pattern is learned again: 4 tree fetches. The fallback's total is lower only because its copies cover the Care pages alone, so most sidebar links had no route to prefetch; compare the last column.

Each tree response was 373 bytes under the rewrite, the same as without a prefix, and 543 bytes under the fallback, whose tree has one more segment.

Every prefetch passes through the proxy. In the prototype, counted at the stub, an unprefixed route-tree prefetch made 3 Supabase calls (session, profile, memberships) and a prefixed one made 4 (plus the staff-row read). A document request made 7 and 8. Against the fallback, which also reads the staff rows on every request, the rewrite cost 6 more proxy runs and about 24 more Supabase calls per view of this page. A longer list adds one more for each further distinct link in view. WP2a moves the proxy's role check onto the membership function, which changes the calls per request in both designs alike.

### 5.3 The static shell and instant navigation

The build prerendered one static shell per route: `care/directory.html` (7,482 bytes) and `care/directory/[id].html` (7,521 bytes). In both, the shell is the `(app)` layout's skeleton, because the layout's auth gate sits behind a request-time boundary. The spec's companion script fetched each address twice with a session and compared the second response with the shell file.

| Address                    | Status | First byte | Response starts with the whole prerendered shell | Prerender headers                                                |
| -------------------------- | -----: | ---------: | ------------------------------------------------ | ---------------------------------------------------------------- |
| `/care/directory`          |    200 |      29 ms | yes, 7,482 of 7,482 bytes                        | `x-nextjs-prerender: 1`, `x-nextjs-postponed: 1`, stale time 300 |
| `/<t>/care/directory`      |    200 |      29 ms | yes, 7,482 of 7,482 bytes                        | the same                                                         |
| `/care/directory/p-01`     |    200 |      17 ms | yes, 7,521 of 7,521 bytes                        | the same                                                         |
| `/<t>/care/directory/p-01` |    200 |      20 ms | yes, 7,521 of 7,521 bytes                        | the same                                                         |

So under the rewrite every tenant receives the route's one prerendered shell, and the tenant appears only in what streams after it. The fallback also prerendered one shell per route (`[tenant]/care/directory.html`, 7,515 bytes; its detail shell is byte-identical to the unprefixed one) and served it with the same headers. Route-tree prefetches took 15 to 37 milliseconds to the first byte, with or without the prefix (five of each).

**`instant()`.** The spec clicked the first person inside `instant()` from `@next/playwright`, on the production build with the testing API exposed. In all three variants the navigation committed under the lock: the list was gone and the detail route's own pending skeleton (`aria-busy`) showed, then the heading streamed in after the lock was released. The existing instant-navigation suite covers only the donor public site, so it does not apply to these routes; this spec adds the admin case.

### 5.4 What caches key on

**Server caches.** A `'use cache'` function keys on its arguments and the values it closes over, and it cannot read request headers. So the tenant reaches a cached read only as an argument, in either design. The Care directory's cached reads already work that way: `readMemberCareDashboardSnapshot(tenantId)` and its siblings in `packages/api/src/reads/member-care.ts` take the tenant as their first argument and tag by tenant. Eight `'use cache'` reads exist, all in `packages/api/src`, and no staff page or layout caches on its own.

The two designs differ in one place. Under the rewrite a page's `params` hold only the rendered route's parameters. A page or component cached on its `params` (for example `'use cache'` on the page itself) would therefore share one entry across tenants for the same person ID. Under the fallback, `params.tenant` would be part of that key. No staff page does this today, so it is a rule for WP2b to state and enforce, not a defect.

**The static shell** is prerendered without a request, so it holds nothing of a tenant, and no cache can serve one tenant's shell to another. Section 5.3 showed every tenant gets the same one.

**The client router cache** keys route trees by address, and segment data by the rendered route and its parameters. Under the rewrite `/A/care/directory` and `/B/care/directory` render the same route with the same parameters, so inside one document the client could reuse tenant A's segments for tenant B. The browser data layer has the same weakness today, because its query keys carry no tenant (NR-04). Both are harmless only while one document holds one scope. Section 5.6 shows that the guard keeps it so.

### 5.5 What the proxy decides before the page shell

Each answer below is the proxy's own response; no page code runs. Development and production gave the same answers.

| Case                                                              | Answer                                                                                      |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Demo admin opens a tenant they do not belong to                   | 307 to `/no-access`. The body is the 10-byte text `/no-access`, with no page markup         |
| Demo admin, one row, names `~finance`                             | 307 to `/<t>/care/directory?x=1`: suffix dropped, query kept                                |
| Two-row person names no sub-role, or `~hr`, which they lack       | 307 to `/choose-assignment?tenant=<t>&next=%2Fcare%2Fdirectory&roles=finance%2Cmember_care` |
| Two-row person picks member care in the chooser                   | A new document at `/<t>~member_care/care/directory`, acting under the member-care row       |
| The same, sending a forged `x-asym-assignment-id` header          | Ignored; the render saw the member-care row                                                 |
| Signed-out visitor opens `/<t>/care?tab=open`                     | 307 to `/login?next=%2F<t>%2Fcare%3Ftab%3Dopen`                                             |
| Forged `x-asym-tenant-id` and prefix headers on `/care/directory` | Deleted; the render saw no scope                                                            |

The proxy can decide membership, the sub-role and sign-in, which is all section 5.2 of the plan asks of it. It cannot decide anything that needs data the page loads.

### 5.6 An address that differs from the document's scope

The two-tenant person opened tenant A's directory, then the spec pushed three soft navigations through the client router. The guard compares the address's tenant segment and suffix with the scope the document was rendered for. On a mismatch it renders nothing and loads the address as a new document.

| Soft navigation from A's list to        | Document loads | Scope afterwards | Server's navigation payload, production        | The same, development                    |
| --------------------------------------- | -------------: | ---------------- | ---------------------------------------------- | ---------------------------------------- |
| B's list (`/<b>/care/directory`)        |              1 | B                | 307 bytes; nothing re-rendered, no scope in it | 36 KB; layout re-rendered with B's scope |
| B's detail (`/<b>/care/directory/p-01`) |              1 | B                | 11 KB; the page segment only, no scope in it   | 37 KB; layout re-rendered with B's scope |
| An unprefixed address (`/care`)         |              1 | none             | (not captured)                                 | (not captured)                           |

The production column is the important one. Same route, same parameters: the server sent almost nothing, so without the guard tenant A's whole page would have stayed on screen under tenant B's address. For B's detail page it would have shown B's page inside A's shell. Even in development, where the layout was re-rendered, state set up once in the browser would have stayed A's: the Mission Control bootstrap state and the query cache. The third row shows what a link that lost its prefix costs: a full document load at an unprefixed address, not a leak.

The fallback needs the same guard. Under it the `[tenant]` parameter changes, so the server re-renders from that segment down, but the browser's caches and client state would still belong to A.

### 5.7 A server redirect

The canonical contribution link renders inside the `(app)` layout's request-time boundary, so its `redirect()` arrives in the stream after the shell, not as a 307.

| Address                     | Response                    | Final address                    |
| --------------------------- | --------------------------- | -------------------------------- |
| `/contributions/gift-1`     | 200, redirect in the stream | `/contributions?gift=gift-1`     |
| `/<t>/contributions/gift-1` | 200, redirect in the stream | `/<t>/contributions?gift=gift-1` |

The second row uses `redirectInTenant`. A bare `redirect("/contributions?…")` would have sent it to an address with no tenant.

### 5.8 What broke or needed changing

1. **The rewrite must stay internal, and it is not internal when the server is bound to `127.0.0.1`.** `NextURL` rewrites any loopback host to `localhost`, in `request.nextUrl` and in `request.url` (`next/dist/server/web/next-url.js`). The router compares the rewrite target with the address it started from, which uses the bound hostname (`next/dist/server/lib/router-utils/resolve-routes.js`, lines 118 and 470). With `--hostname 127.0.0.1` the two differ, so Next treats the rewrite as external and fetches the inner path from itself over HTTP. The proxy then runs a second time on the inner path, sees no prefix, and deletes the scope headers the first pass set. The page rendered with no scope and unprefixed links, and nothing failed loudly. Bound to `localhost`, the same code rewrote internally (`x-middleware-rewrite: /care/directory`) and the render received all four headers. The repository's Playwright dev servers bind to `localhost`; the instant-navigation rig's donor server binds to `127.0.0.1`. A hosted deployment was not measured.
2. **Every address the page code builds needs the prefix.** That held for every link, push and redirect touched: 10 sites in the Care pages, 10 in the shell and 1 redirect. A missed site is not a leak: the guard turns it into a full document load at an unprefixed address.
3. **`usePathname` comparisons** moved to `useRoutePathname` (two in the shell). A missed one shows the wrong active state; it is not a leak.
4. **No existing test or selector broke.** The prototype still serves every unprefixed address. One hash-pinned review ledger did: `tooling/shadscan/findings.json` pins `apps/admin/app/mc-shell.tsx` as proof for its command-menu entry, so the pre-commit Shadscan gate failed with "Stale evidence" until the entry was re-reviewed (the search is still mounted, role-filtered and navigating with `router.push`; its unit test passes) and its hash updated. WP2b will meet the same pin wherever it edits a cited file.
5. **Nothing in Next.js needed working around** beyond item 1. Soft navigation, `useParams`, `router.push`, streamed redirects, the rewrite's request headers, the static shell and `instant()` all behaved as documented.

### 5.9 How many call sites WP2b changes

A static count over `develop` at `3e9ed22b4`. It counts string literals that start with a signed-in top-level path of the app, home-page targets, and calls to the routing APIs. Literal counts are upper bounds, because some hold a path for display or comparison.

**Under the rewrite** the route tree stays. Only code that builds or compares an address changes.

| Where                         | Files | Route literals | Home `/` targets | `router.push` or `replace` | Server `redirect()` | `usePathname` |
| ----------------------------- | ----: | -------------: | ---------------: | -------------------------: | ------------------: | ------------: |
| `apps/admin` signed-in source |    58 |            112 |                5 |                         12 |                   9 |            10 |
| `apps/missionary`             |    16 |             15 |                4 |                          3 |                   6 |             5 |
| Shared staff-facing packages  |    13 |             84 |                1 |                          0 |                   0 |             2 |

Most shared literals sit in two navigation configs: `packages/config/navigation.ts` (35) and `packages/config/tiles.ts` (34). Each becomes prefix-aware in one place, as `mc-shell.tsx` showed. The missionary navigation is one file (`apps/missionary/components/navigation-items.ts`, 13 literals), and so is the Support Hub's (`support-hub.routes.ts`, 7). About half of the `redirect()` calls target sign-in or `/no-access`, which stay outside the segment. Tests name a signed-in address in 81 test files for admin (7 end-to-end) and 33 for missionary (4 end-to-end), 370 literals in all. Most are unit tests of helpers that keep passing, because helpers can stay unprefixed and the prefix is added where the address is used. The end-to-end tests that exercise the tenant need prefixed addresses.

So under the rewrite WP2b changes **about 87 source files**, plus the end-to-end tests that cover the prefix.

**Under the fallback** (`app/(app)/[tenant]/…`) the address is the same, so every change above is still needed, and the files move as well.

| Extra work under the fallback                          | Count                                                                                     |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Files moved under `[tenant]` in `apps/admin/app/(app)` | 189, of which 53 pages                                                                    |
| Files moved in `apps/missionary/app`                   | 61, of which 10 pages. The app has no route group, so its root layout must first be split |
| Relative imports that climb out of the moved tree      | 19, in 16 admin files                                                                     |
| Test files that import a moved module by its path      | 148 (99 admin, 49 missionary)                                                             |

So the fallback changes **about 87 source files plus about 250 moved files and 148 test imports**: roughly four times the rewrite's diff. Its gains are the learned prefetch pattern (section 5.2) and `params.tenant` in params-keyed caches (section 5.4).

## 6. What WP2b needs under the verdict

1. **The proxy setting**, as prototyped: the address grammar with no version-digit check; the decision table of section 2; the scope headers deleted from every page request and set only on a rewrite; `/api` refused under the prefix; public pages outside it. The staff-row read moves onto the membership function WP2a builds, and the chooser lists the person's rows from it instead of the redirect's hint.
2. **An internal rewrite, tested.** Add an end-to-end check that a page behind the proxy renders with the tenant headers, so a rewrite that turns external fails loudly. Bind local and CI servers to `localhost`, or build the rewrite target from the incoming host when it is a loopback address. Check the hosted deployment once.
3. **The document scope and the guard** in a shared package for both staff apps: read once from the headers in the signed-in layout, a full document load on any mismatch of tenant or suffix, and the browser data layer and own-API wrapper reading the scope, never the live address (plan 5.2).
4. **One way to build an address.** `useTenantHref` in client code and `redirectInTenant` on the server; the two navigation configs, the missionary navigation and the Support Hub routes prefixed at their one point of use. Add a lint rule, like the own-API rule, that refuses a literal signed-in path in `<Link href>`, `router.push`, `router.replace` and `redirect` outside those helpers. Under the rewrite that is about 87 files.
5. **Active state from the route pathname**: 15 `usePathname` call sites in the two apps and 2 in shared packages.
6. **A cache rule**: the tenant reaches a `'use cache'` read only as an explicit argument, and nothing is cached on a page's `params` alone.
7. **Prefetch cost.** Accept one route-tree prefetch per distinct link, or, on long lists of dynamic links, prefetch row links on intent. Measure on the real page sizes before choosing.
8. **The missionary app** takes the same proxy setting. Under the rewrite its pages stay where they are.
9. **An authenticated production rig.** The E2E bypass is off in production, so admin and missionary have no production end-to-end coverage. The stub used here, or a seeded local stack, would give WP2b and the instant-navigation guards one.
10. **Drop the measurement-only parts** of the prototype: `serveBySegment`, the cookie that sets it, and the `[tenant]/care` copies.

## 7. What was not measured

- **A hosted deployment.** Whether the rewrite stays internal there, where no loopback host is involved, was reasoned from source, not measured.
- **A real Supabase session and the membership function.** Development used the E2E bypass with fixture rows; production used the stub. Neither is the WP2a function.
- **The missionary app.** Its call sites were counted; nothing in it was built.
- **The Care data under the address's tenant.** The own-API wrapper and the scoped browser data layer are WP2b work, so the Care data still came from the profile's tenant.
- **Web Studio**, its cookie and its API routes, which are outside TP5.
- **Wall-clock navigation timing.** Recorded, but single samples on a shared, loaded laptop; only server first-byte times are reported.
- **Prefetch on hover, and pages beyond the first 10 rows.**
- **The mobile layout.** Its row links were changed but not exercised at phone width.
- **The development run** used the spec before the fallback variant and the stub sign-in were added. Its ten cases are the same in substance; the four skipped cases are production-only.

## Appendix: how the census was taken

A Node script walked `apps/admin/{app,components,features,lib}` (without `(payload)` and `web-studio`), `apps/missionary/{app,components,lib,features}`, and `packages/{ui,lib,config,missionary}` (without the donor public site's components). It skipped `app/api`, test files and build output. "Route literal" means a quoted or template string that begins with `/` and one of the app's signed-in top-level segments: for admin, the 17 folders under `app/(app)`; for missionary, its 9 signed-in folders. "Files" counts files with at least one literal, home target, routing call, `redirect()` or `usePathname`. The fallback's moved files are every file under `apps/admin/app/(app)` and the missionary app's signed-in folders plus its root page and loading files. Test imports were found by `from`, `import(` and `vi.mock(` specifiers that name a moved path.
