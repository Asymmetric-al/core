# ADR-0107: Certified, policy-pinned Travel Allowance Calculations

**Status:** Accepted (founder ruling, Phase 21 grill session — D18)

## Context

Missionaries may claim mileage, meals, incidentals, or lodging under tenant-
adopted travel policies. Official schedules are not interchangeable: they can
govern different populations and purposes; change during or after an effective
period; depend on location, vehicle, trip duration, supplied meals, payment
date, or annual cumulative distance; and express an allowance, limit,
deduction, or substantiation exception rather than a universal entitlement.

A flat tenant rate cannot represent those policies faithfully. A universal
global calculator would require unsafe legal/classification inference, while a
free-form rule builder would duplicate Phase 21 D13, create ambiguous
precedence, and make historical claims unreproducible. Live source lookup would
also let API availability or drift change approval outcomes.

## Decision

Phase 21 adds one optional, bounded **Travel reimbursements** calculation module
inside the single winning D13 Expense Governance Profile. **Actual expenses
only** is the quiet default. A tenant may prospectively enable certified
mileage, fixed meal/incidental allowance, actual expense against a policy limit,
a bounded supported combination, or an exact evidence-backed external
calculation. D13 remains the only applicability resolver and selects exactly
one profile from the expense item's incurred date. There is no separate travel
policy, assignment, queue, workflow engine, formula language, tax engine,
payment rail, or accounting projection.

Every supported official schedule is captured ahead of use in an immutable,
content-addressed **Travel Allowance Source Package** with exact primary-source
evidence, named revision, publication and effective intervals, supported
population and capability envelope, rows/components, units, currency,
parser/schema version, digest, validation, and certification evidence.
`Certified` proves faithful capture and execution only; the tenant or its
qualified adviser remains authoritative for legal and policy applicability.
Claim creation, review, and approval never call a government, map, route, or
commercial rate service for authoritative truth.

An immutable **Travel Allowance Calculation Occurrence** belongs to one exact
D10 Expense Claim Version item or split. It preserves the winning D13
resolution, tenant-confirmed relationship and applicability, source package,
trip instants and IANA timezones, destination/location evidence, distance and
unit, evidence method, vehicle and trip classifications, supplied meals,
partial-day and long-stay treatment, source-required dates, cumulative band
consumption, mutually exclusive coverage, exact rational rates, unrounded
components, declared rounding, ISO-currency minor units, result, warnings, and
lineage. Material changes create successor claim and calculation versions.
Approval alone freezes the exact occurrence into an Approved Expense Snapshot;
calculation does not prove approval, obligation, Field Account capacity,
payment, payroll/tax treatment, accounting, availability, payability, or
reimbursement.

Cumulative schedules use an exact Tenant × Legal Entity × claimant Party ×
source × policy/tax-period × vehicle-kind and source-required associated-scope
capacity key. The claimant Party is the source-owned expense claimant, not a
Support Assignment participant inferred from membership; participation never
selects applicability, policy, or capacity. Allocation is serialized or
compare-and-swap guarded and deterministically ordered. Preview is
non-reserving. Threshold crossings split exactly, and a late earlier occurrence
produces append-only correction or review rather than historical mutation.
Coverage prevents mileage from stacking with mutually exclusive actual vehicle
costs and per diem from stacking with the same actual meal component.

All distance, rate, and money math is exact decimal/rational arithmetic with
policy-declared rounding. Every schedule and result has an explicit ISO 4217
currency. Phase 21 performs no FX; differing currencies require independently
owned conversion evidence or the external-calculation lane. Source revisions
produce candidate packages and explicit impact review. Retroactively effective
changes never rewrite approved work.

Staff configure the module through one progressive Expense Governance Profile
section: method, source, existing D13 applicability, production-shaped examples,
coverage, and CAS-guarded prospective activation. Advanced controls appear only
when the chosen certified method requires them. Missionaries retain one
Expenses/Add expense doorway, with manual and odometer mileage as first-class
paths, optional route/GPS assistance, policy-specific per-diem questions,
offline drafts, one calm calculated amount, and an expandable exact
calculation explanation. Clean work remains in D10's ordinary review; only
typed causes enter the existing exception-first finance workspace.

Location evidence is purpose-minimized and least-privilege. GPS is Off by
default, requested only after deliberate claimant choice, and never mandatory.
Raw continuous telemetry is not default approved evidence and requires its own
tenant-visible retention purpose.

## Consequences

- Tenants receive substantial policy flexibility without maintaining arbitrary
  code or confronting every possible control in one screen.
- Unsupported jurisdictions and exceptional policies remain usable through
  actual-expense or external-calculation continuity rather than guessed rates.
- Source certification, cumulative-capacity concurrency, exact arithmetic,
  duplicate coverage, source revisions, tenant isolation, privacy, offline
  recovery, accessibility, and historical replay are release-blocking proof.
- D10/D13 remain claim and approval authority, D1/D2 remain Field Account
  authority, D15 remains handoff authority, Phase 20 remains accounting
  authority, and external specialists/providers retain legal classification,
  tax, payroll, and payment authority.

## Rejected alternatives

- evidence-only travel claims as the sole experience;
- one mutable flat mileage/per-diem rate per tenant;
- a second travel policy resolver, workflow, queue, or application;
- arbitrary or natural-language financial rules and order-dependent matching;
- live approval-time rate, map, or route lookup;
- claimant-selected policies, implicit jurisdiction/classification, or global-
  compliance labels;
- implicit FX, mandatory GPS, destructive rate deletion, silent recalculation,
  or stacked reimbursement; and
- any copy or state that treats calculation or approval as availability,
  payability, reimbursement, payment, payroll, tax, posting, or reconciliation.

## Phase 21 D28 precision amendment

D18 native cumulative calculation begins only after the exact source-defined
pool or indivisible group has both a proved opening disposition and proved
prospective source completeness. A clean-period reset proves an opening zero,
not future completeness. Missing never becomes zero, later-arriving pools are
gated before first native use, and source-valid quantities above a rate band are
not rejected as though the band were a cap.

One stable Travel Allowance Capacity Key Contract prevents profile, source,
relationship, vehicle-record, or code-version churn from silently resetting
consumption. One immutable Admission Manifest covers the complete current
census; group-level first use is CAS-guarded, and late predecessor facts append
through affected-suffix correction. Any pool lacking safe opening or continuity
proof remains fully usable through this ADR's external-calculation lane.
See [ADR-0117](./0117-proof-gated-opening-cumulative-travel-allowance-admission.md).

## Related decisions

- [ADR-0090 — Finance-closed Field Account cycles](./0090-finance-closed-field-account-cycles.md)
- [ADR-0095 — Proof-gated parallel currency Field Accounts](./0095-proof-gated-parallel-currency-field-accounts.md)
- [ADR-0099 — Claim-level expense truth and purpose-routed tenant AI](./0099-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
- [ADR-0102 — Bounded prospective Expense Governance Profiles](./0102-bounded-prospective-expense-governance-profiles.md)
- [ADR-0104 — Artifact-always reimbursement handoff](./0104-artifact-always-reimbursement-handoff.md)
- [ADR-0117 — Proof-gated opening cumulative Travel Allowance admission](./0117-proof-gated-opening-cumulative-travel-allowance-admission.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md)
