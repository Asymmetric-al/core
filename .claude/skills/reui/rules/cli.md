# CLI: registry setup, license, non-interactive install

<!-- BEGIN:core-reui-overlay -->

## Core usage

Core installs target `packages/ui`, where the authenticated `@reui` object is
already configured. Keep it for free and Pro items. Use
`bunx --bun shadcn@latest add @reui/<name> --yes --cwd packages/ui` from the
repository root, with `--dry-run` first when there are existing files. Prefer
the existing process environment credential; otherwise a git-ignored
`packages/ui/.env.local` must sit beside this package's `components.json`.
Root `.env.local` alone is not auto-loaded by a package-scoped install. Do not
re-run initialization or overwrite customized shared components. The key is a
build/tooling secret, never a `NEXT_PUBLIC_*` variable or app runtime requirement.

Inspect registry `files[].target` and imports with CLI `view`/dry-run before
installing: explicit targets can write `components/reui/*` independently of the
configured `ui` alias. Core's existing DataGrid owner is
`packages/ui/components/shadcn/data-grid`; adapt matching existing shared
primitives instead of creating a second tree. Raw API example imports may need
rewriting to that installed owner. For new primitives/blocks, provide deliberate
public `@asym/ui` exports in `packages/ui/package.json` and verify app consumer
imports; the package has no general `components/reui/*` export. Preserve the
existing `components.json` aliases.
See [Core workflow](../SKILL.md#this-repository-asymmetric-alcore).

<!-- END:core-reui-overlay -->

## Registry setup (one-time, per project)

Free items (the 24 components and all `c-*` examples) need only the plain string registry in `components.json`:

```json
{ "registries": { "@reui": "https://reui.io/r/{style}/{name}.json" } }
```

Premium items (blocks and Motion Icons) require a ReUI license at install:

1. Add the key to `.env.local`:

```bash
REUI_LICENSE_KEY=your-license-key
```

2. Switch `components.json` to the authenticated object form:

```json
{
  "registries": {
    "@reui": {
      "url": "https://reui.io/r/{style}/{name}.json",
      "headers": { "Authorization": "Bearer ${REUI_LICENSE_KEY}" }
    }
  }
}
```

The shadcn CLI expands `${REUI_LICENSE_KEY}` from `.env.local` inside `components.json`. MCP client configs expand environment variables too, but each client has its OWN syntax, so wire the ReUI MCP server with the form that client understands:

- Claude Code (`.mcp.json`, `~/.claude.json`): `"Authorization": "Bearer ${REUI_LICENSE_KEY}"`
- Cursor (`.cursor/mcp.json`) and VS Code: `"Authorization": "Bearer ${env:REUI_LICENSE_KEY}"`
- OpenCode (`opencode.json`): `"Authorization": "Bearer {env:REUI_LICENSE_KEY}"`
- Codex (`~/.codex/config.toml`): `bearer_token_env_var = "REUI_LICENSE_KEY"` - Codex reads the variable itself, so there is no header to write

Only a client with no interpolation at all needs the raw `reui_pat_...` token, and then only in a file that is never committed. Copying the `components.json` form into a client that does not expand it is the common failure: the literal `${REUI_LICENSE_KEY}` placeholder is sent to the server as the credential and every call comes back 401.

The MCP `get_project_context` tool returns the right config. Full guide: https://reui.io/docs/registry?ref=skill

## Installing

Use the project's package runner (check `packageManager`):

```bash
npx shadcn@latest add @reui/<name> --yes      # npm
pnpm dlx shadcn@latest add @reui/<name> --yes  # pnpm
bunx --bun shadcn@latest add @reui/<name> --yes # bun
```

`--yes` skips confirmation prompts. The CLI auto-detects the package manager from the lockfile (there is no `--package-manager` flag). It also resolves the correct base+style variant from `components.json`, so do not pass a style.

`<name>` is the item name exactly as a ReUI tool returned it. The `@reui/` prefix is for ReUI items only:

- The shadcn/ui components ReUI builds on (`button`, `dialog`, `select`, `card`, ...) are not ReUI items. Install them from shadcn by bare name: `npx shadcn@latest add button --yes`.
- `badge` and `alert` exist in both registries: `@reui/badge` and `@reui/alert` are ReUI's components, bare `badge` and `alert` are shadcn's.
- In an item's `registryDependencies`, a `@reui/<name>` entry is a ReUI item and a bare name is a shadcn/ui item. `add` installs both, so you never add them by hand.
- Templates are not registry items. Download a template from its page on reui.io (https://reui.io/templates?ref=skill); no `shadcn add` command installs one.

## Handling prompts and conflicts

- **Always pass `--yes`** so the CLI does not block on confirmation prompts.
- **Do NOT pass `--overwrite` by default.** If the CLI reports an existing file, read the output and resolve deliberately: install under a different name, adjust the path, or ask the user. Only use `--overwrite` when the user explicitly wants to replace a file.
- **Preview first when touching an existing project**: `npx shadcn@latest add @reui/<name> --dry-run` shows what would change; `--diff <file>` shows a specific file's diff. Use these before overwriting.
- Run from the **project root** so `components.json` and `.env.local` are found.

## Free vs premium boundary

- Public, no key: `c-*` examples and the 24 components (`@reui/data-grid`, `@reui/badge`, ...) that those examples depend on.
- Key required at install: blocks (`@reui/<category>-N`) need a Pro or Ultimate license; Motion Icons (`@reui/icons/...`) need Ultimate.
- Templates are downloads from their page on reui.io, not installs: free ones need only a ReUI account, and each template's page says what the others need.

If an install 401/403s, the license key is missing, invalid, or the plan does not cover that resource (blocks: Pro or higher; icons: Ultimate). Point the user to https://reui.io/account?ref=skill (their key) or https://reui.io/pricing?ref=skill (upgrade).

If an install 404s, the name is not a ReUI item. Read the CLI's error message, which names the right install command when there is one, or look the name up with `get_install_command` or `search`.
