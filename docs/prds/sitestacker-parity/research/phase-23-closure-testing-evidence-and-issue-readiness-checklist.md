# Phase 23 — Closure Testing, Evidence, and Issue-Readiness Checklist

**Status:** Mandatory carry-forward input under founder-ratified D36 and for the
future Phase 23 specification; not implementation evidence.  
**Date:** 2026-08-24  
**Source:** Phase 23 source-prompt sections 66–68, translated through
founder-ratified D1–D35.  
**Purpose:** Keep the complete test and evidence obligation durable in the repo
so a fresh specification or ticket agent does not depend on an external prompt
file or revive superseded architecture.

## How to use this checklist

- Preserve every named proof area in the eventual specification and issue
  graph. A ticket may own a subset, but no item disappears silently.
- Translate each test through D1–D35. This checklist cannot weaken or amend a
  ratified decision.
- Treat D34 provider qualification and D35 hosted-state census as
  implementation-time qualified-review gates, not facts already proved by
  grooming.
- Keep **Built**, **Live**, and **Confirmed** separate. A schema, fixture,
  document, preview, or passing unit test is not live-product evidence.
- Record negative results, known limitations, excluded future-owner cases, and
  stop conditions as evidence rather than marking them complete optimistically.

## Mandatory testing matrix

### Payload cohort and clean-target qualification

Prove:

- one fresh database on the exact D34-qualified Payload v4 cohort;
- exact lockstep package versions and reproducible install;
- D35 clean-target construction from a fresh clone and empty database;
- repository/current-source census plus a read-only hosted row/object census
  for every named target before any destructive action;
- fixture reset/reseed and, only when the census requires it, any temporary
  retained-state transform;
- provider and plugin migrations required by the admitted cohort;
- rollback/restore or clean reset/rebuild for each pre-acceptance failure point;
- generated types, generated artifacts, and import map consistency;
- build, server startup, and the intended Web Studio route;
- raw Payload Admin redirect/lockdown;
- REST, GraphQL, and Local API posture; and
- one-authority completion with no legacy route, flag, table, environment
  variable, reader, writer, or compatibility path.

D35 does **not** require an in-place production upgrade, dual write, public
shadow traffic, permanent ETL platform, or live-customer cutover. If a target
has become production or customer-relied-upon, stop and obtain a new cutover
decision.

### Tenant, environment, Site, locale, and permission isolation

Test every applicable:

- collection and global;
- version and draft;
- relationship and reference lookup;
- Page, placement, Navigation, redirect, search document, and public
  generation;
- job, schedule, Preview Candidate, and preview session;
- media row, rendition, and byte access;
- form definition, submission, receipt, and destination;
- saved view, folder, Topic, Trash record, audit projection, count, and health
  item; and
- user-bound and service-bound Local API operation.

For each, prove only the exact server-derived scope dimensions owned by its
controlling decision, current capability reproof, non-enumerating denial,
relationship closure, safe counts, and no cross-scope identifiers or cached
results. Tenant, environment, Site, locale, user/owner, audience, purpose, and
other dimensions apply only where the ratified owner contract defines them.
Global immutable code-owned catalogs remain global and are never copied into
Tenant rows merely to satisfy this matrix. D27 Media identity is Tenant-wide;
Site use is a qualified relationship, not a Site-owned duplicate asset.

### Local API and provider-bypass safety

Prove:

- user-bound operations enforce access with `overrideAccess: false` or the
  admitted equivalent;
- privileged service operations are explicit, purpose-bounded, and never
  caller-selected;
- cross-Tenant, cross-environment, cross-Site, and cross-locale IDs fail
  safely;
- raw REST/GraphQL/Admin/provider hooks cannot bypass typed Asym commands;
- expected revisions, locks, sealed candidates, and idempotency are honored;
  and
- provider errors are not converted to empty success, safe counts, or false
  completion.

### Draft and restricted-data leak matrix

Search for draft, preview-only, trashed, restricted, unauthorized-locale, and
cross-scope data in:

