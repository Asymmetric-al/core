# Design: Accounting Exports And Reconciliation

## Decision Authority

This design implements the ratified Phase 20 decisions D1-D20 and accepted
ADR-0043 through ADR-0061. The decision log is historical deliberation; this
OpenSpec change is the observable product contract. On conflict, merged
OpenSpec and this proposed capability delta follow the repository source-of-
truth order.

Phase 20 is an accounting handoff and operations product. It does not become
the tenant's general ledger. Source domains continue to own gifts, allocations,
offline batches, corrections, expenses, reimbursements, and Field Accounts.
Stripe owns processor evidence, a bank owns posted bank evidence, and QBO or
Xero owns provider-native accounting objects, period locks, the books, and
final reconciliation.

## Public Application Boundary

The primary public business seam is one tenant-, actor-, environment-, and
Legal-Entity-scoped `AccountingOperationsService`. It exposes typed commands
and queries for:

- provider authorization and exact destination connections;
- capability inspection and activation;
- accounting policy, Posting Profile, mapping, Carrier Plan, cadence, cost,
  currency, and correction-policy versions;
- source admission, settlement evidence, Expected Bank Arrivals, and Bank
  Match;
- release candidates, immutable Accounting Releases, delivery operations,
  exact readback, packages, corrections, and cutovers;
- Accounting Exception Cases, shared follow-up, staff evidence, and operational
  projections.

Routes, server actions, durable jobs, UI components, and provider adapters call
this service. They do not reproduce accounting rules, infer tenant or Legal
Entity scope, change a release's delivery lane, or independently decide that an
external effect is safe to retry.

Background commands execute through registered, auditable, purpose-scoped
non-human principals with exact tenant, Legal Entity, destination, capability,
and current human-owner authorization. A shared service-role credential is
infrastructure, not an actor.

## Bounded Contexts And Authority Map

The Accounting Operations product coordinates, but does not merge, these
authorities:

| Context               | Authority                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Source domains        | Canonical contribution, allocation, batch, correction, expense, payment, and receipt facts                                          |
| Stripe evidence       | Balance transactions, fees, refunds, disputes, transfers, payout evidence, currencies, and provider conversion                      |
| Bank evidence         | Posted bank observations and their provenance                                                                                       |
| Accounting Operations | Immutable Accounting Releases, mappings, release cadence, Bank Match, provider delivery evidence, exceptions, and cutover ownership |
| QBO or Xero           | Provider-native accounting objects, organization capabilities, accounting locks, provider edits, and final books reconciliation     |
| Mission Control       | Human assignment, comments, due dates, reminders, and follow-up status                                                              |

Every imported or derived fact retains its authority, source identifier,
version, observed time, and exact tenant and Legal Entity. Agreement may be
shown as evidence. Disagreement remains visible and cannot be repaired by
rewriting another authority.

Source-family admission is independent and predecessor-gated: Phase 13 owns
posted contribution/ledger occurrences, Phase 14 admitted credit adjustments,
Phase 15 frozen Deposit Groups plus canonical noncash asset-lot/disposition
source facts, and Phase 21 approved expense/obligation and externally executed
payment-evidence handoffs. Phase 13, not Phase 14, owns the original noncash
Contribution and donor-facing truth; Phase 14 may own separate recognition
credit but never disposition or proceeds truth. A missing contract keeps only
its dependent family dark; no direct table coupling or compatibility shim
substitutes for source authority.

Phase 21 D5 support-reallocation work is a negative forward seam in this
generation, not a launch source family. Requests, policies, coverage,
Decisions, open-cycle pairs, exit manifests, charitable Handoffs/Results,
payment evidence, and close-covered occurrences all remain unsupported and
structurally dark until a later separately approved Phase 20 change certifies
the exact source schema, accountant-confirmed semantics, Posting Profile
recipe, and D17 owner. Exceptional JournalEntry, ManualJournal, or artifact
delivery cannot bypass that gate.

Phase 21 D7 compensation draft/input delivery is another negative accounting
boundary, not a Phase 20 provider operation. Compensation Handoff Packages,
Compensation Draft Delivery Profile Versions, Provider Draft Operations,
provider acceptance/readback or permitted staff confirmation, and their
delivery coverage remain Phase 21 evidence. None is an accounting-ready source
by itself. A payroll/AP grant is not an Accounting Destination Connection;
regional Xero Payroll capability does not authorize Xero Accounting, and
neither Xero `DRAFT ACCPAY` nor a QBO Bill may be created through the Phase 21
adapter. Only a separately certified evidence-qualified compensation
occurrence with accountant-confirmed semantics and exact D17 ownership may
enter the Phase 20 compiler.

