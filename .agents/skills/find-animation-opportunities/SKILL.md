---
name: find-animation-opportunities
description: Inspect a Core UI or code surface for a small number of justified motion opportunities and explicitly identify what should remain static. Use when asked what should animate, where motion would improve feedback or comprehension, how to make an interface feel more alive without over-animating it, or whether a proposed animation is worth adding. Read-only; do not use to review or fix existing motion code or to implement animations.
---

# Find animation opportunities

Find high-value motion by exercising restraint. A result with no surviving
opportunities is valid; daily-use product UI usually benefits from less motion.

## Triggers

- Use when asked what should animate, where motion would improve an otherwise
  static interface, or which proposed motion ideas are worth pursuing.
- Do not use to fix current animations, review a motion diff, or implement the
  recommendations; route those follow-ups to the existing motion skills.

## Authority and boundaries

1. Read `docs/ai/rules/frontend.md`, then
   `docs/ai/skills/emil-design-engineering/SKILL.md` and
   `docs/ai/skills/anim/SKILL.md` before judging a surface.
2. Core's tokens, Base UI primitives, shared utilities, route-transition
   boundary, touch gates, and reduced-motion baseline override generic examples.
3. Use `improve-animations` to audit or plan fixes for existing motion and
   `review-animations` only for an explicitly requested motion-diff review. Use
   `motion` later if an approved implementation needs `motion/react` details.
4. This skill reports evidence and recipes only. Do not edit source, write plan
   files, install tooling, or change dependencies while it is active.

## Candidate gate

Every recommendation must pass all five checks:

1. **Frequency and input:** Reject decorative motion on keyboard-initiated,
   high-frequency, or information-dense interactions. Frequent feedback may use
   an existing near-imperceptible Core utility; it is not a new opportunity.
2. **Purpose:** Name one purpose: feedback, spatial continuity, state clarity,
   preventing a jarring change, explanation, or rare delight. “Looks cool” fails.
3. **User value:** Motion must make cause/effect, hierarchy, progress, or state
   easier to understand. It must not delay access to content or action.
4. **Existing ownership:** Reject motion already supplied by `Button`, Base UI
   overlays, shared hover/press utilities, or `RouteMainViewTransitionBoundary`.
   Never stack a second entrance or hover grammar on top.
5. **Core feasibility:** The recipe must use existing motion tokens/presets,
   avoid layout-driving properties, remain interruptible where state can reverse,
   preserve reduced-motion behavior, and gate hover motion to fine pointers.

## Workflow

1. **Recon.** Define the route/component scope, product personality, input
   methods, frequency, current motion owners, and performance/accessibility
   constraints. Inspect a running UI when available; otherwise state the limits
   of code-only evidence.
2. **Sweep seams.** Look for abrupt occasional state changes, unclear spatial
   relationships, missing progress/feedback, rare empty/success/onboarding
   moments, and gesture transitions. Also inspect the places most likely to be
   over-animated so the report contains meaningful rejections.
3. **Gate candidates.** Re-read every cited location and apply all five checks.
   Reject duplicates, speculative ideas, and anything already intentional.
4. **Specify survivors.** Report at most five opportunities, ordered by leverage.
   Name the existing Core token, preset, utility, or primitive to reuse. Do not
   invent literal durations, easings, scales, or a parallel motion system.
5. **Report restraint.** Include two to five rejected candidates and the exact
   gate that rejected each. If nothing survives, say that the interface should
   remain as-is.

## High-value seams

- Occasional content or status that appears, disappears, or swaps abruptly.
- A panel or object whose origin/destination is unclear and is not already owned
  by a Base UI primitive or the shared route-transition layer.
- Progress or completion feedback where motion would clarify causality.
- Rare first-run, empty, success, or celebration moments that earn delight.
- Gesture-driven surfaces that need continuity, interruptibility, or momentum.

Usually reject command palettes, keyboard shortcuts, dense tables, live charts,
routine list navigation, page-load choreography, blanket scroll reveals, and
decorative movement on data users are reading. Shared buttons already have press
feedback; shared overlays and routes already have their own motion grammar.

## Required report

### Opportunities

| #   | Location | Current seam | Purpose | Frequency | Core-compatible recipe |
| --- | -------- | ------------ | ------- | --------- | ---------------------- |

Each row needs exact `file:line` evidence and an existing Core mechanism. Mark
anything requiring a live feel-check rather than pretending code proves taste.

### Rejected candidates

| Location | Candidate considered | Rejection gate | Why static is better |
| -------- | -------------------- | -------------- | -------------------- |

### Verdict

State how much motion the surface actually needs, the highest-leverage survivor
if one exists, and whether a follow-up `improve-animations plan <description>`
would be warranted.

## Checklist

- [ ] The inspected scope, frequency, inputs, and current motion owners are clear.
- [ ] Every survivor passes purpose, value, ownership, and feasibility gates.
- [ ] Recommendations reuse Core tokens/primitives without duplicate motion.
- [ ] Performance, touch, keyboard, reduced motion, and interruptibility are covered.
- [ ] The report has at most five opportunities plus explicit rejected candidates.
- [ ] Findings cite exact files/lines and distinguish code evidence from feel checks.
- [ ] No source, plan, dependency, or runtime file changed during the inspection.

## Provenance

See [references/upstream.md](references/upstream.md) for the reviewed upstream
source, MIT license, Core adaptations, and refresh workflow.
