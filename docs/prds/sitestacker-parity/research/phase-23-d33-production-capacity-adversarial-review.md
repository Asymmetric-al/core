# Phase 23 D33 — Production Capacity Profile Adversarial Review

**Status:** Complete adversarial hardening supporting the founder-ratified exact
Phase 23 D33 C-prime-R decision. This review explains the decision without
independently expanding the ratified authority or authorizing implementation.

**Date:** 2026-08-24

**Decision under review:** one versioned, provider-neutral **Production Capacity
Profile**, implemented first on Vercel

**Scope:** Web Studio, D1 preparation and publication, public delivery, Preview,
search, schedules, media delivery, database use, durable work, telemetry, and
provider cost

**Authorization:** Documentation and research only. No implementation, schema,
provider setting, deployment, production access, issue publication, or release
is authorized.

## Executive verdict

C-prime is the right architectural direction, but its initial wording is not
safe enough to ratify unchanged. A provider-neutral capacity contract is useful
only if it is **provider-aware in qualification**, numeric where it makes a
promise, explicit about cache and release authority, and honest when evidence is
missing. Otherwise it becomes either process theater or a Vercel configuration
document disguised as product policy.

The permanent design is:

1. one code-owned, versioned **Production Capacity Profile** that defines Core's
   workload cohorts, user-experience floors, service budgets, fairness, overload,
   recovery, evidence, and unit-cost contract without Vercel SKU names;
2. one versioned **Vercel Qualification Attachment** that qualifies an exact Vercel
   plan, project topology, regions, Function configuration, cache behavior,
   image-delivery path, observability sampling, firewall posture, spending
   controls, and current billing dimensions against the product profile;
3. one D1 public authority: Vercel deployment, ISR, CDN, Runtime Cache, image
   cache, and invalidation are delivery mechanics and observable outcomes, never
   public truth;
4. no advertised maximum, capacity claim, or tenant activation until every
   required numeric cell has current production-shaped evidence; and
5. quiet product UX: donors get fast, complete public truth; staff get one
   ordinary workflow with honest asynchronous progress; operators get D31
   exception summaries and D30 diagnostics instead of provider jargon in the
   editor.

All 17 review categories contain material concerns. That does not mean C-prime
is unsound. It means capacity is a cross-cutting operational contract whose
failure can affect many tenants at once, and the profile must prevent predictable
mistakes before exact Vercel and Payload qualification begins.

## Review basis

### Ratified product constraints

This review preserves, rather than reopens, the following decisions:

- **D1:** one immutable, exact-generation public closure and one small CAS
  serving head; downstream cache/search/CDN facts converge separately; candidate
  failure preserves current public truth.
- **D9:** every custom Presentation Package has versioned JavaScript, CSS, font,
  image, route, Core Web Vitals, motion, accessibility, no-JavaScript, and
  recovery budgets.
- **D10:** a Site Presentation change privately prepares the complete public
  locale cohort and activates it all-or-none; Vercel rollout and cache state are
  never authority.
- **D13:** schedules bind exact revisions and enter D1 through idempotent durable
  execution; Inngest supplies delivery and load control, not publication truth.
- **D17:** public search is a derived projection with explicit lag, deletion,
  reconciliation, and operational-health promises.
- **D25:** whole-Site Preview is one immutable, private, no-store, noindex,
  side-effect-dark candidate with bounded retention, not a permanent staging
  deployment or second serving head.
- **D27:** public media uses immutable byte/rendition custody and a single
  transform/delivery contract; Payload, Supabase Storage, Vercel Blob, image
  processors, and CDNs are adapters.
- **D30:** Supabase Auth and Phase 12 remain the only staff identity and
  authorization authority; Payload and Vercel diagnostics do not become normal
  staff access paths.
- **D31:** one quiet, derived, exception-first Content Health workspace owns no
  workflow or public truth and never treats stale evidence as healthy.
- **D32:** accessibility work is bounded; there is no per-keystroke whole-Site
  scan, remote release dependency, or bypass of source-owned release
  invariants.

### Current repository evidence

The D33 decision brief already establishes that:

- current Lighthouse coverage is a small desktop lab sample, not Phase 23 field
  or capacity evidence;
- the current performance test runs against `next dev`, can omit LCP, does not
  measure INP, and is excluded from the ordinary E2E script;
- a Web Vitals beacon library exists but has no confirmed product consumer and
  currently carries full URL and user-agent fields that require privacy and
  cardinality review;
- Payload list paging, low public query limits, and `depth: 0` are useful local
  bounds, not end-to-end capacity proof;
- the hosted Payload pool default of two connections protects serverless
  deployments from one obvious footgun but is not a throughput promise;
- autosave runs at 300 ms and version retention is not yet collection-bounded;
- Core already uses Inngest `4.5.1` and tenant-keyed flow control in other
  domains, but those domains' numeric limits cannot be copied into CMS work; and
- the branch's Next and Payload dependencies are preview/internal pins, so exact
  source and behavior qualification is mandatory.

### Current primary-source facts that change the risk analysis