- HTML and React Server Component payloads;
- metadata, Open Graph/social cards, sitemap, and robots output;
- REST, GraphQL, Local API, and error bodies;
- public search, facets, counts, suggestions, and zero-result recovery;
- Navigation, redirects, canonical URLs, and breadcrumb output;
- CDN/application caches and invalidation receipts;
- Preview URLs, cookies, redirects, logs, and referrers;
- form confirmations and notification payloads;
- media URLs, renditions, thumbnails, metadata, and download responses; and
- logs, traces, metrics, audit projections, exports, and support diagnostics.

### Page tree, paths, and route continuity

Test:

- create, reorder, move, reparent, and deep descendants;
- cycle rejection and disconnected ancestry;
- exact path derivation and normalization;
- sibling, reserved-route, redirect, and active-route collision;
- concurrent move, stale base, lost response, retry, and rollback;
- Page identity continuity across slug and ancestor changes;
- descendant path and redirect effects;
- redirect loop, chain, query-string, external-target policy, 404, and 410;
- cross-Site and cross-locale denial; and
- large-tree performance plus cache/search/Navigation convergence.

### Navigation

Test:

- Page Link, External Link, and Group composition;
- both ratified public Navigation purposes;
- bounded nesting, keyboard reordering, and non-drag alternatives;
- draft Navigation, released Navigation, and Preview Candidate behavior;
- unpublished, moved, trashed, and broken Page references;
- exact Site and locale scope;
- release coordination with Page/path/redirect changes; and
- public fallback and failure containment without serving a partial candidate.

### Blocks, reusable sections, templates, and presentation packages

For every launch block/family/profile and certified custom package, test:

- typed schema and semantic validation;
- authoring, rendering, Preview, and exact release compilation;
- allowed family/profile/variant combinations;
- Page-local versus explicit reusable-section behavior;
- responsive layout, mobile reflow, zoom, and orientation;
- keyboard, focus, screen-reader, contrast, and reduced-motion behavior;
- unsafe/malicious input and public projection minimization;
- locale behavior and missing-copy states;
- unsupported old version, version migration, and safe rejection; and
- package isolation, bundle/performance budget, failure containment, rollback,
  and complete-cohort activation.

For every D9 custom Presentation Package, additionally prove:

- statically restricted imports and zero direct access to authentication,
  authorization, Payload/Supabase/database clients, secrets, cookies,
  filesystem/process APIs, arbitrary network clients, server actions, or
  operational writes;
- canonical platform ownership of Give, checkout, consent, qualified forms,
  routes, canonical/SEO facts, and every money or restricted-data capability;
- immutable package/version/artifact digest, source repository and commit,
  deterministic build, human maintainer, support window, compatibility range,
  emergency contact, deprecation, retirement, and rollback successor;
- locked dependencies, SBOM, licenses, provenance, vulnerability review, and
  AI-assisted-source disclosure without treating AI output as certification;
- CSS containment, reviewed assets/fonts/origins, CSP compatibility, declared
  egress, sanitized rendering, and production source-map posture;
- SSR, deterministic hydration, meaningful no-JavaScript output, failed asset/
  font/motion behavior, and no manufactured loading delay;
- exact SDK/compiler/catalog/profile generation compatibility and every empty,
  minimum, maximum, invalid, historical, missing-media, and failed-input state;
- cross-Tenant/environment/Site denial, cache-key isolation, and restricted fact
  absence before renderer invocation and from all output/telemetry; and
- actual-content Preview/public parity, JavaScript/CSS/font/image/Core Web
  Vitals budgets, lower-end devices, locale/RTL/CJK behavior, revocation,
  deployment skew, stale candidate, and last-known-good recovery.

### Rich text and typed video embeds

Test:

- paste from Word and Google Docs;
- headings, lists, links, and the allowed bounded formatting profile;
- explicit review/rejection, plain-text conversion, or cancel behavior for
  pasted tables, images, embeds, code, footnotes, and other unsupported nodes;
- typed video provider/URL/embed records and privacy-conscious playback;
- accessible labels, captions/transcripts, keyboard operation, and responsive
  media;
- unsafe HTML, scripts, malformed nodes, disallowed URLs, and provider changes;
- unknown profile/node versions and migration; and
- identical safe rendering in editor, Preview Candidate, and public generation.

