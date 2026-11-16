---
applyTo: "docs/ai/rules/shadcn-studio-mcp.md,.github/instructions/shadcn-studio-mcp*"
---

# shadcn/studio MCP workflows

Applies only when the shadcn/studio MCP server is connected and a `/cui`, `/rui`, `/iui` or `/ftc` workflow is running. Core does not configure that server; the `shadcn` server in `.mcp.json` is the official shadcn MCP. Ordinary UI work follows `packages/ui/AGENTS.md` and exact `base-maia`.

- Follow the server's workflow steps in order. Do not skip, reorder or add tool calls the workflow does not call for.
- `/cui` (Create UI): collect every block before installing any; after installing, customize the content.
- `/rui` (Refine UI): update existing components only.
- `/iui` (Inspiration UI) and `/ftc` (Figma to code): follow their sequences as given.
- Once a workflow starts, complete it without pausing between its steps for user confirmation; the server's own prompts are the checkpoints.
- If you deviate, return to the step you should be on and continue from there.
- Installed output still lands in `packages/ui` and is adapted to `base-maia` before it is accepted. The workflow does not widen the authorized scope of the task.

The rulebook is `docs/ai/rules/shadcn-studio-mcp.md`.
