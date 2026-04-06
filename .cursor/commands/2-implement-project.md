# 2-implement-project

**Name:** `2-implement-project`  
**Purpose:** Turn an OpenSpec proposal into an implementation-ready design and task list using repo-grounded evidence and conditional Nia enrichment.

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

---

## Workflow

1. **Confirm the change context**
   - Read `openspec/project.md`.
   - Read `openspec/changes/<change-id>/proposal.md`.
   - Read the relevant spec delta files under `openspec/changes/<change-id>/specs/**`.

2. **Gather repo evidence**
   - Search the repo for existing patterns and exact file paths.
   - Open the relevant rulebooks under `docs/ai/rules/*`.
   - Use Nia for repo-grounded and dependency-grounded research if it is available in the current client.

3. **Create or update the design**
   - Path: `openspec/changes/<change-id>/design.md`
   - Cover:
     - technical approach
     - impacted systems or files
     - risks and compatibility constraints
     - validation strategy

4. **Create or update the tasks**
   - Path: `openspec/changes/<change-id>/tasks.md`
   - Keep tasks concrete and implementation-ready.
   - Include verification steps where behavior changes.

5. **Optionally capture research notes**
   - If external docs or Nia materially informed the plan, record them in
     `openspec/changes/<change-id>/research.md`.
   - If Nia was unavailable, note the fallback there or in `design.md`.

6. **Validate the change**
   - Run `bunx @fission-ai/openspec@latest validate <change-id>`.
   - Fix any structural issues before moving on.

7. **Update external tracking only if available**
   - If a tracker such as Linear is installed, post:
     - change path
     - design path
     - tasks path
     - next step: `/3-commit-project`

---

## Checklists

### Planning checklist

- [ ] `openspec/project.md` read
- [ ] Proposal and spec deltas read
- [ ] Repo evidence gathered before writing the design
- [ ] `design.md` updated
- [ ] `tasks.md` updated
- [ ] `bunx @fission-ai/openspec@latest validate <change-id>` run
