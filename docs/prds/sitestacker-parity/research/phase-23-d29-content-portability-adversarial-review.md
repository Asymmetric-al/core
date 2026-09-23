# Phase 23 D29 Content Portability Ruthless Adversarial Review

**Status:** Complete hardening review supporting the founder-ratified Phase 23
D29 B-prime-R decision. Ratification authorizes no implementation, schema, RLS,
migration, dependency/provider adoption, issue, deployment, D1 activation, or
release.

**Date:** 2026-08-24

**Ratified:** 2026-08-24

## Reviewed proposition

> **Option B-prime — Governed staff exports with privileged, staged imports.**

The review tested the option against:

- ratified D1-D28 and Phase 3/12/29/30 owner boundaries;
- current Core Web Studio, API, CSV, audit, capability, workflow, and Payload
  seams;
- exact Core-pin Payload import/export source behavior;
- current Payload, Supabase, PostgreSQL, Inngest, OWASP, and W3C guidance;
- current Contentful, Sanity, WordPress, Webflow, HubSpot, Salesforce, and
  embedded-importer patterns; and
- realistic use by nonprofit communications staff, small-organization
  administrators, multilingual editors, migration specialists, ministry
  leaders, and media/safeguarding reviewers.

Supporting evidence:

- [D29 authority decision brief](./phase-23-d29-content-portability-authority-decision-brief.md)
- [Primary-source and repository research](./phase-23-d29-content-portability-primary-source-research.md)
- [Staff UX benchmark](./phase-23-d29-content-portability-ux-benchmark.md)

## Rating method

Severity describes plausible impact before the permanent prevention:

- **Critical:** cross-Tenant/private disclosure, unauthorized bulk mutation,
  public release bypass, destructive overwrite, or broad security compromise.
- **High:** materially incomplete/corrupt migration, misleading success,
  unavailable content, sustained operational failure, or costly recovery.
- **Medium:** bounded staff confusion, support burden, delayed onboarding, or
  repairable degradation.
- **Low:** minor inconvenience with an obvious safe recovery.

Likelihood is **Certain**, **Likely**, **Possible**, or **Unlikely** under a
naive plugin-first implementation or foreseeable extension. All 17 categories
contain a material concern. That is proportionate: bulk portability crosses
authorization, files, content semantics, locale, media, durable execution, and
future migration boundaries. The hardened solution deliberately keeps the
product surface and authorities small.

## 1. Brittleness

**Material concern: Yes.**

### B1 — Source adapters silently drift

- **What could go wrong:** A source CMS changes its export version, custom
  plugin fields, locale encoding, rich-text node shape, or attachment behavior.
  A permissive parser accepts the artifact and quietly misclassifies or omits
  content.
- **Why it matters:** The migration can appear successful while Pages, links,
  authors, translations, media, or forms are incomplete. Staff discover loss
  only after cutover.
- **Severity / likelihood:** **High / Likely over time.**
- **Evidence / reasoning:** Contentful and WordPress document explicit export
  exclusions; current source products evolve independently; generic Payload
  parsing validates syntax rather than source semantic compatibility.
- **Permanent prevention:** Certify exact adapter/source-version ranges, require
  a versioned source checklist and golden fixtures, digest the adapter/profile
  into the plan, and route unknown/custom versions through **Other CMS or
  custom site** qualification. Unknown semantics fail closed rather than
  best-effort committing.

### B2 — Moving source or destination invalidates a previously correct plan

- **What could go wrong:** Staff edits target Pages, permissions change, a
  block/profile version advances, a path is claimed, or the source export is
  replaced after the impact screen was reviewed.
- **Why it matters:** The approved explanation no longer matches the mutation;
  an import can overwrite work or create a different result than staff saw.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** CMS migrations are multi-step and often span
  sessions. Read Committed and client-side previews do not freeze a coherent
  destination. D12 already treats expected revision as authority.
- **Permanent prevention:** Seal artifact/mapping/target/catalog/schema/
  permission/expected-revision facts into an immutable plan digest. Re-prove
  them at commit and before affected writes; mark the plan stale and require
  **Check import again** on any relevant drift.

## 2. Technical debt

**Material concern: Yes.**

### T1 — Raw Payload plugin becomes the product architecture

- **What could go wrong:** Product records and UI adopt provider collections,
  mode enums, match fields, job status, hooks, and row errors. Every Payload
  upgrade then becomes a product migration, and D1/D12/D22 semantics are spread
  across hooks.
