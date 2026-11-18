# ADR-0027: Transport-agnostic reader, single Payload read in admin, availability seam

**Status:** Accepted (founder ruling, Phase 5 grill session 2026-07-05 — A3/A4; implementation amended 2026-11-17 for AL-2688)

> Full record: `docs/prds/sitestacker-parity/phase-05-public-website-runtime-contract.md`
> (rulings A3 and A4; deep modules in Section B).

## Context

Every public content read today is a live call from the public pages into the
admin app, where Payload CMS runs — the public website is welded to the staff
app's uptime and speed, and the "resolve tenant → fetch published → serialize"
rules live implicitly in that split. Any second consumer (a future `apps/web`,
a native surface) would have to re-derive those rules. Payload itself runs on
a pre-release spike dependency whose internals churn. The alternatives were:
scatter per-app Payload calls (status quo — every consumer re-implements the
safety rules), hard-weld an HTTP dependency into the contract (the transport
becomes the contract), or define the contract at the Asym boundary with the
transport as an implementation detail.

## Decision

The public-content contract lives in **one server-only shared package under
`packages/api`**, and dependencies point **into** it: admin, donor, and any
future web app depend on the package; the package never imports Payload or
the admin app. The package defines a **`PublishedContentReader` interface**
returning serialized public types; **exactly one concrete implementation
touches Payload's Local API**, co-located where Payload runs (admin). The
transport between the public runtime and that reader (HTTP today) is a
swappable implementation detail — consuming pages read only through the
package client, never a hard-coded admin URL. The cache-tag scheme is built
now so public reads are cacheable; an alternate transport that removes admin
from the hot read path (CDN/replica) is a **reserved capability with an
explicit trigger** (an `apps/web` extraction or an availability SLO).
_Amended 2026-11-17 (see Amendments): the reserved capability is invoked. The
`PublishedContentReader` interface stays, and its implementation reads Core's
immutable published releases in `packages/api`, after an admission read on
every request; no implementation touches Payload on the public path, and the
cache-tag scheme is replaced by caching each release body under its release
ID. The sentences above are the 2026-07-05 ruling, kept as dated history._

## Consequences

- The public runtime depends on a stable serialized contract, never raw
  Payload documents or the `cms` schema — Payload's pre-release churn stays
  invisible above the boundary.
- One owner for the safety rules (tenant scoping, published-only,
  serialization) keeps apps thin; a second consumer is an import, not a
  re-derivation.
- Availability honesty: in Phase 5 (Public Website Runtime Contract) the
  admin app is still on the cold-read path for public content. The
  availability seam is designed (via the cache-tag scheme) but not built —
  a later, triggered capability, not a Phase-5 guarantee.
- The reader interface grows additively (listing/detail for events and
  campaigns later); adding a page type never re-opens the transport question.

**Phase 24 D66 amendment (2026-08-30).** Every locale-bearing public read adds
trusted Tenant, environment, Site, stable Site Locale, exact public generation,
and requested resource to the contract. It explicitly requests the exact locale
with CMS fallback disabled. Missing ordinary target-language content returns an
absent result plus only a source-owned typed same-resource alternative relation
whose target is independently proved current and safe; placement and label
remain source-owned. The reader never asks Payload to substitute fields or
complete resources.
Readiness consumes batched source-owned version evidence through this boundary;
it does not duplicate Payload status or scan every document on a public request.

## Amendments

### 2026-11-17: The release-backed reader is the implementation (AL-2688)

- **Authority.** The owner's instruction of 17 November 2026 to implement the
  CRM, CMS and database plan ratifies the disposition its
  [section 14](../audits/core-crm-cms-database-target-architecture.md#14-required-future-documentation-decisions)
  lists for this record. It records intent, not implementation.
- **Kept.** The public-content contract lives in one server-only package under
  `packages/api`; dependencies point into it; consuming pages read only through
  it and never a hard-coded admin URL; the reader interface grows additively; and
  the public runtime depends on a stable serialized contract, never raw Payload
  documents or the `cms` schema.
- **Changed.** The reader's implementation is backed by Core's release tables
  ([ADR-0229](0229-per-page-releases-and-two-publish-commands.md)). Publishing
  copies the serialized page into an immutable release row; the public site never
  queries Payload and does not depend on the admin app being up. That is the
  reserved capability this record named, invoked behind the same interface. The
  plan's trigger is concrete: every cache miss on a public page would otherwise
  compete with editors for Payload's small pool, and withdrawal would depend on an
  expiry call crossing two deployments (plan section 11.3, decision 1).
- **Admission decides what is served.** One read function, keyed by verified
  host and path and never cached across requests, admits every request before any
  cached content is read: the page's live head and reach, the Site's live
  navigation release, and whether the tenant, the Site and the page's subject may
  be served now. Only then is the body read, cached under its release ID. The
  reader treats a release as untrusted when it renders: it parses the content
  against the shared block registry, drops unknown blocks and never renders stored
  markup unescaped.
- **Availability.** The consequence that the admin app stays on the cold-read
  path no longer holds once the release-backed reader ships (WP7).
- **Phase 24 D66.** Its locale-bearing contract carries over to releases, which
  carry a locale column from the start; localization itself is deferred.
