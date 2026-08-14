# ADR-0128: Canonical Ministry Update audience release projections

**Status:** Accepted (founder ruling, Phase 22 grill session - D11)

## Context

Phase 22 needs the low-friction ministry-update loop proven useful by products
such as Epistle: a missionary writes once, the update can appear within the
relevant ministry or project experience, authorized supporters can stay
connected, and an optional communication can point them to the update. Earlier
Asym prototypes called this experience **My Feed**.

The existing prototype cannot become authority as-is. Its mutable post,
`public/partners/private`, `publicMirror`, security-level, follower, Payload
publication, and coarse notification-preference concepts collapse several
different facts: what was authored, what was released publicly, who may read
protected content now, who was selected for a communication, and what a
provider later delivered. That ambiguity creates disclosure, consent,
cross-tenant, retry, correction, migration, and audit hazards.

Phase 22 already assigns page contribution to D1, Page Feed Binding to D3,
review and release to D4/D5, current public reach to D2, public safety to Phase
10, authorization to Phase 12, locale to Phase 24, and public media to D9 and
Phase 29. Communication and supporter-owner phases must remain authoritative
for their own facts rather than being reimplemented inside an update feature.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — one canonical,
> source-scoped, independently and immutably versioned Ministry Update with one
> exact Audience Release Manifest and independently authoritative Public Page
> and authenticated purpose-authorized Supporter Release Projections; composed
> through D1 contributor authority, D3's exact Ministry Update Feed Binding,
> D4/D5's sole Review & Release lane, D2's current Publication Reach, Phase
> 10's per-egress safety ceiling, Phase 12's current authorization, Phase 24
> locale truth, and D9/Phase 29-certified media; using one quiet accessible
> Ministry updates experience—formerly My Feed only as a migration/search/help
> alias—with autosave and version recovery, separate Save draft, a
> tenant-seeded `Supporters`, `Public page`, or `Public page and supporters`
> choice, exact audience previews, an optional explicitly authored public-safe
> variant, one consequence review, and independently truthful outcomes. Every
> projection pins the exact Tenant, Legal Entity, environment, canonical
> source/purpose, Update Revision, audience contract, locale, safety and
> authorization epochs, release occurrence, renderer/profile generation, and
> media manifest, plus exact Site, Page, Feed Binding, and reach for public
> display; current protected membership is re-proved on every content, media,
> pagination, engagement, and deep-link request, while only communication
> dispatch freezes exact recipients. Public release, supporter visibility,
> supporter relationship, notification intent, recipient selection, consent,
> suppression, cadence, provider delivery, engagement, and Giving remain
> separate truths; a deliberate `Publish & notify supporters` occurrence may
> reuse the same final review but routes through Phase 28, Phase 17, and Phase
> 6, including recipient preferences and secure notification-only email where
> required. Corrections, narrowing, withdrawal, and privacy-safe tombstones are
> append-only and audience-specific; partial outcomes preserve prior-good
> heads and recover only residual work; engagement never widens access or leaks
> identities across audiences; and migration uses one complete disposition
> manifest and one authority cutover—without copied page/email posts, mutable
> visibility or released content, generic partners, blanket security levels,
> `publicMirror`, tenant-wide feeds, inferred audience or contact permission
> from a gift, follow, subject, author, spouse, teammate, project, page, or
> Support Assignment, raw-table/CMS/provider authority, destructive delete,
> hidden auto-email, unsafe locale/media fallback, dual write, or any claim that
> released, visible, notified, delivered, opened, clicked, liked, prayed,
> understood, relationally connected, or gave are the same fact.**

## Consequences

- **Ministry Update** is the canonical domain term. **My Feed** may survive only
  as a migration, route-search, or help alias and never as a second feed or
  record authority.
- One immutable Update Revision may produce independently governed Public Page
  and Supporter projections. A mixed outcome preserves the successful result
  and the failed audience's prior-good head.
- The Supporter projection freezes its audience contract, not a permanent list
  of people. Current purpose-authorized membership and Phase 10 safety are
  checked on every protected content, media, pagination, engagement, and
  deep-link request.
- A communication occurrence separately freezes eligible recipients only at
  dispatch after current consent, suppression, cadence, and safety checks.
  Publication never emails anyone implicitly.
- The missionary sees one mobile-first composer, autosave and version recovery,
  a separate **Save draft** action, three plain-language audience choices,
  exact audience previews, an optional deliberately authored public-safe
  variant, and one consequence review.
- Staff use D4/D5's one review candidate and decision. D11 creates no parallel
  public-versus-supporter approval queue.
- Public Page placement remains selected by D3's exact Feed Binding; an update
  is never copied into a page or included because its author, subject, project,
  or Designation appears related.
- Released content is corrected, narrowed, withdrawn, or retired through
  append-only successor projections and privacy-safe tombstones. Historical
  notification and engagement evidence is not rewritten.
- Engagement is projection-bound and cannot broaden access. The detailed
  interaction, moderation, privacy, and notification behavior remains a
  separate Phase 22 decision.
- Production authorization requires exact-scope isolation, current-access,
  safety-narrowing, mixed-outcome, retry, cache, media, locale, migration,
  accessibility, abuse, load, provider-outage, and deployment-skew proof.

## Considered options

- **One mutable post with `public`, `partners`, or `private` visibility.**
  Rejected because it overloads content, release, membership, and delivery and
  cannot represent partial success or append-only correction.
- **Copy the update into the public page, protected feed, and email.** Rejected
  because copies drift, corrections become ambiguous, and each surface gains a
  competing authority.
- **Automatically email whenever an update is published.** Rejected because
  publication does not prove recipient eligibility, consent, cadence,
  suppression, or provider readiness.
- **Infer supporters from donations, follows, page subjects, spouses, teams, or
  projects.** Rejected because those relationships do not establish current
  purpose-authorized access or contact permission.
- **Allow arbitrary tenant-built audience expressions.** Rejected because a
  segment DSL would add substantial disclosure and operational risk; Phase 22
  consumes governed audience contracts from their owning phase.
- **Keep Payload or email-provider status as release truth.** Rejected because
  those systems are authoring or transport infrastructure, not the authority
  for Phase 22 release, access, or safety.

## Later Phase 22 D26 qualification

D11 pins the exact Ministry Update candidate and its D26 Public Content Sharing
Attestation in the Audience Release Manifest and released projection. That
attestation never widens the selected audience, creates supporter access,
duplicates release evidence, or substitutes for current safety and
authorization.

## Related decisions

- [ADR-0118 - Typed Public Ministry Pages with explicit contributor assignments](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
- [ADR-0119 - Phase-10-ceiling-resolved Publication Reach](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
- [ADR-0120 - Family-certified Public Page Presentation Profiles](./0120-family-certified-public-page-presentation-profiles.md)
- [ADR-0121 - Tenant-chosen Public Content Review and Release Profiles](./0121-tenant-chosen-public-content-review-and-release-profiles.md)
- [ADR-0122 - Simple Public Page review with quiet Phase 10 eligibility](./0122-simple-public-page-review-with-quiet-phase-10-eligibility.md)
- [ADR-0126 - Release-bound Public Ministry Media Assets](./0126-release-bound-public-ministry-media-assets.md)
- [Phase 10 sensitive-data safety](../prds/sitestacker-parity/phase-10-sensitive-data-safety.md)
- [Phase 12 role and permission configuration](../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md)
- [Phase 22 decision log](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md)
