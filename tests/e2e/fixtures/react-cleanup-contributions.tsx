import * as React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionProvider } from "@asym/lib/motion-provider";
import { TooltipProvider } from "@asym/ui/components/shadcn/tooltip";
import { Button } from "@asym/ui/components/shadcn/button";
import { OPERATION_DEFINITIONS } from "@asym/api/admin/contribution-operations/catalog";
import { ContributionDetailOverlay } from "../../../apps/admin/app/(app)/contributions/contribution-detail-overlay";
import { ContributionOperationShell } from "../../../apps/admin/app/(app)/contributions/operation-shell";
import { Header } from "../../../apps/admin/src/cms-ui/root/Header";
import { Nav } from "../../../apps/admin/src/cms-ui/root/Nav";
const DONATION_ID = "00000000-0000-4000-8000-0000000000aa";
function Fixture() {
  const [surface, setSurface] = React.useState<
    "contributions_hub" | "donor_crm_record"
  >("contributions_hub");
  const [open, setOpen] = React.useState(false),
    [correctionOpen, setCorrectionOpen] = React.useState(false);
  const [refreshes, setRefreshes] = React.useState(0);
  const opener = React.useRef<HTMLElement | null>(null);
  const handleOpen = (source: typeof surface) => {
    opener.current = document.activeElement as HTMLElement;
    setSurface(source);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => opener.current?.focus(), 0);
  };
  return (
    <main className="min-h-dvh bg-background p-4 text-foreground">
      <h1 className="text-xl font-semibold">Core gift operation fixture</h1>
      <p className="text-sm">
        Synthetic data; real gift detail and operation components.
      </p>
      <Header />
      <Nav />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => handleOpen("contributions_hub")}>
          Open Hub gift
        </Button>
        <Button onClick={() => handleOpen("donor_crm_record")}>
          Open CRM gift
        </Button>
        <Button variant="outline" onClick={() => setCorrectionOpen(true)}>
          Correct gift amount
        </Button>
      </div>
      <p role="status" className="mt-4 text-sm">
        Refresh notifications: {refreshes}
      </p>
      <ContributionDetailOverlay
        donationId={open ? DONATION_ID : null}
        sourceSurface={surface}
        onClose={handleClose}
        onActionSuccess={() => setRefreshes((n) => n + 1)}
      />
      <ContributionOperationShell
        open={correctionOpen}
        onClose={() => setCorrectionOpen(false)}
        operation={OPERATION_DEFINITIONS.amount_correction}
        donationId={DONATION_ID}
        sourceSurface={surface}
      />
    </main>
  );
}
const client = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}>
    <MotionProvider>
      <TooltipProvider>
        <Fixture />
      </TooltipProvider>
    </MotionProvider>
  </QueryClientProvider>,
);
