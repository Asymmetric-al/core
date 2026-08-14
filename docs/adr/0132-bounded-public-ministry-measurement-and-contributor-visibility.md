# ADR-0132: Bounded Public Ministry Measurement and Contributor Visibility

**Status:** Accepted (founder ruling, Phase 22 D15, 2026-08-06)

## Context

Phase 22 needs useful, low-friction feedback about whether public ministry Pages
and Ministry Updates are being used. HTTP requests cannot represent human views:
Next.js prefetch, crawlers, social-card fetchers, scanners, monitors, blockers,
and failed beacons all distort request counts. A Share-menu open or Give-CTA
selection likewise proves neither a completed share nor a cart, gift, settlement,
or payment.

Measurement must remain separate from D1 contributor authority, D2 reach, D7
Giving binding, D10 preview, D11 Update truth, D13 discovery, D14 search/sharing,
Phase 12 authorization, Phase 13 contribution and attribution truth, and
operational telemetry. Existing donor-route replay or privacy behavior cannot be
grandfathered into this contract: production activation requires behavioral and
disclosure congruence first.

The capability must provide useful aggregate feedback without becoming an
analytics platform, visitor-tracking system, contributor permission registry,
donor funnel, tag manager, or recurring tenant-administration burden.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — one prospective, versioned, Tenant × Legal Entity × Site Public Ministry Measurement Profile with a persisted Off state and one guided choice of Staff only (recommended) or Staff + current assigned Public Page Contributors; measuring exactly four first-party, immutable-release-bound, fixed-schema interactions—qualified visible Page loads, full Ministry Update opens, Share-menu opens, and Give-CTA selections—through best-effort post-render or explicit-action POSTs that never arise from GET, HEAD, render, RSC/prefetch, preview, sitemap, crawler, social-card, scanner, monitor, or provider fetch and never block Page, Update, Share, Give, cart, or checkout behavior. D15 owns only delayed aggregate service-improvement measurement: it never claims unique people, supporters, reach, sessions, journeys, completed shares, carts, conversions, gifts, recurring agreements, settlements, payments, or attribution; D7/D14 and Phase 13 remain independently authoritative, and any separately displayed Phase 13 aggregate retains its own label, authorization, and through-date with no person/session join. Ephemeral request signals may support abuse control, bounded source classification, and conservative known-machine exclusion, but raw IP, user agent, URL/query, referrer, location, fingerprint, cookie or local-storage identifier, persistent visitor/session identifier, supporter/donor/legal identity, free-form property, replay frame, and cross-site/device link never enter durable measurement; unlinked idempotent occurrences are private, aggregate into exact Tenant, Legal Entity, environment, Site, verified host, locale, Page or canonical Update, immutable release, Page Family, metric, bounded source, day, profile, metric-schema, and classifier-generation facts, and are deleted with idempotency material within 24 hours, while sealed daily aggregates use append-only corrections and one code-owned 24-month retention. Every staff or contributor read/export re-proves current Phase 12 or exact D1 page-assignment authority in the server boundary and RLS, with complete structural isolation, immediate revocation, no JWT/user-metadata or relationship inference, no browser/raw-event access, and code-owned disclosure controls; contributors receive only suppression-safe exact-page totals and trends, never tenant-wide, source, identity, event, sparse-cell, or financial drill-down. One quiet setup consequence preview, one accessible Public page activity report, 7/30/90 complete-day presets, fixed plain-language definitions, an equivalent HTML table, Data complete through coverage, honest Complete/Delayed/Partial/Unavailable/Suppressed/Zero states, and cause-owned diagnostics keep administration and missionary use simple. Production activation is proof-gated on replay-free public ministry and giving routes, query/body/DOM-safe independent operational telemetry, truthful notice plus the applicable simple objection or stricter consent path, fixed-schema same-origin intake, tenant-fair rate and size limits, exact release re-resolution, cross-scope and concurrency proof, suppression-differencing proof, retention proof, accessibility proof, and failure isolation. Phase 31 alone may later expose a separately certified external analytics adapter with exact purpose, fields, consent/objection, egress, retention, deletion, provider, region, and observed-versus-modeled proof—without per-page analytics switches, custom metrics or events, report builders, visitor timelines, unique-visitor hashes, funnels, heatmaps, session replay, ad pixels, tag managers, arbitrary scripts, provider API-key fields, raw-log or Sentry backfill, generic analytics payloads, premature event warehousing or partitioning, destructive correction, silent zero-filling, blind retry, or any claim that enabled, collected, queued, received, classified, aggregated, complete, viewed, human, shared, selected, converted, donated, settled, paid, or externally reported are the same fact.**

