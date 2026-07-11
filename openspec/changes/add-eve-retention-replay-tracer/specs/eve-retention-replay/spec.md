# Delta for Eve retention and replay artifact tracer bullet

## ADDED Requirements

### Requirement: Category-Based Retention With A 180-Day Default

Eve governance records (audit records, run summaries, replay/debug artifact metadata) MUST be retained by
**category**, with a **180-day default**. Categories MAY override the default with a shorter or longer
window, and larger artifacts MAY expire earlier when their purpose no longer applies. Gateway/model-call
telemetry MUST use a dedicated **metadata-only, 14–30 day rolling** category (no prompt/response bodies) —
tighter than the default. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:303]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:415] [PARTNER-RESPONSE 2026-07-02]

#### Scenario: A run-log record ages past its category window

- **GIVEN** a governance record in a category with a 180-day window
- **WHEN** the record is older than 180 days and no hold applies
- **THEN** the deletion job expires it
- **AND** the expiry is recorded so the lifecycle is auditable

#### Scenario: Gateway telemetry uses the short category

- **GIVEN** model-call/gateway-usage telemetry is written
- **WHEN** it is stored
- **THEN** it is classified into the metadata-only 14–30 day category (no prompt/response bodies)
- **AND** it expires on that shorter window, not the 180-day default

### Requirement: Incident And Legal Holds Override Retention

An incident or legal **hold** MUST prevent deletion of the affected records and artifacts beyond their
normal retention until the hold is cleared. Setting and clearing a hold MUST be a recorded human action.
A hold is a retention override only and MUST NOT pause automation (that is the #420 kill-switch, a separate
control). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:307]

#### Scenario: A hold protects records during an investigation

- **GIVEN** an incident hold is set on a set of records
- **WHEN** their retention window would otherwise expire them
- **THEN** the deletion job skips them while the hold is active
- **AND** they become eligible for expiry only after a human clears the hold

### Requirement: Replay And Debug Artifacts Are Redacted And Stored Outside Postgres

Large replay/debug artifacts MUST be stored in Supabase Storage with **relational metadata and redacted
summaries** in Postgres, so Postgres stays queryable and does not become an artifact bucket. Artifacts MUST
contain only **redacted** data — never raw secrets, credentials, payment data, donor/customer PII, private
keys, one-time codes, or raw protected tenant records.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:299]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:175]

#### Scenario: A failure produces a replay package

- **GIVEN** an Eve run fails and a replay/debug package is produced
- **WHEN** it is persisted
- **THEN** the artifact content goes to Supabase Storage and its queryable metadata + redacted summary go to Postgres
- **AND** the package contains no raw secrets, PII, or unsafe raw data

### Requirement: Retention Access Enforces Ownership And Grants No Autonomy

Access to replay/debug artifacts and retention records MUST enforce user and tenant ownership. This
capability governs record/artifact **lifecycle only**: it MUST NOT widen Eve's autonomy, MUST NOT override
the #417 protected-area or approval rules, and MUST remain subordinate to OpenSpec and `AGENTS.md`. Memory
retention is controlled separately and is not activated here.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:544]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:310]
[VERIFIED-REPO: AGENTS.md]

#### Scenario: A user requests a replay artifact from another tenant

- **GIVEN** a user authenticated to tenant A requests a replay artifact owned by tenant B
- **WHEN** access is evaluated
- **THEN** access is denied on the ownership check
- **AND** the denial does not depend on UI hiding

#### Scenario: Retention state is mistaken for an autonomy control

- **GIVEN** the retention/replay capability is deployed
- **WHEN** a reviewer checks what it enables
- **THEN** it governs only record/artifact lifecycle (categories, holds, expiry, access)
- **AND** it grants no autonomous behavior and cannot override protected-area or approval rules
