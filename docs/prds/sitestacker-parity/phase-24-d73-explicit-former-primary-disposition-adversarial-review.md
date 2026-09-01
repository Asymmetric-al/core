# Phase 24 D73 — Explicit former-primary website disposition adversarial review

**Date:** 2026-08-30  
**Founder answer reviewed:** Option 1 — explicit per-change choice, conditioned
on current modern practice, Vercel behavior, edge-case safety, and excellent
staff/Tenant/donor UX.  
**Final disposition:** **Accept with required amendments.**  
**Recorded decision:** [ADR-0194](../../adr/0194-explicit-former-primary-website-disposition.md)

## Executive verdict

Explicit choice is the best Core product rule even though it deliberately
differs from mainstream hosted-CMS defaults. Shopify, Squarespace, Wix, and
WordPress.com generally make the former Primary redirect automatically. That
makes continuity the well-supported recommendation for an ordinary rebrand, but
not a safe mandate for a missions organization whose domain change may need to
avoid creating a new public identity link.

The informal answer needs four material corrections:

1. every exact Primary change—including apex/`www`—requires the reviewed choice
   until redirect/cache history proves a separately accepted shortcut safe;
2. **Redirect eligible website visits** replaces “keep old links working,” which
   overpromises route-owner behavior;
3. **Stop website use on the old domain** stops only the Site website role and
   cannot promise erasure or complete identity separation while independently
   owned routes or external evidence remain; and
4. the transition is one generation-safe Core successor command, not a Vercel
   primary switch, provider redirect, field update, deployment rollback, or
   best-effort sequence.

This is not overengineering. It is one required two-option choice on a rare,
high-consequence action, backed by the Domain/public-generation authority D72
already requires. D73 adds no scheduler, expiry engine, arbitrary redirect map,
URL crawler, approval workflow, provider dashboard, or new public resolver.

## Current behavior, intended behavior, and permanent path

| Layer                         | Verified current/repository state                                                                                                                                                   | D73 intended behavior                                                                                             | Permanent path                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Runtime host lookup           | `resolveTenantFromRequest` reads `x-forwarded-host`/`host`, queries one nullable nonunique Payload Tenant `primaryDomain` with `overrideAccess: true`, and can use a slug fallback. | One exact host resolves through D72's Tenant/environment/Site/role generation.                                    | Trusted hosting-adapter hostname plus one adverse-first operational Domain projection.                     |
| Site context                  | `PublicRequestContext.siteId` is `null`; current source has no Site-domain aggregate or primary-change command.                                                                     | Every changed domain and route pins exact Site scope.                                                             | Phase 2/5/D72 readers and constraints must land before D73 writers.                                        |
| Generated origin              | Donor metadata uses global `siteConfig.url`; static redirects are host-blind.                                                                                                       | Primary, locales, canonicals, `hreflang`, sitemaps, feeds, social/share URLs, and cache closure advance together. | One D1/D66-compatible public-origin successor cohort under expected heads.                                 |
| Domain state                  | No operational Domain relation, role generation, former disposition, or provider integration exists.                                                                                | One Primary before/after; former website role is explicitly Redirect or stopped.                                  | ADR-0193/0194 relational generations, receipts, outbox, and convergence.                                   |
| Vercel                        | No product Domains API integration exists. Vercel project domains independently serve production unless redirected/assigned otherwise.                                              | Vercel supplies attachment/DNS/TLS/provider evidence only.                                                        | Core route-aware redirect; no Vercel whole-domain redirect or automatic force/detach.                      |
| Search and external artifacts | No Site-domain move product exists. Search, backlinks, QR codes, printed material, and archives are external or source-owned.                                                       | Show known consequences without claiming a complete Internet inventory.                                           | Finite hard-gate registry plus bounded advisory evidence; no URL crawler.                                  |
| Formal authority              | D72 is accepted documentation intent; active OpenSpec has no D72/D73 scenarios. Phase 23 PR #1340 was reverified `OPEN/BLOCKED` on 2026-08-30.                                      | D73 is groomed intended behavior, not shipped behavior.                                                           | Consolidate Phase 24 OpenSpec and reconcile accepted Phase 23 generation authority before tickets/runtime. |

Current repository evidence:

- [`resolve-tenant.ts`](../../../apps/admin/src/cms/public/resolve-tenant.ts)
- [`tenants.ts`](../../../apps/admin/src/cms/collections/tenants.ts)
- [`context.ts`](../../../packages/api/src/cms/public/context.ts)
- [`metadata.ts`](../../../packages/lib/seo/metadata.ts)
- [`apps/donor/next.config.ts`](../../../apps/donor/next.config.ts)
- [`apps/donor/app/layout.tsx`](../../../apps/donor/app/layout.tsx)

