# Phase 23 D33 Vercel Capacity Primary-Source Research

**Status:** Complete primary-source research supporting the founder-ratified
exact Phase 23 D33 C-prime-R decision. This document explains the decision
without independently expanding its authority, changing a Vercel project, or
authorizing implementation.

**Evidence date:** 2026-08-24

**Research boundary:** Current official Vercel, Next.js, Supabase, and web.dev
documentation only for provider and platform claims. No production project,
traffic, invoice, plan, configuration, or runtime metrics were inspected. The
document therefore defines what a Vercel qualification must measure; it makes
no route-specific optimization claim and no savings estimate.

## Research question

How should one versioned, provider-neutral **Production Capacity Profile** be
implemented and qualified on Vercel so public ministry sites stay fast and
available, Web Studio work remains predictable and fair, and Vercel usage stays
bounded without turning Vercel products or prices into permanent product
authority?

## Executive conclusion

C-prime remains the right architecture, with one required precision:

> **Core owns one provider-neutral Production Capacity Profile. A versioned
> Vercel Qualification Attachment maps that contract to the exact Vercel plan,
> framework/runtime pins, regions, caches, function settings, build topology,
> telemetry, protection, billing units, and measured unit costs that passed it.
> The mapping may change without changing the product promise; weakening a
> capacity or experience budget requires a new Production Capacity Profile.**

This is provider-neutral, not provider-blind. Vercel-specific design belongs in
an auditable deployment attachment because Vercel is the intended launch host.
Putting terms such as Active CPU, Edge Requests, ISR Reads, or Speed Insights
inside the product model would create vendor coupling. Omitting those terms
from launch qualification would make cost and failure behavior invisible.

The strongest Vercel launch shape is:

- serve the exact current D1 public generation from a bounded cacheable public
  read model, rather than compiling Pages or querying Payload block by block on
  every request;
- keep staff, Preview, authentication-sensitive, missing, invalid, and error
  responses outside shared public caches;
- use generation-scoped cache identity and precise, idempotent invalidation,
  rather than whole-project purges or time-only freshness;
- keep media transformation ownership singular and its output cardinality
  bounded under D27;
- execute expensive preparation, search, media, and release effects as bounded
  durable work outside donor request latency;
- place database-touching Vercel Functions near the qualified Supabase region
  and prove the exact pooling mode against Payload's transaction semantics;
- measure each Vercel billing dimension per product outcome, not only the total
  invoice; and
- alert early and shed optional work through source-owned controls before using
  a provider-wide pause that could remove donor access.

No current metric proves that any exact cache policy, function region, memory
size, `maxDuration`, fluid compute setting, image loader, sampling rate, or paid
Vercel add-on is optimal for Core. The Vercel Qualification Attachment must record and
qualify those choices instead of assuming them.

## Current Vercel execution and billing model

### Vercel Functions and fluid compute

Current Vercel documentation states that new projects use fluid compute by
default. Under that model, Vercel Functions have three separate usage
dimensions:

1. **Active CPU** measures time during which application code actively consumes
   CPU. Waiting on database or other network I/O does not consume Active CPU.
2. **Provisioned Memory** is charged for allocated memory while an instance has
   in-flight work, including I/O waits. One instance can handle concurrent
   requests.
3. **Invocations** count incoming requests whether they succeed or fail.

Rates for Active CPU and Provisioned Memory vary by Function region. Function
code settings override `vercel.json`, which overrides dashboard settings, which
override fluid defaults. A function that exceeds its maximum duration returns
`504 FUNCTION_INVOCATION_TIMEOUT`.

Sources:

- [Fluid compute pricing](https://vercel.com/docs/functions/usage-and-pricing)
- [Fluid compute](https://vercel.com/docs/fluid-compute)
- [Vercel Functions limits](https://vercel.com/docs/functions/limitations)
- [Configuring Vercel Function regions](https://vercel.com/docs/functions/configuring-functions/region)

**D33 implication:** An I/O-heavy request can look inexpensive in Active CPU
while still holding memory, a database client, and a donor request open. A
CPU-only budget is unsafe. Every request family needs duration, Active CPU,
Provisioned Memory, invocation, external-I/O, error, and database-pressure
evidence. The profile must record effective settings after precedence is
resolved, not only intended dashboard values.

Fluid compute's instance concurrency can reduce cold starts and improve reuse,
but it can also multiply simultaneous queries through one process. It does not
provide tenant fairness or protect a finite Postgres pool by itself. D33 must
bound application concurrency and prove database behavior under a mixed-tenant
burst. It must not recommend enabling, disabling, or resizing fluid compute
without observed production evidence.

### CDN requests and transfer

Vercel currently meters three CDN resources:

- **Fast Data Transfer:** request and response bytes between the CDN and the
  visitor, including bodies, headers, URLs, and compression;
- **Fast Origin Transfer:** bytes between Vercel's CDN and Vercel Compute; and
- **CDN Requests, shown as Edge Requests in billing:** cached and uncached
  requests processed by the CDN. Extra CPU used in request routing is a
  separate metered dimension.

Static assets and function-backed routes both incur CDN Requests. Repeated
polling, unnecessary remounts, high-cardinality asset URLs, large response
headers, and proxying media through compute can therefore increase both cost
and latency even when a Function is not slow.

Sources:

- [CDN pricing and usage](https://vercel.com/docs/manage-cdn-usage)
- [Manage and optimize usage](https://vercel.com/docs/pricing/manage-and-optimize-usage)
- [Regional pricing](https://vercel.com/docs/pricing/regional-pricing)

**D33 implication:** The unit-cost evidence must report requests and both
transfer directions by public page view, Preview journey, editor session,
publish, search rebuild, export/download, and media delivery. It must not infer
that a cache hit is free. Public media should normally travel from qualified
object/CDN custody rather than through Vercel Functions, subject to D27's
rights, takedown, and delivery contract.

### ISR, CDN cache, and Runtime Cache are different stores

Vercel's ISR documentation describes a two-level response cache:

- an ephemeral regional CDN cache whose reads are not billed as ISR Reads; and
- a durable ISR cache in the selected Function region, billed in 8 KB read and
  write units when the CDN tier misses or new output is stored.

ISR revalidation also uses a Function and can incur Fast Origin Transfer.
Vercel recommends longer intervals for rarely changing content and on-demand
revalidation for event-driven updates. When output does not change, Vercel says
revalidation does not incur an ISR write. Its framework integration provides
request collapsing for concurrent misses, cache shielding, and preservation of
the old response when revalidation fails.

Vercel's separate Runtime Cache persists data across deployments within a
project/environment, but its tags and TTLs are not reconciled across
deployments. Next.js `revalidatePath` and `revalidateTag` do not invalidate that
separate Runtime Cache.

Sources:

- [Incremental Static Regeneration](https://vercel.com/docs/incremental-static-regeneration)
- [ISR usage and pricing](https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing)
- [Vercel Runtime Cache API limits and integration notes](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package)
- [Vercel CDN cache](https://vercel.com/docs/caching/cdn-cache)
- [Cache-Control headers](https://vercel.com/docs/caching/cache-control-headers)

**D33 implication:** There must be one documented cache-ownership map. D1's
source-owned generation receipt remains truth; no Vercel cache becomes
publication authority. Each cached value needs Tenant, environment, Site,
locale, audience, route, D1 generation, package, and relevant source-version
dimensions. A release must not depend on a project-wide purge or an unbounded
revalidation fan-out. An old generation may be retained for rollback, but it
must not be selected as current by a cache that lacks generation identity.

The official Vercel pages retrieved on the evidence date are inconsistent about
generic `stale-if-error`: the Cache-Control guide describes the directive, while
the CDN Cache limits page says it is not currently supported for server-side
caching. D33 must not make generic `stale-if-error` a correctness dependency.
Use only behavior proven for the exact Next/Vercel combination; D1 still owns
which prior public truth may be served.

### Next.js cache APIs require exact-version qualification

The bundled Next.js 16.2.6 documentation in the main checkout says:

- Cache Components are opt-in;
- `use cache`, `cacheLife`, and `cacheTag` define cached work and its identity;
- tag-based invalidation is more precise than path-based invalidation;
- `revalidateTag(tag, "max")` marks entries stale and regenerates them when
  next visited, rather than immediately regenerating every affected path;
- `updateTag` is for immediate read-your-own-writes in Server Actions; and
- Cache Components require the Node.js runtime.

Local primary sources read in full:

- `node_modules/next/dist/docs/01-app/01-getting-started/09-revalidating.md`
- `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheTag.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md`

The branch declares Next `16.3.0-preview.9`, while the available installed docs
are 16.2.6. Vercel's ISR overview still illustrates App Router ISR with route
segment `revalidate`, while Next's Cache Components migration guide replaces
that setting when Cache Components are enabled. These are evidence inputs, not
proof for the preview pin.

**D33 implication:** The provider-neutral contract says _precise generation-
scoped caching and invalidation_. The Vercel Qualification Attachment names the exact
Next cache API and adapter behavior that passed. Preview APIs or public docs may
not silently define the product promise.

### Image Optimization has independent transformation cardinality and cost

Current Vercel Image Optimization usage separates:

- transformations on cache misses and stale entries;
- global image-cache reads;
- global image-cache writes; and
- the CDN Requests and Fast Data Transfer used to deliver transformed images.

Remote-image allowlists should be narrowly scoped. Next.js requires known
dimensions or a bounded fill layout to avoid layout shift. Vercel documents
source-format, size, and pixel limits for transformations.

Sources:

- [Vercel Image Optimization limits and pricing](https://vercel.com/docs/image-optimization/limits-and-pricing)
- [Next.js Image Optimization](https://nextjs.org/docs/app/getting-started/images)

Local version source read in full:
`node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`.

**D33 implication:** D27 and D9 must name one transformation owner for each
public use. If D27 supplies a final qualified rendition, the Vercel adapter
must prove whether a custom loader or unoptimized delivery avoids an unnecessary
second transformation while preserving responsive selection and visual
stability. If Vercel transforms a source, the allowed widths, qualities,
formats, URLs, expiry, and cache-key combinations must be finite and measured.
Neither lane may create arbitrary transformations from author-supplied query
parameters.

### Builds and Preview deployments are capacity and cost inputs

Vercel meters Build Minutes for applicable build-machine and concurrent-build
usage. In a supported JavaScript monorepo, automatic skipping of unaffected
projects avoids a build and does not occupy a concurrent slot. By contrast, a
custom Ignored Build Step still creates a canceled build that counts toward
deployment and concurrency limits. Vercel can prioritize production builds
over Preview builds.

Vercel supports configurable retention for canceled, errored, Preview, and
Production deployments. Deployment Protection can require Vercel
Authentication for Preview deployments. Preview runtime traffic still consumes
the same applicable request, transfer, compute, cache, image, and telemetry
resources.

Sources:

- [Managing builds](https://vercel.com/docs/builds/managing-builds)
- [Vercel monorepos](https://vercel.com/docs/monorepos)
- [Deployment retention](https://vercel.com/docs/deployment-retention)
- [Deployment Protection](https://vercel.com/docs/deployment-protection)
- [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)

**D33 implication:** Content releases must not require a full application build
or one Vercel project/deployment per Tenant. D9 package code changes may require
a deployment; routine Page, locale, navigation, topic, media, and search changes
flow through D1's content-generation contract. D25 Preview Candidates are
private product artifacts, not a reason to create a Vercel deployment per
candidate. Build and Preview usage needs its own budget so development traffic
cannot starve production work or hide in public-page unit cost.

## Supabase topology and connection safety on Vercel

Vercel advises placing database-touching Functions near the data source.
Static content still serves from the globally distributed CDN. Supabase
currently recommends:

- direct connections for migrations and long-lived backends;
- Supavisor session mode for persistent clients that need an IPv4 route; and
- transaction-mode pooling for temporary serverless or edge clients.

Supabase warns that transaction mode does not support prepared statements.
Dedicated and shared poolers have different placement and resource behavior.
Vercel's fluid compute connection guidance recommends globally initialized
pools, bounded idle lifetime, connection reuse, and lifecycle-aware cleanup.

Sources:

- [Vercel Function regions](https://vercel.com/docs/functions/configuring-functions/region)
- [Supabase: Connect to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Vercel: Connection pooling with Functions](https://vercel.com/kb/guide/connection-pooling-with-functions)

**D33 implication:** “Use transaction mode” is not a safe universal answer for
Payload. The exact Payload Postgres adapter, migrations, transactions, prepared
statement behavior, advisory locks, long-running jobs, and Preview/public reads
must be tested against the selected Supabase connection lane. The Vercel
Function region and the Supabase project/pooler region must be recorded in the
qualification attachment and latency-tested together. Region selection must follow
data residency and measured end-to-end latency, not the cheapest regional rate
alone.

Function autoscaling can outrun Postgres. Passing D33 therefore requires a
global connection budget that includes Supabase services, Payload/Web Studio,
public reads, durable workers, migrations, and operational tools; per-instance
pool size alone is not proof. Queue age and admission control must become
visible before connection timeouts become donor-facing failures.

## Observability, field performance, and cost controls

### Public experience needs both lab and field evidence

The official Core Web Vitals floor remains P75, segmented by device, with:

- LCP at or below 2.5 seconds;
- INP at or below 200 milliseconds; and
- CLS at or below 0.1.

Source: [web.dev: Defining Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds).

The bundled Next.js 16.2.6 production checklist says to pair simulated
Lighthouse tests with field data and to test a production build. Its analytics
guide supports a small isolated client boundary around `useReportWebVitals` or
a managed service.

Local primary sources read in full:

- `node_modules/next/dist/docs/01-app/02-guides/production-checklist.md`
- `node_modules/next/dist/docs/01-app/02-guides/analytics.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-report-web-vitals.md`

Vercel Speed Insights collects route, path, device, network, browser, country,
Web Vital, and attribution data. Its SDK supports `sampleRate` and `beforeSend`;
lower sampling reduces data points and cost but can reduce accuracy, especially
on low-traffic routes. Speed Insights scripts and data submissions also consume
requests and transfer. Vercel Observability can emit multiple events for one
visitor request when middleware, Functions, and external APIs are involved.

Sources:

- [Speed Insights configuration](https://vercel.com/docs/speed-insights/package)
- [Speed Insights privacy and collected data](https://vercel.com/docs/speed-insights/privacy-policy)
- [Managing Speed Insights usage](https://vercel.com/docs/speed-insights/managing-usage)
- [Speed Insights limits and pricing](https://vercel.com/docs/speed-insights/limits-and-pricing)
- [Vercel Observability](https://vercel.com/docs/observability)

**D33 implication:** Field telemetry is mandatory; Speed Insights is an allowed
Vercel adapter, not the sole product authority. Before activation, Core must
define route templates, remove IDs, slugs, query strings, form values, and
private Preview paths, allowlist dimensions, set sampling by traffic cohort,
document retention, and measure the telemetry's own usage. Public launch gates
use the declared sample and show uncertainty for sparse segments. Higher
percentiles remain visible for diagnosis even when P75 is the experience gate.

### Spend Management is a coarse safety valve

Vercel's Usage dashboard can break usage down by project and region. Pro Spend
Management can notify, call a webhook, or pause production projects when a team-
wide spend amount is reached. Setting the amount does not stop usage unless the
pause action is explicitly enabled. Vercel checks the threshold periodically,
and the spend amount covers metered usage beyond plan credits rather than every
invoice item.

Sources:

- [Manage and optimize usage](https://vercel.com/docs/pricing/manage-and-optimize-usage)
- [Spend Management](https://vercel.com/docs/spend-management)

**D33 implication:** Alerts and a webhook are useful operator inputs. Automatic
team-wide pause is not the default cost policy for donor-facing ministry sites:
it can trade a rising bill for loss of public and giving access, may affect
unrelated projects, and is not instantaneous. Product-owned controls should
first preserve current public truth and shed or defer optional regeneration,
Preview preparation, deep diagnostics, reindexing, and bulk work through their
source owners. Any provider pause requires explicit billing-owner authority, a
documented continuity decision, notification, and recovery runbook.

No static dollar amount belongs in the Production Capacity Profile. The Vercel
attachment records current plan credits, current regional rates, alert
thresholds, owners, and observed unit costs on its evidence date. A pricing or
plan change triggers cost requalification, not a product schema migration.

### Bot and abuse controls protect both capacity and donor access

Vercel documents DDoS mitigation, IP blocking, and custom WAF rules as available
platform protections. Some rule evaluation still incurs CDN Requests and
incoming transfer; persistent actions can stop later requests earlier. BotID
Basic is available without Deep Analysis charges, while calling Deep Analysis
is separately metered. BotID is designed for high-value actions such as signup,
checkout, and APIs, not as proof that every visitor is safe.

Sources:

- [Vercel WAF usage and pricing](https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing)
- [BotID](https://vercel.com/docs/botid)

**D33 implication:** The capacity harness includes cache-bypass, bot, malformed,
and repeated-action traffic. Protection must be route-appropriate, observable,
accessible, and tested against legitimate donors, assistive technology, weak
devices, verified search crawlers, webhook providers, and ministry staff.
BotID or a WAF rule cannot replace domain idempotency, authorization, request
size limits, or tenant-keyed rate/concurrency controls. Deep Analysis is used
only where risk and measured traffic justify its user and cost tradeoff.

## Failure, rollback, and degraded operation

Vercel can point production traffic back to a prior deployment without a
rebuild. Its rollback documentation warns that the earlier build may carry
stale configuration, does not roll current environment variables backward, and
does not roll external databases or CMS state backward. Cron configuration can
also revert with the deployment. Preview deployments that were never production
are not necessarily eligible rollback targets.

Sources:

- [Rolling back a production deployment](https://vercel.com/docs/deployments/rollback-production-deployment)
- [Instant Rollback](https://vercel.com/docs/instant-rollback)

**D33 implication:** Vercel rollback is an application-artifact recovery tool,
not a D1 content rollback and not a database rollback. Every deploy must declare
which Production Capacity Profile, D1 compiler/view-model schema, package
manifest, database migrations, feature flags, environment contract, and active
content generations it can read. The system must verify compatibility before
promotion or rollback and retain a known-good public path. An incompatible old
binary must fail closed rather than reinterpret newer records.

The degraded-order contract should be:

1. Continue serving the last safe current D1 public generation.
2. Preserve navigation, public information, and give/contact entry points.
3. Keep author edits and exact receipts durable when source authority is
   healthy, while reporting delayed preparation or convergence honestly.
4. Defer optional Preview, regeneration, diagnostics, reindex, and bulk work
   with per-Tenant fairness.
5. Reject new work before oversubscribing the database or publishing a partial
   generation.
6. Expose cause-owned recovery through D31/D30 without showing staff Vercel
   product codes or asking them to operate infrastructure.

## Required provider-neutral/Vercel boundary

### Production Capacity Profile: product authority

The provider-neutral profile owns:

- versioned minimum, typical, and measured-maximum workload cohorts;
- public, staff, release, search, schedule, media, database, queue, error,
  freshness, fairness, and unit-cost budgets;
- Core Web Vitals and accessibility/functional experience floors;
- evidence percentiles, sample/duration rules, cold/warm/cache states, and
  required failure injection;
- safe overload ordering and source-owned degraded behavior;
- Tenant isolation and noisy-neighbor outcomes;
- exact D1 publication, rollback, takedown, and current-public-truth invariants;
  and
- the conditions that require requalification or a new profile version.

These terms must be expressible and testable on another qualified host.

### Vercel Qualification Attachment: provider evidence

The versioned Vercel attachment records:

1. Vercel account plan, pricing/limit evidence date, projects, environments,
   domains, and responsible owners.
2. Exact Next.js, React, Payload, adapter, runtime, and package pins plus build
   and artifact digests.
3. Effective fluid compute status, Function regions/failover regions, memory,
   duration, runtime, concurrency assumptions, and configuration provenance.
4. Supabase project and pooler regions/modes, total connection allocation,
   application pool settings, transaction/prepared-statement compatibility,
   and measured round-trip/query behavior.
5. The owner and key/tag schema for CDN, ISR, framework data, Runtime, browser,
   and media caches; invalidation, retention, rollback, and stale/failure rules.
6. Static/pre-rendered/on-demand/dynamic route classification and proof that
   private or unsafe responses cannot enter shared caches.
7. Image transformation owner, allowed source patterns, variant cardinality,
   size/pixel bounds, cache behavior, and D27 rendition integration.
8. Build machine, monorepo skip behavior, concurrency, Preview protection,
   retention, and production-priority settings.
9. Observability, Speed Insights, logs, sampling, redaction, retention, data
   residency, alert, and telemetry-unit-cost settings.
10. CDN request/transfer, Function, ISR, Runtime Cache, image, build,
    observability, firewall/BotID, and any enabled Vercel product usage measured
    per provider-neutral outcome.
11. Usage and spend thresholds, recipients, webhooks, allowed automatic
    actions, public-continuity policy, and tested incident recovery.
12. Qualification results, known gaps, expiry/review date, and evidence that
    configuration drift is detected before or immediately after deployment.

This attachment is code-/operations-owned evidence, not ordinary Tenant
configuration and not a burden placed on staff or the application database.

## Proposed D33 Vercel invariants

1. **No provider name in domain truth.** Product state stores no Vercel SKU,
   region code, cache status, spend threshold, or deployment ID as publication
   authority.
2. **One active capacity version.** Every production artifact and qualification
   receipt names the active Production Capacity Profile and exact Vercel
   attachment version.
3. **Current public truth survives optional failure.** A failed deploy,
   regeneration, build, Preview, telemetry adapter, search rebuild, or cost
   alert cannot replace or corrupt the active D1 generation.
4. **No public request-time compilation.** D1 and D9 prepare and certify
   presentation before activation; public requests consume a bounded compiled
   read model.
5. **No content-deploy fan-out.** Ordinary content changes do not trigger a
   Vercel build per Page, locale, Site, Tenant, or Preview Candidate.
6. **Cache identity is structural.** Shared cache keys and tags include every
   authority dimension needed to prevent Tenant, locale, audience, generation,
   package, and environment collision.
7. **Invalidation is precise and replayable.** Release effects are idempotent,
   generation-fenced, and bounded; global purge is an incident operation, not
   the normal publish path.
8. **Unsafe responses stay dynamic/private.** Authentication-sensitive,
   personalized, invalid, missing, fallback, permission-denied, Preview, and
   diagnostic output cannot be favorable shared-cache entries.
9. **Adverse changes lead.** Unpublish, restriction, consent withdrawal, rights
   expiry, takedown, and safety changes use the shortest qualified path and
   cannot wait behind favorable regeneration.
10. **Database proximity is explicit.** Database-touching Functions run in a
    qualified region topology close to Supabase; static delivery remains
    global.
11. **Autoscaling is downstream-bounded.** Function concurrency cannot create
    unbounded Payload queries, pool clients, jobs, media transforms, cache
    writes, or Tenant starvation.
12. **Long work leaves the request.** Required durable effects use bounded,
    observable background execution; no donor or staff request waits for a
    whole-Site compile, reindex, rendition cohort, or fan-out.
13. **Media has one transform owner.** D27 renditions and Vercel Image
    Optimization cannot both multiply variants without explicit qualification.
14. **Client work is budgeted.** D9 package JavaScript, CSS, fonts, motion,
    third-party scripts, prefetch, polling, and hydration remain within field-
    proven mobile budgets.
15. **Build and Preview are separate cost cohorts.** Development/Preview load
    cannot consume the public runtime's capacity evidence or starve a
    production recovery.
16. **Telemetry is sampled and privacy-safe.** Field data uses stable route
    templates, allowlisted dimensions, redaction, declared sampling, and a
    measured overhead/cost budget.
17. **Every Vercel unit maps to an outcome.** Aggregate invoice totals alone do
    not pass; the evidence maps each enabled billing dimension to Page views,
    staff journeys, release work, and background convergence.
18. **Alerts precede interruption.** Usage notifications and webhooks trigger
    investigation and source-owned load shedding before any provider-wide
    production pause.
19. **No staff-facing provider operations.** Ordinary staff see saved,
    preparing, live, delayed, or unavailable truth with the owning recovery;
    Vercel diagnostics remain privileged under D30.
20. **Rollback is compatibility-gated.** Application rollback, D1 content
    rollback, database recovery, and package rollback remain distinct, with a
    tested compatibility matrix.
21. **No unsupported savings claim.** A setting changes only after measured
    route/project evidence proves the problem and the exact candidate passes
    the same profile.
22. **Prices do not become product promises.** Current rates and plan limits
    live in the dated Vercel attachment; changing them triggers cost review,
    not a domain-model rewrite.

## Evidence required before activation

The Vercel attachment cannot be marked qualified until it contains:

- production-mode lab results for representative donor/public and Web Studio
  routes on desktop, weak mobile, warm cache, cold/miss, and failure paths;
- privacy-reviewed field Core Web Vitals with declared traffic coverage,
  sampling, P75 launch gates, and higher-percentile diagnosis;
- minimum, typical, measured-maximum, burst, noisy-neighbor, bot, and provider-
  degradation runs using reproducible tenant/locale/Page/media/version data;
- Vercel Usage evidence for every enabled billing dimension, normalized to
  product outcomes and separated by production/Preview where the platform
  permits;
- Function duration, Active CPU, Provisioned Memory, invocation, concurrency,
  region, cold/warm, error, and external-call evidence;
- Fast Data Transfer, Fast Origin Transfer, CDN Request, ISR read/write,
  Runtime Cache, image, build, and telemetry evidence;
- Postgres query plans, `pg_stat_statements`, connection and lock pressure,
  pooler behavior, transaction correctness, and recovery under function burst;
- cache-collision, stale-generation, invalidation replay, failed revalidation,
  exact rollback, and deploy/content-version skew tests;
- public continuity proof when Vercel Functions, Supabase, Inngest, search,
  telemetry, and a content/package deployment are independently unavailable;
- WAF/BotID and rate/concurrency tests that include legitimate donors,
  assistive technology, verified providers/crawlers, and false-positive
  recovery;
- operator drills for usage alerts, anomalous transfer/requests, connection
  exhaustion, cache write spikes, Preview/build storms, and deployment rollback;
  and
- a configuration snapshot/diff proving that the tested Vercel/Supabase/Next
  settings are the settings promoted to production.

## Known gaps and non-claims

- No Vercel production metrics, invoice, project plan, region, cache hit ratio,
  traffic shape, deployment configuration, or paid add-on state was available.
- No exact Vercel setting is recommended by this evidence alone, including
  fluid compute, memory, duration, region, failover, cache lifetime, Image
  Optimization, Speed Insights sampling, Observability Plus, BotID Deep
  Analysis, rolling releases, or Spend Management pause.
- Vercel and Next documentation overlap but are not perfectly synchronized;
  the exact declared Next preview and Vercel adapter must be tested.
- Supabase's generic serverless pooler recommendation does not prove Payload
  compatibility. Existing Core connection choices remain unchanged by this
  research.
- Current prices, allocations, and limits can change. They are deployment-
  attachment evidence, not ratified product values.
- A successful warm-cache benchmark, one Lighthouse run, or a low aggregate
  bill is not capacity proof.

## Dated primary-source register

All web sources below were retrieved on 2026-08-24.

### Vercel

- [Vercel Functions](https://vercel.com/docs/functions)
- [Fluid compute](https://vercel.com/docs/fluid-compute)
- [Fluid compute pricing](https://vercel.com/docs/functions/usage-and-pricing)
- [Vercel Functions limits](https://vercel.com/docs/functions/limitations)
- [Function regions](https://vercel.com/docs/functions/configuring-functions/region)
- [CDN pricing and usage](https://vercel.com/docs/manage-cdn-usage)
- [Regional pricing](https://vercel.com/docs/pricing/regional-pricing)
- [Incremental Static Regeneration](https://vercel.com/docs/incremental-static-regeneration)
- [ISR usage and pricing](https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing)
- [Vercel CDN cache](https://vercel.com/docs/caching/cdn-cache)
- [Cache-Control headers](https://vercel.com/docs/caching/cache-control-headers)
- [Runtime Cache API](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package)
- [Image Optimization limits and pricing](https://vercel.com/docs/image-optimization/limits-and-pricing)
- [Managing builds](https://vercel.com/docs/builds/managing-builds)
- [Monorepos](https://vercel.com/docs/monorepos)
- [Deployment retention](https://vercel.com/docs/deployment-retention)
- [Deployment Protection](https://vercel.com/docs/deployment-protection)
- [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)
- [Vercel Observability](https://vercel.com/docs/observability)
- [Speed Insights configuration](https://vercel.com/docs/speed-insights/package)
- [Speed Insights privacy](https://vercel.com/docs/speed-insights/privacy-policy)
- [Managing Speed Insights usage](https://vercel.com/docs/speed-insights/managing-usage)
- [Speed Insights limits and pricing](https://vercel.com/docs/speed-insights/limits-and-pricing)
- [Manage and optimize usage](https://vercel.com/docs/pricing/manage-and-optimize-usage)
- [Spend Management](https://vercel.com/docs/spend-management)
- [Vercel WAF usage and pricing](https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing)
- [BotID](https://vercel.com/docs/botid)
- [Production deployment rollback](https://vercel.com/docs/deployments/rollback-production-deployment)
- [Instant Rollback](https://vercel.com/docs/instant-rollback)

### Next.js, Supabase, and web.dev

- [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [Next.js revalidation](https://nextjs.org/docs/app/getting-started/revalidating)
- [Next.js Image Optimization](https://nextjs.org/docs/app/getting-started/images)
- [Next.js analytics](https://nextjs.org/docs/app/guides/analytics)
- [Next.js `useReportWebVitals`](https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals)
- [Supabase: Connect to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [web.dev: Defining Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)
