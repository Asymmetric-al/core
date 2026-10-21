## ADDED Requirements

### Requirement: Authorized Work Continues to the Requested Boundary

Repository coding agents SHALL complete the requested outcome, including
relevant verification and fixes for failures caused by the change, within
the authorized scope. They SHALL continue routine, reversible local work
without requesting approval again when that work is already authorized.
This requirement MUST NOT expand task scope or execution permissions.

#### Scenario: Authorized implementation requires follow-through

- WHEN the user authorizes implementation of a change
- THEN the agent completes the requested outcome and relevant verification
- AND it fixes failures caused by that change within the authorized scope
- AND it preserves required repository gates, including required repeat checks
- AND it does not stop for approval at each routine, reversible local step

#### Scenario: A requested or authorization boundary is reached

- WHEN the user requested a planning or review boundary, or further action
  requires new authorization
- THEN the agent stops at that boundary
- AND completing the task does not authorize work beyond that boundary

#### Scenario: A blocker requires user input

- WHEN a genuine blocker cannot be resolved without user input
- THEN the agent reports the blocker and the input needed
- AND it stops the dependent action without claiming the task is complete
