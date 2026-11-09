---
source_name: anthropics/claude-plugins-official (pr-review-toolkit)
source_url: https://github.com/anthropics/claude-plugins-official/tree/0412be76f50ab4f4f8abff3753efa9269fbbca5b/plugins/pr-review-toolkit
source_type: github
upstream_path: plugins/pr-review-toolkit/
reviewed_commit: 0412be76f50ab4f4f8abff3753efa9269fbbca5b
reviewed_commit_date: 2026-11-06
plugin_path_last_changed_commit: 30202c767cfaf325212b3921ab484f83adaec850
plugin_version: 1.0.1
upstream_command_sha256: 5e70c17293a044e1bf9d092c80b5da8b4fd5802ebb07dc53993dec4ba7ce2fc4
upstream_license_sha256: cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30
license: Apache-2.0; full text preserved byte-exact as `LICENSE`
ownership: canonical
last_reviewed: 2026-11-09
---

# Upstream: review-pr (pr-review-toolkit)

Canonical copy in this repo: `docs/ai/skills/review-pr/`. `bun run skills:sync`
publishes it to `.agents/skills/review-pr/`, `.claude/skills/review-pr/`, and
`.cursor/skills/review-pr/`. The native subagent launchers are canonical in
`.cursor/agents/` and generated into `.claude/agents/`. Do not edit generated
copies by hand.

- **Repository:** https://github.com/anthropics/claude-plugins-official
- **Upstream path:** `plugins/pr-review-toolkit/` (plugin version `1.0.1`)
- **Reviewed commit:** `0412be76f50ab4f4f8abff3753efa9269fbbca5b`, the remote
  `HEAD` on 2026-11-09. The plugin directory last changed in
  `30202c767cfaf325212b3921ab484f83adaec850`.
- **License:** Apache-2.0, from the plugin's `LICENSE` (identical to the
  repository-root `LICENSE`). The plugin `README.md` says "MIT", but the
  `LICENSE` file governs. The repository has no `NOTICE` file. `LICENSE` in
  this directory is the upstream text, byte for byte.
- **Lock entry:** none. This is a Claude Code plugin made of agents and a
  command, not a Skills CLI skill, so `skills-lock.json` does not track it.

## Upstream inventory and mapping

| Upstream file                             | sha256 (LF)                                                        | Core location                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `commands/review-pr.md`                   | `5e70c17293a044e1bf9d092c80b5da8b4fd5802ebb07dc53993dec4ba7ce2fc4` | `SKILL.md` (adapted: new frontmatter plus the marked Core overlay)                                  |
| `agents/code-reviewer.md`                 | `019395c3ce457460115cc703e2f4a86fed4bbe560dc58355051c4d877155d366` | `references/agents/code-reviewer.md`, launched by `.cursor/agents/pr-code-reviewer.md` (renamed)    |
| `agents/code-simplifier.md`               | `976ddb22b84bc5a714216531a75db5e73169554add6b953442beeedb49b56891` | `references/agents/code-simplifier.md`, launched by `.cursor/agents/code-simplifier.md`             |
| `agents/comment-analyzer.md`              | `4a9c1f2eb8234a4b9231983e75739663d512e1aed242388964a165a719b84698` | `references/agents/comment-analyzer.md`, launched by `.cursor/agents/comment-analyzer.md`           |
| `agents/pr-test-analyzer.md`              | `fcb1cde9ba7b21694b508766a8d6a79bc91bed9982f828f816210059934f46b4` | `references/agents/pr-test-analyzer.md`, launched by `.cursor/agents/pr-test-analyzer.md`           |
| `agents/silent-failure-hunter.md`         | `fa9b0daec5a267e7e66435cc48b3328301fc9f70c3af259fe248881327a1babc` | `references/agents/silent-failure-hunter.md`, launched by `.cursor/agents/silent-failure-hunter.md` |
| `agents/type-design-analyzer.md`          | `c1cf67843d3c4fd27ddf6b24aa92521414b16c01610e7f7e87212c7b8681198d` | `references/agents/type-design-analyzer.md`, launched by `.cursor/agents/type-design-analyzer.md`   |
| `LICENSE`                                 | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` | `LICENSE`                                                                                           |
| `README.md`, `.claude-plugin/plugin.json` | not vendored                                                       | Plugin packaging and marketing text. This file records the facts they hold.                         |

How each client reaches the toolkit:

- **Claude Code and Cursor:** the `/review-pr` skill, plus six native subagents
  (`.claude/agents/<name>.md`, generated from `.cursor/agents/<name>.md`).
- **Codex:** the `$review-pr` skill. It dispatches each reviewer prompt from
  `references/agents/` to a Codex subagent when the session has subagent tools,
  or runs them in turn. Codex native roles in `.codex/config.toml` belong to
  the Samson factory installer and were left unchanged.
- **T3 Code:** the `/review-pr` skill with one `delegate_task` per reviewer.

## Core adaptations

Apache-2.0 section 4(b) requires modified files to say so. Each modified file
carries that notice.

- `SKILL.md`: the command became a skill. The frontmatter now has `name`, an
  explicit-only `description`, and `disable-model-invocation: true`, keeps
  `argument-hint`, and drops `allowed-tools` so tool permissions follow the
  user's settings. The marked Core overlay sets scope, client dispatch,
  read-only reviewers, Core rule sources, severity mapping, and output limits.
  The command body is otherwise unchanged apart from Prettier formatting.
- `agents/openai.yaml`: Codex explicit-only discovery
  (`allow_implicit_invocation: false`).
- `.cursor/agents/<name>.md`: Core-authored launchers. Their descriptions only
  route to a reviewer when `review-pr` dispatches it or the user names it, so
  they do not take triggers from `code-review`, `council`, or other review
  skills. Upstream descriptions asked for proactive, automatic use, and
  `code-simplifier` edits code, so Core does not keep them.
- `references/agents/*.md`: upstream prompts, unchanged byte for byte. They
  match the hashes above, and `.prettierignore` keeps formatting from
  modifying them, so they need no modification notice. Their
  Anthropic-internal conventions are neutralized by the overlay rather than
  edited.
- `.cursor/agents/pr-code-reviewer.md`: the upstream `code-reviewer` agent is
  published as `pr-code-reviewer` because Cursor already registers a different
  `code-reviewer` agent. The other five keep their upstream names.

## Refresh workflow

This skill is **not** updated by `bun run skills:refresh-upstream`.

1. Clone with LF bytes and a sparse checkout:
   `git -c core.autocrlf=false clone --filter=blob:none --sparse https://github.com/anthropics/claude-plugins-official.git`,
   then `git sparse-checkout set plugins/pr-review-toolkit`. Review
   `git log -- plugins/pr-review-toolkit` and the `LICENSE` since the reviewed
   commit.
2. Copy changed agent prompts into `references/agents/` byte for byte (do not
   format them) and the command body
   into `SKILL.md` above the overlay. Add or remove launchers in
   `.cursor/agents/` when upstream adds or removes an agent. Re-copy `LICENSE`
   if it changed.
3. Update the commit, hashes, and dates above. Run
   `bunx prettier --write docs/ai/skills/review-pr .cursor/agents`, then
   `bun run skills:sync` and `bun run skills:verify`.
4. Run `node scripts/update-skill-audit-hashes.mjs --skill review-pr` and
   `bunx vitest run tests/unit/docs`.
