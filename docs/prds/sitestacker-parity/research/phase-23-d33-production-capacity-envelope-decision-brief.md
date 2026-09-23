# Phase 23 D33 — Production Capacity Envelope Decision Brief

**Status:** Founder-ratified as Phase 23 D33 on 2026-08-24 after current
primary-source research, a complete UX/service-journey contract, and a ruthless
17-category adversarial review.  
**Date:** 2026-08-24  
**Decision owner:** Founder  
**Scope:** Provider-neutral production capacity policy for Web Studio,
publication, and the public runtime, with a version-pinned Vercel qualification
attachment for the intended launch host

## Ratified decision

Phase 23 ratifies the exact hardened C-prime-R contract below: one versioned,
provider-neutral **Production Capacity Profile** plus one version-pinned
**Vercel Qualification Attachment** for the intended launch host, rather than
implementation-local limits or one undifferentiated launch ceiling.

The founder selected C-prime and directed that the launch design use Vercel
well without making Vercel product vocabulary into domain truth. This brief
records the exact ratified C-prime-R. Ratification does not choose an exact
Payload version, authorize implementation, inspect a live Vercel project, or
invent unsupported numeric CMS promises. D33 settles the permanent contract
and proof rules; an initial active profile still cannot be promoted until every
required numeric cohort and budget cell is filled from design-partner evidence
and a production-shaped baseline.

## Why this is the next founder decision

The source prompt moves directly from accessibility in section 44 to
**Performance and scale** in section 45. That section requires research into
design-partner volumes and production-shaped tests for hundreds of content
records, thousands of Pages, large media libraries, many redirects, versions,
locales, Sites, complex dynamic lists, Page-tree operations, public Core Web
Vitals, search latency and reindexing, simultaneous schedules, database growth,
publication, cache invalidation, redirect activation, and scheduled lateness.
It separately treats exact Payload qualification as later evidence work.

D32 is now ratified. The decision log therefore says explicitly that D1–D32
still do not decide production capacity budgets or the exact qualified Payload
version, and that remaining founder decisions are resolved one at a time
([decision log, lines 9458–9464](../phase-23-web-studio-cms-decision-log.md)).

## What earlier decisions already require

D33 does not start from a blank sheet. Ratified decisions already require:

- D1 exact-generation publication and adverse-containment work that remains
  safe under high fan-out.
- D9 versioned JavaScript, CSS, font, image, route, Core Web Vitals, and motion
  budgets backed by production-shaped lab and field evidence.
- D10 bounded-concurrency all-locale preparation.
- D12 measured minimum, typical, and maximum editorial cohorts, including
  autosave, history-query, write, storage, and editor-latency proof.
- D14–D17 bounded composition, server paging, dynamic-list fan-out, indexed
  search, reindexing, and convergence.
- D22–D31 bounded release, preview, media, public rendering, migration,
  authorization, and operational-health work with fairness, cost, query, queue,
  and evidence-freshness budgets.
- D32 accessibility checks whose editing and D1 evaluation cost must remain
  bounded; no per-keystroke whole-Site scan or remote release dependency.

The missing decision is not whether individual features should be fast. It is
the common, measurable contract that tells every feature owner and every
provider candidate what **fast enough, large enough, fair enough, and safely
overloaded** mean.

## Current Core seams and what they prove

### Measurement exists, but it is not yet a Phase 23 capacity system

- `lighthouserc.json:3-45` runs three desktop lab samples against `/`, `/login`,
  and `/register`. It gates LCP at 2.5 seconds and CLS at 0.1, plus several
  Lighthouse proxies. It does not cover donor route families, Web Studio,
  mobile, field percentiles, tenant cohorts, or sustained load.
- `tests/e2e/performance.spec.ts:1-107` measures selected homepage/login timings
  in `next dev`. Its LCP assertion is conditional when the observer returns no
  value, it does not measure INP, and the ordinary `test:e2e` script explicitly
  excludes `@perf`. `validate:full` does include `test:perf`, so the seam is
  useful but not representative capacity proof (`package.json:50-73,136-137`).
- `packages/lib/monitoring/web-vitals.ts:3-97` already knows LCP, INP, CLS, FCP,
  and TTFB thresholds and can beacon them to an endpoint. No consumer of its
  exported initialization functions was found under `apps/` or `packages/`, so
  it is an available library seam rather than confirmed production field
  telemetry. Its payload includes the full URL and user agent, which requires a
  privacy/cardinality review before activation.

These are good starting points. Treating their current route list or local
thresholds as the product capacity envelope would silently exclude most of the
Phase 23 system.

### Web Studio inherits useful Payload bounds, not a proven workload envelope

- Web Studio is a native Mission Control shell around Payload. Payload still
  owns list queries, paging controls, forms, drafts, versions, uploads, and
  Lexical (`apps/admin/src/cms-ui/web-studio/README.md:1-27` and
  `docs/guides/architecture/web-studio-living-spec.md:11-19`).
- The shared list view consumes Payload's `useListQuery`, renders only the
  returned `docs`, and keeps `PageControls`
  (`NativeCollectionListView.tsx:157-260`). That is a sound server-paged seam;
  it is not proof of search, sort, expansion, or move latency at target scale.
- The exact installed Payload artifact defaults collection and version queries
  to pagination with a limit of 10 when no limit is supplied
  (`payload/dist/collections/operations/find.js:34,75-77` and
  `payload/dist/collections/operations/findVersions.js:25,71-73`). A default
  page size is a safety primitive, not a capacity promise.
- Draft-enabled Core collections use a 300 ms autosave interval, while no
  collection-specific `maxPerDoc` appears in the version builder
  (`apps/admin/src/cms/collections/page-builders.ts:568-576`). D12 already
  requires retention, write amplification, recovery, and history-query proof;
  the provider default cannot substitute for it.
- Public Payload reads generally use explicit low limits, `depth: 0`, and
  `pagination: false` for unique or bounded queries
  (`apps/admin/src/cms/public/published-content-reader.ts` and
  `apps/admin/src/cms/public/resolve-tenant.ts`). Those are good query-shaping
  patterns, but the repository has no Phase 23 fixture that combines thousands
  of Pages, locales, redirects, versions, Sites, and concurrent publication.

### The database seam is deliberately bounded, but the number is operational

`apps/admin/src/cms/payload-database-config.ts:11-16,179-204` defaults hosted
Payload pools to two connections with five-second connection and idle timeouts,
allows an explicit pool maximum, and routes hosted deployments toward the
Supavisor session pooler. `apps/admin/payload.config.ts:112-118` passes those
options to the Postgres adapter.

