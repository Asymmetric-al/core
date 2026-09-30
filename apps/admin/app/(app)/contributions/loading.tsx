import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

import { ContributionsBoneyardFallback } from "./boneyard-fallback";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10 p-4 sm:p-6 lg:p-8 pb-20">
      {/* Header skeleton — matches PageShell */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <Skeleton className="h-14 w-80" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-24 rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
      </div>

      {/* Stat cards + table skeleton (shared with the Boneyard fallback) */}
      <ContributionsBoneyardFallback />
    </div>
  );
}
