# ADR-0198: Critical-path-gated, exception-led Domain move route review

**Status:** Accepted with required amendments (Phase 24 D77 — 2026-08-31)

## Context

A Prepared Site Domain Cutover changes which Site one unchanged hostname
represents. That change must not let an old public address silently acquire a
different Page, Giving purpose, authentication behavior, callback, protected
action, or Tenant/Site attribution merely because the destination happens to
publish the same path.

The two obvious extremes are both poor product decisions. Requiring staff to
classify every Page turns a routine same-Tenant Domain move into a CMS migration
project and encourages mechanical approval. Carrying no continuity at all breaks
known exact successors and useful bookmarks. A blanket path-preserving fallback
is worse: it confuses visitors, can create a soft `404`, bypasses route owners,
and lets the destination reinterpret protected meaning.

Current external guidance supports the bounded middle. Google recommends
mapping genuine equivalents directly, avoiding redirect chains and irrelevant
homepage collapse, and returning a real `404`/`410` where no replacement exists.
HubSpot and WordPress automatically preserve individual Page identity after a
slug change, while Shopify and other CMS products expose route-reserved and
explicit redirect behavior. Some providers also support wildcard transforms.
Those patterns do not override Core's governing route decisions: D9 requires
exact owner proof, D10 permanently protects Issued Giving Addresses, and
proposed Phase 23 ADR-0147 rejects wildcard/regex route authority. D77 therefore
uses exact compiled route effects only. A future bounded transform would require
its own route-owner amendment and proof.

Current `develop` cannot implement this decision. Payload Pages are Tenant-only
mutable slug records; public reads choose the latest published row by slug; the
donor catch-all reads that record directly; Navigation can contain raw `href`
text; canonical metadata is globally configured; and Next.js contains host-
blind permanent redirects, including `/give`. There is no current Site-aware
Public Site Generation route manifest, critical-owner registry, Domain cutover
comparison, route reservation, or owner-aware runtime router.

Open, blocked Phase 22 PR #1323 and Phase 23 PR #1340 propose the needed route
and Public Site Generation foundations but are not governing runtime truth.
Phase 22 permits a permanent move only for the same immutable specialized Page.
Phase 23 permits ordinary same-Page continuity only within the same Site and
locale. Neither currently authorizes a cross-Site different-Page successor.

## Decision

### One derived review inside D76

A **Domain Move Route Review** is the immutable, deterministic proof that D76
consumes before it may install the adverse Moving barrier. It is not a route
owner, resolver, redirect table, publication workflow, Content Health issue,
Internet crawler, or migration project.

The review reuses two authorities that Phase 24 already requires:

1. the one finite, code-owned D72–D76 critical owner-family registry and its
   current typed source-owner outcomes; and
2. the source and destination's complete immutable effective-host route
   manifests compiled from exact current Public Site Generations and binding
   roles.

D77 adds only a pure comparison and a permission-safe staff projection. It adds
no D77-specific adapter framework. The same registered owner port used by D73
and D76 supplies every critical result. Ordinary Page routes use one Public Site
Generation manifest boundary, not one adapter per Page, Page type, or feature.

### A genuinely small critical-path inventory

Core MUST maintain a small, versioned, code-owned critical-path inventory. It is
an inventory of owner families, not an ever-growing row for every concrete URL.
An applicable family is critical when wrong routing could:

- accept, initiate, or reinterpret money or another durable protected effect;
- authenticate, authorize, establish trusted origin, or complete a callback;
- invoke an API, form submission, provider control/result path, or protected
  action;
- choose Domain, root, locale-root, canonical-origin, or public admission
  authority; or
- bypass a safety, privacy, cache/admission, or route reservation boundary.

Each registry entry has one stable owner/family key, contract version, route
precedence, evidence-head reader, finite result vocabulary, privacy projection,
and required tests. Tenant settings, provider records, CMS plugins, database
rows, imported configuration, support tools, and AI cannot register or
reclassify a critical family. Adding a family is an explicit code/review/test
change.

Every applicable family returns exactly one current typed result through its
owner contract. Missing registration, missing or truncated evidence, an unknown
contract version, contradiction, duplicate authority, stale evidence, or an
`unknown`/blocking result blocks the cutover. Permission filtering may hide
details from a viewer; it can never remove the server-side blocker.

### Immutable effective-host route manifests

The Public Site Generation/route-owner compiler produces a complete immutable
effective-host manifest for the exact Tenant, environment, Site, locale, Domain
binding/role generation, public generation, and canonicalizer version. It
contains route-authoritative facts only:

