---
name: nextjs-app-router
description: "Ensure correct Next.js App Router architecture, rendering strategy, and data fetching. Use whenever working under /app — routing, layouts, server/client component boundaries, data fetching, Suspense, and Server Actions. Defaults to Server Components and adds 'use client' only for interactivity. Not for the Pages Router (/pages)."
---

# Next.js App Router in Core

Core's apps (`apps/admin`, `apps/donor`, `apps/missionary`, `apps/factory-console`) use the App Router with `cacheComponents: true` and `partialPrefetching: true`. Read the installed docs under `node_modules/next/dist/docs/` for API details; this skill covers the Core-specific decisions.

## Rules

- **Server-first:** Default to Server Components; add `'use client'` only for interactivity or browser APIs, as a small leaf.
- **Every server `await` is a decision:** Stream it behind `<Suspense>`, cache it with `'use cache'`, or block deliberately with `export const instant = false` plus a reason comment. A bare top-level `await` in a page or layout blocks the App Shell. Details: `docs/ai/skills/cache-components/SKILL.md` and the Instant Navigation section of `docs/ai/rules/frontend.md`.
- **Data ownership:** Business queries and privileged mutations live in `packages/api`; pages and route handlers call it and stay thin. Browser-visible table data uses `@asym/database` collections and hooks. See `docs/guides/architecture/data-access-boundary.md`.
- **Mutations:** Use Server Actions or `packages/api` commands for privileged writes, and invalidate the affected cache tags (`updateTag` in Server Actions).
- **No removed segment config:** `dynamic`, `revalidate`, `fetchCache`, and `dynamicParams` exports are unavailable with Cache Components.
- **Errors:** Use `error.tsx` and `not-found.tsx` for route-level handling.
- **Page composition:** For feature folders, colocated Suspense skeletons, and leaf-client UX, also load `docs/ai/skills/nextjs-app-architecture/SKILL.md`.

## Checklist

- [ ] Server Components by default; client components small and justified
- [ ] Each server `await` streamed, cached, or deliberately blocked with a reason
- [ ] `<Suspense>` boundaries close to the dynamic read, not around the whole page body
- [ ] Business data and privileged mutations go through `packages/api`
- [ ] Mutations invalidate the correct cache tags
- [ ] Route-level errors handled via `error.tsx` / `not-found.tsx`

## Example

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <PageHeader />
      <Suspense fallback={<DonorListSkeleton />}>
        <DonorList />
      </Suspense>
    </>
  );
}

async function DonorList() {
  const donors = await listDonorsForCurrentUser(); // request-time read, streamed
  return <DonorTable donors={donors} />;
}
```
