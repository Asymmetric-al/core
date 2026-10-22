# Single-page application patterns

> **Core:** The vendor feature-local query/tag layout below is not Core placement authority. Server reads, server tags and invalidators stay in `packages/api` (including `src/shared/cache-tags.ts`). Feature-local files own browser query keys/options and client coordination only. Approved database hooks run in client leaves. Never make `packages/api` import an app feature or duplicate its server tag strings; coordinate client-key invalidation with the API-owned mutation contract.

Use this reference when a feature adds SWR, TanStack Query, or another browser data cache. For complete library APIs and runnable examples, follow the Single-page applications guide (installed: `node_modules/next/dist/docs/01-app/02-guides/single-page-applications.md`).

## Decide whether a client cache is needed

Use a client data library when the browser needs revalidation, optimistic mutations, request deduplication, or shared live data. If a Client Component only reads server data once, pass a Promise from its Server Component and unwrap it with `use()` instead.

## Keep ownership with the feature

```text
features/<domain>/
  <domain>-cache.ts          # Browser query keys/options only (Core)
  <domain>-query-options.ts  # Client fetcher/query options
  hooks/use-*.ts             # Client mutations and coordination
  components/                # Async server owner + client leaves
```

Vendor next-beats also colocates `<domain>-queries.ts` and server tags in `<domain>-cache.ts`. **Core remap:** server reads, `cacheTag`, and invalidators stay in `packages/api`.

**Core remap:** the following shared feature-cache contract is vendor guidance; Core separates API-owned server identities from client-owned browser keys as described above.

The cache contract imports neither Next.js nor the client library. Queries, actions, route handlers, hydration code, query options, and hooks import identities from it. This prevents a key or tag spelling from drifting between a read and its invalidation.

Keep behavior in the layer that owns it:

- Server `cacheLife`, `cacheTag`, and database reads belong in `packages/api` (Core); vendor next-beats puts them in `<domain>-queries.ts`.
- Browser freshness and refetch behavior belong in `<domain>-query-options.ts` or the SWR hook.
- Optimistic mutation behavior belongs in `hooks/use-*.ts`.
- Tiny effect-only or interactive leaves belong in `components/`.

## Seed from the server

The async feature component owns the initial read and the library's hydration provider. The page remains a synchronous composition surface and owns the feature's Suspense boundary.

- With SWR, seed the exact key read by `useSWR`; follow the Next.js [SWR guide](https://nextjs.org/docs/app/guides/client-side-data-fetching/swr) and the library's [Next.js guidance](https://swr.vercel.app/docs/with-nextjs).
- With TanStack Query, seed the same query key read by the client query; follow the Next.js [TanStack Query guide](https://nextjs.org/docs/app/guides/client-side-data-fetching/tanstack-query) and the library's [Advanced Server Rendering guide](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr).

Do not move the initial read to the browser just because the feature also has a client cache.

## Coordinate Cache Components

Use the Next.js [TanStack Query guide](https://nextjs.org/docs/app/guides/client-side-data-fetching/tanstack-query) or [SWR guide](https://nextjs.org/docs/app/guides/client-side-data-fetching/swr) as the source of truth for cache boundaries, sharing policy, lifetimes, tags, and hydration behavior. Do not reproduce that framework guidance in this skill.

The architecture rule here is ownership only: the async feature component owns the initial server seed and hydration provider, while the page owns the feature's Suspense boundary and loading sequence.

For personalized hydration that should be reused across server requests, also follow the trusted-identity boundary in `references/cache-components.md`.

## Mutate without drift

Let the client library own the optimistic browser update, rollback, and authoritative response. Let the write invalidate the server tag only after stored data changes. Do not add polling as a cache-coordination mechanism; add focus revalidation, intervals, SSE, or WebSockets only when the product actually needs external updates to appear automatically.
