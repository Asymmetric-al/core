# PR #206 Review - OpenSpec Guardian and QA Foreman agents; streaming shells and env helpers

- URL: https://github.com/Asymmetric-al/core/pull/206
- Base: `production`
- Head: `cursor/openspec-guardian-qa-foreman-and-surface-updates`
- Draft: no
- GitHub state at review: `DIRTY`, `CHANGES_REQUESTED`
- Size: 34 changed files, +4,995 / -3,839
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/production`: failed.

Conflicts:

- `apps/admin/app/events/page.tsx`
- `apps/donor/app/(dashboard)/donor-dashboard/wallet/page.tsx`
- `apps/missionary/app/tasks/page.tsx`

Tests were not run because the PR does not produce a merged tree against current `production`.

## Verdict

Do not merge. The branch conflicts with current route work and has a confirmed env-loading correctness issue.

## Findings

### P1 - Current branch cannot merge into `production`

Impact: the final route-shell behavior and env changes cannot be tested until conflicts are resolved.

Suggested fix:

- Rebase onto current `production`.
- Resolve the route conflicts.
- Re-run full preflight.

### P1 - Double `loadEnvConfig` does not load app-local env as intended

Evidence: all three app `next.config.ts` files call `loadEnvConfig(WORKSPACE_ROOT)` and then `loadEnvConfig(appDir)`. `@next/env` caches after the first load unless forced, so the second call can return cached root results.

Impact: app-specific `.env.local` values may never load even though the code implies they do.

Suggested fix:

- Establish one env-loading contract:
  - load from the app dir if app overrides are intended, or
  - load root only if root is the sole source.
- If two loads are required, verify `forceReload` behavior against Next 16.2.1 and document why it is safe.
- Add a small env smoke test with a variable present only in `apps/<app>/.env.local`.

### P1 - Dev script overwrites app-local env files

Evidence: `scripts/sync-root-env-to-apps.mjs` copies root `.env.local` into every app-local `.env.local` before dev scripts.

Impact: app-specific secrets and local overrides can be silently erased.

Suggested fix:

- Prefer symlinks or root `loadEnvConfig`.
- If copying stays, make it explicit opt-in and refuse to overwrite by default.
- Print exact "copied/overwritten" paths.

### P2 - New instruction docs and working-set notes understate the actual blast radius

Evidence: the PR adds OpenSpec Guardian / QA Foreman instruction docs but also changes app UI shells, package scripts, `next.config.ts`, and UI components.

Impact: docs and PR title make the branch look instruction-focused while it changes runtime/dev behavior.

Suggested fix:

- Split runtime route/env changes from instruction-system changes.
- Update working-set entries and PR description to match any scope that remains.

### P2 - Stale "snippet" comment in wallet client code

Evidence: `apps/donor/app/(dashboard)/donor-dashboard/wallet/wallet-page-client.tsx` contains a comment saying sub-forms were moved "for brevity in this snippet".

Impact: production code reads like pasted sample code.

Suggested fix:

- Delete the comment or replace it with a real maintenance note.

### P2 - Agent/rule docs have Markdown hierarchy issues

Evidence: new `.cursor/agents/*` and `docs/ai/rules/*` content has list/heading nesting that makes default stance and fallback instructions ambiguous.

Suggested fix:

- Convert those sections into explicit headings and tight bullet lists.
- Keep generated marker/source-of-truth notes intact.

## Required Before Merge

- Resolve conflicts.
- Fix env-loading semantics.
- Remove or gate env-file copying.
- Split the PR or update scope docs honestly.
- Run full preflight on the resolved tree.
