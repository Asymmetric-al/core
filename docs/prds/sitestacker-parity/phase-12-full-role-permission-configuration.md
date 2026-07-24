# Phase 12 — Full Role & Permission Configuration

**Slug:** `permission-config` · **Roadmap position:** Phase 12 of 41 (roadmap v2) ·
**Status:** PRD (design ratified 2026-07-08 via grill-with-docs — 26 decisions D1–D26 + 7 cross-cutting rulings R1–R7 + 19 hardening rules, deep-researched across the nonprofit/missions-CRM field and the modern authz field, then pressure-tested by five adversarial passes: a definitive 8-cluster review and a final ruthless risk-category review. Verdict: **lock the spine; ship the tenant-axis + causal-revocation substrate first.** READY). Tracked by epic #665 + children #666–#687.

**Hard dependencies (must land before build):** Phase 3 _Minimum Permission & Role-Scoped Projection Foundation_ (`field_policies`, the single `resolveProjection` PDP, `assertEditableForSurface`, `emitGovernedCsv`, `classifyChange`/maker-checker widening, fail-closed default, the **code-source-of-truth capability registry** shaped for 1:1 table seeding, the dormant additive `tenantOverrides` param) · Phase 9 _Full CRM Depth & Relationship Graph_ (Party spine, the **B6 party-scoped access-check helper**, the CI guardrail that _derived roles are display-only, never authorization_) · Phase 10 _Sensitive-Data Classification & Restricted-Ministry Safety_ (`security_level`, `security_clearance` capability, `identity_access_grants` with `subject_type`/`scope_ref` named for additive extension, `party_restricted`, the sole-entry `toPublicProjection` firewall, break-glass) · Phase 11 _Custom Fields & Custom Collections_ (`getFieldCatalog`, the field-policy cache, the immutable `field_key`/`value_key`/`option_id` contract, the "every egress reaches the resolver" meta-test, `classify:manage`).

**Downstream consumers (this phase defines the contracts they build on):** Phase 13 contribution-ledger (money-plane consumes the resolver; SoD-conflict pairs) · Phase 30 imports-migration · Phase 31 platform-api (public REST/webhooks) · Phase 33 reporting-BI (report permissions as their own model; aggregate small-cell suppression) · Phase 34 workflow-engine · Phase 6 communication/merge · Phase 38 member-care case product & exposure report · Phase 40 AI (every AI egress routes through this resolver).

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

- **One brain.** A single server-side Policy Decision Point, `resolveProjection`, is the only place any access decision is made. It is the sole producer of a runtime-verifiable access token that carries the tenant, principal, active assignment, purpose, capability set, an epoch, and an expiry. Every enforcement point — routes, jobs, the data layer, and every egress door — verifies that token before trusting it. Skipping the resolver or the floor is both a type error _and_ a runtime verification failure; reaching restricted data without a verified token fails a build-time architecture test.
- **One formula.** `EffectiveAccess = ( role/subrole grants ∪ group grants ∪ named-person grants ) MINUS floor`, where the floor composes, strictest-wins, the Phase 3 field-policy projection, Phase 10 `security_level`/clearance, Phase 11 field gates (on filter/sort/group-by _inputs_, not just displayed columns), the **purpose/consent** axis, and the **residency** veto. Above the line is **additive, grants-only — no per-grant DENY, ever.** The floor subtracts last and always wins; no grant of any kind adds back what it removed.
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

