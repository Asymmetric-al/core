"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { cn } from "@asym/ui/lib/utils";

import { parseContent } from "./helpers";

export interface RichTextViewerProps {
  /** Stored value — JSON string or legacy plain text. */
  value: string;
  className?: string;
}

const viewerExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2] },
    bulletList: {
      HTMLAttributes: { class: "list-disc pl-4 space-y-1" },
    },
    orderedList: {
      HTMLAttributes: { class: "list-decimal pl-4 space-y-1" },
    },
    blockquote: {
      HTMLAttributes: { class: "border-l-4 border-primary pl-4 italic" },
    },
    link: {
      openOnClick: true,
      HTMLAttributes: {
        class: "text-primary underline cursor-pointer",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    },
    underline: {},
  }),
];

export function RichTextViewer({ value, className }: RichTextViewerProps) {
  const editor = useEditor({
    extensions: viewerExtensions,
    content: parseContent(value),
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base max-w-none dark:prose-invert",
          className,
        ),
      },
    },
  });

  // Sync when value changes externally
  if (editor) {
    const parsed = parseContent(value);
    const current = editor.getJSON();
    if (typeof parsed === "object") {
      if (JSON.stringify(parsed) !== JSON.stringify(current)) {
        editor.commands.setContent(parsed);
      }
    }
  }

  if (!value) return null;

  return <EditorContent editor={editor} />;
}
