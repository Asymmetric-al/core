import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Suspense } from "react";

import PageClient from "./page-client";

function CrmPageFallback() {
  return (
    <PageShell
      title="CRM"
      description="Manage contacts, donors, and partner relationships."
      density="compact"
    >
      <div
        role="status"
        className="flex min-h-[400px] items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground"
      >
        Loading CRM workspace...
      </div>
    </PageShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CrmPageFallback />}>
      <PageClient />
    </Suspense>
  );
}
