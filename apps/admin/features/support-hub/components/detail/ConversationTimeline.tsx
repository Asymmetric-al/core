"use client";

import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

import { ActivityEntry } from "./timeline/ActivityEntry";
import { EmailMessage } from "./timeline/EmailMessage";
import { EmptyTimeline } from "./timeline/EmptyTimeline";
import { mergeTimeline } from "./timeline/merge-timeline";
import { PrivateNote } from "./timeline/PrivateNote";
import { TimelineSeparator } from "./timeline/TimelineSeparator";
import { useSupportMessages } from "../../hooks/use-support-messages";
import { useSupportNow } from "../../lib/now";

interface ConversationTimelineProps {
  conversationId: string;
}

/**
 * Reverse-chronological-friendly timeline. The Phase 2 message hook returns
 * rows already sorted ascending by `postedAt`; we keep that order so the
 * composer at the bottom is always next to the most recent activity, like
 * Chatwoot's email view.
 */
export function ConversationTimeline({
  conversationId,
}: ConversationTimelineProps) {
  const { data, isLoading } = useSupportMessages(conversationId);
  const nowIso = useSupportNow();

  if (isLoading) {
    return <TimelineSkeleton />;
  }
  if (data.length === 0) {
    return <EmptyTimeline />;
  }

  const entries = mergeTimeline(data, { nowIso });

  return (
    <ol className="flex flex-col gap-3" aria-label="Conversation timeline">
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-col gap-2">
          {entry.isFirstOfDay ? (
            <TimelineSeparator label={entry.dayLabel} />
          ) : null}
          {renderEntry(entry.kind, entry.message)}
        </li>
      ))}
    </ol>
  );
}

function renderEntry(
  kind: ReturnType<typeof mergeTimeline>[number]["kind"],
  message: Parameters<typeof EmailMessage>[0]["message"],
) {
  switch (kind) {
    case "email":
    case "draft":
      return <EmailMessage message={message} />;
    case "note":
      return <PrivateNote message={message} />;
    case "activity":
      return (
        <ul className="m-0 list-none p-0">
          <ActivityEntry message={message} />
        </ul>
      );
    default: {
      const _exhaustive: never = kind;
      void _exhaustive;
      return null;
    }
  }
}

function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-5 w-20 rounded-md" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}
