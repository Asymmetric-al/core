# Refine OpenSpec Structure And Product Intent

## Why

A spec-refinement session found the intent specs left the target customer,
success definition, tradeoff ordering, Support Hub, outbound communications,
and AI direction implicit or duplicated, and the OpenSpec config layer used an
undocumented schema the tool ignores.

## What Changes

- Name the primary customer and operating model explicitly: missions sending
  organizations whose missionaries raise personal support.
- Re-anchor long-horizon success on ministry outcomes (missionaries fully
  supported; the org runs in one system), with donor retention and friction as
  contributing signals.
- Consolidate the tradeoff ordering into one canonical priority ladder in
  `platform-principles`; `platform-product-intent` defers to it.
- Name Support Hub as a Mission Control capability domain and govern outbound
  communications as a platform channel in `platform-surfaces`.
- State AI assistance as a core product differentiator with explicit human
  approval gates for donor-facing sends, money effects, and publication.
- Rewrite `openspec/config.yaml` to the documented v1.x schema
  (`schema`/`context`/`rules`) and document the two-layer spec model
  (intent specs + capability specs) in `openspec/project.md`.

## Impact

- Affected specs: `platform-product-intent`, `platform-principles`,
  `platform-surfaces`
- Affected files: `openspec/config.yaml`, `openspec/project.md`, `CONTEXT.md`
- No product code, tests, or database changes.
