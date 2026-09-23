# Phase 23 D30 Staff Access Authority and Engine Diagnostics Ruthless Adversarial Review

**Status:** Complete hardening review supporting the founder-ratified Phase 23
D30 C-prime-R decision. Ratification authorizes no implementation, code,
schema/RLS, data repair, migration/backfill, dependency/provider adoption,
issue or specification publication, Git publication, deployment, diagnostic
activation, production access, D1 activation, or release.

**Date:** 2026-08-24

**Ratified:** 2026-08-24

## Reviewed proposition

> **Option C-prime — One Asym authority with governed engine diagnostics.**

The review tested the option against:

- ratified Phase 23 D1-D29 and Phase 3/10/12 owner boundaries;
- the current Core Supabase/Payload authentication adapter, collection access,
  raw routes, provider shell, public/Preview readers, feature flags, and tests;
- the exact Core Payload pin and current Payload documentation for custom auth,
  access, Local API defaults, locks, Admin routes, APIs, and versions;
- current Supabase SSR, claims, RLS, MFA, and session guidance;
- OWASP authorization/session/logging guidance, NIST 800-63B session and
  reauthentication guidance, modern just-in-time privileged-access patterns,
  and WCAG 2.2; and
- realistic use by single-Site and multi-organization ministry staff, access
  administrators, support specialists, and production platform operators.

Supporting evidence:

- [D30 decision brief](./phase-23-d30-staff-authorization-payload-diagnostics-decision-brief.md)
- [Primary-source and repository research](./phase-23-d30-staff-authorization-payload-diagnostics-primary-source-research.md)
- [Staff and operator UX benchmark](./phase-23-d30-staff-authorization-payload-diagnostics-ux-benchmark.md)

## Rating method

Severity describes plausible impact before the permanent prevention:

- **Critical:** cross-Tenant/private disclosure, unauthorized production
  mutation, identity/authorization bypass, or broad privileged compromise.
- **High:** wrong-Site access, sustained authorization failure, misleading
  success, lost edits, unbounded operator access, or expensive recovery.
- **Medium:** bounded staff confusion, support burden, delayed diagnosis, or
  repairable performance/maintenance degradation.
- **Low:** minor inconvenience with an obvious safe recovery.

Likelihood is **Certain**, **Likely**, **Possible**, or **Unlikely** under a
naive role-sync/raw-Admin implementation or foreseeable evolution. Every
category contains a material concern. That is not a claim that the hardened
architecture is unsafe; it reflects that this boundary crosses identity,
authorization, multi-Tenancy, provider defaults, privileged operations, and
human recovery. The C-prime-R removes or contains each concern without building
a generic IAM or privileged-access platform.

## 1. Brittleness

**Material concern: Yes.**

### B1 — Provider defaults or routes drift under an upgrade

- **What could go wrong:** A Payload upgrade changes Admin route resolution,
  serialized user shape, default access, version access, Local API override,
  lock, or generated endpoint behavior. A route or operation that was assumed
  private becomes reachable or bypasses the Asym context.
- **Why it matters:** One dependency change can silently reopen a provider
  surface or cross-Tenant read/write path.
- **Severity / likelihood:** **Critical / Likely over time.**
- **Evidence / reasoning:** Core uses an internal Payload 4 pin. Payload
  documents access-bypass and lock-bypass defaults, separate `readVersions`,
  generated APIs, and Admin-level routes. These are provider contracts, not
  stable Asym product invariants.
- **Permanent prevention:** Central product route/call policies plus exact-pin
  characterization tests for Admin access, serialization, versions, Local API
  defaults, locks, and generated routes. Block upgrades until the same contract
  passes on the candidate pin.

### B2 — Mutable identity or Tenant facts become request authority

- **What could go wrong:** Email, role, slug, first membership, a single stored
  Tenant, or a browser-global selected organization is stale or changes while a
  request/tab remains active.
- **Why it matters:** Staff can be routed to the wrong Tenant/Site, lose valid
  multi-organization access, or retain revoked access.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Current Core maps Tenants by slug, stores one
  `tenantId` and role on `CmsUsers`, and may use a default Tenant. Phase 12
  explicitly requires one current Active Tenant Assignment per context.
