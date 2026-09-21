# ADR-0193: One Primary Site Domain with explicit Redirect Site Domains

**Status:** Accepted with required amendments (Phase 24 D72 — 2026-08-30)

## Context

Phase 24 lets a Tenant prove several custom hostnames for one Site. Provider
ownership, DNS, TLS, and project attachment do not answer which hostname is the
Site's public identity or whether another hostname may serve a second copy of
the same content. Current `develop` has only one optional mutable Payload Tenant
`primaryDomain`, a Tenant-level lookup using `overrideAccess: true`, slug-based
subdomain fallback, and `siteId: null`; it has no operational Site Domain
authority, redirect role, public-role command, or D72 UI. Phase 2's proposed
`primary_domain` plus `alias_domains[]` serving lookup is not implemented and is
not the permanent D72 model.

The founder selected one primary domain plus explicit redirect-only aliases.
That direction matches current Vercel guidance and the primary-domain patterns
used by Shopify, WordPress.com, and Squarespace. Google treats server redirects
as a strong canonicalization signal and recommends consistent canonicals,
internal links, sitemaps, and direct final destinations. The informal answer
still required correction: **alias** commonly means a second serving origin,
blanket provider redirects can bypass Core's route/Giving protections, and an
array cannot safely own per-domain lifecycle, uniqueness, proof, history, or
authorization.

## Decision

### Two exact public roles

A publicly activated, nonretired Site has exactly one current **Primary Site
Domain**, including while D7 temporarily suspends serving. It is a
Tenant-controlled, HTTPS, Core-admitted exact hostname that alone may serve the
Site's website content and supplies the authoritative public origin for newly
generated Site URLs. A private pre-activation Site may have no public-role domain
while staff prepare and verify candidates; retirement preserves history but
removes favorable public roles.

A Site may have zero or more current **Redirect Site Domains**. Its website role
never serves Site website content and never becomes another website origin. It
may send only a route-owner-qualified, navigation-safe request to the current
Primary Site Domain. Separately authorized source-owned routes may retain only
their own behavior and authority. Every public role is explicit; adding a domain, DNS propagation,
certificate issuance, Vercel verification, project assignment, or provider
default never activates or changes it.

Core does not use **alias domain** as the canonical product term. Hosting and
commerce platforms use that term for a hostname that continues serving content
in the browser. Phase 2's `alias_domains[]` wording and any provider “alias” are
migration/provider vocabulary only.

No publicly activated Tenant website exposes an `asymmetric.al`, `vercel.app`, or other
platform-branded primary or fallback. Provider deployment hosts remain private
preview/operations infrastructure. Vercel's `www`-primary recommendation may be
shown as source-labelled guidance, but Core supports a proved apex, `www`, or
other exact Tenant hostname and never chooses one automatically.

### Domain and route invariants

Each canonicalized custom hostname is bound to at most one current Core Tenant,
environment, Site, and role across the platform. A custom public hostname may be
active in at most one Core environment; previews use private nonpublic hosts.
Because current environments use isolated Supabase databases, V1 Tenant-
controlled public roles are production-only. A second environment cannot
activate one until a single platform-wide current-host claim authority exists;
Vercel assignment plus per-environment indexes are insufficient.
Core supports exact custom hostnames in D72. A custom wildcard domain requires a
separate decision and proof; the platform's own bounded tenant-subdomain
provisioning is private preview infrastructure and does not grant wildcard
Tenant authority or a public role.

The public resolver accepts only the hostname normalized by a proved platform
edge/proxy contract. A request-controlled `Host`, `Forwarded`, or
`X-Forwarded-Host` value cannot select a binding, Tenant, Site, primary, or
redirect target. Current forwarded-host parsing is migration evidence and must
pass spoofing/conformance proof before D72 activation.

Only the Primary Site Domain may return favorable Site content, canonical HTML,
localized pages, feeds, public assets with Site meaning, or a Site-owned success
response. Redirect Site Domains are not valid CORS origins, authentication or
protected-action origins, preview origins, callback/return origins, API origins,
cookie domains, service-worker scopes, or automatic Giving/checkout origins.
Adding a redirect role changes none of those independent allowlists or owners.
A separately authorized source-owned route—such as an already-issued Giving
address—may therefore retain its own exact behavior on the hostname before the
website redirect decision runs. That behavior comes from its owner, never D72.
D72 grants no eligibility for a new direct-only allocation; a route owner must
explicitly admit the exact hostname under its own contract or deny it.

