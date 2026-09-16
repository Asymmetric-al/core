# Single-page application patterns

Use this reference when a feature adds SWR, TanStack Query, or another browser data cache. For complete library APIs and runnable examples, follow the [Single-page applications guide](https://preview.nextjs.org/docs/app/guides/single-page-applications).

## Decide whether a client cache is needed

Use a client data library when the browser needs revalidation, optimistic mutations, request deduplication, or shared live data. If a Client Component only reads server data once, pass a Promise from its Server Component and unwrap it with `use()` instead.

## Keep ownership with the feature

```text
features/<domain>/
  <domain>-cache.ts          # Pure server tags + client keys
  <domain>-queries.ts        # Server reads and cacheLife
  <domain>-query-options.ts  # Client fetcher/query options
  hooks/use-*.ts             # Client mutations and coordination
  components/                # Async server owner + client leaves
```

The cache contract imports neither Next.js nor the client library. Queries, actions, route handlers, hydration code, query options, and hooks import identities from it. This prevents a key or tag spelling from drifting between a read and its invalidation.

Keep behavior in the layer that owns it:

- Server `cacheLife`, `cacheTag`, and database reads belong in `<domain>-queries.ts`.
- Browser freshness and refetch behavior belong in `<domain>-query-options.ts` or the SWR hook.
- Optimistic mutation behavior belongs in `hooks/use-*.ts`.
- Tiny effect-only or interactive leaves belong in `components/`.

## Seed from the server

The async feature component owns the initial read and the library's hydration provider. The page remains a synchronous composition surface and owns the feature's Suspense boundary.

- With SWR, seed the exact key read by `useSWR`. Use `preload` with `cacheData` when later `mutate(key)` calls must update the seeded entry itself.
- With TanStack Query, seed the same query key read by the client query and render the client subtree inside `HydrationBoundary`.

Do not move the initial read to the browser just because the feature also has a client cache.

## Coordinate Cache Components

The server cache and browser cache have independent freshness policies. Do not mirror `cacheLife` into `staleTime`, polling intervals, or SWR revalidation settings. Coordinate identities and invalidation, not durations.

For tag-driven data, a mutation updates the client cache for immediate feedback and invalidates the same server tag used by the seeded read. For a time-driven server read, choose its `cacheLife` from the server data's freshness requirement.

TanStack Query hydration adds one coupling: the hydration timestamp must advance whenever the seeded data advances. For tag-driven reads, cache the timestamp with the same tags as the data. For time-driven reads, derive the data and timestamp from the same cached snapshot. Do not cache a `QueryClient` or dehydrated payload.

## Mutate without drift

Let the client library own the optimistic browser update, rollback, and authoritative response. Let the write invalidate the server tag only after stored data changes. Do not add polling as a cache-coordination mechanism; add focus revalidation, intervals, SSE, or WebSockets only when the product actually needs external updates to appear automatically.
