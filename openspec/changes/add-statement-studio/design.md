# Design: Statement Studio Document Production

## Source Inputs

- `openspec/project.md`
- `openspec/specs/platform-{boundaries,principles,surfaces}/spec.md`
- `openspec/specs/{donation-lifecycle,contribution-operations,identity-and-access}/spec.md`
- `openspec/changes/add-donor-self-service/**`
- `docs/guides/features/statement-studio/**`
- `docs/guides/architecture/data-access-boundary.md`
- Current PDF, donor portal, receipt, migration, and test evidence recorded in
  `docs/guides/features/statement-studio/phase-0-research-evidence.md`

## Phase 0 Decisions

1. Extend the existing `pdf_*` persistence family; do not create parallel
   `document_*` tables.
2. Use a safe admin/sample-data tracer before an official financial document.
3. Keep `donor.statement.annual_giving` as the first donor-facing production
   job, but gate it on the canonical frozen statement snapshot/version contract
   and finance/legal review.
4. Propose the current Asym schema and DocRaptor server adapter as the only
   first-slice production renderer, subject to provider qualification and HITL
   approval. Keep a renderer port so replacement remains possible without
   running two official paths.
5. Retire Unlayer only after replacement authoring/render/download and deployed
   tenant-template disposition are verified.

Merging this HITL change approves those decisions. Until then they are proposed
Phase 0 outcomes, not permission to enable official-document production.

## Ownership Boundary

Statement Studio owns:

- template aggregates, drafts, and immutable published versions;
- document-job catalog/settings and scoped version assignments;
- variable metadata and validation against domain context contracts;
- render orchestration and provider diagnostics;
- private artifact metadata, access delivery, retention, purge, and audit.

Source domains own:

- inclusion/eligibility, money, identity, designation, correction, refund, and
  receipt/statement truth;
- canonical raw values plus frozen official display strings, locale, and
  formatting-policy version for receipts/statements;
- event, missionary, report, care, task, legal/signing, and CMS facts;
- versioned context builders that enforce permissions and redaction before
  Statement Studio receives values.

The renderer treats an approved domain context as data, not as a suggestion.
For official receipt/statement values it binds the frozen display strings and
must not format money/dates or recompute facts. Raw structured values remain in
the context for validation and audit, not template-side calculation.

## Canonical Persistence

Map the current tables as follows:

- `pdf_templates`: tenant template aggregate and legacy source root;
- `pdf_template_versions`: immutable content and lifecycle versions;
- `pdf_template_renders`: attempts, provider state, inputs by reference, and
  diagnostics;
- `pdf_template_artifacts`: exact version/source/output metadata;
- `pdf_template_audit_events`: append-only lifecycle, access, and purge events;
- `pdf_template_batches` and `pdf_template_batch_jobs`: batch orchestration.

Add only missing concepts: system job catalog, tenant job settings, scoped
assignments/defaults, variable catalog/tenant overrides, and retention policy.
`gift_receipt_records` and `contribution_receipt_snapshots` remain outside
Statement Studio while Giving reconciles them. A production document artifact
references one canonical domain context/source ID selected by the owner for that
job; Statement Studio does not canonize both receipt tables as parallel truth.

Before runtime writers use the child tables:

- require tenant identity on tenant-owned roots;
- enforce same-tenant composite foreign keys across template, version, render,
  artifact, assignment, and current-version references;
- prevent updates to published version content/hash;
- remove broad direct authenticated writes or enforce capability-aware RLS;
- add artifact job, scope, subject/recipient, sensitivity, source, retention,
  current/superseded/void lineage, expiry/purge/tombstone, checksum, and
  download-audit data;
- update generated database types and prove policy behavior with real SQL tests.

## Production Pipeline

1. An authenticated caller requests a known document job and subject/scope.
2. The owning domain authorizes the request and builds a versioned context.
3. Statement Studio resolves the tenant/scoped assignment to one immutable
   published template version.
4. The template schema validates variables against the context contract.
5. A render row is created before invoking the renderer provider.
6. The server-only renderer returns bytes and diagnostics.
7. Bytes are uploaded to a private generated-document bucket at an immutable,
   tenant-aware path.
8. An artifact records exact template version, job, scope, recipient/subject,
   source context ID/hash, checksum, size, retention, and render outcome.
9. The authorized surface streams the bytes or creates a short-lived signed URL
   and records access/delivery.
