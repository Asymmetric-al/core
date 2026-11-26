# 0014. Capability defaults live in code, and grants resolve within one selected context

**Status:** Recorded on 2026-11-22 from code comments in `packages/auth`
([#2751](https://github.com/Asymmetric-al/core/issues/2751)). It describes the
code as it is and ratifies no product intent. Accepted platform intent is in
[`docs/adr/`](../../../../docs/adr/README.md).

## Context

A capability is one named permission, such as `contributions.view_detail`,
defined in `CAPABILITY_REGISTRY` in `capabilities/registry.ts`. Capabilities
reach people through bundles, named lists of capabilities in
`capabilities/bundles.ts`, which each grant subject holds by default. A grant
subject is a member class, a staff sub-role, or the tenant-administrator flag.
The database checks the same capabilities in SQL, and Phase 12 is to add grant
tables seeded from this code, so the code must stay the one definition. A
request acts under one selected assignment, but the input that reaches the
resolver may hold a suspended source, a source from another tenant or a
malformed value, and the resolver must refuse it as a whole without saying more
than why.

## Decisions

### Defaults in code

1. **The contribution bundles reproduce the tiers that existed before the
   registry.** `CAPABILITY_BUNDLES` in `capabilities/bundles.ts` chains four
   bundles: `donor_care` (3 capabilities), `finance_staff` (6),
   `finance_approver` (9) and `contribution_admin` (11), each a strict superset
   of the one before it. These are the incumbent tiers. `staff_base` holds the
   four `admin.*` capabilities that every staff sub-role held under the retired
   `STAFF_SUBROLE_CAPABILITIES`; they moved into the registry because the plan
   allows one capability vocabulary. The registry therefore grants these holders
   at least what they held before it. Cited:
   [plan 5.1](../../../../docs/audits/core-crm-cms-database-target-architecture.md#51-authentication-and-authority);
   AL-2675.

2. **Each staff sub-role has its own bundle.** `CAPABILITY_BUNDLES` has
   `staff_finance`, `staff_mobilizer`, `staff_development`, `staff_hr` and
   `staff_member_care`, and `ROLE_DEFAULT_BUNDLES` gives each `staff:<sub-role>`
   subject `staff_base` plus its own bundle. Narrowing one sub-role is then an
   edit to its own bundle and changes no other. `staff_mobilizer` and `staff_hr`
   hold the same capabilities today, because the plan names none that tells them
   apart. Cited: B05 and A06, findings of the
   [CRM, CMS and database audit](../../../../docs/audits/core-crm-cms-database-audit.md).

3. **A new staff sub-role cannot ship without an entry in the default bundles.**
   `GrantSubjectKey` in `capabilities/bundles.ts` is built from the membership
   vocabulary: `member:` with each non-staff `MembershipRole`, `staff:` with each
   `StaffSubrole`, and the named subject `tenant_admin`. `ROLE_DEFAULT_BUNDLES`
   is typed as a record over every key, so the type check fails until a new
   sub-role has an entry, even an empty one.

4. **The default bundles per subject are the shape Phase 12 seeds.**
   `ROLE_DEFAULT_BUNDLES` in `capabilities/bundles.ts` is the role-grant seeding
   shape for Phase 12 (#671). Donors hold nothing by default; missionaries
   hold `missionary_partners` (`partners.add`, which no staff subject holds;
   AL-2678, D-16 ruling on Add Partner, 26 November 2026).
   Each staff sub-role holds `staff_base` and its own bundle. The tenant
   administrator (`tenant_admin`) holds `staff_base`, `contribution_admin`,
   `permissions_proposer` and `tenant_administration`, so it can propose a
   widening of permissions. No other subject holds a `permissions.*`
   capability, and no subject can approve a widening. Cited: Phase 12; #671.

5. **A staff assignment with no sub-role gets the donor-care tier, and only in
   code.** `UNSPECIALIZED_ASSIGNMENT_BUNDLES` in
   `capabilities/effective-capabilities.ts` maps an assignment that has no staff
   sub-role by its membership role: donors and missionaries to their member
   defaults, and staff to `donor_care` alone, the tier such staff held before.
   It is deliberately not a grant subject. It has no `GrantSubjectKey`, so
   `capabilityRegistryRows` emits no grant rows for it and Phase 12 seeds none.

6. **Shared tables are frozen at every depth.** `deepFreeze` in
   `capabilities/freeze.ts` freezes plain objects and arrays at every level,
   walking `Reflect.ownKeys` so symbol and non-enumerable keys are included. A
   node that is already frozen is not frozen again but is still walked, so a
   mutable child under a frozen parent is still frozen. It returns the same
   reference and never clones. The registry, the bundles and the default tables
   are built with it, so no consumer can widen a shared table at runtime.

7. **The seeding rows are deterministic.** `capabilityRegistryRows` in
   `capabilities/rows.ts` is a pure function that projects the registry and the
   default bundles into rows: one per capability, sorted by key, and one per
   unique pair of subject and capability, sorted by subject and then by
   capability. It is the one-to-one seeding shape for the Phase 12 capability
   and role-grant tables (#671) and is meant to be the read model for #497's
   `/minimum` page, which no route serves yet, so the same code must always give
   the same rows. Cited: Phase 12; #671; #497.

### Resolving within one context

8. **Any inactive source fails the whole context, and nothing is combined until
   every source passes.** `resolveEffectiveCapabilities` in
   `capabilities/effective-capabilities.ts` validates the whole selected context
   before it combines any bundle. A caller is to pass a suspended assignment or
   grant with `AssignmentGrantSource.isActive` or `NamedGrantSource.active` set
   to `false`, not leave it out of the context. Today the only caller,
   `resolveAssignmentCapabilities`, builds active sources alone, and `context.ts`
   returns no capabilities for an inactive membership before it calls that
   function. Any source whose flag is not `true` fails the
   context with `inactive_source`, so a missing flag fails the same way. The
   resolver never returns a partial set of capabilities: a bad source yields an
   error.

9. **Foreign tenancy is checked before revocation.**
   `resolveEffectiveCapabilities` fails with `foreign_tenant` when any source's
   tenant differs from the context's, before it checks whether the sources are
   active. A context that mixes in another tenant's source is refused without
   revealing whether that source was revoked.

10. **The resolver reads its input once and matches only exact keys.**
    `snapshotContext` in `capabilities/effective-capabilities.ts` reads the
    context's tenant and sources, and each source's fields, exactly once into
    plain `SourceSnapshot` objects. Validation and the union both use these
    copies, so a getter on the input cannot give one value to the check and
    another to the union. The snapshot fails with `missing_context` in five
    cases: the context is not an object, its tenant is not a non-empty string,
    its sources are not an array, a source is not an object, or a source's kind
    is neither `assignment` nor `named`. It does not read `assignmentId` or
    `grantId`, so a source without its ID is not refused for that.
    `lookup` matches only a primitive string that names an own property of the
    table, so an inherited name such as `toString` never selects a bundle.
    `assignmentBundles` accepts a sub-role only when it is `null` or a primitive
    string, so an object is never coerced into a key. A subject that matches
    nothing fails with `unknown_subject`.

11. **A resolution error says only its code.** `CapabilityResolutionError` in
    `capabilities/errors.ts` has the error code as its whole message and as its
    `code` field. It names no capability, tenant, assignment, grant or subject,
    so a logged or returned error discloses none of them. `contextCapabilities`
    and `membershipHasCapability` in `context.ts` treat the error as no
    capabilities.

## Accepted records this code implements

- `CAPABILITY_REGISTRY` in `capabilities/registry.ts` (the one exhaustive
  capability vocabulary; there is no capability table, and Phase 12 seeds its
  tables one-to-one from `capabilityRegistryRows`):
  [ADR-0210](../../../../docs/adr/0210-code-authoritative-capability-foundation.md),
  Decision.
- `DormantTenantOverrides` in `capabilities/effective-capabilities.ts` (only
  `undefined` is accepted; any other value fails with
  `tenant_overrides_dormant`):
  [ADR-0210](../../../../docs/adr/0210-code-authoritative-capability-foundation.md),
  Decision ("Reserved Tenant overrides remain dormant").
- `SelectedGrantContext` and `resolveEffectiveCapabilities` in
  `capabilities/effective-capabilities.ts` (the resolver accepts at most one
  assignment plus named grants, all in the context's tenant; a person's other
  memberships and profile roles have no slot):
  [ADR-0210](../../../../docs/adr/0210-code-authoritative-capability-foundation.md),
  Decision ("Unrelated memberships never union implicitly").
- `STAFF_CONTENT` in `capabilities/bundles.ts` (`web_studio.edit` and
  `updates.review` for every staff sub-role):
  [ADR-0210](../../../../docs/adr/0210-code-authoritative-capability-foundation.md),
  amendment of 2026-11-17, "New capabilities".
- `NamedGrantSubject` in `capabilities/bundles.ts` (the tenant-administrator
  flag on a staff membership reaches the registry as `tenant_admin`;
  `platform_admin` is retired with `super_admin`):
  [ADR-0210](../../../../docs/adr/0210-code-authoritative-capability-foundation.md),
  amendment of 2026-11-17, "Moves and retirements".
- `ROLE_DEFAULT_BUNDLES` in `capabilities/bundles.ts` (the tenant administrator
  holds `contribution_admin`, the contribution-settings bundle the retired
  `platform_admin` held):
  [ADR-0210](../../../../docs/adr/0210-code-authoritative-capability-foundation.md),
  amendment of 2026-11-17, "Moves and retirements".
- `CAPABILITY_BUNDLES.permissions_approver` in `capabilities/bundles.ts`
  (defined but held by no subject, because approving a widening of permissions
  has no holder until Phase 12):
  [ADR-0210](../../../../docs/adr/0210-code-authoritative-capability-foundation.md),
  amendment of 2026-11-17, "Moves and retirements".
- `resolveAssignmentCapabilities` and `SelectedAssignment.isTenantAdmin` in
  `capabilities/effective-capabilities.ts` (one membership row's bundles, plus
  `tenant_admin` only when that row is a staff row with the flag; no other row
  of the person counts):
  [ADR-0210](../../../../docs/adr/0210-code-authoritative-capability-foundation.md),
  Decision and amendment of 2026-11-17, "Moves and retirements".
- `CAPABILITY_BUNDLES` in `capabilities/bundles.ts` and
  `resolveAssignmentCapabilities` in `capabilities/effective-capabilities.ts`
  (the SQL function `authz.assignment_capabilities` holds the same mapping and
  applies it to the live membership row it reads by id, and
  [a real-stack test](../../../../tests/unit/acceptance/issue-2675/capability-parity.realstack.acceptance.test.ts)
  compares the two for every grant subject and the tenant-administrator flag,
  so both change together):
  [ADR-0210](../../../../docs/adr/0210-code-authoritative-capability-foundation.md),
  amendment of 2026-11-17, "A function, not a table".
