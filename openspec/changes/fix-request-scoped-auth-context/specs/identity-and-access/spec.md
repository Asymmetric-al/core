# Identity and access change

## MODIFIED Requirements

### Requirement: Identity, Tenant, And Role Resolve Server-Side

The platform MUST establish a request's identity, tenant, and role server-side
from a validated session, and the client MUST NOT assert any of them. Protected
operations MUST require a validated Supabase session (the server validates the
user, not an unverified token or cookie claim), and the server MUST resolve the
acting profile, tenant, and role — including staff subrole and tenant
memberships — before running the operation.

The role model is a fixed set: donor, missionary, staff, admin, and
super_admin, with staff subroles (finance, mobilizer, development, HR, member
care) refining staff. Portal-routing aliases are presentation only and MUST NOT
be treated as authorization.

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

Current-user identity and authorization resolution MUST use the validated caller's authority and MUST NOT depend on the presence of an administrative service credential. Failure to read the profile or active tenant memberships MUST deny protected access; it MUST NOT authorize through a profile-role fallback when membership resolution is unavailable.

#### Scenario: CMS administrative credentials are configured

- WHEN a valid user signs in while an unrelated administrative service credential is configured
- THEN current-user profile and membership resolution uses the validated caller's authority
- AND the result is the same as without that administrative credential

#### Scenario: Authorization data cannot be resolved

- WHEN profile or membership resolution reports an error
- THEN the server denies protected access
- AND it does not fall back to a privileged profile role

#### Scenario: Membership data is outside the acting tenant

- WHEN a membership does not match the acting tenant or is inactive
- THEN it grants no role or capability in the resolved context
