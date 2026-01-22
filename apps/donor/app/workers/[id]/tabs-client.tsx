"use client";

import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@asym/lib/utils";

interface TabsClientProps {
  storyContent: React.ReactNode;
  updatesContent: React.ReactNode;
}

export function TabsClient({ storyContent, updatesContent }: TabsClientProps) {
  return (
    <TabsPrimitive.Root defaultValue="story" className="w-full">
      <TabsPrimitive.List className="flex items-center border-b border-slate-200 mb-8 gap-8">
        <TabsPrimitive.Trigger
          value="story"
          className={cn(
            "relative pb-3 text-base font-semibold text-slate-500 transition-colors",
            "hover:text-slate-700 focus:outline-none focus-visible:text-slate-900",
            "data-[state=active]:text-slate-900",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "after:bg-transparent after:transition-colors",
            "data-[state=active]:after:bg-slate-900",
          )}
        >
          Our Story
        </TabsPrimitive.Trigger>
        <TabsPrimitive.Trigger
          value="updates"
          className={cn(
            "relative pb-3 text-base font-semibold text-slate-500 transition-colors flex items-center gap-2",
            "hover:text-slate-700 focus:outline-none focus-visible:text-slate-900",
            "data-[state=active]:text-slate-900",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "after:bg-transparent after:transition-colors",
            "data-[state=active]:after:bg-slate-900",
          )}
        >
          Field Journal
          <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 h-5 px-2 text-[10px] font-bold">
            New
          </span>
        </TabsPrimitive.Trigger>
      </TabsPrimitive.List>

      <TabsPrimitive.Content
        value="story"
        className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {storyContent}
      </TabsPrimitive.Content>

      <TabsPrimitive.Content
        value="updates"
        className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {updatesContent}
      </TabsPrimitive.Content>
    </TabsPrimitive.Root>
  );
}