- **Why it matters:** Core uses an internal Payload 4 pin. Provider-coupled
  truth is expensive to test, migrate, explain, and replace.
- **Severity / likelihood:** **High / Likely without an explicit adapter.**
- **Evidence / reasoning:** The plugin supplies generic collection-shaped
  behavior, while exact source inspection exposes partial and locale-sequential
  semantics. Core's architecture already keeps Payload behind Web Studio and
  public/runtime boundaries.
- **Permanent prevention:** One versioned neutral package/candidate/plan/receipt
  contract, Asym-owned UI and commands, and exact-pin adapter conformance tests.
  Raw plugin routes and UI remain inaccessible; plugin hooks are adapter
  implementation, never domain authority.

### T2 — Phase 23 duplicates the Phase 30 migration workbench

- **What could go wrong:** D29 builds its own upload sessions, parser framework,
  mapping grid, validation DSL, retry runner, and undo engine. Phase 30 later
  builds a second one for CRM/files/finance.
- **Why it matters:** Two engines drift on security, accessibility, recovery,
  and source qualification; every improvement must be duplicated.
- **Severity / likelihood:** **High / Likely if “complete import” is interpreted
  as Phase 23 implementation ownership.**
- **Evidence / reasoning:** The Phase 30 roadmap already assigns generic upload,
  mapping, staged rows, dry-run grid, resumable execution, and safe undo while
  target phases retain typed commands.
- **Permanent prevention:** Lock the boundary now: D29 owns content package,
  content-semantic adapter/validator, and private-revision command; Phase 30
  owns reusable workbench mechanics. Build one vertical certified adapter only
  after those seams exist.

## 3. Edge cases

**Material concern: Yes.**

### E1 — Relationships, links, hierarchy, and locale form a nontrivial graph

- **What could go wrong:** Cycles, missing targets, parent/child order, multiple
  links to one source item, path collisions, source-relative URLs, duplicate
  IDs, or a localized follow-up failure produce broken or half-connected
  Pages.
- **Why it matters:** A row-oriented importer can create syntactically valid
  but semantically unusable private content. Later release review becomes a
  manual archaeology project.
- **Severity / likelihood:** **High / Likely in real websites.**
- **Evidence / reasoning:** Source platforms preserve relationships differently;
  Payload's exact processor performs separate locale writes; Phase 23 has
  explicit path, locale, block, navigation, and relationship authorities.
- **Permanent prevention:** Full-graph semantic no-write validation, stable
  source IDs, deterministic two-pass writes, explicit unresolved-link
  dispositions, per-lineage atomicity, D2/D3 path planning, and post-run graph/
  count reconciliation.

### E2 — Long-running user and artifact lifecycle changes

- **What could go wrong:** A tab closes, a session expires, an employee loses
  access, an upload expires, a source file is replaced, a destination Site is
  archived, or a run is submitted twice.
- **Why it matters:** Users may lose work, operators may retry blindly, or a
  stale capability may continue changing data.
- **Severity / likelihood:** **High / Likely across a migration program.**
- **Evidence / reasoning:** Real nonprofit migrations span days and unreliable
  networks; Supabase signed URLs outlive Auth changes until expiry; Inngest
  transport dedupe is time-bounded.
- **Permanent prevention:** Persist every setup/run state; resumable immutable
  upload identity; short-lived authenticated artifacts; permanent semantic
  idempotency; current authorization at download/commit/next mutation; exact
  stopped/paused/reconciling states; and safe resume from product receipts.

## 4. Footguns

**Material concern: Yes.**

### F1 — Generic create/update/upsert and publish defaults

- **What could go wrong:** A staff member selects upsert or a match field that
  resembles a Page, or the exact plugin's fallback version status remains
  published. Existing content is overwritten or imported content becomes
  publicly eligible.
- **Why it matters:** One understandable mistake can cause destructive bulk
  change or bypass the entire D1 review/release model.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Payload exposes generic modes and exact-pin source
  defaults absent version status to `published`. Similar product import UIs
  document blank/overwrite hazards.
- **Permanent prevention:** No raw modes or arbitrary match fields in UI/API.
  External imports create new private identities; exact authorized Asym lineage
  may append a private successor. The only CTA is **Create {count} private
  drafts** through owner commands, with tests that prove zero D1/public effects.

### F2 — Users misunderstand artifacts and blanks

- **What could go wrong:** A user edits the review CSV and attempts to reimport
  it, treats a package as a full Site backup, or expects blank cells to preserve
  values when an importer interprets them as clearing.
