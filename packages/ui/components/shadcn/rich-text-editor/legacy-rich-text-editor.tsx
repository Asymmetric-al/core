"use client";

import { createBrowserClient } from "@asym/database/supabase";
import * as React from "react";
import { toast } from "sonner";

import { cn } from "@asym/ui/lib/utils";

import { EditorContent, EditorRoot } from "./rich-text-editor";
import { EditorToolbar } from "./toolbar";

export interface LegacyRichTextEditorProps {
  "aria-label"?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  /** Shared feed-composer density and shape, without consumer appearance overrides. */
  variant?: "default" | "feed";
  disabled?: boolean;
  readOnly?: boolean;
  toolbarPosition?: "top" | "bottom";
  actions?: React.ReactNode;
  onImageClick?: () => void;
  /** Turns on inline image upload through /api/upload/editor-image (#2407). */
  imagePurpose?: EditorImagePurpose;
  proseInvert?: boolean;
}

export type EditorImagePurpose = "feed" | "care-thread" | "care-note";

/**
 * Back-compat wrapper: same props as the old single-file editor, built on the
 * compound TipTap editor (JSON storage).
 */
export function LegacyRichTextEditor({
  "aria-label": ariaLabel,
  value,
  onChange,
  placeholder,
  className,
  contentClassName,
  variant = "default",
  disabled,
  readOnly,
  toolbarPosition = "top",
  actions,
  onImageClick,
  imagePurpose,
  proseInvert = true,
}: LegacyRichTextEditorProps) {
  const onImageUpload = React.useMemo(() => {
    if (onImageClick || !imagePurpose) return undefined;
    return async (file: File) => {
      const {
        data: { session },
      } = await createBrowserClient().auth.getSession();
      if (!session?.access_token) throw new Error("No session token");

      const body = new FormData();
      body.append("file", file);
      body.append("purpose", imagePurpose);
      const response = await fetch("/api/upload/editor-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body,
      });
      const data = (await response.json().catch(() => ({}))) as {
        url?: unknown;
        error?: unknown;
      };
      if (!response.ok || typeof data.url !== "string") {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to upload image",
        );
      }

      toast.success("Image uploaded successfully");
      return data.url;
    };
  }, [onImageClick, imagePurpose]);

  return (
    <div
      className={cn(
        "relative flex w-full flex-col",
        variant === "feed" && "overflow-hidden rounded-xl sm:rounded-2xl",
        className,
      )}
    >
      <EditorRoot
        aria-label={ariaLabel}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        proseInvert={proseInvert}
        variant={variant}
        editorClassName={contentClassName}
        // The feed composer's card is the field's frame, so the editor drops
        // its own border and focus ring there; elsewhere it keeps the input look.
        className={
          variant === "feed"
            ? "rounded-none border-0 shadow-none has-[.ProseMirror-focused]:ring-0"
            : undefined
        }
      >
        {toolbarPosition === "top" && (
          <EditorToolbar
            onImageUpload={onImageUpload}
            onImageClick={onImageClick}
            actions={actions}
          />
        )}
        <EditorContent />
        {toolbarPosition === "bottom" && (
          <EditorToolbar
            position="bottom"
            onImageUpload={onImageUpload}
            onImageClick={onImageClick}
            actions={actions}
          />
        )}
      </EditorRoot>
    </div>
  );
}
