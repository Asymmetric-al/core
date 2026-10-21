# ADR-0221: Keep bounded payload ownership behind one communication spine

**Status:** Accepted (Phase 6 F5; October 8, 2026 owner reconciliation).

Accepted target intent for [AL-551](https://github.com/Asymmetric-al/core/issues/551),
not implementation, provider qualification or activation evidence.

## Context

The July blanket “adapt, not migrate” mixed permanent support/care ownership with legacy transport consolidation. Leaving both transport histories authoritative would defeat the shared spine.

## Decision

Choose **permanent bounded-context detail + staged legacy email cutover**. Support Hub `support_messages` and member-care `member_care_activities` retain payload truth permanently. Their insert and one canonical reference event are atomic; outbound support is deduplicated with seam capture and care remains staff-only. These owners are not a migration backlog.

`email_send_logs` and `email_events` instead are real bounded migration/backfill/adapter inputs. Inventory every writer, reader, webhook lookup, reconciliation job and FK (including receipt and Support outbound references); add exact scoped internal correlation first; backfill only proved mappings; observe bounded reversible dual-write/adapter reads; move each consumer/FK; then fence legacy writers and remove recipient-based attachment. Missing mapping proof blocks removal. No authority flip occurs while a live dependency needs the old shape. After convergence only the one scoped submission/attempt/evidence spine and canonical communication history are authoritative.

The former “adapt, never migrate,” operational-key-only and recipient-email correlation clauses are superseded by the dated Phase 17 owner amendment and October 8 #551 reconciliation. Permanent support/care ownership remains; perpetual dual email authority does not.

## Trade-offs and rejected alternatives

- **Big-bang payload migration:** rejected because support/care detail has a permanent domain owner and need not move.
- **Perpetual dual email authority:** rejected because competing writers/histories break exact outcomes and correlation.
- **Inferred recipient/address backfill:** rejected because guessed mappings cannot establish Party, scope or connection revision.

The chosen pattern costs explicit typed references and qualification evidence;
it preserves one owner for each fact instead of hiding authority in transport.

## Consequences

Future cutover must prove consumer census, exact mapping, writer fencing and reversible bounded compatibility before removal. Publication migrates no rows, payloads or FKs.

## Related contracts and grounding

- [Phase 6 owner PRD, including dated amendments](../prds/sitestacker-parity/phase-06-shared-communication-event-model.md)
- [Phase 3 projection, consent and export owner](../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md)
- [Phase 17 catalog/preparation/provider owner](../prds/sitestacker-parity/phase-17-system-messages-template-management.md)
- [Existing outbound-communications delta](../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
- [Program README](../prds/sitestacker-parity/README.md) and [parity matrix](../prds/sitestacker-parity/parity-matrix.md)
- [Build pattern and complete owner/prerequisite links](../prds/sitestacker-parity/phase-06-communication-views-build-pattern.md)
- [ADR registry](registry.md)
- Primary grounding: [Parallel Change](https://martinfowler.com/bliki/ParallelChange.html). These sources support the pattern; the owner contract determines Core's accepted scope.