Phase 21 D15 reimbursement handoff is also a negative accounting boundary.
Reimbursement Handoff Packages, Delivery Profile Versions, Execution Claims,
Handoff Coverage, Handoff Attestations, Handoff Operations, provider
draft/input acceptance and readback, ambiguity, and residual-only succession
remain Phase 21 evidence. Artifact access is non-executing; handoff is not
payment; draft readback proves only the handoff operation. Only an
independently eligible Approved Reimbursement Obligation or separately
source-qualified External Payment Occurrence may enter D18. A D15 release
cannot assign the D17 posting owner of a future atomic payment. QBO/Xero
Accounting objects remain reachable only through Phase 20.

Phase 21 D16 precision-amends the D18 source catalog without reopening Phase 20
D1-D20. Only an evidence-qualified Expense Advance Issuance Occurrence, a
separately certified Expense Advance Application typed accounting effect where
applicable, a Claimant Repayment Occurrence, and cause-linked corrections may
enter the compiler. Cash claimant return and advance return stay distinct typed
occurrences. Policy versions, authorization, operational settlement,
Repayment Subject Determination, Claimant Repayment Decision, uncertified
Claimant Repayment Requirement, residual position, tasks, raw evidence
observations, disputes, Repayment Restitution Review, and Field Account Funding
Coverage stay accounting-dark. A Requirement may support receivable
recognition only under a separate accountant-certified policy and source
contract, which still does not prove returned money. Each admitted occurrence
independently resolves its D17 posting owner.

Phase 21 D19 supplies source-lineage precision, not another accounting source
or authorization input. An admitted Field Account occurrence preserves its
exact Tenant, Legal Entity, Support Assignment, Field Account, ISO currency,
and source coverage. Support Assignment Participant Membership, Phase 12
workspace access, relationships, invitations, operational responsibility,
notification preference, communication outcome, and `People & access`
orchestration remain accounting-dark. They cannot create, suppress, reroute,
merge, split, or correct a Posting Intent or Accounting Release, and a
participant-free Support Assignment remains eligible whenever its independent
economic source contract is eligible.

Phase 21 D20 supplies operational organization-support-cost truth, not a
certified accounting source or posting recipe. Its source observations,
economic roots, bearing policies, applications, determinations, coverage
manifests, carryforwards, Field Account Funding Coverage, closed effects, and
**Support Cost Accounting Candidate Handoff** remain unsupported and
accounting-dark in this generation. They create no D18 discriminator, Posting
Intent, Accounting Release, artifact delivery, or provider operation. Phase 20
D19 remains the exclusive processor-cost attribution and treatment lane, so a
D20 cost cannot re-admit or duplicate exact provider cost or the Processor Cost
Attribution Manifest. Later admission requires a separately approved exact
source schema, accountant-confirmed semantics, close-covered occurrence,
compatible Posting Profile recipe, positive unposted or differential proof,
and D17 posting owner. No JournalEntry, ManualJournal, expense-lane, or artifact
fallback may bypass that gate.

Phase 21 D21 supplies an immutable derivative noncash-to-support bridge, not a
certified accounting source. Phase 13 owns the original noncash Contribution,
legal donor, accepted purpose, gift date, valuation, receipt, supporter, and
fundraising truth. Phase 15 owns canonical append-only asset-lot, disposition,
proceeds, finality, evidence, and correction facts. The Phase 15 disposition
projection and every D21 Noncash Support Realization Manifest, Realized Support
Basis, cost-treatment selection, D2/D11 close-covered Field Account effect,
and correction remain unsupported and accounting-dark in this generation.
They create no D18 discriminator, Posting Intent, Accounting Release, artifact,
provider operation, Expected Bank Arrival, or Bank Match.

A later Phase 20 change may admit noncash-disposition accounting only after it
certifies exactly one canonical economic source, exact schema,
accountant-confirmed semantics, non-overlapping coverage, a compatible Posting
Profile recipe, positive unposted or differential proof, and the exact D17
posting owner. It must prove that the Phase 15 disposition and derivative D21
Field Account effect cannot both post for the same economic coverage.
Brokerage, liquidation, appraisal, valuation, custody, transfer, sale, and
other noncash-disposition costs cannot enter the D19 processor-cost manifest or
the Phase 21 D20 cost lane. QBO/Xero and the tenant's accountant own asset
derecognition, gain/loss, cash, fees, periods, books, and final reconciliation.
There is no current posting, artifact, or adapter fallback for this family.