- **Why it matters:** Trust is lost and data can be omitted or cleared without
  the user understanding why.
- **Severity / likelihood:** **High / Likely without purpose-first copy.**
- **Evidence / reasoning:** Contentful/WordPress exports explicitly omit major
  platform state; Shopify documents spreadsheet/overwrite hazards; CSV cannot
  preserve every typed distinction safely.
- **Permanent prevention:** Two named export purposes; CSV explicitly
  non-reimportable; typed package manifest with absent/null/blank semantics;
  inclusion/exclusion summary before creation; compatibility check at
  destination; and no **backup** claim.

## 5. Tenant safety

**Material concern: Yes.**

### TS1 — Cross-Tenant source, object, or record mix-up

- **What could go wrong:** A crafted file supplies another Tenant/Site ID, a
  worker uses service-role access without a Tenant predicate, a predictable
  object path is guessed, or a stored export is readable through a generic
  collection route.
- **Why it matters:** Private drafts, source exports, ministry strategy,
  personal data, or public-content control can leak or mutate across
  organizations.
- **Severity / likelihood:** **Critical / Possible without layered controls.**
- **Evidence / reasoning:** Supabase service roles bypass RLS; Payload warns
  that saved export collections need explicit access; hidden admin navigation
  does not remove routes.
- **Permanent prevention:** Server-derived exact scope; Tenant/Site columns and
  compound uniqueness on every run/plan/item/artifact receipt; RLS plus grants;
  opaque immutable object keys; storage policies; current PDP checks; trusted
  worker envelopes; scope predicates inside every service query; cross-Tenant
  property tests; and no raw plugin routes.

### TS2 — Correct Tenant, wrong Site or locale

- **What could go wrong:** A staff member legitimately belongs to multiple
  Sites/locales and commits to the wrong one, or a default destination is
  inferred from browser/file context.
- **Why it matters:** Content does not leak across legal tenants but still
  appears in the wrong ministry brand, domain, language, or editorial queue.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Multi-Site staff access is expected, and migration
  artifacts commonly contain source environment/site labels that are not Asym
  authority.
- **Permanent prevention:** Eligible server-derived choices; visible exact
  Tenant/Site/domain/locale scope on every step; no hidden defaults; plan-frozen
  target; consequence review; commit-time proof; and Site-keyed concurrency.

## 6. Overengineering

**Material concern: Yes.**

### O1 — Universal transformation language

- **What could go wrong:** To support “every CMS,” D29 adds tenant scripts,
  arbitrary expression mappings, schema designers, plugin marketplaces, or a
  general ETL graph.
- **Why it matters:** The attack surface, support matrix, testing burden, and
  upgrade cost grow dramatically while occasional staff face a developer tool.
- **Severity / likelihood:** **High / Possible under flexibility pressure.**
- **Evidence / reasoning:** Source semantics are product-specific; the roadmap
  already assigns a bounded generic workbench to Phase 30; no evidence requires
  tenant-authored code at launch.
- **Permanent prevention:** Small source-neutral vocabulary, additive certified
  adapters, deterministic mapping presets, explicit qualification for unknown
  sources, and owner-domain commands. Reserve scripts/custom transforms until
  a proved recurring need and separate security decision.

### O2 — Enterprise ceremony and giant lifecycle state machine

- **What could go wrong:** Every export/import requires multiple approvals,
  tickets, typed confirmations, and dozens of provider-mirroring statuses even
  for a two-person ministry.
- **Why it matters:** Staff work moves offline, admins share accounts, and the
  product becomes slower without materially improving safety.
- **Severity / likelihood:** **Medium / Possible.**
- **Evidence / reasoning:** The real safety boundary is per-action capability,
  sealed plan, consequence copy, and recoverability—not organization size or
  role name.
- **Permanent prevention:** Independent capabilities that one trusted person may
  hold; one explicit plan acknowledgement; derived staff states from a small
  process/fact model; technical detail on demand; no mandatory two-person rule
  at launch.

## 7. UX/UI and user friction

**Material concern: Yes.**

### UX1 — Migration feels mysterious or implies publication

- **What could go wrong:** Screens say **Import**, **Run**, **Success**, or
  **Completed with warnings** without exact scope, impact, or next action.
  Staff assume the Site is live, panic at normal processing, or do not review
  imported drafts.
- **Why it matters:** Trust and task completion collapse precisely during a
  high-stakes onboarding moment.
