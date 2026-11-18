# Spec Delta

## ADDED Requirements

### Requirement: Acceptance Tests Assert Behavior And Structure, Not Bytes

Acceptance and regression tests SHALL fail when behavior or a structural
invariant breaks, not when a file's bytes change. They MUST NOT hash or
fingerprint a whole file, compare a file byte for byte with a stored copy,
pin line numbers or step positions, or assert that a merged change touched
nothing else, unless the hash is itself the behavior under test. Diff scope
is checked in review.

#### Scenario: A benign edit to a CI file or its documentation

- **WHEN** a comment or an unrelated section is added to a workflow file or
  to `docs/ci.md`
- **THEN** no acceptance test fails because of that edit

#### Scenario: A hash is the behavior under test

- **WHEN** an acceptance criterion protects content that must never change,
  such as an applied migration's text, a pinned image digest, an evidence or
  provenance chain, or an accepted decision record above its amendments
- **THEN** the test may compare that content with its recorded hash
- **AND** the test says why that content must never change

#### Scenario: An acceptance author needs to protect a CI step

- **WHEN** an acceptance criterion requires a CI verification step
- **THEN** the test asserts that the step exists in the right job, is not
  `continue-on-error` or conditional, and runs the named command or files
- **AND** the step's run line holds nothing but that command and its plain
  file arguments, so nothing on it can swallow a failure
- **AND** it does not pin the step's position or the workflow's bytes

#### Scenario: An acceptance author wants to limit a change's scope

- **WHEN** an acceptance criterion says a change may touch only certain paths
- **THEN** that limit is checked in review of the pull request
- **AND** no permanent test compares the repository with a merge base

### Requirement: Required CI Checks Stay Blocking

A structural test SHALL fail when a required CI check on `develop` could pass
while the work it stands for failed. The test is a heuristic over workflow
text and modelled events, so the real-database steps of `migrate` SHALL also
be asserted directly by acceptance tests.

#### Scenario: A required job is made non-blocking

- **WHEN** a required job, or a job it needs, or one of their steps sets
  `continue-on-error` to anything but `false`
- **OR** a run script in those jobs swallows failure, such as an `||`
  fallback that does not fail, `; true` or `set +e`, outside a step that only
  runs after a failure
- **OR** one of their steps has a condition that no modelled event meets
- **OR** one of those jobs calls a reusable workflow, whose steps the test
  cannot check
- **THEN** the structural test fails and names the job

#### Scenario: A required job can be skipped

- **WHEN** `migrate` or `smoke` has a job condition that is false, or cannot
  be evaluated, for a same-repository pull request, push or merge-queue run
  on `develop` in which every job it needs succeeded
- **THEN** the structural test fails and names the job

#### Scenario: A real-database acceptance test is dropped from CI

- **WHEN** a real-database acceptance file is not run by exactly one blocking
  `migrate` step, or that step does not give it the database URL it reads
- **THEN** an acceptance test that names the file fails

#### Scenario: A gate stops gating

- **WHEN** `ci-gate` does not need, or does not read the result of, a
  `ci.yml` job that is not explicitly advisory
- **OR** `e2e-smoke-gate` stops needing `migrate`, `smoke` or `test-e2e-smoke`
- **OR** a gate job can be skipped because its condition is not `always()`
- **THEN** the structural test fails and names the gate and the job

#### Scenario: A required job id disappears

- **WHEN** `ci-gate`, `e2e-smoke-gate`, `migrate` or `smoke` is removed or
  renamed
- **THEN** the structural test fails and names the missing job

#### Scenario: An advisory job is non-blocking by design

- **WHEN** a job outside every required check's needs, such as `test-e2e` on
  `develop`, is `continue-on-error`
- **THEN** the structural test does not fail
