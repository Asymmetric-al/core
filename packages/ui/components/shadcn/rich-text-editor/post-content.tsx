"use client";

import { SafeHtml } from "@asym/lib/components/safe-html";

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

  return <SafeHtml className={htmlClasses} html={value} />;
}
