# Phase 23 D27 Public Media Catalog Ruthless Adversarial Review

**Status:** Complete hardening review supporting the founder-ratified Phase 23
D27 C-prime-R decision. Ratification authorizes no implementation, schema,
provider/dependency adoption, migration, issue, deployment, D1 activation, or
release.

**Date:** 2026-08-23

## Reviewed proposition

> **C-prime — One bounded Tenant-wide Public Media Catalog with Site-use
> qualification over a Phase-29-compatible immutable byte-and-rendition custody
> contract.**

The review tested that proposition against:

- ratified D1, D7, D9, D11, D18, D20–D26, Phase 10's publication-safety
  ceiling, and the Phase 29 ownership boundary;
- Core's exact `payload@4.0.0-internal.1f9ae9a`, Vercel Blob adapter, current
  Media collection, public serializer, CMS UI, Supabase schema/RLS, and existing
  Inngest execution seams;
- current official Payload, Supabase, Vercel, Sharp, W3C/WCAG, OWASP, IPTC,
  C2PA, UNICEF, Dóchas, Save the Children, and ICRC sources; and
- documented DAM patterns in Sanity, Storyblok, Webflow, Contentful,
  Cloudinary, and Bynder.

Supporting evidence:

- [Payload 4 DAM primary-source research](./phase-23-d27-payload-4-dam-primary-source-research.md)
- [Supabase byte custody and RLS research](./phase-23-d27-supabase-byte-custody-and-rls-research.md)
- [Nonprofit DAM UX and workflow research](./phase-23-d27-nonprofit-dam-ux-and-workflow-research.md)
- [D27 decision brief](./phase-23-d27-public-media-authority-decision-brief.md)

## Rating method

Severity describes plausible impact before the permanent prevention:

- **Critical:** cross-Tenant/sensitive disclosure, unsafe public release,
  irreversible custody loss, or release corruption.
- **High:** material user harm, inaccessible publishing, broken live output,
  unrecoverable work, or sustained operational failure.
- **Medium:** bounded confusion, cost, support burden, or repairable degradation.
- **Low:** inconvenience with safe recovery.

Likelihood is **Certain**, **Likely**, **Possible**, or **Unlikely** under a
naive extension of the current system. **Certain** means the condition is
already present or structurally unavoidable without a control; it does not mean
every instance causes harm. Every category has a material concern because a DAM
is a high-consequence boundary; that does not make every residual risk high. The
hardened contract removes avoidable risk and leaves only measured operational
residuals.

## 1. Brittleness

**Material concern: Yes.**

### B1 — Provider filename and mutable URL assumptions

- **What could go wrong:** A re-upload, same-name collision, adapter change,
  cache delay, folder move, or provider migration changes or overwrites the byte
  behind a public URL. Old D1 generations then render new or missing media.
- **Why it matters:** Release exactness, forward recovery, cache correctness, and legal
  evidence all depend on the byte not drifting.
- **Severity / likelihood:** **Critical / Likely.**
- **Evidence:** The exact Payload update path deletes old associated files;
  Payload's cloud hook admits same-name overwrite; Vercel recommends immutable
  paths because overwrite/delete propagation and browser caches are not
  immediate.
- **Permanent prevention:** Stable logical asset, append-only byte revision,
  immutable rendition ID/digest, content-addressed delivery path, and exact D1
  pins. Folder, title, original filename, and provider key are never identity.

### B2 — Depending on announced Payload 4 DAM behavior

- **What could go wrong:** A canary/internal upgrade changes folders, upload,
  Admin components, file versioning, references, access, or migrations after
  D27 has treated them as product truth.
- **Why it matters:** The current pin and current public docs are not a stable
  generic capability promise.
- **Severity / likelihood:** **High / Likely over upgrades.**
- **Evidence:** Core pins an internal Payload v4 commit; Payload's own current
  DAM announcement says several important features are still being shaped.
- **Permanent prevention:** Public Payload customization APIs only; Asym-owned
  provider-neutral authority; exact-pin graduation suite; unknown/incompatible
  versions fail closed; no copied internal Admin implementation.

## 2. Technical debt

**Material concern: Yes.**

### T1 — One mutable Media document becomes a god object

- **What could go wrong:** Catalog metadata, byte location, rights, consent,
  processing, renditions, placement text/crop, Site eligibility, usage,
  release, Trash, and deletion accumulate in one Payload document and hooks.
- **Why it matters:** Independent lifecycles become impossible to reason about,
  test, migrate, or recover; every later feature rewrites the same model.
- **Severity / likelihood:** **High / Likely.**
- **Evidence:** Current Media already conflates upload and one global alt value;
  Payload document versions still do not preserve file versions.
- **Permanent prevention:** Separate logical asset, immutable revision,
  rights/safety evidence, Site qualification, placement, usage projection, and
  Phase 29 custody records. Persist independent facts and derive UI labels.

### T2 — Duplicated queue, search, folder, or design systems

- **What could go wrong:** D27 adds Supabase Queues beside Inngest, provider
  folder search beside Postgres catalog search, stretches D18/D20's Site Content
  Library contracts over Tenant-wide Media, adds a second UI kit, or invents
  one-off worker/retry tables.
- **Why it matters:** Two partially overlapping authorities guarantee drift and
  increase operating and upgrade cost.
- **Severity / likelihood:** **High / Possible.**
- **Evidence:** Core already has an Inngest client, dispatch ledger, work claims,
  concurrency, and recovery patterns; Payload folders and Supabase object paths
  are tempting but incomplete catalog primitives.
- **Permanent prevention:** Reuse one execution seam and Core UI; Postgres
  remains catalog search truth; D27's bounded Media Folder relationship is a
  separate Media-only contract, never D18's tree or a generic folder engine;
  D20 saved views are not widened. Introduce Media saved views, external search,
  or a second executor only after measured need and a decision.

## 3. Edge cases

**Material concern: Yes.**

### E1 — Adversarial and unusual files

