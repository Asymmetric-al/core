---
name: council
description: Use for an explicit council review request or invocation of the council skill.
---

# Council

Resolve the council members before review. Use the member list, providers, or
count the user requests. By default, select one strong model from each of three
different providers at high reasoning effort, such as Claude Opus, GPT Sol,
and Gemini Pro.

In T3 Code, resolve models with `orchestrator_capabilities`. Elsewhere,
check the harness's available subagent tools. Report unavailable members and
keep their requested identities. If the user leaves the member list open and
does not require cross-provider coverage, a harness without all three default
providers may run one read-only round with available native agents. Label it
as native-only and report the missing provider coverage. If no delegate can
run, report the limitation and stop.

After determining the review mode, inspect outstanding PR comments and run
relevant read-only checks. Fix known issues before review only when the
request authorizes implementation and the run is outside the native-only
fallback. Otherwise include the known issues in the brief. Skip fixes to work
the user wants to discard.

Before dispatch, verify that the harness enforces a read-only boundary for
each delegate's filesystem access and mutation-capable tools. A read-only
brief, review role, approval-required mode, or writable worktree is not an
enforced boundary. If the boundary is unavailable, do not dispatch that
delegate; report its missing coverage. Do not invent a read-only runtime
mode or widen permissions to obtain coverage.

After preflight, start the selected eligible delegates in parallel. Give
them the request and relevant context. Every delegate stays read-only even
when the coordinator is authorized to implement fixes. Collect their
responses and summarize the findings, disagreements, and next steps.

Set a ten-minute deadline when dispatching each round. Cap it by any
remaining time budget in the request. Use bounded waits or completion
notifications with deadline support. At the deadline, stop waiting and
request cancellation for this round's outstanding tasks where supported.
Report missing coverage with the findings already received and distinguish
unconfirmed cancellation. A timeout by itself does not start another round.

For a code review, ask each delegate for a score out of 10.
Count each full review pass as one round.
A fresh review after fixes starts a new round.

If the current request authorizes editing the PR description, place the
results before its model and harness line. Use this format in the report.

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
If there is no PR or the request leaves the description outside scope, put
the results in the final reply.

A review-only request or native-only fallback ends with the first round's
findings. For other runs with implementation authorization, apply agreed,
in-scope fixes and request a fresh review while a round remains. Stop when
no warranted fix remains or three review rounds have completed. Report any
remaining findings, disagreements, or gaps in verification. Keep every
round within the original scope.

<!-- CORE-OVERLAY-START -->

## This repository (Asymmetric-al/core)

On conflict, follow the current user request, root `AGENTS.md`, the nearest
nested `AGENTS.md`, and the matching `docs/ai/rules/*` rulebook.
Provenance and refresh steps live in `references/upstream.md`.

### Triggers

- Use when the user explicitly asks for a council review or invokes
  `/council` (Claude Code), `$council` (Codex), or the standalone `council`
  command. A mention of a council in other content does not invoke the skill.
- Honor an explicit council request with one member. Route other
  single-reviewer requests to the usual review workflow.

### Workflow

1. Resolve council members from the current request first. An explicit member
   list, provider list, or count (for example "use only Claude and Codex")
   overrides the upstream three-provider default for that run. Otherwise use
   the upstream default, subject only to the labeled native-only fallback above.
   Report actual members and missing coverage in the
   results. Never replace an explicitly requested provider or model.
2. In T3 Code, call `orchestrator_capabilities` once per thread, and again
   only after an error or a user-named provider change. Verify the enforced
   read-only boundary above before starting one `delegate_task` per eligible member
   in parallel. Set `target.providerInstanceId` and `target.model` and use
   `target.options` for advertised reasoning settings. Use a distinct
   `clientRequestId` per member and round, reusing it on retries of that
   dispatch. Start a fresh task for each new round. Use `mode: "wait"` with
   `timeoutMs` within the remaining deadline when waiting for results, or
   follow `next` with a separate deadline mechanism. A wait timeout leaves
   the task running. Use `task_cancel` on outstanding task IDs from the
   current round when it expires.
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
5. Apply authorized fixes under Core rules (TDD for behavior changes,
   smallest relevant checks first, protected-path procedures) within the
   round limit above. Push, merge, or edit a PR description only when the
   current request authorizes that action.

### Checklist

- [ ] Members came from the request, the upstream default, or the permitted
      labeled native-only fallback; unavailable coverage was disclosed and
      explicitly requested providers were not substituted
- [ ] Review delegates had verified enforced read-only boundaries and received
      no secrets; unavailable boundaries were reported as missing coverage
- [ ] Each result is attributed to the model that actually responded; a
      missing score reads `no score`
- [ ] Source edits were authorized and the report states any unresolved
      disagreements or missing coverage
- [ ] Scope stayed limited to the original request and the review round cap
- [ ] Skill edits change `docs/ai/skills/council/` (never a generated mirror)
      and update `references/upstream.md` before running `bun run skills:sync`
      and the non-mutating `bun run skills:verify`

<!-- CORE-OVERLAY-END -->
