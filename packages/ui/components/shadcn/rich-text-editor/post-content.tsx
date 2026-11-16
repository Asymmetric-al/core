"use client";

import { SafeHtml } from "@asym/lib/components/safe-html";

import { cn } from "@asym/ui/lib/utils";

import { isRichText } from "./helpers";
import { RichTextViewer } from "./rich-text-viewer";

export interface PostContentProps {
  value: string;
  richTextClassName?: string;
  htmlClassName?: string;
}

export function PostContent({
  value,
  richTextClassName,
  htmlClassName,
}: PostContentProps) {
  if (!value) return null;

  const richTextClasses = richTextClassName ?? htmlClassName;
  const htmlClasses = htmlClassName ?? richTextClassName;

  if (isRichText(value)) {
    return <RichTextViewer value={value} className={richTextClasses} />;
  }

  // Older posts stored as HTML get the same typography as rich text.
  return (
    <SafeHtml
      className={cn(
        "tiptap prose prose-sm sm:prose-base max-w-none dark:prose-invert",
        htmlClasses,
      )}
      html={value}
    />
  );
}
