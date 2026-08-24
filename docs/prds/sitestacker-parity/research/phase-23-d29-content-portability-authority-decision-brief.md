# Phase 23 D29 Content Portability Authority Decision Brief

**Status:** Founder-ratified exact B-prime-R on 2026-08-24 after primary-source
research, repository inspection, complete staff-journey design, and
17-category adversarial hardening. Ratification authorizes documentation only.

**Date:** 2026-08-24

**Ratified:** 2026-08-24

## Decision to make

Choose the smallest complete Phase 23 authority for staff content exports and
privileged, staged content imports without turning Payload's generic
import/export plugin into the product, building Phase 30 early, weakening
Tenant or publication safety, or giving nonprofit staff a mysterious migration
console.

The founder selected for hardening:

> **Option B-prime — Governed staff exports with privileged, staged imports.**

The founder-ratified selection is correct only with the exact B-prime-R
formulation below. In particular, **staff-facing** does not mean
**permissionless**, **staged** does not mean a provider preview, **successful**
does not mean published, and **import** does not mean an arbitrary database
upsert.

This decision does not reopen D1-D28. It does not authorize code, schema, RLS,
migration, dependency or provider adoption, issue publication, Git
publication, deployment, activation, release, production data access, or a
source-system migration.

Supporting documents:

- [Primary-source and repository research](./phase-23-d29-content-portability-primary-source-research.md)
- [Staff UX and migration-onboarding benchmark](./phase-23-d29-content-portability-ux-benchmark.md)
- [Ruthless adversarial review](./phase-23-d29-content-portability-adversarial-review.md)

## Why this decision is necessary

Phase 23 already defines rich, versioned content semantics, but D1-D28 do not
decide who can export content, what a portable package means, how a legacy CMS
is admitted, or what an import may change. A naive plugin activation would
create five immediate hazards:

1. generic create/update/upsert and arbitrary matching can overwrite the wrong
   content;
2. a syntactic file preview is not a semantic, no-write impact plan;
3. provider jobs and row-by-row writes can leave partial or locale-incomplete
   results while reporting an apparently successful run;
4. generated import/export collections need explicit access control and can
   expose stored artifacts independently of the source records; and
5. Payload's generic status defaults and current plugin mechanics do not encode
   D1 release, D12 revision, D22 locale, D27 media, Phase 29 custody, or Phase
   30 migration-workbench authority.

The permanent solution is not a second importer. It is one Asym-owned
**Content portability** contract and workspace. Phase 23 owns content meaning
and the private-draft target command. Phase 30 later owns the reusable upload,
mapping, staged-row, repair-grid, and background migration workbench. Payload
may supply exact-version-qualified adapter mechanics behind that boundary.

## Settled authority preserved

1. **D1** alone prepares, validates, activates, and serves an immutable Public
   Site Generation. Import completion never publishes, schedules, activates
   navigation or redirects, updates a search projection, or changes a serving
   head.
2. **D2 and D3** own Placement, canonical public paths, path collisions, and
   continuity/redirect outcomes. An import proposes candidate dispositions;
   it cannot reserve or activate them outside those commands.
3. **D4** owns curated navigation revisions. Imported menus or links are input
   to review, never active navigation.
4. **D6-D11** own ordinary content families, semantic block catalogs,
   presentation-package compatibility, and the bounded rich-text profile.
   Unknown or incompatible semantic versions fail closed or become explicit
   repair work.
5. **D12** owns acknowledged working revisions, one recoverable active editor,
   exact expected-version writes, and imported/migrated checkpoints. An import
   creates or advances only private working revisions through D12's typed
   command.
6. **D13** owns exact scheduled publication operations. Source schedules may
   be preserved as non-executable evidence but never become live appointments.
7. **D17** owns the derived on-Site public search projection. Imported drafts
   are ineligible until a later D1 release.
