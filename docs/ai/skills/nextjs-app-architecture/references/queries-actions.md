# Queries and actions

> **Core:** Vendor next-beats placement. In this repo, do not copy `db.*` into `features/<domain>/*-queries.ts` or `*-actions.ts`. Privileged reads and writes stay in `packages/api`. Async Server Components call published server-read subpaths and must pass the role/app shell gate before service-role/admin-client reads; only client leaves use `@asym/database/hooks` for approved browser tables. Client mutations use an approved hook/API route or an authenticated `'use server'` adapter delegating to the API owner. The vendor procedure below is placement-only and must not be copied into `apps/*/features/`. Examples explicitly labeled Core use real package contracts; ordinary server exports are not callable client actions.

The data layer. Every feature has both: queries to read, actions to write.

This page covers the universal data layer that applies to every Next.js App Router app. When `cacheComponents: true` is enabled, follow `references/cache-components.md`: reusable reads are cached/tagged/lifetimed, and mutations update matching tags.

## Cache identities

When a server read also seeds a browser data cache, follow `references/single-page-applications.md` for client-library placement. **Core:** server tags/invalidators remain API-owned; feature-local contracts contain browser query keys/options only. Coordinate invalidation explicitly without an API-to-app import or duplicated server tag strings.

## Queries

Vendor placement: create `features/<domain>/<domain>-queries.ts` with `import 'server-only'` and plain async exports. **Core:** skip that file; call an existing published server-read subpath from a Server Component. For example, `getDashboardStats(tenantId)` is exported by `@asym/api/reads/dashboard-stats` and returns `DashboardStats`; its caller must first prove current authorization, including the role/app shell gate for service-role/admin-client reads, and derive the Tenant from trusted server context. It is not a client-callable action.

Resource queries own `notFound()` when a requested record is absent. Route pages only compose the feature and pass route values down; they do not perform data lookups or decide resource existence.

For browser post reads, Core already has this thin transport boundary. The API-owned `GET` authenticates, validates filters and derives Tenant scope; the browser calls the route instead of importing its server implementation.

```ts
// apps/donor/app/api/posts/route.ts
export { GET, POST } from "@asym/api/posts";
```

## Cache keys are the arguments

A `'use cache'` function's arguments are its cache key, so shape them deliberately.

Take normalized primitives, not the params object:

```ts
// features/book/book-queries.ts
export async function getBooksPage(
  page: number = 1,
  search: string = "",
  year: number = MAX_YEAR,
) {
  "use cache";
  cacheLife("hours");
  // ...
}
```

Passing `searchParams` straight through keys the entry on an object carrying every param the route knows about, including the ones the caller left undefined, and the key then changes shape whenever the route gains a param.

Normalize and clamp in the feature's own helper, **before** the call, not inside the cached function. `?yr=9999`, `?yr=2023`, and no `yr` at all describe the same result set, so they should resolve to the same arguments and share one entry. Clamping inside the cached function gives each spelling its own entry with identical contents.

