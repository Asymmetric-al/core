# Design: Field Account Operations

## Decision Authority

This design implements the ratified Phase 21 decisions D1–D28 without reopening
them. This active OpenSpec change is the canonical feature-definition unit. The
Phase 21 PRD supplies the complete implementation narrative, while the decision
log and accepted ADRs preserve exact founder rulings and reasons. Existing
OpenSpec platform principles, boundaries, surfaces, identity/access behavior,
and owning-phase capability contracts remain binding.

Resolve any apparent conflict through the repository source-of-truth order and
the single canonical priority ladder in
`openspec/specs/platform-principles/spec.md`; do not create a Phase 21-local
priority ladder. A local implementation may not weaken a settled invariant
because an optional dependency or provider is unavailable.

## Public Application Boundary

`FieldAccountOperationsService` is the only Phase 21 application boundary. It
is a cohesive service with explicit typed commands and permission-safe queries,
not a mega-function or generic workflow engine.

The service is constructed from trusted server-resolved context:

- validated principal and actual actor;
- Tenant and environment;
- Phase 12 policy decision, governance epoch, purpose, and current assurance;
- Legal Entity;
- Support Assignment, Field Account, and ISO currency where applicable;
- request/correlation identity; and
- explicit dependency ports.

Client or job payloads may carry opaque target/source identifiers, expected
versions, semantic operation identities, and requested action data. They may
not assert authoritative Tenant, actor, role, capability, membership, Legal
Entity, purpose, currency authority, provider capability, or assurance. Every
mutation re-resolves and reauthorizes at commit. Queries filter before
enumeration, arithmetic, count, pagination, cache, or diagnostic construction.

Command families are bounded to the product contract:

- Support Assignment, participant membership, access-intent, and publication
  configuration;
- Field Account/currency setup and retirement;
- support-source evaluation, admission, redesignation, correction, and close;
- assessment profile and determination;
- support planning and publication;
- compensation funding, coverage, package, delivery, and result evidence;
- reallocation, exit, charitable succession, and correction;
- expense claims, evidence links, governance, review, approved snapshots,
  prospective authorization, collaboration, resolution, and effect recognition;
- organization-card evidence, advances/repayments, travel calculation,
  reimbursement handoff, support costs, and noncash realization;
- integrity verification, repair, and statement facts;
- opening position, operational cutover, production activation, and cumulative
  allowance admission; and
- records schedule resolution and custody export.

Query families expose separately authoritative projections for finance,
administration, missionary workspace, claimants/helpers/reviewers, operations,
statements, exports, and future feed composition. They never return the same
unqualified status for distinct authorities.

Every command returns a discriminated outcome: applied, exact replay, stale,
semantic conflict, blocked, invalid, not permitted or not found, or external
outcome unknown. Partial provider results contain exact per-operation outcomes
and residual coverage. A generic success/failure boolean is insufficient.

Routes remain thin schema/auth/HTTP adapters. Durable functions, schedulers,
batch processors, and repair scans dispatch identifiers and invoke the same
service commands. No job, adapter, import, database trigger, UI mutation, or
service-role script may implement separate business arithmetic or write Phase
21 truth directly.

## Bounded Contexts And Authority Map

### Source and contribution authority

Phase 13 owns posted contributions, legal donor, Designation, accepted purpose,
gift date, and exact monetary allocation source. Phase 15 owns offline-source
and noncash disposition facts. Phase 21 consumes exact versioned contracts and
never reconstructs source meaning from tables, current labels, provider names,
receipt values, or mutable projections.

### Field Account authority

Phase 21 owns Support Assignments; immutable-currency Field Accounts; balanced
Field Account Occurrences and control entries; admission, assessment, close,
integrity, correction, opening, and support-balance projections; expense
workflow and operational effects; compensation/reimbursement funding and
handoff meaning; and Phase 21 record/export meaning.

A Field Account is an organization-controlled operational subledger. It is not
a donor asset, worker wallet, bank account, contribution total, donor receipt
fact, GL account, payroll/AP ledger, payment record, or final reconciliation.