That protects a serverless deployment from unconstrained per-instance pools.
It does not prove that two connections meet Web Studio concurrency, autosave,
publication, search, and schedule workloads; nor does increasing the pool prove
the database has capacity. D33 must relate application concurrency to the total
database connection budget, query plans, lock time, queueing, and tenant
fairness.

### Durable workflow fairness exists, but its present limits are not CMS budgets

Core already runs Inngest `4.5.1` through `packages/api`; this is not a proposed
new provider adoption. Existing functions apply tenant-keyed concurrency to the
workflow smoke, Stripe-event, donation-recovery, and inbound-email paths, while
inbound email also uses a global start throttle
(`packages/api/src/workflows/functions/*.ts`). Those seams demonstrate the
right ownership pattern: shared infrastructure can protect both an individual
Tenant and the common downstream resource without exposing queue machinery to
staff.

Their current numeric values are domain-specific and cannot become Phase 23
defaults by analogy. Publication, scheduling, search convergence, media work,
and Preview have different correctness and lateness contracts. D33 must define
their outcomes first, then reuse or qualify the existing durable-execution seam
only where it satisfies those outcomes.

### The dependency pins are qualification inputs, not product truth

The branch declares Next `16.3.0-preview.9` and Payload
`4.0.0-internal.1f9ae9a` (`package.json:171-176,225-232`). The exact installed
Payload package identifies that internal version and depends on `@next/env`
`16.2.6`. The Next documentation available in the current main checkout is also
16.2.6, whereas the branch declares a newer preview.

The bundled Next docs are still useful for the stable measurement seams below,
but they cannot qualify the declared preview. Likewise, current Payload web
documentation describes supported behavior, while the internal commit's source
and tests remain authoritative for the exact candidate. This version mismatch
is another reason to freeze provider-neutral acceptance criteria first.

## Primary-source findings

### Web Vitals: a public experience floor can be numeric now

The official Core Web Vitals threshold methodology recommends evaluating the
75th percentile of page loads, segmented by device, and classifies a good
experience as:

- LCP at or below **2.5 seconds**;
- INP at or below **200 milliseconds**; and
- CLS at or below **0.1**.

Source: [web.dev — Defining Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds).

These are suitable public-runtime floors because they are provider-neutral and
already align with D9. They do not replace route-specific lab diagnostics,
tail-percentile inspection, availability, correctness, cache freshness, or
server capacity. A single green Lighthouse run is not field evidence.

### Next and Vercel: combine lab and field data, with explicit sampling

The installed Next docs describe two supported collection paths: a small client
component using `useReportWebVitals`, or a managed analytics service. They also
recommend keeping that client boundary isolated, sending metrics with
`sendBeacon`/`fetch`, and retaining metric IDs so distributions can be built.
The production checklist explicitly pairs simulated Lighthouse testing with
field Core Web Vitals and production-mode `next build`/`next start` proof.

Local sources read for the installed version:

- `node_modules/next/dist/docs/01-app/02-guides/analytics.md`
- `node_modules/next/dist/docs/01-app/02-guides/production-checklist.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-report-web-vitals.md`

Vercel Speed Insights uses P75 by default and exposes higher percentiles. Its
SDK supports a sampling rate and a `beforeSend` hook, while Vercel documents
that lower sampling reduces cost but also reduces accuracy. The service records
route/URL and device/network/browser context, so privacy, URL redaction,
cardinality, retention, sampling accuracy, and cost are product constraints—not
installation details.

Sources:

