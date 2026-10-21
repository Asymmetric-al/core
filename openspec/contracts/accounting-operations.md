# accounting-operations normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-4e7ae345f72be2380cc3"></a>

## D20 Settlement Is Local-currency-first With Proof-gated Retained-currency Lanes

<!-- BEGIN CONTRACT {"id":"4e7ae345f72be2380cc3","name":"D20 Settlement Is Local-currency-first With Proof-gated Retained-currency Lanes"} -->

Phase 20 MUST preserve donor presentment currency, source transaction currency,
Stripe balance or settlement currency, payout currency, QBO home or Xero base
currency, and reporting currency as independent roles.

The ordinary lane MUST be quiet local/home-currency settlement from exact
account-scoped Stripe Balance Transaction facts only when the pinned Stripe
settlement currency, payout bank-account currency, and destination's certified
QBO HomeCurrency or Xero BaseCurrency are identical. It MUST preserve source
presentment and exact provider conversion evidence, including gross, fee, net,
provider rate or converted amounts when supplied, source identifiers, and
observation time. It MUST NOT infer a rate from mutable balances or use a net
payout as posting truth.

Every Canonical Accounting Effect, Accounting Release, Provider Delivery Plan,
Accounting Delivery Package, Expected Bank Arrival, Bank Match, and Processor
Cost Attribution Manifest MUST have exactly one currency. Cross-currency
translation, revaluation, realized or unrealized FX, and provider-ledger FX
treatment MUST remain QBO/Xero authority.

A retained foreign-settlement-currency lane MUST be opt-in, prospective, and
proof-gated across Stripe account, currency, matching bank destination, QBO or
Xero multicurrency capability, Carrier Plan, package/direct lane, and current
execution evidence. QBO or Xero MUST own translation, revaluation, realized or
unrealized FX, and final books treatment. Capability loss MUST block new
affected releases without rewriting history.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d1d7d5cfc4ec137441db"></a>

## D4 Each Release Couples Typed Posting Intent To One Balanced Canonical Effect

<!-- BEGIN CONTRACT {"id":"d1d7d5cfc4ec137441db","name":"D4 Each Release Couples Typed Posting Intent To One Balanced Canonical Effect"} -->

Every Accounting Release MUST combine one typed **Accounting Posting Intent**
with one exact provider-neutral **Canonical Accounting Effect**. They MUST be
inseparable views of one release authority.

The Posting Intent MUST freeze exact source identity and version, tenant, Legal
Entity, source family, economic purpose, currency and amount scale, civil and
accounting date basis, economic-event date, resolved accounting date and
period, source eligibility and exclusion evidence, semantic accounting-policy
identity, version, and digest, posting-owner interval, source-set digest,
deterministic input ordering, and correction lineage. The release MUST also pin
the exact builder, mapping, Posting Profile, compiler, adapter, and allocation-
algorithm versions used at their respective boundaries.

The Canonical Accounting Effect MUST contain integer-minor-unit or declared-
scale lines in exactly one currency. Every line MUST have a stable identifier
and ordinal, one closed account role, bounded semantic dimensions, and either
one positive debit or one positive credit but never both. Debits MUST equal
credits exactly. The effect MUST have deterministic canonical serialization
and a digest that is byte-equivalent for identical frozen inputs and governing
versions.

Contribution versus exchange activity, conditional versus unconditional
support, donor restriction versus internal Designation, and natural versus
functional expense MUST remain separate semantic concepts. No policy, profile,
mapping, carrier, compiler, or provider adapter may silently collapse one into
another.

An authorized accountant or finance authority MUST confirm prospective
semantic accounting-policy versions. Phase 20 MAY enforce mechanics and
source coverage but MUST NOT claim GAAP certification, determine materiality,
or replace accountant judgment. Provider compilers MUST prove effect
equivalence and MUST NOT invent accounting treatment.

Staff review MUST use one progressive surface in this order: **What
happened**, **How it will be recorded**, and an explicitly unsent
**QuickBooks/Xero preview**. Clean proved rows MAY remain collapsed; grouped
exceptions MUST retain their exact cause and owning authority.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-09e2ea65ce7a729a3faf"></a>

## D12 Tenants Control Release Cadence Through One Atomic Readiness Fence

<!-- BEGIN CONTRACT {"id":"09e2ea65ce7a729a3faf","name":"D12 Tenants Control Release Cadence Through One Atomic Readiness Fence"} -->

Each tenant, Legal Entity, Accounting Destination, delivery lane, and Posting
Intent family MAY have one prospective, immutable **Accounting Release Cadence
Policy Version** with one explicit IANA timezone. It MUST support three goal-
based modes: automatically release eligible routine work, prepare on a bounded
schedule for staff review, or wait for staff release.

Supported timing presets MUST be limited to when-ready, weekday, weekly, or
monthly on day 1 through 28 or the last calendar day. Arbitrary cron and tenant-
authored readiness rules MUST NOT be supported. A repeated daylight-saving
local time MUST execute once; a nonexistent local time MUST execute at the
first valid instant after the gap; and missed occurrences MUST coalesce into
one current readiness evaluation.

New direct Accounting Destination Connections MUST begin review-first. Cadence-
configuration and release authority MUST be separate capabilities, even when
one staff member holds both. Destination replacement MUST prospectively retire
the old destination's cadence without changing frozen releases.

Timing and review are tenant choices. Readiness, source coverage, accounting
treatment, period policy, mapping, destination, capability, cutover ownership,
exceptions, balance, and immutable-release rules MUST NOT be configurable
bypasses.

A Release Candidate MUST remain derived and recomputable. Every mode MUST enter
the same atomic release fence. Revalidation MAY remove changed units but MUST
NOT silently add new units to a reviewed set. **Pause upcoming releases** MUST
affect only later fences; **Release now** MUST not bypass a gate. Bulk release
MAY return exact mixed results without treating the bulk request as one
provider transaction.

The rebuildable, permission-filtered **Release Horizon** MUST group work as
**Needs attention**, **Ready for review**, **Scheduled or automatic**, and
**Recently released**. Cadence Execution Evidence MUST preserve occurrence
identity, policy version, reviewed selection when present, source digests,
exclusions, pause/resume evidence, created releases, and provider correlations
without copying donor PII.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-385c672e21a52516f732"></a>

