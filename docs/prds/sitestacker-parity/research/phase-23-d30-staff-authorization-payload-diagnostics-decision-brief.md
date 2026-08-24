# Phase 23 D30 Staff Access Authority and Engine Diagnostics Decision Brief

**Status:** Founder-ratified exact C-prime-R on 2026-08-24 after primary-source
research, current repository inspection, complete staff/operator journey
design, and 17-category adversarial hardening. Ratification authorizes
documentation only.

**Date:** 2026-08-24

**Ratified:** 2026-08-24

## Decision to make

Choose the smallest complete Phase 23 boundary for staff authentication,
authorization, Payload integration, provider routes, and rare production
engine diagnosis without creating a second account system, a second permission
brain, an ambient cross-Tenant super-admin, or a developer console that tenant
staff must understand.

The founder initially selected for hardening:

> **Option C-prime — One Asym authority with governed engine diagnostics.**

The founder then ratified the complete exact 34-clause C-prime-R formulation
below as Phase 23 D30.

The selection is sound only as the exact C-prime-R formulation below.
Specifically, **one authority** does not mean copying every permission into a
Supabase JWT; **Payload user** does not mean a second staff account;
**diagnostics** does not mean impersonation or unrestricted raw administration;
and **read-only UI** does not mean read-only unless every server operation
enforces it.

This ratified decision does not reopen D1-D29 or Phase 12. Ratification
authorizes the required decision-log and ADR documentation only. It does not
authorize code, schema, RLS, data repair, migration/backfill,
dependency/provider adoption, plugin installation, issue or specification
publication, Git publication, deployment, production access, diagnostic
activation, D1 activation, or release.

Supporting documents:

- [Primary-source and repository research](./phase-23-d30-staff-authorization-payload-diagnostics-primary-source-research.md)
- [Complete staff and operator UX benchmark](./phase-23-d30-staff-authorization-payload-diagnostics-ux-benchmark.md)
- [Ruthless adversarial review](./phase-23-d30-staff-authorization-payload-diagnostics-adversarial-review.md)

## Why this decision is necessary

Phase 23 intentionally embeds Payload as a CMS engine while Asym remains the
product. That creates a dangerous seam if it is left implicit:

1. Payload requires an authenticated user shape and can expose an Admin Panel,
   REST, GraphQL, auth, version, access, and collection routes;
2. Payload Local API operations bypass access control by default, and its lock
   override also defaults to bypassing document locks;
3. the current Core adapter stores Tenant and role authority on a Payload user,
   creates or updates Tenant/user records during authentication, and uses
   explicit access overrides;
4. the current Web Studio route gate and collection rules are role/Tenant
   shaped rather than Phase 12 capability, Site, purpose, safety-floor, epoch,
   and exact-operation shaped; and
5. platform operators occasionally need deeper diagnostics, but standing raw
   administration would create a permanent insider-risk and support backdoor.

The permanent solution is one **Asym Staff Access Authority** with two explicit
layers: Supabase Auth is the sole human identity and session provider, and the
Phase 12 policy decision point is the sole permission authority. Payload
receives a non-authoritative principal link and a request-scoped authorization
context, enforces that decision at every provider seam, and never grants power
from its own role or user record. Ordinary staff use only the Asym-owned Web
Studio. Rare engine inspection uses a separately governed, incident-bound,
short-lived, read-only session. Repairs return to typed Asym commands.

## Settled authority preserved

1. **Supabase Auth** remains the only staff credential, authentication,
   session, logout, recovery, and step-up provider. D30 does not create a
   Payload password, token, API-key, or parallel staff-login lifecycle.
2. **Phase 12** remains the sole authorization policy decision point for human,
   support, operator, and service contexts. Its Active Tenant Assignment,
   capabilities, purpose, safety floor, scope, governance epoch, expiry,
   explanation, and audit contracts remain authoritative.
3. **Phase 3/10/11/12 safety floors** remain subtract-only and cannot be
   bypassed by a Payload role, provider route, diagnostic grant, service key,
   access override, or visible UI control.
4. **D1** remains the only Site Plan compiler, validator, activation, rollback,
   and public serving-head authority. Engine access cannot publish or alter a
   serving generation directly.
5. **D12** remains the acknowledged working-revision and recoverable-editor
   authority. Session expiry or revoked access cannot invent a second draft or
   replay unacknowledged edits.