10. If the source domain later corrects, refunds, relinks, or voids facts that
    made the document official, its policy marks the artifact superseded/void,
    links replacement context/artifact lineage, and keeps stale output out of
    the portal's current-document view without erasing retained history.

Preview routes may accept safe sample contexts. Production routes must resolve
domain contexts server-side and must not accept official `dataContext` values
from the browser.

## Authorization and Storage

Mission Control uses server-resolved capabilities for template lifecycle,
assignment, render, artifact, and retention operations. Donor and missionary
portals use their existing BFF boundaries and re-authorize tenant, role,
recipient/subject, source state, and artifact state on every download.

Generated documents use a private bucket. Service-role clients may write and
read after application authorization, but service-role RLS bypass is never
treated as recipient authorization. Public `document-uploads` and `email-assets`
buckets are ineligible.

Before production, the schema and persistence seam MUST coordinate with the
approved Phase 4 isolation foundation (#505/#516) and reuse its composite-key,
tenant-guard, `FORCE RLS`, and permanent cross-tenant negative-test posture.
Statement Studio does not invent a competing tenant-isolation primitive.

Authenticated portal self-download may be implemented through the role-scoped
BFF once artifact authorization is proven. Outbound email/delivery MUST wait for
or co-sequence with the Phase 6 communication spine and send seam (#552-#554)
plus the document delivery adapter (#581); Statement Studio does not create a
parallel provider send or communication-audit path.

Purge deletes bytes through the Storage API, then preserves a tombstone and
audit event. It does not delete `storage.objects` metadata directly.

## Sample Tracer Boundary

The infrastructure tracer uses synthetic data only and records an explicit
`sample`/`preview` purpose. Its output is admin-only, visibly marked
`SAMPLE - NOT AN OFFICIAL DOCUMENT`, ineligible for production assignment or
portal delivery, and excluded from official retention/delivery metrics. The
annual starter may be used only under those constraints until the Giving-owned
context and policy gates are complete.

## Renderer and Legacy Migration

The repository has working Asym schema/HTML composition and DocRaptor adapter
code but no pdfx or React PDF runtime dependency. Phase 0 therefore proposes
DocRaptor behind the provider port rather than adding a second production
stack. Before official enablement, representative fixtures must qualify its
repeaters/tables, page breaks, headers/footers, fonts and private assets,
fidelity/accessibility, fail-closed production mode, provider limits, latency,
and expected cost. HITL review either accepts those results/risks or selects a
different migration path.

The raw JSON native UI is not the target editor. The vendored editor package is
not adopted automatically because it depends on email-editor primitives and is
not used by the app. A later editor slice must prove a non-technical,
PDF-oriented experience against the Asym schema.

Unlayer remains read/edit/export compatibility for existing templates during
cutover. New Statement Studio templates use the native schema. Removal requires
a deployed template inventory, explicit migrate/archive/delete disposition,
and verified replacement flows.

## First Job and Rollout

The shell and infrastructure tracer uses safe sample data. The first
donor-facing production job remains `donor.statement.annual_giving` because the
donor portal already has an ownership-scoped route and visible download entry,
and the job proves repeaters, totals, versions, assignments, artifacts, and
recipient delivery.

The Giving/statement domain must first produce the canonical immutable,
versioned statement snapshot/run contract. It captures legal donor,
period/currency, settled and receiptable inclusion, effective designations,
corrections/refunds, totals, frozen display strings plus raw values and locale,
policy version, source IDs, and a context hash. Newer proposed issues #579,
#580, and #584 already reserve this ownership; implementation coordinates with
that seam rather than creating a parallel `AnnualGivingStatementContext`. This
also aligns with `add-donor-self-service` without duplicating its truth.

The current live `.txt` route remains non-official until the artifact path is
ready. Receipt production follows only after the live donor receipt,
staged-gift email, correction snapshots, and gift receipt scaffold have one
documented source-of-truth contract.

## Risks and Tradeoffs

- DocRaptor is a vendor dependency, but reusing the existing provider reduces
  migration risk and avoids dual renderer drift. The port preserves a later
  replacement path.
- Annual statements exercise more architecture than a one-gift receipt and
  therefore require a larger context contract. The sample-data tracer keeps
  infrastructure work from being blocked on financial semantics.
- Server-only mutations are less convenient than direct Data API writes but
  align authorization with Mission Control capabilities and protect sensitive
  artifacts.
- Hosted migration and tenant-template state are unknown from the repository;
  no destructive migration is allowed until operators inspect that state.
