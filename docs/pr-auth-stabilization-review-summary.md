# PR review summary — Auth stabilization (cursor/supabase-login-foundation-6869)

**Use this block as the final approval comment for the PR.**

---

## Summary

This PR stabilizes and completes the Supabase login foundation on top of the latest `epic` branch. It addresses known auth issues, keeps changes minimal and focused on auth, and brings the branch to a clean, merge-ready state.

## What was done

### 1. Branch sync with epic

- Merged `origin/epic` into `cursor/supabase-login-foundation-6869` and resolved conflicts in:
  - `apps/admin/app/mc-shell.tsx` (lucide-react imports; kept epic naming, added `LogOut`)
  - `packages/ui/package.json` (kept `@asym/auth`, `@asym/database`; set `@base-ui/react` to `1.3.0`)
  - `bun.lock` (aligned with merged dependencies)

### 2. Auth correctness fixes

- **LoginScreen redirect loop**  
  Replaced `getSession()` with `getUser()` in the client-side “already signed in” check so cached/revoked sessions do not cause redirect loops. (`packages/ui/components/auth/LoginScreen.tsx`)
- **Open redirect in middleware**  
  Redirect URLs now use only `request.nextUrl.origin` as the base. Removed use of `Origin`, `Referer`, and `X-Forwarded-*` for the redirect target to prevent open redirects. (`packages/auth/middleware.ts`)
- **Revoked session validation**  
  Middleware now uses `getUser()` instead of `getClaims()` so the server validates the session and revoked/invalid tokens are rejected. (`packages/auth/middleware.ts`)
- **Proxy**  
  Legacy cookie-refresh helper now uses `getSession()` for refresh only; auth gating remains in `@asym/auth/middleware`. (`packages/database/supabase/proxy.ts`)

### 3. E2E auth bypass

- Removed the unit test that expected middleware to accept the E2E auth bypass cookie. Middleware does not implement that flow; E2E should use demo login or real credentials. Added a test that asserts redirects use `nextUrl.origin` only (no open redirect).

### 4. Env usage

- **Middleware**  
  `logMissingSupabaseConfig` now receives the result of `getSupabasePublicConfig()` instead of reading `process.env` in the auth package.
- **Demo-account**  
  Replaced raw `process.env` with `serverEnv` and `runtimeEnvFlags` for demo config and `NODE_ENV` logging. (`packages/api/src/auth/demo-account.ts`)

### 5. Tests

- **Middleware tests**  
  Updated mocks from `getClaims` to `getUser` and adjusted test that asserted E2E bypass behavior to assert “redirect uses nextUrl.origin only” instead.
- **Proxy-middleware test**  
  Added `tests/unit/auth/proxy-middleware.test.ts` (from PR #94 scope): donor proxy redirects unauthenticated requests to login with `next` param and fails closed when Supabase config is missing. Import path fixed for repo layout.

### 6. Unrelated fix for typecheck (epic merge)

- **Drawer (base-ui)**  
  Resolved typecheck after epic’s base-ui version: `packages/ui/components/shadcn/drawer.tsx` now imports `DrawerPreview` from `@base-ui/react/drawer` (1.2.0 export) and fixes the `LegacyDrawerDirection` index type so typecheck passes.

## Verification

- **Lint:** `bun run lint` — pass (existing warnings only in other packages).
- **Typecheck:** `bun run typecheck` — pass.
- **Auth unit tests:** `bunx vitest run tests/unit/auth/` — 38 tests pass (middleware, proxy-middleware, demo-account, signout, client-signout, permissions, roles, e2e-auth, demo-login, role-hardening-migration).
- **Full unit suite:** `bun run test:unit` — auth and most other tests pass; known pre-existing failures (CMS hook timeouts, script-verifier timeout) remain and are outside auth scope.

## Scope and constraints

- No direct merge of PRs #93 or #94; only minimal, auth-relevant pieces were brought in (proxy-middleware test; auth docs already present in branch).
- PRs #92 and #98 were used only as reference; no code imported from them.
- Changes are limited to auth, middleware, proxy, login screen, demo-account, and tests/docs touched by the above. Drawer fix was necessary to unblock typecheck after epic merge.

## Recommendation

**Approve and merge** when you are satisfied with the branch. Auth flows are consistent across apps, redirects are safe, revoked sessions are rejected, and lint/typecheck/auth unit tests pass. Layout-level role gates remain the primary authorization layer; middleware is kept simple and reliable.