## D7 QBO Carrier Plans Are Tenant-owned Capability-certified And Effect-preserving

<!-- BEGIN CONTRACT {"id":"385c672e21a52516f732","name":"D7 QBO Carrier Plans Are Tenant-owned Capability-certified And Effect-preserving"} -->

Each QBO Accounting Destination MUST use one immutable, prospective, tenant-
owned **QBO Carrier Plan**. It MUST bind only supported semantic roles to
certified QBO carrier kinds and exact positions in the active provider-native
recipe.

The plan MAY support guided combinations of Accounts and subaccounts,
Products/Services, Classes, Locations, Customers, and Projects when their
actual QBO meanings, subscription, preferences, capacity, transaction
positions, and report visibility are proved. It MUST NOT declare these carrier
kinds interchangeable or require one universal nonprofit setup.

Carrier collisions, duplicate semantic meaning, unsupported transaction
positions, inactive objects, and effect-changing gaps MUST be hard blockers.
Bounded reporting limitations that preserve the accounting effect MAY be
tenant-confirmable warnings with exact disclosure. Activation MUST create a
Capability Certificate and reporting-coverage record, and direct delivery
MUST use operation-granular idempotency, exact readback, and drift detection.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-fd4cc1aa483445234021"></a>

## D2 Accounting Releases Are Immutable And Use One Exclusive Delivery Lane With Evidence Always

<!-- BEGIN CONTRACT {"id":"fd4cc1aa483445234021","name":"D2 Accounting Releases Are Immutable And Use One Exclusive Delivery Lane With Evidence Always"} -->

Every Accounting Release MUST freeze exact source coverage, one Accounting
Posting Intent, one balanced Canonical Accounting Effect, governing version
pins, one Accounting Destination Connection, one Provider Delivery Plan, and
one exclusive delivery lane. A release MUST never change after creation.

Every release MUST create one logical, immutable, human-inspectable and
machine-verifiable **Accounting Evidence Artifact**, regardless of delivery
lane. Its identity, manifest, schema and version, digests, lineage, control
totals, outcomes, hold state, disposal evidence, and tombstone MUST remain
append-only. Protected payload bytes MUST follow purpose-owned retention,
legal/privacy holds, and audited staged disposal; byte disposal MUST NOT
rewrite the release or surviving evidence record. The artifact proves release
meaning, balance, lineage, and control totals; it does not claim provider
import or reconciliation.

The release fence MUST be one short database transaction that reauthorizes and
revalidates the frozen graph, writes the immutable release and transactional
outbox admissions, and then commits. It MUST NOT perform source or provider
network I/O, generate artifact bytes, or call a queue. Those effects begin only
after commit.

Direct QBO/Xero delivery and staff-mediated provider import MUST be mutually
exclusive for one release. Delivery, provider acceptance, exact readback,
staff-reported import, verification, drift, Bank Match, and final
reconciliation MUST remain separate evidence axes. Unknown provider outcomes
MUST block blind replay.

The original release and its selected lane MUST remain immutable. A separately
identified, lineage-linked recovery successor MAY select another currently
certified lane only for the exact units positively proved neither delivered nor
imported and only when duplicate-prevention proof is complete. An unknown,
partial, or merely staff-assumed outcome MUST NOT authorize a cross-lane
successor.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3a0f2b8fd724bebf55f2"></a>

## D15 Direct-delivery Capacity Is Workload-shaped Certified Fair And Recovery-safe

<!-- BEGIN CONTRACT {"id":"3a0f2b8fd724bebf55f2","name":"D15 Direct-delivery Capacity Is Workload-shaped Certified Fair And Recovery-safe"} -->

Direct delivery MUST be admitted from the exact immutable Provider Delivery
Plan. A destination Capability Certificate MUST prove current organization-
specific capabilities, while one versioned **Certified Execution Envelope**
MUST prove the operation, line, byte, batch, latency, readback, and recovery
shapes Asym has actually tested for the provider contract, adapter, recipe, and
environment.

Live provider quota, health, commercial headroom, and tenant-fair queue
position MUST remain observations rather than certificate truth. Work outside
the certified structural envelope MUST NOT enter direct delivery. Before
release, staff MAY choose only a permitted profile, grouping, or certified
artifact lane. A frozen release MUST NOT change grain, destination, or lane to
fit capacity.

Scheduling MUST be provider-native, tenant-fair, and preserve protected
capacity for exact readback and ambiguous-outcome recovery. Staff MUST receive
calibrated range-based timing and truthful progress without tenant-configured
rate, concurrency, priority, or retry knobs.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-cabd77096a1d14ae3989"></a>

## D19 Processor Costs Default Organization-borne With One Fee-cover-first Fund Mode

<!-- BEGIN CONTRACT {"id":"cabd77096a1d14ae3989","name":"D19 Processor Costs Default Organization-borne With One Fee-cover-first Fund Mode"} -->

Processor costs MUST be organization-borne by default. A tenant MAY
prospectively activate one **fee-cover-first designation-borne uncovered-cost
mode** for an exact tenant, Legal Entity, Settlement Account Binding, source
family, and complete settlement-boundary interval.

Gross supported gift, separate donor fee-cover contribution, exact provider
cost, provider settlement, and any later Field Account effect MUST remain
independent authoritative amounts. Fee-cover MUST apply first to eligible
ordinary processor cost. Only the remaining uncovered eligible cost MAY be
allocated across the original supported Designations when the exact provider
cost and every frozen source Designation allocation share one proved currency
basis. Allocation MUST use integer minor units, deterministic largest
remainder with stable tie-breaking, and one immutable **Processor Cost
Attribution Manifest**. A local-settlement fee MUST NOT be prorated across
foreign-currency source lines.

A prospective Designation exception MAY keep that Designation's calculated
share organization-borne; it MUST NOT redistribute the share to other
Designations. Dispute, FX, payout, reserve, platform, tax, standalone, unknown,
and source-unlinked costs MUST not enter this allocator. Refunds and fee returns
MUST create source-linked compensating occurrences. Ineligible or currency-
incompatible costs MUST remain organization-borne through the configured
central processor-expense target; when that role or mapping is missing, the
affected work MUST remain not ready. QBO/Xero output MUST preserve gross
revenue, complete expense, and required reporting dimensions.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9e276a22f1c5b6af3536"></a>

## D6 Every Source Allocation Resolves Exactly Once Through Exact Or Proved Grouped Mapping

