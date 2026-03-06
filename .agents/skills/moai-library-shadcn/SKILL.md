# shadcn/ui Design System — Skill

**Name:** `moai-library-shadcn`
**Purpose:** Build consistent, accessible UI using shadcn/ui components, tokens, and composable primitives.
Use this skill whenever selecting, installing, composing, or customizing shadcn/ui in this repo.

**Applies when:** Any UI/UX work — components, forms, layouts, theming, registry, design system changes.
**Also load:** `.agents/skills/shadcn/SKILL.md` for full CLI reference, rules, and live project context injection.

---

## Repo Constraints (non-negotiable)

| Constraint | Value |
|---|---|
| Primitive library | **Base UI** (`--base base`) |
| Tailwind version | **v4** (`@theme inline` blocks, no `tailwind.config.js`) |
| Theme / style | **Maia** (`--preset` or style configured in `components.json`) |
| Package manager | `bun` — always `bunx --bun shadcn@latest` |
| Component location | `packages/ui/components/shadcn/` |

> Never use Radix UI primitives or Tailwind v3 patterns. All component APIs use Base UI (`render` prop, not `asChild`).

---

## Rules

- **Docs first:** Run `bunx --bun shadcn@latest docs <component>` before editing. Fetch the returned URLs.
- **Copied-in code is first-party:** Treat `packages/ui/components/shadcn/*` as owned project code with stable conventions.
- **Prefer install over reinvention:** Use `bunx --bun shadcn@latest add` for base components, then customize in wrappers.
- **Base UI semantics:** Use `render` prop (not `asChild`) for polymorphic rendering. Check `base` field from `bunx --bun shadcn@latest info --json`.
- **Tokens over one-offs:** Use semantic CSS variables (`bg-primary`, `text-muted-foreground`). Never raw values like `bg-blue-500` or manual `dark:` color overrides.
- **Tailwind v4 theming:** All custom tokens live in `@theme inline { }` blocks inside the global CSS file (from `tailwindCssFile` in project context). Never edit or create a `tailwind.config.js`.
- **Composable APIs:** Keep props minimal, avoid boolean-prop explosion. Use `render` for custom triggers.
- **`--dry-run` before overwriting:** Always preview with `--dry-run` and `--diff` before updating installed components.

---

## Workflow

1. Get project context — run `bunx --bun shadcn@latest info --json` or rely on `.agents/skills/shadcn/SKILL.md` injection.
2. Check `packages/ui/components/shadcn/` for existing components before adding.
3. Find components — `bunx --bun shadcn@latest search @shadcn -q "<term>"`.
4. Get docs — `bunx --bun shadcn@latest docs <component>` → fetch URLs.
5. Install — `bunx --bun shadcn@latest add <component> --cwd packages/ui`.
6. Compose app-specific wrappers outside `packages/ui/components/shadcn/`.
7. Verify keyboard, focus, labels/descriptions, and light/dark behavior.
8. Run scoped quality gates: `bunx turbo run lint typecheck --filter=@asym/ui`.

---

## CLI Quick Reference (Bun)

```bash
# Get project info / installed components
bunx --bun shadcn@latest info --json

# Add a component (scoped to the ui package)
bunx --bun shadcn@latest add button --cwd packages/ui

# Preview changes before adding/updating
bunx --bun shadcn@latest add button --dry-run --cwd packages/ui
bunx --bun shadcn@latest add button --diff button.tsx --cwd packages/ui

# Search registries
bunx --bun shadcn@latest search @shadcn -q "sidebar"

# Get docs and example URLs for a component
bunx --bun shadcn@latest docs button dialog select

# View registry item without installing
bunx --bun shadcn@latest view @shadcn/button

# Switch presets (Maia or custom)
bunx --bun shadcn@latest init --preset <code> --force --no-reinstall --cwd packages/ui
```

---

## Base UI vs Radix — Key API Differences

Since this repo uses **Base UI exclusively**:

| Pattern | Base UI (✅ correct) | Radix (❌ wrong for this repo) |
|---|---|---|
| Polymorphic render | `render={<a href="..." />}` | `asChild` |
| Select item | `<SelectOption>` | `<SelectItem>` |
| Toggle group | `<ToggleGroup.Root>` | `<ToggleGroup>` |
| Accordion item | `<Accordion.Item>` | `<AccordionItem>` |

Always verify the correct API with `bunx --bun shadcn@latest docs <component>`.

---

## Tailwind v4 Theming (Maia)

Custom tokens are defined in the global CSS file using `@theme inline`:

```css
@import "tailwindcss";

@theme inline {
  --color-primary: oklch(0.56 0.2 265);
  --color-primary-foreground: oklch(0.99 0 0);
  /* ... other Maia tokens */
}
```

- **Never** hardcode color hex/RGB values in components.
- **Never** create a `tailwind.config.js` — Tailwind v4 is CSS-first.
- Use `oklch()` for all color values (Tailwind v4 default color space).
- Find the `tailwindCssFile` path from `bunx --bun shadcn@latest info --json`.

---

## Key Patterns

