import { Suspense } from "react";

import type { Metadata } from "next";

import {
  WorkersDirectory,
  WorkersDirectorySkeleton,
} from "@/features/mission-control/workers/workers-directory";

export const metadata: Metadata = { title: "Workers" };

export default function Page() {
  return (
    <Suspense fallback={<WorkersDirectorySkeleton />}>
      <WorkersDirectory />
    </Suspense>
  );
}
