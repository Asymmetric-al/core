"use client";

import {
  EditorContent,
  EditorRoot,
  EditorToolbar,
  useEditorContext,
  type Extensions,
} from "@asym/ui/components/shadcn/rich-text-editor";
import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

import {
  SUPPORT_NOTE_TOOLS,
  SUPPORT_REPLY_TOOLS,
} from "./support-toolbar-tools";

import type { ReactNode } from "react";

interface SupportTipTapEditorProps {
  /** Tiptap document JSON serialized as a string (or empty for blank state). */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  active?: boolean;
  /**
   * Visual mode tints the editor card so agents can never confuse a public
   * reply with an internal note.
   */
  tone?: "reply" | "note";
  /** Optional row rendered between the toolbar and the editor body. */
  beforeBody?: ReactNode;
  /** Optional row rendered below the editor body (action row, attachments). */
  footer?: ReactNode;
  beforeToolbar?: ReactNode;
  afterToolbar?: ReactNode;
  extraExtensions?: Extensions;
}

export function SupportTipTapEditor({
  value,
  onChange,
  placeholder,
  disabled,
  active = true,
  tone = "reply",
  beforeBody,
  footer,
  beforeToolbar,
  afterToolbar,
  extraExtensions,
}: SupportTipTapEditorProps) {
  const tools = tone === "reply" ? SUPPORT_REPLY_TOOLS : SUPPORT_NOTE_TOOLS;

  return (
    <EditorRoot
      aria-label={tone === "reply" ? "Reply message" : "Internal note"}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      proseInvert={false}
      extraExtensions={extraExtensions}
      className={cn(
        "border border-border bg-card shadow-sm",
        tone === "note" && "border-warning/30 bg-warning/5",
      )}
      // Compact: in the desktop pane the thread needs the height.
      editorClassName="min-h-20 text-sm leading-relaxed text-foreground"
    >
      <EditorFocus active={active} />
      {beforeToolbar ? (
        <div className="border-b border-border bg-muted/40 px-3 py-1.5">
          {beforeToolbar}
        </div>
      ) : null}
      <EditorToolbar tools={tools} />
      {afterToolbar ? (
        <div className="border-b border-border bg-muted/40 px-3 py-1.5">
          {afterToolbar}
        </div>
      ) : null}
      {beforeBody}
      <EditorContent className="p-1" />
      {footer}
    </EditorRoot>
  );
}

function EditorFocus({ active }: { active: boolean }) {
  const { editor } = useEditorContext();
  React.useEffect(() => {
    if (active && editor?.isEditable) editor.commands.focus("end");
  }, [active, editor]);
  return null;
}