- **Permanent prevention:** Immutable Supabase subject, provisioned immutable
  Tenant/Site mapping, authority-free Principal Link, and exact server-resolved
  context on every request/tab with no defaulting.

## 2. Technical debt

**Material concern: Yes.**

### T1 — Synchronizing Payload roles creates a second permission system

- **What could go wrong:** Developers keep role/Tenant/capability fields on the
  Payload user “in sync” with Phase 12 and later add access checks against those
  convenient fields.
- **Why it matters:** Revocation timing, multi-organization membership, safety
  floors, explanation, and audits diverge; every permission change requires
  two migrations and two test matrices.
- **Severity / likelihood:** **High / Likely without a hard contract.**
- **Evidence / reasoning:** The current adapter already derives and persists a
  Payload role and Tenant. Phase 12 says capability names enforce and role names
  never authorize.
- **Permanent prevention:** Make the Principal Link incapable of storing
  authority, resolve Phase 12 server-side, and test/lint against access checks
  that read Payload role/Tenant fields.

### T2 — Scattered “careful” Local API calls become permanent review debt

- **What could go wrong:** Each endpoint remembers a different combination of
  `user`, `req`, `overrideAccess`, `overrideLock`, scope predicates, transaction,
  and epoch checks.
- **Why it matters:** The code works until one new handler omits one option; a
  reviewer must rediscover security semantics on every change.
- **Severity / likelihood:** **Critical / Likely.**
- **Evidence / reasoning:** Payload defaults access and lock overrides to true.
  Current Core already mixes explicit-false public/Preview reads with explicit-
  true auth/provisioning and validation reads.
- **Permanent prevention:** One typed actor port and one separately typed
  service-command port; direct product calls fail architecture checks.

## 3. Edge cases

**Material concern: Yes.**

### E1 — Multi-organization deep links and parallel tabs cross contexts

- **What could go wrong:** A deep link silently switches organization, a
  singleton client changes Tenant for both tabs, or old query/autosave/upload
  state renders beneath new Site chrome.
- **Why it matters:** A valid user can make a wrong-Site mutation without ever
  crossing the legal Tenant boundary, which is still a serious ministry-brand
  and privacy failure.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Phase 12 expects people with multiple assignments;
  current Payload user state holds only one Tenant. SPA caches and optimistic
  state commonly outlive navigation unless explicitly scoped.
- **Permanent prevention:** Deliberate context-switch interstitial, exact
  per-request context, Tenant/Site-keyed caches, old-context clearing before
  render, D12 unsaved-work handling, and two-tab adversarial tests.

### E2 — Identity resumes while authorization does not

- **What could go wrong:** A session refresh or reauthentication succeeds after
  the person's assignment/capability was revoked, the Principal Link is
  missing, or the authorization service is unavailable.
- **Why it matters:** Treating successful sign-in as restored access can replay
  stale edits; treating an outage as denial sends users into needless access
  requests.
- **Severity / likelihood:** **High / Likely over a product lifetime.**
- **Evidence / reasoning:** Supabase identity/session state and Phase 12 grants
  are intentionally separate. JWT/session changes are not all instantaneous.
- **Permanent prevention:** Re-resolve assignment/epoch after every refresh or
  step-up, distinguish revoked/outage/mapping states, stop mutations, and name
  the last acknowledged revision.

## 4. Footguns

**Material concern: Yes.**

### F1 — Payload's safe-looking defaults bypass access and locks

- **What could go wrong:** A developer calls Local API without
  `overrideAccess: false` or assumes an authenticated `user` is enough; an edit
  ignores another editor's lock because `overrideLock` remains true.
- **Why it matters:** One ordinary omission becomes unauthorized mutation or
  lost work.
- **Severity / likelihood:** **Critical / Likely without enforced wrappers.**
- **Evidence / reasoning:** Both defaults are documented by Payload. The
  current code has explicit overrides, proving the seam is live.
- **Permanent prevention:** Required actor port arguments, safe defaults inside
  that port, lint/architecture checks, and negative direct-call tests.

### F2 — Navigation hiding, native fallback, or guessed URLs expose provider UI

- **What could go wrong:** Staff paste a collection URL, an error falls back to
  a stock view, or a feature flag disables the product screen and reveals raw
  Payload CRUD.
