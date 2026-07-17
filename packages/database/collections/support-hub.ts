"use client";

import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { z } from "zod";

import { getQueryClient } from "../providers/query-client";

// Local-only transition collections for Support Hub UI modeling. The registry
// records that these should migrate to staff-scoped `support_*` tables, while
// audit, inbound email, and automation side effects stay server-command owned.
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

const supportLabelSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  tone: z.enum(SUPPORT_LABEL_TONES),
  description: z.string().nullable(),
});

const supportAssigneeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  avatarUrl: z.string().nullable(),
  title: z.string().nullable(),
});

const supportTeamSchema = z.object({
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

const supportMessageSchema = z.object({
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

const supportConversationSchema = z.object({
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

const supportInboxSchema = z.object({
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

const supportInboxSettingsSchema = z.object({
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

const supportMacroSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  ownerAgentId: z.string().nullable(),
  name: z.string().min(1),
  description: z.string().nullable(),
  actions: z.array(supportMacroActionSchema),
  createdAt: isoString,
  updatedAt: isoString,
});

const supportCannedResponseSchema = z.object({
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

const supportSavedViewSchema = z.object({
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

const supportBusinessHoursSchema = z.object({
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

const supportSlaPolicySchema = z.object({
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

const supportSignatureSchema = z.object({
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

const supportAutomationRuleSchema = z.object({
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

const supportNotificationPreferencesSchema = z.object({
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

/* ------------------------------------------------------------------------ */
/*  Donor-care mock seeds                                                    */
/* ------------------------------------------------------------------------ */

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

const TENANT_ID = "tenant-give-hope";
const INBOX_ID = "support-inbox-default";

const AGENT_IDS = {
  emily: "agent-emily-thompson",
  david: "agent-david-rodriguez",
  rachel: "agent-rachel-kim",
} as const;

const TEAM_IDS = {
  finance: "team-finance",
  technical: "team-technical",
  memberCare: "team-member-care",
} as const;

const LABEL_IDS = {
  finance: "label-finance",
  technical: "label-technical",
  memberCare: "label-member-care",
  projectGiving: "label-project-giving",
  recurring: "label-recurring",
  escalated: "label-escalated",
} as const;

const SLA_IDS = {
  standard: "sla-standard",
  urgent: "sla-urgent",
} as const;

const BIZ_HOURS_IDS = {
  standard: "biz-hours-standard",
} as const;

const CONVERSATION_IDS = {
  failedReceipt: "conv-failed-receipt",
  recurringDecline: "conv-recurring-decline",
  accountAccess: "conv-account-access",
  profileMerge: "conv-profile-merge",
  projectGiving: "conv-project-giving",
  designationMismatch: "conv-designation-mismatch",
  missionaryPage: "conv-missionary-page",
  galaFollowup: "conv-gala-followup",
  pauseFurlough: "conv-pause-furlough",
  taxStatement: "conv-tax-statement",
  receiptName: "conv-receipt-name",
  applePayDouble: "conv-applepay-double",
} as const;

const INBOX_SETTINGS_ID = "support-inbox-settings-default";

const AVATAR_BASE = "https://images.unsplash.com/photo-";

const AGENTS_SEED: SupportAssignee[] = [
  {
    id: AGENT_IDS.emily,
    name: "Emily Thompson",
    email: "admin@givehope.org",
    avatarUrl: `${AVATAR_BASE}1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=face`,
    title: "Director of Operations",
  },
  {
    id: AGENT_IDS.david,
    name: "David Rodriguez",
    email: "care@givehope.org",
    avatarUrl: `${AVATAR_BASE}1506794778202-cad84cf45f1d?w=256&h=256&fit=crop&crop=face`,
    title: "Member Care Lead",
  },
  {
    id: AGENT_IDS.rachel,
    name: "Rachel Kim",
    email: "finance@givehope.org",
    avatarUrl: `${AVATAR_BASE}1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=face`,
    title: "Finance Manager",
  },
];

const TEAMS_SEED: SupportTeam[] = [
  {
    id: TEAM_IDS.finance,
    name: "Finance",
    slug: "finance",
    description: "Receipts, refunds, recurring gift trouble.",
    initials: "FN",
  },
  {
    id: TEAM_IDS.technical,
    name: "Technical",
    slug: "technical",
    description: "Login, account, page rendering, app issues.",
    initials: "TC",
  },
  {
    id: TEAM_IDS.memberCare,
    name: "Member Care",
    slug: "member-care",
    description: "Pastoral or relational follow-up.",
    initials: "MC",
  },
];

const LABELS_SEED: SupportLabel[] = [
  {
    id: LABEL_IDS.finance,
    tenantId: TENANT_ID,
    name: "Finance",
    slug: "finance",
    tone: "amber",
    description: "Receipts, refunds, donation issues.",
  },
  {
    id: LABEL_IDS.technical,
    tenantId: TENANT_ID,
    name: "Technical",
    slug: "technical",
    tone: "blue",
    description: "Login, account, app or page issues.",
  },
  {
    id: LABEL_IDS.memberCare,
    tenantId: TENANT_ID,
    name: "Member Care",
    slug: "member-care",
    tone: "rose",
    description: "Pastoral or relational support touchpoints.",
  },
  {
    id: LABEL_IDS.projectGiving,
    tenantId: TENANT_ID,
    name: "Project Giving",
    slug: "project-giving",
    tone: "violet",
    description: "Designations, fund vs missionary questions.",
  },
  {
    id: LABEL_IDS.recurring,
    tenantId: TENANT_ID,
    name: "Recurring",
    slug: "recurring",
    tone: "emerald",
    description: "Pledges, monthly gifts, retries, pauses.",
  },
  {
    id: LABEL_IDS.escalated,
    tenantId: TENANT_ID,
    name: "Escalated",
    slug: "escalated",
    tone: "rose",
    description: "Manually escalated for senior review.",
  },
];

const NOW_SEED = "2026-04-12T09:00:00.000Z";

const MACROS_SEED: SupportMacro[] = [
  {
    id: "macro-send-receipt",
    tenantId: TENANT_ID,
    ownerAgentId: null,
    name: "Send replacement receipt",
    description:
      "Send the donor a fresh PDF receipt and resolve the conversation.",
    actions: [
      {
        kind: "send_canned_response",
        cannedResponseId: "canned-receipt-resent",
      },
      { kind: "add_label", labelId: LABEL_IDS.finance },
      { kind: "set_status", status: "resolved" },
    ],
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: "macro-retry-card",
    tenantId: TENANT_ID,
    ownerAgentId: null,
    name: "Retry recurring card",
    description:
      "Add the recurring label, ask the donor to update their card, and snooze for two days.",
    actions: [
      { kind: "add_label", labelId: LABEL_IDS.recurring },
      {
        kind: "send_canned_response",
        cannedResponseId: "canned-update-card-link",
      },
      { kind: "snooze", hours: 48 },
    ],
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: "macro-escalate-finance",
    tenantId: TENANT_ID,
    ownerAgentId: null,
    name: "Escalate to Finance team",
    description: "Hand the conversation to Finance and label as escalated.",
    actions: [
      { kind: "assign_team", teamId: TEAM_IDS.finance },
      { kind: "add_label", labelId: LABEL_IDS.escalated },
      { kind: "set_priority", priority: "high" },
    ],
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: "macro-snooze-7-days",
    tenantId: TENANT_ID,
    ownerAgentId: null,
    name: "Snooze 7 days, awaiting donor",
    description:
      "Mark the conversation pending and snooze for seven days while waiting on the donor.",
    actions: [
      { kind: "set_status", status: "pending" },
      { kind: "snooze", hours: 168 },
    ],
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
];

const CANNED_RESPONSES_SEED: SupportCannedResponse[] = [
  {
    id: "canned-thanks-looking-into-it",
    tenantId: TENANT_ID,
    ownerAgentId: null,
    shortCode: "thanks",
    title: "Thanks, looking into it",
    bodyText:
      "Thank you so much for reaching out. We are looking into this right now and will reply with an update shortly.",
    bodyHtml: null,
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: "canned-receipt-resent",
    tenantId: TENANT_ID,
    ownerAgentId: null,
    shortCode: "receipt",
    title: "Receipt re-sent",
    bodyText:
      "We just re-sent your gift receipt. Please check your inbox (and spam folder) and let us know if anything still looks off.",
    bodyHtml: null,
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: "canned-update-card-link",
    tenantId: TENANT_ID,
    ownerAgentId: null,
    shortCode: "card",
    title: "Update your card on file",
    bodyText:
      "It looks like the card on file for your recurring gift was declined. You can update it from your donor dashboard at any time, and we will retry the charge once the new card is saved.",
    bodyHtml: null,
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: "canned-resolved-thanks",
    tenantId: TENANT_ID,
    ownerAgentId: null,
    shortCode: "wrap",
    title: "Wrapping up",
    bodyText:
      "Glad we could sort that out. We are going to mark this resolved on our end. Reply any time if anything else comes up.",
    bodyHtml: null,
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
];

const SAVED_VIEWS_SEED: SupportSavedView[] = [
  {
    id: "view-mine-open",
    tenantId: TENANT_ID,
    ownerAgentId: null,
    name: "Mine - Open",
    slug: "mine-open",
    scope: "personal",
    filter: {
      view: "mine",
      layout: "table",
      status: "open",
      q: "",
      labelSlugs: [],
      assignee: "me",
    },
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: "view-unassigned-week",
    tenantId: TENANT_ID,
    ownerAgentId: null,
    name: "Unassigned this week",
    slug: "unassigned-week",
    scope: "workspace",
    filter: {
      view: "unassigned",
      layout: "board",
      status: "all",
      q: "",
      labelSlugs: [],
      assignee: "unassigned",
    },
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: "view-sla-at-risk",
    tenantId: TENANT_ID,
    ownerAgentId: null,
    name: "SLA at risk",
    slug: "sla-at-risk",
    scope: "workspace",
    filter: {
      view: "past-due",
      layout: "table",
      status: "all",
      q: "",
      labelSlugs: [LABEL_IDS.escalated],
      assignee: "",
    },
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
];

const BUSINESS_HOURS_SEED: SupportBusinessHours[] = [
  {
    id: BIZ_HOURS_IDS.standard,
    tenantId: TENANT_ID,
    name: "Standard support hours",
    timezone: "America/Denver",
    weeklySchedule: [
      { day: "monday", enabled: true, openTime: "08:30", closeTime: "17:30" },
      { day: "tuesday", enabled: true, openTime: "08:30", closeTime: "17:30" },
      {
        day: "wednesday",
        enabled: true,
        openTime: "08:30",
        closeTime: "17:30",
      },
      { day: "thursday", enabled: true, openTime: "08:30", closeTime: "17:30" },
      { day: "friday", enabled: true, openTime: "08:30", closeTime: "16:00" },
      {
        day: "saturday",
        enabled: false,
        openTime: "00:00",
        closeTime: "00:00",
      },
      { day: "sunday", enabled: false, openTime: "00:00", closeTime: "00:00" },
    ],
    holidays: [
      {
        id: "holiday-thanksgiving",
        date: "2026-11-26",
        label: "Thanksgiving",
      },
      {
        id: "holiday-christmas-eve",
        date: "2026-12-24",
        label: "Christmas Eve",
      },
      { id: "holiday-christmas", date: "2026-12-25", label: "Christmas Day" },
    ],
    isDefault: true,
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
];

const SLA_POLICIES_SEED: SupportSlaPolicy[] = [
  {
    id: SLA_IDS.standard,
    tenantId: TENANT_ID,
    name: "Standard donor support",
    description: "First reply in one business day, resolve within five.",
    firstResponseMinutes: 8 * 60,
    nextResponseMinutes: 12 * 60,
    resolutionMinutes: 5 * 24 * 60,
    businessHoursId: BIZ_HOURS_IDS.standard,
    isDefault: true,
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: SLA_IDS.urgent,
    tenantId: TENANT_ID,
    name: "Urgent escalations",
    description: "First reply in one hour, resolve within one business day.",
    firstResponseMinutes: 60,
    nextResponseMinutes: 2 * 60,
    resolutionMinutes: 24 * 60,
    businessHoursId: BIZ_HOURS_IDS.standard,
    isDefault: false,
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
];

const INBOXES_SEED: SupportInbox[] = [
  {
    id: INBOX_ID,
    tenantId: TENANT_ID,
    name: "Donor Care",
    channel: "email",
    inboundAddress: "support@givehope.org",
    fromAddress: "support@givehope.org",
    fromName: "Give Hope Donor Care",
    replyToAddress: "support@givehope.org",
    description: "Front door for every donor care email.",
    isDefault: true,
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
  },
];

const SIGNATURE_IDS = {
  emily: "sig-emily-thompson",
  david: "sig-david-rodriguez",
  rachel: "sig-rachel-kim",
} as const;

const SIGNATURES_SEED: SupportSignature[] = [
  {
    id: SIGNATURE_IDS.emily,
    tenantId: TENANT_ID,
    ownerAgentId: AGENT_IDS.emily,
    name: "Emily — Director of Operations",
    bodyText:
      "Emily Thompson\nDirector of Operations\nGive Hope · admin@givehope.org",
    bodyHtml:
      '<p>Emily Thompson<br/>Director of Operations<br/>Give Hope · <a href="mailto:admin@givehope.org">admin@givehope.org</a></p>',
    isDefault: true,
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: SIGNATURE_IDS.david,
    tenantId: TENANT_ID,
    ownerAgentId: AGENT_IDS.david,
    name: "David — Member Care",
    bodyText:
      "David Rodriguez\nMember Care Lead\nGive Hope · care@givehope.org",
    bodyHtml:
      '<p>David Rodriguez<br/>Member Care Lead<br/>Give Hope · <a href="mailto:care@givehope.org">care@givehope.org</a></p>',
    isDefault: true,
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: SIGNATURE_IDS.rachel,
    tenantId: TENANT_ID,
    ownerAgentId: AGENT_IDS.rachel,
    name: "Rachel — Finance",
    bodyText: "Rachel Kim\nFinance Manager\nGive Hope · finance@givehope.org",
    bodyHtml:
      '<p>Rachel Kim<br/>Finance Manager<br/>Give Hope · <a href="mailto:finance@givehope.org">finance@givehope.org</a></p>',
    isDefault: true,
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
];

const AUTOMATION_RULES_SEED: SupportAutomationRule[] = [
  {
    id: "automation-finance-foundations",
    tenantId: TENANT_ID,
    name: "Route foundation gifts to Finance",
    description:
      "Auto-label and assign conversations from known foundation domains to the Finance team.",
    enabled: true,
    trigger: "conversation_created",
    conditions: [{ kind: "from_domain_equals", domain: "techfoundations.org" }],
    actions: [
      { kind: "add_label", labelId: LABEL_IDS.finance },
      { kind: "assign_team", teamId: TEAM_IDS.finance },
    ],
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: "automation-snooze-marketing",
    tenantId: TENANT_ID,
    name: "Snooze marketing replies",
    description:
      "Automatically snooze conversations where the subject mentions a newsletter.",
    enabled: true,
    trigger: "message_received",
    conditions: [{ kind: "subject_contains", value: "newsletter" }],
    actions: [{ kind: "snooze", hours: 24 }],
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: "automation-escalate-urgent-gift",
    tenantId: TENANT_ID,
    name: "Escalate urgent gift issues",
    description:
      "Flag high priority and escalate conversations mentioning urgent gift issues.",
    enabled: false,
    trigger: "message_received",
    conditions: [
      { kind: "subject_contains", value: "urgent" },
      { kind: "body_contains", value: "gift" },
    ],
    actions: [
      { kind: "set_priority", priority: "high" },
      { kind: "mark_escalated" },
      { kind: "add_label", labelId: LABEL_IDS.escalated },
    ],
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
];

const NOTIFICATION_PREFERENCES_SEED: SupportNotificationPreferences[] = [
  {
    id: "notif-pref-emily",
    tenantId: TENANT_ID,
    agentId: AGENT_IDS.emily,
    emailMentions: true,
    emailAssignments: true,
    emailDailyDigest: true,
    inAppMentions: true,
    inAppAssignments: true,
    inAppSlaWarnings: true,
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: "notif-pref-david",
    tenantId: TENANT_ID,
    agentId: AGENT_IDS.david,
    emailMentions: true,
    emailAssignments: true,
    emailDailyDigest: false,
    inAppMentions: true,
    inAppAssignments: true,
    inAppSlaWarnings: true,
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
  {
    id: "notif-pref-rachel",
    tenantId: TENANT_ID,
    agentId: AGENT_IDS.rachel,
    emailMentions: true,
    emailAssignments: false,
    emailDailyDigest: true,
    inAppMentions: true,
    inAppAssignments: false,
    inAppSlaWarnings: true,
    createdAt: NOW_SEED,
    updatedAt: NOW_SEED,
  },
];

const INBOX_SETTINGS_SEED: SupportInboxSettings[] = [
  {
    id: INBOX_SETTINGS_ID,
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    defaultSignatureId: SIGNATURE_IDS.emily,
    defaultSlaPolicyId: SLA_IDS.standard,
    defaultBusinessHoursId: BIZ_HOURS_IDS.standard,
    roundRobinEnabled: false,
    autoResolveAfterDays: 14,
    showContactSidecar: true,
    createdAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
  },
];

function labelsForIds(ids: string[]): SupportLabel[] {
  const set = new Set(ids);
  return LABELS_SEED.filter((label) => set.has(label.id));
}

function contactRef(partial: Partial<SupportContactRef>): SupportContactRef {
  return { ...EMPTY_SUPPORT_CONTACT_REF, ...partial };
}

const agentEmily = AGENTS_SEED[0]!;
const agentDavid = AGENTS_SEED[1]!;
const agentRachel = AGENTS_SEED[2]!;
const teamFinance = TEAMS_SEED[0]!;
const teamTechnical = TEAMS_SEED[1]!;
const teamMemberCare = TEAMS_SEED[2]!;

const CONVERSATIONS_SEED: SupportConversation[] = [
  {
    id: CONVERSATION_IDS.failedReceipt,
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    subject: "Receipt for last week's gift never arrived",
    status: "open",
    priority: "high",
    channel: "email",
    assignee: agentRachel,
    team: teamFinance,
    externalContactEmail: "john.anderson@email.com",
    externalContactName: "John Anderson",
    contact: contactRef({
      donorId: "donor-001",
      contributionId: "don-001",
      giftId: "don-001",
    }),
    labels: labelsForIds([LABEL_IDS.finance]),
    unreadCount: 1,
    messageCount: 2,
    firstMessageAt: "2026-04-15T14:02:00.000Z",
    lastMessageAt: "2026-04-15T14:02:00.000Z",
    lastCustomerMessageAt: "2026-04-15T14:02:00.000Z",
    lastMessageDirection: "inbound",
    firstRespondedAt: null,
    firstResponseDueAt: "2026-04-16T14:02:00.000Z",
    nextResponseDueAt: "2026-04-16T14:02:00.000Z",
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 0,
    slaPolicyId: SLA_IDS.standard,
    createdAt: "2026-04-15T14:02:00.000Z",
    updatedAt: "2026-04-15T14:02:00.000Z",
  },
  {
    id: CONVERSATION_IDS.recurringDecline,
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    subject: "Monthly gift was declined this morning",
    status: "open",
    priority: "high",
    channel: "email",
    assignee: agentRachel,
    team: teamFinance,
    externalContactEmail: "alice.johnson@techfoundations.org",
    externalContactName: "Alice Johnson",
    contact: contactRef({ donorId: "donor-002" }),
    labels: labelsForIds([LABEL_IDS.finance, LABEL_IDS.recurring]),
    unreadCount: 0,
    messageCount: 3,
    firstMessageAt: "2026-04-13T11:18:00.000Z",
    lastMessageAt: "2026-04-15T08:30:00.000Z",
    lastCustomerMessageAt: "2026-04-15T08:30:00.000Z",
    lastMessageDirection: "inbound",
    firstRespondedAt: "2026-04-13T11:55:00.000Z",
    firstResponseDueAt: "2026-04-13T19:18:00.000Z",
    nextResponseDueAt: "2026-04-15T20:30:00.000Z",
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 1,
    slaPolicyId: SLA_IDS.standard,
    createdAt: "2026-04-13T11:18:00.000Z",
    updatedAt: "2026-04-15T08:30:00.000Z",
  },
  {
    id: CONVERSATION_IDS.accountAccess,
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    subject: "Login link expired before I could click it",
    status: "open",
    priority: "normal",
    channel: "email",
    assignee: null,
    team: teamTechnical,
    externalContactEmail: "sarah.connor@email.com",
    externalContactName: "Sarah Connor",
    contact: contactRef({ donorId: "donor-004" }),
    labels: labelsForIds([LABEL_IDS.technical]),
    unreadCount: 1,
    messageCount: 1,
    firstMessageAt: "2026-04-16T07:45:00.000Z",
    lastMessageAt: "2026-04-16T07:45:00.000Z",
    lastCustomerMessageAt: "2026-04-16T07:45:00.000Z",
    lastMessageDirection: "inbound",
    firstRespondedAt: null,
    firstResponseDueAt: "2026-04-16T15:45:00.000Z",
    nextResponseDueAt: "2026-04-16T15:45:00.000Z",
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 2,
    slaPolicyId: SLA_IDS.standard,
    createdAt: "2026-04-16T07:45:00.000Z",
    updatedAt: "2026-04-16T07:45:00.000Z",
  },
  {
    id: CONVERSATION_IDS.profileMerge,
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    subject: "I think I have two donor profiles",
    status: "pending",
    priority: "normal",
    channel: "email",
    assignee: agentEmily,
    team: teamMemberCare,
    externalContactEmail: "mike.wilson@email.com",
    externalContactName: "Mike Wilson",
    contact: contactRef({ donorId: "donor-005" }),
    labels: labelsForIds([LABEL_IDS.memberCare]),
    unreadCount: 0,
    messageCount: 4,
    firstMessageAt: "2026-04-10T09:30:00.000Z",
    lastMessageAt: "2026-04-14T16:11:00.000Z",
    lastCustomerMessageAt: "2026-04-12T15:08:00.000Z",
    lastMessageDirection: "outbound",
    firstRespondedAt: "2026-04-10T11:00:00.000Z",
    firstResponseDueAt: "2026-04-10T17:30:00.000Z",
    nextResponseDueAt: null,
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 0,
    slaPolicyId: SLA_IDS.standard,
    createdAt: "2026-04-10T09:30:00.000Z",
    updatedAt: "2026-04-14T16:11:00.000Z",
  },
  {
    id: CONVERSATION_IDS.projectGiving,
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    subject: "Difference between giving to a project vs a missionary?",
    status: "open",
    priority: "low",
    channel: "email",
    assignee: agentDavid,
    team: teamMemberCare,
    externalContactEmail: "jennifer.davis@email.com",
    externalContactName: "Jennifer Davis",
    contact: contactRef({ donorId: "donor-006" }),
    labels: labelsForIds([LABEL_IDS.projectGiving]),
    unreadCount: 0,
    messageCount: 2,
    firstMessageAt: "2026-04-12T10:00:00.000Z",
    lastMessageAt: "2026-04-12T11:24:00.000Z",
    lastCustomerMessageAt: "2026-04-12T10:00:00.000Z",
    lastMessageDirection: "outbound",
    firstRespondedAt: "2026-04-12T11:24:00.000Z",
    firstResponseDueAt: "2026-04-12T18:00:00.000Z",
    nextResponseDueAt: null,
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 3,
    slaPolicyId: SLA_IDS.standard,
    createdAt: "2026-04-12T10:00:00.000Z",
    updatedAt: "2026-04-12T11:24:00.000Z",
  },
  {
    id: CONVERSATION_IDS.designationMismatch,
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    subject: "Receipt shows the wrong missionary",
    status: "open",
    priority: "urgent",
    channel: "email",
    assignee: agentRachel,
    team: teamFinance,
    externalContactEmail: "bob.smith@globalventures.com",
    externalContactName: "Bob Smith",
    contact: contactRef({
      donorId: "donor-003",
      missionaryId: "miss-001",
      contributionId: "don-002",
    }),
    labels: labelsForIds([LABEL_IDS.finance, LABEL_IDS.escalated]),
    unreadCount: 0,
    messageCount: 3,
    firstMessageAt: "2026-04-14T08:00:00.000Z",
    lastMessageAt: "2026-04-15T10:42:00.000Z",
    lastCustomerMessageAt: "2026-04-15T10:42:00.000Z",
    lastMessageDirection: "inbound",
    firstRespondedAt: "2026-04-14T09:30:00.000Z",
    firstResponseDueAt: "2026-04-14T09:00:00.000Z",
    nextResponseDueAt: "2026-04-15T22:42:00.000Z",
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: "2026-04-15T10:50:00.000Z",
    boardOrder: 4,
    slaPolicyId: SLA_IDS.urgent,
    createdAt: "2026-04-14T08:00:00.000Z",
    updatedAt: "2026-04-15T10:50:00.000Z",
  },
  {
    id: CONVERSATION_IDS.missionaryPage,
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    subject: "Video on Miller family page won't play",
    status: "open",
    priority: "normal",
    channel: "email",
    assignee: null,
    team: teamTechnical,
    externalContactEmail: "robert.martinez@email.com",
    externalContactName: "Robert Martinez",
    contact: contactRef({
      donorId: "donor-008",
      missionaryId: "miss-001",
    }),
    labels: labelsForIds([LABEL_IDS.technical]),
    unreadCount: 1,
    messageCount: 1,
    firstMessageAt: "2026-04-15T19:12:00.000Z",
    lastMessageAt: "2026-04-15T19:12:00.000Z",
    lastCustomerMessageAt: "2026-04-15T19:12:00.000Z",
    lastMessageDirection: "inbound",
    firstRespondedAt: null,
    firstResponseDueAt: "2026-04-16T03:12:00.000Z",
    nextResponseDueAt: "2026-04-16T03:12:00.000Z",
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 5,
    slaPolicyId: SLA_IDS.standard,
    createdAt: "2026-04-15T19:12:00.000Z",
    updatedAt: "2026-04-15T19:12:00.000Z",
  },
  {
    id: CONVERSATION_IDS.galaFollowup,
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    subject: "Pledge from the spring gala — confirmation?",
    status: "pending",
    priority: "normal",
    channel: "email",
    assignee: agentEmily,
    team: teamFinance,
    externalContactEmail: "grace.community@church.org",
    externalContactName: "Grace Community Church",
    contact: contactRef({
      donorId: "donor-007",
      churchId: "church-grace-community",
    }),
    labels: labelsForIds([LABEL_IDS.finance]),
    unreadCount: 0,
    messageCount: 4,
    firstMessageAt: "2026-04-08T16:00:00.000Z",
    lastMessageAt: "2026-04-14T13:22:00.000Z",
    lastCustomerMessageAt: "2026-04-12T11:00:00.000Z",
    lastMessageDirection: "outbound",
    firstRespondedAt: "2026-04-08T17:30:00.000Z",
    firstResponseDueAt: "2026-04-09T00:00:00.000Z",
    nextResponseDueAt: null,
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 1,
    slaPolicyId: SLA_IDS.standard,
    createdAt: "2026-04-08T16:00:00.000Z",
    updatedAt: "2026-04-14T13:22:00.000Z",
  },
  {
    id: CONVERSATION_IDS.pauseFurlough,
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    subject: "Need to pause my recurring gift for our furlough",
    status: "snoozed",
    priority: "normal",
    channel: "email",
    assignee: agentDavid,
    team: teamMemberCare,
    externalContactEmail: "alice.johnson@techfoundations.org",
    externalContactName: "Alice Johnson",
    contact: contactRef({ donorId: "donor-002" }),
    labels: labelsForIds([LABEL_IDS.recurring, LABEL_IDS.memberCare]),
    unreadCount: 0,
    messageCount: 2,
    firstMessageAt: "2026-04-09T09:00:00.000Z",
    lastMessageAt: "2026-04-09T10:25:00.000Z",
    lastCustomerMessageAt: "2026-04-09T09:00:00.000Z",
    lastMessageDirection: "outbound",
    firstRespondedAt: "2026-04-09T10:25:00.000Z",
    firstResponseDueAt: "2026-04-09T17:00:00.000Z",
    nextResponseDueAt: null,
    resolvedAt: null,
    snoozedUntil: "2026-04-22T09:00:00.000Z",
    escalatedAt: null,
    boardOrder: 0,
    slaPolicyId: SLA_IDS.standard,
    createdAt: "2026-04-09T09:00:00.000Z",
    updatedAt: "2026-04-09T10:25:00.000Z",
  },
  {
    id: CONVERSATION_IDS.taxStatement,
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    subject: "Year-end statement is missing my November gift",
    status: "open",
    priority: "high",
    channel: "email",
    assignee: agentRachel,
    team: teamFinance,
    externalContactEmail: "john.anderson@email.com",
    externalContactName: "John Anderson",
    contact: contactRef({ donorId: "donor-001" }),
    labels: labelsForIds([LABEL_IDS.finance]),
    unreadCount: 0,
    messageCount: 2,
    firstMessageAt: "2026-04-11T14:30:00.000Z",
    lastMessageAt: "2026-04-11T16:02:00.000Z",
    lastCustomerMessageAt: "2026-04-11T14:30:00.000Z",
    lastMessageDirection: "outbound",
    firstRespondedAt: "2026-04-11T16:02:00.000Z",
    firstResponseDueAt: "2026-04-12T08:30:00.000Z",
    nextResponseDueAt: null,
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 6,
    slaPolicyId: SLA_IDS.standard,
    createdAt: "2026-04-11T14:30:00.000Z",
    updatedAt: "2026-04-11T16:02:00.000Z",
  },
  {
    id: CONVERSATION_IDS.receiptName,
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    subject: "Please put both spouses on the receipt",
    status: "resolved",
    priority: "low",
    channel: "email",
    assignee: agentRachel,
    team: teamFinance,
    externalContactEmail: "michael.chen@givehope.org",
    externalContactName: "Michael Chen",
    contact: contactRef({ donorId: "donor-002" }),
    labels: labelsForIds([LABEL_IDS.finance]),
    unreadCount: 0,
    messageCount: 4,
    firstMessageAt: "2026-04-05T11:30:00.000Z",
    lastMessageAt: "2026-04-06T09:30:00.000Z",
    lastCustomerMessageAt: "2026-04-06T08:00:00.000Z",
    lastMessageDirection: "outbound",
    firstRespondedAt: "2026-04-05T13:10:00.000Z",
    firstResponseDueAt: "2026-04-05T19:30:00.000Z",
    nextResponseDueAt: null,
    resolvedAt: "2026-04-06T09:30:00.000Z",
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 0,
    slaPolicyId: SLA_IDS.standard,
    createdAt: "2026-04-05T11:30:00.000Z",
    updatedAt: "2026-04-06T09:30:00.000Z",
  },
  {
    id: CONVERSATION_IDS.applePayDouble,
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    subject: "Apple Pay charged me twice for the same gift",
    status: "open",
    priority: "urgent",
    channel: "email",
    assignee: null,
    team: teamFinance,
    externalContactEmail: "olivia.martin@givehope.org",
    externalContactName: "Olivia Martin",
    contact: contactRef({ donorId: "donor-003" }),
    labels: labelsForIds([LABEL_IDS.finance, LABEL_IDS.escalated]),
    unreadCount: 1,
    messageCount: 1,
    firstMessageAt: "2026-04-15T22:18:00.000Z",
    lastMessageAt: "2026-04-15T22:18:00.000Z",
    lastCustomerMessageAt: "2026-04-15T22:18:00.000Z",
    lastMessageDirection: "inbound",
    firstRespondedAt: null,
    firstResponseDueAt: "2026-04-15T23:18:00.000Z",
    nextResponseDueAt: "2026-04-15T23:18:00.000Z",
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: "2026-04-15T22:30:00.000Z",
    boardOrder: 7,
    slaPolicyId: SLA_IDS.urgent,
    createdAt: "2026-04-15T22:18:00.000Z",
    updatedAt: "2026-04-15T22:30:00.000Z",
  },
];

const SYSTEM_PARTICIPANT: SupportParticipant = {
  id: "system",
  role: "system",
  name: "Mission Control",
  email: null,
  avatarUrl: null,
};

function donor(
  email: string,
  name: string,
  donorId: string,
): SupportParticipant {
  return {
    id: `donor:${donorId}`,
    role: "donor",
    name,
    email,
    avatarUrl: null,
  };
}

function agentParticipant(agent: SupportAssignee): SupportParticipant {
  return {
    id: agent.id,
    role: "agent",
    name: agent.name,
    email: agent.email,
    avatarUrl: agent.avatarUrl,
  };
}

interface MessageSeedInput {
  id: string;
  conversationId: string;
  type: SupportMessageType;
  direction: SupportMessageDirection;
  isPrivate?: boolean;
  deliveryState?: SupportMessageDeliveryState;
  author: SupportParticipant;
  text: string;
  html?: string;
  postedAt: string;
  emailHeaders?: SupportEmailHeaders | null;
}

function makeMessage(input: MessageSeedInput): SupportMessage {
  const html = input.html ?? `<p>${input.text}</p>`;
  return {
    id: input.id,
    tenantId: TENANT_ID,
    conversationId: input.conversationId,
    type: input.type,
    direction: input.direction,
    isPrivate: input.isPrivate ?? input.type === "note",
    deliveryState: input.deliveryState ?? "delivered",
    author: input.author,
    body: { json: null, html, text: input.text },
    attachments: [],
    emailHeaders: input.emailHeaders ?? null,
    outboundSendLogId:
      input.direction === "outbound" && input.type === "email"
        ? `send-log-${input.id}`
        : null,
    inboundEmailId:
      input.direction === "inbound" && input.type === "email"
        ? `inbound-${input.id}`
        : null,
    postedAt: input.postedAt,
    createdAt: input.postedAt,
    updatedAt: input.postedAt,
  };
}

function inboundHeaders(
  conversationId: string,
  fromEmail: string,
  inReplyTo: string | null,
  subject: string,
): SupportEmailHeaders {
  return {
    messageId: `<msg.${conversationId}.${fromEmail}@givehope.org>`,
    inReplyTo,
    references: inReplyTo ? [inReplyTo] : [],
    subject,
    from: fromEmail,
    to: ["support@givehope.org"],
    cc: [],
    bcc: [],
  };
}

function outboundHeaders(
  conversationId: string,
  toEmail: string,
  inReplyTo: string | null,
  subject: string,
): SupportEmailHeaders {
  return {
    messageId: `<reply.${conversationId}.${toEmail}@givehope.org>`,
    inReplyTo,
    references: inReplyTo ? [inReplyTo] : [],
    subject,
    from: "support@givehope.org",
    to: [toEmail],
    cc: [],
    bcc: [],
  };
}

const C = CONVERSATION_IDS;

const MESSAGES_SEED: SupportMessage[] = [
  makeMessage({
    id: "msg-failed-receipt-1",
    conversationId: C.failedReceipt,
    type: "email",
    direction: "inbound",
    author: donor("john.anderson@email.com", "John Anderson", "donor-001"),
    text: "Hi team, I gave on April 8 but never received a receipt. Could you re-send it? Thanks, John.",
    postedAt: "2026-04-15T14:02:00.000Z",
    emailHeaders: inboundHeaders(
      C.failedReceipt,
      "john.anderson@email.com",
      null,
      "Receipt for last week's gift never arrived",
    ),
  }),
  makeMessage({
    id: "msg-failed-receipt-note-1",
    conversationId: C.failedReceipt,
    type: "note",
    direction: "outbound",
    author: agentParticipant(agentRachel),
    text: "Pulling the receipt from Stripe now — donation don-001.",
    postedAt: "2026-04-15T14:18:00.000Z",
  }),

  makeMessage({
    id: "msg-recurring-decline-1",
    conversationId: C.recurringDecline,
    type: "email",
    direction: "inbound",
    author: donor(
      "alice.johnson@techfoundations.org",
      "Alice Johnson",
      "donor-002",
    ),
    text: "Got an email saying my monthly gift didn't go through. What happened?",
    postedAt: "2026-04-13T11:18:00.000Z",
    emailHeaders: inboundHeaders(
      C.recurringDecline,
      "alice.johnson@techfoundations.org",
      null,
      "Monthly gift was declined this morning",
    ),
  }),
  makeMessage({
    id: "msg-recurring-decline-2",
    conversationId: C.recurringDecline,
    type: "email",
    direction: "outbound",
    author: agentParticipant(agentRachel),
    text: "Hi Alice — your card on file was declined by the bank. You can update it from your donor dashboard and we'll retry the charge automatically.",
    postedAt: "2026-04-13T11:55:00.000Z",
    emailHeaders: outboundHeaders(
      C.recurringDecline,
      "alice.johnson@techfoundations.org",
      `<msg.${C.recurringDecline}.in.1@givehope.org>`,
      "Re: Monthly gift was declined this morning",
    ),
  }),
  makeMessage({
    id: "msg-recurring-decline-3",
    conversationId: C.recurringDecline,
    type: "email",
    direction: "inbound",
    author: donor(
      "alice.johnson@techfoundations.org",
      "Alice Johnson",
      "donor-002",
    ),
    text: "Updated the card. Can you confirm the next attempt went through?",
    postedAt: "2026-04-15T08:30:00.000Z",
    emailHeaders: inboundHeaders(
      C.recurringDecline,
      "alice.johnson@techfoundations.org",
      `<reply.${C.recurringDecline}.out.1@givehope.org>`,
      "Re: Monthly gift was declined this morning",
    ),
  }),

  makeMessage({
    id: "msg-account-access-1",
    conversationId: C.accountAccess,
    type: "email",
    direction: "inbound",
    author: donor("sarah.connor@email.com", "Sarah Connor", "donor-004"),
    text: "I clicked the magic-link login but it said the link had expired. Could you send a fresh one?",
    postedAt: "2026-04-16T07:45:00.000Z",
    emailHeaders: inboundHeaders(
      C.accountAccess,
      "sarah.connor@email.com",
      null,
      "Login link expired before I could click it",
    ),
  }),

  makeMessage({
    id: "msg-profile-merge-1",
    conversationId: C.profileMerge,
    type: "email",
    direction: "inbound",
    author: donor("mike.wilson@email.com", "Mike Wilson", "donor-005"),
    text: "I think I have two donor accounts, one with my old work email. Can you merge them?",
    postedAt: "2026-04-10T09:30:00.000Z",
    emailHeaders: inboundHeaders(
      C.profileMerge,
      "mike.wilson@email.com",
      null,
      "I think I have two donor profiles",
    ),
  }),
  makeMessage({
    id: "msg-profile-merge-2",
    conversationId: C.profileMerge,
    type: "email",
    direction: "outbound",
    author: agentParticipant(agentEmily),
    text: "Happy to help, Mike. Could you share both email addresses so I can confirm the right profiles before merging?",
    postedAt: "2026-04-10T11:00:00.000Z",
    emailHeaders: outboundHeaders(
      C.profileMerge,
      "mike.wilson@email.com",
      `<msg.${C.profileMerge}.in.1@givehope.org>`,
      "Re: I think I have two donor profiles",
    ),
  }),
  makeMessage({
    id: "msg-profile-merge-3",
    conversationId: C.profileMerge,
    type: "email",
    direction: "inbound",
    author: donor("mike.wilson@email.com", "Mike Wilson", "donor-005"),
    text: "mike.wilson@email.com (current) and mwilson@oldcompany.com (old). Thanks!",
    postedAt: "2026-04-12T15:08:00.000Z",
    emailHeaders: inboundHeaders(
      C.profileMerge,
      "mike.wilson@email.com",
      `<reply.${C.profileMerge}.out.1@givehope.org>`,
      "Re: I think I have two donor profiles",
    ),
  }),
  makeMessage({
    id: "msg-profile-merge-4",
    conversationId: C.profileMerge,
    type: "email",
    direction: "outbound",
    author: agentParticipant(agentEmily),
    text: "Got it, looking now and will follow up by Friday with the merged history.",
    postedAt: "2026-04-14T16:11:00.000Z",
    emailHeaders: outboundHeaders(
      C.profileMerge,
      "mike.wilson@email.com",
      `<msg.${C.profileMerge}.in.2@givehope.org>`,
      "Re: I think I have two donor profiles",
    ),
  }),

  makeMessage({
    id: "msg-project-giving-1",
    conversationId: C.projectGiving,
    type: "email",
    direction: "inbound",
    author: donor("jennifer.davis@email.com", "Jennifer Davis", "donor-006"),
    text: "Quick question — what's the difference between giving to the Clean Water project versus a specific missionary?",
    postedAt: "2026-04-12T10:00:00.000Z",
    emailHeaders: inboundHeaders(
      C.projectGiving,
      "jennifer.davis@email.com",
      null,
      "Difference between giving to a project vs a missionary?",
    ),
  }),
  makeMessage({
    id: "msg-project-giving-2",
    conversationId: C.projectGiving,
    type: "email",
    direction: "outbound",
    author: agentParticipant(agentDavid),
    text: "Great question, Jennifer. Project gifts go to the entire initiative regardless of which missionary leads it; missionary gifts go to that worker's personal support budget. Both are tax-deductible.",
    postedAt: "2026-04-12T11:24:00.000Z",
    emailHeaders: outboundHeaders(
      C.projectGiving,
      "jennifer.davis@email.com",
      `<msg.${C.projectGiving}.in.1@givehope.org>`,
      "Re: Difference between giving to a project vs a missionary?",
    ),
  }),

  makeMessage({
    id: "msg-designation-mismatch-1",
    conversationId: C.designationMismatch,
    type: "email",
    direction: "inbound",
    author: donor("bob.smith@globalventures.com", "Bob Smith", "donor-003"),
    text: "My receipt for don-002 lists the wrong missionary. The gift was for the Miller family, not the Patel family.",
    postedAt: "2026-04-14T08:00:00.000Z",
    emailHeaders: inboundHeaders(
      C.designationMismatch,
      "bob.smith@globalventures.com",
      null,
      "Receipt shows the wrong missionary",
    ),
  }),
  makeMessage({
    id: "msg-designation-mismatch-2",
    conversationId: C.designationMismatch,
    type: "email",
    direction: "outbound",
    author: agentParticipant(agentRachel),
    text: "Apologies, Bob — looking into the routing on that gift right now. I'll come back within the hour with a corrected receipt.",
    postedAt: "2026-04-14T09:30:00.000Z",
    emailHeaders: outboundHeaders(
      C.designationMismatch,
      "bob.smith@globalventures.com",
      `<msg.${C.designationMismatch}.in.1@givehope.org>`,
      "Re: Receipt shows the wrong missionary",
    ),
  }),
  makeMessage({
    id: "msg-designation-mismatch-3",
    conversationId: C.designationMismatch,
    type: "email",
    direction: "inbound",
    author: donor("bob.smith@globalventures.com", "Bob Smith", "donor-003"),
    text: "Thanks but it has been over 24 hours and I haven't received the corrected receipt yet. Please escalate.",
    postedAt: "2026-04-15T10:42:00.000Z",
    emailHeaders: inboundHeaders(
      C.designationMismatch,
      "bob.smith@globalventures.com",
      `<reply.${C.designationMismatch}.out.1@givehope.org>`,
      "Re: Receipt shows the wrong missionary",
    ),
  }),
  makeMessage({
    id: "msg-designation-mismatch-note-1",
    conversationId: C.designationMismatch,
    type: "note",
    direction: "outbound",
    author: agentParticipant(agentRachel),
    text: "Escalating to me + Emily for review. Receipt template flagged.",
    postedAt: "2026-04-15T10:50:00.000Z",
  }),

  makeMessage({
    id: "msg-missionary-page-1",
    conversationId: C.missionaryPage,
    type: "email",
    direction: "inbound",
    author: donor("robert.martinez@email.com", "Robert Martinez", "donor-008"),
    text: "Tried watching the latest video update on the Miller family's page and it just shows a black box.",
    postedAt: "2026-04-15T19:12:00.000Z",
    emailHeaders: inboundHeaders(
      C.missionaryPage,
      "robert.martinez@email.com",
      null,
      "Video on Miller family page won't play",
    ),
  }),

  makeMessage({
    id: "msg-gala-followup-1",
    conversationId: C.galaFollowup,
    type: "email",
    direction: "inbound",
    author: donor(
      "grace.community@church.org",
      "Grace Community Church",
      "donor-007",
    ),
    text: "Following up on the pledge we made at the spring gala. Could you confirm the amount on file and the project we asked it to support?",
    postedAt: "2026-04-08T16:00:00.000Z",
    emailHeaders: inboundHeaders(
      C.galaFollowup,
      "grace.community@church.org",
      null,
      "Pledge from the spring gala — confirmation?",
    ),
  }),
  makeMessage({
    id: "msg-gala-followup-2",
    conversationId: C.galaFollowup,
    type: "email",
    direction: "outbound",
    author: agentParticipant(agentEmily),
    text: "Thanks for following up. Pulling the gala records now and will reply by tomorrow.",
    postedAt: "2026-04-08T17:30:00.000Z",
    emailHeaders: outboundHeaders(
      C.galaFollowup,
      "grace.community@church.org",
      `<msg.${C.galaFollowup}.in.1@givehope.org>`,
      "Re: Pledge from the spring gala — confirmation?",
    ),
  }),
  makeMessage({
    id: "msg-gala-followup-3",
    conversationId: C.galaFollowup,
    type: "email",
    direction: "inbound",
    author: donor(
      "grace.community@church.org",
      "Grace Community Church",
      "donor-007",
    ),
    text: "Any update on this? Our finance team is asking.",
    postedAt: "2026-04-12T11:00:00.000Z",
    emailHeaders: inboundHeaders(
      C.galaFollowup,
      "grace.community@church.org",
      `<reply.${C.galaFollowup}.out.1@givehope.org>`,
      "Re: Pledge from the spring gala — confirmation?",
    ),
  }),
  makeMessage({
    id: "msg-gala-followup-4",
    conversationId: C.galaFollowup,
    type: "email",
    direction: "outbound",
    author: agentParticipant(agentEmily),
    text: "Confirmed — pledge of $5,000 designated for the Clean Water project. Sending the formal letter today.",
    postedAt: "2026-04-14T13:22:00.000Z",
    emailHeaders: outboundHeaders(
      C.galaFollowup,
      "grace.community@church.org",
      `<msg.${C.galaFollowup}.in.2@givehope.org>`,
      "Re: Pledge from the spring gala — confirmation?",
    ),
  }),

  makeMessage({
    id: "msg-pause-furlough-1",
    conversationId: C.pauseFurlough,
    type: "email",
    direction: "inbound",
    author: donor(
      "alice.johnson@techfoundations.org",
      "Alice Johnson",
      "donor-002",
    ),
    text: "Hi team — we're heading on furlough next month and need to pause our recurring gift for 60 days. How do we set that up?",
    postedAt: "2026-04-09T09:00:00.000Z",
    emailHeaders: inboundHeaders(
      C.pauseFurlough,
      "alice.johnson@techfoundations.org",
      null,
      "Need to pause my recurring gift for our furlough",
    ),
  }),
  makeMessage({
    id: "msg-pause-furlough-2",
    conversationId: C.pauseFurlough,
    type: "email",
    direction: "outbound",
    author: agentParticipant(agentDavid),
    text: "Thanks for the heads-up. I've paused the gift through the end of June. We'll resume automatically unless you tell us otherwise.",
    postedAt: "2026-04-09T10:25:00.000Z",
    emailHeaders: outboundHeaders(
      C.pauseFurlough,
      "alice.johnson@techfoundations.org",
      `<msg.${C.pauseFurlough}.in.1@givehope.org>`,
      "Re: Need to pause my recurring gift for our furlough",
    ),
  }),

  makeMessage({
    id: "msg-tax-statement-1",
    conversationId: C.taxStatement,
    type: "email",
    direction: "inbound",
    author: donor("john.anderson@email.com", "John Anderson", "donor-001"),
    text: "My year-end giving statement is missing the November 12 gift. Could you re-issue it?",
    postedAt: "2026-04-11T14:30:00.000Z",
    emailHeaders: inboundHeaders(
      C.taxStatement,
      "john.anderson@email.com",
      null,
      "Year-end statement is missing my November gift",
    ),
  }),
  makeMessage({
    id: "msg-tax-statement-2",
    conversationId: C.taxStatement,
    type: "email",
    direction: "outbound",
    author: agentParticipant(agentRachel),
    text: "Confirmed the missing gift in our system. Re-issuing the statement now and will email it to you by end of day.",
    postedAt: "2026-04-11T16:02:00.000Z",
    emailHeaders: outboundHeaders(
      C.taxStatement,
      "john.anderson@email.com",
      `<msg.${C.taxStatement}.in.1@givehope.org>`,
      "Re: Year-end statement is missing my November gift",
    ),
  }),

  makeMessage({
    id: "msg-receipt-name-1",
    conversationId: C.receiptName,
    type: "email",
    direction: "inbound",
    author: donor("michael.chen@givehope.org", "Michael Chen", "donor-002"),
    text: "Could you change the receipt to list both me and my spouse? It currently only has my name.",
    postedAt: "2026-04-05T11:30:00.000Z",
    emailHeaders: inboundHeaders(
      C.receiptName,
      "michael.chen@givehope.org",
      null,
      "Please put both spouses on the receipt",
    ),
  }),
  makeMessage({
    id: "msg-receipt-name-2",
    conversationId: C.receiptName,
    type: "email",
    direction: "outbound",
    author: agentParticipant(agentRachel),
    text: "Of course — could you confirm your spouse's full legal name as it should appear on the receipt?",
    postedAt: "2026-04-05T13:10:00.000Z",
    emailHeaders: outboundHeaders(
      C.receiptName,
      "michael.chen@givehope.org",
      `<msg.${C.receiptName}.in.1@givehope.org>`,
      "Re: Please put both spouses on the receipt",
    ),
  }),
  makeMessage({
    id: "msg-receipt-name-3",
    conversationId: C.receiptName,
    type: "email",
    direction: "inbound",
    author: donor("michael.chen@givehope.org", "Michael Chen", "donor-002"),
    text: "Sarah Chen.",
    postedAt: "2026-04-06T08:00:00.000Z",
    emailHeaders: inboundHeaders(
      C.receiptName,
      "michael.chen@givehope.org",
      `<reply.${C.receiptName}.out.1@givehope.org>`,
      "Re: Please put both spouses on the receipt",
    ),
  }),
  makeMessage({
    id: "msg-receipt-name-4",
    conversationId: C.receiptName,
    type: "system",
    direction: "outbound",
    author: SYSTEM_PARTICIPANT,
    text: "Conversation resolved by Rachel Kim.",
    postedAt: "2026-04-06T09:30:00.000Z",
  }),

  makeMessage({
    id: "msg-applepay-double-1",
    conversationId: C.applePayDouble,
    type: "email",
    direction: "inbound",
    author: donor("olivia.martin@givehope.org", "Olivia Martin", "donor-003"),
    text: "Just made a $250 gift through Apple Pay and I see two pending charges on my card. Please help.",
    postedAt: "2026-04-15T22:18:00.000Z",
    emailHeaders: inboundHeaders(
      C.applePayDouble,
      "olivia.martin@givehope.org",
      null,
      "Apple Pay charged me twice for the same gift",
    ),
  }),
  makeMessage({
    id: "msg-applepay-double-note-1",
    conversationId: C.applePayDouble,
    type: "note",
    direction: "outbound",
    author: agentParticipant(agentEmily),
    text: "Escalated and pinging Stripe — looks like a duplicate intent on the wallet flow. Will retry in 15 min.",
    postedAt: "2026-04-15T22:30:00.000Z",
  }),
];

/* ------------------------------------------------------------------------ */
/*  Mutable in-memory rows                                                   */
/* ------------------------------------------------------------------------ */

let conversationRows = cloneValue(CONVERSATIONS_SEED);
let messageRows = cloneValue(MESSAGES_SEED);
let labelRows = cloneValue(LABELS_SEED);
let macroRows = cloneValue(MACROS_SEED);
let cannedResponseRows = cloneValue(CANNED_RESPONSES_SEED);
let savedViewRows = cloneValue(SAVED_VIEWS_SEED);
let inboxRows = cloneValue(INBOXES_SEED);
let inboxSettingsRows = cloneValue(INBOX_SETTINGS_SEED);
let teamRows = cloneValue(TEAMS_SEED);
let agentRows = cloneValue(AGENTS_SEED);
let businessHoursRows = cloneValue(BUSINESS_HOURS_SEED);
let slaPolicyRows = cloneValue(SLA_POLICIES_SEED);
let signatureRows = cloneValue(SIGNATURES_SEED);
let automationRuleRows = cloneValue(AUTOMATION_RULES_SEED);
let notificationPreferenceRows = cloneValue(NOTIFICATION_PREFERENCES_SEED);

interface SeedMutationContext<TItem> {
  transaction: { mutations: { key?: unknown; modified: TItem }[] };
}

interface SeedDeleteContext {
  transaction: { mutations: { key?: unknown }[] };
}

function buildWriters<TItem extends { id: string }>(
  getRows: () => TItem[],
  setRows: (rows: TItem[]) => void,
) {
  return {
    onInsert: async ({ transaction }: SeedMutationContext<TItem>) => {
      const next = [
        ...getRows(),
        ...transaction.mutations.map((mutation) =>
          cloneValue(mutation.modified),
        ),
      ];
      setRows(next);
    },
    onUpdate: async ({ transaction }: SeedMutationContext<TItem>) => {
      const next = getRows().map((row) => {
        const mutation = transaction.mutations.find(
          (entry) => entry.key === row.id,
        );
        return mutation ? cloneValue(mutation.modified) : row;
      });
      setRows(next);
    },
    onDelete: async ({ transaction }: SeedDeleteContext) => {
      const idsToDelete = new Set(
        transaction.mutations.map((mutation) => mutation.key as string),
      );
      const next = getRows().filter((row) => !idsToDelete.has(row.id));
      setRows(next);
    },
  };
}

/* ------------------------------------------------------------------------ */
/*  Collections                                                              */
/* ------------------------------------------------------------------------ */

export const supportConversationsCollection = createCollection(
  queryCollectionOptions({
    id: "support_conversations",
    queryKey: ["admin", "support", "conversations"],
    queryClient: getQueryClient(),
    schema: supportConversationSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(conversationRows),
    ...buildWriters(
      () => conversationRows,
      (rows) => {
        conversationRows = rows;
      },
    ),
  }),
);

export const supportMessagesCollection = createCollection(
  queryCollectionOptions({
    id: "support_messages",
    queryKey: ["admin", "support", "messages"],
    queryClient: getQueryClient(),
    schema: supportMessageSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(messageRows),
    ...buildWriters(
      () => messageRows,
      (rows) => {
        messageRows = rows;
      },
    ),
  }),
);

export const supportLabelsCollection = createCollection(
  queryCollectionOptions({
    id: "support_labels",
    queryKey: ["admin", "support", "labels"],
    queryClient: getQueryClient(),
    schema: supportLabelSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(labelRows),
    ...buildWriters(
      () => labelRows,
      (rows) => {
        labelRows = rows;
      },
    ),
  }),
);

export const supportMacrosCollection = createCollection(
  queryCollectionOptions({
    id: "support_macros",
    queryKey: ["admin", "support", "macros"],
    queryClient: getQueryClient(),
    schema: supportMacroSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(macroRows),
    ...buildWriters(
      () => macroRows,
      (rows) => {
        macroRows = rows;
      },
    ),
  }),
);

export const supportCannedResponsesCollection = createCollection(
  queryCollectionOptions({
    id: "support_canned_responses",
    queryKey: ["admin", "support", "canned-responses"],
    queryClient: getQueryClient(),
    schema: supportCannedResponseSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(cannedResponseRows),
    ...buildWriters(
      () => cannedResponseRows,
      (rows) => {
        cannedResponseRows = rows;
      },
    ),
  }),
);

export const supportSavedViewsCollection = createCollection(
  queryCollectionOptions({
    id: "support_saved_views",
    queryKey: ["admin", "support", "saved-views"],
    queryClient: getQueryClient(),
    schema: supportSavedViewSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(savedViewRows),
    ...buildWriters(
      () => savedViewRows,
      (rows) => {
        savedViewRows = rows;
      },
    ),
  }),
);

export const supportInboxesCollection = createCollection(
  queryCollectionOptions({
    id: "support_inboxes",
    queryKey: ["admin", "support", "inboxes"],
    queryClient: getQueryClient(),
    schema: supportInboxSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(inboxRows),
    ...buildWriters(
      () => inboxRows,
      (rows) => {
        inboxRows = rows;
      },
    ),
  }),
);

export const supportInboxSettingsCollection = createCollection(
  queryCollectionOptions({
    id: "support_inbox_settings",
    queryKey: ["admin", "support", "inbox-settings"],
    queryClient: getQueryClient(),
    schema: supportInboxSettingsSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(inboxSettingsRows),
    ...buildWriters(
      () => inboxSettingsRows,
      (rows) => {
        inboxSettingsRows = rows;
      },
    ),
  }),
);

export const supportTeamsCollection = createCollection(
  queryCollectionOptions({
    id: "support_teams",
    queryKey: ["admin", "support", "teams"],
    queryClient: getQueryClient(),
    schema: supportTeamSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(teamRows),
    ...buildWriters(
      () => teamRows,
      (rows) => {
        teamRows = rows;
      },
    ),
  }),
);

export const supportAgentsCollection = createCollection(
  queryCollectionOptions({
    id: "support_agents",
    queryKey: ["admin", "support", "agents"],
    queryClient: getQueryClient(),
    schema: supportAssigneeSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(agentRows),
    ...buildWriters(
      () => agentRows,
      (rows) => {
        agentRows = rows;
      },
    ),
  }),
);

export const supportBusinessHoursCollection = createCollection(
  queryCollectionOptions({
    id: "support_business_hours",
    queryKey: ["admin", "support", "business-hours"],
    queryClient: getQueryClient(),
    schema: supportBusinessHoursSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(businessHoursRows),
    ...buildWriters(
      () => businessHoursRows,
      (rows) => {
        businessHoursRows = rows;
      },
    ),
  }),
);

export const supportSlaPoliciesCollection = createCollection(
  queryCollectionOptions({
    id: "support_sla_policies",
    queryKey: ["admin", "support", "sla-policies"],
    queryClient: getQueryClient(),
    schema: supportSlaPolicySchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(slaPolicyRows),
    ...buildWriters(
      () => slaPolicyRows,
      (rows) => {
        slaPolicyRows = rows;
      },
    ),
  }),
);

export const supportSignaturesCollection = createCollection(
  queryCollectionOptions({
    id: "support_signatures",
    queryKey: ["admin", "support", "signatures"],
    queryClient: getQueryClient(),
    schema: supportSignatureSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(signatureRows),
    ...buildWriters(
      () => signatureRows,
      (rows) => {
        signatureRows = rows;
      },
    ),
  }),
);

export const supportAutomationRulesCollection = createCollection(
  queryCollectionOptions({
    id: "support_automation_rules",
    queryKey: ["admin", "support", "automation-rules"],
    queryClient: getQueryClient(),
    schema: supportAutomationRuleSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(automationRuleRows),
    ...buildWriters(
      () => automationRuleRows,
      (rows) => {
        automationRuleRows = rows;
      },
    ),
  }),
);

export const supportNotificationPreferencesCollection = createCollection(
  queryCollectionOptions({
    id: "support_notification_preferences",
    queryKey: ["admin", "support", "notification-preferences"],
    queryClient: getQueryClient(),
    schema: supportNotificationPreferencesSchema,
    getKey: (item) => item.id,
    queryFn: async () => cloneValue(notificationPreferenceRows),
    ...buildWriters(
      () => notificationPreferenceRows,
      (rows) => {
        notificationPreferenceRows = rows;
      },
    ),
  }),
);
