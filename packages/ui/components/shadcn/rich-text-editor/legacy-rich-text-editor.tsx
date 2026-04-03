"use client";

import { createBrowserClient } from "@asym/database/supabase";
import * as React from "react";
import { toast } from "sonner";

import { cn } from "@asym/ui/lib/utils";

import { EditorContent, EditorRoot } from "./rich-text-editor";
import { EditorToolbar } from "./toolbar";

export interface LegacyRichTextEditorProps {
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

/**
 * Back-compat wrapper: same props as the old single-file editor, built on the
 * compound TipTap editor (JSON storage).
 */
export function LegacyRichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  contentClassName,
  disabled,
  toolbarPosition = "top",
  actions,
  onImageClick,
  proseInvert = true,
}: LegacyRichTextEditorProps) {
  const onImageUpload = React.useMemo(() => {
    if (onImageClick) return undefined;
    return async (file: File) => {
      const supabase = createBrowserClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `editor/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("document-uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("document-uploads").getPublicUrl(filePath);

      toast.success("Image uploaded successfully");
      return publicUrl;
    };
  }, [onImageClick]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden flex flex-col",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <EditorRoot
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        proseInvert={proseInvert}
        editorClassName={contentClassName}
        className="border-0 shadow-none ring-0 focus-within:ring-0 rounded-none ring-offset-0"
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
            onImageUpload={onImageUpload}
            onImageClick={onImageClick}
            actions={actions}
          />
        )}
      </EditorRoot>
    </div>
  );
}