8. **D18-D21** own Content Library folders, Topic Sets, Saved Library Views,
   and recoverable Trash. Destination-owned organization and recovery rules
   remain authoritative; imported source folders or labels cannot become
   permissions, paths, or lifecycle truth.
9. **D22** owns exact locale lineages with no silent field fallback. Missing or
   failed locale content remains visibly incomplete.
10. **D23** Copy-to-Site provides useful transfer-manifest, compatibility,
    repair, and receipt patterns for one bounded item; it is explicitly not a
    migration engine.
11. **D25** owns private, exact whole-Site candidate Preview. A raw import
    preview is not D25 Preview. Imported revisions become eligible for a later
    deliberately prepared D25 candidate only through its normal contract.
12. **D27** owns Tenant-wide public-media identity, qualification, renditions,
    rights/safeguarding state, and usage-local presentation facts. **Phase 29**
    owns private byte custody. Import transport cannot make remote URLs or
    uploaded bytes public-safe media.
13. **D28** owns the versioned Site Search & Sharing Profile and three bounded
    Page overrides. Portable overrides are admitted only through D28; canonical,
    sitemap, robots, structured data, and generated defaults are regenerated
    at the destination.
14. **Phase 3** remains the unified egress-governance and spreadsheet-safety
    boundary. D29 does not invent a second export-field policy or CSV encoder.
15. **Phase 12** remains the capability/PDP authority. UI visibility, API
    authorization, executor authorization, and artifact download all consume
    the same per-action decision; role names are never authorization.
16. **Phase 30** owns general migration sessions, upload/transport, parsing,
    mapping mechanics, staged rows, fixable validation grids, resumable batch
    execution, and safe undo mechanics. D29 owns the content package,
    content-semantic validator/adapter, and typed private-revision command.

## Evidence-led findings

- Payload's current import/export plugin offers CSV/JSON export, selection and
  filter scope, preview, create/update/upsert, locale handling, result files,
  and background jobs. Its documentation also requires applications to secure
  generated collections and run a Jobs Queue worker. Those are useful adapter
  capabilities, not a multi-Tenant product contract.
- Exact source inspection for Core's Payload 4 internal pin shows that import
  batches are intentionally not one transaction, row failures can continue,
  locale writes can fail separately, and preview parses the file before paging
  the displayed result. That makes provider preview and provider completion
  insufficient for D29's semantic plan and reconciliation contract.
- The exact matching internal import/export plugin artifact exists for Core's
  Payload pin but is not installed. Its existence removes any need to pretend a
  Payload 3 plugin is compatible; it does not remove the requirement for
  exact-pin qualification and Asym-owned access, state, and recovery.
- Contentful, Sanity, WordPress, Webflow, HubSpot, Salesforce, and embedded
  importer products consistently demonstrate that migrations need explicit
  scope, mapping review, known exclusions, validation, source-specific
  adapters, background status, and detailed results. They also demonstrate why
  a vendor export is not a complete website or account backup.
- Current Core already has server-derived Tenant access, versioned DTO export,
  formula-safe CSV, durable workflow ledgers, retry/recovery summaries,
  responsive data tables, progress primitives, TanStack Form wrappers, and the
  Web Studio product shell. D29 should compose those conventions instead of
  adding a disconnected plugin console.
- Supabase RLS and Storage policies are necessary but not sufficient. Service
  credentials bypass RLS, private artifacts still need explicit object-scope
  authorization, and signed URLs remain valid until expiry. Product commands
  must therefore bind Tenant/Site scope, use private custody, and reauthorize
  every download and mutation.
- Inngest is suitable for durable, checkpointed execution when it orchestrates
  one product-owned ledger. Provider idempotency windows are not permanent
  business idempotency, and per-row events/steps would create needless state
  and cost. Rate limiting that discards work is never appropriate for imports.

## Options considered

### A-prime — Staff exports and operations-only imports

**Reject as the complete product.** It is safe but leaves tenant staff unable
to prepare, understand, or follow their own migration. That creates tickets,
opaque handoffs, hidden tribal knowledge, and an unnecessarily poor onboarding
experience. Operations must still handle uncertified sources and exceptional
repair, but should not own every ordinary step.

