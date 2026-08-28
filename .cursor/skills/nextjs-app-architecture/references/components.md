# Components

How to build server and client components inside a feature folder.

## Default: async server component

Server components await their own queries directly — no `useEffect`, no client-side fetching, no manual loading state. See the [Server Components docs](https://preview.nextjs.org/docs/app/getting-started/server-and-client-components) for the model.

Prefer minimal, stable props: IDs, slugs, handles, parsed filters, or records the parent already fetched. Do not pass raw route `params` or `searchParams` into feature components. Pages resolve those promises and pass plain values.

```tsx
// features/notifications/components/notifications-badge.tsx
import { getUnreadNotificationCount } from "@/features/notifications/notifications-queries";

export async function NotificationsBadge() {
  const count = await getUnreadNotificationCount();
  if (count === 0) return null;
  return <span aria-label={`${count} unread`}>{count}</span>;
}
```

The page (not this file) wraps it in `<Suspense fallback={<NotificationsBadgeSkeleton />}>` — see `references/pages-suspense.md`.

For parameterized routes, the page resolves `params` and the feature receives an ID:

```tsx
// app/post/[id]/page.tsx
<Suspense fallback={<PostDetailSkeleton />}>
  {params.then(({ id }) => (
    <PostDetail id={id} />
  ))}
</Suspense>
```

```tsx
// features/post/components/post-detail.tsx
export async function PostDetail({ id }: { id: string }) {
  const post = await getPost(id);
  return <article>{post.body}</article>;
}
```

## Skeletons live in the same file

Export the main component and its skeleton from the same file. Pages import both. Define the skeleton **at the end of the file**, below the real component(s) — never above. Function declarations are hoisted, so a skeleton referenced by a component earlier in the file still works when defined last.

```tsx
export async function Feed({ userId }: { userId: string }) {
  const posts = await getFeed(userId);
  return (
    <ul>
      {posts.map((p) => (
        <Post key={p.id} post={p} />
      ))}
    </ul>
  );
}

export function FeedSkeleton() {
  return (
    <ul>
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i}>
          <Skeleton className="h-24" />
        </li>
      ))}
    </ul>
  );
}
```

Don't export a second skeleton whose whole job is to rename or preconfigure another skeleton:

```tsx
// Wrong — alias wrapper adds an import surface but no behavior
export function CompactGridSkeleton() {
  return <GridSkeleton dense />;
}
```

Import the real skeleton and pass the prop inline at the `<Suspense>` boundary: `fallback={<GridSkeleton dense />}`.

### Skeleton design checklist

1. Match the real component's layout: flex direction, gaps, padding, breakpoints.
2. Include all structural elements: avatar circles, action button placeholders, image squares.
3. Responsive visibility must match (`hidden sm:block` in the real component → same in the skeleton).
4. Show 2–5 placeholders for variable-length lists, not the real count.
5. Don't include skeletons for inner Suspense content — those have their own boundaries.
6. Reserve the right height. CLS comes from skeletons that are shorter than the real content.
7. Dense placeholders should not animate. A grid of 28 shimmering covers reads as flicker rather than progress, so use a flat low-contrast fill when there are many items and keep the animated sweep for a handful of bars.

## Group related components in one file

A card and its grid live in the same file. For example, `genre-card.tsx` exports `GenrePill`, `GenreCard`, `GenreGrid`, `GenreGridSkeleton`. Variants should reuse that skeleton inline instead of exporting alias skeletons. Don't split shared UI primitives prematurely — wait until three call sites need the same shape before extracting.

Two sidebar widgets that happen to look similar but render different data shapes are **not** the same component. The visuals diverge as soon as one needs an extra slot.

### Single-use sub-components stay inlined

For a metadata strip inside one card, a header used only by one detail view, a list item only rendered by its list — inline them as **non-exported** functions in the same file:

```tsx
export async function EventDetails({ slug }: { slug: string }) {
  const event = await getEventBySlug(slug);
  return (
    <article>
      <MetaStrip event={event} />
      <Speaker speaker={event.speaker} />
      <p>{event.description}</p>
    </article>
  );
}

function MetaStrip({ event }: { event: Event }) { ... }
function Speaker({ speaker }: { speaker: string }) { ... }
```

Exports are for things other files will import. Internal structure is for readability inside one file.

## The server/client boundary

`'use client'` only when you need:

- Hooks (`useState`, `useReducer`, `useOptimistic`, `useTransition`, `useEffect`)
- Event handlers (`onClick`, `onChange`, `onSubmit`)
- Browser APIs (`window`, `localStorage`, refs to DOM)

If the component needs interactive pieces, keep the server component as the parent and render client leaves:

```tsx
async function PostDetail({ id }: { id: string }) {
  const [post, userState] = await Promise.all([
    getPost(id),
    getPostUserState(id),
  ]);
  return (
    <article>
      <PostBody body={post.body} />
      <PostActions userState={userState} /> {/* 'use client' leaf */}
    </article>
  );
}
```

### Server content as children of client components

Composition crosses the boundary. A client component can accept server-rendered JSX as children or props:

```tsx
<ComposerForm
  avatar={
    <Suspense fallback={<AvatarSkeleton />}>
      <CurrentUserAvatar />
    </Suspense>
  }
/>
```

`ComposerForm` is `'use client'`. It doesn't know where the avatar JSX came from. The Suspense boundary streams the avatar in without the form re-rendering.

### Pass server children resolved values, not promises

Prefer passing plain values (strings, IDs, resolved data) to a server child. A server component _can_ `await` a promise prop, but resolve route promises in the page instead — pass an unresolved promise down only to a _client_ component that reads it with `use()` (see below). When a parent already has the data from its own query, pass it as a prop instead of having the child refetch.

```tsx
// Right — parent fetches the list, passes each item
async function Feed({ userId }: { userId: string }) {
  const posts = await getFeed(userId);
  return posts.map((post) => <Post key={post.id} post={post} />);
}

async function Post({ post }: { post: Post }) {
  return <article>{post.body}</article>;
}
```

```tsx
// Wrong — child refetches what the parent already had
async function Post({ id }: { id: string }) {
  const post = await getPost(id);
  return <article>{post.body}</article>;
}
```

## Client components that own their loading state

When a client component needs server data but should manage its own loading (a sidebar badge, a popover that opens on hover), pass an **unresolved promise** from the server and resolve it with [`use()`](https://react.dev/reference/react/use) on the client. Wrap the consumer in `<Suspense>`.

```tsx
// page: pass the unresolved promise, wrap in Suspense
<Suspense fallback={<TagListSkeleton />}>
  <TagPicker itemsPromise={getTags()} />
</Suspense>
```

```tsx
"use client";
import { use } from "react";

export function TagPicker({ itemsPromise }: { itemsPromise: Promise<Tag[]> }) {
  const items = use(itemsPromise);
  // render interactive UI from items
}
```

The opinionated bit: name promise props with a `Promise` suffix (`itemsPromise`, `userPromise`) so the contract is obvious at the call site.

### Client data libraries (SWR, TanStack Query)

Follow `references/single-page-applications.md` when a feature uses a browser data cache or needs externally authored updates. It covers when to use a library, where its files live, server seeding, Cache Components coordination, hydration, and mutations.

## Interactive async React shape

Keep the server/client split even when the UI is highly interactive:

- The server component reads durable data and renders the initial tree.
- The client leaf owns only ephemeral interaction: open state, focused field, pending flag, optimistic draft, selected tab that is not shareable.
- Shareable or bookmarkable state lives in the URL/search params, not mirrored in component state.
- Client leaves import server actions directly and call them from form actions or event handlers.
- Mutation feedback (`useOptimistic`, pending flags, rollback, toasts) follows `references/ux-patterns.md`.

Avoid effects whose only job is to copy React state to React state:

```tsx
// Wrong — derived React state cascades through an effect
useEffect(() => {
  setSelectedItem(null);
}, [filterKey]);
```

Prefer one of these shapes:

- Key the interactive child by the value that resets it: `<SelectableList key={filterKey} filterKey={filterKey} />`.
- Derive the value during render.
- Put the value in the URL/search params if navigation should own it.
- Use a reducer where the same event that changes `filterKey` also clears `selectedItem`.

Effects are for external systems: DOM APIs, subscriptions, timers, browser storage, analytics, or imperative libraries. They are not a cleanup lane for state that React could derive or reset structurally.

## Mutations

For client-side reactions to a server mutation (instant feedback, pending state, success/error toasts), see `references/ux-patterns.md`. To cache rendered output across requests, see `references/cache-components.md`.
