# Project instructions

## Tooling: docs + repo context (required)

### When to use Nia (default for repo work)
Use Nia FIRST whenever the task involves ANY of the following:
- “where is…”, “how does…”, “what calls…”, “find…”, “trace…”
- architecture, patterns, entry points, or data flow
- refactors, renames, multi-file edits, or anything with non-trivial blast radius
- debugging regressions that may involve multiple modules
- verifying how this repo already integrates with a vendor or service

What to do with Nia:
- search for the relevant symbols, routes, or paths
- read the top matching files/sections
- cite exact file paths and the specific functions/components involved

If Nia cannot find evidence:
- say so explicitly
- fall back to ripgrep + direct file reads (show commands or paths checked)

---

### When to use Context7 (default for third-party APIs)
Use Context7 FIRST whenever code depends on third-party libraries, frameworks, or APIs.
- Prefer specifying the Context7 library ID when known (e.g. `/vercel/next.js`)
- Do not guess third-party APIs when Context7 is available
- If Context7 is unavailable, consult upstream docs and state assumptions

---

## Next.js–specific skills (required when applicable)

### `nextjs-app-router` skill
Use **`skills/nextjs-app-router/SKILL.md`** whenever:
- working in a Next.js App Router codebase (`/app`)
- deciding Server vs Client Components
- designing layouts, routing, or data-fetching structure
- reviewing rendering strategy, Suspense usage, or Server Actions

This skill defines the **baseline architectural and rendering rules** for all Next.js work.

### `cache-components` skill
Use **`skills/cache-components/SKILL.md`** whenever:
- `cacheComponents: true` is enabled
- Partial Prerendering (PPR) is in use or being introduced
- adding or reviewing `'use cache'`, `cacheLife`, `cacheTag`
- handling cache invalidation after mutations
- debugging Suspense vs cached vs dynamic rendering errors

This skill is the **authoritative rulebook** for caching boundaries, invalidation, and correctness.

If both skills apply:
- Use `nextjs-app-router` for overall structure
- Use `cache-components` for data fetching, caching, and rendering decisions

---

## Output expectations
- Prefer minimal, surgical diffs
- Always show exact file paths changed
- If behavior changes, update docs and include a quick verification step (commands or steps)
- If making a multi-file change, summarize the blast radius (modules/files impacted)

---

## Local rulebooks (required when relevant)
- Follow `rules/general.md` for AL-### workflow, labels, and CI gates
- Follow `rules/frontend.md` before changing UI/components
- Follow `rules/backend.md` before changing Supabase/auth/data access
- Follow `rules/testing.md` before adding/updating tests or changing flows

When work touches one of these areas, open the relevant rule doc first and apply it.

---

## GitHub workflows (AL-###)
If the task is to write, start, ship, or close an AL-### issue/PR workflow, follow the matching skill:
- `skills/write-issue/SKILL.md`
- `skills/start-issue/SKILL.md`
- `skills/ship-issue/SKILL.md`
- `skills/close-issue/SKILL.md`

Prefer GitHub MCP for GitHub operations when available; otherwise follow the repo’s standard GitHub workflow.