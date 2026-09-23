# ADR-CD-026: Source approval work uses shared tasks and Phase 17 attention

**Status:** Accepted 2026-05-29; current Decision amended 2026-09-16 under
AL-1861 to incorporate the ratified [owner contracts](../../README.md).

## Context

Actual pending approval needs durable work routing without making message delivery or personal preferences approval authority.

## Decision

- The source correction request remains approval authority and links to at
  most one shared approval task. Task lifecycle follows source transitions.
- Use exact Phase 17 contribution approval requested/reminder/escalated/outcome
  keys and their qualified recipient resolvers.
- Pending requests require the manifest in-product attention; email is an
  independently qualified optional step. Preferences cannot disable required
  attention or erase source work.
- Current eligible approvers/requesters receive only permitted minimal facts.
  Optional email cannot reveal richer donor or financial detail.
- Phase 17 prepares immutable material; Phase 6 owns dispatch/recovery/history.
  Read/archive/engagement cannot approve, complete or revive the request.
- Exact source/fence identities deduplicate work and notifications. Deep links
  reauthorize the source; possession grants nothing.

## Consequences

Preferences affect only options permitted by the message contract. Shared task routing is separate; users cannot suppress the obligation. Full automation-builder implementation is not required.

## Historical decision and rationale

The [original 2026-05-29 record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0026-configurable-correction-approval-notifications.md) preserves the earlier
wording, alternatives and reasoning at its exact Git revision. This amendment
changes the current Decision on 2026-09-16; it does not attribute later owner
rulings to the original date or claim runtime implementation.
