# Retained source-owner requirements

Adopted with roadmap v3 on 2026-09-22. These detailed obligations from the
previous roadmap remain operative alongside the updated phase chapters. They
preserve existing owner decisions rather than re-grooming Phases 0–26.
The immutable [v2 capture](source-2026-09-22/previous-roadmap-v2.md) preserves
the complete prior wording. New phase ownership below is reconciled explicitly.

<a id="phase-27"></a>

## Phase 27 — donor-development

- **Portfolios as derived views** over active staff-assignment edges (roles
  as data: donor_rep / regional_rep / church_relations / mobilizer) —
  rule-based auto-assignment + manual override, assignment history, **no
  stored portfolio table**.
- **Pipeline enrollments** carrying cultivation stage — one enrollment
  primitive with **stage presets**: staff preset (identification →
  qualification → cultivation → solicitation → stewardship) and the
  missionary MPD preset (Phase 28 reuses this object, different preset;
  never fork the model per surface).
- **Ask/proposal records**: asked/expected/funded amounts + status + owner
  (the RE NXT opportunity pattern), tied to Phase 13 campaigns/designations;
  pipeline rollups by status and owner; projection-accuracy metrics. Every
  monetary ask carries an explicit currency and Legal Entity/campaign scope.
  Rollups remain same-currency and same-entity unless Phase 33 supplies a
  visibly labelled reporting conversion.
- **Next-action discipline**: every active enrollment has a next task with a
  due date; **portfolio health metrics** (untouched prospects, stage aging,
  overdue actions) — research shows 55–65% of prospects in naive portfolios
  are never visited; health metrics are the fix, not bigger lists.
- **Engagement scoring v1**: transparent RFM bands recomputed on schedule,
  score-drop alerts as tasks; advisory input to stage, never the stage.
  (Fills the Phase 9 Overview socket that ships with placeholder data.)
- **Appeals (org-scope)**: goal + Excluded/Asked/Committed/Received/Given
  buckets (MPDX model; collapse Received/Given if same-database processing
  makes the distinction moot — decide at grooming), list + kanban views,
  segment export. Goals and buckets use explicit currency lanes; Phase 27
  never sums unlike currencies into one scalar.
- **Church-partnership development**: org-party pipelines (sending/
  supporting church cultivation) as a first-class preset.
- **Donor brief**: pre-meeting summary generated from the party record
  (giving, commitments, interactions, relationships).

**Boundaries & guardrails.** Cultivation stage is never a lifecycle status
and never authorization. Asks are never edges or custom fields. Suppression
(never-ask, do_not_contact) blocks ask suggestions and appeal inclusion via
the one consent authority. AI next-best-action/wealth screening explicitly
deferred post-parity — deterministic cadence first.

<a id="phase-28"></a>

## Phase 28 — missionary-workspace-depth

- **MPD funnel** on the shared enrollment object (preset: Never Contacted →
  Ask in Future → Contact for Appointment → Appointment Scheduled → Call for
  Decision → Partner-Financial/Special/Prayer) with the **terminal/
  suppression tail** (Not Interested, Unresponsive, Never Ask, Research
  Abandoned, Expired Referral) — Never Ask wired into the consent gate.
