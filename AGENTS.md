# Agent Router — Rules

**Name:** `agents-router`  
**Purpose:** Single routing/index for rules and skills in this repo. Use it to decide which docs to load and which tools to use before editing.  
This file is the deterministic entry point for all agent work in `core`.

**Applies when:** Any task inside this repo.  
**Do not use when:** Working outside this repo or doing general, non-repo conversation.

---

## Tooling (Required)

### Nia (MCP) usage: always repo-scoped + always preambled

**Default for repo context. Use when:**

- "where is...", "how does...", "what calls...", "find...", "trace..."
- architecture, patterns, entry points, data flow
- refactors/renames/multi-file edits
- regressions across modules
- verifying existing integrations

#### Repo scoping (required)

- Always include repo scope in Nia tool calls: `repository="Asymmetric-al/core"` or `repositories=["Asymmetric-al/core"]`.
- If a tool lacks repo selection, use the most restrictive equivalent (path filters, file globs, repo-specific search endpoints) and state it explicitly.
- Outside-repo searches are rare. If needed, include a short justification in the prompt and run a second scoped pass inside `Asymmetric-al/core` before making changes.

#### Shared index setup (contributors)

- Use your own Nia API key (never shared).
- Add/subscribe the public `Asymmetric-al/core` indexed source in your Nia workspace.
- Verify the repo appears in your Nia resources list; otherwise scoped queries will fail.

#### Required helper docs (must exist, must be used)

- `docs/ai/stack-registry.md`
  - Canonical list of languages/frameworks/SDKs used in this repo.
  - Use it to choose accurate “Stack” tags + keywords for Nia queries.
- `docs/ai/working-set.md`
  - Living task context for the current work.
  - Keep it updated during the task.
  - Use it to build the Nia query preamble for every Nia search.

If either doc is missing or stale, create/update it before doing major work.

#### Nia query preamble (required)

Before every Nia search-like call, construct a short preamble using `docs/ai/working-set.md` + `docs/ai/stack-registry.md`:

```
Repo: Asymmetric-al/core
Goal: <one sentence>
Area: <dir/module/file guess>
Stack: <3–8 tags from stack-registry.md>
Keywords: <5–12 exact identifiers/strings>
Constraints: <runtime/tooling/behavior constraints>
Evidence required: file paths + symbol names + brief explanation
```

Rules:

- Put this preamble at the top of the `query` string for `mcp__nia__search`.
- Do not shove the preamble into `pattern` for grep calls. Keep grep patterns tight and exact.
- Always read the top matches before editing. Cite exact file paths and functions/components.

#### Actions

- search relevant symbols/routes/paths
- read top matches
- cite exact file paths and specific functions/components

#### If Nia cannot find evidence

- say so explicitly
- fall back to `rg` + direct file reads (show commands or paths checked)

#### Examples (repo-scoped + preambled)

```ts
mcp__nia__search({
  query: `
Repo: Asymmetric-al/core
Goal: Locate where auth is handled end-to-end
Area: auth entry points + session plumbing
Stack: Next.js, TypeScript, Supabase Auth
Keywords: auth, session, middleware, createClient, "401"
Constraints: cite exact files + functions
Evidence required: file paths + symbol names + brief explanation

Question: Where is auth handled?
`.trim(),
  repositories: ["Asymmetric-al/core"],
  search_mode: "repositories",
});
```

```ts
mcp__nia__nia_read({
  source_type: "repository",
  source_identifier: "Asymmetric-al/core:src/lib/supabase/server.ts",
});
```

```ts
mcp__nia__nia_grep({
  source_type: "repository",
  repository: "Asymmetric-al/core",
  pattern: "createClient",
  path: "src",
});
```

Answer with citations/paths from the repo and avoid external sources unless justified.

---

### Context7 (default for third-party APIs)

**Use when:**

- any third-party library/framework/API surface is involved

**Actions:**

- resolve library ID
- query docs for the exact API

**If Context7 is unavailable:**

- consult upstream docs
- state assumptions explicitly

---

## Routing Rules (Deterministic)

Load rulebooks before editing files in their domain.

