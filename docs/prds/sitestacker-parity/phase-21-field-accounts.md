<!-- phase21-to-spec:field-account-operations:v1 -->

# Phase 21 — Missionary Field Accounts & Support Balances

**Status:** Implementation-ready specification; not implemented
**Decision authority:** Phase 21 D1–D28, ratified and scope-frozen 2026-08-02
**Confirmed public testing seam:** `FieldAccountOperationsService`
**OpenSpec change:** `add-field-account-operations`

This specification publishes the complete Phase 21 product contract for
implementation planning. It does not dispatch implementation tickets or claim
that any FORWARD capability described below exists.

## Problem Statement

Christian missions sending organizations need an honest operational view of
support associated with missionaries, couples, teams, and projects while the
organization—not the worker—retains legal ownership and discretion over the
funds. Gifts arrive through several rails, may settle or be corrected at
different times, may carry administrative assessments, and may later support
compensation, approved ministry expenses, reallocations, or other
organization-authorized purposes. Finance normally closes this activity on a
monthly or biweekly cadence, completes bookkeeping in QBO or Xero, and sends
compensation or reimbursement through external payroll or accounts-payable
processes.

The current product cannot safely represent that lifecycle. Existing
missionary-facing support numbers can derive from a mutable `current_funding`
value or donation sums, and a dormant component says **Available Funds** and
offers **Withdraw**. Those models would incorrectly imply a worker-owned wallet,
would break under refunds, assessments, reallocations, currency changes, and
late facts, and would conflict with the tenant's accounting and payroll truth.
The repository has no Field Account subledger, finance-close contract,
assessment engine, expense-claim authority, support-assignment membership
model, opening-position cutover, or production-grade authenticated missionary
test path.

A naïve implementation would create more danger than value. A stored balance
could drift from its entries. A gift could be counted before required source
evidence exists or counted twice after replay. A spouse relationship could
silently grant broad financial access. An approved expense could be mistaken
for reimbursement, an accounting record for payment, a payroll draft for
completed payroll, or a provider timeout for a safe retry. Currency conversion
could fabricate a total. Historical imports could overlap current ownership.
Tenant-configurable rules could become an untestable financial DSL. Generic
`paid`, `synced`, `available`, or `reconciled` states could merge independently
authoritative facts and mislead missionaries and staff.

Missionaries need a calm mini-CRM view of recorded support activity, a clearly
through-dated finance-confirmed balance when the tenant chooses to publish it,
statements, support-plan context when used, and low-friction expense work. They
do not need a second finance console or constant settlement noise. Finance and
administrators need the exact source coverage, controls, close, policy,
exceptions, handoff evidence, and recovery needed to trust the result without
turning Asym into a general ledger, bank, payroll engine, accounts-payable
ledger, tax engine, or legal adviser.

## Solution

Build one organization-controlled **Field Accounts** capability behind a
server-resolved, Tenant-, actor-, Legal-Entity-, purpose-, Support-Assignment-,
Field-Account-, and ISO-currency-scoped `FieldAccountOperationsService`.

The permanent operating model is:

1. A **Support Assignment** is the organization-controlled subject for a
   missionary, couple, team, or project. Participants retain separate Party,
   principal, membership, access, responsibility, and notification identities.
2. Each technical **Field Account** belongs to one Support Assignment and one
   immutable ISO currency. Its balance is derived from immutable, balanced,
   source-addressed Field Account Occurrences; no mutable balance scalar is
   authoritative.
3. Exact Phase 13 money-designation postings and qualified D21 realized
   noncash proceeds become provisional Missionary Support Activity. A
   prospective source-family **Support Allocation Readiness Policy** determines
   when each positive allocation may enter a Support Cycle close. Adverse
   corrections always remain appendable.
4. The tenant chooses monthly by default or a supported biweekly cadence.
   Finance reviews one exception-first **Support Cycle** and closes it only
   after a fresh immutable **Support Cycle Integrity Manifest** proves complete
   coverage, conservation, isolation, and the exact ingestion boundary. Only a
   close or later append-only correction advances the
   **Finance-confirmed Field Account Balance**.
5. Optional prospective policy modules—Administrative Assessment Profiles,
   Approved Support Plans, Expense Governance, Prospective Expense
   Authorization, Travel Allowance calculations, advances, support-cost
   applications, retained currencies, and external adapters—are absent or use
   safe defaults until explicitly enabled and production-proved. They cannot
   weaken core invariants.
6. Expenses use claim-level immutable truth, exact item/split conservation,
   private many-to-many evidence, human policy decisions, immutable Approved
   Expense Snapshots, and separately authoritative obligations, Field Account
   effects, execution evidence, and accounting handoffs. OCR and AI output is
   suggestion-only and always has a complete manual path.
7. Compensation and reimbursement create immutable artifact-always handoff
   packages and exactly one qualified execution lane. External providers remain
   authoritative for classification, calculation, approval, execution,
   completion, and payment. Phase 20 alone owns QBO/Xero accounting delivery.
8. Opening positions and production activation use one source-covered,
   per-currency Operational Cutover at an exact half-open boundary. Shadow work
   is side-effect-dark; every predecessor fact has exactly one disposition;
   activation never becomes a second close or a tenant-global enable bit.
9. The missionary workspace shows only permission-safe activity and separately
   through-dated balances that the tenant has chosen to publish. Detailed gift
   status, assessments, plans, expenses, statements, and explanations appear
   progressively when useful. It never offers withdrawal or claims support is
   available, payable, payroll-ready, reimbursed, paid, posted, or reconciled.
10. Mission Control owns configuration, review, close, and cause-owned
    exceptions. Healthy tenants stay quiet. Every exception names the exact
    cause, affected scope, safe continuing behavior, owner, evidence required,
    and next action.

## User Stories

Story number `NNN` is the stable identifier `US21-NNN` used by the acceptance
traceability contract.

