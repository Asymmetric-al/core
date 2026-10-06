import * as React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionProvider } from "@asym/lib/motion-provider";
import { TooltipProvider } from "@asym/ui/components/shadcn/tooltip";
import { EveAdminMemoryPanel } from "../../../apps/admin/app/(app)/admin/eve/admin-memory-panel";
const client = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}>
    <MotionProvider>
      <TooltipProvider>
        <main className="p-4 bg-background text-foreground">
          <h1 className="text-xl">Private memory keyboard fixture</h1>
          <EveAdminMemoryPanel />
        </main>
      </TooltipProvider>
    </MotionProvider>
  </QueryClientProvider>,
);
