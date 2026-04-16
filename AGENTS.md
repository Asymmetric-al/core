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
5. **MCP runtime facts:** e.g. Next.js devtools MCP against a running dev server (see **Next.js MCP (devtools)** below), TanStack MCP from root `.mcp.json`, plus any other MCP servers enabled in the agent.
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
  - Use it to choose accurate "Stack" tags + keywords for Nia queries.
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

#### Default workflow (do not stop at snippets)

1. Search (scoped + preambled when using `mcp__nia__search`).
2. Read full sources on the best matches (`nia_read`, or local file reads).
3. Grep exact identifiers when needed (`nia_grep` or `rg`).
4. Edit only after evidence.

#### Pre-indexed docs and packages

- Prefer subscribed or indexed documentation and package sources when available (reduces stale answers).
- If an important upstream doc set is missing from your Nia workspace, subscribe or index it before relying on memory.
- For public package implementation details, use Nia package search for the **exact** dependency version from the nearest `package.json`.

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

### TanStack MCP

Root `.mcp.json` also defines the TanStack CLI MCP (`@tanstack/cli mcp`). Enable it in your agent when working on TanStack Query / Router / related surfaces.

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

---

## Skill Routing (Deterministic)

Load the skill(s) below when the trigger matches. Canonical skill source is `docs/ai/skills/`; run `bun run skills:sync` to refresh mirrors under `.cursor/skills/` and `.agents/skills/`.

**Supabase and Supabase Auth:** For any work touching Supabase products (database, Auth, Storage, Realtime, Edge Functions, CLI, MCP, RLS, migrations), load **`docs/ai/skills/supabase/SKILL.md`** first. For Next.js App Router auth integration specifically, also use **`docs/ai/skills/nextjs-supabase-auth/SKILL.md`**. For Postgres query/schema/RLS performance, use **`docs/ai/skills/supabase-postgres-best-practices/SKILL.md`**.

**Keeping ecosystem skills current:** **`skills-lock.json`** pins content hashes for skills installed via the Skills CLI (see entries under `skills.*`). To **restore** those installs into `.agents/skills/` from the lockfile: `npx skills experimental_install -y` (this rewrites every skill listed in the lockfile under `.agents/skills/`; prefer `npx skills add <pkg> -y` for targeted updates). To **pull newer upstream** content: `npx skills add supabase/agent-skills -y` (updates the lockfile), then `bun run skills:refresh-upstream`, reconcile any **This repository** / workflow sections in `docs/ai/skills/supabase/SKILL.md` and `docs/ai/skills/supabase-postgres-best-practices/SKILL.md` if the vendor copy overwrote them, then `bun run skills:sync` and `bun run skills:verify`. Apply the same pattern for other vendored packages by extending `scripts/refresh-upstream-skills.mjs`.

- **Next.js App Router structure, rendering, data fetching:** `docs/ai/skills/nextjs-app-router/SKILL.md`
- **Cache Components / PPR / cacheTag & invalidation:** `docs/ai/skills/cache-components/SKILL.md`
- **React component design/refactor:** `docs/ai/skills/react-component-dev/SKILL.md`
- **Million React Doctor / performance & health audits (`millionco/react-doctor`):** `docs/ai/skills/react-doctor/SKILL.md`
- **Composable, accessible UI components (components.build spec):** `docs/ai/skills/components-build/SKILL.md`
- **shadcn/ui system usage:** `docs/ai/skills/moai-library-shadcn/SKILL.md`
- **Base UI:** `docs/ai/skills/base-ui/SKILL.md`
- **Motion animations (`motion/react`):** `docs/ai/skills/motion/SKILL.md`
- **Tasteful UI animation (timing, easing, CSS/Motion patterns):** `docs/ai/skills/anim/SKILL.md`
- **UI polish, animation craft, design engineering (Emil Kowalski patterns):** `docs/ai/skills/emil-design-eng/SKILL.md`
- **Recharts:** `docs/ai/skills/rechart/SKILL.md`
- **TanStack Table v8:** `docs/ai/skills/tanstack-table/SKILL.md`
- **Tiptap rich text editor (`@tiptap/*`, shared editor in `@asym/ui`):** `docs/ai/skills/tiptap/SKILL.md`
- **Supabase (platform-wide: Auth, DB API, Storage, Realtime, Edge Functions, CLI, MCP, RLS, migrations):** `docs/ai/skills/supabase/SKILL.md`
- **Supabase Postgres tuning / query patterns:** `docs/ai/skills/supabase-postgres-best-practices/SKILL.md`
- **Next.js + Supabase Auth integration:** `docs/ai/skills/nextjs-supabase-auth/SKILL.md`
- **Vercel React + Next performance patterns:** `docs/ai/skills/vercel-react-best-practices/SKILL.md`
- **React View Transitions + Next.js route / shared-element continuity:** `docs/ai/skills/vercel-react-view-transitions/SKILL.md`
- **Discover/install agent skills (skills.sh, repo canonical skills):** `docs/ai/skills/find-skills/SKILL.md`
- **Commit message creation:** `docs/ai/skills/commit/SKILL.md`

