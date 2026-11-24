# 0015. The dashboards take their organization from the verified name

**Status:** Recorded on 2026-11-25 with N2 part 1 of the Core CRM, CMS and
database foundation program (AL-2671). It describes the code as it is and
ratifies no product intent. Accepted platform intent is in
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
   session read and no cookie. WP3b adds the donor surfaces' rows. Ruled in
   `ruling-n2.md` Q1 (a): staff may prepare an organization on a `ready` home
   ("Ready names admit staff; visitors see nothing until activation"); the
   missionary workspace waits for activation. A missionary invited before
   activation cannot land until the name is `active`; N4 owes that invitation.

4. **On-mode only.** With the switch off no dashboard admits unstamped page
   traffic on any name (N3's ruling Q14), so there is no trustworthy name to look
   up. The proxies make no lookup and no lookup client then; production cannot
   be on until N3 part 4.

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
   `absent` or `invalid`. `isNameTenantRefused` is `invalid`, or `absent` inside
   a dashboard (`appBasePath() !== ""`). A refused state fails closed in every
   reader: `getAuthContext` refuses after sign-in without the scope refusal (no
   bypass identity), `readDocumentScope` throws, Web Studio's gate refuses, the
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

### Not here

11. **Owned elsewhere.** The five `/api/cms/public/*` reads never make the
    lookup and keep resolving their tenant from the host until WP6 part 2
    removes them. The dashboards' configuration redirects
    (`apps/admin/next.config.ts`, `apps/missionary/next.config.ts`) run before
    the proxy, so on a refused name they still redirect before the follow-up
    gets the `404`; N2 part 2 moves them behind admission. The donor app's
    organization from the name is WP3b's; the front's own lookup, replacing
    `FRONT_NAMES`, is N3 part 4's.
