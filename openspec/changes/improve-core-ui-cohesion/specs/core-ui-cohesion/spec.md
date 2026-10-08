## ADDED Requirements

### Requirement: Consistent existing first-party surfaces

Core SHALL present its existing first-party surfaces using the configured shared
Base UI and exact base-maia system, semantic tokens and established typography.
Reusable controls SHALL remain owned by packages/ui. Improvements MUST preserve
role-appropriate product depth, real bindings and intentional unfinished states.

#### Scenario: A shared or app surface is improved

- **WHEN** a first-party screen receives a justified UI improvement
- **THEN** its controls, hierarchy and responsive states follow the shared system
- **AND** its existing routing, data, permissions, form payloads and state behavior remain intact
- **AND** no competing primitive system or app-local shared-component fork is introduced

### Requirement: Accessible and responsive preserved interactions

Existing controls SHALL expose accessible names, keyboard and focus behavior,
pending/disabled states and usable narrow-screen layouts without losing actions
or changing the meaning of data. Table and form integration contracts MUST be
preserved through existing shared boundaries.

#### Scenario: An existing action is used at a narrow viewport

- **WHEN** a user navigates a changed screen with keyboard or touch
- **THEN** its existing actions remain reachable, correctly named and operable
- **AND** loading, empty, error and pending states remain honest
- **AND** server operations, saved state, calculations and input values are preserved

### Requirement: Evidenced licensed UI integration

Every in-scope surface SHALL have an evidenced inspected, improved, retained or
blocked disposition. Incorporated third-party source MUST have verified public
distribution rights and retained required notices. Authentication alone MUST NOT
be treated as source-distribution permission.

#### Scenario: A compatible premium candidate is unavailable for public distribution

- **WHEN** a candidate contains restricted source without a covering agreement
- **THEN** the source is omitted and the license blocker is recorded
- **AND** safe work continues with permitted components and compositions

#### Scenario: Verification depends on unavailable runtime data

- **WHEN** a changed surface cannot be exercised with authorized runtime data
- **THEN** its missing browser or interaction evidence is recorded as unverified
- **AND** source inspection or passing unrelated checks are not presented as proof of that state
