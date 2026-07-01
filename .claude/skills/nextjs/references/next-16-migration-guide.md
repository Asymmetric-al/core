# Next.js 16 Migration Guide

**From**: Next.js 15.x
**To**: Next.js 16.0.0
**Last Updated**: 2025-10-24

---

## Table of Contents

1. [Overview](#overview)
2. [Breaking Changes](#breaking-changes)
3. [New Features](#new-features)
4. [Migration Steps](#migration-steps)
5. [Automated Migration](#automated-migration)
6. [Manual Migration](#manual-migration)
7. [Troubleshooting](#troubleshooting)

---

## Overview

Next.js 16 introduces significant changes:

- **Breaking Changes**: 6 major breaking changes
- **New Features**: Cache Components, updated caching APIs, React 19.2
- **Performance**: Turbopack stable, 2–5× faster builds
- **Migration Time**: ~1-2 hours for medium-sized apps

**Recommendation**: Use automated codemod first, then manually fix remaining issues.

---

## Breaking Changes

### 1. Async Route Parameters ⚠️

**What Changed**: `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are now async.

**Before** (Next.js 15):

```typescript
export default function Page({ params, searchParams }) {
  const slug = params.slug;
  const query = searchParams.q;
}
```

**After** (Next.js 16):

```typescript
export default async function Page({ params, searchParams }) {
  const { slug } = await params;
  const { q: query } = await searchParams;
}
```

**TypeScript Types**:

```typescript
// Before
type PageProps = {
  params: { slug: string };
  searchParams: { q: string };
};

// After
type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q: string }>;
};
```

**Fix**:

1. Add `async` to function
2. Add `await` before params/searchParams
3. Update TypeScript types to `Promise<>`

---

### 2. Middleware → Proxy ⚠️

**What Changed**: `middleware.ts` is deprecated. Use `proxy.ts` instead.

**Migration**:

```bash
# 1. Rename file
mv middleware.ts proxy.ts

# 2. Rename function in file
# middleware → proxy
```

**Before** (middleware.ts):

```typescript
export function middleware(request: NextRequest) {
  return NextResponse.next();
}
```

**After** (proxy.ts):

```typescript
export function proxy(request: NextRequest) {
  return NextResponse.next();
}
```

**Note**: `middleware.ts` still works in Next.js 16 but is deprecated.

---

### 3. Parallel Routes Require `default.js` ⚠️

**What Changed**: All parallel routes now REQUIRE explicit `default.js` files.

**Before** (Next.js 15):

```
app/
├── @modal/
│   └── login/
│       └── page.tsx
```

**After** (Next.js 16):

```
app/
├── @modal/
│   ├── login/
│   │   └── page.tsx
│   └── default.tsx  ← REQUIRED
```

**default.tsx**:

```typescript
export default function ModalDefault() {
  return null;
}
```

**Fix**: Add `default.tsx` to every `@folder` in parallel routes.

---

### 4. Removed Features ⚠️

**Removed**:

- AMP support
- `next lint` command
- `serverRuntimeConfig` and `publicRuntimeConfig`
- `experimental.ppr` flag
- Automatic `scroll-behavior: smooth`
- Node.js 18 support

**Migration**:

**AMP**:

```typescript
// Before
export const config = { amp: true };

// After
// No direct replacement - use separate AMP pages or frameworks
```

**Linting**:

```bash
# Before
npm run lint

# After
npx eslint .
# or
npx biome lint .
```

**Runtime Config**:

```typescript
// Before
module.exports = {
  serverRuntimeConfig: { secret: "abc" },
  publicRuntimeConfig: { apiUrl: "https://api" },
};

// After
// Use environment variables
process.env.SECRET;
process.env.NEXT_PUBLIC_API_URL;
```

---

### 5. Version Requirements ⚠️

**Minimum Versions**:

- Node.js: 20.9+ (Node 18 removed)
- TypeScript: 5.1+
- React: 19.2+
- Browsers: Chrome 111+, Safari 16.4+, Firefox 109+

**Upgrade Node.js**:

```bash
# Check current version
node --version

# Upgrade (using nvm)
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version  # Should be 20.9+
```

---

### 6. Image Defaults Changed ⚠️

**What Changed**: `next/image` default settings changed.

| Setting    | Next.js 15  | Next.js 16     |
| ---------- | ----------- | -------------- |
| TTL        | 60s         | 4 hours        |
| imageSizes | 8 sizes     | 5 sizes        |
| qualities  | 3 qualities | 1 quality (75) |

**Impact**: Images cache longer, fewer sizes generated.

**Revert** (if needed):

```typescript
// next.config.ts
const config = {
  images: {
    minimumCacheTTL: 60, // Revert to 60 seconds
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Old sizes
  },
};
```

---

## New Features

### 1. Cache Components ✨

**Opt-in caching** with `"use cache"` directive.

**Before** (Next.js 15 - implicit caching):

```typescript
// All Server Components cached by default
export async function MyComponent() {
  const data = await fetch('/api/data')
  return <div>{data.value}</div>
}
```

**After** (Next.js 16 - opt-in):

```typescript
// NOT cached by default
export async function MyComponent() {
  const data = await fetch('/api/data')
  return <div>{data.value}</div>
}

// Opt-in to caching
'use cache'
export async function CachedComponent() {
  const data = await fetch('/api/data')
  return <div>{data.value}</div>
}
```

**See**: `references/cache-components-guide.md`

---

### 2. Updated Caching APIs ✨

**`revalidateTag()` now requires 2 arguments**:

**Before**:

```typescript
revalidateTag("posts");
```

**After**:

```typescript
revalidateTag("posts", "max"); // Second argument required
```

**New APIs**:

- `updateTag()` - Immediate refresh (read-your-writes)
- `refresh()` - Refresh uncached data only

---

### 3. React 19.2 Integration ✨

**New React features**:

- View Transitions
- `useEffectEvent()` (experimental)
- React Compiler (stable)

**See**: `references/react-19-integration.md`

---

### 4. Turbopack Stable ✨

**Default bundler**: Turbopack is now stable and default.

**Metrics**:

- 2–5× faster production builds
- Up to 10× faster Fast Refresh

**Opt-out** (if incompatible):

```bash
npm run build -- --webpack
```

---

## Migration Steps

### Step 1: Prerequisites

1. **Backup your project**:

   ```bash
   git commit -am "Pre-migration checkpoint"
   ```

2. **Check Node.js version**:

   ```bash
   node --version  # Should be 20.9+
   ```

3. **Update dependencies**:
   ```bash
   npm install next@16 react@19.2 react-dom@19.2
   ```

---

### Step 2: Run Automated Codemod

```bash
npx @next/codemod@canary upgrade latest
```

**What it fixes**:

- ✅ Async params (adds `await`)
- ✅ Async searchParams
- ✅ Async cookies()
- ✅ Async headers()
- ✅ Updates TypeScript types

**What it does NOT fix**:

- ❌ middleware.ts → proxy.ts (manual)
- ❌ Parallel routes default.js (manual)
- ❌ Removed features (manual)

---

### Step 3: Manual Fixes

#### Fix 1: Migrate middleware.ts → proxy.ts

```bash
# Rename file
mv middleware.ts proxy.ts

# Update function name
# middleware → proxy
```

#### Fix 2: Add default.js to Parallel Routes

```bash
# For each @folder, create default.tsx
touch app/@modal/default.tsx
touch app/@feed/default.tsx
```

```typescript
// app/@modal/default.tsx
export default function ModalDefault() {
  return null;
}
```

#### Fix 3: Replace Removed Features

**AMP**: Remove AMP config or migrate to separate AMP implementation.

**Linting**: Update scripts in `package.json`:

```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

**Runtime Config**: Use environment variables.

---

### Step 4: Update Caching

**Migrate from implicit to explicit caching**:

1. Find Server Components with expensive operations
2. Add `"use cache"` directive
3. Update `revalidateTag()` calls to include `cacheLife`

**Example**:

```typescript
// Before
export async function ExpensiveComponent() {
  const data = await fetch('/api/data') // Cached implicitly
  return <div>{data.value}</div>
}

// After
'use cache'
export async function ExpensiveComponent() {
  const data = await fetch('/api/data') // Cached explicitly
  return <div>{data.value}</div>
}
```

---

### Step 5: Test

```bash
# Development
npm run dev

# Production build
npm run build

# Check for errors
npm run type-check
```

---

### Step 6: Update CI/CD

**Update Node.js version** in CI config:

**.github/workflows/ci.yml**:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: "20.9" # Update from 18
```

**Dockerfile**:

```dockerfile
FROM node:20.9-alpine  # Update from node:18
```

---

## Automated Migration

**Codemod** (recommended):

```bash
npx @next/codemod@canary upgrade latest
```

**Options**:

- `--dry` - Preview changes without applying
- `--force` - Skip confirmation prompts

**What it migrates**:

1. ✅ Async params
2. ✅ Async searchParams
3. ✅ Async cookies()
4. ✅ Async headers()
5. ✅ TypeScript types

**Manual steps after codemod**:

1. Rename middleware.ts → proxy.ts
2. Add default.js to parallel routes
3. Replace removed features
4. Update caching patterns

---

## Manual Migration

If codemod fails or you prefer manual migration:

### 1. Async Params

**Find**:

```bash
grep -r "params\." app/
grep -r "searchParams\." app/
```

**Replace**:

```typescript
// Before
const slug = params.slug;

// After
const { slug } = await params;
```

### 2. Async Cookies/Headers

**Find**:

```bash
grep -r "cookies()" app/
grep -r "headers()" app/
```

**Replace**:

```typescript
// Before
const cookieStore = cookies();

// After
const cookieStore = await cookies();
```

### 3. TypeScript Types

**Find**: All `PageProps` types

**Replace**:

```typescript
// Before
type PageProps = {
  params: { id: string };
  searchParams: { q: string };
};

// After
type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q: string }>;
};
```

---

## Troubleshooting

### Error: `params` is a Promise

**Cause**: Not awaiting params in Next.js 16.

**Fix**:

```typescript
// ❌ Before
const id = params.id;

// ✅ After
const { id } = await params;
```

---

### Error: Parallel route missing `default.js`

**Cause**: Next.js 16 requires `default.js` for all parallel routes.

**Fix**: Create `default.tsx`:

```typescript
// app/@modal/default.tsx
export default function ModalDefault() {
  return null;
}
```

---

### Error: `revalidateTag` requires 2 arguments

**Cause**: `revalidateTag()` API changed in Next.js 16.

**Fix**:

```typescript
// ❌ Before
revalidateTag("posts");

// ✅ After
revalidateTag("posts", "max");
```

---

### Error: Turbopack build failure

**Cause**: Turbopack is now default in Next.js 16.

**Fix**: Opt-out if incompatible:

```bash
npm run build -- --webpack
```

---

### Error: Node.js version too old

**Cause**: Next.js 16 requires Node.js 20.9+.

**Fix**: Upgrade Node.js:

```bash
nvm install 20
nvm use 20
nvm alias default 20
```

---

## Migration Checklist

- [ ] Backup project (git commit)
- [ ] Check Node.js version (20.9+)
- [ ] Update dependencies (`npm install next@16 react@19.2 react-dom@19.2`)
- [ ] Run codemod (`npx @next/codemod@canary upgrade latest`)
- [ ] Rename middleware.ts → proxy.ts
- [ ] Add default.js to parallel routes
- [ ] Remove AMP config (if used)
- [ ] Replace runtime config with env vars
- [ ] Update `revalidateTag()` calls (add `cacheLife`)
- [ ] Add `"use cache"` where needed
- [ ] Test dev server (`npm run dev`)
- [ ] Test production build (`npm run build`)
- [ ] Update CI/CD Node.js version
- [ ] Deploy to staging
- [ ] Deploy to production

---

## Resources

- **Next.js 16 Blog**: https://nextjs.org/blog/next-16
- **Codemod**: `npx @next/codemod@canary upgrade latest`
- **Templates**: See `templates/` directory
- **Common Errors**: See `references/top-errors.md`

---

**Migration Support**: jeremy@jezweb.net
