<!-- Generated from docs/prds/workflow-studio/contracts/requirements.json by tools/render.py. -->

## Purpose

Define source-bound tenant workflow authoring, coordination, participant experiences and independently qualified domain delivery without duplicating business authority.

## ADDED Requirements

### Requirement: One Shared Studio

The system SHALL provide one Mission Control workflow authoring and operation capability with contextual module entry points. Simple and visual authoring MUST use one definition and execution vocabulary.

#### Scenario: WS-RQ-001 supported behavior

- GIVEN A staff member opens a Support Hub automation from module settings
- WHEN the automation is edited and published
- THEN the same definition and history appear in Workflow Studio; no second engine executes it

### Requirement: Source Authority

The Studio MUST invoke only registered, source-authorized operations and MUST NOT manufacture financial, identity, clinical, signature, or publication truth.

#### Scenario: WS-RQ-002 supported behavior

- GIVEN A workflow task is checked complete without a source approval
- WHEN downstream work requests approved financial evidence
- THEN the required source decision remains unsatisfied and no protected effect occurs

### Requirement: Typed Conditional Logic

Predicates SHALL be typed and use explicit true, false and unknown results. Unauthorized fields MUST be blocked, not treated as absent.

#### Scenario: WS-RQ-003 supported behavior

- GIVEN a required fact has incomplete historical coverage
- WHEN a conditional route evaluates
- THEN no adverse fallback or fabricated first-gift determination occurs

### Requirement: Explicit Branch and Join Semantics

Exclusive routing MUST reject overlap or unresolved alternatives. Parallel work MUST freeze selected branches and require declared source-qualified completion.

#### Scenario: WS-RQ-004 supported behavior

- GIVEN a required church reference is absent but two other references exist
- WHEN a reference join evaluates
- THEN the church-reference requirement remains unsatisfied

### Requirement: Versioned Publications

Published executable definitions SHALL be immutable and active engagements MUST pin their publication and compatible action contracts.

#### Scenario: WS-RQ-005 supported behavior

- GIVEN an applicant is running version one
- WHEN a new template version is published
- THEN the applicant retains the old plan until an explicit authorized change

### Requirement: Per Run Amendments

The system SHALL support authorized individual plan amendments with an immutable impact preflight, reason, revision checks and required source review.

#### Scenario: WS-RQ-006 supported behavior

- GIVEN one applicant needs an additional interview
- WHEN a permitted amendment is committed
- THEN only that run changes and completed source history remains intact

### Requirement: Tenant Scoped Execution

All reads, effects, events, claims and views MUST remain tenant scoped on shared infrastructure. Workflow assignment MUST NOT grant data or action authority.

#### Scenario: WS-RQ-007 supported behavior

- GIVEN a tenant member guesses another tenant run identifier
- WHEN they request its state or issue a mutation
- THEN the server denies access without exposing its existence

### Requirement: Runtime Current Authority

Publication authority and runtime action authority SHALL be distinct. Current source permissions, suppression and cancellation MUST be checked at action time. Runtime execution MUST use the Phase 12 NHI’s own grants intersected live with its required active human owner’s current capabilities. Departure force-disables affected authority; a frozen publisher snapshot or delayed review MUST NOT authorize more work.

#### Scenario: WS-RQ-008 supported behavior

- GIVEN a message is queued under an old plan
- WHEN its recipient eligibility or grant is revoked
- THEN the disallowed dispatch is blocked despite the old publication

### Requirement: Identifier Only Orchestration

Inngest events, step results, trace metadata and errors MUST contain only source-approved safe references and routing metadata, not private record contents.

#### Scenario: WS-RQ-009 supported behavior

- GIVEN an action loads a confidential application
- WHEN the action returns or fails
- THEN no application contents, signed URL or secret are stored in orchestration diagnostics

### Requirement: Durable Intake and Idempotency

Accepted source events SHALL be recoverable through product-owned durable receipts/outbox and permanent semantic effect identities.

#### Scenario: WS-RQ-010 supported behavior

