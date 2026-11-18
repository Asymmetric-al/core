# Spec Delta

## ADDED Requirements

### Requirement: Routine Pushes Run A Fast Deterministic Profile

A push that does not target `production` and is not selected for the full
profile SHALL run a fast profile of deterministic checks, scoped to what the
branch changed. The fast profile MUST NOT run unit, acceptance or build
stages, which required CI runs on every pull request, and MUST NOT need the
network unless the push changes an input of the shadcn upstream review.

#### Scenario: A developer or agent pushes a feature branch

- **WHEN** a push updates only non-production branches and no profile is
  selected
- **THEN** the hook runs the fast profile: runtime, formatting of the changed
  files, lint and typecheck of the affected workspaces, the repository
  verifiers whose inputs the push changed, and the verifiers that take under
  a second
- **AND** a failed check blocks the push

#### Scenario: The branch diff cannot be read

- **WHEN** the fast profile cannot compute the changed files against the
  development base
- **THEN** it checks formatting of the whole repository and runs every
  verifier instead of skipping them

#### Scenario: The fast profile runs on native Windows

- **WHEN** the fast profile runs on a native Windows checkout with installed
  dependencies and no local changes
- **THEN** it passes

### Requirement: Fast-Profile Verifiers Run Only For Changes To Their Inputs

In the fast profile, a repository verifier whose inputs can be named SHALL run
only when the push changes one of them, and SHALL print a line saying it was
skipped otherwise. Every such verifier except the shadcn upstream review MUST
also run in a required CI job. The shadcn upstream review, which no CI job
runs, SHALL take its inputs from its own verifier and review baseline.

#### Scenario: A push changes no input of a verifier

- **WHEN** a push changes only product code, and no OpenSpec, PRD or shared
  input
- **THEN** the phase projection checks, strict OpenSpec validation and the
  delta checks print that they were skipped
- **AND** the required CI `integrity` job still runs them on the pull request

#### Scenario: A push changes a shared shadcn primitive

- **WHEN** a push changes a file the shadcn upstream review hashes or its
  review baseline, as the verifier derives them
- **THEN** the fast profile runs the shadcn upstream review

### Requirement: The Full Preflight Stays One Explicit Command

`bun run ci:preflight` SHALL run the full profile: every stage the fast
profile runs, on the whole repository, plus the skill mirror and ESLint
configuration verifiers, the network shadcn diff, the unit suite and the
acceptance suite as their own stages, and the compilation the development
build policy selects. `bun run ci:preflight -- --full` SHALL add compilation
of every app.

#### Scenario: A contributor checks pull-request readiness

- **WHEN** a contributor runs `bun run ci:preflight`
- **THEN** the full profile runs, including the unit and acceptance stages

#### Scenario: A push targets production

- **WHEN** an authorized push targets `production`
- **THEN** the hook runs the full profile with compilation of every app
- **AND** an unauthorized push to `production` is still blocked before any
  check runs

### Requirement: Only A Full-Profile Pass Proves The Full Preflight

A push SHALL run the full profile when the pushing environment selects it. The
literal line `==> PASS ci:preflight` SHALL be printed only when every
full-profile stage passed. No fast-profile output MAY contain that line, and an
unknown profile selection MUST block the push.

#### Scenario: The factory publishes a candidate

- **WHEN** the factory's publish step pushes with the full profile selected
- **THEN** the hook runs the full profile and the factory accepts the push
  only when its output contains `==> PASS ci:preflight`

#### Scenario: A fast-profile pass reaches a full-profile reader

- **WHEN** the fast profile passes
- **THEN** its output names the fast profile and does not contain
  `==> PASS ci:preflight`
- **AND** the factory's publication check does not accept it

#### Scenario: The selector holds an unknown value

- **WHEN** the profile selector is set to a value other than the known
  profiles
- **THEN** the push is blocked with a message naming the accepted values

### Requirement: A Failed Gate Stage Tells The Agent How To Repeat It

When a push-gate stage fails, the gate SHALL stop and print the stage name,
the exact command that re-runs that stage alone, and the last lines of its
output. A passing run SHALL print which profile ran.

#### Scenario: Lint fails during a push

- **WHEN** the lint stage fails
- **THEN** the final lines of the output name the lint stage, give the
  command that re-runs it, and repeat the end of the lint output