1. As finance staff, I want one Field Accounts doorway, so that support, expenses, close, and handoffs remain coherent.
2. As a missionary, I want a simple support overview, so that I understand recorded activity without learning bookkeeping.
3. As an administrator, I want guided defaults with bounded advanced settings, so that flexibility does not become a rules engine.
4. As an auditor, I want every balance derived from immutable entries, so that no mutable counter can drift silently.
5. As every user, I want source, Field Account, accounting, payroll, and payment states labelled separately, so that one success never implies another.
6. As a one-person finance team, I want healthy automation to stay quiet, so that exceptions—not routine mechanics—consume attention.
7. As a tenant, I want monthly close by default and supported biweekly close, so that Asym fits our actual finance cadence.
8. As finance staff, I want provisional activity visible before close, so that I can prepare without overstating the confirmed balance.
9. As a missionary, I want the last finance-confirmed through-date, so that I know how current a published balance is.
10. As finance staff, I want a close to freeze exact source and policy coverage, so that later facts cannot rewrite history.
11. As finance staff, I want late and adverse facts appended through governed corrections, so that closed cycles remain immutable.
12. As staff, I want QBO/Xero and payroll evidence kept independent from Field Account truth, so that disagreement remains diagnosable.
13. As finance staff, I want exact source-posted support activity, so that pending or estimated money is not invented.
14. As a tenant, I want readiness policy by bounded source family, so that rails can require appropriate evidence without per-gift overrides.
15. As finance staff, I want Stripe-balance and offline-deposit defaults, so that ordinary sources require little setup.
16. As a missionary, I want contribution status hidden by default but available on demand, so that the dashboard stays calm and transparent.
17. As a missionary, I want plain states such as Recorded, Processing, Received, Not received, Refunded, or Reversed, so that provider jargon is unnecessary.
18. As finance staff, I want atomic redesignation and transfer pairs, so that corrections conserve support exactly.
19. As a tenant without administrative assessments, I want an explicit zero-assessment default with no setup noise, so that ordinary support closes require no unnecessary configuration.
20. As finance staff, I want one deterministic Assessment Profile winner, so that charges never stack accidentally.
21. As finance staff, I want percentage, minimum, flat, cap, service, exemption, and effective-date options, so that policy matches our organization.
22. As a missionary, I want gross support, assessment, and net effect shown clearly only when the tenant publishes that detail, so that I understand the change without finance noise.
23. As finance staff, I want assessment preview and production-shaped activation proof, so that policy changes are prospective and understood.
24. As finance staff, I want component-correct proportional reversals, so that refunds undo the exact assessment components they affected.
25. As HR or finance staff, I want compensation funding tied to an external engagement authority, so that fundraising never classifies a worker.
26. As finance staff, I want bounded fixed, up-to-capacity, or organization-supplemented funding plans, so that tenant practice remains flexible.
27. As finance staff, I want funding coverage to reserve but not debit or pay, so that planning cannot masquerade as execution.
28. As a missionary, I want compensation-funding context only when authorized, so that support planning does not promise pay.
29. As payroll staff, I want one immutable Compensation Handoff Package, so that provider input is reproducible and reviewable.
30. As payroll staff, I want exactly one provider-native, artifact, or separately certified Phase 20 source-handoff lane, so that dual delivery cannot duplicate compensation input.
31. As a Gusto tenant, I want exact employee payroll-draft support only for certified operations and organizations, so that the integration never claims unsupported capability.
32. As an ADP tenant, I want exact Workforce Now Pay Data Input support only for certified operations and regions, so that provider limits remain explicit.
33. As a Xero Payroll AU or NZ tenant, I want separately certified draft-input behavior, so that regional products are not conflated.
34. As a QuickBooks Workforce or Xero Payroll UK tenant, I want honest readback-and-artifact continuity when direct draft write is unsupported, so that manual completion remains dependable.
35. As operations staff, I want ambiguous provider outcomes inspected before retry, so that timeouts do not create duplicates.
36. As finance staff, I want exact readback, drift, residual-only recovery, and kill switches, so that provider automation is controlled.
37. As finance staff, I want underfunding routed to an exception, so that Asym never silently reduces wages or invents backpay.
38. As authorized staff, I want a bounded Support Reallocation Case, so that the organization controls transfers and exit disposition.
39. As a missionary, I want requests treated as nonbinding preferences, so that I cannot accidentally execute organization funds.
40. As finance staff, I want same-currency internal reallocations committed as atomic pairs, so that value is conserved.
41. As finance staff, I want exit disposition to cover every remaining amount exactly once, so that nothing disappears or duplicates.
42. As authorized staff, I want proof-gated charitable succession, so that external transfers remain purpose-compatible and evidence-based.
43. As a tenant, I want one quiet default Field Account currency, so that ordinary local-currency organizations avoid configuration noise.
44. As finance staff, I want proof-gated parallel currency accounts, so that supported retained currencies remain separate and exact.
45. As a missionary, I want each balance separately ISO-labelled and through-dated, so that a converted grand total cannot mislead me.
46. As finance staff, I want exact external conversion evidence without an Asym FX engine, so that currency authority stays external.
47. As finance staff, I want cross-currency source allocation captured in an immutable conserving manifest, so that every designation ties out.
48. As an integration administrator, I want support feeds off by default and recipient-scoped, so that sharing starts intentionally.
49. As a missionary, I want authorized support activity and balances available to approved support tools without creating another CRM or ledger, so that my existing workflow remains complete.
50. As a privacy administrator, I want filtering before enumeration and recipient-scoped opaque identifiers, so that hidden relationships cannot leak.
51. As operations staff, I want snapshot-plus-monotonic-cursor delivery with explicit reset, so that feed recovery has no date-only gaps.
52. As a tenant, I want Stop sharing to deny future egress immediately, so that unsupported downstream deletion is not falsely claimed.
53. As a tenant, I want support planning disabled by default, so that unused commitments, balances, and goals do not appear as zero.
54. As a fundraising coach, I want an optional organization-approved Support Plan, so that planning reflects tenant-approved needs.
55. As a missionary, I want only the planning modules my tenant publishes, so that my workspace remains relevant and understandable.
56. As finance staff, I want balance, reserve, commitment, and fundraising-goal projections separated, so that equal numbers do not merge authority.
57. As an administrator, I want production-shaped audience preview, so that publication never leaks hidden balances or sources.
58. As a missionary, I want harmless personal reorder and collapse, so that I can focus without changing organizational truth.
59. As a claimant, I want a report-first expense experience that does not require report administration for one ordinary claim, so that submission stays fast.
60. As a claimant, I want autosave, camera-first receipts, and resumable mobile drafts, so that expense capture works in the field.
61. As finance staff, I want claim-level immutable versions and conserved items/splits, so that partial decisions remain exact.
62. As a claimant, I want missing information returned only for affected claims, so that clean claims continue.
63. As an approver, I want an immutable Approved Expense Snapshot, so that later edits cannot change what I approved.
64. As finance staff, I want receipts linked many-to-many through private evidence, so that duplicates and shared receipts remain explicit.
65. As a claimant, I want OCR and matching suggestions that require confirmation, so that AI cannot create financial truth.
66. As an administrator, I want separate purpose-specific AI bindings and credentials, so that receipt OCR and biography help can use different providers.
67. As a security administrator, I want write-only encrypted credential revisions with no secret readback, so that tenant API keys remain protected.
68. As a tenant, I want classification-gated minimum-data AI egress, regional/model controls, budgets, provenance, and a complete manual path, so that optional AI remains governable and replaceable.
69. As finance staff, I want machine-proved balanced occurrences and bounded control entries, so that Field Account integrity is mathematical.
70. As finance staff, I want exact minor-unit arithmetic, source conservation, semantic idempotency, and account-version fences, so that retries and concurrency cannot change financial meaning.
71. As finance staff, I want incremental verification and bounded historical re-verification, so that integrity scales without full rescans.
72. As finance staff, I want one cause-owned Integrity Case at the smallest affected scope, so that unrelated work continues.
73. As finance staff, I want guided repair actions backed by fresh proof, so that nobody can force-close or force-balance.
74. As a missionary, I want immutable support statements from closed-cycle facts, so that prior periods remain trustworthy.
75. As a tenant, I want automatic statement publication under one prospective profile, so that finance performs no monthly publish chore.
76. As a missionary, I want HTML-first statement history and an authorized PDF download, so that access is simple and accessible.
77. As a privacy administrator, I want hidden-balance publication to expose no statement existence signal, so that private financial state cannot be inferred.
78. As finance staff, I want financial corrections in later closes and presentation fixes as same-facts artifact successors, so that financial and rendering history remain distinct.
79. As a tenant not using Asym expenses, I want the Expense Program structurally absent, so that setup and queues do not create noise.
80. As an administrator, I want bounded prospective Expense Governance Profiles, so that policy can vary without arbitrary rule order.
81. As a reviewer, I want one deterministic incurred-date policy winner and a frozen approval route, so that decisions are reproducible.
82. As a small tenant, I want named independent oversight without impossible separation-of-duties loops, so that governance remains practical.
83. As an approver, I want missing-evidence and policy-exception paths with explicit consequences, so that overrides cannot become hidden authority.
84. As an approver, I want clean-only bulk approval with previews, so that scale does not hide mixed outcomes.
85. As a tenant, I want optional organization-card CSV evidence over the complete manual claim path, so that card workflows help without becoming mandatory.
86. As finance staff, I want classified import preview, exact file/row idempotency, overlap detection, and explicit partial acceptance, so that unsafe rows cannot silently enter operations.
87. As a cardholder, I want only assigned posted organization-card activity, so that personal and pending transactions stay outside authority.
88. As finance staff, I want business, personal, and unresolved dispositions to conserve the exact transaction amount, so that every posted charge remains fully explained.
89. As a privacy administrator, I want PAN-minimized private artifacts and no OCR/PDF-derived card truth, so that sensitive card evidence stays bounded.
90. As finance staff, I want card adjustments appended from source evidence, so that imports are never destructively undone.
91. As finance staff, I want every Reimbursement Obligation represented in an immutable artifact-always package, so that every execution lane has durable continuity.
92. As finance staff, I want `Handle outside Asym` as the complete default, so that direct provider execution is never required.
93. As finance staff, I want package creation and retrieval separated from release, so that download never means execution.
94. As finance staff, I want exactly one qualified reimbursement lane per coverage unit, so that obligations cannot be delivered twice.
95. As a claimant, I want partial, grouped, returned, reversed, corrected, and reissued payment evidence shown truthfully, so that I can understand what actually happened.
96. As finance staff, I want provider draft acceptance and staff attestation labelled by evidence strength, not called payment, so that handoff never overstates completion.
97. As a tenant, I want advances and claimant repayments independently optional and absent by default, so that unused complexity stays invisible.
98. As finance staff, I want advance authorization, issuance, readiness, application, and residual truth separated, so that one fact cannot impersonate another.
99. As finance staff, I want one serializable settlement determination to conserve advances, reimbursement, residuals, and optional funding coverage, so that concurrent processing cannot double-apply approved expense coverage.
100. As a claimant, I want repayment requests described as organization decisions, not automatically adjudicated debt or collections, so that the product remains accurate and humane.
101. As finance staff, I want returned-money evidence covered exactly and disputes routed to review, so that tasks do not prove repayment.
102. As finance staff, I want one source-covered Opening Position per Field Account and currency, so that activation never fabricates history.
103. As migration staff, I want chunked resumable private staging and side-effect-dark shadow reconciliation, so that large opening cohorts can be proved safely.
104. As finance staff, I want every predecessor source fact assigned exactly one disposition, so that exact history and residual opening cannot overlap.
105. As finance staff, I want one short CAS-guarded half-open Operational Cutover, so that dual write and whole-history replay are impossible.
106. As a missionary, I want calm through-dated truth after cutover, so that migration mechanics never appear as money availability.
107. As a tenant, I want actual-expenses-only travel treatment by default and optional certified mileage or allowance calculations, so that our policy can stay simple or become more capable deliberately.
108. As a claimant, I want low-friction route, odometer, manual, per-day, and offline-draft travel input without mandatory GPS, so that travel claims work in real field conditions.
109. As finance staff, I want policy-pinned source packages, exact cumulative capacity, rounding, and duplicate-reimbursement protection, so that allowance results are reproducible.
110. As a claimant, I want one calm calculated total with an on-demand explanation and no tax-free or payment promise, so that I understand the result without being misled.
111. As an administrator, I want a Support Assignment to remain organization-controlled regardless of its participants, so that membership never changes financial ownership.
112. As a spouse or teammate, I want a separate login with independently authorized access to the same assignment, so that we can collaborate without sharing identity.
113. As a project leader, I want scoped visibility and notifications without becoming a claimant, approver, payee, or financial owner, so that leadership access stays purpose-limited.
114. As an administrator, I want participant membership, workspace access, responsibility, and notification preferences kept separate, so that each can change without widening the others.
115. As a security reviewer, I want server-only Phase 12 decisions and coarse forced RLS, so that relationship membership cannot become an ACL shortcut.
116. As finance staff, I want optional source-authoritative organization support-cost applications that stay invisible when unused, so that uncommon costs do not add routine noise.
117. As finance staff, I want semantic ownership to prevent assessment, compensation, expense, processor, and noncash costs from overlapping, so that one economic cost is never applied twice.
118. As finance staff, I want discretionary capacity that never authorizes an overdraft, exact same-currency manifests, and bounded carryforward without worker-debt language, so that organization decisions remain controlled and humane.
119. As finance staff, I want original noncash gifts preserved while only source-final realized proceeds may become monetary support, so that asset truth is never rewritten as cash.
120. As finance staff, I want exact asset-lot, proceeds, cost, currency, and purpose coverage, so that valuation is never treated as cash.
121. As a missionary, I want noncash support shown as a quiet grouped realization story without duplicate fundraising credit, so that the activity is understandable without double counting.
122. As a tenant, I want Prospective Expense Authorization fully optional and structurally absent when disabled, so that ordinary claims stay uncluttered.
123. As a requester, I want a fast four-question Plan an expense flow with mobile drafts and clear nonbinding language, so that optional planning does not become a reimbursement promise.
124. As an approver, I want immutable amount, currency, purpose, incurrence window, conditions, and reviewer authority, so that approval scope is exact.
125. As finance staff, I want optional exact reservations only when separately certified and atomically committed, so that capacity is not reduced by an ambiguous request.
126. As a claimant, I want later claims covered exactly against authorization without fuzzy or overlapping use, so that I can see which approved scope was consumed.
127. As finance staff, I want source-family-specific expense balance-inclusion timing, so that one generic paid/posting state cannot drive effects.
128. As finance staff, I want exact immutable effect basis and non-reusable coverage, so that approved expense slices are never subtracted twice.
129. As finance staff, I want refunds, returns, failures, reclassifications, and currency differences appended in a later permitted close, so that past closes remain immutable.
130. As a missionary, I want expense effects signed, source-labelled, ISO-currency-specific, and through-dated without implying reimbursement, so that support-balance activity is clear.
131. As a claimant, I want to appoint an exact helper without sharing credentials or my whole account, so that collaboration preserves my identity and privacy.
132. As a helper, I want a persistent Helping with expenses context limited to assigned claims and evidence, so that I always know whose work and scope I am handling.
133. As a claimant, I want prepare-only by default and submission only after my immutable confirmation or admitted attestation, so that a helper cannot silently speak for me.
134. As a privacy administrator, I want non-cacheable current-authorized evidence access and deny-first revocation, so that removed access stops immediately.
135. As finance staff, I want exceptional Expense Claim Resolution Cases only for proved causes, so that healthy claims remain quiet.
136. As a claimant, I want one plain-language next action and an exact before/after preview for material changes, so that resolution stays understandable.
137. As finance staff, I want downstream impact coverage before case completion, so that each owning domain appends its own correction.
138. As staff, I want same-cause duplicates to converge while distinct exact cases remain separately truthful, so that the queue stays quiet without losing facts.
139. As a records administrator, I want purpose-owned schedules with legal floors, privacy ceilings, holds, and immutable per-record resolutions, so that custody decisions are explainable.
140. As a tenant, I want repeatable human-readable and open-format custody exports without proprietary lock-in, so that I can keep authorized records elsewhere.
141. As a tenant leaving Asym, I want a final snapshot-plus-delta and bounded records-only retrieval window, so that offboarding preserves continuity.
142. As an auditor, I want manifest-complete exports with hashes, truthful omissions, relationships, versions, and owner-domain references, so that completeness can be verified independently.
143. As a tenant, I want guidance about recordkeeping without a false compliance warranty or loss of Asym's own duties, so that responsibility stays clear.
144. As finance staff, I want production activation to compose D1–D26 proof without weakening any owning authority, so that setup cannot bypass settled controls.
145. As finance staff, I want one complete-cohort, side-effect-dark shadow and literal Start Field Accounts action, so that go-live is understandable and controlled.
146. As an operator, I want the final cutover to reprove actor, permissions, sources, policies, mappings, generation, and revocations, so that stale readiness cannot activate production.
147. As a tenant, I want optional capability failures contained to affected positive or discretionary behavior, not all Field Accounts, so that safe operations continue.
148. As a missionary pilot, I want publication scoped to my exact authorized assignment without financial-row canaries, so that a pilot cannot change finance authority.
149. As finance staff adopting mid-period travel calculations, I want clean-period activation by default, so that partial-period capacity is not guessed.
150. As finance staff, I want immutable opening cumulative state only when predecessor and continuing source coverage are complete, so that native capacity starts from proof.
151. As finance staff, I want missing cumulative data treated as unknown rather than zero and affected suffixes reviewed after late facts, so that omissions cannot create capacity.
152. As a tenant with uncertain cumulative sources, I want the external-calculation lane to remain fully usable until proof exists, so that adoption does not block claims.
153. As a security administrator, I want every command reauthorized at commit and every query filtered before enumeration, so that stale or cross-scope access cannot leak or mutate data.
154. As an operator, I want opaque correlations, actionable metrics, bounded recovery, and no secrets or donor PII in telemetry, so that incidents are diagnosable without privacy loss.
155. As an assistive-technology user, I want keyboard-complete, reflow-safe, screen-reader-clear finance and missionary journeys, so that I can complete every task independently.
156. As a mobile user, I want 320-pixel, zoomed, offline-aware flows with no critical wide-table dependency, so that field work remains usable on constrained devices.
157. As a global tenant, I want exact ISO currencies, tenant business timezones, long-locale and RTL resilience, and no implicit USD, so that financial meaning survives localization.
158. As every tenant, I want fair capacity and protected recovery work, so that one large organization cannot starve another.
159. As a maintainer, I want all writers to use one FieldAccountOperationsService, so that no alternate financial authority emerges.
160. As a release owner, I want production certification, migration, restore, chaos, accessibility, and load proof before activation, so that go-live is evidence-based.