- GIVEN a processed gift event is delivered again after a provider dedupe window
- WHEN the workflow evaluates
- THEN the same intended business effect is not performed again

### Requirement: Race Safe Waiting

Human and provider waits SHALL be satisfied from authoritative source evidence even if completion occurs before listener registration.

#### Scenario: WS-RQ-011 supported behavior

- GIVEN a reference completes before its waiting step is registered
- WHEN the durable wait is created
- THEN a source recheck recognizes completion without requiring resubmission

### Requirement: Uncertain External Results

An operation that may have executed externally MUST remain outcome-unknown until reconciled and MUST NOT be blindly retried.

#### Scenario: WS-RQ-012 supported behavior

- GIVEN a provider accepts a send but the response is lost
- WHEN the execution lease or retry window expires
- THEN the operation is reconciled or reviewed rather than sent anew

### Requirement: Role Bound Shared Tasks

Workflow work SHALL reuse shared tasks and source-owned outcome contracts, with explicit eligible owner resolution and fallback.

#### Scenario: WS-RQ-013 supported behavior

- GIVEN no currently eligible coordinator exists
- WHEN an assignment action runs
- THEN the task enters an authorized assignment-needed queue without broadening access

### Requirement: Forms and Evidence

Forms SHALL be versioned, partially savable and submitted through allowed source mappings. Evidence MUST be qualified by its owner, not inferred from upload or task status. Phase 34 MUST own common private form mechanisms; Phase 41 MUST own application accepted answers and evidence meaning. FORM-03 MUST exclude nonapplicable hidden values from accepted submissions/effects while source policy governs draft/history retention. Public forms MUST retain Phase 23 occurrence and one Primary Outcome.

#### Scenario: WS-RQ-014 supported behavior

- GIVEN a required document upload is quarantined
- WHEN the requirement is evaluated
- THEN it remains unsatisfied until source-qualified clean accepted evidence exists

### Requirement: External Task Access

External access SHALL be task-purpose scoped, expiring and revocable; a GET or scanner visit MUST NOT submit, sign, approve or create membership.

#### Scenario: WS-RQ-015 supported behavior

- GIVEN an email scanner follows a reference link
- WHEN the GET is processed
- THEN no irreversible action or access grant occurs

### Requirement: Participant Journeys

Participants SHALL see only their approved tasks, milestones, evidence and communications through server-side projections. Phase 34 MUST provide common participant composition; Phase 41 MUST own application-specific My Journey and its source milestones. Exact private admission MUST be qualified through Phase 4/12 without widening public/anonymous access or implying donor/missionary membership.

#### Scenario: WS-RQ-016 supported behavior

- GIVEN an applicant opens My Journey
- WHEN the server returns journey data
- THEN internal assessments, staff routing and unrelated roles are excluded from the response

### Requirement: Sealed Care Work

Restricted care templates, runs, memberships, counts and audit SHALL be invisible to unauthorized principals, including ordinary administrators.

#### Scenario: WS-RQ-017 supported behavior

- GIVEN a sealed intake exists
- WHEN an ordinary administrator searches or exports workflow data
- THEN no care existence signal or contents are disclosed

### Requirement: Governed Communication

All workflow communication SHALL use owning-domain purpose/audience, governed publications and the shared dispatch/history spine. A workflow MUST invoke the exact code-owned Live Phase 17 producer binding and whole bounded plan occurrence released through Phase 6; it MUST NOT directly create child intents, recipients or rendered content.

#### Scenario: WS-RQ-018 supported behavior

- GIVEN two workflows request the same acknowledgment purpose
- WHEN the requests are processed
- THEN one source semantic effect is produced or incompatible request content is explicitly blocked

### Requirement: Protected Domain Processes

Finance, recurring recovery, records, identity and other protected policies SHALL remain native source-owned processes with bounded coordination hooks.

#### Scenario: WS-RQ-019 supported behavior

- GIVEN an administrator tries to create an automatic expense approval or recurring retry node
- WHEN the configuration is validated
- THEN the forbidden operation cannot be published or executed

### Requirement: Prospective Enrollment