### Working revisions, autosave, conflicts, and restore

Test:

- bounded autosave and truthful saved/saving/offline/error status;
- network interruption, retry, browser close, reload, and recovery;
- two editors, active-editor lease, stale editor, and explicit takeover;
- stale base, compare/diff, restore, and new-successor creation;
- exact-revision publish/schedule pinning;
- version retention and bounded cleanup; and
- keyboard, screen-reader, mobile, and no-toast-only status communication.

### D1 release and whole-Site Preview Candidate

Test:

- Page + placement + Navigation + redirect + presentation + SEO compilation;
- exact source/version manifests and complete-cohort validation;
- Preview Candidate creation, expiry, revocation, access, and whole-Site
  navigation;
- the ratified capability/review evidence without inventing a configurable
  approval engine;
- concurrent candidate/release attempts and compare-and-swap activation;
- partial compile, storage, cache, and activation failure;
- retry, reconciliation, rollback to the last safe generation, and audit
  receipts; and
- no public exposure of candidate or partially built state.

### Exact public audience and app-owned authenticated surfaces

Test D24's public/privacy/cache boundary:

- exact `public` is required in every public contract and artifact; missing,
  unknown, conditional, segmented, or personalized audience values fail closed;
- complete Tenant × environment × Site × locale × resource/path × generation ×
  contract/renderer × `public` cache and artifact identity;
- static dependency denial from public compiler, renderer, Navigation, D9
  package, D14 source, metadata, sitemap/robots/social, and D17 search paths to
  auth, session, segment, donor, missionary, staff, or personalization inputs;
- warm-cache A→B→A isolation across scope, host alias, generation, HTML, RSC,
  prefetch, direct/client navigation, crawler, and authenticated/anonymous
  request classes;
- normalized output invariance for anonymous, donor, missionary, staff,
  expired/malformed session, and crawler requests;
- zero protected identity, token, assignment, provider, preview, restricted,
  donor, missionary, or staff facts in public content, media, metadata, search,
  social, analytics, logs, caches, or errors;
- app-owned private-destination links without rendering private content inside
  the public CMS or implying a public-session content variant; and
- staff comprehension of draft, private Preview, Released, Updating, Live,
  Listed, Shared by link, and app-owned private destinations across accessible
  and adverse network states.

### Scheduled publication operations

Test:

- scheduled publish and unpublish of the exact pinned revision/release input;
- displayed timezone, stored instant, daylight-saving transitions, and locale;
- duplicate, missing, delayed, and replayed runner execution;
- disabled user, revoked permission, disabled Site, changed source, changed
  route, and superseded appointment;
- retry, overdue backstop, cancellation, reschedule, and uncertain result;
- idempotency and compare-and-swap activation; and
- bounded Inngest/executor cost, concurrency, observability, and recovery.

### Dynamic sources, content-list curation, and page windows

For every certified source, test:

- exact catalog key/version and safe projected fields;
- source-qualified filters and sorts;
- all three D15 curation strategies, pin/exclude behavior, and stable ordering;
- link-native public windows, independent pagers, Load more, infinite scroll,
  and button-only discovery;
- multiple lists on one Page without URL/history/focus collisions;
- empty, zero-result, end-of-list, stale cursor, changed data, and duplicate item
  states;
- source outage, restricted or draft operational record, and adverse removal;
- cache/revalidation and public-generation consistency; and
- exact Tenant/Site/locale isolation.

### Public Site Search Projection

Test:

- publish, update, move, unpublish, Trash, restore, and emergency restriction;
- Site, locale, route, family, and public-eligibility isolation;
- ranking, zero results, typo tolerance, and accessible query/result UX;
- no private facet/count/suggestion leakage;
- generation/search convergence, bounded lag, and deletion health;
- full reindex, failed/interrupted reindex, replay, and reconciliation;
- stale or missing index fallback without querying drafts; and
- performance and cost at D33 launch envelopes.

### Site Search & Sharing Profile

Test D28 independently from D17 on-site search:

- one versioned Tenant × environment × Site profile and exact-locale D1 pins,
  with no mutable Site-global public head or cross-locale activation;