- [Vercel Speed Insights metrics](https://vercel.com/docs/speed-insights/metrics)
- [Vercel Speed Insights package and sampling](https://vercel.com/docs/speed-insights/package)
- [Vercel Speed Insights privacy](https://vercel.com/docs/speed-insights/privacy-policy)
- [Vercel Speed Insights usage](https://vercel.com/docs/speed-insights/managing-usage)

D33 should therefore require a field-telemetry interface and evidence schema,
not require Vercel as the only provider. A Vercel adapter may implement that
interface after privacy and cost review.

### Payload: defaults bound individual calls; qualification must prove the system

Current official Payload documentation says:

- collection queries paginate by default, with a default limit of 10;
- queries should use indexes, minimum necessary relationship depth, low limits,
  and `select` when only some fields are needed;
- versions live in additional storage, version lists are paginated, and
  `maxPerDoc` defaults to 100 while `0` means unlimited;
- autosave interval is configurable;
- scheduled workflows enqueue jobs, but a runner must execute them; in
  serverless environments an external trigger is needed;
- task retries and concurrency are configurable, and workflow concurrency keys
  can prevent or limit overlapping work.

Sources:

- [Payload pagination](https://payloadcms.com/docs/queries/pagination)
- [Payload query overview](https://payloadcms.com/docs/queries/overview)
- [Payload versions](https://payloadcms.com/docs/versions/overview)
- [Payload autosave](https://payloadcms.com/docs/versions/autosave)
- [Payload jobs overview](https://payloadcms.com/docs/jobs-queue/overview)
- [Payload queues and runners](https://payloadcms.com/docs/jobs-queue/queues)
- [Payload schedules](https://payloadcms.com/docs/jobs-queue/schedules)
- [Payload tasks](https://payloadcms.com/docs/jobs-queue/tasks)
- [Payload workflow concurrency](https://payloadcms.com/docs/jobs-queue/workflows)

None of those defaults claim that Core's Page tree, dynamic lists, versions,
locales, publication fan-out, or schedules meet Core's workload. The exact pin
must be tested for query shape, indexes, UI behavior, runner semantics, retries,
and regressions. Provider docs are design inputs, not acceptance evidence.

### Supabase and Postgres: connection count and indexes require observed workload

Supabase documents database connections as a finite compute resource and
recommends sizing pool allocation from actual peak usage, observing
`pg_stat_activity`, and finding idle-in-transaction sessions. Its query guidance
requires indexes matched to real predicates and ordering, current planner
statistics, and care against over-indexing because every index adds write and
storage cost. `pg_stat_statements` and Supabase Inspect expose total, mean, and
maximum query time, scans, locks, cache behavior, and connection pressure.

Sources:

- [Supabase connection management](https://supabase.com/docs/guides/database/connection-management)
- [Supabase query optimization](https://supabase.com/docs/guides/database/query-optimization)
- [Supabase Postgres indexes](https://supabase.com/docs/guides/database/postgres/indexes)
- [Supabase `pg_stat_statements`](https://supabase.com/docs/guides/database/extensions/pg_stat_statements)
- [Supabase database inspection](https://supabase.com/docs/guides/database/inspect)

The capacity harness must capture database-level evidence alongside browser and
application timings. “The query has an index” and “the pool did not exhaust in
one run” are not sufficient conclusions.

### Inngest: concurrency, throttling, and rate limiting have different semantics

Current Inngest documentation distinguishes three controls that must not be
treated as interchangeable:

- concurrency limits executing steps and can use Tenant keys to prevent a
  noisy neighbor from consuming shared capacity;
- throttling delays excess function starts in a queue and is appropriate for
  smoothing a burst; and
- rate limiting skips excess runs, so it is lossy and is not safe for a
  required publication or convergence effect unless the source contract has an
  independent durable recovery path.

Sources:

- [Inngest flow control](https://www.inngest.com/docs/guides/flow-control)
- [Inngest concurrency](https://www.inngest.com/docs/guides/concurrency)
- [Inngest throttling](https://www.inngest.com/docs/guides/throttling)

The Production Capacity Profile should specify fairness, queue-age, lateness,
and recovery outcomes rather than prescribe one control everywhere. The exact
workflow implementation remains subordinate to those outcomes.

### Vercel: provider-neutral must not mean provider-blind

Vercel is the intended launch host, so D33 must qualify the actual Vercel
execution and billing model instead of hiding it behind generic words. Current
Vercel documentation separates Vercel Function Active CPU, Provisioned Memory,
and invocations; CDN Requests and transfer; ISR and Runtime Cache reads/writes;
Image Optimization transformations and cache activity; build usage; field-
telemetry events; and optional protection products. Fluid-compute configuration
precedence and regional rates also mean an intended setting is not necessarily
the effective one.

The permanent answer is **one product profile and one provider attachment**,
not two product models:

- the **Production Capacity Profile** owns provider-neutral experience,
  correctness, freshness, fairness, workload, resource, and unit-cost budgets;
  and
- the **Vercel Qualification Attachment** records the exact Vercel plan,
  project topology, Next/Payload/runtime pins, effective regions and Function
  settings, cache/image/build/telemetry/protection choices, rate-card date,
  measured unit costs, and evidence that passed that profile.

The attachment is code-/operations-owned evidence. It is not Tenant
configuration, a second release authority, a generic cloud abstraction, or a
new high-cardinality table in the application database. A different host may
later supply a different qualification attachment without changing product
semantics; launch does not build an active-active or speculative multi-cloud
runtime.

Current Core is already Vercel-aware but not production-qualified for D33:

- each of `apps/admin`, `apps/donor`, and `apps/missionary` has a Vercel build
  manifest with monorepo build controls;
- all three Next applications opt into Cache Components and partial
  prefetching, while the branch declares a Next preview newer than the bundled
  documentation available in the main checkout;
- donor image configuration already bounds formats, qualities, device sizes,
  and a cache lifetime, but D27 now requires one deliberate rendition/
  transformation owner; and
- no live Vercel plan, region, fluid-compute state, project metric, invoice,
  cache ratio, or Spend Management configuration was inspected for this
  decision.

The full dated evidence and provider caveats are recorded in
[the D33 Vercel primary-source research](./phase-23-d33-vercel-capacity-primary-source-research.md).

## Proposed provider-neutral Production Capacity Profile

The recommended contract is a versioned, code-owned profile with the following
mandatory sections.

### 1. Three evidence-calibrated cohorts

| Cohort           | Meaning                                  | Required evidence                                                     |
| ---------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| Minimum          | Small tenant and cold-start safety floor | Smallest realistic tenant, cold and warm paths, no fixed-cost cliff   |
| Typical          | Normal target experience                 | Design-partner distribution, including P75 content and staff activity |
| Measured maximum | Largest advertised supported envelope    | Production-shaped load that passes all budgets with safe headroom     |

Each cohort must specify numeric cardinalities—not labels—for Sites, locales,
Pages and tree depth, content records, media count/bytes/pixels, redirects,
navigation items, versions per document and total history, reusable fragments,
dynamic-list fan-out, search corpus, concurrent editors, autosaves, previews,
publishes, schedules, and public traffic. Until design-partner research and a
baseline fill those cells, the profile is explicitly **incomplete** and no
advertised maximum may be inferred from Payload defaults.

### 2. Surface-specific service budgets

Every cohort must assign numeric budgets and percentile conventions to:

- Web Studio initial load, list/search/filter/sort/page, Page-tree expand,
  search, move, descendant recalculation, document open/save/autosave, Preview,
  Publish, and version-history operations;
- D1 validation, preparation, commit, rollback, cache/redirect/search
  convergence, and exact-generation receipt freshness;
- search query latency, indexing/reindexing throughput, stale-index duration,
  and failure recovery;
- scheduled enqueue-to-start lateness, execution, retries, concurrency, and
  downstream convergence;
- public route origin latency, cache hit/miss behavior, error/availability, and
  LCP/INP/CLS field distributions; and
- database query/transaction latency, connections, locks, rows scanned/returned,
  index use, CPU/memory, storage growth, and write amplification.

Latency reports should include at least the median and relevant tail
percentiles; field Web Vitals use P75 as the launch gate and retain higher
percentiles for diagnosis. Throughput tests must name sustained rate, burst,
duration, concurrency, and queue depth. Cost reports must name their unit, such
as per publish, thousand page views, media transform, indexed document, or
stored version.

### 3. Fairness, overload, and degraded behavior

Passing an idle single-tenant run is insufficient. The profile must prove:

- per-tenant concurrency and cost boundaries;
- no cross-tenant authorization leak or starvation under a noisy neighbor;
- bounded queues, retries, work batches, query fan-out, and memory;
- admission control/backpressure before the database or provider collapses;
- safe degraded behavior, visible freshness, and retry expectations; and
- preservation of current public truth and adverse-containment priority when
  new publication work exceeds capacity.

At the measured maximum, the system either meets the published budgets or
rejects/defers work through the ratified owner with an honest state. It must not
silently perform unbounded work, drop publication effects, weaken D1/D30/D32
checks, or let one tenant consume shared capacity without limit.

### 4. Reproducible evidence package

The profile is executable documentation. Each result records the profile
version, commit and dependency pins, environment shape, dataset/fixture digest,
tenant mix, warm/cold state, cache state, concurrency, sample count/duration,
percentiles, errors, resource/cost measures, query plans and slow-query
evidence, privacy-safe field telemetry, and known limitations.

The launch package combines:

1. deterministic unit/contract tests for hard bounds;
2. production-mode browser lab runs across representative public and staff
   routes, desktop and mobile;
3. database/application load tests for each cohort and failure mode;
4. field Web Vitals and operational telemetry with declared sampling; and
5. a bounded manual journey for Page-tree, editorial, publication, search,
   schedule, and recovery behavior.

Numeric profile amendments require new evidence and a version change. A vendor
configuration change may improve implementation, but it may not silently weaken
the product profile.

## Why D33 must precede exact Payload qualification

1. **Product promise must not emerge from provider defaults.** A default limit
   of 10, 100 retained versions, or a configurable job concurrency is not a
   decision about Core's supported tenant.
2. **Candidates need the same examination.** A frozen workload and evidence
   schema make the internal Payload 4 pin, a later stable Payload release, and
   any fallback comparable.
3. **Failure behavior crosses providers.** Public freshness, D1 containment,
   database pressure, search convergence, and tenant fairness are Core-owned
   even when Payload or Vercel supplies mechanics.
4. **Qualification changes when the product workload changes.** Versioning the
   profile makes that change explicit and tells Core when requalification is
   required.
5. **It prevents circular evidence.** Selecting a provider first and then
   choosing only the tests it passes would turn current implementation limits
   into unstated product policy.

The profile is provider-neutral, not provider-blind. A Payload qualification
report must still include its exact version, source, schema/query behavior,
indexes, versions, jobs, runner topology, UI regressions, compatibility, and
provider-specific tuning. It simply has to pass Core's contract rather than
define it.

## Founder options

### Option A-prime — Implementation-local limits and best-effort scale

Each feature owner chooses pagination, queue, timeout, and telemetry values when
building. Exact Payload qualification records what the chosen stack can handle.

**Benefit:** least planning work now.  
**Cost:** no coherent tenant promise, no comparable provider test, and high risk
that defaults become accidental policy. Cross-feature publication and noisy
neighbor failures remain unowned.

### Option B-prime — One global launch ceiling

Define one maximum-size tenant fixture and one pass/fail launch run. All
surfaces share that ceiling.

**Benefit:** simple headline and easier initial fixture.  
**Cost:** hides small-tenant fixed costs, normal-experience regressions,
surface-specific latency, field percentiles, bursts, fairness, and overload
behavior. A single ceiling also becomes stale as different dimensions grow.

### Option C-prime — Versioned provider-neutral Capacity Profile

Define minimum, typical, and measured-maximum cohorts; surface-specific
latency/freshness/throughput/error/resource/unit-cost budgets; field and lab
measurement; database evidence; fairness; and explicit overload/degraded
behavior. Calibrate internal numeric cells from design-partner distributions and
a production-shaped baseline before activating the first profile or making a
production capacity claim. Qualify every exact Payload candidate against the
same profile.

**Benefit:** turns scale into a testable product contract, keeps public and
editorial promises provider-neutral, and makes later requalification auditable.  
**Cost:** requires design-partner volume research, production-shaped fixtures,
telemetry/privacy work, and ongoing evidence maintenance.

## Recommendation after adversarial review

**Keep the founder's C-prime choice, but ratify only the exact hardened
C-prime-R below.** The original direction is architecturally sound only when
“provider-neutral” means stable product promises with a first-class Vercel
qualification—not lowest-common-denominator infrastructure, provider blindness,
or a speculative multi-cloud layer.

## Exact ratified C-prime-R formulation

> **C-prime-amended-and-hardened (C-prime-R) — One versioned,
> provider-neutral Production Capacity Profile with one version-pinned Vercel
> Qualification Attachment for the intended launch host, evidence-calibrated
> workload cohorts, exact-generation cache ownership, public-experience and
> staff-workflow floors, Tenant-fair admission and backpressure, bounded unit
> cost, and quiet cause-owned degradation; never provider settings as product
> truth, an automatic shutdown policy, or a speculative multi-cloud platform.**
>
> 1. **One product contract and plain vocabulary.** The **Production Capacity
>    Profile** is Core's versioned product contract for supported workload,
>    experience, correctness, freshness, fairness, resource, recovery, and
>    unit-cost outcomes. A **Capacity cohort** is one evidence-calibrated workload
>    shape. A **Capacity Evidence Package** proves one exact profile against one
>    exact system build. The **Vercel Qualification Attachment** maps that
>    profile to the intended launch host. These are engineering and operations
>    artifacts; ordinary staff, missionaries, donors, and public visitors never
>    need provider vocabulary to use the product.
> 2. **D33 governs nonfunctional outcomes; settled owners keep authority.** D1
>    remains the only Site Plan compiler, validator, activation, serving-head,
>    and content-rollback authority; D9 owns package certification; D13
>    scheduling; D17 search convergence; D25 Preview Candidate identity; D27
>    media custody and renditions; D30 authorization and privileged diagnostics;
>    D31 staff-facing Content Health; and D32 accessibility release invariants.
>    D33 may require those owners to meet budgets and safe degraded behavior,
>    but it cannot edit their truth, bypass their gates, or create a second
>    release, retry, audit, authorization, or incident authority.
> 3. **The launch implementation is Vercel-native without making Vercel domain
>    truth.** Core deliberately uses qualified Vercel CDN, Vercel Functions,
>    framework caching, build, Preview-protection, observability, and protection
>    capabilities when they fit the contract. Product records and Tenant-facing
>    APIs never store a Vercel plan, SKU, region code, cache state, spend amount,
>    deployment ID, or provider receipt as product authority. Launch builds no
>    generic cloud control plane, active-active multi-cloud runtime, or
>    lowest-common-denominator adapter; portability comes from D1's immutable compiled
>    projections, standard artifacts and protocols, provider-separated evidence,
>    and explicit qualification boundaries.
> 4. **One active profile version is qualified by one exact Vercel attachment.**
>    Every promoted application artifact and Capacity Evidence Package
>    identifies the immutable Production Capacity Profile version and exact
>    Vercel Qualification Attachment digest. Each D1 generation receipt
>    identifies only provider-neutral profile, projection-schema, compiler,
>    package, and renderer-compatibility versions. A separate
>    deployment-qualification record proves which Vercel attachment may serve that
>    generation. Changing a rate card or non-compatibility provider setting
>    never rewrites or invalidates a content receipt. The attachment records
>    exact Next, React, Payload, adapter, Presentation
>    Package, and runtime pins; Vercel plan/projects/environments, effective
>    fluid-compute state, regions, Function memory/duration and configuration
>    provenance; cache, image, build, telemetry, protection, and spend settings;
>    Supabase compute/region/pooler contract; Inngest execution contract;
>    rate-card evidence date; and qualification result. Supported non-secret settings
>    are code-owned where practical and otherwise snapshotted and drift-checked.
>    A material pin, topology, setting, provider-limit, or pricing change triggers
>    scoped requalification; it never silently weakens a product budget.
> 5. **Three numeric cohorts replace vague labels.** **Minimum** proves a small
>    realistic Tenant, cold-path safety, and absence of a fixed-cost or latency
>    cliff. **Typical** represents the measured design-partner distribution and
>    normal target experience. **Measured maximum** is the largest advertised
>    supported envelope that passes sustained, burst, recovery, and headroom
>    proof. Every cell names an exact value, distribution or mix, growth horizon,
>    and evidence date. Payload/Vercel defaults, a warm-cache demo, or “thousands”
>    are not cohort values; no maximum is advertised before the matrix is filled.
> 6. **The cohort matrix covers the whole CMS and public estate.** It includes
>    Tenants, Sites, domains, locales, Pages and tree depth, ordinary and
>    source-owned records, navigation and redirects, versions/autosaves, reusable
>    sections, topics, forms, saved views, Trash, presentation packages and
>    variants, D27 media items/bytes/pixels/renditions, dynamic sources and list
>    fan-out, search corpus, imports/exports, concurrent editors and tabs,
>    previews, releases, schedules, background reconciliation, public sessions,
>    geographic/device/network mix, and every previously ratified numeric bound.
>    A later decision may raise a bound only with a new profile and evidence; it
>    may not silently lower an earlier ratified floor.
> 7. **Named workload scenarios avoid both idealized tests and a Cartesian
>    explosion.** Each cohort has reproducible warm, cold, cache-miss,
>    deployment, migration, sustained, burst, correlated-peak, noisy-neighbor,
>    bot/abuse, downstream-slow, partial-outage, recovery, and rollback
>    scenarios. High-risk dimensions are tested alone and in realistic
>    combinations; D33 does not require every theoretical combination. A
>    numeric reserve for safety, adverse containment, and recovery remains
>    outside ordinary measured-maximum consumption. Cohorts are support and
>    engineering envelopes—not aesthetic policing, automatic Tenant billing
>    tiers, or permission to delete, hide, or degrade a Tenant's content.
> 8. **Every surface receives its own measurable budget.** The profile assigns
>    numeric latency, tail, throughput, queue-age, freshness, error, availability,
>    storage-growth, database, and unit-cost budgets to Web Studio lists/tree/
>    search/open/save/autosave/history/Preview/Release; D1 validate/prepare/
>    activate/rollback and downstream convergence; D17 query/reindex; D13
>    scheduling; D27 ingest/rendition/delivery; D26 form acceptance/routing;
>    public routes; and operational recovery. No aggregate Lighthouse score,
>    average response time, cache-hit ratio, database pool size, or monthly bill
>    can stand in for those outcomes.
> 9. **Measurement conventions make results comparable.** Every result records
>    the profile/attachment/build and fixture digests, exact environment and
>    provider topology, Tenant mix, route/package/generation class, warm/cold
>    and cache state, sustained rate, burst, concurrency, duration, sample size,
>    median and relevant tail percentiles, errors, retries, queue depth,
>    resource/cost measures, uncertainty, and known limitations. Field and lab,
>    client and server, and production and Preview are reported separately. A
>    test run against `next dev`, one Lighthouse pass, an unsegmented average,
>    or a successful idle Tenant does not qualify production.
> 10. **Public experience has a fixed modern floor and representative route
>     coverage.** At launch, field Core Web Vitals pass at the 75th percentile,
>     segmented at least by mobile and desktop, with **LCP ≤ 2.5 seconds, INP ≤
>     200 milliseconds, and CLS ≤ 0.1**. Higher percentiles remain visible for
>     diagnosis. Production-mode mobile and desktop lab evidence covers landing,
>     missionary/project, campaign/article, search/list, form/contact, public
>     giving entry and handoff—not checkout, payment completion, or receipt,
>     which retain their owning capacity and outcome contracts—
>     redirect/not-found, and package/locale families, including slow-network and cold-cache
>     paths. Sparse field cohorts show uncertainty rather than a false green
>     result.
> 11. **The public path sends useful, stable content before optional
>     interactivity.** Public pages consume D1's bounded pre-resolved projection,
>     use Server Components/static shells and route/package code splitting,
>     reserve media geometry, limit third-party work, respect reduced motion,
>     and keep navigation, ministry information, and the giving/contact entry
>     point usable without waiting for decorative animation or a large client
>     bundle. Streaming and prefetching may improve continuity only where the
>     exact Next/Vercel pin proves correct focus, state, transfer, and cost
>     behavior; they cannot hide a blocked origin behind an endless skeleton.
> 12. **Staff responsiveness is task-based and honest.** The profile separately
>     budgets first useful Web Studio render, list/tree/search interaction,
>     document open, input acknowledgement, save/autosave confirmation, Preview,
>     Release, scheduling, and recovery. Local interaction responds immediately;
>     **Unsaved changes**, **Saving**, and **Saved at _local time and zone_**
>     reflect browser, request, and exact server-acknowledgement facts. Longer
>     release work may show **Waiting to prepare. Your live site is unchanged—no
>     action is needed**, **Preparing release**, **Released · verifying public
>     update**, and **Public update verified** only from the owning receipt and
>     readback. An unknown outcome says **We could not confirm what happened. We
>     are checking now**, names the last acknowledged state, and never offers a
>     blind Retry. No fake percentage, guessed finish time, blank screen,
>     infinite spinner, repeated-submit invitation, or infrastructure code
>     substitutes for truth.
> 13. **Correctness, privacy, safety, accessibility, and current intent outrank
>     speed and cost.** Capacity tuning cannot bypass authorization, RLS,
>     validation, the narrow source-owned accessibility invariants already
>     ratified under D1, D9, D11, D27, and D32—while editorial Suggestions
>     remain non-blocking—exact-revision selection, source ownership,
>     idempotency, receipts, or D1's all-or-none activation. A
>     last-known-good generation may serve during favorable regeneration failure only
>     while current intent still permits it. Unpublish, consent withdrawal,
>     rights expiry, restriction, safeguarding, and privacy changes take the
>     shortest qualified containment path and cannot wait behind cache warmth,
>     background throughput, cost savings, or favorable releases.
> 14. **Vercel Functions perform bounded request work, not whole-Site jobs.**
>     The attachment measures each request family across wall duration, Active
>     CPU, Provisioned Memory, invocations, external I/O, errors, concurrency,
>     and downstream pressure. Memory and duration remain bounded below provider
>     maxima; a high `maxDuration` is not a capacity strategy. Whole-Site
>     compilation, reindexing, media processing, import, reconciliation, and
>     release fan-out leave the donor/staff request and use the owning durable
>     workflow. Fluid compute is enabled, disabled, sized, or changed only by
>     exact measured evidence; instance concurrency never implies Tenant or
>     database fairness.
> 15. **Compute topology follows data and compliance, while public delivery
>     remains global.** Database-touching Functions use one qualified primary
>     region close to the authoritative Supabase data path unless globally
>     replicated read semantics have separately passed correctness, lag, cost,
>     and failover proof. Every configured or provider-supplied Function
>     failover region is separately qualified for data residency, Supabase
>     reachability, end-to-end latency, connection pressure, correctness, and
>     degraded behavior. Compute failover never implies database failover or
>     permission to serve from an unproved data path. Region choice considers
>     end-to-end latency, data
>     residency, provider rate, and recovery—not the cheapest rate alone. The
>     CDN serves immutable/static public material near visitors. D33 does not
>     add multi-region database writes, read replicas, or active-active compute
>     before evidence demonstrates a real need.
> 16. **Postgres connections are a shared finite budget.** The attachment names
>     the exact direct/session/transaction pooler lanes and proves Payload
>     transactions, prepared-statement behavior, migrations, advisory/locking
>     behavior, and workers against them. Application pools are initialized and
>     reused safely, have bounded acquisition/idle/query time, and cannot
>     multiply unboundedly with Function instances. The total budget reserves
>     room for Supabase Auth/Storage/Realtime and operations, then accounts for
>     Web Studio, public misses, Payload, Inngest, migrations, and diagnostics.
>     Pool growth is never the first or sole fix: query plans, rows scanned,
>     indexes, lock time, transactions, and queueing must prove capacity.
> 17. **Request data shape is bounded before infrastructure is enlarged.**
>     Public requests read only D1's flat selected projection and never recurse
>     through Payload, resolve mutable `latest`, or issue per-block/per-item
>     queries. Staff and operator reads use exact Tenant/Site predicates,
>     selected columns, low relationship depth, bounded cursor/server paging,
>     indexed filters/order, and set-based joins. Dynamic lists, Page-tree
>     expansion, navigation, search, versions, reverse references, and Content
>     Health cannot perform full-corpus request-time scans or N+1 provider calls.
> 18. **Content release is independent of application deployment.** D1 prepares
>     and validates one exact candidate asynchronously, writes immutable
>     projections/artifacts, and CAS-advances one small serving head only after
>     proof. Ordinary Page, locale, navigation, topic, form, media, search, or
>     schedule changes do not start a Vercel build per object, Site, Tenant, or
>     Preview. A code/Presentation Package deployment makes a compatible
>     renderer available but never publishes content. Function timeout, duplicate
>     delivery, or lost acknowledgement resolves through current-state fences,
>     idempotency, readback, and receipts—not a second activation.
> 19. **Shared cache identity is structural and generation-scoped.** Every
>     public cache key/tag and canonical response varies by every authority
>     dimension that can change the output: environment, Tenant, Site/domain
>     mapping, locale, audience, canonical path, D1 generation, Presentation
>     Package/version, and relevant projection/schema version. Missing,
>     ambiguous, default-Site/default-locale, slug-only, request-header-only, or
>     cross-environment scope fails closed. Cache entries are derivative and
>     disposable; they never become content truth or choose a generation.
> 20. **Only deterministic public success enters a shared cache.** Authenticated
>     or personalized responses, Preview Candidates, diagnostics, form
>     submissions, permission results, unknown domains, invalid scope,
>     unexpected fallback, redirects derived from unproved state, and error
>     bodies remain private/no-store or use a separately proven short negative
>     policy. Public cache profiles are explicit and code-owned for the exact
>     Next pin. Browser, CDN, ISR/framework, Runtime, and media caches each have
>     a named owner, purpose, identity, lifetime, invalidation, rollback, and
>     observability rule; hidden overlapping caches are a qualification failure.
> 21. **Revalidation is precise, event-led, bounded, and adverse-aware.** Normal
>     publication uses generation/source tags and qualified on-demand
>     invalidation rather than short time polling, per-edit whole-project purge,
>     or unbounded path fan-out. Stale-while-revalidate is allowed only where a
>     slightly stale favorable result remains valid under current intent;
>     staff read-your-own-writes and adverse containment use their exact
>     immediate semantics. Non-deterministic output, broad tags, global purge,
>     repeated invalidation, and cache-bypass storms are tested and rejected.
>     Global purge remains a privileged incident tool, not the ordinary publish
>     path.
> 22. **Cold misses, builds, and Preview cannot create a stampede or cost
>     avalanche.** The Vercel attachment uses production-shaped build and
>     request evidence to choose the bounded routes, if any, that are
>     pre-rendered or prewarmed and those generated on first request. It qualifies
>     request collapsing and cache shielding wherever relied upon, but neither
>     requires the full Page × locale × Site × package Cartesian product at
>     build time nor mandates an on-demand long tail before measurement.
>     Automatic monorepo skipping of unaffected projects—and any separately
>     qualified remote build cache—plus production-build priority, machine
>     choice, concurrency, and retention are measured rather than assumed. D25
>     Preview Candidates remain private,
>     protected, expiry-bounded product artifacts; they do not require one
>     Vercel deployment per candidate or count as public field evidence.
> 23. **Bespoke Presentation Packages stay genuinely flexible without shipping
>     every Tenant's code to every visitor.** D9 packages are reviewed, pinned,
>     built, code-split, and certified before D1 selection; they cannot install,
>     compile, fetch executable modules, or run arbitrary code on a public
>     request. The profile measures package-catalog build impact, route chunks,
>     JavaScript/CSS/font/image/third-party/motion budgets, cache cardinality,
>     and field results for each active package family. Only the selected exact
>     package chunks and assets reach a visitor. Launch creates no per-Tenant
>     application fork or Vercel project, and one slow package cannot weaken the
>     common public floor or silently fall back to another design.
> 24. **D27 owns immutable bytes and renditions; each public image has one
>     transform owner.** Qualified digest-addressed renditions normally travel
>     directly from object/CDN custody instead of through a Vercel Function. If
>     Vercel Image Optimization transforms a source, the attachment bounds
>     source patterns, widths, qualities, formats, pixels, TTLs, cache-key
>     combinations, and transformation/read/write usage. If D27 already
>     supplies the final responsive variant, the adapter avoids an unnecessary
>     second transformation while preserving `sizes`, density selection, visual
>     stability, alt semantics, rights/withdrawal, and responsive quality.
>     Author-controlled query parameters can never create unbounded variants.
> 25. **Lists and search scale through their ratified projections, not public
>     database fan-out.** D14's source catalog, D15's three curation strategies,
>     D16's link-native windows/multiple pagers/discovery modes, and D17's public
>     search projection retain stable ordering, cursor/link state, bounded page
>     sizes, field selection, and independent convergence. Search reindex,
>     deletion, and lag never block a public page request or become a recursive
>     Payload query; stale/incomplete search follows D17/D31 truth. Tests cover
>     deep pages, repeated/back navigation, sparse results, several independent
>     pagers, cold search, deletion, and reindex under Tenant-fair load.
> 26. **Forms and giving-adjacent journeys never trade durability for a fast
>     illusion.** Cacheable form definitions and public content remain separate
>     from dynamic, authorized, rate-bounded, domain-owned submission effects.
>     A user sees success only after one durable idempotent acceptance receipt;
>     timeout, retry, duplicate click, email/provider delay, or downstream Hub
>     outage cannot lose or duplicate a submission. During overload the current
>     screen preserves entered state where privacy policy permits, explains one
>     safe next step, and never asks a donor/applicant to guess whether the form
>     was received. Giving handoff and app-owned authenticated surfaces remain
>     outside public CMS caching and keep their own security/capacity contract.
> 27. **Required background effects preserve each settled execution boundary
>     and are never lossy-rate-limited.** D13, D17, D26, and D27 continue to use
>     Core's already-ratified shared Inngest runtime, dispatch-ledger, claim,
>     retry, dead-letter, and reconciliation seams. D1 and D31 use only the
>     durable execution seam owned by the actual source domain; D31 may project
>     and verify source-owned recovery but never executes it as an independent
>     owner. D33 may qualify, budget, and observe these seams, but it cannot
>     substitute another executor or create a second workflow authority. Across
>     those settled seams, idempotent steps, exact intent/generation fencing,
>     receipts, Tenant-keyed concurrency, a global downstream cap, and
>     throttling protect noisy-neighbor and shared Supabase/provider capacity. A
>     required publish, withdrawal, redirect, schedule, index deletion, or
>     recovery effect is never silently skipped by a lossy rate limit. Queue
>     age, attempt age, lateness, backlog, dead letters, and recovery remain
>     within the owning domain's budget.
> 28. **Admission and priority preserve safety, interactive work, and Tenant
>     fairness.** Capacity is reserved first for privacy/safety containment and
>     current-public correctness, then bounded interactive save/submission
>     acknowledgement and already-accepted release work, with Preview,
>     regeneration, bulk import/export, reindex, reconciliation, deep
>     diagnostics, and other optional work deferrable by explicit policy.
>     Per-Tenant and global claims, bounded batches, jittered retry, queue caps, and
>     anti-starvation aging prevent one large Tenant or package from consuming
>     the shared system. Priority changes affect execution order, never
>     authorization or truth.
> 29. **Overload fails deliberately before Vercel or Postgres collapses.** The
>     system admits, queues, or rejects new work with one stable idempotency key
>     before exhausting Function duration/memory, database connections/locks,
>     provider quotas, or worker backlogs. Public requests continue the last
>     safe current D1 generation where valid; no mixed or partial generation is
>     exposed. **Saved** appears independently only after exact server
>     acknowledgement. Accepted release work shows **Waiting to prepare. Your
>     live site is unchanged—no action is needed**. A breached delay shows
>     **Release is taking longer than usual. Your live site is unchanged; Asym
>     is checking it**, or the exact cause-owned action. Staff never see `429`,
>     `504`, serverless-capacity language, repeated-refresh advice, or a
>     disappearing draft. If no safe public response is possible, one
>     accessible, Tenant-branded, provider-neutral unavailable page says **This
>     site is temporarily unavailable. We are working to restore it.** It may
>     show only a public, source-authoritative status or contact destination
>     proven outside the same failure blast radius. It never serves unproved
>     stale content, unverified contact details, provider identifiers, guessed
>     recovery times, or repeated automatic refresh.
> 30. **Cost is measured per product outcome, not hidden in a monthly total.**
>     Provider-neutral units include a thousand public page views, cold public
>     generation, typical staff editing session, Site release at each cohort,
>     Preview session, scheduled action, search index/reindex, form acceptance,
>     media ingest/rendition/delivery, package build, and recovery. The Vercel
>     attachment maps them to current CDN Requests (displayed as Edge Requests
>     in Vercel billing), Fast Data Transfer, Fast Origin Transfer, Function
>     Active CPU/Provisioned Memory/invocations, ISR/Runtime Cache units, image
>     transformations/cache, build, observability, storage, and protection
>     meters, plus Supabase/Inngest and other external cost. Each unit has a
>     measured baseline, budget, variance threshold, and owner; exact dollar
>     rates remain dated attachment evidence, never a permanent product schema.
> 31. **Spend and abuse controls protect access instead of policing Tenants.**
>     Where the qualified Vercel plan supports them, usage notifications and
>     Spend Management are configured with named billing and incident owners.
>     At least one tested operator escalation path—such as dashboard/email
>     notification, SMS, or webhook—is required; no specific provider channel
>     is product authority. Because provider spend checks are periodic and an
>     optional pause can stop all production
>     projects, blanket automatic pause is not the normal bill-control action.
>     Source-owned circuit breakers first stop or defer optional high-cost work
>     while preserving safe public/giving access. DDoS/WAF/bot/rate controls are
>     narrow, observable, and tested in log/challenge/enforcement stages against
>     legitimate donors, assistive technology, weak devices, staff, verified
>     crawlers, and webhooks. Tenants receive no surprise quota, aesthetic
>     restriction, or public shutdown without a separately ratified product and
>     continuity policy.
> 32. **Observability joins product truth to provider evidence without becoming
>     another data warehouse in Supabase.** Low-cardinality telemetry covers
>     route/package/generation classes, field Core Web Vitals, cache hit/miss/
>     stale/error, origin latency, Function CPU/memory/duration/invocations,
>     transfer, cache/image/build/Preview/telemetry usage, D1 latency and
>     convergence, Inngest queue age/outcomes, Postgres query/lock/connection/
>     storage health, per-Tenant fairness, errors, and unit-cost drift. Secure
>     correlations join traces, receipts, and provider evidence; Tenant IDs,
>     slugs, URLs, form data, donor/missionary details, Preview tokens, and
>     content never become metric labels. Field URLs are route-templated,
>     query/ID-redacted, allowlisted, sampled, retention-bounded, and measured
>     for their own client and billing overhead.
> 33. **The ordinary UX is quiet, clear, responsive, and provider-free.** There
>     is no Tenant capacity dashboard, Vercel settings page, cost chart, quota
>     meter, or green “all systems healthy” ceremony. Healthy work is silent;
>     the source surface shows the current save/release/public-verification fact
>     and one best next action. A meaningful delay that still needs no staff
>     action remains contextual; a breached promise or actionable exception
>     enters D31 once with visitor impact, next owner, last verified time, and
>     cause-owned recovery. D30 alone exposes privileged provider diagnostics.
>     Public visitors see no capacity UI unless an actual component or service
>     impairment affects them. Task-specific messages remain contextual; at
>     most one neutral service-wide banner appears for genuine broad impact.
>     Material delay, failure, unknown-outcome, and outage messages persist
>     until authoritative proof changes or safe dismissal is available; routine
>     success labels update quietly. Every status uses text, icon, and semantics
>     rather than color alone, remains keyboard/touch/mobile/reflow accessible,
>     announces only meaningful transitions without stealing focus, and
>     respects reduced motion.
> 34. **Failure and rollback remain layered, compatible, and testable.** A
>     Vercel application rollback, D1 content-generation rollback, package
>     rollback, cache invalidation, Supabase recovery/migration, search rebuild,
>     and workflow replay are distinct operations. Before promotion or rollback,
>     the compatibility matrix proves the binary can read the active D1
>     projection/schema, package manifest, environment contract, and database
>     state; Vercel rollback cannot be assumed to restore environment variables,
>     database/CMS state, or current content. Provider/cache/database/queue/
>     telemetry failure retains exact known truth and receipts, fails closed on
>     incompatibility, and follows the affected source or domain owner's
>     rehearsed RTO/RPO, communication, restore, and verification runbook. D30
>     may expose privileged diagnostics and D31 may derive the resulting
>     staff-facing health status; neither becomes incident, recovery, communication,
>     or rollback authority.
> 35. **Qualification is production-shaped, reproducible, and required before
>     activation.** The Capacity Evidence Package combines deterministic bound/
>     cache/tenant/receipt contracts; production-mode browser lab runs;
>     privacy-reviewed field data; database query plans and load;
>     sustained/burst/noisy-neighbor/bot tests; fault injection at Function, Supabase, Inngest, search,
>     cache, media, and telemetry seams; cost-meter normalization; application/
>     content/package rollback drills; keyboard/screen-reader/reflow/
>     reduced-motion checks; and task-based research with nonprofit communications staff,
>     occasional editors, ministry leaders, translators, package developers,
>     donors, and support operators. The tested configuration is diffed against
>     the promoted one. A profile with an empty numeric cell, missing route/
>     cohort, stale provider evidence, unproved rollback, or failed invariant is
>     **not active** and cannot support a launch or scale claim.
> 36. **Delivery and evolution stay bounded.** First ratify the profile schema,
>     authority map, cohort dimensions, cache/overload invariants, evidence
>     format, and Vercel attachment. Then fill numeric cells from design-partner
>     distributions and current ratified bounds, build one public cache-hit/
>     miss/adverse tracer plus one Web Studio save-to-release tracer, prove
>     Tenant fairness and Supabase pressure, add field/cost evidence, and
>     qualify the exact dependency/deployment candidate before promotion. Each
>     billing cycle reviews observed usage and drift; dependency, provider,
>     topology, volume, price, or budget changes trigger proportionate
>     requalification. D33 does **not** add active-active multi-cloud, a custom
>     CDN/cache, per-Tenant application forks/projects, speculative sharding or
>     replicas, an autonomous capacity optimizer, a Tenant billing/quota engine,
>     arbitrary performance-rule builders, raw provider consoles for staff, or
>     a second workflow/health/incident platform.

## Ruthless synthesis and order of work

### Must be fixed before the first active profile

1. Freeze the provider-neutral profile schema, exact authority boundaries,
   three numeric cohort matrices, scenario definitions, percentile convention,
   safety reserve, and incomplete-profile rule.
2. Create the Vercel Qualification Attachment and capture effective—not merely
   intended—Next/Vercel/Supabase/Inngest settings, exact dependency pins, cache
   ownership, cost meters, and configuration provenance.
3. Prove D1's exact-generation public read/cache/invalidation path, adverse
   containment, no shared-cache private/error leakage, and no per-content
   deployment fan-out.
4. Prove bounded Function/database/background concurrency, Tenant fairness,
   durable receipts, overload admission, and last-safe-public behavior before
   increasing provider resources.
5. Establish representative public/staff lab and privacy-safe field evidence,
   the Vercel/Supabase/Inngest cost-to-outcome ledger, early usage alerts, and
   tested rollback/incident paths.

### Address through measured tuning, not speculation

- choose the exact Vercel region, fluid-compute/memory/duration settings,
  cache profiles, prewarm set, image lane, build machine, Speed Insights sample,
  Observability tier, and WAF/BotID rules only after the same harness compares
  candidates;
- optimize the routes and provider meters that measured evidence identifies;
  and
- expand a cohort or package catalog only through a new profile version and
  passing evidence.

### Monitor without building new machinery

- provider pricing/limit/documentation drift, sparse field cohorts, unit-cost
  variance, cache cardinality, database headroom, queue age, package/build
  growth, bot patterns, and forecast-versus-actual traffic; and
- the evidence that would justify a read replica, regional expansion,
  additional search infrastructure, or a different host. None is adopted by
  anticipation alone.

## Supporting finished research

- [Vercel capacity primary-source research](./phase-23-d33-vercel-capacity-primary-source-research.md)
- [Production-capacity adversarial review](./phase-23-d33-production-capacity-adversarial-review.md)
- [Production-capacity UX and service journey](./phase-23-d33-production-capacity-ux-journey.md)

## Decision status

The exact 36-clause C-prime-R formulation above is **founder-ratified as Phase
23 D33 on 2026-08-24**. The supporting research, journeys, and adversarial
review explain the decision but do not alter or expand it.

Ratification does not:

- supply unsupported design-partner volumes or claim that an empty numeric
  capacity profile is active;
- choose or change an exact Payload/Next candidate, Vercel plan/project/region/
  Function/cache/image/build/telemetry/protection/spend setting, Supabase compute
  or pool, Inngest control, search provider, or media provider;
- authorize implementation, schema/RLS, migrations/backfills, deployment,
  production access, issue/spec publication, labels, staging, commits, pushes,
  or release; or
- create product authority beyond D1–D33.