- **Why it matters:** Staff see confusing machinery and may gain actions not
  represented by the product workflow.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Current feature flags can select native provider
  UI; the custom Nav is added before Payload's nav, and generated routes remain.
  Payload access-driven hiding is not route removal.
- **Permanent prevention:** Server-enforced product route allowlist and
  product-only fallback contract; direct routes return safe product states.

## 5. Tenant safety

**Material concern: Yes.**

### TS1 — Ambient super-admin or service credentials erase structural scope

- **What could go wrong:** A global `super_admin`, `overrideAccess: true`,
  service secret, table owner, or `BYPASSRLS` path reads/writes any Tenant and
  treats the operator-supplied Tenant parameter as trustworthy.
- **Why it matters:** A typo, crafted request, or compromised operator account
  becomes a cross-Tenant incident, potentially exposing restricted workers.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Current tenant access grants `super_admin` a global
  true result; service mechanisms can bypass RLS. Phase 12 forbids ambient
  cross-Tenant god mode.
- **Permanent prevention:** Eliminate global human bypass; use exact
  operator/service contexts, server-derived scope, mandatory predicates,
  current epoch/capability proof, and cross-Tenant substitution tests.

### TS2 — Versions, relationships, errors, and caches leak outside the main row

- **What could go wrong:** The current document query is scoped, but version
  history, relation population, counts, search/autocomplete, errors, autosave,
  preferences, or cached access results reveal another Tenant/Site.
- **Why it matters:** Hidden metadata can disclose identities or content even
  when the main collection test passes.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Payload exposes separate version access and
  relationship depth; Phase 23 contains Pages, media, search, locales, and
  revisions whose scopes must remain aligned.
- **Permanent prevention:** Exact Tenant+Site constraints at every projection
  and traversal, explicit version access, minimum selects/depth, scoped cache
  keys, existence-safe errors, and a full surface matrix—not one collection
  read test.

## 6. Overengineering

**Material concern: Yes.**

### O1 — D30 turns into a generic privileged-access-management platform

- **What could go wrong:** The team builds entitlement DSLs, arbitrary approval
  graphs, generic role activation, screen recording, database proxying, and a
  universal operator console before one real CMS incident requires them.
- **Why it matters:** Delivery slows, support must operate another product, and
  speculative complexity becomes the very privileged surface being secured.
- **Severity / likelihood:** **High / Possible under “govern everything.”**
- **Evidence / reasoning:** Modern PIM products are broad because they govern
  many infrastructure products; D30 has one CMS engine and Phase 12 already
  owns policy, assurance, scope, and audit.
- **Permanent prevention:** Reuse Phase 12; implement one incident-bound,
  short-lived read-only diagnostics lifecycle and typed repairs. No raw-write
  lane or generic entitlement editor.

### O2 — Duplicating authorization into Payload, JWTs, and fine-grained RLS

- **What could go wrong:** The same capability graph is encoded in Supabase JWT
  claims, RLS policies, Payload roles/access callbacks, and application code.
- **Why it matters:** Four evaluators drift and stale claims grow cookies;
  diagnosing a denial becomes impossible for staff and support.
- **Severity / likelihood:** **High / Likely if “defense in depth” is
  misapplied.**
- **Evidence / reasoning:** Supabase warns JWT claims can be stale and cookie
  size is bounded. Phase 12 already owns the sole PDP; coarse RLS remains a
  Tenant backstop.
- **Permanent prevention:** Identity claims identify; Phase 12 decides; Payload
  enforces; RLS supplies coarse structural defense. Store safe decision digests
  and booleans, not another permission language.

## 7. UX/UI and user friction

**Material concern: Yes.**

### UX1 — Provider concepts and a second login destroy confidence

- **What could go wrong:** Staff see a Payload login, role, collection name,
  generic 403, raw error, or ambiguous Tenant selector and cannot tell whether
  they are in Asym, whether content is safe, or whom to ask.
- **Why it matters:** Nonprofit staff abandon tasks, request overly broad
  access, or fear they lost content. Small teams cannot sustain specialist CMS
  training.
- **Severity / likelihood:** **High / Likely under raw Admin.**
- **Evidence / reasoning:** Payload's Admin is provider-centric; the repository
  already invests in an Asym-owned Web Studio. WCAG requires predictable,
  consistently identified, accessible interactions.
