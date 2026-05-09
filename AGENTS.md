<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated. The docs are the source of truth.

<!-- END:nextjs-agent-rules -->

## Agent compatibility

- `AGENTS.md` is the repo-wide entrypoint for Cursor, Claude Code (via `CLAUDE.md`), Copilot (via `.github/copilot-instructions.md`), and other agents that read it.
- `CLAUDE.md` must contain only `@AGENTS.md` so Claude Code imports the exact same rules.
- Keep both generated marker regions intact:
  - `<!-- BEGIN:nextjs-agent-rules --> ... <!-- END:nextjs-agent-rules -->`
  - `<!-- NEXT-AGENTS-MD-START --> ... <!-- NEXT-AGENTS-MD-END -->`

## Source-of-truth order

Use this order when instructions conflict:

1. **OpenSpec (when `openspec/` exists in the repo):** `openspec/specs/` = merged product intent; `openspec/changes/` = proposed changes not yet folded into specs.
2. **Repo instruction system:** root `AGENTS.md`, nearest nested `AGENTS.md`, `.cursor/rules`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.github/instructions/*.md`, `docs/ai/*` rulebooks.
3. **Repo-local canonical skills:** `docs/ai/skills/*/SKILL.md` (mirrored into `.cursor/skills/` and `.agents/skills/` via `bun run skills:sync`; verify with `bun run skills:verify`).
4. **Next.js API truth:** bundled docs under `node_modules/next/dist/docs/` for the installed version (then repo root `node_modules`; see **Next.js docs source of truth** below).
5. **MCP/runtime and official CLI facts:** e.g. Next.js devtools MCP against a running dev server (see **Next.js MCP (devtools)** below), official TanStack CLI/Intent output for TanStack work, plus any other MCP servers enabled in the agent.
6. **External docs:** prefer indexed doc search / package source (e.g. Nia) over training data; use direct official docs when needed.
7. **General model knowledge:** lowest priority; never substitute memory for version-specific or repo-specific facts.

## Nested `AGENTS.md` (this repo)

Cursor and other tools merge nested agent instructions with the root file. In this workspace, use:

- `supabase/AGENTS.md` — migrations, seed, demo RLS posture
- `scripts/AGENTS.md` — operational scripts that touch Supabase data

# Agent Router — Rules

**Name:** `agents-router`  
**Purpose:** Single routing/index for rules and skills in this repo. Use it to decide which docs to load and which tools to use before editing.  
This file is the deterministic entry point for all agent work in `core`.

**Applies when:** Any task inside this repo.  
**Do not use when:** Working outside this repo or doing general, non-repo conversation.

---

## Tooling (Required)

### Nia (MCP) usage: always repo-scoped + always preambled

Canonical Nia workflow, setup, and operation boundaries live in `docs/ai/nia.md`.

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
- Keep Nia credentials in your user/global MCP config or environment. The committed `.mcp.json` files intentionally do not include Nia because MCP JSON commonly requires literal headers/secrets.

#### Required helper docs (must exist, must be used)

- `docs/ai/stack-registry.md`
  - Canonical list of languages/frameworks/SDKs used in this repo.
  - Use it to choose accurate "Stack" tags + keywords for Nia queries.
- `docs/ai/working-set.md`
  - Living task context for the current work.
  - Keep it updated during the task when edits are allowed.
  - Use it to build the Nia query preamble for every Nia search.
  - Start from `docs/ai/working-set.example.md` on a clean clone if needed.

`docs/ai/working-set.md` is local agent scratch context and is ignored by git. If it is missing or stale and edits are allowed, create/update it before major work. In read-only or plan mode, build the preamble from the available task context and say that the working-set update was skipped because edits were not allowed.

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

- Put this preamble at the top of the `query` string for Nia `search` / `mcp__nia__search` calls.
- Do not shove the preamble into `pattern` for grep calls. Keep grep patterns tight and exact.
- Always read the top matches before editing. Cite exact file paths and functions/components.
- Nia MCP tool namespaces differ by client. Prefer the live tool names exposed by your client; examples below use Cursor-style names where helpful.

#### Actions

- search relevant symbols/routes/paths
- read top matches
- cite exact file paths and specific functions/components

#### Default workflow (do not stop at snippets)

1. Search (scoped + preambled when using Nia `search` / `mcp__nia__search`).
2. Read full sources on the best matches (`nia_read`, or local file reads).
3. Grep exact identifiers when needed (`nia_grep` or `rg`).
4. Edit only after evidence.

#### Pre-indexed docs and packages

- Prefer subscribed or indexed documentation and package sources when available (reduces stale answers).
- If an important upstream doc set is missing from your Nia workspace, prefer `manage_resource(action="subscribe")` for a pre-indexed source; use `index` only when no subscribed/global source is available and mutation is allowed.
- For public package implementation details, use Nia package search for the **exact** dependency version from the nearest `package.json`.
- For public GitHub one-offs that should not be indexed, use Tracer. For broader discovery, use `nia_research`; then run a scoped pass back inside `Asymmetric-al/core` before editing this repo.

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

### Context7 (optional third-party API lookup)

**When the agent has Context7 configured:**

- Use for quick third-party library / API surface questions (resolve library ID, query the exact API).

**If Context7 is unavailable:**

- Prefer Nia documentation / package search for dependencies actually declared in this repo
- Otherwise consult upstream docs and state assumptions explicitly

---

## Next.js MCP (devtools)

This repo configures the Next.js devtools MCP server in **root** `.mcp.json` (also mirrored to `.cursor/mcp.json` for Cursor).

- **Requirement:** Next.js 16+ dev server running (e.g. `bun run dev:donor`). The MCP client connects to the app’s `/_next/mcp` endpoint via `next-devtools-mcp`.
- **Use it for runtime-grounded work:** current errors, dev logs, routes, page metadata, server actions — **do not guess** these when the MCP tools can query the live dev server.
- **Docs:** [Next.js MCP guide](https://nextjs.org/docs/app/guides/mcp) and the [`next-devtools-mcp` repository](https://github.com/vercel/next-devtools-mcp).

### TanStack CLI and Intent

For any TanStack work (Query, Router, Table, DB, Form, Virtual, Start, CLI, Intent, Devtools, or related integrations), use the official TanStack CLI and official TanStack Intent skills when they exist for the installed packages. Do not use repo-local or unofficial TanStack skills.

- Install/verify the official CLI with `npm install -g @tanstack/cli` (Node.js 18+ required). Use direct `npm`, `npx`, and `tanstack` commands so the workflow works on Windows and macOS.
- Use CLI JSON output for agent-safe TanStack discovery and docs, for example `tanstack libraries --json`, `tanstack doc <library> <path> --json`, and `tanstack search-docs "<query>" --library <id> --framework <name> --json`.
- Do **not** use `@tanstack/cli mcp` / `tanstack mcp`; the official CLI removed that command. Use direct CLI commands instead.
- Before TanStack work, run `npx --yes @tanstack/intent@latest list` (`npx @tanstack/intent@latest list` is fine in interactive shells); that current command output is the authority for which installed packages expose Intent skills.
- Load Intent skills only for packages returned by the current list command: `npx --yes @tanstack/intent@latest load <package>#<skill>`.
- Intent coverage is not exhaustive. For TanStack packages not returned by the current Intent list (for example, Query/Table/Router when absent), continue using `tanstack doc`, `tanstack search-docs`, and the repo guidance in `docs/guides/development/tanstack-integration.md` and `docs/guides/development/tanstack-virtual-foundation.md`.
- For table-like UI, preserve the repo-specific shared abstractions documented in those guides: prefer `DataTableResponsive` from `@asym/ui/components/shadcn/data-table` when appropriate, reuse shared table virtualization helpers/types from `packages/ui/components/shadcn/data-table`, and keep accessibility expectations from `docs/ai/rules/frontend.md` and the virtual foundation testing checklist discoverable.

