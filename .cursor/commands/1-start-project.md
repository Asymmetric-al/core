# 1-start-project

**Name:** `1-start-project`  
**Purpose:** Start OpenSpec-backed work for a project, ticket, or change by creating or reusing an `openspec/changes/<change-id>/` folder, capturing the initial proposal scope, and aligning branch naming with the change.

**Applies when:** Beginning non-trivial work that should leave durable planning artifacts behind.
**Do not use when:** The change already exists and you are ready to flesh out design and tasks (use `/2-implement-project`).

---

## Rules

- OpenSpec is the primary artifact location:
  - `openspec/project.md`
  - `openspec/specs/**`
  - `openspec/changes/<change-id>/**`
- Do **not** create ad hoc planning dossiers outside OpenSpec in this repo.
- If a ticket key such as `AL-123` exists, include it in the branch name when practical.
- If a provider tracker such as Linear is available, update it conditionally. Do not assume it is always installed.
- Use `AGENTS.md` plus the relevant `docs/ai/rules/*` files before drafting the change.

---

## Workflow

1. **Pre-flight**
   - Run `git status --short`.
   - Read `openspec/project.md`.
   - Run `bunx @fission-ai/openspec@latest list` to inspect active changes.

2. **Choose the change ID**
   - Prefer an existing change if one already covers the work.
   - Otherwise create a kebab-case change ID based on the intent.
   - If an `AL-###` ticket exists, include it when it helps disambiguate the change.

3. **Create or update the change folder**
   - Path: `openspec/changes/<change-id>/`
   - Minimum artifacts:
     - `proposal.md`
     - `tasks.md`
     - `specs/<area>/spec.md`
   - Add `design.md` immediately if the technical approach is already clear.

4. **Draft the proposal**
   - Capture the why, the intended behavior, and explicit out-of-scope items.
   - Point to repo evidence, current rulebooks, and any relevant external tracker.

5. **Open a working branch**
   - Start from the appropriate repo base branch for the task.
   - Branch format:
     - `al-123-short-title` when a ticket is primary
     - otherwise a concise branch based on the change ID

6. **Update external tracking only if available**
   - If Linear or another tracker is installed, post:
     - branch name
     - change path
     - next step: `/2-implement-project`
   - If no tracker is available, note that the work is local-only and continue.

---

## Checklists

### Start checklist

- [ ] Working tree status checked
- [ ] `openspec/project.md` read
- [ ] Existing changes inspected with `bunx @fission-ai/openspec@latest list`
- [ ] `openspec/changes/<change-id>/` created or reused
- [ ] Proposal drafted with clear scope
- [ ] Branch name aligned with the change or ticket
