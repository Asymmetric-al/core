# ADR-0135: Release-Bound Public Ministry Runtime Composition

**Status:** Accepted (founder ruling, Phase 22 D18, 2026-08-06)

## Context

Public Ministry Pages and Ministry Updates combine immutable approved content
with independently current reach, safety, route, progress, Giving, media,
directory, search, and sharing facts. Treating one cached HTML document, Payload
`published` flag, cache tag, TTL, webhook, or CDN response as the whole Page
would blur those authorities and could retain unsafe positive content after a
worker is reclassified, consent is withdrawn, media is removed, a route is
retired, or Giving becomes ineligible.

Current Next.js and Vercel behavior makes the ordering material: Next server
cache invalidation does not purge a downstream CDN; HTML, RSC, prefetch, images,
metadata, and other outputs have distinct cache surfaces; ordinary provider
invalidation may intentionally serve stale content; and destructive deletion
can stampede an unavailable origin. An origin-only safety check is therefore
insufficient whenever a shared response can answer before the request reaches
that check.

## Decision

Adopt the complete Phase 22 D18 C-prime-R ruling:

> **C-prime-amended-and-hardened (C-prime-R) — one Phase-5-executed,
> Phase-22-semantic Public Ministry Runtime Composition Contract that selects
> only immutable, coherently available D2/D3/D4/D5/D9/D14/D17 release-bound
> presentation by exact opaque scope and generation after one small, disposable
> current-serving evaluation outside reusable content; resolves independently
> authoritative D2 reach, Phase 10 safety and containment, and D8 route heads to
> one typed local outcome; and composes D6 public progress, D7 Giving readiness,
> D9 delivery, D11 public Ministry Update releases, D13 discovery, and D14
> search/share only through their owner-versioned projections and degradation
> rules. No complete Asym-controlled HTML, RSC/prefetch, JSON, route, metadata,
> sitemap/robots, directory/search, Ministry Update, media/image-optimizer,
> resolver, or CDN response may bypass current admission; D7/Phase 13 executable
> actions always re-prove at their final boundary; and D15 measurement remains
> structurally absent from fetch, render, cache, crawler, social, probe, and
> repair traffic. Page- or Update-specific shared full-response caching is
> prohibited unless a provider-, product-, environment-, route-, and
> variant-pinned edge admission path is production-certified to run before that
> cache; otherwise only identity-free shells or immutable fragments may be
> shared-cached and the composed response remains dynamic and non-shared.**
>
> **Ordinary owner-authorized positive replacement production-shapes and
> addresses one complete immutable generation before D2's sole CAS activation,
> while the prior still-current safe release may remain available. An
> owner-labelled adverse or unknown fact first denies, omits, or disables only
> its affected positive behavior at the current local request or action boundary
> and forbids stale-while-revalidate and stale-if-error for that scope; it then
> invokes Phase 5 transport and the existing D8, D9, D13, and D14 effect owners
> through one code-owned applicable-surface coverage plan and rebuildable
> convergence projection that reference rather than recreate their facts.
> Monotonic generations, a transactionally coupled outbox, idempotency, lease
> fencing, tenant-fair coalescing, exact-scope keys, bounded retries, and
> residual-only recovery prevent reordered or duplicate work from resurrecting
> an older positive generation.**
>
> **Release activated, current admission, cache expiration requested, provider
> accepted, controlled response observed, not verifiable, and external
> observation remain separate facts. Healthy propagation is silent;
> contributors see only Public, Updating, or Not public, while staff see a
> cause-owned exception only for a missed controlled-surface deadline, including
> plain visitor impact, current automatic repair, and one narrow corrective
> action. Asym may claim current denial and best-evidenced cleanup only for
> surfaces it controls; recipient-held browser or router caches, screenshots,
> downloads, copied links, search engines, social networks, archives, and other
> external copies remain explicitly uncontrolled—without a second release,
> route, media, directory, search/share, subject, safety, Giving, progress, or
> measurement authority; raw-source joins; whole-request source fan-out;
> tag-as-isolation; tenant TTL or workflow matrices; broad purge; force success;
> blind retry; destructive rollback; stale adverse fallback; provider-parity
> fiction; public diagnostics; log-derived analytics; or any claim that
> released, served, cached, invalidated, accepted, observed, converged, crawled,
> indexed, shared, recalled, or forgotten are the same fact.**

