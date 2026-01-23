# Turborepo Compliance Audit

**Date:** 2026-01-23  
**Reference:** https://skills.sh/vercel/turborepo/turborepo  
**Goal:** Verify current setup follows official Vercel Turborepo best practices

---

## ✅ What We're Doing RIGHT

### 1. **Package Tasks, Not Root Tasks** ✅

**Rule:** DO NOT create Root Tasks. ALWAYS create package tasks.

**Our Setup:**

```json
// Root package.json - ONLY delegates ✅
{
  "scripts": {
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  }
}

// apps/admin/package.json - Tasks in packages ✅
{
  "scripts": {
    "build": "next build",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

**Status:** ✅ **CORRECT** - Root only delegates via `turbo run`, actual task logic is in packages.

---

### 2. **Using `turbo run` in Scripts** ✅

**Rule:** Always use `turbo run` when the command is written into code.

**Our Setup:**

```json
{
  "scripts": {
    "build": "turbo run build", // ✅ CORRECT
    "lint": "turbo run lint", // ✅ CORRECT
    "dev": "turbo run dev" // ✅ CORRECT
  }
}
```

**Status:** ✅ **CORRECT** - All scripts use `turbo run`, not shorthand `turbo`.

---

### 3. **Transit Nodes for Parallel Tasks** ✅

**Rule:** Use transit nodes for tasks that can run in parallel but need cache invalidation.

**Our Setup:**

```json
{
  "tasks": {
    "transit": {
      "dependsOn": ["^transit"]
    },
    "lint": {
      "dependsOn": ["transit"], // ✅ Parallel + cache invalidation
      "outputs": [".next/cache/eslint/**", ".eslintcache"]
    },
    "typecheck": {
      "dependsOn": ["transit"], // ✅ Parallel + cache invalidation
      "outputs": ["tsconfig.tsbuildinfo", "*.tsbuildinfo"]
    }
  }
}
```

**Status:** ✅ **CORRECT** - Transit node allows `lint` and `typecheck` to run in parallel while invalidating cache when dependencies change.

---

### 4. **Build Task Configuration** ✅

**Rule:** Build tasks should have `dependsOn: ["^build"]` and `outputs`.

**Our Setup:**

```json
{
  "build": {
    "dependsOn": ["^build"], // ✅ Build dependencies first
    "outputs": [".next/**", "!.next/cache/**", "dist/**"], // ✅ Cache outputs
    "env": ["NODE_ENV", "NEXT_PUBLIC_*", "SUPABASE_*"], // ✅ Hash env vars
    "inputs": ["$TURBO_DEFAULT$", ".env", ".env.*"] // ✅ Track .env files
  }
}
```

**Status:** ✅ **CORRECT** - Proper dependency chain, outputs, env vars, and inputs.

---

### 5. **Environment Variables Hashed** ✅

**Rule:** Declare env vars in `env` array so cache invalidates when they change.

**Our Setup:**

```json
{
  "globalEnv": ["NODE_ENV", "VERCEL", "VERCEL_ENV"], // ✅ Global vars
  "tasks": {
    "build": {
      "env": ["NEXT_PUBLIC_*", "SUPABASE_*"] // ✅ Task-specific vars
    }
  }
}
```

**Status:** ✅ **CORRECT** - Env vars are properly declared and hashed.

---

### 6. **`.env` Files in Inputs** ✅

**Rule:** Include `.env` files in `inputs` or `globalDependencies` so changes invalidate cache.

**Our Setup:**

```json
{
  "globalDependencies": ["**/.env.*local", "**/.env"], // ✅ Global tracking
  "tasks": {
    "build": {
      "inputs": ["$TURBO_DEFAULT$", ".env", ".env.*"] // ✅ Task-level tracking
    }
  }
}
```

**Status:** ✅ **CORRECT** - `.env` files tracked at both global and task level.

---

### 7. **Dev Task Configuration** ✅

**Rule:** Dev tasks should have `cache: false` and `persistent: true`.

**Our Setup:**

```json
{
  "dev": {
    "cache": false, // ✅ Don't cache dev servers
    "persistent": true // ✅ Long-running process
  }
}
```

**Status:** ✅ **CORRECT** - Dev task properly configured for long-running servers.

---

### 8. **Outputs for File-Producing Tasks** ✅

**Rule:** Tasks that produce files should declare `outputs` for caching.

**Our Setup:**

```json
{
  "build": {
    "outputs": [".next/**", "!.next/cache/**", "dist/**"] // ✅ Next.js + dist
  },
  "lint": {
    "outputs": [".next/cache/eslint/**", ".eslintcache"] // ✅ ESLint cache
  },
  "typecheck": {
    "outputs": ["tsconfig.tsbuildinfo", "*.tsbuildinfo"] // ✅ TS incremental
  }
}
```

**Status:** ✅ **CORRECT** - All file-producing tasks have outputs declared.

---

## ⚠️ Areas for Improvement

### 1. **Root `.env` File** ⚠️

**Rule:** A `.env` file at the repo root is an anti-pattern.

**Our Setup:**

```
core/
├── .env.local              # ⚠️ Root env file
├── apps/
│   ├── admin/.env.local
│   ├── missionary/.env.local
│   └── donor/.env.local
```

**Issue:**

- Root `.env.local` affects all packages implicitly
- Unclear which packages depend on which variables
- Cache invalidation is coarse-grained

**Recommendation:**

- **Option 1 (Ideal):** Remove root `.env.local`, put env vars only in app-specific `.env.local` files
- **Option 2 (Pragmatic):** Keep for development convenience, but document which vars are used where
- **Option 3 (Explicit):** Use `globalEnv` to be explicit about shared vars

**Status:** ⚠️ **ACCEPTABLE for development**, but not ideal for production patterns.

---

### 2. **JIT Compilation (No Build Outputs)** ⚠️

**Rule:** Packages should either be compiled or use JIT intentionally.

**Our Setup:**

- All packages (`@asym/ui`, `@asym/lib`, `@asym/database`, etc.) use **JIT compilation**
- TypeScript files exported directly via `exports` in package.json
- No `dist/` output, no build step

**Status:** ⚠️ **INTENTIONAL CHOICE** - Documented in Phase 3 as optimal for this monorepo.

**Pros:**

- ✅ Faster development
- ✅ Better debugging
- ✅ Hot reload works perfectly

**Cons:**

- ❌ Slightly slower app builds
- ❌ Can't publish packages to npm

**Recommendation:** ✅ **Keep as-is** - This is a valid pattern for internal packages in a Turborepo monorepo.

---

## 📊 Compliance Score

| Category              | Status         | Score |
| --------------------- | -------------- | ----- |
| Package Tasks         | ✅ Correct     | 10/10 |
| `turbo run` Usage     | ✅ Correct     | 10/10 |
| Transit Nodes         | ✅ Correct     | 10/10 |
| Build Configuration   | ✅ Correct     | 10/10 |
| Environment Variables | ✅ Correct     | 10/10 |
| `.env` File Tracking  | ✅ Correct     | 10/10 |
| Dev Task Config       | ✅ Correct     | 10/10 |
| Outputs Declaration   | ✅ Correct     | 10/10 |
| Root `.env` Pattern   | ⚠️ Acceptable  | 7/10  |
| JIT vs Compiled       | ✅ Intentional | 10/10 |

**Overall Score:** 97/100 ✅

---

## 🎯 Summary

Your Turborepo setup is **excellent** and follows official best practices almost perfectly!

**Strengths:**

- ✅ Proper task delegation (root → packages)
- ✅ Correct use of `turbo run` in scripts
- ✅ Transit nodes for parallel execution with cache invalidation
- ✅ Comprehensive environment variable tracking
- ✅ Proper outputs declaration for all file-producing tasks
- ✅ Intentional JIT compilation strategy (documented)

**Minor Improvements:**

- ⚠️ Root `.env.local` file (acceptable for development, but consider per-app env files for production)

**Verdict:** 🎉 **Your Turborepo setup is production-ready and follows Vercel best practices!**

---

## 📚 References

- **Official Turborepo Skill:** https://skills.sh/vercel/turborepo/turborepo
- **Phase 3 Documentation:** `docs/turborepo/2026-01-23-phase-3-build-optimization.md`
- **Phase 4 Documentation:** `docs/turborepo/2026-01-23-phase-4-environment-variables.md`
