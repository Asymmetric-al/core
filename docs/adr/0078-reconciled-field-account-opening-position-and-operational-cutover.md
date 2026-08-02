# Reconciled Field Account Opening Position and operational cutover

**Status:** Accepted (founder ruling, Phase 21 grill session — D17)

## Context

An established tenant may arrive with worker support positions spread across a
legacy portal, finance workbook, accounting report, and incomplete historical
activity. Starting every Field Account at zero would misstate organization-
controlled support. Reconstructing unsupported detail would fabricate gift,
assessment, expense, compensation, payment, or accounting history. Treating a
legacy system, QBO, or Xero as the live Field Account balance would create two
authorities and couple Phase 21 to mutable external configuration.

The same pre-cutover value could also be counted twice if balance-bearing exact
history and a complete opening balance were admitted independently. Asym cannot
claim that it atomically locks a spreadsheet, vendor portal, or bookkeeper it
does not control.

## Decision

Phase 21 admits one finance-authorized, source-covered, per-Field-Account and
per-currency **Field Account Opening Position** over a complete Tenant × Legal
Entity × ISO-currency activation cohort. One immutable, precedence-explicit
**Opening Source Package** identifies the reconciled source of position and any
bounded supporting artifacts. One complete **Opening Coverage Manifest** pins
the account census; one exact half-open boundary for every predecessor source
family; one canonical operational/business **through boundary** that every
predecessor cursor or snapshot proves complete through; the captured canonical
ingestion cursor that becomes the predecessor of the first D11 close; source
artifacts and digests;
parser/schema/adapter/mapping versions; control totals; differences and
authorized dispositions; independently live reservations, obligations,
compensation/reimbursement coverage, reallocations, unresolved payments, and
other capacity effects; actor; and final proof.

For every Field Account and currency, and again at cohort control totals:

```text
reconciled boundary position
= balance-bearing certified exact history
+ residual Field Account Opening Position
```

Every pre-cutover source fact occupies exactly one non-overlapping manifest
disposition: `exact_history`, `opening_residual`, `reference_only`,
`intentional_exclusion`, or `unresolved`. `unresolved` blocks activation. An
intentional exclusion must be explicit and proved non-balance-bearing.
Reference-only history is privacy-filtered and structurally unable to affect a
balance or create receipts, communications, statements, expenses,
compensation, accounting, payroll/AP, payment, or donor-CRM work.

Certified exact history must be deterministically ordered, preserve complete
atomic pairs or groups in one disposition, and remain nonnegative at every
per-Field-Account prefix. D3 assessment history is certifiable only as one
complete, non-overlapping Assessment Period Determination, including its frozen
partial-period policy and every component and correction. Detail
that cannot meet these conditions stays structurally inert reference history;
the reconciled position is represented by the residual instead. Independently
live coverage is carried forward under its original identity and state, not
replayed as a new economic occurrence.

If a D6 Support Currency Allocation Manifest or other source-conserving atomic
group spans more than one ISO-currency cohort, canonical exact history may be
admitted only when the complete group is contained in one cohort or every
affected cohort activates behind one linked atomic barrier. Otherwise the
detail remains reference-only and each currency uses its independently
reconciled residual. Partial source coverage or a second claim across cohorts is
forbidden.

Each admissible nonzero residual opening is one immutable balanced Phase 21 occurrence
between the exact Field Account and its typed organization-control opening
counter-entry. A zero residual is manifest coverage only. A legacy negative
position cannot become a negative Field Account, be clamped, or receive a
plug. The manifest must distinguish the source-reported position from the
finance-authorized admissible Field Account position. A negative source amount
may be resolved only through already source-authoritative external-obligation
or lifecycle-disposition evidence under the applicable owner domain; D5 applies
only when exit or charitable succession is the actual cause and cannot invent a
generic deficit obligation. Otherwise activation remains blocked. Inactive,
departed, retired, and successor accounts remain governed by D5.

Preparation uses private, chunked, resumable, non-authoritative staging and
production-shaped shadow reconciliation. One immutable **Field Account
Operational Cutover** starts Asym authority only after final permission,
source, cohort, mapping, control-total, in-flight, and manifest proof at an
exact half-open boundary for every predecessor source family. Each atomic
occurrence crossing a boundary remains wholly prior-owner or wholly Asym-owned;
all predecessor families must be classified before one atomic cohort
activation. The displayed opening position uses the one common through boundary,
which is also the start of the first D11 half-open business interval. Only the
short Asym-side authority transition is atomic. Before
activation, any unresolved or inadmissibly negative account blocks the whole
cohort; row carving is forbidden. Where a prior writer cannot be locked, the truthful
proof is **No known overlap in the inspected scope**, followed by
post-activation overlap-and-gap monitoring.

Before the authority fence, staging may be replaced or discarded. After it,
the original Opening Position, activation manifest, and every closed Support
Cycle remain immutable and are never reinterpreted or destructively rolled
back. A late pre-cutover fact is first resolved against its existing manifest
disposition. A position-changing fact creates one idempotent, cause-linked
manifest successor plus a new **Opening Position Correction** occurrence with
source-effective/pre-cutover, discovery, and current record times. The economic
correction enters through the normal correction/next-close path; it never
rewrites opening continuity or a prior D11 close/D12 statement. A positive
correction requires fresh finance and source proof and cannot silently uplift a
balance. Mandatory adverse corrections remain continuous. After activation,
smallest-scope containment applies without suppressing those adverse effects.

