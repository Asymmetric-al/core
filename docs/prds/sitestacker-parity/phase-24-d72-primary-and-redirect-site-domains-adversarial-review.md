# Phase 24 D72 — Primary and Redirect Site Domains adversarial review

**Date:** 2026-08-30  
**Founder answer reviewed:** Option 1 — one primary domain plus explicit
redirect-only aliases, conditioned on current modern best practice.  
**Final disposition:** **Accept with required amendments.**  
**Recorded decision:** [ADR-0193](../../adr/0193-one-primary-site-domain-with-redirect-site-domains.md)

## Executive verdict

The selected architecture is current, proven practice. Vercel recommends a
primary hostname with the alternate apex/`www` hostname redirected to it.
Shopify, WordPress.com, and Squarespace all expose one primary address and
redirect other connected domains; Shopify explicitly distinguishes a serving
**alias** from a **redirect**. Google ranks server redirects above sitemap hints
as a canonicalization signal and recommends direct final destinations, aligned
canonicals/internal links/sitemaps, and long-lived redirects for real moves.

The founder answer is accepted only after replacing informal **alias** language
with **Redirect Site Domain** and rejecting blanket provider redirects. Core's
D9–D15 contracts prohibit generic transfer of retired, Giving, checkout, or
donor intent. A Redirect Site Domain therefore redirects only current,
route-owner-qualified public `GET`/`HEAD` navigation. Its website role never
serves Site website content or becomes an auth, callback, API, cookie, preview,
Giving, or protected-action authority. A separately authorized source-owned
route may retain only its owner's direct behavior.

The review also rejects Phase 2's proposed `alias_domains[]` as the permanent
data shape. Per-domain verification, role, lifecycle, platform-wide uniqueness,
history, provider convergence, and authorization require a relational repeated
facet. This is the smallest complete permanent model, not a configurable routing
engine.

## Current behavior, intended behavior, and permanent path

| Layer                  | Verified current/repository state                                                                                                                                    | D72 intended behavior                                                                                                 | Permanent path                                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public host resolution | `resolveTenantFromRequest` reads `x-forwarded-host`/`host`, queries mutable Payload Tenant `primaryDomain` with `overrideAccess: true`, then tries a slug subdomain. | Exact trusted host resolves one Site-domain role or fails closed.                                                     | Operational Domain authority plus bounded admission projection; no CMS/domain string authority.                                                            |
| Site context           | `PublicRequestContext.siteId` is explicitly `null`; no current Site-domain runtime exists.                                                                           | Every domain role binds exact Tenant/environment/Site.                                                                | Land Phase 2/5 Site identity and D72 readers before public writers.                                                                                        |
| Physical data          | Current CMS has one nullable nonunique Tenant `primary_domain`; proposed Phase 2 names `primary_domain` and `alias_domains[]`.                                       | One retained Primary Site Domain for every publicly activated nonretired Site and zero or more Redirect Site Domains. | Relational domain-binding authority with exact constraints/history; CMS fields and arrays become migration evidence only.                                  |
| Canonical output       | Shared SEO helpers and donor root metadata derive absolute URLs from one global `siteConfig.url`.                                                                    | New favorable output pins one exact Primary generation.                                                               | Replace global/request-host inference with compatible D1/D66 origin-generation inputs.                                                                     |
| Runtime redirects      | Donor `next.config.ts` contains host-blind static `/home`, `/missionaries`, `/donate`, and `/give` redirects.                                                        | Registered route owners run before D72 website redirect.                                                              | Remove/fence conflicting static behavior before the typed host/router projection activates.                                                                |
| Provider               | Vercel can automatically apply an attached domain to production and can configure whole-domain redirects.                                                            | Provider facts prove readiness but never create public meaning.                                                       | Adapter/outbox/reconciliation; Core activation and route policy remain authoritative.                                                                      |
| Public URLs            | Phase 5 requires a canonical domain; D15 requires exact locale bases; current public surfaces are not D72-aware.                                                     | All favorable generated URLs derive from one Primary Site Domain.                                                     | One origin generation pinned into the applicable Public Site Generation.                                                                                   |
| Redirects              | D9 permits only exact navigation-safe redirects and D10–D15 prohibit automatic Giving-intent movement.                                                               | Redirect domains forward only route-owner-qualified ordinary navigation.                                              | Host/router projection decides before content; Vercel whole-domain redirects are prohibited because present and future source-owned routes must run first. |
| Staff UX               | No Site-domain workspace exists.                                                                                                                                     | One compact Site → Domains workspace with plain role/readiness states.                                                | Base Maia vertical list, current evidence, one truthful action, no provider dashboard or domain matrix.                                                    |
| Formal authority       | Active OpenSpec records host-only fail-closed Tenant resolution but no D72 roles; Phase 23 PR #1340 was verified `OPEN/BLOCKED` on 2026-08-30.                       | D72 remains groomed docs intent.                                                                                      | Consolidate Phase 24 OpenSpec and reconcile Phase 23 before design/tickets/runtime work.                                                                   |

### Verified repository facts

- [Current resolver](../../../apps/admin/src/cms/public/resolve-tenant.ts) reads
  forwarded/request host, queries Payload Tenant `primaryDomain` with
  `overrideAccess: true`, tries the first hostname label as Tenant slug, and
  cannot return a Site role.
- [Public request context](../../../packages/api/src/cms/public/context.ts) keeps
  `siteId: null` until Phase 2/5 host→Site→Tenant work lands.
- [Payload Tenant collection](../../../apps/admin/src/cms/collections/tenants.ts)
  defines `primaryDomain` as optional text without the D72 uniqueness, Site,
  role, history, or lifecycle contract.
- [Shared SEO metadata](../../../packages/lib/seo/metadata.ts) uses global
  `siteConfig.url`; it has no Primary Site Domain generation input.
- [Donor Next config](../../../apps/donor/next.config.ts) contains host-blind
  static redirects, including `/give` and `/donate`, that cannot govern D72.
- The installed Next.js redirect guide documents Vercel's 1,024 static-redirect
  limit, reinforcing one indexed host/router projection rather than per-domain/
  path rules.
- `origin/develop` and this branch both resolved to
  `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` after a live fetch on 2026-08-30.
  Phase 23 PR #1340 remained open and blocked.

## Verified primary external evidence

