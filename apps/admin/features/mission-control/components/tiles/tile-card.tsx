"use client";

import { insideForRole, quickActionsForRole } from "@asym/config/tiles";
import { useMC } from "@asym/lib/mission-control/context";
import { resolveMissionControlHref } from "@asym/lib/mission-control/routes";
import { ButtonLink } from "@asym/ui/components/shadcn/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import Link from "next/link";

import { ChevronRight, DynamicIcon } from "../icons";

import type { Tile } from "@asym/lib/mission-control/types";

interface TileCardProps {
  tile: Tile;
}

// Keeps " · " separators on the preceding feature so wrapped lines never start with "·".
const FEATURE_SEPARATOR = " · ";
const ATTACHED_FEATURE_SEPARATOR = " · ";

function distinctShortcuts(
  tile: Tile,
  role: Parameters<typeof quickActionsForRole>[1],
) {
  const seen = new Set([resolveMissionControlHref(tile.route)]);
  return quickActionsForRole(tile, role).flatMap((action) => {
    const href = resolveMissionControlHref(action.href);
    if (seen.has(href)) return [];
    seen.add(href);
    return [{ ...action, href }];
  });
}

export function TileCard({ tile }: TileCardProps) {
  const { role } = useMC();
  const shortcuts = distinctShortcuts(tile, role);
  return (
    // The directory is a grid of ~350px cards, so the shortcuts always take
    // their own row: beside the text they squeezed it to a word per line.
    <Item render={<li />} variant="outline" size="sm">
      <ItemMedia variant="icon">
        <DynamicIcon name={tile.icon} aria-hidden="true" />
      </ItemMedia>
      <ItemContent className="min-w-0 self-start">
        <ItemTitle>
          <Link
            href={resolveMissionControlHref(tile.route)}
            aria-label={"Open " + tile.title}
            className="inline-flex items-center gap-1 rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {tile.title}
            <ChevronRight
              aria-hidden="true"
              className="size-3.5 shrink-0 text-muted-foreground"
            />
          </Link>
        </ItemTitle>
        <ItemDescription className="line-clamp-none">
          {tile.purpose}
        </ItemDescription>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {insideForRole(tile, role).replaceAll(
            FEATURE_SEPARATOR,
            ATTACHED_FEATURE_SEPARATOR,
          )}
        </p>
      </ItemContent>
      {/* Cards in a grid row share a height; self-end keeps the shortcuts
          on the card's bottom edge, level across the row. */}
      {shortcuts.length > 0 && (
        <ItemActions className="basis-full self-end">
          <div
            role="group"
            aria-label={`${tile.title} shortcuts`}
            className="flex w-full flex-wrap gap-2 border-t pt-2"
          >
            {shortcuts.map((action) => (
              <ButtonLink
                key={action.href}
                variant="ghost"
                size="sm"
                render={
                  <Link href={action.href}>
                    {action.icon && (
                      <DynamicIcon name={action.icon} aria-hidden="true" />
                    )}
                    {action.label}
                  </Link>
                }
              />
            ))}
          </div>
        </ItemActions>
      )}
    </Item>
  );
}