- canonical collision key and router-equivalent alias class;
- stable route-owner/family and stable resource identity;
- prior-public and reservation state;
- method family;
- immutable route-effect identity/generation; and
- current direct, owner-qualified successor, or not-found effect reference.

Mutable labels, titles, summaries, body content, similarity scores, analytics,
traffic, search rank, and UI state do not enter route identity. Query strings
and fragments are not route identities. Current mutable Payload rows, raw
Navigation `href` values, runtime HTML, logs, Vercel configuration, and live
provider calls are never scanned to build the move-time proof.

The exact D15 path canonicalizer governs IDNA host form, percent encoding,
Unicode normalization, case policy, slash/trailing-slash behavior, dot segments,
backslashes, locale bases, malformed input, and router-equivalent aliases. A
comparison across incompatible canonicalizer versions blocks unless a reviewed
dual evaluation proves identical coverage and collisions.

The comparator is pure and versioned. It consumes two complete immutable
manifests plus the current critical registry generation, sorts by canonical
collision key, owner class, and stable identity, and emits the same result
regardless of database row order, pagination, retry, worker, or region. Missing
or truncated input is unknown, never an empty manifest or zero exceptions.

### Exact outcome algebra

Every known effective source address receives exactly one outcome:

1. **Critical owner outcome.** The registered owner alone decides direct,
   unavailable, qualified successor, or block behavior.
2. **Source-only ordinary address.** Core compiles the owner's truthful real
   not-found effect; staff need not decide it route by route.
3. **Target-only ordinary address.** The destination may retain its current
   owner effect because no source address is being reinterpreted.
4. **Exact ordinary collision.** The move blocks until the destination path
   changes, the ordinary route owner supplies an accepted exact successor, or
   the destination publishes the compiled not-found effect.
5. **Already owner-qualified successor.** D77 consumes that exact current owner
   relation and target generation; it does not create or edit it.
6. **Redirect history, inverse, chain, loop, duplicate, or canonical collision.**
   The move blocks until its owner publishes a direct, unambiguous result.
7. **Unknown or incomplete authority.** The move blocks and source remains
   authoritative.

Mere target absence is not enough for a source-only address. Otherwise the
destination could later publish a different Page at that historical path and
silently reuse its trusted meaning. The cutover therefore carries an explicit
compiled not-found effect/reservation into the new binding generation. It
outranks later ordinary Page registration until the ordinary route owner
publishes a separately reviewed successor or reuse decision. This is automatic
generation compilation, not staff work and not another runtime resolver.

A qualified ordinary successor references a stable eligible internal resource,
never a raw or caller-supplied URL. Any redirect is source-owner-issued,
navigation-safe `GET`/`HEAD` only, direct to the final destination, and bound to
current Tenant/environment/locale/audience/safety/route generations. D77 carries
no arbitrary query, body, cookie, authorization, return target, client state, or
fragment meaning. Unsafe methods never receive generic content continuity.

Giving, checkout, authentication, callback, API, `/.well-known`, provider-
control/result, protected-action, locale-root, sitemap/robots, and every other
registered owner run before ordinary content. A same slug, title, copied Page,
template, body hash, Site relationship, analytics result, or AI score never
proves continuity.

D77 does not decide when two different ordinary Page identities continue the
same public meaning. ADR-0199/D78 now supplies the one accepted exception: the
ordinary Page owner may issue a directional, exact-address, revision-bound
successor qualification only between current `general_page` releases after one
authorized human compares the exact releases and confirms the same public
subject, substantive purpose, and visitor task. D77 merely consumes that current
owner fact. Missing, stale, rejected, Article/specialized, inferred, or
cross-scope proof still blocks or compiles not-found.

### Authority, data, authorization, and RLS

CMS/Page owners retain source content and placement truth. Public Site
Generation authority owns immutable public route manifests. Registered owners
own critical dispositions and successors. D76 owns the Domain cutover. D77's
comparison is derived proof only.

The D76 plan pins source/target manifest IDs and digests, binding/public heads,
canonicalizer/registry versions, critical evidence heads/results, ordinary
classification/effect digest, qualified successor references, unresolved
exceptions, and a separately labelled advisory snapshot. The authority digest
excludes advisory placement churn. D76 rechecks every effect-bearing head and
digest before the Moving barrier and again before target admission. Drift yields
**Plan changed · Review again**; it never silently carries an old result forward.

