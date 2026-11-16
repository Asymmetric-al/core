---
name: cache-components
description: "Build correct cached/dynamic boundaries in the Next.js App Router when Cache Components or PPR are enabled. Use when working with cacheComponents, Partial Prerendering (PPR), 'use cache', cacheLife, cacheTag, updateTag, or revalidateTag, to avoid request-context leaks and enforce proper cache invalidation. Not for the Pages Router or when Cache Components/PPR are off."
---

# Cache Components (Next.js) — Skill

**Name:** `cache-components`
**Purpose:** Build correct cached/dynamic boundaries in Next.js App Router when Cache Components or PPR are in use.
Use this skill to avoid request-context leaks and to enforce proper cache invalidation.

**Applies when:** `cacheComponents: true`, Partial Prerendering (PPR), `'use cache'`, `cacheLife`, `cacheTag`, `updateTag`, `revalidateTag`.
**Do not use when:** Working in the Pages Router or when Cache Components/PPR are not enabled.

## Rules

- **Cached vs dynamic:** Shared data should be cached; request/user-specific data must be dynamic and streamed behind `<Suspense>`.
- **No request context inside cache:** Never call `cookies()`, `headers()`, or auth/session inside a `'use cache'` scope.
- **Cached functions must be async:** Any `'use cache'` function/component must be `async`.
- **Code-local caching only:** With Cache Components on, the `dynamic`, `dynamicParams`, `revalidate`, and `fetchCache` route segment exports are removed; use `'use cache'`, `cacheLife`, and `cacheTag`.
- **Mutations must invalidate tags:** In Server Actions, use `updateTag` for read-your-own-writes consistency. In Route Handlers (or for background refresh), use `revalidateTag(tag, "max")`; `updateTag` throws outside Server Actions.
- **generateStaticParams:** Return at least one param for dynamic routes (an empty array is a build error under Cache Components); keep request-specific logic out of the shell.
- **Instant navigation:** All Core apps set `cacheComponents: true` and `partialPrefetching: true`, so Next.js prefetches one reusable App Shell per route. Every server `await` is a Stream (`<Suspense>`) / Cache (`'use cache'`) / Block (`export const instant = false` + reason comment) decision. The dev overlay's instant-navigation insights link the documented fix for each case; apply that pattern instead of improvising.
- **Prefetch escalation:** `<Link prefetch={true}>` additionally resolves URL data (`params`, `searchParams`) and the cached content behind it for that link; if the destination reads non-static data such as cookies or headers, each such prefetch is a fresh server render. Opt in per `docs/ai/rules/frontend.md`. The `prefetch` segment export accepts only `'auto'`, `'partial'`, and `'force-disabled'` (see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/prefetch.md`).

## Workflow

1. Classify each data dependency as shared or request-specific.
2. For shared data, add `'use cache'` + `cacheTag` (and `cacheLife` if needed).
3. For request/user-specific data, keep it dynamic and render behind `<Suspense>`.
4. Split cached logic from request logic if needed.
5. Invalidate tags after mutations.

## Checklists

### Implementation checklist

- [ ] Shared data uses `'use cache'`
- [ ] Cached scopes have `cacheTag`
- [ ] No request data inside cached scopes
- [ ] Dynamic UI is isolated behind `<Suspense>`
- [ ] Cached functions are `async`
- [ ] Route stays instant (Stream/Cache), or Blocks explicitly via `export const instant = false` with a reason
- [ ] Mutations invalidate correct tags

### Review checklist

- [ ] No removed route segment config (`dynamic`, `revalidate`, `fetchCache`, `dynamicParams`)
- [ ] PPR shells do not include request-specific logic

## Minimal examples

### Cached function

```ts
"use cache";

import { cacheLife, cacheTag } from "next/cache";

export async function getProducts(category: string) {
  cacheLife("minutes");
  cacheTag("products");
  cacheTag(`products:${category}`);
}
```

### Dynamic Suspense boundary

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <MainCached />
      <Suspense fallback={null}>
        <UserPanel />
      </Suspense>
    </>
  );
}
```

### Mutation invalidation

```ts
"use server";

import { updateTag } from "next/cache";

export async function updateProduct(id: string) {
  updateTag(`product:${id}`);
  updateTag("products");
}
```

## Common mistakes / pitfalls

- Reading cookies/headers/session inside `'use cache'`
- Missing cache tags on cached functions
- Rendering request-specific data outside `<Suspense>`
- Forgetting to invalidate tags after mutations
- Returning an empty array from `generateStaticParams`