- Current Vercel Function billing for fluid compute separates **Active CPU**,
  **Provisioned Memory**, and **Invocations**. Waiting can stop Active CPU billing
  while memory remains provisioned, and multiple requests may share one
  instance. Capacity cannot therefore be reduced to request duration or
  invocation count alone. See [Vercel fluid compute pricing](https://vercel.com/docs/functions/usage-and-pricing).
- Vercel CDN usage currently includes CDN/Edge Requests, Fast Data Transfer, and
  Fast Origin Transfer. Middleware and compute can add origin transfer, while
  static/CDN delivery can avoid Function execution. See
  [Vercel CDN pricing and usage](https://vercel.com/docs/manage-cdn-usage).
- ISR uses ephemeral regional CDN caches plus durable regional storage. It can
  collapse misses, preserve stale content on regeneration failure, and propagate
  an invalidation globally, but durable ISR reads/writes, Function work, and
  origin transfer are separately billable. See
  [Vercel ISR](https://vercel.com/docs/incremental-static-regeneration) and
  [ISR usage and pricing](https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing).
- Vercel Image Optimization bills transformations, shared-cache reads, writes,
  transfer, and requests. Variant keys include URL, width, quality, and accepted
  format, so an unconstrained DAM/image combination can multiply work. See
  [Image Optimization limits and pricing](https://vercel.com/docs/image-optimization/limits-and-pricing) and
  [managing image costs](https://vercel.com/docs/image-optimization/managing-image-optimization-costs).
- Spend Management is team-wide, checked periodically, and can notify, call a
  webhook, or pause production projects. A spend amount does not cap usage by
  itself, and setting it below current spend can trigger configured actions.
  See [Vercel Spend Management](https://vercel.com/docs/spend-management).
- Vercel's automatic DDoS mitigation does not bill blocked attacks, but traffic
  served before detection and traffic not classified as DDoS—including bots and
  crawlers—can still consume usage. See
  [Vercel DDoS mitigation](https://vercel.com/docs/vercel-firewall/ddos-mitigation).
- Current Next 16.2.6 bundled docs say `revalidateTag(tag, "max")` uses
  stale-while-revalidate and refreshes only after the next visit, while immediate
  expiration is a different operation. They also make cache inputs part of the
  cache key and forbid direct request-time APIs inside ordinary `use cache`
  scopes. These are useful primitives, not D1 semantics. Local evidence:
  `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md`,
  `revalidatePath.md`, and
  `01-directives/use-cache.md` from installed Next `16.2.6`.
- Current Web Vitals guidance assesses the 75th percentile by device and defines
  good LCP as at most 2.5 seconds, INP at most 200 ms, and CLS at most 0.1. See
  [web.dev Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds).

Vercel prices, names, included usage, plan limits, and defaults are deliberately
not copied into the product contract. They are drift-prone facts that belong in
the dated Vercel qualification attachment.

## Risk scale

- **Critical:** can expose another tenant, publish the wrong truth, defeat
  adverse containment, or make public service broadly unavailable.
- **High:** can materially degrade many user journeys, cause an uncontrolled
  bill, or make recovery unreliable.
- **Medium:** creates localized friction, maintenance cost, or a contained
  operational defect.
- **Low:** narrow inconvenience with straightforward recovery.

Likelihood is judged for a multi-tenant public CMS under realistic growth,
traffic spikes, staff concurrency, provider drift, retries, and ordinary human
error—not a deliberately ideal test environment.

## 1. Brittleness

**Material concern exists: Yes.**

### Concern A — provider-neutral can become provider-unaware

- **What could go wrong:** The product profile says only “fast” or “within
  budget,” while the Vercel deployment silently depends on a current plan,
  billing model, region, cache feature, project setting, or undocumented
  default. A Vercel plan or Next behavior change then invalidates assumptions
  without changing the product profile.
- **Why it matters:** A contract that cannot identify the exact deployed
  mechanics cannot explain regressions, compare a successor provider, or prove
  that a cheaper setting preserves user experience.
- **Severity:** High.
- **Likelihood:** High over the product lifetime.
- **Evidence/reasoning:** Vercel currently distinguishes fluid and legacy
  Function billing, region-priced resources, multiple cache products, and plan-
  specific controls. The branch also pins preview/internal Next and Payload
  artifacts.
- **Permanent fix:** Keep one provider-neutral Production Capacity Profile and
  require one versioned Vercel Qualification Attachment that records exact plan,
  project topology, regions, compute model, memory/duration, cache types,
  observability sampling, security controls, billing dimensions, dependency
  pins, and qualification digest. Any relevant change reopens qualification,
  not product semantics.

### Concern B — cache correctness can depend on ideal timing

- **What could go wrong:** A route/path invalidation, mutable URL, time-based
  revalidation, or warm-cache test appears correct until a cold region, custom
  domain, rollback, adverse unpublish, or concurrent release serves stale or
  mixed output.
- **Why it matters:** A donor may see obsolete designation or ministry content;
  a restricted person may remain visible; or one tenant's route may reuse
  another tenant's cached result.
- **Severity:** Critical.
- **Likelihood:** Medium without structural controls; low after them.
- **Evidence/reasoning:** Vercel ISR is intentionally stale-while-revalidate in
  common modes, caches exist at multiple layers, and on-demand revalidation is
  scoped to the exact deployment/domain. D1 explicitly says cache/CDN state is
  not authority.
- **Permanent fix:** Make public artifacts and cache identities exact-generation
  and content-addressed. Every shared cache key must include the proven Tenant,
  environment, Site, locale, route identity, and generation/package dimensions
  applicable to the result. Favor immutable successor URLs and a tiny D1 head
  over mutable object replacement. Define separate positive-freshness and
  adverse-removal behavior; never use stale-while-revalidate as the sole
  withdrawal mechanism.

### Concern C — an empty numeric profile can masquerade as completion

- **What could go wrong:** C-prime is ratified with minimum/typical/maximum
  labels but no cardinalities, percentiles, burst duration, failure thresholds,
  or cost units, and teams later cite the label as evidence.
- **Why it matters:** Nothing can be tested or supported, and provider defaults
  become accidental promises.
- **Severity:** High.
- **Likelihood:** High unless the distinction is explicit.
- **Evidence/reasoning:** The current brief intentionally has no design-partner
  distribution or production-shaped baseline for internal figures.
- **Permanent fix:** Ratify the governing shape only if the exact formulation
  says an unfilled profile is **unqualified** and creates no advertised maximum.
  Tenant activation and any capacity claim require a complete numeric manifest
  plus dated evidence. The fixed public Core Web Vitals floor may be recorded
  now; internal numbers must not be invented.

## 2. Technical debt

**Material concern exists: Yes.**

### Concern A — one undifferentiated “capacity” value

- **What could go wrong:** A single tenant-size number hides that Pages, media,
  versions, locales, custom packages, editors, schedules, public traffic, and
  dynamic-list fan-out stress different resources.
- **Why it matters:** Raising one ceiling can create database, cache, build, or
  browser regressions elsewhere, and teams add feature-local exceptions.
- **Severity:** High.
- **Likelihood:** High.
- **Evidence/reasoning:** The Phase 23 source prompt names distinct Page-tree,
  public, search, scheduling, version-storage, and publishing measures. Current
  Vercel billing likewise separates compute, transfer, cache, images, builds,
  and observability.
- **Permanent fix:** One profile, multiple explicit dimensions: workload
  cardinalities; per-surface service budgets; resource ceilings; freshness and
  lateness; fairness; and unit cost. Keep shared measurement vocabulary and
  avoid feature-owned definitions of “large.”

### Concern B — duplicating provider state into product data

- **What could go wrong:** Vercel cache status, Function status, spend counters,
  or plan fields are persisted as editable tenant configuration or a parallel
  operational database.
- **Why it matters:** The copy becomes stale, migration-hostile, and falsely
  authoritative; ordinary staff are forced to understand infrastructure.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** D31 already defines a derived projection over source
  receipts, and D30 separates normal product use from governed diagnostics.
- **Permanent fix:** Store only versioned profile/configuration identity,
  minimal product receipts, and bounded evidence summaries. Vercel remains a
  telemetry/configuration source behind a typed adapter. D31 derives staff
  meaning; D30 opens detailed diagnostics. Do not create a second billing,
  cache, deployment, or incident system.

### Concern C — optimizations can become permanent special cases

- **What could go wrong:** Route-specific cache hacks, middleware exceptions,
  custom per-package build logic, or one-off query timeouts accumulate without
  profile ownership.
- **Why it matters:** The system becomes impossible to reason about and later
  Next/Vercel upgrades become risky.
- **Severity:** Medium-high.
- **Likelihood:** High during tuning.
- **Evidence/reasoning:** The current repository has useful local bounds but no
  cross-surface capacity contract; that is exactly when local fixes proliferate.
- **Permanent fix:** Every optimization must name the profile budget it serves,
  the invariant it preserves, its evidence, and its rollback. Prefer typed
  boundaries—compiled public view model, query contract, generation tags,
  workflow command—over route-name conditionals.

## 3. Edge cases

**Material concern exists: Yes.**

### Concern — the ordinary path is not the capacity path

- **What could go wrong:** The profile passes a warm, popular, single-locale
  Page and misses realistic combinations: first request after deploy; evicted
  CDN/ISR entry; low-traffic locale; custom domain; large but valid localized
  content; Site-wide package activation; 50-item D27 upload cohort; schedule
  burst; search rebuild; route rename; mass redirect; bot crawl; database
  failover; region latency; Preview expiry; rollback during revalidation; one
  noisy tenant; or immediate adverse withdrawal during an ordinary backlog.
- **Why it matters:** These are precisely the moments when donors see a slow or
  wrong page and staff most need trustworthy recovery.
- **Severity:** Critical for wrong/publicly unsafe results; High for degradation.
- **Likelihood:** Medium individually, High collectively.
- **Evidence/reasoning:** Vercel documents cold/miss, stale, eviction,
  revalidation-failure, request-collapsing, multi-domain, bot, and regional
  behavior. Ratified Phase 23 decisions already create high-fan-out and exact-
  generation cases.
- **Permanent fix:** The evidence matrix must cross minimum/typical/measured-
  maximum cohorts with cold/warm/evicted cache, mobile/desktop, popular/long-tail
  route, single/multi-tenant load, ordinary/adverse work, happy/failure/recovery,
  and exact locale/domain. Include deterministic fixtures for empty/new Sites,
  maximum labels/content, 404/410/redirect, unavailable dependencies, low field
  sample, clock skew, retries, duplicate delivery, and rollback. No single run
  may stand in for the matrix.

## 4. Footguns

**Material concern exists: Yes.**

### Concern A — a cost control can take fundraising offline

- **What could go wrong:** Team-wide Vercel Spend Management automatically
  pauses production when a threshold is reached, including healthy donor and
  missionary Sites, or triggers immediately when configured below current
  spend.
- **Why it matters:** A tool intended to cap cost can create the largest user-
  visible outage and interrupt giving during a campaign spike.
- **Severity:** Critical.
- **Likelihood:** Medium if configured casually.
- **Evidence/reasoning:** Vercel documents notification, webhook, and pause
  actions, periodic checks, team-wide scope, and immediate triggering against
  current spend.
- **Permanent fix:** Launch with graduated notifications and an operator webhook
  as the default posture. Any provider-wide pause requires a separately tested,
  human-owned incident decision—not an ordinary budget threshold. Use product-
  level backpressure to defer nonessential background work while preserving
  current public truth, adverse containment, and canonical giving surfaces.

### Concern B — broad invalidation and accidental dynamic rendering

- **What could go wrong:** A global/path-family purge, root request-time API,
  unbounded tag, or middleware matcher turns a narrow release into thousands of
  misses, Function invocations, database reads, and cache writes.
- **Why it matters:** It creates latency spikes, database pressure, and a bill
  from one editorial action.
- **Severity:** High.
- **Likelihood:** High without a compiler-owned invalidation contract.
- **Evidence/reasoning:** Next documents that request-time APIs can opt routes
  into dynamic rendering, layout invalidation can affect descendants, and cache
  tags apply across every consumer. Vercel bills the resulting compute,
  transfer, and durable cache work separately.
- **Permanent fix:** D1 alone emits bounded, exact-generation cache intents from
  the affected dependency closure. Enforce tag cardinality/format and operation
  limits; forbid tenant-input tags and global purges in ordinary publication;
  review middleware matchers; and test worst-case invalidation fan-out.

### Concern C — image and custom-package variant explosion

- **What could go wrong:** Arbitrary widths, qualities, formats, URLs, fonts,
  third-party scripts, or per-tenant bundles multiply transformations, cache
  writes, transfer, build time, and browser work.
- **Why it matters:** Media-heavy ministry Sites can become both slow and
  expensive while still looking correct in one desktop preview.
- **Severity:** High.
- **Likelihood:** High without closed manifests.
- **Evidence/reasoning:** Vercel's image cache key includes source, width,
  quality, and accepted format; D9 intentionally permits bespoke presentation.
- **Permanent fix:** D27 owns a small immutable rendition catalog and D9 owns
  closed responsive/image/font/script budgets. Choose exactly one transform
  owner per rendition path; allowlist source patterns, sizes, qualities, and
  formats; use correct `sizes`; and reject package variants that lack measured
  value. Do not double-transform already qualified immutable renditions.

## 5. Tenant safety

**Material concern exists: Yes.**

### Concern A — shared caches can leak or mix tenant output

- **What could go wrong:** Hostname, Site, locale, environment, generation, or
  permission context is absent from a cache key or tenant resolution falls back
  to a default, first, or slug-derived Tenant.
- **Why it matters:** One ministry's content, Preview, restricted person, or
  configuration can be served to another tenant's domain.
- **Severity:** Critical.
- **Likelihood:** Medium without structural negative tests.
- **Evidence/reasoning:** Vercel encourages one-codebase multi-domain apps and
  caching; D30 explicitly prohibits defaulting and client-selected scope.
- **Permanent fix:** Resolve exact host/domain to stable Tenant × environment ×
  Site before any shared cache lookup; fail unknown, duplicate, inactive, and
  ambiguous mappings without enumeration. Cache only public projections and
  include all result-changing scope/version dimensions. Private/admin/Preview
  responses are `private`/`no-store` and must never share a public cache path.

### Concern B — elastic compute can become a noisy-neighbor amplifier

- **What could go wrong:** Vercel scales Functions faster than Supabase/Postgres,
  Payload, search, media processors, or downstream APIs can accept work; one
  tenant consumes connections, memory, queue starts, transformations, or
  invalidations.
- **Why it matters:** Other tenants time out even though Vercel itself is
  healthy.
- **Severity:** Critical for shared outage; High for starvation.
- **Likelihood:** High under a real burst unless bounded.
- **Evidence/reasoning:** Vercel documents high automatic concurrency, while
  database connections remain finite and Core currently defaults Payload to a
  pool of two. Inngest flow-control controls have different loss/retry semantics.
- **Permanent fix:** Enforce per-Tenant and global admission limits at each
  scarce downstream resource. Separate public request serving from durable
  release/media/search work. Use tenant-keyed concurrency plus global resource
  ceilings, bounded queues and batches, adverse-work priority, and fair
  scheduling. Required effects may queue or reject before admission but may not
  be silently dropped by lossy rate limiting.

## 6. Overengineering

**Material concern exists: Yes.**

### Concern — capacity planning can become an infrastructure product

- **What could go wrong:** D33 introduces per-tenant Vercel projects, active-
  active databases, multiple CDNs, a custom billing engine, real-time cost
  allocation, tenant-configurable SLOs, arbitrary workload formulas, premature
  sharding, a second queue, or a bespoke observability platform before evidence
  supports them.
- **Why it matters:** It increases cost, operational surface, and failure modes
  while delaying the public CMS.
- **Severity:** High.
- **Likelihood:** High if “support everything” is interpreted as “build every
  infrastructure option.”
- **Evidence/reasoning:** Vercel already supplies a multi-tenant, multi-domain,
  single-codebase model, managed CDN, compute, cache, firewall, usage, and
  observability. Core already has Supabase/Postgres and Inngest seams.
- **Permanent fix:** Launch one shared Vercel multi-tenant topology unless
  measured isolation or plan limits prove otherwise; one profile; one Vercel
  adapter; one existing durable-work boundary; one D31/D30 operational UX. Use
  static/ISR/dynamic behavior route-by-route from measured needs. Sharding,
  multi-project deployment, multi-region writes, external search, or a second
  provider requires a measured trigger and separate decision.

## 7. UX/UI and user friction

**Material concern exists: Yes.**

### Concern A — infrastructure leaks into staff work

- **What could go wrong:** Staff see cache misses, Vercel Functions, ISR, queue
  depth, connection pools, spend units, or multiple retry controls; or a Publish
  action blocks until every downstream effect completes.
- **Why it matters:** Ministry staff cannot tell whether their content is saved,
  public, still processing, failed, or safe to retry. They may repeat actions or
  escalate normal background work.
- **Severity:** High.
- **Likelihood:** High unless the journey is explicitly owned.
- **Evidence/reasoning:** D1, D10, D13, D25, and D31 already distinguish saved,
  prepared, activated, delivered, and verified facts and require quiet,
  cause-owned UX.
- **Permanent fix:** Preserve one ordinary Edit → Preview → Publish journey.
  Give immediate local/server acknowledgement, then concise asynchronous states
  such as **Preparing**, **Published**, **Finishing public delivery checks**, or
  a plain cause-owned exception. Show what remains live and the next safe action.
  Routine healthy work stays quiet; provider detail lives under D30 diagnostics.

### Concern B — public performance can be optimized for averages, not people

- **What could go wrong:** Desktop lab tests and cache hits pass while mobile,
  lower-end devices, slow networks, long-tail routes, localized typography,
  custom motion, and first visits are poor. Essential content waits on client
  JavaScript or fake loading UI.
- **Why it matters:** Donors may abandon a giving journey, missionaries may look
  unavailable, and global ministry audiences are disproportionately affected.
- **Severity:** High.
- **Likelihood:** High if current test coverage is reused.
- **Evidence/reasoning:** Current Core lab coverage is narrow. Official Next
  guidance pairs production-mode lab tests with field Core Web Vitals and keeps
  client boundaries small.
- **Permanent fix:** Render meaningful navigation, mission content, identity,
  and canonical giving handoff in server output; use interactive islands rather
  than whole-page hydration; reserve dimensions; respect reduced motion; and
  gate P75 mobile and desktop LCP/INP/CLS by route family. Retain P95/P99 and
  cold/long-tail diagnostics even when the P75 gate passes.

### Concern C — overload UX can be dishonest or noisy

- **What could go wrong:** A staff action spins indefinitely, reports success
  when merely queued, displays a generic red dashboard, or asks the user to
  solve a platform capacity problem.
- **Why it matters:** Staff lose trust and duplicate work; normal providers'
  transient retries become alarm fatigue.
- **Severity:** High.
- **Likelihood:** Medium-high.
- **Evidence/reasoning:** D31 requires exception-first, freshness-aware status
  and separates staff action, automatic recovery, and platform ownership.
- **Permanent fix:** Every capacity exception names affected content/scope,
  visitor consequence, current public truth, responsible owner, last verified
  time, next check/deadline, and one valid action. Healthy/transient work is not
  surfaced. Never show a successful capacity or delivery claim from missing or
  stale evidence.

## 8. Hidden coupling

**Material concern exists: Yes.**

### Concern A — D1 becomes coupled to Vercel cache mechanics

- **What could go wrong:** A Vercel tag, deployment alias, cache purge, or ISR
  write is treated as the release transaction. A provider API change then
  changes product correctness.
- **Why it matters:** Rollback, migration, and incident recovery can publish
  partial or ambiguous state.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Ratified D1 explicitly makes provider convergence
  subordinate. Next and Vercel cache APIs have distinct lazy/immediate and
  deployment/domain semantics.
- **Permanent fix:** D1 commits one provider-neutral exact-generation head and
  emits idempotent delivery intents. A Vercel adapter maps those intents to
  current cache/deployment primitives and records receipts. Readback proves
  convergence; it never creates authority. Adapter version is pinned into the
  generation/evidence manifest.

### Concern B — compute region and database pool drift independently

- **What could go wrong:** A Vercel region is changed for cost or latency while
  Supabase remains elsewhere, increasing round trips and Function memory time;
  or Function concurrency rises without a corresponding database connection
  budget.
- **Why it matters:** A seemingly harmless provider setting degrades every
  dynamic and cold-cache request and can exhaust the database.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Vercel advises placing Functions close to their data
  source, and Supabase treats connections as a finite compute resource.
- **Permanent fix:** Qualify deployment topology as one unit: exact Vercel
  Function/ISR region, Supabase project/pooler mode, total pool allocation,
  per-instance pool, latency, concurrency, failover, and cost. A topology change
  invalidates the relevant evidence.

### Concern C — D27 and Vercel both try to own image transformation

- **What could go wrong:** D27 creates immutable qualified renditions and
  `next/image` transforms them again through an uncontrolled variant space.
- **Why it matters:** It duplicates CPU/storage/cache cost and can weaken the
  exact rendition/digest contract.
- **Severity:** High.
- **Likelihood:** High unless explicitly decided per path.
- **Evidence/reasoning:** Both products support transformation and caching.
- **Permanent fix:** The D27 public-rendition profile selects one transform owner
  and a closed browser-delivery set. Vercel may deliver/optimize only the paths
  expressly qualified by that profile; immutable pre-sized renditions may
  bypass another transformation where measurement supports it.

## 9. Failure modes

**Material concern exists: Yes.**

### Concern — distributed completion is mistaken for atomic success

- **What could go wrong:** A Function times out after a database commit; an
  Inngest acknowledgement is lost; cache invalidation partly converges; ISR
  regeneration fails; Vercel or Supabase is unavailable; a spend action pauses
  projects; or a deployment rollback runs while a newer generation is preparing.
  Retrying may duplicate work or activate an obsolete revision.
- **Why it matters:** Public truth becomes unknown at the exact moment staff need
  a reliable answer.
- **Severity:** Critical.
- **Likelihood:** Medium over time.
- **Evidence/reasoning:** Vercel preserves stale ISR output after regeneration
  failure; Function/network timeouts create ambiguous client outcomes; D1/D13
  already require idempotency, receipts, and expected-head CAS.
- **Permanent fix:** Every mutating command has a stable idempotency key,
  immutable intended generation, expected-head fence, durable product receipt,
  and inspect-before-retry path. The prior D1 generation remains serving until a
  complete successor CAS succeeds. Delivery effects reconcile independently,
  with bounded retry/dead letter and source-owned recovery. Degraded mode
  protects public reads and adverse containment first, then essential staff
  recovery, while deferring previews, reindexes, ordinary positive publishes,
  and other noncritical work in an explicit order.

## 10. Data integrity risks

**Material concern exists: Yes.**

### Concern A — cache or provider state becomes a shadow database

- **What could go wrong:** The newest ISR entry, deployment, provider job, or
  cache hit is read as “published,” even when it does not match the active D1
  generation.
- **Why it matters:** Reports, recovery, redirects, search, and public output
  disagree about what should be live.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Vercel caches can outlive deployments and are evicted,
  revalidated, or purged independently; D1 explicitly distinguishes active,
  cached, searchable, and visible facts.
- **Permanent fix:** Product records own desired and active generation identity.
  Provider records are receipts with exact generation and adapter version.
  Reconciliation compares desired, active, deployed, cached, searchable, and
  publicly probed facts without collapsing them.

### Concern B — capacity recovery rewrites history

- **What could go wrong:** To reduce storage or recover quickly, operators mutate
  bytes, versions, package pointers, or old generation records in place; a
  cached or scheduled reference then resolves to different content.
- **Why it matters:** Historical proofs, previews, rollback, and in-flight
  visitors become unverifiable.
- **Severity:** Critical.
- **Likelihood:** Low-medium, but consequence is severe.
- **Evidence/reasoning:** D1, D9, D25, and D27 all require immutable exact-version
  inputs and successor-based recovery.
- **Permanent fix:** Use immutable versions and content-addressed artifacts.
  Retention may delete only after reference, delivery, recovery, legal/safety,
  and cache-lifetime proof. Rollback and repair create a newly validated
  successor; they never overwrite a retained identity.

## 11. Security and privacy risks

**Material concern exists: Yes.**

### Concern A — private state enters public caching or telemetry

- **What could go wrong:** Authenticated Web Studio, D25 Preview, diagnostic,
  signed URL, query string, content title, person identity, or full URL is cached
  publicly or emitted as a high-cardinality Vercel metric/log dimension.
- **Why it matters:** It can expose private candidate content, donor/missionary
  information, restricted ministry facts, and tenant identifiers.
- **Severity:** Critical.
- **Likelihood:** Medium without allowlists and negative tests.
- **Evidence/reasoning:** Speed Insights and Web Vitals naturally carry route/URL
  context; current Core's dormant beacon includes full URL and user agent. D25
  requires private no-store/noindex Preview.
- **Permanent fix:** Maintain an explicit response/cache matrix: public compiled
  projection may cache; authenticated, Preview, diagnostics, errors containing
  private context, and unknown tenant never do. Redact URLs to bounded route
  families before telemetry; allowlist dimensions; sample deliberately; prohibit
  content, query strings, signed tokens, actor IDs, and raw provider payloads;
  enforce retention and role-gated diagnostics.

### Concern B — cost protection harms legitimate donors

- **What could go wrong:** Aggressive bot challenges, rate limits, or attack mode
  block assistive technology, shared networks, payment callbacks, search
  crawlers, or real campaign traffic.
- **Why it matters:** The system appears secure and inexpensive while excluding
  intended audiences or breaking giving.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Vercel notes that attack controls can affect legitimate
  traffic and supports bypass rules; D9/D32 require accessible public behavior.
- **Permanent fix:** Start with platform DDoS protection and measured, route-
  specific controls. Separately protect expensive anonymous write/search/form
  paths from cached public reads. Test screen readers, no-JS, privacy tools,
  shared networks, payment/provider callbacks, and canonical crawlers. Any bypass
  is narrow, authenticated/signed where applicable, monitored, and never a
  global allow.

## 12. Scalability and performance risks

**Material concern exists: Yes.**

### Concern A — public requests repeatedly compile or query source graphs

- **What could go wrong:** Every page view resolves Payload relationships,
  dynamic lists, media, routes, locale fallbacks, and package configuration from
  the database, creating N+1 queries and origin work.
- **Why it matters:** Traffic and content complexity multiply together, harming
  donors and exhausting Supabase even though the content changed rarely.
- **Severity:** Critical at scale.
- **Likelihood:** High without the D1 boundary.
- **Evidence/reasoning:** D1 already requires a flat allowlisted compiled public
  projection; official Next/Vercel guidance uses server rendering, caching, and
  ISR to avoid repeated origin work.
- **Permanent fix:** D1 prepares bounded, flat, versioned public projections and
  package artifacts outside the public request. Public rendering reads one
  active generation with fixed-depth DTOs, no raw Payload graph or mutable
  `latest`. Cache eligible complete output; keep source-owned live data behind
  explicit bounded adapters and adverse-first rules.

### Concern B — deploy-time pre-rendering explodes with pages, locales, and Sites

- **What could go wrong:** A code deployment attempts to prebuild every tenant
  Page and locale, producing enormous output, long build queues, and failed
  deployments.
- **Why it matters:** One large tenant can delay platform fixes for every tenant.
- **Severity:** High.
- **Likelihood:** High at the target scale.
- **Evidence/reasoning:** Vercel documents longer builds with very large output
  counts and recommends ISR/on-demand generation for large page sets. D1 treats
  content releases separately from application deployment.
- **Permanent fix:** Build platform/package code once; do not rebuild the whole
  tenant corpus on every code commit or edit. Pre-render only a measured hot
  subset if evidence supports it, generate other exact-generation routes on
  demand with request collapse and bounded origin access, and allow D1 to warm
  critical routes after activation within a budget. Prioritize production
  platform builds over routine Preview work.

### Concern C — custom presentation overwhelms the browser

- **What could go wrong:** Tenant uniqueness grows client JavaScript, CSS, fonts,
  animations, third-party scripts, DOM size, image bytes, and hydration work
  without bound.
- **Why it matters:** Vercel origin metrics may look excellent while INP, LCP,
  memory, battery, and accessibility fail for visitors.
- **Severity:** High.
- **Likelihood:** High because bespoke design is a core requirement.
- **Evidence/reasoning:** D9 already requires per-package budgets and standard
  fallback; Next recommends Server Components, narrow client boundaries,
  code-splitting, font/image optimization, and bundle analysis.
- **Permanent fix:** Enforce D9's exact artifact and route-family budgets in the
  D33 cohorts: client JS, CSS, fonts, DOM, image bytes/variants, main-thread work,
  hydration, long tasks, LCP/INP/CLS, reduced motion, and no-JS essential
  content. Qualify on representative lower-end mobile devices and actual tenant
  content, not an empty component showcase.

## 13. Operational burden

**Material concern exists: Yes.**

### Concern — the profile decays into tribal knowledge

- **What could go wrong:** Engineers manually compare Vercel dashboards,
  Supabase charts, Inngest runs, Lighthouse files, and spreadsheets; no one knows
  which plan/region/limits produced the last passing evidence.
- **Why it matters:** Capacity claims age silently and incident response depends
  on the person who remembers a dashboard setting.
- **Severity:** High.
- **Likelihood:** High without executable documentation.
- **Evidence/reasoning:** Relevant evidence already spans browser, Vercel,
  Payload, Supabase, Postgres, Inngest, D1 receipts, search, and media.
- **Permanent fix:** Make the profile and Vercel attachment code-owned,
  reviewable, and machine-readable, with human-readable generated evidence.
  Record commit, dependency pins, dataset digest, environment/topology, settings
  digest, cold/warm state, samples, errors, percentiles, resource units, and
  limitations. Automate drift checks for code-owned settings; use a short
  operator runbook for dashboard-only settings. Requalify on relevant dependency,
  provider configuration, cohort, or product-promise change—not on an arbitrary
  ceremony calendar alone.

## 14. Observability gaps

**Material concern exists: Yes.**

### Concern A — green fragments can hide a failed journey

- **What could go wrong:** Vercel reports a fast Function, Supabase reports spare
  connections, and Inngest reports completion, but the donor route is stale,
  cache convergence is overdue, or the staff action never reached D1.
- **Why it matters:** Operators get false confidence and staff see a false
  favorable status.
- **Severity:** Critical for false healthy publication; High otherwise.
- **Likelihood:** High without cross-boundary correlation.
- **Evidence/reasoning:** D31 explicitly requires current success watermarks and
  treats missing/stale evidence as incomplete. Vercel events are provider-level,
  not D1 product outcomes.
- **Permanent fix:** Carry one privacy-safe correlation chain through product
  command, D1 generation, Inngest work, provider adapter, database transaction,
  cache/search/media receipt, and public probe. Preserve source authority and
  join in diagnostics rather than copying payloads. D31 shows only visitor
  impact, owner, freshness, and recovery; D30 exposes exact provider evidence.

### Concern B — only averages and warm paths are visible

- **What could go wrong:** Averages hide tail latency, long-tail routes, rare
  locales, first visits, cache misses, errors, throttles, queue age, and cost
  outliers. Low-traffic tenants lack enough field samples but appear healthy.
- **Why it matters:** The most vulnerable users and smallest ministries are
  excluded from evidence.
- **Severity:** High.
- **Likelihood:** High.
- **Evidence/reasoning:** Speed Insights defaults to P75 and permits higher
  percentiles; lower sampling reduces cost and can reduce accuracy. Current Core
  has no confirmed Phase 23 field consumer.
- **Permanent fix:** Gate public Web Vitals at P75 by device and route family,
  retain P95/P99 for diagnosis, and measure server/database/queue tails with
  named percentiles. Label insufficient samples as insufficient, not passing.
  Pair field data with deterministic lab and synthetic cold/miss probes.
  Version sampling, redaction, route grouping, and retention; include telemetry
  cost in the profile.

### Concern C — provider spend cannot explain tenant behavior safely

- **What could go wrong:** Team-level Vercel usage grows, but the system cannot
  tell whether the cause is a public route family, a package, bot traffic,
  invalidation storm, media variant, or background job without logging tenant
  identities/content as high-cardinality dimensions.
- **Why it matters:** Cost control becomes guesswork or creates a privacy leak.
- **Severity:** High.
- **Likelihood:** Medium-high.
- **Evidence/reasoning:** Vercel usage is primarily team/project/region/resource
  oriented; Core is multi-tenant.
- **Permanent fix:** Measure product-safe unit costs at bounded route/workload
  families and opaque Site/package cohorts: per thousand public views, cold
  render, publish closure, schedule, search document, media transform, stored
  version, and Preview candidate. Use bounded tags and offline joins behind
  D30—not raw tenant/content labels in Vercel metrics.

## 15. Dependency and integration risks

**Material concern exists: Yes.**

### Concern — provider and framework contracts drift at different speeds

- **What could go wrong:** Vercel renames billing resources, changes defaults or
  limits, modifies cache/observability behavior, or deprecates an API while the
  Next preview, Payload internal build, Supabase pooler, and Inngest runtime also
  evolve.
- **Why it matters:** A passing integration can become costly, slow, or
  incorrect without a product change.
- **Severity:** High.
- **Likelihood:** High over time.
- **Evidence/reasoning:** Current Vercel documentation already uses both CDN
  Requests and Edge Requests in different surfaces, distinguishes legacy/fluid
  billing, and prices resources regionally. The branch dependencies are not
  stable public pins.
- **Permanent fix:** Put provider names, plans, APIs, billing dimensions,
  regions, and feature flags only in versioned adapter/qualification manifests.
  Contract-test exact provider and dependency pins, pin every runtime adapter,
  and require a controlled requalification/rollback on change. Provider-neutral
  means replaceable authority and evidence—not pretending implementations are
  identical.

## 16. Migration and upgrade risks

**Material concern exists: Yes.**

### Concern — Vercel mechanics become canonical data

- **What could go wrong:** Product schemas store Vercel deployment IDs, region
  codes, cache tags, URLs, spend meters, or Function names as durable semantic
  identity; moving projects, changing regions, upgrading Next, or using another
  provider requires rewriting public history.
- **Why it matters:** Provider migration can corrupt generation references or
  force a risky big-bang cutover.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** D1 already has provider-neutral generation identity
  and D27 treats storage/CDN systems as adapters.
- **Permanent fix:** Product records use opaque stable domain identity and exact
  artifact/generation digests. Provider locators live in versioned bindings and
  receipts. Caches are rebuilt, not migrated as truth. A successor provider
  replays immutable active generations, validates public probes and adverse
  behavior, then changes a small serving binding with rollback; no historical
  generation is rewritten.

### Concern — a framework upgrade changes caching semantics

- **What could go wrong:** A Next upgrade changes default rendering, cache keys,
  revalidation, image behavior, or client bundle output while the same profile
  version remains marked qualified.
- **Why it matters:** Public freshness, cost, and Core Web Vitals regress without
  a schema change.
- **Severity:** High.
- **Likelihood:** High across major/preview upgrades.
- **Evidence/reasoning:** Current bundled Next docs are 16.2.6 while the branch
  declares a newer preview.
- **Permanent fix:** Exact Next build/source, Vercel runtime/configuration, D1
  compiler, package SDK, and adapter versions are part of the evidence identity.
  Any behavior-affecting upgrade reruns contract, cache, build, route, package,
  failure, and cost cohorts before activation.

## 17. Other development hazards

**Material concern exists: Yes.**

### Concern A — races and test artifacts create false proof

- **What could go wrong:** Two publishes, publish versus rollback, route move
  versus cache invalidation, schedule versus edit, or deployment versus package
  activation race. Load tests accidentally reuse warmed fixtures, omit errors,
  or run against production and create cost/data damage.
- **Why it matters:** The evidence says “passes” while the production race can
  still publish stale content or exhaust resources.
- **Severity:** Critical for release races; High for false evidence.
- **Likelihood:** Medium-high.
- **Evidence/reasoning:** D1/D10/D13 require CAS, generation fencing, and
  idempotency precisely because these races are realistic. Current performance
  tests are not production-shaped.
- **Permanent fix:** Build deterministic concurrency/fault tests with expected-
  head fences, duplicate/out-of-order events, timeout-after-commit, clock skew,
  cache eviction, deployment skew, and rollback. Run capacity tests only in an
  isolated production-shaped environment with synthetic/nonproduction data,
  explicit cost ceiling, cleanup, and a test-run identity. Compare warm and cold
  evidence; fail on missing samples and unaccounted errors.

### Concern B — optimization without a rollback path

- **What could go wrong:** A caching, region, memory, middleware, build, image,
  or sampling change reduces one chart but breaks freshness, security, field
  coverage, or user experience.
- **Why it matters:** Cost work becomes speculative production change.
- **Severity:** High.
- **Likelihood:** Medium-high.
- **Evidence/reasoning:** Many Vercel settings trade one resource against another;
  lower telemetry sampling also reduces accuracy.
- **Permanent fix:** Every material optimization is a versioned candidate with
  hypothesis, affected budgets/invariants, baseline, production-shaped proof,
  canary/controlled activation where appropriate, success/abort thresholds, and
  rollback. Never claim savings without current provider usage evidence.

## Ruthless synthesis

### Must be fixed in the D33 formulation before ratification

1. **Separate product contract from deployment qualification.** Name one
   provider-neutral Production Capacity Profile and one subordinate, versioned
   Vercel Qualification Attachment. Do not put Vercel plan/SKU fields in tenant or
   product-domain state.
2. **Make “incomplete” binding.** Ratification may approve the profile's shape,
   authority, and proof gates, but an unfilled numeric manifest is unqualified.
   It cannot support an advertised maximum, tenant activation, provider claim,
   or “production ready” assertion.
3. **Preserve one D1 authority.** A deployment, alias, build, Function,
   cache/ISR/runtime-cache/image result, invalidation, public probe, or Vercel
   dashboard status can never activate or define public truth.
4. **Define generation-safe caching.** Public cache identity and invalidation
   must be exact-scope, exact-generation, compiler-owned, bounded, and tested
   across custom domains and locales. Authenticated/Preview/diagnostic/private
   responses never enter public caches. Adverse removal cannot rely on ordinary
   stale-while-revalidate.
5. **Define the actual workload.** Minimum, typical, and measured-maximum cohorts
   must enumerate numeric Sites, domains, locales, Pages/tree depth, records,
   media, redirects, navigation, versions, packages, dynamic-list/search fan-
   out, concurrent editors/autosaves/previews/publishes/schedules, and public
   traffic, including burst and duration.
6. **Define surface and resource budgets.** Include user latency, Core Web
   Vitals, availability/error, freshness/lateness, throughput, queue age,
   database connections/query/lock/storage/write amplification, browser
   artifacts/main-thread work, and Vercel compute/transfer/cache/image/build/
   observability/firewall units. Use P75 field Web Vitals plus tail diagnostics;
   do not reduce capacity to averages.
7. **Protect tenants and the database.** Prove per-Tenant and global concurrency,
   admission, queue, batch, memory, connection, transform, invalidation, and
   cost boundaries. Public truth and adverse work have explicit priority;
   required effects are not dropped by lossy rate limiting.
8. **Make degradation deliberate.** Current public truth remains available;
   nonessential work defers in a documented order; every rejected/deferred/
   unknown action has a source-owned receipt, owner, next check, and safe retry.
   A cost threshold does not automatically pause all public Sites.
9. **Keep the user journeys quiet.** Donors see complete server-rendered
   essentials and recognizable giving. Staff see ordinary saved/preparing/
   published/finishing states and one cause-owned action. D31 summarizes real
   exceptions; D30 holds provider diagnostics.
10. **Require reproducible evidence.** Exact code/dependency/provider settings,
    dataset digest, topology, cache state, tenant mix, samples, errors,
    percentiles, resource units, costs, query plans, privacy posture, and known
    limitations travel with every result. Cold, warm, eviction, failure,
    recovery, noisy-neighbor, mobile, long-tail, and adverse cases are mandatory.

### Should be addressed immediately after the shape is ratified

1. Collect design-partner distributions and growth assumptions; fill every
   cohort cardinality with evidence, not intuition.
2. Produce an isolated production-shaped baseline against the exact current
   Next, Payload, Supabase, Inngest, D1 compiler, D9 package, and Vercel
   topology. Resolve any promise that is technically impossible or economically
   irresponsible before activation.
3. Choose and document the single D27/Vercel image-transform owner for each
   public path and close the width/quality/format/origin variant space.
4. Add privacy-reviewed field telemetry by bounded route family and device,
   plus synthetic cold/miss probes and database/queue/resource evidence. Set
   sampling from required confidence and observed volume, not an arbitrary
   percentage.
5. Configure provider usage notifications and a cause-owned operator webhook;
   test the human response. Do not enable an automatic all-project pause as a
   routine cost cap.
6. Qualify the exact Vercel plan/project/region/compute/cache/build/security/
   observability settings and record the settings digest. Exact dollar rates
   remain in dated operations evidence, not the product profile.

### Monitor with evidence; do not prebuild speculative machinery

- provider price, product-name, plan-limit, cache, and observability changes;
- field P75 gates and P95/P99 tails by device/route family, including insufficient
  sample coverage;
- cache hit/miss/stale/revalidation, invalidation fan-out, cold render, and public
  convergence;
- Function Active CPU, Provisioned Memory, invocations, errors, timeouts,
  throttling, and external/database latency;
- CDN/Edge Requests, Fast Data Transfer, Fast Origin Transfer, ISR/Runtime Cache
  reads/writes, image variants, build work, and telemetry usage;
- Supabase connections, pool wait, slow queries, scans, locks, storage and
  version growth, and write amplification;
- Inngest queue age, tenant/global concurrency, retries, exhausted work,
  lateness, and dead letters;
- noisy-neighbor concentration, bot/crawler amplification, WAF false positives,
  and spend-alert response; and
- profile/evidence drift after provider, dependency, cohort, route, package, or
  product-promise change.

Do **not** launch multi-cloud serving, per-tenant Vercel projects, active-active
Postgres, sharding, a custom billing engine, a second queue, tenant-configurable
SLOs, or a new observability product until measured evidence establishes a
specific need that the bounded launch architecture cannot meet.

## Recommended amended decision direction

The adversarially sound decision is not merely “one provider-neutral capacity
profile.” It is:

> **C-prime-amended-and-hardened (C-prime-R) — One versioned,
> provider-neutral Production Capacity Profile with a subordinate exact Vercel
> Qualification Attachment, evidence-calibrated minimum/typical/measured-maximum
> cohorts, generation-safe public caching, public-experience and staff-workflow
> floors, tenant-fair resource and cost budgets, explicit overload priorities,
> quiet cause-owned recovery, and an unqualified-until-complete evidence gate.**

The exact ratification brief should expand that direction into binding clauses.
This review does not itself ratify D33 or choose internal numeric values, a
Vercel plan, region, project topology, Function configuration, cache strategy,
observability vendor/sampling rate, database size, or exact Payload release.

## Primary sources

### Vercel

- [Pricing overview](https://vercel.com/docs/pricing)
- [Manage and optimize usage](https://vercel.com/docs/pricing/manage-and-optimize-usage)
- [Spend Management](https://vercel.com/docs/spend-management)
- [Fluid compute pricing](https://vercel.com/docs/functions/usage-and-pricing)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Function regions](https://vercel.com/docs/functions/configuring-functions/region)
- [Concurrency scaling](https://vercel.com/docs/functions/concurrency-scaling)
- [CDN pricing and usage](https://vercel.com/docs/manage-cdn-usage)
- [Incremental Static Regeneration](https://vercel.com/docs/incremental-static-regeneration)
- [ISR usage and pricing](https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing)
- [Image Optimization](https://vercel.com/docs/image-optimization)
- [Image Optimization limits and pricing](https://vercel.com/docs/image-optimization/limits-and-pricing)
- [Managing Image Optimization costs](https://vercel.com/docs/image-optimization/managing-image-optimization-costs)
- [Observability](https://vercel.com/docs/observability)
- [Managing Observability usage](https://vercel.com/docs/manage-and-optimize-observability)
- [Managing Speed Insights usage](https://vercel.com/docs/speed-insights/managing-usage)
- [Vercel Firewall](https://vercel.com/docs/vercel-firewall)
- [DDoS mitigation](https://vercel.com/docs/vercel-firewall/ddos-mitigation)
- [Bot Management](https://vercel.com/docs/bot-management)
- [Managing builds](https://vercel.com/docs/builds/managing-builds)
- [Deployment retention](https://vercel.com/docs/deployment-retention)
- [Vercel limits](https://vercel.com/docs/limits)
- [Multi-tenant applications on Vercel](https://vercel.com/kb/guide/nextjs-multi-tenant-application)

### Next.js, Web Vitals, Payload, Supabase, and Inngest

- Installed Next `16.2.6` App Router production, analytics, Cache Components,
  `use cache`, `revalidateTag`, `revalidatePath`, and Image documentation under
  `node_modules/next/dist/docs/01-app/`
- [Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)
- [Payload query overview](https://payloadcms.com/docs/queries/overview)
- [Payload versions](https://payloadcms.com/docs/versions/overview)
- [Payload queues and runners](https://payloadcms.com/docs/jobs-queue/queues)
- [Supabase connection management](https://supabase.com/docs/guides/database/connection-management)
- [Supabase query optimization](https://supabase.com/docs/guides/database/query-optimization)
- [Inngest flow control](https://www.inngest.com/docs/guides/flow-control)
- [Inngest concurrency](https://www.inngest.com/docs/guides/concurrency)
- [Inngest throttling](https://www.inngest.com/docs/guides/throttling)