### Accounting, provider, artifact, and transport authority

Phase 20 alone owns Accounting Posting Intents, Canonical Accounting Effects,
Accounting Releases, QBO/Xero delivery, readback, drift, and final accounting
handoff evidence. QBO/Xero owns books, periods, FX accounting, and final bank
reconciliation.

External payroll/AP providers own classification, calculation, approval,
submission, execution, completion, and payment. Phase 21 provider operations
are draft/input or readback/artifact operations only when exactly certified.

Phase 18 owns rendered documents and their exact artifact bytes from immutable
approved facts, including access and lifecycle under its own contract. Phase 29
owns physical private-byte lifecycle for Phase-21-owned evidence and D26 export
packages: custody, holds, disposal execution, backup/restore suppression, and
authorized byte delivery. Phase 21 owns the evidence relationship, purpose,
coverage, digest, record schedule, and business semantics. Independently owned
artifacts remain under their owner and enter D26 only by authorized reference or
retrieval. Phase 30 owns inbound transport/staging; Phase 21 owns admission.
Phase 31 owns feed subscriptions, transport, cursors, provider mappings, and
delivery evidence.

### Planning, CRM, and follow-up authority

Phase 16 commitments, Phase 28 support-raising goals/coaching/contactability,
Phase 21 Approved Support Plans, recorded activity, balances, reserves, and
compensation funding remain independent. Mission Control tasks and
notifications coordinate follow-up but never prove financial repair, approval,
payment, close, or delivery.

## Canonical Domain Model

### Scope roots

Every financial or evidence-bearing root carries explicit Tenant, Legal Entity,
purpose, and ISO currency where money exists. Field Account roots also carry
Support Assignment and Field Account. Participant, claimant, provider,
destination, source family, policy, and operation scope are first-class columns
or same-scope relationships, not unvalidated JSON metadata.

Structural identities use stable opaque IDs. Economic identity uses source and
semantic identities independent of retry, job, batch, close, policy version, or
provider request. Human labels are presentation only.

### Support Assignment and access

Support Assignment is the organization-controlled subject. It supports zero,
one, or many participants and one or many separately scoped currency accounts.
Participant Membership is prospective, effective-dated, append-only-corrected,
and records participation only.

Phase 12 remains the sole policy decision point for Workspace Access.
Operational responsibility, claimant identity, review/approval authority,
provider participant/payee mapping, recipient status, and notification
preferences use distinct versioned records. Invitations convey no access until
accepted by an exact authenticated principal and current policy grants it.

Coarse forced RLS enforces Tenant/Legal-Entity isolation and blocks direct
public financial reads. Server projections apply the exact assignment,
participant, purpose, capability, and field policy. Fine grants do not live in
JWT arrays, client state, Realtime payloads, or assignment-aware RLS policy
graphs.

### Field Account occurrences and entries

Each Field Account has immutable ISO currency and version. One occurrence
contains one semantic operation and writes a balanced group of signed
integer-minor-unit entries within one Tenant, Legal Entity, purpose, Support
Assignment, Field Account, and currency partition. A bounded control-side entry
is persisted independently so the sum can be proved without an inferred
counterparty.

The database enforces:

- balanced occurrence groups;
- checked integer arithmetic and currency consistency;
- same-scope composite references;
- immutable committed facts;
- one semantic identity per source slice/operation;
- exact, non-overlapping, amount-conserving coverage;
- derived Field Account capacity that never authorizes a discretionary overdraft;
- effective-interval exclusion where overlap is invalid;
- append-only successor/correction lineage; and
- one writer path through command-only privileges.

Read projections may be rebuilt. Immutable occurrences, entries, manifests,
coverage, policy versions, decisions, evidence identities, and provider
operations may not be rebuilt into a different historical answer.

### Support cycles and close

Support Cycle boundaries are half-open business-time intervals in the tenant's
configured timezone. Monthly is default; certified biweekly cadence is allowed.
Cycle display states are Collecting, Finance review, and Closed. Internal
readiness is separately derived.

