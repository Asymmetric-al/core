## Purpose

Identify GitHub repository targets without leaking transport credentials or
changing the accepted team contribution workflow's attribution requirements.

## ADDED Requirements

### Requirement: Repository remote parsing preserves supported transports

The shared remote parser SHALL return only an owner/repository slug for an exact
`github.com` HTTPS URL, SSH URL, or SCP-style SSH remote. HTTPS and SSH default
ports SHALL be accepted; nondefault ports and other hosts or protocols SHALL be
rejected. Transport userinfo SHALL NOT appear in the returned slug.

#### Scenario: Credentialed HTTPS remote with an explicit default port

- **WHEN** a GitHub HTTPS remote contains userinfo, an explicit port 443, or an
  uppercase hostname
- **THEN** parsing SHALL return the same owner/repository slug as the canonical
  credential-free HTTPS remote
- **AND** the pre-push child environment and provider query target SHALL NOT
  contain those transport credentials

#### Scenario: Existing SSH transports

- **WHEN** a remote uses `git@github.com:owner/repository.git` or an
  `ssh://git@github.com/owner/repository.git` URL with no port or default port 22
- **THEN** parsing SHALL preserve the correct owner/repository slug

### Requirement: Malformed repository targets fail closed

The parser SHALL reject query or fragment markers, nondefault ports, whitespace
or control characters inside a remote, backslashes, empty or extra path segments,
dot-segment paths, and percent-encoded repository syntax. URL normalization SHALL
NOT transform a malformed original path into an accepted repository slug.

#### Scenario: Query, fragment or encoded path resembles a repository

- **WHEN** a remote adds a query/fragment marker or encodes repository separators
- **THEN** parsing SHALL return no repository target

#### Scenario: Dot segments would normalize into a repository

- **WHEN** a URL path contains additional dot segments that URL parsing would
  normalize away
- **THEN** parsing SHALL reject the original path

### Requirement: Target parsing does not alter attribution authority

The parser correction SHALL preserve the merged team contribution workflow's
exact identity registry, forbidden identities, event actor or verified signer
proof, inherited-history boundaries, full commit scopes and protected integration
requirements. It SHALL NOT change local identity or authentication configuration.

#### Scenario: Correct repository target lacks identity proof

- **WHEN** a supported remote parses successfully but a checked registered
  identity lacks its required authenticated actor or signer proof
- **THEN** the existing attribution verifier SHALL continue to reject that claim
- **AND** neither credentials in a URL nor prior PR ownership SHALL grant proof
