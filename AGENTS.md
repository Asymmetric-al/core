<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent compatibility

- `AGENTS.md` is the repo-wide entrypoint for Cursor, Claude Code (via `CLAUDE.md`), Copilot (via `.github/copilot-instructions.md`), and other agents that follow this file.
- `CLAUDE.md` must contain only `@AGENTS.md` so Claude Code imports the exact same rules.
- Keep both generated marker regions intact: the Next.js agent-rules block at the top of this file and the compressed Next.js docs index at the end. Keep exactly one of each. Do not hand-edit inside either generated region.

### Claude Code project assets

Claude Code discovers skills, slash commands, and subagents from `.claude/`, and MCP servers from the repo-root `.mcp.json`.

- `.claude/skills/`, `.claude/commands/`, and `.claude/agents/` are **generated mirrors** — do not hand-edit them. Edit the canonical source, then run `bun run skills:sync`.
- Skills → canonical `docs/ai/skills/*/SKILL.md` (plus ecosystem installs under `.agents/skills/`).
- Commands → `.cursor/commands/*.md`.
- Subagents → `.cursor/agents/*.md`.
- `bun run skills:verify` (pre-push and CI) checks mirrors without changing the working tree. `bun run skills:sync` writes mirrors.

## Repository identity

This is **Asymmetric-al/core**: a Bun + Turborepo monorepo for donor, missionary, and admin/Mission Control apps on Next.js App Router, React, TypeScript, Supabase, Payload CMS, and shared UI in `packages/ui`.

Apps:

- `apps/admin` (`@asym/admin`) — Mission Control, port 3030
- `apps/donor` (`@asym/donor`) — donor app, port 3000
- `apps/missionary` (`@asym/missionary-app`) — missionary app, port 4000

Package manager: Bun. Task runner: Turborepo (`turbo.json` uses `"envMode": "loose"`).

## Source-of-truth order

When instructions conflict, distinguish intended behavior from current reality. Do not silently pick whichever source is more convenient.

### Intended behavior

1. Explicit current human decision for this task.
2. The approved active OpenSpec change for the exact work.
3. Durable OpenSpec specifications and accepted ADRs.
4. PRDs, decision logs, roadmaps, and GitHub issues.
5. Agent memory, summaries, provider guidance, and general model knowledge.

### Current reality

1. Current repository code and migrations.
2. Tests and CI.
3. Runtime configuration, logs, deployment state, and provider evidence.
4. Documentation and summaries.

An approved active OpenSpec change governs what a branch is trying to change. It does not prove that the behavior has shipped. When material high-authority sources conflict, stop that unsafe action, surface the contradiction, and reconcile the sources.

Nia (MCP) is optional repository search. Ordinary Core work must still succeed with local source, Git, tests, installed docs, and standard search. Canonical Nia workflow: `docs/ai/nia.md`. Stack tags: `docs/ai/stack-registry.md`. Do not make Nia mandatory for basic correctness.

## Nested instructions

Cursor and similar tools merge nested `AGENTS.md` with this file. Open the nearest nested file for the directory you are changing:

| Path                             | Scope                                               |
| -------------------------------- | --------------------------------------------------- |
| `apps/admin/AGENTS.md`           | Mission Control / admin app                         |
| `apps/donor/AGENTS.md`           | Donor app                                           |
| `apps/missionary/AGENTS.md`      | Missionary app                                      |
| `packages/api/AGENTS.md`         | Server data access and mutations                    |
| `packages/auth/AGENTS.md`        | Auth helpers and session plumbing                   |
| `packages/database/AGENTS.md`    | Generated DB types and browser table hooks          |
| `packages/ui/AGENTS.md`          | Shared UI, `base-maia`, Base UI, semantic tokens    |
| `packages/eve-runtime/AGENTS.md` | Product Eve runtime (not this coding-agent library) |
| `supabase/AGENTS.md`             | Migrations, seed, demo RLS                          |
| `scripts/AGENTS.md`              | Operational scripts, skill sync/verify              |

Do not copy this root file into nested files. Nested files hold unique local rules only.

## Twenty CRM

Asym Postgres owns all CRM truth. Twenty CRM is retired; do not restore Twenty clients, credentials, routes, webhooks, synchronization, projections, or provider-backed CRM reads.

## UI invariant

