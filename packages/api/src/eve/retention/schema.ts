import { z } from "zod";

import { EVE_RETENTION_HOLD_TYPES, EVE_RETENTION_SCOPE_TYPES } from "./types";

const safeId = z.string().regex(/^(?:[a-z0-9_-]{1,60}|[0-9a-f-]{36})$/);
const safeReason = z.string().trim().min(1).max(500);
const eveBodyArtifactKinds = ["replay", "debug"] as const;

export const mutateEveRetentionSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("store_artifact"),
      artifactKind: z.enum(eveBodyArtifactKinds),
      content: z.string().min(1).max(5_000_000),
      runId: z.string().uuid().optional(),
      redactedSummary: z.string().trim().min(1).max(2000),
    })
    .strict(),
  z
    .object({
      action: z.literal("download_artifact"),
      artifactId: z.string().uuid(),
    })
    .strict(),
  z
    .object({
      action: z.literal("set_hold"),
      holdType: z.enum(EVE_RETENTION_HOLD_TYPES),
      scopeType: z.enum(EVE_RETENTION_SCOPE_TYPES),
      targetId: safeId,
      reason: safeReason,
    })
    .strict(),
  z
    .object({
      action: z.literal("clear_hold"),
      holdId: z.string().uuid(),
      reason: safeReason,
    })
    .strict(),
  z
    .object({
      action: z.literal("run_expiry"),
      limit: z.number().int().min(1).max(500).default(100),
    })
    .strict(),
]);

export type EveRetentionMutation = z.infer<typeof mutateEveRetentionSchema>;
