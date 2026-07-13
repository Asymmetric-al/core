# Delta for Platform System Boundaries

## ADDED Requirements

### Requirement: Mission Control Tasks Are The Shared Staff Work Model

Mission Control operational follow-up work MUST use one shared staff task
model for contribution operations, donor notifications, receipt and statement
issues, CRM post failures, provider failures, correction reviews, batch issues,
and future automation-created work.

Needs Attention MUST be a contribution-facing view over shared task and issue
state rather than a separate task model. Contribution-related tasks MUST link
back to the triggering contribution operation audit event when one exists.

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

### Requirement: Mission Control Automations Are Declarative And Guarded

Mission Control automations MUST be declarative definitions, not arbitrary
user-supplied code. Only users with `automation:manage` MAY create, edit,
activate, deactivate, or delete automations.

Automation activation MUST require preview, test run, and activity log setup.
Automations MUST call shared domain services rather than writing contribution,
CRM, task, or donor notification records directly where a service exists.
Donor-facing emails from automations MUST use Email Studio templates and
notification policy.

#### Scenario: Admin activates an automation

- GIVEN an admin with `automation:manage` creates an automation
- WHEN the admin activates it
- THEN the platform requires a preview and test run first
- AND the automation definition is stored as declarative trigger, condition,
  action, run-mode, reviewer, failure-policy, and activity-log data

#### Scenario: Automation wants to send a donor email

- GIVEN an automation action would send donor-facing email
- WHEN the action is planned or executed
- THEN it uses the contribution notification module and Email Studio template
  policy
- AND it does not call Resend directly
