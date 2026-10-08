import { PageShell } from "@asym/ui/components/shadcn/page-shell";

export default function SupportSettingsLoading() {
  return (
    <PageShell title="Support Settings" description="Loading settings...">
      <div className="h-64 animate-pulse rounded-2xl bg-muted/40 ring-1 ring-border" />
    </PageShell>
  );
}