<!-- BEGIN CONTRACT {"id":"9e276a22f1c5b6af3536","name":"D6 Every Source Allocation Resolves Exactly Once Through Exact Or Proved Grouped Mapping"} -->

Every included source-owned Designation allocation MUST resolve exactly once
under one immutable, effective-dated **Designation Mapping Version** to one
provider-neutral **Accounting Reporting Target** or to one explicitly permitted
evidence-only disposition.

Source Designations, Accounting Reporting Targets, semantic roles, and
provider carrier objects MUST remain distinct meanings. Exact mapping MUST be
available. Grouped mapping MAY be used only when a non-recursive, complete,
unambiguous rule and **Mapping Coverage Manifest** prove every included source
allocation's result. Blank fallthrough, recursive groups, provider-name
matching, and silent `Other` targets MUST be forbidden.

Provider bindings MUST be typed and prospective. Archived, merged, duplicated,
or materially changed provider objects MUST cause drift review rather than
silent remapping. Provider-object provisioning, when later supported, MUST be
explicit, idempotent, and separately authorized.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d491adab454c205c9e31"></a>

## D17 Posting Ownership Transfers At One Proved Source-family Boundary

<!-- BEGIN CONTRACT {"id":"d491adab454c205c9e31","name":"D17 Posting Ownership Transfers At One Proved Source-family Boundary"} -->

Exactly one system MUST own provider posting for one canonical source
occurrence, tenant, Legal Entity, accounting destination, source account or
instrument, Accounting Posting Intent family, and source-authoritative
ownership interval.

One immutable **Posting Ownership Cutover** MUST transfer authority
prospectively at a complete source-family boundary. It MUST record exact half-
open ownership intervals and MUST NOT split an atomic payout, Deposit Group,
expense, obligation, payment, or other source occurrence merely because a date
crosses the selected boundary.

One **Cutover Coverage Manifest** MUST distinguish previous-owner coverage,
exact previous-owner provider evidence, proved-unposted gaps, prospective Asym
ownership, intentional exclusions, and ambiguity. Clean forward-only
activation at the next drained boundary MUST be the default. Optional history
MUST be off by default and limited to exact positively proved gaps. Overlap or
ambiguity MUST quarantine only affected unreleased work. Previous-owner
evidence MUST retain its provenance.

A final bounded pre-activation inspection and bounded post-activation overlap
monitor MUST detect and quarantine every conflict visible through the
capability-labelled certified inspection surface. The product MAY state only
**No known overlap found in the inspected scope**; it MUST disclose that
unobservable manual or independent-connector writes remain possible because
Asym cannot lock another writer. A detected conflict MUST quarantine only
affected unreleased or corrective work without rewriting provider evidence or
the cutover interval.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-cf15666ac17a7aff5a87"></a>

## D1 One Accounting Doorway Coordinates Bounded Contexts Without Merging Truth

<!-- BEGIN CONTRACT {"id":"cf15666ac17a7aff5a87","name":"D1 One Accounting Doorway Coordinates Bounded Contexts Without Merging Truth"} -->

The product MUST expose one tenant-, actor-, environment-, and Legal-Entity-
scoped Accounting Operations boundary and one derived **Ready for Accounting**
workspace for settlement evidence, Bank Match, Accounting Releases, QBO/Xero
delivery, packages, and accounting exceptions.

Source domains MUST remain authoritative for canonical gifts, allocations,
offline batches, corrections, expenses, reimbursements, and Field Account
facts. Stripe MUST remain authoritative for processor evidence; the bank for
posted bank evidence; and QBO or Xero for provider-native accounting objects,
period locks, final books reconciliation, and the tenant's books. Phase 20 MUST
label and retain each authority rather than collapsing them into one financial
status.

Each source-purpose family MUST remain structurally dark until its exact
predecessor-owned occurrence and version contract exists: Phase 13 for posted
contribution and ledger facts, Phase 14 for admitted credit-owned adjustments,
Phase 15 for frozen offline Deposit Groups and canonical noncash asset-lot and
disposition source facts, and Phase 21 for approved expense and payment
handoffs. Phase 13 MUST remain authoritative for the original noncash
Contribution and donor-facing truth; Phase 14 recognition credit MUST NOT be
treated as disposition or proceeds truth. Phase 21 D5 support-reallocation
work, including a
close-covered occurrence, MUST remain unsupported and structurally dark in this
generation until a later separately approved Phase 20 change certifies its
exact source schema, accountant-confirmed semantics, Posting Profile recipe,
and D17 owner. One unavailable predecessor MUST keep only its dependent family
dark; it MUST NOT block unrelated certified families or be bypassed through a
compatibility shim or direct table coupling.

Phase 21 D20 organization-support-cost observations, economic roots, bearing
policies, applications, determinations, manifests, carryforwards, Field Account
Funding Coverage, closed effects, and the **Support Cost Accounting Candidate
Handoff** MUST remain unsupported and structurally dark in this generation.
They MUST NOT create a D18 source, Accounting Posting Intent, Accounting
Release, delivery artifact, or provider operation. Phase 20 D19 MUST remain the
exclusive processor-cost attribution and treatment lane; D20 MUST NOT re-admit
or duplicate an exact provider cost or Processor Cost Attribution Manifest. A
later Phase 20 change MUST separately certify the exact D20 source schema,
accountant-confirmed semantics, close-covered occurrence contract, compatible
Posting Profile recipe, positive unposted or differential proof, and D17
posting owner before admission. No exceptional JournalEntry, ManualJournal,
expense-lane, or artifact fallback MAY bypass that gate.

Phase 15 noncash disposition projections and Phase 21 D21 Noncash Support
Realization Manifests, Realized Support Basis, cost-treatment selections,
D2/D11 close-covered Field Account effects, and corrections MUST remain
unsupported and structurally dark in this generation. They MUST NOT create a
D18 source, Accounting Posting Intent, Canonical Accounting Effect, Accounting
Release, delivery artifact, provider operation, Expected Bank Arrival, or Bank
Match. A later Phase 20 change MUST separately certify exactly one canonical
economic source, exact schema, accountant-confirmed semantics, non-overlapping
coverage, compatible Posting Profile recipe, positive unposted or differential
proof, and D17 posting owner. It MUST prove that the Phase 15 disposition and
the derivative D21 Field Account effect cannot both post for the same economic
coverage. Brokerage, liquidation, appraisal, valuation, custody, transfer,
sale, and other noncash-disposition costs MUST NOT enter Phase 20 D19 or Phase
21 D20. No JournalEntry, ManualJournal, expense-lane, artifact, or adapter
fallback MAY bypass these gates. QBO/Xero and the tenant's accountant MUST
remain authoritative for asset derecognition, gain/loss, cash, fees, accounting
periods, books, and final reconciliation.

