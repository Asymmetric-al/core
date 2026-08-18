# 3-commit-project

**Name:** `3-commit-project`
**Purpose:** Validate the OpenSpec planning package, record meaningful evidence, and state whether implementation is ready. This is readiness and handoff, not git commit automation.

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
- Do not duplicate OpenSpec templates in this command.
- Do not archive from this command.

---

## Workflow

1. **Review the current change artifacts**
   - Read the complete planning package.
   - Confirm they still match the intended implementation scope and non-goals.

2. **Gather any missing evidence**
   - Use repo search first.
   - Use Nia if available for fresh dependency docs or public package context.
   - If Nia is unavailable, fall back to official docs and record that fallback.

3. **Record the evidence**
   - Optional path: `openspec/changes/<change-id>/research.md`
   - Include repo paths inspected, upstream docs used, and whether Nia was used.

4. **Prepare an implementation handoff only if another executor needs it**
   - Optional path: `openspec/changes/<change-id>/handoff.md`
   - If no separate handoff file is needed, treat `proposal.md`, `design.md`,
     and `tasks.md` as the implementation packet.

5. **Validate the change**
   - Run `bun run openspec -- validate <change-id> --strict`.
   - State whether implementation is ready.
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
- [ ] Scope and non-goals still match
- [ ] Missing evidence gathered or explicitly marked unavailable
- [ ] Optional `handoff.md` created only if another executor needs it
- [ ] `bun run openspec -- validate <change-id> --strict` run
- [ ] Implementation readiness stated
