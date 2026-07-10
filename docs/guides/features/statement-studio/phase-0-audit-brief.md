# Statement Studio Phase 0 Audit Brief

Status: research and the Phase 0 decision package were completed on 2026-07-10
against `origin/develop` at `25b5aae6`. PR #715 is the merge/approval record;
provider qualification and the finance/legal gates below remain separate.

This is the decision brief. The path-by-path primary-source inventory is in
[`phase-0-research-evidence.md`](./phase-0-research-evidence.md), and the
proposed durable contract is in
[`openspec/changes/add-statement-studio`](../../../../openspec/changes/add-statement-studio/).
No product code or database migration belongs in AL-312.

## Triggers

Use this audit before:

- Implementing Statement Studio issues after AL-312.
- Adding a production receipt, statement, report, or portal PDF.
- Writing to the native `pdf_template_*` tables.
- Removing PDF Studio, Unlayer, or the DocRaptor path.

## Workflow Steps

1. Treat the decisions below as the Phase 0 direction; PR #715 merge records
   repo approval of the decision package.
2. Use the evidence appendix when a finding needs exact source paths or test
   boundaries.
3. Implement only the safe shell/sample-data tracer until the financial and
   artifact gates below are closed.
4. Re-groom downstream issues when their current dependency graph would skip a
   gate identified here.

## Phase 0 Decisions

| Question                          | Phase 0 decision                                                                                                                                                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Is AL-312 obsolete?               | No. The placeholder audit was never completed, and newer receipt/correction work made the audit more important. It remains a docs/HITL ticket.                                                                                                                      |
| Canonical persistence             | Extend the existing `pdf_templates` and `pdf_template_*` family. Do not create a parallel `document_*` store.                                                                                                                                                       |
| First plumbing tracer             | Use `letterhead.simple` or the annual starter with synthetic data in Mission Control only. Mark it visibly non-official; it is admin-only, non-assignable, and non-deliverable. It may prove preview selection and infrastructure without claiming financial truth. |
| First donor-facing production job | Keep `donor.statement.annual_giving`, conditionally. It must consume a frozen, versioned, giving-owned statement context and pass finance/legal review before production render or download.                                                                        |
| Renderer for the first slice      | Qualify the Asym-owned schema and server-only DocRaptor adapter, then approve it as the sole provider behind a renderer port. Do not add a parallel pdfx/React PDF stack. A future replacement requires a measured migration plan.                                  |
| Legacy Unlayer                    | Retire later, not now. Keep it as a flagged compatibility path until a production Statement Studio job, authoring replacement, and tenant-template migration inventory are verified.                                                                                |
| Deletion                          | Delete nothing in Phase 0. There is not enough deployed-data evidence to remove templates, tables, flags, packages, or receipt records safely.                                                                                                                      |

## Current Reality

### PDF Studio and native builder

- `/pdf` is still the user-facing PDF Studio and defaults to the exercised
  Unlayer editor. Native rollout defaults to `legacy_only` with legacy fallback
  enabled.
- The native UI is a raw JSON textarea. The app does not import the vendored
  `@asym/pdf-editor` at runtime.
- Native save mutates `pdf_templates.design`; it does not create an immutable
  `pdf_template_versions` row.
- Native render accepts client-supplied template data and `dataContext`, calls
  DocRaptor behind rollout guards, then discards the PDF bytes. It writes no
  render, artifact, Storage object, or download record.
- The native adapter does not require DocRaptor production mode; configured
  test mode can return a watermarked PDF and still report render success. The
  corrected-receipt path has a stricter production-mode guard that native must
  adopt before official output.
- Asset signing returns no URL, and batch execution only returns scaffold
  metadata. These paths are not production document orchestration.

### Receipts and annual statements

- The donor receipt route returns a live-data `.txt` file and does not require
  settled status. It is not official receipt truth.
- Staged-gift receipts use hard-coded HTML/text and the shared email seam, not
  Statement Studio.