Phase 21 D22 prospective-authorization postures, requests, private evidence
references, Governance Resolutions, Approval Assignment Snapshots, Review
Actions, Organization Authorization Decisions, compatible Field Account
capacity reservations, later-claim Authorization Coverage, unused-scope
declarations, in-flight residuals, successors, and corrections MUST remain
unsupported and structurally dark. Phase 20 MUST reject them before D18 source
admission and MUST NOT create an Accounting Posting Intent, Canonical
Accounting Effect, Accounting Release, delivery artifact, provider operation,
Expected Bank Arrival, Bank Match, or QBO/Xero object from them. Only an
independently qualified later D10/D13 Approved Expense Snapshot,
Reimbursement Obligation, source-qualified External Payment Occurrence, or
other already certified economic source MAY enter its exact lane. No
JournalEntry, ManualJournal, expense-lane, artifact, staff-mediated, or adapter
fallback MAY treat prospective approval or reservation as incurrence,
substantiation, policy eligibility, obligation, payment, posting, or
reconciliation.

Phase 21 D23 Expense Field Account Effect Recognition Profiles, Effect Bases,
Field Account Funding Coverage and Dispositions, Effect Coverage, operational
Expense Field Account Effects, Support Cycle inclusion/through dates,
qualification exceptions, and corrections MUST remain unsupported and
structurally dark. They express operational support-balance timing only. Phase
20 MUST reject them before D18 admission and MUST NOT create, select, date,
modify, release, deliver, redeliver, or reconcile an Accounting Posting Intent,
Canonical Accounting Effect, Accounting Release, artifact, provider operation,
Expected Bank Arrival, Bank Match, or QBO/Xero object from them. Only an
independently certified approved expense, obligation, source-final
organization-paid occurrence, payment occurrence, or correction MAY enter its
own closed source lane with exact D17 ownership and without inheriting D23 mode,
effect identity, close, or date.

Phase 21 D24 Expense Collaboration Assignment Versions, invitations and
acceptance, Evidence Access Projection Versions, Claimant Confirmations or
admitted external attestations, helper actions, and actor provenance MUST
remain unsupported and structurally dark. Phase 20 MUST reject them before D18
source admission. They MUST NOT replace Phase 12 authorization or establish
incurrence, substantiation, approval, obligation, payment, Field Account
effect, posting, or reconciliation. Only an independently qualified expense
source MAY enter its existing lane, and minimum necessary D24 actor provenance
MAY accompany it only as non-authoritative lineage.

Phase 21 D25 Expense Claim Resolution Cause Contract Versions, Cases,
Occurrences, Projections, Downstream Impact Manifests and dispositions,
coordination tasks/messages/responses, source-owner requests, and case-
completion proofs MUST remain unsupported and structurally dark. Phase 20 MUST
reject them before D18 admission and MUST NOT create, select, date, modify,
release, deliver, redeliver, or reconcile a Posting Intent, Canonical
Accounting Effect, Accounting Release, artifact, provider operation, Expected
Bank Arrival, Bank Match, or QBO/Xero object from them. Only an independently
authoritative source correction MAY enter its existing lane. D25 correlation
MAY remain opaque non-authoritative lineage but MUST NOT select accounting
treatment or period, clear an Accounting Exception Case, or prove provider
acceptance, posting, or reconciliation.

Routes, jobs, UI, notifications, and provider adapters MUST call the same
Accounting Operations service. They MUST NOT reproduce accounting rules,
derive Legal Entity from a mutable default, or turn a UI projection into
lifecycle truth. The ordinary workspace MUST remain quiet and exception-first
while allowing staff to inspect every source and handoff independently.

Every job, callback, scheduled cadence, synchronization, and recovery command
MUST execute as a registered, auditable, purpose-scoped non-human principal
with one Tenant, permitted Legal Entities and destinations, least-privilege
capabilities, and a current human owner whose live capability ceiling is
reauthorized at execution time. A shared service-role credential MUST NOT be
treated as an actor, synthesize a human identity, or bypass the shared policy
resolver.

Critical finance journeys MUST conform to WCAG 2.2 AA. Setup, review, release,
package, reconnect, and exception workflows MUST support complete keyboard
operation; meaningful screen-reader names, relationships, and state; visible
and unobscured focus; programmatically associated errors; text-and-icon status
rather than color alone; 200% zoom and reflow without two-dimensional
scrolling; forced-colors and reduced-motion preferences; and long-locale and
right-to-left layouts.

For a clean tenant with one Legal Entity and ordinary local-currency
accounting, the recommended setup and release path MUST omit redundant
selectors, keep advanced controls behind progressive disclosure, present the
one exception-owned next action when intervention is required, and avoid
needless confirmation steps for reversible or non-destructive actions.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-acf32ebb658891d09873"></a>

## D3 Every Financial Handoff Pins One Canonical Legal Entity

<!-- BEGIN CONTRACT {"id":"acf32ebb658891d09873","name":"D3 Every Financial Handoff Pins One Canonical Legal Entity"} -->

One canonical **Legal Entity** MUST be the enduring legal and financial
identity beneath a Tenant. Legal Issuer, merchant, settlement owner, receipt
issuer, and accounting owner MUST be roles or profiles of that identity rather
than parallel identities.

Every independently authoritative financial root, policy, mapping, evidence
record, Bank Match, Accounting Release, package, provider operation, and
cutover MUST store an explicit tenant and Legal Entity. Legal Entity scope MUST
only narrow its Tenant; it MUST never widen access. A mutable tenant, Site,
Designation, processor account, or provider name MUST NOT supply historical
ownership.

A Settlement Account Binding, bank-evidence connection, and Accounting
Destination Connection MUST be separate purpose-owned records. Multi-entity
activation MUST be prospective and proof-gated. The sole Legal Entity MAY be
visually quiet for a one-entity tenant, but persisted scope and authorization
MUST remain explicit.