- **What could go wrong:** Spoofed MIME, double extensions, polyglots, malformed
  images, extreme dimensions, decompression bombs, multi-frame animation,
  embedded GPS, active SVG/PDF, or unsupported HEIC create compromise,
  resource exhaustion, silent flattening, or confusing failure.
- **Why it matters:** Field-contributed media is untrusted input, and missions
  photos can contain unusually sensitive metadata.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence:** OWASP requires allowlisting, signature verification, generated
  names, limits, scanning, and CDR where appropriate; Sharp's exact prebuilt
  format matrix does not include general HEIC decoding.
- **Permanent prevention:** Closed `public-still-image` profile; private intake;
  independent signature/decode; byte/pixel/frame/decompression budgets;
  malware/sandbox policy; metadata removal proof; deterministic re-encoding;
  certified HEIC decoder; clear pre-transfer rejection for unsupported input.

### E2 — Concurrent retries, versions, and late callbacks

- **What could go wrong:** Two tabs add revision 8, a callback arrives after
  cancellation, a worker lease expires during output, or a user retries an
  indeterminate upload and creates duplicates.
- **Why it matters:** Duplicate or reordered work can point an asset at the
  wrong byte or leak orphaned public objects.
- **Severity / likelihood:** **High / Likely at scale.**
- **Evidence:** Storage and Postgres are not one transaction; direct-upload
  callbacks are wake-ups rather than proof.
- **Permanent prevention:** Exact upload session/idempotency, compare-and-swap
  revision allocation, fenced work claims, deterministic rendition keys,
  monotonic transitions, duplicate-event reduction, and a reconciler for both
  object-before-DB and DB-before-dispatch gaps.

### E3 — Rights, locale, and reference changes mid-release

- **What could go wrong:** Rights expire, a Site becomes disallowed, safety is
  withdrawn, a locale lacks contextual alt, or a reference projection is
  rebuilding while a candidate prepares.
- **Why it matters:** A once-ready asset is not necessarily currently safe or
  complete for the target generation.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** D1 already requires current dependency reproof and
  D22 forbids silent locale fallback; D27 adds expiring rights and safety facts,
  so a saved readiness label cannot remain sufficient release evidence.
- **Permanent prevention:** Current policy-qualified evidence, reason-coded
  Site verdict, no silent locale fallback, release-time reproof, stale
  projection fail-closed, and cause-owned adverse withdrawal.

## 4. Footguns

**Material concern: Yes.**

### F1 — “Uploaded,” “Ready,” and “Public” collapse

- **What could go wrong:** A contributor assumes upload or metadata completion
  published a photo; an admin exposes a public provider URL to preview it.
- **Why it matters:** Sensitive people and locations can become publicly
  addressable before rights/safety and D1 release.
- **Severity / likelihood:** **Critical / Likely with the current posture.**
- **Evidence / reasoning:** Core's exact Vercel adapter grants direct public
  upload to any authenticated Payload user, and its completion callback does not
  establish a durable, qualified Media revision.
- **Permanent prevention:** Private intake/candidate delivery, independent
  derived states, explicit **Ready to use** copy, persistent “not public”
  semantics, and public delivery only from an exact D1 generation.

### F2 — Destructive replacement or bulk action

- **What could go wrong:** **Replace**, **Apply to all**, **Empty Trash**, or a
  thumbnail delete silently changes many Sites, copies a false consent claim,
  or disposes retained bytes.
- **Why it matters:** Ordinary controls can cause broad legal, safety, and live-
  site harm.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** The exact Payload update/delete paths replace or
  remove associated files, while one logical Media item may be referenced by
  several Sites, locales, schedules, packages, and retained generations.
- **Permanent prevention:** **Add new version**, impact review, candidate
  activation through D1, safe-field-only bounded bulk edits, recoverable Trash,
  no Empty Trash, and independent disposition authorization.

### F3 — Framework defaults bypass policy

- **What could go wrong:** Local API `overrideAccess`, `Boolean(req.user)` upload
  access, `abortOnLimit:false`, public adapter defaults, or missing production
  storage silently grant, truncate, expose, or fall back.
- **Why it matters:** Secure UI copy cannot compensate for unsafe server
  defaults.
- **Severity / likelihood:** **Critical / Likely unless explicitly configured.**
- **Evidence / reasoning:** These are observed exact-pin/Core settings: Payload
  Local API bypasses access by default, Core's grant is `Boolean(req.user)`, the
  upload limit default is non-aborting, and the current Blob adapter is public.
- **Permanent prevention:** Narrow server commands; `overrideAccess:false` for
  user-derived Payload work; exact grants; reject on limit; fail-closed
  production startup/write; contract tests for sanitized config and behavior.

## 5. Tenant safety

**Material concern: Yes.**

### TS1 — Cross-Tenant rows, object paths, or duplicate leakage

- **What could go wrong:** An application bug links Tenant A's asset to Tenant
  B's Site, a shared prefix collides, search counts reveal a restricted item, or
  a digest warning proves another Tenant owns the same photo.
- **Why it matters:** This is a confidentiality and authorization failure,
  potentially involving protected ministry workers or children.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence:** Current client upload uses one shared prefix; Payload tenant IDs
  and operational Supabase Tenant UUIDs are different identifiers.
- **Permanent prevention:** Every child carries operational `tenant_id`;
  composite Tenant foreign keys and uniqueness; one certified ID mapping;
  deny-by-default RLS and indexed capability predicates; opaque provider keys;
  Tenant-scoped semantic dedupe; no cross-Tenant existence response.

### TS2 — Trusted workers or service roles become ambient authority

- **What could go wrong:** A valid Inngest event, service key, or S3 credential
  reads or writes an identifier belonging to another Tenant.
- **Why it matters:** Service roles bypass RLS, so filtering alone is not a
  security boundary.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Supabase documents that service-role clients bypass
  RLS; Core's durable workers necessarily perform privileged cross-system work,
  making explicit Tenant revalidation a required second boundary.
