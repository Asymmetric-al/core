# Shared UI (`packages/ui`, `@asym/ui`)

**Scope:** Shared shadcn/Base UI primitives, UI SDK-backed components, tokens, and reusable product UI. Apps consume this package. This file is the detailed `base-maia` contract. Root `AGENTS.md` states the invariant; do not copy the root here.

## Authoritative configuration

Before adding or changing a shared component, registry item or token, read `packages/ui/components.json` and confirm:

```text
style: "base-maia"
tailwind.baseColor: "zinc"
tailwind.cssVariables: true
css: "styles/globals.css"
aliases.ui: "@/components/shadcn"
```

Then run `bunx shadcn info --json` from `packages/ui` (it needs network access to the public registry). Never run `shadcn init`, `shadcn create`, or a preset-switch command. Changing `style`, `baseColor`, `cssVariables`, the primitive base, aliases, icon library, or registries is a design-system migration, not ordinary UI work.

## What `base-maia` means

- `style` controls the generated component baseline (geometry, spacing, composition, primitive APIs, visual rhythm).
- `base-maia` = Base UI component base + Maia visual style.
- Maia is more than a palette. Zinc is the configured base color from which semantic token defaults are derived.
- Color theming uses semantic CSS variables. Feature code should use `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `ring-ring`, sidebar tokens, and chart tokens — not scattered `zinc-*` utilities or raw hex/RGB/HSL/OKLCH.
- shadcn components are Base UI (`@base-ui/react`). Composition uses `render`, not Radix `asChild`. UI SDK is the second approved library; see [Choosing a library](#choosing-a-library).

A visually attractive result that does not conform to `base-maia` is not acceptable.

## Non-negotiable contract

Every UI/UX change in this repo (apps, Eve UI, CMS/editor chrome, registry output, agent-generated components) MUST preserve the configuration above.

Do not introduce:

- Another shadcn style (`base-nova`, `base-luma`, `base-mira`, `base-rhea`, `base-sera`, `base-vega`, `base-lyra`, or any other)
- Another preset, or a different shadcn component base in `components.json` (Radix, React Aria)
- A component library beyond Base UI and UI SDK for ordinary product UI
- App-local shadcn primitives or forks of shared components
- A parallel color, radius, spacing, typography, or motion scale

Where a surface needs higher density, keep `base-maia` components and tokens. Use existing compact variants. Do not switch to a compact shadcn style.

## Choosing a library

- **Reuse first.** Start from the existing `@asym/ui` component and improve it here. Reusable primitives and behavior live in this package; apps never get a competing local version.
- **Base UI and UI SDK are both approved** for shared components. Choose UI SDK (`@ui-sdk/react`, `@ui-sdk/core`) for a concrete benefit: interaction, accessibility, a simpler or more maintainable implementation, or demonstrated performance. An equivalent Base UI control does not rule it out, and its availability alone is no reason to replace a working component. This is not an SDK-first migration.
- **Say why in the change description**, in a sentence or two. No decision document or per-control approval.
- **Prefer Base UI over Radix.** Check what a registry item or tutorial actually depends on, and take the Base UI build. A narrow Radix-specific need can be accepted through normal review; that change updates `tests/unit/packages/ui/base-ui-dependencies.test.ts`. Existing integrations, transitive packages and history are not violations.
- **One owner per control.** One library implements a control's internals; do not mix Base UI and UI SDK parts inside it. Separate components may sit together, such as a UI SDK rating inside a Base UI dialog; then verify focus, names, dismissal and overlay stacking across the boundary. When an SDK version supersedes a shared component, migrate its consumers and remove the old one.
- **One standard.** Either library meets exact `base-maia`, semantic tokens and the quality bar below.

## UI SDK implementation

These rules apply to UI SDK code only. Base UI components keep their own imports, parts and state attributes.

- **Where:** a Maia-styled `"use client"` wrapper at `components/primitives/<name>.tsx`, published by the existing `./components/primitives/*` export. Import helpers through `@asym/ui/...` or relative paths. Do not add it to a barrel or re-export the SDK. Behavior-only wrappers, such as a shortcut hook, live there too. Only this package declares the SDK, exactly pinned; apps import the wrapper and never `@ui-sdk/*`.
- **Docs:** read the installed version, not the website: start at `packages/ui/node_modules/@ui-sdk/react/docs/llms.txt`, then that package's `docs/components/<name>.md`; for a new primitive, search `docs/core.md` by heading. Follow `docs/ai/skills/ui-sdk/SKILL.md`, reading it directly in a checkout without a skill loader.
- **Styling:** import per-component entries (`@ui-sdk/react/<name>`; there is no root import) and style their `data-slot` and state attributes with semantic tokens. Never import the optional `@ui-sdk/core/web.css` or add a `--ui-*` theme. `@layer ui-sdk;` stays the first statement of `styles/globals.css` and stays in `apps/admin/app/css-layer-order.css`, below Tailwind's layers.
- **Shared owners:** use these before writing another wrapper.
  - Keyboard shortcuts: `components/primitives/shortcut.tsx` (`useShortcut`, `useShortcutHint`, `ShortcutHint`, `listShortcuts`). Every page or region shortcut registers here with a `description`, never through its own `keydown` listener; it decides typing, open Base UI overlays, regions, held keys and hydration-safe hints. `components/primitives/shortcut-help.tsx` (Shift+?) lists the described shortcuts that work where focus is; each app shell mounts it once.
  - Reordering a list: `components/primitives/sortable-list.tsx` (drag handle, keyboard pick-up, announcements, agent `move` action).
  - Agent bridge: `components/primitives/agent-bridge.tsx`, mounted once per document that renders UI SDK-backed controls (Mission Control's shell and its Web Studio layout today), with a deny-by-default allowlist pinned to each list's label. The bridge sees only UI SDK-backed controls; never mirror a Base UI or native control into it. Base UI controls stay agent-operable through correct names, roles and states.
  - Pattern checks: `@ui-sdk/core/testing` (`checkPattern`, aliased in `vitest.config.mts`) and `tests/e2e/ui-sdk-pattern-conformance.spec.ts`, which holds Core's retained Base UI wrappers to their WAI-ARIA pattern in Chromium and records each accepted deviation with its reason. A new shared interactive wrapper gets a check there.
- **Proof:** pass `aria-label` or `aria-labelledby` (Base UI `FieldLabel` does not name SDK parts), then verify keyboard, focus ring, contrast, axe, and server-render hydration. `components/primitives/rating.tsx` with `tests/e2e/ui-sdk-rating.spec.ts` is the reference.
- **Upgrades:** the SDK is beta. Bump both exact pins together and deliberately, then refresh the skill from the same release.

## Triggers

- Any UI or UX change in `packages/ui` or any app that consumes `@asym/ui`.
- Adding, upgrading, or adapting a shadcn / registry component.
- Theme-token, radius, spacing, or typography work that could affect the shared system.

## Workflow

Ordinary text, class and layout fixes, and page composition from existing `@asym/ui` components, start from steps 1 and 4: edit the shared component or compose in the app, and preserve Maia. Steps 2, 3, 5 and 6 are for adding a shared component, registry item or token, or changing a shared component's behavior, API or library. Steps 7 and 8 apply whenever their own condition holds.

1. Read this file and `docs/ai/rules/frontend.md`.
2. Confirm `components.json` as above.
3. Load `docs/ai/skills/moai-library-shadcn/SKILL.md` and the official shadcn skill under `.agents/skills/shadcn/`. When UI SDK may be the better implementation, or the file imports `@ui-sdk/*`, also read `docs/ai/skills/ui-sdk/SKILL.md` (a file in your assigned checkout).
4. Search existing shared components before creating anything new.
5. Choose the library as [Choosing a library](#choosing-a-library) describes.
6. Registry / generated components: inspect the item and its actual dependencies, take the Base UI build, adapt output to Maia, review every file, do not `--overwrite` customizations blindly, add only through `packages/ui`. Do not keep the original visual system if it conflicts with Maia.
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
- [ ] Semantic tokens used; no alternate style or preset, and no new Radix dependency without a reviewed need
- [ ] Registry output adapted to Maia before accept
- [ ] Keyboard, focus, and state behavior verified when UI is user-visible
- [ ] Any UI SDK use has a stated benefit and lives in a `packages/ui` wrapper; apps import no `@ui-sdk/*`
