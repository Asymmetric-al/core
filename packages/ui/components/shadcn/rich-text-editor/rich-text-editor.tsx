"use client";

import { useEditor, EditorContent as TipTapEditorContent } from "@tiptap/react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { EditorContext, useOptionalEditorContext } from "./editor-context";
import { createDefaultExtensions } from "./extensions";
import { parseContent } from "./helpers";
import { LinkBubbleMenu } from "./link-bubble-menu";

import "./tiptap.css";

import type { Extensions } from "@tiptap/react";

export interface RichTextEditorProps {
  /** Accessible name forwarded to Tiptap's editable textbox, not its wrapper. */
  "aria-label"?: string;
  /** Stored value — JSON string or legacy plain text / HTML. */
  value: string;
  /** Called with a JSON string whenever the content changes. */
  onChange: (value: string) => void;
  disabled?: boolean;
  /**
   * Shows the content without editing or formatting controls, at full
   * strength (unlike `disabled`, which dims the editor).
   */
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  /** Feed-composer text density; default editor presentation is unchanged. */
  variant?: "default" | "feed";
  /** When false, prose is not inverted in dark mode (default true). */
  proseInvert?: boolean;
  /**
   * Extra Tiptap extensions appended after the default extension set. Use this
   * to plug in suggestion-based features (slash commands, `@`-mentions,
   * collaboration cursors, etc.) without touching the shared editor.
   *
   * The array reference is treated as part of the extension identity — pass a
   * stable / memoized list to avoid recreating the editor on every render.
   */
  extraExtensions?: Extensions;
  children: React.ReactNode;
}

export const EditorRoot = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  function EditorRoot(
    {
      "aria-label": ariaLabel,
      value,
      onChange,
      disabled,
      readOnly,
      placeholder,
      className,
      editorClassName,
      variant = "default",
      proseInvert = true,
      extraExtensions,
      children,
    },
    ref,
  ) {
    const extensions = React.useMemo(
      () => [
        ...createDefaultExtensions({ placeholder }),
        ...(extraExtensions ?? []),
      ],
      [placeholder, extraExtensions],
    );
    const lastSyncedValueRef = React.useRef(value);
    const editable = !disabled && !readOnly;

    const editor = useEditor({
      extensions,
      content: parseContent(value),
      editable,
      onUpdate: ({ editor: ed, transaction }) => {
        // setEditable also emits "update"; only real edits reach onChange.
        if (!transaction.docChanged) return;
        const nextValue = JSON.stringify(ed.getJSON());

        if (nextValue !== lastSyncedValueRef.current) {
          lastSyncedValueRef.current = nextValue;
          onChange(nextValue);
        }
      },
      editorProps: {
        attributes: {
          role: "textbox",
          "aria-multiline": "true",
          ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
          ...(placeholder ? { "aria-placeholder": placeholder } : {}),
          ...(disabled ? { "aria-disabled": "true" } : {}),
          ...(readOnly ? { "aria-readonly": "true" } : {}),
          class: cn(
            "tiptap prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-37.5 p-4",
            proseInvert && "dark:prose-invert",
            variant === "feed" &&
              "py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base text-foreground placeholder:text-muted-foreground min-h-25 sm:min-h-35 leading-relaxed",
            editorClassName,
          ),
        },
      },
      immediatelyRender: false,
    });

    React.useEffect(() => {
      if (!editor || editor.isEditable === editable) return;

      editor.setEditable(editable);
    }, [editable, editor]);

    React.useEffect(() => {
      if (!editor) return;

      if (!value) {
        if (lastSyncedValueRef.current === value) return;

        editor.commands.clearContent(false);
        lastSyncedValueRef.current = value;
        return;
      }

      if (lastSyncedValueRef.current === value) return;

      const parsed = parseContent(value);
      const current = editor.getJSON();

      if (typeof parsed === "object") {
        if (JSON.stringify(parsed) !== JSON.stringify(current)) {
          editor.commands.setContent(parsed, { emitUpdate: false });
        }
      } else if (parsed !== editor.getText()) {
        editor.commands.setContent(parsed, { emitUpdate: false });
      }

      lastSyncedValueRef.current = value;
    }, [value, editor]);

    const contextValue = React.useMemo(
      () => ({ editor, disabled, readOnly }),
      [editor, disabled, readOnly],
    );

    return (
      <EditorContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-slot="rich-text-editor"
          data-disabled={disabled ? "" : undefined}
          data-readonly={readOnly ? "" : undefined}
          className={cn(
            "relative flex w-full flex-col overflow-hidden rounded-md border border-input shadow-xs transition-shadow",
            // The ring follows the text area, not the toolbar buttons beside it.
            "has-[.ProseMirror-focused]:border-ring has-[.ProseMirror-focused]:ring-3 has-[.ProseMirror-focused]:ring-ring/50",
            disabled && "cursor-not-allowed opacity-50",
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
