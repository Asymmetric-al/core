# Delta for Platform System Boundaries

## MODIFIED Requirements

### Requirement: CRM As Operational Truth And CMS As Public Truth

CRM MUST own operational identity, relationships, giving, permissions-sensitive
records, workflows, approvals, money-related history, and other operational
truth.

CMS MUST own public presentation, managed website content, public page
structure, and content publishing state.

Payload CMS MAY be upgraded inside `apps/admin` as the Web Studio CMS engine
when the upgrade preserves this ownership split, keeps public CMS reads
published-only and tenant-scoped, and keeps Payload runtime code out of donor
and missionary apps.

The two layers SHALL remain distinct but tightly linked, and they MUST NOT
compete for source-of-truth ownership.

#### Scenario: Payload runtime is upgraded for Web Studio

- GIVEN the admin CMS engine is upgraded to a new Payload major version
- WHEN the upgrade changes runtime packages, storage adapter shape, routing
  bridge, or migration behavior
- THEN the upgrade remains isolated to `apps/admin` and CMS-owned public content
- AND donor and missionary surfaces continue to consume public CMS APIs rather
  than importing Payload runtime code
- AND public CMS endpoints remain tenant-scoped and published-only

#### Scenario: A feature treats CMS data as operational truth

- GIVEN a feature proposal wants to treat public content as the authoritative
  source for permissions-sensitive state, operational workflow, or money-related
  truth
- WHEN an agent decides which layer owns that truth
- THEN the agent keeps operational truth in CRM and public truth in CMS
- AND they do not let CMS become the operational source of truth without a more
  specific OpenSpec override
