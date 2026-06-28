# ADR-CD-018: Blocked actions use mixed visibility with clear reasons

**Status:** Accepted (grill session 2026-05-28)

## Context

Contribution detail supports many role- and state-dependent actions. Showing all unavailable actions creates noise, but hiding meaningful blockers can leave staff confused about what must happen next.

## Decision

Use mixed visibility for unavailable actions:

- Hide irrelevant or unauthorized actions.
- Show meaningful blocked actions disabled when the blocker explains the workflow.
- Pair disabled actions with a staff-readable reason and next step.
- Keep technical details expandable or role-gated.
- Drive availability from backend policy/action metadata, not from client-only assumptions.

## Consequences

- The detail/action API should return availability metadata such as `available`, `blockedReason`, `nextStep`, and `riskLevel`.
- The UI can stay clean while still surfacing important blockers.
- Blocked reasons become part of the product language and should be tested for clarity.

## Alternatives rejected

- **Hide all unavailable actions:** Clean but confusing for workflow blockers.
- **Show all actions with disabled states:** Transparent but noisy.
- **Client-inferred disabled states:** Too easy to drift from server policy.
