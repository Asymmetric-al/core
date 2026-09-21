# ADR-CD-025: Current owner policy controls correction approval ownership

**Status:** Accepted 2026-05-29; current Decision amended 2026-09-16 under
AL-1861 to incorporate the ratified [owner contracts](../../README.md).

## Context

Tenants may add preventive approval while preserving the Phase 13 light default and Phase 12 authorization boundaries.

## Decision

- Second approval is optional and off by default. Source actions remain
  capability-, reason- and audit-gated regardless of a second approver.
- Phase 12 evaluates enabled owner action/threshold policy with current actor,
  tenant, source scope and version; role labels alone never authorize.
- When separation of duties applies, the requester cannot approve. A local
  suppression setting or superadmin label cannot override the exclusion.
- Resolve eligible approvers through current policy. Responsibility changes
  and notifications never grant decision rights.
- Authorize/audit policy changes separately; they cannot retroactively change
  prior source/provider outcomes.

## Consequences

Explain why approval is required and the eligible next step. Recheck authority and source version at decision, and report pending, approved, rejected, stale or superseded context truthfully.

## Historical decision and rationale

The [original 2026-05-29 record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0025-configurable-correction-approval-ownership.md) preserves the earlier
wording, alternatives and reasoning at its exact Git revision. This amendment
changes the current Decision on 2026-09-16; it does not attribute later owner
rulings to the original date or claim runtime implementation.
