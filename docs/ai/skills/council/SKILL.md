---
name: council
description: Trigger this if the user says 'council'.
---

# Council

Before an audit, address outstanding PR comments, fix known issues, and run
relevant checks. Give council the updated implementation; do not defer known
fixes until reviews return. If the user wants to discard the implementation
and explore new ideas, skip fixes to code being replaced.

Bring in three delegates to help with the user's request, usually for review
or feedback. Use one strong model from each of three different providers, at
high reasoning effort. If the user's instructions name council members, use
those. Otherwise pick the latest flagship model from each provider, for
example Claude Opus, GPT Sol, and Gemini Pro.

In T3 Code, use `orchestrator_capabilities` to resolve the models, then
`delegate_task` to start one delegate per model in parallel. Elsewhere, use
the harness's subagent tools. If you cannot reach three providers, or a named
member is unavailable, report it instead of substituting.

Give each delegate the request and relevant context. For review or feedback,
keep their work read-only. Collect their responses and summarize the useful
findings, disagreements, and recommended next steps.

For a code review, ask each delegate for a score out of 10.
Count each full review pass as one round.
A fresh review after fixes starts a new round.

If the work ends in a pull request, put the results in the PR description.
Put this section before the model and harness line at the end:

```markdown
## Council review

Rounds: 2

| Delegate    | Round 1 | Round 2 |
| ----------- | ------- | ------- |
| Claude Opus | 7/10    | 9/10    |
| GPT Sol     | 8/10    | 10/10   |
| Gemini Pro  | 7/10    | 9/10    |
```

If a delegate gives no score, write `no score`. Do not invent one.
If the PR is open, edit the description. Do not post a comment for this.
If there is no PR, put the same results in the final reply only.

If you agree with their recommendations, make the changes and request a fresh
review after. Continue this process until all delegates are satisfied with the
outcome.

Do not let repeated reviews result in scope creep. It is your job to fight to
keep scope limited.

<!-- CORE-OVERLAY-START -->

## This repository (Asymmetric-al/core)

Core adaptation of the upstream council procedure above. The upstream text
stays the operative workflow; this overlay only binds it to Core's instruction
system. On conflict, the current user request, root `AGENTS.md`, the nearest
nested `AGENTS.md`, and the matching `docs/ai/rules/*` rulebook win.
Provenance and refresh steps live in `references/upstream.md`.

### Triggers

- The user says "council", or explicitly invokes `/council` (Claude Code) or
  `$council` (Codex).
- Not for single-reviewer work; use `code-review`, `review-and-ship`, or an
  ordinary subagent instead.

### Workflow

1. Resolve council members from the current request first. An explicit member
   list, provider list, or count (for example "use only Claude and Codex")
   overrides the upstream three-provider default for that run. Otherwise keep
   the upstream default. Report an unavailable member or provider; never
   substitute one silently.
2. In T3 Code, call `orchestrator_capabilities` once per thread, then start one
   `delegate_task` per member in parallel, putting model and reasoning settings
   in `target.options`. Each new review round is a new `delegate_task`, not a
   `t3_thread_send`. Follow each running delegate's `next` instead of polling,
   and stop replaced runs with `task_cancel`.
3. Brief each delegate with the request, the diff or files in scope, and the
   applicable Core rules: root `AGENTS.md` "Code review rules", the nearest
   nested `AGENTS.md`, and the matching `docs/ai/rules/*` rulebook. Keep review
   delegates read-only. Never put secrets, `.env` values, tokens, or
   credentials in a brief.
4. Weight findings by Core's review priorities: data loss, tenant/auth bypass,
   money/payment/webhook errors, migration hazards, crashes, and real
   regressions, each with concrete `file:line` evidence. On later rounds,
   accept only new blocking or important findings; do not run fix-then-nit
   loops.
5. Apply agreed fixes under Core rules (TDD for behavior changes, smallest
   relevant checks first, protected-path procedures). Pushing, merging, and
   editing a PR description are outward-facing actions: do them only when the
   current request authorizes them; otherwise report the council table in the
   final reply.

### Checklist

- [ ] Members came from the request or the upstream default, and every
      unavailable member was reported rather than substituted
- [ ] Review delegates stayed read-only and received no secrets
- [ ] Each result is attributed to the model that actually responded; a
      missing score reads `no score`
- [ ] Scope stayed limited to the original request
- [ ] Skill edits change `docs/ai/skills/council/` (never a generated mirror)
      and update `references/upstream.md` before running `bun run skills:sync`
      and the non-mutating `bun run skills:verify`

<!-- CORE-OVERLAY-END -->
