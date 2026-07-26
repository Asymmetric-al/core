import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign document",
  description: "Review and sign a document shared with you.",
};

export default function Page(props: { params: Promise<{ token: string }> }) {
  return <PageClient {...props} />;
}