- **Four principal classes, all through the same PDP:** (1) human staffer; (2) **external/anonymous** — default deny-all, only `toPublicProjection` output, never widenable by any internal grant (D14); (3) **service account / non-human identity (NHI)** — a required human owner, its own least-privilege set (never a human role), a hard ceiling computed as a **live read-time intersection with the owner's _current_ resolved capabilities** (never frozen at mint), single-tenant, force-disabled when the owner leaves; (4) **platform operator** — an orthogonal authority _plane_, reaching tenant data only through the resolver as an audited, purpose-bound, time-boxed grant that writes to an **append-only, tenant-independent** sink; never ambient god-mode.
- **The tenant is branded into the token** (`EffectiveAccess<TenantId>` with a phantom tag stamped from `active_assignment.tenant_id`). Every egress door's target-fetch requires the token and a `RowIn<T>` that must _unify_; a cross-tenant serve is a compile error _and_ a runtime verification failure. (The tenant-axis twin of the floor branding.)
- **One tenant source per request.** The resolver's chosen `active_assignment.tenant_id` is threaded end-to-end via a request GUC that the database's `current_tenant_id()` reads; a CI gate asserts the application and RLS tenant sources cannot diverge. Until unified, RLS may not be described as a tenant backstop.
- **Active assignment is a first-class, server-owned selection.** `authz.memberships` gains an active-assignment selector; the acting hat is chosen server-side (or validated every request against `authz.memberships WHERE user_id = session.uid AND is_active AND id = ?`), never client-trusted. Every deferred/queued/streaming governed action serializes the _validated_ `active_assignment_id` and re-resolves ownership + active + tenant-match at fire-time (fail-closed, audited).
- **Cross-tenant edges are unrepresentable:** `group.tenant_id NOT NULL`; `CHECK group_membership.tenant = group.tenant`; `CHECK grant.subject.tenant = scope_ref.tenant = grant.tenant`; an NHI is single-tenant (a multi-tenant integration = N NHIs). No tenant default — a principal with no validated tenant assignment is default-deny with zero memberships, surfaced as an onboarding error (delete the `…0001` fallback and the `member_care` full-admin backfill).
- **RLS stays coarse defense-in-depth**, CI-proven to hold no capability or identity logic. The RLS-introspection gate is a required CI gate from v1 and is a **positive** proof: every `tenant_id`-carrying table MUST have RLS enabled referencing the unified `current_tenant_id()`, with no identity/capability escape and no `USING(true)` for `authenticated`. Delete `OR authz.is_super_admin()` from all data-plane policies.
- **Instant, causal revocation via a single monotonic tenant epoch.** Any group/grant/clearance/membership mutation bumps a **single-row tenant epoch** (`BIGSERIAL`/`pg_current_xact_id`, never `now()`) inside the mutation transaction. This satisfies Zanzibar's new-enemy guarantee _without_ a per-principal in-transaction fan-out (which deadlocks, lock-storms on large groups, and can silently roll back a restricted-clearance revocation). Any per-principal materialization is derived **asynchronously and idempotently**, never on the safety-critical path. One monotonic per-`(principal, tenant)` `governance_version` (bumped by grant/purpose/consent/residency/clearance alike) is the cache key; the resolver caches _inputs_, never the resolved set; cache lifetime is capped at `min(expires_at)` so JIT grants self-heal at their UTC instant. A CI property test fails if the fan-out is ever _narrowed_.
- **Runtime-verifiable token (the compile-time brand is erased at serialization boundaries).** RSC/Server-Action serialization, Payload access callbacks, Edge Functions, raw SQL jobs, and Inngest payload deserialization never see a TS brand. The resolver therefore **HMAC-signs** `(tenant, principal, active_assignment, purpose, caps-hash, governance_version, expiry)`; every PEP calls one `verifyEffectiveAccess()` before trusting a token; non-TS doors call the resolver RPC and never trust a serialized token. Binding invariant: **a governed read never trusts a deserialized `EffectiveAccess` — it re-derives or verifies-by-MAC.** Lint-ban `as EffectiveAccess`/`as Capability` and `@ts-expect-error` outside the resolver module.
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

`permission_capabilities` (code-generated) · `role_capability_grants` (code-generated) · tenant-authored capability registry entry (`source='tenant'`) · `groups` · `group_membership` · `group_capability_grants` · `permission_change_request` + decision · permission/access **audit event** (hash-chained) · access-**governing-field change-history** · `permission_test_session` · `impersonation_session` · `named_person_grant` (extends Phase 10 `identity_access_grants` `subject_type`/`scope_ref` additively) · service-account / **NHI principal** · SoD **policy object** · **access-review / recertification** campaign · **sensitive-grant alert** · **rate-of-access ledger** (striped) · `sso_connection` + `sso_group_mapping` (inert, seam) · the **active-assignment** selector on `authz.memberships`.

Every table carrying tenant data has `tenant_id NOT NULL` + RLS referencing the unified `current_tenant_id()`; every grant/membership row FKs the **membership (assignment) id**, never the bare person.

