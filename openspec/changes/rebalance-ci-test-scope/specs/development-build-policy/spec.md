## ADDED Requirements

### Requirement: Instant-navigation guards compile donor on develop pull requests

As the one exception to the "Ordinary application code changes" scenario of
"Routine development uses conditional compilation", CI SHALL make one donor
production build for the `instant()` navigation guards on a same-repository
pull request into `develop` whose changes can affect them. That job SHALL NOT
be a required check or part of any gate job on `develop`.

#### Scenario: A develop pull request changes donor or shared inputs

- **WHEN** a same-repository pull request into `develop` changes donor source,
  a shared package, a toolchain input, the guards, their Playwright harness or
  the job itself, or its change set cannot be computed
- **THEN** CI builds donor once in production mode and runs the `instant()`
  guards against it
- **AND** a guard failure shows as a failed check that does not block merging

#### Scenario: A develop pull request cannot affect the guards

- **WHEN** a same-repository pull request into `develop` changes none of those
  inputs
- **THEN** the job skips the donor build and the guards and its log says why

#### Scenario: The change-set decision is missing

- **WHEN** the step that decides whether a `develop` pull request can affect
  the guards writes no decision
- **THEN** the job builds donor and runs the guards

#### Scenario: Release verification

- **WHEN** a pull request targets `production`, a push reaches `production`,
  or the job is dispatched manually
- **THEN** the guards run unconditionally and the production E2E gate still
  requires them
- **AND** whether they run does not depend on the change-set decision
