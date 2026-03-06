"use client";

import {
  useEditor,
  EditorContent as TipTapEditorContent,
  type Editor,
} from "@tiptap/react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { defaultExtensions } from "./extensions";
import { parseContent } from "./helpers";
import { LinkBubbleMenu } from "./link-bubble-menu";
import "./tiptap.css";

interface EditorContextType {
  editor: Editor | null;
}

const EditorContext = React.createContext<EditorContextType | undefined>(
  undefined,
);

export function useEditorContext() {
  const context = React.useContext(EditorContext);
  if (!context) {
    throw new Error("Editor components must be used within <RichTextEditor>");
  }
  return context;
}

export interface RichTextEditorProps {
  /** Stored value — JSON string or legacy plain text. */
  value: string;
  /** Called with a JSON string whenever the content changes. */
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  children: React.ReactNode;
}

export function RichTextEditor({
  value,
  onChange,
  disabled,
  className,
  editorClassName,
  children,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: defaultExtensions,
    content: parseContent(value),
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[150px] p-4",
          "dark:prose-invert",
          editorClassName,
        ),
      },
    },
    immediatelyRender: false,
  });

  // Sync external value changes (e.g. form reset)
  React.useEffect(() => {
    if (!editor || !value) return;
    const parsed = parseContent(value);
    const current = editor.getJSON();

    if (typeof parsed === "object") {
      if (JSON.stringify(parsed) !== JSON.stringify(current)) {
        editor.commands.setContent(parsed);
      }
    } else {
      if (parsed !== editor.getText()) {
        editor.commands.setContent(parsed);
      }
    }
  }, [value, editor]);

  return (
    <EditorContext.Provider value={{ editor }}>
      <div
        className={cn(
          "relative w-full overflow-hidden flex flex-col border border-input rounded-lg",
          "ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        {children}
        <LinkBubbleMenu />
      </div>
    </EditorContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// EditorContent — renders the actual editable area
// ---------------------------------------------------------------------------
export function EditorContent({
  className,
  ...props
}: Omit<React.ComponentProps<typeof TipTapEditorContent>, "editor">) {
  const { editor } = useEditorContext();
  return (
    <TipTapEditorContent
      {...props}
      className={cn("flex-1", className)}
      editor={editor}
    />
  );
}
