---
name: create-agent
description: Guides a one-question-at-a-time design interview, captures alignment in agent/EVE-BRIEF.md, then scaffolds and implements a runnable eve agent with verbose teaching comments. Use when the user wants to create a new eve agent, build an agent from scratch, or invokes /create-agent.
---

# create-agent

Turn a rough agent idea into a runnable **eve** agent through structured Q&A, a written brief, then scaffold + implementation.

## Phases

```
Task Progress:
- [ ] Phase 1 — Design interview (one question at a time)
- [ ] Phase 2 — Write agent/EVE-BRIEF.md and get confirmation
- [ ] Phase 3 — Scaffold eve, implement, verify
```

Do not skip Phase 1 or Phase 2. Do not scaffold or write agent code until the user confirms the brief.

---

## Phase 1 — Design interview

Interview the user until you have a shared, implementable picture of the agent.

### Rules

1. **One question at a time.** Wait for the user's answer before the next question.
2. **Include a recommended answer** with every question — state your pick and why in one or two sentences.
3. **Explore instead of asking** when the answer is in the repo, docs, or env (existing agents, package.json, API keys, monorepo layout).
4. **Follow the decision tree.** Resolve blockers before dependent questions (purpose → surfaces → tools → scope → runtime).
5. **Use concrete scenarios.** When behavior is fuzzy, invent a user message and ask what the agent should do step by step.
6. **Tighten vague language.** Replace overloaded words ("handle", "manage", "process") with specific capabilities or tool names.
7. **Surface contradictions.** If a new answer conflicts with an earlier one, call it out before moving on.

### What to cover (in rough order)

| Area | Goal |
|------|------|
| Purpose | One sentence: what job does this agent do? |
| Users & entry | Who talks to it, and through what channel(s)? |
| Core loop | Typical turn: user says X → agent does Y → user sees Z |
| Eve surfaces | Which slots matter? (`tools`, `skills`, `channels`, `connections`, `subagents`, `schedules`, `hooks`, `sandbox`, `evals`) |
| Tools & data | Named capabilities, inputs/outputs, real APIs vs connections |
| Scope | What is deliberately out of scope for v1? |
| Model | Preferred model string (default: `openai/gpt-4.1-mini` via AI Gateway) |
| Secrets | Env vars needed for real integrations (always include `AI_GATEWAY_API_KEY`) |
| Location | Project directory name and whether it lives inside an existing monorepo |

