"use client";

import {
  donorSchema,
  missionarySchema,
  profileSchema,
} from "../schemas/people";
import { defineSupabaseCollection } from "../supabase-collection";

const productionRlsRequired =
  "Disabled until production tenant/ownership RLS and column exposure are reviewed.";
const missionaryRealtimeSafetyRequired =
  "Disabled until production tenant/ownership RLS and safe column exposure are resolved before live subscriptions are enabled.";

export const profilesCollection = defineSupabaseCollection({
  tableName: "profiles",
  schema: profileSchema,
  keys: ["id"],
  realtime: { enabled: false, reason: productionRlsRequired },
});

export const missionariesCollection = defineSupabaseCollection({
  tableName: "missionaries",
  schema: missionarySchema,
  keys: ["id"],
  realtime: { enabled: false, reason: missionaryRealtimeSafetyRequired },
});

export const donorsCollection = defineSupabaseCollection({
  tableName: "donors",
  schema: donorSchema,
  keys: ["id"],
  realtime: { enabled: false, reason: productionRlsRequired },
});
