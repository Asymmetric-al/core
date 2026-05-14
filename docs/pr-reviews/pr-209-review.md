# PR #209 Review - Add canonical repo-entry skill and Skill Routing entry

- URL: https://github.com/Asymmetric-al/core/pull/209
- Base: `epic`
- Head: `cursor/add-repo-entry-skill-e45e`
- Draft: no
- GitHub state at review: `BEHIND`, `REVIEW_REQUIRED`
- Size: 7 changed files, +117 / -5
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/epic`: clean.

Commands run in `/tmp/core-pr-review`:

```sh
bun run skills:verify
bun install --frozen-lockfile && bun run ci:preflight
```

Result: passed, including 104 test files and 440 tests.

## Verdict

No blocking issues. Small wording fixes would make the new skill contract clearer.

## Findings

### P2 - Root skill pointer omits `skills:verify`

Evidence: root `SKILL.md` line 10 only tells maintainers to run `bun run skills:sync`.

Impact: mirrored skill drift can survive if contributors sync but do not verify.

Suggested fix:

- Change the pointer to require both `bun run skills:sync` and `bun run skills:verify`.

### P2 - Trigger wording is inconsistent

Evidence: `AGENTS.md` says the skill is for when unsure where rules live; `docs/ai/skills/repo-entry/SKILL.md` frontmatter says to load it at the start of work in this monorepo.

Impact: agents may either over-load it every turn or skip it when it is intended as default orientation.

Suggested fix:

- Pick one contract:
  - default entry skill for all repo work, or
  - fallback when routing is unclear.
- Align `AGENTS.md` and skill frontmatter.

### P2 - "Optional extra packs" terminology could be closer to repo wording

Impact: minor documentation drift.

Suggested fix:

- Use wording such as "optional tool-specific or ecosystem skills" if that matches the rest of the repo instruction system.

## Required Before Merge

- Rebase because the PR is `BEHIND`.
- Apply wording fixes if desired.
- Re-run `skills:verify` and preflight after any changes.