Logical storage enforces immutable same-Tenant/environment/Site/locale/public-
generation scope, unique canonical route effects for each binding generation and
method class, owner-qualified effect references, preserved source-only negative
reservations, complete applicable critical results, restrictive deletes,
append-only comparison/receipt/audit/outbox history, and equality-leading
indexes for manifest heads, canonical paths, owner family, unresolved exception,
move comparison, and runtime effect. Exact table and column names remain design-
owned. Runtime lookup and staff exception paging cannot require deserializing or
scanning an unbounded JSON blob.

Raw critical manifests, route history, protected identities, and comparison
details are server-only by default. Tenant-visible projections require current
both-Site scope plus each resource's read capability, least grants, enabled and
applicable FORCE RLS, correct `USING` and `WITH CHECK`, and immutable scope.
Browser/Data API roles cannot mutate manifests, effects, reservations,
comparisons, receipts, or heads. Table owners, views, functions/RPCs, triggers,
`BYPASSRLS`, service/secret roles, workers, Payload, imports, support, repairs,
and AI repeat exact scope, capability, owner-contract, expected-head, and actor-
attribution checks. A Domain Manager who cannot inspect an exact protected path
sees a permission-safe blocker, not the path, identity, count, or cause detail.

### Staff experience

D77 is one compact section in D76's existing route-addressable full-page Base
Maia review:

> **Existing web addresses**  
> Core checked the current addresses it manages for Field Stories and Main
> Website. This does not include every bookmark, printed QR code, backlink,
> browser cache, sent message, or external campaign.

When blocked, the leading sentence is consequence-first:

> **2 issues must be resolved before this domain can move.**

One quiet textual summary shows:

- **Critical addresses:** Ready, or a permission-safe blocker count/status;
- **Ordinary Page conflicts:** only unresolved actionable exceptions;
- **Continuity already prepared:** collapsed count/summary;
- **Former addresses:** count that will show **Page not found**; and
- **Known places to update:** explicitly incomplete advisory evidence.

Counts appear only from complete authoritative input that the viewer may know.
Incomplete or hidden evidence is **Unknown** or **Some protected addresses need
another owner**, never zero. No status is color-only, no decorative statistics
cards are added, and the interface never says all links migrated, nothing will
break, or the Internet was inventoried.

Only **Blocks the move** and **Ordinary Pages to review** expand by default. Safe
not-found and already-qualified outcomes remain collapsed but inspectable through
bounded server-side keyset pagination/search when authorized. No giant client-
loaded table, virtualization-first screen, CSV export, bulk approval, select-all,
AI mapping, HTTP-status editor, arbitrary target field, wildcard/regex control,
or Vercel terminology appears.

Each exception row states the exact old address, visitor consequence, source
owner, plain reason, and one cause-owned action such as **Open Page**, **Change
web address**, **Review Giving address**, or **Review route continuity**. The
move page never edits or marks an owner outcome fixed. After a source-owner
action, the same D76 review resumes and verifies the new current digest.

The page remains one-column at small widths, wraps and isolates long/IDN/RTL
paths, retains full copyable values, uses shared Base UI/Zinc/PageShell controls,
and preserves filters/position on refresh and return. Release evidence covers
320 CSS pixels, 400% zoom, keyboard, screen readers, visible focus, forced
colors, reduced motion, 44px targets, long localization, weak networks,
refresh/resume, session expiry, duplicate actions, and one polite meaningful
status announcement without polling noise.

### Runtime, provider, failure, and rollout boundary

Phase 5's one owner-aware admission/router consumes the compiled current route
effect before the CMS catch-all or content cache. Public requests never run the
D77 comparison, scan a manifest, query a provider, or choose from mutable latest
rows. Cache identity includes exact host, binding, Site, locale, route owner,
route effect, and public generations; cache tags invalidate only.

An owner-proved unavailable ordinary address returns its declared real `404`
envelope, never a `200` soft `404`, homepage, same-slug destination, or historical
explanation. D77-controlled historical absence launches with the D9
non-enumerating, no-brand, `no-store` envelope and no Asym/Vercel branding.
Authority failure returns the neutral `no-store` temporary-unavailable result,
not a guessed `404` or success.

D77 makes no Vercel Domains, project, redirect, rewrite, bulk-redirect, cache,
DNS, TLS, or deployment request. All Sites share the donor Vercel project, so a
project-level path rule would be cross-Tenant/global coupling and a second route
authority. Current Vercel staging/versioning capabilities are useful deployment
evidence only.