New bindings SHALL be prospective and historical imports/backfills SHALL remain side-effect-dark unless separately reviewed and authorized.

#### Scenario: WS-RQ-020 supported behavior

- GIVEN legacy contribution history is imported
- WHEN a donor welcome workflow is active
- THEN historical records do not trigger outward welcomes automatically

### Requirement: Scheduling Semantics

Timers SHALL preserve timezone, time interpretation and calendar policy. Pause, expiry, late evidence and catch-up MUST have explicit nonapproval behavior. Generic Studio defaults MUST apply only to eligible Studio-owned clocks. CMS D13 appointments, Support response targets, recurring/pledge reminders and report delivery MUST keep exact source rules; organizational CMS authorization MUST NOT be generalized to Studio NHI lifetime.

#### Scenario: WS-RQ-021 supported behavior

- GIVEN a run pauses with a relative reminder and fixed document expiry
- WHEN time passes
- THEN the relative clock pauses where allowed while fixed expiry follows its source rule

### Requirement: Simulation

Simulation SHALL use the real evaluator with stored synthetic fixtures and no live side effects, provider credentials, real destinations, business intents or history. Separately authorized source previews MUST NOT authorize a live simulation effect.

#### Scenario: WS-RQ-022 supported behavior

- GIVEN a draft is tested
- WHEN its message and access nodes execute in simulation
- THEN only simulated outcomes occur and no provider credentials or live recipients are used

### Requirement: Accessible Editing

The complete authoring and participant experience SHALL target WCAG 2.2 AA and include a usable keyboard/outline alternative to the canvas.

#### Scenario: WS-RQ-023 supported behavior

- GIVEN staff uses only keyboard and assistive technology
- WHEN they configure, validate and publish a permitted rule
- THEN all required actions and errors are usable without dragging nodes

### Requirement: Safe Concurrency

Concurrent edits and source completions SHALL be serialized through revision checks and unique source effects, not last-writer overwrite.

#### Scenario: WS-RQ-024 supported behavior

- GIVEN two source completions reach one join simultaneously
- WHEN both attempt to advance the run
- THEN one accepted transition preserves both evidence facts

### Requirement: Controlled Rollout and Recovery

Disabling optional enrollment or losing the executor SHALL preserve valid source records, durable accepted work and manual recovery.

#### Scenario: WS-RQ-025 supported behavior

- GIVEN Inngest becomes unavailable
- WHEN a source event is durably accepted
- THEN work remains recoverable and essential source operations do not depend on a custom template

### Requirement: Source Ready Catalog

Each capability pack SHALL activate only when its source commands, privacy projections and providers are qualified.

#### Scenario: WS-RQ-026 supported behavior

- GIVEN automated signing lacks a certified source adapter
- WHEN a tenant attempts activation
- THEN the lane stays unavailable and any valid manual evidence path is labeled honestly

### Requirement: Template Portability

Exported templates SHALL contain no live credentials, person/run data or executable scripts; imports SHALL be inert drafts requiring tenant rebinding.

#### Scenario: WS-RQ-027 supported behavior

- GIVEN a portable template is imported
- WHEN its foreign source references are inspected
- THEN unsafe content is rejected and valid content cannot execute before binding and publication

### Requirement: Contract Upgrade Compatibility

Runtime deployments SHALL preserve compatible source action behavior for active publications or require controlled migration.

#### Scenario: WS-RQ-028 supported behavior

- GIVEN an action implementation changes incompatibly
- WHEN an old run advances
- THEN it uses a supported compatible contract or stops safely for migration

### Requirement: Restore and Retention Safety

Restore and disposal processes SHALL preserve source authority, revocations and necessary lawful dedupe evidence; restore MUST NOT reactivate outward effects blindly.

#### Scenario: WS-RQ-029 supported behavior

- GIVEN a backup predates a confirmed send and revoked grant
- WHEN the system restores
- THEN dispatch remains contained until effects and permissions reconcile

### Requirement: AI Has No Additional Authority

AI assistance SHALL remain subject to the same catalog, data purposes, validation, simulation and human publication rules.

#### Scenario: WS-RQ-030 supported behavior