- deterministic locale-exact generated title, description, and qualified share
  image defaults without copied Page values or another-locale fallback;
- exactly three Page-locale overrides—semantic title portion, one shared short
  description, and one D27-qualified share-image placement—including create,
  reset-to-generated, provenance advisory, unchanged-control, blank/Unicode,
  hostile-length, and no-fourth-override behavior;
- the bounded code-owned title-pattern catalog, locale punctuation/whitespace,
  duplicate-name suppression, and rejection of HTML, arbitrary templates,
  placeholders, or a tenant formatting DSL;
- verified-host authority, forwarded-host spoofing, host cache poisoning,
  canonical URL, route reach, current-versus-planned URL, and shared-host/
  subdirectory behavior;
- reciprocal exact-locale alternates, missing translation, no silent locale
  fallback, locale-independent release, and crawler/session/anonymous output
  invariance;
- safe provider-neutral JSON-LD/structured data, hostile strings and URLs,
  schema allowlists, no arbitrary head scripts, deterministic serialization,
  and no-JavaScript HTML/head parity;
- D13 schedules, D21 Trash/restore, D25 Preview darkness, D27 media expiry or
  withdrawal, Page moves, redirects, 404/410, and emergency adverse changes;
- truthful significant-change `lastmod`, sitemap membership/removal, robots
  behavior, cache/invalidation, durable post-activation work, provider failure,
  retry, and forward recovery;
- keyboard, screen-reader, touch, 320-pixel reflow, 400% zoom, reduced motion,
  RTL/CJK, weak network, Clipboard denial, Web Share cancellation, and accessible
  share-action alternatives; and
- truthful internal/external status: submission, fetch, or provider receipt is
  never described as indexed, ranking-improved, or socially refreshed.

### Public forms and domain-owned submissions

Test:

- valid submission, client/server validation, and accessible errors;
- spam, abuse, rate limit, bot handling, and enumeration resistance;
- consent, privacy copy, retention, and sensitive-field restrictions;
- launch-time file/upload field rejection with no hidden byte intake; any future
  upload requires a separate purpose and custody certification;
- durable receipt before asynchronous routing;
- exactly one purpose-qualified Primary Outcome plus independently governed
  acknowledgement/notification child effects; Support Hub-only, email-only
  through one action-qualified Verified Email Destination, Mobilize, and any
  other certified operational outcome remain mutually exclusive primary
  owners;
- email-only recipient resolution freezes the exact same-Tenant required
  members per submission, records each member outcome independently, conceals
  addresses from one another, and completes only when every frozen required
  member is transport-accepted; later adverse evidence becomes **Needs
  attention** without inventing a second staff inbox;
- email-template/Resend notification deliveries only when the Phase 6/17 owner
  contract is certified, with notification failure never rolling back a
  successful Primary Outcome;
- duplicate, replay, partial destination failure, retry, and reconciliation;
- safe redirect/confirmation validation and public fallback;
- no payment or giving-domain bypass; and
- truthful staff delivery status without provider jargon or false success.

### Public media catalog and custody

Test:

- MIME/file-signature spoofing, file size, malformed media, and decompression
  hazards;
- filename, metadata, orientation, color profile, dimensions, duration, and
  checksum;
- Tenant-wide identity, exact Site-use qualification, permission, and public/
  private separation;
- usage-local localized alt and caption, displayed credit, focal/crop intent,
  and locale usage;
- explicit launch rejection of uploaded audio/video and audiovisual,
  transcription, or future public-document profiles until a later purpose and
  custody contract certifies them;
- usage references, replace-with-new-identity semantics, Trash, restore, and
  purge eligibility;
- original-byte immutability, rendition provenance, transformation failure,
  replay, and reconciliation;
- signed/private access and public CDN behavior; and
- Phase-29 custody adoption without changing D27 semantic identity.

The D27 launch gate also proves:

- private upload-grant issuance, expiry, revocation, object-before-row,
  row-before-dispatch, lost finalization, callback replay, concurrent revision,
  and orphan cleanup behavior;
- hostile/malformed/oversize/animated/HEIC corpora, malware policy, bounded
  decode/decompression, EXIF/GPS and unsafe metadata removal, deterministic
  renditions, and no public raw/candidate path;
