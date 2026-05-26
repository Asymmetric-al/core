# Agent Skills Maintenance Log

Last updated: 2026-05-23

## Scope

This log records the audit of the Asymmetric-al/core agent skill system:

- Canonical skills under `docs/ai/skills/*/SKILL.md`
- Runtime mirrors under `.agents/skills/*` and `.cursor/skills/*`
- Skills CLI lock metadata in `skills-lock.json`
- Skill sync, verification, and upstream refresh scripts
- Supporting CLI/MCP guidance for agent workflows

## Source-of-Truth Pattern

- Canonical repo skills are authored under `docs/ai/skills/*`.
- `.agents/skills/*` and `.cursor/skills/*` are committed runtime mirrors.
- `scripts/sync-agent-skills.mjs` overlays canonical skills into both mirror roots, writes `.repo-canonical-skills.json`, prunes stale canonical mirror directories from the manifest, and mirrors all `.agents/skills/*` entries into `.cursor/skills/*`.
- `scripts/verify-skills-sync.mjs` runs the sync script and fails on tracked or untracked mirror drift.
- `scripts/refresh-upstream-skills.mjs` vendors only `supabase`, `supabase-postgres-best-practices`, `npm-deps-cleanup`, and `emil-design-engineering` into `docs/ai/skills/*`.

## Inventory A: Canonical Skills

Canonical count: 26.

| Skill                              | Canonical path                                             | Source type                       | Upstream / refresh source                         | Audit result                                                                                                    |
| ---------------------------------- | ---------------------------------------------------------- | --------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `anim`                             | `docs/ai/skills/anim/SKILL.md`                             | repo-owned-canonical              | repo-maintained                                   | No upstream drift source found; unchanged.                                                                      |
| `base-ui`                          | `docs/ai/skills/base-ui/SKILL.md`                          | repo-owned-canonical              | repo-maintained                                   | No upstream drift source found; unchanged.                                                                      |
| `bendc-frontend-guidelines`        | `docs/ai/skills/bendc-frontend-guidelines/SKILL.md`        | manual-vendor                     | `bendc/frontend-guidelines` README                | Tracer read verified upstream README remains the source; refresh notes preserved.                               |
| `cache-components`                 | `docs/ai/skills/cache-components/SKILL.md`                 | repo-owned-canonical              | Next.js docs / Vercel skill guidance              | Unchanged; Next.js docs remain local source of truth.                                                           |
| `commit`                           | `docs/ai/skills/commit/SKILL.md`                           | repo-owned-canonical              | repo-maintained                                   | Unchanged.                                                                                                      |
| `components-build`                 | `docs/ai/skills/components-build/SKILL.md`                 | lockfile + canonical              | `nolly-studio/components-build-skill`             | Lockfile-managed mirror also exists; no canonical change made.                                                  |
| `emil-design-eng`                  | `docs/ai/skills/emil-design-eng/SKILL.md`                  | repo-owned companion              | repo-maintained                                   | Unchanged.                                                                                                      |
| `emil-design-engineering`          | `docs/ai/skills/emil-design-engineering/SKILL.md`          | refresh-script-managed            | animations.dev installer into `~/.cursor/skills/` | Source path documented; no installer run because it requires maintainer email and may rewrite upstream install. |
| `find-skills`                      | `docs/ai/skills/find-skills/SKILL.md`                      | repo-owned-canonical              | Skills CLI help output                            | Updated to remove unsafe `npx skills check` guidance and document update/restore semantics.                     |
| `moai-library-shadcn`              | `docs/ai/skills/moai-library-shadcn/SKILL.md`              | repo-owned-canonical              | repo-maintained                                   | Unchanged.                                                                                                      |
| `motion`                           | `docs/ai/skills/motion/SKILL.md`                           | repo-owned-canonical              | motion docs                                       | Unchanged.                                                                                                      |
| `nextjs-app-router`                | `docs/ai/skills/nextjs-app-router/SKILL.md`                | repo-owned-canonical              | bundled Next.js docs                              | Unchanged; Next.js docs under `.next-docs/` were checked for MCP guidance.                                      |
| `nextjs-supabase-auth`             | `docs/ai/skills/nextjs-supabase-auth/SKILL.md`             | repo-owned-canonical              | Supabase + Next.js docs                           | Unchanged.                                                                                                      |
| `npm-deps-cleanup`                 | `docs/ai/skills/npm-deps-cleanup/SKILL.md`                 | refresh-script-managed + lockfile | `anthonyshew/dotfiles`                            | Updated with upstream dedupe cautions verified by Tracer.                                                       |
| `payloadcms-cms-migration`         | `docs/ai/skills/payloadcms-cms-migration/SKILL.md`         | manual-vendor                     | `payloadcms/skills` at `b87f7a8...`               | Tracer read verified vendored source and repo overlay; unchanged.                                               |
| `payloadcms-payload`               | `docs/ai/skills/payloadcms-payload/SKILL.md`               | manual-vendor                     | `payloadcms/skills` at `b87f7a8...`               | Tracer read verified vendored source and repo overlay; unchanged.                                               |
| `react-component-dev`              | `docs/ai/skills/react-component-dev/SKILL.md`              | repo-owned-canonical              | repo-maintained                                   | Unchanged.                                                                                                      |
| `react-doctor`                     | `docs/ai/skills/react-doctor/SKILL.md`                     | repo-owned-canonical              | Million React Doctor                              | Unchanged.                                                                                                      |
| `rechart`                          | `docs/ai/skills/rechart/SKILL.md`                          | repo-owned-canonical              | Recharts docs                                     | Unchanged.                                                                                                      |
| `repo-entry`                       | `docs/ai/skills/repo-entry/SKILL.md`                       | repo-owned-canonical              | repo-maintained                                   | Unchanged; root `SKILL.md` still points here.                                                                   |
| `resend-cli`                       | `docs/ai/skills/resend-cli/SKILL.md`                       | manual-vendor                     | `resend/resend-cli` tag `v2.0.0`                  | Tracer read verified vendored upstream; repo overlay preserved; unchanged.                                      |
| `supabase`                         | `docs/ai/skills/supabase/SKILL.md`                         | refresh-script-managed + lockfile | `supabase/agent-skills`                           | Updated with upstream changelog, Data API, and RLS/security guidance.                                           |
| `supabase-postgres-best-practices` | `docs/ai/skills/supabase-postgres-best-practices/SKILL.md` | refresh-script-managed + lockfile | `supabase/agent-skills`                           | Upstream still matches repo plus local routing overlay; unchanged.                                              |
| `tiptap`                           | `docs/ai/skills/tiptap/SKILL.md`                           | lockfile + canonical              | `ueberdosis/tiptap`                               | Tracer read verified upstream; repo skill already includes local editor and Tiptap 3 guidance; unchanged.       |
| `vercel-react-best-practices`      | `docs/ai/skills/vercel-react-best-practices/SKILL.md`      | vendored-upstream                 | `vercel-labs/agent-skills` ref `e23951b...`       | Tracer read verified upstream path; unchanged.                                                                  |
| `vercel-react-view-transitions`    | `docs/ai/skills/vercel-react-view-transitions/SKILL.md`    | vendored-upstream                 | `vercel-labs/agent-skills` ref `73140fc...`       | Updated upstream path from `skills/vercel-react-view-transitions` to `skills/react-view-transitions`.           |

