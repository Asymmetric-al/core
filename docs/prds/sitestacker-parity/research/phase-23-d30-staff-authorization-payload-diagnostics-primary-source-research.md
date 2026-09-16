# Phase 23 D30 Staff Authorization and Governed Payload Diagnostics Primary-Source Research

**Status:** Complete supporting evidence for the founder-ratified Phase 23 D30
C-prime-R decision. It qualifies current providers, the exact Core Payload pin,
Supabase session behavior, security standards, repository seams, and permanent
controls without independently expanding the ratified authority or authorizing
implementation.

**Date:** 2026-08-24

**Ratified:** 2026-08-24

## Research question

What is the smallest durable authorization boundary that lets ordinary tenant
staff use a clear Asym Web Studio, lets authorized platform operators diagnose
real production problems safely, and still prevents Payload defaults, raw
Admin routes, Local API bypasses, provider session lag, or shadow role data from
becoming a second authorization system?

The answer must resolve all of these surfaces together:

1. Supabase human identity and session verification;
2. Phase 12 capability, Tenant, Site, purpose, floor, and epoch decisions;
3. the Payload user document required by the Admin and request APIs;
4. collection, field, Admin, version, restore, and unlock access;
5. Local API `user`, `req`, `overrideAccess`, and `overrideLock` semantics;
6. REST, GraphQL, server-function, and raw Admin routes;
7. production diagnostic entry, freshness, expiry, revocation, and repair; and
8. complete, privacy-safe privileged-access audit evidence.

## Current-version posture

Research was refreshed on 2026-08-24. Version-sensitive implementation facts
must be requalified at implementation time.

| Component                   | Verified posture                                                                                                                                    | D30 consequence                                                                                                                                    |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core Payload                | `payload@4.0.0-internal.1f9ae9a`, published 2026-06-03                                                                                              | This is a non-stable internal artifact. Exact source and executable conformance tests outrank current public stable docs where behavior differs.   |
| Current public Payload line | `3.88.0` stable; `4.0.0-canary.29` canary; `4.0.0-internal.af6aad0` current internal tag at research time                                           | “Payload supports it” is not sufficient. Every relied-on access and route behavior must pass against Core’s exact pin and again before an upgrade. |
| Core Supabase clients       | `@supabase/ssr@^0.8.0`; `@supabase/supabase-js@^2.89.0`                                                                                             | Core is behind the current packages observed during research. D30 must preserve a narrow adapter and test actual resolved lockfile versions.       |
| Current Supabase clients    | `@supabase/ssr@0.12.4`; `@supabase/supabase-js@2.112.3` at research time                                                                            | Current Supabase guidance applies conceptually, but package-specific behavior must be checked against Core’s resolved versions before coding.      |
| Supabase SSR helper         | Supabase still labels `@supabase/ssr` beta and its API unstable                                                                                     | Do not let Payload authentication or D30 grant state depend on undocumented helper internals.                                                      |
| Identity authority          | Supabase Auth, per existing Core architecture                                                                                                       | Payload does not issue a second staff credential or own staff offboarding.                                                                         |
| Authorization authority     | Phase 12’s single `resolveProjection` policy-decision point                                                                                         | Payload roles, document ownership, collection visibility, or a diagnostic URL never grant authority.                                               |
| Security baseline           | NIST SP 800-63B-4 session guidance, NIST SP 800-53 Rev. 5 Release 5.2.0 controls, and OWASP Authorization, Session Management, and Logging guidance | Privileged access must be least-privilege, deny-by-default, freshly authenticated, time-bound, revocable, and auditable without logging secrets.   |

Reproducible version checks:

```powershell
npm view payload@4.0.0-internal.1f9ae9a version
npm view payload@latest version
npm view payload@canary version
npm view payload@internal version
npm view @supabase/ssr@latest version
npm view @supabase/supabase-js@latest version
```

The version facts prove which artifacts were inspected; they do not prove that
an Admin route, plugin, or provider default is safe for Asym.

## Recommended C-prime-R contract

> **C-prime-amended-and-hardened (C-prime-R) — One Supabase-authenticated Asym
> Staff Access Authority with Phase 12 as the sole permission brain, a
> non-authoritative Payload Principal Link, an Asym-owned product-only Web
> Studio, deny-by-default provider and API boundaries, and one incident-bound,
> short-lived, read-only Engine Diagnostics Session; typed Asym commands own
> every repair.**

The permanent boundary is one server-owned gateway. Supabase Auth proves the
human and session. Phase 12 resolves the only effective capabilities, active
Tenant assignment, Site/resource scope, purpose, security floor, and governance
epoch. Payload receives only a minimal, non-authoritative Principal Link and
consumes the gateway decision through explicit access functions. Tenant staff
use only the Asym Web Studio. GraphQL is disabled at launch, raw Payload Admin
is unavailable in production, and broad generated REST/auth endpoints are not
externally exposed. Only exact same-origin Web Studio operations and a governed
diagnostic read view may be allowlisted. Platform diagnostics use a separately
capability-gated, freshly stepped-up, exact-Tenant-and-Site, short-lived,
read-only grant with a visible countdown and complete audit; mutations remain
typed owner-domain commands outside that grant rather than unrestricted Admin
access.

This is not a second policy engine. It is an adapter around the already-ratified
Phase 12 authority and explicit containment of provider surfaces.

## 1. Payload custom authentication is a compatibility seam, not an authority