- **General workflow / AL-### / CI gates / labels:** `docs/ai/rules/general.md`
- **Frontend UI/components/styling/UX:** `docs/ai/rules/frontend.md`
- **Backend/Supabase/auth/data access/migrations:** `docs/ai/rules/backend.md`
- **Testing/Playwright/a11y/perf gates:** `docs/ai/rules/testing.md`
- **shadcn/studio MCP workflows (/cui, /rui, /iui, /ftc):** `docs/ai/rules/shadcn-studio-mcp.md` (only when running those workflows)

---

## Skills (Deterministic)

**Skills are repo-local workflow docs** that live under `docs/ai/skills/**/SKILL.md`.

- Load the relevant Skill(s) when the task trigger matches.
- Skills must remain **procedural**: triggers → steps → checklist.
- Every Skill should include a **last-updated timestamp** in its frontmatter (`metadata.last_updated`). See: `docs/agent/skills-bench.md`.

### Skills Stewardship (Required)

A repo-local sub-agent named **`skills-steward`** maintains Skills hygiene and a living backlog.

- Working document: `docs/agent/skills-bench.md`
- Skill root: `docs/ai/skills/`
- The steward:
  - inventories Skills, flags stale Skills (>28 days since `metadata.last_updated`)
  - proposes new Skill candidates (awaiting user-provided sources)
  - proposes removals/merges for duplicate/obsolete Skills
  - updates only the marked blocks below (registry + index)
- The steward **does not** browse the web to find sources for new Skills; the user supplies URLs/snippets when ready.

### Skill Registry (human) — steward managed

<!-- BEGIN: SKILLS_REGISTRY (managed by skills-steward) -->

- /nextjs-app-router — Next.js App Router structure, rendering, data fetching — path: `docs/ai/skills/nextjs-app-router/SKILL.md` — (see SKILL.md)
- /cache-components — Cache Components / PPR / cacheTag & invalidation — path: `docs/ai/skills/cache-components/SKILL.md` — (see SKILL.md)
- /react-component-dev — React component design/refactor — path: `docs/ai/skills/react-component-dev/SKILL.md` — (see SKILL.md)
- /vercel-react-best-practices — React/Next.js performance best-practice checklist (Vercel) — path: `docs/ai/skills/vercel-react-best-practices/SKILL.md` — (see SKILL.md)
- /moai-library-shadcn — shadcn/ui system usage — path: `docs/ai/skills/moai-library-shadcn/SKILL.md` - (see SKILL.md)
- /motion — Motion animations (motion/react) — path: `docs/ai/skills/motion/SKILL.md` — (see SKILL.md)
- /rechart — Recharts usage patterns — path: `docs/ai/skills/rechart/SKILL.md` — (see SKILL.md)
- /tanstack-table — TanStack Table v8 patterns — path: `docs/ai/skills/tanstack-table/SKILL.md` — (see SKILL.md)
- /supabase-postgres-best-practices — Supabase Postgres query/schema/RLS performance guidance — path: `docs/ai/skills/supabase-postgres-best-practices/SKILL.md` — (see SKILL.md)
- /nextjs-supabase-auth — Next.js App Router + Supabase Auth integration patterns — path: `docs/ai/skills/nextjs-supabase-auth/SKILL.md` — (see SKILL.md)
<!-- END: SKILLS_REGISTRY (managed by skills-steward) -->

### Skills Index (machine) — steward managed

<!-- BEGIN: SKILLS_INDEX (managed by skills-steward) -->

[Skills Index]|root:docs/ai/skills
|nextjs-app-router:{SKILL.md,references/_,scripts/_,assets/_}
|cache-components:{SKILL.md,references/_,scripts/_,assets/_}
|react-component-dev:{SKILL.md,references/_,scripts/_,assets/_}
|vercel-react-best-practices:{SKILL.md,references/_,scripts/_,assets/_}
|moai-library-shadcn:{SKILL.md,references/_,scripts/_,assets/_}
|motion:{SKILL.md,references/_,scripts/_,assets/_}
|rechart:{SKILL.md,references/_,scripts/_,assets/_}
|tanstack-table:{SKILL.md,references/_,scripts/_,assets/_}
|supabase-postgres-best-practices:{SKILL.md,references/_,scripts/_,assets/_}
|nextjs-supabase-auth:{SKILL.md,references/_,scripts/_,assets/_}

<!-- END: SKILLS_INDEX (managed by skills-steward) -->

### Skill Routing (Deterministic)