- Corrected receipts have the strongest reusable seam: a stored correction-time
  snapshot, capability checks, and production-mode DocRaptor rendering. The app
  treats snapshots append-only, but the database does not prevent updates,
  deletes them with the donation, and does not enforce same-tenant references.
  The path still uses hard-coded HTML and persists no document artifact.
- `gift_receipt_records` is an unwired, test-language scaffold. Its comment says
  corrections are append-only, but its unique donation index permits only one
  row per donation.
- The annual statement route is donor/tenant/year scoped and filters settled
  statuses, but recomputes a tab-delimited `.txt` file from mutable flat
  donations. It has no receiptable eligibility, effective corrections, partial
  refunds, currency partitioning, frozen inclusion snapshot, template version,
  artifact, retention, or delivery audit.

Statement Studio must consume source-domain receipt/statement DTOs. It must not
become another money, legal-donor, designation, correction, or receipt-truth
store.

## Persistence, RLS, and Storage Findings

Reuse the existing concepts as follows:

| Existing table                                     | Canonical role                                                                                     |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `pdf_templates`                                    | Tenant template aggregate and legacy migration root                                                |
| `pdf_template_versions`                            | Mutable draft working state; immutable published/archive snapshots, enforced by the lifecycle seam |
| `pdf_template_renders`                             | Render attempt and diagnostics                                                                     |
| `pdf_template_artifacts`                           | Durable output metadata                                                                            |
| `pdf_template_audit_events`                        | Append-only lifecycle, access, and purge audit                                                     |
| `pdf_template_batches` / `pdf_template_batch_jobs` | Batch orchestration                                                                                |

Add only the missing concepts: system job catalog, tenant job settings, scoped
assignments/defaults, variable catalog/tenant overrides, and retention policy.
Keep `gift_receipt_records` and `contribution_receipt_snapshots` outside
Statement Studio while Giving reconciles them. Each official job must expose one
canonical domain context/source ID; Statement Studio must not canonize both
receipt tables as parallel truth.

Hardening required before the child tables receive production writers:

1. `pdf_templates.tenant_id` is nullable. Backfill and require it for tenant
   templates while modeling system starters explicitly.
2. Child foreign keys reference IDs without tenant identity. Add same-tenant
   composite keys/foreign keys, including current-version pointers.
3. Published versions are described as immutable but authenticated staff have
   direct `UPDATE` grants and policies. Freeze version content and hash; expose
   constrained server-side lifecycle operations.
4. RLS permits any staff member to mutate tables while the API requires
   admin/super-admin. Revoke direct authenticated writes or add capability-aware
   policies so the Data API cannot bypass the application contract.
5. The older demo migration left a permissive `public read` policy on
   `pdf_templates`. The native migration revokes anonymous table privileges but
   does not drop that latent policy; a later grant could reactivate it, and a
   hosted project missing the native migration may still expose templates.
   Explicitly drop it and verify deployed grants/policies.
6. Artifacts lack job, scope, subject/recipient, sensitivity, retention,
   current/superseded/void lineage, expiry/purge/tombstone, and download-audit
   fields. Add explicit relational access data rather than hiding authorization
   in generic JSON.
7. There is no private generated-document bucket or Storage adapter. The
   existing `document-uploads` bucket is public and must never hold receipts,
   statements, care packets, or legal documents.
8. Production artifacts must require a private bucket/path, checksum, size,
   immutable source reference, and exact template version. A permanent URL is
   not a sufficient production invariant.
9. Production renders need a stable server-derived logical render key,
   lease/fencing-token retry ownership, and at most one canonical artifact per
   immutable input/template/output tuple. Provider retries must not duplicate
   bytes, delivery, or logical completion audit.
10. Delete bytes through the Storage API and retain an audited artifact
    tombstone. Do not delete `storage.objects` rows directly.

Donor and missionary downloads must use authenticated portal BFF routes that
re-authorize tenant, role, recipient, subject, and document state before
streaming bytes or issuing a short-lived signed URL. Service-role Storage
access bypasses RLS, so route authorization is mandatory rather than optional.

