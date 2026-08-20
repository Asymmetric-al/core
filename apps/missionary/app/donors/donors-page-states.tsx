"use client";

import { motion } from "@asym/lib/motion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";

import { fadeInUp, smoothTransition } from "./donors-page-motion";

export function DonorListSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading partners"
      className="p-3 space-y-2"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-zinc-100"
        >
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      {...fadeInUp}
      transition={smoothTransition}
      className="flex flex-col items-center justify-center h-64 text-center p-6 gap-4"
    >
      <Alert variant="destructive" role="alert" className="max-w-sm text-left">
        <AlertCircle />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-9 rounded-2xl border-zinc-200 bg-white text-[10px] font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
        >
          <RefreshCw data-icon="inline-start" />
          Try Again
        </Button>
      </motion.div>
    </motion.div>
  );
}