An active production Accounting Destination MUST be globally unique by
provider, environment, and stable provider organization identifier. A
conflict MUST fail closed without revealing another Tenant. One production
destination MUST NOT be active for more than one Legal Entity in direct-
delivery mode.

Multi-entity activation MUST remain unavailable until every enabled upstream
financial writer, callback router, document or statement authority, expense
handoff, release path, artifact path, and provider operation proves exact Legal
Entity attribution. The proof MUST be capability-specific and prospective; it
MUST NOT retrofit or repartition earlier work.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a821a83eeacd9c92813f"></a>

## D14 Provider Authorization Is Destination-pinned Encrypted And Prospectively Replaceable

<!-- BEGIN CONTRACT {"id":"a821a83eeacd9c92813f","name":"D14 Provider Authorization Is Destination-pinned Encrypted And Prospectively Replaceable"} -->

Phase 20 MUST separate encrypted **Provider Authorization Grants** from stable,
tenant- and Legal-Entity-scoped **Accounting Destination Connections**. Every
provider operation MUST pin the exact QBO `realmId` or Xero `tenantId`,
environment, destination connection, and applicable grant generation.

OAuth attempts MUST be short-lived, single-use, server-correlated, and use
provider-required security controls. Callbacks MUST NOT infer tenant, Legal
Entity, or destination from untrusted provider names or browser fields.
Credential rotation MUST be serialized and fence stale workers.

Reconnect MAY repair only the same proved external organization. A different
organization MUST require explicit prospective destination replacement.
Disconnect MUST quarantine new direct work locally before remote revocation and
use the least provider-supported blast radius. Because a Xero grant can cover
several organizations, shared-grant impact MUST be disclosed and contained.
Certified artifact delivery MUST remain available during direct-connection
outages when safe.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-216f9243a36d5f7f6546"></a>

## D11 Released Accounting Is Corrected Only With Policy-permitted Compensating Releases

<!-- BEGIN CONTRACT {"id":"216f9243a36d5f7f6546","name":"D11 Released Accounting Is Corrected Only With Policy-permitted Compensating Releases"} -->

An Accounting Release that has crossed its release fence MUST never reopen or
mutate. A later source-owned correction MUST create a new signed source effect
and, when accounting action is required, one source- and cause-linked
**Compensating Accounting Release**.

One immutable, prospective, accountant-confirmed **Correction Posting Policy
Version** MUST define permitted treatments and posting periods. Source-
effective, discovery, accounting-effective, and provider-posting dates MUST be
preserved independently. Staff MAY choose only a currently permitted
treatment; Asym MUST NOT silently backdate, choose a period, change provider
locks, store a close password, determine materiality, or prepare a restatement.

The closed **Correction Cause** catalog MUST contain exactly: subsequent
economic event; source fact correction; accounting policy or mapping
correction; delivery duplicate or omission; provider record drift; and
potential prior-period error. Potential prior-period error MUST always remain
accountant-owned. When policy permits exactly one treatment and period, the
product MUST recommend it quietly. When several are permitted, authorized
staff MUST choose only among them and MUST record a concise reason when
departing from the recommendation. When none is permitted, delivery MUST
remain blocked.

QBO and Xero delivery MUST use the active provider-native recipe, operation-
granular idempotency, read-before-retry after ambiguity, exact readback, and
drift detection. A locked or provider-rejected period MUST remain accountant-
owned exception work.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a49663017769c15224d1"></a>

## Phase 21 D17 Opening Authority Remains Accounting-dark

<!-- BEGIN CONTRACT {"id":"a49663017769c15224d1","name":"Phase 21 D17 Opening Authority Remains Accounting-dark"} -->

Phase 21 Opening Source Packages, Opening Coverage Manifests, Field Account
Opening Positions, imported exact or reference history, staging generations,
Field Account Operational Cutovers, and their import or activation statuses
MUST remain outside Phase 20 accounting admission. None of those records MUST
create or imply an Accounting Posting Intent, Canonical Accounting Effect,
Accounting Release, Provider Delivery Plan or operation, Expected Bank Arrival,
Bank Match, posted-book result, or accounting gap.

Phase 21 D17 and Phase 20 D17 half-open boundaries MUST remain independently
authoritative even when a tenant intentionally aligns their timestamps. A
Phase 21 Opening Position MUST NOT assign Phase 20 posting ownership or prove
that prior books lack an entry. Only a separately source-qualified economic
occurrence that an accountant-certified Phase 20 contract positively proves
unposted MAY enter Phase 20 D17 gap-only backfill. Previous-owner QBO/Xero or
other provider evidence MUST retain its original provenance and MUST NOT be
rewritten as Asym delivery.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e9a9f7d0712ff3e20eac"></a>

## D10 Bank Match Is Bounded And Source-labelled While QBO Or Xero Retains Final Reconciliation

<!-- BEGIN CONTRACT {"id":"e9a9f7d0712ff3e20eac","name":"D10 Bank Match Is Bounded And Source-labelled While QBO Or Xero Retains Final Reconciliation"} -->

Phase 20 MUST derive immutable **Expected Bank Arrivals** from supported
processor transfers and posted offline Deposit Groups without promoting them to
bank truth. It MUST record posted **Bank Evidence Observations** with exact
source lane and provenance from reviewed statement import, optional certified
read-only connection, or explicit staff-confirmed evidence.

A **Bank Match** MAY allocate one-to-one, many-to-one, one-to-many, or partially
between expectations and observations only within one tenant, Legal Entity,
bank-account binding, currency, direction, and posted-state scope. Integer-
minor-unit conservation, no over-allocation, and no double consumption MUST be
enforced.

Deterministic automation MAY confirm only an exact unambiguous match under a
versioned policy. Similar amount, date, description, or reference MAY rank
candidates but MUST NOT silently prove a match. Pending, ambiguous, stale,
changed, removed, or residual evidence MUST remain visible. Bank Match MUST
never claim QBO/Xero bank reconciliation or period close.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-60d2a74b38849ea795b1"></a>

## D5 Posting Profiles Are Bounded Goal-led Provider-native And Prospective

<!-- BEGIN CONTRACT {"id":"60d2a74b38849ea795b1","name":"D5 Posting Profiles Are Bounded Goal-led Provider-native And Prospective"} -->

