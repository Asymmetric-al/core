import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Suspense } from "react";

import PageClient from "./page-client";
import { CRM_PAGE_META } from "../../components/table-page-meta";

function CrmPageFallback() {
  return (
    <PageShell
      title={CRM_PAGE_META.title}
      description={CRM_PAGE_META.description}
      density={CRM_PAGE_META.density}
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
