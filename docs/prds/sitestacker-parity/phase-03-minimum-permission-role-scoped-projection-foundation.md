# Phase 3 — Minimum Permission & Role-Scoped Projection Foundation

**Program:** SiteStacker Parity · **Phase:** 3 · **Status:** Groomed; tracked by epic #489 + children

> Buildable synthesis of the Phase 3 grill (decisions D1–D12) plus a nonprofit-CRM/CMS best-practice validation and a gap-check verified against the live schema on this branch. Grounded in the repo as of drafting; **specific file/line references may drift** — treat them as pointers, not contracts. New canonical terms are reconciled in **Glossary & OpenSpec** below and must be added to the repo-root `CONTEXT.md`.

> **Phase 16 downstream registration amendment (2026-07-13).** Phase 16 adds
> recurring groups, lines, billing cohorts, execution legs, schedule epochs,
> occurrences, collection attempts, command/evidence journals,
> provider-control incidents, fixed-total pledges and expectations, fulfillment
> applications, authority evidence, reminder records, and derived support-health
> projections to this phase's record/projection/egress census. They are born
> blind on every surface until their fields and row scopes are classified.
> Mission Control, donor portal, missionary dashboard, communication rendering,
> reporting, and governed export MUST all call the same `resolveProjection`
> boundary. Exact next dates, donor identity, authorization evidence, payment
> metadata, provider identifiers, decline/return facts, and restricted-ministry
> relationships receive explicit per-surface classification; no new Phase 16
> reader or export may bypass the floor because it is a projection or aggregate.

> **Legal Entity scope amendment (2026-07-27; Phase 20 D3 /
> ADR-0044).** Tenant remains the outer RLS and authorization boundary. A
> Legal Entity is a subtract-only row scope _inside_ that Tenant, enforced by
> the same `resolveProjection` Policy Decision Point (PDP) and every existing
> Policy Enforcement Point (PEP); it is not another tenant, role system,
> resolver, or `field_policies` dimension. Every financial record presented to
> the resolver carries an explicit immutable `legal_entity_id`. Missing,
> stale, unrecognized, or out-of-scope entity authority fails closed with the
> same not-found uniformity as any other denied row. Phase 12 supplies the
> configurable entity grants and runtime-verifiable scope binding. A
> single-entity tenant still persists and checks the exact entity but presents
> no selector or extra workflow.

---

## Problem Statement

The platform is about to build CRM depth — custom fields, richer donor and missionary dashboards, reports, exports, workflows, imports, and communications — on top of surfaces that **leak by construction**:

- The donor portal and missionary workspace each **hand-roll their own allow-list `SELECT`s** (`donor-portal/service.ts`, `missionary-portal/service.ts`). There is no shared enforcement, so every new surface re-invents "what may this surface see," and the lists silently drift from intent.
- **Three CSV serializers have live formula-injection** on donor-controlled name fields (`crm/reports/service.ts`, `packages/ui/.../data-table/utils/export.ts`, `support-hub/lib/report-export.ts`) — a donor named `=HYPERLINK(...)` executes when staff open the export. Phase 2's PRD _promised_ neutralization for `source_code` and it was never implemented.
- **`sendEmail()` ignores consent** — `do_not_email` / `do_not_contact` / `email_suppressions` are never checked before an outbound send, so an opted-out donor can be emailed.
- The template renderer (`renderTemplateForRecipient`) accepts an **unconstrained field bag** with no per-recipient gating, so a mis-scoped caller can leak internal or other-party fields into a donor/missionary email.
- Nothing is **fail-closed**: a new or unclassified field is exposed by whatever query happens to select it.

Building more CRM on this foundation bakes the leaks in. The three injection/consent issues are **live today** (spun off as fast-track security patches — see Further Notes); everything else compounds as surfaces expand. Phase 3 sets the **security floor** first: one place that decides who may see, edit, and export each field, enforced in `packages/api`, provable and demoable — so later phases build on rules instead of re-inventing them.

This is a **foundation** phase, not the full permissions product. It creates the minimum reusable model and enforcement; the full permission-management product (groups, inheritance, CRUD matrices, impersonation) is explicitly deferred.

---

## Solution

Build the **full conceptual projection model now, integrated with the systems that already exist** (not a parallel one), with five moving parts:

1. **`field_policies`** — one field-only static lookup keyed `(record_type, field_key, surface, tenant_id)` → `{visible, editable, exportable, sensitivity_category}`. Fail-closed: no row ⇒ invisible/non-exportable outside Mission Control.
2. **A surface-generic, subtract-only projection resolver** — the single read/write chokepoint. Effective access = `field_policies ∩ tenant boundary ∩ Legal Entity scope ∩ row-scope ∩ record-flags ∩ record-state`. It can only ever _remove_ access, never grant it. All conditional/row logic (Legal Entity, ownership, gift anonymity, relationship-scope, record-state, consent) lives here, **never** in `field_policies`.
3. **A code-source-of-truth capability registry** — generalizes the existing contributions-only capability pattern; effective capability = union across a user's active memberships (multi-hat). Capability _tables_ are deferred (D12); code is the sole authority and Mission Control renders it read-only.
4. **One unified export-governance layer** — a single policy source + shared `csvSafeCell` + one consent gate + identifiers-only audit, governing CSV, receipts, and email now, with Mailchimp as a fully-specified contract.
5. **A change-controlled Mission Control permissions UI** — three routes where **widening a projection is a maker-checker reviewed event** (reusing the existing contribution correction-approval engine) and **narrowing is immediate** (fail-safe direction).

The governing principle throughout is **least privilege / need-to-know**: restriction is the default, access is granted up — the industry-standard layering (object-level = capabilities, field-level = `field_policies`, record-level = the subtract-only resolver), where, as Salesforce teaches, "sharing rules only grant, never restrict," so fail-closed is the correct primitive. Compliance anchors: **PCI DSS 4.0 SAQ-A** (store no cardholder data; hard-lock processor tokens off narrow surfaces), the **AFP Donor Bill of Rights** (anonymity, confidentiality, removal from shared lists), and least-privilege data handling.

---

## User Stories

**Organization / compliance**

1. As the organization, I want every field to default to invisible outside Mission Control unless explicitly classified, so a new or forgotten field can never silently leak to donors, missionaries, or the public.
2. As a compliance owner, I want payment-processor identifiers to be impossible to show or export on any donor/missionary/public surface, so we preserve our PCI SAQ-A posture and never expand cardholder-data scope.
3. As a compliance owner, I want a donor's elected anonymity honored on missionary and public surfaces while finance, receipts, and audit still retain the donor, so we meet the AFP Donor Bill of Rights without breaking accounting.
4. As a compliance owner, I want opt-out (`do_not_email` / `do_not_contact`) honored by every outbound channel from one shared consent truth, so a suppressed donor is never contacted regardless of which feature sends.
5. As the organization, I want sensitive edits, exports, and policy changes recorded with identifiers only (never rendered PII), so the audit log is a control, not a second copy of the data it protects.

**Donor** 6. As a donor, I want to see my own profile, gifts, recurring gifts, receipts, and preferences, so I can self-serve. 7. As a donor, I want to never see internal staff notes, donor scores, CRM internals, accounting codes, or another donor's data, so my view stays to what's mine and appropriate. 8. As a donor, I want to download my own receipt even if I've opted out of contact, because accessing my own record is not "being contacted."

**Missionary** 9. As a missionary, I want to see only my own supporters (relationship-scoped), so I never browse the whole donor base. 10. As a missionary, I want a split gift to show me only the designation line pointing at my fund, not the sibling designations to other workers. 11. As a missionary, I want anonymous donors masked in my view, so I respect a donor's elected anonymity while still seeing the support total. 12. As a missionary, I want to never see donor notes, scores, private addresses (beyond tenant-approved contact fields), payment details, or unrelated gifts.

**Finance / staff** 13. As finance staff, I want full visibility in Mission Control, so operational work isn't crippled — with a clear "hidden by policy" affordance anywhere a field is withheld, so segmentation and list-building don't silently break. 14. As finance staff, I want editing a sensitive field to require a reason captured with the change, so high-stakes edits are accountable. 15. As finance staff, I want bulk exports gated stricter than on-screen view and audited, so I can read a payment identifier on a detail screen but never dump ten thousand of them to a file.

**Mission Control admin** 16. As an admin, I want to inspect exactly which fields each surface receives (a projection inspector), so I can _prove_ the donor portal doesn't leak scores or notes. 17. As an admin, I want narrowing a projection (hiding/un-exporting a field, raising sensitivity) to take effect immediately, because it can only reduce exposure. 18. As an admin, I want widening a projection (exposing a field to a narrower/external surface) to require a second, distinct person's approval after a plain-English diff, so a projection can never be loosened by one click. 19. As an admin, I want capabilities, role grants, and the audit trail visible read-only, so I can understand the model without being able to silently change it.

**Engineer / future maintainer** 20. As an engineer, I want one projection chokepoint every surface calls, so I add a surface by registering it and classifying fields — never by rewriting the resolver. 21. As an engineer, I want soft-credit, tribute, DAF, matching-gift, and household to be reserved seams, so when they arrive they're "register + classify," not a resolver rewrite that risks a leak. 22. As a maintainer, I want the surprising choices captured as ADRs, so a future reader understands _why_ `field_policies` is field-only and _why_ widening is gated.

