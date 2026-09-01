# Phase 24 D42 — Purpose-Tiered Continuity Provenance

**Decision date:** 2026-08-29  
**Founder direction:** Option 1 — purpose-tiered provenance: the holder sees a
safe Added for continuity/date summary; a membership manager sees only the
surviving direct source/end condition during mutation review; a grant manager
or access reviewer sees the minimized origin/reason/actor/source needed to
govern; separately authorized security/audit sees the full typed governance
basis, authority/delegation, actors, receipts, and chronology; everyone else
sees none.  
**Scope:** Viewer, purpose, field, operation, current/historical, RLS, cache,
export, retention, and accessibility boundaries for D40/D41 provenance.  
**Method:** /grill-with-docs, repository/governing-document audit, current
primary-source research, Core UI/accessibility review, and a ruthless
22-category adversarial pass.  
**Verification note:** Per founder direction, broad formatting, local-link,
skill-parity, strict OpenSpec, lint, typecheck, unit, build, and git diff
checks remain deferred. Only focused structural/count checks are permitted.

## Final disposition

**Accept with required amendments.**

Purpose-tiered provenance is the strongest balance of transparency, privacy,
and governability. It lets a holder recognize sticky direct access, lets
membership staff avoid false revocation, lets grant managers govern the source,
and reserves full security evidence for a separately authorized audit purpose.

The provisional tiers are unsafe unless Core also guarantees:

- each tier is a distinct server-side allowlisted projection, never one full
  payload hidden by client UI;
- current authorization is re-proved per request/page/export chunk and
  historical participation grants no viewing right;
- one exact Active Tenant Assignment and surface-bound purpose applies; a
  multi-hat person cannot union roles across Tenants/surfaces;
- losing authority mid-read prevents every later page/export response and
  invalidates viewer-tier caches;
- holder copy is exactly **Why you have access**; administration copy is
  **Why this person has access**;
- historical group labels/reasons are field-authorized because labels can
  reveal sensitive ministry responsibilities;
- full audit means full typed governance evidence, never unrestricted Website,
  worker, donor, care, or secret data;
- raw audit/basis is never browser-readable and service/owner paths preserve
  the same product projection;
- reads of full security/audit provenance are themselves auditable without
  copying reason text into general logs;
- retention/anonymization preserves proof while minimizing departed actors;
- AI, analytics, logs, notifications, tasks, and ordinary exports receive no
  provenance detail; and
- grant-governance sees an event-time safe group summary only when current
  floor/classification permits it; otherwise it receives the stable
  **Protected access group** summary without revealing hidden existence detail
  beyond the already authorized provenance event.

These amendments complete rather than replace Option 1.

## Exact corrected decision

> D42 defines four explicit, purpose-bound server projections over immutable
> D40/D41 provenance. The caller cannot select a tier. The server derives one
> exact current Tenant Authorization Context, viewer Active Tenant Assignment,
> subject assignment, surface purpose, current capabilities/scopes, and
> authorization epoch, then emits only that projection's allowlisted fields.
>
> **1. Holder / My Access (`access.self_explanation`).** The exact current
> subject may see:
>
> - **Added for continuity**;
> - the localized creation date;
> - the fixed explanation **Direct access was added so your access could
>   continue if group access changed**; and
> - current direct source/end condition already authorized by D41.
>
> The holder sees no historical group label/ID, governance reason, grantor or
> acting actor, authority/delegation, basis hash, receipt, epoch/head, security
> classification, or other person's history. The disclosure label is
> **Why you have access**.
>
> **2. Membership manager mutation consequence
> (`access.membership_change_review`).** A current exact-group-scoped
> `permissions.manage_membership` actor reviewing member removal/end may see:
>
> - that the target will retain D38 through a direct source; and
> - that direct source's current end condition.
>
> This projection exists only inside the governed mutation review/receipt. It
> reveals no continuity origin/date, historical groups, reason, grantor/actors,
> delegation, basis, receipt chain, or audit chronology. It grants no direct-
> grant read/change authority.
>
> **3. Grant manager or access reviewer
> (`access.grant_governance`).** A current same-Tenant actor with exact
> `permissions.manage_grants` scope/ceiling or separately current access-review
> authority may see the minimized evidence needed to review, renew, revoke, or
> attest the direct source:
>
> - current direct source, state, duration, and safe target identity;
> - **Added for continuity** and creation instant;
> - safe event-time origin source summary admitted by current field/scope
>   policy;
> - the bounded governance reason;
> - safe grantor attribution; and
> - relevant grant/terminal chronology and recertification state.
>
> This projection excludes raw basis/source IDs/hash, complete membership
> paths, delegation chain, actual/acting actor identifiers, receipt/epoch/head
> internals, unrelated security events, and protected domain content.
>
> **4. Security/audit governance
> (`access.security_audit`).** A separately current Phase 12 audit-read
> capability, registered audit purpose, current exact scope, and applicable
> floor/clearance may see the full typed governance evidence required to
> investigate/reconstruct D40. Phase 12's existing risk classification and
> step-up apply; D42 adds no local ceremony:
>
> - typed overlap basis/source identities and canonical hash/version;
> - grant authority and delegation chain;
> - actual and acting actor identities/assignments;
> - grant/receipt/epoch/head identifiers;
> - reason, duration, recertification, terminal causes;
> - complete authorized chronology and warning contract version; and
> - event-time labels under current sensitive-label policy.
>
> “Full” is bounded to authorization governance. It does not grant Website
> records, Sites, workers, care/donor/location/correction detail, credentials,
> secrets, unrestricted database rows, or another Tenant.
> Governed bulk export is a distinct operation requiring current
> `permissions.audit.export` in addition to `permissions.audit.read`, under the
> same `access.security_audit` purpose, exact scope, floor/clearance, snapshot,
> read-audit, and protected-destination contract.
>
> **Everyone else receives no D40/D41 historical provenance.** D38 possession,
> ordinary staff/Admin/Owner labels, policy edit, Website/source access, task or
> coordinator membership, current/historic group membership, prior grantor
> status, support, service, AI, URL knowledge, or cached data does not imply a
> projection tier.
>
> Viewer authorization is current, not historical. A past grant manager,
> reviewer, auditor, group manager, group member, or actor gains no later read.
> Each request, expanded disclosure, page/cursor, route load, download/export
> chunk, and long-running stream re-proves current viewer assignment, purpose,
> capability/scope, subject/Tenant relation, and epoch before returning another
> field or row.
>
> A multi-hat person acts through exactly one current Active Tenant Assignment
> and one surface-bound purpose. My Access remains holder-minimized even if the
> same person is also a security auditor; full evidence requires deliberate
> navigation to the separately authorized audit surface. Capabilities from
> another Tenant/hat are never unioned.
>
> If authority is lost while a view is open, already rendered content cannot be
> clawed back, but every later fetch/page/export/retry fails uniformly, current
> viewer-tier caches are invalidated by epoch/scope revision, and the surface
> clears protected detail on next state/navigation. Realtime never streams
> basis/reason/actor payloads.
>
> Each tier is materialized server-side from an explicit field allowlist. Core
> never fetches the full security payload and hides fields in React, serializes
> it into RSC/client cache, or reuses a high-tier cache for a low-tier viewer.
> Cache keys bind Tenant, viewer assignment, subject assignment, purpose,
> projection tier/version, grant/basis revision, authorization epoch, and
> relevant scope revision.
>
> Group labels are treated as potentially sensitive data. Holder and membership
> tiers receive none. Grant-governance sees only labels/source summaries
> allowed by current floor/classification/scope; otherwise the stable
> **Protected access group** summary is used. Full audit labels remain
> separately authorized.
>
> D42 uses purpose-built RLS-backed/security-invoker views or hardened
> authorized RPC projections. Raw grant-basis/audit tables have no browser
> SELECT. `ENABLE` plus `FORCE RLS`, operation-appropriate policy behavior,
> pinned `search_path`, current PDP proof, and table-owner/service-role/
> `BYPASSRLS`/worker/support/export parity preserve the same field boundary.
>
> Full security/audit provenance reads and governed exports are durably
> read-audited with identifiers, viewer/purpose, field-class/tier, row count,
> outcome, and snapshot—not reason/group text. Holder own-safe reads need no
> new D42 security event. Membership review remains part of its existing
> mutation audit.
>
> Retention follows Phase 12 governance/audit policy. Departed/deleted actors
> are rendered with lawful minimized historical attribution (for example,
> Former staff member plus stable audit reference for authorized auditors);
> anonymization never rewrites authority history or expose deleted personal
> data. Event-time labels/reasons are retained only as required and viewable
> only by current tier.
>
> General logs, traces, error telemetry, analytics, search suggestions, AI
> prompts/embeddings, Tasks Hub, notifications, documents, and ordinary exports
> contain no D42 group label, reason, actor, basis, authority, receipt, or
> chronology. No provenance tier becomes staff scoring.
>
> Administration uses **Why this person has access**. My Access uses **Why you
> have access**. Both are semantic, accessible disclosures with current source
> before history, 44-pixel controls, 320-pixel/400-percent reflow, forced
> colors/reduced motion, screen-reader chronology, localized time zones,
> Unicode/RTL/CJK-safe text, and low-bandwidth history failure.
>
> D42 creates no authorization mutation, new role-name check, tenant-configured
> arbitrary field tier, notification, task, approval/review engine, timer,
> email, AI summary, conversion job, or Inngest authority.

