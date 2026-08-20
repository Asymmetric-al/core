# 2-implement-project

**Name:** `2-implement-project`
**Purpose:** Turn an OpenSpec proposal into an implementation-ready design and task list using repo-grounded evidence. Despite the legacy name, this command does not begin coding.

**Applies when:** After `/1-start-project` and before writing code for a non-trivial change.
**Do not use when:** The change already has a sound `design.md` and `tasks.md`, or you are ready to implement and close the change (use `/4-close-project`).

---

## Rules

- The change folder is the primary artifact location:
  - `openspec/changes/<change-id>/proposal.md`
  - `openspec/changes/<change-id>/design.md`
  - `openspec/changes/<change-id>/tasks.md`
  - `openspec/changes/<change-id>/specs/**`
- Do not invent repo modules, services, or workflows. Search the repo first.
- Use Nia when the client exposes it. If Nia is unavailable, fall back to repo reads plus official docs and say so explicitly.
- Keep the resulting design and task list scoped to this repo.
- Use Update (`docs/ai/skills/openspec-update-change/SKILL.md`) when artifacts already exist and need refinement.
- Do not begin code merely because the command is named “implement.”

---

## Workflow

1. **Confirm the change context**
   - Run `bun run openspec -- show <change-id>` or read status/instructions from disk.
   - Read `openspec/project.md`.
   - Read `openspec/changes/<change-id>/proposal.md`.
   - Read the relevant spec delta files under `openspec/changes/<change-id>/specs/**`.
   - Read relevant ADRs and PRDs.

2. **Gather repo evidence**
   - Search the repo for existing patterns and exact file paths.
   - Open the relevant rulebooks under `docs/ai/rules/*`.
   - Use Nia for repo-grounded and dependency-grounded research if it is available in the current client.

3. **Create or update the planning package**
   - Produce or refine proposal, delta specs, design, and tasks.
   - Cover technical approach, impacted systems, risks, validation, and rollback.
   - Keep tasks concrete and implementation-ready, including TDD for behavior changes.
   - Add optional research notes only when they add value.

4. **Validate the change**
   - Run `bun run openspec -- validate <change-id> --strict`.
   - Fix any structural issues before moving on.

5. **Update external tracking only if available**
   - If a tracker such as Linear is installed, post:
     - change path
     - design path
     - tasks path
     - next step: `/3-commit-project`

---

## Checklists

### Planning checklist

- [ ] `openspec/project.md` and OpenSpec status read
- [ ] Proposal and spec deltas read
- [ ] Repo evidence gathered before writing the design
- [ ] Proposal, delta specs, design, and tasks refined
- [ ] `bun run openspec -- validate <change-id> --strict` run
- [ ] No implementation started from this command