**GitHub `AL-###` issue/PR workflow:** there are no `SKILL.md` files under `docs/ai/skills/` for those flows today; follow `docs/ai/rules/general.md`. Deprecated stubs live under `skills/*/DEPRECATED.md` only.

**Extra Cursor-packaged skills:** additional `SKILL.md` files under `.cursor/skills/` (e.g. Playwright, Stripe, Turborepo) may be present; use them when the task matches their descriptions.

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

| Service        | Port                                    | Start command            |
| -------------- | --------------------------------------- | ------------------------ |
| Donor app      | 3000                                    | `bun run dev:donor`      |
| Admin app      | 3030                                    | `bun run dev:admin`      |
| Missionary app | 4000                                    | `bun run dev:missionary` |
| Local Supabase | 54321 (API), 54322 (DB), 54323 (Studio) | `supabase start`         |

### Local Supabase startup

Docker and Supabase CLI must be installed and running before starting local Supabase. After Docker is running (`sudo dockerd &`), run `supabase start` from the repo root.

**Known issue**: Migration `20260214090000_foundation_1_schema.sql` uses `LOCK TABLE` outside a transaction block, which fails with the Supabase CLI. Later migrations also have dependency chains that require the foundation schema. Workaround:

1. Move **all** `2026*` migrations and `seed.sql` out: `mkdir -p /tmp/supabase_mig_staging && for f in supabase/migrations/2026*.sql; do mv "$f" /tmp/supabase_mig_staging/; done && mv supabase/seed.sql /tmp/`
2. Run `supabase start` (applies only the init migration `20250101000000`)
3. Restore all moved files back
4. Apply foundation migration: `docker exec -i supabase_db_asymmetrical-platform psql -U postgres -d postgres --single-transaction < supabase/migrations/20260214090000_foundation_1_schema.sql`
5. Record it in the migration table: `docker exec -i supabase_db_asymmetrical-platform psql -U postgres -d postgres -c "INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('20260214090000');"`
6. Apply remaining migrations in order (without `--single-transaction` for those with explicit `BEGIN`/`COMMIT`); record each version in `supabase_migrations.schema_migrations`
7. **Note**: Migration `20260226113000_authz_memberships_foundation.sql` has an index expression (`COALESCE(staff_role::text, '')`) that Postgres rejects as non-IMMUTABLE. Create the `authz` schema, types, table, and functions manually (see the migration SQL for definitions), skipping the problematic index expression.
8. Apply seed: `docker exec -i supabase_db_asymmetrical-platform psql -U postgres -d postgres < supabase/seed.sql` (use without `--single-transaction` since the seed contains its own `BEGIN`/`COMMIT`)

### Environment variables

The `.env.local` file at the repo root must be symlinked into each app directory for Next.js to pick it up:

