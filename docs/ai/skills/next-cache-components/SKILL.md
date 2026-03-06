---
name: next-cache-components
description: Deep operational guidance for Next.js Cache Components (`use cache`, `cacheLife`, `cacheTag`, `updateTag`, `revalidateTag`) and PPR boundaries.
metadata:
  owner: "skills-steward"
  last_updated: 2026-03-06
  status: "active"
  upstream:
    url: "https://skills.sh/vercel/nextjs-skills/next-cache-components"
    repo: "vercel-labs/next-skills"
    path: "skills/next-cache-components/SKILL.md"
    license: "MIT"
license: MIT
---

# Next Cache Components

Use this skill for detailed Next.js 16 cache component implementation and migration patterns.

## When to Apply

Use this skill when:

- Enabling or operating `cacheComponents: true`
- Designing static/cached/dynamic route boundaries under App Router
- Migrating `experimental.ppr` or `unstable_cache` usage
- Implementing tag-based cache invalidation after mutations

Do not use this skill when:

- The task is only generic App Router structure with no cache-boundary changes

## Core Rules

1. Use `'use cache'` for shared async data; keep request-specific reads dynamic.
2. Do not read `cookies()`, `headers()`, or `searchParams` directly inside cached scopes (except documented private-cache cases).
3. Always pair cached data with explicit `cacheLife` and/or `cacheTag` strategy.
4. Use `updateTag` for immediate consistency and `revalidateTag` for stale-while-revalidate flows.
5. Wrap dynamic user/request sections in Suspense boundaries when combining with cached shells.

## Workflow

1. Classify each dependency: static, cached, or request-dynamic.
2. Apply `'use cache'` + lifetime/tag policy to cacheable units.
3. Isolate runtime APIs outside cached scopes and pass serializable inputs.
4. Choose invalidation mode (`updateTag` vs `revalidateTag`) per UX requirement.
5. Validate PPR behavior and cache refresh semantics with representative flows.

## Checklist

- [ ] Cache Components are enabled intentionally for the target app
- [ ] Cached scopes avoid runtime request APIs
- [ ] Lifetime and tag strategy is explicit
- [ ] Mutation paths invalidate the right tags
- [ ] Dynamic content is isolated with Suspense where applicable
- [ ] Migration away from legacy caching APIs is complete where touched

## References

- `references/upstream.md` for source mapping and attribution