---

## Testing Decisions

Good tests here assert **external, security-observable behavior** — "a grant can never exceed the floor," "a cross-tenant serve fails," "a denied restricted read is indistinguishable from a missing one" — not internal shape. Prior art: `tests/unit/packages/api/admin/contribution-operations-permissions.test.ts` (capability-array behavior), the repo's advisory-lock reorder tests, the Phase 11 egress meta-test, the `verify:data-boundary` golden-snapshot CI pattern.

**P0 CI / property / architecture gates (red-on-regression, each with a committed _failing_ poison-fixture proving the gate bites):**

1. **Floor inviolability (property + differential):** `union(any grants) MINUS floor ⊆ floor-permitted`, over arbitrary role+group+named-grant combinations, _and_ **differential random testing against a tiny executable reference model** (the method AWS used to build Cedar — proofs found 4 bugs, DRT found 21 more).
2. **Cross-tenant isolation:** `resolve(_, assignment@A, target@B, _)` returns not-found via the uniformity oracle; a cross-tenant serve fails to type-check and fails `verifyEffectiveAccess()`; the tenant sources cannot diverge; the fan-out set ⊆ one tenant's principals.
3. **Positive RLS-isolation gate:** every tenant table has RLS referencing the unified source, no identity/capability escape, no `USING(true)`; DB-introspection over `pg_policies` (defeats dynamic-SQL/`format()` policy bodies).
4. **Names-never-authorize lint** across `packages/api` **and** `supabase/**/*.sql`; `as EffectiveAccess`/`as Capability` + `@ts-expect-error` bans in `packages/auth`.
5. **Registry↔seed↔DB** golden-snapshot + `assertRegistryMatchesSeed()` boot check + FK `ON DELETE RESTRICT`.
6. **`(module,level)→capability` map:** coverage/surjectivity, monotonicity, no sensitive below Admin (against seed definitions too), no "see-all-fields" capability.
7. **Egress closure:** the `EgressDoor` `never`-switch + golden-snapshot inventory + the metering side-effect assertion; `postgres_changes` lint-ban on tenant/party/restricted/sensitive/financial tables.
8. **Metering/audit:** audit committed before response bytes for the restricted tier; audit over-counts never under-counts; hash-chain verifier; `R6` ≤1 SELECT + ≤1 ledger UPDATE (N+1 detector on the governed-read path).
9. **Revocation liveness:** a grant two hops from a principal bumps that principal's `governance_version` (a test that _narrowing_ the fan-out fails CI); a revoked user's live session and cache lose access within ≤60s (managed realtime) / immediately (elsewhere).
10. **Uniformity oracle (statistical):** denied-by-security ≡ denied-by-purpose ≡ not-found on byte, status, and **p50/p99 timing** (constant-time padding on the restricted path).
11. **Floor composition:** `edit(field) ⟹ view(field)`; purpose bound to surface (no egress calls `resolve()` without a registered purpose); residency veto after grant/floor; small-cell suppression on the aggregate door.
12. **SoD:** self/chain on `party_id` under multi-hat; dynamic SoD blocks a toxic maker/checker pair at activation.
13. **Concurrency:** the advisory-locked grant-state function under two-admin races (no double-remove orphan; last-admin/last-clearance post-conditions hold); serializable merge tightens tier before any child repoint (every intermediate snapshot ≥ meet-tier).
14. **Red-team gate:** a maintained injection/exfil corpus (incl. the cross-modality chains: AI + realtime + consent + telemetry) must pass before any AI-over-person-data ships; one restricted-worker exfil in red-team = release blocker.

---

## Build Order (what the PRD tells the agent to build, and in what order)

Nothing in a later group ships until the earlier group's CI gates are green.

**SHIP-FIRST — the structural substrate, before any grant data exists** (a wrong choice here is unrecoverable):