Source evaluation creates disposable Support Allocation Candidates and a
Support Close Readiness Projection. The prospective Support Allocation
Readiness Policy returns ready for close, waiting for evidence, needs finance
review, or ineligible for this close. The exact provider/source evidence remains
labelled; it does not become support availability.

The close command prepares outside the transaction, then inside one short
transaction revalidates actor and policy epoch, boundary, source versions,
admission coverage, policy/profile versions, source and group completeness,
account fences, reservations, correction continuity, and the captured monotonic
ingestion cursor. It commits the Support Cycle Close, Integrity Manifest,
exact occurrence/coverage set, resulting balance projection inputs, and
identifier-only outbox admissions. It performs no live provider lookup,
artifact rendering, queue call, or external write.

Concurrent/double close converges on one exact result. Stale preparation cannot
silently expand; it is rejected or shrinks only under an explicit reviewed
contract. Late positive facts wait for a later close. Mandatory adverse facts
append through the governed correction path even under quarantine.

### Assessments and optional policy resolution

No administrative assessment is a real immutable default policy version.
Optional profiles use a closed method catalog and a code-owned specificity
lattice. Exactly one profile wins for each source allocation or period effect;
combined percentage/service behavior is one profile with typed components.

Source-level percentages and period-level minimum/flat/cap/service components
have separate coverage and entries. Determination freezes source, assignment,
profile, method, period, components, rounding, and result. Corrections reverse
the exact affected components proportionally and append period-level successor
effects when necessary.

Other prospective modules use the same bounded design principle: immutable
profile versions, code-owned precedence, exact effective intervals,
production-shaped preview, CAS activation, deterministic one-winner resolution,
and no tenant-authored scripts/formulas/order.

## Expense And Operational Effect Model

### Claim-level truth

Expense Claim is the stable occurrence; Expense Claim Version is the immutable
asserted fact set. Items and purpose splits conserve the claim total in exact
source currency. Report drafts/submissions group claim versions for human work
but own no aggregate approval or payment status.

Evidence links are immutable versioned many-to-many relationships. Receipt/OCR
and match outputs are suggestions with provenance, confidence, provider/model,
input digest, purpose, and human decision. A material claim change creates a
successor version and never overwrites an Approved Expense Snapshot.

### Governance and review

The Expense Program is absent when off. Activation pins exact Legal Entity,
timezone, currencies, source families, claimant admission, policy/route schemas,
capabilities, preview, and tested coverage.

One incurred-date Expense Governance Profile wins at item/split scope. An
Expense Report Submission freezes current claim versions, resolutions, and
Approval Assignment Snapshots. Human Review Actions revalidate current
authority and conflict. Ordinary independent review is default; conditional
project/finance/specialist routes, bounded delegation/reassignment, and named
small-tenant oversight are explicit. No self, AI, timeout, or automatic
approval exists.

Line results are approved, declined, needs information, or policy exception.
Only clean compatible coverage can bulk approve. Material change previews show
before/after, affected evidence/purpose/currency, and downstream consequences.

### Approved snapshots, obligation, effects, and payment evidence

An Approved Expense Snapshot freezes only the approved source fact. A
Reimbursement Obligation, Field Account Funding Coverage, Expense Settlement
Determination, Expense Field Account Effect Basis/Coverage/Effect,
Reimbursement Handoff, External Payment Occurrence, Phase 20 source handoff,
and QBO/Xero result are independent successor authorities.

Effect recognition is prospective and source-family-specific. The exact
qualification evidence differs for claimant-paid reimbursement, organization
card, executed organization cash/direct payment, and certified organization
payable. Source-owned advances, support costs, noncash realization, and
compensation cannot be reclassified into the generic expense lane.

One serializable settlement/effect transaction assigns each approved slice to
exact non-overlapping coverage and dispositions. Capacity cannot create an
implicit partial. Reservations and debits are not subtracted twice. Corrections
preserve incurred, approval, obligation, qualification, close, payment,
accounting-effective, and provider-posting dates separately.

### Optional prospective authorization and collaboration

