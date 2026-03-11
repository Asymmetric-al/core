"use client";

import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";

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

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}

function createProfilesCollection() {
  return createCollection<Profile>(
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

function createMissionariesCollection() {
  return createCollection<Missionary>(
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

function createDonorsCollection() {
  return createCollection<Donor>(
    queryCollectionOptions({
      queryKey: ["donors"],
      queryClient: getQueryClient(),
      getKey: (item) => item.id,
      queryFn: async () => {
        const { data, error } = await getSupabase().from("donors").select("*");
        if (error) throw error;
        return data ?? [];
      },
    }),
  );
}

function createPostsCollection() {
  return createCollection<Post>(
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

function createPostCommentsCollection() {
  return createCollection<PostComment>(
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

function createDonationsCollection() {
  return createCollection<Donation>(
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

function createFundsCollection() {
  return createCollection<Fund>(
    queryCollectionOptions({
      queryKey: ["funds"],
      queryClient: getQueryClient(),
      getKey: (item) => item.id,
      queryFn: async () => {
        const { data, error } = await getSupabase().from("funds").select("*");
        if (error) throw error;
        return data ?? [];
      },
    }),
  );
}

function createFollowsCollection() {
  return createCollection<Follow>(
    queryCollectionOptions({
      queryKey: ["follows"],
      queryClient: getQueryClient(),
      getKey: (item) => item.id,
      queryFn: async () => {
        const { data, error } = await getSupabase().from("follows").select("*");
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

let _profilesCollection:
  | ReturnType<typeof createProfilesCollection>
  | undefined;
let _missionariesCollection:
  | ReturnType<typeof createMissionariesCollection>
  | undefined;
let _donorsCollection: ReturnType<typeof createDonorsCollection> | undefined;
let _postsCollection: ReturnType<typeof createPostsCollection> | undefined;
let _postCommentsCollection:
  | ReturnType<typeof createPostCommentsCollection>
  | undefined;
let _donationsCollection:
  | ReturnType<typeof createDonationsCollection>
  | undefined;
let _fundsCollection: ReturnType<typeof createFundsCollection> | undefined;
let _followsCollection: ReturnType<typeof createFollowsCollection> | undefined;

function getOrCreateCollection<T>(
  existing: T | undefined,
  create: () => T,
  set: (value: T) => void,
): T {
  if (existing !== undefined) {
    return existing;
  }
  const created = create();
  set(created);
  return created;
}

export const profilesCollection = {
  get value() {
    return getOrCreateCollection(
      _profilesCollection,
      createProfilesCollection,
      (value) => {
        _profilesCollection = value;
      },
    );
  },
};

export const missionariesCollection = {
  get value() {
    return getOrCreateCollection(
      _missionariesCollection,
      createMissionariesCollection,
      (value) => {
        _missionariesCollection = value;
      },
    );
  },
};

export const donorsCollection = {
  get value() {
    return getOrCreateCollection(
      _donorsCollection,
      createDonorsCollection,
      (value) => {
        _donorsCollection = value;
      },
    );
  },
};

export const postsCollection = {
  get value() {
    return getOrCreateCollection(
      _postsCollection,
      createPostsCollection,
      (value) => {
        _postsCollection = value;
      },
    );
  },
};

export const postCommentsCollection = {
  get value() {
    return getOrCreateCollection(
      _postCommentsCollection,
      createPostCommentsCollection,
      (value) => {
        _postCommentsCollection = value;
      },
    );
  },
};

export const donationsCollection = {
  get value() {
    return getOrCreateCollection(
      _donationsCollection,
      createDonationsCollection,
      (value) => {
        _donationsCollection = value;
      },
    );
  },
};

export const fundsCollection = {
  get value() {
    return getOrCreateCollection(
      _fundsCollection,
      createFundsCollection,
      (value) => {
        _fundsCollection = value;
      },
    );
  },
};

export const followsCollection = {
  get value() {
    return getOrCreateCollection(
      _followsCollection,
      createFollowsCollection,
      (value) => {
        _followsCollection = value;
      },
    );
  },
};
