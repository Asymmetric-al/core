import { PageShell } from "@asym/ui/components/shadcn/page-shell";

import { SupportInboxSkeleton } from "@/features/support-hub/components";

export default function SupportHubLoading() {
  return (
    <PageShell
      title="Support Hub"
      description="Donor care inbox: triage, reply, and track every donor email."
    >
      <SupportInboxSkeleton />
    </PageShell>
  );
}
