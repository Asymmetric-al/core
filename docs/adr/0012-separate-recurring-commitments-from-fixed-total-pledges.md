# ADR-0012: Separate recurring commitments from fixed-total pledges

**Status:** Accepted (founder ruling, Phase 16 grill session 2026-07-12 — D1)

> Full record: `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md`
> (ratified decisions D1, D11–D14, and D17–D19).

## Context

Automatic recurring giving and a fixed-total campaign pledge both describe
expected future support, but they make different promises. A recurring
commitment authorizes repeated gifts for an amount and cadence without creating
a promised cumulative balance. A fixed-total pledge records an explicit total
that may have an optional expectation plan, but does not itself authorize a
payment. A fixed-total pledge never owns a payment instrument, mandate, provider
executor, or hidden automatic-collection mode. It may be fulfilled by posted
manual/external gifts or by gifts generated through a separately authorized,
explicitly linked recurring commitment. The earlier roadmap and `donor_pledges`
prototype blurred these facts,
which would make cancellation, fulfillment, accounting, migration, and donor
language unsafe.

## Decision

Model **two operational aggregates** on shared Party, designation, contribution,
communication, and audit foundations:

- `recurring_commitments` own open-ended recurring intent, calendar schedule,
  collection authorization, execution binding, and expected occurrences;
- `fixed_total_pledges` own an explicit promised total, optional expectation
  plan, amendments, and internal releases. Their **remaining expected** amount
  is derived from the conserved fold of authoritative fulfillment applications
  plus donor-end/internal-release resolution entries; it is not a mutable
  balance column or an accounting write-off.

Promise type and collection arrangement remain separately modeled. A provider
subscription is an executor of a recurring commitment, never of a fixed-total
pledge. A posted contribution remains the sole
received-money fact. Neither aggregate creates a receivable, revenue, receipt,
or cash entry merely by existing. Conversion is never automatic: a donor may
create a successor of the other type only through a fresh, explicit action that
preserves predecessor/successor history and any required authorization.

Shared staff and missionary views may project both products, but must preserve
type, source, confidence, cash-versus-expectation, and role-specific privacy.
Imports classify by authoritative source evidence; ambiguous legacy
`donor_pledges` are quarantined rather than guessed from cadence, Stripe linkage,
or payment history.

## Consequences

- Recurring giving can remain the flagship donor and missionary experience while
  fixed-total pledges stay a quiet, complete secondary workflow.
- Lifecycles, write APIs, health vocabulary, and fulfillment rules cannot leak
  from one product into the other.
- Reports must label received cash, recurring expected support, and pledged
  totals separately; no universal mutable commitment status or balance exists.
- Collection adapters and imports must state both promise type and collection
  arrangement explicitly; any automatic collection associated with a fixed
  pledge is a separate linked recurring commitment with fresh authorization.
- The trade-off is two aggregates and two focused command surfaces. This is less
  complex than one polymorphic record whose rules depend on hidden mode flags.
