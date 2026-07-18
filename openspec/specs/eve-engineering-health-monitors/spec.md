# eve-engineering-health-monitors Specification

## Purpose

TBD - created by archiving change add-eve-engineering-health-monitors. Update Purpose after archive.

## Requirements

### Requirement: The First Active Monitor Set Is An Exact Allowlist

Eve MUST allow only these active v1 engineering-health monitor types: CI failures, stale pull requests,
failing evals, dependency/security alerts, protected-area pull requests, and budget/rate-limit issues. Product
opportunity scanning and every unlisted type MUST remain disabled and MUST fail closed until a separately
reviewed capability enables it. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: An approved engineering monitor runs

- **GIVEN** the CI-failure monitor is enabled in app-owned configuration and governance permits the run
- **WHEN** its schedule or allowed event fires
- **THEN** it may collect only the configured CI-failure evidence
- **AND** the run remains subject to budget, pause, identity, and audit controls

#### Scenario: Product-opportunity scanning is requested

- **GIVEN** a prompt, model, issue, or external event asks Eve to scan for product opportunities
- **WHEN** the monitor registry resolves the requested type
- **THEN** it rejects the request because the type is not in the active allowlist
- **AND** no product or customer data is scanned

### Requirement: Monitor Configuration And Scope Are App-Owned

Every monitor MUST use persisted app-owned configuration containing a stable id/type, enabled and pause
state, schedule/event source, threshold/window, severity rules, repository scope, dedupe window, checkpoint,
owner, and policy version. Prompt, model, issue, PR, webhook, or tool content MUST NOT enable a monitor,
broaden its repository or tenant scope, alter policy, or choose a downstream destination. Verified service or
admin identity and ownership MUST come from #426. [VERIFIED-REPO: openspec/changes/add-eve-admin-auth-session-ownership]

#### Scenario: An event attempts to broaden scope

- **GIVEN** a webhook payload names a repository or tenant outside persisted monitor scope
- **WHEN** Eve validates the event
- **THEN** it rejects cross-scope collection server-side
- **AND** audit records the safe rejection reason without trusting payload identity

#### Scenario: A disabled monitor receives an event

- **GIVEN** app-owned state disables or pauses a monitor
- **WHEN** a matching schedule or event arrives
- **THEN** collection and downstream action do not run
- **AND** the suppressed outcome is recorded as policy requires

### Requirement: Findings Use Safe Fresh Evidence And Stable Dedupe

Each finding MUST include monitor/run identity, signal type, target identity, first/last observed timestamps,
severity, lifecycle status, stable dedupe key, policy version, safe evidence references, and a decision summary.
Collectors MUST validate source freshness and target revision and MUST reject malformed or stale evidence.
Repeat observations inside the dedupe policy MUST update the existing finding rather than create unbounded
duplicate work. Findings MUST NOT contain secrets, raw production records, donor/payment details, or hidden
reasoning. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: The same failure is observed repeatedly

- **GIVEN** repeated runs observe the same CI check failure for the same target revision
- **WHEN** the dedupe key and window match an open finding
- **THEN** Eve updates last-observed state instead of creating a duplicate finding/action
- **AND** the update remains auditable

#### Scenario: Evidence targets an outdated revision

- **GIVEN** a PR now points to a newer head revision than the collected protected-area evidence
- **WHEN** the monitor validates freshness
- **THEN** it does not publish the stale result as current
- **AND** it recollects or marks the finding stale according to policy

### Requirement: Every Approved Signal Has Minimum Evidence

The six monitor types MUST collect only their required minimum evidence: CI identity/conclusion/target; stale-PR
last activity and configured threshold; eval suite/case/revision/status; dependency/security source/advisory/
severity/affected scope; protected-area PR/revision/matched policy; and budget/rate-limit scope/window/status.
Classification rules SHOULD be deterministic before any judge-backed evaluation, and safe source references
MUST remain available for review. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: A stale PR has a documented blocker

- **GIVEN** a PR exceeds the age threshold but persisted review state marks it intentionally blocked
- **WHEN** the stale-PR rule classifies it
- **THEN** the configured blocked-state rule determines whether to suppress or lower severity
- **AND** a model does not invent a different threshold