All UI/UX work must use the shared shadcn/Base UI system in `packages/ui` and preserve the exact `base-maia` style, Zinc-oriented semantic CSS-variable tokens, and existing Core design language. Do not introduce another style, preset, primitive base, component system, or app-local fork.

`base-maia` is the shadcn style identifier (Base UI primitives + Maia geometry and rhythm). Zinc is the configured base color. Feature code uses semantic tokens (`bg-background`, `text-foreground`, `bg-card`, …), not literal `zinc-*` utilities and not a competing palette. Detailed contract: `packages/ui/AGENTS.md` and `docs/ai/rules/frontend.md`.

Before substantive UI or registry work: read `packages/ui/components.json`, load the official shadcn skill plus `docs/ai/skills/moai-library-shadcn/SKILL.md`, and search existing shared components. Never run `shadcn init`, `shadcn create`, or a preset-switch command during ordinary UI work.

## TDD

For substantive feature, bug-fix, and behavior-changing work, Test-Driven Development is the default. Load `docs/ai/skills/tdd/SKILL.md` (`/tdd` and `/TDD` are the same workflow). Inspect existing tests and public seams first; write or update a failing test; implement the smallest change; keep tests green; refactor when justified.

Do not invent an artificial RED test for documentation-only edits, formatting-only edits, exact generated mirrors, provenance metadata, or mechanical lock updates. Use the strongest deterministic check that applies. Full policy: `docs/ai/rules/testing.md`.

## OpenSpec

OpenSpec is Core’s durable planning and specification system. `openspec/config.yaml` supplies injected planning context. `openspec/project.md` remains the detailed human-oriented index. Read `openspec/specs/agent-instruction-system/spec.md` and `docs/ai/rules/openspec.md` before creating or updating a change.

Use the repository-pinned local CLI: `bun run openspec -- <command>`. Pass an explicit change ID for mutating operations. Selected skills: Explore, Propose, Update, Apply, Verify, Sync, Archive (`docs/ai/skills/openspec-explore` and siblings). Numbered commands `/1-start-project` through `/4-close-project` remain the Core wrappers.

Strict validation and OpenSpec Verify precede completion. Archive normally follows merge. Do not run `openspec update` against the live customized repository. Do not enable Stores, a custom schema, or native OpenSpec command generation.

Create or update a change for durable repository conventions. Skip OpenSpec for formatting, typos, exact generated mirrors, provenance-only metadata, and mechanical corrections already required by an accepted spec.

Repository coding agents may use OpenSpec workflow skills. Product-runtime Eve remains separate. Runtime Eve may read and review OpenSpec through the read-only Guardian. This upgrade grants no Eve mutation, sync, or archive authority.

## Explore first, then workflow skills

1. Identify the app or package and inspect the current implementation.
2. Read the relevant nested `AGENTS.md` and canonical rulebook.
3. For Next.js, read the nearest `node_modules/next/dist/docs/` for the installed version (sandbox fallback: `.next-docs/` when `node_modules` docs are missing).
4. Load the action-specific skill only after that context is clear.
5. Use live diagnostics (Next.js MCP, `agent-browser`) when a dev server or UI verification is in play.
6. Implement through focused TDD when behavior changes.
7. For UI, verify `base-maia` against `packages/ui/AGENTS.md`.
8. Run the focused tests, then broader checks that apply.

Skills are workflows, not a substitute for repository context. Full catalog: `docs/ai/rules/agent-skill-routing.md`.

## Required skills (load when the trigger matches)

Canonical source is `docs/ai/skills/`. Refresh mirrors with `bun run skills:sync`; verify with `bun run skills:verify`.

