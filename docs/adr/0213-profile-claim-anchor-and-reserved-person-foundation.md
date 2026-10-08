# ADR-0213: Profile claim anchor and reserved typed person foundation

**Status:** Accepted (Phase 4 A2/A3/A6, with Phase 9 and Phase 25 amendments).

This records accepted target intent for AL-504, not installed schema,
implementation, provider qualification or activation evidence.

## Context

The original identity seam bound a login profile through `donors.profile_id`
and an `authz.memberships` row. Treating either physical reference as claim,
contact verification and authorization collapses independent authorities.
A future typed person foundation also needs a bounded migration target without
turning Phase 4 into a populated constituent graph.

## Decision

Retain profiles as the authentication anchor, while the current Phase 4 claim
owner atomically records the exact admitted principal/profile-to-Party/donor
binding, accepted historical proof, source-approved membership consequence and
identifiers-only Phase 3 audit. The original profile/membership shape is a
baseline integration input, not proof that the current binding contract exists.
A nonfinancial principal need not have a fabricated financial donor record.

Initial claim requires fresh single-use purpose-bound proof of control of the
intended contact email/mailbox and current claim/link policy. Established historical proof survives mutable contact changes;
new contact verification cannot overwrite a different established claim. Native
authentication and membership consequences confer no independent protected-read
authority: current Phase 12 context, subject, purpose and source admission still
apply through the existing projection boundary.

The empty `persons` anchor and nullable `person_id` on missionaries and profiles
are reserved migration targets, neither populated nor read by Phase 4 and not
certified installed by this record. Donors never receive `person_id`. Phase 9 C1
replaces that original proposed reservation with `donors.party_id` under the
Phase 7/9 Party owner. Consumers must prove actual migrations and source
contracts before depending on storage. This documentation ships no schema.

## Trade-offs and rejected alternatives

- **Populated person/constituent spine in Phase 4:** rejected because it expands
  foundation scope into later identity/Party ownership and migration work.
  A reserved typed seam preserves future adoption without claiming that delivery.
- **Polymorphic `(entity_type, entity_id)` identity-links design:** rejected
  because generic links blur typed ownership and make same-Tenant referential
  guarantees harder to establish. Existing provider links keep their own purpose;
  they do not become the claim authority.
- **Profile or membership row as proof and access:** rejected because mutable
  contact, accepted claim and current source authorization have different lifecycles.

## Consequences

Future implementation must classify claim provenance, leave ambiguous historical
records unresolved, and qualify exact atomic binding and protected-read denial.
The typed reservation does not activate donor-person linkage, cross-role dedupe
or a full identity-management product. Later Party owners govern their own
population and financial/document invariants.

## Related contracts

- [AL-504 documentation scope](https://github.com/Asymmetric-al/core/issues/504)
- [Current Phase 4 owner PRD](../prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md)
- [Phase 25 identity contract](../prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/identity.md)
- [Active foundation requirements](../../openspec/changes/sitestacker-parity/specs/platform-product-intent/spec.md)
- [Documentation and future implementation tasks](../../openspec/changes/sitestacker-parity/tasks.md#6-phase-4-durable-language--al-504)
- [ADR identity registry](registry.md)
