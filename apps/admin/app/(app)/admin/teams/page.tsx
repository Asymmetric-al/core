import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Members" };

export default function Page() {
  return <PageClient />;
}
