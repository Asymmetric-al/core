import type {
  SupportAutomationRule,
  SupportBusinessHours,
  SupportCannedResponse,
  SupportConversation,
  SupportConversationStatus,
  SupportInbox,
  SupportInboxSettings,
  SupportLabel,
  SupportLabelTone,
  SupportMacro,
  SupportMacroAction,
  SupportMessage,
  SupportNotificationPreferences,
  SupportPriority,
  SupportSavedView,
  SupportSavedViewFilter,
  SupportSignature,
  SupportSlaPolicy,
  SupportTeam,
  SupportAssignee,
} from "@asym/database/hooks";

/**
 * Server-side adapter contract for the Donor Care Support Hub.
 *
 * Phase 7 ships a single in-memory implementation (`./in-memory.ts`).
 * Phase 8 swaps the implementation to a Supabase-backed module (`./supabase.ts`)
 * by changing one re-export in `./index.ts` — every reads/mutations call site
 * stays unchanged.
 *
 * Conventions:
 * - Reads return cloned rows so callers cannot mutate the store by reference.
 * - Mutations are typed against the same shape as the Phase 2-6 store inputs
 *   so the existing UI mutation hooks can be retargeted at the API layer
 *   without rewriting their payloads.
 * - All methods return Promises so the swap to Supabase does not change the
 *   call signatures.
 */
export interface SupportConversationFilter {
  inboxId?: string | null;
  /** When set, restricts the result to a single status. */
  status?: SupportConversationStatus | "all";
  assigneeAgentId?: string | null;
  /** Free-text query against subject + donor name + donor email. */
  q?: string;
  /** Slugs that must all be present on the conversation. */
  labelSlugs?: string[];
}

export interface AssignConversationInput {
  conversationId: string;
  assigneeAgentId: string | null;
  teamId?: string | null;
  reason?: "manual" | "round_robin" | "macro" | "inbound";
}

export interface SetConversationStatusInput {
  conversationId: string;
  status: SupportConversationStatus;
  snoozedUntil?: string | null;
}

export interface SnoozeConversationInput {
  conversationId: string;
  snoozedUntil: string;
}

export interface UnsnoozeConversationInput {
  conversationId: string;
}

export interface ToggleConversationLabelInput {
  conversationId: string;
  labelId: string;
  mode: "add" | "remove" | "toggle";
}

export interface SetConversationPriorityInput {
  conversationId: string;
  priority: SupportPriority;
}

export interface AddPrivateNoteInput {
  conversationId: string;
  authorAgentId: string;
  bodyText: string;
  bodyHtml?: string;
}

export interface SendReplyInput {
  conversationId: string;
  authorAgentId: string;
  /** Mode controls whether the message is queued for delivery or saved as a draft. */
  mode: "send" | "draft";
  payload: {
    json: unknown;
    html: string;
    text: string;
    attachments?: Array<{
      filename: string;
      contentType: string;
      sizeBytes: number;
    }>;
  };
}

export interface SaveLabelInput {
  id?: string;
  name: string;
  slug: string;
  tone: SupportLabelTone;
  description: string | null;
}

export interface SaveMacroInput {
  id?: string;
  name: string;
  description: string | null;
  ownerAgentId: string | null;
  actions: SupportMacroAction[];
}

export interface SaveCannedResponseInput {
  id?: string;
  shortCode: string;
  title: string;
  ownerAgentId: string | null;
  bodyText: string;
  bodyHtml?: string | null;
}

export interface SaveSavedViewInput {
  id?: string;
  name: string;
  slug: string;
  ownerAgentId: string | null;
  scope: "personal" | "workspace";
  filter: SupportSavedViewFilter;
}

export interface SaveTeamInput {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  initials: string;
}

export interface SaveBusinessHoursInput {
  id?: string;
  name: string;
  timezone: string;
  weeklySchedule: SupportBusinessHours["weeklySchedule"];
  holidays: SupportBusinessHours["holidays"];
  isDefault: boolean;
}

export interface SaveSlaPolicyInput {
  id?: string;
  name: string;
  description: string | null;
  firstResponseMinutes: number;
  nextResponseMinutes: number;
  resolutionMinutes: number;
  businessHoursId: string | null;
  isDefault: boolean;
}

export interface SaveSignatureInput {
  id?: string;
  ownerAgentId: string | null;
  name: string;
  bodyText: string;
  bodyHtml?: string | null;
  isDefault: boolean;
}

