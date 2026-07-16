# Delta for CRM Core

> **RETIRED (2026-07-06, ADR-0001)** — this change is withdrawn; see the
> banner in [proposal.md](../../proposal.md). Preserved unedited as historical
> record.

## ADDED Requirements

### Requirement: Twenty CRM Is An Internal Subsystem Behind Asym

Twenty MUST be treated as an internal subsystem behind Asym-owned server
boundaries whenever it backs CRM records.

Supabase Auth MUST remain the platform identity and session authority. Mission
Control MUST remain the staff operations shell. Asym-owned finance, CMS, care,
public website, donor portal, missionary workspace, and tenant control
boundaries MUST NOT move to Twenty by implication.

All Asym-to-Twenty calls MUST pass through server-side Asym contracts, with
`packages/api` as the canonical business boundary for integration behavior.
Browser code MUST NOT receive raw Twenty API keys, webhook secrets, or direct
vendor credentials.

#### Scenario: Mission Control needs Twenty-backed CRM data

- GIVEN a Mission Control staff workflow needs CRM records backed by Twenty
- WHEN the app reads or writes those records
- THEN the operation goes through an Asym server-side CRM contract
- AND the browser receives only role-scoped Asym data, not raw Twenty
  credentials or unrestricted vendor responses

#### Scenario: A Twenty record conflicts with an Asym-owned domain

- GIVEN a Twenty CRM record disagrees with Asym-owned finance, CMS publishing,
  care, auth, public surface, donor portal, or missionary workspace truth
- WHEN the platform decides which value wins
- THEN the Asym-owned domain remains authoritative for that domain
- AND Twenty is updated, ignored, or reconciled through the integration layer
  rather than becoming the hidden conflict winner

### Requirement: Twenty Backing Store Isolation

Twenty MUST use a dedicated Postgres backing database by default, isolated from
the existing Asym Supabase platform database.

The existing Supabase Postgres database MUST NOT become Twenty's backing store
unless a later accepted OpenSpec change proves that isolation, backup/restore,
migration, connection, privilege, and incident-response risks are acceptable in
non-production first.

The integration seam SHALL be API, webhook, link-table, projection, command,
and replay contracts rather than shared database ownership.

#### Scenario: A proof environment is created for Twenty

- GIVEN Phase 00 or later proof work starts a Twenty runtime
- WHEN the operator chooses the database backing store
- THEN they use an isolated Twenty Postgres database by default
- AND they do not point Twenty at the existing Asym Supabase platform database

#### Scenario: A shared Supabase database path is proposed

- GIVEN a contributor proposes using the existing Asym Supabase Postgres
  database as Twenty's backing database
- WHEN the proposal is evaluated
- THEN it is rejected unless a later accepted OpenSpec change has already
  proven the required isolation and operational safety criteria
- AND the dedicated database path remains the default when evidence is tied or
  incomplete

### Requirement: CRM Identity Concepts Stay Distinct And Linked

When Twenty backs CRM records, the platform MUST keep source identities
distinct and connect them through tenant-scoped link, merge-candidate, and
projection state tables instead of collapsing them into a single vendor record.

Supabase auth users, Asym profiles, tenant memberships, CRM people, donor
profiles, missionary profiles, CMS public entities, Stripe customers, funds or
projects, pledges or relationship commitments, payments, receipts, refunds,
statements, and reconciliation records MUST remain separate concepts. A Twenty
record MAY link to one or more of these concepts, but the link MUST preserve
the source concept, source id, tenant, confidence, status, verification state,
and replay/repair metadata.

Low-confidence duplicate matches MUST become merge candidates for staff review.
They MUST NOT automatically merge, overwrite, or link records. Cross-tenant
matches MUST be ignored or blocked.

Twenty schema management for production MUST use the server-side Metadata API
path unless a later accepted change proves an isolated Twenty app manifest
toolchain is production-ready for this repo.

#### Scenario: A donor profile maps to a Twenty person

- GIVEN a donor profile should appear in the CRM
- WHEN the integration maps it to a Twenty person
- THEN the donor profile remains an Asym donor identity
- AND the Twenty person remains a CRM person
- AND `crm_record_links` records the tenant-scoped relationship between them
  rather than treating their IDs or concepts as interchangeable

#### Scenario: Duplicate detection has weak evidence

- GIVEN two records share only weak name or organization evidence
- WHEN duplicate scoring evaluates the match
- THEN the platform writes a merge candidate for review
- AND it does not automatically link or merge the records

#### Scenario: A pledge is projected into CRM context

- GIVEN a pledge or relationship commitment is represented in Twenty
- WHEN the transform prepares CRM data
- THEN it carries relationship intent and commitment terms only
- AND payment execution, receipts, refunds, statements, and reconciliation
  truth remain Asym-owned

