---
name: nextjs-supabase-auth
description: Integrate Supabase Auth with Next.js App Router using middleware, callback handling, protected routes, and server/client client boundaries.
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

## This repository (Asymmetric-al/core)

- Load `docs/ai/skills/supabase/SKILL.md` first or alongside this skill so official Supabase docs, CLI, MCP, RLS, and security guidance is applied.
- Server code uses `@asym/database/supabase/server`.
- Client code uses `@asym/database/supabase/client`.
- Keep route handlers thin and respect `docs/guides/architecture/data-access-boundary.md`.
- Supabase Auth work must preserve RLS assumptions. Review official Supabase Auth docs (`https://supabase.com/docs/guides/auth`) and RLS docs (`https://supabase.com/docs/guides/database/postgres/row-level-security`) when behavior changes.

## When to Apply

Use this skill when:

- Implementing login/signup/logout and session flows
- Protecting routes with middleware
- Handling auth callback exchanges
- Wiring auth checks in Server Components, Server Actions, and route handlers
- Debugging cookie/session desync between server and client

Do not use this skill when:

- The task is primarily query/index/schema optimization (use `supabase-postgres-best-practices`)
- The task spans broader Supabase surface area beyond Next.js auth wiring (use `docs/ai/skills/supabase/SKILL.md`)
- The task is UI-only and does not change auth behavior

## Core Rules

1. Use `@supabase/ssr` patterns for App Router integration.
2. Use `@asym/database/supabase/server` for server-side code and `@asym/database/supabase/client` for client-side code.
3. Use middleware to refresh and enforce session state on protected routes.
4. Do not manually store or forward auth tokens in client code.
5. Use Server Actions (or secure route handlers) for privileged auth operations.
6. Maintain RLS assumptions; do not bypass policy boundaries.

## Workflow

1. Identify execution boundary first (server component, client component, middleware, action, or route handler).
2. Ensure the correct Supabase client is used for that boundary.
3. Verify middleware coverage for protected routes.
4. Verify callback handling exchanges auth code/session correctly.
5. Validate auth checks before sensitive reads/writes.
6. Verify end-to-end login/logout/session refresh behavior.

## Checklist

- [ ] Server code imports `@asym/database/supabase/server`
- [ ] Client code imports `@asym/database/supabase/client`
- [ ] Protected paths are covered by auth middleware
- [ ] Callback route/session exchange is correctly handled
- [ ] No service role keys in client-side code
- [ ] No manual token persistence logic added

## Common Anti-Patterns

- Using browser clients in server actions
- Using server clients in client components
- Calling `getSession` blindly in server render paths without user validation
- Storing JWTs manually in localStorage/cookies
