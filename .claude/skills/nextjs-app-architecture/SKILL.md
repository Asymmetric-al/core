---
name: nextjs-app-architecture
description: Build or audit Next.js 16 App Router apps using a next-beats-style React Server Components architecture. Use when scaffolding a new app, adding a feature, reviewing an existing app, refactoring route-loader-shaped pages into feature-owned async server components, deciding where queries/actions/components live, keeping pages synchronous with `params.then()`, placing Suspense boundaries, choosing the client/server boundary, designing skeletons, preventing CLS, or enabling Cache Components. Also use when the user asks about RSC composition, components receiving IDs instead of route params, `'use cache'`, `cacheTag`, `updateTag`, static-shell prerendering, or making an app easier for AI agents to modify.
license: MIT
metadata:
  author: aurorascharff
  version: "1.3.9"
---

## This repository (Asymmetric-al/core)

Subordinate to installed Next.js docs (`apps/<app>/node_modules/next/dist/docs/` or `.next-docs/`), **`docs/ai/rules/frontend.md`**, **`docs/ai/skills/nextjs-app-router/SKILL.md`**, **`docs/ai/skills/cache-components/SKILL.md`**, and **`docs/guides/architecture/data-access-boundary.md`**.

This skill is for page composition, Suspense placement, leaf client boundaries, and feature-owned UI. It is not a license to invent a new app folder scheme or move business database logic.

**Repo mapping:**

- Privileged reads, writes, payments, webhooks, and vendor calls stay in `packages/api`.
- Browser-visible table data uses `@asym/database/hooks` when a collection exists.
- Shared UI stays in `@asym/ui` / exact `base-maia`. Existing `apps/*/features/` directories are UI composition, not a new query layer.
- All apps already run `cacheComponents: true` and `partialPrefetching: true`. Do not "enable Cache Components." Follow Instant Navigation (Stream / Cache / explicit Block) in `docs/ai/rules/frontend.md`.
- Get API mechanics from the installed Next.js docs, not `preview.nextjs.org` or remembered APIs.
- Do not add Zustand. Use the installed TanStack Query / TanStack DB patterns from `docs/ai/rules/frontend.md`.
- Do not regenerate or expand the managed root `AGENTS.md`.

**Core remaps** — follow the numbered workflow, but replace these upstream lines:

- **Invariant 7 and workflow steps 3–4:** "Feature-owned" means the feature component owns _when_ it reads and _which_ `@asym/api` function or `@asym/database` hook it calls. Do **not** create `features/<domain>/<domain>-queries.ts` or `features/<domain>/<domain>-actions.ts` for business or privileged data. Those reads and mutations stay in `packages/api`.
- **Prerequisite:** Prefer the project's installed Next.js docs (`apps/<app>/node_modules/next/dist/docs/` or `.next-docs/`). Do not create or refresh root `AGENTS.md` from `preview.nextjs.org`.

Refresh: `references/upstream.md`.

# Next.js App Architecture

A workflow for building and auditing Next.js 16+ App Router apps so they follow one consistent, feature-sliced RSC architecture like `next-beats`.

**Follow the workflow below step by step** — it produces the invariants by construction. Load the reference a step names for the decision it depends on. Get framework _mechanics_ (API signatures, config options, hook contracts) from the linked docs — don't restate or improvise them.

## Prerequisite

