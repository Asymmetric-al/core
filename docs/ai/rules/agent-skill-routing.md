# Agent Skill Routing

**Name:** `agent-skill-routing`

**Purpose:** Canonical skill catalog, ecosystem-install restore notes, and Core-specific invocation rules for coding agents.

**Applies when:** Selecting, installing, restoring, or invoking an agent skill in this repository.

**Do not use when:** Writing ordinary application code that does not need a skill, or when the nearest nested `AGENTS.md` already names the required skill.

## Triggers

- The agent needs to choose a canonical skill under `docs/ai/skills/`
- The agent needs to restore ecosystem skills from `skills-lock.json`
- The agent needs Core-specific notes for a vendor skill (Supabase, Resend CLI, Emil Kowalski, Matt Pocock, Inngest, shadcn, TDD)
- Root `AGENTS.md` Skill Routing points here for the full catalog

## Workflow

1. Start from root `AGENTS.md` compact routing (OpenSpec, TDD, UI, Next.js, Supabase, TanStack).
2. Open this catalog only when the compact map is not enough.
3. Load the matching canonical `docs/ai/skills/<name>/SKILL.md`.
4. For lockfile-managed ecosystem skills, restore with `npx skills experimental_install -y` rather than guessing copies.
5. After editing canonical skills, run `bun run skills:sync` then `bun run skills:verify` (verify is non-mutating).

## Checklist

- [ ] Used the canonical path under `docs/ai/skills/`, not a generated mirror as the source of truth
- [ ] Did not treat `.agents/skills/` as independently editable
- [ ] For UI work, used official shadcn skill plus Core `base-maia` overlay — did not pick another style
- [ ] For substantive code, applied TDD (`docs/ai/skills/tdd/SKILL.md`) without waiting for `/tdd`
- [ ] After skill edits: `bun run skills:sync` and non-mutating `bun run skills:verify`

---

## Catalog (deterministic)

Load the skill(s) below when the trigger matches. Canonical skill source is `docs/ai/skills/`; run `bun run skills:sync` to refresh mirrors under `.cursor/skills/`, `.agents/skills/`, and `.claude/skills/`. The singular `.agent/skills/` path is not a supported mirror and is rejected by `bun run skills:verify`.

- **Repo entry / instruction map (default orientation for repo work):** `docs/ai/skills/repo-entry/SKILL.md`

**Supabase and Supabase Auth:** For any work touching Supabase products (database, Auth, Storage, Realtime, Edge Functions, CLI, MCP, RLS, migrations), load **`docs/ai/skills/supabase/SKILL.md`** first. For Next.js App Router auth integration specifically, also use **`docs/ai/skills/nextjs-supabase-auth/SKILL.md`**. For Postgres query/schema/RLS performance, use **`docs/ai/skills/supabase-postgres-best-practices/SKILL.md`**.

**Keeping ecosystem skills current:** **`skills-lock.json`** pins content hashes for skills installed via the Skills CLI (see entries under `skills.*`).

To **restore** those installs into `.agents/skills/` from the lockfile: `npx skills experimental_install -y`. This rewrites every skill listed in the lockfile under `.agents/skills/`; prefer `npx skills add <pkg> -y` for targeted updates.

**Personal/global slash-command use (optional):** The canonical skills under `docs/ai/skills/` can also be copied into your personal `~/.claude/skills/` to expose them as `/<name>` slash commands in Claude Code across **all** your projects. This is separate from how skills load **inside** this repo (AGENTS.md routing) and from the repo mirrors (`.agents/skills/`, `.cursor/skills/`, `.claude/skills/`); it is a per-developer convenience, not a repo requirement, and there is no repo script for it today. Copy each `docs/ai/skills/<name>/` directory (including its `references/`) to `~/.claude/skills/<name>/`; the copies are point-in-time snapshots that do **not** auto-update, so re-copy after refreshing the canonical skills. Skills with `disable-model-invocation: true` stay user-invocable via `/` but are not auto-invoked by the model.

Do **not** use `npx skills check` as a read-only check in this repo. With `skills@1.5.7`, `check` is not listed in `npx skills --help` and was observed to update project skills. Treat it like `skills update`: only run it when you intentionally want a full refresh and are prepared to review or revert the generated `.agents/skills` and `skills-lock.json` diff.

