## ADDED Requirements

### Requirement: Pre-push verification isolates repository-local Git context

The pre-push coordinator SHALL evaluate the existing production guard with its original environment, then launch permitted verification with a cloned environment stripped of repository-local Git variables and numbered configuration overrides. It SHALL preserve unrelated environment and failure propagation without mutating caller state or bypassing verification.

#### Scenario: Temporary repository work remains isolated

- **GIVEN** a hook environment identifies the invoking repository
- **WHEN** permitted preflight runs a fixture inside a separate temporary repository
- **THEN** Git operates on that temporary repository and the invoking repository's configuration and index remain unchanged

#### Scenario: Guard and failures remain authoritative

- **WHEN** a push is blocked or an allowed preflight fails
- **THEN** a blocked push launches no preflight, a failed preflight blocks publication, and the original environment remains unchanged

#### Scenario: Numbered overrides do not cross the boundary

- **GIVEN** repository-local configuration count, key or value variables are present
- **WHEN** the preflight environment is prepared
- **THEN** those variables are absent from the child while unrelated process and authentication-helper settings remain intact
