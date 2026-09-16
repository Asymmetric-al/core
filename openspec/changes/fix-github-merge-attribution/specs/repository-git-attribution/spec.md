## Purpose

Keep repository attribution truthful while recognizing verified GitHub-hosted
integration merges without changing local developer identities or Git history.

## ADDED Requirements

### Requirement: Hosted merge recognition requires complete provenance

The attribution verifier SHALL recognize a GitHub-created integration merge
only when live evidence from the canonical Core repository proves all of the
following: the exact local commit SHA, raw author and committer identities,
two ordered parents, a valid GitHub-produced signature with the verified
`web-flow` signer, an existing trusted author account/email association, and
a closed merged pull request whose merge SHA and base/head SHAs match that
commit and its ordered parents. The pull request SHALL target protected
`develop` or `production` in the canonical repository and SHALL have an
existing trusted merger. Account checks SHALL bind logins to immutable numeric
GitHub account IDs.

#### Scenario: Existing protected integration merge

- **WHEN** a local checkout inherits a two-parent GitHub merge with complete
  matching signature, identity, pull-request, parent, and protected-branch proof
- **THEN** attribution SHALL accept the hosted merge without rewriting history
  or changing the configured local identity
- **AND** the merge SHALL remain eligible after the integration branch advances

#### Scenario: Signed commit lacks integration provenance

- **WHEN** a signed commit has no exact merged canonical pull request, mismatched
  parent SHAs, an untrusted merger, or an unprotected or unsupported destination
- **THEN** the hosted-merge exception SHALL fail

#### Scenario: Account association does not prove the platform signer

- **WHEN** a commit claims the GitHub committer identity but its signature is
  invalid, not produced by GitHub, or has a different signer login or account ID
- **THEN** the hosted-merge exception SHALL fail even if the email resolves to
  the `web-flow` account

### Requirement: Hosted aliases do not expand ordinary commit identities

Ordinary commits and local Git configuration SHALL retain the existing name,
email, and forbidden-identity restrictions. The `GitHub <noreply@github.com>`
committer identity SHALL be permitted only with complete hosted-merge proof.
The `ricky` author alias SHALL be permitted only with that proof and the exact
`116130409+II-ricky-bobby-II@users.noreply.github.com` email bound to
`II-ricky-bobby-II` account ID `116130409`.

#### Scenario: Alias used in an ordinary or local identity

- **WHEN** local configuration or an ordinary commit uses `ricky` or the
  GitHub platform committer identity
- **THEN** the original strict attribution checks SHALL reject it

#### Scenario: Cross-wired trusted identities

- **WHEN** a hosted merge pairs an allowed email with another account, reuses
  a trusted login with another numeric ID, or uses an unapproved display-name alias
- **THEN** the hosted-merge exception SHALL fail

#### Scenario: Forbidden identities remain forbidden

- **WHEN** a checked local identity or commit uses `codex@example.com` or the
  checked GitHub identity resolves to `abiatarprado`
- **THEN** the hosted-merge exception SHALL NOT override the rejection

### Requirement: Unavailable proof cannot activate the exception

The verifier SHALL fail the hosted-merge exception when required online proof
is unavailable, malformed, incomplete, or inconsistent with the local commit.
It SHALL report the failure without disclosing credentials. Normal local and
ordinary checks SHALL retain their existing behavior; hooks and the required
preflight stages SHALL remain enabled.

#### Scenario: GitHub metadata unavailable

- **WHEN** a candidate hosted merge cannot obtain required commit, signature,
  pull-request, or branch-protection metadata
- **THEN** attribution SHALL return failure with an actionable explanation
- **AND** it SHALL NOT silently accept the candidate or suggest changing identity

#### Scenario: Ordinary identity verification

- **WHEN** the checked commit and local identities satisfy the existing ordinary
  rules without requiring hosted-merge recognition
- **THEN** their existing verification behavior SHALL be preserved