### B-prime — Governed staff exports with privileged, staged imports

**Founder-ratified only as the hardened B-prime-R below.** It provides useful,
low-friction staff exports; a transparent, source-specific migration journey;
and narrow elevated mutation authority without confusing migration completion
with publication.

### C-prime — Fully self-service universal import and export

**Reject at launch.** Unknown schemas, source-specific semantics, media rights,
relationships, locale gaps, scripts, forms, and duplicate identity cannot be
made safe by a generic mapping grid. Building that claim inside Phase 23 would
duplicate Phase 30, expand the attack surface, and create durable technical
debt.

## Exact founder-ratified B-prime-R formulation

> **B-prime-amended-and-hardened (B-prime-R) — One Asym-owned Content
> Portability workspace with purpose-qualified governed staff exports and
> capability-separated, source-qualified, no-write-planned, private-draft-only
> imports, implemented through a versioned content contract and one durable
> product ledger while Phase 30 owns the reusable migration workbench and D1
> remains the sole public-release authority.**
>
> 1. **One bounded product and vocabulary.** Web Studio exposes one quiet
>    **Content portability** workspace with two jobs: **Export content** and
>    **Move content into Asym**. Ordinary staff copy says what is in scope,
>    whether anything has changed, what is happening, and what to do next. It
>    never exposes raw Payload collections, `create`/`update`/`upsert`, schema
>    paths, provider jobs, or migration-engine jargon as the product.
> 2. **Explicit authority split.** Phase 23 owns the versioned Asym Content
>    Package, source-neutral content vocabulary, semantic compatibility rules,
>    exclusion/repair dispositions, export compiler, import-plan validator,
>    and typed D12 private-revision command. Phase 30 owns reusable migration
>    sessions, private upload transport, parsing, mapping UI/mechanics, staged
>    rows, issue-grid mechanics, chunked execution, and reversal-workbench
>    mechanics. Each source family and destination domain retains its own
>    meaning and invariants. No raw table load is ever an import.
> 3. **Capability-separated participation, not role names.** Governed export,
>    draft-inclusive export, migration request, import preparation, plan view,
>    plan commit, repair/resume, reversal preparation, artifact download, and
>    exceptional operations are independently authorizable actions. Staff
>    without preparation or commit authority can request a migration, name an
>    owner, follow status, answer content questions, and review results. Small
>    organizations may grant several capabilities to one trusted person;
>    launch does not impose a needless two-person approval ritual. Publishing
>    is never implied by any D29 capability.
> 4. **Asym owns every product boundary.** UI, commands, status derivation,
>    authorization, Tenant/Site/locale binding, audit, idempotency,
>    reconciliation, and artifact access are Asym-owned. Payload's exact-pin
>    plugin may provide qualified parsing/serialization mechanics behind an
>    adapter, but its generated collection UI, routes, default limits,
>    match-field choices, status defaults, Jobs Queue, and partial-write result
>    are not product authority. Raw plugin routes remain inaccessible unless
>    independently required and secured for an operator-only adapter seam.
> 5. **Exports begin with purpose, not format.** **Review in a spreadsheet**
>    creates a readable governed CSV that is explicitly non-reimportable.
>    **Archive or move content** creates a versioned, checksummed Asym Content
>    Package whose destination compatibility must still be checked. Neither is
>    described as a complete website, account, disaster-recovery, source-code,
>    analytics, user, workflow, credential, or database backup.
> 6. **Exact export scope and one coherent snapshot.** The user sees and
>    confirms the exact Tenant, environment, Site, locale set, eligible content
>    families, selection/filter scope, publication state, draft inclusion,
>    estimated item count, exclusions, and media behavior. Published-only is
>    the default and resolves from the exact active D1 generation and its pinned
>    owner-source revisions; draft export requires its separate capability and
>    uses only exact acknowledged D12 working revisions. The server re-proves
>    row and field authorization and seals exact source revision IDs under one
>    coherent database snapshot before background rendering. Moving offset
>    pagination, latest-row reads, or client-visible table rows never define the
>    package. Specialized families contribute only through their owner-qualified
>    export adapters; D29 never reinterprets or advances their source releases.
> 7. **One egress-governance path.** Spreadsheet and package exporters consume
>    the same Phase 3 field/projection policy and D29 content allowlist. Private,
>    safeguarding, care, security, credential, session, payment, provider,
>    signed-URL, quarantine, audit-internal, and implementation-only fields are
>    absent by construction. CSV uses the shared `csvSafeCell`, UTF-8 BOM,
>    RFC 4180 quoting, and CRLF contract. Audit stores identifiers, scope,
>    field-policy/package versions, counts, digest, and outcome—not exported
>    content bodies.
> 8. **Versioned neutral package, not Payload documents.** An Asym Content
>    Package has a canonical manifest, package/schema/compiler versions,
>    creation purpose and time, source identity, exact scope, item and relation
>    counts, per-file digests, source and Asym stable identities, locale
>    lineages, semantic family/block/profile versions, typed relationships,
>    internal-link targets, path proposals, portable D28 override deltas,
>    media references/status, explicit omissions/losses, and compatibility
>    declaration. Payload row shapes, storage keys, signed URLs, internal user
>    IDs, and provider job state are never the interchange contract. Readers
>    reject unknown major versions and preserve unknown optional additions for
>    diagnosis rather than guessing.
> 9. **Media is referenced and separately admitted.** Exports include stable
>    D27 asset/revision references plus usage-local alt, crop/art direction,
>    displayed credit, purpose, locale, qualification, and disposition. Media
>    bytes are included only by a separately authorized D27/Phase 29 export
>    contract; otherwise the package includes an explicit media-status report.
>    Imports place bytes or remote candidates into Phase 29 private intake and
>    D27 qualification. A source URL, Payload upload, checksum match, or
>    successful download never makes media publicly eligible.
> 10. **Private, short-lived export artifacts.** Export artifacts use private
>     custody, opaque generated object keys, encryption in transit/at rest,
>     bounded retention, and authenticated app download. Every download
>     re-proves current capability and exact object scope, records an audit
>     receipt, and fails closed after revocation or expiry. A UI link may
>     resolve to a short-lived transport URL only after that check; the durable
>     product record never treats a bearer URL as authority. Expired artifacts
>     are recreated from current authorized content, never silently
>     resurrected.
> 11. **Certified sources plus an honest qualification lane.** The source
>     selector lists only certified adapter and source-version combinations as
>     ready. **Other CMS or custom site** always exists as a request/approved-
>     sample lane, not a claim of universal compatibility. Each adapter provides
>     a versioned source checklist, accepted artifacts, size/shape limits,
>     snapshot/cutoff guidance, media behavior, known exclusions, and golden
>     fixtures. Unknown versions, custom plugins, or changed exports pause for
>     qualification rather than running a best-effort production import.
> 12. **The destination is exact and continuously visible.** Server-authorized
>     choices establish one Tenant × environment × Site × exact locale mapping
>     and eligible destination families. Every import step and run page repeats
>     that scope, the Site's public domain for orientation, and **Live impact:
>     None — private drafts only**. The target is frozen into the plan and
>     re-proved before every mutation. A browser value, file value, source
>     tenant, guessed default Site, or stale operator context can never choose
>     the destination.
> 13. **Private quarantine before parsing.** Source artifacts use resumable
>     private upload where size/network conditions warrant it and record exact
>     Tenant, Site, actor, purpose, filename-for-display, generated object key,
>     MIME/signature evidence, byte count, digest, adapter version, and expiry.
>     Admission enforces file-count, compressed and decompressed size, entry,
>     nesting, row/node, field, string, relation, image, and processing budgets;
>     rejects traversal and ambiguous/polyglot content; scans applicable bytes;
>     never executes macros, HTML, JavaScript, templates, or archive contents;
>     and deletes or isolates rejected/expired artifacts through a recorded
>     lifecycle.
> 14. **Credentials and external retrieval are bounded.** Staff never paste
>     source credentials, API keys, cookies, or bearer links into notes or
>     arbitrary fields. Any future connected-source adapter uses a dedicated
>     secret authority and least-privilege, revocable source grant. Remote
>     media retrieval permits only qualified HTTPS sources, resolves and pins
>     public addresses safely, blocks private/link-local/metadata networks and
>     redirects to them, limits bytes/time/content type, and moves the result
>     into Phase 29 intake. The durable event and audit record contains safe
>     identifiers, not source content, URLs with secrets, or bytes.
> 15. **Adaptive mapping with no destructive guessing.** Exact adapter-known
>     mappings are collapsed as **Matched**. Deterministic aliases may be
>     suggested; heuristic/AI/fuzzy mappings are labelled **Suggested — review
>     required**, show representative source values, and require a human
>     decision. Required, Suggested, Unmapped, and Excluded views make the
>     unresolved work explicit. Ordinary staff never select arbitrary database
>     fields or match keys. External content never updates by title, slug,
>     email, path, position, or fuzzy resemblance.
> 16. **Source-neutral semantic admission.** The adapter produces typed neutral
>     content candidates rather than Payload writes. It preserves source IDs
>     and attribution; maps Pages/Articles only to compatible D6-D11 semantic
>     families and versions; routes specialized Missionary, Project/Campaign,
>     Ministry Update, form, and media facts through their owner adapters; and
>     classifies every field, block, relationship, internal link, embed,
>     author, locale, folder, topic, path, SEO override, publication/schedule
>     fact, and source omission as admitted, transformed, needs review,
>     excluded, or blocked. Source authors never become users automatically;
>     scripts, trackers, payment widgets, source forms, and unsupported embeds
>     never execute or silently migrate.
> 17. **A real semantic no-write check is mandatory.** Staff action **Check the
>     import** performs parsing, mapping validation, full semantic validation,
>     stable-identity lookup, relationship/link closure, locale completeness,
>     block/profile compatibility, media intake/qualification disposition,
>     D2/D3 path and continuity impact, D28 override compatibility,
>     authorization, quota, and destination-version checks without invoking
>     any target mutation command. Payload preview, sample rows, client
>     validation, or a transaction that is intentionally rolled back is not
>     this contract.
> 18. **Four precise issue classes.** Results are grouped as **Must fix before
>     creating drafts**, **Needs review before release**, **Will not be
>     imported**, and **Information**. Each issue has a stable code, plain-
>     language consequence, affected item/field/reference, repair action, and
>     downloadable formula-safe report. There is no ambiguous catch-all
>     warning, hidden skipped-row total, or green **completed with warnings**
>     state. Every source item receives an explicit disposition and control
>     totals must reconcile.
> 19. **One immutable sealed Import Plan.** A successful check seals the source
>     artifact digest, adapter/mapping/content-contract versions, exact target,
>     destination schema/catalog/profile versions, authorized stable-identity
>     matches, item/relation/media/path dispositions, expected source and
>     destination revisions, exclusions, blockers, counts, cost/size budget,
>     and deterministic plan digest. The review begins **No content has
>     changed** and shows exact creates, authorized updates-as-new-revisions,
>     conflicts, omissions, unresolved work, path/redirect impact, private-
>     draft outcome, and zero publication. A source, mapping, permission,
>     target, catalog, or relevant destination change makes the plan stale and
>     requires **Check import again**.
> 20. **Commit is a separate privileged command.** The plan viewer and commit
>     executor re-prove a distinct current capability, exact Tenant/Site/
>     locale, immutable plan digest, expected destination versions, budgets,
>     and one explicit acknowledgement. The consequence-named CTA is **Create
>     {count} private drafts** when every item is new, or names both consequences
>     exactly—for example **Create 170 Pages and add 16 private revisions**—not
>     **Run**, **Import**, **Publish**, or a typed organization-name ceremony. A
>     request or prepared plan gives no mutation authority. Capability
>     revocation before the next write stops safely and records the exact
>     disposition.
> 21. **Only owner commands create private revisions.** Each admitted item flows
>     through its owning typed service and D12 expected-revision/idempotency/
>     lease-or-audited-override contract. New external content creates new
>     private identities and working revisions. An exact authorized native
>     Asym identity may append a private successor revision; it never rewrites
>     a released revision in place. Import never publishes, activates D1,
>     changes a serving head, activates navigation/redirects/schedules/forms,
>     creates users, sends messages, fires ordinary automations, updates public
>     search, or emits public media. Batch-origin suppression prevents side-
>     effect fan-out while required audit/outbox facts remain durable.
> 22. **Stable identity and repeatable semantics.** Every run has a semantic
>     idempotency key derived from Tenant/Site, source system/snapshot,
>     artifact digest, plan digest, target adapter version, and intended
>     command—not from an ephemeral provider event ID. Duplicate submission
>     returns or links to the prior run. Only a package carrying an exact,
>     authorized Asym identity and lineage can propose an update; otherwise
>     possible duplicates are review information and the safe default is a new
>     private identity. A later source delta is a new checked plan with explicit
>     create/update/conflict dispositions, never blind upsert.
> 23. **Bounded writes and two-pass closure.** The sealed plan has deterministic
>     chunks and a dependency order. Pass one creates or appends eligible
>     private identities/revisions; pass two connects relationships and
>     internal links only after targets exist. Each item or inseparable locale
>     lineage is transactionally atomic, with explicit run-item receipts and
>     before/after revision IDs. The overall run is resumable rather than one
>     giant transaction. Missing targets, cyclic relationships, uniqueness
>     races, or lost acknowledgements pause/reconcile the affected cohort; they
>     never silently produce broken links or half-localized success.
> 24. **Locale outcomes are exact.** Every imported locale maps explicitly to
>     one enabled D22 lineage. There is no default-locale guessing or field
>     fallback. A locale candidate is either complete, an explicitly incomplete
>     private draft with named release blockers, excluded with reason, or
>     blocked. Base-locale success cannot mask a failed localized write, and no
>     other locale is advanced by the import.
> 25. **Concurrency is deliberately narrow.** Only one committing content-
>     portability run may own a Site write cohort at a time; other preparation
>     and export work may continue when safe. Commit rechecks D12 active-editor
>     state and destination versions. It never overwrites unacknowledged edits;
>     affected items pause for review or use a narrowly audited migration
>     override that creates a visible private checkpoint. Advisory/application
>     locks and database uniqueness constraints protect identity and path
>     races; UI disablement is never the lock.
> 26. **One durable executor and one product ledger.** A product-owned
>     Content Portability Run and per-item receipt ledger are the recovery and
>     business truth. The existing Core workflow-orchestration seam dispatches
>     one Inngest function with safe identifiers, bounded chunk steps,
>     Tenant-keyed concurrency/fairness, retry policy, heartbeats, dead-letter
>     state, and reconciliation. Payload Jobs is not a second orchestrator.
>     Inngest's temporary idempotency, run history, and step state do not
>     replace permanent product idempotency or receipts. Product rows retain
>     only bounded identifiers, dispositions, digests, counts, and revision
>     references; staged content bodies and verbose issue/result artifacts stay
>     in Phase 30 private staging/custody. No row-sized content, file bytes,
>     secret URLs, or huge arrays ride database receipts, events, or step state.
> 27. **Truthful progress and interruption.** Run detail survives navigation,
>     session renewal, browser closure, and weak networks. It reports factual
>     phases—checking plan, preparing destination media, creating private
>     drafts, connecting relationships, verifying results—and exact processed/
>     verified/remaining counts. Unknown progress is indeterminate; there are
>     no fabricated percentages or time promises. Before writes, **Cancel
>     import** can guarantee no changes. After durable writes begin, the action
>     is **Stop after the current safe batch** and explains that verified
>     private drafts remain for reconciliation.
> 28. **Partial outcomes are first-class and recoverable.** The terminal model
>     distinguishes stopped-before-changes, paused-after-partial-write,
>     verifying-unknown-acknowledgement, completed-review-needed, completed,
>     failed, and dead-lettered. A verifier reconciles source/plan control
>     totals with per-item receipts and destination revisions before completion.
>     Retry/resume reuses the same plan and idempotency records; it never starts
>     a competing run. Each item shows created/advanced/not-created/blocked/
>     excluded/unknown and the next safe action. Provider logs alone can never
>     turn a run green.
> 29. **Reversal is a checked plan, not undo theatre.** **Prepare reversal**
>     computes which still-private, unedited, unreleased, unreferenced results
>     can move through D21's governed Trash or receive a private successor
>     restoring a before-image. Edited, referenced, scheduled, included in a D1
>     candidate/generation, released, externally observed, or owner-domain
>     protected facts block automatic reversal and name the required owner
>     correction. Reversal has separate capability, immutable plan, idempotency,
>     receipts, audit, and truthful partial handling. Nothing public is deleted,
>     rolled back, or unpublished implicitly.
> 30. **Durable audit, observability, and bounded cost.** Product records capture
>     actor, delegation, capabilities proved, exact scope, source/adapter/
>     contract/plan versions and digests, counts by disposition, item receipt
>     IDs, authorization changes, artifact lifecycle/downloads, retries,
>     reconciliation, reversal, and correlation IDs while redacting content,
>     secrets, signed URLs, and bytes. Staff see actionable next steps;
>     operators see queue age, oldest run, plan staleness, upload/scan failures,
>     throughput, retries, unknown acknowledgements, dead letters, orphan
>     artifacts, count/digest mismatches, Tenant fairness, and per-run provider
>     usage/cost. Explicit size, step, concurrency, retention, and time budgets
>     fail before commit rather than creating an unbounded bill or database
>     outage.
> 31. **Exceptional, accessible staff experience.** Every screen answers five
>     questions: exact scope, included/changed facts, whether anything has
>     changed, current activity, and next action. Import is a saved full-page
>     five-step journey—Source, Destination, Match content, Check and resolve,
>     Review plan—with an ordered accessible stepper, native file input plus
>     optional drop zone, labelled combobox mappings with samples, persistent
>     linked error summary, responsive issue table/list, keyboard and screen-
>     reader completion, text-plus-icon statuses, exact civil times/timezones,
>     polite milestone announcements, truthful progress, 400% reflow/touch
>     support, and reduced motion. Completion repeats **Nothing was published**
>     and points to imported drafts and a later D25/D1 review path.
> 32. **Qualification and evolution gates.** Launch requires exact-pin Payload
>     adapter contract tests, versioned package reader/writer round trips,
>     golden fixtures for every certified source/version, malicious/oversized
>     file tests, RLS/object-authorization and cross-Tenant matrices, stale-plan/
>     concurrency/lost-ack/duplicate/resume/reversal fault tests, relationship/
>     locale/media/path fixtures, accessibility tests, and moderated usability
>     proof with nonprofit communications staff, multilingual editors, small-
>     organization administrators, migration specialists, and media/safety
>     reviewers. A provider, schema, adapter, content catalog, or package major
>     upgrade remains dark until dual-version compatibility, rollback, export,
>     and recovery evidence passes. Unknown future source flexibility comes
>     from additive adapters and versioned contracts, not a tenant scripting
>     language or generic Phase 23 importer.

