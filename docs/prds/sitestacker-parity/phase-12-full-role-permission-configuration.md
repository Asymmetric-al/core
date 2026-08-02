# Phase 12 — Full Role & Permission Configuration

**Slug:** `permission-config` · **Roadmap position:** Phase 12 of 41 (roadmap v2) ·
**Status:** PRD (design ratified 2026-07-08 via grill-with-docs — 26 decisions D1–D26 + 7 cross-cutting rulings R1–R7 + 19 hardening rules, deep-researched across the nonprofit/missions-CRM field and the modern authz field, then pressure-tested by five adversarial passes: a definitive 8-cluster review and a final ruthless risk-category review. Verdict: **lock the spine; ship the tenant-axis + causal-revocation substrate first.** READY). Tracked by epic #665 + children #666–#687.

**Hard dependencies (must land before build):** Phase 3 _Minimum Permission & Role-Scoped Projection Foundation_ (`field_policies`, the single `resolveProjection` PDP, `assertEditableForSurface`, `emitGovernedCsv`, `classifyChange`/maker-checker widening, fail-closed default, the **code-source-of-truth capability registry** shaped for 1:1 table seeding, the dormant additive `tenantOverrides` param) · Phase 9 _Full CRM Depth & Relationship Graph_ (Party spine, the **B6 party-scoped access-check helper**, the CI guardrail that _derived roles are display-only, never authorization_) · Phase 10 _Sensitive-Data Classification & Restricted-Ministry Safety_ (`security_level`, `security_clearance` capability, `identity_access_grants` with `subject_type`/`scope_ref` named for additive extension, `party_restricted`, the sole-entry `toPublicProjection` firewall, break-glass) · Phase 11 _Custom Fields & Custom Collections_ (`getFieldCatalog`, the field-policy cache, the immutable `field_key`/`value_key`/`option_id` contract, the "every egress reaches the resolver" meta-test, `classify:manage`).

**Downstream consumers (this phase defines the contracts they build on):** Phase 13 contribution-ledger (money-plane consumes the resolver; SoD-conflict pairs) · Phase 21 Field Accounts/Support Workspace · Phase 30 imports-migration · Phase 31 platform-api (public REST/webhooks) · Phase 33 reporting-BI (report permissions as their own model; aggregate small-cell suppression) · Phase 34 workflow-engine · Phase 6 communication/merge · Phase 38 member-care case product & exposure report · Phase 40 AI (every AI egress routes through this resolver).

**Phase 16 downstream capability amendment (2026-07-13).** Phase 16 consumes
this spine for separate capabilities covering recurring/fixed-pledge view,
authorization-bound recurring service, fixed-pledge create/change/end/release/
correction, reminder-policy/enrollment administration, provider-control
incident response, restricted authorization-evidence view, and governed
report/export access. The Phase 16 PRD owns the exact capability keys and their
command matrix; Phase 12 owns their registry, active-assignment, epoch,
projection, audit, purpose, and tenant-axis enforcement. Staff capability proves
only operator authority. It never proves Party instruction, cardholder/account-
holder collection authorization, promise ownership, or provider control. The
server derives the action class and independently validates all required gates;
role names, UI visibility, a generic consent checkbox, or a second staff click
cannot manufacture missing donor authority. System schedulers and reconcilers
use separately registered service-principal capabilities and the same tenant/
purpose/audit boundaries, never a staff-role shortcut.

**Legal Entity scope amendment (2026-07-27; Phase 20 D3 / ADR-0044).**
Legal Entity access is a subtract-only scope inside Tenant and uses the same
Phase 3 PDP/PEPs; Phase 12 does not add another resolver, RLS tenant, or
permission model. `EffectiveAccess` binds a canonical allowed-entity-set hash
and monotonic scope revision, and every PEP verifies both before selecting,
mutating, aggregating, exporting, enqueuing, or firing entity-bearing work.
Entity-scope changes are causal-revocation events. Missing, stale, or
wrong-entity authority fails closed. A single-entity tenant receives the exact
same persisted and verified scope with no visible selector or setup burden.

**Phase 18 downstream capability amendment (2026-07-21).** Phase 18 registers
explicit atoms for document draft/edit, standard publish, protected submit and
different-human review, publication appointment, generation, correction or
replacement, exact artifact access, Canadian issuer/signer/serial operations,
records holds/disposition, and technical evidence. Phase 12 owns capability
registry, active assignment, step-up, epochs, audit, and tenant/object scope;
Phase 18 owns command preconditions and purpose/issuer/resource authorization.
Role names, UI visibility, authored-template ownership, a URL, or successful
rendering never authorize a command or artifact read.

**Phase 19 downstream capability amendment (2026-07-24).** Phase 19 registers
separate exact atoms for role-safe statement-operations view; draft/preflight
management; participation; standard start; protected independent review;
delivery-profile and destination succession management; physical preparation
and physical-evidence recording; Pause/Resume/Stop/privacy containment;
completion/return-to-review; staff exact-current statement-copy requests; and
separate audit-package preparation/download.
The Phase 19 PRD owns the exact `statement_operations.*` keys and command
matrix, including separate add-participant, include/restore-participant, and
handle-participant-separately grants, separate direct-mail connection
administration and paid-lane authorization, and separate completion and
return-to-review grants. Phase 12 owns registry, grants, active assignment,
assurance, step-up,
governance epoch, delegation, audit, and tenant/object scope. No role name,
visible button, run ownership, tenant setting, client actor field, or successful
preflight can replace a current capability and command-specific server proof.
Candidate-scoped protected reviewer delegation reuses Phase 12 authority and
never creates standing tenant membership or a Phase 19 role engine.

**Posture note (fresh-build).** The product has **no production users** (ADR-0001). Design correct-from-start; there is no end-user data to migrate. But the current auth code (`packages/auth/permissions.ts`, `packages/auth/context.ts`, `supabase/migrations/20260226113000_authz_memberships_foundation.sql`) contains the MVP "all staff subroles share broad admin access" posture and several **live cross-tenant hazards** this phase retires as its first task (see **§ Ship-First Substrate**). Make **no "live/shipped" claims** without evidence. A cross-tenant or cross-clearance exposure of a restricted-ministry worker is a **physical-safety event**, not a privacy incident — this is the design's controlling constraint.

---

## Problem Statement

By the time an Asym tenant reaches this phase it holds **classified worker and care-adjacent data** (Phase 10), **tenant-authored custom fields and collections** (Phase 11), the **CRM relationship graph and record shell** (Phase 9), and — imminently — **money operations** (Phase 13+). Different staff must see and do very different things with all of it. Yet the platform's actual permission "system" today is a prop: `STAFF_SUBROLE_CAPABILITIES` maps every staff subrole (`finance`, `mobilizer`, `development`, `hr`, `member_care`) to the _identical_ broad-admin capability set, nothing in the running code even reads that map, and the real gatekeeping is scattered job-title string comparisons (`role === "finance"`, `profileRole === "super_admin"`) across two unrelated modules. "All staff can see everything" is not a policy anyone chose — it is the absence of one.

Phase 3 built a fixed **security floor**: allow-listed, role-scoped projections per surface. Phase 12 does **not** replace that floor. It builds the **configurable permissions product** on top of it: organization admins managing staff groups, granting capabilities, testing what a role can see, auditing access changes, and getting alerted to risky grants — so the MVP "broad staff access" posture ends here.

Three failure modes make this dangerous to get wrong, and each is a physical-safety concern in a missions context:

1. **The permission system can leak across the tenant boundary.** Multi-tenant CRMs fail most often not on "what can this person do" but on "whose organization's data is this." The current code already carries this hazard: the application and the database derive the acting tenant from _different_ sources, ~12 row-level-security policies carry an `OR is_super_admin()` cross-tenant god-mode escape below the enforcement layer, there is no first-class "active assignment" concept for a person who serves multiple orgs, and a malformed login can auto-join a real, populated tenant. A cross-tenant read of a restricted worker gets that worker exposed.