D18 defines exactly four semantic freshness classes: immutable released
presentation, current serving admission, optional operational projections, and
executable actions. The current admission is a small disposable local projection
of D2, Phase 10, and D8 authority, not a new authority. Unknown returns a
neutral, non-enumerating, non-shared unavailable response.

The safe default caches only identity-free shells or immutable release fragments
and composes the final identity-bearing response after current admission. Shared
complete responses require exact provider/product/environment/route/variant
certification that admission executes before the cache. Ordinary positive
replacement may retain a prior independently valid release while a complete new
generation is prepared. An adverse fact denies, omits, redirects, or disables
the affected positive behavior before cache cleanup and prohibits stale fallback.

One append-only, generation-fenced Public Ministry Surface Convergence Operation records
the owner-labelled cause, desired disposition, exact applicable surfaces,
attempts, deadlines, and evidence. Requested, provider accepted, controlled
response observed, not verifiable, and external observation remain different
facts. Existing D8, D9, D13, and D14 effect owners retain their authority; D18
references their manifests and Phase 5 executes shared runtime transport.

**Phase 22 D19 precision.** D17 supplies only Project/Campaign Page subject
snapshots. For a Missionary Ministry Page, D1 owns the Page Subject Binding,
Phase 9 owns Ministry Assignment identity/lifecycle and source version, and
Phase 10 owns the minimum public-safe release snapshot. D18 composes the exact
release-pinned result but owns none of those facts and never raw-joins CRM. An
adverse source-lifecycle fact first enters the applicable Phase 10, D2, and D8
owner handling before D18 performs current admission and controlled-surface
convergence. A participant or Support Binding change does not itself choose a
Page retirement, redirect, or successor.

**Phase 22 D21 precision.** D21 owns complete adoption coverage and the one-time
initial cohort reader-generation transition; it does not own current-serving
admission, controlled-surface delivery, or convergence. The cutover appends one
D18 cause locally with its receipt, after which D18 applies its ordinary
adverse-first and fenced residual rules. Preparation and the D21 private whole-
surface shadow are not D10 preview, D2 release, D18 serving, cache warming,
crawler refresh, or external social/search proof. Later recovery advances a
certified D2 release or gateway generation and never reactivates the legacy
reader.

## Later Phase 22 D27 qualification

D27 separates two immutable inputs that D18 must compose exactly. D2 remains
the sole current release authority for one Page × locale and preserves its
release-time profile/catalog/renderer pins as baseline and historical evidence.
One separately current D3 Public Page Family Presentation Activation selects
the family profile generation for the exact Tenant × Legal Entity × environment
× Site × Page Family. D18 must resolve the exact current D2 Page × locale
release plus the exact current D3 activation and then apply current
D2/Phase-10/D8 admission. An unknown, incompatible, stale, or mixed pair is not
a partially usable Page and fails closed.

A mechanically certified compatible D3 successor may recompose immutable
presentation and D9/D14/D18 artifacts for every current release in the family
without advancing any D2 release head. Before activation it must prove the
complete current cohort—every non-retired Page × Phase-24-enabled locale with a
current D2 release head, regardless of reach—and pin the Site × family
coordination epoch plus exact release-head-set digest. Every D2 release-head CAS
and D3 activation uses that fence in a consistent order. A concurrent locale
release invalidates stale preparation; one short D3 CAS changes the family head
only after complete coherent artifacts exist, and partial family activation is
prohibited.

A migration-required profile, catalog, renderer, locale-behavior, media, or
semantic-exposure change leaves the prior D3 generation current until each
affected locale release receives an explicit owner-valid disposition. D18 does
not turn that work into a release, review, translation, attestation, or content
mutation. Historical reconstruction resolves the exact D2 release and D3
activation effective at the observation time. Generation-keyed admission,
adverse-first denial, and residual-only convergence continue to apply to the
composite and cannot fall back to mutable latest, another locale, or the
release-time profile alone.

