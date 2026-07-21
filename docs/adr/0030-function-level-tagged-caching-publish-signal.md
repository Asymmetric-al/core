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
