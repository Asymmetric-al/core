## 1. OpenSpec and repo intent

- [ ] Confirm the active OpenSpec specs remain the durable source of product
      intent for PDF Document Builder work.
- [ ] Keep `AGENTS.md` as a routing layer only.
- [ ] Add implementation-specific OpenSpec changes before changing product
      behavior beyond this foundation.
- [ ] Align later architecture docs with the OpenSpec specs when behavior or
      package names become concrete.

## 2. Fork and package isolation

- [ ] Fork the Resend React Email repo into a controlled internal workspace or
      vendor source.
- [ ] Identify the minimal `@react-email/editor` packages and dependencies
      needed for the fork.
- [ ] Create the target package boundaries for `@asym/pdf-editor`,
      `@asym/pdf-renderer`, `@asym/pdf-template-schema`, and
      `@asym/docraptor-client`.
- [ ] Keep PDF editor internals out of app-specific Mission Control routes.
- [ ] Add an optional core adapter package only after the shared packages have
      stable interfaces.

## 3. Schema foundations

- [ ] Define `DocumentTemplateV1`.
- [ ] Define `RenderJobV1`.
- [ ] Define `BatchRunV1`.
- [ ] Define `VariableDefinition`.
- [ ] Define `DocumentTheme`.
- [ ] Define `AssetReference`.
- [ ] Add schema versioning and migration hooks.
- [ ] Add validation errors that are safe to show to staff users.

## 4. Editor foundation

- [ ] Port the editor shell from React Email Editor.
- [ ] Keep TipTap/ProseMirror JSON as the editor source of truth.
- [ ] Replace email-first naming in shared editor surfaces where it would
      confuse PDF behavior.
- [ ] Preserve useful bubble menu and slash command patterns.
- [ ] Add document inspector patterns for page, section, table, variable, and
      asset settings.
- [ ] Add template metadata editing for name, description, category, tags, and
      status.

## 5. Document serializer

- [ ] Design `composeReactDocument` or an equivalent document serializer API.
- [ ] Serialize document-aware nodes and marks to print-safe HTML/CSS.
- [ ] Keep raw HTML as an export artifact, not the template source of truth.
- [ ] Add deterministic HTML shell generation.
- [ ] Add renderer warnings for unsupported or risky layout features.
- [ ] Add serializer fixtures for receipts, statements, letters, reports,
      invoices, and certificates.

## 6. Page model

- [ ] Support Letter, A4, Legal, and custom page sizes.
- [ ] Support portrait and landscape orientation.
- [ ] Support page margins in a renderer-safe unit model.
- [ ] Add future full-bleed settings without enabling unsafe defaults.
- [ ] Add explicit page break nodes.
- [ ] Add keep-together and avoid-break hints.
- [ ] Add page setup validation before publish.

## 7. Variable registry

- [ ] Define typed variables for `organization`.
- [ ] Define typed variables for `recipient`.
- [ ] Define typed variables for `donation`.
- [ ] Define typed variables for `document`.
- [ ] Define typed variables for `missionary`.
- [ ] Define typed variables for `tax_receipt`.
- [ ] Define typed variables for `financial_report`.
- [ ] Define typed variables for `statement`.
- [ ] Define typed variables for `invoice`.
- [ ] Add variable chips in the editor.
- [ ] Add fallback values and required variable settings.
- [ ] Add publish validation for missing required variables.
- [ ] Add currency, date, number, percentage, address, receipt id, and fiscal
      period formatters.

## 8. Conditional sections

- [ ] Add a conditional section node.
- [ ] Define structured conditional rule schema.
- [ ] Support simple comparisons, presence checks, boolean checks, and allowed
      enum checks.
- [ ] Validate conditional rules before publish.
- [ ] Add browser preview and DocRaptor preview coverage for conditional
      sections.

## 9. Repeaters

- [ ] Add a repeater node for arrays.
- [ ] Support donation line items.
- [ ] Support invoice line items.
- [ ] Support report rows.
- [ ] Support missionary support rows.
- [ ] Add empty state behavior for repeaters.
- [ ] Validate repeater bindings before publish.

## 10. Financial tables

- [ ] Add a data-bound table node.
- [ ] Support grouping.
- [ ] Support totals and subtotals.
- [ ] Support carry-forward or summary rows where needed.
- [ ] Support empty states.
- [ ] Support page-safe table header repetition.
- [ ] Support page-safe row splitting or row keep-together settings.
- [ ] Add fixtures for annual giving statements and financial reports.

## 11. Images and assets

- [ ] Add tenant-scoped asset upload.
- [ ] Add asset library selection.
- [ ] Add image alt text.
- [ ] Add image sizing and aspect controls.
- [ ] Validate MIME type, dimensions, and file size.
- [ ] Store asset references instead of browser-only blob URLs.
- [ ] Add render URL generation for DocRaptor.
- [ ] Add asset preflight warnings and errors.

## 12. Branding

- [ ] Define tenant-level brand defaults.
- [ ] Define template-level brand overrides.
- [ ] Support tenant logo configuration.
- [ ] Support brand colors.
- [ ] Support footer text.
- [ ] Support brand font configuration.
- [ ] Version brand assets or hash asset references where needed.
- [ ] Keep donor and missionary private data out of brand assets.

## 13. Headers and footers

- [ ] Add repeating header editing surface.
- [ ] Add repeating footer editing surface.
- [ ] Add first-page header/footer variants.
- [ ] Add page number controls.
- [ ] Serialize headers and footers using DocRaptor-compatible page regions or
      margin boxes.
- [ ] Validate header/footer height against page margins.

## 14. Preview

