"use client";

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
import { logSupportActivity } from "../../../lib/activity-log";
import { buildMergeVariableContext } from "../../../lib/merge-variables";
import { toSupportParticipant } from "../../../lib/participants";
import { MacroLauncher } from "../../macros/MacroLauncher";

import type { SupportAssignee, SupportConversation } from "../../../types";
import type { Extensions } from "@asym/ui/components/shadcn/rich-text-editor";

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
  const containerRef = useComposerHotkeys({ onPrimaryAction: composer.send });

  const { data: cannedResponses } = useSupportCannedResponses();
  const { data: agents } = useSupportAgents();
  const mergeContext = React.useMemo(
    () => buildMergeVariableContext(conversation, agent),
    [conversation, agent],
  );

  const handleMentionInsert = React.useCallback(
    (mentionedAgent: SupportAssignee) => {
      const actor = agent ? toSupportParticipant(agent) : null;
      void logSupportActivity({
        conversation,
        actor,
        verb: "mention",
        body: `${actor?.name ?? "Someone"} mentioned ${mentionedAgent.name} in a private note.`,
      });
    },
    [agent, conversation],
  );

  const extraExtensions = React.useMemo<Extensions>(() => {
    if (composer.mode === "reply") {
      return [
        CannedResponseSuggestionExtension.configure({
          cannedResponses,
          mergeContext,
        }),
      ];
    }
    return [
      buildMentionExtension({
        agents,
        onMention: handleMentionInsert,
      }),
    ];
  }, [
    agents,
    cannedResponses,
    composer.mode,
    handleMentionInsert,
    mergeContext,
  ]);

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
        extraExtensions={extraExtensions}
        placeholder={
          composer.mode === "reply"
            ? "Write a reply to the donor... type / for canned responses"
            : "Leave an internal note for the team... type @ to mention an agent"
        }
        beforeToolbar={slots?.beforeToolbar}
        afterToolbar={
          slots?.afterToolbar ?? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-zinc-500">
                {composer.mode === "reply"
                  ? "Type / for a canned response."
                  : "Type @ to mention a teammate."}
              </p>
              <MacroLauncher
                conversation={conversation}
                onCannedResponseInsert={({ html, text }) => {
                  composer.setValue(htmlToTiptapJson(html, text));
                }}
              />
            </div>
          )
        }
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

/**
 * Converts a canned-response HTML body into a Tiptap-shaped document JSON
 * string. We keep the shape minimal — `EditorRoot.parseContent` will hydrate
 * the body when the editor mounts. Falls back to a plain paragraph wrapper
 * when HTML is empty.
 */
function htmlToTiptapJson(html: string, text: string): string {
  const safeHtml =
    html && html.length > 0 ? html : `<p>${escapeHtml(text)}</p>`;
  // EditorRoot already accepts raw HTML strings via `parseContent`, so we
  // pass the HTML through unchanged. The `setValue` contract serializes the
  // editor doc to JSON on next change, so subsequent edits behave normally.
  return safeHtml;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
            className="h-7 gap-1.5 rounded-md px-2.5 text-[12px] font-medium data-active:bg-white data-active:text-zinc-900 data-active:shadow-sm"
          >
            <Mail className="size-3.5" />
            Reply
          </TabsTrigger>
          <TabsTrigger
            value="note"
            className="h-7 gap-1.5 rounded-md px-2.5 text-[12px] font-medium data-active:bg-amber-100 data-active:text-amber-900 data-active:shadow-sm"
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
