# TanStack Integration Guide

This document describes how TanStack Query, TanStack Table, and TanStack DB are integrated in this Next.js 16.1.1 project.

## Package Versions

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | ^5.90.15 | Server state management |
| `@tanstack/react-query-devtools` | ^5.90.15 | Development debugging |
| `@tanstack/react-table` | ^8.21.3 | Headless table UI |
| `@tanstack/db` | ^0.5.16 | Client-side database collections |
| `@tanstack/react-db` | ^0.1.60 | React bindings for TanStack DB |
| `@tanstack/query-db-collection` | ^1.0.12 | Query-based collections |
| `@tanstack/react-virtual` | ^3.13.13 | Virtualized lists |

## Architecture

### Provider Setup

The application uses a single unified `TanStackDBProvider` that provides both TanStack Query and TanStack DB functionality:

```tsx
// src/app/layout.tsx
import { TanStackDBProvider } from "@/lib/db";

export default function RootLayout({ children }) {
  return (
    <TanStackDBProvider>
      {children}
    </TanStackDBProvider>
  );
}
```

### File Structure

```
src/lib/db/
├── client-db.ts      # Collection definitions with Supabase integration
├── collections.ts    # Re-exports for public API
├── hooks.ts          # Custom hooks using useLiveQuery
├── provider.tsx      # TanStackDBProvider component
└── index.ts          # Main barrel export
```

## TanStack DB Collections

Collections are defined using `queryCollectionOptions` from `@tanstack/query-db-collection`:

```typescript
import { createCollection } from '@tanstack/db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'

export const postsCollection = createCollection<Post>(
  queryCollectionOptions({
    queryKey: ['posts'],
    queryClient: getQueryClient(),
    getKey: (item) => item.id,
    queryFn: async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    onInsert: async ({ transaction }) => {
      const supabase = getSupabase()
      const posts = transaction.mutations.map((m) => m.modified)
      const { error } = await supabase.from('posts').insert(posts)
      if (error) throw error
    },
    onUpdate: async ({ transaction }) => {
      const supabase = getSupabase()
      await Promise.all(
        transaction.mutations.map(async (mutation) => {
          const { error } = await supabase
            .from('posts')
            .update(mutation.modified)
            .eq('id', mutation.key as string)
          if (error) throw error
        })
      )
    },
    onDelete: async ({ transaction }) => {
      const supabase = getSupabase()
      const ids = transaction.mutations.map((m) => m.key as string)
      const { error } = await supabase.from('posts').delete().in('id', ids)
      if (error) throw error
    },
  })
)
```

### Available Collections

| Collection | Table | Mutations |
|------------|-------|-----------|
| `profilesCollection` | profiles | Read-only |
| `missionariesCollection` | missionaries | Read-only |
| `donorsCollection` | donors | Read-only |
| `postsCollection` | posts | Insert, Update, Delete |
| `postCommentsCollection` | post_comments | Insert |
| `donationsCollection` | donations | Read-only |
| `fundsCollection` | funds | Read-only |
| `followsCollection` | follows | Insert, Delete |

## Custom Hooks

### useLiveQuery

The `useLiveQuery` hook from `@tanstack/react-db` provides reactive queries with joins:

```typescript
import { useLiveQuery, eq } from '@tanstack/react-db'

export function usePostsWithAuthors(missionaryId?: string) {
  return useLiveQuery((q) => {
    let query = q.from({ post: postsCollection })
    
    if (missionaryId) {
      query = query.where(({ post }) => eq(post.missionary_id, missionaryId))
    }
    
    return query
      .join(
        { missionary: missionariesCollection },
        ({ post, missionary }) => eq(post.missionary_id, missionary!.id)
      )
      .join(
        { profile: profilesCollection },
        ({ missionary, profile }) => eq(missionary!.profile_id, profile.id)
      )
      .select(({ post, profile }) => ({
        ...post,
        author: profile,
      }))
      .orderBy(({ post }) => post.created_at, 'desc')
  })
}
```

### Available Hooks

| Hook | Purpose |
|------|---------|
| `usePostsWithAuthors` | Posts with author profile data |
| `usePostsForFollowedMissionaries` | Posts from followed missionaries |
| `useDonorGivingHistory` | Donor's donation history |
| `useMissionarySupporters` | Missionary's supporters list |
| `useCommentsWithAuthors` | Comments with author data |
| `useFundsWithProgress` | Funds with progress calculation |
| `useMissionaryDashboard` | Missionary dashboard data |
| `useMissionaryStats` | Missionary statistics |

## TanStack Table

TanStack Table is used for data grids. The data table components are in `src/components/ui/data-table/`.

### Basic Usage

```tsx
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

export function ContributionsTable({ data }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      enableRowSelection
      enablePagination
    />
  )
}
```

## Best Practices

1. **Use collections for shared data**: Collections provide caching and optimistic updates across components.

2. **Join types with non-null assertions**: When joining collections, use `!` for TypeScript null safety since joins guarantee presence.

3. **Use transaction pattern for mutations**: Always use the `{ transaction }` destructured parameter in mutation handlers.

4. **Batch operations**: Use `Promise.all` for multiple mutations to ensure atomicity.

5. **Error handling**: Always check for errors from Supabase operations and throw to trigger rollback.

## Supabase Integration

Collections use the Supabase client from `@/lib/supabase/client`:

```typescript
import { createClient } from '@/lib/supabase/client'

function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}
```

This ensures a single Supabase client instance is reused across all collections.

## Query Client Configuration

The shared QueryClient is configured with:

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // 1 minute
      gcTime: 5 * 60 * 1000,     // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})
```