- **AND** no later stage runs

### Requirement: Agent Harnesses Format And Lint Each Edited File

Each supported agent harness (Claude Code, Codex and Cursor) SHALL run one
shared edit hook after an agent edits files. It SHALL format the edited files,
lint the source files among them with the pre-commit root configuration (one
run per tool), and report lint findings in a few lines: as hook context in
Claude Code and Codex, and to its own output in Cursor, whose edit hook has no
channel to the agent. It MUST never block or fail an edit because a tool is
missing.

#### Scenario: An agent edits a source file

- **WHEN** an agent edits a TypeScript file inside an application or package
- **THEN** the hook formats that file
- **AND** in Claude Code and Codex, lint errors and fixable problems are
  reported to the agent in a few lines

#### Scenario: An agent edits a protected or generated path

- **WHEN** the edited path is generated, mirrored or vendored, is under
  `.next`, `.next-docs` or `.agents`, is deleted, or lies outside the
  repository
- **THEN** the hook changes nothing and exits quietly

#### Scenario: Dependencies are not installed

- **WHEN** an agent edits a file in a checkout without installed formatting
  or lint tools
- **THEN** the hook exits successfully without output

#### Scenario: The hook stays local and cheap

- **WHEN** the hook runs
- **THEN** it makes no network call, does not invoke the `next` CLI or the
  Next.js MCP compile tools, and runs no typecheck, build or test

### Requirement: The Edit Hook Never Removes Or Moves Code An Agent Wrote

The edit hook MUST NOT apply a lint fix that can remove, move or rewrite code.
It SHALL report the lint errors and the fixable problems it left in place, and
pre-commit's lint fix SHALL remain the step that applies those fixes.

#### Scenario: An agent adds an import before using it

- **WHEN** an edit adds an import that a later edit will use
- **THEN** the hook leaves the import in place and reports it as unused and
  fixable
- **AND** misordered imports are reported, not reordered

### Requirement: The Edit Hook Stays Inside Its Checkout And Its Time Budget

The edit hook SHALL act only on files inside the checkout that holds it, and
SHALL stop within a time budget below the harness timeout, naming what it did
not check and still exiting successfully.

#### Scenario: A multi-file patch outruns the time budget

- **WHEN** formatting and linting the files of one edit would take longer
  than the hook's budget
- **THEN** the hook stops, names the files it did not check, and exits
  successfully before the harness timeout

#### Scenario: An edited file lies in another checkout

- **WHEN** the edited file is outside the checkout that holds the hook, even
  inside another tree with its own lint runner and tools
- **THEN** the hook runs no tool for it

### Requirement: Next.js App Instructions Require Runtime Verification

Each product Next.js app's scoped instructions SHALL tell agents to verify
route and UI changes at runtime against the running development server
through the `next-dev-loop` skill and the Next.js MCP tools, and not to run
`next build` to check compilation while editing. Every Next.js app's scoped
instructions SHALL carry the managed Next.js block as generated.

#### Scenario: An agent changes a route in a product app

- **WHEN** an agent reads a product app's workflow before a route or UI
  change
- **THEN** the workflow names `next-dev-loop`, the existing dev server's lock
  file, and the MCP compile and error tools

#### Scenario: `next dev` starts in the operator Console

- **WHEN** `next dev` checks the Console's instructions for the managed block
- **THEN** the block is already present and current, so nothing is appended

## MODIFIED Requirements

### Requirement: OpenSpec Validation Is Strict For Current Specs And Active Changes

Current specs and active changes SHALL pass `openspec validate --all --strict`.
CI SHALL run that check after skill-mirror verification and before expensive
lint, build, and test stages. Historical archives SHALL be audited honestly
without a blanket allow-failure.

#### Scenario: CI preflight runs

- WHEN the full `ci-preflight` profile executes
- THEN `openspec-validate` runs after `skills-verify` and the Phase 25 and
  Phase 27 projection gates, before lint, build, and test stages
- AND it uses the locally pinned package after `bun install --frozen-lockfile`

#### Scenario: The fast pre-push profile runs

- WHEN the fast `ci-preflight` profile executes and the push changes an
  OpenSpec input
- THEN `openspec-validate` runs after the Phase 25, 27 and 28 projection
  gates and before lint, without `skills-verify`, which the required CI
  `integrity` job runs before it
