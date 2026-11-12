"use client";

import { useMissionControlNeedsAttention } from "@asym/database/hooks";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { ChevronRight, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useId } from "react";

import { attentionUrgency } from "../../needs-attention/attention-vocabulary";

const SHOWN_GROUPS = 3;

function itemCount(count: number) {
  return count === 1 ? "1 item" : `${count} items`;
}

export function NeedsAttentionSummary() {
  const headingId = useId();
  const query = useMissionControlNeedsAttention();
  if (query.isError) {
    return (
      <div
        className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        role="status"
      >
        <span>Couldn&apos;t check Needs attention.</span>
        <Button variant="ghost" size="sm" onClick={() => void query.refetch()}>
          Retry
        </Button>
      </div>
    );
  }
  if (query.isLoading) return null;
  const groups = query.data?.groups ?? [];
  const total = groups.reduce((sum, group) => sum + group.count, 0);
  if (total === 0) return null;

  const shown = groups.slice(0, SHOWN_GROUPS);
  const more = groups.length > shown.length;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2
          id={headingId}
          className="flex items-center gap-2 text-lg font-semibold text-foreground"
        >
          <TriangleAlert aria-hidden="true" className="size-4 text-warning" />
          Needs attention
        </h2>
        <p className="text-sm text-muted-foreground">
          {itemCount(total)} in Contributions.{" "}
          {more
            ? `The ${shown.length} most urgent of ${groups.length} kinds are listed.`
            : "Most urgent first."}
        </p>
        <p className="text-xs text-muted-foreground">
          Based on up to 100 most recently seen open items; totals may be
          incomplete.
        </p>
      </div>
      <ul className="grid gap-2 md:grid-cols-3">
        {shown.map((group) => {
          const badge = attentionUrgency(group.urgency);
          return (
            <li key={group.key}>
              <Item
                variant="outline"
                size="sm"
                render={
                  <Link
                    href={`/contributions?attention=${encodeURIComponent(group.key)}`}
                  />
                }
              >
                <ItemContent className="min-w-0">
                  <ItemTitle>
                    {group.title}
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </ItemTitle>
                  <ItemDescription>{itemCount(group.count)}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                </ItemActions>
              </Item>
            </li>
          );
        })}
      </ul>
      <Item variant="outline" size="sm" render={<Link href="/contributions" />}>
        <ItemContent>
          <ItemTitle>Review in Contributions</ItemTitle>
          <ItemDescription>Open the follow-up queue.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
        </ItemActions>
      </Item>
    </section>
  );
}
