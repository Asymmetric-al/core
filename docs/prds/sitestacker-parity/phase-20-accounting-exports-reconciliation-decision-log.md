# Phase 20 Accounting Exports & Reconciliation — Grooming Decision Log

This is the working decision record for the Phase 20 `grill-with-docs`
session. It is not the Phase 20 PRD, implementation specification, issue set,
or authorization to build.

## D1 — Coordinated bounded contexts through one accounting doorway

**Status:** Ratified and adversarially hardened on 2026-07-25.

Phase 20 is the sole accounting handoff and operational settlement/tie-out
doorway. It owns source-labelled processor-settlement coverage, Expected Bank
Arrivals, bounded Bank Match, provider-neutral balanced Accounting Releases,
tenant accounting mappings, immutable accounting artifacts, QBO/Xero delivery
and readback evidence, and accounting exceptions. QBO/Xero remains
authoritative for the final books and bank reconciliation.

Phase 21 owns missionary receipt capture, substantiation, expense reports,
submission and approval, reimbursement, field-account effects, and the
missionary expense experience. An approved Phase 21 expense may enter Phase 20
only through the accounting doorway as an immutable, tenant- and legal-entity-
bound accounting-ready fact. Phase 21 does not build a second QBO/Xero
Accounting integration, and Phase 20 does not approve expenses or alter
field-account truth.

### Adversarial hardening

- The handoff is one-way: Phase 20 consumes an approved source fact and returns
  accounting-delivery evidence linked to that fact; it never becomes the
  expense source of truth.
- Source approval, field-account effect, accounting readiness, provider
  submission, provider acceptance/readback, Phase 20 Bank Match/provider-effect
  evidence, and final QBO/Xero reconciliation remain separate authorities. The
  UI may derive one readable progress summary but must not persist one shared
  mutable status.
- Phase 20 defines only the minimum accounting doorway needed by its canonical
  projection. It must not prebuild speculative expense tables, OCR, receipt
  storage, approval workflows, reimbursement services, or missionary screens.
- An unapproved, superseded, cross-tenant, wrong-entity, wrong-currency, or
  stale-version expense fact fails closed before accounting projection.
- Approved economic facts do not silently change. Pre-release accounting
  coding follows later mapping decisions; after release, corrections use new
  compensating accounting work and preserve the original evidence.
- Expense evidence remains private and purpose-scoped. Accounting delivery
  receives only the approved artifact and metadata that the selected
  destination contract requires.
- Contributions, processor settlements, bank matches, approved expenses,
  field-account entries, accounting projections, and external GL records
  remain distinct facts even when staff see them in one coherent workflow.

### Explicit non-goals from D1

- No combined Phase 20 accounting-and-expense aggregate.
- No duplicate provider connector owned by Phase 21.
- No expense approval inferred from card matching, OCR, receipt presence, or
  accounting-provider acceptance.
- No export of commitments, soft credit, expected support, or unapproved
  expenses as cash.

## D2 — Direct integrations backed by artifact-always accounting

**Status:** Ratified and adversarially hardened on 2026-07-25.

Phase 20 delivers direct QuickBooks Online and Xero integrations over one
immutable Accounting Release. Every release retains an immutable,
human-inspectable and machine-verifiable Accounting Evidence Artifact,
regardless of how it is delivered. The evidence artifact is the permanent
audit and recovery representation; it is not required to be a provider import
file.

For a particular release, direct API delivery and staff-mediated provider
import are mutually exclusive delivery lanes. The chosen lane must produce
equivalent accounting intent from the same frozen release, but provider
payloads and posting shapes remain provider-native. QuickBooks Desktop and IIF
are outside Phase 20.

An immutable, versioned Provider Delivery Plan binds the release to one exact
tenant, legal entity, accounting destination, provider connection, posting
date, currency, and payload digest. It freezes references or digests for the
governing D4 policy/effect, D5 Posting Profile/recipe, D6 mapping and typed
binding set, D7 or D8 Carrier Plan, compiler, adapter, and provider-contract
versions before delivery begins. It does not author those authorities.
Delivery progress is tracked per operation, not as one batch boolean.

### Separate durable authorities

The product must preserve five different truths:

1. **Accounting Release** — the frozen balanced accounting intent.
2. **Accounting Evidence Artifact** — the immutable manifest and audit proof
   for that release.
3. **Delivery Operation** — each attempted external write and its evidence.
4. **External Provider Record** — the record QBO or Xero currently reports.
5. **Reconciliation Verdict** — Asym's comparison of expected intent with
   provider evidence.

The UI may summarize these truths, but neither storage nor API contracts may
collapse them into one mutable `exported`, `synced`, or `reconciled` status.
Provider acceptance is not reconciliation.

### Adversarial hardening

- Direct delivery, manual import delivery, artifact generation, provider
  acceptance, and reconciliation are separate events. Downloading an audit
  package does not mark a release delivered.
- A release cannot use both delivery lanes. Changing lanes requires an explicit
  superseding release or a proof-gated recovery decision that demonstrates no
  duplicate provider posting can result.
- Provider operations use durable Asym operation identifiers, deterministic
  provider references where supported, exact payload digests, and immutable
  attempt evidence. QBO `requestid`/`DocNumber` and Xero's short idempotency
  response window are not treated as permanent exactly-once guarantees.
- Timeout-after-submit, partial acceptance, stale OAuth state, rate limiting,
  webhook gaps, provider outages, and ambiguous responses can produce
  **Outcome unknown**. Such operations are quarantined and read from the
  provider before any retry; the system never blindly resubmits a whole
  release.
- Recovery is operation-granular. Already proved operations remain complete,
  missing operations may resume, and contradictions become visible exceptions.
- Exact-object readback plus provider notifications and bounded polling detect
  later provider edits, voids, deletions, and mapping drift. A once-reconciled
  operation may become drifted without rewriting historical evidence.
- QBO and Xero have independent production-readiness gates, including sandbox
  conformance, OAuth rotation/race testing, provider-limit handling,
  timeout-after-commit proof, partial-success recovery, external mutation
  detection, accessibility, tenant isolation, canaries, and a connector kill
  switch. One provider's outage or failed certification must not disable the
  other or artifact-only evidence.
- The user experience presents provider language and the next safe action,
  while retaining technical evidence in progressive disclosure. It does not
  promise “exactly once,” “fully synced,” or “reconciled” without proof.

### Explicit non-goals from D2

- No generic connector marketplace or provider-neutral write DSL.
- No bidirectional editing of QBO or Xero records from Asym.
- No QBO/Xero accounts-payable, accounts-receivable, payroll, tax, or foreign-
  exchange engine.
- No mandatory second approval for ordinary releases.
- No QuickBooks Desktop or IIF delivery.
- No assumption that one universal journal-entry shape is correct for both
  providers; provider-native posting profiles are decided separately.

## D3 — Canonical Legal Entity financial boundary

**Status:** Ratified and adversarially hardened on 2026-07-25.

One canonical **Legal Entity** is the enduring legal and financial identity
beneath a Tenant. The Phase 7 Legal Issuer, payment merchant, settlement owner,
receipt issuer, and accounting owner are roles or profiles of that same
identity; Asym must not create parallel issuer, merchant, or accounting-company
identities that can disagree.

Every independently authoritative financial root freezes an explicit
`legal_entity_id` when its source fact is created. A tenant may have a default
Legal Entity for setup and UI prefill, but neither persistence nor later work
may infer financial ownership from the current default, first entity, Site,
locale, currency, donor address, or current provider connection.

**Sequencing correction (2026-07-27 congruency pass).** Phase 7 promotes its
Legal Issuer into the canonical `LegalEntity` root and immutable Legal Issuer
Profile Versions. Phase 13 introduces Settlement Account Binding and pins the
entity on contributions, designations, processor observations, and recurring
handoffs; Phases 15 and 16 consume that identity. Phase 20 proof-gates
multi-entity accounting activation and owns accounting destinations/releases;
it does not retrofit entity identity onto already-created source roots.

The ordinary one-entity tenant experience remains quiet: no entity selector,
extra confirmation, or additional workflow appears when no real choice exists.
Adding another Legal Entity is an explicit, resumable setup action. Readiness
is capability-specific rather than one global activation flag, so accounting
configuration or provider failure cannot block otherwise valid donations,
settlement, or receipts.

### Provider and destination boundaries

- A **Settlement Account Binding** connects one Legal Entity to an exact
  processor account, environment, currency, purpose, and effective interval.
- An **Accounting Destination** is one stable external set of books: a QBO
  company identified by `realmId` or a Xero organization identified by
  `tenantId`, always including environment.
- A **Provider Authorization Grant** is replaceable OAuth and authorizer
  evidence. An **Accounting Destination Connection** binds an exact destination
  to an authorized grant for one Tenant and Legal Entity. Reauthorizing the
  same stable destination renews access; selecting another destination is a
  separate, effective-dated succession action. One Xero grant may serve
  multiple exact destination connections, but never weakens their isolation.
- One Legal Entity may use different settlement accounts or accounting
  destinations over time without becoming a new entity. Historical facts and
  Accounting Releases remain pinned to the exact binding and destination
  versions that governed them.
- Production destination intervals cannot overlap. Direct delivery never
  silently fails over, dual-writes, redirects, or backfills into another legal
  organization, provider environment, or set of books.

### Adversarial hardening

- Tenant remains the outer identity, membership, RLS, and data boundary. Entity
  restrictions are subtract-only finance scopes inside the Tenant. Legal
  organizations requiring genuinely isolated donor, missionary, staff, or
  operational data must use separate Tenants.
- Every designation belongs to exactly one Legal Entity. Once money references
  it, its entity cannot change; a true transition creates a successor
  designation.
- A contribution, recurring group, offline batch, Processor Payout Transfer,
  Settlement Evidence Snapshot, receipt, statement, approved-expense handoff,
  or Accounting Release cannot span Legal Entities. A cart may contain
  selections for more than one entity only while still editable; before
  acceptance the UI must disclose separate payment groups and obtain explicit
  donor confirmation. The server rejects any mixed-entity contribution or
  processor command and never silently splits a charge.
- Donation, receipt, settlement, and accounting-delivery readiness are
  independently derived. Provider configuration is described as connected,
  matched, or staff-confirmed unless an authoritative verification actually
  occurred.
- OAuth state is signed, single-use, and bound to actor, Tenant, Legal Entity,
  provider, environment, setup revision, nonce, and expiry. Provider
  organization IDs are resolved server-side and never trusted from client or
  job input.
- Active provider destination identity is globally unique by provider,
  environment, and stable organization identifier. A conflict fails without
  revealing the other tenant; a legitimate ownership transfer uses a
  proof-gated support process.
- Presentment, transaction, settlement, payout, provider-base, and reporting
  currencies remain separate facts. A new currency does not create a new Legal
  Entity.
- Reconnect and destination change are distinct staff actions. A destination
  cutover is atomic and effective-dated; in-flight and prior releases remain
  pinned to the old destination, and ambiguous operations must be reconciled
  before unsafe change.
- Legal Entities with financial history are retired, never deleted, merged,
  reassigned, or retroactively corrected by changing their foreign key. A real
  reorganization creates explicit successor identity or profile evidence
  without rewriting history.
- Multi-entity activation remains disabled until all upstream financial
  writers, webhook routers, recurring workers, document authorities,
  statement operations, expense handoffs, accounting releases, and provider
  operations prove and preserve exact entity attribution.

### Staff and donor experience

- The multi-entity workspace is labeled **Legal organizations** and is hidden
  from routine one-entity work.
- Setup uses four concise, resumable steps: Organization details; Money and
  receipts; Accounting, which may be set up later; and Review.
- Review presents independent readiness cards and a direct
  `Activate for donations` action rather than one misleading green status.
- `Reconnect access` can only restore the same provider organization.
  `Change accounting organization` is a separate reviewed action explaining
  the effective date, unresolved work, and preservation of existing releases.
- Mixed-entity donor checkout explains that the organizations process and
  receipt donations separately, then offers to keep the current donation or
  start a separate donation. It does not surprise the donor with multiple
  charges.
- Status and error UI states what is affected, what remains available, and the
  next safe action. Status is conveyed through text and iconography, not color
  alone.

### Explicit non-goals from D3

- No legal-entity hierarchy, consolidation, eliminations, or intercompany
  accounting inside Asym.
- No one Legal Entity per fund, designation, Site, locale, or currency.
- No shared production accounting destination for multiple Legal Entities in
  direct-sync mode.
- No cross-entity payment, receipt, statement, settlement, release, or
  automatic provider failover.
- No nullable compatibility model or permanent tenant-level financial
  fallback; this pre-production build uses one clean coordinated cutover.

## D4 — Typed Accounting Posting Intent and canonical balanced Accounting Effect

**Status:** Ratified and adversarially hardened on 2026-07-26.

Each immutable, source-covered **Accounting Release** combines two inseparable
views of the same accounting authority:

1. A typed **Accounting Posting Intent** states what exact economic occurrence
   is eligible to enter accounting, for which Legal Entity, for what purpose,
   on which accounting date, under which source and policy versions.
2. A **Canonical Accounting Effect** states the exact provider-neutral,
   balanced debit-and-credit meaning produced from that intent.

Neither view is a second mutable workflow. The intent preserves economic
meaning and provenance; the effect preserves exact accounting mechanics.
QuickBooks Online and Xero adapters compile the effect into provider-native
objects but may not reinterpret the intent, invent accounting policy, or
become accounting truth.

### Accounting-policy and GAAP boundary

- Asym enforces balanced mechanics, source coverage, versioned policy,
  reproducibility, traceability, and evidence. It does not make a blanket
  claim that a tenant's books or configuration are “GAAP compliant.”
- Applicable accounting standards remain authoritative. The tenant and its
  authorized accounting professional own accounting elections,
  classifications, materiality, and policy.
- A versioned semantic accounting policy converts source-authorized economic
  facts into canonical account roles, accounting dates, and dimensions.
  Asym may provide a reviewed nonprofit preset, but an authorized accountant
  or finance authority must confirm each policy version before production use.
- Confirmation is prospective and lightweight. Ordinary releases governed by
  an already confirmed policy do not require repeated approval or a mandatory
  two-person workflow.
- The staff surface identifies the active policy in plain language, including
  its version and who confirmed it. Changing policy creates a new
  effective-dated version and never rewrites an existing release.

### Frozen Posting Intent

The Posting Intent freezes at least:

- Tenant and Legal Entity;
- one closed, versioned intent type and semantic occurrence key;
- exact source-authority identifiers, source revisions, and source-set digest;
- a plain-language accounting purpose;
- the economic event date, its source-owned date basis, the resolved accounting
  date, and accounting period;
- transaction, settlement, and reporting or base-currency facts needed by the
  approved policy;
- the semantic accounting-policy version;
- source eligibility evidence and any policy-owned exclusion;
- correction, reversal, replacement, and predecessor lineage.

Intent types remain a small, governed catalog of accounting purposes. Phase 20
does not introduce a tenant-authored accounting language, arbitrary formula
builder, or mirror of every QBO and Xero document type.

### Canonical Accounting Effect

Each effect line contains:

- a stable line identifier and deterministic ordinal;
- one canonical account role;
- exactly one positive debit or one positive credit;
- exact currency and amount;
- bounded semantic dimensions;
- a governed, PII-safe description;
- exact source-allocation or correction lineage;
- the policy, builder, and schema versions needed to reproduce its meaning.

The effect contains no provider account or object identifiers, OAuth state,
delivery or reconciliation status, unrestricted donor or staff narrative, or
care information. D6 owns exact provider binding instances; D7 and D8 certify
the allowed provider carrier kinds, positions, visibility, and capability.
The separate Provider Delivery Plan only freezes their references or digests
for one release.

### Mechanical and source-coverage invariants

- One Accounting Release covers exactly one Tenant, Legal Entity, accounting
  destination context, accounting date or bounded period, and compatible
  currency basis.
- Monetary arithmetic uses exact integer minor units or an explicitly approved
  exact decimal scale. Binary floating-point arithmetic is prohibited.
- Currency code, scale, and exponent are explicit; debits equal credits
  exactly.
- The release must also satisfy its intent-specific conservation equation.
  A globally balanced but economically incomplete release is invalid.
- Every accounting-relevant source amount appears exactly once in the effect
  or is explicitly excluded by a frozen policy-owned rule.
- A separate immutable **Source Coverage Manifest** proves how each relevant
  source occurrence and amount is represented, excluded, corrected, or
  replaced. This preserves line-level traceability even when effect lines are
  summarized at an approved account, date, fund, dimension, or provider grain.
- The system may not create a generic `Other`, suspense, or penny-plug line to
  force balance. Any rounding line requires an approved canonical role,
  explicit cause, exact amount, and policy authority.
- The same source facts, policy version, mapping-independent builder version,
  and intent must produce byte-equivalent canonical serialization and the same
  digest.

### Nonprofit accounting semantics

- Contribution versus exchange, conditional versus unconditional,
  donor-restricted versus without-donor-restriction, internal or board
  designation, missionary or project designation, natural expense, and
  functional expense remain distinct concepts.
- A donor preference, missionary, fund, campaign, or internal designation does
  not automatically establish a donor restriction.
- Receipt OCR or a merchant category may assist data entry but cannot establish
  functional-expense classification.
- Commitments, soft credits, expected recurring support, and forecasts are not
  cash, revenue, or receivables merely because they appear in operational
  reporting.
- Source domains own legal and economic facts. The versioned tenant accounting
  policy owns downstream interpretation. Provider adapters make no GAAP
  decision.
- Phase 20 does not become a general ledger or calculate net-asset
  rollforwards, release-from-restriction entries, consolidation,
  intercompany entries, or pledge receivables unless a later decision
  expressly introduces a bounded contract.

### Provider compilation and effect equivalence

- A Provider Delivery Plan compiles the canonical effect into an acyclic graph
  of provider-native operations. Each operation claims a precise,
  non-overlapping portion of the effect, and the complete graph must cover the
  effect exactly.
- Provider-generated control-account, tax, clearing, linked-transaction,
  currency, or rounding effects must correspond to explicit canonical lines
  or the plan is incompatible.
- Every required account, dimension, date, currency, status, and tax
  disposition is explicit. The adapter may not silently drop a dimension,
  accept a provider default, or fall back to a journal entry.
- The plan pins its mapping, posting-profile, compiler, adapter, provider
  contract, and normalized-payload versions. A retry reuses the frozen plan;
  it does not recompile under new code or configuration.
- Exact-object readback is required after provider acceptance. A request body
  or successful HTTP response is not proof of the resulting provider record.
- Evidence remains truthful and tiered: compilation-equivalent,
  object-semantically equivalent, provider-ledger-effect verified when
  authoritative access exists, settlement-reconciled, drifted, or
  indeterminate.
- Provider-ledger verification must not be claimed when the provider or the
  tenant's authorization tier cannot supply that evidence. In particular,
  object readback is not silently presented as Xero journal-level proof.
- A later external edit, void, deletion, or contradiction changes the current
  Reconciliation Verdict and preserves prior evidence; it never mutates the
  Accounting Release.

### Corrections and stale work

- Before release, staff correct the owning source, mapping, or policy and
  regenerate the preview. A preview whose source, policy, or mapping evidence
  is stale cannot release.
- After release, the Accounting Release is immutable.
  `Correct this release` creates explicit linked compensating and, where
  appropriate, replacement intent. It never edits accepted history.
- Provider drift and mapping drift are exceptions requiring evidence-based
  resolution. The system never silently rewrites source truth or recreates a
  provider object that an accountant may have intentionally changed.

### Bookkeeper-first review surface

The product uses one progressive, accessible review page rather than separate
novice and expert products:

1. **What happened** shows the plain-language money equation, such as gross
   gifts minus fees, refunds, disputes, reserves, or currency effects equals
   the settlement amount, plus source coverage.
2. **How it will be recorded** shows grouped canonical effect lines with
   account role, fund or dimension, debit, credit, and source count. Staff may
   expand exact source lineage but cannot edit released arithmetic or
   provenance in place.
3. **QuickBooks/Xero preview** shows the derivative provider-native objects,
   target accounts and dimensions, accounting date, object count, and explicit
   rounding behavior. It is always labeled as a preview and as not yet sent.

The header shows release, Legal Entity, accounting date or period, currency,
source reference, count, total, and one primary next action. It presents
**Sources covered**, **Balanced**, **Ready for accounting**, **Delivered**, and
**Reconciled** as separate truths.

Clean rows pass automatically. Exceptions are grouped by cause with affected
count, amount, explanation, and one safe next action; staff are not forced to
review thousands of proved rows. Large releases generate asynchronously, use
server-side pagination or virtualization, and issue one completion
notification rather than noisy row-level updates.

Tables use semantic headers and accessible names, keyboard navigation,
focusable error summaries, text and icon status rather than color alone,
correct currency announcements, and a usable responsive alternative.

### Explicit non-goals from D4

- No editable debit-and-credit spreadsheet or arbitrary journal-entry builder.
- No tenant-authored rule language or free-form provider payload editor.
- No provider objects, credentials, or mutable delivery state inside the
  canonical effect.
- No journal-only or silent journal-fallback strategy for QBO or Xero.
- No silent rounding, dimension loss, currency conversion, tax default, or
  suspense balancing.
- No bidirectional provider edits, shadow general ledger, or one mutable
  `synced` field.
- No repeated approval of routine releases governed by an already confirmed
  policy.

## D5 — Bounded, goal-based provider-native Posting Profiles

**Status:** Ratified and adversarially hardened on 2026-07-26.

Each Legal Entity and Accounting Destination has one prospective, versioned,
tenant-controlled **Posting Profile bundle**. Staff choose understandable
accounting outcomes and provider detail; Asym owns, certifies, and versions the
bounded QuickBooks Online and Xero recipes that implement those choices.

Posting Profiles are a representation boundary, not an accounting-policy
engine. The four authorities remain separate:

1. D4's semantic accounting policy determines the required accounting meaning.
2. The Posting Profile selects an approved detail grain and certified
   provider-native representation.
3. Provider mappings bind canonical account and dimension roles to exact
   destination identifiers.
4. The Provider Delivery Plan freezes the exact operations for one Accounting
   Release.

A profile cannot change source facts, cash-versus-accrual treatment,
contribution or expense recognition, restriction semantics, accounting dates,
the Canonical Accounting Effect, or reconciliation truth. Provider adapters
compile certified recipes; neither staff nor adapters author arbitrary object
graphs, formulas, or payloads.

### One active bundle with bounded source-purpose recipes

The active bundle contains purpose-owned recipes for:

- online processor settlements;
- Phase 15 offline Deposit Groups;
- approved expenses that the source establishes were already paid;
- genuine approved payables that the source establishes remain unpaid;
- corrections and reversals derived from the original recipe;
- exceptional accountant adjustments.

The source fact, rather than a tenant preference, determines whether work is a
cash event, an unpaid obligation, a refund of an immediate contribution, or a
correction of an invoice-backed transaction. Phase 20 does not manufacture
receivables from pledges, commitments, recurring-support expectations, or
forecasts.

The minimum certified provider recipe catalog is:

| Purpose                        | QuickBooks Online                                                                     | Xero                                                                   | Binding guardrail                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Online contribution settlement | A certified Sales Receipt and Deposit graph, or a certified summarized Deposit recipe | A certified processor-clearing and Receive/Spend/Payment graph         | Preserve gross gifts, fees, refunds, disputes, reserves, adjustments, and net payout exactly |
| Offline deposit                | Sales Receipts into Undeposited Funds followed by one Deposit per real deposit        | Receive Money or an approved clearing-to-bank flow                     | Derive from the Phase 15 Deposit Group and match the physical deposit                        |
| Paid expense                   | Purchase/Expense                                                                      | Spend Money                                                            | Use only when the source says payment already occurred                                       |
| Genuine payable                | Bill followed by BillPayment                                                          | Accounts-payable invoice followed by Payment                           | Use only when the source establishes a real unpaid obligation                                |
| Immediate-contribution refund  | Refund Receipt and the appropriate settlement adjustment                              | Spend Money or the native correction compatible with the original flow | Credit-note workflows require a real preceding invoice                                       |
| Accountant adjustment          | JournalEntry                                                                          | ManualJournal                                                          | Explicit exceptional recipe only; never an automatic fallback                                |

Provider recipe certification must prove the resulting accounting effect,
cash/accrual reporting behavior, linking behavior, default suppression,
readback, reversibility, and recovery behavior. A balanced request alone is
not sufficient.

### Three evidence-preserving posting grains

Posting grain controls provider detail only:

1. **Gift detail** — each gift remains separately represented; designation
   splits remain attributable to that gift.
2. **Gift and fund detail** — each gift allocation is distinct provider detail,
   corresponding to the nonprofit-CRM project-detail pattern.
3. **Fund summary** — activity is aggregated by the approved account, fund,
   date, currency, and dimension grouping.

Every grain retains the same gift-level Source Coverage Manifest and the same
Canonical Accounting Effect. Staff may inspect all three views in Asym
regardless of the grain delivered to the provider.

The source-purpose defaults are:

- online processor payouts use **Fund summary**, particularly for many-fund
  missions and high-volume giving;
- offline check and cash Deposit Groups use **Gift detail** unless tenant
  volume or accounting policy favors a supported summary;
- approved expenses retain approved expense-report-line detail.

Staff may choose another certified grain for a source family when provider
capability and projected volume remain inside the tested safety envelope.
Selecting a grain does not enable donor-contact synchronization. Gift detail
uses opaque, PII-safe source references by default; donor/customer/contact
creation requires a separate future purpose-specific contract.

### One posting owner per source interval

For each processor account and effective source interval, exactly one system
may own provider posting. Activating Asym direct delivery requires:

- a clear explanation that Asym and another Stripe-to-QBO/Xero connector must
  not both post the same activity;
- best-effort inspection for recognizable overlapping provider records;
- authorized-finance confirmation that another auto-posting connector is
  disabled or owns a non-overlapping interval;
- an explicit effective start date;
- proof-backed migration before any historical overlap.

A known overlap blocks direct activation. Artifact-only accounting remains
available as an explicit staff choice; it is never an automatic fallback and
is not represented as provider delivery.

### Capability- and volume-gated activation

Before activation, Asym verifies:

- exact provider organization, environment, authorization, and provider plan
  capabilities;
- account and dimension existence, type, activity, currency, and payment
  eligibility;
- QBO class granularity and availability of class, location, item, or project
  capabilities used by the profile;
- Xero's tracking-category and per-line constraints;
- explicit tax and currency dispositions;
- closed-period compatibility;
- projected provider object, line, and API-call volume;
- complete source coverage and effect-equivalent compilation;
- the absence of known competing posting ownership.

Each semantic dimension has one explicit profile disposition:

- required in the provider;
- intentionally summarized while remaining in Asym evidence;
- incompatible, which blocks activation.

No profile may silently drop a dimension, accept a provider default, create a
generic suspense or `Other` mapping, change an accounting date, infer an
exchange rate, or substitute another transaction type.

### Prospective immutable lifecycle

The profile lifecycle is:

`Draft → Ready to activate → Active → Superseded`

`Attention needed` is a derived actionable condition when provider access,
mapping, plan capability, or metadata has drifted; it is not another mutable
lifecycle authority.

- One tenant-authorized Accounting Admin or Finance Admin activates a profile.
- D4's semantic accounting policy must already be accountant-confirmed. The
  profile does not require a second accountant approval unless tenant
  governance deliberately requires it.
- Clean Accounting Releases inherit the active profile without repeated
  approval.
- A change creates a draft next version and shows an exact before-and-after
  impact preview.
- Activation is prospective and atomic. Existing Accounting Releases,
  in-flight work, and frozen Provider Delivery Plans retain the version that
  already governs them.
- Transport-only adapter corrections may deploy under effect-equivalence
  contract tests. Any change to provider objects, grouping, dates,
  dimensions, defaults, or resulting accounting behavior requires a new
  certified recipe and profile version.
- An emergency adapter kill switch may stop unsafe future direct delivery but
  may not silently switch recipes or delivery lanes.

### Bookkeeper-first staff experience

The ordinary surface is one page, **Accounting → Posting profile**, rather than
separate novice/expert products or a sprawling wizard.

Its header shows Legal Entity, exact connected provider organization, active
profile and version, posting goal and grain, effective date, last capability
verification, a quiet health state, and one primary action.

Four progressive sections guide setup:

1. **Choose the outcome** — begin with
   `One accounting settlement per processor payout`.
2. **Choose accounting-system detail** — compare Fund summary, Gift and fund
   detail, and Gift detail using benefit, privacy effect, provider record
   volume, and what remains available in Asym.
3. **Resolve only missing setup** — completed mappings collapse to summaries;
   missing work is grouped by cause, count, and amount with safe bulk mapping
   and a before/after preview.
4. **Review and activate** — a recent representative payout or safe mock shows
   gross minus fees, refunds, and disputes equals net; expected provider
   objects, lines, dates, accounts, dimensions, privacy consequences, and
   projected monthly volume; it is labeled
   `Preview only — nothing has been sent`.

Healthy setup stays quiet. The surface raises only actionable
`Attention needed`, `Disconnected`, `Provider changed`, or
`Change scheduled` conditions. Per-release review reuses D4's separate
**Sources covered**, **Balanced**, **Ready for accounting**, **Delivered**, and
**Reconciled** truths; profile readiness is never delivery or reconciliation.

Errors state what happened, what was not sent, which work is affected, and the
next safe action. Ambiguous provider outcomes instruct staff not to retry while
Asym performs evidence-based provider inspection.

Selection controls use native radio semantics; mapping and activation are
keyboard-complete; errors have a focusable linked summary; status uses text and
iconography rather than color alone; accounting tables use semantic headers
and explicit currencies; responsive layouts stack dense tables without
removing evidence; and asynchronous preview completion is announced.

### Scale, operations, and recovery

- Preview estimates monthly provider objects, lines, and API calls before
  activation. Material provider/reporting limits are blockers rather than
  warnings that staff can unknowingly dismiss.
- Fund summary is the high-volume default. Gift detail is not available for
  direct delivery when projected volume exceeds the certified provider safety
  envelope; the UI compares a safe summary instead.
- Provider traffic uses per-tenant and per-destination bounded queues, paging,
  conservative certified batch sizes, rate-limit backpressure, and
  operation-granular outcomes.
- Provider idempotency facilities supplement, but never replace, durable Asym
  operation IDs, payload digests, exact-object readback, query-before-retry,
  and D2's `Outcome unknown` quarantine.
- Profile and recipe versions, provider correlation identifiers, operation
  evidence, volume, throttling, drift, and effect-equivalence verdicts remain
  inspectable without exposing secrets or unrestricted provider data.
- Provider account data and mappings are scoped by Tenant, Legal Entity,
  Accounting Destination, provider, and environment. Server-side authority,
  RLS, composite constraints, scoped caches, and negative isolation tests
  prevent cross-tenant reuse.
- QBO/Xero tokens and sensitive provider evidence are encrypted and
  purpose-limited; donor PII is excluded by default; secrets and raw provider
  data never enter ordinary logs.

### Release gates inherited from D5

No recipe or grain reaches production without:

- golden Canonical Accounting Effect-to-provider-plan fixtures;
- source-coverage and exact-balance property tests;
- QBO sandbox and Xero demo-organization conformance;
- exact-object readback and cash/accrual report validation;
- timeout-after-commit, partial-success, retry, and duplicate prevention;
- external mutation, provider-plan downgrade, inactive-mapping, closed-period,
  currency, and capability-drift tests;
- multi-tenant and Legal Entity isolation tests;
- high-volume payout simulation and rate-limit recovery;
- accessible interaction and error-state testing;
- bookkeeper usability evidence that staff can distinguish preview, delivery,
  and reconciliation and activate a clean recommended setup without
  assistance.

### Explicit non-goals from D5

- No tenant-authored accounting DSL, arbitrary recipe builder, formula editor,
  or raw provider payload editor.
- No profile inheritance, per-fund profiles, per-release recipe selection, or
  unrestricted precedence rules.
- No journal-only or silent journal-fallback path.
- No silent defaults, mappings, dimension loss, tax treatment, exchange rate,
  rounding, or suspense balancing.
- No automatic donor/customer/contact proliferation.
- No duplicate processor posting alongside another connector.
- No claim that Xero bank reconciliation was completed through an API that
  cannot perform it.
- No recurring approval of releases governed by an active proved profile.

## D6 — Source-exact, provider-bounded many-fund mapping

**Status:** Ratified and adversarially hardened on 2026-07-26.

Asym preserves every source-owned Designation exactly while projecting only the
tenant-selected, accounting-useful detail into QuickBooks Online or Xero.
Hundreds or thousands of missionary, project, campaign, or fund Designations
must not force either one provider object per Designation or one fixed
summary-only accounting model.

The hardened design uses one immutable tenant-owned
**Designation-to-Accounting-Reporting-Target resolution**, typed carrier
bindings, proof-gated summarization, complete per-release mapping evidence,
prospective versions, and one exception-first finance workspace.

### Separate the four meanings

The system keeps these authorities distinct:

1. A **Designation** is the source-owned donor allocation target.
2. An **Accounting Reporting Target** is a tenant-owned, Legal-Entity-scoped,
   provider-neutral downstream reporting projection.
3. A canonical account or dimension role is D4 accounting meaning.
4. A typed provider carrier binding selects one certified QBO or Xero object
   type and stable destination identifier for one semantic role.

An Accounting Reporting Target cannot establish or alter donor restriction,
net-asset classification, contribution or exchange treatment, accounting
basis, functional expense, canonical account role, currency, amount,
accounting date, tax treatment, or source lineage. It also is not a live CRM
program, campaign, missionary hierarchy, provider Class, Tracking Option, or
general-ledger account.

CRM attributes and hierarchy may filter or suggest assignments while staff
author a draft. Moving a Designation inside CRM never changes accounting output
until staff activate a new mapping version.

### One lean exactly-once resolution

Every amount-bearing Designation allocation included in accounting has exactly
one active resolution under one **Designation Mapping Version**:

- **Reporting target** — resolve to one Accounting Reporting Target; or
- **Evidence only** — preserve exact detail in Asym while intentionally not
  representing a separate fund dimension in the provider, only when D4 and D5
  authorize that summary.

`Needs mapping` is a derived blocking exception, not a valid target or
fallback.

Exact and grouped use one construct:

- a target used by one Designation is displayed as **Exact in accounting**;
- a target shared by multiple Designations is displayed as
  **Grouped in accounting**.

Reporting Targets are one level only. They do not contain other targets.
Explicit assignments and bulk assignments are authoring methods, not additive
resolution layers. One Designation cannot emit through both an override and a
group.

A tenant chooses one visible policy for future Designations:

- use one named Accounting Reporting Target when the frozen accounting policy
  proves compatibility; or
- require finance mapping.

No default is silently enabled. Every default-based resolution records its
provenance and appears separately in coverage. Unknown or incompatible
activity remains `Needs mapping`; a named General or unrestricted target is
never an unbounded catch-all.

### Proof-gated provider summarization

The staff-facing state **Kept in Asym only** is allowed only when:

- the active semantic accounting policy says exact provider representation of
  that dimension is not required;
- the active Posting Profile expressly permits the dimension to be summarized;
- an authorized finance actor confirms the disposition;
- the preview explains what provider reporting will and will not remain
  available;
- affected source and Designation counts and monetary exposure are shown;
- every exact Designation and source allocation remains in the Source Coverage
  Manifest.

An unresolved, restricted, unknown, or incompatible Designation cannot enter
this state merely because no mapping exists.

All grouping keys include every compatibility fact required by the active
policy and recipe. Aggregation may not cross:

- Tenant or Legal Entity;
- Accounting Destination;
- currency;
- accounting date or permitted period;
- canonical account role;
- tax disposition;
- any required restriction or reporting dimension;
- provider recipe or mapping version.

Fees, refunds, disputes, reserves, adjustments, and correction lines retain
every policy-required dimension. A carrier unsupported on any required recipe
line makes that representation incompatible rather than silently dropping the
dimension.

### Immutable versions and Mapping Coverage Manifest

One immutable, effective-dated Designation Mapping Version governs each Legal
Entity and Accounting Destination interval. Draft changes may be edited, but
activation is atomic and uses compare-and-swap or equivalent concurrency
control so effective intervals cannot overlap.

Each Accounting Release chooses one exact mapping version and pins its digest
in the same atomic freeze as its source snapshot. A stale preview cannot
release.

The release freezes a **Mapping Coverage Manifest** proving, for every included
source allocation:

- Tenant, Legal Entity, and exact Designation identity;
- a finance-safe identity snapshot;
- Accounting Reporting Target when one is used;
- exact, grouped, or evidence-only representation;
- explicit, bulk-assigned, or named-default provenance;
- canonical account role and required semantic dimensions;
- provider carrier type and stable provider object identifier when compiled;
- currency, accounting date or period, tax disposition, and grouping key;
- mapping, policy, profile, recipe, compiler, adapter, and provider-contract
  versions;
- exact links from source allocation to effect lines and provider operations.

The Mapping Coverage Manifest must reconcile exactly to both D4's Source
Coverage Manifest and Canonical Accounting Effect. A balanced total without
complete, non-overlapping mapping coverage is invalid.

Existing and in-flight releases remain pinned when mappings change. Rollback
creates a prospective successor version copied from a prior version. Once
referenced, a Designation, Reporting Target, binding, or mapping version retires
rather than disappearing. A merge, split, transfer, or successor Designation
creates explicit prospective resolution and never rewrites historical money.

### Typed provider carrier boundary

`Exact provider mapping` does not mean that staff may choose any provider
object. QBO Accounts, Classes, Locations, Products/Services, and Projects and
Xero Accounts, Tracking Options, and Projects have different accounting,
cardinality, scope, and reporting behavior.

D6 owns every exact semantic-role or
Reporting-Target-to-provider-object binding instance. D7 and D8 define the
provider-specific certified carrier matrices against which D6 bindings are
validated. Every binding records at least:

- semantic role;
- provider object type;
- stable provider object identifier;
- expected active state, type, parent account, currency, and relevant
  capability properties;
- the source recipes and transaction positions for which the carrier is
  certified;
- the governing destination, provider, environment, and mapping version;
- a display-name and provider-metadata snapshot for evidence.

Mappings use stable scoped provider identifiers, never mutable names or typed
codes alone. A presentation-only rename may refresh current display metadata
without rewriting history; a potentially semantic rename requires lightweight
same-meaning confirmation or rebinding. Archive, deletion, type change, plan
downgrade, permission loss, or semantic drift creates `Attention needed` and
blocks only affected future work. Asym never substitutes another carrier or
delivery lane silently.

Provider-specific bindings are destination-owned. A cross-provider or
cross-company transfer may carry semantic Reporting Targets and assignment
evidence but marks provider bindings unresolved and requires a new destination
preview. Raw QBO or Xero identifiers are never treated as portable.

### Provider-object provisioning

Asym imports existing provider objects first and presents searchable,
type-filtered selectors. It never automatically creates one provider object per
Designation as an activation side effect.

When staff deliberately create missing provider objects, the ordinary UI
remains one coherent setup flow, but the durable operation is separate:

`Draft preview → Approved creation set → Creating → Completed with exact outcomes`

Before confirmation, staff see generated labels, collisions, provider
capacity, expected count, and affected mappings. Creation is resumable and
idempotent, observes provider rate limits, records per-object outcomes, and
reads every object back. Partial creation does not activate a partial mapping.
Activation rereads and revalidates every referenced object.

### Bookkeeper-first mapping workspace

The feature remains inside D5's accounting setup:

**Accounting → Posting profile → Fund mapping**

The header shows Legal Entity, exact QBO or Xero organization, active and draft
mapping versions, effective date, last provider-capability verification, a
quiet health state, and one primary action.

