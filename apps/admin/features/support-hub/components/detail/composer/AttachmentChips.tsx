"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { Paperclip, X } from "lucide-react";
import * as React from "react";

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

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      onAdd({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        // No real upload pipeline yet; we keep the file ref in URL form so a
        // later phase can swap this for a Resend / Supabase Storage upload.
        blobRef: `local:${file.name}`,
      });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="h-8 gap-1.5 rounded-lg border-zinc-200 px-2 text-xs font-medium text-zinc-600"
      >
        <Paperclip className="size-3.5" />
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
          key={`${attachment.filename}-${index}`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700",
          )}
        >
          <Paperclip className="size-3 text-zinc-400" />
          <span className="max-w-[160px] truncate">{attachment.filename}</span>
          <span className="text-zinc-400">
            {formatBytes(attachment.sizeBytes)}
          </span>
          <button
            type="button"
            aria-label={`Remove ${attachment.filename}`}
            onClick={() => onRemove(index)}
            className="rounded-sm p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
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