- **Permanent prevention:** Identifier-only events; reload and compare every
  record's Tenant; command authorization; least-grant non-exposed custody
  schema; no browser service/S3 credential; cross-Tenant worker denial tests.

## 6. Overengineering

**Material concern: Yes.**

### O1 — Copying an enterprise DAM feature inventory

- **What could go wrong:** AI tagging, face recognition, visual similarity,
  annotation, creative approval, external portals, arbitrary metadata/workflow
  builders, stock integrations, and analytics obscure the core job.
- **Why it matters:** They increase privacy exposure, dependency/cost, training,
  and schema burden without improving ordinary public-site media tasks.
- **Severity / likelihood:** **High / Likely if benchmarks are copied.**
- **Evidence / reasoning:** Enterprise comparators advertise AI, portals,
  annotations, stock, and approval suites, but the Phase 23 need and researched
  ministry journeys are bounded to safe reusable public still imagery.
- **Permanent prevention:** Complete launch contract for public still images;
  additive typed profile seam; measurable user/operational evidence before any
  new capability; explicit launch exclusions.

### O2 — Premature infrastructure

- **What could go wrong:** Per-Tenant buckets, database partitioning, external
  search, Realtime progress, cross-Tenant physical dedupe, arbitrary dynamic
  transforms, or a new transcoding service are built before load requires them.
- **Why it matters:** More moving parts create the very technical debt D27 is
  meant to prevent.
- **Severity / likelihood:** **Medium / Possible.**
- **Evidence / reasoning:** No measured Phase 23 requirement exceeds indexed
  Postgres search, one provider-neutral custody class, bounded polling/receipts,
  and the existing executor; the listed systems would add independent failure
  and migration surfaces before evidence of need.
- **Permanent prevention:** Shared private/public custody classes with opaque
  keys, Postgres full-text/GIN plus keyset pagination, polling or existing
  executor receipts, materialized bounded renditions, and scale thresholds.

## 7. UX/UI and user friction

**Material concern: Yes.**

### U1 — Generic document UI hides the real workflow

- **What could go wrong:** Staff cannot tell why an image is unavailable,
  whether processing survived, where it is used, what a version will change, or
  whether Trash breaks the website.
- **Why it matters:** Confusion produces abandonment, unsafe workarounds, bad
  metadata, support tickets, and false confidence.
- **Severity / likelihood:** **High / Certain in the current generic view.**
- **Evidence / reasoning:** Core's current Media list/edit routes are thin generic
  collection wrappers and expose none of the proposed processing, rights,
  Site-qualification, version-impact, usage-health, or recovery journeys.
- **Permanent prevention:** One Core-consistent Media workspace, persistent
  upload tray, quiet Needs attention queue, contextual Page picker, ordered
  inspector, cause-plus-next-action copy, and measurable cohort usability
  gates.

### U2 — Metadata burden harms occasional contributors

- **What could go wrong:** A missionary is confronted with a legal form,
  taxonomy, transform settings, hashes, and Site matrices before a photo can
  transfer.
- **Why it matters:** Staff defer or invent facts; field contributors on mobile
  fail the task.
- **Severity / likelihood:** **High / Likely.**
- **Evidence / reasoning:** The researched missionary persona contributes
  intermittently on a phone and weak network, while ethical-communication
  guidance requires contextual judgment that cannot truthfully be reduced to a
  dense one-time legal checkbox.
- **Permanent prevention:** Progressive source/safety questions, safe “Not
  sure,” defaults and suggestions, finish-later Needs details, ordinary titles,
  protected technical details, and review-by-exception.

### U3 — Accessibility and localization are bolted on

- **What could go wrong:** Global alt text is wrong for another use/locale; an
  image of text or complex chart ships without equivalent content; drag-only
  crop blocks users; progress overwhelms screen readers; mobile tables and hover
  menus are unusable.
- **Why it matters:** Staff cannot author compliant output, and public visitors
  receive incorrect alternatives.
- **Severity / likelihood:** **High / Likely without an explicit contract.**
- **Evidence / reasoning:** Core currently stores one global required `alt`;
  W3C's image guidance makes the alternative depend on use context, and WCAG
  2.2 requires a single-pointer alternative to dragging.
- **Permanent prevention:** Usage-local locale-lineage meaning; plain-language
  informative/decorative/functional choices plus one progressively disclosed
  image-of-text/complex-image branch; HTML-first text, exact text equivalent for
  an essential image of text, concise alt plus visible/linked full equivalent
  for complex information, and D1 blocking when required equivalents are
  incomplete; no fallback; single-pointer and keyboard crop controls; semantic
  list/table; focus/status/error rules; 320px, 400%, RTL/CJK, screen-reader,
  touch, and low-bandwidth gates.

## 8. Hidden coupling

**Material concern: Yes.**

### HC1 — D27 couples to D1, D9, D22, D23, and Phase 29 through mutable fields

- **What could go wrong:** Page JSON stores a provider URL or “current media”
  ID; a folder or global alt field becomes an accidental release/access rule;
  Phase 29 later requires a rewrite.
- **Why it matters:** A change in one phase silently changes another phase's
  behavior.
- **Severity / likelihood:** **Critical / Likely without explicit ports.**
- **Evidence / reasoning:** Ratified D1, D9, D22/D23, and the Phase 29 roadmap
  already assign release, package, locale/Site, and byte-custody truth to
  separate owners, while the current serializer still emits a provider-shaped
  mutable Media URL.
- **Permanent prevention:** Exact typed references and ownership table: D27
  logical identity, placement-owned context, Site qualification, Phase 29
  custody, and D1 generation pins. No raw provider URL/filename in product
  references.

### HC2 — Folders and storage layout become policy

- **What could go wrong:** Moving a folder changes permissions, delivery URL,
  retention, or Site eligibility; a migration cannot reorganize staff views
  without moving bytes.
- **Why it matters:** Organization is volatile; authority and identity must not
  be.
- **Severity / likelihood:** **High / Likely in a naive DAM.**
- **Evidence / reasoning:** D18 explicitly excludes Media and a second generic
  folder engine; Payload folders and provider paths are implementation
  hierarchies whose movement semantics do not match Tenant-wide Media authority.