- **Repo entry:** `docs/ai/skills/repo-entry/SKILL.md`
- **Supabase / Auth / Postgres:** `docs/ai/skills/supabase/SKILL.md` first; Next.js App Router auth also `docs/ai/skills/nextjs-supabase-auth/SKILL.md`; query/RLS performance `docs/ai/skills/supabase-postgres-best-practices/SKILL.md`
- **Next.js App Router:** `docs/ai/skills/nextjs-app-router/SKILL.md`
- **Cache Components:** `docs/ai/skills/cache-components/SKILL.md`
- **Next.js runtime loop:** `next-dev-loop` (`.agents/skills/`; needs `agent-browser` ≥0.27)
- **Cache Components adoption / optimizer:** `next-cache-components-adoption`, `next-cache-components-optimizer`
- **TDD:** `docs/ai/skills/tdd/SKILL.md` for substantive behavior changes
- **React components:** `docs/ai/skills/react-component-dev/SKILL.md`
- **shadcn / Base UI / Maia:** official `shadcn` skill plus `docs/ai/skills/moai-library-shadcn/SKILL.md` and `docs/ai/skills/base-ui/SKILL.md`
- **Frontend a11y:** `docs/ai/skills/accessibility-review/SKILL.md`
- **Motion:** `docs/ai/skills/emil-design-engineering/SKILL.md` first, then `docs/ai/skills/anim/SKILL.md`. Current Emil companion: `docs/ai/skills/emil-design-eng/SKILL.md`. Vocabulary only: `docs/ai/skills/animation-vocabulary/SKILL.md`. Apple-style physics: `docs/ai/skills/apple-design/SKILL.md`. Whole-codebase audit: `docs/ai/skills/improve-animations/SKILL.md`. Opportunities scan: `docs/ai/skills/find-animation-opportunities/SKILL.md`. Strict motion review: `docs/ai/skills/review-animations/SKILL.md` (explicit only). Motion API: `docs/ai/skills/motion/SKILL.md`
- **Vitest:** `docs/ai/skills/vitest/SKILL.md` (Vitest 4 + Bun; not upstream Vitest 5 beta)
- **Playwright:** `docs/ai/skills/playwright-best-practices/SKILL.md`; optional CLI: `docs/ai/skills/playwright-cli/SKILL.md`
- **Payload CMS:** `docs/ai/skills/payloadcms-payload/SKILL.md`; CMS migration: `docs/ai/skills/payloadcms-cms-migration/SKILL.md`
- **Idempotency / webhooks / payments:** `docs/ai/skills/idempotency-handling/SKILL.md` (see `packages/api/src/donate/idempotency.ts`)
- **Inngest:** start at `docs/ai/skills/inngest/SKILL.md`
- **Eve (product runtime work):** `docs/ai/skills/eve/SKILL.md` and `packages/eve-runtime/AGENTS.md`. Do not expose this coding-agent skill library to runtime Eve.
- **Resend CLI:** `docs/ai/skills/resend-cli/SKILL.md` (not the same as product email routes)
- **ReUI:** `docs/ai/skills/reui/SKILL.md`
- **Tiptap:** `docs/ai/skills/tiptap/SKILL.md`
- **grill-for-unknowns:** `docs/ai/skills/grill-for-unknowns/SKILL.md` only when explicitly invoked; do not pair it redundantly with `grilling` or `grill-with-docs`
- **Matt Pocock pack:** `docs/ai/skills/ask-matt/SKILL.md` is the router (`grilling`, `grill-with-docs`, `wayfinder`, `to-spec`, `to-tickets`, `implement`, `code-review`, `research`, `prototype`, `diagnosing-bugs`, `domain-modeling`, `tdd`, …)
- **OpenSpec workflows:** `docs/ai/skills/openspec-explore` plus propose, update-change, apply-change, verify-change, sync-specs, and archive-change. Numbered commands wrap these.
- **Cursor Team Kit / babysit / OpenSpec numbered commands:** see `docs/ai/rules/agent-skill-routing.md`

GitHub `AL-###` issue/PR workflow has no `SKILL.md` today; follow `docs/ai/rules/general.md`.

## Rulebooks (load before editing that domain)

- General / AL-### / CI: `docs/ai/rules/general.md`
- Frontend / UI / UX: `docs/ai/rules/frontend.md` and `packages/ui/AGENTS.md`
- Backend / Supabase / auth / data: `docs/ai/rules/backend.md`
- API routes or data access: `docs/guides/architecture/data-access-boundary.md`
- Testing: `docs/ai/rules/testing.md`
- TypeScript future-proofing: `docs/ai/rules/typescript-future-proofing.md`
- shadcn/studio MCP (`/cui`, `/rui`, `/iui`, `/ftc`): `docs/ai/rules/shadcn-studio-mcp.md`
- OpenSpec workflow: `docs/ai/rules/openspec.md`
- Review-bot policy: `docs/ai/rules/review-bots.md`
- Cursor Cloud runbook: `docs/guides/development/cursor-cloud.md`

