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
- Supabase CLI is used through the repo runner: `bun run supabase -- <command>` (global CLI preferred when installed, pinned fallback otherwise).

### Supabase access (critical)

- **Server-side:** Use the server client with cookie-based auth.
- **Client-side:** Use the singleton browser client to avoid auth desync.
- **Browser table data:** Use `@asym/database/hooks` backed by TanStack DB
  Supabase collections by default. Do not add app-local Supabase table reads
  when a collection exists.
- For allowed/forbidden import boundaries by code area, see
  [`docs/guides/architecture/db-client-usage-matrix.md`](../../guides/architecture/db-client-usage-matrix.md).
- **Route handlers:** `apps/*/app/api/**` route handlers should not import `@asym/database/supabase` (or subpaths) directly; use `@asym/api/*` handler boundaries.

### Data Access Boundary

- Asym Postgres owns application and CRM truth. Twenty CRM is retired; do not restore Twenty clients, credentials, routes, webhooks, synchronization, projections, or provider-backed CRM reads.
- All business DB logic lives in `packages/api/src/*`; route handlers in `apps/*/app/api/` are thin re-exports only.
- Full rule, approved exceptions, and examples live in `docs/guides/architecture/data-access-boundary.md`.
- Primary enforcement is ESLint `no-restricted-imports` rules (ticket 2.2.2).
- CI enforcement is `scripts/verify/data-boundary-check.sh`.

### Security & auth

- Assume RLS is active.
- Do not manually manage tokens.
- Never use the service role key in client-side code.
- For auth/session/middleware tasks, load `docs/ai/skills/nextjs-supabase-auth/SKILL.md`.
- For **Payload CMS** application work (`payload.config.ts`, collections, hooks, access control, Local API, plugins), load `docs/ai/skills/payloadcms-payload/SKILL.md`.
- For **CMS to Payload migration** work, load `docs/ai/skills/payloadcms-cms-migration/SKILL.md`.
- Both Payload skills stay subordinate to this file, Supabase rules, and `docs/guides/architecture/data-access-boundary.md`.

### Data mutations

- Use TanStack DB collection mutations for simple, RLS-authorized, single-table
  browser writes where optimistic UI is appropriate.
- Prefer Server Actions or `packages/api` commands for privileged mutations.
- Use TanStack Query `useMutation` for optimistic UI paired with server actions or API routes when the operation is not a collection-safe single-table write.
- Keep Stripe, donation creation/confirmation, receipts, email, webhooks, audit
  logs, service role operations, role changes, RPC counter workflows, file
  processing, external sync, and multi-table writes server-command owned.
- Validate inputs with Zod before writing.

### Skill routing

- For Supabase Auth + Next.js App Router implementation, apply `docs/ai/skills/nextjs-supabase-auth/SKILL.md`.
- For query/index/schema/RLS performance work, apply `docs/ai/skills/supabase-postgres-best-practices/SKILL.md`.

### Environment variables

- Store secrets in `.env.local` only.
- Use `NEXT_PUBLIC_` only for browser-safe values.
- Keep `.env.example` updated with required keys (no secrets).

### Data pipeline note

- This repo does not contain `tier_1` / `tier_2` batch pipelines. Do not add them unless requested.

## Workflow

1. Determine if the code runs on server or client.
2. Use the correct data surface: collection hook, server client, or admin/API
   command boundary.
3. Apply Zod validation before mutations.
4. Keep auth and RLS assumptions intact.
5. Update `.env.example` if new env vars are required.

## Checklists

### Implementation checklist

- [ ] Server code uses `@asym/database/supabase/server`
- [ ] Client table reads use `@asym/database/hooks` or approved collections
- [ ] Browser Supabase client usage is limited to approved auth/storage helpers
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
import { createClient } from "@asym/database/supabase/server";

export async function myAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
}
```

### Client-side client

```ts
import { createClient } from "@asym/database/supabase/client";

export function MyComponent() {
  const supabase = createClient();
}
```

## Common mistakes / pitfalls

- Using the browser client in server actions
- Using the server client in client components
- Using service role keys in the browser
- Skipping Zod validation before writes

### Route segment config policy (required)

- With `cacheComponents: true` enabled in this repo, App Router route segment config exports are disabled.
- In `apps/*/app/**/{route,layout,page}.{ts,tsx,js,jsx,mts,mjs}`, do **not** export any of:
  - `runtime`
  - `dynamic`
  - `dynamicParams`
  - `revalidate`
  - `fetchCache`
  - `preferredRegion`
  - `maxDuration`
- Keep runtime/data behavior in handler/component logic and request-level cache controls instead.
- See `docs/guides/architecture/runtime-map.md` for repo-specific rationale and API route inventory.
