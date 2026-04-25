# Delta for Document Batch Generation

## ADDED Requirements

### Requirement: Batch Runs Are Explicit Operational Records

The document batch system SHALL let authorized users create batch runs for
annual giving statements, donation receipts, tax receipts, financial reports,
missionary reports, invoices, and future scheduled document runs.

Each batch run SHALL record tenant, actor, purpose, template version, dataset
selector, recipient selector, creation time, status, progress, and audit
metadata.

#### Scenario: Finance creates year-end annual statement batch

- GIVEN a finance user has permission to run document batches
- WHEN they create a batch for annual giving statements for tax year 2025
- THEN the system records the selected template, donor population, statement
  period, and actor
- AND the batch starts as an auditable operational record

#### Scenario: Unauthorized user attempts batch creation

- GIVEN a user lacks batch generation permission
- WHEN they attempt to create a donation receipt batch
- THEN the system denies the request
- AND no batch run or render jobs are created

### Requirement: Template Snapshot Is Fixed At Batch Start

The batch system SHALL snapshot the exact template version, render settings,
variable definitions, and relevant brand or asset references at batch start.

Later edits to the template SHALL NOT alter documents already queued or
generated for that batch.

#### Scenario: Template changes after batch starts

- GIVEN a batch run has started with annual statement template version 4
- WHEN staff later edits the template and publishes version 5
- THEN the existing batch continues using version 4
- AND generated artifacts record version 4 as their source

#### Scenario: Template is archived during a batch

- GIVEN a batch run is already in progress
- WHEN the source template is archived by an authorized admin
- THEN the batch snapshot remains available for audit
- AND the system follows the configured cancellation or continuation policy
  instead of silently switching templates

### Requirement: Recipient And Dataset Selection Are Validated

The batch system SHALL resolve and validate recipient selection and dataset
selection before enqueuing per-document render jobs.

Selection SHALL be tenant-scoped and SHALL use the platform's operational truth
for donor, gift, missionary, invoice, and report data.

#### Scenario: Donor selection excludes ineligible records

- GIVEN a finance user selects donors who gave during a statement period
- WHEN the batch validates the recipient set
- THEN only tenant-owned eligible donor records are included
- AND excluded records are summarized with safe reasons where appropriate

#### Scenario: Dataset selector is ambiguous

- GIVEN a batch request contains an ambiguous fiscal period selector
- WHEN the system validates the dataset
- THEN batch creation is blocked
- AND the user must choose an explicit period before documents are queued

### Requirement: Per-Document Jobs Are Queue-Backed And Idempotent

The batch system SHALL create queue-backed per-document render jobs for each
recipient or document target.

Each job SHALL have an idempotency key based on tenant, batch, template
snapshot, recipient or record id, dataset snapshot, and render intent.

#### Scenario: Batch creates one job per donor

- GIVEN a batch includes 500 donors
- WHEN the batch is started
- THEN the system creates per-donor render jobs
- AND each job can be tracked independently through queued, working, completed,
  failed, retried, or canceled states

#### Scenario: Worker retries after timeout

- GIVEN a worker times out after submitting a render job
- WHEN the job is retried
- THEN the same idempotency key is used
- AND the system does not issue duplicate official statements for the same
  donor and batch

### Requirement: DocRaptor Async Rendering Supports Large Runs

The batch system SHALL support DocRaptor asynchronous rendering for large or
complex document runs.

Async jobs SHALL track DocRaptor status ids, callback or polling state, retry
state, and final download or artifact state.

#### Scenario: Large annual statement batch uses async jobs

- GIVEN a batch contains many long annual statements
- WHEN render jobs are submitted
- THEN the system may use DocRaptor async rendering
- AND each job tracks DocRaptor status until completed or failed

#### Scenario: DocRaptor callback is not received

- GIVEN an async render job was submitted with a callback URL
- WHEN the callback is not received within the configured window
- THEN the system polls or marks the job according to retry policy
- AND the job remains visible in batch progress

### Requirement: Concurrency Limits Protect Platform And Renderer

The batch system SHALL enforce concurrency limits for per-tenant, per-batch,
global, and DocRaptor-facing render activity.

Concurrency limits SHALL be configurable to protect renderer quotas, storage,
queue health, and tenant fairness.

#### Scenario: Multiple tenants run batches

- GIVEN two tenants start large document batches
- WHEN workers process render jobs
- THEN concurrency limits prevent one tenant from starving the other
- AND both batch runs continue to report progress honestly

#### Scenario: DocRaptor limit is reached

- GIVEN the renderer integration reaches a configured concurrency limit
- WHEN additional jobs are ready
- THEN jobs remain queued rather than failing as unknown errors
- AND the batch progress identifies queued work