## Derived staff journeys

### Governed export

1. Choose **Review in a spreadsheet** or **Archive or move content**.
2. Confirm exact Site, locale, content families, filter/selection, and whether
   private drafts are included.
3. Review an exact count/exclusion/media summary and choose **Create export**.
4. Leave safely while the sealed snapshot is prepared in the background.
5. Download through a currently authorized, expiring app action.
6. Recreate an expired artifact from current authorized content.

### Privileged staged import

1. **Source:** select a certified CMS/version or request qualification; upload
   an approved artifact into private quarantine.
2. **Destination:** confirm exact Tenant/Site/domain/locales and permanent
   **Live impact: None — private drafts only**.
3. **Match content:** review only unresolved or suggested mappings and explicit
   exclusions; no raw upsert or fuzzy overwrite.
4. **Check and resolve:** perform the semantic no-write check, fix blockers, and
   inspect every disposition.
5. **Review plan:** verify the immutable impact and choose **Create {count}
   private drafts** with the separate capability.
6. Follow truthful background phases and recover from a closed tab, expired
   session, partial run, or lost acknowledgement.
7. Review imported drafts in Web Studio; prepare a D25 candidate and use D1
   only as a later, independent release decision.

The detailed screen model, copy, accessibility contract, and edge-state matrix
are in the [D29 UX benchmark](./phase-23-d29-content-portability-ux-benchmark.md).

