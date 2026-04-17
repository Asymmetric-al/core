"use client";

import { SafeHtml } from "@asym/lib/components/safe-html";
import { renderToReactElement } from "@tiptap/static-renderer";
import * as React from "react";

import { viewerExtensions } from "./extensions";
import { parseContent } from "./helpers";

import { cn } from "@/lib/utils";
import "./tiptap.css";

export interface RichTextViewerProps {
  /** Stored value — JSON string or legacy plain text / HTML. */
  value: string;
  className?: string;
}

export function RichTextViewer({ value, className }: RichTextViewerProps) {
  const content = React.useMemo(() => parseContent(value), [value]);
  const contentClassName = cn(
    "tiptap prose prose-sm sm:prose-base max-w-none dark:prose-invert",
    className,
  );
  const renderedContent = React.useMemo(() => {
    if (typeof content !== "object") {
      return null;
    }

    return renderToReactElement({
      content,
      extensions: viewerExtensions,
    });
  }, [content]);

  if (!value) return null;

  if (typeof content !== "object") {
    return <SafeHtml className={contentClassName} html={content} />;
  }

  return <div className={contentClassName}>{renderedContent}</div>;
}