#### Scenario: Relationship expansion reports pledge commitments

- GIVEN Phase 05 relationship reporting includes pledge or commitment rows
- WHEN Mission Control displays those rows
- THEN it labels them as relationship commitments or finance summaries
- AND it does not include payment status, payment intent ids, receipt ids,
  statement ids, refund ids, or reconciliation state as CRM-owned data

#### Scenario: Relationship activity includes care-sensitive records

- GIVEN a Twenty relationship activity row is care-sensitive or private-care
  related
- WHEN Phase 05 normalizes CRM activity for Mission Control
- THEN the row is excluded from the CRM relationship activity read model
- AND Asym care remains the authority for care plans and private care notes

### Requirement: CRM Sync Is Signed, Durable, Pausable, And Replayable

CRM sync paths MUST use signed ingress, durable sync tables, idempotency keys,
operator-visible status, replay tooling, and per-domain pause controls when
Twenty sends events to Asym or Asym queues writes to Twenty.

Twenty webhook requests MUST be verified with the server-only webhook secret
before storage. Accepted events MUST be stored durably before processing.
Duplicate webhook deliveries MUST NOT process twice. Outbound writes MUST use
idempotency keys and retry/dead-letter state. Replay MUST operate on the
existing durable event or job instead of creating duplicate records.

Operators MUST be able to pause inbound, outbound, and replay paths by tenant
and CRM domain. Reconciliation MUST detect orphan links, stale projections,
stalled jobs, duplicate candidates, and failed webhooks. Ignored events MUST be
distinguishable from failed events.

Cross-surface CRM projections MUST preserve the source-of-truth boundary of
the target surface. Donor, missionary, CMS, event, and reporting projections
MUST remain role-scoped, shadowed, drift-monitored, and rollback-ready before a
later production cutover phase can make any target surface depend on them.

#### Scenario: A signed Twenty webhook is received

- GIVEN Twenty sends a webhook for a CRM record change
- WHEN the request reaches Asym
- THEN the route validates the timestamp and HMAC signature before storage
- AND the accepted event is stored in `crm_webhook_events` before processing
- AND duplicate delivery of the same event is ignored rather than processed
  twice

#### Scenario: Sync is paused for a CRM domain

- GIVEN inbound sync is paused for a tenant's people domain
- WHEN a valid people webhook is received
- THEN the event is stored with paused status
- AND no inbound processing is applied until replay is explicitly unpaused

#### Scenario: Reconciliation finds sync drift

- GIVEN CRM links, projections, outbound jobs, duplicate candidates, and
  webhook events have accumulated
- WHEN reconciliation runs
- THEN it records findings for orphan links, stale projections, stalled jobs,
  duplicate candidates, and failed webhook events
- AND it writes operator-visible sync log context

#### Scenario: A cross-surface projection is in shadow mode

- GIVEN a projection targets donor, missionary, CMS, event, or reporting
  context
- WHEN the projection is stored in `crm_projection_state`
- THEN the state records source and projected hashes, target surface, role
  scope metadata, sync status, and rollback metadata
- AND drift monitoring can report stale, missing, failed, conflicting, and
  duplicate records without transferring source-of-truth authority to Twenty

### Requirement: Twenty Production Cutover Is Domain-Gated And Reversible

Production CRM domains backed by Twenty MUST be cut over one domain at a time
from the approved Phase 07 catalog. A domain MUST NOT remain production-live
until development parity, production monitoring, rollback rehearsal,
backup/restore proof, load and rate-limit evidence, security review, support
ownership, rollback ownership, and CI/OpenSpec validation are recorded.

Reads MUST be enabled before writes. Writes MUST be limited to approved roles
and domains. Operators MUST keep a rollback window open until the domain has
no unresolved critical monitor, support, security, or restore issues.

Production cutover MUST NOT add new CRM domains by implication. It MUST NOT
move finance, CMS publishing, care, auth, payment, receipt, statement, refund,
reconciliation, automation, donor account, missionary workspace, public
website, or tenant-control authority into Twenty.

Twenty API keys, webhook secrets, workspace ids, and runtime credentials MUST
stay server-only and rotatable. Backup/restore proof MUST use the dedicated
Twenty backing database and MUST NOT restore over or couple to the Asym
Supabase platform database.

#### Scenario: A CRM domain requests production activation

- GIVEN a Phase 07 CRM domain is ready for production activation
- WHEN the operator reviews the cutover evidence
- THEN the evidence includes development parity, monitoring, rollback rehearsal,
  backup/restore proof, load and rate-limit result, security review, support
  owner, rollback owner, and CI/OpenSpec validation
- AND reads are enabled before writes
- AND the domain remains inside the approved Phase 07 catalog