- **Severity / likelihood:** **High / Likely in a provider-shaped UI.**
- **Evidence / reasoning:** Payload uses generic data-operation vocabulary;
  comparator products expose technical modes; nonprofit staff use the tool
  episodically and cannot rely on tribal knowledge.
- **Permanent prevention:** One **Content portability** workspace; five-answer
  invariant; persistent exact scope and **Live impact: None — private drafts
  only**; consequence-named actions; purpose-first exports; exact partial
  counts; explicit next step; and completion that repeats **Nothing was
  published**.

### UX2 — Mapping and issue resolution overwhelm occasional staff

- **What could go wrong:** Hundreds of rows, raw field paths, yellow warning
  badges, horizontal grids, drag-only mapping, first-error-only validation, or
  noisy live announcements make the work inaccessible and error-prone.
- **Why it matters:** Staff either abandon onboarding or approve unclear
  mappings to make the warnings disappear.
- **Severity / likelihood:** **High / Likely for real sites.**
- **Evidence / reasoning:** Embedded-importer products use mapping/validation
  grids but can still surface expert complexity; current Core form primitives
  handle field descriptions but lack a complete linked bulk-error summary.
- **Permanent prevention:** Collapse exact matches; show unresolved work first;
  samples and semantic labels; four precise issue classes; safe bulk repair;
  persistent linked summary; responsive table-to-card rendering; full keyboard/
  screen-reader support; factual milestone announcements; save/resume; and
  moderated usability gates.

## 8. Hidden coupling

**Material concern: Yes.**

### HC1 — Package coupled to Payload/storage/Next implementation

- **What could go wrong:** The package contains Payload IDs/documents, Lexical
  internals without version profiles, storage keys/signed URLs, Next route
  facts, or provider job state.
- **Why it matters:** A CMS, editor, storage, or framework upgrade makes old
  exports unreadable and imports unsafe.
- **Severity / likelihood:** **High / Likely over the product lifetime.**
- **Evidence / reasoning:** Core already uses an internal Payload pin and
  versioned semantic catalogs; D27 explicitly rejects provider URLs as media
  identity.
- **Permanent prevention:** Source-neutral versioned manifest/IR, stable
  identities, semantic family/block/rich-text versions, typed relations,
  D27 references, and adapter-only provider mappings. Golden readers preserve
  old versions; unknown majors fail closed.

### HC2 — D29 quietly owns adjacent domains

- **What could go wrong:** Import code decides paths, redirects, navigation,
  users, forms, media qualification, schedules, SEO canonicals, public search,
  or publication because those facts occur in source data.
- **Why it matters:** Owner invariants split across phases and fixes in the
  owning system no longer protect migration.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** The source prompt lists many cross-domain facts;
  D1-D28 intentionally assign each one a narrow authority; Phase 30 explicitly
  requires owner-domain adapters.
- **Permanent prevention:** Per-fact admission disposition and typed owner
  adapter. D29 may preserve/propose evidence, but only owner commands can
  validate/change their domain. Unsupported facts remain explicit release work
  or exclusions.

## 9. Failure modes

**Material concern: Yes.**

### FM1 — Crash or lost acknowledgement after partial writes

- **What could go wrong:** A process dies or network response is lost after
  some drafts are committed. Retrying starts a new run or repeats mutations.
- **Why it matters:** Duplicates, uncertain state, and destructive manual
  cleanup follow; staff cannot trust progress.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Exact Payload batches continue across item failures;
  distributed workers cannot make network acknowledgement atomic with a
  database commit; Inngest retries require idempotent effects.
- **Permanent prevention:** Product run/item receipts committed with owner
  mutations, permanent semantic idempotency, deterministic chunks,
  reconciliation before retry, **Verifying what completed** state, and resume
  from verified checkpoint rather than new-run execution.

### FM2 — Missing worker, poison item, cleanup failure, or revocation

- **What could go wrong:** Work remains queued forever, repeatedly fails on one
  item, consumes retries, leaks quarantined files, or exposes an export after
  authorization changes.
- **Why it matters:** Onboarding stalls invisibly, costs accumulate, and private
  artifacts outlive their purpose.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Payload documents that queued jobs stay pending
  without a runner; every provider can dead-letter; signed URLs persist until
  expiry.
- **Permanent prevention:** One deployed/health-checked executor; queue-age and
  oldest-run alerts; bounded retries/dead letters; item isolation; operator
  repair actions; current download authorization; short retention; orphan
  scanner; and durable deletion receipts.

## 10. Data integrity risks

**Material concern: Yes.**

