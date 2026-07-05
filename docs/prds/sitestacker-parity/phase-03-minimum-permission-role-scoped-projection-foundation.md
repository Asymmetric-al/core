# Phase 3 — Minimum Permission & Role-Scoped Projection Foundation

**Program:** SiteStacker Parity · **Phase:** 3 · **Status:** Draft for pricing → tickets

> Buildable synthesis of the Phase 3 grill (decisions D1–D12) plus a nonprofit-CRM/CMS best-practice validation and a gap-check verified against the live schema on this branch. Grounded in the repo as of drafting; **specific file/line references may drift** — treat them as pointers, not contracts. New canonical terms are reconciled in **Glossary & OpenSpec** below and must be added to the repo-root `CONTEXT.md`.

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
2. **A surface-generic, subtract-only projection resolver** — the single read/write chokepoint. Effective access = `field_policies ∩ row-scope ∩ record-flags ∩ record-state`. It can only ever _remove_ access, never grant it. All conditional/row logic (ownership, gift anonymity, relationship-scope, record-state, consent) lives here, **never** in `field_policies`.
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
- **A4 — The resolver is the only home for conditional/row logic and it only subtracts.** Ownership, gift anonymity, relationship-scope, record-state, member-care author-only, and consent live here as composing predicates. `effective = field_policies ∩ row_scope ∩ record_flags ∩ record_state`; the resolver never grants.
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
- Prior art: `crm/projections/contracts.ts` (code-defined surface→field contracts to promote from shadow to enforced); `contribution_correction_requests` migration shape (partial-unique, RLS staff-only).

**Module 2 — Sensitivity taxonomy** _(6 categories + default bundles)_

- Responsibility: the six fixed, non-deletable categories and, for each, the default `{visible, editable, exportable}` per surface plus `auditRead` and `requiresReason` defaults (`care`+`security` audit-read on; `financial`/`care`/`security` require-reason on). Pure, data-only; anchors fail-closed and supplies the total order the classifier needs.
- Interface: `const CATEGORY_ORDER = ['public','contact','internal','financial','care','security'] as const;` + `SENSITIVITY_DEFAULTS: Record<SensitivityCategory, CategoryDefaults>` + `defaultPolicyFor(category, surface)`.
- Prior art: the layered capability-bundle constants in `contribution-operations/permissions.ts` (ordered bundles as data).

**Module 3 — Surface-generic projection resolver** _(the subtract-only core)_

