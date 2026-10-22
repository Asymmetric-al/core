# Pages and Suspense

> **Core:** Pages compose UI only. Privileged reads stay in `packages/api`. Wrap `searchParams` and combined `Promise.all([params, searchParams])` in a page-owned `<Suspense>`. Prefetch policy lives in `docs/ai/rules/frontend.md`.

How to compose pages, place Suspense boundaries, and prevent layout shift.

## Pages are composition only

Pages in `app/` import feature components and place `<Suspense>` boundaries. They never:

- Fetch data directly (privileged reads stay in `packages/api`; features compose those calls)
- Define reusable UI components except thin transition wrappers (e.g. `<ViewTransition>`) or tiny route-local control-flow helpers
- Inline route-specific UI (extract it into the feature folder)
- Pass raw `params` / `searchParams` to features

## Page function signatures

Type page and layout functions with the auto-generated `PageProps<'/route'>` / `LayoutProps<'/route'>` helpers — no import, regenerated on `next dev` / `next build` / `next typegen`. See route type helpers (installed: `node_modules/next/dist/docs/01-app/03-api-reference/05-config/02-typescript.md`).

```tsx
export default function PostPage({ params }: PageProps<"/post/[id]">) {
  /* ... */
}
```

Don't hand-write `{ params: Promise<{ id: string }> }` — the generated types stay in sync with the route (catch-all, optional segments). Route handlers use `RouteContext<'/api/...'>`. `typedRoutes: true` is a _separate_ feature (statically-typed `href`s), not the source of these helpers.

## Keep pages synchronous

This skill keeps the page synchronous and composes `params.then()` inside `<Suspense>` instead of awaiting route props at the top. The same structure is shown in the official interactive apps guide (installed: `node_modules/next/dist/docs/01-app/02-guides/interactive-apps.md`): static page chrome can return first while the resolved subtree suspends and streams.

```tsx
import { Suspense } from "react";
import {
  PostDetail,
  PostDetailSkeleton,
} from "@/features/post/components/post-detail";

export default function PostPage({ params }: PageProps<"/post/[id]">) {
  return (
    <div>
      <h1>Post</h1>
      <Suspense fallback={<PostDetailSkeleton />}>
        {params.then(({ id }) => (
          <PostDetail id={id} />
        ))}
      </Suspense>
    </div>
  );
}
```

The `<h1>` sits **above** the `params.then()` so it paints instantly. The `Suspense` fallback covers only the dynamic section.

Resolve route props to plain values at this boundary. Feature components receive `id`, `slug`, `query`, or parsed filter values — not `params`, `searchParams`, or unresolved server promises.

### Implicit return inside `.then()`

Use an implicit-return arrow function when the callback just renders JSX — e.g. `({ id }) => <PostDetail id={id} />`. Only switch to a block body with `return` when you need to do work first (destructure with defaults, parse a `searchParams` value, branch on a condition). This keeps the JSX-in-page shape readable and matches how the resolved tree will look.

### `searchParams` and combined params

```tsx
// searchParams only
export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <Suspense fallback={<SearchResultsSkeleton />}>
      {searchParams.then((sp) => {
        const q = typeof sp.q === "string" ? sp.q : "";
        return q ? <SearchResults query={q} /> : <EmptyState />;
      })}
    </Suspense>
  );
}

// Both params and searchParams
export default function ProfilePage({
  params,
  searchParams,
}: PageProps<"/u/[handle]">) {
  return (
    <Suspense fallback={<ProfileFeedSkeleton />}>
      {Promise.all([params, searchParams]).then(([{ handle }, sp]) => (
        <ProfileFeed handle={handle} tab={parseTab(sp.tab)} />
      ))}
    </Suspense>
  );
}
```

Use `Promise.all([params, searchParams])` when both are needed. Avoid nested `.then()` calls that make the resolved tree hard to read and easy to wrap in the wrong boundary.

### Metadata, static params, and `notFound()`

