"use client";

import { useLastSynced } from "@asym/lib/hooks";
import { motion } from "@asym/lib/motion";
import { Button } from "@asym/ui/components/shadcn/button";
import { Clock, Globe, Loader2, TriangleAlert } from "lucide-react";

import type { ElementType, ReactNode } from "react";

const smoothTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export function LastSyncedDisplay() {
  const lastSynced = useLastSynced();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
    >
      <Clock className="size-3.5" />
      {lastSynced ? `Last synced: ${lastSynced}` : "Syncing…"}
    </motion.div>
  );
}

export function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4 py-16 sm:py-24"
    >
      <Loader2 className="spinner-essential size-10 text-muted-foreground/30 sm:h-12 sm:w-12" />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50"
      >
        Loading Ministry Updates…
      </motion.p>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={smoothTransition}
      className="rounded-2xl border-2 border-dashed border-border bg-muted/20 py-20 text-center sm:rounded-3xl sm:py-32"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={springTransition}
        className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-card shadow-md sm:mb-6 sm:h-20 sm:w-20"
      >
        <Icon className="size-6 text-muted-foreground/30 sm:h-8 sm:w-8" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg font-semibold tracking-tight text-foreground sm:text-2xl"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-2 text-sm font-medium text-muted-foreground sm:text-base"
      >
        {description}
      </motion.p>
      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  );
}

export function FeedLoadErrorState({
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
