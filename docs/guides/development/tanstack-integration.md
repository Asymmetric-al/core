# TanStack Integration Guide

This document describes how TanStack Query, TanStack Table, and TanStack DB are integrated in this Next.js 16.1.1 project.

## Package Versions

| Package                          | Version  | Purpose                                       |
| -------------------------------- | -------- | --------------------------------------------- |
| `@tanstack/react-query`          | ^5.90.21 | Server state management                       |
| `@tanstack/react-query-devtools` | ^5.91.3  | Development debugging                         |
| `@tanstack/react-table`          | ^8.21.3  | Headless table UI                             |
| `@tanstack/react-db`             | ^0.1.72  | React collection bindings                     |
| `@tanstack/query-db-collection`  | ^1.0.25  | Query-backed collection adapter               |
| `@tanstack/db`                   | ^0.5.28  | Core TanStack DB runtime used by React DB     |
| `@tanstack/react-virtual`        | ^3.13.19 | Opt-in virtualized row rendering for big sets |

## Version Policy

- **TanStack packages**: Keep all `@tanstack/*` packages on a unified, latest-compatible patch line across workspaces to avoid subtle type/runtime drift.
- **Zod packages**: Standardize internal workspaces on `zod@^4.3.6` for consistent schema behavior and shared utility compatibility.
- **Upgrade cadence**: Update versions intentionally in grouped PRs and validate with `lint`, `typecheck`, and unit tests before merge.

## Architecture

### Provider Setup

Use `QueryProvider` as the single recommended provider for TanStack Query and TanStack DB functionality:

```tsx
// apps/[app-name]/app/layout.tsx
import { QueryProvider } from "@asym/database/providers";

export default function RootLayout({ children }) {
  return <QueryProvider>{children}</QueryProvider>;
}
```

### File Structure

```
packages/database/
├── collections/      # Collection definitions with Supabase integration
├── hooks/            # Custom hooks using useLiveQuery
├── providers/        # QueryProvider + compatibility alias
├── supabase/         # Supabase clients (server/client/admin)
└── types/            # Database types
```

## TanStack DB Collections

Collections are defined using `queryCollectionOptions` from `@tanstack/query-db-collection`:

```typescript
import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { z } from "zod";

const postSchema = z.object({
  id: z.string().min(1),
  tenant_id: z.string().min(1),
  missionary_id: z.string().min(1),
  content: z.string(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

function createPostsCollection() {
  return createCollection<Post>(
    queryCollectionOptions({
      id: "posts",
      queryKey: ["posts"],
      queryClient: getQueryClient(),
      schema: postSchema,
      getKey: (item) => item.id,
      queryFn: async () => {
        const { data, error } = await getSupabase()
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data ?? [];
      },
      onInsert: async ({ transaction }) => {
        const items = transaction.mutations.map((m) => m.modified);
        const { error } = await getSupabase().from("posts").insert(items);
        if (error) throw error;
      },
      onUpdate: async ({ transaction }) => {
        await Promise.all(
          transaction.mutations.map(async (mutation) => {
            const { error } = await getSupabase()
              .from("posts")
              .update(mutation.modified)
              .eq("id", mutation.key as string);
            if (error) throw error;
          }),
        );
      },
      onDelete: async ({ transaction }) => {
        const ids = transaction.mutations.map((m) => m.key as string);
        const { error } = await getSupabase()
          .from("posts")
          .delete()
          .in("id", ids);
        if (error) throw error;
      },
    }),
  );
}

const postsCollection = defineLazyCollection(createPostsCollection);
```

### Available Collections

| Collection               | Table         | Mutations              |
| ------------------------ | ------------- | ---------------------- |
| `profilesCollection`     | profiles      | Read-only              |
| `missionariesCollection` | missionaries  | Read-only              |
| `donorsCollection`       | donors        | Read-only              |
| `postsCollection`        | posts         | Insert, Update, Delete |
| `postCommentsCollection` | post_comments | Insert                 |
| `donationsCollection`    | donations     | Read-only              |
| `fundsCollection`        | funds         | Read-only              |
| `followsCollection`      | follows       | Insert, Delete         |

## Custom Hooks

### useLiveQuery

The `useLiveQuery` hook from `@tanstack/react-db` provides reactive queries with joins:

```typescript
import { useLiveQuery, eq } from "@tanstack/react-db";

export function usePostsWithAuthors(missionaryId?: string) {
  return useLiveQuery((q) => {
    let query = q.from({ post: postsCollection.value });

    if (missionaryId) {
      query = query.where(({ post }) => eq(post.missionary_id, missionaryId));
    }

    return query
      .join(
        { missionary: missionariesCollection.value },
        ({ post, missionary }) => eq(post.missionary_id, missionary!.id),
      )
      .join({ profile: profilesCollection.value }, ({ missionary, profile }) =>
        eq(missionary!.profile_id, profile.id),
      )
      .select(({ post, profile }) => ({
        ...post,
        author: profile,
      }))
      .orderBy(({ post }) => post.created_at, "desc");
  });
}
```

### Available Hooks

| Hook                              | Purpose                          |
| --------------------------------- | -------------------------------- |
| `usePostsWithAuthors`             | Posts with author profile data   |
| `usePostsForFollowedMissionaries` | Posts from followed missionaries |
| `useDonorGivingHistory`           | Donor's donation history         |
| `useMissionarySupporters`         | Missionary's supporters list     |
| `useCommentsWithAuthors`          | Comments with author data        |
| `useFundsWithProgress`            | Funds with progress calculation  |
| `useMissionaryDashboard`          | Missionary dashboard data        |
| `useMissionaryStats`              | Missionary statistics            |

## TanStack Table

TanStack Table is used for data grids. The data table components are in `packages/ui/components/shadcn/data-table/`.

### Basic Usage

```tsx
import { DataTable } from "@asym/ui";
import { columns } from "./columns";

export function ContributionsTable({ data }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      enableRowSelection
      enablePagination
    />
  );
}
```

## Best Practices

1. **Use collections for shared data**: Collections provide caching and optimistic updates across components.

2. **Join types with non-null assertions**: When joining collections, use `!` for TypeScript null safety since joins guarantee presence.

3. **Use transaction pattern for mutations**: Always use the `{ transaction }` destructured parameter in mutation handlers.

4. **Batch operations**: Use `Promise.all` to run independent network calls concurrently; use explicit DB transactions when atomicity is required.

5. **Error handling**: Always check for errors from Supabase operations and throw to trigger rollback.

## Supabase Integration

Collections use the Supabase client from `@asym/database/supabase/client`:

```typescript
import { createClient } from "@asym/database/supabase/client";

function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}
```

This ensures a single Supabase client instance is reused across all collections.

## Query Client Configuration

The shared QueryClient is configured with:

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Prevents refetch-on-hydration, 1-minute window
      gcTime: 5 * 60 * 1000, // 5-minute garbage collection
      refetchOnWindowFocus: false, // Explicit opt-out
      retry: shouldRetryQuery, // Typed status/code classification, no message parsing
    },
    mutations: {
      retry: false, // Mutations are not retried
    },
  },
});
```