The repository proves committed migrations, not deployed Supabase state.
Hosted migration and tenant-template inventory remain an operator check before
cutover or deletion.

## Domain Owners and Readiness

| Domain/surface    | Source owner and readiness                                                                                                       | Statement Studio boundary                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Giving / donor    | `packages/api/src/giving/**`, Contribution Operations, and donor-portal BFFs are real but receipt/statement truth is fragmented. | Giving builds immutable official-document contexts; Statement Studio renders them verbatim.                   |
| Reports / finance | Admin CRM reports expose a tenant-scoped DTO and audited CSV, but still aggregate flat completed donations.                      | Reuse the report service after its financial semantics are approved; keep CSV operational exports.            |
| Missionary        | `packages/api/src/missionary-portal/**` is a real role-scoped BFF; no statement resolver exists.                                 | Add a missionary-owned DTO later; do not query its tables from the renderer.                                  |
| Events            | Current event UI/collections are largely mock or seed data.                                                                      | Starter/sample templates only until Events exposes a production resolver.                                     |
| Support           | Support Hub has real adapters and report routes, though some aggregation remains client-side.                                    | Consolidate a server report DTO before adding PDF output.                                                     |
| Member care       | Member-care reads/routes are real and sensitive.                                                                                 | Defer until redaction, elevated access, retention, and access audit receive HITL approval.                    |
| Tasks / mobilize  | Shared Mission Control tasks are the operational owner; several UI collections and Mobilize data are seed/in-memory.             | Use the shared task service only; defer Mobilize documents until its source is durable.                       |
| Legal / signing   | Current Sign surfaces contain hard-coded/mock values and no production owner model.                                              | Defer; legal copy, evidence, access, and retention require separate HITL review.                              |
| CMS               | Tenant-scoped Payload collections and published reads are valid approved-content inputs.                                         | CMS can supply branding/content/assets, never donation or operational truth; add a render-safe asset adapter. |

## First Production Slice Contract

`donor.statement.annual_giving` remains the first donor-facing production job
because it has an existing donor-owned route and dashboard entry point and
proves repeaters, totals, variables, assignment, immutable versions, private
artifacts, and recipient-scoped download.

