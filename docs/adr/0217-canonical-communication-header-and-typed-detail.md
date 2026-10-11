# ADR-0217: Asym-owned canonical communication header and typed detail

**Status:** Accepted (Phase 6 F1; October 8, 2026 owner reconciliation).

Accepted target intent for [AL-551](https://github.com/Asymmetric-al/core/issues/551),
not implementation, provider qualification or activation evidence.

## Context

Provider logs describe transport activity, while support and care own sensitive detail. A durable interaction fact needs identity and integrity independent of addresses and provider retention.

## Decision

Choose the **canonical header + typed detail** pattern. `communication_events` is the Asym-owned body-free interaction-fact header; `communication_event_relations` names same-scope source records without granting access. Strong typed foreign keys/exclusive arcs protect recipient and source-detail authority. A relation type is bounded vocabulary, not a raw polymorphic FK substitute for recipient authority.

Every execution and history reference preserves `scope_kind` and exactly one owner (`tenant_id` XOR `platform_scope_id`), environment and applicable exact connection revision. Tenant recipients resolve either the same-tenant Party and its purpose-eligible contact point with exact revision, or an explicitly contract-permitted same-tenant no-Party authority kind/id/revision. No-Party destinations exist only in bounded encrypted preparation. Platform recipients require the exact service-only `eve_platform_owner` record/revision/identity epoch; tenant/Party/contact fields stay null. Transitional donor/missionary IDs project the same Party and never create a second authority. Addresses, tags and provider payloads select neither identity nor scope. The current generation has no Live platform email key and does not dispatch one.

The header contains no body, transport address or personalized subject. Typed safe catalog metadata and normalized outcome remain; support/care payloads and official financial/document facts retain their separate owners.

## Trade-offs and rejected alternatives

- **Provider-log-as-truth:** rejected because transport evidence cannot establish a product interaction or recipient authority.
- **Wide nullable table or EAV:** rejected because unrelated channel payloads obscure typed ownership, privacy and integrity.
- **Raw polymorphic FK authority:** rejected because an unchecked type/id pair cannot prove same-scope recipient or payload ownership.

The chosen pattern costs explicit typed references and qualification evidence;
it preserves one owner for each fact instead of hiding authority in transport.

## Consequences

Future schema and service work must prove all closed branches, cross-scope denial and one history for a multi-hat Party. New relation vocabulary cannot widen record access. No schema is installed here.

## Related contracts and grounding

- [Phase 6 owner PRD, including dated amendments](../prds/sitestacker-parity/phase-06-shared-communication-event-model.md)
- [Phase 3 projection, consent and export owner](../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md)
- [Phase 17 catalog/preparation/provider owner](../prds/sitestacker-parity/phase-17-system-messages-template-management.md)
- [Existing outbound-communications delta](../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
- [Program README](../prds/sitestacker-parity/README.md) and [parity matrix](../prds/sitestacker-parity/parity-matrix.md)
- [Build pattern and complete owner/prerequisite links](../prds/sitestacker-parity/phase-06-communication-views-build-pattern.md)
- [ADR registry](registry.md)
- Primary grounding: [Class Table Inheritance](https://martinfowler.com/eaaCatalog/classTableInheritance.html). These sources support the pattern; the owner contract determines Core's accepted scope.
