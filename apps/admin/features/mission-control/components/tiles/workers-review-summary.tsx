"use client";

import { TenantLink as Link } from "@asym/auth/tenant-navigation";
import { useUnreviewedWorkersCount } from "@asym/database/hooks";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { ChevronRight, ShieldAlert } from "lucide-react";

function workerCount(count: number) {
  return count === 1 ? "1 worker" : `${count} workers`;
}

export function WorkersReviewSummary() {
  const query = useUnreviewedWorkersCount();
  if (query.isError) {
    return (
      <div
        className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        role="status"
      >
        <span>Couldn&apos;t check workers&apos; security levels.</span>
        <Button variant="ghost" size="sm" onClick={() => void query.refetch()}>
          Retry
        </Button>
      </div>
    );
  }
  if (query.isPending || !query.data) return null;
  return (
    <Item
      variant="outline"
      size="sm"
      render={<Link href="/workers?review=unreviewed" />}
    >
      <ItemContent>
        <ItemTitle>
          <ShieldAlert aria-hidden="true" className="size-4 text-warning" />
          Security level unreviewed: {workerCount(query.data)}
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <ChevronRight
          aria-hidden="true"
          className="size-4 text-muted-foreground"
        />
      </ItemActions>
    </Item>
  );
}
