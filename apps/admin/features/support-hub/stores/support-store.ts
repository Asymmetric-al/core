"use client";

import {
  supportAgentsCollection,
  supportBusinessHoursCollection,
  supportCannedResponsesCollection,
  supportConversationsCollection,
  supportInboxSettingsCollection,
  supportInboxesCollection,
  supportLabelsCollection,
  supportMacrosCollection,
  supportMessagesCollection,
  supportSavedViewsCollection,
  supportSlaPoliciesCollection,
  supportTeamsCollection,
} from "@asym/database/hooks";
import { z } from "zod";

import { supportReplyPayloadSchema } from "../models/editor-payload";
import {
  supportConversationStatusSchema,
  supportMacroActionSchema,
  supportPrioritySchema,
} from "../models/schemas";

import type { SupportReplyPayload } from "../models/editor-payload";

/**
 * Single namespaced surface for everything the hooks layer consumes. By
 * routing through `supportStore.collections.*` and `supportStore.inputs.*`,
 * a later phase can swap the in-memory collection writers for
 * `@asym/api/admin/support-hub/*` mutations without touching any hook file.
 *
 * Adapter rule: do NOT call collection methods (insert/update/delete) from
 * outside the hooks module. Hooks own the optimistic flow + invalidation;
 * this file owns the typed contracts and the collection registry.
 */
export const supportStore = {
  collections: {
    conversations: supportConversationsCollection,
    messages: supportMessagesCollection,
    labels: supportLabelsCollection,
    macros: supportMacrosCollection,
    cannedResponses: supportCannedResponsesCollection,
    savedViews: supportSavedViewsCollection,
    inboxes: supportInboxesCollection,
    inboxSettings: supportInboxSettingsCollection,
    teams: supportTeamsCollection,
    agents: supportAgentsCollection,
    businessHours: supportBusinessHoursCollection,
    slaPolicies: supportSlaPoliciesCollection,
  },
  inputs: {
    assignConversation: z.object({
      conversationId: z.string().min(1),
      assigneeAgentId: z.string().min(1).nullable(),
      teamId: z.string().min(1).nullable().optional(),
      reason: z
        .enum(["manual", "round_robin", "macro", "inbound"])
        .default("manual"),
    }),
    setConversationStatus: z.object({
      conversationId: z.string().min(1),
      status: supportConversationStatusSchema,
      snoozedUntil: z.string().min(1).nullable().optional(),
    }),
    snoozeConversation: z.object({
      conversationId: z.string().min(1),
      snoozedUntil: z.string().min(1),
    }),
    unsnoozeConversation: z.object({
      conversationId: z.string().min(1),
    }),
    toggleConversationLabel: z.object({
      conversationId: z.string().min(1),
      labelId: z.string().min(1),
      mode: z.enum(["add", "remove", "toggle"]).default("toggle"),
    }),
    setConversationPriority: z.object({
      conversationId: z.string().min(1),
      priority: supportPrioritySchema,
    }),
    addPrivateNote: z.object({
      conversationId: z.string().min(1),
      authorAgentId: z.string().min(1),
      bodyText: z.string().min(1),
      bodyHtml: z.string().optional(),
    }),
    sendReply: z.object({
      conversationId: z.string().min(1),
      authorAgentId: z.string().min(1),
      payload: supportReplyPayloadSchema,
      /**
       * `send` performs the optimistic donor reply (default — preserves the
       * Phase 3 bulk action contract). `draft` writes a `support_messages`
       * row with `deliveryState: "draft"` and skips the conversation-side
       * timestamp bumps so the inbox does not treat the draft as a real
       * outbound message.
       */
      mode: z.enum(["send", "draft"]).default("send"),
    }),
    saveMacro: z.object({
      id: z.string().min(1).optional(),
      name: z.string().min(1),
      description: z.string().nullable(),
      ownerAgentId: z.string().nullable(),
      actions: z.array(supportMacroActionSchema).min(1),
    }),
    saveCannedResponse: z.object({
      id: z.string().min(1).optional(),
      shortCode: z.string().min(1),
      title: z.string().min(1),
      ownerAgentId: z.string().nullable(),
      bodyText: z.string().min(1),
      bodyHtml: z.string().nullable().optional(),
    }),
    saveSavedView: z.object({
      id: z.string().min(1).optional(),
      name: z.string().min(1),
      slug: z.string().min(1),
      ownerAgentId: z.string().nullable(),
      scope: z.enum(["personal", "workspace"]),
      filter: z.object({
        view: z.enum(["all", "mine", "unassigned", "past-due", "escalated"]),
        layout: z.enum(["board", "table"]),
        status: z.union([supportConversationStatusSchema, z.literal("all")]),
        q: z.string(),
        labelSlugs: z.array(z.string()),
        assignee: z.string(),
      }),
    }),
    saveLabel: z.object({
      id: z.string().min(1).optional(),
      name: z.string().min(1),
      slug: z.string().min(1),
      tone: z.enum(["zinc", "blue", "amber", "rose", "emerald", "violet"]),
      description: z.string().nullable(),
    }),
    deleteLabel: z.object({
      id: z.string().min(1),
    }),
    deleteSavedView: z.object({
      id: z.string().min(1),
    }),
    deleteMacro: z.object({
      id: z.string().min(1),
    }),
    deleteCannedResponse: z.object({
      id: z.string().min(1),
    }),
    runMacro: z.object({
      conversationId: z.string().min(1),
      macroId: z.string().min(1),
      authorAgentId: z.string().min(1),
    }),
    applyRoundRobinAssignment: z.object({
      conversationId: z.string().min(1),
      /** Agent id of the actor performing the rotation; logged on the activity row. */
      authorAgentId: z.string().min(1).optional(),
      /**
       * Agents to skip when picking the next assignee. The current assignee is
       * automatically excluded; pass extras here for "skip on furlough" cases.
       */
      excludeAgentIds: z.array(z.string().min(1)).default([]),
    }),
  },
} as const;

