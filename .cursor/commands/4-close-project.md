# 4-close-project

**Name:** `4-close-project`  
**Purpose:** Execute the plan using **Traycer**, then finalize the PR: review generated changes, run repo quality gates, commit/push, mark PR ready, and continuously update the Linear project with progress + artifacts + exact prompts/sources used.

**Applies when:** `traycer.handoff.md` exists and you’re ready to generate/implement code + ship the PR.  
**Do not use when:** You still need a validated plan (use `/2-implement-project` and `/3-commit-project` first).

---

## Rules

- Base branch: `epic`. PR base must be `epic`.
- Treat Traycer as **human-initiated** in Cursor:
  - You open Traycer and paste `traycer.handoff.md`.
  - The agent cannot “start the Traycer UI” on its own.
- Canonical local PR-readiness checks (for `epic` PRs) must pass:
  - `bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit`
- Branch-aware CI gate requirements:
  - `epic`: `ci-gate` (format/lint/typecheck/build/test-unit)
  - `develop`: `ci-gate` + `integration-gate` (`migrate` + `smoke`)
  - `main`: `ci-gate` + `integration-gate` + `e2e-gate`
- Formatting: fix with `bun run format`, verify with `bun run format:check`.
- E2E (`bun run test:e2e`) should be run when user flows are impacted; it is enforced by `e2e-gate` for `main`.
- Every major milestone must be posted back to Linear (plan accepted, Traycer executed, gates green, PR ready).

---

## Workflow

1. **Pre-flight (git):**
   - Confirm you are on the feature branch created in `/1-start-project`.
   - Run: `git status`, `git branch --show-current`.
   - Sync from `epic` (follow repo convention: merge/rebase as preferred).

2. **Open Traycer (Cursor integration) — manual step:**
   - Launch Traycer from Cursor’s command palette or sidebar.
   - Create a task in Traycer.
   - Paste `docs/projects/<AL-###>/traycer.handoff.md` as the primary input.

3. **Review Traycer plan before execution (required):**
   - Ensure it matches `plan.cursor.md` + `plan.nia.md`.
   - Ensure non-negotiables are preserved:
     - protect existing behavior
     - small PRs / staged rollout
     - rollback paths where relevant
   - Save: `docs/projects/<AL-###>/traycer.plan.md` (the final plan used)

4. **Execute in Traycer:**
   - Run the task and apply code changes.
   - Save run output/logs into:
     - `docs/projects/<AL-###>/traycer.runlog.md`

5. **Post-run code review (human-in-the-loop):**
   - Inspect the diff for correctness and scope.
   - Scan changed files for TODO/FIXME:
     - `git grep -nE "TODO|FIXME" -- .`
   - If scope drift occurred, fix it now before committing.

6. **Run repo checks (quality gates):**
   - `bun run format`
   - `bun run format:check`
   - `bun run lint`
   - `bun run typecheck`
   - `bun run build`
   - `bun run test:unit`
   - If flows impacted: `bun run test:e2e` (recommended; required for `main` gate in CI)

7. **Commit + push:**
   - Stage changes intentionally.
   - Commit message policy:
     - title: `AL-123: <short summary>`
     - body: include `ref AL-123`
   - Push branch and ensure PR is updated.

8. **PR readiness + review:**
   - Mark PR “Ready for review”.
   - Request CODEOWNERS reviewers if applicable.
   - Ensure PR body has:
     - `fixes AL-###` lines
     - Artifacts section linking dossier path and key files

9. **Update Linear project (final + milestone updates):**
   - As you complete each milestone, update Linear (don’t wait until the end):
     - After Traycer plan accepted: post `traycer.plan.md`
     - After execution: post `traycer.runlog.md` + summary
     - After gates green: post commands run + results
     - When PR ready: post PR link + status “Done/Complete”
   - Final Linear comment must include:
     - completion status (e.g., 100%)
     - links/paths to:
       - `plan.cursor.md`
       - `plan.nia.md`
       - `traycer.handoff.md`
       - `traycer.plan.md`
       - `traycer.runlog.md`
       - `nia.runlog.md`
     - the exact Nia `data_sources` list + model + mode used (copied from `/3-commit-project` outputs)

---

## Checklists

### Pre-flight checklist

- [ ] On feature branch
- [ ] Synced with `epic`
- [ ] `traycer.handoff.md` exists
- [ ] PR targets `epic`

### Quality gate checklist

- [ ] format:check pass
- [ ] lint pass
- [ ] typecheck pass
- [ ] build pass
- [ ] unit tests pass
- [ ] e2e run if relevant (recommended; required on `main` via `e2e-gate`)

### Linear update checklist

- [ ] Traycer plan posted
- [ ] Traycer runlog posted
- [ ] CI/gates status posted
- [ ] Final artifacts + prompts/sources posted
