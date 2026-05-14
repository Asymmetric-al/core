# PR #207 Review - Add core UI route cleanup guardrails

- URL: https://github.com/Asymmetric-al/core/pull/207
- Base: `epic`
- Head: `codex/core-ui-route-cleanup`
- Draft: no
- GitHub state at review: `DIRTY`, `CHANGES_REQUESTED`
- Size: 60 changed files, +9,476 / -5,958
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/epic`: failed.

Conflicts:

- `apps/admin/app/events/page.tsx`
- `apps/admin/app/reports/page.tsx`
- `apps/donor/app/(dashboard)/donor-dashboard/feed/page.tsx`
- `apps/donor/app/(dashboard)/donor-dashboard/history/page.tsx`
- `apps/donor/app/(dashboard)/donor-dashboard/wallet/page.tsx`
- `apps/missionary/app/analytics/page.tsx`
- `apps/missionary/app/tasks/page.tsx`
- `tests/unit/apps/admin/tanstack-surface-imports.test.ts`
- `tests/unit/apps/donor/donor-history-tanstack.test.ts`
- `tests/unit/virtualization-pilots.test.ts`

Tests were not run because the PR does not produce a merged tree against current `epic`.

## Verdict

Do not merge. The PR is conflict-heavy and combines route cleanup, env behavior, agent workflow docs, and an unrelated PDF OpenSpec pack.

## Findings

### P1 - Current branch cannot merge into `epic`

Impact: the route split touches files that have since changed on `epic`, so the final behavior cannot be reviewed or tested without conflict resolution.

Suggested fix:

- Rebase onto current `epic`.
- Resolve all route/test conflicts.
- Run `bun install --frozen-lockfile && bun run ci:preflight` on the resolved tree.

### P1 - PR scope includes unrelated PDF OpenSpec and agent workflow changes

Evidence: the diff includes `openspec/changes/build-pdf-document-builder/**`, `.cursor/agents/*`, `.cursor/rules/*`, and `docs/ai/rules/*` alongside route split files.

Impact: the title and review intent are route cleanup, but the branch changes product planning and agent workflow surfaces too.

Suggested fix:

- Split the PDF OpenSpec pack into its own PR.
- Split agent workflow docs into a separate PR if they are intended to ship.
- Keep this PR focused on App Router route wrappers, loading fallbacks, and guardrail tests.

### P1 - Dev scripts copy secret-bearing `.env.local` files by default

Evidence: `scripts/sync-root-env-to-apps.mjs` is wired into `dev:*` scripts and copies root `.env.local` into app-local `.env.local` files.

Impact: this duplicates secrets and can overwrite intentional per-app local overrides every time a dev server starts.

Suggested fix:

- Remove the default copy step from `dev:*` scripts and rely on root `loadEnvConfig` or documented symlinks, or
- Make copying opt-in with a clear flag and explicit overwrite messaging.

### P2 - Route cleanup contract tests do not cover every route moved

Evidence: the diff moves wallet, events, and tasks into `*-page-client` files, but the new contract tests focus on only part of the moved set.

Impact: regressions in some route wrappers/loading fallbacks can pass the new guardrail suite.

Suggested fix:

- Add all moved routes to the route-wrapper and loading-path tables.
- Keep the test names focused on route boundaries and loading behavior.

### P2 - Route cleanup tests overfit source text and presentation details

Evidence: `tests/unit/apps/ui-route-cleanup-contracts.test.ts` asserts exact class strings, motion tokens, chart color strings, and labels.

Impact: harmless design/copy edits can fail a route-boundary test.

Suggested fix:

- Split route-wrapper tests from presentation guardrails.
- Assert behavior/constraints such as "no `transition-all`" or "uses tokenized chart colors" instead of full incidental class strings.

### P2 - Cursor/runtime docs duplicate canonical workflow docs without source notes

Evidence: `.cursor/agents/*`, `.cursor/rules/*.mdc`, and `docs/ai/rules/*.md` describe overlapping OpenSpec Guardian and QA Foreman behavior.

Impact: maintainers may edit the wrong copy and create drift.

Suggested fix:

- Add headers to runtime copies that name the canonical source.
- Add or reuse a sync/verify workflow if the files are generated mirrors.

## Required Before Merge

- Resolve all conflicts.
- Split unrelated PDF and agent-doc work.
- Remove or gate env copying.
- Complete route test coverage for all moved routes.
- Run full preflight on the resolved branch.
