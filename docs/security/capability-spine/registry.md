# Capability registry (#492; AL-2675)

`packages/auth/capabilities/**` holds the Phase 3 code-authoritative capability
registry ([ADR-0210](../../adr/0210-code-authoritative-capability-foundation.md),
D12, amended 2026-11-17). `@asym/auth` exports it as `./capabilities` since
AL-2675 (WP2a), which also gave the database its copy of the mapping: the SQL
function `authz.assignment_capabilities(assignment_id)`, which human commands
call through `tenant_guard.begin_human_command(tenant, capability)`. A
real-stack test compares the two for every grant subject and the
tenant-administrator flag
(`tests/unit/acceptance/issue-2675/capability-parity.realstack.acceptance.test.ts`);
change both together. There are no capability tables.

| File                        | Contents                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| `registry.ts`               | `CAPABILITY_REGISTRY`, `Capability`, `CAPABILITY_KEY_PATTERN`                              |
| `bundles.ts`                | `CAPABILITY_BUNDLES`, `GrantSubjectKey`, `ROLE_DEFAULT_BUNDLES`                            |
| `errors.ts`                 | `CapabilityResolutionError` and its codes                                                  |
| `effective-capabilities.ts` | `resolveEffectiveCapabilities`, `resolveAssignmentCapabilities` and the grant-source types |
| `rows.ts`                   | `capabilityRegistryRows()` seeding shape                                                   |

## Atoms

`Capability = keyof typeof CAPABILITY_REGISTRY`, so any other string is a type
error. Keys match `^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$`. Every entry carries
`label`, `description`, `domain` and `source: "code"`.

| Capability                               | Domain        | Origin                             |
| ---------------------------------------- | ------------- | ---------------------------------- |
| `contributions.view_detail`              | contributions | `ContributionCapability`           |
| `contributions.request_corrections`      | contributions | `ContributionCapability`           |
| `contributions.manage_table_preferences` | contributions | `ContributionCapability`           |
| `contributions.apply_corrections`        | contributions | `ContributionCapability`           |
| `contributions.manage_receipts`          | contributions | `ContributionCapability`           |
| `contributions.retry_crm_post`           | contributions | `ContributionCapability`           |
| `contributions.approve_corrections`      | contributions | `ContributionCapability`           |
| `contributions.run_refunds`              | contributions | `ContributionCapability`           |
| `contributions.use_provider_actions`     | contributions | `ContributionCapability`           |
| `contributions.manage_settings`          | contributions | `ContributionCapability`           |
| `crm.gift_history.manage_view_defaults`  | crm           | `ContributionCapability`           |
| `admin.dashboard.access`                 | admin         | `StaffCapability` (retired)        |
| `admin.crm.manage`                       | admin         | `StaffCapability` (retired)        |
| `admin.gifts.manage`                     | admin         | `StaffCapability` (retired)        |
| `admin.reports.view`                     | admin         | `StaffCapability` (retired)        |
| `permissions.view`                       | permissions   | Meta-capability (Phase 3 Module 5) |
| `permissions.propose_widening`           | permissions   | Meta-capability (maker)            |
| `permissions.approve_widening`           | permissions   | Meta-capability (checker)          |
| `people.manage_members`                  | people        | Plan 5.4 (AL-2675)                 |
| `people.erase`                           | people        | Plan 5.4 (AL-2675)                 |
| `sites.manage`                           | sites         | Plan 5.4 (AL-2675)                 |
| `payments.manage_account`                | payments      | Plan 5.4 (AL-2675)                 |
| `web_studio.edit`                        | web_studio    | Plan 5.4 (AL-2675)                 |
| `web_studio.publish`                     | web_studio    | Plan 5.4 (AL-2675)                 |
| `updates.review`                         | updates       | Plan 5.4 (AL-2675)                 |
| `safety.restrict_publication`            | safety        | Plan 5.4 (AL-2675)                 |
| `care.access`                            | care          | Plan 5.4 (AL-2675)                 |
| `imports.commit`                         | imports       | Plan 5.4 (AL-2675)                 |

## Bundles

Each chain is a strict superset at every step. The contribution chain
reproduces today's incumbent tiers (3 / 6 / 9 / 11 atoms).

| Bundle                  | Atoms                                                                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `staff_base`            | the four `admin.*` atoms (once the retired `STAFF_SUBROLE_CAPABILITIES`)                                                                                  |
| `donor_care`            | `view_detail`, `request_corrections`, `manage_table_preferences`                                                                                          |
| `finance_staff`         | `donor_care` + `apply_corrections`, `manage_receipts`, `retry_crm_post`                                                                                   |
| `finance_approver`      | `finance_staff` + `approve_corrections`, `run_refunds`, `use_provider_actions`                                                                            |
| `contribution_admin`    | `finance_approver` + `manage_settings`, `crm.gift_history.manage_view_defaults`                                                                           |
| `staff_finance`         | `web_studio.edit`, `updates.review` + `finance_staff`                                                                                                     |
| `staff_mobilizer`       | `web_studio.edit`, `updates.review` + `donor_care`                                                                                                        |
| `staff_development`     | `web_studio.edit`, `updates.review` + `donor_care` + `web_studio.publish`                                                                                 |
| `staff_hr`              | `web_studio.edit`, `updates.review` + `donor_care`                                                                                                        |
| `staff_member_care`     | `web_studio.edit`, `updates.review` + `donor_care` + `care.access`                                                                                        |
| `tenant_administration` | `people.manage_members`, `people.erase`, `sites.manage`, `payments.manage_account`, `web_studio.publish`, `safety.restrict_publication`, `imports.commit` |
| `permissions_viewer`    | `permissions.view`                                                                                                                                        |
| `permissions_proposer`  | `permissions_viewer` + `permissions.propose_widening`                                                                                                     |
| `permissions_approver`  | `permissions_proposer` + `permissions.approve_widening`; held by no subject until Phase 12                                                                |

