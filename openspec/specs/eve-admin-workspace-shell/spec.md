# eve-admin-workspace-shell Specification

## Purpose

Define the operations-first Mission Control workspace that lets authorized
administrators inspect Eve's real, app-owned governance state before using the
separately mounted chat runtime.

## Requirements

### Requirement: The Eve Admin Workspace Is Operations-First

Mission Control's Eve workspace MUST put operational visibility before chat.
Its first surface MUST enumerate active and recent runs, approvals, recent
actions, budgets, failures, GitHub activity, eval health, memory, model policy,
subagents, notifications, audit, retention, and emergency controls. Chat MAY be
available only as a secondary surface.

#### Scenario: An operator opens the workspace before chat is mounted

- **WHEN** an authorized operator opens the Eve workspace
- **THEN** the operations panel index is first in reading and keyboard order
- **AND** the operator can navigate every required governance surface without starting chat

### Requirement: Live Panels Use Real App-Owned Governance State

Every live workspace panel MUST read the app-owned governance state owned by
#418 through #424. Runs, failures, approvals, actions, budgets, audit, evals,
memory, model policy, subagents, and retention MUST NOT use mock records. A
capability whose live path has not landed MUST be labeled unavailable and MUST
NOT present invented empty-success, activity, or health state.

#### Scenario: A live governance panel loads

- **WHEN** the workspace renders a live operational panel
- **THEN** its values come from the owning app API and persisted governance state
- **AND** no mock record is rendered as real state

#### Scenario: A future connection has no data path

- **WHEN** GitHub, notification delivery, or chat has not yet landed
- **THEN** the workspace labels that connection unavailable and names its owning slice
- **AND** it does not fabricate events, delivery health, or runtime state

### Requirement: The Workspace Exposes Decision Summaries, Not Hidden Reasoning

The workspace MUST expose redacted decision summaries and bounded governance
metadata. It MUST NOT expose raw prompts, hidden model reasoning, secrets,
donor or payment data, raw records, table rows, or sensitive form values.

#### Scenario: An operator investigates an action or failure

- **WHEN** the operator opens its audit or failure summary
- **THEN** the workspace shows the action, result, evidence summary, risk, policy, and follow-up data available in the redacted record
- **AND** no hidden reasoning or sensitive record payload is rendered

### Requirement: Workspace Access And Controls Are Server Role-Gated

Workspace access MUST be checked server-side against verified current-session
role context. Privileged mutations MUST be authorized again in their API
boundaries. Model-policy changes MUST retain the dedicated
`ai.settings.manage` permission. Client visibility MUST NOT be an authorization
mechanism.

#### Scenario: An unauthorized role requests the workspace

- **WHEN** a verified user without an authorized admin role requests `/admin/eve`
- **THEN** the server redirects the user to the no-access surface
- **AND** the Client Component and controls are not rendered as an authority boundary

#### Scenario: A general admin lacks AI settings permission

- **WHEN** the admin attempts a model-policy mutation
- **THEN** the API denies it unless `ai.settings.manage` or super-admin authority is present
- **AND** read access does not imply mutation access

### Requirement: Failures, Eval Health, And Subagents Reflect Persisted Policy State

Failure summaries MUST be derived from persisted failed run or audit results.
Eval health and subagent policy MUST be derived from the versioned model-policy
view. Missing state MUST be reported as not ready or unconfigured rather than
healthy.

#### Scenario: A governed run fails

- **WHEN** the workspace receives a persisted failed run or audit result
- **THEN** it lists the bounded failure summary and timestamp
- **AND** it does not fetch or display the underlying raw operational record

#### Scenario: No active eval-passed policy exists

- **WHEN** eval health and subagent status render
- **THEN** the workspace reports model policy as not ready and shows no active subagent overrides
- **AND** it does not infer health from a draft or absent policy

### Requirement: The Shell Surfaces Existing Policy Without Redefining Or Enabling It

The shell MUST surface and invoke the governance, kill-switch, model-policy,
memory, approval/budget, audit, and retention behaviors owned by #418 through
#424 without redefining them. It MUST NOT add a live model/provider,
operational tool, Eve HTTP mount, deployment, or release transition. The master
release switch MUST remain disabled until final launch verification.

#### Scenario: The workspace implementation is reviewed for authority

- **WHEN** a reviewer inspects the #427 change
- **THEN** it contains only workspace access, presentation, existing governed controls, tests, and durable documentation
- **AND** #417 protections, #418 emergency precedence, #426 identity, #428 runtime mounting, and #437 release verification remain authoritative
