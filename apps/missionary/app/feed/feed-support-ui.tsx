"use client";

import { useLastSynced } from "@asym/lib/hooks";
import { motion } from "@asym/lib/motion";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Clock, Globe, TriangleAlert } from "lucide-react";

import type { ElementType, ReactNode } from "react";

export function LastSyncedDisplay() {
  const lastSynced = useLastSynced();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="flex items-center gap-2 text-xs text-muted-foreground"
    >
      <Clock className="size-3.5" />
      {lastSynced ? `Last synced: ${lastSynced}` : "Syncing…"}
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading Ministry Updates"
      className="flex flex-col gap-4"
    >
      <span className="sr-only">Loading Ministry Updates…</span>
      {[0, 1].map((index) => (
        <Card key={index}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ElementType;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon aria-hidden />
        </EmptyMedia>
        <EmptyTitle role="heading" aria-level={3}>
          {title}
        </EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}

function FeedLoadErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert">
      <EmptyState
        icon={TriangleAlert}
        title="Couldn't load your feed"
        description={message}
        action={
          onRetry ? (
            <Button type="button" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          ) : null
        }
      />
    </div>
  );
}

export function PublishedFeedPane({
  children,
  feedError,
  hasPosts,
  isLoading,
  onRetry,
}: {
  children: ReactNode;
  feedError: string | null;
  hasPosts: boolean;
  isLoading: boolean;
  onRetry?: () => void;
}) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (hasPosts) {
    return children;
  }

  if (feedError) {
    return <FeedLoadErrorState message={feedError} onRetry={onRetry} />;
  }

  return (
    <EmptyState
      icon={Globe}
      title="Your feed is empty"
      description="Start sharing your journey with your partners."
    />
  );
}
