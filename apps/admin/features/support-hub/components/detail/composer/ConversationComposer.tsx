"use client";

import { Tabs, TabsList, TabsTrigger } from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import { Mail, StickyNote } from "lucide-react";
import * as React from "react";

import { AttachmentChips } from "./AttachmentChips";
import { ComposerActions } from "./ComposerActions";
import { QuickActionsSlot } from "./QuickActionsSlot";
import { SignatureChip } from "./SignatureChip";
import { SupportTipTapEditor } from "./SupportTipTapEditor";
import { useComposerHotkeys } from "./use-composer-hotkeys";
import {
  useConversationComposer,
  type ComposerMode,
} from "./use-conversation-composer";

import type { SupportAssignee, SupportConversation } from "../../../types";

interface ConversationComposerProps {
  conversation: SupportConversation;
  agent?: SupportAssignee | null;
  /**
   * Phase 5 mounts macro launchers, canned-response palette triggers, slash
   * menu triggers, etc. into these slots.
   */
  slots?: {
    beforeToolbar?: React.ReactNode;
    afterToolbar?: React.ReactNode;
    beforeSend?: React.ReactNode;
  };
}

/**
 * Reply / Private note composer. Renders the same Tiptap stack twice with
 * mode-specific tone, so an agent never confuses a public donor reply with
 * an internal collaboration note.
 */
export function ConversationComposer({
  conversation,
  agent = null,
  slots,
}: ConversationComposerProps) {
  const composer = useConversationComposer({
    conversationId: conversation.id,
    agent,
  });
  const isHotkeyEnabled = React.useCallback(
    () => !composer.isPending && composer.isDirty,
    [composer.isPending, composer.isDirty],
  );
  const sendRef = React.useRef(composer.send);
  React.useLayoutEffect(() => {
    sendRef.current = composer.send;
  }, [composer.send]);
  const onPrimary = React.useCallback(() => {
    void sendRef.current();
  }, []);
  const containerRef = useComposerHotkeys({
    onPrimaryAction: onPrimary,
    isEnabled: isHotkeyEnabled,
  });

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm",
        composer.mode === "note" && "border-amber-200 bg-amber-50/60",
      )}
      aria-label="Conversation composer"
    >
      <ComposerTabs
        mode={composer.mode}
        onModeChange={composer.setMode}
        donorName={
          conversation.externalContactName ?? conversation.externalContactEmail
        }
      />

      <SupportTipTapEditor
        value={composer.value}
        onChange={composer.setValue}
        disabled={composer.isPending}
        tone={composer.mode}
        placeholder={
          composer.mode === "reply"
            ? "Write a reply to the donor..."
            : "Leave an internal note for the team..."
        }
        beforeToolbar={slots?.beforeToolbar}
        afterToolbar={slots?.afterToolbar}
        footer={
          <div className="flex flex-col gap-2 border-t border-zinc-100 px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <AttachmentChips
                attachments={composer.attachments}
                onAdd={composer.addAttachment}
                onRemove={composer.removeAttachment}
                disabled={composer.isPending}
              />
              {composer.mode === "reply" ? (
                <SignatureChip
                  conversationId={conversation.id}
                  agent={composer.agent}
                  enabled={composer.appendSignature}
                  onChange={composer.setAppendSignature}
                />
              ) : null}
            </div>
          </div>
        }
      />

      <ComposerActions
        mode={composer.mode}
        isPending={composer.isPending}
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
}

function ComposerTabs({ mode, onModeChange, donorName }: ComposerTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Tabs
        value={mode}
        onValueChange={(next) => onModeChange(next as ComposerMode)}
      >
        <TabsList className="h-9 gap-1 rounded-lg bg-zinc-100/60 p-1">
          <TabsTrigger
            value="reply"
            className="h-7 gap-1.5 rounded-md px-2.5 text-[12px] font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm"
          >
            <Mail className="size-3.5" />
            Reply
          </TabsTrigger>
          <TabsTrigger
            value="note"
            className="h-7 gap-1.5 rounded-md px-2.5 text-[12px] font-medium data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 data-[state=active]:shadow-sm"
          >
            <StickyNote className="size-3.5" />
            Internal note
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <p className="text-[11px] text-zinc-500">
        {mode === "reply" ? (
          <>
            Replying to{" "}
            <span className="font-medium text-zinc-700">{donorName}</span>
          </>
        ) : (
          "Notes are visible to the team only."
        )}
      </p>
    </div>
  );
}
