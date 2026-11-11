---
name: bro
description: Restate the last message in plain human language, with no jargon.
disable-model-invocation: true
---

Restate your last message. Stop using jargon and speak coherently. State it more simply and concisely, like one human talking to another.

<!-- CORE-OVERLAY-START -->

## This repository (Asymmetric-al/core)

Vendored from [p3-stack](https://github.com/uzairansaruzi/p3-stack) (MIT) at commit `09909eb`. Provenance is in `references/upstream.md`. On conflict, the current user request, root `AGENTS.md`, the nearest nested `AGENTS.md`, and the matching `docs/ai/rules/*` rulebook win over this skill.

- Explicit invocation only: use it when the user invokes `/bro` (Claude Code, Cursor, T3 Code) or `$bro` (Codex), or when an invoked p3-stack skill routes here. Do not route other work to it.
- Confirm before outward-facing or hard-to-reverse actions such as pushing, merging, deploying, deleting, or posting messages, unless the user authorized that action for this task.

Edit this canonical copy in `docs/ai/skills/bro/`, then run `bun run skills:sync` and `bun run skills:verify`.

<!-- CORE-OVERLAY-END -->
