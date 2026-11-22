# 0007. The E2E auth bypass is bound to allowlisted datasources, signed identities and the resolver's rules

**Status:** Recorded on 2026-11-22 from code comments in `packages/auth`
([#2751](https://github.com/Asymmetric-al/core/issues/2751)). It describes the
code as it is and ratifies no product intent. Accepted platform intent is in
[`docs/adr/`](../../../../docs/adr/README.md).

## Context

End-to-end suites (Playwright) and the demo-account flow
(`POST /api/auth/demo-account`) sign a person in without a Supabase user. A
signed cookie, the bypass cookie, carries a test identity, and the proxy and the
request's auth context accept it in place of a session. The bypass is on only
when `isE2EAuthBypassEnabled` in `packages/auth/e2e-auth.ts` says so: never when
`NODE_ENV` is `production`, and otherwise only when `E2E_AUTH_BYPASS` is `1` or
`true`. That flag is not enough on its own. Staging, preview and masked
production deployments also run with a non-production `NODE_ENV`, all local apps
share the host `localhost`, a developer's browser can hold an old bypass cookie
next to a real session, and a test identity must face the same assignment rules
as a real person.

## Decisions

### When the bypass may run

1. **The bypass is bound to the datasource's identity, not to `NODE_ENV`.**
   `isSupabaseDatasourceAllowedForE2EBypass` in `packages/auth/e2e-auth.ts`
   allows the configured Supabase URL only when:
   - no datasource is configured, so there is nothing to protect;
   - the host is local: `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`,
     `host.docker.internal`, or a name ending in `.local` or `.localhost`
     (local Supabase or Docker);
   - the host is exactly `example.supabase.co` (`E2E_PLACEHOLDER_SUPABASE_HOST`),
     the placeholder used across the repository, which does not resolve; or
   - the host, or the hosted project ref, is listed in
     `E2E_AUTH_ALLOWED_SUPABASE_REFS`.

   Every other datasource is rejected, production projects and their read
   replicas among them, and so is a URL that does not parse. `NODE_ENV` is not
   `production` on staging, preview and masked production deployments, so it
   cannot tell whether real data sits behind the datasource. The test
   `allows loopback, the example placeholder, and unconfigured datasources` in
   `packages/auth/e2e-auth.edge.test.ts` pins the cases allowed without an
   allowlist entry.

2. **A project ref is read only from a host shaped like a hosted Supabase
   project.** `extractSupabaseProjectRef` in `packages/auth/e2e-auth.ts` takes
   the ref only from a whole hostname of the form `<ref>.supabase.<tld>`, where
   the last label is letters only, as in `.supabase.co` and `.supabase.in`. A
   lookalike such as `myref.supabase.evil.com` yields no ref. Otherwise whoever
   owns `evil.com` could satisfy an allowlist that lists `myref`. A custom API
   domain has no ref to derive, so it is allowlisted by its full hostname. The
   test `does not extract a ref from a Supabase lookalike host` in
   `packages/auth/e2e-auth.edge.test.ts` pins this.

3. **Every grant of a bypass identity first asserts the datasource, and a refusal
   fails loudly.** `assertSupabaseDatasourceAllowedForE2EBypass` in
   `packages/auth/e2e-auth.ts` throws unless the datasource is allowed. Before it
   throws it logs the datasource's host, so the misconfiguration can be
   diagnosed even if a caller swallows the error. The host is a public
   `NEXT_PUBLIC_*` value; the secret is never logged. `authMiddleware` in
   `packages/auth/middleware.ts` calls it whenever the bypass is enabled, the
   request has no Supabase user and the path is protected, before it reads any
   bypass cookie. `readE2EBypassSession` in `packages/auth/context.ts` calls it
   whenever the bypass is enabled, before it reads one. A server with the bypass
   enabled against a datasource that is not allowed therefore fails before it
   serves a bypassed request.

4. **Verifying a bypass cookie proves it authentic, not that the environment may
   honor it.** `parseE2EAuthCookieValue` in `packages/auth/e2e-auth.ts` checks
   the signature, the expiry and the fields, and nothing about the environment.
   A valid signature says who signed the cookie, not whether this deployment may
   accept it. So every caller that grants an identity from the result first
   checks `isE2EAuthBypassEnabled` and calls
   `assertSupabaseDatasourceAllowedForE2EBypass`. The callers today are
   `packages/auth/context.ts`, `packages/auth/middleware.ts` and
   `apps/admin/src/cms/auth/supabase-strategy.ts`, and each one does both.

5. **A real session always wins over a bypass cookie.** `getAuthContext` in
   `packages/auth/context.ts` consults the bypass (`getE2EAuthBypassContext`,
   through `resolveUnauthenticatedOrE2EContext`) only when there is no valid
   Supabase user and the request sent no bearer token. `authMiddleware` in
   `packages/auth/middleware.ts` reads bypass cookies only when Supabase returned
   no user. Otherwise an old `asym_e2e_auth` cookie could replace the real user
   in development whenever `E2E_AUTH_BYPASS` is on.

### Signing the cookie

6. **A hosted datasource needs an explicit signing key. A public fallback key
   serves only local and placeholder datasources.** `getE2EAuthSecret` in
   `packages/auth/e2e-auth.ts` returns `E2E_AUTH_SECRET` when it is set. When it
   is not, it returns the public key `E2E_AUTH_DEV_FALLBACK_SECRET`, but only if
   `isNonConfidentialE2EDatasource` accepts the datasource: none is configured,
   its host is local by the same list as decision 1, or it is exactly
   `example.supabase.co`. A URL that does not parse is not accepted. For any
   other datasource it returns `null`, so minting refuses and verifying rejects
   until a confidential secret is set. That includes a hosted project on the
   allowlist: listing a project in `E2E_AUTH_ALLOWED_SUPABASE_REFS` admits the
   bypass against it (decision 1), whatever data it holds, but never gives it
   the public key. The fallback lets local development and the placeholder CI
   job run with no secret setup. The key can be public only on the assumption
   that a local or placeholder datasource holds throwaway data or none. The
   code does not check that assumption. It reads the host name and nothing
   behind it, so a local host that forwards to real data would still get the
   public key. Keeping such datasources isolated and disposable is the
   operator's job. The function reads `process.env`
   directly, not `@asym/env`, so the module stays edge-safe and light on
   dependencies, like the other environment reads in that file. The test
   `fails closed for a real remote datasource when the secret is unset` in
   `packages/auth/e2e-auth.edge.test.ts` pins the refusal.

7. **No unsigned bypass cookie is ever minted.** `createE2EAuthCookieValue` in
   `packages/auth/e2e-auth.ts` produces
   `<base64url(JSON payload)>.<base64url(HMAC-SHA-256)>`, and throws when no
   signing key is available. An unsigned bypass token is exactly the gap the
   signature closes, so the function refuses to produce one.

8. **A token expires after one hour, and the expiry is signed.**
   `SignedE2EAuthPayload.exp` in `packages/auth/e2e-auth.ts` is an absolute
   expiry in epoch seconds inside the signed payload, so a client cannot extend
   it. `E2E_AUTH_TOKEN_TTL_SECONDS` is one hour, the same as the cookie `maxAge`
   the demo-account route sets in `packages/api/src/auth/demo-account.ts`, so a
   token never outlives its cookie. The lifetime is short so that a leaked token
   expires quickly.

9. **Reading a bad bypass cookie never throws.** `verifyE2EAuthSignature` in
   `packages/auth/e2e-auth.ts` checks the HMAC with Web Crypto's
   `crypto.subtle.verify`, for a constant-time comparison, and returns `false`
   for a malformed signature or any verification error. `parseE2EAuthCookieValue`
   returns `null` for a missing, unsigned, forged, expired or malformed value,
   and when no signing key is available, so the caller falls back to an
   unauthenticated context.

### Which cookie counts, and where

10. **Each app has its own bypass cookie name, chosen by port.** All local apps
    run on `localhost`, and cookies are not separated by port, so a cookie meant
    for one app would otherwise sign the person into another.
    `inferE2EAuthSurfaceFromHost` in `packages/auth/e2e-auth.ts` maps the
    development and Playwright ports to a surface: 3000 and 3005 to donor, 3030
    to admin, 4000 to missionary. `getE2EAuthCookieNameForRequest` and
    `getE2EAuthCookieNameForProxyHost` turn that surface into its name in
    `E2E_AUTH_COOKIE_NAMES` (`asym_e2e_auth_donor`, `asym_e2e_auth_admin`,
    `asym_e2e_auth_missionary`). When the port names no surface, as for a URL
    with no port in some unit tests, they use `ASYM_E2E_AUTH_SURFACE`. With
    neither there is no surface cookie name. The proxy and the request context
    read the surface cookie first and then the older shared name `asym_e2e_auth`
    (`E2E_AUTH_COOKIE_NAME`), and read either only while the bypass is enabled.
    The proxy also applies the app's allowed roles (`isRoleAllowedForApp` in
    `packages/auth/middleware.ts`) to the role either cookie carries.

11. **The proxy's auth-screen redirect and role check key on the Supabase user,
    not on the bypass identity.** In `authMiddleware` in
    `packages/auth/middleware.ts`, the bypass fills `userId` from a cookie with
    no Supabase session. The redirect that sends a signed-in visitor away from
    the sign-in and registration screens checks Supabase's `user`, because
    redirecting bypass identities would bounce the end-to-end suite off `/login`
    and `/register`. The database-backed role check (`resolveUserRole`) also
    checks `user`. The bypass has already applied `isRoleAllowedForApp` to the
    cookie's role, and looking up its ID would find no user, resolve `null` and
    bounce the suite.

### The identity's memberships

12. **A bypass identity's memberships come from its signed cookie, with no row
    behind them.** `E2EAuthMembership` in `packages/auth/e2e-auth.ts` is one
    membership the cookie names: an `id` that stands in for
    `authz.memberships.id` and must be a canonical UUID, a tenant, a role class,
    a staff sub-role and the tenant-administrator flag. End-to-end suites can
    then sign in as a person with several staff rows, or with rows in two
    tenants, without a database. `listE2EAuthMemberships` returns the cookie's
    list when `E2EAuthSession.memberships` is present, even an empty one. When it
    is absent, it returns the one membership that `impliedE2EAuthMembership`
    derives from the session's role: ID `E2E_BYPASS_ASSIGNMENT_ID`, in the
    session's tenant or the demo tenant, and for `staff`, `admin` and
    `super_admin` a staff row with the `development` sub-role. Cited: AL-2675.

13. **The demo IDs match the seed.** `DEMO_TENANT_ID` and `DEMO_PROFILE_ID` in
    `packages/auth/constants.ts` are the demo organization and the demo owner's
    profile that `supabase/seed.sql` inserts. A bypass identity whose cookie
    names no tenant gets its implied membership in `DEMO_TENANT_ID`, and one
    whose cookie names no profile gets `DEMO_PROFILE_ID` as its profile
    (`getE2EAuthBypassContext` in `packages/auth/context.ts`). Its viewer context
    then points at rows a seeded database holds.

14. **A signed membership must obey the membership table's rules, and one bad
    entry rejects the whole cookie.** `parseE2EAuthMembership` in
    `packages/auth/e2e-auth.ts` returns `null` unless the ID and the tenant are
    canonical UUIDs, the role is `donor`, `missionary` or `staff`, a staff row
    has a known staff sub-role and no other row has one, and only a staff row
    carries the tenant-administrator flag. These are the rules
    `toActiveAssignment` in `packages/auth/principal/assignment.ts` applies to
    live rows. `parseE2EAuthCookieValue` rejects the whole cookie when any entry
    fails, even though its signature is valid: it fails closed rather than drop
    the bad entry and grant the rest.

15. **The proxy and the request context judge a bypass identity by the
    resolver's own rules.** `listE2EAuthAssignments` in
    `packages/auth/principal/e2e-assignments.ts` gives the cookie's memberships
    the shape of live assignments (`ActiveAssignment`). `getE2EAuthBypassContext`
    in `packages/auth/context.ts` passes them to `selectAssignment` with the
    request's role class, tenant and assignment, and the proxy's membership
    decisions read them through `readSurfaceAssignments` in
    `packages/auth/middleware.ts`. The tenant and assignment a request names
    therefore select among bypass memberships exactly as they would among live
    rows. One case differs: when the request carries no role class header, as in
    a context built outside a proxied request, a bypass identity resolves only if
    it holds exactly one membership, while a real session in the same case is
    denied with `no_role_class`. Cited: AL-2675.

## Accepted records this code implements

- `impliedE2EAuthMembership` in `packages/auth/e2e-auth.ts` (an `admin` or
  `super_admin` role becomes a staff membership with the tenant-administrator
  flag set):
  [ADR-0227](../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md),
  clause 1.
