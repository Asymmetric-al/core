# Capability registry (#492)

`packages/auth/capabilities/**` holds the Phase 3 code-authoritative capability
registry ([ADR-0210](../../adr/0210-code-authoritative-capability-foundation.md),
D12). It is **prepared, not wired**: nothing outside the folder and its tests
imports it, `@asym/auth` exports no `./capabilities` subpath yet, and no live
authorization decision changes. There are no capability tables or migrations.

| File                        | Contents                                                        |
| --------------------------- | --------------------------------------------------------------- |
| `registry.ts`               | `CAPABILITY_REGISTRY`, `Capability`, `CAPABILITY_KEY_PATTERN`   |
| `bundles.ts`                | `CAPABILITY_BUNDLES`, `GrantSubjectKey`, `ROLE_DEFAULT_BUNDLES` |
| `errors.ts`                 | `CapabilityResolutionError` and its codes                       |
| `effective-capabilities.ts` | `resolveEffectiveCapabilities` and the grant-source types       |
| `rows.ts`                   | `capabilityRegistryRows()` seeding shape                        |

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
| `admin.dashboard.access`                 | admin         | `StaffCapability`                  |
| `admin.crm.manage`                       | admin         | `StaffCapability`                  |
| `admin.gifts.manage`                     | admin         | `StaffCapability`                  |
| `admin.reports.view`                     | admin         | `StaffCapability`                  |
| `permissions.view`                       | permissions   | Meta-capability (Phase 3 Module 5) |
| `permissions.propose_widening`           | permissions   | Meta-capability (maker)            |
| `permissions.approve_widening`           | permissions   | Meta-capability (checker)          |

## Bundles

Each chain is a strict superset at every step. The contribution chain
reproduces today's incumbent tiers (3 / 6 / 9 / 11 atoms).

| Bundle                 | Atoms                                                                           |
| ---------------------- | ------------------------------------------------------------------------------- |
| `staff_base`           | the four `admin.*` atoms (`STAFF_SUBROLE_CAPABILITIES`)                         |
| `donor_care`           | `view_detail`, `request_corrections`, `manage_table_preferences`                |
| `finance_staff`        | `donor_care` + `apply_corrections`, `manage_receipts`, `retry_crm_post`         |
| `finance_approver`     | `finance_staff` + `approve_corrections`, `run_refunds`, `use_provider_actions`  |
| `contribution_admin`   | `finance_approver` + `manage_settings`, `crm.gift_history.manage_view_defaults` |
| `permissions_viewer`   | `permissions.view`                                                              |
| `permissions_proposer` | `permissions_viewer` + `permissions.propose_widening`                           |
| `permissions_approver` | `permissions_proposer` + `permissions.approve_widening`                         |

## Default subjects

`GrantSubjectKey` is closed and derived from `MembershipRole` and
`StaffSubrole`, so adding a subrole fails `tsc` until it gets a row here.
`tenant_admin` and `platform_admin` are named grant subjects, not membership
roles.

| Subject                                                                 | Default bundles                                            |
| ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| `member:donor`, `member:missionary`                                     | none                                                       |
| `staff:finance`                                                         | `staff_base`, `finance_staff`                              |
| `staff:mobilizer`, `staff:development`, `staff:hr`, `staff:member_care` | `staff_base`, `donor_care`                                 |
| `tenant_admin`                                                          | `staff_base`, `finance_approver`, `permissions_proposer`   |
| `platform_admin`                                                        | `staff_base`, `contribution_admin`, `permissions_approver` |

Four-eyes: a proposer never holds approve. `tenant_admin` can propose widenings,
only `platform_admin` can approve them, and no member or staff subject holds a
`permissions.*` atom. Until Phase 12 issues a tenant-level approver grant,
in-tenant widenings need a platform admin to approve (OQ3).

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

It validates everything before unioning, then returns the sorted,
de-duplicated, frozen union of the sources' default bundles. On bad input it
throws `CapabilityResolutionError`, whose message and only enumerable field is
the code:

| Code                       | When                                                                     |
| -------------------------- | ------------------------------------------------------------------------ |
| `tenant_overrides_dormant` | `tenantOverrides` is anything but `undefined`                            |
| `missing_context`          | no context, empty tenant id, non-array sources or an unknown source kind |
| `foreign_tenant`           | a source's tenant differs from the context's (checked before revocation) |
| `inactive_source`          | an assignment or named grant is not active                               |
| `multiple_assignments`     | more than one assignment source                                          |
| `unknown_subject`          | an unknown role, subrole or named subject                                |

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
- #2281: sources `platform_admin` grants; #2284 sources `tenant_admin`.
