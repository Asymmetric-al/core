/**
 * Keep this segment request-bound while cacheComponents is enabled globally.
 * `dynamic = "force-dynamic"` is not supported with cacheComponents in Next.js 16.
 */
import { connection } from "next/server";

import type { ReactNode } from "react";

export default async function TasksLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  return children;
}
