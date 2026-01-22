"use client";

import type { ReactNode } from "react";
import { X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@asym/ui/components/shadcn/button";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import { cn } from "@asym/lib/utils";

interface DetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  fullPageHref?: string;
  children: ReactNode;
  className?: string;
}

export function DetailsDrawer({
  open,
  onClose,
  title,
  fullPageHref,
  children,
  className,
}: DetailsDrawerProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "flex h-full w-96 flex-col border-l border-border bg-background",
        className,
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          {title && <h2 className="font-semibold">{title}</h2>}
        </div>
        <div className="flex items-center gap-1">
          {fullPageHref && (
            <Link href={fullPageHref}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">{children}</div>
      </ScrollArea>
    </div>
  );
}
