# Turborepo Senior-Level Audit & Improvement Plan

**Date**: 2026-01-23  
**Project**: Asymmetric.al Core  
**Current Status**: Basic Turborepo setup ✅ | Senior-level optimization ❌

---

## Executive Summary

The project has successfully migrated to Turborepo with a working monorepo structure. However, based on the [official Turborepo skill documentation](https://skills.sh/vercel/turborepo/turborepo), there are **critical gaps** preventing this from being a senior-level implementation.

### Critical Issues Found

1. ❌ **Root-level dependencies anti-pattern** - All app/package dependencies in root `package.json`
2. ❌ **Missing package-level scripts** - Tasks not properly distributed to packages
3. ❌ **Incomplete cache configuration** - Missing `outputs`, `inputs`, and `env` declarations
4. ❌ **No transit nodes** - Parallel tasks with cache invalidation not optimized
5. ❌ **Root `.env` anti-pattern** - Environment variables not scoped to packages
6. ❌ **Missing package builds** - No build outputs for shared packages
7. ⚠️ **Inconsistent task patterns** - Some tasks bypass Turborepo parallelization

---

## 1. Root Dependencies Anti-Pattern

### Current State (WRONG)

```json
// Root package.json has 90+ production dependencies
{
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.12",
    "@supabase/supabase-js": "^2.89.0",
    "next": "16.1.1",
    "react": "19.2.3"
    // ... 80+ more
  }
}
```

### Why This Is Wrong

- Defeats monorepo isolation principles
- All packages get all dependencies (even ones they don't need)
- Impossible to track which package needs which dependency
- Security risk: packages access dependencies they shouldn't
- Breaks Turborepo's dependency graph optimization

### Senior-Level Pattern (CORRECT)

```
Root package.json:
  - devDependencies: turbo, prettier, eslint, husky (repo tools only)
  - dependencies: NONE

Apps/Packages:
  - Each declares only its own dependencies
  - Shared packages installed via workspace protocol
```

### Action Required

1. Move ALL production dependencies from root to their consuming packages
2. Keep only repo-wide tooling in root devDependencies
3. Use `workspace:*` protocol for internal packages

---

## 2. Package Tasks Anti-Pattern

### Current State (WRONG)

Root `package.json` has task logic that should be in packages:

```json
{
  "scripts": {
    "test:unit": "vitest run", // ❌ Root task logic
    "test:e2e": "playwright test", // ❌ Root task logic
    "format": "prettier . --write" // ❌ Root task logic
  }
}
```

### Why This Is Wrong

- Defeats Turborepo's parallelization
- Cannot cache per-package
- Cannot run tasks selectively with `--filter`
- Violates "Package Tasks, Not Root Tasks" principle

### Senior-Level Pattern (CORRECT)

```json
// apps/admin/package.json
{
  "scripts": {
    "dev": "next dev --port 3030",
    "build": "next build",
    "lint": "eslint .",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  }
}

// packages/ui/package.json
{
  "scripts": {
    "build": "tsc",  // Compile to dist/
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}

// Root package.json - ONLY delegates
{
  "scripts": {
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test"
  }
}
```

### Action Required

1. Add `build`, `lint`, `test`, `typecheck` scripts to EVERY package
2. Remove task logic from root scripts (keep only `turbo run` delegation)
3. Ensure packages can run independently

---

## 3. Missing Cache Configuration

### Current State (INCOMPLETE)

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
      // ❌ Missing: env, inputs for .env files
    },
    "lint": {
      "dependsOn": ["^lint"],
      "outputs": [".next/cache/eslint/**", ".eslintcache"]
      // ✅ Good: has outputs
    },
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "outputs": ["tsconfig.tsbuildinfo", "*.tsbuildinfo"]
      // ⚠️ Check: Does tsc actually produce these?
    }
  }
}
```

### Issues

1. **Missing `env` declarations** - Build tasks don't declare which env vars affect cache
2. **Missing `.env` in inputs** - Changes to `.env` files won't invalidate cache
3. **Incorrect `typecheck` outputs** - `tsc --noEmit` produces NO files unless `incremental: true`

### Senior-Level Pattern (CORRECT)

```json
{
  "globalEnv": ["NODE_ENV"],
  "globalDependencies": ["**/.env.*local", "**/.env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": ["NODE_ENV", "NEXT_PUBLIC_*", "SUPABASE_*"],
      "inputs": ["$TURBO_DEFAULT$", ".env", ".env.*"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"],
      // Only add outputs if incremental: true in tsconfig
      "outputs": ["node_modules/.cache/tsbuildinfo.json"]
    }
  }
}
```

### Action Required

1. Add `env` arrays to all tasks that read environment variables
2. Add `.env` files to `inputs` for tasks that depend on them
3. Verify `typecheck` outputs match actual tsc configuration
4. Use `$TURBO_ROOT$` for repo-root files in inputs

---

## 4. Missing Transit Nodes for Parallel Optimization

### Problem

Tasks like `lint` and `test` can run in parallel (don't need built output) but MUST invalidate cache when dependency source changes.

Current `dependsOn: ["^lint"]` forces sequential execution (slow).

### Senior-Level Pattern (CORRECT)

```json
{
  "tasks": {
    "transit": {
      "dependsOn": ["^transit"]
    },
    "lint": {
      "dependsOn": ["transit"], // Parallel + correct cache
      "outputs": [".eslintcache"]
    },
    "test": {
      "dependsOn": ["transit"], // Parallel + correct cache
      "outputs": ["coverage/**"]
    }
  }
}
```

### Action Required

1. Add `transit` task to `turbo.json`
2. Change `lint`, `test`, `typecheck` to depend on `transit` instead of `^taskname`
3. Verify parallel execution with `turbo run lint test --graph`

---

## 5. Root `.env` Anti-Pattern

### Current State (WRONG)

```
core/
├── .env              # ❌ Which packages use this?
├── apps/
│   ├── admin/
│   ├── missionary/
│   └── donor/
```

### Why This Is Wrong

- Unclear which packages consume which variables
- All packages get all variables (security risk)
- Coarse-grained cache invalidation
- Bad habits for scaling

### Senior-Level Pattern (CORRECT)

```
core/
├── apps/
│   ├── admin/
│   │   └── .env      # ✅ Clear: admin needs DATABASE_URL
│   ├── missionary/
│   │   └── .env      # ✅ Clear: missionary needs API_KEY
│   └── donor/
│       └── .env      # ✅ Clear: donor needs STRIPE_KEY
└── packages/
    └── database/
        └── .env      # ✅ Clear: database needs SUPABASE_URL
