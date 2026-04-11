"use client";

import { useEditor, EditorContent as TipTapEditorContent } from "@tiptap/react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { EditorContext, useOptionalEditorContext } from "./editor-context";
import { createDefaultExtensions } from "./extensions";
import { parseContent } from "./helpers";
import { LinkBubbleMenu } from "./link-bubble-menu";
import "./tiptap.css";

export interface RichTextEditorProps {
  /** Stored value — JSON string or legacy plain text / HTML. */
  value: string;
  /** Called with a JSON string whenever the content changes. */
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  /** When false, prose is not inverted in dark mode (default true). */
  proseInvert?: boolean;
  children: React.ReactNode;
}

export const EditorRoot = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  function EditorRoot(
    {
      value,
      onChange,
      disabled,
      placeholder,
      className,
      editorClassName,
      proseInvert = true,
      children,
    },
    ref,
  ) {
    const extensions = React.useMemo(
      () => createDefaultExtensions({ placeholder }),
      [placeholder],
    );

    const editor = useEditor({
      extensions,
      content: parseContent(value),
      editable: !disabled,
      onUpdate: ({ editor: ed }) => {
        onChange(JSON.stringify(ed.getJSON()));
      },
      editorProps: {
        attributes: {
          class: cn(
            "tiptap prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[150px] p-4",
            proseInvert && "dark:prose-invert",
            editorClassName,
          ),
        },
      },
      immediatelyRender: false,
    });

    React.useEffect(() => {
      if (!editor) return;

      editor.setEditable(!disabled);
    }, [disabled, editor]);

    React.useEffect(() => {
      if (!editor) return;

      if (!value) {
        editor.commands.clearContent();
        return;
      }

      const parsed = parseContent(value);
      const current = editor.getJSON();

      if (typeof parsed === "object") {
        if (JSON.stringify(parsed) !== JSON.stringify(current)) {
          editor.commands.setContent(parsed);
        }
      } else if (parsed !== editor.getHTML() && parsed !== editor.getText()) {
        editor.commands.setContent(parsed);
      }
    }, [value, editor]);

    return (
      <EditorContext.Provider value={{ editor }}>
        <div
          ref={ref}
          className={cn(
            "relative w-full overflow-hidden flex flex-col border border-input rounded-lg",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          {children}
          <LinkBubbleMenu />
        </div>
      </EditorContext.Provider>
    );
  },
);

EditorRoot.displayName = "EditorRoot";

/** Compound root — alias for {@link EditorRoot}. */
export const RichTextEditor = EditorRoot;

export function EditorContent({
  className,
  ...props
}: Omit<React.ComponentProps<typeof TipTapEditorContent>, "editor">) {
  const ctx = useOptionalEditorContext();
  const editor = ctx?.editor ?? null;
  return (
    <TipTapEditorContent
      {...props}
      className={cn("flex-1", className)}
      editor={editor}
    />
  );
}