- **Optional commitment tracking vs goal**: when a tenant uses commitments or
  goals, preserve multiple concurrent commitments per
  partner (TntConnect's single-pledge limit is a known pain — beat it),
  source-authoritative Phase 16 commitment and occurrence attention states
  (frequency math, grace windows, and ambiguity rules specced precisely), and
  a distinct first-gift event. Attention belongs to the named commitment or
  occurrence; a partner or donor is never labelled “lapsed.” Multi-currency
  commitments, progress, and goals remain explicit per-currency lanes unless
  a separately governed reporting conversion exists; they are never
  collapsed into a source-authoritative cross-currency scalar.
- **Gift-event-driven automatic tasks** (the flagship differentiator,
  Inngest fan-out from Phase 6/13 events): thank first gift, thank
  special/above-commitment gift, review a named Phase 16 attention transition,
  celebrate fulfillment — idempotent and permanently semantic-deduped at every
  generated task/send. Phase 28 owns task and audience purpose; Phase 16 owns
  communication eligibility, Phase 17 owns governed content and sender
  profile, and Phase 6 owns dispatch and communication history.
- **Personal appeals + referrals**: appeals over their supporters (five-
  bucket model shared with 27); referrals as "referred by" **edges in the
  Phase 9 graph** (never a text field) with expiry timeout and source
  reporting.
- **Newsletter list management**: Physical/Email/Both/None per contact +
  invalid-address flags; clean segment exports (print partners) and
  consent-gated sends through Phases 17 and 6; **newsletter-preference seam**
  (Phase 9 Contact tab) fulfilled here; Mailchimp sync itself is Phase 32.
  Phase 28 never calls Resend or another transport directly.
- **Dashboard**: a bounded, role-safe composition that may include monthly
  support vs goal, gained/lost this week/month, a 13-month trend,
  commitments/occurrences needing attention, appeal progress, and only the
  Phase 21 modules published for the exact Support Assignment by the current
  Support Workspace Publication Profile Version and authorized for the current
  principal by Phase 12. A Support Assignment Participant Membership alone
  grants nothing. Each module requires its own current source, configuration,
  and authorization. Activity, goal, commitment, Plan, balance,
  Balance Coverage, and Reserve Position remain independent. A tenant that
  does not use commitments or publish balances sees no empty or zero-valued
  cards. When the balance family is enabled, every authorized parallel
  Finance-confirmed Field Account Balance is simultaneously discoverable,
  separately ISO-labelled, and independently through-dated; there is no
  authoritative converted aggregate or selector-only discovery. The projection
  may also show provisional support recorded since close,
  next-compensation date/status/tenant-visible amount only from the exact
  Compensation Funding Plan Version, Compensation Funding Decision, External
  Compensation Result, and External Payment Occurrence safe projection,
  optional policy-derived ministry-expense capacity, and expense/reimbursement
  progress. It consumes D3's exact assessment
  presentation—including the quiet No-Assessment state, bounded tenant-selected
  detail mode, canonical gross/assessment/support-credited values, and
  period-level components—without resolving profiles or recalculating
  assessment from gifts. Phase 28 never recomputes or relabels these facts from
  gifts, commitments, support-raising goals, or accounting records.
- **Coaching/accountability views** with **PII redaction by design**
  (coach sees weekly appointments vs target, dials, new partners, support
  gained/lost, trends — initials + amounts only; read-only, invite-based;
  weekly qualitative self-report) — redaction enforced in the Phase 3
  projection layer, not component code; targets org-configurable, not
  hard-coded to one org's methodology.
- **Goal setting**: the Phase 28 Support-Raising Goal Version owns the
  fundraising/coaching goal, MPD start/end dates, and weekly targets—the
  denominators for coaching metrics. An authorized user may explicitly create
  a new Phase 28 Goal Version from an Approved Support Plan Version with exact
  provenance. Later Plan changes produce only a compare/update suggestion;
  neither authority live-synchronizes or rewrites the other. Phase 21
  separately owns finance-closed Support Cycles, assessments, compensation
  funding coverage, and optional policy-derived ministry-expense capacity.
  Phase 22 D6 may reference one exact compatible Goal Version for a page's
  optional public metric, but Phase 28 never makes that goal public, changes a
  page profile, or silently updates a released denominator. A new goal version
  becomes public only through Phase 22's normal prospective page release.
- **Interaction log shared with staff** (one log, permission-scoped
  visibility — the same phone call is never logged twice or lost).

**Boundaries & guardrails.** The workspace is not a second Mission Control:
it can only see/enumerate parties with an active supporter-or-referral
relationship to that missionary (Phase 9 guardrail), with approved exports
obeying donor privacy and suppression. Org-owned data stays org-owned. The
optional Phase 21 D8/Phase 31 continuity feed is an outbound, read-only
transition lane for an incumbent external tool, not middleware inside the
Asym-native workspace. Phase 28 contributes no feed resource until its
relationship/contactability purpose contract is separately ratified.

<a id="phase-29"></a>

## Phase 29 — files-documents

- **One storage-object/access model**: immutable digest and byte identity,
  owner-domain and owner-record reference, kind, Phase 10 classification,
  owner-supplied retention-policy reference, storage class, and provenance;
  signed, expiring access URLs; download audit for confidential/restricted
  tiers. Domain-specific document or evidence state remains in its owner.
- **Resolve the dual-storage accident**: the repo currently runs Supabase
  Storage buckets (profiles, document-uploads, email-assets, PDF studio)
  _and_ a parallel Cloudinary signed-upload pipeline (with a duplicated
  module) with no ownership rule — this phase rules which provider owns
  what (recommendation at grooming: media-optimized public assets vs
  private documents) and documents it in the ownership matrix.
- **Folders/organization** (SiteStacker File Manager parity: nested
  folders, path-based linking), per-domain attachment surfaces (the Phase 9
  record-shell Files tab lights up), bulk operations.
- **Public media vs private documents as different classes** with different
  defaults (public assets cacheable; private docs signed-URL only,
  classification-gated).
- **Photo hygiene pipeline** (with Phase 10): EXIF/geolocation scrubbing on
  upload for worker-linked media; review gates for restricted workers.
- **Retention execution** under owner policy: care files, generated documents,
  expense evidence, and imports can have different legal lives. Phase 29
  applies holds and executes the owning domain's authorized disposition,
  feeding the Phase 6 redact-not-delete posture and future DSAR tooling (40);
  it never invents or overrides purpose retention.
- **Generated-document artifact storage** (18): Phase 18 exclusively owns the
  Logical Document, immutable Generated Document Versions, current canonical
  accessible PDF, purpose-retention version, and evidence-only revision
  history. Phase 29 stores and serves exact immutable bytes. It cannot retitle
  or replace semantic identity, mark a version current, expose prior revisions
  as donor choices, or choose their disposal.
- **Expense-evidence byte lifecycle** (21): Phase 29 supplies the private
  storage, access, malware-hygiene, retention, and deletion mechanics for
  receipt images and other expense evidence. Phase 21 owns the expense
  evidence's business meaning, immutable Receipt Evidence Asset identity,
  exact Claim Version/item coverage links, qualification,
  approval/correction state, and accounting-ready coverage. The D10
  predecessor seam and Phase 29 lifecycle use the same opaque byte identity;
  adoption is not a file rewrite. Moving or deleting bytes cannot silently
  rewrite that source truth.
- **Expense-collaboration evidence retrieval** (21): D24 reuses the same
  private-byte lifecycle; it does not create a helper file store. Phase 21 owns
  the exact claim/item/split/evidence collaboration scope, Evidence Access
  Projection Version, current purpose authorization, assignment lifecycle, and
  action provenance. Phase 29 owns immutable byte identity, private storage,
  malware hygiene, retention, hold, quarantine, disposition, access audit, and
  short-lived requester-authorized delivery. Retrieval must be non-public and
  non-cacheable, and reusable bearer URLs are forbidden. Revocation blocks
  future retrieval without claiming that bytes already delivered can be
  recalled; storage movement or deletion cannot create, expand, or rewrite
  D24 assignment, consent, approval, submission, payment, Field Account, or
  accounting truth.
- **Expense-resolution evidence boundary** (21): D25 reuses the exact D10
  Receipt Evidence identity and D24/Phase 12 current-access contract; it creates
  no file store, duplicate evidence asset, or new byte family. Phase 29 owns
  immutable bytes, scan, private retrieval, access audit, retention, hold,
  quarantine, and authorized disposition. D25 owns only typed evidence
  references and source-attributed coordination. Storage movement, deletion,
  quarantine, or access failure cannot supply a claimant response, prove
  evidence unavailable or sufficient, resolve a case, satisfy a downstream
  disposition, or trigger a financial correction.
- **Phase 21 records-package byte lifecycle** (21): D26 owns its six closed
  record-family meanings, Records Schedule Contract and Binding Versions,
  per-record Retention Resolutions, successor-impact coverage, package schema
  and selected content, Coverage Manifest, representation labels, and business
  completeness. Phase 29 alone owns immutable private package bytes, encrypted
  staging, scan/quarantine, copy inventory, authenticated streaming and access
  audit, short package-byte expiry, owner-authorized hold/disposition
  execution, provider-copy outcomes, backup treatment, and restore suppression.
  A download, print, Tenant External Copy Assertion, or expired staging copy
  cannot make Phase 29 infer completeness, legal sufficiency, verified
  destination custody, source retention, hold release, or source disposal.
- **Prospective-expense-evidence byte lifecycle** (21): D22 quotes,
  itineraries, estimates, budgets, and other plan evidence use a separate
  Phase 21 semantic identity from D10 Receipt Evidence. Phase 29 owns immutable
  byte identity, private storage/retrieval, malware hygiene, access audit,
  retention, hold, quarantine, and disposition; Phase 21 owns meaning,
  request-version coverage, classification purpose, and decision lineage.
  Bytes cannot become a claim, receipt, approval, reservation, reimbursement,
  payment, or accounting fact. Evidence-bearing D22 activation waits for the
  certified private-byte seam; an attachment-free manual plan path remains
  complete wherever the tenant's winning policy permits it.
- **Travel-route and location-evidence byte lifecycle** (21): route files,
  optional GPS artifacts, odometer images, map-provider evidence, destinations,
  and similar D18 travel inputs are separately purpose-labelled expense evidence,
  not generic attachments. Phase 29 owns private byte identity, malware/file
  hygiene, short-lived purpose-bound retrieval, access audit, tenant-visible
  retention, holds, quarantine, and disposition. Phase 21 owns their evidence
  meaning, exact claim/item coverage, qualification, calculation lineage, and
  retention purpose; Phase 10 supplies the strictest worker/location
  classification and egress floor. A manual evidence path remains available,
  and no broad export, support view, ordinary approved artifact, or accounting
  package receives raw route/GPS content by default.
- **Travel cumulative-admission evidence byte lifecycle** (21): any D28
  predecessor export, attestation support, associated-scope proof, or continuing-
  completeness feed artifact remains private purpose-labelled calculation-
  admission evidence. Phase 29 owns immutable byte identity, malware/file
  hygiene, short-lived authorized retrieval, access audit, retention, hold,
  quarantine, and disposition. Phase 21 owns the Opening Cumulative State,
  Capacity Key Contract, evidence class, pool/group meaning, Admission Manifest,
  first-use authority, correction, and containment. A file, digest, upload,
  restore, or storage result cannot prove zero or completeness, admit native
  calculation, create a historical claim, or establish downstream financial
  truth.
- **Compensation-handoff byte lifecycle** (21): Phase 29 stores and serves the
  exact immutable artifact bytes, enforces private access and access audit, and
  executes disposition under Phase 21's retention purpose. Phase 21 retains
  Compensation Handoff Package semantic identity, schema, content digest,
  source coverage, currentness, provider-operation lineage, and retention
  authority. Moving or disposing bytes cannot turn a decision into payroll,
  payment, or accounting truth.
- **Organization-card activity file lifecycle** (21): Phase 29 supplies private
  byte storage, malware and sensitive-card-data hygiene, short-lived authorized
  access, access audit, retention, hold, quarantine, and disposition mechanics
  for Organization Card Activity File Assets. Phase 21 owns their purpose,
  immutable identity, Organization Card Source and Import Profile relationship,
  manifest linkage, parser provenance, transaction meaning, and retention
  reference. Moving, quarantining, or disposing bytes cannot rewrite accepted
  transaction evidence, assignments, coverage, corrections, claims, approval,
  payment, accounting, or reconciliation truth.
- **Field Account opening-evidence byte lifecycle** (21): Phase 29 supplies
  private byte storage, content identity, malware/file hygiene, short-lived
  authorized retrieval, access audit, retention, hold, quarantine, and
  disposition mechanics for artifacts in a Phase 21 D17 Opening Source Package.
  Phase 21 owns source precedence, package and manifest identity, source-fact
  dispositions, exact-history qualification, cohort reconciliation,
  conservation, activation, corrections, evidence-purpose retention, and what
  remains structurally inert reference history. Moving, restoring,
  quarantining, or disposing bytes cannot activate Field Accounts, alter an
  Opening Position, make reference history authoritative, replay side effects,
  or create accounting truth. Opening evidence is never public storage.
- **Public Ministry Media byte lifecycle** (22): Phase 22 D9 owns the semantic
  Public Ministry Media Asset, page/locale placement meaning, release
  eligibility, exact Page Release Manifest pin, where-used meaning, and
  withdrawal intent. Phase 29 supplies the compatible private Upload Intake,
  immutable Sanitized Media Master and derivative byte custody, scanning and
  bounded transformation execution, copy inventory, access, quarantine, hold,
  retention, and disposal evidence. It must preserve D9's opaque identities,
  discarded-source-name, private-origin, no-public-original, immutable-
  generation, independent-output-proof, and scope-isolation invariants. Moving,
  restoring, purging, or deleting bytes cannot release a page, establish
  safety, rewrite a placement, or prove external forgetting. Existing generic
  media rows, filename-bearing serializers, mutable provider objects, and raw
  public URLs are not grandfathered as D9 assets or evidence.
  D14 may select only the exact current D9-certified social derivative and
  contextual placement text pinned by its release coverage. Phase 29 owns byte
  custody and processing evidence, not search eligibility, share presentation,
  permalink posture, external cache state, or completed-sharing truth.
  D25 editorial prose, semantic versions, and the bounded recovery buffer remain
  private Payload content; Phase 29 gains no editorial-text family,
  actionability, retention-policy, or scratch-cleanup authority from D25.

**Boundaries & guardrails.** Storage providers hold bytes only. Phase 29 owns
generic storage-object metadata, signed access, and access audit; the source
domain owns business meaning, versions/currentness, relationships,
authorization purpose, legal status, and retention policy. No direct-to-bucket
access from clients outside the signed flow, and filenames/folders never
define domain truth.

<a id="phase-30"></a>

## Phase 30 — imports-migration

- **Import wizard** to the 2026 embedded-importer bar (Flatfile/OneSchema/
  Dromo): CSV/XLSX upload, deterministic mapping suggestions with
  tenant-confirmed remembered mappings, template generation from the live
  field catalog, in-grid validation with bulk fix-up, annotated error
  downloads. A later AI enhancement must use Phase 40's suggestion ledger,
  classification, evidence, and human-commit contract; imported PII never
  leaves its governed boundary merely to improve mapping. Build-vs-embed is
  decided at grooming.
- **Dry-run/preview**: exactly what would be created/updated/skipped/merged,
  per-row detail, before anything commits.
- **Dedupe everywhere, consistently**: matching rules (exact/fuzzy per
  field) separated from duplicate actions (block/warn/queue); a
  match-confidence review queue (auto-merge high band only, human review
  middle band) — the **same rules firing across UI entry, API writes, and
  bulk import** (Salesforce's Data-Loader-bypasses-rules inconsistency is
  the named anti-pattern), reusing the Phase 4 merge contract and Phase 9
  duplicate surfaces.
- **Stable external/source IDs** on all importable records: re-import
  updates instead of duplicating; cross-system reconciliation. Every imported
  financial root also pins exact Tenant, Legal Entity, currency, source
  system, and stable external ID. None is inferred from Site, provider, or a
  default entity.
- **Provenance + rollback**: every import batch tagged on created/updated
  records; time-boxed batch undo with before-image capture only while no
  immutable downstream coverage exists. If an issued document, fulfillment
  application, Field Account entry, Accounting Release, provider operation,
  or external transfer covers a fact, undo is blocked and the owning domain's
  append-only successor/correction path applies, including Phase 20
  compensation where applicable. The undo-after-merge hazard (Planning Center
  documents it deleting real people) is explicitly blocked.
- **Background processing** via Inngest: chunked, progress-reported,
  row-level failure isolation, resumable; **batch-origin event suppression**
  (an import must not fan out ten thousand automation emails).
- **Owner-domain import adapters**: parties, relationships, historic gifts,
  commitments, custom fields/entities, files, and content activate only after
  the target phase and its typed import command exist; Phase 30 never defines
  a target domain's schema or bypasses its invariants. Source-authoritative
  Field Account opening/history and expense records, if supported, enter only
  through owner-domain commands. For Phase 21 D17, Phase 29 owns private byte
  identity, storage/access, malware hygiene, and access audit. Phase 30 owns
  import-session/upload UX and transport, replaceable parsing, mapping
  mechanics, chunked resumable staging, and review mechanics only. Phase 21
  owns source precedence and mapping admissibility, the complete Tenant × Legal Entity ×
  ISO-currency cohort, exact-history certification, five-way coverage
  disposition, residual Opening Position, conservation, independently live
  coverage carry-forward, first-close predecessor cursor, manifest,
  activation, and correction. General fuzzy matching or auto-merge is forbidden
  for Phase 21 D17 financial identity. A Phase 30 import `commit`, `complete`, or `undo`
  state never implies Field Account activation, and imported exact or reference
  history remains side-effect-dark. An import never writes a balance scalar or
  replays historic Accounting Releases into QBO/Xero. Adoption of prior
  accounting history obeys Phase 20 D17's
  source-family-specific Posting Ownership Cutover: exact half-open ownership
  intervals, a source-complete coverage manifest, preserved previous-owner
  evidence, and optional gap-only backfill for proved-unposted work—never
  dual-write, fuzzy adoption, or whole-backlog replay. Phase 20 and Phase 21
  boundaries remain independently authoritative even when intentionally
  aligned.
- **D28 cumulative-travel adoption remains owner-controlled**: Phase 30 may
  provide a downloadable opaque-ID template, private upload session, parsing,
  mapping, chunked resumable staging, row validation, and correction-file
  mechanics for a large opening census. Phase 21 alone defines qualifying
  quantity, source period/unit/pool/group semantics, evidence class, opening and
  continuity dispositions, complete Admission Manifest, first-use CAS,
  correction, and external fallback. A Phase 30 dry run, commit, complete, or
  undo state cannot prove opening zero or prospective completeness, activate
  native D18 calculation, fabricate predecessor claims, or alter an admitted
  cumulative pool.
- **Operational source ingestion remains owner-domain work**: recurring intake
  of one operational source artifact under a fixed, certified source contract—
  including Phase 21 organization-card activity under D14—is owned by that
  source domain, not by this general migration workbench. Phase 30 may not
  reinterpret, heuristically deduplicate, destructively undo, replay, or bypass
  Phase 21 card evidence, manifest, assignment, coverage, correction, or
  approval invariants.
- **The SiteStacker migration kit as a named deliverable**: field-catalog
  bootstrap from a SiteStacker entity export, mapping presets for its basic
  CRM fields, donations/pledges/relationship import order, and
  **reconciliation reports** with record counts and Legal-Entity-partitioned,
  per-currency control totals proving migration fidelity. Unlike currencies
  are never summed into one “dollar total.” Migration friction is
  SiteStacker's moat; this is the battering ram.

**Boundaries & guardrails.** Imports write through each owning domain's typed
service (authorization, validation, consent, dedupe, classification,
idempotency, and audit) — never raw table loads. Historic-giving imports never
mint receipts for pre-platform gifts. The Phase 21 D8 outbound continuity feed
and every Phase 31 resnapshot/reset are not imports or migrations. A resnapshot
rebuilds only the recipient-scoped export projection and delivery cursor from
current source-authoritative versions; it never writes Phase 14, 16, 21, or 28
truth, destructively merges records, or erases or claims deletion of
provider-owned work.

Phase 21 D26 outbound records archives, offboarding retrieval, browser
downloads, and custody delivery are not imports or migration transport. Phase
30 may provide no outbound destination adapter, package staging, transfer
claim, or disposition authority; any optional certified external destination
uses Phase 31 while Phase 29 retains byte custody and Phase 21 retains package
meaning.

<a id="phase-31"></a>

## Phase 31 — platform-api

- **Versioned REST API**: date-pinned versions per tenant/token (the Stripe
  model — additive changes safe, per-request override header, isolated
  downgrade transforms), OpenAPI spec + generated docs from day one,
  published deprecation policy.
- **AuthN/Z**: OAuth2 client-credentials for org integrations +
  fine-grained expiring PATs (GitHub model: resource- and
  permission-scoped, last-used tracking, org policy controls); everything
  resolves through the same Phase 12 capability evaluator used by first-party
  surfaces rather than a parallel access model, then through Phase 3
  projections — **external consumers get governed projections and events,
  never raw tables**; Phase 10 classification is enforced in serialization.
- **Rate limiting**: per-tenant and per-token token buckets, 429 +
  Retry-After + limit headers, separate read/write buckets.
- **Webhooks to the Standard Webhooks spec**: HMAC-SHA256 signing
  (id.timestamp.payload), replay windows, a qualified bounded retry schedule,
  per-endpoint event-type filtering, auto-disable on sustained failure,
  delivery logs + manual replay, secret rotation. (Svix-hosted vs
  Inngest-backed delivery decided at grooming.)
- **Event contract registry**: typed, versioned, thin-to-medium payloads in
  a consistent envelope (CloudEvents-style id/source/type/time), published
  catalog with compatibility guarantees.
- **Connector registry** in Mission Control: installed integrations per
  tenant, provider links (generalizing `crm_record_links` — this phase
  co-owns the Phase 9 External-IDs socket with imports), granted scopes,
  connection health, last sync/delivery status, enable/disable, full audit.
  Embedded-iPaaS primitives (Nango-style managed OAuth) evaluated
  build-vs-buy.
- **API/audit trail** queryable by tenant admins; sensitive-field access
  flagged.
- **First concrete feed consumer**: Phase 21 D8's recipient-scoped Missionary
  Support Feed Projection. Phase 21 owns the Missionary Support Activity and
  Support Balances source projections plus their finance-safe external field
  floor; Phase 14 and Phase 16 retain supporter and commitment truth; Phase 28
  contributes relationship/contactability only after a separate ratified
  purpose contract. The feed subject is one exact Support Assignment, not a
  Party participant, household, relationship, or access grant. Phase 31 owns
  the recipient-scoped composite, complete
  scoped snapshot, monotonic change cursor, reset/resnapshot protocol, signed
  reconciliation hints where certified, provider mappings, and delivery
  evidence. Later candidates include read-only Phase 20 accounting evidence
  where explicitly authorized and church-management syncs. Phase 20 remains
  the only Stripe/QBO/Xero authorization, delivery, and recovery doorway;
  Phase 31 must not generalize that provider-specific financial authority into
  a second connector. Financial projections carry explicit Legal Entity,
  currency, source, and as-of semantics and never expose provider credentials.
- **Optional future Public Ministry measurement adapter**: Phase 22 D15 owns
  only its suppression-safe aggregate facts and local report. Phase 31 may later
  certify one external analytics mapping/egress lane only after exact purpose,
  fields, consent or objection posture, provider, region, retention, deletion,
  and observed-versus-modeled behavior are proved. It may never export D15's
  transient occurrences, identifiers, raw request data, replay, or a generic
  tenant-authored event payload and cannot reinterpret external results as
  people, shares, conversions, gifts, attribution, settlement, or payment.
- **Optional D26 records destination**: only after D26's complete browser lane
  exists, Phase 31 may certify a tenant-owned storage destination using
  provider-native authorization, exact destination identity, least privilege,
  package-manifest write and readback, integrity, ambiguity-safe retry, drift,
  revocation, residency, preserved holds/restrictions, and exit behavior.
  Phase 21 owns package and custody semantics; Phase 29 owns staged bytes;
  Phase 31 owns connection and transport evidence. There is no launch-time
  Drive/Dropbox/Box/SharePoint/S3/SFTP marketplace, raw-key flow, or claim that
  upload acceptance proves durable custody.

**Boundaries & guardrails.** Connectors cannot bypass permissions or
source-of-truth rules. A feed exports governed projections and stable
references; it does not create another contribution ledger, Field Account
subledger, accounting release, or final reconciliation. A reset or resnapshot
can replace only disposable Phase 31 projection/delivery state; it cannot write
an owning source, erase provider-owned records, or claim downstream deletion.
The external Phase 31 contract is REST/webhooks; existing authorized
first-party GraphQL adapters remain valid. Tenant-authored server-side
scripting and a third-party app marketplace remain outside this phase. Don't hand-roll the importer grid, webhook delivery, and
connector OAuth simultaneously (each is a whole company's product — the
build-vs-buy triage is a grooming deliverable).

<a id="phase-33"></a>

## Phase 33 — reporting-bi

- **Standard report library**: giving (by donor/fund/campaign/source),
  named Phase 16 commitment/occurrence health, contribution-inactivity
  segments, church/org giving, missionary support progress, Field Account
  activity/balances by explicit currency, expense operations, batch/deposit,
  Accounting Release evidence, and statement runs — each permission-aware and
  exportable; enumerated against SiteStacker's catalog at grooming. Reports do
  not turn an attention state into a person-level “lapsed” label.
- **Semantic layer** (the architecture keystone): metrics, dimensions,
  joins, and access rules defined once, tenant + role security compiled
  into every emitted query (the Cube-core pattern; build-vs-adopt at
  grooming) — dashboards, scheduled runs, exports, **and any future AI
  (40)** consume the same governed definitions. Embedded per-seat BI
  (Metabase-class) is ruled out by economics for donor-scale viewers;
  the UI is ours (shadcn + TanStack Table over the semantic layer).
- **Custom report builder** (second): constrained field pickers over the
  semantic layer, custom fields included (11), saved reports with
  visibility scoping (reusing the Phase 9 saved-view machinery).
- **Scheduled reports**: Phase 33 owns the schedule, report snapshot, recipient
  eligibility, and purpose; Phase 17 owns and prepares the governed message,
  while Phase 6 dispatches and records it with Resend as transport only.
  **Permissions are
  evaluated per recipient at generation time** (QuickSight pattern), with
  delivery history.
- **Report permissions as their own model** (create vs save vs schedule vs
  send — the Salesforce lesson), on Phase 12 capabilities.
- **Read models**: reconciled, documented read models/rollups where live
  OLTP queries can't serve (decided per report; no shadow warehouse in v1).

**Boundaries & guardrails.** Reports read source truth + approved read
models; they never own records. Exports obey Phase 3 + Phase 10 policy
(classification-aware columns). Comparisons must state the exact source,
version, Legal Entity, recognition/posting basis, currency, and as-of time;
contribution, Field Account, processor-payout, Bank Match, and Accounting
Release values are not blended into one authoritative total. Numbers must
agree with finance surfaces (19/20/21) when comparing like-for-like facts,
but Phase 33 never becomes final bank or QBO/Xero reconciliation.

A Phase 33 report export is a current governed analytical projection, not a
Phase 21 D26 Records Export Package, records-retention artifact, offboarding
archive, or custody transfer. Report filters and scheduled runs never define
archival completeness, source-family watermarks, original-byte coverage,
retention, hold, or disposition.

Phase 33 conversions, custom metrics, report filters, materialized read models,
or dashboards never become a Phase 22 D6 public-progress source, denominator,
automatic fallback, or authoritative converted total. Phase 22 consumes only
the exact source-owned Phase 13, Phase 16, and Phase 28 contracts ratified by D6.

<a id="phase-34"></a>

## Phase 34 — workflow-engine

**Cross-phase Tasks Hub and authorization compatibility.** These clauses retain
Phase 24 decision-log D31–D55 cross-phase evidence and the owning Phase 12,
17 and 21 contracts. They do not reopen Phase 24's frozen D1–D18/D57–D84
implementation scope. D56 and all stated activation gates remain unresolved.

When a Phase 34 workflow action
appears in the shared Tasks Hub, the workflow run/stage/task record remains its
authoritative source. A control such as **Complete interview review** must be
the exact Phase 41 application-owner command with current role, evidence, consequence, and
expected-head checks; only its successful source receipt closes the projected
task. A generic Tasks Hub checkbox, task status, notification read, timer, or
Inngest run cannot advance a workflow. A separately defined human follow-up
may use task-owned completion only when it is not the workflow source action or
stage-transition truth.

Any future Phase 34 responsibility change shown in Tasks Hub must likewise be
the exact source-owned D33-style command: resolve only currently eligible
destinations, re-prove actor/target/scopes/heads at commit, append an immutable
successor generation/receipt, preserve continuing engagement, and distinguish
named handoff from no-successor return/Needs assignment. Tasks Hub cannot edit
a generic assignee, and Website eligibility/routes are not copied into
Mobilize. A broader workflow delegation, queue, acceptance, availability, or
bulk-transfer product requires a source-scoped decision and evidence: Phase 34
for common coordination and Phase 41 for application responsibility.

If a future Mobilize source-return genuinely needs actor-selected recovery
context, it may reuse D34's source-owned envelope only after its own evidence-
backed decision defines the exact trigger, closed vocabulary, recovery use,
visibility, retention, authorization, and non-effects. Tasks Hub never copies
or interprets the Website v1 codes, and Mobilize never inherits them from a
task title, policy kind, source link, or module name. Inngest receives only the
source-transition identifier and remains projection/reconciliation execution,
not context or routing authority.

D35 contributes only reusable mechanics: an authoritative source-owned
ownerless-work lane, a versioned bounded responsibility-intent route, complete/
zero/indeterminate recipient resolution, one shared task identity with personal
assignment/engagement, source receipts, identifier-only outbox, and monotonic
reconciliation. Phase 34 and Phase 41 Mobilize inherit no Website policy mode, member,
Site behavior, label, D34 code, action capability, eligibility predicate, or
default audience. A future source must separately prove its ownerless-work
state, lane, recovery action, audience, visibility, retention, channels, and
policy. Inngest remains optional execution and never becomes workflow,
responsibility, authorization, lane, or idempotency truth.

D36 contributes reusable prospective-cutover and explicit-current-adoption
mechanics only: a separately authorized permission-safe impact, immutable
product-owned application/cohort/result ledger, per-source-occurrence atomic
differential routing, continuing engagement, durable replay, and resumable
status. Phase 34 does not inherit D36’s Website cohort, policy, members, task
role, result copy, no-Site-override decision, or current-work capability. A
future Phase 34 source must define whether policy changes are prospective,
whether existing work may be adopted, the exact cohort/authority/privacy
boundary, and truthful correction/rollback behavior. Inngest may page accepted
identifier-only members but never defines or authorizes the adoption.

D37 fixes the Website-specific D36 cohort as the complete compatible
pre-cutover Tenant set proved from authoritative source occurrence heads and a
closed code-owned producer/version catalog. Preparation has no effect; unknown
completeness blocks confirmation; an atomic normalized seal precedes member
claims; and actor visibility, Sites, filters, tasks, recipient qualification,
and client selection never define membership. One separate Tenant-wide
application capability authorizes only the operation and exact complete
aggregate item/assignment impact required for consent, not source detail or
recipient authority. Phase 34 and Phase 41 Mobilize inherit none of D37's Website
catalog, cohort, capability, cutover, aggregate disclosure, or UI semantics.
Each future source must make its own evidence-backed cohort/privacy/action
decision; optional Inngest remains identifier-only execution.

D38 makes the D37 action one zero-by-default, `explicit_only` Phase 12
capability. Grant administration is separate from possession and requires a
current same-Tenant `permissions.manage_grants` decision within live scope and
ceiling. Owner/Admin/staff/Web Studio/policy/Site/source/coordinator/task/
support state never implies it; grants bind the Active Tenant Assignment; and
current EffectiveAccess owns deduplicated holder/provenance truth. Zero holders
leaves prospective policy and Needs assignment complete and creates no task,
notification, reminder, or fallback.

Revocation, expiry, assignment end, suspension, or applicable delegation end
makes the affected source inert and fences later uncommitted D37 effects only
when final post-change EffectiveAccess no longer contains D38, without
rewriting committed source/task history.
The Phase 12 People & access/My Access product owns grant/revoke UX; Website,
Tasks Hub, Phase 34, Phase 41 Mobilize, and Inngest own no grant roster or authorization
shortcut and inherit no D38 atom automatically.

D39 permits both a typed direct assignment-capability grant for a specific
active staff assignment and a governed flat **Access group** grant for a stable
job function through the one Phase 12 EffectiveAccess/provenance/epoch model.
Both are optional, additive, deduplicated sources; every human edge binds an
exact same-Tenant Active Tenant Assignment, and group assignment is one
relationship rather than per-member fanout. No Website group, seeded holder,
Team/task/coordinator/Mobilize mapping, external/dynamic/nested membership, or
Inngest authority is introduced.

A group carrying D38 is protected authorization state. Group capability
changes require `permissions.manage_grants` within a live assignable-capability
ceiling; member add/activation separately requires exact scoped
`permissions.manage_membership` with a live ceiling covering the complete group
bundle and revision. Ordinary Team ownership and self-membership cannot create
authority. Any Phase 34 or Mobilize use of groups must make its own domain
decision and may reuse only this central authorization primitive—not Website's
D38 capability, group, membership, or UX semantics.

D40 permits one deliberately reviewed **separate direct grant** while an exact
staff assignment already receives D38 through current group paths. The person-
access surface shows every current source first and states that present ability
is unchanged while future survival changes. It requires a fresh minimized
reason, explicit unpreselected independent duration, current grant authority/
ceiling and self/SoD/quorum checks, and a complete current group-source-set
proof.

The command reuses D39's typed direct relation. It records immutable overlap-
creation provenance in audit/receipt evidence, advances the Tenant epoch once,
and creates no backup table, new permission kind, source priority, automatic
handoff/cleanup, notification, task, or Inngest authority. Relevant source
change before commit conflicts; later group loss leaves the independent direct
source current. Final EffectiveAccess loss alone fences D37. Phase 34 and
Mobilize inherit none of this Website capability or creation UX.

D41 keeps current source truth distinct from historical origin after the final
group path ends. Current People & access and My Access presentation says
**Direct grant** or **Granted directly to you** with the direct source's own end
condition. Authorized expanded **Why this person has access** / **Why you have
access** provenance retains
**Added for continuity**, the immutable event-time overlap evidence, and later
source history according to D42's viewer/purpose policy. Ending or
returning a group path changes the current source list through Phase 12's
existing epoch but never converts, reissues, retags, or renews the direct grant;
if optional history is unavailable, canonical current access remains truthful.
Operational search/export classifies the source as direct, and no current
continuity badge, shadow state, conversion worker, task, notification,
recertification timer, staff score, or Inngest authority is introduced.

D42 admits four server-derived Phase 12 history projections only:
`access.self_explanation`, `access.membership_change_review`,
`access.grant_governance`, and `access.security_audit`. The holder receives the
safe **Added for continuity · [date]** explanation; membership review receives
only the surviving direct source/end; exact grant governance receives only
floor-permitted minimized evidence; and full typed authorization evidence
requires current `permissions.audit.read`. Bulk audit export additionally
requires `permissions.audit.export`. A withheld event-time source label renders
**Protected access group**; protected reason/actor values are omitted. One
request uses one purpose and exact Active Tenant Assignment, never a multi-hat
or role union. Raw/browser, support/service, task/notification, ordinary
Website/reporting, analytics, AI, cache, and current-access export paths receive
no continuity fields. D42 changes no grant, task, workflow, or current-access
truth; D43 alone decides the holder's safe correction action.

D43 gives the exact current subject of one D40 continuity-created direct source
one quiet **Ask for an access review** action. The current source/end remains
first; an inline Base Maia/Base UI form asks only **Why should this access be
reviewed?**, requires trimmed 1–500-code-point protected plain text, warns
against private personal/ministry/donor/care/security/location detail, and says
submission does not change access. A committed result persists as **Review
requested. Your access has not changed.** The subject may withdraw while
pending. Current access and request history remain separate: a subject-only
**My access requests** section retains safe outcomes after a removed or expired
source disappears from current access.

D43 reuses one typed Phase 12 `permission_change_request` kind,
`holder_direct_grant_review`, contract version 1. It creates no Website-local
request table or generic workflow. One exact Tenant/assignment/direct source has
at most one `pending_review` episode; terminal states are `withdrawn`,
`resolved_kept`, `resolved_removed`, or `no_longer_applicable`. Same-Tenant
composite keys, immutable event/receipt history, state constraints, semantic
idempotency, current-head compare-and-swap, forced RLS, hardened command
boundaries, and privileged-path parity prevent retargeting, duplicate terminal
outcomes, and caller-controlled attribution. Protected request/decision text is
never copied to tasks, notifications, email, logs, search, analytics, AI,
Realtime, or ordinary export.

The permission-filtered Phase 12 **Access requests** source lane displays D43
as **Review current access**; periodic **Access reviews** remains the separate
recertification-campaign area. Actionable lane rows, personal-recipient
eligibility, and both decisions require current exact-scope
`permissions.manage_grants` authority within the live ceiling plus existing
Phase 12 floor/self/SoD/quorum/last-authority controls. D42 audit/review-read
authority, role names, the original grantor, a task, notification, support, or
deep link grants nothing.

Review reloads current sources and the D37/post-removal consequence. **Keep
direct access** requires a fresh holder-safe explanation and changes no grant or
epoch. **Remove direct access** asks for no duplicate prose and invokes the one
locked Phase 12 grant-state command; exact source end, request outcome, audit,
receipt, one epoch advance, and identifier-only projection intent commit
atomically. Other sources remain independent, and the holder is told whether
access survives another way. If the source ends first, the request becomes
non-actionable and converges to `no_longer_applicable`, shown as **Direct access
ended before review**.

Each pending D43 request is one ADR-0183 source-work occurrence. Phase 12 owns
request status/actionability/decision/closure; Tasks Hub may later present one
shared task identity with recipient engagement only after D44, and every generic
task mutation rejects. The **Access requests** lane and holder history work with
no personal route or Tasks Hub. Optional Inngest execution is identifier-only,
post-commit, fire-time-reauthorized projection/reconciliation; it owns no human
wait, request, reviewer, access, decision, idempotency, or completion. D44 alone
decides optional personal routing among already-authorized grant managers.

D44 keeps that source lane complete and adds one optional Tenant route for D43
personal responsibility. A Tenant deliberately chooses **Use the shared Access
requests lane only** or one to three unique, unordered, co-equal current Active
Tenant Assignments as **Access request coordinators**. A new selection must
currently qualify for D43 grant-decision work in at least one live Tenant scope;
every exact request then independently narrows that configured set. Selection
grants no permission or decision authority; every request re-proves current
`permissions.manage_grants`, ceiling, floor, scope, assignment, and
requester exclusion. Complete zero or indeterminate resolution routes nobody
and never broadcasts or guesses a fallback.

The compact policy summary lives in **People & access → Access requests**, with
one responsive Base Maia Sheet, a progressive server-filtered picker, and a
fresh aggregate consequence review before save. A confirmed immutable policy
revision applies to all current and future pending requests. Continuing
recipients preserve engagement, newly admitted recipients receive fresh
personal responsibility, removed recipients end as **Coordinator responsibility
changed**, and an unchanged effective set creates no churn. D44 changes no
request, grant, duration, or authorization epoch.

Tasks Hub is not the only attention path. The same current Phase 12 recipient
generation drives one source-backed task assignment and one independent
ADR-0027/Phase 17 staff Notification Center projection. Newly opened requests
use `holder_access_review_requested_v1`. When a route or eligibility change
admits a coordinator to existing pending work, individual tasks still
materialize but the bell receives only one safe aggregate
`access_request_responsibility_updated_v1` item per recipient and source-owned
responsibility-application generation. That generation pins the route revision,
current eligibility/authorization basis, admission cause, and sealed child set.
Both deep-link to fresh People & access authorization and copy no
protected request, reason, grant, capability, or group detail. Task engagement,
notification engagement, channel delivery, and D43 closure remain independent.
D45 adds one optional immediate email sibling for each exact contract; the
published Tenant Delivery Plan defaults Off. One
`profile.access_governance_attention@1` family selection governs both D44
`staff_email` slots atomically; mixed per-key On/Off is invalid while each key
keeps separate semantics and rendering. The exact coordinator's
self-managed `preference.access_request_responsibility_email@1` uses the
canonical Phase 17 tuple of Tenant, Active Tenant Assignment, Party, registered
role/surface, contract family, and email channel and is `inherit | disabled`:
absence/`inherit` follows deliberate Tenant On, `disabled` narrows
it, and neither can broaden Tenant Off. Email requires all
current source, recipient, authorization, contactability/suppression,
locale/publication, sender/reply, Tenant Resend, and dispatch proof. Failure or
absence sends nothing and leaves source, task, and required in-product attention
unchanged. Widening is future-only; current narrowing suppresses any not-yet-
submitted optional email, while accepted mail is non-retractable. The generic email has one authenticated
People & access link and no protected source/grant detail, inline decision,
secret URL, attachment, or tracking. New work is at most one email per admitted
recipient generation; a current-work route application is at most one grouped
email per recipient/application generation, never one per child request.

Tenant delivery configuration stays in the Phase 17 System Messages Delivery
Plan; the D44 coordinator card shows only a quiet delivery summary/link. A
coordinator manages only their own preference under **Settings →
Notifications**, with required in-product shown as always on, email truthfully
shown as following the current organization setting unless the recipient turns
it off, explicit **Save changes**, persistent future-only status, and truthful
Tenant-disabled/unready states. Tenant administrators cannot inspect, edit, or
override another person's opt-out. Unavailable future channels are not placeholder switches.
Push, Slack, Teams, Google Chat, SMS, reminders, digests, and escalation each
require an independent source/channel contract and proof; there is no generic
channel array or rule DSL. D46 records no automatic reminder while D43 has no
source-owned due instant, expiry, risk transition, SLA, or other ratified
temporal requirement. D47 permits a bounded candidate to become evidence-
qualified and a separately activated, Tenant-default-Off profile to become a
Phase 12 source policy for at most
one courtesy occurrence without Due/Overdue, SLA, escalation, no-response, or
access meaning; it activates no policy or reminder now.
Accordingly this phase adds no reminder key, row, field, timer, schedule,
Inngest sleep, Tenant setting, or placeholder UI; elapsed age is not an implied
deadline or urgency signal. A future reminder remains compatible only through a
separately ratified Phase 12 temporal occurrence with exact time/calendar,
semantic identity, cancellation/supersession, recipient, authorization,
durable-idempotency, late-usefulness, and recovery rules. Optional Inngest may execute
identifier-only claims/reconciliation but never owns the route, recipient,
preference, task, notification, request, provider identity, authorization,
idempotency, reminder time, cancellation, or outcome.

If later activated after clock and channel decisions, the cadence policy stays
separate from the D44 coordinator policy and Phase 17 Delivery Plan. It uses
only code-owned bounded choices and never creates a second Tasks Hub task.
D48 now fixes first application: the first successful non-Off policy boundary
and genuine D43 request creation share one Phase 12 source order, and only a
creation ordered after that boundary may atomically retain cadence admission.
Existing requests never enter through age, timestamp comparison, current policy
join, task/notification state, migration, replay, restore, or Apply-current.
Ordinary absence/Off is expected exclusion; an asserted-active proof failure
safely records no admission without blocking the valid D43 request. Exact
committed replay preserves the original result.

D49 now binds each one possible source occurrence atomically to the complete
exact then-current D44 responsibility generation for that request. Each sealed
member carries the exact D44 recipient-generation identity plus Active Tenant
Assignment; a concurrent route change yields the complete old or new set, and
the same ordering works when the optional D44 row is absent. Proved zero is a
terminal empty cohort. Indeterminate leaves the same occurrence unreleased with
append-only attempt evidence and may retry to one terminal result; it never
releases a partial set or fallback. After sealing, only a gap-free D44
continuation may retain a member and every source/channel effect may only narrow
its relevant subset—later additions, restored eligibility, remove-then-readd,
and recreated assignments cannot join. No reminder task is created.

D50 now selects one immutable request-anchored elapsed eligibility instant. A
fresh trusted database source-created instant is captured exactly once after
D48's serialized policy winner is proved and becomes authoritative only with
the successful D43 source transaction. The exact admitted duration identity/
revision and bounded whole elapsed seconds derive one finite absolute UTC not-
before instant. A later approved “day” is exactly 86,400 seconds; civil/
working-day arithmetic, PostgreSQL day/month interval fields, Tenant/session
zones, DST, weekends, holidays, D44 changes, tasks, providers, and executors do
not move it. Early workers do nothing; late workers attempt the same occurrence
subject to later cancellation/usefulness, and D49 seals the then-current cohort
at the actual successful seal commit. Source-created, eligible, seal,
presentation, submission, and delivery times remain distinct; not-before is no
Due/Overdue state or send promise. No D50 runtime/schema/UI/OpenSpec artifact is
added.

Phase 24 D51 now makes cadence Off an immediate source-fenced narrowing. A
successful Active-to-Off publication advances a separate monotonic cancellation
epoch in one O(1) Phase 12 commit. D48 admissions pin the epoch; non-Off edits do
not advance it, and re-enable retains it, so old D50 timing remains stable while
fenced work never resumes or catches up. D49 seal and every registered
irreversible descendant admission re-prove the epoch. Off-first prevents the
boundary; boundary-first preserves truthful history. For local presentation the
boundary is atomic queryable release, not read. For the currently governed
email step it is Phase 6's provider-submission attempt fence before external
I/O, not provider acceptance; after Off, existing ambiguous/provider evidence
may reconcile but no further provider call or false recall is permitted. Each
future channel must separately register and prove its own product-owned
boundary and finality semantics.

Off creates no request/task/access mutation, cancellation task/notification,
unread reset, current-work census/count, or synchronous fanout. The later
complete Base Maia editor uses a local draft and one inline consequence review
with **Turn off courtesy reminders** and **Cancel**, not an autosaving switch,
nested dialog, typed phrase, protected impact list, or provider-status UI. D51
adds no runtime/schema/UI/OpenSpec artifact.

Phase 24 D52 now makes late usefulness one finite source-owned admission
interval rather than a scheduler/provider retry rule. Every later activated
complete timing profile pairs positive finite whole-second wait and
usefulness values; D48/D50 pin them and derive immutable finite UTC
`not_before` and `useful_until` in the successful D43 source transaction. D49
seal and each still-unreleased member/channel irreversible admission require a
fresh trusted primary-database claim inside the half-open interval
`not_before <= claim_instant < useful_until`, the matching D51 epoch, and every
current source, member, authorization, privacy, and channel gate. Equality at
the upper bound expires the work.

Expiry closes unresolved work without release, replacement, or catch-up. D49
indeterminate remains historical indeterminate rather than guessed zero; a
sealed cohort remains history while every unreleased descendant expires
independently. A local item released in time follows ADR-0027 and D43
actionability rather than disappearing at `useful_until`. Email still
**Prepared definitely unsubmitted** is suppressed; a pre-expiry **Submission
may have begun** attempt's one admitted initial provider call may start, finish,
or reconcile later only as the immediate bounded continuation of the same pre-
I/O critical section with its envelope already prepared; a stalled/restarted
process makes no call or retry. Expiry allows no new attempt, follow-up call,
replacement, rekey, resend, or recall claim. Provider TTL
may only narrow delivery. Inngest may wake/reconcile identifiers but owns no
clock, source transition, idempotency, or terminal result.

The future editor adds no separate grace-period control, expiry countdown,
Due/Overdue or missed badge, task date, catch-up action, provider/worker status,
or cancellation notification. Each visible cadence card is one complete timing
profile and says **If Asym cannot create the reminder soon enough, it skips it
instead of sending it late.** D52 changes no request, task, access, read state,
or historical effect and adds no runtime/schema/UI/OpenSpec artifact. D53 and
D47's representative-evidence gate must admit exact complete timing pairs
before activation.

Phase 24 D53 keeps cadence **Off by normative absence** until each exact
complete `(wait_for_seconds, useful_for_seconds)` pair passes D47's
preregistered representative-evidence gate. A passing result creates only an
evidence-qualified proposal for founder/product ratification; it creates no
runtime profile, key, row, flag, policy, plan, step, worker, setting,
placeholder, or evidence workflow. Evidence stays privacy-minimized and
version-controlled outside product runtime. Each exact pair qualifies under an
immutable `research_candidate_id` and preregistered protocol version, while
compatible current baseline evidence may be reused. Material timing or
semantic/interaction changes require new qualification; meaning-preserving
editorial, accessibility, and localization corrections do not.

Only a separate full activation package that closes D46–D55 source semantics,
stable content and every proposed channel, authorization/RLS/privacy,
retention, accessibility/localization, concurrency/idempotency, load,
migration/mixed-version, disable/repair, OpenSpec, manifest, tests, and release
proof may add an immutable code-owned activated profile identity and
exact whole-second pair. Tenant policy references an activated identity only;
trusted server code resolves timing. Tenant rows, callers, imports, support
tools, workers, providers, and experiments cannot author or mutate values.
Temporary rollout/kill controls may narrow only after activation and require an
owner and removal criteria; they cannot become product truth.

Ordinary profile retirement blocks new policy selection/reselection only; a
Tenant's current selected head continues prospective D43 source admission until
deliberate change. D55 now makes urgent safety withdrawal one irreversible exact-
profile platform disposition that preserves selected heads while effective
cadence becomes Off. D56 must still ratify its authority/evidence-review rule
before first activation.

Before activation, users see no cadence UI, empty state, disabled option, beta
badge, or teaser. After activation, the D44/D47-governed future route-addressable
**People & access → Access requests → Settings** surface shows one quiet vertical **Courtesy reminders** radio fieldset with
only the Tenant's current effective Off choice—whether represented by absence
or an explicit later policy revision—and fully activated complete profiles. A retired profile is
absent from new choices and new selection APIs but remains truthfully visible in
a separate read-only **Current setting** summary outside the selectable radio
choices wherever a Tenant's policy head still references it. One choice represents the full pair. Concise helper text explains that one
courtesy reminder may be created only while a request is still waiting, sets
no due date or access change, and is skipped if too late. An available,
collapsed-by-default **How timing works** disclosure contains the D48–D52 detail
and renders the selected pair in plain language: **Eligible after [wait]; if it
cannot be created within the next [usefulness], it is skipped.** It never shows
internal field names. The governed explicit
Save/Cancel, prospective-change warning, expected-head conflict handling,
durable receipt, persistent success, and lost-response recovery apply. No
autosave, modal-only warning, arbitrary duration, second usefulness control,
countdown, evidence score, or provider state appears.

Later decisions must still define external channels, remaining content,
withdrawal authority/evidence review, and activation/rollback;
exact bounded values remain deliberately unselected until candidate research
qualifies a pair under D47/D53. Future UX belongs in the D44/D47-governed People & access
→ Access requests governance area. First enable, non-Off interval edits,
and re-enable use **Applies only to access review requests created after you
save. Requests already waiting aren't included. This doesn't set a due date or
change access.** Selecting Off instead uses D51's current-and-future inline
consequence review and **Turn off courtesy reminders** action. Its recipient
summary is **Recipients** / **Access request
coordinators responsible when the reminder occurs.** Later changes may stop
delivery but never redirect that occurrence; if nobody qualifies, the request
stays in Access requests. It performs no current-request census, recipient
picker, or roster preview and exposes no channel matrix,
custom calendar, recurrence builder, backlog action, or phantom control before
activation. The future timing summary is **After the request has been waiting
for [selected interval]**; the required available **How timing works** disclosure explains that
timing starts at new request creation, runs continuously including weekends,
is not restarted by time-zone or coordinator changes, and exposes the selected
complete wait/usefulness effect in plain language. Ordinary staff see no
countdown, promised send time, worker status, or internal clock terminology.

Phase 24 D54 selects one distinct required in-product reminder item per exact
still-qualified D49 sealed member after full activation. It means only that the
same current access review is still waiting at the admitted courtesy point; it
is not a resend, deadline, escalation, awareness claim, decision, access change,
or task mutation. The activation generation assigns/registers its stable key and
reminder-specific source-end rule; D54 names/reserves neither and adds no current
artifact.

An eligible matching `holder_access_review_requested_v1` child and the reminder
use one deterministic, rebuildable **Access-review attention group** for the
same Tenant, exact D43 episode, recipient, role/surface/privacy boundary, and
uninterrupted D44 responsibility lineage. The multi-request
`access_request_responsibility_updated_v1` aggregate never joins. When no
eligible initial child exists, the reminder is a complete one-child group and no
history is fabricated or backfilled. Each child keeps its own occurrence,
applicability, engagement, and history. Only the new child receives fresh unread
state; the group owns no engagement/source/task/access truth and contributes at
most one derived badge count.

Future release is one atomic D43/D48/D49/D51/D52/current authorization/privacy/
uniqueness/group-attachment decision. D43 resolution ends applicable children
under their own rules; D51 Off after release ends only reminder active/unread
contribution, and D52 bounds first release rather than history. The future item
uses ordinary **Attention**, the Phase 17 source-actionable presentation policy,
safe **Access review is still waiting** copy, and one reauthorized People &
access action. It contains no person, reason, capability, grant/provenance,
authority, decision, location, ministry, or member-care detail and creates no
second task.

The Notification Center reuses Phase 17 and Base Maia/Base UI, with visually and
programmatically equivalent grouping/order, semantic list/heading/disclosure
structure, independent unread states, quiet arrival, and keyboard, screen-
reader, forced-color, reflow/zoom, localization/RTL/CJK, mobile, and low-
bandwidth proof. It does not copy the hardcoded demo bell, add a generic thread/
conversation/grouping DSL, rely on avatars/color/proximity, or show inline
Keep/Remove, task controls, urgency, due/overdue, sounds, focus theft, or toast-
only history.

D45's initial-email family plan is not inherited. Local reminder presentation
is required; every external reminder channel remains absent/not-applicable until
separately admitted. D54 changes no runtime, key, manifest/census count, profile,
plan, step, schema/RLS, OpenSpec, route, worker, telemetry, or UI now. Current
counts remain 20 Target Live candidates and 20 Reserved keys.

Phase 24 D55 preserves Tenant intent while making one unsafe timing-profile
revision terminally non-executable. One append-only, irreversible, exact-profile
platform safety withdrawal makes every Tenant reference effectively Off without
editing a Tenant head, publishing mass Off successors, selecting a fallback, or
performing a Tenant census/fanout. It is distinct from ordinary retirement,
D51 Tenant Off, provider pause, and temporary rollout/kill flags. It cannot be
cleared; recovery requires a separately evidenced/activated successor and each
Tenant's deliberate Save, with no historical catch-up.

Every selection, D43 admission, D49 seal, local release, and external
irreversible-effect boundary atomically checks current product-owned withdrawal
state. Missing/unknown/stale/mixed-version state fails closed only for reminder
effects while requests, initial attention, and tasks remain usable. Fence-first
blocks admission/release; a selection/admission that won first stays truthful but
all not-yet-irreversible descendants close safety-withdrawn/no-release. A released
local reminder loses active/unread contribution without changing its initial
sibling or source work. Definitely unsubmitted external work suppresses; an
already admitted **Submission may have begun** call only completes/reconciles
under its frozen identity and never retries, rekeys, falls back, or claims recall.

The future settings editor separates selected from effective truth. A withdrawn
selected profile appears outside choices as **Selected: [profile label]**,
**Status: Unavailable for safety**, **Effective: Off**, and **Courtesy reminders
are off. Existing access requests, tasks, and access are unchanged. This setting
will not restart.** A secondary **Choose a new setting** action opens the
ordinary choices with no replacement preselected. Cancel preserves the head;
explicit Save chooses Off or another activated profile. There is no disabled
radio, automatic substitute, internal jargon, incident detail, task,
notification, email, banner, modal, toast, or mass Tenant alert. Safe status is
accessible, localized, mobile/reflow-complete, and distinct from D42-restricted
actor/evidence detail.

D55 adds no runtime, key, profile, withdrawal row, manifest/census entry,
plan/step, schema/RLS, OpenSpec, UI, flag, worker, telemetry, or automatic
trigger. Current counts remain 20 Target Live candidates and 20 Reserved keys.

D25 ships complete without Phase 34. A later workflow may subscribe to an exact
D25 occurrence, mirror a follow-up task, and invoke only an already permitted
typed D25 or source-owner command through the authoritative service. It cannot
add causes, actions, states, SLAs, financial meanings, select a reviewer, author
claimant facts, resolve a case, satisfy a Downstream Impact Manifest, or mutate
any owner-domain truth. Timer or task completion is never case completion.

D26 also ships complete without Phase 34. A later workflow may mirror a
records-review or offboarding reminder and invoke only an independently
authorized typed Phase 21 or Phase 29 command. It cannot decide legal
applicability, author or weaken a schedule, release a hold, dispose a copy,
mark export coverage complete, record a tenant assertion as another actor, or
verify destination custody. Timer, task, or workflow completion supplies none
of those facts.

<a id="phase-35"></a>

## Phase 35 — contribution-triggers

- **Contribution event conditions** (the Spark condition set, rebuilt on
  our facts): first-time gift (global/per-campaign), amount ranges,
  online/offline entry method, anonymous, recurring first/last occurrence,
  schedule-modified, soft credit, tribute, source code, site/channel,
  affiliated person.
- **Actions**: enroll in workflow/journey, send templated message
  (consent-gated), create task (rep/missionary), change record
  type/tags, dashboard notification. A send prompted by a Phase 16 transition
  must use Phase 16's recorded domain-transition meaning and purpose-specific recipient projection, the Phase 6 dispatch spine,
  Phase 17 content, and the same permanent semantic dedupe key; Phase 35 cannot
  create a second message for the same meaning.
- **Timing modes**: immediate (event-fired) and scheduled/batch (cron-
  evaluated conditions like "no settled gift in N months"), as distinct
  evaluation modes (CiviRules pattern). That condition is explicitly
  **contribution inactivity**, not a person-, Party-, pledge-, or recurring-
  line `lapsed` state, and it cannot override Phase 16's multi-axis health.
- **Idempotency everywhere**: settled-fact triggers with dedupe keys;
  refund/adjustment compensations never re-fire welcome journeys.
- **Trigger observability**: per-rule fire history, dry-run against
  historical data, kill switch.

**Boundaries & guardrails.** Contribution rules fire from settled contribution
facts only. Recurring-state rules may consume only named Phase 16 transitions
and remain downstream of Phase 16 recovery and communication-eligibility
policy. Every send crosses the Phase 6 consent/dispatch gate and the permanent
semantic-dedupe fence; no Phase 35 rule schedules a provider retry or duplicates
a Phase 16 state-change notice. Phase 35 owns the GIVING recipe pack on the shared Phase 34 engine;
it does not introduce a second automation surface or executor.

<a id="phase-36"></a>

## Phase 36 — p2p-campaigns

- **Fundraiser page lifecycle**: donor-created from a parent campaign,
  org-defined default content, edit permissions and optional
  edit-approval, admin edit/deactivate (ServiceReef-style moderation
  controls).
- **Teams**: captains, team goals rolling up member pages, join via
  invite/link. Every campaign/team/page goal uses one explicit reporting
  currency and Legal Entity scope; a labelled Phase 33 reporting conversion
  may compare lanes but never becomes contribution truth.
- **Attribution**: unique share links auto-crediting gifts to the
  fundraiser (as influence/soft credit — 14), plus **admin repair tooling**
  for unattributed/misattributed gifts (a documented operational pain
  across P2P platforms); source codes survive checkout (13). Repair tooling
  invokes Phase 14's append-only credit/attribution correction command and
  never edits a posted gift, designation, or source-code fact in place.
- **Gamification**: thermometers, countdowns, individual/team leaderboards,
  milestones, partitioned by the campaign reporting currency rather than
  silently summing unlike currencies.
- **Fee handling consumes existing authorities**: the donor-facing fee-cover
  choice and gross gift remain Phase 13 truth; exact processor cost,
  organization-absorbed default, and optional designation-borne uncovered-cost
  effect follow Phase 20 D19. Phase 36 may present those approved choices but
  cannot create another fee formula, net a gift in place, or infer a Field
  Account effect.
- Donor-portal "My Campaigns" management (25 socket).

**Boundaries & guardrails.** Donor-created pages are moderated projections;
contribution truth stays in the ledger; fundraiser pages for restricted
workers inherit Phase 10 publication rules.

<a id="phase-37"></a>

## Phase 37 — events-groups

- **Opportunity model** spanning the serving spectrum: one-day events,
  recurring local roles, trainings, multi-week trips; publishable via
  Phase 23 dynamic lists; auto open/close by date; capacity (max/remaining)
  first-class; fund/designation mapping per opportunity (GL stays clean —
  20).
- **Application pipelines owned by Phase 41 on Phase 34 primitives**: reusable form/question libraries,
  reference requests (tokenized external forms), background-check/e-sign
  integration seams, approval stages, per-role dashboards.
- **Trip money, two distinct types** (the domain's critical nuance):
  **non-deductible participant payments** (deposits, installments with due
  dates + reminders, application fees; refundable per policy) vs
  **deductible third-party donations** to org-controlled trip funds
  soft-credited to the participant — separate Phase 13 contribution objects.
  Phase 7 owns receipt eligibility/legal facts; Phase 14 owns recognition and
  acknowledgment purpose/audience facts; Phase 17 owns governed message
  content; Phase 18 owns any canonical document artifact; and Phase 6 owns
  dispatch/history. Phase 22/23 presentation consumes those approved
  source-owned fields and cannot decide deductibility. Each payment or
  donation pins the exact Legal Entity, designation/payment purpose, and
  currency before confirmation; mixed-entity or mixed-currency carts use
  explicit donor-confirmed Phase 13 groups rather than inferring ownership
  from a trip or Site.
- **Per-participant fundraising** via the Phase 36 P2P engine
  (registration-with-fundraising hybrids: pay, raise-by-date commitment, or
  both; donate buttons auto-disappear after deadline; over-fundraising
  policy).
- **Rosters & groups**: team rosters, leaders, capacity; **the Phase 9
  groups ruling lands here** — `party_kind='group'` reserved value +
  ONE shared `group_memberships` table (D3 R3), covering teams, regions,
  and event participation; participant dashboards (per-currency payment and
  fundraising progress, schedule, documents due). Any converted comparison is
  visibly labelled Phase 33 reporting, not source truth.
- **Document collection** (29): passports, waivers, insurance — collected
  via workflow file-request tasks, tracked per participant, classification-
  aware (identity docs are confidential-tier).
- **Group communication**: Phase 37 owns the audience and purpose, Phase 17
  owns governed content and sender profile, and Phase 6 owns dispatch and
  communication history for whole-team or individual messages.
- **Trip-expense handoff without a side ledger**: Phase 37 owns opportunity,
  trip, participant, budget-context, and cost-allocation intent. Phase 21 owns
  expense capture, evidence, approval, reimbursement/payment coverage, and
  any Field Account effect; Phase 20 alone owns the accounting-ready handoff
  and QBO/Xero delivery.

**Boundaries & guardrails.** Event payments use the contribution ledger —
never a side money path. Event coordination uses Phase 34 primitives; application decisions
use Phase 41. Plain registration does not depend on complete mobilization. Trip budgets and expense summaries are operational context,
not another Field Account or general ledger. Restricted-country trips inherit
Phase 10 rules (public opportunity pages for sensitive destinations use
generalized geography).

<a id="phase-38"></a>

## Phase 38 — member-care-ops

- **Confidential case module**: care records sealed by default
  (named-participant grants — the Salesforce Compliant-Data-Sharing
  analog); care notes are **never** ordinary CRM notes; per-case
  participant lists with roles.
- **Provider-type modeling** (licensed counselor vs lay carer) and
  **limits-of-confidentiality acknowledgment** captured at intake (both
  parties know reporting limits before care starts); duty-to-warn/
  mandatory-report escalation paths — explicit, acknowledged, audited.
- **Crisis operations**: contingency plans and proof-of-life data as
  Restricted-tier documents (29); emergency contact trees; **break-glass
  activation UI** (mandatory justification, real-time alert, post-incident
  access review queue); crisis event logging and after-action records.
- **Care-team assignment** (staff-assignment edges, role-qualified) and
  care caseload views; care-sensitive indicators surfaced to general staff
  only as the Phase 10-approved summary chip (structural member-care
  exclusion from Phase 9 general surfaces carries through).
- **Candidate-screening data** (psychological assessments from
  mobilization workflows, 34/37) landing as Restricted with its own
  retention schedule.
- **Compliance evidence surfaces**: per-tier retention/deletion enforcement
  reports, appropriate-policy-document support (ICO), DSAR/erasure tooling
  that correctly excludes data whose disclosure endangers third parties.
- **Audit of the audit**: sensitive-read logs are themselves confidential
  (who is in counseling is confidential) with their own tier and retention.

**Boundaries & guardrails.** Care truth is not general CRM. Leadership
cannot silently unseal counselor notes (the trust-failure mode); whatever
unseal authority exists is explicit, disclosed at intake, and audited.
Cross-tenant sharing of restricted worker data: export-with-consent only.
Care notes, case membership, crisis details, and sensitive-read history never
enter a Phase 21 Approved Expense Snapshot, Phase 20 Accounting-Ready Expense
Handoff, Accounting Release, provider artifact, or QBO/Xero payload. Expense
operations may carry only the minimum approved business-purpose evidence
allowed by the Phase 10 egress policy.

A D26 tenant business-record archive is not an individual's subject-access,
portability, correction, restriction, or erasure response. Phase 38 privacy-
request authority may constrain or request owner-filtered D26 records, but it
cannot treat an unredacted tenant archive as the response or use export as
deletion or hold authority.

<a id="phase-39"></a>

## Phase 39 — field-first-ux

- **PWA shell** (Serwist — the standard Next.js App Router toolchain):
  installable workspace, app-shell precache, runtime caching, offline
  detection.
- **Read-path resilience**: TanStack DB persistence (SQLite-WASM adapters)
  for the missionary's permitted slice (partners, tasks, commitments) —
  server-authoritative, schema-version-controlled re-sync. Before the device
  posture is certified, only non-sensitive projections may persist locally.
- **Offline write queue for a small named set** of workflows via
  `@tanstack/offline-transactions`: client-generated idempotency keys,
  exponential backoff, ordered replay for dependent ops, **visible
  pending/synced state** ($synced/$origin row metadata → WhatsApp-style
  indicators).
- **D22 offline boundary**: only a visibly device-local, non-authoritative
  Prospective Expense Plan Draft may be resumed offline after the device-
  security contract is certified. Submit, withdraw, request-information,
  review, decide, reserve, apply coverage, release, correct, and notify remain
  online, server-confirmed actions; they are never offline-queued or rendered
  optimistically as committed.
- **D25 offline boundary**: a visibly device-local response text draft may be
  retained only under the certified device contract and must remain labelled
  **Not sent**. Evidence upload/finalization, response submission, withdrawal,
  request-another-review, source correction, Resolution Occurrence, downstream
  disposition, and case completion remain online and server-confirmed. The UI
  never shows **Sent**, **Complete**, approved, paid, or financially corrected
  before authoritative commit.
- **D26 offline boundary**: package request, scope preview, manifest seal,
  authorization reproof, external-copy assertion, verified transfer, hold, and
  disposition remain online and server-confirmed. A deliberate authenticated
  download may create an external device copy that Asym cannot recall, but a
  service worker or ordinary offline cache must never silently retain archive
  bytes; offline UI cannot claim **Stored**, **Verified**, **Complete**, or
  **Transferred**.
- **Conflict policy per entity, decided up front** (TanStack DB explicitly
  does not solve conflicts): LWW-safe fields vs must-surface fields with
  human-readable choices — no silent merges.
- **Low-bandwidth budgets** as acceptance criteria (payload sizes,
  image variants, skeleton behavior) across donor/missionary/staff
  field-relevant routes.
- **Escalation ladder documented** (Electric's four tiers): if a future
  need demands true bidirectional mobile sync, PowerSync-class engines are
  the evaluated path — not an ad-hoc rebuild.

**Boundaries & guardrails.** Writes stay server-authoritative through the
existing API. Donations, receipts, batch commits, and any money mutation
are **never** offline-queued (pessimistic confirmation only). Restricted-
tier data (10/38) is never persisted to device caches. Confidential or partner
PII cannot persist until encrypted-at-rest storage and key handling,
device/session binding, logout and revocation wipe, TTL expiry, remote
invalidation, schema-migration safety, and a lost-device threat test all pass.
Failure falls back to online-only or non-sensitive cached projections, never
plaintext convenience storage.

<a id="phase-40"></a>

## Phase 40 — data-stewardship-ai

- **Global search**: cross-record-type, permission-governed (Phase 3/10
  compiled into the query — restricted tiers excluded from indexing per the
  Phase 10 ruling), extending the Phase 9 Cmd-K foundation platform-wide. It
  may consume D13's already-admitted public Directory Projection and typed card
  references in the future, but cannot widen D2 reach, Phase 10 safety, Page
  Family, Site/locale scope, or public indexed fields. D13 launches without a
  dedicated external-search authority; a later Phase 40 engine remains a new
  proof-gated adapter over owner-domain projections, never a retroactive D13
  prerequisite or parallel public catalog.
- **Phase 22 D25 independence:** D25's action resolver, recovery buffer, and
  bounded reference-safe cleanup launch as deterministic owner-contract
  behavior. Phase 40 cannot classify stale editorial work, inspect drafts,
  operate recovery, or become an authority or prerequisite for D25.
- **Data-quality queues as continuous control** (not periodic cleanup):
  duplicate suggestions (prevent-at-entry + real-time detect + small
  governed merges), completeness/staleness/consistency checks, growing the
  Phase 8 data-health foundation into a product.
- **AI suggestion ledger** (the architecture keystone): every AI output is
  a _suggestion record_ with provenance (model, prompt version, inputs),
  confidence, and **evidence links back to source records**; a human commit
  creates the actual audited mutation — **AI never writes canonical truth
  directly**. Approval invokes the owning domain's existing typed command with
  fresh authorization, current-version/CAS checks, validation, idempotency,
  and append-only correction rules. A stale suggestion fails safely and must
  be re-previewed; the suggestion itself grants no authority. Suggested vs
  confirmed data is a first-class distinction.
- **Shared AI control-plane continuation**: add generalized feature purposes
  only through the D10 code-owned registry and current capability-certification
  process. Reuse Provider Connections, Credential Revisions, Binding Versions,
  Egress Manifests, Invocation Evidence, purpose budgets, health, revocation,
  and kill switches. Feature domains still own suggestion interpretation and
  acceptance commands; a Phase 40 workbench never gains generic write
  authority.
- **Tiered autonomy + review-by-exception**: conservative thresholds first;
  expand only as override rates drop (<~30%); human corrections captured as
  feedback, not discarded. Advisory-first merge (the shipped Dynamics 365
  pattern: AI pre-selects surviving values with reasoning; a click
  commits).
- **Governed AI access to numbers**: any natural-language analytics speaks
  **only through the Phase 33 semantic layer** (tenant/role security
  compiled in — cross-tenant queries impossible to construct).
- **Operator assists**: record summaries, donor briefs (27's generator,
  AI-drafted), next-action drafts, anomaly flags (giving-pattern changes) —
  all consent- and classification-aware (restricted/care data excluded from
  AI features per the Phase 10 open-question ruling, resolved by then).
- **Governance rails** (EU AI Act Art. 12 / NIST AI RMF convergence):
  append-only hash-chained audit of AI-driven decisions recording actor
  type (human/AI/system); the four-element guardrail set — permission,
  approval, audit trail, **kill switch**.

**Boundaries & guardrails.** AI suggests; an authorized human may invoke the
owning domain command. No generic AI mutation path to party, gift, document,
Field Account, or accounting truth exists—structurally, not by policy.
Care/restricted data never enters model context. AI may summarize
already-authorized finance evidence through Phase 33, but cannot approve an
expense, create or change a Field Account entry, choose a Legal Entity or
accounting destination, release or retry an Accounting Release, resolve an
ambiguous Bank Match, reconnect a provider, select a posting period, or attest
provider readback.
