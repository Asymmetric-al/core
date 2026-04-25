# Proposal: Build an in-house PDF Document Builder foundation

## Why

PDF Studio currently depends on Unlayer in document mode for visual document
authoring, template JSON, HTML export, and PDF export. That is useful for the
current product, but it leaves Asymmetric.al dependent on a third-party builder
for official donor, tax, financial, and ministry documents that are central to
donor trust and operational completeness.

The platform needs an in-house PDF Document Builder that can eventually replace
or compete with Unlayer Document Builder inside PDF Studio. This builder must
fit Asymmetric.al as one connected ministry operations platform for Christian
missions organizations, not as a disconnected generic SaaS tool.

React Email Editor is a strong starting foundation because it already provides
a TipTap/ProseMirror document model, extension system, editor shell, bubble
menus, slash commands, theming patterns, image upload flow, serializer pattern,
HTML export structure, and editor JSON source of truth. It is not complete for
this product because its serializer and assumptions are email-first. The fork
must become PDF-first, with document/page semantics, data-bound tables,
repeaters, headers, footers, page numbers, print CSS, and DocRaptor fidelity as
first-class concerns.

DocRaptor is the intended production renderer because Asymmetric.al needs
server-side, print-oriented PDF generation with CSS paged media support,
repeatable render behavior, and audit-friendly artifact creation. Puppeteer may
be useful for local preview or fallback, but it must not define the production
fidelity contract.

This belongs in OpenSpec before implementation because the work crosses product
intent, editor architecture, template schema, rendering, data binding, asset
security, batch processing, storage, audit, permissions, and migration from
Unlayer. Future agents need a durable behavior contract before they start
forking packages or adding implementation code.

## What Changes

- Define the product behavior for an in-house PDF Document Builder.
- Define the production rendering pipeline from structured template JSON to
  print-ready HTML/CSS, DocRaptor PDF generation, storage, and audit records.
- Define typed variables, merge tags, repeaters, conditionals, computed values,
  financial tables, preview data, and publish validation.
- Define large batch generation for annual statements, receipts, financial
  reports, and future scheduled document runs.
- Define tenant-scoped brand, image, font, and asset behavior needed for
  render-safe PDFs.
- Add a small `AGENTS.md` routing note that points agents to this OpenSpec
  change/spec set for PDF Studio replacement work.

## Product Outcomes

- Authorized staff can create, edit, duplicate, preview, publish, archive, and
  version document templates for receipts, statements, letters, reports,
  invoices, certificates, and tenant-specific documents.
- Finance users can produce donor-trust-sensitive documents from structured
  operational data without silently losing accuracy or auditability.
- Donors receive accurate, branded receipts and statements that reflect the
  platform's operational truth.
- Missionaries and ministry staff can rely on support reports and donor
  documents that stay connected to the same platform data.
- Tenant organizations can keep documents on brand while preserving tenant
  isolation, render safety, and audit history.
- Implementation agents can build in phases without re-litigating source of
  truth, renderer fidelity, or migration posture.

## Who This Serves

- Staff and admins who create and manage official document templates.
- Donors who need trustworthy receipts, tax records, and annual giving
  statements.
- Finance users who need accurate financial reports, statements, invoices, and
  batch document generation.
- Missionaries who depend on clear support reports and donor-facing documents.
- Tenant organizations that need branded, compliant, tenant-scoped documents
  inside the connected Asymmetric.al platform.

## Out of Scope

- No product implementation in this OpenSpec change.
- No app UI, editor components, database migrations, renderer code, package
  code, tests, or DocRaptor integration code in this change.
- No full real-time collaboration in the first pass.
- No full e-signature provider implementation in the first pass.
- No automatic perfect migration from Unlayer design JSON.
- No `ds.shadcn` canvas mode unless a later fixed-layout need proves the added
  scope is worth it.
- No claim that the in-house builder is production-ready until implementation,
  verification, security review, and migration work are completed.

## Current System Context

Current PDF Studio behavior and docs already establish important product
knowledge that this replacement must preserve:

- PDF Studio is an admin/Mission Control surface for document templates.
- It uses Unlayer with `displayMode: "document"`.
- It stores Unlayer design JSON, exported HTML, template metadata, categories,
  page size, orientation, margins, and draft/published/archived status.
- It supports or expects categories for tax receipts, donation receipts, annual
  statements, letters, certificates, reports, invoices, and custom templates.
- It exposes merge tag domains for organization, recipient, donation, document,
  missionary, and tax receipt data.
- It needs future support for batch generation, PDF storage, versioning,
  template sharing, signatures, QR codes, and scheduled generation.

This change turns that product knowledge into durable intent for the replacement
system while keeping Unlayer coexistence explicit during migration.
