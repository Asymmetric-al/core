# Auth hardening handoff (next-dev guide)

This document captures where auth hardening currently stands, how it is wired, and what remains.

## Current auth wiring (as of Feb 2026)

### Shared building blocks

- Shared role and login helpers:
  - `packages/auth/roles.ts`
  - `packages/auth/demo-login.ts`
- Shared proxy auth middleware:
  - `packages/auth/middleware.ts`
- Shared auth APIs:
  - demo login: `packages/api/src/auth/demo-account.ts`
  - callback exchange: `packages/api/src/auth/callback.ts`
  - signout: `packages/api/src/auth/signout.ts`
- Shared auth UI:
  - `packages/ui/components/auth/LoginScreen.tsx`
  - `packages/ui/components/auth/RegisterScreen.tsx`

### App route wiring

- Auth callback routes:
  - `apps/donor/app/auth/callback/route.ts`
  - `apps/admin/app/auth/callback/route.ts`
  - `apps/missionary/app/auth/callback/route.ts`
- Demo-account routes:
  - `apps/donor/app/api/auth/demo-account/route.ts`
  - `apps/admin/app/api/auth/demo-account/route.ts`
  - `apps/missionary/app/api/auth/demo-account/route.ts`
- Signout routes:
  - `apps/donor/app/api/auth/signout/route.ts`
  - `apps/admin/app/api/auth/signout/route.ts`
  - `apps/missionary/app/api/auth/signout/route.ts`

### Login and role gating behavior

- `/login` is shared-UI backed in all apps, with server-side session check + redirect away when authenticated.
- Proxy middleware handles:
  - cookie/session continuity (`getUser()` path)
  - protected-route redirect to `/login?next=...`
- Server layouts enforce role checks and redirect mismatches to `/no-access`.

### Registration policy

- Public self-registration is donor-only.
- Registration payload no longer sends a client role claim.
- Privileged roles must be assigned by trusted server/admin workflows.

### Sign-out flow

- Client initiates `POST /api/auth/signout` (server cookie invalidation).
- Route performs current-session server-side Supabase sign-out + no-store
  responses + same-origin checks.
- This is an intentional current-device/session sign-out policy. It does not
  sign the user out of other active browser or device sessions.
- Shared client session code clears browser auth state and navigates to `/login`
  only after server sign-out succeeds.
- If server sign-out cannot be confirmed, the UI stays on the current page and
  shows the failure so the user can retry without creating cookie/client-state
  desync.

## What is complete

- Shared login/register auth surfaces are in place across donor/admin/missionary.
- Session-guard + permissions + registration-policy E2E coverage exists:
  - `tests/e2e/auth-session-guards.spec.ts`
  - `tests/e2e/auth-permissions.spec.ts`
  - `tests/e2e/auth-registration-policy.spec.ts`
- Security hardening implemented:
  - donor-enforced signup role assignment in DB trigger
  - role allowlist constraint on `profiles.role`
  - signout origin + cache controls

## Remaining backlog (priority mapping)

### 1) RLS rollout across core tables (documented, not implemented in this pass)

Current schema still has broad RLS disabled sections for many tables.

Future work:

- Enable RLS table-by-table with explicit read/write policies.
- Roll out in controlled phases (lowest-risk tables first).
- Add verification queries and policy tests for each phase.

### 2) Signup anti-abuse protections (documented, not implemented in this pass)

Future work:

- Add rate limiting + captcha for public signup.
- Optionally add invite/domain restrictions where needed.
- Document operational controls and abuse response playbook.

### 3) Migration rollout verification (implemented now, keep running)

Implemented artifacts:

- Migration: `supabase/migrations/20260227060000_auth_role_hardening.sql`
- Unit regression test:
  - `tests/unit/auth/role-hardening-migration.test.ts`

Rollout runbook (hosted):

1. Apply migrations (repo standard):
   - `bun run db:migrate:hosted`
2. Verify role integrity:
   - ensure no invalid/null roles remain
   - ensure `profiles_role_check` exists
3. Verify trigger behavior:
   - create a test user with role metadata and confirm profile role is persisted as `donor`.

### 4) Deterministic CI auth E2E lane (note only for future)

Future expectation:

- Add dedicated CI lane with seeded identities and stable environment setup.
- Keep auth matrix assertions deterministic (no flaky dependency on runtime state).

### 5) Auth observability/audit events (note only for future)

Future expectation:

- Add structured auth events for:
  - sign-in success/failure
  - signout failures
  - permission-denied redirects
  - signup abuse signals

## Current client session module

`packages/auth/client-session.ts` owns browser auth state loading,
profile lookup, auth-state subscriptions, stale transition suppression, and
the client half of sign-out. `packages/api/src/auth/signout.ts` keeps the
server half scoped to the current Supabase session. App headers and shared
hooks should call the client session module instead of calling server sign-out,
browser auth cleanup, alerts, or redirects directly.

## Next-dev checklist

1. Read `docs/auth/sign-in.md` + this handoff.
2. Confirm env setup (`NEXT_PUBLIC_SUPABASE_URL`, public key, demo vars if used).
3. Run:
   - `bun run check`
   - auth e2e specs for session, permissions, registration policy.
4. If touching auth schema:
   - add migration
   - update schema mirror files
   - update/extend migration regression tests.
