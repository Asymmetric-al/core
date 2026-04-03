"use client";

import {
  createCollection,
  type InferSchemaOutput,
  type StandardSchema,
} from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { z } from "zod";

import { getQueryClient } from "../providers/query-provider";
import { createClient } from "../supabase/client";

import type { Post, Follow, PostComment } from "../types/database";

type SupabaseClient = ReturnType<typeof createClient>;

interface TableQueryOptions {
  orderBy?: {
    column: string;
    ascending: boolean;
  };
}

type SchemaOutput<TSchema extends StandardSchema<unknown>> =
  InferSchemaOutput<TSchema>;

interface ReadOnlyCollectionConfig<TSchema extends StandardSchema<unknown>> {
  id: string;
  queryKey: readonly string[];
  tableName: string;
  getKey: (item: SchemaOutput<TSchema>) => string;
  queryOptions?: TableQueryOptions;
  schema: TSchema;
}

function getSupabase(): SupabaseClient {
  // Delegate client lifecycle to the shared browser factory.
  // @supabase/ssr keeps browser auth/session state in sync for the active client.
  return createClient();
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

function createReadOnlyCollection<TSchema extends StandardSchema<unknown>>({
  id,
  queryKey,
  tableName,
  getKey,
  queryOptions,
  schema,
}: ReadOnlyCollectionConfig<TSchema>) {
  type TItem = SchemaOutput<TSchema>;

  return createCollection(
    queryCollectionOptions({
      id,
      queryKey: [...queryKey],
      queryClient: getQueryClient(),
      schema,
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
  fires_count: z.number().int(),
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

const userRoleSchema = z.enum([
  "donor",
  "missionary",
  "admin",
  "staff",
  "super_admin",
]);

const donationStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
  "refunded",
]);

const profileSchema = z.object({
  id: z.string().min(1),
  tenant_id: z.string().min(1),
  user_id: z.string().min(1),
  role: userRoleSchema,
  first_name: z.string(),
  last_name: z.string(),
  display_name: z.string().nullable(),
  email: z.string(),
  avatar_url: z.string().nullable(),
  phone: z.string().nullable(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

const missionarySchema = z.object({
  id: z.string().min(1),
  tenant_id: z.string().min(1),
  profile_id: z.string().min(1),
  bio: z.string().nullable(),
  mission_field: z.string().nullable(),
  funding_goal: z.number(),
  current_funding: z.number(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  tagline: z.string().nullable(),
  social_links: z.record(z.string(), z.unknown()),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

const donorSchema = z.object({
  id: z.string().min(1),
  tenant_id: z.string().min(1),
  profile_id: z.string().nullable(),
  missionary_id: z.string().nullable(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  mobile: z.string().nullable(),
  work_phone: z.string().nullable(),
  preferred_contact: z.string().nullable(),
  avatar_url: z.string().nullable(),
  location: z.string().nullable(),
  type: z.string().nullable(),
  status: z.string().nullable(),
  giving_preferences: z.record(z.string(), z.unknown()),
  total_given: z.number(),
  first_gift_date: z.string().nullable(),
  last_gift_date: z.string().nullable(),
  last_gift_amount: z.number().nullable(),
  gift_count: z.number().int(),
  frequency: z.string().nullable(),
  joined_date: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  score: z.number().nullable(),
  address: z.record(z.string(), z.unknown()).nullable(),
  work_address: z.record(z.string(), z.unknown()).nullable(),
  website: z.string().nullable(),
  organization: z.string().nullable(),
  title: z.string().nullable(),
  birthday: z.string().nullable(),
  anniversary: z.string().nullable(),
  spouse: z.string().nullable(),
  notes: z.string().nullable(),
  do_not_contact: z.boolean(),
  do_not_email: z.boolean(),
  receipt_email_frequency: z.string(),
  default_update_frequency: z.string().nullable(),
  preferred_language: z.string(),
  has_active_pledge: z.boolean().nullable(),
  stripe_customer_id: z.string().nullable(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

const donationSchema = z.object({
  id: z.string().min(1),
  tenant_id: z.string().nullable(),
  donor_id: z.string().nullable(),
  missionary_id: z.string().nullable(),
  fund_id: z.string().nullable(),
  amount: z.number(),
  currency: z.string(),
  status: donationStatusSchema,
  donation_type: z.string().nullable(),
  payment_method: z.string().nullable(),
  is_recurring: z.boolean().nullable(),
  recurring_interval: z.string().nullable(),
  notes: z.string().nullable(),
  stripe_payment_intent_id: z.string().nullable(),
  gift_date: z.string().min(1),
  campaign_id: z.string().nullable(),
  pledge_id: z.string().nullable(),
  processed_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  failed_at: z.string().nullable(),
  error_code: z.string().nullable(),
  error_message: z.string().nullable(),
  stripe_charge_id: z.string().nullable(),
  refunded_at: z.string().nullable(),
  refund_amount: z.number(),
  source: z.string().nullable(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

const fundSchema = z.object({
  id: z.string().min(1),
  tenant_id: z.string().min(1),
  name: z.string(),
  description: z.string().nullable(),
  target_amount: z.number(),
  goal_amount: z.number(),
  current_amount: z.number(),
  currency: z.string().nullable(),
  missionary_id: z.string().nullable(),
  is_active: z.boolean(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

function createProfilesCollection() {
  return createReadOnlyCollection({
    id: "profiles",
    queryKey: ["profiles"],
    tableName: "profiles",
    schema: profileSchema,
    getKey: (item) => item.id,
  });
}

function createMissionariesCollection() {
  return createReadOnlyCollection({
    id: "missionaries",
    queryKey: ["missionaries"],
    tableName: "missionaries",
    schema: missionarySchema,
    getKey: (item) => item.id,
  });
}

function createDonorsCollection() {
  return createReadOnlyCollection({
    id: "donors",
    queryKey: ["donors"],
    tableName: "donors",
    schema: donorSchema,
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
  return createReadOnlyCollection({
    id: "donations",
    queryKey: ["donations"],
    tableName: "donations",
    schema: donationSchema,
    getKey: (item) => item.id,
    queryOptions: {
      orderBy: { column: "created_at", ascending: false },
    },
  });
}

function createFundsCollection() {
  return createReadOnlyCollection({
    id: "funds",
    queryKey: ["funds"],
    tableName: "funds",
    schema: fundSchema,
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
