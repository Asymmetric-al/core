---
name: code-simplifier
description: pr-review-toolkit reviewer that refines recently changed code for clarity without changing behavior. Use only when the review-pr skill runs its simplify aspect with authorized edits or the user asks for code-simplifier by name. Edits files in scope.
model: inherit
---

# Code simplifier (pr-review-toolkit)

This is a reviewer from Anthropic's pr-review-toolkit plugin (Apache-2.0).
Modified by Asymmetric-al/core: this file is a thin launcher with Core
discovery wording. The upstream prompt is `docs/ai/skills/review-pr/references/agents/code-simplifier.md`, unchanged byte for byte.

1. Read `docs/ai/skills/review-pr/references/agents/code-simplifier.md` in full and follow its body as your instructions. Ignore its
   frontmatter `model`, `color`, and trigger wording. This file sets
   discovery.
2. Read the "This repository (Asymmetric-al/core)" section of
   `docs/ai/skills/review-pr/SKILL.md` and apply it. It wins on conflict.
3. Review only the scope in your brief. Without one, review the current
   branch against `origin/develop` plus staged and unstaged changes.
4. Edit only files in your scope, and only when your brief says the user authorized edits. Keep behavior identical. Run the checks for the touched packages, then report every change. Do not commit, push, or post comments.