---

## Implementation Decisions

### Architecture rulings

- **A1 — Fail-closed default.** Any `(field, surface)` with no policy row, any unknown/dotted key, any unregistered surface ⇒ omitted outside Mission Control. Restriction is the default; access is granted up. Unclassified fields are treated as the strictest category (`internal`).
- **A2 — Single projection chokepoint.** Every narrow-surface read/write and every governed export flows through one resolver in `packages/api`. Surfaces stop hand-rolling `SELECT`s. Enforced by a lint that bans direct `.from('<sensitive-table>').select()` outside the resolver module (a callsite/import check — **not** column-string static analysis, which is deferred).
- **A3 — `field_policies` is a field-only static lookup, never a rules engine.** No conditions, no dotted-path evaluation, no per-value provenance. → **ADR-A**.
- **A4 — The resolver is the only home for conditional/row logic and it only subtracts.** Tenant boundary, Legal Entity scope, ownership, gift anonymity, relationship-scope, record-state, member-care author-only, and consent live here as composing predicates. `effective = field_policies ∩ tenant_boundary ∩ legal_entity_scope ∩ row_scope ∩ record_flags ∩ record_state`; the resolver never grants. Legal Entity is evaluated only for entity-bearing records, never inferred from Site, designation, processor account, or a mutable tenant default.
- **A5 — Capabilities are code source-of-truth; capability tables deferred (D12).** One exhaustive typed registry (`capability → meta`, `role/subrole → capability[]`), effective = union across active memberships, with a dormant `tenantOverrides` param so per-tenant grants are additive later. `/minimum` renders the code map read-only. → **ADR-B**.
- **A6 — Export is governed through one policy source; `exportable` is authoritative, serializers are consumers.** Any egress emits a field only if `exportable = true` and its category is allowed for the channel; `internal`/`care`/`security` never leave externally; payment identifiers are never bulk-exported. → **ADR-D**.
- **A7 — Audit is identifiers-only with a typed payload and a system-actor path.** Field **keys**, not values; a nullable actor for transactional/system events. This is an _enforced_ property of the logging helper, not an assumed database protection (see Data model note on `audit_logs`).
- **A8 — Widening is a maker-checker reviewed event; narrowing is immediate.** The fail-safe asymmetry, enforced systemically (server-side classification + distinct-human approval), not by UI copy. → **ADR-C**.
- **A9 — `surface` is an extensible text registry, not an enum.** New surfaces are data inserts; because of A1 they are born blind (see nothing until classified) and can't leak on day one.
- **A10 — PCI SAQ-A preserved.** Phase 3 stores no cardholder data (only Stripe token identifiers exist). Processor identifiers (`stripe_charge_id`, `stripe_customer_id`, `stripe_subscription_id`) are a **hard-locked per-field override**: `visible=false`/`exportable=false` on every surface except Mission Control + finance capability, never on donor/missionary/public/any-future surface, regardless of category defaults.

### Deep modules (built to be tested in isolation)

