# 0002. Authorize from live memberships; use the primary role for routing and display

**Status:** Recorded on 2026-11-22 from code comments in `packages/auth`
([#2751](https://github.com/Asymmetric-al/core/issues/2751)). It describes the
code as it is and ratifies no product intent. Accepted platform intent is in
[`docs/adr/`](../../../../docs/adr/README.md).

## Context

A person can sign in once and hold different memberships in different organizations. An assignment is the membership the person acts under for a request. The proxy needs to know whether the person may enter an app before the app renders; a handler needs to know whether that membership permits a particular action. Choosing a home page answers neither question.

## Decisions

### Admission at the proxy

1. **Let the app supply the lookup, not the admission rule.** `AuthMiddlewareOptions.resolveUserRole` in `packages/auth/middleware.ts` leaves the membership lookup and any caching to the caller. At a protected page using the role allowlist, `authMiddleware` redirects a real user whose snapshot is missing or has none of the allowed roles. Signing in is not permission to enter every app. The tenant chooser skips this gate so someone who still needs to choose a row can see their own choices.
2. **Reject a role gate without a resolver at startup.** `createAuthMiddleware` in `packages/auth/middleware.ts` throws when a nonempty `allowedRoles` has no `resolveUserRole`. Silently applying that configuration would lock everyone out; silently skipping it would open the protected pages.
3. **Read assignments on the caller's session and refuse a failed read.** `readSurfaceAssignments` in `packages/auth/middleware.ts` validates the rows returned by `current_user_assignments`. A failed or malformed read returns `null`; only an admitted end-to-end test identity without a real user uses assignments from its signed cookie. Safe error information goes to the server log, not into the person's refusal. Cited: [council round 1, A5][reviews].
4. **Do not guess when the role lookup has no chosen tenant.** `resolveUserRoleFromDatabase` in `packages/auth/resolve-user-role.ts` gives the resolver only the user and the surface's membership class. It uses the caller's assignments, not profile columns, a privileged database key or an assignment header. Without a class, exactly one eligible row, and a successful read, it returns `null`. This is the unscoped role lookup, not the separate proxy decision for a tenant in a page address. Cited: [plan 5.2][tenant-plan], [NR-20][audit].

### Checks in server code

5. **Expose the handler vocabulary through the auth context.** `Capability` and `RoleClass` in `packages/auth/context.ts` are type exports. A handler can name the permission it checks without importing the registry that defines the bundles. Cited: [#492](https://github.com/Asymmetric-al/core/issues/492), [AL-2675][issue].
6. **Keep the tenant-and-class predicate independent of a request.** `hasMembershipClass` in `packages/auth/permissions.ts` checks supplied rows for an active membership in the named tenant and class. Code without a request and `hasContextRoleClass` in `packages/auth/context.ts` can use the same rule. Cited: [AL-2675][issue].
7. **Do not turn an invalid capability lookup into a grant.** `contextCapabilities` in `packages/auth/context.ts` returns no capabilities for a signed-out context or anything other than one active row in the context's tenant. `membershipHasCapability` in the same file lets server code check another member, for example a prospective notification approver, without using the caller's permissions. An inactive row cannot qualify. Both functions deny on `CapabilityResolutionError`; other errors propagate. Cited: [plan 5.1][authority-plan], [AL-2675][issue].

### Names for navigation

8. **Use one routing map, not a second permission system.** `derivePrimaryRole` in `packages/auth/permissions.ts` chooses the first applicable display label: tenant administrator, staff, missionary, then donor; no live membership yields `null`. `APP_ROLES`, `ROLE_HOME` and `routeForRole` in `packages/auth/roles.ts` centralize the home routes and their aliases. The sign-in callback passes a live membership class, not a profile role. A routing alias can lead to a page without granting entrance: the proxy, layout and database row-level security still enforce access. Cited: [AL-2675][issue].
9. **Share the ordered staff sub-role list.** `STAFF_SUBROLES` in `packages/auth/staff-subroles.ts` supplies the chooser order and the names used by the address parser, assignment resolver and test-session validator. A name offered by the chooser must mean the same thing to each reader.

## Accepted records this code implements

- `AuthMembership.isTenantAdmin` in `packages/auth/permissions.ts`: [ADR-0227][policy], clause 1, the staff administrator flag; only explicit `true` qualifies ([plan 5.1][authority-plan]).
- `RoleSnapshot` in `packages/auth/permissions.ts`: [ADR-0227][policy], clauses 1 and 2, membership authority and the one assignment selected for the request ([plan 5.1][authority-plan]; [AL-2675][issue]).
- `hasRole` in `packages/auth/permissions.ts`: [ADR-0227][policy], clause 1, the distinction between staff and flagged administrators; [ADR-0228][operators], clause 1, no operator rights from a `super_admin` membership ([WP2c][work-package]).
- `describe("requireCapability")` and the administrator and class guard suites in `packages/auth/context.require.test.ts`: [ADR-0227][policy], clauses 1 through 3, the capability, administrator and tenant-bound class checks exercised by the tests ([AL-2675][issue]; [WP2a][work-package]).
- `contextCapabilities` in `packages/auth/context.ts`: [ADR-0210][registry], Decision and the amendment clauses “Moves and retirements” and “Nothing new about aggregation,” for bundles, the administrator grant and one assignment ([plan 5.1][authority-plan]).
- `hasContextRoleClass` in `packages/auth/context.ts`: [ADR-0227][policy], clauses 2 and 3, checking the surface's membership class within the active tenant ([AL-2675][issue]).

[reviews]: ../../../../docs/audits/core-crm-cms-database-implementation-record.md#11-council-reviews
[tenant-plan]: ../../../../docs/audits/core-crm-cms-database-target-architecture.md#52-choosing-the-tenant
[authority-plan]: ../../../../docs/audits/core-crm-cms-database-target-architecture.md#51-authentication-and-authority
[work-package]: ../../../../docs/audits/core-crm-cms-database-target-architecture.md#wp2--membership-as-the-only-authority
[audit]: ../../../../docs/audits/core-crm-cms-database-audit.md#114-rounds-3-to-9-findings-added-by-the-reviews-of-the-plan
[issue]: https://github.com/Asymmetric-al/core/issues/2675
[policy]: ../../../../docs/adr/0227-one-policy-pattern-and-the-carried-tenant.md
[operators]: ../../../../docs/adr/0228-platform-operators-and-support-grants.md
[registry]: ../../../../docs/adr/0210-code-authoritative-capability-foundation.md
