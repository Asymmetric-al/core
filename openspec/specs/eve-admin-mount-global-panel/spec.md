# eve-admin-mount-global-panel Specification

## Purpose

Define the compatibility, authentication, data-minimization, and authority
boundaries for exposing the isolated Eve runtime through an admin-only global
Mission Control panel.

## Requirements

### Requirement: The Admin Mount Uses The Eve Next.js Integration Only After Compatibility Is Proven

The admin mount MUST use Eve's Next.js integration **only after compatibility with the repo's installed Next.js
version is proven, or after the planned Next.js 16.3 stable rollout is validated**; otherwise the mount MUST be
**explicitly blocked** on that rollout. The installed version is `next` **16.2.6** (not 16.3), so compatibility
MUST be proven against 16.2.6 or the mount stays blocked. The Eve runtime MUST remain a **dedicated,
Node-isolated workspace package**, and if Eve requires a newer Next.js release than the repo has installed, the
Next.js upgrade MUST be treated as a **separate prerequisite**, not folded into this mount.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:203]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:370]
[VERIFIED-REPO: package.json:169]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:644]

#### Scenario: Compatibility is proven against the installed Next.js version

- GIVEN the repo has `next` 16.2.6 installed and the 16.3 rollout is not yet stable
- WHEN the admin mount is considered for enablement
- THEN it is enabled only after compatibility with 16.2.6 is proven, or it is explicitly blocked on the stable 16.3 rollout
- AND a newer-Next.js requirement is handled as a separate prerequisite, not bundled into this mount

#### Scenario: The Eve runtime stays a Node-isolated workspace package

- GIVEN Eve has distinct Node and dependency needs
- WHEN the admin mount is prepared
- THEN Eve runs as a dedicated workspace package with its Node needs isolated before mounting
- AND the repo's broader Node baseline is not changed by this mount

### Requirement: A Global Eve Panel Is Available Across Mission Control

A **lightweight global Eve panel** MUST be available across Mission Control so that an admin can **ask for help
from any admin page**. The panel MUST be a global surface, not tied to a single route.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:150]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:455]

#### Scenario: An admin can invoke Eve from any admin page

- GIVEN an admin is on any Mission Control page
- WHEN they open the global Eve panel
- THEN the panel is available on that page
- AND the admin can ask Eve for help without leaving the page

### Requirement: The Global Panel Receives Basic Page Context Only

The global panel MUST receive **basic page context only**: **route, page identity, selected tenant or org, and
safe UI state**. It MUST NOT **automatically receive** table rows, donor details, payment data, raw form
values, or sensitive records. Basic page context lets Eve know where the admin is without ingesting record
contents. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:153]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:455]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:205]

#### Scenario: The panel is fed route, page identity, tenant, and safe UI state

- GIVEN the global panel is open on an admin page
- WHEN the page context is passed to the panel
- THEN it receives route, page identity, selected tenant or org, and safe UI state only
- AND it does not automatically receive table rows, donor details, payment data, raw form values, or sensitive records

### Requirement: The Mount And Panel Never Silently Send Raw Or Sensitive Data

The mount and panel MUST NOT **silently send** raw records, payment data, donor details, table rows, or
sensitive form values. Global panel tests MUST verify **both** that basic page context is included **and** that
raw records, payment data, donor details, table rows, and sensitive form values are **not** silently included,
so the charter data boundary holds at this admin-visible surface.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:207]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:582]

#### Scenario: Sensitive data is never sent silently

- GIVEN an admin page contains donor details, payment data, table rows, or sensitive form values
- WHEN the global panel receives page context
- THEN none of that raw or sensitive data is sent silently to the panel
- AND only route, page identity, selected tenant or org, and safe UI state cross the boundary

#### Scenario: Panel tests assert the boundary in both directions

- GIVEN the global panel test suite runs
- WHEN it exercises the page-context feed
- THEN it verifies basic page context is included
- AND it verifies raw records, payment data, donor details, table rows, and sensitive form values are not silently included

### Requirement: The Mount Is Gated By Verified Session Auth And Enforces Session Ownership

The admin mount MUST be **gated by the #426 admin auth boundary**: tenant and user MUST derive from **verified
session context only** — never from prompts, model output, or tool input — and Eve **session create, continue,
and stream** access through the mount MUST **enforce ownership** so a user cannot access another tenant's or
user's durable session. The mount surfaces and inherits that auth boundary and MUST NOT redefine it.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:331]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:335]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]

#### Scenario: Tenant and user come from verified session context

- GIVEN a request reaches Eve through the admin mount
- WHEN the mount resolves tenant and user
- THEN it derives them from verified session context only
- AND it never accepts tenant or user IDs from prompts, model output, or tool input

#### Scenario: Session access enforces ownership

- GIVEN a user attempts to create, continue, or stream an Eve session through the mount
- WHEN the mount authorizes the access
- THEN it enforces ownership per the #426 auth boundary
- AND a user cannot access another tenant's or user's durable session

### Requirement: The Mount Exposes The #427 Shell On The #425 Runtime Without Redefining Them

The mount MUST **expose the #427 operations-first workspace shell** and **run on the #425 standalone Eve
runtime**; it renders and hosts them and MUST NOT **redefine** the shell's panel set, decision-summary rule, or
role-gating (#427), nor the runtime's workspace-package or model-policy integration (#425). The global panel is
a lightweight companion to that shell, not a re-implementation of it.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:181]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:155]

#### Scenario: The mount hosts the shell and runtime it depends on

- GIVEN the admin mount is enabled behind the #426 auth gate
- WHEN Mission Control loads the Eve workspace and global panel
- THEN it exposes the #427 operations-first shell running on the #425 standalone runtime
- AND it does not redefine the shell's panels, decision-summary rule, role-gating, or the runtime's contract

### Requirement: The Mount And Panel Grant No New Authority

The live mount and global panel MUST remain a **HITL** surface, and the **release switch MUST stay off until
verified**. The panel MUST NOT add live tools, provider credentials, production data fetchers, or Supabase
schema. It MUST NOT widen Eve's authority, MUST NOT
bypass #417 protected-area/approval limits, #418 emergency-off precedence, or the #426 auth gate, and MUST NOT
redefine the #425 runtime, #426 auth boundary, #427 shell, or the #418–#424 governance slices.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:195]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

#### Scenario: The mounted panel stays HITL with the release switch off

- GIVEN this change is under review
- WHEN a reviewer inspects what it introduces
- THEN it adds no live tools, provider credentials, production data fetchers, or Supabase schema
- AND it remains a HITL surface with the release switch off until governance, auth, audit, evals, protected-area policy, kill switches, and rollback paths are verified

#### Scenario: The mount does not override higher-authority constraints

- GIVEN the mount and panel are defined and every kill switch is cleared
- WHEN Eve evaluates an action that touches a protected area or requires approval
- THEN the #417 protected-area and approval rules, #418 emergency-off precedence, and #426 auth gate still apply and can block it
- AND the mount never widens Eve's authority
