# Cache Components (Next.js) — Skill

Use this skill when working in a Next.js App Router codebase with **Cache Components enabled** (e.g. `cacheComponents: true`) or when adopting **Partial Prerendering (PPR)**.

## Goal

Build pages with:
- a mostly static shell
- cached shared data/components
- dynamic, request-specific UI streamed behind `<Suspense>`

Priorities: **correctness → performance → ergonomics**.

---

## Core rules

### 1) Cached vs dynamic
If a component/function does I/O:

**Cached (preferred when shared across users)**
- Add `'use cache'`
- Optionally set `cacheLife(...)`
- Add `cacheTag(...)`

**Dynamic (required when request-specific)**
- Uses `cookies()`, `headers()`, auth/session, or request-derived `searchParams`
- Must render behind `<Suspense>`

**Rule of thumb:** shared = cache, user-specific = dynamic + Suspense.

### 2) No request context inside cache
Never access `cookies()`, `headers()`, auth/session, or request-derived values inside a `'use cache'` scope.

If request data is needed:
- read it outside the cache
- pass only safe inputs into cached functions
- or keep the whole thing dynamic

### 3) Cached functions must be async
Any function or component using `'use cache'` must be `async`.

### 4) Prefer code-local caching
Avoid route-segment config:
- `export const revalidate`
- `export const dynamic`

Prefer:
- `'use cache'`
- `cacheLife(...)`
- `cacheTag(...)`
- `updateTag(...)` / `revalidateTag(...)`

### 5) Mutations must invalidate tags
After data mutations:
- Use `updateTag(tag)` for immediate consistency
- Or `revalidateTag(tag)` for background refresh

---

## Patterns

### Cached shared data
- `'use cache'`
- semantic tags
- appropriate cache lifetime

### Dynamic user-specific UI
- no caching
- isolate behind `<Suspense>`

### Hybrid pages
- static shell
- cached shared data
- small streamed dynamic sections

---

## Error fixes

**Request data outside Suspense**
- Move into a component rendered inside `<Suspense>`

**Uncached data outside Suspense**
- Add `'use cache'` or move behind `<Suspense>`

**Request data inside cache**
- Split request logic from cached logic
- Or make the component dynamic

---

## PPR + generateStaticParams
- Never return an empty array
- Use params to generate reusable shells
- Keep request-specific logic out of the shell

---

## Review checklist

- Shared data is cached
- Cached scopes have tags
- No request data inside cache
- Dynamic UI is isolated and streamed
- Mutations invalidate correct tags
- Segment config avoided unless required

---

## Tag conventions

- Collection: `products`
- Scoped: `products:${category}`
- Entity: `product:${id}`

Invalidate the smallest correct scope.

---

## Examples

### Cached function
```ts
'use cache'

import { cacheLife, cacheTag } from 'next/cache'

export async function getProducts(category: string) {
  cacheLife('minutes')
  cacheTag('products')
  cacheTag(`products:${category}`)
}
```

### Dynamic Suspense boundary
```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      <MainCached />
      <Suspense fallback={null}>
        <UserPanel />
      </Suspense>
    </>
  )
}
```

### Mutation invalidation
```ts
'use server'

import { updateTag } from 'next/cache'

export async function updateProduct(id: string) {
  updateTag(`product:${id}`)
  updateTag('products')
}
```