Before changing a Next.js app, make sure the project is set up for AI agents to read version-matched docs. Follow the [AI Coding Agents guide](https://preview.nextjs.org/docs/app/guides/ai-agents): prefer the project's `AGENTS.md` / bundled docs, and create or refresh them when missing. Then use this skill for architecture decisions.

## Architecture target

Build pages that describe the loading experience, not pages that act like route loaders:

- `app/**/page.tsx` and `layout.tsx` are synchronous composition surfaces: static chrome, section headings, `<Suspense>` boundaries, error boundaries, and transition wrappers.
- Feature components own their reads on the server. They receive minimal stable inputs (`id`, `slug`, `handle`, parsed filter values) or already-fetched records, never raw `params` / `searchParams`.
- Queries and actions live in the feature folder. Components import queries; client leaves import actions directly.
- When server tags and client query keys describe the same feature data, a pure feature-local cache contract owns those identities.
- Stable chrome, wrappers, and skeletons preserve layout: cards/panels stay outside Suspense, and fallbacks swap only the data-dependent body.

## Invariants (what every change must satisfy)

The non-negotiables. The workflow produces them; the final check verifies them.

1. **Pages compose, they never fetch.** A page/layout imports feature components and places `<Suspense>`. No queries or domain logic inline. Tiny route-local control-flow helpers are allowed only when they exist to place a boundary around `connection()`, `redirect()`, or a resolved route prop.
2. **Pages stay synchronous.** Use `params.then()` / `searchParams.then()` or `Promise.all([params, searchParams]).then(...)`, never `await params` at the top — so chrome paints into the static shell and only data-dependent sections suspend.
3. **Feature components receive IDs, not route props.** Resolve `params` / `searchParams` at the page boundary and pass plain values (`id`, `slug`, `query`) into features.
4. **Async server component is the default.** `'use client'` only for hooks, event handlers, or browser APIs — and only on leaves, never on parents of server content.
5. **The page owns the Suspense boundary; the feature owns the skeleton.** Features never pre-wrap themselves in `<Suspense>`; stable wrappers/cards/chrome wrap the boundary instead of being duplicated in fallback and final content.
6. **Skeletons live in the same file as the component**, exported alongside it, defined at the end. `Feed` and `FeedSkeleton` are siblings.
7. **Queries live in `<domain>-queries.ts`** (`import 'server-only'`); **actions live in `<domain>-actions.ts`** (`'use server'`). The file name matches the folder, even for sub-concepts.
8. **Feature folders follow product ownership.** Entity-owned sub-concepts (favorite, like, vote, bookmark) fold into their parent. A route-level experience that composes multiple domains may own its UI and state in a separate feature while each domain keeps its queries and actions.
9. **Client components import actions directly** — never receive a server action as a prop just to call it.
10. **Feature-local cache coordination stays with its domain.** Put pure tags/keys in `<domain>-cache.ts`, client query definitions in `<domain>-query-options.ts`, hook wrappers in `hooks/use-*.ts`, and tiny client leaves in `components/`; promote support code only after real cross-feature reuse.
11. **Interactive async UI keeps server data on the server and client state local to the interaction.** Use `useOptimistic`, `useTransition`, reducers, URL/search params, and form actions instead of mirrored prop state, derived-state effects, or hand-rolled pending arrays.

## Workflow

Run these in order for build-from-scratch, feature work, or audits. Each step names the reference to consult and the check it must pass.

1. **Choose mode.**
   - **Build from scratch:** sketch routes, real domain nouns, static shell, and expected loading groups before writing code.
   - **Audit/refactor:** scan current `app/` pages first; list every async page, page-level query import, route prop leak, missing Suspense boundary, and feature folder mismatch.
     → `references/example.md` for the target shape; `references/feature-folders.md` for placement.
     ✓ You know whether you are creating the architecture or converting loader-shaped code into it.
2. **Place the work.** Decide the feature folder before writing anything.
   → `references/feature-folders.md` (decision tree + merge rules).
   ✓ A real domain, a cross-domain product experience, or folded into the right parent.
3. **Write the query and, when a client cache shares its data, the cache contract.** Put server reads in `<domain>-queries.ts` with `import 'server-only'`; keep shared tag/key identities in a pure `<domain>-cache.ts`.
   → `references/queries-actions.md`; for SWR/TanStack Query → `references/single-page-applications.md`; with `cacheComponents: true`, also → `references/cache-components.md`.
   ✓ Cache identities are defined once; server reads are server-only, cached/tagged/lifetimed under Cache Components, and return domain types rather than ORM rows.
4. **Write the action** (if there's a mutation). `features/<domain>/<domain>-actions.ts`, `'use server'` at the top.
   → `references/queries-actions.md`.
   ✓ Re-checks auth, validates input, invalidates matching cache tags under Cache Components (`refresh()` only for justified dynamic reads), returns a discriminated union.
5. **Build the component + skeleton.** `features/<domain>/components/<name>.tsx`: an async server component that awaits its own query from minimal props; `'use client'` only on interactive leaves.
   → `references/components.md`; for a client data library or strict-SPA/CSR feature → `references/single-page-applications.md`.
   ✓ Component receives IDs/handles/parsed filters or already-resolved records, not `params`; skeleton is a sibling export at the end; no alias skeleton wrappers.
6. **Compose the page.** `app/<route>/page.tsx`: synchronous, `params.then()` / `Promise.all(...).then(...)`, place Suspense around data bodies, and wrap fallible sections in an error boundary.
   → `references/pages-suspense.md`.
   ✓ Route props become plain values; stable cards/sections wrap Suspense when they set layout; boundaries stay visible at the page.
7. **Add interaction** (if any): optimistic updates, pending state, toasts, confirmation.
   → `references/ux-patterns.md`.
   ✓ Feedback isn't doubled; optimistic reducers/actions live with the feature; URL/search params own shareable state; client effects synchronize external systems, not derived React state.
8. **Verify** against the checklist below before declaring done.

## Verify before done

Inspect the diff against every invariant — each is checkable by reading the changed files:

- [ ] No page/layout imports a `*-queries` file or defines reusable domain UI inline; any inline helper is route-local control flow only.
- [ ] Every page with params is synchronous and uses `params.then()` / `searchParams.then()` / `Promise.all([params, searchParams]).then(...)`.
- [ ] Feature components receive plain IDs/handles/parsed filters or resolved records; no feature prop is named `params` or `searchParams`.
- [ ] Every `<Suspense>` for page data sits in the page; no feature pre-wraps itself.
- [ ] Stable wrappers/cards/chrome sit outside Suspense; fallback and final content do not duplicate the same outer card.
- [ ] Every component has its real `*Skeleton` in the same file, at the end; no tiny skeleton aliases just to pass props.
- [ ] Every `*-queries.ts` starts with `import 'server-only'`; every `*-actions.ts` with `'use server'`.
- [ ] With `cacheComponents: true`, reusable reads use `'use cache'` / `cacheTag` / `cacheLife`, or `'use cache: private'` / `'use cache: remote'` when appropriate; any dynamic read is intentional and justified.
- [ ] Mutations touching cached reads call `updateTag()` / `revalidateTag(..., 'max')` for the matching tags; `refresh()` is not a substitute for tag invalidation.
- [ ] Action files are named `<folder>-actions.ts`; no entity-owned sub-concept spawned its own folder, and cross-domain product features do not take ownership of entity queries/actions.
- [ ] Features with both server tags and client query keys define them once in a pure `<domain>-cache.ts`; queries, actions, hydration, query options, and hooks import from it.
- [ ] Feature-local client-support files sit in the smallest fitting place: query options at the feature root, `use-*` hook wrappers in `hooks/`, leaf components in `components/`, and shared support only after real cross-feature reuse.
- [ ] `'use client'` components are leaves — they import actions/hooks/providers, not async server components.
- [ ] Client leaves use `useOptimistic`, transitions, reducers, URL state, or form actions for interaction; they do not call `setState` in effects for derived React state.
- [ ] Mutations validate their input and invalidate the affected data.

## Reference index

- **`references/feature-folders.md`** — where code goes: folder layout, cache contracts, naming, and merging sub-concepts.
- **`references/queries-actions.md`** — query/action rules: server-only, dedup, validation, invalidation, return shape.
- **`references/components.md`** — server/client boundary, skeletons, `use()`, single-use helpers, live data.
- **`references/pages-suspense.md`** — page composition, `params.then()`, Suspense placement, CLS, error boundaries, prefetch.
- **`references/cache-components.md`** — the `cacheComponents` decisions: which reads to cache, which directive to use, how to invalidate.
- **`references/single-page-applications.md`** — client cache decisions: placement, server seeding, Cache Components coordination, hydration, and mutations.
- **`references/ux-patterns.md`** — interaction decisions: optimistic vs pending vs inline error, toasts, action-prop, confirmations.
- **`references/example.md`** — the next-beats reference app: invariant → file map, for seeing any rule in real code.
