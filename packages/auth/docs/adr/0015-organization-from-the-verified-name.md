# 0015. The dashboards take their organization from the verified name

**Status:** Recorded on 2026-11-25 with N2 part 1 of the Core CRM, CMS and
database foundation program (AL-2671); decisions 12 to 20 added on 2026-11-26
with N2 part 2a. It describes the code as it is and ratifies no product
intent. Accepted platform intent is in
[`docs/adr/`](../../../../docs/adr/README.md) and in the OpenSpec change
`adopt-tenant-owned-domains`.

## Context

With `CORE_SERVE_UNDER_PATHS=1`, the donor app is the front for every name and
forwards `/admin/*` and `/missionary/*` to the dashboards with a signed stamp
that names the host the visitor used (`front.ts`). The database answers which
organization a verified name belongs to through the anonymous
`public.resolve_verified_host(text)`
(`supabase/migrations/20261125010000_wp3a1b_claimed_names.sql`): one row for a
`ready` or `active` name, nothing otherwise. The name is a fact of the request
the client cannot forge; an organization ID in the address, a tenant header, a
caller's option or a cookie is a claim. Before this record, every decision
counted the person's rows in every organization they hold one in.

## Decisions

### The lookup

1. **One lookup per stamped request, never cached.** `lookUpVerifiedName(host,
surface)` in `verified-name.ts` calls `resolve_verified_host` with the
   stamped origin's host (port kept), never a client's `x-forwarded-host` or the
   request URL. Each call makes its own client from `getSupabasePublicConfig()`
   with no session persistence and no person's token; it never uses the
   session client or the service key. Admission reads are not cached across
   requests (plan, "admission reads never cached"), so a name moved to another
   organization is decided anew on the next request.

2. **Unavailable is a 503, never a forward.** A missing URL or key, a thrown or
   failed call, no answer within three seconds (the call is aborted), an error
   answer, a non-array, more than one row or a malformed field is
   `unavailable`. The proxy answers `503` with `no-store` on every path, public
   ones included.

3. **One constant per surface compares state.** `SURFACE_ADMISSION` holds, per
   surface, the admitted states and that the name must be home:
   `staff` admits `ready` or `active`; `missionary` admits `active` only. No
   other code compares a name's state. A well-formed row is refused with the
   first reason that applies: `not_ready`, `not_home`, `not_for_surface`; no row
   is `unknown`. Every refusal is the front's `404` with `no-store`, with no
   session read and no cookie. WP3b part 1 added the `donor_account` and
   `website` rows (`active` only; see
   [0016](0016-donor-organization-from-the-verified-name.md)). Ruled in
   `ruling-n2.md` Q1 (a): staff may prepare an organization on a `ready` home
   ("Ready names admit staff; visitors see nothing until activation"); the
   missionary workspace waits for activation. A missionary invited before
   activation cannot land until the name is `active`; N4 owes that invitation.

4. **On-mode only.** The name is trustworthy only on a stamped request: with
   the switch on, each dashboard refuses unstamped or mis-stamped page traffic
   with `403` before any lookup (`admitFromFront` in `front.ts`; N3's ruling
   Q14), apart from its own exempt paths, which make no lookup and carry no
   name; and only the front stamps, with the host the visitor used. With the
   switch off, each proxy hands the request to the auth middleware on today's
   direct path, with no stamp, so no name proves anything there: the proxies
   make no lookup and build no lookup client, and the dashboards admit direct
   requests as before. Production cannot be on until N3 part 4.

### The name's organization on the request

