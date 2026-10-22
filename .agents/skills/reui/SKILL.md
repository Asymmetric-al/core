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

> **ReUI skill version `68f0e6fa91`.** Compare `get_agent_skill.version` with this pin. Refresh through [Core's staged upstream workflow](./references/upstream.md), reconcile the overlays, then sync the generated mirrors.

# ReUI

ReUI is an existing design system on shadcn/ui. Keep its look. Generic frontend advice (vary fonts or themes, gradients, page-load or staggered reveals, "2-3 intentional motions", Framer Motion) does not apply here.
It ships free components, free `c-*` examples, Pro blocks and Ultimate Motion Icons through the shadcn CLI; the ReUI MCP finds them and serves their APIs.

## Order of authority

1. The installed style (`components.json` `style`, baked into `components/ui` and `components/reui`): it owns radius, height, padding, shadow and overlay motion.
2. The installed component's variants and props (`size`, `variant`, `spacing`).
3. These rules and the topic files.
4. Other design skills, then your taste: where they disagree with 1 to 3, ReUI wins. Never redefine `--ease-out` or any Tailwind built-in.

## Before you write UI code, write this plan in your reply

1. Surface: operational, marketing or flow.
2. Archetype: 1 from [compose.md](./rules/compose.md).
3. Container family: Frame-led, Card-led, or Cards for the KPIs and a Frame for the table.
4. Density: dense (`size="sm"` on controls that take it) or default.
5. Regions: top to bottom, each with the item that fills it.
6. States: empty, loading and error for each data region.
7. Motion: none, or the 1 entrance.

Then build exactly that plan; if you deviate, say where.

## The loop

1. **Find**: `compose_page` for a full page, else `search` with `type` and `component` hints.
2. **Install**: `npx shadcn@latest add @reui/<name> --yes`, with `<name>` exactly as a tool returned it (shadcn/ui parts install by bare name: `npx shadcn@latest add button --yes`).
3. **Read the API on your base**: `components.json` style `base-nova` is Base UI, `radix-nova` is Radix. Call `get_component([...componentsUsed])` once, then install 1 `get_examples` example and read its files.
4. **Adapt**: change data, copy and props; keep the structure and classes.
5. **Check**, after every UI edit, follow-ups included: `validate_usage` on any name you did not read, the self-checks C1 to C4 in [quality.md](./rules/quality.md), [anti-patterns.md](./rules/anti-patterns.md), `get_audit_checklist`, typecheck, lint. Hand back in the 5 lines quality.md gives.

Show every item's `previewUrl` whenever you list, recommend or install it.

## Rules that always apply

- **Owners**: standard app tables Core `DataTableResponsive`, ReUI `data-grid` for its specific composition; filtering `filters`, boards `kanban`, modals `Dialog` (destructive confirms `AlertDialog`), toasts `sonner`; never hand-roll.
- **Color**: semantic tokens for meaning; state colors through Badge or Alert variants (`@reui/badge` and `@reui/alert`, not shadcn's); raw palette only for categorical identity, always with its `dark:` pair.
- **Contrast**: never `text-success` or `text-warning` as body text in light mode, and never `text-<state>-foreground` on a solid `bg-<state>` fill.
- **Shape**: no `rounded-*` except `rounded-full`, and no `shadow-*`, `h-*` or `px-*` on Button, Input, SelectTrigger, Card or Frame; pick `size` and `variant`. A panel is a Card or Frame, never a div with `rounded-lg border`.
- **Spacing**: `gap-*` on the parent, not `space-y-*`; `gap-1` to `gap-2` in a row, `gap-3` to `gap-4` between groups, `gap-6` to `gap-8` between sections; title to description `gap-0.5`.
- **Type**: `text-sm` body, `text-xs` meta (controls keep their style's size), `font-medium` or `font-semibold`, headings `tracking-tight`, numbers `tabular-nums`; nothing below `text-xs` except illustrative mini-UI.
- **Motion**: installed components own their motion. Your own code uses `transition-colors` for hover and press, `duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]` to reveal, `duration-300` with the same curve at most (media hover zoom: 500), and `SPRING` (`{ type: "spring", visualDuration: 0.25, bounce: 0 }`) for drag and reorder. At most 1 entrance animation per view (a stagger counts as 1). Animate only `transform` and `opacity`, CSS before motion/react, never set state per frame; `<MotionConfig reducedMotion="user">` once at the root plus `motion-reduce:` on CSS, where reduced motion means a calm fade, not nothing.
- **Surfaces**: prefer 1 container family per screen. With a KPI row and a table, use FramePanels for both, or Cards for the KPIs and a Frame for the table; never a Card inside a Frame or a Frame inside a Card. Icons come from 1 library, the `iconLibrary` in `components.json` (on Ultimate, 1 Motion Icon on the primary action is the exception).
- **States**: each data region has empty (1 action), loading (a `Skeleton` in the real layout) and error (Retry) states; light and dark work.
- **Never invent**: never write a prop, variant or `@reui/` name you did not read in an `api`, an installed file or a tool result.

## Topics

Always read `compose` before building a screen, and `quality` plus `anti-patterns` at the Check step. Besides those, read only the topic files the task touches, at most 4 (for example `color`, `motion`, `layout` and `components`).

Installed skill: open the file. MCP only: call `get_agent_skill` with the topic, or fetch `https://mcp.reui.io/skill/reui/<file>`.

| Topic           | File                                               | Read when                                     |
| --------------- | -------------------------------------------------- | --------------------------------------------- |
| `compose`       | [rules/compose.md](./rules/compose.md)             | before building any screen or section         |
| `workflow`      | [rules/workflow.md](./rules/workflow.md)           | `compose_page`, search hints, installing      |
| `adapting`      | [rules/adapting.md](./rules/adapting.md)           | changing an installed block or example        |
| `components`    | [rules/components.md](./rules/components.md)       | `data-grid`, `filters`, `kanban` and the rest |
| `color`         | [rules/color.md](./rules/color.md)                 | any color, status, chart or dark mode choice  |
| `theming`       | [rules/theming.md](./rules/theming.md)             | the styles, radius, density and sizes         |
| `motion`        | [rules/motion.md](./rules/motion.md)               | any transition, animation or motion/react     |
| `layout`        | [rules/layout.md](./rules/layout.md)               | house defaults, hierarchy, surfaces, states   |
| `icons`         | [rules/icons.md](./rules/icons.md)                 | icon imports, Motion Icons                    |
| `quality`       | [rules/quality.md](./rules/quality.md)             | the done gate: self-checks, a11y, hand-back   |
| `anti-patterns` | [rules/anti-patterns.md](./rules/anti-patterns.md) | the Check step: drift pairs, stale habits     |
| `registry`      | [rules/registry.md](./rules/registry.md)           | free vs Pro vs Ultimate, base vs radix        |
| `cli`           | [rules/cli.md](./rules/cli.md)                     | `components.json`, license key, install flags |
| `tools`         | [tools.md](./tools.md)                             | MCP result shapes, errors, quota, commands    |

## Plans

Free covers components, `c-*` examples, this skill and the MCP (a ReUI account and a daily allowance). Pro adds blocks. Ultimate adds Motion Icons. A plan miss is a normal answer with `locked: true`; keep building with what the plan covers.
