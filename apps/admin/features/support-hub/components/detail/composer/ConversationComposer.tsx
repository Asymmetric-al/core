"use client";

import { useEditorContext } from "@asym/ui/components/shadcn/rich-text-editor";
import { Tabs, TabsList, TabsTrigger } from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import { Mail, StickyNote } from "lucide-react";
import * as React from "react";

import { AttachmentChips } from "./AttachmentChips";
import { ComposerActions } from "./ComposerActions";
import { CannedResponseSuggestionExtension } from "./extensions/canned-suggestion";
import { buildMentionExtension } from "./extensions/mention-suggestion";
import { QuickActionsSlot } from "./QuickActionsSlot";
import { SignatureChip } from "./SignatureChip";
import { SupportTipTapEditor } from "./SupportTipTapEditor";
import { useComposerHotkeys } from "./use-composer-hotkeys";
import {
  useConversationComposer,
  type ComposerMode,
} from "./use-conversation-composer";
import { useSupportAgents } from "../../../hooks/use-support-agents";
import { useSupportCannedResponses } from "../../../hooks/use-support-canned-responses";
import { buildMergeVariableContext } from "../../../lib/merge-variables";
import { MacroLauncher } from "../../macros/MacroLauncher";

import type { SupportAssignee, SupportConversation } from "../../../types";
import type { Extensions } from "@asym/ui/components/shadcn/rich-text-editor";

interface ConversationComposerProps {
  conversation: SupportConversation;
  agent?: SupportAssignee | null;
  /** Reply or internal note when the composer first opens. */
  initialMode?: ComposerMode;
  active?: boolean;
  slots?: {
    beforeToolbar?: React.ReactNode;
    afterToolbar?: React.ReactNode;
    beforeSend?: React.ReactNode;
  };
}

function createSuggestionContext<Context>(initialContext: Context) {
  let currentContext = initialContext;
  return {
    read: () => currentContext,
    update: (nextContext: Context) => {
      currentContext = nextContext;
    },
  };
}

export function ConversationComposer({
  conversation,
  agent = null,
  initialMode,
  active = true,
  slots,
}: ConversationComposerProps) {
  const composer = useConversationComposer({
    conversationId: conversation.id,
    agent,
    initialMode,
  });
  const containerRef = useComposerHotkeys({
    onPrimaryAction: composer.send,
    disabled: composer.isPending,
  });

  const { data: cannedResponses } = useSupportCannedResponses();
  const { data: agents } = useSupportAgents();
  const mergeContext = React.useMemo(
    () => buildMergeVariableContext(conversation, composer.agent),
    [conversation, composer.agent],
  );

  const [suggestionContext] = React.useState(() =>
    createSuggestionContext({
      mode: composer.mode,
      agents,
      cannedResponses,
      mergeContext,
    }),
  );
  React.useLayoutEffect(() => {
    suggestionContext.update({
      mode: composer.mode,
      agents,
      cannedResponses,
      mergeContext,
    });
  }, [composer.mode, agents, cannedResponses, mergeContext, suggestionContext]);
  const extraExtensions = React.useMemo<Extensions>(
    () => [
      CannedResponseSuggestionExtension.configure({
        getContext: suggestionContext.read,
        isEnabled: () => suggestionContext.read().mode === "reply",
      }),
      buildMentionExtension({
        getAgents: () => suggestionContext.read().agents,
        isEnabled: () => suggestionContext.read().mode === "note",
      }),
    ],
    [suggestionContext],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm",
        composer.mode === "note" && "border-warning/30 bg-warning/5",
      )}
      aria-label="Conversation composer"
    >
      <ComposerTabs
        mode={composer.mode}
        onModeChange={composer.setMode}
        disabled={composer.isPending}
        donorName={
          conversation.externalContactName ?? conversation.externalContactEmail
        }
      />

      <SupportTipTapEditor
        key={composer.mode}
        active={active}
        value={composer.value}
        onChange={composer.setValue}
        disabled={composer.isPending}
        tone={composer.mode}
        extraExtensions={extraExtensions}
        placeholder={
          composer.mode === "reply"
            ? "Write a reply… Type / for a canned response."
            : "Write an internal note… Type @ to mention a teammate."
        }
        beforeToolbar={slots?.beforeToolbar}
        afterToolbar={slots?.afterToolbar}
        footer={
          <div className="flex flex-col gap-2 border-t border-border px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {composer.mode === "reply" ? (
                  <AttachmentChips
                    attachments={composer.attachments}
                    onAdd={composer.addAttachment}
                    onRemove={composer.removeAttachment}
                    disabled={composer.isPending}
                  />
                ) : null}
                <ComposerMacros
                  conversation={conversation}
                  disabled={composer.isPending}
                />
              </div>
              {composer.mode === "reply" ? (
                <SignatureChip
                  agent={composer.agent}
                  enabled={composer.appendSignature}
                  onChange={composer.setAppendSignature}
                  disabled={composer.isPending}
                />
              ) : null}
            </div>
          </div>
        }
      />

      <ComposerActions
        mode={composer.mode}
        isPending={composer.isPending}
        pendingAction={composer.pendingAction}
        isDirty={composer.isDirty}
        onSend={composer.send}
        onSaveDraft={composer.saveDraft}
        beforeSend={
          slots?.beforeSend ? (
            <QuickActionsSlot>{slots.beforeSend}</QuickActionsSlot>
          ) : undefined
        }
      />
    </div>
  );
}

interface ComposerTabsProps {
  mode: ComposerMode;
  onModeChange: (mode: ComposerMode) => void;
  donorName: string;
  disabled: boolean;
}

function ComposerMacros({
  conversation,
  disabled,
}: {
  conversation: SupportConversation;
  disabled: boolean;
}) {
  const { editor } = useEditorContext();
  return (
    <MacroLauncher
      compact
      conversation={conversation}
      disabled={disabled || !editor}
      onCannedResponseInsert={({ html, text }) => {
        if (!editor?.isEditable) return;
        const content =
          html ||
          text.split("\n").map((line) => ({
            type: "paragraph",
            content: line ? [{ type: "text", text: line }] : [],
          }));
        editor.chain().focus().insertContent(content).run();
      }}
    />
  );
}

function ComposerTabs({
  mode,
  onModeChange,
  donorName,
  disabled,
}: ComposerTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Tabs
        value={mode}
        onValueChange={(next) => {
          if (next === "reply" || next === "note") onModeChange(next);
        }}
      >
        <TabsList aria-label="Message type">
          <TabsTrigger value="reply" disabled={disabled}>
            <Mail aria-hidden="true" />
            Reply
          </TabsTrigger>
          <TabsTrigger value="note" disabled={disabled}>
            <StickyNote aria-hidden="true" />
            Internal note
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <p className="text-xs text-muted-foreground">
        {mode === "reply" ? (
          <>
            Replying to{" "}
            <span className="font-medium text-foreground">{donorName}</span>
          </>
        ) : (
          "Notes are visible to the team only."
        )}
      </p>
    </div>
  );
}
