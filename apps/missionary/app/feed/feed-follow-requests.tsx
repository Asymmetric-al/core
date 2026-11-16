"use client";

import { TimeAgo } from "@asym/lib/hooks";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useId, useRef, useState } from "react";

import type { FollowerRequest } from "./feed-model";

function RequestRow({
  request,
  onResolve,
}: {
  request: FollowerRequest;
  onResolve: (request: FollowerRequest, approved: boolean) => Promise<void>;
}) {
  const [pending, setPending] = useState<"accept" | "decline" | null>(null);
  const nameId = useId();
  // The page removes the row as soon as it asks the server, and puts it
  // back if the server refuses, so this only guards double clicks.
  const resolve = async (approved: boolean) => {
    if (pending) return;
    setPending(approved ? "accept" : "decline");
    await onResolve(request, approved);
    setPending(null);
  };

  return (
    <li
      aria-labelledby={nameId}
      className="flex gap-3 py-3 first:pt-0 last:pb-0"
    >
      <Avatar>
        {request.avatar_url ? (
          <AvatarImage src={request.avatar_url} alt="" />
        ) : null}
        <AvatarFallback>{request.initials}</AvatarFallback>
      </Avatar>
      {/* Name and actions share one column beside the avatar: long names
          wrap in full and the buttons stay lined up underneath. */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <p
            id={nameId}
            className="text-sm font-medium text-foreground wrap-break-word"
          >
            {request.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {request.is_donor ? "Gives to you · Asked " : "Asked "}
            <TimeAgo date={request.created_at} />
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            size="sm"
            variant="secondary"
            disabled={pending !== null}
            onClick={() => void resolve(true)}
            aria-label={`Accept ${request.name}`}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending !== null}
            onClick={() => void resolve(false)}
            aria-label={`Decline ${request.name}`}
          >
            Decline
          </Button>
        </div>
      </div>
    </li>
  );
}

function waitingSummary(count: number) {
  return count === 1
    ? "1 person is waiting for your answer."
    : `${count} people are waiting for your answer.`;
}

/** People asking to follow the missionary's updates. */
export function FollowerRequestsCard({
  pendingRequests,
  isLoadingRequests,
  loadFailed = false,
  onRetry,
  onResolveRequest,
}: {
  pendingRequests: FollowerRequest[];
  isLoadingRequests: boolean;
  /** The list couldn't be loaded: shown as an error, never as "no one". */
  loadFailed?: boolean;
  onRetry?: () => void;
  onResolveRequest: (id: string, approved: boolean) => Promise<void>;
}) {
  const titleId = useId();
  const panelId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Phones show a short summary between the composer and the feed and open
  // the list on request; wide screens always show it in the side column,
  // so the toggle and the collapse are phone-only CSS.
  const [expanded, setExpanded] = useState(false);
  const count = pendingRequests.length;
  const hasRequests = !isLoadingRequests && !loadFailed && count > 0;
  const isEmpty = !isLoadingRequests && !loadFailed && count === 0;

  // The resolved row leaves the list as soon as the page asks the server,
  // so focus moves on the next frame to the request that takes its place
  // (or the heading when none are left), without waiting for the answer.
  const resolve = async (request: FollowerRequest, approved: boolean) => {
    const index = pendingRequests.findIndex((item) => item.id === request.id);
    const answered = onResolveRequest(request.id, approved);
    requestAnimationFrame(() => {
      const rows = listRef.current?.querySelectorAll("li") ?? [];
      const next = rows[Math.min(index, rows.length - 1)];
      const target = next?.querySelector("button") ?? headingRef.current;
      target?.focus();
    });
    await answered;
  };
  return (
    <Card role="region" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle>
          <h2
            id={titleId}
            ref={headingRef}
            tabIndex={-1}
            className="outline-none"
          >
            Follow requests
          </h2>
        </CardTitle>
        <CardDescription>
          {hasRequests
            ? waitingSummary(count)
            : isEmpty
              ? "No one is waiting. New requests will show up here."
              : "People who asked to see your updates."}
        </CardDescription>
        {hasRequests ? (
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setExpanded((open) => !open)}
            >
              {expanded ? "Hide " : "Review "}
              <span className="sr-only">requests</span>
              {expanded ? (
                <ChevronUp data-icon="inline-end" aria-hidden />
              ) : (
                <ChevronDown data-icon="inline-end" aria-hidden />
              )}
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      {isEmpty ? null : (
        <div
          id={panelId}
          // Phones keep loading to the one-line summary too, so the feed
          // below doesn't jump when the requests arrive.
          className={cn(
            ((hasRequests && !expanded) || isLoadingRequests) &&
              "hidden lg:block",
          )}
        >
          <CardContent>
            {isLoadingRequests ? (
              <div className="flex flex-col gap-3" aria-busy="true">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : loadFailed ? (
              <div className="flex flex-col items-start gap-3">
                <p role="alert" className="text-sm text-foreground">
                  We couldn’t load follow requests.
                </p>
                {onRetry ? (
                  <Button variant="outline" size="sm" onClick={onRetry}>
                    Try again
                  </Button>
                ) : null}
              </div>
            ) : (
              <ul
                ref={listRef}
                className="flex flex-col divide-y divide-border"
              >
                {pendingRequests.map((request) => (
                  <RequestRow
                    key={request.id}
                    request={request}
                    onResolve={resolve}
                  />
                ))}
              </ul>
            )}
          </CardContent>
        </div>
      )}
    </Card>
  );
}