#### Scenario: A production CRM monitor fails during the rollback window

- GIVEN a Twenty-backed production CRM domain has an unresolved critical
  monitor, support, security, or restore issue
- WHEN the rollback window is still open
- THEN operators pause inbound, outbound, and replay for that domain
- AND they disable unsafe writes or route actions
- AND the affected surface returns to the prior Asym read model or shadow-only
  projection until reconciliation is green

#### Scenario: Backup restore is required for a cutover domain

- GIVEN a cutover domain depends on Twenty production data
- WHEN operators prove backup and restore
- THEN they restore the dedicated Twenty Postgres backup into an isolated
  target
- AND they validate domain counts and sample records
- AND they do not restore over or require changes to the Asym Supabase
  platform database

#### Scenario: Twenty secrets rotate during production operations

- GIVEN a Twenty API key or webhook secret must be rotated
- WHEN operators perform the rotation
- THEN the replacement secret is configured server-side only
- AND signed webhook tests or replay validate the new secret
- AND browser bundles, route responses, logs, and docs do not expose the raw
  secret

### Requirement: Twenty-Backed CRM Remains A Native Mission Control Experience

When Twenty backs CRM data, Mission Control MUST remain the primary staff CRM
experience. Staff users SHOULD work through native Asym screens, tables,
actions, reports, and audit-aware flows rather than through raw Twenty UI as
the normal operating surface.

Raw Twenty UI MAY be used for non-production proof, operational diagnostics, or
carefully controlled admin escape hatches, but it MUST NOT become the default
Mission Control CRM product experience without a later explicit OpenSpec
change.

Donor, missionary, and public surfaces MAY receive role-scoped CRM projections
only after later phase work defines those slices. They MUST NOT expose
staff-depth CRM controls or raw Twenty UI.

Cross-surface projections MUST run in shadow mode before any donor,
missionary, CMS, event, public, or reporting surface depends on them. Mission
Control MUST provide staff visibility into projection drift, parity, duplicate
counts, source ownership, and rollback state before production cutover.

During production cutover, staff-facing readiness, support, and rollback
controls MUST remain native Asym operational surfaces or runbooks. Raw Twenty
UI MAY help diagnose vendor state, but it MUST NOT become the staff support
path or the source of product truth for Asym permissions, support ownership,
or rollback state.

#### Scenario: Staff opens CRM after a Twenty-backed domain cutover

- GIVEN a CRM domain has been cut over to Twenty as backing infrastructure
- WHEN a staff user opens the CRM area in Mission Control
- THEN they see a native Asym staff operations experience
- AND the Twenty dependency stays behind the Asym CRM contract

#### Scenario: Staff uses the first native Twenty-backed notes domain

- GIVEN the Notes CRM domain is cut over as the first Phase 04 Mission Control
  domain
- WHEN a staff user opens `/crm/notes`
- THEN the user sees native Asym table and note-create controls
- AND reads and writes go through `packages/api`
- AND note writes create command audit, outbound sync, replay, and rollback
  state

#### Scenario: Staff searches expanded CRM relationship domains

- GIVEN churches, organizations, households, pledges as relationship
  commitments, and relationship activity are available through Phase 05
- WHEN a staff user opens `/crm/relationships`
- THEN the user sees native Asym relationship search and reporting controls
- AND reads go through `packages/api`
- AND reports identify CRM, finance, care, and auth source-system ownership
- AND the surface does not expose donor, missionary, public, finance, care, CMS,
  payment, or raw Twenty controls

#### Scenario: A narrow surface needs CRM context

- GIVEN a donor, missionary, or public flow needs limited CRM context
- WHEN the platform exposes that context
- THEN it exposes only the role-appropriate Asym projection
- AND it does not leak raw Twenty UI, staff controls, or vendor credentials into
  the narrow surface

#### Scenario: Staff reviews cross-surface projection shadow mode

- GIVEN donor, missionary, CMS, event, and reporting projection contracts exist
- WHEN a staff user opens `/crm/projections`
- THEN Mission Control shows native Asym projection health
- AND each row identifies role scope, source ownership, drift, parity,
  duplicate counts, and rollback state
- AND the target surfaces continue using their existing Asym read models until
  a later production cutover phase

#### Scenario: Staff supports a production CRM domain

- GIVEN a Phase 07 domain is production-live
- WHEN a staff operator investigates support, drift, queue, duplicate, or
  rollback state for that domain
- THEN they use native Asym evidence, sync logs, projection state, command
  logs, and the CRM cutover runbook
- AND raw Twenty UI remains diagnostic only
- AND donor, missionary, CMS, public, finance, care, payment, receipt,
  statement, refund, reconciliation, automation, and auth authority stay in
  their Asym-owned surfaces
