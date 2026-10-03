# ADR-0212: One export policy and shared csvSafeCell

**Status:** Accepted (Phase 3 A6 / ADR-D, with explicit later owner amendments).

This records accepted target intent for [AL-490](https://github.com/Asymmetric-al/core/issues/490),
not implementation, provider qualification or activation evidence.

## Context

On-screen visibility, hardcoded export columns and independent CSV escaping can
disagree. An export needs a stricter policy and one spreadsheet-safe encoder.

## Decision

Use one projection/export policy source. `exportable` is authoritative: serializers
consume the resolved field set, including classified derived report columns,
and cannot grant export from visibility alone. Destination/category restrictions
exclude internal/care/security from external egress and processor identifiers
from bulk export. CSV and JSON share authorization, row scope and identifiers-only
audit of actual emitted rows; JSON retains its own typed representation.

All existing CSV consumers use one shared `csvSafeCell`, consuming the same helper
as the fast-track patch. It neutralizes leading `=`, `+`, `-`, `@`, TAB, CR and LF,
applies RFC 4180 quoting, and emits CRLF with UTF-8 BOM. No second escaping
implementation is permitted. Canonical consent gates contact-list egress and
recipient delivery; staff synthetic preparation and admitted self-service access
are not contact. Phase 17/6 own communication preparation/dispatch and Phase 7/18
own official facts/artifacts. No parallel direct sender or text receipt is created;
exact owner qualification gates dependent output. Mailchimp remains a later
governed contract, not a new provider delivered by this foundation.

## Trade-offs and rejected alternatives

Reject serializer-owned hardcoded authorization and visibility-as-exportability:
they can restore policy-hidden data. Reject multiple escaping helpers: fixes drift
between consumers. Central governance requires derived-column census and consumer
rewiring, but makes emitted columns provable across formats. CSV encoding changes
representation for spreadsheet safety and is not lossless data authority; JSON
shares the field floor without CSV transformations. New providers/transports and
preference-center products remain separately deferred.

## Consequences

Future implementation must prove positive behavior and negative disclosure cases
at the shared boundary, with exact scope, current authority and PII-minimized
evidence. Publication of this record does not complete those qualification tasks.

## Related contracts

- [Amended Phase 3 PRD](../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md)
- [Document authority](../ai/document-authority.md)
- [Foundation change and future tasks](../../openspec/changes/sitestacker-parity/design.md#phase-3-foundation-governance--al-490)
- [ADR identity registry](registry.md)
