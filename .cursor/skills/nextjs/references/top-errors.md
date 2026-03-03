# Next.js 16 - Top 18 Errors & Solutions

**Last Updated**: 2025-10-24
**Prevention Rate**: 100% (all documented errors caught)

This guide covers the 18 most common errors when using Next.js 16 and their solutions.

---

## Error #1: `params` is a Promise

**Error Message**:

```
Type 'Promise<{ id: string }>' is not assignable to type '{ id: string }'
```

**Cause**: Next.js 16 changed `params` to async.

**Solution**:

```typescript
// ❌ Before (Next.js 15)
export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;
}

// ✅ After (Next.js 16)
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
}
```

**TypeScript Fix**:

```typescript
type Params<T = Record<string, string>> = Promise<T>;
```

---

## Error #2: `searchParams` is a Promise

**Error Message**:

```
Property 'query' does not exist on type 'Promise<{ query: string }>'
```

**Cause**: `searchParams` is now async in Next.js 16.

**Solution**:

```typescript
// ❌ Before
export default function Page({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  const query = searchParams.q;
}

// ✅ After
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q: query } = await searchParams;
}
```

---

## Error #3: `cookies()` requires await

**Error Message**:

```
'cookies' implicitly has return type 'any'
```

**Cause**: `cookies()` is async in Next.js 16.

**Solution**:

```typescript
// ❌ Before
import { cookies } from "next/headers";

export function MyComponent() {
  const cookieStore = cookies();
  const token = cookieStore.get("token");
}

// ✅ After
import { cookies } from "next/headers";

export async function MyComponent() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
}
```

---

## Error #4: `headers()` requires await

**Error Message**:

```
'headers' implicitly has return type 'any'
```

**Cause**: `headers()` is async in Next.js 16.

**Solution**:

```typescript
// ❌ Before
import { headers } from "next/headers";

export function MyComponent() {
  const headersList = headers();
}

// ✅ After
import { headers } from "next/headers";

export async function MyComponent() {
  const headersList = await headers();
}
```

---

## Error #5: Parallel route missing `default.js`

**Error Message**:

```
Error: Parallel route @modal/login was matched but no default.js was found
```

**Cause**: Next.js 16 requires `default.js` for all parallel routes.

**Solution**:

```typescript
// Create app/@modal/default.tsx
export default function ModalDefault() {
  return null;
}
```

**Structure**:

```
app/
├── @modal/
│   ├── login/
│   │   └── page.tsx
│   └── default.tsx  ← REQUIRED
```

---

## Error #6: `revalidateTag()` requires 2 arguments

**Error Message**:

```
Expected 2 arguments, but got 1
```

**Cause**: `revalidateTag()` API changed in Next.js 16.

**Solution**:

```typescript
// ❌ Before (Next.js 15)
import { revalidateTag } from "next/cache";
revalidateTag("posts");

// ✅ After (Next.js 16)
import { revalidateTag } from "next/cache";
revalidateTag("posts", "max"); // Second argument required
```

**Cache Life Profiles**:

- `'max'` - Maximum staleness (recommended)
- `'hours'` - Stale after hours
- `'days'` - Stale after days
- Custom: `{ stale: 3600, revalidate: 86400 }`

---

## Error #7: Cannot use React hooks in Server Component

**Error Message**:

```
You're importing a component that needs useState. It only works in a Client Component
```

**Cause**: Using React hooks in Server Component.

**Solution**: Add `'use client'` directive:

```typescript
// ✅ Add 'use client' at the top
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

---

## Error #8: `middleware.ts` is deprecated

**Warning Message**:

```
Warning: middleware.ts is deprecated. Use proxy.ts instead.
```

**Solution**: Migrate to `proxy.ts`:

```bash
# 1. Rename file
mv middleware.ts proxy.ts

# 2. Rename function
# middleware → proxy
```

**Code**:

```typescript
// ✅ proxy.ts
export function proxy(request: NextRequest) {
  // Same logic
}
```

---

## Error #9: Turbopack build failure

**Error Message**:

```
Error: Failed to compile with Turbopack
```

**Cause**: Turbopack is now default in Next.js 16.

**Solution 1** (opt-out):

```bash
npm run build -- --webpack
```

**Solution 2** (fix compatibility):
Check for incompatible packages and update them.

---

## Error #10: Invalid `next/image` src

**Error Message**:

```
Invalid src prop (https://example.com/image.jpg) on `next/image`. Hostname "example.com" is not configured
```

**Cause**: Remote images not configured.

**Solution**: Add to `next.config.ts`:

```typescript
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/images/**",
      },
    ],
  },
};
```

---

## Error #11: Cannot import Server Component into Client Component

**Error Message**:

```
You're importing a Server Component into a Client Component
```

**Cause**: Direct import of Server Component in Client Component.

**Solution**: Pass as children:

```typescript
// ❌ Wrong
'use client'
import { ServerComponent } from './server-component'

export function ClientComponent() {
  return <ServerComponent />
}

// ✅ Correct
'use client'

export function ClientComponent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

// Usage
<ClientComponent>
  <ServerComponent /> {/* Pass as children */}
</ClientComponent>
```

---

## Error #12: `generateStaticParams` not working

**Error Message**:

```
generateStaticParams is not generating static pages
```

**Cause**: Missing `dynamic = 'force-static'`.

**Solution**:

```typescript
export const dynamic = "force-static";

export async function generateStaticParams() {
  const posts = await fetch("/api/posts").then((r) => r.json());
  return posts.map((post: { id: string }) => ({ id: post.id }));
}
```

---

## Error #13: `fetch()` not caching

**Error Message**: Data not cached (performance issue).

**Cause**: Next.js 16 uses opt-in caching.

**Solution**: Add `"use cache"`:

```typescript
"use cache";

