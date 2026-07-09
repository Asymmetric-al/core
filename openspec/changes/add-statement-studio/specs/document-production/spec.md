# Delta for Document Production

## ADDED Requirements

### Requirement: Statement Studio Owns Document Production, Not Domain Truth

Statement Studio MUST own templates, immutable versions, document-job
assignments, rendering, generated artifacts, retention, purge, and document
production audit. The domain that owns the source facts MUST authorize the
request and build the versioned render context.

Statement Studio MUST NOT independently recompute money, legal-donor identity,
receipt or statement eligibility, corrections, refunds, designations,
permissions, redaction, or other source-domain truth.

For official receipt/statement fields, the source context MUST provide both raw
structured values and frozen canonical display strings with locale/formatting
version metadata. Statement Studio MUST bind those fields and MUST NOT format
money or dates at render time.

#### Scenario: An annual giving statement is rendered

- GIVEN Giving has authorized the donor and built a versioned annual statement
  context from canonical contribution truth
- WHEN Statement Studio renders the annual statement
- THEN it binds the supplied frozen display fields through the assigned
  immutable template
- AND it does not query or recalculate donation eligibility or totals itself

#### Scenario: A template tries to reformat an official amount

- GIVEN an official statement context contains the frozen display string and
  raw structured value for an amount
- WHEN the assigned template attempts to format that raw amount at render time
- THEN validation rejects the template for official production use
- AND the issued document continues to bind the frozen display string

#### Scenario: A browser supplies financial render data

- WHEN a production render request includes browser-supplied official financial
  facts
- THEN the server rejects or ignores those facts
- AND resolves the authorized source-domain context server-side

### Requirement: Published Templates Are Immutable And Assigned Explicitly

Production document jobs MUST resolve to an immutable published template
version through an explicit tenant/scoped assignment. Mutable drafts and legacy
root-row defaults MUST NOT be production assignment targets.

Published content, schema version, content hash, and source variable contract
MUST NOT change in place. Replacement or rollback MUST create or select an
explainable version and MUST be audited.

#### Scenario: Staff publishes and assigns a template

- GIVEN an authorized staff user has a valid template draft
- WHEN the user publishes and assigns it to a document job
- THEN production resolution points to the immutable published version
- AND the assignment and publication are recorded in the audit trail

#### Scenario: Staff edits a published version

- WHEN any caller attempts to change published template content or its hash in
  place
- THEN the platform rejects the update
- AND requires a new draft/version for the change

### Requirement: Production Renders Create Durable Private Artifacts

Every successful production render MUST record the exact tenant, job, scope,
subject/recipient, source context reference and hash, assigned template version,
renderer outcome, checksum, size, private Storage location, retention state,
and audit linkage.

Generated official or sensitive documents MUST use private Storage. A public
bucket, permanent public URL, provider-only reference, or render-success toast
without durable bytes and metadata MUST NOT count as a completed artifact.

#### Scenario: A production render succeeds

- WHEN the renderer returns document bytes successfully
- THEN the server stores the bytes at an immutable tenant-aware private path
- AND persists the complete artifact record before reporting completion

#### Scenario: Artifact persistence fails after rendering

- WHEN rendering succeeds but private upload or artifact persistence fails
- THEN the operation reports a failed or partial state honestly
- AND does not advertise a downloadable production document

### Requirement: Document Persistence Enforces Same-Tenant Integrity

The platform MUST enforce same-tenant integrity for tenant-owned templates,
versions, assignments, renders, artifacts, batches, and audit records through
database constraints and server authorization. An independently supplied child
`tenant_id` MUST NOT be sufficient proof that its referenced parent belongs to
that tenant.

Production foundation work MUST reuse the platform's approved composite-key,
tenant-guard, `FORCE RLS`, and permanent cross-tenant negative-test posture. It
MUST NOT introduce a competing tenant-isolation primitive.

Direct Data API grants and RLS MUST NOT provide broader mutation authority than
the server-side Statement Studio capability model.

#### Scenario: A tenant-A artifact references a tenant-B template

- WHEN a caller attempts to create an artifact in tenant A that references a
  template or version in tenant B
- THEN the database rejects the relationship
- AND no cross-tenant metadata or bytes become accessible

#### Scenario: Staff without publish capability writes through the Data API

- WHEN an authenticated staff member without template publish capability tries
  to update a published version directly
- THEN grants/RLS reject the mutation
- AND UI visibility is not treated as the security boundary

### Requirement: Portal Downloads Reauthorize The Recipient

Donor and missionary document access MUST flow through their role-scoped BFF
boundaries. Each request MUST re-authorize tenant, role, recipient/subject,
source state, artifact state, and sensitivity before streaming bytes or issuing
a short-lived signed URL.

Service-role Storage access MUST NOT be treated as recipient authorization, and
portal clients MUST NOT receive direct broad reads over artifact or Storage
tables.

Authenticated self-download MAY remain independent of outbound communications.
Email or other outbound document delivery MUST use the platform communication
spine/send seam and document delivery adapter; Statement Studio MUST NOT create
a parallel provider-send or communication-audit path.

