---
name: reui
description: "Build and maintain Core UI with the ReUI registry and authenticated ReUI MCP. Use for new pages/sections/features, ReUI components/examples/Pro blocks, @reui installs, REUI_LICENSE_KEY setup, and ReUI API or documentation research. Preserve exact base-maia/Base UI, packages/ui ownership, existing shared tables, and Core tokens; use live APIs and worked examples."
user-invocable: false
allowed-tools: Bash(npx shadcn@latest *), Bash(pnpm dlx shadcn@latest *), Bash(bunx --bun shadcn@latest *)
metadata:
  user-invocable: "false"
---

<!-- BEGIN:core-reui-overlay -->

## This repository (Asymmetric-al/core)

These Core instructions take precedence over the generic upstream guidance below.
Reconcile them before running `bun run skills:sync` after an upstream refresh.

### Triggers

- Use ReUI for new pages, sections, and features that can reuse its components,
  examples, or Pro blocks; this repo expects substantial ReUI adoption.
- Load for `@reui` registry installs, existing ReUI component work, ReUI MCP
  setup/debugging, and ReUI documentation or API research.
- Pair with `packages/ui/AGENTS.md`, `docs/ai/rules/frontend.md`, the official
  `.agents/skills/shadcn/SKILL.md`, and
  `docs/ai/skills/moai-library-shadcn/SKILL.md`. ReUI does not replace those owners.

### Workflow

1. Read the nearest instructions and current source first. Verify
   `packages/ui/components.json`: exact **`base-maia`**, Base UI, Zinc-oriented
   semantic CSS variables, and `iconLibrary: "lucide"`. Shared primitives stay in
   `packages/ui`; apps import `@asym/ui`. Adapt registry output to Core's Maia
   system before accepting it; preserve the reusable composition within that
   system. Do not run `shadcn init`, switch presets, introduce Radix, or fork
   shared primitives inside an app.
2. Use the configured `reui` MCP for live discovery, APIs, and planning. Read its
   current tool schemas. `get_project_context` confirms style and license setup;
   a successful premium block search confirms plan access. Every MCP request
   requires an OAuth, personal-token, or license credential. Core's headless
   setup reads **`REUI_LICENSE_KEY`** from the process environment; never paste a
   secret into a committed file or command. See [tools.md](./tools.md).
3. Treat the account as **Pro** for discovery and installation entitlement.
   Verify repository visibility and source-distribution rights separately:
   Core is public and AGPL-3.0-only. The repository owner confirmed a separate
   agreement covering publication of Pro block source and modified derivatives
   here, including contributors; see
   `docs/guides/development/reui-source-license.md` for the recorded permission.
   Use suitable Pro blocks directly, alongside MIT public components, hooks,
   and examples with their notices. Keep commercial-source provenance distinct
   from MIT notices. Paid access alone does not establish distribution rights
   outside this confirmed scope; templates and Ultimate-only icons require
   their own applicable entitlement and permission.
   Use `compose_page` for full pages and scoped `search` for components/blocks.
   Motion
   Icons require **Ultimate** for discovery and install: use the existing
   `lucide-react` icons on Pro. Respect `locked`, `unlock`, `weakMatch`, and
   `unavailableSections`; do not invent missing inventory or promise an upgrade.
4. Batch `get_component` for the APIs needed by an item, read omitted sections
   through the returned `next` hint, and copy worked `get_examples` composition.
   Confirm the API against already-installed source and current manifests before
   upgrading existing components: the live registry may be newer. Resolve API
   example imports against the actual shared source and public package exports;
   raw upstream paths may not match Core's installed owner. Use
   `validate_usage` for unfamiliar names/props. [Documentation routing](./references/docs.md)
   explains Base UI `.md` pages, `llms.txt`, setup, styling, RTL, and changelogs.
   Share an item's returned preview link and the relevant component docs link.
