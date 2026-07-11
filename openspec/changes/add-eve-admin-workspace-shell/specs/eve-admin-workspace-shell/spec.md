# Delta for Eve Admin Workspace Operations Shell

## ADDED Requirements

### Requirement: The Eve Admin Workspace Is Operations-First

Mission Control's Eve workspace MUST be **operations-first**: chat MAY be available, but the **first screen**
MUST prioritize the observability panels — **active run summaries, approvals, recent actions, budgets,
failures, GitHub activity placeholders, eval health, memory, model policy, subagents, notifications, audit, and
emergency controls** — so an admin can see what Eve is doing before chatting with it.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:450]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:142]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:189]

#### Scenario: The first screen prioritizes operations, not chat

- GIVEN an admin opens the Eve workspace in Mission Control
- WHEN the first screen renders
- THEN it prioritizes active runs, approvals, recent actions, budgets, failures, GitHub activity, eval health, memory, model policy, subagents, notifications, audit, and emergency controls
- AND chat is available but is not the primary surface

#### Scenario: The workspace is observable before any chat

- GIVEN an admin wants to see what Eve is doing
- WHEN they view the workspace without starting a chat
- THEN the workspace already shows the active governance state across its panels

### Requirement: Every Panel Is Backed By Real Governance State, Not Mock Data

Every workspace panel MUST be **backed by real governance state** owned by the sibling slices — the governance
kernel (#418), audit (#419), kill switches (#420), model policy (#421), memory (#422), approval/budget (#423),
and retention/replay (#424). No panel MUST be backed by mock data, except **GitHub activity**, which MUST be an
**explicit placeholder** until the GitHub path lands.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:186]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:190]

#### Scenario: Panels read real governance state

- GIVEN the workspace renders its runs, approvals, budgets, audit, memory, model-policy, and retention panels
- WHEN each panel loads
- THEN it reads the real governance state owned by the corresponding sibling slice (#418–#424)
- AND no panel is backed by mock data

#### Scenario: GitHub activity is an explicit placeholder

- GIVEN the GitHub path has not yet landed
- WHEN the GitHub activity panel renders
- THEN it is shown as an explicit placeholder rather than mock activity
- AND it is not presented as real GitHub state

### Requirement: The Workspace Exposes Decision Summaries, Not Raw Hidden Reasoning

The workspace MUST expose **high-quality decision summaries** — action, evidence, alternatives, risk, policies,
approvals, and reversal or follow-up path — and MUST NOT expose **raw model reasoning or sensitive internals**,
so an admin understands why Eve acted without seeing hidden reasoning.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:446]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:178]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:193]

#### Scenario: A decision summary explains why Eve acted

- GIVEN Eve has taken an action visible in the workspace
- WHEN an admin inspects why it acted
- THEN the workspace shows a decision summary covering action, evidence, alternatives, risk, policies, approvals, and reversal or follow-up path
- AND it does not show raw model reasoning or sensitive internals

#### Scenario: Raw reasoning is never surfaced

- GIVEN a request to view an action's rationale
- WHEN the workspace renders it
- THEN it renders the decision summary only
- AND raw hidden reasoning and sensitive internals are not exposed

### Requirement: Admin Controls In The Workspace Are Role-Gated

The workspace's **admin controls MUST be role-gated**. Model-policy editing MUST be behind the **dedicated AI
settings permission**, and kill switches, budget overrides, and memory management MUST be gated to **authorized
admins**. A user lacking the required role MUST NOT be able to operate the control.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:192]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:473]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:191]

#### Scenario: Model-policy editing requires the AI settings permission

- GIVEN an admin without the dedicated AI settings permission
- WHEN they open the model-policy control
- THEN editing is denied or not offered
- AND only an admin holding that permission can edit model policy

#### Scenario: Emergency and budget controls require an authorized role

- GIVEN a user lacking the authorized-admin role
- WHEN they attempt to trigger a kill switch, override a budget, or manage memory
- THEN the control is denied
- AND the action does not take effect

### Requirement: The Workspace Surfaces And Triggers Governance Policy Without Redefining It

The workspace MUST **surface and let authorized admins trigger** the emergency controls (#420),
budgets/approvals (#423), model policy (#421), memory management (#422), retention view (#424), and audit view
(#419); it MUST render and control those policies and MUST NOT redefine their semantics. Full memory control —
**view, search, edit, delete, disable, category, scope, and change history** — MUST be surfaced over #422's
content. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:443]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:145]

#### Scenario: Triggering an emergency control invokes the owning slice

- GIVEN an authorized admin triggers a kill switch or budget override from the workspace
- WHEN the control fires
- THEN it invokes the kill-switch (#420) or approval/budget (#423) behavior those slices define
- AND the workspace does not redefine that switch or budget semantics

#### Scenario: The memory panel offers full control over #422's content

- GIVEN the memory management panel is open
- WHEN an authorized admin manages memory
- THEN it offers view, search, edit, delete, disable, category, scope, and change history over #422's content
- AND what memory stores and excludes remains #422's scope

### Requirement: The Workspace Shell Surfaces No Sensitive Or Donor Data

The workspace MUST surface **governance state and decision summaries only**. It MUST NOT surface **donor
details, payment data, raw records, table rows, secrets, or sensitive form values**, so the charter data
boundary holds at the render surface and autonomy does not weaken tenant safety, donor trust, money integrity,
or identity correctness. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:580]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:63]

#### Scenario: The shell renders governance state, not records

- GIVEN the workspace renders its panels
- WHEN a panel shows run, approval, audit, or budget state
- THEN it shows governance summaries only
- AND it does not surface donor details, payment data, raw records, table rows, secrets, or sensitive form values

#### Scenario: A panel cannot leak underlying sensitive records

- GIVEN governance state references an operational record
- WHEN the workspace displays it
- THEN it displays the governance summary or decision summary
- AND the underlying raw record, payment data, donor detail, or sensitive form value is not included

### Requirement: The Workspace Shell Grants No New Authority And Introduces No Live Code

This change MUST only add the workspace-shell boundary as a **spec/ADR contract**. It MUST NOT introduce **live
workspace UI, data fetchers, a governance schema, or Supabase schema**; it MUST **defer the admin-visible mount
to #428** behind the #426 auth gate; and the **release switch MUST stay off until verified**. It MUST NOT widen
Eve's authority, MUST NOT bypass #417 protected-area/approval limits or #418 emergency-off precedence, and MUST
NOT redefine the governance store (#418), audit record (#419), kill switches (#420), model policy (#421),
memory content (#422), approval/budget (#423), or retention/replay (#424).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:195]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

#### Scenario: The change stays spec-only with the mount deferred

- GIVEN this change is under review
- WHEN a reviewer inspects what it introduces
- THEN it adds only the spec/ADR contract, no live workspace UI, data fetchers, governance schema, or Supabase schema
- AND the admin-visible mount is deferred to #428 behind #426 auth, with the release switch off until verified

#### Scenario: The shell does not override higher-authority constraints

- GIVEN the workspace shell is defined and every kill switch is cleared
- WHEN Eve evaluates an action that touches a protected area or requires approval
- THEN the #417 protected-area and approval rules and #418 emergency-off precedence still apply and can block it
- AND the shell never widens Eve's authority
