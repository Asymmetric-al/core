# 0018. The operator area: admitted on an operations address, checked again by the page, second factor in the browser

**Status:** Recorded on 2026-11-26 with WP2c part 2a of the Core CRM, CMS and
database foundation program (AL-2675): rulings Q1, Q2, Q5 and Q7 on part 2a.
It describes the code as it is and ratifies no product intent. Accepted
platform intent is in [`docs/adr/`](../../../../docs/adr/README.md); the
operator list and the shared operator check are part 1's
([runbook](../../../../docs/ops/platform-operators.md)).

## Context

Platform commands begin with `platform.require_operator()`, which refuses a
caller who is not on `authz.platform_operators` or whose token's `aal` claim
is not `aal2`. Before this record the product had no screen where an operator
could set up a TOTP factor or pass the challenge, so no session could reach
`aal2` without the break-glass steps of the runbook. `/operator` was an inner
path of the tenant flow, and no application code called
`public.caller_is_platform_operator()`.

## Decisions

### The operations address

1. **The area answers only on an operations address.** A request is on one
   when it carries neither `x-asym-front-stamp` nor `x-asym-front-origin`
   (present at all, valid or not), and its `host`, after stripping ASCII space
   (`0x20`) and tab (`0x09`) at both ends and lower-casing ASCII `A-Z` only,
   equals byte for byte an entry of `OPERATIONS_NAMES` normalized the same
   way, and equals `x-forwarded-host` by the same rule whenever that header is
   present. `String.prototype.trim()` and `toLowerCase()` are not used: they
   fold a no-break space, an ideographic space, a line feed, the Kelvin sign
   and a dotted capital I into characters a listed name could hold.
   `isOperationsAddress` in `operator-area.ts`.

2. **One ASCII-only parser for the variable.** `OPERATIONS_NAMES` is a
   comma-separated list of bare `host[:port]` entries: ASCII letters, digits,
   `-` and `.` in the host, no leading, trailing or doubled dot, and an
   optional `:` with 1-5 digits. `parseOperationsNames` in
   `@asym/env/operations-names` serves both the env schema's refine (every
   entry valid, at least one) and the run-time reader, which still fails
   closed where validation is skipped: an invalid entry is ignored and
   `[operator] OPERATIONS_NAMES is invalid` is logged once per process; unset
   or empty logs `missing` once. No log line carries a value. The variable is
   read at run time only, in the proxy and the page; it is in no build hash.

### The admission in the proxy

3. **`admitOperatorArea` runs first in the admin proxy, before the switch
   test,** and answers `null` for any path that is not the area. A path is the
   area when its raw form, or its form decoded once, is `/operator` or begins
   `/operator/` (case-sensitive). When `decodeURIComponent` refuses a bad
   escape, only the ASCII escapes are decoded, so a bad escape under
   `/operator/` still counts as the area.

4. **The order, refusals first, then the session.**
   - Before any cookie is read or any Supabase client is built: a tenant
     address whose inner path is the area answers `404`; a front header
     answers `404`; a host that is not an operations address answers `404`,
     or `403` (`frontRefusal()`) with `CORE_SERVE_UNDER_PATHS=1`; any method
     other than `GET` and `HEAD` answers `404`. Each `404` is
     `frontNotFound()`: empty, `cache-control: no-store`, nothing else.
   - Missing Supabase configuration answers `503`, empty and `no-store`, with
     one log line naming no value.
   - The session, read as the middleware reads it. No user: `307` to
     `<basePath>/login?next=%2Foperator` on the request's own origin, marked
     `private, no-store, no-transform, max-age=0`.
   - `caller_is_platform_operator()` on that session: `false` answers the same
     `404`; an error, a non-boolean or a thrown read answers `503` (the code
     only is logged); `true` admits.
   - Cookies and `@supabase/ssr` cache headers that a refresh wrote are
     carried on whichever answer that step gives, so a rotated refresh token
     is never dropped.

5. **What an admitted request carries.** `NextResponse.next` with every
   `x-asym-*` request header removed and the refreshed cookies copied into the
   request, then `Cache-Control: private, no-store, no-transform, max-age=0`,
   `CDN-Cache-Control: no-store`, `Vercel-CDN-Cache-Control: no-store` and
   `Referrer-Policy: no-referrer` on the response. `apps/admin/next.config.ts`
   is not used for these headers: its `headers()` run before the proxy and
   would mark refusals too.

6. **The price of refusing before the session.** A refused `/operator` answers
   an empty `404`, the same for an unknown sub-path and for every refused
   name, while Mission Control's ordinary unknown paths still run the tenant
   flow (a sign-in redirect or a "Page not found" page). No answer says
   whether a refused person is an operator.

7. **`/operator` lies outside the tenant segment** (`OUTSIDE_TENANT_SEGMENT_ROOTS`),
   so no link, redirect or chooser gives it a tenant. In the missionary
   workspace `/operator` is now an outside path with no page: a signed-out
   visitor goes to sign-in, a signed-in missionary gets the app's not-found
   page, and `/<tenant>/operator` redirects to `/operator`.

### The page's own check

