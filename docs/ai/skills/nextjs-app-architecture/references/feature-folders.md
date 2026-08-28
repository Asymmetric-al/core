# Feature folders

How to organize code under `features/` and `app/`.

## Folder layout

```
features/<domain>/
  <domain>-cache.ts     # Pure server tags + client query keys, when shared
  <domain>-queries.ts   # Server-only queries, when this feature owns reads
  <domain>-actions.ts   # Server actions, when this feature owns writes
  <domain>-query-options.ts # Client data-library query definitions, when needed
  components/           # Server + client components, each with its skeleton
  types/                # Feature-local public types, when needed by multiple files
  hooks/                # Actual feature-local React hooks and hook wrappers
  providers/            # Feature-local providers, only when the provider belongs to this domain
```

The folder name identifies the domain or cohesive product experience. Query and action filenames match the owning domain folder when present.

## How many features?

Keep the feature list short. Use folders for **domains and cohesive product experiences a user would recognize**, not database tables or technical concerns.

A new folder is justified in either of these cases:

1. **Domain ownership:** it owns the queries, actions, and components for a real product entity.
2. **Cross-domain composition:** it owns the route-level UI or client state for an experience that combines multiple domains. The underlying queries and actions remain with the domains whose data they read or mutate.

If you find yourself making a feature folder with one query, one action, and one button, fold it into the parent feature instead.

### Merge aggressively

Concepts that exist only in service of a parent entity belong inside the parent's feature folder:

- A `favorite` or `bookmark` concept that only attaches to one parent entity (events, posts) → inside that parent's folder.
- A `like`, `repost`, `vote`, or `reaction` concept on a piece of content → with that content's feature.
- `auth` / `session` / `current user` → a single `user` folder, not split.
- A search query stays with the domain it searches (`searchTracks` in `features/track/`, `searchPlaylists` in `features/playlist/`). When one search experience combines several domains, `features/search/` may own the search form, result composition, and client state without taking ownership of those domain queries.

Concrete example: `toggleFavorite` is a mutation about events ("I favorite an event"), not its own domain. It lives in `features/event/event-actions.ts`, not `features/favorite/favorite-actions.ts`.

## File naming

Filenames inside the folder always start with the folder name:

```
features/event/
  event-queries.ts
  event-actions.ts
  components/
    event-grid.tsx
    event-details.tsx
    favorite-button.tsx     ← OK: a component, not a "favorite" feature
```

- `<folder>-queries.ts` — even if the file has only one query.
- `<folder>-actions.ts` — even if a mutation is about a sub-concept.
- Don't create empty query or action files for a cross-domain UI feature that doesn't own data access.
- Other `<folder>-*.ts` files are fine when the folder needs them (`playlist-constants.ts`, `<folder>-schema.ts`), as long as they keep the folder-name prefix. Don't put reusable domain types in a root `*-types.ts` file; use `features/<domain>/types/` once a type is imported by multiple files.
- Component files use any descriptive name. The component (not the feature) is the unit here.

## Local vs shared support folders

Use a local support folder when the code belongs to one feature:

```
features/message/
  message-cache.ts
  message-query-options.ts
  types/
    message.ts
  hooks/
    use-message-mutations.ts
    use-message-draft.ts
  providers/
    message-draft-provider.tsx
```

Feature-owned client coordination stays with the feature. Place each file by the shape it exports and the domain it belongs to:

- Client data-library cache contracts and query definitions follow `references/single-page-applications.md`.
- Mutation wrappers that export hooks live in `hooks/use-*.ts` (`use-message-mutations.ts` exporting `useSendMessage`).
- Browser-only state helpers live in `hooks/` when their public API is a hook (`use-thread.ts`, `use-message-draft.ts`).
- Client leaf components that coordinate a server write live in `components/` next to the UI they support (`mark-activity-read.tsx` posts read activity in the background while the current `/activity` tree stays stable).

Keep the file prefix aligned with the feature folder when a file exports a grouped feature contract (`workspace-cache.ts` and `workspace-query-options.ts`, not `activity-cache.ts` in `features/workspace/`). Support code for a sub-concept still lives with the parent feature: reactions on messages belong in `features/message/`; unread activity chrome belongs in `features/workspace/`.

Promote only when there are real cross-feature consumers:

- `types/` at the project root — shared domain/application types imported across features.
- `hooks/` at the project root — shared client hooks used across features.
- `app/providers.tsx` or `components/*-provider.tsx` — app-shell providers that wrap the whole app.

Avoid root-level miscellany like `message-types.ts`, `shared-hooks.ts`, or `common-provider.tsx`; the folder name should explain the scope.

## What goes in `components/`

Each component file exports the main component **plus its skeleton**:

```tsx
// features/event/components/event-grid.tsx
export async function EventGrid(...) { ... }
export function EventGridSkeleton() { ... }
```

Group related components in one file when they're always used together or one is a natural building block for another. A card and its grid live together. For example, `genre-card.tsx` exports `GenrePill`, `GenreCard`, `GenreGrid`, `GenreGridSkeleton`.

Split into separate files only when:

- A component is consumed by multiple sibling components (one shared use is not enough — wait until three call sites need it).
- A component is `'use client'` and a sibling is a server component (the server/client boundary forbids sharing a file).

See `references/components.md` for inlining rules and the skeleton design checklist.

## What pages do

Pages in `app/` compose feature components with Suspense and transition wrappers. They never:

- Contain domain logic
- Define new components except thin transition wrappers (e.g. `<ViewTransition>`)
- Fetch data directly
- Inline route-specific components — extract them into the feature folder

See `references/pages-suspense.md` for page composition details.

## Top-level layout

```
app/                  # Pages and layouts
features/             # Domain folders
components/           # UI primitives, theme, and app-shell singletons
hooks/                # Shared client hooks used across features
types/                # Shared cross-feature types only
lib/                  # Utilities and cohesive non-domain subsystems
```

`lib/` holds flat helpers (`db.ts`, `utils.ts`) but may also group a cohesive non-domain subsystem in its own subfolder (e.g. `lib/audio/` for an audio engine). Cross-feature client hooks live in top-level `hooks/`; a hook used by a single feature co-locates in that feature's `hooks/`. Types follow the same rule: shared types at top-level `types/`, feature-only exported types in `features/<domain>/types/`.

`components/` holds:

- **`components/ui/`** — primitives. Low-level building blocks and action-prop components.
- **`components/theme/`** — theme provider and toggle, paired.
- **Top-level files** (`site-header.tsx`, `auth-gate.tsx`, `poller.tsx`) — app-shell singletons used once each. No `common/` folder — "common" is not a category. If a component is used everywhere it's a primitive (→ `ui/`); if it's used once it lives at the top level.
- **Purpose-named subfolders** are fine when several files share a clear technical role — e.g. `components/scripts/` for pre-hydration inline `<script>` seed components. This is distinct from the rejected `common/`: a `scripts/` folder names _what the files are_, not "miscellaneous."

Conventions for filenames and casing live in the project's `AGENTS.md`. This skill doesn't impose one.
