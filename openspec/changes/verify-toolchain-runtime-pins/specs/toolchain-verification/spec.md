## ADDED Requirements

### Requirement: Every Bun setup step owns its verified version pin

The toolchain verifier SHALL inspect each first-party setup-bun step's own
version input and effective workflow, job and step environment. It SHALL require
the repository's exact stable package-manager pin through the accepted
env.BUN_VERSION expression. It MUST work before dependency installation and
MUST reject malformed workflow data instead of reporting readiness.

#### Scenario: Unrelated text resembles a valid pin

- GIVEN a setup step installs a different version
- WHEN a comment, run-script string or another action contains the expected pin
- THEN the verifier rejects the setup step

#### Scenario: A job or step shadows the workflow environment

- GIVEN a setup step inherits a different BUN_VERSION or no in-scope pin
- WHEN the verifier inspects its effective environment
- THEN it rejects that step regardless of pins in unrelated jobs

#### Scenario: Dependencies are not installed yet

- GIVEN Bun is installed but node_modules is absent
- WHEN a valid workflow uses quoted scalars or supported YAML aliases
- THEN the verifier can validate the correct scoped pin

### Requirement: Live app runtime settings match the Node policy

The deployment-control verifier SHALL require live Vercel project nodeVersion
24.x and an absent or null bunVersion for the three applications. It MUST reject
runtime drift even when checked-in configuration remains correct. Verification
SHALL be read-only.

#### Scenario: Live runtime settings drift

- GIVEN a project reports a different or missing Node runtime or an explicit Bun runtime
- WHEN the deployment-control verifier reads its settings
- THEN it reports the project as not ready without changing the project

#### Scenario: Live runtime remains Node 24

- GIVEN a project reports Node 24 and no configured Bun runtime
- WHEN its other deployment controls also pass
- THEN runtime verification reports ready
