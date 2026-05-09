# shadcn/ui Quick-Fix Checklist

> Superseded status: historical reference only. Current `packages/ui/components.json` is already pinned to `base-maia`, `lucide`, `zinc`, Tailwind v4 CSS-first, and `bun run verify:shadcn-diff` is clean. Do not apply these checklist items without re-verifying them against the current tree.

Companion to `shadcn-ui-audit-2026-04-16.md`. Actionable items only. Copy straight into PR descriptions.

## PR 1 — hygiene (no behavior change)

- [ ] `packages/ui/components.json`: add `"iconLibrary": "lucide"`
- [ ] `packages/ui/package.json`: remove `@radix-ui/react-toast` dependency
- [ ] `packages/ui/package.json`: remove the `"./tailwind-preset": "./tailwind-preset.ts"` export (file does not exist)
- [ ] Delete `packages/ui/styles/theme.css` (unused duplicate of `globals.css`)
- [ ] `packages/ui/components/shadcn/navigation-menu.tsx`: prepend `"use client";`
- [ ] `packages/ui/components/shadcn/sidebar.tsx`: change
      `import { useIsMobile } from "@asym/lib/hooks/use-mobile"`
      to
      `import { useIsMobile } from "@asym/ui/hooks/use-mobile"`
- [ ] Delete `packages/lib/hooks/use-mobile.ts` OR make it `export * from "@asym/ui/hooks/use-mobile"`. Update every consumer import to `@asym/ui/hooks/use-mobile`.
- [ ] `packages/ui/components/shadcn/form.tsx`: rename to `tanstack-form.tsx`; update `packages/ui/components/shadcn/index.ts` re-exports; update any consumer imports.

## PR 2 — resync canonical (shadcn@4.3.0)

