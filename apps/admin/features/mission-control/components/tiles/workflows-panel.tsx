"use client";

import { useMC } from "@asym/lib/mission-control/context";
import { resolveMissionControlHref } from "@asym/lib/mission-control/routes";
import { TILES, WORKFLOWS } from "@asym/lib/mission-control/tiles";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import Link from "next/link";
import { useId } from "react";

import { ChevronRight } from "../icons";

export function WorkflowsPanel() {
  const { role } = useMC();
  const headingId = useId();
  const permittedTiles = new Set(
    TILES.filter(
      (tile) => tile.roles.includes(role) && !tile.unavailableReason,
    ).map((tile) => tile.id),
  );
  const workflows = WORKFLOWS.filter((workflow) =>
    permittedTiles.has(workflow.primaryTile),
  );
  if (workflows.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="text-lg font-semibold text-foreground">
          Common tasks
        </h2>
        <p className="text-sm text-muted-foreground">
          Where each kind of work starts for your role.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {workflows.map((workflow) => (
          <Item
            key={workflow.id}
            variant="outline"
            size="sm"
            render={<Link href={resolveMissionControlHref(workflow.route)} />}
          >
            <ItemContent className="min-w-0 self-start">
              <ItemTitle>{workflow.title}</ItemTitle>
              <ItemDescription className="line-clamp-none">
                {workflow.description}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRight
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
            </ItemActions>
          </Item>
        ))}
      </div>
    </section>
  );
}