Use [`cache()`](https://react.dev/reference/react/cache) from React only for **request-level deduplication** when the same dynamic query is called multiple times with the same arguments in one render. Highest-value cases: a session/user lookup used by many queries, or a shared expensive read used by metadata + page sections. Don't wrap every query "just in case" — it adds indirection and can hide when data is intentionally dynamic.

`cache()` dedups within a request; `'use cache'` + `cacheTag` (Cache Components) shares results _across_ requests. Don't add React `cache()` to a function only because it already uses `'use cache'`; that is double-caching unless you have a separate, proven same-request duplication problem. See `references/cache-components.md`.

## Actions

Vendor placement: create `features/<domain>/<domain>-actions.ts` with `'use server'` at the top. **Core:** skip that feature-local file. Reuse an approved hook/API route, or place a thin authenticated `'use server'` adapter in an established app boundary and delegate business work to `packages/api`. At the callable boundary, always:

1. Verify auth.
2. Validate input with your schema validator.
3. Run the mutation.
4. Invalidate cached data so the next render sees the new state.
5. Return the boundary's established result contract: a typed HTTP response for Core's route examples, or an action result such as `{ ok }` / `{ error }` for a Server Action.

Core's existing post-like mutation uses authenticated HTTP handlers, not a Server Action:

```ts
// apps/donor/app/api/posts/[postId]/like/route.ts
export { POST, DELETE } from "@asym/api/posts/like";
```

The client calls `/api/posts/<postId>/like` through its approved mutation hook or fetcher. When this example uses `fetch` directly, inspect `response.ok` before treating the write as applied. The API handler resolves current actor, Tenant and post scope, applies the owning RPC and invalidates API-owned tags after an applied write. Do not import `POST` or `DELETE` into a Client Component. API subpaths publish different contracts: inspect the actual export rather than inventing a `posts.create` namespace.

`refresh()` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/refresh.md`) re-renders the current route for the current user. Use it when the affected read is deliberately dynamic and has no tag. With Cache Components enabled, reusable reads should have matching `cacheTag()` calls, so server actions normally call `updateTag()` for read-your-own-writes. See `references/cache-components.md`.

### Action file naming

Vendor actions for a feature always go in `<folder>-actions.ts`, matching the folder name — even when the mutation operates on a sub-concept. Vendor next-beats therefore puts `toggleFavorite` in `event-actions.ts`, not `favorite-actions.ts`. **Core:** do not add that file; keep the button in the parent feature and put the privileged write in `packages/api`.

## Calling actions from client components

Vendor Client Components import their real Server Actions directly. **Core:** direct client imports are valid only for a dedicated `'use server'` export; an ordinary server-only API function is not an action. Use the existing hook/API-route path when no action adapter exists. Installed Next.js docs also allow an inline Server Action to be passed to a client as an action prop.

```tsx
// Core right — call the existing authenticated route, not a feature-local action file
"use client";

export function LikeButton({ postId }: { postId: string }) {
  return (
    <button
      onClick={() => {
        void fetch(`/api/posts/${postId}/like`, { method: "POST" }).then(
          (response) => {
            if (!response.ok) {
              throw new Error("Like failed");
            }
          },
        );
      }}
    >
      Like
    </button>
  );
}
```

```tsx
// Core right — Server Components pass serializable ids into the client leaf
async function Post({ id }: { id: string }) {
  return <LikeButton postId={id} />;
}
```

```tsx
// Wrong — don't invent a callback prop to hide the route call
export function WrongPost({ id }: { id: string }) {
  return (
    <LikeButton
      onLike={() => {
        void fetch(`/api/posts/${id}/like`, { method: "POST" });
      }}
    />
  );
}
```

Design components (`<BottomNav>`, `<ToggleGroup>`, `<SubmitButton>`) take this further with the **action-prop pattern** — `action` is a callback wrapped in `useTransition` / `useOptimistic` internally. See `references/ux-patterns.md`.

## Form actions vs onClick handlers

Prefer [`<form action={serverAction}>`](https://react.dev/reference/react-dom/components/form#action) for form mutations — React wraps the call in a transition and surfaces pending state automatically.

For one-off buttons, `onClick={() => action(args)}` is fine. Wrap in [`startTransition`](https://react.dev/reference/react/startTransition) if you need pending state.

## Return shape

Return a discriminated union from actions that can fail:

```tsx
export type ActionResult<T = void> =
  | ([T] extends [void] ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string };
```

Toast on `ok: false` from the client. Skip success toasts when an optimistic UI already shows the result.

A shared `ActionResult<T>` is optional — a per-action inline union is just as good, and often clearer when the payload has a natural name: `return { ok: true as const, playlist }` reads better than a generic `data`. What matters is that fallible actions return a discriminated union the client can narrow on, not that every action shares one type.

## Mappers and domain types

If your DB rows have shapes you don't want to leak to components (extra columns, ORM-specific types), write a mapper inside the query:

In Core, privileged row projection stays inside `packages/api`. A feature may shape an already-authorized API result for presentation, using its real published type:

```ts
import type { DashboardStats } from "@asym/api/reads/dashboard-stats";

type DashboardSummary = Pick<
  DashboardStats,
  "totalDonors" | "totalMissionaries"
>;

function toDashboardSummary(stats: DashboardStats): DashboardSummary {
  return {
    totalDonors: stats.totalDonors,
    totalMissionaries: stats.totalMissionaries,
  };
}
```

Components see an authorized domain projection, not the raw ORM row. If a presentation type is imported by multiple files in the feature, put it under `features/<domain>/types/` (for example `features/dashboard/types/dashboard-summary.ts`). Promote it to top-level `types/` only when multiple features import it.