- GIVEN an assistant proposes a workflow requiring forbidden data or action
- WHEN the proposal is checked
- THEN normal authority checks reject it and no privileged effect occurs

### Requirement: Independent Core And Source Pack Completion

The system MUST qualify Phase 34 CORE using real non-mobilization intake/shared-task and private-document/review sources with Phases 35, 37, 38, 41 and 42 unavailable. All 96 recipes and 352 specified scenarios MUST remain accounted for under their source checkpoints. FULL MUST be an evidence rollup and MUST NOT gate CORE.

#### Scenario: IG-AT-01

- **GIVEN** Downstream packs are unavailable
- **WHEN** CORE acceptance runs
- **THEN** The real common tracers qualify independently and missing source-pack/FULL evidence stays visibly incomplete

### Requirement: Live Human Owner Revocation

The system MUST fence future affected Studio operations when the NHI human owner loses capability or leaves. Re-publication and transfer labels MUST NOT restore authority without current owner revalidation. A separately source-authorized CMS D13 organizational appointment MUST preserve its own lifetime.

#### Scenario: IG-AT-02

- **GIVEN** A Studio operation is published but not yet admitted by its source
- **WHEN** The accountable human owner loses the needed capability
- **THEN** The operation does not execute; an independently valid D13 organizational appointment is judged only by its source contract

### Requirement: Durable Wait Reconciliation

Source completion MUST remain discoverable before or after wait registration and after a lost wake. A timeout MUST NOT manufacture approval.

#### Scenario: IG-AT-03

- **GIVEN** Source evidence completes before registration, after registration or with a lost wake
- **WHEN** The common wait protocol reconciles
- **THEN** Source recheck finds the exact accepted outcome without demanding duplicate submission

### Requirement: Cross Caller Semantic Effects

The effect-owning domain MUST deduplicate the same semantic effect across native callers, workflows, retries and publications permanently within lawful retention. Conflicting payloads and uncertainty MUST remain explicit.

#### Scenario: IG-AT-04

- **GIVEN** Native and Studio callers replay one event beyond a provider deduplication window
- **WHEN** They request the same intended acknowledgment
- **THEN** One semantic effect survives and uncertain execution is not blindly retried

### Requirement: Critical Source Work Survives Optional Overload

Optional workflow limits MUST NOT discard accepted source work or delay required channel withdrawal or identity deactivation.

#### Scenario: IG-AT-05

- **GIVEN** Optional workflows exceed their capacity profile
- **WHEN** An accepted source event or qualified withdrawal/deactivation reaches its owner
- **THEN** Critical accepted work remains durable and independently actionable

### Requirement: Batching Requires Exact Tenant Qualification

If batching is adopted, the executor MUST prove tenant-homogeneous grouping and its exact supported concurrency, cancellation and idempotency configuration; batching MUST NOT infer every item’s scope from the first item.

#### Scenario: IG-AT-06

- **GIVEN** An execution batch would contain different tenants or incompatible cancellation scopes
- **WHEN** The batching contract is checked
- **THEN** Unsafe grouping is rejected before execution; absent batching does not remove ordinary tenant isolation

### Requirement: Source Authorization Lifetimes Remain Distinct

Directory offboarding MUST reach Phase 12 directly. Optional workflow handoff MUST NOT delay revocation, while a still-valid D13 organization-owned appointment MUST retain only its specifically authorized behavior.

#### Scenario: IG-AT-11

- **GIVEN** A qualified source offboarding occurs
- **WHEN** Native permission revocation propagates
- **THEN** Human-owner-dependent Studio work stops and other source jobs retain only their own valid authorization

### Requirement: Reference Assets Are Inert Until Bound

Reference imports MUST remain disabled and unresolved until each exact owner, scope, version, current permission, privacy and evidence contract qualifies. Structural validation MUST NOT count as adapter certification.

#### Scenario: IG-AT-12

- **GIVEN** A reference blueprint contains only symbolic bindings
- **WHEN** The template is restored or imported
- **THEN** It remains an inert draft until all exact source and tenant gates pass
