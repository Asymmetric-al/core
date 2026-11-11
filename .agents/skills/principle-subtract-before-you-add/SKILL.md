---
name: principle-subtract-before-you-add
description: "Apply when sequencing an addition, refactor, or rewrite. Remove dead code, redundant validators, and stub references first, then build on the simpler base."
disable-model-invocation: true
---

# Subtract Before You Add

When evolving a system, remove complexity first, then build.

**Why:** Adding to a complex system compounds complexity. Removing first leaves less code, reveals the essential structure, and usually makes the next design obvious. Default to subtraction.

Make simplification a continual investment. Leave the design slightly simpler and more capable behind the same or smaller surface than you found it.

**The pattern:**

- Sequence removal before construction
- Cut before you polish (get to the minimum before investing in quality)
- Design for observed usage, not speculative edge cases
- No speculative validators, parsers, or guards beyond what the spec demands
- Simplify prompts (remove redundant instructions, excessive templates)
- When a reference has no novel content, delete it rather than leaving a stub

<!-- CORE-OVERLAY-START -->

## This repository (Asymmetric-al/core)

Vendored from [p3-stack](https://github.com/uzairansaruzi/p3-stack) (MIT) at commit `09909eb`. Provenance is in `references/upstream.md`. On conflict, the current user request, root `AGENTS.md`, the nearest nested `AGENTS.md`, and the matching `docs/ai/rules/*` rulebook win over this skill.

- Explicit invocation only: use it when the user invokes `/principle-subtract-before-you-add` (Claude Code, Cursor, T3 Code) or `$principle-subtract-before-you-add` (Codex), or when an invoked p3-stack skill routes here. Do not route other work to it.
- Confirm before outward-facing or hard-to-reverse actions such as pushing, merging, deploying, deleting, or posting messages, unless the user authorized that action for this task.

Edit this canonical copy in `docs/ai/skills/principle-subtract-before-you-add/`, then run `bun run skills:sync` and `bun run skills:verify`.

<!-- CORE-OVERLAY-END -->