**Module 1 — `field_policies` lookup + seed** _(the phase's real data model)_

- Responsibility: the field-only static lookup + a thin typed reader returning the static ceiling for a `(surface, record_type)`. `field_key` is plain text (no FK); JSONB/array columns classified whole-column at their most-sensitive contained value; dotted keys reserved-inert (reader fail-closes).
- Interface:
  ```ts
  type Surface = string; // extensible text registry
  type SensitivityCategory =
    | "public"
    | "contact"
    | "internal"
    | "financial"
    | "care"
    | "security";
  interface FieldPolicyRow {
    recordType: string;
    fieldKey: string;
    surface: Surface;
    tenantId: string | null;
    visible: boolean;
    editable: boolean;
    exportable: boolean;
    sensitivityCategory: SensitivityCategory;
  }
  interface FieldPolicySet {
    get(fieldKey: string): FieldPolicyRow | undefined;
    readonly surface: Surface;
    readonly recordType: string;
  }
  function loadFieldPolicies(input: {
    surface: Surface;
    recordType: string;
    tenantId?: string | null;
  }): Promise<FieldPolicySet>;
  ```
- Prior art: `crm/projections/contracts.ts` (code-defined surface→field contracts to promote from shadow to enforced). _(Amended 2026-07-06: the shadow CRM→surface projection stack is retired by ADR-0001 and deleted by cleanup ticket #602 — capture `contracts.ts`'s surface→field lists into the Phase-3 field census before the deletion lands; the Phase-3 resolver itself is unaffected.)_ Also: `contribution_correction_requests` migration shape (partial-unique, RLS staff-only).

**Module 2 — Sensitivity taxonomy** _(6 categories + default bundles)_

- Responsibility: the six fixed, non-deletable categories and, for each, the default `{visible, editable, exportable}` per surface plus `auditRead` and `requiresReason` defaults (`care`+`security` audit-read on; `financial`/`care`/`security` require-reason on). Pure, data-only; anchors fail-closed and supplies the total order the classifier needs.
- Interface: `const CATEGORY_ORDER = ['public','contact','internal','financial','care','security'] as const;` + `SENSITIVITY_DEFAULTS: Record<SensitivityCategory, CategoryDefaults>` + `defaultPolicyFor(category, surface)`.
- Prior art: the layered capability-bundle constants in `contribution-operations/permissions.ts` (ordered bundles as data).

**Module 3 — Surface-generic projection resolver** _(the subtract-only core)_

- Responsibility: the single chokepoint. Given `(surface, recordType, row, auth, policies, scope?)`, return only policy-visible fields, then subtract via row-scope/record-flags/record-state. Never adds a field absent from `field_policies`. Every derived/projection output column must declare a category; absent ⇒ `internal`.
- Interface:
  ```ts
  interface RowScope {
    withinTenant(row): boolean;
    withinLegalEntity(row): boolean; // exact persisted legal_entity_id; not inferred
    ownsRow(row): boolean;
    isAnonymizedFor(row): boolean;
    recordState(row): "open" | "settled" | "locked";
    withinRelationship(row): boolean;
    withinHouseholdVisibility(row, viewerPartyId): boolean; // reserved-inert; P9 relationships + P7 policy
  }
  function resolveProjection<Row>(input: {
    surface;
    recordType;
    row: Row;
    auth;
    policies: FieldPolicySet;
    scope?: RowScope;
  }): Partial<Row>;
  function assertEditableForSurface(input: {
    surface;
    recordType;
    fieldKey;
    policies;
    auth;
  }): void; // throws 403
  ```
- Prior art: `contribution-operations/viewer-projection.ts` (`redactProviderOutcomeForViewer` — the exact subtract-only per-viewer redaction precedent). Promotes `DONOR_SELECT` and `DONOR_RELATIONSHIP_SELECT`.
- Financial readers and egress doors pass a row whose exact
  `legal_entity_id` is already source-authoritative. The resolver checks that
  entity against the current Phase 12 scope before any field projection,
  filter, aggregate, export, or template binding. A missing entity on a
  financial root is invalid data, not permission to use
  `tenants.default_legal_entity_id`.
- Reserved seam (like the `tenant_id` seam): `withinHouseholdVisibility(row, viewerPartyId)` is declared inert now. Phase 9 supplies the effective-dated Party/household relationship; Phase 7 classifies official-facts visibility; Phase 3 enforces the resulting projection. Intra-household visibility is **member-scoped**—a household co-member does **not** automatically inherit another member's private/anonymous contribution.

**Module 4 — Unified export-governance layer** _(one policy source, all channels)_

- Responsibility: shared `resolvePolicy()` (reads `exportable` + category) + `csvSafeCell()` (one OWASP/CWE-1236 helper — neutralize leading `=`/`+`/`-`/`@`/TAB/CR/LF, RFC 4180 quote, CRLF + UTF-8 BOM; **shared with the P0 patch, never re-implemented**) + one consent gate + one audit call. The admin CRM CSV serializer is **rewired to build columns from the resolved exportable projection** (its derived output columns classified at the projection under `crm_report.*`), not a hardcoded list. The consent gate evaluates canonical Party/contact-point consent and `email_suppressions`, fail-closed, for staff/system-initiated outbound communication. Also **enforce now:** bind Phase 17 variable resolution and Phase 18 document-field projection to the intended recipient surface so a donor/missionary output cannot resolve internal/other-party fields. Phase 14 registers acknowledgment/notification purpose and allowed-fact census rows; Phase 17 owns typed message-variable/content contracts; Phase 18 owns generated-document field/artifact enforcement; Phase 3 remains the fail-closed projection/consent-policy chokepoint.
- Interface:
  ```ts
  function csvSafeCell(value: unknown): string;
  function resolveConsent(input: {
    recipientPartyId;
    recipientContactPointId?;
    channel: "email" | "export" | "generated_document";
    initiator: "staff" | "system" | "self";
  }): Promise<{
    allowed: boolean;
    reason: "ok" | "do_not_email" | "do_not_contact" | "suppressed";
  }>; // self ⇒ always allowed
  function emitGovernedCsv<Row>(input: {
    surface;
    recordType;
    rows: Row[];
    auth;
    policies;
  }): Promise<{
    csv: string;
    fieldSet: string[];
    sensitivityCategories: SensitivityCategory[];
    rowCount: number;
  }>;
  ```
- Enforce-now: CSV, receipt (text), `sendEmail()`. Contract-only: Mailchimp and
  receipt-PDF generation. The historical “future `notification_queue` worker”
  idea is superseded by the dated Phase 17 amendment below and must not be built.
- Prior art: `crm/reports/export.ts` (already audited via `audit.log('crm_export_created')`); the three live-vulnerable serializers to converge.

**Module 5 — `field_policy_change_requests` + `widen()` classifier + Mission Control change-control** _(the largest work item)_

- Responsibility: change-control for editing `field_policies` from `/projections`. A pure `widen(before, after)` classifier over the category total-order and the **surface-exposure lattice** returns `narrow | neutral | widen`, **fail-closed to `widen` on any ambiguity**; a derived field's verdict inherits the max sensitivity/widest exposure of its inputs. Narrow/neutral publishes immediately (audited); widen writes a pending row (resolver keeps serving the old policy) and requires a distinct human to approve. Reuses the correction maker-checker with **hard-coded separation-of-duties** (never the per-tenant ownership-mode enum), a **mandatory NOT-NULL base fingerprint** re-checked at apply (optimistic `UPDATE … WHERE status='pending'` → 409), and a **confused-deputy allowlist** of editable `(record_type, field_key, surface)` tuples validated server-side. Baseline (`tenant_id NULL`) rows editable by **super-admin only**, via a dedicated guard (see Contracts).
- Interface:
  ```ts
  type WidenVerdict = "narrow" | "neutral" | "widen";
  function classifyChange(delta: {
    before: FieldPolicyRow | null;
    after: FieldPolicyRow;
    surface: Surface;
    derivedInputs?: SensitivityCategory[];
  }): WidenVerdict; // ambiguous ⇒ 'widen'
  function proposePolicyChange(input: {
    tenantId;
    auth;
    target;
    after;
    reason: string;
    baseFingerprint: string;
  }): Promise<
    | { applied: true; verdict: "narrow" | "neutral" }
    | { applied: false; verdict: "widen"; changeRequestId: string }
  >;
  function decidePolicyChange(input: {
    tenantId;
    changeRequestId;
    decision: "approve" | "reject";
    reason?;
    deciderProfileId;
    deciderCapabilities;
  }): Promise<{ status: "approved" | "rejected"; applied: boolean }>;
  ```
- Prior art: `contribution-operations/correction-requests.ts` (`decideContributionCorrectionRequest`, `recordDecision` 409 guard, 23505-idempotency) and `approval-policy.ts` (`assertCanDecideCorrectionRequest` — distinct-human SoD), **but v1 hard-codes separation-of-duties and does not read the tenant ownership-mode enum**.

### Data model

- **`public.field_policies`** — `record_type text`, `field_key text` (no FK), `surface text` (registry value), `tenant_id uuid NULL` (reserved-dormant — every seed row `NULL`), `visible bool`, `editable bool`, `exportable bool`, `sensitivity_category` enum (the six). Unique `(record_type, field_key, surface, tenant_id)` with `NULLS NOT DISTINCT` (or a partial-unique-index pair). Category supplies defaults; per-field rows override. JSONB/array whole-column rule; dotted keys reserved-inert. A per-field **hard-lock** flag (or seed convention) marks processor identifiers unwidenable (A10).
- **Field census (deliverable, not assumed).** Phase 3 produces an **authoritative column census** per `record_type` (`donors`, `donations`, `donor_pledges`, `missionaries`, `profiles`, `receipts`, and the member-care table family) generated from the _live_ schema and reviewed — each column's category + `{visible, editable, exportable}` per surface. This census **is** the `field_policies` seed. (The grill's D5 inventory was partial and mis-cited a few columns; the census supersedes it.) This census is the **Phase-3 baseline seed**: each reserved seam (`gift_credits`/soft credit, tribute, DAF/organization profiles, `org_contacts`, matching gift, household, `persons`, `household_members`, and the acknowledgment + notification document classes) arrives as a **new** `record_type` that MUST ship its own census rows + category classification **when built**, under the same fail-closed + golden-snapshot discipline — the building phase (Phase 7 — Receipt & Statement Compliance Rules + Donor Identity/Credit Model) owns that census. Register + classify, not a resolver rewrite.
- **Census taxonomy note — processor identifiers vs. org legal identity.** The census distinguishes **hard-locked processor identifiers** (Stripe ids, per A10 — never on any external surface, unwidenable) from **EIN / org legal identity** (financial-sensitive, but **deliberately visible** on the legal donor's own receipt). When the soft-credit/`gift_credits` record_type lands (Phase 7), it must be classified **non-receiptable** at the export/document layer (acknowledgment-only, deductibility-forbidden).
- **`public.field_policy_change_requests`** — structural copy of the correction-requests table keyed on `(record_type, field_key, surface)`, **no** donation FK: `tenant_id`, target columns, `proposed jsonb`, `before jsonb`, `base_fingerprint text NOT NULL`, `status` enum `{pending, approved, rejected, superseded}`, `requested_by_profile_id`, `decided_by_profile_id`, `decision_reason`, `idempotency_key`, timestamps; partial-unique `(tenant_id, idempotency_key)`.
- **Surface registry** — the initial rows: `mission_control`, `donor`, `missionary`, `public`, `export`. Extensible by insert. **Reserved document classes (Phase 7):** `acknowledgment` and `notification` are reserved as **distinct document classes** (registry entries, or new `record_type`s when built) so the merge-tag governance can forbid deductibility/amount fields by document class, not only recipient surface. Phase 7 owns the implementation.
- **`record_type` enumeration.** In scope now: `donors`, `donations`, `missionaries`, `receipts`, plus projection-scoped derived namespaces (`crm_report.*`). **`contribution_designation` is contract-only** — there is no per-line allocation table for _live_ donations today (designation lines exist as `donation_crm_links scope='designation'`; the only allocation table is `staged_gift_allocations` for offline staged gifts). Phase 3 defines the record_type and its resolver row-scope rule; live-donation multi-designation binding is a future consuming phase.
- **Gift-anonymity data (dependency).** The masking rule (below) reads an anonymity signal. **Today "anonymous" = `donor_id IS NULL` (guest gift)** — there is no donor-elected `is_anonymous` column on `donations`. Phase 3 masks the existing null-donor case now; a donor-**elected** "anonymous-to-missionary" flag is a named data dependency (sequence with the `add-guest-giving-and-gift-anonymity` change) that the resolver consumes when it lands. See the anonymity ruling in Contracts.
- **Capability tables: none.** Per D12, `permission_capabilities` / `role_capability_grants` are **not** created in Phase 3; the code registry is authoritative and shaped for 1:1 future seeding.
- **`audit_logs` note (correction).** `audit_logs` currently has **RLS disabled** and there is **no retention job**. Phase 3 does _not_ claim these as protections. "Identifiers-only" is enforced by the typed logging helper (verifiable). Tenant-scoped audit read (RLS) and a retention policy are **named tickets**, not current truth. The logging helper's `userId` is widened to `string | null` for the system-actor path.

### Contracts & wiring (thin, on the deep modules)

- **Read chokepoint** — `resolveProjection` is the required path for donor-portal (promote `DONOR_SELECT`), missionary-portal (promote `DONOR_RELATIONSHIP_SELECT`), and export. **Promotion-parity guard (must-fix):** seed policies so each promoted surface's post-resolver field set **equals its current hardcoded `SELECT`** (minus deliberately-narrowed fields, listed explicitly), asserted by a golden-snapshot test in CI **before** enforcement is enabled — the analog of Phase 2's lossless-backfill rule, so fail-closed promotion can't silently regress a live portal.
- **Write chokepoint (D6)** — `assertEditableForSurface` wraps the donor/missionary **mutation entrypoints** (portal profile/preference update handlers — enumerated in the ticket) so a write to a field not editable-for-that-surface is rejected (the tamper-symmetric twin of the read chokepoint). Sensitive-category edits capture a reason (reusable component); reason-capture is generic, blocking _approval_ stays domain-specific (corrections).
- **Export governance** — `resolvePolicy` + `csvSafeCell` + consent + audit across CSV/receipt/`sendEmail()` now; Mailchimp and receipt-PDF remain contracts (the Mailchimp contract includes the inbound `unsubscribed|cleaned → do_not_email` writer). The historical `notification_queue` carries no worker or transport contract: implementation must classify/migrate and retire it, or retain it only after proving the one bounded non-transport owner required below. The CRM CSV serializer's columns are driven by the resolved exportable projection.
- **Change-control flow** — reason → server-computed diff-preview (`widen()` + blast-radius rollup) → direction branch → approval-on-widening (distinct human at profile-id level) → base-fingerprint recheck → apply → audit → rollback-as-inverse-edit.
- **Baseline guard** — a dedicated `assertCanEditBaselinePolicy` (explicit super-admin check; **rejects `tenant_id NULL` writes routed through the tenant-scoped `requireCrmAccess` path**, which `??`-falls-back and would otherwise pass for any staff).
- **Meta-capabilities** — `permissions.view` / `permissions.propose_widening` / `permissions.approve_widening` on the **contribution capability resolver** (graduated so propose ≠ approve), not the flat staff-capability union.
- **Anti-drift CI** — extend `verify:data-boundary` with the callsite lint (A2); the client DataTable CSV export **throws on any governed/sensitive column**.
- **Surface-exposure lattice (ruling).** `mission_control` (least exposed) `<` `donor` ≈ `missionary` (peers, **incomparable**) `<` `public` (most exposed); `export` is governed by the separate stricter `exportable` flag. Moving a field between two incomparable surfaces (e.g. donor→missionary) is a **widen** (fail-closed). Any surface pair not comparable in the lattice ⇒ `widen`.
- **Anonymity (ruling).** Mask donor identity on `missionary` + `public`; **retain** for finance/admin/receipt/audit. The resolver masks only from an explicit, purpose-scoped gift-anonymity fact. Every accepted online guest gift resolves or creates its known Party/legal donor before the contribution is accepted; guest giving is never a null-donor shortcut. A null donor is valid only for the explicit `unknown_offline` source-intent case (for example, anonymous cash or an unmarked offering), which remains non-receiptable until source-owned identity evidence is later supplied. Grounded in the AFP Donor Bill of Rights (not the retracted `CONTEXT.md` citation — see Further Notes).

### ADRs to write

- **ADR-A — `field_policies` is a field-only static lookup; conditional/row visibility lives in a subtract-only resolver.** Rejected: per-value provenance / a runtime rules engine (unpredictable, hard to test/audit).
- **ADR-B — Capabilities are code source-of-truth; capability tables deferred with a future-additive shape.** Preserves compile-time safety; the only Phase-3 consumer is a read-only page.
- **ADR-C — Widening a projection is a maker-checker reviewed event (reusing the correction engine, hard-coded separation-of-duties); narrowing is immediate.** The fail-safe asymmetry + fail-closed `widen()` classifier. Notably, **no surveyed donor CRM ships in-product four-eyes for permission widening** — a deliberate best-practice exceedance.
- **ADR-D — Unified export-governance: one policy source, `exportable` authoritative over serializers, one shared `csvSafeCell`.**

---

## Testing Decisions

A good test here exercises **external behavior through each module's stable interface with adversarial inputs**; the two highest-value targets are projection leakage and export injection. Modules to test (all of Modules 1–5). Test scope:

- **`widen()` exhaustive matrix** _(the load-bearing safety unit)_ — every category-order transition, every `visible/editable/exportable` `F→T`/`T→F` on internal vs external surfaces, every `(category-change × surface-pair)` verdict, and every unknown/ambiguous input ⇒ asserts `widen`; a derived field inherits max-sensitivity of inputs. A single missed branch silently converts an approval-gated widening into an auto-publish leak.
- **Projection resolver, fail-closed + subtract-only** — no-policy field omitted; unregistered/new surface sees nothing; dotted/unknown key omitted; row-scope subtracts (wrong Tenant or Legal Entity is uniformly not found; non-owner loses contact fields; anonymity masks donor on missionary/public but not finance/receipt/audit; member-care author-only); resolver never adds a field absent from `field_policies`; promoted resolver reproduces today's `DONOR_SELECT` / `DONOR_RELATIONSHIP_SELECT` visible set exactly (no regression) while excluding unclassified columns. Poison fixtures prove that a correct row ID with a wrong or missing entity, a stale entity-scope token, and a mutable-default change cannot authorize access or cross-entity aggregation.
- **Per-surface golden snapshots** — freeze the exact field set each enforced surface emits for a canonical row; any diff must be an intentional, reviewed change (the cheap closer of the deliberate-widening leak path).
- **Export governance** — `csvSafeCell` neutralizes leading `=`/`+`/`-`/`@`/TAB/CR/LF then RFC-4180-quotes (fixtures for all three serializers incl. the donor-**name** label column and the Phase-2 `source_code` debt), emits CRLF + BOM; `emitGovernedCsv` emits only `exportable=true` fields and drops `internal`/`care`/`security` + payment identifiers; the rewired serializer's columns equal the `exportable` projection (proves the two sources can't disagree); audited `rowCount` == rows emitted; JSON export obeys the same field set (format-agnostic); merge-tag render can't inject other-party/internal fields.
- **Consent gate** — staff/system email/CSV to a `do_not_email`/`do_not_contact`/suppressed donor is blocked fail-closed; a donor's self-service access to their own receipt is not blocked.
- **Maker-checker** — narrow/neutral publishes immediately + audited; widen writes pending and the resolver keeps serving the old policy until approval; requester can't approve own request (survives multi-hat at profile-id level); base-fingerprint recheck rejects when the live row moved; concurrent decide → 409; confused-deputy allowlist rejects widening a financial/care/security field to an external surface; baseline row editable only by super-admin.
- **Capabilities** — effective = union across memberships; propose ≠ approve (four-eyes can't collapse); dormant `tenantOverrides` yields platform defaults unchanged.
- **Audit envelope** — sensitive edits/exports/consent-suppressed-sends/denied-sensitive-access and policy propose/approve/reject/publish/rollback write identifiers-only details; `care`+`security` reads audited, others not; the system-actor path writes a row with `user_id NULL`.
- **Boundary CI** — the callsite lint forbids raw sensitive-table `SELECT` outside the resolver; the client DataTable CSV export throws on governed columns.

---

## Out of Scope (named, seams reserved)

- Per-tenant custom permission grants + capability tables (D12 reserved shape); tenant-override `field_policies` rows (reserved-dormant `tenant_id`).
- **Nonprofit record types — soft credit, tribute/honoree, DAF (sponsor-vs-advisor), matching gift, household** — named as future record_types the resolver's row-scope must anticipate (each a distinct many-viewers-per-gift visibility surface); reserved like the `tenant_id` seam so adding them is register+classify, not a resolver rewrite. **Biggest parity gap vs NPSP/Raiser's Edge.**
- Live-donation multi-designation binding (Phase 3 defines the `contribution_designation` record_type + rule; binding to live gifts is a future phase).
- Dotted-path JSONB sub-field policies (inert seam); projection point-in-time versioning/replay. (This means `field_policies` **policy** versioning; it does **not** preclude a later phase — e.g. Phase 7 — adding immutable versioned **fact** record_types (receipt versions, statement inclusion snapshots) classified as ordinary new census rows.)
- Blanket read-auditing (only `care`+`security` on now); break-glass emergency bypass (documented manual audited DB path, never a weakened gate).
- DSAR / erasure (the field-classification + consent + audit foundation is precisely what a future data-subject-access/erasure capability will consume — seam reserved, not built; 20+ US state privacy laws active as of early 2026 are the rationale).
- Per-channel/per-topic consent preference center + SMS/mail/phone channels + "remove from shared/rented lists" flag (consent model reserved extensible; today's boolean `do_not_email`/`do_not_contact` is the floor).
- Aggregation/combination re-identification risk (per-field classification is the floor; export field-count/volume caps are a named fast-follow).
- Data-**minimization** enforcement (governing what is _collected_) — stated as a companion principle (AFP: "seek and record only relevant information"), enforcement future.
- The full permissions product: groups, nested inheritance, CRUD-matrix editor, security-tag system, impersonation, SAML mapping, page/menu-visibility builder, UI surface-minting, capability/category editing, bulk-widen, generalized blocking approval beyond widening (`requires_approval` reserved).

---

## Further Notes

**Compliance grounding.** The projection/consent/anonymity layer is anchored in the **AFP Donor Bill of Rights** (a donor's right to anonymity, confidentiality, and removal from shared mailing lists), **PCI DSS 4.0 SAQ-A** (store no cardholder data; the token-only posture keeps the platform out of PCI scope, so `field_policies` governs only processor identifiers), and **least-privilege / need-to-know** data handling. The **maker-checker-on-widening** control is a deliberate exceedance of surveyed donor CRMs (Salesforce NPC, Raiser's Edge NXT, Bloomerang all rely on admin discretion) — worth stating as a product differentiator.

**Segmentation escape-valve (usability).** Over-restrictive permission schemes are documented to be abandoned within a year because staff can't filter on fields they can't see (Bloomerang). Mission Control staff retain full view, and any policy-hidden field must show a clear "hidden by policy" affordance rather than silently vanishing — so fail-closed hiding doesn't cripple list-building.

**Fabricated-citation correction.** The gift-anonymity surface rule was earlier attributed to `CONTEXT.md:77` ("Finance/admins/audit always retain the donor"). That text **does not exist** in the repo-root `CONTEXT.md`, the contribution-detail `CONTEXT.md`, or `openspec/` on this branch — it was a fabricated citation and is retracted. Phase 3 **defines** the anonymity surface-scoping as new product intent, grounded in the AFP Donor Bill of Rights. Do not propagate the bad citation (it also appears in Phase 2's program memory).

**Term collision — "projection."** `projection` already means the shadowed CRM→surface sync in `crm/projections/contracts.ts` and `openspec/specs/crm-core`. Phase 3's new concept is named **"role-scoped field projection"** (or "surface projection") and the disambiguation is stated in the glossary; the two meanings must not be conflated (the shadow contracts are the thing Phase 3 _promotes_ from monitoring to enforcement). _(Amended 2026-07-06: the shadow CRM→surface projection stack is retired by ADR-0001 and deleted by cleanup ticket #602, so the other sense is retired, not merely different — capture `contracts.ts`'s surface→field lists into the Phase-3 field census before the deletion lands. The surviving canonical sense in this program is Phase 3's **role-scoped field projection**; the Phase-3 resolver survives the retirement.)_

**Live P0s (fast-tracked, compose with Phase 3).** Three live issues were spun off as standalone security patches: CSV formula-injection across three serializers (adds the shared `csvSafeCell` + CRLF/BOM + the Phase-2 `source_code` debt) and the `sendEmail()` consent-bypass. Phase 3's export-governance **consumes the same `csvSafeCell`** the patch introduces — it must be one shared helper, never re-implemented (a lint forbids a second CSV-escaping implementation).

**Glossary & OpenSpec.** Add to repo-root `CONTEXT.md`: **permission**, **capability**, **role-scoped field projection** (disambiguated), **field policy**, **sensitivity category**, **surface**, **donor-safe / missionary-safe / public-safe**, **fail-closed default**, and **Legal Entity scope** (a subtract-only scope inside Tenant). Phase 3 lands as spec deltas + tasks in the existing `openspec/changes/sitestacker-parity/` change and adds a Phase 3 row to `parity-matrix.md`.

---

## Evidence & Acceptance

Evidence file under `docs/ops/phase-evidence/` (following the program's phase-evidence pattern), recording commands + results, the five module suites, and the honest "what Phase 3 did **not** build" list.

**Headline acceptance run:**

1. A **fail-closed** unclassified field is invisible on donor/missionary/export and visible in Mission Control.
2. The donor portal and missionary workspace, promoted to the resolver, show **exactly** their pre-promotion field sets (parity golden snapshot) — no regression — while now excluding any unclassified column.
3. A missionary sees **only their own supporters**, and for a 3-way split gift sees only their own designation line (finance sees all three).
4. An **anonymous** donor is masked on missionary/public and retained for finance/receipt/audit.
5. A field flipped `exportable=false` **disappears from the CSV** (serializer driven by policy), and a donor named `=HYPERLINK(...)` is neutralized on export.
6. A staff/system email to a `do_not_email` donor is **blocked and audited**; the donor's own receipt download is not.
7. **Widening** a projection routes through maker-checker and **blocks self-approval**; **narrowing** auto-publishes; both are audited identifiers-only.
8. A finance user scoped to Legal Entity A cannot read, aggregate, export, send,
   or mutate an Entity B financial record in the same Tenant. Single-entity
   users see no selector, but the persisted entity and authorization check are
   still exact.

---

## Tracking Issues (epic #489 + children; created via `/to-issues`)

Ticket shape (filed via `/to-issues`):

1. `field_policies` table + column census/seed + fail-closed default.
2. Surface-generic resolver + promote both portal `SELECT`s + **promotion-parity golden snapshot** + extend `verify:data-boundary` chokepoint lint + client-DataTable-export gate.
3. Code-only capabilities registry + 3 meta-caps + `/minimum` read view.
4. Unified export-governance + rewire CRM CSV serializer to policy + consent gate on `sendEmail()` + receipt + merge-tag surface gate (consumes the P0 `csvSafeCell`).
5. Narrow-surface write chokepoint + enumerated mutation entrypoints + reason-capture component (D6).
6. `field_policy_change_requests` + `widen()` classifier + surface-exposure lattice + `/projections` change-control UI + baseline guard.
7. `/audit` read-only viewer + `logPolicyChange` + typed identifiers-only audit payload + system-actor path.
8. Split-gift `contribution_designation` record_type + per-line row-scope (contract-only binding).
9. Gift-anonymity masking rule + explicit `unknown_offline` null-intent case + reserved donor-elected-flag contract; accepted online guest gifts always have a known Party/legal donor.
10. The four ADRs.
11. Glossary (`CONTEXT.md`) + OpenSpec spec-delta/tasks + `parity-matrix.md` row.
12. Phase 3 evidence file.

## Dated Phase 17 consent and projection amendment (2026-07-19)

**Old statement.** Phase 3 governs email consent through `do_not_email`,
`do_not_contact`, and `email_suppressions`, and binds merge-field resolution to
the recipient surface/document class. It does not define SMS evidence or the
Phase 17 authoring and support-detail capabilities.

**New winner.** Phase 17 consumes the same fail-closed projection boundary for
typed message facts, fake-data-only preview/review, publication, catalog
administration, and Recent sent copy access. Those staff operations are governed
by capability and projection checks; they do not target a recipient and MUST NOT
apply recipient consent or contactability gates. Recipient consent and
contactability govern delivery resolution and send-time gates only. D9 adds
channel-scoped SMS consent provenance and registration evidence while SMS
transport stays structurally unavailable. Phase 12 supplies explicit
capabilities for catalog administration, drafting, standard/protected
publication, branding/layout, delivery settings, reply destinations,
portability, repair, and privileged Recent sent copy reveal.

**Compatibility boundary.** `do_not_contact` remains the absolute contact floor
and `email_suppressions` remains the email suppression authority. Phase 17 does
not create an SMS send, template, binding, preview, test, fallback, phone-number
campaign, or second consent system. Templates never receive an unconstrained
record bag; producer-owned facts are tenant-, role-, surface-, purpose-, and
document-class projected and escaped by default.

The earlier “future `notification_queue` worker” wording is historical and is
expressly superseded. The Phase 17 census found staff-scoped RLS/authenticated
grants but no production worker. Phase 6/17 and later workflow delivery use the
governed intent/outbox and Delivery Plan seams; they never revive this table.
Implementation must classify and migrate any still-needed data and retire the
table, or prove one bounded non-transport owner before retaining it.

Resend bounce/complaint/suppressed observations remain separate provider
transport evidence bound to the tenant connection/region and exact contact
revision; they are not a second consent store, a Sender Profile switch, or a
complete copy of Resend's regional list. The Phase 3 gate consumes known
blocking provider evidence alongside current product consent/contact authority
without claiming that a send-only key proves provider-list absence. Provider
remediation may supersede that evidence only through the owning Phase 3/contact
policy and never silently restores product consent.

## Dated Phase 21 D8 external-feed projection amendment (2026-07-30)

The Missionary Support Feed is an external egress surface and therefore remains
behind the same fail-closed `resolveProjection` boundary as every first-party
missionary view and governed export. The current Tenant, Legal Entity,
destination, Missionary Support Feed Recipient, Missionary Support Feed Subject,
purpose, Designation or Field Account scope, authorized resource/field
families, history horizon, currencies, schema version, adapter certification,
and authorization epoch are required inputs. A provider grant, cursor, cached
page, prior successful read, tenant role, or arbitrary field mapping never
widens that decision.

Authorization, anonymity, restricted-worker protection, split-line scope, and
the consumer-specific field floor apply before enumeration, search, counts,
arithmetic, aggregation, pagination, cursor sequencing, caching, hint creation,
logging, metrics, or diagnostics. Omitted rows leave no count, subtotal,
pagination, cursor, watermark, or error-shape shadow. External identifiers are
minted only after projection and are unlinkable outside the exact authorized
destination-recipient-participant namespace; an anonymous support occurrence
may retain a scoped occurrence identity for correction and deduplication but
never a stable hidden Party identity.

Phase 31 may compose and transport only the rows that survive those source
projections. It cannot query raw tables, replace a named source read model,
expose sibling designation lines, make an all-history export the default, or
let a provider serializer weaken the Phase 3 floor. Scope contraction fails
closed immediately and invalidates prior feed cursors before any queued
egress.

## Dated Phase 21 D13 expense-governance projection amendment (2026-07-30)

Phase 21 D13 registers each of these as a distinct record type in the Phase 3
record/projection/egress census when built:

- Expense Program Activation Version;
- Expense Policy Cohort;
- Expense Policy Cohort Membership Version;
- Expense Governance Profile Version;
- Expense Governance Assignment;
- Expense Governance Resolution;
- Expense Approval Route Version;
- Approval Assignment Snapshot;
- Expense Review Action; and
- the Expense Policy Decision fields that carry an authorized Reviewer
  Exception.

Every record type ships complete field-census rows, sensitivity
classifications, row-scope predicates, and surface/export decisions before any
reader, count, search, queue, cache, notification, artifact, audit projection,
or integration can expose it. Missing classification is the strictest
`internal`/non-exportable posture. Tenant, Legal Entity, claimant/relationship,
Expense Policy Cohort and Membership Version, jurisdiction, expense purpose,
exact Expense Claim Version item-or-split coverage, incurred-date governance,
submission-time route, current capability, conflict-of-interest, and
evidence-purpose floors are applied before enumeration.

A composite expense screen, report, queue, bulk action, or audit view receives
only the intersection of the independently authorized constituent
projections—the strictest surviving projection wins. Report membership,
Profile or Route visibility, Approval Assignment Snapshot membership, task
assignment, reviewer eligibility, AI output, or possession of an opaque
identifier never widens another record type. Missionary surfaces receive only
the bounded claimant-safe policy explanation and status fields explicitly
classified for them; private Receipt Evidence, reviewer identity, internal
routing, exception authority, audit evidence, and unrelated claim coverage
remain absent unless a narrower purpose-specific projection explicitly
authorizes them.

## Dated Phase 21 D14 organization-card evidence projection amendment (2026-07-31)

Phase 21 D14 registers Organization Card Source, Organization Card Import
Profile Version, Organization Card Activity Import Manifest, Organization Card
Transaction Evidence Version and revision, Organization Card Assignment
Version, Organization Card Evidence Coverage, possible-overlap decision, and
Organization Card Source Adjustment Evidence as separate record types in the
Phase 3 census.
Organization Card Activity File Assets remain private evidence resources with
separately classified metadata and purpose-bound retrieval; their bytes never
enter a general role-scoped record projection.

Tenant, Legal Entity, Organization Card Source, billing currency, safe card
identity, effective Organization Card Assignment Version, claimant, exact
occurrence coverage, evidence purpose, and current capability are applied before
file, row, count, search, preview, queue, task, cache, artifact, audit, or
diagnostic enumeration. An import manifest, profile, assignment, similarity
suggestion, claim relationship, or opaque identifier never widens another
record type.

The missionary projection may expose only an assigned **source-final imported
purchase** under the pinned import-profile finality contract and the claimant-
safe facts required for D10/D13 completion. Imported evidence is not a claim,
Field Account effect, payment, Accounting Release, or reconciliation. The
projection excludes other cards and
participants, raw files, import profiles, control totals, unresolved overlap
candidates, issuer/account identifiers beyond the approved safe label, full
PAN, internal assignment history, personal-card data, and finance-only
exceptions. A revoked or corrected assignment contains positive disclosure
immediately without deleting immutable source evidence or revealing a
replacement participant.

## Dated Phase 21 D15 reimbursement-handoff projection amendment (2026-07-31)

Phase 21 D15 registers Reimbursement Handoff Package metadata, Reimbursement
Delivery Profile Version, Reimbursement Execution Claim, Reimbursement Handoff
Coverage, Handoff Attestation, Reimbursement Handoff Operation, operation
readback/drift evidence, External Payment Occurrence evidence strength, and
Reimbursement Payment Coverage as separate record types in the Phase 3 census.
Package bytes remain private evidence resources with purpose-bound,
short-lived, current-authorized retrieval; they never enter a general
role-scoped record projection.

Tenant, Legal Entity, source-owned claimant relationship, authoritative payee,
reimbursement family, ISO currency, external execution owner, provider
organization/product/country/environment, participant, cadence/cycle,
certified operation, exact Reimbursement Obligation and handoff/payment
coverage, evidence purpose and strength, and current capability are applied
before package, profile, claim, row, count, search, preview, queue, task,
artifact, cache, audit, readback, or diagnostic enumeration. A package digest,
download, Handoff Attestation, provider identifier, task assignment, accounting
role, or opaque ID never widens another record type.

The claimant-safe projection may expose only the exact authorized amount and
currency, calm current stage, evidence-qualified expected external-cycle date,
and bounded next-step explanation for that claimant. It excludes package
bytes, other payees or claims, profile dimensions, provider request/response or
error payloads, internal participant IDs, route and accounting ownership,
credentials, evidence attachments, and unrelated finance exceptions.
**Payment recorded by finance** remains distinct from stronger
**Payment confirmed** evidence. Handoff, draft acceptance, payroll status,
payslip, Accounting Release, QBO/Xero readback, or bank reconciliation never
widens the projection to a paid state.

`outcome_unknown` immediately removes any action that could create a second
execution lane while retaining the claimant-safe **Finance is processing it**
or **Needs attention** state authorized for that person. Scope contraction,
claimant-relationship succession, provider quarantine, or evidence revocation
fails closed before enumeration without deleting immutable history or exposing
a replacement claimant.

## Dated Phase 21 D16 advance and claimant-repayment projection amendment (2026-07-31)

Phase 21 D16 registers Expense Advance Policy Version, Claimant Repayment Policy
Version, Expense Advance Authorization Version, Expense Advance Issuance
Occurrence, Advance Evidence Observation, Advance Application Readiness,
Expense Settlement Determination, Expense Advance Application, Advance Residual
Position, Repayment Subject Determination, Claimant Repayment Decision, Claimant
Repayment Requirement, Claimant Repayment Occurrence, Repayment Evidence
Observation, Claimant Repayment Coverage, and Repayment Restitution Review as
separate record or governed-predicate types in the Phase 3 census. Any
`expense_advance` Field Account Funding Coverage and qualified Field Account
Effect retain their existing, separately scoped Field Account projections.

Every reader applies Tenant, Legal Entity, authoritative claimant and
relationship version, jurisdiction, purpose/source family, ISO currency,
policy/authorization/evidence version, responsible Party, conflict/dispute
route, exact approved-expense or repayment coverage, external execution owner,
evidence purpose and strength, current capability, and Phase 3/10 floor before
enumerating a row, count, total, search result, task, queue, notification,
artifact, cache, audit, export, integration, or diagnostic. A card assignment,
personal/nonbusiness classification, worker page, portal role, task assignment,
Requirement, accounting record, provider identifier, or opaque ID never widens
another record type or proves the repayment subject.

The claimant-safe projection is quiet when no current action exists. When
authorized, it may expose only the claimant's exact amount and ISO currency,
calm source-proved stage, policy date or return instructions, and bounded
actions to share evidence or ask finance to review. It excludes other
claimants, private source evidence, account/card/bank identifiers, policy and
authority internals, conflict or specialist detail, reviewer identity, Field
Account capacity, accounting treatment, and unrelated exceptions. **Return
recorded by finance** remains distinct from **Return confirmed**; authorization,
issuance, Advance Application Readiness, a Requirement, task completion,
provider or payroll state, Accounting Release, QBO/Xero readback, and bank
reconciliation cannot widen the projection to returned money, debt, available
funds, or a paid/reconciled state.

Cross-currency application is projected only from the immutable approved source
and settlement amounts plus exact externally owned conversion authority, rate,
rounding, and residual. It never yields a mutable converted total or Phase 21 FX
claim. Scope contraction, source-version correction, repayment-subject
succession, evidence conflict, or quarantine fails closed before enumeration
and retains only the minimum claimant-safe follow-up state without deleting
immutable history or revealing another Party.

## Dated Phase 21 D17 opening-position projection amendment (2026-07-31)

Phase 21 D17 registers Opening Source Package metadata, Opening Position
Activation Cohort, Opening Coverage Disposition, Opening Coverage Manifest,
Field Account Opening Position, Field Account Operational Cutover, Opening
Position Correction, staging-generation status, source/mapping exceptions, and
post-activation overlap/gap cases as separate record or governed-predicate types
in the Phase 3 census. Phase 29 private byte objects and Phase 30 import-session
mechanics retain separate projections and never imply Phase 21 activation.

Every reader filters before enumeration by Tenant, Legal Entity, ISO currency,
complete activation cohort, Field Account/purpose, predecessor source family and
environment, source boundary/cursor, source and staging generation,
mapping/parser/adapter version, exact evidence purpose and classification,
current capability, D9 publication posture for missionary surfaces, and the
Phase 3/10 floor. This rule applies before any row, count, control total,
difference, success/failure count, search result, exception, preview, cache,
log, trace, export, audit, or diagnostic. A partial authorized subset cannot be
shown or counted as a complete cohort and cannot be activated.

Ordinary finance projections use approved aliases or stable opaque source
identities for restricted workers when exact mapping can be proved without
exposing legal identity. Security clearance to inspect restricted identity and
finance authority to reconcile or activate remain separate; neither implies
the other. The final activation projection is fail-closed and requires a fresh,
complete authorization and generation check rather than reusing the preview's
decision.

Missionary projections remain absent unless D9 independently authorizes the
exact balance/reference module. When authorized, they expose only the exact
ISO-labelled Finance-confirmed balance and through date plus separately
permitted privacy-filtered reference history. They never expose source files,
mapping or exclusion details, control totals, other accounts, finance actors,
restricted identity, activation internals, or a claim of availability. One
post-cutover current-state projection transition is allowed; imported
historical event replay is not.

## Dated Phase 21 D19 Support Assignment projection amendment (2026-08-01)

Phase 3 registers the Phase 21 Support Assignment, Support Assignment
Participant Membership, safe invitation/access explanation, and independently
published Support Workspace modules as distinct record types and field
families. A Support
Assignment Participant Membership is relationship truth only and cannot widen
a projection. Raw Field Account, participant, access/grant, responsibility,
notification-preference, receipt, payroll/payee, and donor-identity tables are
never browser projections.

Every roster, activity, balance, statement, expense, coaching, project/team,
search, count, aggregate, cache, export, and Realtime-triggered refetch applies
the current Phase 10/12 floor and exact Tenant, Legal Entity, Support
Assignment, purpose, projection, and field policy before enumeration or
arithmetic. Denied and missing assignments remain indistinguishable. A safe
alias or published module does not authorize the principal or reveal a hidden
participant, restricted assignment, or unauthorized sibling currency.

## Dated Phase 21 D22 prospective-expense-authorization projection amendment (2026-08-01)

Phase 3 registers the D22 posture, request versions, private plan-evidence
metadata, Governance Resolutions, operation-scoped Approval Assignment
Snapshots, Review Actions, Authorization Decisions, compatible capacity
reservations, later-claim Authorization Coverage, unused-scope declarations,
residuals, successors, and corrections as separate projection families. D22 is
structurally absent when disabled: no row, count, navigation, search result,
queue, report, reminder, notification, setup state, API resource, cache entry,
or Realtime-triggered refetch may reveal it.

Every enabled projection filters before enumeration by exact principal, Active
Tenant Assignment, Tenant, Legal Entity, claimant Party, submitter/preparer,
source-owned relationship version, purpose, certified expense family, ISO
currency, planned half-open interval, request and source/policy version, route
step, evidence purpose/classification, current capability, and the Phase 10/12
floor. Disabled, denied, missing, revoked, stale, and out-of-scope remain
uniformly absent.

A claimant-facing projection may expose only the authorized plan, calm current
stage, exact approved terms, owner role, target review date labelled as a
target, one next action, and privacy-filtered history. It never exposes
reviewer identity or private notes, unrelated requests, evidence not separately
authorized, internal balance/capacity arithmetic, or a claim that planning or
approval means incurred, reimbursable, available, payable, paid, posted, or
reconciled.

## Dated Phase 21 D23 expense-effect projection amendment (2026-08-01)

Phase 3 registers the Expense Field Account Effect Recognition Profile,
Expense Field Account Effect Basis, Expense Field Account Effect, Expense
Field Account Effect Coverage, Field Account Funding Coverage Disposition, and
cause-owned exception/correction as separate projection families. Every
projection filters before enumeration by exact principal, Active Tenant
Assignment, Tenant, Legal Entity, Support Assignment, purpose, Field Account,
ISO currency, certified source family, current participant membership where
required, capability, evidence purpose/classification, and the Phase 3/10/12
floor. This applies to rows, counts, totals, search, export, cache,
notifications, Realtime-triggered refetch, audit, support tooling, and
diagnostics.

An authorized missionary-facing activity projection may expose only the signed
ISO-currency amount, one source-safe plain-language label, and the exact through
date. It never implies availability, reimbursement, payment, accounting, or
reconciliation. D9 decides whether the activity/balance module exists, D12
alone publishes immutable statement artifacts, D19 membership proves only a
participant relationship, and Phase 12 current capability is additionally
required. Hidden means absent before enumeration from detail, count, search,
export, cache, notification, and error wording. Winning-profile internals, receipt/merchant/location detail,
claimant or payee identity, payment/provider/bank evidence, tax treatment,
accounting dates, and QBO/Xero state require their own narrower authority and
remain absent from unauthorized counts, search results, exports, caches, and
notifications. Staff projections keep source qualification, support-balance
effect, reimbursement/payment, and accounting truth in independently labelled
sections rather than one completion status.

## Dated Phase 21 D24 expense-collaboration projection amendment (2026-08-02)

Phase 3 registers the Expense Collaboration Assignment Version, authority-free
invitation state, Claim Version confirmation or admitted external attestation,
Evidence Access Projection Version, helper action provenance, and
conflict/recovery evidence as distinct projection families. An Assignment
defines a maximum collaboration ceiling and explains historical involvement;
it never grants access. Every projection still requires the current Phase 12
decision and strictest Phase 10 floor before enumeration.

Rows, counts, totals, search, queues, caches, exports, Realtime-triggered
refetches, notifications, support tools, and audit views filter by the exact
principal, Active Tenant Assignment, Tenant, Legal Entity, claimant Party,
helper Party, Expense Program, purpose/claim family, Claim Version, operation,
current Assignment Version and interval, evidence projection and purpose,
classification, capability, and governance epoch. Pending invitations, stale
or revoked Assignments, superseded Claim Versions, absent claimant proof, and
denied or missing resources remain uniformly absent before pagination or
aggregation.

The ordinary helper projection shows only who is being helped, one stable
Expense Claim per Assignment, permitted preparation state, one safe next
action, and the helper's own attributed work. A batch view is only a list of
independently authorized exact-claim Assignments. Receipt bytes, sensitive receipt fields, private
notes, unrelated balances or claims, reviewer internals, and claimant-only
assertions require their own exact projection and never leak through labels,
counts, errors, or cache keys. Claimant, preparer, submitter, confirmer,
reviewer, approver, beneficiary/payee, economic payer, and actual actor principal remain separate
fields rather than one ambiguous `owner` or `actor` projection.

## Dated Phase 21 D25 expense-resolution projection amendment (2026-08-02)

Phase 3 registers D25 Expense Claim Resolution Case bases, immutable
Occurrences, Downstream Impact Manifests, and disposable current-action
Projections as separate purpose-scoped families. Before counts, pagination,
search, queues, caches, exports, Realtime signals, notifications, jobs, support,
or audit, every family filters exact Tenant, Legal Entity, claimant, claim and
triggering version, item/split, purpose, ISO currency, cause contract, evidence
classification, current capability, and governance version. A denied or absent
case is uniformly absent.

The ordinary projection exposes only the current actor's minimum safe context,
one literal action or wait reason, and source-attributed history. **Needs your
update**, **With finance**, **Waiting on source**, **Correction in progress**,
and **Complete** are derived coordination copy. They grant no authority and
prove no claim, approval, obligation, payment, Field Account, statement,
accounting, provider, or reconciliation outcome.

## Dated Phase 21 D26 records-policy and export-projection amendment (2026-08-02)

Phase 3 registers Phase 21 Records Schedule Contract and Binding Versions,
per-record Retention Resolutions, Successor Impact Manifests, export requests,
Records Export Coverage Manifests, package/part metadata, external-copy
assertions, verified-transfer evidence, and copy-specific disposition outcomes
as distinct purpose-scoped projection families. A current-view export, readable
record copy, complete records archive, final offboarding archive, tenant
external-copy assertion, and verified destination transfer remain separately
labelled resources; none is projected as another.

Every count, scope preview, exception, package family, manifest disposition,
part, original, human-readable projection, owner-domain reference, policy
history item, download, print view, external-copy assertion, destination
transfer, audit record, job status, support view, cache, and diagnostic filters
before enumeration by the exact principal and actual principal, Active Tenant
Assignment, Tenant, Legal Entity, record family and purpose, subject/account
scope where applicable, source and half-open/version watermark, contract and
binding versions, strictest Phase 10 classification, restricted-person lane,
current Phase 12 capability and authorization epoch, package purpose, and
requested operation. Denied, missing, stale, expired, quarantined, and separate-
lane coverage cannot leak through counts, filenames, part lists, progress,
errors, or timing.

Canonical JSONL preserves typed values and relationships; bounded CSV views use
the shared spreadsheet-safe serializer and are never the lossless authority;
accessible PDF/HTML and print are human views; exact originals retain their
representation and provenance. The package compiler consumes only allow-listed
owner projections and never performs a generic table dump. An owner-domain
reference cannot be expanded through Phase 21 authority. Package staging and
delivery remain Phase 29 execution behind this governed projection contract.

## Dated Phase 22 D13 public-discovery projection amendment (2026-08-06)

Phase 3 registers D13 Discovery Profile Versions, immutable Public Ministry
Directory Projection generations and current heads, complete membership
coverage, bounded public card/query results, and private cause-owned diagnostics
as distinct projection families. The subtract-only Phase 3 field floor and
current Phase 10 public ceiling apply before membership, indexing, search,
filters, counts, ordering, pagination, cursor issuance, cache fill, logs,
metrics, or diagnostics. Denied and absent pages leave no result, count, facet,
cursor, timing, error-shape, or Realtime shadow.

Anonymous visitors may receive only the narrow D13 server result for the trusted
Site and exact locale. They never query raw CMS, Party, `public.locations`,
profile/projection, or operational tables and never subscribe to raw database
Realtime. Client-supplied Tenant, Site, locale, Page Family, public ID, query,
filter, cursor, or cache state cannot establish scope or widen the server-owned
family constraint. Staff diagnostics separately require current Phase 12
purpose authorization and expose only the minimum source-owned exclusion cause.

## Dated Phase 22 D14 search-and-sharing projection amendment (2026-08-06)

Phase 3 registers the D14 Public Search & Sharing Presentation Manifest, Search
Presentation result, Share Presentation result, stable public Ministry Update
permalink presentation/posture, compiler generation, complete coverage proof,
local readiness evidence, external-effect intent, and external-outcome
observation as distinct record and projection families. D8 Public Page Route
Effect Manifests remain a separate route-consequence family that may reference
D14 artifacts; neither family is a release head.

Anonymous callers receive only the code-compiled exact public HTML/head,
crawler, sitemap, card, asset, and share outputs admitted for the current D2
reach and Phase 10 ceiling. They never enumerate or query raw manifest,
projection, CMS, CRM, Storage, provider-operation, profile, diagnostic, or
observation tables and never subscribe to raw Realtime. Every positive result
and cache identity structurally includes Tenant, Legal Entity, environment,
Site, verified host, locale, content identity, presentation/feed, release,
reach, route/effect, media, audience/placement, safety/containment, compiler,
renderer, and complete coverage generations.

Phase 3's subtract-only field floor and Phase 10 egress filtering apply
independently before visible body, head metadata, canonical/alternate links,
JSON-LD, sitemap/IndexNow fields, card media/alt, share payloads, logs, metrics,
errors, and accessibility output. Negative tests must prove wrong-scope denial,
no raw-table/Realtime path, full reach/placement matrices, no cross-Site or
unsafe-locale fallback, no stale-generation resurrection, and affected-positive-
first removal with append-only recovery.

## Dated Phase 22 D15 measurement-projection amendment (2026-08-06)

Phase 3 registers the D15 Measurement Profile Version, private transient
Measurement Occurrence and idempotency evidence, sealed daily Activity
Aggregate and correction, coverage fact, and Public Page Activity Projection as
separate record families. The subtract-only field floor applies before intake,
aggregation, suppression, report composition, export, logs, metrics, errors,
and diagnostics. No browser, raw-table, Realtime, JWT-metadata, inferred-
relationship, or service-role path grants access; current Phase 12 staff or
exact D1 page-assignment authority is re-proved by the server and defended by
structurally complete RLS for every read and export.

## Dated Phase 22 D16 writing-assistance projection amendment (2026-08-06)

Phase 3 registers D16's Public Page Writing Source Package, private short-lived
Suggestion Version, body-free Invocation/Application evidence, and ordinary D1
successor revision as distinct record families. The AI provider receives no
general contributor, staff, public, CMS, Party, supporter, financial, or Page
projection. One purpose-specific server projection subtracts to the exact D3
narrative target, deliberately supplied answers, and individually selected
Phase-10-admitted facts named in the Phase 21 D10 Egress Manifest for the exact
`public-profile drafting` binding.

Suggestions and translation warnings are private authoring facts and never
enter anonymous public, directory, search/share, measurement, supporter, or
financial projections. Every invoke, result read, and apply re-proves current
Phase 12 and exact D1/staff target authority; service roles, raw table access,
Realtime, browser locale, provider detection, cached source, or a prior
suggestion grant nothing. **Translate to English** adds exact source and target
locale/direction dimensions but creates no Phase 24 locale or translation-
status projection.

## Dated Phase 22 D17 typed Page-subject projection amendment (2026-08-06)

Phase 3 registers Page Subject Binding lineage and each D2 release-pinned
privacy-safe subject snapshot as distinct Phase 22 projections. The owner-domain
source remains outside the Page projection: the CRM operational layer owns
Ministry Projects, and Phase 13 owns Giving Campaigns and Designations. D17 may
project only the exact source identity/version, lifecycle evidence, safe display
material admitted by Phase 10, binding version, and complete Tenant, Legal
Entity, environment, Site, Page Family, Page, actor, reason, and time scope
required by the exact consumer.

Anonymous users, browsers, Payload, Realtime, cached public identifiers, and
service-role defaults never query raw Ministry Project, Campaign, Designation,
or binding rows. Public serving consumes only the immutable release-pinned safe
snapshot. Contributor, displayed-person, project/team, Campaign-owner, fund-
manager, relationship, or subject status grants no projection; every staff read
and mutation re-proves the exact Phase 12 capability and same-scope structural
relationships.

## Dated Phase 22 D18 current-serving and convergence projection amendment (2026-08-06)

Phase 3 registers D18's **current-serving evaluation** as a small, disposable,
exact-scope evaluation of independently authoritative D2 reach, Phase 10 safety
and containment, and D8 route heads. It returns only **serve current release**,
**privacy-safe absence**, **same-page redirect**, or **temporarily unavailable**.
It is not a new persisted reach, safety, route, release, publication, or
authorization fact. Any materialized accelerator carries the exact owner
generations and cannot yield **serve current release** when an owner generation
is missing, mismatched, stale, contradictory, or uncertain; an owner-labelled
adverse fact advances local denial before asynchronous cache or provider
convergence begins.

Phase 3 also registers each append-only **Public Ministry Surface Convergence
Operation** and its rebuildable, privacy-minimized current projection. The
operation references one code-owned applicable-surface coverage plan and the
existing D8, D9, D13, and D14 effect records; it never recreates or advances
their heads. Requested, provider-accepted, controlled-response-observed,
not-verifiable, and external-observation evidence remain separate. Anonymous
traffic may consume only the minimum current-serving result and admitted
release-bound presentation. It receives no operation, residual, provider,
internal identifier, safety reason, or diagnostic row, and D15 measurement is
structurally absent from render, cache, crawler, social, probe, and repair work.

## Dated Phase 22 D19 Ministry Assignment projection amendment (2026-08-06)

Phase 3 registers CRM Ministry Assignment identity/lifecycle, Ministry
Assignment Participant Membership, D1 Missionary Page Subject Binding and
public-safe snapshot, optional Ministry Assignment Support Binding Version,
and each Phase 21 support projection as distinct families. It does not collapse
them into one missionary profile, relationship graph, account view, broad
tenant role, or cached assignment object.

Anonymous presentation receives only the exact current Phase 10-admitted
release snapshot. An authenticated Page contributor receives only D1's bounded
editor projection. An authenticated support viewer receives only the exact
Phase 12-authorized purpose, projection, target, fields, history floor, Legal
Entity, Support Assignment, and separately ISO-labelled balances permitted by
the applicable Phase 21 D9 profile. No projection is inferred from Ministry
Assignment or Support Assignment membership, marriage, household, team,
display, contributor status, binding, Designation, progress, preference, JWT,
service role, or raw-table visibility.

Raw identity, membership, binding, grant, supporter, activity, and financial
relations remain browser-inaccessible. Forced coarse Tenant RLS and same-scope
composite constraints are defense in depth; the sole server-side Phase 12 PDP
owns current fine-grained selection. Realtime carries only an opaque private
resource/version signal followed by a newly authorized server projection read.

## Dated Phase 22 D21 private-adoption projection amendment (2026-08-14)

Phase 3 registers the D21 Public Ministry Surface Adoption Case, immutable
Adoption Plan Version, tenant-instance Adoption Coverage Manifest, cutover
receipt, and selected reader-generation head as distinct operational families.
The tenant manifest references one immutable code-owned coverage-plan/build
generation for reader, API, fixture, test, and import-path completeness; it does
not duplicate source-code inventory as mutable per-tenant rows. Resumable work
appends immutable plan or manifest successors and selects exactly one candidate
for a cutover attempt; it never edits readiness truth in place.

Raw source censuses, legacy names and paths, Phase 10 causes, subject and
Designation mappings, media evidence, content digests, authorization epochs,
and residual diagnostics remain browser-inaccessible. Authorized staff receive
only a current, privacy-minimized exception projection with the exact Site and
language, visitor-safe consequence, owner-correct action, and the three D21
preparation dispositions. Ordinary contributors receive only their existing
D1/D18 Page projection plus a calm explanatory substatus; anonymous users
receive no adoption, migration, manifest, generation, cause, or existence fact.

Every read and command re-proves the current Principal, Active Tenant
Assignment, exact D21 capability, cohort, owner generations, and authorization
epoch through the Phase 12 decision point. Forced same-tenant RLS, composite
scope keys, indexed policy predicates, private security-invoker projections,
and no raw `anon` or `authenticated` grants remain defense in depth; neither RLS
visibility, a client-selected cohort, JWT metadata, CMS role, service key, table
ownership, nor `BYPASSRLS` grants adoption access or authority.

## Dated Phase 22 D22 Public Page operations projection amendment (2026-08-14)

Phase 3 registers privacy-safe projected references to owner-domain causes and
exact Page/Ministry Update impacts as two separate private, disposable,
rebuildable projection families. Every projected cause reference pins
complete Tenant, Legal Entity, environment, Site, locale, owner domain, cause
contract generation, stable source reference, monotonic owner version,
responsible-owner generation, actionability, code-owned action kind, coverage,
and through-time. Impact membership pins the exact Page or Update and only the
privacy-safe visitor consequence currently permitted for the consumer. One
cause may therefore affect many Pages without one row/task/notification per
Page, while several causes on one Page remain independent.

The application cannot write a resolved, dismissed, healthy, acknowledged,
ignored, snoozed, or forced state into either family. Only a newer owner version
may resolve, supersede, or reopen a cause. Consumers apply versions
idempotently, reject older updates, expose incomplete coverage honestly, and
use periodic count/digest reconciliation plus smallest-scope rebuild. An
optional shared-task reference is collaboration metadata only and cannot
change projection membership or owner truth.

Every row, impact, group, count, search, sort, filter, export, subscription,
badge, notification input, cache entry, and Realtime-triggered refetch passes
through the same current Phase 10/12 purpose, field, target, scope, and
authorization decision before filtering and before aggregation. Raw projection
tables and privileged projector paths remain browser-inaccessible; exposed
views use invoker behavior, explicit least-privilege grants, indexed default-
deny RLS, complete non-null scope keys, and permission-consistent keyset
pagination. Unauthorized or restricted Pages contribute no distinguishable
row, total, timing, empty state, URL, or cache artifact.
