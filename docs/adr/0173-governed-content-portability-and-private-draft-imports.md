# ADR-0173: Governed content portability and private-draft imports

**Status:** Accepted (founder-ratified Phase 23 D29 B-prime-R, 2026-08-24)

## Context

Phase 23 needs useful staff exports and an exceptional, transparent path for
moving legacy-CMS content into Asym without turning Payload's generic
import/export plugin into the product, building Phase 30 twice, exposing a raw
upsert surface, or weakening Tenant, locale, media, revision, and publication
safety. Generic provider preview and completion cannot prove Asym's semantic
impact: the exact Core-pin Payload implementation processes rows and locale
updates partially, while its generic version fallback may be published.

The trade-off is deliberate. Operations-only import would preserve safety but
make tenant onboarding opaque and needlessly manual. Universal self-service
import would promise compatibility that unknown source schemas, relationships,
media rights, active content, and stable identity cannot safely provide.
Phase 23 therefore owns content meaning and private-revision commands; Phase 30
owns the reusable migration workbench; each adjacent domain retains its own
authority; and D1 remains the only public-release path.

## Decision

<!-- prettier-ignore -->
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

## Consequences

- Staff receive useful, purpose-qualified exports and can participate in a
  transparent migration without receiving implicit bulk-mutation authority.
- A privileged import is a source-qualified, no-write-planned, private-revision
  operation with permanent receipts—not a raw Payload create/update/upsert.
- Payload, Supabase, Inngest, and future embedded importer mechanics remain
  exact-version-qualified adapters behind Asym-owned authority.
- Phase 30 supplies the shared migration workbench rather than being duplicated
  in Phase 23.
- Import completion never means live, published, scheduled, redirected,
  searchable, messaged, or publicly media-qualified.
- The complete staff journey, partial-state recovery, accessibility, Tenant
  isolation, and usability proof are launch requirements rather than polish.

## Evidence

- [D29 exact formulation and decision brief](../prds/sitestacker-parity/research/phase-23-d29-content-portability-authority-decision-brief.md)
- [D29 primary-source and repository research](../prds/sitestacker-parity/research/phase-23-d29-content-portability-primary-source-research.md)
- [D29 staff UX benchmark](../prds/sitestacker-parity/research/phase-23-d29-content-portability-ux-benchmark.md)
- [D29 17-category adversarial review](../prds/sitestacker-parity/research/phase-23-d29-content-portability-adversarial-review.md)
- [Phase 30 migration-workbench boundary](../prds/sitestacker-parity/roadmap.md#phase-30--imports--migration-tools-imports-migration)

Ratification authorizes documentation only. It does not authorize code, schema,
RLS, migration/backfill, dependency or provider adoption, plugin installation,
issue/specification publication, deployment, D1 activation, release, production
data access, or a source-system migration.
