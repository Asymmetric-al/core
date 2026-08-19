"use client";

import {
  SUPPORT_AUTOMATION_ACTION_KINDS,
  SUPPORT_AUTOMATION_CONDITION_KINDS,
  SUPPORT_AUTOMATION_TRIGGERS,
  supportAgentsCollection,
  supportAutomationRulesCollection,
  supportBusinessHoursCollection,
  supportCannedResponsesCollection,
  supportConversationsCollection,
  supportInboxSettingsCollection,
  supportInboxesCollection,
  supportLabelsCollection,
  supportMacrosCollection,
  supportMessagesCollection,
  supportNotificationPreferencesCollection,
  supportSavedViewsCollection,
  supportSignaturesCollection,
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
 * Single namespaced surface for everything the hooks layer consumes.
 * `supportStore.collections` is the TanStack DB read surface over the
 * adapter-backed `/api/admin/support/**` routes. The messages collection is
 * local-only identity; thread messages stay on `useSupportMessages`.
 * Privileged writes stay server-command owned in `use-support-mutations.ts`.
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
    signatures: supportSignaturesCollection,
    automationRules: supportAutomationRulesCollection,
    notificationPreferences: supportNotificationPreferencesCollection,
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

    /* ----- Phase 6 inputs ------------------------------------------------ */

    saveInboxSettings: z.object({
      id: z.string().min(1),
      inboxId: z.string().min(1),
      defaultSignatureId: z.string().min(1).nullable(),
      defaultSlaPolicyId: z.string().min(1).nullable(),
      defaultBusinessHoursId: z.string().min(1).nullable(),
      roundRobinEnabled: z.boolean(),
      autoResolveAfterDays: z.number().int().nonnegative().nullable(),
      showContactSidecar: z.boolean(),
    }),
    saveBusinessHours: z.object({
      id: z.string().min(1).optional(),
      name: z.string().min(1),
      timezone: z.string().min(1),
      weeklySchedule: z.array(
        z.object({
          day: z.enum([
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ]),
          enabled: z.boolean(),
          openTime: z.string().regex(/^\d{2}:\d{2}$/),
          closeTime: z.string().regex(/^\d{2}:\d{2}$/),
        }),
      ),
      holidays: z.array(
        z.object({
          id: z.string().min(1),
          date: z.string().min(1),
          label: z.string().min(1),
        }),
      ),
      isDefault: z.boolean().default(false),
    }),
    deleteBusinessHours: z.object({ id: z.string().min(1) }),
    saveSlaPolicy: z.object({
      id: z.string().min(1).optional(),
      name: z.string().min(1),
      description: z.string().nullable(),
      firstResponseMinutes: z.number().int().positive(),
      nextResponseMinutes: z.number().int().positive(),
      resolutionMinutes: z.number().int().positive(),
      businessHoursId: z.string().min(1).nullable(),
      isDefault: z.boolean().default(false),
    }),
    deleteSlaPolicy: z.object({ id: z.string().min(1) }),
    setDefaultSlaPolicy: z.object({ id: z.string().min(1) }),
    saveTeam: z.object({
      id: z.string().min(1).optional(),
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().nullable(),
      initials: z.string().min(1).max(4),
    }),
    deleteTeam: z.object({ id: z.string().min(1) }),
    saveSignature: z.object({
      id: z.string().min(1).optional(),
      ownerAgentId: z.string().min(1).nullable(),
      name: z.string().min(1),
      bodyText: z.string().min(1),
      bodyHtml: z.string().nullable().optional(),
      isDefault: z.boolean().default(false),
    }),
    deleteSignature: z.object({ id: z.string().min(1) }),
    setDefaultSignature: z.object({ id: z.string().min(1) }),
    saveAutomationRule: z.object({
      id: z.string().min(1).optional(),
      name: z.string().min(1),
      description: z.string().nullable(),
      enabled: z.boolean().default(true),
      trigger: z.enum(SUPPORT_AUTOMATION_TRIGGERS),
      conditions: z.array(
        z
          .object({
            kind: z.enum(SUPPORT_AUTOMATION_CONDITION_KINDS),
          })
          .passthrough(),
      ),
      actions: z
        .array(
          z
            .object({
              kind: z.enum(SUPPORT_AUTOMATION_ACTION_KINDS),
            })
            .passthrough(),
        )
        .min(1),
    }),
    deleteAutomationRule: z.object({ id: z.string().min(1) }),
    toggleAutomationRule: z.object({
      id: z.string().min(1),
      enabled: z.boolean(),
    }),
    saveNotificationPreferences: z.object({
      agentId: z.string().min(1),
      emailMentions: z.boolean(),
      emailAssignments: z.boolean(),
      emailDailyDigest: z.boolean(),
      inAppMentions: z.boolean(),
      inAppAssignments: z.boolean(),
      inAppSlaWarnings: z.boolean(),
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
export type SaveInboxSettingsInput = z.input<
  typeof supportStore.inputs.saveInboxSettings
>;
export type SaveBusinessHoursInput = z.input<
  typeof supportStore.inputs.saveBusinessHours
>;
export type DeleteBusinessHoursInput = z.input<
  typeof supportStore.inputs.deleteBusinessHours
>;
export type SaveSlaPolicyInput = z.input<
  typeof supportStore.inputs.saveSlaPolicy
>;
export type DeleteSlaPolicyInput = z.input<
  typeof supportStore.inputs.deleteSlaPolicy
>;
export type SetDefaultSlaPolicyInput = z.input<
  typeof supportStore.inputs.setDefaultSlaPolicy
>;
export type SaveTeamInput = z.input<typeof supportStore.inputs.saveTeam>;
export type DeleteTeamInput = z.input<typeof supportStore.inputs.deleteTeam>;
export type SaveSignatureInput = z.input<
  typeof supportStore.inputs.saveSignature
>;
export type DeleteSignatureInput = z.input<
  typeof supportStore.inputs.deleteSignature
>;
export type SetDefaultSignatureInput = z.input<
  typeof supportStore.inputs.setDefaultSignature
>;
export type SaveAutomationRuleInput = z.input<
  typeof supportStore.inputs.saveAutomationRule
>;
export type DeleteAutomationRuleInput = z.input<
  typeof supportStore.inputs.deleteAutomationRule
>;
export type ToggleAutomationRuleInput = z.input<
  typeof supportStore.inputs.toggleAutomationRule
>;
export type SaveNotificationPreferencesInput = z.input<
  typeof supportStore.inputs.saveNotificationPreferences
>;
