# Delta for PDF Rendering Pipeline

## ADDED Requirements

### Requirement: Production Rendering Uses DocRaptor As Source Of Truth

The PDF rendering pipeline SHALL treat DocRaptor as the production rendering
source of truth for generated PDFs.

Puppeteer MAY be supported for local development, fast fallback, or debugging,
but Puppeteer output SHALL NOT be treated as the final production fidelity
contract.

#### Scenario: Production receipt render is requested

- GIVEN a published donation receipt template and authorized donor gift data
- WHEN production PDF rendering is requested
- THEN the rendering pipeline sends print-ready HTML/CSS to DocRaptor
- AND the stored PDF artifact records DocRaptor as the renderer

#### Scenario: Local Puppeteer preview differs from DocRaptor

- GIVEN a local Puppeteer preview and a DocRaptor preview render the same
  template differently
- WHEN staff evaluate production fidelity
- THEN the DocRaptor output is treated as authoritative
- AND the mismatch is logged as a renderer warning or issue to resolve

### Requirement: Rendering Starts From Structured Document Templates

The rendering pipeline SHALL render from `DocumentTemplate` structured JSON and
resolved data. It MUST NOT depend on hand-edited raw HTML as the durable source
for official templates.

The pipeline SHALL preserve template version, renderer settings, data snapshot
hash, and render metadata for each production artifact.

#### Scenario: Annual statement render records source metadata

- GIVEN an annual giving statement template version is published
- WHEN the system renders a donor statement
- THEN the render record includes template version, data snapshot hash,
  renderer, page settings, and artifact reference
- AND the system can later explain which template and data snapshot produced
  the PDF

### Requirement: Document Serializer Produces Print-Ready HTML And CSS

The rendering pipeline SHALL define a document serializer such as
`composeReactDocument` that serializes resolved document JSON into print-ready
HTML and CSS.

The serializer SHALL favor print-safe HTML/CSS and SHALL produce warnings when
a template uses unsupported, risky, or browser-only layout features.

#### Scenario: Serializer emits page-aware HTML

- GIVEN a template includes page margins, a repeating footer, and page numbers
- WHEN the serializer runs
- THEN it emits a deterministic HTML shell with print CSS and `@page` rules
- AND the footer and page numbers are represented using DocRaptor-compatible
  CSS

#### Scenario: Template uses browser-only behavior

- GIVEN a template contains interactive JavaScript-dependent layout
- WHEN the serializer validates the template
- THEN it produces a render warning or publish-blocking validation error
- AND the template is not silently rendered as if the behavior were supported

### Requirement: DocRaptor Requests Are Explicit And Server-Side

The rendering pipeline SHALL call DocRaptor only from server-side code.

DocRaptor requests SHALL specify the content source, PDF type, production or
test mode, print media behavior, base URL, async behavior when needed, and any
approved PDF profile options.

#### Scenario: Server sends document_content to DocRaptor

- GIVEN a resolved template can be fully serialized to HTML
- WHEN the renderer submits a production job
- THEN it sends `document_content` with the print-ready HTML/CSS payload
- AND the DocRaptor API key remains server-only

#### Scenario: Renderer uses document_url for hosted content

- GIVEN a render requires a hosted URL for asset or debugging reasons
- WHEN the renderer uses `document_url`
- THEN the URL is reachable by DocRaptor for the render window
- AND the route enforces tenant-safe access without exposing secrets

### Requirement: Sync And Async Rendering Are Chosen Deliberately

The rendering pipeline SHALL support synchronous rendering for small preview or
single-document jobs and asynchronous rendering for large, complex, or batch
jobs.

Async rendering SHALL track status, callback or polling state, retry metadata,
and final artifact storage.

#### Scenario: Single donor letter renders synchronously

- GIVEN an authorized staff user renders a short donor letter
- WHEN the job is within configured synchronous limits
- THEN the renderer may request a synchronous DocRaptor render
- AND it stores the completed artifact and render metadata

#### Scenario: Annual statement batch uses async rendering

- GIVEN a batch run will generate hundreds of annual statements
- WHEN per-document render jobs are enqueued
- THEN the renderer uses asynchronous DocRaptor jobs where configured
- AND each job tracks queued, working, completed, or failed status

### Requirement: Base URL, Assets, And Fonts Are Preflighted

The rendering pipeline SHALL validate base URL handling, asset URLs, font URLs,
MIME types, and DocRaptor reachability before production rendering.