### Dev servers and logs

- Before starting a dev server, check whether one is already running (agent terminal sessions / process list).
- When a Next.js dev server is running, prefer Next.js devtools MCP (`get_errors`, `get_logs`, `get_routes`, `get_page_metadata`, etc.) over guessing routes, runtime errors, or browser-only state.

---

## Routing Rules (Deterministic)

Load rulebooks before editing files in their domain.

- **General workflow / AL-### / CI gates / labels:** `docs/ai/rules/general.md`
- **Frontend UI/components/styling/UX:** `docs/ai/rules/frontend.md`
- **Backend/Supabase/auth/data access/migrations:** `docs/ai/rules/backend.md`
- **When touching API routes or data access patterns:** `docs/guides/architecture/data-access-boundary.md`
- **Testing/Playwright/a11y/perf gates:** `docs/ai/rules/testing.md`
- **TypeScript config / TS 6–7 prep (no version bump):** `docs/ai/rules/typescript-future-proofing.md` and `docs/guides/typescript-6-readiness.md`
- **shadcn/studio MCP workflows (/cui, /rui, /iui, /ftc):** `docs/ai/rules/shadcn-studio-mcp.md` (only when running those workflows)
- **Async QA Foreman mode / grind-style verification:** `docs/ai/rules/async-qa-foreman.md` when the user requests Async QA Foreman mode, grind-style completion pressure, background QA, long-running verification, or a second agent to challenge quality and keep the main agent working.
- **OpenSpec alignment / prompt intent guard:** `docs/ai/rules/openspec-guardian.md` when the user asks for OpenSpec alignment, prompt-intent checking, scope-drift prevention, spec-grounded review, or a background agent to keep implementation aligned with the original request and OpenSpec.