5. **`x-asym-name-tenant` is set only by the proxy.** It is in
   `PAGE_SCOPE_HEADERS`, so every place that loops that list removes a client's
   copy; `refreshWebStudioApiSession`, `admitExemptRequest` and
   `routeToDashboard` each delete it by name, because they must keep a client's
   `x-asym-tenant` and `x-asym-assignment` (Web Studio's document check) or loop
   nothing. `createAuthMiddleware`'s function takes the organization as its
   second argument, never from a header, and sets the header only when given.

6. **Readers know four states.** `readNameTenantState(headers)` is `off` while
   the switch is off (decided before the header is read), then `valid`,
   `absent` or `invalid`. `isNameTenantRefused` is `invalid` or `absent` in
   every app while the switch is on (WP3b part 1 ended the empty-base-path
   exception for the donor app; see
   [0016](0016-donor-organization-from-the-verified-name.md)). A refused state
   fails closed in every
   reader: `getAuthContext` refuses after sign-in without the scope refusal (no
   bypass identity), `readDocumentScope` throws, `readPortalDocumentScope`
   returns `null`, Web Studio's gate refuses, the
   strategy answers `no_selection`, the choice action signs nothing and both
   choosers list nothing. `readServerNameTenantState()` returns `off` without
   calling `headers()`.

7. **Every claim narrows to the name.** In `getAuthContext` the client's
   `x-asym-tenant` and the caller's `expectedTenantId` are read apart; a valid
   name is the resolver's expected tenant, and either claim present and
   different is `tenant_mismatch` with the scope refusal, returned after the
   user is verified and the role class checked, before any row is read. The
   name alone proposes nothing: a request that claimed nothing and is denied
   within the name's organization gets the plain refusal. The E2E bypass
   refuses the same conflicts and, with no role class, narrows to the name
   before its single-row pick.

8. **A segment of another organization is a 404.** Right after the address is
   parsed, and before the API branch, the public-page redirect and the session
   read, the middleware answers `404 no-store` to a segment that is not the
   name's organization, signed in or out. Landing, the address decision, the
   role check (`resolveUserRoleFromDatabase` passes the name as
   `expectedTenantId`) and `~<sub-role>` count the name's rows only.

9. **The assistant's routes never read it.** On Vercel `/eve/v1/**` does not run
   the staff proxy, so a header there is the client's.
   `AuthContextOptions.nameTenant: "ignore"`, set in the assistant's identity
   options, treats the name check as off there.

### Status

10. **Membership carries the organization's status.** The membership reads
    return no row of an organization that is not active, or of a revoked row
    (`20261120130001_tenant_status_membership.sql`), so a name whose
    organization is suspended admits a signed-out sign-in page and sends a
    signed-in person to `/no-access`. A Site's status is the website's (WP7):
    a home name need not have a Site.

### The name's generation (N2 part 2a)

12. **Two headers.** The lookup's `generation` (decision 1) reaches the
    request as `x-asym-name-generation`, set only by the dashboards'
    middleware beside the name, from the second argument
    `{ nameTenantId, nameGeneration }` the proxies pass, as
    `String(generation)`. The document's claim is `x-asym-scope-generation`
    (`@asym/database/request-scope-headers`, re-exported by
    `@asym/auth/request-headers`). Both are in `PAGE_SCOPE_HEADERS`, so a
    client's copies are removed wherever the list is looped; the claim is in
    `API_SCOPE_CLAIM_HEADERS` with the tenant and the assignment, so it is kept
    on `/api/*` and removed on pages and the tenant rewrite.
    `refreshWebStudioApiSession` deletes the trusted header by name and sets
    it with the name; it keeps the claim. The donor app passes no generation
    (decision 19).

13. **The reading rule.** `readNameGeneration(headers)` is `off` while the
    switch is off (decided before the header is read), `absent` without the
    header, `valid` when the raw value, nothing trimmed, is an ASCII `1`-`9`
    followed only by ASCII `0`-`9` and its `Number` is a safe integer, and
    `invalid` otherwise (a leading zero, a sign, white space, an exponent, a
    duplicated header joined by a comma, a non-ASCII digit, a value past
    `2^53 - 1`). `readServerNameGeneration()` returns `off` without calling
    `headers()`, and `absent` when the headers cannot be read.
    `isNameGenerationRefused(name, generation)` is true only beside a `valid`
    name: an `invalid` generation, or an `absent` one under a dashboard's base
    path. Nothing reads a generation without a valid name, so a client's copy
    on a path that removes only the name (`routeToDashboard` and
    `admitExemptRequest` in `front.ts`, `:277` and `:422` at `fb43b3361`) is
    inert; the next package that edits `front.ts` deletes
    `NAME_GENERATION_HEADER` beside the name there.

14. **The claim is compared on every own-API call.** In `getAuthContext`,
    with a valid name and `nameTenant` not `"ignore"`, a refused generation is
    the plain refusal (decision 6). With a valid generation, a claim present
    and not byte for byte `String(generation)`, or no claim at all on a call
    made with its request (whatever else it carries), is `generation_mismatch`
    with the scope refusal, after the tenant conflict (both together answer
    `tenant_mismatch`) and before any row is read; the E2E bypass refuses the
    same. `getAuthContext()` without a request (a page render, whose claim the
    proxy removes) never requires it. `generation_mismatch` is an
    `AuthContext` denial, not an `AssignmentDenyReason`: `requireAuth` throws
    `ScopeRefusedError`, the answer is `401` with
    `x-asym-scope-refused: generation_mismatch`, and the browser retires the
    document. Only `GET /api/media/[assetId]`, which an `<img>` loads with no
    claim, passes `allowAbsentScopeGeneration: true`, and only on, so its off
    call keeps its exact options; it stays bound by
    `resolve_staff_media_access` and its expected tenant against the name, and
    a present wrong claim is refused there too.

15. **The document scope carries it.** `DocumentScope.generation` is set by
    `readDocumentScope` and Web Studio's gate from a valid generation (no key
    when off), and each refuses a name whose generation is refused;
    `readPortalDocumentScope` is unchanged (decision 19). `sameScope` compares
    it, so another generation's scope in the same document shows the reload
    notice and reloads once. `ownApiFetch` removes a caller's claim and sends
    the scope's generation when it has one; the Data API's and the
    assistant's headers carry none (N6, N3 part 3). The added `headers()`
    reads sit inside the layouts' existing `<Suspense>` boundaries; nothing is
    cached.