## Ruthless synthesis

### Must be settled in D29 now

1. Ratify the exact 32-clause B-prime-R, including the Phase 23/Phase 30/owner-
   domain split.
2. Treat purpose-qualified export, exact snapshot, field governance, private
   artifacts, and reauthorized download as one contract.
3. Treat source qualification, private quarantine, semantic no-write check,
   sealed plan, separate commit capability, typed private-revision writes,
   durable receipts, reconciliation, and checked reversal as one import
   contract.
4. Preserve D1 publication separation and every D2-D28 owner boundary.
5. Make the complete calm five-step journey and its accessibility/partial-
   failure behavior acceptance criteria, not optional polish.
6. Keep Payload, Supabase, Inngest, and future embedded importers behind
   exact-version-qualified adapters.

### Implementation order after future authorization and prerequisites

1. Lock the neutral package, issue taxonomy, run/item receipt, capability, and
   typed command contracts.
2. Build the shared export projection and exact-snapshot package compiler.
3. Establish private artifact custody, upload admission, lifecycle, and
   reauthorized download.
4. Implement one certified source adapter and its golden fixtures against the
   Phase 30 workbench seam.
5. Implement semantic no-write planning, sealed-plan staleness, and staff
   review UX before any mutation executor.
6. Add the private-revision executor, durable ledger, Inngest dispatch,
   reconciliation, pause/resume, and reversal planning.
