# Phase 23 D29 Content Portability Primary-Source Research

**Status:** Complete supporting evidence for the founder-ratified Phase 23 D29
B-prime-R decision. It qualifies current providers, standards, repository seams,
and cross-phase boundaries without independently expanding the ratified
authority or authorizing implementation.

**Date:** 2026-08-24

**Ratified:** 2026-08-24

## Research question

What is the smallest durable contract that lets authorized nonprofit staff
export useful content and participate in a transparent legacy-CMS migration,
while restricting mutation to a privileged, checked, private-draft-only path
and preserving Asym's Tenant, locale, media, revision, and release invariants?

The answer must distinguish four things that generic CMS products often blur:

1. a readable spreadsheet export;
2. a semantic portable package;
3. a no-write import plan; and
4. an authorized target-domain mutation.

## Current-version posture

Research was refreshed on 2026-08-24. Version-sensitive implementation facts
must be requalified at implementation time.

| Component                    | Verified posture                                                                                                                                                                                                  | D29 consequence                                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Core Payload                 | `payload@4.0.0-internal.1f9ae9a`                                                                                                                                                                                  | Internal exact pin; public stable documentation alone is insufficient.                                                                |
| Core Payload UI              | `@payloadcms/ui@4.0.0-internal.1f9ae9a`                                                                                                                                                                           | Any plugin must match this exact internal artifact.                                                                                   |
| Payload import/export plugin | Exact artifact `@payloadcms/plugin-import-export@4.0.0-internal.1f9ae9a` exists and peers the exact Payload/UI pin; it is not installed. Latest stable observed was `3.88.0`, peering stable Payload/UI `3.88.0`. | Never install the stable 3.x plugin into the internal 4.x pin. Qualify the exact internal artifact behind an adapter before adoption. |
| Supabase                     | Postgres/Auth/RLS/Storage are existing platform seams                                                                                                                                                             | RLS, object policies, private custody, and app authorization must compose; service-role use cannot substitute for Tenant predicates.  |
| Inngest                      | Existing Core workflow-orchestration seam                                                                                                                                                                         | One executor may coordinate bounded work, but permanent product idempotency and receipts remain in Postgres.                          |

Reproducible version check:

```powershell
npm view payload@4.0.0-internal.1f9ae9a version peerDependencies
npm view @payloadcms/ui@4.0.0-internal.1f9ae9a version peerDependencies
npm view @payloadcms/plugin-import-export@4.0.0-internal.1f9ae9a version peerDependencies
npm view @payloadcms/plugin-import-export@latest version peerDependencies
```

The version facts prove compatibility candidates, not product fitness.

## Payload import/export findings

### What the official plugin usefully provides

