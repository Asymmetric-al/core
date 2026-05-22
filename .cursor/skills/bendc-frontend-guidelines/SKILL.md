---
name: bendc-frontend-guidelines
description: "HTML, CSS, and JavaScript craft guidelines from bendc/frontend-guidelines — semantics, a11y basics, selector discipline, motion-friendly CSS, and readable JS. Use for markup review, static HTML/CSS, email HTML, or general front-end hygiene; pair with repo frontend rules and TypeScript lint policy."
metadata:
  owner: core
  last_updated: 2026-05-15
  status: active
  version: "1.0.0"
---

# bendc Frontend Guidelines

## Triggers

Use this skill when the task benefits from **foundational HTML, CSS, and vanilla JS** craft guidance from the vendored [`bendc/frontend-guidelines`](https://github.com/bendc/frontend-guidelines) checklist, including:

- Semantic HTML, document structure, `lang`, charset, and meaningful elements (`main`, `article`, `time`, etc.)
- Accessibility basics called out upstream: `alt` text, real links and buttons, not relying on color alone, labelling controls
- CSS structure: selector weight, avoiding unnecessary `!important`, inheritance, shorthand, flow and layout (flex/grid over absolute positioning when appropriate)
- CSS performance habits: prefer `opacity` / `transform` for animation; avoid animating layout-heavy properties (aligns with repo motion rules)
- Vanilla or legacy JS style: readability, native APIs, avoiding foot-guns called out in the upstream doc

**Also load** `docs/ai/rules/frontend.md` for any **`apps/*` or `packages/ui`** work in this monorepo.

## Do not use when

- The task is strictly backend, migrations, or database-only work.
- You only need **React / Next.js / App Router** patterns — prefer `docs/ai/skills/nextjs-app-router/SKILL.md` and framework docs.
- You only need **Tailwind, design tokens, or shared `@asym/ui` primitives** — the upstream doc is not Tailwind-specific; follow `docs/ai/rules/frontend.md` first.

## Precedence (this repo wins)

The full text of the upstream guide lives in **`references/readme-original.md`**. When that reference conflicts with the **Precedence** table below, **follow the table**.

| Topic                                                                               | Authoritative in this repo                                                                                                                  |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Tailwind, Maia/Zinc tokens, `cn()`, no arbitrary hex in components                  | `docs/ai/rules/frontend.md`                                                                                                                 |
| Motion timing, tokens, reduced motion, `transition-all` ban, route view transitions | `docs/ai/rules/frontend.md`, `docs/ai/skills/emil-design-engineering/SKILL.md`, `docs/ai/skills/anim/SKILL.md`                              |
| General JavaScript / TypeScript code shape, control flow, helper extraction         | Root `AGENTS.md` code style — prefer explicit, straightforward code over upstream terseness, loop avoidance, recursion, or shorthand        |
| TypeScript types, `strict`, equality (`===`), linted patterns                       | ESLint / TS config and existing code style — **do not** adopt upstream examples that rely on loose equality or patterns that fail lint here |
| React component structure, Server Components, hooks                                 | Next.js docs and `docs/ai/skills/react-component-dev/SKILL.md`                                                                              |

Use the bendc guide as **a second opinion** on semantics, DOM clarity, CSS discipline, and readable JS. Do not copy upstream JavaScript advice about terseness, avoiding loops, recursion, composition, or shorthand unless it improves clarity under this repo's `AGENTS.md` conventions.

## Workflow

1. Confirm the surface is in scope (markup, styles, or JS where the upstream checklist applies).
2. Load **`references/readme-original.md`** (or skim the sections you need: HTML, CSS, JavaScript).
3. Cross-check **Precedence** above before recommending a change that touches tokens, Tailwind, motion, JS/TS code shape, or TS types.
4. For shared UI or app routes, reconcile recommendations with **`docs/ai/rules/frontend.md`** and nearby components.
5. Prefer small, evidence-based edits; do not rewrite large areas solely to match upstream brevity examples if repo style differs.

## Checklist

- [ ] Confirmed triggers match (HTML/CSS/JS craft vs pure React/Next/backend).
- [ ] Read the relevant sections of `references/readme-original.md` or the live upstream README.
- [ ] Applied **Precedence**: repo frontend rules, motion skills, `AGENTS.md` code style, and TypeScript lint are satisfied.
- [ ] Did not strip accessibility or semantics for brevity.
- [ ] If you edited files under `docs/ai/skills/bendc-frontend-guidelines/`, ran `bun run skills:sync` and `bun run skills:verify` before committing.

## See also

- **Repo UI policy:** `docs/ai/rules/frontend.md`
- **Motion craft:** `docs/ai/skills/emil-design-engineering/SKILL.md`, `docs/ai/skills/anim/SKILL.md`
- **React component patterns:** `docs/ai/skills/react-component-dev/SKILL.md`
- **Maintainer refresh notes:** `references/upstream.md`
