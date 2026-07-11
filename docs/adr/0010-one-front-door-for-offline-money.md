# ADR-0010: One front door for offline money

**Status:** Accepted (founder ruling, Phase 15 grill session 2026-07-11 — D1)

> Full record: `docs/prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md`
> (ratified decision D1 + its hardening amendments D1.a–D1.c).

## Context

Staff-entered offline gifts (check, cash, ACH/wire, church remittance) need a
home. Market CRMs split single-gift entry from batch entry into two code paths
(RE NXT dialog vs. legacy batch; Bloomerang punts to a Google Sheets add-on),
which lets casual entry route around the finance controls that only the batch
flow enforces. The repo already carries a built-but-unwired Track-B offline
slice that would `501` into a second write path against the flat `donations`
table — a side gate we must not open.

## Decision

**Every offline gift enters through a gift-entry batch; a single gift is a
batch of one.** One UI, two experiences over one domain: "New batch" (the
workbench) and "Quick entry" (auto-creates a one-row batch with defaults
prefilled and hides the word "batch" from casual staff). Behind them sits ONE
staging model, ONE validation engine, ONE atomic commit service — the sole
writer of offline money, posting through the Phase 13 ledger — and ONE audit
spine. Nothing else writes offline money: the Phase 39 no-offline-money-writes
guardrail is preserved, and the unwired Track-B 501 dialog write-path is
retired in build slice one.

## Consequences

- Finance controls (control totals, review/approval, deposit grouping,
  receipts, audit) apply universally because there is no side gate to slip
  through — every rule is enforced once, not twice.
- `gift_entry_batches` (creates NEW contributions) is a domain distinct from
  `contribution_operation_batches` (bulk operations over EXISTING gifts); they
  may share generic infra but never share domain records or state machines.
- A guard test asserts that no path other than the commit service writes
  offline money — the one-door invariant is enforced in CI, not just intent.
- Accepted tradeoff: quick entry must stay genuinely light (carried into D2's
  policy-scaled strictness), or casual staff route around the product and the
  one-door guarantee erodes in practice.
