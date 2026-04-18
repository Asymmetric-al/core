"use client";

import { Avatar, AvatarFallback } from "@asym/ui/components/shadcn/avatar";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import { memo } from "react";

import type { LucideIcon } from "lucide-react";

export interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const QuickActionCard = memo(function QuickActionCard({
  icon: Icon,
  title,
  description,
  onAction,
  className,
}: QuickActionCardProps) {
  return (
    <Card
      className={cn(
        "group cursor-pointer shadow-none hover-lift hover:border-primary/50 hover:shadow-sm",
        className,
      )}
      onClick={onAction}
    >
      <CardContent className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center">
        <Avatar className="size-10 rounded-sm">
          <AvatarFallback className="bg-primary/10 text-primary shrink-0 rounded-sm">
            <Icon className="size-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-medium transition-colors group-hover:text-primary">
            {title}
          </h3>
          <p className="text-muted-foreground max-w-[180px] text-xs">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