- **Permanent prevention:** One-login product entry, explicit organization/Site,
  human action labels, capability-aware discoverability, My access/Request
  access, safe deep links, and zero provider jargon in staff journeys.

### UX2 — Expiry, revocation, outage, and diagnostic mode look alike

- **What could go wrong:** A user retries a true denial, requests access during
  an outage, loses unsaved work after expiry, or an operator forgets they are
  inspecting production because elevated mode is subtle.
- **Why it matters:** Incorrect recovery increases support volume and can cause
  wrong-Site work or unnecessary privilege grants.
- **Severity / likelihood:** **High / Likely without designed states.**
- **Evidence / reasoning:** Identity, authorization, resource visibility,
  optimistic editing, and provider availability have different causes. NIST
  recommends expiry warnings and clear recovery; WCAG requires status and
  error communication.
- **Permanent prevention:** The six-answer screen invariant, distinct denial
  taxonomy, exact last-saved status, accessible warnings, persistent diagnostic
  scope/expiry banner, and one clear next action per state.

## 8. Hidden coupling

**Material concern: Yes.**

### HC1 — Full authorization state is coupled to Payload `req.user`

- **What could go wrong:** Capabilities, Tenant scope, clearance, or an opaque
  privileged token are appended to `req.user` for convenience and then
  serialized into client configuration or cached provider state.
- **Why it matters:** Sensitive policy state leaks to the browser and becomes
  stale or client-trusted.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Current Payload layout passes `req.user` into
  client/provider configuration. Payload's user shape serves UI and API needs,
  not Asym's complete EffectiveAccess contract.
- **Permanent prevention:** Minimal authority-free user shape plus server-only
  request context; expose only safe action booleans and test serialized output.

### HC2 — Product availability is coupled to raw Admin internals

- **What could go wrong:** Web Studio routes, import maps, server functions, or
  feature flags depend on stock Admin views so closely that disabling raw Admin
  also breaks the product—or rollback requires reopening it.
- **Why it matters:** Security fixes become operationally impossible and every
  Payload upgrade threatens the product shell.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Current Web Studio runs under the `(payload)` route
  group and Payload providers, while feature flags can choose native views.
- **Permanent prevention:** Explicit product route contract over the provider
  engine, allowlisted server functions, product-safe fallback, exact-pin tests,
  and incremental surface adoption with no authority fallback.

## 9. Failure modes

**Material concern: Yes.**

### FM1 — Authorization failure falls back to stale allow or stock provider

- **What could go wrong:** Phase 12, mapping, or database resolution times out;
  the app reuses a cached role/decision, default Tenant, last successful user,
  or provider access callback to stay “available.”
- **Why it matters:** Availability logic becomes an authorization bypass.
- **Severity / likelihood:** **Critical / Possible during incidents.**
- **Evidence / reasoning:** The current adapter has default-Tenant and persisted
  role/Tenant seams. OWASP requires safe failure and deny by default.
- **Permanent prevention:** Fail closed for protected work, distinguish outage
  from denial, preserve only allowed recovery state, and keep the last active
  D1 public generation independently available.

### FM2 — Diagnostics or repair outlives its evidence

- **What could go wrong:** Audit append fails, incident closes, expiry occurs
  during a read, an extension races expiry, or a partial raw repair succeeds
  without a receipt.
- **Why it matters:** Privileged access becomes unprovable, orphaned, or
  destructive.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Browser timers are not enforcement; external log
  sinks fail; raw provider writes do not encode D1/D12 invariants.
- **Permanent prevention:** Server-enforced grant, durable local audit append
  before returning diagnostic data, transactional revoke-on-close, no revival
  after expiry, and typed idempotent repair commands with rollback/validation.

## 10. Data integrity risks

**Material concern: Yes.**

### DI1 — Login-time provisioning creates duplicate or wrong mappings

- **What could go wrong:** Concurrent logins race, mutable slugs collide, a
  default Tenant is selected, or partial user/Tenant writes leave duplicate
  Principal Links and ambiguous attribution.
- **Why it matters:** Future requests can resolve to different Tenants or fail
  unpredictably; cleanup becomes risky once content references the records.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Current auth strategy performs find/create/update
  operations with access overrides and slug lookup during authentication.
