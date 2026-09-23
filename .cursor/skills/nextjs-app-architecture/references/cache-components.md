# Cache Components

> **Core:** Server reads, cache tags and invalidators remain in `packages/api`; feature-local cache files own browser keys only. Apply Core's Stream / Cache / explicit Block rules and installed Next.js docs before the vendor recipes below. A client mutation calls an approved hook/API route or authenticated Server Action adapter, not an ordinary API server export.

> **Core:** All apps already set `cacheComponents: true`. Do not "enable" the flag. In payments, auth, and other privileged webhooks, use `revalidateTag(tag, { expire: 0 })` when stale data must not be served and `updateTag` cannot be used.

Decisions for when `cacheComponents: true` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md`) is set in `next.config.ts`. This file is about _which reads to cache, which directive to use, and how to invalidate_ — for the mechanics of each directive, follow the doc links.

## When this reference applies

Use this reference when an app already has `cacheComponents: true`, the user wants this architecture while enabling it, or you are reviewing/refactoring an app that targets Cache Components.

If the project has not adopted Cache Components yet and the user asks to enable, migrate, or work through adoption blockers, use the `next-cache-components-adoption` skill first. It owns the route-by-route migration loop, opt-out strategy, and build/dev overlay workflow. Then return here for steady-state query/action/component architecture.

If `cacheComponents` is not enabled and the task is ordinary feature work, follow the core references without adding cache directives. Do not recommend skipping Cache Components based on app category alone; adoption is a migration/project decision, not a per-feature shortcut.

Adopting these in an existing app: follow Migrating to Cache Components (installed: `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`) and Adopting Partial Prefetching (installed: `node_modules/next/dist/docs/01-app/02-guides/adopting-partial-prefetching.md`) — they cover the incremental path (per-route `prefetch = 'partial'`, fixing dynamic-usage build errors) rather than a big-bang switch.

## The model

```ts
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true, // prefetch the static shell of linked routes
};
```

- **Static shell** — synchronous content, `'use cache'` output, and Suspense fallbacks prerender at build time.
- **Dynamic holes** — async work without `'use cache'` streams in behind `<Suspense>` at request time.
- **Build constraint** — any async work without `'use cache'` must sit inside `<Suspense>`, or the build fails (wrap it, or add `'use cache'`).

`cacheComponents` implies Partial Prerendering — it replaced `experimental.ppr` / `dynamicIO` / `useCache`, so don't set those. See caching (installed: `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`).

With `cacheComponents: true`, the skill practice is **cache reusable reads**. Do not leave a database/API read dynamic just because Suspense makes the build pass. If a read has a stable key and a mutation can name what changed, give it a cache directive, tags, and a lifetime.

Dynamic reads are the exception: use them for values that must be recomputed for every request or cannot be invalidated coherently. When you leave a read dynamic, note the reason in the surrounding code/review and invalidate its mutations with `refresh()` because there is no tag to update.

## Decide what to cache

| Data                                                            | Directive                                                                                                                    | Notes                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cacheable across users (public listings, computed pages)        | `'use cache'` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md`)                  | Add `cacheTag` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheTag.md`) (a global + a scoped tag) and a `cacheLife` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheLife.md`) profile. |
| Request data that cannot be moved out / browser-only compliance | `'use cache: private'` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache-private.md`) | Use only when refactoring request access out is impractical or browser-only storage is required. Requires `cacheComponents` and explicit `cacheLife`; browser memory only, no custom server handler.                                                                        |
| Remote service, safe across users, worth durable storage        | `'use cache: remote'` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache-remote.md`)   | Durable sharing requires a qualified `cacheHandlers.remote` or provider-supplied remote handler. Without one, the installed runtime falls back to the default in-memory handler; the directive alone does not prove persistence.                                            |
| Genuinely dynamic per request                                   | none                                                                                                                         | Must be justified. Read inside `<Suspense>`; mutations use `refresh()` because no tag exists.                                                                                                                                                                               |

Cache the **query** when its result should be reused across requests. Cache the **component** when rendering is expensive and props are stable (a nav, a trending sidebar). Don't `'use cache'` a component that already calls a `'use cache'` query — double-caching, no benefit.

## Keep a synchronous value out of the shell

You usually don't need this. A query that reads `cookies()`/`headers()` or awaits a DB/`fetch` inside `<Suspense>` already stays out of the shell on its own. Only a _synchronous_ request-time read (`new Date()`, `Math.random()`, a sync sqlite read) needs help: `await` `io()` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/io.md`) before it, with the caller inside `<Suspense>`.

Prefer `io()` over `connection()` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md`): both exclude what follows from the shell, but `connection()` blocks prefetches while `io()` stays prefetchable. Reach for `connection()` only when rendering must wait for a real user request.

## Decide how to invalidate

- `updateTag(tag)` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/updateTag.md`) — in **server actions**, when the user should see the result immediately (read-your-own-writes). Requires the query to carry a matching `cacheTag`.
- `revalidateTag(tag, { expire: 0 })` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md`) — in **route handlers** for payments, auth, and other privileged webhooks when stale data must not be served. The next request is a blocking revalidate / cache miss. Use this when `updateTag` cannot be used.
- `revalidateTag(tag, 'max')` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md`) — in **route handlers** (webhooks, cron) for stale-while-revalidate. The single-arg `revalidateTag(tag)` form is deprecated.
- `refresh()` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/refresh.md`) — re-render the current route for the current user. Use it for deliberately dynamic reads with no tag; don't use it instead of `updateTag()` for cached reads.

Tag, cache, invalidate: the `cacheTag` on the API-owned read and the `updateTag` / `revalidateTag` in the owning mutation use the same string from `packages/api/src/shared/cache-tags.ts` (or that read's API domain module). Feature-local files own browser query keys only.

## Coordinate hydrated client data

When cached server data seeds SWR, TanStack Query, or another browser cache, follow `references/single-page-applications.md`. Server and client freshness policies are independent; hydration adds library-specific constraints.

## Build failure map

When `next build` fails under Cache Components, map the error back to an architecture rule instead of patching locally:

- Async work without `'use cache'` and without an ancestor `<Suspense>` → cache the reusable read, or wrap a justified dynamic read in a page-owned `<Suspense>`.
- Request data inside `'use cache'` → prefer reading request inputs outside and passing safe stable values into a qualified cache; use `'use cache: private'` only for the bounded case above, or stream dynamic data.
- `await params` / `await searchParams` at the top of a page → keep the page synchronous and move the read into `params.then()` / `searchParams.then()`.
- Sync request-time values (`new Date()`, `Math.random()`, sync storage reads) captured in the shell → cache stable values, or use `io()` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/io.md`) for per-request values.

For adoption-wide blocker triage, use `next-cache-components-adoption`. For API-specific recipes, follow the Migrating to Cache Components guide (installed: `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`).

## Without Cache Components

- Don't use `'use cache'` / `cacheTag` / `cacheLife` — they require the flag.
- Use React `cache()` only for proven same-request dedup needs; plain `server-only` async queries are the default.
- `refresh()` from Server Actions only rerenders the client route. For explicitly cached `fetch` or `unstable_cache` data, use the owning `revalidatePath` or `revalidateTag` policy; reserve refresh alone for deliberately uncached reads.
- Pages still use `params.then()` in this architecture. Without Cache Components there is no build-time static shell to preserve, but keeping pages synchronous still lets chrome paint before route-specific data resolves and keeps the app consistent.
