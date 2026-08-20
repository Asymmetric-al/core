# Delta for CRM Core

## ADDED Requirements

### Requirement: Asym Postgres Owns All CRM Records

Asym Postgres MUST own persons, donors, missionaries, households, organizations,
churches, relationships, notes, tasks, activity, duplicate state, and merge
state. Tenant and Legal Entity isolation MUST be enforced by Core's own
database and authorization boundaries. Provider links MAY exist as references.
They MUST NOT become identity or truth.

#### Scenario: Staff reads a CRM person

- WHEN Mission Control reads a CRM person, household, organization, or church
- THEN the record comes from Asym Postgres through `packages/api`
- AND the browser does not receive provider credentials

#### Scenario: A provider identifier is stored

- GIVEN an external system identifier is attached to a CRM record
- WHEN staff or code follows that identifier
- THEN it is treated as a reference
- AND Asym Postgres remains the authoritative record

### Requirement: CRM Notes Are Local Authoritative Records

A successful CRM note create MUST authenticate and authorize the actor,
validate title, body, visibility, and linked subject, insert the note into the
correct tenant-owned local table, record command audit, and return the
persisted note. The note MUST be immediately readable from local CRM queries.
Restricted-note authorization MUST be preserved. The create path MUST NOT
enqueue a Twenty or speculative outbound provider job.

#### Scenario: Staff creates a note

- GIVEN an authorized staff actor and valid note input
- WHEN the note is submitted
- THEN Asym Postgres stores the note in the actor's tenant
- AND command audit is recorded
- AND a subsequent local list or get returns the same note

#### Scenario: Restricted note visibility

- GIVEN a note marked restricted
- WHEN an unauthorized role requests it
- THEN the note is omitted or forbidden
- AND the tenant boundary still holds

#### Scenario: Cross-tenant note create is attempted

- WHEN an actor tries to create a note for another tenant's subject
- THEN the write is rejected
- AND no row is inserted for the foreign tenant

### Requirement: CRM Relationships Are Local Asym Reads

CRM relationship search, pagination, sorting, domain filtering, duplicate or
merge-candidate display, and care-sensitive exclusion MUST use local Asym
Postgres reads. Staff-visible source labels MUST be native Asym labels. The
path MUST NOT call a Twenty client or use `mode: "twenty"`.

#### Scenario: Staff opens CRM relationships

- WHEN a staff user opens the CRM relationships surface
- THEN the user sees native Asym relationship search and reporting controls
- AND reads go through `packages/api` against Asym Postgres
- AND the surface does not expose Twenty object names or Twenty-owned labels

#### Scenario: Care-sensitive relationship activity

- GIVEN a relationship activity row is care-sensitive or private-care related
- WHEN CRM activity is normalized for Mission Control
- THEN the row is excluded from the CRM relationship activity read model
- AND Asym care remains the authority for care plans and private care notes

### Requirement: Twenty CRM Is Retired And Prohibited

Twenty CRM MUST NOT be a product dependency. No product surface MAY read from,
write to, synchronize with, project into, or depend on Twenty. No new Twenty
client, route, webhook, secret, environment variable, health check, projection,
synchronization path, or provider-backed CRM read MAY be introduced. Historical
Twenty OpenSpec archives, ADR-0001, and dated evidence MUST remain historical
records.

#### Scenario: A change proposes restoring Twenty

- WHEN a proposal, code path, or env field would restore Twenty CRM
- THEN it is rejected as conflicting with accepted CRM authority
- AND the CRM capability itself remains

#### Scenario: Historical Twenty evidence is consulted

- WHEN an agent reads ADR-0001 or the archived Twenty OpenSpec package
- THEN those files remain historical
- AND their withdrawn deltas are not merged into current `crm-core`

## MODIFIED Requirements

### Requirement: CRM Backing Subsystem Stays Behind Asym Server Boundaries

Asym Postgres MUST stay behind Asym-owned server boundaries whenever it stores
CRM records.

Supabase Auth MUST remain the platform identity and session authority. Mission
Control MUST remain the staff operations shell. Asym-owned finance, CMS, care,
public website, donor portal, missionary workspace, and tenant-control
boundaries MUST NOT move into an external CRM vendor by implication.

All CRM reads and writes MUST pass through server-side Asym contracts, with
`packages/api` as the canonical business boundary. Browser code MUST NOT
receive raw CRM vendor API keys, webhook secrets, or direct vendor credentials.

#### Scenario: Mission Control needs CRM data

- GIVEN a Mission Control staff workflow needs CRM records
- WHEN the app reads or writes those records
- THEN the operation goes through an Asym server-side CRM contract against
  Asym Postgres
- AND the browser receives only role-scoped Asym data, not raw vendor
  credentials or unrestricted vendor responses

