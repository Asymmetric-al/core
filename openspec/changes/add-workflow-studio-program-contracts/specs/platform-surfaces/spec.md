<!-- Generated from docs/prds/workflow-studio/contracts/requirements.json by tools/render.py. -->

## ADDED Requirements

### Requirement: Authenticated Participant Journey Experience

The platform SHALL provide an authenticated, purpose-scoped My Journey experience for applicants and other approved workflow participants, implemented within an existing application surface without creating a second staff console.

Every clause in `openspec/contracts/platform-surfaces.md#contract-7e18ff4f714f8cc8ecd3` MUST apply without exception.

#### Scenario: Applicant follows their next step

- GIVEN a person has explicitly authorized access to their application journey
- WHEN they open My Journey in participant mode
- THEN they see permitted tasks, milestones, requested evidence and source-safe communications
- AND they cannot enumerate staff graphs, other candidates, confidential assessments, care cases, or unrelated missionary/donor information

#### Scenario: One person holds several roles

- GIVEN a person is both a donor and an applicant in the same tenant
- WHEN they navigate between self-service experiences
- THEN each experience resolves its own current permissions and source projections
- AND neither role implicitly grants privileges belonging to the other
