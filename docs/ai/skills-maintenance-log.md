# Agent Skills Maintenance Log

Last updated: 2026-06-26

## Scope

This log records the audit and full upstream refresh of the
Asymmetric-al/core agent skill system:

- Canonical skills under `docs/ai/skills/*/SKILL.md`
- Runtime mirrors under `.agents/skills/*` and `.cursor/skills/*`
- Skills CLI lock metadata in `skills-lock.json`
- Skill sync, verification, and upstream refresh scripts
- Supporting CLI/MCP guidance for agent workflows

## Source-of-Truth Pattern

- Canonical repo skills are authored under `docs/ai/skills/*`.
- `.agents/skills/*` and `.cursor/skills/*` are committed runtime mirrors.
- `scripts/sync-agent-skills.mjs` overlays canonical skills into both mirror
  roots, writes `.repo-canonical-skills.json`, prunes stale canonical mirror
  directories from the manifest, and mirrors all `.agents/skills/*` entries
  into `.cursor/skills/*`.
- `scripts/verify-skills-sync.mjs` runs the sync script and fails on tracked or
  untracked mirror drift.
- `scripts/refresh-upstream-skills.mjs` vendors `supabase`,
  `supabase-postgres-best-practices`, `npm-deps-cleanup`,
  `emil-design-engineering`, Cursor Team Kit skills, and the Babysitter
  `babysit` skill into `docs/ai/skills/*`.

## Baseline

Branch: `chore/skills-upstream-refresh` from `origin/production`.

- Baseline `bun run skills:verify`: pass.
- Baseline canonical skills: 26 expected in `docs/ai/skills/*`.
- Baseline lockfile-managed skills: 24 entries in `skills-lock.json`.
- Nia repo-scoped search was attempted, but the indexed snapshot returned stale
  paths and missed current `skills-lock.json`, `.mcp.json`, and skill scripts.
  Current local repository files are the evidence source for this refresh.

## Refresh Log

Completed 2026-06-26:

- Updated `docs/ai/working-set.md` with the Cursor Team Kit and Babysitter
  skill-vendoring scope.
- Verified upstream branches:
  - `cursor/plugins` default branch `main` at
    `0452e08a314c03621ec5ac1324f1ad1dd824f1a4`.
  - `a5c-ai/babysitter-cursor` default branch `develop` at
    `67f78eaae0935c93fb0ff5b51f471d819eab0134`.
- Vendored all current Cursor Team Kit skills from
  `cursor-team-kit/skills/*` into `docs/ai/skills/*`:
  `check-compiler-errors`, `control-cli`, `control-ui`, `deslop`, `fix-ci`,
  `fix-merge-conflicts`, `get-pr-comments`, `loop-on-ci`,
  `make-pr-easy-to-review`, `new-branch-and-pr`, `pr-review-canvas`,
  `review-and-ship`, `run-smoke-tests`,
  `thermo-nuclear-code-quality-review`, `verify-this`, `weekly-review`,
  `what-did-i-get-done`, and `workflow-from-chats`.
- Vendored Babysitter `skills/babysit/SKILL.md` into
  `docs/ai/skills/babysit/`, plus upstream `versions.json` because the
  preserved `SKILL.md` reads `${PLUGIN_ROOT}/versions.json` to choose the SDK
  version.
- Added `references/upstream.md` to every new canonical skill directory with
  `source_name`, `source_url`, `source_type: github`, `upstream_path`,
  `skills_lock_hash`, `last_reviewed`, reviewed commit, and refresh steps.
- Updated `skills-lock.json` with 19 new `sourceType: "github"` entries using
  SHA-256 hashes of the upstream `SKILL.md` bytes.
- Extended `scripts/refresh-upstream-skills.mjs` with safe GitHub temp-clone
  source groups for Cursor Team Kit and Babysitter. The script now validates
  skill slugs, verifies upstream `SKILL.md` exists before deleting canonical
  targets, preserves `references/upstream.md`, regenerates metadata, copies
  configured support files, and updates matching lockfile entries.
- Copied Cursor Team Kit companion agents into `.cursor/agents/ci-watcher.md`
  and `.cursor/agents/thermo-nuclear-code-quality-review.md`.
- Intentionally did not vendor Cursor Team Kit upstream `.cursor/rules`
  (`no-inline-imports.mdc`, `typescript-exhaustive-switch.mdc`) because no
  skill depends on them and both are `alwaysApply` repo-wide Cursor behavior
  changes.

Completed 2026-05-23:

- Created branch `chore/skills-upstream-refresh` from `origin/production`.
- Updated `docs/ai/working-set.md` with this refresh scope.
- Ran `npx skills add supabase/agent-skills -y`.
- Ran `npx skills add anthonyshew/dotfiles -y`.
- Ran `npx skills add mattpocock/skills -y`.
- Ran `npx skills add nolly-studio/components-build-skill -y`.
- Ran `npx skills add ueberdosis/tiptap -y`.
- Tried `npx skills add docs.stripe.com -y`; it failed because
  `docs.stripe.com` is not a Git repository. The local Cursor Stripe plugin
  cache matched the committed Stripe skill content.
