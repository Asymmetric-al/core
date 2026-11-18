## Purpose

Decide where and how often CI runs each kind of test and verifier, so every
test that guards `develop` still runs on the path to it while pull requests
stop paying for duplicate or provably unaffected work.

## ADDED Requirements

### Requirement: Acceptance tests run once per CI run

The acceptance directory SHALL run in the dedicated, fork-safe acceptance job
and SHALL NOT run again in the unit-test job. The acceptance job SHALL fail
when no acceptance test executes. A unit-test invocation whose arguments
explicitly target acceptance files SHALL still run them.

#### Scenario: A pull request runs the unit and acceptance jobs

- **WHEN** CI runs the unit-test job and the acceptance job for one commit
- **THEN** each acceptance test file runs in the acceptance job only
- **AND** an acceptance failure turns exactly one job red

#### Scenario: Someone runs an acceptance file through the unit runner

- **WHEN** a person or agent runs the unit-test command with an argument that
  names an acceptance file or the acceptance directory
- **THEN** the named acceptance tests run

#### Scenario: The acceptance job collects nothing

- **WHEN** the acceptance job collects no files or executes no test
- **THEN** the job fails

### Requirement: Pull requests skip only provably unaffected test groups

On a pull request the unit-test job SHALL skip a scoped group's tests only
when the change set is known and touches none of the group's inputs, and
SHALL skip only the tests whose imports and repository reads it can show stay
inside those inputs. The job SHALL log what it skipped, what it kept and why.

#### Scenario: A pull request does not touch the factory

- **WHEN** a same-repository pull request changes only files outside the
  factory group's inputs and outside the full-run triggers
- **THEN** the unit-test job skips the factory group and runs every other test
- **AND** the job log names the skipped group and why it was skipped

#### Scenario: A pull request touches a group input

- **WHEN** any changed file matches a scoped group's inputs or one of its
  test files
- **THEN** that group runs

#### Scenario: A test in a scoped group reaches outside the group's inputs

- **WHEN** a test in a scoped group, or a module it imports, imports a module
  or reads a repository path outside the group's declared inputs
- **THEN** that test runs on every pull request
- **AND** the job log names the test and the path that kept it in the run

### Requirement: Test selection fails safe

The unit-test job SHALL run every test whenever the selection cannot be sure
a skip is safe: on any event other than a pull request, on pushes to
`develop`, on `merge_group`, when the base or head is missing or invalid, when
the history is shallow, when the diff fails or is empty, or when a full-run
trigger changes.

#### Scenario: A push to develop or a merge-group run

- **WHEN** the unit-test job runs for a push to `develop`, a `merge_group`
  event or a manual dispatch
- **THEN** every unit test runs

#### Scenario: The change set cannot be computed

- **WHEN** the base or head commit is missing or malformed, the checkout is
  shallow, or `git diff` fails or returns no files
- **THEN** every unit test runs and the log says why

#### Scenario: The selection or its environment changes

- **WHEN** a pull request changes the selection logic, the unit-test runner,
  the Vitest configuration or setup files, the root manifests or lockfile, a
  TypeScript base configuration, or the CI workflow
- **THEN** every unit test runs

### Requirement: Required integration checks run in parallel where independent

The required browser smoke job SHALL start without waiting for the dev-server
boot check, because it applies its own migrations and seed and starts its own
servers. Required check names SHALL NOT change and no required job SHALL be
removed. The browser smoke gate SHALL keep failing closed and blaming the
first non-success in dependency order.

#### Scenario: A pull request runs CI Integration

- **WHEN** CI Integration runs for a same-repository pull request
- **THEN** the browser smoke job starts alongside `migrate`
- **AND** `smoke` still waits for `migrate`
- **AND** `e2e-smoke-gate` still needs and reads `migrate`, `smoke` and the
  browser smoke job

#### Scenario: Migrations are broken

- **WHEN** `migrate` fails
- **THEN** `e2e-smoke-gate` fails and reports `migrate` as the root cause even
  if the browser smoke job also failed

### Requirement: CI enforces the design-system configuration

The required lint job SHALL run the design-system configuration verifier, so
the exact `base-maia` configuration is enforced on every pull request and
push, not only by a local hook that can be skipped.

#### Scenario: A pull request changes the shared UI configuration

- **WHEN** a pull request breaks the design-system configuration
- **THEN** the lint job fails and `ci-gate` fails

### Requirement: Failed CI builds print prerender diagnostics

When a requested CI build fails, CI SHALL rebuild the failing app once with
Next.js prerender debugging so its log shows unminified errors for every
failing route. The diagnostic build SHALL run only after a failure, only in
GitHub CI, and SHALL never be the build command a deployment uses.

#### Scenario: A requested app build fails in CI

- **WHEN** the CI build job fails while compiling an app
- **THEN** a failure-only step rebuilds that app with prerender debugging
- **AND** the build job still fails

#### Scenario: A build succeeds or runs on Vercel

- **WHEN** the CI build succeeds, or Vercel runs the app's build command
- **THEN** no build uses prerender debugging
