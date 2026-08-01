# ADR-0007: Undeposited-funds deposit model — batch and deposit decoupled

**Status:** Accepted (founder ruling, Phase 15 grill session 2026-07-11 — D6;
amended 2026-07-27 for Phase 20 D1–D20 congruency)

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
`deposit_groups` table plus one append-only, gift-grain
`deposit_assignment_events` stream and a **derived** current assignment and
operational deposit-state (`undeposited / in_open_deposit / deposited /
returned`) retiring `deposit_reference`. No mutable deposit pointer lives on a
posted contribution.

The locked assignment command compare-and-sets a monotonic per-gift sequence
and enforces one Tenant, Legal Entity, currency, and eligible settlement rail.
Grouping moves no money and creates no contribution posting. Stripe-settled
tenders are DB-rejected from manual deposits. Live membership stays editable;
Phase 20 atomically pins the exact assignment cursor and member set it consumed
in immutable Source Coverage, so later changes cannot rewrite an existing
Accounting Release. A printed slip is a retained immutable snapshot.
Conservation is soft, never a second posting gate. Phase 15 owns grouping,
slips, and operational state; Phase 20 owns balanced Accounting Effects and
bounded Bank Match; QBO/Xero owns the native GL and final reconciliation.

## Consequences

- One model serves all six variants — entry-vs-deposit order and cardinality
  (1:1, N:1, 1:N) are unfixed; assignment stays optional and editable after
  posting.
- Two money-integrity blockers become hard DB invariants: a Stripe-rail tender
  cannot receive a group-targeting assignment event, and one gift cannot have
  two current assignments under concurrent commands.
- Phase 13 remains fully append-only because Phase 15 never mutates the
  contribution header or postings for grouping.
- No GL, Bank Match, final bank reconciliation, cleared-aging engine, N:M
  junction, per-tenant "deposit mode" config, or stored state enum in Phase 15
  — the operational state is derived; Phase 20 supplies accounting projection
  and Bank Match, while QBO/Xero supplies the final books/reconciliation.
- A printed slip, a Phase 20 Source Coverage set, and the current live
  assignment may legitimately differ. Each is labelled and independently
  reproducible; no historical evidence is rewritten.