To **pull newer upstream** content for Supabase: `npx skills add supabase/agent-skills -y` (updates the lockfile), then `bun run skills:refresh-upstream`, reconcile any **This repository** / workflow sections in `docs/ai/skills/supabase/SKILL.md` and `docs/ai/skills/supabase-postgres-best-practices/SKILL.md` if the vendor copy overwrote them, then `bun run skills:sync` and `bun run skills:verify`.

**`npm-deps-cleanup`** (`anthonyshew/dotfiles`): `npx skills add anthonyshew/dotfiles -y`, then `bun run skills:refresh-upstream` → `skills:sync` / `skills:verify` (see `docs/ai/skills/npm-deps-cleanup/references/upstream.md`).

**`emil-design-engineering`** is not in `skills-lock.json`; refresh it with the animations.dev installer into `~/.cursor/skills/`, then the same `skills:refresh-upstream` → `skills:sync` / `skills:verify` loop (see root `README.md`). Apply the same pattern for other vendored packages by extending `scripts/refresh-upstream-skills.mjs`.

**Cursor Team Kit** (`cursor/plugins`, `cursor-team-kit/skills/*`) and **Babysitter** (`a5c-ai/babysitter-cursor`, `skills/babysit`) are repo-local vendored skills refreshed directly from GitHub by `bun run skills:refresh-upstream`; see each skill's `references/upstream.md`. Cursor Team Kit companion agents are vendored under `.cursor/agents/`; upstream always-on Cursor rules are intentionally not vendored because no skill depends on them and they would change repo-wide Cursor behavior.

