"use client";

import { type z } from "zod";

import { type LazySupabaseCollection } from "./supabase-collection";
import { assetsCollection, locationsCollection } from "./tables/app";
import {
  followsCollection,
  postCommentsCollection,
  postFiresCollection,
  postLikesCollection,
  postPrayersCollection,
  postsCollection,
} from "./tables/content";
import {
  donationsCollection,
  donorActivitiesCollection,
  donorPledgesCollection,
  fundsCollection,
} from "./tables/giving";
import {
  donorsCollection,
  missionariesCollection,
  profilesCollection,
} from "./tables/people";

export type CollectionRegistryKind =
  | "supabase-table"
  | "derived"
  | "server-read-helper"
  | "route-backed"
  | "local-only"
  | "legacy-temporary"
  | "server-only";

export type CollectionMutationPolicy =
  | "collection-crud"
  | "server-command"
  | "read-only"
  | "local-only";

export interface CollectionRegistryEntry {
  name: string;
  kind: CollectionRegistryKind;
  tableName?: string;
  primaryKeys?: string[];
  realtime: "enabled" | "disabled" | "not-applicable";
  rls:
    | "production-safe"
    | "staff-scoped"
    | "demo-review-required"
    | "not-applicable";
  mutationPolicy: CollectionMutationPolicy;
  notes: string;
}

function supabaseEntry<TSchema extends z.ZodType>(
  name: string,
  collection: LazySupabaseCollection<TSchema>,
  options: Pick<CollectionRegistryEntry, "rls" | "mutationPolicy" | "notes">,
): CollectionRegistryEntry {
  return {
    name,
    kind: "supabase-table",
    tableName: collection.metadata.tableName,
    primaryKeys: collection.metadata.keys,
    realtime: collection.metadata.realtime ? "enabled" : "disabled",
    ...options,
  };
}

