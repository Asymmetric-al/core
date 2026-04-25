# Delta for Document Assets And Branding

## ADDED Requirements

### Requirement: Tenant Brand Defaults

The document asset and branding system SHALL support tenant-level brand defaults
for logo, brand colors, footer text, typography, and page theme settings.

Tenant brand defaults SHALL be available to templates without copying private
or unrelated tenant configuration into each template.

#### Scenario: New receipt uses tenant branding

- GIVEN a tenant has configured a logo, primary color, and footer text
- WHEN staff create a donation receipt template
- THEN the builder can apply those tenant brand defaults
- AND the template records references to the brand settings used

#### Scenario: Tenant updates footer text

- GIVEN a tenant changes its default footer text
- WHEN staff open a template that inherits the default footer
- THEN the template can reflect the new default according to its inheritance
  policy
- AND templates with explicit footer overrides remain distinguishable

### Requirement: Template-Level Brand Overrides

The branding system SHALL support explicit template-level overrides for logo,
colors, footer text, font settings, and theme settings.

Overrides SHALL be recorded with the template version so future renders remain
auditable.

#### Scenario: Certificate uses custom colors

- GIVEN staff create a certificate template with event-specific colors
- WHEN they override tenant brand colors for that template
- THEN the override is stored as template-level branding
- AND other templates continue inheriting the tenant default colors

#### Scenario: Override is removed

- GIVEN a template has an explicit footer text override
- WHEN staff remove the override
- THEN the template returns to tenant default footer behavior
- AND version history records the change

### Requirement: Asset Upload And Library References

The asset system SHALL support tenant-scoped asset upload and asset library
references for logos, images, signatures, QR placeholders, and document artwork.

Templates SHALL store asset references with asset id, tenant id, version or
hash, MIME type, dimensions, alt text, and render URL policy.

#### Scenario: Staff uploads a logo

- GIVEN staff have permission to manage document assets
- WHEN they upload a tenant logo
- THEN the asset is stored in the tenant asset library
- AND templates reference the asset by structured asset reference rather than
  by a browser-only local URL

#### Scenario: Staff selects an existing image

- GIVEN a tenant has a library of approved document images
- WHEN staff insert one into a donor letter template
- THEN the template stores an asset reference
- AND preview and production rendering resolve the correct asset version

### Requirement: Image Metadata And Validation

The asset system SHALL require or prompt for image alt text where meaningful,
and SHALL validate image type, file size, dimensions, and render suitability.

The builder SHALL support image sizing, aspect ratio controls, and alignment
settings that can be serialized to print-safe HTML/CSS.

#### Scenario: Meaningful image lacks alt text

- GIVEN staff insert a donor-facing image into a letter template
- WHEN the image has no alt text and is not marked decorative
- THEN publish validation warns or blocks according to accessibility policy
- AND staff can add alt text before publishing

#### Scenario: Uploaded image is too large

- GIVEN staff upload a very large image
- WHEN validation checks the file
- THEN the system rejects or optimizes it according to asset policy
- AND it reports a clear message instead of letting DocRaptor fail later

### Requirement: Render URLs Are Reachable By DocRaptor

The asset system SHALL provide public or signed render URLs that DocRaptor can
fetch during production rendering.

DocRaptor-rendered PDFs MUST never depend on browser-only blob URLs, local file
paths, private app-session URLs, or URLs that the renderer cannot fetch.

#### Scenario: Template references blob URL

- GIVEN a template image references a browser blob URL
- WHEN production render preflight runs
- THEN the render is blocked
- AND the system explains that DocRaptor cannot fetch browser-only blob URLs

#### Scenario: Signed asset URL expires too soon

- GIVEN an asset uses a signed render URL
- WHEN a batch render is scheduled
- THEN the preflight checks that the URL lifetime covers the render window
- AND the job is blocked or refreshed if the URL would expire too soon

### Requirement: Font Configuration And Reachability

