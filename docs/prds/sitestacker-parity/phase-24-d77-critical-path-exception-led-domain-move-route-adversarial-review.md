# Phase 24 D77 — Critical-path gate plus exception-led Domain move route review

**Date:** 2026-08-31  
**Founder answer:** Option 1 — Critical-path gate plus exception-led ordinary-route review  
**Final disposition:** **Accept with required amendments**

## Executive verdict

Option 1 is the strongest permanent choice. It protects money, identity,
security, and trusted public meaning while keeping staff effort proportional to
actual exceptions. It also fits Core's existing architecture better than either
a page-by-page migration exercise or a clean-break policy.

The founder answer is accepted only with these amendments:

1. **Reuse is contractual today, not implemented reuse.** Current `develop` has
   neither the D72–D76 owner registry nor an authoritative ordinary-route
   manifest. D77 requires those accepted foundations; it cannot claim they
   already run.
2. **No D77 adapter framework.** Critical owners reuse the one D73/D76 typed
   owner port and code-owned family registry. Ordinary Pages use one D1/Public
   Site Generation manifest. There is no adapter per Page, plugin API, generic
   impact engine, or second resolver.
3. **Not-found is a durable route effect, not absence.** Every source-only
   ordinary address compiles a negative reservation/effect into the target
   binding generation. Otherwise a later target Page could silently reuse the
   trusted historical URL.
4. **Different-Page cross-Site continuity requires D78 owner proof.** Open Phase
   22 and Phase 23 contracts allow automatic continuity only for the same
   immutable Page under narrower scope. ADR-0199/D78 now permits only one
   directional, exact-address, revision-bound General Page successor
   qualification; everything else still blocks or remains not-found.
5. **Authority and advice have separate digests.** Current critical and route
   effects gate the move. Known messages, QR files, analytics, backlinks,
   bookmarks, search, and print remain explicitly incomplete advice; their churn
   cannot become route authority.
6. **The critical inventory remains genuinely small.** It registers owner
   families whose wrong routing could accept money, authenticate, authorize,
   invoke a protected effect, or choose origin/admission—not every concrete URL.
   A CI route census prevents new framework routes from bypassing the registry.
7. **Vercel remains a provider no-op.** D77 makes no project-level redirect,
   rewrite, bulk-redirect, cache, Domain, DNS, TLS, or deployment mutation in
   Core's shared donor project.

The permanent result is one pure manifest comparison, one derived section in
the existing D76 review, and one current route-effect table consumed by the
existing Phase 5 owner-aware router. That is necessary safety, not a new routing
product.

## Current behavior, intended behavior, and permanent path

| Layer                 | Verified current behavior                                                                                               | D77 intended behavior                                               | Best permanent path                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Ordinary Pages        | Payload `pages` stores Tenant plus mutable indexed slug; it has no Site/locale placement identity or route generation.  | Compare exact source and destination ordinary routes.               | D1/Public Site Generation compiles one complete immutable effective-host route manifest from source-owned revisions.          |
| Public content read   | The reader filters Tenant/published, orders by `-updatedAt`, and takes `limit: 1`.                                      | Consume exact current generations, never mutable latest.            | Public reads and D77 pin immutable Public Site Generation artifacts/digests.                                                  |
| Runtime routing       | Next file routes, host-blind static redirects, CMS catch-all, auth, APIs, and proxy exclusions are separate mechanisms. | Protected owners run first; ordinary content uses compiled effects. | One Phase 5 owner-aware admission/router seam and a code-owned route-family census.                                           |
| Navigation/placements | Navigation may carry raw `href`; external links are inherently incomplete.                                              | Show known places without treating them as complete.                | Stable internal references compile into public closure; raw/external placements remain separately labelled advisory evidence. |
| Canonicalization      | Current helpers normalize only a narrow slug/host shape.                                                                | Detect every router-equivalent collision deterministically.         | D15's versioned canonicalizer is the single collision identity; incompatible versions block or pass dual proof.               |
| Cache/metadata        | Cache policy is host/descriptor shaped; canonicals use global `siteConfig.url`.                                         | Route effects cannot cross Site/binding generations.                | Host + binding + Site + locale + owner + route/public generation is cache/metadata identity; tags only invalidate.            |
| Critical registry     | Accepted D72–D76 documentation requires one; no runtime registry exists.                                                | Reuse one small owner-family gate.                                  | Build once as a D72/D73 prerequisite; D77 adds only a pure comparator and projection.                                         |
| Provider              | All public Sites use the one donor Vercel project.                                                                      | No provider route mutation.                                         | Core host-scoped route authority; Vercel remains deployment/observation only.                                                 |
| OpenSpec              | No implemented D77 contract or active Phase 24 change exists.                                                           | Record founder intent and proof requirements.                       | Consolidated Phase 24 OpenSpec after Phase 22/23/D9 reconciliation; no D77-only runtime delta during grooming.                |

## Verified current external evidence

