# Identity And Access

## Purpose

Define the durable contract for who can do what: how the platform establishes
identity, tenant, and role from a validated session; how tenant isolation and
capability enforcement actually work in the shipped system; how sensitive
operations and secrets stay server-side; and why the demo bypass is impossible
in production. `platform-boundaries` states the durable trust intent; this
spec states the shipped enforcement that upholds it.

## Requirements

### Requirement: Identity, Tenant, And Role Resolve Server-Side

The platform MUST establish a request's identity, tenant, and role server-side from a validated session, and the client MUST NOT assert any of them.

Every clause in `openspec/contracts/identity-and-access.md#contract-ff4ce6b4558ae3584acc` MUST apply without exception.

#### Scenario: A protected operation runs

- WHEN a request reaches a protected server operation
- THEN the server validates the session and resolves the acting profile,
  tenant, role, and memberships before executing
- AND the operation uses that server-resolved context, not client-supplied
  identity, tenant, or role

#### Scenario: An unauthenticated request hits a protected route

- GIVEN no valid session exists and the demo bypass is not enabled
- WHEN the request reaches a protected route
- THEN the platform denies or redirects to authentication
- AND it does not fall through to another tenant's context

### Requirement: Tenant Isolation Is Enforced In Depth

Tenant isolation MUST be enforced so that no request reads or mutates data outside its own tenant and role scope.

Every clause in `openspec/contracts/identity-and-access.md#contract-ef4ef18d6b8f09f884c1` MUST apply without exception.

#### Scenario: A request tries to reach another tenant's data

- WHEN a request would read or mutate a record outside its tenant or role scope
- THEN the application-layer boundary denies it
- AND row-level security independently prevents the cross-tenant access as
  backup

#### Scenario: An internal table must not be publicly reachable

- GIVEN a backup or internal table that no role should read directly
- WHEN access is configured
- THEN public and authenticated access is revoked rather than left to policy
  gaps

### Requirement: Sensitive Actions Enforce Capabilities Server-Side

Sensitive and high-risk actions MUST resolve fine-grained capabilities server-side from the actor's role, staff subrole, and tenant memberships, and MUST deny on mismatch; UI hiding MUST NOT be treated as sufficient protection.

Every clause in `openspec/contracts/identity-and-access.md#contract-b17832f6692565948454` MUST apply without exception.

#### Scenario: Non-finance staff attempts a refund

- GIVEN a staff user whose resolved capabilities do not include the refund
  capability
- WHEN they attempt a refund action
- THEN the server denies it with an authorization error
- AND UI hiding is not treated as the protection

#### Scenario: A non-admin attempts to manage automations

- GIVEN a user without the automation management permission
- WHEN they attempt to create, edit, or activate an automation
- THEN the server rejects the action before any change is made

### Requirement: Sensitive Operations And Secrets Stay Behind The Server Boundary

Sensitive operations and secrets MUST stay behind the server-side boundary, as required by `platform-boundaries`.

Every clause in `openspec/contracts/identity-and-access.md#contract-02eb35fb111fae62bdbf` MUST apply without exception.

#### Scenario: A sensitive operation runs without the admin client

- GIVEN the privileged server data client is unavailable
- WHEN a sensitive operation is attempted
- THEN the platform fails closed and denies the operation
- AND it does not proceed with weaker access

#### Scenario: A tenant secret is requested by the browser

- WHEN client code would need a tenant payment key, webhook secret, or vendor
  credential
- THEN the secret stays server-side and only the safe, role-scoped result is
  returned
- AND the raw secret never appears in the browser, logs, or route responses

### Requirement: The Demo Auth Bypass Is Impossible In Production

The demo authentication bypass MUST be impossible in production regardless of
configuration. When the runtime is production, the bypass MUST be disabled even
if its environment flag is set, and it MUST only supply an identity when no
valid real session exists so a stale demo cookie cannot override a real user.

The bypass MUST be surface-scoped (donor, admin, missionary) and role-checked
against what the surface allows.

#### Scenario: The bypass flag is set in production

- GIVEN the runtime is production and the demo bypass flag is set
- WHEN a request is processed
- THEN the bypass stays disabled and the request follows normal authentication
- AND no demo identity is granted

#### Scenario: A demo session is used in a non-production surface

- GIVEN a non-production runtime with the demo bypass enabled and no real
  session
- WHEN a demo session cookie for that surface is present
- THEN the platform grants the surface-scoped, role-checked demo identity
- AND a later real session takes precedence over the demo cookie