### DI1 — Duplicate, stale, or half-localized content

- **What could go wrong:** A package is submitted twice, a title/slug match
  updates the wrong Page, base locale succeeds while another fails, or a
  relationship points to a missing/old identity.
- **Why it matters:** Editors see duplicates or inconsistent language variants;
  reporting and later D1 release may use broken relationships.
- **Severity / likelihood:** **High / Likely without stable identity and
  reconciliation.**
- **Evidence / reasoning:** Exact plugin code separates locale updates and
  continues failures; external systems use non-authoritative display values;
  retries are normal.
- **Permanent prevention:** Exact source/Asym stable identities; duplicate-run
  digest; no fuzzy upsert; DB uniqueness; two-pass relations; per-locale
  dispositions; owner-command expected revisions; and reconciled control totals
  before completion.

### DI2 — Export is internally inconsistent

- **What could go wrong:** Offset pagination sees edits/inserts between pages,
  relations resolve from a later state, or authorization changes during a long
  export, producing a package that never existed coherently.
- **Why it matters:** Reimport cannot reproduce or validate the source and can
  include content not in the reviewed count.
- **Severity / likelihood:** **High / Possible on active Sites.**
- **Evidence / reasoning:** PostgreSQL Read Committed allows successive reads to
  observe different committed state; plugin export supports paging/filtering;
  client table export sees only presentation state.
- **Permanent prevention:** Brief coherent snapshot/manifest sealing of exact
  authorized revision IDs and relations, digest/count control totals, immutable
  render inputs, and final verification. Do not hold a giant serialization
  transaction open.

## 11. Security and privacy risks

**Material concern: Yes.**

### SP1 — Malicious files, archives, active content, or remote URLs

- **What could go wrong:** An attacker uploads a polyglot, path-traversal ZIP,
  decompression bomb, macro/script, malformed parser payload, malware, or URL
  that reaches private networks/metadata services.
- **Why it matters:** This can compromise workers, exhaust resources, expose
  infrastructure, or persist dangerous content.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** OWASP treats file upload as a compound attack
  surface; CMS exports commonly contain archives, HTML, embeds, and remote
  media; MIME headers alone are untrusted.
- **Permanent prevention:** Private quarantine; generated names; extension/MIME/
  signature validation; compressed/expanded/entry/depth/time limits; no active
  execution; malware/content inspection; SSRF-safe HTTPS retrieval; network/
  redirect/byte/type controls; least-privilege workers; and cleanup receipts.

### SP2 — Data exfiltration through export or spreadsheet behavior

- **What could go wrong:** A generic field selector exports credentials,
  private evidence, provider IDs, or another party's fields; a donor-controlled
  title executes as a spreadsheet formula; an artifact URL leaks through logs.
- **Why it matters:** Content exports are a high-bandwidth egress surface and
  often leave the platform.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Payload permits field selection and saved files;
  OWASP documents CSV formula injection; signed URLs are bearer artifacts until
  expiry.
- **Permanent prevention:** Phase 3 field allowlist/projection; D29 semantic
  allowlist; shared `csvSafeCell`; no secrets/signed URLs/provider internals;
  private authenticated artifacts; short retention; reauthorization and audit
  per download; and redacted events/logs.

## 12. Scalability and performance risks

**Material concern: Yes.**

### SC1 — Whole-file parsing and unlimited operations exhaust resources

- **What could go wrong:** Large JSON/CSV or expanded archives consume memory,
  long DB transactions exhaust the pool, synchronous requests time out, or one
  Tenant monopolizes workers.
- **Why it matters:** A migration can degrade all tenants or create an
  unpredictable provider bill.
- **Severity / likelihood:** **High / Likely as adoption grows.**
- **Evidence / reasoning:** Exact Payload preview parses before slicing; plugin
  limits default unlimited; OWASP requires resource caps; serverless/runtime
  limits are finite.
- **Permanent prevention:** Pre-admission byte/archive/row/node budgets; staged
  bounded parsing; short snapshot sealing; deterministic chunks; Tenant/Site
  concurrency; DB backpressure; resumable work; explicit rejection before
  commit; and load tests at maximum supported size.

### SC2 — Per-row orchestration explodes state and cost

- **What could go wrong:** A 50,000-item import emits 50,000 events/steps,
  exceeds step/run-state limits, produces noisy logs, and multiplies billing.
- **Why it matters:** The technically durable design becomes financially and
  operationally fragile.