Phase 29 owns private byte identity, storage/access mechanics, malware hygiene,
and access audit. Phase 30 owns import-session/upload UX, replaceable transport
and parsing, mapping mechanics, and resumable staging. Phase 21 alone owns
source precedence, semantic mapping admissibility, admission, conservation,
activation, Field Account meaning, evidence-retention purpose, and correction.
The opening and reference history remain accounting-dark. Phase 20
alone may deliver a separately proved unposted accounting gap under its D17
Posting Ownership Cutover; prior QBO/Xero records remain external historical
evidence and never Field Account balance authority.

Every Phase 21 decision other than D17 follows its own dependency path, but D17
activation remains feature-gated until the certified Phase 29 private-byte/
access seam and Phase 30 import-session transport/staging seam exist—or those
exact seams are pulled forward under their owning phases. Documentation of the
contract is not a claim that either runtime seam already exists.

Staff use one quiet, accessible, exception-first **Start Field Accounts** flow.
Missionary access remains governed by D9: if the applicable publication profile
does not authorize balances or reference history, those facts are not queried,
cached, exported, or exposed. When authorized, the missionary sees one calm,
ISO-labelled, through-dated Finance-confirmed position; later closes advance
the same presentation rather than replacing its authority model. Optional
reference history is separately authorized, explicitly labelled, and never
presented as new Asym activity or as owned, available, withdrawable,
payroll-ready, payable, or paid support.

**Phase 21 D23 precision amendment (2026-08-01).** Initial D23 activation is
part of this no-gap/no-overlap boundary: every in-scope pre-cutover expense
source slice receives exactly one opening/canonical/future-writer disposition
under the complete Opening Coverage Manifest and source-family half-open
boundary. Later D23 profile replacement is not a new opening cutover; it uses a
complete D11 Support Cycle boundary, captured ingestion cursor, and exhaustive
in-flight disposition manifest. Neither path uses a date-only cutoff or replays
historical side effects.

Activation reprojects current source truth once for D9-authorized workspaces and
Phase 31 consumers through their normal version/snapshot contracts. It never
replays itemized historical feed changes, receipts, messages, notifications,
statements, accounting, payroll/AP, reimbursement, or workflow effects.
Reference-only history never enters D2 admission or the D8 support feed.

**Phase 21 D27 precision amendment (2026-08-02).** D27's Release Generation,
Adoption Plan, and Go-Live Readiness Manifest are evidence and consequence-
review inputs to this ADR's existing cutover, never a second activation
authority. The tenant selects a Legal Entity/currency/source scope; the
complete D17 account/source census is server-derived and cannot be row-
selected. D27 references this ADR's production-shaped opening preparation and
shadow reconciliation rather than owning a second financial shadow. Final
actor, permission, source, cohort, policy, mapping, manifest, revocation, and
generation proof occurs inside the same idempotent CAS-guarded Operational
Cutover. A named missionary pilot changes only D9/D19/Phase 12 publication,
never this financial cohort or boundary.

## Consequences

- Existing tenants gain a truthful start without requiring complete historical
  reconstruction; fresh tenants receive a quiet no-prior-position path.
- Exact history is admitted only through a certified semantics-preserving
  owner-domain adapter and can never overlap the residual opening.
- Large cohorts prepare incrementally, while authority changes exactly once
  through a bounded final fence.
- Source evidence requires private custody, least-privilege access, access
  audit, and purpose-owned retention, hold, and disposal.
- Release requires conservation, isolation, concurrency, failure recovery,
  late-fact, parser-drift, restore, scale, privacy, accessibility, and
  representative-user proof from the Phase 21 decision log.

## Rejected alternatives

- start every established Field Account at zero;
- import a complete balance and overlapping balance-bearing history;
- reconstruct unsupported history as canonical Phase 21 occurrences;
- mutable balance scalars, negative balance clamping, plugs, or tolerances;
- date-only boundaries, fuzzy account identity, silent exclusions, or
  whole-history replay;
- one giant activation transaction or a claim that Asym universally locks an
  external writer;
- dual write, destructive post-activation rollback, or downstream side-effect
  replay; and
- a live legacy/QBO/Xero balance mirror or automatic accounting delivery.

## Related decisions

- [ADR-0058 — Source-family-specific Posting Ownership Cutover](./0058-source-family-posting-ownership-cutover.md)
- [ADR-0062 — Finance-closed Field Account cycles](./0062-finance-closed-field-account-cycles.md)
- [ADR-0066 — Organization-authorized support reallocation and exit disposition](./0066-organization-authorized-support-reallocation-and-exit-disposition.md)
- [ADR-0067 — Proof-gated parallel currency Field Accounts](./0067-proof-gated-parallel-currency-field-accounts.md)
- [ADR-0072 — Layered Field Account integrity and cause-owned repair](./0072-layered-field-account-integrity-and-cause-owned-repair.md)
- [ADR-0088 — Evidence-gated Core Field Accounts production
  activation](./0088-evidence-gated-core-field-accounts-production-activation.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md)