Each configured Legal Entity and Accounting Destination MUST have exactly one
active, prospective, versioned **Posting Profile bundle** before source-purpose
work can be admitted. An unconfigured pair MAY have no active bundle, but it
MUST admit no work. The bundle MUST contain exactly one certified
provider-native recipe and permitted grain for each supported source-purpose
family:

- online processor settlement;
- offline Deposit Group;
- cleared paid expense;
- genuine unpaid obligation;
- correction or reversal derived from the original recipe; and
- exceptional accountant adjustment.

The guided defaults MUST be fund summary for online processor settlement, gift
detail for offline Deposit Groups, and approved-line detail for approved
expenses. Staff MAY select another certified grain only when the exact
destination capability and current Certified Execution Envelope prove it safe.
An exceptional accountant adjustment MAY use QBO `JournalEntry` or Xero
`ManualJournal`; those resources MUST NOT be a fallback for another unsupported
or failed source-purpose recipe.

Posting Profiles MUST control provider representation and detail only. They
MUST NOT change source facts, accounting recognition, Canonical Accounting
Effects, mapping truth, dates, currencies, restrictions, or delivery evidence.
Asym MUST own and certify the bounded provider-native recipes; tenants MUST NOT
author executable accounting code or arbitrary field rules.

Activation MUST validate destination capabilities, mappings, Carrier Plans,
volume shape, report visibility, and posting ownership. Profile versions MUST
be immutable and prospective, and released work MUST remain pinned to its
effective version.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-5b3d4b81c7001a2c75fd"></a>

## D16 Staff-mediated Delivery Uses Capability-certified Immutable Packages

<!-- BEGIN CONTRACT {"id":"5b3d4b81c7001a2c75fd","name":"D16 Staff-mediated Delivery Uses Capability-certified Immutable Packages"} -->

The staff-mediated lane MUST produce one immutable **Accounting Delivery
Package** from the exact frozen Provider Delivery Plan. It MUST pin tenant,
Legal Entity, destination, lane, currency, accounting date, source coverage,
governing versions, compiler, provider contract, and exact control totals.

A package MAY become **Ready to import** only while its exact destination is
not quarantined and both its destination Capability Certificate and narrow
**Import Surface Conformance Record** are current and unquarantined for the
exact provider, region, subscription capability, importer, template,
serializer, limits, and recovery behavior. Unsupported plans MUST fail closed;
the product MUST NOT emit a generic CSV, fabricated bank statement, manual-
journal substitution, or lossy fallback.

The UI MUST separate review, download, provider staging or draft, finalization,
exact readback, mismatch, drift, and final reconciliation. While retained,
re-download MUST return identical bytes. Historical byte availability MUST
remain distinct from current import readiness. Package bytes MUST follow the
artifact retention, hold, and disposal contract; disposed bytes MUST be
reported unavailable and MUST NOT be regenerated. Re-import MUST never be
described as retry. Partial or unknown outcomes MUST use a cause-owned
exception, and a recovery package MUST contain only exact work proved not
imported.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-227f6c1865040f9e67ec"></a>

## D13 Accounting Exception Cases Own Causes And Share Follow-up Without Sharing Truth

<!-- BEGIN CONTRACT {"id":"227f6c1865040f9e67ec","name":"D13 Accounting Exception Cases Own Causes And Share Follow-up Without Sharing Truth"} -->

Phase 20 MUST own one **Accounting Exception Case** for each versioned,
contract-defined root-cause occurrence. The case MUST store exact tenant and
Legal Entity scope, cause, blocked radius, evidence, lifecycle, and proof needed
to clear. Unrelated clean work MUST continue.

Detection MUST be idempotent. A case MUST clear only when its cause-specific
contract proves the condition no longer exists. Recurrence after resolution
MUST create a linked successor rather than rewrite history. Staff suppression,
dismissal, or generic task state MUST NOT change the accounting cause.

Human assignment and collaboration MUST reuse the shared Mission Control task
model through an idempotent, outbox-reconcilable link. Mission Control owns
assignees, comments, due dates, reminders, and follow-up status only. Bulk
actions MUST be limited to homogeneous, revalidated cases and return exact
item results.

Where a versioned Exception Contract permits it, an authorized **Handled
outside Asym** outcome MUST capture typed external evidence. **Record handled
in QuickBooks/Xero** MUST capture the exact provider reference or explicit
staff attestation and attempt exact readback when capability permits. External
handling MUST NOT be relabelled as Asym delivery or clear the case without the
cause contract's required proof.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a9214583177fd225518a"></a>

## D9 Processor Settlement Evidence Is Source-authoritative And Mode-honest

<!-- BEGIN CONTRACT {"id":"a9214583177fd225518a","name":"D9 Processor Settlement Evidence Is Source-authoritative And Mode-honest"} -->

Phase 20 MUST persist source-labelled Stripe Balance Transactions, fees,
refunds, disputes, transfers, currencies, and payout evidence through
idempotent webhook ingestion plus scheduled pagination and repair.

One normalized **Settlement Evidence Snapshot** MUST use exactly one truthful
mode. **Payout-attributed evidence** MAY be used only when Stripe supports
exact membership, marks composition complete, and every page has been
retrieved and verified. **Balance-window evidence** MUST preserve one bounded,
contiguous account, mode, balance type, currency, and interval when exact
membership is unavailable; it MUST NOT claim which transactions composed a
transfer.

Every immutable Settlement Component MUST preserve its provider `amount`,
`fee`, `net`, currency, classification, source reference, account, environment,
balance type, source times, and raw-evidence digest. The payout balance debit
MUST be retrieved and tracked separately as the provider-owned **Processor
Payout Transfer** movement; it MUST NOT be treated as another contribution,
fee, or fund expense. Composition MUST prove the provider amount/fee/net
equation and MUST NOT subtract an embedded or separately represented fee
twice.

Unknown, newly introduced, repeated, or double-represented provider types and
reporting categories MUST remain immutable source-labelled classification
exceptions. They MUST NOT be dropped, guessed, mapped to `Other` or suspense,
allocated to a Designation, or admitted into dependent Accounting Releases
until the exact classification contract resolves them.

Processor payout transfer state, Bank Match, source coverage, Accounting
Release delivery, and provider reconciliation MUST remain independently
authoritative lifecycle axes. Missing or changed provider evidence MUST use
append-only repair and supersession.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b4eafb6af0837281c2e4"></a>

