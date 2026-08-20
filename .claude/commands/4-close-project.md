# 4-close-project

**Name:** `4-close-project`
**Purpose:** Apply an OpenSpec change through TDD, verify it, prepare or update the PR, and leave archive for after merge.

**Applies when:** You are implementing or finalizing a change that already has proposal, design, tasks, and spec delta artifacts.
**Do not use when:** The change still needs planning work from `/2-implement-project` or `/3-commit-project`.

---

## Rules

- Use the OpenSpec change folder as the primary project record:
  - `openspec/changes/<change-id>/proposal.md`
  - `openspec/changes/<change-id>/design.md`
  - `openspec/changes/<change-id>/tasks.md`
  - `openspec/changes/<change-id>/specs/**`
- Apply through TDD (`docs/ai/skills/tdd/SKILL.md`) and
  `docs/ai/skills/openspec-apply-change/SKILL.md`.
- Canonical local quality gates for this repo remain:
  - `bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit`
- Use `bun run test:e2e` when user flows are materially affected.
- Do not automatically archive on a feature branch merely because local tests pass.

---

## Workflow

1. **Pre-flight**
   - Confirm the active branch and working tree state.
   - Re-read the selected change from disk.

2. **Apply the change**
   - Use TDD for behavioral work.
   - If scope changes materially, update the OpenSpec artifacts before proceeding.

3. **Run focused tests, then applicable Core checks**
   - Run the focused tests that prove the change.
   - `bun run format:check`
   - If formatting fails on in-scope files, run `bunx prettier --write <touched-files>` instead of formatting the whole repo.
   - `bun run lint`
   - `bun run typecheck`
   - `bun run build`
   - `bun run test:unit`
   - `bun run test:e2e` when flow changes justify it

4. **Verify and review**
   - Run `bun run openspec -- validate <change-id> --strict`.
   - Run OpenSpec Verify (`docs/ai/skills/openspec-verify-change/SKILL.md`).
   - Invoke the Core Guardian and relevant specialists for material product,
     data, tenant, authorization, financial, publication, or communication changes.
   - Mark completed items in `tasks.md`. Update design or proposal if realities changed.

5. **Prepare or update the PR**
   - Leave the change **active** while the implementation is unmerged.

6. **After merge only**
   - Pull the accepted branch.
   - Re-run applicable validation and OpenSpec Verify.
   - Sync (`docs/ai/skills/openspec-sync-specs/SKILL.md`) then archive:
     `bun run openspec -- archive <change-id> --yes`
   - If merge has not happened, document the exact post-merge archive action
     and stop. Do not archive incomplete or merely planned work.

---

## Checklists

### Completion checklist

- [ ] OpenSpec artifacts still match the implemented scope
- [ ] Focused tests and applicable Core checks passed
- [ ] OpenSpec Verify has no unresolved critical finding
- [ ] `tasks.md` updated
- [ ] PR prepared or updated
- [ ] Change left active while unmerged
- [ ] Archive deferred until accepted repository reality
