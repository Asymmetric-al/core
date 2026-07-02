# CRM Core

## Purpose

Define the durable contract for the platform's CRM capability: the CRM owns
operational identity, relationships, and permissions-sensitive records behind
Asym-owned server boundaries. The current CRM backing implementation is Twenty,
which stays an internal subsystem; the contract below is written for the durable
capability, not the vendor, so the backing implementation can change without
rewriting intent. Mission Control remains the native staff CRM experience, and
sync, identity linkage, and cutover stay durable, auditable, and reversible.

## Requirements

### Requirement: CRM Backing Subsystem Stays Behind Asym Server Boundaries

The CRM backing subsystem MUST stay behind Asym-owned server boundaries whenever
it backs CRM records.

Supabase Auth MUST remain the platform identity and session authority. Mission
Control MUST remain the staff operations shell. Asym-owned finance, CMS, care,
public website, donor portal, missionary workspace, and tenant-control
boundaries MUST NOT move into the CRM backing subsystem by implication.

All calls to the CRM backing subsystem MUST pass through server-side Asym
contracts, with `packages/api` as the canonical business boundary for
integration behavior. Browser code MUST NOT receive raw CRM vendor API keys,
webhook secrets, or direct vendor credentials.

#### Scenario: Mission Control needs CRM data

- GIVEN a Mission Control staff workflow needs CRM records from the backing
  subsystem
- WHEN the app reads or writes those records
- THEN the operation goes through an Asym server-side CRM contract
- AND the browser receives only role-scoped Asym data, not raw vendor
  credentials or unrestricted vendor responses

#### Scenario: A CRM backing record conflicts with an Asym-owned domain

- GIVEN a CRM backing record disagrees with Asym-owned finance, CMS publishing,
  care, auth, public surface, donor portal, or missionary workspace truth
- WHEN the platform decides which value wins
- THEN the Asym-owned domain remains authoritative for that domain
- AND the CRM backing record is updated, ignored, or reconciled through the
  integration layer rather than becoming the hidden conflict winner

### Requirement: CRM Backing Datastore Stays Isolated

The CRM backing subsystem MUST use a dedicated datastore, isolated from the
Asym Supabase platform database, by default.

The Asym Supabase database MUST NOT become the CRM subsystem's backing store
unless a later accepted OpenSpec change proves that isolation, backup/restore,
migration, connection, privilege, and incident-response risks are acceptable in
non-production first.

The integration seam SHALL be API, webhook, link, projection, command, and
replay contracts rather than shared database ownership.

#### Scenario: A proof environment is created for the CRM subsystem

- GIVEN proof work starts a CRM backing runtime
- WHEN the operator chooses the datastore
- THEN they use an isolated dedicated database by default
- AND they do not point the CRM subsystem at the Asym Supabase platform database

#### Scenario: A shared Supabase database path is proposed

- GIVEN a contributor proposes using the Asym Supabase database as the CRM
  subsystem's backing store
- WHEN the proposal is evaluated
- THEN it is rejected unless a later accepted OpenSpec change has already proven
  the required isolation and operational safety criteria
- AND the dedicated database path remains the default when evidence is tied or
  incomplete

### Requirement: CRM Identity Concepts Stay Distinct And Linked

The platform MUST keep source identities distinct and connect them through
tenant-scoped link, merge-candidate, and projection-state records instead of
collapsing them into a single vendor record.

Supabase auth users, Asym profiles, tenant memberships, CRM people, donor
profiles, missionary profiles, CMS public entities, Stripe customers, funds or
projects, pledges or relationship commitments, gifts and their donation records,
payments, receipts, refunds, statements, and reconciliation records MUST remain
separate concepts. A CRM record MAY link to one or more of these concepts —
including a gift-to-CRM link that connects a donation to its CRM record — but
each link MUST preserve the source concept, source id, tenant, confidence,
status, verification state, and replay/repair metadata.

Low-confidence duplicate matches MUST become merge candidates for staff review.
They MUST NOT automatically merge, overwrite, or link records. Cross-tenant
matches MUST be ignored or blocked. CRM schema and metadata changes MUST go
through the server-side integration path rather than a browser or client
toolchain.

#### Scenario: A donor profile maps to a CRM person

- GIVEN a donor profile should appear in the CRM
- WHEN the integration maps it to a CRM person
- THEN the donor profile remains an Asym donor identity
- AND the CRM person remains a CRM person
- AND a tenant-scoped record link records the relationship between them rather
  than treating their IDs or concepts as interchangeable

#### Scenario: A completed gift links to CRM context

- GIVEN a completed donation should appear in CRM context
- WHEN the integration links the gift to its CRM record
- THEN a tenant-scoped gift-to-CRM link connects the donation to the CRM record
- AND payment, receipt, refund, statement, and reconciliation truth remain
  Asym-owned rather than becoming CRM-owned data

#### Scenario: Duplicate detection has weak evidence

