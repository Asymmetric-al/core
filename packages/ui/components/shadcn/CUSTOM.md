# Custom files in `components/shadcn`

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

Rules:

- Prefer updating canonical primitives with the shadcn CLI first, then re-layer repo-specific behavior if needed.
- Keep custom files on semantic Maia/Zinc tokens (`bg-background`, `text-foreground`, `border-border`, etc.).
- Do not assume these files exist upstream in `shadcn-ui/ui`.

## Drift checks

CI runs `bun run verify:shadcn-diff` (wrapper around `bunx shadcn@latest diff` in `packages/ui`). If it fails, refresh components from the registry or reconcile intentional overrides before merging.
