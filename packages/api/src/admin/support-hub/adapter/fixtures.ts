import type {
  SupportAssignee,
  SupportAutomationRule,
  SupportBusinessHours,
  SupportCannedResponse,
  SupportConversation,
  SupportInbox,
  SupportInboxSettings,
  SupportLabel,
  SupportMacro,
  SupportMessage,
  SupportNotificationPreferences,
  SupportParticipant,
  SupportSavedView,
  SupportSignature,
  SupportSlaPolicy,
  SupportTeam,
} from "@asym/database/hooks";

/**
 * Donor-care fixtures used by the Phase 7 in-memory `SupportHubAdapter`.
 *
 * These intentionally live in their own module (NOT in
 * `packages/database/collections/support-hub.ts` which carries `"use client"`)
 * so the server-side adapter can import them without crossing Next.js's RSC
 * client/server boundary. Phase 8 replaces this file with a Supabase
 * implementation; the fixtures stay around as the test seed.
 *
 * The data is intentionally compact — Phase 8 ships the full demo seed via
 * a one-time migration. The shape mirrors the Phase 2-6 store contracts so
 * the in-memory adapter exercises every adapter surface.
 */

const NOW = "2026-04-15T12:00:00.000Z";

/** Exported for server-side tenant scoping (matches every seeded row). */
export const SUPPORT_HUB_DEMO_TENANT_ID = "tenant-give-hope";
const TENANT_ID = SUPPORT_HUB_DEMO_TENANT_ID;
const INBOX_ID = "support-inbox-default";

const AGENT_EMILY: SupportAssignee = {
  id: "agent-emily-thompson",
  name: "Emily Thompson",
  email: "admin@givehope.org",
  avatarUrl: null,
  title: "Director of Operations",
};

const AGENT_DAVID: SupportAssignee = {
  id: "agent-david-rodriguez",
  name: "David Rodriguez",
  email: "care@givehope.org",
  avatarUrl: null,
  title: "Member Care Lead",
};

const AGENT_RACHEL: SupportAssignee = {
  id: "agent-rachel-kim",
  name: "Rachel Kim",
  email: "finance@givehope.org",
  avatarUrl: null,
  title: "Finance Manager",
};

export const SUPPORT_AGENTS_FIXTURE: SupportAssignee[] = [
  AGENT_EMILY,
  AGENT_DAVID,
  AGENT_RACHEL,
];

export const SUPPORT_TEAMS_FIXTURE: SupportTeam[] = [
  {
    id: "team-finance",
    name: "Finance",
    slug: "finance",
    description: "Receipts, refunds, recurring gift trouble.",
    initials: "FN",
  },
  {
    id: "team-member-care",
    name: "Member Care",
    slug: "member-care",
    description: "Pastoral or relational follow-up.",
    initials: "MC",
  },
];

const LABEL_FINANCE: SupportLabel = {
  id: "label-finance",
  tenantId: TENANT_ID,
  name: "Finance",
  slug: "finance",
  tone: "amber",
  description: "Receipts, refunds, donation issues.",
};

const LABEL_TECHNICAL: SupportLabel = {
  id: "label-technical",
  tenantId: TENANT_ID,
  name: "Technical",
  slug: "technical",
  tone: "blue",
  description: "Login, account, app or page issues.",
};

const LABEL_RECURRING: SupportLabel = {
  id: "label-recurring",
  tenantId: TENANT_ID,
  name: "Recurring",
  slug: "recurring",
  tone: "emerald",
  description: "Pledges, monthly gifts, retries, pauses.",
};

export const SUPPORT_LABELS_FIXTURE: SupportLabel[] = [
  LABEL_FINANCE,
  LABEL_TECHNICAL,
  LABEL_RECURRING,
];