Phase 21 D22 is another negative accounting boundary. Prospective-authorization
postures, requests, private evidence references, governance and assignment
snapshots, human review, decisions, compatible capacity reservations, later-
claim Authorization Coverage, unused-scope declarations, residuals,
successors, and corrections remain unsupported and accounting-dark. They
create no D18 source, Posting Intent, Accounting Release, artifact, provider
operation, Expected Bank Arrival, or Bank Match. Only a separately qualified
later D10/D13 approved expense, obligation, source-qualified payment
occurrence, or other already certified economic source may enter Phase 20.
Accounting delivery and QBO/Xero readback cannot mutate or release D22 truth.

Phase 21 D23 is also a negative accounting boundary. Its Expense Field Account
Effect Recognition Profile, Effect Basis, Field Account Funding Coverage and
Disposition, Effect Coverage, operational Expense Field Account Effect,
Support Cycle inclusion/through date, exception, and correction express only
support-balance timing. They cannot enter the D18 discriminator catalog or
create, date, select, modify, release, deliver, or reconcile accounting work.
Only a separately certified approved expense, obligation, source-final
organization-paid occurrence, payment occurrence, or correction may enter its
own closed source lane with an exact D17 owner, without inheriting D23 mode,
effect identity, close, or date. QBO/Xero delivery, bill/payment readback,
home amount, drift, and Bank Match cannot back-propagate into D23 truth.

Phase 21 D24 is likewise a negative accounting boundary. Expense Collaboration
Assignment Versions, authority-free invitations and acceptance, Evidence
Access Projection Versions, Claimant Confirmations or admitted external
attestations, helper actions, and actor provenance describe bounded work on an
exact claim. They do not replace Phase 12 authorization and cannot prove
incurrence, substantiation, approval, obligation, payment, Field Account
effect, posting, or reconciliation. Only an independently qualified expense
source may enter its already certified Phase 20 lane. Minimum necessary D24
actor provenance may remain non-authoritative lineage, but Phase 20 and its
QBO/Xero adapters cannot grant, revoke, expand, satisfy, or rewrite D24
assignment, consent, evidence-access, or helper authority.

Phase 21 D25 is also a negative accounting boundary. Expense Claim Resolution
Cause Contract Versions, Cases, Occurrences, Projections, Downstream Impact
Manifests and dispositions, coordination tasks/messages/responses, source-owner
requests, and case-completion proofs remain Phase 21 coordination truth. They
cannot enter the D18 discriminator catalog or create, date, select, modify,
release, deliver, or reconcile accounting work. An independently authoritative
source correction may enter only its already certified Phase 20 lane. Phase 20
alone owns any Compensating Accounting Release, accountant-permitted period
and treatment, provider delivery/readback/drift, and Accounting Exception Case;
D25 may retain only opaque correlation and observe that result.

Production Accounting Destinations are globally unique by provider,
environment, and stable provider organization identity. Direct delivery never
shares one destination across Legal Entities. Multi-entity activation remains
dark until every enabled writer, callback, artifact, handoff, and provider
operation proves exact Legal Entity attribution.

## Canonical Domain Model And Lifecycles

An **Accounting Release** is the immutable publication boundary. It freezes:

- one tenant, Legal Entity, environment, Accounting Destination Connection,
  and exclusive delivery lane;
- exact source coverage and revisions;
- one typed Accounting Posting Intent;
- one balanced Canonical Accounting Effect in integer minor units;
- the applicable policy, Posting Profile, mapping, Carrier Plan, currency,
  cost-attribution, cadence, and correction versions;
- one frozen Provider Delivery Plan and permanent semantic identities;
- one immutable Accounting Evidence Artifact.

The Posting Intent and Canonical Accounting Effect are deterministically
serializable from frozen source, date, currency, policy, builder, mapping,
Posting Profile, compiler, adapter, allocation-algorithm, and ordering pins.
Every effect has stable line identifiers and ordinals, exactly one currency,
and one positive debit-or-credit side per line. Nonprofit semantic distinctions
remain explicit rather than being collapsed into provider carriers.

