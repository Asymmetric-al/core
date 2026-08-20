# 1-start-project

**Name:** `1-start-project`
**Purpose:** Start OpenSpec-backed work by discovering or proposing a change with an explicit change ID, then aligning the working branch.

**Applies when:** Beginning non-trivial work that should leave durable planning artifacts behind.
**Do not use when:** The change already exists and you are ready to flesh out design and tasks (use `/2-implement-project`).

---

## Rules

- OpenSpec is the primary artifact location:
  - `openspec/config.yaml`
  - `openspec/project.md`
  - `openspec/specs/**`
  - `openspec/changes/<change-id>/**`
- Do **not** create ad hoc planning dossiers outside OpenSpec in this repo.
- If a ticket key such as `AL-123` exists, include it in the branch name when practical.
- If a provider tracker such as Linear is available, update it conditionally. Do not assume it is always installed.
- Use `AGENTS.md` plus the relevant `docs/ai/rules/*` files before drafting the change.
- Use the locally pinned CLI: `bun run openspec -- <command>`.
- Require an explicit change ID before any mutating OpenSpec operation.
- Let OpenSpec determine artifact paths and dependencies. Do not manually create an incomplete subset of artifacts.

---

## Workflow

1. **Pre-flight**
   - Run `git status --short`.
   - Read `openspec/config.yaml` and `openspec/project.md`.
   - Run `bun run openspec -- list` to inspect active changes.

2. **Choose the change ID**
   - Prefer an existing change if one already covers the work.
   - Otherwise create a kebab-case change ID based on the intent.
   - If an `AL-###` ticket exists, include it when it helps disambiguate the change.

3. **Explore or Propose**
   - Use Explore (`docs/ai/skills/openspec-explore/SKILL.md`) when requirements are unclear.
   - Use Propose (`docs/ai/skills/openspec-propose/SKILL.md`) when intent is clear.
   - Stop only after the planning package is ready for review.

4. **Open a working branch**
   - Start from the appropriate repo base branch for the task.
   - Branch format:
     - `al-123-short-title` when a ticket is primary
     - otherwise a concise branch based on the change ID

5. **Update external tracking only if available**
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
- [ ] Existing changes inspected with `bun run openspec -- list`
- [ ] Explicit change ID chosen
- [ ] Explore or Propose completed so the planning package is reviewable
- [ ] Branch name aligned with the change or ticket
