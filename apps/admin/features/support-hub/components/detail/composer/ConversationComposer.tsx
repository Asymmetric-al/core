"use client";

import { useEditorContext } from "@asym/ui/components/shadcn/rich-text-editor";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import { Mail, StickyNote } from "lucide-react";
import * as React from "react";

import { AttachmentChips } from "./AttachmentChips";
import { ComposerActions } from "./ComposerActions";
import { CannedResponseSuggestionExtension } from "./extensions/canned-suggestion";
import { buildMentionExtension } from "./extensions/mention-suggestion";
import { SendShortcutPassthrough } from "./extensions/send-shortcut-passthrough";
import { QuickActionsSlot } from "./QuickActionsSlot";
import { SignatureChip } from "./SignatureChip";
import {
  SupportTipTapEditor,
  type SupportEditorHandle,
} from "./SupportTipTapEditor";
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
  const editorRef = React.useRef<SupportEditorHandle>(null);
  const holdFocusRef = React.useRef(false);
  // A send makes the editor read-only, which drops focus to the page: focus in
  // the composer waits here (or on the busy button), then returns to the editor.
  React.useLayoutEffect(() => {
    const region = containerRef.current;
    if (!region) return;
    const focused = document.activeElement;
    if (composer.isPending) {
      holdFocusRef.current = region.contains(focused);
      if (holdFocusRef.current && focused?.getAttribute("aria-busy") !== "true")
        region.focus({ preventScroll: true });
      return;
    }
    if (!holdFocusRef.current) return;
    if (focused && focused !== document.body && !region.contains(focused))
      holdFocusRef.current = false;
    else region.focus({ preventScroll: true });
  }, [composer.isPending, containerRef]);
  // Runs after the editor's own effect makes it editable again.
  React.useEffect(() => {
    if (composer.isPending || !holdFocusRef.current) return;
    holdFocusRef.current = false;
    editorRef.current?.focus();
  }, [composer.isPending]);
  // A type chosen with Enter or Space keeps focus on its tab (APG Tabs); a
  // click, or showing the composer again, lets the new editor take focus.
  const [editorTakesFocus, setEditorTakesFocus] = React.useState(true);
  const [wasActive, setWasActive] = React.useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    setEditorTakesFocus(true);
  }

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
      SendShortcutPassthrough,
    ],
    [suggestionContext],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        composer.mode === "note" && "border-warning/30 bg-warning/5",
      )}
      role="group"
      aria-label="Conversation composer"
      tabIndex={-1}
    >
      <Tabs
        value={composer.mode}
        onValueChange={(next, { event }) => {
          if (next !== "reply" && next !== "note") return;
          setEditorTakesFocus(event instanceof MouseEvent && event.detail > 0);
          composer.setMode(next);
        }}
        className="gap-3"
      >
        <ComposerTabs
          mode={composer.mode}
          disabled={composer.isPending}
          donorName={
            conversation.externalContactName ??
            conversation.externalContactEmail
          }
        />
        {/* The editor's toolbar is the panel's first stop, so the panel
            itself stays out of the tab order (APG Tabs). */}
        <TabsContent
          value={composer.mode}
          tabIndex={-1}
          className="flex flex-col gap-3"
        >
          <SupportTipTapEditor
            key={composer.mode}
            handleRef={editorRef}
            active={active && editorTakesFocus}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ComposerTabsProps {
  mode: ComposerMode;
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

function ComposerTabs({ mode, donorName, disabled }: ComposerTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
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