## Evidence and current/intended/permanent distinctions

- **Repository fact:** [Phase 12](./phase-12-full-role-permission-configuration.md)
  owns purpose-bound authorization, current EffectiveAccess, groups/grants,
  audit, RLS, retention, recertification, and privileged-path parity.
- **Current-code fact:** [`packages/auth/permissions.ts`](../../../packages/auth/permissions.ts)
  exposes only four broad staff capabilities and gives every staff subrole the
  same MVP set; it cannot select a D42 projection.
- **Current-code fact:** the generic [`auditLogs` resolver](../../../packages/graphql/handler.ts)
  admits admin/staff/super-admin role labels and selects all audit-log columns
  through the admin client, while the [current authz migration](../../../supabase/migrations/20260226113000_authz_memberships_foundation.sql)
  admits same-Tenant staff or `is_super_admin()` at RLS. These are current
  hazards to retire, not D42 authorization truth.
- **Current-OpenSpec fact:** [identity and access](../../../openspec/specs/identity-and-access/spec.md)
  explicitly describes uniform broad Mission Control staff access as the MVP
  posture and least-privilege narrowing as forward work; D42 is not shipped.
- **Repository fact:** [D40](./phase-24-d40-deliberate-continuity-direct-grant-adversarial-review.md)
  makes reason/basis governance evidence and forbids copying it into tasks,
  notifications, logs, analytics, or AI.
- **Repository fact:** [D41](./phase-24-d41-current-direct-source-historical-provenance-adversarial-review.md)
  separates current **Granted directly** from historical D40 origin and defers
  viewer tiers to D42.
- **Verified external fact:** [Entra current role views](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/view-assignments)
  expose direct/group assignment paths while audit logs retain changes.
