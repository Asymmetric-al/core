## ADDED Requirements

### Requirement: Entry Instructions State Product Purpose And Surfaces

Root `AGENTS.md` SHALL state the product purpose and the four product
surfaces carried by the three applications, with links to the accepted intent
specs, inside the existing always-on budget. Each application's nested
`AGENTS.md` SHALL name every product surface that application hosts.

#### Scenario: An agent starts work in the donor application

- **WHEN** an agent reads the donor application's instructions
- **THEN** it learns that the application hosts both the donor portal and the
  public ministry website
- **AND** it is pointed to the accepted surface intent rather than a second
  product brief

#### Scenario: A change touches a record shown on several surfaces

- **WHEN** an agent changes a fact that more than one surface shows
- **THEN** the entry instructions direct it to the owning shared package and
  that record's consumers before it edits

### Requirement: Scoped Instructions Load In Every Supported Client

Every scoped `AGENTS.md` SHALL be reachable through each supported client's
own loading mechanism. Each directory that holds a scoped `AGENTS.md` MUST
also hold a `CLAUDE.md` that imports it.

#### Scenario: A scoped instruction file is added

- **WHEN** a nested `AGENTS.md` is added for an app, package or operational
  area
- **THEN** a sibling `CLAUDE.md` importing it is added in the same change
- **AND** repository verification fails while the import is missing

### Requirement: Always-Applied Client Context Excludes Reference Material

Content that a client applies to every session MUST be limited to the authored
router and scoped instructions. Compiled skill reference guides MUST NOT be
applied as always-on workspace rules.

#### Scenario: Cursor opens the repository

- **WHEN** Cursor builds its always-applied workspace rules
- **THEN** compiled guides bundled inside skills are excluded through the
  client's ignore mechanism in every skill root that client reads
- **AND** the runtime skill mirrors still contain the same canonical files

### Requirement: Workflow Commands Follow The Accepted Branch And Gate Policy

Numbered commands and contributor guides MUST NOT prescribe a pull-request
base, a readiness gate or a tool version that contradicts the governing
rulebook.

#### Scenario: An agent ships a working tree

- **WHEN** `/5-ship-working-tree` selects a pull-request base
- **THEN** it defaults to `develop` and does not offer `production`
- **AND** it runs the canonical readiness gate instead of an unconditional
  build

#### Scenario: An instruction shows a database command

- **WHEN** an instruction file shows a Supabase CLI command
- **THEN** the command goes through the repository's pinned wrapper

### Requirement: Completion Claims Name The Proof Tier

Verification guidance SHALL distinguish structural, unit or contract, smoke,
runtime, real-stack and cross-application proof. A completion claim SHALL name
the strongest tier actually exercised.

#### Scenario: A browser smoke test passes

- **WHEN** an agent reports a change verified by a reachability or stubbed
  browser test
- **THEN** it reports smoke-level proof
- **AND** it does not claim cross-application continuity

#### Scenario: A change affects a shared record

- **WHEN** a change touches a fact that more than one surface shows
- **THEN** the report names the journey or acceptance criteria it belongs to
  and the surfaces that were observed