| Source                                                                                                                        | Verified current practice                                                                                                                                                 | D72 use                                                                                        | Boundary retained                                                           |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [Vercel domain deployment and redirects](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting)      | Attached domains apply to production; Vercel recommends `www` as primary with apex redirect but supports either.                                                          | Confirms provider capability and optional `www` guidance.                                      | Automatic provider behavior is not Core activation authority.               |
| [Vercel domain troubleshooting](https://vercel.com/docs/domains/troubleshooting)                                              | DNS and certificate convergence are asynchronous; `/.well-known` is provider-reserved and cannot be redirected or rewritten on the standard service.                      | Keeps certificate validation ahead of Core website redirection.                                | Vercel transport behavior never grants a Core route role.                   |
| [Vercel REST API](https://vercel.com/docs/rest-api)                                                                           | Rate limits are returned in limit/remaining/reset headers.                                                                                                                | Queue/coalesce/reconcile provider work without a fixed roadmap constant.                       | Provider rate state never becomes Site truth.                               |
| [Google canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)             | Redirects and canonical annotations are strong signals; sitemaps are weaker; signals should agree.                                                                        | One primary origin and no duplicate-serving domain.                                            | Search choice is external observation, not authorization.                   |
| [Google site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)                   | Use server-side permanent redirects for real moves, map equivalent URLs, avoid chains, target the final URL, update links/sitemaps, and retain redirects at least a year. | One-hop equivalent redirect and D73 cutover proof.                                             | No homepage mass redirect or route-owner bypass.                            |
| [Shopify domain types](https://help.shopify.com/en/manual/domains/domain-type)                                                | Each target has one primary and may have alias and redirect domains; alias serves, redirect changes the browser origin.                                                   | Proves the terminology distinction and mature role pattern.                                    | Core deliberately omits serving aliases.                                    |
| [WordPress.com primary address](https://wordpress.com/support/domains/set-a-primary-address/)                                 | One primary address; other attached domains redirect to it; different content requires another Site.                                                                      | Supports the staff mental model.                                                               | WordPress storage/auth does not govern Core.                                |
| [Squarespace primary domain](https://support.squarespace.com/hc/en-us/articles/205812368-Setting-a-primary-domain)            | One primary; secondary custom domains redirect.                                                                                                                           | Confirms mainstream CMS convention.                                                            | Its root-only 301 behavior is not copied into Core.                         |
| [WHATWG URL Standard](https://url.spec.whatwg.org/)                                                                           | Defines idempotent URL/host parsing, serialization, IDNA processing, and host equivalence.                                                                                | Versioned canonical hostname identity and IDN proof.                                           | Core still owns business uniqueness and display safety.                     |
| [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)                                                                       | Defines `301`/`308` permanence and method/caching semantics.                                                                                                              | Prevents a vague “redirect” contract.                                                          | ADR-0194/D73 now owns route-specific former-primary status/cache semantics. |
| [OWASP redirect guidance](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) | Server mapping/allowlists are preferred over caller-provided destinations.                                                                                                | Trusted same-Site destination construction.                                                    | No arbitrary return URL or open redirect.                                   |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)                                         | Grants and policies are separate; insert uses `WITH CHECK`; update needs `USING` and `WITH CHECK`; service roles bypass RLS.                                              | Complete mutation and privileged-path requirements.                                            | RLS is defense in depth, not public-role authority.                         |
| [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)                                       | Policies are command-specific; owners normally bypass RLS unless forced; referential checks bypass RLS and may disclose conflicts.                                        | Requires FORCE RLS where applicable, privileged parity, and non-enumerating conflict handling. | Constraints still own integrity.                                            |
| [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)                                        | `NOT NULL`, check, unique, primary-key, and foreign-key constraints reject invalid rows independently of application convention.                                          | Structural hostname, scope, role, and relationship invariants.                                 | Exact physical design remains design-owned.                                 |

## Reasonable inferences, product judgments, assumptions, and unknowns

### Reasonable inferences

- Missions organizations may retain campaign, spelling, apex/`www`, or former
  brand domains. This is plausible but frequency is unmeasured; D72 therefore
  permits redirect domains without mandating one.
- One primary address reduces visitor uncertainty and operational drift. No
  conversion or fundraising-uplift claim is made.
- Sensitive ministries may need to stop the Site website relationship during a
  later primary change; ADR-0194/D73 therefore requires explicit disposition
  instead of D72 silently forcing continuity, without promising external erasure.

### Product judgments

- **Primary Site Domain** and **Redirect Site Domain** are canonical terms;
  staff-facing Redirect rows say **Redirects website visits**.
- Redirect domains are useful public-entry continuity, not second Sites,
  serving aliases, domain forwarding to arbitrary URLs, or a redirect builder.
- The Site workspace should recommend rather than automatically choose `www`.
- Route-aware Core admission is required even if a provider offers a simpler
  whole-domain redirect.

### Assumptions and unresolved evidence

- The maximum number of domains per Site/Tenant and the real onboarding volume
  are unmeasured. D72 freezes no product cap; design must prove a governed bound
  and current plan/endpoint limits before activation.
- The exact operational table/event schema and provider adapter remain design-
  owned. Phase 12 registers `sites.manage_domains`, `sites.activate_domains`,
  and D74's `sites.disconnect_domains`; ADR-0194/D73 fixes the route-specific
  status/cache outcomes and former-primary disposition.
- ADR-0195/D74 now governs the later owner-cleared, adverse-first, provider-
  readback-confirmed self-service disconnection; D72 role removal alone never
  detaches or releases the hostname.
- ADR-0196/D75 now governs post-release reuse: a private nonreserving attempt,
  Core-owned exact-host DNS proof, atomic global claim, new binding generation,
  no positive inheritance, and retained D9–D15 adverse reservations.
- Representative ministry staff must validate terms, setup instructions,
  primary-versus-redirect comprehension, IDN display, and high-consequence
  change-primary review.

## Ruthless category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.** **What could go wrong:** without one public origin,
staff and visitors cannot know which domain is authoritative; duplicate domains
split links, analytics, canonical signals, cookies, and support. Restricting Core
to only apex/`www` would strand legitimate legacy domains, while several serving
domains retains the root problem. **Why it matters:** a ministry's public identity
and donor trust depend on a stable recognizable address. **Severity: High.
Likelihood: High. Evidence/reasoning:** Vercel, Shopify, WordPress.com,
Squarespace, and Google independently converge on a primary-plus-redirect model.
**Decision effect:** validates Option 1 but renames roles and narrows redirect
scope. **Permanent fix:** exactly one primary for every publicly activated,
nonretired Site—including during serving suspension—and optional explicit
redirect domains. **Exact spec language:** D72-R1–R6; AC1–AC8.

### 2. Brittleness

**Material concern: Yes.** **What could go wrong:** a mutable `primaryDomain`,
array membership, DNS observation, or Vercel project state can drift, race, or
silently change public meaning. **Why it matters:** one provider update or stale
cache could serve the wrong Site or create two primaries. **Severity: Critical.
Likelihood: High. Evidence/reasoning:** current code has one CMS string and
Phase 2 proposes an array, while provider attachment automatically applies a
domain to production. **Decision effect:** rejects those as permanent authority.
**Permanent fix:** relational bindings, expected heads, one role vocabulary, and
an adverse-first projection. **Exact spec language:** D72-R2, R7, R10–R12,
R16–R18; AC4–AC12, AC27–AC34, AC38–AC40.

### 3. Technical debt

**Material concern: Yes.** **What could go wrong:** storing aliases in arrays,
duplicating domain logic in CMS/Vercel/Next.js, or adding a generic redirect rules
engine creates several write authorities and expensive migrations. **Why it
matters:** every new Site, domain, provider, and route family would need synchronized
special cases. **Severity: High. Likelihood: High. Evidence/reasoning:** Phase 2's
proposed resolution order and current CMS lookup already encode incompatible
serving assumptions. **Decision effect:** narrows implementation to one Domain
authority and one bounded host/router projection. **Permanent fix:** relational
domain facets and code-owned roles; no tenant routing DSL. **Exact spec language:**
D72-R1, R4–R7, R16–R18; AC3–AC8, AC20–AC23, AC35–AC40.

### 4. Edge cases

**Material concern: Yes.** **What could go wrong:** zero domains on a private
Site, apex/`www`, IDNs, trailing dots/case, expired TLS, transferred ownership,
same host in two environments, redirect-only locales, missing paths, root/control
routes, old service workers, or primary loss can produce ambiguous behavior.
**Why it matters:** these are normal Internet conditions, not exotic attacks.
**Severity: Critical. Likelihood: High. Evidence/reasoning:** current resolver
normalizes only a subset and D9–D15 already prove address/path ambiguity is
dangerous. **Decision effect:** adds exact normalization, role/state matrices,
route exclusions, and no automatic fallback. **Permanent fix:** exhaustively test
every host/role/lifecycle/route combination. **Exact spec language:** D72-R1–R6,
R10–R18; AC1–AC26, AC32–AC40.

### 5. Footguns

**Material concern: Yes.** **What could go wrong:** “alias” can imply serving;
the first domain might silently become primary; a blanket redirect may move a
Giving URL; staff may paste a destination; `www` may activate automatically; or a
permanent cached redirect may outlive its target. **Why it matters:** each mistake
can be public, sticky, and difficult to reverse. **Severity: Critical. Likelihood:
High. Evidence/reasoning:** platform terminology differs, Squarespace auto-selects
the first custom domain, and HTTP permanent redirects are cacheable. **Decision
effect:** replaces implicit defaults with explicit roles and protected commands.
**Permanent fix:** no serving aliases, no arbitrary targets, no auto-primary, and
D73-governed cache/cutover semantics. **Exact spec language:** D72-R1, R3, R5–R6,
R9–R15; AC2–AC8, AC13–AC26, AC31–AC37.

### 6. Tenant safety

**Material concern: Yes.** **What could go wrong:** a hostname, provider record,
cache key, or role update may bind to another Tenant/Site/environment or reveal a
sensitive ministry relationship. **Why it matters:** a wrong-host response is a
cross-Tenant public data breach. **Severity: Critical. Likelihood: Medium-high.
Evidence/reasoning:** current lookup uses a nonunique CMS field with
`overrideAccess: true`; public host uniqueness is only proposed. **Decision
effect:** makes domain scope and platform-wide uniqueness structural. **Permanent
fix:** complete keys/FKs, non-enumerating errors, trusted host admission, and
hostile cross-scope tests. **Exact spec language:** D72-R2–R3, R7–R12, R15–R18;
AC7–AC12, AC24–AC34, AC38–AC40.

### 7. Database, RLS, and authorization safety

**Material concern: Yes.** **What could go wrong:** array elements evade global
uniqueness/FKs; caller-controlled Tenant/Site/role fields can move a permitted row
into a forbidden scope; grants, views, functions, or service roles can bypass UI
and RLS. **Why it matters:** domain binding is a public authorization boundary.
**Severity: Critical. Likelihood: High. Evidence/reasoning:** PostgreSQL needs
separate constraints/partial uniqueness and Supabase confirms grants, `USING`,
`WITH CHECK`, views, and bypass roles require independent treatment. **Decision
effect:** rejects the array/string target and direct browser mutation.
**Permanent fix:** relational same-scope integrity, current-primary uniqueness,
minimum grants, correct per-operation policies, FORCE RLS where applicable, and
privileged poison tests. **Exact spec language:** D72-R2, R7–R10, R16–R18;
AC7–AC12, AC27–AC31, AC38–AC40.

### 8. Overengineering

**Material concern: Yes.** **What could go wrong:** D72 could grow into arbitrary
forwarding, wildcard rules, schedules, weighted routing, geographic selection,
per-page domains, provider dashboards, approvals, or a generic domain workflow.
**Why it matters:** staff need two understandable roles, not an infrastructure
console. **Severity: High. Likelihood: High. Evidence/reasoning:** providers expose
many capabilities and “alias” invites broader serving behavior. **Decision
effect:** explicitly rejects them. **Permanent fix:** exact host bindings, two
public roles, source-owned route eligibility, and one action per state. **Exact
spec language:** D72-R1, R4–R6, R9, R13–R18; AC1–AC6, AC13–AC26, AC35–AC40.

### 9. UX/UI and user friction

**Material concern: Yes.** **What could go wrong:** provider jargon, a domain
matrix, hidden primary status, unclear DNS/TLS waiting, auto-selected `www`, raw
punycode, or vague “connected” states can cause the wrong public action. **Why it
matters:** ministry staff may manage domains rarely and need consequence-led
clarity. **Severity: High. Likelihood: High. Evidence/reasoning:** comparable CMS
products use a primary label and list, while current Core has no Site-domain UX.
**Decision effect:** adds a compact Site-scoped list and explicit role/state copy.
**Permanent fix:** Primary first, Redirect/Not used for website sections, current evidence,
one next action, IDN dual display, responsive accessible confirmation. **Exact
spec language:** D72-R1, R3, R9, R13–R15, R18; AC1–AC6, AC32–AC37, AC40.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.** **What could go wrong:** Operational Postgres, Payload,
Vercel, DNS, Edge Config, canonical metadata, and UI may each claim the primary.
**Why it matters:** dual ownership can serve content under the wrong origin even
when each subsystem is internally “green.” **Severity: Critical. Likelihood:
High. Evidence/reasoning:** current/proposed sources already disagree, and Vercel
attachment has automatic effects. **Decision effect:** creates an explicit owner
map and closed invariants. **Permanent fix:** Domain authority owns binding/role;
providers own evidence; Edge is projection; CMS/search derive only. **Exact spec
language:** D72-R1–R8, R10–R12, R16–R18; AC1–AC12, AC20–AC31, AC38–AC40.

### 11. Hidden coupling

**Material concern: Yes.** **What could go wrong:** a provider whole-domain
redirect can bypass route owners; canonical URLs may derive from request headers;
auth/CORS/cookies may treat every Site domain as trusted; Giving may inherit a
web redirect. **Why it matters:** an apparently local domain setting changes
security, finance, and SEO behavior. **Severity: Critical. Likelihood: High.
Evidence/reasoning:** D9–D15 explicitly forbid blanket Giving movement and the
current resolver reads forwarded-host data. **Decision effect:** narrows roles to
route-aware public navigation and independent allowlists. **Permanent fix:** one
typed host/router boundary, spoof-proof trusted-edge hostname contract, owner
registry, and negative route tests. **Exact
spec language:** D72-R3–R6, R8, R10–R12, R17–R18; AC13–AC26, AC29–AC31,
AC38–AC40.

### 12. Failure modes

**Material concern: Yes.** **What could go wrong:** DNS/TLS/provider/Core may
partially succeed, provider responses may be lost, projection may lag, a redirect
may fail while the primary works, or primary proof may become unknown. **Why it
matters:** a public site can disappear, leak, loop, or falsely report success.
**Severity: Critical. Likelihood: Medium-high. Evidence/reasoning:** external
systems cannot participate in one database transaction and Vercel APIs are
rate-limited. **Decision effect:** requires explicit convergence and safe local
failure. **Permanent fix:** receipt/outbox/reconciliation, favorable proof gate,
adverse-first fencing, localized redirect failure, and no fallback promotion.
**Exact spec language:** D72-R3, R10–R12, R15–R18; AC5–AC8, AC24–AC34,
AC38–AC40.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.** **What could go wrong:** two admins may activate two
primaries, a hostname may transfer while proof is cached, repeated provider work
may duplicate, or a stale primary change may demote/promote the wrong binding.
**Why it matters:** individually valid actions can jointly violate cardinality or
serve another owner. **Severity: Critical. Likelihood: High. Evidence/reasoning:**
current mutable fields lack CAS/history and provider work is asynchronous.
**Decision effect:** makes role changes protected successor commands and
consumes ADR-0194/D73's explicit former-primary disposition. **Permanent fix:** expected head, bounded lock
order, unique current-primary constraint, semantic idempotency, no external call
under lock, and unknown-result reconciliation. **Exact spec language:** D72-R1–R3,
R7–R12, R15–R18; AC4–AC12, AC24–AC34, AC38–AC40.

### 14. Data integrity risks

**Material concern: Yes.** **What could go wrong:** duplicate canonical hosts,
two current primaries, orphan provider IDs, array duplicates, deleted history,
mixed origin generations, or stale projections may corrupt routing and reporting.
**Why it matters:** historical links and current public identity become
unreconstructable. **Severity: Critical. Likelihood: High. Evidence/reasoning:**
the current/proposed physical shapes cannot encode all D72 invariants. **Decision
effect:** requires immutable history and relational constraints without freezing
names. **Permanent fix:** canonical unique identity, complete relationships,
restrictive deletion, current heads, receipts, and reconciliation indexes.
**Exact spec language:** D72-R2, R7–R12, R16–R18; AC7–AC12, AC20–AC31,
AC38–AC40.

### 15. Security and privacy risks

**Material concern: Yes.** **What could go wrong:** Host-header spoofing, open
redirects, IDN homographs, cross-host cookies, OAuth/callback widening, CORS
trust, stale service workers, domain takeover, or public old/new linkage can
expose data or credentials. **Why it matters:** public domains are security and
identity boundaries, especially for sensitive ministries. **Severity: Critical.
Likelihood: High. Evidence/reasoning:** OWASP warns against caller destinations;
host-only cookies are narrower; broad HSTS can affect sibling subdomains; current
code trusts forwarded-host ordering and has no D72 role boundary. **Decision
effect:** forbids role-based trust expansion and arbitrary targets. **Permanent
fix:** trusted platform host normalization, server mapping, exact HTTPS proof,
host-only cookies, separately proved HSTS/origin allowlists, IDN dual display,
non-enumeration, and takeover tests. **Exact spec language:**
D72-R2–R6, R8–R12, R14–R18; AC7–AC31, AC33–AC40.

### 16. Scalability and performance risks

**Material concern: Yes.** **What could go wrong:** request-time database scans,
array containment, provider checks, unbounded domains, host-blind caches, or
redirect chains degrade every public request. **Why it matters:** domain
resolution is on the public critical path and affects low-bandwidth donors.
**Severity: High. Likelihood: Medium. Evidence/reasoning:** Phase 5 sets a 15 ms
launch p99 projection-read budget pending capacity evidence, provider APIs expose
rate limits, and the installed
Next.js redirect guide documents Vercel's 1,024 static-redirect limit. **Decision
effect:** keeps D72 inside one indexed projection and freezes no unmeasured cap.
**Permanent fix:** canonical-host/current-role indexes, bounded adapter projection,
one-hop responses, no static rule per domain/path, queued provider work, and
maximum-catalog tests. **Exact spec
language:** D72-R2, R11–R12, R15–R18; AC9–AC10, AC20–AC25, AC30, AC36–AC40.

### 17. Operational burden

**Material concern: Yes.** **What could go wrong:** staff/support may need Vercel
access, manually reconcile DNS/TLS, repair rows directly, remember redirect
exceptions, or maintain provider constants. **Why it matters:** self-service
becomes fragile and developer-dependent. **Severity: High. Likelihood: Medium.
Evidence/reasoning:** the original Phase 24 scope used a stale fixed rate limit
and current runtime has no domain workspace. **Decision effect:** requires
provider-neutral self-service and source-owned exceptions. **Permanent fix:**
plain DNS instructions, durable reconciliation, live provider limits, actionable
Needs attention, and no direct DB/provider dashboard path. **Exact spec language:**
D72-R3, R9, R11, R13–R18; AC5–AC6, AC24–AC40.

### 18. Observability and auditability gaps

**Material concern: Yes.** **What could go wrong:** support cannot distinguish
Core role, provider proof, DNS, TLS, projection lag, route ineligibility, or
search recrawl; logs may expose sensitive host relationships. **Why it matters:**
diagnosis and safe correction require both durable business history and low-
cardinality technical signals. **Severity: High. Likelihood: Medium-high.
Evidence/reasoning:** D72 crosses database, provider, edge, runtime, cache, and
search seams. **Decision effect:** adds zero-tolerance role/routing signals and
separates search observation. **Permanent fix:** immutable receipts/audit plus
the named content-free monitors below. **Exact spec language:** D72-R7, R10–R12,
R15–R18; AC20–AC31, AC38–AC40 and required monitors.

### 19. Dependency and integration risks

**Material concern: Yes.** **What could go wrong:** Vercel API/schema/rates,
DNS providers, CAs, Edge Config limits, browser redirect caches, search crawlers,
or a future hosting provider may disagree or change. **Why it matters:** provider
lock-in or stale evidence must not redefine Core public identity. **Severity:
High. Likelihood: High. Evidence/reasoning:** Vercel documents automatic domain
application and response-header rate limits; external convergence is inherently
asynchronous. **Decision effect:** makes provider an adapter/evidence source.
**Permanent fix:** provider-neutral roles, versioned evidence, live limits,
reconciliation, replaceable projection, and source-owner precedence. **Exact
spec language:** D72-R3, R7–R12, R15–R18; AC5–AC8, AC20–AC31, AC36–AC40.

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.** **What could go wrong:** copying current CMS strings or
Phase 2 arrays directly could activate stale/wrong hosts; mixed readers may treat
redirects as serving; rollback may re-enable old host lookup after D72 data is
written. **Why it matters:** migration itself could create cross-Tenant public
behavior. **Severity: Critical. Likelihood: High. Evidence/reasoning:** current
code and proposed target disagree in scope, authority, and role meaning.
**Decision effect:** requires reader/adverse-first rollout and no inferred
favorable backfill. **Permanent fix:** inventory/evidence classify, migrate as
nonpublic candidates, dual-read proof without dual-write authority, cohort
activation, writer-off/roll-forward rollback. **Exact spec language:** D72-R7,
R10–R12, R16–R18; AC1, AC7–AC12, AC27–AC31, AC38–AC40.

### 21. Testability, traceability, and proof

**Material concern: Yes.** **What could go wrong:** a happy-path browser test may
pass while cross-Tenant hosts, Giving routes, caches, IDNs, concurrency, provider
ambiguity, or old clients fail. **Why it matters:** visual success does not prove
public authorization or canonical closure. **Severity: High. Likelihood: High.
Evidence/reasoning:** current OpenSpec has no D72 role requirements and current
runtime lacks Site identity. **Decision effect:** creates D72-R1–R18 and AC1–AC40
plus artifact gates. **Permanent fix:** server-seam, database, provider-contract,
production-shaped browser, accessibility, migration, and reconciliation proof
traced into OpenSpec/design/tickets/tests/release evidence. **Exact spec language:**
D72-R18; AC1–AC40.

### 22. Other development hazards

**Material concern: Yes.** **What could go wrong:** accepted docs may be mistaken
for shipped runtime, PR #1340 may be treated as merged authority, the `www`
recommendation may become a hard rule, or accepted D73 may be silently narrowed
by an implementation default. **Why it matters:** hidden assumptions make irreversible
public-origin choices before dependencies settle. **Severity: High. Likelihood:
High. Evidence/reasoning:** current source, merged intent, proposed Phase 23, and
D72/D73 are intentionally at different maturity levels. **Decision effect:** keeps
D72/D73 docs-only and makes ADR-0194 a required dependency. **Permanent fix:** explicit current/
intended labels, no implementation until consolidated OpenSpec, no inferred
former-primary behavior, and governed activation gates. **Exact spec language:**
D72-R1, R16–R18; AC1, AC32–AC40.

## Exact normative requirements

### D72-R1 — Closed public domain roles and cardinality

A publicly activated, nonretired Site MUST have exactly one current Primary Site
Domain—including while D7 suspends serving—and MAY have zero or more current
Redirect Site Domains. A private pre-activation Site MAY have no public-role
domain; a retired Site retains history without favorable roles. Core MUST NOT
expose a serving alias role, automatic primary, or public platform/provider
fallback.

### D72-R2 — Canonical exact hostname and uniqueness

Every custom hostname MUST use one versioned WHATWG/IDNA-compatible canonical
ASCII identity, safe display form, and complete Tenant/environment/Site binding.
A current custom hostname MUST be unique platform-wide and active in at most one
Core environment. V1 custom public roles MUST be production-only while Core uses
isolated environment databases; another environment requires one platform-wide
current-host claim authority first. Exact custom hosts only are in D72 scope.
The resolver MUST consume only a hostname normalized by a proved platform edge/
proxy contract; request-controlled `Host`/`Forwarded`/`X-Forwarded-Host` values
MUST NOT select any binding, scope, role, or destination.

### D72-R3 — Provider evidence is subordinate

DNS, registrar, certificate, Vercel ownership/verification/project/deployment,
provider status, and provider defaults MAY prove current readiness but MUST NOT
create, change, or restore a Core public domain role.

### D72-R4 — Primary-only favorable origin

Only the Primary Site Domain MAY serve favorable Site content or supply new
canonical/internal/alternate/sitemap/social/feed/share/public-generation origin.
Redirect Site Domains MUST emit no duplicate content or favorable inventory.
A primary change MUST prepare and atomically advance compatible D1/D66 Public
Site Generation successors so origin, locale, canonical, alternate, sitemap,
feed, and cache closure cannot mix old and new domain heads.

### D72-R5 — Route-owner-qualified redirects

A Redirect Site Domain MUST use a server-derived one-hop destination on the
current Primary Site Domain. Only exact current same-Site `GET`/`HEAD` public
navigation whose route owner proves path/locale/resource/purpose equivalence MAY
redirect. Query handling MUST be route-owned and allowlisted. Arbitrary targets,
queries, bodies, cookies, headers, fragments, state, chains, loops, homepage
fallback, proxying, and rewrites MUST NOT supply authority.
The resolver MUST compose owner redirects to the final destination: Redirect
Domain `/` points directly to D16's explicit default-locale homepage, never
through primary `/`. `Location` MUST use the owner-approved explicit empty-
fragment form and pass real-browser inheritance tests.

### D72-R6 — Giving, protected, and non-web exclusions

Domain role MUST NOT redirect or authorize Giving/checkout, protected actions,
auth, preview, API, callback/return, webhook, provider-result, transactional, or
other source-owned route families. Provider-owned domain/certificate validation,
including applicable `/.well-known`, also runs before website redirection.
D9–D15 and each route owner remain decisive.
A separately authorized exact route MAY retain its owner-defined behavior on a
hostname whose website role is Redirect; that authority comes only from the
route owner and is evaluated before website redirection.
D72 grants no eligibility for a new direct-only allocation. A route owner that
permits one MUST explicitly admit the exact hostname under its own contract;
otherwise it fails closed. Existing direct allocations never become redirects.

### D72-R7 — One operational Domain authority

Operational Domain authority MUST own identity, canonicalization, binding, role,
lifecycle, history, expected head, authorization receipt/audit, and provider-
evidence reference. CMS/provider/DNS/Edge/search/cache/UI MUST remain sources,
adapters, projections, observations, or consumers—not write authorities.

### D72-R8 — Relational logical integrity

D72 MUST use a relational repeated-facet authority capable of canonical-host
uniqueness, complete same-scope relationships, at-most-one current primary,
finite roles/states, restrictive deletion, immutable public history, CAS heads,
receipts, and indexed lookups. CMS `primaryDomain`, `primary_domain`, and
`alias_domains[]` MUST NOT remain public-role write authorities.
One immutable complete Site-domain role generation MUST carry one non-null
primary binding plus redirect membership under a sole current head, so exact-one
public cardinality is structural rather than an application count check.

### D72-R9 — Authorization boundaries

Safe status read, domain preparation, and public-role effect MUST use current
Site-scoped authority appropriate to each action. Public-role activation,
deactivation, and primary change MUST be separately protected human effects or
accepted equivalents. Actor/scope/role/audit MUST derive from trusted server
context; provider/DNS access, UI visibility, callers, imports, and AI grant none.

### D72-R10 — Grants, RLS, and privileged parity

Tenant-bearing Domain relations MUST use minimum grants, enabled and FORCE RLS, operation-
correct `USING`/`WITH CHECK`, structural FKs/constraints, and command-only writes.
Views/functions/RPCs/service-owner/worker/Payload/import/support/AI paths MUST
preserve the same Tenant/environment/Site/role boundary and pass poison tests.
Any platform-global occupancy authority MUST remain private/no-Data-API and must
not weaken Tenant policy.

### D72-R11 — Atomic local transitions and idempotency

Role transitions MUST pin expected current heads, use bounded lock order,
enforce one current primary, record one durable business identity/receipt/audit/
outbox, return the original result on retry, and reconcile unknown results.
External provider work MUST NOT occur under the authoritative lock.

### D72-R12 — Provider convergence and adverse-first safety

Provider work MUST coalesce and honor live rate/reset evidence and `429` backoff.
Favorable role activation MUST require current complete proof. Adverse removal,
transfer, safety, or lost-authority changes MUST fence/acknowledge Core admission
before provider detachment. No failure MAY auto-promote another domain.
Vercel/provider whole-domain redirects MUST NOT implement D72; present and
future source-owned route owners MUST run before the website redirect projection.

### D72-R13 — Staff workspace

Core MUST provide one Base Maia **Site → Domains** vertical workspace with
Primary first with D7 serving state separate, Redirect and Not-used-for-website/setup groups, plain evidence-derived
states, current checked time/timezone, and one truthful next action. It MUST NOT
expose a provider dashboard, role matrix, raw status/error/ID, rate constant,
canonical editor, routing DSL, automatic `www`, or silent role change.
Redirect rows MUST use the label **Redirects website visits**, and MUST show a
bounded owner-derived exception when separately authorized routes remain on that
hostname. Counts require complete authorized inventory; D72 MUST NOT add a route
scanner.

### D72-R14 — International and accessible presentation

Hostname/status/actions MUST wrap/reflow, remain keyboard/touch/screen-reader/
forced-color/zoom accessible, and support weak networks/JavaScript-off public
behavior. IDNs MUST show safe Unicode plus canonical ASCII when different, use
bidi isolation/LTR technical rendering, and never rely on glyph similarity.

### D72-R15 — Honest failure and isolation

Unknown/conflicting/stale proof MUST NOT activate. Redirect failure MUST affect
only that redirect; primary failure MUST NOT choose a fallback. Ineligible routes
MUST keep owner `404`; on a Redirect Site Domain it is tiny platform-neutral with
no Tenant content/branding. Authority failure MUST be neutral no-store `503`. Redirect
responses MUST set no application/session cookie or widen CORS/auth/callback/
service-worker trust. D72 MUST NOT widen HSTS `includeSubDomains`/preload or any
sibling-domain policy without independent owner proof.

### D72-R16 — Bounded critical path and caches

Host/role/redirect resolution MUST use one bounded indexed admission projection,
no request-time provider call/database scan/array scan, and meet Phase 5's p99
15 ms launch projection-read budget after capacity proof. Cache identity MUST include host/binding/primary/
route/public generations; redirect and content cache entries MUST never mix.

### D72-R17 — Migration, rollout, and rollback

Rollout MUST land canonical/negative readers and constraints before writers,
inventory current hosts, migrate only proved unambiguous values as nonpublic
candidates, and activate by cohort. No favorable role MAY be inferred from CMS,
arrays, slug fallback, provider state, or DNS. Rollback MUST be writer-off,
reader-compatible, history-preserving, and safe-absence/roll-forward.

### D72-R18 — Dependency, traceability, and proof gate

Activation MUST require accepted Phase 2/5 Site/host contracts, D6–D15, D66,
D72–D73, reconciled Phase 23 authority, consolidated Phase 24 OpenSpec, current
provider/URL/HTTP conformance, AC1–AC40, named monitor/runbook proof, maximum-
catalog capacity, accessibility, and representative ministry-staff evidence.

## Falsifiable acceptance criteria

1. **AC1 — Current-state truth:** current `develop` remains documented as one
   Payload Tenant domain, Tenant-only resolver, and `siteId: null`; D72 docs do
   not claim runtime/schema/provider behavior exists.
2. **AC2 — One retained primary:** every publicly activated, nonretired Site
   projection—including a serving-suspended Site—has exactly one current Primary
   Site Domain; zero or two fail closed and alert.
3. **AC3 — Private zero state:** a private Site with no public domain remains
   usable in staff preparation and has no public/provider fallback.
4. **AC4 — Redirect role:** zero, one, and several Redirect Site Domains remain
   non-website-serving and cannot become candidates for Site website content;
   independently authorized source-owned routes retain only their own behavior.
5. **AC5 — Explicit effect:** add/verify/DNS/TLS/provider success never changes a
   role without the protected Core command.
6. **AC6 — No platform brand:** `asymmetric.al`, `vercel.app`, preview, and
   deployment hosts never become public primary/redirect output.
7. **AC7 — Canonical equivalence:** case, trailing dot, Unicode/A-label, port,
   separator, and parser-equivalent host fixtures converge or reject exactly.
8. **AC8 — IDN display:** permitted IDNs round-trip and show safe Unicode plus
   canonical ASCII; mixed-script/lookalike fixtures cannot hide identity.
9. **AC9 — Platform uniqueness:** concurrent same-host claims across Tenant,
   Site, and environment yield one winner and non-enumerating losers; V1 proves
   custom public roles are production-only until a global claim authority exists.
10. **AC10 — Scope/host integrity:** forged Tenant/Site/environment/role/actor/
    audit input or request-controlled Host/Forwarded/X-Forwarded-Host cannot
    insert, move, update, read, activate, resolve, or delete a foreign binding.
11. **AC11 — Primary constraint:** concurrent promotion cannot commit two current
    primaries; the current immutable role generation contains exactly one
    non-null primary; retries return one original receipt.
12. **AC12 — Historical integrity:** public binding/role history survives removal,
    transfer, retirement, Site deletion attempts, and writer rollback.
13. **AC13 — Eligible navigation:** a current ordinary Page `GET`/`HEAD` redirects
    once to the exact current primary and equivalent locale/path; Redirect `/`
    composes D16 and targets the final explicit default-locale homepage directly.
14. **AC14 — Method safety:** POST/PUT/PATCH/DELETE and other non-navigation
    methods never follow generic domain redirect semantics.
15. **AC15 — Query policy:** only the route owner's exact allowlisted query
    survives; arbitrary return/URL/PII/auth/Giving parameters are removed or make
    the request ineligible.
16. **AC16 — No arbitrary target:** staff/caller/header/query/CMS/provider/import/
    AI destination input cannot change `Location`.
17. **AC17 — Missing route:** unknown/missing/retired/withdrawn paths receive the
    owner-correct non-success and never primary-homepage redirect; Redirect-
    domain errors contain no Tenant content or branding.
18. **AC18 — Authority outage:** unavailable route/domain authority returns
    neutral no-store `503`, never guessed redirect or another Site.
19. **AC19 — No chain/loop/fragment carry:** every server response points directly
    to the current final primary using the approved explicit empty-fragment form;
    loop/chain/self-target and real-browser fragment fixtures fail closed.
20. **AC20 — Giving exclusion:** every D9–D15 Giving/checkout/address/QR/amount/
    Designation/currency/cadence/Source Code fixture produces zero generic
    redirect or financial effect; an independently current exact Giving route
    retains only its owner-defined direct behavior.
21. **AC21 — Protected exclusion:** auth, protected actions, callbacks/returns,
    webhooks, APIs, preview, provider results, and transaction routes do not gain
    redirect or origin authority from D72; provider-owned `/.well-known`
    validation remains reachable only under its exact provider contract.
22. **AC22 — Origin isolation:** redirect domains set no application/session
    cookie and do not enter CORS, OAuth, CSP source, callback, or service-worker
    allowlists or broaden HSTS `includeSubDomains`/preload merely because of role.
23. **AC23 — Primary canonical closure:** canonical HTML, internal links,
    reciprocal `hreflang`, sitemaps, feeds, OG/share URLs, and new public outputs
    all pin the same primary and compatible D1/D66 successor generation; no
    primary-only head flip can mix old/new origins.
24. **AC24 — Redirect absence:** redirect domains emit no duplicate `200` content,
    sitemap URL, canonical document, search page, or favorable content cache.
25. **AC25 — Provider no-authority:** forged/stale/delayed/duplicate/out-of-order
    Vercel/DNS/TLS events cannot activate, move, or restore a role, and no
    provider whole-domain redirect precedes Core route-owner resolution.
26. **AC26 — Provider idempotency:** duplicate jobs/tabs/retries/lost responses
    converge through one work identity and receipt under live rate/backoff.
27. **AC27 — Adverse first:** loss/transfer/removal fences and acknowledges Core
    admission before provider detach; stale provider serving cannot win.
28. **AC28 — Local failure:** a failed Redirect Site Domain leaves primary and
    other redirects unchanged; primary failure never promotes another host.
29. **AC29 — RLS/grants:** positive and negative `SELECT`/`INSERT`/`UPDATE`/
    `DELETE` tests cover grants, `USING`, `WITH CHECK`, final row state, and
    cross-scope denial.
30. **AC30 — Privileged poison:** service/owner, functions, views, RPCs, workers,
    Payload, imports, support, AI, and direct SQL cannot bypass structural/
    capability/cardinality invariants.
31. **AC31 — Capability split:** safe status, preparation, and public role effects
    expose only actions currently authorized for that exact Site and actor;
    provider/DNS access grants none.
32. **AC32 — Workspace hierarchy:** Primary appears first with public-origin role
    and D7 serving state separate, then Redirect and Not-used-for-website/setup
    groups; **Not public** requires complete owner proof of no favorable route;
    state/action/accessibility order matches visual order at desktop and 320 CSS
    pixels/400% zoom.
33. **AC33 — Honest setup:** Needs DNS/Securing/Ready/Needs attention distinguish
    Core role from provider evidence and show last checked time/timezone without
    raw provider details.
34. **AC34 — `www` neutrality:** apex/`www` companion is suggested only when
    relevant; neither is added, selected, activated, or made primary silently.
35. **AC35 — Loading/failure:** weak network, offline, provider rate limit,
    expired proof, and lost response preserve current public truth and one useful
    recovery without optimistic role state.
36. **AC36 — Performance:** maximum supported domain catalog uses one indexed
    projection with zero request-time provider/database/array scan and proves the
    Phase 5 launch p99 ≤15 ms budget before activation.
37. **AC37 — Cache separation:** hostile host/role/generation fixtures cannot
    receive another content/redirect decision; tags alone never isolate.
38. **AC38 — Migration:** every legacy CMS/Phase 2/provider host is inventoried;
    ambiguous/stale/foreign/unproved values remain nonpublic and never backfill
    favorable roles.
39. **AC39 — Mixed version and rollback:** old readers cannot treat Redirect as
    serving; disabling new writers preserves safe readers/history and cannot
    restore CMS/array/provider authority.
40. **AC40 — Production-shaped proof:** keyboard, screen reader, touch, IDN/RTL/
    bidi, JavaScript-off public redirect, low bandwidth, concurrency, takeover,
    provider ambiguity, capacity, and representative staff comprehension pass;
    D73 and consolidated artifacts use identical terms/invariants.

## Required monitors

| Signal                                                 |                                                                                                 Threshold | Owner                          | Required response                                                                                                                                                                                          |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------: | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site_domain_primary_cardinality_violation_total`      |                                                                                                       Any | Site Platform + Database       | Fence favorable serving for the affected Site, retain safe absence, reconcile current heads, and rerun cardinality/concurrency proof.                                                                      |
| `site_domain_cross_scope_binding_total`                |                                                                                                       Any | Security + Site Platform       | Fence the hostname, purge affected projections/caches, start incident response, and re-prove global uniqueness/scope.                                                                                      |
| `site_domain_redirect_content_response_total`          |                                                  Any favorable content response on a Redirect Site Domain | Public Runtime + Web Studio    | Disable that redirect role, purge content caches, inspect host/role projection, and restore only after negative-origin proof.                                                                              |
| `site_domain_redirect_ineligible_route_total`          |                                                                 Any Giving/protected/noneligible redirect | Security + owning route domain | Fence the redirect domain or affected route family, preserve primary serving, reconcile requests, and re-prove owner precedence.                                                                           |
| `site_domain_redirect_chain_hops`                      |                                                                             Any server-observed value > 1 | Public Runtime + Site Platform | Replace with one direct final target or disable the affected redirect; inspect stale primary generations and browser-cache assumptions.                                                                    |
| `site_domain_redirect_fragment_carry_total`            |                                            Any destination receives an inherited nonempty source fragment | Security + Public Runtime      | Disable the affected redirect role, correct `Location` construction, and rerun real-browser fragment proof.                                                                                                |
| `site_domain_primary_output_generation_mismatch_total` | Any canonical/internal/alternate/sitemap/feed/social output disagrees with the current Primary generation | Public Runtime + Web Studio    | Fence the primary cutover, retain the last complete generation, purge scoped caches, and reconcile forward.                                                                                                |
| `site_domain_projection_divergence_age_seconds`        |                                                          >30 seconds after a committed public-role change | Site Platform Operations       | Stop favorable role changes, reconcile Domain/provider/admission heads, and fence the affected role if authority is unknown under D7's hard containment bound; DNS preparation remains separately pending. |
| `site_domain_host_resolution_latency_ms`               |                                                                                 p99 >15 ms for 15 minutes | Public Runtime                 | Inspect index/projection/cache health; shed setup/reconciliation load and preserve fail-closed serving rather than adding request-time fallback.                                                           |
| `site_domain_platform_host_public_response_total`      |                                                                                                       Any | Security + Public Runtime      | Disable the platform-host route, purge public caches, verify no Tenant branding/content leaked, and re-prove primary-only public origin.                                                                   |

Search recrawl/ranking, DNS propagation, and provider health are separately
labelled observations. They never turn a favorable role on or satisfy command
completion.

## Ruthless synthesis and execution order

### Must be resolved before recording

Resolved by ADR-0193 and this review:

1. Rename the model to Primary Site Domain and Redirect Site Domain.
2. Permit only one serving origin and route-owner-qualified redirects.
3. Preserve D9–D15, protected routes, and independent origin allowlists.
4. Establish operational Domain ownership and reject CMS fields/arrays/provider
   state as favorable authority.
5. Require relational integrity, global hostname uniqueness, and one-primary
   cardinality without freezing physical names.

### Must enter consolidated Phase 24 OpenSpec/design before ticketing

1. D72-R1–R18, AC1–AC40, the ten monitors, and accepted D73.
2. Exact hostname canonicalization profile, logical domain-role/lifecycle state
   machine, owner registry, capability mapping, provider evidence contract,
   admission projection, and cache identity.
3. The route-owner eligibility interface and complete Giving/protected/control/
   infrastructure exclusion registry.
4. Provider-neutral commands/work/reconciliation, migration inventory, mixed-
   version contract, and rollback/incident runbooks.
5. Base Maia Site → Domains journeys, IDN presentation, responsive/a11y states,
   and representative ministry-staff evidence.

### Required implementation safeguards

1. Land Site identity, relational readers/constraints, trusted host parsing, and
   adverse/negative routing before public role writers.
2. Prove complete grants/RLS/privileged parity, current-primary concurrency,
   global host coordination, semantic idempotency, and no provider call under
   lock.
3. Build/reconcile the adverse-first admission projection and route-owner
   redirect decision; prove no duplicate content or Giving/protected redirect.
4. Migrate only evidence-classified candidates, enable by cohort, and retain a
   role-specific kill switch plus writer-off/roll-forward rollback.
5. Run maximum-catalog, p99, browser/cache, takeover, IDN, accessibility,
   provider-fault, and staff-comprehension evidence before activation.

### Monitor after release

Only the ten named signals above and inherited D6–D15/Phase 5 signals are
accepted monitor items because each has a signal, threshold, owner, and response.
Wrong-Tenant binding, two primaries, Redirect content, excluded-route redirect,
multi-hop server redirect, or platform-host public content are incidents—not
residual risks.

## Exact corrected decision

> Each publicly activated, nonretired Site—including while serving is
> suspended—has exactly one current **Primary Site Domain**, a proved
> Tenant-controlled HTTPS hostname that alone may serve favorable website
> content and supplies the current public origin. A Site may have zero or more explicit
> **Redirect Site Domains**. Its website role never serves Site website content
> or becomes another website origin; it may redirect only current, route-owner-qualified,
> navigation-safe `GET`/`HEAD` requests in one hop to the exact equivalent path
> on the current Primary Site Domain. Separately authorized Giving/protected
> routes retain only their owners' behavior and run before website redirection.
>
> DNS, TLS, Vercel verification/assignment, and provider defaults are evidence
> only. Every role and role change is a protected Core effect. Redirect
> destinations are server-derived; aliases, arbitrary forwarding, duplicate
> origins, homepage fallbacks, chains, and implicit apex/`www` activation are
> prohibited. D9–D15 and every Giving/protected/auth/callback/API owner remain
> stronger than the domain redirect role. Vercel/provider whole-domain redirects
> cannot implement D72; Core composes the final route-owner destination—including
> D16 root—and explicitly prevents source-fragment inheritance.
>
> Operational Domain authority owns canonical hostname identity, complete
> binding, role, lifecycle, history, receipts, and evidence references. D72 uses
> a relational repeated-facet model with platform-wide host uniqueness and at
> most one current primary—not CMS `primaryDomain`, `primary_domain`, or
> `alias_domains[]` as authority. Vercel/DNS are providers, Edge is a rebuildable
> projection, CMS/search/cache/UI are consumers. Role transitions use current
> authorization, expected heads, semantic idempotency, adverse-first fencing,
> and reconciled provider work. A primary change advances compatible D1/D66
> public-generation origin closure rather than flipping an isolated string.
>
> The staff experience is one compact **Site → Domains** workspace. It presents
> Primary role separately from D7 serving state, followed by Redirect and
> Not-used-for-website/setup groups, plain readiness states, safe IDN
> display, optional source-labelled `www` guidance, and one truthful next action.
> Redirect rows say **Redirects website visits** and disclose bounded owner-known
> exceptions. No publicly activated Tenant website falls back to Asym or provider branding. ADR-0194/D73
> requires one explicit former-primary website disposition for every exact
> Primary successor and preserves all source-owned route outcomes.

## Final disposition

**Accept with required amendments.** Option 1 is the most current, proven
direction and the strongest product choice after the corrections above. The
modern practice is not “point several domains at the same app”; it is one
authoritative public origin, explicit redirect domains, consistent generated URL
signals, and controlled migration. Core's stronger route/Giving/privacy/tenant
boundaries require route-aware redirects and operational authority rather than a
blanket provider setting.

No runtime, schema, migration, Supabase policy, Vercel setting, OpenSpec delta,
ticket, deployment, or production state changed. Documentation records intended
behavior only; current `develop` remains the migration state described above.

## D76 reconciliation (2026-08-30)

ADR-0197 now owns a same-Tenant Site-binding successor. It preserves D72's one
global current occupancy while appending a new immutable Site binding, requires
an initially unselected destination Primary/Redirect/Not-public role, preserves
exactly one Primary on both active Sites, and acknowledges an adverse Moving
generation before target admission. Launch performs no Vercel project movement;
D72's operational Domain authority and finite owner registry remain the only
write/route authority.