- **Permanent prevention:** Provision immutable mappings through an idempotent
  command, enforce uniqueness, quarantine duplicates, and make login read-only
  with a repairable missing-link state.

### DI2 — Offboarding or descriptive updates corrupt attribution

- **What could go wrong:** Deleting a Payload user cascades or nulls historical
  authorship; changing email creates a second user; stale role/Tenant fields
  continue to influence old documents.
- **Why it matters:** Editorial audit and responsibility records become
  incorrect even if live access is revoked.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Payload documents reference authenticated user
  records for attribution and preferences. Human identity attributes are
  mutable while the Supabase subject is stable.
- **Permanent prevention:** Stable non-deletable/inert Principal Link for
  history, mutable display snapshots, no authority fields, explicit succession
  policy, and tests for offboarding/rename/merge scenarios.

## 11. Security and privacy risks

**Material concern: Yes.**

### SP1 — Standing raw Admin or support impersonation is an insider backdoor

- **What could go wrong:** A platform account always has cross-Tenant raw CRUD,
  or support becomes a tenant user and can silently act as them.
- **Why it matters:** Compromise or misuse has broad impact and audit cannot
  distinguish the actual actor.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Modern privileged-access guidance favors
  just-in-time, time-bound, purpose-bound access. Phase 12 already requires
  actual/effective actor separation and scoped operator grants.
- **Permanent prevention:** No standing raw role or shared account; product
  diagnostics first, read-only lesser-of View as, then an exact incident-bound
  diagnostic grant under the immutable actual operator.

### SP2 — Diagnostics and logs over-collect sensitive ministry content

- **What could go wrong:** Operators browse whole Tenants, copy donor/worker
  data, log bodies/tokens/signed URLs, or use weak/replayed authentication to
  enter the lane.
- **Why it matters:** A tool intended to reduce incident risk becomes a privacy
  and safeguarding exposure.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** OWASP warns that logs themselves are sensitive;
  restricted-ministry existence may be safety-critical. NIST distinguishes
  fresh reauthentication and stronger assurance.
- **Permanent prevention:** Fresh Supabase/Phase 12 assurance, minimum-necessary
  field projection, metadata-first views, no bulk export, content-minimized
  audit, exact purpose/scope, short TTL, and existing safety floors.

## 12. Scalability and performance risks

**Material concern: Yes.**

### SC1 — Authorization is recomputed per field or copied into oversized JWTs

- **What could go wrong:** Every component/field performs a database decision,
  or all capabilities/Tenants/Sites are put into cookies to avoid calls.
- **Why it matters:** The first design creates latency/connection pressure; the
  second creates stale, oversized, client-visible authority.
- **Severity / likelihood:** **High / Likely at scale.**
- **Evidence / reasoning:** Supabase warns about JWT staleness and cookie size;
  Phase 12's context is richer than a role claim.
- **Permanent prevention:** Verify identity, resolve Phase 12 once per exact
  request, memoize only within that context, compile safe action booleans and
  query predicates, and index authorization/mapping joins.

### SC2 — Raw diagnostic queries bypass product query budgets

- **What could go wrong:** An operator requests unbounded relationship depth,
  versions, content bodies, or all-Tenant counts during an incident and
  overloads the CMS/database.
- **Why it matters:** Diagnostics worsen the outage and increase the blast
  radius.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Payload exposes flexible generated APIs and
  relationship population; provider GraphQL complexity requires explicit
  control.
- **Permanent prevention:** Allowlisted query shapes, exact Tenant/Site,
  minimum selects/depth, cursor/limits, timeouts, budgets, rate/concurrency
  controls, and GraphQL disabled when unused.

## 13. Operational burden

**Material concern: Yes.**

### OB1 — Security relies on a manually maintained route/call spreadsheet

- **What could go wrong:** New collections, plugins, auth operations, versions,
  custom views, or Local API calls are added without updating the inventory.
- **Why it matters:** The one forgotten path becomes the real authority while
  the documented model appears sound.
- **Severity / likelihood:** **High / Likely over time.**
- **Evidence / reasoning:** Payload generates routes and operations from
  configuration; manual inventories drift.
- **Permanent prevention:** Generate/census the inventory in CI from config and
  source patterns, require registry ownership/reason/tests for exceptions, and
  fail unknown routes/calls closed.

