# ADR-0125: Source-qualified Public Page Route Dispositions

**Status:** Accepted (founder ruling, Phase 22 grill session - D8)

## Context

Public missionary and project addresses outlive the immediate content shown at
them: QR codes, church websites, search results, browser caches, and recurring
support can remain after a page moves or a worker/project changes lifecycle.
One `archived`, `departed`, `unpublished`, or redirect field cannot safely decide
what visitors see because public reach, current content, new Giving, recurring
support, charitable-purpose succession, identity safety, and external cleanup
are independently authoritative facts.

Generic CMS redirects are insufficient for this domain. They can accept an
arbitrary target and typically store mutable `from`/`to` records, but they do not
prove Tenant, Legal Entity, Site, locale, immutable Page identity, Phase 10
safety, current release, or donor-intent continuity. Conversely, always deleting
the old address needlessly breaks a genuine same-page canonical move and leaves
no truthful transition surface for real ministry offboarding.

## Decision

Phase 22 owns one append-only, source- and cause-qualified Public Page Route
Disposition Case for every canonical-route change or terminal Missionary
Ministry Page or Project/Campaign Page transition. A lifecycle event opens the
case but never chooses the result. The case may activate exactly one currently
proved outcome:

1. continue the current eligible release;
2. publish a substantive Transition Notice Release at the existing address,
   whose statements are independently proof-gated and through-dated even while
   Phase 13 or Phase 16 work remains open;
3. permanently move a Listed-public address only to an already released,
   currently eligible Route Generation for the same immutable Page identity; or
4. remove the address through the same privacy-safe real `404` and `noindex`
   response used for an unknown page.

A different successor page is never an automatic redirect. When Phase 13 proves
same-purpose succession and the target is currently eligible, a Transition
Notice Release may offer it as a separately labelled fresh link. That navigation
inherits no Designation, amount, cadence, source code, query, return path, or
recurring-support action. Shared-by-link and restricted/direct-link rotations
retain permanent non-redirecting tombstones.

Every Route Generation and Disposition binds exact Tenant, Legal Entity, Site,
locale, Page Family, immutable Page, normalized path and canonicalizer version,
source family/version, cause, actor, effective time, and release heads. A unique
constraint over the externally resolved Site, locale, and canonical path key
prevents two pages or Legal Entities from claiming the same public address;
composite foreign keys preserve the remaining same-scope relationships. Paths
are never reused after tombstoning. Automatic permanent-move targets require the
same complete scope and Page identity; raw and external URLs are impossible.

Operational route facts live outside the anonymous browser data boundary with
explicit grants and indexed defense-in-depth RLS. One transactional command
re-proves actor, permission, source, D2/Phase 10/D7 state, origin and target
release heads, and path availability; locks route/page heads in deterministic
order; appends the disposition; and advances D2's current authority through CAS.
An immutable effect manifest and idempotent outbox cover the origin response,
scoped caches, internal links, canonical and structured metadata, social
metadata, and sitemap membership.

Phase 5 resolves the exact route in one indexed hop and rechecks the target's
current Phase 10 and D2 eligibility before returning `200`, `308`, or `404`.
Every request runs this fresh server-only route/safety guard before selecting an
immutable cached release payload, and only navigation-safe `GET`/`HEAD` requests
may receive the method-preserving `308`.
Resolver or storage unavailability returns a neutral `503` with `Retry-After` and
`Cache-Control: no-store`; it never becomes a false permanent result. If a move
target later becomes ineligible, the old address is contained to the same
privacy-safe `404` and one cause-owned exception opens. External cache, search,
social, and copied-link propagation is observed but never treated as local
authority.

If the same Page moves again, the command appends superseding dispositions for
active inbound predecessor routes so fresh requests point directly to the latest
eligible generation. Previously cached external redirects cannot be recalled;
the product claims only that Asym no longer issues a redirect chain.

**Phase 22 D21 precision.** A D21 Adoption Coverage Manifest consumes the exact
current D8 Route Generation and Disposition; it cannot invent, reinterpret, or
default a redirect, Transition Notice Release, tombstone, private preservation,
retirement, or successor. Its readiness grouping is only a staff projection.
The final reader cutover re-proves the D8 heads/epochs and then serves their
existing effects through the new gateway. A Page not moving as a current
ministry Page may still have a public D8 transition notice, so D21 must display
the literal route consequence rather than calling every such row “not public.”

**Phase 22 D19 precision.** Ministry Assignment retirement or source succession
is a source-qualified cause for a Missionary Ministry Page case; it never
chooses the disposition. Participant membership, spouse/team relationship,
public display, Page contribution, or Ministry Assignment Support Binding
change does not itself retire, redirect, or repoint the Page. Before first
public release a subject correction may append a CAS-guarded binding successor;
after first public release a different Ministry Assignment requires a new Page
identity and this D8 succession path.

## Consequences

- Staff use one quiet page asking **What should supporters see at this
  address?** Only currently eligible outcomes appear, with a literal visitor
  preview and separate Page, new-Giving, recurring-gift, discovery, and external
  cleanup consequences. Permanent move and removal each require one accessible
  final confirmation; healthy pages create no work.
- A Transition Notice Release retains D7's current exact Page Giving Binding and
  reports the current Phase 13-controlled Giving state. It cannot invent an
  intentional no-Giving configuration that D7 forbids.
- Missionary contributors see the current transition summary and preview but
  cannot select routes, targets, financial outcomes, or recurring dispositions.
- A truthful transition page can replace stale fundraising copy promptly without
  claiming unresolved financial or recurring work is complete.
- A `308` means the same public Page moved, not that a different ministry should
  receive the visitor or their gift intent.
- Recovery appends a correcting disposition and residual effects. History,
  tombstones, and externally cached redirects are never destructively rewritten.
- Generic Phase 23 redirect tooling may provide infrastructure and ordinary CMS
  redirects, but it cannot authorize or reinterpret a Phase 22 ministry-page
  disposition.

## Related decisions

- [ADR-0118 - Typed Public Ministry Pages with explicit contributor assignments](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
- [ADR-0119 - Tenant-defaulted, Phase-10-ceiling-resolved Publication Reach](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
- [ADR-0122 - Simple Public Page Review with quiet Phase 10 eligibility](./0122-simple-public-page-review-with-quiet-phase-10-eligibility.md)
- [ADR-0124 - One exact Page Giving Binding for the Phase 22 MVP](./0124-one-exact-page-giving-binding-for-phase22-mvp.md)
- [ADR-0138 - Complete Public Ministry surface authority cutover](./0138-complete-public-ministry-surface-authority-cutover.md)
- [Phase 5 public website runtime contract](../prds/sitestacker-parity/phase-05-public-website-runtime-contract.md)
- [Phase 10 sensitive-data safety](../prds/sitestacker-parity/phase-10-sensitive-data-safety.md)
- [Phase 13 campaign, Designation, contribution ledger, and giving cart](../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md)
- [Phase 16 pledges and recurring commitments](../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md)
