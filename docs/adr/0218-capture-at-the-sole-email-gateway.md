# ADR-0218: Capture communication by construction at the sole email gateway

**Status:** Accepted (Phase 6 F2; October 8, 2026 owner reconciliation).

Accepted target intent for [AL-551](https://github.com/Asymmetric-al/core/issues/551),
not implementation, provider qualification or activation evidence.

## Context

Caller-remembered logging misses sends and permits multiple histories. A local transaction cannot make external provider I/O atomic.

## Decision

Choose **single gateway + transactional capture/outbox**. Server-only `packages/api` owns `sendEmail`; each admitted real-recipient business dispatch atomically binds its canonical event, intent, exact scope/recipient revisions, relations and consent evaluation to the local dispatch/submission evidence. External I/O uses the frozen submission-envelope idempotency identity; an uncertain boundary is reconciled before retry, never described as an atomic database/provider transaction.

Planned hard-blocking CI sole-seam enforcement forbids provider-SDK sends outside this gateway. Support outbound reuses the same canonical event rather than double-logging at its emitter. Synthetic previews and test sends produce bounded test/audit/provider-operation evidence, never Party/source-record communication history. An in-product interaction records only local `available` truth without email/provider evidence.

## Trade-offs and rejected alternatives

- **Caller-remembered logging:** rejected because every producer must otherwise remember a fragile side effect.
- **Bypass senders/direct SDK calls:** rejected because they evade consent, scope and history enforcement.
- **Pretending provider I/O is a DB transaction:** rejected because timeout uncertainty requires durable reconciliation.

The chosen pattern costs explicit typed references and qualification evidence;
it preserves one owner for each fact instead of hiding authority in transport.

## Consequences

Future #554 and #565 must prove atomic local capture, crash/replay/idempotency and sole-seam enforcement. This publication adds no lint or sender.

## Related contracts and grounding

- [Phase 6 owner PRD, including dated amendments](../prds/sitestacker-parity/phase-06-shared-communication-event-model.md)
- [Phase 3 projection, consent and export owner](../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md)
- [Phase 17 catalog/preparation/provider owner](../prds/sitestacker-parity/phase-17-system-messages-template-management.md)
- [Existing outbound-communications delta](../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
- [Program README](../prds/sitestacker-parity/README.md) and [parity matrix](../prds/sitestacker-parity/parity-matrix.md)
- [Build pattern and complete owner/prerequisite links](../prds/sitestacker-parity/phase-06-communication-views-build-pattern.md)
- [ADR registry](registry.md)
- Primary grounding: [Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html) and [ESLint restricted imports](https://eslint.org/docs/latest/rules/no-restricted-imports). These sources support the pattern; the owner contract determines Core's accepted scope.
