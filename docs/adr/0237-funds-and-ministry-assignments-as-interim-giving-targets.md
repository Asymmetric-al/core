# ADR-0237: Funds and ministry assignments are the interim giving targets, each carrying one Legal Entity, until Designations exist

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).
Using the fund ID as a page's interim giving target is the plan section 15.1
default taken under the implementation record (D-05), not a fresh owner ruling.

This records target intent. It does not say that anything is built; see the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

The accepted target is the Phase 13 Designation: ADR-0124 pins a released page to
exactly one Designation, and the Phase 13 ledger allocates gifts to Designations.
Designations do not exist yet, and no package of this plan builds them. Money
still has to name what it funds and who legally receives it, and Phase 13 and
Phase 20 require one Legal Entity for each giving target.

## Decision

1. **Until Designations exist, a giving target is a fund or a ministry
   assignment** of the tenant.
2. **Every giving target belongs to exactly one Legal Entity** (WP3). A gift takes
   its Legal Entity from the targets its lines name; lines whose targets belong to
   different entities are refused until payment groups are built.
3. **Each tenant's Legal Entity has a reserved fee-cover fund.** A donor's fee
   cover is one more line on it; a donor's line may not name a reserved fund.
4. **A page that takes gifts carries exactly one target ID,** the fund or
   ministry-assignment ID, as a stated interim to ADR-0124's one Designation.
5. **A worker funded through two Legal Entities needs two giving targets** until
   Designations exist.
6. **Imports follow the same rule:** an imported fund or worker names its Legal
   Entity in the file, and a tenant with one entity has it filled in.

## Consequences

- A fund or ministry-assignment ID is frozen onto every posted line, recurring
  line, page target and imported gift. The plan does not yet say how those lines
  are read as Designations when Phase 13 lands (council record C.8, reservation
  3). Phase 13 must settle that mapping when it builds Designations; this record
  does not.
- A cart is limited to one Legal Entity in the first release and says so
  (`donation-lifecycle` amendment proposed in this program's OpenSpec change).

## Source

- [Plan, section 5.4](../audits/core-crm-cms-database-target-architecture.md#54-policies-and-commands),
  [section 6.4](../audits/core-crm-cms-database-target-architecture.md#64-references-to-operational-records)
  and [section 14](../audits/core-crm-cms-database-target-architecture.md#14-required-future-documentation-decisions)
  (ADR-0124, Phase 13 and Phase 20 rows)
- Work packages WP3, WP7, WP8a and WP13
- Related: [ADR-0124](0124-one-exact-page-giving-binding-for-phase22-mvp.md),
  [ADR-0207](0207-site-before-ledger-with-locale-and-currency-facets.md),
  [ADR-0234](0234-stripe-connect-direct-charges-on-tenant-owned-accounts.md)
