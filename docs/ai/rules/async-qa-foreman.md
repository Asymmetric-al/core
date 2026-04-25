# Async QA Foreman Workflow

**Name:** `async-qa-foreman`  
**Purpose:** Use a Cursor background subagent as a skeptical QA foreman while the main agent continues implementing, verifying, and fixing the task to completion.
**Applies when:** The user asks for Async QA Foreman mode, grind-style completion pressure, background QA, long-running verification, a second agent to challenge quality, or unusually careful implementation with repeated verification.
**Do not use when:** The task is a tiny local edit, a pure writing task, a one-line search, or anything where a background subagent would add cost without improving quality.

---

## Triggers

Use this workflow when the prompt includes phrases like:

- Async QA Foreman
- async agent
- background QA
- grind mode
- keep working until complete
- check your work
- high quality
- long-running verification
- skeptical senior engineer
- do not stop until verified
  Also use it for larger implementation tasks where the user clearly wants extra pressure against early stopping.

---

## Workflow

1. **Load repo instructions first.**
   - Read `AGENTS.md`.
   - Read nearest nested `AGENTS.md` if the task touches a nested instruction area.
   - Read matching `docs/ai/rules/*` rulebooks.
   - Read matching `docs/ai/skills/*/SKILL.md` files when a skill trigger applies.
   - For Next.js work, read the relevant installed or committed Next docs before coding.
   - Use Nia MCP repo-scoped to `Asymmetric-al/core` for architecture, data-flow, integration, refactor, and "where is this?" work when available.
2. **Define the work before coding.**
   - Write success criteria.
   - Write a verification plan.
   - Identify likely files and directories.
   - Identify known risks.
   - Pick the smallest useful first checks.
3. **Spawn the background QA foreman immediately.**
   - Invoke `/qa-foreman` as a background subagent.
   - Give it a context packet:
     - original user request
     - success criteria
     - verification plan
     - relevant files or directories
     - known risks
     - current implementation approach
     - commands already run and results
     - current diff summary when available
4. **Keep the main agent moving.**
   - Continue implementation while `/qa-foreman` runs.
   - Do not wait idly unless the next step depends on the report.
   - Run targeted checks after meaningful changes.
   - Fix failures directly related to the task.
5. **Use the QA report as a completion gate.**
   - Review every Critical, Major, and Minor finding.
   - Fix all Critical findings.
   - Fix all valid Major findings.
   - If rejecting a finding, record the reason and evidence.
   - Rerun checks after fixes.
   - Do not finish while valid Critical or Major findings remain.
6. **Finish only after verification.**
   - Confirm the requested behavior works.
   - Confirm relevant lint, typecheck, tests, and build checks pass.
   - Review the final diff for unrelated changes.
   - Report files changed, commands run, failures, skipped checks, and remaining risks.

---

## Checklist

### Before implementation

- [ ] Read `AGENTS.md`
- [ ] Read nested `AGENTS.md` if relevant
- [ ] Read matching rulebooks
- [ ] Read matching skills
- [ ] Read relevant Next.js docs for Next.js work
- [ ] Used Nia MCP repo-scoped to `Asymmetric-al/core` when required, or noted fallback
- [ ] Defined success criteria
- [ ] Defined verification plan
- [ ] Identified likely files and known risks
- [ ] Spawned `/qa-foreman` in the background with a full context packet

### During implementation

- [ ] Main agent kept working while `/qa-foreman` ran
- [ ] Ran the smallest useful checks after meaningful changes
- [ ] Avoided unrelated changes
- [ ] Kept source-of-truth ownership clear
- [ ] Did not weaken tests, lint, types, build, or repo rules

### Before completion

- [ ] Reviewed the QA Foreman Report
- [ ] Fixed all Critical findings
- [ ] Fixed all valid Major findings
- [ ] Wrote evidence for any rejected finding
- [ ] Reran relevant verification after fixes
- [ ] Relevant tests pass
- [ ] Relevant typecheck passes
- [ ] Relevant lint passes
- [ ] Build passes when applicable
- [ ] Final diff has no unrelated changes
- [ ] Final response lists files changed, verification, skipped checks, and risks

---

## Main prompt template

Use this in task prompts:

```text
Use Async QA Foreman mode for this task.
Before coding:
1. Define success criteria.
2. Define a verification plan.
3. Identify likely files, likely risks, and the smallest useful checks.
4. Then begin implementation.
Immediately spawn the /qa-foreman background subagent.
Give the qa-foreman:
- the original request
- success criteria
- relevant files
- planned verification commands
- known risks
- current implementation approach
- commands already run and results
- current diff summary when available
- instructions to inspect the current diff and challenge the completion claim
The qa-foreman must act as a skeptical senior engineer. It should inspect the plan, code, tests, edge cases, repo conventions, and completion claims while the main agent continues working. It should return a QA Foreman Report with a verdict of CONTINUE or CLEAR.
Main agent rules:
1. Keep working while qa-foreman runs.
2. Do not wait idly unless the next step depends on its report.
3. After each meaningful change, run the smallest relevant check.
4. Use Bun for installs and package scripts unless the repo clearly says otherwise.
5. When qa-foreman reports back, review every finding.
6. Fix all Critical and Major findings unless there is a clear evidence-based reason not to.
7. If rejecting a qa-foreman finding, write the reason.
8. Do not declare completion until the qa-foreman verdict is CLEAR or all valid Critical and Major findings are resolved.
9. Do not declare completion until relevant tests, typecheck, lint, and build pass.
10. Check the final diff for unrelated changes before finishing.
11. If blocked, report the exact blocker, failing command, error output, and next smallest action.
The goal is not to stop when the first solution seems plausible. The goal is to keep pushing until the implementation is working, verified, and clean.
```

---

## Common mistakes / pitfalls

- Spawning `/qa-foreman` too late
- Giving `/qa-foreman` vague context
- Waiting idly for the background report when useful implementation work remains
- Treating a `CONTINUE` verdict as optional
- Letting the background subagent make broad source edits
- Running only broad checks when a targeted failure would give faster signal
- Declaring completion before rerunning checks after fixes
- Forgetting to review the final diff for unrelated changes
