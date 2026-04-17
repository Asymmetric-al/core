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
  type DeleteCannedResponseInput,
  type DeleteLabelInput,
  type DeleteMacroInput,
  type DeleteSavedViewInput,
  type RunMacroInput,
  type SaveCannedResponseInput,
  type SaveLabelInput,
  type SaveMacroInput,
  type SaveSavedViewInput,
  type SendReplyInput,
  type SetConversationPriorityInput,
  type SetConversationStatusInput,
  type SnoozeConversationInput,
  type ToggleConversationLabelInput,
  type UnsnoozeConversationInput,
} from "../stores/support-store";

import type {
  SupportAssignee,
  SupportCannedResponse,
  SupportConversation,
  SupportLabel,
  SupportMacro,
  SupportMessage,
  SupportSavedView,
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

/**
 * Optimistic transaction wrapper. Mirrors the `useLogActivity` precedent in
 * `packages/database/hooks/admin-workspace.ts`: parse with Zod, mutate the
 * collection, await persistence, then ripple invalidations through
 * TanStack Query so any non-collection consumer (e.g. `useSupportInboxStats`
 * memoization fallback) refreshes too.
 */
function useInvalidateSupportCaches() {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({
      queryKey: [...supportHubQueryKeys.root],
    });
  };
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
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
  });
}

export function useSetSupportConversationStatus() {
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
  });
}

export function useSnoozeSupportConversation() {
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
  });
}

export function useUnsnoozeSupportConversation() {
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
  });
}

export function useSetSupportConversationPriority() {
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
  });
}

export function useToggleSupportLabel() {
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
  });
}

function labelMapFromCollection(): Map<string, SupportLabel> {
  const rows = supportStore.collections.labels.toArray as
    | SupportLabel[]
    | undefined;
  return new Map((rows ?? []).map((label) => [label.id, label] as const));
}

export function useAddSupportPrivateNote() {
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
  });
}

export function useSendSupportReply() {
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
  });
}

export function useSaveSupportMacro() {
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
  });
}

export function useSaveSupportCannedResponse() {
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
  });
}

export function useSaveSupportSavedView() {
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
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
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
  });
}

export function useDeleteSupportLabel() {
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
  });
}

export function useDeleteSupportSavedView() {
  const invalidate = useInvalidateSupportCaches();
  return useMutation({
    mutationFn: async (raw: DeleteSavedViewInput) => {
      const input = supportStore.inputs.deleteSavedView.parse(raw);
      const tx = supportStore.collections.savedViews.delete(input.id);
      await tx.isPersisted.promise;
      return input.id;
    },
    onSuccess: () => invalidate(),
  });
}

export function useDeleteSupportMacro() {
  const invalidate = useInvalidateSupportCaches();
  return useMutation({
    mutationFn: async (raw: DeleteMacroInput) => {
      const input = supportStore.inputs.deleteMacro.parse(raw);
      const tx = supportStore.collections.macros.delete(input.id);
      await tx.isPersisted.promise;
      return input.id;
    },
    onSuccess: () => invalidate(),
  });
}

export function useDeleteSupportCannedResponse() {
  const invalidate = useInvalidateSupportCaches();
  return useMutation({
    mutationFn: async (raw: DeleteCannedResponseInput) => {
      const input = supportStore.inputs.deleteCannedResponse.parse(raw);
      const tx = supportStore.collections.cannedResponses.delete(input.id);
      await tx.isPersisted.promise;
      return input.id;
    },
    onSuccess: () => invalidate(),
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
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
  });
}

export function useApplyRoundRobinAssignment() {
  const invalidate = useInvalidateSupportCaches();
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
    onSuccess: () => invalidate(),
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