8. **The page blocks: `export const instant = false`.** `readOperatorAdmission`
   (`operator-area-server.ts`, React `cache()` per request) first awaits
   `connection()`, so the page renders only for a request and is never
   prefetched or prerendered (a runtime prerender would otherwise resolve
   `headers()` and reach Supabase's clock), then reads `headers()`
   and the session through `@asym/database/supabase/server`, and both
   `generateMetadata` and the page await it before anything renders. A
   refusal calls `notFound()` before any output, so it is a `404` and not a
   streamed `200`, and no prerendered shell can show "Operator area". It
   refuses when any `PAGE_SCOPE_HEADERS` entry or any `x-asym-front-*` header
   is present, when the host is not an operations address, when there is no
   user, and when `caller_is_platform_operator()` is not strictly `true`. A
   `catch` calls `unstable_rethrow` first
   ([0013](0013-request-cookies-and-nextjs-caching.md)). The page lives in
   `app/(operator)`, outside `(app)`: no Mission Control shell, no document
   scope, no `'use cache'`, no `loading.tsx`.

### The second factor, in the browser

9. **Enrolment and the challenge go from the browser straight to Supabase
   Auth,** through the shared browser client (`operator-mfa.ts`), never
   through a Core route. Auth limits MFA challenges and verifications per IP
   address, a challenge must be verified from the address that made it, and
   so no TOTP secret, URI or code reaches a Core server, log, cache or table.
   The secret lives only in the enrolment panel's `useState`, is cleared on
   success, Cancel (which removes the unverified factor), sign-out and
   unmount, and the QR code, the key and each code field carry
   `data-sentry-block`. The QR is drawn from Auth's SVG, trimmed and
   URL-encoded: Auth answers raw SVG text ending with a newline, which
   `next/image` refuses. The key sits in a fieldset named "Key"; ARIA
   prohibits naming the `code` element itself. Auth's messages are never shown; each known error code
   maps to a fixed text, and `insufficient_aal` re-reads the state.

10. **The state, in strict order,** from the live factor list
    (`mfa.listFactors()`, which reads the user from Auth) and the session's
    level (`getAuthenticatorAssuranceLevel()`, which decodes the stored token,
    for display only): no verified TOTP factor means enrolment, after a
    session refresh if the level still says `aal2` (a factor removed in
    another tab or by the release owner); a verified factor below `aal2`
    means the challenge; the area only with a verified factor, `aal2` and
    `platform_operator_session()` returning the caller's own id. If the
    database refuses, the page says so and offers sign-out, never "verified".
    With several verified authenticators the challenge tries the next one
    only after a wrong code (`mfa_verification_failed`); any other refusal
    (rate limit, switched-off TOTP, expired challenge, network change, a
    refusal by the MFA verification hook, `mfa_verification_rejected`,
    server error) stops there with its own text, since Auth limits these
    calls per address. No submit with fewer than six digits reaches Auth,
    and none is sent once sign-out has begun; a verification that answers
    after sign-out began, or after its panel went, does nothing more. A
    re-read never discards an enrolment the operator has open or a message
    on the screen.

11. **The last factor (ruling Q5).** "Remove" appears only while two or more
    verified TOTP factors exist, behind a confirmation; removal is followed at
    once by a session refresh and a fresh read, also when the refresh fails
    or throws. From the confirmation until a read started after the removal
    is on the screen, no Remove control is offered or confirmed, whatever
    other read resolves in between, so a second removal can never be
    confirmed from a stale list; a removal that did not happen says so. The
    product never removes the last verified factor; the release owner does,
    by the runbook.

12. **Who may enrol (ruling Q7).** The product offers enrolment and the
    challenge only inside `/operator`, which only listed people reach.
    Supabase Auth's project-wide `/auth/v1/factors` API still lets any
    signed-in person enrol a factor directly; doing so admits them neither to
    `/operator` nor to `platform_operator_session()`
    (`tests/unit/acceptance/issue-2675/operator-mfa.localstack.test.ts`, T5
    row 5).

13. **With `CORE_SERVE_UNDER_PATHS=1` (ruling Q2),** the same rule holds: a
    stamped request to `/operator` (the front's `/admin/operator` on an
    organization's name) answers `404`, and an unstamped request on an
    unlisted host answers `403`. No unstamped sign-in or callback route opens
    with this record; how operators sign in on the operations address under
    the switch, and how they reach `aal2` for the assistant runtime's operator
    actions, are N3/N4 prerequisites.

## Proofs

`tests/unit/auth/operator-area.test.ts` (paths, addresses, the variable),
`tests/unit/packages/env/operations-names-schema.test.ts` (the schema),
`tests/unit/apps/admin/operator-area-proxy.test.ts` (the proxy's table, switch
off and on), `tests/unit/apps/admin/operator-gate.test.tsx` (the page),
`tests/unit/auth/operator-mfa.test.ts` and
`tests/unit/apps/admin/operator-area-client.test.tsx` (the state, the copy, the
last factor, the secret's absence),
`tests/unit/acceptance/issue-2675/operator-mfa.localstack.test.ts` (Supabase
Auth on refresh and removal) and `tests/e2e/auth-operator-area.spec.ts` (the
journeys, including the absence of the key, plain and grouped, the
`otpauth` address and a slice of the QR's SVG from every Mission Control
response and request, the server log, the browser's storage and the
database; the journey fails when an `/operator` response or a browser store
cannot be read, and reads again, with the same address, headers and cookies,
only an `/operator` route-data fetch the router aborted, as it does after
sign-in, taking only a `200` answer). After a failed case the journey closes
its pages, so Playwright's `error-context.md` holds no snapshot of a page
that may show the key.

The journey's server log (`.e2e-logs/auth-mail-admin-server.log`) lies
outside every path a workflow uploads, because `next dev` forwards browser
warnings and errors into it (`tests/unit/playwright-auth-mail-config.test.ts`
pins that).
