# shadcn/ui Design System - Skill

**Name:** `moai-library-shadcn`
**Purpose:** Build consistent, accessible UI using shadcn/ui components, tokens, and composable primitives.
Use this skill whenever selecting, installing, composing, or customizing shadcn/ui in this repo.

**Applies when:** Working with shadcn/ui components, Tailwind tokens/themes, registry items, or component wrappers.
**Do not use when:** The UI is intentionally built only with Base UI primitives (use `base-ui` first).

## Rules

- **Docs first:** Start with [reference-links.md](reference-links.md), then open the exact component doc before editing.
- **Copied-in code is first-party:** Treat `components/ui/*` as owned project code with stable conventions.
- **Prefer install over reinvention:** Use CLI/registry install paths for base components, then customize in wrappers.
- **Behavior primitives stay intact:** Keep accessibility and keyboard behavior from Radix or Base-backed internals.
- **Tokens over one-offs:** Centralize color, radius, spacing, and typography; avoid hardcoded one-off styles.
- **Composable APIs:** Keep props minimal, use `asChild` intentionally, and avoid boolean-prop explosion.
- **Interoperability guardrail:** If mixing with Base UI primitives, document the boundary and keep one clear owner per interaction.

## Workflow

1. Check whether an existing component already solves the need in `components/ui/*`.
2. Open the relevant docs from [reference-links.md](reference-links.md).
3. Choose install path:
   - CLI/registry install for standard components and blocks.
   - Manual composition only when customization requires it.
4. Compose app-specific wrappers outside `components/ui/*`.
5. Verify keyboard, focus, labels/descriptions, and light/dark behavior.
6. Run scoped quality gates for changed packages.

## Checklists

### Implementation checklist

- [ ] Existing shadcn component evaluated before creating new primitive
- [ ] Token-based styling used (no unnecessary arbitrary values)
- [ ] `cn()` and variants are consistent with existing patterns
- [ ] `asChild` and composition semantics are correct
- [ ] a11y behavior (focus, keyboard, ARIA) preserved

### Review checklist

- [ ] No duplicate component variants that should be shared
- [ ] Wrapper components are outside `components/ui/*`
- [ ] Forms include labels, help text, and error messaging
- [ ] Any Base UI crossover is explicit and justified

## Minimal examples

### Reuse existing primitive

```tsx
import { Button } from "@/components/ui/button";

export function Actions() {
  return (
    <div className="flex gap-2">
      <Button>Save</Button>
      <Button variant="secondary">Cancel</Button>
    </div>
  );
}
```

### Extend in wrapper layer

```tsx
import { Button } from "@/components/ui/button";

type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean;
};

export function LoadingButton({
  loading,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={loading} {...props}>
      {children}
    </Button>
  );
}
```

## Additional resources

- Full shadcn docs index: [reference-links.md](reference-links.md)
- Base primitives companion skill: [`docs/ai/skills/base-ui/SKILL.md`](../base-ui/SKILL.md)
- Base docs index: [`docs/ai/skills/base-ui/reference-links.md`](../base-ui/reference-links.md)

## Common mistakes / pitfalls

- Editing copied-in primitives when a thin wrapper is enough
- Ignoring docs updates and relying on stale memory
- Mixing primitive systems inside one component without clear ownership
- Breaking keyboard/focus behavior while styling
