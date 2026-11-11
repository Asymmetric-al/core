---
name: how
description: 'Use for "how does X work", code walkthroughs before changing something, and placement / ownership / layering questions ("where should this live", "which package owns this", "is this the right layer"). Explains subsystem architecture, runtime flow, onboarding mental models. Use why for motivation.'
disable-model-invocation: true
---

# How

Explore the codebase to answer "how does X work?" questions. Produce architectural explanations at the level of a senior engineer onboarding onto a subsystem, enough to build a working mental model, not so much that it reads like annotated source code.

Every spawn below is a `delegate_task` with a self-contained brief; the child gets only the brief, never this conversation. Each brief says it is read-only: inspect only, no writes, no git commands. Resolve each role's model from `p3-models.md` via `orchestrator_capabilities`. Never hardcode a slug. If the role line is missing, run `setup-p3` or use the parent's model.

## Step 1. Assess Complexity

If the scope is ambiguous, state your interpretation and explore. The user can redirect.

- **Simple** (a single module, a small utility, a narrow question such as "how does function X work"): no explorers. One explainer explores and explains in a single pass. Go to Step 2b.
- **Complex** (a subsystem spanning multiple files or services, a cross-cutting feature, a full architectural overview): spawn parallel explorers first, then hand off to the explainer. Go to Step 2a.

When in doubt, take the simple path.

## Step 2a. Explore (complex questions only)

Decompose the question into 2 to 4 exploration angles, each a distinct slice of the subsystem. Spawn all explorers in a single message, `mode: "async"`, model from the `how explorer` role.

Each explorer's brief is `references/explorer-prompt.md` with its angle filled in. Drain with `task_status`, then go to Step 3.

## Step 2b. Direct Explain (simple questions)

Spawn one `delegate_task` that explores and explains in one pass, model from the `how explainer` role.

Build its brief from `references/explainer-prompt.md` without the explorer-findings section. Go to Step 4.

## Step 3. Synthesize (complex questions only)

Once all explorers have returned, spawn one `delegate_task` to synthesize their findings into one explanation, model from the `how explainer` role.

Build its brief from `references/explainer-prompt.md` with every explorer's findings filled in.

## Step 4. Present

Present the explainer's output to the user. Light edits for clarity or context from the conversation are fine. Do not substantially rewrite it.

## Output Format

The explanation uses the sections defined in `references/explainer-prompt.md`, dropping any that do not apply: Overview, Key Concepts, How It Works, Where Things Live, Gotchas.

<!-- CORE-OVERLAY-START -->

## This repository (Asymmetric-al/core)

Vendored from [p3-stack](https://github.com/uzairansaruzi/p3-stack) (MIT) at commit `09909eb`. Provenance is in `references/upstream.md`. On conflict, the current user request, root `AGENTS.md`, the nearest nested `AGENTS.md`, and the matching `docs/ai/rules/*` rulebook win over this skill.

- Explicit invocation only: use it when the user invokes `/how` (Claude Code, Cursor, T3 Code) or `$how` (Codex), or when an invoked p3-stack skill routes here. Do not route other work to it.
- The T3 Code tools named above map to Claude Code, Codex, and Cursor in `docs/ai/skills/p3-mode/references/core-adapter.md`. Read it before you delegate, watch a PR, schedule work, or drive a preview outside T3 Code.
- Confirm before outward-facing or hard-to-reverse actions such as pushing, merging, deploying, deleting, or posting messages, unless the user authorized that action for this task.

Edit this canonical copy in `docs/ai/skills/how/`, then run `bun run skills:sync` and `bun run skills:verify`.

<!-- CORE-OVERLAY-END -->