#### Scenario: A CRM backing record conflicts with an Asym-owned domain

- GIVEN a CRM record disagrees with Asym-owned finance, CMS publishing,
  care, auth, public surface, donor portal, or missionary workspace truth
- WHEN the platform decides which value wins
- THEN the Asym-owned domain remains authoritative for that domain
- AND the CRM record is updated, ignored, or reconciled through `packages/api`
  rather than becoming the hidden conflict winner

### Requirement: CRM Identity Concepts Stay Distinct And Linked

The platform MUST keep source identities distinct and connect them through
tenant-scoped link and merge-candidate records instead of collapsing them into
a single vendor record.

Supabase auth users, Asym profiles, tenant memberships, CRM people, donor
profiles, missionary profiles, CMS public entities, Stripe customers, funds or
projects, pledges or relationship commitments, gifts and their donation records,
payments, receipts, refunds, statements, and reconciliation records MUST remain
separate concepts. A CRM record MAY link to one or more of these concepts —
including a gift-to-CRM link that connects a donation to its CRM record — but
each link MUST preserve the source concept, source id, tenant, confidence,
status, verification state, and repair metadata.

Low-confidence duplicate matches MUST become merge candidates for staff review.
They MUST NOT automatically merge, overwrite, or link records. Cross-tenant
matches MUST be ignored or blocked. CRM schema and metadata changes MUST go
through the server-side path rather than a browser or client toolchain.

#### Scenario: A donor profile maps to a CRM person

- GIVEN a donor profile should appear in the CRM
- WHEN the integration maps it to a CRM person
- THEN the donor profile remains an Asym donor identity
- AND the CRM person remains a CRM person in Asym Postgres
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

### Requirement: CRM Stays A Native Mission Control Experience

Mission Control MUST remain the primary staff CRM experience. Staff users
SHOULD work through native Asym screens, tables, actions, reports, and
audit-aware flows. Raw vendor UI MUST NOT become the default Mission Control
CRM product experience.

Donor, missionary, and public surfaces MAY receive role-scoped CRM context
only after later work defines those slices. They MUST NOT expose staff-depth
CRM controls or raw CRM vendor UI.

External projections require separate accepted changes and remain
non-authoritative. They MUST NOT restore Twenty as a product dependency.

#### Scenario: Staff opens CRM after a domain cutover

- GIVEN CRM records are stored in Asym Postgres
- WHEN a staff user opens the CRM area in Mission Control
- THEN they see a native Asym staff operations experience
- AND no Twenty client, webhook, or vendor UI is required for the path to work

#### Scenario: Staff uses the native CRM notes domain

- GIVEN the notes domain is a native Mission Control CRM domain
- WHEN a staff user opens the CRM notes surface
- THEN the user sees native Asym table and note-create controls
- AND reads and writes go through `packages/api`
- AND note writes persist locally, create command audit, and are immediately
  readable without outbound Twenty sync

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

- GIVEN a later accepted change defines donor, missionary, CMS, event, or
  reporting projection contracts
- WHEN a staff user opens a projection-health surface
- THEN Mission Control shows native Asym projection health
- AND each row identifies role scope, source ownership, drift, parity, duplicate
  counts, and rollback state
- AND the target surfaces continue using their existing Asym read models until a
  later production cutover
- AND Twenty is not the projection source

#### Scenario: Staff supports a production CRM domain

- GIVEN production CRM records in Asym Postgres
- WHEN a staff operator investigates support, duplicate, or rollback state
- THEN they use native Asym evidence and command logs
- AND raw CRM vendor UI is not the staff support path
- AND donor, missionary, CMS, public, finance, care, payment, receipt,
  statement, refund, reconciliation, automation, and auth authority stay in
  their Asym-owned surfaces

## REMOVED Requirements

### Requirement: CRM Backing Datastore Stays Isolated

**Reason**: Asym Postgres now owns CRM truth. A dedicated external CRM
datastore is no longer the default or required backing store.
**Migration**: Isolation, backup, and privilege remain Asym Postgres and
tenant RLS concerns under `Asym Postgres Owns All CRM Records`.

### Requirement: CRM Sync Is Signed, Durable, Pausable, And Replayable

**Reason**: Twenty inbound/outbound sync, webhooks, replay, and projection
drift are retired as product dependencies.
**Migration**: Local authoritative writes, command audit, and optional later
non-Twenty projections require their own accepted changes.

### Requirement: CRM Production Cutover Is Domain-Gated And Reversible

**Reason**: There is no Twenty production cutover. Production CRM data is
Asym-owned.
**Migration**: Production safety for CRM remains tenant RLS, authorization,
migrations, and Core quality gates.