/**
 * Inputs use `z.input<...>` so caller-side defaults (`reason`, `mode`) stay
 * optional at the type level — they only become required after Zod fills them
 * in inside the mutation hook.
 */
export type AssignConversationInput = z.input<
  typeof supportStore.inputs.assignConversation
>;
export type SetConversationStatusInput = z.input<
  typeof supportStore.inputs.setConversationStatus
>;
export type SnoozeConversationInput = z.input<
  typeof supportStore.inputs.snoozeConversation
>;
export type UnsnoozeConversationInput = z.input<
  typeof supportStore.inputs.unsnoozeConversation
>;
export type ToggleConversationLabelInput = z.input<
  typeof supportStore.inputs.toggleConversationLabel
>;
export type SetConversationPriorityInput = z.input<
  typeof supportStore.inputs.setConversationPriority
>;
export type AddPrivateNoteInput = z.input<
  typeof supportStore.inputs.addPrivateNote
>;
export type SendReplyInput = z.input<typeof supportStore.inputs.sendReply> & {
  payload: SupportReplyPayload;
};
export type SaveMacroInput = z.input<typeof supportStore.inputs.saveMacro>;
export type SaveCannedResponseInput = z.input<
  typeof supportStore.inputs.saveCannedResponse
>;
export type SaveSavedViewInput = z.input<
  typeof supportStore.inputs.saveSavedView
>;
export type SaveLabelInput = z.input<typeof supportStore.inputs.saveLabel>;
export type DeleteLabelInput = z.input<typeof supportStore.inputs.deleteLabel>;
export type DeleteSavedViewInput = z.input<
  typeof supportStore.inputs.deleteSavedView
>;
export type DeleteMacroInput = z.input<typeof supportStore.inputs.deleteMacro>;
export type DeleteCannedResponseInput = z.input<
  typeof supportStore.inputs.deleteCannedResponse
>;
export type RunMacroInput = z.input<typeof supportStore.inputs.runMacro>;
export type ApplyRoundRobinAssignmentInput = z.input<
  typeof supportStore.inputs.applyRoundRobinAssignment
>;
