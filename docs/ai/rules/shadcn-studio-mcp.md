# shadcn/studio MCP — Workflow

**Name:** `shadcn-studio-mcp`
**Purpose:** Step order for the shadcn/studio MCP server's `/cui`, `/rui`, `/iui` and `/ftc` workflows.

**Applies when:** The shadcn/studio MCP server is connected in your client and you are running one of those workflows. Core does not configure that server; the `shadcn` entry in `.mcp.json`, `.cursor/mcp.json` and `.codex/config.toml` is the official shadcn MCP (`scripts/shadcn/mcp.mjs`).
**Do not use when:** Editing UI manually or through the official shadcn MCP. ReUI (`@reui`) is unrelated to `/rui`.

## Workflow

1. Identify the workflow: `/cui`, `/rui`, `/iui` or `/ftc`.
2. Follow the server's steps in order. Do not skip, reorder or add tool calls the workflow does not call for.
   - **/cui (Create UI):** collect every block before installing any; after installing, customize the content.
   - **/rui (Refine UI):** update existing components only.
   - **/iui (Inspiration UI)** and **/ftc (Figma to code):** follow their sequences as given.
3. If you deviate, return to the step you should be on and continue from there.
4. Installed output lands in `packages/ui` and is adapted to exact `base-maia` before it is accepted (`packages/ui/AGENTS.md`). The workflow does not widen the authorized scope of the task.

## Checklist

- [ ] Workflow type confirmed
- [ ] Steps executed in the server's order, with no extra tool calls
- [ ] Output adapted to `base-maia` in `packages/ui`
