"use client";

import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import { useSupportAgents } from "./use-support-agents";
import { useSupportCannedResponses } from "./use-support-canned-responses";
import { useSupportConversations } from "./use-support-conversations";
import { useSupportMacros } from "./use-support-macros";
import { supportApiJson } from "../lib/api-client";
import {
  applyMergeVariables,
  buildMergeVariableContext,
} from "../lib/merge-variables";
import { supportHubQueryKeys } from "../lib/query-keys";
import { selectNextRoundRobinAgent } from "../lib/round-robin";

import type {
  AddPrivateNoteInput,
  ApplyRoundRobinAssignmentInput,
  AssignConversationInput,
  DeleteAutomationRuleInput,
  DeleteBusinessHoursInput,
  DeleteCannedResponseInput,
  DeleteLabelInput,
  DeleteMacroInput,
  DeleteSavedViewInput,
  DeleteSignatureInput,
  DeleteSlaPolicyInput,
  DeleteTeamInput,
  RunMacroInput,
  SaveAutomationRuleInput,
  SaveBusinessHoursInput,
  SaveCannedResponseInput,
  SaveInboxSettingsInput,
  SaveLabelInput,
  SaveMacroInput,
  SaveNotificationPreferencesInput,
  SaveSavedViewInput,
  SaveSignatureInput,
  SaveSlaPolicyInput,
  SaveTeamInput,
  SendReplyInput,
  SetConversationPriorityInput,
  SetConversationStatusInput,
  SetDefaultSignatureInput,
  SetDefaultSlaPolicyInput,
  SnoozeConversationInput,
  ToggleAutomationRuleInput,
  ToggleConversationLabelInput,
  UnsnoozeConversationInput,
} from "../stores/support-store";
import type {
  SupportAssignee,
  SupportAutomationRule,
  SupportBusinessHours,
  SupportCannedResponse,
  SupportConversation,
  SupportInboxSettings,
  SupportLabel,
  SupportMacro,
  SupportMessage,
  SupportNotificationPreferences,
  SupportSavedView,
  SupportSignature,
  SupportSlaPolicy,
  SupportTeam,
} from "@asym/database/hooks";

interface ConversationResponse {
  conversation: SupportConversation;
}

interface MessageResponse {
  message: SupportMessage;
}

interface LabelResponse {
  label: SupportLabel;
}

interface MacroResponse {
  macro: SupportMacro;
}

interface CannedResponseResponse {
  cannedResponse: SupportCannedResponse;
}

interface SavedViewResponse {
  savedView: SupportSavedView;
}

interface InboxSettingsResponse {
  settings: SupportInboxSettings;
}

interface BusinessHoursResponse {
  businessHours: SupportBusinessHours;
}

interface SlaPolicyResponse {
  slaPolicy: SupportSlaPolicy;
}

interface TeamResponse {
  team: SupportTeam;
}

interface SignatureResponse {
  signature: SupportSignature;
}

interface AutomationRuleResponse {
  automationRule: SupportAutomationRule;
}

interface NotificationPreferencesResponse {
  preferences: SupportNotificationPreferences;
}

interface MacroRunResult {
  macroId: string;
  conversationId: string;
  outcomes: Array<{
    index: number;
    action: SupportMacro["actions"][number];
    status: "ok" | "skipped" | "failed";
    message: string;
  }>;
  ok: boolean;
}

interface RunMacroResponse {
  result: MacroRunResult;
}

interface RunMacroInputWithSlot extends RunMacroInput {
  onCannedResponseInsert?: (input: { text: string; html: string }) => void;
}

function invalidateSupportHubCaches(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: [...supportHubQueryKeys.root],
  });
}

function conversationPath(conversationId: string, action: string): string {
  return `/api/admin/support/conversations/${conversationId}/${action}`;
}

function savePath(collectionPath: string, id?: string): string {
  return id
    ? `/api/admin/support/${collectionPath}/${id}`
    : `/api/admin/support/${collectionPath}`;
}