### OB2 — Every support read requires heavyweight ceremony

- **What could go wrong:** Approval chains and repeated MFA are required for
  low-risk product diagnostics, so staff route around the system or keep
  standing access to avoid delay.
- **Why it matters:** Controls that make incident response unusable are
  eventually disabled.
- **Severity / likelihood:** **Medium / Possible.**
- **Evidence / reasoning:** Phase 12 intentionally makes controls quorum-aware
  for small organizations; modern PIM separates eligibility from activation.
- **Permanent prevention:** Product diagnostics and read-only View as require
  ordinary scoped authority; standard engine reads use eligible capability,
  exact incident, fresh auth, and short TTL without universal approval.
  Existing higher-sensitivity policy adds approval only where it changes risk.

## 14. Observability gaps

**Material concern: Yes.**

### OG1 — All failures look like “403”

- **What could go wrong:** Logs and UI cannot distinguish invalid identity,
  stale epoch, wrong Tenant/Site, missing capability, missing resource,
  mapping defect, dependency outage, or provider bug.
- **Why it matters:** Support over-grants access to fix outages and cannot find
  actual cross-scope probes.
- **Severity / likelihood:** **High / Likely without structured outcomes.**
- **Evidence / reasoning:** These states have different safe recovery and alert
  thresholds; generic provider errors collapse them.
- **Permanent prevention:** Closed outcome taxonomy, privacy-safe correlation,
  decision/epoch/provider-version fields, separate user copy, and aggregated
  dashboards/alerts.

### OG2 — Elevated grants or bypasses become orphaned

- **What could go wrong:** A diagnostic grant exceeds policy, remains active
  after incident closure, receives repeated extensions, attempts mutations, or
  an override appears outside the registry without alerting.
- **Why it matters:** A temporary exception silently becomes standing access.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Time-bound access is only effective if expiry and
  revocation are measured; source bypasses are easy to add.
- **Permanent prevention:** Grant/incident reconciliation, no-auto-renew hard
  maximum, post-expiry probes, override census, audit-ledger health, and alerts
  for orphan, mutation, wildcard, or cross-scope activity.

## 15. Dependency and integration risks

**Material concern: Yes.**

### DR1 — Payload internal pin is mistaken for a stable platform contract

- **What could go wrong:** D30 imports undocumented internals, relies on current
  admin pages, or assumes current provider access behavior will remain.
- **Why it matters:** Upgrades become blocked or silently unsafe, creating
  vendor lock-in and emergency patch pressure.
- **Severity / likelihood:** **High / Likely over time.**
- **Evidence / reasoning:** The exact version is an internal build, and Payload
  intentionally generates significant behavior from config.
- **Permanent prevention:** Asym-owned ports/contracts and route policy,
  documented public APIs where possible, exact-pin adapter tests, upgrade
  diff/census, and no provider row/status/UI as domain truth.

### DR2 — Supabase session mechanics are mistaken for live authorization

- **What could go wrong:** Code trusts `getSession`, user metadata, an old JWT
  Tenant/role claim, or logout alone as immediate capability revocation.
- **Why it matters:** Identity can be valid while membership is stale, and a
  revoked staff member can retain authority until token refresh.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Supabase currently says to protect server data with
  verified claims, warns user metadata is unsafe for authorization, and notes
  JWT/session effects can be delayed.
- **Permanent prevention:** Supabase proves immutable identity/assurance;
  Phase 12 resolves current authorization/epoch on every protected operation;
  sensitive actions can additionally verify current session state.

## 16. Migration and upgrade risks

**Material concern: Yes.**

### MU1 — Dual-authority cutover widens by union

- **What could go wrong:** During migration, either old Payload role logic or
  new Phase 12 capability logic may allow an action, or fallback restores old
  access after a new-path failure.
- **Why it matters:** The most permissive system wins and revoked access remains
  reachable during the highest-risk transition.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Current role/Tenant checks and future Phase 12
  checks have different semantics. Synchronizing them cannot make them one
  brain.
- **Permanent prevention:** Shadow-compare decisions only; never union. Cut over
  one complete surface behind the central gate, prove direct routes/APIs, then
  remove legacy authority and make rollback preserve the new gate.

