# 2-implement-project

**Name:** `2-implement-project`  
**Purpose:** Turn the Linear project overview (and any draft plan you provide) into a **full, implementation-ready project plan + issues**, using a Cursor agent prompt that forces repo-grounded validation.

**Applies when:** After `/1-start-project` and you want a repo-grounded plan that an AI coding agent can execute.  
**Do not use when:** You want to run code generation/execution (use `/4-close-project` after `/3-commit-project`).

---

## Rules

- Project keys must match `AL-###`.
- Cursor (repo) is the primary source of truth for this step:
  - Do not invent modules/files/services.
  - If unsure, search the repo before writing final instructions.
- Persist artifacts in the project dossier folder created in `/1-start-project`.
- **This step must produce “Nia index hints”:**
  - The Cursor output must include a short section naming what topics/domains the project touches (auth, payments, nextjs routes, db, etc.)
  - The agent must recommend which Nia index tags (from `core/.cursor/nia/index-registry.md`) should be attached in `/3-commit-project`.

---

## Workflow

1. **Confirm project key(s):** Validate format `^AL-\d+$`.

2. **Gather inputs (must have):**
   - Linear project overview (from `docs/projects/<AL-###>/linear-overview.md`)
   - Any user-supplied plan draft (optional)

3. **Create a “plan input bundle” (in the dossier):**
   - Create/update: `docs/projects/<AL-###>/cursor-input-bundle.md`
   - Paste in this order:
     1. Linear project overview (verbatim)
     2. Any additional context you have (links, constraints, screenshots notes)
     3. Your draft plan (or “No draft plan provided”)

4. **Run the Cursor agent using the prompt template below:**
   - Replace placeholders:
     - `{PASTE_LINEAR_PROJECT_OVERVIEW}`
     - `{PASTE_MY_PROJECT_PLAN}`
     - `{PASTE_ANY_EXTRA_CONTEXT}`
   - Require the agent to:
     - use repo search + symbol navigation
     - name concrete file paths/patterns found in-repo
     - include “Nia index hints” at the end

5. **Capture Cursor output into the dossier:**
   - Save as: `docs/projects/<AL-###>/plan.cursor.md`

6. **Extract Nia index hints (required artifact):**
   - Create/update: `docs/projects/<AL-###>/nia.index-hints.md`
   - Copy the “Nia index hints” section from `plan.cursor.md` verbatim.
   - These hints are used to choose `data_sources` in `/3-commit-project`.

7. **Update the Linear project:**
   - Comment with:
     - link/path to `plan.cursor.md`
     - link/path to `nia.index-hints.md`
     - Next step: `/3-commit-project` (Nia research enrichment)

---

## Prompt Template (Cursor)

> Paste everything below into Cursor Agent. Replace the placeholders.

######
## Role and mission. Read this first and follow it for the entire task.

You are an expert software architect, software planner, and project manager.

You must turn what I provide into a **full, complete, implementation ready project plan** with enough detail that an AI coding agent can execute it autonomously with **no questions and no missing context**.

To do that, you must actively pull all relevant context from:
- the Asymmetric.al repo (inspect it directly in Cursor), and
- the NIA MCP indexed sources (docs, stack details, prior decisions, patterns)

Then you must build that context into the final plan so the plan stands alone.

Non negotiable rules:
- Use evidence from the repo and indexed sources. Do not guess or invent components.
- Keep everything in scope of the Asymmetric.al repo. Do not require changes in other repos or unindexed systems.
- Protect existing behavior. Assume production impact. Prefer small PRs, staged rollout options, and rollback paths.
- Use modern best practices only when they match the stack and patterns proven by the repo and indexed sources.

---

# Cursor Prompt. Project Plan and Issues Review for Asymmetric.al

{PASTE_ANY_EXTRA_CONTEXT}

## Linear project overview (verbatim)
{PASTE_LINEAR_PROJECT_OVERVIEW}

## My current project plan (if any)
{PASTE_MY_PROJECT_PLAN}

## Additional required output: Nia index hints
At the very end of your output, include a section titled:

### Nia index hints

In that section:
- List the top “domains” this project touches (auth, API routes, DB, billing, CI, etc.).
- Then recommend which **index tags** from `core/.cursor/nia/index-registry.md` should be attached in Nia for `/3-commit-project`.
- If you can’t map to tags confidently, list the exact repo evidence you used and what you would search in the registry.
######

---

## Checklists

### Output checklist
- [ ] Every issue has the required structure (Title → Intent → …)
- [ ] Repo-fit checks include file paths/patterns
- [ ] Assumptions are labeled + have validation steps
- [ ] Ends with “Nia index hints”