```

### Action Required

1. Move `.env` files into each app/package that needs them
2. Document which variables each package requires
3. Use `globalEnv` only for truly shared variables (NODE_ENV, CI)

---

## 6. Missing Package Build Outputs

### Current State

Packages like `@asym/ui`, `@asym/database`, `@asym/lib` have NO build step:

```json
// packages/ui/package.json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
    // ❌ No "build" script!
  }
}
```

### Why This Is Wrong

- Apps import directly from source files (slow, no optimization)
- TypeScript compiled on every import (defeats caching)
- Cannot use different tsconfig for package vs consumers
- Breaks "JIT vs Compiled" best practice

### Senior-Level Pattern (CORRECT)

**Option A: Compiled Packages (Recommended for libraries)**

```json
// packages/ui/package.json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "./components/*": "./dist/components/*.js"
  },
  "scripts": {
    "build": "tsc --project tsconfig.build.json",
    "dev": "tsc --watch"
  }
}
```

**Option B: JIT Packages (For Next.js-specific code)**

```json
// packages/ui/package.json
{
  "exports": {
    "./components/*": "./components/*.tsx" // Source files
  },
  "scripts": {
    "build": "echo 'JIT package - no build needed'"
  }
}
```

### Action Required

1. Decide JIT vs Compiled for each package
2. Add `build` scripts to compiled packages
3. Update `exports` to point to `dist/` for compiled packages
4. Add `tsconfig.build.json` for build-specific settings

---

## 7. Inconsistent Task Patterns

### Current Issues

```json
// Root package.json
{
  "scripts": {
    "test": "bun run test:unit", // ❌ Bypasses Turborepo
    "test:unit": "vitest run", // ❌ Root task logic
    "format": "prettier . --write" // ❌ Not in turbo.json
  }
}
```

### Action Required

1. Move `test:unit` to each package
2. Add `format` task to `turbo.json` if needed repo-wide
3. Use `turbo run` for all parallelizable tasks

---

## Implementation Priority

### Phase 1: Critical Fixes (Week 1)

1. ✅ Add `transit` task to `turbo.json`
2. ✅ Update cache configuration (env, inputs, outputs)
3. ✅ Add package-level scripts to all packages
4. ✅ Fix `typecheck` outputs configuration

### Phase 2: Dependency Refactor (Week 2)

1. ⚠️ Move dependencies from root to packages (HIGH RISK - test thoroughly)
2. ⚠️ Verify all imports still work
3. ⚠️ Update CI/CD if needed

### Phase 3: Build Optimization (Week 3)

1. 🔧 Decide JIT vs Compiled for each package
2. 🔧 Add build scripts to compiled packages
3. 🔧 Update package exports
4. 🔧 Test build performance

### Phase 4: Environment Variables (Week 4)

1. 📝 Document which packages need which env vars
2. 📝 Move `.env` files to packages (if beneficial)
3. 📝 Update documentation

---

## Verification Commands

After each phase, run these commands to verify:

```bash
# Verify task graph
turbo run build --graph

