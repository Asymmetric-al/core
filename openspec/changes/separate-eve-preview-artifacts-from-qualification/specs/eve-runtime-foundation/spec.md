## ADDED Requirements

### Requirement: Web Build Artifacts Are Separate From Eve Runtime Qualification

Generic web builds MUST compile their Eve dependency without provisioning a
sandbox. Hosted preview Eve services MUST support the same explicit artifact
mode. These outputs MUST be treated as unqualified Release-Off previews and MUST
NOT activate Eve, change effect admission, or satisfy sandbox/launch evidence.
Build caches MUST distinguish artifact mode and MUST NOT reuse a cached result
as full sandbox qualification. Ordinary standalone and production service builds
MUST retain the full SDK prewarm path and propagate its failures.
Authored-source verification MUST exclude only the SDK's exact generated service
and deployment output directories, while retaining checks on authored code and
same-named directories outside those paths.

#### Scenario: A Release-Off preview compiles without provisioning

- **GIVEN** the web preview requires Eve service output but release is off
- **WHEN** the web dependency and generated preview service are built
- **THEN** complete app/workflow artifacts are emitted without sandbox prewarm
- **AND** existing runtime governance continues to deny unauthorized effects
- **AND** a successful preview is not represented as full Eve qualification

#### Scenario: Full qualification remains mandatory

- **GIVEN** an artifact build succeeded without a qualified sandbox template
- **WHEN** a standalone full build or production service build runs
- **THEN** the normal SDK prewarm path still runs and any denial fails the build
- **AND** artifact or prior cache success cannot substitute for that qualification
- **AND** full runtime verification and target-bound launch evidence remain
  required before any authorized release activation

#### Scenario: Generated service output is reused for another target

- **GIVEN** a checkout generated an Eve service during a preview build
- **WHEN** that service command executes for a production target
- **THEN** it selects full SDK qualification using the current target
- **AND** neither stale preview configuration nor an inherited web artifact
  variable can skip prewarming

#### Scenario: Generated server bundles coexist with authored app source

- **GIVEN** the SDK emitted admin `.eve/vercel-services` or `.vercel/output` bundles
- **WHEN** lint and data-boundary verification run after the build
- **THEN** they exclude those generated bundles without classifying server dependencies as authored browser imports
- **AND** forbidden database imports or retired CRM references in authored source still fail verification

#### Scenario: Production signals require canonical normalization

- **GIVEN** the current target has production casing or whitespace accepted by the canonical environment model
- **WHEN** the generated service dispatcher selects its build mode
- **THEN** production still requires full prewarming even with a conflicting preview marker
- **AND** local development stays full while hosted core-development and legacy staging use artifacts

#### Scenario: Explicit full commands receive a conflicting skip flag

- **GIVEN** an ordinary full build, production service or named full command
- **WHEN** the caller supplies the SDK skip-prewarm flag
- **THEN** the dispatcher fails before starting Eve
- **AND** an inherited artifact-mode variable cannot change the named full command
- **AND** a forwarded service or artifact selector cannot override that explicit full mode
- **AND** ordinary SDK arguments remain supported