## Instant Navigation (Next.js 16.3)

All three apps run with `cacheComponents: true` and `partialPrefetching: true`. Inspect `apps/*/next.config.ts` before assuming other flags. Navigations must stay instant.

Every server `await` in a route is Stream (`<Suspense>`), Cache (`'use cache'`), or Block (`export const instant = false` with a one-line comment). Instant Insights errors include `[stream]` / `[cache]` / `[block]` fixes — read the linked message (append `.md`) before improvising.

Per-route shell prefetch is the baseline. `export const prefetch = 'allow-runtime'` needs a PR justification. Use `instant()` from `@next/playwright` for navigation-critical routes (`tests/e2e/instant-navigation.spec.ts`; skip unless `INSTANT_NAV_RIG=1`).

## Next.js MCP and agent-browser

Root `.mcp.json` (mirrored to `.cursor/mcp.json`) configures Next.js 16+ devtools MCP. Requirement: a running Next.js 16+ dev server (for example `bun run dev:donor`). Use it for live errors, logs, routes, page metadata, and server actions — do not guess those when MCP can query the running app. 16.3 keeps general Next.js knowledge in bundled docs, not in MCP.

`agent-browser` (root devDependency, ≥0.27) inspects rendered UI, console, network, React tree, Suspense, focus, and whether the result still matches `base-maia`. Launch with `--enable react-devtools` when using `next-dev-loop`.

Inngest MCP (`http://127.0.0.1:8288/mcp`) and ReUI MCP (`https://mcp.reui.io`) are agent tooling only. ReUI is not shadcn-studio `/rui`.

## TanStack

Use the official TanStack CLI and current Intent skills for **installed** packages only. Do not install a TanStack library because it appears in a list.

This repo currently runs `@tanstack/react-query` v5, `@tanstack/db` plus `@tanstack/react-db`, `@tanstack/react-form`, Table (`9.0.0-beta.9` exact pin behind `packages/ui/components/shadcn/data-table/tanstack.ts`), `@tanstack/react-virtual`, and `@tanstack/store`. TanStack Charts, Hotkeys, and Pacer are not installed — do not add them during ordinary work.

Before TanStack work: identify the exact installed version, inspect Core adapters, read installed types, then official docs. `npx --yes @tanstack/intent@latest list` is the authority for which installed packages expose Intent skills. Do not use `@tanstack/cli mcp`. Table v9 decisions must use v9/beta sources, not v8 docs. TanStack UI still follows the `base-maia` contract.

Details: `docs/guides/development/tanstack-integration.md`.

## Next.js docs source of truth

This monorepo pins `next@16.3.0-preview.9` across apps. Read docs from the nearest install:

1. `apps/<app>/node_modules/next/dist/docs/`
2. repo-root `node_modules/next/dist/docs/`
3. `.next-docs/` when bundled docs are missing (sandbox / clean clone)

On 16.3, `next dev` may rewrite the top managed block when it detects an AI agent (opt out with `agentRules: false`). Commit that block as-is. Keep `next`, `@next/env`, `@next/playwright`, and `eslint-config-next` on one identical version.

Vercel: `https://vercel.com/docs/llms-full.txt` for broad context; `.md` pages for specific topics. Read relevant Vercel docs before deploy, build-output, domain, log, edge, or function work.

## Cursor Cloud

Cloud ports, Mission Control setup, donor `run-with-ci-env.mjs`, local Supabase recovery, and env notes: `docs/guides/development/cursor-cloud.md`. Do not keep those runbooks in this file.

## Monorepo commands

Dev:

- `bun run dev:admin` / `bun run dev:donor` / `bun run dev:missionary`
- Cloud donor: `node scripts/run-with-ci-env.mjs -- bun run dev:donor`
- Equivalent: `bunx turbo run dev --filter=@asym/admin` (and donor / missionary-app)

Checks:

- `bun run check` / `bun run lint` / `bun run typecheck` / `bun run test:unit`
- Scoped: `bunx turbo run lint --filter=@asym/donor` (same for typecheck and other apps)

Secrets stay in gitignored repo-root `.env.local`. Optional `SKIP_ENV_VALIDATION=1` is local/cloud only.

## Code Style