# Verify cache hits
turbo run build --summarize

# Verify parallel execution
turbo run lint test --graph

# Verify dependency graph
turbo run build --dry=json | jq '.tasks'

# Check for cache misses
turbo run build --dry --summarize
```

---

## Expected Performance Improvements

### Current State

- ❌ Sequential task execution
- ❌ Cache misses on env changes
- ❌ No package-level parallelization
- ❌ Slow TypeScript compilation (no build cache)

### After Senior-Level Implementation

- ✅ Parallel task execution (3-5x faster CI)
- ✅ Correct cache invalidation (90%+ cache hit rate)
- ✅ Package-level parallelization (2-3x faster local dev)
- ✅ Optimized TypeScript builds (5-10x faster rebuilds)

---

## References

- [Turborepo Official Skill](https://skills.sh/vercel/turborepo/turborepo)
- [Package Tasks, Not Root Tasks](https://skills.sh/vercel/turborepo/turborepo#important-package-tasks-not-root-tasks)
- [Transit Nodes Pattern](https://skills.sh/vercel/turborepo/turborepo#transit-nodes-for-parallel-tasks-with-cache-invalidation)
- [Environment Variables Best Practices](https://skills.sh/vercel/turborepo/turborepo#root-env-file-in-monorepo)
- [JIT vs Compiled Packages](https://skills.sh/vercel/turborepo/turborepo#best-practices)

---

## Next Steps

1. **Review this document** with the team
2. **Prioritize phases** based on current pain points
3. **Create AL-### issues** for each phase
4. **Test thoroughly** in a feature branch before merging
5. **Update CI/CD** to leverage new Turborepo features

---

## Reflection & Analysis

### Current State Assessment

The project has successfully adopted Turborepo's basic structure but is missing critical optimizations that define a senior-level implementation. The most significant issues are:

1. **Architectural**: Root dependencies defeat monorepo isolation
2. **Performance**: Missing transit nodes and cache configuration limit parallelization
3. **Maintainability**: Unclear dependency boundaries and missing build steps

### Scalability Concerns

As the project grows:

- Root dependencies will become unmanageable (100+ deps)
- Cache misses will increase build times exponentially
- Unclear package boundaries will lead to circular dependencies
- Missing build steps will slow down CI/CD pipelines

### Recommended Approach

Start with **Phase 1** (cache configuration and transit nodes) for immediate performance gains with minimal risk. Phase 2 (dependency refactor) is the most impactful but also highest risk - consider doing this incrementally, one package at a time.

The investment in proper Turborepo setup will pay dividends as the team scales and the codebase grows. A senior-level implementation should handle 50+ packages and 100+ developers without performance degradation.
