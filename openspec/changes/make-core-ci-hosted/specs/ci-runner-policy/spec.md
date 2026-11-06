# CI Runner Policy

## Purpose

Keep Core verification independent of local runner availability while preserving
truthful required checks and explicit workflow security boundaries.

## ADDED Requirements

### Requirement: Routine verification has no local runner dependency

Core SHALL run its existing seven build, unit, migration, smoke and browser
jobs on standard GitHub-hosted Ubuntu VMs without consulting Proxmox or a
repository variable. Runner placement SHALL preserve existing job inventory,
event coverage, conditions, dependencies, tested refs and verification workload.

#### Scenario: Proxmox is busy or offline

- **WHEN** a supported CI event schedules an eligible job
- **THEN** it uses GitHub-hosted execution without a local-capacity check,
  reservation, startup wait, cancellation or manual intervention
- **AND** normally running jobs retain their existing execution limits and PR
  supersession policy, including jobs lasting longer than five minutes

#### Scenario: The old fallback variable is absent or changed

- **WHEN** `CI_RUNNER_FALLBACK` is unset, empty, `github-hosted` in any casing,
  misspelled or unrelated
- **THEN** all seven jobs retain the same hosted placement
- **AND** the variable remains available for older workflow revisions

### Requirement: Hosted placement preserves truthful verification

Core SHALL preserve all existing correctness, integration, security and release
gates. Requested compilation failures and missing or invalid planning data SHALL
fail the CI gate. Only a successful explicit no-compilation plan with successful
correctness inputs SHALL permit the existing build-skip path.

#### Scenario: An upstream integration job does not succeed

- **WHEN** migrate, smoke or the required browser smoke job fails, is canceled,
  unexpectedly skips or omits required results
- **THEN** the corresponding summaries fail closed and retain upstream
  root-cause reporting

#### Scenario: Production or stacked-PR verification is selected

- **WHEN** existing conditions select blocking E2E or production navigation
- **THEN** the existing production build and real browser workload run
- **AND** develop-only informational behavior and merge-group exclusions remain
  limited to their existing contexts

### Requirement: Self-hosted reachability requires an explicit policy amendment

The approved self-hosted-reachable workflow set SHALL be explicitly empty.
Conservative discovery SHALL reject unauthorized labels, expressions, groups,
matrix selection and reusable-workflow reachability. R2 trigger restrictions and
R3 privileged-trigger hygiene SHALL remain enforced. Hosted placement SHALL NOT
relax fork rejection, same-repository guards or least-privilege credentials.

#### Scenario: A workflow introduces local or indirect runner placement

- **WHEN** a new or existing workflow can reach self-hosted execution directly
  or through a local or remote reusable call
- **THEN** the repository guard rejects it without an approved policy amendment
- **AND** explicit seven-job inventory checks prevent an empty reachability set
  from making verification vacuous

#### Scenario: A fork or privileged trigger seeks execution access

- **WHEN** workflow changes remove a same-repository guard, fork rejection or
  privileged-trigger restriction
- **THEN** the existing security mutation contracts reject the change
- **AND** release-source-gate remains hosted, read-only and checkout-free
