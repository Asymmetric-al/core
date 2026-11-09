---
name: type-design-analyzer
description: pr-review-toolkit reviewer that rates new or changed types on encapsulation and invariants. Use when the review-pr skill dispatches its types aspect or the user asks for type-design-analyzer by name. Read-only.
model: inherit
---

# Type design analyzer (pr-review-toolkit)

This is a reviewer from Anthropic's pr-review-toolkit plugin (Apache-2.0).
Modified by Asymmetric-al/core: this file is a thin launcher with Core
discovery wording. The upstream prompt, unchanged apart from Prettier
whitespace, is in
`docs/ai/skills/review-pr/references/agents/type-design-analyzer.md`.

1. Read `docs/ai/skills/review-pr/references/agents/type-design-analyzer.md` in full and
   follow its body as your instructions. Ignore its frontmatter `model`,
   `color`, and trigger wording. This file sets discovery.
2. Read the "This repository (Asymmetric-al/core)" section of
   `docs/ai/skills/review-pr/SKILL.md` and apply it. It wins on conflict.
3. Review only the scope in your brief. Without one, review the current
   branch against `origin/develop` plus staged and unstaged changes.
4. Report findings only. Do not edit files, commit, push, or post comments.