## Implementation Decisions

### Public boundary and authority

- `FieldAccountOperationsService` is the only Phase 21 application boundary.
  Mission Control and missionary routes, UI actions, durable jobs, batch
  processors, importers, close and repair workers, projections, and provider
  adapters delegate to typed commands and permission-safe queries on this
  service.
- The service is constructed with the trusted server-resolved validated
  principal and actual actor, Tenant Authorization Context, Tenant, Legal
  Entity, environment, active Phase 12 access decision and governance epoch,
  purpose, assurance, and trace context. Support Assignment, Field Account, and
  ISO currency are optional at construction and supplied as exact resource
  scope only for operations that require them; those operations fail closed
  when an applicable value is absent, while Tenant- or Legal-Entity-scoped
  operations use no sentinel identifier. Command payloads cannot assert
  authoritative tenant, actor, role, capability, membership, Legal Entity, or
  assurance.
- Commands expose expected versions, semantic identities, and exact source
  references. They return discriminated outcomes such as applied, exact replay,
  stale, semantic conflict, blocked, invalid, not permitted or not found, and
  external outcome unknown. A route, job, administrator, or bypass role cannot
  widen these outcomes.
- Source domains own source facts; Phase 21 owns Field Account operational
  truth and its exact workflow facts; Phase 20 owns accounting handoff and
  QBO/Xero delivery; external payroll/AP systems own execution and payment;
  Phase 18 owns rendered documents and their exact artifact bytes; Phase 29 owns
  physical byte lifecycle for Phase-21-owned evidence and D26 export packages;
  Phase 30 owns inbound transport and staging;
  Phase 31 owns external support-feed transport. Mission Control tasks own
  follow-up only.
