# Turborepo Senior-Level Checklist

**Quick Reference for Code Reviews & New Packages**

---

## ✅ Package Creation Checklist

When creating a new package, ensure:

- [ ] Package has its own `package.json` with proper `name` and `exports`
- [ ] Package declares ALL its own dependencies (not relying on root)
- [ ] Package has `build` script (or explicit JIT marker)
- [ ] Package has `lint` script
- [ ] Package has `typecheck` script
- [ ] Package has `test` script (if applicable)
- [ ] Package exports point to correct location (`dist/` for compiled, `src/` for JIT)
- [ ] Package has proper `tsconfig.json` extending from `@asym/typescript-config`

---

## ✅ turbo.json Task Checklist

When adding a new task to `turbo.json`:

- [ ] Task has `dependsOn` (use `transit` for parallel tasks)
- [ ] Task has `outputs` array (if it produces files)
- [ ] Task has `env` array (if it reads environment variables)
- [ ] Task has `inputs` array (if it depends on specific files like `.env`)
- [ ] Task uses `$TURBO_DEFAULT$` in inputs (for source files)
- [ ] Task uses `$TURBO_ROOT$` for repo-root files
- [ ] Task has `cache: false` (only if truly non-cacheable)
- [ ] Task has `persistent: true` (only for long-running dev servers)

---

## ✅ Root package.json Checklist

Root `package.json` should ONLY have:

- [ ] `workspaces` configuration
- [ ] `scripts` that delegate to `turbo run <task>`
- [ ] `devDependencies` for repo-wide tools (turbo, prettier, eslint, husky)
- [ ] NO production `dependencies` (all should be in packages)
- [ ] NO task logic (no `vitest run`, `playwright test`, etc.)

---

## ✅ Environment Variables Checklist

- [ ] `.env` files are in packages that need them (not root)
- [ ] `globalEnv` only contains truly global vars (NODE_ENV, CI)
- [ ] Tasks that read env vars declare them in `env` array
- [ ] `.env` files are in `inputs` array for tasks that depend on them
- [ ] `globalDependencies` includes `**/.env.*local` and `**/.env`

---

## ✅ Cache Configuration Checklist

- [ ] Build tasks have `outputs` pointing to build artifacts
- [ ] TypeScript tasks have correct `outputs` (check `incremental` setting)
- [ ] Lint tasks have `outputs` for cache files (`.eslintcache`)
- [ ] Test tasks have `outputs` for coverage (`coverage/**`)
- [ ] Tasks use `transit` dependency for parallel execution
- [ ] No `dependsOn: ["^taskname"]` for tasks that can run in parallel

---

## ✅ Performance Optimization Checklist

- [ ] Packages that can be compiled have `build` scripts
- [ ] Compiled packages export from `dist/` not `src/`
- [ ] JIT packages explicitly marked (or documented)
- [ ] Transit node used for parallel tasks
- [ ] Cache hit rate > 80% (check with `--summarize`)
- [ ] Task graph shows parallel execution (check with `--graph`)

---

## 🚫 Anti-Patterns to Avoid

### Root Dependencies

```json
// ❌ WRONG
{
  "dependencies": {
    "react": "^19.0.0",
    "next": "16.1.1"
  }
}
```

### Root Task Logic

```json
// ❌ WRONG
{
  "scripts": {
    "test": "vitest run",
    "lint": "eslint ."
  }
}
```

### Missing Cache Config

```json
// ❌ WRONG
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
      // Missing: outputs, env, inputs
    }
  }
}
```

### Sequential When Parallel Possible

```json
// ❌ WRONG
{
  "tasks": {
    "lint": {
      "dependsOn": ["^lint"]  // Forces sequential
    }
  }
}

// ✅ CORRECT
{
  "tasks": {
    "transit": { "dependsOn": ["^transit"] },
    "lint": { "dependsOn": ["transit"] }  // Parallel + correct cache
  }
}
```

---

## 📊 Verification Commands

```bash
# Check task graph
turbo run build --graph

# Check cache performance
turbo run build --summarize

# Check parallel execution
turbo run lint test --graph

# Dry run with details
turbo run build --dry=json | jq '.tasks'

# Check for cache misses
turbo run build --dry --summarize
```

---

## 🎯 Quick Wins

1. **Add transit node** → Immediate parallel execution
2. **Add env arrays** → Correct cache invalidation
3. **Add outputs** → Enable caching for more tasks
4. **Move dependencies** → Clear package boundaries

---

## 📚 References

- [Full Audit Document](./2026-01-23-turborepo-senior-level-audit.md)
- [Turborepo Official Skill](https://skills.sh/vercel/turborepo/turborepo)
