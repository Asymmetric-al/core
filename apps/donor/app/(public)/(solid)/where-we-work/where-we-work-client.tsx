"use client";

import dynamic from "next/dynamic";

const WhereWeWorkMap = dynamic(
  () => import("./map-wrapper").then((mod) => mod.WhereWeWorkMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-[100dvh] bg-background flex items-center justify-center"
        role="status"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading map…
          </p>
        </div>
      </div>
    ),
  },
);

export function WhereWeWorkContent() {
  return <WhereWeWorkMap />;
}
