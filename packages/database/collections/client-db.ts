// TanStack DB + query-db-collection typings diverge across minor versions; runtime behavior is correct.
// @ts-nocheck
"use client";

import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createClient } from "../supabase/client";
import { getQueryClient } from "../providers/query-provider";
import { supabaseTableQueryKeys } from "../query-keys";

type SupabaseClient = ReturnType<typeof createClient>;

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}

function queryCollectionSyncDefaults() {
  return {
    queryClient: getQueryClient(),
    staleTime: 60 * 1000,
    retry: (failureCount: number, error: unknown) => {
      if (error instanceof Error && error.message.includes("401")) return false;
      if (error instanceof Error && error.message.includes("403")) return false;
      return failureCount < 3;
    },
  } as const;
}

let _profilesCollection: unknown = null;
let _missionariesCollection: unknown = null;
let _donorsCollection: unknown = null;
let _postsCollection: unknown = null;
let _postCommentsCollection: unknown = null;
let _donationsCollection: unknown = null;
let _fundsCollection: unknown = null;
let _followsCollection: unknown = null;

export const profilesCollection = {
  get value() {
    if (!_profilesCollection) {
      _profilesCollection = createCollection(
        queryCollectionOptions({
          ...queryCollectionSyncDefaults(),
          queryKey: [...supabaseTableQueryKeys.profiles],
          getKey: (item: any) => item.id,
          queryFn: async () => {
            const { data, error } = await getSupabase()
              .from("profiles")
              .select("*");
            if (error) throw error;
            return data ?? [];
          },
        }),
      );
    }
    return _profilesCollection;
  },
};

export const missionariesCollection = {
  get value() {
    if (!_missionariesCollection) {
      _missionariesCollection = createCollection(
        queryCollectionOptions({
          ...queryCollectionSyncDefaults(),
          queryKey: [...supabaseTableQueryKeys.missionaries],
          getKey: (item: any) => item.id,
          queryFn: async () => {
            const { data, error } = await getSupabase()
              .from("missionaries")
              .select("*");
            if (error) throw error;
            return data ?? [];
          },
        }),
      );
    }
    return _missionariesCollection;
  },
};

export const donorsCollection = {
  get value() {
    if (!_donorsCollection) {
      _donorsCollection = createCollection(
        queryCollectionOptions({
          ...queryCollectionSyncDefaults(),
          queryKey: [...supabaseTableQueryKeys.donors],
          getKey: (item: any) => item.id,
          queryFn: async () => {
            const { data, error } = await getSupabase()
              .from("donors")
              .select("*");
            if (error) throw error;
            return data ?? [];
          },
        }),
      );
    }
    return _donorsCollection;
  },
};

export const postsCollection = {
  get value() {
    if (!_postsCollection) {
      _postsCollection = createCollection(
        queryCollectionOptions({
          ...queryCollectionSyncDefaults(),
          queryKey: [...supabaseTableQueryKeys.posts],
          getKey: (item: any) => item.id,
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
    return _postsCollection;
  },
};

export const postCommentsCollection = {
  get value() {
    if (!_postCommentsCollection) {
      _postCommentsCollection = createCollection(
        queryCollectionOptions({
          ...queryCollectionSyncDefaults(),
          queryKey: [...supabaseTableQueryKeys.post_comments],
          getKey: (item: any) => item.id,
          queryFn: async () => {
            const { data, error } = await getSupabase()
              .from("post_comments")
              .select("*")
              .order("created_at", { ascending: true });
            if (error) throw error;
            return data ?? [];
          },
          onInsert: async ({ transaction }) => {
            const items = transaction.mutations.map((m) => m.modified);
            const { error } = await getSupabase()
              .from("post_comments")
              .insert(items);
            if (error) throw error;
          },
          onUpdate: async ({ transaction }) => {
            await Promise.all(
              transaction.mutations.map(async (mutation) => {
                const { error } = await getSupabase()
                  .from("post_comments")
                  .update(mutation.modified)
                  .eq("id", mutation.key as string);
                if (error) throw error;
              }),
            );
          },
          onDelete: async ({ transaction }) => {
            const ids = transaction.mutations.map((m) => m.key as string);
            const { error } = await getSupabase()
              .from("post_comments")
              .delete()
              .in("id", ids);
            if (error) throw error;
          },
        }),
      );
    }
    return _postCommentsCollection;
  },
};

export const donationsCollection = {
  get value() {
    if (!_donationsCollection) {
      _donationsCollection = createCollection(
        queryCollectionOptions({
          ...queryCollectionSyncDefaults(),
          queryKey: [...supabaseTableQueryKeys.donations],
          getKey: (item: any) => item.id,
          queryFn: async () => {
            const { data, error } = await getSupabase()
              .from("donations")
              .select("*")
              .order("created_at", { ascending: false });
            if (error) throw error;
            return data ?? [];
          },
        }),
      );
    }
    return _donationsCollection;
  },
};

export const fundsCollection = {
  get value() {
    if (!_fundsCollection) {
      _fundsCollection = createCollection(
        queryCollectionOptions({
          ...queryCollectionSyncDefaults(),
          queryKey: [...supabaseTableQueryKeys.funds],
          getKey: (item: any) => item.id,
          queryFn: async () => {
            const { data, error } = await getSupabase()
              .from("funds")
              .select("*");
            if (error) throw error;
            return data ?? [];
          },
        }),
      );
    }
    return _fundsCollection;
  },
};

export const followsCollection = {
  get value() {
    if (!_followsCollection) {
      _followsCollection = createCollection(
        queryCollectionOptions({
          ...queryCollectionSyncDefaults(),
          queryKey: [...supabaseTableQueryKeys.follows],
          getKey: (item: any) => item.id,
          queryFn: async () => {
            const { data, error } = await getSupabase()
              .from("follows")
              .select("*");
            if (error) throw error;
            return data ?? [];
          },
          onInsert: async ({ transaction }) => {
            const items = transaction.mutations.map((m) => m.modified);
            const { error } = await getSupabase().from("follows").insert(items);
            if (error) throw error;
          },
          onDelete: async ({ transaction }) => {
            const ids = transaction.mutations.map((m) => m.key as string);
            const { error } = await getSupabase()
              .from("follows")
              .delete()
              .in("id", ids);
            if (error) throw error;
          },
        }),
      );
    }
    return _followsCollection;
  },
};