Payload’s current
[custom-strategy documentation](https://payloadcms.com/docs/authentication/custom-strategies)
defines a strategy as request authentication that returns a Payload user
document or `null`, plus optional response headers. Payload’s
[authentication overview](https://payloadcms.com/docs/authentication/overview)
says `disableLocalStrategy` should be used only when the built-in mechanism has
been replaced. This validates using a Supabase-backed strategy to satisfy
Payload’s request shape. Payload's
[Admin overview](https://payloadcms.com/docs/admin/overview) also requires the
configured `admin.user` to name an auth-enabled collection. That explains why a
small Payload principal document remains necessary; neither requirement makes
that document an authority for roles, memberships, or permissions.

The exact pin’s
[`executeAuthStrategies.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/auth/executeAuthStrategies.ts#L14-L37)
runs strategies sequentially, catches and logs a strategy exception, then
continues; if no strategy returns a user, the result is unauthenticated. That
provider behavior creates a material distinction D30 must preserve:

- no session is an ordinary unauthenticated result;
- an unavailable Supabase or Phase 12 dependency is a service failure;
- a missing or stale Tenant mapping is a configuration failure; and
- a verified identity without the required capability is an authorization
  denial.

The outer Asym gateway must classify those outcomes before the Payload strategy
can collapse them to `null`. It must fail closed and return a stable support
code for dependency/configuration failures. The strategy then adapts a
preverified request context into a Payload principal; it does not reimplement
authorization or silently downgrade provider errors to “signed out.”

### Minimal Payload Principal Link and adapter

The Payload auth collection should contain only compatibility identity data:

| Field                      | Rule                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                       | Payload document identity only. It is not a person, membership, or Tenant authority.                                                                                |
| `supabaseUserId`           | Immutable, required, unique Supabase user UUID. This is the sole human linkage and preserves Core's existing field instead of creating a cosmetic rename migration. |
| `displayName`              | Optional safe display snapshot. Never used for authorization.                                                                                                       |
| `email`                    | Payload-compatible safe display/contact snapshot, explicitly non-authoritative and update-restricted. It creates no Payload password/login lifecycle.               |
| `collection` / `_strategy` | Provider-required request metadata.                                                                                                                                 |
| timestamps                 | Compatibility/audit support only.                                                                                                                                   |

It must not store an authoritative role, staff subrole, active Tenant, Site,
capability list, clearance, security tier, purpose, legal-entity scope, or
governance epoch. A user may validly work in more than one Tenant or browser
tab; writing one mutable `tenantId` or role onto the principal creates a
last-writer-wins authorization race.

### Durable Tenant mapping

Payload document IDs and operational Tenant UUIDs are different namespaces.
D30 therefore requires a durable one-to-one mapping record keyed by the
immutable operational Tenant UUID and the Payload Tenant document ID. The
mapping is provisioned and validated during Tenant/Site onboarding, changed by
a named administrative command, and monitored for duplicates or orphans.

Authentication must never:

- infer a mapping from a mutable slug;
- create a Tenant because a user happened to sign in;
- pick a default Tenant for a platform operator;
- rewrite an existing mapping from profile display data; or
- make the principal row’s previous Tenant the active assignment.

Missing or ambiguous mapping is a fail-closed configuration error, not a
reason to auto-heal inside the auth path.

### `req.user` is browser-visible in Core’s current composition

Core’s
[`(payload)/layout.tsx`](<../../../../apps/admin/app/(payload)/layout.tsx>)
passes `req.user` to `RootProvider`. In the exact Payload pin,
[`RootProvider`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/ui/src/providers/Root/index.tsx#L1-L117)
is a client component and passes its `user` prop into the client Auth provider.
Therefore D30 must treat every enumerable field placed on `req.user` as
browser-visible, regardless of whether the original request resolution ran on
the server.

The effective Phase 12 result must remain in a request-scoped server-only
container, such as a private `WeakMap<PayloadRequest, ResolvedAuthorization>`
owned by the gateway. It is memoized once per request, never globally, and is
not copied into `req.user`, client config, cookies, URLs, React props, logs, or
Payload documents.

## 2. Every Payload operation needs explicit access

Payload’s current
[access-control overview](https://payloadcms.com/docs/access-control/overview)
states that access functions execute across Local API, REST, GraphQL, and the
Admin Panel. The exact pin’s
[`executeAccess.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/auth/executeAccess.ts#L17-L39)
shows the dangerous default: when an access callback is absent, any populated
`req.user` is allowed.

Likewise, the exact pin’s
[`getAccessResults.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/auth/getAccessResults.ts#L19-L28)
sets `canAccessAdmin` to “logged in” when the configured Admin user collection
does not define `access.admin`.

Those are reasonable generic-CMS defaults, but they are incompatible with a
multi-Tenant product whose principal row intentionally carries no authority.
Every exposed collection, global, auth collection, sensitive field, and Admin
entry must define an explicit deny-by-default decision that calls the one Asym
gateway.

### Operation matrix

Payload’s
[collection access documentation](https://payloadcms.com/docs/access-control/collections)
documents the distinct collection operations. The exact-pin source further
qualifies version, restore, and unlock behavior.

| Surface                 | Exact/provider behavior                                                                                                                                                                                                                                                         | D30 permanent rule                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create`                | Separate collection access callback; absent callback admits an authenticated `req.user`.                                                                                                                                                                                        | Require the exact create capability and active Tenant/Site scope; inject and validate Tenant ownership server-side.                                         |
| `read`                  | May return a Boolean or query constraint.                                                                                                                                                                                                                                       | Return a structural Tenant/Site predicate in addition to capability and floor checks; do not fetch broadly and filter afterward.                            |
| `update`                | Separate callback with `id`/`data` context.                                                                                                                                                                                                                                     | Require the exact edit capability, expected revision where applicable, and an immutable Tenant owner.                                                       |
| `delete`                | Separate callback.                                                                                                                                                                                                                                                              | Map to D21 recoverable Trash or the owner command; never grant generic physical delete.                                                                     |
| `admin`                 | Defaults to any logged-in configured Admin user in the exact pin.                                                                                                                                                                                                               | Define explicitly. Ordinary tenant staff are admitted only to bounded Asym views; raw collection Admin is denied.                                           |
| `readVersions`          | The exact pin’s [`findVersions.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/collections/operations/findVersions.ts#L70-L91) checks `access.readVersions` and combines its result with the supplied query; it does not substitute normal `read`. | Define on every versioned collection. Require a distinct history capability and the same Tenant/Site/document predicate as current reads.                   |
| restore                 | The exact pin’s [`restoreVersion.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/collections/operations/restoreVersion.ts#L41-L116) loads the version then enforces the parent collection’s `update` access when access is enabled.                | Restoration is a typed revision command, not “read history.” Recheck exact document ownership, capability, lock/revision, and release effects before write. |
| `unlock`                | The exact pin’s [`unlock.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/auth/operations/unlock.ts#L69-L82) checks `access.unlock` only when access is not overridden.                                                                             | Define explicitly or disable the route. Supabase-owned staff identity means generic Payload account-unlock is normally not a tenant-staff action.           |
| field `read`            | Field access can suppress a field across UI/API.                                                                                                                                                                                                                                | Sensitive fields need explicit subtract-only Phase 3/10 floor decisions; collection access alone is insufficient.                                           |
| field `create`/`update` | Separate field callbacks.                                                                                                                                                                                                                                                       | Identity linkage, Tenant ownership, release identity, and security classification fields are server-owned and not directly editable.                        |

### Immediate version-read risk to prove or disprove

Core’s current collections use versions, but the current access helpers are
role-and-`tenantId` based and the inspected test inventory contains no direct
`readVersions`, restore, unlock, GraphQL, or raw-Admin containment test. Since
the exact provider default allows authenticated principals when an operation’s
callback is missing, version routes are a plausible cross-Tenant disclosure
path.

This is a **high-severity inference, not a confirmed exploit**. Before any D30
implementation is called safe, an integration test must attempt to enumerate,
read, and restore Tenant B’s versions while authenticated in Tenant A, through
REST, Admin/server functions, and Local API. A passing happy-path editor test
does not answer this question.

## 3. Local API defaults are a deliberate footgun

Payload’s current
[Local API access-control documentation](https://payloadcms.com/docs/local-api/access-control)
says Local API operations skip access control by default. The
[Local API overview](https://payloadcms.com/docs/local-api/overview) documents
`overrideAccess: true` as the default, says a `user` is required when access is
enforced, documents `overrideLock: true` as the default for lock-aware writes,
and recommends passing `req` so nested work remains in the same request and
database transaction.

The exact pin confirms the wrapper defaults:

- [`local/find.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/collections/operations/local/find.ts#L205-L253)
  defaults `overrideAccess` to `true`;
- [`local/update.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/collections/operations/local/update.ts#L229-L271)
  defaults `overrideAccess` to `true` and carries `overrideLock` through;
- [`local/restoreVersion.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/collections/operations/local/restoreVersion.ts#L78-L113)
  defaults `overrideAccess` to `true`; and
- [`local/unlock.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/auth/operations/local/unlock.ts#L21-L40)
  defaults `overrideAccess` to `true`.

D30 must prohibit scattered direct Payload Local API use and expose two
non-interchangeable typed ports with these non-optional call classes:

| Port            | Caller class                                      | `req`    | `user`                                                     | `overrideAccess`                                                      | `overrideLock`                | Additional invariant                                                                                                                     |
| --------------- | ------------------------------------------------- | -------- | ---------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Actor           | Human Web Studio command/query or diagnostic read | required | minimal Payload principal                                  | `false`                                                               | `false` for writes            | Request-scoped Phase 12 result must match action, Tenant, Site, purpose, and epoch; diagnostics remain read-only.                        |
| Service command | Public projection compiler                        | required | none or a registered non-human context, never a staff user | `false` unless the single named compiler command is formally exempted | `false`                       | Can read only source-qualified data and emit only the D1 public projection.                                                              |
| Service command | Scheduled/reconciliation/typed Repair command     | required | registered service principal context                       | `false` by default                                                    | `false` by default            | Re-resolve service authority at execution; a queued actor snapshot is not current authority.                                             |
| Service command | Exceptional provider override                     | required | no invented human identity                                 | `true`, only inside one named command                                 | explicit and normally `false` | Capability, Tenant/Site predicate, reason, idempotency, audit, and postcondition checks occur outside Payload before and after the call. |

An override is not a convenience escape hatch. It is allowed only where the
owner-domain command cannot be represented through ordinary Payload access,
and its name must describe the invariant it preserves. A lint/import-boundary
test should reject direct `payload.find/create/update/delete/restoreVersion`
calls outside the actor/service ports and approved provider internals.

## 4. Generated APIs and raw Admin must be deny-by-default

Payload’s
[authentication overview](https://payloadcms.com/docs/authentication/overview)
says enabling authentication automatically adds auth operations to REST,
Local, and GraphQL APIs. In the exact pin:

- [`collections/endpoints/index.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/collections/endpoints/index.ts#L19-L93)
  registers ordinary CRUD, access, version-list/read, and restore endpoints;
- [`auth/endpoints/index.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/auth/endpoints/index.ts#L16-L75)
  registers access, forgot/init/login/logout/me/refresh/first-register/reset,
  unlock, and verify routes for auth collections; and
- [`collections/config/sanitize.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/collections/config/sanitize.ts#L159-L179)
  adds those default endpoint families unless collection endpoints are disabled.

`disableLocalStrategy: true` replaces the login strategy; it does not by itself
prove that every unused auth URL disappeared. Route existence also does not
make Payload a second identity authority, but leaving an unneeded route
reachable creates confusion and attack surface.

Core currently mounts:

- all REST verbs through
  [`app/(payload)/api/[...slug]/route.ts`](<../../../../apps/admin/app/(payload)/api/[...slug]/route.ts>);
- GraphQL through
  [`app/(payload)/api/graphql/route.ts`](<../../../../apps/admin/app/(payload)/api/graphql/route.ts>);
- the complete Payload root through
  [`app/(payload)/web-studio/[[...segments]]/page.tsx`](<../../../../apps/admin/app/(payload)/web-studio/[[...segments]]/page.tsx>); and
- a custom card before, rather than a replacement for, Payload’s normal
  navigation in
  [`cms-ui/root/Nav.tsx`](../../../../apps/admin/src/cms-ui/root/Nav.tsx).

The same Core layout exposes Payload's `handleServerFunctions` bridge to the
client UI. That bridge is a separate provider transport from REST and GraphQL:
a REST path allowlist does not contain it. The outer Phase 12 gateway, explicit
operation access, and a checked inventory of allowed server-function names and
effects must cover it as well.

No GraphQL consumer was found in the inspected Admin code. Payload’s current
[GraphQL documentation](https://payloadcms.com/docs/graphql/overview) documents
that GraphQL is enabled unless disabled, and its official
[production-abuse guidance](https://payloadcms.com/docs/production/preventing-abuse)
recommends disabling GraphQL when it is unused.

### Required production route posture

1. Set `graphQL.disable: true` and remove the mounted GraphQL handler after a
   route-level test proves `404`/uniform denial.
2. Replace generic REST reachability with a method-and-path allowlist at the
   route boundary. Disable collection endpoints where none are needed; retain
   only endpoints proven necessary by Web Studio network-contract tests.
3. Constrain the Payload server-function bridge to the bounded Web Studio
   operations proven necessary by contract tests; never assume REST/GraphQL
   closure protects that bridge.
4. Do not expose Payload local login, refresh, reset, register, or unlock as a
   second staff lifecycle. Any retained `/me`/access endpoint must consume the
   Supabase adapter and the Asym gateway.
5. Make unknown API paths, direct version URLs, and direct collection URLs fail
   closed with no collection-existence oracle.
6. Remove production raw collection/global Admin routes from ordinary staff.
   Web Studio uses explicit Asym screens and actions.
7. If a provider Admin route is retained for local development, require an
   explicit non-production build/runtime guard and test that production cannot
   enable it by a user-controlled flag.

### `hidden` and custom views are not security controls on the exact pin

Current Payload collection docs describe Admin visibility options, but the
exact-pin
[`Root` view](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/next/src/views/Root/index.tsx#L60-L118)
resolves collection configuration from all collections before the
[`getVisibleEntities`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/ui/src/utilities/getVisibleEntities.ts#L16-L25)
navigation filter. D30 must therefore test direct routes rather than infer
route denial from a hidden navigation item.

The same exact-pin Root source
([custom-view branch](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/next/src/views/Root/index.tsx#L146-L159))
does not redirect for a matched custom Admin view when `canAccessAdmin` is
false, and
[`isCustomAdminView.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/next/src/utilities/isCustomAdminView.ts#L8-L39)
matches configured view paths without checking a `public` flag. Core’s outer
layout currently provides an additional role gate, but Phase 12—not a role
string—must become the permanent outer gate. Provider `access.admin` remains
defense in depth and cannot replace it.

## 5. Supabase identity, session freshness, and revocation

Supabase’s current
[SSR overview](https://supabase.com/docs/guides/auth/server-side) says SSR stores
sessions in cookies, uses PKCE, and that `@supabase/ssr` remains beta. Its
[SSR client guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
distinguishes the three relevant methods:

- `getClaims()` validates the access-token signature and is the normal page/data
  protection primitive;
- `getUser()` makes an Auth-server call and returns the current user record; and
- `getSession()` returns locally stored tokens/session data and its embedded
  user must not be trusted by itself for server authorization.

The same guide warns that authenticated `Set-Cookie` responses must not be
shared-cached because one user could receive another user’s session. D30 routes,
grant creation, and diagnostics are always private/no-store and must never use
a public cache key.

Supabase’s
[advanced SSR guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
clarifies that a shorter cookie `Max-Age` is not a security-enforced session
timeout and that `getClaims()` alone does not confirm server-side logout; it
identifies `getUser()` as the check when current Auth-server session status is
required.

The official
[session guide](https://supabase.com/docs/guides/auth/sessions) says:

- access tokens are typically five minutes to one hour;
- each JWT carries a `session_id` corresponding to an `auth.sessions` row;
- inactivity, maximum-lifetime, and single-session limits are checked at token
  refresh, so effect may be delayed by the remaining JWT lifetime; and
- for especially sensitive operations, applications may check that the
  referenced session still exists.

The official
[`signOut` reference](https://supabase.com/docs/reference/javascript/auth-signout)
likewise notes that revoking refresh tokens does not invalidate an already
issued access JWT before it expires.

### D30 session rule

Ordinary Web Studio requests use the verified Supabase claims plus the current
Phase 12 resolution. Governed diagnostic entry and every diagnostic request use
the stronger current-session check (`getUser()` or an equivalently supported
server-side verification), verify the JWT `session_id`, and recheck Phase 12.
The diagnostic grant is bound to that session and becomes invalid when:

- its short absolute expiry passes;
- the operator exits or revokes it;
- the Supabase session is no longer current;
- the active user is disabled or signed out;
- the required Phase 12 capability is revoked;
- the active Tenant/Site, purpose, or governance epoch changes; or
- the assurance/freshness condition is no longer met.

The access JWT lifetime is never the diagnostic grant lifetime.

### Step-up must prove a fresh event, not merely an old AAL claim

Supabase’s
[MFA guide](https://supabase.com/docs/guides/auth/auth-mfa) exposes `aal1` and
`aal2`, requires backend/API/RLS enforcement rather than UI-only checks, and
documents challenge/verify flows. Its
[`getAuthenticatorAssuranceLevel` reference](https://supabase.com/docs/reference/javascript/auth-mfa-getauthenticatorassurancelevel)
provides the current and next assurance levels.

Supabase’s generic
[`reauthenticate` reference](https://supabase.com/docs/reference/javascript/auth-reauthenticate)
documents a nonce flow for secure password change; it does not establish that
the method is a general-purpose privileged-diagnostics ceremony. D30 must not
mislabel it as one.

Platform operators eligible for diagnostics must enroll an accepted second
factor. Entry performs a new MFA challenge/verify, records the successful
verification time server-side, requires `aal2`, and mints a separate opaque
diagnostic grant. An already-old `aal2` claim without a new verification event
is insufficient. If fresh step-up cannot be completed, access is denied rather
than silently downgraded.

This follows NIST SP 800-63B-4’s normative
[session-management guidance](https://pages.nist.gov/800-63-4/sp800-63b/session/):
a session cannot have a higher assurance level than its authentication event,
re-authentication confirms continued subscriber presence, and the relying
party remains authoritative for freshness even when an identity provider has a
separate session.

## 6. Governed production diagnostics

Tenant staff never need raw Payload. A small set of named platform support or
operations principals may need evidence to diagnose mapping, release,
projection, revision, or provider failures. That need does not justify a
standing global Admin account.

NIST SP 800-53 Rev. 5 Release 5.2.0 is the current NIST control catalog at
research time. The official
[NIST publication page](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
and its official
[OSCAL catalog](https://github.com/usnistgov/oscal-content/blob/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json)
support the relevant controls:

- AC-2 and AC-2(2): manage authorized access and automatically expire temporary
  or emergency accounts/access;
- AC-2(6): dynamically manage privileges, including immediate revocation;
- AC-3: enforce approved authorizations;
- AC-6, AC-6(2), AC-6(5), and AC-6(9): least privilege, nonprivileged roles for
  ordinary functions, restriction of privileged accounts, and logging of
  privileged functions;
- AU-2, AU-6, and AU-12: select, generate, review, analyze, and report audit
  events;
- IA-2: uniquely identify and authenticate organizational users; and
- IA-11: reauthenticate for defined privileged functions and conditions.

OWASP’s current
[Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
reinforces least privilege, deny-by-default, explicit configuration instead of
framework defaults, and validation on every request.

### Diagnostic grant

The grant is an Asym-owned server-side record, not a Payload role, Supabase user
metadata flag, long-lived JWT, browser-local setting, or query parameter.

Required grant fields:

| Field                                           | Required meaning                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------------------- |
| `grant_id`                                      | Opaque unique identifier; raw secret, if any, is never stored or logged.          |
| `operator_subject`                              | Exact Supabase subject; no shared operator account.                               |
| `phase12_decision_id`                           | Decision/provenance reference, not a frozen capability set.                       |
| `capability_key`                                | Exact diagnostic capability, never generic `admin`.                               |
| `environment`                                   | One exact environment; production is never inferred from a URL or prior session.  |
| `tenant_id`                                     | One immutable operational Tenant UUID. No wildcard.                               |
| `site_id`                                       | One exact Site. No wildcard, omission, or inferred current Site.                  |
| `mode`                                          | `read_only` for the diagnostic session.                                           |
| `operation_family`                              | One allowlisted diagnostic operation family; never arbitrary browse or query.     |
| `reason_code` and `reason_text`                 | Bounded category plus concise human context.                                      |
| `sensitivity_class`                             | Current classification used to apply existing safety floors and approval policy.  |
| `incident_ref`                                  | One open incident; diagnostics cannot start without it.                           |
| `issued_at`, `expires_at`, `hard_expires_at`    | 15-minute default; 60-minute hard maximum from first activation.                  |
| `fresh_auth_at`, `aal`                          | Server-recorded successful fresh step-up and required `aal2`.                     |
| `session_binding`                               | Keyed digest/correlation of the Supabase `session_id`, never the raw ID or token. |
| `governance_epoch`                              | Epoch at issuance; every request still re-resolves current authority.             |
| `revoked_at`, `revoked_by`, `revocation_reason` | Immediate explicit termination evidence.                                          |
| `audit_correlation_id`                          | Joins entry, reads, denials, commands, expiry, and exit without exposing secrets. |

The grant has only `active`, `expired`, and `revoked` effective states. Expiry
is enforced in the request predicate, not by hoping a cleanup job ran. Before
expiry, a bounded extension may set a new expiry and receipt only after
re-proving the open incident, capability, safety floor, and remaining hard
maximum. It can never pass 60 minutes from first activation and is never
automatic. After expiry, continued work requires another explicit fresh
step-up and a new grant.

Read-only diagnostics do not require two-person approval by default; that would
add operational burden without replacing the named capability, fresh MFA,
exact scope, short TTL, and audit. Phase 12 may require approval for a specific
high-risk capability. Any write is outside the read-only diagnostic grant and
must use a typed repair command with its own current capability and owner-domain
preconditions.

### Operator UX

The safest flow is also the clearest one:

1. **Start diagnostics.** The operator selects the exact environment, Tenant,
   and Site. Stable IDs and human labels are shown together; the UI never
   guesses from the last environment, Tenant, or Site.
2. **State the purpose.** Bind one open incident and choose a bounded reason.
   The screen plainly says “Read-only for this Tenant and Site” and shows the
   requested duration before any credential prompt.
3. **Verify it is you.** Complete a fresh MFA challenge. If the provider or
   authorization service is unavailable, show a retryable support code without
   revealing Tenant data.
4. **Enter a visibly bounded workspace.** A persistent, non-dismissible banner
   shows environment, Tenant, Site, reason, read-only status, and a live expiry
   countdown. The browser title and accessible landmark also identify
   diagnostic mode to reduce wrong-context mistakes.
5. **Inspect curated evidence.** Show mapping health, revision/release identity,
   projection status, provider receipts, access-decision explanation, and safe
   metadata. Do not expose arbitrary database queries, secrets, full user
   documents, or a generic collection browser.
6. **Repair through named actions.** Where a permanent repair is supported,
   leave diagnostic mode and invoke a typed command that previews exact impact,
   reauthorizes at commit, and produces a receipt. There is no edit toggle.
7. **Exit explicitly or expire automatically.** Exit revokes immediately.
   Expiry replaces data with a neutral re-entry screen; it never leaves stale
   data interactive in a browser tab.

The UI must be keyboard complete, announce grant/expiry state changes, avoid a
countdown-only color signal, warn before expiry without extending it, and avoid
showing a scary “impersonation” vocabulary because no identity swap occurs.
“Production diagnostics — read-only” is the accurate term.

### Typed repair commands

A repair command is not “temporarily enable editing.” It has:

- one semantic action, such as rebuild a mapping projection or retry one failed
  compile generation;
- exact Tenant, Site, resource, expected revision/generation, and idempotency
  key;
- a no-write preview of affected records;
- a distinct Phase 12 capability and purpose;
- current-session and fresh-auth checks appropriate to the action;
- server-side preconditions and invariant validation;
- no generic SQL, arbitrary Payload mutation, or client-supplied collection;
- an atomic transaction where possible or itemized terminal receipts where not;
- a postcondition/reconciliation check; and
- a rollback or compensating command defined before enablement.

## 7. Audit, privacy, and observability

OWASP’s
[Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
recommends logging authentication successes/failures, authorization failures,
session failures, privilege changes, administrative actions, and break-glass or
shared-account events. It calls for “when, where, who, what,” outcome, and
reason, while prohibiting direct logging of access tokens, session identifiers,
passwords, secrets, and sensitive personal data. It also calls for restricted
log access and tamper detection.

D30 therefore records these events:

- diagnostic entry requested, granted, denied, failed, or abandoned;
- fresh-auth success/failure reason category, without factor secrets;
- grant entered, each bounded evidence query, and result count/classification;
- attempted out-of-scope Tenant, Site, resource, route, or operation;
- repair preview, authorization, start, item outcomes, reconciliation, and
  rollback/compensation;
- explicit exit, automatic expiry, capability/epoch invalidation, session
  invalidation, and administrative revocation; and
- access-policy, route-allowlist, or provider-version changes.

Each event carries server time, actor subject, effective capability key,
Tenant/Site/resource identifiers, grant and decision correlation, request/trace
ID, operation, outcome, and machine-readable reason. It excludes raw JWTs,
cookies, refresh tokens, MFA factors, unredacted session IDs, content bodies,
restricted-person plaintext, and secrets. If session correlation is required,
store a rotating-key HMAC/digest rather than the raw identifier.

For diagnostic entry and sensitive diagnostic reads, inability to durably emit
the required audit event is a fail-closed condition. Metrics and alerts must
cover:

- authorization dependency errors separately from ordinary denials;
- missing/ambiguous Tenant mappings;
- direct raw-Admin, GraphQL, auth-route, version-route, and unknown-REST probes;
- Local API override use by command name;
- grants near expiry, expired, revoked, or unexpectedly still accepted;
- cross-Tenant predicate violations caught before response;
- repeated denied diagnostic attempts and unusual Tenant-switch velocity; and
- audit-write failure, lag, tamper/gap detection, and reconciliation failure.

OWASP’s
[Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
also supports server-enforced idle/absolute timeouts, reauthentication after
high-risk events, and logging session lifecycle without logging the session
secret. D30 uses a short absolute diagnostic expiry and explicit re-entry rather
than inventing a second long-lived browser session.

## 8. Current Core evidence and required replacement

The inspected repository establishes useful scaffolding but not the final D30
boundary:

1. [`apps/admin/package.json`](../../../../apps/admin/package.json) pins all
   Payload packages to the same internal artifact, which is good dependency
   hygiene but heightens exact-pin test requirements.
2. [`payload.config.ts`](../../../../apps/admin/payload.config.ts) configures the
   custom Supabase strategy, custom views, generic collections, `/web-studio`,
   REST endpoints, and no GraphQL disable.
3. [`cms-users.ts`](../../../../apps/admin/src/cms/collections/cms-users.ts)
   stores mutable `email`, `tenantId`, and `role`; it defines ordinary CRUD
   access but no explicit `access.admin`, field update protections, or
   non-authoritative-principal contract.
4. [`supabase-strategy.ts`](../../../../apps/admin/src/cms/auth/supabase-strategy.ts)
   reads profile/membership role data, chooses a default Tenant for some cases,
   resolves Payload Tenants by normalized slug, creates/synchronizes Tenant and
   user documents during authentication, and uses `overrideAccess: true` for
   those writes.
5. [`tenant-context.ts`](../../../../apps/admin/src/cms/access/tenant-context.ts)
   and
   [`tenant-access.ts`](../../../../apps/admin/src/cms/access/tenant-access.ts)
   authorize from the mutable Payload user role/Tenant shadow rather than the
   Phase 12 policy-decision point.
6. [`(payload)/layout.tsx`](<../../../../apps/admin/app/(payload)/layout.tsx>)
   correctly recognizes that the route group sits outside the app layout and
   adds an explicit gate, but that gate and
   [`proxy.ts`](../../../../apps/admin/proxy.ts) still use broad role admission.
7. The layout passes the complete `req.user` into Payload’s client root.
8. The generic REST, GraphQL, and full RootPage routes remain mounted.
9. No inspected test exercises direct version, restore, unlock, GraphQL,
   unknown REST, custom-view, or raw collection routes across two Tenants.

These are current-direction gaps, not reasons to replace Payload or Supabase.
The permanent fix is to replace shadow authorization and broad provider
surfaces with the one gateway, minimal principal, explicit access matrix,
allowlisted routes, and exact-pin negative tests.

The canonical
[Phase 12 PRD](../phase-12-full-role-permission-configuration.md) already owns
the single `resolveProjection` PDP, code-owned capability registry, active
Tenant assignment, governance epochs, service/operator principals, purpose,
security floor, explainability, and audit. D30 consumes those contracts; it
does not create `cms_roles`, a second capability registry, or an independent
Payload permission service.

## 9. Ruthless adversarial review

| Category                         | Material concern? | What could go wrong and why it matters                                                                                                                                   | Severity | Likelihood                         | Evidence/reasoning                                                              | Permanent prevention                                                                                                                     |
| -------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                      | Yes               | Slug mapping, auth-time creation, mutable one-Tenant user shadows, or UI-hidden routes work only under ideal single-tab/single-Tenant conditions.                        | High     | Likely without change              | Current strategy and exact-pin route resolution.                                | Immutable onboarding mapping, request-scoped active assignment, no auth-path writes, direct-route tests.                                 |
| Technical debt                   | Yes               | Phase 12 and Payload roles can diverge into two permission systems; direct Local API calls spread unsafe defaults.                                                       | High     | Likely                             | Current role helpers plus Payload authenticated-user and Local API defaults.    | One gateway with distinct actor and service-command ports; delete shadow authority and lint forbidden imports.                           |
| Edge cases                       | Yes               | Two Tenant tabs, renamed slugs, missing mapping, provider outage, expired grant mid-read, restored foreign version, and stale AAL can produce wrong-context behavior.    | High     | Likely over product life           | Current mutable row plus documented provider/session semantics.                 | Stable IDs, explicit states, commit-time rechecks, session-bound grants, and adverse-path tests.                                         |
| Footguns                         | Yes               | `overrideAccess` and `overrideLock` default true; absent access admits authenticated users; hidden nav can be mistaken for security.                                     | Critical | Likely for future developers       | Exact Payload source and official Local API docs.                               | Non-optional wrapper defaults, explicit access everywhere, route allowlist, compile/lint guard.                                          |
| Tenant safety                    | Yes               | Versions, REST, Local API, or a mutable principal may expose or mutate another Tenant.                                                                                   | Critical | Possible; version path is unproven | Distinct `readVersions` path, mounted APIs, and absent cross-Tenant tests.      | Structural Tenant/Site predicates, immutable mapping, negative matrix through every transport.                                           |
| Overengineering                  | Yes               | A second policy engine, universal JIT platform, permanent raw Admin, or mandatory two-person approval for every read would add cost without improving the settled spine. | Medium   | Possible                           | Phase 12 already owns authority; NIST controls are tailorable.                  | Thin adapter, read-only self-service for specifically capable operators, typed commands only when needed.                                |
| UX/UI and user friction          | Yes               | Hidden modes, guessed Tenant, unexplained denial, or generic Admin vocabulary can cause support errors and fear.                                                         | High     | Likely without a designed flow     | Current full RootPage and mutable Tenant context.                               | Seven-step bounded journey, stable labels/IDs, persistent scope banner, countdown, support codes, no edit toggle.                        |
| Hidden coupling                  | Yes               | Payload pin behavior, `req.user` shape, generated endpoints, and Root routing can change independently of Phase 12.                                                      | High     | Likely on upgrades                 | Internal pin differs from current stable/current internal lines.                | Exact-pin adapter contract and upgrade-blocking conformance suite.                                                                       |
| Failure modes                    | Yes               | Provider failure may look signed out; audit failure may still serve data; expired grants may remain usable if cleanup lags.                                              | High     | Possible                           | Strategy exception swallowing, cleanup-independent expiry requirement.          | Outer classification, fail-closed sensitive audit, request-predicate expiry, explicit observability.                                     |
| Data integrity                   | Yes               | Auth-time duplicate Tenant/user creation or concurrent Tenant switches can corrupt mappings and attribution.                                                             | High     | Possible                           | Current find-or-create/sync with mutable role/Tenant.                           | Unique immutable mapping, transactional onboarding command, no auth mutations, concurrency tests.                                        |
| Security and privacy             | Yes               | Browser-visible `req.user`, broad routes, stale JWTs, raw session logs, or standing Admin can leak authority/data.                                                       | Critical | Possible                           | Core RootProvider composition, Supabase revocation lag, OWASP logging guidance. | Minimal principal, no-store routes, current-session check, fresh MFA, short grant, redacted audit.                                       |
| Scalability and performance      | Yes               | Re-resolving Supabase, Phase 12, and mappings repeatedly within one request can create N+1 latency; global caches can preserve revoked authority.                        | Medium   | Likely as traffic grows            | Multiple current strategy queries; Phase 12 request semantics.                  | One request-scoped memo, indexed stable mappings, set-based constraints, metrics; never cache positive authority across requests.        |
| Operational burden               | Yes               | Manual principal repair, standing global accounts, unclear route inventory, or raw database support requires tribal knowledge.                                           | High     | Likely without productization      | Current auth-time sync and generic surfaces.                                    | Onboarding reconciliation, curated diagnostics, typed repair receipts, runbooks generated from reason codes.                             |
| Observability gaps               | Yes               | A normal 403 cannot distinguish mapping failure, provider outage, revoked capability, route probe, or cross-Tenant attempt.                                              | High     | Likely                             | Current strategy can return `null` for several causes.                          | Stable machine reason codes, separate metrics, correlated privacy-safe audit, alert thresholds.                                          |
| Dependency and integration risks | Yes               | Internal Payload and beta Supabase SSR behavior may drift; current public docs may not match the pin.                                                                    | High     | Likely over upgrades               | Verified package/version posture and exact-source differences.                  | Narrow adapters, exact version pin, source review, lockfile tests, staged upgrade gate.                                                  |
| Migration and upgrade risks      | Yes               | Provider changes to custom views, hidden routing, access operations, endpoint registration, or client serialization can reopen surfaces.                                 | High     | Likely over time                   | Exact-pin Root and endpoint behavior is implementation-specific.                | Snapshot route/operation inventory and run full conformance before each upgrade.                                                         |
| Other development hazards        | Yes               | TOCTOU between grant check and repair, cross-request memo leakage, duplicate grant activation, or a rollback-less command can cause unintended writes.                   | High     | Possible                           | Multi-stage authorization and provider operations are concurrent by nature.     | Transaction/expected revision, request-local storage, unique active-grant constraints, idempotency, postconditions, tested compensation. |

## 10. Required conformance suite

D30 is not shippable until the suite proves the public seams, not just helper
functions.

### Identity and principal

- valid Supabase session maps to one minimal principal without role, Tenant,
  capability, clearance, token, or Phase 12 result in serialized client props;
- missing, duplicate, renamed, or inactive Tenant mappings fail closed and do
  not create or rewrite data during authentication;
- concurrent requests for the same user in Tenant A and Tenant B do not mutate
  shared principal authority or leak cached decisions;
- Supabase absence, Supabase outage, Phase 12 outage, no capability, and no
  session produce distinct server reason codes and safe user messages; and
- offboarding or membership/epoch change removes access on the next request.

### Payload operation matrix

For two Tenants, at minimum test create, read, update, trash/delete,
`readVersions`, version-by-ID, restore, lock conflict, unlock, field read, field
update, and Admin admission through:

- Asym Web Studio UI/server functions;
- permitted REST endpoints;
- direct unknown/disallowed REST paths;
- GraphQL path after disablement;
- Local API with the typed adapter;
- attempted direct Local API call without explicit flags; and
- direct raw collection/global/custom-view URLs.

Each test must cover allowed same-scope, wrong Tenant, wrong Site, missing
capability, stale epoch, suspended principal, deleted/trashed resource, and
uniform not-found behavior where existence is protected.

### Provider-route inventory

- enumerate every generated collection, auth, version, upload, preference,
  custom, GraphQL, and Admin route for the exact pin;
- compare it with the checked-in allowlist snapshot;
- fail when an upgrade adds or changes a route/method;
- prove every disallowed route is unavailable in a production build; and
- record actual Web Studio network calls so required provider endpoints are
  explicit rather than guessed.

### Local API

- human reads and writes carry `req`, minimal `user`, and
  `overrideAccess:false`;
- writes carry `overrideLock:false` and respect expected revisions;
- nested writes share the intended transaction through `req`;
- every allowed override is named, scope-limited, audited, and absent from
  ordinary request code;
- service commands re-resolve authority at execution rather than trusting a
  queued actor snapshot; and
- lint/architecture tests reject direct Payload imports outside the boundary.

### Diagnostic grant

- fresh MFA is required even when an old session already reports `aal2`;
- grant scope is exactly one Tenant and, when required, one Site;
- a wrong Tenant/Site/resource, missing capability, stale epoch, expired grant,
  revoked grant, signed-out/revoked Supabase session, or unavailable audit sink
  fails closed;
- expiry is enforced without a cleanup worker and during a long-lived page;
- a second tab cannot reuse a grant from a different Supabase session;
- grant records and logs contain no raw token, cookie, session ID, MFA secret,
  or content body;
- no write endpoint accepts a read-only diagnostic grant; and
- each typed repair command proves preview, reauthorization, idempotency,
  concurrent-change refusal, terminal receipt, reconciliation, and rollback or
  compensation.

### Accessibility and UX

- keyboard-only entry, inspection, exit, and expiry recovery;
- screen-reader announcement of diagnostic entry, remaining-time warnings,
  expiry, denial, and revocation;
- no color-only scope or expiry indicator;
- exact Tenant/Site/environment persistently visible;
- back/forward, refresh, sleep/wake, and stale-tab behavior do not revive an
  expired grant; and
- error copy distinguishes retryable dependency problems from missing
  permission without revealing protected existence.

## 11. Ruthless synthesis and implementation order

### Must be fixed before D30 or any Phase 23 production authoring ships

1. **Create the single gateway contract.** Consume Supabase verified identity
   and current session plus the Phase 12 PDP; define typed allow/deny/error
   outcomes and request-scoped memoization.
2. **Replace the mutable Payload authority shadow.** Migrate to the
   authority-free Payload Principal Link and immutable Tenant mapping; remove
   auth-time Tenant/user role synchronization and default-Tenant behavior.
3. **Complete explicit access.** Define Admin, CRUD, `readVersions`, restore,
   unlock, and sensitive-field rules for every collection/global. Add structural
   Tenant/Site constraints and Phase 3/10 floors.
4. **Contain the Local API.** Route human operations through the actor port and
   non-interactive work through the narrower service-command port, both with
   explicit safe flags and transactions.
5. **Close provider surfaces.** Disable GraphQL, inventory and allowlist REST,
   remove unused auth routes, and make raw Admin unavailable in production.
6. **Prove adverse paths against the exact pin.** Especially versions, restore,
   direct custom views, `req.user` serialization, and two-Tenant concurrency.

### Build next as the production support path

7. **Build the read-only diagnostic grant and curated evidence surface.** Use
   exact scope, an open incident, fresh MFA, a 15-minute default and 60-minute
   hard maximum from first activation, current checks, visible context,
   bounded pre-expiry extension receipts, explicit exit, and fail-closed audit.
8. **Add only proven typed Repair commands outside diagnostics.** Each runs
   under its own current authorization and is previewed, idempotent,
   reconciled, and recoverable. No generic edit mode or diagnostic write path.
9. **Operationalize evidence.** Dashboards, alerts, mapping reconciliation,
   route-inventory drift, grant expiry/revocation, override use, and audit
   integrity become release gates.

### Monitor rather than overbuild

- diagnostic demand by reason, average duration, denial cause, and repair need;
- Phase 12/Supabase latency and request-memo effectiveness;
- direct-route probe volume and exact-pin upgrade drift;
- whether a distinct high-risk repair later warrants dual approval; and
- whether future Payload stable 4.x behavior permits removal of exact-pin
  workarounds after conformance, never before it.

Do not build a generic PAM product, arbitrary SQL console, second CMS role
designer, permanent cross-Tenant support role, universal two-person approval,
or custom auth protocol. None is necessary to solve D30 safely.

## Permanent architectural conclusions

1. Supabase Auth is the sole human identity and session authority.
2. Phase 12 is the sole staff/service authorization authority.
3. The Payload Principal Link is minimal, non-authoritative compatibility
   plumbing and never grants access.
4. Active Tenant/Site context is request-scoped and never stored as principal
   authority.
5. Tenant mappings are immutable-ID onboarding records, never slug-derived or
   auth-time-created.
6. Effective authorization remains server-only and request-memoized; it never
   enters `req.user` or client state.
7. Every Payload operation and sensitive field has explicit deny-by-default
   access, including Admin, versions, restore, and unlock.
8. User Local API calls always carry `req`, minimal `user`,
   `overrideAccess:false`, and mutation `overrideLock:false`.
9. Overrides exist only in named, scope-bounded, audited service commands.
10. GraphQL is disabled at launch, raw Payload Admin UI is unavailable in
    production, and broad generated REST/auth endpoints are not externally
    exposed. Only exact same-origin Web Studio operations and a governed
    diagnostic read view may be allowlisted and tested directly.
11. Tenant staff use Asym Web Studio only; direct provider routes never reveal
    a Payload login or stock Admin surface.
12. Production diagnostics are exact-scope, read-only, freshly stepped-up,
    short-lived, revocable, visibly bounded, and fully audited.
13. Repairs are typed owner-domain commands outside the diagnostic grant under
    their own current authorization, never an edit toggle or arbitrary
    provider/database access. D30 provides no raw-write lane.
14. Supabase logout and JWT expiry are not the diagnostic revocation model;
    current session, Phase 12, grant, expiry, and epoch are rechecked.
15. Privileged logs identify actor, scope, action, outcome, and reason without
    storing tokens, raw session IDs, secrets, or protected content.
16. Exact-pin route and access conformance is an upgrade gate, not optional
    regression coverage.

## Primary-source register

### Payload

- [Custom authentication strategies](https://payloadcms.com/docs/authentication/custom-strategies)
- [Authentication overview and generated operations](https://payloadcms.com/docs/authentication/overview)
- [Admin Panel overview](https://payloadcms.com/docs/admin/overview)
- [Access-control overview](https://payloadcms.com/docs/access-control/overview)
- [Collection access operations](https://payloadcms.com/docs/access-control/collections)
- [Local API overview](https://payloadcms.com/docs/local-api/overview)
- [Respecting access control in Local API](https://payloadcms.com/docs/local-api/access-control)
- [REST API overview](https://payloadcms.com/docs/rest-api/overview)
- [GraphQL overview](https://payloadcms.com/docs/graphql/overview)
- [Preventing production API abuse](https://payloadcms.com/docs/production/preventing-abuse)
- [Collection configuration](https://payloadcms.com/docs/configuration/collections)
- Exact-pin source:
  [`getAccessResults.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/auth/getAccessResults.ts),
  [`executeAccess.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/auth/executeAccess.ts),
  [`executeAuthStrategies.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/auth/executeAuthStrategies.ts),
  [`findVersions.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/collections/operations/findVersions.ts),
  [`restoreVersion.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/collections/operations/restoreVersion.ts),
  [`unlock.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/auth/operations/unlock.ts),
  [Local operations](https://github.com/payloadcms/payload/tree/1f9ae9a/packages/payload/src/collections/operations/local),
  [collection endpoints](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/collections/endpoints/index.ts),
  [auth endpoints](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/payload/src/auth/endpoints/index.ts),
  [`Root` view](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/next/src/views/Root/index.tsx),
  [`isCustomAdminView.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/next/src/utilities/isCustomAdminView.ts), and
  [`RootProvider`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/ui/src/providers/Root/index.tsx).

### Supabase

- [Server-side rendering overview](https://supabase.com/docs/guides/auth/server-side)
- [Creating an SSR client and choosing `getClaims`, `getUser`, or `getSession`](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Advanced SSR guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
- [User sessions](https://supabase.com/docs/guides/auth/sessions)
- [Multi-factor authentication](https://supabase.com/docs/guides/auth/auth-mfa)
- [`getAuthenticatorAssuranceLevel`](https://supabase.com/docs/reference/javascript/auth-mfa-getauthenticatorassurancelevel)
- [`reauthenticate`](https://supabase.com/docs/reference/javascript/auth-reauthenticate)
- [`signOut`](https://supabase.com/docs/reference/javascript/auth-signout)

### Security standards and authoritative guidance

- [NIST SP 800-63B-4 Session Management](https://pages.nist.gov/800-63-4/sp800-63b/session/)
- [NIST SP 800-53 Rev. 5 / Release 5.2.0 publication](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
- [NIST official SP 800-53 OSCAL catalog](https://github.com/usnistgov/oscal-content/blob/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
