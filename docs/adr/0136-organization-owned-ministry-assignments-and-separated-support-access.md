# ADR-0136: Organization-Owned Ministry Assignments and Separated Support Access

**Status:** Accepted (founder ruling, Phase 22 D19, 2026-08-06)

## Context

A Missionary Ministry Page can represent a married couple, a team, a leader and
their collaborators, or a ministry whose participants change over time. A
person-owned page or shared login fails those cases. Deriving access from a
spouse, household, team, page-subject, contributor, or support relationship is
also unsafe: the same relationship does not establish public presentation,
editorial authority, Support Workspace access, supporter-identity access,
notifications, or money movement.

Phase 21 D19 already establishes the corresponding finance-safe separation:
one organization-controlled Support Assignment may have multiple Participant
Memberships, but membership grants no Field Account access. Phase 22 needs a
CRM-owned ministry identity that can be referenced by public presentation and,
where explicitly bound, composed with that existing Support Assignment without
copying it or creating a second authorization system.

The current prototype is not this authority. Its person-keyed missionary portal
and service-role-backed reads cannot safely represent couples, teams, or exact
field-level grants and must not be promoted as the permanent model.

## Decision

Adopt the complete Phase 22 D19 C-prime-R ruling:

> **C-prime-amended-and-hardened (C-prime-R) — one stable,
> CRM-authoritative, organization-owned, Tenant- and Legal-Entity-scoped
> Ministry Assignment with immutable identity and versioned lifecycle as the
> exact operational subject referenced—not copied—by each Missionary Ministry
> Page; zero-to-many prospective, effective-dated, append-only-corrected Party
> Participant Memberships; and one optional, prospective, immutable,
> same-scope, one-to-one Ministry Assignment Support Binding Version to Phase
> 21’s independently authoritative Support Assignment. Every spouse, teammate,
> leader, coach, staff member, and contributor retains a separate Party,
> principal, login, invitation, Ministry Assignment membership, Phase 21
> Support Assignment Participant Membership, D1 Display Participant and Public
> Page Contributor Assignment, Phase 12 Support Workspace authorization,
> responsibility, history floor, and notification-preference identity. One
> quiet tenant-defaulted People & access experience may atomically materialize
> the explicitly selected local facts and outbox intent through bounded safe
> presets and one literal consequence review, allowing multiple separately
> authenticated people to view the same source-owned support activity and exact
> per-ISO-currency Finance-confirmed Field Account Balances when—and only
> when—each holds the current purpose-, projection-, target-, and field-specific
> Phase 12 grant and the tenant’s applicable D9 publication permits that module.
> Ministry pages remain fully functional when Phase 21 is disabled or no
> Support Binding exists; membership, marriage, household, display, editing,
> Designation, D6 public progress, notification preference, or the Support
> Binding itself grants no financial access, reveals no supporter identity,
> moves no money, or changes historical truth. Composite same-scope
> constraints, non-overlapping half-open membership and binding intervals,
> explicit Data API grants, forced coarse Tenant RLS, browser-inaccessible raw
> tables, the sole server-side Phase 12 PDP, live authorization epochs,
> security-invoker or unexposed views, signal-only private Realtime,
> append-only evidence, deny-first revocation, non-propagating rebinding, and
> production-shaped isolation, bypass, concurrency, performance, privacy,
> mobile, and accessibility proof are mandatory—without shared credentials,
> person- or household-owned funds, implicit spouse/team access, a Phase 22 ACL
> engine, permission arrays in JWTs, client-trusted scope,
> service-key-as-authority, raw financial subscriptions, destructive merge,
> copied ledgers or balances, authoritative converted totals, or
> membership-driven financial mutation.**

A **Ministry Assignment** is the stable CRM-owned operational subject for a
Missionary Ministry Page. Its participant memberships record association only.
Every public display or editorial consequence continues to require D1's exact
Display Participant or Public Page Contributor Assignment, and every Support
Workspace projection continues to require Phase 12's current request-time
authorization.

The optional **Ministry Assignment Support Binding Version** is a typed bridge,
not ownership or permission. Phase 21 owns its separately finance-authorized
write command; Phase 22 only consumes the result. It is prospective, immutable,
same-Tenant and same-Legal-Entity, and one-to-one for each non-overlapping
effective interval. Rebinding does not move money, copy history, retarget pages,
transfer grants, or propagate participation. Each affected Page, support
projection, grant, and notification consequence is re-evaluated by its owner.

