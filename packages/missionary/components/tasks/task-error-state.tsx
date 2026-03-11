"use client";

import * as React from "react";
import { motion } from "motion/react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@asym/ui/components/shadcn/button";

interface TaskErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function TaskErrorState({ message, onRetry }: TaskErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        Something went wrong
      </h3>

      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {message ||
          "We encountered an error loading your tasks. Please try again."}
      </p>

      <Button onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </motion.div>
  );
}
