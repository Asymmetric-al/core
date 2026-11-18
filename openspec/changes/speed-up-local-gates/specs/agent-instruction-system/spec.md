# Spec Delta

## ADDED Requirements

### Requirement: Routine Pushes Run A Fast Deterministic Profile

A push that does not target `production` and is not selected for the full
profile SHALL run a fast profile of deterministic checks, scoped to what the
branch changed where the tool supports it. The fast profile MUST NOT need the
network and MUST NOT run unit, acceptance or build stages, which required CI
runs on every pull request.

#### Scenario: A developer or agent pushes a feature branch

- **WHEN** a push updates only non-production branches and no profile is
  selected
- **THEN** the hook runs the fast profile: runtime, formatting of the changed
  files, the phase projection checks, strict OpenSpec validation and delta
  checks, lint and typecheck of the affected workspaces, and the repository
  verifiers that take seconds
- **AND** a failed check blocks the push

#### Scenario: The branch diff cannot be read

- **WHEN** the fast profile cannot compute the changed files against the
  development base
- **THEN** it checks formatting of the whole repository instead of skipping
  the check

#### Scenario: The fast profile runs on native Windows

- **WHEN** the fast profile runs on a native Windows checkout with installed
  dependencies and no local changes
- **THEN** it passes

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
shared edit hook after an agent edits a file. The hook SHALL fix lint and
format that one file with the configuration the pre-commit hook uses, and report
remaining lint errors to the agent in a few lines. It MUST never block or
fail an edit because a tool is missing.

#### Scenario: An agent edits a source file

- **WHEN** an agent edits a TypeScript file inside an application or package
- **THEN** the hook applies lint fixes and formatting to that file
- **AND** remaining lint errors are reported to the agent in a few lines

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