export async function getPosts() {
  const response = await fetch("/api/posts");
  return response.json();
}
```

---

## Error #14: Route collision with Route Groups

**Error Message**:

```
Error: Conflicting routes: /about and /(marketing)/about
```

**Cause**: Route groups creating same URL path.

**Solution**: Ensure unique paths:

```
app/
├── (marketing)/about/page.tsx     → /about
└── (shop)/store-info/page.tsx     → /store-info (NOT /about)
```

---

## Error #15: Metadata not updating

**Error Message**: SEO metadata not showing correctly.

**Cause**: Using static metadata for dynamic pages.

**Solution**: Use `generateMetadata()`:

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await fetch(`/api/posts/${id}`).then((r) => r.json());

  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

---

## Error #16: `next/font` font not loading

**Error Message**: Custom fonts not applying.

**Cause**: Font variable not applied to HTML element.

**Solution**:

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={inter.variable}> {/* ✅ Apply variable */}
      <body>{children}</body>
    </html>
  )
}
```

---

## Error #17: Environment variables not available in browser

**Error Message**: `process.env.SECRET_KEY` is undefined in client.

**Cause**: Server-only env vars not exposed to browser.

**Solution**: Prefix with `NEXT_PUBLIC_`:

```bash
# .env
SECRET_KEY=abc123                  # Server-only
NEXT_PUBLIC_API_URL=https://api    # Available in browser
```

```typescript
// Server Component (both work)
const secret = process.env.SECRET_KEY;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Client Component (only public vars)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

---

## Error #18: Server Action not found

**Error Message**:

```
Error: Could not find Server Action
```

**Cause**: Missing `'use server'` directive.

**Solution**:

```typescript
// ❌ Before
export async function createPost(formData: FormData) {
  await db.posts.create({ ... })
}

// ✅ After
'use server'

export async function createPost(formData: FormData) {
  await db.posts.create({ ... })
}
```

---

## Quick Error Lookup

| Error Type                | Solution                        | Link                                                                  |
| ------------------------- | ------------------------------- | --------------------------------------------------------------------- |
| Async params              | Add `await params`              | [#1](#error-1-params-is-a-promise)                                    |
| Async searchParams        | Add `await searchParams`        | [#2](#error-2-searchparams-is-a-promise)                              |
| Async cookies()           | Add `await cookies()`           | [#3](#error-3-cookies-requires-await)                                 |
| Async headers()           | Add `await headers()`           | [#4](#error-4-headers-requires-await)                                 |
| Missing default.js        | Create `default.tsx`            | [#5](#error-5-parallel-route-missing-defaultjs)                       |
| revalidateTag 1 arg       | Add `cacheLife` argument        | [#6](#error-6-revalidatetag-requires-2-arguments)                     |
| Hooks in Server Component | Add `'use client'`              | [#7](#error-7-cannot-use-react-hooks-in-server-component)             |
| middleware.ts deprecated  | Rename to `proxy.ts`            | [#8](#error-8-middlewarets-is-deprecated)                             |
| Turbopack failure         | Use `--webpack` flag            | [#9](#error-9-turbopack-build-failure)                                |
| Invalid image src         | Add `remotePatterns`            | [#10](#error-10-invalid-nextimage-src)                                |
| Import Server in Client   | Pass as children                | [#11](#error-11-cannot-import-server-component-into-client-component) |
| generateStaticParams      | Add `dynamic = 'force-static'`  | [#12](#error-12-generatestaticparams-not-working)                     |
| fetch not caching         | Add `'use cache'`               | [#13](#error-13-fetch-not-caching)                                    |
| Route collision           | Use unique paths                | [#14](#error-14-route-collision-with-route-groups)                    |
| Metadata not updating     | Use `generateMetadata()`        | [#15](#error-15-metadata-not-updating)                                |
| Font not loading          | Apply font variable to `<html>` | [#16](#error-16-nextfont-font-not-loading)                            |
| Env vars in browser       | Prefix with `NEXT_PUBLIC_`      | [#17](#error-17-environment-variables-not-available-in-browser)       |
| Server Action not found   | Add `'use server'`              | [#18](#error-18-server-action-not-found)                              |

---

## Prevention Checklist

Before deploying, check:

- [ ] All `params` are awaited
- [ ] All `searchParams` are awaited
- [ ] All `cookies()` calls are awaited
- [ ] All `headers()` calls are awaited
- [ ] All parallel routes have `default.js`
- [ ] `revalidateTag()` has 2 arguments
- [ ] Client Components have `'use client'`
- [ ] `middleware.ts` migrated to `proxy.ts`
- [ ] Remote images configured in `next.config.ts`
- [ ] Server Components not imported directly in Client Components
- [ ] Static pages have `dynamic = 'force-static'`
- [ ] Cached components have `'use cache'`
- [ ] No route collisions with Route Groups
- [ ] Dynamic pages use `generateMetadata()`
- [ ] Fonts applied to `<html>` or `<body>`
- [ ] Public env vars prefixed with `NEXT_PUBLIC_`
- [ ] Server Actions have `'use server'`
- [ ] Node.js version is 20.9+

---

## Debugging Tips

### Enable TypeScript Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Check Build Output

```bash
npm run build
```

Look for warnings and errors in build logs.

### Use Type Checking

```bash
npx tsc --noEmit
```

### Check Runtime Logs

```bash
npm run dev
```

Watch console for errors and warnings.

---

## Resources

- **Migration Guide**: `references/next-16-migration-guide.md`
- **Templates**: `templates/` directory
- **Next.js 16 Blog**: https://nextjs.org/blog/next-16
- **Support**: jeremy@jezweb.net
