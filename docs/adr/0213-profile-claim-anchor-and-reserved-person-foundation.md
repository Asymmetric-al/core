# ADR-0213: Profile claim anchor and reserved typed person foundation

**Status:** Accepted (Phase 4 A2/A3/A6, with Phase 9 and Phase 25 amendments; clarified 2026-11-17 for AL-2688).

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

## Amendments

### 2026-11-17: The Party is populated through its CRM owner, not the reserved `persons` seam (AL-2688)

- **Authority.** The owner's instruction of 17 November 2026 to implement the
  CRM, CMS and database plan ratifies the disposition its
  [section 14](../audits/core-crm-cms-database-target-architecture.md#14-required-future-documentation-decisions)
  lists for this record: keep it, and record what follows. This records intent,
  not implementation; the
  [implementation record](../audits/core-crm-cms-database-implementation-record.md)
  says what exists.
- **Clarification.** The Party model is populated through its CRM owner. Each
  donor and missionary gets a Party from evidence, not by matching names or
  emails, in `public.parties`, with `donors.party_id` and ministry-assignment
  keys that replace both meanings of `missionary_id` (plan WP5). Nothing is
  populated through the reserved `persons` anchor.
- **The reserved seam is retired.** The empty `persons` scaffold, with
  `missionaries.person_id`, `profiles.person_id` and their field-policy rows, is
  dropped, because nothing reads or writes them (plan WP5). The frozen
  person-anchor acceptance suite under `tests/unit/acceptance/issue-2256/` is
  rewritten or retired in the same package.
- **Kept.** Profiles stay the authentication anchor and hold display data only.
  A claim writes an account link from a login to a Party in one tenant, with
  fresh single-use proof of the contact, and never a `profile_id`. A gift never
  creates a link
  ([ADR-0215](0215-guest-attribution-exact-claim-proof-and-current-access.md)).
  Own-row access moves from `profile_id` to the account link.

## Related contracts

- [AL-504 documentation scope](https://github.com/Asymmetric-al/core/issues/504)
- [Current Phase 4 owner PRD](../prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md)
- [Phase 25 identity contract](../prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/identity.md)
- [Active foundation requirements](../../openspec/changes/sitestacker-parity/specs/platform-product-intent/spec.md)
- [Documentation and future implementation tasks](../../openspec/changes/sitestacker-parity/tasks.md#6-phase-4-durable-language--al-504)
- [ADR identity registry](registry.md)
