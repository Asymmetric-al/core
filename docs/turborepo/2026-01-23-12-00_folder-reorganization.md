# Folder Reorganization

**Date:** 2026-01-23  
**Goal:** Improve project organization and structure

---

## ✅ Changes Made

### 1. Scripts Directory Reorganization

**Before:**

```
scripts/
├── setup (file)
├── verify (file)
├── setup-verify.sh
├── setup-codex-mcp.sh
├── setup.ps1
├── verify-e2e.mjs
├── verify-e2e-loop.mjs
├── verify-e2e-loop.sh
├── analyze-dependencies.sh
├── fix-component-imports.sh
├── fix-moved-component-imports.sh
├── fix-ui-imports.sh
└── remove-ts-nocheck.sh
```

**After:**

```
scripts/
├── setup/
│   ├── index.sh           # Main setup script
│   ├── index.ps1          # Windows setup
│   ├── verify.sh          # Setup verification
│   └── codex-mcp.sh       # MCP setup
├── verify/
│   ├── index.sh           # Main verify script
│   ├── e2e.mjs            # E2E test runner
│   ├── e2e-loop.mjs       # E2E test loop
│   └── e2e-loop.sh        # E2E loop wrapper
└── dev/
    ├── analyze-dependencies.sh
    ├── fix-component-imports.sh
    ├── fix-moved-component-imports.sh
    ├── fix-ui-imports.sh
    └── remove-ts-nocheck.sh
```

**Benefits:**

- ✅ Clear categorization (setup, verify, dev)
- ✅ Easier to find scripts
- ✅ Better organization for future scripts

---

### 2. AI Folders Moved to `docs/ai/`

**Before:**

```
core/
├── rules/
│   ├── general.md
│   ├── frontend.md
│   ├── backend.md
│   ├── testing.md
│   └── shadcn-studio-mcp.md
└── skills/
    ├── nextjs-app-router/
    ├── react-component-dev/
    ├── moai-library-shadcn/
    └── ... (14 skills total)
```

**After:**

```
core/
└── docs/
    └── ai/
        ├── rules/
        │   ├── general.md
        │   ├── frontend.md
        │   ├── backend.md
        │   ├── testing.md
        │   └── shadcn-studio-mcp.md
        ├── skills/
        │   ├── nextjs-app-router/
        │   ├── react-component-dev/
        │   ├── moai-library-shadcn/
        │   └── ... (14 skills total)
        ├── stack-registry.md
        └── working-set.md
```

**Benefits:**

- ✅ All AI-related docs in one place
- ✅ Cleaner root directory
- ✅ Better organization alongside other docs
- ✅ `AGENTS.md` updated with new paths

---

### 3. Documentation Folder Organized

**Before:**

```
docs/
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── DEVELOPER-GUIDE.md
├── MOCK-DATA.md
├── PWA_ICONS.md
├── RESPONSIVE.md
├── icons.md
├── ui-inventory.md
├── ui-sources.md
├── tanstack-integration.md
├── technical-decisions.md
├── mcp-config.example.toml
├── modules/
├── turborepo/
└── refactorturbo/
```

**After:**

```
docs/
├── README.md              # Documentation index
├── guides/                # Developer guides
│   ├── developer-guide.md
│   ├── contributing.md
│   ├── architecture.md
│   ├── technical-decisions.md
│   ├── mock-data.md
│   ├── responsive-design.md
│   ├── pwa-icons.md
│   ├── icons.md
│   ├── ui-inventory.md
│   ├── ui-sources.md
│   ├── tanstack-integration.md
│   └── mcp-config.example.toml
├── modules/               # Feature modules
├── turborepo/             # Turborepo migration
├── refactorturbo/         # Legacy migration docs
└── ai/                    # AI assistant config
    ├── rules/
    ├── skills/
    ├── stack-registry.md
    └── working-set.md
```

**Benefits:**

- ✅ All developer guides in one place
- ✅ Clear categorization by purpose
- ✅ Easier to find documentation
- ✅ Better onboarding experience
- ✅ `docs/README.md` provides navigation

---

## 📝 Files Updated

- **`AGENTS.md`** - Updated all paths to reference `docs/ai/rules/` and `docs/ai/skills/`
- **`docs/README.md`** - Created documentation index and navigation guide

---

## 🎯 Next Steps

### Task 3: Expand Test Coverage

**Planned:**

1. **Unit tests for `@asym/lib`:**
   - Create `packages/lib/__tests__/` directory
   - Add tests for utilities and hooks

2. **Unit tests for `@asym/database`:**
   - Create `packages/database/__tests__/` directory
   - Add tests for hooks and collections

3. **E2E tests for critical flows:**
   - `tests/e2e/auth.spec.ts` - Authentication flows
   - `tests/e2e/donations.spec.ts` - Donation flows
   - `tests/e2e/missionary-feed.spec.ts` - Social feed
   - `tests/e2e/admin-dashboard.spec.ts` - Admin features

---

## 📊 Summary

- ✅ **Scripts organized** into `setup/`, `verify/`, `dev/` subdirectories
- ✅ **AI folders moved** to `docs/ai/` for better organization
- ✅ **Documentation organized** into `docs/guides/` with clear structure
- ✅ **AGENTS.md updated** with new paths
- ✅ **docs/README.md created** for navigation
- 🔄 **Test expansion** - Next task

**Project structure is now cleaner and more maintainable!** 🎉