Four plain-language cards summarize:

- **Exact in accounting**;
- **Grouped in accounting**;
- **Kept in Asym only**;
- **Needs mapping**.

Every card shows Designation count, affected source count, gross amount,
fee/refund exposure, net amount, and effect on the next Accounting Release.
The ordinary view shows actionable exceptions. `View all mappings` opens the
complete searchable and filterable catalog.

The mapping table answers:

- which Designation is affected;
- how it will appear in accounting;
- its Accounting Reporting Target;
- its destination representation;
- whether assignment was explicit, bulk-authored, or from the named default;
- affected amount;
- current status and next action.

Cross-page selection is explicit about scope: selected rows, all rows on the
page, or all rows matching the current filter. A persistent batch-action bar
offers only bounded actions:

- map separately;
- assign to one Reporting Target;
- keep detail in Asym only when policy permits;
- remove a draft assignment.

Bulk filters and suggestions require staff confirmation and do not become
future runtime rules. Draft changes can be undone before activation.

Review shows:

- exact before-and-after coverage;
- predicted provider targets, objects, lines, and remaining capacity;
- a representative payout, Deposit Group, or expense output;
- which Designations share each provider line or dimension;
- exact detail retained in Asym;
- provider reporting lost by a summary choice;
- all blockers in one review.

The preview is labeled:

`Preview only — nothing has been sent to QuickBooks/Xero.`

The one primary action is `Resolve N mappings` or `Review and activate`.
Healthy setup stays quiet.

### Accessibility, permissions, safety, and operations

- Tables have semantic headers and accessible row-selection names.
- Search, filters, bulk assignment, review, and activation are
  keyboard-complete.
- A focusable error summary links to each blocker.
- Status uses text and iconography rather than color alone.
- Filtering, preview generation, validation, and asynchronous completion use
  appropriate status announcements.
- Currency and amount cells announce currency explicitly.
- Narrow layouts use readable record cards without hiding evidence; mass
  mapping remains desktop-optimized while review and individual repair remain
  usable on mobile.
- Entity-scoped finance capabilities separately govern view, draft management,
  and activation. One authorized finance actor may manage and activate without
  mandatory dual control; tenant policy may require another approver.
- Activation records actor, effective date, reason, coverage and capability
  evidence, and before-and-after digests.
- Support access is tenant-authorized, audited, scoped, and cannot bypass
  mapping or entity authority.
- Finance-safe codes and labels reuse restricted-worker alias and fund-code
  publication rules. Donor names, missionary legal names, care notes,
  unrestricted narrative, secrets, and raw provider data cannot enter ordinary
  target labels, payload descriptions, logs, or audit events.
- All persistence, lookup, cache, and uniqueness keys include Tenant, Legal
  Entity, Accounting Destination, provider, environment, and provider object
  type where applicable.
- Coverage health reports exact, grouped, evidence-only, and unresolved source
  counts and monetary exposure. Profile health remains distinct from each
  release's Sources covered, Balanced, Ready, Delivered, and Reconciled truth.

### Release gates inherited from D6

No direct many-fund mapping reaches production without:

- randomized resolver property tests proving every included allocation resolves
  exactly once at 1,200 and 10,000 Designations;
- conservation tests proving supported exact, grouped, and evidence-only
  representations preserve the same permitted Canonical Accounting Effect and
  source totals;
- tests proving no grouping crosses Legal Entity, destination, currency, date
  or period, account role, tax disposition, required dimension, or version;
- fees, refunds, disputes, reserves, adjustments, and corrections carrying all
  required semantic dimensions;
- activation-versus-activation, activation-versus-release,
  new-Designation-versus-activation, and catalog-refresh-versus-preview race
  tests;
- QBO tests for unavailable Classes, Plus at 39, 40, and 41 combined Class and
  Location objects, Advanced pagination beyond 1,000 objects, per-line versus
  transaction carriers, rename/archive/reactivation, plan downgrade, and
  interrupted provider-object creation;
- Xero tests for zero, one, and two active Tracking Categories, 99, 100, and
  101 options, required Profit and Loss requests at 199, 200, and 201
  calculated tracking columns, archive/delete/type drift, rate limits, and
  partial requests;
- lifecycle and migration tests covering rename, retire, successor, rollback,
  destination succession, and frozen historical releases;
- negative Tenant, Legal Entity, destination, provider, environment, cache, and
  identifier-isolation tests;
- privacy tests proving restricted legal identities, donor PII, care data, and
  unrestricted narratives cannot enter providers, artifacts, logs, or audit;
- accessible bulk-workflow and responsive tests;
- bookkeeper usability evidence for common mapping, group creation, bulk
  assignment, archived-target repair, detail-loss preview, and activation
  without assistance;
- recovery tests for stale previews, timeout-after-create, partial creation,
  provider drift, and ambiguous provider outcomes.

### Explicit non-goals from D6

- No arbitrary mapping DSL, formulas, predicates, wildcard rules, or ranked
  precedence editor.
- No recursive or live CRM-derived Reporting Target hierarchy.
- No silent `Other`, unrestricted, suspense, general-fund, name-based, or
  provider-default fallback.
- No provider-object type treated as a universal fund field.
- No automatic provider-object creation or fuzzy auto-linking.
- No raw QBO/Xero identifiers inside source truth.
- No per-release mapping override or mutable released mapping.
- No historical rewrite when a Designation, target, provider object, or default
  changes.
- No mandatory recurring approval of releases governed by an active mapping.
- No silent carrier, recipe, or artifact-lane substitution after drift.
- No claim that grouped provider output erases or replaces exact Asym evidence.

## D7 — Tenant-owned, capability-certified QBO Carrier Plans

**Status:** Ratified and adversarially hardened on 2026-07-26.

QuickBooks Online does not provide one universal nonprofit fund field, and
missions organizations do not arrange their books uniformly. D7 therefore
bounds the meaning and provability of QBO configuration without prescribing one
tenant bookkeeping model.

The hardened design uses immutable, prospective **QBO Carrier Plans** with:

- guided defaults for common arrangements;
- one bounded advanced semantic-role matrix for legitimate existing books;
- capability certification against the connected QBO company;
- explicit **QBO Reporting Visibility** disclosure;
- exact native preview and readback;
- quiet health and an exception-first finance workspace.

Class-led reporting is the recommended cross-income-and-expense default when it
fits the tenant's accounting policy and QBO capabilities. It is not mandatory.
A tenant may instead use a genuine account/subaccount structure, Item-led
revenue classification, Location-led business-unit reporting, selective
Customer/Project profitability reporting, a certified combination, or exact
Asym detail with truthful QBO summary.

Carrier selection is independent of D5 posting grain. A Class-led plan may use
Fund summary, Gift and fund detail, or Gift detail when the active Posting
Profile and certified safety envelope permit it.

### Authority boundary

D7 consumes and cannot supersede:

1. D4's immutable Accounting Posting Intent, Canonical Accounting Effect,
   Source Coverage Manifest, and accountant-confirmed semantic accounting
   policy;
2. D5's Posting Profile, posting grain, and product-owned provider-native
   recipe for each source purpose; and
3. D6's Designation Mapping Version, Accounting Reporting Targets, typed
   carrier bindings, and Mapping Coverage Manifest.

D7 owns only the allowed QBO carrier kinds, exact certified positions,
role-collision rules, visibility contract, and capability proof. D6 owns each
exact semantic-role or Reporting-Target-to-provider-object binding instance;
D7 validates that binding against the active QBO Carrier Plan and pins or
digests the compatible D6 binding set. A QBO field or provider object never
decides source identity, donor restriction, net-asset treatment, contribution
or exchange classification, canonical account role, amount, currency,
accounting date, tax treatment, or source lineage.

Every Accounting Release pins the exact D4, D5, D6, and D7 versions that
governed it. Labels and live provider state cannot reinterpret a frozen
release.

### Tenant-freedom rider

Asym recommends the most compatible plan but does not declare an arrangement
wrong merely because it is unusual.

- Existing QBO objects are imported and bound by stable destination-scoped
  identifiers.
- Asym does not silently enable QBO preferences, restructure the chart of
  accounts, change Item routing, create provider objects, or convert the
  tenant to a Class-led model.
- One tenant-authorized finance actor may configure and activate a plan.
- Tenant policy may add a second approver; dual approval is not a platform
  default.
- A technically supported unconventional choice presents consequences and one
  explicit confirmation rather than an approval bureaucracy.
- Plan changes are prospective. Historical and in-flight releases remain
  pinned.
- A tenant may replace a draft or activate a successor without rewriting
  prior provider objects or evidence.

Tenant control does not include permission to emit an unbalanced,
non-equivalent, duplicated, cross-tenant, unsupported, or silently lossy
accounting result.

### Bounded semantic-role matrix

The advanced surface is a fixed matrix of known accounting meanings. It is not
a general field-mapping language.

The supported role families include:

- financial accounts: destination bank, undeposited funds or clearing,
  contribution income, fee, refund, chargeback or dispute, expense, payable,
  and other D4-governed canonical account roles;
- Accounting Reporting Target for fund, ministry, campaign, missionary, or
  other D6-approved downstream grouping;
- functional expense;
- branch, site, region, or business unit;
- grant, project, or missionary profitability unit; and
- summary accounting counterparty, vendor, employee, missionary, or another
  source-authorized non-donor accounting party.

Every D6 typed provider carrier binding validated by a QBO Carrier Plan is
scoped to:

- Tenant;
- Legal Entity;
- Accounting Destination;
- QBO realm and environment;
- D5 provider-native recipe and source purpose;
- provider entity and exact transaction- or line-level position;
- bounded semantic role;
- stable QBO object identifier and expected object properties; and
- immutable QBO Carrier Plan Version.

Exactly one primary carrier represents one semantic role at one certified
recipe position. Different semantic roles may use different dimensions. A
role may use different supported carriers across operation families only when
the plan declares the resulting QBO Reporting Visibility and the provider-native
graphs remain effect-equivalent.

There is no:

- formula editor;
- arbitrary predicate or conditional rule;
- ranked precedence;
- wildcard or blank-value fallthrough;
- per-gift payload customization;
- mutable live rule evaluation;
- raw JSON or API field editor; or
- carrier assignment based on a mutable provider display name.

### Certified carrier meanings

#### Accounts and subaccounts

QBO Accounts carry genuine general-ledger meaning. Account type, detail type,
parentage, currency, activity, and transaction support must match the D4
Canonical Accounting Effect.

A tenant may use accountant-designed fund accounts or subaccounts where that
is genuinely how its chart is structured. Asym does not treat an Account as a
cosmetic tag, use a type-incompatible account, post to a locked or inactive
account, or create plug or suspense balances merely to satisfy QBO.

#### Classes

Class is the recommended default for tenants that already use it to report a
fund, ministry, program, function, or another segment across supported income
and expense activity.

Certification detects:

- QBO subscription availability;
- whether Class tracking is enabled;
- transaction-level versus line-level preference;
- supported positions for every required provider entity;
- active Class and subclass state;
- combined Class and Location capacity; and
- whether another semantic role already consumes Class.

Asym does not require a tenant to repurpose Classes that it uses for functional
expense or another legitimate reporting axis.

#### Products and Services

An Item may carry a contribution category or revenue purpose on supported
sales lines. Its type and IncomeAccountRef or ExpenseAccountRef must agree with
the Canonical Accounting Effect.

Item-led target reporting is labeled revenue-only unless a separate certified
expense representation supplies corresponding expense visibility. An Item
rename is presentation drift; a routing-account or type change is semantic
drift and requires prospective repair.

#### Locations and Departments

Location carries a transaction-wide branch, site, region, property, or other
genuine business-unit meaning. A tenant may use it for another compatible
reporting unit only when each compiled transaction is homogeneous or the D5
recipe can partition it completely and disjointly.

The preview explains transaction multiplication, bank-matching consequences,
object count, and any reporting split. Asym never copies the first line's
Location across mixed work or pretends Location is line-level.

#### Customers and Projects

A Customer or Project may represent a summary accounting counterparty, grant,
missionary, project, or profitability unit when the QBO plan, API scope,
relationship model, and provider entity support it.

A single-valued Customer or Project position cannot represent both a summary
accounting counterparty and a different accounting reporting party at once.
The plan must choose which meaning is provider-visible and preserve the other
in Asym or another certified role. D7 does not create, synchronize, match,
select, or represent per-donor QBO Customers. Any purpose-specific
donor/Customer synchronization or per-donor Customer representation requires a
separate future contract.

Project-led use requires current plan and API capability proof. It is not
silently approximated with Customer, Class, memo text, or Journal Entry.

#### Asym-detail/QBO-summary

A tenant may retain exact Designation and Accounting Reporting Target detail in
Asym while QBO receives a balanced, policy-authorized summary.

The plan states:

- which provider dimensions are absent;
- which report cannot be produced from QBO alone;
- the exact detail and source lineage retained in Asym; and
- how the QBO summary reconciles to the Accounting Evidence Artifact.

Summary is a truthful declared coverage level, not a failure fallback.

#### Custom fields

QBO custom fields may carry approved reference or operational metadata in a
future certified recipe. They never satisfy D4 accounting meaning, D6 mapping
coverage, balance, or provider-effect equivalence and are not a core D7
accounting carrier.

### Reporting-coverage contract

Every active plan and preview states the coverage for each relevant semantic
role:

- **Full income and expense**;
- **Revenue only**;
- **Expense only**;
- **Transaction-wide**;
- **Project-specific**;
- **Split across QBO dimensions or reports**; or
- **Kept in Asym only**.

The workspace explains coverage in reporting language rather than implying
that every QBO carrier is equivalent. It shows affected Designation and
Reporting Target counts, gross amount, fees, refunds or disputes, net amount,
expected QBO object count, provider capacity, privacy effect, and the next
Accounting Release affected.

A plan cannot display `Full` unless production-shaped evidence proves that all
required supported income and expense operations carry the role consistently.

### Hard blockers and tenant-confirmable warnings

Asym blocks activation or the affected future release only for an objective
failure:

- the provider plan is unbalanced or not equivalent to the Canonical
  Accounting Effect;
- source or mapping coverage is incomplete, duplicated, or overlapping;
- the selected carrier is unsupported for the exact provider operation or
  field position;
- two required roles collide in a single-valued QBO field;
- a provider reference is absent, inactive, locked, deleted, wrong-type,
  wrong-parent, wrong-account, wrong-currency, or outside the connected realm;
- subscription, preference, scope, relationship, capability, or provider
  capacity cannot support the plan;
- Tenant, Legal Entity, destination, realm, environment, currency, period, or
  security boundaries do not agree;
- the choice would send data prohibited by governing privacy or publication
  policy; or
- material reporting detail would be lost without an explicit authorized
  summary.

The following are warnings that an authorized tenant finance actor may confirm:

- unusual but technically valid carrier usage;
- high projected object count;
- approaching provider capacity;
- revenue-only, expense-only, transaction-wide, project-specific, split, or
  Asym-only coverage;
- fragmented QBO reporting;
- deterministic partitioning that increases provider transaction count;
- bank-matching or reconciliation consequences;
- privacy consequences of policy-approved finance-safe labels or
  provider-visible metadata; and
- an arrangement that is technically supported but differs from Asym's
  recommended default.

Every warning names the concrete accounting, reporting, operational, privacy,
or capacity consequence. Confirmation is one audited action. It does not create
a standing approval workflow.

### Capability certification

A QBO Carrier Plan cannot activate from product-name assumptions alone. Its
**QBO Capability Certificate** records fresh, destination-scoped evidence that
includes, as applicable:

- connected company, realm, environment, country, edition or OfferingSku,
  home currency, and multi-currency state;
- accounting preferences, including Class and Location availability and
  transaction-versus-line configuration;
- Projects availability, partner scope, relationship constraints, and
  supported entities;
- provider API scopes and authorization health;
- closed-book and accounting-period constraints;
- active and inactive provider object counts and remaining capacity;
- Accounts, Items, Classes, Locations, Customers, Projects, and other bound
  object identifiers, types, parents, currencies, activity, routing accounts,
  relationships, SyncTokens, and metadata timestamps;
- entity and exact field-position support for the selected D5 recipes;
- provider API, query, batch, line, throttling, and timeout constraints; and
- the provider-contract and adapter versions used to interpret the evidence.

Activation rereads every referenced object and validates the draft against one
current snapshot. Release preflight rechecks all material capabilities and
references immediately before execution.

Webhook and change-data-capture events are drift hints, not sufficient proof.
Processing tolerates duplication and out-of-order arrival, performs bounded
CDC recovery, and runs periodic complete paginated verification so missed or
truncated change feeds cannot leave a plan falsely healthy.

### Mixed targets and deterministic partitioning

When one source or settlement contains multiple Accounting Reporting Targets,
the compiler must use one of three truthful outcomes:

1. a certified line-level carrier;
2. complete, non-overlapping deterministic provider transactions partitioned
   by a transaction-wide carrier; or
3. an actionable blocker before delivery.

The compiler cannot:

- use the first target for the entire transaction;
- copy one target to all lines;
- drop a target;
- emit one source amount through several target carriers as duplicated
  accounting meaning;
- cross Legal Entity, destination, currency, accounting date or period, tax
  disposition, canonical account role, required semantic dimension, or
  governing version; or
- rely on reconciliation to discover a preventable classification error.

The Mapping Coverage Manifest proves that every partition is complete and
disjoint and that their sum is exactly the same Canonical Accounting Effect.

### Immutable lifecycle and drift

Each QBO Carrier Plan Version is scoped to one Tenant, Legal Entity,
Accounting Destination, QBO realm, and environment and records:

- plan family, allowed carrier and position rules, and the pinned or digested
  compatible D6 binding set;
- D5 recipe compatibility;
- D6 mapping compatibility;
- QBO Reporting Visibility levels;
- capability and provider-object evidence;
- privacy and object-provisioning posture;
- compiler, adapter, and provider-contract versions;
- draft, validation, activation, effective date, actor, reason, and evidence
  digests; and
- successor or retirement lineage.

Exactly one version may be active prospectively for a scope and effective
interval. Activation uses compare-and-swap semantics so simultaneous
activations cannot create overlap. A stale preview cannot activate.

Provider drift is classified:

- rename refreshes current display metadata without changing identity or
  history;
- inactive, archive, deletion, reparenting, relationship, type, account
  routing, currency, preference, subscription, scope, authorization, closed
  period, or capability change creates `Attention needed`;
- only affected future releases stop;
- in-flight and historical releases retain their pinned plan and evidence; and
- repair creates and activates a prospective successor after exact preview.

Plan health, Accounting Release readiness, provider delivery, reconciliation,
incident, and authorization truth remain separate.

### Provider execution and evidence

Every planned provider operation records:

- Tenant, Legal Entity, destination, realm, environment, and release identity;
- pinned D4, D5, D6, and D7 versions;
- deterministic operation identity;
- QBO `requestid` and a compact, stable, human-recognizable reference where the
  provider entity supports one;
- exact request digest without unsafe raw PII duplication;
- complete source, effect-line, mapping-target, and provider-operation lineage;
- attempt, response, ambiguity, lookup, exact readback, and reconciliation
  state;
- provider object identifier, type, SyncToken, relevant references, amounts,
  links, and metadata; and
- typed owner, cause, impact, and recovery action for any exception.

The delivery state machine distinguishes:

- planned;
- preflight-blocked;
- ready;
- sending;
- outcome unknown;
- provider-accepted;
- readback-verified;
- delivered;
- reconciliation exception; and
- reconciled.

A transport timeout after submission is not a failed operation and cannot be
blindly retried. The executor uses the same idempotency identity, performs
provider lookup or replay-safe recovery, reads the exact native object by
provider ID, and compares material references, amounts, links, dimensions, and
dates. Partial graphs retain accepted operations and resume only proven-missing
work.

HTTP success, a matching total, a generated artifact, or the presence of a QBO
object alone does not prove provider effect equivalence.

D2's Accounting Evidence Artifact is retained for every release. It is not an
automatic second delivery lane. A direct QBO failure never silently converts
the same release to staff-mediated import.

### Bookkeeper-first QBO workspace

The ordinary experience is one page:

**Accounting → Posting profile → QuickBooks setup**

The header shows:

- connected QBO company and realm;
- Legal Entity and Accounting Destination;
- home currency;
- single-posting-owner scope;
- active and draft QBO Carrier Plan versions;
- capability and authorization health;
- last successful provider verification; and
- one quiet status with one primary action.

#### Step 1 — How do you already track funds?

Staff choose an accounting outcome in plain language:

- **Use Classes for funds or ministries** — recommended when compatible;
- **Keep QuickBooks summarized** — exact detail remains in Asym; or
- **Match our existing QuickBooks setup** — use bounded Accounts, Items,
  Classes, Locations, Customers, Projects, or a certified combination.

Asym explains the recommendation and detected compatibility. It does not
require staff to learn every QBO field before proceeding.

#### Step 2 — Confirm only the required roles

The form displays only unresolved roles required by the chosen plan and D5
recipes. `Advanced accounting setup` reveals the bounded role matrix and
coverage consequences without exposing raw provider payloads.

Provider selectors:

- search and paginate on the server beyond 100 and 1,000 objects;
- filter by active state, provider type, account type, parent, currency, and
  compatibility;
- display account number or fully qualified name where safe;
- identify unavailable, inactive, capacity-constrained, or type-incompatible
  choices;
- use stable provider identifiers as identity; and
- never silently create, fuzzy-match, substitute, or revive an object.

Provider-object provisioning, when later authorized, remains D6's separate
previewed, resumable, idempotent operation and never partially activates a
plan.

#### Step 3 — Inspect coverage and exceptions

Compact cards show:

- Full income and expense;
- Revenue only;
- Expense only;
- Transaction-wide;
- Project-specific;
- Split reporting;
- Kept in Asym only; and
- Needs attention.

The ordinary view shows actionable exceptions. `View all` provides the complete
searchable catalog. Filters, saved personal views, density controls, and
cross-page selection support high-volume finance work.

Cross-page actions state whether staff selected named rows, the current page,
or all rows matching the active filter. A persistent action bar shows selected
count, affected amount, proposed future coverage, and one bounded action.

#### Step 4 — Review production-shaped output

The unsent preview includes representative:

- online settlement;
- mixed-target payout;
- offline Deposit Group;
- fee;
- refund or chargeback;
- correction;
- expense or payable flow when Phase 21 supplies an approved fact; and
- restricted-worker safe-label behavior.

For each native QBO object, staff can inspect:

- object type and sequence;
- source purpose and accounting date;
- Account, Item, Class, Location, Customer, Project, or Asym-only result;
- transaction- versus line-level placement;
- gross, fee, refund or dispute, and net amounts;
- complete debit-and-credit effect;
- partition count and bank-matching effect;
- projected monthly object volume and remaining capacity;
- provider reports that will and will not contain the dimension;
- exact detail retained in Asym; and
- privacy effect.

The preview is labeled:

`Preview only — nothing has been sent to QuickBooks.`

The one primary action is `Review and activate`. Activation is atomic,
prospective, and audited. Healthy plans require no recurring approval.

### Accessibility and responsive behavior

- Outcome choices use native radio-group semantics.
- Provider selectors are labeled searchable comboboxes with provider type,
  status, currency, and account context in accessible names.
- Mapping, coverage, and native preview tables use semantic headers and
  keyboard-complete selection and actions.
- Error summaries receive focus and link to each blocker.
- Status always uses text and iconography, not color alone.
- Validation, provider refresh, preview generation, and asynchronous
  completion use appropriate status announcements.
- Currency is announced with every material amount.
- Narrow layouts use readable role and exception cards without hiding
  evidence; mass configuration remains desktop-optimized while review and
  individual repair remain usable on mobile.
- Reduced-motion preferences are respected, and no animation communicates
  accounting state by itself.

### Tenant safety, privacy, and security

- Every plan, binding, catalog object, cache, queue item, operation, readback,
  webhook, artifact, log, audit event, and uniqueness constraint is scoped by
  Tenant, Legal Entity, Accounting Destination, connection, realm,
  environment, and provider object type where applicable.
- Realm identity is verified on authorization, refresh, read, write, webhook,
  and retry boundaries.
- OAuth credentials are encrypted, access is least-privileged, rotation and
  revocation are supported, and secrets never enter previews, logs, exports,
  or client state.
- Provider-bound fields have data classifications. Restricted identities, care
  data, unrestricted narrative, secrets, and unapproved donor or missionary
  PII cannot enter QBO labels, memos, references, logs, screenshots, mock data,
  or artifacts.
- A summary Customer may be used for aggregated plans through an existing or
  separately provisioned provider binding. D7 does not create, synchronize,
  match, select, or represent per-donor QBO Customers.
- Restricted workers use approved aliases or finance-safe codes under their
  source publication authority.
- Support access is tenant-authorized, time-bounded, audited, and cannot bypass
  plan activation or Legal Entity authority.
- One posting owner is enforced for each source scope and effective interval.
  Another connector may own unrelated sources but cannot post the same
  economic activity.

### Observability and operations

Operations correlate:

`source fact → Posting Intent → Canonical Accounting Effect → Accounting Release → Mapping Coverage → QBO Carrier Plan → provider operation → exact readback → reconciliation`

Typed health and failure causes include:

- authorization;
- capability;
- mapping or carrier coverage;
- account or provider-object drift;
- subscription or preference drift;
- privacy or isolation;
- closed period;
- provider validation;
- throttling or backpressure;
- outcome ambiguity;
- exact-readback mismatch;
- effect inequivalence; and
- reconciliation difference.

Staff see cause, affected count and amount, next release, owner, and one
recommended repair. Support sees PII-safe correlation and evidence. Metrics
cover coverage, plan health, verification age, queue age, throttling,
ambiguous outcomes, provider drift, readback mismatch, object capacity, and
reconciliation exceptions.

Product-owned workload shaping, throttling, batching, backoff, and provider
deadline management are not tenant tuning controls.

### Release gates inherited from D7

No QBO Carrier Plan or direct QBO delivery reaches production without:

- golden D4 Effect-to-D5 Recipe-to-D6 Target-to-D7 Carrier fixtures for every
  certified plan, source purpose, provider entity, and field position;
- property tests proving balance, effect equivalence, source conservation,
  exactly-once mapping coverage, deterministic compilation, and complete,
  disjoint partitioning;
- QBO subscription, preference, line-versus-transaction, account type, Item
  routing, Class/Location capacity, Project scope, relationship, currency,
  period, and authorization capability tests;
- mixed-target settlement, payout, refund, chargeback, offline deposit,
  correction, and approved-expense scenarios;
- negative tests for first-target copying, duplicate carrier meaning, role
  collision, unsupported field placement, silent dimension loss, Journal
  Entry fallback, and provider-default behavior;
- timeout-after-acceptance, duplicate retry, 429, 5xx, stale SyncToken,
  partial graph, ambiguous outcome, lookup-before-retry, and exact-readback
  mismatch tests;
- duplicated, missing, delayed, and out-of-order webhook tests plus CDC
  truncation, 30-day boundary, and complete paginated verification tests;
- randomized and production-shaped scale tests at 1,200 and 10,000
  Designations, large provider catalogs, provider query and line limits, and
  seasonal workload;
- simultaneous activation, activation-versus-release, preview-versus-drift,
  catalog-refresh, external-edit, and single-posting-owner race tests;
- negative Tenant, Legal Entity, destination, connection, realm, environment,
  currency, cache, webhook, queue, artifact, and idempotency isolation tests;
- privacy tests for donor identity, restricted workers, unsafe labels, memos,
  references, logs, mock previews, and artifacts;
- accessible keyboard, focus, screen-reader, live-status, error-summary,
  responsive, and cross-page bulk-action tests;
- bookkeeper usability evidence for Class-led, account-led, Item-led,
  Project-led, combined, and QBO-summary tenants; and
- dry-run comparison, low-volume tenant canary, operation kill switch, and
  append-only recovery evidence.

### Explicit non-goals from D7

- No mandatory Class-led bookkeeping.
- No claim that one QBO dimension is the universal nonprofit fund field.
- No arbitrary QBO field, payload, formula, predicate, precedence, or fallback
  editor.
- No provider object deciding D4 policy or D6 source resolution.
- No silent QBO preference, chart, Item, Customer, Project, or object change.
- No donor/customer/contact synchronization or per-donor provider contact
  creation; that requires a separate future purpose-specific contract.
- No automatic per-Designation provider-object proliferation.
- No mutable plan used by historical releases.
- No per-release carrier override.
- No label-based identity or fuzzy provider matching.
- No first-target, copy-to-all, drop, plug, suspense, or provider-default
  behavior for mixed targets.
- No silent carrier, recipe, Journal Entry, provider object, or delivery-lane
  substitution.
- No HTTP success, matching total, artifact generation, or provider object
  existence treated as proof of exact provider effect.
- No stop-the-world failure when an exception affects only one plan, mapping,
  release partition, or operation.
- No recurring approval for healthy releases governed by an active proved
  plan.

## D8 — Tenant-owned, capability-certified Xero Carrier Plans

**Status:** Ratified and adversarially hardened on 2026-07-26.

Xero is not QuickBooks Online with different field names. It has two active
Tracking Category slots, provider-specific Account and transaction rules,
separate Projects semantics, bounded report shapes, and no public Accounting
API operation that reconciles a bank-statement line. Missions organizations
also use Xero differently: some use Tracking for ministries or funds, some use
an accountant-designed Account structure, some combine distinct dimensions,
and high-cardinality organizations may need exact Asym detail with a truthful
Xero summary.

D8 therefore adopts immutable, prospective, tenant-owned **Xero Carrier
Plans** with:

- guided Tracking-led, Account-led, Combined, and
  Xero-summary/Asym-detail choices;
- a derived, visible **Xero Tracking Budget**;
- one bounded, recipe-specific semantic-role matrix;
- existing-book compatibility;
- explicit **Xero Reporting Visibility**;
- destination-specific capability certification;
- exact native preview and readback;
- Xero-owned bank-reconciliation truth; and
- one quiet, exception-first finance workspace.

The adversarial review hardened four points that are mandatory:

1. Xero Projects is not a general fund dimension and is unavailable unless an
   exact D5 source-purpose recipe separately proves its write, readback,
   effect-equivalence, and reporting behavior.
2. Xero's 200-column Profit and Loss API limit blocks a plan only when that
   plan promises the affected combined report. A valid split-report or
   Asym-detail arrangement remains tenant-confirmable and is labeled honestly.
3. Stable provider identity does not prove stable accounting meaning. A
   nontrivial Account or Tracking rename pauses only affected future work for
   lightweight same-meaning confirmation or rebinding.
4. An Account-led binding is never merely `Reporting Target → Account`. Its
   coordinate includes the Accounting Reporting Target, canonical account
   role, D5 source-purpose recipe, provider entity, and exact field position so
   one Account cannot silently replace income, fee, refund, expense, payable,
   clearing, or bank meaning.

### Authority boundary

D8 consumes and cannot supersede:

1. D4's immutable Accounting Posting Intent, Canonical Accounting Effect,
   Source Coverage Manifest, accounting date, currency, tax treatment,
   canonical account roles, and accountant-confirmed policy;
2. D5's Posting Profile, posting grain, provider-native transaction graph, and
   product-owned source-purpose recipe;
3. D6's Designation Mapping Version, Accounting Reporting Targets, typed
   destination bindings, Mapping Coverage Manifest, and separately previewed
   provider-object provisioning;
4. D2's Accounting Release, Accounting Evidence Artifact, exclusive delivery
   lane, outcome-unknown recovery, and delivery/reconciliation truth; and
5. D3's Legal Entity, Accounting Destination, authorization, currency, and
   financial isolation boundary.

D8 owns only the allowed Xero carrier kinds, recipe-supported positions,
role-collision rules, visibility contract, and capability proof. D6 owns each
exact semantic-role or Reporting-Target-to-provider-object binding instance;
D8 validates that binding against the active Xero Carrier Plan and pins or
digests the compatible D6 binding set. D8 cannot:

- remap a Designation;
- create an Accounting Reporting Target;
- choose or change posting grain;
- select a different provider-native recipe;
- change a debit, credit, amount, date, currency, tax treatment, or source;
- reinterpret donor restriction, net-asset treatment, or legal ownership;
- declare a provider write delivered or reconciled; or
- turn provider configuration into accounting truth.

Every Accounting Release pins the exact D4, D5, D6, and D8 versions that
governed it. Current Xero labels, live provider state, or a successor plan
cannot reinterpret a frozen release.

### Tenant-freedom rider

The tenant owns its books. Asym recommends a compatible outcome but does not
restructure an existing Xero organization merely because its arrangement is
unusual.

- Existing Xero objects are selected by stable organization-scoped
  identifiers.
- Asym does not commandeer an active Tracking Category, change an Account,
  create hundreds of Accounts or Tracking Options, alter tax defaults, or
  repurpose an existing dimension silently.
- Provider-object creation remains D6's separate, previewed, authorized,
  resumable operation. It is never a side effect of plan activation.
- One tenant-authorized finance actor may configure and activate a plan.
- Tenant policy may require a second approver; dual approval is not a platform
  default.
- A technically supported unconventional choice presents concrete
  consequences and one audited confirmation rather than approval bureaucracy.
- Healthy plans require no recurring confirmation.
- Plan changes are prospective. Prior and in-flight Accounting Releases remain
  pinned.

Tenant control does not include permission to produce an unbalanced,
non-equivalent, duplicated, cross-tenant, unsupported, privacy-violating, or
silently lossy accounting result.

### Guided plan families

#### Tracking-led

One existing or explicitly provisioned Xero Tracking Category carries the
Accounting Reporting Target when:

- the tenant already uses or deliberately chooses that reporting model;
- the category and option inventory fits the certified provider envelope;
- the selected D5 recipes expose a supported Tracking position for every
  reporting surface claimed;
- another semantic role does not already consume the same category; and
- the resulting reporting limitations are disclosed.

The second active category remains tenant-owned. It may carry functional
expense, site, region, or another distinct role when the exact recipes and
reporting shape are certified. Asym never assumes that the second category is
available.

#### Account-led

An accountant-confirmed Xero Account structure may carry fund or ministry
meaning when that is genuinely how the tenant designed its general ledger.
Accounts remain financial-statement classifications, not cosmetic tags.

Every D6 Account-led typed provider carrier binding validated by D8 includes:

- Accounting Reporting Target;
- canonical account role;
- D5 source purpose and provider-native recipe;
- provider entity and exact line or transaction position;
- stable Xero Account identifier;
- expected Account type, class, status, currency, tax compatibility, and
  payment eligibility where applicable; and
- immutable Xero Carrier Plan Version.

The preview shows chart growth, object-provisioning work, operation count, and
reporting consequences. Asym does not collapse several canonical account roles
into one "fund account" or create a plug balance to make the plan compile.

#### Combined

A Combined plan uses Accounts and one or two Tracking Categories only for
distinct meanings. For example, Accounts may retain natural classification,
one Tracking Category may carry ministry, and another may carry functional
expense.

The plan must prove that:

- each semantic role has exactly one primary carrier at each certified recipe
  position;
- no single-valued position has a role collision;
- mixed-target work is line-representable or completely partitioned;
- the provider operation graph remains effect-equivalent; and
- every promised Xero report remains producible or is explicitly disclosed as
  split.

Combined does not mean arbitrary. There are no formulas, predicates,
precedence rules, wildcard mappings, raw payload fields, or blank fallthrough.

#### Xero summary / Asym detail

High-cardinality tenants may keep exact Designation and Accounting Reporting
Target detail in the Accounting Evidence Artifact while Xero receives a
balanced, policy-authorized summary.

The plan states:

- the exact semantic detail retained only in Asym;
- the grouping represented in Xero;
- which Xero reports are and are not available;
- how the Xero summary ties to the Canonical Accounting Effect and Mapping
  Coverage Manifest; and
- the staff-facing path from the Xero record to the exact Asym evidence.

Summary is a selected representation with declared coverage. It is not a
failure fallback, loss of source lineage, or permission to merge incompatible
Legal Entities, currencies, accounting dates, tax treatments, or canonical
account roles.

### Bounded recipe-specific semantic-role matrix

The advanced surface is a fixed matrix of known accounting meanings. D8
defines which carrier kinds and field positions are permitted for each role
and recipe; it does not create a second binding authority. Every D6 typed
provider carrier binding validated by the plan contains:

- Tenant;
- Legal Entity;
- Accounting Destination;
- Xero organization and technical provider tenant identifier;
- provider environment;
- Xero Carrier Plan Version;
- Accounting Reporting Target where applicable;
- canonical account role;
- D5 source purpose and provider-native recipe;
- provider entity and exact transaction- or line-level position;
- bounded semantic role;
- stable Xero object identifier and expected properties; and
- declared Xero Reporting Visibility.

The matrix may represent:

- destination bank, undeposited funds or clearing, contribution income, fee,
  refund, chargeback or dispute, expense, payable, and other D4-governed
  canonical account roles;
- Accounting Reporting Target for a fund, ministry, campaign, missionary, or
  another D6-approved grouping;
- functional expense;
- branch, site, region, or another genuine operational reporting dimension;
- a separately certified grant, project, or profitability role; and
- a summary accounting counterparty or source-authorized non-donor party when
  the D5 recipe requires one.

Exactly one primary carrier represents a role at one certified recipe
position. Different roles may use different carriers. A role may use different
supported positions across operation families only when the plan declares the
resulting visibility and the complete graph remains effect-equivalent.

The matrix is not:

- a general field-mapping language;
- an accounting-policy editor;
- a recipe or payload builder;
- a per-Designation rules engine;
- a per-release override surface;
- a formula or conditional evaluator;
- a mutable live priority list; or
- a provider-name matching system.

### Certified Xero meanings

#### Accounts

Xero Accounts carry genuine general-ledger meaning. The plan validates stable
identity, Account type and class, status, currency, system or control posture,
tax compatibility, payment eligibility, and support at the exact provider
position.

Provider selectors show Account code and name, use live server-side search and
pagination, filter incompatible or archived Accounts, and never ask staff to
type an Account code from memory. A tenant may deep-link to Xero to create or
repair an Account, then explicitly refresh the Asym catalog.

#### Tracking Categories and Options

Tracking Categories are Xero's bounded segment-reporting dimensions. They do
not alter the Canonical Accounting Effect.

The derived **Xero Tracking Budget** displays:

- zero, one, or two active categories;
- total active plus archived categories against Xero's current total limit;
- active and archived option counts for each category;
- the provider's current recommended option envelope;
- which semantic role, if any, consumes each active slot;
- the one-category report-column count;
- the two-category Cartesian report-column count, including archived options
  where the provider report does so;
- the next plan version or release affected; and
- the exact reporting consequence of the proposed choice.

The Tracking Budget is a current capability disclosure, not a stored quota,
source authority, or tenant tuning control.

Xero's recommendation of approximately 100 options per category is a warning
threshold, not an invented hard API limit. Xero's 200-column Profit and Loss
API limit blocks activation only when the plan promises that exact required
report. Otherwise an authorized tenant may accept split Xero reporting or
Asym-only detail after the limitation is stated plainly.

An option is bound by stable identifier within its category. Delete and
recreate under the same name produces a new identity and requires rebinding.
Case-, whitespace-, or punctuation-only label cleanup may refresh display
metadata. Any other Account, category, or option rename is potential semantic
drift and creates one quiet `Attention needed` action for affected future work:
`Confirm same meaning` or `Choose a different Xero value`.

#### Items

Xero Items are products or services with sales or purchase defaults. A
non-inventory Item may support a D5-native line recipe when it has legitimate
product/service meaning and its Account and tax routing agree with D4.

