# Components

> **Core:** Async Server Components call a published `@asym/api/*` read. Derive Tenant from `@asym/auth/context` (`getAuthContext`) before privileged reads; use the relevant role/app shell gate before service-role or tenant-wide reads; do not take `tenantId` from route params or the client. Do not import `features/<domain>/*-queries.ts`. Approved `@asym/database/hooks` belong only in `'use client'` leaves. Privileged mutations stay in `packages/api`.

How to build server and client components inside a feature folder.

## Default: async server component

Server components await their own queries directly — no `useEffect`, no client-side fetching, no manual loading state. See the Server Components docs (installed: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`) for the model.

Prefer minimal, stable props: IDs, slugs, handles, parsed filters, or records the parent already fetched. Do not pass raw route `params` or `searchParams` into feature components. Pages resolve those promises and pass plain values.

```tsx
// features/dashboard/components/dashboard-stats-badge.tsx
import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";
import { getDashboardStats } from "@asym/api/reads/dashboard-stats";

const ADMIN_ALLOWED_ROLES = ["staff", "admin", "super_admin"] as const;

export async function DashboardStatsBadge() {
  const auth = await getAuthContext();
  if (
    !auth.isAuthenticated ||
    !auth.tenantId ||
    !hasAnyContextRole(auth, [...ADMIN_ALLOWED_ROLES])
  ) {
    return null;
  }
  const stats = await getDashboardStats(auth.tenantId);
  if (stats.totalDonors === 0) return null;
  return (
    <span aria-label={`${stats.totalDonors} donors`}>{stats.totalDonors}</span>
  );
}
```

```tsx
// Wrong — do not take tenantId from route params or the client
export async function WrongDashboardStatsBadge({
  tenantId,
}: {
  tenantId: string;
}) {
  const stats = await getDashboardStats(tenantId);
  return <span>{stats.totalDonors}</span>;
}
```

The page (not this file) wraps it in `<Suspense fallback={<DashboardStatsBadgeSkeleton />}>` — see `references/pages-suspense.md`.

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
6. Reserve the right height. CLS comes from skeletons that are shorter than the real content, and from real content that can be shorter than its skeleton; in that case give the real container the skeleton's `min-h`.
7. Dense placeholders should not animate. A grid of 28 shimmering covers reads as flicker rather than progress, so use a flat low-contrast fill when there are many items and keep the animated sweep for a handful of bars.
8. Draw text as bars shorter than the line, but keep the line box: bar height plus vertical margin equals the text's line-height, so a 20px line gets a 14px bar with 3px above and below. Stack bars in a flex column so the margins don't collapse into each other. In a block container a bar's bottom margin also collapses into the next block's top margin and the skeleton lands a few pixels short, so give a lone bar an explicit line box (`flex h-4 items-center`) instead of margins. Keep padding off the element that carries that fixed height: with border-box sizing, `h-7 pt-4` is 28px in total, not 16px of padding on a 28px line, and everything below the bar sits 16px too high. Put the padding on a wrapper around the line box.
9. Large blocks (images, buttons, avatars) get the flat fill too; only text lines animate, or the whole page pulses.
10. Extract repeated visual primitives (a route line, a label-over-value stat, an icon detail row) as small components that export their own skeleton, and compose the larger skeletons from them. Three hand-measured copies drift apart; one measured primitive stays right everywhere it is used.
11. Signs of a bad skeleton, all seen in review: a fallback shaped like one variant used for another (one step's skeleton shown for another step), a fixed-height guess such as `h-[34rem]` standing in for a component whose frame could be composed from its real parts, a text fallback that later turns into different text, and a skeleton that lives in a different file from the component it stands in for.

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

### Server half, client half

When a client component needs server data, don't create the query in the page or layout to pass it down. Give the feature an async server component that awaits its queries and renders the client component, and name the pair after it: `ComposePanel` in `compose-panel.tsx`, `ComposePanelClient` in `compose-panel-client.tsx`. The page places `<ComposePanel />` like any other feature component, and the server half is where a prefetch or navigation gate goes.

```tsx
// features/thread/components/compose-panel.tsx
export async function ComposePanel() {
  const [user, contacts] = await Promise.all([getCurrentUser(), getContacts()]);
  return <ComposePanelClient contacts={contacts} from={user} />;
}
```

If that pair streams into a layout slot and reads client state from a provider that hydrated earlier (the panel's open state), the user can change that state before the slot arrives, and the slot's first client render would no longer match its server HTML. Render its state-dependent part only after mount, with a `useSyncExternalStore` that returns `false` on the server and `true` on the client.

### Pass rendered content through slots

Next.js supports passing server-rendered JSX to a Client Component as `children` or another named prop. Client Components may also be rendered directly from Server Components. Props that cross into a Client Component must follow React's serialization rules; use the official interleaving and serialization guidance (installed: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`) rather than treating all element props as invalid.

This skill still prefers plain values and explicit `children` / slot props. If a client design component needs to inspect or clone an element rather than render an opaque slot, keep that composition in the client module or expose a value/class API whose boundary is clear.

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

When a client component needs server data but should manage its own loading (a sidebar badge, a popover that opens on hover), pass an **unresolved promise** from the server and resolve it with [`use()`](https://react.dev/reference/react/use) on the client. Wrap the consumer in `<Suspense>`. The promise is created in a feature server component, not in the page, which never imports queries:

```tsx
// features/tag/components/tag-picker-field.tsx — creates the promise without awaiting it
export function TagPickerField() {
  return <TagPicker itemsPromise={getTags()} />;
}

// page: places the boundary
<Suspense fallback={<TagListSkeleton />}>
  <TagPickerField />
</Suspense>;
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
- Client leaves use an approved hook/API route or import a dedicated authenticated `'use server'` adapter that authorizes the caller, validates input, and delegates business work to `packages/api`. Never import ordinary `packages/api` server commands into a Client Component.
- Mutation feedback (`useOptimistic`, pending flags, rollback, toasts) follows `references/ux-patterns.md`.

Avoid effects whose only job is to copy React state to React state:

```tsx
// Wrong — derived React state cascades through an effect
useEffect(() => {
  setSelectedItem(null);
}, [filterKey]);
```

Prefer one of these shapes:

- Key the interactive child by the value that resets it: `<SelectableList key={filterKey} filterKey={filterKey} />`. Key leaves only: a key on a provider that wraps Suspense boundaries remounts every boundary under it, so its chrome and content re-skeleton. A provider resets by storing the value it belongs to next to its state and comparing during render: `const selected = state.list === list ? state.selected : new Map()`.
- Derive the value during render.
- Put the value in the URL/search params if navigation should own it.
- Use a reducer where the same event that changes `filterKey` also clears `selectedItem`.

Effects are for synchronizing with external systems: DOM APIs, subscriptions, timers, browser storage, analytics, or imperative libraries. For state that React can derive or reset structurally, follow [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).

## Mutations

For client-side reactions to a server mutation (instant feedback, pending state, success/error toasts), see `references/ux-patterns.md`. To cache rendered output across requests, see `references/cache-components.md`.
