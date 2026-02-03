"use client";

import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createClient } from "../supabase/client";
import { getQueryClient } from "../providers/query-provider";
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

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}

let _profilesCollection: any = null;
let _missionariesCollection: any = null;
let _donorsCollection: any = null;
let _postsCollection: any = null;
let _postCommentsCollection: any = null;
let _donationsCollection: any = null;
let _fundsCollection: any = null;
let _followsCollection: any = null;

export const profilesCollection = {
  get value() {
    if (!_profilesCollection) {
      _profilesCollection = createCollection<Profile>(
        queryCollectionOptions({
          queryKey: ["profiles"],
          queryClient: getQueryClient(),
          getKey: (item) => item.id,
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
      _missionariesCollection = createCollection<Missionary>(
        queryCollectionOptions({
          queryKey: ["missionaries"],
          queryClient: getQueryClient(),
          getKey: (item) => item.id,
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
      _donorsCollection = createCollection<Donor>(
        queryCollectionOptions({
          queryKey: ["donors"],
          queryClient: getQueryClient(),
          getKey: (item) => item.id,
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
      _postsCollection = createCollection<Post>(
        queryCollectionOptions({
          queryKey: ["posts"],
          queryClient: getQueryClient(),
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
    return _postsCollection;
  },
};

export const postCommentsCollection = {
  get value() {
    if (!_postCommentsCollection) {
      _postCommentsCollection = createCollection<PostComment>(
        queryCollectionOptions({
          queryKey: ["post_comments"],
          queryClient: getQueryClient(),
          getKey: (item) => item.id,
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
        }),
      );
    }
    return _postCommentsCollection;
  },
};

export const donationsCollection = {
  get value() {
    if (!_donationsCollection) {
      _donationsCollection = createCollection<Donation>(
        queryCollectionOptions({
          queryKey: ["donations"],
          queryClient: getQueryClient(),
          getKey: (item) => item.id,
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
      _fundsCollection = createCollection<Fund>(
        queryCollectionOptions({
          queryKey: ["funds"],
          queryClient: getQueryClient(),
          getKey: (item) => item.id,
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
      _followsCollection = createCollection<Follow>(
        queryCollectionOptions({
          queryKey: ["follows"],
          queryClient: getQueryClient(),
          getKey: (item) => item.id,
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
