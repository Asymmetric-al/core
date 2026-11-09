---
source_name: uzairansaruzi/p3-stack (p3-mode and the p3-stack pack)
source_url: https://github.com/uzairansaruzi/p3-stack/tree/09909ebb5c0125e27fad3e57d96b81e832696d69/skills/p3-mode
source_type: github
upstream_path: skills/p3-mode/
reviewed_commit: 09909ebb5c0125e27fad3e57d96b81e832696d69
reviewed_commit_date: 2026-10-05
upstream_skill_md_sha256: 804902c52be09d48429a4e67f95d4243fce6b198dea2012ba41d1fe0f1622cba
upstream_license_sha256: 84195d1f9f76cc9ad7c1290981473fc725d9d255dfccc9bbe40d5639928158e2
skills_lock_hash: a1a7f767f90a4b9cafcefb4ee0a7462abf71f0b3c999c1e53ce1a69917db397f
license: MIT (Copyright (c) 2026 Lauren Tan; Copyright (c) 2026 Uzair Ansar, T3 Code adaptation); preserved byte-exact as `LICENSE`
ownership: canonical
last_reviewed: 2026-11-09
---

# Upstream: p3-stack pack

This file records the provenance of `p3-mode` and of the whole p3-stack pack
import. Every other p3-stack skill has a short `references/upstream.md` that
points here.

- **Repository:** https://github.com/uzairansaruzi/p3-stack
- **Reviewed commit:** `09909ebb5c0125e27fad3e57d96b81e832696d69`
  (`skills: port pstack to T3 Code`, 2026-10-05). It was the remote `HEAD` and
  `main` when the pack was imported on 2026-11-09.
