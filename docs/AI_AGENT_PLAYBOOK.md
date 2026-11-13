# AI Agent Playbook

## What `AGENTS.md` is for

- `AGENTS.md` is the root instruction contract for coding agents in this monorepo.
- It tells agents to read version-accurate Next.js docs before making Next.js changes.
- Cursor and OpenAI Codex should use this root `AGENTS.md` as the canonical rules file.
- `CLAUDE.md` imports `@AGENTS.md` so Claude Code follows the same rules without duplication.

## Repo-owned skills and mirrors

- Repo-owned skills are authored canonically under `docs/ai/skills/*/SKILL.md`.
- Runtime mirrors are committed under `.agents/skills/*`, `.cursor/skills/*`, and `.claude/skills/*`.
- Keep `AGENTS.md` as the compact domain router. Skill descriptions handle normal progressive discovery; detailed or ambiguous skill routes live in `docs/ai/rules/agent-skill-routing.md`, which points at canonical files rather than tool-specific mirrors.
- For Codex desktop, `.agents/skills/*` is the closest repo-level match to Codex's documented skill discovery behavior.
- For Cursor Agent Window, committed `.cursor/skills/*` improves visible availability, while `AGENTS.md` still provides the strongest always-on routing contract.
- After pulling skill changes, run `bun run skills:verify`; if it reports drift, run `bun run skills:sync` and commit the refreshed mirrors.
- Skills CLI operations that restore or update skills are mutating. Use targeted
  `npx skills add <package> -y` commands when refreshing upstream packages; do
  not use `npx skills check` as a read-only check because it can rewrite
  `.agents/skills/*` and `skills-lock.json`.
- Manual vendors document their source in
  `docs/ai/skills/<name>/references/upstream.md`; preserve repo overlays before
  syncing mirrors.
- Cursor Team Kit skills (`cursor/plugins`) and the Babysitter `/babysit` skill
  (`a5c-ai/babysitter-cursor`) are repo-local vendored skills refreshed by
  `bun run skills:refresh-upstream`, not personal global installs.
- Cursor Team Kit companion agents live under `.cursor/agents/` for Cursor
  task-agent workflows. The upstream always-on Cursor rules are intentionally
  not vendored because the skills do not depend on them and they would change
  repo-wide Cursor behavior.

## Official Inngest agent tooling

- Official Inngest skills are vendored canonically under
  `docs/ai/skills/inngest-*`, with `docs/ai/skills/inngest/SKILL.md` as the
  router.
- These skills are for agent guidance and integration work. They do not mean
  product runtime Inngest has been adopted in `apps/*` or `packages/*`.
- Refresh Inngest skills with `bun run skills:refresh-inngest`, then run
  `bun run skills:sync` and `bun run skills:verify`.
- The Inngest dev-server MCP is configured as `inngest-dev` in root `.mcp.json`
  and `.cursor/mcp.json`. Start the Inngest dev server first; if it falls back
  from port `8288` to `8289` or another port, update the MCP URL to match.
- Claude Code users who want the full official plugin can run
  `/plugin marketplace add inngest/inngest-claude-code-plugin`, then
  `/plugin install inngest@inngest-claude-code-plugin`.
- Codex users can use the generated `.agents/skills/inngest-*` mirrors. If they
  need the full upstream plugin, clone `inngest/inngest-codex-plugin` outside
  the repo and run `/plugin install <path>/plugins/inngest`.

## Shadcn MCP

- The Shadcn MCP is configured as `shadcn` in root `.mcp.json`,
  `.cursor/mcp.json`, and `.codex/config.toml`. All three run
  `bun scripts/shadcn/mcp.mjs`. It starts the workspace-installed shadcn, pinned
  by the root `devDependencies.shadcn`, with `packages/ui` as the working
  directory. The server reads registries from its working directory, and
  `packages/ui/components.json` is the only `components.json`. Do not switch
  back to `npx`: inside Core it fails with npm `EOVERRIDE` because of the root
  `overrides`.
- Start Claude Code and Codex from the repository (or worktree) root. Their
  entries pass the launcher as a repository-relative path, and neither client
  documents a project-root variable for project-scoped stdio servers. Cursor
  passes `${workspaceFolder}`.
- Paid registries resolve the `${VAR}` placeholders in `components.json` from
  the server's environment: `SHADCN_STUDIO_EMAIL`, `SHADCN_STUDIO_LICENSE_KEY`,
  `SHADCNBLOCKS_API_KEY`, `SHADCNUIKIT_API_KEY`, `EFFERD_REGISTRY_TOKEN`,
  `REACTBITS_LICENSE_KEY` and `REUI_LICENSE_KEY`. Real environment variables
  win. For any of those names that is missing, the launcher reads the
  git-ignored root `.env.local`, wherever the client starts, and copies nothing
  else from it. Never put key values in a client config.
