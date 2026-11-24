# 0006. Web Studio stays outside the tenant segment and takes its organization from a signed cookie

**Status:** Recorded on 2026-11-22 from code comments in `packages/auth`
([#2751](https://github.com/Asymmetric-al/core/issues/2751)). It describes the
code as it is and ratifies no product intent. Accepted platform intent is in
[`docs/adr/`](../../../../docs/adr/README.md).

## Context

Mission Control pages carry the tenant in the first path segment, and the proxy
turns that segment into request headers. Web Studio is Payload's admin, mounted
at `/web-studio`, and Payload's own screens and REST calls cannot carry a tenant
in their address. Web Studio therefore keeps the organization a person chose in
a signed cookie, and the proxy decides access from that cookie and the person's
live staff memberships instead of from the address. A staff member can belong to
several organizations, a cookie can be absent, stale or forged, and a link from a
tenant's page can name a different organization from the one the cookie
remembers. Payload's REST clients also need JSON errors, not redirects to a page.

In this record, an assignment is the one row of `authz.memberships` that a
request acts under, and a document is one full page load: the browser data layer
is scoped to a document, so changing organization means loading a new one.

## Decisions

### Which addresses are Web Studio's

1. **Only paths below `/web-studio/api/` are Payload REST routes.**
   `isWebStudioApiPath` in `packages/auth/web-studio.ts` matches the prefix with
   its trailing slash. The bare `/web-studio/api` is not a REST route: no API
   route serves it, so it falls to the page route and the proxy gates it as a
   Web Studio page.

2. **One function defines a Web Studio page, and every boundary uses it.**
   `isWebStudioPagePath` in `packages/auth/web-studio.ts` accepts a path under
   `/web-studio` that is neither an API route under `/web-studio/api/` (REST or
   GraphQL) nor under the organization chooser (`/web-studio/organization`). The
   admin app's tenant boundary (`packages/auth/tenant-navigation.tsx`), Web
   Studio's document scope (`WEB_STUDIO_SEGMENT`, read by
   `packages/database/document-scope.tsx`) and Payload's router adapter
   (`apps/admin/src/cms/payload-next-router-adapter.tsx`) all use it. Because
   they share one definition, the tenant boundary loads a new document whenever
   it detects a segment crossing from the loaded document's navigation entry,
   and Payload's adapter loads a new document for any destination outside Web
   Studio. The chooser never renders inside a Web Studio document, and no Web
   Studio page renders inside another document. Cited: council on the joined
   release, JC1.

3. **Web Studio's document scope is a constant that client code passes.**
   `WEB_STUDIO_SEGMENT` in `packages/auth/web-studio.ts` is the segment in which
   a Web Studio document's scope is valid for `DocumentScopeProvider`. It is
   named by `WEB_STUDIO_PATH` and bounded by `isWebStudioPagePath`. Client code
   passes the constant itself, because its `contains` function cannot cross from
   a server component to a client component.

4. **An unprefixed stray address under the chooser goes to the chooser before
   session and page gates.** `isStrayWebStudioChooserPath` in
   `packages/auth/web-studio.ts` matches an address under the chooser that is
   not the chooser's own address: one below it (`/web-studio/organization/x`),
   or the chooser spelled another way (`/web-studio/%6Frganization`). After
   mutation admission and the tenant rewrite-loop guard, `authMiddleware` in
   `packages/auth/middleware.ts` redirects an unprefixed stray address to
   `/web-studio/organization`, keeping its query, before it reads the session or
   runs the Web Studio page gate. No page lives there, and the gate would
   otherwise take it for a Web Studio page whose document, outside its own
   segment, reloads without end. The chooser checks read the path through
   `decodedPathname`, which percent-decodes each segment the way the app's
   routes match it, because the proxy receives the path undecoded (`NextURL`
   keeps `%6F`). A segment that does not decode stays as written. Cited: check
   of the fix lists, JR5.

### The organization cookie

5. **The cookie only narrows. Live staff rows decide for real sessions.**
   `WebStudioSelection` in `packages/auth/web-studio.ts` holds a tenant ID and
   the ID of the chosen membership row, and nothing else. `webStudioResolveInput`
   hands them to the principal resolver as the proposed assignment and the
   expected tenant, and `decideWebStudioAccess` judges them with
   `selectAssignment` in `packages/auth/principal/assignment.ts`, the same rule
   every other handler uses. That rule accepts the named row only if the person
   holds it, live, as a staff row, in the named tenant. For an enabled and
   accepted E2E bypass session (record 0007), signed synthetic assignments stand
   in for live rows and pass through the same selector. A cookie that names
   anything else selects nothing. Authority is the live membership row
   ([ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
   clause 1), so a cookie never grants access by itself, even a validly signed
   one. Cited: plan
   [5.2](../../../../docs/audits/core-crm-cms-database-target-architecture.md#52-choosing-the-tenant),
   "One stated exception: Web Studio"; AL-2675; WP2b first release, slice C.

6. **The cookie module is pure apart from Web Crypto, and the signing key
   belongs to the caller.** `packages/auth/web-studio.ts` uses Web Crypto and no
   other runtime service, so the proxy, server code and tests share one
   implementation. Its signing and reading functions take the secret as an
   argument. The admin wrapper in
   `apps/admin/src/cms/web-studio-tenant-cookie.ts` passes Payload's resolved
   secret to `packages/auth/web-studio.ts`, where `cookieKey` derives the
   signing key. The admin app gives the proxy a reader built on that wrapper
   through the `webStudio.readCookie` option of `AuthMiddlewareOptions` in
   `packages/auth/middleware.ts`.

7. **The signing key is derived for this cookie only.** `cookieKey` in
   `packages/auth/web-studio.ts` derives an HMAC-SHA-256 key from the caller's
   secret with HKDF (SHA-256, empty salt) and the label `KEY_INFO`
   (`asym:web-studio-tenant-cookie:v1`). The label separates this key from every
   other use of the secret it is derived from. In the admin app both the cookie
   wrapper and Payload call `resolvePayloadSecret()` in
   `apps/admin/src/cms/payload-secret.ts`, which reads `PAYLOAD_SECRET` and
   falls back to a fixed local value in development and test. `cookieKey` throws
   when the secret is empty.

8. **A cookie that is present but unusable selects nothing, and is never read as
   absent.** `readWebStudioCookie` in `packages/auth/web-studio.ts` returns one
   of three states (`WebStudioCookieState`): absent (no value, or an empty one),
   selected (a verified selection), or unusable. A malformed value, an altered
   payload, or a signature whose decoded bytes fail verification (such as one
   that is forged or signed with another key) is unusable, and reading it never
   throws. An empty signing key is a configuration error and throws when
   `readWebStudioCookie` reaches `cookieKey` (decision 7), after absent or
   structurally invalid input has already returned; the admin wrapper also
   throws up front when `resolvePayloadSecret()` fails. The value is
   `v1.<tenant id>.<membership id>.<base64url HMAC>`, and
   `signWebStudioSelection` refuses to sign IDs that are not canonical
   lower-case UUIDs. `webStudioResolveInput` turns an unusable cookie into
   `{ ok: false }`, and `decideWebStudioAccess` then sends a person with staff
   rows to the chooser (a person with no staff row is refused first). An absent
   cookie lets a person with one staff row through by default, so reading a bad
   cookie as absent would let a bad value through on that default.

9. **The cookie is `SameSite=Strict`.** `webStudioCookie` in
   `packages/auth/web-studio.ts` sets the cookie HttpOnly and `SameSite=Strict`,
   scoped to `/web-studio`, with `Secure` as the caller chooses. Payload's admin
   makes every request from the same origin, so nothing it does needs the cookie
   on a cross-site request. The cost is accepted: a deep link into Web Studio
   from another site arrives without the cookie, and a person with several
   organizations then picks one again.

### Who may open a Web Studio page

10. **Web Studio pages use the cookie and the live staff rows in place of the
    role check.** For a Web Studio page, `authMiddleware` in
    `packages/auth/middleware.ts` reads the person's assignments, judges the
    cookie with `decideWebStudioAccess`, and returns before the app's ordinary
    role check. That role check would refuse a person who holds staff rows in two
    organizations. The chooser needs only a signed-in person, because a person
    with several organizations has to reach it to make the choice. Cited: plan
    [5.2](../../../../docs/audits/core-crm-cms-database-target-architecture.md#52-choosing-the-tenant).

11. **Without a usable choice, Web Studio refuses or asks. It never falls back to
    another row.** `decideWebStudioAccess` in `packages/auth/web-studio.ts`
    works over rows the proxy has already read and validated, before the page
    shell renders:
    - A person with no staff row is refused (`refuse` in `WebStudioDecision`):
      Web Studio is not for them. The proxy sends them to the app's unauthorized
      address. A failed membership read is refused the same way.
    - With no cookie, a person with one staff row acts under it, and a person
      with several chooses.
    - With a cookie, the resolver's rule judges the row and tenant it names. A
      row the person does not hold live, as a staff row, in that tenant selects
      nothing, and the person chooses again. It never falls back to another row,
      even the only one left, so a stale or unusable cookie never silently
      switches Web Studio to a different organization.

12. **With the switch on, the cookie narrows to the verified name.**
    `decideWebStudioAccess` and `webStudioResolveInput` take the name's
    organization as an argument and stay pure, because the file is bundled for
    the browser. Staff rows are counted in that organization only: none there
    is `refuse`, never the chooser. A cookie naming another organization, from a
    person with a staff row in the name's, is `{ kind: "choose", refused: true }`,
    and both gates add `refused=1` to the chooser's address only then. No cookie
    narrows to the name's organization. The strategy reads the name from the
    `headers` Payload passes, `canSwitch` and both choosers count the name's rows
    only, and the entry redirect drops a `from` naming another organization. The
    cookie's name, form, path and signature do not change. See
    [0015](0015-organization-from-the-verified-name.md).

### Links from Mission Control, and the chooser

12. **A link into Web Studio from a tenant's page names that page's tenant and
    membership.** The cookie lasts thirty days (`COOKIE_MAX_AGE_SECONDS` in
    `packages/auth/web-studio.ts`). Sign-out expires it sooner with
    `clearedWebStudioCookie`, which `apps/admin/lib/sign-out.ts` and
    `apps/admin/src/cms/auth/web-studio-logout.ts` send. Within that time a link
    from Mission Control can point into Web Studio while the cookie remembers a
    different organization. `webStudioEntryQuery` adds the query parameters
    `organization` and `assignment` (`WEB_STUDIO_ENTRY_TENANT_PARAM` and
    `WEB_STUDIO_ENTRY_ASSIGNMENT_PARAM`) only for a document whose address names
    its tenant. Web Studio's own pages and the donor portal name none, and add
    nothing. `withWebStudioEntry` adds them to root-relative links (starting
    with a single `/`) that lead to a Web Studio page. Cited: council on the
    joined release, JC3.

13. **The proxy compares a link's names with the cookie's choice, and a link
    never sets the cookie.** `webStudioEntryRedirect` in
    `packages/auth/web-studio-proxy.ts` runs before Web Studio renders:
    - If the names match the assignment that `decideWebStudioAccess` allows, it
      redirects to the same address without them, so a later reload never asks
      again.
    - If they differ, or nothing is chosen, it sends the person to the chooser,
      which offers the linked organization first and returns to the address
      without the names. A value that is not a canonical tenant ID is never
      offered.
    - For a person with no staff row it returns `null`, and the proxy's refusal
      stands. It also returns `null` when neither `organization` nor
      `assignment` is in the query; an `assignment` parameter alone still sends
      an eligible caller to the chooser with no `from` suggestion.

    Only the chooser's form sets the cookie, after its own check against the
    person's live rows (`decideWebStudioAccess` in
    `apps/admin/app/(auth)/web-studio/organization/actions.ts`). Web Studio
    therefore asks before it works in another organization. Cited: JC3.

14. **The chooser's address carries where to return, whether the last choice was
    refused, and which organization to offer first.** `webStudioChooserAddress`
    in `packages/auth/web-studio.ts` builds `/web-studio/organization` with
    `next` (made safe by `safeWebStudioNext`), with `refused=1`
    (`WEB_STUDIO_REFUSED_PARAM`) when the last choice was refused so that the
    chooser says so, and with `from` (`WEB_STUDIO_FROM_PARAM`) when a link from
    Mission Control named an organization. `webStudioChooserUrl` in
    `packages/auth/web-studio-proxy.ts` builds a `URL` to the same chooser path
    in the proxy, copying its supplied `next` as given (without
    `safeWebStudioNext` or `refused`) and optional `from`. A matching `from`
    only puts that organization first and, unless a refusal is shown, names it
    in a notice explaining where the person came from; it selects nothing.
    Sign-in returns to the chooser's address too, so a person who signs in again
    still lands on the page they were on. Cited: JC3.

15. **A choice returns only to a Web Studio page.** `safeWebStudioNext` in
    `packages/auth/web-studio.ts` first applies `safeNextParam` from
    `packages/auth/demo-login.ts`, the check every return address passes, which
    refuses another origin and any doubled slash or backslash in the parsed
    pathname or its percent-decoded form (after `URL` parsing). The address must
    then be a Web Studio page by `isWebStudioPagePath`: not a page outside Web
    Studio, not an API route under `/web-studio/api/`, and not the chooser
    itself. Anything else returns to `/web-studio`. The path and query are kept
    and the fragment is dropped. The choice only sets the cookie that Web Studio
    reads, so it has no other place to return to.

### Payload's REST routes

16. **On Payload's API routes the proxy skips the page role gate and refreshes
    the session.** After mutation admission and the rewrite-loop guard, for an
    unprefixed path under `/web-studio/api/` (REST or GraphQL), `authMiddleware`
    in `packages/auth/middleware.ts` calls `refreshWebStudioApiSession` in
    `packages/auth/web-studio-proxy.ts`. That helper normalizes the forwarding
    headers, refreshes the Supabase session cookies when Supabase public config
    is present, and passes the request on. It does no role lookup and never
    redirects. Payload's strategy resolves the caller from the session and the
    Web Studio cookie, and answers an expired or unauthorized call with JSON, so
    a REST client never receives a redirect to a page. Before this, nothing
    wrote a refreshed session back on Payload's API calls. An API path under a
    tenant prefix gets a 404: Payload's API routes are never inside the tenant
    segment. Cited: plan
    [5.2](../../../../docs/audits/core-crm-cms-database-target-architecture.md#52-choosing-the-tenant);
    audit finding C09 in
    [`core-crm-cms-database-audit.md`](../../../../docs/audits/core-crm-cms-database-audit.md).

17. **On a REST call the scope headers are claims, never a selection, and the
    refresh is not needed for correctness.** `refreshWebStudioApiSession` in
    `packages/auth/web-studio-proxy.ts` sets the role class header to the
    surface's role class, or removes it when there is none, as the proxy does on
    every request, so the client's value never stands. It removes the
    address-prefix and rewrite headers. It keeps the document's tenant and
    assignment headers, which Payload's strategy compares with the cookie's
    selection and never selects by. Payload's strategy reads the session and the
    cookie itself, so its session and assignment checks do not depend on proxy
    refresh and an ended session still gets JSON. Skipping the proxy would omit
    its session-refresh cookies and cache headers as well as its mutation
    admission and forwarding-header normalization. Cited: plan 5.2; C09.

18. **Cache headers from earlier session writes survive each rebuilt
    response.** The cookie adapter in `refreshWebStudioApiSession` in
    `packages/auth/web-studio-proxy.ts` rebuilds the response on each session
    write. It carries the earlier cookies over, stores each cache header name in
    `refreshHeaders` (a later write replaces an earlier value for the same
    name), and applies those headers to each new response, as the main proxy in
    `authMiddleware` does. Without that, a later write would drop cache headers
    an earlier write set. Cited: council on the joined release, JC9.

## Accepted records this code implements

- `WEB_STUDIO_PATH` and `webStudioCookie` in `packages/auth/web-studio.ts` (the
  cookie scoped to `/web-studio`, Payload's `routes.admin` in
  `apps/admin/payload.config.ts`):
  [ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
  clause 6.
- `WEB_STUDIO_API_PATH` in `packages/auth/web-studio.ts` (Payload's REST routes
  mounted under `/web-studio/api`, `routes.api` in
  `apps/admin/payload.config.ts`):
  [ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
  clause 6.
- `WebStudioSelection` in `packages/auth/web-studio.ts` (the tenant and the
  chosen membership travel in a signed, HttpOnly cookie):
  [ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
  clause 6.
- `WebStudioSelection.assignmentId` in `packages/auth/web-studio.ts` (the
  assignment is the membership row's ID, `authz.memberships.id`):
  [ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
  clause 2.
- `WEB_STUDIO_ROLE_CLASS` and `webStudioResolveInput` in
  `packages/auth/web-studio.ts`, and the staff-only check on the `webStudio`
  option in `createAuthMiddleware` in `packages/auth/middleware.ts` (Web Studio
  acts on staff rows):
  [ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
  clause 2.
