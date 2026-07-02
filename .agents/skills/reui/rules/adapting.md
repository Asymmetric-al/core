# Adapting installed ReUI code (reuse-first, no AI slop)

ReUI items ship production-quality. Your job is to **adapt by reuse** - wire real data and fit the app - not to redesign or hand-roll. The output should look like ReUI built it for this product.

## Preserve the design - don't over-customize

The design IS the product. A ReUI block/component encodes senior-designer decisions: spacing, hierarchy, density, color treatment, and component choices. The fastest way to turn a premium block back into generic AI slop is to "improve" its look - so don't.

- Change **data, copy, and props**; keep the **structure and styling** it ships with. Make the **smallest** change that wires the real data. If your diff touches `className` / JSX structure more than data / props, you are over-customizing - stop and reuse.
- Don't swap ReUI components for hand-rolled ones, restructure the layout, re-skin spacing / radius / colors, or add decorative chrome. Let the installed components carry the default spacing, radius, sizing, icon rhythm, density, and state styling; add custom Tailwind only when a component genuinely lacks a contract you need.
- Want a different look? `search` for a block whose design already fits and reuse that - don't restyle this one into a new design.

## Reuse the parts: examples and the block's own elements

- **Examples are building parts.** A free `c-*` example is a correct, single-pattern composition you can reuse. Before composing from scratch, `get_examples(component)`, install the closest one, and reuse its wiring - assemble UI from examples instead of hand-rolling what an example already shows.
- **Reuse a block's own elements.** Need more rows, cards, items, or sections than ship by default? Repeat the block's **existing** element by mapping real data through the same markup - never invent parallel markup that drifts from its design. Need a variant (empty / loading / expanded)? Derive it from an element the block already has.

## Don't invent (read, don't guess)

- Never write a prop, variant value, import path, or `@reui/...` name you didn't read in a component's inline `api`, an installed example, or a `search` result. If you didn't see it, treat it as nonexistent - call `get_component` / `get_examples` / `search` first, or run the MCP `validate_usage` tool to check planned names + props against the docs before writing code.
- If a getter returns `found: false` or `search` returns nothing, say so and fall back (plain shadcn, or ask) - never fabricate an install command or an API.

## What to change vs leave alone

- **Change:** the item's own data, copy, props, and layout to fit the app.
- **Leave alone:** installed component files, hooks, and the shared theme - do not edit vendored ReUI internals; change behavior through props and the documented API.
- Blocks are **portable React** - no `next/link`, `next/image`, or other framework-runtime imports inside them. Keep them portable.

## Demo data -> real data

- Replace every placeholder with the user's real data. Model it as **typed data structures** and **map over arrays** - never duplicate JSX per row/card. Keep small block-specific formatters next to the data.
- Wire the real source (columns, fields, fetch). For `data-grid`, implement the server fetch contract if the user needs server-side data.
- **Type from the component API, derive during render.** Type domain state through the component's own types - e.g. map status to `BadgeProps["variant"]` via a typed `Record<Status, …>` - instead of stringly-typed values. Compute view state during render; don't mirror derived data into `useState`/`useEffect`.
- **Adapt on the right base.** Use the API for the project's base (Base UI vs Radix - see [components.md](./components.md)); the installed files are already base-correct, so reuse their shape rather than translating from memory.

## Believable content (no AI tells)

- Use realistic labels, counts, timestamps, and statuses that map to a real workflow.
- No decorative buttons, fake tabs, meaningless toggles, equal-weight card walls, empty gradients, ornamental icons, or generic SaaS filler. Every element should do something.

## Operational surfaces (settings / profile / admin)

Pick ONE archetype and keep the family consistent: a vertical rail (3-6 sections), horizontal tabs (5-8), or a frame/stack. Prefer `frame` for tool-like surfaces, a card for profile-like ones. Don't mix archetypes in one surface.