- Ran `bun run skills:refresh-upstream`; reran with `HOME=$env:USERPROFILE` so
  the Windows shell could resolve `~/.cursor/skills/emil-design-engineering`.
- Promoted AGENTS-routed Matt Pocock skills into `docs/ai/skills/*`:
  `setup-matt-pocock-skills`, `grill-with-docs`, `grill-me`, `diagnose`,
  `zoom-out`, `to-prd`, `to-issues`, `improve-codebase-architecture`, `tdd`,
  `qa`, `request-refactor-plan`, `setup-pre-commit`, `migrate-to-shoehorn`,
  `ubiquitous-language`, plus repo aliases `domain-model` and `prd-to-plan`.
- Ran `npx skills add payloadcms/skills -y`; vendored `payload` and
  `cms-migration` into canonical `payloadcms-payload` and
  `payloadcms-cms-migration` with repo overlays.
- Ran `npx skills add resend/resend-cli -y`; vendored the refreshed
  `resend-cli` tree into canonical `docs/ai/skills/resend-cli`.
- Tried `npx skills add bendc/frontend-guidelines -y`; it found no `SKILL.md`.
  Refreshed `bendc-frontend-guidelines` manually from upstream `README.md`.
- Ran `npx skills add vercel-labs/agent-skills -y`; vendored refreshed
  `vercel-react-best-practices` and `vercel-react-view-transitions` into
  canonical docs.
- Ran `npx skills find` for high-value mirror-only skills and refreshed clear
  upstream sources with:
  - `npx skills add vercel-labs/agent-browser@agent-browser -y`
  - `npx skills add shadcn-ui/ui@shadcn -y`
  - `npx skills add resend/resend-skills -y`
  - `npx skills add resend/react-email@react-email -y`
  - `npx skills add vercel/turborepo@turborepo -y`
  - `npx skills add antfu/skills@vitest -y`
  - `npx skills add vercel-labs/next-skills -y`
  - `npx skills add kadajett/agent-nestjs-skills@nestjs-best-practices -y`
  - `npx skills add testdino-hq/playwright-skill@playwright-skill -y`
  - `npx skills add anthropics/skills@webapp-testing -y`
  - `npx skills add obra/superpowers@test-driven-development -y`
- Ran `bun run skills:sync` after canonical promotions and manual vendor
  updates.
- Fixed Windows CI build execution by running Turbo through `bunx turbo` in
  `scripts/verify/ci-build.mjs` and making `scripts/run-with-ci-env.mjs`
  shell-aware for Windows command execution.

## Resulting Inventory

After the 2026-06-26 addition:

- Canonical skills: 62 under `docs/ai/skills/*`.
- Runtime mirror skills: 122 under `.agents/skills/*` and `.cursor/skills/*`.
- New Cursor Team Kit canonical skills: 18.
- New Babysitter canonical skills: 1.
- Skills lock entries: 75 in `skills-lock.json`.
- Cursor Team Kit companion agents: 2 under `.cursor/agents/`.
- Cursor Team Kit upstream rules: found and intentionally not vendored.

After the 2026-05-23 refresh:

- Canonical skills: 42 under `docs/ai/skills/*`.
- Runtime mirror skills: 102 under `.agents/skills/*`.
- Skills CLI lock entries: 55 in `skills-lock.json`.
- New canonical sources promoted or added in this refresh:
  - Matt Pocock pack: 16 canonical directories including aliases.
  - Payload CMS: `payloadcms-payload`, `payloadcms-cms-migration`.
  - `bendc-frontend-guidelines`.

## Known Gaps

- The animations.dev installer was not rerun with a maintainer email. The
  refresh used the currently installed local `~/.cursor/skills/emil-design-engineering`
  source after setting `HOME` for PowerShell.
- `next-devtools-mcp@latest --help` behaves like a long-running MCP process in
  this environment; it was stopped after confirming dependency resolution.
  Local Next.js 16 docs still verify the committed `next-devtools-mcp@latest`
  configuration.
- Several mirror-only skills have ambiguous public search results. The refresh
  updated clear upstream sources and left ambiguous/plugin-only skills as
  runtime mirrors.
- Nia's indexed repo snapshot remained stale relative to the working tree.
- `npx skills check` remains unsafe as a read-only command in this repo. With
  `skills@1.5.7`, it was not listed in `npx skills --help` and was observed to
  mutate `.agents/skills/*` and `skills-lock.json`.

## Validation Log

Completed 2026-05-23:

- `bun run skills:sync` — pass
- `bun run skills:verify` — pass
- `bun run format:check` — pass
- `bun run build` — pass after the Windows Turbo runner fix
- `bun run test:unit` — pass after raising the donor Next config dynamic import
  test timeout to 15 seconds
- `bun run ci:preflight` — pass

## Rollback Notes

If mirror files drift, rerun:

```bash
bun run skills:sync
bun run skills:verify
```

For a failed upstream refresh, revert the changed canonical skill directories,
`skills-lock.json`, `AGENTS.md`, `README.md`, and `docs/AI_AGENT_PLAYBOOK.md`,
then rerun `bun run skills:sync`.