Items are not an initial general Accounting Reporting Target carrier. Tracked
inventory semantics, quantity-on-hand, cost-of-goods-sold behavior, or Item
defaults cannot be introduced merely to simulate a fund dimension. Delete and
recreate under the same code or name is a new identity.

#### Contacts

Xero Contacts are counterparties. A source-authorized summary Contact may
support an aggregate provider-native recipe. Contact identity uses ContactID,
never display name.

D8 does not create, synchronize, match, select, or represent per-donor Xero
Contacts. A Contact cannot simultaneously carry donor identity and a different
fund, missionary, or reporting role. Contact addresses, tax identifiers, bank
details, and other PII are not imported or written unless a separate
purpose-specific contract explicitly requires and authorizes them.

#### Projects

Xero Projects is a separate, contact-linked time, cost, and profitability
product. It is not offered as a general fund or ministry carrier.

A Project role may appear only when a specific D5 source-purpose recipe has
production-shaped proof of:

- exact supported accounting linkage;
- required Xero plan and OAuth scope;
- Contact relationship;
- currency behavior;
- write and exact readback;
- complete provider effect equivalence; and
- truthful report visibility.

Absent that proof, the role is unavailable rather than approximated with a
Contact, Tracking Option, Account, Item, reference, or Manual Journal.

#### Manual Journals, references, and descriptions

Manual Journal remains D5's explicit exceptional accountant-adjustment recipe.
It is never a carrier fallback and cannot target bank, accounts-receivable,
accounts-payable, retained-earnings, or other provider-reserved Accounts.
Clearing Accounts may be used only when the accountant-confirmed D4 policy and
the exact D5 recipe require them.

References, descriptions, URLs, and attachments may carry approved lineage or
human context. They never satisfy balance, mapping coverage, accounting
meaning, or Xero Reporting Visibility.

### Xero Reporting Visibility

Every plan and production-shaped preview derives visibility separately for
each claimed semantic role and relevant operation family:

- **Full income and expense**;
- **Revenue only**;
- **Expense only**;
- **Transaction-wide**;
- **Tracking-limited**;
- **Project-specific**, only when separately certified;
- **Split across Xero dimensions or reports**; or
- **Kept in Asym only**.

Coverage is also shown for gross gifts, fees, refunds, disputes, corrections,
offline deposits, approved expenses, clearing, and cash movement where they
matter. A role is not `Full` merely because it appears on contribution-income
lines or because a matching grand total exists.

The workspace uses a concrete sentence such as:

`72 ministry totals will appear in Xero. Exact detail for 1,200 Designations
remains in Asym. A combined Ministry × Function Profit and Loss report is not
available from Xero because it would require 216 columns.`

Xero Reporting Visibility is not Source Coverage, Mapping Coverage, provider
delivery, or reconciliation truth.

### Hard blockers and tenant-confirmable warnings

Asym blocks activation or only the affected future release for an objective
failure:

- imbalance or provider-effect inequivalence;
- missing, overlapping, or duplicate Source or Mapping Coverage;
- unsupported carrier at the exact D5 recipe, provider entity, or field
  position;
- a collision between required roles in one single-valued position;
- an absent, archived, deleted, reserved, wrong-type, wrong-class,
  wrong-category, wrong-parent, wrong-currency, tax-incompatible, or otherwise
  invalid provider object;
- a third active Tracking Category or another impossible provider state;
- a required promised Profit and Loss report above the provider's current hard
  column limit;
- an Account-led binding that does not resolve the full target, canonical
  account role, recipe, and field-position coordinate;
- a Manual Journal using a bank or reserved Account;
- missing organization, permission, granular scope, plan feature, relationship,
  or evidence tier required by the selected plan;
- Tenant, Legal Entity, destination, Xero organization, environment, currency,
  accounting period, or security-boundary mismatch;
- prohibited or unsafe provider-visible data; or
- material detail loss without an explicitly selected authorized summary.

The following are warnings that one authorized tenant finance actor may
confirm:

- approaching or exceeding Xero's recommended Tracking Option envelope while
  remaining technically supported;
- consuming the final active Tracking Category;
- high Account, Tracking Option, line, transaction, or API-operation growth;
- an unusual but technically valid Account-led or Combined arrangement;
- revenue-only, expense-only, Tracking-limited, split, or Asym-only visibility;
- a combined report that cannot be produced but is not promised by the plan;
- deterministic partitioning that increases provider transaction count;
- Xero bank-matching or staff reconciliation consequences;
- finance-safe label or provider-visible metadata consequences; and
- a valid arrangement that differs from Asym's recommendation.

Each warning states affected counts and amounts, the exact Xero consequence,
the evidence retained in Asym, and the next release affected. Confirmation is
one audited action, not a recurring approval workflow.

### Xero Capability Certificate

A plan cannot activate from product-name assumptions. Its time-bounded **Xero
Capability Certificate** records one current, destination-scoped snapshot
including, as applicable:

- Asym Tenant, Legal Entity, Accounting Destination, environment, and
  connection;
- user-facing Xero organization identity and technical provider tenant
  identifier;
- organization country, base currency, multi-currency state, tax settings,
  lock dates, and provider plan capabilities;
- exact granular OAuth scopes and authorizer or role sufficiency;
- provider app/certification tier and applicable concurrency, minute, daily,
  request-size, batch, paging, and volume limits;
- active and archived Tracking Categories and Options;
- one- and two-category report-column projections;
- stable Accounts, Tracking Options, Items, Contacts, and any separately
  certified Projects referenced by the plan;
- expected provider-object types, classes, statuses, currencies, Account and
  tax routing, payment eligibility, category membership, and relationships;
- support for every selected D5 recipe, provider entity, and exact field
  position;
- current evidence and readback tier, including whether optional Journals
  access is available;
- provider-contract, compiler, and adapter versions; and
- verification timestamp, expiry, actor, evidence digest, and reason.

New connections request read scopes for discovery where possible and add write
scopes only when the tenant activates behavior that requires them. D8 records
scope sufficiency but does not replace D2/D3 connection and credential
authority.

Activation rereads every referenced object and validates one current snapshot.
Release preflight rechecks material references and capabilities immediately
before execution. Webhooks are drift hints, not proof; provider resources
without useful webhook coverage receive bounded incremental refresh plus
periodic complete paginated verification.

The certificate is not copied across Xero organizations, destinations, Legal
Entities, environments, or connections.

### Mixed targets and deterministic partitioning

When one source or settlement contains several Accounting Reporting Targets,
the compiler has exactly three truthful outcomes:

1. use a certified line-level Xero carrier;
2. create complete, disjoint provider operations partitioned for a supported
   transaction-wide representation; or
3. block before delivery with one actionable explanation.

The compiler cannot:

- use the first target for the whole transaction;
- copy one target to every line;
- drop or duplicate a target;
- use a summary Contact, Item, memo, or reference as an undeclared substitute;
- cross Legal Entity, destination, organization, environment, currency,
  accounting date, period, tax treatment, canonical account role, semantic
  role, or governing version; or
- rely on later reconciliation to detect preventable classification loss.

The Mapping Coverage Manifest proves that partitions are complete and
non-overlapping and that their sum preserves the Canonical Accounting Effect.

### Immutable lifecycle and drift

Each Xero Carrier Plan Version is scoped to one Tenant, Legal Entity,
Accounting Destination, Xero organization, environment, and effective interval
and records:

- guided plan family, allowed carrier and position rules, and the pinned or
  digested compatible D6 binding set;
- D5 recipe and D6 mapping compatibility;
- Xero Reporting Visibility;
- capability and provider-object evidence;
- Tracking Budget snapshot and report projections;
- privacy and provisioning posture;
- compiler, adapter, provider-contract, and evidence-tier versions;
- draft, preview, validation, activation, effective date, actor, reason, and
  evidence digests; and
- successor or retirement lineage.

Exactly one version may be active prospectively for a scope and interval.
Compare-and-swap activation prevents simultaneous overlap. A stale preview
cannot activate.

Drift is classified:

- case-, whitespace-, or punctuation-only label cleanup may refresh current
  display metadata;
- any other Account, category, or option rename requires lightweight
  same-meaning confirmation or rebinding for affected future work;
- archive, deletion, delete-and-recreate, type or class change, Account or tax
  routing change, category move, relationship change, currency change, lock
  date, scope, permission, provider-plan, connection, or capability change
  creates `Attention needed`;
- only affected future work stops;
- in-flight and historical releases retain their pinned plan and evidence; and
- repair creates a prospective successor after a fresh preview.

Plan health, release readiness, provider delivery, provider-object readback,
settlement reconciliation, Xero bank reconciliation, incident, and
authorization truth remain separate.

Reauthorization to the same exact Xero organization may repair a connection.
A different Xero organization is a new Accounting Destination binding and
cannot inherit provider identifiers or plan evidence.

### Provider execution, readback, and bank-reconciliation truth

D8 inherits D2's operation-granular, ambiguity-safe direct-delivery contract.
Every Xero operation records:

- pinned Tenant, Legal Entity, destination, organization, environment, release,
  D4, D5, D6, and D8 identities;
- deterministic Asym operation identity and immutable payload digest;
- one Xero idempotency key used only with that unchanged operation;
- compact source reference and safe source URL where supported;
- request, attempt, response, ambiguity, lookup, exact-object readback, and
  reconciliation evidence;
- provider object identifier, type, relevant references, amounts, dates,
  Accounts, Tracking, tax, currency, status, and links; and
- typed owner, cause, impact, and recovery action for an exception.

Xero's short idempotency cache does not replace durable Asym identity. A
timeout or disconnect after submission creates `Outcome unknown`; it is not an
ordinary failure. Recovery queries for the exact existing result before any
new write. Partial graphs preserve accepted operations and resume only
proven-missing work.

Exact object readback is not automatically Xero journal or ledger proof.
Baseline D8 readiness cannot depend on optional Journals API access. When that
access is unavailable, the workspace truthfully identifies the object-readback
evidence tier and retains the stronger canonical Asym evidence.

The Xero Accounting API cannot reconcile a bank-statement line. Product copy
uses:

- `Recorded in Xero`;
- `Verified against the Xero record`; and
- `Ready to reconcile in Xero`.

It never uses `Reconciled in Xero` based on object creation, readback, a
matching net total, a provider `IsReconciled` field, or Asym settlement
reconciliation alone.

Direct Xero failure never silently changes the same Accounting Release to
staff-mediated import. D2's Accounting Evidence Artifact remains available
without becoming a second delivery lane.

### Bookkeeper-first Xero workspace

The ordinary experience is one page:

**Accounting → Posting profile → Xero setup**

The header shows:

- connected Xero organization;
- Legal Entity and Accounting Destination;
- base currency;
- connection and authorization health;
- single-posting-owner status;
- active and draft Xero Carrier Plan versions;
- last successful capability verification; and
- one quiet status with one primary action.

#### Step 1 — How do you already track funds in Xero?

Staff choose:

- **Use a Tracking Category for funds or ministries** — recommended when it
  fits the existing books and certified capacity;
- **Use our existing Account structure** — for genuine accountant-designed
  Account-led books;
- **Keep Xero summarized** — exact detail remains in Asym; or
- **Match our existing Xero setup** — one bounded Combined configuration.

The recommended card explains why it fits. The ordinary path does not expose
provider schema or internal terms.

#### Step 2 — Confirm only what is unresolved

The page imports the current organization configuration and displays only
roles required by the chosen plan and D5 recipes.

Provider selectors:

- are searchable, server-paginated comboboxes;
- display code, name, type, status, currency, category, and compatibility where
  relevant;
- use stable provider identifiers;
- filter or explain incompatible choices;
- identify archived, missing, capacity-constrained, or permission-constrained
  values;
- provide `Open in Xero` and explicit `Refresh from Xero` actions; and
- never silently create, fuzzy-match, substitute, reactivate, or repurpose an
  object.

`Advanced accounting setup` reveals the fixed semantic-role matrix. It does
not reveal raw API payloads.

#### Step 3 — Inspect capacity, visibility, and exceptions

Compact cards answer:

- How many Tracking Category slots are available?
- How many active and archived options exist?
- What will staff see in Xero?
- What remains exact in Asym?
- Which reports are split or unavailable?
- How many Xero objects and operations will this produce?
- What requires attention before activation?

Warnings remain reviewable without being noisy. Blocking errors appear first,
grouped by one repair action, with affected count and amount.

#### Step 4 — Preview and activate

One production-shaped, unsent preview includes representative:

- processor settlement;
- refund or dispute;
- offline deposit;
- approved expense contract;
- correction; and
- mixed-target operation.

The preview shows the Canonical Accounting Effect beside the proposed Xero
objects, role placement, Tracking values, visibility, source coverage, expected
object count, and evidence tier.

Persistent copy says:

`Preview only — nothing has been sent to Xero.`

The one primary action is `Review and activate`. Activation is atomic,
prospective, and audited. Healthy plans require no further workflow.

### Accessibility and responsive behavior

- Guided choices use native radio-group semantics.
- Provider selectors have accessible names containing provider type, status,
  Account or category context, and currency where material.
- Capacity, mapping, preview, and exception tables have semantic headers,
  captions, and keyboard-complete actions.
- Error summaries receive focus and link to the exact unresolved role.
- Status uses text and iconography, never color alone.
- Refresh, validation, preview, and activation progress use appropriate live
  announcements without chatty row-level noise.
- Every material amount includes currency.
- Narrow layouts use readable role and exception cards; large mapping work is
  desktop-optimized while review and individual repair remain usable on
  mobile.
- Reduced-motion preferences are respected, and animation never communicates
  accounting state by itself.

### Tenant safety, privacy, and security

- Every plan, binding, catalog row, cache, queue item, webhook hint, operation,
  readback, artifact, log, audit event, and uniqueness constraint is scoped by
  Tenant, Legal Entity, Accounting Destination, connection, Xero organization
  identifier, environment, provider object type, and provider object
  identifier where applicable.
- Organization identity is verified server-side on authorization, refresh,
  read, write, retry, and webhook processing.
- OAuth credentials are encrypted and never enter previews, logs, exports,
  screenshots, client state, or artifacts.
- Granular scopes are least-privileged and capability-checked.
- Provider-visible fields have explicit data classifications.
- Restricted identities, care data, secrets, unrestricted narrative, and
  unapproved donor or missionary PII cannot enter provider labels,
  descriptions, references, Contacts, logs, mock data, or artifacts.
- Restricted workers use approved aliases or finance-safe codes under their
  source publication authority.
- Support access is tenant-authorized, time-bounded, audited, and cannot bypass
  activation or Legal Entity authority.
- One posting owner is enforced for each source scope and interval.

User-facing copy always says `Xero organization`. The provider's technical
`tenantId` remains evidence metadata so it cannot be confused with an Asym
Tenant.

### Observability and operations

Operations correlate:

`source fact → Posting Intent → Canonical Accounting Effect → Accounting Release → Mapping Coverage → Xero Carrier Plan → provider operation → exact object readback → settlement reconciliation → Xero staff reconciliation`

Typed causes include:

- authorization or scope;
- capability or provider-contract drift;
- mapping or carrier coverage;
- Account, Tracking, Item, Contact, or separately certified Project drift;
- Tracking capacity or report envelope;
- privacy or tenant isolation;
- closed period, currency, or tax mismatch;
- provider validation;
- throttling or backpressure;
- outcome ambiguity;
- object-readback mismatch;
- effect inequivalence; and
- settlement-reconciliation difference.

Staff see cause, affected count and amount, next release, owner, and one
recommended repair. Support sees PII-safe correlation and evidence.

Metrics include plan health, certificate age, active and archived Tracking
counts, calculated report columns, provider-catalog verification age, queue
age, throttling, unknown outcomes, readback mismatch, visibility level,
operation volume, and reconciliation exceptions.

Product-owned rate limiting, paging, workload shaping, backoff, provider
deadline management, and recertification are not tenant tuning controls.

### Release gates inherited and hardened by D8

No Xero Carrier Plan or direct Xero delivery reaches production without:

- golden D4 Effect-to-D5 Recipe-to-D6 Target-to-D8 Carrier fixtures for every
  certified plan, source purpose, provider entity, and exact field position;
- property tests proving balance, provider-effect equivalence, source
  conservation, exactly-once Mapping Coverage, deterministic compilation, and
  complete disjoint partitioning;
- zero, one, and two active plus zero through four total Tracking Category
  fixtures;
- 99, 100, and 101 active/archived option fixtures;
- 199, 200, and 201 calculated report-column fixtures, including archived
  options and one- versus two-category calculations;
- fixtures where both active categories already have legitimate tenant-owned
  roles;
- Account-led fixtures covering every target, canonical account role, recipe,
  provider entity, and position coordinate;
- mixed-target settlement, fee, refund, chargeback, offline deposit,
  correction, and approved-expense scenarios;
- negative tests for first-target copying, duplicate role meaning, role
  collision, unsupported field placement, silent dimension loss, Contact,
  Item, Project, reference, or Manual Journal substitution, and provider
  defaults;
- bank and reserved Account rejection for Manual Journals;
- Account and Tracking rename, archive, delete, delete-and-recreate, type,
  category, Account-routing, tax-routing, and currency drift;
- exact-object readback with and without optional Journals access;
- timeout within and beyond Xero's idempotency window, unchanged replay,
  changed-payload rejection, 429, 5xx, cached error, partial graph,
  outcome-unknown lookup, and exact-readback mismatch tests;
- missing, delayed, duplicated, and out-of-order webhook hints plus unsupported
  webhook-resource and complete paginated-verification tests;
- granular-scope, role-permission, connection-revocation, reauthorization,
  organization-succession, and provider-contract migration tests;
- randomized and production-shaped scale tests at 1,200 and 10,000
  Designations, large provider catalogs, provider request and daily limits,
  seasonal volume, and Xero-summary escape;
- simultaneous activation, preview-versus-drift,
  activation-versus-release, catalog-refresh, and single-posting-owner race
  tests;
- negative Tenant, Legal Entity, destination, connection, organization,
  environment, currency, cache, webhook, queue, artifact, and idempotency
  isolation tests;
- privacy tests for donor identity, restricted workers, unsafe labels,
  Contacts, descriptions, references, logs, mock previews, and artifacts;
- accessible keyboard, focus, screen-reader, live-status, error-summary,
  responsive, and cross-page action tests;
- bookkeeper usability evidence for Tracking-led, Account-led, Combined, and
  Xero-summary tenants; and
- demo-organization dry run, production-safe canary, connector kill switch,
  and append-only recovery evidence.

### Explicit non-goals from D8

- No mandatory Tracking-led bookkeeping.
- No claim that Xero has an unlimited or universal nonprofit fund field.
- No generic Project-led fund plan.
- No Contact, Item, reference, description, URL, attachment, or Manual Journal
  treated as a universal Accounting Reporting Target carrier.
- No arbitrary Xero field, formula, predicate, precedence, fallback, payload,
  or rules editor.
- No D8 remapping of Designations or change to D4/D5/D6 authority.
- No silent category, Account, tax, Item, Contact, Project, provider object, or
  provider preference change.
- No automatic per-Designation provider-object proliferation.
- No provider-object provisioning hidden inside activation.
- No mutable plan used by historical or in-flight releases.
- No per-release carrier override.
- No name-based identity, fuzzy matching, or delete-and-recreate relinking.
- No first-target, copy-to-all, drop, plug, suspense, or provider-default
  behavior for mixed targets.
- No silent carrier, recipe, Manual Journal, provider object, or delivery-lane
  substitution.
- No assumption that the 100-option guidance is a hard API limit.
- No universal 200-column posting prohibition when only one report shape is
  affected.
- No object readback called journal or ledger proof without that evidence.
- No Asym settlement result, Xero object, `IsReconciled` value, matching net,
  or HTTP success called completed Xero bank reconciliation.
- No donor Contact synchronization or import of Contact bank details.
- No stop-the-world failure for an isolated plan, binding, release partition,
  or operation exception.
- No recurring approval for healthy releases governed by an active proved
  plan.

### Current provider evidence for D8

Provider facts were verified against current official documentation on
2026-07-26:

