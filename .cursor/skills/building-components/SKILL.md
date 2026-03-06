---
name: building-components
description: Build modern, accessible, composable UI components with strong typing, explicit state patterns, and distribution-ready APIs.
metadata:
  owner: "skills-steward"
  last_updated: 2026-03-06
  status: "active"
  upstream:
    url: "https://skills.sh/vercel/components.build/building-components"
    repo: "vercel/components.build"
    path: "skills/building-components/SKILL.md"
    license: "MIT"
license: MIT
---

# Building Components

Use this skill for component architecture and implementation decisions in React/Next.js UI work.

## When to Apply

Use this skill when:

- Creating new reusable UI components (primitives, composed components, blocks)
- Designing component APIs (slots, composition, polymorphism, as-child patterns)
- Implementing component accessibility defaults
- Establishing design-token/styling contracts
- Preparing components for npm/registry distribution

Do not use this skill when:

- The task is only page-level styling with existing components
- The task is primarily data fetching/caching behavior (use cache-focused skills)

## Core Rules

1. Prefer composition over monolithic boolean-prop component APIs.
2. Use semantic HTML first; add ARIA only where needed.
3. Keep components accessible by default (keyboard, focus, naming).
4. Expose clear, typed interfaces and extend native element props where appropriate.
5. Keep component state contracts explicit (controlled/uncontrolled patterns).
6. Preserve customization hooks (tokens, className, data attributes, variants).

## Workflow

1. Define artifact level (primitive, component, block, template).
2. Split responsibilities into focused subcomponents where needed.
3. Define typed prop/state contracts.
4. Implement semantic + keyboard + ARIA behavior.
5. Add styling/token strategy and data-attribute hooks.
6. Document usage and extension paths before shipping.

## Checklist

- [ ] API favors composition and explicit variants
- [ ] Component uses semantic HTML and keyboard-safe interactions
- [ ] Required ARIA roles/attributes are present and correct
- [ ] Props/types are exported and extensible
- [ ] Controlled/uncontrolled behavior is intentional
- [ ] Styling/theming hooks are documented (tokens/classes/variants)

## References

- `references/upstream.md` for source mapping and attribution
