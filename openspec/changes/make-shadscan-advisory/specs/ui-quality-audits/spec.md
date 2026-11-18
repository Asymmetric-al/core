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
- **THEN** the job summary shows each application's raw overall and category scores and its failing rules
- **AND** for a pull request from this repository, one updated pull request comment shows the same
- **AND** no required check fails because of a score or finding

#### Scenario: A pull request comes from a fork

- **WHEN** a pull request from a fork is scanned
- **THEN** the job summary shows the scores and failing rules
- **AND** no pull request comment is written, and no privileged workflow or write token is used to write one

#### Scenario: A developer commits or pushes locally

- **WHEN** the pre-commit hook or the local CI preflight runs
- **THEN** no UI audit scan is executed
- **AND** commit and push time does not depend on how long a workspace scan takes

#### Scenario: The scan cannot complete

- **WHEN** dependency installation fails, or the scanner errors, times out or returns a report the published contract cannot read
- **THEN** the job summary states that audit evidence is unavailable for that head commit
- **AND** for a pull request from this repository, the existing report comment is replaced with the same statement, so an earlier head's scores are no longer shown as current
- **AND** no score is presented as current or passing
- **AND** required checks are unaffected

#### Scenario: A newer push cancels the scan

- **WHEN** a newer push to a pull request cancels the run that is scanning the earlier head
- **THEN** the cancelled run publishes neither scores nor an unavailable-evidence statement
- **AND** the report comment is left for the run of the newer head

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

### Requirement: Rendered And Behavioral Accessibility Evidence Is Retained

Retiring audit score gates SHALL NOT remove rendered accessibility checks or
behavior tests. Existing axe checks SHALL keep their coverage and blocking
behavior. Tests written as audit proof SHALL keep their assertions as ordinary
regression tests.

#### Scenario: The audit gate tooling is removed

- **WHEN** the score gate, floors and ledger are retired
- **THEN** every behavioral, browser and axe test that served as audit proof still runs in its suite with unchanged assertions, including every path the retired ledger cited as proof
- **AND** only tests that verify the retired gate mechanics are removed

#### Scenario: A rendered accessibility check fails

- **WHEN** an existing axe check finds a violation at its configured severity
- **THEN** the CI check that runs it fails exactly as it did before this change