- `generateMetadata` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`) is a separate async function. Under Cache Components, runtime or uncached metadata on an otherwise fully prerenderable route needs an explicit choice: cache reusable metadata, or use the installed guide's intentional dynamic marker inside Suspense. Merely awaiting `params` does not supply that marker or make the page body dynamic. Keep the page's Stream / Cache / explicit Block choice consistent with `docs/ai/rules/frontend.md`.
- Export `generateStaticParams` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md`) from a `[slug]` page/layout to pre-build a known set of slugs; with `cacheComponents` + `'use cache'` they land in the static shell. It does **not** change the page signature — `params` is still a Promise, still consumed with `params.then()`.
- A query that can't find its resource calls `notFound()` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/not-found.md`), which bubbles to the nearest `not-found.tsx` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`). Don't try/catch it — use `unstable_rethrow` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/unstable_rethrow.md`) if you must catch nearby.

## Prefer a page boundary over `loading.tsx`

This skill prefers a boundary in the page next to the `params.then()` / `searchParams.then()` it covers. That keeps the fallback beside the JSX it stands in for and lets sibling sections reveal together or separately. Use the `loading.tsx` convention (installed: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md`) when a segment-level fallback is the intended loading unit.

## The page owns the Suspense boundary

The feature exports the async component **and** its skeleton. The page imports both and places the boundary. Don't pre-wrap inside the feature — that hides the boundary and prevents grouping siblings.

```tsx
// features/post/components/post-detail.tsx
export async function PostDetail({ id }: { id: string }) { ... }
export function PostDetailSkeleton() { ... }
```

```tsx
// app/post/[id]/page.tsx
<Suspense fallback={<PostDetailSkeleton />}>
  {params.then(({ id }) => (
    <>
      <PostDetail id={id} />
      <ErrorBoundary title="Replies didn't load">
        <Suspense fallback={<RepliesSkeleton />}>
          <Replies postId={id} />
        </Suspense>
      </ErrorBoundary>
    </>
  ))}
</Suspense>
```