A redirect destination is built only from trusted current Domain/Site/route
authority. Staff, CMS fields, request headers, query parameters, referrers,
providers, imports, or AI never supply an arbitrary destination. Redirects are
one hop to the current Primary Site Domain; chains, loops, rewrites, proxying,
frame embedding, or a fallback Site are prohibited.

The ordinary public route owner decides whether one exact request is eligible.
Only clean `GET`/`HEAD` navigation to a currently public, same-Tenant,
same-environment, same-Site, same-locale, same-resource/purpose target may
redirect. The normalized path is preserved only when the target route is proved
equivalent. Query handling is route-owned and allowlisted; Core never carries an
arbitrary query, body, cookie, authorization header, return target, fragment, or
client state as authority. Missing, retired, withdrawn, restricted, malformed,
or unproved routes use their existing privacy-safe `404` or authority-failure
`503`; on a Redirect Site Domain those responses are tiny platform-neutral and
contain no Tenant content/branding. They never collapse to the primary homepage.

The route owner resolves the final destination before emitting `Location`.
Redirect-domain `/` therefore composes D16 and points directly to the current
explicit Default Site Locale homepage rather than chaining through primary `/`.
The response includes the owner-approved explicit empty fragment form and must
pass real-browser fragment-inheritance proof; the server cannot inspect an
incoming fragment.

D9–D15 remain stronger for Giving and issued addresses. A Site-domain role never
redirects, reissues, reinterprets, or transfers Giving, checkout, amount,
Designation, currency, cadence, Source Code, provider, callback, return, or donor
intent. A Giving-owned address may move only through its own already-accepted
exact rules; a generic provider-level all-path redirect cannot bypass them.
Core therefore prohibits Vercel's whole-domain redirect setting for D72 Site
domains. Redirect execution belongs in the trusted route-aware host admission
seam before content/cache. Provider attachment remains evidence and transport.
Provider-owned certificate/domain validation paths, including applicable
`/.well-known` traffic, retain provider precedence and are never Site redirects.

Redirect status and cache policy follow the accepted route lifecycle. ADR-0194/
D73 requires owner-approved `308` plus `no-store` only for a stable equivalent
website resource; the mutable former-domain root composes D16 and remains `307`
plus `no-store`. Both use the approved explicit empty-fragment final destination
and `no-referrer`. Core never assumes a browser-cached historical redirect can
be recalled, and incompatible redirect/cache history blocks Primary promotion.

### One primary-origin closure

New internal links, canonical metadata, reciprocal `hreflang`, sitemap entries,
Open Graph and sharing URLs, feeds, QR/share outputs, public-generation keys, and
Site URL previews derive from the exact current Primary Site Domain and its
generation. Redirect Site Domains emit no duplicate content and appear in none
of those favorable inventories.

Primary responses self-canonicalize. Search indexing and recrawl are external
observations, not activation completion or Core authority. Domain role changes
do not rewrite immutable historical documents, messages, receipts, gifts,
attribution, audit, or already-issued URL evidence; their owners decide whether
to issue successors.

### Source of truth and logical data shape

The operational Domain authority owns hostname identity, canonicalization,
current Site binding, role, lifecycle, expected head, immutable history,
authorization receipts, and provider-evidence references. Site owns public
presentation context. Route owners own path meaning and redirect eligibility.
Vercel owns observed project/domain/DNS/TLS facts; DNS operators and certificate
authorities own their external facts. Edge Config or another admission adapter is
an adverse-first, rebuildable projection. CMS may display the effective origin
and author relative content paths but never owns or writes public domain roles.

D72 requires a relational repeated-facet authority, not `primary_domain` plus an
`alias_domains[]` serving array and not the current CMS Tenant field. Exact table,
column, enum, and event names remain implementation-design choices, but these
logical constraints are mandatory:

- one canonical ASCII host identity with versioned WHATWG/IDNA-compatible
  normalization and a safe Unicode display form;
- platform-wide uniqueness for a current custom hostname and complete
  Tenant/environment/Site structural relationships;
- at most one current primary per Site and exactly one for every publicly
  activated, nonretired Site, including while serving is suspended;
- an immutable complete Site-domain role generation containing one non-null
  primary binding plus its redirect membership, selected by one current head,
  so exactly-one cardinality does not depend on counting mutable rows;
