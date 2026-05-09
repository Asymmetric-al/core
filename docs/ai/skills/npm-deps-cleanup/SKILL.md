---
name: npm-deps-cleanup
description: Audit and reduce JavaScript package dependency footprint across npm, pnpm, Yarn, and Bun projects. Use when asked to remove unused dependencies, deduplicate workspace dependency versions, lockfiles or node_modules, analyze direct dependencies' transitive lockfile closure, find low-risk upgrades that reduce dependency trees, inline trivial dependencies, or apply e18e dependency replacement recommendations.
---

# npm Dependency Cleanup

Reduce JavaScript dependency footprint. Preserve the existing package manager, lockfile, workspace layout, and dependency range style unless there is a concrete reason to change them.

## Workflow

1. Establish the baseline.
2. Remove unused direct dependencies.
3. Deduplicate direct dependency versions in monorepos.
4. Rank direct dependencies by transitive lockfile closure.
5. Use closure data to find low-risk minor/patch upgrades.
6. Use closure data to find trivial dependencies worth inlining.
7. Check e18e recommendations for replacements/removals.
8. Reinstall, verify, and report measured impact.

## Package Manager Detection

Use the repo's existing package manager. Prefer explicit package metadata before lockfiles:

1. `packageManager` in the root `package.json`.
2. `devEngines.packageManager.name` in the root `package.json`.
3. Lockfile inference.

When `devEngines.packageManager` is present, use its `name` for npm, pnpm, Yarn, or Bun detection. Treat its `version` and `onFail` fields as policy signals, not as permission to change package managers.

Infer from lockfiles only when package metadata does not identify the package manager:

| Signal                                       | Package manager |
| -------------------------------------------- | --------------- |
| `package-lock.json` or `npm-shrinkwrap.json` | npm             |
| `pnpm-lock.yaml`                             | pnpm            |
| `yarn.lock`                                  | Yarn            |
| `bun.lock` or `bun.lockb`                    | Bun             |

Use the matching command family:

| Action                       | npm                           | pnpm                       | Yarn                           | Bun                             |
| ---------------------------- | ----------------------------- | -------------------------- | ------------------------------ | ------------------------------- |
| Install/update lockfile      | `npm install`                 | `pnpm install`             | `yarn install`                 | `bun install`                   |
| Remove direct dependency     | `npm uninstall <pkg>`         | `pnpm remove <pkg>`        | `yarn remove <pkg>`            | `bun remove <pkg>`              |
| Add/update direct dependency | `npm install <pkg>@<version>` | `pnpm add <pkg>@<version>` | `yarn add <pkg>@<version>`     | `bun add <pkg>@<version>`       |
| Explain dependency           | `npm explain <pkg>`           | `pnpm why <pkg>`           | `yarn why <pkg>`               | `bun pm why <pkg>` if available |
| Dedupe lockfile              | `npm dedupe`                  | `pnpm dedupe`              | `yarn dedupe` if available     | reinstall and inspect           |
| One-off tools                | `npx <tool>`                  | `pnpm dlx <tool>`          | `yarn dlx <tool>` if available | `bunx <tool>`                   |

## Safety Rules

- Work in small batches so lockfile diffs remain reviewable.
- Never trust unused-dependency tools blindly; verify imports, config files, scripts, generated code hooks, framework conventions, plugin names, CLIs, and dynamic imports.
- You may write scripting and parsing to verify package.json and lockfile dependency accounts.
- Treat `peerDependencies`, `optionalDependencies`, package `bin` usage, test fixtures, and published package manifests as higher risk.
- Do not remove or inline dependencies used for security, parsing, crypto, Unicode, URL handling, date/time, i18n, or platform compatibility unless the replacement is proven equivalent.
- Do not change package managers, delete lockfiles, or rewrite workspace structure as part of cleanup.
- Measure before and after: direct dependency count, lockfile line count or entry count, package count, and estimated `node_modules` size when available.

## Step 1: Baseline

Collect:

- All `package.json` files and workspace boundaries.
- Current package manager and lockfile.
- Direct dependency names by manifest section: `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`.
- Existing verification commands from scripts, CI, or repo docs.

Record baseline metrics before edits:

```sh
git status --short
wc -l <lockfile>
```