- **Verified external fact:** [Microsoft My Access](https://learn.microsoft.com/en-us/entra/id-governance/my-access-portal-overview)
  separates active access from request history.
- **Verified external fact:** [Google Policy Analyzer](https://docs.cloud.google.com/policy-intelligence/docs/policy-analyzer-overview)
  and [IAM policy history](https://docs.cloud.google.com/iam/docs/review-iam-policy-history)
  separate current bindings from policy-change history.
- **Verified external fact:** [Salesforce User Access Summary](https://help.salesforce.com/s/articleView?id=users_access_summary.htm&language=en_US)
  consolidates current access but warns assignment display can lag.
- **Product judgment:** field-minimized server projections are safer and
  clearer than full payload plus client hiding.
- **Resolved downstream:** D43 now gives the exact holder one governed,
  source-owned **Ask for an access review** path without widening D42 fields or
  granting immediate self-revocation; see the
  [D43 adversarial review](./phase-24-d43-governed-holder-access-review-adversarial-review.md).

| Concern            | Current repository      | Intended governing behavior         | Best permanent D42 path                                  |
| ------------------ | ----------------------- | ----------------------------------- | -------------------------------------------------------- |
| Viewer roles       | Broad MVP labels exist. | Phase 12 capability/purpose/scopes. | Four server-derived projections; no label authorization. |
| Raw history        | No D42 runtime.         | Immutable D40 basis/audit.          | Raw tables private; projections allowlist fields.        |
| Holder             | No runtime.             | D41 My Access.                      | Safe origin/date only under self purpose.                |
| Membership manager | No runtime.             | D39 governed removal review.        | Survivor/end only inside exact mutation review.          |
| Grant governance   | No runtime.             | Phase 12 grant/review authority.    | Minimized reason/origin/actor/source needed to govern.   |
| Security audit     | No runtime.             | Separate audit capability/purpose.  | Full typed governance evidence, not domain data.         |
| Caches/exports     | No tier contract.       | Tenant/epoch/purpose boundaries.    | Tier/version/scope keyed; purpose-specific export.       |

## UX and UI contract

### My Access

```text
Why you have access

Current source
Granted directly to you · Ends 15 October 2026

History
Added for continuity · 29 August 2026
Direct access was added so your access could continue if group access changed.
```

No historical group, reason, actor, receipt, authority, or delegation appears.

### Membership-removal review

```text
Jordan will keep Website recovery permission through a direct grant.
Direct grant · Ends 15 October 2026
```

The membership manager receives no D40 origin/reason and no direct-grant edit
control.

### Grant governance

```text
Why this person has access

Current source
Granted directly · Ends 15 October 2026

Origin
Added for continuity · 29 August 2026
Source at creation · Website Operations
Reason · Ongoing recovery coverage during operations-team transition
Granted by · Morgan Lee
```

Fields appear only when current scope/purpose allows them. D42 requires a
withheld sensitive source label to render exactly **Protected access group**;
protected reason/actor values are omitted.

### Security/audit

The audit surface uses semantic field groups and a paginated chronology for
typed basis, authority/delegation, actual/acting actors, receipts, epochs/heads,
reason/duration/terminal causes, and label history. It never dumps raw JSON,
database rows, protected domain values, or secrets.

### Accessibility/mobile

- Administration label: **Why this person has access**.
- My Access label: **Why you have access**.
- Current source precedes historical detail.
- Tier-specific omitted fields are absent, not empty/disabled placeholders.
- Disclosure/chronology uses headings, descriptions, lists, and tables only
  where responsive; a stacked definition list is the mobile default.
- 44-pixel targets, visible/restored focus, programmatic loading/error/status,
  320-pixel/400-percent reflow, forced colors, reduced motion, RTL/CJK/Unicode,
  localized dates/zones, and low-bandwidth failure are required.

## Domain model and invariants

### Projection field matrix

| Field class                 |   Holder |  Membership review | Grant governance |     Security/audit |
| --------------------------- | -------: | -----------------: | ---------------: | -----------------: |
| Current direct source/end   | own only | target consequence |           scoped |             scoped |
| Added-for-continuity + date |      yes |                 no |              yes |                yes |
| Event-time group source     |       no |                 no | minimized/scoped |        full scoped |
| Governance reason           |       no |                 no | minimized/scoped |        full scoped |
| Safe grantor attribution    |       no |                 no |           scoped | full actual/acting |
| Raw typed basis/hash/IDs    |       no |                 no |               no |                yes |
| Delegation/authority chain  |       no |                 no |               no |                yes |
| Receipts/epoch/head         |       no |                 no |               no |                yes |
| Full chronology             |       no |                 no |  relevant subset |                yes |
| Protected domain content    |       no |                 no |               no |                 no |

### Invariants

1. Tier is server-derived from current assignment, purpose, capability/scope.
2. Caller cannot request or upgrade tier.
3. Every tier is an explicit field allowlist and response type.
4. High-tier payload is never fetched then hidden client-side.
5. Historical participation grants no current viewing right.
6. Holder tier is exact self/assignment only.
7. Membership tier exists only inside exact-group mutation review/receipt.
8. Membership tier grants no direct-grant browse/change.
9. Grant tier proves current `manage_grants` or review authority/scope.
10. Audit tier requires separately current security/audit capability/purpose.
11. My Access stays holder-minimized even for a multi-hat auditor.
12. One request uses one Active Tenant Assignment and one purpose.
13. Cross-Tenant/hat capabilities never union.
14. Current auth is re-proved per page/cursor/export chunk.
15. Role loss prevents later responses.
16. Caches bind viewer/subject/Tenant/purpose/tier/version/epoch/scope.
17. Cross-tier cache reuse is forbidden.
18. Realtime sends no provenance payload.
19. Group labels are potentially sensitive.
20. Reason is audit evidence, not recipient/membership-manager text.
21. “Full audit” remains governance-only and excludes domain data/secrets.
22. Full provenance reads are read-audited without copying sensitive text.
23. Holder safe own read creates no new D42 security event.
24. Membership review uses existing mutation audit.
25. Departed actors are minimized under lawful retention/anonymization.
26. Raw history has no browser grants.
27. AI/logs/analytics/tasks/notifications receive no provenance fields.
28. Projection failure reveals nothing and does not alter current access.
29. Unknown tier/version/field classification fails closed.
30. Holder correction action cannot broaden provenance or grant mutation.

## Normative requirements

1. **D42-R1 — Four projections.** Holder, membership consequence, grant
   governance, and security/audit are distinct server response types.
2. **D42-R2 — Server-derived tier.** Caller cannot select, claim, combine, or
   upgrade a provenance tier.
3. **D42-R3 — Current authorization.** Every read/page/export re-proves current
   Tenant assignment, purpose, capability/scope, floor, and epoch.
4. **D42-R4 — Holder minimization.** Exact subject sees Added for continuity/
   date only under **Why you have access**.
5. **D42-R5 — Membership minimization.** Scoped remover sees survivor/end only
   inside mutation review/receipt.
6. **D42-R6 — Grant-governance minimization.** Current grant/review authority
   sees only fields necessary to govern the grant.
7. **D42-R7 — Separate audit authority.** Full governance evidence requires a
   separate current Phase 12 audit-read capability, registered audit purpose,
   and current floor/clearance; Phase 12 risk controls/step-up apply.
8. **D42-R8 — Everyone else none.** No role label, historical relation, D38,
   task, policy/source, support/service, URL, or cache implies provenance.
9. **D42-R9 — Field allowlists.** Every projection has explicit server-side
   allowlisted fields/version.
10. **D42-R10 — No client hiding.** High-tier payload is never fetched/
    serialized/cached then cosmetically hidden.
11. **D42-R11 — Exact active assignment.** Human reads bind one viewer and one
    subject Active Tenant Assignment in one Tenant.
12. **D42-R12 — Surface-bound purpose.** My Access, mutation, governance, and
    audit purposes are registered/non-caller-asserted.
13. **D42-R13 — No multi-hat union.** Another Tenant/hat/surface capability
    never widens the active projection.
14. **D42-R14 — Mid-read revocation.** Later page/cursor/export response denies
    after viewer authority/scope loss.
15. **D42-R15 — Tiered caches.** Cache keys bind Tenant/viewer/subject/purpose/
    tier/version/epoch/scope/basis revision; no cross-tier reuse.
16. **D42-R16 — Sensitive group labels.** Holder/membership receive none;
    grant-governance gets a safe event-time summary only when current floor/
    classification permits, otherwise **Protected access group**; audit remains
    separately authorized.
17. **D42-R17 — Reason is governance evidence.** Holder/membership tiers never
    receive it; grant/audit only by current purpose.
18. **D42-R18 — Raw history private.** Browser roles have no raw basis/audit
    SELECT.
19. **D42-R19 — RLS/RPC structure.** Forced RLS/security-invoker or pinned
    authorized RPC preserves Tenant/viewer/field boundary.
20. **D42-R20 — Privileged parity.** Owner/service/BYPASSRLS/worker/support/
    export/AI paths enforce the same tier.
21. **D42-R21 — Read audit.** Full audit reads/exports are identifiers-only
    audited; holder read adds no D42 security event.
22. **D42-R22 — Retention.** Phase 12 governance retention owns basis/reason/
    actor/event availability.
23. **D42-R23 — Lawful anonymization.** Departed/deleted actor attribution is
    minimized without rewriting proof.
24. **D42-R24 — Current/history separation.** Projection never grants/mutates
    current access or changes D41 source presentation.
25. **D42-R25 — No secondary leakage.** Logs/telemetry/AI/analytics/tasks/
    notifications/documents/search suggestions receive no provenance.
26. **D42-R26 — Purpose-specific export.** Only current
    `permissions.audit.export` plus `permissions.audit.read` under the
    registered audit purpose returns allowed fields at one bound snapshot.
27. **D42-R27 — Accessible role copy.** Admin uses **Why this person has
    access**; My Access uses **Why you have access** with full accessibility.
28. **D42-R28 — No local ceremony/mutation.** Inherit Phase 12 step-up/risk
    controls; add no D42 approval, role, timer, task, or grant write.
29. **D42-R29 — Traceability.** Audience/field/purpose matrix aligns through
    D38–D42, Phase 12, OpenSpec, implementation, tests, and release.
30. **D42-R30 — Proof gate.** D42 is recorded by this decision; activation
    remains gated on complete auth/privacy/RLS/cache/export/a11y/migration
    evidence. D43 may add a holder correction action but cannot widen or
    reinterpret any D42 field projection.

## Ruthless adversarial review by category

### 1. Problem validity, necessity, and alternatives

**Material concern exists.**

| Failure / why                                                                                                    | Severity / likelihood | Evidence / effect                                                                                       | Permanent fix                                                  | Exact language / AC                                                               |
| ---------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| One all-or-nothing history view either hides useful self/governance context or exposes sensitive reasons/actors. | High / High           | Modern My Access/current/audit surfaces separate purpose and detail. Option survives with server tiers. | Four fixed purpose projections; no Tenant field customization. | “Each audience receives the minimum fields for its current operation.” AC001–020. |

### 2. Brittleness

**Material concern exists.**

| Failure / why                                                                                                | Severity / likelihood | Evidence / effect                                                | Permanent fix                                           | Exact language / AC                                                    |
| ------------------------------------------------------------------------------------------------------------ | --------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| Tier derived from role name, route, prior actor status, or cached capability breaks after role/scope change. | Critical / Medium     | Phase 12 says capabilities/purpose/current assignment authorize. | Server reproof per fetch/page/chunk; cache epoch/scope. | “Historical participation and cached tier never authorize.” AC021–040. |

### 3. Technical debt

**Material concern exists.**

| Failure / why                                                                                    | Severity / likelihood    | Evidence / effect                                     | Permanent fix                                                          | Exact language / AC                                                   |
| ------------------------------------------------------------------------------------------------ | ------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------- |
| One super-payload plus client hiding or many ad hoc field checks duplicates authorization logic. | Critical / High if naive | Field omission must occur before serialization/cache. | Four versioned projection types generated from central allowlists/PDP. | “A field absent from a tier is never selected/serialized.” AC041–050. |

### 4. Edge cases

**Material concern exists.**

| Failure / why                                                                                                                                                  | Severity / likelihood     | Evidence / effect                                      | Permanent fix                                                                  | Exact language / AC                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Multi-hat viewer, self-as-auditor, authority loss mid-page, group rename/archive, departed actors, terminal grants, and multiple Tenants yield ambiguous tier. | Critical / High aggregate | All follow Phase 12 active-assignment/purpose/history. | Exact context/purpose, current field policy, stable history, per-page reproof. | “One request has one assignment/purpose/tier; no automatic highest-tier union.” AC021–040, AC061–080. |

### 5. Footguns

**Material concern exists.**

| Failure / why                                                                                                           | Severity / likelihood | Evidence / effect                                         | Permanent fix                                                                | Exact language / AC                                                                         |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Admin label or D38 possession may accidentally unlock full history; membership manager may infer direct-edit authority. | Critical / Medium     | Current MVP role labels are broad; D39 splits operations. | Exact capability/scope and mutation-bound response; no controls beyond tier. | “Projection visibility grants no mutation capability or adjacent record access.” AC011–020. |

### 6. Tenant safety

**Material concern exists.**

| Failure / why                                                                         | Severity / likelihood | Evidence / effect                           | Permanent fix                                                                   | Exact language / AC                                                                                     |
| ------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Cross-Tenant viewer/subject/basis/cache/export leaks people, groups, reasons, actors. | Critical / Medium     | Phase 12 Tenant context/brand is governing. | Composite Tenant relationships, exact contexts, no shared caches, uniform deny. | “Viewer, subject, grant, basis, export snapshot share one server-derived Tenant.” AC021–040, AC081–100. |

### 7. Database, RLS, and authorization safety

**Material concern exists.**

| Failure / why                                                                                                 | Severity / likelihood              | Evidence / effect                                             | Permanent fix                                                                                | Exact language / AC                                                      |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Raw audit SELECT, non-FORCE RLS, SECURITY DEFINER/owner/service bypass, or unsafe view exposes full evidence. | Critical / High if copied from MVP | PostgreSQL bypass and view semantics require explicit parity. | No raw browser grants; forced RLS; security-invoker/pinned RPC; current PDP/field allowlist. | “Every tier is enforced server-side before row/field egress.” AC041–060. |

### 8. Overengineering

**Material concern exists.**

| Failure / why                                                                                                   | Severity / likelihood | Evidence / effect                                            | Permanent fix                                | Exact language / AC                                                            |
| --------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------ |
| Tenant-configurable tiers, D42 role system, approval/step-up clone, or separate audit store adds policy sprawl. | Medium / Medium       | Phase 12 already owns capabilities, purposes, risk controls. | Fixed code-reviewed tiers; inherit Phase 12. | “D42 adds projections only, no role/approval/grant/step-up engine.” AC111–120. |

### 9. UX/UI and user friction

**Material concern exists.**

| Failure / why                                                                                               | Severity / likelihood | Evidence / effect                                              | Permanent fix                                                                              | Exact language / AC                                                                     |
| ----------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Generic copy, empty redacted fields, audit JSON, wide tables, or hidden hover details confuse users/mobile. | High / High           | D41 establishes role-specific disclosure labels/accessibility. | Correct labels, omit absent fields, semantic stacked lists/chronology, progressive detail. | “My Access says Why you have access; admin says Why this person has access.” AC061–080. |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists.**

| Failure / why                                                                                         | Severity / likelihood | Evidence / effect                                                  | Permanent fix                                                            | Exact language / AC                                                   |
| ----------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| UI tier, cache, export, audit row, role label may become authority; history may change current grant. | Critical / High       | Phase 12 current grants/PDP and D40 basis have separate ownership. | Current authorization unchanged; projection read-only; ownership matrix. | “D42 projections never write or authorize D38.” AC001–010, AC101–110. |

### 11. Hidden coupling

**Material concern exists.**

| Failure / why                                                                                        | Severity / likelihood | Evidence / effect                      | Permanent fix                                               | Exact language / AC                                                     |
| ---------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| Current/historic group membership, policy/source/task/notification/support/AI status may imply tier. | Critical / Medium     | D42 tiers are operation/purpose based. | Closed source/purpose registry and explicit negative tests. | “Only current Phase 12 projection authority selects a tier.” AC011–030. |

### 12. Failure modes

**Material concern exists.**

| Failure / why                                                                             | Severity / likelihood | Evidence / effect                   | Permanent fix                                                                    | Exact language / AC                                                                         |
| ----------------------------------------------------------------------------------------- | --------------------- | ----------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| PDP/history/audit store fails; low tier might receive cached high tier or partial fields. | Critical / Medium     | Fail-closed is safer than fallback. | No tier on auth uncertainty; typed atomic projection; history unavailable state. | “Projection failure returns no provenance and never falls back to another tier.” AC031–050. |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists.**

| Failure / why                                                                       | Severity / likelihood | Evidence / effect                              | Permanent fix                                                                               | Exact language / AC                                     |
| ----------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Viewer loses role/scope mid-page/export; out-of-order responses re-expose old tier. | Critical / Medium     | Current auth must be checked on every request. | Per cursor/chunk reproof; epoch/scope keys; discard old response; deterministic projection. | “No post-revocation page/chunk is returned.” AC021–040. |

### 14. Data integrity risks

**Material concern exists.**

| Failure / why                                                                                                      | Severity / likelihood | Evidence / effect                        | Permanent fix                                                                            | Exact language / AC                                                                                  |
| ------------------------------------------------------------------------------------------------------------------ | --------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Field classification/version drift, missing basis, broken actor/group references, or anonymization rewrites proof. | High / Medium         | D40/D41 require immutable typed history. | Versioned allowlists, restrictive history, safe former-actor projection, reconciliation. | “Unknown field/tier version fails closed; provenance remains reconstructible.” AC041–060, AC101–110. |

### 15. Security and privacy risks

**Material concern exists.**

| Failure / why                                                                                                               | Severity / likelihood            | Evidence / effect                                | Permanent fix                                                                                      | Exact language / AC                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Group labels/reasons expose sensitive ministry/security responsibilities; “full” audit can be misread as unrestricted data. | Critical / High enough to design | D40 reason audit-only; labels are user-authored. | Settled tier label allowlist, separate audit capability/purpose/floor/clearance, no domain fields. | “Grant governance sees a safe label only when current floor/classification permits; otherwise Protected access group. Full audit means full authorization evidence only.” AC051–080. |

### 16. Scalability and performance risks

**Material concern exists.**

| Failure / why                                                                                                 | Severity / likelihood | Evidence / effect                                 | Permanent fix                                                                                            | Exact language / AC                                                                  |
| ------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Per-row PDP/N+1, full chronology load, read-audit contention, or high-tier payload caching degrades at scale. | High / Medium         | Audit view may be large; tiers differ materially. | Set-based allowlisted queries, pagination, bounded audit insert/outbox under Phase 12, no super-payload. | “List/page work is bounded and tier-specific; no full-payload filtering.” AC081–100. |

### 17. Operational burden

**Material concern exists.**

| Failure / why                                                                                                  | Severity / likelihood | Evidence / effect                           | Permanent fix                                                   | Exact language / AC                                                     |
| -------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Many configurable tiers/field toggles require tribal knowledge; too little context causes support escalations. | Medium / High         | Four operations have stable distinct needs. | Fixed tier matrix, clear labels, centralized policy docs/tests. | “Tenants cannot customize field-tier membership.” AC001–020, AC111–120. |

### 18. Observability and auditability gaps

**Material concern exists.**

| Failure / why                                                                                 | Severity / likelihood | Evidence / effect                                            | Permanent fix                                               | Exact language / AC                                                                          |
| --------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Full provenance reads unlogged; logs include reason; coverage reports zero checks as success. | High / Medium         | Viewing sensitive governance evidence is itself significant. | Identifier-only read audit and coverage counts; scrub text. | “Audit full reads/exports by tier/purpose/count/outcome without copying content.” AC081–100. |

### 19. Dependency and integration risks

**Material concern exists.**

| Failure / why                                                                                    | Severity / likelihood | Evidence / effect                  | Permanent fix                                                | Exact language / AC                                                                                             |
| ------------------------------------------------------------------------------------------------ | --------------------- | ---------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| AI, analytics, exports, logging, search, Realtime, Inngest, or browser cache receives high tier. | Critical / Medium     | Secondary egress bypass is common. | Closed egress matrix; explicit no fields; parity/meta-tests. | “No secondary system consumes D42 provenance unless a registered purpose/tier explicitly admits it.” AC081–110. |

### 20. Migration, rollout, and upgrade risks

**Material concern exists.**

| Failure / why                                                                                                 | Severity / likelihood | Evidence / effect                              | Permanent fix                                                                                   | Exact language / AC                                                                       |
| ------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Existing history lacks classification; old client receives full payload; mixed versions cache tiers together. | Critical / Medium     | D42 is new read policy over existing evidence. | Deny-unknown fields, server projections first, tier/version cache keys, no backfill disclosure. | “Migration grants no new viewer; reader/deny boundary lands before UI/export.” AC101–110. |

### 21. Testability, traceability, and proof

**Material concern exists.**

| Failure / why                                                                                                       | Severity / likelihood | Evidence / effect                     | Permanent fix                                                                        | Exact language / AC                                                                    |
| ------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Tests cover one role/UI while missing fields/audiences/operations, multi-hat, mid-read loss, RLS/service/export/AI. | Critical / High       | D42 is a field-level security matrix. | Field-by-field contract tests and poison fixtures for every audience/operation/door. | “Release proves both allowed and absent fields at serialized public seams.” AC111–120. |

### 22. Other development hazards

**Material concern exists.**

| Failure / why                                                                                                                 | Severity / likelihood | Evidence / effect                           | Permanent fix                                                                                    | Exact language / AC                                                            |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Provenance becomes staff scoring, subject surveillance, or support backdoor; redaction reveals that a sensitive group exists. | High / Medium         | D38 forbids scoring and uniformity matters. | No scoring; generic omission, not “redacted sensitive group”; support uses separate audit grant. | “Omission reveals no hidden tier/field/group existence.” AC051–080, AC091–100. |

## Acceptance criteria

### Tier selection and field allowlists

- **D42-AC001:** Exactly four registered D42 projection purposes/types exist:
  holder, membership consequence, grant governance, and security/audit.
- **D42-AC002:** Caller-supplied tier/purpose/role/field list is rejected and
  cannot upgrade the server-derived projection.
- **D42-AC003:** Holder projection includes **Added for continuity**, localized
  creation date, the fixed plain-language explanation, and already-authorized
  current direct source/end only.
- **D42-AC004:** Holder projection excludes group label/ID, reason, actors,
  authority/delegation, basis/hash, receipt, epoch/head, and other history.
- **D42-AC005:** Holder projection requires exact self and current Active Tenant
  Assignment; another assignment/person fails.
- **D42-AC006:** Membership projection exists only in exact governed group-
  membership removal/end review/receipt.
- **D42-AC007:** Membership projection includes direct-survivor Boolean/summary
  and current direct end condition only.
- **D42-AC008:** Membership projection excludes continuity origin/date, group
  history, reason, actors, basis, delegation, receipts, chronology, and direct
  edit controls.
- **D42-AC009:** Grant-governance projection includes only current grant state/
  duration/target, continuity/date, allowed safe source summary, minimized
  reason/attribution, relevant chronology, and recertification state.
- **D42-AC010:** Grant-governance excludes raw basis/hash/IDs, full membership/
  delegation/actual-acting actor/receipt/epoch/head and domain data.
- **D42-AC011:** Security/audit projection requires separate current Phase 12
  audit-read capability, registered audit purpose, exact scope, floor/
  clearance, and existing risk step-up where applicable.
- **D42-AC012:** Security/audit projection may return full typed authorization
  basis/authority/delegation/actors/receipts/chronology but no protected domain
  data, secrets, credentials, unrestricted rows, or another Tenant.
- **D42-AC013:** Everyone outside the four current projections receives no
  historical provenance and no signal that hidden fields exist.
- **D42-AC014:** Owner/Admin/staff role labels, D38 possession, policy/source/
  task/coordinator/support/service/AI/URL/cache state imply no tier.
- **D42-AC015:** Past grantor/reviewer/auditor/group manager/member/actor status
  gives no current provenance read.
- **D42-AC016:** Every projection is a versioned server response type with a
  closed explicit field allowlist.
- **D42-AC017:** Field absent from a tier is not selected, serialized into RSC,
  logged, cached, or sent to client.
- **D42-AC018:** A full audit payload is never fetched then filtered/hidden in
  React for holder/membership/grant tiers.
- **D42-AC019:** Unknown tier/version/field classification fails closed and
  returns no provenance.
- **D42-AC020:** D43 holder correction UI cannot widen any D42 projection field
  or imply direct-grant mutation authority.

### Current authorization, purpose, multi-hat, and mid-read loss

- **D42-AC021:** Every provenance read binds one server-derived Tenant
  Authorization Context and exact viewer/subject assignments.
- **D42-AC022:** Holder, membership, grant, and audit purposes are registered
  and bound to their exact surfaces, never free caller text.
- **D42-AC023:** My Access always returns holder-minimized projection even when
  the same Party also has grant/audit capability.
- **D42-AC024:** Full audit requires deliberate navigation/request to the
  separate audit surface and current audit purpose proof.
- **D42-AC025:** Capabilities from another Tenant/hat/assignment/surface are not
  unioned into the active projection.
- **D42-AC026:** A same-Tenant multi-capability viewer receives only the fields
  admitted by the active surface purpose.
- **D42-AC027:** Current authority is re-proved for initial route load and every
  disclosure expansion/refetch.
- **D42-AC028:** Every page/cursor of grant/audit chronology re-proves current
  viewer assignment, capability/scope, purpose, floor/clearance, and epoch.
- **D42-AC029:** Every export/download chunk or long stream re-proves current
  audit/export authority before returning more data.
- **D42-AC030:** Losing role/capability/scope/assignment/purpose eligibility
  prevents every later fetch/page/chunk uniformly.
- **D42-AC031:** Already rendered data is cleared on next state/navigation after
  authority-loss response and is never written into lower-tier cache.
- **D42-AC032:** Out-of-order pre-revocation response cannot overwrite a newer
  denied/lower-tier state.
- **D42-AC033:** Tier cache key includes Tenant, viewer assignment, subject,
  purpose, tier/version, grant/basis revision, epoch, and scope revision.
- **D42-AC034:** Cross-Tenant, cross-viewer, cross-subject, cross-purpose, or
  cross-tier cache reuse is rejected.
- **D42-AC035:** High-tier server/client cache is never reused then trimmed for
  a lower tier.
- **D42-AC036:** Realtime sends no basis/reason/actor/source-history payload and
  cannot reopen a revoked tier.
- **D42-AC037:** Authorization/PDP uncertainty returns no provenance and never
  falls back to holder or cached prior tier.
- **D42-AC038:** History/projection failure does not alter D41 current access
  and returns one role-appropriate unavailable state.
- **D42-AC039:** Exact replay at identical authoritative inputs returns an
  identical tier/schema/field set.
- **D42-AC040:** Viewer losing authority mid-export receives no later rows and
  the durable audit records the partial/denied outcome without sensitive text.

### Sensitive labels, reasons, actors, and retention

- **D42-AC041:** Holder and membership projections contain no historical group
  label, identifier, count, or hidden-label marker.
- **D42-AC042:** Grant-governance emits event-time safe group summary only when
  current floor/classification/scope permits that label.
- **D42-AC043:** Otherwise grant-governance emits stable **Protected access
  group** without revealing why the label was suppressed.
- **D42-AC044:** Security/audit receives event-time/current group labels only
  under separate audit-read capability/purpose/floor/clearance.
- **D42-AC045:** Holder and membership projections contain no governance
  reason or excerpt.
- **D42-AC046:** Grant-governance receives the bounded reason only when current
  grant-review/revoke/attest purpose requires it.
- **D42-AC047:** Security/audit receives reason only under current authorized
  field policy and governance purpose.
- **D42-AC048:** Reason is never treated as domain fact, recipient message,
  task comment, search suggestion, AI text, or analytics dimension.
- **D42-AC049:** Grant-governance actor attribution is a safe display summary,
  not raw actual/acting IDs or delegation chain.
- **D42-AC050:** Security/audit separately receives actual/acting actors,
  assignments, authority/delegation, receipts, and heads when authorized.
- **D42-AC051:** Departed/deleted actor renders lawful minimized attribution
  such as Former staff member for holder/grant tiers.
- **D42-AC052:** Security/audit may use a stable pseudonymous audit reference
  under retention without restoring deleted personal data.
- **D42-AC053:** Anonymization never rewrites grant authority, D40 basis,
  chronology, receipt relation, or terminal cause.
- **D42-AC054:** Retention/disposition is Phase 12-governed and applies per
  field class; D42 UI cannot extend retention.
- **D42-AC055:** Expired-retention fields are omitted uniformly and do not
  expose that a sensitive value once existed to an unauthorized tier.
- **D42-AC056:** Group rename preserves event-time identity/label under the
  authorized tier and current label only when allowed.
- **D42-AC057:** Archived/deleted group history remains stable/noninteractive
  without raw ID or cross-Tenant link.
- **D42-AC058:** Party merge/assignment recreation neither transfers nor unions
  provenance visibility.
- **D42-AC059:** Basis/reason/actor fields are absent from general backup
  extracts or restored only under the same governed retention/projection.
- **D42-AC060:** D43 correction action receives no group label, reason, actor,
  basis, or audit field beyond holder tier.

### RLS, views, RPCs, privileged paths, and read audit

- **D42-AC061:** Grant/basis/audit/projection relations carry `tenant_id NOT
NULL` and same-Tenant relationships to viewer/subject context.
- **D42-AC062:** Raw grant-basis/audit relations grant no browser SELECT.
- **D42-AC063:** Required relations/projections ENABLE/FORCE RLS or provably
  preserve the same underlying forced-RLS boundary.
- **D42-AC064:** Security-invoker view or hardened RPC derives viewer/Tenant/
  subject/purpose/tier and projects only allowlisted columns.
- **D42-AC065:** SECURITY DEFINER functions pin `search_path` and reject/ignore
  caller-supplied actor, Tenant, purpose, tier, fields, and audit attribution.
- **D42-AC066:** Operation policies enforce correct `USING`/`WITH CHECK` and
  cannot transform one Tenant/viewer/subject/tier into another.
- **D42-AC067:** Table owner, service role, `BYPASSRLS`, worker, support,
  repair, import, export, Realtime, AI, and Inngest pass field-tier parity.
- **D42-AC068:** Full audit-read route proves separate audit-read capability,
  registered purpose, exact scope, floor/clearance, and Phase 12 step-up where
  applicable.
- **D42-AC069:** Support/operator status alone receives no audit tier and uses
  Phase 12's separate purpose-bound operator grant if authorized.
- **D42-AC070:** Full audit provenance read appends a durable identifiers-only
  read-audit before/with return as Phase 12 requires.
- **D42-AC071:** Read-audit records viewer/subject Tenant IDs, purpose, tier/
  field class, row count, snapshot, outcome, and correlation—not reason/group
  text.
- **D42-AC072:** Holder safe own-history read creates no new D42 security audit
  event beyond ordinary product telemetry.
- **D42-AC073:** Membership consequence read is covered by its existing
  mutation review/receipt audit without duplicate D42 event.
- **D42-AC074:** Grant-governance reason/actor reads follow Phase 12 risk/read-
  audit classification and cannot be silently bulk-enumerated.
- **D42-AC075:** Failed/denied full reads/exports are audit-recorded without
  leaking whether hidden provenance exists.
- **D42-AC076:** Read-audit failure follows Phase 12 fail-safe tier behavior and
  never returns unaudited full evidence.
- **D42-AC077:** Audit logs/history are immutable/hash-protected as Phase 12
  specifies and ordinary lifecycle cannot hard-delete them.
- **D42-AC078:** Audit of audit reads avoids recursion/unbounded loops and uses
  bounded identifiers-only records.
- **D42-AC079:** Reconciliation reports Tenants, projections, tiers, fields,
  read audits, and mismatches, not merely zero errors.
- **D42-AC080:** Raw SQL/repair access is separately authorized/audited and
  never justified by D42 UI capability.

### UX, accessibility, performance, and secondary egress

- **D42-AC081:** My Access disclosure is exactly **Why you have access**.
- **D42-AC082:** Administration disclosure is exactly **Why this person has
  access**.
- **D42-AC083:** Membership review presents only direct survivor/end condition
  as current consequence, not an expandable history panel.
- **D42-AC084:** Grant-governance omits unauthorized fields entirely rather
  than disabled/redacted rows that reveal their existence.
- **D42-AC085:** Audit surface renders typed semantic field groups/chronology,
  not raw JSON/database dump.
- **D42-AC086:** Current source precedes historical detail in visual and DOM
  order for every tier.
- **D42-AC087:** Disclosures/chronology have accessible names, expanded state,
  headings, lists, table alternatives, and logical keyboard order.
- **D42-AC088:** Important controls are at least 44-by-44 CSS pixels with
  visible/restored focus and programmatic load/error/status.
- **D42-AC089:** Every tier reflows at 320 CSS pixels and 400-percent zoom
  without horizontal dependency.
- **D42-AC090:** Forced colors/reduced motion preserve meaning; no icon/color/
  hover/truncation-only field/tier state.
- **D42-AC091:** Localized dates/zones/plurals and Unicode/RTL/CJK/long names/
  reasons remain unambiguous with bidi isolation.
- **D42-AC092:** Low-bandwidth failure returns no higher-tier partial payload
  and preserves D41 current access.
- **D42-AC093:** History/detail pagination uses stable cursor/order and bounded
  page size; no unbounded chronology render.
- **D42-AC094:** Tier query selects only needed fields and performs no per-row
  PDP/N+1 over visible results.
- **D42-AC095:** High-tier query and identifiers-only read audit remain within
  established Phase 12 governance/audit performance budgets.
- **D42-AC096:** Revocation/authority-loss invalidates caches without per-viewer
  synchronous fan-out.
- **D42-AC097:** General logs/traces/errors contain no group label, reason,
  actor, basis, authority, receipt, or chronology.
- **D42-AC098:** AI prompts/embeddings/summary tools receive no D42 provenance
  and cannot infer a tier.
- **D42-AC099:** Analytics/BI/search suggestions/Tasks Hub/notifications/
  documents receive no provenance fields.
- **D42-AC100:** No provenance field/tier is used for staff/Tenant performance,
  engagement, readiness, risk, surveillance, or ministry-health scoring.

### Export, migration, concurrency, proof, and traceability

- **D42-AC101:** Holder and membership tiers provide no provenance export.
- **D42-AC102:** Grant-governance export, if Phase 12 already admits it,
  requires current export capability/purpose and uses minimized grant fields.
- **D42-AC103:** Full audit export requires current `permissions.audit.export`
  plus `permissions.audit.read`, registered `access.security_audit` purpose,
  floor/clearance/step-up, current scope, and durable receipt/read audit.
- **D42-AC104:** Every export binds one Tenant/viewer/purpose/tier/version/
  epoch/scope snapshot and cannot mix tiers or revisions.
- **D42-AC105:** Viewer authority loss mid-export stops later chunks and records
  partial/denied outcome without leaking remaining count/content.
- **D42-AC106:** Migration/backfill grants no viewer, tier, capability, purpose,
  label visibility, or inferred read authority.
- **D42-AC107:** Unknown/unclassified legacy history fields are omitted until
  code-reviewed into a tier.
- **D42-AC108:** Readers/RLS/deny gates land before any UI/export; old clients
  cannot fetch super-payloads.
- **D42-AC109:** Mixed-version caches bind tier/projection version and cannot
  replay old high-tier payload under new/lower policy.
- **D42-AC110:** Rollback disables new provenance UI/export while preserving
  current D38 access, D40/D41 history, Phase 12 audit/read-audit, and retention.
- **D42-AC111:** Field-matrix contract tests assert every allowed field and
  every absent field for each tier.
- **D42-AC112:** Negative tests cover role labels, D38, historic participation,
  URL, caller tier/purpose/fields, wrong Tenant/hat, and cached payload.
- **D42-AC113:** Multi-hat tests prove My Access stays holder-minimized and
  audit requires deliberate authorized surface.
- **D42-AC114:** Mid-read tests revoke capability/scope/assignment/floor/
  clearance between route/page/export chunks and prove no later disclosure.
- **D42-AC115:** RLS/privileged poison tests cover browser/raw view, owner,
  service, `BYPASSRLS`, RPC, worker, support, repair, export, AI, and cache.
- **D42-AC116:** Privacy/retention tests cover sensitive labels/reasons,
  departed actors, anonymization, archive/delete, and uniform omission.
- **D42-AC117:** Accessibility/manual tests cover role-specific copy,
  keyboard/screen reader, focus, 44px, 320px/400%, forced colors, RTL/CJK, and
  low bandwidth.
- **D42-AC118:** Production-shaped tests prove bounded tier queries/pagination/
  audit overhead and no N+1/super-payload.
- **D42-AC119:** D42 audience/field/purpose matrix traces through Grill,
  glossary, ADRs, Phase 12/OpenSpec, design, tasks, tickets, tests, and release.
- **D42-AC120:** D42 is recorded independently of D43; activation requires
  every named monitor plus complete positive/negative/privacy/concurrency/
  migration/a11y/production-shaped evidence to agree, and any later holder-
  correction action cannot widen a D42 projection.

## Named monitors

| Signal                                                          |                                                                     Threshold | Owner                    | Required response                                                                                   |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------: | ------------------------ | --------------------------------------------------------------------------------------------------- |
| `website_recovery_d42_holder_overdisclosure_total`              |                                                    Any forbidden holder field | Privacy + Security       | Contain disclosure, purge caches, inspect all holder reads.                                         |
| `website_recovery_d42_membership_overdisclosure_total`          |                                                Any forbidden membership field | Privacy + IAM            | Disable projection, inspect mutation reviews/receipts.                                              |
| `website_recovery_d42_grant_overdisclosure_total`               |                                             Any field outside grant allowlist | Privacy + IAM            | Disable projection/export and audit affected reads.                                                 |
| `website_recovery_d42_audit_without_separate_capability_total`  |                                                                           Any | Security                 | P0 contain, inspect all audit reads/exports and authority paths.                                    |
| `website_recovery_d42_export_without_separate_capability_total` |                                                                           Any | Security + Compliance    | Stop downloads, revoke artifacts where possible, and repair `permissions.audit.export` enforcement. |
| `website_recovery_d42_audit_without_registered_purpose_total`   |                                                                           Any | Security                 | Disable route/export and repair purpose binding.                                                    |
| `website_recovery_d42_audit_floor_clearance_bypass_total`       |                                                                           Any | Security                 | P0 contain and inspect restricted labels/history exposure.                                          |
| `website_recovery_d42_everyone_else_nonempty_total`             |                                                                           Any | Privacy                  | Remove payload/cache and repair default-deny projection.                                            |
| `website_recovery_d42_client_side_field_hiding_total`           |                                      Any high-tier payload sent to lower tier | Security + Frontend      | Block release, remove super-payload, add server projection.                                         |
| `website_recovery_d42_multi_hat_union_total`                    |                                                                           Any | Security                 | P0 contain, repair active-assignment/purpose resolution.                                            |
| `website_recovery_d42_post_revocation_page_total`               |                                                          Any later page/chunk | Security + IAM           | Contain stream/export, invalidate caches, repair reproof.                                           |
| `website_recovery_d42_cross_tenant_cache_total`                 |                                                                           Any | Security + Platform      | P0 isolation response, purge cache, inspect exposure.                                               |
| `website_recovery_d42_cross_tier_cache_total`                   |                                                                           Any | Security + Platform      | Purge cache, disable route, repair key/schema.                                                      |
| `website_recovery_d42_sensitive_label_leak_total`               |                                                        Any unauthorized label | Privacy + Security       | Contain, inspect D42 field policy and affected reads.                                               |
| `website_recovery_d42_reason_leak_total`                        |                                   Any holder/membership/general-egress reason | Privacy                  | Contain disclosure, scrub caches/logs, repair allowlist.                                            |
| `website_recovery_d42_actor_leak_total`                         |                                                  Any unauthorized actor field | Privacy + Security       | Contain and repair projection/retention policy.                                                     |
| `website_recovery_d42_raw_history_browser_grant_total`          |                                                                           Any | Database Security        | Revoke grant, inspect queries/read exposure.                                                        |
| `website_recovery_d42_rls_contract_drift_total`                 |                                                                           Any | Database Security        | Block deploy, restore FORCE/policies/views/grants.                                                  |
| `website_recovery_d42_privileged_path_parity_failure_total`     |                                                                           Any | Security                 | Disable failing path until tier parity passes.                                                      |
| `website_recovery_d42_unaudited_full_read_total`                |                                                                           Any | Compliance + Security    | Stop full reads/export, repair read-audit, investigate evidence.                                    |
| `website_recovery_d42_read_audit_text_leak_total`               |                                                         Any reason/group text | Privacy + Compliance     | Scrub sink, rotate access if needed, repair identifiers-only event.                                 |
| `website_recovery_d42_ai_analytics_log_leak_total`              |                                                                           Any | Privacy + Product        | Disable consumer, remove derived data where lawful, governance review.                              |
| `website_recovery_d42_hard_deleted_history_total`               |                                                                           Any | Compliance + Database    | Stop deletion, recover evidence, repair retention/FKs.                                              |
| `website_recovery_d42_projection_n_plus_one_total`              |                                       Any query count scaling per visible row | IAM + Database           | Block performance release, replace with set-based projection.                                       |
| `website_recovery_d42_audit_projection_latency`                 | p95 greater than 2× audit baseline for 15 minutes and at least 1,000 requests | IAM + SRE                | Inspect indexes/audit overhead and pause rollout.                                                   |
| `website_recovery_d42_midread_denial_rate`                      |                        Greater than 5% over 15 minutes and at least 100 reads | IAM + Security           | Inspect role churn/session/cache; do not weaken reproof.                                            |
| `website_recovery_d42_accessibility_blocker_total`              |                                                           Any critical defect | Product Design           | Block release pending complete proof.                                                               |
| `website_recovery_d42_provenance_support_rate`                  |                   Greater than 5 cases per 100 views/30 days and at least 100 | Product Design + Support | Run tier/copy usability study; preserve privacy boundary.                                           |
| `website_recovery_d42_staff_scoring_use_total`                  |                                                                           Any | Privacy + Product        | Disable consumer and delete derived scoring where lawful.                                           |

## Ruthless synthesis

### Resolved before recording

1. Four closed server projections and field matrix.
2. Separate current Phase 12 audit-read capability, registered audit purpose,
   exact scope, floor/clearance, and inherited step-up for full audit.
3. Exact Active Tenant Assignment/surface purpose with no multi-hat union.
4. Current reproof per route/page/cursor/export chunk and mid-read denial.
5. No super-payload/client hiding or cross-tier cache.
6. Settled group-label policy: holder/membership none; grant safe label only
   when floor/classification permits, otherwise **Protected access group**;
   audit separately authorized.
7. Raw-history/RLS/privileged/read-audit boundary.
8. Retention/anonymization and no secondary egress.
9. Exact role-specific copy/accessibility.
10. A closed D43 seam: holder correction is a separate decision and cannot
    widen D42 fields or become grant authority.

### Must be captured in specification/design

1. Projection schemas/versions/purpose registry and field classifications.
2. Viewer/subject/Tenant/assignment/multi-hat/mid-read lifecycle.
3. Sensitive label/reason/actor/delegation/receipt field rules.
4. Cache keys/invalidation and Realtime prohibition.
5. RLS/views/RPC/service/owner/export/read-audit implementation.
6. Retention/anonymization/archived-deleted references.
7. UI field omission, labels, chronology, mobile/a11y/low-bandwidth.
8. Export schemas/snapshot/chunk reproof.
9. AI/analytics/logs/tasks/notifications no-egress matrix.

### Required implementation order

1. Reconcile D42/D43 dependency with D38–D41, Phase 12, glossary, ADR/OpenSpec.
2. Register purposes/audit-read capability and four response types/allowlists.
3. Add server projection/PDP and raw-table denial/forced RLS boundary.
4. Add multi-hat/current reproof and tiered cache keys.
5. Add sensitive-field policy, read-audit, retention/anonymization.
6. Add purpose-specific exports and secondary-egress bans.
7. Add role-specific accessible UI.
8. Add field-by-field positive/negative/poison/mid-read/export tests.
9. Backfill/grant nothing; reader-only canary.
10. Expand only with clean privacy/security/cache/audit/performance/a11y signals.

## Migration, rollout, and rollback

1. Land field registry/purpose/tier types and deny-unknown behavior.
2. Revoke/verify raw browser history grants and forced RLS.
3. Deploy server projections before UI/export consumers.
4. Partition/version caches before returning any high-tier payload.
5. Migrate no viewer, capability, purpose, scope, label visibility, or tier.
6. Old/unclassified fields remain omitted.
7. Canary holder, membership, grant, audit separately with synthetic data.
8. Exercise mid-read authority loss and cross-tier/Tenant cache poison.
9. Keep kill switches per projection/export; current D38 access remains.
10. Rollback preserves D40/D41 history, audit/read-audit, retention, and
    current authorization while exposing no unsupported tier.

## Traceability

| Artifact             | Required D42 trace                                                           |
| -------------------- | ---------------------------------------------------------------------------- |
| Grill log            | Founder tier choice, corrected audit authority/field matrix, D43 seam        |
| Glossary             | Purpose-tiered provenance, safe group summary, governance audit evidence     |
| Phase 12/ADR         | audit-read capability/purpose/floor, projections, RLS, read-audit, retention |
| D40/D41              | basis fields, current-vs-history ownership, role-specific copy               |
| OpenSpec             | audiences, fields, operations, purposes, errors, cache/export rules          |
| Design/tasks/tickets | Every requirement/AC/monitor, no client hiding                               |
| Tests/release        | Serialized allowed/absent fields across every viewer/door                    |

## Decision to record

> **D42 — Purpose-tiered continuity provenance.** Core emits one of four
> server-derived field-allowlisted projections: holder self summary; exact
> membership-removal survivor consequence; minimized grant-governance evidence;
> or full authorization-governance audit.
>
> Holder sees **Added for continuity** and date only under **Why you have
> access**. Membership manager sees direct survivor/end only. Current grant
> manager/reviewer sees the minimized reason/origin/actor/source needed to
> govern. Full typed basis/delegation/actual-acting actors/receipts/chronology
> requires a separate current Phase 12 audit-read capability, registered audit
> purpose, exact scope, floor/clearance, and existing risk step-up. Everyone
> else sees none.
> Bulk audit export additionally requires current `permissions.audit.export`;
> audit-read authority alone never creates a downloadable copy.
>
> Group labels are field-sensitive: holder/membership none; grant governance
> sees a safe event-time summary only when current policy permits, otherwise
> **Protected access group**; audit remains separately authorized. “Full” never
> includes domain records or secrets.
>
> Every request/page/export chunk re-proves one exact Tenant assignment,
> purpose, tier, scope, floor, and epoch. No multi-hat union, historical
> entitlement, client-side hiding, cross-tier cache, raw browser history, or
> privileged bypass exists. Full reads are identifiers-only audited; retention/
> anonymization and secondary egress remain governed.
>
> Administration says **Why this person has access**; My Access says **Why you
> have access**. D42 changes no authority and adds no role/approval/task/timer/
> notification/AI/conversion/Inngest engine. D43 now defines the holder's safe
> correction action without widening D42.

## Historical D43 question — resolved 2026-08-29

Founder selected Option 1, corrected to one typed Phase 12 holder direct-grant
review request. My Access uses the inline **Ask for an access review** action;
submission changes no access; the authoritative administrator area is the
permission-filtered **Access requests** lane under **Review current access**;
and current exact `permissions.manage_grants` authority is required to keep or
remove the source. The request lifecycle, subject-only **My access requests**
history, database/RLS boundary, atomic source removal, ADR-0183 task projection,
optional executor role, and D44 personal-routing seam are recorded in the
[D43 adversarial review](./phase-24-d43-governed-holder-access-review-adversarial-review.md)
and
[D43 primary research](./phase-24-d43-governed-holder-access-review-primary-research.md).

D43 changes no D42 field, purpose, viewer, floor, or current-access truth. This
historical question is retained only by the Grill decision log; it is no longer
an open dependency of D42.
