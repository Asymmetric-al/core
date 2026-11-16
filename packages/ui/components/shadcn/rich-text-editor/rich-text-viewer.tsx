"use client";

import { SafeHtml } from "@asym/lib/components/safe-html";
import { renderToReactElement } from "@tiptap/static-renderer";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { viewerExtensions } from "./extensions";
import { parseContent } from "./helpers";

import "./tiptap.css";

export interface RichTextViewerProps {
  /** Stored value — JSON string or legacy plain text / HTML. */
  value: string;
  className?: string;
  /**
   * Type scale. `responsive` (default) grows from small to base type at the
   * `sm` breakpoint; `sm` stays small for dense lists such as timelines.
   */
  size?: "responsive" | "sm";
}

export function RichTextViewer({
  value,
  className,
  size = "responsive",
}: RichTextViewerProps) {
  const content = React.useMemo(() => parseContent(value), [value]);
  const contentClassName = cn(
    "tiptap prose prose-sm max-w-none dark:prose-invert",
    size === "responsive" && "sm:prose-base",
    className,
  );
  const renderedContent = React.useMemo(() => {
    if (typeof content !== "object") {
      return null;
    }

    try {
      return renderToReactElement({
        content,
        extensions: viewerExtensions,
      });
    } catch {
      return null;
    }
  }, [content]);

  if (!value) return null;

  if (typeof content !== "object") {
    return <SafeHtml className={contentClassName} html={content} />;
  }

  return <div className={contentClassName}>{renderedContent}</div>;
}