If `node_modules` is installed, also estimate installed footprint with platform-appropriate filesystem tools. Do not make footprint cleanup depend on `node_modules` being present; lockfile reductions are the primary metric.

## Step 2: Remove Unused Direct Dependencies

Use a static analyzer as a starting point, not as proof. Good candidates include `knip`, `depcheck`, or repo-native tooling if already configured. Run them through the detected package manager's one-off executor when they are not installed.

For each candidate:

1. Search code, configs, package scripts, build tooling, tests, and docs for the package name and known import paths.
2. Check whether the dependency is required by a published package manifest, peer contract, plugin loader, CLI command, or dynamic require/import.
3. Remove only when no real usage remains.
4. Reinstall with the detected package manager and run focused verification.

If usage is only in a script or config, consider moving between `dependencies` and `devDependencies` instead of removing.

## Step 3: Deduplicate Monorepo Direct Versions

In monorepos, look for the same direct dependency declared with multiple versions/ranges across package manifests. Use existing policy first: exact pins, caret ranges, catalog/protocol usage, workspace protocol, or central constraints.

Good approaches:

- Use `syncpack list-mismatches` or equivalent package-manager-neutral tooling for discovery.
- Standardize direct ranges when packages can share the same compatible version.
- Prefer manifest-level consistency before adding overrides/resolutions.
- Use overrides/resolutions only for transitive dependency convergence or security fixes, and document why.

After deduping, reinstall and inspect both manifest and lockfile diffs.

## Step 4: Rank Transitive Lockfile Closure

For each important direct dependency, estimate its closure: the set of transitive lockfile entries reachable from that direct dependency.

Report both:

- Total closure: all packages reachable from the dependency.
- Exclusive closure: packages that disappear if this dependency is removed and are not retained by other direct dependencies.

Prefer deterministic measurement over guesses. Package-manager-neutral fallback:

1. Save baseline lockfile metrics.
2. Temporarily remove one direct dependency from the owning manifest.
3. Run the detected package manager install.
4. Measure lockfile line/entry reduction and package count reduction.
5. Revert the temporary removal before measuring the next dependency.

Use `npm explain`, `pnpm why`, `yarn why`, or available package-manager graph commands to understand why large transitive packages exist. Rank dependencies by impact and risk, not just raw size.

## Step 5: Find Low-Risk High-Impact Upgrades

Use closure rankings to target direct dependencies whose newer minor/patch versions reduce transitive dependencies.

For each candidate:

1. Check available non-major versions with the package manager's outdated/info commands.
2. Review changelog/release notes for dependency tree changes and compatibility notes.
3. Upgrade one dependency or tight cluster at a time.
4. Reinstall and compare closure metrics before/after.
5. Run focused tests and relevant build/typecheck commands.

Avoid major upgrades unless the user explicitly accepts the migration risk.

## Step 6: Inline Trivial Usage

Use closure rankings to find direct dependencies with small, obvious usage in the codebase but large transitive cost.

Inline only when all are true:

- Usage is tiny and easy to fully characterize.
- Equivalent code is shorter or clearer than retaining the dependency.
- Behavior is covered by tests or can be covered with small characterization tests.
- The dependency is not solving cross-platform, security, parsing, Unicode, locale, or spec-compliance edge cases.

Prefer native APIs over new replacement dependencies when the required behavior is simple.

## Step 7: Apply e18e Guidance

Consult e18e for additional removal and replacement candidates:

```sh
<runner> @e18e/cli analyze
<runner> @e18e/cli migrate --dry-run
```

Replace `<runner>` with the detected one-off executor: `npx`, `pnpm dlx`, `yarn dlx`, or `bunx`.

Also check the e18e module replacements list at `https://e18e.dev/docs/replacements/` for known alternatives. Treat recommendations as candidates, not mandates; verify bundle/runtime behavior and run tests.

## Reporting

Summarize outcomes with measured impact:

- Direct dependencies removed or moved.
- Direct versions deduplicated.
- Lockfile line/entry reduction.
- Estimated package or `node_modules` reduction when available.
- High-impact candidates deferred and why.
- Verification commands run and results.

Call out risk explicitly when a removal depends on static analysis rather than runtime coverage.
