# Change: Adopt Tenant-Owned Domains With Paths For The Dashboards

## Why

On 21 November 2026 the owner decided how organizations are addressed:

> For the domain question, the decision is that every tenant's website and
> dashboards use 100% tenant-owned domains. The entire experience belongs to the
> tenant, with their branding and their URLs. Asym must not appear in those
> addresses or be a required domain dependency.
>
> Use the tenant's domain for the website, with paths for the dashboards.

The owner's examples were `https://ministry.org/` for the public website and
`/donor`, `/missionary` and `/admin` for the dashboards, with the note that
"These path names are illustrative. Reuse suitable existing route names where
possible." The decision adds that tenant-owned domains "are a core requirement, not an
optional customization added after onboarding", and that "Dashboard paths must
not be treated as security boundaries."

That replaced an accepted assumption. The
[CRM, CMS and database plan](../../../docs/audits/core-crm-cms-database-target-architecture.md),
ratified on 16 November 2026, gave every tenant platform subdomains and made a
custom domain an optional later addition. It also carried the organization's ID
in the page address of Mission Control and the missionary workspace, and gave the
donor portal a host of its own. Decision records, the Phase 4, 5, 17 and 24
requirements, OpenSpec requirements and three active changes repeat those
assumptions.

A revised domain and routing plan (revision 4 of 21 November 2026) was written
and checked against `develop`. It put twelve decisions to the owner. On
24 November 2026 a ruling under the owner's standing rule D-16 settled all
twelve. Decision 1, where the signed-in areas live, is the owner's own choice:
paths on one domain. The ruling records what that choice costs. Nothing in the
ruling commits money.

## What Changes

- **Accepted intent.** Every tenant-facing surface (website, donor account,
  Mission Control, missionary workspace, sign-in and mail links) is served only
  on names the organization owns and Core has verified. No Asym address is on a
  tenant-facing path or is a required dependency. Nothing tenant-facing is
  served before a name is ready, and there is no Asym-domain fallback when a
  name is lost.
- **One home domain per organization.** The donor account, sign-in and the
  dashboards live on the organization's designated home domain, under paths:
  the website at `/`, the donor account at `/donor-dashboard` (the existing
  route), Mission Control at `/admin` and the missionary workspace at
  `/missionary`. A staff member with several roles keeps the short
  `~<sub-role>` segment. The organization's ID leaves the address: the
  domain names the organization.
- **The twelve rulings** of 24 November 2026, recorded in `design.md` with the
  reason for each and what it waits for.
- **Spec deltas:** `platform-product-intent` gains a requirement for
  tenant-owned names; `platform-surfaces` modifies the donor portal and public
  website requirements so the account lives on the designated home domain.
- **Contract sections:** new content-addressed sections replace the "portal
  host" and "Asym doorway origin at startup" clauses in the `platform-surfaces`,
  `identity-and-access` and `outbound-communications` contracts; the active
  changes that bind them (`add-multi-site-management`,
  `build-crm-cms-database-foundation`, `sitestacker-parity`) re-point to them.
- **Documents edited at the clause, each the smallest rewording:** the plan
  (sections 5, 6.6, 8, 9, WP2, WP3, WP7, WP8, WP12, 13, 15), the implementation
  record, ADR-0025, 0037, 0174, 0185, 0193 to 0199, 0224, 0227 and 0236, the
  Phase 4, 5, 12, 17 and 24 requirements, the enterprise-identity
  specification, and the environment, release and architecture guides.
- **New packages N1 to N8**, their order and what each waits for, in
  `design.md` and `tasks.md`.

## Authority And Its Limits

- The owner's decision of 21 November 2026 is the authority for the target. The
  ruling of 24 November 2026 under D-16 settles the twelve questions the plan
  put to him; decision 1 in it is his own choice. Where the ruling differs from
  the plan's recommendation (decisions 1, 2 and the map-tile part of 7), the
  ruling governs and the recommendation is recorded as considered and not
  taken.
- This change records intent. Nothing in it says or implies that a package is
  built. What is implemented, integrated or verified is recorded only in the
  [implementation record](../../../docs/audits/core-crm-cms-database-implementation-record.md).
- Every item `design.md` lists as not verified stays a question until the
  package named for it proves it. A failed proof with no named fallback stops
  its package and returns to the owner.

## Non-Goals

- No application code, migration, test of behaviour, configuration, workflow or
  deployment. Each package N1 to N8, and the amended WP3a, WP3b and WP2c parts,
  makes those in its own change.
- No briefs for N1 to N8, and no decision beyond the ruling.
- No spending: managed routing is not bought (ruling 2).
- Current-behaviour documents that must change with code (`docs/security/*`,
  the data-access boundary guide, README files) stay with their packages.

## Affected Capabilities And Sources

- Capabilities: `platform-product-intent`, `platform-surfaces`; contract sections
  of `platform-surfaces`, `identity-and-access` and `outbound-communications`.
- Active changes updated in their own deltas: `build-crm-cms-database-foundation`
  (design, tasks, its `identity-and-access` delta), `add-multi-site-management`
  (its `platform-surfaces` delta and prose), `sitestacker-parity` (its
  `platform-product-intent` and `outbound-communications` deltas),
  `add-donor-dashboard-depth` (one scenario line).
- Sources: the owner's decision of 21 November 2026, the revised routing plan
  (revision 4), the ruling of 24 November 2026, the plan, the implementation
  record and the decision records named above.

## Rollback

Every artifact here is documentation. Reverting this change's commits restores
the earlier text; the content-addressed contract sections added here stay in
their files as unreferenced history, as the contracts README prescribes. A
package that has already shipped against this decision must be reconciled by
its own change.