Creating a release is not provider delivery, import, readback, bank matching,
or reconciliation. Provider operations have their own monotonic evidence and
may be pending, accepted, rejected, ambiguous, read back, mismatched, or
drifted. Staff-mediated packages separately record download, staff-reported
import, provider finalization, verification, and reconciliation without
collapsing them.

Mutable setup is prospective and versioned. A released occurrence never
changes because a tenant edits a mapping, Posting Profile, destination,
credential grant, capability certificate, cadence, cost policy, currency lane,
or provider books.

Each configured Legal Entity and Accounting Destination has exactly one active
Posting Profile bundle before work is admitted; activating a prospective
successor atomically supersedes the prior version rather than creating
purpose-specific parallel bundles. That bundle owns one certified
provider-native recipe and permitted grain for each supported source-purpose
family: online processor settlement, offline Deposit Group, cleared paid
expense, genuine unpaid obligation, correction or reversal derived from its
original recipe, and exceptional accountant adjustment. Guided defaults are
online fund summary, offline gift detail, and approved-expense approved-line
detail; any other grain requires current destination capability and Certified
Execution Envelope proof. QBO `JournalEntry` and Xero `ManualJournal` belong
only to the explicit exceptional accountant-adjustment family and never rescue
an unsupported or failed ordinary recipe.

Expense admission is discriminated by closed source family. Snapshot-rooted
handoffs carry one Approved Expense Snapshot, while payment-rooted handoffs
carry one immutable payment source plus complete obligation and originating-
snapshot coverage without an invented primary snapshot. D16 advance-issuance,
advance-application-effect, claimant-repayment, and correction sources carry
the exact source root and predecessor coverage required by their independently
certified contract. Outbound reimbursement does not enter Bank Match.
A reimbursement-only payment conserves exact Reimbursement Payment Coverage
plus signed residual dispositions. A mixed compensation/reimbursement payment
uses the External Payment Occurrence's one payment currency and carries one
complete typed manifest across exact Compensation Payment Coverage,
Reimbursement Payment Coverage, and one signed, typed, explicitly resolved
residual disposition, including zero. Different-currency source components
preserve immutable source/payment amounts and exact conversion evidence;
unresolved residual or FX ambiguity fails closed. D17 assigns one posting
owner to the whole payment. When payroll/AP owns that posting, D18 may consume
the reimbursement slice as evidence but cannot create a standalone release. An
Asym-owned mixed payment stays dark until its complete compensation source
contract, accountant-confirmed posting semantics, and exact D17 owner are
separately certified. Compensation Handoff Packages, Compensation Draft
Delivery Profile Versions, Provider Draft Operations, provider
acceptance/readback or permitted staff confirmation, Funding Decisions, and
reservations fail closed on the expense lane.
Reimbursement Handoff Packages, Reimbursement Delivery Profile Versions,
Reimbursement Execution Claims, Reimbursement Handoff Coverage, Handoff
Attestations, Reimbursement Handoff Operations, provider draft/input acceptance
and readback, and handoff ambiguity likewise fail closed as payment and
accounting authority. Staff Handoff Attestation cannot create an External
Payment Occurrence. The underlying approved obligation or separately
source-qualified payment occurrence may qualify independently through its own
D18 discriminator.

Processor-cost allocation requires the exact cost and frozen Designation lines
to share one proved currency basis. Currency-incompatible and ineligible costs
remain organization-borne through the central processor-expense target, and a
missing target blocks readiness. Every effect, release, plan, package, expected
arrival, Bank Match, and cost-allocation graph has exactly one currency. The
ordinary currency lane additionally requires identical Stripe settlement,
payout-bank, and QBO-home/Xero-base currencies.

## Persistence Tenant Scope And Concurrency

Canonical financial roots store explicit `tenant_id`, `legal_entity_id`, and
environment scope. Same-scope composite foreign keys prevent cross-tenant and
cross-entity attachment. FORCE RLS, server-command authorization, and
subtract-only Legal Entity capabilities apply to staff queries and mutations.

Immutable releases, manifests, evidence observations, operation attempts,
readbacks, exception evidence, and cutover coverage are append-only. Mutable
review surfaces use compare-and-set revisions. Release creation, source
coverage, semantic idempotency, outbox admission, and ownership fencing occur
in one short database transaction with no source/provider network I/O,
artifact-byte generation, or queue call. External work begins from the
transactional outbox only after commit.

