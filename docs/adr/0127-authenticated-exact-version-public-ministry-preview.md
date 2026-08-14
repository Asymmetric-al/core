# ADR-0127: Authenticated exact-version Public Ministry Preview

**Status:** Accepted (founder ruling, Phase 22 grill session - D10)

## Context

An unreleased Public Ministry Page can expose exactly the identity, location,
media, destination, and story information that Phase 10 and Phase 22 are meant
to protect. Authentication alone does not establish that a person may inspect a
particular tenant, page, locale, or version. A shareable link or Draft Mode
cookie is bearer authority by another name, can be forwarded or logged, is hard
to revoke reliably, and creates a second access system beside Phase 12.

The current Web Studio preview is useful interim infrastructure, but it proves
only Payload authentication and collection access, reads a mutable document by
id, uses a separate renderer, leaves consequential links active, and can resolve
raw media URLs. It is not grandfathered as a Phase 22 authorization, exact-
version, renderer-parity, or D9-media proof.

The product still needs a low-friction way for a missionary contributor to
check saved work, for staff to judge the exact candidate they were asked to
review, and—when a tenant chooses—for one named spouse, field leader, coach, or
adviser to inspect that candidate without receiving edit, review, publication,
or financial authority.

## Decision

> **A-prime-amended-and-hardened (A-prime-R) — one
> authenticated-and-currently-authorized, exact-version Public Ministry
> Preview with no bearer preview access.**

A current D1 Public Page Contributor may preview one explicitly selected,
coherently saved working revision. An authorized staff editor or D4/D5 reviewer
may preview the exact immutable Public Content Release Candidate covered by the
current review capability. A tenant may give an existing verified principal one
Phase 12 named `public_pages.preview` grant for one exact page and immutable
candidate, with reason, provenance, current state, authorization epoch, and
expiry. The grant adds no edit, submit, review, approval, release, publication,
CMS, operational-identity, or financial authority.

No anonymous, bearer, shared-password, guest-token, shareable-preview-link, or
preview-specific identity/invitation/directory system exists. A recipient who
does not yet have an account follows the ordinary identity and tenant-membership
onboarding path; invitation alone grants nothing.

Every HTML, RSC/data, media, refresh, and session-continuation request re-proves
the exact Principal, non-anonymous session, Active Tenant Assignment, Tenant,
Legal Entity, Site, Page Family, Page, locale, revision/candidate, purpose,
current contributor assignment or capability/grant, grant state and expiry,
authorization epoch, environment, Phase 10 ceiling, D3 profile/renderer
generation, and D9 media coverage. A URL, opaque id, Payload user, role name,
Supabase `authenticated` role, Draft Mode cookie, CMS secret, subject or
participant relationship, Support Assignment, Designation Binding, prior
success, or service role is not authority.

Phase 5 supplies one production-equivalent reader and renderer and D9's opaque
media resolver. Draft Mode may select the draft read perspective but grants
nothing. Contributor preview pins the exact selected saved revision; reviewer
and named-recipient preview pins the immutable submitted candidate. A later
save does not change an open preview. The UI may announce **A newer version is
available** and offer a deliberate **Preview latest saved version** action.

The surface has one **Preview** action in the existing missionary and staff
editors, a persistent **Preview — not public** banner with page, locale,
version, state, and saved/through time, responsive desktop/tablet/phone views,
and a separately labelled **View live page** only when a released page exists.
Giving, forms, embeds, notifications, tracking, analytics, and other
consequential controls render representatively but are inert and announced
unavailable. The authentication continuation is same-origin and allowlisted,
supports password managers, paste, and autofill, and always reauthorizes the
exact target after login.

Responses are private, `no-store`, non-indexable, non-archivable,
referrer-suppressed, and absent from sitemaps, canonical/social metadata,
public analytics, and discovery. Unauthorized, revoked, expired, missing, and
wrong-scope requests use one non-enumerating **Preview unavailable** envelope;
authorized diagnostics retain the private cause. An owner-store, renderer,
generation, or media-eligibility outage fails closed without falling back to
raw, latest, live, or public content. Revocation wins the next fetch, while the
product truthfully cannot recall pixels already rendered or copied.

Preview is never evidence that content was reviewed, approved, released,
published, live, Giving-ready, delivered, payable, or paid.

## Consequences

- Authentication and authorization remain separate facts. “Signed in” never
  means “may inspect this draft.”
- Contributors, reviewers, and named recipients use one rendering experience
  while retaining different exact authorities and targets.
- Phase 12's existing Principal, named-grant, floor, epoch, expiry, and
  revocation machinery is reused; there is no second permission product.
- Exact-version pinning prevents staff from approving content that changed
  after submission and prevents a named recipient from drifting onto later
  work.
- Public-renderer parity prevents a separate preview template from hiding
  layout, metadata, link, or media problems.
- Side-effect-dark preview prevents an authorized viewer from accidentally
  giving, submitting a form, notifying supporters, or polluting public
  analytics while evaluating an unreleased candidate.
- Per-request checks make revocation and Phase 10 narrowing effective on the
  next governed fetch. RLS and Payload access remain defense in depth, not the
  product decision.
- The existing mutable Web Studio route must migrate and pass the complete
  actor, cross-scope, exact-version, revocation, renderer-parity, inert-effect,
  response-privacy, D9-media, accessibility, and outage matrix before it can be
  described as D10-conforming.

## Considered options

- **Authenticated users only.** Rejected because Supabase's authenticated role
  and a valid session say who the caller is, not whether that person may see the
  tenant, page, or version.
- **Expiring shareable preview link or password.** Rejected because possession
  becomes authority, forwarding is unavoidable, revocation is fragile, and it
  duplicates Phase 12.
- **Staff-only preview.** Rejected because D1 contributors need to verify their
  own saved work and tenants may legitimately ask one named non-editor to review
  an exact candidate.
- **A dedicated guest-review identity product.** Rejected because ordinary
  verified principals plus a bounded named grant satisfy the need with less
  operational and security complexity.
- **Preview `latest` or the mutable Payload document.** Rejected because the
  viewer and reviewer could see different content from the version selected or
  submitted.
- **Separate admin preview renderer with active links.** Rejected because it can
  drift from public behavior and trigger effects that no preview action should
  cause.

## Related decisions

- [ADR-0027 - Transport-agnostic public content reader](./0027-transport-agnostic-public-content-reader.md)
- [ADR-0028 - Defense-in-depth public content isolation](./0028-defense-in-depth-public-isolation.md)
- [ADR-0118 - Typed Public Ministry Pages with explicit contributor assignments](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
- [ADR-0121 - Tenant-chosen Public Content Review and Release Profiles](./0121-tenant-chosen-public-content-review-and-release-profiles.md)
- [ADR-0122 - Simple Public Page Review with quiet Phase 10 eligibility](./0122-simple-public-page-review-with-quiet-phase-10-eligibility.md)
- [ADR-0126 - Release-bound Public Ministry Media Assets](./0126-release-bound-public-ministry-media-assets.md)
- [Phase 5 public website runtime contract](../prds/sitestacker-parity/phase-05-public-website-runtime-contract.md)
- [Phase 10 sensitive-data safety](../prds/sitestacker-parity/phase-10-sensitive-data-safety.md)
- [Phase 12 role and permission configuration](../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md)
- [Phase 22 decision log](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md)
