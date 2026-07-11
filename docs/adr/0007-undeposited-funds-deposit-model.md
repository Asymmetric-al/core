# ADR-0007: Undeposited-funds deposit model — batch and deposit decoupled

**Status:** Accepted (founder ruling, Phase 15 grill session 2026-07-11 — D6)

> Full record: `docs/prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md`
> (ratified decision D6 + its hardening amendments HD-1..HD-16, as revised by
> the four founder micro-choices CB-A..CB-D).

## Context

Real tenants group gifts into bank deposits in mutually inconsistent ways: RDC
same-day, deposit-before-entry, entry-then-deposit-days-later, N-batches-to-one
weekly deposit, strict 1:1, and the same tenant mixing these week to week. A
rigid `batch = deposit` FK cannot express that, and Phase 13's flat
`deposit_reference` TEXT never modeled deposit as a lifecycle. The
QuickBooks/Aplos undeposited-funds pattern was field-validated as the one spine
covering all six variants with zero special cases.

## Decision

Model the deposit as a first-class object decoupled from the entry batch: a
`deposit_groups` table plus a **nullable, changeable, GIFT-grain scalar link on
the mutable contribution header** (never batch-grain, never a junction table),
and a **derived** deposit-state — a 6th orthogonal axis formalizing Phase 13's
recorded→deposited→cleared narrative and retiring `deposit_reference`. Grouping
moves no money: assignments are append-only `deposit_assignment_events` with no
compensating posting. Stripe-settled tenders are DB-rejected from manual deposits
(they reconcile via payouts, keyed on `settlement_rail`). Groups live in two
regimes — **open** (free add/remove/reassign, audit-stamped) until Phase 20
export, **exported** (compensating-correction-only); a printed slip is a retained
immutable snapshot. Conservation is soft (live tally + non-blocking warning),
never a hard gate. Phase 15 owns the grouping workflow, slip, and operational
state; Phase 20 owns the GL undeposited-funds account and bank-statement tie-out.

## Consequences

- One model serves all six variants — entry-vs-deposit order and cardinality
  (1:1, N:1, 1:N) are unfixed; assignment stays optional and editable after
  posting.
- Two money-integrity blockers become hard DB invariants: a Stripe-rail tender
  carries no deposit link (no double-count vs payout), and an exported deposit
  cannot be mutated by Phase 15.
- The link sits on the mutable header, not immutable postings, satisfying Phase 13
  append-only and "changeable after posting" at once.
- No GL, bank-rec, cleared-aging engine, N:M junction, per-tenant "deposit mode"
  config, or stored state enum in Phase 15 — the state is derived; the rest lives
  in Phase 20 or is cut as over-build.
- Consciously-accepted tradeoff (founder, CB-C/CB-D): free-until-export means a
  printed slip and the live record can diverge, mitigated by retained snapshots +
  audit; the cash-aging signal defaults on but is fully disable-able.
