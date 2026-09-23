# ADR-0118: Typed Public Ministry Pages with explicit contributor assignments

**Status:** Accepted (founder ruling, Phase 22 grill session — D1)

## Context

Asym needs missionary-ministry and project/campaign pages that missionaries can
maintain from their own workspace. Treating a person shown on a page, a Party or
household relationship, a project role, or a Support Assignment as edit
authority would make the common spouse/team workflow convenient but would also
create implicit, non-revocable, and cross-domain permissions. Giving
missionaries Payload accounts or direct access to live CMS documents would
likewise widen tenant and publication authority far beyond the task.

## Decision

Phase 22 uses two tenant-owned typed Public Ministry Page families—Missionary
Ministry Pages and Project/Campaign Pages—under one shared, versioned
Publication contract. Canonical Page Subject Bindings, non-authoritative Display
Participants, explicit page-scoped Public Page Contributor Assignments, Page
Release Authority, and exact Designation Bindings are independently
authoritative.

The ordinary tenant-confirmed operation that assigns an eligible authenticated
missionary as an editable ministry subject creates the Page Subject Binding and
that principal's Public Page Contributor Assignment atomically. Runtime access
is nevertheless proved only from the current explicit contributor assignment;
appearing on a page, participating in a household, team, project, or Support
Assignment, or having financial or notification access grants nothing. Every
contributor uses a separate login, and revocation ends future page authority
without deleting attributed revision history.

Contributors work through one bounded missionary-workspace experience across
both page families. They may prepare permitted narrative, safe media, and
updates; autosave; preview; submit or withdraw revisions; and respond to review
feedback. They cannot change identity or safety facts, Tenant, Legal Entity,
Site, locale, Designation or checkout, progress truth, routes, contributors,
publication policy, or lifecycle. Saving, submitting, approving, and publishing
remain separate facts. Tenant-policy-controlled release always executes the
same non-waivable Phase 10 checks and never becomes a direct contributor write
to the live revision.

Published and review revisions are immutable. Concurrent changes use current
assignment and base-version reproof; failed or revoked work is contained at the
smallest scope and recovered without destructive overwrite. The Phase 10
publication firewall covers every draft, preview, asset, metadata,
notification, cache, restore, and publication egress.

**Phase 22 D19 precision.** The Missionary Ministry Page subject is one stable
CRM-owned Ministry Assignment, not the eligible missionary Party. The ordinary
setup may create the Ministry Assignment/Page Subject Binding and the selected
person's explicit Ministry Assignment Participant Membership, Display
Participant, and Public Page Contributor Assignment in one authorized local
operation, but those remain independent facts. Only the current Contributor
Assignment grants bounded editing; membership, subject, display, spouse/team
relationship, optional Phase 21 Support Binding, and Support Workspace access
grant none. Every person keeps a separate Party and login.

## Consequences

- Missionaries see every and only the pages they may edit in one quiet Public
  pages workspace without entering Payload Admin.
- Couples and teams use separate identities and can collaborate on the same
  page; displayed children, guests, or partners receive no access.
- Phase 12 remains the authorization authority, Phase 10 remains the public
  safety authority, Phase 13 remains the Designation and checkout authority,
  and Payload remains the presentation revision store.
- Implementations need an explicit assignment relation and narrow authoring
  port instead of reusing the current direct operational-profile save path.
- Broad missionary CMS roles, subject-derived runtime access, shared accounts,
  direct live mutation, financial-access inheritance, and cross-tenant page
  references are rejected.

## Related decisions

- [ADR-0029 — Reference-not-copy CMS↔operational](./0029-reference-not-copy-cms-operational.md)
- [ADR-0108 — Organization-controlled support assignments and separated access](./0108-organization-controlled-support-assignments-and-separated-access.md)
- [ADR-0119 — Tenant-defaulted, Phase-10-ceiling-resolved Publication Reach](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
- [ADR-0134 — Exact typed Public Page Subject Bindings](./0134-exact-typed-public-page-subject-bindings.md)
- [ADR-0135 — Release-bound Public Ministry Runtime Composition](./0135-release-bound-public-ministry-runtime-composition.md)
- [Phase 10 sensitive-data safety](../prds/sitestacker-parity/phase-10-sensitive-data-safety.md)
- [Phase 12 role and permission configuration](../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md)