- No compatibility layer may translate mutable `current_funding`,
  `funds.current_amount`, donation sums, fabricated analytics, or dormant
  Available Funds/Withdraw UI into Field Account truth.

### Canonical financial model

- A Support Assignment is the stable organization-controlled subject. Each
  Field Account is keyed by exact Tenant, Legal Entity, Support Assignment, and
  immutable ISO currency. Purpose authority and participant membership are
  separately versioned relationships.
- A Field Account Occurrence is the semantic unit of write and retry. Every
  occurrence contains exact scope, source identity/version, business and record
  times, semantic operation, currency, signed integer-minor-unit amount,
  correction lineage, and a stable semantic idempotency identity.
- Each occurrence writes balanced Field Account and bounded organization-control
  entries atomically. Balances, reservations, obligations, capacity, and
  projections are derived from immutable entries and exact coverage; mutable
  financial scalars, floating-point arithmetic, tolerance plugs, discretionary
  overdrafts, and cross-currency arithmetic are prohibited. A known adverse
  source correction still appends when it exposes a visible deficit; the
  deficit is cause-owned review truth and is never hidden by a plug or rejected
  merely to preserve a nonnegative display.
- Same-scope composite constraints and deny-by-default forced RLS enforce
  Tenant, Legal Entity, purpose, Support Assignment, Field Account, and currency
  isolation. Application authorization remains primary; RLS is defense in
  depth and cannot replace the Phase 12 policy decision point.
- Source coverage is non-overlapping and conserving. Every source slice is
  included once, explicitly excluded, reserved once, corrected by a linked
  successor, or blocked with a cause. Retry identifiers never define economic
  identity.

### D1–D3 support admission, close, and assessments

- Support Cycles use the tenant business timezone and exact half-open
  boundaries. Monthly is the guided default; supported biweekly cadence is
  available. The public progression is Collecting, Finance review, Closed.
- Positive support is provisional until exact policy-qualified source coverage
  enters one close. A close is a short CAS-guarded transaction over a fresh
  Support Cycle Integrity Manifest and captured monotonic ingestion cursor. It
  performs no provider calls, artifact rendering, or queue I/O.
- Adverse corrections, reversals, and source-owned late facts remain appendable
  even when positive admission is quarantined. Closed cycles and statements are
  never reopened or recomputed in place.
