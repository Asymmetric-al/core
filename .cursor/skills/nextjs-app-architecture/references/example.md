# Reference app: next-beats

A working app that follows this architecture: **<https://github.com/vercel-labs/next-beats>** (Next.js 16, `cacheComponents` + `partialPrefetching`, a music player). Use it to see any invariant in real code rather than restating the code here. Paths are as of this writing — verify against the current repo.

For the reasoning behind this architecture, read [Component Architecture for React Server Components](https://aurorascharff.no/posts/component-architecture-for-react-server-components/). The skill's target is the same shape: pages describe layout and loading; feature components own server reads; route params become IDs before they reach components.

> **Core:** This table labels next-beats paths as vendor examples. Core server reads and business mutations remain in `packages/api`; client leaves use approved hooks/API routes or an authenticated Server Action adapter. Do not recreate vendor feature-local data files.

## Invariant → where to see it

| Invariant                                                               | File(s)                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Pages compose, never fetch                                           | `app/(app)/search/page.tsx`, `app/(app)/genre/[genre]/page.tsx` — import feature components, place `<Suspense>`, no queries.                                                                                                                                 |
| 2. Pages stay synchronous (`params.then` / `searchParams.then`)         | `app/(app)/track/[id]/page.tsx`, `app/(app)/genre/[genre]/page.tsx`, `app/(app)/search/page.tsx`.                                                                                                                                                            |
| 3. Feature components receive IDs, not route props                      | Track/genre pages resolve `params` / `searchParams` and pass `id`, `genre`, or parsed values into feature components.                                                                                                                                        |
| 4. Async server component default; `'use client'` on leaves             | Server: `features/track/components/discover.tsx`, `most-played.tsx`. Client leaves: `features/track/components/track-interactions.tsx`, `play-button.tsx`.                                                                                                   |
| 5. Page owns Suspense; feature owns skeleton                            | Pages place the boundary (e.g. `app/(app)/genre/[genre]/page.tsx`); features export the skeleton (below).                                                                                                                                                    |
| 6. Skeleton in the same file, at the end                                | `features/track/components/track-row.tsx` (`TrackRow` … `TrackListSkeleton`), `features/genre/components/genre-card.tsx`.                                                                                                                                    |
| 7. Queries and mutations live in `packages/api`, not `apps/*/features/` | Vendor next-beats still shows `features/track/track-queries.ts` and `features/playlist/playlist-actions.ts`. In Core those files are **not** created; server components call published API reads and client leaves cross an approved callable boundary.      |
| 8. Feature folders follow product ownership                             | Vendor next-beats places `toggleFavorite` in `features/track/track-actions.ts`. In Core its business mutation belongs in `packages/api`; the feature owns only UI/client coordination. Cross-domain search composes the owning domains' published contracts. |
| 9. Client components import actions directly                            | Vendor `track-interactions.tsx` imports a real Server Action. Core client leaves use a supported hook/API route or authenticated `'use server'` adapter, never an ordinary API server helper.                                                                |

## Supporting patterns

| Pattern                                                | File                                                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Error boundary on `catchError` (`ErrorInfo` `retry`)   | `components/ui/error-boundary.tsx`                                                           |
| `useOptimistic` for an unlikely-to-fail toggle         | `features/track/components/track-interactions.tsx`                                           |
| Action-prop / `*Action` convention + confirm dialog    | `features/playlist/components/playlist-interactions.tsx`, `components/ui/confirm-dialog.tsx` |
| `useFormStatus` submit button                          | `components/ui/button.tsx`                                                                   |
| `useActionState` inline field errors                   | `features/user/components/sign-in-form.tsx`                                                  |
| Client-owned live data via a provider (not `<Poller>`) | `providers/player-provider.tsx` → `components/now-playing-bar.tsx`                           |
| `use()` on an unresolved promise prop                  | `features/playlist/components/add-to-playlist-menu.tsx`                                      |
| Purpose-named `components/scripts/` subfolder          | `components/scripts/`                                                                        |

> The repo is a live app, not a golden reference — spots may drift from the invariants (a page may fetch inline, a route `error.tsx` may lag an API rename). When the app and the invariants disagree, the invariants win; treat the mismatch as a fix for the app.