## Inventory B: Lockfile-Managed Skills

Lockfile: `skills-lock.json`, version 1. Count: 24.

| Skill                              | Source                                | Source type | Canonical copy? | Notes                                                                                               |
| ---------------------------------- | ------------------------------------- | ----------- | --------------- | --------------------------------------------------------------------------------------------------- |
| `components-build`                 | `nolly-studio/components-build-skill` | GitHub      | Yes             | Canonical copy exists; lockfile restore rewrites `.agents/skills/components-build`.                 |
| `diagnose`                         | `mattpocock/skills`                   | GitHub      | No              | Mirror-only Matt Pocock pack.                                                                       |
| `domain-model`                     | `mattpocock/skills`                   | GitHub      | No              | Repo-local alias path in lockfile; `npx skills check` failed on this entry during accidental probe. |
| `grill-me`                         | `mattpocock/skills`                   | GitHub      | No              | Mirror-only Matt Pocock pack.                                                                       |
| `grill-with-docs`                  | `mattpocock/skills`                   | GitHub      | No              | Mirror-only Matt Pocock pack.                                                                       |
| `improve-codebase-architecture`    | `mattpocock/skills`                   | GitHub      | No              | Mirror-only Matt Pocock pack.                                                                       |
| `migrate-to-shoehorn`              | `mattpocock/skills`                   | GitHub      | No              | Mirror-only Matt Pocock misc skill.                                                                 |
| `npm-deps-cleanup`                 | `anthonyshew/dotfiles`                | GitHub      | Yes             | Also refresh-script-managed.                                                                        |
| `prd-to-plan`                      | `mattpocock/skills`                   | GitHub      | No              | Repo-local router path in lockfile.                                                                 |
| `qa`                               | `mattpocock/skills`                   | GitHub      | No              | Deprecated upstream path.                                                                           |
| `request-refactor-plan`            | `mattpocock/skills`                   | GitHub      | No              | Deprecated upstream path.                                                                           |
| `setup-matt-pocock-skills`         | `mattpocock/skills`                   | GitHub      | No              | Mirror-only setup skill.                                                                            |
| `setup-pre-commit`                 | `mattpocock/skills`                   | GitHub      | No              | Mirror-only misc skill.                                                                             |
| `stripe-best-practices`            | `docs.stripe.com`                     | well-known  | No              | Mirror-only Stripe skill.                                                                           |
| `stripe-projects`                  | `docs.stripe.com`                     | well-known  | No              | Mirror-only Stripe/projects.dev skill.                                                              |
| `supabase`                         | `supabase/agent-skills`               | GitHub      | Yes             | Also refresh-script-managed.                                                                        |
| `supabase-postgres-best-practices` | `supabase/agent-skills`               | GitHub      | Yes             | Also refresh-script-managed.                                                                        |
| `tdd`                              | `mattpocock/skills`                   | GitHub      | No              | Mirror-only Matt Pocock engineering skill.                                                          |
| `tiptap`                           | `ueberdosis/tiptap`                   | GitHub      | Yes             | Canonical copy adapted for this repo.                                                               |
| `to-issues`                        | `mattpocock/skills`                   | GitHub      | No              | Mirror-only Matt Pocock skill.                                                                      |
| `to-prd`                           | `mattpocock/skills`                   | GitHub      | No              | Mirror-only Matt Pocock skill.                                                                      |
| `ubiquitous-language`              | `mattpocock/skills`                   | GitHub      | No              | Deprecated upstream path; `domain-model` aliases this.                                              |
| `upgrade-stripe`                   | `docs.stripe.com`                     | well-known  | No              | Mirror-only Stripe upgrade skill.                                                                   |
| `zoom-out`                         | `mattpocock/skills`                   | GitHub      | No              | Mirror-only Matt Pocock skill.                                                                      |

