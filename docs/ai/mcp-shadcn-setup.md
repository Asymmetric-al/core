# shadcn MCP Server — Setup Guide

The shadcn MCP server lets AI assistants (Cursor, Claude, etc.) search, browse, view, and install components from shadcn registries directly during coding sessions.

## Quick Setup

Run the init command from the repo root to write the config for your editor:

```bash
bunx --bun shadcn@latest mcp init
```

This writes `.cursor/mcp.json` (gitignored — per-developer). Or create it manually:

## Manual Config

Create `.cursor/mcp.json` in the repo root:

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "bunx",
      "args": ["--bun", "shadcn@latest", "mcp"],
      "env": {}
    }
  }
}
```

> `.cursor/mcp.json` is gitignored (it is per-developer). Each developer must create it locally. This file is the Cursor-specific config; see the table below for other editors.

## Editor Config Files

| Editor      | Config file        |
| ----------- | ------------------ |
| Cursor      | `.cursor/mcp.json` |
| Claude Code | `.mcp.json` (root) |
| VS Code     | `.vscode/mcp.json` |
| OpenCode    | `opencode.json`    |

## Available MCP Tools

Once configured, the following tools are available in your AI assistant:

| Tool                                       | Description                                    |
| ------------------------------------------ | ---------------------------------------------- |
| `shadcn:get_project_registries`            | Returns registry names from `components.json`  |
| `shadcn:list_items_in_registries`          | Lists all items from registries                |
| `shadcn:search_items_in_registries`        | Fuzzy search across registries                 |
| `shadcn:view_items_in_registries`          | View item details including full file contents |
| `shadcn:get_item_examples_from_registries` | Find usage examples and demos                  |
| `shadcn:get_add_command_for_items`         | Returns the CLI install command                |
| `shadcn:get_audit_checklist`               | Checklist for verifying components             |

## Repo Registries

Registries are configured in `packages/ui/components.json`. The built-in `@shadcn` registry is always available. The repo also has:

- `@ss-components` / `@ss-themes` / `@ss-blocks` — shadcn Studio
- `@efferd` — Efferd registry
- `@reactbits-starter` / `@reactbits-pro` — ReactBits

> Note: Private registries require API keys in environment variables (`EMAIL`, `LICENSE_KEY`, `EFFERD_REGISTRY_TOKEN`, `REACTBITS_LICENSE_KEY`).

## Full MCP Reference

See `.agents/skills/shadcn/mcp.md` for the complete MCP tool reference.
