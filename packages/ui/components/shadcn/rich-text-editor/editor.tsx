"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { extensions } from "./extensions";
import { EditorToolbar } from "./toolbar";
import { cn } from "@asym/ui/lib/utils";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  toolbarPosition?: "top" | "bottom";
  actions?: React.ReactNode;
  onImageClick?: () => void;
  proseInvert?: boolean;
}

export function Editor({
  value,
  onChange,

  className,
  contentClassName,
  disabled,
  toolbarPosition = "top",
  actions,
  onImageClick,
  proseInvert = true,
}: EditorProps) {
  const editor = useEditor({
    extensions,
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[150px] p-4",
          proseInvert && "dark:prose-invert",
          contentClassName,
        ),
      },
    },
    immediatelyRender: false,
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden flex flex-col",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {toolbarPosition === "top" && (
        <EditorToolbar
          editor={editor}
          actions={actions}
          onImageClick={onImageClick}
        />
      )}
      <EditorContent editor={editor} className="flex-1" />
      {toolbarPosition === "bottom" && (
        <EditorToolbar
          editor={editor}
          actions={actions}
          onImageClick={onImageClick}
        />
      )}
    </div>
  );
}
