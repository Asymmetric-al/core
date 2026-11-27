# 0003. Admit a tenant page under a membership the person holds

**Status:** Recorded on 2026-11-22 from code comments in `packages/auth`
([#2751](https://github.com/Asymmetric-al/core/issues/2751)). It describes the
code as it is and ratifies no product intent. Accepted platform intent is in
[`docs/adr/`](../../../../docs/adr/README.md).

## Context

In Mission Control and the missionary workspace, the address identifies the organization, but signing in does not establish membership in that organization. A person can belong to several organizations or hold two staff assignments in the same one. The proxy must settle which row applies before it serves the page. The links and the organization chooser need to produce addresses that the proxy interprets the same way.

## Decisions

1. **Only rewrite paths that stay on this site.** `parseTenantAddress` in `packages/auth/tenant-address.ts` is shared by the proxy, server code and client code. Its `startsAnotherAuthority` check rejects a remainder that starts with two slash or backslash characters in any combination. It checks both the literal text and, if decoding succeeds, the text decoded once, ignoring tabs, carriage returns and newlines in each. Otherwise a path treated as local could name a different host when used as a rewrite or link. Cited: [council round 1, A1 and A2][reviews].

2. **Use one list of paths that never receive a tenant prefix.** `withTenantAddress` uses `OUTSIDE_TENANT_SEGMENT_ROOTS` in `packages/auth/tenant-address.ts` for API and framework paths, sign-in and related pages, the choosers, Web Studio and the `/boneyard` capture pages. With tenant addressing enabled, `createAuthMiddleware` in `packages/auth/middleware.ts` rejects a configured public route not covered by the list: otherwise the helper would generate a link the proxy immediately redirects. Its `authMiddleware` returns 404 for prefixed `/api/` routes when API passthrough is enabled, and for prefixed Web Studio REST routes under `/web-studio/api/` when Web Studio is configured. It redirects other prefixed public or excluded pages to their unprefixed path rather than serving a second copy. The plan's operator area ([WP2c][work]) is not built and is not on the list. Cited: [plan §5.2][tenant-plan], [WP2b][work], [council round 1, A13][reviews].

3. **Keep a public homepage distinct from app-wide protection.** In `packages/auth/route-matching.ts`, `matchesListedRoute` treats `/` on a public or sign-in list as the homepage alone. `matchesProtectedPrefix` treats `/` as the whole app. This lets an app protect every page without making every page public when it lists its homepage. Both match other entries on a whole path segment, including its descendants.

4. **Give the proxy and the chooser the same source of membership rows.** `decideTenantAddress`, `decideLanding` and `listAddressChoices` in `packages/auth/tenant-address-decisions.ts` take rows as arguments rather than reading them. The proxy's `readSurfaceAssignments` in `packages/auth/middleware.ts` and the chooser's `getSignedInAssignments` in `packages/auth/context.ts` both use `readActiveAssignments` to validate the signed-in person's rows. Both can instead use the assignments from an end-to-end test session. Cited: [plan §5.1][auth-plan], [§5.2][tenant-plan], [AL-2675][issue].

5. **Treat a sub-role in the address as a request, not a grant.** `TenantAddress.subRole` in `packages/auth/tenant-address.ts` records what the address says. `AuthMiddlewareOptions.tenantAddress` in `packages/auth/middleware.ts` requires a configured role class. `decideTenantAddress` in `packages/auth/tenant-address-decisions.ts` checks rows of that class in the named tenant. No row means refusal, not a switch to another tenant. With one row the proxy drops any staff sub-role suffix by redirect, even one the person does not hold. A suffix that is not a staff sub-role name does not parse as a tenant address. For several staff rows, only a held suffix selects a row; a missing or unheld suffix leads to the chooser for that tenant. Several non-staff rows are ambiguous and refused because only staff rows can be distinguished by sub-role. On admission the proxy passes the selected tenant, assignment ID and prefix to the existing page. Cited: [plan §5.2][tenant-plan], [AL-2675][issue].

6. **Let a person reach the chooser before requiring a single assignment.** On tenant-addressed surfaces, `authMiddleware` in `packages/auth/middleware.ts` leaves selection to the destination after sign-in and skips the unscoped role check on the authenticated organization chooser. That check would turn away someone who needs to choose. For an unprefixed protected page inside the tenant segment, after a successful assignment read, `decideLanding` in `packages/auth/tenant-address-decisions.ts` enters directly with one eligible row, refuses with none, and otherwise opens the chooser. If all eligible rows belong to one tenant, the chooser is limited to it. Cited: [plan §5.2][tenant-plan], [AL-2675][issue].

7. **Recheck a chooser link when it opens.** `listAddressChoices` in `packages/auth/tenant-address-decisions.ts` offers one option per eligible row, optionally limited to one tenant. It groups by tenant and orders staff sub-roles within each group by their registry order. The link returns to `decideTenantAddress` through the proxy: displaying it is not permission to use it.

8. **Report a failed organization-name lookup instead of displaying unnamed organizations.** `readOrganizationNames` in `packages/auth/organization-names.ts` calls `public.current_user_organizations()` with the signed-in person's client. The database returns just the ID and name of each organization in which that caller has a live membership. A returned database error, a non-array result or a malformed row raises `OrganizationNamesReadError`; the chooser can report that the list is unavailable. Cited: [plan §5.2][tenant-plan], [AL-2675][issue], [implementation record D-26 as amended][decisions].

9. **With a verified name, the address names a sub-role at most.** With the
   switch on, the organization is the verified name's: the decisions above
   keep the off-mode address, and `decideNameAddress` and
   `listNameAddressChoices` decide the address without the ID (prefix `""` or
   `/~<sub-role>`), refusing a one-row person's sub-role with `404 no-store`
   instead of a canonical redirect. See
   [0015](0015-organization-from-the-verified-name.md), decisions 21 to 24.

## Accepted records this code implements

- `TENANT_SEGMENT` in `packages/auth/tenant-address.ts`: [ADR-0227][accepted], clause 5 (canonical lower-case tenant UUID, optional staff suffix and proxy rewrite). Cited: [plan §5.2][tenant-plan], [AL-2675][issue].
- `authMiddleware` in `packages/auth/middleware.ts`: [ADR-0227][accepted], clauses 1, 2 and 5 (admission under one live assignment of the surface's class in the addressed tenant). Cited: [plan §5.2][tenant-plan].

[accepted]: ../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md
[auth-plan]: ../../../../docs/audits/core-crm-cms-database-target-architecture.md#51-authentication-and-authority
[tenant-plan]: ../../../../docs/audits/core-crm-cms-database-target-architecture.md#52-choosing-the-tenant
[work]: ../../../../docs/audits/core-crm-cms-database-target-architecture.md#wp2--membership-as-the-only-authority
[decisions]: ../../../../docs/audits/core-crm-cms-database-implementation-record.md#6-decisions-and-deviations
[reviews]: ../../../../docs/audits/core-crm-cms-database-implementation-record.md#11-council-reviews
[issue]: https://github.com/Asymmetric-al/core/issues/2675
