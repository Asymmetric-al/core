# Shared UI (`packages/ui`, `@asym/ui`)

**Scope:** Shared shadcn/Base UI primitives, approved UI SDK behavior wrappers, tokens, and reusable product UI. Apps consume this package. This file is the detailed `base-maia` contract. Root `AGENTS.md` states the invariant; do not copy the root here.

## Authoritative configuration

Before any substantive UI/UX change, read `packages/ui/components.json` and confirm:

```text
style: "base-maia"
tailwind.baseColor: "zinc"
tailwind.cssVariables: true
css: "styles/globals.css"
aliases.ui: "@/components/shadcn"
```

Then run the Bun-compatible equivalent of `shadcn info --json` from `packages/ui`. Never run `shadcn init`, `shadcn create`, or a preset-switch command. Changing `style`, `baseColor`, `cssVariables`, the primitive base, aliases, icon library, or registries is a design-system migration, not ordinary UI work.

## What `base-maia` means

- `style` controls the generated component baseline (geometry, spacing, composition, primitive APIs, visual rhythm).
- `base-maia` = Base UI component base + Maia visual style.
- Maia is more than a palette. Zinc is the configured base color from which semantic token defaults are derived.
- Color theming uses semantic CSS variables. Feature code should use `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `ring-ring`, sidebar tokens, and chart tokens — not scattered `zinc-*` utilities or raw hex/RGB/HSL/OKLCH.
- Shared primitives are Base UI (`@base-ui/react`). Composition uses `render`, not Radix `asChild`. Never add `radix-ui` / `@radix-ui/*` or React Aria as the product primitive base. UI SDK fills only the gaps described in [UI SDK](#ui-sdk-complementary-behaviors).

A visually attractive result that does not conform to `base-maia` is not acceptable.

## Non-negotiable contract

Every UI/UX change in this repo (apps, Eve UI, CMS/editor chrome, registry output, agent-generated components) MUST preserve the configuration above.

Do not introduce:

- Another shadcn style (`base-nova`, `base-luma`, `base-mira`, `base-rhea`, `base-sera`, `base-vega`, `base-lyra`, or any other)
- Another preset or component base (Radix, React Aria)
- A second component library for ordinary product UI (UI SDK is admitted only for the gaps below)
- App-local shadcn primitives or forks of shared components
- A parallel color, radius, spacing, typography, or motion scale

Where a surface needs higher density, keep `base-maia` components and tokens. Use existing compact variants. Do not switch to a compact shadcn style.

## UI SDK (complementary behaviors)

`@ui-sdk/react` and `@ui-sdk/core` supply behaviors Base UI does not ship. They do not replace Base UI.

- **When:** only for an interaction no shared component provides, such as a star rating, a mixed text-and-token input, keyboard shortcuts, drag-and-keyboard reordering, or a custom composite like a stepper. If Base UI or an existing `@asym/ui` component covers it, use that, even where UI SDK ships an equivalent: labelled choices are a Radio Group, tag multi-select is Combobox chips, and dates, commands and toasts use Calendar, Command and Sonner. Keep one owner per interaction.
- **Where:** a Maia-styled `"use client"` wrapper at `components/primitives/<name>.tsx`, published by the existing `./components/primitives/*` export. Import helpers through `@asym/ui/...` or relative paths. Do not add it to a barrel or re-export the SDK. Behavior-only wrappers, such as a shortcut hook, live there too. Only this package declares the SDK, exactly pinned; apps import the wrapper and never `@ui-sdk/*`.
- **Docs:** read the installed version, not the website: start at `packages/ui/node_modules/@ui-sdk/react/docs/llms.txt`, then that package's `docs/components/<name>.md`; for a new primitive, search `docs/core.md` by heading. Follow `docs/ai/skills/ui-sdk/SKILL.md`, reading it directly in a checkout without a skill loader.
- **Styling:** import per-component entries (`@ui-sdk/react/<name>`; there is no root import) and style their `data-slot` and state attributes with semantic tokens. Never import the optional `@ui-sdk/core/web.css` or add a `--ui-*` theme. `@layer ui-sdk;` stays the first statement of `styles/globals.css` and stays in `apps/admin/app/css-layer-order.css`, below Tailwind's layers.
- **Proof:** pass `aria-label` or `aria-labelledby` (Base UI `FieldLabel` does not name SDK parts), then verify keyboard, focus ring, contrast, axe, and server-render hydration. `components/primitives/rating.tsx` with `tests/e2e/ui-sdk-rating.spec.ts` is the reference.
- **Upgrades:** the SDK is beta. Bump both exact pins together and deliberately, then refresh the skill from the same release.

## Triggers

- Any UI or UX change in `packages/ui` or any app that consumes `@asym/ui`.
- Adding, upgrading, or adapting a shadcn / registry component.
- Theme-token, radius, spacing, or typography work that could affect the shared system.

## Workflow

1. Read this file and `docs/ai/rules/frontend.md`.
2. Confirm `components.json` as above.
3. Load `docs/ai/skills/moai-library-shadcn/SKILL.md` and the official shadcn skill under `.agents/skills/shadcn/`. For an interaction no shared component provides, also read `docs/ai/skills/ui-sdk/SKILL.md` (a file in your assigned checkout).
4. Search existing shared components before creating anything new.
5. Ordinary text/class/layout fixes: edit the shared component or compose in the app. Still preserve Maia.
6. Registry / generated components: inspect the item, confirm Base UI resolution, adapt output to Maia, review every file, do not `--overwrite` customizations blindly, add only through `packages/ui`. Do not keep the original visual system if it conflicts with Maia.
7. For substantive UI behavior, use TDD (`docs/ai/skills/tdd/SKILL.md`) and verify keyboard, focus, responsive, loading/empty/error/disabled states, and browser evidence.
8. Follow `docs/ai/skills/moai-library-shadcn/references/design-system-lint.md`
   for scoped lint, finding review, authoring boundaries, and consumer checks
   after shared changes. Keep existing shadcn config, token, drift, and UI audits.

## Semantic tokens vs Zinc

Prefer semantic utilities. “Zinc” is the theme family, not a license to hardcode `zinc-*` everywhere. New semantic colors need a purpose-based name, light and dark values, Tailwind `@theme inline` mapping, and contrast review. Do not change `:root` / `.dark` / global radius / spacing / typography / motion / chart / sidebar tokens to fix one component.

Justified exceptions (charts, brand, status, specialized editors, media) still belong in centralized tokens, not scattered arbitrary values.

## Ownership

- Shared primitives and reusable UI belong here.
- Apps import `@asym/ui`. Do not copy a shared component into an app to make a local variation — add a variant, slot, or composition wrapper.
- Do not generate shadcn components inside `apps/*`.
- CLI additions: `bunx --bun shadcn@latest add <component> --cwd packages/ui` (or equivalent from this package).

## Quality bar

Consider hierarchy, Maia spacing and radii, semantic color, typography, loading/empty/error/disabled/hover/focus-visible states, keyboard and screen-reader naming, touch targets, overflow, long text, reduced motion, and Server/Client boundaries. Compiling is not enough. Matching a screenshot is not enough if it fights Maia.

## Checklist

- [ ] `components.json` still has exact `style: "base-maia"`, `tailwind.baseColor: "zinc"`, `tailwind.cssVariables: true`
- [ ] Shared primitives stay in `packages/ui`; apps consume `@asym/ui`
- [ ] Semantic tokens used; no alternate style, preset, or primitive base
- [ ] Registry output adapted to Maia before accept
- [ ] Keyboard, focus, and state behavior verified when UI is user-visible
- [ ] Any UI SDK use fills a gap no shared component covers, through a `packages/ui` wrapper; apps import no `@ui-sdk/*`
