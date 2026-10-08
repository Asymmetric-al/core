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
      className="rounded-2xl border border-warning/20 bg-warning/5 p-4 shadow-sm ring-1 ring-warning/20"
      aria-label="Internal note"
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="size-7 border border-warning/20">
            <AvatarImage
              src={message.author.avatarUrl ?? undefined}
              alt={message.author.name}
            />
            <AvatarFallback className="text-xs font-semibold">
              {message.author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold text-warning">
            {message.author.name}
          </span>
          <Badge variant="warning">
            <Lock aria-hidden="true" />
            Internal note
          </Badge>
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {formatRelative(message.postedAt, nowIso)}
        </span>
      </header>
      <div className="mt-2 text-sm leading-relaxed text-foreground">
        <RichTextViewer value={renderableBody(message)} />
      </div>
    </article>
  );
}

function renderableBody(message: SupportMessage): string {
  return message.body.html?.trim() || message.body.text?.trim() || "";
}
