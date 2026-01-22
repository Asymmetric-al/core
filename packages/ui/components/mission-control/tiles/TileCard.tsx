"use client";
"use no memo";

import Link from "next/link";
import type { Tile } from "@/lib/mission-control/types";
import { DynamicIcon, ChevronRight } from "../icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Button } from "@asym/ui/components/shadcn/button";

interface TileCardProps {
  tile: Tile;
}

export function TileCard({ tile }: TileCardProps) {
  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/50 hover:border-zinc-300">
      <CardHeader className="relative z-10 p-6 pb-3 pointer-events-none">
        <div className="flex items-start justify-between mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-700 transition-colors group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 group-hover:shadow-md">
            <DynamicIcon name={tile.icon} className="h-6 w-6" />
          </div>
          <Link
            href={`/mc${tile.route}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 opacity-0 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 group-hover:opacity-100 pointer-events-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <CardTitle className="text-lg font-bold text-zinc-900">
          {tile.title}
        </CardTitle>
        <CardDescription className="text-sm font-medium text-zinc-500 line-clamp-2 mt-1.5 leading-relaxed">
          {tile.purpose}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-1 flex-col gap-5 p-6 pt-0 pointer-events-none">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
            Features
          </p>
          <p className="text-sm font-medium text-zinc-600 leading-relaxed">
            {tile.inside}
          </p>
        </div>

        {tile.quickActions.length > 0 && (
          <div className="mt-auto pt-5 border-t border-zinc-50 pointer-events-auto group-hover:border-zinc-100 transition-colors">
            <div className="flex flex-wrap gap-2">
              {tile.quickActions.slice(0, 3).map((action) => (
                <Link
                  key={action.label}
                  href={`/mc${action.href}`}
                  className="w-full"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 text-xs font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 px-2 rounded-xl transition-all"
                  >
                    {action.icon && (
                      <DynamicIcon
                        name={action.icon}
                        className="mr-2 h-3.5 w-3.5"
                      />
                    )}
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <Link
        href={`/mc${tile.route}`}
        className="absolute inset-0 z-0"
        aria-label={`Open ${tile.title}`}
      >
        <span className="sr-only">Open {tile.title}</span>
      </Link>
    </Card>
  );
}
