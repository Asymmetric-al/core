"use client";

import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { z } from "zod";

import { getQueryClient } from "../providers/query-client";
import {
  getSupabaseTableQueryKey,
  type SupabaseTableQueryName,
} from "../query-keys";
import { createClient } from "../supabase/client";

import type { QueryKey } from "@tanstack/react-query";

type SupabaseClient = ReturnType<typeof createClient>;

interface TableQueryOptions {
  orderBy?: {
    column: string;
    ascending: boolean;
  };
}

type SchemaOutput<TSchema extends z.ZodObject<z.ZodRawShape>> =
  z.output<TSchema>;

function getSupabase(): SupabaseClient {
  // Delegate client lifecycle to the shared browser factory.
  // @supabase/ssr keeps browser auth/session state in sync for the active client.
  return createClient();
}

async function fetchTableRows<TItem extends Record<string, unknown>>(
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

interface BoundedFetchOrder {
  column: string;
  ascending: boolean;
}

interface BoundedTableFetchOptions {
  /** Canonical table name (also the base of the default query key). */
  table: SupabaseTableQueryName;
  /**
   * Full query key the backing collection uses. Defaults to the table's
   * canonical key; scoped collections pass a key that includes their scope so
   * `loadMore` invalidates exactly that collection and nothing else.
   */
  queryKey?: QueryKey;
  orderBy: BoundedFetchOrder;
  pageSize: number;
  /** Equality filters applied to every fetch (e.g. scope to one missionary). */
  filters?: ReadonlyArray<{ column: string; value: string }>;
  /**
   * Extra PostgREST select fragment appended to `*`, used only to filter the
   * window (e.g. an `!inner` embed for a column that lives on a related table).
   * Any keys it adds to each row are stripped via `omitKeys` so the stored
   * shape still matches the collection schema.
   */
  embedSelect?: string;
  /** Embed-only keys to drop from each row before it reaches the schema. */
  omitKeys?: readonly string[];
  /** When false, the queryFn short-circuits to `[]` and never hits the network. */
  enabled?: boolean;
}

export interface BoundedCollectionPagination {
  /** True when the last fetch filled the window, so more rows likely exist. */
  hasMore: () => boolean;
  /**
   * Grow the fetch window by one page and refetch the collection.
   * Resolves to false when the last fetch already drained the table.
   */
  loadMore: () => Promise<boolean>;
  /**
   * Subscribe to window changes. Pairs with `getSnapshot` so React consumers
   * can read `hasMore` reactively through `useSyncExternalStore` — without this
   * a fetch that drains the window leaves a stale "load more" affordance.
   */
  subscribe: (listener: () => void) => () => void;
  /** Stable primitive snapshot of `hasMore` for `useSyncExternalStore`. */
  getSnapshot: () => boolean;
}

interface BoundedTableFetcher<TItem> extends BoundedCollectionPagination {
  queryFn: () => Promise<TItem[]>;
}

/**
 * Bounded fetch window with offset continuation for query-db collections.
 *
 * Query collections replace their contents with whatever the queryFn returns,
 * so the window always starts at row 0: a refetch (query invalidation)
 * refreshes every loaded row, and `loadMore` grows the window by one page
 * before invalidating the collection's query key to trigger that refetch.
 *
 * The window flag is exposed reactively (`subscribe`/`getSnapshot`) because it
 * only settles after a fetch resolves — a `loadMore` that turns up no new rows
 * must be able to retract a "load more" affordance.
 */
export function createBoundedTableFetcher<
  TItem extends Record<string, unknown>,
>(options: BoundedTableFetchOptions): BoundedTableFetcher<TItem> {
  const queryKey = options.queryKey ?? getSupabaseTableQueryKey(options.table);
  const enabled = options.enabled ?? true;
  const omitKeys = options.omitKeys ?? [];

  let loadedPageCount = 1;
  let lastFetchFilledWindow = false;
  let loadMoreInFlight = false;
  const listeners = new Set<() => void>();

  const setFilledWindow = (filled: boolean) => {
    if (filled === lastFetchFilledWindow) {
      return;
    }
    lastFetchFilledWindow = filled;
    for (const listener of listeners) {
      listener();
    }
  };

  const queryFn = async (): Promise<TItem[]> => {
    if (!enabled) {
      setFilledWindow(false);
      return [];
    }
    const windowSize = loadedPageCount * options.pageSize;
    const selectClause = options.embedSelect
      ? `*, ${options.embedSelect}`
      : "*";
    let query = getSupabase().from(options.table).select(selectClause);
    for (const filter of options.filters ?? []) {
      query = query.eq(filter.column, filter.value);
    }
    const { data, error } = await query
      // Null sort values sort last so real rows fill the window, not nulls.
      .order(options.orderBy.column, {
        ascending: options.orderBy.ascending,
        nullsFirst: false,
      })
      // Tie-break on the primary key so window boundaries stay deterministic.
      .order("id", { ascending: true })
      .range(0, windowSize - 1);
    if (error) {
      throw error;
    }
    // The select string is built at runtime (and may carry an embed), so
    // postgrest-js can't statically type the rows; the error path above is the
    // real guard. Cast through `unknown` per the repo's query idiom.
    const rawRows = (data ?? []) as unknown as Record<string, unknown>[];
    setFilledWindow(rawRows.length >= windowSize);
    if (omitKeys.length === 0) {
      return rawRows as TItem[];
    }
    return rawRows.map((row) => {
      const next = { ...row };
      for (const key of omitKeys) {
        delete next[key];
      }
      return next as TItem;
    });
  };

  const hasMore = () => lastFetchFilledWindow;
  const getSnapshot = () => lastFetchFilledWindow;

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const loadMore = async (): Promise<boolean> => {
    // Guard re-entry: a second call before the refetch settles would grow the
    // window by two pages instead of one (e.g. a double-click landing before
    // the consumer's disabled state flushes).
    if (!enabled || !lastFetchFilledWindow || loadMoreInFlight) {
      return false;
    }
    loadMoreInFlight = true;
    loadedPageCount += 1;
    try {
      await getQueryClient().invalidateQueries({ queryKey });
    } finally {
      loadMoreInFlight = false;
    }
    return true;
  };

  return { queryFn, hasMore, loadMore, subscribe, getSnapshot };
}

/** Combine several fetchers' pagination into one for a multi-collection view. */
function aggregatePagination(
  fetchers: readonly BoundedCollectionPagination[],
): BoundedCollectionPagination {
  return {
    hasMore: () => fetchers.some((fetcher) => fetcher.hasMore()),
    getSnapshot: () => fetchers.some((fetcher) => fetcher.getSnapshot()),
    subscribe: (listener) => {
      const unsubscribes = fetchers.map((fetcher) =>
        fetcher.subscribe(listener),
      );
      return () => {
        for (const unsubscribe of unsubscribes) {
          unsubscribe();
        }
      };
    },
    loadMore: async () => {
      const results = await Promise.all(
        fetchers.map((fetcher) => fetcher.loadMore()),
      );
      return results.some(Boolean);
    },
  };
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

const donorActivitySchema = z.object({
  id: z.string().min(1),
  donor_id: z.string().nullable(),
  type: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  date: z.string().nullable(),
  amount: z.number().nullable(),
  status: z.string().nullable(),
  gift_type: z.string().nullable(),
  note: z.string().nullable(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

const donorPledgeSchema = z.object({
  id: z.string().min(1),
  tenant_id: z.string().nullable(),
  donor_id: z.string().nullable(),
  missionary_id: z.string().nullable(),
  fund_id: z.string().nullable(),
  amount: z.number(),
  currency: z.string(),
  frequency: z.string().nullable(),
  status: z.string(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  next_payment_date: z.string().nullable(),
  stripe_subscription_id: z.string().nullable(),
  billing_day_of_month: z.number().int().nullable(),
  billing_timezone: z.string().nullable(),
  stripe_payment_method_id: z.string().nullable(),
  retry_count: z.number().int(),
  last_charge_at: z.string().nullable(),
  last_charge_attempt: z.string().nullable(),
  failed_charge_count: z.number().int(),
  pause_reason: z.string().nullable(),
  paused_at: z.string().nullable(),
  next_charge_at: z.string().nullable(),
  total_paid: z.number(),
  total_expected: z.number(),
  payments_completed: z.number().int().nullable(),
  payments_remaining: z.number().int().nullable(),
  payment_method: z.string().nullable(),
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

/**
 * Fetch windows for collections backed by tables that grow with tenant size.
 * Without a bound these queryFns load entire tables into the browser.
 */
const DONORS_PAGE_SIZE = 1000;
const DONOR_ACTIVITIES_PAGE_SIZE = 1000;
const DONOR_PLEDGES_PAGE_SIZE = 500;
const POSTS_PAGE_SIZE = 200;
const DONATIONS_PAGE_SIZE = 1000;
const POST_COMMENTS_PAGE_SIZE = 500;
const FOLLOWS_PAGE_SIZE = 1000;

const donorsFetcher = createBoundedTableFetcher<
  SchemaOutput<typeof donorSchema>
>({
  table: "donors",
  pageSize: DONORS_PAGE_SIZE,
  orderBy: { column: "created_at", ascending: false },
});

const donorActivitiesFetcher = createBoundedTableFetcher<
  SchemaOutput<typeof donorActivitySchema>
>({
  table: "donor_activities",
  pageSize: DONOR_ACTIVITIES_PAGE_SIZE,
  orderBy: { column: "date", ascending: false },
});

const donorPledgesFetcher = createBoundedTableFetcher<
  SchemaOutput<typeof donorPledgeSchema>
>({
  table: "donor_pledges",
  pageSize: DONOR_PLEDGES_PAGE_SIZE,
  orderBy: { column: "start_date", ascending: false },
});

const postsFetcher = createBoundedTableFetcher<SchemaOutput<typeof postSchema>>(
  {
    table: "posts",
    pageSize: POSTS_PAGE_SIZE,
    orderBy: { column: "created_at", ascending: false },
  },
);

const donationsFetcher = createBoundedTableFetcher<
  SchemaOutput<typeof donationSchema>
>({
  table: "donations",
  pageSize: DONATIONS_PAGE_SIZE,
  orderBy: { column: "created_at", ascending: false },
});

const postCommentsFetcher = createBoundedTableFetcher<
  SchemaOutput<typeof postCommentSchema>
>({
  table: "post_comments",
  pageSize: POST_COMMENTS_PAGE_SIZE,
  orderBy: { column: "created_at", ascending: true },
});

const followsFetcher = createBoundedTableFetcher<
  SchemaOutput<typeof followSchema>
>({
  table: "follows",
  pageSize: FOLLOWS_PAGE_SIZE,
  orderBy: { column: "created_at", ascending: false },
});

/**
 * Per-missionary scoped donor collections.
 *
 * The tenant-wide collections above load every tenant's donors into the
 * browser and then filter client-side, which both over-fetches and lets a
 * missionary's own donors fall outside the newest-N window. These scoped
 * collections push the `missionary_id` filter into the query so each missionary
 * fetches only their slice. `donor_activities` has no `missionary_id`, so it is
 * scoped through its `donors` foreign key with an inner embed, and the embed
 * column is stripped before validation.
 */
const SCOPED_DONORS_PAGE_SIZE = 500;
const SCOPED_DONOR_ACTIVITIES_PAGE_SIZE = 1000;
const SCOPED_DONOR_PLEDGES_PAGE_SIZE = 500;

function buildMissionaryScopedDonorCollections(missionaryId: string | null) {
  const scopeKey = missionaryId ?? "none";
  const enabled = Boolean(missionaryId);
  const directScope = missionaryId
    ? [{ column: "missionary_id", value: missionaryId }]
    : [];

  const scopedDonorsFetcher = createBoundedTableFetcher<
    SchemaOutput<typeof donorSchema>
  >({
    table: "donors",
    queryKey: ["donors", "missionary", scopeKey],
    pageSize: SCOPED_DONORS_PAGE_SIZE,
    orderBy: { column: "created_at", ascending: false },
    filters: directScope,
    enabled,
  });

  const scopedActivitiesFetcher = createBoundedTableFetcher<
    SchemaOutput<typeof donorActivitySchema>
  >({
    table: "donor_activities",
    queryKey: ["donor_activities", "missionary", scopeKey],
    pageSize: SCOPED_DONOR_ACTIVITIES_PAGE_SIZE,
    orderBy: { column: "date", ascending: false },
    embedSelect: "donors!inner(missionary_id)",
    filters: missionaryId
      ? [{ column: "donors.missionary_id", value: missionaryId }]
      : [],
    omitKeys: ["donors"],
    enabled,
  });

  const scopedPledgesFetcher = createBoundedTableFetcher<
    SchemaOutput<typeof donorPledgeSchema>
  >({
    table: "donor_pledges",
    queryKey: ["donor_pledges", "missionary", scopeKey],
    pageSize: SCOPED_DONOR_PLEDGES_PAGE_SIZE,
    orderBy: { column: "start_date", ascending: false },
    filters: directScope,
    enabled,
  });

  const donorsCollection = createCollection(
    queryCollectionOptions({
      id: `donors:missionary:${scopeKey}`,
      queryKey: ["donors", "missionary", scopeKey],
      queryClient: getQueryClient(),
      schema: donorSchema,
      getKey: (item) => item.id,
      enabled,
      queryFn: scopedDonorsFetcher.queryFn,
    }),
  );

  const donorActivitiesCollection = createCollection(
    queryCollectionOptions({
      id: `donor_activities:missionary:${scopeKey}`,
      queryKey: ["donor_activities", "missionary", scopeKey],
      queryClient: getQueryClient(),
      schema: donorActivitySchema,
      getKey: (item) => item.id,
      enabled,
      queryFn: scopedActivitiesFetcher.queryFn,
    }),
  );

  const donorPledgesCollection = createCollection(
    queryCollectionOptions({
      id: `donor_pledges:missionary:${scopeKey}`,
      queryKey: ["donor_pledges", "missionary", scopeKey],
      queryClient: getQueryClient(),
      schema: donorPledgeSchema,
      getKey: (item) => item.id,
      enabled,
      queryFn: scopedPledgesFetcher.queryFn,
    }),
  );

  return {
    donorsCollection,
    donorActivitiesCollection,
    donorPledgesCollection,
    pagination: aggregatePagination([
      scopedDonorsFetcher,
      scopedActivitiesFetcher,
      scopedPledgesFetcher,
    ]),
  };
}

export type MissionaryScopedDonorCollections = ReturnType<
  typeof buildMissionaryScopedDonorCollections
>;

// One collection set per missionary, kept stable across renders. A session
// touches a single missionary id, so this map stays small in practice.
const scopedDonorCollectionsByMissionary = new Map<
  string,
  MissionaryScopedDonorCollections
>();

export function getMissionaryScopedDonorCollections(
  missionaryId: string | null | undefined,
): MissionaryScopedDonorCollections {
  const key = missionaryId ?? "none";
  let collections = scopedDonorCollectionsByMissionary.get(key);
  if (!collections) {
    collections = buildMissionaryScopedDonorCollections(missionaryId ?? null);
    scopedDonorCollectionsByMissionary.set(key, collections);
  }
  return collections;
}

function createProfilesCollection() {
  return createCollection(
    queryCollectionOptions({
      id: "profiles",
      queryKey: ["profiles"],
      queryClient: getQueryClient(),
      schema: profileSchema,
      getKey: (item) => item.id,
      queryFn: () =>
        fetchTableRows<SchemaOutput<typeof profileSchema>>("profiles"),
    }),
  );
}

function createMissionariesCollection() {
  return createCollection(
    queryCollectionOptions({
      id: "missionaries",
      queryKey: ["missionaries"],
      queryClient: getQueryClient(),
      schema: missionarySchema,
      getKey: (item) => item.id,
      queryFn: () =>
        fetchTableRows<SchemaOutput<typeof missionarySchema>>("missionaries"),
    }),
  );
}

function createDonorsCollection() {
  return createCollection(
    queryCollectionOptions({
      id: "donors",
      queryKey: ["donors"],
      queryClient: getQueryClient(),
      schema: donorSchema,
      getKey: (item) => item.id,
      queryFn: donorsFetcher.queryFn,
    }),
  );
}

function createPostsCollection() {
  return createCollection(
    queryCollectionOptions({
      id: "posts",
      queryKey: ["posts"],
      queryClient: getQueryClient(),
      schema: postSchema,
      getKey: (item) => item.id,
      queryFn: postsFetcher.queryFn,
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
      queryFn: postCommentsFetcher.queryFn,
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
  return createCollection(
    queryCollectionOptions({
      id: "donations",
      queryKey: ["donations"],
      queryClient: getQueryClient(),
      schema: donationSchema,
      getKey: (item) => item.id,
      queryFn: donationsFetcher.queryFn,
    }),
  );
}

function createDonorActivitiesCollection() {
  return createCollection(
    queryCollectionOptions({
      id: "donor_activities",
      queryKey: ["donor_activities"],
      queryClient: getQueryClient(),
      schema: donorActivitySchema,
      getKey: (item) => item.id,
      queryFn: donorActivitiesFetcher.queryFn,
    }),
  );
}

function createDonorPledgesCollection() {
  return createCollection(
    queryCollectionOptions({
      id: "donor_pledges",
      queryKey: ["donor_pledges"],
      queryClient: getQueryClient(),
      schema: donorPledgeSchema,
      getKey: (item) => item.id,
      queryFn: donorPledgesFetcher.queryFn,
    }),
  );
}

function createFundsCollection() {
  return createCollection(
    queryCollectionOptions({
      id: "funds",
      queryKey: ["funds"],
      queryClient: getQueryClient(),
      schema: fundSchema,
      getKey: (item) => item.id,
      queryFn: () => fetchTableRows<SchemaOutput<typeof fundSchema>>("funds"),
    }),
  );
}

function createFollowsCollection() {
  return createCollection(
    queryCollectionOptions({
      id: "follows",
      queryKey: ["follows"],
      queryClient: getQueryClient(),
      schema: followSchema,
      getKey: (item) => item.id,
      queryFn: followsFetcher.queryFn,
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
export const donorActivitiesCollection = defineLazyCollection(
  createDonorActivitiesCollection,
);
export const donorPledgesCollection = defineLazyCollection(
  createDonorPledgesCollection,
);
export const postsCollection = defineLazyCollection(createPostsCollection);

export const postCommentsCollection = defineLazyCollection(
  createPostCommentsCollection,
);
export const donationsCollection = defineLazyCollection(
  createDonationsCollection,
);
export const fundsCollection = defineLazyCollection(createFundsCollection);
export const followsCollection = defineLazyCollection(createFollowsCollection);

// Continuation for the tenant-wide bounded collections. Each fetcher already
// implements BoundedCollectionPagination; the annotation hides its queryFn.
export const donorsCollectionPagination: BoundedCollectionPagination =
  donorsFetcher;
export const donorActivitiesCollectionPagination: BoundedCollectionPagination =
  donorActivitiesFetcher;
export const donorPledgesCollectionPagination: BoundedCollectionPagination =
  donorPledgesFetcher;
export const postsCollectionPagination: BoundedCollectionPagination =
  postsFetcher;
export const donationsCollectionPagination: BoundedCollectionPagination =
  donationsFetcher;
export const postCommentsCollectionPagination: BoundedCollectionPagination =
  postCommentsFetcher;
export const followsCollectionPagination: BoundedCollectionPagination =
  followsFetcher;
