# Proof-gated opening cumulative Travel Allowance admission

**Status:** Accepted (founder ruling, Phase 21 grill session — D28)

## Context

Phase 21 D18 permits certified cumulative mileage and allowance calculations,
but a tenant can begin using them after a policy period has already started.
Treating a missing prior-use value as zero selects the wrong rate or remaining
capacity. Waiting for a clean period removes that opening uncertainty, but does
not prove that source-required facts which continue outside Asym — such as
private vehicle travel, another same-kind vehicle, or an associated employment
— will be observed afterward.

A mutable counter or reconstructed claim history would create a second travel
ledger and make corrections unsafe. Making every uncertain pool wait or blocking
the tenant's expense workflow would also be disproportionate because D18 already
has an exact external-calculation lane.

## Decision

Each exact source-defined cumulative pool or indivisible aggregation group must
receive one immutable **Travel Allowance Cumulative Admission** before its first
native D18 allocation. Admission proves two independent axes for one named
authority interval:

1. opening state through `clean_boundary_zero`,
   `opening_cumulative_state`, or `external_at_boundary`; and
2. prospective completeness through `asym_source_complete`,
   `authoritative_feed_complete`, or `external_calculation`.

The guided default is the next source-defined clean period, but a reset proves
only the opening zero. Native calculation starts only when prospective source
completeness is also proved. Otherwise that pool remains fully usable through
D18's external-calculation lane, including after later resets when external
facts still prevent completeness.

One versioned **Travel Allowance Capacity Key Contract** preserves the exact
source-defined accumulator semantics, ordering fact, period/reset, unit,
aggregation scope, relationship dimensions, band-versus-cap meaning,
restoration behavior, and pool succession. Routine configuration or code
version changes cannot reset usage. One content-addressed **Travel Allowance
Cumulative Admission Manifest** gives every current eligible pool or atomic
group exactly one opening and one continuity disposition. Later-arriving pools
receive the same proof before native first use.

Admission and first native allocation share one group-level compare-and-swap,
semantic idempotency identity, and final authorization reproof. In-flight and
late predecessor facts receive one exact owner. Corrections append and recompute
only the affected suffix or indivisible group; they never rewrite history or
create claim, approval, Field Account, reimbursement, payment, payroll/tax,
statement, accounting, posting, or reconciliation truth.

D18 owns these semantics. D27 may reference current admission proof for an
optional capability but cannot recreate or waive it, gate safe Core Field
Accounts, or reopen D17. Phase 30 may accelerate private bulk preparation but
cannot define the source meaning or activate native calculation.

## Consequences

- Clean-period activation remains the quiet zero-work default for ordinary
  tenants without treating a reset as universal future completeness.
- Mid-period adopters can supply one bounded source-defined aggregate without
  fabricating historic claims.
- Uncertain or externally changing scopes retain a complete ordinary expense
  path instead of being blocked or guessed.
- Stable pool identity, group-atomic first use, append-only correction, tenant
  isolation, exact units, accessibility, and bypass-role authorization tests are
  release-blocking proof.

## Related decisions

- [ADR-0074 — Bounded prospective Expense Governance Profiles](./0074-bounded-prospective-expense-governance-profiles.md)
- [ADR-0079 — Certified policy-pinned Travel Allowance calculations](./0079-certified-policy-pinned-travel-allowance-calculations.md)
- [ADR-0088 — Evidence-gated Core Field Accounts production activation](./0088-evidence-gated-core-field-accounts-production-activation.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md)
