import { z } from "zod";

// Shared Support Hub wire-format schemas and types. Browser collections fetch
// tenant-scoped `/api/admin/support/**` routes; Give Hope seed lives only in
// the in-memory adapter fixtures.

/* ------------------------------------------------------------------------ */
/*  Constants & enums                                                        */
/* ------------------------------------------------------------------------ */

export const SUPPORT_CONVERSATION_STATUSES = [
  "open",
  "pending",
  "snoozed",
  "resolved",
] as const;

export const SUPPORT_PRIORITIES = ["urgent", "high", "normal", "low"] as const;

export const SUPPORT_CHANNELS = ["email"] as const;

export const SUPPORT_INBOX_VIEWS = [
  "all",
  "mine",
  "unassigned",
  "past-due",
  "escalated",
] as const;

export const SUPPORT_INBOX_LAYOUTS = ["board", "table"] as const;

export const SUPPORT_INBOX_SECTIONS = ["inbox", "settings", "reports"] as const;

export const SUPPORT_LAST_MESSAGE_DIRECTIONS = ["inbound", "outbound"] as const;

export const SUPPORT_LABEL_TONES = [
  "zinc",
  "blue",
  "amber",
  "rose",
  "emerald",
  "violet",
] as const;

export const SUPPORT_MESSAGE_TYPES = ["email", "note", "system"] as const;
export const SUPPORT_MESSAGE_DIRECTIONS = ["inbound", "outbound"] as const;
export const SUPPORT_MESSAGE_DELIVERY_STATES = [
  "draft",
  "queued",
  "sending",
  "sent",
  "delivered",
  "bounced",
  "failed",
] as const;

export const SUPPORT_REPORT_SLICES = [
  "volume",
  "first-response",
  "resolution",
  "label-mix",
  "agent-mix",
  "messages-received",
  "messages-sent",
  "customer-waiting",
  "resolution-count",
  "open-count",
  "snoozed-count",
] as const;

export const SUPPORT_AUTOMATION_TRIGGERS = [
  "conversation_created",
  "message_received",
  "status_changed",
  "label_added",
  "past_due_reached",
] as const;

export const SUPPORT_AUTOMATION_CONDITION_KINDS = [
  "inbox_is",
  "label_includes",
  "from_domain_equals",
  "assignee_is_present",
  "is_overdue",
  "is_escalated",
  "subject_contains",
  "body_contains",
] as const;

export const SUPPORT_AUTOMATION_ACTION_KINDS = [
  "assign_agent",
  "assign_team",
  "add_label",
  "set_priority",
  "set_status",
  "snooze",
  "mark_escalated",
  "run_macro",
] as const;

export type SupportConversationStatus =
  (typeof SUPPORT_CONVERSATION_STATUSES)[number];
export type SupportPriority = (typeof SUPPORT_PRIORITIES)[number];
export type SupportChannel = (typeof SUPPORT_CHANNELS)[number];
export type SupportInboxView = (typeof SUPPORT_INBOX_VIEWS)[number];
export type SupportInboxLayout = (typeof SUPPORT_INBOX_LAYOUTS)[number];
export type SupportInboxSection = (typeof SUPPORT_INBOX_SECTIONS)[number];
export type SupportLastMessageDirection =
  (typeof SUPPORT_LAST_MESSAGE_DIRECTIONS)[number];
export type SupportLabelTone = (typeof SUPPORT_LABEL_TONES)[number];
export type SupportMessageType = (typeof SUPPORT_MESSAGE_TYPES)[number];
export type SupportMessageDirection =
  (typeof SUPPORT_MESSAGE_DIRECTIONS)[number];
export type SupportMessageDeliveryState =
  (typeof SUPPORT_MESSAGE_DELIVERY_STATES)[number];
export type SupportReportSlice = (typeof SUPPORT_REPORT_SLICES)[number];
export type SupportAutomationTrigger =
  (typeof SUPPORT_AUTOMATION_TRIGGERS)[number];
export type SupportAutomationConditionKind =
  (typeof SUPPORT_AUTOMATION_CONDITION_KINDS)[number];
export type SupportAutomationActionKind =
  (typeof SUPPORT_AUTOMATION_ACTION_KINDS)[number];

const isoString = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "must be an ISO date string",
  });

/* ------------------------------------------------------------------------ */
/*  Schemas                                                                  */
/* ------------------------------------------------------------------------ */

export const supportLabelSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  tone: z.enum(SUPPORT_LABEL_TONES),
  description: z.string().nullable(),
});

export const supportAssigneeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  avatarUrl: z.string().nullable(),
  title: z.string().nullable(),
});

export const supportTeamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  initials: z.string().min(1),
});

const supportContactRefSchema = z.object({
  contactId: z.string().nullable(),
  donorId: z.string().nullable(),
  giftId: z.string().nullable(),
  contributionId: z.string().nullable(),
  missionaryId: z.string().nullable(),
  crmPersonId: z.string().nullable(),
  churchId: z.string().nullable(),
});

const supportParticipantSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["agent", "team", "donor", "system"]),
  name: z.string().min(1),
  email: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});

const supportEmailHeadersSchema = z.object({
  messageId: z.string().nullable(),
  inReplyTo: z.string().nullable(),
  references: z.array(z.string()),
  subject: z.string().nullable(),
  from: z.string().min(1),
  to: z.array(z.string()),
  cc: z.array(z.string()),
  bcc: z.array(z.string()),
});

const supportMessageAttachmentSchema = z.object({
  id: z.string().min(1),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  url: z.string().nullable(),
});

const supportRichTextPayloadSchema = z.object({
  json: z.unknown().nullable(),
  html: z.string(),
  text: z.string(),
});

export const supportMessageSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  conversationId: z.string().min(1),
  type: z.enum(SUPPORT_MESSAGE_TYPES),
  direction: z.enum(SUPPORT_MESSAGE_DIRECTIONS),
  isPrivate: z.boolean(),
  deliveryState: z.enum(SUPPORT_MESSAGE_DELIVERY_STATES),
  author: supportParticipantSchema,
  body: supportRichTextPayloadSchema,
  attachments: z.array(supportMessageAttachmentSchema),
  emailHeaders: supportEmailHeadersSchema.nullable(),
  outboundSendLogId: z.string().nullable(),
  inboundEmailId: z.string().nullable(),
  /**
   * Staff-visible inbound attachment state sourced from the inbound email
   * record (pending/retrying/failed/available). Never provider internals.
   */
  inboundAttachmentStatus: z
    .enum(["none", "pending", "retrying", "failed", "available"])
    .nullable()
    .optional(),
  postedAt: isoString,
  createdAt: isoString,
  updatedAt: isoString,
});

export const supportConversationSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  inboxId: z.string().min(1),
  subject: z.string().min(1),
  status: z.enum(SUPPORT_CONVERSATION_STATUSES),
  priority: z.enum(SUPPORT_PRIORITIES),
  channel: z.enum(SUPPORT_CHANNELS),
  assignee: supportAssigneeSchema.nullable(),
  team: supportTeamSchema.nullable(),
  externalContactEmail: z.string().email(),
  externalContactName: z.string().nullable(),
  contact: supportContactRefSchema.nullable(),
  labels: z.array(supportLabelSchema),
  unreadCount: z.number().int().nonnegative(),
  messageCount: z.number().int().nonnegative(),
  firstMessageAt: isoString,
  lastMessageAt: isoString,
  lastCustomerMessageAt: isoString.nullable(),
  lastMessageDirection: z.enum(SUPPORT_LAST_MESSAGE_DIRECTIONS),
  firstRespondedAt: isoString.nullable(),
  firstResponseDueAt: isoString.nullable(),
  nextResponseDueAt: isoString.nullable(),
  resolvedAt: isoString.nullable(),
  snoozedUntil: isoString.nullable(),
  escalatedAt: isoString.nullable(),
  boardOrder: z.number().int().nonnegative(),
  slaPolicyId: z.string().nullable(),
  createdAt: isoString,
  updatedAt: isoString,
});

export const supportInboxSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  channel: z.enum(SUPPORT_CHANNELS),
  inboundAddress: z.string().email(),
  fromAddress: z.string().email(),
  fromName: z.string().min(1),
  replyToAddress: z.string().email().nullable(),
  description: z.string().nullable(),
  isDefault: z.boolean(),
  createdAt: isoString,
  updatedAt: isoString,
});

export const supportInboxSettingsSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  inboxId: z.string().min(1),
  defaultSignatureId: z.string().nullable(),
  defaultSlaPolicyId: z.string().nullable(),
  defaultBusinessHoursId: z.string().nullable(),
  roundRobinEnabled: z.boolean(),
  autoResolveAfterDays: z.number().int().nullable(),
  showContactSidecar: z.boolean(),
  createdAt: isoString,
  updatedAt: isoString,
});

const supportMacroActionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("set_status"),
    status: z.enum(SUPPORT_CONVERSATION_STATUSES),
  }),
  z.object({
    kind: z.literal("set_priority"),
    priority: z.enum(SUPPORT_PRIORITIES),
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

export const supportMacroSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  ownerAgentId: z.string().nullable(),
  name: z.string().min(1),
  description: z.string().nullable(),
  actions: z.array(supportMacroActionSchema),
  createdAt: isoString,
  updatedAt: isoString,
});

export const supportCannedResponseSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  ownerAgentId: z.string().nullable(),
  shortCode: z.string().min(1),
  title: z.string().min(1),
  bodyText: z.string().min(1),
  bodyHtml: z.string().nullable(),
  createdAt: isoString,
  updatedAt: isoString,
});