- a finite role/lifecycle vocabulary that cannot represent serving aliases;
- restrictive deletion and immutable role/binding history after public use;
- expected-head/CAS transitions, semantic idempotency, audit attribution, and a
  durable business receipt;
- indexes for canonical-host lookup, current Site roles, and reconciliation
  work—never array scans or per-request provider calls.

Browser roles receive no direct domain-role mutation. Minimum grants, RLS, and
command boundaries must derive actor, Tenant, environment, Site, capability,
role, and audit attribution from trusted server context. `SELECT`/`DELETE` use
correct `USING`; `INSERT` uses `WITH CHECK`; `UPDATE` uses both so an allowed row
cannot move to another Tenant/Site/environment or forbidden role. Applicable
Tenant-bearing domain tables enable and FORCE RLS. Any platform-global occupancy
authority stays private/no-Data-API and cannot weaken Tenant policies. Service/owner,
`SECURITY DEFINER`, worker, Payload, import, support, and AI paths must pass the
same structural and capability checks rather than treating an RLS bypass as
authority.

Reading safe domain status follows current Site visibility. Preparing a domain
requires a Site-scoped domain-management capability. Activating, deactivating,
or changing a Primary/Redirect public role is a separately protected public-
origin effect and requires a current human capability or accepted equivalent;
provider access and DNS control grant neither. Exact capability registry names
remain Phase 12/design-owned.

### Lifecycle, provider convergence, and failure

Provider API calls never run inside the authoritative database transaction.
Commands use expected state, one durable semantic identity, receipt/audit, and an
outbox or accepted durable-work boundary. Provider retries coalesce, honor live
rate-limit/reset evidence and `429` backoff, and reconcile ambiguous responses.
Provider state may prove readiness or require attention; it never creates the
favorable Core role.

Favorable activation requires current ownership, exact project assignment, DNS,
TLS, Domain/Site/route authority, and compatible successor Public Site
Generations for the primary-origin/canonical/locale/sitemap closure. Unknown
or conflicting proof cannot activate. Adverse removal, transfer, safety response,
or loss of authority fences Core admission first and acknowledges that fence
before provider detachment, so stale provider state cannot keep serving another
Tenant. A Redirect Site Domain failure affects only that redirect; it cannot
change the primary or select a fallback. A primary failure never silently
promotes a redirect domain.

A primary-domain change is a high-consequence successor transition, not a field
edit. It must never create zero or two current primaries or mix origin generations.
ADR-0194/D73 requires one initially unselected former-primary website disposition
for every exact successor: retain the former hostname as a Redirect Site Domain
or stop its Site website role. It does not alter independently source-owned
routes or detach/release the hostname.

ADR-0195/D74 governs later disconnection. One exact Tenant-controlled custom
hostname may disconnect only after the finite owner registry proves no current
positive hosting dependency. A short CAS transaction first establishes a
monotonic Disconnecting barrier and acknowledged adverse host fence; provider
removal/readback occurs outside the transaction; only proved absence of every
applicable Core-controlled routing association permits a final transaction to
end the current Site-binding interval and global occupancy claim. Host identity,
history, and D9–D15 reservations survive. D74 never cascades across apex/`www`/
wildcards or changes DNS, registration, email, Vercel account ownership, or
another Site.

ADR-0196/D75 governs later clean-start reuse. Every Tenant uses the same
ordinary Add domain path only after one Core-issued, exact-host, seven-day,
single-use DNS-control challenge succeeds. An unproved attempt reserves nothing
and triggers no provider call. One transaction consumes proof, proves D74 final
and no current claim, acquires the global claim, and creates a new private
binding generation. Former positive state never follows; immutable host history
and D9–D15 adverse reservations do. Provider preparation and public activation
remain later independent gates.

ADR-0197/D76 governs an exact hostname that remains connected while moving
between two Sites in the same Tenant. It neither releases/reclaims occupancy nor
updates the old binding. Both Site outcomes and explicit destination role are
prepared, an adverse Moving generation is acknowledged, and one immutable
successor advances the global host plus source/destination role/public heads.
Launch is a provider no-op on Core's one donor project; route owners and D9–D15
remain stronger than the destination website role.

ADR-0198/D77 supplies the exact bounded route-readiness input for that move. It
reuses the same small critical owner-family registry and compares complete
immutable effective-host manifests. Source-only ordinary addresses compile
durable not-found effects, target-only routes retain their owner effect, exact
collisions require owner action, and only an already qualified successor may
continue. The comparison is derived proof and creates no route owner, resolver,
redirect table, workflow, crawler, pattern rule, or provider effect.

