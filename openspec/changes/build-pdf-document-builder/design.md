# Design: PDF-first document builder and rendering pipeline

## Overview

The PDF Document Builder will begin as a fork of the Resend React Email repo and
its `@react-email/editor` package, then diverge into a PDF-first document
authoring and rendering system for Asymmetric.al.

The target production pipeline is:

```text
DocumentTemplate JSON
  -> variable and data resolution
  -> document serializer
  -> print-ready HTML and CSS
  -> DocRaptor
  -> PDF artifact
  -> storage, audit log, and batch record
```

The editor JSON is the template source of truth. Raw HTML is an export artifact,
not the durable source of truth.

## Research Basis

This design is based on current vendor and library behavior checked on
2026-04-25:

- React Email Editor is an embeddable visual editor built on TipTap and
  ProseMirror, with rich text editing, bubble menus, slash commands, theming,
  image upload, custom extensions, and HTML export through
  `composeReactEmail` ([overview](https://react.email/docs/editor/overview),
  [serializer API](https://react.email/docs/editor/api-reference/compose-react-email)).
- `composeReactEmail` is a useful serializer model, but it walks email-aware
  extensions and returns email-ready HTML/plain text, so this project needs a
  document/PDF serializer rather than treating it as the final production PDF
  path.
- DocRaptor accepts `document_content` or `document_url`, defaults to print
  media for PDFs, supports CSS-controlled page size, margins, headers, footers,
  page counters, async jobs, PDF profiles, and accessible/tagged PDF options
  where needed ([API](https://docraptor.com/documentation/api),
  [CSS paged media](https://docraptor.com/css-paged-media),
  [async jobs](https://docraptor.com/documentation/article/1070755-asynchronous-document-creation),
  [headers/footers](https://docraptor.com/documentation/article/1067094-headers-footers),
  [page numbers](https://docraptor.com/documentation/article/1082618-page-numbers),
  [tagged PDFs](https://docraptor.com/documentation/article/6637003-accessible-tagged-pdfs)).
- Unlayer Document Builder is the product parity reference for dynamic
  templates, merge tags, branded documents, PDF/HTML export, forms/input fields,
  and document automation
  ([Document Builder](https://unlayer.com/document-builder)).
- `ds.shadcn` may be evaluated later for exact-position or canvas-oriented
  documents, but it is not part of the first PDF Document Builder foundation.

## Why Fork React Email Instead Of Building From Scratch

React Email Editor already has the hard editor foundations this project needs:

- TipTap/ProseMirror document model.
- Extension system for custom nodes and marks.
- Bubble menu and slash command UI patterns.
- Inspector and theming concepts.
- Image upload flow.
- Serializer pipeline from structured editor JSON to HTML.
- Existing package boundaries that can be forked and adapted.

Building these primitives from scratch would delay the actual product work:
document schema, data binding, page semantics, print-safe rendering, DocRaptor
fidelity, storage, batch generation, and migration from Unlayer.

## Why The Fork Must Become PDF-First

The fork must not remain an email editor that happens to export HTML for a PDF
service. Email and PDF documents have different constraints:

- PDFs have pages, headers, footers, page numbers, page breaks, margins, page
  size, orientation, and print media rules.
- Annual statements and financial reports need repeaters, data tables,
  grouping, totals, subtotals, carry-forward rows, and page-safe table breaks.
- Official donor and tax documents need auditability, template versioning,
  deterministic render metadata, and production fidelity checks.
- DocRaptor supports print-oriented CSS features that browsers and email
  clients do not share.

The PDF fork therefore needs a `composeReactDocument` or similarly named
serializer that walks document-aware extensions and emits print-ready HTML/CSS
for DocRaptor.

## Package Plan

Future implementation should isolate the builder behind packages so app code
does not absorb editor internals:

- `@asym/pdf-template-schema`: shared schema, validation, typed variables,
  versioning, and JSON model types.
- `@asym/pdf-editor`: editor shell, document extensions, toolbar/inspector
  surfaces, and editor-specific UI.
- `@asym/pdf-renderer`: data resolver, document serializer, print HTML/CSS
  shell, render validation, preview helpers, and golden fixtures.
- `@asym/docraptor-client`: server-only DocRaptor request construction, status
  polling/callback handling, error normalization, and retry metadata.
- Optional adapter package for `Asymmetric-al/core`: Mission Control routes,
  server actions/API handlers, storage adapters, audit adapters, and feature
  flag integration.

These package names are intended targets, not implementation created by this
OpenSpec change.

## Schema Plan

The first schema family should include:

- `DocumentTemplateV1`: tenant id, template id, category, status, version,
  editor JSON, page setup, theme reference, asset references, variable
  bindings, publication metadata, and migration metadata.
- `RenderJobV1`: render request id, tenant id, template version id, data
  snapshot hash, renderer mode, DocRaptor request metadata, status, warnings,
  errors, artifact reference, and audit ids.
- `BatchRunV1`: batch id, tenant id, template snapshot, dataset selector,
  recipient selector, concurrency policy, per-document job ids, progress,
  failure summary, cancellation state, and download artifact references.
- `VariableDefinition`: key, display name, group, type, required flag,
  formatter, fallback policy, allowed contexts, sample value, and validation
  rules.
- `DocumentTheme`: brand colors, default typography, logo references, footer
  defaults, page defaults, and template-level override rules.
- `AssetReference`: tenant id, asset id, version/hash, purpose, MIME type,
  dimensions, alt text, render URL policy, and DocRaptor reachability status.

Schemas must be versioned. Later schema versions must define migration rules
instead of silently changing the meaning of existing templates.

## Editor Extension Plan

The PDF editor should add document-specific nodes and marks:

- Variable chip node for typed variables and merge tags.
- Conditional section node for structured visibility rules.
- Repeater node for arrays such as donations, invoice line items, report rows,
  and missionary support lines.
- Data table node for financial reports, annual statements, invoices, and
  donation line items.
- Totals block for sums, subtotals, balances, and grouped summaries.
- Page break node for explicit breaks.
- Keep-together and avoid-break hints for headings, signatures, table rows, and
  summary blocks.
- Header/footer editing surfaces with first-page variants and page number
  options.
- Signature/image placeholder node for future official document workflows.
- QR placeholder node for future verification or donor portal links.
- Button/link support only where relevant to HTML preview or linked PDFs.

Email-only extension assumptions must be either removed or wrapped so document
templates do not depend on email-client constraints.

## Rendering Pipeline

Rendering should proceed through explicit stages:

1. Load the published `DocumentTemplateV1` version or an explicit draft preview
   version.
2. Validate the template schema, editor JSON, bindings, page setup, asset
   references, and renderer options.
3. Resolve variables, computed values, conditionals, repeaters, and data-bound
   tables from a sample record or real authorized record.
4. Serialize the resolved document model with `composeReactDocument` into
   print-ready HTML and CSS.
5. Wrap the content in a deterministic HTML shell with base URL, print media
   CSS, `@page` rules, document metadata, and asset/font references.
6. Preflight assets and fonts for DocRaptor reachability.
7. Send a DocRaptor request with `document_content` or `document_url`,
   production/test mode, print media, base URL, async flag, and optional PDF
   profile settings.
8. Store the PDF artifact in tenant-scoped storage.
9. Record render logs, warnings, errors, DocRaptor metadata, template version,
   data snapshot hash, and audit events.

## DocRaptor Assumptions

The production renderer is DocRaptor:

- It accepts `document_content` or `document_url`.
- It is the source of truth for production PDF fidelity.
- It supports print media and CSS paged media.
- It supports `@page`, page margins, headers/footers through page regions or
  margin boxes, page counters, page breaks, and custom fonts.
- It supports forms, PDF profiles, and tagged PDFs where needed by future
  requirements.
- It supports asynchronous rendering for large or complex documents.
- It requires reachable assets and correct base URL behavior.
- It does not support every modern browser layout feature, so output should
  favor print-safe HTML and CSS.

Puppeteer may exist as a local development or fallback renderer, but Puppeteer
output must not be treated as the final fidelity contract.

## Preview Strategy

The builder needs two preview paths:

- Fast browser preview for authoring feedback, sample data checks, and layout
  iteration.
- True DocRaptor preview for production template approval, finance-sensitive
  documents, published templates, and any template that will be used in batch
  generation.

Browser preview must clearly communicate when it is not a DocRaptor-rendered
artifact. Production publish checks should require at least one recent successful
DocRaptor test render for the template version and sample dataset.

Golden fixtures should cover receipts, annual statements, donor letters,
missionary support reports, financial reports, invoices, and certificates.

## Batch Strategy

Batch generation should be queue-backed:

- A batch run snapshots the exact template version and render settings at
  start.
- Recipient and dataset selection are resolved before jobs are enqueued.
- Each recipient/document becomes a per-document render job with an idempotency
  key.
- DocRaptor async mode is used for large or complex jobs.
- Concurrency caps protect DocRaptor limits, platform stability, and tenant
  fairness.
- Failed jobs record structured errors and can be retried without re-rendering
  successful documents.
- Runs support partial success, resumability, cancellation, progress tracking,
  audit trails, and batch download packaging.

Donor-trust-sensitive batches must never silently generate incorrect financial
documents. Missing required variables, mismatched totals, invalid data snapshots,
or stale template snapshots must halt affected jobs and surface explicit errors.

## Migration Strategy

Unlayer-backed PDF Studio and the in-house builder must coexist during
migration:

- Legacy Unlayer templates remain readable and renderable through their current
  path until intentionally retired.
- New templates can be created with the in-house builder behind a feature flag.
- Complex Unlayer templates may require manual rebuilds.
- A partial import path from exported Unlayer HTML may be evaluated for simple
  templates, but no implementation may assume perfect conversion from Unlayer
  design JSON.
- Migration status must be visible per template so staff know whether a
  template is legacy, imported, rebuilt, or native.

## ds.shadcn Position

`ds.shadcn` is not part of the first foundation. It may be evaluated later for
fixed-layout/canvas use cases such as certificates, covers, exact-position
forms, or documents where freeform placement is more important than flowing
print layout. That later evaluation must not weaken the structured document
model, data binding, render audit, or DocRaptor fidelity contract.

## Security

- The DocRaptor API key is server-only.
- Templates must not contain secrets, tokens, private storage URLs, or raw
  donor financial datasets.
- Tenant-scoped templates, assets, rendered PDFs, render logs, and batch records
  must enforce tenant and role boundaries.
- Donor, missionary, and financial data must be resolved server-side for
  production renders.
- Asset render URLs must be public for the render window or signed in a way
  DocRaptor can fetch; browser-only blob URLs and private app-session URLs are
  invalid for production renders.
- Audit logs must capture template changes, publishes, renders, batch starts,
  failures, retries, cancellations, and downloads where relevant.

## Testing Strategy

Future implementation should include:

- Unit tests for schema validation, schema migration, typed variable registry,
  formatter behavior, and resolver rules.
- Serializer tests for `composeReactDocument`, HTML shell generation, print CSS,
  page setup, header/footer output, page breaks, and fallback behavior.
- Render snapshot tests using golden fixtures and stable HTML/CSS artifacts.
- DocRaptor test renders for production-bound templates and representative
  fixtures.
- Batch job tests for template snapshots, idempotency, retries, cancellation,
  partial success, and progress tracking.
- Permission tests for edit, publish, render, batch, asset access, and admin
  operations.
- Migration tests for legacy Unlayer coexistence and any partial import flow.

## Open Questions For Implementation

- Which storage bucket/path convention will own generated PDF artifacts?
- Which queue implementation will be used for batch render jobs in the first
  production pass?
- Which role names map to edit, publish, render, batch, and document admin
  permissions?
- Which DocRaptor PDF profiles are required for the first launch, if any?
- Which financial report table shapes must ship first beyond annual statements
  and donation line items?
