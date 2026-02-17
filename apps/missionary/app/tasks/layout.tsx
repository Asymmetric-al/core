/** Force dynamic so build does not require Supabase env when prerendering /tasks. */
export const dynamic = "force-dynamic";

import type { ReactNode } from "react";

export default function TasksLayout({ children }: { children: ReactNode }) {
  return children;
}
