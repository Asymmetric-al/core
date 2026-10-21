# eve-admin-auth-session-ownership Specification

## Purpose

Define verified current-admin and accountable service identity for Eve, plus
fail-closed user/tenant ownership across durable sessions and governance
artifacts before the admin mount.

## Requirements

### Requirement: Eve Acts As The Current Admin Identity In Mission Control

For admin UI requests, Eve MUST act as the **authenticated current admin user**, so its product actions inherit that user's **tenant, role, and permissions**.

Every clause in `openspec/contracts/eve-admin-auth-session-ownership.md#contract-d83238b45dabd4a8e9fc` MUST apply without exception.

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

Background jobs, schedules, and system-initiated work MUST run under a **distinct service identity** that carries **explicit initiator metadata** naming the accountable human or trigger.

Every clause in `openspec/contracts/eve-admin-auth-session-ownership.md#contract-f06ba04c2843f3387935` MUST apply without exception.

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

Tenant and user MUST be derived **only from verified route or admin session context**.

Every clause in `openspec/contracts/eve-admin-auth-session-ownership.md#contract-ad6fbe0a96f3141eda57` MUST apply without exception.

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

Eve MUST enforce **user and tenant ownership** on every session and governance-artifact access path — **session create, continue, stream, approval response, memory read/write, audit read, and replay/debug artifact access**.

Every clause in `openspec/contracts/eve-admin-auth-session-ownership.md#contract-f1307ebb46ad698f674e` MUST apply without exception.

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

### Requirement: The Auth Boundary Grants No New Authority And Keeps Release Disabled

The auth/session-ownership implementation MUST NOT widen Eve's authority, bypass #417 protected-area, production-write, or approval limits, or bypass #418 emergency-off precedence.

Every clause in `openspec/contracts/eve-admin-auth-session-ownership.md#contract-b77bac5cab982504be38` MUST apply without exception.

#### Scenario: The auth gate does not override higher-authority constraints

- GIVEN the auth and session-ownership boundary is in place and every kill switch is cleared
- WHEN Eve evaluates an action that touches a protected area or requires approval
- THEN the #417 protected-area and approval rules and #418 emergency-off precedence still apply and can block it
- AND the auth boundary never widens Eve's authority beyond the acting identity

#### Scenario: Auth is implemented while operational release stays off

- GIVEN route auth and ownership metadata are installed
- WHEN a reviewer exercises the Eve runtime
- THEN verified identity and ownership checks run server-side before access
- AND no live model/provider, operational capability, app mount, or release is enabled
