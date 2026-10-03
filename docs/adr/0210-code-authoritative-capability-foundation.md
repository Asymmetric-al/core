# ADR-0210: Code-authoritative capability foundation

**Status:** Accepted (Phase 3 A5 / D12 / ADR-B, with explicit later owner amendments).

This records accepted target intent for [AL-490](https://github.com/Asymmetric-al/core/issues/490),
not implementation, provider qualification or activation evidence.

## Context

Contribution operations already use fine-grained capabilities. Phase 3 needs a
shared foundation without prematurely building the configurable permission product.

## Decision

Keep one exhaustive typed code registry of capability metadata and role/subrole
bundles authoritative in Phase 3. The foundation inspection page is read-only;
policy or capability names are not editable grants. Resolve only applicable grant
sources inside one current server-validated Tenant Authorization Context, then
intersect the subtract-only floors. Unrelated memberships never union implicitly.

Defer `permission_capabilities` and `role_capability_grants` to Phase 12. Preserve
stable keys and a one-to-one future seeding shape so later generated tables are
additive consumers of code-owned meaning, not a competing definition store.
Reserved Tenant overrides remain dormant. The accepted Phase 12 context model
informs this contract without requiring the whole later grant product before
foundation delivery.

## Trade-offs and rejected alternatives

Reject database-authoritative editable capability definitions now: they lose
compile-time completeness and introduce synchronization and mutable-authority
risk for a read-only consumer. Reject a full CRUD matrix, group/inheritance and
impersonation product as Phase 3 scope. Code changes cost review and deployment,
but keep the early foundation exhaustive and testable. Later configurable grants
require their own owner implementation and qualification, not inferred completion.

## Consequences

Future implementation must prove positive behavior and negative disclosure cases
at the shared boundary, with exact scope, current authority and PII-minimized
evidence. Publication of this record does not complete those qualification tasks.

## Related contracts

- [Amended Phase 3 PRD](../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md)
- [Document authority](../ai/document-authority.md)
- [Foundation change and future tasks](../../openspec/changes/sitestacker-parity/design.md#phase-3-foundation-governance--al-490)
- [ADR identity registry](registry.md)
