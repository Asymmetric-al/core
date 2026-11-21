# Spec Delta

## Purpose

Defines how Core lints, formats and type-checks its own source, and how lint
findings may be repaired, so that code written by people and by agents meets
one enforced standard.

## ADDED Requirements

### Requirement: One Root Quality Policy

Core SHALL lint its JavaScript and TypeScript source with one policy defined in
one configuration file at the repository root, used by every lint command, hook
and editor integration. A lint run SHALL fail on a warning as it fails on an
error. Every rule the policy turns off or reconfigures, and every path it
ignores, SHALL carry its reason beside it in that file.

#### Scenario: A command is given another configuration

- **WHEN** a lint command is asked to load a policy file from a workspace or any other nested location
- **THEN** the command refuses to run

#### Scenario: A rule is turned off without a reason

- **WHEN** a change turns a rule off or adds an ignored path without stating why
- **THEN** review rejects the change

#### Scenario: A lint run reports only warnings

- **WHEN** a lint run finds warnings and no errors
- **THEN** the run fails

### Requirement: A Crash Is Never A Pass

A lint run SHALL distinguish findings from failures of the tool itself. A
crashing rule plugin, a configuration that cannot load, or a typed-lint backend
that cannot start SHALL end the run with a failure status different from the
one for findings, with the original message. A lint run SHALL refuse to start
when a suppression file for the linter exists.

#### Scenario: A rule plugin crashes on a file

- **WHEN** a rule plugin throws while linting a file
- **THEN** the run fails as a tool failure, not as findings and not as a pass

#### Scenario: A suppression file appears

- **WHEN** a linter suppression file exists in the lint working directory
- **THEN** the lint run refuses to start and names the file

### Requirement: The Typed-Lint Backend Is Proved

Type-aware lint SHALL run on the pinned backend, selected by the lint launcher
and not by the environment it inherits. The repository SHALL hold a check that
shows the pinned backend is the program that executes, and that no competing
backend is installed.

#### Scenario: The pinned backend runs

- **WHEN** the backend check runs on a supported platform
- **THEN** a typed-only finding is reported and the recorded invocation is the pinned backend's

#### Scenario: The backend cannot start

- **WHEN** the backend selector points at a program that does not exist
- **THEN** the typed lint run fails as a tool failure

#### Scenario: A competing backend is installed

- **WHEN** another typed-lint backend package is present in the installation
- **THEN** the toolchain verification fails

### Requirement: Compiler Roles Stay Separate

Core SHALL compile its workspaces with the pinned native TypeScript compiler
and SHALL keep the pinned classic TypeScript package for tools that need the
compiler API, the parser or the editor service. Every authored TypeScript scope
SHALL be recorded as a compiled program, a lint-context-only program with its
reason, generated output, or an intentional negative fixture.

#### Scenario: A workspace pin drifts

- **WHEN** a workspace declares a compiler version other than the pinned one
- **THEN** the toolchain verification fails and names the workspace

#### Scenario: A tool needs the compiler API

- **WHEN** a script imports the TypeScript API
- **THEN** it resolves the classic package, not the native compiler

#### Scenario: An authored route contradicts its generated types

- **WHEN** a route's exports are incompatible with the framework's generated route types
- **THEN** the public typecheck command fails

### Requirement: Formatting Never Rewrites Protected Content

Core SHALL format with one configuration at the repository root. Hashed
records, evidence, archived specifications, verbatim imported assets and other
protected content SHALL be excluded from formatting. JavaScript and TypeScript formatter consumers SHALL use the shared adapter. The two Python
renderers SHALL call the installed Oxfmt CLI from the root with the same flags. All consumers SHALL treat
imported content as data and SHALL fail without writing when the formatter is unavailable.

#### Scenario: The formatter runs over the repository

- **WHEN** the formatter runs from the repository root
- **THEN** no protected file is reported or changed

#### Scenario: A generator runs without the formatter

- **WHEN** a script that formats its output cannot load the formatter
- **THEN** it fails and leaves the previously published output unchanged

#### Scenario: Imported content carries its own formatter configuration

- **WHEN** imported content includes formatter configuration or plugins
- **THEN** formatting that content does not load or run them

### Requirement: No Baseline Remains

Rules that are not yet enforced during a migration SHALL be listed in one
pending list that names an owning task for each entry and only shrinks. A rule
the repository already enforces SHALL NOT be added to it. A migration SHALL NOT
be reported complete while the list has an entry or while any suppression file
or count baseline it introduced remains. A permanent exception SHALL be narrow
and SHALL state its semantic reason.

#### Scenario: A change adds a rule to the pending list

- **WHEN** a change adds an entry to the pending list or widens an entry's scope
- **THEN** the pending-list verification fails

#### Scenario: An entry is removed

- **WHEN** a change removes an entry from the pending list
- **THEN** a seeded violation of that rule fails through the root policy

#### Scenario: Completion is claimed with pending rules

- **WHEN** the pending list still has an entry
- **THEN** the migration is reported as unfinished and the entry is named

### Requirement: Repairs Preserve Behavior

A lint finding SHALL NOT be repaired by replacing a useful type with `any`, by
a disguised assertion, by an always-true guard, by an empty safety comment, by
evading mock detection, by deleting or loosening a negative test, or by removing
a runtime check. A repair that changes emitted code SHALL be made test-first,
and every repair SHALL be reviewed by a reviewer other than its author.

#### Scenario: A repair changes a money or tenant check

- **WHEN** a repair edits code that compares an amount, filters by tenant or checks a permission
- **THEN** a test fails for the wrong amount, tenant or permission before the repair is accepted

#### Scenario: A repair loosens a test

- **WHEN** a repair replaces an exact assertion with a weaker one
- **THEN** review rejects the repair

### Requirement: Staging Keeps The Author's Selection

The pre-commit hook SHALL check the staged content and SHALL NOT write to the
index or the working tree, so that a commit never gains a change the author did
not stage. It SHALL apply no format and no lint fix.

#### Scenario: A file is partially staged

- **WHEN** a commit includes only some of the changes to a file the hook formats or lints
- **THEN** the hook refuses the commit, names the file and leaves the index and the working tree unchanged

#### Scenario: Staged content is not formatted

- **WHEN** a staged file's content differs from its formatted form
- **THEN** the commit fails and names the format command, and nothing is rewritten

#### Scenario: A staged file has a lint finding

- **WHEN** a staged file has a lint finding
- **THEN** the commit fails, the hook names the fix command, and nothing is rewritten
