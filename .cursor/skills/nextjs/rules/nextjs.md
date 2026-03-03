---
paths: "**/*.tsx", "**/*.ts", next.config.*, app/**/page.tsx, app/**/layout.tsx, app/**/route.ts
---

# Next.js 16 Corrections

Claude's training may reference Next.js 15 patterns. This project uses **Next.js 16**.

## Async Route Parameters (BREAKING)

```typescript
/* ❌ Next.js 15 (synchronous) */
export default function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { query: string };
}) {
  const slug = params.slug; // Error: params is a Promise
}

/* ✅ Next.js 16 (asynchronous) */
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ query: string }>;
}) {
  const { slug } = await params;
  const { query } = await searchParams;
}
```

## cookies() and headers() are Async

```typescript
/* ❌ Next.js 15 */
import { cookies, headers } from "next/headers";
const cookieStore = cookies();
const headersList = headers();

/* ✅ Next.js 16 */
const cookieStore = await cookies();
const headersList = await headers();
```

## middleware.ts → proxy.ts

```typescript
/* ❌ Deprecated in Next.js 16 */
// middleware.ts
export function middleware(request: NextRequest) { ... }

/* ✅ Use proxy.ts instead */
// proxy.ts
export function proxy(request: NextRequest) { ... }
```

## Parallel Routes: default.js Required

```
/* ❌ Will fail during soft navigation */
app/
├── @modal/
│   └── login/page.tsx

/* ✅ Add default.tsx to every parallel route */
app/
├── @modal/
│   ├── login/page.tsx
│   └── default.tsx  ← Required!
```

```typescript
// app/@modal/default.tsx
export default function ModalDefault() {
  return null;
}
```

## revalidateTag() Requires 2 Arguments

```typescript
/* ❌ Next.js 15 */
revalidateTag("posts");

/* ✅ Next.js 16 - second argument required */
revalidateTag("posts", "max");

// Or with custom cache life:
revalidateTag("posts", {
  stale: 3600,
  revalidate: 86400,
});
```

## Cache Components with "use cache"

```typescript
/* ❌ Next.js 15 - implicit caching */
export async function getData() {
  return fetch("/api/data").then((r) => r.json());
}

/* ✅ Next.js 16 - opt-in caching */
("use cache");
export async function getData() {
  return fetch("/api/data").then((r) => r.json());
}
```

## Quick Fixes

| If Claude suggests...           | Use instead...                                     |
| ------------------------------- | -------------------------------------------------- |
| `params: { id: string }`        | `params: Promise<{ id: string }>` + `await params` |
| `const cookieStore = cookies()` | `const cookieStore = await cookies()`              |
| `middleware.ts`                 | `proxy.ts`                                         |
| Missing `default.tsx` in @slots | Add `default.tsx` returning `null`                 |
| `revalidateTag('tag')`          | `revalidateTag('tag', 'max')`                      |
| Implicit fetch caching          | Add `'use cache'` directive                        |
| `experimental.ppr`              | Use `"use cache"` directive instead                |