6. **D21** remains recoverable Trash authority; permanent purge is a separate,
   stronger action with current reference, retention, hold, and capability
   checks.
7. **D24** owns exact public audiences. Public read is not staff, Preview,
   support, diagnostics, or provider-API authority.
8. **D25** owns private whole-Site candidate Preview. Preview requires its own
   current capability and exact candidate scope; an authenticated Payload user
   or public reader is insufficient.
9. **D29** owns governed content portability. REST/GraphQL or diagnostics do
   not become a hidden export/import lane.
10. **Phase 31** owns the future platform API. Payload-generated REST or
    GraphQL is never represented as that public contract.

## Evidence-led findings

- Payload officially supports custom authentication strategies and disabling
  its local strategy, so a Supabase-backed Payload Principal Link adapter does
  not require a second login.
- Payload documents that Local API access is skipped by default unless both a
  user and `overrideAccess: false` are supplied. Its Local API also documents
  `overrideLock: true` as the default. Safe actor operations therefore need a
  wrapper that makes both choices explicit rather than relying on reviewer
  memory.
- Payload dynamically generates REST/GraphQL and auth operations. The Admin
  Panel is its full HTTP layer; hiding a collection or navigation item is not
  route removal. Payload recommends disabling GraphQL when it is not needed.
- Payload's default access posture is authenticated-user shaped. Versioned
  collections add a separate `readVersions` access operation, and Admin access
  has its own callback. Missing callbacks cannot be allowed to silently become
  product policy.
- Supabase's current SSR guidance requires verified server-side claims and
  warns against trusting an unvalidated cookie session for protection. Current
  RLS guidance also warns that JWT authorization claims can be stale and that
  user metadata is user-editable; Phase 12 must therefore resolve live
  membership/capability state rather than copying it into a Payload role.
- Supabase sessions are not necessarily revoked at the instant a time-box or
  inactivity policy changes. Phase 12's governance epoch and per-operation
  reauthorization remain necessary for causal access revocation.
- OWASP recommends least privilege, deny-by-default behavior, permission checks
  on every request, safe failure, logging, and authorization tests. NIST and
  modern privileged-access systems support fresh authentication, explicit
  scope, justification, short duration, automatic expiry, and auditable
  just-in-time access.
- Current Core has useful foundations—Supabase custom Payload authentication,
  local-login disablement, an explicit `(payload)` route gate, tenant-scoped
  collection predicates, public/Preview reads with `overrideAccess: false`,
  and product-owned Web Studio views—but it is not yet the D30 contract.
- Current Core also has concrete hazards: login-time Tenant/user provisioning
  under `overrideAccess: true`, mutable slug linkage, a default Tenant, one
  Tenant and one role stored on a Payload user, role-shaped admin gating, a
  global `super_admin` bypass, raw REST/GraphQL route handlers, provider-view
  fallback flags, and incomplete direct-route/access-operation test coverage.

## Options considered

### A-prime — Remove production provider access entirely

**Reject as the complete answer.** This is the cleanest ordinary-staff posture,
and raw provider administration should indeed be absent for tenant staff. But a
total ban leaves platform engineers without a governed way to inspect an
engine-level incident. The likely result is ad hoc database consoles or
temporary code changes—less safe, less observable, and more operationally
expensive than one bounded read-only lane.

### B-prime — Keep platform-engineering raw Admin access

**Reject.** A separate platform role, standing access, or unrestricted stock
Admin makes Payload a second authority and creates an ambient cross-Tenant
escape hatch. Navigation hiding and a support policy cannot constrain direct
routes, APIs, Local API defaults, versions, or mutations.

### C-prime — One Asym authority with governed engine diagnostics

**Recommend only as the hardened C-prime-R below.** It preserves one login and
one permission brain, gives staff a coherent product UX, removes provider
surfaces from ordinary use, and keeps one rare incident-response lane without
turning diagnostics into another editor or generic privileged-access platform.

## Exact founder-ratified C-prime-R formulation

