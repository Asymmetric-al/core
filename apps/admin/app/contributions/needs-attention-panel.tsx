"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { AlertTriangle, ArrowRight } from "lucide-react";

import type { MissionControlNeedsAttentionGroup } from "@asym/database/hooks";
import type * as React from "react";

const urgencyBadgeVariant: Record<
  string,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  critical: "destructive",
  high: "secondary",
  normal: "outline",
};

export function ContributionNeedsAttentionPanel({
  groups,
  onOpenContribution,
}: {
  groups: MissionControlNeedsAttentionGroup[];
  onOpenContribution: (contributionId: string) => void;
}) {
  if (groups.length === 0) {
    return null;
  }

  const totalCount = groups.reduce((sum, group) => sum + group.count, 0);

  return (
    <Alert className="rounded-3xl p-5 shadow-sm">
      <AlertTriangle />
      <AlertTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em]">
        Needs Attention
        <Badge variant="secondary" className="rounded-full">
          {totalCount}
        </Badge>
      </AlertTitle>
      <AlertDescription className="text-xs font-medium">
        Contribution issues grouped by urgency and issue type.
      </AlertDescription>

      <div className="col-span-full mt-4 grid gap-3 lg:grid-cols-3">
        {groups.slice(0, 3).map((group) => {
          const firstItem = group.items[0];
          return (
            <Card key={group.key} className="rounded-2xl">
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={
                      urgencyBadgeVariant[group.urgency] ??
                      urgencyBadgeVariant.normal
                    }
                  >
                    {group.urgency}
                  </Badge>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {group.count} item{group.count === 1 ? "" : "s"}
                  </span>
                </div>
                <CardTitle className="text-sm">{group.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {firstItem ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {firstItem.summary}
                  </p>
                ) : null}
                {firstItem?.contributionId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-3 h-8 px-0 text-xs font-semibold"
                    onClick={() =>
                      onOpenContribution(firstItem.contributionId!)
                    }
                  >
                    Open contribution
                    <ArrowRight data-icon="inline-end" />
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Alert>
  );
}