- Responsibility: the single chokepoint. Given `(surface, recordType, row, auth, policies, scope?)`, return only policy-visible fields, then subtract via row-scope/record-flags/record-state. Never adds a field absent from `field_policies`. Every derived/projection output column must declare a category; absent ⇒ `internal`.
- Interface:
  ```ts
  interface RowScope {
    ownsRow(row): boolean;
    isAnonymizedFor(row): boolean;
    recordState(row): "open" | "settled" | "locked";
    withinRelationship(row): boolean;
    withinHouseholdVisibility(row, viewerPersonId): boolean; // reserved-inert (Phase 7)
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
- Reserved seam (like the `tenant_id` seam): `withinHouseholdVisibility(row, viewerPersonId)` is declared inert now and implemented by Phase 7 as register + classify. Intra-household visibility is **member-scoped** — a household co-member does **not** automatically inherit visibility of another member's private/anonymous gift.

**Module 4 — Unified export-governance layer** _(one policy source, all channels)_

- Responsibility: shared `resolvePolicy()` (reads `exportable` + category) + `csvSafeCell()` (one OWASP/CWE-1236 helper — neutralize leading `=`/`+`/`-`/`@`/TAB/CR/LF, RFC 4180 quote, CRLF + UTF-8 BOM; **shared with the P0 patch, never re-implemented**) + one consent gate + one audit call. The admin CRM CSV serializer is **rewired to build columns from the resolved exportable projection** (its derived output columns classified at the projection under `crm_report.*`), not a hardcoded list. Consent gate over `do_not_email`/`do_not_contact`/`email_suppressions`, fail-closed, staff/system-initiated outbound only. Also **enforce-now: bind template merge-tag resolution to the recipient surface** so a donor/missionary email can't resolve internal/other-party fields. Reserved seam: the merge-tag governance (recipient-surface-bound today) must be extendable so forbidden merge-fields (deductibility, amount) can be keyed by **document class**, not only recipient surface — enabling the Phase 7 three-document wall; Phase 7 owns the implementation.
- Interface:
  ```ts
  function csvSafeCell(value: unknown): string;
  function resolveConsent(input: {
    donorId;
    channel: "email" | "csv" | "receipt";
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
- Enforce-now: CSV, receipt (text), `sendEmail()`. Contract-only: Mailchimp, receipt-PDF generation, the future `notification_queue` worker.
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
- **Export governance** — `resolvePolicy` + `csvSafeCell` + consent + audit across CSV/receipt/`sendEmail()` now; Mailchimp/receipt-PDF/queue-worker as contracts (Mailchimp contract includes the inbound `unsubscribed|cleaned → do_not_email` writer). The CRM CSV serializer's columns are driven by the resolved exportable projection.
- **Change-control flow** — reason → server-computed diff-preview (`widen()` + blast-radius rollup) → direction branch → approval-on-widening (distinct human at profile-id level) → base-fingerprint recheck → apply → audit → rollback-as-inverse-edit.
- **Baseline guard** — a dedicated `assertCanEditBaselinePolicy` (explicit super-admin check; **rejects `tenant_id NULL` writes routed through the tenant-scoped `requireCrmAccess` path**, which `??`-falls-back and would otherwise pass for any staff).
- **Meta-capabilities** — `permissions.view` / `permissions.propose_widening` / `permissions.approve_widening` on the **contribution capability resolver** (graduated so propose ≠ approve), not the flat staff-capability union.
- **Anti-drift CI** — extend `verify:data-boundary` with the callsite lint (A2); the client DataTable CSV export **throws on any governed/sensitive column**.
- **Surface-exposure lattice (ruling).** `mission_control` (least exposed) `<` `donor` ≈ `missionary` (peers, **incomparable**) `<` `public` (most exposed); `export` is governed by the separate stricter `exportable` flag. Moving a field between two incomparable surfaces (e.g. donor→missionary) is a **widen** (fail-closed). Any surface pair not comparable in the lattice ⇒ `widen`.
- **Anonymity (ruling).** Mask donor identity on `missionary` + `public`; **retain** for finance/admin/receipt/audit. The resolver masks when the gift is anonymous — covering the existing null-donor guest case now and a future donor-elected flag as a contract. Grounded in the AFP Donor Bill of Rights (not the retracted `CONTEXT.md` citation — see Further Notes).

### ADRs to write

- **ADR-A — `field_policies` is a field-only static lookup; conditional/row visibility lives in a subtract-only resolver.** Rejected: per-value provenance / a runtime rules engine (unpredictable, hard to test/audit).
- **ADR-B — Capabilities are code source-of-truth; capability tables deferred with a future-additive shape.** Preserves compile-time safety; the only Phase-3 consumer is a read-only page.
- **ADR-C — Widening a projection is a maker-checker reviewed event (reusing the correction engine, hard-coded separation-of-duties); narrowing is immediate.** The fail-safe asymmetry + fail-closed `widen()` classifier. Notably, **no surveyed donor CRM ships in-product four-eyes for permission widening** — a deliberate best-practice exceedance.
- **ADR-D — Unified export-governance: one policy source, `exportable` authoritative over serializers, one shared `csvSafeCell`.**

---

## Testing Decisions

A good test here exercises **external behavior through each module's stable interface with adversarial inputs**; the two highest-value targets are projection leakage and export injection. Modules to test (all of Modules 1–5). Test scope:

- **`widen()` exhaustive matrix** _(the load-bearing safety unit)_ — every category-order transition, every `visible/editable/exportable` `F→T`/`T→F` on internal vs external surfaces, every `(category-change × surface-pair)` verdict, and every unknown/ambiguous input ⇒ asserts `widen`; a derived field inherits max-sensitivity of inputs. A single missed branch silently converts an approval-gated widening into an auto-publish leak.
- **Projection resolver, fail-closed + subtract-only** — no-policy field omitted; unregistered/new surface sees nothing; dotted/unknown key omitted; row-scope subtracts (non-owner loses contact fields; anonymity masks donor on missionary/public but not finance/receipt/audit; member-care author-only); resolver never adds a field absent from `field_policies`; promoted resolver reproduces today's `DONOR_SELECT` / `DONOR_RELATIONSHIP_SELECT` visible set exactly (no regression) while excluding unclassified columns.
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

**Term collision — "projection."** `projection` already means the shadowed CRM→surface sync in `crm/projections/contracts.ts` and `openspec/specs/crm-core`. Phase 3's new concept is named **"role-scoped field projection"** (or "surface projection") and the disambiguation is stated in the glossary; the two meanings must not be conflated (the shadow contracts are the thing Phase 3 _promotes_ from monitoring to enforcement).

**Live P0s (fast-tracked, compose with Phase 3).** Three live issues were spun off as standalone security patches: CSV formula-injection across three serializers (adds the shared `csvSafeCell` + CRLF/BOM + the Phase-2 `source_code` debt) and the `sendEmail()` consent-bypass. Phase 3's export-governance **consumes the same `csvSafeCell`** the patch introduces — it must be one shared helper, never re-implemented (a lint forbids a second CSV-escaping implementation).

**Glossary & OpenSpec.** Add to repo-root `CONTEXT.md`: **permission**, **capability**, **role-scoped field projection** (disambiguated), **field policy**, **sensitivity category**, **surface**, **donor-safe / missionary-safe / public-safe**, **fail-closed default**. Phase 3 lands as spec deltas + tasks in the existing `openspec/changes/sitestacker-parity/` change and adds a Phase 3 row to `parity-matrix.md`.

---

## Evidence & Acceptance

Evidence file under `docs/ops/phase-evidence/` (following the Phase 1/2 pattern), recording commands + results, the five module suites, and the honest "what Phase 3 did **not** build" list.

**Headline acceptance run:**

1. A **fail-closed** unclassified field is invisible on donor/missionary/export and visible in Mission Control.
2. The donor portal and missionary workspace, promoted to the resolver, show **exactly** their pre-promotion field sets (parity golden snapshot) — no regression — while now excluding any unclassified column.
3. A missionary sees **only their own supporters**, and for a 3-way split gift sees only their own designation line (finance sees all three).
4. An **anonymous** donor is masked on missionary/public and retained for finance/receipt/audit.
5. A field flipped `exportable=false` **disappears from the CSV** (serializer driven by policy), and a donor named `=HYPERLINK(...)` is neutralized on export.
6. A staff/system email to a `do_not_email` donor is **blocked and audited**; the donor's own receipt download is not.
7. **Widening** a projection routes through maker-checker and **blocks self-approval**; **narrowing** auto-publishes; both are audited identifiers-only.

---

## Tracking Issues (pre-ticket; blocked on pricing)

Anticipated ticket shape (finalized via `/to-issues`):

1. `field_policies` table + column census/seed + fail-closed default.
2. Surface-generic resolver + promote both portal `SELECT`s + **promotion-parity golden snapshot** + extend `verify:data-boundary` chokepoint lint + client-DataTable-export gate.
3. Code-only capabilities registry + 3 meta-caps + `/minimum` read view.
4. Unified export-governance + rewire CRM CSV serializer to policy + consent gate on `sendEmail()` + receipt + merge-tag surface gate (consumes the P0 `csvSafeCell`).
5. Narrow-surface write chokepoint + enumerated mutation entrypoints + reason-capture component (D6).
6. `field_policy_change_requests` + `widen()` classifier + surface-exposure lattice + `/projections` change-control UI + baseline guard.
7. `/audit` read-only viewer + `logPolicyChange` + typed identifiers-only audit payload + system-actor path.
8. Split-gift `contribution_designation` record_type + per-line row-scope (contract-only binding).
9. Gift-anonymity masking rule + null-donor case now + reserved donor-elected-flag contract.
10. The four ADRs.
11. Glossary (`CONTEXT.md`) + OpenSpec spec-delta/tasks + `parity-matrix.md` row.
12. Phase 3 evidence file.
