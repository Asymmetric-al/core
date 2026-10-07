import * as React from "react";
import { createRoot } from "react-dom/client";
import { MotionProvider } from "@asym/lib/motion-provider";
import { TooltipProvider } from "@asym/ui/components/shadcn/tooltip";
import { WhereWeWorkMap } from "../../../apps/donor/app/(public)/(solid)/where-we-work/map-wrapper";
createRoot(document.getElementById("root")!).render(
  <MotionProvider>
    <TooltipProvider>
      <main className="bg-background text-foreground">
        <h1 className="text-xl">Map detail keyboard fixture</h1>
        <WhereWeWorkMap />
      </main>
    </TooltipProvider>
  </MotionProvider>,
);
