# ADR-0214: Path 2 Tenant isolation with a shared native credential

**Status:** Accepted (Phase 4 A7/A8; Phase 25 IC01/IC02).

This records accepted target intent for AL-504, not implementation, native
qualification, live isolation or activation evidence.

## Context

One supporter may give to multiple organizations. Shared native authentication
must not make those organizations' donor records, claims, contacts or protected
purposes visible to one another. The selected single Supabase project has a
global-unique email constraint; literal separate native credentials for the
same email per Tenant are not a supported promise of this scope.

## Decision

Use Path 2: a shared native credential with complete Tenant data isolation.
Each Tenant owns separate donor records, memberships and claims. No cross-Tenant
linking, merge, dedupe or donor single-view is permitted. The credential
authorizes nothing on its own. Each protected operation resolves the appropriate
trusted Tenant context and independently admits its exact subject, purpose and
current source through Phase 12 and the Phase 3 projection boundary. Record-only
or document grants do not expose history, wallet or lists; neither a profile
role nor an unrelated active hat supplies fallback authority.

Identity surfaces use the current verified Tenant Donor Portal Host and Tenant
Donor Account Brand. Site/default/referrer context cannot select identity or
access, and no donor portal enumerates other Tenants. Shared credential changes
retain the existing Phase 12 security/currentness owner without propagating
contacts or revealing other organizations. Native G01 and exact provider gates
remain independently outstanding, including new email-matching attachments.

## Trade-offs and rejected alternatives

- **Physical per-Tenant Auth via separate Supabase projects:** rejected for this
  scope because project proliferation adds operational and identity complexity
  beyond the settled foundation. A separately authorized future compliance need
  may reconsider physical isolation; this record neither builds nor forbids it.
- **Separate native logins for the same email in one project:** rejected because
  it conflicts with the single-project global email constraint.
- **Shared credential as shared donor authority:** rejected because successful
  authentication proves neither a Tenant claim nor current protected purpose.

Shared credential security requires coordinated currentness while the user
experience remains organization-specific. Application boundaries and database
isolation both need qualification; hidden UI is insufficient.

## Consequences

Future tests must prove cross-Tenant negative cases across public, protected and
privileged paths and show no widening from narrow grants. Host/brand correctness
never replaces authorization. Physical project separation, passkeys and staff
SSO remain future scope, not new foundation requirements.

## Related contracts

- [AL-504 documentation scope](https://github.com/Asymmetric-al/core/issues/504)
- [Current Phase 4 owner PRD](../prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md)
- [Phase 25 identity contract](../prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/identity.md)
- [Active foundation requirements](../../openspec/changes/sitestacker-parity/specs/platform-product-intent/spec.md)
- [Documentation and future implementation tasks](../../openspec/changes/sitestacker-parity/tasks.md#6-phase-4-durable-language--al-504)
- [ADR identity registry](registry.md)
