import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Email Studio" };

export default function Page() {
  return <PageClient />;
}
