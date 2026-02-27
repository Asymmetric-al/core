# Working Set

- Date: 2026-02-26
- Repo: Asymmetric-al/core
- Goal: Ship a shared Supabase sign-in foundation across `admin`, `missionary`, and `donor` with demo-only + full-login modes, SSR cookie continuity, and role-safe redirects.
- Primary area:
  - `packages/auth/*`
  - `packages/api/src/auth/*`
  - `packages/ui/components/auth/*`
  - `packages/database/supabase/*`
  - `apps/{admin,missionary,donor}/app/(auth)/login/page.tsx`
  - `apps/{admin,missionary,donor}/proxy.ts`
  - `docs/auth/sign-in.md`
- Constraints:
  - Demo credentials stay server-side.
  - No Radix-based auth UI usage.
  - Use modern Supabase SSR + Next.js proxy patterns.
  - Preserve production safety (`ALLOW_DEMO_ACCOUNTS`).
- Evidence sources used:
  - Existing app login pages and proxy files in all three apps
  - `packages/api/src/auth/demo-account.ts`
  - `packages/auth/middleware.ts` and `packages/auth/context.ts`
  - Next.js docs from `.next-docs` (`proxy`, `authentication`)
- Tooling note:
  - Nia MCP unavailable in this runtime; fallback used repo-scoped file reads + `rg`.

## Follow-up hardening execution notes (2026-02-27)

- Completed remaining auth hardening phases:
  - donor authenticated `/login` redirect behavior fixed (proxy auth-route redirect removed; page/client redirect path used).
  - explicit sign-out made SSR-safe with shared `/api/auth/signout` route and cookie-clearing server sign-out.
  - shared registration screen in `@asym/ui` used across apps with donor-only self-registration and admin/missionary invite-only UI.
  - permanent auth E2E specs added for session guards, registration policy, and permissions.
- Verified with:
  - full lint/typecheck/unit (`bun run check`) pass
  - Playwright auth suite runs across donor/admin/missionary (session guards + registration + permission matrix).