Stop interviewing when you can fill every section of [EVE-BRIEF template](reference.md#eve-brief-template) without guessing.

### End Phase 1

Summarize decisions in a short bullet list. Ask: **"Does this match what you want? Ready for me to write EVE-BRIEF.md?"**

---

## Phase 2 — EVE-BRIEF.md

Write `agent/EVE-BRIEF.md` using the template in [reference.md](reference.md#eve-brief-template).

- If eve is not scaffolded yet, write the brief to a temp path or describe that it will land at `agent/EVE-BRIEF.md` after init — then place it there immediately after scaffold.
- After writing, show the brief and ask for explicit confirmation before Phase 3.
- Record any mock/stub fallback and the reason in the brief's data-source column.
- Fill the **Teaching comments** section (which surfaces get annotated, primary "start here" files for the README table).

---

## Phase 3 — Scaffold, implement, verify

### 0. Read eve docs (required before any implementation)

After `eve` is installed, **must** read bundled docs at `node_modules/eve/docs/` before writing agent code:

1. Introduction and Getting Started
2. Every surface page listed in the brief (tools, channels, connections, etc.)
3. Any API or pattern referenced by sibling agents in the repo

**Never rely on hardcoded snippets from this skill or training memory.** API shapes, imports, and conventions change — local docs are the source of truth. See [reference.md](reference.md#docs-discovery).

### 1. Detect project layout

Before scaffolding, inspect the repo:

| Situation | Action |
|-----------|--------|
| No `agent/` directory anywhere | `npx eve@latest init <dir>` (standalone) or `npx eve@latest init .` (add to existing app) |
| One existing eve agent | Mirror its project structure (package.json scripts, tsconfig, env pattern) |
| Multiple eve agents (monorepo) | Inventory siblings; mirror naming, workspace deps, and folder conventions from the nearest agent |

Do not assume a specific monorepo shape. Discover conventions from the codebase. See [reference.md](reference.md#repo-layouts).

### 2. Install / scaffold

**No eve project yet:**

```bash
npx eve@latest init <agent-dir>
```

`init` installs deps and may start the dev server — run in a controllable process and **stop the server** before editing files.

**Existing project, no `agent/` directory:**

```bash
cd <project-root>
npx eve@latest init .
```

**eve already present:** skip init; ensure `agent/agent.ts` and `agent/instructions.md` exist.

Optional: `--channel-web-nextjs` only when the user asked for Web Chat and they are using Next.js.

### 3. Place EVE-BRIEF.md

Write or move `agent/EVE-BRIEF.md` into the scaffolded `agent/` directory.

### 4. Implement from the brief

Minimum bar for every agent:

- `agent/agent.ts` — model config per brief (follow docs for current `defineAgent` API)
- `agent/instructions.md` — identity, when to use tools, tone, guardrails from the brief
- At least one real capability — tools, connections, or other surfaces from the brief
- Channel config if the brief requires it
- `.env.example` with `AI_GATEWAY_API_KEY=` and every env var for real integrations
- README with clone-and-run steps

Implement only surfaces listed in the brief. For each surface, read the matching page in `node_modules/eve/docs/` and follow patterns from the nearest existing agent in the repo when one exists.

**Teaching comments (required):**

Every file you create or substantially edit during scaffold + implementation must include **verbose, educational comments** that teach the user how eve works — not just what the line does. Treat the generated agent as a guided tutorial the user will read while running it.

See [reference.md — Teaching comments](reference.md#teaching-comments) for the full checklist. At minimum:

- **File header** on every `agent/**/*.ts` file: which eve surface this file belongs to, how eve discovers/loads it, and what role it plays in a turn.
- **Section blocks** before each logical unit (imports, schema, handler, export): explain the eve concept (e.g. tool identity from path, `defineAgent` slots, channel request lifecycle).
- **Inline comments** on eve-specific APIs, config keys, and conventions the user would not know from TypeScript alone — link to the matching doc page under `node_modules/eve/docs/` when helpful.
- **`instructions.md`**: short callouts above each major section explaining how system instructions shape model behavior in eve.
- **README**: a "How this agent is structured" section that maps files → eve surfaces and points to the most-commented files to read first.

Do not strip comments eve `init` generated if they teach a concept. Prefer adding over removing. Skip comments only on truly obvious TypeScript (e.g. `import` of a local type). Never use placeholder comments like `// TODO: explain` — write the explanation.

**Conventions:**

- Always **eve**, never Eve
- Tool identity is path-derived: `agent/tools/foo.ts` → `foo`
- Prefer real connections (`agent/connections/`) and real data/APIs when feasible
- Use mock/stub only when the user explicitly chooses it, credentials are not available yet, or a real integration would block v1 — document the choice and reason in `EVE-BRIEF.md`
- Do not commit `.env` or secrets

### 5. Monorepo housekeeping (only when applicable)

If the repo already hosts multiple eve agents under a shared parent directory:

1. Update any existing agent index or catalog the repo maintains — for ship-eve, add a row to both `agents/README.md` and the root `README.md` with **Eve surfaces** and **Eve capabilities demonstrated** (use labels from the capabilities key in `agents/README.md`)
2. Register the new package in the workspace manifest (`pnpm-workspace.yaml`, `package.json` workspaces, etc.)
3. Match package naming and shared config from sibling agents

Skip this step for standalone projects.

### 6. Verify

```bash
pnpm install   # or npm install
pnpm typecheck # if available
pnpm build     # eve build
```

Tell the user how to run `pnpm dev`, what to ask in the TUI, and how to exercise the agent over HTTP per the eve docs. Point them to the most-commented files as the learning path. Do not commit unless asked.

---

## Examples

**User:** "I want an agent that summarizes my GitHub PRs"

→ Phase 1 asks: which repo/PR scope? channel? recommended: GitHub connection or API-backed `get_pr` tool with real token, HTTP channel for v1. Mock only if the user has no credentials yet — note that in the brief.

**User:** "/create-agent" in a repo that already has eve agents

→ Inventory sibling agents, mirror their layout, interview, brief, scaffold alongside them, update any repo index.

---

## Additional resources

- [reference.md](reference.md) — EVE-BRIEF template, repo layouts, docs discovery, question bank
