# ADR-0177: Provider-neutral Production Capacity Profile with Vercel qualification

**Status:** Accepted (founder-ratified Phase 23 D33 C-prime-R, 2026-08-24)

## Context

Phase 23 needs one measurable contract for Web Studio, publication, public
delivery, search, schedules, media, forms, database pressure, background work,
recovery, Tenant fairness, and cost. Vercel is the intended launch host, but
Vercel plans, regions, caches, deployments, billing meters, and provider
receipts cannot become product authority. Implementation-local limits would
turn provider defaults into accidental promises; one undifferentiated maximum
would hide small-Tenant cliffs, normal-experience regressions, tail latency,
noisy-neighbor behavior, and overload recovery.

The durable boundary is one versioned, provider-neutral Production Capacity
Profile plus one version-pinned Vercel Qualification Attachment. The product
profile owns supported outcomes and evidence gates. The attachment records the
exact Vercel, Next.js, Payload, Supabase, Inngest, cache, build, media,
telemetry, protection, and cost implementation that passed those gates. D1 and
each source domain retain publication, authorization, workflow, recovery, and
health authority.

## Decision

<!-- prettier-ignore -->
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
>    exact Next, React, Payload, adapter, Presentation Package, and runtime pins;
>    Vercel plan/projects/environments, effective fluid-compute state, regions,
>    Function memory/duration and configuration provenance; cache, image, build,
>    telemetry, protection, and spend settings; Supabase compute/region/pooler
>    contract; Inngest execution contract; rate-card evidence date; and
>    qualification result. Supported non-secret settings are code-owned where
>    practical and otherwise snapshotted and drift-checked. A material pin,
>    topology, setting, provider-limit, or pricing change triggers scoped
>    requalification; it never silently weakens a product budget.
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
>     idempotency, receipts, or D1's all-or-none activation. A last-known-good
>     generation may serve during favorable regeneration failure only while
>     current intent still permits it. Unpublish, consent withdrawal, rights
>     expiry, restriction, safeguarding, and privacy changes take the shortest
>     qualified containment path and cannot wait behind cache warmth,
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
>     end-to-end latency, data residency, provider rate, and recovery—not the
>     cheapest rate alone. The CDN serves immutable/static public material near
>     visitors. D33 does not add multi-region database writes, read replicas, or
>     active-active compute before evidence demonstrates a real need.
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
>     renderer available but never publishes content. Function timeout,
>     duplicate delivery, or lost acknowledgement resolves through current-state
>     fences, idempotency, readback, and receipts—not a second activation.
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
>     slightly stale favorable result remains valid under current intent; staff
>     read-your-own-writes and adverse containment use their exact immediate
>     semantics. Non-deterministic output, broad tags, global purge, repeated
>     invalidation, and cache-bypass storms are tested and rejected. Global
>     purge remains a privileged incident tool, not the ordinary publish path.
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
>     Preview Candidates remain private, protected, expiry-bounded product
>     artifacts; they do not require one Vercel deployment per candidate or
>     count as public field evidence.
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
>     optional pause can stop all production projects, blanket automatic pause
>     is not the normal bill-control action. Source-owned circuit breakers first
>     stop or defer optional high-cost work while preserving safe public/giving
>     access. DDoS/WAF/bot/rate controls are narrow, observable, and tested in
>     log/challenge/enforcement stages against legitimate donors, assistive
>     technology, weak devices, staff, verified crawlers, and webhooks. Tenants
>     receive no surprise quota, aesthetic restriction, or public shutdown
>     without a separately ratified product and continuity policy.
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

## Consequences

- Product capacity remains provider-neutral and versioned while launch is
  explicitly qualified for Vercel through a separate immutable attachment.
- Minimum, typical, and measured-maximum cohorts cannot be activated or
  advertised until every numeric workload, experience, resource, failure, and
  unit-cost cell has reproducible evidence.
- D1 and each settled source domain retain authority. Provider state, caches,
  deployments, metrics, and spend controls remain derivative implementation
  evidence.
- Public caching is exact-generation, structurally scoped, deterministic-
  success-only, precisely invalidated, and adverse-aware; private, Preview,
  diagnostic, invalid, and error responses remain outside favorable shared
  caches.
- Vercel Functions, Postgres connections, Payload queries, Inngest work, media
  transforms, builds, previews, and browser artifacts receive bounded,
  Tenant-fair evidence instead of relying on provider maxima.
- Staff and public UX remain quiet and provider-free, preserving the last safe
  state, exact receipts, accessible status, and source-owned recovery.
- Provider usage is normalized to product outcomes. Optional work sheds before
  current public truth or donor access, and provider-wide pause is not the
  ordinary automatic bill-control action.
- Application, content, package, cache, database, search, and workflow rollback
  remain distinct and compatibility-gated.
- Launch does not add active-active multi-cloud, per-Tenant Vercel projects,
  speculative sharding/replicas, a custom billing engine, or another workflow,
  health, incident, or observability product.

## Evidence

- [D33 exact formulation and decision brief](../prds/sitestacker-parity/research/phase-23-d33-production-capacity-envelope-decision-brief.md)
- [D33 Vercel primary-source research](../prds/sitestacker-parity/research/phase-23-d33-vercel-capacity-primary-source-research.md)
- [D33 complete 17-category adversarial review](../prds/sitestacker-parity/research/phase-23-d33-production-capacity-adversarial-review.md)
- [D33 complete UX and service journey](../prds/sitestacker-parity/research/phase-23-d33-production-capacity-ux-journey.md)
- [Phase 23 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md)

Ratification authorizes documentation only. It does not authorize code, schema,
RLS, data repair, migration/backfill, dependency or provider changes, Vercel
settings, telemetry activation, issue or specification publication, Git
publication, deployment, production access, D1 activation, or release.