> **C-prime-amended-and-hardened (C-prime-R) — One Supabase-authenticated Asym
> Staff Access Authority with Phase 12 as the sole permission brain, a
> non-authoritative Payload Principal Link, an Asym-owned product-only Web
> Studio, deny-by-default provider and API boundaries, and one incident-bound,
> short-lived, read-only Engine Diagnostics Session; typed Asym commands own
> every repair.**
>
> 1. **One boundary and plain vocabulary.** The product calls the ordinary
>    experience **Web Studio**, the provider adapter record a **Payload
>    Principal Link**, rare operator inspection an **Engine Diagnostics
>    Session**, and a corrective product action a **Repair command**. Tenant
>    staff never need to understand Payload users, collections, access
>    overrides, JWTs, RLS, GraphQL, or service roles. “Admin” in a Payload API
>    is never presented as an Asym job title or permission.
> 2. **Identity and permission authority are explicit and singular.** Supabase
>    Auth is the sole authority for a human's immutable subject, credential,
>    authentication ceremony, session, sign-out, recovery, and authentication
>    assurance. Phase 12 is the sole authority for Active Tenant Assignment,
>    Tenant/Site/purpose scope, capabilities, delegation, safety floors,
>    governance epoch, expiry, decision explanation, and authorization audit.
>    Payload authenticates or authorizes nothing independently; it adapts and
>    enforces an Asym decision.
> 3. **No second human account lifecycle.** Local Payload password login,
>    password reset, first-user creation, registration, email verification,
>    API-key issuance, provider token refresh, and independent account editing
>    remain unavailable to staff and operators. One Asym sign-in and sign-out
>    governs Mission Control and Web Studio. A direct provider URL never falls
>    through to a Payload login form or asks for another credential.
> 4. **The Payload Principal Link is attribution plumbing, never a grant.** One
>    global link is keyed by the immutable Supabase subject and may carry only
>    the stable Payload record identifier plus non-authoritative display/email
>    snapshots needed for attribution, locks, preferences, and provider
>    compatibility. It stores no authoritative Tenant, Site, role, capability,
>    clearance, purpose, or operator eligibility. Staff cannot edit it. Email
>    or name changes reconcile without changing identity; suspension or
>    offboarding fences new actions while historical attribution remains inert
>    and readable only where separately authorized.
> 5. **Tenant and Site linkage is provisioned, stable, and non-defaulting.** Any
>    Payload-internal Tenant/Site mapping binds an immutable Asym identifier
>    through an idempotent onboarding/reconciliation command with uniqueness
>    and duplicate quarantine. Authentication never creates or repairs a
>    Tenant, maps by mutable slug, picks the first membership, writes a role, or
>    falls back to a demo/default Tenant. A missing, duplicate, stale, or
>    inactive link fails closed with a repairable operator state, not invented
>    access.
> 6. **One exact server-only authorization context per request.** After
>    verifying the Supabase identity, the server resolves the current Phase 12
>    context containing principal, Active Tenant Assignment, environment,
>    Tenant, Site, locale/object scope where relevant, purpose, exact operation,
>    capabilities/decision digest, composed safety floor, governance epoch, and
>    expiry. The full context and capability inventory never enter `req.user`,
>    browser props, URLs, client storage, logs, or shared caches. Payload's
>    minimal user shape identifies the actor; a server-only request context
>    carries the decision and exposes only safe action booleans to UI.
> 7. **Multi-organization context is deliberate and request-bound.** A person
>    with several assignments chooses an exact organization/Site; a deep link
>    may request but never silently switch it. Every request, tab, autosave,
>    upload, Preview, cache key, query, mutation, and background handoff proves
>    that exact context. Switching clears old-scope client/query/upload state
>    before rendering the new scope. Two tabs may use different legitimate
>    contexts without one mutable profile field or browser singleton changing
>    the other's authority.
> 8. **Capabilities enforce; labels and visibility only explain.** Phase 12
>    capabilities—not `staff`, `admin`, `super_admin`, collection membership,
>    route visibility, record ownership, or possession of an ID—authorize each
>    read and command. Payload `access.admin` adapts only the exact
>    `web_studio.enter`-style decision needed to render an allowed product
>    route; it is not a provider-admin grant. Create, read, update, delete,
>    version read/restore, unlock, Preview, release, export, purge, diagnostics,
>    and repair remain independently provable actions, with field and
>    relationship floors applied strictest-wins.
> 9. **Every entry point and access operation denies by default.** The central
>    policy covers product routes, direct provider routes, Admin server
>    functions, REST, GraphQL, Local API, hooks, relationship traversal,
>    versions, uploads, jobs, Realtime-triggered refetches, and generated auth
>    operations. Missing, expired, stale, wrong-purpose, wrong-environment,
>    wrong-Tenant, wrong-Site, or unrecognized operation context returns no
>    access. Every Supabase table exposed to `anon` or `authenticated` API
>    roles has RLS with stable exact scope predicates; Payload-private tables
>    are unreachable to those roles or use compatible RLS proved by tests. RLS
>    is structural enforcement, not a second policy brain, and never trusts
>    `user_metadata` or copied capability arrays. No
>    collection/global/auth/version operation inherits Payload's generic
>    `Boolean(user)` default as product policy.
> 10. **One safe actor Local API port.** Every human-initiated Payload read or
>     mutation goes through a typed Asym adapter that requires the authenticated
>     request, minimal actor user, server-only authorization context, exact
>     Tenant/Site predicates, `overrideAccess: false`, and the same transaction
>     request. Editorial writes additionally require `overrideLock: false`, an
>     expected D12 revision/lock proof, and commit-time epoch reauthorization.
>     The call cannot compile without these arguments; ad hoc Local API calls
>     from product handlers are forbidden.
> 11. **A separate, narrower service-command port.** Non-interactive release,
>     projection, reconciliation, and repair work uses a named Phase 12 service
>     principal and one registered command, never a staff user or diagnostics
>     session. Each invocation binds exact Tenant, Site, environment, purpose,
>     resource/version, operation, idempotency key, authorization epoch, and
>     mandatory scope predicates. Any necessary `overrideAccess: true`,
>     service-secret, table-owner, or `BYPASSRLS` mechanism is explicit inside
>     this port, justified in a reviewed registry, reauthorized before a
>     consequential commit, and incapable of serving a user-initiated call.
> 12. **Overrides are a governed exception inventory, not conventions.** CI
>     inventories every `overrideAccess`, `overrideLock`, `user`, `req`, direct
>     Payload Local API call, generated provider route, and privileged database
>     client. Actor calls must prove the safe port; service calls must name the
>     registry entry, command, predicates, reason, owner, tests, and audit.
>     Unknown or inline bypasses fail architecture checks. Exact Core Payload
>     pin tests qualify `access.admin`, version access, route resolution,
>     serialization, Local API defaults, and lock behavior before every
>     provider upgrade.
> 13. **Ordinary staff receive only the Asym-owned product surface.** The
>     production staff route allowlist contains Web Studio product pages and
>     required same-origin product operations—never the raw dashboard,
>     collection/global CRUD screens, CMS-user/account screens, first-user or
>     password flows, access inspector, version browser outside product UX,
>     GraphQL playground, or arbitrary plugin/custom views. Direct or guessed
>     provider routes return a product-owned safe destination or
>     existence-safe not-available response. Hiding navigation is only UX; the
>     server route and operation gates are enforcement.
> 14. **Fallbacks cannot reopen the provider.** A Web Studio feature flag,
>     component error, import-map failure, unavailable native page, or rollback
>     may select an explicitly approved prior Asym surface or a truthful
>     unavailable state. It never reveals stock Payload UI, broadens a route
>     allowlist, changes the authorization source, or converts a product outage
>     into raw provider access.
> 15. **Provider APIs are private implementation seams.** GraphQL and its
>     playground are disabled at launch because D30 has no qualified consumer.
>     Payload's broad generated REST surface and auth/access endpoints are not
>     externally exposed; only exact same-origin operations needed by Web
>     Studio may pass through an Asym route/command allowlist with verified
>     context, origin/CSRF protection, bounded depth/select/pagination/upload,
>     rate and abuse controls, and response projections. They are not Phase 31,
>     not supported tenant integrations, and cannot be used for D29 bulk
>     portability.
> 16. **Public read, Preview, Trash, and purge never collapse.** D24 public read
>     can return only the active public projection. D25 Preview requires its
>     separate exact-candidate capability and context. D21 restore remains
>     recoverable lifecycle work. Permanent purge requires a stronger fresh
>     capability, reference/hold/retention proof, explicit consequence review,
>     and typed command. Authentication, diagnostics, or provider access grants
>     none of them.
> 17. **One-login entry is calm and explicit.** From Mission Control or a safe
>     same-origin deep link, staff enter Web Studio with their existing
>     Supabase session. Before any mutation, the shell identifies the active
>     organization, Site, and environment. One eligible Site opens directly;
>     several eligible Sites produce a short, accessible chooser. Safe return
>     routes carry no grant token or protected state, and authenticated
>     responses are never shared/publicly cached.
> 18. **The interface explains usable access without exposing machinery.** Hide
>     an entire area when it is irrelevant; keep a normally expected but
>     unavailable action visible only when its explanation helps complete the
>     workflow. **My access** and **Request access** use plain actions and exact
>     organization/Site scope, never role picking or capability keys. Approval
>     does not auto-replay the denied content action. Tenant access management
>     stays in Phase 12 rather than becoming a second CMS permission screen.
> 19. **Denial states are safe and actionable.** The UI distinguishes **Your
>     session ended**, **Web Studio is not in your current access**, **You
>     cannot do that action**, **Page not available**, **Your access changed**,
>     and **We cannot verify access right now**. Missing and non-disclosable
>     cross-Tenant resources share one neutral state. Each screen names the
>     active safe context, truthful saved/mutation outcome, one next action,
>     and an optional privacy-safe correlation code; it never prints provider
>     errors or suggests retrying a real denial.
> 20. **Expiry and revocation preserve truth, not authority.** A known session
>     expiry receives one quiet warning and an accessible **Stay signed in**
>     path. If identity, assignment, capability, safety floor, or epoch changes,
>     new saves/uploads stop; optimistic success rolls back; the UI names the
>     last server-acknowledged D12 revision; protected queues/caches clear; and
>     only D12-approved bounded recovery remains. Reauthentication can restore
>     identity but never a revoked grant, and stale mutations are not replayed.
> 21. **Support starts with product evidence, not privileged access.** Staff
>     share a privacy-safe support receipt with organization/Site, product
>     route, action, time, saved-work state, denial/outage class, and
>     correlation identifier—never tokens or protected body content. Support
>     first uses Asym diagnostics and Phase 12's audited, read-only **View as**
>     projection under the lesser of support and target access. View-as never
>     impersonates identity, mutates, switches Tenant silently, or unlocks
>     provider routes.
> 22. **There is one bounded Engine Diagnostics lane.** It is an Asym-owned,
>     operator-only, read-only route set used only when product diagnostics
>     cannot answer an open incident. It is neither the complete stock Payload
>     Admin nor another content editor. It may reuse an exact-pin-qualified
>     provider read view only behind the same central route allowlist,
>     field/scope projection, and server-enforced mutation denial. There is no
>     standing raw-admin role, shared break-glass account, impersonation, or
>     discoverable tenant navigation entry.
> 23. **A diagnostic request is exact and justified.** The requester must hold
>     a separately registered Phase 12 operator capability and bind an open
>     incident, immutable actual operator, exact environment/Tenant/Site,
>     allowlisted diagnostic operation family, plain-language question,
>     sensitivity classification, and requested duration. Wildcards, “all
>     tenants,” freehand Tenant IDs, copied grant URLs, vague “debugging,” and
>     role-name eligibility are rejected. Restricted/safeguarded projections
>     retain every existing floor and any policy-required independent approval.
> 24. **Activation uses the same identity with fresh strong assurance.** The
>     operator reauthenticates through Supabase Auth and satisfies Phase 12's
>     current operator-assurance policy; Payload credentials cannot satisfy it.
>     Activation completes a new supported MFA challenge/verification, records
>     its successful time server-side, and requires a current Supabase `aal2`
>     session; an older `aal2` claim alone is insufficient. Phase 12 may raise
>     that floor to a qualified
>     phishing-resistant method when stable provider support and recovery have
>     been proved; D30 does not make Supabase's current experimental passkey API
>     a production dependency. The launch default is 15 minutes, with a
>     60-minute hard maximum measured from first activation, server-enforced
>     expiry, no automatic renewal, and no client-controlled duration. Standard
>     read-only activation needs no universal second-person ceremony; higher
>     sensitivity follows the existing safety policy.
> 25. **Diagnostic disclosure is minimum necessary.** Start with health,
>     configuration identity, schema/adapter version, release linkage, query
>     shape, counts, digests, and safe metadata. Content fields, historical
>     versions, media, identities, and relationships appear only when the exact
>     incident purpose, operator capability, projection, and safety floor admit
>     them. Bulk browse/export/download, secrets, credentials, signed URLs,
>     restricted-worker existence, and unrelated Tenant/Site navigation are
>     unavailable. Every request revalidates scope; URL possession grants
>     nothing.
> 26. **The elevated mode is impossible to overlook or retain accidentally.**
>     Before start, the UI summarizes organization, Site, environment,
>     read-only mode, purpose, incident, and expiry. Every diagnostic route has
>     a persistent accessible banner with those facts, meaningful countdown
>     updates, and a keyboard/mobile-reachable **Exit**. Duplicate tabs share
>     the same grant. Extension re-proves the open incident, capability, floor,
>     and remaining hard maximum and writes a new receipt; expiry, exit,
>     incident closure, capability revocation, or sign-out fences every tab,
>     stream, poll, cache, and copied URL.
> 27. **Diagnostics can never repair by mutation.** UI, REST, GraphQL, Local
>     API, server functions, hooks, and direct-route tests deny create, update,
>     delete, restore, unlock, publish, purge, upload, and configuration change
>     under a diagnostic grant. A discovered defect returns to an Asym-owned
>     typed Repair command with exact targets/preconditions, dry-run or
>     before/after explanation, current capability, commit-time
>     reauthorization, idempotency, bounded blast radius, transaction or
>     compensation, rollback, validation, and receipt. Any future raw-write
>     emergency lane requires a separate founder decision; D30 does not leave
>     a hidden toggle for it.
> 28. **Audit is durable, attributable, minimized, and visible to the right
>     people.** The authoritative ledger records authentication/authorization
>     outcome classes, actual/effective actor separation, diagnostic request,
>     grant/denial, scope, reason, incident, start, allowlisted read operation
>     class/target, extension, mutation attempt, exit, expiry, revocation,
>     typed repair reference, and closure. It records no credential, cookie,
>     raw token, full claims, or unnecessary content. A diagnostic read is not
>     returned unless its ledger append succeeds; an external telemetry-sink
>     outage may queue from that ledger without losing evidence. Tenant access
>     administrators receive a quiet current/recent support-access receipt when
>     policy permits, without operational or protected-content leakage.
> 29. **Failure is closed and differentiated.** Invalid identity, missing
>     mapping, unavailable Phase 12 resolution, stale epoch, database failure,
>     audit-ledger failure, route-policy mismatch, or diagnostics expiry never
>     falls back to a Payload role, cached allow, default Tenant, stock UI, raw
>     API, or service credential. Staff see an outage rather than a false
>     denial; operators return to the incident with a correlation receipt. The
>     last valid public D1 generation remains independently servable, and no
>     protected mutation claims success without its durable commit/audit proof.
> 30. **Observability detects authority drift without collecting content.**
>     Monitor authorization latency/error/deny classes, cross-Tenant/Site
>     attempts, stale epochs, duplicate/missing Principal Links and Tenant
>     mappings, direct raw-route probes, override-registry drift, actor-port
>     violations, diagnostic grants/expiry/extensions/post-expiry use,
>     mutation attempts, orphan grants, audit-ledger health, and exact-pin
>     conformance. Alerts group expected user denials and protect identifiers;
>     they escalate scope leakage, bypasses, failed revocation, or active grants
>     without open incidents.
> 31. **Performance optimizes computation, never scope.** Resolve and memoize
>     Phase 12 once per request/context where possible; compile capabilities
>     into bounded action booleans and exact Payload `Where` constraints; index
>     immutable principal, Tenant/Site, mapping, grant-expiry, incident, and
>     audit-correlation fields; and select minimum fields/depth. No
>     cross-request allow cache, global mutable Tenant, full capability payload
>     in browser cookies, per-field network resolver loop, or unrestricted
>     diagnostic query is permitted. Revocation and context switching evict all
>     affected product caches.
> 32. **Cutover removes, rather than synchronizes, the old authority.** Before
>     enabling D30, inventory every route/call as public, actor, service,
>     support, or diagnostic; provision stable links; quarantine duplicates and
>     default/slug-linked mappings; remove role/Tenant authority from Payload
>     users; replace global `super_admin` bypass; gate generated routes; and
>     convert calls through the two ports. A comparison phase may log old/new
>     decisions but never unions them or widens live access. Each product
>     surface cuts over only when direct-route, API, version, and rollback
>     tests prove that Phase 12 is its only brain; fallback cannot restore the
>     legacy path.
> 33. **Launch requires authorization, failure, exact-pin, accessibility, and
>     human proof.** Automated matrices cover every principal/context/action,
>     Tenant/Site pair, direct URL, REST/GraphQL/local call, relationship,
>     version, field, Preview/public/purge split, service command, missing/stale
>     context, two-tab switch, revocation race, session refresh, diagnostics
>     lifecycle, copied URL, mutation probe, outage, and audit failure. Static
>     architecture tests enforce the override/route registry. Exact-pin
>     contract tests precede Payload upgrades. Representative ministry staff,
>     access administrators, support, operators, keyboard-only, screen-reader,
>     mobile, zoom, and low-confidence users must complete the benchmark
>     journeys with zero second logins, provider leakage, wrong-Site actions,
>     cross-Tenant disclosure, or diagnostic mutation.
> 34. **Explicit non-goals keep this bounded.** D30 does not build a general IAM
>     product, duplicate Phase 12, put fine-grained capability arrays into
>     Supabase JWTs, expose Payload as Phase 31, create a universal operator
>     SQL console, add a raw-write break-glass lane, replace D12 locks, replace
>     D21 Trash, replace D25 Preview, or create another audit system. It adds
>     one Payload Principal Link adapter, one authorization-enforcement
>     boundary, one actor port, one service port, one product route policy, and
>     one rare read-only diagnostics lifecycle because each removes an existing
>     ambiguity rather than adding speculative flexibility.

