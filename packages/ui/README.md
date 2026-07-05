# @asym/ui — Shared UI Package

Shared UI component library for the `@asym` monorepo. It wraps shadcn/ui and enforces the **Maia theme** with the **Zinc palette** (OKLCH color space). All design tokens live in one place.

## Design Token System

- Tailwind v4 is **CSS-first** - there is **no** `tailwind.config.ts` or `tailwind.config.js` in this repo.
- Single source of truth: `packages/ui/styles/globals.css`
- The `@theme inline` directive maps CSS custom properties to Tailwind utility classes (for example, `--color-primary` to `bg-primary` and `text-primary`).
- Maia theme + Zinc palette are **mandatory** across all apps.

## Token Reference

| Category              | CSS Variables                                                                                                                                                                                                                                                  | Notes                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Color — semantic      | `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring` | OKLCH, hue 265° (Zinc). Light + dark variants in `:root` / `.dark`                                       |
| Color — card/popover  | `--card`, `--card-foreground`, `--popover`, `--popover-foreground`                                                                                                                                                                                             | Layered surface tokens                                                                                   |
| Color — sidebar       | `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`                                                                              | Sidebar-specific surface tokens                                                                          |
| Color — charts        | `--chart-1` ... `--chart-5`                                                                                                                                                                                                                                    | 5 distinct OKLCH hues for data viz                                                                       |
| Border radius         | `--radius` (1rem base), `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`                                                                                                                                                             | Soft/rounded Maia aesthetic                                                                              |
| Fonts                 | `--font-sans` (Inter), `--font-display` (Syne), `--font-mono` (Geist Mono); apps load via `next/font` in `app/layout.tsx` (`--font-inter`, `--font-syne`, `--font-geist-mono`)                                                                                 | Mapped via `@theme inline`; use `font-sans`, `font-display`, `font-mono` (or existing `font-syne` alias) |
| Spacing               | `--space-1` ... `--space-24`                                                                                                                                                                                                                                   | 0.25 rem steps                                                                                           |
| Gaps                  | `--gap-xs`, `--gap-sm`, `--gap-md`, `--gap-lg`, `--gap-xl`, `--section-gap`, `--card-padding`                                                                                                                                                                  | Responsive - values change at md/lg breakpoints                                                          |
| Container             | `--container-max-width` (1600px), `--container-padding`                                                                                                                                                                                                        | Responsive padding (1rem -> 1.5rem -> 2.5rem)                                                            |
| Touch targets         | `--touch-target-min` (44px), `--touch-target-recommended` (48px), `--touch-spacing-min` (8px)                                                                                                                                                                  | Applied automatically on `pointer: coarse`                                                               |
| Pointer (interactive) | N/A (see below)                                                                                                                                                                                                                                                | `cursor: pointer` on common controls via a single `:where(...)` rule in `@layer base` — not a token      |

## Pointer cursor for interactive controls

Clickable UI should show a **pointer** cursor on hover and while pressing, without sprinkling `cursor-pointer` on every component.

**Where it lives:** `packages/ui/styles/globals.css`, inside `@layer base`, immediately after the `@media (pointer: coarse)` touch-target block and before `:focus-visible`.

**What it does:** One rule wraps a list of selectors in `:where(...)` and sets `cursor: pointer` for native controls (buttons, links with `href`, labels with `for`, `summary`, file inputs, etc.) and common ARIA roles used by Base UI/shadcn (`button`, `link`, `menuitem`, `option`, `tab`).

**Why `:where`:** Specificity stays at zero so Tailwind utilities such as `cursor-default`, `cursor-text`, or `cursor-not-allowed` still override when a component needs a different affordance.

**Disabled state:** Native elements use `:not(:disabled)` where applicable. Role-based elements exclude `[aria-disabled="true"]`. Do not rely on this rule for “disabled” expressed only as `data-disabled` or non-`true` `aria-disabled` — those cases may need an explicit `cursor-*` on the component until attributes align.

**What not to do:** Do not add a global `[onclick]` selector or `* { cursor: pointer }`. Do not duplicate this pattern in app-level `globals.css`. If you add a new primitive (e.g. another interactive `role`), extend the **single** selector list in `packages/ui/styles/globals.css` and update the unit test in `tests/unit/packages/ui/globals-interactive-pointer-cursor.test.ts`.

**Custom click surfaces:** Elements that behave like buttons but are still `div`/`span` without a proper role should be migrated to `button`/`Link` when possible; until then, an explicit utility class may still be required for cursor and accessibility.

## How Apps Consume Tokens

Apps import the shared stylesheet as the **first line** of their own `globals.css`:

```css
@import "@asym/ui/styles/globals.css";
```

After that import, apps may add `@source` directives for their own file trees. The canonical pattern is in `apps/admin/app/globals.css`, `apps/donor/app/globals.css`, and `apps/missionary/app/globals.css`.

## Rules (MANDATORY)

❌ Apps MUST NOT:

- Create `tailwind.config.ts` or `tailwind.config.js`
- Define color tokens, radius, font, or spacing scale in app CSS
- Use any theme other than Maia
- Use any base color palette other than Zinc
- Override semantic tokens (for example, `--primary`, `--background`) in app CSS

✅ Apps MAY:

- Add `@source` directives for their own file trees
- Add layout utilities in `@layer utilities` (for example, page-specific grid helpers)
- Add app-specific non-theme CSS (animations, component overrides that don't touch tokens)

✅ Apps MAY NOT:

- Add theme primitives (colors, radii, fonts, spacing scale) - these belong in `packages/ui/styles/globals.css` only

## How to Add a New Token

1. Open `packages/ui/styles/globals.css`
2. Add the CSS variable to `:root` (light value)
3. If the token has a dark-mode variant, add it to `.dark` as well
4. Add the corresponding mapping inside `@theme inline` so Tailwind generates a utility class
5. Update the Token Reference table in this README

## shadcn/ui Integration

- shadcn/ui components consume tokens via CSS variables - no extra config needed.
- To add a component, run from the **repo root**:

```bash
bunx --bun shadcn@latest add <component> --cwd packages/ui
```

- Do **NOT** run `shadcn init` inside individual apps - the shared config in `packages/ui` is the single integration point.

### Shadcn install checklist

- Run Shadcn commands from the repo root and always target the shared package with `--cwd packages/ui`.
- Prefer `npx --yes shadcn@latest` for read-only `view`, `search`, `diff`, and registry inspection commands.
- Run `npx --yes shadcn@latest view <item> --cwd packages/ui` before third-party installs so the source, dependencies, and targets are reviewed first.
- Use `--dry-run` or `--diff` before overwriting any existing component.
- Never run `shadcn init` in apps; `packages/ui/components.json` is the shared integration point.
- Avoid manual `components.json` edits except reviewed registry changes, and run `bun run verify:shadcn-config` after any edit.
- Do not change presets, themes, Maia, Zinc, or token sourcing without design review.
- Use semantic tokens (`bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`) instead of raw palette utilities for product surfaces.
- Keep Maia/Zinc tokens in `packages/ui/styles/globals.css`; apps should only import that stylesheet and add app-local `@source` directives.
- Prefer `gap-*` over `space-x-*` / `space-y-*` when composing new layouts.
- Prefer the current shared `Field` / `InputGroup` patterns for form controls.
- Use the Shadcn MCP when available, but still review CLI `view`, `--dry-run`, and `--diff` output before accepting generated changes.
- For broad UI edits, run the non-blocking drift report with `bun run verify:shadcn-token-drift`.

### shadcnuikit registry installs

- Set `REGISTRY_TOKEN` in root `.env.local` (never commit real tokens).
- Install shadcnuikit items from repo root with:

```bash
bun run shadcn:uikit:add button1
```

- The wrapper script fetches the registry item, sanitizes unsafe `target` metadata for non-file/page entries, and then calls `shadcn add` with local JSON.
- This is required because recent `shadcn` CLI safety validation can reject some third-party payloads on Windows with:
  - `We found an unsafe file path ... in the registry item. Installation aborted.`

### `components.json` ownership

- `packages/ui/components.json` is intentionally used for registry configuration in this repo.
- `style` is pinned to **`base-maia`** (shadcn v4 Base UI Maia variant — see [schema](https://ui.shadcn.com/schema.json)) with **`tailwind.baseColor: zinc`**; Maia surfaces and Zinc tokens are enforced by `packages/ui/styles/globals.css`, not by app-local styling.
- All primitives under `components/shadcn/*` are **Base UI-backed** (`@base-ui/react`) following this pin. The repo is Base UI only: never add `radix-ui`/`@radix-ui/*` imports or dependencies, and compose with Base UI's `render` prop (not `asChild`).
- Preserve existing registry entries when adding/updating components.
- Do not manually edit `components.json`; use shadcn CLI commands from the repo root with `--cwd packages/ui`.

## Dependency Version Policy

| Dependency group           | Current range | Target (future) | Trigger to switch        |
| -------------------------- | ------------- | --------------- | ------------------------ |
| `@base-ui/react`           | Exact pin     | Exact pin       | Already pinned (`1.5.0`) |
| `class-variance-authority` | `^` caret     | Exact pin       | Same                     |
| `clsx`                     | `^` caret     | Exact pin       | Same                     |
| `tailwind-merge`           | `^` caret     | Exact pin       | Same                     |

Caret ranges are a Phase 0 pragmatic choice while the team does not yet have visual regression coverage. When updating any dependency in these groups, always run `bun run build` across all apps and do a visual review before merging.

## How to Update shadcn Components

- Current shadcn CLI version in use: `shadcn@3.6.2`.

1. Run `bunx --bun shadcn@latest add <component> --cwd packages/ui` from the repo root (not inside individual apps).
2. Review the diff carefully. shadcn components are vendored source code, not npm packages.
3. Run `bun run build` to verify no breakage.
4. Run `bun run typecheck` to verify types.
5. Commit with message: `chore(ui): update shadcn <component> to CLI vX.Y.Z`.

`components.json` is the shadcn CLI config and registry source in this repo. Do not modify it manually.

## Import Patterns

- Current repo standard (apps) for **canonical shadcn primitives**:

```ts
import { Button } from "@asym/ui/components/shadcn/button";
```

- Current repo standard (apps) for **first-party shared wrappers/compositions**:

```ts
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { FilterBar } from "@asym/ui/components/primitives/filter-bar";
```

- Compatibility note:
  - Existing deep imports under `@asym/ui/components/shadcn/*` remain supported for compatibility.
  - First-party files that were historically colocated under `components/shadcn/` now live in `components/primitives/` with compatibility re-export stubs at the old paths.

- Optional barrel imports (use when file-local patterns already use them):

```ts
import { Button } from "@asym/ui/components/shadcn";
```

```ts
import { Button } from "@asym/ui";
```
