import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Suspense } from "react";

import WorkflowsPageClient from "./page-client";

import type { Metadata } from "next";

/** The page reads its status filter from the URL, so it streams in. */
function WorkflowsPageFallback() {
  return (
    <PageShell
      title="Workflow runs"
      density="compact"
      description="Background work for gifts, receipts and email. Urgent runs need staff attention."
    >
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </PageShell>
  );
}

export const metadata: Metadata = { title: "Workflow runs" };

export default function Page() {
  return (
    <Suspense fallback={<WorkflowsPageFallback />}>
      <WorkflowsPageClient />
    </Suspense>
  );
}
