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

**Phase 24 D66 amendment (2026-08-30).** Locale publication cache keys include
Tenant, environment, Site, trusted host, stable Site Locale ID, Public Site
Generation, resource, audience, and renderer. A bare `locale:fr-ca` tag is too
broad and must not invalidate every Tenant; locale invalidation is scoped by
stable Tenant/Site/locale identity and remains under Vercel's tag limits.
Negative private/unpublished-locale results cannot outlive first publication.
The publication transaction emits one idempotent outbox effect to the secured
public invalidation endpoint; source success is shown as **Publishing** until
the exact URL, language control, canonical/alternate metadata, and sitemap
projection acknowledge the same generation. A lost signal retries, while the
committed Public Site Generation head remains sole authority; a lagging edge
may return privacy-safe absence or prior output only after a fresh head check
proves it remains authorized. No Vercel Domain API call, deployment, Proxy
database/content lookup, or `Accept-Language` cache variant participates.
The generation-bound Edge Config projection is a pre-stream deny gate, never
grant authority: favorable publication commits the human-authorized head before
allowing admission; withdrawal, Site suspension, and safety revocation persist
and acknowledge the adverse fence before committing their adverse head.
Unknown fence outcomes reconcile before transition, and no direct mutation may
bypass this sequence.

**Phase 24 D72 amendment (2026-08-30).** Public cache identity includes the
canonical requested host, Site Domain binding/role generation, current Primary
Site Domain generation, route-owner result, and compatible D1/D66 public
generation. A Redirect Site Domain never reads or populates a favorable content
entry; its bounded route decision and response cannot share a Primary content
cache or viewer/session cache. Primary changes prepare and advance a compatible
public-origin generation cohort, emit exact scoped invalidation/admission effects,
and remain incomplete until readback agrees. Tags never isolate. The trusted
host projection resolves the redirect before content/static redirects and meets
the Phase 5 launch p99 15 ms budget only after capacity proof. Request-time
database/provider calls, Vercel whole-domain redirects, per-domain/path static
rules, platform-host fallback, and request-header-derived canonical origins are
prohibited.

**Phase 24 D73 amendment (2026-08-30).** A Primary successor advances the exact
Domain plus current D1/D66 public-locale origin head cohort or none. Promotion
requires immutable redirect/cache history compatible with the inverse mapping;
`no-store` on a new response cannot recall a previously cached redirect. A
host/target generation mismatch withholds the redirect and fails safely so
mixed-edge propagation cannot create `old → new → old` loops. Owner-qualified
stable equivalent former-host routes may emit `308`; the mutable root composes
D16 and emits `307`; both are direct final targets with `no-store`,
`no-referrer`, and explicit empty-fragment handling. Neither response shares a
content/viewer cache, and tags remain invalidation—not isolation or authority.

**Phase 24 D74 amendment (2026-08-30).** Disconnecting is an adverse Domain
generation, not cache purge or tag state. It prevents every new favorable cache
read/fill before provider removal, and required admission/cache cohorts must
acknowledge that generation. Provider removal, certificate change, DNS drift,
tag invalidation, or apparent traffic absence cannot release the current claim.
Unknown or residual routing remains adverse and reserved until authenticated
provider readback and the final Core claim transaction agree. No stale content,
redirect, or viewer cache may choose a fallback Site after disconnection.

**Phase 24 D75 amendment (2026-08-30).** A fresh claim creates a new private
binding generation; it never revives or retags a former cache cohort. Requested
host, exact Tenant/environment/Site, new binding generation, route owner, and
public generation remain required cache identity. Former content/redirect/
asset/session entries cannot become favorable under the new binding even if the
same origin returns. D10 adverse origin/path reservations execute before cache
lookup/fill. Tags, purge success, DNS, provider verification, and
`Clear-Site-Data` are not isolation or public authority.

**Phase 24 D76 amendment (2026-08-30).** Moving an unchanged hostname between
Sites appends a new binding generation; it never retags source cache entries as
target entries. The exact host/binding/Site/public/locale/route/owner generation
remains cache identity. A monotonic Moving generation blocks favorable reads and
fills until required adverse cohorts acknowledge it; the target fills only
after authority and admission agree. Tag invalidation, stale-while-revalidate,
purge success or a Vercel cache response cannot prove the cutover. Any source
content served after completed target admission is an incident.

**Phase 24 D77 amendment (2026-08-31).** The D76 authority digest pins the exact
critical owner results and immutable source/destination effective-host route
manifest effects. Source-only former paths receive explicit negative route
effects rather than relying on cache miss or target absence. Cache lookup/fill
occurs only after the current binding/route-effect/public generation agrees; an
unresolved collision, unknown owner, digest mismatch or missing manifest cannot
fall through to content, a static redirect or stale cache. D77 comparison never
runs on a public request, and Vercel/project rules, purge or tags never become
route authority.

**Phase 24 D78 amendment (2026-08-31).** Cache identity for a qualified
different General Page successor includes the exact host, binding role/
generation, source route effect, target Page/public revision/route generation,
Site, locale, and qualification head. A stale qualification, target revision,
or redirect-only/Primary role mismatch cannot reuse a favorable Page body or
redirect. Tags/purge may converge delivery but never carry the human decision
forward, infer a replacement, resurrect an ineligible target, or recall an
externally cached permanent result.

**Phase 24 D79 amendment (2026-08-31).** Post-activation cache/public-generation
identity for a different-Page successor also pins the current target Page/locale
Page Purpose Continuity Version and the exact D1 publication receipt. A
preserving effective Page release creates a new public generation against the
same continuity version. A D80 material candidate never publishes the source
and never advances that version; its fresh private target has no public/cache
identity before later independent D1. Cache tags, purge, stale-
while-revalidate, CDN state, search, analytics, or a delivery-only D1 rebuild
with the exact meaning-bearing dependency digest unchanged cannot infer or
advance semantic continuity. A changed localized/shared/Reusable Section/
reference dependency must enter D1 consequence review. Public requests still consume one
compiled route effect with constant cost. Core may invalidate its own generation
and caches but cannot recall a permanent response already cached by a browser or
external intermediary; material-change UX and D80 must not promise otherwise.

**Phase 24 D80 amendment (2026-08-31).** Creating the new private Page invalidates
only authorized staff/editor projections required to reveal the target. It
emits no public cache purge/tag/generation, Vercel route/deployment mutation, or
search/sitemap/social effect. Source cache keys and bytes remain unchanged; the
target enters the ordinary cache contract only after its later D1 release.