- [Tracking Categories](https://developer.xero.com/documentation/api/accounting/trackingcategories/)
- [Tracking Category mapping](https://developer.xero.com/documentation/best-practices/categorising-transactions/tracking-category-mapping/)
- [Accounts and payment mapping](https://developer.xero.com/documentation/best-practices/categorising-transactions/account-mapping/)
- [Accounting API overview](https://developer.xero.com/documentation/api/accounting/overview)
- [Organizations](https://developer.xero.com/documentation/api/accounting/organisation)
- [Items](https://developer.xero.com/documentation/api/accounting/items)
- [Contacts](https://developer.xero.com/documentation/api/accounting/contacts)
- [Profit and Loss report tracking limits](https://developer.xero.com/documentation/api/accounting/reports)
- [Manual Journals](https://developer.xero.com/documentation/api/accounting/manualjournals/)
- [Journals](https://developer.xero.com/documentation/api/accounting/journals)
- [Bank-statement reconciliation boundary](https://developer.xero.com/documentation/api/accounting/bankstatements)
- [Projects](https://developer.xero.com/documentation/api/projects/overview)
- [OAuth scopes](https://developer.xero.com/documentation/guides/oauth2/scopes)
- [API limits](https://developer.xero.com/documentation/guides/oauth2/limits/)
- [Idempotent requests](https://developer.xero.com/documentation/guides/idempotent-requests/idempotency/)
- [Webhooks](https://developer.xero.com/documentation/guides/webhooks/overview/)

## D9 — Mode-honest processor settlement evidence

**Status:** Ratified and adversarially hardened on 2026-07-26.

D9 adopts **source-authoritative, mode-honest processor settlement evidence
through exact provider-attributed automatic composition when available,
bounded Stripe-balance proof otherwise, independently authoritative Processor
Payout Transfer, Bank Match, and Accounting Release truth, append-only
recovery, and one quiet exception-first finance workspace**.

Stripe does not expose one universal settlement model. Supported standard
automatic payouts can retain exact transaction-to-payout membership after
Stripe reports reconciliation complete. Manual payouts, Instant Payouts, and
some split-payout transfers do not expose exact membership. D9 preserves the
strongest evidence Stripe actually supplies without manufacturing certainty
where the provider withholds it.

### Authority boundary

D9 consumes and cannot supersede:

1. Phase 13's gift, allocation, settlement-occurrence, refund, dispute, and
   correction truth;
2. Phase 15's operational Deposit Groups and structural exclusion of
   Stripe-rail money from offline-deposit grouping;
3. D3's exact Tenant, Legal Entity, Settlement Account Binding, environment,
   currency, and destination authority;
4. D4's Accounting Posting Intent, Canonical Accounting Effect, Source Coverage
   Manifest, accounting date, and accountant-confirmed policy;
5. D5's Posting Profile, source-purpose recipe, posting grain, and single
   posting owner;
6. D6-D8's provider-neutral targets, QBO/Xero carrier plans, capability
   evidence, and reporting-visibility contracts; and
7. D2's immutable Accounting Release, exclusive delivery lane, outcome-unknown
   recovery, provider readback, and reconciliation distinctions.

D9 owns:

- exact processor account and transfer observations;
- normalized immutable Settlement Components;
- Settlement Evidence Snapshot mode and completeness;
- provider-side arithmetic conservation;
- Settlement Source Links;
- Processor Settlement Verdicts;
- processor-settlement exceptions and recovery; and
- the settlement-focused finance workspace.

D9 cannot:

- change a gift, allocation, refund, dispute, or correction;
- assign an accounting date or account treatment;
- establish or change an Accounting Reporting Target;
- prove a bank transaction from provider transfer status;
- mutate an Accounting Release;
- declare QBO or Xero delivery or reconciliation; or
- turn Stripe balance activity into a second contribution or general ledger.

### One evidence contract, two truthful modes

Every Settlement Evidence Snapshot has one required, immutable evidence mode.
The modes are exhaustive and never silently substituted.

#### Payout-attributed evidence

Exact composition is allowed only when:

- the Processor Payout Transfer belongs to the exact pinned connected account
  and livemode;
- `automatic` is true;
- `method` is `standard`;
- `reconciliation_status` is `completed`;
- every provider page has been retrieved successfully;
- all component identities are unique within the exact account and environment;
- account, Legal Entity, Settlement Account Binding, balance type, currency,
  and destination checks pass; and
- the provider-atomic conservation equations pass.

`in_progress` is **Waiting for Stripe details**, not a failed reconciliation
and not release-ready exact composition. `not_applicable` cannot enter this
mode.

The immutable snapshot records:

- provider account and environment;
- Processor Payout Transfer identity and lifecycle;
- destination-safe identity and currency;
- API, adapter, and normalization-contract versions;
- retrieval start and completion times;
- page count, component count, stable ordering, and complete-page proof;
- every Settlement Component identity and evidence digest;
- arithmetic totals and residual;
- source-link coverage and classification state;
- supersession lineage; and
- the actor or product operation that initiated recovery, where applicable.

#### Balance-window evidence

Balance-window evidence is required for:

- manual payouts;
- Instant Payouts;
- automatic split-secondary transfers whose composition is unsupported;
- any transfer with `reconciliation_status=not_applicable`; and
- any future provider mode for which exact membership is not proved.

The snapshot covers one bounded, contiguous:

`provider account × environment × Legal Entity × Settlement Account Binding × balance type × currency × interval`

It preserves:

- the exact Processor Payout Transfer and payout debit or reversal;
- the verified opening and closing provider-balance evidence available for the
  interval;
- every fully paginated balance movement in the interval;
- arithmetic movement totals and remaining difference;
- predecessor and successor interval continuity;
- unknown or unsupported provider categories; and
- the explicit limitation that Stripe did not identify which individual
  transactions composed the transfer.

The interval is evidence about processor balance activity. It is not an
inferred payout batch. Same date, nearest amount, destination, description,
FIFO, or another heuristic cannot upgrade it to exact composition.

Tenants remain free to use automatic, manual, or Instant payout modes. The UI
may explain that standard automatic payouts provide stronger evidence for
future transfers, but Asym does not force a configuration change or degrade
support for the tenant's chosen mode.

### Provider-atomic calculation

Stripe Balance Transactions are preserved as immutable Settlement Components.
Each retains:

- provider identity and source reference;
- `amount`, `fee`, `net`, and fee detail;
- currency and balance type;
- creation and availability times;
- raw type and accounting-oriented reporting category;
- status and exchange-rate evidence;
- provider description under restricted evidence access; and
- the immutable raw-evidence digest and normalization version.

All arithmetic uses integer minor units and exact ISO currency. Currency and
balance types never net against each other.

For a supported completed standard automatic payout:

```text
sum(all fully paginated payout-content SettlementComponent.net)
  = ProcessorPayoutTransfer.amount

ProcessorPayoutTransfer.balance_transaction.net
  = -ProcessorPayoutTransfer.amount
```

The payout balance transaction is retrieved separately and deduplicated by
provider identity. Because each component already defines
`net = amount - fee`, Asym does not subtract its fee again. Standalone fee,
reserve, minimum-balance, advance, advance-funding, foreign-exchange,
adjustment, refund, dispute, reversal, payout-failure, and payout-cancellation
movements remain independent components.

Provider `reporting_category` guides accounting-oriented classification while
the raw provider type is preserved. An unknown category or type is ingested
without loss and creates a bounded classification exception. It is never
dropped, guessed, mapped through a provider default, or balanced with a
suspense plug.

### Separate truthful lifecycle axes

The product never collapses these into one `reconciled`, `synced`, `cleared`,
or `exported` state:

1. **Settlement composition** — exact, waiting, balance-based, incomplete, or
   contradicted;
2. **Source coverage** — complete, unmatched, conflicting, or source-owner
   correction required;
3. **Processor transfer** — pending, in transit, paid, failed, canceled, or
   reversed as observed from Stripe;
4. **Bank Match** — unobserved, candidate, confirmed, conflicted, or superseded
   under the separate bank-evidence contract; and
5. **Accounting handoff** — unreleased, ready, blocked, released, delivery
   state, readback state, and current Reconciliation Verdict under D2-D8.

`payout.paid` means Stripe reports a provider transfer state. It does not prove
that the bank posted the deposit, that staff reconciled the bank statement, or
that QBO/Xero received or reconciled the intended accounting effect. A payout
that initially appears paid and later fails creates append-only successor
evidence and recovery; prior evidence is retained.

### Source linking and accounting handoff

A Settlement Source Link uses an exact provider source identity to relate a
Settlement Component to a Phase 13 or other source-owned occurrence. The link
does not transfer ownership or permit the settlement context to edit the
source.

Fees, reserves, minimum-balance movements, advances, FX, and provider
adjustments can be genuine processor-owned Settlement Components without a
gift link. Their accounting treatment remains D4 policy expressed through the
D5 recipe.

Refunds, disputes, reversals, and corrections must have one posting owner.
Phase 13 owns the money occurrence; D9 owns processor evidence; D4-D5 determine
its accounting effect. A component cannot independently create duplicate
accounting work for a source occurrence already represented.

The durable handoff remains:

```text
Phase 13 source facts
  → Stripe balance activity
  → payout-attributed or balance-window settlement evidence
  → independent Bank Match
  → D4 Canonical Accounting Effect
  → immutable Accounting Release
  → exclusive QBO/Xero delivery lane and exact readback
  → accounting-system reconciliation
```

### Ingestion, completeness, and recovery

Signed Stripe webhooks are synchronization hints, not completeness proof. The
handler verifies the raw body and signature, stores replay-safe raw evidence,
returns success before expensive work, and schedules account-scoped
processing.

Scheduled overlap sweeps and bounded backfills:

- enumerate the exact connected account and livemode;
- page until provider completion;
- persist durable cursors and resumable checkpoints;
- reread incomplete, changed, failed, canceled, or recently paid transfers;
- recover missed, delayed, duplicated, and out-of-order events;
- use bounded concurrency and provider-adaptive backoff with jitter;
- avoid one tenant monopolizing workers; and
- retain typed dead-letter and authorization-recovery states.

Writes are idempotent by compound provider account, environment, object type,
and object identity. Concurrent finalization uses a lease or compare-and-swap
boundary. A failed job, partial page set, stale cursor, or revoked connection
cannot produce a complete snapshot.

Late components, provider corrections, changed transfer lifecycle, and
normalization changes create append-only successor observations. Historical
snapshots and exported Accounting Releases are never recomputed or mutated.
Any accounting consequence becomes linked current- or later-period work under
the still-governing D4 policy.

### Tenant safety, security, and privacy

Every root, component, source link, cursor, queue item, cache entry, artifact,
exception, audit event, and uniqueness constraint is scoped by:

- Tenant;
- Legal Entity;
- Settlement Account Binding;
- connected processor account;
- environment and livemode;
- balance type and currency; and
- provider object type and stable identity.

Tenant routing comes from the authenticated server-side connected-account and
binding context, never payout metadata, donor metadata, client input, object
name, amount, or cache fallback. Provider credentials remain encrypted and
server-only.

Ordinary projections expose only purpose-required fields. Raw payloads,
destination descriptors, donor relationships, and expanded provider objects
use restricted evidence access and governed retention. Logs contain
correlation identifiers, typed causes, counts, and safe metrics rather than
credentials, raw payloads, unrestricted descriptions, or donor PII. Evidence
access and every staff recovery action are audited.

### Bookkeeper-first workspace

The one ordinary doorway is:

**Accounting → Reconciliation → Settlements**

The default view is **Needs attention**, followed by recent clean settlements.
Each row shows:

- Legal Entity and safe destination label;
- Stripe payout reference;
- expected arrival date and currency;
- gross activity;
- fees;
- refunds and disputes;
- reserves and adjustments;
- net transfer;
- one compact derived state; and
- one safe next action when needed.

Plain-language states include:

- `Exact payout detail available`
- `Waiting for Stripe details`
- `Balance-based — Stripe does not identify this payout's individual transactions`
- `Stripe split this settlement into multiple bank transfers`
- `Bank deposit not yet confirmed`
- `Accounting handoff needs attention`

The detail view progressively reveals:

1. the gross-to-net equation;
2. exact composition or bounded balance evidence and its limitation;
3. source coverage;
4. independent bank evidence;
5. Accounting Release, provider handoff, exceptions, and immutable history.

Clean settlements advance automatically and require no routine approval.
Exceptions are grouped by cause, owner, affected count and amount, and one
recommended action. Staff actions are bounded intent verbs such as:

- `Retry evidence sync`
- `Reconnect Stripe`
- `Review unmatched source`
- `Confirm bank evidence`

There is no editable provider membership, amount, classification, or lifecycle
state and no generic `Mark reconciled` action. A staff confirmation may attach
independent evidence and a reason; it cannot change provider arithmetic or
manufacture exact membership.

Tables are server-paginated or virtualized as appropriate, keyboard-complete,
responsive, and semantically labeled. Status uses text and iconography, never
color alone. Error summaries focus and link to the exact repair surface.
Loading and recovery use restrained live announcements without row-level
noise. Every material amount displays its currency.

### Observability and operating contract

Per account, environment, evidence mode, balance type, and currency, Asym
observes:

- webhook and API synchronization watermarks;
- cursor and provider-catalog age;
- payout age and composition state;
- page and component counts;
- gross, fee, refund, dispute, reserve, adjustment, and net totals;
- arithmetic residual;
- unmatched and conflicting source count and amount;
- balance-window continuity and difference;
- Bank Match age;
- authorization and permission health;
- retry, rate-limit, dead-letter, and queue age; and
- affected Accounting Release count and amount.

Every job, snapshot, exception, and recovery action carries the exact binding
identity and a PII-safe correlation identifier. Alerts are exception- and
service-level driven; healthy settlement processing does not generate staff
noise.

### Release gates inherited and hardened by D9

No settlement evidence or Processor Settlement Verdict reaches production
without:

- fully paginated one-, two-, and many-page composition fixtures;
- duplicate component, duplicate webhook, empty page, page failure, resume,
  and stable-ordering tests;
- automatic standard completed, automatic in-progress, manual, Instant,
  split-primary, split-secondary, and unsupported-mode fixtures;
- minimum-balance hold/release, reserve, advance, advance-funding, fee,
  fee-refund, refund, dispute, dispute reversal, payout failure,
  payout cancellation, and reversal fixtures;
- integer-minor-unit, zero-decimal currency, multi-currency, balance-type, FX,
  negative-balance, and no-fee-double-subtraction property tests;
- exact source coverage, unmatched source, conflicting source, and
  duplicate-posting-owner tests;
- unknown provider type and reporting-category quarantine;
- paid-then-failed and late-contradiction append-only recovery;
- missing, delayed, duplicated, and out-of-order webhook plus scheduled
  completeness sweep tests;
- timeout, 429, 5xx, credential revocation, account succession, partial
  history, and resumable-backfill tests;
- concurrent sync, lease expiry, stale finalization, and compare-and-swap race
  tests;
- negative Tenant, Legal Entity, Settlement Account Binding, connected
  account, environment, livemode, balance-type, currency, queue, cache,
  artifact, and idempotency-isolation tests;
- privacy and authorization tests for raw evidence, destinations, donor PII,
  logs, exports, support access, and recovery actions;
- high-volume, provider-rate-limit, seasonal-load, tenant-fairness, and
  noisy-neighbor tests;
- accessible keyboard, focus, screen-reader, responsive, live-status, and
  error-summary tests;
- bookkeeper usability evidence for exact, waiting, balance-based, split,
  failed, unmatched, and clean settlements; and
- production-shaped Stripe test fixtures, canary monitoring, safe replay,
  provider-version upgrade gates, and a settlement-ingestion kill switch.

### Explicit non-goals from D9

- No generic processor marketplace or tenant-authored settlement DSL.
- No second contribution ledger, processor ledger, or general ledger.
- No arbitrary formulas, editable Balance Transactions, or staff-created
  Settlement Components.
- No same-day, nearest-amount, FIFO, description, or fuzzy match treated as
  final payout or source truth.
- No raw Stripe JSON as the primary finance interface.
- No universal bank-feed engine or bank-reconciliation claim.
- No per-component approval for healthy settlements.
- No tenant-configurable polling, retry, or rate-limit tuning.
- No provider metadata used as Tenant or Legal Entity authority.
- No unknown component dropped, guessed, or posted through a suspense plug.
- No direct refund, dispute, payout, or Stripe-configuration commands from the
  settlement workspace.
- No Accounting Release, QBO/Xero compilation, or provider delivery logic
  inside the settlement aggregate.
- No donor/customer synchronization or expansion of unrelated donor PII.
- No one mutable `reconciled`, `synced`, `cleared`, or `exported` flag.
- No claim that Stripe transfer status proves bank arrival or accounting-system
  reconciliation.
- No stop-the-world failure for an isolated account, payout, component,
  category, source link, Bank Match, or Accounting Release exception.

### Current provider evidence for D9

Provider facts were verified against current official documentation on
2026-07-26. The detailed evidence and adversarial review are retained in:

- [Phase 20 D9 research evidence](./phase-20-accounting-exports-reconciliation-research-evidence.md)
- [Stripe reporting and reconciliation](https://docs.stripe.com/plan-integration/get-started/reporting-reconciliation)
- [Stripe payout reconciliation](https://docs.stripe.com/payouts/reconciliation)
- [Stripe payout reconciliation report](https://docs.stripe.com/reports/payout-reconciliation)
- [Stripe Payout object](https://docs.stripe.com/api/payouts/object)
- [Stripe Balance Transaction object](https://docs.stripe.com/api/balance_transactions/object)
- [Stripe reporting categories](https://docs.stripe.com/reports/reporting-categories)
- [Stripe minimum balances](https://docs.stripe.com/payouts/minimum-balances-for-automatic-payouts)
- [Stripe Instant Payout advance funding](https://docs.stripe.com/payouts/instant-payouts-with-advance-funding)
- [Stripe automatic payout splitting](https://support.stripe.com/questions/automatic-payout-splitting)
- [Stripe webhooks](https://docs.stripe.com/webhooks)
- [Stripe Connect authentication](https://docs.stripe.com/connect/authentication)
- [Stripe rate limits](https://docs.stripe.com/rate-limits)
- [PayPal Disbursement Reconciliation Report](https://developer.paypal.com/docs/reports/sftp-reports/disbursement-reconciliation-report/)
- [Square Payout Entries](https://developer.squareup.com/docs/payouts-api/list-payout-entries)
- [Adyen Settlement Details Report](https://docs.adyen.com/reporting/settlement-reconciliation/transaction-level/settlement-details-report)
- [Shopify payout reconciliation](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/payout-reconciliation-report)
- [Modern Treasury reconciliation](https://docs.moderntreasury.com/platform/docs/reconciliation-overview)
- [QuickBooks Online bank deposits](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-deposits/record-make-bank-deposits-quickbooks-online/L2BBZOPdr_US_en_US)
- [Xero bank-transaction mapping](https://developer.xero.com/documentation/best-practices/categorising-transactions/bank-transaction-mapping/)
- [Xero bank-statement API boundary](https://developer.xero.com/documentation/api/accounting/bankstatements)

## D10 — Bounded Bank Match with tenant-chosen evidence lanes

**Founder ruling:** ratified 2026-07-26.

D10 adopts **one source-labelled, allocation-safe Bank Match connecting
immutable Expected Bank Arrivals to posted bank evidence through
tenant-chosen statement import, optional certified read-only connection, or
explicit staff-confirmed evidence; with deterministic exact-match automation,
ambiguity-to-review, append-only recovery, and QBO/Xero-owned final
reconciliation**.

The phrase **deterministic exact-match automation** is bounded to automatic
**evidence linking**. It cannot confirm accounting truth, finish bank
reconciliation, close a period, or claim that QBO/Xero is reconciled. Product
copy and implementation terminology therefore use **evidence-linked**, never
an unqualified **reconciled** or **confirmed** state.

### Independent authorities

1. **Expected Bank Arrival** records what one source-authoritative Processor
   Payout Transfer or frozen Phase 15 Deposit Group should deliver.
2. **Bank Evidence Observation** records what one explicitly labelled evidence
   lane observed, including provenance, freshness, and later change.
3. **Bank Match** records Asym's bounded allocation evidence explaining whether
   the expectation and observed bank activity agree.
4. **Accounting Release** retains D2-D8's immutable balanced projection and
   independently authoritative delivery/readback state.
5. **Accounting-system reconciliation** remains the bookkeeper's final
   statement comparison, adjustment, and close in QuickBooks Online or Xero.

No state transition silently advances another authority. Stripe `paid`, a
payout trace ID, or exact payout composition does not prove bank posting. A
posted bank observation does not prove processor source coverage. An exact
Bank Match does not prove Accounting Release delivery. Provider object
acceptance does not prove bank reconciliation. Staff-confirmed evidence records
a staff action without masquerading as imported or directly connected data.

### Expected Bank Arrival

One immutable Expected Bank Arrival derives from exactly one D9 Processor
Payout Transfer or one Phase 15 Deposit Group frozen for deposit evidence. It
includes:

- Tenant and Legal Entity;
- exact destination bank-account binding;
- origin type, immutable origin identifier, and source snapshot/digest;
- expected integer-minor-unit amount, currency, and direction;
- bounded expected-posting window;
- safe processor trace, payout, deposit-slip, or batch references;
- source freshness and lifecycle; and
- append-only predecessor/successor lineage.

It is not a gift, receivable, journal, bank transaction, editable expected
deposit, or proof of arrival. Phase 15 continues to own live Deposit Group
membership, slips, and operational deposit state. D10 consumes a frozen view
without assuming `Deposit Group = Bank Transaction` or one-to-one cardinality.

### Bank Evidence Observation

Every observation uses exactly one source-labelled lane:

1. **Reviewed statement import** is a complete launch-baseline lane. Staff
   preview the exact Legal Entity, bank account, currency, covered period,
   accepted rows, exclusions, malformed rows, and duplicates before
   acceptance. Asym retains import and row identities, raw-evidence digest,
   parser/schema version, and a restricted source artifact.
2. **Optional certified read-only connection** is acceleration only. It
   preserves tenant opt-in, explicit account selection, masked account,
   granted scopes, consent and reconnect state, last successful refresh,
   freshness, durable cursor, mutation/removal lineage, and versioned adapter
   provenance.
3. **Explicit staff-confirmed evidence** is a complete fallback and
   launch-baseline lane. It preserves the bound account, posted date, amount,
   currency, direction, safe reference, actor, timestamp, and concise reason,
   and always displays `Staff confirmed in bank`.

Every observation preserves stable external identity when supplied,
pending/posted state, amount, currency, direction, source dates, safe
description/reference, observation time, freshness, restricted raw-evidence
pointer/digest, schema version, and append-only supersession/removal lineage.
Ordinary finance views minimize descriptions and counterparty data.

### Allocation invariants

Each Bank Match Allocation assigns one integer-minor-unit amount between one
Expected Bank Arrival and one posted Bank Evidence Observation. It supports
one-to-one, many-to-one, one-to-many, and partial allocation with visible
residuals.

Every allocation must prove:

- same Tenant and Legal Entity;
- same exact destination bank-account binding;
- same currency and compatible direction;
- posted, current, non-superseded evidence;
- positive integer-minor-unit amount;
- no allocation beyond either current residual;
- no double consumption; and
- compare-and-swap protection against concurrent review or automation.

All corrections are append-only. Changed, removed, reversed, or superseded
evidence creates a conflict and successor work; it never rewrites historical
evidence or a released Accounting Release.

### Deterministic evidence-linking policy

Asym may create an automatic evidence link only when:

- the observation is posted rather than pending;
- the import or synchronization unit is current and complete;
- a stable observation or certified import identity exists;
- Tenant, Legal Entity, account, currency, and direction agree;
- the exact residual amount agrees;
- exactly one eligible candidate exists;
- no active or historical allocation conflict exists;
- the date is within the source-owned bounded window; and
- an exact reference agrees or a provider-specific deterministic signature has
  passed production-shaped certification.

Amount, date, description, payer, processor name, proximity, FIFO, or
machine-scored similarity alone may rank candidates but cannot silently link
evidence. A unique amount-and-date candidate without stronger proof is
**Strong match suggested** and requires one staff action. Bulk linking is
allowed only when every row independently satisfies the exact policy and the
review surface states the affected count and amount.

### Quiet finance workspace

D10 adds one compact **Bank evidence** surface inside the existing payout and
offline-deposit workflows, not a banking module. It shows expected source and
amount, evidence lane and freshness, masked bank account, allocation and
residual, Accounting Release state, and a clear `Finish reconciliation in
QuickBooks` or `Finish reconciliation in Xero` continuation.

Clean exact links remain quiet. Review work appears only for missing evidence,
multiple candidates, combined/split/partial amounts, scope conflicts, stale
pending activity, incomplete imports or syncs, changed/removed/reversed
evidence, connection failure, superseded expectations, or residual amounts.
The side-by-side review explains candidate ranking and offers only **Link
evidence**, **Split amount**, **Choose another transaction**, **Record
confirmation from bank**, **Refresh evidence**, **Resolve source correction**,
or **Leave unmatched**.

### Direct connectivity

Direct bank connectivity is not required for launch and does not strengthen
accounting authority. It may reduce rekeying, improve timeliness, and surface
missing arrivals sooner. At most one provider may be activated initially, and
only after opt-in production-shaped certification proves:

- target business-bank and transaction coverage;
- OAuth/consent, revocation, reconnect, and institution-migration behavior;
- account selection, duplicate connection, and account succession;
- visible freshness and last-successful-update semantics;
- cursor pagination, mutation-during-pagination restart, webhook-loss
  recovery, and scheduled completeness;
- pending-to-posted replacement plus posted modification/removal;
- least-privilege read-only scopes, secret isolation, auditing, retention, and
  deletion;
- acceptable rate limits, latency, support burden, and unit economics;
- measurable bookkeeper savings over statement import; and
- a connector kill switch with statement and staff-confirmed fallback.

Plaid and Stripe Financial Connections remain candidates for that bounded
contest, not ratified dependencies. The core observation contract stays
provider-neutral.

### Release gates

No D10 behavior reaches production without:

- one-to-one, many-to-one, one-to-many, partial, zero-residual,
  over-allocation, and double-consumption tests;
- ambiguous amount/date, stale candidate, wrong account/entity/currency/
  direction, and reused-evidence tests;
- pending-to-posted, modified, removed, reversed, and successor fixtures;
- duplicate statement/row, malformed row, locale/sign/date, encoding,
  formula-injection, oversized-file, and restricted-artifact tests for every
  shipped import format;
- concurrent automation/review, stale screen, retry, replay,
  compare-and-swap, and timeout-after-write tests;
- missing, delayed, duplicated, and out-of-order event plus scheduled
  completeness tests;
- negative Tenant, Legal Entity, account, connection, import, artifact, cache,
  queue, idempotency, and support-access isolation tests;
- immutable Accounting Release and append-only correction tests;
- high-volume bounded-search, tenant-fairness, and noisy-neighbor tests;
- accessible keyboard, focus, screen-reader, status-text, error-summary,
  responsive, and bulk-review tests; and
- production-shaped bookkeeper validation for clean, missing, ambiguous,
  combined, split, partial, staff-confirmed, changed, and disconnected cases.

### Explicit non-goals

- No general bank feed, unrelated spending, categorization, cash forecasting,
  or treasury management.
- No tenant matching-rule DSL or arbitrary fuzzy automation.
- No bank register, general ledger, statement-balance close, or monthly
  reconciliation in Asym.
- No editing or manufacturing bank transactions.
- No mandatory bank-data aggregator or dependency on pending data.
- No claim that evidence linking, Accounting Release delivery, or provider
  readback means QBO/Xero reconciliation is complete.
- No mutable `reconciled`, `cleared`, `deposited`, or `matched` boolean.

### Current evidence for D10

Current official provider behavior and the full adversarial findings are
retained in:

- [Phase 20 D10 bank evidence and matching research](./phase-20-bank-evidence-and-matching-research-evidence.md)
- [Stripe payout reconciliation](https://docs.stripe.com/payouts/reconciliation)
- [Stripe payout trace IDs](https://docs.stripe.com/payouts/trace-id)
- [QuickBooks Online transaction matching](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-feeds/match-online-bank-transactions-quickbooks-online/L6qyw0PvP_US_en_US)
- [QuickBooks Online account reconciliation](https://quickbooks.intuit.com/learn-support/en-us/help-article/reconciliation/reconcile-account-quickbooks-online/L2L7FZB3G_US_en_US)
- [Xero bank-statement API boundary](https://developer.xero.com/documentation/api/accounting/bankstatements)
- [Plaid Transactions](https://plaid.com/docs/transactions/)
- [Plaid transaction states](https://plaid.com/docs/transactions/transactions-data/)
- [Plaid Transactions API](https://plaid.com/docs/api/products/transactions/)
- [Plaid OAuth](https://plaid.com/docs/link/oauth/)
- [Stripe Financial Connections transactions](https://docs.stripe.com/financial-connections/transactions)
- [Virtuous payout reconciliation](https://support.virtuous.org/hc/en-us/articles/33916761894925-How-Do-I-Reconcile-Gifts-in-Virtuous-Giving)

## D11 — Policy-bounded, append-only compensating corrections

**Founder ruling:** ratified 2026-07-26.

D11 adopts **source- and cause-linked, append-only Compensating Accounting
Releases posted only into tenant-policy-permitted and provider-accepted
periods, with independently preserved source-effective, discovery,
accounting-effective, and provider-posting dates; immutable original releases;
first-class idempotent QBO/Xero delivery with exact readback and drift
detection; and accountant-owned escalation for restatements, material errors,
or locked-period exceptions**.

D11 does not make Asym accounting software. Asym consumes source-owned facts,
applies one pinned tenant-accountant-confirmed policy, produces a balanced
downstream accounting projection, and reliably hands that projection to
QuickBooks Online or Xero. The tenant's accountant and accounting system retain
authority over materiality, error classification, financial-statement
treatment, period close, reconciliation, and the books.

### Correction Causes and authority

One source-owned Correction Cause identifies why released accounting may need
new downstream treatment:

1. **Subsequent economic event** — a later refund, dispute, chargeback, fee,
   reserve movement, or other new economic occurrence.
2. **Source fact correction** — a source context superseded a fact used by an
   earlier release.
3. **Accounting policy or mapping correction** — an accountant-approved
   policy, mapping, or carrier mistake affected an earlier release.
4. **Delivery duplicate or omission** — provider delivery created too much,
   too little, or no accepted accounting effect.
5. **Provider record drift** — a provider record was later changed, voided,
   deleted, or otherwise diverged from the accepted readback.
6. **Potential prior-period error** — the issue may require materiality,
   restatement, disclosure, or other accountant judgment.

The catalog is fixed and versioned; it is not tenant-authored code. A
Correction Cause is not a GAAP conclusion. Asym never determines whether an
issue is material, an accounting error, a change in estimate, or a required
restatement. `potential_prior_period_error` always blocks automatic treatment
and enters accountant-owned resolution.

### Four independent dates

Every correction preserves:

- **source-effective date** — the source owner's date for the underlying
  economic event or corrected fact;
- **discovered-at** — when Asym or an authorized actor first observed the need
  for correction;
- **accounting-effective date** — the date selected under the pinned tenant
  policy; and
- **provider-posting date** — the date accepted and read back from QBO or Xero.

No date silently overwrites another. Discovery does not prove economic
occurrence. A reference to a prior-period source does not make a later
chargeback a prior-period event. Provider acceptance does not prove the
tenant's accounting judgment.

### Correction Posting Policy Version

One immutable, prospective, accountant-confirmed Correction Posting Policy
Version belongs to one Tenant, Legal Entity, and Accounting Destination. It
contains only bounded routing choices:

- permitted treatment and period-selection mode by Correction Cause;
- the default when exactly one permitted treatment exists;
- whether authorized finance staff may choose another permitted open period;
- causes that always require finance or accountant review;
- tenant-supplied escalation prompts;
- direct-delivery review requirements;
- effective-from timestamp; and
- confirming finance owner and evidence.

The policy cannot contain arbitrary debit/credit formulas, executable scripts,
an unrestricted rules language, a materiality calculator, restatement logic,
tax advice, provider-lock overrides, or unrestricted backdating. Changes are
prospective. Every release pins the exact policy version.

If exactly one treatment and period are permitted, Asym may recommend it
without additional bureaucracy. If several are permitted, authorized finance
staff choose only among those choices and record a concise reason when
departing from the recommendation. If none is permitted, delivery blocks for
accountant resolution; Asym never silently chooses the current period.

### Posting Period Readiness

Period truth is three-axis:

1. **Tenant-policy permission** — permitted, prohibited, or accountant review.
2. **Observed provider context** — reported open, reported locked, unavailable,
   or stale.
3. **Provider write outcome** — accepted, rejected as closed, rejected for
   another reason, outcome unknown, or read back.

Provider preflight is advisory. QuickBooks Online's official documentation has
described both close-date limitations and a `BookCloseDate` surface over time;
D11 therefore never treats QBO preflight as authoritative. QBO errors such as
`6200` and `6210` and the actual provider response remain authoritative. Asym
does not request or store a QBO closing-date password or change close settings.

Xero exposes `PeriodLockDate`, `EndOfYearLockDate`, organization identity, and
available actions. Asym refreshes those observations before delivery, but the
write response remains authoritative. Asym does not change Xero lock dates.

### Compensating Accounting Release

Every correction is a new immutable Accounting Release linked to:

- affected source facts and their versions/digests;
- one Correction Cause;
- every affected original Accounting Release;
- original provider operations and objects when present;
- pinned Correction Posting Policy Version;
- D4 semantic policy, Posting Intent, and Canonical Accounting Effect;
- D5 Posting Profile and provider-native recipe;
- D6 mapping and coverage;
- D7/D8 QBO or Xero Carrier Plan and capability certificate;
- the four dates and selected period;
- actor/reason evidence when judgment was exercised;
- immutable Accounting Evidence Artifact; and
- append-only predecessor/successor lineage.

The correction may contain a reversing effect, corrected effect, and net
effect, but the combined Canonical Accounting Effect must balance and retain
exact source coverage. It reuses D4-D8's ordinary aggregate and delivery
machinery; there is no correction ledger, correction compiler, or parallel
delivery subsystem.

The original release and its provider evidence remain immutable in Asym.
Corrections never update, delete, or silently replace them. A provider-native
void or reversal may be selected only when the accountant-confirmed Posting
Profile and Carrier Plan explicitly require it and the new release preserves
that operation as append-only correction evidence.

### First-class QBO delivery

The QBO adapter must:

- bind every operation to the exact Tenant, Legal Entity, Accounting
  Destination, environment, and QBO `realmId`;
- use the provider-native resource selected by the certified QBO Carrier Plan
  rather than routing every correction through `JournalEntry`;
- send explicit dates and balanced provider-native effects;
- use one stable operation-granular QBO `requestid` for initial submission and
  all retries; `DocNumber` is display/reference data, not idempotency;
- pin and certify a supported minor version;
- preserve the complete request/response digest, Intuit trace identifier,
  object ID, `SyncToken`, accepted dates, lines, references, and metadata;
- enter D2's `Outcome unknown` quarantine after timeout or ambiguous transport
  failure, then query/read before retry;
- perform exact readback and compare the provider effect with the release;
- use webhooks as hints plus bounded Change Data Capture recovery;
- detect later provider modification/deletion as drift without silently
  recreating the object;
- distinguish closed period, balance, inactive reference, authorization,
  validation, throttling, and transient failures; and
- retain artifact-always staff-mediated continuity when direct delivery is
  unavailable.

### First-class Xero delivery

The Xero adapter must:

- bind every operation to the exact Tenant, Legal Entity, Accounting
  Destination, environment, Xero connection, and `xero-tenant-id`;
- pass tenant identity explicitly on every call and never use mutable global
  tenant or token context;
- use current granular OAuth scopes and safe refresh-token rotation;
- use the provider-native resource selected by the certified Xero Carrier Plan
  rather than forcing every correction through `ManualJournal`;
- use one stable operation-granular Xero idempotency key;
- preserve request/response digests, resource type/ID, accepted date/status,
  lines, Tracking, update time, history/linkage, and provider errors;
- enter `Outcome unknown`, read the exact resource, and resolve before retry;
- compare exact readback with the release's expected effect;
- use the Asym source URL/deep link where the resource supports it;
- detect later provider change, void, deletion, or permission drift without
  silently recreating the object;
- respect per-tenant concurrency/rate budgets with adaptive backoff; and
- avoid depending on Xero's read-only Journals endpoint because its access tier,
  security assessment, and approval are not guaranteed.

### Staff experience

The ordinary surface is one compact review:

> February Stripe chargeback
> Relates to Accounting Release AR-1048 from December
> Recommended posting: February 8
> Why: February economic event; December is locked
> Destination: Hope Missions — QuickBooks Online
> Review and send

`Change posting period` appears only when more than one policy-permitted option
exists. It lists only permitted dates, explains why each is available, shows
provider-context freshness, warns when provider context is unavailable, and
requires a reason for departing from the recommendation. It never offers a
known-locked date.

Potential prior-period errors use one quiet exception:

> Accountant review needed
> This may affect previously issued financial statements. Asym will not choose
> the treatment or posting period.

The bounded actions are **Review evidence**, **Assign finance owner**, **Record
accountant direction**, **Prepare permitted correction**, **Continue in
QuickBooks/Xero**, or **Leave unresolved**. Ordinary later economic events do
not receive a generic approval chain.

### Release gates

No D11 behavior reaches production without:

- each Correction Cause, no-cause, and unknown-cause fixtures;
- source-event versus source-error versus possible material-error tests;
- one, multiple, and zero permitted-treatment policy tests;
- prospective policy-version and stale-policy approval tests;
- all four dates, timezone, fiscal-year boundary, leap-day, and daylight-saving
  tests;
- balanced reversal, replacement, net-effect, partial correction, multi-source,
  multi-currency, zero-decimal, FX, and tax fixtures;
- immutable-original and append-only lineage/property tests;
- wrong Tenant, Legal Entity, destination, QBO realm, Xero tenant, environment,
  currency, period, policy, mapping, Carrier Plan, and connection negative
  tests;
- QBO closed-period, duplicate request ID, timeout-after-commit, `401`, `429`,
  invalid reference, imbalance, and provider-drift fixtures;
- Xero lock-date, permission, idempotency, timeout-after-commit, token-rotation,
  rate-limit, validation, void, and provider-drift fixtures;
- provider-native non-journal resource fixtures where the active Carrier Plan
  requires them;
- `Outcome unknown` read-before-retry and operation-granular resume tests;
- webhook loss, out-of-order event, CDC/polling completeness, stale readback,
  and scheduled drift sweep tests;
- immutable artifact and staff-mediated fallback continuity tests;
- high-volume tenant-fairness and provider-budget tests;
- authorization, secret isolation, PII-safe narration/logging, support-access,
  and audit-evidence tests;
- keyboard, focus, screen-reader, live-status, error-summary, responsive, and
  low-noise exception tests; and
- production-shaped QBO/Xero usability testing with simple and many-fund
  mission organizations.

### Explicit non-goals

- No Asym-owned general ledger, accounting calendar, period close, bank
  reconciliation, financial statements, restatement workflow, or materiality
  determination.
- No automatic treatment for potential prior-period errors.
- No silent current-period fallback when no permitted treatment exists.
- No arbitrary backdating, provider lock override, or close-password handling.
- No tenant-authored accounting formulas, scripts, or correction DSL.
- No mutation or deletion of an original Accounting Release.
- No generic-journal-only integration for either provider.
- No blind retry after ambiguous provider outcome.
- No provider object acceptance presented as accounting correctness,
  reconciliation, or close.
- No direct-lane dependency that removes artifact-always recovery.

### Current evidence for D11

The current official provider and accounting evidence plus the complete
adversarial review are retained in:

- [Phase 20 D11 policy-bounded correction research](./phase-20-policy-bounded-compensating-corrections-research-evidence.md)
- [FASB Statement No. 154](https://storage.fasb.org/fas154.pdf)
- [QBO closed-period errors](https://developer.intuit.com/app/developer/qbo/docs/develop/troubleshooting/handling-common-errors)
- [QBO API error codes](https://developer.intuit.com/app/developer/qbo/docs/develop/troubleshooting/error-codes)
- [QBO request IDs](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-field-definitions)
- [QBO Change Data Capture](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/change-data-capture)
- [QBO OAuth 2.0](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)
- [Xero Organisation and lock dates](https://developer.xero.com/documentation/api/accounting/organisation)
- [Xero Manual Journals](https://developer.xero.com/documentation/api/accounting/manualjournals/)
- [Xero idempotency](https://developer.xero.com/documentation/guides/idempotent-requests/idempotency/)
- [Xero token and tenant integrity](https://developer.xero.com/documentation/best-practices/data-integrity/managing-tokens)
- [Xero OAuth scopes](https://developer.xero.com/documentation/guides/oauth2/scopes)
- [Xero rate limits](https://developer.xero.com/documentation/best-practices/api-call-efficiencies/rate-limits)

## D12 — Tenant-controlled, policy-bounded Accounting Release cadence

**Founder ruling:** ratified 2026-07-26.

D12 adopts **tenant-controlled, policy-bounded Accounting Release cadence
through one quiet Ready for Accounting workspace, with three goal-based modes,
prospective intent-scoped policy, atomic release fencing, exception isolation,
provider-fair operation queues, bounded Pause and Release now controls, and
truthful accessible progress**.

D12 controls when already-eligible downstream accounting work proceeds. It
does not decide source truth, accounting treatment, mapping, period
permission, provider resource shape, provider acceptance, or reconciliation.
QuickBooks Online or Xero remains the system of record for the books.

### Accounting Release Cadence Policy Version

One immutable, prospective Accounting Release Cadence Policy Version belongs
to one Tenant, Legal Entity, Accounting Destination, delivery lane, and
product-owned Accounting Posting Intent family. It provides exactly three
goal-based choices:

1. **Release eligible routine work automatically** at one bounded cadence.
2. **Prepare eligible work on a schedule for staff review** without releasing
   it.
3. **Wait for staff** and show eligible work as soon as it is ready.

Bounded schedules may include when-ready, weekday, weekly, or monthly
presets. They preserve local scheduling intent in an explicit IANA timezone,
show the next exact occurrence, execute repeated daylight-saving local times
once, and resolve nonexistent local times at the first valid instant after the
gap. Monthly choices are unambiguous, such as days 1–28 or the last calendar
day. D12 does not introduce arbitrary cron expressions, tenant-authored
recurrence logic, or a holiday-calendar engine.

Each occurrence has a deterministic logical identity. After downtime, Asym
coalesces missed occurrences into one current readiness evaluation instead of
replaying each missed slot into QBO or Xero. Work that becomes ready after an
occurrence's selection cutoff waits for the next occurrence.

New direct connections begin review-first. Automatic release requires one
explicit choice by an authorized tenant finance admin after the applicable
destination, Posting Profile, mapping, Carrier Plan, and provider adapter are
certified. The tenant may always require more review. It may not configure
away an accountant-owned decision, source or coverage requirement, period
policy, destination binding, provider capability, or security gate.

Configuration and release permissions remain separate capabilities, but a
small tenant may grant both to the same person. Ordinary work has no mandatory
second approver or approval-chain bureaucracy. Policy changes apply only to
future release fences and never alter a frozen release, submitted provider
operation, or historical evidence.

Disconnecting or replacing an accounting destination prospectively retires
that destination's cadence policy and stops new release fences. Already frozen
releases preserve the prior destination and recovery state. A different QBO
company or Xero organization requires fresh identity and capability proof plus
explicit cadence activation.

### Release Candidate and atomic release fence

A Release Candidate is a derived, disposable projection. It may currently
appear ready, waiting, blocked, or stale, but it is not an Accounting Release
or provider payload.

Every manual, scheduled-review, or automatic trigger enters the same release
service. At one atomic Accounting Release fence, the service revalidates:

- exact Tenant, Legal Entity, destination, environment, delivery lane, and
  currency;
- source identifiers, revisions, and source-set digest;
- D4 Posting Intent, semantic policy, balanced effect, and source coverage;
- D5 Posting Profile and provider-native recipe;
- D6 mapping and complete mapping coverage;
- D7/D8 Carrier Plan, capability certificate, and reporting disclosure;
- applicable D9 settlement, D10 Bank Match, and D11 correction requirements
  without turning every independently authoritative fact into a universal
  blocker;
- posting-period treatment and provider-context freshness;
- current provider authorization and stable organization identity; and
- absence of a contract-owned blocking exception.

Only the release fence creates the immutable Accounting Release. Stable
logical schedule-occurrence keys, deterministic release identities, database
uniqueness, and compare-and-swap or equivalent fencing prevent duplicate or
stale creation when a schedule, Release now action, Pause, policy change,
source correction, retry, or deployment races.

Pause-versus-freeze ordering is exact: a Pause committed before the release
fence prevents freezing; a Pause committed after it cannot cancel that
release. Scheduler and Release now races over the same sources converge on the
same deterministic release identity. Resume creates a fresh evaluation.

A bulk action is an operational convenience, not one provider transaction.
Each release unit crosses its own atomic fence. Revalidation may remove changed
or blocked work from an exact staff-reviewed set, but it may never silently add
newly eligible work after review. Newly eligible work waits for the next
review. The result states exact released, excluded, changed, and blocked counts
and amounts.

D9 Processor Payout Transfer, D10 Bank Match, and Accounting Release remain
independent authorities. An intent contract may require particular settlement
evidence, but cadence cannot make Bank Match a universal release prerequisite
or retroactively mutate a release after a later Bank Match.

### Cadence Execution Evidence

Release Candidates remain disposable, but each automatic, scheduled, manual,
or catch-up evaluation retains one durable, PII-minimized Cadence Execution
Evidence record containing:

- logical occurrence and intended local time;
- policy version, trigger kind, and actor;
- evaluated source/version digests;
- exact reviewed-selection digest when staff reviewed work;
- selected, excluded, stale, and blocked counts with reason codes;
- Pause and resume transitions;
- Accounting Releases created; and
- provider-operation correlation identifiers.

Its retention follows the Accounting Evidence Artifact policy and does not
depend on how long rows remain visible in the workspace.

### Delivery and staff controls

- **Release now** advances only currently eligible work. It never bypasses a
  mandatory review, accounting rule, source gate, period policy, provider
  capacity, tenant fairness, or unknown-outcome quarantine.
- **Pause upcoming releases** is scoped to one Legal Entity, destination,
  lane, and intent family. It prevents new release fences but does not cancel
  frozen releases or in-flight provider operations. The confirmation explains
  exactly what stops and what continues.
- **Resume** recomputes current readiness; it never reuses a stale candidate
  snapshot.
- Automatic direct delivery freezes the release and queues its provider
  operations. It does not claim the provider accepted, read back, or
  reconciled them.
- Automatic staff-mediated delivery may prepare an immutable artifact for
  staff. Preview, download, or artifact creation never marks the external
  import complete.
- OAuth loss, provider outage, throttling, or a destination circuit breaker
  stops only that destination's direct-delivery queue. It never silently
  switches a frozen release to the staff-mediated lane.

QBO and Xero execution remains per-destination, operation-granular,
tenant-fair, idempotent, adaptive to provider limits, and recoverable from
`Outcome unknown`. QBO batches and Xero multi-node requests are transport
optimizations only; their item-level outcomes do not redefine the Accounting
Release boundary. Adapters inspect every item result; a top-level successful
HTTP response never proves that every contained Xero or QBO operation
succeeded.

Distinct server-side capabilities govern viewing readiness, releasing work,
pausing or resuming a destination lane, configuring cadence or enabling
automation, and inspecting or downloading accounting evidence. One person may
hold all capabilities. Every action reauthorizes Tenant, Legal Entity, and
destination; UI visibility is not authorization.

### Ready for Accounting staff experience

The ordinary workspace uses one **Release Horizon** instead of a metric-card
dashboard, Kanban board, or wizard for each release. It answers:

1. what needs staff now;
2. what will happen automatically;
3. exactly when it will happen; and
4. what is blocked, why, and the next safe action.

The default action order is **Needs attention**, **Ready for review**,
**Scheduled or automatic**, then **Recently released**, collapsed by default.
Each row shows source purpose, Legal Entity, amount and currency, accounting
date or period, destination, readiness explanation, and next action. A details
drawer progressively reveals source coverage, balanced effect, policy,
mapping, Carrier Plan, artifact, and provider evidence.

Bulk actions display exact count, amount, Legal Entity, destination, posting
range, and exclusions. Selection never silently includes hidden pages, another
Legal Entity, or work that became ready after staff review. A stale selection
is revalidated and changed rows are identified.

Status copy keeps the independent authorities truthful: **Ready for review**,
**Scheduled**, **Accounting Release created**, **Queued for QuickBooks/Xero**,
**Provider accepted**, **Readback verified**, **Drift detected**, and
**Reconciliation verdict** are not collapsed into `synced` or `exported`.

Healthy automatic work stays quiet. Scheduled-review readiness, automatic
release failure, paused work, destination disconnection, and unknown provider
outcomes may create contract-owned notifications through the existing
communication system. Tenant-configured healthy summaries are optional.

Status is text-first and not color-only. Async results use restrained
programmatic status announcements, errors use a summary linked to rows,
drawers restore focus, bulk controls work by keyboard, content reflows at 200%
zoom, and reduced-motion preferences are honored.

### Observability

Staff-visible progress includes the next occurrence, oldest ready item, queue
delay cause, provider retry-after time when relevant, and exact action needed.
Operational telemetry includes destination-scoped queue age, oldest-ready age,
last logical occurrence, remaining provider quota, circuit state,
outcome-unknown count, and reason-coded fence exclusions. A blocked or
throttled destination cannot starve another tenant or destination. Alerts fire
only when a service threshold is breached or staff action is required.

### Release gates

No D12 behavior reaches production without:

- all three modes for direct and staff-mediated delivery;
- prospective policy, destination retirement/replacement, invalid policy,
  unauthorized actor, and stale impact-preview tests;
- timezone, spring-forward, fall-back, month-end, leap-day, missed-occurrence
  coalescing, duplicate occurrence, selection-cutoff, and catch-up tests;
- simultaneous schedule, Release now, Pause, resume, source change, policy
  change, retry, double-click, and deploy-restart tests;
- reviewed-set non-expansion plus mixed clean, changed, blocked, empty,
  multi-currency, multi-entity, and multi-destination result tests;
- QBO request-ID, item-level batch failure, throttling,
  timeout-after-provider-write, unknown-outcome, readback, and drift fixtures;
- Xero concurrency, minute/day limit, expired idempotency interval,
  `Retry-After`, partial-element failure inside HTTP `200`,
  timeout-after-provider-write, readback, and drift fixtures;
- direct-versus-staff-mediated lane, no-silent-failover, and
  artifact-not-delivered tests;
- wrong Tenant, Legal Entity, destination, realm, Xero organization,
  environment, lane, policy, mapping, and source-version negative tests;
- server-side view, release, pause/resume, configuration, and
  evidence-permission negative tests;
- tenant-fair seasonal load, destination-circuit, quota telemetry, queue-age,
  noisy-neighbor, and degraded-provider tests;
- durable cadence-evidence retention, OAuth-secret, PII-safe
  narration/logging, support-access, and audit-evidence tests;
- keyboard, focus, screen-reader, status-announcement, error-summary,
  responsive, 200%-zoom, and reduced-motion tests; and
- production-shaped usability testing with one-person finance teams,
  bookkeepers, many-fund mission organizations, and external accountants.

### Explicit non-goals

- No Asym-owned general ledger, accounting calendar, close, bank
  reconciliation, financial statements, or restatement workflow.
- No tenant-authored accounting, readiness, or provider rules.
- No arbitrary cron, workflow graph, risk engine, or approval-chain builder.
- No provider-limit bypass, priority purchase, or cross-tenant fast lane.
- No automatic treatment of accountant-owned exceptions.
- No provider batch presented as atomic Accounting Release or complete
  delivery.
- No artifact preview or download presented as provider import.
- No automatic failover between direct and staff-mediated delivery lanes.
- No mutable `ready`, `synced`, `exported`, or `reconciled` boolean that
  collapses the independent authorities.

### Current evidence for D12

The current provider, comparable-product, accessibility, UX, and full
adversarial evidence is retained in:

- [Phase 20 D12 Accounting Release cadence research](./phase-20-accounting-release-cadence-research-evidence.md)
- [QBO request IDs](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-field-definitions)
- [QBO limits and throttles](https://developer.intuit.com/app/developer/qbo/docs/learn/limits-and-throttles)
- [QBO batch operations](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/batch)
- [Xero rate limits](https://developer.xero.com/documentation/best-practices/api-call-efficiencies/rate-limits)
- [Xero idempotency](https://developer.xero.com/documentation/guides/idempotent-requests/idempotency/)
- [Ramp Accounting Agent and auto-sync](https://support.ramp.com/ramp-accounting-agent-enablement-daily-use-admin-guide/)
- [Ramp accounting queue](https://support.ramp.com/marking-transactions-as-synced/)
- [W3C status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## D13 — Cause-owned Accounting Exception Cases with shared Mission Control follow-up

**Founder ruling:** ratified and adversarially hardened on 2026-07-26.

D13 adopts **source-authoritative, cause-owned Accounting Exception Cases
through the quiet Ready for Accounting workspace, with versioned cause
contracts, exact blocking isolation, append-only case evidence, proof-gated
clearing and linked recurrence, homogeneous revalidated bulk actions, and
idempotent shared Mission Control follow-up that owns human assignment,
comments, due dates, and reminders but never financial truth**.

An Accounting Exception Case does not replace any authority established by
D1–D12. It coordinates attention around an exceptional condition currently
proved by its owning authority:

- source domains own economic facts and source correction;
- D4 owns Posting Intent, balanced Accounting Effect, and Source Coverage;
- D5 owns the selected certified provider-native recipe;
- D6 owns exact Designation Mapping and Mapping Coverage;
- D7 and D8 own QBO and Xero Carrier Plans and capability proof;
- D9 owns Processor Settlement Verdict and settlement evidence;
- D10 owns Bank Match;
- D11 owns compensating-correction policy and posting-period treatment;
- D12 owns release cadence and the Accounting Release fence;
- Delivery Operations and exact provider readback own external-write evidence;
  and
- QuickBooks Online or Xero remains authoritative for the tenant's books.

The shared Mission Control task model owns staff follow-up only. Task
assignment, comments, due dates, reminders, completion, dismissal, and
suppression do not change the Accounting Exception Case, clear its cause,
release blocked work, retry provider operations, or claim accounting
resolution.

### Minimal persisted model

D13 deliberately avoids a general-purpose case-management platform.

1. An **Accounting Exception Contract** is a closed, product-owned, versioned
   cause definition. It declares the detecting authority, stable cause code,
   root-cause scope, exact block radius, severity floor, recovery-owner kind,
   permitted actions, deferral bounds, revalidation procedure, proof required
   to clear, recurrence behavior, notification policy, and PII-safe display
   fields. It is not a tenant-authored rules language.
2. An **Accounting Exception Case** is one durable occurrence of one
   contract-defined, source-authoritative condition at its narrowest safe
   root-cause scope. It retains current authority references and immutable
   lineage to its predecessor or successor when the condition recurs.
3. **Accounting Exception Events** are the append-only evidence of observation,
   action, revalidation, external handling, proof-based clear, supersession,
   recurrence, task-link materialization, and bulk results.
4. An **Exception Cluster** is only a disposable UI grouping of compatible open
   cases. It is never persisted as financial or workflow authority.
5. A linked shared **Mission Control task** exists only when human action or
   judgment is required. Mission Control owns the assignee, queue, comments,
   due date, reminder, and human-follow-up status.

No separate occurrence table or cluster table is required in the initial
model. A case is one uninterrupted episode. Its event stream preserves the
episode history without introducing a general event-sourcing framework.

At most one active case may exist for one deterministic structural identity.
The key includes Tenant, Legal Entity, owning authority, cause and contract
version, exact root-cause scope, and only the destination, provider
organization, environment, connection, delivery lane, currency, or interval
dimensions the contract actually requires. One inactive mapped QBO account or
one lost destination authorization therefore opens one root-cause case rather
than one case per affected release.

If the same condition returns after an authoritative clear, D13 creates a new
linked successor case. It never reopens or rewrites the earlier cleared
episode. If an authority or contract version is legitimately replaced, the
old case may become `superseded` with exact successor lineage.

### Case lifecycle and cause-owned clearing

The bounded case lifecycle is:

`open → auto_recovering | action_required | waiting_for_evidence → resolved | superseded`

Assignment, acknowledgement, comments, reminders, task dismissal, and task
completion are not accounting-case states.

Every material action returns to the detecting authority for fresh
revalidation. A case becomes `resolved` only when its contract-specific proof
predicate passes. Allowed proof can include:

- the source, policy, mapping, Carrier Plan, destination, settlement, Bank
  Match, period, or provider authority now reporting a healthy condition;
- an exact source correction or authoritative successor;
- exact provider readback proving the intended outcome;
- a contract-permitted staff record that work was handled directly in QBO or
  Xero, with the required reason and evidence; or
- accountant direction where D11 assigns the decision to an authorized
  accounting professional.

There is no generic accounting-condition **Ignore**, **Dismiss**, **Mark
synced**, **Mark reconciled**, **Mark resolved**, or **Retry all** action.
Completing a linked task requests or observes revalidation; it cannot manufacture
resolution. Dismissing or suppressing a task affects follow-up only. The open
case remains visible in Accounting and continues to enforce its exact block.

Staff-recorded external handling uses the explicit action **Record handled in
QuickBooks** or **Record handled in Xero** only when the cause contract permits
it. The action states what Asym will and will not infer, captures the required
reference or attestation, attempts provider readback when available, and never
claims Asym delivered the original release. Later contradiction creates new
attention and preserves the earlier evidence.

### Detection, ordinary waits, and exact block radius

The authority capable of proving a condition detects and revalidates it.
Representative cause families include:

- missing or stale source facts;
- incomplete Source Coverage;
- missing, inactive, or incompatible mappings;
- Posting Profile or Carrier Plan capability drift;
- a posting period not permitted by D11 policy or accepted by the provider;
- provider authorization loss;
- a known provider validation or authorization failure;
- `Outcome unknown` after a write may have committed;
- provider object drift, deletion, or contradiction;
- incomplete or inconsistent processor-settlement evidence;
- ambiguous Bank Match evidence; and
- accountant direction required.

Ordinary waiting is not an exception: a payout inside its expected processing
window, a scheduled D12 review before its appointment, a provider operation
inside its healthy service objective, a Bank Match inside its expected arrival
window, or clean work awaiting the tenant's chosen cadence remains ordinary
status. It becomes exceptional only when a product-owned contradiction or
threshold is reached.

Runtime outages and workflow dead letters remain Phase 8 or workflow-recovery
truth. D13 may link a PII-minimized status when finance action is required but
does not duplicate the platform incident system. Suspected credentials,
security compromise, privacy exposure, or cross-tenant routing invokes the
platform containment process rather than an ordinary finance task.

Every cause contract declares the narrowest safe block radius, such as:

- one source occurrence or Release Candidate;
- one Accounting Release;
- one Delivery Operation and only its unsafe dependants;
- one mapping target and work that actually uses it;
- one Posting Profile or Carrier Plan recipe;
- one settlement account, currency, and evidence interval;
- one Accounting Destination delivery lane; or
- one Legal Entity only when a true entity-wide invariant is broken.

Unrelated clean work continues. Authorization loss for one direct-delivery
destination does not block evidence artifacts, another delivery lane,
destination, provider, Legal Entity, or Tenant. `Outcome unknown` blocks only
actions that could duplicate or contradict that exact operation.

### Shared Mission Control follow-up

Phase 20 reuses the repository's shared Mission Control task model rather than
creating accounting-specific assignments, comments, reminders, or due dates.

- One Accounting Exception Case links to zero or one active follow-up task.
- A task is created only when human action or judgment is required.
- One systemic or shared root cause produces at most one follow-up task, not one
  task for every affected operation.
- The task carries a PII-minimized summary and a deep link to the authoritative
  accounting evidence and action surface.
- Mission Control owns queue, assignee, comments, due date, reminder, and
  follow-up status.
- Phase 20 owns cause, affected authorities, blocking radius, evidence,
  revalidation, clear, supersession, and recurrence.
- Assignment never grants tenant, entity, destination, provider, or accounting
  authority.
- An assigned user must already have the required Tenant, Legal Entity,
  destination, and finance scope.
- If scope or membership is lost, the task returns to the configured finance
  queue or unassigned view without losing historical evidence.

The existing Mission Control seam must be hardened before accounting relies on
it:

- case transition plus Accounting Exception Event must be one transaction;
- task creation, links, and initial task event must be atomic or materialized
  from an idempotent outbox intent;
- contribution-specific task adapters and closed issue/link type unions must be
  generalized rather than forked;
- task, queue, link, comment, reminder, event, assignee, and accounting-case
  references require composite tenant-safe constraints and server-side
  Tenant, Legal Entity, destination, and role reauthorization;
- assignment and task-status writes require compare-and-swap or equivalent
  concurrency protection plus reliable update timestamps;
- accounting evidence persistence fails closed rather than using the existing
  fail-soft generic audit logger; and
- mutable attention rows and the seed-backed `/tasks` UI remain projections or
  prototypes, never accounting authority.

Task materialization may be eventually consistent, but it must be idempotent,
observable, replayable, and reconcilable by Tenant and Accounting Exception
Case identity. An open case without its required task is visible as an
operational defect; it does not disappear.

### Tenant control without configurable financial truth

Authorized tenants may:

- choose default finance queues and assignees by Legal Entity or Accounting
  Destination;
- assign, reassign, or unassign follow-up;
- add comments and a due date;
- use bounded **Remind me later**;
- raise urgency;
- choose grouped notification or daily-finance-digest preferences;
- filter and use an existing shared saved-view facility if available; and
- record contract-permitted external handling with required evidence.

Tenants may not redefine a cause, lower a mandatory blocker or safety floor,
remove required clearing evidence, treat an ambiguous provider outcome as
success or failure, retry outcome-unknown work blindly, or hide unresolved
cases from accounting totals and audit.

**Remind me later** defers routine reminders and moves follow-up to a clearly
labelled **Later** view. It preserves the case, block, age, totals, audit, and
search presence. It returns at the deadline and wakes early when impact
increases, evidence materially changes, the destination disconnects, the
assignee loses access, or the cause contract requires immediate attention.
Security containment, cross-tenant risk, and unsafe outcome-unknown causes
cannot be hidden.

### Staff experience

Accounting exceptions remain inside D12's **Ready for Accounting** Release
Horizon. One quiet **Needs attention** view presents the accounting cases and
the linked Mission Control follow-up inline; staff are not forced into a
separate ticket product to understand or repair accounting work.

Default lenses are:

1. **New or changed**
2. **Assigned to me**
3. **Unassigned**
4. **Assigned to others**
5. **Later**
6. **Recently cleared**, collapsed

Cases are grouped only when Tenant, Legal Entity, destination and environment,
cause-contract version, block-radius kind, next safe action, action
preconditions, and relevant currency treatment are compatible. A cluster is
derived and disposable; members remain inspectable and action results remain
per case.

Every cluster row states:

- the cause in plain language;
- the exact next safe action;
- affected count and amounts separated by currency;
- the Mission Control assignee or queue;
- oldest and latest observation;
- Legal Entity and destination;
- **What stopped**;
- **What continues**; and
- **Who can act**.

Raw provider codes and sanitized provider text appear under **Technical
details**, not as the primary heading.

One route-addressable detail surface shows:

1. **What happened**
2. **What is affected**
3. **What is still working**
4. **Recommended action**
5. **Evidence**
6. **History and follow-up**

It deep-links to the owning source, Accounting Release, Delivery Operation,
provider object, settlement evidence, Bank Match, correction surface, and
linked Mission Control task without copying editable source facts.

Simple assignment, comment, and reminder actions require no confirmation.
Consequential provider or financial actions use one compact review showing
exact count, Legal Entity, destination, accounting period, effect, duplicate-
safety behavior, and what remains unchanged.

### Safe bulk handling

Bulk actions are available only when every selected case supports the same
contract-owned action under compatible preconditions.

- Selection cannot cross Tenant, Legal Entity, provider organization,
  destination, environment, lane, or incompatible currencies.
- Selection across pages is explicit and freezes exact case IDs and an impact
  digest; newly matching cases are never silently added after review.
- The server reauthorizes and revalidates each case at execution.
- Stale, cleared, changed, or unauthorized cases are excluded with an exact
  reason.
- Partial success is preserved and disclosed per case.
- Every result links to one bulk-operation identifier and its own idempotency
  and evidence.
- Retry targets only operations conclusively proved failed and individually
  retryable.

Permitted examples include homogeneous assignment, one bounded reminder,
revalidation after a shared mapping or connection repair, retry of
proven-failed operations, and scheduled readback for outcome-unknown
operations. Forbidden examples include bulk financial resolution, blind retry
of unknown outcomes, fallback mapping, mixed-period correction, mixed-currency
totaling, or whole-release resubmission.

### Notifications, accessibility, and observability

Persistent truth lives in the workspace. Notifications are grouped and
exception-only:

- newly assigned follow-up;
- a new material or destination-wide condition;
- recurrence after clear;
- a reminder becoming due;
- aging beyond a product-owned threshold; or
- assignee access loss.

Repeated observations of an unchanged condition, every affected member of one
root cause, healthy retries, and routine automatic clears do not generate
notification storms.

The list uses semantic HTML tables where appropriate and accessible stacked
cards at narrow widths. Selection and row actions are keyboard operable;
status, severity, ownership, and deferral are never color-only; dynamic
updates use restrained status announcements; consequential bulk failures use
an error summary linked to each affected row; detail navigation restores
focus; and evidence remains usable at 200% text size and 400% zoom.

Staff-visible measures include new, unassigned, assigned-to-me, Later,
recurring, and unlinked-task counts; affected count and amounts by currency;
oldest open age; block radius; last authoritative observation; and next safe
action. Operational measures include open/clear and recurrence rates,
false-clear rate, outcome-unknown age, revalidation latency, provider cluster
size, task-outbox lag, partial-bulk-failure rate, unknown provider cause count,
tenant-fair queue age, and evidence-persistence failures. Assignment and task
completion are never counted as accounting resolution.

### D13 production gates

No D13 behavior reaches production without:

- every D4–D12 cause family mapped to a versioned contract or explicit safe
  unknown-cause contract;
- deterministic duplicate, simultaneous detect/clear/recur, contract
  supersession, and one-active-case property tests;
- transactional case-event failure tests and task-outbox replay/reconciliation;
- duplicate task materialization, partial task/link/event failure, concurrent
  assignment, and stale task-write tests;
- task completion, dismissal, suppression, and reminder tests proving none can
  clear or hide an unresolved case;
- exact block-radius tests proving unrelated clean work continues;
- QBO item-level batch, stale object, inactive reference, authorization,
  closed-period, deletion, throttling, timeout-after-write, readback, and drift
  fixtures;
- Xero partial-element failure inside HTTP `200`, validation, lock date,
  authorization, organization offline, throttling, timeout-after-write,
  idempotency expiry, readback, and drift fixtures;
- Stripe duplicate/out-of-order webhook, paid-then-failed payout, incomplete
  pagination, manual/Instant payout, and settlement-classification fixtures;
- direct and staff-mediated delivery, artifact-not-imported,
  provider-handled, contradictory readback, and recurrence tests;
- composite Tenant, Legal Entity, destination, provider organization,
  environment, lane, task, assignee, case, source, and evidence negative tests;
- evidence redaction, PII-safe indexing, support access, retention, legal hold,
  disposal, and audit export tests;
- many-fund root-cause, destination-wide outage, seasonal volume, pagination,
  tenant fairness, notification deduplication, and circuit-breaker tests;
- homogeneous and mixed bulk selection, frozen selection, stale membership,
  partial success, unauthorized member, per-case evidence, and double-submit
  tests;
- keyboard, focus, error-summary, screen-reader announcement, color
  independence, responsive, zoom, and target-size tests; and
- production-shaped usability testing with bookkeepers, one-person finance
  teams, many-fund missions organizations, tenant finance admins, and external
  accountants.

### Explicit non-goals from D13

- No new accounting-specific task, comment, reminder, watcher, subtask, tag,
  SLA, approval, routing, or workflow system.
- No tenant-authored exception definitions, clearing rules, priority formula,
  or automation graph.
- No task, attention-row, workflow, or case state as financial truth.
- No generic accounting-condition ignore, dismiss, resolution, reconciliation,
  or retry action.
- No assignment as permission, approval, or accounting authority.
- No reminder as pause, resolution, or concealment from totals and audit.
- No blind retry of outcome-unknown provider writes.
- No one exception blocking unrelated clean Accounting Releases.
- No editable source, provider, settlement, Bank Match, or correction facts in
  the exception surface.
- No automatic provider failover, destination change, lane change, accounting
  period change, or suspense mapping.
- No mutation or deletion of an Accounting Release or prior case evidence.
- No claim that Asym is the tenant's general ledger, close system, final bank-
  reconciliation system, incident-management system, or accounting-advice
  authority.

### Current evidence for D13

The current provider, comparable-product, repository, accessibility, UX, edge-
case, and full adversarial evidence is retained in:

- [Phase 20 D13 Accounting Exception Operations research](./phase-20-accounting-exception-operations-research-evidence.md)
- [Shared Mission Control task boundary](../../../openspec/specs/platform-boundaries/spec.md)
- [QBO common API errors](https://developer.intuit.com/app/developer/qbo/docs/develop/troubleshooting/handling-common-errors)
- [QBO batch operations](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/batch)
- [Xero response codes](https://developer.xero.com/documentation/api/accounting/responsecodes)
- [Xero idempotency](https://developer.xero.com/documentation/guides/idempotent-requests/idempotency/)
- [Stripe webhook behavior](https://docs.stripe.com/webhooks)
- [Ramp Accounting](https://support.ramp.com/overview-of-ramp-accounting)
- [Modern Treasury manual reconciliation](https://docs.moderntreasury.com/payments/docs/exception-handling-manual-reconciliation)
- [WCAG 2.2 financial error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data)

## D14 — Destination-pinned, provider-native authorization lifecycle

**Status:** Ratified 2026-07-26.

The founder ratified **C-prime-amended-and-hardened (C-prime-R) — one exact,
provider-native authorization lifecycle separating encrypted Provider
Authorization Grants from tenant- and Legal-Entity-scoped Accounting
Destination Connections; with serialized rotation, same-organization
proof-gated reconnect, explicit prospective destination replacement,
least-blast-radius disconnect, immediate local quarantine, outage-aware
automatic recovery, artifact-always continuity, append-only evidence, and one
quiet accessible staff surface.**

### Governing distinction

An OAuth callback proves only that a provider authorized something. It does not
prove that the provider authorized the same set of books already bound to the
tenant's Legal Entity.

- An **Accounting Destination** remains the stable external set of books:
  provider, environment, and exact QBO `realmId` or Xero `tenantId`.
- A **Provider Authorization Grant** is the provider-native secret-bearing
  credential family, granted scopes, provider-user subject where available,
  expiry evidence, credential generations, and rotation history.
- An **Accounting Destination Connection** is the tenant- and
  Legal-Entity-scoped binding from one exact Accounting Destination to an
  authorized Provider Authorization Grant.
- A short-lived **OAuth Attempt** is the single-use server transaction that
  starts connect, reconnect, scope repair, or destination replacement. It is
  not durable financial truth.
- Provider service health, authorization usability, destination identity,
  D7/D8 capability certification, Delivery Operation outcome, Accounting
  Exception Case state, and Accounting Release eligibility remain independent
  authorities.

Display names, legal names, tax numbers, the authorizing provider user,
connection IDs, staff attestations, token presence, and provider status pages
are recognition or operational evidence. None substitutes for the provider-
owned stable organization identifier and a live destination-specific proof.

### Provider-native grant shape

QBO and Xero do not share one safe token model.

- QBO access tokens are short-lived and one QBO grant is normally associated
  with one exact company. Intuit periodically replaces refresh-token values
  and warns that concurrent refresh attempts can return `invalid_grant` and
  invalidate working credentials.
- A Xero access/refresh-token family belongs to the Xero user and Asym app and
  may authorize several organization connections. A later authorization for
  the same user/app supersedes the earlier token set, while every provider call
  still requires an exact `xero-tenant-id`.
- Consequently, Asym must not duplicate one mutable Xero token family into one
  secret row per tenant or destination. A provider grant may back several exact
  Accounting Destination Connections, but every tenant-visible binding,
  permission check, provider call, disconnection, and evidence record remains
  scoped to its own Tenant, Legal Entity, destination, provider organization,
  and environment.
- QBO and Xero differences live behind two provider adapters and one bounded
  product vocabulary. Phase 20 does not create a generic OAuth platform for
  hypothetical providers.

### Secure OAuth attempt and callback

Connect and reconnect require current Asym authentication and the exact
accounting-connection capability within the relevant Tenant and Legal Entity.

Each OAuth Attempt is:

- random, opaque, expiring, and single-use;
- stored server-side;
- bound to actor, authenticated session, Tenant, Legal Entity, provider,
  environment, purpose, destination or setup candidate, expected organization
  for reconnect, requested scopes, setup revision, and nonce;
- bound to a PKCE verifier when the selected provider/client type supports
  PKCE;
- invalid after replay, expiry, session loss, membership loss, permission loss,
  purpose mismatch, provider mismatch, environment mismatch, or setup
  supersession; and
- permitted to return only to a validated internal route.

The callback:

1. revalidates current Asym session, membership, capability, Tenant, Legal
   Entity, purpose, setup revision, state, nonce, expiry, and single-use status;
2. exchanges the authorization code exactly once on the server;
3. immediately redirects the browser to a clean, `no-store` URL containing no
   code, state, token, or provider error secret;
4. discovers provider organizations server-side rather than accepting a
   provider organization identifier from browser or job input;
5. reads the exact provider organization and required capability evidence;
6. stages returned credentials encrypted and unavailable to delivery workers;
7. promotes the candidate only after destination, environment, scope,
   capability, and tenant-authority proof succeeds; and
8. records append-only non-secret lifecycle evidence.

The callback page loads no analytics, advertising, social, or other third-party
resources that could receive authorization parameters.

### Initial connection

Before an Accounting Destination has ever been used by an Accounting Release,
the provider organization is a setup candidate rather than frozen destination
history.

The ordinary one-entity flow is:

1. choose QBO or Xero;
2. leave Asym through a same-tab provider authorization redirect;
3. return to a clean Asym result page;
4. choose an organization only when the provider made more than one available;
5. review provider, organization name, provider-ID suffix, base currency,
   Legal Entity, environment, and plain-language access purpose; and
6. activate only after live identity, required-scope, capability, provider-
   native preview, and read-only verification succeed.

One successful setup action is sufficient. There is no separate approval
bureaucracy, token administration page, or mandatory multi-entity interface
for the ordinary tenant.

### Serialized credential rotation

Provider Authorization Grant rotation is single-writer and monotonic:

1. load the current credential generation;
2. acquire one short grant-scoped refresh lease;
3. reload the generation after acquiring the lease;
4. reuse a newer usable generation if another worker already promoted it;
5. otherwise perform exactly one provider-certified refresh exchange;
6. encrypt and compare-and-swap the complete returned credential set;
7. record redacted timing, generation, provider request identity, and outcome;
8. wake waiting operations with the promoted generation; and
9. handle a lost or ambiguous response according to that provider's documented
   recovery semantics rather than issuing a concurrent second refresh.

Workers load secrets just in time. Durable work envelopes contain internal
destination, grant, connection, operation, and authorization-epoch references,
never token values.

Low-frequency, jittered, quota-aware upkeep may keep an intentionally enabled
direct integration inside the provider's rolling inactivity window and detect
external revocation before a finance deadline. Its timing is provider-contract-
owned, not tenant-configurable, and it must not become continuous polling or
one refresh job per access-token lifetime.

### Secret custody and rotation

- Asym's QBO and Xero application client credentials belong to platform
  operations, not tenants, and remain separated by provider and environment in
  managed secret storage.
- Provider grants use authenticated encryption, a versioned key identifier,
  audited key access, and associated data bound to invariant provider, app,
  environment, grant-family, and credential-generation context.
- Before decrypting a grant that can serve several Xero connections, the
  server proves the current Tenant, Legal Entity, Accounting Destination
  Connection, provider organization, environment, and authorization epoch
  belong to that grant.
- No token, client secret, authorization code, state value, ciphertext, raw
  provider response, or secret suffix appears in browser storage, URLs after
  callback cleanup, logs, traces, analytics, tasks, notifications, artifacts,
  support exports, or general audit rows.
- A key or token-format migration supports versioned read-old/write-new
  re-encryption, rollback rehearsal, and restore quarantine. Restoring an older
  database snapshot can never reactivate a stale credential generation without
  live revalidation.
- Provider app-secret rotation follows a provider-certified operator runbook.
  Asym does not assume both providers support overlapping client secrets or
  that changing a client secret preserves every existing token family.

Tenants never paste QBO/Xero client secrets, access tokens, or refresh tokens.
Support users never retrieve or impersonate a tenant with provider secrets.

### Same-organization reconnect

Reconnect always starts from the existing Accounting Destination Connection
and tells staff which organization must be selected.

- QBO reconnect succeeds only when the callback returns the exact stored
  `realmId` and Asym can read that exact company.
- Xero reconnect succeeds only when the exact stored `tenantId` appears in the
  Connections result attributable to the current authorization event and Asym
  can read that exact organization.
- Environment, required scopes, provider permission, current Asym authority,
  Legal Entity ownership, and D7/D8 capability proof must also pass.
- Another properly authorized QBO or Xero administrator may repair access to
  the same exact organization. The departed original authorizer is not the
  destination.
- A provider display-name change does not create a new destination when the
  stable organization identifier remains unchanged.

For a Xero grant shared by several exact connections, promoting a new token
generation revalidates each attached connection before making the new
generation available. One connection's failure becomes its own exact
authorization condition; it does not silently redirect or expose another
connection.

If the callback identifies another organization:

- nothing changes in the current Accounting Destination Connection;
- candidate credentials cannot reach delivery workers;
- pending work does not retry;
- the result shows the expected and selected organizations without exposing
  secret identifiers;
- staff may **Try again**; and
- separately authorized staff may start **Replace accounting destination**.

### Prospective destination replacement

Replacing the provider organization is never reconnect. One bounded review
shows:

- current and proposed organization;
- Tenant, Legal Entity, provider, and environment;
- base currency and provider capabilities;
- unreleased Accounting Releases;
- accepted or outcome-unknown Delivery Operations;
- mappings, Posting Profile, and carrier plan requiring revalidation;
- provider-native references that remain tied to the old books;
- what stops, what remains available as artifacts, and what may resume; and
- the exact prospective action.

Replacement creates a new effective-dated Accounting Destination version. It
does not rewrite, redirect, dual-write, or backfill prior Accounting Releases,
artifacts, provider objects, readback, Bank Matches, correction evidence, or
reconciliation history. Accepted and outcome-unknown operations remain pinned
to and are resolved against the original destination.

### Least-blast-radius disconnect and revocation

**Disconnect this organization** is a secondary destructive action, not the
normal repair action.

Before confirmation, the UI states:

- no new direct operations will begin;
- accepted provider objects remain in QBO or Xero;
- immutable Accounting Releases, artifacts, mappings, and history remain;
- queued direct delivery is held rather than deleted;
- in-flight and outcome-unknown work remains separately truthful;
- automatic grant upkeep stops for the affected scope;
- reconnect can repair the same destination; and
- provider-side revocation may remain pending if the provider is unavailable.

On confirmation, Asym:

1. reauthorizes the actor and rechecks exact scope;
2. atomically increments the authorization epoch and quarantines new direct
   work;
3. fences stale workers before any external revocation call;
4. preserves and reconciles in-flight and outcome-unknown operations;
5. invokes the provider action with the narrowest valid blast radius;
6. records local quarantine separately from provider confirmation;
7. retains sealed credentials only for a purpose-limited revocation worker;
8. destroys active secret material after confirmed revocation, deletion, or a
   documented terminal provider state; and
9. opens one D13 Accounting Exception Case only when provider confirmation or
   human follow-up remains necessary.

For Xero, ordinary one-organization disconnect deletes the exact
`connectionId`. Whole-token revocation is a platform/security operation
permitted only after calculating every affected connection. One tenant cannot
enumerate, interrupt, or revoke another tenant's destination.

Suspected compromise triggers immediate local quarantine and security routing.
It cannot wait for provider availability or tenant confirmation.

### Outage-aware recovery and accounting continuity

Provider status services are cached operational signals, not authorization or
destination truth.

During a provider-wide OAuth or Accounting API outage, Asym:

- stops unsafe new direct calls to the affected provider component;
- preserves tenant-fair queues and each Delivery Operation identity;
- continues source processing, Accounting Release preparation, immutable
  artifact creation, and unrelated providers and destinations;
- does not switch the selected delivery lane automatically;
- does not ask every tenant to reconnect;
- does not create one task or notification per affected operation;
- honors provider `Retry-After` and bounded exponential backoff;
- distinguishes a platform incident from tenant-actionable authorization
  failure; and
- resumes only after provider recovery and a destination-specific authenticated
  probe.

QBO `invalid_grant`, HTTP `401`, Xero `403`, or a failed token exchange is not
enough on its own to claim that a tenant revoked access. The provider adapter
classifies stale generation, concurrent rotation, provider outage, actual
revocation, expired grant, changed provider permission, inactive organization,
scope loss, app-secret misconfiguration, and unknown failure separately.

Authorization recovery never blindly retries an accepted or outcome-unknown
provider write. Readback and D2's operation-granular recovery rules remain
authoritative.

### Staff experience

Accounting settings show one quiet card per Accounting Destination Connection:

- full provider name and approved provider mark;
- verified organization display name;
- Legal Entity;
- non-production environment badge;
- authorization status shown as **Connected**, **Action needed**, or
  **Disconnected**, with text and icon rather than color alone;
- last provider verification;
- materially blocked release count;
- a plain-language scope and capability summary under progressive disclosure;
- one primary next action; and
- permitted secondary actions for details, reconnect, replace destination, and
  disconnect.

Provider service health remains separate from authorization status. A temporary
outage says:

> QuickBooks is temporarily unavailable. No action is needed. We'll try again.

A tenant-actionable authorization condition says:

> Reconnect QuickBooks to continue sending new accounting releases. Existing
> artifacts and accepted QuickBooks entries are unchanged.

A wrong-company return says:

> You connected a different QuickBooks company. Nothing was changed in Asym.

Primary staff copy does not say `invalid_grant`, `realm mismatch`, `401`,
`403`, refresh token, or authorization epoch. Redacted provider codes, request
identifiers, and lifecycle evidence remain available under **Technical
details**.

The flow:

- uses a normal same-tab redirect rather than depending on popups;
- preserves the return route and non-secret UI context;
- shows the expected organization before leaving Asym;
- moves focus to the result heading on return;
- announces dynamic success or error without stealing focus;
- provides persistent, actionable results rather than toast-only feedback;
- remains usable with keyboard, screen reader, browser Back, denied consent,
  expired callback, expired session, mobile width, 200% text, and 400% zoom;
- does not rely on color or animation; and
- returns focus correctly when a destructive confirmation is canceled.

Routine refresh, liveness probes, provider token dates, and grant-generation
details never become ordinary finance-staff work.

### Authorization, tenant safety, and evidence

Server capabilities distinguish at least:

- view an Accounting Destination Connection;
- connect or reconnect the same destination;
- manage accounting connection settings;
- disconnect an exact destination;
- replace an Accounting Destination; and
- perform platform/security-wide grant revocation.

Legal Entity scope is subtract-only inside the Tenant. Assignment to a D13
case or Mission Control task never grants these capabilities.

Every provider call carries or resolves immutable internal Tenant, Legal
Entity, Accounting Destination Connection, provider, environment, provider
organization, authorization-grant generation, authorization epoch, and
operation identity. Client-supplied or ambient provider organization IDs are
never trusted.

Lifecycle evidence is transactional or outbox-backed and fails closed. It is
append-only and contains non-secret events such as attempt started, exact
organization verified, candidate rejected, grant promoted, refresh succeeded,
refresh failed by classified cause, authorization quarantined, disconnect
requested, provider deletion/revocation confirmed, same-destination
reauthorized, destination mismatch, and support evidence accessed.

Support access is time-bounded, purpose-scoped, tenant-safe, and audited. It may
inspect organization identity, redacted provider evidence, grant generation,
classification, and safe probes; it cannot retrieve tokens or use the grant to
browse accounting data.

### D14 production gates

Direct QBO/Xero authorization remains disabled until:

- current QBO production-credential, technical-review, security-review, and
  disconnect obligations are satisfied;
- current Xero app tier, certification, connection capacity, required scopes,
  and rate limits support forecast tenant and seasonal volume;
- connect, denied-consent, disconnect, reconnect, scope-repair, wrong-company,
  and destination-replacement flows pass in provider sandboxes or approved test
  organizations;
- missing, expired, replayed, cross-session, cross-tenant, cross-provider, and
  cross-environment OAuth state fails closed;
- callback-after-logout, membership-loss, role-loss, setup-supersession, and
  duplicate-code tests make no state change;
- callback URLs, HTML, browser storage, analytics, logs, traces, errors, tasks,
  notifications, artifacts, backups, and support exports are proved secret-
  free;
- QBO concurrent-refresh, stale-token, lost-response, five-year expiry,
  provider-outage `invalid_grant`, external revocation, and company-permission
  fixtures pass;
- Xero concurrent-refresh, bounded old-token recovery, same-user reauthorization
  supersession, multi-organization grant, per-connection deletion, broad-
  revocation blast radius, user-role loss, inactive organization, and missing-
  scope fixtures pass;
- monotonic credential generations, refresh leases, compare-and-swap,
  authorization epochs, stale-worker fencing, deployment rollback, key
  rotation, KMS outage, and backup-restore quarantine pass;
- wrong QBO `realmId` and wrong Xero `tenantId` never mutate or release the
  existing destination;
- cross-tenant grant, destination, connection, operation, task, and evidence
  references fail at database and service boundaries without revealing another
  tenant;
- reconnect never changes an existing operation's destination or automatically
  retries accepted or outcome-unknown work;
- local quarantine works while provider APIs are unavailable and the UI
  truthfully distinguishes local containment from pending, confirmed, or
  outcome-unknown provider revocation;
- provider-wide outage produces one operational incident rather than tenant
  reconnect, task, or notification storms;
- dashboards expose redacted refresh outcomes, generation conflicts, last
  verification, destination mismatches, revocation lag, provider outage,
  quota delay, and shared-grant fanout;
- client-secret rotation, emergency revocation, provider kill switch, KMS
  outage, rollback, and restore runbooks are rehearsed; and
- production-shaped moderated tests prove finance staff can connect, recognize,
  repair, and disconnect the intended organization with keyboard, screen
  reader, mobile, and zoom support.

### Explicit non-goals from D14

- No tenant-pasted QBO/Xero credentials.
- No tenant-visible application client secrets or token-management console.
- No manual access-token or refresh-token rotation.
- No generic OAuth broker, identity provider, secrets product, or connector
  framework for hypothetical providers.
- No provider organization matching by display name, email, tax number, or
  authorizing user.
- No one mutable `connected`, `active`, or `healthy` flag as authorization
  truth.
- No reconnect that may silently replace an Accounting Destination.
- No broad Xero token revocation for an ordinary one-organization disconnect.
- No credential, destination, provider, or environment fallback.
- No provider status page, task completion, or staff toggle as proof of usable
  authorization.
- No automatic delivery-lane change, destination failover, backlog release, or
  blind retry after authorization recovery.
- No provider token or secret in general audit logs, workflow payloads,
  artifacts, or support tools.
- No second task, incident, comment, reminder, notification, or approval
  system.
- No claim that Asym owns QBO/Xero identity, provider availability, provider
  books, period close, or final reconciliation.

### Current evidence for D14

The current provider, OAuth-security, comparable-product, repository,
accessibility, UX, edge-case, and full adversarial evidence is retained in:

- [Phase 20 D14 Provider Authorization Lifecycle research](./phase-20-provider-authorization-lifecycle-research-evidence.md)
- [OAuth 2.0 Security Best Current Practice (RFC 9700)](https://www.rfc-editor.org/rfc/rfc9700.html)
- [QBO OAuth FAQ](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/faq)
- [QBO OAuth flow and revocation](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)
- [QBO technical requirements](https://developer.intuit.com/app/developer/qbo/docs/go-live/publish-app/technical-requirements)
- [QBO security requirements](https://developer.intuit.com/app/developer/qbo/docs/go-live/publish-app/security-requirements)
- [Xero authorization flow](https://developer.xero.com/documentation/guides/oauth2/auth-flow/)
- [Xero token types](https://developer.xero.com/documentation/guides/oauth2/token-types)
- [Xero Tenants and Connections](https://developer.xero.com/documentation/guides/oauth2/tenants/)
- [Xero Managing Tokens and IDs](https://developer.xero.com/documentation/best-practices/data-integrity/managing-tokens)
- [Xero connection cleanup](https://developer.xero.com/documentation/best-practices/managing-connections/designing-and-implementing-connection-cleanup-routine)
- [Xero OAuth limits](https://developer.xero.com/documentation/guides/oauth2/limits/)
- [Ramp QBO reconnect behavior](https://support.ramp.com/quickbooks-online-custom-fields/)
- [Dext connection-health behavior](https://help.dext.com/en/articles/687108-how-to-manage-data-health-insights-connections)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## D15 — Workload-shaped certified capacity

**Founder ruling:** ratified and adversarially hardened on 2026-07-26.

D15 adopts **product-owned, workload-shaped certified capacity over immutable
Accounting Release operations, separating destination capability, an
Asym-tested structural execution envelope, the exact per-release Provider
Delivery Plan, and live provider-capacity observations; with conservative
provider-contract limits, tenant-fair and recovery-safe backpressure,
calibrated accessible completion windows, operation-granular idempotency and
readback, explicit pre-freeze delivery choice, artifact-always evidence
continuity, and proof-gated prospective expansion—without tenant quota
controls, silent grain or lane substitution, or a second capacity platform.**

D15 closes Phase 20's seasonal direct-delivery scale and launch-readiness
boundary. It governs whether and when an already valid Provider Delivery Plan
may consume QBO or Xero capacity. It does not determine source eligibility,
accounting policy, Posting Profile, mapping, provider carrier meaning,
destination identity, period treatment, delivery outcome, provider drift, Bank
Match, or reconciliation.

### Separate capacity authorities

D15 preserves five different truths:

1. **QBO/Xero Capability Certificate** — D7 or D8 time-bounded proof that one
   exact destination currently supports the selected carrier plan,
   permissions, provider objects, relationships, and material capabilities.
2. **Certified Execution Envelope** — one product-owned, immutable version of
   the structural provider-operation shapes Asym has proved for an exact
   provider contract, environment, adapter, recipe, and endpoint.
3. **Provider Delivery Plan** — D2's immutable per-release compilation of exact
   operations, dependencies, payload digests, line and byte counts, batch
   membership, stable request identities, and required readbacks.
4. **Provider Capacity Observation** — volatile, source-labelled evidence about
   current provider quota, health, commercial headroom, and tenant-fair queue
   conditions.
5. **Delivery Operation evidence** — D2's append-only operation attempts,
   provider outcomes, throttling, ambiguity, exact readback, and drift.

The Certified Execution Envelope proves structural safety. It never freezes or
promises live quota, queue position, provider health, commercial headroom, or
an exact completion time. Capacity observations cannot enlarge an envelope,
and production traffic cannot silently teach a new limit.

The Provider Delivery Plan is also the immutable release workload manifest.
The same compiler that creates provider operations produces all capacity
measurements and reason codes. A separate estimator, UI calculation, or worker
formula cannot drift from the plan that will actually execute.

### Workload-shaped certification

A source-item count is not a capacity unit. The same number of gifts,
expenses, or settlement components may compile into radically different
provider objects and API work under gift detail, gift-and-fund detail, or fund
summary.

Each certified envelope covers at least:

- provider, environment, provider-contract version, adapter, recipe, and
  endpoint;
- operation family, dependency order, provider objects, and nodes;
- lines and serialized request bytes per provider object;
- attachments, attachment bytes, and separately metered attachment calls;
- mutation requests after certified batching;
- preflight, exact-readback, ambiguity-lookup, and drift-check requests;
- endpoint-specific query, page, and expected response shapes;
- per-destination and app-global call demand;
- idempotent retry and outcome-recovery demand;
- QBO Core and CorePlus projection;
- Xero ingress, egress, connection, and app-tier projection;
- destination scopes, subscription capabilities, currency, and period
  compatibility; and
- measured latency distribution and safe timeout margin.

Certification uses the production adapter, compiler, scheduler boundary,
idempotency path, exact-readback path, and evidence path. Sandbox fixtures are
necessary but insufficient where provider terms permit a bounded production
canary.

The initial QBO envelope uses no more than 10 payloads per batch because
Intuit's current batch page says 10 while its limits page recommends 30. The
more permissive value cannot become production behavior without current
provider confirmation and new production-shaped evidence. Xero batch, node,
byte, page, and response behavior is certified per endpoint rather than
inferred from one global recommendation.

An envelope expires or is superseded after a material provider contract,
adapter, compiler, recipe, serializer, scope, tier, endpoint, payload, or
recovery change. Historical releases retain their pinned versions and
evidence. A provider rejection may contract or quarantine a current envelope
immediately; expansion always requires prospective proof.

### Admission and the Accounting Release fence

The release review derives one of five plain-language outcomes:

1. **Ready now** — every operation fits current structural evidence and live
   write, exact-readback, and recovery budgets are healthy.
2. **Ready, queued** — work is structurally certified and safe, but
   tenant-fair scheduling places it behind admitted work. The release may be
   frozen and queued with a truthful completion range.
3. **Waiting for provider** — throttling, an organization-offline condition, a
   provider incident, or temporary app capacity prevents progress. No tenant
   action is requested.
4. **Needs tenant action** — authorization, permission, provider-subscription
   capability, mapping, destination, closed-period, or provider-record drift
   requires one exact staff correction. It is not presented as a capacity
   delay.
5. **Outside certified envelope** — direct delivery cannot cross the release
   fence. Before release, staff may wait for prospective envelope expansion,
   activate a prospective D5 Posting Profile version through its owning setup,
   adjust unreleased grouping only through the authority that owns it, or
   deliberately choose D2's staff-mediated lane.

There is no per-release Posting Profile override and no staff safety override.
All D12 automatic, scheduled-review, held-for-staff, and Release now paths enter
the same atomic fence.

For structurally certified work, temporary quota exhaustion or a transient
provider outage governs scheduling and the completion forecast rather than
invalidating or mutating the Accounting Release. Destination identity,
authorization, provider-contract uncertainty, and structural-envelope failure
still fail closed.

Once a direct Accounting Release is frozen, later quota or provider-health
changes may delay it but cannot change its Accounting Effect, destination,
Posting Profile, mapping, Carrier Plan, Provider Delivery Plan, or mutually
exclusive lane. Its Accounting Evidence Artifact remains available, but that
artifact is not represented as a provider import file unless the
staff-mediated lane was selected before freeze.

### Provider-native, tenant-fair scheduling

Scheduling observes the providers' independent constraints:

- a QBO-realm governor enforces request-per-second, request-per-minute, batch,
  timeout, and provider-directed retry behavior;
- a Xero-organization governor enforces concurrent, minute, and fixed daily
  windows;
- a Xero app-wide governor protects the current app-global window;
- QBO monthly CorePlus capacity and Xero connection, egress, and tier headroom
  remain commercial launch and operational gates rather than tenant settings;
- per-destination dependency order is preserved while unrelated tenants may
  execute concurrently;
- tenant-fair selection prevents one large release from starving other
  tenants; and
- new writes cannot consume the scheduler budget protected for exact readback,
  outcome-unknown lookup, and safe recovery.

Tenants control their bounded D5 accounting representation, D12 cadence, and
permitted pre-freeze delivery choice. They do not configure raw rate limits,
batch size, concurrency, queue priority, recovery reserve, or a paid fast lane.
Fairness is product owned, inspectable, and tested for both small and large
tenants.

The scheduler remains an implementation boundary, not a domain authority. D15
does not require Inngest or any other workflow vendor before the repo formally
adopts it.

### Partial outcomes, ambiguity, and recovery

Provider HTTP success never proves whole-plan success:

- QBO top-level and every batch-item response are parsed independently;
- Xero bulk responses retain every element's result and validation evidence;
- each mutation uses the provider-native idempotency facility plus one stable
  Asym operation identity and payload digest;
- a timeout, missing response, expired idempotency window, or contradictory
  evidence enters `Outcome unknown`;
- an uncertain operation is looked up or read back exactly before any new
  write identity is issued;
- only the proven-safe unresolved subset may retry;
- accepted, confirmed, failed, and outcome-unknown operations remain
  independently visible; and
- a provider outage, quota delay, or local worker restart never silently
  changes lane or weakens exact readback.

If runtime latency is slower than the certified measurement while the
operation remains structurally valid, execution continues under safe
backpressure and the completion range is revised. If the provider rejects a
supposedly certified structural shape, Asym stops unproved affected work,
quarantines uncertainty, contracts the envelope for new admission, performs
exact readback, and opens the applicable D13 cause-owned exception.

### Bookkeeper-first staff experience

D15 extends D12's **Release Horizon** rather than adding a capacity dashboard.
The default review shows:

- exact Legal Entity and QBO/Xero organization;
- Accounting Release period, amount, identifier, and selected delivery lane;
- an understandable provider summary such as
  `12 QuickBooks journal entries` or `8 Xero accounting records`;
- independently truthful `Accounting evidence ready`;
- one readiness statement and confidence-aware completion range;
- only actionable blockers or warnings; and
- one primary action appropriate to the current state.

Provider operations, lines, bytes, readbacks, current provider window,
certificate and envelope versions, last evaluation, and technical reason codes
remain available under **Why this timing?** Raw quota arithmetic, provider
headers, request payloads, worker names, donor data, and generic API errors are
not ordinary finance copy.

After staff start direct delivery, Asym returns control immediately and says
that work will continue in the background. The human-facing stages are:

1. preparing provider plan;
2. waiting for safe provider capacity;
3. delivering to QBO or Xero;
4. verifying provider records;
5. complete;
6. needs attention; or
7. stopped before all work was released.

Progress uses comparable confirmed operation counts, for example
`812 of 817 provider operations verified`. A determinate percentage appears
only when its denominator is frozen and its units are meaningfully comparable.
Otherwise the UI uses stage, exact counts, and an indeterminate textual status.

Completion timing is a calibrated range or coarse window, shows when it was
last evaluated, distinguishes queue wait from provider throttling, outage,
delivery, and verification, and disappears when evidence cannot support it.
There is no countdown or exact promise derived from source count.

Notifications remain quiet. Finance is notified only when:

- delivery completes;
- staff action becomes necessary;
- the displayed completion window materially slips; or
- direct delivery becomes unavailable.

Repeated retries, polls, throttles, and short provider incidents do not create
notification, task, or screen-reader announcement storms. D13 coalesces
actionable recurrence by cause.

Status and progress are programmatically exposed without moving focus.
Determinate bars have meaningful value, minimum, maximum, label, and text;
indeterminate work does not expose false zero-percent progress. Dynamic changes
use polite, throttled announcements for material transitions, preserve focus
and reading order, remain keyboard-complete, work at narrow widths and zoom,
and never rely on color, icon, animation, or toast alone.

### D15 production gates

Direct QBO or Xero delivery remains unavailable until:

- current provider terms, documentation, production approval, tier, scopes,
  connections, commercial headroom, and security obligations are proven;
- D7/D8 destination certification and every D15 structural workload shape pass
  for the exact provider-contract and adapter versions;
- source coverage, mapping coverage, exact balance, deterministic dependency
  order, payload digest, and provider-effect equivalence pass before freeze;
- provider-native idempotency, body and item-level error parsing,
  timeout-after-commit, lookup-before-retry, exact readback, and drift tests
  pass;
- QBO per-second, per-minute, batch, timeout, CorePlus, maintenance,
  subscription, and provider-support-evidence fixtures pass;
- Xero concurrent, minute, daily, app-global, node, byte, partial-outcome,
  six-minute-idempotency, organization-offline, egress, connection, scope, and
  tier fixtures pass;
- seasonal tests cover 100, 1,000, and 10,000 source items, all certified D5
  grains, 1,200 and 10,000 Designations, boundary line/byte shapes,
  attachments, multiple simultaneous tenants, and concurrent QBO/Xero work;
- fairness tests prove one large tenant cannot starve small tenants, one
  destination's throttle does not stop unrelated destinations, and recovery
  retains protected capacity;
- restart, deployment, lease expiry, pause/resume, provider outage, local kill
  switch, authorization loss, partial acceptance, ambiguous response, and
  external mutation never duplicate, omit, or silently reroute work;
- observability records queue age, wait reason, quota evidence, operation
  outcomes, completion-window variance, fairness, provider correlation IDs,
  and support-safe error details;
- displayed completion ranges are calibrated against production-shaped
  evidence and removed when confidence is insufficient;
- Accounting Evidence Artifacts remain available independently of provider
  health without being misrepresented as delivered or imported;
- keyboard, screen-reader, focus, contrast, reduced-motion, responsive,
  plain-language, and notification-coalescing verification passes; and
- named owners and rehearsed runbooks exist for provider contract review,
  certification, security assessment, tier or payment failure, capacity drift,
  seasonal incidents, kill switches, and recovery.

Envelope expansion requires a new prospective version and new evidence. A
provider incident may safely contract or disable an envelope immediately but
cannot expand it.

### Explicit non-goals from D15

- No fixed source-item or gift-count limit as capacity truth.
- No unlimited best-effort direct-delivery queue.
- No tenant capacity DSL, quota dashboard, scheduler, priority slider,
  concurrency control, batch-size control, or queue bypass.
- No generic cross-provider throttle algorithm or connector framework.
- No exact completion guarantee before current workload and provider evidence
  support one.
- No automatic Posting Profile, mapping, Carrier Plan, destination, accounting
  period, or delivery-lane substitution.
- No per-release grain or recipe override.
- No weakened, sampled, or skipped readback to save provider calls or egress.
- No whole-release retry after partial or ambiguous provider outcomes.
- No artifact download presented as QBO/Xero delivery or reconciliation.
- No provider progress presented as Accounting Release, Bank Match, or
  reconciliation truth.
- No new parallel certificate aggregate, financial state machine, incident
  system, task system, or workflow product.
- No commitment to a workflow vendor before separate runtime adoption.

### Current evidence for D15

The current provider-contract, commercial-tier, comparable-product,
accessibility, workload, failure, test, and full adversarial evidence is
retained in:

- [Phase 20 D15 seasonal capacity and provider-certification research](./phase-20-seasonal-capacity-and-certification-research-evidence.md)
- [QBO API call limits and throttles](https://developer.intuit.com/app/developer/qbo/docs/learn/limits-and-throttles)
- [QBO batch operation](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/batch)
- [QBO request IDs and safe retry](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-field-definitions)
- [Intuit App Partner Program FAQ](https://developer.intuit.com/app/developer/qbo/docs/get-started/partner-faq)
- [Intuit platform requirements](https://developer.intuit.com/app/developer/qbo/docs/go-live/publish-app/platform-requirements)
- [Xero rate limits](https://developer.xero.com/documentation/best-practices/api-call-efficiencies/rate-limits/)
- [Xero idempotent requests](https://developer.xero.com/documentation/guides/idempotent-requests/idempotency/)
- [Xero pricing and policies](https://developer.xero.com/pricing)
- [Xero certification checkpoints](https://developer.xero.com/documentation/xero-app-store/app-partner-guides/certification-checkpoints)
- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)

## D16 — Capability-certified Accounting Delivery Packages

**Founder ruling:** ratified and adversarially hardened on 2026-07-26.

D16 adopts **one immutable, Legal-Entity-, destination-, and
delivery-lane-pinned Capability-Certified Accounting Delivery Package compiled
from the exact frozen Provider Delivery Plan, carrying the current D7/D8
destination certificate and a narrow Asym-owned
provider/region/import-surface conformance record; preserving broad prospective
tenant control through D4-D8; presenting direct ordered files with an optional
download-all bundle; keeping downloaded, provider-staged,
provider-finalized, staff-reported, and independently verified truth separate;
and permitting only proof-gated append-only recovery of known-unimported
work—without arbitrary spreadsheet templates, unsupported recipe
substitution, fabricated bank evidence, silent regeneration,
download-equals-import claims, or re-import-as-retry.**

D16 closes the staff-mediated QBO/Xero delivery boundary. It determines when
Asym may truthfully describe a generated package as ready for one exact current
provider import surface. It does not choose accounting policy, Posting Profile,
grain, mapping, carrier meaning, period, Legal Entity, destination, or delivery
lane, and it does not turn a download into provider or reconciliation truth.

### Separate package authorities

D16 preserves six distinct authorities:

1. **Accounting Release** — D2's frozen balanced accounting intent.
2. **Provider Delivery Plan** — D2's immutable per-release provider-native
   compilation and selected delivery lane.
3. **Destination Capability Certificate** — D7/D8 proof that the exact current
   QBO realm or Xero organization supports the selected carrier plan.
4. **Import Surface Conformance Record** — narrow, product-owned evidence that
   one exact provider, region, subscription capability, importer, current
   template, serializer, limit set, and recovery contract has been proved.
5. **Accounting Delivery Package** — the immutable staff-mediated projection
   and ordered import parts generated from that frozen plan.
6. **Outcome evidence** — separate append-only download, staff testimony,
   provider staging, provider finalization, exact readback, mismatch, and drift
   observations.

None replaces another. In particular:

- destination capability does not prove current import-file conformance;
- import-file conformance does not prove the staff member's current provider
  permission;
- balanced generated bytes do not prove provider import;
- provider draft creation does not prove provider finalization;
- staff testimony does not overwrite provider readback;
- provider acceptance does not prove effect equivalence or bank
  reconciliation; and
- later provider drift does not rewrite the original package or outcome
  evidence.

### Tenant control and provider-owned mechanics

Tenant control remains broad but prospective through the authorities already
ratified in D3-D8 and D11:

- Legal Entity and exact accounting destination;
- default delivery lane and the permitted explicit pre-freeze choice;
- source-purpose provider-native recipe;
- detail, fund-detail, or approved summary grain;
- grouping and proof-gated summarization;
- Designation-to-Accounting-Reporting-Target resolution;
- QBO accounts, Classes, Locations, Products and Services, Customers, Projects,
  or other certified carrier bindings;
- Xero accounts, Tracking Categories and Options, Contacts, Items, Projects, or
  other certified carrier bindings;
- tenant-policy-permitted accounting period;
- bounded, PII-safe provider-reference pattern;
- approved description detail;
- staff instruction locale;
- concise or detailed human-readable reports; and
- direct part downloads or an optional download-all bundle.

Asym owns the mechanics that must remain exact for the selected provider import
surface:

- provider-required fields, column names, order, types, and grouping;
- delimiter, quoting, encoding, line endings, date, decimal, and sign syntax;
- balance, source coverage, mapping coverage, and control totals;
- provider row, transaction, logical-record, and file limits;
- complete-operation partitioning and required import order;
- deterministic filenames, stable release and part references, manifests, and
  hashes;
- PII exclusion and formula-injection defenses;
- duplicate, partial-success, unknown-outcome, and recovery semantics; and
- the distinction between staff-reported, provider-staged,
  provider-finalized, and independently verified results.

There is no per-package spreadsheet designer or release-time mapping editor.
**Change future packages** navigates to the authority that owns the prospective
choice. A frozen package never changes accounting meaning, destination, period,
or lane.

If the selected Posting Profile cannot be represented losslessly through a
certified current staff-import surface, Asym must block release admission and
offer only the truthful owning choices:

- use a compatible certified direct-delivery plan;
- prospectively select a compatible Posting Profile or carrier plan;
- certify another legitimate provider-native recipe; or
- retain an evidence-only accountant handoff labelled as not ready for provider
  import.

No manual-journal, bank-statement, generic CSV, or other object type may
silently substitute for the selected provider-native recipe.

### Import Surface Conformance Record

The Import Surface Conformance Record is a narrow evidence record, not a tenant
configuration DSL, a second capability platform, or another financial state
machine. It pins:

- provider and environment;
- country or region and applicable locale;
- subscription or capability tier;
- importer name, navigation surface, object type, and expected provider state;
- current sample or template fingerprint and provider-documentation version;
- required role and enabled provider settings;
- required, optional, and prohibited fields;
- date, number, decimal, sign, quoting, encoding, and line-ending rules;
- transaction, row, file-size, and logical-record limits;
- list-reference, inactive-reference, and parent-path behavior;
- duplicate, partial-success, undo, error, and recovery behavior;
- compiler and serializer versions;
- production-shaped fixture evidence;
- verification time, expiry, and quarantine reason; and
- exact constraints for any append-only recovery package.

It is distinct from D15's Certified Execution Envelope. D15 proves structural
capacity for direct API work; D16 proves conformance of staff-import files.

A package may say **Ready to import** only when:

1. the D7/D8 destination Capability Certificate is current;
2. the exact Import Surface Conformance Record is current and unquarantined;
3. generated bytes and digests match the frozen Provider Delivery Plan;
4. source, mapping, balance, provider-shape, privacy, and limit checks pass; and
5. no D13 cause-authoritative blocker remains.

Staff-mediated delivery means Asym does not write this release to QBO or Xero.
It does not mean Asym may guess current accounts, dimensions, currency, tax,
plan, importer, reference behavior, or lock state. A provider connection may
support destination discovery and exact readback while the application
enforces the no-write lane locally.

Without current destination and import-surface evidence, Asym may retain the
Accounting Evidence Artifact and clearly labelled provider-formatted preview,
but it must not cross the release fence or claim readiness.

### Package composition

One logical package does not require one ZIP:

- one required import file downloads directly from the primary action;
- multiple required files appear as numbered, ordered direct downloads;
- **Download all (.zip)** is an optional convenience;
- destination, control totals, instructions, and outcome capture remain in the
  accessible application page rather than a hidden README; and
- technical manifests, compiler versions, hashes, and raw evidence remain
  available under **Technical evidence**.

Every immutable package part records:

- deterministic human-readable filename;
- stable short release and part reference;
- provider object or record family;
- expected transaction and row counts;
- debit and credit control totals;
- source-coverage digest;
- byte digest;
- required import order;
- expected provider state after import; and
- provider-specific next action.

Parts split only at complete, independently valid provider-operation
boundaries. One journal, bill, receipt, deposit, or other provider operation is
never cut apart merely to meet a row limit. If no certified complete-operation
partition exists, release admission fails before any package is published.

Package publication is atomic. Re-download returns the exact original bytes.
A compiler, template, or provider change never silently regenerates historical
content.

### Staff experience

The routine workspace is one page with three steps:

1. **Review what will land in QuickBooks or Xero**
   - show the exact Legal Entity and provider organization;
   - period, currency, total, and short release reference;
   - provider object type and expected draft or final state;
   - account, dimension, tax, and control totals;
   - exact and summarized Designation coverage;
   - file count and import order; and
   - only the current blocker or material warning.
2. **Download the ordered import file or files**
   - one dominant direct-download action;
   - byte-identical re-download;
   - current provider-specific instructions;
   - optional printable instructions and download-all bundle; and
   - persistent plain-language notice that download is not import and re-import
     is not retry.
3. **Record what happened**
   - everything imported;
   - imported as drafts, where applicable;
   - imported and finalized;
   - some items imported;
   - nothing imported; or
   - uncertain.

Only provider-relevant outcomes appear. Xero draft and posted states remain
distinct. QBO copy describes the actual importer result rather than using a
generic `posted` label.

The UI derives readable package-ready, downloaded, staff-reported,
provider-staged, provider-finalized, partial, unknown, independently verified,
verification-mismatch, and later-drift states from separate append-only
evidence. It never persists one overloaded `exported`, `imported`, `synced`, or
`reconciled` boolean.

Advanced mappings and technical evidence use progressive disclosure. The
primary path remains usable without understanding manifests, hashes, compiler
versions, or raw provider errors.

All actions use semantic controls, programmatic labels and errors, coherent
reading and focus order, non-color status meaning, polite material-change
announcements, keyboard completion, narrow-width reflow, zoom support, and
screen-reader-verifiable instructions. Mobile staff can review and download
even when provider import is more practical on desktop.

### Partial, unknown, and changed-provider recovery

Ordinary browser-mediated QBO/Xero import has no Asym-controlled durable
idempotency key. Therefore **re-import is never retry**.

A partial or uncertain result:

- preserves successful or credibly proved provider work;
- records the exact package part, provider operation, or transaction family;
- opens or updates the D13 cause-owned Accounting Exception Case;
- requires provider inspection or credible staff evidence before another
  write;
- permits a recovery package only for exact work proved not to have been
  imported;
- retains lineage to the original package and Accounting Release; and
- uses D11 Compensating Accounting Releases for finalized errors or
  corrections.

There is no generic **Undo import**. Provider drafts may be removed only under
the provider's own rules. Finalized records use provider-native correction plus
D11's append-only accounting semantics.

If an import template or capability changes after package publication, the
original bytes and evidence remain immutable. A replacement package requires
D2 proof-gated recovery, proof that duplicate posting cannot occur, a new
conformance record and digest, and preserved lineage to the original.

### Security and privacy

- Machine-import cells contain typed, allow-listed facts and system-generated
  PII-safe labels.
- Arbitrary donor, missionary, care, staff, memo, or user-entered narrative
  cannot enter machine import files.
- Provider references cannot begin with spreadsheet formula-control
  characters.
- Provider-certified escaping must not change accounting meaning.
- Machine import files and human-readable spreadsheet reports use separate
  safety contracts.
- A modified file is no longer represented as Asym-certified.
- Packages use private storage, server-side authorization on every request,
  short-lived download grants, and exact byte digests.
- Permissions and storage keys are Tenant-, Legal-Entity-, destination-, and
  purpose-scoped.
- Logs and metrics exclude secrets, unrestricted provider data, raw files, and
  donor PII.
- Optional provider-error or screenshot evidence is allow-listed,
  size-limited, scanned, privately stored, and authorized.

### D16 production gates

No provider/import-surface recipe is production-ready until:

- golden byte fixtures pass for every supported provider, country or region,
  importer, object type, schema, and locale;
- exact headers, order, quoting, encoding, line endings, dates, decimals,
  signs, continuation rules, filenames, and digests are deterministic;
- zero, one, typical, maximum, maximum-plus-one, and oversized-logical-operation
  boundaries pass;
- source and mapping coverage, debit/credit balance, and control totals by
  account, dimension, tax, currency, file, and provider operation pass;
- Unicode, commas, quotes, newlines, formula-leading characters, long provider
  references, and privacy fixtures pass;
- the exact generated bytes import successfully through the supported current
  QBO or Xero interface in controlled destinations;
- resulting objects, drafts, accounts, dimensions, taxes, currencies, dates,
  references, rounding, and final Accounting Effect are verified;
- current roles, subscription capabilities, settings, close dates, inactive
  references, regional differences, and plan downgrade pass;
- duplicate attempt, edited file, wrong destination, partial success, unknown
  outcome, and recovery of only known-unimported work pass;
- routine recipes prove they never fall back to journals, bank statements, or
  other semantically different provider objects;
- tenant, Legal Entity, destination, environment, cache, storage, and download
  negative-isolation tests pass;
- formula injection, PII, expired-link, revoked-role, tampered-file, malicious
  evidence-upload, and redacted-log tests pass;
- production-shaped many-fund, large-source, maximum-part, concurrent-tenant,
  restart, and storage-failure tests pass;
- keyboard, screen-reader, focus, status, error-summary, contrast, zoom,
  reflow, touch, and reduced-motion verification passes;
- representative bookkeepers can identify the destination and expected result,
  import ordered parts, distinguish draft from final and reported from
  verified, record a partial result, and avoid unsafe re-import without
  assistance; and
- named provider-contract, certification, security, support, and incident
  owners maintain drift canaries, expiry, quarantine switches, and rehearsed
  duplicate, partial-import, wrong-destination, and template-change runbooks.

### Explicit non-goals from D16

- No arbitrary tenant-authored import template, formula system, or column DSL.
- No second policy, Posting Profile, mapping, carrier, destination, period, or
  delivery-lane authority.
- No release-time accounting customization.
- No generic ETL, connector marketplace, file workflow engine, or shadow GL.
- No universal QBO CSV or Xero CSV claim.
- No unsupported provider object or manual-journal fallback.
- No generated bank statement or other fabricated bank evidence.
- No QBO Desktop, IIF, or migration-toolbox lane.
- No release-time account, contact, item, class, location, tracking, tax, or
  provider-object auto-creation.
- No mandatory ZIP for one or several files.
- No download treated as import, provider acceptance, effect verification, or
  reconciliation.
- No blind re-import after failure, partial success, timeout, or uncertainty.
- No silent regeneration or mutation of historical package bytes.
- No recovery package containing work not proved unimported.
- No claim that Asym owns provider period close or final bank reconciliation.

### Current evidence for D16

The current provider-import, comparable-product, security, accessibility,
failure, scale, UX, and full adversarial evidence is retained in:

- [Phase 20 D16 Accounting Delivery Package research](./phase-20-accounting-delivery-packages-research-evidence.md)
- [QBO common import guidance](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/common-questions-importing-data-quickbooks-online/L4OYJRFdj_US_en_US)
- [QBO journal-entry import](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)
- [QBO Spreadsheet Sync](https://quickbooks.intuit.com/learn-support/en-us/help-article/accounting-bookkeeping/spreadsheet-sync-faq/L3FiuAq13_US_en_US)
- [Xero import guidance](https://central.xero.com/s/article/Import-data-in-to-Xero)
- [Xero manual journals](https://central.xero.com/s/article/Add-import-and-post-manual-journals-UK)
- [Xero bills and credit notes](https://central.xero.com/s/article/Import-bills-and-credit-notes)
- [Xero Manual Journals API](https://developer.xero.com/documentation/api/accounting/manualjournals/)
- [Ramp custom accounting CSV](https://support.ramp.com/custom-accounting-csv-exports)
- [OWASP CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection)
- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)

## D17 — Source-family-specific Posting Ownership Cutover

**Founder ruling:** ratified and adversarially hardened on 2026-07-26.

D17 adopts **one immutable, source-family-specific Posting Ownership Cutover
that defaults to the next complete drained boundary; records exact half-open
ownership intervals and a source-complete Cutover Coverage Manifest; uses
capability-labelled read-only provider inspection and exact provider identity
where available; permits optional gap-only backfill solely for
proved-unposted work; preserves previous-owner posting evidence without
rewriting it as Asym delivery; assigns late events and corrections
deterministically; and activates through one quiet review-first
timeline—without dual-write, date-only ownership, fuzzy adoption,
universal-history claims, mutable cutoffs, or whole-backlog replay.**

D17 operationalizes D5's single-posting-owner invariant across every source
family that may reach Phase 20. It governs transition from another connector,
an expense or card platform, a bank-rule workflow, or manual bookkeeping into
Asym posting. It does not make Phase 20 the source owner for contributions,
settlements, Deposit Groups, expenses, reimbursements, payments, or
field-account effects.

### Generalized single-posting-owner invariant

Exactly one posting owner may create the accounting representation of one
canonical source occurrence for one:

- Tenant;
- Legal Entity;
- Accounting Destination and environment;
- source system and source account, processor account, instrument, or other
  binding where applicable;
- source family and Accounting Posting Intent family;
- currency where the source contract requires it; and
- source-authoritative ownership interval.

A provider label or source-family name does not prove disjointness. Two posting
routes may coexist only when their source contracts prove that their canonical
source occurrences and Accounting Effect coverage do not overlap.

Examples:

- Asym may own Stripe settlement posting while an expense platform owns card
  expenses.
- A QBO or Xero bank feed may remain match-only while Asym creates the
  accounting transaction.
- Auto-add, categorize, bank-rule creation, or another connector-created record
  is a competing posting route.
- An approved unpaid reimbursement payable and its later payment are separate
  source occurrences.
- A card purchase and the later card-liability payment are separate source
  occurrences.
- A manual bookkeeper process is a posting owner even when no competing
  provider connection is visible to Asym.

Unknown or overlapping ownership fails closed for only the affected source
family, account, occurrence, or provider operation. It does not disable
unrelated settlements, Deposit Groups, approved expenses, evidence artifacts,
or accounting destinations.

### Posting Ownership Cutover

One proposed cutover binds:

- previous posting owner;
- next posting owner;
- exact scope listed above;
- source-family boundary discriminator;
- proposed effective interval `[effective_from, effective_to)`;
- first complete Asym-owned source occurrence;
- last previous-owner source occurrence;
- in-flight and queued-work disposition;
- previous-workflow disable or non-overlap evidence;
- bounded provider-inspection capability and result;
- governing source and provider contract versions; and
- activation, supersession, and audit evidence.

The half-open notation is an invariant, not ordinary staff copy. The user
experience presents the last previous-workflow occurrence and first Asym-owned
occurrence in provider and source language.

A generic timestamp cannot split one natural atomic source occurrence:

- one processor payout or other frozen settlement unit stays whole;
- one frozen Deposit Group stays whole;
- one approved organization-paid expense stays whole;
- one approved payable stays whole;
- one authoritative reimbursement payment stays whole; and
- another source family uses the atomicity and eligibility key owned by its
  source contract.

Source-effective, provider-transaction, accounting-effective,
ownership-acquisition, and observation times remain independent. A Dec. 31
gift contained in a Jan. 2 payout does not cause the payout to cross posting
owners.

### Cutover Coverage Manifest

The manifest is source-complete only for one frozen, explicitly bounded review
population. It references D4 source identities and evidence digests rather
than copying source financial truth.

Every occurrence in that population receives exactly one non-overlapping
disposition:

- covered by the previous posting owner;
- linked to exact previous-owner provider evidence;
- proved unposted and eligible for optional gap-only backfill;
- assigned prospectively to Asym;
- intentionally excluded with a reason; or
- ambiguous and quarantined.

Evidence strength is explicit:

- **Exact** — stable provider identity and effect-equivalent source linkage.
- **Bounded** — a documented provider inspection with known entity, date,
  pagination, role, history, or plan limits.
- **Staff-confirmed** — authorized testimony with actor, time, scope, and
  reason.
- **Unavailable** — provider or previous-workflow evidence cannot establish the
  result.

The product may say **No known overlap found in the inspected scope**. It may
not say **No duplicates are possible**.

The manifest is neither a second source ledger nor another lifecycle or
reconciliation system. Clean forward-only coverage appears as aggregate counts,
amounts, currencies, and boundaries. Only ambiguity and optional historical
work expand to occurrence-level review.

### Capability-labelled provider inspection

Read-only QBO/Xero inspection describes only what its exact capability can
prove:

- exact record readback when a provider record ID is known;
- bounded entity-specific inventory where supported;
- current provider query, history, role, subscription, and pagination limits;
- current import-package and direct-delivery evidence; and
- unavailable or incomplete scope where the provider cannot supply sufficient
  proof.

Provider inspection never becomes a universal history scan. Empty QBO queries,
bounded Change Data Capture, Xero endpoint limitations, a duplicate-number
preference, a narration, date, amount, memo, or short-lived idempotency key do
not prove historical absence.

Historical linkage requires:

- exact provider organization and environment;
- exact provider entity type and record ID;
- credible source or external-correlation evidence; and
- effect equivalence with the source-authoritative accounting facts.

The result remains **Previous-owner posting evidence**. It is never represented
as an Asym Accounting Release, Asym delivery, or Asym provider acceptance.

### Clean forward-only activation

The quiet default is the next complete drained source boundary.

For a technical previous workflow, drained means that:

- the relevant posting route is disabled or proved non-overlapping;
- known queued, in-flight, failed, partial, and outcome-unknown work is
  resolved or bounded;
- the final completed atomic source occurrence is identified; and
- later occurrences remain unposted for Asym.

For a manual previous owner, drained means an authorized finance user identifies
the last completed atomic occurrence and confirms that the manual workflow will
not post later occurrences in Asym's interval. This is Staff-confirmed evidence.
It may authorize a clean prospective start but does not prove historical
absence or authorize automatic backfill by itself.

Asym serializes its local activation with compare-and-set or an equivalent
exclusion constraint so two administrators cannot activate overlapping Asym
cutovers. Activation:

1. revalidates Tenant, Legal Entity, destination, source scope, current
   authorities, and no local ownership overlap;
2. records previous-owner cutoff evidence;
3. performs a final capability-labelled bounded provider inspection;
4. freezes the first Asym-owned complete source occurrence;
5. activates review-first under D12; and
6. starts a bounded post-activation overlap check plus normal provider
   readback.

Asym cannot atomically lock an independent connector or human bookkeeper. A
conflicting later external write quarantines affected unreleased work and opens
or updates the D13 cause-owned case. Accepted provider work is preserved and is
never blindly resent. Re-enabling a previous connector never silently changes
the ownership interval.

Before the first Accounting Release freezes, authorized staff may cancel or
supersede a proposed cutover. After that fence, the boundary cannot move
backward. A later owner change creates a prospective successor; accounting
corrections use D11.

### Optional historical evidence and gap-only backfill

Historical inspection, linkage, and backfill are separate optional actions
under **Need earlier history?** They are off by default and never delay a clean
prospective cutover when earlier ambiguity does not overlap the new interval.

**Proved unposted** requires:

- positive previous-workflow unsynced, unexported, or equivalent evidence; or
- capability-complete inspection of every certified provider carrier type in
  the frozen review population;
- authorized-finance confirmation; and
- no contradictory provider, package, source, manual-workflow, or accounting
  evidence.

A negative incomplete query, similarity match, missing connector log, or
Staff-confirmed testimony alone is insufficient for automatic backfill.

Gap-only backfill is:

- limited to a closed reviewed population;
- limited to exact work proved unposted;
- pinned to one Legal Entity, destination, environment, source family, and
  currency;
- revalidated against D4-D8, D11-D16, and D13;
- subject to source, mapping, period, destination, provider, package, capacity,
  and ownership gates; and
- released through the same immutable Accounting Release contract as current
  work.

There is no whole-history replay, fuzzy gap fill, opening-balance reconstruction
through detailed Asym transactions, or `probably unposted` shortcut. When proof
is unavailable, Asym may start prospectively while the historical question
routes to accountant-owned D13/D11 resolution.

A locked historical period does not block an otherwise clean prospective
cutover. Historical work rechecks D11 policy and provider acceptance when its
Accounting Release freezes and immediately before delivery. A newly locked
period blocks only that work; it never shifts source-effective or
accounting-effective dates, rolls ownership backward, or redirects the entry
into the current period without D11 authority.

### Late events and correction execution

Original provider records and previous posting owners remain immutable
provenance. Every late refund, dispute, reversal, correction, or payment
receives exactly one current execution owner.

- The source-family contract determines whether the late occurrence follows an
  original source identity or constitutes a new occurrence.
- If the previous workflow remains active for the exact correction scope, it
  may remain execution owner.
- If the previous workflow is retired, Asym may execute only after exact
  previous-record linkage or accountant-owned resolution under D11.
- The old connector is never implicitly reactivated.
- Both old and new systems may never post the same correction.
- Source creation time versus economic date conflicts follow the
  source-authoritative discriminator rather than UI guesswork.

An approved unpaid expense may authorize a payable only. A later source-owned
payment confirmation is required before a BillPayment, Xero Payment, or other
cash-movement operation can be created.

### Delivery-lane and destination interaction

The ownership fence governs both direct and staff-mediated Accounting Releases.

- Package generation or download may support review and evidence but cannot
  bypass posting ownership.
- A partial or outcome-unknown D16 import blocks only affected provider
  operations.
- D16 recovery contains only operations proved not imported and never
  re-imports the whole package.
- Direct API ambiguity retains D2/D15 operation-granular inspection-before-
  retry behavior.

When D14 destination replacement and D17 posting-owner succession are requested
together, D14 first proves, authorizes, and capability-certifies the new exact
destination. D17 then activates prospectively against it. Existing releases and
operations retain the destination and ownership interval that already govern
them.

### Staff experience

The ordinary workspace has four short steps:

1. **Current workflow**
   - auto-populate connections, accounts, source families, and posting routes
     Asym can observe;
   - ask staff only about external or manual workflows Asym cannot see;
   - distinguish match-only bank evidence from create or categorize behavior.
2. **Choose the handoff**
   - recommend the next complete drained boundary;
   - show the last previous-workflow and first Asym-owned occurrence;
   - put custom boundaries under **Advanced**.
3. **Review coverage**
   - show one timeline: **Previous workflow**, **Needs proof**, **Asym begins**;
   - show counts, amounts, currencies, evidence strength, and complete source
     occurrences;
   - collapse clean coverage and show only overlap, ambiguity, optional
     historical evidence, and gap work;
   - state clearly that review sends nothing.
4. **Activate**
   - confirm exact Legal Entity, destination, source families, previous route,
     first Asym-owned occurrence, and any remaining bounded limitation;
   - use one audited action;
   - explain that external overlap remains monitored because Asym cannot lock
     another system.

Optional previous-history linkage and backfill stay under **Need earlier
history?** There is no mandatory platform-wide second approver, although a
tenant may require one through existing governance.

The UI uses semantic controls, explicit labels and errors, coherent reading and
focus order, keyboard completion, responsive reflow, polite status
announcements, and non-color-only evidence strength. D13 and shared Mission
Control own follow-up; D17 creates no second permanent queue.

### D17 production gates

No Posting Ownership Cutover reaches production until:

- source-family contracts define atomic occurrence and ownership
  discriminators;
- uniqueness tests prove no overlapping local ownership intervals or duplicate
  canonical source/Accounting Effect coverage;
- payout, Deposit Group, approved-expense, payable, payment, card-purchase,
  card-liability, refund, dispute, reversal, correction, and late-source
  fixtures pass where their source contract is available;
- technical and manual previous-owner drain scenarios pass;
- concurrent administrator, stale preview, previous-connector re-enable, queued
  external write, and scan-to-activation race tests pass;
- QBO and Xero exact, bounded, incomplete, unavailable, paginated, plan-limited,
  role-limited, and stale-history inspection fixtures pass;
- similarity collisions never auto-link historical records;
- exact previous-owner linkage and effect-equivalence proof pass;
- positive proved-unposted, contradictory evidence, unavailable evidence, and
  gap-only backfill tests pass;
- locked-period and newly locked-period behavior preserves dates and ownership;
- direct and D16 staff-mediated partial, unknown, downloaded-only, and recovery
  cases pass;
- D14 destination replacement and D17 cutover sequencing tests pass;
- cross-tenant, Legal-Entity, destination, environment, source-account,
  currency, interval, cache, evidence, and permission negative tests pass;
- clean forward-only and optional-history paths pass keyboard, screen-reader,
  focus, error-summary, responsive, contrast, and plain-language tests;
- representative finance users can identify the current owner, understand the
  exact boundary, activate a clean cutover, recognize bounded evidence, and
  avoid duplicate backfill without assistance; and
- named finance, provider, support, and incident owners maintain overlap,
  ambiguous-history, old-connector reactivation, locked-period, and historical
  correction runbooks.

### Explicit non-goals from D17

- No calendar-date-only ownership boundary.
- No two posting owners for one canonical source occurrence.
- No assumption that different source-family labels prove disjoint activity.
- No universal QBO/Xero historical-absence scan.
- No fuzzy historical adoption based on amount, date, memo, name, narration, or
  document number.
- No previous-owner record rewritten as Asym delivery.
- No whole-history replay or detailed opening-balance reconstruction.
- No Staff-confirmed testimony alone authorizing automatic historical backfill.
- No mutable or retroactively moving active boundary.
- No external connector represented as atomically locked by Asym.
- No locked-period backfill silently moved to another accounting date.
- No previous workflow implicitly reactivated for late corrections.
- No D16 package generation, download, or partial import bypassing ownership.
- No D14 destination change rewriting existing ownership or releases.
- No second source ledger, accounting ledger, exception queue, task system, or
  workflow product.
- No movement of receipt capture, expense approval, reimbursement, payment, or
  field-account truth from Phase 21 into Phase 20.

### Current evidence for D17

The current repo authority, QBO/Xero, comparable-product, cutover, UX,
failure-mode, and post-adoption adversarial evidence is retained in:

- [Phase 20 D17 Posting Ownership Cutover research](./phase-20-posting-ownership-cutover-research-evidence.md)
- [QBO identity and retry guidance](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-field-definitions)
- [QBO data queries](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/data-queries)
- [QBO Change Data Capture](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/change-data-capture)
- [QBO transaction matching](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/match-transactions-quickbooks-online/L0MF3Fn6y_US_en_US)
- [Xero idempotent requests](https://developer.xero.com/documentation/guides/idempotent-requests/idempotency/)
- [Xero Journals API](https://developer.xero.com/documentation/api/accounting/journals)
- [Xero manual-journal import](https://central.xero.com/s/article/Add-import-and-post-manual-journals-UK)
- [Ramp accounting migration guidance](https://support.ramp.com/migrating-to-an-erp-without-a-direct-ramp-integration)
- [Bloomerang accounting sync](https://help.bloomerang.com/en/articles/12632509-bloomerang-crm-to-quickbooks-online-sync-transactions)
- [Bloomerang overlap warning](https://help.bloomerang.com/en/articles/13382604-quickbooks-online-integration-with-bloomerang-fundraising)

## D18 — Accounting-ready expense handoff

**Founder ruling:** ratified and adversarially hardened on 2026-07-26.

D18 adopts **one immutable, source-owned Approved Expense Snapshot exposed to
Phase 20 only through a PII-minimized, Tenant-, Legal-Entity-, source-version-,
and posting-owner-pinned Accounting-Ready Expense Handoff; a closed launch
catalog of Cleared Organization-Paid Expense, Approved Reimbursement
Obligation, evidence-qualified Reimbursement Payment, and cause-linked Expense
Accounting Correction occurrences; exact Reimbursement Payment Coverage for
partial, grouped, one-to-many, and many-to-one settlement; separately
certified employee-repayment, advance, per-diem, and mileage source contracts;
and independently authoritative expense-workflow, field-account, payment,
Accounting Release, provider-delivery, Bank Match, and final QBO/Xero truth
behind one quiet report-first experience—without report-as-transaction
collapse, a Phase 20 AP ledger, card-liability settlement, payment execution,
payroll or tax adjudication, raw-receipt duplication,
approval-implies-payment, aggregate `Paid` authority, provider identifiers
upstream, warning-only duplicate re-export, or a second expense, accounting,
card, or reconciliation system.**

D18 completes the D1 Phase 20/21 accounting-doorway boundary and makes D17's
expense, reimbursement-obligation, payment, and correction source families
precise. Phase 21 remains the expense-operations product. Phase 20 validates
frozen accounting-ready facts, compiles them through D4–D8 into immutable
Accounting Releases, and uses D11–D17 for correction, readiness, exception
ownership, destination, capacity, delivery, and posting ownership.

### One report experience over exact source-owned Approved Expense Snapshot coverage

The Expense Report is the ordinary human workspace and grouping object. It is
not the accounting, obligation, payment, or provider-operation unit.

Phase 21 owns the complete immutable Approved Expense Snapshot:

- source report, lines, itemizations, and source version;
- Tenant, Legal Entity, claimant, payee, merchant, economic payer, and
  relationship references;
- claimed, approved, held, rejected, excluded, and superseded coverage;
- organization-paid, corporate-card, personal-liability-card, out-of-pocket,
  advance, or other certified funding truth per line or split;
- source dates, original and approved currencies and amounts, tax and
  exchange-rate evidence;
- Designation, project, missionary, field-account, and source-owned natural-
  and functional-expense classifications;
- policy version, approval chain, actor, time, override reason, and
  substantiation evidence;
- receipt and missing-receipt evidence under Phase 21 privacy and retention
  governance; and
- exact correction, succession, and approved expense line-disposition
  coverage.

Every source line or split receives exactly one disposition. A report-level
`reimbursable`, `paid`, `approved`, or funding flag cannot override line-level
truth.

A later approval of a held line, a corrected allocation, a payment return, or
another new source fact creates a successor snapshot, supplement, or
cause-linked correction. It never mutates coverage already accepted into an
Accounting Release.

### PII-minimized Accounting-Ready Expense Handoff

Phase 20 receives a frozen projection, not a copy of Phase 21. The common
handoff envelope binds:

- immutable handoff ID, version, digest, source contract, and posting owner;
- exact Tenant, Legal Entity, source system, environment, and report
  references;
- exact occurrence identities and, when snapshot-rooted, included approved
  line and split identities, allocations, currencies, amounts, and control
  totals;
- stable claimant, payee, merchant, and economic-payer role references rather
  than copied profiles;
- source-effective, approval, obligation, payment, discovery, and correction
  dates as separate source facts;
- source-supplied tax and exchange-rate facts without Phase 20 inference;
- complete approved expense line-disposition coverage and succession lineage
  sufficient to prove that no eligible coverage disappeared or duplicated;
  and
- purpose-scoped evidence digests and authorized deep links.

The source-authority reference is a discriminated contract, not one nullable
blob:

- Cleared Organization-Paid Expense, Approved Reimbursement Obligation, and a
  snapshot-rooted Expense Accounting Correction carry exactly one Approved
  Expense Snapshot ID, version, and digest.
- Evidence-qualified Reimbursement Payment carries one payment-source ID,
  version, and digest plus the complete covered-obligation and originating-
  snapshot reference set.
- Phase 21 D16 sources carry exactly one versioned discriminator:
  `phase21_d16.expense_advance_issuance@1`,
  `phase21_d16.expense_advance_application_effect@1`,
  `phase21_d16.cash_claimant_return@1`,
  `phase21_d16.expense_advance_return@1`, or
  `phase21_d16.cause_linked_correction@1`. Each carries the exact source root
  and predecessor coverage required by its independently certified source-
  family contract. The two return discriminators require Phase 21's immutable,
  explicit return-family fact; Phase 20 never derives one from amount sign,
  predecessor type, requirement, memo, account, or posting recipe. A cash-
  claimant-return source preserves its exact Claimant Repayment Occurrence and
  complete Claimant Repayment Coverage plus typed residual. An expense-advance-
  return source additionally preserves the exact Expense Advance Issuance
  Occurrence root and exact unused-advance coverage being returned. The correction
  discriminator names the exact admitted predecessor discriminator, source
  identity/version, and corrected coverage; it cannot retag one return family
  as the other. These values are unrelated to Phase 20 D16 Accounting Delivery
  Packages.

A grouped payment never requires or invents an arbitrary primary snapshot.

Included approved coverage crosses through exact stable identities. Held,
rejected, excluded, and superseded coverage crosses only through the minimum
category counts, control totals, and digests needed to prove completeness,
unless an authorized repair follows the purpose-scoped link back to Phase 21.

Raw receipts, bank credentials, policy deliberations, unrestricted free text,
worker profiles, personal-card feeds, and unrelated worker or missionary data
do not cross by default. A destination attachment requires its own
purpose-specific policy and is never implicit in the accounting handoff.

Acceptance is immutable and idempotent for one exact source/version identity.
A stale, superseded, cross-tenant, wrong-entity, wrong-currency,
wrong-posting-owner, incomplete, coverage-conservation-mismatched,
control-total-mismatched, or digest-mismatched handoff fails closed for only
the affected occurrence coverage. Debit/credit balance is tested only after D4
derives the Canonical Accounting Effect.

### Closed launch occurrence catalog

The launch catalog contains four source-owned business occurrences. They are
not journal lines, provider objects, mutable account balances, or tenant-
authored event types.

#### Cleared Organization-Paid Expense

The source proves that the organization bears the purchase through an
organization-owned cash, bank, debit, or card instrument and that the funding
transaction reached the finality required by its certified source contract.

- A pending card authorization is not a cleared expense.
- A personal-liability card is out-of-pocket funding, not an
  organization-card expense.
- For a corporate card, this occurrence proves the purchase or liability
  effect only; it never proves payment or settlement of the card liability.
- A later card refund, chargeback, personal-use repayment, or correction is a
  new source occurrence.
- The expense occurrence does not prove or authorize payment of the later
  card statement.

#### Approved Reimbursement Obligation

The source proves an exact approved amount genuinely owed to one eligible
payee. It establishes the economic obligation without claiming that money
moved.

Phase 20 does not own a mutable payable balance, due-date workflow, aging
report, payment schedule, or vendor ledger. QBO/Xero representation remains a
D4–D8 projection, and Phase 21 remains authoritative for reimbursement
operations and the user-facing amount owed.

#### Evidence-qualified Reimbursement Payment

The source proves the accounting-relevant payment fact and preserves one
explicit evidence grade:

- source-processor confirmed;
- bank or payment-provider observed;
- accounting-provider observed;
- authorized staff-attested external payment; or
- another separately certified source contract.

Scheduled, queued, initiated, withdrawing, estimated-arrival, exported, or
provider-delivered states do not silently become confirmed payment. A
staff-attested payment remains plainly labelled:

> Recorded paid by {actor} on {date}. Not independently verified by Asym.

The tenant may configure bounded evidence requirements for staff-recorded
external payments. The simple path asks only for date, amount, method,
reference when available, and explicit attestation. This flexibility never
lets Phase 20 infer payment or represent staff testimony as processor, bank,
or provider proof.

#### Expense Accounting Correction

The source proves a cancellation, reduction, reallocation, payee change,
payment failure or return, reversal, or another superseding fact and names the
affected predecessor occurrence and cause.

Phase 20 compiles the correction through D11 into an append-only Compensating
Accounting Release when accounting work is required. It never edits a prior
source occurrence, snapshot, Accounting Release, provider record, or historical
evidence.

### Reimbursement Payment Coverage

One immutable payment may cover one or many reimbursement obligations, and one
obligation may receive one or many partial payments. The payment therefore
preserves exact coverage rather than a report-level `paid` boolean.

The payment is a separate source occurrence governed by D17 posting ownership.
Each expense or obligation occurrence references exactly one Approved Expense
Snapshot lineage. A grouped payment instead references every exact covered
obligation identity and its originating snapshot version; it never selects,
mutates, or absorbs into one arbitrary report snapshot.

Each reimbursement coverage slice binds:

- one stable source payment identity;
- exact Tenant, Legal Entity, payee, disbursement currency, posting owner,
  payment method, funding reference, and source dates;
- processor, bank, accounting-provider, or staff-attestation evidence grade;
- every covered reimbursement-obligation identity;
- exact amount applied to each obligation;
- source batch or payout identity;
- exact derived obligation-side short-paid or fully paid coverage results;
- the exact signed payment-side unapplied or overpayment residual at the time
  of the payment occurrence; and
- a digest and control total.

For a reimbursement-only payment, Reimbursement Payment Coverage plus exact
signed payment-side residual dispositions equals the complete source payment.
For one atomic payment that covers both compensation and reimbursement, one
typed payment manifest—not the reimbursement slice alone—uses the External
Payment Occurrence's one payment currency and conserves the source amount
through exact Compensation Payment Coverage, Reimbursement Payment Coverage,
and one signed, typed, explicitly resolved residual disposition, including
zero. A covered source component in another currency carries immutable
source/payment amounts and exact conversion evidence; unresolved residual or
FX ambiguity fails closed.

Each Reimbursement Payment occurrence is homogeneous for one Tenant, Legal
Entity, payee, disbursement currency, and posting owner. A payout or bank debit
spanning several payees is only a grouping envelope around separate atomic
payment occurrences under one stable source-batch identity; it never collapses
those disbursements into one cross-payee payment authority. Coverage cannot
overlap, silently change, or exceed the obligation's remaining approved amount.
Excess cash remains a payment-side unapplied or overpayment residual; it never
inflates approved payable coverage. Recovery uses a separately certified
Claimant Repayment Occurrence or cause-linked correction occurrence. A
correction may reverse or reassign prior coverage but cannot implicitly
increase the approved obligation.

The original payment occurrence freezes its applications and then-current
residual. A later return, dispute, or correction is a new immutable signed
occurrence referencing the original payment and exact affected applications.
Current coverage is derived across that append-only occurrence chain. A
derived **Fully paid** state is valid only when exact current covered amount
equals the exact approved obligation. Some-or-all payment confirmation is
never full-payment authority.

One source payment may compile into several provider operations only under its
one D17 posting owner. Partial QBO or Xero acceptance remains a D2/D13 delivery
exception. It does not change the source payment, mark every provider operation
delivered, or authorize blind retry of the fan-out. When payroll/AP already
owns accounting for a mixed payment, the D18 expense lane may project its exact
reimbursement slice and evidence for linkage and status but cannot create a
standalone reimbursement-payment Accounting Release. An Asym-owned mixed
payment remains dark until one complete compensation source contract,
accountant-confirmed semantics, and exact D17 owner are certified.

### D16 advance and claimant-repayment source-family activation

Phase 21 D16 now supplies complete, policy-versioned, professionally reviewed
source contracts for these additional accounting-ready families:

- evidence-qualified Expense Advance Issuance Occurrence;
- separately certified Expense Advance Application typed accounting effect
  where applicable;
- source-qualified Claimant Repayment Occurrence explicitly typed as a cash
  claimant return;
- source-qualified Claimant Repayment Occurrence explicitly typed as an expense
  advance return; and
- cause-linked corrections for those admitted source families.

The exact source discriminator keeps a cash claimant return and an expense
advance return as distinct typed occurrences. The family is source-owned and
cannot be inferred from sign, predecessor, requirement, memo, account, or
posting recipe. Neither is a negative new expense, a mutable
claimant balance, an offset against a later reimbursement or compensation
amount, or evidence that another source family was paid or settled.

Expense Advance Policy Version, Claimant Repayment Policy Version, Expense
Advance Authorization Version, Expense Settlement Determination,
Repayment Subject Determination, Claimant Repayment Decision, uncertified
Claimant Repayment Requirement, Advance Residual Position, tasks, raw evidence
observations, disputes, Repayment Restitution Review, and Field Account Funding
Coverage remain accounting-dark. A Claimant Repayment Requirement may support
receivable recognition only when a separate accountant-certified policy and
source contract recognizes that exact receivable; it never proves returned
cash. Each admitted family independently resolves its D17 posting owner.

Approved Per Diem and Approved Mileage remain unavailable until Phase 21 or
another source owner supplies their complete, policy-versioned,
professionally reviewed, and tested contracts. When activated, they arrive
already calculated under a versioned source policy. Phase 20 neither
calculates rates nor determines worker classification, business purpose,
taxability, wage treatment, or accountable-plan compliance.

Card-liability settlement is not an expense-report occurrence family. Any
future support requires a separately certified card, bank, or processor source
that owns statement and settlement facts. Receipt approval, transaction
matching, statement close, or scheduled autopay can never authorize it.

### Independent authorities

The product preserves these independently authoritative facts:

1. **Expense workflow truth** — Phase 21 report lifecycle.
2. **Approval truth** — exact source-approved coverage and policy evidence.
3. **Field-account truth** — Phase 21 worker-support-account effects.
4. **Reimbursement-obligation truth** — exact source-recognized amount owed,
   not a Phase 20 AP ledger.
5. **Payment truth** — attempt, processing, partial, externally recorded,
   confirmed, failed, returned, or corrected evidence.
6. **Accounting readiness and release truth** — D12 candidate and immutable
   Accounting Release.
7. **Provider delivery truth** — QBO/Xero operation, acceptance, readback,
   mismatch, or drift.
8. **Bank evidence truth** — D10 Expected Bank Arrival and Bank Match for the
   inbound payout and offline-deposit families D10 already governs.
9. **Final reconciliation truth** — QBO or Xero.

The UI may derive a readable summary, but storage, APIs, retries, and audit
cannot collapse these authorities into one mutable `approved`, `paid`,
`exported`, `synced`, or `reconciled` status.

### Accounting projection and provider behavior

D18 source occurrences authorize no editable debit or credit rows. D4's
accountant-confirmed Semantic Accounting Policy determines accounting meaning,
and D5–D8 compile the balanced effect into the selected capability-certified
QBO or Xero representation.

The handoff does not assert an accounting-effective date, functional or
accounting currency, or Canonical Accounting Effect. D4 and D11 derive those
accounting facts from the immutable source occurrence and the applicable
policy. D4's formal Source Coverage Manifest is derived separately from the
handoff and must reconcile exactly to the handoff's approved expense
line-disposition coverage.

- A genuine unpaid obligation may compile to a QBO Bill or Xero `ACCPAY`
  invoice under the frozen provider plan.
- A later evidence-qualified payment may compile to a BillPayment, Xero
  Payment, or another certified representation.
- An organization-paid occurrence may compile to a provider-native paid-
  expense representation only when source funding evidence is sufficient.
- Provider object type, account, contact, tax code, tracking dimension,
  currency behavior, and provider ID remain downstream delivery facts.
- Provider delivery cannot create a missing counterparty or dimension
  silently.
- Repeated delivery cannot use a warning-only force-export path.
- An unknown provider outcome is inspected before retry.
- A provider-locked period never causes silent source-date movement.
- QBO/Xero remains authoritative for AP, period close, bank reconciliation,
  account balances, financial statements, and books.

D18 does not extend D10 Bank Match to outbound reimbursement disbursements.
Any future outbound bank-evidence contract requires a separate founder
decision.

### Report-first staff experience

The architecture is strict while the user experience remains simple.

Missionaries and claimants see:

- one report;
- one current next action;
- plain summaries such as **$186 owed to you** and **$420 paid by the
  organization**;
- payment wording such as **Scheduled**, **Processing**, **Partially paid**,
  **Recorded paid by staff**, **Provider confirmed**, **Failed**, or
  **Returned**; and
- no QBO/Xero, debit/credit, provider-operation, or posting terminology.

Approvers see:

- one task inbox;
- report-level review with line-level holds, allocations, and funding truth;
- one contextual primary action;
- a consequence summary naming approved, held, organization-paid, and owed
  amounts before confirmation; and
- no repeated approval when later payment scheduling or accounting delivery
  fails.

When tenant policy permits, **Approve and schedule reimbursement** may be one
short UI action, but approval and scheduling produce separately recorded
outcomes and separately recoverable failures.

Finance sees one report-first disclosure with three compact summaries:

1. **Review**
2. **Reimbursement**
3. **Accounting**

Actual payment batches expand to exact covered reimbursements. Clean work
advances automatically under D12. Only exceptions require attention, with one
cause, owner, consequence, and next safe action under D13. Provider payloads,
balanced effects, mappings, readback, and technical evidence remain under
progressive Accounting detail. There is no ambiguous **Sync again**.

The experience uses existing design tokens and shared controls, semantic
headings and tables, complete keyboard operation, coherent focus order, linked
error summaries, polite status announcements, non-color-only status,
responsive reflow at narrow widths and 200% zoom, adequate touch targets, and
reduced-motion behavior.

### D18 production gates

D18 does not reach production until:

- source-contract fixtures cover organization-paid, out-of-pocket,
  personal-liability card, corporate card, mixed report, held-line succession,
  partial approval, rejected or excluded coverage, pending, posted, cleared
  and reversed card states, and source correction;
- payment-coverage fixtures cover one-to-one, one-to-many, many-to-one,
  partial, batched, short, overpaid, failed, returned, and staff-attested
  external payment;
- conservation and property tests prove source lines cannot disappear,
  duplicate, overlap, or overapply and that exact currency control totals hold;
- stale source, duplicate delivery, concurrent approval and release,
  overlapping coverage, stale preview, source correction, provider callback,
  and ambiguous-timeout races pass;
- accounting-equivalence tests prove every occurrence compiles through D4–D8
  without provider semantics entering source truth;
- correction and delivery tests prove D11 compensation, D13
  outcome-unknown containment, D16 package recovery, and D17 posting ownership
  without mutation, lane crossover, or replay;
- unsupported, uncertified, or wrong-discriminator D16 advance and claimant-
  repayment sources fail closed; per-diem and mileage remain unsupported until
  separately certified; and card-liability settlement cannot enter through
  this handoff;
- cross-Tenant, Legal-Entity, source, payee, payment, destination, evidence,
  permission, cache, and RLS negative tests pass;
- handoff-denial and separately governed attachment-projection tests prove raw
  receipt, free-text, personal-card, and bank data do not cross by default;
  allowed projections pass malware, size, type, retention, signed-link, event,
  log, and support-access privacy tests;
- production-shaped report, line, allocation, fund, receipt, and payment-
  coverage volumes pass bounded worker, restart, provider-limit, and storage-
  failure tests;
- keyboard, screen-reader, focus, error-summary, announcement, responsive,
  zoom, contrast, touch, and reduced-motion tests pass;
- representative missionaries and approvers complete ordinary work without
  accounting terminology or a second approval ceremony;
- representative finance users distinguish organization-paid, owed,
  scheduled, partial, externally recorded, provider confirmed, released,
  delivered, and reconciled without training; and
- qualified tenant advisers review worker classification, accountable-plan,
  international, missing-receipt, advance, mileage, per-diem, taxable-
  compensation, functional-expense, card-liability, FX, VAT/GST/sales-tax,
  period, and correction policy.

### Explicit non-goals from D18

- No Phase 20 receipt capture, OCR, report construction, approval,
  reimbursement execution, or missionary expense workflow.
- No Phase 20 AP ledger, outstanding-balance authority, aging, due-date
  workflow, payment scheduler, or vendor-master system.
- No report-level `paid`, `reimbursable`, funding, or accounting status as
  source authority.
- No copy of Phase 21 workflow, raw receipts, personal-card feed, bank
  credentials, unrestricted free text, or broad worker PII.
- No payment inferred from approval, receipt, card match, scheduling, export,
  provider acceptance, statement close, or Bank Match.
- No card issuing, card statement, card-liability settlement, ACH, payroll,
  bill-pay, tax, or worker-classification product in Phase 20.
- No QBO/Xero object choice, provider ID, chart of accounts, debit or credit,
  or provider status embedded in source truth.
- No automatic provider contact, vendor, employee, customer, account, tax
  code, tracking option, class, location, item, project, or dimension creation.
- No warning-only duplicate re-export or deletion-first correction.
- No provider write presented as payment, bank arrival, or final
  reconciliation.
- No specialist occurrence without its certified source contract.
- No mutable handoff, snapshot, source occurrence, Accounting Release,
  provider evidence, or historical coverage.
- No second source ledger, expense workflow, accounting ledger, reconciliation
  system, exception queue, or task product.
- No mandatory second accounting approval for clean, already-approved source
  work.

### Phase 21 D1 precision amendment — 2026-07-28

Phase 21 D1 does not reopen D18 or add Phase 20 scope. It resolves an ambiguous
ownership phrase in this historical ruling:

- Phase 21 owns Expense Claims, policy decisions, Approved Expense Snapshots,
  Reimbursement Obligations, Field Account Funding Coverage, Field Account
  effects, and immutable source-owned evidence and coverage for External
  Payment Occurrences.
- The tenant's payroll, accounts-payable, bank, or authorized manual payment
  process owns payment execution and provider-native finality. Neither Phase 21
  nor Phase 20 executes reimbursement merely by approving, funding, handing
  off, exporting, or delivering accounting.
- D18's `funding classification` means the economic payer and source used for
  the original expense. It is not Field Account Funding Coverage. Funding
  Coverage remains a separate Phase 21 authority between an obligation and any
  later external payment evidence.
- Insufficient Field Account Funding Coverage cannot mutate, erase, or relabel
  an already established Reimbursement Obligation.
- The ordinary action remains **Approve**. When a certified external payroll/AP
  handoff exists, a combined control may say **Approve and send to
  {Payroll/AP}**, but approval and handoff are separately recorded. The UI must
  not promise **schedule reimbursement** unless the external system returns an
  authoritative schedule.

All earlier D18 references to Phase 21 `payment execution` or generic
Phase 21-owned `payment` are interpreted under this amendment.

### Phase 21 D4 mixed-payment and compensation-handoff precision amendment — 2026-07-28

Phase 21 D4 preserves one atomic External Payment Occurrence when a tenant's
payroll/AP process combines compensation and reimbursement. This narrows, but
does not expand, D18:

- one complete typed payment manifest uses the External Payment Occurrence's
  one payment currency and conserves exact Compensation Payment Coverage,
  Reimbursement Payment Coverage, and one signed, typed, explicitly resolved
  residual disposition, including zero; a covered source component in another
  currency carries immutable source/payment amounts and exact conversion
  evidence, while unresolved residual or FX ambiguity fails closed;
- Reimbursement Payment Coverage remains exact for its reimbursement slice but
  cannot claim to conserve a mixed payment by itself;
- D17 assigns one posting owner to the entire payment. If external payroll/AP
  owns that posting, D18 may consume the reimbursement slice as evidence but
  cannot emit a standalone reimbursement-payment Accounting Release;
- an Asym-owned mixed-payment release requires a separately certified complete
  compensation source contract, accountant-confirmed semantics, and exact D17
  owner; until then the occurrence is accounting-dark and cause-owned by one
  exception; and
- a Compensation Handoff Package, Compensation Funding Plan Version,
  Compensation Funding Decision, or Field Account Funding Coverage is not an
  Accounting-Ready Expense Handoff and must fail closed on the D18 lane. None
  creates compensation expense, payable, or payment truth.

### Phase 21 D5 support-reallocation precision amendment — 2026-07-30

Phase 21 D5 does not reopen Phase 20, add a D21 decision, or authorize a new
launch recipe in D18. It binds a negative forward seam:

- Phase 21 owns Support Reallocation Policy versions, Cases, exact
  source-purpose coverage, organization Decisions, atomic internal Field
  Account occurrences, Exit Disposition Manifests, Charitable Succession
  Handoffs and Results, and the typed Support Reallocation Accounting
  Occurrence.
- Even a close-covered occurrence remains unsupported and structurally dark in
  this Phase 20 generation. A later separately approved Phase 20 change must
  certify its exact source schema, accountant-confirmed semantics, compatible
  Posting Profile recipe, and D17 posting owner before it can enter accounting.
- A request, policy, Coverage Manifest, reservation, Decision, open-cycle pair,
  Exit Disposition Manifest, Charitable Succession Handoff or Result, provider
  acknowledgment, payment evidence alone, unknown result, or close-covered
  occurrence cannot create an Accounting Posting Intent or Accounting Release
  under this generation and cannot use an exceptional JournalEntry or
  ManualJournal as fallback.
- The future source gate must distinguish a complete two-sided internal
  occurrence admitted by one immutable Support Cycle Close from a matching
  Charitable Succession Result whose qualified Field Account disposition is
  also one complete balanced occurrence—source debit plus typed
  organization-control/disposition counter-entry—admitted together by one
  governed close. The counter-entry is not a recipient Field Account or GL
  truth.
- Phase 20 alone may later interpret a certified qualified occurrence into
  canonical accounting meaning and deliver it through the release, provider
  readback, and drift contract. Phase 21 never writes QBO or Xero Accounting
  directly, and Phase 20 never rewrites Field Account, purpose, lifecycle,
  payment, or charitable-succession truth. A separately certified regional Xero
  Payroll draft-input operation under Phase 21 D7 is not an accounting write.

### Phase 21 D7 compensation-handoff precision amendment — 2026-07-30

Phase 21 D7 does not reopen Phase 20 or authorize another accounting connector:

- Phase 21 owns Compensation Handoff Adapter certification, prospective
  Compensation Draft Delivery Profile Versions, immutable Provider Draft
  Operations, provider readback/confirmation and drift evidence, and per-unit
  operation coverage.
- The artifact-always package selects exactly one executable
  artifact-fulfillment, certified provider-draft/input, or Phase 20 source
  handoff lane. A provider attempt with an unknown outcome cannot fall through
  to accounting or another lane.
- A package, profile, operation, provider acceptance/readback, or payroll/AP
  result alone cannot create a Posting Intent, Accounting Release, or D18
  expense handoff.
- Payroll/AP authorization remains separate from Accounting Destination
  Connection authority. QBO Bills, Xero Accounting invoices/bills, journals,
  and every accounting-native mutation remain Phase 20-only.
- Only a separately certified evidence-qualified compensation occurrence with
  accountant-confirmed semantics and exact D17 posting ownership may later
  enter the one accounting doorway.

### Phase 21 D10 claim-level approval precision amendment — 2026-07-30

Phase 21 D10 does not reopen D18 or change Phase 20 ownership. It makes the
report-first source contract exact:

- the Expense Report is an adaptive human workspace and an immutable submission
  envelope over exact Expense Claim Versions; it is not the approval,
  obligation, payment, or accounting unit;
- one report may yield zero, one, or many Approved Expense Snapshots, each
  rooted in exact claim/item/split approval coverage;
- a later approval of previously unapproved coverage creates one linked,
  non-overlapping supplement or successor; it never rewrites a prior snapshot,
  silently carries approval to changed facts, or repacks coverage already
  accepted by an Accounting Release;
- every snapshot-rooted handoff still references exactly one applicable
  Approved Expense Snapshot lineage, and payment-rooted handoffs retain their
  complete covered-obligation and originating-snapshot reference set;
- report status, raw/private receipt bytes, OCR or matching suggestions, model
  provider/credential/binding metadata, and AI invocation output cannot enter
  an Accounting Posting Intent or Accounting Release; and
- Phase 21 owns claim, evidence meaning, policy disposition, approval, snapshot,
  Reimbursement Obligation, and Field Account Funding Coverage. Phase 20
  continues to receive only the certified PII-minimized Accounting-Ready
  Expense Handoff.

### Current evidence for D18

The current repo authority, IRS, QBO/Xero, Ramp, Expensify, SAP Concur, Brex,
UX, privacy, failure-mode, scale, and full adversarial evidence is retained in:

- [Phase 20 D18 Accounting-Ready Expense Handoff research](./phase-20-accounting-ready-expense-handoff-research-evidence.md)
- [IRS Publication 15](https://www.irs.gov/publications/p15)
- [IRS Publication 463](https://www.irs.gov/publications/p463)
- [QBO bill-payment guidance](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-bookkeeping/pay-bills)
- [QBO linked transactions](https://developer.intuit.com/app/developer/qbo/docs/workflows/manage-linked-transactions)
- [Xero Accounting API](https://developer.xero.com/documentation/api/accounting/overview)
- [Xero Payments](https://developer.xero.com/documentation/api/accounting/payments)
- [Ramp reimbursement accounting](https://support.ramp.com/syncing-reimbursements-to-accounting)
- [Ramp batch reimbursement syncing](https://support.ramp.com/batch-reimbursement-payment-syncing/)
- [Expensify report statuses](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Understanding-Report-Statuses-and-Actions)
- [Expensify reimbursement payment methods](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Reimbursement-Payment-Methods)
- [SAP Concur approval and payment statuses](https://help.sap.com/docs/CONCUR_EXPENSE/bb83754b1c5541808d50c09901e11475/2f41498598fc43f99d2d5af6489170c9.html)
- [SAP Concur payment-status limitations](https://help.sap.com/docs/CONCUR_EXPENSE/bb83754b1c5541808d50c09901e11475/8c479d377b264704aad0c17d8afded79.html)
- [Brex reimbursement accounting sync](https://www.brex.com/support/reimbursements-integration-sync)
- [Brex outside-payment behavior](https://www.brex.com/support/pay-outside-of-brex)

## D19 — Organization-absorbed processor costs with a fee-cover-first designation-borne option

**Founder ruling:** ratified and adversarially hardened on 2026-07-26.

D19 adopts **organization-absorbed processing costs by default, with one
tenant-enabled, fee-cover-first designation-borne uncovered-cost mode
preserving gross gift truth, exact provider cost, immutable allocation
evidence, and faithful QBO/Xero reporting**.

The tenant chooses who bears exact ordinary payment-processing costs. That
choice changes only the accounting attribution of a separately recognized
expense. It never creates a smaller gift, changes donor intent, changes a
receipt, changes processor settlement evidence, or turns Phase 20 into a
field-account or general-ledger system.

### Four independently authoritative amounts

Every affected occurrence preserves four separate facts:

1. the gross supported-gift amount in the original positive, non-fee-cover
   Designation lines;
2. the separate Phase 13 fee-cover contribution and its frozen association;
3. the exact source-linked eligible processor cost observed through D9; and
4. the resulting provider settlement effect.

The first two facts together preserve the donor's complete gross contribution
truth. The Canonical Accounting Effect recognizes that complete contribution
revenue and the complete processor expense separately. D19 determines the
organization-versus-Designation expense attribution; the frozen D6 mapping
then resolves each resulting share to an Accounting Reporting Target. Neither
the Source Coverage Manifest nor provider output may replace those four facts
with one mutable `net_gift`, `net_donation`, or `amount_after_fee`.

### Processor Cost Attribution Policy Version

One prospective **Processor Cost Attribution Policy Version** is pinned to:

- Tenant;
- Legal Entity;
- exact Settlement Account Binding and processor source family;
- applicable currency behavior;
- one effective half-open policy interval;
- one of the two permitted modes;
- the tenant-selected organization-wide processor-cost semantic role;
- one authorized finance actor, confirmation time, and immutable digest; and
- any prospective Designation Cost Exception Versions.

New tenants and unconfigured Legal Entities use
`organization_absorbs_processing_costs`. Changing policy creates a new
prospective version at the next complete settlement boundary. It cannot split
one charge, processor balance transaction, payout-owned atomic occurrence, or
already frozen Accounting Release.

That default chooses economic attribution only. It never invents an
unrestricted, `Other`, suspense, or provider account. Until the central
processor-expense semantic role and its D6 mapping are configured, affected
work is **Needs mapping** and cannot enter an Accounting Release.

The activation surface uses one existing finance-authorized **Review and
activate** action. D19 creates no mandatory second approval ceremony; any
additional review comes only from the tenant's already-applicable D4 semantic
policy governance and D12 Accounting Release approval policy.

### Mode 1 — Our organization absorbs processing costs

This is the default and recommended mode:

- the original Designation lines retain their complete gross amounts;
- the exact eligible processor cost is attributed to the tenant-selected
  central processing-expense semantic role, which the frozen D6 mapping
  resolves to an Accounting Reporting Target;
- the separate fee-cover contribution remains visible under its established
  Phase 13 purpose;
- fund, missionary, project, donor, receipt, and source facts are unchanged;
  and
- QBO/Xero receives a separate gross contribution and processor-expense
  effect through the active capability-certified carrier.

The central target is tenant-accountant-confirmed. Asym does not hard-code it
as unrestricted, fundraising, administration, program, or any other net-asset
or functional classification.

### Mode 2 — Supported funds, after donor-covered costs

The optional mode means **supported Designations bear only their exact share
of an uncovered ordinary processing cost**:

- the full gross contribution remains credited to its original Designations;
- associated donor fee-cover is applied first for attribution purposes;
- only the residual eligible cost is allocated across the original positive,
  non-fee-cover Designation lines;
- the result is a separately visible processor expense by Accounting Reporting
  Target; and
- **Net attributable after processing costs** is a derived finance view, never
  the stored gift, receipt amount, Field Account balance, or missionary
  availability claim.

For one source-linked charge and one currency:

```text
covered_cost =
  min(actual_eligible_processing_cost, associated_fee_cover)

uncovered_cost =
  max(actual_eligible_processing_cost - associated_fee_cover, 0)

fee_cover_surplus =
  max(associated_fee_cover - actual_eligible_processing_cost, 0)
```

The complete fee-cover amount remains contribution revenue and the complete
actual processor cost remains expense. `covered_cost` determines the portion
of expense attributed to the organization against the fee-cover purpose.
`uncovered_cost` determines the maximum amount eligible for Designation
attribution. A `fee_cover_surplus` remains transparently in the established
fee-cover purpose; it never becomes negative expense or silently increases a
supported Designation.

Fee-cover is excluded from the allocation denominator. The allocator uses the
frozen original positive non-fee-cover Designation amounts, integer minor
units, deterministic largest-remainder allocation, and a stable line-identity
tie-break. It never uses current balances, current Designation mappings,
missionary need, fund popularity, an editable percentage, or provider rounding
as allocation authority.

The control invariant is:

```text
actual_eligible_processing_cost
  = organization_attributed_cost
  + sum(designation_attributed_cost)
```

The source-to-settlement invariant remains:

```text
gross supported-gift amount
  + separate fee-cover contribution
  - separate actual processor cost
  + other exact settlement components
  = exact provider settlement effect
```

### Designation Cost Exception Version

When the optional mode is active, one bounded prospective exception may state
**Organization absorbs costs for this Designation**. It exists for a gift
agreement, grant, trust, endowment, solicitation, jurisdictional constraint,
or other policy-backed reason that does not permit the Designation to bear the
cost.

The exception:

- is Tenant-, Legal-Entity-, Designation-, source-family-, and effective-
  interval-scoped;
- records an authorized actor, reason category, optional purpose-scoped
  evidence reference, time, and immutable digest;
- applies the ordinary allocation weight first, then routes that Designation's
  calculated share to the organization-wide processor-cost target;
- never shifts the excluded share onto another supported Designation;
- is visible only when the optional mode is relevant; and
- changes prospectively without rewriting released accounting.

There is no per-gift override, arbitrary exemption expression, nested
inheritance engine, or tenant-authored formula.

### Eligible processor-cost boundary

Only an exact, source-linked ordinary payment-processing cost may enter the
D19 allocation. The applicable D9 Settlement Component and source link must
prove the provider account, environment, charge or payment occurrence,
currency, amount, fee classification, and finality required by the processor
contract.

The following do not inherit the D19 Designation allocation:

- dispute and chargeback fees;
- foreign-exchange fees and conversion effects;
- payout, Instant Payout, bank-transfer, or settlement-destination fees;
- reserve holds, releases, or minimum-balance effects;
- platform, tax, or standalone account fees;
- provider categories that are new, unknown, or ambiguously classified; and
- any cost without an exact eligible source relationship.

Those occurrences use their separately certified semantic accounting role and
organization target. If required policy or mapping is absent, Phase 20 D13
creates one cause-owned Accounting Exception Case. Neither payout-wide pro
rata nor amount-and-date matching may manufacture a charge relationship.

### Immutable Processor Cost Attribution Manifest

Every included cost produces one immutable **Processor Cost Attribution
Manifest** preserving:

- exact Tenant, Legal Entity, Settlement Account Binding, processor account,
  environment, source occurrence, Settlement Component, and currency;
- source evidence mode, provider classification, actual eligible cost, and
  finality;
- associated fee-cover source identity, frozen amount, and version;
- Processor Cost Attribution Policy Version;
- every original positive non-fee-cover Designation line identity, amount,
  version, allocation weight, eligibility, and Designation Cost Exception
  Version when applicable;
- covered cost, uncovered cost, fee-cover surplus, central share, every
  Designation share, rounding residual, and stable tie-break result;
- Designation Mapping Version, Accounting Reporting Targets, Canonical
  Accounting Effect coverage, and Provider Delivery Plan references;
- algorithm and contract versions; and
- source, policy, allocation, and coverage digests.

One source fee occurrence is covered exactly once. Retries against the same
source, policy, and frozen population reproduce byte-equivalent allocations.
A balanced total without exact source coverage is insufficient.

### Refunds, fee returns, and later corrections

A contribution refund follows Phase 13 and may reverse the original
Designation and fee-cover contribution facts. It does not imply that the
processor returned its fee. Stripe or another source owner must supply that
economic fact.

- An actual provider fee return, rebate, or correction references the original
  Processor Cost Attribution Manifest and creates a new source-linked D11
  Compensating Accounting Release.
- If fee-cover reverses while the processor cost remains, the formerly covered
  portion becomes uncovered under the frozen original policy and original
  allocation population.
- A partial refund uses exact source-owned principal and fee-cover coverage;
  it does not recalculate historical weights from current Designations.
- A dispute, FX effect, or other ineligible processor-cost family remains
  outside D19 even when it references the same gift.
- A released Accounting Release, provider record, manifest, or receipt is
  never edited to appear as though the later fact existed earlier.

Provider-locked periods, current mapping changes, and current policy changes
cannot silently move or reclassify the correction. D11's tenant-permitted,
provider-accepted posting-period contract remains authoritative.

### QBO and Xero fidelity

D19 changes the Canonical Accounting Effect before provider compilation. It
does not let QBO or Xero adapters invent accounting meaning.

Before the optional mode activates for direct delivery, the applicable D7 or
D8 Carrier Plan and D15 Certified Execution Envelope must prove that the
selected provider representation can preserve:

- complete gross contribution revenue;
- complete processor expense;
- central and Designation-borne expense attribution;
- required account and reporting dimensions;
- exact currency and posting-date behavior;
- source coverage and deterministic provider references; and
- exact readback and drift detection.

If the destination cannot faithfully carry the required fund, class, tracking,
project, or other certified dimension, Asym does not silently drop it or post
the cost centrally. The affected direct-delivery plan is not ready. The tenant
may correct the carrier configuration. It may use D16's staff-mediated package
only when that exact provider import surface is independently certified to
preserve the same effect; otherwise the work remains not ready unless an
already authorized D5 provider-summary representation preserves the required
detail in Asym evidence.

Provider acceptance, staff import testimony, exact provider readback, Bank
Match, and final QBO/Xero reconciliation remain separately authoritative.

### Phase 13 and Phase 21 boundaries

D19 preserves Phase 13 as contribution, fee-cover, refund, receipt, and donor-
intent authority. A Processor Cost Attribution Manifest references those
facts; it does not modify them.

D19 also does not debit a missionary Field Account or support balance. Phase
21 owns any operational Administrative Assessment Profile, processor-cost
consumption policy, and support-credit presentation. If Phase 21 later consumes
a D19 attribution, it must reference the exact manifest and prove one-time
coverage so the same processor cost cannot be charged twice. An administrative
assessment is never that processor cost or part of its assessable base.
Accounting attribution and Field Account effect remain independent truths.

### Quiet staff and donor experience

The primary setup surface asks:

> **Who absorbs payment-processing costs?**

It presents two radio cards:

1. **Our organization — Recommended**
   Supported funds retain the full gift amount. Processing costs use the
   organization-wide expense target.
2. **Supported funds, after donor-covered costs**
   Gifts and receipts remain at their full amounts. Donor-covered costs offset
   the transaction's actual processing cost first; any remaining cost is
   attributed to the selected funds under the approved accounting policy.

One persistent explanation states:

> Fee cover is what the donor added. Processing cost is what the provider
> actually charged. They may differ.

Before activation, one representative recent-settlement preview shows:

- gross supported gifts;
- donor fee-cover;
- actual eligible processor cost;
- amount covered by fee-cover;
- uncovered cost;
- allocation by Designation and organization-borne exception;
- net settlement;
- proposed QBO/Xero targets; and
- a zero-difference control.

The UI shows a clear prospective effective boundary and one contextual
**Review and activate** action. It does not expose formulas, debit/credit entry,
provider payloads, or an editable allocation grid in the ordinary path.

Donor-facing disclosure for the optional mode is short and prospective:

> Processing costs may reduce the support ultimately credited to the ministry
> or fund you support under the organization's policy. If you choose to help
> cover these costs, your additional gift offsets them first. Actual costs may
> differ from the estimate.

Donor gift history and receipts continue to show complete contribution truth.
Finance views may show **Gross designated support**, **Processing cost
attribution**, and **Net attributable after processing costs**. An authorized
missionary view may show a resulting **Support credited** effect only after
Phase 21 has independently consumed the exact D19 manifest under its own
policy. The product never labels the result a `net gift` or implies
availability.

All surfaces use existing design tokens and shared controls, semantic headings
and tables, complete keyboard operation, coherent focus order, linked error
summaries, polite status announcements, non-color-only status, responsive
reflow at narrow widths and 200% zoom, adequate touch targets, and reduced-
motion behavior.

### D19 production gates

D19 does not reach production until:

- table and property tests cover no, partial, exact, and excess fee-cover;
- one-cent, zero-decimal-currency, many-Designation, and stable-tie fixtures
  prove exact minor-unit conservation;
- split gifts containing one or more organization-absorbed Designation
  exceptions preserve every line's original weight and never shift excluded
  cost to another Designation;
- recurring installments with changed estimated fee-cover and actual fee use
  each installment's frozen source facts;
- full and partial refunds, fee-cover refunds, actual fee returns, rebates,
  delayed corrections, disputes, and failed refunds preserve append-only
  source and accounting truth;
- dispute, FX, payout, reserve, platform, tax, standalone, unknown, and
  source-unlinked fee families cannot enter the ordinary D19 allocator;
- duplicate webhook, replay, concurrent policy activation, mapping change,
  release freeze, correction, and provider timeout races cannot double-cover
  a source fee or apply two policy versions;
- cross-currency allocation fails closed and one currency can never absorb
  another currency's residual;
- every manifest proves exact source, policy, Designation, mapping, effect, and
  provider-plan coverage with zero unexplained residual;
- direct QBO and Xero fixtures prove complete economic-effect and dimension
  equivalence or correctly route the plan to not-ready without silent
  degradation;
- D16 package fixtures remain byte-stable, destination-pinned, and equivalent
  to the same Canonical Accounting Effect;
- cross-Tenant, Legal-Entity, processor-account, settlement-binding,
  Designation, destination, permission, cache, and RLS negative tests pass;
- manifests, provider references, memos, telemetry, logs, support tools, and
  exports contain no card data, secret, or unnecessary donor PII;
- production-shaped payout, charge, gift-line, Designation, mapping, and
  correction volumes pass bounded worker, restart, provider-limit, and
  storage-failure tests;
- finance users can distinguish gross gift, fee-cover, actual processor cost,
  uncovered cost, fund expense, net settlement, provider delivery, and final
  reconciliation without training;
- representative donors understand that fee-cover is an estimate and that
  their complete gift remains recorded;
- keyboard, screen-reader, focus, error-summary, announcement, responsive,
  zoom, contrast, touch, and reduced-motion tests pass; and
- qualified tenant advisers confirm the optional policy and donor disclosure
  against the tenant's gift terms, restricted-fund obligations, accounting
  policy, and applicable jurisdiction before activation.

### Explicit non-goals from D19

- No net-gift, reduced-receipt, or mutable post-fee contribution amount.
- No payout-wide, date-and-amount, balance-based, or estimated fee allocation.
- No per-gift override, arbitrary percentage, formula builder, allocation DSL,
  editable allocation rows, or tenant-authored provider payload.
- No automatic allocation of dispute, FX, payout, reserve, platform, tax,
  standalone, unknown, or source-unlinked fees.
- No retroactive policy switch or reassignment through current Designations or
  mappings.
- No hard-coded unrestricted, program, fundraising, management, or net-asset
  classification.
- No silent QBO/Xero dimension loss, universal journal fallback, lane
  crossover, or download-equals-delivery claim.
- No Phase 20 field-account debit, missionary-balance authority, receipt
  decision, processor fee estimate, bank reconciliation, or general ledger.
- No product claim that the tenant policy is GAAP-certified, legally approved,
  or CRA-approved.

### Current evidence for D19

The current repo authority, FASB, IRS, CRA, ECFA, Stripe, QBO/Xero, nonprofit-
product, UX, edge-case, and full adversarial evidence is retained in:

- [Phase 20 D19 Processor-Cost Attribution research](./phase-20-processor-cost-attribution-research-evidence.md)
- [FASB ASU 2016-14](https://storage.fasb.org/ASU_2016-14.pdf)
- [IRS Form 990 instructions](https://www.irs.gov/instructions/i990)
- [IRS written acknowledgments](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments)
- [CRA fundraising guidance](https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/policies-guidance/fundraising-registered-charities-guidance.html)
- [ECFA limited-use appeal guidance](https://www.ecfa.org/Content/2MemberManual-AdvisoryOpin-DonorDisclosure)
- [Stripe Balance Transaction](https://docs.stripe.com/api/balance_transactions/object)
- [Stripe reporting categories](https://docs.stripe.com/reports/reporting-categories)
- [Stripe payout reconciliation](https://docs.stripe.com/reports/payout-reconciliation)
- [QBO processing-fee deposit guidance](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-deposits/record-make-bank-deposits-quickbooks-online/L2BBZOPdr_US_en_US)
- [Xero online-payment accounting](https://www.xero.com/us/guides/online-payment-services-get-you-paid-faster/)
- [Aplos online-donation accounting](https://help.aplos.com/hc/en-us/articles/30708091721229-How-To-Manage-Online-Donations)
- [Virtuous gift and project reconciliation](https://support.virtuous.org/hc/en-us/articles/33916761894925-How-Do-I-Reconcile-Gifts-in-Virtuous-Giving)
- [Bloomerang GiftAssist](https://help.bloomerang.com/en/articles/13382221-giftassist-a-visual)

## D20 — Local-currency-first settlement with proof-gated retained currencies

**Founder ruling:** ratified and adversarially hardened on 2026-07-26.

D20 adopts **quiet local/home-currency settlement by default from exact
account-scoped Stripe Balance Transaction facts, preserving donor presentment
and provider-conversion evidence, with proof-gated opt-in retained
foreign-settlement-currency lanes and QBO/Xero-owned translation, revaluation,
and foreign-exchange accounting**.

The founder's ordinary-path requirement is that most tenants let Stripe convert
foreign-presentment gifts into their local currency and account for what Stripe
places in that balance. In this decision, **what Stripe places in the balance**
means each immutable, account-scoped Balance Transaction's exact `amount`,
`fee`, `net`, currency, balance type, provider category, source, timestamps, and
provider-supplied conversion evidence. It does **not** mean the mutable current
Stripe balance, a Dashboard total, a payout net, or net contribution revenue.

### Authority boundary

D20 consumes and cannot supersede:

1. Phase 2's currency metadata, integer-minor-unit rules, and current
   presentment-equals-settlement launch fence;
2. Phase 13's contribution amount, Designation allocation, donor presentment,
   transaction currency, and source-owned correction truth;
3. Phase 24's future authority to activate additional donor presentment
   currencies and donor-facing currency disclosure;
4. D3's distinct Legal Entity, Settlement Account Binding, processor account,
   environment, presentment, transaction, settlement, payout, provider-base,
   reporting, and Accounting Destination identities;
5. D4's single-currency, exactly balanced Canonical Accounting Effect and
   accountant-confirmed semantic policy;
6. D7 and D8's exact QBO home-currency, Xero base-currency, provider
   multicurrency, account-currency, carrier, and readback capability evidence;
7. D9's source-authoritative Settlement Components and exact Stripe
   Balance Transaction observations;
8. D10's currency-exact Expected Bank Arrival and Bank Match;
9. D11's append-only correction and posting-period authority;
10. D13's cause-owned exception and proof-gated recovery contract;
11. D16's independently certified provider-import surfaces; and
12. D19's exact same-currency processor-cost attribution boundary.

D20 owns only:

- the ordinary local/home-currency settlement-lane rule;
- immutable Provider Conversion Evidence terminology and completeness;
- the prospective authorization of an optional retained foreign settlement
  currency;
- the currency-specific readiness relationship among Stripe, the payout bank,
  and the Accounting Destination; and
- the staff-facing explanation of those relationships.

D20 does not choose a donor presentment currency, invent source facts, set an
accounting rate, translate books, revalue balances, calculate realized or
unrealized gains and losses, reconcile a bank account, or become a
multicurrency subledger.

_(Downstream clarification, 2026-07-30, Phase 21 D6: D20 certification is not
a universal Field Account activation or close gate. A retained Stripe
source-family path may reference only the exact D20 settlement,
payout-destination, conversion, and accounting capabilities that path needs.
Offline-deposit and direct-credit Field Account paths may instead qualify under
Phase 21 D2. Phase 21 owns its Default Field Account Currency Version, each
source-family-specific Activation Version, admission manifest, cycle close,
and per-currency balance; QBO/Xero connectivity does not own those truths.)_

### Independent currency roles

Every relevant currency is named by role and retained independently:

- **donor payment-method currency** — the card or account's currency, when the
  provider exposes it;
- **presentment currency** — the currency offered to and charged for the gift;
- **source transaction currency** — the currency in which the source-owned
  occurrence is denominated;
- **Stripe balance or settlement currency** — the currency of the exact
  Balance Transaction `amount`, `fee`, and `net`;
- **payout currency** — the currency of the Processor Payout Transfer;
- **bank-account currency** — the currency accepted by the exact payout
  destination and later observed bank evidence;
- **QBO home currency or Xero base currency** — the accounting provider's
  authoritative reporting base;
- **provider-object currency** — the currency assigned to a QBO/Xero
  transaction, name, or account where the provider contract permits it; and
- **site reporting currency** — a presentation/reporting preference that is
  never used as evidence of the accounting provider's home or base currency.

One Canonical Accounting Effect, Accounting Release, Provider Delivery Plan,
Accounting Delivery Package, Expected Bank Arrival, and Bank Match has exactly
one currency. Currency participates in identity, idempotency, partitioning,
control totals, account selection, and provider readback. Unlike currencies
are never added, netted, allocated, balanced, or exactly matched merely because
their displayed numeric values happen to agree.

### Lane 1 — Quiet local/home-currency settlement

The default and recommended lane applies when:

- Stripe settles the activity into the connected account's ordinary local
  balance currency;
- the exact payout is directed to a bank account in that same currency; and
- that currency exactly equals QBO `HomeCurrency` or Xero `BaseCurrency` for
  the pinned Accounting Destination.

This lane is derived from current authoritative evidence rather than configured
as another tenant setting. It creates no multicurrency wizard, activation
ceremony, per-gift choice, or recurring finance task.

The accounting handoff uses the exact Stripe balance-denominated facts:

```text
BalanceTransaction.amount - BalanceTransaction.fee
  = BalanceTransaction.net
```

All values are integer minor units under the exact Balance Transaction
currency and that currency's exponent. The `amount` remains gross provider
activity, `fee` remains provider cost, and `net` remains the balance impact.
The accounting projection preserves the complete gross contribution and
separate expense treatment required by D4 and D19. Neither the aggregate
Stripe balance nor the payout net may replace those components.

The source gift remains denominated in its authoritative presentment and
transaction currency. The local settlement result does not rewrite the donor's
gift, Designation allocation, receipt, or communication history.

### Provider Conversion Evidence

Whenever Stripe converts an amount, Phase 20 preserves one immutable
**Provider Conversion Evidence** record or reference containing every
provider-exposed fact needed to understand the conversion:

- exact processor account, environment, balance type, Balance Transaction, and
  source identity;
- source and destination currency roles;
- source amount basis and exact settlement `amount`, `fee`, and `net`;
- the provider's raw nullable exchange rate, its documented direction, and the
  effective provider occurrence time;
- provider-attributed fee details and separately classified conversion-cost
  components, where exposed;
- provider contract, retrieval, normalization, and currency-metadata versions;
- evidence digest, completeness state, and any explicit provider limitation;
  and
- source, settlement, payout, Accounting Effect, and correction lineage.

Asym never substitutes:

- today's market rate;
- a tenant- or staff-entered rate;
- a rate inferred from rounded display amounts;
- a synthetic `1.0` when the provider returns `null`;
- an assumed conversion fee hidden inside the rate; or
- a general reporting-rate table as the transaction's provider evidence.

An applicable Stripe Balance Transaction may define its rate direction as
source amount multiplied by `exchange_rate` equals the balance-denominated
amount. Other provider contracts may use another direction, so direction is
stored explicitly rather than normalized through silent inversion. A
same-currency transaction legitimately has no conversion and may retain a
`null` rate.

Phase 2's reserved `currency_rate_snapshots` seam, if implemented, must
reference or project this D9/D20 provider evidence. It cannot become a second
editable exchange-rate authority.

### Lane 2 — Optional retained foreign settlement currency

A tenant that intentionally keeps and pays out a supported foreign currency may
prospectively activate one immutable **Settlement Currency Lane Version**.
Each version is scoped to:

```text
Tenant
× Legal Entity
× Settlement Account Binding
× Stripe connected account
× environment
× balance type
× settlement currency
× exact payout destination
× Accounting Destination Connection
× half-open effective interval
```

The lane may activate only after current proof establishes:

1. Stripe supports multi-currency settlement for the exact platform,
   connected-account region, account, environment, and currency;
2. Stripe has the exact matching-currency external payout account and exposes
   the applicable payout minimums, fees, schedule, and balance behavior;
3. the payout bank account currency exactly matches the retained settlement
   currency;
4. QBO `CurrencyPrefs.MultiCurrencyEnabled`, `HomeCurrency`, the intended
   transaction currency, and every required active account or name currency
   satisfy the D7 Carrier Plan; or
5. Xero `BaseCurrency`, current `UseMulticurrency` capability, added-currency
   list, exact bank-account currency, and every required active provider object
   satisfy the D8 Carrier Plan;
6. the direct or staff-mediated delivery surface can preserve the complete
   Canonical Accounting Effect without silent currency or dimension loss;
7. exact provider preview and readback fixtures pass; and
8. no unresolved destination, period, mapping, settlement, ownership, or
   currency exception can cause overlapping or ambiguous work.

The capability evidence is prospective, destination-pinned, time-bounded,
expiring, and invalidated by relevant account, payout-bank, region,
subscription, currency, carrier, destination, or provider-contract drift.

Asym does not automatically enable QBO multicurrency, add a Xero currency,
create or replace a foreign-currency bank account, or make another irreversible
provider choice. The UI links staff to the exact provider-owned setting,
explains the consequence before they leave, and then offers **Check again**.
Provider access or an API that technically permits mutation is not authority to
make that choice silently.

### QBO and Xero ownership

The provider-native D7 or D8 carrier determines the exact foreign-currency
record shape. Asym supplies only the currency and rate evidence that the
certified provider contract requires to preserve the Canonical Accounting
Effect.

- QBO remains authoritative for its home-currency values and provider business
  logic. QBO's `ExchangeRate` direction is home-currency units per one foreign
  unit, while `HomeTotalAmt` is provider-calculated where available.
- Xero remains authoritative for base-currency translation, provider rates,
  foreign-currency exposure, and realized or unrealized foreign-exchange
  reporting.
- Provider-owned translation, revaluation, rate edits, period behavior, and
  gains or losses are observed through exact readback. Asym does not copy them
  into a competing GL.

If the direct carrier cannot preserve the frozen effect, the release remains
not ready. D16's staff-mediated package is permitted only when its exact
provider, region, subscription, importer, template, and currency surface has
been independently certified for equivalent effect. Evidence-artifact
availability is permanent, but it is not evidence of provider delivery,
import, translation, or reconciliation.

### Refunds, disputes, and later corrections

A refund, dispute, fee return, payout reversal, or later provider adjustment
consumes its own source-owned occurrence and its own Stripe Balance Transaction
evidence. Its conversion rate and local amount may differ from the original
payment because the provider converted it at a different time.

Phase 20 therefore:

- never mechanically reverses the original local-currency amount;
- never recalculates either occurrence using today's rate;
- never edits the original Provider Conversion Evidence or Accounting Release;
- links the later occurrence to its cause and original source coverage; and
- uses D11's new Compensating Accounting Release in a tenant-policy-permitted,
  provider-accepted period.

A missing, contradictory, incomplete, or changed provider occurrence blocks
only the affected unreleased work and creates one cause-owned D13 Accounting
Exception Case. Recovery appends evidence and revalidates the exact lane; it
does not silently choose another currency, bank account, destination, rate, or
delivery lane.

### Interaction with D19 processor-cost attribution

Foreign-exchange fees and conversion effects remain outside D19's ordinary
charge-linked processor-cost allocator. They use their own D4 semantic roles
and organization targets or remain in a cause-owned exception until those
authorities exist.

The organization-absorbed D19 default remains available for exact provider
costs in the Accounting Effect's currency. The optional
Designation-borne-uncovered-cost mode is unavailable whenever the eligible
processor cost and the frozen source Designation allocations lack one proved
same-currency allocation basis. Asym never:

- prorates a local settlement-currency fee across foreign source lines;
- uses an exchange rate to manufacture Designation allocation weights;
- assigns a conversion residual to a supported fund; or
- hides a currency mismatch in an organization-wide balancing plug.

A future source contract may provide an exact, source-authoritative
same-currency allocation basis. Until then, the affected cost remains
organization-borne through D19's central target. If that required mapping or
provider capability is absent, the work is not ready and D13 exposes the exact
cause. Staff cannot override the currency invariant.

### Phase 2, Phase 13, and Phase 24 boundaries

D20 is downstream accounting and settlement behavior. It does not widen Phase
2 or Phase 13's current transaction allowlist, and it does not make a
foreign-currency checkout valid.

Phase 24 alone may later activate additional donor presentment currencies
after its own donor disclosure, recurring-currency, payment-method,
minimum/maximum, provider-capability, and source-truth requirements are met.
Once an upstream source is authorized to create that activity, D20 determines
how its exact settlement evidence can enter accounting.

One donation cart, source occurrence, Canonical Accounting Effect, Accounting
Release, Accounting Delivery Package, Expected Bank Arrival, and Bank Match
remains single-currency. Supporting many currencies means operating multiple
bounded currency lanes, never one cross-currency total.

### Quiet staff experience

Most tenants see no additional setup. The Accounting workspace displays one
calm sentence such as:

> Stripe converts foreign gifts to CAD. Asym sends Stripe's exact CAD gross,
> fee, and net amounts to Xero.

Routine rows show the accounting amount and currency. A compact **Currency
details** disclosure is available when staff need it and shows:

- donor paid: original amount and presentment currency;
- Stripe balance: exact `amount`, `fee`, `net`, and settlement currency;
- provider conversion: rate direction, time, source, and separately exposed
  cost;
- payout: exact currency and destination;
- accounting: QBO home or Xero base currency and selected account; and
- separately truthful settlement, delivery, readback, Bank Match, and
  reconciliation states.

The optional path begins with one secondary action:

> **Keep and account for a separate currency balance**

One review-first checklist then shows:

1. what Stripe will retain and where it will pay out;
2. the matching-currency bank account;
3. whether QBO or Xero supports and is configured for the currency;
4. the exact provider-native records and reporting coverage Asym will use;
5. provider fees, minimums, irreversible settings, and missing proof;
6. a representative exact preview; and
7. the prospective activation boundary.

The primary action is contextual: **Open Stripe settings**, **Open QuickBooks
settings**, **Open Xero settings**, **Check again**, or **Review and activate**.
There is no generic `FX error`, tenant-authored rate, payload editor, arbitrary
rules builder, or dashboard of healthy currency infrastructure.

Status copy identifies the exact cause and safe next action:

- **Using local settlement currency**;
- **Waiting for Stripe currency setup**;
- **Payout account currency does not match**;
- **QuickBooks multicurrency is off**;
- **Xero plan no longer permits multicurrency**;
- **Accounting account currency changed**;
- **Provider conversion evidence is incomplete**; or
- **Accounting readback differs from the release**.

The UI uses existing design tokens and shared components, semantic headings and
tables, keyboard-complete controls, coherent focus, linked error summaries,
polite status announcements, non-color-only states, narrow-screen reflow,
200%-zoom support, adequate touch targets, and reduced-motion behavior.

### D20 production gates

D20 does not reach production until:

- an EUR-presentment-to-USD-settlement fixture proves separate source and exact
  balance-denominated gross, fee, net, rate, and conversion evidence;
- same-currency transactions preserve a legitimate `null` rate without
  manufacturing `1.0`;
- JPY and other zero-decimal plus BHD/KWD and provider-special-case currencies
  prove correct exponent, rounding, serialization, and display behavior;
- partial and full refunds at later provider rates create exact append-only
  corrections without mechanically reversing the original local amount;
- separate `stripe_fx_fee`, fee return, dispute, reserve, payout, and unknown
  components remain independently classified and cannot enter D19 allocation;
- missing, duplicated, incomplete, contradicted, out-of-account, wrong-
  environment, or wrong-balance-type Balance Transactions fail closed;
- pagination, webhook replay, nightly-sync overlap, retry, concurrent lane
  activation, destination change, payout-bank change, and release-freeze races
  cannot duplicate evidence or mix currency authorities;
- every identity, idempotency key, unique constraint, partition, control total,
  and artifact digest includes exact currency and scope where required;
- QBO fixtures cover multicurrency off and on, immutable home currency,
  currency-specific names/accounts, `CurrencyRef`, rate direction, provider
  totals, exact readback, and destination drift;
- Xero fixtures cover base currency, current `UseMulticurrency`, added and
  inactive currency behavior, bank-account currency, plan downgrade, provider
  rate behavior, exact readback, and destination drift;
- Stripe fixtures cover unsupported regions, account capability, matching-
  currency external accounts, fees, payout minimums, default conversion, and
  retained-balance behavior for the actual Connect topology;
- no Accounting Effect, Release, Delivery Plan, Package, Expected Bank Arrival,
  Bank Match, report total, or allocator crosses currencies;
- D19's optional mode remains unavailable without a proved same-currency source
  and eligible-cost basis;
- direct delivery and every D16 import surface either prove complete
  effect-equivalence in the currency or remain not ready without fallback;
- cross-Tenant, Legal-Entity, connected-account, environment, balance-type,
  settlement-binding, payout-bank, Accounting Destination, permission, cache,
  and RLS negative tests pass;
- secrets, card data, unnecessary donor PII, bank credentials, and provider
  descriptions never leak into artifacts, logs, metrics, exception text,
  support tools, URLs, or client state;
- production-shaped many-currency, many-account, payout, refund, correction,
  provider-limit, restart, and storage-failure tests remain bounded and
  resumable;
- representative bookkeepers can distinguish donor presentment, Stripe
  settlement, provider conversion, payout, bank arrival, accounting home/base,
  provider delivery, and final reconciliation without training;
- ordinary single-currency tenants complete setup with no multicurrency work
  and no irrelevant controls; and
- keyboard, screen-reader, focus, error-summary, announcement, responsive,
  zoom, contrast, touch, and reduced-motion tests pass.

### Explicit non-goals from D20

- No mutable Stripe current balance, Dashboard total, or payout net as
  accounting truth.
- No net-only contribution revenue or rewrite of gross gift, Designation,
  receipt, or donor history.
- No Asym market-rate service, rate picker, rate override, conversion quote,
  revaluation, translation ledger, foreign-exchange gain/loss engine, or
  multicurrency general ledger.
- No cross-currency arithmetic, allocation, Bank Match, balancing residual, or
  apparent equivalence.
- No automatic enabling of QBO multicurrency, automatic Xero currency
  activation, silent foreign bank-account creation, or other irreversible
  provider setting.
- No tenant-wide `multicurrency_enabled` boolean, per-gift settlement choice,
  arbitrary lane builder, currency-routing DSL, or mutable cutoff.
- No retroactive reinterpretation through current Stripe, bank, QBO, Xero,
  mapping, rate, or lane configuration.
- No retained foreign-currency lane without exact current Stripe, bank,
  accounting-provider, carrier, readback, and interval proof.
- No D19 allocation across currencies or automatic attribution of FX and
  conversion effects to supported Designations.
- No Phase 20 activation of donor presentment currencies; Phase 24 retains that
  authority.
- No claim that Asym, Stripe, QBO, or Xero configuration is accounting,
  tax, legal, or jurisdictional advice.

### Current evidence for D20

The current repo, Stripe, QBO, Xero, accounting-boundary, UX, edge-case, and
full adversarial evidence is retained in:

- [Phase 20 D20 Multi-Currency and FX research](./phase-20-multi-currency-fx-research-evidence.md)
- [Stripe supported currencies](https://docs.stripe.com/currencies)
- [Stripe Balance Transaction object](https://docs.stripe.com/api/balance_transactions/object)
- [Stripe Connect multi-currency settlement](https://docs.stripe.com/connect/multicurrency-settlement)
- [Stripe Connect currency behavior](https://docs.stripe.com/connect/currencies)
- [QuickBooks Online multicurrency](https://developer.intuit.com/app/developer/qbo/docs/workflows/manage-multiple-currencies)
- [Xero Organisation capabilities](https://developer.xero.com/documentation/api/accounting/organisation)
- [Xero Currencies endpoint](https://developer.xero.com/documentation/api/accounting/currencies)
- [Xero multicurrency certification guidance](https://developer.xero.com/documentation/best-practices/data-integrity/multicurrency/)
- [Xero multicurrency](https://central.xero.com/s/article/About-multicurrency)
- [Xero bank-account currency](https://central.xero.com/s/article/Add-a-bank-account-or-credit-card-account)

## Phase 20 grill close-out

Phase 20 is founder-decision-complete through D20. D1–D20 resolve the bounded
context and doorway, delivery lanes, Legal Entity and destination ownership,
canonical accounting meaning, provider-native profiles and carriers, many-fund
mapping, Stripe settlement evidence, Bank Match, corrections, release cadence,
exceptions, authorization, capacity, delivery packages, posting-ownership
cutover, the Phase 21 expense handoff, processor-cost attribution, and the final
multicurrency/foreign-exchange boundary.

The remaining provider recipes, package bytes, schemas, indexes, queues,
retention, bank-data vendor, provider scopes, certification evidence, load
envelopes, test fixtures, and accountant/security/accessibility/usability
validation are specification and implementation work under the ratified
contracts. They do not require another founder-level Phase 20 product decision.
Phase 20 must not absorb Phase 21 expense operations or invent D21 to decide
implementation detail.

### Phase 21 D11 Field Account integrity precision amendment — 2026-07-30

Phase 21 D11 does not reopen Phase 20 D1-D20 or add a Phase 20 implementation
requirement. Phase 20 may expose immutable, versioned accounting-coverage,
delivery, readback, and drift evidence for one separately labelled Phase 21
operational comparison. That evidence:

- is not a Field Account integrity predicate;
- does not run through a live QBO/Xero call inside Support Cycle close
  publication;
- cannot change a Field Account Occurrence, control-side entry, Support Cycle
  Integrity Manifest, Finance-confirmed Field Account Balance, verification
  verdict, or Integrity Case; and
- remains independently recoverable when QBO/Xero or another provider is
  unavailable.

A tenant may prospectively require staff to review or acknowledge already
persisted accounting evidence as an operational policy, but that does not
change the Phase 21 integrity verdict. A Phase 20-owned cause creates the D13
Accounting Exception Case; a Phase 21-owned cause creates the Field Account
Integrity Case. Both may link one shared Mission Control follow-up, whose
completion clears neither financial case. QBO/Xero remains authoritative for
accepted provider records, books, period controls, and final reconciliation.

### Phase 21 D15 reimbursement-handoff precision amendment — 2026-07-31

Phase 21 D15 does not reopen Phase 20 D1-D20 or add a Phase 20 payment,
accounts-payable, provider, Bank Match, or accounting-delivery lane.
Reimbursement Handoff Package, Delivery Profile Version, Execution Claim,
Handoff Coverage, Handoff Attestation, Handoff Operation, provider draft/input
acceptance and readback, operation ambiguity, and residual-only route
succession remain Phase 21 operational evidence.

Those objects prove only package, access, execution-ownership, handoff, or
provider-operation facts. They cannot create an External Payment Occurrence,
Reimbursement Payment Coverage, Accounting Posting Intent, Accounting Release,
QBO/Xero Accounting object, or stronger payment evidence than their source
actually supplies. For the Phase 21 D15 reimbursement-handoff path, only an
independently eligible Approved Reimbursement Obligation or separately source-
qualified External Payment Occurrence may enter D18 through that path.

Artifact creation/download is non-executing; Handoff Attestation is not payment;
provider draft readback proves only handoff-operation outcome. Phase 20 D17
assigns one posting owner when the actual source or atomic payment occurrence
exists, not when D15 releases a package. Staff payment evidence remains
**Payment recorded by finance** unless a separately certified authority
supports stronger confirmation. QBO/Xero Accounting stays Phase 20-only. At
the D15 boundary, claimant repayment stayed accounting-dark pending the
separately certified source contract later supplied by Phase 21 D16.

### Phase 21 D16 advances-and-repayments precision amendment — 2026-07-31

Phase 21 D16 does not reopen Phase 20 D1-D20 or authorize Phase 20 to run an
advance, claimant-repayment, collections, payroll-deduction, accounts-payable,
banking, or Field Account workflow. It precision-amends the closed D18 source
catalog with only:

- evidence-qualified Expense Advance Issuance Occurrence;
- separately certified Expense Advance Application typed accounting effect
  where applicable;
- source-qualified Claimant Repayment Occurrence explicitly typed as a cash
  claimant return;
- source-qualified Claimant Repayment Occurrence explicitly typed as an expense
  advance return; and
- cause-linked corrections for those admitted source families.

A cash claimant return and an expense advance return remain distinct typed
accounting occurrences. Phase 20 cannot infer either family from sign,
predecessor, requirement, memo, account, or posting recipe; collapse them into
a negative expense; net them against reimbursement or compensation; infer one
from bank or QBO/Xero evidence; or let either occurrence reuse another family's
source coverage.

The following remain rejected before Posting Intent: Expense Advance Policy
Version, Claimant Repayment Policy Version, Expense Advance Authorization
Version, Expense Settlement Determination, Repayment Subject Determination,
Claimant Repayment Decision, uncertified Claimant Repayment Requirement,
Advance Residual Position, task or notification state, raw Advance Evidence
Observation or Repayment Evidence Observation, dispute state, Repayment
Restitution Review, and Field Account Funding Coverage. A Claimant Repayment
Requirement remains accounting-dark unless a separate accountant-certified
policy and source contract recognizes the exact receivable; receivable
recognition still proves neither returned money nor settlement.

Every admitted D16 occurrence independently resolves Phase 20 D17 posting
ownership for its exact Tenant, Legal Entity, source family, currency, and
interval. Policy, authorization, requirement, Field Account, reimbursement
handoff, or related accounting evidence cannot assign that owner. QBO/Xero
remains authoritative for provider records, books, period controls, and final
reconciliation.

### Phase 21 D17 opening-position and operational-cutover precision amendment — 2026-07-31

Phase 21 D17 does not reopen Phase 20 D1-D20 or create a Phase 20 migration,
Field Account, provider-inspection, Bank Match, or accounting-delivery lane.
Phase 21 owns its finance-authorized Opening Source Package, complete
Tenant-by-Legal-Entity-by-ISO-currency activation cohort, Opening Coverage
Manifest, Field Account Opening Position, certified exact-history admission,
structurally inert reference history, Field Account Operational Cutover, and
append-only Opening Position Corrections. Phase 30 may supply transport and
non-authoritative staging, but neither Phase 20 nor Phase 30 may activate or
rewrite those Phase 21 authorities.

Every Opening Source Package, Opening Coverage Manifest, residual Field Account
Opening Position, reference-history record, cutover record, staging result,
mapping, control-total review, and correction workflow is accounting-dark. None
is an Accounting Posting Intent, Accounting Effect, Accounting Release, Bank
Match, provider operation, or QBO/Xero object. A residual Opening Position is
not a journal-entry request, and canonical Phase 21 exact history does not prove
that equivalent accounting is absent from the existing books.

Only a separately source-qualified economic occurrence with
accountant-confirmed semantics, a compatible Posting Profile, and positive
proof that it remains unposted may enter Phase 20 D17's optional gap-only
backfill. Existing QBO/Xero or previous-owner evidence keeps its exact
provenance. Phase 20 must not infer an accounting gap from a Phase 21 manifest,
an unavailable provider search, a source-file omission, or the fact that Asym
has activated Field Accounts; it must not replay whole history or post the
residual Opening Position merely to reproduce the Field Account balance.

The Phase 21 Field Account Operational Cutover and the Phase 20 Posting
Ownership Cutover are independently authoritative records with different
scopes and consequences. A tenant may intentionally align their half-open
boundaries, but one record never creates, changes, or proves the other. Phase
21 activation therefore cannot assign the Phase 20 posting owner, and Phase 20
delivery, readback, drift, or final reconciliation cannot change the opening
cohort, coverage disposition, Field Account balance, or cutover generation.

### Phase 21 D20 organization-support-cost precision amendment — 2026-08-01

Phase 21 D20 does not reopen Phase 20 D1-D20 or add an organization-support-
cost posting recipe, adapter, or launch source family. The external provider,
accounts-payable system, or governed tenant source owns the exact cost fact;
Phase 21 owns source admission, economic-root classification, bearing policy,
application and carryforward truth, and only the D1/D11 close-covered Field
Account effect.

The source observation, economic root, bearing policy, application,
determination, coverage manifest, carryforward, Field Account Funding Coverage,
closed effect, and **Support Cost Accounting Candidate Handoff** all remain
unsupported and accounting-dark in the current Phase 20 generation. None is a
D18 source or may create an Accounting Posting Intent, Canonical Accounting
Effect, Accounting Release, Delivery Package, provider operation, Expected Bank
Arrival, or Bank Match. No generic expense, JournalEntry, ManualJournal, or
artifact-only fallback may upgrade it.

Phase 20 D19 remains the exclusive processor-cost attribution and treatment
lane. Phase 21 D20 cannot re-admit or duplicate exact Stripe or other provider
cost, double-cover the Processor Cost Attribution Manifest, or recast a
processor cost under a different organization-support-cost root.

Future admission requires a separately approved Phase 20 change with the exact
source schema, accountant-confirmed semantics, close-covered occurrence
contract, compatible Posting Profile recipe, positive unposted or differential
proof, and exact D17 posting owner. Existing provider posting references retain
their original provenance. QBO/Xero remains authoritative for posted books,
period controls, and final reconciliation.

### Phase 21 D21 noncash-realization precision amendment — 2026-08-01

Phase 21 D21 does not reopen Phase 20 D1-D20 or add a noncash-disposition
posting recipe, accounting artifact, provider adapter, Bank Match, or launch
source family. Phase 13 owns the original noncash Contribution, legal donor,
accepted purpose, gift date, valuation, receipt, supporter, and fundraising
truth. Phase 15 owns the canonical append-only asset-lot, disposition,
proceeds, finality, evidence, and correction projection. Phase 21 owns only the
derivative Noncash Support Realization Manifest, Realized Support Basis, and
D2/D11 close-covered Field Account effect. Phase 14 may own separate
recognition credit; it does not own disposition or proceeds truth.

Every Phase 15 noncash disposition projection and Phase 21 D21 realization,
cost-treatment selection, manifest, Field Account effect, and correction
remains unsupported and accounting-dark in this Phase 20 generation. None may
create a D18 source, Accounting Posting Intent, Canonical Accounting Effect,
Accounting Release, Delivery Package, provider operation, Expected Bank
Arrival, or Bank Match. No generic JournalEntry, ManualJournal, expense-lane,
or artifact-only fallback may upgrade it.

Any later accounting admission requires a separately approved Phase 20 change
that certifies exactly one canonical economic source, its exact schema,
accountant-confirmed semantics, non-overlapping source coverage, compatible
Posting Profile recipe, positive unposted or differential proof, and exact D17
posting owner. It must prove that one disposition cannot be posted once from
Phase 15 and again from the derivative D21 Field Account effect. Existing
provider or previous-owner evidence retains its original provenance.

Brokerage, liquidation, appraisal, valuation, custody, transfer, sale, and
other noncash-disposition costs are not Phase 20 D19 processor costs and are not
Phase 21 D20 Organization Support Costs. They cannot enter either manifest by
renaming or fallback. QBO/Xero and the tenant's accountant remain authoritative
for asset derecognition, gain or loss, cash, fees, accounting periods, posted
books, and final reconciliation.

### Phase 21 D22 prospective-expense-authorization precision amendment — 2026-08-01

Phase 21 D22 does not reopen Phase 20 D1-D20 or add an expense, procurement,
reservation, payment, artifact, provider-adapter, or accounting source. Phase
21 owns every optional posture, Prospective Expense Request Version, private
plan-evidence meaning, Governance Resolution, operation-scoped Approval
Assignment Snapshot, human Review Action, Organization Authorization Decision,
compatible capacity reservation, exact later-claim Authorization Coverage,
unused-scope declaration, in-flight residual, successor, and correction.

The complete D22 family is unsupported and accounting-dark. None is a D18
source or may create an Accounting Posting Intent, Canonical Accounting Effect,
Accounting Release, Delivery Package, provider operation, Expected Bank
Arrival, Bank Match, or QBO/Xero object. JournalEntry, ManualJournal, expense-
lane, artifact-only, staff-mediated, and adapter fallbacks cannot upgrade a
plan, approval, or reservation into accounting truth.

Only an independently qualified later D10/D13 Approved Expense Snapshot,
Reimbursement Obligation, source-qualified External Payment Occurrence, or
other already certified economic source may enter its own Phase 20 lane with
exact D17 posting ownership. Phase 20 cannot infer incurrence, substantiation,
policy eligibility, obligation, payment, or posting from D22, and no delivery,
readback, drift, or reconciliation result may mutate or release D22 coverage.

### Phase 21 D23 expense-effect-recognition precision amendment — 2026-08-01

Phase 21 D23 does not reopen Phase 20 D1-D20 or add an expense source,
accounting date, artifact lane, provider adapter, or reconciliation authority.
Every Expense Field Account Effect Recognition Profile, Expense Field Account
Effect Basis, Field Account Funding Coverage or Disposition, Expense Field
Account Effect Coverage, operational Expense Field Account Effect, Support
Cycle inclusion/through date, qualification exception, and correction remains
unsupported and accounting-dark before D18 admission.

None may create, select, date, modify, release, redeliver, or reconcile an
Accounting Posting Intent, Canonical Accounting Effect, Accounting Release,
Delivery Package, provider operation, Expected Bank Arrival, Bank Match, or
QBO/Xero object. JournalEntry, ManualJournal, generic expense, artifact-only,
staff-mediated, and adjacent-source fallbacks cannot upgrade D23 operational
truth.

An independently certified Approved Expense Snapshot, Reimbursement
Obligation, source-final organization-paid occurrence, External Payment
Occurrence, or cause-linked correction may still enter its own closed D18 lane
with exact D17 posting ownership. It does not inherit D23 mode, profile, effect
identity, qualification date, close, or through date. QBO/Xero bills, payments,
home amounts, readback, drift, and Bank Match cannot qualify or rewrite D23.
D23 Effect Coverage and Phase 20 Source Coverage remain separate purpose
namespaces; neither gates the other, and Phase 20 cannot post the same economic
coverage once from its independent source and again from the D23 operational
effect.

### Phase 21 D24 expense-collaboration precision amendment — 2026-08-02

Phase 21 D24 does not reopen Phase 20 D1-D20 or add an expense source,
approval, payment fact, posting owner, artifact lane, provider adapter, or
reconciliation authority. Expense Collaboration Assignment Versions,
authority-free invitations, accepted helper principals, Evidence Access
Projection Versions, Claimant Confirmations or admitted external attestations,
helper actions, and immutable actor provenance remain Phase 21 truth and are
unsupported and accounting-dark before D18 source admission.

Those records may explain who prepared, supplied evidence for, confirmed, or
mechanically submitted exact claim coverage. They do not replace Phase 12
authorization or establish incurrence, substantiation, policy eligibility,
approval, obligation, payment, Field Account effect, posting, or
reconciliation. Only an independently qualified D10/D13 Approved Expense
Snapshot, Reimbursement Obligation, source-final organization-paid occurrence,
External Payment Occurrence, or cause-linked correction may enter its existing
closed lane. Minimum necessary D24 provenance may remain non-authoritative
lineage, but Phase 20, QBO, and Xero cannot grant, revoke, expand, satisfy, or
rewrite D24 assignment, consent, evidence-access, or helper authority.

### Phase 21 D25 expense-resolution precision amendment — 2026-08-02

Phase 21 D25 does not reopen Phase 20 D1-D20 or add an expense source, posting
owner, recipe, artifact lane, provider adapter, Bank Match, or reconciliation
authority. Expense Claim Resolution Cause Contract Versions, Cases,
Occurrences, Projections, Downstream Impact Manifests and dispositions, tasks,
messages, responses, owner-command requests, and case-completion proofs remain
Phase 21 coordination truth and are rejected before D18 admission.

Only an independently authoritative source correction may enter its existing
closed lane under D17 posting ownership. Phase 20 alone appends any qualified
Compensating Accounting Release, selects an accountant-permitted period and
treatment, owns provider delivery/readback/drift, and detects or clears its own
Accounting Exception Case. D25 may store opaque correlation and observe that
result. Case or Mission Control task completion, notification delivery,
silence, timeout, or provider ambiguity cannot prove posting, accounting
delivery, or reconciliation.

### Phase 21 D26 records-export precision amendment — 2026-08-02

Phase 21 D26 does not reopen Phase 20 D1-D20 or add an accounting source,
posting owner, recipe, artifact lane, provider adapter, Bank Match, QBO/Xero
backup, or reconciliation authority. Its Records Schedule Contract and Binding
Versions, Retention Resolutions, successor-impact coverage, Records Export
Packages, Coverage Manifests, parts, downloads, prints, external-copy
assertions, verified custody transfers, holds, offboarding windows, and copy-
disposition evidence are rejected before D18 admission.

A D26 package may include only a currently authorized Phase 20 owner reference
or exact evidence copy. Importing, storing, transferring, or disposing that
copy creates no Accounting Release, delivery operation, provider acceptance,
readback, drift result, exception clearance, posting, or reconciliation and
changes no Phase 20 retention or ownership. This precision amendment adds no
Phase 20 implementation scope.
