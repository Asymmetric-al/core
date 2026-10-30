# Spec Delta

## Purpose

Defines how Core reports third-party UI audit results and how it enforces
accessibility, so real defects block regressions without score bookkeeping.

## ADDED Requirements

### Requirement: UI Audit Scores Are Advisory

Core SHALL run the exactly locked UI audit scanner once per CI event in a
non-required job and publish its results for review. Its scores and findings
SHALL NOT fail a commit, a push, the local CI preflight or any required CI
check, and SHALL NOT impose score floors or score targets.

#### Scenario: A change lowers an application's score

- **WHEN** a pull request's scan reports a lower score or a new failing rule
- **THEN** the job summary and one updated pull request comment show each application's raw overall and category scores and its failing rules
- **AND** no required check fails because of a score or finding

#### Scenario: A developer commits or pushes locally

- **WHEN** the pre-commit hook or the local CI preflight runs
- **THEN** no UI audit scan is executed
- **AND** commit and push time does not depend on how long a workspace scan takes

#### Scenario: The scan cannot complete

- **WHEN** the scanner errors, times out or returns a report the published contract cannot read
- **THEN** the report states that audit evidence is unavailable
- **AND** no score is presented as current or passing
- **AND** required checks are unaffected

### Requirement: UI Audit Findings Are Triaged By Review

Reported findings SHALL be triaged by a reviewer instead of being recorded in
a hashed per-finding ledger. A confirmed defect SHALL be repaired at its owning
component with a behavior test or tracked as an issue. Scanner limitations and
accepted product decisions SHALL need no repository record.

#### Scenario: An unrelated change is committed

- **WHEN** a change updates dependencies, formatting, documentation or tooling without changing UI behavior
- **THEN** no audit ledger, proof hash or score floor requires an update

#### Scenario: A finding is confirmed as a defect

- **WHEN** a reviewer confirms that a reported finding is a real defect
- **THEN** the repair lands at the owning shared or application component with a focused behavior test
- **OR** a tracked issue records the defect for later repair

#### Scenario: A finding conflicts with an accepted product decision

- **WHEN** a finding asks for behavior that accepted product policy rejects, such as a theme shortcut under the forced-light policy
- **THEN** no code is changed solely to raise the score
- **AND** the product policy remains authoritative

### Requirement: First-Party UI Lint Enforces Accessibility Rules

Lint for first-party web UI SHALL enforce a standard JSX accessibility rule set.
It SHALL cover alternative text, anchor content and validity, label association,
keyboard access for interactive handlers, semantic roles, valid ARIA and focus
order. A violation SHALL fail local lint and the required CI lint check.

#### Scenario: A non-interactive element gains a click handler

- **WHEN** first-party code adds a click handler to a non-interactive element without keyboard support or a semantic role
- **THEN** lint fails and names the file, line and rule
- **AND** the required CI lint check fails for the same violation

#### Scenario: An image is added without alternative text

- **WHEN** first-party code renders an image element without alternative text
- **THEN** lint fails and names the file, line and rule

### Requirement: Shared Components Are Linted With Native Semantics

When first-party code uses a shared UI component that renders a native control,
image or link, accessibility lint SHALL apply the rules for that native element.
A shared wrapper SHALL NOT hide a violation that the native element would report.

#### Scenario: A shared component wraps a native element

- **WHEN** first-party code uses a shared component that renders a native button, link, image, input or label
- **THEN** accessibility lint evaluates that usage as the native element
- **AND** a violation the native element would report is reported for the shared component usage

### Requirement: Existing Accessibility Debt Can Only Shrink

Accessibility lint violations present when enforcement is adopted SHALL be
recorded as file-scoped and rule-scoped counts that can only decrease. A new
violation SHALL fail lint even in a file with recorded debt. Recorded debt
SHALL NOT be widened to accept new violations.

#### Scenario: A new violation lands in a file with recorded debt

- **WHEN** a change adds a violation of a rule that already has recorded debt in that file
- **THEN** lint fails because the recorded count is exceeded

#### Scenario: Recorded debt is repaired

- **WHEN** a change removes a recorded violation
- **THEN** the recorded count can be pruned to the lower value
- **AND** no other file or rule gains recorded debt

### Requirement: Rendered And Behavioral Accessibility Evidence Is Retained

Retiring audit score gates SHALL NOT remove rendered accessibility checks or
behavior tests. Existing axe checks SHALL keep their coverage and blocking
behavior. Tests written as audit proof SHALL keep their assertions as ordinary
regression tests.

#### Scenario: The audit gate tooling is removed

- **WHEN** the score gate, floors and ledger are retired
- **THEN** every behavioral, browser and axe test that served as audit proof still runs in its suite with unchanged assertions
- **AND** only tests that verify the retired gate mechanics are removed

#### Scenario: A rendered accessibility check fails

- **WHEN** an existing axe check finds a violation at its configured severity
- **THEN** the CI check that runs it fails exactly as it did before this change