```
ln -sf ../../.env.local apps/donor/.env.local
ln -sf ../../.env.local apps/admin/.env.local
ln -sf ../../.env.local apps/missionary/.env.local
```

Minimum required env vars for local dev (from `supabase status -o env`):

- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase status>`
- `SKIP_ENV_VALIDATION=1` (bypasses strict env schema validation when optional keys like Stripe/Sentry are not set)

### Checks

Standard commands documented in `AGENTS.md` monorepo rules section:

- Lint: `bun run lint`
- Typecheck: `bun run typecheck`
- Unit tests: `bun run test:unit`
- All checks: `bun run check`

<!-- NEXT-AGENTS-MD-START -->[Next.js Docs Index]|root: ./.next-docs|STOP. What you remember about Next.js is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: npx @next/codemod agents-md --output AGENTS.md|01-app/01-getting-started:{01-installation.mdx,02-project-structure.mdx,03-layouts-and-pages.mdx,04-linking-and-navigating.mdx,05-server-and-client-components.mdx,06-cache-components.mdx,07-fetching-data.mdx,08-updating-data.mdx,09-caching-and-revalidating.mdx,10-error-handling.mdx,11-css.mdx,12-images.mdx,13-fonts.mdx,14-metadata-and-og-images.mdx,15-route-handlers.mdx,16-proxy.mdx,17-deploying.mdx,18-upgrading.mdx}|01-app/02-guides:{analytics.mdx,authentication.mdx,backend-for-frontend.mdx,caching.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,data-security.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,json-ld.mdx,lazy-loading.mdx,local-development.mdx,mcp.mdx,mdx.mdx,memory-usage.mdx,multi-tenant.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,prefetching.mdx,production-checklist.mdx,progressive-web-apps.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,single-page-applications.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx,videos.mdx}|01-app/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|01-app/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|01-app/02-guides/upgrading:{codemods.mdx,version-14.mdx,version-15.mdx,version-16.mdx}|01-app/03-api-reference:{07-edge.mdx,08-turbopack.mdx}|01-app/03-api-reference/01-directives:{use-cache-private.mdx,use-cache-remote.mdx,use-cache.mdx,use-client.mdx,use-server.mdx}|01-app/03-api-reference/02-components:{font.mdx,form.mdx,image.mdx,link.mdx,script.mdx}|01-app/03-api-reference/03-file-conventions/01-metadata:{app-icons.mdx,manifest.mdx,opengraph-image.mdx,robots.mdx,sitemap.mdx}|01-app/03-api-reference/03-file-conventions:{default.mdx,dynamic-routes.mdx,error.mdx,forbidden.mdx,instrumentation-client.mdx,instrumentation.mdx,intercepting-routes.mdx,layout.mdx,loading.mdx,mdx-components.mdx,not-found.mdx,page.mdx,parallel-routes.mdx,proxy.mdx,public-folder.mdx,route-groups.mdx,route-segment-config.mdx,route.mdx,src-folder.mdx,template.mdx,unauthorized.mdx}|01-app/03-api-reference/04-functions:{after.mdx,cacheLife.mdx,cacheTag.mdx,connection.mdx,cookies.mdx,draft-mode.mdx,fetch.mdx,forbidden.mdx,generate-image-metadata.mdx,generate-metadata.mdx,generate-sitemaps.mdx,generate-static-params.mdx,generate-viewport.mdx,headers.mdx,image-response.mdx,next-request.mdx,next-response.mdx,not-found.mdx,permanentRedirect.mdx,redirect.mdx,refresh.mdx,revalidatePath.mdx,revalidateTag.mdx,unauthorized.mdx,unstable_cache.mdx,unstable_noStore.mdx,unstable_rethrow.mdx,updateTag.mdx,use-link-status.mdx,use-params.mdx,use-pathname.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,use-selected-layout-segment.mdx,use-selected-layout-segments.mdx,userAgent.mdx}|01-app/03-api-reference/05-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,appDir.mdx,assetPrefix.mdx,authInterrupts.mdx,basePath.mdx,browserDebugInfoInTerminal.mdx,cacheComponents.mdx,cacheHandlers.mdx,cacheLife.mdx,compress.mdx,crossOrigin.mdx,cssChunking.mdx,devIndicators.mdx,distDir.mdx,env.mdx,expireTime.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,htmlLimitedBots.mdx,httpAgentOptions.mdx,images.mdx,incrementalCacheHandlerPath.mdx,inlineCss.mdx,isolatedDevBuild.mdx,logging.mdx,mdxRs.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactCompiler.mdx,reactMaxHeadersLength.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,sassOptions.mdx,serverActions.mdx,serverComponentsHmrCache.mdx,serverExternalPackages.mdx,staleTimes.mdx,staticGeneration.mdx,taint.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,turbopackFileSystemCache.mdx,typedRoutes.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,viewTransition.mdx,webVitalsAttribution.mdx,webpack.mdx}|01-app/03-api-reference/05-config:{02-typescript.mdx,03-eslint.mdx}|01-app/03-api-reference/06-cli:{create-next-app.mdx,next.mdx}|02-pages/01-getting-started:{01-installation.mdx,02-project-structure.mdx,04-images.mdx,05-fonts.mdx,06-css.mdx,11-deploying.mdx}|02-pages/02-guides:{analytics.mdx,authentication.mdx,babel.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,lazy-loading.mdx,mdx.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,post-css.mdx,preview-mode.mdx,production-checklist.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx}|02-pages/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|02-pages/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|02-pages/02-guides/upgrading:{codemods.mdx,version-10.mdx,version-11.mdx,version-12.mdx,version-13.mdx,version-14.mdx,version-9.mdx}|02-pages/03-building-your-application/01-routing:{01-pages-and-layouts.mdx,02-dynamic-routes.mdx,03-linking-and-navigating.mdx,05-custom-app.mdx,06-custom-document.mdx,07-api-routes.mdx,08-custom-error.mdx}|02-pages/03-building-your-application/02-rendering:{01-server-side-rendering.mdx,02-static-site-generation.mdx,04-automatic-static-optimization.mdx,05-client-side-rendering.mdx}|02-pages/03-building-your-application/03-data-fetching:{01-get-static-props.mdx,02-get-static-paths.mdx,03-forms-and-mutations.mdx,03-get-server-side-props.mdx,05-client-side.mdx}|02-pages/03-building-your-application/06-configuring:{12-error-handling.mdx}|02-pages/04-api-reference:{06-edge.mdx,08-turbopack.mdx}|02-pages/04-api-reference/01-components:{font.mdx,form.mdx,head.mdx,image-legacy.mdx,image.mdx,link.mdx,script.mdx}|02-pages/04-api-reference/02-file-conventions:{instrumentation.mdx,proxy.mdx,public-folder.mdx,src-folder.mdx}|02-pages/04-api-reference/03-functions:{get-initial-props.mdx,get-server-side-props.mdx,get-static-paths.mdx,get-static-props.mdx,next-request.mdx,next-response.mdx,use-report-web-vitals.mdx,use-router.mdx,userAgent.mdx}|02-pages/04-api-reference/04-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,assetPrefix.mdx,basePath.mdx,bundlePagesRouterDependencies.mdx,compress.mdx,crossOrigin.mdx,devIndicators.mdx,distDir.mdx,env.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,httpAgentOptions.mdx,images.mdx,isolatedDevBuild.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,serverExternalPackages.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,webVitalsAttribution.mdx,webpack.mdx}|02-pages/04-api-reference/04-config:{01-typescript.mdx,02-eslint.mdx}|02-pages/04-api-reference/05-cli:{create-next-app.mdx,next.mdx}|03-architecture:{accessibility.mdx,fast-refresh.mdx,nextjs-compiler.mdx,supported-browsers.mdx}|04-community:{01-contribution-guide.mdx,02-rspack.mdx}<!-- NEXT-AGENTS-MD-END -->