### MU2 — Principal/mapping cleanup breaks references or blocks everyone

- **What could go wrong:** Deduplicating users/Tenants changes IDs, deleting
  legacy users loses attribution, or enforcing uniqueness before repair locks
  valid staff out.
- **Why it matters:** A security migration can corrupt history or cause a broad
  outage.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Current data model uses Payload relationship IDs
  and auth-created mappings. These cannot be blindly replaced in-place.
- **Permanent prevention:** Preflight census, immutable crosswalk, duplicate
  quarantine, reference-preserving succession, reversible staged migration,
  no login-time repair, and verification before constraints/cutover.

## 17. Other development hazards

**Material concern: Yes.**

### DH1 — Time-of-check/time-of-use races accept stale authority

- **What could go wrong:** Capability is revoked, Site context switches, a D12
  revision changes, diagnostic grant expires, or incident closes after render
  but before save/repair/read return.
- **Why it matters:** UI state or an earlier policy decision appears to
  authorize an operation that is no longer valid.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Browser actions and background operations are
  inherently concurrent; Phase 12/D12 already use epochs and expected versions.
- **Permanent prevention:** Reauthorize and compare epoch/version/scope at the
  consequential commit or before protected diagnostic response, use CAS and
  transactions, roll back optimistic UI, and make idempotency semantic.

### DH2 — Test shortcuts and rollback paths become production bypasses

- **What could go wrong:** E2E default Tenant, bypass headers, test roles,
  schema push, or a “temporary” native-provider rollback remains effective in
  production.
- **Why it matters:** A non-product path can defeat every carefully designed
  runtime control.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Current auth strategy contains an E2E/default-Tenant
  path, and native feature flags exist. Environment assumptions drift.
- **Permanent prevention:** Build-time production exclusion, separate test
  principals/data, deployment assertions, negative production-mode tests,
  safe rollback that preserves central gates, and no bypass secret accepted by
  application runtime outside the test harness.

## Ruthless synthesis

### Must be fixed in the D30 contract

1. Preserve the exact split: Supabase Auth proves the person/session; Phase 12
   decides access; Payload merely links the principal and enforces the result.
2. Remove Tenant/role/capability authority from the Payload user and stop
   login-time Tenant/user provisioning or defaulting.
3. Introduce mandatory actor/service ports and a generated route/override
   inventory before migrating screens.
4. Make Web Studio the only staff surface, disable or gate generated APIs, and
   prohibit native fallback from widening access.
5. Make engine diagnostics one short-lived, exact-scope, minimum-disclosure,
   read-only incident session with durable audit. Typed Repair commands run
   outside its grant under their own authorization; D30 has no raw-write lane.
6. Specify the complete staff/diagnostic failure journeys and prove them under
   revocation, outage, concurrency, and accessibility tests.

### Should be addressed soon after the spine exists

1. Tune indexes and request-local decision memoization from production-shaped
   traces rather than prebuilding a complex cache.
2. Expand product diagnostics before adding provider-read views; every new
   diagnostic view must answer a recorded incident question.
3. Finalize support-access notification/retention wording with privacy,
   safeguarding, and incident-response owners.
4. Reconcile legacy Principal Links/Tenant mappings with reversible tooling and
   reference-preserving receipts.

### Monitor rather than overbuild

1. whether standard 15-minute diagnostic sessions regularly need extension;
2. whether any incident truly needs a provider view beyond safe metadata;
3. authorization latency, repeated denials, and staff access-request patterns;
4. raw-route/bypass attempts and provider upgrade drift; and
5. whether a future raw-write emergency lane is evidenced. If it is, make a
   new decision; do not reserve hidden machinery now.

## Final adversarial verdict

**Proceed only with the founder-ratified C-prime-R.** The naive option has Critical
risks in parallel authority, default-bypass Local API behavior, direct routes,
ambient operator access, and multi-Tenant scope. The hardened design removes
those risks with a small number of reusable seams rather than more policy
systems: one identity provider, one PDP, one principal link, two typed operation
ports, one product route policy, and one bounded read-only diagnostic lifecycle.
The founder ratified the complete exact formulation in the decision brief as
Phase 23 D30 on 2026-08-24. This review explains but does not independently
expand that authority or authorize implementation.