- **Permanent prevention:** D27's same-Tenant, bounded, Media-only folders/tags
  are authority-free relationships distinct from D18; object keys are opaque;
  permissions, qualification, retention, and release remain typed independent
  facts. Folder removal rehomes relationships and never moves or deletes bytes.

### HC3 — Media review silently becomes the publication-safety ceiling

- **What could go wrong:** A D27 reviewer marks an image Allowed after Phase 10
  classified the depicted worker, ministry, identity, location, or relationship
  as restricted, or an ordinary media role starts a live restriction without
  the safeguarding authority that owns the cause.
- **Why it matters:** A convenient DAM verdict could bypass the sole-entry
  publication firewall or create conflicting incident owners in a physical-
  safety domain.
- **Severity / likelihood:** **Critical / Possible without explicit precedence.**
- **Evidence / reasoning:** Phase 23 D1 and Phase 10 already assign the current
  publication ceiling, restricted-ministry source reclassification,
  withdrawal, and adverse containment to Phase 10; D27 adds a new media review
  surface but does not inherit that authority merely by storing evidence.
- **Permanent prevention:** D27 owns only media-specific evidence, review, and
  qualification. Phase 10 always composes strictest-wins. Live media restriction
  requires `public_media.restrict`; restricted-person/ministry action also
  requires Phase 10 `security_clearance`. Commands re-prove exact current actor,
  Tenant, source ownership, and capability; ordinary staff can report a concern
  but cannot manufacture the adverse fact.

## 9. Failure modes

**Material concern: Yes.**

### FM1 — Non-atomic database and object operations

- **What could go wrong:** A byte exists without a row, a row says Ready without
  a byte, a prepared delivery copy exists when D1 activation fails, or delete
  succeeds on only one side. If the prepared copy has a raw public route,
  candidate failure can still leak it.
- **Why it matters:** Orphans cost money; missing bytes break output; premature
  state lies to staff.
- **Severity / likelihood:** **High / Likely over time.**
- **Evidence:** Supabase documents Storage metadata separately from object
  bytes and forbids direct metadata mutation; provider/network work cannot join
  a Postgres transaction.
- **Permanent prevention:** Idempotent saga, short DB transactions, deterministic
  keys, expected-state transitions, object HEAD/digest verification,
  reconciliation both directions, and visible indeterminate state. Every
  prepared delivery copy stays private and publicly unroutable; the same D1
  serving-head transaction creates the first Asym-owned release route.

### FM2 — Processor, scanner, executor, or provider outage

- **What could go wrong:** Uploads stall, scanner timeouts get treated as clean,
  retries exhaust, or existing ready media is unnecessarily disabled.
- **Why it matters:** An outage should not expose unsafe input or stop all
  editorial work.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Decode, scan, object storage, and durable execution
  are independent network/process boundaries; timeouts and retries are expected
  operating states, and no unavailable scanner can prove a file clean.
- **Permanent prevention:** Fail new candidates private; preserve qualified
  immutable media; bounded retry/dead-letter/reconcile; per-step receipts;
  calm staff copy; oldest-age alerts; documented manual recovery.

### FM3 — Withdrawal or expiry cannot erase the Internet

- **What could go wrong:** UI promises deletion after withdrawal, or an ordinary
  long-lived cache remains fresh after a known license/consent expiry, while
  browsers, search caches, social networks, or downloaded copies retain an
  image.
- **Why it matters:** False guarantees undermine safety response and trust.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Managed-CDN purge affects neither already downloaded
  files nor third-party/social caches, and long-lived browser caching for
  immutable ordinary media cannot be recalled synchronously.
- **Permanent prevention:** Explicit ordinary versus revocation-sensitive
  delivery classes; every time-bounded rights/consent item uses controlled
  delivery whose freshness, stale allowances, and delivery retention end before
  the earliest expiry after clock skew; expiry automatically denies current
  origin without user action or a new release; tested purge/takedown convergence,
  adverse block on future release/retrieval, and honest copy about already-
  downloaded copies.

### FM4 — Head cutover breaks media requested by an older cached Page

- **What could go wrong:** Generation G HTML is cached or already in flight,
  D1 advances to G+1, and an active-only media resolver immediately returns 404
  for G's immutable image. The visitor receives a mixed/broken generation even
  though both releases were valid.
- **Why it matters:** D1 promises one request pins one complete generation
  closure; release correctness cannot depend on every cache and browser
  advancing simultaneously.
- **Severity / likelihood:** **High / Likely over repeated releases.**
- **Evidence / reasoning:** ADR-0154 explicitly permits complete old cached
  responses to remain briefly and requires content-addressed assets never to
  mutate. Recovery retention, however, may include withdrawn material and is
  too broad to grant public access.
- **Permanent prevention:** Define a separate D1 delivery-retained admission for
  a replaced generation's still-safe exact routes, bounded by the maximum
  published response/cache lifetime plus skew. It is read-only, expires, and
  never follows from recovery retention. Current Phase 10/other adverse state
  denies origin immediately. Test in-flight and cached G requests across G+1,
  expiry, withdrawal, and recovery-only fixtures.

## 10. Data integrity risks

**Material concern: Yes.**

### DI1 — Historical metadata points to deleted or overwritten bytes

- **What could go wrong:** Payload version history claims revision 4 while its
  original/renditions were replaced by revision 5.
- **Why it matters:** Forward-successor recovery, audit, rights proof, and D1
  exactness become false.
- **Severity / likelihood:** **Critical / Likely with native re-upload.**
- **Evidence / reasoning:** Exact installed Payload source deletes the previous
  original and generated sizes during update while document-version metadata can
  remain, so metadata history is demonstrably not byte history.
- **Permanent prevention:** Append-only byte and rendition tables with digest,
  immutable key, source revision, processor/profile version, and no update-in-
  place; document history is not custody history.

### DI2 — Stale usage or qualification permits damage

