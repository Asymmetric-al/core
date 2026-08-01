## 1. Mount the isolated runtime

- [x] 1.1 Add the runtime workspace and exact Eve dependency to admin
- [x] 1.2 Compose `withEve` outside Payload and Sentry with the isolated runtime root
- [x] 1.3 Prove the exact Next.js 16.2.6 integration through the production build

## 2. Preserve verified request authentication

- [x] 2.1 Read forwarded cookies through the installed `@supabase/ssr` adapter
- [x] 2.2 Avoid ambient Next request globals when an explicit Request is supplied
- [x] 2.3 Test forwarded Supabase/E2E cookie behavior and fail-closed ownership inheritance

## 3. Add the global panel

- [x] 3.1 Mount an admin-only panel throughout the protected Mission Control shell
- [x] 3.2 Keep the panel available on Payload Web Studio without exposing public routes
- [x] 3.3 Support bounded text turns and render user/assistant text only

## 4. Enforce the page-context boundary

- [x] 4.1 Attach route category, page identity, selected organization, and safe UI state per turn
- [x] 4.2 Redact dynamic path segments and exclude records, donors, payments, tables, forms, and DOM state
- [x] 4.3 Test both approved-field inclusion and sensitive-field exclusion

## 5. Document and verify

- [x] 5.1 Record ADR-0029 and update the implementation plan
- [x] 5.2 Validate and archive the OpenSpec change
- [x] 5.3 Run focused tests, admin/auth typecheck and lint, production build, and CI preflight
