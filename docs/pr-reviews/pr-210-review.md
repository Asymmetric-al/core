# PR #210 Review - Add mattpocock skills

- URL: https://github.com/Asymmetric-al/core/pull/210
- Base: `epic`
- Head: `cursor/add-grill-me-skill-e45e`
- Draft: no
- GitHub state at review: `BEHIND`, `REVIEW_REQUIRED`
- Size: 83 changed files, +3,850 / -1
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/epic`: clean.

Command run in `/tmp/core-pr-review`:

```sh
bun install --frozen-lockfile && bun run ci:preflight
```

Result: failed at the first preflight gate.

Failure:

- `prettier . --check` reported `AGENTS.md`.

Because preflight stops on failure, later gates were not run locally.

## Verdict

Do not merge until formatting and skill-lock consistency are fixed.

## Findings

### P1 - Merged tree fails the required local gate

Evidence: `bun run ci:preflight` fails during `format` because `AGENTS.md` is not Prettier-compliant.

Impact: the branch cannot pass the repo's normal merge gate.

Suggested fix:

- Run `prettier AGENTS.md --write`.
- Re-run `bun run ci:preflight`.

### P2 - `skills-lock.json` hash does not match committed skill bytes

Evidence: computed SHA-256 for `.agents/skills/grill-me/SKILL.md` and `.cursor/skills/grill-me/SKILL.md` was `74147eb6010a65957efef2b9e0f0b3ff935c1def7fc117697151b1d0f3610556`, while `skills-lock.json` line 25 has `784f0dbb7403b0f00324bce9a112f715342777a0daee7bbb7385f9c6f0a170ea`.

Impact: the lockfile cannot prove the checked-in skill content.

Suggested fix:

- Re-run the skill install/update workflow that owns this lockfile, or update the lock hash intentionally.
- Run `bun run skills:verify`.

### P2 - Skill ownership is unclear

Evidence: new Matt Pocock skills are under `.agents`/`.cursor` mirrors but not `docs/ai/skills/`, while repo instructions say canonical skills live in `docs/ai/skills`.

Impact: maintainers may not know whether these skills are canonical repo skills, optional mirrored skills, or external pack content.

Suggested fix:

- Add canonical copies under `docs/ai/skills/`, or
- Update `AGENTS.md`/OpenSpec to state these are optional mirror-only installs and how they refresh.

### P2 - `grill-me` wording is ambiguous for durable repo instructions

Evidence: the skill uses first-person wording such as "Interview me relentlessly".

Impact: durable agent instructions should be agent-directed, not ambiguous about who is speaking.

Suggested fix:

- Reword to agent-directed phrasing, or explicitly state the upstream text is preserved verbatim.

## Required Before Merge

- Format `AGENTS.md`.
- Fix skill lock hash consistency.
- Clarify ownership of mirror-only skills.
- Rebase because the PR is `BEHIND`.
- Re-run full preflight.
