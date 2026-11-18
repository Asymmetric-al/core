---
name: moai-library-shadcn
description: "Build UI with Core's shadcn/Base UI system. Use for selecting, installing, composing, or customizing shadcn/ui, registry items, themes, and wrappers. Always preserve exact style `base-maia`, Zinc-oriented semantic CSS-variable tokens, and Base UI primitives in shadcn components. Do not use to switch styles, run `shadcn init`, or switch the component base to Radix or React Aria. Pair with `packages/ui/AGENTS.md`."
---

## This repository (Asymmetric-al/core)

These repo-owned sections are intentionally kept on top of the vendored
shadcn skill. If upstream refreshes replace this file, reconcile this overlay
before running `bun run skills:sync`.

### Triggers

- Use for selecting, installing, composing, or customizing shadcn/ui, registry
  items, themes, and wrappers in this repo.
- Use together with `packages/ui/AGENTS.md` and `docs/ai/rules/frontend.md`.
- Do not use to switch styles, run `shadcn init` / `shadcn create`, or switch
  the component base to Radix or React Aria. Prefer Base UI over Radix; a
  narrow Radix need goes through review, as `packages/ui/AGENTS.md` says.
  Never run `shadcn init`. Do not switch Core to
  `base-nova`, `base-luma`, `base-mira`, `base-rhea`, `base-sera`,
  `base-vega`, `base-lyra`, a Radix-based style, or a React Aria-based style.

### Workflow

1. Read `packages/ui/components.json` and confirm `style: "base-maia"`,
   `tailwind.baseColor: "zinc"`, `tailwind.cssVariables: true`.
2. Run `bunx shadcn@latest info --json` from `packages/ui` (never from an app).
3. Search existing `@asym/ui` components before adding anything new.
4. For registry or generated components, inspect CLI output and its actual
   dependencies (take the Base UI build, not Radix), adapt to Maia, and
   review the full diff. Never `--overwrite` without reviewing customizations.
5. Use Base UI `render` (not Radix `asChild`). Prefer semantic tokens over
   literal `zinc-*` or hardcoded colors.
6. Follow [Core design-system lint](references/design-system-lint.md) for
   scoped lint, raw-finding review, authoring exceptions, and checking consumers
   after shared changes. To fix a specific finding, use the short
   [fix guide](references/design-system-lint-fixes.md). Preserve other shadcn
   guardrails and browser evidence when visible. Do not load this workflow for
   unrelated work.

### Checklist

- [ ] Exact `base-maia` / Zinc / CSS variables remain unchanged
- [ ] Shared ownership stays in `packages/ui`
- [ ] Registry output adapted to Core tokens, radii, and primitives
- [ ] No `shadcn init`, preset-switch or React Aria base, and no new Radix
      dependency without a reviewed need
- [ ] Overlay reconciled before `bun run skills:sync`

# shadcn/ui in Core

Use this skill whenever selecting, installing, composing, or customizing shadcn/ui in this repo. Use `base-ui` for primitive API details after this skill.

## Rules

- **Docs first:** Start with [reference-links.md](reference-links.md), then open the exact component doc before editing.
- **Where components live:** shadcn components are copied into `packages/ui/components/shadcn/` (the `ui` alias `@/components/shadcn` in `packages/ui/components.json`) and are first-party code. Apps import them as `@asym/ui/components/shadcn/<name>`. Shared wrappers and UI SDK behavior wrappers live in `packages/ui/components/primitives/`.
- **No app-local forks:** Do not copy a shared component into an app to make a local variation; add a variant, slot, or composition wrapper in `packages/ui`.
- **Prefer install over reinvention:** Use CLI/registry install paths for base components, then adapt the output to Maia.
- **Behavior primitives stay intact:** Keep accessibility and keyboard behavior from the Base UI-backed internals. UI SDK-backed components follow "Choosing a library" in `packages/ui/AGENTS.md`.
- **Tokens over one-offs:** Use semantic tokens for color, radius, spacing, and typography; avoid hardcoded one-off styles.
- **Composable APIs:** Keep props minimal, use Base UI's `render` prop (no `asChild`), and avoid boolean-prop explosion.

## Checklist

- [ ] Existing `@asym/ui` component evaluated before creating a new one
- [ ] Token-based styling (no unnecessary arbitrary values)
- [ ] `cn()` and variants consistent with existing patterns
- [ ] `render` prop and composition semantics correct
- [ ] Focus, keyboard, labels, descriptions, and light/dark behavior verified
- [ ] No duplicate variants that should be shared

## Example

```tsx
import { Button } from "@asym/ui/components/shadcn/button";

export function Actions() {
  return (
    <div className="flex gap-2">
      <Button>Save</Button>
      <Button variant="secondary">Cancel</Button>
    </div>
  );
}
```

## Additional resources

- Full shadcn docs index: [reference-links.md](reference-links.md)
- Base primitives companion skill: [`docs/ai/skills/base-ui/SKILL.md`](../base-ui/SKILL.md)