If a page uses a transition wrapper, place it in the page next to the `<Suspense>` boundary. Feature components render content and skeletons, not transition wrappers. Follow the official React [`<ViewTransition>` reference](https://react.dev/reference/react/ViewTransition) and the companion [React View Transitions skill](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-view-transitions) for animation mechanics; verify warm and cold navigations in the browser instead of encoding unverified transition behavior here.

## Stable shell, suspending body

Before designing a fallback, identify what is stable and what is data-dependent.

- Stable: card/panel border, padding, icon, label, section heading, fixed action rail.
- Data-dependent: title text, counts, form body, list rows, loaded choices.
- Rule: stable shell outside Suspense; skeleton/crossfade inside the shell around the data body.

```tsx
<FeaturePanel>
  <Suspense fallback={<FeaturePanelBodySkeleton />}>
    <Crossfade>
      <FeaturePanelBody id={id} />
    </Crossfade>
  </Suspense>
</FeaturePanel>
```

Do not render `<FeaturePanel>` in both `fallback` and final content. That duplicates layout responsibility and makes the skeleton guess the panel size.

Use the app's real domain noun at implementation time (`PostPanel`, `MessageList`, `GroupEditor`, `EventDetails`, etc.); the neutral names here describe the reusable shape, not a component to copy literally.

When the top data section has unknown final height and pushes the sections below, either reserve that height in the stable wrapper or group the affected sections in one boundary. Do not create two independent crossfades if the first one changes the second one's starting position.

### Nested boundaries: siblings, not children

"Group the sections below" means the first section renders directly in the outer boundary and each later section renders as a **sibling** inside its own nested boundary:

```tsx
<Suspense fallback={<MessageSkeleton />}>
  <Message id={id} />
  <Suspense fallback={<RepliesSkeleton />}>
    <Replies id={id} />
  </Suspense>
</Suspense>
```

All three fetches start at once. The outer boundary waits only for `Message`; `Replies` can't reveal before it, so nothing jumps, but its data is usually ready by the time the body settles. Two shapes look similar and are wrong:

- One component that awaits everything and renders it in one go. The page waits for the slowest read before showing anything.
- The later sections passed as `children` through the async first component. Their render, and so their fetch, starts only after the first component resolves, so the sections load in series.

Content that shares the first section's reveal (a reply form under a message body) can live in the same component as that section; anything with its own latency goes in a nested sibling boundary.

### Persistent chrome renders above the boundary

Chrome that should survive a data load (a section header, a toolbar) is replaced every time the boundary resolves if it renders inside it. Render it as a sibling above the boundary. Client state shared between the chrome and the data below it lives in a provider that wraps both. It resets from a prop compared during render (see `references/components.md`), not a `key`, which would remount the chrome and the boundary with it; key only the boundary whose content should restart. A control inside the chrome that needs the data gets its own small `<Suspense>`, with the same control disabled as the fallback.

## One route, several variants

When a dynamic route renders different UI per param value (a `[step]` wizard, a `[view]` toggle), the outer fallback may render before the variant is resolved. Don't shape it like one specific variant. Use two levels:

1. The route boundary's fallback is a neutral splash: the variant's frame (card, board) with the animated brand mark centered, `role="status"` and an `aria-label`.
2. Inside `params.then(...)`, once the variant is known, a plain `<Suspense fallback={<VariantSkeleton ... />}>` wraps the data component with the exact skeleton for that variant.

Nest a second boundary only when its fallback differs from the outer one. A boundary directly inside another with the same fallback adds nothing: one boundary around `params.then(...)` covers both the route value and the data it loads.

Verify both direct visits and client navigations: the neutral outer fallback should remain valid until the variant-specific skeleton or content is available. Keep one dynamic route when the steps share one cohesive page structure; split routes only when the product structure warrants it.

## Audit smells

When auditing an existing app, flag and fix these first:

- `export default async function Page(...)` that only awaits `params`, `searchParams`, or page-level queries.
- `import { getSomething } from '@/features/.../*-queries'` inside `app/**/page.tsx` or `layout.tsx`.
- Feature components whose props are `params`, `searchParams`, or a route-shaped object.
- Page-local components like `HomeContent`, `PostShell`, or `ResultsSection` that only exist to fetch data or group a Suspense fallback.
- `<Suspense>` inside feature components that prevents the page from grouping reveal behavior.

## Route-local control-flow helpers

Small inline helpers are fine when their only job is route control flow that must live exactly where a boundary is placed:

```tsx
export default function LoginPage() {
  return (
    <Suspense>
      <LoginRedirect />
    </Suspense>
  );
}

async function LoginRedirect() {
  await connection();
  await redirectIfAuthenticated("/dashboard");
  return <LoginForm />;
}
```

Do not move a helper like this into a feature folder just to satisfy a blanket "no inline components" rule. It is not domain UI and it is not a reusable feature component; extracting it creates noise. Keep the cookie/session read inside the data-access helper (`redirectIfAuthenticated`, `verifyAuth`, etc.) rather than importing a feature query into the page.

## Don't create page-local wrapper components

Avoid components whose only job is to group boundary content, like `HomeLists` or `HomeListsSkeleton`. Keep the resolved JSX and fallback JSX **inline in the page** so the loading shape, headings, and grouped reveal behavior are visible at the boundary.

```tsx
// Wrong — hides the structure behind a wrapper
<Suspense fallback={<HomeListsSkeleton />}>
  <HomeLists searchParams={searchParams} />
</Suspense>
```

```tsx
// Right — structure visible at the page level
<Suspense
  fallback={
    <>
      <FeaturedSkeleton />
      <RecentSkeleton />
    </>
  }
>
  {searchParams.then((sp) => (
    <>
      <Featured filter={sp.filter} />
      <Recent filter={sp.filter} />
    </>
  ))}
</Suspense>
```

The same applies to feature-level skeleton aliases. If a variant only passes props to a base skeleton, import the base skeleton and pass those props inline in `fallback={...}`.

## Suspense boundary placement rules

1. **First section gets its own Suspense** with a known-height skeleton fallback.
2. **Section headings stay outside Suspense** when their final position is stable.
3. **Stable wrappers stay outside Suspense.** If fallback and final content both render the same card or panel, lift that wrapper around the boundary.
4. **Variable-height sections: group everything below them** in the same Suspense, including any headings that would otherwise paint in the wrong vertical position.
5. **Fixed-height sections: own boundary is safe.**
6. **Variable-length lists: show 2–5 skeleton items**, not the real count.
7. **Inner Suspense content stays out of the outer skeleton.** Each boundary owns its own.
8. **Never `fallback={null}` for visible UI.** If a boundary covers UI, give it a real shaped fallback, or group it with a sibling boundary that already has the correct fallback.
9. **If the top section's final height is unknown, group the following sections** in the same boundary so they reveal together and don't jump underneath.
10. **Optional sections that may render nothing** (a "your next item" card, a promo slot) sit above other content only if the empty state reserves the same height as the filled state and the skeleton. Otherwise put the section last, or group what follows into its boundary.

## Error boundaries

Wrap the section that can fail on its own (the part below the fold, a secondary panel) in a Next.js-aware error boundary so it doesn't take down the page. Don't wrap every boundary: when the main content fails there is nothing useful left to show, and route-segment `error.tsx` handles it. Build it on `catchError` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/catchError.md`) from `next/error` (its `ErrorInfo` gives you a `retry()` that re-fetches server data) — it understands Next's control-flow throws (`notFound()`, `redirect()`, `unauthorized()`, `forbidden()`) and won't swallow them. Place the boundary around the suspending section, in the page:

Define the `catchError` fallback and exported boundary in a `use client` module. The page remains a Server Component and imports that boundary; do not call `catchError` in the server page.

```tsx
<ErrorBoundary title="Replies didn't load">
  <Suspense fallback={<RepliesSkeleton />}>
    <Replies postId={id} />
  </Suspense>
</ErrorBoundary>
```

Run `retry()` in a transition and keep that state in the fallback itself. The retry can suspend while the server renders again, so disable the button and show pending feedback until it settles:

```tsx
"use client";

import { catchError, type ErrorInfo } from "next/error";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  body: string;
  compact?: boolean;
  title: string;
};

