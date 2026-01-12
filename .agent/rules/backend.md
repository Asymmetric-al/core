---
trigger: always_on
---

# Backend & Data Rules (Asymmetric.al)

## Architecture
- **Type**: Next.js App (Serverless) + Supabase (Local-first for dev).
- **Local DB**: This repo contains Supabase migrations + seed data:
  - `supabase/migrations/*.sql`
  - `supabase/seed.sql`
- **Dev Reset**: Use `supabase db reset --workdir .` to rebuild schema + seed deterministically.

## Supabase Access (CRITICAL)

### 1. Server-Side (Server Actions, Route Handlers)
**Always** use the server client which handles cookie-based auth.
```typescript
import { createClient } from '@/lib/supabase/server'

export async function myAction() {
  const supabase = await createClient() // Must await!
  const { data: { user } } = await supabase.auth.getUser()
}
```

### 2. Client-Side (React Components)
**Always** use the singleton browser client to prevent auth desync.
```typescript
import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const supabase = createClient() // Sync
}
```

## Security & Auth
- **RLS**: Assume Row Level Security is active. Queries will only return data the user is permitted to see.
- **Cookies**: Auth state is persisted in cookies. Do not manually manage tokens.
- **Service Key**: **NEVER** use the service role key in client-side code. It allows bypassing RLS.

## Data Mutations
- **Server Actions**: Prefer Server Actions for mutations (`POST`, `PUT`, `DELETE`).
- **TanStack Query**: Use `useMutation` for optimisitic UI updates, combined with Server Actions or API routes.
- **Validation**: Validate all inputs using `zod` before sending to Supabase.

## Environment Variables
- **Secrets**: Store sensitive keys in `.env.local`.
- **Public**: Only prefix variables with `NEXT_PUBLIC_` if they are safe for the browser (e.g., `NEXT_PUBLIC_SUPABASE_URL`).
- **Contract**: Ensure `.env.example` stays updated with required keys (but no actual secrets).

## Data Pipeline (Not Present)
This repo does **not** contain `tier_1` / `tier_2` data processing pipelines. Do not add scripts or folder structures for batch data processing unless explicitly requested.