- **Severity / likelihood:** **High / Likely under naive durable-function use.**
- **Evidence / reasoning:** Inngest documents step count, state-size, event,
  concurrency, and pricing boundaries.
- **Permanent prevention:** One run event with safe IDs, bounded chunk steps,
  product-side item ledger, small scalar step results, measured step budget,
  Tenant-keyed concurrency, queue-preserving throttle/backpressure, and no
  discarding rate limit.

## 13. Operational burden

**Material concern: Yes.**

### OB1 — Every migration becomes bespoke developer work

- **What could go wrong:** Source knowledge lives in Slack, one-off scripts,
  manual SQL, local folders, and a specialist's memory. Support cannot explain
  results or repeat a migration.
- **Why it matters:** Onboarding remains SiteStacker's moat, staff confidence
  suffers, and safe improvements do not compound.
- **Severity / likelihood:** **High / Likely without certified adapters.**
- **Evidence / reasoning:** Source CMS exports have specific exclusions and
  version behavior; operations-only migrations naturally accrete tribal
  knowledge.
- **Permanent prevention:** Versioned adapter catalog, source checklists, golden
  fixtures, qualification record, saved mappings in the Phase 30 contract,
  immutable plans/results, explicit owners/runbooks, and self-serve staff
  visibility without self-serve mutation.

### OB2 — Manual stuck-run and artifact cleanup

- **What could go wrong:** Operators poll queues, guess whether writes landed,
  delete files manually, or rerun jobs to clear a status.
- **Why it matters:** Human remediation becomes the normal execution path and
  increases corruption risk.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Provider queues and distributed writes can fail in
  ordinary ways; current generic CMS audit/logging is not a complete durable
  run ledger.
- **Permanent prevention:** Product-led recovery scanner, leases/claims,
  heartbeats, dead letters, automatic reconciliation, bounded safe repair,
  artifact lifecycle scanner, admin run detail with exact next action, and
  tested runbooks that never require raw table edits.

## 14. Observability gaps

**Material concern: Yes.**

### OG1 — Provider status/logs obscure user-impacting truth

- **What could go wrong:** A provider says completed while locale writes failed,
  a source row was skipped, a result was never verified, or the artifact cannot
  be downloaded.
- **Why it matters:** Staff receive false reassurance and operators cannot
  correlate a complaint with exact planned/destination facts.
- **Severity / likelihood:** **High / Likely without product receipts.**
- **Evidence / reasoning:** Exact Payload behavior can continue per-row/locale
  failure; provider job state does not know D1/D12/D22/D27 outcomes.
- **Permanent prevention:** Product run/item ledger; stable issue codes; exact
  processed/succeeded/blocked/excluded/unknown counts; source-plan-target
  correlation IDs; final reconciler; safe staff summary; and provider details
  only as linked operator evidence.

### OG2 — Lag, fairness, cost, and cleanup are invisible

- **What could go wrong:** Queue age grows, one Tenant monopolizes work, retries
  loop, storage orphans accumulate, or step/storage/egress costs spike without
  an alert.
- **Why it matters:** The system appears healthy until onboarding stalls or the
  bill jumps.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Durable providers meter runs/steps and have finite
  concurrency/history; migration artifacts are large and retained separately
  from row state.
- **Permanent prevention:** Dashboards/alerts for oldest queued/running run,
  stage age, throughput, retry/dead-letter/unknown-ack counts, Tenant fairness,
  DB saturation, artifact bytes/age/orphans, digest/count mismatches, and
  provider usage per run/Tenant; named SLOs and owner/runbook links.

## 15. Dependency and integration risks

**Material concern: Yes.**

### DR1 — Internal Payload/plugin compatibility changes

- **What could go wrong:** An internal Payload update changes hooks, collection
  shape, preview, status defaults, locale behavior, or peer requirements. D29
  breaks or changes semantics silently.
- **Why it matters:** The repository is intentionally ahead of the stable
  major-version line; undocumented implementation behavior has a higher drift
  risk.
- **Severity / likelihood:** **High / Likely over upgrades.**
- **Evidence / reasoning:** The exact internal plugin exists, while public
  latest is a different major/version family; source behavior is not a D29
  vendor guarantee.
- **Permanent prevention:** Exact pin and lockfile; adapter imports isolated to
  one module; contract/golden/fault tests; no provider enum in domain/API; dark
  upgrade qualification; changelog/source audit; and simple adapter disable/
  rollback.

### DR2 — Storage/workflow provider behavior becomes authority

