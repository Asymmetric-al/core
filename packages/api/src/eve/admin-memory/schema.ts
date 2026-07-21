import { z } from "zod";

import { EVE_ADMIN_MEMORY_CATEGORIES } from "./types";

export const eveAdminMemoryCategorySchema = z.enum(EVE_ADMIN_MEMORY_CATEGORIES);

export const createEveAdminMemorySchema = z
  .object({
    category: eveAdminMemoryCategorySchema,
    content: z.string().trim().min(1).max(4_000),
    scopeType: z.literal("admin_private").default("admin_private"),
    source: z.enum(["manual", "auto_save"]).default("manual"),
    title: z.string().trim().min(1).max(120),
  })
  .strict();

export const updateEveAdminMemorySchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("edit"),
      category: eveAdminMemoryCategorySchema,
      content: z.string().trim().min(1).max(4_000),
      entryId: z.string().uuid(),
      expectedVersion: z.number().int().positive(),
      title: z.string().trim().min(1).max(120),
    })
    .strict(),
  z
    .object({
      action: z.literal("set_auto_save"),
      category: eveAdminMemoryCategorySchema,
      enabled: z.boolean(),
    })
    .strict(),
]);

export const deleteEveAdminMemorySchema = z
  .object({
    entryId: z.string().uuid(),
    expectedVersion: z.number().int().positive(),
  })
  .strict();

export const searchEveAdminMemorySchema = z
  .object({
    includeDeleted: z.coerce.boolean().default(true),
    query: z.string().trim().max(100).default(""),
  })
  .strict();
