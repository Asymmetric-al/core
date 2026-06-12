"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";

import type { ReactNode } from "react";

interface TabsClientProps {
  storyContent: ReactNode;
  updatesContent: ReactNode;
}

export function TabsClient({ storyContent, updatesContent }: TabsClientProps) {
  return (
    <Tabs defaultValue="story" className="w-full">
      <TabsList
        aria-label="Worker profile sections"
        className="mb-8 flex h-auto items-center justify-start gap-8 rounded-none border-b border-border bg-transparent p-0 text-inherit"
      >
        <TabsTrigger
          value="story"
          className={cn(
            "relative h-auto flex-none rounded-none border-0 bg-transparent px-0 pt-0 pb-3 text-base font-semibold text-muted-foreground shadow-none transition-colors",
            "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:text-foreground",
            "data-active:bg-transparent data-active:text-foreground data-active:shadow-none",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "after:bg-transparent after:transition-colors",
            "data-active:after:bg-foreground",
          )}
        >
          Our Story
        </TabsTrigger>
        <TabsTrigger
          value="updates"
          className={cn(
            "relative h-auto flex-none items-center gap-2 rounded-none border-0 bg-transparent px-0 pt-0 pb-3 text-base font-semibold text-muted-foreground shadow-none transition-colors",
            "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:text-foreground",
            "data-active:bg-transparent data-active:text-foreground data-active:shadow-none",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "after:bg-transparent after:transition-colors",
            "data-active:after:bg-foreground",
          )}
        >
          Field Journal
          <span className="inline-flex h-5 items-center justify-center rounded-full bg-accent px-2 text-xs font-bold text-accent-foreground">
            New
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="story"
        className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {storyContent}
      </TabsContent>

      <TabsContent
        value="updates"
        className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {updatesContent}
      </TabsContent>
    </Tabs>
  );
}
