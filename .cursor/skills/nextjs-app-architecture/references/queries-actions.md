# Queries and actions

> **Core:** Vendor next-beats placement. In this repo, do not copy `db.*` into `features/<domain>/*-queries.ts` or `*-actions.ts`. Privileged reads and writes stay in `packages/api`. Feature components import those APIs, or `@asym/database/hooks` for approved browser tables. The vendor procedure below is placement-only and must not be copied into `apps/*/features/`.

The data layer. Every feature has both: queries to read, actions to write.

This page covers the universal data layer that applies to every Next.js App Router app. When `cacheComponents: true` is enabled, follow `references/cache-components.md`: reusable reads are cached/tagged/lifetimed, and mutations update matching tags.

## Cache identities

When a server read also seeds a browser data cache, follow `references/single-page-applications.md` for the feature-local cache contract and client-library placement.

## Queries

Create `features/<domain>/<domain>-queries.ts`. Mark it `import 'server-only'` — that's the invariant. Default to plain async exports.

Resource queries own `notFound()` when a requested record is absent. Route pages only compose the feature and pass route values down; they do not perform data lookups or decide resource existence.

```ts
import "server-only";

export async function getFeed(userId: string) {
  return db.post.findMany({ where: { userId } });
}
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

Create `features/<domain>/<domain>-actions.ts`. Mark with `'use server'` at the top. Always:

1. Verify auth.
2. Validate input with your schema validator.
3. Run the mutation.
4. Invalidate cached data so the next render sees the new state.
5. Return a result (`{ ok }` or `{ error }`).

```tsx
"use server";

import { refresh } from "next/cache";

export async function createPost(formData: FormData) {
  const user = await verifyUser();
  const parsed = schema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }

  await db.post.create({ data: { body: parsed.data.body, userId: user.id } });
  refresh();
  return { ok: true as const };
}
```

[`refresh()`](https://preview.nextjs.org/docs/app/api-reference/functions/refresh) re-renders the current route for the current user. Use it when the affected read is deliberately dynamic and has no tag. With Cache Components enabled, reusable reads should have matching `cacheTag()` calls, so server actions normally call `updateTag()` for read-your-own-writes. See `references/cache-components.md`.

### Action file naming

Actions for a feature always go in `<folder>-actions.ts`, matching the folder name — even when the mutation operates on a sub-concept. `toggleFavorite` in `features/event/` lives in `event-actions.ts`, not `favorite-actions.ts`. The folder is the source of truth for the name.

## Calling actions from client components

Client components import server actions directly. **Don't** pass an action as a prop just to call it:

```tsx
// Right
"use client";
import { likePost } from "@/features/post/post-actions";

export function LikeButton({ postId }: { postId: string }) {
  return <button onClick={() => likePost(postId)}>Like</button>;
}
```

```tsx
// Wrong — adds indirection with no benefit
async function Post({ id }: { id: string }) {
  return <LikeButton postId={id} onLike={likePost} />;
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
  | { ok: true; data?: T }
  | { ok: false; error: string };
```

Toast on `ok: false` from the client. Skip success toasts when an optimistic UI already shows the result.

A shared `ActionResult<T>` is optional — a per-action inline union is just as good, and often clearer when the payload has a natural name: `return { ok: true as const, playlist }` reads better than a generic `data`. What matters is that fallible actions return a discriminated union the client can narrow on, not that every action shares one type.

## Mappers and domain types

If your DB rows have shapes you don't want to leak to components (extra columns, ORM-specific types), write a mapper inside the query:

```ts
export async function getPost(id: string) {
  const row = await db.post.findUnique({
    where: { id },
    include: { author: true },
  });
  if (!row) notFound();
  return toPost(row);
}

function toPost(row: PostRow & { author: UserRow }): Post {
  return { id: row.id, body: row.body, author: row.author.handle };
}
```

Components see `Post`, not the ORM row. If that type is imported by multiple files in the feature, put it under `features/<domain>/types/` (for example `features/post/types/post.ts`). Promote it to top-level `types/` only when multiple features import it.