Prospective authorization is absent unless the tenant chooses available when
helpful or required for selected expense scopes. Request, evidence, governance,
approval assignment, decision, ceiling, currency, purpose, window, conditions,
and optional capacity reservation are independently immutable. Later claim
coverage is exact and non-overlapping; approvals narrow only or use a
requester-authored successor.

Expense Collaboration Assignment records responsibility and an operation
ceiling for one exact claim/scope. Invitation acceptance, current Phase 12
authorization, evidence-access projection, and claimant confirmation remain
separate. Prepare-only is default. Every action preserves claimant, helper,
preparer, submitter, confirmer, reviewer, approver, economic payer, beneficiary,
and actual principal.

### Resolution cases

Expense Claim Resolution Cases are exceptional and use a closed cause catalog.
The case pins exact claim version and item/split/purpose/currency scope, root
source and owner, cause-contract version, governance/evidence references, and a
complete Downstream Impact Manifest. Same-cause semantic duplicates converge;
distinct scopes remain distinct and may group only in presentation.

Case completion requires root-owner proof plus a disposition for every affected
downstream family. The case appends coordination/provenance only; each owning
domain appends its own correction. Healthy and separable coverage continues.

## Specialized Source And Handoff Contracts

### Compensation and reimbursement adapters

Compensation and reimbursement packages are immutable, content-addressed,
schema-versioned, PII-minimized, artifact-always records. Package generation,
preview, protected audit retrieval, reference download, release, provider
operation, readback, external payment evidence, and accounting delivery remain
separate states.

An Execution Claim assigns each exact non-overlapping coverage unit to exactly
one executable lane. Delivery Profiles pin Tenant, Legal Entity, provider
organization/product/country/environment, participant/payee reference,
currency, cadence/cycle, component, certified operation, and external execution
owner. Phase 20 posting owner is pinned separately.

Each provider adapter exposes only provider-native typed operations. Shared
kernel behavior is limited to lifecycle conformance: preflight, preview,
idempotency, concurrency claim, rate limiting, unknown outcome,
inspect-before-retry, exact readback, drift, residual-only successor recovery,
backpressure, and kill switch. A universal payroll/reimbursement payload,
adjacent-object substitution, destructive overwrite, blind retry, or automatic
fallback is prohibited.

### Card evidence

Organization-card import is optional, Legal-Entity/source/currency/profile
scoped, and CSV-first. Phase 30/private storage may transport/stage bytes, but
Phase 21 validates the immutable source profile, file digest, exact source
occurrence identity, overlap, row structure, posted/finality state, assignment,
and disposition.

Acceptance is atomic at manifest level while structurally safe rows may advance
individually and unsafe rows remain explicitly classified. Every row is
accepted, duplicate exact replay, overlap/conflict, needs mapping, invalid,
pending/ineligible, or source adjustment. There are no silent drops.

### Travel and cumulative capacity

Travel is a typed calculation module in the winning expense profile. Source
packages and tenant schedules are immutable and individually certified.
Calculations pin jurisdiction/location, claimant/relationship, purpose, policy
period, vehicle/trip/day/meal/long-stay/band/cap, units, coverage, rounding, and
source versions. Preview does not consume capacity.

Cumulative capacity uses stable source-defined Capacity Key Contracts and
serialized allocations. One immutable Travel Allowance Cumulative Admission
precedes first native use. Native activation requires both one opening disposition
(`clean_boundary_zero`, `opening_cumulative_state`, or `external_at_boundary`)
and one continuing-source disposition (`asym_source_complete`,
`authoritative_feed_complete`, or `external_calculation`) for a complete
indivisible group. Clean-boundary zero is affirmative proof; missing is unknown.
Admission and first allocation commit atomically. Uncertain groups stay on exact
external calculation. D27 may reference but never create, waive, reinterpret,
repair, or make Core activation depend upon this optional D28 proof.
Phase 30 may transport private preparation but cannot define source meaning or
activate native calculation.

### Support costs and noncash realization

