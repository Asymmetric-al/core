import type { ReactNode } from "react";

/** Force dynamic render so Supabase client is not created at build time (env may be missing). */
export const dynamic = "force-dynamic";

export default function DonorsLayout({ children }: { children: ReactNode }) {
  return children;
}
