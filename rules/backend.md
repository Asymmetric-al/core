# Backend & Data Rules — Rules
**Name:** `backend-rules`
**Purpose:** Guardrails for Supabase, auth, data access, mutations, and environment variables.
Use this before changing server actions, route handlers, database access, or migrations.

**Applies when:** Touching Supabase clients, auth/session, database queries, migrations, or server actions.
**Do not use when:** Only changing UI with no data/auth impact (use `rules/frontend.md`).

## Rules

### Architecture
- Next.js App Router + Supabase (local-first for dev).
- Migrations/seed data:
  - `supabase/migrations/*.sql`
  - `supabase/seed.sql`
- Supabase CLI is not used in contributor workflows; cloud schema/seed is managed outside this repo.

### Supabase access (critical)
- **Server-side:** Use the server client with cookie-based auth.
- **Client-side:** Use the singleton browser client to avoid auth desync.

### Security & auth
- Assume RLS is active.
- Do not manually manage tokens.
- Never use the service role key in client-side code.

### Data mutations
- Prefer Server Actions for mutations.
- Use TanStack Query `useMutation` for optimistic UI, paired with server actions or API routes.
- Validate inputs with Zod before writing.

### Environment variables
- Store secrets in `.env.local` only.
- Use `NEXT_PUBLIC_` only for browser-safe values.
- Keep `.env.example` updated with required keys (no secrets).

### Data pipeline note
- This repo does not contain `tier_1` / `tier_2` batch pipelines. Do not add them unless requested.

## Workflow
1. Determine if the code runs on server or client.
2. Use the correct Supabase client (server vs browser).
3. Apply Zod validation before mutations.
4. Keep auth and RLS assumptions intact.
5. Update `.env.example` if new env vars are required.

## Checklists

### Implementation checklist
- [ ] Server code uses `@/lib/supabase/server`
- [ ] Client code uses `@/lib/supabase/client`
- [ ] Inputs validated with Zod
- [ ] RLS assumptions maintained
- [ ] No service role key in client code

### Review checklist
- [ ] `.env.example` updated if new vars added
- [ ] Migrations/seed paths used correctly
- [ ] Mutations handled via Server Actions where possible

## Minimal examples

### Server-side client
```ts
import { createClient } from '@/lib/supabase/server'

export async function myAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
}
```

### Client-side client
```ts
import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const supabase = createClient()
}
```

## Common mistakes / pitfalls
- Using the browser client in server actions
- Using the server client in client components
- Using service role keys in the browser
- Skipping Zod validation before writes