- current rights, consent, safeguarding, Phase 10 clearance, allowed audience,
  permitted use, expiry, and withdrawal at release and delivery; time-bounded
  permission expires automatically without a favorable stale fallback;
- active-generation, bounded delivery, and private recovery retention as
  distinct states, with coherent cached/in-flight G-to-G+1 behavior and honest
  purge convergence;
- complete **Used in** coverage across drafts, Preview, schedules, active,
  delivery/recovery-retained, reusable, Navigation, profile, Rich Text, SEO,
  custom package, and migration-legacy owners; rebuilding cannot say Unused or
  authorize disposal;
- retention strengthening/shortening, legal/safeguarding hold, source-required
  disposition, non-cascading Trash/restore, execution-time reproof, disposition
  tombstones, and restore suppression;
- database metadata plus independently encrypted byte backup/restore by digest,
  declared RPO/RTO, missing-byte containment, and provider exit without changing
  semantic identities or reviving disposed media;
- production-shaped 25,000-item search, 50-item intake, keyset/index/RLS plans,
  processing concurrency, weak-mobile behavior, storage/egress/backup and queue
  budgets, and oldest-age health; and
- moderated nonprofit staff proof of upload, select, replace, find, rights,
  usage, Trash/restore, failure, and recovery comprehension—including zero
  belief that upload publishes or Restore republishes.

### Governed content portability

Test D29 as a content-specific portability boundary, not the Phase 30 general
import product:

- permission- and scope-governed staff export requests, one coherent snapshot
  of exact source versions, purpose-minimal field allowlists, locale-exact
  content, stable semantic identities, relationship closure, and no secrets or
  provider internals; concurrent edits never mutate a sealed artifact and
  require a new export to appear;
- private generated artifacts, encrypted storage, checksums, size/record bounds,
  and cross-Tenant denial; every download re-proves current capability and the
  exact artifact/object scope, records an audit receipt, uses only a short-lived
  transport URL after that check, and fails closed after revocation or expiry;
- spreadsheet/formula injection, hostile filenames, path traversal, archive
  bombs, symlinks, SSRF/remote fetch attempts, malicious structured content,
  oversized packages, and unknown package/source versions;
- versioned package reader/writer round trips and golden fixtures for every
  certified source/version;
- read-only staging and semantic validation that performs **zero destination
  writes**, produces one sealed review plan, and becomes stale rather than
  silently rebasing when source or target facts change;
- a separate fresh privileged commit that re-proves actor, capability, Tenant,
  environment, Site, locale, plan digest, target state, and limits;
- only D12 private draft revisions as import results—never D1 activation,
  Navigation, redirect, schedule, form, message, public-media, search, or other
  public side effects;
- two-pass stable-identity and relationship closure, explicit media/path
  dispositions, locale-exact outcomes, repeat/resume, partial commit, lost
  acknowledgement, duplicate delivery, reconciliation, reversal planning, and
  safe recovery; and
- clear map → validate → review plan → authorized commit → results journeys with
  keyboard, screen reader, touch, reflow, reduced motion, weak network,
  interruption, stale-plan, progress, and downloadable error evidence.

### Single staff authority and governed Engine Diagnostics

Test D30 independently from ordinary provider/API access tests:

- one Supabase-authenticated Principal Link and current Phase 12 capability
  authority across Tenant/Site switching, parallel tabs, revocation, session
  expiry, authorization outage, preserved work, denial, access request, and
  support handoff;
- every human operation through the actor-bound port with request, current user,
  access/lock enforcement, transaction context, and D12 evidence;
- every service command registered separately with narrower purpose, scope,
  idempotency, authorization, and durable receipt;
- raw Payload Admin, provider auth, generated REST/GraphQL, and Local API routes
  cannot become fallback product surfaces under direct URL, feature flag,
  rollback, or provider upgrade;
- Engine Diagnostics opens only for an active incident plus a fresh current
  AAL2 event, exact scope, least disclosure, 15-minute default, 60-minute
  maximum, bounded extension, immediate revocation, and fail-closed durable
  audit;
- diagnostic grants and views are strictly read-only, redact content and
  identity beyond purpose, cannot widen scope, and perform zero mutation;
