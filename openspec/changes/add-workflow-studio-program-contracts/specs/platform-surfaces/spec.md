<!-- Generated from docs/prds/workflow-studio/contracts/requirements.json by tools/render.py. -->

## ADDED Requirements

### Requirement: Authenticated Participant Journey Experience

The platform SHALL provide an authenticated, purpose-scoped My Journey experience for applicants and other approved workflow participants, implemented within an existing application surface without creating a second staff console. A participant mode in the missionary application MUST NOT imply missionary, donor, financial, or unrestricted CRM privileges. Mission Control remains the authoring, administration and operational-depth owner. Public entry forms may originate on the tenant website; private journey records and evidence MUST NOT become public content. Phase 34 MUST supply shared mechanisms and Phase 41 MUST supply application-specific accepted records and journey behavior. A predecessor admission model unable to represent the private purpose MUST gain an explicit compatible owner-approved successor before implementation; public-only anonymous access MUST NOT be widened.

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