Every external effect uses a permanent semantic operation identity.
Transactional outbox records, fenced claims, leases, attempt evidence, and
reconciliation scans permit crash recovery. An expired lease allows work to be
reclaimed; it never permits a second effect after a possibly successful
provider operation.

## Source Admission And Atomic Accounting Release

A Release Candidate is derived and recomputable. It may show eligible,
blocked, changed, or excluded source occurrences, but it is not accounting
truth. Automatic, scheduled, and staff-triggered paths enter the same atomic
release fence.

The fence revalidates exact source versions, complete source coverage,
Posting Intent eligibility, balance, period treatment, mappings, destination,
authorization, capability certificates, Carrier Plans, currency and processor-
cost policy, ownership cutover, active exceptions, and certified execution
shape. Revalidation may remove changed work from a reviewed candidate. It may
not silently add newly eligible work. A rejected or stale unit creates no
release, provider operation, package, or outbox effect.

One source occurrence is covered at most once for an Accounting Posting Intent
family and ownership interval. Corrections use new signed source occurrences
and linked compensating releases; they do not reopen original releases.

Correction intake uses the closed six-cause catalog: subsequent economic event,
source fact correction, accounting policy or mapping correction, delivery
duplicate or omission, provider record drift, and potential prior-period
error. Policy quietly recommends the sole permitted choice, bounds multiple
choices with a departure reason, and blocks when none is permitted. Potential
prior-period error always remains accountant-owned.

Exception Contracts may accept typed Handled outside Asym evidence, including
an exact QBO/Xero reference or labelled staff attestation with readback when
available. That evidence never becomes Asym-delivery proof or clears a case
without its cause-specific proof.

## Provider Ports Delivery Plans And Readback

Stripe, QBO, Xero, and optional bank connectors sit behind narrow provider
ports. Provider adapters translate the frozen provider-neutral contract; they
do not own accounting policy or source meaning.

Stripe settlement evidence preserves each component's amount, fee, net,
classification, account, balance type, currency, source times, and digest.
Payout debit is a separate transfer movement, never a second fee or fund
expense. Unknown, repeated, or double-represented categories fail into
classification exceptions before release.

QBO and Xero compilers must prove effect equivalence between the Canonical
Accounting Effect and the frozen Provider Delivery Plan. Provider-native
objects are selected through the certified Carrier Plan rather than forcing
all work through generic journals.

Direct operations use operation-granular provider idempotency where available,
read-before-retry after uncertainty, exact provider identity, exact readback,
and later drift detection. An HTTP success or batch response is not sufficient
proof. Staff-mediated packages derive from the same plan, have immutable exact
bytes and control totals while retained, and are Ready to import only for a
current, unquarantined exact-destination capability and conformance record.
Historical availability never implies current readiness.

Posting Ownership Cutover uses a final bounded pre-activation inspection and
post-activation overlap monitor. It claims only the provider-visible inspected
scope and discloses that independent manual or connector writes may be
unobservable.

## Durable Execution Idempotency And Recovery

Provider work is admitted only after a release is immutable. Scheduling is
provider-native, tenant-fair, and reserves capacity for readback and ambiguous-
outcome recovery. Retry classification distinguishes definitive rejection,
safe retry before possible handoff, uncertain outcome, accepted effect,
readback mismatch, and later drift.

An uncertain operation is quarantined until exact provider identity/readback
or bounded staff reconciliation resolves it. Blind replay, lane switching, and
whole-release retry are forbidden. The original release and lane never change.
A separately identified, lineage-linked recovery successor may select another
currently certified lane only for the smallest exact units positively proved
neither accepted nor imported and only with complete duplicate-prevention
proof. Unknown, partial, or staff-assumed outcomes cannot authorize that
successor.

Webhook ingestion and scheduled synchronization are idempotent and
source-labelled. Missing pages, stale capability evidence, provider outages,
and reconnect requirements remain visible without manufacturing completion.

## Ready For Accounting Product Surfaces

Finance staff enter through one **Ready for Accounting** doorway. The ordinary
view is quiet and answer-first:

- what is ready;
- what is waiting normally;
- what needs attention;
- what has been released;
- where delivery stands;
- whether provider readback still agrees.

The Release Horizon groups current work as Needs attention, Ready for review,
Scheduled or automatic, and Recently released. Cadence uses only bounded
when-ready, weekday, weekly, or monthly presets in an IANA timezone; DST folds
run once, gaps use the first valid instant, and missed occurrences coalesce.
New direct destinations begin review-first, and cadence configuration is a
separate capability from release.

