## ADDED Requirements

### Requirement: Routine development uses conditional compilation

The repository SHALL retain required correctness feedback on development PRs while compiling only apps affected by dependency or build-configuration changes. Missing diff context SHALL request full compilation. Development pushes SHALL NOT repeat full compilation.

#### Scenario: Ordinary application code changes

- **WHEN** a PR to develop changes ordinary source or documentation without build inputs
- **THEN** correctness gates run and full compilation is intentionally skipped

#### Scenario: Build inputs change

- **WHEN** a PR changes app build configuration or shared dependency/build inputs
- **THEN** the affected apps are compiled and any requested build failure blocks the required CI gate

#### Scenario: Build planning fails

- **WHEN** planning or any required correctness job fails or is canceled
- **THEN** the CI gate fails even if compilation would otherwise be optional

### Requirement: Deployment is an explicit development checkpoint

Vercel Git deployments SHALL be disabled for develop and enabled for production. Explicit preview QA SHALL retain current target and credential safeguards and compile output on GitHub before uploading prebuilt output.

#### Scenario: A PR merges into develop

- **WHEN** develop receives a merge
- **THEN** Vercel does not automatically deploy it and development URLs keep their last deployment

#### Scenario: A preview is explicitly requested

- **WHEN** an eligible same-repository non-draft develop PR receives an explicit QA request
- **THEN** affected surfaces are built for preview on GitHub and uploaded as prebuilt output
- **AND** environment files and output are not published as diagnostic artifacts

### Requirement: Release verification remains complete

Production PRs/pushes and explicit full preflight SHALL compile all apps and retain release gates. The production release entrypoint SHALL request full preflight even when its source branch is develop.

#### Scenario: Release starts from develop

- **WHEN** the production release command is invoked from develop
- **THEN** full compilation and existing release verification are required before production publication
