# ADR-0211: Distinct-human approval for projection widening

**Status:** Accepted (Phase 3 A8 / ADR-C, with explicit later owner amendments).

This records accepted target intent for [AL-490](https://github.com/Asymmetric-al/core/issues/490),
not implementation, provider qualification or activation evidence.

## Context

A projection change can disclose previously hidden data. The existing contribution
correction engine supplies decision/audit primitives, but its unresolved financial
approval mode cannot determine the minimum disclosure safety floor.

## Decision

Reuse correction maker-checker primitives with mandatory distinct-human separation
of duties for every widening. Narrow and neutral changes apply immediately with
audit. A widening creates a pending request; projections retain the old policy
until an independently authorized human approves and apply succeeds. Switching
roles cannot let the same profile/human act as both maker and checker. This rule
is independent of C-01 and any Tenant financial ownership-mode enum.

Classify direction server-side; unknown/ambiguous changes and moves between
incomparable donor and missionary surfaces are widening. Recheck a mandatory base
fingerprint and server-owned editable-tuple allowlist on apply; stale/concurrent
decisions fail without publishing. Baseline rows require super-admin authority,
hard-locked processor fields cannot widen, and inverse-edit rollback passes the
same classifier and approval. Record identifiers-only audit.

## Trade-offs and rejected alternatives

Reject admin discretion or requester self-approval: one mistaken action would
publish a disclosure. Reject inheriting an optional financial approval mode: it
would weaken this independent floor. Reject reviewing every narrowing: it delays
safe containment. Mandatory review adds latency and pending-state/conflict work
for exposure expansion; immediate restriction preserves a fast safety response.
This is policy change control, not generalized blocking approval for all edits.

## Consequences

Future implementation must prove positive behavior and negative disclosure cases
at the shared boundary, with exact scope, current authority and PII-minimized
evidence. Publication of this record does not complete those qualification tasks.

## Related contracts

- [Amended Phase 3 PRD](../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md)
- [Document authority](../ai/document-authority.md)
- [Foundation change and future tasks](../../openspec/changes/sitestacker-parity/design.md#phase-3-foundation-governance--al-490)
- [ADR identity registry](registry.md)