**Emil Kowalski skill pack** ([`emilkowalski/skills`](https://github.com/emilkowalski/skills)): refresh all five lockfile-managed skills with `npx --yes skills@latest add emilkowalski/skills -y`, then run `bun run skills:refresh-emilkowalski`, `bun run skills:sync`, and `bun run skills:verify`. Canonical copies, reviewed commit SHAs, source paths, and the MIT notice live under `docs/ai/skills/{animation-vocabulary,apple-design,emil-design-eng,improve-animations,review-animations}/references/`. The focused refresh preserves marked Core overlays; still review the upstream inventory for newly added or removed skills before syncing.

**`grill-for-unknowns`** ([`nicobailon/grill-for-unknowns`](https://github.com/nicobailon/grill-for-unknowns)): refresh the lockfile-managed skill with `npx --yes skills@latest add nicobailon/grill-for-unknowns -y`, then run `bun run skills:refresh-grill-for-unknowns`, `bun run skills:sync`, and `bun run skills:verify`. The complete canonical plugin tree, reviewed commit, lineage, MIT notice, and Core overlay live under `docs/ai/skills/grill-for-unknowns/`. Review upstream inventory and discovery metadata before syncing; the focused refresh preserves Core's explicit-only route.

**Resend CLI** (`docs/ai/skills/resend-cli/`) is vendored from the tagged [`resend/resend-cli`](https://github.com/resend/resend-cli) tree (`skills/resend-cli/`). Refresh steps live in `docs/ai/skills/resend-cli/references/upstream.md`; it is **not** updated by `bun run skills:refresh-upstream` today.

**`bendc-frontend-guidelines`** (`docs/ai/skills/bendc-frontend-guidelines/`) vendors [`bendc/frontend-guidelines`](https://github.com/bendc/frontend-guidelines) `README.md`. Refresh steps live in `docs/ai/skills/bendc-frontend-guidelines/references/upstream.md`; it is **not** updated by `bun run skills:refresh-upstream` today.

**Payload CMS** ([`payloadcms/skills`](https://github.com/payloadcms/skills)) is vendored into `docs/ai/skills/payloadcms-payload/` and `docs/ai/skills/payloadcms-cms-migration/`. Refresh steps live in each skill's `references/upstream.md`; optional Skills CLI install is `npx skills add payloadcms/skills`; these skills are **not** updated by `bun run skills:refresh-upstream` today.

**`idempotency-handling`** ([`aj-geddes/useful-ai-prompts`](https://github.com/aj-geddes/useful-ai-prompts)) is in `docs/ai/skills/idempotency-handling/`. Refresh via `npx skills add https://github.com/aj-geddes/useful-ai-prompts --skill idempotency-handling -y`, reconcile into `docs/ai/skills/idempotency-handling/` if needed, then `bun run skills:sync` and `bun run skills:verify`. See `docs/ai/skills/idempotency-handling/references/upstream.md`; **not** updated by `bun run skills:refresh-upstream` today.

**`improve`** ([`shadcn/improve`](https://github.com/shadcn/improve)) is in `docs/ai/skills/improve/`. Refresh via `npx skills add shadcn/improve -y`, then **delete any project-level `.claude/skills/improve` symlink the CLI creates** (this repo routes Claude Code through `docs/ai/skills/` + this file, not `.claude/skills/`), reconcile into `docs/ai/skills/improve/` if needed, then `bun run skills:sync` and `bun run skills:verify`. See `docs/ai/skills/improve/references/upstream.md`; **not** updated by `bun run skills:refresh-upstream` today.

**Official Inngest agent skills** (`docs/ai/skills/inngest-*`) are vendored from [`inngest/inngest-skills`](https://github.com/inngest/inngest-skills) and [`inngest/inngest-codex-plugin`](https://github.com/inngest/inngest-codex-plugin). Refresh them with `bun run skills:refresh-inngest`, then `bun run skills:sync` and `bun run skills:verify`; source SHAs and licenses are documented in `docs/ai/skills/inngest/references/upstream.md`. These skills are agent tooling for integration work, not evidence of product runtime adoption. Use `docs/ai/skills/inngest/SKILL.md` as the router when unsure which Inngest skill applies.

**`eve`**, **`create-agent`**, **`impeccable`**, and **`playwright-best-practices`** are vendored under `docs/ai/skills/` with refresh steps in each skill's `references/upstream.md`; **not** updated by `bun run skills:refresh-upstream` today. Upstream CLI id for Impeccable is **`impeccable`** (not `critique`).

**Core-curated adapters:** **`accessibility-review`**, **`find-animation-opportunities`**, **`vitest`**, and **`playwright-cli`** are narrow Core-authored adaptations of reviewed upstream material. Their exact source paths, commit SHAs, licenses, compatibility decisions, and manual refresh workflows live in each skill's `references/upstream.md`; they are **not** updated by `bun run skills:refresh-upstream`. The animation-opportunity adapter is intentionally separate from the five lockfile-managed Emil skills and from `skills:refresh-emilkowalski` because Core replaces its generic motion recipes with repo tokens, primitives, route-transition ownership, and a required non-opportunity report. The Vitest adapter follows Core's installed Vitest 4 harness rather than its upstream skill's Vitest 5 beta target. Playwright CLI remains optional one-off browser tooling and does not replace `@playwright/test` or add a runtime dependency.

- **Next.js App Router structure, rendering, data fetching:** `docs/ai/skills/nextjs-app-router/SKILL.md`
- **Cache Components / PPR / cacheTag & invalidation:** `docs/ai/skills/cache-components/SKILL.md`
- **Verify Next.js runtime behavior after edits (running dev server + browser + React tree):** `next-dev-loop` (first-party `vercel/next.js` skill; ecosystem install under `.agents/skills/`, mirrored to `.claude/skills/` and `.cursor/skills/`; requires `agent-browser` ≥0.27)
- **Adopt Cache Components on existing routes (feature-by-feature):** `next-cache-components-adoption` (first-party `vercel/next.js` skill; ecosystem install)
- **Grow a route's static shell / make navigations instant:** `next-cache-components-optimizer` (first-party `vercel/next.js` skill; ecosystem install) — see **Instant Navigation (Next.js 16.3)** in root `AGENTS.md`
- The retired `vercel-labs/next-skills` knowledge skills (`next-best-practices`, `next-cache-components`, `next-upgrade`) and the stale community `nextjs` skill were removed in the 16.3 upgrade; the bundled `node_modules/next/dist/docs/` are the knowledge source now.
- **React component design/refactor:** `docs/ai/skills/react-component-dev/SKILL.md`
- **Million React Doctor / performance & health audits (`millionco/react-doctor`):** `docs/ai/skills/react-doctor/SKILL.md`
- **Composable, accessible UI components (components.build spec):** `docs/ai/skills/components-build/SKILL.md`
- **Accessibility audits and targeted UI remediation:** `docs/ai/skills/accessibility-review/SKILL.md` for names, semantics, keyboard/focus, forms/errors, announcements, contrast, touch targets, reduced motion, and manual + axe verification; subordinate to `docs/ai/rules/frontend.md` and `docs/ai/rules/testing.md`.
- **shadcn/ui system usage:** `docs/ai/skills/moai-library-shadcn/SKILL.md`
- **Base UI:** `docs/ai/skills/base-ui/SKILL.md`
- **Semantic HTML, CSS discipline, and vanilla JS readability ([bendc/frontend-guidelines](https://github.com/bendc/frontend-guidelines)):** `docs/ai/skills/bendc-frontend-guidelines/SKILL.md` (vendored upstream text under `references/`; subordinate to `docs/ai/rules/frontend.md`, motion skills, and TypeScript lint)
- **Frontend design critique, polish, and live UI iteration ([pbakaus/impeccable](https://github.com/pbakaus/impeccable)):** `docs/ai/skills/impeccable/SKILL.md` (subordinate to `docs/ai/rules/frontend.md`)
- **Animation work, transitions, micro-interactions, or motion polish:** load `docs/ai/skills/emil-design-engineering/SKILL.md` first and use `docs/ai/skills/anim/SKILL.md` for Core's operative Base UI, token, route-transition, and reduced-motion contract.
- **Current Emil Kowalski craft companion:** `docs/ai/skills/emil-design-eng/SKILL.md`; it is subordinate to `docs/ai/rules/frontend.md`, `emil-design-engineering`, and `anim` when generic upstream examples conflict with Core.
- **Animation-effect naming / reverse lookup only:** `docs/ai/skills/animation-vocabulary/SKILL.md`; do not use it as an implementation or review standard.
- **Apple-style physical and gesture-driven interfaces:** `docs/ai/skills/apple-design/SKILL.md` for momentum, interruptibility, rubber-banding, springs, depth, and translucent materials; Core's Base UI and motion contracts still win.
- **Whole-codebase animation audit and self-contained plans:** `docs/ai/skills/improve-animations/SKILL.md`; source-read-only during audit/plan modes, with implementation authorized only by an explicit `execute <plan>` request.
- **Find justified motion opportunities and explicit non-opportunities:** `docs/ai/skills/find-animation-opportunities/SKILL.md`; use for a read-only, restraint-first scan of static UI seams, not for reviewing/fixing existing motion or implementing suggestions.
- **Strict motion-only diff review:** `docs/ai/skills/review-animations/SKILL.md`; explicit invocation only across every client. Preserve upstream `disable-model-invocation: true` for Claude Code, and do not auto-route it in Codex or Cursor.
- **Motion animations (`motion/react`) implementation details:** `docs/ai/skills/motion/SKILL.md`; use only when API details are needed after the applicable craft and repo-contract skills.
- **Recharts:** `docs/ai/skills/rechart/SKILL.md`
- **ReUI registry components, examples, blocks, Motion Icons, or ReUI MCP workflows:** `docs/ai/skills/reui/SKILL.md` (vendored from ReUI agent skills; mirrored into `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).
- **TanStack work:** use the official TanStack CLI plus current official Intent skills when `npx --yes @tanstack/intent@latest list` returns a matching package; otherwise use `tanstack doc` / `tanstack search-docs` and the repo-specific TanStack guides linked in **TanStack CLI and Intent** above.
- **Tiptap rich text editor (`@tiptap/*`, shared editor in `@asym/ui`):** `docs/ai/skills/tiptap/SKILL.md`
- **npm / pnpm / Yarn / Bun dependency footprint cleanup (unused deps, dedupe, lockfile closure, e18e):** `docs/ai/skills/npm-deps-cleanup/SKILL.md`
- **Resend CLI (`resend` binary, shell, scripts, CI/CD, non-interactive flags):** `docs/ai/skills/resend-cli/SKILL.md` (not the same as SDK or tenant app integration; see `docs/guides/features/resend-integration.md` for product email routes and UI)
- **Supabase (platform-wide: Auth, DB API, Storage, Realtime, Edge Functions, CLI, MCP, RLS, migrations):** `docs/ai/skills/supabase/SKILL.md`
- **Supabase Postgres tuning / query patterns:** `docs/ai/skills/supabase-postgres-best-practices/SKILL.md`
- **Next.js + Supabase Auth integration:** `docs/ai/skills/nextjs-supabase-auth/SKILL.md`
- **Payload CMS (config, collections, fields, hooks, access, queries, adapters, plugins — [`payloadcms/skills`](https://github.com/payloadcms/skills)):** `docs/ai/skills/payloadcms-payload/SKILL.md` (topic reference under `reference/`; subordinate to `docs/ai/rules/backend.md`, Supabase skills, and `docs/guides/architecture/data-access-boundary.md`)
- **CMS → Payload migration workflow ([`payloadcms/skills`](https://github.com/payloadcms/skills) `cms-migration`):** `docs/ai/skills/payloadcms-cms-migration/SKILL.md`
- **Vercel React + Next performance patterns:** `docs/ai/skills/vercel-react-best-practices/SKILL.md`
- **React View Transitions + Next.js route / shared-element continuity:** `docs/ai/skills/vercel-react-view-transitions/SKILL.md`
- **Discover/install agent skills (skills.sh, repo canonical skills):** `docs/ai/skills/find-skills/SKILL.md`
- **Audit any codebase (bugs, security, perf, tests, tech debt, migrations, DX), suggest features/roadmap, or write self-contained handoff plans for another agent to execute ([`shadcn/improve`](https://github.com/shadcn/improve)):** `docs/ai/skills/improve/SKILL.md` — strictly read-only on source code; writes only to `plans/`. Invoke `/improve` (composes with `quick`/`deep`, `branch`, `next`, `plan <desc>`, `review-plan`, `execute`, `reconcile`, `--issues`).
- **Idempotency keys, safe retries, webhooks, payments, queue consumers:** `docs/ai/skills/idempotency-handling/SKILL.md` (subordinate to `docs/ai/rules/backend.md`; see `packages/api/src/donate/idempotency.ts` for donor API header validation)
- **Inngest durable workflows and agent tooling:** load `docs/ai/skills/inngest/SKILL.md` when choosing a route. Use `docs/ai/skills/inngest-brownfield-audit/SKILL.md` before changing existing app workflows or fragile background work. Use `docs/ai/skills/inngest-setup/SKILL.md` only when explicitly adding Inngest runtime to an app. Use `docs/ai/skills/inngest-events/SKILL.md`, `docs/ai/skills/inngest-durable-functions/SKILL.md`, `docs/ai/skills/inngest-steps/SKILL.md`, `docs/ai/skills/inngest-flow-control/SKILL.md`, `docs/ai/skills/inngest-middleware/SKILL.md`, and `docs/ai/skills/inngest-realtime/SKILL.md` based on the feature area. Use `docs/ai/skills/inngest-agents/SKILL.md` for durable AI agent workflows, `docs/ai/skills/inngest-v3-v4-migration/SKILL.md` only if v3 usage is found, and `docs/ai/skills/inngest-api/SKILL.md` only for Inngest API or CLI operations. These tools are subordinate to OpenSpec, `AGENTS.md`, repo-local rulebooks, Next.js version docs, and runtime evidence.
- **Playwright E2E/component/API testing patterns:** `docs/ai/skills/playwright-best-practices/SKILL.md` (subordinate to `docs/ai/rules/testing.md`)
- **Vitest unit tests, mocking, filtering, environments, and failures:** `docs/ai/skills/vitest/SKILL.md`; use Core's installed Vitest 4 configuration and Bun commands, not generic upstream Vitest 5 beta examples or `bun test`.
- **Interactive browser inspection with the official Playwright CLI:** `docs/ai/skills/playwright-cli/SKILL.md`; use for ad hoc live verification and evidence, not as a substitute for committed `@playwright/test` coverage.
- **Durable backend AI agents ([vercel/eve](https://github.com/vercel/eve)):** `docs/ai/skills/eve/SKILL.md`
- **Scaffold a new eve agent from an interview ([ikindacodes/ship-eve](https://github.com/ikindacodes/ship-eve)):** `docs/ai/skills/create-agent/SKILL.md` (pair with **eve**)
- **Commit message creation:** `docs/ai/skills/commit/SKILL.md`
- **Cursor Team Kit PR/CI/review workflows:** load the matching canonical skill under `docs/ai/skills/<skill-name>/SKILL.md` when explicitly requested or when its trigger matches: `check-compiler-errors`, `control-cli`, `control-ui`, `deslop`, `fix-ci`, `fix-merge-conflicts`, `get-pr-comments`, `loop-on-ci`, `make-pr-easy-to-review`, `new-branch-and-pr`, `pr-review-canvas`, `review-and-ship`, `run-smoke-tests`, `thermo-nuclear-code-quality-review`, `verify-this`, `weekly-review`, `what-did-i-get-done`, `workflow-from-chats`.
- **Babysitter orchestration:** `docs/ai/skills/babysit/SKILL.md` when the user asks to babysit, orchestrate a run/process, or explicitly calls `/babysit`.
- **Explicit deep unknown discovery before implementation:** `docs/ai/skills/grill-for-unknowns/SKILL.md` only when the user invokes `grill-for-unknowns` or specifically requests a map-vs-territory pass, blindspot/unknown-unknown discovery, unknown-known prototypes, or a subagent launch packet. It owns that session's interview loop; do not pair it redundantly with `grilling` or `grill-with-docs`. Generic "grill/stress-test this plan" requests continue to use `grilling`; normal repo-backed grilling plus domain persistence uses `grill-with-docs`; work too large for one context uses `wayfinder`.

**GitHub `AL-###` issue/PR workflow:** there are no `SKILL.md` files under `docs/ai/skills/` for those flows today; follow `docs/ai/rules/general.md`. Deprecated stubs live under `skills/*/DEPRECATED.md` only.

**Extra ecosystem skills:** optional mirror-only installs originate under **`.agents/skills/<name>/`** and are mirrored into **`.cursor/skills/<name>/`** and **`.claude/skills/<name>/`**. These are not canonical repo skills unless promoted into **`docs/ai/skills/<name>/`**. Refresh them with the Skills CLI or documented vendor source, then run `bun run skills:sync` and `bun run skills:verify`. Pins and hashes live in **`skills-lock.json`**. These stay **subordinate to OpenSpec** (`openspec/specs/**`, `openspec/changes/**`, `openspec/project.md`) and canonical **`docs/ai/skills/`** — see **`openspec/specs/agent-instruction-system/spec.md`**.

**Inngest plugins for agent clients:**

- **Codex:** The repo mirrors official Inngest skills into `.agents/skills/` through `bun run skills:sync`. If a Codex session needs the full upstream plugin, clone [`inngest/inngest-codex-plugin`](https://github.com/inngest/inngest-codex-plugin) outside the repo and run `/plugin install <path>/plugins/inngest`. Do not vendor the plugin examples, evals, or assets into this repo unless a future Codex discovery rule requires a repo-local plugin path.
- **Claude Code:** Keep `CLAUDE.md` as `@AGENTS.md`. To install the full official Claude Code plugin, run `/plugin marketplace add inngest/inngest-claude-code-plugin`, then `/plugin install inngest@inngest-claude-code-plugin`.
- **Cursor:** Cursor receives the official skills through generated `.cursor/skills/` mirrors and the `inngest-dev` server in `.cursor/mcp.json`.

**Mattpocock pack** ([github.com/mattpocock/skills](https://github.com/mattpocock/skills)) — routed through canonical `docs/ai/skills/` copies:

| Id                                            | Notes                                                                                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ask-matt**                                  | `docs/ai/skills/ask-matt/SKILL.md` — Router over the Matt Pocock skill flows.                                                                           |
| **setup-matt-pocock-skills**                  | `docs/ai/skills/setup-matt-pocock-skills/SKILL.md` — Bootstrap issue tracker, triage labels, and domain-doc layout for the engineering skills.          |
| **grill-with-docs**                           | `docs/ai/skills/grill-with-docs/SKILL.md` — Run `/grilling` plus `/domain-modeling` to sharpen plans and repo language.                                 |
| **grill-me**, **grilling**                    | `docs/ai/skills/grill-me/SKILL.md`, `docs/ai/skills/grilling/SKILL.md` — User-facing and reusable grilling loops.                                       |
| **wayfinder**                                 | `docs/ai/skills/wayfinder/SKILL.md` — Plan work too large for one agent session as a map of investigation tickets.                                      |
| **to-spec**                                   | `docs/ai/skills/to-spec/SKILL.md` — Spec from conversation context; replaces the old `/to-prd` route.                                                   |
| **to-tickets**                                | `docs/ai/skills/to-tickets/SKILL.md` — Break a plan/spec/conversation into tracer-bullet tickets; replaces old `/to-plan` and `/to-issues` routes.      |
| **implement**                                 | `docs/ai/skills/implement/SKILL.md` — Implement a spec or ticket with TDD where possible, regular type/test checks, final review, and commit.           |
| **code-review**                               | `docs/ai/skills/code-review/SKILL.md` — Review since a fixed point on both standards and spec correctness axes.                                         |
| **research**                                  | `docs/ai/skills/research/SKILL.md` — Research against primary sources and save a cited Markdown finding file.                                           |
| **prototype**                                 | `docs/ai/skills/prototype/SKILL.md` — Cheap logic or UI prototypes to answer design questions before committing to a spec.                              |
| **diagnosing-bugs**                           | `docs/ai/skills/diagnosing-bugs/SKILL.md` — Current bug/performance diagnosis loop; use this instead of the old `/diagnose` route.                      |
| **domain-modeling**, **domain-model**         | `docs/ai/skills/domain-modeling/SKILL.md`, `docs/ai/skills/domain-model/SKILL.md` — Active domain-modeling skill plus Core compatibility alias.         |
| **improve-codebase-architecture**             | `docs/ai/skills/improve-codebase-architecture/SKILL.md` — Architecture deepening and codebase report workflow.                                          |
| **codebase-design**                           | `docs/ai/skills/codebase-design/SKILL.md` — Deep-module design vocabulary and seam placement.                                                           |
| **tdd**                                       | `docs/ai/skills/tdd/SKILL.md` — Red/green TDD reference for tests worth keeping.                                                                        |
| **triage**                                    | `docs/ai/skills/triage/SKILL.md` — Move issues/external PRs through the Matt Pocock triage state machine.                                               |
| **resolving-merge-conflicts**                 | `docs/ai/skills/resolving-merge-conflicts/SKILL.md` — Resolve in-progress merge/rebase conflicts from primary sources.                                  |
| **qa**, **request-refactor-plan**             | `docs/ai/skills/qa/SKILL.md`, `docs/ai/skills/request-refactor-plan/SKILL.md` — Current upstream deprecated skills retained only for compatibility.     |
| **ubiquitous-language**                       | `docs/ai/skills/ubiquitous-language/SKILL.md` — Current upstream deprecated DDD glossary skill; prefer **domain-modeling** for active work.             |
| **setup-pre-commit**, **migrate-to-shoehorn** | `docs/ai/skills/setup-pre-commit/SKILL.md`, `docs/ai/skills/migrate-to-shoehorn/SKILL.md` — Current upstream misc skills previously promoted into Core. |
| **prd-to-plan**                               | `docs/ai/skills/prd-to-plan/SKILL.md` — Core compatibility router; use **to-spec** then **to-tickets**.                                                 |

Core routing note for **domain-modeling**: use `docs/agents/domain.md` and
`CONTEXT-MAP.md` to choose the actual context file and ADR tree before writing
in this repo.

**Removed upstream routes:** `/to-prd`, `/to-plan`, `/to-issues`, `/diagnose`, and `/zoom-out` are not present in current upstream `skills/engineering/`; use `/to-spec`, `/to-tickets`, `/diagnosing-bugs`, `/ask-matt`, or `/wayfinder` as appropriate.

---
