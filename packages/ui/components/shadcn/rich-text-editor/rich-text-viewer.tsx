"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { parseContent } from "./helpers";

export interface RichTextViewerProps {
  /** Stored value — JSON string or legacy plain text / HTML. */
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
  }),
  Link.configure({
    openOnClick: true,
    HTMLAttributes: {
      class: "text-primary underline cursor-pointer",
      target: "_blank",
      rel: "noopener noreferrer",
    },
  }),
  Underline,
  Image.configure({
    HTMLAttributes: {
      class: "rounded-lg max-w-full h-auto shadow-md",
    },
  }),
];

export function RichTextViewer({ value, className }: RichTextViewerProps) {
  const editor = useEditor({
    extensions: viewerExtensions,
    content: value ? parseContent(value) : "",
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "tiptap prose prose-sm sm:prose-base max-w-none dark:prose-invert",
          className,
        ),
      },
    },
  });

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
    } else {
      editor.commands.setContent(parsed);
    }
  }, [value, editor]);

  if (!value) return null;

  return <EditorContent editor={editor} />;
}