## Consequences

- Public performance comes from immutable fragment reuse without making cached
  bytes publication, safety, route, progress, media, Giving, or discovery truth.
- A Phase 10 narrowing or other adverse change remains safe even when a provider
  purge fails, because current local admission—not provider cleanup—controls new
  Asym-served requests.
- Contributors see only the runtime/convergence summary **Public**,
  **Updating**, or **Not public**; those labels do not replace D2's exact
  Publication Reach outcomes. Staff see
  **Visitor access stopped — cleanup continuing** or **Needs attention** only for
  missed controlled-surface deadlines, with one cause-owned residual action.
- Complete coverage includes HTML, RSC/prefetch, public APIs, metadata/share,
  sitemap/robots, redirects/tombstones, directory/search, source and transformed
  media, browser/CDN headers, and every organization-controlled CDN.
- Vercel/Next.js capabilities remain adapter facts pinned to the exact provider,
  product, environment, version, route, and variant. Documentation or a `200`
  response cannot establish production behavior or whole-system convergence.
- D15 cannot count render, cache, crawler, social-card, probe, or repair traffic
  as human interaction.
- Recipient caches, screenshots, downloads, copied links, search engines, social
  networks, and archives remain explicitly outside Asym's recall guarantee.
- Migration must explicitly retire the legacy 60-second reader, mock/static
  worker pages, direct source-media URLs, old derivatives, long-lived metadata
  and sitemap/robots artifacts, and old cache-key namespaces without dual
  publication authority.

## Considered options

### Always-live public assembly

Rejected. Fetching CMS, safety, progress, Giving, media, route, and discovery
sources on every request creates latency, cost, thundering-herd, and correlated
outage risk and still does not control browser, CDN, image, search, or social
caches.

### One cached Page snapshot or TTL

Rejected. It collapses independently authoritative facts into one timestamp and
cannot make an adverse safety change outrun all cache layers.

### Origin-only current gate plus provider purge

Rejected. A CDN or other shared response cache may answer before origin, and
provider invalidation may deliberately serve stale content.

### Release-bound fragments plus current admission and adverse convergence

Accepted. It keeps the normal path fast and quiet, fails closed at the smallest
affected scope, and makes provider cleanup observable without granting it source
authority.

## Related decisions

- [ADR-0029](./0029-reference-not-copy-cms-operational.md) — CMS references
  operational truth rather than copying it
- [ADR-0119](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
  — current Publication Reach and Phase 10 ceiling
- [ADR-0123](./0123-page-resolved-source-authoritative-public-support-progress.md)
  — independently owned progress projections
- [ADR-0124](./0124-one-exact-page-giving-binding-for-phase22-mvp.md) — final
  independently re-proved Giving destination
- [ADR-0125](./0125-source-qualified-public-page-route-dispositions.md) — route
  and lifecycle disposition
- [ADR-0126](./0126-release-bound-public-ministry-media-assets.md) — current-
  authorized immutable media delivery
- [ADR-0130](./0130-scoped-public-ministry-discovery-with-tenant-chosen-topology.md)
  — public directory projection
- [ADR-0131](./0131-release-bound-public-search-and-sharing-presentation.md) —
  search and sharing projection
- [ADR-0132](./0132-bounded-public-ministry-measurement-and-contributor-visibility.md)
  — measurement boundary
- [ADR-0134](./0134-exact-typed-public-page-subject-bindings.md) — release-pinned
  Page subject snapshot
- [ADR-0136](./0136-organization-owned-ministry-assignments-and-separated-support-access.md)
  — Missionary Ministry Page subjects and separated support access
- [ADR-0138](./0138-complete-public-ministry-surface-authority-cutover.md) —
  complete adoption coverage and the initial public reader transition
- [Phase 22 decision log](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md)
- [Phase 22 research evidence §40](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md#40-ratified-d18-research--public-runtime-composition-caching-and-controlled-surface-convergence)
