# Styling (ReUI delta over shadcn)

Follow the shadcn skill for the generic rules (semantic colors not raw values, `gap-*` not `space-y-*`, `size-*`, `cn()`, no manual `dark:` overrides, no overlay `z-index`). This file is only the ReUI-specific additions.

## ReUI extended semantic tokens

ReUI adds semantic tokens beyond shadcn's base set. Use these instead of raw colors for status and emphasis:

- `--success` / `--success-foreground`
- `--info` / `--info-foreground`
- `--warning` / `--warning-foreground`
- `--destructive-foreground` (paired with shadcn's `--destructive`)
- `--invert` / `--invert-foreground` (inverted surfaces)

Use them as Tailwind utilities (`bg-success text-success-foreground`, `text-warning`, ...). They are defined in the project's global CSS and registered with Tailwind (`@theme inline` on v4). If a token is missing in the project, add it to the global CSS file (never a new file) following the same `name` / `name-foreground` convention, exactly as the shadcn customization rules describe.

**Incorrect:** `<span className="text-green-600">Active</span>`
**Correct:** `<Badge variant="success">Active</Badge>` or `<span className="text-success">Active</span>`

## Blocks follow your theme

When you install a block it adapts to your active theme through the semantic tokens above and the project's CSS variables. Don't hardcode style-specific values into installed block code and don't fork it to "restyle" - change the theme via the CSS variables / a preset and every block follows. Want a different look? `search` for a block whose design already fits instead of re-skinning one.

## Density and typography rhythm

ReUI operational UI usually feels dense, not airy. Keep the gap between a title and its supporting description tight by default (`gap-0.5`, `space-y-1`, or `space-y-px`), and smaller than the gap between sections. Match the surrounding ReUI density when you add rows or fields; do not pad operational surfaces like a marketing page.
