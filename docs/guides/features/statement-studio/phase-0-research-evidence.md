# Statement Studio Phase 0 research evidence

> **Historical evidence; superseded implementation authority (Phase 18,
> 2026-07-21).** This file remains authoritative only for what the earlier audit
> observed in the repository. Its recommendations are not dispatchable. Current
> product and implementation authority is the Phase 18 PRD, authority manifest,
> renderer qualification protocol, ADRs 0033-0039, and OpenSpec change. In
> particular, Phase 18 D17 eliminates legacy runtime/migration compatibility,
> D3 leaves the renderer unselected until the evidence contest, and D13 forbids
> raw provider or signed object URL authority.

This appendix records primary-source findings for
[GitHub issue #312](https://github.com/Asymmetric-al/core/issues/312). It is an
implementation audit, not a replacement PRD. The audited repository baseline is
`origin/develop` at `25b5aae69086fb2b6ca4e0ef2e0612724360b4ed` (fetched
2026-07-10).

Evidence labels used below:

- **Runtime** means a reachable route, service, or UI on the audited commit.
- **Schema** means committed SQL exists; it does not prove that a hosted project
  has applied the migration.
- **Test** means the repository contains coverage; the test's actual boundary is
  stated so source-contract tests are not mistaken for end-to-end proof.
- **Plan** means a PRD or guide describes intended behavior only.

The repo-scoped Nia index returned obsolete pre-monorepo `src/...` paths for this
area. Those results were rejected. Every finding below comes from the fetched Git
object and direct file reads.

## Current platform guidance checked

- Supabase documents that private buckets are private by default and that
  downloads require either an authenticated request evaluated by
  `storage.objects` RLS or a time-limited signed URL
  ([Storage buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)).
  It also warns that service keys bypass Storage RLS
  ([Storage access control](https://supabase.com/docs/guides/storage/security/access-control)).
  Therefore a service-role portal BFF must authorize the recipient before it
  streams bytes or signs a URL; possession of the service key is not an access
  policy.
- Supabase requires object deletion through the Storage API, not direct SQL,
  because deleting only Storage metadata orphans the underlying object
  ([Delete objects](https://supabase.com/docs/guides/storage/management/delete-objects)).
  Statement Studio retention must delete bytes through the API and preserve its
  own artifact tombstone/audit record.
- The installed Next.js 16.2.6 guidance says Route Handlers are public
  endpoints, can return files, and require explicit authentication,
  authorization, input validation, and careful handling of sensitive responses
  (`node_modules/next/dist/docs/01-app/02-guides/backend-for-frontend.md` and
  `node_modules/next/dist/docs/01-app/02-guides/data-security.md`). The repo's
  thin route plus `packages/api` BFF pattern is the correct seam; a route
  filename or hidden UI is not authorization.

## Ticket and planning-document status

- Issue #312 is still correctly shaped as a **docs/HITL audit**, not a runtime
  implementation ticket. Its acceptance criteria ask for an inventory,
  reuse/replace/retire/delete decisions, and first-slice confirmation. On the
  audited baseline,
  `docs/guides/features/statement-studio/phase-0-audit-brief.md:1` was only an
  instruction template with unchecked output criteria; this change replaces it
  with the completed decision brief.
- At audit start, the Statement Studio PRD named pdfx + React PDF as the target
  and explicitly delegated reconciliation with native PDF Studio + DocRaptor to
  Phase 0. There is no `pdfx` or `@react-pdf/renderer` runtime dependency or
  import under `apps/**` or `packages/**` on the audited commit. Phase 0 selects
  the existing server-side DocRaptor adapter as the provider candidate behind a
  port; production use remains gated on qualification and HITL approval.
- The PRD also asks Phase 0 to add
  `openspec/changes/add-statement-studio/`
  (`docs/guides/features/statement-studio/prd.md:36-43`). No Statement Studio
  OpenSpec change exists on `origin/develop`. That is a planning/acceptance-scope
  mismatch that the main audit must resolve explicitly rather than silently
  treating the PRD sentence as already delivered.

## Newer related work reconciled

- [PR #542](https://github.com/Asymmetric-al/core/pull/542) merged the
  `gift_receipt_records` scaffold. Its migration explicitly requires Phase 0
  (#312) to reconcile that record with `pdf_*` and
  `contribution_receipt_snapshots` before promotion beyond MVP.
- [PR #451](https://github.com/Asymmetric-al/core/pull/451) merged the
  staff-only corrected-receipt DocRaptor route as an interim path and defers the
  template-backed receipt to Statement Studio SS-10. It is reusable evidence,
  not the final artifact model.
- The newer Phase 7 epic and issues
  [#566](https://github.com/Asymmetric-al/core/issues/566),
  [#579](https://github.com/Asymmetric-al/core/issues/579),
  [#580](https://github.com/Asymmetric-al/core/issues/580),
  [#583](https://github.com/Asymmetric-al/core/issues/583), and
  [#584](https://github.com/Asymmetric-al/core/issues/584) are open proposals,
  not merged behavior. They retain `donor.statement.annual_giving` while
  assigning approved facts, inclusion snapshots, runs/versions, portal cutover,
  and frozen official formatting to the statement domain; Statement Studio owns
  render artifacts and retention. This audit adopts that stable ownership seam
  without treating the proposed table names as shipped schema.
- Those Phase 7 issues also name the open Phase 4 tenant-isolation foundation
  ([#505](https://github.com/Asymmetric-al/core/issues/505) and
  [#516](https://github.com/Asymmetric-al/core/issues/516)) and the Phase 6
  communication seam
  ([#552](https://github.com/Asymmetric-al/core/issues/552),
  [#553](https://github.com/Asymmetric-al/core/issues/553), and
  [#554](https://github.com/Asymmetric-al/core/issues/554)) as production
  prerequisites. Proposed delivery issue
  [#581](https://github.com/Asymmetric-al/core/issues/581) owns outbound
  statement/receipt delivery through that seam; Statement Studio must not add a
  second tenant guard or communication log/send path. Consent PR #502 has merged
  and is no longer an open prerequisite.
- [PR #465](https://github.com/Asymmetric-al/core/pull/465) proposes the same
  facts-versus-artifacts boundary but remains open and conflicting. It was used
  as corroborating context only, not as current merged product truth.

## Legacy PDF Studio and Unlayer

### What is real

- **Runtime:** Mission Control still exposes the product as `/pdf` / "PDF
  Studio." The normal editor is
  `LegacyUnlayerDocumentEditor`
  (`apps/admin/app/pdf/page-client.tsx:59`, `:1939-1955`). The only browser E2E
  spec verifies the legacy page, Unlayer container, and iframe
  (`tests/e2e/admin-pdf-studio-legacy.spec.ts:29-52`). It can skip when the demo
  account is unavailable (`:7-22`).
- **Runtime:** Legacy templates save Unlayer design JSON and cached HTML into
  `pdf_templates`; legacy PDF export calls the Unlayer browser editor and opens
  the returned temporary URL (`apps/admin/app/pdf/page-client.tsx:1168-1176`,
  `:1480-1503`). `react-email-editor` remains a production dependency of
  `packages/ui/package.json`.
- **Schema/runtime:** `pdf_templates` is the established root table with tenant,
  design, HTML, category, layout, status, default, and audit timestamps
  (`supabase/migrations/20250101000000_init_schema.sql:303-322`). The admin API
  is a thin App Router export to `packages/api`; handlers require admin or
  super-admin and the store scopes every read/update by `tenant_id`
  (`packages/api/src/pdf-templates/index.ts:98-104`,
  `packages/api/src/pdf-templates/store.ts:247-349`). The store uses the service
  role/admin client, so those application predicates--not RLS execution--are the
  live BFF boundary.

### What is not yet replaceable

- The default native rollout is disabled and `legacy_only`; legacy fallback
  defaults to enabled
  (`packages/config/pdf-studio-native.ts:119-146`, `:249-260`). Existing Unlayer
  templates have no automatic conversion. The migration report explicitly
  chooses `manual_rebuild_with_report`
  (`packages/api/src/pdf-templates/native-adapter.ts:285-301`).
- Therefore Unlayer is **retire-later**, not delete-now. Removing it before a
  native/Statement Studio editor, version publication, production artifact, and
  download path exist would remove the only exercised authoring/export surface.

## Native builder, rendering, and migration scaffold

### Implemented scaffold

- **Dependencies:** local vendored `@asym/pdf-*` and DocRaptor packages are
  pinned in the root and app/API package manifests. The native adapter imports
  the Asym schema, browser preview, preflight, HTML composer, and DocRaptor client
  (`packages/api/src/pdf-templates/native-adapter.ts:1-45`).
- **Runtime:** authenticated admin routes exist for native preview, render, and
  migration report
  (`apps/admin/app/api/pdf-templates/native/{preview,render,migration-report}/route.ts`).
  They validate `DocumentTemplateV1`, construct a tenant security context, and
  delegate through `packages/api/src/pdf-templates/native.ts:38-110`.
- **Runtime:** browser preview performs schema validation/preflight and returns
  authoring HTML. Production render composes document HTML and calls DocRaptor
  only when rollout and provider configuration allow it
  (`packages/api/src/pdf-templates/native-adapter.ts:136-217`). Missing rollout
  or provider config fails closed with structured errors (`:153-170`).
- **Runtime gap:** native configuration defaults DocRaptor to test mode, and
  the native adapter does not reject that mode. It can return a successful,
  watermarked test PDF (`packages/config/pdf-studio-native.ts:122-126`,
  `:187-246`; `native-adapter.ts:146-217`). Only the corrected-receipt path
  currently requires production mode (`receipt-pdf.ts:173-186`, `:233-249`).

### Material limitations

- The "native builder" shown to staff is currently a raw **Document JSON**
  `<Textarea>` beside an iframe preview
  (`apps/admin/app/pdf/page-client.tsx:1080-1160`). There is no runtime import of
  `@asym/pdf-editor` outside manifests/vendor code. This is a developer scaffold,
  not the non-technical Statement Studio editor promised by the PRD.
- Native save writes the mutable source JSON back to the root `pdf_templates`
  row and sets `html: null`; it does **not** create an immutable version
  (`packages/api/src/pdf-templates/native-adapter.ts:221-265`). The UI confirms
  this gap by labeling "Version History" as "coming soon"
  (`apps/admin/app/pdf/page-client.tsx:653-659`).
- DocRaptor render receives PDF bytes but the native adapter discards the bytes,
  returns only size/type plus an `adapter_reference`, and neither inserts an
  artifact nor gives the browser a file/URL
  (`packages/api/src/pdf-templates/native-adapter.ts:190-217`). The UI can only
  toast "Native render completed" (`apps/admin/app/pdf/page-client.tsx:1434-1477`).
- Asset URL signing and batch execution are placeholders: the asset adapter
  returns `undefined` for a signed URL and the batch adapter only echoes enqueue
  metadata (`packages/api/src/pdf-templates/native-adapter.ts:368-403`).

## Template, version, render, and artifact persistence

### Committed schema

- **Schema:** `20260515140948_native_pdf_studio_foundation.sql` extends
  `pdf_templates` with engine, schema-version, current-version, and migration
  state (`:3-47`). It creates:
  `pdf_template_versions` (`:49-64`), `pdf_template_renders` (`:66-86`),
  `pdf_template_artifacts` (`:88-106`), `pdf_template_audit_events`
  (`:108-118`), `pdf_template_batches` (`:120-137`), and batch jobs
  (`:139-152`).
- **Schema:** all child tables have non-null `tenant_id`, RLS, no anonymous
  grants, staff-tenant policies, and service-role policies
  (`supabase/migrations/20260515140948_native_pdf_studio_foundation.sql:231-263`,
  `:265-487`).
- **Plan alignment:** the current Statement Studio data-model guide already says
  to extend/rename this `pdf_*` family and not create parallel
  `document_*` artifact tables
  (`docs/guides/features/statement-studio/data-model.md:20-55`).

### Runtime reality and risks

- A repository-wide runtime search finds no `.from("pdf_template_versions")`,
  `.from("pdf_template_renders")`, `.from("pdf_template_artifacts")`, or
  `.from("pdf_template_batches")` call in `apps/**` or `packages/**`. Current
  runtime persistence stops at the mutable `pdf_templates` root row.
- The migration records a location but does not create a private Storage bucket
  or object policies. The only generic document bucket in the initial schema is
  `document-uploads`, and it is public-read
  (`supabase/migrations/20250101000000_init_schema.sql:460-487`). No PDF/statement
  Storage adapter exists in `apps/**` or `packages/**`.
- The artifact row lacks document job, scope, recipient/owner, retention,
  purge/tombstone, and download-audit fields. Those are required before donor or
  missionary portal access can be authorized. The planning guide requires
  private Storage and tenant-aware paths/downloads
  (`docs/guides/features/statement-studio/data-model.md:92-102`).
- Native render has no stable logical render key, lease/fencing-token recovery,
  or canonical-artifact uniqueness contract. Client, queue, or provider retries
  could therefore create duplicate official output once persistence is wired;
  foundation work must define that boundary before enabling production.
- Tenant safety is only partially encoded relationally: child rows carry
  `tenant_id`, but their foreign keys reference parent IDs alone rather than a
  composite `(tenant_id, id)`. The RLS predicates authorize the child row's
  tenant; they do not prove the referenced template/version belongs to that same
  tenant. Before activating child-table writers, enforce same-tenant references
  in schema or a single trusted persistence seam.
- The committed migration history also contains
  `20260216153000_demo_readonly_rls.sql`, which replaced policies on
  `pdf_templates` and core donor/donation/missionary/profile tables with
  anonymous `public read` policies. The native-PDF migration later revokes anon
  table privileges from `pdf_*`, but it does not drop the latent permissive
  policy; a future grant could reactivate it, and a hosted project missing that
  later migration may still expose templates. The audit also found no blanket
  cleanup covering every core giving table. This does not prove effective hosted
  state, but explicit policy removal plus deployed RLS/grant verification are
  hard gates before official-document resolvers or direct Data API reads are
  trusted.
- The repo proves that the migration is committed, not that any hosted project
  applied it. `docs/features/pdf-studio/native-builder-migration-handoff.md`
  stated it was unapplied when authored. Hosted migration status must be checked
  separately before any code assumes these tables exist.

## Current donor receipt behavior

There are four distinct receipt paths; they must not be described as one
finished Statement Studio flow.

1. **Donor portal text download (runtime).**
   `packages/api/src/donor-portal/receipts.ts:39-82` authenticates a donor,
   scopes the lookup by tenant + donor + donation, reads current profile/gift
   data, and returns `text/plain` named `donation-receipt-<id>.txt`. Unlike the
   annual statement query, this lookup does not require a settled status; the
   generated file merely prints the current status (`:15-36`). It is not a PDF,
   not template-backed, not frozen, and not sufficient tax-receipt evidence.

2. **Staged-gift email receipt (runtime).**
   `packages/api/src/giving/receipts.ts:144-170` builds hard-coded HTML/text.
   Delivery goes through the shared `sendEmail` seam, tenant Resend settings,
   consent policy, idempotency, `email_send_logs`, and `staged_gifts` status
   updates (`:313-468`). It does not resolve a PDF/Statement Studio assignment
   or attach/store an artifact.

3. **Corrected receipt snapshot and PDF (runtime).**
   `contribution_receipt_snapshots` stores correction-time render inputs
   server-side
   (`supabase/migrations/20260611140000_contribution_receipt_delivery.sql:17-39`).
   Staff with the configured capability can render an updated receipt from that
   snapshot through DocRaptor **production mode** and stream the bytes directly
   (`packages/api/src/admin/contribution-operations/receipt-pdf.ts:141-186`,
   `:194-282`). This is the strongest reusable rendering/snapshot seam, but it is
   hard-coded updated-receipt HTML, has no template/version assignment, and does
   not persist a generated-file artifact. The application currently writes a
   new snapshot per action, but the schema permits service-role updates, deletes
   snapshots on donation deletion, and does not enforce that the referenced
   donation shares the snapshot tenant. It is not yet database-immutable or
   retention-durable official evidence.

4. **Gift receipt record scaffold (schema/module/test only).**
   `gift_receipt_records` stores one server-only frozen snapshot per donation
   (`supabase/migrations/20260704120000_gift_receipt_records.sql:14-40`).
   `packages/api/src/giving/receipt-record.ts` builds, renders, and idempotently
   writes the snapshot, but its own comment says it is intentionally not wired
   to the payment path (`:216-223`). Repository-wide call-site search confirms
   `recordGiftReceipt` has no runtime caller. Its donor language is explicitly a
   non-production placeholder (`:21-26`).

The canonical receipt truth model is therefore unresolved among live donor
reads, correction snapshots, staged-gift email logs, and the unused frozen gift
record. Statement Studio should consume a source-domain receipt DTO after those
owners are reconciled; it should not become a fifth money/receipt truth store.

## Current annual-statement behavior

- **Runtime:** `GET /api/donor/statements/[year]` is a thin export to
  `packages/api/src/donor-portal/statements.ts`. The donor helper requires donor
  role and uses a server-only client
  (`packages/api/src/donor-portal/route-helpers.ts:14-35`).
- **Runtime/data boundary:** `getOwnedStatementDonations` filters by tenant,
  donor, UTC year, and the local settled-status set
  (`packages/api/src/donor-portal/service.ts:279-301`). The history UI links to
  this route (`apps/donor/app/(dashboard)/donor-dashboard/history/page-content.tsx:234`).
- **Output:** the handler totals the current `donations` rows and returns a
  tab-delimited `text/plain` attachment named `giving-statement-<year>.txt`
  (`packages/api/src/donor-portal/statements.ts:30-93`). It has no template,
  immutable statement snapshot, version/assignment, PDF renderer, artifact,
  private Storage object, delivery event, retention, or corrected/refunded gift
  history.
- The query projects one current fund or missionary association per donation
  (`packages/api/src/donor-portal/service.ts:55-72`). A production Statement
  Studio resolver must remain owned by the giving domain and evolve with the
  canonical contribution/designation/credit model; Statement Studio must not
  duplicate those joins as its own financial truth.

## Cross-domain owner and readiness evidence

| Domain / surface  | Primary-source evidence                                                                                                                                                                                                 | Classification and finding                                                                                                                                                                                                                                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Giving / donor    | `packages/api/src/giving/{receipts,receipt-record}.ts`; `packages/api/src/admin/contribution-operations/{receipt-delivery,receipt-pdf}.ts`; `packages/api/src/donor-portal/{service,receipts,statements}.ts`            | **Runtime + Schema + Test.** Giving and Contribution Operations own gift, correction, receipt, and delivery facts; donor portal is the recipient BFF. The four receipt paths and live annual query are not yet one official-document context.                                                                                                            |
| Reports / finance | `packages/api/src/admin/crm/reports/service.ts:buildAdminCrmReport`; `packages/api/src/admin/crm/reports/export.ts`; `apps/admin/app/api/admin/crm/reports/{route,export/route}.ts`                                     | **Runtime + Test.** A tenant-scoped report/CSV seam exists, but its giving aggregation selects flat completed `donations` by `created_at`; finance must approve a document DTO before Statement Studio uses it.                                                                                                                                          |
| Missionary        | `packages/api/src/missionary-portal/service.ts:getMissionaryPortalSnapshot`; `packages/api/src/missionary-portal/{donors,tasks}.ts`; `tests/unit/packages/api/missionary-portal-{redaction,snapshot-redaction}.test.ts` | **Runtime + Test.** This is a real role-scoped BFF/resolver starting point, but there is no statement route/context. The legacy `missionary_tasks` table in `20250101000000_init_schema.sql:287-301` has no tenant column and was initially created with RLS disabled at `:577`, so task documents are not a clean first job without separate hardening. |
| Events            | `apps/admin/app/events/page-client.tsx:EventsPage`; `packages/database/collections/admin-workspace.ts:eventAttendeesCollection`                                                                                         | **Runtime UI over seed data.** The attendee collection returns `EVENT_ATTENDEES_SEED`; no production event document resolver or artifact route was found. Treat event starters as sample/template-ready only.                                                                                                                                            |
| Support / reports | `packages/api/src/admin/support-hub/adapter/index.ts:supportHubAdapter`; `apps/admin/app/api/admin/support/reports/route.ts`; `apps/admin/features/support-hub/lib/report-aggregations.ts:buildReportSeries`            | **Runtime.** Supabase is the live Support adapter, but the reports route explicitly delegates part of aggregation to a client-side helper. Consolidate a server-owned report context before PDF output.                                                                                                                                                  |
| Member care       | `packages/api/src/reads/member-care.ts`; `packages/api/src/admin/member-care/**`; `supabase/migrations/20260414180338_member_care_foundation.sql`                                                                       | **Runtime + Schema + Test.** Tenant-scoped activities, goals, requirements, and private notes exist. Private-note redaction, elevated capability, retention, and access-reason audit need separate HITL policy before any care packet.                                                                                                                   |
| Shared tasks      | `packages/api/src/admin/mission-control-tasks/**`; `packages/api/src/admin/mission-control-tasks/store.ts` writes `mission_control_tasks`; `packages/database/collections/admin-workspace.ts:adminTasksCollection`      | **Runtime service plus seed/in-memory UI collection.** Shared Mission Control tasks are the source owner. Do not render from `adminTasksCollection`, whose query/mutations operate on in-memory rows.                                                                                                                                                    |
| Mobilize          | `apps/admin/app/mobilize/**`; `packages/database/collections/admin-workspace.ts:mobilizeCandidatesCollection`                                                                                                           | **Runtime UI over seed data.** Candidate collection reads `MOBILIZE_CANDIDATES_SEED`; no production packet resolver was found. Defer operational packets.                                                                                                                                                                                                |
| Legal / signing   | `apps/admin/app/sign/page-client.tsx`; `apps/donor/app/(public)/sign/[token]/page-client.tsx`                                                                                                                           | **Prototype/mock.** The public signer assigns the literal mock signature `John Doe`; no production legal evidence/context owner was found. Legal packets remain HITL and not implementation-ready.                                                                                                                                                       |
| CMS               | `apps/admin/src/cms/access/tenant-access.ts`; `apps/admin/src/cms/public/published-page-read.ts`; `apps/admin/src/cms/collections/media.ts`; `apps/admin/src/cms/payload-runtime-integrations.ts`                       | **Runtime.** Payload provides tenant-scoped approved content and published-page reads. Media uses Vercel Blob when configured and local `staticDir` as the fallback; Statement Studio still needs an authorized, render-safe asset adapter. CMS may supply branding/content, never operational or gift truth.                                            |

Repository searches also covered the report, event, missionary, care, task,
legal/signing, Mobilize, and CMS app/API/schema paths named by issue #312. A
missing production resolver is recorded as a gap rather than inferred from a UI
or planning document.

## Test evidence and remaining proof gaps

| Evidence                                                                                                                 | What it proves                                                                            | What it does not prove                                                                                |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `tests/e2e/admin-pdf-studio-legacy.spec.ts`                                                                              | Legacy `/pdf` and Unlayer iframe can load with demo auth.                                 | Native editing, production render, persistence, or artifact delivery.                                 |
| `tests/unit/apps/admin/pdf-studio-native-ui.test.ts`                                                                     | Static source contains flags/routes and avoids client DocRaptor imports.                  | Browser behavior; it reads source text rather than mounting the UI.                                   |
| `tests/unit/packages/api/pdf-studio-native-{adapter,routes}.test.ts`                                                     | Preview/preflight, fail-closed render config, category mapping, manual migration reports. | A real DocRaptor render, bytes/download, version row, artifact row, or Storage object.                |
| `tests/unit/packages/api/pdf-template-native-migration.test.ts`                                                          | SQL text contains native tables/RLS/grants.                                               | Successful Supabase apply/reset, hosted migration state, same-tenant FK integrity, or Storage policy. |
| `tests/unit/packages/api/pdf-template-{store,templates}.test.ts`                                                         | Root CRUD/tenant predicates and route validation with fakes.                              | Child version/artifact lifecycle.                                                                     |
| `tests/unit/packages/api/admin/contribution-receipt-pdf.test.ts`                                                         | Snapshot HTML escaping, capability gate, fake DocRaptor bytes, production-mode refusal.   | Real provider or persisted artifact delivery.                                                         |
| `tests/unit/packages/api/donor-portal/auth-ownership.test.ts`                                                            | Receipt ownership predicates and annual statement settled/year filter.                    | Receipt/statement route content and headers.                                                          |
| `tests/unit/apps/donor/history-receipt-links.test.ts`                                                                    | Static source points controls at receipt/statement URLs.                                  | Successful downloads or PDF fidelity.                                                                 |
| `tests/unit/packages/api/giving-receipt-record.test.ts` and `tests/unit/supabase/gift-receipt-records-migration.test.ts` | Frozen snapshot logic and migration text.                                                 | Money-path integration; there is no runtime caller.                                                   |

No direct unit/integration test invokes the donor receipt or annual-statement GET
handler, and no E2E test covers native render, immutable version publication,
artifact persistence, private Storage, portal artifact authorization, retention,
or delivery audit.

## Evidence-led disposition

### Reuse

- The existing `pdf_templates` / `pdf_template_*` table family as the canonical
  migration base; evolve it instead of adding parallel Statement Studio tables.
- Thin App Router exports, admin-role checks, tenant-scoped store predicates,
  schema validation, preflight, provider-neutral adapter concepts, and
  fail-closed provider configuration.
- The donor-portal ownership query as a source-domain starting seam, not as a
  Statement Studio-owned SQL model.
- Stored correction-time receipt snapshots, production-mode DocRaptor guard,
  capability checks, the shared `sendEmail` seam, idempotency, and delivery logs.

### Replace or complete

- Mutable root-row native saves with immutable version creation/publish/rollback.
- Raw JSON textarea authoring with the approved non-technical Statement Studio
  editor.
- Native render metadata-only responses with actual artifact persistence,
  private Storage, authorized download, checksum, retention, and audit.
- Direct live-data `.txt` receipt/statement handlers and hard-coded receipt HTML
  with source-domain DTOs and assigned, versioned templates.
- Broad staff-table policies and ID-only foreign keys with capability-aware,
  same-tenant invariants before those tables become active runtime surfaces.

### Retire later; delete nothing yet

- Keep Unlayer as a flagged legacy fallback through at least one exercised
  production Statement Studio job and verified migration path. Then retire the
  legacy editor, public env/config, tests, docs, and dependency together.
- Do not delete native tables or DocRaptor correction-receipt code. They contain
  reusable schema and operational seams even if the final compiler/renderer
  changes.

## First production slice conclusion

Keep `donor.statement.annual_giving` as the first **Statement Studio document
job**, but make the confirmation conditional:

1. It already has a donor-authenticated, tenant/donor/year-scoped route and a
   visible dashboard download entry point, so there is a clean replace-in-place
   vertical seam.
2. It exercises the architecture more completely than a single receipt:
   repeaters, multiple gifts, totals, variables, assignment, immutable version,
   rendering, recipient authorization, private artifact Storage, and download.
3. `donor.receipt.single` is currently fragmented across four truth/delivery
   paths and carries unresolved compliance language. Moving it first would mix
   Statement Studio foundation with receipt-truth consolidation.

However, do **not** call the annual statement production-ready while it reads the
legacy live `donations` projection directly. The first slices may build the
shell, starter, schema/version, assignment, fixture preview, and source-domain
resolver contract; the production render/download slice must be gated on:

- a canonical giving-domain DTO that represents settled, corrected, refunded,
  designation, and donor-credit truth without Statement Studio owning money;
- one canonical Postgres model mapped onto the existing `pdf_*` family;
- private Storage plus recipient predicates and artifact lifecycle fields;
- the Phase 0 renderer proposal: qualify DocRaptor behind the provider seam for
  the first slice, obtain HITL approval, and do not silently add a competing
  stack;
- hosted migration verification and finance/legal approval of statement and
  receipt language.

That preserves the intended backlog order while preventing the old ticket from
baking current flat/live donation reads into the new document platform.