1. Tenant-global monotonic epoch (not per-principal in-txn fan-out).
2. Assignment-bound, epoch-revocable grant contract **+ the active-assignment primitive** (server-owned, validated every request, re-validated at fire-time).
3. Tenant in the brand + unified RLS source + delete `OR is_super_admin()` + kill the `…0001`/`member_care` defaults + cross-tenant-edge invariants + the positive RLS-isolation gate.
4. `profiles.role` inert-for-authz / `super_admin` via the capability path.
5. Runtime-verifiable HMAC `EffectiveAccess` + `verifyEffectiveAccess()` at every PEP + cast/`@ts-expect-error` bans.
6. The one advisory-locked grant-state DB function with tenant-global last-admin / last-clearance post-conditions.
7. **Non-prod isolation floor (D22):** sign-or-delete the `E2E_AUTH_BYPASS` cookie + a non-prod project-ref allowlist (not `NODE_ENV`) + synthetic-only restricted fixtures + the build/CI invariant.

**BUILD-V1 — the enforced product** (each behind a named gate): the central resolver + capability registry/tables; groups + seeded defaults; the `(module,level)→capability` map + `PermissionModule` enum; module/entity/field permissions on the Phase 11 catalog; classification/tags/geo/alias + whole-record protection; the set-based floor predicate; the metering choke + tiered audit-before-serve + hash-chained read-audit + transactional outbox; the tiered rate budget; signal-only streaming + coalesced re-fetch + Payload once-per-operation + epoch-keyed client cache; purpose/consent axis + residency axis + `decrypt` capability & RPC; SoD detection; recertification (quorum-aware); view-as + `traceDecision`; impersonation stack; named grants + delegated admin; tenant recovery; `explainAccess`; versioned `FloorContribution` interfaces; the full P0 gate suite + poison-fixtures + reference model.

**SEAM-V1 — schema/hook now, UI/full-integration deferred:** SSO/SCIM (inert config + the one SCIM revocation wire); `muted_capabilities` (typed convenience-only); ABAC condition slot; nested-groups schema (flat v1); "view-as-group"; bulk-widen; the key-provider _envelope_ interface (pgcrypto underneath); NHI sender-constrained tokens; the D-IR restricted-exposure incident-response runbook; the D17 recovery fire-drill.

**DEFER — named phase:** BYOK/HYOK build (`R3` target → enterprise/crypto phase); the ML anomaly body (D19 → after there are users to baseline); full IdP wiring (enterprise phase); the build-vs-buy re-evaluation of the additive RBAC/ReBAC layer only (pre-committed trigger: the moment nested groups or ABAC conditions ship live).

---

## Out of Scope

The full enterprise IdP integration (SSO seam only) · the ML/behavioral-anomaly detection body · BYOK/HYOK key-custody build (v1 ships the envelope interface + `decrypt` capability; the custody boundary is the target) · money-specific capabilities (`refund.execute`/`approve`; Phase 12 only requires the D4 model can express SoD-conflict pairs + default-masked field tiers — Phase 13 mints the caps) · the member-care case product + the exposure report (Phase 38) · nested/inherited groups, ABAC conditions, criteria-based sharing rules, per-locale CMS scope algebra, media/DAM asset ACLs, content edit-locks, historical/as-of visibility (seams named, built later) · report-builder permissions as their own model (consumes Phase 12 capabilities; built in Phase 33).

## Further Notes

- **Roadmap position:** Phase 12 of 41 (roadmap v2, adopted 2026-07-07). Hard-blocked on Phases 3, 9, 10, 11. Consumers: Phases 13/30/31/33/34/6/38/40.
- **ADR to write:** an ADR recording the capability-based spine + the tenant-axis-in-the-token decision + the in-house-resolver-over-policy-engine choice with its pre-committed re-evaluation trigger (hard-to-reverse, surprising-without-context, a real trade-off — all three ADR criteria met).
- **Glossary (add to root `CONTEXT.md`):** _Capability_ (a specific enforced permission; the sole enforcement unit) · _Group_ vs _Role_ vs _Named grant_ (bundles that resolve into capabilities) · _The floor_ (the subtract-only safety layer that always wins) · _Active assignment_ (the one org-hat a person acts within per request) · _EffectiveAccess token_ (the runtime-verifiable output of the one resolver) · _Purpose_ (the required "for what" input; the consent/legal-basis axis) · _Protected constituent_ (a whole-record restriction as a floor row) · _Existence oracle / uniformity_ (why blocked and missing must look identical).
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
