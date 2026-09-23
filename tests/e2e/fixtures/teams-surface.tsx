import { MotionProvider } from "@asym/lib/motion";
import { TooltipProvider } from "@asym/ui/components/shadcn/tooltip";
import * as React from "react";
import { createRoot } from "react-dom/client";

import TeamsPage from "../../../apps/admin/app/(app)/admin/teams/page-client";

createRoot(document.getElementById("root")!).render(
  <MotionProvider>
    <TooltipProvider>
      <main className="min-h-dvh bg-background text-foreground">
        <TeamsPage />
      </main>
    </TooltipProvider>
  </MotionProvider>,
);