- Support Allocation Readiness Policy is prospective, immutable, and bounded by
  source family. Provider-specific evidence retains its provider name in
  finance detail but never becomes missionary-facing availability.
- The explicit baseline is No administrative assessment. Optional Assessment
  Profiles are finite, prospective, non-stacking replacements with exactly one
  winner. Percentage, period minimum/cap, fixed monthly, combined service,
  negotiated flat, and exemption components preserve separate entries and
  component-correct reversals. Exactly one Support Cycle Close owns each
  Assessment Period Determination: the first successfully committed close in
  strict contiguous close order whose through boundary reaches or passes the
  period end. That close totals only source-linked percentage effects whose
  underlying Gross Support Allocations are D2-admitted through unique Support
  Cycle Admission Coverage and whose source-effective instant falls within the
  exact half-open `[period_start, period_end)` interval. Its captured ingestion
  boundary proves which facts were available; the Determination excludes every
  provisional or unqualified fact and never widens the Assessment Period,
  including when a delayed or consolidated close has already captured
  next-period facts. Each close performs a compare-and-swap against the
  immediately preceding committed boundary, so a later close cannot skip an
  open predecessor. A delayed or
  consolidated close qualifies only as the next completely covered contiguous
  boundary. The same-scope period key excludes Profile Version; the
  Determination records the one resolved version. That key and
  compare-and-swap make every retry an exact replay and prevent another close
  from creating a second period adjustment. Late-qualified in-period facts use
  append-only successor effects; they never rewrite or widen the original
  Determination.

### D4–D7 compensation, reallocation, and currencies

- Compensation Funding Plans pin the tenant's external Engagement Authority,
  exact Funding Period, currency, method, balance-floor choice, organization
  supplement, and recognition policy. Funding proposals and decisions never
  classify a worker, calculate compensation or tax, reduce wages, create
  arrears, debit a balance, or prove payment.
- Non-reusable Field Account Funding Coverage reserves exact capacity. An
  evidence-qualified later result may append a Compensation Field Account
  Effect under the pinned recognition policy; failed, partial, mixed, reversed,
  or corrected outcomes retain exact coverage.
- Each Compensation Handoff Package is immutable and artifact-always. Exactly
  one executable lane is selected: staff artifact handling, one certified
  provider-native draft/input operation, or one separately certified Phase 20
  accounting-source handoff. Provider and accounting connections are distinct.
- Launch requires at least two production-authorized direct-write adapters and
  exact per-product capability truth. Gusto, ADP Workforce Now, Xero Payroll AU,
  Xero Payroll NZ, QuickBooks Workforce, and Xero Payroll UK remain separate
  products with separate operation contracts, preflight, preview, readback,
  drift, ambiguity, capacity, and certification.
- Support Reallocation Cases coordinate organization decisions, exact capacity,
  atomic internal pairs, purpose compatibility, exit coverage, and
  proof-gated charitable succession. Worker requests are nonbinding; Phase 20
  alone delivers accounting.
- Every Legal Entity has an explicit default currency version. Additional
  source-family currency accounts require prospective proof. Per-currency
  closes, effects, statements, reservations, assessments, and corrections never
  merge. External conversion evidence is exact; Asym does not calculate FX or
  show an authoritative converted total.

### D8–D12 projections, planning, integrity, and statements

- Phase 21 owns disposable, rebuildable Missionary Support Activity and
  per-currency Support Balances projections. Phase 31 alone owns subscriptions,
  authorization-bound snapshot/page/change delivery, provider mappings,
  backpressure, and downstream delivery evidence.
- Support feeds are tenant-off-by-default, purpose- and recipient-scoped, apply
  privacy before enumeration, use unlinkable recipient-scoped identifiers, and
  never expose stable hidden Party identifiers or claim downstream deletion.
- Approved Support Plans are optional, immutable, and prospective. Absence is
  not zero. Approved need, Phase 28 goal, recorded activity, Phase 16
  commitments, Finance-confirmed balance, reserve, compensation funding, and
  publication remain separate authorities.
- One finite Support Workspace Publication Profile chooses permitted modules,
  audience, compatible close requirements, notification defaults, and whether
  balances or statements are visible. Personal ordering/collapse affects only
  presentation.
- Every close produces immutable integrity proof over exact scope and cursor.
  Incremental and bounded historical verification create deduplicated,
  cause-owned Integrity Cases with smallest-scope containment. There is no
  force-close, force-balance, manual proof checklist, or generic mark-fixed.
- Support statements derive only from closed occurrences and the Integrity
  Manifest through a deterministic Approved Data View and Phase 18 facts
  package. Publication is automatic when prospectively authorized. Financial
  corrections appear in later closes; same-facts rendering fixes create
  immutable artifact successors. Every missionary statement says plainly:
  **Organization-controlled support activity. Not a tax receipt, bank
  statement, payslip, proof of payment, or statement of funds available for
  withdrawal.**

### D10 and D13–D16 expense truth and handling

- Expense Claim is the smallest independently versioned source fact. Claim
  items and purpose splits conserve exact signed integer minor units in one ISO
  currency. Expense Report Draft and Submission are grouping/review envelopes,
  never aggregate approval, obligation, funding, payment, or accounting truth.
- Private Receipt Evidence Assets and evidence-link versions support exact
  many-to-many coverage. Phase 29 performs private byte custody; Phase 21 owns
  evidence purpose, relationship, access projection, claim use, and provenance.
- The shared tenant AI control plane separates encrypted write-only credential
  revisions from prospective purpose-specific capability bindings. Each binding
  pins provider, connection, model, region, budget, data classification,
  allowed purpose, evaluation, and fallback. OCR/matching/writing output remains
  suggestion-only and human-confirmed.
- The Expense Program is structurally absent until enabled. Bounded Expense
  Governance Profiles and finite approval routes resolve deterministically by
  incurred date and freeze an Approval Assignment Snapshot at submission.
  Human reviewers are conflict-checked and reauthorized; self, AI, automatic,
  timeout, or broad-admin approval is prohibited.
- Organization-card evidence is an optional CSV-first source contract for
  posted organization-card activity. Staging is private and non-authoritative;
  acceptance records exact file/source idempotency, overlap classification,
  row outcomes, assignments, coverage, and append-only adjustments. PDFs, OCR,
  spreadsheets other than certified CSV, pending transactions, personal-card
  browsing, and heuristic deduplication cannot create card truth.
- D10/D13 own claim, policy-decision, Approved Expense Snapshot, and approved-
  coverage truth. The core D16 settlement owns the exact remaining
  Reimbursement Obligation record and append-only qualified succession or
  correction. D15 consumes that record and owns only package, handoff,
  external-payment evidence, and their residual recovery.
- Reimbursement Handoff Packages are content-addressed, immutable,
  schema-versioned, PII-minimized, and artifact-always. Creation or download is
  not release. One Execution Claim assigns each exact obligation-coverage unit
  to one qualified lane. Evidence strength and payment coverage remain exact
  across partial, grouped, returned, reversed, corrected, and reissued results.
