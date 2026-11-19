# Spec Delta

## Purpose

Defines how Core lints, formats and type-checks its own source, how exceptions
and automatic fixes are governed, and how unit tests are kept off the network,
so that code written by people and by agents meets one enforced standard.

## ADDED Requirements

### Requirement: One Root Quality Policy Covers Every Owned Source File

Core SHALL lint its JavaScript and TypeScript source with one policy that is
defined at the repository root and used by every lint command, hook and editor
integration. Every tracked JavaScript or TypeScript file SHALL be either
linted under that policy or excluded by exactly one recorded ignore that states
its reason. A lint run SHALL fail on a warning as it fails on an error.

#### Scenario: A new source file is added outside the linted scope

- **WHEN** a tracked JavaScript or TypeScript file is neither linted nor matched by a recorded ignore
- **THEN** the quality verification fails and names the file

#### Scenario: A command is given a configuration outside the repository root

- **WHEN** a lint or fix command is asked to load a policy file from a workspace or any other nested location
- **THEN** the command refuses to run

#### Scenario: A rule adaptation is declared

- **WHEN** the policy turns a rule off, configures it, or scopes it to some files
- **THEN** a test shows the rule's effective setting on a sample file inside and outside that scope
- **AND** the adaptation carries a written reason

### Requirement: The Typed-Lint Backend Is Proved, Not Assumed

A type-aware lint run SHALL bind the pinned backend launcher and SHALL fail
when that launcher is missing or substituted, or when a different backend is
installed or selected. An identity check SHALL confirm that the executable
observed running is the one the pinned package resolves for the platform, and
it SHALL run on Windows and in the Ubuntu CI lint job.

#### Scenario: The pinned backend runs

- **WHEN** the backend identity check runs on Windows or on Ubuntu
- **THEN** it confirms the installed backend version, the expected executable and the executable observed running
- **AND** the installed version must equal its pin, the observed executable must match the expected one, and the parsed TypeScript version, TSRS version and upstream commit must match the pins

#### Scenario: A competing backend is present

- **WHEN** another typed-lint backend is installed or the runner resolves a competing launcher
- **THEN** the run fails before linting and names the conflict

#### Scenario: An inherited selector cannot replace the pinned backend

- **WHEN** the public runner receives an inherited backend override and checks a typed-only fixture
- **THEN** it discards the override, binds the pinned launcher in reference mode and observes the expected child
- **AND** the invalid input reports the intended rule and its valid counterpart passes

### Requirement: Every Authored TypeScript Program Is Compiler-Checked

Core SHALL type-check every authored TypeScript file with the independent
compiler: the workspaces, root configuration, scripts, tooling and tests. A
compiler run SHALL count as passing only when it completed normally and every
reported problem is a source diagnostic with a file and position. Generated
route types SHALL be produced before an application is compiled, and an
application type-check SHALL never be served from a cache.

#### Scenario: A test file has a type error

- **WHEN** a file under the central test tree contains a type error
- **THEN** the type-check command fails and reports the file

#### Scenario: A compiler run cannot load its configuration or types

- **WHEN** a compiler run reports a configuration error, finds no input files, or cannot resolve a declared types package
- **THEN** the run is treated as failed, whatever other output it produced

#### Scenario: An authored route contradicts its generated types

- **WHEN** an application route exports a signature that its generated route types reject
- **THEN** that application's type-check fails

### Requirement: Formatting Never Rewrites Protected Content

Core SHALL use one formatter and one root policy. Format and fix SHALL preserve protected bytes, including excluded imports, skill mirrors, designated vendor assets, OpenSpec archives and dated evidence. In-scope managed skills SHALL use the same no-sort options in refresh and CLI without source-local configuration. Generators SHALL use the adapter, except the two Python renderers using the pinned local CLI with the same trusted options. Formatter errors SHALL prevent publication.

#### Scenario: The formatter runs over the repository

- **WHEN** the format command runs from the repository root
- **THEN** the explicitly re-included misformatted file is formatted, while its excluded sibling and every other protected file remain byte-identical

#### Scenario: A generator runs without the formatter

- **WHEN** a tool that publishes formatted files cannot find the formatter
- **THEN** it exits with an error and publishes nothing

### Requirement: Automatic Fixes Are Limited To A Reviewed List

