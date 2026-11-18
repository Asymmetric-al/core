---
name: nextjs-supabase-auth
description: Integrate Supabase Auth with Next.js App Router using each app's proxy.ts (Next.js 16 Proxy, formerly middleware), callback handling, protected routes, and server/client client boundaries.
metadata:
  owner: "skills-steward"
  last_updated: 2026-02-18
  status: "active"
  upstream:
    repo: "supabase/agent-skills"
    related_guides:
      - "https://supabase.com/docs/guides/auth/server-side/nextjs"
      - "https://supabase.com/docs/guides/auth"
license: MIT
---

# Next.js + Supabase Auth

Use this skill for authentication work in Next.js App Router with Supabase Auth.

## When to Apply

Use this skill when:

- Implementing login/signup/logout and session flows
- Protecting routes in `proxy.ts`
- Handling auth callback exchanges
- Wiring auth checks in Server Components, Server Actions, and route handlers
- Debugging cookie/session desync between server and client

Do not use this skill when:

- The task is primarily query/index/schema optimization (use `supabase-postgres-best-practices`)
- The task spans broader Supabase surface area beyond Next.js auth wiring (use `docs/ai/skills/supabase/SKILL.md`)
- The task is UI-only and does not change auth behavior

## Core Rules

1. Shared auth lives in `packages/auth` (`@asym/auth`); read `packages/auth/AGENTS.md` first. Apps re-export package contracts instead of creating a second client.
2. Route protection and session refresh run in each app's `proxy.ts` (Next.js 16 Proxy, formerly middleware) through `createAuthMiddleware` from `@asym/auth/middleware`, which validates the user with `auth.getUser()`. Public routes are listed explicitly there.
3. Server code resolves the caller with `getAuthContext`, `requireAuth`, or `requireRole` from `@asym/auth/context`. Business data access stays in `packages/api`; app route handlers must not import `@asym/database/supabase/*` or `@supabase/*` directly (`docs/guides/architecture/data-access-boundary.md`).
4. Supabase clients come from `packages/database`: `@asym/database/supabase/server` for server code, `createBrowserClient` from `@asym/database/supabase` for the browser, and `@asym/database/supabase/admin` (service role) only in trusted server code.
5. Auth callbacks re-export the shared handler (`export { GET } from "@asym/api/auth/callback"`).
6. Do not manually store or forward auth tokens in client code. Maintain RLS assumptions; do not bypass policy boundaries. Fail closed.

## Workflow

1. Identify the execution boundary first (Server Component, Client Component, proxy, Server Action, or route handler).
2. Use the shared helper for that boundary; do not create a new Supabase client.
3. Check the app's `proxy.ts` public-route list when adding or protecting a route.
4. Validate auth and role before sensitive reads or writes.
5. Write the regression test first (`packages/auth/context.*.test.ts` cover the request auth context), then verify login, logout, and session refresh end to end.

## Checklist

- [ ] Shared auth stays in `packages/auth`; apps re-export
- [ ] Protected and public routes are correct in `proxy.ts`
- [ ] Server code uses `@asym/auth/context`; no direct Supabase imports in app route handlers
- [ ] No service-role client outside trusted server code
- [ ] No manual token persistence logic added

## Common Anti-Patterns

- Using the browser client in Server Actions or the server client in Client Components
- Trusting `getSession()` in server render paths without validating the user
- Storing JWTs manually in localStorage or cookies
- Adding an app-local Supabase client or auth callback instead of re-exporting the shared one
