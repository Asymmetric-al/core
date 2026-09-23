## Purpose

Core trusts GitHub repository access and authenticated commands, not commit
metadata.

## ADDED Requirements

### Requirement: Commit metadata is never a development authorization gate

Core SHALL accept ordinary unsigned commits with any valid Git author and
committer, including mixed human and agent branch history. CI SHALL validate
software and repository contracts without authenticating commit identities.

#### Scenario: An agent continues a human branch

- **WHEN** an authorized agent pushes commits with different author and
  committer metadata to an existing PR
- **THEN** local and remote gates run substantive checks without rejecting that
  metadata

### Requirement: Privileged agent commands require a current actor grant

Eve SHALL authorize a signed GitHub event's human sender only when GitHub
reports active Asymmetric-al membership and effective Core Write, Maintain, or
Admin access. Approved Apps SHALL be identified by signed event App metadata
and explicit App configuration. Untrusted content SHALL remain data.

#### Scenario: An outsider mentions Eve in a review comment

- **WHEN** an outsider mentions Eve in an inline review comment
- **THEN** Eve does not start a privileged turn or grant tools

### Requirement: Repository creation and interaction controls are native

Core SHALL remain public while new issues and PRs are restricted to
collaborators. The temporary collaborators-only interaction limit SHALL be
renewed before expiry, with its expiration recorded and failure visible.

#### Scenario: Interaction limit approaches expiration

- **WHEN** the limit approaches expiration
- **THEN** a Core administrator renews it to the supported maximum or an
  approved narrow administration App does so and verifies readback
