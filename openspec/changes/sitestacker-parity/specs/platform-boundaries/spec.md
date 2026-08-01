# Delta for Platform Boundaries

## MODIFIED Requirements

### Requirement: Mission Control Automations Are Declarative And Guarded

Mission Control automations MUST be declarative definitions, not arbitrary
user-supplied code. Only users with `automation:manage` MAY create, edit,
activate, deactivate, or delete automations.

Automation activation MUST require a preview using stored synthetic mock facts, a non-authoritative test run, and activity log setup. Preview and test runs may produce only test, audit, and provider-operation evidence; they MUST NOT create business communication intents, events, or history records.
Automations MUST call shared domain services rather than writing contribution,
CRM, task, communication, or notification records directly where a service
exists. Any governed-message action, whether tenant-scoped or platform-scoped,
MUST invoke one Live Phase 17 system-message contract only through that
contract's exact code-owned trigger binding. Tenant scope MUST resolve its
tenant-published, contract-bounded Delivery Plan. Platform scope MUST resolve the
immutable Asym-owned fixed plan/version declared by the exact meaning-specific
platform profile and MUST NOT resolve tenant configuration. The producer-owned event, source
fence, recipient resolver, fact adapter, and action issuer MUST all validate
before recipient-specific intents enter the Phase 6 communication spine. The
action MUST NOT call Resend directly, select arbitrary templates, construct
recipients or protected actions outside that producer binding, or treat delivery
as business completion.

Phase 17 Delivery Plans MAY expose only fixed contract-declared message-step,
channel, delay, and escalation choices. They MUST NOT become a second automation
engine. Phase 34 remains responsible for arbitrary workflow enrollment, event
conditions, waits, branches, tasks, mutations, and workflow-run state.

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