## Inventory C: Mirror-Only Runtime Skills

Mirror roots contain 89 skill directories each. The following skills are present in `.agents/skills/*` and `.cursor/skills/*` but do not have canonical `docs/ai/skills/*` source:

`agent-browser`, `api-design-principles`, `architecture-patterns`, `bats-testing-patterns`, `better-forms`, `clean-code`, `code-review`, `code-review-excellence`, `deployment-pipeline-design`, `design-system-patterns`, `diagnose`, `domain-model`, `email-best-practices`, `frontend-design`, `github-actions-templates`, `grill-me`, `grill-with-docs`, `improve-codebase-architecture`, `inngest`, `interface-design`, `lint-and-validate`, `migrate-to-shoehorn`, `nestjs-best-practices`, `next-best-practices`, `next-cache-components`, `nextjs`, `nodejs-backend-patterns`, `pdf`, `playwright-skill`, `prd-to-plan`, `prompt-engineering-patterns`, `qa`, `react-email`, `react-state-management`, `remotion-best-practices`, `request-refactor-plan`, `resend`, `setup-matt-pocock-skills`, `setup-pre-commit`, `shadcn-ui`, `skill-creator`, `stripe-best-practices`, `stripe-integration`, `stripe-projects`, `systematic-debugging`, `tailwind-design-system`, `tailwind-v4-shadcn`, `tdd`, `test-driven-development`, `to-issues`, `to-prd`, `turborepo`, `typescript-advanced-types`, `typescript-expert`, `ubiquitous-language`, `upgrade-stripe`, `use-dom`, `vercel-composition-patterns`, `vercel-react-native-skills`, `vitest`, `web-design-guidelines`, `webapp-testing`, `zoom-out`.

These are runtime/tool-only mirrors unless `AGENTS.md` explicitly routes to a canonical `docs/ai/skills/*` skill. They remain subordinate to OpenSpec, repo instructions, and canonical skills.

## CLI / MCP Evidence

### Skills CLI

- `npx skills --help` completed successfully and listed `add`, `remove`, `list`/`ls`, `find`, `update`/`upgrade`, `experimental_install`, `init`, and `experimental_sync`.
- `npx skills find supabase` completed successfully and returned `supabase/agent-skills@supabase-postgres-best-practices` and `supabase/agent-skills@supabase`.
- `npx skills check` was previously observed to update skills and fail on `domain-model`; its changes were reverted.
- `npx skills experimental_install --help` is not a safe help probe in this version. It began restoring 24 lockfile skills into `.agents/skills` and failed when it reached well-known Stripe sources (`docs.stripe.com` is not a Git repository). Its changes were reverted.

