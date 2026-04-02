# 4-close-project

**Name:** `4-close-project`  
**Purpose:** Finish implementation of an OpenSpec change, verify the repo checks, update the change artifacts, and archive the change when it is genuinely complete.

**Applies when:** You are implementing or finalizing a change that already has proposal, design, tasks, and spec delta artifacts.
**Do not use when:** The change still needs planning work from `/2-implement-project` or `/3-commit-project`.

---

## Rules

- Use the OpenSpec change folder as the primary project record:
  - `openspec/changes/<change-id>/proposal.md`
  - `openspec/changes/<change-id>/design.md`
  - `openspec/changes/<change-id>/tasks.md`
  - `openspec/changes/<change-id>/specs/**`
- External execution tools or extra agents are optional. Do not assume Traycer or any other specific executor exists.
- Canonical local quality gates for this repo remain:
  - `bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit`
- Use `bun run test:e2e` when user flows are materially affected.

---

## Workflow

1. **Pre-flight**
   - Confirm the active branch and working tree state.
   - Re-read the proposal, design, tasks, and spec delta for the change.

2. **Implement the change**
   - Use the planned tasks as the source of truth for execution order.
   - If scope changes materially, update the OpenSpec artifacts before proceeding.

3. **Review the diff**
   - Inspect changed files for correctness and scope drift.
   - Confirm the work still matches the change artifacts.

4. **Run repo checks**
   - `bun run format:check`
   - If formatting fails on in-scope files, run `bunx prettier --write <touched-files>` instead of formatting the whole repo.
   - `bun run lint`
   - `bun run typecheck`
   - `bun run build`
   - `bun run test:unit`
   - `bun run test:e2e` when flow changes justify it

5. **Update the change artifacts**
   - Mark completed items in `openspec/changes/<change-id>/tasks.md`.
   - Update `design.md` or `proposal.md` if implementation realities changed.

6. **Validate and archive**
   - Run `bunx @fission-ai/openspec@latest validate <change-id>`.
   - When the change is genuinely done and the durable spec is accurate, run:
     - `bunx @fission-ai/openspec@latest archive <change-id> --yes`
   - If the change is not ready to archive, document the blockers in the change
     folder and stop there.

7. **Update external tracking only if available**
   - If a tracker or PR exists, post:
     - status
     - verification commands run
     - whether the change was archived

---

## Checklists

### Completion checklist

- [ ] OpenSpec artifacts still match the implemented scope
- [ ] Repo quality gates passed
- [ ] `tasks.md` updated
- [ ] `bunx @fission-ai/openspec@latest validate <change-id>` run
- [ ] `bunx @fission-ai/openspec@latest archive <change-id> --yes` run or blockers documented
