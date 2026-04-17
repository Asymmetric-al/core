"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { RichTextViewer } from "@asym/ui/components/shadcn/rich-text-editor";
import { Lock } from "lucide-react";

import { useSupportNow } from "../../../lib/now";
import { formatRelative } from "../../../lib/time";

import type { SupportMessage } from "../../../types";

interface PrivateNoteProps {
  message: SupportMessage;
}

/**
 * Internal collaboration note. Yellow tint + "Internal note" pill so the
 * agent always knows the donor never sees this content.
 */
export function PrivateNote({ message }: PrivateNoteProps) {
  const nowIso = useSupportNow();
  return (
    <article
      className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 shadow-sm ring-1 ring-amber-100"
      aria-label="Internal note"
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="size-7 border border-amber-100">
            <AvatarImage
              src={message.author.avatarUrl ?? undefined}
              alt={message.author.name}
            />
            <AvatarFallback className="text-[10px] font-semibold">
              {message.author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[12px] font-semibold text-amber-900">
            {message.author.name}
          </span>
          <Badge
            variant="outline"
            className="h-5 gap-1 rounded-md border-amber-300 bg-amber-100 px-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800"
          >
            <Lock className="size-3" />
            Internal note
          </Badge>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-amber-700/70">
          {formatRelative(message.postedAt, nowIso)}
        </span>
      </header>
      <div className="mt-2 text-[13px] leading-relaxed text-amber-950">
        <RichTextViewer value={renderableBody(message)} />
      </div>
    </article>
  );
}

function renderableBody(message: SupportMessage): string {
  return message.body.html?.trim() || message.body.text?.trim() || "";
}
