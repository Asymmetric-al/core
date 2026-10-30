"use client";
"use no memo";

import { resolveMissionControlHref } from "@asym/lib/mission-control/routes";
import { ButtonLink } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import Link from "next/link";

import { DynamicIcon, ChevronRight } from "../icons";

import type { Tile } from "@asym/lib/mission-control/types";

interface TileCardProps {
  tile: Tile;
}

export function TileCard({ tile }: TileCardProps) {
  return (
    <div className="relative flex flex-col">
      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader>
          <div className="mb-2 flex items-start justify-between">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
              <DynamicIcon name={tile.icon} className="size-5" />
            </div>
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground"
            >
              <ChevronRight className="size-4" />
            </span>
          </div>
          <CardTitle className="text-lg font-semibold">{tile.title}</CardTitle>
          <CardDescription className="mt-1 line-clamp-2 text-sm leading-6">
            {tile.purpose}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <div className="flex-1">
            <p className="text-xs mb-2 font-medium text-muted-foreground">
              Features
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              {tile.inside}
            </p>
          </div>

          {tile.quickActions.length > 0 && (
            <div className="relative z-10 mt-auto border-t border-border pt-3">
              <div className="flex flex-wrap gap-2">
                {tile.quickActions.slice(0, 3).map((action) => (
                  <ButtonLink
                    key={action.label}
                    variant="ghost"
                    size="sm"
                    render={
                      <Link href={resolveMissionControlHref(action.href)} />
                    }
                  >
                    {action.icon && <DynamicIcon name={action.icon} />}
                    {action.label}
                  </ButtonLink>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Link
        href={resolveMissionControlHref(tile.route)}
        className="absolute inset-0 z-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`Open ${tile.title}`}
      >
        <span className="sr-only">Open {tile.title}</span>
      </Link>
    </div>
  );
}
