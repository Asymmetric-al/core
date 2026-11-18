# Spec Delta

## Purpose

Defines how Core runs and reports quality audits of its first-party UI and
React source, so real defects are found and fixed without bookkeeping that
unrelated changes must maintain.

## ADDED Requirements

### Requirement: React Source Audits Report Without An Acceptance Target

Core SHALL provide an on-demand local React source audit that runs the exactly
pinned scanner over every first-party React application and workspace package
target. A completed audit SHALL report every applicable finding and SHALL
succeed whatever the number of findings. No commit, push, local CI preflight
or CI check SHALL run the audit or depend on its result.

#### Scenario: A completed audit reports findings

- **WHEN** a developer runs the React source audit and every target scans completely
- **THEN** the audit exits successfully, even when it reports findings
- **AND** its report gives the number of findings per target and per rule, and each finding's file, line, rule and message

#### Scenario: A developer commits, pushes or opens a pull request

- **WHEN** the pre-commit hook, the pre-push hook, the local CI preflight or any CI check runs
- **THEN** no React source audit runs
- **AND** no React source audit result decides whether that step passes

#### Scenario: The scan cannot complete

- **WHEN** the scanner errors, times out, skips applicable checks, returns a report the supported contract cannot read, or the audited source changes during the run
- **THEN** the audit exits non-zero and states that audit evidence is unavailable
- **AND** no partial report is presented as complete

### Requirement: React Source Audit Reports Can Focus On A Change

The React source audit SHALL accept a base revision and then list only the
findings in files that changed since that revision, while still reporting the
total findings for every target.

#### Scenario: An author reviews the findings in their own change

- **WHEN** a developer runs the audit with a base revision their branch descends from
- **THEN** the listed findings are only those in files added or modified since that revision
- **AND** the report still gives the total findings for every target

#### Scenario: The base revision cannot be resolved

- **WHEN** the given base revision does not exist in the repository
- **THEN** the audit exits non-zero and names the revision it could not resolve
- **AND** it does not present an unfiltered or empty listing as the change's findings

### Requirement: React Source Audit Findings Are Triaged Without A Hashed Ledger

React source audit findings SHALL be triaged by review instead of being recorded
in a per-finding ledger bound to file hashes. A confirmed defect SHALL be
repaired at its owner with a behavior test or tracked as an issue. A false
positive or accepted pattern SHALL need no repository record, and SHALL NOT be
hidden by narrowing the applicable rule profile.

#### Scenario: An unrelated change is made

- **WHEN** a change updates dependencies, styles, formatting, documentation or tooling
- **THEN** no React source audit record, exception or hash needs an update

#### Scenario: A reviewer confirms a defect

- **WHEN** a reviewer confirms that a reported finding is a real defect
- **THEN** the repair lands at the owning application or shared component with a focused behavior test
- **OR** a tracked issue records the defect for later repair

#### Scenario: A reviewer judges a finding a false positive

- **WHEN** a reviewer judges a finding a scanner false positive or an accepted pattern
- **THEN** no exception record is added for it
- **AND** the rule stays enabled, so the finding keeps appearing in later reports