- typed Repair commands remain outside the diagnostic grant and require fresh
  independent authorization, idempotency, execution fencing, and receipts; and
- staff entry/context/denial/expiry/revocation/support journeys plus operator
  authorization latency, request-local memoization, query and diagnostics cost
  at production-shaped volumes.

### Localization and multisite

Test:

- default locale and explicit translation starts;
- missing locale with **no silent field fallback**;
- translated slug/path, Navigation, SEO/sharing, search, schedule, and Preview;
- independent exact-locale draft/review/release status;
- cross-locale cache and adverse removal;
- shared source-owned content versus independent Copy-to-Site ordinary drafts;
- Site-specific content, presentation, Navigation, search/sharing profile, and
  overrides;
- the same path/slug on different Sites;
- exact host/Site resolution when Phase 24 supplies it; and
- no cross-Site or cross-locale leakage.

### Content Library operations

Test:

- purpose-bounded authority-free folders;
- versioned Topic Sets, direct labels, and safe public qualification;
- personal and Site-shared Saved Views, ownership copy, and invalidated source
  fields;
- reference-aware Trash, restore collisions, purge blockers, and exact usage
  counts;
- folder/Topic/view/Trash access and non-enumerating results;
- large libraries, bulk selection, keyboard operation, focus continuity, and
  mobile/reflow; and
- D31 health and cause-owned recovery for drift, stale references, and failed
  adverse convergence.

### Derived exception-first Content Health

Test D31 as a derived workspace over source evidence, not a new source of truth
or workflow engine:

- exact issue-family registry, stable issue identity, source evidence,
  resolution proof, freshness budget, disposition, impact, responsibility,
  progress, urgency, safe staff copy, and cause-owned action;
- exact Tenant/environment/Site/locale/resource scope and Phase 12/D30 access
  across rows, versions, relationships, projections, caches, URLs, errors,
  receipts, recovery commands, and parallel tabs;
- quiet healthy state with exception-first grouping, no noisy score/dashboard,
  and the same canonical issue identity from contextual status and the central
  workspace;
- projection lag, stale/incomplete evidence, missing receipt, reconciliation
  drift, rebuild, partial outage, and projector failure without false green or
  interruption of authoritative source workflows;
- every typed Recovery Command independently authorized, current-state fenced,
  idempotent, bounded, observable, and validated against source-owned resolution
  proof; stale/superseded commands no-op safely;
- actionable, automation-in-progress, platform-attention, incomplete-evidence,
  recently-resolved, reminder, notification, source-navigation, denial, outage,
  concurrency, and import-onboarding journeys;
- separation of staff-safe status from D30 privileged engine detail and from any
  Phase 34 workflow/task state; and
- production-shaped lag, convergence, issue/query volume, grouping/fairness,
  notification deduplication, recovery outcome, false-resolution/reopen rate,
  and task-completion measurements.

### Accessibility Assistance product behavior

Test D32 as a quiet non-policing assistance product, not merely as WCAG
compliance testing:

- exactly three ordinary finding classes—**Details to finish**, **Suggestion**,
  and **Technical issue**—with stable rule identity, source owner, semantic
  digest, check-meaning version, visitor-centered copy, and repair intent;
- only an already-ratified source-owned semantic invariant can block a successor
  D1 release; a D32 catalog update, automated scanner severity, or editorial
  quality opinion can never create a new release gate;
- Suggestions remain non-blocking, interruption-free, and tenant-autonomous,
  including contextual review, **Keep as written**, **Use suggestion**, and
  semantic-change invalidation without nagging;
- no score, grade, shame, certification badge, approval workflow, issue tracker,
  suppression debt, or claim of legal compliance;
- inaccessible/stale/unavailable advisory checks fail open for authoring and are
  stated truthfully, while exact source-owned invariants and unproved D9 package
  contracts still fail closed at D1;
- D1 evaluates the same exact compiled candidate across UI, API, import,
  schedule, reuse, dynamic content, locale, custom package, compiler, and
  capability-island paths with no client-state/scanner bypass;
