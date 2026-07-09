# Delta for Platform Surfaces And User Experience Intent

## MODIFIED Requirements

### Requirement: Mission Control As The Staff Operations Surface

Mission Control SHALL be the main staff operations console and the most heavily
used daily surface in the platform. It MUST serve as the control center for the
organization's operations and the conceptual home of operational depth.

Mission Control MUST carry the deepest staff capabilities across CRM,
contributions, Support Hub, communications, reporting, content administration,
documents, mobilization, automations, and tenant configuration. Support Hub
SHALL be conceptually anchored in Mission Control as the staff home for
support conversations and inbound email routing.

Mission Control MUST NOT be treated as optional back-office overflow. When a
capability carries organization-wide operational depth, staff control,
exception-handling, or administrative truth, its first conceptual home SHALL be
Mission Control.

#### Scenario: A new capability carries operational depth

- GIVEN a feature includes staff controls, organization-wide visibility,
  exception handling, reporting impact, or administrative setup
- WHEN an agent decides where that feature belongs first
- THEN Mission Control is the primary surface unless product truth is
  explicitly changed in OpenSpec
- AND other surfaces may expose role-appropriate slices without becoming the
  conceptual home of that depth

## ADDED Requirements

### Requirement: Outbound Communications Are A Governed Platform Channel

Outbound communications — email today, additional channels as adopted — SHALL
be treated as a governed channel of the connected platform rather than as a
fifth surface.

Communications that reach donors, missionaries, or the public MUST use shared
product language, honest states, and tenant-controlled templates and policy,
and they MUST reflect the same underlying truth as the surfaces they reference.

#### Scenario: An outbound email would diverge from surface truth

- GIVEN an outbound communication describes gift, support, or account state
- WHEN it is composed or sent
- THEN it reflects the same operational truth the platform surfaces show
- AND it does not soften, overstate, or contradict the real state for the sake
  of nicer copy
