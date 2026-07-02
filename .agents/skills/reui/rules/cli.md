# CLI: registry setup, license, non-interactive install

## Registry setup (one-time, per project)

Free items (the 17 components and all `c-*` examples) need only the plain string registry in `components.json`:

```json
{ "registries": { "@reui": "https://reui.io/r/{style}/{name}.json" } }
```

Premium items (blocks; Motion Icons and templates) require a ReUI license at install:

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

The MCP `get_project_context` tool returns the right config. Full guide: https://reui.io/docs/registry

## Installing

Use the project's package runner (check `packageManager`):

```bash
npx shadcn@latest add @reui/<name> --yes      # npm
pnpm dlx shadcn@latest add @reui/<name> --yes  # pnpm
bunx --bun shadcn@latest add @reui/<name> --yes # bun
```

`--yes` skips confirmation prompts. The CLI auto-detects the package manager from the lockfile (there is no `--package-manager` flag). It also resolves the correct base+style variant from `components.json`, so do not pass a style.

## Handling prompts and conflicts

- **Always pass `--yes`** so the CLI does not block on confirmation prompts.
- **Do NOT pass `--overwrite` by default.** If the CLI reports an existing file, read the output and resolve deliberately: install under a different name, adjust the path, or ask the user. Only use `--overwrite` when the user explicitly wants to replace a file.
- **Preview first when touching an existing project**: `npx shadcn@latest add @reui/<name> --dry-run` shows what would change; `--diff <file>` shows a specific file's diff. Use these before overwriting.
- Run from the **project root** so `components.json` and `.env.local` are found.

## Free vs premium boundary

- Public, no key: `c-*` examples and the 17 components (`@reui/data-grid`, `@reui/badge`, ...) that those examples depend on.
- Key required at install: blocks (`@reui/<category>-N`) need a Pro or Ultimate license; Motion Icons (`@reui/icons/...`) and templates need Ultimate.

If an install 401/403s, the license key is missing, invalid, or the plan does not cover that resource (blocks: Pro or higher; icons and templates: Ultimate). Point the user to https://reui.io/account (their key) or https://reui.io/pricing (upgrade).
