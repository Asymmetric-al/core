"use client";

import { useState } from "react";
import { useMC } from "@/lib/mission-control/context";
import { TILES } from "@/lib/mission-control/tiles";
import { TileCard } from "./tile-card";
import { QuickActionsRow } from "./quick-actions-row";
import { WorkflowsPanel } from "./workflows-panel";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import { getIcon } from "../icons";
import { Badge } from "@asym/ui/components/shadcn/badge";

export function MissionControlHome() {
  const { role } = useMC();
  const [showAllTools, setShowAllTools] = useState(false);

  const visibleTiles = TILES.filter((tile) => tile.roles.includes(role));
  const allTiles = TILES;

  return (
    <div className="relative isolate min-h-full">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-slate-50 via-white to-transparent" />

      <div className="relative space-y-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Mission Control
            </h1>
            <p className="text-base font-medium text-zinc-500 max-w-2xl">
              Your command center. A curated workspace for your ministry
              operations.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Quick Actions
          </h2>
          <QuickActionsRow />
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-zinc-900">Your Tools</h2>
              <p className="text-sm font-medium text-zinc-500">
                Access your enabled modules and features.
              </p>
            </div>
            <Dialog open={showAllTools} onOpenChange={setShowAllTools}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-500 hover:text-zinc-900"
                >
                  View all tools
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Mission Control Tools</DialogTitle>
                  <DialogDescription>
                    Complete list of all available tools and their access
                    status.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3">
                  {allTiles.map((tile) => {
                    const Icon = getIcon(tile.icon);
                    const hasAccess = tile.roles.includes(role);
                    return (
                      <div
                        key={tile.id}
                        className={`flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 ${
                          hasAccess
                            ? "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
                            : "bg-zinc-50 border-zinc-100 opacity-60"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                            hasAccess
                              ? "bg-zinc-50 border-zinc-100"
                              : "bg-zinc-100 border-transparent"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${hasAccess ? "text-zinc-700" : "text-zinc-400"}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-bold text-zinc-900">
                            {tile.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={`h-5 px-1.5 text-[10px] font-bold uppercase tracking-wider ${
                                hasAccess
                                  ? "bg-zinc-100 text-zinc-900"
                                  : "bg-zinc-100 text-zinc-400"
                              }`}
                            >
                              {hasAccess ? "Available" : "Locked"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleTiles.map((tile) => (
              <TileCard key={tile.id} tile={tile} />
            ))}
          </div>
        </div>

        <WorkflowsPanel />
      </div>
    </div>
  );
}