2. **A configurable permission product can quietly reach _around_ the safety floor.** Groups, grants, CRUD matrices, delegated admin, and impersonation are all _granting_ mechanisms. If any of them can make the resolver return a field the floor removed, the whole Phase 3/10/11 guarantee collapses. Every nonprofit CRM warns about the specific version of this — a broad "view all" grant that silently voids every granular restriction (CiviCRM's `access all custom data`; Salesforce "View All Data").

3. **A permission product that is unusable for a two-person nonprofit gets its safety controls switched off.** If "get a second approver for everything," recertification, and rate budgets assume a security team the tenant does not have, the admin broadens a base group to get work done — defeating least privilege. A disabled safety control is a restricted-worker exposure vector.

The one genuinely good precedent in the repo — the contribution-operations code, which checks real named capabilities (`contributions.run_refunds`, `approve_corrections`) through an action→capability table with a direct-vs-request escalation — is the model. Phase 12's job is to make the _whole platform_ work like that one good corner, safely, across every tenant, without ever reaching around the floor.

## Solution

A Mission-Control **configurable permissions product** built on a single, hardened authorization spine. Plain-language summary of the finished architecture:

- **One brain.** A single server-side Policy Decision Point, `resolveProjection`, is the only place any access decision is made. It is the sole producer of a runtime-verifiable access token that carries the tenant, principal, exact server-derived Tenant Authorization Context variant, purpose, capability set, exact Legal Entity scope hash/revision where applicable, an epoch, and an expiry. A membership-backed context contains one validated Active Tenant Assignment; a public context is pinned to one Site/public resource and can produce only `toPublicProjection` output; an NHI context is pinned to its single-Tenant identity, current human-owner ceiling, and credential epoch; and an operator context is pinned to one audited, purpose-bound, time-boxed tenant grant. Every enforcement point — routes, jobs, the data layer, and every egress door — verifies that token before trusting it. Skipping the resolver or the floor is both a type error _and_ a runtime verification failure; reaching restricted data without a verified token fails a build-time architecture test.
- **One formula.** `EffectiveAccess = ( role/subrole grants ∪ group grants ∪ named-person grants ) MINUS floor`, where the floor composes, strictest-wins, the Phase 3 field-policy projection, exact Legal Entity scope, Phase 10 `security_level`/clearance, Phase 11 field gates (on filter/sort/group-by _inputs_, not just displayed columns), the **purpose/consent** axis, and the **residency** veto. Above the line is **additive, grants-only — no per-grant DENY, ever.** The floor subtracts last and always wins; no grant of any kind adds back what it removed.
- **Capabilities enforce; names never authorize.** Roles, staff subroles, groups, and named grants are bundles that resolve _into_ capabilities. Their _names_ are never string-compared to make an access decision. This is RBAC (can-do-work) composed with ABAC (is-this-specific-data-safe).
- **Tenant isolation is structural, not conventional.** The tenant is branded into the access token and re-verified at runtime; serving another tenant's row is a type error and a verification failure; the application and database share one tenant source; cross-tenant groups, grants, and integration identities are unrepresentable.
- **Instant, causal revocation.** Any change to a person's, group's, or grant's access bumps a single monotonic tenant epoch; every request re-checks it, so cached permissions and live sessions lose access at once (≤60s on the one managed live-feed, immediate everywhere else).
- **The configurable product.** Admins compose access from **layered persona bundles** (a seeded Owner + nine least-privilege starter templates) plus **flat staff groups** and **named-person grants**, using a founder-friendly **None / View / Manage / Admin** ladder per module that compiles into an explicit, build-checked capability map — with a "who can see this endangered worker, and by what grant" explainer, safe "view-as" permission testing, guard-railed impersonation, tamper-evident audit, access recertification, separation-of-duties detection, and sensitive-grant alerts.
- **Safe for the smallest org.** Every heavyweight control (just-in-time elevation, second-approver, recertification) is **quorum-aware**: with one admin it degrades to single-actor-with-loud-audit and an external reviewer, never a silent hard block.

The result: an organization can shape staff access to match how it actually operates, the platform proves — by construction, in CI, and at runtime — that no configuration can cross the tenant boundary or reach around the restricted-worker safety floor, and a two-person ministry can run it without turning the safety off.

---

## User Stories

### Organization admin — groups, roles, and everyday administration

1. As an org admin, I want to put staff into named groups (Finance, Donor Care, Mobilization, Member Care…) that grant a bundle of access, so that I administer access by team instead of person-by-person.
2. As an org admin, I want to set each group's access per module using plain **None / View / Manage / Admin** levels, so that I don't need to understand individual capabilities.
3. As an org admin, I want to open a drawer that shows the _exact_ abilities a level grants for a module, so that I know what "Manage" actually allows before I choose it.
4. As an org admin, I want the system to guarantee that a _sensitive_ ability can never hide inside "View" or "Manage" — only inside "Admin" or an explicit time-boxed grant — so that I cannot hand out something dangerous by picking a friendly level.
5. As an org admin, I want a person's access to be the sum of the groups and grants they hold, and I want to see all of them enumerated, so that access is easy to reason about.
6. As an org admin, I want to start from sensible seeded groups I can edit or delete, so that I have a safe, correct starting point instead of a blank slate.
7. As an org admin, I want to add or remove a person from a group and have it take effect immediately, so that access tracks reality.
8. As an org admin, I want membership to be able to carry an expiry date, so that temporary access ends on its own.
9. As an org admin, I want the system to refuse to remove the last person who can manage permissions, so that I can never lock the organization out.
10. As an org admin, I want every group and membership change recorded with who/when/before→after, so that access is auditable.
11. As an org admin who is the _only_ admin, I want the "needs a second approver" controls to degrade to single-actor-with-loud-audit and an external reviewer instead of blocking me, so that I can operate without turning safety off.

### Data-governance / security admin — sensitive access and clearance

12. As a security admin, I want granting a sensitive-tier group (Finance, Member Care, People Ops) to require the person to _activate_ it just-in-time and get a second person's approval, so that no one holds dangerous standing access.
13. As a security admin, I want "Security Clearance" to be a capability I toggle onto a person, separate from any group, and never baked into a seeded template, so that cloning a group never silently spreads restricted-worker visibility.
14. As a security admin, I want to grant one named person access to one restricted worker for a stated reason with an expiry, so that I can use least-privilege instead of broad clearance.
15. As a security admin, I want to see "who can see this endangered worker, and by exactly what grant," so that I can answer a safety question in one place.
16. As a security admin, I want to be alerted when someone receives clearance, refund/finance power, export power, permission-management power, API/integration access, or a named grant to a restricted worker, so that risky access never happens silently.
17. As a security admin, I want an access-review that periodically re-confirms sensitive/restricted access, auto-expiring anything not re-attested, so that access does not accumulate forever.

### Staff member — the everyday experience

18. As a staff member, I want a screen ("My Access") that shows what I'm allowed to do, so that I understand my own permissions.
19. As a staff member, I want a control I can't use to be cleanly absent or clearly disabled-with-explanation, never a broken half-drawn screen, so that the app feels intentional.
20. As a staff member, I want to request access I need and have it approved and time-boxed, so that elevation is smooth and temporary.
21. As a staff member, I want a persistent banner and a countdown while I have elevated access, so that I know my elevated session is live and when it ends.
22. As a staff member, I want to never be told a record I can't see "exists but is blocked" — a blocked record and a nonexistent one look identical — so that I can't infer the existence of a restricted worker.

### Support / operator — permission testing & impersonation

23. As an admin, I want to "view as" a group or a user to see what they would see, without logging in as them and without any write path, so that I can test permissions safely.
24. As an admin, I want a field-level trace of _why_ access was denied or granted (behind a privileged capability, audited), so that I can debug a wrong decision without over-granting.
25. As a support operator, I want real impersonation to be blocked from tenants holding restricted workers except through a just-in-time ceremony, run under the _lesser_ of my access and the user's, with a persistent banner and every action audited under both identities, so that impersonation can't become an insider-risk tool.
26. As an org, I want a frozen/suspended account to resolve to _zero_ capabilities immediately, so that a deactivated user can't retain access.

### Platform / integration

27. As an integration owner, I want an API token / service account to have its own least-privilege access, a required human owner, and a hard ceiling that it can never exceed its owner's current access, re-checked live, so that a token can't outlive or out-scope its owner.
28. As the platform operator, I want my cross-tenant support access to go through the same resolver as an audited, purpose-bound, time-boxed grant that writes to a separate append-only sink — never an ambient god-mode — so that operator access is always scoped and provable.

### Tenant safety (cross-cutting)

29. As any tenant, I want it to be structurally impossible for another tenant to read, be granted, be grouped with, or report on my data, so that isolation is guaranteed by construction, not by convention.
30. As any tenant, I want my staff to never be able to configure their way around the restricted-worker safety floor no matter what groups or grants they hold, so that the safety floor is inviolable.
31. As any tenant, I want a person who serves multiple organizations to always act within exactly one organization at a time, with no way to bleed data across them, so that multi-org staff are safe.

### Governance, audit & recovery

32. As a compliance owner, I want a tamper-evident, identifiers-only audit of every access change and every _read_ of a restricted worker, so that "who looked at this worker" is provable and cannot be quietly deleted.
33. As a compliance owner, I want the system to detect toxic combinations (e.g. can-enter-and-approve the same correction) across a person's full resolved access, so that separation-of-duties violations surface even when assembled across a group and a grant.
34. As a compliance owner, I want a per-organization limit on how fast restricted records can be read or exported, with a hard stop on bulk restricted export, so that a compromised account can't quietly drain the endangered-worker list.
35. As an org, I want a platform-operated, consent-logged, independently-authenticated recovery path if our sole admin is lost or off-grid — that still cannot read restricted-worker plaintext — so that we can never be permanently locked out of our own data.

---

## Implementation Decisions

Decisions are labeled `D#`/`R#` to trace to the grill decisions log. **Everything below sits on the Phase 3 floor and the Phase 9/10/11 contracts and may only ever _subtract_, never grant past them.**

### A. The core authorization spine (D1)

- **Capabilities are the sole enforcement unit.** A `Capability` is a **branded/nominal type** (`type Capability = keyof typeof CAPABILITY_REGISTRY`), never a bare string; every enforcement signature accepts a `CapabilitySet`, checked against registry constants, never inline string literals. A typo or stale-after-rename capability fails `tsc`.
- **One PDP.** `resolveProjection` is the single, exported producer of an access decision. The additive union and the subtract-only floor are private inner steps of that one function; the floor subtracts _before_ the token is constructed. Every Policy Enforcement Point (routes, jobs, data layer, egress doors) accepts only the produced token. There is no second resolver — the legacy `packages/auth/permissions.ts` static map and `resolveContributionCapabilities` are deleted, not left as fallbacks.
- **Additive grants-only, no per-grant DENY** (confirmed correct against Cedar/Azure/K8s RBAC; the multi-group "why am I blocked?" leak is the documented reason to keep cross-group DENY out — Salesforce muting). The **floor is the only subtractor.** The only "narrowing above the line" allowed is a reserved, single-scope `muted_capabilities` seam (D2/§I) that can only remove an atom the _same bundle_ grants — never cross-group, never widen; typed convenience-only, forbidden from holding a floor/`decrypt.*`/sensitive atom.
- **Names never authorize.** `hasStaffSubrole()` survives only as a _display_ helper. The Phase 9 CI import gate is extended to a lint that bans `role ===`, `profileRole`, `.role` authz reads and literal role strings in `packages/api` **and** in `supabase/**/*.sql` policy bodies; each surviving occurrence carries `// authz-exempt: display-only` and the exemption list _is_ the auditable residual inventory.
- **Capability tables land here** (Phase 3 deferred them): `permission_capabilities` and `role_capability_grants` are a **generated, CI-verified, boot-asserted derived artifact** of the code registry (delete the phrase "seeded 1:1"). A `permissions:verify` golden-snapshot gate fails the build on any registry↔seed diff; `assertRegistryMatchesSeed()` refuses to serve on mismatch at boot; grant tables carry an FK to `permission_capabilities` `ON DELETE RESTRICT`. Tenant-authored (Phase 11) capabilities are runtime rows `source='tenant'`, tenant-scoped, classified fail-closed, additive-only and still under the floor.
- **In-house resolver, not a policy engine, for v1** (D1 rejected-alt). Adopting OpenFGA/Cedar would break `R6` (same-DB read budget) and the atomic audit-durable-before-serve co-commit. Re-evaluate build-vs-buy for the _additive RBAC/ReBAC layer only_ at a **pre-committed trigger: the moment nested groups or ABAC conditions ship live.** The floor stays in-house — it is the moat.
- **`R6` (binding performance invariant):** a governed read costs **≤1 governance-row SELECT + ≤1 ledger UPDATE**. This is a _logical_ bound with a written sharded-physical carve-out (the budget ledger is striped, not a shared counter — §H).

### B. Principals, the tenant axis, and revocation (D12/D14 + the ship-first amendments)

- **Four principal classes, all through the same PDP:** (1) **authenticated tenant human** — staff, donor, or missionary with one exact active Tenant membership per request; role names never authorize and the active membership plus grants/floor determine the projection; (2) **public/anonymous** — default deny-all, using a server-validated Public Projection Context pinned from the requested host, Site, and public resource to exactly one Tenant and named public projection; only `toPublicProjection` output, never widenable by an internal grant (D14); (3) **service account / non-human identity (NHI)** — a required human owner, its own least-privilege set (never a human role), a hard ceiling computed as a **live read-time intersection with the owner's _current_ resolved capabilities** (never frozen at mint), single-tenant, force-disabled when the owner leaves; (4) **platform operator** — an orthogonal authority _plane_, reaching tenant data only through the resolver as an audited, purpose-bound, time-boxed grant that writes to an **append-only, tenant-independent** sink; never ambient god-mode. An authenticated donor or missionary is not collapsed into the public/anonymous class and need not be made staff to receive a bounded tenant workspace grant.
- **The tenant is branded into the token** (`EffectiveAccess<TenantId>` with a phantom tag stamped from the validated Tenant Authorization Context's `tenant_id`). That discriminated context is exactly one membership-backed Active Tenant Assignment, public-only Public Projection Context, single-Tenant Service Tenant Context, or audited Operator Tenant Grant Context; no variant is client-asserted. Every egress door's target-fetch requires the token and a `RowIn<T>` that must _unify_; a cross-tenant serve is a compile error _and_ a runtime verification failure. (The tenant-axis twin of the floor branding.)
- **Legal Entity is a checked inner scope, not another brand or tenant.** Entity-bearing rows persist immutable `legal_entity_id`; grants may allow one or several entities only within the active Tenant. The resolver canonicalizes that allowed set, signs `legal_entity_scope_hash` plus monotonic `legal_entity_scope_revision`, and the PEP selects by `(tenant_id, legal_entity_id, id)` before returning any data. No Site, designation, processor account, Accounting Destination, or mutable tenant default may infer entity authority. "All entities" is an explicit tenant-bounded grant resolved against the current entity registry, never an unbounded wildcard.
- **One tenant source per request.** The resolver's validated Tenant Authorization Context `tenant_id` is threaded end-to-end via a request GUC that the database's `current_tenant_id()` reads; a CI gate asserts the application and RLS tenant sources cannot diverge. For membership-backed requests the source is the validated Active Tenant Assignment. For public reads it is the host/Site/public-resource binding revalidated before selection and constrained to `toPublicProjection`. For NHIs it is the single-Tenant service-identity binding rechecked with the live owner ceiling and credential epoch. For operators it is the exact audited tenant grant rechecked for purpose and expiry. Until unified, RLS may not be described as a tenant backstop.
- **Active assignment is a first-class, server-owned selection for membership-backed principals.** `authz.memberships` gains an active-assignment selector; the acting hat is chosen server-side (or validated every request against `authz.memberships WHERE user_id = session.uid AND is_active AND id = ?`), never client-trusted. Every deferred/queued/streaming governed member action serializes the _validated_ `active_assignment_id` and re-resolves ownership + active + tenant-match at fire-time (fail-closed, audited). Public Projection Contexts cannot enqueue tenant mutations or masquerade as assignments.
- **Cross-tenant edges are unrepresentable:** `group.tenant_id NOT NULL`; `CHECK group_membership.tenant = group.tenant`; `CHECK grant.subject.tenant = scope_ref.tenant = grant.tenant`; an NHI is single-tenant (a multi-tenant integration = N NHIs). No tenant default — a membership-backed principal with no validated Active Tenant Assignment is default-deny with zero memberships and an onboarding error; a public request with no exact validated host/Site/resource binding is indistinguishable from not found. Delete the `…0001` fallback and the `member_care` full-admin backfill.
- **RLS stays coarse defense-in-depth**, CI-proven to hold no capability or identity logic. The RLS-introspection gate is a required CI gate from v1 and is a **positive** proof: every `tenant_id`-carrying table MUST have RLS enabled referencing the unified `current_tenant_id()`, with no identity/capability escape and no `USING(true)` for `authenticated`. Delete `OR authz.is_super_admin()` from all data-plane policies.
- **Instant, causal revocation via a single monotonic tenant epoch.** Any group/grant/clearance/membership/**Legal Entity scope** mutation bumps a **single-row tenant epoch** (`BIGSERIAL`/`pg_current_xact_id`, never `now()`) inside the mutation transaction. This satisfies Zanzibar's new-enemy guarantee _without_ a per-principal in-transaction fan-out (which deadlocks, lock-storms on large groups, and can silently roll back a restricted-clearance revocation). Any per-principal materialization is derived **asynchronously and idempotently**, never on the safety-critical path. One monotonic per-`(principal, tenant)` `governance_version` (bumped by grant/entity-scope/purpose/consent/residency/clearance alike) is the cache key; the entity scope also carries its own monotonic revision so the token can prove exactly which set was authorized. The resolver caches _inputs_, never the resolved set; cache lifetime is capped at `min(expires_at)` so JIT grants self-heal at their UTC instant. A CI property test fails if the fan-out is ever _narrowed_.
- **Runtime-verifiable token (the compile-time brand is erased at serialization boundaries).** RSC/Server-Action serialization, Payload access callbacks, Edge Functions, raw SQL jobs, and Inngest payload deserialization never see a TS brand. The resolver therefore **HMAC-signs** `(tenant, principal, tenant_authorization_context_kind, tenant_authorization_context_ref, purpose, caps-hash, legal-entity-scope-hash, legal-entity-scope-revision, governance_version, expiry)`; every PEP calls one `verifyEffectiveAccess()` and checks the target's persisted `legal_entity_id` against that current scope before trusting a token. Deferred work serializes only the exact context reference appropriate to its principal class and re-resolves the current membership assignment, service identity plus owner ceiling, or operator grant together with entity scope revision/hash, purpose, and capability at fire-time. Public contexts authorize no mutation or deferred tenant work. Non-TS doors call the resolver RPC and never trust a serialized token. Binding invariant: **a governed read never trusts a deserialized `EffectiveAccess` — it re-derives or verifies-by-MAC and live scope.** Lint-ban `as EffectiveAccess`/`as Capability` and `@ts-expect-error` outside the resolver module.
- **`super_admin` is capability-path only** (ship-first): `profiles.role` becomes inert-for-authz; a stale `'super_admin'` value cannot manufacture a tenant or a capability. Overlaps the platform-plane; both write to the append-only tenant-independent sink and are purpose-bound + break-glass-tempo'd.
- **Non-prod isolation floor (D22, ship-first).** The `E2E_AUTH_BYPASS` cookie is **HMAC-signed (or deleted)** and bound to a **non-prod Supabase project-ref allowlist** — not `NODE_ENV`, which staging / preview / masked-prod all evade; restricted-tier test fixtures are **synthetic-only** (exclude-don't-mask — masking a small restricted population is itself a re-identification vector); both enforced as a build/CI invariant. Ground truth: `packages/auth/e2e-auth.ts` is an **unsigned base64url cookie today** — this is the fix, not a description of the present state.

### C. Staff groups & seeded defaults (D2/D3)

- **Group model.** Three additive tables — `groups` (id, tenant_id NOT NULL, key, label, description, is_seed_template, is_locked, is_sensitive, requires_approval_to_join, default_membership_ttl); `group_capability_grants` (group_id → capability_id; grants-only, no deny); `group_membership` (principal→group, granted_by, granted_at, expires_at, state ∈ {active, eligible, pending}). Groups feed one more input into the union the resolver already computes (Phase 3's dormant `tenantOverrides` seam). **Flat — no nesting in v1** (schema nesting-capable; DB-enforced flat); flat-layered is the permanent correct answer at this scale (nesting is what Google built Leopard to survive and Entra forbids for privileged groups).
- **Governance (v1):** managing a group is the guarded `permissions.manage` capability (split `manage_grants` / `manage_membership`); a group can never grant the capability to administer itself; full change audit; time-bound `expires_at`; **JIT eligible→activate + second-approver ON at v1** for Owner + any `permissions.manage` / restricted-ministry group; a **capability-level last-admin guard** (≥1 live resolver of `permissions.manage`) enforced once, in one advisory-locked DB function (§I).
- **Seeded defaults (D3): Owner (locked, ≥1) + 9 editable, least-privilege starter templates** — Finance (sensitive, **maker-only**: ships `apply_corrections`, not `approve_corrections`), Advancement (Donor Care + Development merged; gift-entry off by default), Mobilization, **Field/Regional Leadership** (breadth from Phase-10 region scoping, **fails closed to zero visibility when unscoped**, never `*_all`), Member Care (sensitive; clearance is a JIT grant on top, never baked), People Ops/HR (sensitive; proposes staff changes, cannot grant capabilities), Content/Web Studio, Developer/Integrations (human seat denied bulk person-reads; runtime integration reads flow through the NHI's own scoped credential), Read-only Auditor (scoped/aggregate read + audit-log; **no `*_all` bypass**; pairs with an aggregate-safe dashboard capability). **Not seeded:** Support Operator (a union of reads — compose on demand), Reports/Leadership (dashboards are a _capability_ addable to any group). **Guardrails baked into every seed:** least-privilege-from-empty; no `*_all`/view-all in any seed including Owner (Owner's breadth is a stack of specific manage caps); the "no sensitive capability below the Admin rung" invariant is enforced against the _seed definitions_ at build time; clearance never baked; Owner the only locked group. **Default install = the full 10** (pedagogical); offer an **Owner + Finance minimal** install; never Owner-only.

### D. Module / entity / field permissions (D4)

- **The `(module, level) → capability[]` map is a first-class, reviewed, generated artifact** beside the `tiles` config; each capability carries a `sensitivity` flag; a build-time invariant forbids any `sensitive` capability in `View`/`Manage`. Modules are **frozen to an authz-owned `PermissionModule` enum that the UI `tiles` registry _references_** (not defines) — a frontend rename can never orphan a permission row. Coverage/surjectivity is CI-proven (`registry ≡ ⋃ map`; `map.modules ⊆ PermissionModule`; every rung non-empty + monotonic higher ⊇ lower). No capability equals "see all fields" (the CiviCRM `access all custom data` hole is structurally absent).
- **Per-entity CRUD** for Party/person/household/org, notes, relationships, tasks, custom-collection items, reports, templates, CMS content. Entity permission never overrides field-level or classification restriction.
- **Per-field visibility/edit** rides the Phase 11 `getFieldCatalog` contract keyed on immutable `field_key`, and the Phase 10 tiers. **`edit(field) ⟹ view(field)`** is a resolver-level lattice invariant (blind-tamper on a `security`/`financial` field is Salesforce's #1 FLS bug); `edit` on a floored-`view` field is forbidden. Field access gates **filter/sort/group-by inputs**, not just displayed columns, and rejects (never silently drops) a predicate on an over-classified field.
- **Manager/hierarchy rollup is opt-in per module/entity** (not global); sensitive tiers and restricted persons are excluded by the same build-time invariant; the scope resolves from the **live org-edge** (a mover re-points automatically), enforced as a write-time DAG with a **fail-closed cycle guard** (cycle ⇒ self-scope). This is the one legitimately authorization-bearing derived edge (distinct from Phase 9's display-only derived roles); a CiviCRM-style controlled transitive read powers the Field-Leadership rollup, bound to the epoch.
- **Draft/unpublished is a distinct capability** enforced as a server-side `_status` where-constraint (never a client flag). **Self is a resolver scope axis** (self / reports / org / global): a person may view their own comp/clearance but must not edit their own comp, `security_level`, or background-check result; "self" resolves on a **principal-id row predicate**.
- **Merge/dedupe is an access-affecting event**: the survivor's `security_level` is re-derived as the **lattice meet (strictest-of-inputs)** as the _first_ committed write of a serializable merge txn (tighten before any child repoint — no window at the looser tier), re-emits the alias via `toPublicProjection`, is itself read-audited + clearance-gated, and a cross-restricted merge requires `decrypt` + clearance.

### E. Classification, security tags, geography & cover-identity (D5)

- **Security tags on notes/files** map onto the Phase 10 tier model (never a parallel tag system that bypasses the resolver). **Inherit-sensitivity-from-parent** is offered for notes/files as strictest-of-all-current-parents recomputed at attach/detach; **detach never declassifies** (declassification is a widen-equivalent maker-checker event).
- **Whole-record "protected constituent" restriction** (Blackbaud/MinistryPlatform/Salesforce parity) is a **floor row** — the entire record vanishes for non-cleared users (`protected_person_set` predicate), inherited by _every_ child record type (notes, files, gifts, events). A "you can see the person exists in Region X" roster is itself a fatal existence-oracle — routed through the uniformity oracle (`R7`).
- **Geographic-precision axis:** region-level rollups visible, exact country/site clearance-gated (the single most missions-distinctive control; a map pin can get a worker arrested).
- **Alias / cover-identity primitive:** the display name outside cleared contexts _is_ the alias; `toPublicProjection` emits the alias by default for restricted workers; receipts, thank-yous, public walls, and exports render the alias, never the legal name.
- **Restricted-worker records are non-exportable by default**, enforced at the metering choke across _every_ transport (a per-field-respecting bulk API is the documented Salesforce Data Loader exfiltration); bulk contact/export across a restricted set is blocked outright with justification + audit.

### F. Egress, metering, streaming & observability (D18/D23/D24 + R7)

- **Every egress is a closed `EgressDoor` discriminated union** (REST, CSV, realtime-DB, realtime-Inngest, SSE/AI-stream, embeddings-ingest, presence, trace-store, error-telemetry, **query-predicate**), pinned as a golden snapshot; a new _transport class_ fails a `never`-case switch at compile time (a maintained list is not enough — the 2025 Salesforce SOQL FLS-bypass CVEs were in the query layer). The Phase 11 "every egress reaches the resolver" meta-test is extended to assert the **metering side-effect**, not just authorization.
- **One post-projection metering choke (D18)** fuses, in one step at the moment rows are projected, **tier-decision → audit → budget** for every transport. The **audit half is a non-contending INSERT** in the read transaction (durable = WAL-committed-in-txn), the **budget half** is a striped/windowed decrement; the two together stay within `R6`. **Audit-before-serve blocks synchronously only for the restricted/break-glass tier**; sensitive/care/security/financial reads sync-_emit_ + async-durable via a **transactional outbox** (never an in-memory queue) behind a bounded queue + circuit-breaker (a flood degrades to deny-restricted-only and alerts on audit saturation as its own exfiltration signal). Invariant: **audit over-counts, never under-counts.**
- **The floor is a set-based, index-backed SQL predicate inside the data-fetch query** (row-eliminating WHERE + a once-per-request visible-field projection list), never a per-row post-fetch pass — so a 500-row list view is not an N-projection. Batch/stream egress governs set-wise with one audit row per batch; an N+1 detector guards the governed-read path; a long stream re-checks expiry per chunk.
- **Streaming is signal-only (D23):** the wire payload is `{table, pk, version, op}`, never columns; the client re-fetches through the metered door. **Restricted-tier rows are push-silent** (no signal, no DELETE event — a signal is an existence oracle). `postgres_changes` is lint-banned on any tenant/party/restricted/sensitive/financial table. Broadcast-send is a separate capability from subscribe; topic strings resolve to their owning resource + active-tenant context. Revocation on managed realtime = signal-only + ≤60s JWT TTL (`R5`); true epoch force-close only on hosted Inngest/SSE. Re-fetch storms are coalesced (short-TTL memo keyed on `(principal, target, version, governance_version)` + server-side signal debounce). Subscription open/close is audited (survives forced close).
- **Observability minimization (D24):** trace/APM/**error-telemetry (Sentry)** are first-class, arch-tested egress doors — a `beforeSend`-equivalent scrubber is default-on and its _absence_ fails an arch-test; restricted field-classes, any `party_restricted` object, and SQL params over restricted tables never leave the process; error backends are region-pinned under the residency veto. General traces record a **uniform "not permitted"** for floored-target and not-found alike; the discriminating reason writes only to the read-audited security channel.
- **Uniformity oracle (`R7`), one shared contract + property test:** denied-by-security-floor ≡ denied-by-purpose-floor ≡ genuine-not-found, **byte- and timing-indistinguishable, on every surface including view-as.** Because the denied path is forced to do _more_ DB work (load + classify + suppress) than a short-circuit not-found, the restricted path uses **constant-time padding to a fixed budget** so denied/not-found/suppressed share p50/p99; the CI test is **statistical**, not byte-equality; `R6` yields to safety for the restricted tier, stated explicitly.

### G. Purpose/consent, residency & crypto (D20/D21/D25 + R1/R2/R3)

- **Purpose is a mandatory resolver dimension** (`resolve(principal, active_assignment, target, purpose)`) — the consent/legal-basis axis is AND-composed as its own floor, **not a sibling PDP** (LinkedIn Data Guard is the state of the art: purpose in the single enforcement point). Purpose is **bound to the egress surface, not caller-asserted**: each door declares its allowed purpose set; the resolver rejects any purpose outside it (arch-test); purposes are a closed CI-verified registry (Salesforce `DataUsePurpose` parity). Religious belief is Art. 9 special-category data — structural in a missions CRM, unlawful to process without this axis. Channel × purpose **contactability consent** (readable ≠ contactable) unifies the existing `packages/api/src/email/consent.ts` gate under the same epoch (no "override opt-in" for restricted/marketing). v1 = the axis + AND-composition + purpose-epoch; Art. 9 conditions / subject-access / minor-consent / retention docs are seam-v1 config on top. Fire-time re-resolution re-validates purpose + consent + residency against the current epoch and never replays a stale enqueue-time purpose.
- **Residency (D21)** = `data_region` + `transfer_basis` columns + a **hard veto after grant/floor** (both must pass); intent is settable **per-record by threat model** (deliberately out-of-region/sovereign for the endangered), with **no silent default for the restricted tier** — placement is a required decision at classification time (`R4`). Residency is an access-veto **and** a **placement build-invariant**: restricted data is excluded from out-of-region backups, replicas, embeddings, error backends, and CDN by build-invariant; residency is a column on every egress audit row.
- **Crypto (D25 + R1/R3).** `decrypt.<field>` is a **distinct capability** (separate grant from read), reached only through a **resolver-gated RPC in a separate least-privilege DB role** (revoke direct `SELECT` on ciphertext and key), rate-limited + durably read-audited-before-return; **no blind index** on restricted-identity fields; no dashboard/aggregate/embedding path touches the key. On `pgcrypto` (the only substrate in-tree, deprecated in PG17 — a named dependency risk), encryption-at-rest is DB-file-theft defense only, **not** a second gate against an app path holding the key — stated defensively in the product narrative. The `decrypt` RPC returns through a **key-provider _envelope_ interface** (wrapped-DEK in/out, key-version tag, re-wrap) with pgcrypto underneath, so v1 stores `(version, ciphertext)` and BYOK/HYOK adopts without a data migration. **`R1`:** restricted-tier DEKs are by-design unrecoverable, no escrow; break-glass (D17) and the immutable change-history hold identifiers-and-ciphertext only. **`R3` (target, never a v1 property):** BYOK/HYOK — platform-cannot-decrypt the restricted tier — so "even we cannot read your endangered workers, even if compelled" becomes true; bought at the price of "even we cannot recover them."

### H. Audit, access-review, SoD & rate budget (D8/D15/D19)

- **Read-audit on restricted/sensitive persons** (a _read_ is the harmful act) — the read-audit is the safety artifact and is **hash-chained** (`prev_hash` per row, computed in-txn) so a compromised operator cannot undetectably delete the record of the exposure they caused; a periodic verifier alarms on break/gap. **Field-value change-history on access-_governing_ fields** (`security_level`, tier, tags, owner, group membership, capability grants) is immutable and long-retention, distinct from ordinary field history; for restricted-tier fields it records **field-key + version + actor, never plaintext** (proofs over ciphertext).
- **Recertification** (D8) is the **primary de-provisioning lever** a no-DENY model demands: sensitive-tier eligible grants carry `last_activated_at` + `recert_due_at`; a past-due sensitive eligibility is inert until re-attested; **fail-closed-on-no-response** but **tier-scoped** (sensitive/restricted only), **event-triggered micro-recert preferred over calendar campaigns**, a loud pre-expiry grace window (never a silent cliff), a **hard last-admin / last-clearance-holder carve-out**, and **quorum-aware** (routes to a platform/delegated external reviewer when the pool is 1).
- **Separation-of-duties (D15)** is a policy object + a **detection scan over the _resolved_ capability set** (prevention ≠ detection; toxic combos assembled across a group + a grant surface). The scan **emits a coverage statement** ("evaluated N pairs, 0 violations" vs "0 pairs configured") and binds to the current epoch; JIT activation is placed under **NIST dynamic SoD** (blocked at activation time, not only nightly). "Self"/"not-in-chain" predicates resolve on **`party_id`**, re-checked at request _and_ activation (a multi-hat human cannot request on hat A and self-approve as hat B). v1 non-money pairs: `manage_grants` vs `manage_membership`, grant-self-admin, `decrypt`-admin vs data-reader.
- **Rate-of-access budget (D19)** is a **synchronous-DB windowed budget** with a **sliding window** (boundary-burst-safe), **per-principal-per-purpose** (not one global knob), **step-up-not-deny above the line** (mirroring Salesforce ReportEvent limit-or-2FA) and **hard-deny for the restricted-person read budget and restricted export** (a single-row conditional-decrement `UPDATE … WHERE used+n ≤ cap RETURNING`, deny on zero rows, before the first row streams — striping forbidden on a hard-deny budget), partitioned by `(tenant, principal, purpose)` with a per-tenant ceiling (no cross-tenant DoS on another org's safety budget). A deterministic action-level export gate refuses "export the whole restricted segment" as one decision. **Disabling the detector is itself a physical-safety event**; the ML/peer-group/impossible-travel body is deferred (no users to baseline).
- **Aggregate/inference:** any aggregate is computed over the **post-floor projection**; small-cell suppression (numeric N, tenant-tunable) is a **floor property of the aggregate/query-predicate door** (a `COUNT WHERE restricted GROUP BY country` is an existence oracle), returning uniform not-found below N and feeding the uniformity oracle.

### I. Elevated access — testing, impersonation, named grants, recovery (D6/D7/D10/D17)

- **Permission testing / "view-as" (D6)** is the _default_ path for "see what they see" — no identity swap, no write path; plus a field-level `traceDecision` (the privileged, audited inverse of the uniformity oracle) so a false-deny is diagnosable without over-granting.
- **Impersonation (D7)** is structurally blocked from restricted-tier tenants except via a JIT ceremony; runs under **subject-floor ∧ operator-ceiling (meet, never max)**; is view-only by default; blocks destructive actions (delete account, change auth/MFA, rotate creds); requires an account opt-out flag and a reason; writes an impersonation record at session _start_; carries `acting_principal` + `on_behalf_of` + `impersonation_session_id` on every event (never collapsed to the subject); self-impersonation errors, non-re-entrant (depth cap 1); a **velocity alert** fires on N sessions/account/24h; **freeze/suspend resolves the principal to zero capabilities** and force-closes streams (the Varonis breach seeded from 600+ frozen super-admins that retained permissions).
- **Named-person grants (D10)** carry reason/provenance and an explicit **survive-vs-die-on-owner-transfer** rule; restricted named grants FK the grantor authority too and **die on grantor departure** (fail-closed); an orphaned-delegation sweep catches grantor-inert grants. **Delegated administration** is dual-bound (scope + ceiling), non-self-expandable, over the **transitive closure**, with the ceiling a **live read against the delegator's _current_ resolved set** (attenuation — never stored); property test: "no delegated administrator can cause any principal (including self) to hold a capability the delegator lacks."
- **Tenant recovery / break-glass (D17)** is a platform-operated, consent-logged, independently-authenticated path (sole-admin dies/leaves/off-grid — common in missions); **explicitly excludes restricted-tier plaintext** (not a covert key-escrow backdoor — recovery via an RPC structurally denied `SELECT` on `party_restricted` and restricted counts); a capability-level last-admin guard (≥1 live resolver of `permissions.manage`) that recert can never strip; and a **recovery fire-drill seam** (periodic verification the path still works — untested-by-design rots).
- **One advisory-locked grant-state DB function** (the repo's custom-collection-reorder lock pattern) is the sole path for every grant-state mutation — activate / widen / revoke / recert-revoke / mover-cascade — re-reading holders under lock, so two admins removing each other's grant cannot both commit and orphan the tenant, and the last-admin / last-clearance post-conditions are tenant-global and atomic.

### J. SSO / SCIM (D9 — RATIFIED: SEAM-ONLY)

Model SSO/SAML/OIDC configuration as an **inert principal source** (the data model has a home) and wire only the one safety-relevant SCIM event now: **`active=false` → grants-epoch bump + session force-kill**, exactly like any other revocation. Full identity-provider integration is deferred to the enterprise phase. Invitation & email-change identity binding: single-use invite token scoped to `(source tenant, target tenant, invited email)`, accept-session email must match, sensitive-tier grants re-evaluated/suspended across an identity change.

### K. Cross-cutting rulings summary (R1–R7)

`R1` restricted DEKs unrecoverable + no escrow · `R2` purpose axis folded into the one resolver · `R3` BYOK/HYOK is the target posture (platform-cannot-decrypt restricted) · `R4` no silent residency default for the restricted tier · `R5` ≤60s revocation accepted on managed DB realtime · `R6` governed read ≤1 SELECT + ≤1 ledger UPDATE (logical bound, sharded carve-out) · `R7` one existence-oracle uniformity contract + property test.

---

## Data Model & Ownership-Matrix Extension

New record types this phase introduces — **each must be added to the Phase 1 ownership matrix** with owner / write-path / conflict-winner / repair (Asym Postgres owns all; write-path is the `packages/api` service through the advisory-locked grant-state function where applicable; conflict-winner is the epoch-guarded latest committed mutation; repair is the orphaned-grant/epoch-reconciliation sweep):

`permission_capabilities` (code-generated) · `role_capability_grants` (code-generated) · tenant-authored capability registry entry (`source='tenant'`) · `groups` · `group_membership` · `group_capability_grants` · explicit assignment/group/named-grant **Legal Entity scope rows** with a canonical scope head/revision · `permission_change_request` + decision · permission/access **audit event** (hash-chained) · access-**governing-field change-history** · `permission_test_session` · `impersonation_session` · `named_person_grant` (extends Phase 10 `identity_access_grants` `subject_type`/`scope_ref` additively) · service-account / **NHI principal** · SoD **policy object** · **access-review / recertification** campaign · **sensitive-grant alert** · **rate-of-access ledger** (striped) · `sso_connection` + `sso_group_mapping` (inert, seam) · the **active-assignment** selector on `authz.memberships`.

Every table carrying tenant data has `tenant_id NOT NULL` + RLS referencing the unified `current_tenant_id()`; every grant/membership row FKs the **membership (assignment) id**, never the bare person.

Entity-scope rows use composite Tenant + Legal Entity FKs, are grants-only, and
are mutated through the same advisory-locked grant-state path. The current
scope head stores a monotonic revision and a canonical set hash; it stores no
copied legal identity or provider/accounting identity. Removing an entity from
scope bumps both the scope revision and `governance_version`. Single-entity
tenants receive one generated scope row and no additional permission-screen
step; the advanced entity selector appears only after proof-gated
multi-entity activation.

---

## Testing Decisions

Good tests here assert **external, security-observable behavior** — "a grant can never exceed the floor," "a cross-tenant serve fails," "a denied restricted read is indistinguishable from a missing one" — not internal shape. Prior art: `tests/unit/packages/api/admin/contribution-operations-permissions.test.ts` (capability-array behavior), the repo's advisory-lock reorder tests, the Phase 11 egress meta-test, the `verify:data-boundary` golden-snapshot CI pattern.

**P0 CI / property / architecture gates (red-on-regression, each with a committed _failing_ poison-fixture proving the gate bites):**

1. **Floor inviolability (property + differential):** `union(any grants) MINUS floor ⊆ floor-permitted`, over arbitrary role+group+named-grant combinations, _and_ **differential random testing against a tiny executable reference model** (the method AWS used to build Cedar — proofs found 4 bugs, DRT found 21 more).
2. **Cross-tenant isolation:** `resolve(_, assignment@A, target@B, _)` returns not-found via the uniformity oracle; a cross-tenant serve fails to type-check and fails `verifyEffectiveAccess()`; the tenant sources cannot diverge; the fan-out set ⊆ one tenant's principals.
3. **Legal Entity isolation inside one Tenant:** an Entity-A token cannot read,
   mutate, filter, aggregate, export, enqueue, or fire work for an Entity-B
   financial row. Missing entity, inferred default, stale scope revision,
   mismatched scope hash, scope removal during a job, and cross-entity bulk
   selection all fail through the same uniform not-found contract. An explicit
   all-entities grant remains bounded to the current Tenant registry.
4. **Positive RLS-isolation gate:** every tenant table has RLS referencing the unified source, no identity/capability escape, no `USING(true)`; DB-introspection over `pg_policies` (defeats dynamic-SQL/`format()` policy bodies).
5. **Names-never-authorize lint** across `packages/api` **and** `supabase/**/*.sql`; `as EffectiveAccess`/`as Capability` + `@ts-expect-error` bans in `packages/auth`.
6. **Registry↔seed↔DB** golden-snapshot + `assertRegistryMatchesSeed()` boot check + FK `ON DELETE RESTRICT`.
7. **`(module,level)→capability` map:** coverage/surjectivity, monotonicity, no sensitive below Admin (against seed definitions too), no "see-all-fields" capability.
8. **Egress closure:** the `EgressDoor` `never`-switch + golden-snapshot inventory + the metering side-effect assertion; `postgres_changes` lint-ban on tenant/party/restricted/sensitive/financial tables.
9. **Metering/audit:** audit committed before response bytes for the restricted tier; audit over-counts never under-counts; hash-chain verifier; `R6` ≤1 SELECT + ≤1 ledger UPDATE (N+1 detector on the governed-read path).
10. **Revocation liveness:** a grant two hops from a principal bumps that principal's `governance_version` (a test that _narrowing_ the fan-out fails CI); a revoked user's live session and cache lose access within ≤60s (managed realtime) / immediately (elsewhere).
11. **Uniformity oracle (statistical):** denied-by-security ≡ denied-by-purpose ≡ not-found on byte, status, and **p50/p99 timing** (constant-time padding on the restricted path).
12. **Floor composition:** `edit(field) ⟹ view(field)`; purpose bound to surface (no egress calls `resolve()` without a registered purpose); residency veto after grant/floor; small-cell suppression on the aggregate door.
13. **SoD:** self/chain on `party_id` under multi-hat; dynamic SoD blocks a toxic maker/checker pair at activation.
14. **Concurrency:** the advisory-locked grant-state function under two-admin races (no double-remove orphan; last-admin/last-clearance post-conditions hold); serializable merge tightens tier before any child repoint (every intermediate snapshot ≥ meet-tier).
15. **Red-team gate:** a maintained injection/exfil corpus (incl. the cross-modality chains: AI + realtime + consent + telemetry) must pass before any AI-over-person-data ships; one restricted-worker exfil in red-team = release blocker.

---

## Build Order (what the PRD tells the agent to build, and in what order)

Nothing in a later group ships until the earlier group's CI gates are green.

**SHIP-FIRST — the structural substrate, before any grant data exists** (a wrong choice here is unrecoverable):

1. Tenant-global monotonic epoch (not per-principal in-txn fan-out).
2. Assignment-bound, epoch-revocable grant contract **+ the active-assignment primitive** (server-owned, validated every request, re-validated at fire-time).
3. Canonical Legal Entity scope head/revision/hash + exact
   `legal_entity_id` PEP check + quiet single-entity seed.
4. Tenant in the brand + unified RLS source + delete `OR is_super_admin()` + kill the `…0001`/`member_care` defaults + cross-tenant-edge invariants + the positive RLS-isolation gate.
5. `profiles.role` inert-for-authz / `super_admin` via the capability path.
6. Runtime-verifiable HMAC `EffectiveAccess` + `verifyEffectiveAccess()` at every PEP + cast/`@ts-expect-error` bans.
7. The one advisory-locked grant-state DB function with tenant-global last-admin / last-clearance post-conditions.
8. **Non-prod isolation floor (D22):** sign-or-delete the `E2E_AUTH_BYPASS` cookie + a non-prod project-ref allowlist (not `NODE_ENV`) + synthetic-only restricted fixtures + the build/CI invariant.

**BUILD-V1 — the enforced product** (each behind a named gate): the central resolver + capability registry/tables; groups + seeded defaults; the `(module,level)→capability` map + `PermissionModule` enum; module/entity/field permissions on the Phase 11 catalog; classification/tags/geo/alias + whole-record protection; the set-based floor predicate; the metering choke + tiered audit-before-serve + hash-chained read-audit + transactional outbox; the tiered rate budget; signal-only streaming + coalesced re-fetch + Payload once-per-operation + epoch-keyed client cache; purpose/consent axis + residency axis + `decrypt` capability & RPC; SoD detection; recertification (quorum-aware); view-as + `traceDecision`; impersonation stack; named grants + delegated admin; tenant recovery; `explainAccess`; versioned `FloorContribution` interfaces; the full P0 gate suite + poison-fixtures + reference model.

**SEAM-V1 — schema/hook now, UI/full-integration deferred:** SSO/SCIM (inert config + the one SCIM revocation wire); `muted_capabilities` (typed convenience-only); ABAC condition slot; nested-groups schema (flat v1); "view-as-group"; bulk-widen; the key-provider _envelope_ interface (pgcrypto underneath); NHI sender-constrained tokens; the D-IR restricted-exposure incident-response runbook; the D17 recovery fire-drill.

**DEFER — named phase:** BYOK/HYOK build (`R3` target → enterprise/crypto phase); the ML anomaly body (D19 → after there are users to baseline); full IdP wiring (enterprise phase); the build-vs-buy re-evaluation of the additive RBAC/ReBAC layer only (pre-committed trigger: the moment nested groups or ABAC conditions ship live).

---

## Out of Scope

The full enterprise IdP integration (SSO seam only) · the ML/behavioral-anomaly detection body · BYOK/HYOK key-custody build (v1 ships the envelope interface + `decrypt` capability; the custody boundary is the target) · money-specific capabilities (`refund.execute`/`approve`; Phase 12 only requires the D4 model can express SoD-conflict pairs + default-masked field tiers — Phase 13 mints the caps) · the member-care case product + the exposure report (Phase 38) · nested/inherited groups, ABAC conditions, criteria-based sharing rules, per-locale CMS scope algebra, media/DAM asset ACLs, content edit-locks, historical/as-of visibility (seams named, built later) · report-builder permissions as their own model (consumes Phase 12 capabilities; built in Phase 33).

## Further Notes

- **Roadmap position:** Phase 12 of 41 (roadmap v2, adopted 2026-07-07). Hard-blocked on Phases 3, 9, 10, 11. Consumers: Phases 13/21/30/31/33/34/6/38/40.
- **ADR to write:** an ADR recording the capability-based spine + the tenant-axis-in-the-token decision + the in-house-resolver-over-policy-engine choice with its pre-committed re-evaluation trigger (hard-to-reverse, surprising-without-context, a real trade-off — all three ADR criteria met).
- **Glossary (add to root `CONTEXT.md`):** _Capability_ (a specific enforced permission; the sole enforcement unit) · _Group_ vs _Role_ vs _Named grant_ (bundles that resolve into capabilities) · _The floor_ (the subtract-only safety layer that always wins) · _Tenant Authorization Context_ (the server-derived discriminated Tenant input: a membership-backed Active Tenant Assignment, public-only Public Projection Context, single-Tenant Service Tenant Context, or audited Operator Tenant Grant Context) · _Active Tenant Assignment_ (the one Tenant-membership/org-hat a membership-backed person acts within per request; never Phase 21's Support Assignment) · _EffectiveAccess token_ (the runtime-verifiable output of the one resolver, including Legal Entity scope hash/revision where applicable) · _Legal Entity scope_ (a subtract-only set inside one Tenant) · _Purpose_ (the required "for what" input; the consent/legal-basis axis) · _Protected constituent_ (a whole-record restriction as a floor row) · _Existence oracle / uniformity_ (why blocked and missing must look identical).
- **Verification provenance:** design ratified 2026-07-08 via `grill-with-docs` (26 decisions, 7 rulings) then five adversarial passes — a D1 spine research + adversarial hardening, two cross-domain completeness sweeps (sweep-1: 33 findings; sweep-2: AI/realtime/encryption/consent/financial/anomaly/residency + a 4-lens panel), a definitive 8-cluster best-practice + nonprofit-CRM benchmark validation, and a final ruthless 7-lens risk-category review that surfaced the tenant-axis substrate cluster. Benchmarked against Salesforce NPSP/Shield, CiviCRM, Blackbaud RE NXT, Bloomerang, Neon, Virtuous, DonorPerfect, MinistryPlatform, SiteStacker/WMTek, TntConnect, and Cedar/OpenFGA/Zanzibar/Cerbos/Entra-PIM/SailPoint. Two live code hazards found and owned (`packages/auth/e2e-auth.ts` unsigned bypass → D22; `use-supabase-realtime.ts` raw streaming → D23). **No "live/shipped" claims** — this is a design, groomed against not-yet-built Phase 3/9/10/11 contracts.

## Dated Phase 17 capability amendment (2026-07-19)

**Old statement.** Phase 12 provides the capability-only PDP, broad per-entity
template/CMS permissions, draft/unpublished enforcement, active assignment,
tenant branding in access, and maker-checker governance. It does not enumerate
the Phase 17 product's smaller action atoms.

**New winner.** The code capability registry gains distinct, auditable Phase 17
atoms for: view catalog/readiness; manage drafts; publish standard content;
`system_messages.review.protected`; `system_messages.publish.protected`; manage
Brand Kits, Role Layouts, locale activation, Delivery Plans, Resend connection,
Sender Profiles and human-reply destinations; reveal eligible Recent sent
copies; export/import/accept transfer; and operate bounded message repair. The
atomic **Approve & publish** protected-content command requires both protected
atoms and a human principal different from every substantive author/editor of
that exact head and review epoch. It does not require a third publishing actor.
Exact remaining names are minted once in the implementation manifest; each UI
action maps to the smallest applicable atom and active assignment.

**Compatibility boundary.** Role names, job titles, possession of a template
id, browser state, imported authority, and provider credentials never
authorize. The System message contract owns the D11 publication-review floor;
a tenant may require another reviewer more broadly but cannot weaken that
floor. No Phase 17 approval chain, role system, policy engine, or workflow
engine is created. Every tenant-facing Phase 17 row carries `tenant_id NOT
NULL`, same-tenant composite references, and the Phase 12 floor; delegated
review exposes only the bounded synthetic review projection.

## Dated Phase 21 D8 feed-authorization amendment (2026-07-30)

Phase 31's Missionary Support Feed uses one non-human integration principal and
one prospective Subscription Version for the exact Tenant, Legal Entity,
destination organization/product/environment, Missionary Support Feed
Recipient, Missionary Support Feed Subject, purpose, Designation or Field
Account scope, resource and field families, bounded history, currencies,
schema, adapter certification, and authorization epoch. The external
destination principal and the Support Assignment whose projection is shared
are distinct scope dimensions even when a provider models them as one profile.
Neither a broad PAT, human role, provider credential, cursor, connection flag,
nor possession of an opaque identifier is authorization.

Every request and every queued egress receives one decision from the sole Phase
12 PDP, which resolves the current server-side Subscription Version and applies
the Phase 3/10 floor internally before producing the projection. Scope expansion
requires an explicit prospective grant. Scope
contraction increments the authorization epoch, denies future positive
disclosure immediately, invalidates old cursors, and cancels or rechecks queued
work before transport. A still-valid provider token cannot bypass that local
deny-first fence, and reconnect creates a newly reviewed grant rather than
reviving an old authorization epoch.

Phase 31 must mint only the smallest feed administration, activation,
inspection, stop-sharing, and technical-evidence capability atoms needed by
the eventual implementation. Those atoms do not confer source-domain read
authority, raw-table access, arbitrary-field export, contact solicitation,
accounting access, payroll authority, or provider-side deletion capability.
Per-principal and per-tenant egress budgets, audit-before-sensitive-read, secret
protection, revocation, and tenant-isolation tests remain mandatory.

## Dated Phase 21 D10 expense and AI capability amendment (2026-07-30)

The capability registry must keep these D10 powers independently grantable:

- view AI feature posture and health;
- create or manage AI Provider Connections;
- replace or revoke write-only AI Provider Credential Revisions;
- preview and activate prospective AI Capability Binding Versions;
- view purpose-scoped usage and cost observations;
- invoke receipt extraction or expense-match suggestion;
- accept or reject a suggestion for an authorized Expense Claim;
- submit, review, approve, return, reject, or override an exact claim/version;
- read private Receipt Evidence for an exact permitted purpose; and
- retrieve protected, PII-minimized AI/expense audit evidence.

The implementation manifest may refine atom names, but it cannot collapse
connection/credential administration, feature activation, invocation,
suggestion acceptance, expense review, policy override, evidence access, and
audit retrieval into one `admin` or `manage_ai` capability. A job title,
provider account, API key, model Binding Version, report membership, or opaque
identifier is not authorization.

Every request and queued invocation uses the sole Phase 12 PDP to re-resolve the
current active assignment, Tenant, Legal Entity, claimant/worker scope, feature
purpose, and evidence purpose and to apply the Phase 3/10 floor internally
before enumeration or egress. Credential replacement or
revocation requires fresh authority, previews every affected purpose, fences
stale workers, and creates immutable evidence. An AI feature can never widen
the human's authority or accept its own suggestion.

## Dated Phase 21 D11 Field Account integrity capability amendment (2026-07-30)

Phase 21 D11 powers are separately grantable:

- view close readiness without protected audit detail;
- view an authorized Support Cycle Integrity Manifest;
- authorize a Support Cycle Close;
- view a Field Account Integrity Case;
- assign or follow up on a Field Account Integrity Case;
- invoke each permitted repair through the capability of its owning domain;
- configure prospective cadence, owner routing, reminders, advisory
  acknowledgment, and optional proportional review; and
- retrieve protected Field Account integrity audit evidence.

One authorized person may hold every applicable power, and Asym imposes no
second approver by default. A tenant may prospectively require a separate
reviewer for its own material or high-risk thresholds without creating a
generic approval workflow.

No role or capability may waive balance, Tenant/Legal-Entity/purpose/account/
currency isolation, unique source coverage, immutable history, captured-cursor
completeness, atomic pair behavior, or mandatory adverse-correction
continuity. `force_close`, `force_balance`, generic `mark_fixed`, variance
acceptance, suspense/plug creation, and direct-entry or balance-edit
capabilities do not exist.

Every close, case, repair, configuration, and protected-evidence request
reauthorizes the exact Tenant, Legal Entity, ISO currency, affected Field
Accounts and purposes, evidence classification, expected source/policy/account
versions, and current assignment before enumeration or mutation. Holding a
Mission Control task, task-assignment permission, QBO/Xero access, or a
provider credential grants no Field Account financial authority.

## Dated Phase 21 D13 expense-governance capability amendment (2026-07-30)

Phase 21 D13 refines the broad D10 expense-review powers into these separately
grantable capability atoms:

- view Expense Program posture, Expense Governance configuration, and
  production-shaped simulations;
- preview, activate, or prospectively turn off the Expense Program for one
  exact Tenant and Legal Entity;
- draft an Expense Governance Profile Version;
- preview, schedule, activate, or cancel a prospective Expense Governance
  Profile Version;
- create or change a bounded prospective Expense Governance Assignment or
  Expense Policy Cohort membership;
- draft an Expense Approval Route Version;
- preview, schedule, activate, or cancel a prospective Expense Approval Route
  Version;
- delegate, assign, or reassign review work without gaining authority to decide
  it;
- review and decide exact Expense Claim Version item or split coverage;
- invoke **Approve clean claims** for the exact clean eligible set while
  preserving one Expense Review Action per covered decision;
- decide a typed Reviewer Exception independently from ordinary claim review;
- read private Receipt Evidence for one exact permitted expense purpose; and
- retrieve protected, PII-minimized expense-governance audit evidence.

The implementation manifest may mint finer action names, but it cannot collapse
program activation, policy drafting, profile/cohort assignment, route
administration, delegation or work assignment, ordinary review, clean-claim
bulk invocation, exception authority, private-evidence access, or audit
retrieval into one expense-admin capability. Configuring a Profile or Route
does not grant review power; assigning work does not grant decision power;
ordinary approval does not grant Reviewer Exception authority; and holding AI,
payroll, AP, Field Account, Phase 20, QBO, or Xero authority does not grant any
of them.

Every preview, activation, assignment, reassignment, review, bulk action,
exception decision, private-evidence read, and protected-audit retrieval
reauthorizes the exact Tenant, Legal Entity, claimant and relationship scope,
Expense Claim Version item or split coverage, jurisdiction, incurred-date
governance context, submission-time route, evidence purpose, current active
assignment, and Phase 3/10 floor. A current capability authorizes an action; an
Approval Assignment Snapshot records historical routing and never carries
continuing authority. Self-review, interested review, AI approval, timeout
approval, and automatic approval capabilities do not exist.

## Dated Phase 21 D14 organization-card evidence capability amendment (2026-07-31)

Phase 21 D14 powers are separately grantable:

- view organization-card evidence posture and authorized source health;
- create or retire one Organization Card Source for an exact Tenant and Legal
  Entity;
- draft, test, preview, activate, supersede, or retire an Organization Card
  Import Profile Version;
- upload and inspect one private Organization Card Activity File Asset;
- review a classified import preview and accept the exact Organization Card
  Activity Import Manifest;
- create, preview, activate, supersede, or end one effective-dated Organization
  Card Assignment Version;
- view authorized Organization Card Transaction Evidence Versions;
- confirm or reject one Possible overlap relationship without gaining expense
  approval;
- record typed Organization Card Source Adjustment Evidence;
- respond **Not my charge** for the exact claimant-safe assigned occurrence;
  and
- retrieve protected, PII-minimized D14 audit evidence from which unmasked PAN
  and sensitive authentication data were rejected at intake.

The implementation manifest may mint finer action names, but it cannot collapse
source administration, profile administration, private-file access, import
acceptance, assignment, overlap decision, source correction, claimant response,
expense review, private Receipt Evidence, or protected audit retrieval into one
card or finance-admin capability. Import authority grants no Expense Policy
Decision, Approved Expense Snapshot, Reimbursement Obligation, Field Account,
personal-repayment, external-payment, Phase 20, QBO/Xero, issuer-settlement, or
card-liability-payment authority.

Every source, profile, file, preview, import, assignment, evidence read,
overlap decision, correction, claimant response, task, queue, export, and audit
request reauthorizes the exact Tenant, Legal Entity, Organization Card Source,
billing currency, safe card identity, effective assignment, claimant,
occurrence and claim coverage, evidence purpose, current active assignment, and
Phase 3/10 floor before enumeration or mutation. Possessing a file digest,
manifest ID, card mask, claimant task, accounting role, QBO/Xero connection, or
future issuer credential never widens that decision. Personal-card batch
browsing, full-PAN access, fuzzy auto-merge, destructive undo, automatic
approval, automatic reimbursement, and direct accounting-delivery capabilities
do not exist.

## Dated Phase 21 D15 reimbursement-handoff capability amendment (2026-07-31)

Phase 21 D15 powers are separately grantable:

- view authorized reimbursement-route posture and safe capability health;
- draft, preview, activate, supersede, or retire a prospective Reimbursement
  Delivery Profile Version;
- prepare and preview one immutable Reimbursement Handoff Package without
  releasing it;
- retrieve a protected reference or audit copy of one authorized package
  without creating an Execution Claim or Handoff Attestation;
- explicitly release exact obligation coverage through **Handle outside Asym**
  and record one Handoff Attestation;
- explicitly release exact obligation coverage through one currently certified
  payroll or accounts-payable pre-execution draft/input operation;
- inspect and resolve an `outcome_unknown` handoff operation without blind retry
  or route substitution;
- create an append-only residual successor only for exact coverage proved not
  handed off or not executed;
- record source-qualified External Payment Occurrence evidence and exact
  Reimbursement Payment Coverage;
- record a return, partial reversal, reversal, correction, or reissue through
  its source-owned command; and
- retrieve protected, PII-minimized reimbursement-handoff audit evidence.

The implementation manifest may mint finer actions, but it cannot collapse
profile administration, package preparation, protected artifact access,
outside-Asym release, Handoff Attestation, connected provider release,
ambiguous-outcome inspection, residual succession, payment-evidence recording,
adverse-payment recording, or protected audit retrieval into one
reimbursement, payroll, AP, finance-admin, or accounting capability. Download
does not grant release; release does not grant payment attestation; payment
evidence does not grant route administration; expense approval, Field Account,
payroll/AP, Phase 20, QBO/Xero, task-assignment, or provider-credential
authority grants none of these implicitly.

Every profile, package, retrieval, release, attestation, provider operation,
readback, ambiguity inspection, residual successor, payment-evidence action,
adverse fact, queue, export, and audit request reauthorizes the exact Tenant,
Legal Entity, source-owned claimant relationship and authoritative payee,
reimbursement family, obligation and non-overlapping coverage, ISO currency,
external execution owner, provider organization/product/country/environment,
participant, cadence/cycle, certified operation, destination identity,
evidence purpose and strength, and current Phase 3/10/12 floor before
enumeration or mutation.

No capability may move money, store beneficiary-bank credentials, calculate or
approve payroll/AP, create a QBO/Xero Accounting object, assign the posting
owner of a future payment, dual-deliver, blind-retry, fuzzy-match payment,
silently upgrade evidence strength, mutate released history, or create
claimant-repayment source truth outside the separately authorized D16 commands
below.

## Dated Phase 21 D16 advance and claimant-repayment capability amendment (2026-07-31)

Phase 21 D16 powers are separately grantable:

- view authorized advance/repayment posture and claimant-safe case status;
- draft, preview, activate, supersede, or retire an Expense Advance Policy
  Version or Claimant Repayment Policy Version for an exact Tenant and Legal
  Entity;
- create, amend prospectively, or end an Expense Advance Authorization Version;
- authorize the exact `expense_advance` Field Account funding component only
  when the actor also has current authority over that purpose-scoped capacity;
- record source-qualified Expense Advance Issuance Occurrence evidence and its
  exact evidence strength;
- invoke the pinned source-contract resolver for Advance Application Readiness
  or record source-qualified correction evidence, never a discretionary manual
  readiness assertion;
- decide one atomic Expense Settlement Determination over exact Approved
  Expense Snapshot coverage;
- make an immutable Repayment Subject Determination under source,
  relationship/jurisdiction, and conflict-safe authority;
- record one Claimant Repayment Decision, with **Request external return**
  separately grantable from no-action, source-correction, or specialist referral;
- view or follow up on the resulting operational Claimant Repayment Requirement
  without gaining debt, collection, payroll-deduction, or money-movement power;
- record source-labelled repayment evidence and an exact Claimant Repayment
  Occurrence, coverage, residual, return, reversal, or cause-linked correction;
- open or resolve a Repayment Restitution Review through its independently
  authorized source and external restoration path; and
- retrieve protected, PII-minimized D16 audit evidence.

The implementation manifest may mint finer actions, but it cannot collapse
policy administration, advance authorization, Field Account capacity authority,
issuance evidence, readiness determination, expense settlement, repayment-
subject determination, return decision, Requirement follow-up, occurrence/
evidence recording, specialist referral, restitution review, private-evidence
access, or protected audit retrieval into one expense, finance-admin, Field
Account, payroll/AP, or accounting capability. Authorization does not grant
issuance attestation; issuance does not grant readiness; expense approval does
not grant advance application; card assignment or personal classification does
not grant repayment-subject authority; and holding a task, provider credential,
QBO/Xero connection, Accounting Release role, or bank-match role grants none of
them.

Every policy, authorization, funding component, issuance observation, readiness
decision, settlement, subject determination, return decision, Requirement,
occurrence, evidence read, correction, dispute, specialist referral,
restitution review, task, notification, export, and audit request reauthorizes
the exact Tenant, Legal Entity, authoritative claimant and relationship version,
responsible Party, jurisdiction and conflict route, purpose/source family,
Approved Expense Snapshot or repayment coverage, ISO application currency,
external execution owner, evidence purpose and strength, source version with
compare-and-swap, and current Phase 3/10/12 floor before enumeration or
mutation. A cross-currency application additionally requires current authority
over the exact externally owned source/settlement amounts, conversion authority,
rate, rounding, and residual; no capability may invent or edit an FX result.

No D16 capability may collect or move money, hold personal bank/card
credentials, adjudicate debt, calculate or initiate payroll deduction or setoff,
infer return from a task or acknowledgment, silently strengthen evidence,
fulfill Field Account Funding Coverage without a separately qualified Field
Account Effect, create a receivable without a separate accountant-certified
contract, or send policies, observations, tasks, Requirements, disputes,
reservations, or restitution workflow into Phase 20 accounting truth.

## Dated Phase 21 D17 opening-position capability amendment (2026-07-31)

Phase 21 D17 powers are separately grantable:

- view the authorized **Start Field Accounts** setup, safe preparation status,
  cohort totals, and non-sensitive exception summaries;
- create an import session and submit private source artifacts through the Phase
  29 byte lifecycle and Phase 30 transport surface;
- define or supersede a draft Opening Source Package precedence and exact
  per-predecessor-source boundary;
- map source identities and review Phase 21 mapping-admissibility failures;
- prepare, resume, or discard one non-authoritative staging generation;
- reconcile per-account and cohort positions, classify exact/reference history,
  and propose source-fact dispositions without activating them;
- resolve an exact mapping, source, coverage, negative-position, in-flight, or
  independently live coverage exception through its owner-domain command;
- review one immutable candidate Opening Coverage Manifest and activation
  consequence preview;
- perform the final finance-authorized, reauthorized and CAS-guarded Field
  Account Operational Cutover for the complete cohort;
- retrieve protected Opening Source Package and manifest evidence for an exact
  authorized purpose without changing activation or access/publication truth;
  and
- record or approve one cause-linked Opening Position Correction and manifest
  successor after independent source proof.

The implementation manifest may mint finer action names, but it cannot collapse
private artifact submission, source precedence, mapping, staging, exception
resolution, reconciliation, final review, activation, protected evidence
retrieval, or correction into one import, migration, finance-admin, Field
Account, accounting, or generic staff capability. The default may grant one
finance actor the ordinary preparation and activation flow for small tenants;
larger tenants may separate preparer and activator without changing the domain
contract. Import access grants no activation. Activation grants no Phase 20
posting, D9 publication, Phase 31 subscription, payroll/AP, reimbursement,
communication, document, or source-administration authority.

Every source, artifact, package, cohort, mapping, staging generation, exception,
manifest, preview, activation, evidence retrieval, correction, queue, export,
and audit request reauthorizes the exact Tenant, Legal Entity, ISO currency,
complete cohort, Field Account and purpose, predecessor source family and
environment, source boundary/cursor, source generation, mapping/adapter/parser
version, evidence purpose and classification, activation generation, and
current Phase 3/10/12 floor before enumeration or mutation. The final cutover
also re-proves current permission, source, cohort, mapping, control totals,
in-flight classifications, independently live coverage, first-close cursor,
and manifest generation; a stale or changed input returns to review.

No D17 capability may fuzzy-map financial identity, activate an arbitrary row
subset, silently exclude a fact, admit an unresolved or inadmissibly negative
cohort, create a mutable balance scalar, claim an external source was locked,
dual-write, destructively roll back, replay historical/downstream effects,
publish private evidence, bypass D9 workspace publication, assign Phase 20
posting ownership, or make QBO/Xero authoritative for a Field Account. Protected
evidence access remains classification- and purpose-scoped, short-lived, and
audited; possessing an artifact digest, operation ID, manifest ID, Field Account
role, QBO/Xero connection, or Phase 30 import role never widens it.

## Dated Phase 21 D18 travel-allowance capability amendment (2026-08-01)

Phase 21 D18 powers are separately grantable:

- view certified Travel Allowance Source Package posture and safe source
  metadata;
- draft, preview, supersede, or retire one bounded tenant-owned schedule version
  for an exact Tenant, Legal Entity, jurisdiction, method, unit, and policy
  period;
- record tenant- or qualified-adviser applicability confirmation independently
  from platform source certification;
- preview and prospectively activate one travel-allowance calculation module
  inside the single winning D13 Expense Governance Profile;
- review a source revision and the exact future, submitted, approved, or released
  work it affects;
- read purpose-authorized route, destination, companion, or optional location
  evidence independently from ordinary claim review where its classification
  requires narrower access;
- decide one D13-bounded travel exception or accept one exact external
  calculation without gaining schedule certification, schedule administration,
  expense approval, payment, tax, payroll, or accounting authority; and
- retrieve protected, PII-minimized calculation, coverage, and cumulative-
  capacity audit evidence.

The implementation manifest may mint finer action names, but it cannot collapse
platform source certification, tenant schedule administration, applicability
confirmation, D13 Profile activation, ordinary expense review, sensitive route
or location evidence access, exception resolution, external-calculation
acceptance, or protected audit retrieval into one travel, expense-admin, or
finance capability. Claim approval grants no schedule-administration power;
tenant configuration grants no platform-certification power; and holding a map,
model, payroll, AP, Phase 20, QBO, or Xero credential grants none of them.

Every source, schedule, applicability confirmation, Profile activation,
calculation, cumulative-capacity allocation, duplicate-coverage decision,
revision review, exception, external result, evidence read, correction, export,
and audit request reauthorizes the exact Tenant, Legal Entity, claimant Party,
source-owned relationship or engagement version, source and policy versions,
jurisdiction, expense date, method, unit, vehicle or other required capacity
dimension, purpose, claim item or split coverage, ISO currency, evidence
classification, applicable Profile assignment version, and Phase 3/10/12 floor
before enumeration or mutation.

No D18 capability may publish legal or tax advice, infer applicability from a
tenant address, silently stack calculations, edit an approved occurrence,
reserve capacity from a preview, reuse capacity across scopes, create an expense
claim, approve a claim, create a Reimbursement Obligation, mark payment, compile
an Accounting Release, or expose raw route/location evidence through ordinary
audit, support, or export access.

## Dated Phase 21 D28 cumulative-admission capability amendment (2026-08-02)

D28 preparation and activation powers are separately grantable from ordinary
claim entry, D13 profile administration, expense approval, protected evidence
access, payment, payroll, and accounting:

- view safe source-specific cumulative-admission posture and the exact current
  pool or indivisible-group census without receiving private evidence access;
- prepare or import a draft Opening Cumulative State for an exact pool through
  a source-authorized evidence method;
- view the separately classified evidence supporting that state or prospective
  source-completeness assertion;
- review the complete content-addressed Cumulative Admission Manifest and its
  exact calculation consequences;
- admit one complete pool or indivisible group to native D18 calculation at an
  exact prospective boundary;
- append a correction or approve an affected-suffix disposition without gaining
  expense-approval, obligation, payment, payroll/tax, or accounting authority;
  and
- retrieve the protected admission, first-use, correction, and containment
  audit for an exact authorized scope.

No broad travel-admin, finance, import, service, or Field Account capability may
collapse these powers. The server derives the Tenant, Legal Entity, claimant,
relationship, source, period, unit, pool/group, evidence, manifest, and
authorization epoch; reauthorization occurs before enumeration and again in the
first-use CAS. Possessing a Phase 30 import role, evidence digest, source-package
ID, D27 readiness record, Field Account role, or service credential never grants
admission or evidence access.

Where a service or `BYPASSRLS` path is unavoidable, the same Phase 12 policy
decision, mandatory scope predicates, composite constraints, commit-time epoch
and revocation reproof, and explicit bypass-path tenant-substitution tests remain
required. D28 cannot rely on RLS to constrain a role that bypasses it.

## Dated Phase 21 D19 Support Assignment participation and workspace-authorization amendment (2026-08-01)

Phase 21 D19 consumes this spine without creating a second authorization
product. Phase 21 owns the organization-controlled **Support Assignment** and
its prospective, effective-dated **Support Assignment Participant Membership**.
It registers exact resources, projections, purposes, and capability atoms with
Phase 12. Phase 12 remains the sole owner of principals, Active Tenant
Assignments, grants, groups, floors, Legal Entity scope, policy decisions,
authorization epochs, deny-first revocation, `EffectiveAccess`, explanation,
and authorization audit.

Terminology is binding. Phase 12's former shorthand **Active assignment** means
**Active Tenant Assignment**: the principal's exact current Tenant membership/
security context. It is not a Phase 21 Support Assignment. Public/API/schema
identifiers must distinguish `support_assignment_id` from the active Tenant
membership/assignment identifier and must never expose one ambiguous bare
`assignment_id`. The existing `public.support_assignments` table remains
Support Hub conversation routing and cannot be reused as the Phase 21 subject.

Authenticated tenant humans include staff, donors, and missionaries with exact
current memberships. They use the same PDP and floor; a missionary is neither
public/anonymous nor automatically staff. Party participation, spouse/
household/team relationships, leadership labels, public-page identity, and
Support Assignment membership never authorize by themselves.

The implementation capability manifest must keep at least these powers
independently grantable:

- view one authorization-filtered, Support-Assignment-scoped Support Workspace
  projection;
- view a bounded coach-progress projection;
- view a bounded project/team summary projection;
- view a participant roster subject to Phase 3/10/12 identity and field floors;
- add a Support Assignment Participant Membership;
- prospectively end or append a correction to a Support Assignment Participant
  Membership;
- inspect safe invitation and access state without revealing protected identity;
- grant or widen Support Workspace access;
- revoke or narrow Support Workspace access independently from widening;
- manage prospective tenant collaboration defaults and their exact compiled
  grants/preferences; and
- retrieve protected D19 authorization/evidence under a governed audit purpose.

Self-service notification preference is separate from tenant-default
administration. D10/D13 claimant submission, evidence, review, exception, and
approval capabilities remain owned by those decisions. Payee, compensation,
finance, task, Phase 6 dispatch, Phase 20 accounting, Phase 31 feed, and D5
reallocation/succession authority cannot be inferred from a D19 grant.

The implementation may mint finer capability names, but it cannot collapse
participant administration, access widening, access revocation, projection
reads, notification defaults, operational responsibility, or protected audit
retrieval into one `manage field accounts`, `share account`, missionary, spouse,
leader, or finance-admin capability. A tenant preset is only an administrative
compiler into explicit resource-scoped named grants and prospective preference
versions; its label and the `People & access` UI are never enforcement.

One guided `People & access` action may orchestrate participant, invitation,
grant, responsibility, and notification commands only when authority for every
selected command is independently re-proved and its local records retain
separate identities and evidence. External invitation or notification delivery
is an outbox effect, not part of the local transaction. Pending, failed,
expired, mismatched, or revoked invitations grant nothing.

Every read, mutation, invite acceptance/reissue/revocation, queued job,
Realtime-triggered refetch, notification eligibility check, export, repair, and
audit request re-resolves the exact principal, Active Tenant Assignment,
Tenant, Legal Entity, Support Assignment, target/version, purpose, projection,
capability, floor, and governance epoch before enumeration or change.
Participant membership is required only where the source command explicitly
requires it; a coach or authorized staff viewer may have bounded access without
participation, while a participant may have no login or workspace access.

Invitations and grant mutations use semantic idempotency and CAS/version
guards. Global Tenant-membership deactivation fences every D19 access path
immediately. Support-Assignment revocation invalidates current access, cache,
and queued notification eligibility before disclosure. Reactivation never
resurrects an expired or revoked grant, invitation, or notification preference.
Phase 21 tables use forced coarse Tenant RLS only; fine-grained authorization
remains server-side through this PDP, including every service/secret-key or
`BYPASSRLS` path. Client JWT grant arrays, client-trusted scope, assignment-aware
RLS, and raw financial/membership `postgres_changes` are forbidden.

## Dated Phase 21 D22 prospective-expense-authorization capability amendment (2026-08-01)

Phase 21 D22 reuses the sole Phase 12 resolver and D13 finite approval-route
kernel. It does not create a generic workflow ACL, and neither D13 activation
nor D19 Support Assignment participation grants any D22 power. The
implementation capability manifest must keep at least these operations
independently grantable:

- view safe prospective-authorization posture and coverage for an authorized
  scope;
- draft a request for oneself as the exact claimant;
- prepare, submit, or withdraw a request on behalf of an exact claimant;
- view one's own request, exact terms, safe status, and authorized history;
- view private plan evidence under its classification and purpose;
- perform one ordinary, final, specialist, or exception review action over
  exact assigned coverage;
- approve only as requested, approve with a permitted narrowing, decline, or
  request information;
- recuse, reassign, or create a date-bounded non-transitive delegation under
  independently authorized scope;
- configure, preview, activate, supersede, or deactivate one prospective
  posture/governance assignment;
- create, fulfill, reclassify, or release an exact compatible D1 capacity
  reservation; and
- retrieve privacy-filtered authorization, assignment, coverage, and recovery
  evidence under a governed audit purpose.

The implementation may mint finer atoms but cannot collapse posture
configuration, requester action, on-behalf preparation, evidence access,
ordinary review, final decision, exception authority, delegation,
reassignment, capacity reservation, release, and protected audit retrieval into
one expense-admin, finance-admin, approver, missionary, or participant
capability. Reservation power is separately required even when the reviewer may
approve; a final decision and its full reservation still commit atomically or
not at all.

Every enumerate, read, draft, submission, review, decision, assignment,
delegation, withdrawal, successor, claim-coverage, reservation, release,
notification, export, correction, and audit operation reauthorizes the exact
principal, Active Tenant Assignment, Tenant, Legal Entity, claimant Party,
submitter/preparer, purpose, expense family, ISO currency, source-owned
relationship context, request/decision/source/policy versions, half-open
incurrence window, exact operation and coverage, governance epoch,
classification, capability, and Phase 3/10/12 floor before disclosure or
change. A frozen Assignment Snapshot preserves routing evidence but never
preserves reviewer authority.

Claimants, preparers, and submitters cannot satisfy an independent review step.
Reviewers cannot widen an amount, time window, claimant, Legal Entity, purpose,
currency, or expense family; widening requires a requester-authored successor
and fresh resolution. No broad administrator, AI binding, elapsed timer, email
link, amount threshold, batch action, relationship, participant membership,
Support Assignment role, QBO/Xero connection, or service credential may create
approval. Delegation is exact-scope, date-bounded, non-transitive, and current-
authority-rechecked; small tenants use a named independent oversight route,
never self-approval.

The off posture exposes no D22 resource enumeration, count, navigation,
notification, queue, report, setup prompt, or API projection. Private evidence
and sensitive itinerary, location, health, security, or specialist context may
be read only under their narrower purpose and classification. Phase 20,
payment, payroll, procurement, card, vendor, travel-booking, and accounting
credentials grant no D22 authority.

## Dated Phase 21 D23 expense-effect-recognition capability amendment (2026-08-01)

Phase 21 D23 reuses the sole Phase 12 resolver, D10/D13 approved-expense truth,
and D1/D11 close contract. The capability manifest keeps at least these
operations independently grantable:

- view safe support-balance timing and the active profile for an authorized
  scope;
- preview prospective profile activation against production-shaped source
  coverage;
- activate, end, or supersede a profile prospectively;
- inspect a PII-minimized effect, coverage, funding disposition, and correction
  lineage;
- retrieve the protected Effect Basis and source evidence for an exact governed
  purpose;
- view cause-owned qualification or correction exceptions;
- perform the applicable source-owner correction; and
- retrieve governed D23 audit evidence.

There is deliberately no manual `include`, `post`, `mark paid`, qualification-
date/rate override, per-claim mode override, or blind-retry capability. D19
participation, D10/D13 claim review, D15 handoff/payment work, Phase 20
accountant access, a broad administrator role, a service credential, AI output,
or Mission Control task closure grants none of these powers. Profile activation,
protected evidence retrieval, source correction, and recovery each reauthorize
the exact principal, Active Tenant Assignment, Tenant, Legal Entity, purpose,
Support Assignment, Field Account, ISO currency, source family, operation,
profile/source/coverage version, classification, capability, and governance
epoch immediately before action. All service or `BYPASSRLS` paths call the
same PDP and retain forced coarse Tenant RLS as defense in depth.

## Dated Phase 21 D24 expense-collaboration capability amendment (2026-08-02)

Phase 21 D24 reuses this sole PDP and D10/D13 claim and review truth. The
Expense Collaboration Assignment Version records the code-owned `prepare_only`
or `prepare_and_submit_confirmed` collaboration-mode ceiling and provenance,
not a grant or tenant-authored operation list. Its authority-free invitation, acceptance,
relationship context, helper identity, notification, prior action, AI/OCR
result, or service credential cannot substitute for a current Phase 12
decision.

The capability manifest keeps at least these operations independently
grantable:

- inspect safe collaboration posture and invitation/assignment state;
- create, accept where applicable, prospectively end, or supersede an exact
  Assignment under the tenant's enabled management posture;
- view one exact authorized claim/draft projection;
- contribute or finalize evidence under an exact Evidence Access Projection;
- prepare claim items or report structure without asserting claimant truth;
- mark an unchanged draft ready for claimant confirmation;
- confirm one's own exact Claim Version and canonical material-assertion digest;
- optionally submit only that unchanged, independently eligible and confirmed
  Claim Version where the tenant enabled the operation; and
- retrieve privacy-filtered Assignment, action, conflict, and recovery evidence
  under a governed audit purpose.

The implementation may mint finer atoms but cannot collapse assignment
management, invitation handling, evidence access, preparation, claimant
confirmation, submission, review, approval, payment, or protected audit
retrieval into one helper, spouse, assistant, missionary, finance-admin, or
expense-admin capability. A helper cannot create claimant consent, select or
satisfy an independent D13 review, approve their work, choose a payment route,
or gain Field Account, payroll, AP, Phase 20, or QBO/Xero authority.

Every enumeration, read, upload finalization, mutation, confirmation,
submission, export, notification, job, support action, and audit retrieval
reauthorizes the exact principal, Active Tenant Assignment, Tenant, Legal
Entity, claimant Party, helper Party, Expense Program, purpose/claim family,
operation, Claim and Assignment Versions, evidence projection and
classification, capability, floor, and governance epoch. Revocation and
principal disablement fence new authorization and queued work before visible
success. JWT grant arrays, client-trusted actor or scope, relationship-aware
RLS, and service-role-as-authority are forbidden; forced coarse Tenant RLS
remains defense in depth for every service or `BYPASSRLS` path.

Confirmed helper submission is one atomic, version-pinned command. It locks and
re-proves the current Assignment, Claim Version, canonical material-assertion
digest, claimant confirmation or admitted attestation, evidence projection,
D13 policy/route state, capability, and governance epoch; then appends exactly
one submission, immutable actor evidence, audit record, and outbox work under
one semantic idempotency identity. Edit/confirm/submit, revoke/submit,
quarantine/submit, policy-succession/submit, and duplicate-submit conflicts
return a clean conflict or the original result, never last-write-wins or partial
truth. Claimant, economic payer, evidence contributor, preparer, submitter,
confirmer or attestor, reviewer, approver, beneficiary/payee, and actual actor principal remain
separate immutable facts.

## Dated Phase 21 D25 expense-resolution capability amendment (2026-08-02)

D25 reuses the sole Phase 12 PDP and a code-owned cause/action catalog. The
following operations remain independently grantable and exact-scope bounded:

- view one minimum authorized Resolution Case summary and next action;
- provide one's own requested information or evidence-unavailable statement;
- request another review or eligible exact withdrawal;
- record organization-authored evidence under the actual staff identity;
- perform current D13 review or Reviewer Exception only through D13 authority;
- route coordination work without deciding it;
- invoke one exact independently authorized source-owner correction command;
  and
- inspect a protected Downstream Impact Manifest or audit projection.

There is no generic `resolve_case`, `close_case`, `reopen`, `unapprove`,
`override`, edit-as-claimant, mark-paid, bulk financial action, or cross-domain
rollback capability. Broad administrator, service-role, table owner, or
`BYPASSRLS` access is never product authority.

Every enumeration and command proves exact Tenant, Legal Entity, claimant,
stable claim and triggering version, item/split/purpose/ISO currency, cause
contract, root source, evidence classification, actor, conflict, current
Downstream Impact Manifest, capability, and governance versions. Every
consequential commit reauthorizes and CAS-reproves them before appending one
atomic action/audit/projection/outbox result. The same catalog drives server
authorization, visible actions, audit meaning, and parity tests.

## Dated Phase 21 D26 records-policy and custody-export capability amendment (2026-08-02)

D26 reuses the sole Phase 12 policy decision point and keeps at least these
operations independently grantable:

- view the safe current Records policy and source-linked guidance;
- inspect protected contract, binding, resolution, trigger, hold, and successor-
  impact evidence for an exact authorized scope;
- preview and prospectively activate or supersede one supported tenant Binding
  Version;
- place a hold and release a hold as separate privileged operations under the
  applicable hold authority;
- request and inspect a current-view export or one exact readable record copy;
- request, inspect, download, or print one manifest-complete Phase 21 records
  archive for an exact Legal Entity and scope;
- request and retrieve a separately authorized restricted-subject package;
- prepare and retrieve a final offboarding snapshot or delta under the current
  contract window;
- record one Tenant External Copy Assertion without granting transfer or
  disposal authority;
- execute one separately certified Phase 31 Verified Destination Custody
  Transfer;
- inspect one Verified Destination Custody Transfer through a separate read-only
  capability that cannot change custody state; and
- inspect protected package, download, transfer, hold, and copy-disposition
  evidence under a governed audit purpose.

The implementation may mint finer atoms but cannot collapse policy management,
hold placement/release, package request, protected source inspection, ordinary
download, restricted-person export, external-copy assertion, verified-transfer
execution, verified-transfer inspection, offboarding, or Phase 29 disposition
into one administrator, finance, records,
support, service-role, table-owner, or `BYPASSRLS` capability. Download, print,
assertion, transfer, termination, and package expiry grant no source-record or
copy-disposition authority.

Every preview, count, request, preparation step, seal, part listing, original
inclusion, download, print, assertion, transfer, regeneration, residual, hold,
disposition request, support action, and audit retrieval proves exact principal
and actual principal, Active Tenant Assignment, Tenant, Legal Entity, purpose,
record family, subject/account and restricted-person scope, source/version
watermark, contract/binding/resolution versions, classification, package and
part identity, operation, capability, and authorization/governance epochs.
Consequential commits and every byte retrieval reauthorize and CAS-reprove the
current facts; a stale or narrower decision fails without revealing hidden
coverage. Forced coarse Tenant RLS remains defense in depth, never product
authority.