The branch and freshly fetched `origin/develop` both resolved to
`7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. PR #1340 remained open and blocked.

## Verified current external evidence

| Source                                                                                                                                          | Verified current practice                                                                                                                                                                                                      | D73 use                                                                                                               | Boundary retained                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [Vercel domain deployment and redirects](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting)                        | A configured project domain is applied to the latest production deployment; Vercel recommends `www` with apex redirect and states domain redirects are browser-cached.                                                         | Proves readiness must precede Core activation and cached provider redirects are unsuitable for reversible Core roles. | Vercel does not own Core Primary/disposition.                                 |
| [Vercel custom-domain setup](https://vercel.com/docs/domains/set-up-custom-domain)                                                              | Apex and `www` are added separately; `--force` can reassign a domain already on another project; DNS and certificate proof converge asynchronously.                                                                            | Requires explicit companion handling, no force, and proof before review.                                              | Provider commands never become Tenant authority.                              |
| [Vercel troubleshooting](https://vercel.com/docs/domains/troubleshooting)                                                                       | DNS/CAA/TLS can fail or vary by region; `/.well-known` is provider-reserved.                                                                                                                                                   | Provider paths run before Site website disposition.                                                                   | Core does not rewrite provider control paths.                                 |
| [Vercel project-domain API/webhooks](https://vercel.com/docs/webhooks/webhooks-api)                                                             | Project domain state exposes redirect target/status and domain-updated/unverified events.                                                                                                                                      | Adapter reconciliation and drift detection.                                                                           | Webhooks are observations, not product commands.                              |
| [Vercel domain removal](https://vercel.com/docs/domains/working-with-domains/remove-a-domain)                                                   | Project removal and account/domain removal are distinct operations.                                                                                                                                                            | D73 stops a website role without detaching or unregistering the hostname.                                             | Provider disconnection is a later lifecycle decision.                         |
| [Google site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)                                     | Prepare/test first; map equivalent URLs; use direct server-side `301`/`308`; avoid chains/homepage collapse; update canonicals/internal links/`hreflang`/sitemaps; keep redirects at least one year and possibly indefinitely. | Makes retention the recommendation and supplies exact move proof.                                                     | Search recrawl never authorizes or completes the command.                     |
| [Shopify primary domain](https://help.shopify.com/en/manual/domains/domain-type/change-primary-domain)                                          | Connected secondary domains redirect after a Primary change.                                                                                                                                                                   | Mainstream continuity evidence.                                                                                       | Shopify's automatic policy does not override ministry privacy.                |
| [Squarespace primary domain](https://support.squarespace.com/hc/en-us/articles/205812368-Setting-a-primary-domain)                              | Former/secondary domains automatically `301` to the Primary, but its standard behavior redirects only to the root and drops deeper paths.                                                                                      | Proves the primary/secondary mental model and exposes a UX weakness Core must avoid.                                  | Core keeps owner-proved equivalent paths and truthful missing-route outcomes. |
| [WordPress.com primary address](https://wordpress.com/support/domains/set-a-primary-address/)                                                   | All other connected domains redirect to the selected Primary; DNS/SSL may take up to 72 hours.                                                                                                                                 | Supports continuity and pre-proof rather than premature promotion.                                                    | Core blocks before commit instead of asking staff to switch back.             |
| [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) and [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html)                             | `301`/`308` are permanent and heuristically cacheable; explicit `no-store` prohibits conforming caches from storing the response.                                                                                              | Route-specific status plus containment-safe cache policy.                                                             | Existing external/browser caches cannot be recalled.                          |
| [GOV.UK radios](https://design-system.service.gov.uk/components/radios/) and [W3C Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) | A required choice may begin unselected; visible grouping, labels, descriptions, keyboard behavior, and errors are essential.                                                                                                   | One explicit, accessible, nonpreselected choice.                                                                      | External visual styling does not replace Base Maia/Base UI.                   |

Installed Next.js `16.3.0-preview.9` documentation confirms request-time helpers
support `307`/`308`, static redirects run before the request proxy, and Vercel's
static redirect list is limited to 1,024. D73 therefore consumes the one D72
host/router projection instead of generating a provider/static rule per domain.

## Facts, judgments, assumptions, and unresolved unknowns

### Verified facts

- Current Core cannot perform D73 safely; it has no Site role generation,
  public-origin cohort, route-owner impact manifest, or Domains provider adapter.
- D16 already requires the mutable Site Root Entry to use `307`, `no-store`, and
  one direct final explicit-locale destination.
- D9–D15 already prohibit generic movement of Giving/checkout/address meaning.
- Provider, browser, search, DNS, TLS, and external artifacts cannot join one
  authoritative transaction.

### Product judgments

- Continuity is the recommended answer but not a universal default.
- One unselected RadioGroup is proportionate for a rare public-identity change.
- Apex/`www` does not earn an automatic exception: prior cached inverse redirects
  can still loop, and the founder explicitly selected per-change choice.
- The UI says **Not used for website** while any source-owned public route may
  remain. **Not public** is reserved for complete owner proof of no favorable use.
- Known external placements are advisory and explicitly incomplete; Core does
  not build an Internet crawler.

### Assumptions requiring representative evidence

- Some missions organizations will have both routine rebrands and safety-driven
  identity changes. This is plausible, not measured product research.
- Staff can understand “website visits” versus independently governed Giving or
  protected addresses when copy and impact summaries are tested.
- A focused route-addressable review with Base Maia components is sufficient;
  desktop Sheet versus full-page presentation remains usability-evidence-owned.

### Unresolved unknowns outside D73

- Exact supported custom-domain catalog limits remain capacity/profile-owned.
- ADR-0195/D74 now governs the later owner-cleared, adverse-first, provider-
  readback-confirmed self-service disconnection; D73 itself never detaches.
- Search Console automation, domain registration, DNS hosting, and registrar
  operations remain outside current Phase 24 authority unless separately chosen.

## Ruthless category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.** **What could go wrong:** automatic retention can
create an unsafe public identity link, while automatic stop breaks ordinary
links and search continuity. **Why it matters:** both are realistic Tenant jobs
and neither can be inferred from provider state. **Severity: High. Likelihood:
Medium-high. Evidence/reasoning:** mainstream products retain automatically,
while Core's missions context and D9–D15 make universal behavior unsafe.
**Decision effect:** validates explicit choice with retention recommended.
**Permanent fix:** one unselected website-disposition choice on every exact
Primary successor. **Exact spec language:** D73-R1–R5; AC1–AC8.

### 2. Brittleness

**Material concern: Yes.** **What could go wrong:** mutable strings, separately
updated domain rows, cached inverse redirects, mixed edge generations, or a
provider redirect can create zero/two primaries, loops, or stale origins. **Why
it matters:** a primary change touches every public URL and can be sticky in
browsers/search. **Severity: Critical. Likelihood: High. Evidence/reasoning:**
Vercel says redirects are browser-cached; current Core lacks generations/CAS.
**Decision effect:** rejects field/provider sequencing and automatic apex/`www`
swaps. **Permanent fix:** one immutable Domain/public-origin successor cohort,
cache-history compatibility, mismatch fences, and readback. **Exact spec
language:** D73-R3, R5–R6, R10–R13; AC9–AC18, AC30–AC34.

### 3. Technical debt

**Material concern: Yes.** **What could go wrong:** D73 could add a migration
wizard, per-path redirect store, external-link crawler, Vercel dashboard clone,
or shadow primary state. **Why it matters:** each duplicates D72/D1/D66 and
expands every future route owner. **Severity: High. Likelihood: High.
Evidence/reasoning:** the required inputs already have authoritative owners;
external artifacts cannot be exhaustively discovered. **Decision effect:**
narrows D73 to one disposition field in the existing successor command and a
finite hard-gate registry. **Permanent fix:** derive destinations/impacts; no
arbitrary rules or crawler. **Exact spec language:** D73-R2, R5–R7, R14, R17–R18;
AC4–AC7, AC19–AC24, AC35–AC40.

### 4. Edge cases

**Material concern: Yes.** **What could go wrong:** apex/`www`, IDNs, prior
cacheable redirects, several current Redirect domains, changed Default Site
Locale, suspended/retired/private Sites, lost TLS, transferred ownership,
missing paths, stale source routes, or regional DNS can invalidate the review.
**Why it matters:** these conditions are normal domain lifecycle events.
**Severity: Critical. Likelihood: High. Evidence/reasoning:** D16 root is
mutable, DNS/TLS are asynchronous, and Vercel/provider roles can drift.
**Decision effect:** removes implicit exceptions and adds a full state/route/
history matrix. **Permanent fix:** fresh candidate and impact proof plus exact
negative tests. **Exact spec language:** D73-R1–R3, R6–R11, R13–R18; AC1–AC40.

### 5. Footguns

**Material concern: Yes.** **What could go wrong:** preselecting retention,
calling stop a clean break, using `--force`, deleting the Vercel domain, treating
rollback as Undo, copying every query, or reversing a cached redirect can cause
public harm. **Why it matters:** these actions are easy to trigger and hard or
impossible to recall. **Severity: Critical. Likelihood: High.
Evidence/reasoning:** Vercel exposes force/removal/redirect controls and HTTP
permanent redirects are cacheable. **Decision effect:** makes every effect
server-derived, unselected, scoped, and separately authorized. **Permanent fix:**
closed command, precise copy, route/cache history proof, and provider denylist.
**Exact spec language:** D73-R1, R4, R7–R13, R15–R18; AC3–AC8, AC13–AC28,
AC33–AC40.

### 6. Tenant safety

**Material concern: Yes.** **What could go wrong:** a stale candidate, spoofed
host, cross-Site binding, hidden owner route, or provider reassignment may serve
or redirect another Tenant. **Why it matters:** that is a cross-Tenant public
breach, not a cosmetic redirect error. **Severity: Critical. Likelihood:
Medium-high. Evidence/reasoning:** current lookup is Tenant-only and
`overrideAccess: true`; D72 authority is not implemented. **Decision effect:**
blocks D73 until D72's exact scope/host authority exists. **Permanent fix:**
global host uniqueness, complete same-scope relationships, trusted hosting
adapter, permission-filtered impacts, and hostile cache tests. **Exact spec
language:** D73-R2–R3, R5, R8, R12–R18; AC1–AC6, AC9–AC12, AC25–AC40.

### 7. Database, RLS, and authorization safety

**Material concern: Yes.** **What could go wrong:** a caller can submit Tenant,
Site, actor, disposition, provider IDs, or new head independently; an allowed
row update can move scope; service paths can bypass RLS; separate commits can
expose invalid cardinality. **Why it matters:** primary change is a protected
multi-table public-origin effect. **Severity: Critical. Likelihood: High.
Evidence/reasoning:** current physical authority does not exist and Supabase
service roles bypass RLS. **Decision effect:** requires command-only immutable
successors and a structural transaction. **Permanent fix:** same-scope keys/FKs,
restrictive history, expected heads, minimal grants, operation-correct policies,
FORCE RLS where applicable, and privileged poison tests. **Exact spec language:**
D73-R5, R12–R13, R17–R18; AC9–AC12, AC25–AC32, AC38–AC40.

### 8. Overengineering

**Material concern: Yes.** **What could go wrong:** safety concerns can be used
to justify schedules, approvals, staged traffic, timers, automatic rollback,
registrar management, SEO certification, or route matrices. **Why it matters:**
staff need a rare two-choice decision, not a migration-control plane.
**Severity: High. Likelihood: High. Evidence/reasoning:** the existing D72/D16/
source-owner contracts already supply the necessary boundaries. **Decision
effect:** explicitly excludes those systems. **Permanent fix:** one review, one
command, one receipt, one later separate disconnect decision. **Exact spec
language:** D73-R1–R6, R15–R18; AC1–AC9, AC33–AC40.

### 9. UX/UI and user friction

**Material concern: Yes.** **What could go wrong:** “keep links working” and
“disconnect” overpromise; provider jargon, arrow-only comparisons, a cramped
modal, preselection, hidden exceptions, or toast-only progress cause mistakes.
**Why it matters:** staff perform domain moves rarely, while every donor sees the
outcome. **Severity: High. Likelihood: High. Evidence/reasoning:** radio guidance
supports an unselected required choice; current Core has no domain UX.
**Decision effect:** replaces copy and fixes information order without freezing
one desktop component. **Permanent fix:** route-addressable Base Maia review,
stacked Current/New, impacts before choice, precise labels, durable status/
receipt, and responsive/a11y proof. **Exact spec language:** D73-R4, R15–R16,
R18; AC3–AC8, AC33–AC40.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.** **What could go wrong:** Domain, Public Site
Generation, Payload, Vercel, DNS, Edge, Search, or the UI may each claim which
host is primary or whether the former host redirects. **Why it matters:** dual
ownership creates mixed origins and irreconcilable support history. **Severity:
Critical. Likelihood: High. Evidence/reasoning:** current/proposed sources have
different scopes and provider assignment has automatic serving effects.
**Decision effect:** pins one owner map and exact invariants. **Permanent fix:**
Domain generation owns role/disposition; D1/D66 own favorable output; route
owners own paths; providers supply evidence; UI/search/cache consume. **Exact
spec language:** D73-R2–R7, R10–R14, R17–R18; AC1–AC32, AC38–AC40.

### 11. Hidden coupling

**Material concern: Yes.** **What could go wrong:** primary change can alter
locale root, auth callbacks, cookies, WebAuthn RP IDs, service workers, CORS/CSP,
analytics, Search Console, messages, QR codes, and existing Redirect targets.
**Why it matters:** a domain action can break security and donor journeys outside
the website editor. **Severity: Critical. Likelihood: High. Evidence/reasoning:**
D9–D16 already assign these effects to separate owners. **Decision effect:**
requires finite registered hard dependencies and advisory known placements.
**Permanent fix:** owner manifests, no inferred rewrites, and visible unchanged/
blocked outcomes. **Exact spec language:** D73-R2–R3, R6–R9, R14–R18;
AC4–AC7, AC13–AC24, AC33–AC40.

### 12. Failure modes

**Material concern: Yes.** **What could go wrong:** pre-commit proof can fail;
commit acknowledgement can be lost; new Primary can converge while former
redirect lags; provider/DNS/TLS can disagree; or a projection can loop. **Why it
matters:** “failed” and blind retry can create a second successor or conceal the
actual public origin. **Severity: Critical. Likelihood: Medium-high.
Evidence/reasoning:** database, edge, provider, DNS, browsers, and search cannot
commit atomically. **Decision effect:** separates authoritative commit from
itemized convergence. **Permanent fix:** durable receipt/outbox, same-command
reconciliation, generation mismatch fences, honest partial status, and no
automatic fallback. **Exact spec language:** D73-R5–R6, R10–R13, R16–R18;
AC9–AC18, AC29–AC40.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.** **What could go wrong:** two staff changes can race;
proof can expire; owner routes/default locale can change after review; the same
request can repeat; or “Undo” can resurrect unsafe authority. **Why it matters:**
individually valid actions can jointly create zero/two primaries or stale public
meaning. **Severity: Critical. Likelihood: High. Evidence/reasoning:** current
mutable fields provide no expected-head or semantic receipt. **Decision effect:**
defines a successor-only state machine and fresh reauthorization. **Permanent
fix:** expected heads, stable lock order, impact digest, one semantic identity,
original-result retry, and fresh successor for reversal. **Exact spec language:**
D73-R2–R6, R12–R13, R17–R18; AC4–AC12, AC25–AC32, AC38–AC40.

### 14. Data integrity risks

**Material concern: Yes.** **What could go wrong:** Domain and public-locale
heads may disagree, former disposition may be missing, existing redirects may
chain, history may be overwritten, or a detached provider domain may remain
claimed. **Why it matters:** current and historical public identity become
unreconstructable. **Severity: Critical. Likelihood: High. Evidence/reasoning:**
the change spans multiple current heads and externally observed state.
**Decision effect:** requires one complete generation/receipt and no destructive
cleanup. **Permanent fix:** immutable cohorts, disjoint roles, one current head,
restrictive delete, reconciliation indexes, and later explicit detachment.
**Exact spec language:** D73-R5–R6, R10–R14, R17–R18; AC9–AC18, AC25–AC32,
AC38–AC40.

### 15. Security and privacy risks

**Material concern: Yes.** **What could go wrong:** stop copy can promise
erasure that Core cannot deliver; redirects can leak queries/fragments; cross-
host cookies/auth can widen; IDNs can deceive; provider force can hijack a host;
or CT/search/archive evidence can retain the old/new relationship. **Why it
matters:** ministries may manage genuinely sensitive identities and donor data.
**Severity: Critical. Likelihood: High. Evidence/reasoning:** public origins and
external records persist outside Core; D72 already prohibits trust expansion.
**Decision effect:** narrows stop semantics and adds explicit limitations.
**Permanent fix:** owner-qualified path/query, empty fragment, no-store, no
cookies/analytics/branding, trusted host, IDN dual display, no force, and honest
privacy copy. **Exact spec language:** D73-R1–R4, R7–R12, R15–R18; AC3–AC8,
AC13–AC28, AC33–AC40.

### 16. Scalability and performance risks

**Material concern: Yes.** **What could go wrong:** crawling every URL,
request-time DB/provider calls, per-domain static redirects, full-content
regeneration, or unbounded impact lists can make moves slow and public requests
fragile. **Why it matters:** the hot path serves every visitor, including low-
bandwidth donors. **Severity: High. Likelihood: Medium. Evidence/reasoning:**
installed Next.js documents a provider redirect limit; external artifacts are
unbounded. **Decision effect:** uses one bounded projection and finite owner
registries. **Permanent fix:** precompiled hard-gate manifests, immutable origin
successors that reuse content versions, indexed lookup, no request provider
call, and maximum-catalog proof. **Exact spec language:** D73-R2, R5–R6,
R10–R11, R17–R18; AC4–AC7, AC13–AC24, AC35–AC40.

### 17. Operational burden

**Material concern: Yes.** **What could go wrong:** support may manually edit
Vercel, staff may think stopping website use cancels registration, or orphaned
provider bindings may require database repair. **Why it matters:** Phase 24 is a
self-service product and domains already require ongoing ownership/DNS/TLS work.
**Severity: High. Likelihood: Medium. Evidence/reasoning:** Vercel separates
project removal, account ownership, registrar, and DNS. **Decision effect:**
shows ongoing obligations and reserves detach for D74. **Permanent fix:** clear
states, owner handoffs, durable work/reconciliation, no provider dashboard as
normal workflow. **Exact spec language:** D73-R3–R4, R9–R10, R13, R15–R18;
AC3–AC8, AC19–AC24, AC29–AC40.

### 18. Observability and auditability gaps

**Material concern: Yes.** **What could go wrong:** support cannot tell whether
the Primary committed, which disposition was chosen, which generation is live,
what remains source-owned, or whether Vercel/edge/DNS is merely lagging. **Why it
matters:** technical logs cannot prove a durable human public-identity decision.
**Severity: High. Likelihood: Medium-high. Evidence/reasoning:** D73 crosses many
asynchronous seams. **Decision effect:** requires one business receipt plus
content-free technical monitors. **Permanent fix:** immutable actor/old/new/
disposition/impact/head/proof/outcome receipt, correlated provider work, and the
named monitors below. **Exact spec language:** D73-R5, R10–R13, R16–R18;
AC9–AC12, AC25–AC40 and monitors.

### 19. Dependency and integration risks

**Material concern: Yes.** **What could go wrong:** Vercel API limits/schema/
webhooks, DNS/CA, browser caches, Search, auth providers, analytics, or future
hosts can disagree or change. **Why it matters:** external changes must not
silently redefine Core's public identity. **Severity: High. Likelihood: High.
Evidence/reasoning:** current provider docs expose separate domain operations
and asynchronous evidence. **Decision effect:** keeps provider-neutral product
roles and versioned adapters. **Permanent fix:** live rate headers, conformance
tests, readback, drift detection, replaceable projection, and source-owner
precedence. **Exact spec language:** D73-R2–R3, R7, R9–R14, R17–R18;
AC4–AC7, AC13–AC32, AC35–AC40.

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.** **What could go wrong:** a legacy Payload domain or
provider assignment may be inferred into a successful primary change; old
readers may serve Redirect domains; rollback may restore the mutable string or
cached inverse mapping. **Why it matters:** migration can create cross-Tenant or
looping public behavior. **Severity: Critical. Likelihood: High.
Evidence/reasoning:** current runtime and D73 target have incompatible scope,
authority, and lifecycle. **Decision effect:** prohibits D73 on legacy authority.
**Permanent fix:** D72 readers/constraints first, evidence-only candidate
backfill, cache-history classification, shadow proof, cohort writers, writer-off
roll-forward rollback. **Exact spec language:** D73-R3, R5–R6, R10–R13,
R17–R18; AC1–AC2, AC9–AC18, AC25–AC32, AC38–AC40.

### 21. Testability, traceability, and proof

**Material concern: Yes.** **What could go wrong:** a happy-path hostname test
can pass while permissions, routes, cache loops, locales, partial convergence,
screen readers, or migration fail. **Why it matters:** visible success is not
proof of origin/cardinality/tenant safety. **Severity: High. Likelihood: High.
Evidence/reasoning:** OpenSpec has no D72/D73 requirements and current runtime
lacks Site identity. **Decision effect:** creates exact requirements, outcomes,
negative tests, and trace gates. **Permanent fix:** D73-R1–R18, AC1–AC40,
production monitors, and consistent ADR→OpenSpec→design→tickets→tests→release
evidence. **Exact spec language:** D73-R18; AC1–AC40.

### 22. Other development hazards

**Material concern: Yes.** **What could go wrong:** D73 docs may be called
shipped, PR #1340 may be treated as merged, SEO advice may become authorization,
or an incomplete known-link list may be presented as exhaustive. **Why it
matters:** false maturity and false completeness produce brittle implementation
and unsafe staff promises. **Severity: High. Likelihood: High.
Evidence/reasoning:** current, accepted-doc, active-change, proposed PR, and
external states differ. **Decision effect:** retains explicit evidence labels
and design gates. **Permanent fix:** no runtime claims, no crawler, source-
labelled guidance, accepted authority reconciliation, and release proof.
**Exact spec language:** D73-R2, R14, R17–R18; AC1–AC2, AC19–AC24, AC35–AC40.

## Exact normative requirements

### D73-R1 — Every exact Primary successor requires explicit disposition

Whenever an authorized command replaces an existing Primary Site Domain with a
different exact hostname, it MUST bind one former-primary website disposition:
`redirect_eligible_website_visits` or `stop_website_use`. The choice MUST be
required and initially unselected. No apex/`www`, same-registrable-domain,
provider, import, migration, AI, or “common case” rule may infer it. A private
Site's first Primary remains D6-owned; a retired Site cannot use D73.

### D73-R2 — Finite impact taxonomy; no universal crawler

The command MUST compile a versioned impact manifest from a finite registry in
three classes:

1. `hard_gate`: Domain/current-host claims, exact D1/D66 public heads, host/
   route/security/origin dependencies, and complete managed-source facts that
   must be compatible to commit;
2. `independent_current_outcome`: source-owned Giving/protected/auth/callback/
   admitted-operation routes whose owner returns exactly one current `direct`,
   `unavailable`, `unchanged_with_owner_successor`, or `blocks_primary_change`
   outcome; and
3. `advisory_known_placement`: permission-filtered known CMS placements,
   messages, documents, QR codes, analytics/search properties, backlinks, and
   integration observations that MUST be labelled incomplete and MUST NOT block
   unless their owner separately declares a registered hard dependency.

Core MUST NOT crawl the Internet, every URL, document, message, export, file,
archive, or external system; invent missing equivalence; or create a universal
placement graph/workflow. Hidden items disclose no count, identity, timing, or
existence.

### D73-R3 — Candidate and history qualification

Before review and again at commit, the replacement MUST prove exact current
Tenant/environment/Site binding, canonical hostname, ownership, DNS, TLS,
Vercel project/deployment assignment, trusted host admission, production-
faithful rendering, Site lifecycle, every current public Site Locale, compatible
public-origin generations, route/security manifest, and safety.

A current or historical Redirect Site Domain candidate MUST additionally prove
its immutable Core/provider redirect status, target, headers, cache policy, and
transition history compatible with promotion. Known or possible cacheable
`candidate → current primary` behavior that can produce a stale response, loop,
or incompatible client result MUST make the candidate/disposition unavailable.
`no-store` today cannot erase a response cached previously.

### D73-R4 — Exact staff choice and consequences

The visible question MUST be **What should happen to website visits at {former
hostname}?** with:

- **Redirect eligible website visits — recommended:** only current owner-proved
  website routes with a final equivalent destination move; ongoing domain
  registration/DNS/TLS/safety obligations are stated; and
- **Stop website use on the old domain:** Site website serving/redirection stops;
  ordinary requests reaching Core receive the applicable neutral result; Core
  does not claim to erase externally cached/indexed/archived evidence or change
  independent routes.

The review MUST show all complete authorized hard/independent outcomes before
the RadioGroup and advisory evidence separately. Selection MUST NOT be
prepopulated, hidden in a default, or inferred from a previous command.

### D73-R5 — One complete local successor transaction

The caller supplies only the stable candidate, requested disposition, expected
heads/review basis, and semantic idempotency key. Actor, Tenant, environment,
Site, former/current binding, applicable capability, impact data, policy,
timestamps, and audit attribution derive from trusted server context.

Outside the lock Core compiles the exact immutable candidate, hard-gate/source-
owner manifests, current public Site Locale census, and compatible origin
successors. Inside one short deterministic-lock-order PostgreSQL transaction it
reauthorizes, reloads, proves exact current cohort equality, inserts the
immutable Domain role generation, applicable D1/D66 origin successors, receipt,
audit, and deduplicated outbox, and compare-and-set advances every exact current
head—or rolls back all effects. It MUST NOT advance unrelated drafts, content,
translations, Navigation, Giving, messages, money, or source-owner state.

### D73-R6 — Generation-safe convergence and loop prevention

The admission projection MUST bind normalized host, exact Domain role
generation, target Primary generation, route owner, Site/environment, and public
generation. A host/target generation mismatch MUST fail safely and MUST NOT
redirect. A retained former redirect MUST remain withheld until the new Primary
and applicable locale-origin cohort are proved current, preventing distributed
`old → new → old` loops.

Every existing Redirect Site Domain derives its new direct final target from the
same current Primary generation and appears in the impact review. No redirect
may chain through the former Primary. Public completion requires authoritative
head readback plus the accepted required regional host/route probes; search
crawl/indexing is not completion.

### D73-R7 — Source-owned routes remain source-owned

D73 MUST NOT redirect, stop, transfer, reissue, reinterpret, terminalize, or
create a successor for Giving, checkout, Issued Giving Addresses, auth,
callbacks/returns, APIs, protected actions, webhooks, provider results, control,
or other source-owned routes. Each owner supplies the D73-R2 current outcome and
runs before website role handling. D73 grants no route authority.

If an owner returns `blocks_primary_change`, the command cannot commit. A direct,
unavailable, or separately successor-owned result remains exactly owner-defined
and is shown to authorized staff. Privacy copy MUST say when continued outcomes
can still identify the Tenant or ministry.

### D73-R8 — Stop means no website role, not erasure or detachment

Stopping MUST remove the former hostname from favorable Site website roles while
retaining canonical identity, binding/occupancy as applicable, immutable
history, reservations, and every independent owner result. The staff row says
**Not used for website** while any source-owned favorable public route may
remain. **Not public** may appear only when a complete current owner-produced
projection proves no favorable Core public route remains.

Eligible ordinary website requests that still reach Core return a tiny semantic
platform-neutral no-brand `404`; Domain/route authority uncertainty returns
`503`. Both are `no-store`, `noindex`, set no application cookie, load no Tenant
or Asym assets/analytics, and reveal no old/new relationship. If DNS no longer
reaches Core, Core promises no response. D73 does not detach from Vercel,
release/reassign the host, change DNS/registrar state, or erase search, archives,
certificate-transparency records, backlinks, external caches, or copies.

### D73-R9 — Retain is explicit, qualified, and ongoing

Retention MUST be available only while former-domain ownership, DNS, TLS,
provider assignment, host admission, redirect/cache history, route equivalence,
and safety remain current. An unavailable option MUST explain the cause-owned
repair path and cannot be forced. Retention continues until a later separately
authorized impact-reviewed stop/safety fence; D73 adds no timer, automatic
expiry, schedule, or crawler-defined completion. The Tenant is told that domain
registration, DNS, TLS, monitoring, and renewal remain ongoing responsibilities
and that current Google guidance recommends at least one year when safe.

### D73-R10 — Vercel remains evidence and transport

Vercel project domains, redirects, verification, DNS/TLS, deployment assignment,
limits, webhooks, and dashboards MUST NOT create or correct a Core Primary or
former disposition. D73 MUST NOT configure Vercel whole-domain redirect, use
`--force`, move project/team/account ownership, detach/remove the former host,
change nameservers/DNS/MX/CAA/DNSSEC, or interpret deployment/Instant Rollback as
a product rollback.

Provider work occurs outside authoritative transactions through one coalesced
durable identity, current rate-limit/reset headers, `429` backoff, versioned
adapter proof, readback, drift detection, and unknown-result reconciliation.
Provider `/.well-known` control remains ahead of website routing.

### D73-R11 — Route-specific HTTP and privacy semantics

Only route-owner-qualified public `GET`/`HEAD` website navigation may redirect.
Stable equivalent website resources MAY use owner-approved `308 Permanent
Redirect`; the former-domain Site Root Entry MUST compose D16's current final
Default Site Locale homepage and use `307 Temporary Redirect`. Favorable
redirects MUST use `Cache-Control: no-store`, `Referrer-Policy: no-referrer`, an
owner-approved query allowlist, explicit empty-fragment form, no `Set-Cookie`,
and one direct current final destination.

Unsafe methods, bodies, auth/session/Giving/return parameters, unknown or
missing resources, unproved equivalence, self-targets, chains, loops, homepage
collapse, rewrites, proxying, client redirects, and arbitrary targets MUST NOT
use the website redirect. Exact `301`/`308` search meaning never authorizes
browser caching contrary to containment.

### D73-R12 — Authorization, database, RLS, and privileged parity

D73 uses the current `sites.activate_domains` capability or its accepted exact
successor at both review and commit. Candidate management, source-owner routes,
Site/locale/content publication, Giving, provider force/removal, support,
cross-Tenant action, and later disconnection remain separate authorities.

Relations MUST enforce non-null same-scope Tenant/Site/host/generation/head
relationships, finite checked states, exact current-head uniqueness, positive
revisions, restrictive delete, immutable public history, and equality-leading
indexes. Tenant-bearing relations enable and applicable authority relations
FORCE RLS; grants remain minimal; `SELECT`/`DELETE` use `USING`, `INSERT` uses
`WITH CHECK`, and `UPDATE` uses both. Anonymous/authenticated roles receive no
direct authority mutation. Service/owner, `SECURITY DEFINER`, RPC, worker,
Payload, import, support, AI, and direct SQL paths MUST repeat structural,
capability, cohort, and attribution checks rather than treating RLS bypass as
authority.

### D73-R13 — Lifecycle, concurrency, idempotency, and recovery

Valid transitions are reviewed-current-primary → one new Primary plus either
former Redirect website role or no former website role; pre-commit failure
changes nothing. Invalid transitions include zero/two primaries, stale
candidate/head/impact, incompatible redirect history, retired Site, owner block,
cross-scope host, automatic fallback, and provider-derived success.

Concurrent A→B/A→C, Site suspend/retire, locale/default publication, route
issue/stop, ownership/TLS loss, provider drift, access revocation, and repeat
requests use one documented lock order and adverse authority wins. Same semantic
key/meaning returns the original receipt; changed meaning conflicts. Unknown
acknowledgement reconciles the original command before another attempt. Revert
is a newly reviewed successor—never Undo or automatic rollback.

### D73-R14 — Public-origin closure and historical integrity

Every newly generated internal/canonical/alternate/sitemap/feed/social/share/
search/cache URL after commit MUST use the new Primary and exact compatible
public-generation cohort. Existing Redirect Site Domains target it directly.
Current Primary responses self-canonicalize; former redirect hosts emit no
content/canonical/sitemap/favorable inventory.

Historical gifts, receipts, statements, documents, messages, QR codes,
attribution, audit, published evidence, and literal external URLs MUST NOT be
rewritten. Source owners may separately issue successors. Search Console,
recrawl, ranking, backlinks, analytics, and traffic are advisory observations;
they cannot delay, authorize, reverse, or complete D73.

### D73-R15 — Focused Base Maia staff review

**Site → Domains** exposes **Make primary** only for a qualified candidate and
authorized actor. One focused route-addressable review shows Site/environment,
stacked Current/New safe hostnames, primary/public-generation consequences,
existing Redirect-target changes, hard/independent outcomes, advisory known
placements, then the D73-R4 RadioGroup. It is not a provider dashboard, matrix,
or wizard. Desktop Sheet versus full page is design/usability-owned; mobile MUST
be full-viewport single-column.

The final action is **Make {new hostname} primary** and stays unavailable until
one choice is made and current review basis remains valid. Attempted submission
without a choice shows and focuses one visible RadioGroup error. IDNs use safe
Unicode plus canonical ASCII when different, bidi isolation, and LTR technical
rendering. No raw provider IDs/errors, status codes, cache controls, internal
roles, hidden counts, or manual canonical/route settings render.

### D73-R16 — Honest progress, failure, and receipts

Known pre-commit failure says nothing changed. Changed review facts require
review again. Unknown outcome says not to resubmit and reconciles the original
receipt. After acknowledgement, the review returns to a durable operation card:
**Changing primary website address — You can leave this page.** No fake
percentage, repeated provider-poll announcement, or trapped dialog is permitted.

Success and partial-convergence receipts itemize current authoritative Primary,
former website disposition, unchanged independent outcomes, and any exact
**Needs attention** effect. If Primary committed but former redirect projection
lags, the receipt says **Primary address changed · Redirect needs attention**;
it never calls the whole command failed. Recovery reauthorizes and reconciles
forward.

### D73-R17 — Performance, migration, rollout, and rollback

Preparation MUST use bounded finite owner adapters and indexed batch reads; the
transaction touches only the exact current Domain/public-locale head cohort and
immutable inserts. Public routing remains one bounded admission lookup with no
request-time database/provider/content scan. Maximum supported domains, locales,
routes, IDNs, and permission-filtered impacts MUST pass capacity evidence inside
the inherited launch budget.

D73 cannot activate on legacy Payload `primaryDomain`, Phase 2 scalar/array,
slug fallback, global metadata, host-blind static redirects, or provider state.
Rollout lands D72 exact-host readers/negative behavior/constraints, redirect-
history inventory, D1/D66-compatible origin readers, and mixed-version proof
before D73 writers. Legacy values migrate only as evidence-classified nonpublic
candidates; no former disposition is inferred. Rollback disables writers and
reconciles forward while preserving heads/history; it never restores legacy
authority or a cached inverse mapping.

### D73-R18 — Dependency, traceability, and proof gate

Runtime activation remains off until accepted D9–D16, D66, ADR-0193/0194,
reconciled Phase 23 generation authority, consolidated Phase 24 OpenSpec,
installed-framework/provider contracts, database design, route/security owner
registry, capability mapping, migration/rollback, and AC1–AC40 pass. Terminology,
roles, states, copy, statuses, counts, thresholds, and ownership MUST trace
identically through glossary, ADRs, PRDs, OpenSpec, design, tasks, tickets,
implementation, tests, production evidence, and support runbooks.

## Falsifiable acceptance criteria

1. **AC1 — Current-state truth:** docs distinguish current mutable Tenant-only
   runtime from intended D72/D73; no schema/provider/runtime claim is implied.
2. **AC2 — Dependency gate:** D73 writers remain unavailable until exact-host
   D72 and compatible public-origin readers/constraints are live and proved.
3. **AC3 — Required choice:** every exact existing-Primary replacement,
   including apex/`www`, begins with neither D73 choice selected.
4. **AC4 — No-choice validation:** submit without a choice causes zero effect,
   displays one associated group error, and moves focus to it.
5. **AC5 — Exact copy:** retain says eligible website visits; stop says website
   use only; neither promises every link or complete identity erasure.
6. **AC6 — Viewer-safe impacts:** complete authorized hard/independent outcomes
   render; hidden outcomes leak no count/name/URL/timing; advisory lists say they
   are known, not exhaustive.
7. **AC7 — No crawler:** zero URL/Internet/document/export scan or universal
   placement write authority is invoked by review or command.
8. **AC8 — Retain qualification:** stale/unknown ownership, DNS, TLS, provider,
   safety, route, or redirect-history proof disables retention with one
   cause-owned path and no force action.
9. **AC9 — One Primary:** every successful change has exactly one current
   Primary before and after; zero/two fail closed and alert.
10. **AC10 — Exact cohort:** Domain head and every exact current public Site
    Locale origin head advance together to compatible successors or none do.
11. **AC11 — No unrelated publication:** no draft/content/Navigation/brand/
    translation/Giving/message/money/source-owner state advances because of D73.
12. **AC12 — Concurrency:** concurrent A→B and A→C produce one complete winner
    and one stale zero-effect receipt; same-meaning replay returns the winner.
13. **AC13 — Candidate history:** a current/historical Redirect candidate with
    unknown/cacheable/incompatible inverse history cannot become Primary.
14. **AC14 — No distributed loop:** generation-mismatched targets fail safely;
    no old/new/existing-Redirect probe or real browser produces a chain/loop.
15. **AC15 — Existing redirects:** every current Redirect Site Domain points
    fresh eligible traffic directly to the new final Primary destination, not
    through the former Primary.
16. **AC16 — Root semantics:** former-domain `/` composes D16 and returns one
    direct `307`, `no-store`, explicit-empty-fragment current default-locale
    homepage response.
17. **AC17 — Stable resource semantics:** an owner-classified stable equivalent
    route may return direct `308` plus `no-store`; missing/unproved resource never
    collapses to homepage.
18. **AC18 — Method/query/fragment/privacy:** unsafe methods never redirect;
    only owner-allowlisted query survives; real-browser fragment inheritance is
    suppressed; redirect has `no-referrer` and no application cookie.
19. **AC19 — Source-owner outcomes:** every Giving/protected route produces only
    its pinned direct/unavailable/unchanged-successor/block result and no D73
    redirect, stop, reissue, or financial mutation.
20. **AC20 — Stop website result:** ordinary former-host website routes reaching
    Core return neutral no-brand/noindex/no-store `404`; authority uncertainty
    returns equivalent `503`; no Tenant/Asym assets or analytics load.
21. **AC21 — Honest status:** a former host with any favorable independent route
    says **Not used for website**; **Not public** requires complete current owner
    proof of no favorable Core route.
22. **AC22 — No external erasure claim:** copy/receipt state that search,
    archives, CT, backlinks, DNS, external hosts, caches, and copies remain
    outside Core control.
23. **AC23 — No provider authority:** delayed/duplicate/out-of-order/forged
    Vercel/DNS/TLS evidence cannot change Primary or disposition.
24. **AC24 — No destructive provider action:** D73 issues no provider whole-
    domain redirect, `--force`, detach/remove/move, account/registrar/DNS change,
    or product rollback from deployment revert.
25. **AC25 — Scope/authorization:** forged caller Tenant/Site/environment/actor/
    role/head/impact/provider input cannot review, read, mutate, or move another
    binding; access revocation before commit yields zero effect.
26. **AC26 — RLS/grants:** operation-correct grants, `USING`, `WITH CHECK`, final
    row state, cross-scope denial, immutable history, and restrictive delete pass.
27. **AC27 — Privileged poison:** service/owner/function/RPC/worker/Payload/
    import/support/AI/direct SQL cannot bypass capability, scope, cohort,
    cardinality, receipt, or attribution invariants.
28. **AC28 — Race matrix:** Site suspension/retirement, locale/default release,
    route issue/stop, ownership/TLS loss, provider drift, and Primary change have
    declared deterministic winners; adverse safety wins.
29. **AC29 — Unknown result:** lost acknowledgement never offers blind retry;
    the same receipt reconciles to committed, no-effect, or needs-attention.
30. **AC30 — Partial convergence:** committed Primary plus lagging former effect
    reports exact authority and **Needs attention**, retains one command, and
    never promotes a fallback or calls the whole command failed.
31. **AC31 — Origin closure:** canonical/internal/`hreflang`/sitemap/feed/social/
    share/search/cache output all pin the same new Primary/current generation;
    former hosts emit no favorable inventory.
32. **AC32 — Historical integrity:** gifts, commitments, receipts, statements,
    documents, messages, QR evidence, attribution, audit, and literal URLs are
    byte-for-byte unchanged by D73.
33. **AC33 — Focused staff review:** Site/environment, Current/New, origin/
    Redirect effects, owner outcomes, advisory evidence, choice, and exact final
    action render in semantic visual/reading/focus order without provider jargon.
34. **AC34 — Responsive/a11y:** 320 CSS pixels, 400% zoom, keyboard, screen
    reader, touch, forced colors, reduced motion, long translations, IDN, RTL/
    bidi, and mobile full-viewport flow pass.
35. **AC35 — Resume/staleness:** transient network loss may retain an
    unsubmitted local choice for the same basis; changed candidate/head/impact
    clears it and requires review rather than silently rebasing.
36. **AC36 — Progress/receipt:** acknowledgement lets staff leave; one polite
    status region reports meaningful transitions; durable success/partial/
    unknown receipts survive navigation and reload.
37. **AC37 — Performance:** maximum supported domain/locale/route cohort compiles
    outside lock, commits in one bounded indexed transaction, and keeps public
    host resolution inside the accepted launch budget with no provider/DB scan.
38. **AC38 — Migration/mixed versions:** legacy strings/arrays/provider domains/
    cached redirects quarantine or migrate as nonpublic evidence; old readers
    never serve a former Primary contrary to the new generation.
39. **AC39 — Rollback/recovery:** writer-off rollback preserves immutable heads/
    history and safe readers; correction uses a fresh authorized successor, not
    legacy authority, Undo, or automatic inverse redirect.
40. **AC40 — Production-shaped traceability:** requirements, copy, states,
    thresholds, owner manifests, browser/provider contracts, staff comprehension,
    consolidated artifacts, and release evidence all agree before activation.

## Required monitors

| Signal                                                    |                                                                                                            Threshold | Owner                               | Required response                                                                                                                         |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------: | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `site_primary_change_head_cohort_mismatch_total`          |                                                                                                                  Any | Site Platform + Database            | Disable Primary-change writers, fence affected favorable serving, preserve evidence, reconcile forward, and rerun cohort atomicity proof. |
| `site_former_primary_website_outcome_mismatch_total`      |                                                                   Any response contrary to authoritative disposition | Public Runtime + Security           | Fence the former website role, purge scoped caches/projections, inspect generations, and restore only after proof.                        |
| `site_primary_change_source_owner_outcome_mismatch_total` |                                                                 Any route result differing from pinned owner outcome | Domain Platform + exact route owner | Fence the affected route family, stop new Primary changes, reconcile owner/Domain heads, and never infer fallback.                        |
| `site_primary_candidate_redirect_history_conflict_total`  |                                                               Any incompatible candidate commits instead of blocking | Security + Domain Platform          | Fence both hosts, disable promotion, inspect immutable response history, and correct through a new successor.                             |
| `site_primary_change_redirect_chain_hops`                 |                                                                     Any server-observed value >1 or any browser loop | Public Runtime + Site Platform      | Disable affected redirect emission, preserve new Primary if safe, repair target/generation/cache compatibility, and rerun browser proof.  |
| `site_primary_change_cache_policy_violation_total`        | Any favorable former-domain redirect without the owner-approved status, `no-store`, empty fragment, or `no-referrer` | Security + Public Runtime           | Fence redirect, purge controllable caches, correct headers/route class, and re-prove; do not claim external cache erasure.                |
| `site_primary_change_projection_divergence_age_seconds`   |                                                                               >30 seconds after authoritative commit | Site Platform Operations            | Preserve **Needs attention**, stop further favorable role changes, reconcile Domain/admission/public heads, and fence unknown effects.    |
| `site_primary_change_unknown_outcome_age_seconds`         |                                                                 >30 seconds without an authoritative receipt outcome | Site Platform Operations            | Suppress resubmission, reconcile the original semantic command, page the owner if the D7 containment bound is crossed.                    |
| `site_primary_output_generation_mismatch_total`           |                                      Any old/new canonical/internal/alternate/sitemap/feed/social/cache disagreement | Public Runtime + Web Studio         | Fence affected cutover, retain the last complete safe generation, purge scoped caches, and reconcile forward.                             |
| `site_primary_change_manual_provider_drift_total`         |                        Any Vercel project-domain redirect/move/detach/force state not explained by durable Core work | Domain Operations + Security        | Fence favorable use as needed, preserve Core authority/history, investigate external change, reconcile or require fresh human recovery.   |

The inherited D72 cardinality, cross-scope, Redirect-content, excluded-route,
fragment, latency, and platform-host monitors remain mandatory. Search ranking,
recrawl, DNS propagation, external links, and advisory placement counts are
labelled observations only; no threshold authorizes product mutation.

## Ruthless synthesis and execution order

### Must be resolved before recording

Resolved by ADR-0194 and this review:

1. Keep explicit per-change choice for every exact Primary successor.
2. Replace overpromising retain/stop copy and false **Not public** state.
3. Split finite hard/independent owner proof from incomplete advisory placements.
4. Make redirect/cache history a candidate qualification and reject automatic
   apex/`www` inversion.
5. Pin source-owned outcomes, D16 root semantics, status/cache/privacy headers,
   and Vercel non-authority.
6. Require one Domain/public-origin cohort command with durable convergence.

### Must enter consolidated OpenSpec/design before ticketing

1. D73-R1–R18, AC1–AC40, the ten monitors, and the accepted D74 decision.
2. Logical state machine, exact owner registry taxonomy, impact digest, lock
   order, receipt/outbox, route HTTP matrix, redirect-history profile, and
   provider adapter/readback contract.
3. D1/D66 compatible origin-successor compiler and mixed-version contract.
4. Capability/RLS/grants/privileged-path design, migration inventory, incident/
   recovery/roll-forward runbooks, and D74 detach boundary.
5. Route-addressable Base Maia UX, copy/localization, accessibility, mobile/weak-
   network behavior, and representative ministry-staff comprehension evidence.

### Required implementation order

1. Land/reconcile accepted Site, D72 Domain, D15/D16 route, D66 public-generation,
   and Phase 12 authorization foundations.
2. Land exact-host/negative readers, structural constraints, trusted host
   transport, generation-checked projection, and redirect-history capture with
   D73 writers disabled.
3. Implement finite hard/independent owner adapters and bounded advisory
   projections; shadow-compile current origin successors and race matrices.
4. Prove DB/RLS/privileged paths, browser cache/loop/status/fragment/privacy,
   Vercel failure/drift, maximum cohort, mixed-version, and rollback behavior.
5. Build and usability-test the focused Domains review, durable operation card,
   and receipts; enable one production cohort behind writer/redirect kill
   switches.
6. Expand only after production evidence shows zero cardinality/scope/route/
   generation/cache failures and representative staff understand the effects.

### Monitor after release

Only the ten named D73 signals, inherited D72/D9–D16/D66 signals, and explicitly
external observations qualify. Wrong-Tenant resolution, two primaries, a
redirect loop, source-owner override, mixed public origins, false stop/privacy
claim, or unexplained provider move is an incident, not accepted residual risk.

## Exact corrected decision

> Every authorized replacement of an existing Primary Site Domain with another
> exact fully proved Tenant hostname requires one initially unselected former-
> primary **website-role** disposition: **Redirect eligible website visits —
> recommended**, or **Stop website use on the old domain**. This applies to
> apex/`www` as well as other hostnames; no provider or registrable-domain rule
> answers for staff.
>
> The choice governs website behavior only. Each finite registered source owner
> separately returns its current direct, unavailable, unchanged-successor, or
> blocking outcome. D73 never moves, redirects, stops, reissues, reinterprets,
> or terminalizes Giving, checkout, auth, callbacks, APIs, protected actions, or
> other source-owned meaning. Known external placements are advisory and never
> presented as complete. Stop-mode copy does not promise erasure or a complete
> identity break.
>
> A retained former hostname redirects only current owner-qualified ordinary
> website `GET`/`HEAD` requests to one final equivalent destination on the new
> Primary. Stable equivalent resources may use owner-approved `308`; the mutable
> former root composes D16 and uses `307`. Every favorable redirect is
> `no-store`, `no-referrer`, sets no application cookie, carries only owner-
> allowed query context, suppresses fragment inheritance, and never chains or
> uses a Vercel whole-domain redirect. Candidate promotion requires compatible
> immutable redirect/cache history; possible cached inverse behavior blocks.
>
> Core privately prepares the exact Domain role and every compatible current
> D1/D66 public-locale origin successor. One reauthorized expected-head command
> atomically advances the exact local head cohort with immutable receipt/audit/
> outbox or changes nothing; external provider work occurs outside the lock and
> reconciles the same semantic command. Generation mismatches fail safely.
> Correction is another fresh successor, never Undo, provider rollback, fallback
> promotion, or inferred legacy state.
>
> The focused Base Maia review shows Current/New, origin and existing Redirect
> effects, complete authorized owner outcomes, explicitly incomplete advisory
> evidence, then the unselected RadioGroup and **Make {new hostname} primary**.
> **Not used for website** is distinct from **Not public**. A durable operation
> card and itemized receipt report authoritative and lagging effects. D73 does
> not detach the former hostname, change DNS/registration, schedule expiry, add a
> crawler, workflow, redirect editor, or expose platform branding.

## Final disposition

**Accept with required amendments.** Explicit per-change disposition is the
best modern Core decision. The mainstream automatic-retain pattern correctly
informs the recommendation, but Core's missions privacy context, source-owned
routes, mutable locale root, browser cache history, and stricter tenant/origin
authority make silent demotion unsafe. The corrected decision stays small while
making every irreversible or externally sticky consequence honest and testable.

No runtime, schema, migration, Supabase policy, Vercel setting, OpenSpec delta,
ticket, deployment, DNS record, or production state changed. This artifact
records intended behavior only.

## D76 reconciliation (2026-08-30)

D76 reuses D73 rather than bypassing it. Destination Primary replacement keeps
the exact initially unselected former-primary disposition. A moved source
Primary requires a different qualified source Primary and necessarily stops the
moved hostname's source website role because one hostname cannot remain a
Redirect for one Site while representing another. D76's two-Site plan consumes
the same finite hard/source/advisory owner manifest and never infers retirement,
provider movement, route equivalence or rollback.

## D77 reconciliation (2026-08-31)

ADR-0198 keeps that finite registry as the sole critical owner-family catalog;
D77 adds no owner adapter framework or second impact model. The D76 authority
digest combines current critical results with a pure comparison of complete
immutable source/destination effective-host manifests. Source-only ordinary
addresses compile durable not-found effects, exact collisions require their
owner, and only an already qualified successor may continue. Advisory known
placements retain a separate incomplete snapshot and cannot produce a false
block, false zero, route, or provider effect.