The current [Payload Import/Export plugin documentation](https://payloadcms.com/docs/plugins/import-export)
describes:

- CSV and JSON import/export;
- current selection, current filters, or all-document export scope;
- field selection, locale, drafts, depth, pagination, and sorting;
- browser download or saved export uploads;
- import preview and create/update/upsert modes;
- per-collection transformation hooks and result/error information;
- global/per-collection limits; and
- Payload Jobs Queue execution for larger work.

Those are useful mechanics. They do not define D29's exact Tenant/Site/locale,
capability, semantic compatibility, no-write plan, D12 revision, D27 media,
reconciliation, or D1 release contract.

Payload's
[3.85 release announcement](https://payloadcms.com/posts/releases/new-in-payload-import-explort-plugin-out-of-beta)
records that the plugin left beta and gained richer field/collection hooks. That
is meaningful maturity evidence for the adapter. It is not evidence that the
stock UI or generic mutation semantics satisfy Asym's product contract, and the
announcement concerns the public 3.x line rather than Core's internal 4.x pin.

### The plugin itself documents important operational hazards

Payload explicitly says:

- queued work remains pending unless a Jobs Queue runner is configured;
- synchronous operation blocks the request;
- generated `imports` and `exports` collections are hidden from navigation by
  default but their routes remain directly accessible;
- applications must add access control to stored export upload collections;
- import/export limits default to `0`, meaning unlimited; and
- generic import exposes `create`, `update`, and `upsert` behavior.

Therefore hiding a collection is not authorization, enabling the plugin is not
operations readiness, and provider defaults are unsafe for a multi-Tenant
staff product.

### Exact Core-pin source inspection

The exact commit backing Core's internal pin is public, which allows the
adapter behavior to be checked rather than guessed:

- [`batchProcessor.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/plugin-import-export/src/import/batchProcessor.ts)
- [`handlePreview.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/plugin-import-export/src/import/handlePreview.ts)
- [`getImportCollection.ts`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/plugin-import-export/src/import/getImportCollection.ts)

Material findings:

1. **The batch is deliberately not one transaction.** `batchProcessor.ts`
   isolates and clears `transactionID` before nested writes and states that it
   continues after individual document failures. That behavior is reasonable
   for a generic batch utility but means D29 needs item receipts, explicit
   partial states, and reconciliation.
2. **Target operations retain Payload access checks.** The exact processor uses
   `overrideAccess: false`, which is the correct provider baseline. It still
   cannot prove Asym's Site/locale/capability/plan invariants or authorize a
   target owner-domain mutation by itself.
3. **Localized writes are sequential.** The processor writes a base/default
   locale and then performs follow-up locale updates. A localized update failure
   is logged without rolling back the already-created document. D22 therefore
   cannot accept provider success as locale completeness.
4. **The generic fallback status is published.** The exact-pin collection code
   and processor default the version status to `published`. D29 must never let
   this default reach an owner command; imported content is private working
   revision only.
5. **Preview is a syntactic preview.** `handlePreview.ts` base64-decodes and
   parses the supplied data before slicing the in-memory result for the shown
   page. It does not prove relationship closure, D2/D3 paths, D11 block
   compatibility, D22 locale completeness, D27 media eligibility, D12
   expected revisions, or authorization at future commit time.
6. **Rows can continue after failure.** This is not inherently wrong, but a
   green provider run with row errors is not D29 completion. The product must
   reconcile every planned item to a terminal disposition.

The plugin can be an adapter only if these semantics are explicitly contained.
Using its raw collections, UI, preview, mutation modes, or jobs as product
authority would create technical debt immediately.

### Product boundary over plugin hooks

Payload hooks can transform provider rows, but a hook chain is not an adequate
domain boundary because:

- it is coupled to collection and field names;
- order and provider upgrade behavior become migration-critical;
- it may run inside provider batch semantics;
- it does not inherently seal an immutable no-write plan; and
- it can tempt direct `payload.create`/`payload.update` calls around owner
  commands.

D29 therefore requires a source-neutral candidate, deterministic validator,
sealed plan, and typed target command outside the plugin shape. A plugin hook
may implement one adapter step and must be covered by exact-pin contract tests.

## Comparable CMS and migration-product findings

### Contentful

[Contentful's import/export documentation](https://www.contentful.com/developers/docs/tutorials/cli/import-and-export/)
is explicit about scope and loss. Draft inclusion is optional, and an export
does not simply carry complete version history, workflows, tasks, releases,
authorship, credentials, apps, or memberships. It also requires compatible
locale/content-model conditions at the destination.

**D29 lesson:** show exclusions and compatibility before commit. Never call a
content package a complete account or website backup.

### Sanity

Sanity's [import documentation](https://www.sanity.io/docs/content-lake/importing-data)
and [migration CLI guidance](https://www.sanity.io/docs/cli-reference/cli-migrations)
emphasize stable document IDs, validation, backups/staging, progress, and dry
run before mutation. Its migration guidance also encourages idempotent changes.

**D29 lesson:** stable source identity and a no-write plan are baseline safety,
but D29 must go further by sealing the plan against the exact Asym destination
state.

### WordPress

WordPress uses source-specific importers and exposes author/attachment choices
in its [import guidance](https://developer.wordpress.org/advanced-administration/wordpress/import/).
Its [export guidance](https://wordpress.org/documentation/article/tools-export-screen/)
explains that WXR contains content references rather than being a full Site or
binary backup.

**D29 lesson:** source-specific adapters and explicit author/media dispositions
are more honest than one universal importer.

### Webflow

Webflow's [CMS import guidance](https://help.webflow.com/hc/en-us/articles/33961290794771-How-do-I-import-content-into-the-Webflow-CMS)
uses column mapping, create/update choices, row limits, visible failure lists,
and downloadable error details. Its localized CMS import support demonstrates
that locale choice must be explicit.

**D29 lesson:** mapping and issue reports are expected, but Asym should improve
on workflows that require the browser to remain open by persisting the run and
continuing durably.

### HubSpot

HubSpot's [import tool overview](https://knowledge.hubspot.com/import-and-export/understand-the-import-tool),
[file setup](https://knowledge.hubspot.com/import-and-export/set-up-your-import-file),
and [error guidance](https://knowledge.hubspot.com/import-and-export/troubleshoot-import-errors)
use property mapping, unique identifiers, explicit impact, and detailed
row/error remediation.

**D29 lesson:** staff need examples and repairable errors, but content identity
must not be inferred from an arbitrary selected property.

### Salesforce Data Loader

The current [Salesforce Data Loader import flow](https://developer.salesforce.com/docs/platform/dataloader/guide/import-data.html)
uses a wizard, suggested mappings, mapped/unmapped filters, a review summary,
background batches, and result files. Its Insert/Update/Upsert vocabulary is
appropriate for data specialists, not occasional Web Studio staff.

**D29 lesson:** preserve the structured journey and results, but replace raw
mutation modes with consequence-specific private-draft language.

### Embedded importer products

Flatfile's [mapping guidance](https://support.flatfile.com/articles/8569925090-mapping-data),
Dromo's [review states](https://developer.dromo.io/getting-started/headless), and
OneSchema's [validation outcomes](https://docs.oneschema.co/docs/validating-and-importing)
converge on upload, map, validate, and review. Suggested mappings still require
review. Some products permit valid rows to proceed while invalid rows are
excluded.

**D29 lesson:** Phase 30 may adopt high-quality mapping/grid mechanics, but D29
must not silently exclude invalid content and call the run complete. Every
planned source item needs an explicit disposition and reconciled count.

### Shopify as a cautionary comparator

Shopify's [CSV import guidance](https://help.shopify.com/en/manual/products/import-export/import-products)
documents overwrite options, blank-value effects, relationship sensitivity,
and limited cancellation/history behavior.

**D29 lesson:** distinguish absent from intentionally blank, prohibit review-
CSV round trip, preserve durable run history, and do not promise cancellation
after writes have begun.

## Security and file-handling research

### OWASP file upload guidance

The [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
supports allowlisted extensions/types, MIME/signature verification, generated
filenames, size limits, private/outside-webroot storage, malware/content
checking where applicable, authorization, CSRF protection, and archive safety.

D29 extends this to migration-specific limits:

- compressed and expanded bytes;
- number and depth of archive entries;
- row/node/relationship/string counts;
- parsing and execution time;
- image dimensions/decompression budgets; and
- no macros, executable templates, or active content.

### CSV formula injection

The [OWASP CSV Injection guidance](https://owasp.org/www-community/attacks/CSV_Injection)
describes spreadsheet formula execution from attacker-controlled leading
characters and delimiter/newline tricks.

Core already centralizes formula-safe serialization in
[`packages/lib/csv.ts`](../../../../packages/lib/csv.ts). D29's readable CSV and
downloadable issue report must reuse that helper and remain explicitly
non-reimportable. A typed JSON package avoids treating human-edited spreadsheet
cells as semantic authority.

### Mass assignment

The [OWASP Mass Assignment Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html)
recommends allowlisted data-transfer objects rather than binding external input
directly to domain models.

D29's neutral candidate and target command are exactly that protection. Raw
Payload fields, status, Tenant IDs, ownership, access policy, audit fields,
published state, storage keys, or future privileged fields cannot ride through
an imported object.

### Resource consumption

The [OWASP API unrestricted resource consumption guidance](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/)
supports explicit size, frequency, memory, CPU, and provider-spend limits.

D29 therefore seals run budgets before commit, uses bounded chunks, constrains
Tenant concurrency, and measures provider usage. Unlimited plugin defaults are
unacceptable.

### SSRF and remote media

Legacy content often references remote media. Fetching those URLs creates an
SSRF and decompression/resource risk. The permanent adapter must allow only
qualified HTTPS retrieval, safely resolve and pin public addresses, reject
private/link-local/loopback/metadata targets and unsafe redirects, cap bytes
and time, verify media type/signature, and move results into private Phase 29
custody. D27 qualification remains separate.

## Supabase and Postgres findings

### RLS is required at every exposed table boundary

Supabase's [RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
requires RLS for exposed tables and explains policy behavior. D29 run, item,
plan, artifact, mapping, and receipt rows need explicit Tenant predicates,
matching grants, and authorization tests for select/insert/update/delete and
RPC surfaces.

Service credentials can bypass RLS. Background workers must carry a trusted,
validated scope envelope and include Tenant/Site predicates in every query and
owner command. A service role is not permission to infer a target.

### Storage is private by default only when policy remains correct

Supabase's [Storage bucket fundamentals](https://supabase.com/docs/guides/storage/buckets/fundamentals)
and [Storage access-control guidance](https://supabase.com/docs/guides/storage/security/access-control)
show that private-bucket operations are governed through `storage.objects` RLS
and bucket/file restrictions.

D29 requires:

- separate purpose-qualified private prefixes or buckets;
- opaque generated object keys containing no trusted authorization fact;
- exact Tenant/Site/run metadata in the product database;
- RLS/policy tests that prevent cross-Tenant listing, read, write, move, and
  delete;
- server-authorized object access tied to the product record;
- retention and orphan cleanup with receipts; and
- no public bucket for source files or exports.

### Resumable uploads improve real migration UX

Supabase's [resumable-upload guidance](https://supabase.com/docs/guides/storage/uploads/resumable-uploads)
uses TUS for larger files and unreliable networks. This matches nonprofit staff
working across variable connectivity. Resumability belongs to Phase 30's
transport seam and must preserve one artifact identity/digest rather than
creating duplicate source files after a retry.

Current guidance recommends TUS for files above 6 MiB or when network stability
and progress matter, and warns that concurrent writes to one path conflict while
upsert is last-completion-wins. D29 therefore uses server-issued, unique,
immutable object paths and never resumes by overwriting a shared filename. The
numeric threshold is provider guidance to recheck at implementation, not a
domain constant.

### Signed URLs are transport, not revocable authority

Supabase's [download guidance](https://supabase.com/docs/guides/storage/serving/downloads)
states that signed URLs remain valid until expiry and are not invalidated by
Auth key rotation; revocation may require support.

Therefore the safest default is an authenticated Asym download endpoint that
re-proves capability and scope, audits the action, then streams or issues a
very short-lived transport URL. Durable UI records never expose a long-lived
bearer link.

### Exact export snapshots

PostgreSQL's [transaction-isolation documentation](https://www.postgresql.org/docs/current/transaction-iso.html)
supports repeatable-read/serializable transaction snapshots when a coherent
multi-query view is required. The export compiler should seal exact item
revision IDs and authorization under a coherent transaction, then render from
those immutable identities. This avoids offset-pagination drift when records
are inserted or edited during preparation.

Large artifact creation must not hold one database transaction open while
serializing bytes. Seal the snapshot briefly; render later from the sealed,
authorized revision set.

## Inngest and durable-execution findings

### Fit

Inngest's [step model](https://www.inngest.com/docs/learn/inngest-steps) and
[error-handling guidance](https://www.inngest.com/docs/guides/error-handling)
support retries and checkpointed functions. Its
[concurrency guidance](https://www.inngest.com/docs/guides/concurrency)
supports keying limits by Tenant and clarifies that concurrency limits active
steps rather than total in-flight runs.

That makes Inngest suitable for orchestrating one product-owned import/export
ledger, provided every step is idempotent and re-reads product state.

### Permanent idempotency must stay in the product database

Inngest's [idempotency guidance](https://www.inngest.com/docs/guides/handling-idempotency)
documents a 24-hour event-ID deduplication window. Migrations can be retried,
resumed, audited, or rediscovered much later than 24 hours.

The product ledger therefore owns permanent semantic idempotency, run/item
receipts, expected versions, and reconciliation. An Inngest event ID is a
transport dedupe aid only.

### State and cost need bounded chunks

Inngest's [usage limits](https://www.inngest.com/docs/usage-limits/inngest)
currently document limits including 1,000 steps per function, 4 MiB returned
per step, and 32 MiB total function-run state. Pricing counts function runs and
steps.

D29 should dispatch one run, process deterministic bounded chunks, store item
bodies/results in private storage/Postgres, and return small scalar summaries
from steps. A row-per-event or row-per-step design is both fragile and
needlessly expensive.

### Do not discard import work

Inngest's [rate-limiting guidance](https://www.inngest.com/docs/guides/rate-limiting)
is designed to skip excess events. That is wrong for imports. Use queued
concurrency/throttling/backpressure and a durable product backlog; never use a
discarding rate limit for admitted work.

### One orchestrator

Core already defines workflow dispatch, claims, recovery, summaries, and
dead-letter behavior. Enabling Payload Jobs for the same run would create two
retry, cancellation, observability, and idempotency planes. D29 therefore uses
one Core/Inngest executor and treats any Payload parsing or serialization call
as a bounded adapter step.

## Accessibility evidence

W3C WAI guidance supports the selected staff journey:

- [multi-page forms](https://www.w3.org/WAI/tutorials/forms/multi-page/) for
  logical steps, progress, and review;
- [form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/) and
  [notifications](https://www.w3.org/WAI/tutorials/forms/notifications/) for
  persistent, programmatic, actionable guidance;
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
  for announcing processing changes without moving focus; and
- [WCAG error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-all.html)
  for reviewing consequential submissions.

The import journey must therefore be a saved full-page workflow, not a cramped
modal. Drag-and-drop is optional; native file choice, keyboard mapping,
focusable linked error summaries, textual status, responsive issue rendering,
and truthful completion pages are required.

## Exact repository evidence

### Product and UI boundaries

- [`apps/admin/src/cms-ui/web-studio/README.md`](../../../../apps/admin/src/cms-ui/web-studio/README.md)
  defines Web Studio as the product wrapper over Payload, uses TanStack Form for
  custom wizards, and routes staff data handlers through `packages/api`.
- [`docs/guides/architecture/web-studio-living-spec.md`](../../../guides/architecture/web-studio-living-spec.md)
  keeps Payload behind the Mission Control experience and documents current
  UI/data-access boundaries.
- [`packages/ui/components/shadcn/data-table/index.ts`](../../../../packages/ui/components/shadcn/data-table/index.ts)
  exposes the shared responsive table seam; D29 should not introduce a second
  desktop-only spreadsheet component.
- [`packages/ui/components/shadcn/progress.tsx`](../../../../packages/ui/components/shadcn/progress.tsx)
  supplies the shared progress primitive, but D29 must provide truthful
  accessible value text and indeterminate behavior rather than inventing a
  percentage.
- [`packages/ui/components/primitives/tanstack-form.tsx`](../../../../packages/ui/components/primitives/tanstack-form.tsx)
  already wires field errors through accessible descriptions. Repository
  inspection found no complete reusable linked error-summary component; D29
  requires one rather than collapsing a large import to the first error.

### Governed export precedents

- [`packages/lib/csv.ts`](../../../../packages/lib/csv.ts) is the canonical
  spreadsheet-safety helper.
- [`packages/api/src/admin/crm/reports/export.ts`](../../../../packages/api/src/admin/crm/reports/export.ts)
  demonstrates server-derived Tenant access, audit information, request ID,
  and attachment response.
- [`packages/api/src/email/templates.ts`](../../../../packages/api/src/email/templates.ts)
  demonstrates a versioned product export DTO and refusal to export
  unmaterialized editor state.
- [`packages/ui/components/shadcn/data-table/utils/export.ts`](../../../../packages/ui/components/shadcn/data-table/utils/export.ts)
  is useful for small, human-facing table downloads but is not the semantic
  package authority. D29 package export remains server compiled.

### Capability and audit precedents

- [`packages/api/src/admin/contribution-operations/permissions.ts`](../../../../packages/api/src/admin/contribution-operations/permissions.ts)
  is the better pattern: one code-owned per-action capability table shared by
  view, route, and executor. Current coarse staff role sets and Payload-user
  presence checks are not sufficient for D29.
- [`packages/api/src/admin/support-hub/audit.ts`](../../../../packages/api/src/admin/support-hub/audit.ts)
  demonstrates a durable fail-closed audit posture. Generic logger-only CMS
  hooks are inadequate for privileged bulk mutation.

### Durable workflow precedents

- [`packages/api/src/workflows/dispatch.ts`](../../../../packages/api/src/workflows/dispatch.ts)
  validates dispatch envelopes, supports a handoff dedupe ID, and returns a
  recordable failure.
- [`packages/api/src/workflows/recovery.ts`](../../../../packages/api/src/workflows/recovery.ts)
  scans product ledger rows with claims, bounded attempts, and dead-letter
  counts.
- [`packages/api/src/workflows/summaries.ts`](../../../../packages/api/src/workflows/summaries.ts)
  exposes safe product summaries rather than raw provider context/errors.
- The merged [workflow-orchestration OpenSpec](../../../../openspec/specs/workflow-orchestration/spec.md)
  makes the product ledger and idempotency keys authoritative over provider
  execution.

### Phase boundaries

- [D1 ADR-0145](../../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
  keeps saved, scheduled, compiled, activated, and public states distinct.
- [D12 ADR-0156](../../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
  requires exact scope/permission, expected revision, compatibility,
  idempotency, and visible imported/migrated checkpoints.
- [D18 ADR-0162](../../../adr/0162-purpose-bounded-authority-free-content-library-folders.md)
  keeps folders non-authoritative and establishes stable folder identity.
- [D23 ADR-0167](../../../adr/0167-exact-site-owned-ordinary-content-with-independent-copy-to-site-drafts.md)
  supplies useful transfer-manifest, compatibility, repair, digest, receipt,
  and private-result patterns while explicitly remaining one-item copy, not
  migration.
- [D25 ADR-0169](../../../adr/0169-immutable-whole-site-preview-candidates-over-sealed-site-plan-inputs.md)
  makes whole-Site Preview a deliberately sealed private candidate, not a raw
  import preview.
- [D27 ADR-0171](../../../adr/0171-tenant-wide-public-media-catalog-and-immutable-custody.md)
  owns stable media references and public-use qualification while Phase 29
  owns private bytes.
- [Phase 30 roadmap](../roadmap.md#phase-30--imports--migration-tools-imports-migration)
  owns upload/mapping/staging/grid/batch mechanics and requires target-domain
  typed commands rather than raw writes.

## Permanent architectural conclusions

1. Use a neutral, versioned package and candidate model; never make Payload
   documents or CSV rows the semantic interchange contract.
2. Separate syntactic parsing, semantic no-write planning, and privileged owner
   command execution.
3. Seal plans against source, mapping, authorization, and destination versions;
   reject stale plans.
4. Store product-owned permanent idempotency and per-item receipts; use one
   Inngest executor for bounded, resumable orchestration.
5. Keep artifacts private and reauthorize every download.
6. Use certified source adapters plus an honest qualification lane; do not
   promise arbitrary-CMS compatibility.
7. Create private working revisions only; publication remains a later D1
   decision.
8. Keep general transport/mapping/workbench mechanics in Phase 30 and content
   semantics in Phase 23.