The renderer SHALL produce a render warning or blocking error when a template
references an asset URL that DocRaptor cannot fetch.

#### Scenario: Image URL is private to the browser session

- GIVEN a template references a browser-only blob URL for a logo
- WHEN production rendering is requested
- THEN the renderer blocks the render before calling DocRaptor
- AND it reports that DocRaptor cannot fetch browser-only blob URLs

#### Scenario: Custom font is unreachable

- GIVEN a tenant brand uses a custom font URL
- WHEN render preflight checks the font
- THEN the renderer verifies DocRaptor can fetch the font resource
- AND rendering is blocked or warned according to the template's font fallback
  policy

### Requirement: Page Setup, Headers, Footers, And Breaks Are Rendered With Print CSS

The rendering pipeline SHALL translate page size, orientation, margins,
headers, footers, page counters, explicit page breaks, and keep-together hints
into DocRaptor-compatible print CSS.

The renderer SHALL validate header and footer height against page margins to
avoid cropped official documents.

#### Scenario: Long receipt includes repeating footer

- GIVEN a receipt template includes a footer with legal language and page
  numbers
- WHEN DocRaptor renders a multi-page PDF
- THEN the footer repeats on configured pages
- AND page numbers reflect the current page and total page count

#### Scenario: Header is taller than page margin

- GIVEN a template header is taller than the configured top margin
- WHEN staff request a production preview
- THEN the renderer reports a validation error or warning
- AND the system does not silently crop donor-facing content

### Requirement: Render Preview Has Browser And DocRaptor Modes

The rendering pipeline SHALL provide a fast browser preview and a true
DocRaptor test-render preview.

Browser preview SHALL NOT be treated as the only fidelity check for production
templates.

#### Scenario: Staff uses browser preview during editing

- GIVEN staff are iterating on a donor letter
- WHEN they request browser preview
- THEN the system renders a fast preview from sample data
- AND it identifies the preview as browser-rendered

#### Scenario: Finance approves a production template

- GIVEN a finance user is preparing to publish a financial report template
- WHEN they request production-fidelity preview
- THEN the system generates a DocRaptor test render
- AND publish validation can rely on that DocRaptor preview for the current
  template version

### Requirement: Render Logs, Errors, Retries, And Idempotency Are Durable

The rendering pipeline SHALL record render logs, warnings, errors, retry
attempts, idempotency keys, DocRaptor status ids where applicable, and artifact
metadata.

Retry behavior SHALL avoid duplicate official documents for the same template
version, data snapshot, recipient, and render intent.

#### Scenario: DocRaptor returns a validation error

- GIVEN DocRaptor fails a render due to invalid content or resource errors
- WHEN the renderer receives the failure
- THEN it stores normalized validation errors with the render job
- AND staff can see actionable error information without exposing secrets

#### Scenario: Retry is requested after transient failure

- GIVEN a render job failed because of a transient network error
- WHEN an authorized user or worker retries the job
- THEN the retry uses the existing idempotency key and render intent
- AND the system does not create duplicate final artifacts for the same
  official document

### Requirement: Artifact Storage Preserves Audit Metadata

The rendering pipeline SHALL store generated PDFs in tenant-safe storage paths
and track template version, data snapshot hash, renderer metadata, render
status, and artifact references.

Preview artifacts SHALL be distinguishable from production artifacts.

#### Scenario: Production tax receipt is stored

- GIVEN a tax receipt is rendered for a donor
- WHEN the PDF artifact is stored
- THEN the artifact path is tenant-safe and permission-protected
- AND the render record includes template version, data snapshot hash, and
  DocRaptor metadata

#### Scenario: Preview artifact is generated

- GIVEN staff generate a DocRaptor test preview
- WHEN the preview artifact is stored
- THEN it is marked as a preview artifact
- AND it cannot be mistaken for an issued donor receipt or official statement

### Requirement: Future PDF Profiles And Accessibility Options Are Supported Deliberately

The rendering pipeline SHALL leave explicit extension points for PDF/A,
PDF/UA, tagged PDFs, forms, metadata, and accessibility-oriented output where
future requirements require them.

The system MUST NOT silently claim PDF/A or accessibility compliance unless the
selected DocRaptor options, HTML structure, and validation process support that
claim.

#### Scenario: Tenant requests accessible annual statements

- GIVEN a tenant requires tagged annual giving statements
- WHEN the implementation enables accessible PDF output
- THEN it records the selected PDF profile and validation policy
- AND staff can distinguish ordinary PDFs from accessibility-targeted renders
