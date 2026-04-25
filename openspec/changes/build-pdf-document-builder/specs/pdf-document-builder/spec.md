# Delta for PDF Document Builder

## ADDED Requirements

### Requirement: PDF Document Builder Serves Mission Control Document Work

The PDF Document Builder SHALL be an in-house document authoring system for
Mission Control staff workflows. It MUST support official ministry documents
inside the connected Asymmetric.al platform rather than becoming a disconnected
generic document SaaS product.

The builder SHALL preserve financial clarity, donor trust, tenant brand
integrity, and operational completeness for Christian missions organizations.

#### Scenario: Staff prepares donor-facing documents inside Mission Control

- GIVEN a finance staff user needs to prepare donor receipts and annual giving
  statements
- WHEN they open the PDF Document Builder
- THEN the builder presents document template workflows inside Mission Control
- AND the workflow stays connected to donor, gift, tenant, and document
  operational data

#### Scenario: A proposed template flow would become a detached side product

- GIVEN a future implementation proposes a standalone document SaaS surface
  unrelated to Mission Control, donor records, or tenant operations
- WHEN the proposal is evaluated against this spec
- THEN the proposal is rejected or redesigned to fit the connected Asymmetric.al
  platform
- AND document behavior remains anchored to ministry operations and donor trust

### Requirement: Template Lifecycle And Structured Source Of Truth

The PDF Document Builder SHALL let authorized staff create, edit, duplicate,
preview, publish, archive, and version document templates.

The builder SHALL store templates as versioned structured document JSON. Raw
HTML SHALL be treated as an export artifact and MUST NOT be the only source of
truth for editable templates.

#### Scenario: Staff creates a donor letter template

- GIVEN an admin user has permission to create document templates
- WHEN they create a donor letter template
- THEN the builder stores a versioned structured document JSON template
- AND the template can later be edited without reverse-engineering exported HTML

#### Scenario: Staff duplicates a published receipt template

- GIVEN a published donation receipt template exists
- WHEN an authorized staff user duplicates it
- THEN the builder creates a new draft template with its own identity and
  version history
- AND the original published template remains unchanged

### Requirement: Template Categories Cover Ministry Document Types

The PDF Document Builder SHALL support at least these template categories:
`donation_receipt`, `tax_receipt`, `annual_giving_statement`, `donor_letter`,
`missionary_report`, `financial_report`, `invoice`, `certificate`, and
`custom`.

The builder SHOULD preserve legacy category mappings from current PDF Studio,
including `annual_statement`, `letter`, and `report`, through migration aliases
or explicit migration state.

#### Scenario: Staff creates an annual giving statement template

- GIVEN an admin user has permission to create document templates
- WHEN they create an annual giving statement template
- THEN the builder provides donor identity fields, organization fields, date
  range fields, donation table sections, totals, tax language, and footer
  options
- AND the template can be previewed with sample donor data before publishing

#### Scenario: Staff creates a missionary support report template

- GIVEN a staff user manages missionary communication and reporting
- WHEN they create a missionary report template
- THEN the builder provides missionary identity fields, support account fields,
  donor summary data, giving trend sections, ministry narrative sections, and
  branded footer options
- AND the template remains scoped to the tenant organization

### Requirement: Rich Document Authoring Blocks

The PDF Document Builder SHALL support rich text editing, headings, lists,
sections, layout blocks, columns, tables, images, links, and buttons where
links or buttons are relevant to HTML preview or linked PDFs.

The builder SHALL support document-specific blocks for variables,
conditionals, repeaters, data tables, totals, page breaks, headers, footers,
signatures or image placeholders, and future QR placeholders.

#### Scenario: Staff authors a branded donor letter

- GIVEN a staff user is writing a donor thank-you letter
- WHEN they add text, columns, images, a signature placeholder, and recipient
  variable chips
- THEN the builder stores each block as structured document JSON
- AND preview renders the letter with sample donor data and tenant branding

#### Scenario: Staff inserts a table in a financial report

- GIVEN a finance user is building a financial report template
- WHEN they insert a data-bound table block
- THEN the builder allows grouping, totals, subtotals, and empty-state content
- AND the table is marked for page-safe rendering by the PDF rendering pipeline

