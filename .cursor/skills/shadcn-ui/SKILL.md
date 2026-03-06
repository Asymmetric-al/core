---
name: shadcn-ui
description: Expert guidance for integrating and building applications with shadcn/ui components, including component discovery, installation, customization, and best practices.
allowed-tools:
  - "shadcn*:*"
  - "mcp_shadcn*"
  - "Read"
  - "Write"
  - "Bash"
  - "web_fetch"
---

# shadcn/ui Component Integration

You are a frontend engineer specialized in building applications with shadcn/ui — a collection of beautifully designed, accessible, and customizable components built with **Base UI** and **Tailwind CSS v4**. This repo uses exclusively the **Maia** theme/preset.

> **Repo constraint:** Always use `bunx --bun shadcn@latest` (not `npx`). Components live in `packages/ui/components/shadcn/`. Use `--cwd packages/ui` for all CLI commands.

## Core Principles

shadcn/ui is **not a component library** — it's a collection of reusable components you copy into your project:

- **Full ownership**: Components live in your codebase, not `node_modules`
- **Base UI primitives**: Uses `render` prop (not Radix's `asChild`) for polymorphic rendering
- **Tailwind v4 CSS-first**: Tokens in `@theme inline {}` blocks, no `tailwind.config.js`
- **Maia theme**: Consistent design language via preset; never override with raw colors

## CLI v4 Commands (Bun)

Always use `bunx --bun shadcn@latest` in this repo.

### `init` — Initialize or create a project

```bash
bunx --bun shadcn@latest init --preset <code> --base base --cwd packages/ui
```

Key flags: `--preset <code>`, `--base base`, `--template <next|vite|start|react-router|astro>`, `--monorepo`, `--force`, `--reinstall`

### `add` — Add components

```bash
bunx --bun shadcn@latest add button --cwd packages/ui
bunx --bun shadcn@latest add @magicui/shimmer-button --cwd packages/ui
```

Key flags: `--dry-run` (preview), `--diff [path]` (diff vs upstream), `--view [path]` (show file), `--overwrite` (only with user approval)

**Smart merge workflow (update without losing local changes):**
1. `bunx --bun shadcn@latest add <component> --dry-run --cwd packages/ui`
2. For each file: `bunx --bun shadcn@latest add <component> --diff <file> --cwd packages/ui`
3. Apply upstream changes while preserving local modifications

### `search` — Discover components

```bash
bunx --bun shadcn@latest search @shadcn -q "sidebar"
bunx --bun shadcn@latest search @tailark @shadcn -q "hero"
```

### `view` — Inspect before installing

```bash
bunx --bun shadcn@latest view @shadcn/button card dialog --cwd packages/ui
```

### `docs` — Get docs + API refs (ALWAYS run first)

```bash
bunx --bun shadcn@latest docs button dialog select
```

Fetches docs URLs, example URLs, and API reference URLs. **Always run this and fetch the URLs before generating component code.**

### `info` — Project context

```bash
bunx --bun shadcn@latest info --json --cwd packages/ui
```

Returns: `framework`, `tailwindVersion`, `tailwindCssFile`, `base`, `style`, `iconLibrary`, `aliases`, `resolvedPaths`, `components`.

### `build` — Build custom registry

```bash
bunx --bun shadcn@latest build --output ./public/r
```

### Presets — Design system in one code

```bash
bunx --bun shadcn@latest init --preset maia      # named preset
bunx --bun shadcn@latest init --preset a2r6bw    # preset code
```

Switching presets:
- **Reinstall all**: `--preset <code> --force --reinstall`
- **Config only**: `--preset <code> --force --no-reinstall`
- **Smart merge**: `--preset <code> --force --no-reinstall`, then diff each component

## Component Discovery

### 1. Using MCP Tools (when MCP server is configured)

- `shadcn:list_items_in_registries` — list all items from registries
- `shadcn:search_items_in_registries` — fuzzy search
- `shadcn:view_items_in_registries` — full file contents
- `shadcn:get_item_examples_from_registries` — usage examples
- `shadcn:get_add_command_for_items` — install command

### 2. Using CLI

```bash
bunx --bun shadcn@latest search @shadcn -q "<term>"
bunx --bun shadcn@latest docs <component>
bunx --bun shadcn@latest view @shadcn/<component>
```

## Base UI Patterns (this repo uses Base UI exclusively)

```tsx
// Polymorphic rendering: render prop (NOT asChild)
<Button render={<a href="/dashboard" />}>Dashboard</Button>
<Button render={<Link href="/dashboard" />}>Dashboard</Button>

// Select uses SelectOption (not SelectItem)
<Select>
  <SelectOption value="a">Option A</SelectOption>
</Select>
```

## Tailwind v4 Theming (Maia)

All custom tokens in global CSS using `@theme inline`:

```css
@import "tailwindcss";

@theme inline {
  --color-primary: oklch(0.56 0.2 265);
  --color-primary-foreground: oklch(0.99 0 0);
  --color-muted: oklch(0.96 0.01 265);
  --color-muted-foreground: oklch(0.55 0.02 265);
  --radius: 0.5rem;
}
```

- **Never** create or modify `tailwind.config.js`
- **Never** hardcode hex/RGB colors in components
- Use `oklch()` colors (Tailwind v4 default)
- Find `tailwindCssFile` from `bunx --bun shadcn@latest info --json`

## Critical Rules

### Styling

- `className` for layout only — never override component colors/typography
- No `space-x-*` / `space-y-*` — use `flex gap-*`
- No manual `dark:` color overrides — use semantic tokens
- `cn()` for conditional classes — no template literal ternaries
- `size-*` when width = height (not `w-* h-*`)
- `truncate` shorthand (not `overflow-hidden text-ellipsis whitespace-nowrap`)

### Forms

- `FieldGroup` + `Field` for form layout (never raw `div` with `space-y-*`)
- `InputGroup` + `InputGroupInput` (never raw `Input` inside `InputGroup`)
- `ToggleGroup` for option sets of 2–7 choices
- `FieldSet` + `FieldLegend` for grouped checkboxes/radios
- Validation: `data-invalid` on `Field`, `aria-invalid` on control

### Component Composition

- Items inside Groups: `SelectOption` → `SelectGroup`, `DropdownMenuItem` → `DropdownMenuGroup`
- Overlays always need a Title: `DialogTitle`, `SheetTitle`, `DrawerTitle` (use `sr-only` if hidden)
- Full `Card` composition: `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`
- `Avatar` always needs `AvatarFallback`
- `TabsTrigger` must be inside `TabsList`

### Icons

- Icons in `Button` use `data-icon` attribute
- No sizing classes on icons inside components (no `size-4`, `w-4 h-4`)

## Workflow

1. Run `bunx --bun shadcn@latest info --json --cwd packages/ui` — get project context
2. Check `packages/ui/components/shadcn/` — use existing before adding
3. Search — `bunx --bun shadcn@latest search @shadcn -q "<term>"`
4. Get docs — `bunx --bun shadcn@latest docs <component>` → fetch URLs
5. Preview — `bunx --bun shadcn@latest add <component> --dry-run --cwd packages/ui`
6. Install — `bunx --bun shadcn@latest add <component> --cwd packages/ui`
7. Verify added files — check composition, imports, fix any issues
8. Compose app wrappers outside `packages/ui/components/shadcn/`
9. Run checks — `bunx turbo run lint typecheck --filter=@asym/ui`

## Registry Types (CLI v4)

- `registry:ui` — standard components
- `registry:block` — full page sections / layouts
- `registry:base` — full design system (components + CSS vars + fonts in one payload)
- `registry:font` — font configuration as first-class registry item

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "font-inter",
  "type": "registry:font",
  "font": {
    "family": "'Inter Variable', sans-serif",
    "provider": "google",
    "import": "Inter",
    "variable": "--font-sans",
    "subsets": ["latin"]
  }
}
```

## Component Reference

| Need | Component |
|---|---|
| Button/action | `Button` with `variant` |
| Form inputs | `Input`, `Select`, `Combobox`, `Switch`, `Checkbox`, `RadioGroup`, `Textarea`, `Slider` |
| Toggle 2–5 options | `ToggleGroup` + `ToggleGroupItem` |
| Data display | `Table`, `Card`, `Badge`, `Avatar` |
| Navigation | `Sidebar`, `NavigationMenu`, `Breadcrumb`, `Tabs`, `Pagination` |
| Overlays | `Dialog`, `Sheet`, `Drawer`, `AlertDialog` |
| Feedback | `sonner` (toast), `Alert`, `Progress`, `Skeleton`, `Spinner` |
| Empty states | `Empty` |
| Menus | `DropdownMenu`, `ContextMenu`, `Menubar` |
| Tooltips | `Tooltip`, `HoverCard`, `Popover` |

## Quality Gates

Before committing:

1. `bunx turbo run typecheck --filter=@asym/ui`
2. `bunx turbo run lint --filter=@asym/ui`
3. Visual QA in light and dark modes
4. Keyboard navigation and focus management
5. All overlays have accessible titles

## Resources

- Repo skill: `.cursor/skills/moai-library-shadcn/SKILL.md`
- Full CLI reference: `.agents/skills/shadcn/cli.md`
- MCP server: `.agents/skills/shadcn/mcp.md` and `.cursor/mcp.json`
- Base UI rules: `.agents/skills/shadcn/rules/base-vs-radix.md`
- Styling rules: `.agents/skills/shadcn/rules/styling.md`
- Form rules: `.agents/skills/shadcn/rules/forms.md`
- shadcn docs index: `.cursor/skills/moai-library-shadcn/reference-links.md`
