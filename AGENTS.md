# Agent Router — Rules

**Name:** `agents-router`
**Purpose:** Single routing/index for rules and skills in this repo. Use it to decide which docs to load and which tools to use before editing.
This file is the deterministic entry point for all agent work in `core`.

**Applies when:** Any task inside this repo.
**Do not use when:** Working outside this repo or doing general, non-repo conversation.

## Tooling (Required)

### Nia (MCP) usage: always repo-scoped

**Default for repo context. Use when:**

- "where is...", "how does...", "what calls...", "find...", "trace..."
- architecture, patterns, entry points, data flow
- refactors/renames/multi-file edits
- regressions across modules
- verifying existing integrations

**Repo scoping (required):**

- Always include repo scope in Nia tool calls: `repository="Asymmetric-al/core"` or `repositories=["Asymmetric-al/core"]`.
- If a tool lacks repo selection, use the most restrictive equivalent (path filters, file globs, repo-specific search endpoints) and state it explicitly.
- Outside-repo searches are rare. If needed, include a short justification in the prompt and run a second scoped pass inside `Asymmetric-al/core` before making changes.

**Shared index setup (contributors):**

- Use your own Nia API key (never shared).
- Add/subscribe the public `Asymmetric-al/core` indexed source in your Nia workspace.
- Verify the repo appears in your Nia resources list; otherwise scoped queries will fail.

**Actions:**

- search relevant symbols/routes/paths
- read top matches
- cite exact file paths and specific functions/components

**If Nia cannot find evidence:**

- say so explicitly
- fall back to `rg` + direct file reads (show commands or paths checked)

**Examples (repo-scoped):**

```ts
mcp__nia__search({
  query: "Where is auth handled?",
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

### Context7 (default for third-party APIs)

**Use when:**

- any third-party library/framework/API surface is involved

**Actions:**

- resolve library ID
- query docs for the exact API

**If Context7 is unavailable:**

- consult upstream docs
- state assumptions explicitly

## Routing Rules (Deterministic)

Load rulebooks before editing files in their domain.

- **General workflow / AL-### / CI gates / labels:** `rules/general.md`
- **Frontend UI/components/styling/UX:** `rules/frontend.md`
- **Backend/Supabase/auth/data access/migrations:** `rules/backend.md`
- **Testing/Playwright/a11y/perf gates:** `rules/testing.md`
- **shadcn/studio MCP workflows (/cui, /rui, /iui, /ftc):** `rules/shadcn-studio-mcp.md` (only when running those workflows)

## Skill Routing (Deterministic)

Load the skill(s) below when the trigger matches.

- **Next.js App Router structure, rendering, data fetching:** `skills/nextjs-app-router/SKILL.md`
- **Cache Components / PPR / cacheTag & invalidation:** `skills/cache-components/SKILL.md`
- **React component design/refactor:** `skills/react-component-dev/SKILL.md`
- **shadcn/ui system usage:** `skills/moai-library-shadcn/SKILL.md`
- **Motion animations (`motion/react`):** `skills/motion/SKILL.md`
- **Recharts:** `skills/rechart/SKILL.md`
- **TanStack Table v8:** `skills/tanstack-table/SKILL.md`
- **GitHub issue/PR workflows (AL-###):**
  - Write issue: `skills/write-issue/SKILL.md`
  - Start issue: `skills/start-issue/SKILL.md`
  - Ship issue: `skills/ship-issue/SKILL.md`
  - Close issue: `skills/close-issue/SKILL.md`
  - Create issues batch: `skills/create-issues/SKILL.md`
- **Commit message creation:** `skills/commit/SKILL.md`

## Output Requirements

- Prefer minimal, surgical diffs
- Always show exact file paths changed
- If behavior changes, update docs and include a quick verification step (commands or steps)
- If making a multi-file change, summarize the blast radius (modules/files impacted)

## Quality Gate (Required)

- Do not include secrets, tokens, or credentials in docs.
- Do not allow conflicting instructions across rulebooks; reconcile and document the single source of truth.
- Every rules/skill/workflow doc must include: triggers, workflow steps, and a checklist. Update the doc if any section is missing.

## Checklists

### Routing checklist

- [ ] Identified domain(s) and opened the matching rulebook(s)
- [ ] Applied required skills based on triggers
- [ ] Used Nia or Context7 when required (or explicitly noted fallback)
- [ ] Nia tool calls are repo-scoped to `Asymmetric-al/core`

### Response checklist

- [ ] File paths are explicit
- [ ] Behavior changes include verification steps
- [ ] Blast radius summarized for multi-file edits

## Minimal examples

- **"Where is auth handled?"** -> Use Nia scoped to `Asymmetric-al/core` to find auth entry points; then open `rules/backend.md`.
- **"Add a new UI card component."** -> Open `rules/frontend.md` and `skills/react-component-dev/SKILL.md`.
- **"Use /cui for a page."** -> Open `rules/shadcn-studio-mcp.md` and follow its workflow exactly.

## Common mistakes / pitfalls

- Skipping Nia on multi-file or architecture questions
- Running unscoped Nia searches outside `Asymmetric-al/core`
- Using shadcn/studio tools without `rules/shadcn-studio-mcp.md`
- Mixing rulebooks with conflicting instructions instead of reconciling them
- Forgetting to update docs after behavior changes