## Ruthless synthesis

### Ratified contract and future implementation prerequisites

1. Treat the ratified authority vocabulary and Supabase Auth / Phase 12 /
   Payload split as fixed; implementation must not resume translating mutable
   roles between systems.
2. Make the Principal Link globally stable and authority-free, and make
   Tenant/Site mappings provisioned rather than login-created.
3. Define the server-only authorization context and the actor/service ports
   before converting individual collections or screens.
4. Inventory every provider route and bypass-capable call, then make unknown
   routes/calls fail closed.
5. Freeze the diagnostics lane as incident-bound and read-only; repairs use
   typed commands.

### Implementation order after future authorization and prerequisites

1. Build exact-pin characterization tests, the call/route inventory, and
   cross-Tenant/direct-route test matrices around current behavior.
2. Establish Principal Link/mapping invariants and the request-scoped Phase 12
   adapter without granting through Payload fields.
3. Introduce the mandatory actor and service ports, then migrate one narrow
   end-to-end Web Studio behavior as a tracer bullet.
4. Enforce the product route/API allowlist, disable unneeded GraphQL/provider
   auth routes, and remove unsafe native fallbacks before widening page
   adoption.
5. Implement staff entry, scope switching, denial, request-access, expiry, and
   changed-access journeys with accessibility and fault-injection proof.