---

## Skill Routing (Deterministic)

Load the skill(s) below when the trigger matches. Canonical skill source is `docs/ai/skills/`; run `bun run skills:sync` to refresh mirrors under `.cursor/skills/` and `.agents/skills/`.

- **Repo entry / instruction map (default orientation for repo work):** `docs/ai/skills/repo-entry/SKILL.md`

**Supabase and Supabase Auth:** For any work touching Supabase products (database, Auth, Storage, Realtime, Edge Functions, CLI, MCP, RLS, migrations), load **`docs/ai/skills/supabase/SKILL.md`** first. For Next.js App Router auth integration specifically, also use **`docs/ai/skills/nextjs-supabase-auth/SKILL.md`**. For Postgres query/schema/RLS performance, use **`docs/ai/skills/supabase-postgres-best-practices/SKILL.md`**.

**Keeping ecosystem skills current:** **`skills-lock.json`** pins content hashes for skills installed via the Skills CLI (see entries under `skills.*`). To **restore** those installs into `.agents/skills/` from the lockfile: `npx skills experimental_install -y` (this rewrites every skill listed in the lockfile under `.agents/skills/`; prefer `npx skills add <pkg> -y` for targeted updates). To **pull newer upstream** content: `npx skills add supabase/agent-skills -y` (updates the lockfile), then `bun run skills:refresh-upstream`, reconcile any **This repository** / workflow sections in `docs/ai/skills/supabase/SKILL.md` and `docs/ai/skills/supabase-postgres-best-practices/SKILL.md` if the vendor copy overwrote them, then `bun run skills:sync` and `bun run skills:verify`. **`npm-deps-cleanup`** (`anthonyshew/dotfiles`): `npx skills add anthonyshew/dotfiles -y`, then `bun run skills:refresh-upstream` → `skills:sync` / `skills:verify` (see `docs/ai/skills/npm-deps-cleanup/references/upstream.md`). **`emil-design-engineering`** is not in `skills-lock.json`; refresh it with the animations.dev installer into `~/.cursor/skills/`, then the same `skills:refresh-upstream` → `skills:sync` / `skills:verify` loop (see root `README.md`). Apply the same pattern for other vendored packages by extending `scripts/refresh-upstream-skills.mjs`. **Resend CLI** (`docs/ai/skills/resend-cli/`) is vendored from the tagged [`resend/resend-cli`](https://github.com/resend/resend-cli) tree (`skills/resend-cli/`); refresh steps live in `docs/ai/skills/resend-cli/references/upstream.md` — it is **not** updated by `bun run skills:refresh-upstream` today.

- **Next.js App Router structure, rendering, data fetching:** `docs/ai/skills/nextjs-app-router/SKILL.md`
- **Cache Components / PPR / cacheTag & invalidation:** `docs/ai/skills/cache-components/SKILL.md`
- **React component design/refactor:** `docs/ai/skills/react-component-dev/SKILL.md`
- **Million React Doctor / performance & health audits (`millionco/react-doctor`):** `docs/ai/skills/react-doctor/SKILL.md`
- **Composable, accessible UI components (components.build spec):** `docs/ai/skills/components-build/SKILL.md`
- **shadcn/ui system usage:** `docs/ai/skills/moai-library-shadcn/SKILL.md`
- **Base UI:** `docs/ai/skills/base-ui/SKILL.md`
- **Animation work, transitions, micro-interactions, or motion polish:** load `docs/ai/skills/emil-design-engineering/SKILL.md` first. Pair with `docs/ai/skills/motion/SKILL.md` only when `motion/react` API details are needed.
- **Motion animations (`motion/react`) implementation details:** `docs/ai/skills/motion/SKILL.md`
- **Tasteful UI animation (timing, easing, CSS/Motion patterns):** `docs/ai/skills/anim/SKILL.md`
- **Additional Emil design-engineering notes / companion reference:** `docs/ai/skills/emil-design-eng/SKILL.md`
- **Recharts:** `docs/ai/skills/rechart/SKILL.md`
- **TanStack work:** use the official TanStack CLI plus current official Intent skills when `npx --yes @tanstack/intent@latest list` returns a matching package; otherwise use `tanstack doc` / `tanstack search-docs` and the repo-specific TanStack guides linked in **TanStack CLI and Intent** above.
- **Tiptap rich text editor (`@tiptap/*`, shared editor in `@asym/ui`):** `docs/ai/skills/tiptap/SKILL.md`
- **npm / pnpm / Yarn / Bun dependency footprint cleanup (unused deps, dedupe, lockfile closure, e18e):** `docs/ai/skills/npm-deps-cleanup/SKILL.md`
- **Resend CLI (`resend` binary, shell, scripts, CI/CD, non-interactive flags):** `docs/ai/skills/resend-cli/SKILL.md` (not the same as SDK or tenant app integration; see `docs/guides/features/resend-integration.md` for product email routes and UI)
- **Supabase (platform-wide: Auth, DB API, Storage, Realtime, Edge Functions, CLI, MCP, RLS, migrations):** `docs/ai/skills/supabase/SKILL.md`
- **Supabase Postgres tuning / query patterns:** `docs/ai/skills/supabase-postgres-best-practices/SKILL.md`
- **Next.js + Supabase Auth integration:** `docs/ai/skills/nextjs-supabase-auth/SKILL.md`
- **Vercel React + Next performance patterns:** `docs/ai/skills/vercel-react-best-practices/SKILL.md`
- **React View Transitions + Next.js route / shared-element continuity:** `docs/ai/skills/vercel-react-view-transitions/SKILL.md`
- **Discover/install agent skills (skills.sh, repo canonical skills):** `docs/ai/skills/find-skills/SKILL.md`
- **Commit message creation:** `docs/ai/skills/commit/SKILL.md`

**GitHub `AL-###` issue/PR workflow:** there are no `SKILL.md` files under `docs/ai/skills/` for those flows today; follow `docs/ai/rules/general.md`. Deprecated stubs live under `skills/*/DEPRECATED.md` only.

**Extra Cursor-packaged skills:** optional mirror-only ecosystem installs under **`.agents/skills/<name>/`** and **`.cursor/skills/<name>/`**. These are not canonical repo skills unless promoted into **`docs/ai/skills/<name>/`**. Refresh them with the Skills CLI or documented vendor source, then run `bun run skills:sync` and `bun run skills:verify`. Pins and hashes live in **`skills-lock.json`**. These stay **subordinate to OpenSpec** (`openspec/specs/**`, `openspec/changes/**`, `openspec/project.md`) and canonical **`docs/ai/skills/`** — see **`openspec/specs/agent-instruction-system/spec.md`**.

**Mattpocock pack** ([github.com/mattpocock/skills](https://github.com/mattpocock/skills)) — paths under `.cursor/skills/`:

| Id                                            | Notes                                                                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **setup-matt-pocock-skills**                  | Bootstrap agent-docs layout for other mattpocock skills.                                                               |
| **grill-with-docs**                           | Grill plan vs CONTEXT/ADRs (`ADR-FORMAT.md`, `CONTEXT-FORMAT.md`).                                                     |
| **grill-me**                                  | Grill without docs; preserves upstream first-person wording, where "me" means the user being interviewed by the agent. |
| **diagnose**                                  | Ranked hypotheses for bugs.                                                                                            |
| **zoom-out**                                  | Module/caller map.                                                                                                     |
| **to-prd**                                    | PRD from context ([skills.sh/to-prd](https://skills.sh/mattpocock/skills/to-prd)); align PRD content with OpenSpec.    |
| **to-issues**                                 | PRD → issues (**skills.sh “prd-to-issues”** naming maps here).                                                         |
| **improve-codebase-architecture**             | Architecture deepening.                                                                                                |
| **tdd**                                       | Red-green-refactor + references.                                                                                       |
| **qa**, **request-refactor-plan**             | Vendored from upstream **`skills/deprecated/`** (not on default CLI list).                                             |
| **setup-pre-commit**, **migrate-to-shoehorn** | Vendored from **`skills/misc/`**.                                                                                      |
| **ubiquitous-language**                       | DDD glossary; vendored from **`skills/deprecated/`** (CLI does not expose `--skill ubiquitous-language`).              |
| **domain-model**                              | Repo-local **alias** → load **`ubiquitous-language`**.                                                                 |
| **prd-to-plan**                               | No upstream skill id; repo-local **router** (`prd-to-plan/SKILL.md`) → use **to-prd**, **to-issues**, OpenSpec.        |
| **write-a-prd**                               | Same as **to-prd** (CLI/skill name).                                                                                   |

**Names not in upstream:** **`domain-model`** (use alias), **`prd-to-issues`** (use **to-issues**), **`write-a-prd`** (= **to-prd**), **`prd-to-plan`** (router stub). Distinct from **`docs/ai/skills/`** **`test-driven-development`** where both exist.

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
- [ ] Applied required skills based on triggers (canonical: `docs/ai/skills/`), including **`docs/ai/skills/supabase/SKILL.md`** when the task involves Supabase or Supabase Auth
- [ ] Used Nia when required (or explicitly noted fallback)
- [ ] For Next.js dev debugging, considered Next.js devtools MCP when a dev server is running
- [ ] Nia tool calls are repo-scoped to `Asymmetric-al/core`
- [ ] Nia search calls include the "Nia query preamble" built from `docs/ai/working-set.md` + `docs/ai/stack-registry.md`

### Response checklist

- [ ] File paths are explicit
- [ ] Behavior changes include verification steps
- [ ] Blast radius summarized for multi-file edits

---

## Minimal examples

- **"Where is auth handled?"** -> Update `docs/ai/working-set.md`; use Nia (scoped + preambled) to find auth entry points; then open `docs/ai/rules/backend.md`.
- **"Add a new UI card component."** -> Open `docs/ai/rules/frontend.md` and `docs/ai/skills/react-component-dev/SKILL.md`. Use Nia to find existing patterns/components in this repo before writing new ones.
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

---

## Monorepo rules (Bun + Turbo)

- Package manager/runtime: Bun (`bun`, `bunx`)
- Task runner: Turborepo (`turbo`)
- **Turbo + env:** Root `turbo.json` uses **`"envMode": "loose"`** so `turbo run dev` forwards your shell and dotenv vars to Next.js. Turbo 2’s default **strict** mode only passes variables declared under each task’s `env` / `globalEnv`, which hid `SUPABASE_DB_URL`, `PAYLOAD_DATABASE_URI`, demo secrets, etc., from `next dev` even when `.env.local` existed.
- Next.js app paths:
  - `apps/admin` (`@asym/admin`)
  - `apps/donor` (`@asym/donor`)
  - `apps/missionary` (`@asym/missionary-app`)

### Run dev for one app

- `bun run dev:admin`
- `bun run dev:donor`
- `bun run dev:missionary`

Equivalent direct Turbo commands:

- `bunx turbo run dev --filter=@asym/admin`
- `bunx turbo run dev --filter=@asym/donor`
- `bunx turbo run dev --filter=@asym/missionary-app`

### Run checks

Full repo checks:

- `bun run check`
- `bun run lint`
- `bun run typecheck`
- `bun run test:unit`

Scoped checks while working on one app:

- `bunx turbo run lint --filter=@asym/admin`
- `bunx turbo run lint --filter=@asym/donor`
- `bunx turbo run lint --filter=@asym/missionary-app`
- `bunx turbo run typecheck --filter=@asym/admin`
- `bunx turbo run typecheck --filter=@asym/donor`
- `bunx turbo run typecheck --filter=@asym/missionary-app`

Note: unit tests are currently run repo-wide with `bun run test:unit`.

## Next.js docs source of truth

1. Read docs from the nearest matching install for the app you are changing:
   - `apps/<app>/node_modules/next/dist/docs/` (if present)
   - then `node_modules/next/dist/docs/` at repo root
2. This monorepo currently uses `next@16.2.1` across all Next.js apps (root and app `package.json` files; workspace packages align on the same version).
3. **Upstream note:** Next.js 16.2+ docs describe adding the minimal `AGENTS.md` block directly when on `v16.2.0-canary.37` or later; on 16.1.x the `npx @next/codemod@latest agents-md` flow may still emit `.next-docs/` — this repo keeps both bundled `node_modules` docs (when installed) and committed `.next-docs/` for sandboxes.
4. If `node_modules` docs are unavailable or unreadable:
   - run `bunx @next/codemod@canary agents-md`
   - confirm `.next-docs/` exists
   - confirm `AGENTS.md` includes the codemod's compressed docs index
   - use `.next-docs/` for Next.js docs lookup
   - if the generated index text shows `npx @next/codemod agents-md --output AGENTS.md`, use the Bun equivalent in this repo: `bunx @next/codemod@canary agents-md --output AGENTS.md`

`.next-docs/` is committed in this repo to support remote/sandbox agent runs where `node_modules` is not present at session start.

### Official references

- [AI agents / AGENTS.md](https://nextjs.org/docs/app/guides/ai-agents)
- [Next.js MCP](https://nextjs.org/docs/app/guides/mcp)
- [Upgrading to version 16](https://nextjs.org/docs/app/guides/upgrading/version-16)

## Vercel docs rules

- Use `https://vercel.com/docs/llms-full.txt` for broad Vercel context.
- Use the `.md` versions of Vercel docs pages for specific topics.
- Before work on deploys, build output, domains, logs, edge, or functions, read the relevant Vercel docs first.

## Cursor Cloud specific instructions

### Services overview

| Service                 | Port                                    | Start command                 |
| ----------------------- | --------------------------------------- | ----------------------------- |
| Donor app               | 3000                                    | `bun run dev:donor`           |
| Admin app               | 3030                                    | `bun run dev:admin`           |
| Mission Control (cloud) | 3030                                    | `bun run dev:mission-control` |
| Missionary app          | 4000                                    | `bun run dev:missionary`      |
| Local Supabase          | 54321 (API), 54322 (DB), 54323 (Studio) | `supabase start`              |

### Mission Control Cloud Agent startup

For a fresh Cursor Cloud Agent or disposable VM that needs the Mission Control Dashboard without live Supabase credentials:

```bash
bun run setup:mission-control:cloud
bun run dev:mission-control
```

Then open `http://localhost:3030`. The setup command only writes gitignored `.env.local` defaults (`SKIP_ENV_VALIDATION=1`, `E2E_AUTH_BYPASS=true`, placeholder public Supabase values, `PAYLOAD_SECRET`, and admin Playwright URL/port). Existing explicit `E2E_AUTH_BYPASS=false` values are preserved unless you pass `--force-bypass`. Replace placeholders with real Supabase/demo-account values before testing live auth, hosted data, Payload/CMS, or database-backed admin workflows.

### Local Supabase startup

Docker and Supabase CLI must be installed and running before starting local Supabase. After Docker is running (`sudo dockerd &`), run `supabase start` from the repo root.

**Known issue**: Migration `20260214090000_foundation_1_schema.sql` uses `LOCK TABLE` outside a transaction block, which fails with the Supabase CLI. Later migrations also have dependency chains that require the foundation schema. Workaround:

1. Move **all** `2026*` migrations and `seed.sql` out: `mkdir -p /tmp/supabase_mig_staging && for f in supabase/migrations/2026*.sql; do mv "$f" /tmp/supabase_mig_staging/; done && mv supabase/seed.sql /tmp/`
2. Run `supabase start` (applies only the init migration `20250101000000`)
3. Restore all moved files back: `mv /tmp/supabase_mig_staging/*.sql supabase/migrations/ && mv /tmp/seed.sql supabase/seed.sql`
4. Apply foundation migration: `docker exec -i supabase_db_asymmetrical-platform psql -U postgres -d postgres --single-transaction < supabase/migrations/20260214090000_foundation_1_schema.sql`
5. Record it in the migration table: `docker exec -i supabase_db_asymmetrical-platform psql -U postgres -d postgres -c "INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260214090000');"`
6. Apply remaining migrations in order (without `--single-transaction` for those with explicit `BEGIN`/`COMMIT`); record each version in `supabase_migrations.schema_migrations`
7. **Note**: Migration `20260226113000_authz_memberships_foundation.sql` has an index expression (`COALESCE(staff_role::text, '')`) that Postgres rejects as non-IMMUTABLE. Create the `authz` schema, types, table, and functions manually (see the migration SQL for definitions), skipping the problematic index expression. If that migration file changes, re-derive these manual steps from the file so local state does not silently drift.
8. Apply seed: `docker exec -i supabase_db_asymmetrical-platform psql -U postgres -d postgres < supabase/seed.sql` (use without `--single-transaction` since the seed contains its own `BEGIN`/`COMMIT`)

### Environment variables

Keep secrets in **repo-root** `.env.local` (gitignored). Each app’s `next.config.ts` calls **`loadEnvConfig` from `@next/env`** on the monorepo root so Payload and Next see `SUPABASE_DB_URL`, `PAYLOAD_DATABASE_URI`, etc., without copying files.

Optional (older pattern): symlink root `.env.local` into each app if you rely on tooling that only reads `apps/<app>/.env.local`:

```
ln -sf ../../.env.local apps/donor/.env.local
ln -sf ../../.env.local apps/admin/.env.local
ln -sf ../../.env.local apps/missionary/.env.local
```

Minimum required env vars for local dev (from `supabase status -o env`):

- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase status>`

Optional (local dev and Cursor Cloud sandboxes only; do **not** rely on this in production or shared previews unless you deliberately accept weaker startup checks):

- `SKIP_ENV_VALIDATION=1` — bypasses strict env schema validation when optional keys like Stripe/Sentry are not set (see `packages/env/src/schema.ts`).

### Checks

Standard commands documented in `AGENTS.md` monorepo rules section:

- Lint: `bun run lint`
- Typecheck: `bun run typecheck`
- Unit tests: `bun run test:unit`
- All checks: `bun run check`

<!-- NEXT-AGENTS-MD-START -->[Next.js Docs Index]|root: ./.next-docs|STOP. What you remember about Next.js is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: npx @next/codemod agents-md --output AGENTS.md|01-app/01-getting-started:{01-installation.mdx,02-project-structure.mdx,03-layouts-and-pages.mdx,04-linking-and-navigating.mdx,05-server-and-client-components.mdx,06-cache-components.mdx,07-fetching-data.mdx,08-updating-data.mdx,09-caching-and-revalidating.mdx,10-error-handling.mdx,11-css.mdx,12-images.mdx,13-fonts.mdx,14-metadata-and-og-images.mdx,15-route-handlers.mdx,16-proxy.mdx,17-deploying.mdx,18-upgrading.mdx}|01-app/02-guides:{analytics.mdx,authentication.mdx,backend-for-frontend.mdx,caching.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,data-security.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,json-ld.mdx,lazy-loading.mdx,local-development.mdx,mcp.mdx,mdx.mdx,memory-usage.mdx,multi-tenant.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,prefetching.mdx,production-checklist.mdx,progressive-web-apps.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,single-page-applications.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx,videos.mdx}|01-app/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|01-app/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|01-app/02-guides/upgrading:{codemods.mdx,version-14.mdx,version-15.mdx,version-16.mdx}|01-app/03-api-reference:{07-edge.mdx,08-turbopack.mdx}|01-app/03-api-reference/01-directives:{use-cache-private.mdx,use-cache-remote.mdx,use-cache.mdx,use-client.mdx,use-server.mdx}|01-app/03-api-reference/02-components:{font.mdx,form.mdx,image.mdx,link.mdx,script.mdx}|01-app/03-api-reference/03-file-conventions/01-metadata:{app-icons.mdx,manifest.mdx,opengraph-image.mdx,robots.mdx,sitemap.mdx}|01-app/03-api-reference/03-file-conventions:{default.mdx,dynamic-routes.mdx,error.mdx,forbidden.mdx,instrumentation-client.mdx,instrumentation.mdx,intercepting-routes.mdx,layout.mdx,loading.mdx,mdx-components.mdx,not-found.mdx,page.mdx,parallel-routes.mdx,proxy.mdx,public-folder.mdx,route-groups.mdx,route-segment-config.mdx,route.mdx,src-folder.mdx,template.mdx,unauthorized.mdx}|01-app/03-api-reference/04-functions:{after.mdx,cacheLife.mdx,cacheTag.mdx,connection.mdx,cookies.mdx,draft-mode.mdx,fetch.mdx,forbidden.mdx,generate-image-metadata.mdx,generate-metadata.mdx,generate-sitemaps.mdx,generate-static-params.mdx,generate-viewport.mdx,headers.mdx,image-response.mdx,next-request.mdx,next-response.mdx,not-found.mdx,permanentRedirect.mdx,redirect.mdx,refresh.mdx,revalidatePath.mdx,revalidateTag.mdx,unauthorized.mdx,unstable_cache.mdx,unstable_noStore.mdx,unstable_rethrow.mdx,updateTag.mdx,use-link-status.mdx,use-params.mdx,use-pathname.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,use-selected-layout-segment.mdx,use-selected-layout-segments.mdx,userAgent.mdx}|01-app/03-api-reference/05-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,appDir.mdx,assetPrefix.mdx,authInterrupts.mdx,basePath.mdx,browserDebugInfoInTerminal.mdx,cacheComponents.mdx,cacheHandlers.mdx,cacheLife.mdx,compress.mdx,crossOrigin.mdx,cssChunking.mdx,devIndicators.mdx,distDir.mdx,env.mdx,expireTime.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,htmlLimitedBots.mdx,httpAgentOptions.mdx,images.mdx,incrementalCacheHandlerPath.mdx,inlineCss.mdx,isolatedDevBuild.mdx,logging.mdx,mdxRs.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactCompiler.mdx,reactMaxHeadersLength.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,sassOptions.mdx,serverActions.mdx,serverComponentsHmrCache.mdx,serverExternalPackages.mdx,staleTimes.mdx,staticGeneration.mdx,taint.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,turbopackFileSystemCache.mdx,typedRoutes.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,viewTransition.mdx,webVitalsAttribution.mdx,webpack.mdx}|01-app/03-api-reference/05-config:{02-typescript.mdx,03-eslint.mdx}|01-app/03-api-reference/06-cli:{create-next-app.mdx,next.mdx}|02-pages/01-getting-started:{01-installation.mdx,02-project-structure.mdx,04-images.mdx,05-fonts.mdx,06-css.mdx,11-deploying.mdx}|02-pages/02-guides:{analytics.mdx,authentication.mdx,babel.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,lazy-loading.mdx,mdx.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,post-css.mdx,preview-mode.mdx,production-checklist.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx}|02-pages/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|02-pages/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|02-pages/02-guides/upgrading:{codemods.mdx,version-10.mdx,version-11.mdx,version-12.mdx,version-13.mdx,version-14.mdx,version-9.mdx}|02-pages/03-building-your-application/01-routing:{01-pages-and-layouts.mdx,02-dynamic-routes.mdx,03-linking-and-navigating.mdx,05-custom-app.mdx,06-custom-document.mdx,07-api-routes.mdx,08-custom-error.mdx}|02-pages/03-building-your-application/02-rendering:{01-server-side-rendering.mdx,02-static-site-generation.mdx,04-automatic-static-optimization.mdx,05-client-side-rendering.mdx}|02-pages/03-building-your-application/03-data-fetching:{01-get-static-props.mdx,02-get-static-paths.mdx,03-forms-and-mutations.mdx,03-get-server-side-props.mdx,05-client-side.mdx}|02-pages/03-building-your-application/06-configuring:{12-error-handling.mdx}|02-pages/04-api-reference:{06-edge.mdx,08-turbopack.mdx}|02-pages/04-api-reference/01-components:{font.mdx,form.mdx,head.mdx,image-legacy.mdx,image.mdx,link.mdx,script.mdx}|02-pages/04-api-reference/02-file-conventions:{instrumentation.mdx,proxy.mdx,public-folder.mdx,src-folder.mdx}|02-pages/04-api-reference/03-functions:{get-initial-props.mdx,get-server-side-props.mdx,get-static-paths.mdx,get-static-props.mdx,next-request.mdx,next-response.mdx,use-report-web-vitals.mdx,use-router.mdx,userAgent.mdx}|02-pages/04-api-reference/04-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,assetPrefix.mdx,basePath.mdx,bundlePagesRouterDependencies.mdx,compress.mdx,crossOrigin.mdx,devIndicators.mdx,distDir.mdx,env.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,httpAgentOptions.mdx,images.mdx,isolatedDevBuild.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,serverExternalPackages.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,webVitalsAttribution.mdx,webpack.mdx}|02-pages/04-api-reference/04-config:{01-typescript.mdx,02-eslint.mdx}|02-pages/04-api-reference/05-cli:{create-next-app.mdx,next.mdx}|03-architecture:{accessibility.mdx,fast-refresh.mdx,nextjs-compiler.mdx,supported-browsers.mdx}|04-community:{01-contribution-guide.mdx,02-rspack.mdx}<!-- NEXT-AGENTS-MD-END -->
