## MODIFIED Requirements

### Requirement: Mission Control Tasks Are The Shared Staff Work Model

Mission Control operational follow-up work MUST use one shared staff task
model for contribution operations, donor notifications, receipt and statement
issues, provider failures, correction reviews, batch issues, and future
automation-created work.

Needs Attention MUST be a contribution-facing view over shared task and issue
state rather than a separate task model. Contribution-related tasks MUST link
back to the triggering contribution operation audit event when one exists.

Issue kinds left by a retired integration MUST NOT be listed in Needs
Attention as follow-up work. Their records MUST stay in place as history.

#### Scenario: A donor correction notification is blocked

- GIVEN a donor correction notification cannot send because the template is
  missing or invalid
- WHEN the platform creates follow-up work
- THEN it creates or requests a shared Mission Control task
- AND the task links to the contribution, notification decision, and operation
  audit event

#### Scenario: Contribution Needs Attention shows provider issues

- GIVEN contribution operations have failed provider actions or pending refunds
- WHEN finance staff opens Needs Attention
- THEN those issues appear through the shared Mission Control task/issue model
- AND the product does not invent a separate contribution-only queue

#### Scenario: A retired integration left failure records

- GIVEN open issue records exist for external CRM posting, which is retired
- WHEN staff open Needs Attention
- THEN those records are not listed as follow-up work
- AND the records are not deleted
