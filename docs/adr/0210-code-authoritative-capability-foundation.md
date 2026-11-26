# ADR-0210: Code-authoritative capability foundation

**Status:** Accepted (Phase 3 A5 / D12 / ADR-B, with explicit later owner amendments; capabilities added 2026-11-17 for AL-2688).

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

## Amendments

### 2026-11-17: Capabilities for the foundation commands (AL-2688)

- **Authority.** The owner's instruction of 17 November 2026 to implement the
  CRM, CMS and database plan ratifies the disposition its
  [section 14](../audits/core-crm-cms-database-target-architecture.md#14-required-future-documentation-decisions)
  lists for this record: keep it, and record what follows. This records intent,
  not implementation; the
  [implementation record](../audits/core-crm-cms-database-implementation-record.md)
  says what exists.
- **Names are defaults.** The names below and the bundles that hold them are
  the plan section 15.1 default taken under the implementation record (D-08),
  not fresh owner rulings.
- **New capabilities, with their default holders:** `people.manage_members`
  (tenant administrator); `sites.manage` (tenant administrator);
  `payments.manage_account` (tenant administrator); `web_studio.edit` (every
  staff sub-role); `web_studio.publish` (the development sub-role and the tenant
  administrator); `updates.review` (every staff sub-role);
  `safety.restrict_publication` (tenant administrator); `care.access` (the
  member-care sub-role); `imports.commit` (tenant administrator); `people.erase`
  (tenant administrator).
- **Moves and retirements.** Tenant administration is a flag on a staff
  membership and reaches the registry as the existing `tenant_admin` grant. The
  `platform_admin` grant is retired with `super_admin`: its contribution-settings
  bundle moves to the tenant administrator, and approving a widening of
  permissions has no holder until Phase 12. Contribution operations' own
  capability table is retired for the registry. The finance-approver bundle
  stays with the tenant administrator unless the owner gives it to the finance
  sub-role (implementation record, D-06). From WP10 an operator under a support
  grant receives one read-only bundle (proposed: `admin.dashboard.access` and
  `admin.reports.view`).
- **Nothing new about aggregation.** A request acts under one selected
  assignment, which the accepted identity-and-access contract already requires
  ([ADR-0227](0227-one-policy-pattern-and-the-carried-tenant.md)).
- **A function, not a table.** Command functions check a capability in the
  database through one SQL function that holds the bundle-to-capability
  mapping, and a test compares that function with the registry on every change.
  The capability tables stay deferred to Phase 12, as this record decides.

### 2026-11-26: The missionary's first capability (AL-2678)

- 2026-11-26: `partners.add` (`member:missionary`, bundle `missionary_partners`),
  D-16 ruling `reviews\decision-wp5-add-partner-entry.md`; withdrawable per
  tenant only once Phase 12's configurable grants exist.

## Related contracts

- [Amended Phase 3 PRD](../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md)
- [Document authority](../ai/document-authority.md)
- [Foundation change and future tasks](../../openspec/changes/sitestacker-parity/design.md#phase-3-foundation-governance--al-490)
- [ADR identity registry](registry.md)
