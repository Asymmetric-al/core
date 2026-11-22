## Purpose

Decide where and how often CI runs each kind of test and verifier, so every
test that guards `develop` still runs on every event that reaches it while
pull requests stop paying for duplicate work and wait less for the unit
tests.

## ADDED Requirements

### Requirement: Acceptance tests run once per CI run

The acceptance directory SHALL run in the dedicated, fork-safe acceptance job
and SHALL NOT run again in the unit-test job. The acceptance job SHALL fail
when no acceptance test executes. A unit-test invocation given test filters
SHALL run the files the test runner's own filter matching selects, acceptance
files included, and options SHALL NOT bring the acceptance directory back.

#### Scenario: A pull request runs the unit and acceptance jobs

- **WHEN** CI runs the unit-test job and the acceptance job for one commit
- **THEN** each acceptance test file runs in the acceptance job and not again
  in the unit-test job
- **AND** an acceptance failure does not turn the unit-test job red

#### Scenario: Real-database acceptance files

- **WHEN** CI Integration's `migrate` job runs against its migrated database
- **THEN** the real-database acceptance files still run there as well, as
  they did before this change

#### Scenario: Someone runs an acceptance file through the unit runner

- **WHEN** a person or agent runs the unit-test command with a test filter
  that the test runner matches to acceptance files, such as a path inside the
  acceptance directory, a fragment of one or a file name
- **THEN** exactly the acceptance tests the test runner matches run

#### Scenario: An option is not a filter

- **WHEN** the unit-test command is given only options, such as a test-name
  pattern or a shard, or a path after the option terminator
- **THEN** no acceptance file runs in that invocation

#### Scenario: The acceptance job collects nothing

- **WHEN** the acceptance job collects no files or executes no test
- **THEN** the job fails

### Requirement: Every unit test runs on every event, in shards

The unit-test job SHALL run every unit test file outside the acceptance
directory on every event, whatever a pull request changes. It SHALL split them
across parallel shards by the test runner's own shard assignment, so that
together the shards run each of those files exactly once. A failing shard
SHALL NOT cancel the others, and the CI gate SHALL pass only when every shard
succeeded. No required status check SHALL be renamed.

#### Scenario: A pull request changes only documents

- **WHEN** a same-repository pull request into `develop` changes only
  documentation
- **THEN** the unit-test job runs every unit test file outside the acceptance
  directory, as it does for a push to `develop` or a `merge_group` run

#### Scenario: The shards of one run

- **WHEN** the unit-test job runs its shards for one commit
- **THEN** each unit test file outside the acceptance directory runs in
  exactly one shard
- **AND** no acceptance file runs in any shard

#### Scenario: One shard fails

- **WHEN** one shard fails
- **THEN** the other shards still run to completion and report their own
  failures
- **AND** the CI gate fails

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