## Consequences

- Every exact Tenant × Legal Entity × Site begins in persisted **Off** state.
  Collection starts only through an authorized prospective activation; **Staff
  only** is the guided recommendation.
- D15 owns exactly four fixed measured interaction meanings. It exposes no
  unique visitors, sessions, journeys, funnels, conversion rates, completed
  shares, gifts, or attribution claims.
- `GET`, `HEAD`, render, prefetch, preview, crawler, sitemap, scanner, monitor,
  and provider requests remain effect-free. Intake is same-origin,
  fixed-schema, best-effort, post-render or action-triggered, and cannot block
  public or giving behavior.
- Raw request and identity material is discarded before durable measurement.
  Private occurrences and idempotency material expire within 24 hours; sealed
  daily aggregates retain for one code-owned 24-month period and use append-only
  correction deltas. Those durations are product policy, not regulator-mandated
  periods, and aggregate data is not assumed anonymous merely because it is
  aggregated.
- Current Phase 12 staff authority or exact D1 Public Page Contributor
  Assignment is re-proved on
  every report read and export. RLS provides defense in depth; stale JWT claims,
  roles, and inferred relationships cannot grant access. Revocation removes both
  historical and future report access immediately.
- Contributors receive only suppression-safe totals and trends for currently
  assigned exact pages. Staff receive one accessible Public page activity report
  with fixed 7/30/90 complete-day presets, explicit coverage, distinct
  zero/suppressed/unavailable states, plain definitions, and an equivalent HTML
  table.
- Measurement outages fail open for Page, Update, Share, Give, cart, and checkout
  behavior but fail closed in the report through Delayed, Partial, or Unavailable
  coverage.
- Public ministry and giving routes must be replay-free before activation.
  Operational telemetry remains independently purposed and query/body/DOM-safe.
  Ephemeral inspection of IP or headers remains data processing even though
  those values never enter durable D15 measurement.
- No existing Sentry, CDN, access-log, or provider data is backfilled as D15
  truth. Migration begins prospectively at an exact profile and metric-schema
  boundary.
- External analytics may be added only through a future certified Phase 31
  adapter. Phase 22 has no provider key, arbitrary script, tag manager, generic
  event payload, or universal consent/compliance claim.

## Considered options

### No engagement measurement

Rejected because it withholds useful content feedback despite a safe bounded
aggregate design being available.

### First-party aggregates for staff only

Rejected as the only mode because tenants may safely choose to share
suppression-safe exact-page aggregates with contributors who are currently
assigned to those pages.

### One bounded three-state profile with four fixed measurements

Accepted because it preserves tenant choice and useful contributor feedback
without introducing analytics machinery or a parallel authorization model.

### Tenant-selected external analytics at launch

Rejected because it adds provider coupling, consent and egress complexity,
broader datasets, CSP risk, modeled-result ambiguity, and routine configuration
burden.

## Related decisions

- [ADR-0118](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
  — typed pages and contributor assignments
- [ADR-0119](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
  — Publication Reach
- [ADR-0124](./0124-one-exact-page-giving-binding-for-phase22-mvp.md) — exact
  Page Giving Binding
- [ADR-0127](./0127-authenticated-exact-version-public-ministry-preview.md) —
  authenticated preview
- [ADR-0128](./0128-canonical-ministry-update-audience-release-projections.md)
  — canonical Ministry Updates
- [ADR-0130](./0130-scoped-public-ministry-discovery-with-tenant-chosen-topology.md)
  — public ministry discovery
- [ADR-0131](./0131-release-bound-public-search-and-sharing-presentation.md)
  — search and sharing presentation
- [Phase 22 decision log](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md)
- [Phase 22 research evidence](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md)