## D18 Expense Accounting Consumes One PII-minimized Source-owned Approved Handoff

<!-- BEGIN CONTRACT {"id":"b4eafb6af0837281c2e4","name":"D18 Expense Accounting Consumes One PII-minimized Source-owned Approved Handoff"} -->

Phase 21 MUST own expense reports, receipt evidence, substantiation, policy
decisions, immutable **Approved Expense Snapshots**, Reimbursement Obligations,
Field Account Funding Coverage, Field Account effects, and immutable
source-owned evidence of External Payment Occurrences. The tenant's
payroll, accounts-payable, or authorized manual payment process MUST remain
authoritative for payment execution and provider-native status. Phase 20 MUST
accept expense accounting only through one tenant-, Legal-Entity-,
source-version-, and posting-owner-pinned **Accounting-Ready Expense Handoff**
with an explicit closed source-family discriminator. Snapshot-rooted and
payment-rooted families MUST preserve their D18 lineage, while D16 families
MUST preserve the exact source root and predecessor coverage required by their
independently certified contract.

When the admitted Phase 21 economic occurrence belongs to a Field Account,
the handoff MUST preserve exact Tenant, Legal Entity, Support Assignment,
Field Account, ISO currency, and source-coverage lineage. Support Assignment
identity locates the source only; it MUST NOT confer accounting approval,
posting intent, reporting carrier, or provider destination. Support Assignment
Participant Memberships, Phase 12 workspace access or grant inputs,
Party/household/team/leader relationships, invitations, operational
responsibility, notification preferences, communication outcomes, and the
`People & access` orchestration MUST remain accounting-dark. A change to any of
those records MUST NOT create, suppress, reroute, merge, split, or correct an
Accounting Posting Intent or Accounting Release and MUST NOT re-export or
deliver either one.

The handoff MUST minimize personal data and MUST exclude raw receipt images.
Its catalog MUST be closed to Cleared Organization-Paid Expense, Approved
Reimbursement Obligation, evidence-qualified Reimbursement Payment,
evidence-qualified Expense Advance Issuance Occurrence, separately certified
Expense Advance Application typed accounting effect where applicable, Claimant
Repayment Occurrence, and cause-linked corrections for admitted source
families.

Phase 21 D14 MUST retain Organization Card Sources, Organization Card Import
Profile Versions, Organization Card Activity File Assets and Import Manifests,
Organization Card Assignment Versions, raw or unresolved Transaction Evidence,
nonbusiness/personal portions, source-adjustment workflow, and import exceptions.
A source-final posted organization-card occurrence MAY project only the existing
Cleared Organization-Paid Expense occurrence, and only when its exact business
coverage is fully represented by one eligible Approved Expense Snapshot and the
D18 handoff preserves that frozen lineage. Pending rows, raw files, import
acceptance, card assignment, claimant tasks, personal portions, card-liability
payment, and issuer settlement MUST NOT create a Posting Intent, Accounting
Release, or additional occurrence family.

Phase 21 D15 MUST retain Reimbursement Handoff Packages, Reimbursement
Delivery Profile Versions, Reimbursement Execution Claims, Reimbursement
Handoff Coverage, Handoff Attestations, Reimbursement Handoff Operations,
provider draft/input acceptance and readback, operation ambiguity, and
residual-only handoff succession. Those objects MUST prove only their exact
artifact, release ownership, handoff, or provider-operation facts and MUST NOT
create an External Payment Occurrence, Accounting Posting Intent, or Accounting
Release. For the Phase 21 D15 reimbursement-handoff path, only an independently
eligible Approved Reimbursement Obligation or separately source-qualified
External Payment Occurrence MAY enter through that path.

Phase 21 D16 MUST retain Expense Advance Policy Versions, Claimant Repayment
Policy Versions, Expense Advance Authorization Versions, operational Expense
Settlement Determinations, Repayment Subject Determinations, Claimant Repayment
Decisions, uncertified Claimant Repayment Requirements, Advance Residual
Positions, tasks, raw Advance or Repayment Evidence Observations, disputes,
Repayment Restitution Reviews, and Field Account Funding Coverage. Those
objects MUST NOT create a Posting Intent. A Claimant Repayment Requirement MUST
remain accounting-dark unless a separately accountant-certified policy and
source contract recognizes the exact receivable, and such recognition MUST NOT
prove returned money. A cash claimant return and an expense advance return MUST
remain distinct typed occurrences. Their family MUST come from Phase 21's
immutable explicit source fact and MUST NOT be inferred from amount sign,
predecessor type, Requirement, memo, account, or posting recipe. Every admitted
D16 occurrence MUST independently resolve its D17 posting owner.

The Phase 21 D16 admission discriminator MUST be exactly one of
`phase21_d16.expense_advance_issuance@1`,
`phase21_d16.expense_advance_application_effect@1`,
`phase21_d16.cash_claimant_return@1`,
`phase21_d16.expense_advance_return@1`, or
`phase21_d16.cause_linked_correction@1`. Each value MUST preserve its exact
source root and source-family predecessor coverage. A cash-claimant-return
admission MUST preserve the exact Claimant Repayment Occurrence, complete
Claimant Repayment Coverage, and typed residual. An expense-advance-return
admission MUST additionally preserve the exact Expense Advance Issuance
Occurrence root and exact unused-advance coverage being returned. The correction value MUST name one
admitted Phase 21 D16 predecessor by its exact discriminator and source
identity/version and MUST carry the exact corrected coverage. It MUST NOT retag
one return family as the other; a genuine family reclassification requires an
append-only correction of the original and a newly admitted non-overlapping
occurrence under the correct discriminator. Unknown, unversioned, incomplete,
or multiply mapped values MUST fail closed, and these values MUST NOT be
interpreted as Phase 20 D16 Accounting Delivery Packages.

Phase 21 D22 MUST retain every prospective-authorization posture, request,
private evidence reference, Governance Resolution, operation-scoped Approval
Assignment Snapshot, Review Action, Authorization Decision, compatible
capacity reservation, later-claim Authorization Coverage, unused-scope
declaration, residual, successor, and correction. Those objects MUST fail
closed before D18 source admission and MUST NOT create or select an Accounting
Posting Intent, Accounting Release, posting owner, delivery artifact, provider
operation, Expected Bank Arrival, Bank Match, or QBO/Xero object. Exact D22
coverage MAY remain minimum source lineage on a separately qualified later
Approved Expense Snapshot, but it MUST NOT replace D10/D13 actual approval or
prove incurrence, substantiation, policy eligibility, obligation, payment,
posting, or reconciliation.

