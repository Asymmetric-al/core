# shadcn/ui Design System — Skill

**Name:** `moai-library-shadcn`
**Purpose:** Build a consistent, accessible component system using shadcn/ui and Radix primitives.
Use this skill whenever selecting, composing, or customizing shadcn/ui components.

**Applies when:** Working with shadcn/ui components, Radix primitives, or Tailwind tokens/themes.
**Do not use when:** The UI does not use shadcn/ui or Radix components.

## Rules

- **shadcn/ui is copied-in code:** Treat components as first-party and keep them consistent.
- **Tokens over one-offs:** Centralize colors, spacing, radius, and typography.
- **Prefer Radix for behavior:** Use Radix for focus management and keyboard handling.
- **Composable APIs:** Favor slots and sensible defaults; avoid prop explosions.
- **Accessibility is required:** Labels, descriptions, and visible focus states.

## Workflow

1. Identify the design tokens involved (color/spacing/radius/typography).
2. Choose the closest existing shadcn/ui component.
3. Compose via Radix primitives instead of re-implementing behavior.
4. Keep API surface small and predictable.
5. Verify keyboard and a11y behavior.

## Checklists

### Implementation checklist

- [ ] Tokens are centralized (colors/radius/typography)
- [ ] Components follow shared spacing/radius patterns
- [ ] Radix behavior and keyboard support preserved
- [ ] `className` merging is consistent
- [ ] `asChild` used correctly

### Review checklist

- [ ] Forms include labels and error messaging
- [ ] No duplicate variants or near-identical components

## Minimal examples

### Token-first button usage

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

### Composable card pattern

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function Panel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>...</CardContent>
    </Card>
  );
}
```

## Common mistakes / pitfalls

- Forking components without updating tokens
- Inconsistent spacing/radius across components
- Using non-semantic elements for controls
- Duplicating components instead of extracting a base
