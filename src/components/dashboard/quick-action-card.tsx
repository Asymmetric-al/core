"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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
        "group cursor-pointer shadow-none transition-all hover:border-primary/50 hover:shadow-sm",
        className,
      )}
      onClick={onAction}
    >
      <CardContent className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center">
        <Avatar className="size-10 rounded-sm transition-transform group-hover:scale-105">
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