- Advance and claimant-repayment policy branches are independently off by
  default. Advance authorization, issuance, readiness, optional advance
  application, residual,
  repayment decision, requirement, occurrence, evidence, and coverage remain
  separate. Every source-qualified Claimant Repayment Occurrence carries exactly
  one immutable source-owned `return_family`: `cash_claimant_return` or
  `expense_advance_return`. The family is never inferred. Both families preserve
  the exact Claimant Repayment Occurrence root, complete Claimant Repayment
  Coverage, and typed residual; `expense_advance_return` additionally pins the
  exact Expense Advance Issuance Occurrence root and unused-advance coverage. A
  genuine reclassification is append-only. Asym does not collect money,
  initiate payroll deduction, adjudicate debt, add interest, or operate
  collections.

### D17–D21 opening, travel, assignments, costs, and noncash support

- Opening activation covers a complete Tenant × Legal Entity × ISO-currency
  cohort. One precedence-explicit Opening Source Package and complete Coverage
  Manifest place every predecessor fact in exactly one `exact_history`,
  `opening_residual`, `reference_only`, `intentional_exclusion`, or `unresolved`
  disposition. `unresolved` or an inadmissible legacy-negative position blocks
  the cohort; exact history preserves whole groups and nonnegative prefixes.
  Certified exact history plus residual Opening Position equals the reconciled
  boundary position without overlap.
- Staging is private, chunked, resumable, non-authoritative, and
  side-effect-dark. One short CAS-guarded Operational Cutover revalidates
  permissions, source, cohort, mappings, control totals, in-flight work, and
  boundary. Phase 30 owns transport; Phase 20 alone owns proved accounting-gap
  delivery. Evidence-bearing D17 activation remains unavailable until the
  certified Phase 29 private-byte and Phase 30 import-session seams exist or are
  pulled forward under their owning contracts.
- Travel Allowance calculations are an optional module inside the single D13
  profile. Actual expenses only is the default. Typed mileage, fixed allowance,
  actual-against-limit, and external calculation modes use immutable certified
  source packages or bounded tenant schedules, deterministic rounding and
  cumulative capacity, and a permanent actual/external fallback.
- Support Assignment Participant Membership records participation only.
  Workspace Access, responsibility, claimant identity, approval, payee status,
  and notification preferences remain separate. Every person uses an own
  identity; spouse/team/leader relationships never grant access implicitly.
- Organization Support Cost Applications are absent unless enabled and apply
  only to their closed residual semantic families. Exact source-final
  occurrences, prospective source contracts, non-overlapping ownership,
  conserving manifests, capacity that never authorizes discretionary overdraft,
  and bounded carryforward prevent
  overlap with assessments, compensation, expenses, processor costs, and
  noncash disposition costs.
- Noncash Support Realization preserves the original gift and source-owned
  disposition truth. Only exact source-final realized proceeds under certified
  lot/purpose/currency coverage create a candidate for D2 admission. Valuation,
  appraisal, retained property, donated services, or provider estimate never
  becomes monetary support.

### D22–D25 prospective authorization, effect recognition, collaboration, and resolution

- Prospective Expense Authorization is independently off by default. When
  enabled, one posture makes it optional or required only for selected expense
  scopes. Request versions, plan evidence, governance resolution, approval
  assignment, human decision, ceiling, conditions, incurrence window, and
  optional separately certified capacity reservation remain immutable and
  separately authoritative.
- Later claims use exact non-overlapping Authorization Coverage. Partial use,
  narrowing, successor amendment, withdrawal, expiry, proved-unused release,
  and in-flight residual handling are append-only and concurrency-safe. Planned
  or approved never means incurred, reimbursable, funded, payable, or paid.
- Expense Field Account Effect Recognition Profiles are prospective and
  source-family-specific. Claimant-reimbursable work roots in the core D10/D16
  settlement and Field Account Funding Coverage, independently of optional
  Advance or Claimant Repayment policy activation. Organization-card, organization cash/
  debit/direct-payment, and certified-payable work instead roots directly in
  D10/D13 approved item/split coverage plus its certified source-owned actual
  coverage; it never requires or fabricates D16 settlement or reimbursement
  coverage. Both root shapes compile into one immutable D23 Effect Basis that
  freezes the winning profile, economic source, exact approved and actual
  coverage, amount/currency authority, and non-reusable effect coverage.
  Advances, support costs, noncash, and compensation retain exclusive owners.
- Expense Collaboration is optional, own-identity, and exact-claim-bounded. A
  responsibility assignment and one-time invitation do not replace Phase 12
  authorization. Prepare-only is default; submission requires immutable
  claimant confirmation or an admitted claimant-authored attestation. Access is
  current-authorized, non-transitive, independently revocable, and cannot
  create review, approval, payment, Field Account, accounting, or public truth.
- Expense Claim Resolution Cases exist only for a closed catalog of proved
  causes. Each case binds exact claim version/scope, root source owner, cause
  contract, governance, evidence, and complete downstream impact. Root-owner
  proof plus a disposition for every affected downstream family is required;
  each owner appends its own correction. Case completion is coordination truth
  only.

### D26–D28 records, production activation, and cumulative admission

- Purpose-owned Records Schedule Contracts contain source, record family,
  jurisdiction, relationship where material, trigger, floor, privacy ceiling,
  access/use, copy, hold, recovery, export, and verified-disposition semantics.
  Tenant bindings are bounded and prospective; immutable per-record resolutions
  and successor-impact coverage prevent timer mutation or cross-owner deletion.
- Tenant custody exports are repeatable, manifest-complete, open-format, and
  source-watermarked. They include canonical JSONL, safe bounded CSV,
  accessible HTML/PDF, authorized originals, relationships, versions, hashes,
  truthful omissions, and owner-domain references. Download, external-copy
  assertion, custody transfer, Asym retention, hold, termination, and disposal
  remain separate facts.
- Core production activation composes current D1–D26 and owning-phase proof into
  one Release Generation, prospective Adoption Plan Version, and
  content-addressed Go-Live Readiness Manifest. It never recreates or waives
  those proofs. Synthetic demo, sandbox, production shadow, cutover, close,
  publication, delivery, posting, reconciliation, payroll, and payment remain
  distinct.
- Final activation occurs only inside D17's idempotent cutover. The disposable
  through-dated readiness projection recomputes current owner, revocation, and
  freshness facts, is exception-first, and is never authority or command input.
  Containment blocks the smallest
  affected new positive/discretionary behavior while preserving history,
  authorized reads, custody exports, established obligations, mandatory
  adverse corrections, and manual/artifact continuity.
- Cumulative Travel Allowance native admission defaults to a source-defined
  clean boundary. One immutable Travel Allowance Cumulative Admission records
  exactly one native opening proof of `clean_boundary_zero` or
  `opening_cumulative_state` for the complete indivisible source group. Native
  admission additionally requires a continuing-source proof of
  `asym_source_complete` or `authoritative_feed_complete`; the independently
  selected operating lane is `native_calculation` or
  `external_calculation_lane`. `external_at_boundary` is a complete manifest
  disposition that selects the external lane and creates no native Admission.
  Missing never means zero, and the external lane is not native-admission proof.
  A later native transition requires a new exact opening proof and continuing-
  source proof at its new boundary. First
  allocation and admission are atomic; late facts cause append-only correction
  and affected-suffix review. D27 may only reference this optional proof; it
  cannot create, waive, repair, gate Core Field Accounts, or reopen D17. Phase
  30 may transport private preparation but cannot define or activate it.
  Unproved groups remain in `external_calculation_lane`.

