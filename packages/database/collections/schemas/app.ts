import { z } from "zod";

export const locationSchema = z.object({
  id: z.string().min(1),
  tenant_id: z.string().nullable(),
  title: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  // Matches the seeded/browser-visible location types, including partner
  // briefing pins (see supabase/seed.sql locations insert).
  type: z.enum(["missionary", "project", "custom", "partner"]),
  linked_id: z.string().nullable(),
  summary: z.string().nullable(),
  image_public_id: z.string().nullable(),
  status: z.enum(["draft", "published"]),
  sort_key: z.number().int(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

export const assetSchema = z.object({
  id: z.string().min(1),
  public_id: z.string().min(1),
  secure_url: z.string().min(1),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  format: z.string().nullable(),
  resource_type: z.string(),
  purpose: z.string().nullable(),
  user_id: z.string().nullable(),
  tenant_id: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});
