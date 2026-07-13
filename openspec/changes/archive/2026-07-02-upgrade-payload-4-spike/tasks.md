## 1. Runtime upgrade

- [x] 1.1 Pin admin Payload packages to `4.0.0-internal.1f9ae9a`.
- [x] 1.2 Move upload storage wiring to Payload 4 top-level `storage`.
- [x] 1.3 Keep Payload runtime isolated to `apps/admin`.
- [x] 1.4 Add a Next App Router compatibility bridge for Payload admin routing.

## 2. Documentation and intent

- [x] 2.1 Update Web Studio living spec package inventory and Payload 4 status.
- [x] 2.2 Document the Payload vendor mirror versus runtime dependency split.
- [x] 2.3 Record Node.js `24.15.0+` as the Payload 4 CMS CLI requirement.
- [x] 2.4 Document that internal Payload 4 is a spike dependency, not the final
      stable dependency contract.

## 3. Validation

- [x] 3.1 Run Payload migrations and migration status against disposable Postgres.
- [x] 3.2 Run `bun run lint:admin`.
- [x] 3.3 Run `bun run typecheck:admin`.
- [x] 3.4 Run `bun run build:admin`.
- [x] 3.5 Run `bun run test:unit:cms`.
- [x] 3.6 Run focused CMS Playwright smoke for `/web-studio/templates`.
- [x] 3.7 Confirm GitHub required checks are green after the latest PR push.
      (PR #284 merged 2026-06-28 with all required checks green.)
