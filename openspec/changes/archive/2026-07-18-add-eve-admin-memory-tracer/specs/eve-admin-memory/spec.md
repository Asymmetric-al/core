# Delta for Eve private admin memory tracer bullet

## ADDED Requirements

### Requirement: Private Admin Memory Is Categorized And Never Authoritative

Eve memory MUST start as **private admin memory**, scoped to the admin identity, and organized into
categories for **communication preferences, project working context, and implementation decisions**.
Remembered memory MUST be **advisory only**: it MUST NOT override product intent, repo rules, OpenSpec, or
`AGENTS.md`. Memory MUST NOT be treated as higher authority than verified repo/spec facts.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:434]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:116]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:119]

#### Scenario: A preference is saved under a category in admin scope

- **GIVEN** an admin states a communication preference or a project decision
- **WHEN** it is remembered
- **THEN** it is stored under the correct category (preferences, project-context, or decisions) in private admin scope
- **AND** it is associated with the admin identity, not a tenant or a donor

#### Scenario: Remembered preference conflicts with product intent

- **GIVEN** a remembered preference that contradicts product intent or a repo rule
- **WHEN** Eve acts
- **THEN** product intent and repo/spec rules win and the memory does not override them
- **AND** memory is used as advisory context only

### Requirement: Hard Exclusions Keep Sensitive Data Out Of Memory

Eve memory MUST **exclude** — never store — secrets, credentials, payment data, donor or customer PII,
private keys, one-time codes, and sensitive tenant facts. This is a **hard boundary at write time**, not a
later redaction pass, so memory cannot become a hidden data leak. The exclusion MUST apply on every write
path, including auto-save.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:123]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:124]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:434]

#### Scenario: Content carrying a secret or PII reaches a write path

- **GIVEN** candidate memory text that contains a secret, credential, payment detail, donor/customer PII, private key, one-time code, or sensitive tenant fact
- **WHEN** a save (manual or auto-save) is attempted
- **THEN** the excluded content is not stored as memory
- **AND** the exclusion is recorded so the decision is auditable, without the excluded value itself being persisted

#### Scenario: The exclusion holds on the auto-save path

- **GIVEN** the auto-save path is active
- **WHEN** it encounters excluded data mixed into otherwise-allowed context
- **THEN** the entire candidate write is rejected so no sensitive fragment can be stored
- **AND** exclusion is never weaker on the auto-save path than on the manual path

### Requirement: Auto-Save Of Allowed Memory Emits Audit Events

Eve MUST be able to **auto-save allowed** private admin memory so useful context is not lost, and every
auto-save MUST **emit an audit event**. The **shape** of that audit event is defined by #419; this
capability only requires that the event is emitted on write.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:441]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:127]

#### Scenario: Allowed context is auto-saved

- **GIVEN** allowed context that passes the exclusion set
- **WHEN** Eve auto-saves it
- **THEN** the memory entry is created under its category
- **AND** an audit event is emitted for the write

#### Scenario: Excluded content produces no memory and no phantom entry

- **GIVEN** context that is fully excluded by the exclusion set
- **WHEN** auto-save runs
- **THEN** no memory entry is created
- **AND** the excluded value is not written into the audit event either

### Requirement: Admin Has Full Memory Control With Change History

The admin workspace MUST give the admin **full control** over memory: **view, search, edit, delete, disable,
category, scope, and change history**. Edits and deletions MUST be reflected in a **change history** so the
admin can inspect what changed. **Disable** MUST stop future auto-save into a scope/category without
destroying existing entries.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:443]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:130]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:126]

#### Scenario: Admin edits then deletes a memory entry

- **GIVEN** an existing memory entry
- **WHEN** the admin edits it and later deletes it
- **THEN** both the edit and the deletion appear in the entry's change history
- **AND** the admin can search and view the current state and the history

#### Scenario: Admin disables auto-save for a category

- **GIVEN** a memory category with auto-save enabled
- **WHEN** the admin disables it
- **THEN** no new entries are auto-saved into that category
- **AND** existing entries in that category are retained until explicitly deleted

### Requirement: Future Tenant Memory Is Schema-Ready But Disabled; Access And Retention Enforce Ownership And Grant No Autonomy

The memory schema MUST be **designed for future tenant-scoped operational memory**, but tenant operational
memory MUST remain **disabled** until its categories, retention, deletion, export, and audit rules are
explicit. Memory **access MUST enforce user and tenant ownership**. Memory **retention** (history and
deleted-entry policy) MUST be controlled **separately** from run-log retention. This capability grants **no
autonomy**: it MUST NOT widen Eve's powers, MUST NOT override #417 protected-area or approval rules, and MUST
remain subordinate to OpenSpec and `AGENTS.md`.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:437]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:138]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:431]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:310]
[VERIFIED-REPO: AGENTS.md]

#### Scenario: Tenant operational memory is attempted before its rules exist

- **GIVEN** the schema can represent tenant-scoped operational memory
- **WHEN** a write of tenant operational memory is attempted before categories, retention, deletion, export, and audit rules are explicit
- **THEN** it is refused because tenant operational memory is not enabled
- **AND** only private admin memory is live

#### Scenario: A user reads memory owned by another tenant or user

- **GIVEN** a user authenticated as user A / tenant A requests a memory entry owned by user B / tenant B
- **WHEN** access is evaluated
- **THEN** access is denied on the ownership check, not by UI hiding
- **AND** the denial does not depend on the requester's prompt or model output as authority

#### Scenario: Memory is mistaken for an autonomy control

- **GIVEN** the admin-memory capability is deployed
- **WHEN** a reviewer checks what it enables
- **THEN** it governs only memory content, control, access, and its own retention
- **AND** it grants no autonomous behavior and cannot override protected-area or approval rules
