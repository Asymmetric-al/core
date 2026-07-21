# Eve Retention and Replay Specification

## Purpose

Define the lifecycle boundary for redacted Eve governance records and private
replay/debug artifacts without granting autonomy or storing artifact bodies in
Postgres.

## Requirements

### Requirement: Category-Based Retention With A 180-Day Default

Eve governance records (audit records, run summaries, and replay/debug artifact
metadata) MUST be retained by category with a 180-day default. Categories MAY
define shorter or longer windows. Gateway/model-call telemetry MUST use a
dedicated 30-day metadata-only category and MUST NOT contain prompt or response
bodies.

#### Scenario: An ordinary replay artifact is registered

- **GIVEN** a tenant owner registers a redacted replay artifact
- **WHEN** its category is resolved by the app
- **THEN** its expiry is 180 days from registration
- **AND** the caller cannot choose an unbounded category

#### Scenario: Gateway telemetry is registered

- **GIVEN** metadata-only gateway usage is registered
- **WHEN** its category is resolved
- **THEN** it receives the 30-day gateway retention window
- **AND** no prompt or response body field exists

### Requirement: Incident And Legal Holds Override Retention

An active incident or legal hold MUST prevent deletion of matching records and
artifacts until a human clears it. Setting and clearing a hold MUST record the
tenant, human profile, reason, target, and lifecycle action. A hold MUST NOT
pause automation or grant authority.

#### Scenario: An artifact expires under an active hold

- **GIVEN** an artifact is past its category expiry
- **AND** a matching incident hold is active
- **WHEN** the expiry worker claims eligible artifacts
- **THEN** the held artifact is skipped
- **AND** it becomes eligible only after a human clears the hold

### Requirement: Artifact Bodies Stay In Private Storage

Large replay/debug bodies MUST live in a private Supabase Storage bucket.
Postgres MUST store only queryable relational metadata and redacted summaries,
including content type, byte size, SHA-256, category, status, and expiry. Paths
MUST be constructed from verified tenant ID, verified owner profile ID, and a
server-generated artifact ID.

#### Scenario: A replay artifact is stored

- **GIVEN** an authenticated admin with a verified tenant and profile
- **WHEN** the server receives the bounded artifact body
- **THEN** the server redacts and hashes it before placing it in private Storage
- **AND** Postgres receives redacted metadata but no artifact body

### Requirement: Access Enforces Tenant And Owner

Artifact listing and signed download creation MUST require both the authenticated
tenant and owner profile to match the metadata row. Browser roles MUST NOT have
direct table or security-definer RPC authority.

#### Scenario: Another owner requests the artifact

- **GIVEN** an artifact belongs to one tenant profile
- **WHEN** a different tenant or profile requests a signed download
- **THEN** no matching metadata row is returned
- **AND** no signed URL is created

### Requirement: Expiry Is Auditable And Storage-Safe

Expiry MUST be bounded, concurrent-worker safe, hold-aware, and auditable.
Uploaded artifacts MUST move through `delete_pending`; metadata MUST be finalized
as expired only after Storage deletion succeeds. Upload-pending metadata MUST use
the same deletion path because object presence is uncertain after an interrupted
post-upload completion.

#### Scenario: Storage deletion fails transiently

- **GIVEN** an expired artifact is claimed
- **WHEN** Storage deletion fails
- **THEN** its metadata remains `delete_pending`
- **AND** the system does not falsely record the object as deleted

### Requirement: Retention Grants No Autonomy

This capability MUST govern lifecycle only. It MUST NOT widen Eve's autonomy,
override protected-area or approval policy, alter kill switches, or activate
memory retention.

#### Scenario: The retention capability is deployed

- **GIVEN** the retention schema and admin route are available
- **WHEN** Eve governance evaluates an operational action
- **THEN** retention state grants no permission for that action
- **AND** all existing governance and approval controls remain authoritative