Progressive disclosure reveals the source coverage, accounting effect,
destination, provider-native plan, mappings, cost and currency treatment,
evidence, and recovery actions. Single-entity and ordinary local-currency
tenants do not see redundant selectors or specialist setup, and a clean
one-person team can use the recommended setup and release path without opening
advanced controls or confirming reversible, non-destructive steps.
Provider-specific language is explained in bookkeeper terms without pretending
that QBO and Xero are identical.

Release review answers **What happened**, **How it will be recorded**, and
**QuickBooks/Xero preview** in that order; the provider preview is explicitly
unsent until delivery evidence exists.

Protected actions show exact scope and consequence. Healthy automation does
not generate routine alerts. Exceptions display one root cause, blocked
radius, owner, evidence needed, and safe next action. Responsive and accessible
layouts use existing product tokens, semantic tables or lists, keyboard
operation, meaningful screen-reader names and state, visible unobscured focus,
associated errors, text-and-icon non-color status cues, live-region
announcements, 200% zoom and 400% reflow without two-dimensional scrolling,
forced colors, reduced motion, long locales, right-to-left layouts, and
screen-reader-meaningful provider evidence.

## Security Privacy And Evidence Retention

OAuth attempts use short-lived, single-use, server-verified correlation and
provider-required security controls. Provider Authorization Grants are
encrypted and separated from stable Accounting Destination Connections.
Secrets, refresh tokens, bank credentials, raw provider payloads, receipt
images, and broad accounting records never enter browser state, generic logs,
metrics, filenames, or queue payloads.

Every command reauthorizes tenant, actor, Legal Entity, destination, and
capability scope. Provider callbacks never select scope from untrusted labels
or names. Reconnect proves the same external organization; a different
organization requires prospective replacement.

Evidence artifacts and packages use private storage, digest verification,
bounded access, and audit. Immutable identities, manifests, digests, lineage,
outcomes, holds, disposal evidence, and tombstones remain append-only;
protected bytes follow purpose-owned retention, legal/privacy holds, and
audited staged disposal. Disposed bytes are reported unavailable and are never
regenerated from mutable inputs. The D18 handoff excludes raw receipt images
and unnecessary personal data.

## Capacity Observability And Operations

Capability Certificates prove destination-specific provider capabilities.
Certified Execution Envelopes prove the operation, line, byte, batch, latency,
readback, and recovery shapes Asym has tested. Live quotas, provider health,
commercial headroom, and queue position are observations rather than durable
certificate truth.

Operational telemetry is tenant-safe and uses semantic identifiers and
cardinality-bounded dimensions. It reports source-ingestion lag, incomplete
settlement evidence, release readiness, blocked counts by cause, queue age,
provider throttling, attempt outcomes, ambiguous operations, readback
mismatch, drift, package usage, bank-evidence freshness, reconnect needs, and
cutover overlap. Alerts are exception-based and link to one actionable case.

Runbooks cover provider outage, credential expiry, uncertain writes, stale
capabilities, bank-evidence mutation, package partial import, cutover overlap,
locked periods, currency capability loss, and security quarantine. Artifact-
always continuity remains available when direct delivery is unavailable and
the staff-mediated surface is certified.

## Test Architecture

The primary acceptance seam is the tenant/actor-scoped
`AccountingOperationsService`. Tests assert observable commands, queries,
stored evidence, external-port calls, and permission-safe projections rather
than private helpers.

Use real PostgreSQL/Supabase behavior for:

- RLS and subtract-only Legal Entity scope;
- same-scope foreign keys and uniqueness;
- release transactions and source coverage;
- compare-and-set review revisions;
- semantic idempotency;
- claims, leases, fences, and outbox recovery;
- allocation conservation and concurrent release/correction/cutover races.

Use deterministic contract fakes only at declared external ports: Stripe, QBO,
Xero, optional bank evidence, private object storage, clocks, and durable-job
dispatch. Provider-adapter contract suites use frozen official fixtures,
golden requests, exact readbacks, malformed and paginated responses,
rate-limit/outage behavior, and uncertain outcomes. Production activation also
requires provider sandbox or production-shaped certification; unit fakes do
not certify a live integration.