### Requirement: Retry, Failure, And Partial Success Are Explicit

The batch system SHALL define retry behavior for transient failures and
non-retryable behavior for validation, permission, missing data, and totals
integrity failures.

The system SHALL support partial success reporting and SHALL make failed jobs
visible with actionable reasons.

#### Scenario: One donor record has missing required tax data

- GIVEN a batch generates tax receipts for many donors
- WHEN one donor record lacks a required receipt number
- THEN that job fails with a non-retryable validation error
- AND successful jobs for other donors remain completed

#### Scenario: Temporary renderer failure is retried

- GIVEN DocRaptor returns a transient service or network failure
- WHEN retry policy allows another attempt
- THEN the job is retried with the same render intent and idempotency key
- AND retry count and final outcome are logged

### Requirement: Donor Trust Prevents Silent Incorrect Documents

The batch system MUST NOT silently generate incorrect financial documents.

Batch generation SHALL halt affected jobs or the whole batch when required
data, totals, tenant scope, template snapshot, or dataset validation fails.

#### Scenario: Batch totals do not match source data

- GIVEN an annual statement batch computes donor totals from line items
- WHEN a donor's statement total does not match the selected gift data
- THEN the affected job fails validation
- AND the batch report identifies the mismatch before any official statement is
  issued for that donor

#### Scenario: Batch uses stale dataset snapshot

- GIVEN donation data changed after recipient selection but before render jobs
  start
- WHEN the batch detects that the data snapshot no longer matches the selected
  batch policy
- THEN it follows the configured halt or refresh policy
- AND it does not silently render documents from ambiguous data

### Requirement: Batch Runs Are Resumable And Cancelable

The batch system SHALL support resumable runs and authorized cancellation.

Cancellation SHALL stop unstarted jobs, mark in-progress jobs according to
their actual final state, and preserve audit records for already completed
documents.

#### Scenario: Worker process restarts mid-batch

- GIVEN a batch is partially complete
- WHEN the worker process restarts
- THEN the batch can resume from durable job state
- AND completed documents are not rendered again unnecessarily

#### Scenario: Admin cancels a batch

- GIVEN an authorized admin cancels an in-progress batch
- WHEN cancellation is accepted
- THEN queued jobs are canceled
- AND completed, failed, and in-progress job states remain auditable

### Requirement: Progress Tracking And Batch Download Are Accurate

The batch system SHALL expose progress counts for queued, working, completed,
failed, retried, canceled, and skipped jobs.

Batch download SHALL include only authorized completed artifacts and SHALL make
partial failure state visible.

#### Scenario: Staff views batch progress

- GIVEN a batch is generating annual statements
- WHEN staff view progress
- THEN the system displays counts by job state and recent errors
- AND progress does not imply completion while jobs remain queued or failed

#### Scenario: Batch download after partial success

- GIVEN a batch completed with some failed jobs
- WHEN an authorized user downloads generated PDFs
- THEN the download includes completed artifacts and a failure manifest
- AND the system clearly indicates that the batch was partially successful

### Requirement: Storage Paths And Audit Trail Are Tenant-Safe

The batch system SHALL store generated artifacts using tenant-safe paths and
SHALL log batch creation, start, render job outcomes, retries, cancellation,
downloads, and future delivery events where relevant.

Audit records SHALL include actor, tenant, template snapshot, batch id, job id,
recipient or record reference, and outcome.

#### Scenario: Generated receipts are stored

- GIVEN a receipt batch completes successfully
- WHEN artifacts are written to storage
- THEN each path is scoped to the tenant and batch
- AND each artifact records template version, data snapshot hash, and render
  metadata

#### Scenario: Batch download is audited

- GIVEN an authorized user downloads a completed batch package
- WHEN the download is requested
- THEN the system records the actor, time, tenant, batch id, and artifact set
- AND the audit trail can later explain who accessed the documents

### Requirement: Future Delivery And Scheduling Are Extension Points

The batch system SHALL leave explicit extension points for future email
delivery and scheduled generation, but first-pass batch generation SHALL NOT
pretend those features are implemented.

Future delivery and scheduling SHALL inherit the same template snapshot,
dataset validation, permission, audit, and donor-trust rules.

#### Scenario: Future email delivery is added

- GIVEN a later change adds email delivery for generated annual statements
- WHEN delivery is implemented
- THEN it uses the completed batch artifacts and delivery audit records
- AND it does not bypass render validation or permission checks

#### Scenario: Future scheduled generation is added

- GIVEN a tenant wants annual statements generated on a schedule
- WHEN scheduling is implemented in a later change
- THEN scheduled runs create normal auditable batch runs
- AND staff can inspect, cancel, and recover those runs using batch controls