- **Lineage:** p3-stack adapts
  [pstack](https://github.com/cursor/plugins/tree/main/pstack) by poteto for
  T3 Code. Its upstream `README.md` credits the skills, principles, and
  language to pstack.
- **License:** MIT, from the repository-root `LICENSE`. Every vendored skill
  directory carries a byte-exact copy as `LICENSE`.
- **Lock entries:** 51 entries in `skills-lock.json` with
  `source: uzairansaruzi/p3-stack`. `skills@1.5.7` wrote every
  `computedHash`. Each one equals the CLI's folder hash of the upstream skill
  directory at the reviewed commit with LF line endings.

## Import scope

All 51 upstream skills were imported. That is 24 `principle-*` skills plus
`architect`, `arena`, `automate-me`, `benchmark-checklist`, `blast-radius`,
`bro`, `correct`, `create-verification-skill`, `figure-it-out`, `how`,
`interrogate`, `maintain-verification-skill`, `make-bot-ui`, `no-comments`,
`p3-help`, `p3-mode`, `recall`, `reflect`, `setup-p3`, `show-me-your-work`,
`swarm`, `tdd`, `teach`, `technical-writing`, `typescript-best-practices`,
`unslop`, and `why`. `p3-mode` routes to the others by name, so the pack is
imported whole.

| Upstream                  | Core location                                                     |
| ------------------------- | ----------------------------------------------------------------- |
| `skills/<name>/`          | `docs/ai/skills/<name>/`                                          |
| `skills/tdd/`             | `docs/ai/skills/p3-tdd/` (Core already has a different `tdd`)     |
| `skills/teach/`           | `docs/ai/skills/p3-teach/` (Core already has a different `teach`) |
| `agents/p3-agent.md`      | `docs/ai/skills/p3-mode/references/agents/p3-agent.md`            |
| `agents/comment-sicko.md` | `docs/ai/skills/p3-mode/references/agents/comment-sicko.md`       |
| `LICENSE`                 | `LICENSE` in every vendored skill directory                       |

Not imported: `install.sh` (Core installs through `bun run skills:sync`),
`README.md`, the contributor guide `AGENTS.md` (a nested `AGENTS.md` would
become a Codex instruction file), and `.gitignore`. The two `agents/` files are
prompt briefs for delegated workers, not harness agent definitions, so they are
not published to `.cursor/agents/` or `.claude/agents/`.

`skills/show-me-your-work/scripts/log.sh` keeps its upstream executable mode
(`100755`). `scripts/lib/skill-file-modes.mjs` registers it as a reviewed
executable. The script only appends one sanitized row to a TSV log. Refresh
never runs it.

## Core adaptations

Upstream text is unchanged except for the items below and Prettier formatting.
`unslop/SKILL.md` is excluded from Prettier in `.prettierignore` because
Prettier would renumber its deliberately non-contiguous, citable rule list.

1. **Renames.** `tdd` became `p3-tdd` and `teach` became `p3-teach`, including
   each frontmatter `name`. `p3-help` links and names, and the `bug-fix`
   playbook reference, point at the renamed skills.
2. **Paths.** References to the pack root `agents/` briefs, and the
   `skills/` paths in `agents/p3-agent.md` and the `multi-phase-plan`
   playbook, point at the canonical copies under `docs/ai/skills/`. The
   `p3-help` install step, public
   link base, and README link describe this repository instead of the upstream
   checkout. The README link is pinned to the reviewed commit.
3. **Base branch.** Branch instructions that name `main` use `develop` in
   `automate-me`, `interrogate`, `no-comments`, `comment-sicko.md`, and the
   `autopilot-full`, `multi-phase-plan`, and `opening-a-pr` playbooks.
4. **Upstream fixes.** These repair upstream defects that review found.
   - `architect/references/runner-prompt.md` links `rationale-template.md`
     relative to its own directory. Upstream doubled the `references/`
     segment.
   - `architect` passes its runner prompt and rationale template to delegates
     by repository path, because a delegate resolves a bare `references/` path
     from the repository root.
   - `swarm` treats `inherit-parent`, the value `setup-p3` writes, as the
     parent model, as `arena` and `interrogate` already do.
   - `show-me-your-work` names its helper by repository path,
     `docs/ai/skills/show-me-your-work/scripts/log.sh`.
   - The `hillclimb` playbook keeps its per-attempt `decision.tsv` as a
     separate log beside the six-column show-me-your-work trail, and
     `.gitignore` ignores `decision.tsv` as the playbook promises.
   - `p3-help` no longer starts `p3-mode` for a work request. `p3-mode` is
     explicit-only here, so `p3-help` tells the user to invoke it.
5. **Overlays.** Each `SKILL.md` ends with a marked Core overlay
   (`<!-- CORE-OVERLAY-START -->` to `<!-- CORE-OVERLAY-END -->`) holding
   invocation, authorization, and skill-specific Core rules.
6. **Codex discovery.** Every skill whose upstream frontmatter sets
   `disable-model-invocation: true` (all except `p3-help`) has
   `agents/openai.yaml` with `allow_implicit_invocation: false`, so Codex
   keeps the same explicit-only routing as Claude Code and Cursor.
7. **Client map.** `references/core-adapter.md` maps the T3 Code tools to Claude
   Code, Codex, and Cursor and states the pack-wide Core rules.
8. **Provenance.** `references/upstream.md` in each skill and this file.

The exact rewrites, with expected match counts, were applied by a one-off
reviewed import. Each rewrite had to match its expected count exactly or the
import stopped.

## Refresh workflow

This pack is **not** updated by `bun run skills:refresh-upstream`.

1. Clone the upstream at a pinned commit with LF bytes:
   `git -c core.autocrlf=false clone https://github.com/uzairansaruzi/p3-stack.git`.
   Review the complete diff from the reviewed commit, including new, removed,
   and renamed skills, executable modes, and the `LICENSE`.
2. In an isolated scratch directory outside this repository, stage the lock
   entries with LF bytes:
   `npx --yes skills@1.5.7 add uzairansaruzi/p3-stack --skill <every upstream skill> --agent codex --copy -y`.
   On Windows, run it with `core.autocrlf=false` in the Git configuration the
   CLI sees. Confirm the staged trees match the reviewed checkout byte for byte.
3. Reconcile each upstream change into `docs/ai/skills/<name>/`. Keep the
   renames, the adaptations above, the overlays, `agents/openai.yaml`, and
   provenance. Copy the entries into `skills-lock.json`, keyed by the Core
   name for renamed skills. Never hand-write a `computedHash`.
4. Run `bunx prettier --write` on the changed canonical files, then
   `bun run skills:sync` and `bun run skills:verify`.
5. Update the commit, dates, and hashes in every p3-stack `references/upstream.md`,
   then run `node scripts/update-skill-audit-hashes.mjs --skill <name>` for each
   changed skill and update its `docs/ai/skill-source-audit.json` record.
6. Run `bunx vitest run tests/unit/docs` and `bun run ci:preflight`.