- **What could go wrong:** Supabase signed URL lifetime, upload overwrite
  behavior, Inngest idempotency/history, or pricing changes; product state or
  access depends on that temporary behavior.
- **Why it matters:** A provider configuration change can expose artifacts,
  duplicate work, lose recovery evidence, or create cost surprise.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Signed URLs remain valid to expiry; service roles
  bypass RLS; Inngest idempotency is 24 hours and run-history retention is
  plan-bound.
- **Permanent prevention:** Product-owned authorization/idempotency/receipts;
  authenticated download; no upserted object paths; exported provider-neutral
  evidence; explicit limits/cost telemetry; exact provider configuration tests;
  and requalification before upgrades.

## 16. Migration and upgrade risks

**Material concern: Yes.**

### MR1 — Old packages become unreadable or misinterpreted

- **What could go wrong:** Semantic block/rich-text/profile versions or package
  schema evolve and a new reader guesses at old fields, silently drops unknown
  facts, or changes transformation meaning.
- **Why it matters:** Portability fails precisely when a tenant needs to leave,
  archive, or resume a delayed migration.
- **Severity / likelihood:** **High / Likely over years.**
- **Evidence / reasoning:** D6-D11 deliberately version semantic catalogs;
  provider-shaped exports couple data to installed code.
- **Permanent prevention:** Versioned canonical manifest and neutral IR;
  reader/writer compatibility policy; golden historical fixtures; unknown-major
  rejection; explicit loss/repair manifest; source bytes/digest retained for
  bounded qualification; and migration tooling that produces a new sealed
  plan rather than mutating the old package.

### MR2 — Cutover and rollback strand mixed authority

- **What could go wrong:** New and old exporter/importer paths run together,
  plugin collections remain reachable, or a rollback after schema deployment
  can no longer read run/receipt state.
- **Why it matters:** A partial release can create two authorities or prevent
  safe recovery of in-flight work.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** D29 spans UI, API, storage, DB, workflow, adapters,
  and target commands; internal provider upgrades are high-coupling changes.
- **Permanent prevention:** Expand/backfill/verify/activate migration order;
  dual-read darkness where needed; one explicit cutover flag at the Asym
  boundary; old-reader compatibility until all runs terminal; raw plugin route
  tests; in-flight drain/rollback plan; and export of neutral run evidence.

## 17. Other development hazards

**Material concern: Yes.**

### DH1 — TOCTOU, concurrent import, and active-editor races

- **What could go wrong:** Two privileged users approve the same/different plan,
  a path or identity is claimed after check, or an import advances a Page while
  a staff member has unacknowledged D12 edits.
- **Why it matters:** Last-write-wins or duplicate state invalidates both the
  user's work and the reviewed plan.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** UI disablement is not a lock; bulk work and normal
  editing share destination records; D12 intentionally protects one active
  editor and exact expected revisions.
- **Permanent prevention:** One committing run per Site cohort, database
  advisory/application lock plus uniqueness, expected-version CAS, stable
  identity constraint, item-level conflict/pause, audited migration checkpoint
  rather than overwrite, and concurrency fault tests.

### DH2 — Unsafe cancellation, reversal, tests, or ownership

- **What could go wrong:** A Cancel button lies after writes, undo deletes
  edited/referenced/released work, tests cover only happy-path parser output, or
  no team owns adapter qualification and dead-letter response.
- **Why it matters:** Recovery becomes more destructive than the original
  failure and defects escape at the most consequential seams.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Generic importers often allow partial success and
  limited cancellation; safe reversal depends on downstream state, not just
  batch origin.
- **Permanent prevention:** Cancel only before writes; stop-after-safe-batch
  afterward; checked reversal plan through D21/owner corrections; named product/
  security/operations ownership; source golden fixtures; property and
  cross-Tenant tests; malicious-file tests; lost-ack/crash/permission/reversal
  fault injection; accessibility/usability tests; and a provider kill switch.

## Ruthless synthesis

The adversarial review does not reject B-prime. It rejects a plugin-shaped or
generic interpretation of it. The strongest path is the exact 32-clause
B-prime-R in the [decision brief](./phase-23-d29-content-portability-authority-decision-brief.md).

### Must be fixed in the decision before ratification

These are authority defects, not implementation details:

1. **Name the product boundary:** one Asym-owned Content portability workspace;
   no raw provider UI/routes.
2. **Split purposes:** review CSV is non-reimportable; the Asym Content Package
   is typed/versioned and not a complete backup.
3. **Split phases:** Phase 23 owns content semantics/commands; Phase 30 owns the
   general workbench; owner domains retain their invariants.