7. Prove cross-Tenant isolation, fault recovery, accessibility, and moderated
   staff usability before enabling a real Tenant cohort.

### Explicitly not in this decision

- a universal self-service importer;
- arbitrary tenant transformation scripts or schema designers;
- title/slug/fuzzy upsert;
- raw Payload import/export UI or public plugin routes;
- a second Payload Jobs orchestration plane;
- direct database imports or service-role shortcuts;
- automatic user creation, script/embed execution, form activation, schedule
  activation, redirect activation, media qualification, or publication;
- full website/account/database backup or disaster recovery;
- live source synchronization or recurring operational feeds;
- a mandatory enterprise approval chain for every small ministry; or
- a temporary throwaway importer that Phase 30 must later replace.

## Ratification record

The founder ratified the complete quoted 32-clause formulation above as Phase
23 D29 on 2026-08-24. The supporting research, UX benchmark, and adversarial
review explain but do not independently expand that authority.

Ratification authorizes documentation only. It does not authorize code, schema,
RLS, migration/backfill, dependency or provider adoption, Payload plugin
installation, issue or specification publication, Git publication, deployment,
D1 activation, release, production data access, or a source-system migration.
Root `CONTEXT.md` synchronization remains held until the Phase 22 documentation
stack is merged or Phase 23 becomes an explicit reviewed stack.
