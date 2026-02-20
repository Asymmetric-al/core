/**
 * Intentionally keep this segment dynamic while cacheComponents is enabled globally.
 * Remove this override only after /tasks can render without build-time Supabase env access.
 */
export const dynamic = "force-dynamic";

import type { ReactNode } from "react";

export default function TasksLayout({ children }: { children: ReactNode }) {
  return children;
}
