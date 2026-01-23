# Turborepo Migration & Optimization Documentation

This directory contains comprehensive documentation for upgrading the Asymmetric.al Core project from a basic Turborepo setup to a **senior-level implementation** based on [official Turborepo best practices](https://skills.sh/vercel/turborepo/turborepo).

---

## 📋 Documents

### 1. [Senior-Level Audit](./2026-01-23-turborepo-senior-level-audit.md)

**Comprehensive analysis** of current state vs. senior-level patterns.

**Key Findings:**

- ❌ Root dependencies anti-pattern (90+ deps in root)
- ❌ Missing package-level scripts
- ❌ Incomplete cache configuration
- ❌ No transit nodes for parallel optimization
- ❌ Root `.env` anti-pattern
- ❌ Missing package build outputs

**Includes:**

- Detailed problem descriptions
- Senior-level patterns (correct implementations)
- Action items for each issue
- 4-phase implementation plan
- Performance improvement estimates

### 2. [Quick Checklist](./2026-01-23-turborepo-quick-checklist.md)

**Quick reference** for code reviews and new package creation.

**Use this for:**

- Creating new packages
- Adding tasks to `turbo.json`
- Reviewing PRs
- Verifying cache configuration
- Identifying anti-patterns

---

## 🎯 Quick Summary

### Current State

```
✅ Basic Turborepo structure
✅ Monorepo with apps/ and packages/
✅ Workspace protocol for internal deps
❌ Root dependencies (defeats isolation)
❌ Root task logic (defeats parallelization)
❌ Incomplete cache config (cache misses)
❌ No package builds (slow imports)
```

### Target State

```
✅ Package-level dependencies
✅ Package-level task scripts
✅ Complete cache configuration
✅ Transit nodes for parallel execution
✅ Compiled packages with build outputs
✅ 90%+ cache hit rate
✅ 3-5x faster CI/CD
```

---

## 🚀 Implementation Phases

### Phase 1: Critical Fixes (Week 1) - **START HERE**

- Add `transit` task to `turbo.json`
- Update cache configuration (env, inputs, outputs)
- Add package-level scripts
- Fix `typecheck` outputs

**Impact:** Immediate performance gains, low risk

### Phase 2: Dependency Refactor (Week 2) - **HIGH RISK**

- Move dependencies from root to packages
- Verify all imports still work
- Update CI/CD if needed

**Impact:** Highest impact, highest risk - test thoroughly

### Phase 3: Build Optimization (Week 3)

- Decide JIT vs Compiled for each package
- Add build scripts to compiled packages
- Update package exports

**Impact:** Long-term performance, moderate complexity

### Phase 4: Environment Variables (Week 4)

- Document which packages need which env vars
- Move `.env` files to packages (if beneficial)
- Update documentation

**Impact:** Better maintainability, low risk

---

## 📊 Expected Performance Improvements

| Metric             | Current | Target   | Improvement      |
| ------------------ | ------- | -------- | ---------------- |
| CI Build Time      | ~10 min | ~2-3 min | **3-5x faster**  |
| Cache Hit Rate     | ~40%    | ~90%     | **2.25x better** |
| Local Dev Rebuild  | ~30s    | ~10s     | **3x faster**    |
| TypeScript Rebuild | ~20s    | ~2s      | **10x faster**   |

---

## 🔍 Verification Commands

After implementing changes, verify with:

```bash
# Check task graph (should show parallel execution)
turbo run build --graph

# Check cache performance (should show >80% hit rate)
turbo run build --summarize

# Check parallel execution
turbo run lint test --graph

# Detailed task analysis
turbo run build --dry=json | jq '.tasks'
```

---

## 📚 Key Principles

### 1. Package Tasks, Not Root Tasks

**Root `package.json` should ONLY delegate to `turbo run`**

```json
// ✅ CORRECT
{
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test"
  }
}

// ❌ WRONG
{
  "scripts": {
    "test": "vitest run",
    "lint": "eslint ."
  }
}
```

### 2. Transit Nodes for Parallel Tasks

**Use transit nodes for tasks that can run in parallel but need cache invalidation**

```json
{
  "tasks": {
    "transit": { "dependsOn": ["^transit"] },
    "lint": { "dependsOn": ["transit"] }, // Parallel + correct cache
    "test": { "dependsOn": ["transit"] } // Parallel + correct cache
  }
}
```

### 3. Complete Cache Configuration

**Every task should declare its cache inputs**

```json
{
  "tasks": {
    "build": {
      "outputs": [".next/**", "dist/**"],
      "env": ["NODE_ENV", "NEXT_PUBLIC_*"],
      "inputs": ["$TURBO_DEFAULT$", ".env", ".env.*"]
    }
  }
}
```

---

## 🎓 References

- [Turborepo Official Skill](https://skills.sh/vercel/turborepo/turborepo)
- [Package Tasks Pattern](https://skills.sh/vercel/turborepo/turborepo#important-package-tasks-not-root-tasks)
- [Transit Nodes Pattern](https://skills.sh/vercel/turborepo/turborepo#transit-nodes-for-parallel-tasks-with-cache-invalidation)
- [Environment Variables](https://skills.sh/vercel/turborepo/turborepo#root-env-file-in-monorepo)
- [Best Practices](https://skills.sh/vercel/turborepo/turborepo#best-practices)

---

## 🤝 Contributing

When adding new packages or tasks:

1. Review the [Quick Checklist](./2026-01-23-turborepo-quick-checklist.md)
2. Follow the patterns in the [Audit Document](./2026-01-23-turborepo-senior-level-audit.md)
3. Verify with the commands above
4. Update this documentation if patterns change
