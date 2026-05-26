# AI Agent Playbook

## What `AGENTS.md` is for

- `AGENTS.md` is the root instruction contract for coding agents in this monorepo.
- It tells agents to read version-accurate Next.js docs before making Next.js changes.
- Cursor and OpenAI Codex should use this root `AGENTS.md` as the canonical rules file.
- `CLAUDE.md` imports `@AGENTS.md` so Claude Code follows the same rules without duplication.

## Repo-owned skills and mirrors

- Repo-owned skills are authored canonically under `docs/ai/skills/*/SKILL.md`.
- Runtime mirrors are committed under `.agents/skills/*` and `.cursor/skills/*`.
- Keep `AGENTS.md` as the routing layer. It should point at canonical files in `docs/ai/skills/*`, not at tool-specific mirrors.
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
- Current state: all app workspaces use `next@16.2.6`.
- If multiple Next.js versions are introduced later, use the docs path that matches the app's installed version.

## OpenSpec workflow

- Read `openspec/project.md` plus the relevant files under `openspec/specs/` and `openspec/changes/` before non-trivial feature, behavior, or multi-step project work.
- Use `bunx @fission-ai/openspec@latest <command>` as the repo-safe default for OpenSpec CLI work. If `openspec` is already on `PATH`, that is equivalent. If Bun is unavailable, use `npx -y @fission-ai/openspec@latest <command>`.
- Use `bunx @fission-ai/openspec@latest list`, `show`, `view`, and `validate` when working from an active change.
- Keep OpenSpec focused on durable project context and intended behavior; keep `AGENTS.md` as the always-on routing layer.

## Fallback docs generation (`.next-docs`)

When `node_modules` docs are unavailable, generate fallback docs:

- `bunx @next/codemod@canary agents-md --output AGENTS.md`
- If a local script is added later, `bun run agents:docs` is an equivalent wrapper.

After running the command, verify:

- `.next-docs/` exists
- `AGENTS.md` contains the codemod-compressed docs index block
- If the generated block mentions `npx`, keep using Bun in this repo (`bunx ...`).

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