### Product surfaces and interaction contract

- Mission Control contains configuration, finance-close review, expense review,
  assignments/access administration, provider setup, activation, records
  export, and cause-owned exceptions. The ordinary page shows through-date,
  ready count, exception count, and one primary next action; advanced controls
  appear only when enabled or relevant.
- The missionary workspace is a focused mini-CRM. Its default support view shows
  recorded activity and only authorized, separately labelled through-dated
  balances. Gift status, gross/assessment/net, planning, statements, and
  expense detail use progressive disclosure. It cannot expose finance-only
  source evidence, broad donor data, or staff workflows.
- Copy always names its authority. Approved, reserved, included in support
  balance, handoff prepared, provider draft accepted, payment evidence recorded,
  accounting released, provider readback verified, and reconciled are distinct.
  Unqualified Available, Withdraw, Wallet, Paid, Synced, Exported, Reconciled,
  Done, Guaranteed, or Your money is prohibited.
- Critical journeys meet WCAG 2.2 AA with semantic controls, linked errors,
  keyboard completion, focus restoration, restrained announcements,
  forced-colors and reduced-motion support, 400% zoom/reflow, adequate targets,
  long-locale and RTL resilience, and responsive alternatives to wide tables.
- Mobile capture supports camera/file evidence, offline drafts, visible sync
  state, idempotent resume, and no authoritative offline approval or release.
  Destructive-looking actions use literal consequence previews and append-only
  successors rather than hidden mutation.

### Security, privacy, durability, and operations

- All mutations reauthorize current actor, membership, capability, assurance,
  governance epoch, Tenant, Legal Entity, purpose, Support Assignment, Field
  Account, currency, and evidence access at commit. Queries apply authorization
  before enumeration, arithmetic, counts, pagination, cache construction, and
  diagnostics. Unauthorized and not-found responses do not become an existence
  oracle.
- Provider credentials and tenant AI keys are envelope-encrypted and
  key-versioned, never browser-readable, and absent from job payloads, logs,
  metrics, comments, artifacts, exports, and support tooling. Rotation,
  revocation, quarantine, and destination replacement are serialized and
  prospective.
- Durable work uses transactional outbox admission, identifier-only envelopes,
  semantic idempotency, claims/leases/fences, stale-worker rejection,
  inspect-before-retry ambiguity handling, bounded recovery scans,
  tenant-fair backpressure, and kill switches. External I/O never occurs inside
  core financial transactions.
- Observability correlates source → occurrence → coverage → close → projection
  or package → provider operation → evidence/readback → correction using opaque
  identifiers. Metrics cover lag, blocked scope, coverage gaps, unknown
  outcomes, drift, recovery age, queue fairness, and restore verification while
  excluding secrets and unnecessary PII.
- Performance is workload-shaped and cursor-based. Large imports, closes,
  statements, exports, and opening cohorts are chunked and resumable; no request
  or transaction loads universal history. Cache keys, queues, storage paths,
  exports, and provider operations include complete scope.
- Schema and contract evolution is prospective and versioned. Immutable records
  remain readable under their original schema/policy; successor compilers and
  projections are deterministic. Backups and restores must not resurrect
  disposed bytes, duplicate outbox work, or cross an ownership boundary.

## Testing Decisions

The confirmed primary public seam is `FieldAccountOperationsService`.
Acceptance tests submit typed commands and observe permission-safe queries,
immutable evidence, entries, coverage, artifacts, outbox work, and declared
external-port calls. Routes, UI, jobs, importers, and adapters are wrappers
around this seam rather than alternate business APIs.

### What makes a good test

- Assert externally meaningful financial, permission, workflow, and evidence
  behavior—not private helper calls, repository methods, database row order, or
  app-local implementation detail.
- Drive real domain evaluators, resolvers, compilers, state machines,
  authorization, transactions, and projections through the public service.
- Run money, scope, concurrency, and RLS scenarios against real disposable
  PostgreSQL/Supabase. Static SQL text tests and mocked query chains are
  supplemental only.
- Fake only declared external authorities: Phase-owned source readers, Stripe,
  Gusto, ADP, regional Xero Payroll products, QuickBooks Workforce, Phase 20,
  Phase 29 storage, Phase 30 transport, Phase 31 feed transport, clocks, IDs,
  and durable dispatch.
- Use official frozen fixtures and exact golden requests/readbacks for every
  provider operation. Sandbox and production-shaped probes produce release
  certification evidence; they are not the deterministic unit-test oracle.
- Prove fail-closed behavior first: stale permission, wrong scope, missing
  coverage, incomplete manifest, unknown outcome, conflicting semantic replay,
  unsupported currency/capability, or expired proof cannot widen action.

### Required proof layers

1. **Service scenarios:** every `US21-*` story through typed commands/queries,
   including clean, exceptional, correction, replay, stale, unauthorized, and
   partial-result paths.
2. **Real Postgres contracts:** forced RLS, composite same-scope references,
   append-only enforcement, exact integer conservation, unique/non-overlapping
   coverage, effective intervals, semantic idempotency, CAS, serializable
   races, deadlock retry, claims/leases/fences, outbox atomicity, cutover, close,
   restore, and disposal suppression.
3. **Property/state-machine tests:** double-entry balance, largest-remainder and
   assessment reversals, exact coverage, profile resolution, state transitions,
   currency isolation, opening conservation, cumulative capacity, and stable
   content digests over randomized bounded inputs.
4. **Durable-workflow tests:** duplicate/lost/out-of-order wakeups, restart,
   stale lease, rate limit, tenant fairness, pause/kill switch, unknown external
   outcome, inspect-before-retry, residual recovery, and bounded repair scan.
5. **Provider contracts:** provider/product/region-specific capability,
   preflight, preview, payload, pagination, concurrency, idempotency, timeout,
   readback, drift, and unsupported-operation behavior; no universal adapter
   parity tests.
6. **Artifact and export tests:** exact golden bytes/manifests, authorized
   retrieval, redaction, formula neutralization, repeat download, hold,
   successor, offboarding delta, disposal, and restore non-resurrection.
7. **Security tests:** IDOR and poison identifiers, pre-enumeration filtering,
   principal/membership revocation races, OAuth/AI-secret leakage, invitation
   replay, evidence URL reuse, cache/queue/storage scope, bypass-role denial,
   and log/export redaction.
8. **Authenticated Playwright journeys:** first-class admin/finance and
   missionary projects covering setup, opening/activation, close, statements,
   assignments, expenses, approvals, handoffs, exceptions, correction, exports,
   offline resume, mobile capture, and role transitions against real APIs and
   persistence.
9. **Accessibility evidence:** automated Axe plus keyboard, screen-reader name
   and state, focus/error behavior, 320-pixel and 400% reflow, zoom, touch,
   reduced motion, forced colors, long locales, RTL, and comprehension testing
   for financial language.
10. **Performance and chaos:** zero through production-shaped large cohorts,
    high-cardinality assignments, many currencies, large CSV/export batches,
    noisy tenants, provider/database/storage/workflow outages, and recovery
    without double effect.