- exact Tenant/environment/Site/permission/locale/revision/candidate scope,
  non-enumerating private content, approved scanner/model boundaries, and
  privacy-safe evidence;
- unavailable checks, candidate races, concurrent editors, lost
  acknowledgements, package failure, unknown publication outcome, rollback, and
  current-public-generation preservation;
- bounded digest reuse, concurrency, load, cost, and telemetry without
  per-keystroke whole-Site scans, remote release dependency, or high-cardinality
  content evidence; and
- moderated create/edit/locate/repair/Preview/Publish/locale/reuse/package-
  defect/recovery journeys with disabled and occasional nonprofit ministry
  staff, resolving blocker-versus-suggestion confusion before launch.

### Accessibility and UX proof

Test with automated checks and representative manual journeys:

- Page tree and every drag-and-drop alternative;
- Navigation and list reordering;
- editor forms, inline/summary errors, and validation focus;
- status, autosave, conflicts, compare/diff, restore, schedules, and health;
- whole-Site Preview and public journeys;
- rich text, embeds, media, forms, lists, search, and pagination;
- color/contrast, visible focus, keyboard, screen reader, zoom, mobile reflow,
  touch targets, and reduced motion;
- contextual handoffs that preserve return context and do not leak unavailable
  capabilities; and
- content-editor usability findings from nonprofit ministry staff scenarios,
  including infrequent administrators and multilingual teams.

### Capacity, performance, cost, and resilience

Test within the D33 Production Capacity Profile:

- large content library, Page tree, redirect set, Navigation, version history,
  and media catalog;
- several Sites/locales, dynamic lists, search, Preview, publication, and cache
  invalidation;
- Vercel build/runtime/cache/image costs and budgets;
- database query plans, indexes, connection pooling, lock/transaction duration,
  and RLS behavior;
- concurrent editors, releases, schedules, form submissions, and repairs;
- database, Payload executor, Inngest, Vercel, storage, search-index, and cache
  outages;
- partial publish, delayed schedule, failed rendition, failed routing, and
  interrupted D35 replacement;
- backpressure, bounded retry, idempotency, reconciliation, and last-safe-public
  continuity; and
- measured thresholds and stop/admission results rather than guessed scale.

## Mandatory evidence package

The implementation evidence package must include:

- repository/current implementation census;
- current Payload configuration census;
- Phase 22 PR #1323 dependency and accepted-contract record;
- current public-read graph;
- source-of-truth and downstream-owner matrix updates;
- exact D34 Payload-version qualification record;
- D35 named-target hosted row/object census;
- clean-target dry run and reproducibility proof;
- fixture reset/reseed proof and any required retained-state transform dry run;
- pre-acceptance reset/restore proof and one-authority completion proof;
- raw-admin lockdown and staff-auth proof;
- user-bound Local API access and privileged-service-boundary proof;
- the controlling-decision-specific applicable scope and isolation matrix across
  Tenant, environment, Site, locale, user/owner, audience, purpose, and
  relationships, while proving that global immutable code-owned catalogs remain
  global rather than becoming Tenant-owned duplicates;
- draft/restricted-data leak negative tests;
- Page-tree, Page-move, path, route-continuity, and redirect proof;
- Navigation draft/release proof;
- exact-revision and coherent Site-generation publication proof;
- whole-Site Preview Candidate security and fidelity proof;
- D24 exact-public audience, complete cache/artifact identity, static dependency
  denial, warm-cache A→B→A isolation, request-class output invariance,
  protected-fact absence, app-owned private destination, and staff-comprehension
  proof;
- D9 custom Presentation Package manifest, forbidden-capability, deterministic
  build, locked dependency/SBOM/license/provenance, CSP/source-map, cross-scope,
  SSR/no-JavaScript, accessibility, performance, support/deprecation, and
  last-known-good recovery certification evidence;
- scheduler/executor deployment, exact-time behavior, idempotency, and missed-
  schedule recovery proof;
