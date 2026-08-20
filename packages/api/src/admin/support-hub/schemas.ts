import {
  SUPPORT_AUTOMATION_ACTION_KINDS,
  SUPPORT_AUTOMATION_CONDITION_KINDS,
  SUPPORT_AUTOMATION_TRIGGERS,
  SUPPORT_CONVERSATION_STATUSES,
  SUPPORT_INBOX_LAYOUTS,
  SUPPORT_INBOX_VIEWS,
  SUPPORT_LABEL_TONES,
  SUPPORT_PRIORITIES,
  supportClockTimeSchema,
} from "@asym/database/collections/support-hub.schema";
import { z } from "zod";

/**
 * Server-side Zod schemas for every Support Hub mutation surface. Mirrors the
 * `supportStore.inputs.*` shapes from Phase 2 / 5 / 6 so the same payloads
 * the UI builds today can be POSTed to the route handlers without
 * translation. Phase 8 will reuse these schemas verbatim against the real
 * Supabase adapter.
 */

const idSchema = z.string().min(1);

export const assignConversationSchema = z.object({
  conversationId: idSchema,
  assigneeAgentId: idSchema.nullable(),
  teamId: idSchema.nullable().optional(),
  reason: z
    .enum(["manual", "round_robin", "macro", "inbound"])
    .default("manual"),
});

export const setConversationStatusSchema = z.object({
  conversationId: idSchema,
  status: z.enum(SUPPORT_CONVERSATION_STATUSES),
  snoozedUntil: z.string().min(1).nullable().optional(),
});

export const snoozeConversationSchema = z.object({
  conversationId: idSchema,
  snoozedUntil: z.string().min(1),
});

export const unsnoozeConversationSchema = z.object({
  conversationId: idSchema,
});

export const toggleConversationLabelSchema = z.object({
  conversationId: idSchema,
  labelId: idSchema,
  mode: z.enum(["add", "remove", "toggle"]).default("toggle"),
});

export const setConversationPrioritySchema = z.object({
  conversationId: idSchema,
  priority: z.enum(SUPPORT_PRIORITIES),
});

export const addPrivateNoteSchema = z.object({
  conversationId: idSchema,
  authorAgentId: idSchema,
  bodyText: z.string().min(1),
  bodyHtml: z.string().optional(),
});

export const sendReplyPayloadSchema = z.object({
  json: z.unknown(),
  html: z.string(),
  text: z.string(),
  attachments: z
    .array(
      z.object({
        filename: z.string().min(1),
        contentType: z.string().min(1),
        sizeBytes: z.number().int().nonnegative(),
      }),
    )
    .optional(),
});

export const sendReplySchema = z.object({
  conversationId: idSchema,
  authorAgentId: idSchema,
  mode: z.enum(["send", "draft"]).default("send"),
  payload: sendReplyPayloadSchema,
});

export const saveLabelSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  tone: z.enum(SUPPORT_LABEL_TONES),
  description: z.string().nullable(),
});

export const macroActionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("set_status"),
    status: z.enum(SUPPORT_CONVERSATION_STATUSES),
  }),
  z.object({
    kind: z.literal("set_priority"),
    priority: z.enum(SUPPORT_PRIORITIES),
  }),
  z.object({ kind: z.literal("assign_agent"), agentId: idSchema }),
  z.object({ kind: z.literal("assign_team"), teamId: idSchema }),
  z.object({ kind: z.literal("add_label"), labelId: idSchema }),
  z.object({ kind: z.literal("remove_label"), labelId: idSchema }),
  z.object({
    kind: z.literal("send_canned_response"),
    cannedResponseId: idSchema,
  }),
  z.object({ kind: z.literal("snooze"), hours: z.number().int().positive() }),
  z.object({
    kind: z.literal("add_private_note"),
    bodyText: z.string().min(1),
  }),
]);

export const saveMacroSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1),
  description: z.string().nullable(),
  ownerAgentId: idSchema.nullable(),
  actions: z.array(macroActionSchema).min(1),
});

export const saveCannedResponseSchema = z.object({
  id: idSchema.optional(),
  shortCode: z.string().min(1),
  title: z.string().min(1),
  ownerAgentId: idSchema.nullable(),
  bodyText: z.string().min(1),
  bodyHtml: z.string().nullable().optional(),
});

export const savedViewFilterSchema = z.object({
  view: z.enum(SUPPORT_INBOX_VIEWS),
  layout: z.enum(SUPPORT_INBOX_LAYOUTS),
  status: z.union([z.enum(SUPPORT_CONVERSATION_STATUSES), z.literal("all")]),
  q: z.string(),
  labelSlugs: z.array(z.string()),
  assignee: z.string(),
});

