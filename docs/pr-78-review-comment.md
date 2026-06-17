# PR #78 Review — Supabase login foundation

**Branch:** `cursor/supabase-login-foundation-6869` → **base:** `production`
**Link:** https://github.com/Asymmetric-al/core/pull/78

---

## Short comment (for PR)

This PR unifies auth around shared Supabase SSR, `createAuthMiddleware`, Base UI login/register, and DB role hardening. The direction is good, but **do not merge to `production` until** the security and logic items below are addressed. Merge conflicts with `production` have been resolved in this branch (client.ts, working-set, bun.lock).

---

## Verdict: **Not safe to merge** until the following are fixed

### Security (must fix before merge)

1. **Open redirect in auth middleware** — `packages/auth/middleware.ts` builds login redirects from `resolveRequestOrigin()`, which trusts `Referer` / `Origin` / `X-Forwarded-Host`. An unauthenticated request from an external site can get `Location: https://evil.example/login?...`. **Fix:** Build redirects from `request.nextUrl.origin` (or a strict allowlist) only. (Cursor bot noted fix in PR #98.)
2. **Health endpoints leak errors** — `apps/{admin,donor,missionary}/app/api/health/route.ts` return raw `error.message` to unauthenticated callers. **Fix:** Return a generic `{ status: "degraded", checks: { supabase: "error" } }` and log details server-side only.
3. **Demo login default-on outside production** — `/api/auth/demo-account` is enabled by default in every non-production env; make it explicit opt-in (or protect with secret/header/IP allowlist) in all environments.

### Logic / consistency (should fix before or immediately after merge)

- **`redirectAuthenticatedTo`** — Declared in options and set in all three proxy files but never read in middleware; either implement it in the `isAuthRoute` branch or remove and document per-page guard as contract.
- **`getClaims()` vs `getUser()`** — Middleware uses local JWT decode; revoked sessions can still pass until expiry. Prefer `getUser()` in middleware for server-validated session (or document the trade-off).
- **Signout desync** — In `packages/auth/use-auth.ts`, do not redirect to `/login` when server signout fails; block redirect and let user retry.
- **Shared auth helpers** — Extract `parseCookieHeader` and `createAuthClient` to e.g. `packages/api/src/auth/_utils.ts` (used in both signout.ts and demo-account.ts).
- **LoginScreen** — Use `getUser()` instead of `getSession()` for the “already authenticated” redirect so it uses validated session.
- **Admin role gate vs DB** — `ADMIN_ALLOWED_ROLES` and `ROLE_ROUTE_ALIASES` omit finance, fundraising, mobilizers, member_care, events; those users hit `/no-access`. Align with Mission Control role set or prune those roles consistently.
- **Profile lookup** — Auth-critical lookups use `profiles.user_id`; consider using `profiles.id` (authoritative for `auth.users`) or backfill/constrain `user_id`.

---

## Greptile-style reply

**Confidence: 3/5** — Solid auth consolidation and DB role hardening; two meaningful security issues (open redirect, health info leak) and several logic/consistency gaps should be fixed before merge.

**Scope:** Auth across backend API routes, middleware, frontend UI, DB migrations, and shared packages. Shared `createAuthMiddleware`, `getSupabasePublicConfig`, and `packages/api/src/auth` (callback, signout, demo-account) are the right centralization. Base UI auth primitives, `safeNextParam`, and migration `20260227060000` are well done.

**Main issues:** (1) Login redirects built from request-controlled headers → open redirect. (2) `/api/health` returns raw backend errors to unauthenticated callers. (3) `redirectAuthenticatedTo` unused; (4) middleware uses `getClaims()` not `getUser()`; (5) signout redirects even when server signout fails; (6) duplicated cookie/Supabase client helpers; (7) admin/role matrix vs DB mismatch.

**Important files:** `packages/auth/middleware.ts`, `packages/auth/use-auth.ts`, `packages/api/src/auth/{signout,demo-account}.ts`, `packages/ui/components/auth/LoginScreen.tsx`, `apps/*/app/api/health/route.ts`, `packages/auth/roles.ts`, `apps/admin/app/layout.tsx`.

---

## Conflict resolution (this pass)

- **packages/database/supabase/client.ts** — Kept PR: `getSupabasePublicConfig()`, throw when url/key missing (no `clientEnv`).
- **docs/ai/working-set.md** — Kept production’s 2026-03-12 section at top, retained PR #78 merge-prep section.
- **bun.lock** — Kept both HEAD’s `@asym/ui/@base-ui/react` and production’s `@asym/ui/lucide-react` entries.

---

## Checklist before merging to `production`

- [ ] Middleware uses `request.nextUrl.origin` (or allowlist) for redirects; no `Referer`/`Origin` for host.
- [ ] Health routes return generic degraded response; log real error server-side only.
- [ ] Demo endpoint is opt-in in all envs or gated by secret/header/IP.
- [ ] Signout does not redirect when server signout fails (use-auth.ts).
- [ ] (Recommended) Implement or remove `redirectAuthenticatedTo`; document per-page guard.
- [ ] (Recommended) Align admin gate and ROLE_ROUTE_ALIASES with DB/Mission Control roles.