function ErrorFallback({ body, compact, title }: Props, { retry }: ErrorInfo) {
  const [isPending, startTransition] = useTransition();

  return (
    <ErrorState body={body} compact={compact} title={title}>
      <Button
        onClick={() => startTransition(() => retry())}
        disabled={isPending}
        aria-busy={isPending}
        size="sm"
        variant="secondary"
      >
        {isPending && <Spinner />}
        {isPending ? "Retrying…" : "Try again"}
      </Button>
    </ErrorState>
  );
}

export const ErrorBoundary = catchError(ErrorFallback);
```

Keep this logic directly in `ErrorFallback`; a separate retry-button abstraction hides the transition that makes `retry()` feel responsive.

Why not plain `react-error-boundary`? It catches Next's framework throws (so `notFound()` never reaches `not-found.tsx`), and its reset doesn't re-fetch server data. Background: [Error Handling in Next.js with catchError](https://aurorascharff.no/posts/error-handling-in-nextjs-with-catch-error/).

Pair component-level boundaries with route-segment `error.tsx` (installed: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`) for unrecoverable errors; it also receives a `retry` callback.

## Layout-level Suspense

Layouts compose feature components the same way pages do. Use `<Suspense>` for slots that fetch data (auth badge, sidebar). App-shell slots are the one place the layout, or the shell component it renders (a header, a sidebar), owns the boundary instead of the page — the slot repeats on every route, so its boundary belongs with the shell:

```tsx
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html>
      <body>
        <Suspense fallback={<AuthGateSkeleton />}>
          <AuthGate userPromise={getCurrentUser()} />
        </Suspense>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

`AuthGate` is the feature's server half: it reads the current user and renders `AuthGateClient`, which decides whether to show the dialog. The layout imports the component, not the query (see "Server half, client half" in `references/components.md`).

## CLS prevention

Layout shift happens when:

- A skeleton is shorter than the real content
- A heading paints before preceding variable-height content settles, then shifts when that content arrives
- A variable-length list streams in without a fallback that reserves space

Fixes:

- Match skeleton height to the real content height; measure both in the browser.
- Keep dependent headings **inside** the same boundary as preceding variable-height content; move them outside only when their final position is stable.
- For unknown-height top sections, group everything below in one boundary so siblings stream together.

To audit CLS, use React DevTools' Suspense panel to pin each boundary in its loading state and check vertical positions.

## Optimizing prefetching for high-value routes

Core already runs `cacheComponents: true` and `partialPrefetching: true`. Do not re-enable them, and do not copy preview.nextjs.org prefetch recipes into app code. Deeper per-link prefetching, `prefetch={true}`, and `export const prefetch = 'allow-runtime'` follow `docs/ai/rules/frontend.md`.

Pending indicators are part of CLS too. A spinner inserted into a button widens it and an `auto` grid column moves everything beside it; give such buttons a fixed width that fits the spinner. A chip or badge that appears with data (a count, a countdown) gets a pill-shaped skeleton of the same height.

## Never wrap the entire page in a Suspense fallback

Page chrome (header, nav, surrounding layout) should paint instantly. Only data-dependent sections suspend. If you find yourself wrapping `<div>` and everything in it with `<Suspense fallback={<FullPageSkeleton />}>`, restructure: pull static elements out, narrow the boundary to just the dynamic part.
