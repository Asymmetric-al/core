# ADR-0030: Function-level tagged caching + cross-app publish signal, no route-segment config

**Status:** Accepted (founder ruling, Phase 5 grill session 2026-07-05 — A9)

> Full record: `docs/prds/sitestacker-parity/phase-05-public-website-runtime-contract.md`
> (ruling A9; wiring details in Section E, verified against the installed
> Next.js 16.2 bundled docs and official Vercel documentation).

## Context

Public pages must be fast (cached) and fresh (a publish appears promptly),
without ever serving one tenant's page from another tenant's cache. The repo
runs Next.js Cache Components (`cacheComponents: true`), where route-segment
config exports (`revalidate`, `dynamic`, and friends) are build-breaking —
see `docs/guides/architecture/runtime-map.md`. Two doc-verified findings
shaped the decision: **cache tags do not isolate cache entries** (a tag is an
invalidation handle, not part of the cache key — tag-alone caching would
bleed content across tenants), and cross-deployment invalidation needs an
explicit signal from the app that knows a publish happened (admin) to the app
that serves the cached page (the public runtime). The alternatives were
time-based-only caching (stale pages, editor frustration), no caching (public
availability rides every admin read), or function-level tagged caching with
an explicit publish signal.

## Decision

Published reads use **function-level `use cache` + `cacheTag` + `cacheLife`**.
**Cache-key isolation comes from passing the resolved tenant as a function
argument** — tags are for invalidation only. Tags are tenant/document-derived,
mandatory by construction, and respect platform limits (no commas, bounded
length via stable ids, consistent casing); `site` and `locale` tag dimensions
are reserved. Publishing (and navigation/redirect/media/CTA changes) emits a
**secured admin→public-runtime invalidation signal** — HMAC-signed and
verified in constant time — that calls `revalidateTag(..., "max")` in the
public app's route handler, propagating globally in roughly 300ms. A
**bounded `cacheLife` expire (about an hour, never "never")** is the
self-healing backstop for a missed signal. **No route-segment cache config
exists anywhere in the public app**, and request-specific values (host,
headers, draft state) are read outside `use cache` and passed as arguments.

## Consequences

- Tenant cache isolation is triple-layered: the tenant argument in the cache
  key, Vercel's host-in-cache-key default, and tenant-derived tags — a tag
  bug alone cannot serve tenant B from tenant A's entry.
- Editors see publishes propagate in seconds (the signal), and a missed
  signal self-heals within the bounded `cacheLife` window instead of pinning
  stale content forever.
- The invalidation endpoint is an authenticated machine surface: a forged or
  replayed call cannot force cache purges, because the signature is verified
  in constant time before any revalidation runs.
- A structural CI assertion keeps route-segment config out of the public app
  permanently; caching decisions stay at the function level where the tenant
  argument is visible.
- Draft Mode requests are dynamic by construction (the bypass cookie), so
  preview traffic can never populate or read the published cache.

## Dated Phase 22 D18 clarification (2026-08-06)

This ADR remains the Phase 5 cache-mechanism authority. Phase 22 D18 adds Public
Ministry semantic ordering and controlled-surface coverage; it does not create a
second cache implementation, publication head, or purge service.

The original “roughly 300ms” and “about an hour” language describes the selected
provider/mechanism expectation and bounded self-healing target. It is not proof
that every HTML, RSC/prefetch, JSON, metadata, sitemap, route, media, image-
optimizer, directory/search, browser, or CDN variant stopped serving, and a
bounded `cacheLife` is not an adverse-safety control. Likewise, the earlier
“triple-layered” consequence does not make a tag an isolation or authorization
layer: exact cache-key arguments isolate, current admission authorizes, and tags
only address invalidation.

For Public Ministry responses, request-specific scope is resolved outside
reusable content and one small disposable **current-serving evaluation** runs
before identity-bearing cached content is selected. Complete shared Page or
Ministry Update responses are prohibited unless the exact provider, product,
environment, route, and variant is production-certified to execute that
admission before every cache. Ordinary still-valid positive replacement may use
bounded stale-while-revalidate; an owner-labelled adverse or unknown scope must
deny or omit locally first and may use neither stale-while-revalidate nor stale-
if-error.

One append-only **Public Ministry Surface Convergence Operation** references A9
transport and the existing Phase 22 effect owners for exact residual recovery.
Release activation, expiration requested, provider accepted, controlled response
observed, not verifiable, and external observation remain different facts.
Recipient-held browser/router caches and external search, social, archive,
download, screenshot, and copied-link artifacts are outside Asym's recall
control. See [ADR-0135](./0135-release-bound-public-ministry-runtime-composition.md).

## Dated Phase 22 D21 clarification (2026-08-14)

The D21 Surface Authority Cutover atomically appends one D18 cause through the
local transactional outbox, but cache invalidation, warming, provider
acceptance, controlled-response observation, deployment rollback, or external
index refresh cannot establish, reverse, or complete the reader-authority
transition. The cutover advances one cohort authority head after comparing
precomputed immutable digests and owner epochs; D18 then owns fenced residual
controlled-surface convergence. An old deployment or cache namespace must honor
the current head or fail closed and can never revive the legacy reader.