- [ ] Add fast browser preview.
- [ ] Label browser preview as non-authoritative for production fidelity.
- [ ] Add true DocRaptor test-render preview.
- [ ] Require recent successful DocRaptor preview before publishing
      production-bound templates.
- [ ] Add sample data preview.
- [ ] Add real authorized record preview.
- [ ] Capture preview warnings and errors.

## 15. DocRaptor integration

- [ ] Create a server-only DocRaptor client.
- [ ] Keep the DocRaptor API key out of client bundles and templates.
- [ ] Support `document_content`.
- [ ] Support `document_url` where a hosted render route is needed.
- [ ] Set print media and base URL behavior explicitly.
- [ ] Support synchronous rendering for small documents.
- [ ] Support asynchronous rendering for large or batch documents.
- [ ] Normalize DocRaptor status, validation errors, and resource errors.
- [ ] Add optional PDF profile settings for future PDF/A or tagged PDF needs.

## 16. Storage and artifacts

- [ ] Define tenant-safe storage paths for generated PDFs.
- [ ] Store artifact metadata with template version, data snapshot hash, render
      settings, renderer, and page count where available.
- [ ] Store preview artifacts separately from production artifacts.
- [ ] Protect download URLs by tenant and role.
- [ ] Add expiration or retention policy decisions for preview artifacts.

## 17. Batch generation

- [ ] Define batch run creation.
- [ ] Snapshot the template version at batch start.
- [ ] Resolve recipient selection at batch start.
- [ ] Resolve dataset selection at batch start.
- [ ] Create queue-backed per-document render jobs.
- [ ] Add idempotency keys for per-document jobs.
- [ ] Add concurrency limits.
- [ ] Add retry rules.
- [ ] Add failed job handling.
- [ ] Add partial success reporting.
- [ ] Add resumable runs.
- [ ] Add batch cancellation.
- [ ] Add batch download packaging.
- [ ] Leave future email delivery as a separate follow-up implementation.
- [ ] Leave future scheduled generation as a separate follow-up implementation.

## 18. Audit logs

- [ ] Log template creation.
- [ ] Log template edits.
- [ ] Log template duplication.
- [ ] Log template publishing.
- [ ] Log template archival.
- [ ] Log render requests.
- [ ] Log render failures and retries.
- [ ] Log batch starts, cancellation, completion, and downloads.
- [ ] Include actor, tenant, template version, and relevant record identifiers.

## 19. Template management

- [ ] Implement create, edit, duplicate, publish, archive, and version flows.
- [ ] Show legacy Unlayer migration state per template.
- [ ] Allow draft previews without publishing.
- [ ] Prevent publish when required variables or render preflight checks fail.
- [ ] Preserve current categories and add first-class missionary report and
      financial report handling.

## 20. Permissions

- [ ] Define edit permission.
- [ ] Define publish permission.
- [ ] Define render permission.
- [ ] Define batch run permission.
- [ ] Define asset management permission.
- [ ] Define admin override permission.
- [ ] Enforce tenant isolation on templates, assets, render jobs, artifacts, and
      batch records.
- [ ] Add permission tests before launch.

## 21. Migration from Unlayer

- [ ] Keep existing Unlayer templates renderable during migration.
- [ ] Add feature flag selection between legacy Unlayer and native PDF builder.
- [ ] Define migration status values.
- [ ] Support manual rebuild workflow for complex templates.
- [ ] Evaluate partial import from exported Unlayer HTML for simple templates.
- [ ] Do not claim perfect conversion from Unlayer design JSON.
- [ ] Add staff-visible migration warnings for unsupported legacy constructs.

## 22. Core repo adapter

- [ ] Add Mission Control integration only after shared packages expose stable
      interfaces.
- [ ] Connect template storage through the repo's data access boundary.
- [ ] Connect asset storage through tenant-scoped storage adapters.
- [ ] Connect audit logging through the platform audit layer.
- [ ] Connect permissions through the platform role model.
- [ ] Preserve monorepo boundaries between apps and shared packages.

## 23. Testing and golden fixtures

- [ ] Add schema unit tests.
- [ ] Add resolver unit tests.
- [ ] Add serializer unit tests.
- [ ] Add render HTML snapshot tests.
- [ ] Add DocRaptor test render fixtures.
- [ ] Add browser preview tests.
- [ ] Add batch job tests.
- [ ] Add permissions tests.
- [ ] Add migration coexistence tests.
- [ ] Add golden fixtures for donation receipts, tax receipts, annual giving
      statements, donor letters, missionary support reports, financial reports,
      invoices, and certificates.

## 24. Production hardening

- [ ] Add renderer observability.
- [ ] Add queue observability.
- [ ] Add clear staff-facing error messages.
- [ ] Add rate limits and concurrency safeguards.
- [ ] Add cost controls for DocRaptor previews and batch jobs.
- [ ] Add tenant-safe artifact retention rules.
- [ ] Add security review for assets, render HTML, and donor financial data.
- [ ] Add finance-user acceptance review for annual statements and reports.

## 25. Launch and cutover

- [ ] Launch behind a feature flag for selected tenants or staff.
- [ ] Start with new native templates before migrating legacy templates.
- [ ] Validate DocRaptor output against known production examples.
- [ ] Define cutover criteria for replacing Unlayer in PDF Studio.
- [ ] Keep rollback path to legacy Unlayer templates during early rollout.
- [ ] Document staff workflow changes before general release.

## 26. Validation

- [ ] Run `bunx @fission-ai/openspec@latest validate build-pdf-document-builder`
- [ ] Run `bunx @fission-ai/openspec@latest validate --all`
- [ ] Confirm `AGENTS.md` changed only in the intended routing note
- [ ] Confirm generated marker regions in `AGENTS.md` remain untouched
- [ ] Confirm no product code, test code, database migration, or unrelated infra
      was changed
