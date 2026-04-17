/**
 * Lightweight Zod helpers for app-side mutation inputs. The wire format
 * schemas live next to the collections in `packages/database/collections/
 * support-hub.ts`; this file only declares the small enums and discriminated
 * unions a mutation hook needs to validate caller arguments before touching
 * the collection.
 */
import {
  SUPPORT_CONVERSATION_STATUSES,
  SUPPORT_PRIORITIES,
} from "@asym/database/hooks";
import { z } from "zod";

export const supportConversationStatusSchema = z.enum(
  SUPPORT_CONVERSATION_STATUSES,
);

export const supportPrioritySchema = z.enum(SUPPORT_PRIORITIES);

export const supportMacroActionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("set_status"),
    status: supportConversationStatusSchema,
  }),
  z.object({
    kind: z.literal("set_priority"),
    priority: supportPrioritySchema,
  }),
  z.object({ kind: z.literal("assign_agent"), agentId: z.string().min(1) }),
  z.object({ kind: z.literal("assign_team"), teamId: z.string().min(1) }),
  z.object({ kind: z.literal("add_label"), labelId: z.string().min(1) }),
  z.object({ kind: z.literal("remove_label"), labelId: z.string().min(1) }),
  z.object({
    kind: z.literal("send_canned_response"),
    cannedResponseId: z.string().min(1),
  }),
  z.object({ kind: z.literal("snooze"), hours: z.number().int().positive() }),
  z.object({
    kind: z.literal("add_private_note"),
    bodyText: z.string().min(1),
  }),
]);