Phase 21 D23 MUST retain every Expense Field Account Effect Recognition
Profile, Expense Field Account Effect Basis, Field Account Funding Coverage and
Disposition, Expense Field Account Effect Coverage, operational Expense Field
Account Effect, Support Cycle inclusion/through date, qualification exception,
and correction. Those objects MUST fail closed before D18 source admission and
MUST NOT create or select an Accounting Posting Intent, Accounting Release,
posting owner, accounting-effective date, delivery artifact, provider
operation, Expected Bank Arrival, Bank Match, or QBO/Xero object. Minimum
necessary D23 lineage MAY remain non-authoritative provenance on an
independently qualified handoff, but that handoff MUST NOT inherit D23 mode,
profile, effect identity, qualification date, close, or through date.

Phase 21 D24 MUST retain every Expense Collaboration Assignment Version,
authority-free invitation and accepted helper principal, Evidence Access
Projection Version, Claimant Confirmation or admitted external attestation,
helper action, and exact actor-provenance record. Those objects MUST fail
closed before D18 source admission and MUST NOT create or select an Accounting
Posting Intent, Accounting Release, posting owner, delivery artifact, provider
operation, Expected Bank Arrival, Bank Match, or QBO/Xero object. Minimum
necessary D24 actor provenance MAY remain non-authoritative lineage on an
independently qualified handoff, but Phase 20 MUST NOT grant, revoke, expand,
satisfy, or rewrite assignment, consent, evidence-access, or helper authority.

Phase 21 D25 MUST retain every Expense Claim Resolution Cause Contract Version,
Case, Occurrence, Projection, Downstream Impact Manifest/disposition,
coordination task/message/response, source-owner request, and completion proof.
Those objects MUST fail closed before D18 source admission and MUST NOT create
or select an Accounting Posting Intent, Accounting Release, posting owner,
accounting-effective date, delivery artifact, provider operation, Expected
Bank Arrival, Bank Match, or QBO/Xero object. An independently authoritative
correction MAY enter its existing closed lane; the handoff MAY preserve only
opaque D25 correlation and MUST NOT inherit case cause, action, completion, or
downstream-disposition authority.

A snapshot-rooted expense, obligation, or correction handoff MUST reference
exactly one Approved Expense Snapshot identity, version, digest, and approved
line-disposition coverage. A payment-rooted handoff MUST instead reference one
immutable payment-source identity, version, and digest plus the complete
covered-obligation and originating-snapshot reference set; it MUST NOT invent a
primary snapshot.

One External Payment Occurrence for reimbursement MUST carry exact
**Reimbursement Payment Coverage** represented by source-owned evidence.
Coverage MUST be homogeneous for tenant, Legal Entity, payee, disbursement
currency, external execution owner, and posting owner. A reimbursement-only
payment MUST be conserved by
exact Reimbursement Payment Coverage plus signed payment-side residual
dispositions. When one atomic payment covers compensation and reimbursement,
one complete typed payment manifest MUST use the External Payment Occurrence's
one payment currency and conserve exact Compensation Payment Coverage,
Reimbursement Payment Coverage, and one signed, typed, explicitly resolved
residual disposition, including zero. A covered source component in another
currency MUST preserve immutable source/payment amounts and exact conversion
evidence. An unresolved residual or FX ambiguity MUST fail closed. Cross-payee
batches MUST remain grouping envelopes around separate atomic External Payment
Occurrences. Later returns or corrections MUST be new signed occurrences.

D17 MUST assign one posting owner to the complete payment. When external
payroll or accounts payable owns accounting for a mixed payment, D18 MAY
project its reimbursement slice and evidence but MUST NOT create a standalone
reimbursement-payment Accounting Release. An Asym-owned mixed-payment release
MUST remain dark until a separately certified complete compensation source
contract names accountant-confirmed semantics and the exact D17 posting owner.
A Compensation Handoff Package, Compensation Draft Delivery Profile Version,
Provider Draft Operation, provider acceptance/readback or permitted staff
confirmation, Compensation Funding Decision, or Field Account Funding Coverage
MUST fail closed on the D18 expense lane and MUST NOT create a Posting Intent.
A Reimbursement Handoff Package, Reimbursement Delivery Profile Version,
Reimbursement Execution Claim, Reimbursement Handoff Coverage, Handoff
Attestation, Reimbursement Handoff Operation, provider draft/input acceptance,
or provider draft/input readback MUST likewise fail closed and MUST NOT create
payment truth or a Posting Intent.

Neither Phase 20 nor Phase 21 MAY treat an accounting handoff, provider
delivery, approval, or Field Account Funding Coverage as payment execution.
Phase 20 MUST NOT own approval, Field Account Funding Coverage, AP balances,
payment execution, payroll, tax adjudication, receipts, card-liability
reconciliation, Field Account entries, outbound reimbursement Bank Matches, or
final reconciliation.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-9f3414c2b9f0335b3f92"></a>

## D8 Xero Carrier Plans Are Tenant-owned Capability-certified And Effect-preserving

<!-- BEGIN CONTRACT {"id":"9f3414c2b9f0335b3f92","name":"D8 Xero Carrier Plans Are Tenant-owned Capability-certified And Effect-preserving"} -->

Each Xero Accounting Destination MUST use one immutable, prospective, tenant-
owned **Xero Carrier Plan**. It MUST model Xero independently from QBO and bind
only certified carrier meanings to exact provider-native recipe positions.

The plan MAY use supported Accounts, Tracking Categories and Options, Items,
Contacts, references, and separately qualified Projects behavior. It MUST
respect the two-active-Tracking-Category boundary, reserved bank-account
restrictions, report-shape limits, object state, subscription and organization
capabilities, and the absence of public API authority for bank-statement
reconciliation.

Hard semantic or effect gaps MUST block activation. Bounded report visibility
that preserves accounting effect MAY be accepted only with exact disclosure.
The Capability Certificate MUST pin the organization, base currency,
capabilities, carrier plan, compatible mapping digest, and observation time.
Delivery MUST retain provider identities, exact readback, and later drift.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
