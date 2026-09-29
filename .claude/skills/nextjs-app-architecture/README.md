# Next.js App Architecture Skill

An agent skill for building or auditing Next.js 16+ App Router apps. It packages the patterns from [Component Architecture for React Server Components](https://aurorascharff.no/posts/component-architecture-for-react-server-components/) and the [next-beats](https://github.com/vercel-labs/next-beats) reference app into a form AI coding agents can load and apply.

## Install

```bash
npx skills add aurorascharff/nextjs-app-architecture-skill
```

## The six principles

- **Pages are synchronous compositors.** They don't fetch, they compose.
- **Async components fetch their own data.** Co-locate the read with the JSX.
- **Route props stop at the page.** Components receive IDs, slugs, parsed filters, or records — not raw `params` / `searchParams`.
- **Skeletons live next to their component.** Same file, exported alongside it.
- **Suspense boundaries go at the page level.** The page designs the loading sequence.
- **Client boundaries are leaf nodes.** Push `'use client'` as deep as it can go.

## Prerequisite

Before using the skill on a project, follow the [Next.js AI Coding Agents guide](https://preview.nextjs.org/docs/app/guides/ai-agents) so the agent reads version-matched Next.js docs from `AGENTS.md` / bundled docs instead of stale training data.

## What it covers

- **Feature folders** — domain ownership, cross-domain product experiences, merging sub-concepts into a parent, and file naming.
- **Queries** — `import 'server-only'`, plain async reads by default, selective React `cache()` only for proven same-request dedup, and `'use cache'` + `cacheTag` + `cacheLife` for Cache Components.
- **Actions** — `'use server'`, input validation, tag invalidation under Cache Components, calling from client components.
- **Components** — async server components that receive IDs/parsed values, sibling skeletons, single-use helpers, the client boundary, the `use()` + promise-prop pattern, live data via polling.
- **Pages** — sync page composition, `params.then()` for static-shell preservation, Suspense boundary placement, CLS prevention, error boundaries, audit smells.
- **Cache Components** — when to opt in, the static-shell model, `'use cache'` variants, build constraints.
- **UX patterns** — `useOptimistic`, toasts, pending state, destructive-action flows, the action-prop pattern, URL pagination.

## References

The `SKILL.md` overview is always loaded; references split into two zones so the agent pulls only what the task needs.

**Core** (any RSC app):

- [`references/feature-folders.md`](references/feature-folders.md) — folder layout, naming, merging sub-concepts, action/query file naming.
- [`references/queries-actions.md`](references/queries-actions.md) — server-only queries, selective same-request dedup, server actions, validation, and cache/tag invalidation.
- [`references/components.md`](references/components.md) — async server components, skeletons without alias wrappers, client boundary, promise + `use()`, single-use helpers, polling.
- [`references/pages-suspense.md`](references/pages-suspense.md) — page composition, `PageProps` / `LayoutProps`, `params.then()`, Suspense placement, CLS prevention, error boundaries.
- [`references/example.md`](references/example.md) — next-beats invariant map and supporting patterns.

**Instant Apps** (opt-in, load only when optimizing for instant-feeling apps):

- [`references/cache-components.md`](references/cache-components.md) — `cacheComponents: true`, the static shell, which reads to cache, `'use cache'` variants, `cacheTag` / `cacheLife`, `updateTag` / `revalidateTag`, and `io()` vs `connection()`.
- [`references/single-page-applications.md`](references/single-page-applications.md) — SPA-style client caching and navigation patterns.
- [`references/ux-patterns.md`](references/ux-patterns.md) — `useOptimistic`, toasts, pending state via `data-pending`, destructive flows, the action-prop pattern, URL pagination, `useFormStatus`.

## Background reading

- [Component Architeture for React Server Components](https://aurorascharff.no/posts/component-architecture-for-react-server-components/)
- [Server and Client Component Composition in Practice](https://aurorascharff.no/posts/server-client-component-composition-in-practice/)
- [Building Design Components with Action Props using Async React](https://aurorascharff.no/posts/building-design-components-with-action-props-using-async-react/)
- [Error Handling in Next.js with catchError](https://aurorascharff.no/posts/error-handling-in-nextjs-with-catch-error/)
- [Avoiding Server Component Waterfall Fetching with React 19 cache()](https://aurorascharff.no/posts/avoiding-server-component-waterfall-fetching-with-react-19-cache/)
- [next16-social-media](https://github.com/aurorascharff/next16-social-media) — demo app applying these patterns.

**Companion skill:** [React View Transitions](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-view-transitions).

## License

MIT