A Ministry Assignment is the people, service, and optional Support Workspace
context for a Missionary Ministry Page. It is not the Phase 9 Ministry Project
initiative/program subject used by D17's Project/Campaign Page arm; D19 adds no
new D17 subject kind and never auto-links the two. Before first public release,
a subject correction appends a CAS-guarded successor binding. After first
release, a different Ministry Assignment requires a new Page identity and D8
succession. Source retirement preserves release history and never repoints the
Page.

The normal staff experience is one progressive **People & access** surface. A
safe tenant preset may preselect ordinary choices, but the review identifies
each separate consequence in plain language:

- **Associated with this ministry**;
- **Shown on the public page**;
- **Can edit this page**;
- **Can use the Support Workspace**; and
- **Gets updates**.

Only applicable rows appear. When Support Workspace access is selected, the
confirmation lists the exact D9-enabled modules, fields, and history; support
activity and balance visibility remain independent and may be absent. It also
says that no balance moves, no supporter access is implied, and no closed
history changes. Each person signs in with their own account. Revocation denies
newly requested access first and preserves historical attribution.

Database enforcement uses complete Tenant and Legal Entity scope on every
relation, composite foreign keys, non-overlapping half-open intervals,
scope-complete uniqueness/idempotency, and deletion restriction. RLS is a
forced coarse Tenant backstop; it is not the fine-grained authorization engine.
Raw tables and financial views are unavailable to browsers. The sole Phase 12
policy decision point derives actor and exact target server-side and checks
purpose, projection, field, current authorization epoch, and history floor on
every user-facing read or mutation. Service roles and `BYPASSRLS` repeat that
application authorization rather than treating their credentials as authority.
Any exposed view uses invoker security. Any unavoidable definer function stays
outside exposed schemas, fixes a safe `search_path`, schema-qualifies every
referenced object, returns only a narrow result, and revokes `PUBLIC EXECUTE`.
Realtime carries only a private opaque resource/version signal followed by an
authorized server refetch; raw financial or membership rows are never streamed.
Least-privilege Data API grants and revocations are explicit and catalog-tested;
raw relations have no `anon` or `authenticated` grants.

## Consequences

- Couples and teams can share one ministry identity while retaining separate
  logins, attribution, preferences, access, and revocation.
- A person may participate in several ministries, and a ministry may exist with
  zero current participants, without changing page or Field Account identity.
- Public page functionality does not depend on Phase 21. A missing, unavailable,
  or retired Support Binding omits the support module. A temporary unavailable
  state appears only when the viewer is authorized, D9 selected that exact
  module, and its owner reports a temporary failure; balance-off renders no
  balance card or placeholder.
- The friendly setup action compiles to multiple independently owned facts. The
  orchestration may commit local rows and outbox intent atomically, but it does
  not merge their ownership or claim that external invitation or notification
  delivery is atomic.
- Migration must replace person-keyed assumptions with exact Ministry
  Assignment mappings and quarantine ambiguous spouse/team/project cases. It
  may not infer membership, page contribution, support access, or binding from
  names, households, existing URLs, or legacy portal visibility.
- Production proof must cover hostile cross-tenant and cross-legal-entity
  access, service-role bypass, stale JWTs, invitation and revocation races,
  participant and binding interval races, rebinding, Party merge/split,
  multiple assignments per person, empty ministries, large teams, field-level
  supporter privacy, query plans, mobile, keyboard, screen reader, reflow, and
  forced colors.

## Considered options

### Person- or household-owned ministry and fund access

Rejected. It confuses identity and relationship with operational continuity,
public presentation, and financial authority and breaks ordinary spouse/team
changes.

### Ministry membership automatically grants page and support access

Rejected. It is convenient only until the first private supporter field,
restricted participant, coach, departed teammate, or partial permission. It
also duplicates Phase 12 authorization inside Phase 22.

### Separate Ministry Assignment with explicit optional bindings and grants

Accepted. It gives staff one understandable workflow while keeping every
security- and finance-relevant fact explicit, revocable, and owned by the
correct phase.

## Related decisions

- [ADR-0108](./0108-organization-controlled-support-assignments-and-separated-access.md)
  — organization-controlled Support Assignments and separated Support Workspace
  access
- [ADR-0118](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
  — typed Pages, Display Participants, and explicit Contributor Assignments
- [ADR-0123](./0123-page-resolved-source-authoritative-public-support-progress.md)
  — independently controlled public progress
- [ADR-0134](./0134-exact-typed-public-page-subject-bindings.md) — exact typed
  Project/Campaign Page subjects
- [Phase 22 decision log](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md)
- [Phase 22 research evidence §42](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md#42-ratified-d19-research--organization-owned-ministry-assignments-and-separated-support-access)
