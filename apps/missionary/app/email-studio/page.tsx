import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Studio",
  description: "Compose and send transactional email templates.",
};

export default function Page() {
  return <PageClient />;
}
