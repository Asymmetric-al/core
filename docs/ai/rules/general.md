# General Project Rules — Rules

**Name:** `general-rules`
**Purpose:** Baseline workflow, labeling, CI gates, and repo hygiene for Asymmetric.al.
Use this as the default rulebook for any repo change or AL-### issue workflow.

**Applies when:** Any change in this repo, especially AL-### issues, branches, commits, and PRs.
**Do not use when:** Working outside this repo or discussing non-repo topics.

## Rules

- **Project name:** Asymmetric.al
- **Issue key format:** `AL-###`
- **Production branch:** `production` is the protected Vercel Production Branch. Use
  `bun run release:production`; do not push directly to `production`.
- **Legacy branch:** the canonical repository has no `main` branch; do not
  create or target one. Deny-only deployment configuration may still mention it.
- **Tech stack (reference):** Next.js 16.3.0-preview.9 (App Router), React 19, TypeScript 5.9.x (see root `package.json` for exact version), Tailwind CSS 4, Supabase client libraries, package manager `bun`.
- **TypeScript roadmap prep:** `docs/guides/typescript-6-readiness.md` and `docs/ai/rules/typescript-future-proofing.md` (not a substitute for the version upgrade task).

### Label taxonomy (required for every issue)

- Complexity: `complexity:simple | complexity:easy | complexity:medium | complexity:hard`
- Status: `status:todo | status:blocked | status:needs-review | status:ready`
- Type: `type:bug | type:feature | type:chore | type:refactor | type:docs`

**Rule:** Exactly one label from each category. Do not mix multiple labels from the same category.

### CI gate

- Canonical PR/push readiness: `bun run ci:preflight`.
- `docs/ci.md` owns the exact stage order and dated live GitHub required-context
  inventory.
- Run focused commands while iterating. Fix formatting with `bun run format`,
  then prove the final result with `bun run ci:preflight`.

### File hygiene

- Keep changes minimal and localized to the task.
- Prefer small, atomic PRs.
- Do not manually edit generated files unless necessary.

### Documentation rule

- If build steps change, update `README.md` and `docs/CONTRIBUTING.md`.

## Workflow

1. **Issue:** Every change starts with a GitHub issue (`AL-###`).
2. **Branch:** Create a feature branch from the issue (e.g., `feature/AL-123-description` or `fix/AL-123-bug`).
3. **Implementation:** Make precise changes; validate locally as needed.
4. **PR:** Open a PR referencing the issue; ensure CI gates pass.

## Checklists

### Issue checklist

- [ ] Issue uses `AL-###` format
- [ ] Exactly one label from each category

### PR checklist

- [ ] Branch is not a direct production push to `production`
- [ ] `bun run ci:preflight` passes
- [ ] Changes are minimal and scoped

## Minimal examples

- Branch name: `feature/AL-123-add-metrics-card`
- CI command: `bun run ci:preflight`

## Common mistakes / pitfalls

- Skipping the issue or using a non-`AL-###` identifier
- Applying multiple labels from the same category
- Pushing directly to `production`
- Editing generated files without need