- Dynamic Source Catalog and adapter conformance inventory;
- operational-projection safety proof;
- public search indexing, bounded-lag, reindex, and adverse removal proof;
- localization storage and no-silent-fallback proof;
- multisite isolation and Site-owned copy proof;
- form ownership, receipt, consent, routing, failure, and retry proof;
- D27 media intake/finalization fault, hostile-file/scan/decode/metadata,
  identity, public qualification, usage-local localized alt/caption, current
  rights/consent/safeguarding, byte/rendition custody, complete Used-in,
  retention/hold/disposition, backup/restore/provider-exit, 25k/50-item/weak-
  mobile/cost, and moderated comprehension proof;
- D28 profile/version, generated default, exactly-three-override, verified-host,
  canonical/alternate, safe structured-data, crawler/no-JavaScript invariance,
  sitemap/robots/lastmod/404/410, D13/D21/D25/D27 interaction, accessible share,
  cache/provider-failure, and truthful external-status proof;
- D29 versioned portability package, coherent snapshot, private artifact,
  download-time capability/object-scope reauthorization, download receipt,
  revocation/expiry denial, malicious archive/SSRF, no-write sealed plan,
  separate privileged D12-only commit, zero-public-side-effect, partial/resume/
  reconcile/reversal, locale, and accessible journey proof;
- D30 one-staff-authority and Engine Diagnostics proof, including Principal Link
  and context, raw-provider denial, open incident + fresh AAL2, least disclosure,
  15/60-minute bounds, revocation, fail-closed audit, zero mutation, repair
  separation, staff/support journeys, and cost;
- cache keying, tagging, invalidation, and emergency adverse-action proof;
- D31 issue registry/identity, source evidence/freshness, exact scope, no-false-
  green, contextual/central identity, cause ownership, typed recovery fencing,
  accessible staff journey, operator-detail separation, lag/cost, and outcome
  proof;
- D32 three-class, source-owned-blocker, nonblocking Suggestion/Keep-as-written,
  no-score/no-policing, advisory fail-open, all-path candidate parity, privacy,
  race, cost, and moderated disabled/occasional-staff evidence;
- complete accessibility results and manual journey findings;
- D33 capacity, performance, Vercel cost, and recovery results;
- content-editor usability findings;
- operations repair walkthroughs;
- known limitations and explicitly deferred future-owner capabilities;
- Payload upgrade posture and enterprise-feature independence;
- complete legacy retirement evidence; and
- Built/Live/Confirmed status for every claimed capability.

No Phase 23, Payload v4, Web Studio, tenant-isolation, draft-safety,
scheduling, public-search, multisite, localization, accessibility, performance,
or SiteStacker-parity claim is permitted without its corresponding evidence.

## Issue-readiness ownership map

Future specification and ticket agents must not decide these fundamentals:

| Fundamental the prompt forbids ticket agents from redesigning | Ratified authority           |
| ------------------------------------------------------------- | ---------------------------- |
| What Web Studio is                                            | D1, D23, D30                 |
| What Payload owns                                             | D30, D34, D35                |
| What a Page is                                                | D1, D6, D22, D23             |
| How hierarchy works                                           | D2                           |
| How publication works                                         | D1, D4, D10, D25             |
| How scheduling runs                                           | D13                          |
| How Navigation publishes                                      | D4–D5                        |
| How redirects execute                                         | D3                           |
| How dynamic lists query                                       | D14–D16                      |
| How public search stays safe                                  | D17                          |
| How permissions work                                          | Phase 10, Phase 12, D24, D30 |
| How current implementation replacement occurs                 | D34–D35                      |

If a ticket cannot cite the controlling decision, it is not ready for an agent.
If implementation evidence contradicts a qualified premise, stop and request
the explicit amendment required by that decision rather than redesigning the
product inside the ticket.

## Closure classifications

- **Ratified:** D1–D36 product, architecture, and formal-closure decisions.
- **Explicitly deferred:** capabilities owned by Phases 24–31, 33–34, and
  36–40 beyond the exact seams named by D1–D35.
- **Qualified-review gated:** exact D34 Payload cohort/admission and D35
  named-target hosted-state census/disposition.
- **Blocked by predecessor amendment:** none presently; Phase 22 contract
  congruence remains mandatory and root `CONTEXT.md` synchronization remains
  held.
- **Unresolved:** none within Phase 23 grooming. A later contradiction requires
  an explicit numbered founder amendment under D36.