11. **Architecture closure:** prove one service writer, one D17 cutover, one D11
    close authority, one lane per handoff coverage unit, no mutable balance,
    no direct QBO/Xero write outside Phase 20, and no dormant support counter or
    Withdraw/Available Funds path feeding Phase 21.

### Decision traceability

| Stories | Primary proof                                             | Decision |
| ------- | --------------------------------------------------------- | -------- |
| 01–18   | service, Postgres, close/readiness, missionary journey    | D1–D2    |
| 19–24   | profile resolver, period coverage, reversal properties    | D3       |
| 25–37   | funding, artifact, provider contracts, ambiguity recovery | D4, D7   |
| 38–42   | authorization, conservation, exit/succession              | D5       |
| 43–47   | currency constraints, conversion manifests, UI            | D6       |
| 48–52   | privacy projection and Phase 31 boundary                  | D8       |
| 53–58   | optional posture, projections, publication permissions    | D9       |
| 59–68   | claim/evidence/AI authority, mobile/manual paths          | D10      |
| 69–73   | occurrence/control invariants and integrity repair        | D11      |
| 74–78   | close-to-facts-to-artifact statement lifecycle            | D12      |
| 79–84   | governance resolution, human approval, bulk safety        | D13      |
| 85–90   | file staging, idempotency, assignments, corrections       | D14      |
| 91–96   | package/release/payment evidence and provider lanes       | D15      |
| 97–101  | advance/repayment settlement and evidence                 | D16      |
| 102–106 | opening coverage, shadow, cutover, monitoring             | D17      |
| 107–110 | travel policy/source/capacity/manual fallback             | D18      |
| 111–115 | assignment membership, Phase 12 access, forced RLS        | D19      |
| 116–118 | source ownership, manifest, nonnegative carryforward      | D20      |
| 119–121 | lot/proceeds/cost coverage and D2 admission               | D21      |
| 122–126 | optional posture, human decision, coverage/reservation    | D22      |
| 127–130 | source-family effect basis/coverage/corrections           | D23      |
| 131–134 | invitation, own identity, claim scope, evidence access    | D24      |
| 135–138 | cause contract, downstream impact, source-owned repair    | D25      |
| 139–143 | schedules, exports, custody, holds, restore               | D26      |
| 144–148 | generation/manifest/shadow/cutover/containment            | D27      |
| 149–152 | opening cumulative state and continuing coverage          | D28      |
| 153–160 | security, accessibility, operations, scale, closure       | D1–D28   |

## Out of Scope

- A general ledger, bank ledger, chart of accounts, trial balance, financial
  statements, fund-accounting close, consolidation, audit opinion, or final
  bank reconciliation.
- Payroll or tax calculation, worker classification, wage entitlement,
  benefits, deductions, payroll submission, contractor payment initiation,
  compensation money movement, or proof of pay.
- Accounts-payable aging, vendor master, bills, purchase orders, procurement,
  cards or wallets issued by Asym, travel booking, direct reimbursement, bank
  credential custody, claimant collections, interest, penalties, or payroll
  deduction initiation.
- Donor ownership of support, worker-owned wallets or bank accounts,
  withdrawals, cash-out, guaranteed pay, donor receipt facts, legal
  restrictions, public earmarking, or any promise that support is available.
- GAAP/tax/legal classification, accountable-plan legal advice, per-diem tax
  assurance, private-benefit adjudication, records-compliance warranty,
  individualized legal advice, or tenant-liability disclaimers.
- A generic financial rules DSL, workflow builder, approval graph, case system,
  provider connector framework, payroll payload, AI endpoint/model proxy,
  arbitrary SQL/formula/script, or mutable priority ordering.
- Direct QBO/Xero accounting delivery, provider posting, FX translation,
  revaluation, or final reconciliation; those remain Phase 20/provider truth.
- Phase 29 private-byte storage implementation, Phase 30 generic migration
  transport, Phase 31 feed transport, or Phase 34 general workflow ownership.
- Making AI, GPS, bank feeds, payroll providers, external support feeds,
  support plans, commitments, balance publication, assessments, expense
  governance, preauthorization, card import, advances, retained currencies,
  support-cost applications, or native cumulative travel calculation mandatory
  or default-on for Core. These remain the explicitly optional modules defined
  above.
- Personal-card batch browsing, PDF/OCR/XLSX-derived card truth, asset custody
  or trading, gain/loss accounting, general benefits administration, or broad
  donor/contact CRM exposure in the missionary workspace.
- Whole-history replay, dual write, destructive rollback, mutable cutoffs,
  fuzzy identity/matching, cross-currency balance totals, discretionary
  overdrafts, suppression of a mandatory adverse correction because it exposes
  a deficit, direct database repair, force-close/force-balance, or hidden partial
  success.

## Further Notes

### Canonical repository sources

- PRD: `docs/prds/sitestacker-parity/phase-21-field-accounts.md`
- Decisions: `docs/prds/sitestacker-parity/phase-21-field-accounts-decision-log.md`
- Research: `docs/prds/sitestacker-parity/phase-21-mission-dashboard-product-research-evidence.md`
- OpenSpec: `openspec/changes/add-field-account-operations/`
- ADRs: `docs/adr/0090-*` through `docs/adr/0117-*`
- Shared vocabulary and ownership: `CONTEXT.md`, the Phase 1 ownership matrix,
  roadmap, phase map, platform intent specs, and applicable Phase 3/10/12/13/
  15/17/18/20 contracts.

OpenSpec is the canonical feature-definition unit. This PRD is the complete
product and implementation narrative. The decision log preserves every
ratified D1–D28 detail and adversarial disposition; research files preserve
evidence, not runtime authority.

### Live implementation graph

- Approved specification issue: [#1108](https://github.com/Asymmetric-al/core/issues/1108)
  remains unchanged and is not part of the implementation hierarchy.
- Implementation epic: [#1109](https://github.com/Asymmetric-al/core/issues/1109).
- Lane epics: [#1110](https://github.com/Asymmetric-al/core/issues/1110)
  through [#1120](https://github.com/Asymmetric-al/core/issues/1120), covering
  P21-01 through P21-101.
- Every implementation ticket is discoverable with `ready-for-agent`, but its
  native GitHub blocked-by relationships remain authoritative. The label never
  authorizes dispatch or permits an agent to bypass an unresolved prerequisite.
- Ticket bodies are bounded execution slices. When a summary is shorter than
  this repository contract, this OpenSpec change, the accepted ADRs, and this
  PRD control in the repository source-of-truth order.

### Existing versus FORWARD

No Phase 21 runtime, database model, production migration, authenticated
missionary E2E project, or provider certification exists at publication time.
Current missionary support projections and dormant Available Funds/Withdraw UI
are implementation conflicts to replace, not compatibility contracts.

Activation is granular. Core Field Accounts require the exact D27/D17 cohort
proof. Optional capabilities remain absent or use their safe manual/external
lane until their exact owning-phase dependencies and production certifications
exist. A missing optional provider or future phase never authorizes a shim,
inferred truth, weakened invariant, or false launch claim.

The approved implementation graph above is published, but no Phase 21 runtime
is thereby implemented, dispatched, or production-authorized. After explicit
founder dispatch, agents may begin only slices whose live blockers are satisfied
and must preserve every governing contract.
