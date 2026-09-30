## ADDED Requirements

### Requirement: UI Agents SHALL Discover One Canonical Lint Workflow

Supported coding clients and existing implementation, testing, review,
CI-watching, and specification roles MUST route relevant UI work to the
Core shadcn overlay's canonical design-system lint reference. Routes MUST
remain conditional, respect explicit-only invocation settings, and preserve
the compact root router and generated-mirror ownership.

#### Scenario: An agent implements or repairs UI

- **WHEN** the agent changes applicable UI or imported registry output
- **THEN** it inspects shared components, tokens, contracts, and existing
  findings before creating new styling
- **AND** it runs the smallest workspace-aware lint check during iteration
- **AND** shared contract changes broaden verification to relevant consumers
- **AND** repairs preserve design intent instead of widening exceptions to pass

#### Scenario: A test author or reviewer checks the integration

- **WHEN** configuration, discovery, contracts, or debt acceptance changes
- **THEN** test authors exercise positive, negative, and exception cases
- **AND** reviewers verify analysis health, scope, lint evidence, and any
  rendered behavior changes
- **AND** the specification guardian compares implemented behavior with
  the durable contract and the original request

#### Scenario: CI fails during UI work

- **WHEN** existing CI lint or verification checks fail
- **THEN** the CI watcher reports the failing command, rule or setup failure,
  affected file, and available evidence
- **AND** it does not introduce another policy or change design decisions

#### Scenario: Client mirrors or scoped instructions change

- **WHEN** canonical guidance or existing Cursor commands/agents change
- **THEN** synchronization refreshes generated skill and Claude mirrors
- **AND** non-mutating verification proves equality
- **AND** ecosystem-owned assets and invocation settings remain intact

#### Scenario: A task does not affect UI lint behavior

- **WHEN** work is unrelated to UI or only changes prose
- **THEN** the lint reference does not become mandatory context
- **AND** expensive successful checks are repeated only for changed evidence,
  unresolved risk, or a required workflow gate
