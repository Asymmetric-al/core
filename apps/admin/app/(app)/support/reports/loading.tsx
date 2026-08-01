import { PageShell } from "@asym/ui/components/shadcn/page-shell";

export default function SupportReportsLoading() {
  return (
    <PageShell title="Support Reports" description="Loading report data...">
      <div className="h-64 animate-pulse rounded-2xl bg-zinc-50 ring-1 ring-zinc-100" />
    </PageShell>
  );
}