### Requirement: Page Setup And Print Controls

The PDF Document Builder SHALL support Letter, A4, Legal, custom page size,
portrait and landscape orientation, margins, and future full-bleed settings.

The builder SHALL support repeating headers, repeating footers, first-page
header/footer variants, page numbers, explicit page breaks, and keep-together
or avoid-break hints.

#### Scenario: Finance user prepares a landscape financial report

- GIVEN a financial report contains wide data tables
- WHEN the finance user sets the page size to Letter and orientation to
  landscape
- THEN the builder records those page settings in the structured template
- AND the renderer receives page setup that can be converted into `@page` CSS

#### Scenario: Staff adds page numbers to a long annual statement

- GIVEN an annual giving statement can span multiple pages
- WHEN staff enables page numbers in the footer
- THEN the builder records page number placement and format
- AND the DocRaptor-rendered PDF includes repeating page numbers

### Requirement: Branding And Document Theme Controls

The PDF Document Builder SHALL support tenant-level brand defaults and
template-level overrides for logo, colors, footer text, typography, and
document theme settings.

Template-level overrides SHALL be explicit so staff can distinguish tenant
defaults from template-specific changes.

#### Scenario: Tenant logo appears on receipts

- GIVEN a tenant has configured a default logo and footer text
- WHEN staff creates a donation receipt template
- THEN the builder can apply the tenant logo and footer text automatically
- AND staff can override those settings only for the current template when
  permitted

#### Scenario: A custom certificate needs a distinct theme

- GIVEN staff creates a certificate template with a unique visual style
- WHEN they override brand colors for that template
- THEN the override is stored with the template version
- AND other tenant templates continue using tenant-level defaults

### Requirement: Preview And Publishing Flow

The PDF Document Builder SHALL support browser preview and true DocRaptor
test-render preview.

The builder MUST NOT treat browser preview as the only fidelity check for
production templates. Production-bound templates SHALL require validation of
required variables, data bindings, assets, page setup, and at least one recent
successful DocRaptor test render before publish.

#### Scenario: Staff previews a receipt with sample data

- GIVEN a staff user is editing a donation receipt template
- WHEN they request browser preview
- THEN the builder renders a fast preview with sample donor and donation data
- AND the preview clearly remains separate from the DocRaptor production
  fidelity check

#### Scenario: Publish fails without DocRaptor preview

- GIVEN a finance user edits a tax receipt template
- WHEN they attempt to publish without a successful DocRaptor test render for
  the current version
- THEN the builder blocks publish
- AND it explains that production templates require a true DocRaptor preview

### Requirement: Versioning, Archival, And Legacy Coexistence

The PDF Document Builder SHALL keep immutable published template versions.
Draft edits SHALL create or update draft versions without changing previously
published versions.

The builder SHALL coexist with legacy Unlayer templates during migration and
SHALL NOT assume automatic perfect conversion from Unlayer design JSON.

#### Scenario: A published tax receipt is edited

- GIVEN a tax receipt template version is published and used for receipts
- WHEN staff edits the template
- THEN the builder creates or updates a draft version
- AND previously rendered receipts still reference the exact published version
  used at render time

#### Scenario: Legacy Unlayer template remains available

- GIVEN a tenant has a legacy Unlayer annual statement template
- WHEN the native PDF Document Builder is enabled
- THEN the legacy template remains identifiable and renderable through its
  legacy path until intentionally migrated or retired
- AND staff are not told that conversion is automatic or lossless

### Requirement: Role-Aware Access

The PDF Document Builder SHALL enforce permissions for template editing,
publishing, rendering, batch runs, asset management, and admin operations.

Users without permission MUST NOT be able to mutate templates, publish
templates, render official PDFs, or start batch generation by bypassing the UI.

#### Scenario: Editor without publish permission finishes a draft

- GIVEN a staff user can edit templates but cannot publish them
- WHEN they finish editing a donor letter template
- THEN they can save a draft and request review
- AND they cannot publish the template without a user who has publish
  permission

#### Scenario: Unauthorized user attempts to render official receipts

- GIVEN a user lacks permission to render tax receipts
- WHEN they attempt to call a render endpoint or trigger a render from the UI
- THEN the system denies the action
- AND no PDF artifact is generated
