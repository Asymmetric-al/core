import { getAuthContext } from "@asym/auth/context";
import { redirect } from "next/navigation";

import PageClient from "./page-client";
import { canAccessEveOperationsWorkspace } from "./workspace-access";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eve Operations",
  description:
    "Observe and control Eve governance state before autonomous operation.",
};

export default async function Page() {
  const auth = await getAuthContext();
  if (!auth.isAuthenticated) {
    redirect("/login?next=%2Fadmin%2Feve");
  }
  if (!canAccessEveOperationsWorkspace(auth)) {
    redirect("/no-access");
  }

  return <PageClient />;
}