5. Install only confirmed registry names into the shared UI package using Bun:
   `bunx --bun shadcn@latest add @reui/<name> --yes --cwd packages/ui`.
   Preview changes with `--dry-run` and inspect conflicts first. Never blindly
   `--overwrite`. Inspect registry `files[].target` and imports using CLI
   `view`/dry-run: explicit targets can create `components/reui/*` even though
   Core already owns the matching primitive under `components/shadcn/*` (for
   example `components/shadcn/data-grid`). Adapt that existing shared owner
   instead of introducing a duplicate tree. For genuinely new primitives or
   blocks, deliberately provide public `@asym/ui` exports and verify consumer
   imports; package aliases alone do not create exports. Keep the existing
   `components.json` aliases. `packages/ui/components.json` already has the authenticated
   `@reui` object with `Authorization: "Bearer ${REUI_LICENSE_KEY}"`; keep it.
   Free items also work through this config. The inherited shell key is usable;
   a key present only in root `.env.local` is not automatically loaded by the CLI
   running in `packages/ui`. If needed, use git-ignored `packages/ui/.env.local`.
   See [rules/cli.md](./rules/cli.md).
6. Reuse existing shared UI before adding a duplicate. Keep
   **`DataTableResponsive`** from `@asym/ui/components/shadcn/data-table` for
   standard app tables. Use ReUI **`data-grid`** for a feature that needs its
   specific documented composition, integrated through `packages/ui`. Follow
   `docs/guides/development/tanstack-virtual-foundation.md` and the installed
   TanStack version; do not replace the shared table or apply an old v8 example
   to a v9 component. Keep data access in the existing API/database boundaries.
7. Wire real typed data and all states; use documented Base UI `render`
   composition, Core semantic tokens, and shared motion/reduced-motion rules.
   New semantic status tokens belong in `packages/ui/styles/globals.css`, with
   purpose, light/dark values, Tailwind mapping, and contrast verification.
   Use TDD for substantive behavior, run the applicable package checks and
   browser/a11y checks, then the live `get_audit_checklist` plus Core gates.
8. For skill maintenance, use [references/upstream.md](./references/upstream.md).
   Compare `get_agent_skill.version` with the pinned upstream version; stage the
   hosted bundle and reconcile Core overlays instead of executing the installer
   over this repository. Its direct writes bypass canonical source ownership.

### Checklist

- [ ] ReUI components/examples/Pro blocks considered before new custom UI
- [ ] Current source, live API, returned item names, previews, and plan checked
- [ ] Exact `base-maia`, Base UI, shared ownership, and semantic tokens preserved
- [ ] Existing `DataTableResponsive` and data-access contracts preserved
- [ ] Authenticated registry retained; license key stays outside tracked content
- [ ] Source-distribution license verified separately from Pro authentication
- [ ] MIT notices retained; restricted source omitted without covering agreement
- [ ] Relevant TDD, package checks, browser/a11y checks, and audit gates passed
- [ ] Skill refresh reconciled before running `bun run skills:sync`, followed by
      non-mutating `bun run skills:verify`

**Naming:** ReUI (`@reui`, this skill) is unrelated to shadcn-studio `/rui`
(Refine UI) in `docs/ai/rules/shadcn-studio-mcp.md`.

<!-- END:core-reui-overlay -->

