"use client";

import dynamic from "next/dynamic";
import { Footer } from "@/components/public/footer";

const WhereWeWorkMap = dynamic(
  () => import("./map-wrapper").then(mod => mod.WhereWeWorkMap),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[100dvh] bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm font-medium text-zinc-500">Loading map...</p>
        </div>
      </div>
    )
  }
);

export default function WhereWeWorkPage() {
  return (
    <main className="w-full">
      <WhereWeWorkMap />
      <Footer />
    </main>
  );
}
