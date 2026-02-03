"use client";

import Link from "next/link";
import type { Tile } from "@asym/lib/mission-control/types";
import { PageHeader } from "../patterns/PageHeader";
import { getIcon } from "../icons";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";

interface TilePageProps {
  tile: Tile;
  children?: React.ReactNode;
}

export function TilePage({ tile, children }: TilePageProps) {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={tile.title}
        description={tile.purpose}
        breadcrumbs={[{ label: tile.title }]}
        actions={
          <div className="flex gap-2">
            {tile.quickActions.slice(0, 2).map((action) => {
              const Icon = action.icon ? getIcon(action.icon) : null;
              return (
                <Link key={action.label} href={`/mc${action.href}`}>
                  <Button size="sm">
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        }
      />
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">What this tile owns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tile.inside}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {tile.quickActions.map((action) => {
                const Icon = action.icon ? getIcon(action.icon) : null;
                return (
                  <Link key={action.label} href={`/mc${action.href}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      {action.label}
                    </Button>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
        {children}
      </div>
    </div>
  );
}
