# ADR-0174: Single staff access authority and governed engine diagnostics

**Status:** Accepted (founder-ratified Phase 23 D30 C-prime-R, 2026-08-24)

## Context

Phase 23 embeds Payload as a CMS engine while Supabase Auth and Asym already
own staff identity, Tenant membership, and authorization. Leaving the boundary
implicit would create two account lifecycles, shadow roles, unsafe Local API
defaults, cross-Tenant scope mistakes, raw provider routes, and a standing
operator escape hatch. Ordinary nonprofit staff also need Web Studio to feel
like one clear Asym product rather than a second CMS with unfamiliar
credentials and permissions.

Removing all production engine inspection would make uncommon provider-level
incidents unnecessarily slow to diagnose. Standing raw Payload Admin access,
however, would bypass the product's authority, privacy, and audit model. The
durable boundary is therefore one Asym staff authority for normal work plus one
rare, exact-scope, short-lived, read-only diagnostic lifecycle; every repair
remains an independently authorized typed Asym command.

## Decision

<!-- prettier-ignore -->
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

## Consequences

- Staff use one Supabase sign-in and one Asym Web Studio; Payload owns no
  parallel human account, recovery, MFA, role, or Tenant lifecycle.
- Phase 12 remains the sole permission brain. The Payload Principal Link is
  attribution-only, and Tenant/Site mappings are stable, provisioned, and
  non-defaulting.
- Human requests use the mandatory actor port; registered non-interactive work
  uses the narrower service-command port. Every bypass-capable operation is
  explicit, governed, and exact-pin tested.
- Raw Payload Admin, GraphQL at launch, broad generated APIs, and provider
  fallback are not ordinary staff surfaces and fail closed at direct routes.
- Staff always see exact organization and Site context, with distinct,
  accessible denial, expiry, revocation, outage, and request-access journeys.
- Support begins with minimized product receipts and bounded read-only
  **View as**. Engine Diagnostics requires an open incident, fresh current
  AAL2 proof, exact scope, a 15-minute default, a 60-minute hard maximum,
  minimum disclosure, and a durable ledger.
- Diagnostics has no mutation lane. Repairs run only as separately authorized,
  typed, idempotent Asym commands with their own receipts.
- Launch requires current-pin characterization, cross-Tenant and RLS matrices,
  direct-route and override inventories, concurrency and revocation faults,
  accessibility proof, production-shaped authorization tests, and a cutover
  that removes rather than unions legacy authority.

## Evidence

- [D30 exact formulation and decision brief](../prds/sitestacker-parity/research/phase-23-d30-staff-authorization-payload-diagnostics-decision-brief.md)
- [D30 primary-source and repository research](../prds/sitestacker-parity/research/phase-23-d30-staff-authorization-payload-diagnostics-primary-source-research.md)
- [D30 staff and operator UX benchmark](../prds/sitestacker-parity/research/phase-23-d30-staff-authorization-payload-diagnostics-ux-benchmark.md)
- [D30 complete 17-category, 34-risk adversarial review](../prds/sitestacker-parity/research/phase-23-d30-staff-authorization-payload-diagnostics-adversarial-review.md)

Ratification authorizes documentation only. It does not authorize code, schema,
RLS, data repair, migration/backfill, dependency or provider adoption, plugin
installation, issue or specification publication, Git publication, deployment,
production access, diagnostic activation, D1 activation, or release.
