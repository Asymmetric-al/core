# 1-start-project

**Name:** `1-start-project`  
**Purpose:** Kick off work for one or more `AL-###` Linear **projects** by creating a feature branch + draft PR, capturing the Linear project overview, and starting a consistent artifact trail + progress log back to Linear.

**Applies when:** Beginning work on one or more `AL-###` projects.  
**Do not use when:** You already have an active branch + PR for the project (use `/2-implement-project`).

---

## Rules

- Base branch: `epic`.
- PR base: `epic`.
- Branch format: `al-123-short-kebab-title` (first project key is primary).
- PR title format: `AL-123: <project title>`.
- PR body must include `fixes AL-###` for each project.
- Artifacts are mandatory and live in-repo under a project dossier folder (see Workflow).
- Linear must be updated continuously:
  - Branch name
  - PR link
  - Dossier folder path
  - Every major prompt/run output (Cursor plan, Nia plan, Traycer handoff, etc.)
- Nia index selection requires a repo-local registry file:
  - Canonical path: `core/.cursor/nia/index-registry.md`
  - This is the authoritative map from “project concerns” → “Nia data_sources to attach”.

---

## Workflow

1. **Pre-flight:** Ensure clean working tree and up-to-date `epic`.
   - Run: `git status`, `git checkout epic`, `git pull origin epic`.
   - If working tree is dirty, stop and commit/stash first.

2. **Validate project keys:** Each key must match `^AL-\d+$`.

3. **Fetch project details (Linear MCP):**
   - Capture: title, overview/brief, goals, acceptance criteria (if present), links, and any attachments.

4. **Ensure Nia index registry exists (repo-global):**
   - Check for `core/.cursor/nia/index-registry.md`.
   - If missing, create it using the template in **Snippets → Nia index registry template**.
   - Do **not** invent indexes. Populate it from your Nia workspace resource list (Nia UI or MCP `manage_resource(list)`).

5. **Create a local “project dossier” folder in-repo (for artifacts):**
   - First, search the repo for an existing convention (`docs/`, `documentation/`, `specs/`, etc.) and use it.
   - If no convention exists, create: `docs/projects/<AL-###>/`
   - Create (or update) these files:
     - `linear-overview.md` (paste Linear project overview + links)
     - `worklog.md` (append-only running log: date/time + what happened)
     - `artifacts.md` (index of produced artifacts + where to find them)

6. **Create branch:** Derive from the primary project title.
   - If branch exists locally/remotely, stop and ask whether to reuse it.

7. **Push branch:** `git push -u origin <branch>`.

8. **Create draft PR (GitHub):**
   - Ensure the PR body includes the required `fixes AL-###` lines.
   - Include an **Artifacts** section pointing to the dossier folder path.

9. **Update the Linear project (Linear MCP):**
   - Set status to “In Progress” (or your equivalent).
   - Add a comment that includes:
     - Branch name
     - PR link
     - Dossier folder path
     - Next step: `/2-implement-project`

---

## Checklists

### Pre-flight checklist
- [ ] On `epic` and up-to-date
- [ ] Working tree clean
- [ ] `AL-###` keys validated
- [ ] Nia index registry exists (repo-global)

### PR checklist
- [ ] PR targets `epic`
- [ ] PR title is `AL-123: ...`
- [ ] PR body includes `fixes AL-###` lines
- [ ] PR body includes dossier path under an **Artifacts** section

---

## Snippets

### Nia index registry template (`core/.cursor/nia/index-registry.md`)

> Purpose: Maintain a durable list of Nia indexes/sources so agents can reliably choose `data_sources` for `nia_research`.

```md
# Nia Index Registry (Authoritative)

This file maps project concerns to Nia sources/indexes so agents can select `data_sources` deterministically.

## How to update
- Populate from Nia workspace resources (Nia UI or MCP `manage_resource(action="list")`).
- Do NOT invent sources. If unsure, leave blank and add a TODO.

## Registry

| Tag | Source Name (human) | Source ID / Identifier (machine) | Type | What it contains | When to attach | Notes |
|---|---|---|---|---|---|---|
| repo:asymmetric | Asymmetric.al repo | <FILL_ME> | repository | Core codebase | Always | |
| docs:stack | Stack / architecture docs | <FILL_ME> | documentation | Tech plan / decisions | When changing architecture | |
| docs:testing | Testing & CI docs | <FILL_ME> | documentation | CI + test conventions | When adding tests / CI | |
| ... | ... | ... | ... | ... | ... | ... |

## Selection rules (for agents)
1. Always attach `repo:asymmetric` (or the closest equivalent in this registry).
2. Attach only 3–7 additional sources unless the project clearly requires more.
3. Every attached source must have a one-line justification in the dossier.