Core SHALL apply automatic lint fixes only through its fix command and only
for rules on a reviewed list of fixes that cannot change behavior. The fix
command SHALL serialize concurrent runs, SHALL never evict a running holder of
its lock, and SHALL leave ignored, generated and protected files unchanged.
It SHALL refuse a target that does not exist, naming it, rather than report
success.

#### Scenario: Two fix runs start together

- **WHEN** a second fix run starts while another holds the lock
- **THEN** the second waits for a bounded time and then reports that the fixer is busy, changing nothing

#### Scenario: A direct writer flag is used

- **WHEN** a lint command other than the fix command is run with a fix flag or an Oxlint suppression flag
- **THEN** the command refuses and names the supported command

#### Scenario: A fix target does not exist

- **WHEN** the fix command is given a path that does not exist, alongside valid paths
- **THEN** it exits with an error that names the missing path
- **AND** it changes no file

### Requirement: The Pre-Commit Hook Formats And Reports

The pre-commit hook SHALL format staged files and report lint findings, naming
for each file with findings the command that applies the reviewed fixes. It
SHALL NOT apply lint fixes, and it SHALL refuse a partially staged file rather
than stage content the author did not stage. It SHALL format the staged
content itself, so that the commit never includes a later working-tree edit.

#### Scenario: A file is partially staged

- **WHEN** a commit includes a lintable file whose staged and working-tree contents differ
- **THEN** the pre-commit hook refuses the commit and names the file
- **AND** the staged and working-tree content of every file is unchanged

#### Scenario: A file changes while the hook runs

- **WHEN** an editor or agent writes to a staged file after the hook has read its staged content
- **THEN** the commit contains exactly the formatted staged content
- **AND** the working-tree file keeps the later write, and the hook names the file

#### Scenario: A staged file has a fixable finding

- **WHEN** a staged file has a lint finding that the reviewed list can fix
- **THEN** the hook reports the finding with the fix command
- **AND** the hook leaves the file's code as the author staged it

### Requirement: Exceptions Are Classified, Justified And Tested

Every lint disable, coverage-ignore comment, recovery-boundary marker and
safety marker on a type assertion SHALL carry one class from a closed list and
a reason. Every new authored lint disable, including a file-wide disable, SHALL
name the rule or rules it disables. An exception for a decoder, a recovery boundary or an analyzer defect
SHALL link a test that exists and that executes the code the exception marks.

#### Scenario: An exception has no class

- **WHEN** a disable directive or safety marker lacks a class from the closed list
- **THEN** the quality verification fails and names the location

#### Scenario: A classed blanket disable

- **WHEN** a new authored ESLint or Oxlint disable gives a class and a reason but names no rule
- **THEN** quality verification rejects the directive

#### Scenario: An exception links an unrelated test

- **WHEN** a linked test exists but never executes the marked code
- **THEN** the link check fails

### Requirement: No Suppression File Or Baseline Remains

At completion Core SHALL have no suppression file, baseline or ratchet for the
policy. Core SHALL NOT carry a native Oxlint suppression file at any time,
because the linter honors one without reporting that it did.

#### Scenario: A native suppression file appears

- **WHEN** an Oxlint suppression file exists in the repository or in the working directory of a lint run
- **THEN** the lint command fails when the file is in its working directory, and the quality verification fails when the file is tracked; each names the file

#### Scenario: A retired baseline reappears

- **WHEN** a suppression file, transition policy or ratchet that was retired is added again
- **THEN** the quality verification fails

### Requirement: Mechanical Batches Are Reproducible

A commit presented as mechanical SHALL be reproducible from its parent by
replaying the named transform. The verification SHALL accept, beyond the
replayed output, only registered derived records whose changes are each proved
from the committed bytes. A hash-bound record SHALL NOT change without such a
proof or a reviewed note. The React Doctor exceptions ledger SHALL NOT be
edited by this toolchain's batches.

#### Scenario: A mechanical commit contains a hand edit

- **WHEN** a commit declared as a formatting or single-rule batch also changes a line the transform does not produce
- **THEN** the mechanical verification fails and names the path

#### Scenario: A record's hash changes without evidence

- **WHEN** a hash in a registered record changes with neither a proof nor a note
- **THEN** the quality verification fails

### Requirement: Unit Tests Cannot Reach The Network

The unit-test setup SHALL refuse every outbound network request and every
socket connection except loopback ports that the running test registered. The
refusal SHALL apply to the test process and to the Node and Bun processes it
starts, directly or through code under test, whatever environment the caller
passes. A refused attempt SHALL fail the test unless the test declared it,
even when caught by product code or a child process.

