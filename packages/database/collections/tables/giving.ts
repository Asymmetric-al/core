"use client";

import {
  donationSchema,
  donorActivitySchema,
  donorPledgeSchema,
  fundSchema,
} from "../schemas/giving";
import { defineSupabaseCollection } from "../supabase-collection";

const financeRlsRequired =
  "Finance and donor PII tables require production tenant/ownership RLS before live browser sync.";

export const donorActivitiesCollection = defineSupabaseCollection({
  tableName: "donor_activities",
  schema: donorActivitySchema,
  keys: ["id"],
  realtime: { enabled: false, reason: financeRlsRequired },
});

export const donorPledgesCollection = defineSupabaseCollection({
  tableName: "donor_pledges",
  schema: donorPledgeSchema,
  keys: ["id"],
  realtime: { enabled: false, reason: financeRlsRequired },
});

export const donationsCollection = defineSupabaseCollection({
  tableName: "donations",
  schema: donationSchema,
  keys: ["id"],
  realtime: { enabled: false, reason: financeRlsRequired },
});

export const fundsCollection = defineSupabaseCollection({
  tableName: "funds",
  schema: fundSchema,
  keys: ["id"],
});
