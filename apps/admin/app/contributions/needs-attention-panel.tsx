"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { AlertTriangle, ArrowRight } from "lucide-react";

import type { MissionControlNeedsAttentionGroup } from "@asym/database/hooks";

const URGENCY_CLASS_NAMES: Record<string, string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  normal: "border-zinc-200 bg-zinc-50 text-zinc-700",
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
    <section className="rounded-3xl border border-amber-100 bg-amber-50/60 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900">
              Needs Attention
            </h2>
            <Badge variant="secondary" className="rounded-full">
              {totalCount}
            </Badge>
          </div>
          <p className="mt-1 text-xs font-medium text-zinc-500">
            Contribution issues grouped by urgency and issue type.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {groups.slice(0, 3).map((group) => {
          const firstItem = group.items[0];
          return (
            <div
              key={group.key}
              className="rounded-2xl border border-white/70 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="outline"
                  className={
                    URGENCY_CLASS_NAMES[group.urgency] ??
                    URGENCY_CLASS_NAMES.normal
                  }
                >
                  {group.urgency}
                </Badge>
                <span className="text-xs font-semibold text-zinc-500">
                  {group.count} item{group.count === 1 ? "" : "s"}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-zinc-900">
                {group.title}
              </h3>
              {firstItem ? (
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                  {firstItem.summary}
                </p>
              ) : null}
              {firstItem?.contributionId ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3 h-8 px-0 text-xs font-semibold"
                  onClick={() => onOpenContribution(firstItem.contributionId!)}
                >
                  Open contribution
                  <ArrowRight className="ml-1 size-3" />
                </Button>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
