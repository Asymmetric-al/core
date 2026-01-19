# shadcn/studio MCP — Workflow

**Name:** `shadcn-studio-mcp`
**Purpose:** Enforce the exact step-by-step workflow required by the shadcn/studio MCP server.
Use this only when running shadcn/studio MCP workflows.

**Applies when:** Using shadcn/studio MCP workflows `/cui`, `/rui`, `/iui`, or `/ftc`.
**Do not use when:** Editing UI manually without shadcn/studio MCP tools.

## Workflow

1. Identify which workflow applies: `/cui`, `/rui`, `/iui`, or `/ftc`.
2. Follow the MCP workflow steps exactly, in order.
3. Do not add extra tool calls or skip steps.
4. Do not stop mid-workflow for user confirmation.

### Workflow-specific rules

- **/cui (Create UI):**
  - Collect all blocks first.
  - Install last.
  - After install, automatically customize content.
- **/rui (Refine UI):**
  - Follow the refine sequence and update existing components only.
- **/iui (Inspiration UI):**
  - Follow the inspiration sequence exactly.
- **/ftc (Figma to code):**
  - Follow the figma-to-code sequence exactly.

### Recovery protocol (if you deviate)

1. Stop immediately.
2. Identify the step you should be on.
3. Resume from that exact step.
4. Do not explain the deviation; continue to completion.

## Checklists

### Before starting

- [ ] Confirm the workflow type (`/cui`, `/rui`, `/iui`, `/ftc`)
- [ ] Commit to following the MCP step order exactly

### Completion checklist

- [ ] All steps executed in order
- [ ] No extra tool calls
- [ ] Workflow completed without pauses for confirmation

## Minimal examples

- `/cui Create a hero section for the landing page`
- `/rui Refine the pricing card layout`
- `/iui Provide inspiration for a dashboard layout`
- `/ftc Convert the provided Figma frame`

## Common mistakes / pitfalls

- Skipping or reordering steps
- Installing before finishing block collection in `/cui`
- Asking "should I continue?" mid-workflow
- Adding extra tool calls outside the workflow
- Stopping before the workflow is complete