const supportSavedViewFilterSchema = z.object({
  view: z.enum(SUPPORT_INBOX_VIEWS),
  layout: z.enum(SUPPORT_INBOX_LAYOUTS),
  status: z.union([z.enum(SUPPORT_CONVERSATION_STATUSES), z.literal("all")]),
  q: z.string(),
  labelSlugs: z.array(z.string()),
  assignee: z.string(),
});

export const supportSavedViewSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  ownerAgentId: z.string().nullable(),
  name: z.string().min(1),
  slug: z.string().min(1),
  scope: z.enum(["personal", "workspace"]),
  filter: supportSavedViewFilterSchema,
  createdAt: isoString,
  updatedAt: isoString,
});

export const supportBusinessHoursSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
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
      date: isoString,
      label: z.string().min(1),
    }),
  ),
  isDefault: z.boolean(),
  createdAt: isoString,
  updatedAt: isoString,
});

export const supportSlaPolicySchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  firstResponseMinutes: z.number().int().positive(),
  nextResponseMinutes: z.number().int().positive(),
  resolutionMinutes: z.number().int().positive(),
  businessHoursId: z.string().nullable(),
  isDefault: z.boolean(),
  createdAt: isoString,
  updatedAt: isoString,
});

export const supportSignatureSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  ownerAgentId: z.string().nullable(),
  name: z.string().min(1),
  bodyText: z.string().min(1),
  bodyHtml: z.string().nullable(),
  isDefault: z.boolean(),
  createdAt: isoString,
  updatedAt: isoString,
});

const supportAutomationConditionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("inbox_is"), inboxId: z.string().min(1) }),
  z.object({ kind: z.literal("label_includes"), labelId: z.string().min(1) }),
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

const supportAutomationActionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("assign_agent"), agentId: z.string().min(1) }),
  z.object({ kind: z.literal("assign_team"), teamId: z.string().min(1) }),
  z.object({ kind: z.literal("add_label"), labelId: z.string().min(1) }),
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
  z.object({ kind: z.literal("run_macro"), macroId: z.string().min(1) }),
]);

export const supportAutomationRuleSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  enabled: z.boolean(),
  trigger: z.enum(SUPPORT_AUTOMATION_TRIGGERS),
  conditions: z.array(supportAutomationConditionSchema),
  actions: z.array(supportAutomationActionSchema).min(1),
  createdAt: isoString,
  updatedAt: isoString,
});

export const supportNotificationPreferencesSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  agentId: z.string().min(1),
  emailMentions: z.boolean(),
  emailAssignments: z.boolean(),
  emailDailyDigest: z.boolean(),
  inAppMentions: z.boolean(),
  inAppAssignments: z.boolean(),
  inAppSlaWarnings: z.boolean(),
  createdAt: isoString,
  updatedAt: isoString,
});

/* ------------------------------------------------------------------------ */
/*  Public types — derived from the schemas                                  */
/* ------------------------------------------------------------------------ */

export type SupportLabel = z.output<typeof supportLabelSchema>;
export type SupportAssignee = z.output<typeof supportAssigneeSchema>;
export type SupportTeam = z.output<typeof supportTeamSchema>;
export type SupportContactRef = z.output<typeof supportContactRefSchema>;
export type SupportParticipant = z.output<typeof supportParticipantSchema>;
export type SupportEmailHeaders = z.output<typeof supportEmailHeadersSchema>;
export type SupportMessageAttachment = z.output<
  typeof supportMessageAttachmentSchema
>;
export type SupportRichTextPayload = z.output<
  typeof supportRichTextPayloadSchema
>;
export type SupportMessage = z.output<typeof supportMessageSchema>;
export type SupportConversation = z.output<typeof supportConversationSchema>;
export type SupportInbox = z.output<typeof supportInboxSchema>;
export type SupportInboxSettings = z.output<typeof supportInboxSettingsSchema>;
export type SupportMacroAction = z.output<typeof supportMacroActionSchema>;
export type SupportMacro = z.output<typeof supportMacroSchema>;
export type SupportCannedResponse = z.output<
  typeof supportCannedResponseSchema
>;
export type SupportSavedViewFilter = z.output<
  typeof supportSavedViewFilterSchema
>;
export type SupportSavedView = z.output<typeof supportSavedViewSchema>;
export type SupportBusinessHours = z.output<typeof supportBusinessHoursSchema>;
export type SupportSlaPolicy = z.output<typeof supportSlaPolicySchema>;
export type SupportSignature = z.output<typeof supportSignatureSchema>;
export type SupportAutomationCondition = z.output<
  typeof supportAutomationConditionSchema
>;
export type SupportAutomationAction = z.output<
  typeof supportAutomationActionSchema
>;
export type SupportAutomationRule = z.output<
  typeof supportAutomationRuleSchema
>;
export type SupportNotificationPreferences = z.output<
  typeof supportNotificationPreferencesSchema
>;

export const EMPTY_SUPPORT_CONTACT_REF: SupportContactRef = {
  contactId: null,
  donorId: null,
  giftId: null,
  contributionId: null,
  missionaryId: null,
  crmPersonId: null,
  churchId: null,
};