| Source                                                                                                                                                                  | Current finding                                                                                                                             | Relevance to D77                                                                               | Boundary                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [Google site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) (updated 2026-08-20)                                        | Prepare exact mappings, redirect genuine replacements directly, avoid chains/irrelevant homepage collapse, and keep useful redirects.       | Supports exact visitor meaning and no blanket fallback.                                        | Search guidance does not authorize Core route equivalence or completion.                  |
| [Google crawl/soft-404 guidance](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)                                              | A clear replacement gets a permanent redirect; no replacement gets a real `404`/`410`; a helpful error page must not return `200`.          | Supports truthful not-found and user-friendly error presentation.                              | D9/privacy decides Core's exact envelope.                                                 |
| [Vercel rewrites](https://vercel.com/docs/routing/rewrites) (updated 2026-03-05)                                                                                        | Rewrites are project routing; `/.well-known` is reserved; framework-native same-app routing is preferred.                                   | Confirms protected precedence and that provider routing is not needed for same-app Core logic. | Project rules would couple all Tenants in the shared donor project.                       |
| [Vercel redirect security](https://vercel.com/kb/guide/enhancing-security-for-redirects-and-rewrites) (updated 2025-11-10)                                              | Unconstrained URI components can create open-redirect/phishing behavior.                                                                    | Supports stable server-owned targets, exact validation, and no arbitrary URL.                  | Vercel examples are transport security, not product authority.                            |
| [HubSpot URL redirects](https://knowledge.hubspot.com/domains-and-urls/create-and-manage-url-redirects) (updated 2026-05-21)                                            | System redirects preserve individual published Page URL changes; manual/flexible/bulk routes are visible separately.                        | Supports automatic same-resource continuity plus explicit exceptional work.                    | Core rejects a general redirect console and protected-route crossover.                    |
| [Shopify URL redirects](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect)                                                                   | Reserved/fixed paths cannot be redirected; redirects apply only where the original content is absent.                                       | Supports protected namespaces and explicit broken-route handling.                              | Shopify route limits/commerce semantics do not govern Core.                               |
| [WordPress Page links](https://wordpress.com/support/permalinks-and-slugs/) (reviewed 2026-08)                                                                          | A Page/post slug change automatically redirects the old URL.                                                                                | Supports same-identity convenience without staff ceremony.                                     | It does not prove cross-Site different-Page equivalence.                                  |
| [OWASP redirects](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)                                                   | Prefer server-side destination mapping/allowlisting over caller-controlled targets.                                                         | Supports stable internal route identity and no arbitrary target.                               | Security advice supplements, not supersedes, owner contracts.                             |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) (current 2026 docs)                                                               | Grants and policies both matter; `UPDATE` needs `USING` and `WITH CHECK`; views/service paths need explicit care.                           | Confirms permission-safe projections and no client authority mutation.                         | D77 should keep raw manifests private by default rather than lean on complex browser RLS. |
| [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) and [constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) | RLS defaults deny when enabled without policy; owners/BYPASSRLS and integrity side channels need review; uniqueness/FKs enforce invariants. | Supports same-scope constraints, least grants, FORCE RLS, and privileged-path poison tests.    | Exact physical schema remains Phase 24 design-owned.                                      |
| [W3C form notification](https://www.w3.org/WAI/tutorials/forms/notifications/) and [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                    | Clear overall plus inline errors, logical focus, and complete reflow at 320 CSS px/400% zoom are current accessibility practice.            | Supports summary-first issues, cause-owned actions, and mobile/zoom behavior.                  | Core's Base Maia rules remain the product UI authority.                                   |

Modern CMS platforms sometimes support wildcard or variable redirects. That is
credible general practice, not a reason to add them here. Proposed Phase 23
ADR-0147 expressly forbids wildcard/regex authority, D9 requires exact owner
proof, and D77 compares a complete known manifest. Importing the external
pattern practice would conflict with governing Core direction and add an
unnecessary DSL. Exact compiled effects remain the accepted D77 boundary.

## Facts, judgments, assumptions, and unresolved unknowns

### Verified repository facts

- Fresh `git fetch origin develop` left local `HEAD` and `origin/develop` at
  `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`.
- Phase 22 PR #1323 remains `OPEN/BLOCKED` at
  `70c50e8c97556c43be5543332fb0993b468b90ab`.
- Phase 23 PR #1340 remains `OPEN/BLOCKED` at
  `9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`.
- `apps/admin/src/cms/collections/pages.ts` stores Tenant and slug but no Site,
  locale, stable placement, route generation, or scoped path uniqueness.
- `apps/admin/src/cms/public/published-content-reader.ts` chooses one current
  published row using mutable `updatedAt` ordering.
- `apps/donor/app/(public)/(solid)/[...cmsSlug]/page.tsx` directly fetches the
  current slug and serves/not-founds it.
- `apps/donor/next.config.ts` has host-blind permanent redirects including
  `/give` to `/workers`.
- all public Sites target the single donor Vercel project identified by
  `scripts/vercel/affected-projects.mjs`.
- ADR-0197/D76 already requires one finite critical owner inventory and forbids
  a generic impact engine, universal route graph, or Internet crawler.
- Current code has no D72–D77 Domain, registry, manifest, comparison, RLS, or
  staff workflow implementation.

### Product judgments

- A later target Page at a former source path is a public-meaning change even if
  it occurs after the Domain move; mere target absence is not durable safety.
- Criticality belongs to owner families and effect risk, not route count or
  traffic popularity.
- Staff should resolve only current blockers; safe not-found and already-
  qualified outcomes should be visible summaries, not mandatory decisions.
- A false completeness claim is worse than an honest incomplete advisory list.
- One complete server gate may include details the current Domain Manager cannot
  see; readiness is not computed from the permission-filtered UI list.
- A no-brand D9-compatible real `404` is the safest launch envelope for a
  D77-controlled former path; it contains no Asym/Vercel branding or historical
  explanation.

### Assumptions requiring representative evidence

- Representative mission Sites have a manageable blocker count even when their
  total historical Page-address inventory is large. Verify with anonymized/max-
  supported fixtures and usability studies; do not infer from current demo data.
- Staff understand **Page not found** as an intentional safe outcome when copy
  explains why. Verify with representative Tenant staff, including nontechnical
  administrators.
- The D72/D73 owner-family registry can remain small after the complete App
  Router/API/proxy/static-route census. Verify before implementation; do not set
  an arbitrary family count now.
- Immutable sorted manifest comparison and keyset exception paging meet the
  accepted D76 preparation SLO at the maximum supported Site size. Benchmark
  before choosing a numeric product limit.
- A no-brand historical-path `404` does not create unacceptable donor confusion.
  Test public copy and support evidence; never relax into a destination fallback.

### Deliberately separate decisions at D77 recording time

- D78 subsequently accepted one owner-qualified General Page exception. D77
  remains safe without a current accepted D78 receipt: collisions block or
  retain not-found.
- Exact table/column names, manifest encoding, accepted maximum route count, and
  comparison latency SLO remain implementation-design outputs backed by capacity
  proof; D77 fixes their invariants, not speculative constants.
- A future structure-preserving transform/pattern would require a route-owner ADR
  that explicitly reconciles D9 and Phase 23. D77 ships without one.

## Ruthless category review

### 1. Problem validity, necessity, and alternatives

**Material concern exists — High severity / High likelihood.** **What could go
wrong:** Core could solve “move a hostname” while silently changing every
colliding address, or force staff to classify thousands of safe routes. **Why it
matters:** one corrupts visitor/donor intent; the other creates review fatigue
and support work. **Evidence:** D9/D10 reject guessed meaning; Google rejects
irrelevant collapse; Phase 23 makes unchanged closure compilation automatic.
**Decision effect:** validates Option 1 but narrows it to owner-family hard gates
plus automatic ordinary classification. **Permanent fix:** compare complete
immutable manifestations and show only blockers/exceptions. **Exact spec
language:** D77-R1–R10, R18; AC1–AC16, AC30–AC32.

### 2. Brittleness

**Material concern exists — Critical / High.** **What could go wrong:** mutable
latest Page reads, incomplete manifests, incompatible canonicalizers, or adapter
order could produce different classifications for the same move. **Why it
matters:** a safe review could become wrong before or during cutover. **Evidence:**
current reader uses `-updatedAt`; current path helpers are incomplete; Page and
provider states are distributed. **Decision effect:** forbids runtime scans and
implicit empty input. **Permanent fix:** immutable complete manifests, one
versioned canonicalizer, pure stable ordering, digests, and unknown-as-block.
**Exact spec language:** D77-R2, R5–R7, R15, R19; AC6–AC9, AC22–AC25.

### 3. Technical debt

**Material concern exists — High / High.** **What could go wrong:** a D77 route
store, per-feature adapter, redirect UI, and D76 impact list become four shadow
models. **Why it matters:** future route changes require synchronized writes and
incident repair. **Evidence:** D73/D76 already define one registry; Phase 23
already proposes one Public Site Generation compiler. **Decision effect:** rejects
D77-specific adapters and route truth. **Permanent fix:** one family registry,
one D1 manifest boundary, one pure comparator, and derived UI only. **Exact spec
language:** D77-R3–R5, R16, R22; AC3–AC5, AC29, AC37–AC39.

### 4. Edge cases

**Material concern exists — Critical / High.** **What could go wrong:** IDNs,
Unicode/case/encoded separators, locale bases, trailing slashes, root,
Redirect-domain effects, `_next`, assets, `/.well-known`, static redirects,
method differences, inverse redirects, or a path published after cutover bypass
the comparison. **Why it matters:** an apparently ordinary Page can collide with
security or protected meaning. **Evidence:** current Next/CMS/proxy routes are
separate; Vercel reserves `/.well-known`; D15 owns normalization. **Decision
effect:** requires effective-host manifests, a framework route census, typed
method class, and durable negative reservations. **Permanent fix:** canonical
collision fixtures and owner precedence before content. **Exact spec language:**
D77-R3, R6–R13, R20; AC4, AC8, AC10–AC20, AC35–AC36.

### 5. Footguns

**Material concern exists — Critical / High.** **What could go wrong:** staff or
developers use same slug/title, raw URL, wildcard, regex, select-all, AI match,
query carry, provider rule, or “keep destination” to bypass owner proof. **Why it
matters:** trusted URLs can become phishing, wrong-donation, or wrong-Site paths.
**Evidence:** OWASP/Vercel document redirect input attacks; D9 forbids relevance
guessing; current code has a host-blind `/give` redirect. **Decision effect:**
removes all arbitrary route controls. **Permanent fix:** stable internal resource
refs, exact effects, source-owned commands, no bulk/AI/pattern path. **Exact spec
language:** D77-R7–R13, R18, R20, R22; AC12–AC21, AC30–AC34.

### 6. Tenant safety

**Material concern exists — Critical / Medium-high.** **What could go wrong:** a
shared Vercel rule, unscoped route entry, cache key, count, search cursor, or
hidden exception leaks or applies another Tenant's path. **Why it matters:** this
is public cross-Tenant content or protected-route exposure. **Evidence:** all
Sites share one donor project; current Pages are only Tenant-scoped, not Site-
scoped; D72 makes exact Site binding structural. **Decision effect:** keeps raw
manifests private and provider rules out of authority. **Permanent fix:** complete
same-scope keys/FKs, exact current context, permission-safe projections, hostile
cross-Tenant tests, and generation cache identity. **Exact spec language:**
D77-R5, R13, R16–R17, R20; AC17, AC21, AC26–AC29, AC36.

### 7. Database, RLS, and authorization safety

**Material concern exists — Critical / High.** **What could go wrong:** caller-
controlled scope/actor/evidence, mutable manifest rows, missing `WITH CHECK`,
table-owner/service bypass, or an allowed update moves a row across Sites.
**Why it matters:** UI authorization alone cannot protect route authority.
**Evidence:** current Supabase guidance requires grants plus operation-correct
policies and warns that owners/service roles bypass RLS; PostgreSQL constraints
and FKs bypass row visibility for integrity. **Decision effect:** raw authority
stays server-private; direct DML is denied. **Permanent fix:** immutable scope,
composite same-scope constraints, restrictive deletes, minimum grants, FORCE
RLS where exposed, trusted command context, and privileged-path parity. **Exact
spec language:** D77-R15–R17, R19; AC22–AC29.

### 8. Overengineering

**Material concern exists — High / High.** **What could go wrong:** “deterministic
manifest comparison and owner adapters” turns into a plugin system, generic
workflow, route graph, crawler, import/export product, or distributed router.
**Why it matters:** it duplicates Phase 5/23, raises operational burden, and
freezes speculative abstractions. **Evidence:** D73 and ADR-0175 already show the
right small-registry/derived-projection pattern; D76 forbids a generic impact
engine. **Decision effect:** accepts only a pure comparator and existing owner
ports. **Permanent fix:** no D77 adapter SPI, no per-Page adapter, no new resolver,
and design-owned storage. **Exact spec language:** D77-R1, R3–R5, R18, R22; AC1,
AC3–AC5, AC29, AC37.

### 9. UX/UI and user friction

**Material concern exists — High / High.** **What could go wrong:** a giant route
table, alarming counts, disabled unexplained Move action, permission leaks, HTTP
jargon, lost weak-network state, or mandatory acknowledgements overwhelm staff.
**Why it matters:** staff may abandon, mechanically approve, or contact support;
donors may receive unrelated content. **Evidence:** Core uses exception-first,
cause-owned Base Maia patterns; W3C recommends clear summary + inline errors and
reflow. **Decision effect:** embeds one summary-first section in D76 and defaults
only blockers open. **Permanent fix:** consequence copy, complete/unknown count
truth, owner handoffs, server paging, durable resume, and accessibility proof.
**Exact spec language:** D77-R18–R21; AC30–AC35, AC40.

### 10. Source of truth, ownership, and domain invariants

**Material concern exists — Critical / High.** **What could go wrong:** the D77
comparison, UI status, Vercel redirect, cache, or Payload latest row becomes route
authority; absence is mistaken for permanent reservation. **Why it matters:**
dual ownership makes historical meaning mutable and repair ambiguous.
**Evidence:** platform boundaries keep CMS source, operational truth, and public
generation distinct; D9 assigns route meaning to owners. **Decision effect:**
makes D77 derived proof and negative outcomes explicit owner effects. **Permanent
fix:** the source-of-truth map and constraint-backed invariants below. **Exact
spec language:** D77-R1–R16; AC1–AC29.

### 11. Hidden coupling

**Material concern exists — Critical / High.** **What could go wrong:** changing
an App Router path, proxy matcher, locale base, Page compiler, Navigation href,
Giving route, or provider rule silently changes D77 coverage. **Why it matters:**
future teams will not know a harmless route edit can defeat a Domain cutover.
**Evidence:** current routes are spread across Next files/config, CMS catch-all,
auth, APIs, and proxy logic. **Decision effect:** requires one code-owned route-
family census and CI failure for unregistered routes. **Permanent fix:** owner
registry references and public-seam fixtures, not runtime filesystem scanning.
**Exact spec language:** D77-R3–R5, R13, R22; AC3–AC5, AC17, AC37–AC39.

### 12. Failure modes

**Material concern exists — Critical / High.** **What could go wrong:** missing
manifest is treated as empty, comparator times out after saving, owner target
becomes ineligible, projection is partial, or a filtered UI reports Ready.
**Why it matters:** false success exposes wrong content; blind retry may duplicate
work. **Evidence:** current D76 already needs an adverse barrier and forward
reconciliation. **Decision effect:** every incomplete/unknown authority blocks;
lost response reloads the same immutable result. **Permanent fix:** explicit
unknown/not-found distinction, durable result, current target recheck, and D76
barrier semantics. **Exact spec language:** D77-R7–R9, R15, R19–R21; AC6–AC16,
AC22–AC25, AC34–AC36.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists — Critical / High.** **What could go wrong:** source or
target publishes after review; owner registry/canonicalizer changes; two moves
race; a late event overwrites the new comparison; retry reuses old meaning.
**Why it matters:** individually valid actions can jointly violate route
uniqueness or public meaning. **Evidence:** D1/D76 use immutable heads/CAS and
stable lock order. **Decision effect:** pins exact heads/versions/digests and
clears only affected review choices. **Permanent fix:** pure comparison,
effect-bearing CAS, semantic idempotency, one winner, no last-write-wins.
**Exact spec language:** D77-R5–R7, R15, R19; AC8–AC16, AC22–AC25.

### 14. Data integrity risks

**Material concern exists — Critical / High.** **What could go wrong:** duplicate
canonical keys, stale target routes, truncated rows, orphan owner references,
later path reuse, or ambiguous migration creates two effects or wrong reports.
**Why it matters:** public history drifts and becomes impossible to reconstruct.
**Evidence:** current Pages lack scoped uniqueness; PostgreSQL does not index FKs
automatically; D9 requires append-only route dispositions. **Decision effect:**
requires structural uniqueness, same-scope FKs, indexed references, complete
counts/digests, restrictive delete, and preserved negative history. **Permanent
fix:** D77-R5–R16 plus migration quarantine. **Exact spec language:** D77-R5–R16,
R22; AC6–AC16, AC22, AC29, AC37–AC39.

### 15. Security and privacy risks

**Material concern exists — Critical / Medium-high.** **What could go wrong:**
paths expose a restricted ministry/person, raw queries or callback data enter
logs, an arbitrary target enables phishing, or response differences reveal
historical existence. **Why it matters:** missionary/member-care safety and donor
trust can be harmed even without database access. **Evidence:** Phase 10 treats
URLs as public egress; OWASP/Vercel document open-redirect risks; D9 uses a
non-enumerating envelope. **Decision effect:** minimizes stored/logged detail,
forbids arbitrary/query carry, and permission-filters exact rows/counts.
**Permanent fix:** stable internal refs, owner redaction, no-brand uniform
historical not-found, authorized exports only, and incident tests. **Exact spec
language:** D77-R6, R9, R12–R17, R20–R22; AC8, AC17–AC21, AC26–AC29, AC33–AC36.

### 16. Scalability and performance risks

**Material concern exists — High / Medium.** **What could go wrong:** one query
per owner/route, JSON-blob scans, `OFFSET` paging, client-loaded route universes,
or request-time comparison fails on large Sites and large Tenants. **Why it
matters:** Domain moves stall and public latency regresses. **Evidence:** Supabase
guidance favors batch loading, equality-leading composite indexes, indexed FKs,
and keyset pagination; D1 compilation is off request path. **Decision effect:**
requires sorted set comparison, batched owner reads, keyset detail paging, and
one indexed runtime effect lookup. **Permanent fix:** maximum-shape benchmark and
accepted numeric SLO before activation, not an invented limit in D77. **Exact
spec language:** D77-R5, R7, R15, R21; AC7–AC9, AC32, AC36, AC40.

### 17. Operational burden

**Material concern exists — High / High.** **What could go wrong:** support must
manually map routes, repair SQL, inspect Vercel, or reconcile a crawler whenever
a Tenant moves a Domain. **Why it matters:** self-service becomes fragile tribal
knowledge. **Evidence:** comparable redirect consoles support bulk work because
manual inventories grow; D76 explicitly aims for Tenant self-service. **Decision
effect:** automatic not-found/qualified classification and cause-owned actions
remove normal support work. **Permanent fix:** one registry, self-diagnosing
unknown state, source-owner handoffs, durable receipt, and runbooks for true
platform failures only. **Exact spec language:** D77-R3–R5, R7–R10, R18–R22;
AC3–AC16, AC30–AC40.

### 18. Observability and auditability gaps

**Material concern exists — High / High.** **What could go wrong:** teams cannot
tell an incomplete manifest from zero conflicts, a business route decision from
a worker log, or a safe not-found from wrong target content. **Why it matters:**
diagnosis, correction, and release evidence become guesswork. **Evidence:** D76
requires durable business receipts distinct from technical convergence.
**Decision effect:** records manifest/head/version/effect digests and named
public probes without copying content. **Permanent fix:** durable comparison and
owner receipts plus low-cardinality technical metrics and monitors below.
**Exact spec language:** D77-R14–R15, R19, R21–R22; AC22–AC25, AC35–AC40.

### 19. Dependency and integration risks

**Material concern exists — High / High.** **What could go wrong:** D77 ships on
current mutable Payload/Next routing or assumes unmerged Phase 22/23 contracts;
provider redirect limits/config become product truth. **Why it matters:** the
design would look complete while its authority prerequisites are absent.
**Evidence:** PRs #1323/#1340 remain open/blocked; current Vercel is one shared
project; current Next redirects are host-blind. **Decision effect:** blocks D77
activation until contract reconciliation and provider-no-op proof. **Permanent
fix:** dependency gate, CI route census, shared-project no-mutation test, and
provider drift monitoring. **Exact spec language:** D77-R2–R5, R12–R13, R20,
R22; AC2–AC6, AC17, AC21, AC37–AC39.

### 20. Migration, rollout, and upgrade risks

**Material concern exists — Critical / High.** **What could go wrong:** old code
serves mutable latest while new writers create reservations; migration invents
historical routes from slugs/logs; rollback drops negative effects and revives
reuse. **Why it matters:** mixed versions can violate the very invariant D77
adds. **Evidence:** current code has no authoritative history; D35/Phase 23 use
census, clean target, one-authority cutover. **Decision effect:** reader/adverse-
first rollout and no fabricated positive continuity. **Permanent fix:** expand,
shadow-compile, verify counts/digests, switch one authority, contract old reader,
and preserve history on kill switch/rollback. **Exact spec language:** D77-R2,
R5, R9, R15, R20–R22; AC2, AC10–AC16, AC35–AC40.

### 21. Testability, traceability, and proof

**Material concern exists — High / High.** **What could go wrong:** tests assert
component rows or SQL calls but never prove public outcomes, canonical
collisions, hidden blockers, concurrency, accessibility, or later path reuse.
**Why it matters:** a green implementation could still serve the wrong Page.
**Evidence:** Core governing specs require public-seam/production-shaped proof;
Phase 23 proposes deterministic manifest tests. **Decision effect:** produces
falsifiable R1–R22 and AC1–AC40 tied to ADR/OpenSpec/design/tickets/tests/release
evidence. **Permanent fix:** the complete matrix below plus strict artifact-link
validation. **Exact spec language:** D77-R22; AC1–AC40.

### 22. Other development hazards

**Material concern exists — Critical / Medium.** **What could go wrong:** the
historical not-found envelope becomes a presence oracle, later product copy says
all links are safe, a route census misses build-generated routes, or “temporary”
compatibility becomes permanent dual authority. **Why it matters:** these gaps
evade ordinary Page tests and create difficult repair paths. **Evidence:** D9
requires non-enumeration; Next/framework routing and Vercel behavior can evolve.
**Decision effect:** adds response-uniformity, route-census/version qualification,
copy prohibition, and clean contraction gates. **Permanent fix:** fail unknown,
probe declared envelopes, update the inventory through reviewed code, and never
leave old readers enabled. **Exact spec language:** D77-R2–R6, R13, R20–R22;
AC2–AC9, AC17–AC21, AC35–AC40.

## Exact normative requirements

### D77-R1 — Exact scope and no independent public effect

D77 applies only to the D76 prepared move of one exact current custom hostname
between two Sites of the same Tenant/environment. Preparation, comparison,
review, refresh, cancellation, or advisory evidence MUST create no public route,
redirect, not-found response, Page mutation, provider effect, or Domain change.
Only the later D76 command may activate the pinned complete effect cohort.

### D77-R2 — Honest prerequisite posture

D77 runtime activation MUST remain unavailable until D72–D76 Domain authority,
D15 canonicalization, reconciled Phase 22/23 source-owned route generations, and
the Phase 5 owner-aware router exist. Current Payload latest/slug, raw Navigation
href, Next static redirect, CMS catch-all, cache, Vercel, or log state MUST NOT
be represented as the required authority.

### D77-R3 — One small code-owned critical owner-family registry

D77 MUST reuse the exact versioned D72/D73/D76 registry. Each family declares
stable key/version, route class/precedence, applicability, evidence-head reader,
finite disposition, permission-safe projection, and release fixtures. Critical
families are limited to money/protected effects, auth/authorization/callback,
API/form/provider control, Domain/root/locale/origin/admission, and safety/cache
boundaries. Concrete URLs are manifest entries, not registry families. Only a
reviewed code/test change may add/reclassify a family.

### D77-R4 — Reuse owner ports; no D77 adapter architecture

Every critical outcome MUST arrive through its already registered D73/D76 owner
port. Ordinary Pages MUST arrive through one Public Site Generation manifest
boundary. D77 MUST NOT introduce a plugin SPI, runtime discovery, generic adapter
base, one adapter per Page/feature, tenant-authored family, or second owner
registry.

### D77-R5 — Complete immutable effective-host manifests

Source and target inputs MUST be complete immutable manifests for the exact
Tenant/environment/Site/locale/binding role/public generation. Entries contain
canonical collision key/version, owner/family, stable resource identity,
prior-public/reservation state, method class, effect identity/generation, and
direct/not-found/qualified-successor reference. Content/body/label/similarity/
traffic/search/UI/provider facts MUST NOT become route identity. Missing,
truncated, duplicate, or unverifiable manifests are unknown, never empty.

### D77-R6 — One canonical collision identity

The D15 canonicalizer MUST define host/path/locale/router equivalence including
IDNA, percent encoding, Unicode normalization, case, slashes, trailing slashes,
dot/backslash segments, malformed input, locale base, method class, and aliases.
Query and fragment are not identity. Incompatible versions MUST block unless a
reviewed dual evaluation proves identical coverage and collisions.

### D77-R7 — Pure deterministic comparison

One versioned pure comparator MUST produce the same ordered output/digest under
row-order, pagination, retry, concurrency, worker, and region variation. It MUST
reject ambiguous canonical keys and emit only: critical-owner result,
source-only ordinary, target-only ordinary, exact collision, current qualified
successor, redirect/history conflict, or unknown/incomplete.

### D77-R8 — Critical evidence is an unconditional hard gate

Every applicable family MUST provide one complete current nonblocking typed
outcome. Missing registration/evidence, unknown version, duplicate authority,
contradiction, stale result, hidden detail, or owner block MUST block D76.
Permission filtering changes explanation only; no UI count, cache, provider
success, support/AI assertion, or prior result can mark the family ready.

### D77-R9 — Source-only ordinary addresses compile durable not-found

For every effective source ordinary address absent from the target, Core MUST
compile the owner-declared real not-found effect/reservation into the target
binding generation. Mere absence MUST NOT qualify. Later destination publication
at that path remains unavailable until the route owner publishes a separately
reviewed successor/reuse outcome. Staff MUST NOT disposition these routes one by
one.

### D77-R10 — Target-only ordinary addresses retain target authority

A destination ordinary address with no canonical source/current-or-historical
reservation MAY retain its exact target owner effect. The comparison MUST prove
target-only status from the complete source effective-host manifest; current
source Page lists or traffic cannot prove it.

### D77-R11 — Exact collisions remain unresolved until owner action

An exact source/target ordinary collision MUST NOT silently select the target.
It blocks until the target path changes, the owner publishes a currently
qualified successor, or the destination compiles not-found. D77 cannot add a
“keep destination,” acknowledgement, bulk approval, or staff attestation that
substitutes for the owner contract.

### D77-R12 — Successors and redirects remain source-owned

D77 MAY consume only an already authorized stable internal successor reference
whose Tenant/environment/locale/audience/safety/task/purpose and exact current
target generation satisfy D9 and any stricter owner. A redirect is `GET`/`HEAD`
only, direct to the final internal route, and never carries arbitrary query,
body, cookie, auth, return target, client state, or fragment. Target ineligibility
becomes not-found; Core never follows a chain or guesses another target.

### D77-R13 — Protected route precedence and CI census

Giving, checkout, auth, callbacks, APIs, forms, provider control/result,
protected actions, root/locale roots, sitemap/robots, `/.well-known`, assets,
framework internals, and every registered owner MUST classify before ordinary
content. CI MUST compare the code-owned registry against effective donor App
Router, proxy, static redirect/rewrite, catch-all, API/webhook, and framework-
reserved route families. An unregistered reachable family fails release; the
census is a build guard, never a runtime filesystem resolver.

### D77-R14 — Advisory evidence is useful but never complete authority

Managed internal references required by the current public generation are hard
closure. Sent messages, QR/downloads, exports, analytics, logs, backlinks, ads,
social profiles, search, archives, print, and bookmarks are permission-filtered,
explicitly incomplete advice. The plan MUST keep a separate authority digest and
advisory snapshot/digest. Advisory churn MUST NOT create, suppress, or block a
route unless its source owner separately promotes it into a registered hard
dependency.

### D77-R15 — Immutable comparison bound to D76

The comparison MUST record exact source/target manifest IDs/digests, binding/
public heads, canonicalizer/registry versions, critical heads/results, ordinary
classification/effect digest, qualified successor refs, unresolved exception
identities, authority digest, and separately labelled advisory snapshot. D76
MUST recheck every effect-bearing head/digest before the Moving barrier and
before target admission. Drift produces **Plan changed · Review again**.

### D77-R16 — Source-of-truth and structural database invariants

CMS owners own Page source; route owners own meaning/successors; Public Site
Generation authority owns immutable route manifests/effects; D76 owns cutover;
D77 is derived proof. Logical storage MUST enforce immutable same-scope
relationships, unique canonical effect per binding generation/method class,
owner-qualified refs, preserved negative reservations, complete critical
coverage, restrictive delete, append-only history, and equality-leading indexes
for manifest heads, paths, owner families, exceptions, comparisons, and runtime
effects. Exact physical names/encoding remain design-owned; hot reads/paging MUST
NOT scan unbounded JSON.

### D77-R17 — Authorization, grants, RLS, and privileged parity

Raw manifests/history/protected identities/details MUST be server-private by
default. Tenant projections require current both-Site scope plus resource read
authority, minimum grants, applicable enabled/FORCE RLS, `USING`/`WITH CHECK`,
and immutable scope. Hidden owners remain in the complete server gate without
revealing identity/count/path. Browser/Data API roles receive no authority write.
Views/RPCs/functions/triggers/table owners/BYPASSRLS/service/secret roles/
workers/Payload/import/support/repair/AI MUST repeat exact scope, contract,
expected-head, capability, and attribution checks.

### D77-R18 — Owner-native actions and bounded staff UX

D77 MUST be one **Existing web addresses** section inside the D76 full-page Base
Maia review. It shows critical status, only actionable ordinary conflicts,
collapsed qualified/not-found counts, and explicitly incomplete known places.
Each exception names visitor consequence, owner, and one source action; the move
page edits nothing. Complete/authorized evidence alone yields exact counts;
hidden/incomplete detail yields permission-safe Unknown. No new workflow,
assignment, comments, approval, task, generic retry, CSV, bulk/AI mapping,
wildcard, arbitrary target, HTTP/provider editor, or mandatory checkbox exists.

### D77-R19 — Lifecycle, concurrency, idempotency, and failure

Preparation is side-effect-free. Immutable comparison needs no long row locks.
D76 retains its stable host/Site/public/owner head lock order and CAS. Concurrent
publication, route, locale, owner-registry/canonicalizer, Giving, Domain, proof,
or permission changes yield identical digest, review-again, or block—never stale
carry-forward. Exact semantic replay returns the original result; changed meaning
conflicts. Missing/incomplete/failed comparison is unknown; lost response reloads
the durable result; target ineligibility becomes not-found; post-barrier failure
uses D76's adverse forward reconciliation.

### D77-R20 — One runtime, truthful HTTP, cache isolation, provider no-op

Phase 5's owner-aware router MUST read one indexed current route effect before
CMS content/cache. Public requests MUST NOT compare manifests or query providers.
Historical D77 not-found uses the D9-compatible real `404`, non-enumerating,
no-brand, `no-store` envelope; authority failure uses the neutral no-brand
`no-store` temporary-unavailable envelope. No `200` soft `404`, destination
fallback, wrong-Site flash, interstitial, Asym/Vercel branding, unsafe-method
redirect, or duplicate analytics is allowed. Cache identity includes exact
host/binding/Site/locale/owner/effect/public generations. D77 issues no Vercel/
DNS/TLS/project/redirect/rewrite/bulk/cache/deployment mutation.

### D77-R21 — Bounded performance, observability, and audit

Manifest compilation occurs with owner publication/D1, not in D76 confirmation.
Comparison MUST use bounded set-based ordered work, batch owner reads, no N+1 or
per-route network calls, and keyset detail paging. Public runtime remains one
indexed lookup. Maximum supported routes/locales/owners/collisions/IDNs/hidden
results MUST pass measured capacity and Tenant-fairness evidence against an
accepted numeric SLO before activation. Durable audit stores refs/versions/
digests/outcomes/actor—not content, queries, tokens, raw provider payloads, or
unbounded paths. Technical metrics remain separate from business history.

### D77-R22 — Rollout, upgrade, traceability, and non-goals

Reader/adverse primitives, reconciled Phase 22/23/D9 contracts, D15/D1 manifests,
the single owner registry/census, structural DB/RLS, negative effects, and public-
seam tests MUST land before D77 writers or D76 consumption. Legacy mutable rows/
href/logs/provider/static routes may migrate only as classified evidence; they
cannot fabricate continuity. Shadow comparison precedes cohort activation. Kill
switch/rollback disables new comparisons/moves while preserving readers,
negative reservations, qualified effects, Moving barriers, and history. R1–R22,
AC1–AC40, monitors, ADR, glossary, OpenSpec, design, tickets, tests, and release
evidence MUST remain traceable. A router/crawler/redirect console/pattern DSL/
migration workflow/provider projection/Internet inventory is out of scope.

## Acceptance criteria and proof matrix

### Scope, prerequisites, registry, and manifests

1. **AC1 — Derived only:** preparing/reviewing/canceling D77 changes no public,
   CMS, Domain, provider, route, or owner fact.
2. **AC2 — Honest current state:** current Payload/Next/Vercel code cannot enable
   D77; the dependency gate fails visibly until accepted foundations exist.
3. **AC3 — One registry:** D72–D77 consume the same owner-family registry/version;
   no D77 registry or plugin path exists.
4. **AC4 — Complete route census:** every reachable donor custom-host route
   family has exactly one registered class; adding an unregistered route fails CI.
5. **AC5 — Small-family proof:** concrete Page/address volume does not grow the
   critical registry; an added family requires code review, version, and fixtures.
6. **AC6 — Complete manifests:** exact source/target generations each prove
   complete count/digest; missing/truncated/duplicate input blocks rather than
   reading as empty.
7. **AC7 — Bounded input:** comparison uses immutable manifest/batch reads and no
   mutable latest scan, HTML/log/provider crawl, N+1, or remote call per route.
8. **AC8 — Canonical corpus:** IDN/Unicode/case/encoding/slash/dot/backslash/
   locale/malformed/method aliases collide or separate exactly as D15 declares.
9. **AC9 — Determinism:** randomized row order, pagination, concurrency, worker,
   replay, and region produce byte-identical authority output/digest.

### Outcome algebra and protected meaning

10. **AC10 — Source-only:** every source-only current/historical ordinary path
    compiles one explicit owner-declared not-found effect.
11. **AC11 — Target-only:** a proved target-only path retains its target effect;
    source current-list/traffic absence alone cannot prove target-only.
12. **AC12 — Collision:** different Page identities at one canonical path block;
    neither path order, title, slug, content nor staff acknowledgement selects.
    Only ADR-0199/D78's current exact owner qualification may resolve an
    eligible General Page pair.
13. **AC13 — Later reuse:** publishing a target Page later at a former source-only
    path remains blocked/not-found until a separately accepted owner outcome.
14. **AC14 — Qualified successor:** an already current exact owner relation
    compiles once to its final route with no D77 mutation.
15. **AC15 — Redirect graph:** duplicate, inverse, cached-history, loop, or chain
    conflicts block; every Core-issued fresh redirect targets the final route.
16. **AC16 — Unknown:** owner/manifest/canonicalizer/comparator uncertainty blocks
    and leaves source authority unchanged.
17. **AC17 — Protected precedence:** Giving/checkout/auth/callback/API/forms/
    protected/provider/root/locale/sitemap/robots/`/.well-known` never enter the
    ordinary comparator or inherit destination content.
18. **AC18 — Methods and context:** generic continuity applies only to clean
    `GET`/`HEAD`; no arbitrary query/body/cookie/auth/return/client/fragment data
    affects identity or destination.
19. **AC19 — Real absence:** declared not-found returns real `404`, correct no-
    brand/no-store/non-enumerating envelope, and never `200`, homepage, same slug,
    target Page, or historical explanation.
20. **AC20 — Authority outage:** storage/owner/projection uncertainty returns the
    declared temporary-unavailable response, never false permanent absence or
    favorable content.
21. **AC21 — Provider no-op:** D77 produces zero Vercel/DNS/TLS/project/redirect/
    rewrite/bulk/cache/deployment mutations in shared-project launch.

### Plan, database, authorization, and concurrency

22. **AC22 — Pinned authority:** D76 plan and operation pin/recheck the exact
    manifests, heads, versions, owner results, effects, and authority digest.
23. **AC23 — Drift:** any effect-bearing source/target/owner/canonicalizer/
    permission change yields **Plan changed · Review again** before barrier;
    advisory-only churn remains labelled advice.
24. **AC24 — Concurrency:** route publication, two D76 attempts, owner changes,
    and registry deployment have one winner/current result without deadlock or
    last-write-wins.
25. **AC25 — Idempotency:** exact semantic replay returns the original immutable
    comparison/operation; changed meaning conflicts; lost response never asks
    staff to guess or resubmit a second effect.
26. **AC26 — Both-Site scope:** complete server proof requires exact Tenant/
    environment/both Sites; Domain capability alone reveals no foreign owner
    detail or creates resource authority.
27. **AC27 — Hidden blocker:** restricted/protected outcomes remain in the hard
    gate while unauthorized UI reveals no path/title/identity/count/cause.
28. **AC28 — RLS/grants:** positive and negative tests cover `USING`, `WITH CHECK`,
    SELECT dependency, FORCE RLS, views, functions/RPC, minimum grants, and
    immutable scope.
29. **AC29 — Privileged poison:** service/secret role, table owner, BYPASSRLS,
    worker, Payload, import, support, repair, AI, cache, provider, and direct SQL
    cannot mark an owner ready, retarget scope, or mutate route effects.

### UX, public behavior, scale, migration, and traceability

30. **AC30 — Summary-first UX:** blocked/ready/unknown states show the exact
    consequence, complete critical status, actionable exceptions, qualified and
    not-found counts, and incomplete-advisory label without infrastructure jargon.
31. **AC31 — Quiet success:** zero blockers shows a calm ready summary and no
    mandatory route table, acknowledgement, second dialog, or “all links safe”
    promise.
32. **AC32 — Large lists:** blockers load first; authorized details use stable
    keyset paging/search and retain URL/filter/position without full client load,
    OFFSET degradation, or screen-reader-hostile virtualization requirement.
33. **AC33 — Accessibility:** 320px, 400% zoom, keyboard, screen reader, visible
    focus, forced colors, reduced motion, 44px targets, long localization, RTL,
    IDN/path wrap/copy, error summary, and focus return pass.
34. **AC34 — Weak network/resume:** refresh, back, expired session, duplicate
    action, slow status, owner handoff, and lost acknowledgement reopen the same
    durable review with truthful last-known state.
35. **AC35 — Public seam:** before barrier source remains complete; during D76
    uncertainty only adverse response is possible; after admission every tested
    source-only/collision/protected/qualified/target-only request matches the
    compiled exact generation with no wrong-Site flash.
36. **AC36 — Cache/metadata:** stale source cache, SW/client state, global
    canonical, sitemap/`hreflang`, analytics, and host-only key cannot override
    binding/route/public generation or produce mixed response.
37. **AC37 — Migration:** current mutable slugs/hrefs/static routes/logs migrate
    only as quarantined/classified evidence; no history/equivalence is invented.
38. **AC38 — Mixed versions/kill:** old-code/new-schema and new-code/old-schema
    matrices fail safely; kill switch preserves negative/qualified readers,
    barriers, and history while blocking new work.
39. **AC39 — Traceability:** decision log, glossary, ADR-0198, governing docs,
    consolidated OpenSpec, design, tickets, tests, and release proof contain no
    contradictory owner, state, count, response, redirect, or provider wording.
40. **AC40 — Production shape:** the accepted maximum routes/locales/owners/
    collisions/IDNs/hidden results meets measured comparison, paging, public-
    lookup, Tenant-fairness, and D76 preparation SLOs without weakening complete
    proof.

## Source-of-truth map and domain invariants

| Fact                                              | Authoritative owner                                      | Derived consumer                   | Forbidden authority                       |
| ------------------------------------------------- | -------------------------------------------------------- | ---------------------------------- | ----------------------------------------- |
| Ordinary Page identity/content/placement revision | Phase 23 Page/CMS source owner                           | D1 compiler and staff Page surface | D76 UI, D77 comparator, provider          |
| Current public route manifest/effects             | D1/Public Site Generation and registered route owners    | D77, Phase 5 router projection     | Mutable Payload latest, cache, Vercel     |
| Critical owner-family catalog                     | Versioned code-owned D72–D77 registry                    | owner compiler/CI/review           | Tenant setting, DB admin row, plugin, AI  |
| Critical disposition                              | Exact source owner                                       | D77/D76 hard gate                  | Domain move, UI status, support/provider  |
| Ordinary successor/not-found reservation          | Ordinary route owner under D9/Phase 23                   | public manifest/router             | D77 heuristic, staff checkbox, similarity |
| Issued Giving Address reservation                 | Giving/shared route authority                            | critical result/runtime            | Page/Domain owner                         |
| D77 comparison                                    | Pure immutable derived artifact                          | D76 plan and permission-safe UX    | public resolver or owner write authority  |
| Known placement                                   | Its source/advisory projection                           | staff guidance                     | route safety/completion proof             |
| Domain cutover                                    | D76/Operational Domain authority                         | public admission projection        | comparator, CMS, Vercel                   |
| Runtime response                                  | Phase 5 owner-aware router over exact current generation | browser/CDN                        | Next static redirect, Payload plugin      |

Invariants that must always hold:

1. one canonical effective host/path/method effect is favorable at most once;
2. every applicable critical owner contributes exactly one current complete
   result before readiness;
3. every effective source ordinary address has exactly one target-generation
   outcome;
4. source-only history remains negatively reserved until an owner successor;
5. no protected owner is classified or overridden as ordinary content;
6. no favorable successor targets a raw/external/cross-scope/ineligible route;
7. the D77 artifact never authors source truth or public effect;
8. advice can never satisfy, suppress, or widen authority;
9. a complete move binds one exact authority digest and all effect-bearing heads;
10. unknown is adverse; absence is favorable only when explicitly proved; and
11. history, receipts, and reservations are append-only/restrictively deleted.

## Exact staff experience

### Location and hierarchy

D77 does not add a page or workspace. It adds one section to D76's existing
full-page review after source/destination role consequences and before **What
changes**:

> **Existing web addresses**  
> Core checked the current addresses it manages for Field Stories and Main
> Website. This does not include every bookmark, printed QR code, backlink,
> browser cache, sent message, search result, or external campaign.

When blocked:

> **2 issues must be resolved before this domain can move.**

Use a compact text list, not statistic cards:

- **Critical addresses:** 1 needs another owner
- **Ordinary Page conflicts:** 1 needs review
- **Continuity already prepared:** 3 addresses
- **Former addresses:** 148 will show Page not found
- **Known places to update:** 4 currently recorded · incomplete list

Primary section action: **Review 2 issues**. Safe/qualified/advisory sections are
collapsed by default; only **Blocks the move** and **Ordinary Pages to review**
open. When ready:

> **Web addresses are ready for this move.**  
> Every critical owner has a current outcome. Three ordinary addresses already
> have approved continuity; 148 former addresses will safely show Page not found.

Do not say **all links migrated**, **nothing will break**, **100% complete**,
**zero broken links**, or imply Internet inventory.

### Exception rows and source handoffs

Authorized ordinary collision:

> **`/about` · Different Page at this address**  
> Field Stories and Main Website publish different Pages here. Core will not
> decide that they serve the same visitor purpose.  
> **Review Page continuity**

Protected owner example:

> **`/give/water` · Protected Giving address**  
> This address cannot begin a different gift after the move. Its Giving owner
> must provide the exact current outcome.  
> **Review Giving address**

Permission-safe example:

> **A protected address needs another owner**  
> An authorized staff member for that address must resolve it before the domain
> can move.

The permission-safe state reveals no exact path, title, purpose, identity, count,
or hidden Site. Domain access never grants Page/Giving/auth detail. The source
action opens the exact existing owner surface and carries no authority token.
After owner commit, returning to D76 focuses the row's current status and shows
**Checking the updated web address**; resolution comes from new source proof, not
a toast or **Mark fixed** control.

### Large inventories

- Load summary and blockers first.
- Use stable server-side keyset pagination and exact normalized-path search for
  authorized detail; preserve cursor/filter in the URL.
- Show safe not-found routes only after **View Page-not-found addresses**.
- Group only canonical router-equivalent aliases under one disclosed effect;
  never group by wording, title, proximity, or presumed meaning.
- Use stacked rows/cards on mobile rather than a multi-column matrix.
- Load Page preview only on request; the route decision never depends on an
  image-heavy or JavaScript-heavy preview.
- Launch has no CSV export. A future export would need separate privacy,
  freshness, authorization, formula-injection, and shadow-authority proof.

### Durable states and copy

| State                       | Exact staff copy                                                            | Behavior                                                              |
| --------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Checking web addresses      | **Core is checking current route owners. You can leave this page.**         | Durable read work; no Move action.                                    |
| Needs attention             | **2 current issues must be resolved before this domain can move.**          | Show cause-owned actions; source remains authoritative.               |
| Ready                       | **Every critical address has a current outcome.**                           | D76 may proceed only while digest remains current.                    |
| Plan changed · Review again | **A Page, locale, redirect, or protected route changed after this review.** | Clear only affected choices; show concise before/current consequence. |
| Status unavailable          | **Core couldn't prove the current web-address state. Nothing moved.**       | Block; never infer zero, not-found, or continuity.                    |
| Another owner changed this  | **This issue changed while you were reviewing it.**                         | Reload exact current owner result; no last-write-wins.                |

The final D76 consequence summary repeats critical readiness, unresolved count
zero, qualified continuity count, Page-not-found count, and incomplete known-
placement warning. No separate dialog or acknowledgement checkbox is added.

### Accessibility, localization, and weak-network proof

- Initial focus remains D76's page title; **Review issues** moves focus to the
  section heading; submission errors focus one summary then the exact row/action.
- Return from an owner surface restores the exact row and announces only the
  meaningful verified transition through one polite live region.
- At 320 CSS pixels/400% zoom, all content/actions remain available without page-
  level horizontal scrolling; a local two-dimensional exception is not needed.
- Technical paths use LTR/isolate, safe Unicode plus canonical ASCII where
  relevant, full wrapping/copyability, and no meaning-only truncation.
- Visible text and semantics accompany every icon/color/status; forced colors,
  reduced motion, screen reader, keyboard, and 44px touch targets pass.
- Refresh, browser Back, weak network, session expiry, duplicate click, and lost
  response resume one durable review after fresh authorization.

## Public, donor, and browser truth

- D77 creates no public behavior before D76.
- Before D76's barrier, every request uses the complete source binding/public/
  route generation.
- During the acknowledged Moving barrier, uncertain cohorts receive only the
  neutral no-brand, `no-store` temporary-unavailable response.
- After target admission, every request resolves through the exact target
  binding/public/route-effect generation before content/cache.
- An owner-declared source-only/historical absence returns a real, no-brand,
  non-enumerating, no-store `404`; it never reaches a target Page/homepage.
- A protected Giving address never begins checkout or a different gift; auth,
  callback, API, form, and other unsafe routes never receive generic continuity.
- Only a current owner-qualified ordinary successor may serve or redirect. A
  redirect is one direct server response to the final internal route for clean
  `GET`/`HEAD`, with no arbitrary context carry or chain.
- Authority failure is temporary unavailable, not a false `404` or success.
- Canonical, sitemap, `hreflang`, internal links, metadata, analytics, and caches
  use only the exact complete new generation.
- No response shows Asym/Vercel branding, a wrong-Site flash, duplicate
  analytics, or stale Site/binding-scoped cookie/session/client authority.
- Gifts, recurring commitments, designations, currencies, schedules, Stripe,
  ledger, settlement, receipts, tasks, and pre-admitted operations retain their
  independently frozen source facts; D77 changes none.

## Required monitors

| Signal                                               |                                                         Threshold | Owner                         | Required response                                                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------------: | ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| `public_route_owner_unregistered_total`              |                                                               Any | Public Runtime + Security     | Block build/release/move; register the family and add public-seam fixtures.                            |
| `domain_move_critical_owner_missing_total`           |                                          Any ready/commit attempt | Domain Platform + exact owner | Keep source live and move blocked; repair registry/evidence rather than override.                      |
| `domain_move_route_manifest_incomplete_total`        |                                                    Any comparison | D1/Page Platform              | Mark status unavailable; rebuild the exact generation; never treat as empty.                           |
| `domain_move_route_manifest_digest_mismatch_total`   |                                    Any at barrier/final admission | Domain + Page Platform        | Review again before barrier or retain adverse barrier and reconcile exact heads.                       |
| `domain_move_source_only_favorable_response_total`   |                                                               Any | Public Runtime + Security     | P0; fence hostname/path cohort, disable D77/D76 writers, repair projection, preserve evidence.         |
| `domain_move_unreviewed_collision_favorable_total`   |                                                               Any | Page Platform + Security      | P0; adverse-fence the effect and reconcile comparator/owner heads.                                     |
| `domain_move_protected_route_reinterpretation_total` |                                                               Any | Exact owner + Security        | P0; contain route/downstream effect and perform money/identity incident reconciliation.                |
| `domain_move_redirect_loop_or_chain_total`           |                                         Any loop or Core chain >1 | Page + Public Runtime         | Withhold/fence effect; publish one direct correcting owner successor.                                  |
| `domain_move_route_response_envelope_variance_total` |                          Any forbidden history-dependent variance | Privacy + Public Runtime      | Disable affected response, unify no-brand envelope, investigate disclosure.                            |
| `domain_move_exception_false_zero_total`             |                                                               Any | Site Product + D1             | Block affected moves; repair complete-count/permission projection and regression tests.                |
| `domain_move_route_compare_duration`                 |                            First accepted p99 capacity-SLO breach | D1/Page Platform              | Pause cohort; inspect batch/index plan and Tenant fairness without weakening completeness.             |
| `domain_move_route_review_completion_rate`           |         `<80%` within 24h with at least 20 eligible starts in 30d | Site Product/UX               | Research blocker comprehension/handoffs; improve copy/source actions; never waive safety.              |
| `domain_move_known_404_rate`                         | `>2x` seven-day baseline for 15 minutes and at least 100 requests | Site Product + Public Runtime | Surface prioritized authorized source paths; let owners add exact successors, never homepage fallback. |
| `domain_move_provider_route_mutation_total`          |                                      Any at shared-project launch | Hosting Platform + Security   | Fence affected cohort, reconcile Vercel state, disable adapter path, audit credentials/change source.  |

All numeric thresholds above are explicit Core product/operations judgments, not
Google, Vercel, Supabase, or nonprofit-sector SLAs. Capacity SLO must be measured
and accepted in design rather than fabricated in this grooming decision.

## Ruthless synthesis

### Must be resolved before recording

Resolved by ADR-0198 and this review:

1. Accept Option 1 only as an exception-led derived review, never a route owner.
2. Define “reuse” as future reuse of the one D73/D76 registry and D1 manifest,
   not a claim about current runtime.
3. Remove D77-specific adapters and keep the critical inventory owner-family
   sized, code-owned, versioned, and CI-censused.
4. Make source-only not-found durable so later target publication cannot reuse
   history silently.
5. Separate authority digest from incomplete advisory placement snapshot.
6. Block different-Page cross-Site collisions unless ADR-0199/D78's exact
   General Page owner qualification exists and is current.
7. Pin Base Maia summary-first UX, no provider mutation, exact response behavior,
   database/RLS invariants, proof, and monitors.

### Must enter consolidated OpenSpec and design before ticketing

1. D77-R1–R22, AC1–AC40, the source-of-truth map/invariants, staff/public copy,
   14 monitors, and D78 outcome.
2. Reconciliation of D9 with proposed Phase 22 ADR-0125 and Phase 23 ADRs
   0145–0147; same-Site/query behavior cannot silently govern cross-Site D77.
3. Exact critical owner-family registry/version/result taxonomy, build route
   census, owner-port contract, and missing/unknown policy.
4. D15 canonical collision corpus and upgrade/dual-evaluation contract.
5. Immutable effective-host manifest/effect/comparison logical schema,
   constraint/FK/index plan, authority/advisory digest boundary, and runtime read
   model. Physical names remain design-owned.
6. Grants/RLS/privileged-path matrix, redaction/non-enumeration, retention/export/
   backup/log rules, and D30 diagnostics boundary.
7. Numeric maximum/SLO from production-shaped capacity evidence, Tenant fairness,
   keyset paging, and failure/reconciliation runbooks.
8. Base Maia PageShell IA, localization, mobile/a11y/weak-network behavior, owner
   handoff focus, and representative staff comprehension evidence.

### Required implementation order

1. Ratify/reconcile Phase 22 and Phase 23 route/public-generation contracts; land
   D15 and the Phase 5 owner-aware routing boundary.
2. Land immutable source-owner route manifests/effects and source-only negative
   reservations; deploy public negative/unknown readers first.
3. Build the single D72/D73 owner-family registry/ports and CI route census;
   remove/fence current host-blind static redirects and mutable fallbacks.
4. Build the pure comparator and private comparison/read projection; shadow-
   compile representative and maximum-shape manifests without public effect.
5. Prove database constraints, grants/RLS/privileged poison paths,
   canonicalization, deterministic/replay/race behavior, public response/caches,
   provider no-op, migration/mixed-version/kill-switch, and capacity.
6. Implement and usability-test the one D76 **Existing web addresses** section,
   owner-native handoffs, durable resume, accessibility, and public fixtures.
7. Enable D77 review, then D76 consumption for one production cohort; expand only
   after monitors show zero safety violations and staff completion/comprehension
   is acceptable.

### Monitor only

Only advisory external-placement churn, post-cutover ordinary `404` demand, and
measured staff/scale friction may remain monitor items—and only through the
signals, thresholds, owners, and responses above. Wrong Tenant/Site, false zero,
missing critical owner, unreviewed collision, protected reinterpretation,
favorable source-only response, redirect loop/chain, response oracle, digest
mismatch at commit, or Vercel route mutation is an incident/blocker, not accepted
residual risk.

## D78 reconciliation (2026-08-31)

ADR-0199/D78 now defines the only different-Page exception D77 may consume. One
authorized Page owner may qualify one exact former General Page address to one
different current General Page only after hard same-scope/locale/audience/
safety/public-generation proof and explicit comparison of the exact public
releases for the same subject, substantive purpose, and visitor task. The
relation is directional, non-transitive, revision-bound, stable-Page referenced,
and never inferred from copy provenance, path/title/content, analytics, search,
or AI.

D77 remains a pure consumer. It cannot create, edit, carry forward, or infer the
qualification. Missing, stale, rejected, Article/specialized, protected,
cross-scope, or permission-hidden proof remains block/not-found. A target
Primary may serve the same path directly; redirect-only Domain roles compose
one direct final owner result to the Primary. D78 creates no Vercel rule,
resolver, redirect table, workflow, Page merge, or money effect. ADR-0200/D79
retains exact revision proof before cutover and governs later changed effective
Page meaning-bearing dependency digests through one explicit opaque Page Purpose
Continuity Version. D80 never advances that source head; a declared material
change continues as a fresh private Page with no D78/D79 inheritance.

## Exact corrected decision

> Before one D76 same-Tenant Site Domain cutover, Core performs a **Domain Move
> Route Review**. Every applicable family in Core's small, versioned, code-owned
> D72–D77 critical-path inventory must supply one complete current nonblocking
> owner outcome; unknown, hidden, stale, missing, contradictory, or unregistered
> authority blocks. D77 adds no owner adapter framework: it reuses the one D73/
> D76 owner port, while ordinary Pages arrive through complete immutable source
> and destination effective-host manifests compiled by Public Site Generation
> authority.
>
> One pure canonical comparison classifies source-only, target-only, exact
> collision, already owner-qualified successor, redirect/history conflict, and
> unknown outcomes. Staff act only on unresolved exceptions. Source-only former
> addresses automatically compile a durable real not-found effect into the new
> binding generation, so a later target Page cannot silently reuse their public
> meaning. An exact different-Page collision never selects the destination by
> path, slug, content, similarity, or acknowledgement; it remains blocked/not-
> found until the ordinary route owner publishes an accepted successor or the
> destination changes path.
>
> The D76 plan pins the comparison's authority digest and all effect-bearing
> heads and rechecks them before the Moving barrier and target admission.
> External placements remain a separately labelled incomplete advisory snapshot.
> Phase 5's one owner-aware router consumes the compiled current effects before
> content/cache; D77 creates no resolver, redirect console, workflow, crawler,
> pattern DSL, provider rule, query/body/cookie carry, money effect, or Vercel/
> DNS/TLS mutation.
>
> D76's existing full-page Base Maia review contains one compact **Existing web
> addresses** section: critical status, actionable exceptions, collapsed
> qualified/not-found counts, and incomplete known places. Complete authorized
> evidence alone yields counts; hidden/incomplete evidence is never zero. Each
> issue opens its source owner, and the move becomes ready only after current
> proof. Public uncertainty fails adverse; no address receives unrelated content,
> an Asym/Vercel page, or a soft `404`.

## Documentation and evidence references

- [ADR-0198](../../adr/0198-critical-path-gated-exception-led-domain-move-route-review.md)
- [ADR-0199](../../adr/0199-owner-qualified-exact-ordinary-page-succession.md)
- [D78 owner-qualified Page successor review](./phase-24-d78-owner-qualified-ordinary-page-successor-adversarial-review.md)
- [ADR-0197](../../adr/0197-prepared-same-tenant-site-domain-cutover.md)
- [D9 retired-address review](./phase-24-d9-retired-address-disposition-adversarial-review.md)
- [D10 Issued Giving Address review](./phase-24-d10-issued-giving-address-reservation-adversarial-review.md)
- [D15 Site Locale public-base review](./phase-24-d15-explicit-site-locale-public-base-adversarial-review.md)
- [Phase 5 public website runtime](./phase-05-public-website-runtime-contract.md)
- [Web Studio living specification](../../guides/architecture/web-studio-living-spec.md)
- [Google site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Google crawl/soft-404 guidance](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)
- [Vercel rewrites](https://vercel.com/docs/routing/rewrites)
- [Vercel redirect security](https://vercel.com/kb/guide/enhancing-security-for-redirects-and-rewrites)
- [OWASP redirect guidance](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)
- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