The current route is not the production resolver. Before production, the
Giving/statement domain must expose one canonical frozen statement snapshot and
version contract. Newer proposed Phase 7 work in
[#579](https://github.com/Asymmetric-al/core/issues/579),
[#580](https://github.com/Asymmetric-al/core/issues/580), and
[#584](https://github.com/Asymmetric-al/core/issues/584) already reserves this
seam; Statement Studio must coordinate with it rather than introduce a parallel
`AnnualGivingStatementContext`. The approved contract must freeze:

- tenant and legal donor identity;
- covered period and currency partition;
- settled and receiptable inclusion decisions;
- effective designation/allocation lines;
- corrections, voids, and partial/full refund treatment;
- totals and generation policy/version;
- raw money/date values, canonical display strings, frozen locale, and
  formatting-policy version;
- source record IDs and an immutable context hash.

For official receipt/statement fields, templates bind the frozen display
strings and use the raw values only for audit/validation; they do not format
money or dates at render time. Statement Studio may lay out the supplied values
but may not recalculate, reformat, or override official facts. Production render
endpoints resolve the snapshot server-side and never accept financial
`dataContext` from the browser.

When a later correction, refund, donor relink, or void changes official
statement truth, Giving determines the effect. Statement Studio marks the old
artifact superseded/void, links correction and replacement lineage, retains old
bytes/audit only per policy, and keeps stale output out of the portal's current
download view.

Safe sequence:

1. Mission Control shell, starter catalog, immutable template/version model,
   and a synthetic admin-only tracer visibly marked
   `SAMPLE - NOT AN OFFICIAL DOCUMENT`; it cannot be assigned or delivered.
2. Job settings/assignment, render/artifact lifecycle, private Storage, and
   authorized download with cross-tenant tests. Coordinate with the proposed
   platform tenant-isolation Phase 4 foundation
   ([#505](https://github.com/Asymmetric-al/core/issues/505) and
   [#516](https://github.com/Asymmetric-al/core/issues/516)); reuse its approved
   composite-key, tenant-guard, `FORCE RLS`, and permanent negative-test posture
   instead of building a competing isolation layer.
3. Canonical Giving/Phase 7 statement snapshot and version contract plus
   finance/legal approval.
4. Replace the donor `.txt` response with the authorized Statement Studio
   artifact path, record delivery/download, and prove correction supersession.
5. Reconcile the four receipt paths before `donor.receipt.single` becomes the
   next official-document job.

The published dependency graph is stale at the production-render boundary.
Issue [#322](https://github.com/Asymmetric-al/core/issues/322) must be
re-groomed with the newer proposed statement work
([#579](https://github.com/Asymmetric-al/core/issues/579),
[#580](https://github.com/Asymmetric-al/core/issues/580),
[#583](https://github.com/Asymmetric-al/core/issues/583), and
[#584](https://github.com/Asymmetric-al/core/issues/584)) so canonical facts,
run/version ownership, frozen formatting, private artifact authorization,
portal cutover, and finance/legal approval are explicit gates. Completing #320
alone is not sufficient. Outbound delivery additionally waits for or
co-sequences with the Phase 6 communication seam
([#552](https://github.com/Asymmetric-al/core/issues/552),
[#553](https://github.com/Asymmetric-al/core/issues/553), and
[#554](https://github.com/Asymmetric-al/core/issues/554)) and its proposed
document adapter [#581](https://github.com/Asymmetric-al/core/issues/581).
Authenticated self-download may remain a separate slice because it does not
send through that seam.

## Reuse, Replace, Retire, Delete

### Reuse

- Asym template schema, preflight, table/repeater primitives, and provider port.
- DocRaptor server adapter plus the corrected-receipt production-mode guard as
  the provider candidate. Native rendering must adopt that fail-closed mode
  check and pass representative qualification before HITL approval.
- Thin App Router exports and role-scoped portal BFF seams.
- `pdf_*` migration concepts, corrected-receipt snapshots, shared email seam,
  idempotency, and delivery logs.

### Replace or complete

- PDF Studio naming, raw JSON authoring, mutable root-row publishing, and
  client-supplied production data.
- Metadata-only native render with durable render/artifact/Storage behavior.
- Broad staff mutation policies and ID-only cross-tenant foreign keys.
- Live `.txt` official-document routes and hard-coded receipt PDF HTML with
  source-domain contexts plus assigned immutable templates.

### Retire later

- Unlayer editor/export, fallback flags, dependencies, and legacy tests after
  verified cutover and tenant-template disposition.
- Legacy `pdf_templates.design/html/is_default` as native truth after versions
  and assignments become authoritative.

### Delete now

- Nothing.

## Human Approval Gates

- Qualify DocRaptor with representative repeaters/tables, pagination,
  headers/footers, fonts/private assets, fidelity/accessibility, fail-closed
  production mode, provider limits, latency, and cost. HITL then approves it as
  the sole first-slice provider or selects an explicit alternative.
- Approve annual statement inclusion/correction/refund/currency semantics and
  official language with finance/legal owners.
- Approve the deployed-template migration/disposition plan after querying the
  hosted project.
- Re-groom #322 before implementation. Care/legal jobs retain their separate
  HITL gates.

## Checklist

- [x] Current behavior is grounded in exact file paths in the evidence appendix.
- [x] Supabase, backend, frontend, OpenSpec, and installed Next.js guidance were checked.
- [x] Legacy and native PDF dependencies are classified.
- [x] Donor receipt and annual-statement behavior is distinguished accurately.
- [x] Data owner boundaries are recorded across requested product surfaces.
- [x] RLS, same-tenant integrity, Storage, artifact, and deployment risks are explicit.
- [x] An evidence-based safe tracer and first donor-facing job recommendation is recorded.
- [x] Reuse, replace, retire, and delete decisions are actionable.
- [x] The HITL decision package is complete and linked to PR #715; merge records
      repo approval of the Phase 0 decisions.