Semantic family, not configuration availability, selects the exclusive owner.
Organization Support Costs are a residual closed lane, never fallback for
assessment, compensation, expense, processor, noncash, AP, or accounting facts.
Source observation and source-final economic occurrence are distinct. One
manifest conserves exact same-currency application, organization-absorbed
disposition, bounded carryforward tranches, and unresolved remainder; unresolved
target cannot enter close.

Noncash realization preserves the original contribution and source-owned asset
disposition. Exact source-final lot-to-proceeds coverage, cost treatment,
purpose, currency, finality, and correction lineage creates one Realized
Support Basis candidate. D2 admission and D3 assessment apply only to realized
monetary basis. Valuation or provider estimate is never cash.

## Opening Cutover And Production Activation

Opening Position is a residual boundary fact, not a mutable balance import. The
activation cohort is complete for one Tenant, Legal Entity, and ISO currency
and enumerates every in-scope Support Assignment/Field Account and source
family. The precedence-explicit Opening Source Package and Coverage Manifest
classify every predecessor source fact into exactly one of `exact_history`,
`opening_residual`, `reference_only`, `intentional_exclusion`, or `unresolved`.
`unresolved` blocks the complete cohort, intentional exclusion requires exact
non-balance-bearing proof, and reference history is structurally inert. Exact
history plus residual equals the reconciled control position. Exact history
preserves whole atomic groups and nonnegative per-account prefixes; a legacy
negative position cannot become an Opening Position, be clamped, or receive a
plug and remains cohort-blocking until its actual source owner proves a valid
resolution.

Preparation is chunked, resumable, private, non-authoritative, and
side-effect-dark. Shadow reconciliation can exercise production-shaped reads
and calculations but cannot write financial rows, dispatch notifications,
create downstream documents, call providers, or establish authority.
Evidence-bearing activation remains unavailable until the certified Phase 29
private-byte/access seam and Phase 30 import-session transport/staging seam
exist or are pulled forward under those owning contracts. Phase 29 owns those
opening-source bytes, and Phase 30 owns their transport; neither defines opening
meaning, reconciliation, admission, or activation.

The one Operational Cutover is a short idempotent CAS-guarded transaction at an
exact source-family half-open boundary. It revalidates actor, access epoch,
cohort, source completeness, mappings, control totals, in-flight work, manifest,
release generation, and revocations. It commits opening occurrences, coverage,
authority boundary, and outbox admission. It is the only production activation
state.

D27 composes evidence through one Release Generation, prospective Adoption
Plan, and content-addressed Go-Live Readiness Manifest. Optional capabilities
bind independently and cannot gate already-safe Core Field Accounts. A named
pilot narrows publication only. Operational readiness is a disposable
through-dated projection recomputed from current owner, revocation, and
freshness facts, with no activation or financial authority and no validity as
command input; containment is cause-owned and smallest-scope.

Late predecessor facts create idempotent Opening Position Corrections and
manifest successors. Monitoring detects overlap/gap after activation. There is
no dual write, whole-history replay, giant transaction, downstream side-effect
replay, destructive rollback, or universal claim that an external system is
locked.

## Records Schedules And Custody Export

Records Schedule Contracts are versioned by source purpose, record family,
jurisdiction, Legal Entity, and relationship where material. They define exact
triggers, preservation floors, privacy ceilings, access/use, copy classes,
holds, recovery, export, and verified disposition. Tenant bindings may choose
only bounded prospective options and cannot weaken a floor or exceed a privacy
ceiling.

Per-record Retention Resolution and Successor Impact Manifest are immutable.
Phase 29 executes private-byte operations and records copy inventory. A hold,
export, download, external-copy assertion, verified custody transfer,
termination, Asym retention, records-only window, and disposal are independent
facts.

Export generation is chunked, resumable, and manifest-complete. Canonical JSONL
is authoritative for machine-readable records; bounded safe CSV is a
spreadsheet aid; accessible HTML/PDF is human/print presentation; authorized
originals retain their own hashes. Every part is ordered, content-addressed,
watermarked, scope-bound, and records truthful omissions and owner references.

## Persistence Concurrency And Durable Execution

