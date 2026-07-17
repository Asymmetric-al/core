"use client";

import { assetSchema, locationSchema } from "../schemas/app";
import { defineSupabaseCollection } from "../supabase-collection";

export const locationsCollection = defineSupabaseCollection({
  tableName: "locations",
  schema: locationSchema,
  keys: ["id"],
});

export const assetsCollection = defineSupabaseCollection({
  tableName: "assets",
  schema: assetSchema,
  keys: ["id"],
  realtime: {
    enabled: false,
    reason:
      "Asset metadata can contain private upload context and does not need live sync by default.",
  },
});
