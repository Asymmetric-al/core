"use client";

import { supportHubQueryKeys } from "@asym/database/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logSupportActivity } from "../lib/activity-log";
import {
  runSupportMacro,
  type MacroMutationBag,
  type MacroRunResult,
} from "../lib/macro-runner";
import {
  getSupportAgentParticipant,
  SUPPORT_SYSTEM_PARTICIPANT,
} from "../lib/participants";
import { selectNextRoundRobinAgent } from "../lib/round-robin";
import {
  supportStore,
  type AddPrivateNoteInput,
  type ApplyRoundRobinAssignmentInput,
  type AssignConversationInput,
  type DeleteAutomationRuleInput,
  type DeleteBusinessHoursInput,
  type DeleteCannedResponseInput,
  type DeleteLabelInput,
  type DeleteMacroInput,
  type DeleteSavedViewInput,
  type DeleteSignatureInput,
  type DeleteSlaPolicyInput,
  type DeleteTeamInput,
  type RunMacroInput,
  type SaveAutomationRuleInput,
  type SaveBusinessHoursInput,
  type SaveCannedResponseInput,
  type SaveInboxSettingsInput,
  type SaveLabelInput,
  type SaveMacroInput,
  type SaveNotificationPreferencesInput,
  type SaveSavedViewInput,
  type SaveSignatureInput,
  type SaveSlaPolicyInput,
  type SaveTeamInput,
  type SendReplyInput,
  type SetConversationPriorityInput,
  type SetConversationStatusInput,
  type SetDefaultSignatureInput,
  type SetDefaultSlaPolicyInput,
  type SnoozeConversationInput,
  type ToggleAutomationRuleInput,
  type ToggleConversationLabelInput,
  type UnsnoozeConversationInput,
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

const HOUR_MS = 60 * 60 * 1000;

function nowIso(): string {
  return new Date().toISOString();
}

function genId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function lookupAgentAssignee(
  id: string | null | undefined,
): SupportAssignee | null {
  if (!id) return null;
  const rows = supportStore.collections.agents.toArray as
    | SupportAssignee[]
    | undefined;
  return rows?.find((row) => row.id === id) ?? null;
}

export function useAssignSupportConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: AssignConversationInput) => {
      const input = supportStore.inputs.assignConversation.parse(raw);
      const conversation = readConversation(input.conversationId);
      if (!conversation) {
        throw new Error(
          `Unknown support conversation: ${input.conversationId}`,
        );
      }
      const previousAssignee = conversation.assignee;
      const assignee = lookupAgentAssignee(input.assigneeAgentId);
      const tx = supportStore.collections.conversations.update(
        input.conversationId,
        (draft: SupportConversation) => {
          draft.assignee = assignee;
          draft.updatedAt = nowIso();
        },
      );
      await tx.isPersisted.promise;

      if (previousAssignee?.id !== assignee?.id) {
        await logSupportActivity({
          conversation,
          actor: null,
          verb: assignee ? "assigned" : "unassigned",
          body: assignee
            ? `Assigned to ${assignee.name}.`
            : "Conversation unassigned.",
        });
      }

      return input.conversationId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useSetSupportConversationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SetConversationStatusInput) => {
      const input = supportStore.inputs.setConversationStatus.parse(raw);
      const conversation = readConversation(input.conversationId);
      if (!conversation) {
        throw new Error(
          `Unknown support conversation: ${input.conversationId}`,
        );
      }
      const previousStatus = conversation.status;
      const tx = supportStore.collections.conversations.update(
        input.conversationId,
        (draft: SupportConversation) => {
          const stamp = nowIso();
          draft.status = input.status;
          draft.updatedAt = stamp;
          if (input.status === "resolved") {
            draft.resolvedAt = stamp;
            draft.snoozedUntil = null;
          } else {
            draft.resolvedAt = null;
          }
          if (input.status === "snoozed") {
            draft.snoozedUntil = input.snoozedUntil ?? draft.snoozedUntil;
          } else {
            draft.snoozedUntil = null;
          }
        },
      );
      await tx.isPersisted.promise;

      if (previousStatus !== input.status) {
        await logSupportActivity({
          conversation,
          actor: null,
          verb: "set_status",
          body: `Status changed to ${input.status}.`,
        });
      }

      return input.conversationId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useSnoozeSupportConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SnoozeConversationInput) => {
      const input = supportStore.inputs.snoozeConversation.parse(raw);
      const conversation = readConversation(input.conversationId);
      if (!conversation) {
        throw new Error(
          `Unknown support conversation: ${input.conversationId}`,
        );
      }
      const tx = supportStore.collections.conversations.update(
        input.conversationId,
        (draft: SupportConversation) => {
          draft.status = "snoozed";
          draft.snoozedUntil = input.snoozedUntil;
          draft.updatedAt = nowIso();
        },
      );
      await tx.isPersisted.promise;

      await logSupportActivity({
        conversation,
        actor: null,
        verb: "snoozed",
        body: `Snoozed until ${formatHumanIso(input.snoozedUntil)}.`,
      });

      return input.conversationId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useUnsnoozeSupportConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: UnsnoozeConversationInput) => {
      const input = supportStore.inputs.unsnoozeConversation.parse(raw);
      const conversation = readConversation(input.conversationId);
      if (!conversation) {
        throw new Error(
          `Unknown support conversation: ${input.conversationId}`,
        );
      }
      const wasSnoozed = conversation.status === "snoozed";
      const tx = supportStore.collections.conversations.update(
        input.conversationId,
        (draft: SupportConversation) => {
          if (draft.status === "snoozed") {
            draft.status = "open";
          }
          draft.snoozedUntil = null;
          draft.updatedAt = nowIso();
        },
      );
      await tx.isPersisted.promise;

      if (wasSnoozed) {
        await logSupportActivity({
          conversation,
          actor: null,
          verb: "unsnoozed",
          body: "Conversation woken up.",
        });
      }

      return input.conversationId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useSetSupportConversationPriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SetConversationPriorityInput) => {
      const input = supportStore.inputs.setConversationPriority.parse(raw);
      const conversation = readConversation(input.conversationId);
      if (!conversation) {
        throw new Error(
          `Unknown support conversation: ${input.conversationId}`,
        );
      }
      const previousPriority = conversation.priority;
      const tx = supportStore.collections.conversations.update(
        input.conversationId,
        (draft: SupportConversation) => {
          draft.priority = input.priority;
          draft.updatedAt = nowIso();
        },
      );
      await tx.isPersisted.promise;

      if (previousPriority !== input.priority) {
        await logSupportActivity({
          conversation,
          actor: null,
          verb: "set_priority",
          body: `Priority set to ${input.priority}.`,
        });
      }

      return input.conversationId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useToggleSupportLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: ToggleConversationLabelInput) => {
      const input = supportStore.inputs.toggleConversationLabel.parse(raw);
      const conversation = readConversation(input.conversationId);
      if (!conversation) {
        throw new Error(
          `Unknown support conversation: ${input.conversationId}`,
        );
      }
      const labelMap = labelMapFromCollection();
      const label = labelMap.get(input.labelId);
      if (!label) {
        throw new Error(`Unknown support label: ${input.labelId}`);
      }
      const previouslyHad = conversation.labels.some(
        (existing) => existing.id === input.labelId,
      );
      const shouldHave =
        input.mode === "add"
          ? true
          : input.mode === "remove"
            ? false
            : !previouslyHad;

      const tx = supportStore.collections.conversations.update(
        input.conversationId,
        (draft: SupportConversation) => {
          const has = draft.labels.some(
            (existing: SupportLabel) => existing.id === input.labelId,
          );
          if (shouldHave === has) return;
          if (shouldHave) {
            draft.labels = [...draft.labels, label];
          } else {
            draft.labels = draft.labels.filter(
              (existing: SupportLabel) => existing.id !== input.labelId,
            );
          }
          draft.updatedAt = nowIso();
        },
      );
      await tx.isPersisted.promise;

      if (shouldHave !== previouslyHad) {
        await logSupportActivity({
          conversation,
          actor: null,
          verb: shouldHave ? "label_added" : "label_removed",
          body: shouldHave
            ? `Label "${label.name}" added.`
            : `Label "${label.name}" removed.`,
        });
      }

      return input.conversationId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

function labelMapFromCollection(): Map<string, SupportLabel> {
  const rows = supportStore.collections.labels.toArray as
    | SupportLabel[]
    | undefined;
  return new Map((rows ?? []).map((label) => [label.id, label] as const));
}

export function useAddSupportPrivateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: AddPrivateNoteInput) => {
      const input = supportStore.inputs.addPrivateNote.parse(raw);
      const conversation = readConversation(input.conversationId);
      if (!conversation) {
        throw new Error(
          `Unknown support conversation: ${input.conversationId}`,
        );
      }
      const author =
        getSupportAgentParticipant(input.authorAgentId) ??
        SUPPORT_SYSTEM_PARTICIPANT;
      const stamp = nowIso();
      const message: SupportMessage = {
        id: genId("msg-note"),
        tenantId: conversation.tenantId,
        conversationId: input.conversationId,
        type: "note",
        direction: "outbound",
        isPrivate: true,
        deliveryState: "delivered",
        author,
        body: {
          json: null,
          html: input.bodyHtml ?? `<p>${input.bodyText}</p>`,
          text: input.bodyText,
        },
        attachments: [],
        emailHeaders: null,
        outboundSendLogId: null,
        inboundEmailId: null,
        postedAt: stamp,
        createdAt: stamp,
        updatedAt: stamp,
      };
      const insertTx = supportStore.collections.messages.insert(message);
      await insertTx.isPersisted.promise;

      const updateTx = supportStore.collections.conversations.update(
        input.conversationId,
        (draft: SupportConversation) => {
          draft.messageCount += 1;
          draft.lastMessageAt = stamp;
          draft.updatedAt = stamp;
        },
      );
      await updateTx.isPersisted.promise;

      return message.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useSendSupportReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SendReplyInput) => {
      const input = supportStore.inputs.sendReply.parse(raw);
      const conversation = readConversation(input.conversationId);
      if (!conversation) {
        throw new Error(
          `Unknown support conversation: ${input.conversationId}`,
        );
      }
      const agent = lookupAgentAssignee(input.authorAgentId);
      const author =
        getSupportAgentParticipant(input.authorAgentId) ??
        SUPPORT_SYSTEM_PARTICIPANT;
      const stamp = nowIso();
      const messageId = genId("msg-reply");
      const isDraft = input.mode === "draft";
      const message: SupportMessage = {
        id: messageId,
        tenantId: conversation.tenantId,
        conversationId: input.conversationId,
        type: "email",
        direction: "outbound",
        isPrivate: false,
        deliveryState: isDraft ? "draft" : "queued",
        author,
        body: input.payload,
        attachments: input.payload.attachments.map((attachment) => ({
          id: genId("att"),
          filename: attachment.filename,
          contentType: attachment.contentType,
          sizeBytes: attachment.sizeBytes,
          url: null,
        })),
        emailHeaders: {
          messageId: `<reply.${input.conversationId}.${messageId}@givehope.org>`,
          inReplyTo: null,
          references: [],
          subject: `Re: ${conversation.subject}`,
          from: agent?.email ?? "support@givehope.org",
          to: [conversation.externalContactEmail],
          cc: [],
          bcc: [],
        },
        outboundSendLogId: isDraft ? null : `send-log-${messageId}`,
        inboundEmailId: null,
        postedAt: stamp,
        createdAt: stamp,
        updatedAt: stamp,
      };
      const insertTx = supportStore.collections.messages.insert(message);
      await insertTx.isPersisted.promise;

      // Drafts do not bump the conversation timestamps or status — they are
      // private to the agent and the donor never sees them.
      if (!isDraft) {
        const updateTx = supportStore.collections.conversations.update(
          input.conversationId,
          (draft: SupportConversation) => {
            draft.messageCount += 1;
            draft.lastMessageAt = stamp;
            draft.lastMessageDirection = "outbound";
            draft.updatedAt = stamp;
            if (draft.firstRespondedAt === null) {
              draft.firstRespondedAt = stamp;
            }
            draft.snoozedUntil = null;
            if (draft.status === "snoozed") {
              draft.status = "open";
            }
          },
        );
        await updateTx.isPersisted.promise;
      }

      return messageId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useSaveSupportMacro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SaveMacroInput) => {
      const input = supportStore.inputs.saveMacro.parse(raw);
      const stamp = nowIso();
      if (input.id) {
        const tx = supportStore.collections.macros.update(
          input.id,
          (draft: SupportMacro) => {
            draft.name = input.name;
            draft.description = input.description;
            draft.ownerAgentId = input.ownerAgentId;
            draft.actions = input.actions;
            draft.updatedAt = stamp;
          },
        );
        await tx.isPersisted.promise;
        return input.id;
      }
      const id = genId("macro");
      const macro: SupportMacro = {
        id,
        tenantId: defaultTenantIdFromCollection(),
        ownerAgentId: input.ownerAgentId,
        name: input.name,
        description: input.description,
        actions: input.actions,
        createdAt: stamp,
        updatedAt: stamp,
      };
      const tx = supportStore.collections.macros.insert(macro);
      await tx.isPersisted.promise;
      return id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useSaveSupportCannedResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SaveCannedResponseInput) => {
      const input = supportStore.inputs.saveCannedResponse.parse(raw);
      const stamp = nowIso();
      if (input.id) {
        const tx = supportStore.collections.cannedResponses.update(
          input.id,
          (draft: SupportCannedResponse) => {
            draft.shortCode = input.shortCode;
            draft.title = input.title;
            draft.bodyText = input.bodyText;
            draft.bodyHtml = input.bodyHtml ?? null;
            draft.ownerAgentId = input.ownerAgentId;
            draft.updatedAt = stamp;
          },
        );
        await tx.isPersisted.promise;
        return input.id;
      }
      const id = genId("canned");
      const canned: SupportCannedResponse = {
        id,
        tenantId: defaultTenantIdFromCollection(),
        ownerAgentId: input.ownerAgentId,
        shortCode: input.shortCode,
        title: input.title,
        bodyText: input.bodyText,
        bodyHtml: input.bodyHtml ?? null,
        createdAt: stamp,
        updatedAt: stamp,
      };
      const tx = supportStore.collections.cannedResponses.insert(canned);
      await tx.isPersisted.promise;
      return id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useSaveSupportSavedView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SaveSavedViewInput) => {
      const input = supportStore.inputs.saveSavedView.parse(raw);
      const stamp = nowIso();
      if (input.id) {
        const tx = supportStore.collections.savedViews.update(
          input.id,
          (draft: SupportSavedView) => {
            draft.name = input.name;
            draft.slug = input.slug;
            draft.scope = input.scope;
            draft.ownerAgentId = input.ownerAgentId;
            draft.filter = input.filter;
            draft.updatedAt = stamp;
          },
        );
        await tx.isPersisted.promise;
        return input.id;
      }
      const id = genId("view");
      const view: SupportSavedView = {
        id,
        tenantId: defaultTenantIdFromCollection(),
        ownerAgentId: input.ownerAgentId,
        name: input.name,
        slug: input.slug,
        scope: input.scope,
        filter: input.filter,
        createdAt: stamp,
        updatedAt: stamp,
      };
      const tx = supportStore.collections.savedViews.insert(view);
      await tx.isPersisted.promise;
      return id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

function readConversation(id: string): SupportConversation | undefined {
  const rows = supportStore.collections.conversations.toArray as
    | SupportConversation[]
    | undefined;
  return rows?.find((row) => row.id === id);
}

function defaultTenantIdFromCollection(): string {
  const rows = supportStore.collections.conversations.toArray as
    | SupportConversation[]
    | undefined;
  return rows?.[0]?.tenantId ?? "tenant-give-hope";
}

/* ------------------------------------------------------------------------ */
/*  Phase 5 mutation hooks                                                   */
/* ------------------------------------------------------------------------ */

export function useSaveSupportLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SaveLabelInput) => {
      const input = supportStore.inputs.saveLabel.parse(raw);
      if (input.id) {
        const tx = supportStore.collections.labels.update(
          input.id,
          (draft: SupportLabel) => {
            draft.name = input.name;
            draft.slug = input.slug;
            draft.tone = input.tone;
            draft.description = input.description;
          },
        );
        await tx.isPersisted.promise;
        return input.id;
      }
      const id = genId("label");
      const label: SupportLabel = {
        id,
        tenantId: defaultTenantIdFromCollection(),
        name: input.name,
        slug: input.slug,
        tone: input.tone,
        description: input.description,
      };
      const tx = supportStore.collections.labels.insert(label);
      await tx.isPersisted.promise;
      return id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useDeleteSupportLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: DeleteLabelInput) => {
      const input = supportStore.inputs.deleteLabel.parse(raw);
      const tx = supportStore.collections.labels.delete(input.id);
      await tx.isPersisted.promise;

      // Strip the deleted label off every conversation that still carries it.
      const conversations = (supportStore.collections.conversations.toArray ??
        []) as SupportConversation[];
      for (const conversation of conversations) {
        if (!conversation.labels.some((row) => row.id === input.id)) continue;
        const updateTx = supportStore.collections.conversations.update(
          conversation.id,
          (draft: SupportConversation) => {
            draft.labels = draft.labels.filter(
              (row: SupportLabel) => row.id !== input.id,
            );
            draft.updatedAt = nowIso();
          },
        );
        await updateTx.isPersisted.promise;
      }
      return input.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useDeleteSupportSavedView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: DeleteSavedViewInput) => {
      const input = supportStore.inputs.deleteSavedView.parse(raw);
      const tx = supportStore.collections.savedViews.delete(input.id);
      await tx.isPersisted.promise;
      return input.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useDeleteSupportMacro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: DeleteMacroInput) => {
      const input = supportStore.inputs.deleteMacro.parse(raw);
      const tx = supportStore.collections.macros.delete(input.id);
      await tx.isPersisted.promise;
      return input.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useDeleteSupportCannedResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: DeleteCannedResponseInput) => {
      const input = supportStore.inputs.deleteCannedResponse.parse(raw);
      const tx = supportStore.collections.cannedResponses.delete(input.id);
      await tx.isPersisted.promise;
      return input.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

interface RunMacroInputWithSlot extends RunMacroInput {
  /** Composer-side hook for `send_canned_response` actions. */
  onCannedResponseInsert?: (input: { text: string; html: string }) => void;
}

/**
 * Wraps the pure `runSupportMacro` helper with a typed mutation bag built
 * from the existing Phase 2 mutation hooks. Single entry point for both the
 * conversation header and the command palette.
 */
export function useRunSupportMacro(): ReturnType<
  typeof useMutation<MacroRunResult, Error, RunMacroInputWithSlot>
> {
  const queryClient = useQueryClient();
  const setStatus = useSetSupportConversationStatus();
  const setPriority = useSetSupportConversationPriority();
  const assign = useAssignSupportConversation();
  const toggleLabel = useToggleSupportLabel();
  const snooze = useSnoozeSupportConversation();
  const addNote = useAddSupportPrivateNote();

  const mutations: MacroMutationBag = {
    setStatus: setStatus.mutateAsync,
    setPriority: setPriority.mutateAsync,
    assign: assign.mutateAsync,
    toggleLabel: toggleLabel.mutateAsync,
    snooze: snooze.mutateAsync,
    addPrivateNote: addNote.mutateAsync,
  };

  return useMutation<MacroRunResult, Error, RunMacroInputWithSlot>({
    mutationFn: async (raw) => {
      const { onCannedResponseInsert, ...rest } = raw;
      const input = supportStore.inputs.runMacro.parse(rest);
      const conversation = readConversation(input.conversationId);
      if (!conversation) {
        throw new Error(
          `Unknown support conversation: ${input.conversationId}`,
        );
      }
      const macros = (supportStore.collections.macros.toArray ??
        []) as SupportMacro[];
      const macro = macros.find((row) => row.id === input.macroId);
      if (!macro) {
        throw new Error(`Unknown support macro: ${input.macroId}`);
      }
      const actorAgent = lookupAgentAssignee(input.authorAgentId);
      const labels = (supportStore.collections.labels.toArray ??
        []) as SupportLabel[];
      const cannedResponses = (supportStore.collections.cannedResponses
        .toArray ?? []) as SupportCannedResponse[];
      const agents = (supportStore.collections.agents.toArray ??
        []) as SupportAssignee[];

      return runSupportMacro({
        macro,
        conversation,
        actorAgent,
        mutations,
        onCannedResponseInsert: onCannedResponseInsert
          ? ({ text, html }) => onCannedResponseInsert({ text, html })
          : undefined,
        lookup: {
          findLabel: (id) => labels.find((row) => row.id === id) ?? null,
          findCannedResponse: (id) =>
            cannedResponses.find((row) => row.id === id) ?? null,
          findAgent: (id) => agents.find((row) => row.id === id) ?? null,
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useApplyRoundRobinAssignment() {
  const queryClient = useQueryClient();
  const assign = useAssignSupportConversation();
  return useMutation({
    mutationFn: async (raw: ApplyRoundRobinAssignmentInput) => {
      const input = supportStore.inputs.applyRoundRobinAssignment.parse(raw);
      const conversation = readConversation(input.conversationId);
      if (!conversation) {
        throw new Error(
          `Unknown support conversation: ${input.conversationId}`,
        );
      }
      const conversations = (supportStore.collections.conversations.toArray ??
        []) as SupportConversation[];
      const agents = (supportStore.collections.agents.toArray ??
        []) as SupportAssignee[];
      const exclude = new Set(input.excludeAgentIds);
      if (conversation.assignee?.id) exclude.add(conversation.assignee.id);
      const next = selectNextRoundRobinAgent({
        conversations,
        agents,
        inboxId: conversation.inboxId,
        excludeAgentIds: Array.from(exclude),
      });
      if (!next) {
        await logSupportActivity({
          conversation,
          actor: input.authorAgentId
            ? (getSupportAgentParticipant(input.authorAgentId) ?? null)
            : null,
          verb: "round_robin",
          body: "Round-robin: no eligible agent available.",
          failed: true,
        });
        return null;
      }
      await assign.mutateAsync({
        conversationId: conversation.id,
        assigneeAgentId: next.id,
      });
      await logSupportActivity({
        conversation,
        actor: input.authorAgentId
          ? (getSupportAgentParticipant(input.authorAgentId) ?? null)
          : null,
        verb: "round_robin",
        body: `Round-robin assigned to ${next.name}.`,
      });
      return next.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

function formatHumanIso(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString();
  } catch {
    return iso;
  }
}

void HOUR_MS;

/* ------------------------------------------------------------------------ */
/*  Phase 6 mutation hooks                                                   */
/*                                                                            */
/*  Each hook mirrors the Phase 2 / Phase 5 pattern: Zod-validate the input, */
/*  call the in-memory collection writer, await persistence, invalidate the  */
/*  TanStack Query cache. All new hooks are additive — no existing caller    */
/*  has to change.                                                           */
/* ------------------------------------------------------------------------ */

export function useSaveSupportInboxSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SaveInboxSettingsInput) => {
      const input = supportStore.inputs.saveInboxSettings.parse(raw);
      const tx = supportStore.collections.inboxSettings.update(
        input.id,
        (draft: SupportInboxSettings) => {
          draft.inboxId = input.inboxId;
          draft.defaultSignatureId = input.defaultSignatureId;
          draft.defaultSlaPolicyId = input.defaultSlaPolicyId;
          draft.defaultBusinessHoursId = input.defaultBusinessHoursId;
          draft.roundRobinEnabled = input.roundRobinEnabled;
          draft.autoResolveAfterDays = input.autoResolveAfterDays;
          draft.showContactSidecar = input.showContactSidecar;
          draft.updatedAt = nowIso();
        },
      );
      await tx.isPersisted.promise;
      return input.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useSaveSupportBusinessHours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SaveBusinessHoursInput) => {
      const input = supportStore.inputs.saveBusinessHours.parse(raw);
      if (input.id) {
        const tx = supportStore.collections.businessHours.update(
          input.id,
          (draft: SupportBusinessHours) => {
            draft.name = input.name;
            draft.timezone = input.timezone;
            draft.weeklySchedule = input.weeklySchedule;
            draft.holidays = input.holidays;
            draft.isDefault = input.isDefault;
            draft.updatedAt = nowIso();
          },
        );
        await tx.isPersisted.promise;
        return input.id;
      }
      const stamp = nowIso();
      const row: SupportBusinessHours = {
        id: genId("biz-hours"),
        tenantId: defaultTenantIdFromCollection(),
        name: input.name,
        timezone: input.timezone,
        weeklySchedule: input.weeklySchedule,
        holidays: input.holidays,
        isDefault: input.isDefault,
        createdAt: stamp,
        updatedAt: stamp,
      };
      const tx = supportStore.collections.businessHours.insert(row);
      await tx.isPersisted.promise;
      return row.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useDeleteSupportBusinessHours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: DeleteBusinessHoursInput) => {
      const input = supportStore.inputs.deleteBusinessHours.parse(raw);
      const tx = supportStore.collections.businessHours.delete(input.id);
      await tx.isPersisted.promise;
      return input.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useSaveSupportSlaPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SaveSlaPolicyInput) => {
      const input = supportStore.inputs.saveSlaPolicy.parse(raw);
      if (input.id) {
        const tx = supportStore.collections.slaPolicies.update(
          input.id,
          (draft: SupportSlaPolicy) => {
            draft.name = input.name;
            draft.description = input.description;
            draft.firstResponseMinutes = input.firstResponseMinutes;
            draft.nextResponseMinutes = input.nextResponseMinutes;
            draft.resolutionMinutes = input.resolutionMinutes;
            draft.businessHoursId = input.businessHoursId;
            draft.isDefault = input.isDefault;
            draft.updatedAt = nowIso();
          },
        );
        await tx.isPersisted.promise;
        if (input.isDefault) await clearOtherDefaultSlas(input.id);
        return input.id;
      }
      const stamp = nowIso();
      const row: SupportSlaPolicy = {
        id: genId("sla"),
        tenantId: defaultTenantIdFromCollection(),
        name: input.name,
        description: input.description,
        firstResponseMinutes: input.firstResponseMinutes,
        nextResponseMinutes: input.nextResponseMinutes,
        resolutionMinutes: input.resolutionMinutes,
        businessHoursId: input.businessHoursId,
        isDefault: input.isDefault,
        createdAt: stamp,
        updatedAt: stamp,
      };
      const tx = supportStore.collections.slaPolicies.insert(row);
      await tx.isPersisted.promise;
      if (row.isDefault) await clearOtherDefaultSlas(row.id);
      return row.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useDeleteSupportSlaPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: DeleteSlaPolicyInput) => {
      const input = supportStore.inputs.deleteSlaPolicy.parse(raw);
      const tx = supportStore.collections.slaPolicies.delete(input.id);
      await tx.isPersisted.promise;
      return input.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useSetDefaultSupportSlaPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SetDefaultSlaPolicyInput) => {
      const input = supportStore.inputs.setDefaultSlaPolicy.parse(raw);
      const rows = (supportStore.collections.slaPolicies.toArray ??
        []) as SupportSlaPolicy[];
      for (const row of rows) {
        const shouldBeDefault = row.id === input.id;
        if (row.isDefault === shouldBeDefault) continue;
        const tx = supportStore.collections.slaPolicies.update(
          row.id,
          (draft: SupportSlaPolicy) => {
            draft.isDefault = shouldBeDefault;
            draft.updatedAt = nowIso();
          },
        );
        await tx.isPersisted.promise;
      }
      return input.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

async function clearOtherDefaultSlas(keepId: string): Promise<void> {
  const rows = (supportStore.collections.slaPolicies.toArray ??
    []) as SupportSlaPolicy[];
  for (const row of rows) {
    if (row.id === keepId) continue;
    if (!row.isDefault) continue;
    const tx = supportStore.collections.slaPolicies.update(
      row.id,
      (draft: SupportSlaPolicy) => {
        draft.isDefault = false;
        draft.updatedAt = nowIso();
      },
    );
    await tx.isPersisted.promise;
  }
}

export function useSaveSupportTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SaveTeamInput) => {
      const input = supportStore.inputs.saveTeam.parse(raw);
      if (input.id) {
        const tx = supportStore.collections.teams.update(
          input.id,
          (draft: SupportTeam) => {
            draft.name = input.name;
            draft.slug = input.slug;
            draft.description = input.description;
            draft.initials = input.initials;
          },
        );
        await tx.isPersisted.promise;
        return input.id;
      }
      const row: SupportTeam = {
        id: genId("team"),
        name: input.name,
        slug: input.slug,
        description: input.description,
        initials: input.initials,
      };
      const tx = supportStore.collections.teams.insert(row);
      await tx.isPersisted.promise;
      return row.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useDeleteSupportTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: DeleteTeamInput) => {
      const input = supportStore.inputs.deleteTeam.parse(raw);
      const tx = supportStore.collections.teams.delete(input.id);
      await tx.isPersisted.promise;
      return input.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useSaveSupportSignature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SaveSignatureInput) => {
      const input = supportStore.inputs.saveSignature.parse(raw);
      if (input.id) {
        const tx = supportStore.collections.signatures.update(
          input.id,
          (draft: SupportSignature) => {
            draft.ownerAgentId = input.ownerAgentId;
            draft.name = input.name;
            draft.bodyText = input.bodyText;
            draft.bodyHtml = input.bodyHtml ?? null;
            draft.isDefault = input.isDefault;
            draft.updatedAt = nowIso();
          },
        );
        await tx.isPersisted.promise;
        if (input.isDefault)
          await clearOtherDefaultSignatures(input.id, input.ownerAgentId);
        return input.id;
      }
      const stamp = nowIso();
      const row: SupportSignature = {
        id: genId("sig"),
        tenantId: defaultTenantIdFromCollection(),
        ownerAgentId: input.ownerAgentId,
        name: input.name,
        bodyText: input.bodyText,
        bodyHtml: input.bodyHtml ?? null,
        isDefault: input.isDefault,
        createdAt: stamp,
        updatedAt: stamp,
      };
      const tx = supportStore.collections.signatures.insert(row);
      await tx.isPersisted.promise;
      if (row.isDefault)
        await clearOtherDefaultSignatures(row.id, row.ownerAgentId);
      return row.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useDeleteSupportSignature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: DeleteSignatureInput) => {
      const input = supportStore.inputs.deleteSignature.parse(raw);
      const tx = supportStore.collections.signatures.delete(input.id);
      await tx.isPersisted.promise;
      return input.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useSetDefaultSupportSignature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SetDefaultSignatureInput) => {
      const input = supportStore.inputs.setDefaultSignature.parse(raw);
      const rows = (supportStore.collections.signatures.toArray ??
        []) as SupportSignature[];
      const target = rows.find((row) => row.id === input.id);
      if (!target) {
        throw new Error(`Unknown signature: ${input.id}`);
      }
      for (const row of rows) {
        if (row.ownerAgentId !== target.ownerAgentId) continue;
        const shouldBeDefault = row.id === input.id;
        if (row.isDefault === shouldBeDefault) continue;
        const tx = supportStore.collections.signatures.update(
          row.id,
          (draft: SupportSignature) => {
            draft.isDefault = shouldBeDefault;
            draft.updatedAt = nowIso();
          },
        );
        await tx.isPersisted.promise;
      }
      return input.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

async function clearOtherDefaultSignatures(
  keepId: string,
  ownerAgentId: string | null,
): Promise<void> {
  const rows = (supportStore.collections.signatures.toArray ??
    []) as SupportSignature[];
  for (const row of rows) {
    if (row.id === keepId) continue;
    if (row.ownerAgentId !== ownerAgentId) continue;
    if (!row.isDefault) continue;
    const tx = supportStore.collections.signatures.update(
      row.id,
      (draft: SupportSignature) => {
        draft.isDefault = false;
        draft.updatedAt = nowIso();
      },
    );
    await tx.isPersisted.promise;
  }
}

export function useSaveSupportAutomationRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SaveAutomationRuleInput) => {
      const input = supportStore.inputs.saveAutomationRule.parse(raw);
      if (input.id) {
        const tx = supportStore.collections.automationRules.update(
          input.id,
          (draft: SupportAutomationRule) => {
            draft.name = input.name;
            draft.description = input.description;
            draft.enabled = input.enabled;
            draft.trigger = input.trigger;
            draft.conditions =
              input.conditions as SupportAutomationRule["conditions"];
            draft.actions = input.actions as SupportAutomationRule["actions"];
            draft.updatedAt = nowIso();
          },
        );
        await tx.isPersisted.promise;
        return input.id;
      }
      const stamp = nowIso();
      const row: SupportAutomationRule = {
        id: genId("automation"),
        tenantId: defaultTenantIdFromCollection(),
        name: input.name,
        description: input.description,
        enabled: input.enabled,
        trigger: input.trigger,
        conditions: input.conditions as SupportAutomationRule["conditions"],
        actions: input.actions as SupportAutomationRule["actions"],
        createdAt: stamp,
        updatedAt: stamp,
      };
      const tx = supportStore.collections.automationRules.insert(row);
      await tx.isPersisted.promise;
      return row.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useDeleteSupportAutomationRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: DeleteAutomationRuleInput) => {
      const input = supportStore.inputs.deleteAutomationRule.parse(raw);
      const tx = supportStore.collections.automationRules.delete(input.id);
      await tx.isPersisted.promise;
      return input.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useToggleSupportAutomationRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: ToggleAutomationRuleInput) => {
      const input = supportStore.inputs.toggleAutomationRule.parse(raw);
      const tx = supportStore.collections.automationRules.update(
        input.id,
        (draft: SupportAutomationRule) => {
          draft.enabled = input.enabled;
          draft.updatedAt = nowIso();
        },
      );
      await tx.isPersisted.promise;
      return input.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}

export function useSaveSupportNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (raw: SaveNotificationPreferencesInput) => {
      const input = supportStore.inputs.saveNotificationPreferences.parse(raw);
      const rows = (supportStore.collections.notificationPreferences.toArray ??
        []) as SupportNotificationPreferences[];
      const existing = rows.find((row) => row.agentId === input.agentId);
      const stamp = nowIso();
      if (existing) {
        const tx = supportStore.collections.notificationPreferences.update(
          existing.id,
          (draft: SupportNotificationPreferences) => {
            draft.emailMentions = input.emailMentions;
            draft.emailAssignments = input.emailAssignments;
            draft.emailDailyDigest = input.emailDailyDigest;
            draft.inAppMentions = input.inAppMentions;
            draft.inAppAssignments = input.inAppAssignments;
            draft.inAppSlaWarnings = input.inAppSlaWarnings;
            draft.updatedAt = stamp;
          },
        );
        await tx.isPersisted.promise;
        return existing.id;
      }
      const row: SupportNotificationPreferences = {
        id: genId("notif-pref"),
        tenantId: defaultTenantIdFromCollection(),
        agentId: input.agentId,
        emailMentions: input.emailMentions,
        emailAssignments: input.emailAssignments,
        emailDailyDigest: input.emailDailyDigest,
        inAppMentions: input.inAppMentions,
        inAppAssignments: input.inAppAssignments,
        inAppSlaWarnings: input.inAppSlaWarnings,
        createdAt: stamp,
        updatedAt: stamp,
      };
      const tx = supportStore.collections.notificationPreferences.insert(row);
      await tx.isPersisted.promise;
      return row.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...supportHubQueryKeys.root],
      });
    },
  });
}
