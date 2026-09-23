# ADR-0124: One exact Page Giving Binding for the Phase 22 MVP

**Status:** Accepted (founder ruling, Phase 22 grill session - D7)

## Context

A public ministry page should carry the donor's chosen charitable purpose into
Giving without forcing another fund search. A universal or campaign-bounded
picker could support more configurations, but it adds selection, enumeration,
authorization, accessibility, and stale-option behavior to the MVP. Mutable CMS
URLs, source codes, cached parameters, or automatic general-fund fallback would
be simpler only superficially: each can change or misrepresent donor intent.

## Decision

Every released Missionary Ministry Page and Project/Campaign Page in the Phase
22 MVP pins one immutable Page Giving Binding to exactly one Phase 13
Designation. Every CTA placement on that page uses the same destination.
Presentation copy, registered source code, suggested amount, and suggested
frequency may vary within their own contracts but cannot select or override the
Designation.

Phase 5 transports only untrusted plain parameters. The server re-resolves and
revalidates the current page release, Phase 10-safe public eligibility and
labels, exact Tenant, Legal Entity, Site, environment, binding, Designation,
Settlement Account Binding, currency, cadence, attribution, and internal return
path at cart/checkout entry and again immediately before provider execution. A
stale, forged, revoked, or cross-scope binding fails closed and never falls back
to another charitable purpose.

A destination replacement is a prospective staff-controlled page change using
Phase 22's existing candidate and release path. If the current destination
later becomes unavailable, the otherwise safe page may remain public while its
Giving action becomes unavailable. A separately labelled general-giving path,
when configured, starts a fresh donor choice with no inherited destination.

Phase 22 D8 later defines route/lifecycle dispositions without changing this
contract. A Transition Notice Release retains the exact current Page Giving
Binding and cannot create a configured no-Giving state; only current Phase 13
eligibility can make the action unavailable. A different successor page is a
fresh explicit navigation and inherits no Designation or Giving context.

## Consequences

- The MVP has no Phase 22 public fund picker and no intentional `No Giving`
  posture for its two typed page families; a release must prove one exact
  binding.
- Phase 13's campaign `expected designations` data remains intact but does not
  enumerate public choices in Phase 22. A future picker requires a separate
  prospective decision rather than dormant offer machinery now.
- Phase 13 may let the donor deliberately add another Designation after the
  page-origin line enters the cart; that separate choice never rewrites origin
  evidence.
- Raw bindings, Designations, settlement records, and internal identifiers are
  not anonymous APIs. The Phase 5 choke point returns only Phase 10-safe public
  presentation.
- Adverse eligibility changes expire the affected CTA scope immediately while
  request-time revalidation remains authoritative.
- Existing mock IDs, soft references, and handcrafted checkout URLs cannot
  authorize migration or release.

## Related decisions

- [ADR-0026 - Public website surface in the donor app](./0026-public-website-surface-in-donor-app.md)
- [ADR-0027 - Transport-agnostic public content reader](./0027-transport-agnostic-public-content-reader.md)
- [ADR-0029 - Reference-not-copy CMS-to-operational](./0029-reference-not-copy-cms-operational.md)
- [ADR-0118 - Typed Public Ministry Pages with explicit contributor assignments](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
- [ADR-0119 - Tenant-defaulted, Phase-10-ceiling-resolved Publication Reach](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
- [ADR-0122 - Simple Public Page Review with quiet Phase 10 eligibility](./0122-simple-public-page-review-with-quiet-phase-10-eligibility.md)
- [ADR-0125 - Source-qualified Public Page Route Dispositions](./0125-source-qualified-public-page-route-dispositions.md)
- [Phase 5 public website runtime contract](../prds/sitestacker-parity/phase-05-public-website-runtime-contract.md)
- [Phase 13 campaign, Designation, contribution ledger, and giving cart](../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md)
