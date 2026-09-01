# ADR-0026: Public Website is a surface in `apps/donor`, `apps/web` reserved

**Status:** Accepted (founder ruling, Phase 5 grill session 2026-07-05 — A2)

> Full record: `docs/prds/sitestacker-parity/phase-05-public-website-runtime-contract.md`
> (ruling A2; see also A1 scope and A12 public-web mechanics).

## Context

The public tenant website already ships in production as the `(public)` route
group inside the donor app, and the platform-surfaces spec names it a
first-class product surface. Phase 5 (Public Website Runtime Contract) had to
decide where that surface lives going forward. The alternatives were: extract
a separate `apps/web` package now (deployment isolation, independent
availability, a clean home for future public features), or keep the public
website as a surface inside `apps/donor` (today's shipped reality, no second
app to build, deploy, and keep healthy while the runtime contract itself is
still being formalized). Extracting first would have meant standing up a new
app around an undocumented, partially unsafe runtime — moving the problem
before fixing it.

## Decision

The public tenant website is a **product surface, not (yet) a separate app**.
It stays at the `(public)` route group in `apps/donor`, per the
platform-surfaces intent. No `apps/web` is created now; the extraction is
**reserved**, and the runtime contract is deliberately written so that a
future extraction is a re-import, not a rewrite: all public-runtime rules live
in one server-only shared package under `packages/api` (the published-content
reader interface, allowlist serializer, checkout-handoff resolver, cache-tag
scheme, and public request context), and consuming pages depend only on that
package's serialized types. The future public route families (`/give`,
`/projects`, `/events`, `/campaigns`, `/updates/[slug]`, `/thank-you`,
`/sitemap.xml`, `/robots.txt`, `/preview`) are reserved now so later phases do
not collide; checkout stays public at `/checkout` and the donor dashboard
stays authenticated.

## Consequences

- No second Next.js app to operate while the contract is proven; the public
  website keeps shipping from the donor app's deployment.
- The shared contract package is mandatory, not optional — it is what keeps
  the reserved `apps/web` extraction cheap (re-point the imports, not
  re-derive the rules).
- Public website behavior and authenticated portal behavior must stay clearly
  split inside the one app, per the platform-boundaries spec; the reserved
  route families make that split structural.
- The extraction trigger is explicit and deferred: an `apps/web` split (or an
  availability SLO that demands removing admin from the hot read path — see
  ADR-0027) re-opens this decision with the contract already in place.
- Because the public surface shares the donor app, its static-shell invariants
  are pinned by `tests/unit/apps/donor/static-shell-contract.test.ts`. Those are
  deliberately source-text guards: a request read leaking into shared chrome
  empties the crawler-visible HTML while the build stays green, so only an
  assertion on the source can catch it.

**Phase 24 D66 amendment (2026-08-30).** The donor app must support the fixed
`/lang/{exact-locale}` public Site surface without importing Payload runtime,
using browser-language negotiation, or reskinning the Tenant-wide authenticated
account. The current global metadata, English `<html lang>`, Latin-only Site
shell, unprefixed catch-all, and static sitemap assumptions are migration
evidence. No Site Locale may publish until the shared public contract can render
its exact `lang`/`dir`, brand, frame, error boundaries, canonical metadata, and
Public Site Generation server-side. A future `apps/web` extraction consumes the
same contract and does not change locale identity or release authority.
