# Theming: styles, radius, density and sizes

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

## Read your style

`components.json` `style` is `<base>-<style>`: the part after the first `-` names the style (`base-nova` is nova on Base UI). The style is baked into `components/ui` and `components/reui` at install, so the installed files hold your real values: read your installed `button.tsx` (usually `components/ui/button.tsx`) for heights, radius and padding before you build anything that sits beside a control.

## The style ladder

<!-- gen:style-ladder:start -->

| Style | Button `sm` / default / `lg` | Button radius  | Card radius, shadow                                  | Card spacing | Button text          |
| ----- | ---------------------------- | -------------- | ---------------------------------------------------- | ------------ | -------------------- |
| vega  | `h-8` / `h-9` / `h-10`       | `rounded-md`   | `rounded-xl`, `shadow-xs`                            | 6, sm 4      | `text-sm`            |
| nova  | `h-7` / `h-8` / `h-9`        | `rounded-lg`   | `rounded-xl`                                         | 4, sm 3      | `text-sm`            |
| maia  | `h-8` / `h-9` / `h-10`       | `rounded-4xl`  | `rounded-2xl`                                        | 6, sm 4      | `text-sm`            |
| lyra  | `h-7` / `h-8` / `h-9`        | `rounded-none` | `rounded-none`                                       | 4, sm 3      | `text-xs`            |
| mira  | `h-6` / `h-7` / `h-8`        | `rounded-md`   | `rounded-lg`                                         | 4, sm 3      | `text-xs/relaxed`    |
| luma  | `h-8` / `h-9` / `h-10`       | `rounded-4xl`  | `rounded-4xl`, `shadow-md`                           | 6, sm 4      | `text-sm`            |
| sera  | `h-9` / `h-10` / `h-11`      | `rounded-none` | square, `shadow-sm`                                  | 8, sm 5      | `text-xs`, uppercase |
| rhea  | `h-7` / `h-8` / `h-9`        | `rounded-2xl`  | `rounded-[min(var(--radius-4xl),24px)]`, `shadow-sm` | 5, sm 4      | `text-sm`            |

<!-- gen:style-ladder:end -->

Card spacing is the `--card-spacing` step (`--spacing(n)`) a Card pads with; `Card size="sm"` uses the sm step. The default Button text weight is `font-medium` (sera: `font-semibold`).

## What the style owns

- Never set what the style owns on its parts: radius (except `rounded-full`), height, horizontal padding, shadow, ring or font size. Pick `size` and `variant` instead.
- A panel is a `Card` or a `Frame`, never a div with `rounded-*`, `border` and `bg-card`; set density with `Card size="sm"` or Frame `spacing`.
- A bespoke element beside a control (a chip, a custom trigger) takes its height and radius from that control's row above.
- A focusable control you build copies the focus classes of your installed `input.tsx`.
- A variant before a class: `className` is for layout (placement, width, gap). `size-*` when width equals height, `cn()` for conditional classes (never a template literal), a scale step before an arbitrary value (`w-60`, not `w-[240px]`), no inline `style` for color or spacing, and no `z-index` on dialogs, sheets or popovers.
- Change the look through the theme CSS variables in `:root` and `.dark` (`--radius`, `--primary` and the rest) or with a style switch (a new `style` in `components.json`, which means reinstalling the components; ask the user first). Never edit installed files to restyle them.

## Components with no per-style values

`event-calendar`, `gantt`, `icon-stack`, `kanban`, `rating`, `scrollspy`, `sortable` and `timeline` install the same file in every style. Their look comes from your theme tokens and the parts you put inside them (a `Card` in a kanban column follows the style), so never copy another style's radius onto them.
