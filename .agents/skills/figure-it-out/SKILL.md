---
name: figure-it-out
description: "Design an auditable playbook when no narrower one fits: a large migration, an ambitious multi-part change, or work a human reviews after stepping away. Scales rigor to the task, runs a hypothesis loop, and logs decisions via show-me-your-work. Use for /figure-it-out, 'figure it out', a large migration, or when no narrower playbook applies."
disable-model-invocation: true
---

# Figure it out

When the task matches no playbook, design one. The deliverable before any code is the workflow itself: a sequence of phases that scales rigor to the task, runs the scientific method, and leaves a decision trail a human can audit after stepping away.

## Start

Open a todolist whose first item is to read the Principles section of the **p3-mode** skill. Then add the phases below as todos.

## Phase A: Frame

Ground first, then commit. Don't start the run until you can state:

- The definition of done as a falsifiable predicate (the **prove-it-works** principle skill).
- Scope, quantified: rough units and effort, plus the blockers grounding surfaced.
- The rigor level, biased high. One-way doors and high blast radius get more. Reversible low-stakes steps get less. Rigor is gates and artifacts, not "try harder".

Present the framing and tradeoffs before committing to a long run. Reversible work proceeds (the **never-block-on-the-human** principle skill), but a multi-hour run earns one checkpoint.

## Phase B: Design the workflow

Decompose into atomic, independently-landable units. Sequence riskiest-unknown-first. Scaffold and verification come before features (the **foundational-thinking** principle skill).

- Build the verification harness before the work, with the baseline captured from the pre-change state, so the check reads as "old value vs new value".
- For one-way-door design decisions, run the **architect** skill (it runs **arena**). Skip it for mechanical work whose shape is already concrete. A second arena over a settled design is over-engineering (the **laziness-protocol** principle skill).
- Decide what fans out. Parallelize only across seams, and give each writer its own worktree via `t3_thread_launch` with a `workspaceStrategy`, one writer per worktree (the **separate-before-serializing-shared-state** principle skill). Don't over-fan.
- Every `delegate_task` brief stands alone: the child gets only the brief, never your context. Read-only workers get a brief that says read-only, inspect only, no writes. Resolve models from named roles in `p3-models.md` via `orchestrator_capabilities`; never hardcode a slug.
- Write the designed phase list down. That list is what the human reviews.

Then execute the design. Add its steps to the todolist as concrete items, after the Phase C entry and before Phase D. Run each under the Phase C loop discipline, and weave the Phase D log through them, a row as each step lands, rather than saving the whole trail for the end.

## Phase C: Run the loop

Each unit is an experiment. State the hypothesis, make the smallest change, measure against the predicate on the real artifact, keep it if it advanced, revert it if it didn't.
Apply the **sequence-verifiable-units** principle skill, verifying each unit before starting the next instead of batching checks at the end.

- Verify by inspecting the artifact, never a self-report. When something passes too easily, suspect the observation method before the system.
- Pair delegated work with a judge. If a worker games the gate, reset and harden the contract. If the gate itself is wrong, fix the gate in its own change rather than routing around it.
- Drain background work with `task_status`. For a PR in flight, arm `watch_pull_request`, end the turn, and triage on wake; use `schedule_task` for recurring checks.
- A verdict is VERIFIED, NOT VERIFIED, or INCONCLUSIVE. Inconclusive is not a pass. Don't hide a negative.

## Phase D: Keep the audit trail

Log the run via the **show-me-your-work** skill. figure-it-out's work is usually ambitious enough to commit the trail so the reviewer can read it in the PR. The trail plus the diff is what lets the human come back and trust the work.

## Phase E: Verify and hand back

Check the whole against the Phase A predicate on the real product, not just the harness. Encode any recurring correction as a gate, a lint rule, a check, or a script (the **encode-lessons-in-structure** principle skill).

**Reply:** the playbook you designed, the rigor level and why, the decision-trail path, what's verified against the predicate, and what's still open.

<!-- CORE-OVERLAY-START -->

## This repository (Asymmetric-al/core)

Vendored from [p3-stack](https://github.com/uzairansaruzi/p3-stack) (MIT) at commit `09909eb`. Provenance is in `references/upstream.md`. On conflict, the current user request, root `AGENTS.md`, the nearest nested `AGENTS.md`, and the matching `docs/ai/rules/*` rulebook win over this skill.

- Explicit invocation only: use it when the user invokes `/figure-it-out` (Claude Code, Cursor, T3 Code) or `$figure-it-out` (Codex), or when an invoked p3-stack skill routes here. Do not route other work to it.
- The T3 Code tools named above map to Claude Code, Codex, and Cursor in `docs/ai/skills/p3-mode/references/core-adapter.md`. Read it before you delegate, watch a PR, schedule work, or drive a preview outside T3 Code.
- Confirm before outward-facing or hard-to-reverse actions such as pushing, merging, deploying, deleting, or posting messages, unless the user authorized that action for this task.
- Schedule recurring checks only when the user asked for them.

Edit this canonical copy in `docs/ai/skills/figure-it-out/`, then run `bun run skills:sync` and `bun run skills:verify`.

<!-- CORE-OVERLAY-END -->