- GIVEN two records share only weak name or organization evidence
- WHEN duplicate scoring evaluates the match
- THEN the platform writes a merge candidate for review
- AND it does not automatically link or merge the records

#### Scenario: A pledge is projected into CRM context

- GIVEN a pledge or relationship commitment is represented in the CRM
- WHEN the transform prepares CRM data
- THEN it carries relationship intent and commitment terms only
- AND payment execution, receipts, refunds, statements, and reconciliation
  truth remain Asym-owned

#### Scenario: Relationship expansion reports pledge commitments

- GIVEN relationship reporting includes pledge or commitment rows
- WHEN Mission Control displays those rows
- THEN it labels them as relationship commitments or finance summaries
- AND it does not include payment status, payment intent ids, receipt ids,
  statement ids, refund ids, or reconciliation state as CRM-owned data

#### Scenario: Relationship activity includes care-sensitive records

- GIVEN a CRM relationship activity row is care-sensitive or private-care
  related
- WHEN CRM activity is normalized for Mission Control
- THEN the row is excluded from the CRM relationship activity read model
- AND Asym care remains the authority for care plans and private care notes

### Requirement: CRM Sync Is Signed, Durable, Pausable, And Replayable

CRM sync paths MUST use signed ingress, durable sync records, idempotency keys,
operator-visible status, replay tooling, and per-domain pause controls in both
directions.

Inbound CRM webhook requests MUST be verified with a server-only secret and
timestamp before storage. Accepted events MUST be stored durably before
processing. Duplicate deliveries MUST NOT process twice. Outbound writes MUST
use idempotency keys and retry/dead-letter state, and replay MUST operate on the
existing durable event or job instead of creating duplicate records.

Operators MUST be able to pause inbound, outbound, and replay paths by tenant
and CRM domain. Reconciliation MUST detect orphan links, stale projections,
stalled jobs, pending duplicate candidates, failed webhooks, and unresolved
gift-to-CRM link drift. Ignored events MUST stay distinguishable from failed
events.

Cross-surface CRM projections MUST preserve the source-of-truth boundary of the
target surface. Donor, missionary, CMS, event, and reporting projections MUST
remain role-scoped, shadowed, drift-monitored, and rollback-ready before any
later cutover can let a target surface depend on them.

#### Scenario: A signed CRM webhook is received

- GIVEN the CRM subsystem sends a webhook for a record change
- WHEN the request reaches Asym
- THEN the route validates the timestamp and signature before storage
- AND the accepted event is stored in the durable CRM event store before
  processing
- AND duplicate delivery of the same event is ignored rather than processed
  twice

#### Scenario: Sync is paused for a CRM domain

- GIVEN inbound sync is paused for a tenant's people domain
- WHEN a valid people webhook is received
- THEN the event is stored with paused status
- AND no inbound processing is applied until replay is explicitly unpaused

#### Scenario: Reconciliation finds sync drift

- GIVEN CRM links, projections, outbound jobs, duplicate candidates, webhook
  events, and gift-to-CRM links have accumulated
- WHEN reconciliation runs
- THEN it records findings for orphan links, stale projections, stalled jobs,
  duplicate candidates, failed webhook events, and unresolved gift-to-CRM links
- AND it writes operator-visible sync log context

#### Scenario: A cross-surface projection is in shadow mode

- GIVEN a projection targets donor, missionary, CMS, event, or reporting context
- WHEN the projection is stored in the projection-state store
- THEN the state records source and projected hashes, target surface, role-scope
  metadata, sync status, and rollback metadata
- AND drift monitoring can report stale, missing, failed, conflicting, and
  duplicate records without transferring source-of-truth authority to the CRM
  subsystem

### Requirement: CRM Production Cutover Is Domain-Gated And Reversible

Production CRM domains MUST be cut over one domain at a time from an approved
production-domain set. A domain MUST NOT remain production-live until
development parity, production monitoring, rollback rehearsal, backup/restore
proof, load and rate-limit evidence, security review, support ownership,
rollback ownership, and CI/OpenSpec validation are recorded.

Reads MUST be enabled before writes. Writes MUST be limited to approved roles
and domains. Operators MUST keep a rollback window open until the domain has no
unresolved critical monitor, support, security, or restore issue.

Production cutover MUST NOT add new CRM domains by implication. It MUST NOT move
finance, CMS publishing, care, auth, payment, receipt, statement, refund,
reconciliation, automation, donor account, missionary workspace, public website,
or tenant-control authority into the CRM subsystem.

CRM vendor API keys, webhook secrets, workspace ids, and runtime credentials
MUST stay server-only and rotatable. Backup/restore proof MUST use the dedicated
CRM backing datastore and MUST NOT restore over or couple to the Asym Supabase
platform database.

#### Scenario: A CRM domain requests production activation