### Nia

- `manage_resource(action="list", query="Asymmetric-al/core", resource_type="repository")` returned indexed `Asymmetric-al/core` sources.
- Repo-scoped Nia `search` and `nia_grep` appeared to query an older indexed snapshot: they did not find current `skills-lock.json`, `.mcp.json`, or `skills:*` script guidance that local reads confirm exists.
- Because of that index drift, local file reads and exact `rg` evidence were used for current repo state after the required Nia pass.

### Next.js MCP

- `.next-docs/01-app/02-guides/mcp.mdx` confirms Next.js 16+ MCP support and `next-devtools-mcp@latest`.
- Root `.mcp.json` and `.cursor/mcp.json` use `bunx -y next-devtools-mcp@latest`, which is consistent with the repo's Bun preference.

### shadcn MCP

- `npx --yes shadcn@latest mcp --help` completed successfully and showed `shadcn mcp init`.
- Root `.mcp.json` and `.cursor/mcp.json` use `npx --yes shadcn@latest mcp`.

### TanStack

- `@tanstack/cli` is a root devDependency (`^0.63.1`), and `AGENTS.md` correctly says not to use `tanstack mcp`.
- `bunx tanstack --help; bunx tanstack mcp --help` completed successfully and printed the same top-level command list both times; no `mcp` command is available. Current useful commands include `libraries`, `doc`, `search-docs`, and `ecosystem`.
- `npx --yes @tanstack/intent@latest list` produced no output and was terminated after it hung. Intent availability remains a documented runtime check rather than a verified output in this audit.

### OpenSpec

- `bunx @fission-ai/openspec@latest --help` completed successfully and listed `list`, `view`, `validate`, `show`, `archive`, `status`, and other commands.
- The command emitted `Saved lockfile` while resolving dependencies, but no tracked repo lockfile diff remained after inspection.

## Files Changed in This Audit

- `AGENTS.md`
- `README.md`
- `docs/AI_AGENT_PLAYBOOK.md`
- `docs/ai/skills-maintenance-log.md`
- `docs/ai/skills/find-skills/SKILL.md`
- `docs/ai/skills/npm-deps-cleanup/SKILL.md`
- `docs/ai/skills/supabase/SKILL.md`
- `docs/ai/skills/supabase/references/upstream.md`
- `docs/ai/skills/vercel-react-view-transitions/SKILL.md`
- `docs/ai/skills/vercel-react-view-transitions/references/upstream.md`

Mirror updates under `.agents/skills/*` and `.cursor/skills/*` are expected after `bun run skills:sync`.

## Validation Log

Completed 2026-05-23:

- `bun run skills:sync` — pass
- `bun run skills:verify` — pass (after sync)
- `bunx prettier --write README.md docs/ai/skills-maintenance-log.md` then `bun run format:check` — pass
- `bunx vitest run tests/unit/packages/api/auth/get-auth-context-request-propagation.test.ts` — pass after normalizing repo-relative paths on Windows for the server-only `getAuthContext()` allowlist
- `bun run ci:preflight` — pass (pre-push hook, 2026-05-23)

## Done-when

- [x] Canonical skills audited; targeted doc updates with upstream evidence
- [x] Mirrors synced and verified
- [x] `skills-lock.json` inventory documented; mutating CLI commands documented
- [x] `docs/ai/skills-maintenance-log.md` committed
- [x] `AGENTS.md`, `README.md`, playbook, and MCP/CLI guidance aligned
- [x] CI preflight unblocked for push

## Known Gaps

- Nia's indexed repository snapshot appears stale relative to the working tree. Current local files were used after the Nia pass.
- TanStack Intent `list` did not complete in this environment, so the audit could not capture current Intent package coverage.
- The animations.dev installer for `emil-design-engineering` requires maintainer-specific input and was not run.
- No full `npx skills update` or `npx skills check` refresh was run because both are mutating workflows.

## Rollback Notes

To revert this audit manually before commit:

```bash
git checkout -- AGENTS.md README.md docs/AI_AGENT_PLAYBOOK.md docs/ai/skills/find-skills/SKILL.md docs/ai/skills/npm-deps-cleanup/SKILL.md docs/ai/skills/supabase/SKILL.md docs/ai/skills/supabase/references/upstream.md docs/ai/skills/vercel-react-view-transitions/SKILL.md docs/ai/skills/vercel-react-view-transitions/references/upstream.md
rm docs/ai/skills-maintenance-log.md
bun run skills:sync
```

If mirror files were already committed, reverting the canonical files and rerunning `bun run skills:sync` regenerates the matching mirror state.
