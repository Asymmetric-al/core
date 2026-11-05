# ADR-IM-004: Switch-year tax documents follow where each gift was first recorded

**Status:** Accepted 2026-11-02 — ratified by the founder in the Phase 30 grill (Q4). Record: `docs/features/imports-migration/grill/decision-log.md` §1 Q4; evidence and acceptance criteria `grill/q04-switch-year-statements/` (`q04-adversarial-review.md`). Amends ADR-IM-001's decommission and surface rules (Q1 clauses 6, 7 and 12). Amended by ADR-IM-007 (2026-11-02, tail-gift effects). Amended by ADR-IM-012 (2026-11-03, Recorded outside Asym narrowed to a Switch's history import and Legacy Tail Backfills; Gift files are current gifts).

## Context

In the tax year a ministry switches, its donors have gifts in two systems, and legacy recurring gifts keep being charged by the old system during the tail. No owner document assigned switch-year tax documents, and Phase 7 E3 and #577 would receipt imported gifts by default, while C7 forbids receipts for pre-platform gifts. The CRA allows one official receipt per gift; the IRS requires a goods-or-services statement on the acknowledgment for gifts of $250 or more. Asym's Canadian receipting activates forward-only with no historical sweep (P18M:348). A Phase 7 correction re-evaluates eligibility (`contribution-operations.md:130-135`), so a non-permanent marker would let a correction mint a duplicate receipt.

## Decision

Each gift has exactly one tax-document issuer, fixed when it is first recorded and never by its date. Asym issues official tax documents only for gifts first recorded in Asym. Every gift that reaches Asym through a Phase 30 import or a Legacy Tail Backfill carries **Recorded outside Asym**, a Phase 7-owned receipt-boundary fact written by the owner import command in the same transaction, append-only, never removed by correction, re-dating, merge, refund or reversal, and enforced at the Phase 7 boundary and in the database; such gifts get no Asym receipt plan, acknowledgment, Canadian plan fact, official-document line or Late Fact Obligation. The ministry documents them outside Asym, normally with its previous system's usual documents. Go/no-go requires a named issuer for the switch year's pre-boundary gifts and each tail cohort per Legal Entity, Asym's tax-document setup active before Asym's first gift, and old-system gift entry Off; imports flag possible duplicates of Asym-recorded gifts. Decommission (not tail closure or Switch closed) requires attestations that the old documents are issued or ready and where old receipt copies and records are kept. The donor portal shows these gifts with three neutral sentences and no receipt action; a donor notice is worded by system. Money imports wait for the owner commands that write the fact and for retirement of the prototype receipt and statement paths.

## Considered options

- **One combined US statement from Asym (B):** the US vendor default, rejected because Asym would certify goods-or-services facts for gifts it never handled, and it needs C7 and Phase 7/18/19 amendments. It remains addable later, because the origin fact identifies these gifts.
- **Asym issues everything for the switch year (C):** rejected; needs backdated Canadian receipting and risks double receipts.
- **A four-value per-gift receipt status; holding Switch closed through tax season; a Phase 30 receipt-number prefix:** rejected as overbuilt or conflicting with Phase 18 (#944).

## Consequences

- Some donors receive year-end documents from two systems for the switch year (and the next, if the tail crosses 31 December); the notice, portal sentences and monitor M1 address the confusion.
- Owner amendments O22 (Phase 7/13), O23 (Phase 19), O24 (Phase 25) and O25 (Phase 18) are prerequisites for any switch that imports money.
- The ministry keeps one last year-end process in its old system and remains responsible for retaining its old receipt copies and records.