- **What could go wrong:** An asset is declared unused, eligible, or safe to
  dispose while a schedule, package, locale, retained generation, or newly
  expired right disagrees.
- **Why it matters:** Live sites break or unsafe media releases.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** D27's complete use set spans drafts, schedules,
  packages, locales, active generations, and retained recovery inputs, while
  rights and safety evidence can expire or be withdrawn independently.
- **Permanent prevention:** Source-qualified rebuildable usage projection with
  watermark/health, reason-coded versioned qualification, release-time reproof,
  an automatic clock-driven adverse transition and origin denial at the earliest
  governing expiry, stale fail-closed for destructive/release decisions, and
  projection rebuild equivalence tests.

### DI3 — Duplicate content is auto-merged incorrectly

- **What could go wrong:** Identical bytes with different consent, source,
  withdrawal, title, retention, or rights become one semantic asset.
- **Why it matters:** A technical optimization corrupts legal and editorial
  meaning.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** A digest proves byte equality only; it cannot prove
  the same source, rights, consent, purpose, retention, credit, safety treatment,
  or intended organizational identity.
- **Permanent prevention:** Same-Tenant digest suggestion only; default reuse
  with explicit separate-item escape; no automatic semantic merge or cross-
  Tenant disclosure.

### DI4 — Undefined or changing retention policy races irreversible disposal

- **What could go wrong:** Phase 29 receives an owner reference that does not
  say which policy version or effective time was evaluated; a shorter policy,
  new hold, stronger rule, or source-owned erasure deadline lands while deletion
  is queued; conflicting keep/delete duties are silently resolved; or a Tenant
  with no policy defaults to immediate purge.
- **Why it matters:** Once every qualified copy and backup-eligible byte is
  destroyed, later audit cannot repair an ambiguous authorization.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** D27 claims public-media purpose-retention authority
  while Phase 29 is explicitly forbidden to invent policy. Payload Trash and
  storage providers supply mechanics, not the organization's retention meaning
  or a safe policy-change fence.
- **Permanent prevention:** One append-only, effective-dated D27 purpose-
  retention policy version with a small code-owned profile, minimum keep
  interval, approved source reference, actor, and reason. Missing policy means
  retain until explicit review; launch never auto-purges. Strictest current
  minimum-keep floor wins. A separately referenced source-owned required-
  disposition obligation carries owner/version/due time; conflict with a floor
  becomes a cause-owned legal/records exception, not an automatic winner.
  Disposition pins the evaluated version/facts and re-proves them at physical
  execution; stronger changes fence pending work and shorter changes require a
  fresh explicit authorization rather than deleting automatically.

## 11. Security and privacy risks

**Material concern: Yes.**

### SP1 — Original or candidate becomes publicly addressable

- **What could go wrong:** A token, direct URL, serializer, log, or public bucket
  exposes unscanned media, original names, EXIF/GPS, faces, children, protected
  workers, or location clues.
- **Why it matters:** Exposure may be irreversible and can create physical or
  reputational harm.
- **Severity / likelihood:** **Critical / Likely under the current public Blob
  posture.**
- **Evidence / reasoning:** Core's current adapter writes public Blob objects
  before durable document completion; missionary imagery can carry original
  names, GPS/EXIF, people, children, and location clues identified by the
  nonprofit-safety research.
- **Permanent prevention:** Private raw/candidate storage, no public originals,
  short app-owned authorized preview with `no-store`, re-encode and metadata-
  removal proof, restricted thumbnails/rows, redacted logs, private release
  preparation, and anonymous delivery only through an Asym-owned immutable route
  admitted by the exact D1 serving-head transaction. Raw provider URLs never
  enter serialized output.

### SP2 — Rights/consent data leaks through search or audit

- **What could go wrong:** Names, consent forms, vulnerable status, location,
  source details, or reviewer reasons enter full-text search, metrics, logs,
  exports, or ordinary Media access.
- **Why it matters:** A DAM can become a sensitive-person database even when
  public pixels are safe.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** The required rights/safety workflow necessarily
  handles consent, vulnerable-person, source, territory, location, reviewer, and
  evidence facts; ordinary full-text and telemetry systems have broader
  audiences than the protected review purpose.
- **Permanent prevention:** Minimize fields; protected evidence references;
  sensitivity classification; field/row capabilities; ordinary search indexes
  only permitted neutral terms; audit access/reveal; no content/tokens/URLs/
  names in telemetry; purpose-bound retention.

### SP3 — Active content or malicious decode

- **What could go wrong:** SVG/script, active PDF, parser exploit, malicious
  profile, or bomb attacks workers and visitors.
- **Why it matters:** File extension/MIME configuration is not content safety.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** OWASP's upload guidance explicitly treats extension,
  MIME, and signature checks as layers rather than proof and recommends safe
  parsing, size limits, scanning, and CDR where applicable; Sharp decodes
  untrusted structured input in a worker process.
- **Permanent prevention:** Raster-only launch; sandboxed/versioned decoder;
  signature and safe decode; deny animation/active formats; scan; CPU/memory/
  wall-time budgets; exact adversarial corpus; rapid processor upgrade path.

## 12. Scalability and performance risks

**Material concern: Yes.**

### SC1 — Original-heavy catalog and deep pagination

- **What could go wrong:** Grid loads originals, generic provider lists use
  OFFSET, search scans JSON, and RLS predicates lack indexes at 25,000+ assets.
- **Why it matters:** Media becomes slow, expensive, and unusable on field
  networks.
- **Severity / likelihood:** **High / Likely as libraries grow.**
- **Evidence / reasoning:** Original phone images are much larger than catalog
  thumbnails, OFFSET work grows with depth, JSON search cannot use the proposed
  typed/GIN access path, and RLS predicate indexes are required for predictable
  Supabase/Postgres plans.
- **Permanent prevention:** Purpose-sized thumbnails, `srcset`/dimensions,
  stored neutral search vector + GIN, typed filters, keyset pagination, indexes
  on Tenant/state/date/FKs/policy predicates, representative query-plan gates.

