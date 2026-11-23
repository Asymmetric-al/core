# Spec Delta

## ADDED Requirements

### Requirement: First-Party Source Carries No New Comments

TypeScript and JavaScript source under `apps/`, `packages/`, `scripts/`,
`tests/`, `tooling/` and the repository root MUST NOT gain a comment. The
shared lint configuration SHALL report a comment in such a file as an error,
unless the file holds no more comments than its recorded baseline. A comment
that a tool reads SHALL remain legal.

#### Scenario: An agent adds a comment to a new file

- **WHEN** a new source file in a banned tree contains a prose comment
- **THEN** linting that file reports the comment as an error
- **AND** the message tells the author to delete it and names the
  `delete-comment` skill

#### Scenario: A file keeps a machine-read comment

- **WHEN** a source file contains a lint suppression with its tracking
  reference, a TypeScript, formatter, coverage, bundler or test-environment
  directive, a shebang, a licence header, a JSDoc block that carries
  `@deprecated`, or, in a JavaScript file, a JSDoc type annotation
- **THEN** the rule reports nothing for that comment
- **AND** the comment does not count toward the file's baseline

#### Scenario: Prose starts like a directive

- **WHEN** a line comment begins with a word that is a directive only in a
  block comment, such as `global`
- **THEN** the rule treats it as prose and reports it

#### Scenario: A file is outside the rule

- **WHEN** a file is generated, a test fixture, a `public/` asset, a Payload
  migration, part of the factory pack, or outside the banned trees
- **THEN** the rule reports nothing for it
- **AND** it has no entry in the baseline

### Requirement: The Comment Count Only Goes Down

The repository SHALL record, per file, how many comments first-party source
held when the ban began, and that record MUST match the tree. A required gate
SHALL fail when a file holds more comments than its version on the base
branch, and SHALL fail when the record differs from the tree. No option SHALL
raise a file's count. The gate MUST cover every banned tree.

#### Scenario: A change adds a comment to a file that already has some

- **WHEN** a pull request adds one comment to a file recorded with two
- **THEN** the gate fails and names the file with both counts
- **AND** rewriting the record does not make it pass

#### Scenario: A change deletes comments

- **WHEN** a pull request deletes comments and leaves the record unchanged
- **THEN** the gate fails and prints the command that lowers the record
- **AND** after that command runs, the gate passes and the file's entry is
  lower, or gone when the file has no comments left

#### Scenario: A commented file is renamed

- **WHEN** a pull request renames a file without adding a comment
- **THEN** the gate compares it with the file it was renamed from
- **AND** the gate passes once the record names the new path

#### Scenario: A tree that the workspace lint commands do not lint

- **WHEN** a file under `scripts/`, `tests/` or the repository root gains a
  comment
- **THEN** the gate fails, although no workspace lint command reads the file

### Requirement: Comment Removal Preserves Decisions And Tracks Workarounds

A pass that removes existing comments SHALL classify each one as a tautology,
stale, an excuse or a decision record before deleting it. An excuse SHALL
produce a tracked issue for the workaround it covers. A decision record that
no accepted record already states SHALL move into an ADR beside the owning
code. The removal MUST NOT change code.

#### Scenario: A comment excuses a workaround

- **WHEN** a pass finds a comment that lets a workaround in first-party code
  stand, and the workaround is still present
- **THEN** the comment is deleted
- **AND** an issue is filed that names the file, the workaround and a proper
  fix

#### Scenario: A comment records a decision

- **WHEN** a pass finds a comment that gives a non-obvious reason no accepted
  record states
- **THEN** the comment is deleted
- **AND** the reason is written into an ADR under the owning workspace's
  `docs/adr/` directory, marked as a record of what the code does and not as
  ratified intent

#### Scenario: A comment claims platform intent

- **WHEN** a comment states platform-wide intent that no accepted record holds
- **THEN** the pass does not add it to the platform ADR series
- **AND** it asks the owner before recording it anywhere as intent

#### Scenario: Removing a comment would change the code

- **WHEN** removing a comment would alter the file's syntax tree
- **THEN** the removal tool leaves the file untouched and names it
