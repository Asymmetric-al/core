"use client";

import {
  Dialog as SharedDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { cn } from "@asym/ui/lib/utils";

import type { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  hideClose?: boolean;
  padding?: boolean;
}

export function Dialog({
  open,
  onOpenChange,
  children,
  className,
  hideClose,
  padding = true,
}: DialogProps) {
  return (
    <SharedDialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "rounded-2xl shadow-xl",
          !padding && "max-w-full",
          className,
        )}
        showCloseButton={!hideClose}
      >
        {children}
      </DialogContent>
    </SharedDialog>
  );
}

export { DialogHeader, DialogTitle };