Write for long-term maintenance. Prefer straightforward code, clear names, explicit control flow, and existing project patterns. Extract helpers when concerns mix or repeat, not only to shorten a line.

## Quality gate

- Do not include secrets in docs.
- Do not leave conflicting instructions across rulebooks; reconcile to one source of truth.
- Every rules/skill/workflow doc must include triggers, workflow steps, and a checklist.

## Shadscan

Before each commit, audit `packages/ui` with `bunx @shadscan/cli@0.1.1 ./packages/ui --json --no-interactive`. Floor and pin live in `.husky/pre-commit` and `.github/workflows/shadscan.yml`. Do not commit if the score is unassessed or below the floor.

## Routing checklist

- [ ] Opened the matching nested `AGENTS.md` and rulebook
- [ ] Loaded required skills from `docs/ai/skills/` (Supabase skill first when the task involves Supabase)
- [ ] Used installed docs/types for the exact package version
- [ ] For Next.js runtime questions, used Next.js MCP when a dev server is running
- [ ] For UI, confirmed exact `base-maia` via `packages/ui/AGENTS.md`

## Response checklist

- [ ] File paths are explicit
- [ ] Behavior changes include verification
- [ ] Blast radius summarized for multi-file edits

<!-- NEXT-AGENTS-MD-START -->[Next.js Docs Index]|root: ./.next-docs|STOP. What you remember about Next.js is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: npx @next/codemod agents-md --output AGENTS.md|01-app/01-getting-started:{01-installation.mdx,02-project-structure.mdx,03-layouts-and-pages.mdx,04-linking-and-navigating.mdx,05-server-and-client-components.mdx,06-cache-components.mdx,07-fetching-data.mdx,08-updating-data.mdx,09-caching-and-revalidating.mdx,10-error-handling.mdx,11-css.mdx,12-images.mdx,13-fonts.mdx,14-metadata-and-og-images.mdx,15-route-handlers.mdx,16-proxy.mdx,17-deploying.mdx,18-upgrading.mdx}|01-app/02-guides:{analytics.mdx,authentication.mdx,backend-for-frontend.mdx,caching.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,data-security.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,json-ld.mdx,lazy-loading.mdx,local-development.mdx,mcp.mdx,mdx.mdx,memory-usage.mdx,multi-tenant.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,prefetching.mdx,production-checklist.mdx,progressive-web-apps.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,single-page-applications.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx,videos.mdx}|01-app/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|01-app/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|01-app/02-guides/upgrading:{codemods.mdx,version-14.mdx,version-15.mdx,version-16.mdx}|01-app/03-api-reference:{07-edge.mdx,08-turbopack.mdx}|01-app/03-api-reference/01-directives:{use-cache-private.mdx,use-cache-remote.mdx,use-cache.mdx,use-client.mdx,use-server.mdx}|01-app/03-api-reference/02-components:{font.mdx,form.mdx,image.mdx,link.mdx,script.mdx}|01-app/03-api-reference/03-file-conventions/01-metadata:{app-icons.mdx,manifest.mdx,opengraph-image.mdx,robots.mdx,sitemap.mdx}|01-app/03-api-reference/03-file-conventions:{default.mdx,dynamic-routes.mdx,error.mdx,forbidden.mdx,instrumentation-client.mdx,instrumentation.mdx,intercepting-routes.mdx,layout.mdx,loading.mdx,mdx-components.mdx,not-found.mdx,page.mdx,parallel-routes.mdx,proxy.mdx,public-folder.mdx,route-groups.mdx,route-segment-config.mdx,route.mdx,src-folder.mdx,template.mdx,unauthorized.mdx}|01-app/03-api-reference/04-functions:{after.mdx,cacheLife.mdx,cacheTag.mdx,connection.mdx,cookies.mdx,draft-mode.mdx,fetch.mdx,forbidden.mdx,generate-image-metadata.mdx,generate-metadata.mdx,generate-sitemaps.mdx,generate-static-params.mdx,generate-viewport.mdx,headers.mdx,image-response.mdx,next-request.mdx,next-response.mdx,not-found.mdx,permanentRedirect.mdx,redirect.mdx,refresh.mdx,revalidatePath.mdx,revalidateTag.mdx,unauthorized.mdx,unstable_cache.mdx,unstable_noStore.mdx,unstable_rethrow.mdx,updateTag.mdx,use-link-status.mdx,use-params.mdx,use-pathname.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,use-selected-layout-segment.mdx,use-selected-layout-segments.mdx,userAgent.mdx}|01-app/03-api-reference/05-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,appDir.mdx,assetPrefix.mdx,authInterrupts.mdx,basePath.mdx,browserDebugInfoInTerminal.mdx,cacheComponents.mdx,cacheHandlers.mdx,cacheLife.mdx,compress.mdx,crossOrigin.mdx,cssChunking.mdx,devIndicators.mdx,distDir.mdx,env.mdx,expireTime.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,htmlLimitedBots.mdx,httpAgentOptions.mdx,images.mdx,incrementalCacheHandlerPath.mdx,inlineCss.mdx,isolatedDevBuild.mdx,logging.mdx,mdxRs.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactCompiler.mdx,reactMaxHeadersLength.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,sassOptions.mdx,serverActions.mdx,serverComponentsHmrCache.mdx,serverExternalPackages.mdx,staleTimes.mdx,staticGeneration.mdx,taint.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,turbopackFileSystemCache.mdx,typedRoutes.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,viewTransition.mdx,webVitalsAttribution.mdx,webpack.mdx}|01-app/03-api-reference/05-config:{02-typescript.mdx,03-eslint.mdx}|01-app/03-api-reference/06-cli:{create-next-app.mdx,next.mdx}|02-pages/01-getting-started:{01-installation.mdx,02-project-structure.mdx,04-images.mdx,05-fonts.mdx,06-css.mdx,11-deploying.mdx}|02-pages/02-guides:{analytics.mdx,authentication.mdx,babel.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,lazy-loading.mdx,mdx.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,post-css.mdx,preview-mode.mdx,production-checklist.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx}|02-pages/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|02-pages/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|02-pages/02-guides/upgrading:{codemods.mdx,version-10.mdx,version-11.mdx,version-12.mdx,version-13.mdx,version-14.mdx,version-9.mdx}|02-pages/03-building-your-application/01-routing:{01-pages-and-layouts.mdx,02-dynamic-routes.mdx,03-linking-and-navigating.mdx,05-custom-app.mdx,06-custom-document.mdx,07-api-routes.mdx,08-custom-error.mdx}|02-pages/03-building-your-application/02-rendering:{01-server-side-rendering.mdx,02-static-site-generation.mdx,04-automatic-static-optimization.mdx,05-client-side-rendering.mdx}|02-pages/03-building-your-application/03-data-fetching:{01-get-static-props.mdx,02-get-static-paths.mdx,03-forms-and-mutations.mdx,03-get-server-side-props.mdx,05-client-side.mdx}|02-pages/03-building-your-application/06-configuring:{12-error-handling.mdx}|02-pages/04-api-reference:{06-edge.mdx,08-turbopack.mdx}|02-pages/04-api-reference/01-components:{font.mdx,form.mdx,head.mdx,image-legacy.mdx,image.mdx,link.mdx,script.mdx}|02-pages/04-api-reference/02-file-conventions:{instrumentation.mdx,proxy.mdx,public-folder.mdx,src-folder.mdx}|02-pages/04-api-reference/03-functions:{get-initial-props.mdx,get-server-side-props.mdx,get-static-paths.mdx,get-static-props.mdx,next-request.mdx,next-response.mdx,use-report-web-vitals.mdx,use-router.mdx,userAgent.mdx}|02-pages/04-api-reference/04-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,assetPrefix.mdx,basePath.mdx,bundlePagesRouterDependencies.mdx,compress.mdx,crossOrigin.mdx,devIndicators.mdx,distDir.mdx,env.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,httpAgentOptions.mdx,images.mdx,isolatedDevBuild.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,serverExternalPackages.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,webVitalsAttribution.mdx,webpack.mdx}|02-pages/04-api-reference/04-config:{01-typescript.mdx,02-eslint.mdx}|02-pages/04-api-reference/05-cli:{create-next-app.mdx,next.mdx}|03-architecture:{accessibility.mdx,fast-refresh.mdx,nextjs-compiler.mdx,supported-browsers.mdx}|04-community:{01-contribution-guide.mdx,02-rspack.mdx}<!-- NEXT-AGENTS-MD-END -->
