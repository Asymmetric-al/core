# Components Build Skill

<!-- CORE-COMPONENTS-CN-START -->

**Core shared class helper:** consume the existing helper through the shared UI
boundary:

```tsx
import { cn } from "@asym/ui/lib/utils";
```

Do not create a competing local `cn` implementation or add `clsx`/`tailwind-merge`
for these recipes. The generic npm dependency examples below are retained
upstream material and are **non-operative in Core**. Current workspace manifests
and `packages/ui/lib/utils.ts` own the implementation and dependency choices.
<!-- CORE-COMPONENTS-CN-END -->

An agent skill for building modern, composable, and accessible React UI components following the [components.build](https://components.build) specification. Co-authored by Hayden Bleasel and shadcn.

## Overview

This skill provides comprehensive guidelines across 16 categories covering everything from core principles to component distribution. It teaches agents how to build components that are:

- **Composable** - Break complex components into sub-components
- **Accessible** - Keyboard navigation, screen readers, ARIA
- **Customizable** - Extend HTML attributes, support theming
- **Type-safe** - TypeScript patterns for props and interfaces

## Structure

```
components-build/
├── SKILL.md              # Skill definition (loaded by agents)
├── AGENTS.md             # Compiled rules (generated)
├── metadata.json         # Upstream catalog file; absent locally (see source audit)
├── README.md             # This file
└── rules/                # Individual rule files
    ├── _sections.md      # Section metadata and ordering
    ├── _template.md      # Template for new rules
    ├── accessibility.md  # Individual rule files...
    ├── composition.md
    ├── styling.md
    └── ...
```

## Rule Categories

| #   | Category           | Impact   | Description                                                 |
| --- | ------------------ | -------- | ----------------------------------------------------------- |
| 1   | Overview           | MEDIUM   | Specification scope, goals, and philosophy                  |
| 2   | Principles         | HIGH     | Core design philosophy (composability, accessibility, etc.) |
| 3   | Definitions        | MEDIUM   | Common terminology (primitive, compound, headless)          |
| 4   | Composition        | HIGH     | Breaking down complex components                            |
| 5   | Accessibility      | CRITICAL | Keyboard, screen readers, ARIA, focus management            |
| 6   | State              | HIGH     | Controlled/uncontrolled patterns                            |
| 7   | Types              | HIGH     | TypeScript props and interfaces                             |
| 8   | Polymorphism       | MEDIUM   | Existing host APIs; passive `as` background                 |
| 9   | Render Composition | MEDIUM   | Base UI render + native semantics                           |
| 10  | Data Attributes    | LOW      | Base UI state attributes and stable slots                   |
| 11  | Styling            | HIGH     | Tailwind CSS, cn utility, CVA                               |
| 12  | Design Tokens      | MEDIUM   | CSS variables and theming                                   |
| 13  | Documentation      | MEDIUM   | JSDoc and usage examples                                    |
| 14  | Registry           | LOW      | Component registry structure                                |
| 15  | NPM                | LOW      | Publishing to npm                                           |
| 16  | Marketplaces       | LOW      | Distribution strategies                                     |

## Installation

Core maintains this canonical pack in `docs/ai/skills/components-build/`.
Generate installed mirrors with `bun run skills:sync` and check them with
`bun run skills:verify`; do not hand-copy over a generated mirror.

The client copy commands below are generic upstream installation background for
external consumers, not Core maintenance commands.

### Claude Code

```bash
cp -r skills/components-build ~/.claude/skills/
```

### Cursor

Copy to your Cursor skills directory:

```bash
cp -r skills/components-build ~/.cursor/skills/
```

### claude.ai

Add `SKILL.md` to your project knowledge, or paste its contents into a conversation.

## Creating a New Rule

1. Copy `rules/_template.md` to `rules/{category}.md`
2. Use the appropriate category prefix from `_sections.md`
3. Fill in the frontmatter:

```yaml
---
title: Rule Title Here
impact: MEDIUM
impactDescription: Optional description
tags: tag1, tag2
---
```

4. Include clear Incorrect/Correct code examples
5. Add explanatory text and references

### Rule File Structure

```markdown
---
title: Use Semantic HTML Elements
impact: HIGH
tags: accessibility, html
---

## Use Semantic HTML Elements

Brief explanation of why this matters.

**Incorrect (using generic div):**

\`\`\`tsx

<div onClick={handleClick}>Click me</div>
\`\`\`

**Correct (using button element):**

\`\`\`tsx
<button onClick={handleClick}>Click me</button>
\`\`\`

Additional best practices.

Reference: [MDN Semantic HTML](https://developer.mozilla.org/en-US/docs/Glossary/Semantics)
```

## Impact Levels

- **CRITICAL** - Must implement, major accessibility or UX impact
- **HIGH** - Significant benefits, strongly recommended
- **MEDIUM** - Moderate improvements, recommended
- **LOW** - Nice to have, incremental improvements

## Key Principles

1. **Composition over Configuration** - Break components into composable sub-components
2. **Accessibility by Default** - Not an afterthought, but a requirement
3. **Composable Parts** - Respect each part's existing DOM or non-DOM host and ownership contract
4. **Preserve Prop Contracts** - Derive existing part props; inherit native props/ref for new passive hosts
5. **Export Types** - Make prop types available to consumers
6. **Preserve State Patterns** - Use each primitive's existing controlled/uncontrolled API
7. **Intelligent Class Merging** - Import `cn` from `@asym/ui/lib/utils`.

## References

- [components.build](https://components.build) - Original specification
- [Base UI composition](https://base-ui.com/react/handbook/composition) - Core render composition and host contracts
- [shadcn/ui](https://ui.shadcn.com) - Reference implementation

## Authors

- **Hayden Bleasel** ([@haydenbleasel](https://x.com/haydenbleasel))
- **shadcn** ([@shadcn](https://x.com/shadcn))

Adapted as an AI skill by:

- **Jordan Gilliam** ([@nolansym](https://x.com/nolansym))

## License

MIT