#### Scenario: Product code swallows a refused request

- **WHEN** code under a unit test catches the refusal of a network request and continues
- **THEN** the test fails, unless it declared that request as expected

#### Scenario: A child process tries the network

- **WHEN** a unit test, or a script it calls, starts a Node or Bun process that makes a network request
- **THEN** the request is refused and the test fails

#### Scenario: A child is started with a replaced environment

- **WHEN** a unit test starts a Node or Bun process with an environment built from scratch
- **THEN** the guard still loads in that process
- **AND** a network request from it is refused and recorded against the test

### Requirement: Network Access Comes From The Job, Not The File Name

A test file SHALL gain network access only by being listed in the
integration-tier registry and run by a job that sets the integration tier. Its
file name alone SHALL grant nothing, and a registered file SHALL reach only its
registered hosts.

#### Scenario: An integration file is selected in a unit run

- **WHEN** a file listed in the integration-tier registry is run without the integration tier set
- **THEN** it is not collected, and its tests cannot reach any service

#### Scenario: An unregistered file carries an integration name

- **WHEN** a file named as an integration test is absent from the registry and runs with the integration tier set
- **THEN** its network requests are refused

### Requirement: Repairs To Money, Tenant And Auth Code Are Protected

Core SHALL keep generated inventories of the files and functions that handle
money, tenant scoping and authorization, and those inventories SHALL NOT shrink
without a reviewed exclusion. A change to an inventoried function, or to a
test that reaches one, SHALL be accepted only while each recorded fault for
that function, such as a removed tenant filter or a swapped privileged client,
still makes its test fail on the same assertion.

#### Scenario: A test for a tenant filter is loosened

- **WHEN** a change weakens the assertion that protects a tenant filter, leaving product code untouched
- **THEN** the recorded fault no longer fails that test, and the change is rejected

#### Scenario: An inventoried function leaves the inventory

- **WHEN** a file or function drops out of a money, tenant or authorization inventory without a reviewed exclusion
- **THEN** the quality verification fails and names it

### Requirement: Numeric Truthiness Repairs Preserve Behavior

Each repaired number or bigint truthiness check SHALL preserve the result for that operand, or be listed as a behavior change with a test. Cover zero, negative values, applicable missing values and, for numbers, not-a-number.

#### Scenario: An amount check is rewritten

- **WHEN** a truthiness test on an amount is rewritten to a comparison that treats a negative amount differently
- **THEN** the change is rejected unless it is listed as a behavior change with a test for zero, a negative value, applicable missing values and, for numbers, not-a-number

### Requirement: Agents Receive Lint Feedback At Edit Time

Core SHALL register one edit hook per supported agent harness. After an agent
edits a file, the hook SHALL format that file, changing layout only, and return
the remaining lint findings to the agent in the form its harness documents. The
hook SHALL NOT apply a fix that removes, moves or rewrites code.

#### Scenario: An agent's edit leaves a finding

- **WHEN** an agent writes a file that still has a lint finding after formatting
- **THEN** the harness receives the findings for that file, capped in length, with the number the fix command applies, that command, and the command that shows the rest
- **AND** the agent's edit is not blocked

#### Scenario: An agent adds code it has not used yet

- **WHEN** an edit adds an import or a variable that a later edit will use
- **THEN** the hook leaves it as written and reports it

#### Scenario: The hook rewrites a file

- **WHEN** formatting changes a file the agent just edited
- **THEN** the report names that file, so that the agent reads it again before its next edit

### Requirement: The Edit Hook Never Blocks And Always Reports

The edit hook SHALL NOT block or fail an edit and SHALL NOT depend on its exit
code to deliver feedback. It SHALL act on the checkout the agent is working in
and do nothing in a checkout that does not contain it. It SHALL name each file
it rewrote and each check it could not complete, and SHALL stop within a time
budget below the harness timeout. A harness whose feedback cannot be shown to
reach the model SHALL be documented as explicit-command only.

#### Scenario: The hook cannot finish

- **WHEN** the fixer is busy, the hook itself fails, or its time budget runs out
- **THEN** the harness receives a report that states the reason and names the files left unchecked
- **AND** the agent's edit is not blocked

#### Scenario: The hook runs in a checkout that lacks it

- **WHEN** a harness runs the registered hook command in a checkout that does not contain the hook
- **THEN** the command does nothing and the agent's edit is not blocked
