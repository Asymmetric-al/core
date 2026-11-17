"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { Paperclip, X } from "lucide-react";
import * as React from "react";
import { flushSync } from "react-dom";

import type { SupportAttachmentDraft } from "../../../models/editor-payload";

interface AttachmentChipsProps {
  attachments: SupportAttachmentDraft[];
  onAdd: (attachment: SupportAttachmentDraft) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

/**
 * Stub UI that stages SupportAttachmentDraft entries. The real upload
 * pipeline lands in a later phase; today we accept files via the file
 * picker and store the metadata locally so the SupportReplyPayload contract
 * stays exercised end-to-end.
 */
export function AttachmentChips({
  attachments,
  onAdd,
  onRemove,
  disabled,
}: AttachmentChipsProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const attachRef = React.useRef<HTMLButtonElement>(null);
  const chipsRef = React.useRef<HTMLDivElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      onAdd({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        // No real upload pipeline yet; we keep the file ref in URL form so a
        // later phase can swap this for a Resend / Supabase Storage upload.
        blobRef: `local:${crypto.randomUUID()}:${file.name}`,
      });
    }
  };

  // The removed chip takes its focused button with it; the next chip's
  // Remove (or the previous one, or Attach) takes the focus instead.
  const removeAt = (index: number, button: HTMLButtonElement) => {
    if (disabled) return;
    const hadFocus = document.activeElement === button;
    flushSync(() => onRemove(index));
    if (!hadFocus) return;
    const remaining = chipsRef.current?.querySelectorAll<HTMLButtonElement>(
      "[data-attachment-remove]",
    );
    const next = remaining?.item(Math.min(index, remaining.length - 1));
    (next ?? attachRef.current)?.focus();
  };

  return (
    <div ref={chipsRef} className="flex flex-wrap items-center gap-2">
      <Button
        ref={attachRef}
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <Paperclip aria-hidden="true" />
        Attach
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      {attachments.map((attachment, index) => (
        <span
          key={attachment.blobRef}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground",
          )}
        >
          <Paperclip className="size-3 text-muted-foreground" />
          <span className="max-w-40 truncate">{attachment.filename}</span>
          <span className="text-muted-foreground">
            {formatBytes(attachment.sizeBytes)}
          </span>
          <button
            type="button"
            aria-label={`Remove ${attachment.filename}`}
            // Not natively disabled: a send can start (mod+enter) while this
            // has focus, and a disabled button would drop it to the page.
            aria-disabled={disabled || undefined}
            data-attachment-remove=""
            onClick={(event) => removeAt(index, event.currentTarget)}
            className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}
