# ADR-CD-017: Contribution detail actions use next-best-action visibility

**Status:** Accepted (grill session 2026-05-28)

**Current amendment — 2026-09-16 (AL-1861):** The Decision below uses the
ratified [owner contracts](../../README.md); unchanged UI decisions remain valid.

## Context

Contribution detail can support many operations: receipt actions, correction edits, correction approvals, source-qualified recovery, refund workflows, Stripe webhook replay, sync status, technical reference copying, and admin overrides. Showing every possible action at once would add visual noise and increase the chance of staff taking the wrong action.

The product goal is a simple, understandable UI that still supports advanced finance/admin workflows.

## Decision

Use a hybrid action model:

- Show only the next one or two valid state-based actions by default.
- Put secondary, high-risk, admin, and technical actions under More actions or role-gated expandable sections.
- Hide actions unavailable to the user's role/state, unless showing a disabled action with an explanation materially helps staff understand what is blocked.
- Require confirmation, reason, audit, idempotency, and policy enforcement for high-risk actions.
- Separate provider/technical actions from staff-facing financial actions.

## Consequences

- The detail payload should include action availability, reasons, risk level, and recommended next actions.
- UI logic should not infer permissions from buttons alone; server policy remains authoritative.
- Staff see a clean default action area while finance/admin still have access to advanced operations.

## Alternatives rejected

- **Show all permitted actions:** Too noisy and error-prone.
- **Risk-only hierarchy:** Does not account for gift state; low-risk actions can still be irrelevant.
- **State-only hierarchy:** Does not sufficiently protect high-risk technical/provider actions.

## Original decision provenance

The [original dated record](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/features/mission-control/contribution-detail/docs/adr/0017-next-best-action-risk-disclosure.md) preserves earlier wording and
rationale. Current terminology and applicability were amended on 2026-09-16;
documentation does not establish runtime activation.