Compiler tests prove every QBO/Xero plan is balanced and effect-equivalent.
Table-driven invariant tests cover integer-minor-unit conservation, mapping
coverage, partial Bank Match allocation, reimbursement-only and complete typed
mixed-payment coverage, one payment currency, signed typed residual
dispositions including zero, exact cross-currency source/payment evidence,
D17 whole-payment ownership, expense-lane rejection of compensation and
reimbursement handoff objects, Handoff-Attestation-as-nonpayment proof,
largest-remainder processor-cost allocation, and currencies.

Negative-boundary tests prove that Phase 15 noncash dispositions and Phase 21
D21 realizations remain accounting-dark; that neither creates an artifact or
provider operation; that D19/D20 reject noncash-disposition costs; and that a
future source contract cannot cover the same economic event from both the
disposition and derivative Field Account effect.
They also prove that every D23 operational profile, basis, funding disposition,
effect coverage, effect, close inclusion, and correction creates zero accounting
work; that an independently eligible source can still enter D18 without
inheriting D23 timing; and that QBO/Xero or Bank Match evidence cannot qualify
or rewrite D23.

Playwright and accessibility suites supplement the service seam for critical
setup, review, release, exception, package, reconnect, and responsive
workflows. Load and soak evidence must cover realistic many-fund tenants,
provider limits, tenant fairness, recovery reserve, and restart convergence.

## Production And Release Gates

Phase 20 remains dark for a destination or lane until all applicable gates pass:

1. Each enabled family proves its exact predecessor-owned occurrence/version
   contract and Legal Entity pinning independently.
2. Schema, RLS, same-scope constraints, append-only evidence, and backup/
   restore behavior are verified.
3. Accounting policy, Posting Profiles, mappings, Carrier Plans, and provider
   capabilities have complete coverage.
4. QBO and Xero adapters pass exact request, idempotency, pagination, timeout,
   readback, and drift certification.
5. Direct capacity or the selected import surface is certified for the exact
   plan.
6. Security, secret custody, reconnect, replacement, disconnect, privacy, and
   tenant-isolation tests pass.
7. Settlement, Bank Match, correction, cadence, exception, package, cutover,
   expense, processor-cost, noncash-realization boundary, and currency edge
   cases pass at the public seam.
8. Accessibility, responsive behavior, telemetry, alerts, recovery scans, and
   operator runbooks are production-ready.
9. Legacy or alternate accounting writers for an adopted source interval are
   disabled at the proved Posting Ownership Cutover.

## Explicit Non-goals

- A second ledger, bank register, close workflow, or provider reconciliation
  screen.
- A universal journal recipe, arbitrary accounting DSL, generic OAuth product,
  generic bank-feed platform, or custom retry console.
- Provider-neutral behavior that hides real QBO/Xero differences.
- Automatic chart-of-accounts redesign, silent provider-object creation,
  retroactive remapping, fuzzy bank matching, or historical whole-book import.
- Phase 21 expense workflow, receipt archive, Field Account computation, or
  support-reallocation workflow; or any payroll, accounts-payable,
  reimbursement, or charitable-succession payment execution.
- Noncash asset custody, valuation, appraisal, liquidation, trading, disposition
  accounting, gain/loss calculation, or a current Phase 15/D21 accounting
  source, artifact, or provider adapter.
- Hardcoded provider limits, universal multicurrency claims, tenant-configured
  rate limits, or tenant priority controls.
- Legal, GAAP, tax, audit, bank, QBO, or Xero certification claims.

## Phase 21 D26 records-export negative boundary

Phase 21 D26 Records Schedule Contracts and Bindings, Record Retention
Resolutions, successor-impact evidence, Records Export Packages, Coverage
Manifests, package parts, downloads/prints, Tenant External Copy Assertions,
Verified Destination Custody Transfers, holds, offboarding windows, and copy-
disposition evidence are not accounting sources or delivery operations. They
are rejected before D18 accounting admission.

A D26 package may contain only a currently authorized Phase 20 owner reference
or exact evidence copy. That representation never becomes an Accounting
Delivery Package, QBO/Xero company backup, Posting Intent, Accounting Effect,
Accounting Release, provider operation, readback, drift result, Bank Match, or
reconciliation outcome. Export, download, transfer, expiry, hold, or disposal
changes no Phase 20 ownership, retention, posting, delivery, or exception
truth. This boundary creates no new source discriminator, recipe, adapter,
lane, provider operation, or Phase 20 runtime feature.
