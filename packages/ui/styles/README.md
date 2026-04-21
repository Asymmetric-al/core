# @asym/ui Styles

This directory contains the shared Tailwind v4 CSS-first design token stylesheet for the `@asym/ui` package.

## Files

| File          | Purpose                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `globals.css` | Single source of truth for all design tokens, Maia theme, Zinc palette, `@theme inline` mappings, base styles, and responsive utilities |

## Usage in Apps

```css
/* app/globals.css */
@import "@asym/ui/styles/globals.css";

/* Add app-specific @source directives below */
@source "../../**/*.{js,ts,jsx,tsx,mdx}";
```

## Token Categories

- **Colors**: semantic (`--primary`, `--background`, etc.), card/popover, sidebar, charts - all OKLCH, Zinc palette
- **Radius**: `--radius` base (1rem) + sm/md/lg/xl/2xl variants
- **Fonts**: `--font-sans` (Inter), `--font-display` (Syne), `--font-mono` (Geist Mono); Next apps inject `--font-inter`, `--font-syne`, `--font-geist-mono` from `next/font/google`
- **Spacing**: `--space-*` scale + responsive gap/container/touch-target variables
- **Dark mode**: `.dark` class toggles all color tokens; `color-scheme` is set automatically

## Rules

- Apps **may** add `@source` directives and layout utilities in `@layer utilities`
- Apps **may NOT** add theme primitives (colors, radii, fonts, spacing scale) - edit `globals.css` instead and follow the process in `packages/ui/README.md`