function mutationWithInvalidation<TData, TVariables>(
  queryClient: QueryClient,
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  return {
    mutationFn,
    onSuccess: () => invalidateSupportHubCaches(queryClient),
  };
}

export function useAssignSupportConversation() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: AssignConversationInput) => {
        const response = await supportApiJson<ConversationResponse>(
          conversationPath(input.conversationId, "assign"),
          "PATCH",
          input,
        );
        return response.conversation;
      },
    ),
  );
}

export function useSetSupportConversationStatus() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: SetConversationStatusInput) => {
        const response = await supportApiJson<ConversationResponse>(
          conversationPath(input.conversationId, "status"),
          "PATCH",
          input,
        );
        return response.conversation;
      },
    ),
  );
}

export function useSnoozeSupportConversation() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: SnoozeConversationInput) => {
        const response = await supportApiJson<ConversationResponse>(
          conversationPath(input.conversationId, "snooze"),
          "PATCH",
          input,
        );
        return response.conversation;
      },
    ),
  );
}

export function useUnsnoozeSupportConversation() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: UnsnoozeConversationInput) => {
        const response = await supportApiJson<ConversationResponse>(
          conversationPath(input.conversationId, "snooze"),
          "DELETE",
        );
        return response.conversation;
      },
    ),
  );
}

export function useSetSupportConversationPriority() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: SetConversationPriorityInput) => {
        const response = await supportApiJson<ConversationResponse>(
          conversationPath(input.conversationId, "priority"),
          "PATCH",
          input,
        );
        return response.conversation;
      },
    ),
  );
}

export function useToggleSupportLabel() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: ToggleConversationLabelInput) => {
        const response = await supportApiJson<ConversationResponse>(
          conversationPath(input.conversationId, "labels"),
          "PATCH",
          input,
        );
        return response.conversation;
      },
    ),
  );
}

export function useAddSupportPrivateNote() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: AddPrivateNoteInput) => {
        const response = await supportApiJson<MessageResponse>(
          conversationPath(input.conversationId, "notes"),
          "POST",
          input,
        );
        return response.message;
      },
    ),
  );
}

export function useSendSupportReply() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(queryClient, async (input: SendReplyInput) => {
      const response = await supportApiJson<MessageResponse>(
        conversationPath(input.conversationId, "replies"),
        "POST",
        input,
      );
      return response.message;
    }),
  );
}

export function useSaveSupportMacro() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(queryClient, async (input: SaveMacroInput) => {
      const response = await supportApiJson<MacroResponse>(
        savePath("macros", input.id),
        input.id ? "PATCH" : "POST",
        input,
      );
      return response.macro;
    }),
  );
}

export function useSaveSupportCannedResponse() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: SaveCannedResponseInput) => {
        const response = await supportApiJson<CannedResponseResponse>(
          savePath("canned-responses", input.id),
          input.id ? "PATCH" : "POST",
          input,
        );
        return response.cannedResponse;
      },
    ),
  );
}

export function useSaveSupportSavedView() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(queryClient, async (input: SaveSavedViewInput) => {
      const response = await supportApiJson<SavedViewResponse>(
        savePath("saved-views", input.id),
        input.id ? "PATCH" : "POST",
        input,
      );
      return response.savedView;
    }),
  );
}

export function useSaveSupportLabel() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(queryClient, async (input: SaveLabelInput) => {
      const response = await supportApiJson<LabelResponse>(
        savePath("labels", input.id),
        input.id ? "PATCH" : "POST",
        input,
      );
      return response.label;
    }),
  );
}

export function useDeleteSupportLabel() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(queryClient, async (input: DeleteLabelInput) => {
      await supportApiJson<void>(savePath("labels", input.id), "DELETE");
      return input.id;
    }),
  );
}

export function useDeleteSupportSavedView() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: DeleteSavedViewInput) => {
        await supportApiJson<void>(savePath("saved-views", input.id), "DELETE");
        return input.id;
      },
    ),
  );
}

