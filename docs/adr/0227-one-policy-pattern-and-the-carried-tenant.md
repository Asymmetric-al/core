# ADR-0227: One policy pattern, one selected assignment, and how each surface carries the tenant

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).
Two choices inside it are plan section 15.1 defaults taken under the
implementation record (D-06, D-08), not fresh owner rulings: the tenant travels
in the page address, and the capability names are as proposed.

This records target intent. It does not say that anything is built; see the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

Several parts of Core each hold their own answer to "which organization is this,
and what may this person do": the profile's tenant and role columns, the token's
tenant claim, the `super_admin` bypass and Payload's own roles. `authz.current_tenant_id()`
reads a token claim that no hosted database fills, so the claim-keyed policies
have never admitted anyone (audit A19), while about 35 tables admit on membership
or ownership alone and would hand a person in two organizations both
organizations' rows (NR-01). ADR-0214 keeps one global credential per person, and
the accepted identity-and-access contract requires one validated context per
request ("Capability Aggregation Uses One Validated Context").

## Decision

1. **Authority is one live membership.** A login proves who someone is and
   nothing more. Authority is an active, unrevoked row in `authz.memberships`.
   Tenant administration is a flag on a staff membership; every other authority
   is a capability from the code registry (ADR-0210), granted through role
   bundles. The profile's tenant and role columns, the token tenant claim and the
   `super_admin` bypass go.
2. **Each request acts under exactly one assignment.** The surface fixes the role
   class: Mission Control and Web Studio act on staff rows, the missionary
   workspace on the missionary row, the donor portal on the donor row. Every
   signed-in request names its tenant in one request header and its assignment
   (the membership row's ID) in a second. With no assignment header, a caller who
   holds exactly one live row in that tenant acts under it, and a caller who holds
   more than one passes no check. A person's other rows add nothing.
3. **One policy pattern.** Every policy for signed-in users on a tenant table
   requires the row's tenant to equal the request's active tenant, plus its
   role-class or own-row condition, each lookup running once per statement. An
   own-row branch is bound to its class. `authz.current_tenant_id()` stops reading
   the token claim and returns the tenant named in the request header only when
   the caller holds a live membership there and the tenant is active. A request
   that names no tenant returns nothing.
4. **Policies that switch on are reviewed first.** Before the helper is
   repointed, an activation review lists each policy that would start admitting
   people, and write grants on audit and governed tables are revoked in the same
   migration.
5. **How each surface carries the tenant.** The public website resolves it from
   the request host through a verified Site domain; the donor portal from its
   verified host. Mission Control and the missionary workspace carry it as the
   first path segment, the tenant's ID in canonical lower-case UUID form,
   optionally followed by `~` and a staff sub-role for a person with several staff
   rows; the proxy strips it and passes it to the render in a header. Page code
   calls the app's own API through one shared fetch wrapper that sends both
   headers. The browser data layer is scoped per document to the person, the
   tenant and the assignment; changing organization is a full document load.
   Jobs and webhooks derive the tenant from stored rows (ADR-0224).
6. **Web Studio is the one stated exception.** Payload's screens and REST calls
   cannot carry an argument, so the tenant and the chosen membership travel in a
   signed, HttpOnly cookie scoped to `/web-studio`, with Payload's REST routes
   mounted under `/web-studio/api`. Two tabs in different organizations are not
   supported inside Web Studio. Each page carries the tenant it was rendered for,
   and a save, upload or publish whose tenant differs from the cookie is refused
   with a prompt to reload. ADR-0174 clause 7 is amended to record this.
7. **What the database does not check, stated plainly.** Row isolation inside
   `cms` stays in Payload's access functions, through one `tenantScoped()`
   factory, an actor port and a service port, with the runtime role confined to
   `cms`. The database also cannot verify which Site a public gift arrived on,
   that publish-fulfilment content is the serialized form of the versions the
   intent names, or that an assistant's prepared effect waited for approval.
8. **Realtime and Storage.** The seven tables in the Realtime publication leave
   it, because a subscription would need a policy that ignores the active tenant.
   Storage policies on buckets that signed-in users reach directly check live
   membership in the tenant named in the object path.

## Consequences

- A requested tenant only narrows. The database repeats the membership check, so
  a forged request can at most select a tenant where the caller already holds a
  membership or, from WP10, a live support grant (ADR-0228).
- Every signed-in page of the two staff apps moves under the tenant segment. The
  fallback, moving the pages under a dynamic segment, is taken only if the thin
  proof TP5 shows the proxy rewrite breaks navigation or prefetching.
- The cheaper alternative, one signed cookie for every staff surface, remains an
  owner option that would need a further amendment to ADR-0174.
- An omitted condition in Payload access code could expose one tenant's CMS rows
  to another tenant's staff. Role confinement does not prevent that. The
  mitigations are the factory, the two ports, the override inventory, two-tenant
  tests, and the fact that the public never reads `cms` (plan decision 2).

## Source

- [Plan, section 5.1](../audits/core-crm-cms-database-target-architecture.md#51-authentication-and-authority),
  [section 5.2](../audits/core-crm-cms-database-target-architecture.md#52-choosing-the-tenant),
  [section 5.3](../audits/core-crm-cms-database-target-architecture.md#53-what-enforces-the-boundary-by-caller),
  [section 5.4](../audits/core-crm-cms-database-target-architecture.md#54-policies-and-commands)
  and decision 2 in [section 11.3](../audits/core-crm-cms-database-target-architecture.md#113-reasoning-on-the-decisions-that-mattered-most)
- Work packages WP2a, WP2b and WP2c, thin proofs TP1 and TP5
- Related: [ADR-0174](0174-single-staff-access-authority-and-governed-engine-diagnostics.md),
  [ADR-0210](0210-code-authoritative-capability-foundation.md),
  [ADR-0214](0214-path2-tenant-isolation-with-shared-native-credential.md),
  [ADR-0224](0224-caller-token-server-lanes-and-sql-commands.md)
