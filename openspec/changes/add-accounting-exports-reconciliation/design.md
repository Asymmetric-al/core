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
Phase 15 frozen Deposit Groups, and Phase 21 approved expense/payment
handoffs. A missing contract keeps only its dependent family dark; no direct
table coupling or compatibility shim substitutes for source authority.

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

Expense admission is discriminated: snapshot-rooted handoffs carry one Approved
Expense Snapshot, while payment-rooted handoffs carry one immutable payment
source plus complete obligation and originating-snapshot coverage without an
invented primary snapshot. Outbound reimbursement does not enter Bank Match.

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
coverage, partial Bank Match allocation, payment coverage, largest-remainder
processor-cost allocation, and currencies.

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
   expense, processor-cost, and currency edge cases pass at the public seam.
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
- Phase 21 expense workflow, AP, payroll, receipt archive, reimbursement
  payment execution, or Field Account computation.
- Hardcoded provider limits, universal multicurrency claims, tenant-configured
  rate limits, or tenant priority controls.
- Legal, GAAP, tax, audit, bank, QBO, or Xero certification claims.
