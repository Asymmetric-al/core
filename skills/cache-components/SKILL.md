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
- **Prefer code-local caching:** Favor `'use cache'`, `cacheLife`, `cacheTag` over route-segment config (`revalidate`, `dynamic`).
- **Mutations must invalidate tags:** Use `updateTag` for immediate consistency or `revalidateTag` for background refresh.
- **PPR + generateStaticParams:** Do not return empty arrays; keep request-specific logic out of the shell.

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
- [ ] Mutations invalidate correct tags

### Review checklist

- [ ] Route segment config avoided unless required
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