The branding system SHALL support brand font configuration using renderer-safe
font references.

Font URLs SHALL be validated for DocRaptor reachability, MIME type, licensing
metadata where tracked, and fallback behavior.

#### Scenario: Tenant uses a custom brand font

- GIVEN a tenant has configured a custom brand font
- WHEN a template uses that font
- THEN the renderer includes a reachable font reference in print CSS
- AND the render record can identify the font reference used

#### Scenario: Font cannot be fetched

- GIVEN a custom font URL returns an error to DocRaptor
- WHEN render preflight runs
- THEN the system produces a blocking error or approved fallback warning
- AND it does not silently render official documents with unexpected typography

### Requirement: Asset Preflight Runs Before Production Render

The rendering pipeline SHALL run asset preflight before production rendering
and production-bound DocRaptor previews.

Preflight SHALL check tenant scope, asset existence, asset version, URL
reachability, MIME type, image dimensions, font reachability, and configured
fallback policies.

#### Scenario: Asset belongs to another tenant

- GIVEN a template references an asset from a different tenant
- WHEN production preflight runs
- THEN rendering is blocked
- AND the system reports a tenant scope violation without exposing the other
  tenant's asset data

#### Scenario: Missing optional image has fallback

- GIVEN an optional sponsor image is missing and has an approved fallback
- WHEN preflight runs
- THEN the fallback is applied or warned according to policy
- AND the render can proceed without a broken image

### Requirement: Brand Assets Can Be Versioned When Needed

The asset system SHALL support versioned or hash-addressed brand assets where
needed so historical renders can identify what was used.

Official PDF artifacts SHALL record enough asset metadata to explain their
render inputs later.

#### Scenario: Logo changes after receipts are generated

- GIVEN a tenant changes its logo after a receipt batch was generated
- WHEN staff review an old receipt render record
- THEN the record identifies the logo version or hash used at render time
- AND the old receipt is not reinterpreted as if it used the new logo

#### Scenario: Template snapshot includes brand asset references

- GIVEN a batch run starts with a template that inherits tenant branding
- WHEN the batch snapshot is created
- THEN the snapshot records the brand asset references needed for rendering
- AND later brand changes do not silently alter in-progress batch output

### Requirement: Private Donor And Missionary Data Is Not Stored As Assets

The asset system MUST NOT use shared asset storage for private donor,
missionary, or financial data that belongs in render data snapshots or
permission-scoped records.

Generated PDFs and render artifacts SHALL use tenant-safe storage and
permission controls distinct from reusable template assets.

#### Scenario: Staff attempts to upload donor data as reusable asset

- GIVEN staff attempt to upload a PDF or image containing private donor
  financial data into the reusable asset library
- WHEN asset validation or review detects the sensitive content class
- THEN the system blocks or routes the upload according to policy
- AND the data is not made available as a reusable tenant asset

#### Scenario: Generated statement is stored

- GIVEN an annual giving statement is generated for a donor
- WHEN the PDF is stored
- THEN it is stored as a protected render artifact
- AND it is not added to the tenant's reusable asset library

### Requirement: Asset And Brand Permissions Are Enforced

The asset and branding system SHALL enforce permissions for uploading assets,
editing tenant brand defaults, applying template overrides, deleting assets,
and using assets in templates.

Permission checks SHALL apply server-side and SHALL preserve tenant isolation.

#### Scenario: Staff can use but not edit brand defaults

- GIVEN a staff user can edit templates but cannot administer tenant branding
- WHEN they create a donor letter template
- THEN they can apply approved brand defaults
- AND they cannot change tenant-level logo, colors, fonts, or footer text

#### Scenario: Deleted asset is still referenced by template

- GIVEN an asset is referenced by a published template
- WHEN a user attempts to delete that asset
- THEN the system blocks deletion or creates an approved versioned retirement
  state
- AND production renders do not start failing silently