### SC2 — Upload/processing and rendition explosion

- **What could go wrong:** Bulk uploads buffer whole files, Sharp exhausts
  memory/CPU, decompression bombs pass, or arbitrary dimensions create
  unbounded storage and transform spend.
- **Why it matters:** One Tenant can degrade shared service or create an
  unbounded bill.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** The exact direct-upload path later materializes a
  complete `arrayBuffer`; image decode expands compressed bytes into pixels, and
  unconstrained profile dimensions multiply stored outputs and egress.
- **Permanent prevention:** Direct resumable intake, byte/pixel/frame limits,
  Tenant-keyed processing concurrency/backpressure, small materialized profile,
  no arbitrary transforms, storage/egress/rendition budgets, and cost alerts.

### SC3 — Reference projection hot path

- **What could go wrong:** Every detail view recursively scans Payload JSON,
  Pages, versions, packages, schedules, and generations.
- **Why it matters:** Used-in becomes slow and destructive checks time out.
- **Severity / likelihood:** **High / Likely without projection.**
- **Evidence / reasoning:** Payload Join covers declared relationships only,
  while the required use closure spans blocks, SEO/social, packages, schedules,
  candidates, current D1 output, and retained recovery inputs across independent
  sources.
- **Permanent prevention:** Incremental source-owned events into a rebuildable,
  atomically replaced usage projection; no database trigger parsing opaque CMS
  JSON; projection lag/health exposed.

## 13. Operational burden

**Material concern: Yes.**

### OP1 — Manual orphan, expiry, and rendition cleanup

- **What could go wrong:** Staff or developers periodically inspect buckets,
  spreadsheets, failed jobs, rights dates, and broken images by hand.
- **Why it matters:** Tribal knowledge and recurring cleanup do not scale and
  failures remain hidden until donors see them.
- **Severity / likelihood:** **High / Likely.**
- **Evidence / reasoning:** Object storage and Postgres cannot commit atomically,
  Supabase database backup excludes object bytes, and the current Media surface
  exposes no orphan, expiry, rendition, or public-fetch health workflow.
- **Permanent prevention:** Automated reconciliation, pre-expiry and Needs
  attention queues, bounded safe retry, checksum inventories, missing-copy/
  rendition checks, clear ownership/runbooks, and no provider console as normal
  product workflow.

### OP2 — Rights/safety workflow becomes a bottleneck

- **What could go wrong:** Every ordinary photo needs a specialist, or reviewers
  receive an undifferentiated queue with no batch-safe context.
- **Why it matters:** Staff bypass the process or publication stalls.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Missions organizations combine occasional field
  contributors with a smaller rights/safeguarding staff; requiring specialist
  review for every ordinary photo would route normal work through the scarce
  role instead of reserving it for uncertainty and risk.
- **Permanent prevention:** Policy defaults, one calm uncertainty question,
  progressively required evidence, review-by-exception, bounded common-field
  bulk work, pre-expiry lead time, and measured queue-age/SLA by Tenant policy.

## 14. Observability gaps

**Material concern: Yes.**

### OB1 — System says “Ready” while custody is unhealthy

- **What could go wrong:** A DB row lacks its byte, a rendition digest differs,
  a storage copy is missing, a scanner is stalled, or a public URL returns 404
  without alerting anyone.
- **Why it matters:** Staff and D1 make decisions from false health.
- **Severity / likelihood:** **High / Certain eventually without controls.**
- **Evidence / reasoning:** Supabase explicitly separates object bytes from
  Storage metadata, networked processors can time out independently, and the
  current tests verify serialized strings/configuration rather than synthetic
  anonymous byte fetch and digest health.
- **Permanent prevention:** Correlate opaque Tenant/asset/revision/byte/session/
  workflow IDs; object-vs-DB reconciliation; queue/scan/rendition/projection/
  public-fetch metrics; synthetic fetches; sustained actionable alerts.

### OB2 — Telemetry itself leaks sensitive data

- **What could go wrong:** Original filenames, signed URLs, tokens, EXIF/GPS,
  titles, consent details, or image content enter logs and metric labels.
- **Why it matters:** Operational systems often have broader access and longer
  retention than the DAM.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** The current provider flow handles original filenames
  and URLs, while the proposed workflow adds consent and safety reasons; logs,
  events, traces, and metric labels duplicate values unless a redaction contract
  prevents it.
- **Permanent prevention:** Opaque identifiers and reason codes only; structured
  redaction tests; bounded error envelopes; no sensitive values in workflow
  events, traces, analytics, metrics, or provider tags.

## 15. Dependency and integration risks

**Material concern: Yes.**

### DP1 — Payload, Vercel/Supabase, Sharp, scanner, or CDN semantics drift

- **What could go wrong:** Access bypass, cache, URL, transform, file format,
  callback, deletion, or SDK defaults change under D27.
- **Why it matters:** Product safety cannot be delegated to a vendor version.
- **Severity / likelihood:** **High / Likely over the product lifetime.**
- **Evidence / reasoning:** Core pins an internal Payload 4 commit, Payload's
  announced DAM surface is still evolving, and storage/transform/CDN SDKs expose
  provider-specific defaults for public access, overwrite, callbacks, cache, and
  deletion.
- **Permanent prevention:** Thin provider ports, exact pins, capability
  graduation tests, official-changelog review, canary qualification, unknown-
  version fail-closed, and emergency rollback/provider migration.

### DP2 — Provider features are mistaken for authority

- **What could go wrong:** Supabase dynamic transforms, signed URLs, Storage
  folders, Payload Join fields, or Vercel public Blob URLs become release,
  access, usage, or rendition truth.
- **Why it matters:** Each feature has materially narrower semantics than D27.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Supabase signed URLs are bearer transport, dynamic
  transforms do not record deterministic rendition identity, Payload Join sees
  only declared relations, folders organize, and public Blob URLs bypass the
  D1/source authority model.