export const SUPPORT_INBOXES_FIXTURE: SupportInbox[] = [
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
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SUPPORT_BUSINESS_HOURS_FIXTURE: SupportBusinessHours[] = [
  {
    id: "biz-hours-standard",
    tenantId: TENANT_ID,
    name: "Standard support hours",
    timezone: "America/Chicago",
    weeklySchedule: [
      { day: "monday", enabled: true, openTime: "09:00", closeTime: "17:00" },
      { day: "tuesday", enabled: true, openTime: "09:00", closeTime: "17:00" },
      {
        day: "wednesday",
        enabled: true,
        openTime: "09:00",
        closeTime: "17:00",
      },
      { day: "thursday", enabled: true, openTime: "09:00", closeTime: "17:00" },
      { day: "friday", enabled: true, openTime: "09:00", closeTime: "17:00" },
      {
        day: "saturday",
        enabled: false,
        openTime: "10:00",
        closeTime: "14:00",
      },
      { day: "sunday", enabled: false, openTime: "10:00", closeTime: "14:00" },
    ],
    holidays: [],
    isDefault: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SUPPORT_SLA_POLICIES_FIXTURE: SupportSlaPolicy[] = [
  {
    id: "sla-standard",
    tenantId: TENANT_ID,
    name: "Standard donor support",
    description: "First reply in one business day, resolve within five.",
    firstResponseMinutes: 8 * 60,
    nextResponseMinutes: 12 * 60,
    resolutionMinutes: 5 * 24 * 60,
    businessHoursId: "biz-hours-standard",
    isDefault: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SUPPORT_SIGNATURES_FIXTURE: SupportSignature[] = [
  {
    id: "sig-emily-thompson",
    tenantId: TENANT_ID,
    ownerAgentId: AGENT_EMILY.id,
    name: "Emily — Director of Operations",
    bodyText:
      "Emily Thompson\nDirector of Operations\nGive Hope · admin@givehope.org",
    bodyHtml:
      '<p>Emily Thompson<br/>Director of Operations<br/>Give Hope · <a href="mailto:admin@givehope.org">admin@givehope.org</a></p>',
    isDefault: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SUPPORT_INBOX_SETTINGS_FIXTURE: SupportInboxSettings[] = [
  {
    id: "support-inbox-settings-default",
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    defaultSignatureId: "sig-emily-thompson",
    defaultSlaPolicyId: "sla-standard",
    defaultBusinessHoursId: "biz-hours-standard",
    roundRobinEnabled: false,
    autoResolveAfterDays: 14,
    showContactSidecar: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SUPPORT_MACROS_FIXTURE: SupportMacro[] = [
  {
    id: "macro-resolve-and-thanks",
    tenantId: TENANT_ID,
    ownerAgentId: null,
    name: "Resolve + thanks",
    description: "Mark resolved with a short thank-you note.",
    actions: [
      { kind: "set_status", status: "resolved" },
      { kind: "add_label", labelId: LABEL_FINANCE.id },
    ],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SUPPORT_CANNED_RESPONSES_FIXTURE: SupportCannedResponse[] = [
  {
    id: "canned-thanks",
    tenantId: TENANT_ID,
    ownerAgentId: null,
    shortCode: "thanks",
    title: "Thanks, looking into it",
    bodyText:
      "Thank you so much for reaching out. We are looking into this right now and will reply with an update shortly.",
    bodyHtml: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "canned-receipt",
    tenantId: TENANT_ID,
    ownerAgentId: null,
    shortCode: "receipt",
    title: "Receipt re-sent",
    bodyText:
      "We just re-sent your gift receipt. Please check your inbox (and spam folder) and let us know if anything still looks off.",
    bodyHtml: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SUPPORT_SAVED_VIEWS_FIXTURE: SupportSavedView[] = [
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
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SUPPORT_AUTOMATION_RULES_FIXTURE: SupportAutomationRule[] = [
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
      { kind: "add_label", labelId: LABEL_FINANCE.id },
      { kind: "assign_team", teamId: "team-finance" },
    ],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SUPPORT_NOTIFICATION_PREFERENCES_FIXTURE: SupportNotificationPreferences[] =
  [
    {
      id: "notif-pref-emily",
      tenantId: TENANT_ID,
      agentId: AGENT_EMILY.id,
      emailMentions: true,
      emailAssignments: true,
      emailDailyDigest: true,
      inAppMentions: true,
      inAppAssignments: true,
      inAppSlaWarnings: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "notif-pref-david",
      tenantId: TENANT_ID,
      agentId: AGENT_DAVID.id,
      emailMentions: true,
      emailAssignments: true,
      emailDailyDigest: false,
      inAppMentions: true,
      inAppAssignments: true,
      inAppSlaWarnings: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];

const DONOR_PARTICIPANT = (
  email: string,
  name: string,
  donorId: string,
): SupportParticipant => ({
  id: donorId,
  role: "donor",
  name,
  email,
  avatarUrl: null,
});

const AGENT_PARTICIPANT = (agent: SupportAssignee): SupportParticipant => ({
  id: agent.id,
  role: "agent",
  name: agent.name,
  email: agent.email,
  avatarUrl: agent.avatarUrl,
});

export const SUPPORT_CONVERSATIONS_FIXTURE: SupportConversation[] = [
  {
    id: "conv-failed-receipt",
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    subject: "I never got my donation receipt",
    status: "open",
    priority: "normal",
    channel: "email",
    assignee: AGENT_RACHEL,
    team: SUPPORT_TEAMS_FIXTURE[0] ?? null,
    externalContactName: "John Anderson",
    externalContactEmail: "john.anderson@email.com",
    contact: {
      contactId: "crm-contact-1",
      donorId: "donor-001",
      giftId: null,
      contributionId: "contribution-001",
      missionaryId: null,
      crmPersonId: null,
      churchId: null,
    },
    labels: [LABEL_FINANCE],
    unreadCount: 1,
    messageCount: 1,
    firstMessageAt: "2026-04-16T13:00:00.000Z",
    lastMessageAt: "2026-04-16T13:00:00.000Z",
    lastCustomerMessageAt: "2026-04-16T13:00:00.000Z",
    lastMessageDirection: "inbound",
    firstRespondedAt: null,
    firstResponseDueAt: "2026-04-16T14:02:00.000Z",
    nextResponseDueAt: null,
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 0,
    slaPolicyId: "sla-standard",
    createdAt: "2026-04-16T13:00:00.000Z",
    updatedAt: "2026-04-16T13:00:00.000Z",
  },
  {
    id: "conv-recurring-decline",
    tenantId: TENANT_ID,
    inboxId: INBOX_ID,
    subject: "My monthly gift just declined",
    status: "pending",
    priority: "high",
    channel: "email",
    assignee: AGENT_DAVID,
    team: null,
    externalContactName: "Sarah Connor",
    externalContactEmail: "sarah.connor@email.com",
    contact: null,
    labels: [LABEL_RECURRING, LABEL_FINANCE],
    unreadCount: 0,
    messageCount: 2,
    firstMessageAt: "2026-04-14T15:30:00.000Z",
    lastMessageAt: "2026-04-15T09:15:00.000Z",
    lastCustomerMessageAt: "2026-04-14T15:30:00.000Z",
    lastMessageDirection: "outbound",
    firstRespondedAt: "2026-04-15T09:15:00.000Z",
    firstResponseDueAt: "2026-04-15T07:30:00.000Z",
    nextResponseDueAt: "2026-04-16T09:15:00.000Z",
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 1,
    slaPolicyId: "sla-standard",
    createdAt: "2026-04-14T15:30:00.000Z",
    updatedAt: "2026-04-15T09:15:00.000Z",
  },
];

export const SUPPORT_MESSAGES_FIXTURE: SupportMessage[] = [
  {
    id: "msg-failed-receipt-1",
    tenantId: TENANT_ID,
    conversationId: "conv-failed-receipt",
    type: "email",
    direction: "inbound",
    isPrivate: false,
    deliveryState: "delivered",
    author: DONOR_PARTICIPANT(
      "john.anderson@email.com",
      "John Anderson",
      "donor-001",
    ),
    body: {
      json: null,
      html: "<p>I gave on Sunday but never got the receipt — can you re-send it?</p>",
      text: "I gave on Sunday but never got the receipt — can you re-send it?",
    },
    attachments: [],
    emailHeaders: null,
    outboundSendLogId: null,
    inboundEmailId: null,
    postedAt: "2026-04-16T13:00:00.000Z",
    createdAt: "2026-04-16T13:00:00.000Z",
    updatedAt: "2026-04-16T13:00:00.000Z",
  },
  {
    id: "msg-recurring-decline-1",
    tenantId: TENANT_ID,
    conversationId: "conv-recurring-decline",
    type: "email",
    direction: "inbound",
    isPrivate: false,
    deliveryState: "delivered",
    author: DONOR_PARTICIPANT(
      "sarah.connor@email.com",
      "Sarah Connor",
      "donor-002",
    ),
    body: {
      json: null,
      html: "<p>My monthly gift just declined — can you check what happened?</p>",
      text: "My monthly gift just declined — can you check what happened?",
    },
    attachments: [],
    emailHeaders: null,
    outboundSendLogId: null,
    inboundEmailId: null,
    postedAt: "2026-04-14T15:30:00.000Z",
    createdAt: "2026-04-14T15:30:00.000Z",
    updatedAt: "2026-04-14T15:30:00.000Z",
  },
  {
    id: "msg-recurring-decline-2",
    tenantId: TENANT_ID,
    conversationId: "conv-recurring-decline",
    type: "email",
    direction: "outbound",
    isPrivate: false,
    deliveryState: "delivered",
    author: AGENT_PARTICIPANT(AGENT_DAVID),
    body: {
      json: null,
      html: "<p>Hi Sarah — looks like the card on file expired. We sent a quick update link.</p>",
      text: "Hi Sarah — looks like the card on file expired. We sent a quick update link.",
    },
    attachments: [],
    emailHeaders: null,
    outboundSendLogId: null,
    inboundEmailId: null,
    postedAt: "2026-04-15T09:15:00.000Z",
    createdAt: "2026-04-15T09:15:00.000Z",
    updatedAt: "2026-04-15T09:15:00.000Z",
  },
];