16. **What the generation is not.** It changes only when a name's row is
    inserted or re-claimed, or explicitly re-generated. It does not cover, and
    must not replace, three refusals that already hold: a revoked membership
    or role, or an organization made inactive (the live assignment read on
    every call gives `not_owned_or_inactive`, a scope refusal); a sub-role
    switch in another tab (each document sends its own row and the server
    keeps no current sub-role); a demoted home, a removed surface or a name no
    longer ready (the proxy's lookup on every request answers `404 no-store`
    before any session read).

17. **Configuration redirects behind admission.** On, both dashboards'
    `redirects()` return `[]` and set `skipTrailingSlashRedirect: true`, since
    Next.js otherwise answers both before the proxy, on a refused name too.
    Each proxy, after the lookup admits the name and before the middleware,
    answers the same table (`apps/admin/lib/legacy-redirects.ts`,
    `apps/missionary/lib/legacy-redirects.ts`) with `answerAdmittedRedirect`
    (`packages/auth/legacy-redirects.ts`): `307` or `308` as `permanent` says,
    the query kept, then `308` to a non-root path without its trailing slash.
    The `Location` is built with `ownOriginUrl` and rebased to the public
    origin; a destination with a backslash or starting with `//` is a
    `404 no-store`. No session is read and no cookie set. The missionary
    table's form with the organization in the address is answered only for
    the name's own ID, byte for byte; otherwise the middleware decides. The
    matcher follows Next.js's (case-insensitive, strict about the trailing
    slash) on both tables; it also matches a remainder with an empty segment,
    which Next.js leaves alone, so that `/mc//x` is refused rather than handed
    on. Off, both configurations are as before and the proxies answer no
    redirect. The staff media redirect keeps links that still hold Payload's
    old `/api/media/file/` address working for this release
    (`docs/guides/architecture/cms-runtime.md`); the missionary table keeps
    saved links to the retired update pages answering a real `308` (council
    round 1, A11). Through the front, the donor app's own trailing-slash `308`
    still answers first (`docs/guides/architecture/overview.md`).

18. **The callback and the invitation.** On, the sign-in callback counts only
    the rows of the name's organization when it picks the home class, and
    falls back to `next` on a refused name state without reading a row.
    Accepting an invitation refuses a refused name state with
    `403 INVITATION_INVALID` before the database, and answers
    `redirectPath: "/"` for the name's organization and `"/no-access"` for
    another; off it answers `/<organization>` as before. Refusing another
    organization's invitation before its write is N4's.

19. **The donor app.** Its proxy sets no generation and its base path is
    empty, so an absent generation is not refused there. The next WP3b part
    that edits `apps/donor/proxy.ts` threads the generation, adds it to
    `readPortalDocumentScope` and removes the empty-base-path exception from
    `isNameGenerationRefused` (ruling R3).

20. **The operator area.** `/operator` on an operations address is answered
    before the switch test and never on an organization's name, so no name
    and no generation reach a call made there: `readAssignmentNarrowing`
    reads a generation only beside a valid name.

### Not here

11. **Owned elsewhere.** The prototype `/api/cms/public/*` reads and their
    front exemption were retired in WP6 part 2a (AL-2679). N2 part 2a moved
    the dashboards' configuration redirects behind admission and added the
    name's generation, the callback and the invitation (decisions 12 to 19).
    N2 part 2b takes the organization ID and the chooser out of the address,
    with `~<sub-role>`, copied links, Web Studio's entry and the lint rule;
    part 2c proves two tabs under two roles and a stale tab in a browser;
    part 2d makes Web Studio's REST calls and server functions send and
    compare the claim. N2 parts 3
    to 5 own page identity, cache keys and the donor's cache rules (with WP7),
    addresses built outside a request, and deleting the off-mode path. WP3b
    part 1 built the donor app's verified-name admission, active-only donor
    surfaces, `/` refusal on homes with no website, and ending the
    single-organization fallback while the switch is on (see
    [0016](0016-donor-organization-from-the-verified-name.md)); WP3b parts 2 to
    5 own the home lookup and redirect to home, Sites and brand settings, demo
    constants, and deleting the off-mode fallback. N3 part 4 owns the front's
    own
    lookup, replacing `FRONT_NAMES`; WP7 the donor redirects behind admission;
    N6 framing and the browser's direct Data API calls; N3 part 3 the
    assistant's routes under the switch; N4 invitations, including a
    missionary invited before activation; N5 the first designation of home.