ADR-0199/D78 adds no exception to the one-Primary rule. An eligible different
General Page successor is one Page-owner qualification for one exact historical
address. When the moved hostname is the target Primary and paths agree, the
target Page may serve directly. A Redirect Site Domain remains redirect-only
and composes one direct final owner-qualified result to the target Primary; it
never serves duplicate Page bytes. Staff cannot choose status, host, or target
URL, and D78 writes no Vercel/project redirect.

### Staff and visitor experience

Mission Control/Web Studio uses one **Site → Domains** workspace, not a provider
dashboard or matrix. The Site name remains visible. The current primary appears
first as **Primary website address**, with D7 serving state shown separately,
followed by **Redirect domains** and **Not used for website** or setup rows.
**Not public** is reserved for complete current owner proof that no favorable
Core public route remains. Plain states include **Needs DNS**, **Securing
domain**, **Ready to activate**, **Redirects website visits**, and **Needs
attention**. A D74-eligible row says **Not public · Connected for hosting** and
offers **Disconnect from this Site**; durable later states are **Disconnecting**,
**Not public · Disconnection needs attention**, and **Disconnected**. Staff see one
truthful next action, exact DNS instructions when needed, last checked time and
timezone, and source-labelled provider evidence without Vercel IDs, raw errors,
rate constants, canonical-tag controls, or routing rules.

**Add domain** uses one route-addressable, resumable Base Maia record detail.
Staff enter the hostname once, then **Verify domain control** shows the exact TXT
Type/Name/Value, accessible copy actions, absolute expiry and last-checked time,
bounded automatic checks, and one coalesced **Check again**. D75 success is
**Domain verified · Not public**. The UI never says ownership was proved,
reveals former Tenant/history, or restores/publishes prior state.

The row's public label is **Redirects website visits** so staff are not promised
that every route moves. When an independently authorized route remains on that
hostname, Core shows a bounded owner-derived exception such as **Existing Giving
links keep their current address** and links to its owner. A numeric count appears
only from a complete authorized inventory; D72 creates no cross-domain route
scanner.

Adding an apex may suggest also proving `www`, and adding `www` may suggest the
apex, but neither is silently created, activated, or made primary. Role controls
remain unavailable until current proof permits them. The primary-change review
shows current and proposed origins and the affected public surfaces. IDNs display
the readable Unicode hostname plus canonical ASCII form when they differ, use
bidirectional isolation and an LTR technical value, and never rely on lookalike
glyphs alone.

Visitors receive a direct one-hop redirect for an eligible ordinary public
request, with no interstitial, platform branding, content flash, application
cookie, or second content origin. Invalid or ineligible requests keep their
owner's honest non-success behavior. The journey must work with JavaScript off,
weak networks, assistive technology, long/IDN/RTL context, and small screens.
Redirect roles do not authorize broader `Domain` cookies, HSTS
`includeSubDomains`/preload, CORS, CSP, auth, or callback scope; those remain
separately proved origin/security policies.

### Performance, rollout, and proof

Host resolution and redirect decisions consume one bounded admission lookup and
no request-time database scan or provider call. They remain inside Phase 5's
launch p99 projection-read budget of 15 ms, pending capacity evidence rather than
treated as a verified current measurement. Cache keys include normalized host,
binding/role generation, Site, environment, primary generation, route owner, and
public generation; tags invalidate only. Redirect responses never reuse a
content cache entry or viewer/session cache.

Rollout is reader/adverse-first: land exact-host normalization, negative routing,
relational readers, uniqueness/role constraints, and the admission projection;
inventory every current CMS/Phase 2 host; migrate only proved unambiguous current
bindings as nonpublic candidates; then enable protected writers and public roles
by cohort. No `primaryDomain`, `primary_domain`, `alias_domains[]`, slug fallback,
DNS observation, or current provider assignment is inferred into favorable D72
authority. Rollback disables new writers and favors safe absence while preserving
binding/history readers and every public-address protection.

## Consequences

- Tenant Sites have one unmistakable public identity while useful alternate and
  legacy domains can keep eligible links working.
- Duplicate serving origins, canonical drift, cross-host cookies, and another
  public resolver are structurally avoided.
- Route-aware redirects are slightly more work than a blanket Vercel domain
  redirect, but preserve Core's privacy, Giving, locale, and ownership rules.
