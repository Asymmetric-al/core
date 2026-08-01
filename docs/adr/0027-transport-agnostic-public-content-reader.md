# ADR-0027: Transport-agnostic reader, single Payload read in admin, availability seam

**Status:** Accepted (founder ruling, Phase 5 grill session 2026-07-05 — A3/A4)

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