6. Add product diagnostics and read-only View as, then implement the governed
   Engine Diagnostics lifecycle with durable audit and no mutation path.
7. Remove legacy role/Tenant authority and global bypasses only after each
   migrated surface proves single-authority behavior and rollback cannot reopen
   them.

### Address soon, without blocking the authority spine

- tune safe query/index/memoization behavior from production-shaped load tests;
- refine tenant support-access receipt and incident communication policy with
  privacy/legal review; and
- add certified provider-read views only for incident questions that product
  diagnostics cannot answer—never in anticipation of hypothetical needs.

### Monitor continuously

- provider pin/default changes;
- mapping duplicates or reconciliation lag;
- raw-route and cross-scope attempts;
- authorization latency and stale-epoch denials;
- diagnostics duration, extensions, and mutation probes;
- audit-ledger delivery; and
- user confusion, repeated access requests, and support escalation reasons.

## Verdict

**Proceed with C-prime only as this founder-ratified C-prime-R.** It is architecturally
sound because it does not synchronize two authorities: it removes Payload-local
authority from the product model. It is proportionate because ordinary staff
receive one calm Web Studio and operators receive only one narrow read-only
incident tool. It is maintainable because actor, service, product-route, and
diagnostic seams are explicit and exact-pin tested. The exact formulation is
ratified as Phase 23 D30; implementation remains separately unauthorized.

## Ratification record

The founder ratified the complete quoted 34-clause formulation above as Phase
23 D30 on 2026-08-24. It is recorded in the
[Phase 23 decision log](../phase-23-web-studio-cms-decision-log.md) and
[ADR-0174](../../../adr/0174-single-staff-access-authority-and-governed-engine-diagnostics.md).
The supporting research, UX benchmark, and adversarial review explain but do
not independently expand that authority.

Ratification authorizes documentation only. It does not authorize code, schema,
RLS, data repair, migration/backfill, dependency or provider adoption, plugin
installation, issue or specification publication, Git publication, deployment,
production access, diagnostic activation, D1 activation, or release. Root
`CONTEXT.md` synchronization remains held until the Phase 22 documentation
stack is merged or Phase 23 becomes an explicit reviewed stack.