export const collectionRegistry = [
  supabaseEntry("profilesCollection", profilesCollection, {
    rls: "demo-review-required",
    mutationPolicy: "read-only",
    notes:
      "Profile rows contain PII and require production-scoped RLS before live browser sync.",
  }),
  supabaseEntry("missionariesCollection", missionariesCollection, {
    rls: "demo-review-required",
    mutationPolicy: "read-only",
    notes:
      "Missionary profile data is browser-visible in product UI; production tenant RLS still needs explicit verification.",
  }),
  supabaseEntry("donorsCollection", donorsCollection, {
    rls: "demo-review-required",
    mutationPolicy: "server-command",
    notes:
      "Donor PII and Stripe customer references stay behind server commands until scoped RLS/redaction is complete.",
  }),
  supabaseEntry("donorActivitiesCollection", donorActivitiesCollection, {
    rls: "demo-review-required",
    mutationPolicy: "server-command",
    notes:
      "Donor activity rows can contain relationship notes, amounts, and CRM context.",
  }),
  supabaseEntry("donorPledgesCollection", donorPledgesCollection, {
    rls: "demo-review-required",
    mutationPolicy: "server-command",
    notes:
      "Recurring giving and payment method state remains server-command owned.",
  }),
  supabaseEntry("donationsCollection", donationsCollection, {
    rls: "demo-review-required",
    mutationPolicy: "server-command",
    notes:
      "Donation creation, payment confirmation, receipts, refunds, and corrections remain server-command owned.",
  }),
  supabaseEntry("fundsCollection", fundsCollection, {
    rls: "demo-review-required",
    mutationPolicy: "read-only",
    notes:
      "Funds are visible in donor/missionary/admin UI; writes remain server-owned until RLS policy is explicit.",
  }),
  supabaseEntry("postsCollection", postsCollection, {
    rls: "demo-review-required",
    mutationPolicy: "collection-crud",
    notes:
      "Ministry updates are normal live UI data, but publication/moderation rules still govern allowed writes.",
  }),
  supabaseEntry("postCommentsCollection", postCommentsCollection, {
    rls: "demo-review-required",
    mutationPolicy: "collection-crud",
    notes:
      "Comments are normal live UI data once user ownership and tenant visibility policies are verified.",
  }),
  supabaseEntry("postLikesCollection", postLikesCollection, {
    rls: "demo-review-required",
    mutationPolicy: "server-command",
    notes:
      "Interaction rows are browser-visible read models; writes also update counters and must stay behind RPC/server command flows.",
  }),
  supabaseEntry("postPrayersCollection", postPrayersCollection, {
    rls: "demo-review-required",
    mutationPolicy: "server-command",
    notes:
      "Interaction rows are browser-visible read models; writes also update counters and must stay behind RPC/server command flows.",
  }),
  supabaseEntry("postFiresCollection", postFiresCollection, {
    rls: "demo-review-required",
    mutationPolicy: "server-command",
    notes:
      "Interaction rows are browser-visible read models; writes also update counters and must stay behind RPC/server command flows.",
  }),
  supabaseEntry("followsCollection", followsCollection, {
    rls: "demo-review-required",
    mutationPolicy: "collection-crud",
    notes:
      "Follow state is normal user-visible UI data once donor ownership policies are verified.",
  }),
  supabaseEntry("locationsCollection", locationsCollection, {
    rls: "demo-review-required",
    mutationPolicy: "read-only",
    notes:
      "Published location rows are browser-visible map data; admin upserts remain server-command owned until policies are explicit.",
  }),
  supabaseEntry("assetsCollection", assetsCollection, {
    rls: "demo-review-required",
    mutationPolicy: "server-command",
    notes:
      "Asset metadata is available for display only where RLS allows it; uploads, transforms, and private metadata stay server-owned.",
  }),
  {
    name: "tenants",
    kind: "server-only",
    tableName: "tenants",
    primaryKeys: ["id"],
    realtime: "disabled",
    rls: "demo-review-required",
    mutationPolicy: "server-command",
    notes:
      "Tenant rows include Stripe secrets and tenant-wide settings; expose only redacted views or server read models.",
  },
  {
    name: "donorFeedPreferences",
    kind: "server-only",
    tableName: "donor_feed_preferences",
    primaryKeys: ["id"],
    realtime: "disabled",
    rls: "demo-review-required",
    mutationPolicy: "server-command",
    notes:
      "Per-donor preferences need ownership RLS before browser collection writes are allowed.",
  },
  {
    name: "followerRequests",
    kind: "server-only",
    tableName: "follower_requests",
    primaryKeys: ["id"],
    realtime: "disabled",
    rls: "demo-review-required",
    mutationPolicy: "server-command",
    notes:
      "Follower request approval changes are permission-sensitive and stay behind server commands.",
  },
  {
    name: "missionaryTasks",
    kind: "server-only",
    tableName: "missionary_tasks",
    primaryKeys: ["id"],
    realtime: "disabled",
    rls: "demo-review-required",
    mutationPolicy: "server-command",
    notes:
      "Missionary task workflows can contain donor context and need role-scoped RLS before browser collections.",
  },
  {
    name: "pdfTemplates",
    kind: "server-only",
    tableName: "pdf_templates",
    primaryKeys: ["id"],
    realtime: "disabled",
    rls: "demo-review-required",
    mutationPolicy: "server-command",
    notes:
      "PDF templates include design/html and document workflow state; use server routes until staff-scoped redaction is explicit.",
  },
  {
    name: "adminLocationsCollection",
    kind: "route-backed",
    realtime: "not-applicable",
    rls: "not-applicable",
    mutationPolicy: "server-command",
    notes:
      "Currently reads `/api/admin/locations`; migrate to `locations` collection after linked-entity and RLS decisions.",
  },
  {
    name: "donorHistoryTransactionsCollection",
    kind: "route-backed",
    realtime: "not-applicable",
    rls: "not-applicable",
    mutationPolicy: "read-only",
    notes:
      "Currently derived from donor portal API; migrate to live query composition or keep as server read model for receipts/payment redaction.",
  },
  {
    name: "adminWorkspaceCollections",
    kind: "local-only",
    realtime: "not-applicable",
    rls: "not-applicable",
    mutationPolicy: "local-only",
    notes:
      "Seeded admin CRM/task/care/event/mobilize/team collections; classify each as real table, derived, or demo-only during migration.",
  },
  {
    name: "supportHubCollections",
    kind: "local-only",
    realtime: "not-applicable",
    rls: "staff-scoped",
    mutationPolicy: "local-only",
    notes:
      "Seeded Support Hub collections should migrate to staff-scoped `support_*` tables; audit/inbound email side effects stay server-only.",
  },
  {
    name: "querySupabaseCollectionOnce",
    kind: "server-read-helper",
    realtime: "not-applicable",
    rls: "not-applicable",
    mutationPolicy: "read-only",
    notes:
      "Approved one-shot server read helper for bounded shared query shapes; not for commands or heavy reporting.",
  },
] as const satisfies readonly CollectionRegistryEntry[];

export const supabaseTableCollectionRegistry = collectionRegistry.filter(
  (entry) => entry.kind === "supabase-table",
);

export const localOnlyCollectionRegistry = collectionRegistry.filter(
  (entry) => entry.kind === "local-only",
);
