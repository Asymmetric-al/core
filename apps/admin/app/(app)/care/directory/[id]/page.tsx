import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Member profile" };

export default function Page() {
  return <PageClient />;
}
