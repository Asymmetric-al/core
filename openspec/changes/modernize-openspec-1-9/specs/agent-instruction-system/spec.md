# Delta for Agent Instruction System

## ADDED Requirements

### Requirement: OpenSpec CLI Is Locally Pinned

The repository SHALL depend on an exact `@fission-ai/openspec` version and MUST
invoke OpenSpec only through the repository-pinned local CLI. Live instructions,
scripts, CI, and active workflow commands MUST NOT use a moving latest npm
dist-tag for that package.

#### Scenario: An agent needs the OpenSpec version

- WHEN an agent or CI needs to know which OpenSpec release Core uses
- THEN it runs `bun run openspec:version`
- AND the printed version matches the exact `package.json` pin

#### Scenario: A live instruction would fetch latest

- WHEN a current instruction, numbered command, or CI job would invoke OpenSpec
- THEN it uses `bun run openspec --`
- AND it does not use a moving latest npm dist-tag for that package

### Requirement: OpenSpec Workflows Are The Seven Selected Skills

Core SHALL support Explore, Propose, Update, Apply, Verify, Sync, and Archive
as canonical skills under `docs/ai/skills/`. Core MUST NOT enable or promote
New, Continue, Fast-forward, Bulk archive, Onboard, Stores, or a custom
OpenSpec schema in this instruction system.

#### Scenario: An agent starts non-trivial OpenSpec work

- WHEN requirements are unclear
- THEN it uses Explore
- AND when intent is clear it uses Propose with an explicit change ID

#### Scenario: A rejected workflow is requested

- WHEN an agent is tempted to use Stores, a custom schema, or generated native
  OpenSpec Cursor/Claude commands
- THEN it does not add them
- AND it keeps Core numbered commands as the wrappers around the seven skills

### Requirement: Intended Behavior And Current Reality Stay Distinct

Agents SHALL distinguish intended behavior from current reality. An approved
active OpenSpec change governs intended modifications on its branch. It MUST
NOT be treated as proof that the behavior has shipped. Material contradictions
among high-authority sources MUST be surfaced rather than silently resolved.

#### Scenario: An active change disagrees with production code

- GIVEN an approved active change describes a delta
- WHEN an agent inspects current tests, migrations, or runtime evidence
- THEN it treats the change as intended work on that branch
- AND it does not claim the behavior has shipped

#### Scenario: High-authority sources conflict

- WHEN an explicit human decision, an accepted ADR, and current code disagree
  on a material safety, data, or authorization fact
- THEN the agent stops that unsafe action
- AND it reports the contradiction for reconciliation

### Requirement: OpenSpec Validation Is Strict For Current Specs And Active Changes

Current specs and active changes SHALL pass `openspec validate --all --strict`.
CI SHALL run that check after skill-mirror verification and before expensive
lint, build, and test stages. Historical archives SHALL be audited honestly
without a blanket allow-failure.

#### Scenario: CI preflight runs

- WHEN `ci-preflight` executes
- THEN `openspec-validate` runs immediately after `skills-verify`
- AND it uses the locally pinned package after `bun install --frozen-lockfile`

### Requirement: Archive Follows Accepted Repository Reality

Agents SHALL archive an OpenSpec change only after implementation has become
accepted repository reality. Local green tests on a feature branch MUST NOT
archive the change. Incomplete or merely planned work MUST NOT be archived.

#### Scenario: Implementation is ready but unmerged

- WHEN focused tests pass on a feature branch
- THEN the agent may open or update a pull request
- AND it leaves the change active

#### Scenario: The implementation has merged

- WHEN the change's implementation is accepted on the integration branch
- THEN the agent re-validates, verifies, syncs if needed, and archives
- AND archive validation of that archive passes

### Requirement: Numbered Commands Wrap OpenSpec Workflows

`/1-start-project`, `/2-implement-project`, `/3-commit-project`, and
`/4-close-project` SHALL remain available as lightweight wrappers around
current OpenSpec behavior. `/2-implement-project` SHALL remain planning
despite its name. `/4-close-project` SHALL apply through TDD and MUST NOT
auto-archive unmerged work.

#### Scenario: Start-project finds unclear requirements

- WHEN `/1-start-project` runs and requirements are unclear
- THEN it uses Explore rather than inventing a partial artifact set

#### Scenario: Close-project finishes an unmerged implementation

- WHEN `/4-close-project` has applied, tested, and prepared a pull request
- THEN it leaves the change active until merge

### Requirement: Product Eve Remains Read-Only For OpenSpec

Product-runtime Eve MUST remain separate from coding-agent OpenSpec skills.
The OpenSpec Guardian SHALL stay permanently read-only: no file writes, no
shell mutation, no sync, and no archive. This modernization MUST NOT upgrade
Eve or grant live autonomy.

#### Scenario: Guardian reviews a change

- WHEN the Guardian is invoked for a material product or data change
- THEN it reads OpenSpec and repository evidence
- AND it does not write files or run mutating shell commands

## MODIFIED Requirements

### Requirement: OpenSpec Owns Durable Project Intent

The repository SHALL use OpenSpec as the durable source of truth for project
context and intended long-lived behavior, and MUST make OpenSpec visible and
actionable for non-trivial project work, behavior changes, and multi-step
planning. `openspec/config.yaml` SHALL supply injected planning context.
`openspec/project.md` SHALL remain the detailed human-oriented index. Agents
MUST use the repository-pinned local CLI and MUST NOT run `openspec update`
against the live customized repository.

#### Scenario: Non-trivial project work starts

- WHEN an agent begins non-trivial feature work, behavior changes, or multi-step
  planning
- THEN the routing layer points it to `openspec/config.yaml` and
  `openspec/project.md`
- AND it reads the relevant specs in `openspec/specs/**`
- AND it reads any active change in `openspec/changes/**` before implementation

#### Scenario: Behavior is changing without an active change

- WHEN an agent needs to change durable behavior or workflow expectations
- THEN it creates or updates an OpenSpec change before major implementation
- AND it uses an explicit change ID for mutating OpenSpec operations
