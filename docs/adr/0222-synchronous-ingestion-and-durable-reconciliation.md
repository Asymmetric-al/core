# ADR-0222: Synchronous delivery ingestion with durable reconciliation

**Status:** Accepted (Phase 6 F6; October 8, 2026 owner reconciliation).

Accepted target intent for [AL-551](https://github.com/Asymmetric-al/core/issues/551),
not implementation, provider qualification or activation evidence.

## Context

The house outbound webhook path verifies signatures and performs a local idempotent write. Extra orchestration cannot replace database integrity.

## Decision

Choose **synchronous signed/idempotent ingestion + scheduled durable reconciliation**. Verify one connection revision/signature and synchronously transact minimized provider evidence, unique deduplication, exact attachment or quarantine and monotonic status reduction. Database constraints and reducer guards handle at-least-once/reordered events. Invalid evidence cannot select scope or create communication truth.

Inngest owns scheduled quarantine reconciliation and bounded proved historical backfill across recoverable boundaries. Future bulk/newsletter fan-out remains reserved and must use the same consent, intent, provider-envelope and history owners. No second ingestion queue, notification_queue revival or general workflow engine is introduced. Resend-only product email remains governed by Phase 17; normalized evidence does not authorize a speculative multi-provider framework.

## Trade-offs and rejected alternatives

- **Extra asynchronous ingestion queue:** rejected because one local transaction already provides the required ingestion guarantee and a queue adds a failure boundary.
- **Ordering/retry as an integrity mechanism:** rejected because duplicate/out-of-order delivery still requires SQL uniqueness and monotonic guards.
- **Prebuilt bulk/provider plug-ins:** rejected because reserved products require separate ratification and proof.

The chosen pattern costs explicit typed references and qualification evidence;
it preserves one owner for each fact instead of hiding authority in transport.

## Consequences

Future #556/#563 prove signed wrong-scope denial, duplicates, monotonic writes and bounded reconciliation. Bulk workers and transport activation are outside #551.

## Related contracts and grounding

- [Phase 6 owner PRD, including dated amendments](../prds/sitestacker-parity/phase-06-shared-communication-event-model.md)
- [Phase 3 projection, consent and export owner](../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md)
- [Phase 17 catalog/preparation/provider owner](../prds/sitestacker-parity/phase-17-system-messages-template-management.md)
- [Existing outbound-communications delta](../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
- [Program README](../prds/sitestacker-parity/README.md) and [parity matrix](../prds/sitestacker-parity/parity-matrix.md)
- [Build pattern and complete owner/prerequisite links](../prds/sitestacker-parity/phase-06-communication-views-build-pattern.md)
- [ADR registry](registry.md)
- Primary grounding: [Resend retries and replays](https://resend.com/docs/webhooks/retries-and-replays) and [Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency). These sources support the pattern; the owner contract determines Core's accepted scope.
