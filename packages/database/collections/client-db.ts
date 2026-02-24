"use client";

import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { z } from "zod";

import { getQueryClient } from "../providers/query-provider";
import { createClient } from "../supabase/client";

import type {
  Profile,
  Missionary,
  Donor,
  Post,
  Donation,
  Fund,
  Follow,
  PostComment,
} from "../types/database";

type SupabaseClient = ReturnType<typeof createClient>;

interface TableQueryOptions {
  orderBy?: {
    column: string;
    ascending: boolean;
  };
}

interface ReadOnlyCollectionConfig<TItem extends object> {
  id: string;
  queryKey: readonly string[];
  tableName: string;
  getKey: (item: TItem) => string;
  queryOptions?: TableQueryOptions;
}

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}

async function fetchTableRows<TItem extends object>(
  tableName: string,
  queryOptions?: TableQueryOptions,
): Promise<TItem[]> {
  let query = getSupabase().from(tableName).select("*");
  if (queryOptions?.orderBy) {
    query = query.order(queryOptions.orderBy.column, {
      ascending: queryOptions.orderBy.ascending,
    });
  }
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return (data ?? []) as TItem[];
}

function createReadOnlyCollection<TItem extends object>({
  id,
  queryKey,
  tableName,
  getKey,
  queryOptions,
}: ReadOnlyCollectionConfig<TItem>) {
  return createCollection(
    queryCollectionOptions({
      id,
      queryKey: [...queryKey],
      queryClient: getQueryClient(),
      getKey,
      queryFn: () => fetchTableRows<TItem>(tableName, queryOptions),
    }),
  );
}

const mediaItemSchema = z.object({
  url: z.string().min(1),
  type: z.enum(["image", "video"]),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const postSchema = z.object({
  id: z.string().min(1),
  tenant_id: z.string().min(1),
  missionary_id: z.string().min(1),
  content: z.string(),
  media: z.array(mediaItemSchema),
  like_count: z.number().int(),
  prayer_count: z.number().int(),
  comment_count: z.number().int(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

const postCommentSchema = z.object({
  id: z.string().min(1),
  post_id: z.string().min(1),
  user_id: z.string().min(1),
  content: z.string(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

const followSchema = z.object({
  id: z.string().min(1),
  tenant_id: z.string().nullable(),
  donor_id: z.string().nullable(),
  missionary_id: z.string().nullable(),
  status: z.string().min(1),
  is_donor: z.boolean(),
  approved_at: z.string().nullable(),
  notification_frequency: z.string().nullable(),
  muted: z.boolean(),
  created_at: z.string().min(1),
});

function createProfilesCollection() {
  return createReadOnlyCollection<Profile>({
    id: "profiles",
    queryKey: ["profiles"],
    tableName: "profiles",
    getKey: (item) => item.id,
  });
}

function createMissionariesCollection() {
  return createReadOnlyCollection<Missionary>({
    id: "missionaries",
    queryKey: ["missionaries"],
    tableName: "missionaries",
    getKey: (item) => item.id,
  });
}

function createDonorsCollection() {
  return createReadOnlyCollection<Donor>({
    id: "donors",
    queryKey: ["donors"],
    tableName: "donors",
    getKey: (item) => item.id,
  });
}

function createPostsCollection() {
  return createCollection(
    queryCollectionOptions({
      id: "posts",
      queryKey: ["posts"],
      queryClient: getQueryClient(),
      schema: postSchema,
      getKey: (item) => item.id,
      queryFn: () =>
        fetchTableRows<Post>("posts", {
          orderBy: { column: "created_at", ascending: false },
        }),
      onInsert: async ({ transaction }) => {
        const items = transaction.mutations.map(
          (mutation) => mutation.modified,
        );
        const { error } = await getSupabase().from("posts").insert(items);
        if (error) {
          throw error;
        }
      },
      onUpdate: async ({ transaction }) => {
        await Promise.all(
          transaction.mutations.map(async (mutation) => {
            const { error } = await getSupabase()
              .from("posts")
              .update(mutation.modified)
              .eq("id", mutation.key as string);
            if (error) {
              throw error;
            }
          }),
        );
      },
      onDelete: async ({ transaction }) => {
        const ids = transaction.mutations.map(
          (mutation) => mutation.key as string,
        );
        const { error } = await getSupabase()
          .from("posts")
          .delete()
          .in("id", ids);
        if (error) {
          throw error;
        }
      },
    }),
  );
}

function createPostCommentsCollection() {
  return createCollection(
    queryCollectionOptions({
      id: "post_comments",
      queryKey: ["post_comments"],
      queryClient: getQueryClient(),
      schema: postCommentSchema,
      getKey: (item) => item.id,
      queryFn: () =>
        fetchTableRows<PostComment>("post_comments", {
          orderBy: { column: "created_at", ascending: true },
        }),
      onInsert: async ({ transaction }) => {
        const items = transaction.mutations.map(
          (mutation) => mutation.modified,
        );
        const { error } = await getSupabase()
          .from("post_comments")
          .insert(items);
        if (error) {
          throw error;
        }
      },
    }),
  );
}

function createDonationsCollection() {
  return createReadOnlyCollection<Donation>({
    id: "donations",
    queryKey: ["donations"],
    tableName: "donations",
    getKey: (item) => item.id,
    queryOptions: {
      orderBy: { column: "created_at", ascending: false },
    },
  });
}

function createFundsCollection() {
  return createReadOnlyCollection<Fund>({
    id: "funds",
    queryKey: ["funds"],
    tableName: "funds",
    getKey: (item) => item.id,
  });
}

function createFollowsCollection() {
  return createCollection(
    queryCollectionOptions({
      id: "follows",
      queryKey: ["follows"],
      queryClient: getQueryClient(),
      schema: followSchema,
      getKey: (item) => item.id,
      queryFn: () => fetchTableRows<Follow>("follows"),
      onInsert: async ({ transaction }) => {
        const items = transaction.mutations.map(
          (mutation) => mutation.modified,
        );
        const { error } = await getSupabase().from("follows").insert(items);
        if (error) {
          throw error;
        }
      },
      onDelete: async ({ transaction }) => {
        const ids = transaction.mutations.map(
          (mutation) => mutation.key as string,
        );
        const { error } = await getSupabase()
          .from("follows")
          .delete()
          .in("id", ids);
        if (error) {
          throw error;
        }
      },
    }),
  );
}

function defineLazyCollection<T>(create: () => T) {
  let collection: T | undefined;
  return {
    get value(): T {
      if (collection === undefined) {
        collection = create();
      }
      return collection;
    },
  };
}

export const profilesCollection = defineLazyCollection(
  createProfilesCollection,
);
export const missionariesCollection = defineLazyCollection(
  createMissionariesCollection,
);
export const donorsCollection = defineLazyCollection(createDonorsCollection);
export const postsCollection = defineLazyCollection(createPostsCollection);
export const postCommentsCollection = defineLazyCollection(
  createPostCommentsCollection,
);
export const donationsCollection = defineLazyCollection(
  createDonationsCollection,
);
export const fundsCollection = defineLazyCollection(createFundsCollection);
export const followsCollection = defineLazyCollection(createFollowsCollection);
