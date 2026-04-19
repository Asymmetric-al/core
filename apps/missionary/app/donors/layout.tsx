import { connection } from "next/server";

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Partners",
  description: "Manage partner profiles, activity, and tags.",
};

/**
 * Keep this segment request-bound while cacheComponents is enabled globally.
 * `dynamic = "force-dynamic"` is not supported with cacheComponents in Next.js 16.
 * Revisit only after /donors can render without build-time Supabase env access.
 */
export default async function DonorsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  return children;
}
