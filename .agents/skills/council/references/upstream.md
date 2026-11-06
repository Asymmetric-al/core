---
source_name: t3dotgg/tstack (council)
source_url: https://github.com/t3dotgg/tstack
source_type: github
upstream_path: skills/council/SKILL.md
reviewed_commit: 1085050f3baed1ac724caa4a8166145fb2ac88af
reviewed_commit_date: 2026-10-27
upstream_skill_md_sha256: 598fb2c7cdd48ddd9643cb22999e1b624c357aa6579aa0af0e7268ae16a8a164
upstream_license_sha256: 8095f9a9f97d074131f6a2ce09b952d12c18b36f09f4e5df0517c4e64e82c851
skills_lock_hash: a1993f93b9157a8c73d4b8c16da267a3addd2bec94bcffb6b5f4caea23a8854b
license: MIT (Copyright (c) 2026 Theo Browne); preserved byte-exact as `LICENSE`
ownership: canonical
last_reviewed: 2026-11-06
---

# Upstream: council

Canonical copy in this repo: `docs/ai/skills/council/`. `bun run skills:sync`
publishes it to `.agents/skills/council/`, `.claude/skills/council/`, and
`.cursor/skills/council/`. Do not edit those mirrors by hand.

- **Repository:** https://github.com/t3dotgg/tstack
- **Upstream path:** `skills/council/SKILL.md` (the upstream skill directory
  contains only this file)
- **Reviewed commit:** `1085050f3baed1ac724caa4a8166145fb2ac88af`
  (`fix(council): address known issues before review`, 2026-10-27). It was
  also the remote `HEAD` when the skill was imported on 2026-11-06.
- **License:** MIT, from the repository-root `LICENSE`. The copy in this
  directory matches the reviewed commit byte for byte.
- **Lock entry:** `skills-lock.json` → `council` (`t3dotgg/tstack`,
  `skills/council/SKILL.md`). `computedHash` was written by
  `skills@1.5.7`; it was not hand-computed.

## Import scope and curation

Only `council` was imported. The other tstack skills (`full-send`,
`full-stop`, `sol-loop`, `file-pr`, `takeover`, `babysit-pr`, `modernize`,
`leaving-pr-comments`) are deliberately excluded. Council does not depend on
any of them.

Council fills a real catalog gap. Existing Core review skills (`code-review`,
`review-and-ship`, `thermo-nuclear-code-quality-review`) run a single
reviewer. Council coordinates available reviewers, collects their scores,
and runs a bounded follow-up when the request authorizes implementation.

## Core adaptations

- The entrypoint preserves the upstream review format and adapts discovery,
  preflight, authorization, provider availability, and stopping rules for Core.
  The adapted file has a different digest from the raw upstream
  `upstream_skill_md_sha256` above.
- The marked Core overlay sets narrow invocation, member selection, read-only
  delegate briefs, secret hygiene, T3 delegation, and Core review priorities.
  Preserve these boundaries alongside the adapted instructions above it.
  Its completion checklist includes the permitted labeled native-only fallback
  without allowing substitution of explicitly requested providers.
  Each round has an elapsed-time deadline with bounded waits and honest
  cancellation reporting, while capability discovery follows the active
  harness's once-per-thread contract and explicit refresh conditions.
  The T3 dispatch fields and retry behavior follow the official
  [T3 target contract](https://github.com/pingdotgg/t3code/blob/6577c6b6185167c0e502fa01f9e8e8f2dee6ff25/packages/contracts/src/orchestratorMcp.ts)
  and [delegation guide](https://github.com/pingdotgg/t3code/blob/6577c6b6185167c0e502fa01f9e8e8f2dee6ff25/docs/orchestration-v2/orchestrator-mcp-server.md#delegate_task).
- `LICENSE` is the upstream MIT notice, unchanged. This file holds the
  provenance record.

## Refresh workflow

1. Inspect the live upstream tree, `git log -- skills/council`, and `LICENSE`
   at a pinned commit. Clone with `core.autocrlf=false` so the bytes stay LF.
2. In an isolated scratch directory (not this repo), stage only council:
   `npx --yes skills@1.5.7 add <reviewed-tstack-checkout> --skill council --agent codex --copy -y`.
   Stage `t3dotgg/tstack` the same way to get the GitHub-form lock entry, and
   confirm the remote `HEAD` equals the reviewed commit.
3. Reconcile the reviewed upstream diff into
   `docs/ai/skills/council/SKILL.md`, preserving the Core adaptations and
   marked overlay. Re-copy `LICENSE` if it changed. Then run
   `bunx prettier --write docs/ai/skills/council/SKILL.md`.
4. Update the commit, hashes, and dates above, plus the `council` entry in
   `skills-lock.json`. Publish them together with the tree.
5. Run `bun run skills:sync` and `bun run skills:verify`, then update the
   installed payload hashes with
   `node scripts/update-skill-audit-hashes.mjs --skill council`.

This skill is **not** updated by `bun run skills:refresh-upstream`.
