# Delta for Platform Boundaries

## MODIFIED Requirements

### Requirement: Mission Control Automations Are Declarative And Guarded

Mission Control automations MUST be declarative definitions, not arbitrary user-supplied code.

Every clause in `openspec/contracts/platform-boundaries.md#contract-588ec64dc7657e66e154` MUST apply without exception.

#### Scenario: Admin activates an automation

- GIVEN an admin with `automation:manage` creates an automation
- WHEN the admin activates it
- THEN the platform requires a preview and test run first
- AND the automation definition is stored as declarative trigger, condition,
  action, run-mode, reviewer, failure-policy, and activity-log data

#### Scenario: Automation wants to send a donor email

- GIVEN an automation action would send donor-facing email
- WHEN the action is planned or executed
- THEN it invokes a Live system-message contract and Delivery Plan through the
  contract's exact code-owned producer binding
- AND the producer-owned event, source fence, recipient resolver, fact adapter,
  and action issuer all validate
- AND it submits one complete bounded plan occurrence through Phase 6's
  `compileAndReleaseCommunicationPlanOccurrence`, including one/zero-member
  results, rather than calling a private child-intent primitive, Resend, or a
  communication-record writer directly

#### Scenario: A Delivery Plan needs general workflow behavior

- GIVEN a tenant request requires arbitrary enrollment, branching, waits,
  tasks, or source-record mutations
- WHEN staff configures System Messages
- THEN those controls are unavailable in the Delivery Plan
- AND the behavior must use the governed Phase 34 automation model instead
