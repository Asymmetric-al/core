/**
 * Keep this segment request-bound while cacheComponents is enabled globally.
 * `dynamic = "force-dynamic"` is not supported with cacheComponents in Next.js 16.
 * Revisit only after /tasks can render without build-time Supabase env access.
 */
import { connection } from "next/server";

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Track follow-ups and partner tasks.",
};

export default async function TasksLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  return children;
}