- GIVEN a CRM domain is ready for production activation
- WHEN the operator reviews the cutover evidence
- THEN the evidence includes development parity, monitoring, rollback rehearsal,
  backup/restore proof, load and rate-limit result, security review, support
  owner, rollback owner, and CI/OpenSpec validation
- AND reads are enabled before writes
- AND the domain stays inside the approved production-domain set

#### Scenario: A production CRM monitor fails during the rollback window

- GIVEN a production CRM domain has an unresolved critical monitor, support,
  security, or restore issue
- WHEN the rollback window is still open
- THEN operators pause inbound, outbound, and replay for that domain
- AND they disable unsafe writes or route actions
- AND the affected surface returns to the prior Asym read model or shadow-only
  projection until reconciliation is green

#### Scenario: Backup restore is required for a cutover domain

- GIVEN a cutover domain depends on CRM production data
- WHEN operators prove backup and restore
- THEN they restore the dedicated CRM backup into an isolated target
- AND they validate domain counts and sample records
- AND they do not restore over or require changes to the Asym Supabase platform
  database

#### Scenario: CRM secrets rotate during production operations

- GIVEN a CRM vendor API key or webhook secret must be rotated
- WHEN operators perform the rotation
- THEN the replacement secret is configured server-side only
- AND signed webhook tests or replay validate the new secret
- AND browser bundles, route responses, logs, and docs do not expose the raw
  secret

### Requirement: CRM Stays A Native Mission Control Experience

Mission Control MUST remain the primary staff CRM experience when the CRM is
backed by an internal subsystem. Staff users SHOULD work through native Asym
screens, tables, actions, reports, and audit-aware flows rather than through raw
CRM vendor UI as the normal operating surface.

Raw CRM vendor UI MAY be used for non-production proof, operational diagnostics,
or carefully controlled admin escape hatches, but it MUST NOT become the default
Mission Control CRM product experience without a later explicit OpenSpec change.

Donor, missionary, and public surfaces MAY receive role-scoped CRM projections
only after later work defines those slices. They MUST NOT expose staff-depth CRM
controls or raw CRM vendor UI.

Cross-surface projections MUST run in shadow mode before any donor, missionary,
CMS, event, public, or reporting surface depends on them. Mission Control MUST
provide staff visibility into projection drift, parity, duplicate counts, source
ownership, and rollback state before production cutover.

During production cutover, staff-facing readiness, support, and rollback
controls MUST remain native Asym operational surfaces or runbooks. Raw CRM
vendor UI MAY help diagnose vendor state, but it MUST NOT become the staff
support path or the source of product truth for Asym permissions, support
ownership, or rollback state.

#### Scenario: Staff opens CRM after a domain cutover

- GIVEN a CRM domain has been cut over to the backing subsystem as
  infrastructure
- WHEN a staff user opens the CRM area in Mission Control
- THEN they see a native Asym staff operations experience
- AND the CRM backing dependency stays behind the Asym CRM contract

#### Scenario: Staff uses the native CRM notes domain

- GIVEN the notes domain is a native Mission Control CRM domain
- WHEN a staff user opens the CRM notes surface
- THEN the user sees native Asym table and note-create controls
- AND reads and writes go through `packages/api`
- AND note writes create command audit, outbound sync, replay, and rollback
  state

#### Scenario: Staff searches expanded CRM relationship domains

- GIVEN churches, organizations, households, pledges as relationship
  commitments, and relationship activity are available
- WHEN a staff user opens the CRM relationships surface
- THEN the user sees native Asym relationship search and reporting controls
- AND reads go through `packages/api`
- AND reports identify CRM, finance, care, and auth source-system ownership
- AND the surface does not expose donor, missionary, public, finance, care, CMS,
  payment, or raw CRM vendor controls

#### Scenario: A narrow surface needs CRM context

- GIVEN a donor, missionary, or public flow needs limited CRM context
- WHEN the platform exposes that context
- THEN it exposes only the role-appropriate Asym projection
- AND it does not leak raw CRM vendor UI, staff controls, or vendor credentials
  into the narrow surface

#### Scenario: Staff reviews cross-surface projection shadow mode

- GIVEN donor, missionary, CMS, event, and reporting projection contracts exist
- WHEN a staff user opens the CRM projection-health surface
- THEN Mission Control shows native Asym projection health
- AND each row identifies role scope, source ownership, drift, parity, duplicate
  counts, and rollback state
- AND the target surfaces continue using their existing Asym read models until a
  later production cutover

#### Scenario: Staff supports a production CRM domain

- GIVEN a production-live CRM domain
- WHEN a staff operator investigates support, drift, queue, duplicate, or
  rollback state for that domain
- THEN they use native Asym evidence, sync logs, projection state, command logs,
  and the CRM cutover runbook
- AND raw CRM vendor UI remains diagnostic only
- AND donor, missionary, CMS, public, finance, care, payment, receipt,
  statement, refund, reconciliation, automation, and auth authority stay in
  their Asym-owned surfaces
