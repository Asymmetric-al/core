# OpenSpec Guardian Workflow

**Name:** `openspec-guardian`  
**Purpose:** Use a Cursor background subagent to keep implementation aligned with the original user prompt, durable OpenSpec intent, active OpenSpec changes, and repo boundaries.
**Applies when:** The user asks for OpenSpec alignment, prompt-intent checking, scope-drift prevention, spec-grounded review, a second agent to keep implementation on track, or careful implementation where the main agent must not go off the rails.
**Do not use when:** The task is a tiny local edit, pure writing task, one-line search, or anything where OpenSpec has no bearing on intent, behavior, or repo boundaries.

---

## Triggers

Use this workflow when the prompt includes phrases like:

- OpenSpec alignment
- follow OpenSpec
- check against OpenSpec
- prompt intent
- stay on track
- do not go off the rails
- scope drift
- spec-grounded review
- active change
- durable product intent
- background alignment agent
- guardian
- skeptical product/spec reviewer
  Also use it for non-trivial feature work, behavior changes, multi-step project work, or work that touches durable product behavior.

---

## Why this workflow exists

OpenSpec is the durable source of truth for product intent, surface boundaries, principles, system boundaries, and active behavior changes.
The main coding agent can drift when it focuses too much on implementation details. The OpenSpec Guardian exists to catch that drift early.
The guardian answers these questions:

1. Is the main agent still solving the user's actual prompt?
2. Is the code direction supported by OpenSpec?
3. Is there an active change that controls this work?
4. Did the implementation broaden scope?
5. Did durable behavior change without an OpenSpec update?
6. Did the agent cross a product, surface, data, trust, tenant, role, money, publication, or auth boundary without support?

---

## Workflow

1. **Load the repo routing layer.**
   - Read `AGENTS.md`.
   - Read nearest nested `AGENTS.md` if the task touches a nested instruction area.
   - Read `docs/ai/rules/openspec.md`.
2. **Load OpenSpec context.**
   - Read `openspec/project.md`.
   - Read relevant merged specs under `openspec/specs/**`.
   - Read relevant active changes under `openspec/changes/**`.
   - If the work changes durable behavior and no active change exists, create or update an OpenSpec change before broad implementation.
3. **Define prompt intent.**
   - Summarize the original request.
   - List explicit requirements.
   - List constraints.
   - List what is out of scope.
   - List likely drift risks.
4. **Spawn the background guardian.**
   - Invoke `/openspec-guardian` as a background subagent.
   - Give it:
     - original user request
     - success criteria
     - current implementation plan
     - relevant files or directories
     - current diff summary when available
     - active OpenSpec change ID if one exists
     - relevant OpenSpec specs already read
     - commands already run and results
     - likely drift risks
5. **Keep the main agent moving.**
   - Continue implementation while `/openspec-guardian` runs.
   - Do not wait idly unless the next step depends on its report.
   - Keep changes scoped to the prompt and active OpenSpec context.
   - If the implementation discovers a product or boundary mismatch, update the OpenSpec plan before coding further.
6. **Use the guardian report as an alignment gate.**
   - Review every finding.
   - Fix confirmed prompt-intent drift.
   - Fix confirmed OpenSpec drift.
   - If the guardian says `NEEDS_OPENSPEC_CHANGE`, create or update the OpenSpec change before broad implementation continues.
   - If rejecting a guardian finding, write the evidence from the prompt, OpenSpec, or repo files.
7. **Finish only after alignment is clean.**
   - Confirm the implementation matches the original prompt.
   - Confirm relevant OpenSpec files support the implemented behavior.
   - Confirm active change tasks are updated when applicable.
   - Run OpenSpec validation when applicable.
   - Report any intentional deviations with evidence.

---

## Checklist

### Before implementation