- **Permanent prevention:** Asym IDs/profiles/projections remain canonical;
  providers implement bounded operations; signed URLs are short transport
  details; dynamic transforms may optimize preview only after qualification.

## 16. Migration and upgrade risks

**Material concern: Yes.**

### MU1 — Existing mutable Media cannot be relabeled as immutable

- **What could go wrong:** Legacy rows lack digest, preserved historical bytes,
  Site qualification, rights/safety evidence, contextual alt, complete uses, or
  reliable anonymous delivery.
- **Why it matters:** A flag flip would certify facts that were never proven.
- **Severity / likelihood:** **High / Certain for existing records.**
- **Evidence / reasoning:** The current collection has `versions:false`, one
  global alt, two fixed sizes, public/provider-shaped upload, and no rights,
  safety, Site qualification, digest custody, complete usage, or immutable
  release record.
- **Permanent prevention:** Inventory and classify every row/object/reference;
  privately copy/read existing bytes; compute digest; inspect/re-encode;
  generate qualified renditions; migrate global alt as an explicit per-use
  suggestion requiring review; prove references; quarantine exceptions; dual-
  read/compare before cutover; never auto-certify.

### MU2 — Provider migration rewrites product IDs or paths

- **What could go wrong:** Moving from Vercel to Supabase or another provider
  changes Page/D1 references, invalidates caches, or loses bytes.
- **Why it matters:** Vendor exit becomes a live-site rewrite.
- **Severity / likelihood:** **High / Possible over years.**
- **Evidence / reasoning:** Current Payload URLs and the fixed Vercel prefix are
  serialized/provider-shaped; without stable logical and rendition IDs, moving
  copies necessarily changes references and cache identities.
- **Permanent prevention:** Provider-neutral logical/byte/rendition IDs; copy +
  checksum + register secondary + switch preferred read + observe + later
  dispose; D1/product IDs remain unchanged; restore/migration rehearsal.

## 17. Other development hazards

**Material concern: Yes.**

### OD1 — Testing stops at configuration or happy-path UI

- **What could go wrong:** Unit tests prove MIME arrays and serialized strings
  while anonymous fetch, wrong-Tenant APIs, bombs, races, orphan recovery,
  forward recovery, screen readers, and restore fail in production.
- **Why it matters:** D27's highest risks live at seams, not in field config.
- **Severity / likelihood:** **Critical / Likely given current coverage.**
- **Evidence / reasoning:** Existing Media tests cover configuration and a
  serialized URL string, not real anonymous/denied fetch, immutable replacement,
  malicious content, object/DB failpoints, tenant isolation, assistive
  technology, or byte recovery.
- **Permanent prevention:** Public-seam integration/E2E, adversarial file corpus,
  race/fault injection, real object/DB recovery, query plans/load, accessibility
  matrix, and exact-pin provider graduation gates.

### OD2 — Unsafe migration rollout and code rollback

- **What could go wrong:** New UI writes immutable records while old routes
  still mutate files; old serializer emits legacy URLs; rollback cannot read
  new identity; background jobs from both paths race.
- **Why it matters:** A correct end state can still corrupt data during
  adoption.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** The current mutable writer/public serializer and the
  proposed immutable catalog have incompatible identity and update semantics;
  running both creates an unavoidable dual-writer/reference race.
- **Permanent prevention:** One-way compatibility bridge; prohibit legacy
  mutation before immutable adoption; D27-owned Tenant × environment complete-
  cohort cutover; shadow projection/dual-read comparison; idempotent backfill;
  pause/code-rollback points; no dual writers; exact migration manifest. D10's
  Site Presentation activation is not reused.

### OD3 — Unclear ownership during incident or disposal

- **What could go wrong:** Page editors, media managers, security reviewers,
  publishers, and operators each assume another role removed unsafe media or
  approved deletion.
- **Why it matters:** Delay or accidental disposal follows ambiguous ownership.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** D27 intentionally separates contribution, rights/
  safety review, Site use, D1 publication, Phase 29 custody operation, owner-
  policy disposition authorization, and physical execution; no single broad
  editor role can safely own every consequence.
- **Permanent prevention:** Named capabilities and cause owners; separation of
  contribution, review, publication, operation, and disposal; audit every
  consequential command; documented incident and restore runbooks.

## Ruthless synthesis

The original C-prime direction is correct only after replacing “Payload Media
library” thinking with an exact public-ministry DAM contract. The best path is
not to build more features; it is to make the small set of launch behaviors
provably safe, recoverable, understandable, and extensible.

### Must be fixed in the contract before implementation

1. **Freeze the authority split.** D27 owns logical catalog identity, media-
   specific evidence/review, current Site qualification, and bounded purpose-
   retention policy; placements own contextual locale/accessibility/crop; Phase
   10 owns the publication-safety ceiling and adverse cause; Phase 29 owns bytes/
   renditions/quarantine/disposition mechanics; D1 alone activates an exact
   generation; Payload/storage are adapters.
2. **Freeze the launch kind.** One `public-still-image` profile with certified
   JPEG/PNG/WebP/AVIF and HEIC/HEIF normalization; no animation, SVG, arbitrary
   file, PDF, uploaded video/audio, URL import, or user-defined transform.
3. **Make immutability structural.** Stable asset + append-only revision +
   append-only rendition/profile version + content digest + new path. Native
   Payload re-upload and in-place provider overwrite are not product actions.
4. **Make intake private and bounded.** Exact Tenant/session/profile/size/
   expiry/idempotency grant; safe content inspection/re-encoding; no public
   original/name/metadata; deterministic failure.
5. **Make Tenant safety structural.** Operational Tenant UUID, composite FKs,
   RLS/indexes, protected custody schema, server authorization, and no cross-
   Tenant enumeration/dedupe disclosure.
6. **Make release/withdrawal/expiry exact.** Reason-coded current Site qualification,
   D1 reproof and pin, private publicly-unroutable preparation, atomic first
   reachability through an Asym release route, immutable ordinary delivery,
   distinct bounded delivery retention for cached-generation coherence,
   recovery retention that grants no public read, Phase 10 strictest-wins,
   controlled revocation class, automatic active-route denial at the earliest
   governing expiry, cache/stale/delivery retention capped before that expiry,
   and live-unchanged on candidate failure.
