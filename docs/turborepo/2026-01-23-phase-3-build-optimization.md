# Phase 3: Build Optimization

**Date:** 2026-01-23  
**Goal:** Optimize build strategy for each package (JIT vs Compiled)

---

## 📊 Current State Analysis

All packages currently use **JIT (Just-In-Time)** compilation:

- TypeScript files are exported directly via `exports` in package.json
- No build step (no `dist/` output)
- Apps consume raw `.ts`/`.tsx` files
- TypeScript compilation happens at app build time

### Package Analysis

| Package          | Files           | Strategy        | Reasoning                                                      |
| ---------------- | --------------- | --------------- | -------------------------------------------------------------- |
| `@asym/ui`       | 100+ components | **JIT** ✅      | React components, frequently changed, benefits from hot reload |
| `@asym/lib`      | 20+ utilities   | **JIT** ✅      | Mixed utilities, some React hooks, frequently changed          |
| `@asym/auth`     | 3 files         | **JIT** ✅      | React context/hooks, tightly coupled with apps                 |
| `@asym/database` | 10+ files       | **JIT** ✅      | Supabase clients, React hooks, types                           |
| `@asym/email`    | 5 files         | **Compiled** 🤔 | Pure Node.js, no React, could be pre-compiled                  |
| `@asym/config`   | 7 files         | **JIT** ✅      | Simple constants, no benefit from compilation                  |

---

## 🎯 Recommendation: Keep JIT for All Packages

### Why JIT is Better for This Monorepo

**Advantages:**

1. ✅ **Faster development** - No build step, instant changes
2. ✅ **Better debugging** - Source maps point to actual source files
3. ✅ **Simpler setup** - No build configuration needed
4. ✅ **Type safety** - Apps see actual TypeScript types, not compiled output
5. ✅ **Hot reload** - Changes reflect immediately in Next.js dev mode
6. ✅ **Tree shaking** - Apps can tree-shake unused exports at build time

**Disadvantages:**

1. ⚠️ Slightly slower app builds (apps compile packages)
2. ⚠️ Can't use packages outside this monorepo easily

### When to Use Compiled Strategy

Use compiled packages when:

- Package is published to npm (not our case - all packages are `private: true`)
- Package has complex build steps (Babel transforms, code generation)
- Package is rarely changed and large
- Package needs to run in non-TypeScript environments

**Our packages don't meet these criteria.**

---

## ✅ Decision: Keep JIT for All Packages

**No changes needed!** Current setup is optimal for:

- Next.js 16.1 with Turbopack
- Turborepo with internal packages
- Rapid development workflow

---

## 📝 Optional: Add Build Scripts (Future-Proofing)

If we ever need to publish packages or add build steps, here's the setup:

### For `@asym/email` (Pure Node.js)

```json
{
  "scripts": {
    "build": "tsc --project tsconfig.build.json",
    "dev": "tsc --watch --project tsconfig.build.json"
  }
}
```

### For React Packages (`@asym/ui`, `@asym/lib`)

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  }
}
```

**But we don't need this now!**

---

## 🚀 Phase 3 Status

✅ **COMPLETE** - Analysis done, decision made: **Keep JIT for all packages**

**No code changes required.**

---

## Next: Phase 4

Move to Phase 4: Environment Variables documentation.
