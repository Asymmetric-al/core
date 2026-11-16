"use client";

import * as React from "react";
import { toast } from "sonner";

import { serializeReplyPayload } from "./serialize-payload";
import { useSupportAgents } from "../../../hooks/use-support-agents";
import { useSupportConversation } from "../../../hooks/use-support-conversation";
import { useSupportFailureRecovery } from "../../../hooks/use-support-failure-recovery";
import {
  useAddSupportPrivateNote,
  useSendSupportReply,
} from "../../../hooks/use-support-mutations";
import { SUPPORT_AGENT_SETUP_MESSAGE } from "../../../lib/agent-setup";
import { useCurrentSupportAgentId } from "../../../lib/current-agent";
import { buildMergeVariableContext } from "../../../lib/merge-variables";
import { isRichTextPayloadDirty } from "../../../lib/rich-text-dirty";

import type { SupportAttachmentDraft } from "../../../models/editor-payload";
import type { SupportAssignee } from "../../../types";

export type ComposerMode = "reply" | "note";

export interface ConversationComposerHandlers {
  /** Active mode (reply / private note). */
  mode: ComposerMode;
  /** Switch composer mode. Re-uses the same draft per mode. */
  setMode: (mode: ComposerMode) => void;

  /** Tiptap document JSON serialized as a string for the active mode. */
  value: string;
  setValue: (next: string) => void;

  /** Locally-staged attachments for the current draft. */
  attachments: SupportAttachmentDraft[];
  addAttachment: (attachment: SupportAttachmentDraft) => void;
  removeAttachment: (index: number) => void;

  /** Append the resolved agent signature to outbound replies. */
  appendSignature: boolean;
  setAppendSignature: (append: boolean) => void;

  /** True while a send / draft / note mutation is in flight. */
  isPending: boolean;
  /** Identifies the initiating action; private notes use the primary send action. */
  pendingAction: "send" | "draft" | null;
  /** True when the editor body is non-empty (used to gate send / save buttons). */
  isDirty: boolean;

  /** Primary action — send the donor reply or post the private note. */
  send: () => Promise<void>;
  /** Save the current reply as a draft (no donor email is sent). */
  saveDraft: () => Promise<void>;
  /** Discard the current draft body (does not touch persisted drafts). */
  reset: () => void;

  /** Resolved agent used for signature + author attribution. */
  agent: SupportAssignee | null;
  /** Resolved agent id; null when the current user can't be matched. */
  authorAgentId: string | null;
}

interface Options {
  conversationId: string;
  /** Agent to attribute messages to. Defaults to `useCurrentSupportAgentId`. */
  agentId?: string | null;
  agent?: SupportAssignee | null;
  /** Reply or internal note when the composer first opens. */
  initialMode?: ComposerMode;
}

const EMPTY_DRAFT: Record<ComposerMode, string> = { reply: "", note: "" };

