# ADR-CD-004: Corrections use the canonical append-only contribution ledger

**Status:** Accepted 2026-05-28; current Decision amended 2026-09-16 under
AL-1861 to incorporate the ratified [owner contracts](../../README.md).

## Context

Staff need auditable effective gift values without losing original facts. Source acceptance, optional approval and downstream results are separate.

## Decision

- Phase 13 D2/D3 owns header identity, designation lines, append-only postings
  and one effective fold. The atomic cutover preserves legacy UUIDs and
  reconciles old adjustment evidence into postings.
- Money corrections append exact per-line/source postings through the shared
  command. Never patch settled money, replace a whole line array or retain a
  parallel feature-local adjustment ledger.
- Phase 13 D5/Phase 12 requires action capability, reason and active audit.
  Second approval is optional/off by default; enabled separation of duties
  excludes the requester. Nonfinancial fields follow their owning command.
- A refund request/approval is not refunded money. Only the exact provider-
  confirmed source event creates the corresponding ledger effect.
- CRM, Hub, detail and reporting consume the same effective fold and expose
  original versus effective values when useful, with source/audit lineage.

## Consequences

Detail returns posting/source revisions, pending approval when required and independent downstream outcomes. Idempotency, current authorization and stale-version checks apply to inline and full-detail commands.

## Historical decision and rationale

The [original 2026-05-28 record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0004-adjustment-records-for-corrections.md) preserves the earlier
wording, alternatives and reasoning at its exact Git revision. This amendment
changes the current Decision on 2026-09-16; it does not attribute later owner
rulings to the original date or claim runtime implementation.
