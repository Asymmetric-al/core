# ADR-0209: Static field policies and subtract-only projection

**Status:** Accepted (Phase 3 A3–A4 / ADR-A, with explicit later owner amendments).

This records accepted target intent for [AL-490](https://github.com/Asymmetric-al/core/issues/490),
not implementation, provider qualification or activation evidence.

## Context

Independent portal allowlists drift as fields and surfaces expand. Mixing field
classification with conditional record access makes exposure hard to inspect and
negative cases hard to prove.

## Decision

Use `field_policies` as a field-only static lookup of record type, field key,
surface and the reserved dormant Tenant dimension to visibility, editability,
exportability and sensitivity. It contains no conditional expressions, dotted-key
execution or per-value provenance. Classify whole JSONB/array columns; unknown
keys, surfaces and unclassified fields fail closed outside Mission Control.

One server-side resolver owns conditional/row logic and only subtracts from field
policy: Tenant, exact Legal Entity, purpose, ownership, relationship, anonymity,
record flags/state and applicable consent. Legal Entity is an exact row floor
inside Tenant, not a policy dimension or another role system. Capabilities apply
inside one validated Tenant Authorization Context; neither another hat nor RLS
visibility can enlarge the projection. Processor identifiers retain hard locks.
The retired CRM→surface shadow-sync stack is not this access model.

## Trade-offs and rejected alternatives

Reject a runtime rules engine and value-provenance visibility: they introduce
unbounded evaluation paths and unpredictable auditing. Reject surface-local
allowlists as authority because they drift. The static model costs a reviewed
field census and centralized predicate tests, but yields deterministic inspection
and fail-closed evolution. Future record families must register and classify
before exposure; this decision does not deliver their features.

## Consequences

Future implementation must prove positive behavior and negative disclosure cases
at the shared boundary, with exact scope, current authority and PII-minimized
evidence. Publication of this record does not complete those qualification tasks.

## Related contracts

- [Amended Phase 3 PRD](../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md)
- [Document authority](../ai/document-authority.md)
- [Foundation change and future tasks](../../openspec/changes/sitestacker-parity/design.md#phase-3-foundation-governance--al-490)
- [ADR identity registry](registry.md)