#### Scenario: A protected-area match is detected

- **GIVEN** the current PR revision matches a persisted #417 protected-area rule
- **WHEN** the protected-area monitor creates or updates a finding
- **THEN** it records the matched rule class and policy version as safe evidence
- **AND** the finding grants no permission to change that area

### Requirement: Comments And Issues Reuse Governed GitHub Capabilities

Every monitor comment request MUST use the #430 GitHub read/review path, and every durable
issue/work-initiation request MUST use #431. The downstream capability MUST independently
enforce accountable bot identity, verified initiator/service identity, current policy, approvals, protected-
area rules, budgets, rate limits, and audit. #435 MUST NOT introduce a separate comment or issue mutation path.
[VERIFIED-REPO: openspec/changes/add-eve-github-read-review-path]
[VERIFIED-REPO: openspec/changes/add-eve-autonomous-pr-operator]

#### Scenario: Policy allows a deduplicated PR comment

- **GIVEN** a current finding targets an existing PR and the #430 policy permits a comment
- **WHEN** the monitor requests the downstream operation
- **THEN** #430 posts with accountable bot metadata and audit
- **AND** the finding records the downstream outcome without owning the mutation

#### Scenario: A monitor wants a new durable issue

- **GIVEN** policy calls for a new issue rather than an existing-PR comment
- **WHEN** the monitor requests work initiation
- **THEN** only #431 may create the issue after its independent gates pass
- **AND** denial, pause, or success is linked back to the finding and audited

### Requirement: Background Monitoring Is Budgeted, Pausable, Auditable, And Visible

Before every run and every downstream request, Eve MUST consult #418 release/emergency state and #420 relevant
pause/kill-switch state; release-off or emergency-off MUST suppress even an otherwise enabled monitor. Every
collection, classification, judge call, and downstream request MUST consume #423 budgets/rate limits and emit
#419 audit records for due/suppressed runs, evidence outcome, finding lifecycle, dedupe, policy decision, and
downstream result. #425 MUST remain the owner of schedule/runtime durability, while #424 owns retention and
redacted replay for persisted findings/audit metadata. #427 MUST be able to display safe monitor health,
last-run state, findings, failures, budget state, and pause state without raw hidden reasoning.
[VERIFIED-REPO: openspec/changes/add-eve-approval-budget-policy]
[VERIFIED-REPO: openspec/changes/add-eve-admin-workspace-shell]

#### Scenario: Monitor budget is exhausted

- **GIVEN** the applicable hard budget or rate limit is exhausted
- **WHEN** a monitor becomes due
- **THEN** the run or expensive step is paused/denied according to #423
- **AND** Eve does not self-grant an override

#### Scenario: Release or emergency state turns off

- **GIVEN** an enabled monitor is due or has produced a finding but #418 is release-off or emergency-off
- **WHEN** Eve checks state before the run or before a downstream comment/issue request
- **THEN** collection or the downstream request is suppressed
- **AND** the enabled flag cannot override the higher-priority stop state

#### Scenario: An operator inspects monitor state

- **GIVEN** an authorized admin opens the #427 operations workspace
- **WHEN** monitor status is displayed
- **THEN** it shows safe state, evidence references, failures, budget, and pause controls
- **AND** it does not reveal secrets, raw protected content, or hidden model reasoning

### Requirement: Monitor Runtime Ships Off By Default And Grants No New Authority

The monitor runtime and persisted registry MUST ship disabled and paused, MUST keep the #418 release switch
off, and MUST NOT activate a monitor, add a product scan, expose credentials, or create an ungoverned GitHub
mutation path. Existing governance remains authoritative. [VERIFIED-REPO: openspec/project.md]

#### Scenario: The package is reviewed for scope

- **GIVEN** this change is under review
- **WHEN** repository effects are inspected
- **THEN** the exact registry, scheduler adapter, collectors, safe finding store, admin visibility, and tests are present
- **AND** all six monitors and every downstream destination remain disabled and paused
