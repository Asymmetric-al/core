"use client";

import { motion } from "@asym/lib/motion";
import { Button } from "@asym/ui/components/shadcn/button";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";

import {
  fadeInUp,
  smoothTransition,
  springTransition,
} from "./donors-page-motion";

export function DonorListSkeleton() {
  return (
    <div className="p-3 space-y-2">
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
      className="flex flex-col items-center justify-center h-64 text-center p-6"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={springTransition}
        className="size-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 border border-rose-100"
      >
        <AlertCircle className="size-7 text-rose-500" />
      </motion.div>
      <p className="text-sm font-semibold text-zinc-900 mb-1">
        Something went wrong
      </p>
      <p className="text-xs text-zinc-500 mb-4">{message}</p>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-9 rounded-2xl border-zinc-200 bg-white text-[10px] font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
        >
          <RefreshCw className="size-3.5 mr-2" />
          Try Again
        </Button>
      </motion.div>
    </motion.div>
  );
}
