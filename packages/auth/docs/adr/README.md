# `@asym/auth` decision records

These records hold the reasons behind the code in `packages/auth`. They were
taken from the package's code comments on 2026-11-22
([#2751](https://github.com/Asymmetric-al/core/issues/2751)), when comments
were banned in source. Each decision was checked against the code before it
was written down.

A record here describes what the code does and why. It ratifies no product
intent. Accepted platform decisions are in
[`docs/adr/`](../../../../docs/adr/README.md); where this package carries one
out, the record lists it under "Accepted records this code implements" and
does not restate it.

## Records

| No.                                                       | Decision                                                                                            | Code                                                                                                                                                                                               |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [0001](0001-session-refresh-and-password-recovery.md)     | The proxy refreshes sessions; the reset screen limits password recovery to one hour                 | `middleware.ts`, `auth-screen.ts`, `password-recovery.ts`, `auth-email-request.ts`, `sign-up-confirmation.ts`                                                                                      |
| [0002](0002-live-membership-is-the-only-authority.md)     | Authorize from live memberships; use the primary role for routing and display                       | `permissions.ts`, `roles.ts`, `resolve-user-role.ts`, `staff-subroles.ts`, `middleware.ts`, `context.ts`                                                                                           |
| [0003](0003-tenant-in-the-page-address.md)                | Admit a tenant page under a membership the person holds                                             | `tenant-address.ts`, `tenant-address-decisions.ts`, `organization-names.ts`, `middleware.ts`, `route-matching.ts`                                                                                  |
| [0004](0004-request-scope-headers-are-claims.md)          | The proxy sets page scope; API scope headers must match a live membership                           | `request-headers.ts`, `middleware.ts`, `tenant-server.ts`                                                                                                                                          |
| [0005](0005-redirects-and-rewrites-stay-on-origin.md)     | Keep redirects and rewrites on the request's origin and confirm sign-out there                      | `middleware.ts`, `request-headers.ts`, `demo-login.ts`, `client-signout.ts`                                                                                                                        |
| [0006](0006-web-studio-outside-the-tenant-segment.md)     | Web Studio stays outside the tenant segment and takes its organization from a signed cookie         | `web-studio.ts`, `web-studio-proxy.ts`, `middleware.ts`                                                                                                                                            |
| [0007](0007-e2e-auth-bypass-limits.md)                    | The E2E auth bypass is bound to allowlisted datasources, signed identities and the resolver's rules | `e2e-auth.ts`, `principal/e2e-assignments.ts`, `constants.ts`, `middleware.ts`, `context.ts`                                                                                                       |
| [0008](0008-mutation-admission-at-the-http-boundary.md)   | Writes are admitted or refused the same way at the HTTP boundary                                    | `mutation-admission.ts`, `request-headers.ts`                                                                                                                                                      |
| [0009](0009-access-diagnostics-logging.md)                | Log the cause of an access failure without logging the error                                        | `access-diagnostics.ts`                                                                                                                                                                            |
| [0010](0010-tenant-navigation-helpers.md)                 | Build links from page paths and load a new document when scope changes                              | `tenant-navigation.tsx`                                                                                                                                                                            |
| [0011](0011-document-scope-guards.md)                     | Withhold a page on a scope mismatch and bound its reload                                            | `tenant-navigation.tsx`, `portal-document.tsx`, `tenant-server.ts`                                                                                                                                 |
| [0012](0012-one-live-assignment-per-request.md)           | Each request resolves one live assignment under the caller's own session                            | `context.ts`, `principal/assignment.ts`, `principal/reader.ts`, `principal/types.ts`                                                                                                               |
| [0013](0013-request-cookies-and-nextjs-caching.md)        | Prefer the Next.js cookie store and preserve its rendering control flow                             | `context.ts`                                                                                                                                                                                       |
| [0014](0014-capability-defaults-and-resolution.md)        | Capability defaults live in code, and grants resolve within one selected context                    | `capabilities/`                                                                                                                                                                                    |
| [0015](0015-organization-from-the-verified-name.md)       | The dashboards take their organization from the verified name                                       | `verified-name.ts`, `request-headers.ts`, `middleware.ts`, `context.ts`, `tenant-server.ts`, `web-studio.ts`                                                                                       |
| [0016](0016-donor-organization-from-the-verified-name.md) | The donor app takes its organization from the verified name                                         | `verified-name.ts`, `request-headers.ts`, `principal/assignment.ts`, `context.ts`, `resolve-user-role.ts`, `tenant-server.ts`, `front.ts`, `apps/donor/proxy.ts`, `apps/donor/lib/route-policy.ts` |

## Keeping them true

- Change the record in the same pull request as the code it describes.
- A new decision about this package's code gets the next free number here,
  one record per topic a reader would look up.
- Platform-wide intent does not start here. It goes through OpenSpec and
  `docs/adr/`.
