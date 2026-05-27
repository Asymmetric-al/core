# PR #219 Review - Add npm-deps-cleanup skill

- URL: https://github.com/Asymmetric-al/core/pull/219
- Base: `production`
- Head: `cursor/add-npm-deps-cleanup-skill-002d`
- Draft: yes
- GitHub state at review: `BEHIND`, `REVIEW_REQUIRED`
- Size: 14 changed files, +588 / -1
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/production`: clean.

Command run in `/tmp/core-pr-review`:

```sh
bun install --frozen-lockfile && bun run ci:preflight
```

Result: passed.

## Verdict

No P0-P2 code issues found in this review. The only merge blocker is process state: the PR is still draft.

## Findings

### P2 - Draft PR

Impact: the owner has not marked this as merge-ready.

Suggested fix:

- Keep it open as draft until maintainers accept the vendored skill and generated mirrors.
- When marking ready, include the intended ownership model for this skill and whether it is canonical or mirror-only.

## Required Before Merge

- Mark ready for review.
- Re-run `bun run skills:verify` and the full preflight if the skill content changes.