Each staff sub-role has a bundle of its own (audit B05), so narrowing one
sub-role is an edit to its bundle. Mobilizer and hr hold the same atoms today:
the plan names none that distinguishes them. `donor_care`, `finance_staff` and
`finance_approver` stay as building blocks with stable keys; no subject holds
them directly.

## Default subjects

`GrantSubjectKey` is closed and derived from `MembershipRole` and
`StaffSubrole`, so adding a subrole fails `tsc` until it gets a row here.
`tenant_admin` is a named grant subject, not a membership role: the
tenant-administrator flag on a staff membership reaches the registry as this
grant (plan 5.1). `platform_admin` is retired with `super_admin` (AL-2675).

| Subject                             | Default bundles                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| `member:donor`, `member:missionary` | none                                                                                |
| `staff:finance`                     | `staff_base`, `staff_finance`                                                       |
| `staff:mobilizer`                   | `staff_base`, `staff_mobilizer`                                                     |
| `staff:development`                 | `staff_base`, `staff_development`                                                   |
| `staff:hr`                          | `staff_base`, `staff_hr`                                                            |
| `staff:member_care`                 | `staff_base`, `staff_member_care`                                                   |
| `tenant_admin`                      | `staff_base`, `contribution_admin`, `permissions_proposer`, `tenant_administration` |

A request acts under one membership row: its sub-role's bundles and, when the
row carries the flag, `tenant_admin`'s. `resolveAssignmentCapabilities` builds
that context from a selected assignment.

Four-eyes: a proposer never holds approve. `tenant_admin` can propose widenings
and no subject can approve them until Phase 12 issues an approver grant. No
member or staff subject holds a `permissions.*` atom.

A staff assignment with no subrole resolves to `donor_care` only, which is
today's behavior. This is code-only: it is not a grant subject and has no
seeding row.

## Resolver contract

`resolveEffectiveCapabilities(context, tenantOverrides?)` takes one
`SelectedGrantContext` `{ tenantId, sources }`. Sources are at most one
`assignment` (`assignmentId`, `tenantId`, `role`, `staffRole`, `isActive`) plus
any `named` grants (`grantId`, `tenantId`, `subject`, `active`). It has no slot
for `AuthenticatedContext`, other memberships or a profile role, so hats never
union. An assignment maps to its subject by Record lookup, never by comparing
role names.

It reads the context and each source's fields once into plain copies,
validates everything before unioning, then returns the sorted, de-duplicated,
frozen union of the sources' default bundles. On bad input it throws
`CapabilityResolutionError`. Its message is the code, and its only own
enumerable fields are `code` and `name` (the constant class name):

| Code                       | When                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `tenant_overrides_dormant` | `tenantOverrides` is anything but `undefined`                                        |
| `missing_context`          | no context, empty tenant id, non-array sources or an unknown source kind             |
| `foreign_tenant`           | a source's tenant differs from the context's (checked before revocation)             |
| `inactive_source`          | an assignment or named grant is not active                                           |
| `multiple_assignments`     | more than one assignment source                                                      |
| `unknown_subject`          | an unknown role, subrole or named subject, or a subrole that is not null or a string |

Suspension has no state of its own. A suspended assignment or grant is issued
with `isActive: false` (assignment) or `active: false` (named grant), never
omitted. Any inactive source fails the whole context with `inactive_source`.

The registry, bundle and default-bundle tables are deep-frozen at module load.

## Dormant overrides

`tenantOverrides` is typed `DormantTenantOverrides = undefined`. Omitting it or
passing `undefined` yields exactly the platform defaults; any other value fails
`tsc` and throws at runtime. This is not the #1954 field-policy
`tenantOverrides` used by projection; the two seams only share a name.

## Seeding rows

`capabilityRegistryRows()` is pure and deterministic. It returns `capabilities`
(`key`, `label`, `description`, `domain`, `source`, sorted by key) and
`roleGrants` (`subject`, `capability`, flattened from the defaults, unique,
sorted by subject then capability). This is the 1:1 shape #671 seeds into
`permission_capabilities` and `role_capability_grants`, and #497's `/minimum`
read model.

## Known unregistered strings (OQ4)

These capability-shaped strings stay outside the registry for now; #2285's
baseline covers their role checks:

- `ai.settings.manage`: a store-backed Eve grant.
- `automation:manage`: the automation permission.
- `finance:manage_contributions`: the legacy contribution permission.

## Hand-offs

- #2282 (#667(a)): makes `resolveEffectiveCapabilities` its private union step,
  wraps it in the PDP, extends `CapabilityMeta` and the error codes additively,
  adds the `./capabilities` export and creates this folder's `README.md`.
- #671: generates the capability tables from `capabilityRegistryRows()`.
- #497: renders `/minimum` from the same rows.
- #498: enforces `permissions.approve_widening` through #667's
  `assertCapability`, including the self-approval check.
- #2284 sources `tenant_admin`: since AL-2675 it is the flag on a staff
  membership. #2281 was to source `platform_admin` grants; that subject is
  retired, and WP10 adds the operator's read-only support-grant bundle.
