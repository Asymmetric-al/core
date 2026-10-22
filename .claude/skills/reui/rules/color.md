# Color

<!-- BEGIN:core-reui-overlay -->

## Core usage

Core's `packages/ui/AGENTS.md`, `docs/ai/rules/frontend.md`, and
`docs/ai/skills/moai-library-shadcn/SKILL.md` govern exact Maia geometry and
semantic tokens. Use `packages/ui/styles/globals.css` for justified shared
semantic additions with light/dark values and contrast checks. Do not change
the preset, global radius/spacing/typography/motion scales, or existing theme to
match a downloaded block. Adapt registry output to the current shared system.
The generic preset advice below does not authorize a Core preset change.

<!-- END:core-reui-overlay -->

Semantic tokens carry meaning; raw palette carries identity. Check every color in light and dark.

## Tokens

Surfaces, text and borders use your theme tokens (`background`, `foreground`, `card`, `muted`, `muted-foreground`, `primary`, `accent`, `destructive`, `border`, `ring`), so a theme change re-tints them. ReUI adds state tokens: `--success`, `--info` and `--warning` with their `-foreground`, `--destructive-foreground` (beside shadcn's `--destructive`) and `--invert` with `--invert-foreground` for inverted surfaces.

They are not part of shadcn's base theme. Installing `@reui/badge`, `@reui/alert` or `@reui/code-block` adds them to your global CSS; until one of those is installed, classes such as `bg-success` generate nothing. Check for `--success:` in your global CSS. If it is missing, add these values to `:root` and `.dark`, plus a `--color-<name>: var(--<name>)` line for each under `@theme inline`:

<!-- gen:tokens:start -->

| Token                      | `:root`                    | `.dark`                    |
| -------------------------- | -------------------------- | -------------------------- |
| `--destructive-foreground` | `var(--color-red-800)`     | `var(--color-red-600)`     |
| `--success`                | `var(--color-emerald-500)` | `var(--color-emerald-500)` |
| `--success-foreground`     | `var(--color-emerald-900)` | `var(--color-emerald-600)` |
| `--info`                   | `var(--color-violet-500)`  | `var(--color-violet-500)`  |
| `--info-foreground`        | `var(--color-violet-900)`  | `var(--color-violet-600)`  |
| `--warning`                | `var(--color-yellow-500)`  | `var(--color-yellow-500)`  |
| `--warning-foreground`     | `var(--color-yellow-900)`  | `var(--color-yellow-600)`  |
| `--invert`                 | `var(--color-zinc-900)`    | `var(--color-zinc-700)`    |
| `--invert-foreground`      | `var(--color-zinc-50)`     | `var(--color-zinc-50)`     |

<!-- gen:tokens:end -->

## Meaning vs identity

- Meaning (a state, emphasis, a surface, text) takes semantic tokens, through the Badge or Alert variant that already carries them.
- Identity (a chart series, a tag color, a team, an avatar) may use raw palette: ReUI's own lint keeps it on purpose. Always hand-pair it for dark, as in `text-violet-600 dark:text-violet-400`.
- **Incorrect:** `<span className="text-green-600">Active</span>` (raw palette for a state). **Correct:** `<Badge variant="success-light">Active</Badge>`.

## State recipes

- State badge: `<Badge variant="success-light">` from `@/components/reui/badge` (`@reui/badge`; shadcn's `components/ui/badge` has no `-light` variants or `size`), also `info-light`, `warning-light`, `destructive-light`, and `primary-light` for brand or pending. Neutral badge: `variant="outline"`. A solid `<Badge variant="success">` (white text) only when the user asks for a solid fill.
- Inline status text: `text-success-foreground dark:text-success`, the pair the ReUI Badge uses.
- Tinted surface: `border-success/15 bg-success/10 text-success-foreground dark:border-success/25 dark:bg-success/15 dark:text-success` (the Badge's `success-light` recipe).
- A message block: `<Alert variant="success">` from `@/components/reui/alert` (`@reui/alert`), also `info`, `warning` and `destructive`.
- Never `text-success` or `text-warning` as body text in light mode, and never `text-<state>-foreground` on a solid `bg-<state>` fill.

## Contrast

<!-- gen:contrast:start -->

Light is `text-<tone>-foreground` on `background` and on the `bg-<tone>/10` tint; dark is `dark:text-<tone>` on `background` and on the `dark:bg-<tone>/15` tint. Ratios against the neutral theme, rounded down; body text needs 4.5:1.

| Tone          | Light | Light on tint | Dark | Dark on tint |
| ------------- | ----- | ------------- | ---- | ------------ |
| `success`     | 9.6   | 8.8           | 8.0  | 6.6          |
| `warning`     | 8.6   | 8.1           | 10.3 | 8.1          |
| `info`        | 11.0  | 9.7           | 4.4  | 3.9          |
| `destructive` | 8.3   | 7.0           | 6.8  | 5.7          |

Raw state color as light-mode text on `background`: `text-success` 2.4, `text-warning` 1.9, `text-info` 4.4.

<!-- gen:contrast:end -->

Info text in dark mode is under 4.5:1: where it must be read, write the words in `text-foreground` and color only the icon.

## Dark mode

- shadcn uses the class strategy: `@custom-variant dark (&:is(.dark *));` in your global CSS, and `.dark` on `<html>` turns it on.
- Tokens switch by themselves; raw palette needs its `dark:` pair.
- Check both themes before you hand back.

## Charts

Check your theme's `--chart-1` to `--chart-5` in both modes. The current shadcn themes keep the same chart colors in light and dark; some themes (reui.io's own among them) change hue. For a series whose identity must hold in both modes, use a palette var such as `var(--color-violet-500)`, as ReUI blocks do.

<!-- gen:charts:start -->

Same chart colors in light and dark: neutral, stone, zinc, mauve, olive, mist, taupe, amber, blue, cyan, emerald, fuchsia, green, indigo, lime, orange, pink, purple, red, rose, sky, teal, violet, yellow. Changes hue between light and dark: reui.io's own theme.

<!-- gen:charts:end -->