- **Auth/login/session/middleware/protected routes:** `docs/ai/skills/nextjs-supabase-auth/SKILL.md`
- **Postgres query/schema/index/RLS optimization:** `docs/ai/skills/supabase-postgres-best-practices/SKILL.md`

---

## Output Requirements

- Prefer minimal, surgical diffs
- Always show exact file paths changed
- If behavior changes, update docs and include a quick verification step (commands or steps)
- If making a multi-file change, summarize the blast radius (modules/files impacted)

---

## Quality Gate (Required)

- Do not include secrets, tokens, or credentials in docs.
- Do not allow conflicting instructions across rulebooks; reconcile and document the single source of truth.
- Every rules/skill/workflow doc must include: triggers, workflow steps, and a checklist. Update the doc if any section is missing.

---

## Checklists

### Routing checklist

- [ ] Identified domain(s) and opened the matching rulebook(s)
- [ ] Applied required skills based on triggers
- [ ] Used Nia or Context7 when required (or explicitly noted fallback)
- [ ] Nia tool calls are repo-scoped to `Asymmetric-al/core`
- [ ] Nia search calls include the “Nia query preamble” built from `docs/ai/working-set.md` + `docs/ai/stack-registry.md`

### Skills hygiene checklist

- [ ] Skill triggers/steps/checklist exist and match current repo behavior
- [ ] Skill frontmatter includes `metadata.last_updated` (ISO date)
- [ ] Skill is not stale (>28 days) or has been flagged in `docs/agent/skills-bench.md`
- [ ] If a Skill was updated, `metadata.last_updated` was set to today and the change was logged in `docs/agent/skills-bench.md`

### Response checklist

- [ ] File paths are explicit
- [ ] Behavior changes include verification steps
- [ ] Blast radius summarized for multi-file edits

---

## Minimal examples

- **"Where is auth handled?"** -> Update `docs/ai/working-set.md`; use Nia (scoped + preambled) to find auth entry points; then open `docs/ai/rules/backend.md`.
- **"Add a new UI card component."** -> Open `docs/ai/rules/frontend.md` and apply `/react-component-dev`. Use Nia to find existing patterns/components in this repo before writing new ones.
- **"Use /cui for a page."** -> Open `docs/ai/rules/shadcn-studio-mcp.md` and follow its workflow exactly.

---

## Common mistakes / pitfalls

- Skipping Nia on multi-file or architecture questions
- Running unscoped Nia searches outside `Asymmetric-al/core`
- Calling Nia without first updating `docs/ai/working-set.md`
- Using vague Nia queries without exact identifiers/keywords
- Using shadcn/studio tools without `docs/ai/rules/shadcn-studio-mcp.md`
- Mixing rulebooks with conflicting instructions instead of reconciling them
- Forgetting to update docs after behavior changes
- Letting Skills go stale without flagging/updating in `docs/agent/skills-bench.md`

---

## Demo Seed + Read-Only Runbook (2026-02-16)

This repo now includes deterministic demo data seeding and an optional read-only public demo migration for Supabase.

### Added/updated files

- `supabase/seed.sql`
  - Deterministic/idempotent full demo seed across public app tables.
  - Exactly one profile identity (`public.profiles`).
- `supabase/migrations/20260216153000_demo_readonly_rls.sql`
  - Enables RLS on demo-visible tables.
  - Public `SELECT` policy only (`anon`/`authenticated`), no write policies.
  - Revokes write privileges and locks down internal/admin tables.
- `scripts/seed-demo.sh`
  - `local`, `hosted`, and `verify` modes.
- `supabase/AGENTS.md`
- `scripts/AGENTS.md`

### Run commands

- Local migrations + seed:
  - `supabase db reset --local`
  - or `bash ./scripts/seed-demo.sh local`
- Hosted migrations:
  - `supabase db push --db-url "$SUPABASE_DB_URL"`
- Hosted seed:
  - `bash ./scripts/seed-demo.sh hosted`
- Verify seeded counts:
  - `bash ./scripts/seed-demo.sh verify`

### Sanity checks

- Exactly one profile row:
  - `SELECT COUNT(*) FROM public.profiles;`
- No FK breakage:
  - run a representative join check across donations/donors/missionaries/funds/campaigns.
- Demo table counts:
  - use `bash ./scripts/seed-demo.sh verify`.