export function useConversationComposer({
  conversationId,
  agentId,
  agent,
  initialMode = "reply",
}: Options): ConversationComposerHandlers {
  const fallbackAgentId = useCurrentSupportAgentId();
  const authorAgentId = agentId ?? fallbackAgentId ?? null;
  const { data: agents } = useSupportAgents();
  const resolvedAgent =
    agents.find((candidate) => candidate.id === authorAgentId) ??
    (agent?.id === authorAgentId ? agent : null);

  const [modeState, setModeState] = React.useState<ComposerMode>(initialMode);
  const [drafts, setDrafts] =
    React.useState<Record<ComposerMode, string>>(EMPTY_DRAFT);
  const [attachmentsByMode, setAttachmentsByMode] = React.useState<
    Record<ComposerMode, SupportAttachmentDraft[]>
  >({ reply: [], note: [] });
  const [appendSignature, setAppendSignature] = React.useState(true);

  const conversationQuery = useSupportConversation(conversationId);
  const conversation = conversationQuery.data ?? null;
  const mergeContext = React.useMemo(
    () => buildMergeVariableContext(conversation, resolvedAgent),
    [conversation, resolvedAgent],
  );

  const sendReply = useSendSupportReply();
  const addNote = useAddSupportPrivateNote();
  const mutationInFlight = React.useRef(false);
  const failure = useSupportFailureRecovery();
  const isPending = sendReply.isPending || addNote.isPending;
  const pendingAction: ConversationComposerHandlers["pendingAction"] =
    addNote.isPending
      ? "send"
      : sendReply.isPending
        ? sendReply.variables?.mode === "draft"
          ? "draft"
          : "send"
        : null;

  // Drafts are scoped to one conversation: <ConversationComposer /> is keyed
  // by conversation id, so this hook remounts (and its state resets) when the
  // agent switches threads.

  const value = drafts[modeState];
  const attachments = attachmentsByMode[modeState];

  const setValue = (next: string) => {
    setDrafts((prev) => ({ ...prev, [modeState]: next }));
  };

  const setMode = (next: ComposerMode) => {
    setModeState(next);
  };

  const addAttachment = (attachment: SupportAttachmentDraft) => {
    setAttachmentsByMode((prev) => ({
      ...prev,
      [modeState]: [...prev[modeState], attachment],
    }));
  };

  const removeAttachment = (index: number) => {
    setAttachmentsByMode((prev) => ({
      ...prev,
      [modeState]: prev[modeState].filter((_, i) => i !== index),
    }));
  };

  const reset = () => {
    setDrafts((prev) => ({ ...prev, [modeState]: "" }));
    setAttachmentsByMode((prev) => ({ ...prev, [modeState]: [] }));
  };

  const isDirty = isRichTextPayloadDirty(value) || attachments.length > 0;

  const runMutation = async (action: () => Promise<void>) => {
    if (mutationInFlight.current) return;
    mutationInFlight.current = true;
    try {
      await action();
    } finally {
      mutationInFlight.current = false;
    }
  };

  const send = async () => {
    if (mutationInFlight.current || isPending) return;
    if (!authorAgentId) {
      toast.error(SUPPORT_AGENT_SETUP_MESSAGE);
      return;
    }
    if (!isDirty) {
      toast.info(
        modeState === "reply" ? "Type a reply first." : "Type a note first.",
      );
      return;
    }

    if (modeState === "note") {
      const payload = serializeReplyPayload({
        rawJson: value,
        attachments: [],
        signatureAgent: null,
        appendSignature: false,
        mergeContext,
      });
      const performAddNote = async () => {
        await addNote.mutateAsync({
          conversationId,
          authorAgentId,
          bodyText: payload.text,
          bodyHtml: payload.html,
        });
        toast.success("Internal note added.");
        failure.clear();
        reset();
      };
      try {
        await runMutation(performAddNote);
      } catch (error) {
        const message = extractErrorMessage(error, "Could not save the note.");
        toast.error(message);
        failure.report({
          kind: "add-note",
          message,
          conversationId,
          retry: () => runMutation(performAddNote),
        });
      }
      return;
    }

    const payload = serializeReplyPayload({
      rawJson: value,
      attachments,
      signatureAgent: resolvedAgent,
      appendSignature,
      mergeContext,
    });
    const performSend = async () => {
      await sendReply.mutateAsync({
        conversationId,
        authorAgentId,
        payload,
        mode: "send",
      });
      toast.success("Reply sent.");
      failure.clear();
      reset();
    };
    try {
      await runMutation(performSend);
    } catch (error) {
      const message = extractErrorMessage(error, "Could not send the reply.");
      toast.error(message);
      failure.report({
        kind: "send-reply",
        message,
        conversationId,
        retry: () => runMutation(performSend),
      });
    }
  };

  const saveDraft = async () => {
    if (mutationInFlight.current || isPending) return;
    if (modeState !== "reply") {
      toast.info("Drafts are only available for donor replies.");
      return;
    }
    if (!authorAgentId) {
      toast.error(SUPPORT_AGENT_SETUP_MESSAGE);
      return;
    }
    if (!isDirty) {
      toast.info("Type a reply first.");
      return;
    }
    const payload = serializeReplyPayload({
      rawJson: value,
      attachments,
      signatureAgent: resolvedAgent,
      appendSignature,
      mergeContext,
    });
    const performDraft = async () => {
      await sendReply.mutateAsync({
        conversationId,
        authorAgentId,
        payload,
        mode: "draft",
      });
      toast.success("Draft saved.");
      failure.clear();
      reset();
    };
    try {
      await runMutation(performDraft);
    } catch (error) {
      const message = extractErrorMessage(error, "Could not save the draft.");
      toast.error(message);
      failure.report({
        kind: "save-draft",
        message,
        conversationId,
        retry: () => runMutation(performDraft),
      });
    }
  };

  return {
    mode: modeState,
    setMode,
    value,
    setValue,
    attachments,
    addAttachment,
    removeAttachment,
    appendSignature,
    setAppendSignature,
    isPending,
    pendingAction,
    isDirty,
    send,
    saveDraft,
    reset,
    agent: resolvedAgent,
    authorAgentId,
  };
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