The canonical store uses normalized append-only roots, version and coverage
tables, and disposable projections. Critical constraints and transitions are
database-enforced rather than relying on route validation alone. SECURITY
DEFINER helpers are narrowly owned, set search path explicitly, validate full
scope, and are unavailable to public/authenticated roles except through
approved server commands.

Financial transactions are short and deterministic. External I/O, byte
generation, AI/provider calls, and queue calls occur outside them. Transactional
outbox rows commit with local truth; dispatch and work claims use identifier-only
envelopes, semantic idempotency, leases/fences, stale-worker rejection, bounded
attempts, and durable recovery scans.

Concurrency policies are explicit:

- serializable or equivalently fenced close, settlement, effect, opening, and
  cumulative-capacity transactions;
- deterministic lock ordering within one exact scope;
- expected-version CAS for policy, review, profile, assignment, activation, and
  mutable draft commands;
- unique semantic keys for exact replay versus semantic conflict;
- operation-level provider idempotency and inspect-before-retry;
- residual-only successor claims after positive missing/failed proof; and
- no global Tenant lock when a smaller scope is safe.

Work is tenant-fair. New positive work, mandatory adverse corrections,
readback/ambiguity recovery, privacy containment, and records retrieval have
separate protected capacity. One large tenant or export cannot starve smaller
tenants or correctness work.

## Product Surfaces

### Mission Control

Mission Control is the operational home. Setup uses guided defaults and reveals
advanced settings only after staff choose the relevant feature. Daily Field
Accounts work is one quiet workspace organized by Support Cycle through-date,
ready work, exceptions, and recent closes—not a dense ledger by default.

Each exception card says what happened, which authority detected it, exact
scope, what remains safe, owner, evidence needed, and one literal next action.
Bulk actions operate only on clean compatible items and preview omissions and
mixed outcomes. Dangerous actions use exact consequence review, not generic
confirmation.

### Missionary workspace

The missionary workspace presents a focused support mini-CRM. Default content
is recent recorded activity, only authorized published balances with ISO
currency and through-date, and the next relevant task. Detailed gift state,
assessment breakdown, planning, statements, expense claims, and explanations
are secondary/on-demand.

The workspace never exposes control entries, source evidence, provider secrets,
staff policy configuration, broad donor/contact detail, another assignment, or
an authoritative converted total. It never says Available Funds, Withdraw,
Wallet, Your money, guaranteed, payable, payroll-ready, reimbursed, paid,
posted, synced, or reconciled unless an exact owning authority supports the
qualified statement.

### Accessibility mobile and offline behavior

Critical journeys are WCAG 2.2 AA, keyboard complete, screen-reader coherent,
focus/error safe, reflowable at 320 CSS pixels and 400% zoom, robust in forced
colors/reduced motion, and resilient to long locales/RTL. Status does not depend
on color alone. Wide finance tables have responsive list/detail alternatives.

Mobile expense capture uses native camera/file affordances, large targets,
local draft persistence, visible offline/sync state, and idempotent resume.
Authoritative approvals, releases, closes, provider execution, and access
changes require online commit-time reauthorization.

## Security Privacy And Observability

Credentials and tenant AI keys use envelope encryption, versioned key
references, write-only replacement, serialized rotation, and immediate local
quarantine. Secrets never appear in browser payloads, job envelopes, logs,
metrics, audit comments, artifacts, exports, or support tooling.

Evidence access applies Phase 3/10 classification, Phase 12 authorization,
purpose, assignment/claim scope, copy class, retention/hold, and current
revocation before a short-lived non-cacheable retrieval. Signed URLs are not
reusable authority. Restricted workers and sensitive evidence use subtractive
policies and privacy-safe projections.

Audit records capture actual actor/principal, scope, semantic action, source and
policy versions, before/after digest, outcome, reason, and correlation without
copying sensitive payloads. Telemetry uses opaque identifiers and coarse safe
dimensions. Correlation follows source → occurrence → coverage → close →
projection/package → provider/evidence → correction.

