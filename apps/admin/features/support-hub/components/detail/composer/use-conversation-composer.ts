"use client";

import * as React from "react";
import { toast } from "sonner";

import { serializeReplyPayload } from "./serialize-payload";
import { useSupportConversation } from "../../../hooks/use-support-conversation";
import {
  useAddSupportPrivateNote,
  useSendSupportReply,
} from "../../../hooks/use-support-mutations";
import { useCurrentSupportAgentId } from "../../../lib/current-agent";
import { buildMergeVariableContext } from "../../../lib/merge-variables";

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
}

const EMPTY_DRAFT: Record<ComposerMode, string> = { reply: "", note: "" };

/**
 * Holds the local Tiptap state per mode and threads it through the Phase 2
 * mutations. Sonner toasts wrap success and failure paths so the composer
 * never silently drops work.
 *
 * The hook does not own the editor instance — the editor lives inside
 * `<SupportTipTapEditor />` via `EditorRoot`, which calls `setValue` on every
 * doc change. That keeps the state location predictable and lets Phase 5
 * tap into the editor via `useEditorContext()` without prop drilling.
 */
export function useConversationComposer({
  conversationId,
  agentId,
  agent,
}: Options): ConversationComposerHandlers {
  const fallbackAgentId = useCurrentSupportAgentId();
  const authorAgentId = agentId ?? fallbackAgentId ?? null;
  const resolvedAgent = agent ?? null;

  const [mode, setModeState] = React.useState<ComposerMode>("reply");
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
  const isPending = sendReply.isPending || addNote.isPending;

  // Reset local drafts when the conversation changes.
  React.useEffect(() => {
    setDrafts(EMPTY_DRAFT);
    setAttachmentsByMode({ reply: [], note: [] });
    setModeState("reply");
  }, [conversationId]);

  const value = drafts[mode];
  const attachments = attachmentsByMode[mode];

  const setValue = (next: string) => {
    setDrafts((prev) => ({ ...prev, [mode]: next }));
  };

  const setMode = (next: ComposerMode) => {
    setModeState(next);
  };

  const addAttachment = (attachment: SupportAttachmentDraft) => {
    setAttachmentsByMode((prev) => ({
      ...prev,
      [mode]: [...prev[mode], attachment],
    }));
  };

  const removeAttachment = (index: number) => {
    setAttachmentsByMode((prev) => ({
      ...prev,
      [mode]: prev[mode].filter((_, i) => i !== index),
    }));
  };

  const reset = () => {
    setDrafts((prev) => ({ ...prev, [mode]: "" }));
    setAttachmentsByMode((prev) => ({ ...prev, [mode]: [] }));
  };

  const isDirty = isPayloadDirty(value);

  const send = async () => {
    if (!authorAgentId) {
      toast.error("No agent matched the current Mission Control user yet.");
      return;
    }
    if (!isDirty) {
      toast.info(
        mode === "reply" ? "Type a reply first." : "Type a note first.",
      );
      return;
    }

    if (mode === "note") {
      const payload = serializeReplyPayload({
        rawJson: value,
        attachments: [],
        signatureAgent: null,
        appendSignature: false,
        mergeContext,
      });
      try {
        await addNote.mutateAsync({
          conversationId,
          authorAgentId,
          bodyText: payload.text,
          bodyHtml: payload.html,
        });
        toast.success("Internal note added.");
        reset();
      } catch (error) {
        toast.error(extractErrorMessage(error, "Could not save the note."));
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
    try {
      await sendReply.mutateAsync({
        conversationId,
        authorAgentId,
        payload,
        mode: "send",
      });
      toast.success("Reply sent.");
      reset();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Could not send the reply."));
    }
  };

  const saveDraft = async () => {
    if (mode !== "reply") {
      toast.info("Drafts are only available for donor replies.");
      return;
    }
    if (!authorAgentId) {
      toast.error("No agent matched the current Mission Control user yet.");
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
    try {
      await sendReply.mutateAsync({
        conversationId,
        authorAgentId,
        payload,
        mode: "draft",
      });
      toast.success("Draft saved.");
      reset();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Could not save the draft."));
    }
  };

  return {
    mode,
    setMode,
    value,
    setValue,
    attachments,
    addAttachment,
    removeAttachment,
    appendSignature,
    setAppendSignature,
    isPending,
    isDirty,
    send,
    saveDraft,
    reset,
    agent: resolvedAgent,
    authorAgentId,
  };
}

function isPayloadDirty(rawJson: string): boolean {
  if (!rawJson) return false;
  try {
    const parsed = JSON.parse(rawJson) as { content?: unknown[] };
    const content = parsed?.content ?? [];
    if (!Array.isArray(content) || content.length === 0) return false;
    const text = JSON.stringify(content);
    return text.includes('"text"');
  } catch {
    return rawJson.trim().length > 0;
  }
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
