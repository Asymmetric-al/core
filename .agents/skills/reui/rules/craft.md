# Craft: make ReUI UI exceptional, not generic

ReUI items ship senior-designer quality. Your adaptation has to hold that bar, so the result reads like a real product surface a team would keep - not a wireframe an AI generated. Use these alongside the reuse rules in [adapting.md](./adapting.md).

## Have a point of view

Pick an emotional register before you compose - calm, operational, premium, editorial, dense, energetic - and let layout, spacing, surface treatment, and icon behavior all reinforce it. One or two memorable decisions and restraint everywhere else beats ten generic ones. UI with no point of view reads as generated.

## Brutally clear hierarchy

One focal point per card or panel: the dominant metric or task first, its label second, supporting detail third. The first thing the eye lands on should be the right thing; secondary text must read as secondary. Borders, separators, and surfaces do real work to create 2-3 information bands - don't flatten everything to equal weight.

## Spacing rhythm and deliberate density

Gaps are a signal, not a default. Keep them intentional and consistent within a family (`gap-1`/`gap-2` for tight operational rows, larger gaps for section breaks), and smaller within a group than between groups. Match the surrounding ReUI density; don't pad an operational surface like a marketing page, and don't drift density mid-section. The composition should still feel authored in grayscale.

## Cover the real states (the usual miss)

A surface isn't done at the happy path. Compose, and wire:

- **Empty** - a purposeful empty state (short message + the primary action), never a blank panel.
- **Loading** - a **skeleton** that matches the real layout, not a centered spinner.
- **Error** - an inline, recoverable error with a retry, announced via `role="status"`/`aria-live`.

Derive these from an element the block already has (don't invent parallel markup), or `get_examples` for a state-specific example.

## Responsive by default

Mobile-first, not mobile-afterthought. In constrained rows/cards/sidebars, put `min-w-0` on the shrinking container and `truncate` long single-line labels; protect the primary label's width and let secondary content compress. Reflow layouts (multi-column -> single column) rather than just shrinking them. Desktop and mobile should both look designed.

## Motion, subtly

Motion should clarify, not decorate. Use ReUI Motion Icons on primary actions for a subtle hover cue; keep transitions short (~200-300ms) with calm easing; prefer a skeleton pulse over a spinner. No bouncing, no gratuitous entrance animations on every element.

## Real, activated content

Use believable, typed data (realistic labels, counts, timestamps, statuses that map to a real workflow) - never lorem or abstract filler. Every visible control does something: no decorative buttons, fake tabs, meaningless toggles, or stats with no job. It must still hold with long names, empty values, and crowded data.

## Avoid the AI tells

These instantly read as generated - don't ship them: equal-weight card walls, empty gradients, repetitive padding everywhere, generic enterprise copy, ornamental icons, and number tiles that don't earn their place.

## The bar

Before you finish, ask: **would a product team keep this instead of replacing it? Does it still feel strong after swapping in real content?** If not, reuse the shipped ReUI design harder - don't restyle it into something new - then run the [quality.md](./quality.md) gates.