export const saveSavedViewSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  ownerAgentId: idSchema.nullable(),
  scope: z.enum(["personal", "workspace"]),
  filter: savedViewFilterSchema,
});

export const saveTeamSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  initials: z.string().min(1).max(4),
});

export const saveBusinessHoursSchema = z.object({
  id: idSchema.optional(),
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
      openTime: supportClockTimeSchema,
      closeTime: supportClockTimeSchema,
    }),
  ),
  holidays: z.array(
    z.object({
      id: idSchema,
      date: z.string().min(1),
      label: z.string().min(1),
    }),
  ),
  isDefault: z.boolean().default(false),
});

export const saveSlaPolicySchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1),
  description: z.string().nullable(),
  firstResponseMinutes: z.number().int().positive(),
  nextResponseMinutes: z.number().int().positive(),
  resolutionMinutes: z.number().int().positive(),
  businessHoursId: idSchema.nullable(),
  isDefault: z.boolean().default(false),
});

export const saveSignatureSchema = z.object({
  id: idSchema.optional(),
  ownerAgentId: idSchema.nullable(),
  name: z.string().min(1),
  bodyText: z.string().min(1),
  bodyHtml: z.string().nullable().optional(),
  isDefault: z.boolean().default(false),
});

export const automationConditionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("inbox_is"), inboxId: idSchema }),
  z.object({ kind: z.literal("label_includes"), labelId: idSchema }),
  z.object({
    kind: z.literal("from_domain_equals"),
    domain: z.string().min(1),
  }),
  z.object({ kind: z.literal("assignee_is_present"), value: z.boolean() }),
  z.object({ kind: z.literal("is_overdue"), value: z.boolean() }),
  z.object({ kind: z.literal("is_escalated"), value: z.boolean() }),
  z.object({ kind: z.literal("subject_contains"), value: z.string().min(1) }),
  z.object({ kind: z.literal("body_contains"), value: z.string().min(1) }),
]);

export const automationActionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("assign_agent"), agentId: idSchema }),
  z.object({ kind: z.literal("assign_team"), teamId: idSchema }),
  z.object({ kind: z.literal("add_label"), labelId: idSchema }),
  z.object({
    kind: z.literal("set_priority"),
    priority: z.enum(SUPPORT_PRIORITIES),
  }),
  z.object({
    kind: z.literal("set_status"),
    status: z.enum(SUPPORT_CONVERSATION_STATUSES),
  }),
  z.object({ kind: z.literal("snooze"), hours: z.number().int().positive() }),
  z.object({ kind: z.literal("mark_escalated") }),
  z.object({ kind: z.literal("run_macro"), macroId: idSchema }),
]);

export const saveAutomationRuleSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1),
  description: z.string().nullable(),
  enabled: z.boolean().default(true),
  trigger: z.enum(SUPPORT_AUTOMATION_TRIGGERS),
  conditions: z.array(automationConditionSchema),
  actions: z.array(automationActionSchema).min(1),
});

export const toggleAutomationRuleSchema = z.object({
  id: idSchema,
  enabled: z.boolean(),
});

export const saveInboxSettingsSchema = z.object({
  id: idSchema,
  inboxId: idSchema,
  defaultSignatureId: idSchema.nullable(),
  defaultSlaPolicyId: idSchema.nullable(),
  defaultBusinessHoursId: idSchema.nullable(),
  roundRobinEnabled: z.boolean(),
  autoResolveAfterDays: z.number().int().nonnegative().nullable(),
  showContactSidecar: z.boolean(),
});

export const saveNotificationPreferencesSchema = z.object({
  agentId: idSchema,
  emailMentions: z.boolean(),
  emailAssignments: z.boolean(),
  emailDailyDigest: z.boolean(),
  inAppMentions: z.boolean(),
  inAppAssignments: z.boolean(),
  inAppSlaWarnings: z.boolean(),
});

export const conversationFilterQuerySchema = z.object({
  inboxId: idSchema.nullable().optional(),
  status: z
    .union([z.enum(SUPPORT_CONVERSATION_STATUSES), z.literal("all")])
    .optional(),
  assigneeAgentId: idSchema.nullable().optional(),
  q: z.string().optional(),
  labelSlugs: z.array(z.string()).optional(),
});

void SUPPORT_AUTOMATION_ACTION_KINDS;
void SUPPORT_AUTOMATION_CONDITION_KINDS;