Preparation happens from published owner generations, then compares immutable
ordered manifests in bounded set-based work. Owner evidence is batch-read; no
per-route network call or N+1 adapter loop is allowed. The staff view loads
summary and blockers first and keyset-pages details. Maximum supported routes,
critical owners, locales, collisions, IDNs, and restricted results require
capacity evidence before activation; a vague “scalable” claim is insufficient.

Rollout is reader/adverse-first: reconcile Phase 22/23 ownership; land D1/D15
manifests and the one D72/D73 owner registry; inventory framework route families
in CI; remove or fence host-blind static redirects and mutable CMS fallback;
deploy route-effect readers and negative reservations; shadow-compile and compare
production-shaped manifests; then enable exception review and finally D76
consumption by cohort. Rollback disables new comparisons/moves but retains
manifests, negative reservations, qualified successors, active Moving barriers,
and history. It never restores a bypassing reader or reconstructs authority from
mutable source rows.

## Consequences

- Critical money, identity, security, and public-origin paths must be completely
  current; unknown never looks green.
- Staff act only on real exceptions and see truthful counts for automatic
  not-found and qualified continuity outcomes.
- Historical ordinary paths cannot later acquire destination meaning silently.
- The architecture adds one pure comparison artifact and one derived UX section,
  not another resolver, adapter framework, redirect store, or workflow.
- Phase 22/23 route-owner contracts and the D15 canonicalizer become hard
  prerequisites; current `develop` cannot activate D77.
- Known external placements remain useful guidance but cannot make an honest
  move impossible or become route authority.
- A small owner-family inventory and complete ordinary route manifests require
  disciplined code review, CI census, capacity proof, and source-owner tests.

## Rejected alternatives and unsafe interpretations

- complete manual route-by-route disposition;
- strict loss of already owner-qualified continuity;
- destination-tree, same-path, same-slug, homepage, Default Site, or AI fallback;
- treating target absence as a durable not-found decision;
- a D77-specific adapter/plugin framework or one adapter per Page;
- mutable Payload/redirect-plugin, Next.js static redirect, Edge Config, or
  Vercel project redirect authority;
- Internet crawling, Search Console, analytics, backlinks, QR images, messages,
  exports, or logs as a completeness gate;
- raw regex, wildcard, prefix transform, arbitrary/external target, query/body/
  cookie carry, chain, or unsafe-method redirect;
- bulk approval, CSV shadow workflow, route migration wizard, task/assignment/
  approval workflow, or generic Content Health mutation; and
- claiming present runtime reuse before the D72–D76 and Phase 22/23 contracts are
  implemented and reconciled.

## References

- [ADR-0197 — Prepared same-Tenant Site Domain cutovers](./0197-prepared-same-tenant-site-domain-cutover.md)
- [Phase 24 D77 adversarial review](../prds/sitestacker-parity/phase-24-d77-critical-path-exception-led-domain-move-route-adversarial-review.md)
- [ADR-0199 — Owner-qualified exact ordinary Page succession](./0199-owner-qualified-exact-ordinary-page-succession.md)
- [Phase 24 D78 adversarial review](../prds/sitestacker-parity/phase-24-d78-owner-qualified-ordinary-page-successor-adversarial-review.md)
- [Phase 24 D9 — Retired-address disposition](../prds/sitestacker-parity/phase-24-d9-retired-address-disposition-adversarial-review.md)
- [Phase 24 D10 — Issued Giving Address reservation](../prds/sitestacker-parity/phase-24-d10-issued-giving-address-reservation-adversarial-review.md)
- [Phase 24 D15 — Site Locale public bases](../prds/sitestacker-parity/phase-24-d15-explicit-site-locale-public-base-adversarial-review.md)
- [Google — Site moves and URL mapping](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Google — `404`, `410`, and soft-404 guidance](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)
- [Vercel — Rewrites](https://vercel.com/docs/routing/rewrites)
- [Vercel — Redirect and rewrite security](https://vercel.com/kb/guide/enhancing-security-for-redirects-and-rewrites)
- [HubSpot — Create and manage URL redirects](https://knowledge.hubspot.com/domains-and-urls/create-and-manage-url-redirects)
- [Shopify — Creating and managing URL redirects](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect)
- [WordPress.com — Page and post links](https://wordpress.com/support/permalinks-and-slugs/)
- [OWASP — Unvalidated redirects and forwards](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)
- [RFC 9110 — HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL — Row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
