# ADR-CD-012: Native CRM projects one gift with its complete designation lines

**Status:** Accepted 2026-05-28; current Decision amended 2026-09-16 under
AL-1861 to incorporate the ratified [owner contracts](../../README.md).

## Context

CRM history and Contributions Hub are views of the same source-owned gift, which may contain several equally important lines.

## Decision

- Read the Phase 13 header and complete authorized designation set through
  the shared effective read model.
- Show one gift with expandable lines; do not create parallel CRM parent/child
  money records or a replication process.
- Show actual source posting, integrity and provider exceptions with the owning
  recovery action. UI refresh failure is not a CRM post failure.
- Twenty is retired: no post/repost queue, vendor adapter, retry operation,
  capability or fallback belongs to the current contract.
- Shared-field parity and native CRM-only donor context follow ADR-CD-032.

## Consequences

Split gifts stay understandable without duplicate money truth. Restore stale views through authorized refetch; do not manufacture copy/repost jobs or infer source completion from projection visibility.

## Historical decision and rationale

The [original 2026-05-28 record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0012-crm-parent-gift-child-designation-records.md) preserves the earlier
wording, alternatives and reasoning at its exact Git revision. This amendment
changes the current Decision on 2026-09-16; it does not attribute later owner
rulings to the original date or claim runtime implementation.
