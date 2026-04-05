# @asym/ui — Shared UI Package

Shared UI component library for the `@asym` monorepo. It wraps shadcn/ui and enforces the **Maia theme** with the **Zinc palette** (OKLCH color space). All design tokens live in one place.

## Design Token System

- Tailwind v4 is **CSS-first** - there is **no** `tailwind.config.ts` or `tailwind.config.js` in this repo.
- Single source of truth: `packages/ui/styles/globals.css`
- The `@theme inline` directive maps CSS custom properties to Tailwind utility classes (for example, `--color-primary` to `bg-primary` and `text-primary`).
- Maia theme + Zinc palette are **mandatory** across all apps.

## Token Reference

| Category             | CSS Variables                                                                                                                                                                                                                                                  | Notes                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Color — semantic     | `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring` | OKLCH, hue 265° (Zinc). Light + dark variants in `:root` / `.dark` |
| Color — card/popover | `--card`, `--card-foreground`, `--popover`, `--popover-foreground`                                                                                                                                                                                             | Layered surface tokens                                             |
| Color — sidebar      | `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`                                                                              | Sidebar-specific surface tokens                                    |
| Color — charts       | `--chart-1` ... `--chart-5`                                                                                                                                                                                                                                    | 5 distinct OKLCH hues for data viz                                 |
| Border radius        | `--radius` (1rem base), `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`                                                                                                                                                             | Soft/rounded Maia aesthetic                                        |
| Fonts                | `--font-sans` (Inter), `--font-mono` (Geist Mono)                                                                                                                                                                                                              | Mapped via `@theme inline`                                         |
| Spacing              | `--space-1` ... `--space-24`                                                                                                                                                                                                                                   | 0.25 rem steps                                                     |
| Gaps                 | `--gap-xs`, `--gap-sm`, `--gap-md`, `--gap-lg`, `--gap-xl`, `--section-gap`, `--card-padding`                                                                                                                                                                  | Responsive - values change at md/lg breakpoints                    |
| Container            | `--container-max-width` (1600px), `--container-padding`                                                                                                                                                                                                        | Responsive padding (1rem -> 1.5rem -> 2.5rem)                      |
| Touch targets        | `--touch-target-min` (44px), `--touch-target-recommended` (48px), `--touch-spacing-min` (8px)                                                                                                                                                                  | Applied automatically on `pointer: coarse`                         |

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
- Maia style and Zinc theme/base color are enforced by `packages/ui/styles/globals.css` tokens, not by app-local styling.
- Preserve existing registry entries when adding/updating components.
- Do not manually edit `components.json`; use shadcn CLI commands from the repo root with `--cwd packages/ui`.

## Dependency Version Policy

| Dependency group           | Current range | Target (future) | Trigger to switch             |
| -------------------------- | ------------- | --------------- | ----------------------------- |
| `@radix-ui/*`              | `^` caret     | Exact pin       | Visual regression tests in CI |
| `class-variance-authority` | `^` caret     | Exact pin       | Same                          |
| `clsx`                     | `^` caret     | Exact pin       | Same                          |
| `tailwind-merge`           | `^` caret     | Exact pin       | Same                          |

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

- Current repo standard (apps):

```ts
import { Button } from "@asym/ui/components/shadcn/button";
```

- Optional barrel imports (use when file-local patterns already use them):

```ts
import { Button } from "@asym/ui/components/shadcn";
```

```ts
import { Button } from "@asym/ui";
```
