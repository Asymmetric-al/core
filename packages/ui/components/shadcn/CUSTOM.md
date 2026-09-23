# Custom files in `components/shadcn`

The primitive base is **Base UI** (`@base-ui/react` via the shadcn
`base-maia` style). Never add `radix-ui`/`@radix-ui/*` imports; composition
uses Base UI's `render` prop, not `asChild`. Established specialist integrations
are documented in [the compliance guide](../../../../docs/guides/base-ui-compliance.md).

`DropdownMenuLabel`, `ContextMenuLabel`, and `MenubarLabel` must be children of
the corresponding public `Group` or `RadioGroup` that also owns their items.
They do not create an implicit group. Keep labels presentational: interactive
controls must be siblings, because Base UI's `GroupLabel` is `aria-hidden`.

This directory contains two kinds of files:

1. **Canonical shadcn/ui primitives** managed with the shadcn CLI.
2. **Compatibility stubs** — thin `export * from "../primitives/..."` files that keep legacy deep imports stable while canonical implementations live in `packages/ui/components/primitives/`. Prefer `@asym/ui/components/primitives/*` (or the package barrel) for new code.

When running future shadcn CLI updates, treat the following as **custom** and review them manually instead of expecting canonical upstream diffs:

- `chart-wrappers.tsx`
- `filter-bar.tsx`
- `image-upload.tsx`
- `image-cropper.tsx`
- `map.tsx`
- `motion-preset.tsx`
- `page-shell.tsx`
- `responsive-container.tsx`
- `ripple-button.tsx`
- `theme-toggle.tsx`
- `RichTextEditor.tsx`
- `rich-text-editor/`
- `data-table/`
- `data-grid/`
- `icons/`
- `input-otp.tsx` — intentionally adapts Base UI's stable `OTPField`, using
  `length`, `onValueChange`, and ordered slot children. It does not expose the
  `input-otp` package's `maxLength`/indexed-slot API; review CLI updates manually.
- `number-field.tsx`
- `meter.tsx`
- `toolbar.tsx`
- `searchable-select.tsx`

Rules:

- Prefer updating canonical primitives with the shadcn CLI first, then re-layer repo-specific behavior if needed.
- Keep custom files on semantic Maia/Zinc tokens (`bg-background`, `text-foreground`, `border-border`, etc.).
- Do not assume these files exist upstream in `shadcn-ui/ui`.

## Drift checks

CI runs `bun run verify:shadcn-diff` (wrapper around `bunx shadcn@latest diff` in `packages/ui`). If it fails, refresh components from the registry or reconcile intentional overrides before merging.