7. **Make Used in and Trash trustworthy.** Complete rebuildable projection with
   health; no “unused” when stale; non-cascading Trash/restore; disposition only
   after reference/retention/hold/backup proof. Retention uses one append-only,
   effective-dated bounded policy, retain-until-explicit-review by default, no
   auto-purge, explicit keep-versus-required-disposition conflict handling, and
   execution-time reproof.
8. **Make durability real.** Idempotent existing-executor saga, reconciliation,
   encrypted independent object backup/checksum manifest, RPO/RTO, disposition
   tombstones/restore suppression, and least-privilege restore exercise.
9. **Make the UX measurable.** Specialized Core-consistent workspace and Page
   picker, progressive rights/safety, resilient mobile upload, contextual alt/
   crop, HTML-first image-of-text guidance, bounded complex-image equivalents,
   exact impact, recovery copy, cohort usability and accessibility gates.
10. **Make observability/cost launch criteria.** Custody mismatch, queue age,
    scan/rendition/projection health, public fetch, takedown, storage/egress, and
    redaction must be visible and budgeted.

### Must be proven before any Tenant activation

1. Current legacy inventory and migration manifest account for every Media row,
   provider object, Page/locale/SEO/package reference, and exception.
2. Private intake, malicious/oversize/unsupported corpus, metadata removal, and
   certified output digests pass.
3. Wrong-Tenant/API/service-worker attempts fail at command, RLS, relationship,
   object, and response-enumeration layers.
4. Object/DB/workflow crash points reconcile idempotently.
5. New versions, recrops, D1 candidate failure, forward successor recovery,
   Trash, and restore preserve every exact active/delivery-retained/recovery-
   retained byte.
6. Anonymous released fetch succeeds only through a route admitted by the
   current active generation or a still-safe, unexpired delivery-retained
   generation; pre-activation, recovery-only, expired, unqualified, original,
   raw-provider, and restricted fetches fail. Cached/in-flight G remains
   coherent across G+1, while current Phase 10/adverse withdrawal blocks origin
   immediately and cache/takedown behavior matches the delivery class. A known
   time-bounded right/consent uses controlled delivery whose freshness, stale
   allowance, and delivery retention stop before expiry; the expiry itself
   denies active and delivery-retained origin without a new release or human
   action.
7. DB-only restore exposes missing objects; independent byte restore by digest
   succeeds inside the declared RPO/RTO; disposition history prevents erased
   bytes from becoming selectable or deliverable.
8. 25,000-item search/pagination, 50-item bulk upload, constrained mobile,
   processor concurrency, and cost budgets pass.
9. The full keyboard/screen-reader/touch/zoom/RTL/long-text matrix and cohort
   comprehension targets pass, including correct ordinary/decorative/
   functional/image-of-text/complex-image classification, exact text
   equivalents, visible or linked full equivalents, and D1 blocking when a
   required locale-lineage equivalent is incomplete.
10. Same-Tenant authorized restriction, missing/insufficient Phase 10
    clearance, wrong-Tenant access, stale/revoked capability, and current Phase
    10 denial all behave exactly and without enumeration. Missing retention
    policy, effective-time/version change, strengthening, shortening, required-
    disposition-versus-hold conflict, and a policy/hold change racing
    disposition fail safely without auto-purge.
11. D27's own Tenant × environment cutover admits only a complete migration
    cohort with every row/byte/reference/retained route/exception accounted for;
    compatibility readers are proven and old mutable writers are disabled in the
    same cutover. D10's Site Presentation activation is not widened.

### Address soon after stable launch evidence

- Import/export a small interoperable IPTC rights/credit/context subset while
  keeping sensitive fields protected; do not copy the complete metadata schema.
- Preserve C2PA assertions when present and record validation result/provenance
  status without claiming authenticity from presence alone.
- Tune rights-expiry lead times, batch-safe review, and search ranking from
  observed nonprofit staff behavior; evaluate a separate Tenant-wide Media
  saved-view contract only if transient filters and built-ins prove insufficient.
- Evaluate a separately certified public-document profile only when the Page
  catalog has a real downloadable-resource use case and accessible-PDF/HTML-
  alternative, malware/CDR, preview, and disposition contracts are funded.

Sources:

- [IPTC Photo Metadata 2025.1](https://www.iptc.org/std/photometadata/specification/IPTC-PhotoMetadata-2025.1.html)
- [C2PA technical specification](https://spec.c2pa.org/specifications/)

### Monitor; do not prebuild

- external search versus Postgres FTS;
- Realtime status transport versus ordinary polling;
- database partitioning;
- arbitrary/on-demand transform providers;
- cross-Tenant physical dedupe;
- AI tagging, visual similarity, faces, or background removal;
- public shares/brand portals and creative annotation/approval;
- uploaded audio/video transcoding and transcript generation; and
- per-Tenant bucket proliferation.

Each requires measured demand, privacy/cost evidence, and a new bounded
decision. The D27 model already provides an additive kind/profile/provider seam;
implementing them now would be overengineering.

## Go/no-go conclusion

**Proceed with the hardened C-prime-R formulation.** Do not proceed with an
incremental enhancement of the current versionless Payload Media collection.
The current collection and public Blob configuration are migration inputs, not
an authority model.

The permanent solution is the smallest complete one: one Tenant-wide catalog,
one public-still-image launch profile, immutable revisions and qualified
renditions, current Site-use proof beneath Phase 10's safety ceiling,
usage-local placement semantics, exact D1 pins plus bounded delivery retention,
private recovery retention, append-only fail-closed purpose-retention policy,
private custody, reference-aware recovery, and a calm specialized staff
experience. Everything else either belongs to Phase 10, Phase 29, another
ratified Phase 23 owner, or a later evidence-triggered kind/profile decision.
