# PR #211 Review - Remove Orchids.app metadata and committed tool cruft

- URL: https://github.com/Asymmetric-al/core/pull/211
- Base: `epic`
- Head: `cursor/remove-orchids-artifact-a8e4`
- Draft: no
- GitHub state at review: `BEHIND`, `REVIEW_REQUIRED`
- Size: 20 changed files, +9 / -218
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/epic`: clean.

Command run in `/tmp/core-pr-review`:

```sh
bun install --frozen-lockfile && bun run ci:preflight
```

Result: passed, including 104 test files and 440 tests.

## Verdict

No P0-P2 code issues found. This is a clean hygiene PR after rebasing.

## Findings

No P0-P2 issues found in the changed behavior.

Non-blocking note: the title focuses on Orchids, but the cleanup also removes `.tmp`, `.traycer`, and root-literal `~/` artifacts. The title/body should mention the full cleanup scope for history search.

Suggested fix:

- Update the PR body or title to mention all artifact families removed.
- Confirm root-only ignore entries such as `/.tmp/` and `/~/` are intentional.

## Required Before Merge

- Rebase because the PR is `BEHIND`.
- Re-run `ci:preflight` if the rebase changes the final tree.
