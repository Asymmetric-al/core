import type { ReactNode } from "react";

/**
 * Intentionally keep this segment dynamic while cacheComponents is enabled globally.
 * Remove this override only after /donors can render without build-time Supabase env access.
 */
export const dynamic = "force-dynamic";

export default function DonorsLayout({ children }: { children: ReactNode }) {
  return children;
}
