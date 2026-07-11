# Delta for Eve Audit Tracer

## ADDED Requirements

### Requirement: Every Meaningful Eve Action Produces A Rich Audit Record

Every meaningful Eve action MUST produce a rich audit record sufficient to reconstruct who or what
initiated the action, which tool or subagent ran, which model role was used, which policy applied, what
evidence was used, and what changed. The record MUST capture at least: actor, initiator, identity mode,
policy, action, target, result, model-role placeholder, and evidence summary. The record MUST be written as
app-owned governance data, not derived from or overridable by prompt, model output, or tool input.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

#### Scenario: A safe Eve-like action is audited end-to-end

- GIVEN one safe, non-autonomous Eve-like action runs behind the governance kernel
- WHEN it completes
- THEN an audit record is written capturing actor, initiator, identity mode, policy, action, target, result,
  model-role placeholder, and evidence summary
- AND the record is sufficient to reconstruct who/what initiated it, which tool or subagent ran, which model
  role and policy applied, what evidence was used, and what changed

#### Scenario: A prompt tries to forge the audit record

- GIVEN a prompt, model output, or tool response asserts a different actor, policy, or result
- WHEN the audit record is written
- THEN the record uses only verified app-owned context for each field, never the claim
- AND the forged values do not appear in the record

### Requirement: Audit Records Capture Accountable Identity From Verified Context

The audit record MUST capture accountable identity from verified context, never from prompt or tool input:
admin actions MUST be recorded under the acting admin's identity; background jobs MUST be recorded under a
service identity with explicit initiator metadata; and GitHub actions MUST record the bot actor together with
the accountable human or trigger. The recorded identity mode MUST match the identity resolved by the #417
auth boundary and MUST NOT be selectable by prompt or tool input.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: An admin action is audited under the admin identity

- GIVEN an admin initiates an Eve product action from Mission Control
- WHEN the action is audited
- THEN the record's actor and identity mode reflect the admin's verified identity, tenant, and role
- AND the organization can tell who initiated the operation

#### Scenario: A background job is audited under service identity

- GIVEN a scheduled or system Eve job runs with no interactive admin
- WHEN the action is audited
- THEN the record uses the service identity and carries explicit initiator metadata
- AND the work remains accountable to the initiating trigger

#### Scenario: A GitHub action records the accountable human or trigger

- GIVEN Eve performs a GitHub action through its bot actor
- WHEN the action is audited
- THEN the record captures the bot actor and the accountable human or trigger behind it
- AND the GitHub automation is auditable to a responsible initiator

### Requirement: Redacted Replay And Debug Packages Never Store Unsafe Raw Data

Eve MUST be able to produce a redacted replay/debug package for a failed or reviewable action so failures can
be investigated without storing unsafe raw data. The package MUST carry metadata and a redacted evidence
summary only and MUST NEVER contain payment data, secrets, one-time codes, tenant PII, or raw model
reasoning. The redaction rules MUST be represented in tests. This change defines the package's redacted
**shape**; its retention, expiry, and holds are governed separately (#424).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

#### Scenario: A debug package is built for a failed action

- GIVEN an Eve action fails and a debug package is requested
- WHEN the package is assembled
- THEN it contains redacted metadata and an evidence summary sufficient to investigate the failure
- AND it contains no payment data, secrets, one-time codes, tenant PII, or raw model reasoning

#### Scenario: A test asserts the redaction rules

- GIVEN unsafe raw values (secrets, payment fields, PII, raw model reasoning) are present in an action's
  context
- WHEN the redaction rules run while building the audit record and debug package
- THEN the test observes those values are redacted or excluded from the stored artifacts
- AND the redaction behavior is asserted, not assumed

### Requirement: Admin Can Inspect Audit History And A High-Quality Decision Summary

An authorized admin MUST be able to inspect audit history and, for a given action, a high-quality decision
summary that explains why Eve acted — instead of raw model reasoning. The summary MUST NOT expose hidden
model reasoning or sensitive internals. The audit history view MUST use the same recorded identity and
redaction rules and MUST NOT reveal data the redaction rules exclude.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: An admin reviews why Eve acted

- GIVEN an authorized admin opens the audit history for an Eve action
- WHEN the admin inspects a record
- THEN the admin sees a high-quality decision summary explaining why Eve acted
- AND the summary exposes decision-relevant reasoning, not raw hidden model reasoning or sensitive internals

#### Scenario: An admin browses audit history

- GIVEN multiple audited Eve actions exist
- WHEN an authorized admin browses the audit history
- THEN each entry exposes its recorded actor, identity mode, action, target, result, and decision summary
- AND redacted fields remain redacted in the view

### Requirement: The Audit Tracer Grants No New Authority And Is Subordinate To #417 And #418

The audit tracer MUST be record-only: producing an audit record or debug package MUST NOT initiate,
authorize, or widen any autonomous action, and MUST NOT override the #417 contract or the #418 governance
gate. Audit writes MUST go to the app-owned governance store the kernel already governs; the tracer MUST NOT
introduce live autonomous behavior. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

#### Scenario: The audit path is mistaken for an action path

- GIVEN an audit record or debug package is being produced
- WHEN the system evaluates what it enables
- THEN it only records what happened and grants no new authority to act
- AND the #417 protected-area, production-write, and approval rules and the #418 disabled/emergency-off gate
  still apply unchanged

#### Scenario: The tracer change is reviewed for scope creep

- GIVEN this audit-tracer change is under review
- WHEN a reviewer checks what it adds
- THEN it introduces only the audit-record shape, the redacted replay/debug package metadata, and the
  decision-summary/inspection contract — no retention machinery and no live autonomous surface
- AND retention, expiry, and holds are deferred to #424
