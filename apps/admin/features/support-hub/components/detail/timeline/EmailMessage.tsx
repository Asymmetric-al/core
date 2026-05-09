"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { RichTextViewer } from "@asym/ui/components/shadcn/rich-text-editor";
import { cn } from "@asym/ui/lib/utils";
import { Paperclip, Save } from "lucide-react";

import { useSupportNow } from "../../../lib/now";
import { formatRelative } from "../../../lib/time";

import type {
  SupportMessage,
  SupportMessageDeliveryState,
} from "../../../types";

interface EmailMessageProps {
  message: SupportMessage;
}

const DELIVERY_TONES: Partial<
  Record<SupportMessageDeliveryState, { tone: string; label: string }>
> = {
  draft: {
    tone: "border-amber-200 bg-amber-50 text-amber-700",
    label: "Draft",
  },
  queued: {
    tone: "border-zinc-200 bg-zinc-100 text-zinc-700",
    label: "Queued",
  },
  sending: {
    tone: "border-zinc-200 bg-zinc-100 text-zinc-700",
    label: "Sending",
  },
  sent: { tone: "border-zinc-200 bg-zinc-100 text-zinc-700", label: "Sent" },
  delivered: {
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    label: "Delivered",
  },
  bounced: {
    tone: "border-rose-200 bg-rose-50 text-rose-700",
    label: "Bounced",
  },
  failed: { tone: "border-rose-200 bg-rose-50 text-rose-700", label: "Failed" },
};

/**
 * Inbound or outbound email rendering. Inbound = neutral left accent;
 * outbound = emerald left accent so agents can scan threads quickly. Drafts
 * use an amber tint and never surface as "delivered" content.
 */
export function EmailMessage({ message }: EmailMessageProps) {
  const nowIso = useSupportNow();
  const isOutbound = message.direction === "outbound";
  const isDraft = message.deliveryState === "draft";
  const headers = message.emailHeaders;

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white shadow-sm",
        isDraft
          ? "border-amber-200 bg-amber-50/40"
          : isOutbound
            ? "border-zinc-100 border-l-2 border-l-emerald-200"
            : "border-zinc-100 border-l-2 border-l-zinc-200",
      )}
      aria-label={
        isDraft
          ? "Draft reply"
          : isOutbound
            ? "Outbound email"
            : "Inbound email"
      }
    >
      <header className="flex flex-wrap items-start gap-3 border-b border-zinc-100 px-4 py-3">
        <Avatar className="size-9 border border-zinc-100">
          <AvatarImage
            src={message.author.avatarUrl ?? undefined}
            alt={message.author.name}
          />
          <AvatarFallback className="text-[11px] font-semibold">
            {message.author.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-zinc-900">
            <span className="font-semibold">{message.author.name}</span>
            {message.author.email ? (
              <span className="text-[11px] text-zinc-500">
                &lt;{message.author.email}&gt;
              </span>
            ) : null}
            {isDraft ? (
              <Badge
                variant="outline"
                className="h-5 gap-1 rounded-md border-amber-200 bg-amber-100 px-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800"
              >
                <Save className="size-3" />
                Draft
              </Badge>
            ) : null}
            {!isDraft && DELIVERY_TONES[message.deliveryState] ? (
              <Badge
                variant="outline"
                className={cn(
                  "h-5 rounded-md px-1.5 text-[10px] font-bold uppercase tracking-wider",
                  DELIVERY_TONES[message.deliveryState]?.tone,
                )}
              >
                {DELIVERY_TONES[message.deliveryState]?.label}
              </Badge>
            ) : null}
          </div>
          {headers ? (
            <p className="mt-0.5 truncate text-[11px] text-zinc-500">
              to {headers.to.join(", ")}
              {headers.cc.length > 0 ? ` · cc ${headers.cc.join(", ")}` : null}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-zinc-400">
          {formatRelative(message.postedAt, nowIso)}
        </span>
      </header>

      <div className="px-4 py-3">
        <RichTextViewer value={renderableBody(message)} />
      </div>

      {message.attachments.length > 0 ? (
        <footer className="flex flex-wrap items-center gap-2 border-t border-zinc-100 px-4 py-2">
          {message.attachments.map((attachment) => (
            <span
              key={attachment.id}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700"
            >
              <Paperclip className="size-3 text-zinc-400" />
              <span className="max-w-[200px] truncate">
                {attachment.filename}
              </span>
            </span>
          ))}
        </footer>
      ) : null}
    </article>
  );
}

function renderableBody(message: SupportMessage): string {
  const html = message.body.html?.trim();
  if (html) return html;
  const text = message.body.text?.trim();
  if (text) return text;
  return "";
}