export function useDeleteSupportMacro() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(queryClient, async (input: DeleteMacroInput) => {
      await supportApiJson<void>(savePath("macros", input.id), "DELETE");
      return input.id;
    }),
  );
}

export function useDeleteSupportCannedResponse() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: DeleteCannedResponseInput) => {
        await supportApiJson<void>(
          savePath("canned-responses", input.id),
          "DELETE",
        );
        return input.id;
      },
    ),
  );
}

export function useRunSupportMacro() {
  const queryClient = useQueryClient();
  const conversations = useSupportConversations();
  const macros = useSupportMacros();
  const cannedResponses = useSupportCannedResponses();
  const agents = useSupportAgents();

  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: RunMacroInputWithSlot): Promise<MacroRunResult> => {
        const conversation = conversations.data.find(
          (row) => row.id === input.conversationId,
        );
        if (!conversation) {
          throw new Error(
            `Unknown support conversation: ${input.conversationId}`,
          );
        }

        const macro = macros.data.find((row) => row.id === input.macroId);
        if (!macro) throw new Error(`Unknown support macro: ${input.macroId}`);

        insertCannedResponses({
          macro,
          conversation,
          actorAgent:
            agents.data.find((agent) => agent.id === input.authorAgentId) ??
            null,
          cannedResponses: cannedResponses.data,
          onCannedResponseInsert: input.onCannedResponseInsert,
        });

        const response = await supportApiJson<RunMacroResponse>(
          conversationPath(input.conversationId, "run-macro"),
          "POST",
          {
            conversationId: input.conversationId,
            macroId: input.macroId,
          },
        );

        return response.result;
      },
    ),
  );
}

export function useApplyRoundRobinAssignment() {
  const queryClient = useQueryClient();
  const conversations = useSupportConversations();
  const agents = useSupportAgents();

  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: ApplyRoundRobinAssignmentInput): Promise<string | null> => {
        const conversation = conversations.data.find(
          (row) => row.id === input.conversationId,
        );
        if (!conversation) {
          throw new Error(
            `Unknown support conversation: ${input.conversationId}`,
          );
        }

        const exclude = new Set(input.excludeAgentIds ?? []);
        if (conversation.assignee?.id) exclude.add(conversation.assignee.id);
        const next = selectNextRoundRobinAgent({
          conversations: conversations.data,
          agents: agents.data,
          inboxId: conversation.inboxId,
          excludeAgentIds: Array.from(exclude),
        });

        if (!next) return null;

        const response = await supportApiJson<ConversationResponse>(
          conversationPath(conversation.id, "assign"),
          "PATCH",
          {
            conversationId: conversation.id,
            assigneeAgentId: next.id,
            reason: "round_robin",
          },
        );
        void response.conversation;
        return next.id;
      },
    ),
  );
}

export function useSaveSupportInboxSettings() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: SaveInboxSettingsInput) => {
        const response = await supportApiJson<InboxSettingsResponse>(
          "/api/admin/support/inbox-settings",
          "PATCH",
          input,
        );
        return response.settings;
      },
    ),
  );
}

export function useSaveSupportBusinessHours() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: SaveBusinessHoursInput) => {
        const response = await supportApiJson<BusinessHoursResponse>(
          savePath("business-hours", input.id),
          input.id ? "PATCH" : "POST",
          input,
        );
        return response.businessHours.id;
      },
    ),
  );
}

export function useDeleteSupportBusinessHours() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: DeleteBusinessHoursInput) => {
        await supportApiJson<void>(
          savePath("business-hours", input.id),
          "DELETE",
        );
        return input.id;
      },
    ),
  );
}

export function useSaveSupportSlaPolicy() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(queryClient, async (input: SaveSlaPolicyInput) => {
      const response = await supportApiJson<SlaPolicyResponse>(
        savePath("sla-policies", input.id),
        input.id ? "PATCH" : "POST",
        input,
      );
      return response.slaPolicy;
    }),
  );
}