- [ ] `cd packages/ui && npx shadcn@latest migrate radix` — swaps `@radix-ui/react-*` imports to the unified `radix-ui` package and `<Slot>` → `<Slot.Root>`.
- [ ] Verify `radix-ui` is added as a dep. After typecheck passes across all 3 apps, remove the individual `@radix-ui/react-*` deps that no longer appear in any source file (`rg "@radix-ui/react-"` to check).
- [ ] Adopt upstream wholesale for (small diff, mechanical):
  - [ ] `sonner.tsx`
  - [ ] `spinner.tsx`
  - [ ] `collapsible.tsx`
  - [ ] `label.tsx`
  - [ ] `skeleton.tsx`
  - [ ] `kbd.tsx`
  - [ ] `textarea.tsx`
  - [ ] `input.tsx`
  - [ ] `hover-card.tsx`
  - [ ] `separator.tsx`
  - [ ] `input-otp.tsx`
  - [ ] `checkbox.tsx`
  - [ ] `radio-group.tsx`
  - [ ] `alert.tsx`
  - [ ] `switch.tsx`
  - [ ] `toggle.tsx`
  - [ ] `empty.tsx`
  - [ ] `tooltip.tsx` (also mount a single `<TooltipProvider>` in each app's root `layout.tsx`)
  - [ ] `progress.tsx`
  - [ ] `breadcrumb.tsx`
  - [ ] `accordion.tsx`
- [ ] Medium-diff components (hand-review, one commit per file):
  - [ ] `card.tsx` (choose: keep `gap-4 / p-4` or adopt upstream `gap-6 / p-6`; comment the choice)
  - [ ] `badge.tsx` (adopt `ghost` + `link` variants and `data-variant` attribute)
  - [ ] `scroll-area.tsx`
  - [ ] `slider.tsx` (replace `bg-white` thumb with semantic token in same commit — S0-2)
  - [ ] `toggle-group.tsx`
  - [ ] `table.tsx`
  - [ ] `resizable.tsx`
  - [ ] `popover.tsx`
  - [ ] `navigation-menu.tsx` (drop the `focus-visible:outline-1`; S2-3)
  - [ ] `select.tsx`
  - [ ] `tabs.tsx` (drop the `focus-visible:outline-1`)
  - [ ] `dialog.tsx` (fix `animate-outdata-[state=closed]` whitespace bug + adopt `showCloseButton` prop)
  - [ ] `sheet.tsx` (same whitespace bug + adopt `showCloseButton` prop)
  - [ ] `dropdown-menu.tsx`
  - [ ] `avatar.tsx`
  - [ ] `carousel.tsx`
  - [ ] `context-menu.tsx`
  - [ ] `pagination.tsx`
- [ ] High-diff components (hand-port):
  - [ ] `menubar.tsx`
  - [ ] `item.tsx`
  - [ ] `field.tsx`
  - [ ] `button-group.tsx`
  - [ ] `drawer.tsx` (keeps `@base-ui/react/drawer` — see audit §S2-4)
  - [ ] `calendar.tsx`
  - [ ] `alert-dialog.tsx`
  - [ ] `input-group.tsx`
  - [ ] `command.tsx`
  - [ ] `sidebar.tsx` (uses the new `@asym/ui/hooks/use-mobile` path from PR 1)
  - [ ] `chart.tsx` (preserve ChartStyle/ChartConfig custom API)
- [ ] `button.tsx` — keystone update:
  - [ ] Adopt upstream base classes (transition-all, glow focus ring, dark variants, `min-w-0` on input, etc.)
  - [ ] Add `xs` size, add `data-variant` and `data-size` attributes, set explicit defaults
  - [ ] **Preserve** `maia` and `maia-outline` variants but rewrite with semantic tokens (no `bg-slate-*`, no `bg-white`, no `text-slate-*`)
- [ ] `form.tsx` stays as `tanstack-form.tsx` (from PR 1). Do NOT run `shadcn add form` — it will overwrite the custom TanStack Form integration.

## PR 3 — theme discipline & re-home

- [x] Replace hardcoded non-semantic colors with tokens in:
  - [x] `packages/ui/components/shadcn/slider.tsx`
  - [x] `packages/ui/components/primitives/chart-wrappers.tsx`
  - [x] `packages/ui/components/shadcn/data-grid/data-grid-cell.tsx`
  - [x] `packages/ui/components/shadcn/data-table/data-table-wrapper.tsx`
  - [x] `packages/ui/components/primitives/filter-bar.tsx`
  - [x] `packages/ui/components/primitives/image-cropper.tsx`
  - [x] `packages/ui/components/primitives/image-upload.tsx`
  - [x] `packages/ui/components/primitives/map.tsx`
- [x] Move first-party shared additions to `packages/ui/components/primitives/`
- [x] Keep compatibility shims at the old `packages/ui/components/shadcn/*` paths for deep-import stability
- [x] Add `packages/ui/components/shadcn/CUSTOM.md` manifest documenting the custom boundary
- [ ] Add ESLint rule forbidding non-deep imports of `@asym/ui` in `apps/**`.
- [ ] Optional: modernize `@layer base :focus-visible` in `styles/globals.css` to the v4 glow style.
- [ ] Optional: remove unused `--space-*` / `--gap-*` custom variables from `styles/globals.css`.
- [ ] Optional: dark-mode-aware variants for `--chart-1 … --chart-5`.

## Verification (run for every PR)

```bash
bun run lint
bun run typecheck
bun run test:unit
bun run build
bun run test:e2e:smoke
bun run test:a11y

# Sanity-check components.json
cd packages/ui && npx shadcn@latest info
# Single-component re-diff (should now be empty except the intentional @asym/ui/lib/utils line)
cd packages/ui && npx shadcn@latest add button --diff
```

Visual QA routes (light + dark): `/admin`, `/admin/contributions`, `/admin/mobilize`, `/admin/care`, `/donor-dashboard`, `/donor-dashboard/wallet`, `/missionary/feed`, `/missionary/tasks`, `/missionary/donors`.