#### Scenario: A donor downloads their annual statement

- GIVEN the artifact belongs to the signed-in donor in the active tenant and is
  eligible for delivery
- WHEN the donor requests the statement through the donor BFF
- THEN the server returns or signs only that artifact
- AND records the download/delivery event

#### Scenario: A donor requests another donor's artifact

- WHEN a donor requests an artifact whose recipient/subject is another donor
- THEN the server returns a non-disclosing denial
- AND does not sign, stream, or reveal artifact metadata

### Requirement: Retention Purges Bytes Without Erasing Audit Truth

Document retention MUST apply a protected policy to each artifact class. Purge
MUST delete object bytes through the Storage API and retain a tombstone plus
audit evidence describing what was removed, by which policy/actor, and when.

#### Scenario: An eligible artifact reaches its retention date

- WHEN an authorized purge deletes the object through the Storage API
- THEN the artifact becomes a non-downloadable tombstone
- AND its tenant, job, source, version, checksum, purge reason, and timestamps
  remain auditable

### Requirement: Official Artifacts Preserve Correction Lineage

The platform MUST preserve correction lineage when a source-domain correction,
refund, donor relink, void, or other official fact change affects an
already-generated document. The source domain MUST determine the
official-document effect, and Statement Studio MUST record the prior artifact
as superseded or void according to that policy.

The prior artifact MUST link to the correction and replacement context/artifact
when one exists. Retained bytes and audit history MUST remain immutable, while
portal current-document views MUST NOT present stale output as current.

#### Scenario: A contribution correction changes an annual statement

- GIVEN a donor has an official annual statement artifact
- WHEN an approved contribution correction changes its included gifts or total
- THEN the old artifact is marked superseded and linked to the correction
- AND the replacement context/artifact links back to the old version
- AND the donor portal presents only the current eligible artifact as current

#### Scenario: A statement becomes void without replacement

- WHEN source-domain policy determines an official statement is no longer valid
- THEN the artifact is marked void and removed from current download choices
- AND retained bytes and audit history remain available only to authorized
  operational users under retention policy

### Requirement: Sample Tracer Artifacts Are Non-Official

Infrastructure tracer and preview artifacts MUST use synthetic data, carry an
explicit sample/preview purpose, be visibly marked
`SAMPLE - NOT AN OFFICIAL DOCUMENT`, and remain admin-only. They MUST NOT be
eligible for production assignment, donor/missionary portal delivery, official
document notification, or official retention/delivery metrics.

#### Scenario: Staff renders the annual starter before statement facts are ready

- GIVEN the canonical annual statement snapshot/version contract is not
  production-approved
- WHEN staff render the annual starter with a synthetic fixture
- THEN the artifact is recorded and displayed as admin-only sample output
- AND it cannot be assigned or delivered as a donor's official statement

#### Scenario: A portal requests a sample artifact

- WHEN a donor or missionary portal requests a sample/preview artifact
- THEN the BFF denies the request without signing or streaming the object

### Requirement: One Production Renderer Is Active During Cutover

Statement Studio MUST expose a provider-neutral renderer boundary and MUST have
one authoritative production renderer for a document job at a time. Running
legacy Unlayer export, DocRaptor, pdfx, React PDF, or another engine as competing
official paths requires an explicit migration and parity plan.

Before first-slice production enablement, the proposed DocRaptor provider MUST
pass representative qualification for tables/repeaters, pagination,
headers/footers, fonts/private assets, fidelity/accessibility, fail-closed
production mode, provider limits, latency, and expected cost. HITL review MUST
accept the qualification and known risks. Once approved, the first Statement
Studio production path MUST use that server-side integration behind the
renderer boundary until a later approved change replaces it.

#### Scenario: DocRaptor qualification is incomplete

- WHEN representative output, operational limits, latency, or cost have not
  been evaluated and accepted
- THEN official Statement Studio production rendering remains disabled
- AND sample/admin preview work may continue under the non-official boundary

#### Scenario: A new renderer is proposed

- WHEN the platform proposes replacing DocRaptor for a production job
- THEN the change defines output parity, artifact continuity, rollout,
  rollback, and legacy-template migration
- AND the platform does not silently enable both renderers as official truth

### Requirement: Legacy PDF Studio Is Retired Only After Verified Replacement

New Statement Studio templates MUST NOT depend on Unlayer. Existing Unlayer
templates MAY remain behind a documented legacy fallback until replacement
authoring, rendering, artifact delivery, rollback, and deployed tenant-template
disposition are verified.

#### Scenario: Staff opens an existing legacy template during migration

- GIVEN the tenant template has not been rebuilt and approved in Statement
  Studio
- WHEN authorized staff open it during the migration window
- THEN the product may route to the bounded legacy editor/export path
- AND does not claim that the template is a native Statement Studio version

#### Scenario: Legacy removal is requested

- WHEN maintainers propose deleting Unlayer code, flags, dependencies, or data
- THEN they must show verified replacement flows and tenant-template disposition
- AND removal is blocked while active tenant templates still depend on it
