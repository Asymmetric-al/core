---
name: accessibility-review
description: Audit and fix accessibility in Core UI. Use when changing or reviewing buttons, links, forms, validation, dialogs, menus, tabs, tables, keyboard interactions, focus management, accessible names, announcements, contrast, touch targets, reduced motion, or WCAG/a11y behavior.
---

# Accessibility review

Apply a focused accessibility pass without replacing Core's component system or
mistaking automated checks for conformance.

## Authority and boundaries

1. Read `docs/ai/rules/frontend.md` and `docs/ai/rules/testing.md` first.
2. Reuse `@asym/ui` Base UI primitives for dialogs, menus, tabs, tooltips,
   comboboxes, and other behavior-heavy widgets. Do not build ARIA replicas of
   behavior that a shared primitive already implements.
3. Prefer native HTML semantics before adding roles or ARIA. ARIA supplements
   semantics; it does not repair incorrect interaction behavior.
4. Use `docs/ai/skills/components-build/SKILL.md` for component API work and
   `docs/ai/skills/emil-design-engineering/touch-accessibility.md` for Core's
   touch and keyboard conventions.
5. Keep fixes scoped. Do not migrate UI libraries or refactor unrelated layout.

## Workflow

1. **Map the states.** Identify the interactive controls, reading order,
   keyboard path, loading/empty/error states, responsive variants, and any
   content revealed only by hover or pointer input.
2. **Check semantics and names.** Verify landmarks, headings, lists, table
   headers, labels, accessible names, descriptions, values, and state attributes.
3. **Exercise interaction.** Use Tab and Shift+Tab, Enter/Space, arrow keys where
   the widget pattern requires them, and Escape for dismissible overlays. Check
   visible focus, initial focus, focus containment, and focus restoration.
4. **Check feedback.** Associate helper and error text with fields, announce
   material async status changes, and ensure color, toast, or hover is never the
   only carrier of essential information.
5. **Check perception.** Inspect contrast, zoom/reflow, touch targets, alt text,
   captions where applicable, and reduced-motion behavior. Preserve Core's
   global reduced-motion baseline instead of redeclaring it in an app.
6. **Verify proportionately.** Run the focused automated suite, then perform the
   manual checks automation cannot prove. If asked only to review, report exact
   `file:line` evidence and concrete fixes without editing source.

## Core patterns

- Give every interactive control an accessible name. Label icon-only buttons;
  keep decorative icons out of the accessibility tree.
- Use real `button`, `a`, `label`, `fieldset`, `legend`, `th`, `ul`/`ol`, and
  heading elements when they express the behavior.
- Connect field help and errors with stable IDs and `aria-describedby`; set
  `aria-invalid` only when the field is invalid.
- Expose expanded, selected, checked, pressed, busy, and current state through
  the native element or the applicable ARIA state.
- Keep DOM order aligned with visual and keyboard order. Never use positive
  `tabIndex` to repair a broken sequence.
- Use Core's touch-target tokens and shared controls instead of shrinking the
  hit area to match the visible glyph.

## Verification

```bash
bun run test:a11y
```

For new or materially changed routes, update
`tests/e2e/accessibility.spec.ts`. Use `@axe-core/playwright` for repeatable
violations and Playwright role locators for behavior. An axe pass does not prove
keyboard order, focus quality, usable labels, alt-text intent, or complete WCAG
conformance, so keep the manual interaction pass.

## Checklist

- [ ] Native semantics or an established Base UI primitive owns behavior.
- [ ] Names, descriptions, relationships, values, and states are exposed.
- [ ] Keyboard operation, focus visibility, containment, and restoration work.
- [ ] Forms expose instructions and errors without relying on color or toast.
- [ ] Contrast, zoom/reflow, touch, media, and reduced motion were considered.
- [ ] Relevant automated and manual checks ran; remaining limits are stated.
- [ ] Findings cite exact files/lines, or fixes remain minimal and targeted.

## Provenance

See [references/upstream.md](references/upstream.md) for the reviewed upstream
source, license, Core adaptations, and refresh workflow.
