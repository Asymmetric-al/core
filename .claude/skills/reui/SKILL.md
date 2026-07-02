---
name: reui
description: Use the ReUI registry from your AI agent - find, install, and correctly use ReUI components (the 17 free building blocks like data-grid, kanban, filters), their free examples, premium blocks, and Motion Icons. Applies in any project using ReUI, the @reui registry, REUI_LICENSE_KEY, or any shadcn project where the user asks for premium blocks, data grids, kanban boards, dashboards, or full pages. Pairs with the free ReUI MCP server for live, scored registry search and inline component APIs.
user-invocable: false
allowed-tools: Bash(npx shadcn@latest *), Bash(pnpm dlx shadcn@latest *), Bash(bunx --bun shadcn@latest *)
---

## This repository (Asymmetric-al/core)

Subordinate to **`docs/ai/rules/frontend.md`**, **`docs/ai/skills/moai-library-shadcn/SKILL.md`** (generic shadcn rules), and TanStack guides under `docs/guides/development/`.

**Registry (`packages/ui/components.json`):**

- Active style is **`base-maia`** (Base UI + Maia). Read the segment before the first `-` in `style` to detect the base (`base-maia` → Base UI).
- **`@reui`** is the **plain-string** registry (free components and `c-*` examples). Premium blocks/icons need the authenticated object form plus `REUI_LICENSE_KEY` in git-ignored `.env.local` — see [rules/cli.md](./rules/cli.md). Switch back to the plain form when premium installs are not in progress so contributors without a key can install free items.

**Tables:**

- Prefer shared **`DataTableResponsive`** from `@asym/ui/components/shadcn/data-table` for standard app tables (see `docs/guides/development/tanstack-virtual-foundation.md`).
- Use ReUI **`data-grid`** when you need ReUI-specific table composition after `get_component('data-grid')`.

**Naming:** **ReUI** (`@reui`, this skill) is unrelated to shadcn-studio **`/rui`** (Refine UI) in `docs/ai/rules/shadcn-studio-mcp.md`.

**MCP:** `reui` at `https://mcp.reui.io` in `.mcp.json`, `.cursor/mcp.json`, and `.codex/config.toml`. The MCP is free; only premium **installs** need a license key. Never commit `REUI_LICENSE_KEY`.

Refresh: [references/upstream.md](./references/upstream.md).

# ReUI for Agents

ReUI is a shadcn-compatible registry. It ships four things you **reuse** - never redesign:

- **components** - the 17 ReUI building blocks with real APIs: `data-grid`, `kanban`, `filters`, `date-selector`, `tree`, `stepper`, ... (free)
- **examples** - free `c-*` single-pattern use-cases of a component (`c-kanban-1`); install one and read it to see exact composition
- **blocks** - premium full-page sections that compose components (`data-grid-2`, `pricing-page-1`); Pro or Ultimate license at install
- **icons** - Motion Icons in 4 styles, static + hover-animated variants; Ultimate license at install

The MCP and this skill are free; only installing premium content needs a license (see [rules/registry.md](./rules/registry.md)).

Your job: find the right item, install it with the shadcn CLI, read its real API, and **adapt by reuse** - wire real data and theme it; do not hand-roll or restyle what ReUI already provides. This skill **layers on** [`docs/ai/skills/moai-library-shadcn/SKILL.md`](../moai-library-shadcn/SKILL.md) for generic shadcn rules (spacing, `cn()`, semantic colors, forms); follow this for everything ReUI-specific.

## The core loop (MCP-native)

1. **Find** - call the ReUI MCP `search` tool with the user's intent. It returns a ranked, scored list across components/examples/blocks/icons, each with an `install` command, `previewUrl`, `docsUrl`, and `componentsUsed`. Pass hints (`type`, `component`, `category`, `features`, `free`) when you can infer them.
2. **Install** - run the returned command non-interactively (`npx shadcn@latest add @reui/<name> --yes`). The CLI resolves deps, aliases, and the base/style from `components.json`. See [cli.md](./rules/cli.md).
3. **Read the API (on your base)** - first note your base from `components.json` -> `style` (this repo uses `base-maia` → Base UI; `radix-nova` → Radix UI). For each component an item uses, call `get_component(name)` and read its **inline `api`** (no web fetch); then `get_examples(name)` to install a worked example and copy its composition - the installed files are already in your base. See [components.md](./rules/components.md).
4. **Adapt (reuse-first)** - swap demo data for real data, fix icon imports, align tokens. Do not redesign. See [adapting.md](./rules/adapting.md).

If the ReUI MCP is not configured, fall back to `npx shadcn@latest search @reui -q "..."` then `add` - but the MCP gives scored matches + inline APIs; prefer it.

## Commands

Run ReUI as explicit slash commands (via the ReUI MCP) **or** just ask in plain language - both run the same workflow.

| Command     | Invoke                         | Does                                                                                                               |
| ----------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **build**   | `/mcp__reui__build <what>`     | Compose a page/section/feature from ReUI: plan → install → read API → adapt → craft → audit.                       |
| **add**     | `/mcp__reui__add <item>`       | Find & install one component/example/block/icon and wire it in.                                                    |
| **fix**     | `/mcp__reui__fix [target]`     | Diagnose & fix ReUI usage: wrong/undocumented props, base/radix mismatch, missing states, a11y/scroll.             |
| **improve** | `/mcp__reui__improve [target]` | Refine + extend existing ReUI UI to a production-exceptional bar (hierarchy, density, states, responsive, motion). |

Invocation differs slightly per agent (`/mcp__reui__build` in Claude Code/Cursor/Windsurf, `/mcp.reui.build` in VS Code). No command surface? Just describe what you want - this skill drives the identical loop.

## When to reach for ReUI vs plain shadcn

| Need                                                                 | Reach for                                                                                             |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| A full page or section (dashboard, billing, auth, pricing, settings) | `compose_page` first (plans sections + best blocks), then ReUI **blocks**                             |
| A data table with sorting/filtering/pagination/virtualization        | **`DataTableResponsive`** in this repo; ReUI **data-grid** when ReUI-specific composition is required |
| A drag-and-drop board                                                | the **kanban** component                                                                              |
| Advanced column filtering, date range, tree, stepper, ...            | the matching ReUI **component**                                                                       |
| A single generic control already in shadcn (Button, Dialog, Select)  | plain **shadcn**                                                                                      |

## Detailed references

- [rules/registry.md](./rules/registry.md) - the four types, the @reui registry, base/radix, free vs premium + license
- [rules/workflow.md](./rules/workflow.md) - the find -> install -> read-API -> adapt loop (most important)
- [rules/components.md](./rules/components.md) - the 17 components, the data-grid contract, base vs radix
- [rules/adapting.md](./rules/adapting.md) - reuse-first: preserve the design (no over-customizing), reuse examples + a block's own elements, real data, don't invent APIs
- [rules/craft.md](./rules/craft.md) - make it exceptional: point of view, hierarchy, density, states, responsive, motion, the bar
- [rules/quality.md](./rules/quality.md) - security, accessibility, and scroll gates (the done gate)
- [rules/styling.md](./rules/styling.md) - ReUI extended tokens, theme adaptation, density
- [rules/icons.md](./rules/icons.md) - portable icons, swapping imports, Motion Icons (static + animated)
- [tools.md](./tools.md) - the ReUI MCP: golden path, the 19 tools, token rules, result shapes, errors
