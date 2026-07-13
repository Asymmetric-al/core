# Add Statement Studio Document Production

## Why

The platform has a working legacy PDF Studio, an incomplete native builder,
plain-text donor receipt/statement downloads, and a separate corrected-receipt
PDF path. These paths do not share immutable template versions, assignments,
server-owned source contexts, private artifacts, recipient authorization, or
retention. Treating any one of them as a finished document platform would risk
tenant isolation, money truth, and donor trust.

Statement Studio needs one durable production contract while preserving the
fact that Giving, Reports, Events, Missionary, Care, Legal, Tasks, and CMS own
their source data.

## What Changes

- Establish Statement Studio as the Mission Control product for templates,
  immutable versions, job assignments, rendering, artifacts, retention, and
  audit.
- Ratify the existing `pdf_templates` / `pdf_template_*` family as the migration
  base instead of introducing a parallel document store.
- Require production document facts to come from versioned, tenant-scoped,
  server-resolved domain contexts. Official receipt/statement contexts include
  frozen canonical display strings plus raw values and locale/version metadata;
  browsers cannot supply official financial facts to render endpoints.
- Require generated documents to use private Storage, durable artifact
  metadata, same-tenant relational integrity, and recipient-scoped portal BFF
  authorization.
- Propose the existing Asym-owned schema plus server-only DocRaptor adapter as
  the sole first-slice production renderer behind a provider port, subject to a
  representative provider-qualification gate and HITL approval. A future
  renderer replacement requires an explicit measured migration change.
- Keep Unlayer as a bounded legacy fallback until a production replacement and
  tenant-template disposition are verified; new Statement Studio work does not
  depend on it.
- Keep `donor.statement.annual_giving` as the first donor-facing production job,
  gated on the canonical frozen statement snapshot/version contract and
  finance/legal approval.

## What Does Not Change

- Statement Studio does not own donations, legal-donor identity, receipt
  eligibility, corrections, refunds, designations, CRM truth, event truth,
  care records, legal evidence, tasks, or CMS publishing truth.
- Donor and missionary portals remain role-scoped self-service surfaces; they
  do not become staff document administration surfaces.
- Existing CSV operational exports remain available where PDF is only a
  readable companion.
- This proposal does not delete legacy templates or assert that committed
  migrations are applied to a hosted Supabase project.

## Impact

- New capability: `document-production`
- Affected intent specs: `platform-boundaries`, `platform-surfaces`
- Related active change: `add-donor-self-service` owns annual-statement donor
  semantics and delivery; this change owns template/render/artifact production
- Affected code when implemented: `apps/admin/app/pdf/**`, donor and missionary
  portal download routes, `packages/api/src/pdf-templates/**`, source-domain
  resolver modules, and generated-document Storage adapters
- Affected data when implemented: existing `pdf_*` tables plus missing job,
  assignment, variable, recipient, and retention concepts
