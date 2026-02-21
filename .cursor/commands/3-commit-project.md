# 3-commit-project

**Name:** `3-commit-project`  
**Purpose:** Run **Nia `nia_research`** using the Cursor output + Linear overview + selected Nia indexes (`data_sources`) to produce:

1. an indexed-evidence-grounded plan, and
2. a Traycer-ready handoff spec,

…then update the Linear project with exactly what sources/models were used.

**Applies when:** You have `plan.cursor.md` from `/2-implement-project`.  
**Do not use when:** You’re ready to generate/implement code now (use `/4-close-project`).

---

## Rules

### Inputs (required, no exceptions)

- Linear project overview (verbatim)
  - `docs/projects/<AL-###>/linear-overview.md`
- Cursor plan output (verbatim)
  - `docs/projects/<AL-###>/plan.cursor.md`
- Nia index hints extracted from Cursor output
  - `docs/projects/<AL-###>/nia.index-hints.md`
- Repo-local Nia index registry
  - `core/.cursor/nia/index-registry.md`

### Index selection must be deterministic and auditable

- You **must** select `data_sources` by:
  1. reading the previous step output (`nia.index-hints.md`), then
  2. mapping hints to entries in `core/.cursor/nia/index-registry.md`, then
  3. writing the final selection + justification into the dossier.
- Do **not** invent sources. If you can’t find a suitable index in the registry:
  - write the gap explicitly into `nia.selected-sources.md`,
  - update the registry from the Nia workspace resources list (Nia UI or MCP resource listing),
  - then proceed.

### Model requirement (must be Opus 4.6, 1M context)

- Nia Research must run on **Claude Opus 4.6 (1M context window)**.
- If the `nia_research` tool exposes an explicit model selector, set it to Opus 4.6 (1M).
- If model selection is only available via Nia UI/account settings, verify it there before running and record proof in the runlog.
- You must record the model + mode in:
  - `docs/projects/<AL-###>/nia.runlog.md`, and
  - the Linear project update.

### Scope and safety

- Keep everything strictly in scope of the **Asymmetric.al** repo.
- Treat indexed sources as ground truth for architecture decisions, but the final plan must still map cleanly to the repo.
- Protect existing behavior. Prefer small PRs, staged rollout, and rollback paths where relevant.
- Test-gate context for downstream merges:
  - `epic` requires `ci-gate`.
  - `develop` requires `ci-gate` + `integration-gate`.
  - `main` requires `ci-gate` + `integration-gate` + `e2e-gate`.

---

## Workflow

### 1) Collect required inputs (from the dossier)

Confirm these exist and are current:

- `docs/projects/<AL-###>/linear-overview.md`
- `docs/projects/<AL-###>/plan.cursor.md`
- `docs/projects/<AL-###>/nia.index-hints.md`

If any are missing, stop and run `/2-implement-project` first.

---

### 2) Select Nia indexes (`data_sources`) using the repo registry

1. Open `core/.cursor/nia/index-registry.md`.
2. Read `docs/projects/<AL-###>/nia.index-hints.md` and extract:
   - domains touched (auth, API, DB, billing, CI, etc.)
   - subsystems mentioned
   - key terms (package names, folders, services)
3. Map those hints to registry entries and choose `data_sources`:
   - Always include the primary Asymmetric repo index (or closest equivalent).
   - Add only **3–7** additional sources unless clearly necessary.
4. Write your selection to:
   - `docs/projects/<AL-###>/nia.selected-sources.md`

That file must include:

- `data_sources=[...]` (machine IDs / identifiers exactly as used by Nia)
- For each selected source:
  - human-readable name
  - one-line justification tied to the Cursor output and/or Linear overview
- Any “missing index” gaps and how they were resolved

---

### 3) Create the Nia input bundle (single paste payload)

Create/update:

- `docs/projects/<AL-###>/nia-input-bundle.md`

Paste in this exact order:

1. **Linear project overview** (verbatim)
2. **Cursor plan output** (verbatim)
3. **Selected sources** (`nia.selected-sources.md`, verbatim)
4. **NIA Prompt** (Appendix below, verbatim)

This bundle is the content that will become the `query` argument to `nia_research`.

---

### 4) Run `nia_research`

Preferred: `mode="oracle"` for full synthesis. Use `mode="deep"` if you want less autonomy.

Required parameters:

- `query`: contents of `nia-input-bundle.md`
- `mode`: `"oracle"` or `"deep"`
- `data_sources`: from `nia.selected-sources.md`

Recommended parameters (if supported by your MCP surface):

- `output_format="verbose"` (auditability)
- `verbose=true`
- `num_results` appropriate to the mode (e.g., 10–25)
- `days_back` only if recency matters

**Important:** Use the MCP parameter `data_sources` (as shown in your `nia_research` tool parameter list). This is how you “attach indexes.”

---

### 5) Capture the exact Nia run arguments (runlog)

Create/update:

- `docs/projects/<AL-###>/nia.runlog.md`

It must include:

- timestamp
- the full `nia_research(...)` arguments you used (including `data_sources`)
- model used (must be Claude Opus 4.6 (1M))
- mode used (`oracle` / `deep`)
- any additional parameters (num_results, days_back, repositories, etc.)

---

### 6) Save Nia outputs into the dossier

Create/update:

- `docs/projects/<AL-###>/plan.nia.md`
  - The final enriched plan grounded in indexed evidence.
- `docs/projects/<AL-###>/traycer.handoff.md`
  - A paste-ready Traycer prompt (the plan + constraints + execution checklist).

If Nia returns only one combined artifact, split it into these two files (copy/paste) and note that in `nia.runlog.md`.

---

### 7) Update the Linear project (mandatory)

Post a Linear comment that includes:

- **Model:** Claude Opus 4.6 (1M)
- **nia_research mode:** oracle/deep
- **data_sources:** list of IDs + names
- **Artifacts:** links/paths to
  - `plan.nia.md`
  - `traycer.handoff.md`
  - `nia.runlog.md`
  - `nia.selected-sources.md`
- **Next step:** `/4-close-project` (Traycer execution + PR finalize)

---

## Snippets

### `nia_research` call template (MCP)

> Adjust only for the parameters your MCP surface supports. Keep `query`, `mode`, and `data_sources`.

```py
nia_research(
  query="""
<PASTE: docs/projects/<AL-###>/nia-input-bundle.md>
""",
  mode="oracle",                 # or "deep"
  num_results=20,                # optional
  data_sources=[...],            # REQUIRED: from nia.selected-sources.md
  repositories=[...],            # optional (only if you intentionally want repo scanning)
  days_back=365,                 # optional
  output_format="verbose",       # recommended
  verbose=True                   # recommended
)

# Nia selected sources (for nia_research)

## data_sources (machine IDs)
data_sources = [
  "<SOURCE_ID_1>",
  "<SOURCE_ID_2>",
  "<SOURCE_ID_3>"
]

## Selected sources with justification
- **<SOURCE_ID_1>** — <Human Name>
  Justification: <Tie directly to domains/hints in nia.index-hints.md and the Cursor plan.>

- **<SOURCE_ID_2>** — <Human Name>
  Justification: <Tie directly to the Linear project goals and constraints.>

- **<SOURCE_ID_3>** — <Human Name>
  Justification: <Tie directly to test/CI/deployment concerns if relevant.>

## Gaps / missing indexes
- <If something needed wasn’t in core/.cursor/nia/index-registry.md, explain how you resolved it.>
```
