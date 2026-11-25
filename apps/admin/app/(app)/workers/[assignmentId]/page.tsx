import type { Metadata } from "next";

import { WorkerRecord } from "@/features/mission-control/workers/worker-record";

export const metadata: Metadata = { title: "Worker" };

export default function Page() {
  return <WorkerRecord />;
}