- Agents can start the MCP before dependencies are installed; fresh
  `.claude/worktrees` checkouts have no `node_modules`. In that case the launcher
  falls back to `bun x` with the same pin. That fallback's first start on a
  machine installs shadcn into Bun's cache, which takes about a minute. Both
  clients allow 120 seconds for it: Codex through `startup_timeout_sec`, and
  Claude Code through `env.MCP_TIMEOUT` in the shared `.claude/settings.json`,
  which applies once the folder is trusted and raises the startup timeout for
  every project MCP server. Running `bun install` first avoids the fallback.

## ReUI agent tooling

- The ReUI MCP is configured as `reui` in root `.mcp.json`,
  `.cursor/mcp.json`, and `.codex/config.toml`.
- Claude Code reads the repo-root `.mcp.json`; Cursor reads `.cursor/mcp.json`;
  Codex reads `.codex/config.toml`.
- The MCP endpoint is `https://mcp.reui.io` and requires authentication through
  OAuth or a bearer credential. Core's configured headless clients use the
  runtime `REUI_LICENSE_KEY` and send `X-Reui-Style: base-maia`. Reload/reconnect
  the client after configuration changes; a disabled server exposes no tools.
- Registry installation authenticates separately through the existing `@reui`
  object in `packages/ui/components.json` and runtime `REUI_LICENSE_KEY`.
  Preserve that configuration for free and Pro items. Prefer the existing
  process environment; a fallback git-ignored `packages/ui/.env.local` must
  sit beside the package's `components.json`. ReUI is not shadcn-studio `/rui`
  (Refine UI).
- The canonical ReUI skill remains `docs/ai/skills/reui/SKILL.md`; keep mirrors
  fresh with `bun run skills:sync` and `bun run skills:verify`. Reviewed refreshes
  record `reviewStatus: "reviewed"` and an ISO `reviewedAt` date or timestamp
  in `references/upstream-manifest.json` before promotion and sync.
- Follow [ReUI setup](guides/development/reui.md), including
  `bun run verify:reui` and explicit `bun run verify:reui --live`. The latter
  checks authenticated MCP/Pro access and paid registry source independently.

## Monorepo scoping (pick the right app first)

- Admin app: `apps/admin` (`@asym/admin`)
- Donor app: `apps/donor` (`@asym/donor`)
- Missionary app: `apps/missionary` (`@asym/missionary-app`)

Use turbo filters when working on one app:

- `bunx turbo run dev --filter=@asym/admin`
- `bunx turbo run dev --filter=@asym/donor`
- `bunx turbo run dev --filter=@asym/missionary-app`

## Where Next.js docs live

- Primary source: nearest matching `node_modules/next/dist/docs/` for the app being changed.
- Current state: all app workspaces use `next@16.3.3`.
- If multiple Next.js versions are introduced later, use the docs path that matches the app's installed version.

## OpenSpec workflow

- Read `openspec/config.yaml` and `openspec/project.md` plus the relevant files under `openspec/specs/` and `openspec/changes/` before non-trivial feature, behavior, or multi-step project work.
- Use the locally pinned CLI only: `bun run openspec -- <command>`.
- Use `bun run openspec -- list`, `show`, and `validate` when working from an active change.
- Keep OpenSpec focused on durable project context and intended behavior; keep `AGENTS.md` as the always-on routing layer.
- Do not run `openspec update` against this repository. Do not use a moving latest npm dist-tag for OpenSpec.

## Fallback docs generation (`.next-docs`)

`.next-docs/` mirrors the documentation bundled with the installed `next`
package, so it describes the pinned release. After a Next.js version change:

- `node scripts/sync-next-docs.mjs --write` rewrites the fallback from
  `node_modules/next/dist/docs`.
- `node scripts/sync-next-docs.mjs` checks it without writing.
  `tests/unit/scripts/sync-next-docs.test.ts` runs the same check, so a version
  change that forgets the fallback fails the unit gate.

The script reads only the installed package and never edits `AGENTS.md`. Do
not use the `@next/codemod` `agents-md` command for this: it follows a moving
release tag and writes a compressed index into `AGENTS.md`.

This repo commits `.next-docs/` on purpose because remote/sandbox agent runs can start before dependencies are installed, while committed fallback docs are always readable.

## Next.js DevTools MCP workflow

1. Start the target app dev server first (use turbo filter for one app).
2. Connect the `next-devtools` MCP server from root `.mcp.json`.
3. Use MCP for runtime errors, route state, and live app debugging while the server is running.

## Checks for safe, repeatable agent changes

Full repo:

- `bun run check`

Scoped while changing one app:

- `bunx turbo run lint --filter=@asym/admin`
- `bunx turbo run lint --filter=@asym/donor`
- `bunx turbo run lint --filter=@asym/missionary-app`
- `bunx turbo run typecheck --filter=@asym/admin`
- `bunx turbo run typecheck --filter=@asym/donor`
- `bunx turbo run typecheck --filter=@asym/missionary-app`

Unit tests are currently run repo-wide with `bun run test:unit`.
