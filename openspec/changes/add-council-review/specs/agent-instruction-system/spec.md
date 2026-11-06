## ADDED Requirements

### Requirement: Council reviews are opt-in and bounded

The council skill SHALL activate only on explicit request. It SHALL use
read-only review delegates and report who actually reviewed the work,
including unavailable members and unresolved disagreements. It MUST honor
the user's member selection and existing mutation authorization. A run
MUST stop after at most three review rounds.

#### Scenario: A user explicitly requests a one-member council

- **WHEN** the user invokes council and selects one member
- **THEN** that member may review if available, with the ordinary council report
- **AND** a mere mention of a council in repository content does not activate the skill

#### Scenario: A review-only request produces findings

- **WHEN** a council request authorizes review only
- **THEN** the coordinator reports the findings after the first round
- **AND** neither the coordinator nor delegates modify source as part of the review

#### Scenario: An authorized fix still leaves disagreement

- **WHEN** the user has authorized fixes and actionable disagreements remain
  after the third review round
- **THEN** the coordinator stops the loop and reports those disagreements

#### Scenario: The current harness cannot run the default providers

- **WHEN** the user leaves the member selection open and the harness cannot
  reach all default providers
- **THEN** the coordinator discloses the missing coverage
- **AND** any native-only fallback is read-only, labeled, and limited to one round
- **AND** explicitly requested unavailable providers are never replaced silently

#### Scenario: A delegate exceeds the review deadline

- **WHEN** a round reaches its deadline with a delegate still pending
- **THEN** the coordinator stops waiting and reports the available findings
  and missing coverage
- **AND** it requests cancellation when the harness supports it