Metrics and alerts cover source/ingestion lag, admission gaps, close readiness,
integrity failures, stale reviews, unknown provider outcomes, drift, recovery
age, lease contention, queue fairness, artifact/export failure, RLS denial
anomalies, and restore verification. Healthy work is quiet; alerts are
actionable and deduplicated by root cause.

## Test Architecture

The confirmed primary seam is `FieldAccountOperationsService`. Scenario tests
submit typed commands and observe public query projections, immutable records,
outbox work, exact artifacts, and declared external-port calls. They do not
assert private helper order or database row shape.

Use real disposable PostgreSQL/Supabase behavior for RLS and role bypass,
same-scope constraints, immutability, coverage, integer conservation,
effective intervals, semantic idempotency, CAS, serializable races, lock order,
claims/leases/fences, outbox atomicity, close, cutover, restore, and disposal
suppression. Direct SQL/catalog tests are reserved for guarantees not safely
observable through service behavior; migration string tests are supplemental
only.

Use deterministic contract fakes only at declared external ports. Every
provider/product/region has its own contract suite with frozen official
fixtures, golden request/readback, pagination, malformed responses, rate
limits, timeout after possible commit, exact lookup, drift, and residual
recovery. Sandbox and production-shaped certification remain release evidence,
not the unit oracle.

Route and job tests prove validation, context construction, dispatch envelope,
claim/retry, and delegation. Authenticated Playwright projects for Mission
Control and missionary surfaces prove complete user journeys through real API
and persistence. Component tests cover semantic names/states, progressive
disclosure, responsive alternatives, and prohibited copy. Accessibility,
offline, localization, performance, chaos, migration, restore, and architecture
closure are release requirements.

## Production And Release Gates

Core activation requires all of the following for an exact cohort:

1. schema and migration verification on clean and production-shaped data;
2. full real-Postgres financial, tenant-isolation, permission, concurrency, and
   restore suites;
3. one proven `FieldAccountOperationsService` writer and no compatibility
   balance path;
4. source-family contracts, purpose mappings, support assignments, currencies,
   zero/default policies, and complete opening census;
5. D17 Opening Source Package, Coverage Manifest, shadow reconciliation,
   control totals, and exact half-open boundary;
6. D27 Release Generation, Adoption Plan, Go-Live Readiness Manifest, final
   reproof, and literal cutover action;
7. first-close D11 integrity proof and authorized D9/D12 publication behavior;
8. load, tenant-fairness, chaos, observability, kill-switch, privacy,
   accessibility, comprehension, and operational runbook evidence; and
9. rollback-by-containment and append-only correction proof, not destructive
   database rollback.

Optional capability activation additionally requires its exact predecessor
contracts, complete profile/assignment coverage, external authority and scope,
provider/region/operation certification, production-shaped preview, privacy and
records binding, failure/manual continuity, and targeted release gate. Failure
of one optional binding cannot weaken or disable safe Core Field Accounts.

Multi-provider compensation launch requires at least two distinct currently
production-authorized direct-write adapters. Readback/artifact adapters remain
honest alternatives but do not satisfy that launch claim.

## Explicit Non-goals

- No general ledger, accounting close, bank reconciliation, payroll/AP engine,
  money movement, worker classification, tax/legal engine, or payment proof.
- No donor/worker-owned wallet, withdrawal, public earmark, mutable balance,
  discretionary overdraft, suppression of a mandatory adverse correction that
  exposes a deficit, converted balance total, or implicit USD/FX.
- No arbitrary financial policy DSL, workflow graph, generic case/task truth,
  universal provider adapter, generic AI proxy, or tenant-supplied executable
  logic.
- No direct QBO/Xero delivery outside Phase 20, private-byte ownership outside
  Phase 29, inbound transport ownership outside Phase 30, or feed transport
  outside Phase 31.
- No direct client database mutation, relationship-derived authority, fine
  grants in JWT/client state, raw financial Realtime payload, shared login,
  transitive delegation, or broad administrator bypass.
- No force close/balance, tolerance plug, destructive edit/rollback/delete,
  dual write/delivery, blind retry, whole-history replay, fuzzy identity or
  matching, silent partial success, or status conflation.