```tsx
// Base UI: render prop for polymorphic rendering (not asChild)
<Button render={<a href="/dashboard" />}>Dashboard</Button>

// Form layout: FieldGroup + Field (never raw div + Label)
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" />
  </Field>
</FieldGroup>

// Validation state
<Field data-invalid>
  <FieldLabel>Email</FieldLabel>
  <Input aria-invalid />
  <FieldDescription>Invalid email.</FieldDescription>
</Field>

// Icons in buttons: data-icon, no sizing classes
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>

// Spacing: gap-*, not space-y-*
<div className="flex flex-col gap-4">  // correct
<div className="space-y-4">           // wrong

// Equal dimensions: size-*, not w-* h-*
<Avatar className="size-10">   // correct
<Avatar className="w-10 h-10"> // wrong

// Semantic colors only
<Badge variant="secondary">Active</Badge>          // correct
<span className="text-emerald-600">Active</span>   // wrong

// Conditional classes: cn() always
<div className={cn("base", isActive && "active")}>
```

---

## Component Selection

| Need | Component |
|---|---|
| Button/action | `Button` with variant |
| Form inputs | `Input`, `Select`, `Combobox`, `Switch`, `Checkbox`, `RadioGroup`, `Textarea`, `Slider` |
| Toggle 2–5 options | `ToggleGroup` + `ToggleGroupItem` |
| Data display | `Table`, `Card`, `Badge`, `Avatar` |
| Navigation | `Sidebar`, `NavigationMenu`, `Breadcrumb`, `Tabs`, `Pagination` |
| Overlays | `Dialog`, `Sheet`, `Drawer`, `AlertDialog` |
| Feedback | `sonner` toast, `Alert`, `Progress`, `Skeleton`, `Spinner` |
| Empty states | `Empty` |
| Menus | `DropdownMenu`, `ContextMenu`, `Menubar` |
| Tooltips | `Tooltip`, `HoverCard`, `Popover` |
| Callouts | `Alert` — never custom styled `div` |
| Separators | `Separator` — never `<hr>` or `border-t` div |

---

## Checklists

### Implementation checklist

- [ ] `bunx --bun shadcn@latest info --json` checked for project context
- [ ] Existing component in `packages/ui/components/shadcn/` evaluated first
- [ ] `bunx --bun shadcn@latest docs <component>` run and URLs fetched
- [ ] Base UI APIs used (`render` not `asChild`)
- [ ] Tailwind v4 `@theme inline` tokens used (no raw colors, no `tailwind.config.js`)
- [ ] Maia theme tokens respected
- [ ] `cn()` and variants consistent with existing patterns
- [ ] a11y behavior (focus, keyboard, ARIA) preserved
- [ ] `--dry-run` and `--diff` used before any component update

### Review checklist

- [ ] No Radix UI imports or patterns introduced
- [ ] No Tailwind v3 config or `tailwind.config.js` changes
- [ ] No hardcoded color values — semantic tokens only
- [ ] No `space-y-*` / `space-x-*` — use `flex gap-*`
- [ ] Wrapper components are outside `packages/ui/components/shadcn/`
- [ ] Forms use `FieldGroup` + `Field`, not raw `div` + `Label`
- [ ] Dialogs/Sheets/Drawers have a visible or `sr-only` title
- [ ] Icons use `data-icon`, no size classes on icons inside components

---

## Additional Resources

- Full shadcn docs index: [reference-links.md](reference-links.md)
- New shadcn skill (CLI v4, live context): [`.agents/skills/shadcn/SKILL.md`](../../../.agents/skills/shadcn/SKILL.md)
- CLI reference: [`.agents/skills/shadcn/cli.md`](../../../.agents/skills/shadcn/cli.md)
- MCP server setup: [`.agents/skills/shadcn/mcp.md`](../../../.agents/skills/shadcn/mcp.md)
- Base UI rules: [`.agents/skills/shadcn/rules/base-vs-radix.md`](../../../.agents/skills/shadcn/rules/base-vs-radix.md)
- Styling rules: [`.agents/skills/shadcn/rules/styling.md`](../../../.agents/skills/shadcn/rules/styling.md)
- Form rules: [`.agents/skills/shadcn/rules/forms.md`](../../../.agents/skills/shadcn/rules/forms.md)
- Tailwind v4 + shadcn setup: [`.cursor/skills/tailwind-v4-shadcn/SKILL.md`](../tailwind-v4-shadcn/SKILL.md)

---

## Common Mistakes / Pitfalls

- Using `asChild` instead of `render` (Radix pattern, not Base UI)
- Editing copied-in primitives in `packages/ui/components/shadcn/` when a thin wrapper is enough
- Using Tailwind v3 patterns (`tailwind.config.js`, `theme.extend`, `@layer` utilities)
- Hardcoding colors instead of semantic tokens
- Ignoring `bunx --bun shadcn@latest docs` and relying on stale training data
- Using `space-y-*` / `space-x-*` for spacing
- Missing `AvatarFallback` — always required
- Missing title on overlays (Dialog, Sheet, Drawer)
