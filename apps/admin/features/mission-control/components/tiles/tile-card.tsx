"use client";
"use no memo";

import { resolveMissionControlHref } from "@asym/lib/mission-control/routes";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
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
    <Card className="group relative flex flex-col overflow-hidden border-border bg-card shadow-sm transition-colors hover:border-ring/30 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <CardHeader className="relative z-10 pointer-events-none">
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
        <CardTitle className="text-lg font-semibold text-foreground">
          {tile.title}
        </CardTitle>
        <CardDescription className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {tile.purpose}
        </CardDescription>
      </CardHeader>
      <CardContent className="pointer-events-none relative z-10 flex flex-1 flex-col gap-4">
        <div className="flex-1">
          <p className="text-xs mb-2 font-medium text-muted-foreground">
            Features
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {tile.inside}
          </p>
        </div>

        {tile.quickActions.length > 0 && (
          <div className="pointer-events-auto mt-auto border-t border-border pt-3">
            <div className="flex flex-wrap gap-2">
              {tile.quickActions.slice(0, 3).map((action) => (
                <Link
                  key={action.label}
                  href={resolveMissionControlHref(action.href)}
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: "w-full justify-start",
                  })}
                >
                  {action.icon && <DynamicIcon name={action.icon} />}
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <Link
        href={resolveMissionControlHref(tile.route)}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none"
        aria-label={`Open ${tile.title}`}
      >
        <span className="sr-only">Open {tile.title}</span>
      </Link>
    </Card>
  );
}