> **ReUI skill version `e7aac3424a`.** Compare `get_agent_skill.version` with this pin. Refresh through [Core's staged upstream workflow](./references/upstream.md), reconcile the overlays, then sync the generated mirrors.

# ReUI for Agents

ReUI is a shadcn-compatible registry. It ships four things you **reuse** - never redesign:

- **components** - the 24 ReUI building blocks with real APIs: `data-grid`, `kanban`, `filters`, `date-selector`, `tree`, `stepper`, ... (free)
- **examples** - free `c-*` single-pattern use-cases of a component (`c-kanban-1`); install one and read it to see exact composition
- **blocks** - premium full-page sections that compose components (`data-grid-base-2`, `settings-2`); Pro or Ultimate license at install
- **icons** - Motion Icons in 4 styles, static + hover-animated variants; Ultimate license at install

The skill is free and this MCP is free to use; it just needs a ReUI account. On first use your agent opens a browser "Sign in with ReUI" prompt (a free account is created if you don't have one). Free covers components and examples with a daily request allowance; Pro unlocks premium blocks, Ultimate additionally unlocks Motion Icons, and either licensed plan removes the limit (see [rules/registry.md](./rules/registry.md)). The same account and skill work in every agent and service the MCP connects to - this skill is agent-agnostic.

Skill + MCP are a team: this skill is the workflow (how to find, install, read the API, and adapt by reuse); the MCP is the live data and the hands (search, get_component, install commands). Your job: find the right item, install it with the shadcn CLI, read its real API, and **adapt by reuse** - wire real data and theme it; do not hand-roll or restyle what ReUI already provides. This skill **layers on the shadcn skill**: follow that for generic rules (spacing, `cn()`, semantic colors, forms); follow this for everything ReUI-specific.

## The core loop (MCP-native)

1. **Find** - call the ReUI MCP `search` tool with the user's intent. It returns a ranked, scored list across components/examples/blocks/icons, each with an `install` command, `previewUrl`, `docsUrl`, and `componentsUsed`. Pass hints (`type`, `component`, `category`, `features`, `free`) when you can infer them.
2. **Install** - run the returned `install` command non-interactively: `npx shadcn@latest add @reui/<name> --yes`, with `<name>` exactly as a ReUI tool returned it. The CLI resolves deps, aliases, and the base/style from `components.json`. See [cli.md](./rules/cli.md).
   - The shadcn/ui components ReUI builds on (`button`, `dialog`, `select`, ...) are not ReUI items: install them by bare name, `npx shadcn@latest add button --yes`. A bare name in an item's `registryDependencies` is a shadcn/ui item.
   - `badge` and `alert` exist in both registries: `@reui/badge` is ReUI's, bare `badge` is shadcn's.
   - Templates are downloads from their page on reui.io, not `shadcn add` items.
3. **Read the API (on your base)** - first note your base from `components.json` -> `style` (`base-nova` -> Base UI, `radix-nova` -> Radix UI). For each component an item uses, call `get_component(name)` and read its **inline `api`** (no web fetch); then `get_examples(name)` to install a worked example and copy its composition - the installed files are already in your base. Whenever you work with a component's API, also **share its `docsUrl`** (the primitive's API documentation page) with the user so they have the full reference. See [components.md](./rules/components.md).
4. **Adapt (reuse-first)** - swap demo data for real data, fix icon imports, align tokens. Do not redesign. See [adapting.md](./rules/adapting.md).

**Always show the preview.** Every item a tool returns carries a `previewUrl` (a live preview page). Whenever you list, recommend, or present ReUI items to the user - blocks, components, examples, or icons, whether from `search`, `search_icons`, `list_components`, `compose_page`, or any getter - include each item's `previewUrl` so they can SEE it before installing. Blocks and examples open an individual live preview; icons and components link to their live category/component page. Never present an item without its preview link.

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

| Need                                                                 | Reach for                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| A full page or section (dashboard, billing, auth, pricing, settings) | `compose_page` first (plans sections + best blocks), then ReUI **blocks**       |
| A data table with sorting/filtering/pagination/virtualization        | Core **`DataTableResponsive`**; ReUI **data-grid** for its specific composition |
| A drag-and-drop board                                                | the **kanban** component                                                        |
| Advanced column filtering, date range, tree, stepper, ...            | the matching ReUI **component**                                                 |
| A single generic control already in shadcn (Button, Dialog, Select)  | plain **shadcn**                                                                |

## Detailed references

- [rules/registry.md](./rules/registry.md) - the four types, the @reui registry, base/radix, free vs premium + license
- [rules/workflow.md](./rules/workflow.md) - the find -> install -> read-API -> adapt loop (most important)
- [rules/components.md](./rules/components.md) - the 24 components, the data-grid contract, base vs radix
- [rules/adapting.md](./rules/adapting.md) - reuse-first: preserve the design (no over-customizing), reuse examples + a block's own elements, real data, don't invent APIs
- [rules/craft.md](./rules/craft.md) - make it exceptional: point of view, hierarchy, density, states, responsive, motion, the bar
- [rules/quality.md](./rules/quality.md) - security, accessibility, and scroll gates (the done gate)
- [rules/styling.md](./rules/styling.md) - ReUI extended tokens, theme adaptation, density
- [rules/icons.md](./rules/icons.md) - portable icons, swapping imports, Motion Icons (static + animated)
- [tools.md](./tools.md) - the ReUI MCP: golden path, the 19 tools, token rules, result shapes, errors