- [ ] Read `AGENTS.md`
- [ ] Read nested `AGENTS.md` if relevant
- [ ] Read `docs/ai/rules/openspec.md`
- [ ] Read `openspec/project.md`
- [ ] Read relevant specs under `openspec/specs/**`
- [ ] Read relevant active changes under `openspec/changes/**`
- [ ] Identified whether an OpenSpec change is required
- [ ] Defined prompt requirements
- [ ] Defined out-of-scope items
- [ ] Defined likely drift risks
- [ ] Spawned `/openspec-guardian` with a full context packet

### During implementation

- [ ] Main agent kept working while `/openspec-guardian` ran
- [ ] Changes stayed inside prompt scope
- [ ] Changes stayed aligned with OpenSpec
- [ ] No durable behavior changed without OpenSpec support
- [ ] No broad refactors slipped into a narrow request
- [ ] Active change tasks stayed current when applicable

### Before completion

- [ ] Reviewed the OpenSpec Guardian Report
- [ ] Resolved all confirmed `DRIFT` findings
- [ ] Addressed any `NEEDS_OPENSPEC_CHANGE` verdict
- [ ] Validated OpenSpec when applicable
- [ ] Confirmed implementation matches original prompt
- [ ] Confirmed implementation is supported by relevant OpenSpec files
- [ ] Documented evidence for any rejected finding
- [ ] Final response lists files changed, OpenSpec files reviewed, validation commands, skipped checks, and remaining risks

---

## Main prompt template

Use this in task prompts:

```text
Use OpenSpec Guardian mode for this task.
Before coding:
1. Read AGENTS.md.
2. Read openspec/project.md.
3. Read docs/ai/rules/openspec.md.
4. Read relevant specs under openspec/specs/**.
5. Read relevant active changes under openspec/changes/**.
6. Define the original prompt intent, success criteria, out-of-scope items, and likely drift risks.
Immediately spawn the /openspec-guardian background subagent.
Give the openspec-guardian:
- the original user request
- success criteria
- current implementation plan
- relevant files or directories
- current diff summary when available
- active OpenSpec change ID if one exists
- relevant OpenSpec specs already read
- commands already run and results
- likely drift risks
The openspec-guardian must check whether the main agent's work stays aligned with the original prompt, OpenSpec durable intent, active OpenSpec changes, and repo boundaries.
Main agent rules:
1. Keep working while openspec-guardian runs.
2. Do not wait idly unless the next step depends on its report.
3. Do not broaden scope without OpenSpec support.
4. Do not change durable behavior without creating or updating an OpenSpec change.
5. When openspec-guardian reports back, review every finding.
6. Fix all confirmed DRIFT findings.
7. If the verdict is NEEDS_OPENSPEC_CHANGE, address the OpenSpec gap before broad implementation continues.
8. If rejecting a finding, write the evidence from the prompt, OpenSpec, or repo files.
9. Do not declare completion until prompt intent and OpenSpec alignment are clean.
10. Run OpenSpec validation when applicable.
The goal is to keep the implementation grounded in the user's actual request and OpenSpec, not to let the coding agent drift into a plausible but unsupported solution.
```

---

## Relationship to QA Foreman

Use `openspec-guardian` for:

- prompt intent
- OpenSpec alignment
- active change alignment
- scope drift
- product and boundary correctness
  Use `qa-foreman` for:
- code quality
- tests
- edge cases
- lint, typecheck, build
- completion quality
  For serious implementation tasks, use both:

1. Spawn `/openspec-guardian` early.
2. Spawn `/qa-foreman` after the first implementation pass.
3. Do not finish until both alignment and quality gates are clear.

---

## Common mistakes / pitfalls

- Treating OpenSpec as optional background reading
- Letting implementation convenience override durable intent
- Creating product behavior not described in the prompt or OpenSpec
- Ignoring an active change under `openspec/changes/**`
- Updating code while leaving OpenSpec stale
- Rewriting OpenSpec to justify drifted code
- Missing app, package, data, tenant, role, auth, money, CRM/CMS, or publication boundaries
- Forgetting to validate OpenSpec after changing OpenSpec artifacts
- Treating `qa-foreman` as a substitute for OpenSpec alignment
