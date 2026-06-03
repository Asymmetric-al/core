# 3-commit-project

**Name:** `3-commit-project`  
**Purpose:** Consolidate the change into an implementation-ready handoff by validating the OpenSpec artifacts, recording the evidence used, and preparing optional research notes or handoff text for the next executor.

**Applies when:** The proposal, design, tasks, and spec delta exist and you want a clean implementation packet before coding or handoff.
**Do not use when:** The change is still missing core planning artifacts from `/2-implement-project`.

---

## Rules

- Primary inputs:
  - `openspec/project.md`
  - `openspec/changes/<change-id>/proposal.md`
  - `openspec/changes/<change-id>/design.md`
  - `openspec/changes/<change-id>/tasks.md`
  - `openspec/changes/<change-id>/specs/**`
- Nia is optional but preferred when available for fresh dependency or upstream-tool context.
- Do not require extra local Nia registries, ad hoc project-dossier folders, or Traycer-specific artifacts in this repo.
- Keep everything mapped to real repo paths.

---

## Workflow

1. **Review the current change artifacts**
   - Read the proposal, design, tasks, and spec delta.
   - Confirm they still match the intended implementation scope.

2. **Gather any missing evidence**
   - Use repo search first.
   - Use Nia if available for fresh dependency docs or public package context.
   - If Nia is unavailable, fall back to official docs and record that fallback.

3. **Record the evidence**
   - Optional path: `openspec/changes/<change-id>/research.md`
   - Include:
     - repo paths inspected
     - upstream docs used
     - whether Nia was used or unavailable

4. **Prepare an implementation handoff if needed**
   - Optional path: `openspec/changes/<change-id>/handoff.md`
   - Summarize:
     - goal
     - constraints
     - impacted files or subsystems
     - validation commands
   - If no separate handoff file is needed, treat `proposal.md`, `design.md`,
     and `tasks.md` as the implementation packet.

5. **Validate the change again**
   - Run `bunx @fission-ai/openspec@latest validate <change-id>`.
   - Fix structural or scope issues before implementation starts.

6. **Update external tracking only if available**
   - If a tracker such as Linear is installed, post:
     - change path
     - evidence or research path
     - handoff path if one exists
     - next step: `/4-close-project`

---

## Checklists

### Handoff checklist

- [ ] Proposal, design, tasks, and spec delta reviewed together
- [ ] Missing evidence gathered or explicitly marked unavailable
- [ ] `research.md` updated when external context mattered
- [ ] Optional `handoff.md` created if another executor needs a compact brief
- [ ] `bunx @fission-ai/openspec@latest validate <change-id>` run