- Per-domain relational lifecycle replaces Phase 2's simpler array proposal; this
  is necessary domain truth, not a generic routing engine.
- ADR-0194/D73 requires the explicit former-primary website disposition and
  generation-safe cutover before primary-change UX or implementation tickets
  are complete.
- ADR-0195/D74 permits only owner-cleared, adverse-first, readback-confirmed
  Tenant self-service disconnection and retains history/reservations.
- ADR-0196/D75 permits every Tenant to create a fresh private binding only after
  Core-owned DNS proof and atomic global claim, with no positive inheritance.
- ADR-0197/D76 permits a prepared same-Tenant Site successor without destructive
  disconnect/reclaim, routine DNS reproof, mutable history, or provider movement.

## Rejected alternatives

- **Several serving domains plus canonical metadata:** leaves duplicate origins,
  cookies, caches, analytics, security headers, and search interpretation live.
- **Only apex/`www`:** safe but needlessly prevents proved legacy, campaign, or
  misspelling domains from preserving ordinary public navigation.
- **Provider-owned primary or automatic activation:** lets external timing create
  Core public meaning and conflicts with D6.
- **Blanket all-path provider redirect:** bypasses D9–D15 and route-owner policy.
- **One Next.js/Vercel rule per domain/path:** inherits platform limits, requires
  N updates on a primary change, and creates stale chains instead of consuming
  the one current host projection.
- **Mutable primary field plus alias array:** cannot safely own uniqueness,
  per-domain proof, concurrency, history, or RLS relationships.

## References

- [Phase 24 D72 adversarial review](../prds/sitestacker-parity/phase-24-d72-primary-and-redirect-site-domains-adversarial-review.md)
- [ADR-0194 — Explicit former-primary website disposition](./0194-explicit-former-primary-website-disposition.md)
- [Phase 24 D73 adversarial review](../prds/sitestacker-parity/phase-24-d73-explicit-former-primary-disposition-adversarial-review.md)
- [ADR-0195 — Owner-cleared Tenant domain disconnection](./0195-owner-cleared-tenant-domain-disconnection.md)
- [Phase 24 D74 adversarial review](../prds/sitestacker-parity/phase-24-d74-owner-cleared-domain-disconnection-adversarial-review.md)
- [ADR-0196 — Fresh-proof clean-start Site domain claims](./0196-fresh-proof-clean-start-site-domain-claims.md)
- [Phase 24 D75 adversarial review](../prds/sitestacker-parity/phase-24-d75-fresh-proof-clean-start-domain-claim-adversarial-review.md)
- [ADR-0197 — Prepared same-Tenant Site Domain cutovers](./0197-prepared-same-tenant-site-domain-cutover.md)
- [Phase 24 D76 adversarial review](../prds/sitestacker-parity/phase-24-d76-prepared-same-tenant-site-domain-cutover-adversarial-review.md)
- [ADR-0198 — Critical-path-gated Domain move route review](./0198-critical-path-gated-exception-led-domain-move-route-review.md)
- [Phase 24 D77 adversarial review](../prds/sitestacker-parity/phase-24-d77-critical-path-exception-led-domain-move-route-adversarial-review.md)
- [ADR-0199 — Owner-qualified exact ordinary Page succession](./0199-owner-qualified-exact-ordinary-page-succession.md)
- [Phase 24 D78 adversarial review](../prds/sitestacker-parity/phase-24-d78-owner-qualified-ordinary-page-successor-adversarial-review.md)
- [Vercel — Deploying and redirecting domains](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting)
- [Vercel — Domain troubleshooting and reserved `/.well-known`](https://vercel.com/docs/domains/troubleshooting)
- [Vercel REST API and rate-limit headers](https://vercel.com/docs/rest-api)
- [Google — Canonicalization methods](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google — Site moves and redirects](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Shopify — Primary, alias, and redirect domain types](https://help.shopify.com/en/manual/domains/domain-type)
- [WordPress.com — Primary address and redirected domains](https://wordpress.com/support/domains/set-a-primary-address/)
- [Squarespace — Primary domain](https://support.squarespace.com/hc/en-us/articles/205812368-Setting-a-primary-domain)
- [WHATWG URL Standard](https://url.spec.whatwg.org/)
- [RFC 9110 — HTTP semantics and redirects](https://www.rfc-editor.org/rfc/rfc9110.html)
- [OWASP — Unvalidated redirects and forwards](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL — Row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