export function useDeleteSupportSlaPolicy() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: DeleteSlaPolicyInput) => {
        await supportApiJson<void>(
          savePath("sla-policies", input.id),
          "DELETE",
        );
        return input.id;
      },
    ),
  );
}

export function useSetDefaultSupportSlaPolicy() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: SetDefaultSlaPolicyInput) => {
        await supportApiJson<void>(
          `/api/admin/support/sla-policies/${input.id}?default=true`,
          "PATCH",
        );
        return input.id;
      },
    ),
  );
}

export function useSaveSupportTeam() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(queryClient, async (input: SaveTeamInput) => {
      const response = await supportApiJson<TeamResponse>(
        savePath("teams", input.id),
        input.id ? "PATCH" : "POST",
        input,
      );
      return response.team;
    }),
  );
}

export function useDeleteSupportTeam() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(queryClient, async (input: DeleteTeamInput) => {
      await supportApiJson<void>(savePath("teams", input.id), "DELETE");
      return input.id;
    }),
  );
}

export function useSaveSupportSignature() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(queryClient, async (input: SaveSignatureInput) => {
      const response = await supportApiJson<SignatureResponse>(
        savePath("signatures", input.id),
        input.id ? "PATCH" : "POST",
        input,
      );
      return response.signature;
    }),
  );
}

export function useDeleteSupportSignature() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: DeleteSignatureInput) => {
        await supportApiJson<void>(savePath("signatures", input.id), "DELETE");
        return input.id;
      },
    ),
  );
}

export function useSetDefaultSupportSignature() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: SetDefaultSignatureInput) => {
        await supportApiJson<void>(
          `/api/admin/support/signatures/${input.id}?default=true`,
          "PATCH",
        );
        return input.id;
      },
    ),
  );
}

export function useSaveSupportAutomationRule() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: SaveAutomationRuleInput) => {
        const response = await supportApiJson<AutomationRuleResponse>(
          savePath("automation-rules", input.id),
          input.id ? "PATCH" : "POST",
          input,
        );
        return response.automationRule;
      },
    ),
  );
}

export function useDeleteSupportAutomationRule() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: DeleteAutomationRuleInput) => {
        await supportApiJson<void>(
          savePath("automation-rules", input.id),
          "DELETE",
        );
        return input.id;
      },
    ),
  );
}

export function useToggleSupportAutomationRule() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: ToggleAutomationRuleInput) => {
        const response = await supportApiJson<AutomationRuleResponse>(
          `/api/admin/support/automation-rules/${input.id}?toggle=true`,
          "PATCH",
          input,
        );
        return response.automationRule;
      },
    ),
  );
}

export function useSaveSupportNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation(
    mutationWithInvalidation(
      queryClient,
      async (input: SaveNotificationPreferencesInput) => {
        const response = await supportApiJson<NotificationPreferencesResponse>(
          "/api/admin/support/notification-preferences",
          "PATCH",
          input,
        );
        return response.preferences;
      },
    ),
  );
}

function insertCannedResponses(input: {
  macro: SupportMacro;
  conversation: SupportConversation;
  actorAgent: SupportAssignee | null;
  cannedResponses: SupportCannedResponse[];
  onCannedResponseInsert?: (body: { text: string; html: string }) => void;
}): void {
  const cannedActions = input.macro.actions.filter(
    (action) => action.kind === "send_canned_response",
  );
  if (cannedActions.length === 0) return;
  if (!input.onCannedResponseInsert) {
    throw new Error("Open the reply composer to insert canned responses.");
  }

  const mergeContext = buildMergeVariableContext(
    input.conversation,
    input.actorAgent,
  );
  for (const action of cannedActions) {
    const cannedResponse = input.cannedResponses.find(
      (row) => row.id === action.cannedResponseId,
    );
    if (!cannedResponse) continue;
    input.onCannedResponseInsert({
      text: applyMergeVariables(cannedResponse.bodyText, mergeContext),
      html: applyMergeVariables(
        cannedResponse.bodyHtml ?? cannedResponse.bodyText,
        mergeContext,
      ),
    });
  }
}
