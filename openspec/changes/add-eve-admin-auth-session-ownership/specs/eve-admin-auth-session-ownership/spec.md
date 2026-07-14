# Delta for Eve Admin Auth and Session Ownership

## ADDED Requirements

### Requirement: Eve Acts As The Current Admin Identity In Mission Control

For admin UI requests, Eve MUST act as the **authenticated current admin user**, so its product actions inherit
that user's **tenant, role, and permissions**. Eve MUST NOT act outside, or elevate beyond, the acting user's
tenant, role, or permissions. Every such admin action MUST be **audited under that acting identity** so the
organization can tell who initiated each operation; the audit-record shape itself remains #419's scope.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:67]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:71]

#### Scenario: An admin action inherits the current user's tenant, role, and permissions

- GIVEN an authenticated admin user issues an Eve action inside Mission Control
- WHEN Eve performs the product action
- THEN the action runs as that current admin identity and inherits its tenant, role, and permissions
- AND the action is audited under that identity

#### Scenario: Eve cannot elevate beyond the acting user

- GIVEN an admin user whose role lacks a permission for a requested action
- WHEN Eve evaluates the action on that user's behalf
- THEN Eve does not elevate beyond the user's role or permissions
- AND the action is denied or routed to approval per the higher-authority policy rather than self-elevated

### Requirement: Background Jobs Use A Service Identity With Explicit Initiator Metadata

Background jobs, schedules, and system-initiated work MUST run under a **distinct service identity** that
carries **explicit initiator metadata** naming the accountable human or trigger. System work MUST NOT be
attributed to a real admin user without a recorded initiator, so scheduled and system work stays accountable.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:377]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:74]

#### Scenario: A scheduled job records its initiator

- GIVEN a scheduled or system-initiated Eve job runs
- WHEN it acts
- THEN it runs under the service identity, not a real admin user
- AND it records explicit initiator metadata naming the accountable human or trigger

#### Scenario: System work is never silently attributed to an admin

- GIVEN system-initiated work with no recorded initiator
- WHEN identity is resolved for that work
- THEN it is not attributed to a real admin user
- AND the work is refused or held until an accountable initiator is recorded

### Requirement: Tenant And User Are Derived From Verified Session Context Only

Tenant and user MUST be derived **only from verified route or admin session context**. Tenant or user IDs
supplied by **prompts, model output, tool input, or remote responses MUST never be authority** and MUST be
ignored for identity resolution, so Eve never accepts a tenant or user identity that a prompt or tool claims.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:427]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:331]

#### Scenario: Tenant and user come from verified context

- GIVEN a request with verified route or admin session context
- WHEN Eve resolves the tenant and user
- THEN both are derived from that verified session context only

#### Scenario: A prompt-supplied tenant ID is ignored

- GIVEN a prompt, model output, tool input, or remote response asserts a tenant or user ID
- WHEN Eve resolves identity for the action
- THEN the asserted ID is not treated as authority and is ignored for identity resolution
- AND the verified session context remains the sole source of tenant and user

### Requirement: Session And Governance-Artifact Access Enforces User And Tenant Ownership

Eve MUST enforce **user and tenant ownership** on every session and governance-artifact access path —
**session create, continue, stream, approval response, memory read/write, audit read, and replay/debug artifact
access**. A request whose verified context does not own the target session or artifact MUST be denied, so a
user cannot access another tenant's or another user's durable session or artifacts. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:431]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:335]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:177]

#### Scenario: Continuing another user's session is denied

- GIVEN a durable session owned by one user in one tenant
- WHEN a different user or tenant tries to continue, stream, or read it
- THEN ownership enforcement denies the access
- AND no session content crosses the tenant or user boundary

#### Scenario: Approval, memory, audit, and replay access are ownership-checked

- GIVEN a request to respond to an approval, read or write memory, read audit, or access a replay/debug artifact
- WHEN Eve serves the request
- THEN it enforces that the verified context owns the target before serving
- AND access to another tenant's or user's approval, memory, audit, or replay artifact is denied

### Requirement: Ownership And Identity Are Enforced Server-Side And Fail Closed Before Admin Mount

Identity resolution and ownership enforcement MUST be **server-side** on verified context and MUST **fail
closed**: missing, unverifiable, or mismatched ownership MUST deny access rather than default open. This auth
gate MUST hold **before the admin UI mount** (#427/#428), and it MUST apply to the sessions the #425 runtime
hosts. [VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:168]

#### Scenario: Missing or mismatched ownership fails closed

- GIVEN a request whose ownership over the target session or artifact is missing or unverifiable
- WHEN enforcement runs
- THEN access is denied rather than defaulted open
- AND the denial is enforced server-side, not in client code

#### Scenario: The auth gate holds before any admin mount

- GIVEN the admin UI mount (#427/#428) has not yet been proven
- WHEN Eve session and governance-artifact access is exercised
- THEN auth and session-ownership enforcement already applies to the #425 runtime-hosted sessions
- AND admin UI is not exposed until this gate holds

### Requirement: The Auth Boundary Grants No New Authority And Introduces No Live Code

This change MUST only add the auth/session-ownership boundary as a spec/ADR contract. It MUST NOT widen Eve's
authority, MUST NOT bypass #417 protected-area/production-write/approval limits or #418 emergency-off
precedence, and the **release switch MUST stay off until auth is verified**. It MUST NOT introduce live auth
code, a session store, middleware, admin UI, or Supabase schema; and it MUST NOT redefine the audit-record
shape (#419), private-memory content (#422), approval/budget policy (#423), retention/replay (#424), or the
session-hosting runtime (#425). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

#### Scenario: The auth gate does not override higher-authority constraints

- GIVEN the auth and session-ownership boundary is in place and every kill switch is cleared
- WHEN Eve evaluates an action that touches a protected area or requires approval
- THEN the #417 protected-area and approval rules and #418 emergency-off precedence still apply and can block it
- AND the auth boundary never widens Eve's authority beyond the acting identity

#### Scenario: The change stays spec-only with the release switch off

- GIVEN this change is under review
- WHEN a reviewer inspects what it introduces
- THEN it adds only the spec/ADR contract, no live auth code, session store, middleware, admin UI, or schema
- AND the release switch stays off until auth is verified
