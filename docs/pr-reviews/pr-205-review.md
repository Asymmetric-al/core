# PR #205 Review - Harden shared Tiptap editor behavior and add comprehensive unit coverage

- URL: https://github.com/Asymmetric-al/core/pull/205
- Base: `epic`
- Head: `codex/audit-and-refine-tiptap-editor-implementation`
- Draft: no
- GitHub state at review: `BEHIND`, `CHANGES_REQUESTED`
- Size: 14 changed files, +1,053 / -1
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/epic`: clean.

Command run in `/tmp/core-pr-review`:

```sh
bun install --frozen-lockfile && bun run ci:preflight
```

Result: passed, including 110 test files and 469 tests.

## Verdict

Mergeable from this review's current local evidence after rebasing. Older PR-thread blockers around broken Tiptap mocks and formatting appear resolved at the current head because the full merged-tree preflight is green.

## Findings

No P0-P2 issues found at the reviewed head.

Review notes:

- `packages/ui/components/shadcn/rich-text-editor/link-bubble-menu.tsx` adds accessible labels and guards `element instanceof HTMLElement` before `contains`.
- `packages/ui/components/shadcn/rich-text-editor/toolbar.tsx` adds accessible names and explicit `type="button"` where needed.
- New Tiptap/editor tests are active; no skipped tests were found under `tests/unit/packages/ui/components/shadcn/rich-text-editor`.
- The root `package.json` now duplicates `@tiptap/react` and `sonner` versions already present in `packages/ui/package.json`; this is acceptable as test infrastructure if kept aligned, but should not drift.

## Required Before Merge

- Rebase because the PR is `BEHIND`.
- Re-run `ci:preflight` after rebase.
- If dependency versions change, ensure root test-only deps and `packages/ui` deps remain aligned.