4. **Split capabilities:** export, draft export, prepare, view, commit, repair,
   reversal, download, and exception operation are independently proved.
5. **Make planning real:** complete semantic no-write check plus sealed,
   destination-versioned plan; provider preview is insufficient.
6. **Make mutation narrow:** only typed D12 private-revision commands; no raw
   create/update/upsert, title/slug match, publication, or side effects.
7. **Make durability product-owned:** permanent idempotency, run/item receipts,
   one executor, exact partial states, reconciliation, and checked reversal.
8. **Make files and artifacts safe:** private quarantine/custody, upload/archive/
   SSRF/resource controls, RLS/grants, authenticated downloads, and retention.
9. **Make UX acceptance binding:** five-answer invariant, five-step journey,
   exact scope/private-impact copy, accessibility, mobile/reflow, and usability
   proof.

### Required implementation dependency order after future authorization

```text
Capabilities + neutral content/package contract
                    │
                    ├── Governed export projection + exact snapshot
                    │            │
                    │            └── Private artifact/download lifecycle
                    │
                    └── Phase 30 private intake/workbench seam
                                 │
                         Certified source adapter
                                 │
                    Semantic no-write validator
                                 │
                      Immutable sealed Import Plan
                                 │
              D12 owner commands + run/item receipt ledger
                                 │
                 One Inngest executor + reconciliation
                                 │
                    Pause/resume + reversal planning
                                 │
         Security, fault, accessibility, and usability launch proof
                                 │
                     Limited Tenant cohort activation
```

No mutation executor should exist before the no-write plan and product ledger
are verifiable. No real source adapter should activate before private intake
and exact target commands exist. No staff cohort should activate before
cross-Tenant and partial-failure proof passes.

### Should be addressed soon after the core contract

These are valuable but do not justify expanding launch authority:

- certified adapters for the measured top source systems;
- saved source preparation checklists and safe reusable mapping presets;
- better bulk repair only for semantically identical issue codes;
- in-product notification through an existing governed message lane when a long
  run needs attention;
- operator dashboards for adapter success rate and safe support escalation;
- documented package export verification tooling; and
- measured retention/cost tuning from real package distributions.

Each remains inside the ratified contract; none introduces scripts, arbitrary
upsert, publication, or a second orchestration plane.

### Monitor rather than overbuild now

- demand for connected-source APIs versus file artifacts;
- which CMS/version adapters justify certification;
- package/media size distribution and whether current quotas fit;
- time-to-first-blocker, mapping-review burden, abandonment, and support rate;
- partial/lost-ack/dead-letter frequency;
- adapter and Payload exact-pin drift;
- storage, egress, and Inngest step cost per successful migration;
- whether small ministries actually need delegated review or two-person
  approval; and
- whether a future transformation extension has repeated, safe, auditable use
  cases sufficient for a separate decision.

### Launch gates

Do not activate a production Tenant cohort until all are true:

1. every certified source/version has golden full-package, locale, relationship,
   media, unsupported-feature, and corruption fixtures;
2. package round-trip and historical-reader compatibility pass;
3. no-write plan performs zero owner mutations under instrumentation;
4. source, mapping, permission, target, schema, and catalog drift invalidate the
   plan;
5. cross-Tenant DB/API/Storage/object-key and service-worker tests deny every
   wrong-scope attempt;
6. malformed, malicious, oversized, nested, and decompression-bomb artifacts
   fail before mutation;
7. duplicate, concurrent, active-editor, path-race, permission-revocation,
   crash, lost-ack, partial-locale, resume, stop, and reversal tests reconcile;
8. import proves zero D1, navigation, redirect, schedule, form, messaging,
   public-search, user, and public-media side effects;
9. queued work, executor health, dead letters, reconciliation, artifacts,
   Tenant fairness, and cost have alerts and runbooks;
10. every core journey works by keyboard, screen reader, touch, narrow viewport,
    400% zoom, and reduced motion; and
11. representative nonprofit staff correctly identify scope, artifact purpose,
    omissions, private-only outcome, partial state, and next action without
    coaching.

## Final disposition

**The founder ratified B-prime only as the exact B-prime-R.** It is
architecturally sound,
Tenant-safe, scalable, and exceptionally clear when it is an Asym-owned
contract over replaceable provider mechanics. It becomes unsafe and expensive
if interpreted as direct Payload plugin access, a universal importer, a raw
upsert facility, a second Phase 30, or a path to publication.