export interface SaveAutomationRuleInput {
  id?: string;
  name: string;
  description: string | null;
  enabled: boolean;
  trigger: SupportAutomationRule["trigger"];
  conditions: SupportAutomationRule["conditions"];
  actions: SupportAutomationRule["actions"];
}

export interface ToggleAutomationRuleInput {
  id: string;
  enabled: boolean;
}

export interface SaveInboxSettingsInput {
  id: string;
  inboxId: string;
  defaultSignatureId: string | null;
  defaultSlaPolicyId: string | null;
  defaultBusinessHoursId: string | null;
  roundRobinEnabled: boolean;
  autoResolveAfterDays: number | null;
  showContactSidecar: boolean;
}

export interface SaveNotificationPreferencesInput {
  agentId: string;
  emailMentions: boolean;
  emailAssignments: boolean;
  emailDailyDigest: boolean;
  inAppMentions: boolean;
  inAppAssignments: boolean;
  inAppSlaWarnings: boolean;
}

export interface SupportHubAdapter {
  conversations: {
    list(filter: SupportConversationFilter): Promise<SupportConversation[]>;
    get(id: string): Promise<SupportConversation | null>;
    listMessages(conversationId: string): Promise<SupportMessage[]>;
    assign(input: AssignConversationInput): Promise<SupportConversation>;
    setStatus(input: SetConversationStatusInput): Promise<SupportConversation>;
    setPriority(
      input: SetConversationPriorityInput,
    ): Promise<SupportConversation>;
    snooze(input: SnoozeConversationInput): Promise<SupportConversation>;
    unsnooze(input: UnsnoozeConversationInput): Promise<SupportConversation>;
    toggleLabel(
      input: ToggleConversationLabelInput,
    ): Promise<SupportConversation>;
  };
  messages: {
    sendReply(input: SendReplyInput): Promise<SupportMessage>;
    addPrivateNote(input: AddPrivateNoteInput): Promise<SupportMessage>;
  };
  labels: {
    list(): Promise<SupportLabel[]>;
    save(input: SaveLabelInput): Promise<SupportLabel>;
    delete(id: string): Promise<void>;
  };
  macros: {
    list(): Promise<SupportMacro[]>;
    save(input: SaveMacroInput): Promise<SupportMacro>;
    delete(id: string): Promise<void>;
  };
  cannedResponses: {
    list(): Promise<SupportCannedResponse[]>;
    save(input: SaveCannedResponseInput): Promise<SupportCannedResponse>;
    delete(id: string): Promise<void>;
  };
  savedViews: {
    list(): Promise<SupportSavedView[]>;
    save(input: SaveSavedViewInput): Promise<SupportSavedView>;
    delete(id: string): Promise<void>;
  };
  inboxes: {
    list(): Promise<SupportInbox[]>;
  };
  inboxSettings: {
    list(): Promise<SupportInboxSettings[]>;
    get(inboxId?: string | null): Promise<SupportInboxSettings | null>;
    save(input: SaveInboxSettingsInput): Promise<SupportInboxSettings>;
  };
  agents: {
    list(): Promise<SupportAssignee[]>;
  };
  teams: {
    list(): Promise<SupportTeam[]>;
    save(input: SaveTeamInput): Promise<SupportTeam>;
    delete(id: string): Promise<void>;
  };
  businessHours: {
    list(): Promise<SupportBusinessHours[]>;
    save(input: SaveBusinessHoursInput): Promise<SupportBusinessHours>;
    delete(id: string): Promise<void>;
  };
  slaPolicies: {
    list(): Promise<SupportSlaPolicy[]>;
    save(input: SaveSlaPolicyInput): Promise<SupportSlaPolicy>;
    setDefault(id: string): Promise<void>;
    delete(id: string): Promise<void>;
  };
  signatures: {
    list(): Promise<SupportSignature[]>;
    save(input: SaveSignatureInput): Promise<SupportSignature>;
    setDefault(id: string): Promise<void>;
    delete(id: string): Promise<void>;
  };
  automationRules: {
    list(): Promise<SupportAutomationRule[]>;
    save(input: SaveAutomationRuleInput): Promise<SupportAutomationRule>;
    toggle(input: ToggleAutomationRuleInput): Promise<SupportAutomationRule>;
    delete(id: string): Promise<void>;
  };
  notificationPreferences: {
    list(): Promise<SupportNotificationPreferences[]>;
    get(agentId: string): Promise<SupportNotificationPreferences | null>;
    save(
      input: SaveNotificationPreferencesInput,
    ): Promise<SupportNotificationPreferences>;
  };
}
